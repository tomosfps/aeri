use crate::anilist::format::format_media_data;
use crate::anilist::queries::{get_query, QUERY_URL};
use crate::cache::redis::Redis;
use crate::client::client::Client;
use crate::global::get_recommend::get_recommendation;
use crate::structs::media::Media;
use crate::structs::recommendation::Recommendation;
use actix_web::{post, web, HttpResponse, Responder};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use rand::Rng;
use reqwest::Response;
use serde::Deserialize;
use serde_json::{json, Value};

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
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

#[post("/recommend")]
async fn recommend(req: web::Json<RecommendRequest>) -> impl Responder {
    if req.media.len() == 0 {
        return HttpResponse::NotFound().json(json!({"error": "No Media Type was included"}));
    }

    let genres:     Vec<String> = req.genres.clone().unwrap_or(vec![]);
    let mut rng:    rand::prelude::ThreadRng = rand::rng();
    let mut client:     Client = Client::new().with_proxy().await.unwrap();
    let json:       Value = json!({"query": get_query("recommendations"), "variables": { "page": 1, "perPage": 50 }});
    let response:   Response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 { return Client::error_response(response).await; }

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

    match redis.get(format!("{}:{}", req.media_type, req.media_id)) {
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

    let mut client:     Client = Client::new().with_proxy().await.unwrap();
    let json:       serde_json::Value = json!({"query": get_query("search"), "variables": {"id": req.media_id, "type": req.media_type.to_uppercase()}});
    logger.debug(&format!("Searching for media with ID: {} and Type: {}", req.media_id, req.media_type), "Media", false, json.clone());
    let response:   Response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 { return Client::error_response(response).await; }

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
