use rand::Rng;
use reqwest::Response;
use serde::Deserialize;
use serde_json::{json, Value};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use crate::cache::redis::Redis;
use crate::client::client::Client;
use crate::structs::media::Media;
use crate::structs::recommendation::Recommendation;
use crate::structs::relation::Relations;
use actix_web::{web, post, HttpResponse, Responder};
use crate::anilist::queries::{get_query, QUERY_URL};
use crate::anilist::format::{format_media_data, format_relation_data};

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
}

#[derive(Deserialize)]
struct RelationRequest {
    media_name: String,
    media_type: String,
}

#[derive(Deserialize)]
struct MediaRequest {
    media_id:   i32,
    media_type: String,
}

#[derive(Deserialize)]
struct RecommendRequest {
    media:      String,
    genres:     Option<Vec<String>>,
}

#[post("/relations")]
pub async fn relations_search(req: web::Json<RelationRequest>) -> impl Responder {
    if req.media_name.len() == 0 || req.media_type.len() == 0 {
        return HttpResponse::NotFound().json(json!({"error": "No Media Name or Type was included"}));
    }

    let media_name = req.media_name.clone().to_lowercase();
    match redis.get(media_name.to_string()) {
        Ok(data) => {
            let media_data: serde_json::Value = serde_json::from_str(data.as_str()).unwrap();
            return HttpResponse::Ok().json(json!({"relations": media_data, "dataFrom": "Cache", "leftUntilExpire": redis.ttl(&media_name).unwrap()}));
        },
        Err(_) => {
            logger.debug_single("No data found in cache, fetching from Anilist", "Relations");
        }
    }

    let client:   Client    = Client::new().with_proxy().await.unwrap();
    let json:     Value     = json!({"query": get_query("relation_stats"), "variables": {"search": &media_name, "type": req.media_type.to_uppercase()}});
    let response: Response  = client.post(QUERY_URL, &json).await.unwrap();
    
    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }

    let response:       Value       = response.json().await.unwrap();
    let relations:      Relations   = serde_json::from_value(response["data"]["Page"].clone()).unwrap();
    let relations:      Value       = format_relation_data(media_name.clone(), relations).await;

    logger.debug_single(&format!("Relations for {} found, caching", media_name), "Relations");
    let _ = redis.setexp(media_name, relations.clone().to_string(), 86400).await;
    HttpResponse::Ok().json(json!({"relations": relations, "dataFrom": "API"}))
}

#[post("/recommend")]
async fn recommend(req: web::Json<RecommendRequest>) -> impl Responder {
    if req.media.len() == 0 {
        return HttpResponse::NotFound().json(json!({"error": "No Media Type was included"}));
    }
    
    let genres:     Vec<String> = req.genres.clone().unwrap_or(vec![]);
    let mut rng:    rand::prelude::ThreadRng = rand::rng();
    let client:     Client = Client::new().with_proxy().await.unwrap();
    let json:       Value = json!({"query": get_query("recommendations"), "variables": { "page": 1, "perPage": 50 }});
    let response:   Response = client.post(QUERY_URL, &json).await.unwrap();
    
    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }

    let response:       Value              = response.json().await.unwrap();
    let recommendation: Recommendation     = serde_json::from_value(response["data"]["Page"].clone()).unwrap();

    let last_page:      i32 = recommendation.page_info.last_page.unwrap();
    let pages:          i32 = rng.random_range(1..last_page);
    let mut recommend:  Value = get_recommendation(pages, genres.clone(), req.media.clone()).await;

    if recommend["error"].is_string() {
        recommend = get_recommendation(1, genres.clone(), req.media.clone()).await;
    }

    logger.debug_single(&format!("Recommendation for {} found", recommend), "Recommend");
    HttpResponse::Ok().json(json!({"id": recommend}))
}

#[post("/media")]
pub async fn media_search(req: web::Json<MediaRequest>) -> impl Responder {
    if req.media_type.len() == 0 {
        return HttpResponse::NotFound().json(json!({"error": "No type was included"}));
    }

    match redis.get(req.media_id.to_string()) {
        Ok(data) => {
            let mut media_data: serde_json::Value = serde_json::from_str(data.as_str()).unwrap();
            media_data["dataFrom"] = "Cache".into();
            if let Some(_airing) = media_data["airing"].as_array().and_then(|arr| arr.get(0)) {
                media_data["airing"][0]["timeUntilAiring"] = redis.ttl(req.media_id.to_string()).unwrap().into();
            }
            media_data["leftUntilExpire"] = redis.ttl(req.media_id.to_string()).unwrap().into();
            return HttpResponse::Ok().json(media_data);
        },
        Err(_) => {
            logger.debug_single("No data found in cache, fetching from Anilist", "Media");
        }
    }

    let client:     Client = Client::new().with_proxy().await.unwrap();
    let json:       serde_json::Value = json!({"query": get_query("search"), "variables": {"id": req.media_id, "type": req.media_type.to_uppercase()}});
    let response:   Response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }
    
    let response:       Value = response.json().await.unwrap();
    let media:          Media = match serde_json::from_value(response["data"]["Media"].clone()) {
        Ok(media) => media,
        Err(err) => {
            logger.error_single(&format!("Error parsing media: {}", err), "Media");
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse media"}));
        }
    };
    let media: Value = format_media_data(media).await;

    let _ = redis.set(media["id"].to_string(), media.clone().to_string());
    if let Some(nodes) = media["airing"]["nodes"].as_array() {
        if !nodes.is_empty() {
            logger.debug_single(&format!("{} is releasing, expiring cache when next episode is aired.", media["romaji"]), "Media");
            if let Some(time_until_airing) = nodes[0]["timeUntilAiring"].as_i64() {
                let _ = redis.expire(media["id"].to_string(), time_until_airing);
            } else {
                logger.error_single("Failed to get timeUntilAiring", "Media");
            }
        } else {
            logger.debug_single(&format!("{} is not releasing, keep data for a week.", media["romaji"]), "Media");
            let _ = redis.expire(media["id"].to_string(), 86400);
        }
    } else {
        logger.error_single("Failed to get airing nodes", "Media");
    }
    HttpResponse::Ok().json(media)
}

async fn get_recommendation(pages: i32, genres: Vec<String>, media: String) -> serde_json::Value {
    let mut rng:    rand::prelude::ThreadRng = rand::rng();
    let client:     Client = Client::new().with_proxy().await.unwrap();
    let json:       Value = json!({
        "query": get_query("recommendation"), 
        "variables": {
            "type": media, 
            "genres": genres, 
            "page": pages, 
            "perPage": 50
    }});
    let response: Response = client.post(QUERY_URL, &json).await.unwrap();
    
    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return json!({"error": "Request returned an error", "errorCode": response.status().as_u16()});
    }

    let response:       Value              = response.json().await.unwrap();
    let recommendation: Recommendation     = serde_json::from_value(response["data"]["Page"].clone()).unwrap();

    let mut ids: Vec<i32> = Vec::new();
    for media in recommendation.media.iter() {
        ids.push(media.id);
    }

    if ids.len() == 0 {
        return json!({"error": "No recommendations found"});
    }

    let random_choice = rng.random_range(0..ids.len());
    json!(ids[random_choice])
}