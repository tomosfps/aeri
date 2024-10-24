use reqwest::{Client, Response};
use serde::Deserialize;
use serde_json::json;
use actix_web::{web, post, HttpResponse, Responder};
use colourful_logger::Logger as Logger;
use crate::anilist::queries::{get_query, QUERY_URL};
use lazy_static::lazy_static;
use crate::cache::redis::Redis;

lazy_static! {
    static ref logger:  Logger = Logger::new();
    static ref redis:   Redis  = Redis::new();
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

#[post("/relations")]
pub async fn relations_search(req: web::Json<RelationRequest>) -> impl Responder {

    if req.media_name.len() == 0 || req.media_type.len() == 0 {
        logger.error("No media name or type was included", "Relations");
        let bad_json = json!({"error": "No media name or type was included"});
        return HttpResponse::BadRequest().json(bad_json);
    }

    let client: Client = reqwest::Client::new();
    let query:  String = get_query("relation_stats");
    let json:   serde_json::Value = json!({"query": query, "variables": {"search": req.media_name, "type": req.media_type.to_uppercase()}});
    logger.debug(format!("Sending request with relational data : {} / {}", req.media_name, req.media_type).as_str(), "Media");

    let response: Response = client
            .post(QUERY_URL)
            .json(&json)
            .send()
            .await
            .unwrap();

    if response.status().as_u16() != 200 {
        logger.error(format!("Request returned {} when trying to fetch data for {} with type {}", response.status().as_str(), req.media_name, req.media_type).as_str(), "Relations");
        let bad_json = json!({"error": "Request returned an error", "errorCode": response.status().as_u16()});
        return HttpResponse::BadRequest().json(bad_json);
    }
        
    let relations = response.json::<serde_json::Value>().await.unwrap();
    let relations = wash_relation_data(relations).await;
    HttpResponse::Ok().json(relations)
}

#[post("/media")]
pub async fn media_search(req: web::Json<MediaRequest>) -> impl Responder {

    // No need for checking mediaID as it's a required field
    if req.media_type.len() == 0 {
        logger.error("No type was included", "Media");
        let bad_json = json!({"error": "No type was included"});
        return HttpResponse::BadRequest().json(bad_json);
    }

    match redis.get(req.media_id.to_string()) {
        Ok(data) => {
            logger.debug("Found media data in cache. Returning cached data", "Media");
            let mut media_data: serde_json::Value = serde_json::from_str(data.as_str()).unwrap();
            media_data["dataFrom"] = "Cache".into();
            media_data["leftUntilExpire"] = redis.ttl(req.media_id.to_string()).unwrap().into();
            return HttpResponse::Ok().json(media_data);
        },

        Err(_) => {
            logger.debug("No media data found in cache", "Media");
        }
    }

    let client: Client = reqwest::Client::new();
    let query:  String = get_query("search");
    let json:   serde_json::Value = json!({"query": query, "variables": {"id": req.media_id, "type": req.media_type.to_uppercase()}});
    logger.debug(format!("Sending request with media data : {} / {}", req.media_id, req.media_type).as_str(), "Media");

    let response: Response = client
            .post(QUERY_URL)
            .json(&json)
            .send()
            .await
            .unwrap();

    if response.status().as_u16() != 200 {
        logger.error(format!("Request returned {} when trying to fetch data for {} with type {}", response.status().as_str(), req.media_id, req.media_type).as_str(), "Media");
        let bad_json = json!({"error": "Request returned an error", "errorCode": response.status().as_u16()});
        return HttpResponse::BadRequest().json(bad_json);
    }
        
    let media: serde_json::Value = response.json::<serde_json::Value>().await.unwrap();
    let media: serde_json::Value = wash_media_data(media).await;

    let _ = redis.set(media["id"].to_string(), media.clone().to_string());
    if media["airing"].as_array().unwrap().len() > 0 {
        logger.info(&format!("{} is releasing, expiring cache when next episode is aired.", media["romaji"]), "Media");
        let _ = redis.expire(media["id"].to_string(), media["airing"][0]["timeUntilAiring"].as_i64().unwrap());
    } else {
        logger.info(&format!("{} is not releasing, keep data for a week.", media["romaji"]), "Media");
        let _ = redis.expire(media["id"].to_string(), 86400);
    }

    HttpResponse::Ok().json(media)
}

async fn wash_media_data(media_data: serde_json::Value) -> serde_json::Value {
    logger.debug("Washing up media data", "Media");
    let data: &serde_json::Value = &media_data["data"]["Media"];
    let washed_data: serde_json::Value = json!({
        "id"            : data["id"],
        "romaji"        : data["title"]["romaji"],
        "airing"        : data["airingSchedule"]["nodes"],
        "averageScore"  : data["averageScore"],
        "meanScore"     : data["meanScore"],
        "banner"        : data["bannerImage"],
        "cover"         : data["coverImage"],
        "duration"      : data["duration"],
        "episodes"      : data["episodes"],
        "chapters"      : data["chapters"],
        "volumes"       : data["volumes"],
        "format"        : data["format"],
        "genres"        : data["genres"],
        "popularity"    : data["popularity"],
        "favourites"    : data["favourites"],
        "status"        : data["status"],
        "url"           : data["siteUrl"],
        "endDate"       : format!("{}/{}/{}", data["endDate"]["day"], data["endDate"]["month"], data["endDate"]["year"]),
        "startDate"     : format!("{}/{}/{}", data["startDate"]["day"], data["startDate"]["month"], data["startDate"]["year"]),
        "dataFrom"      : "API",
    });

    logger.debug("Data has been washed", "Media");
    washed_data
}


async fn wash_relation_data(relation_data: serde_json::Value) -> serde_json::Value {
    logger.debug("Washing up relational data", "Relations");
    let data: &serde_json::Value = &relation_data["data"]["Page"]["media"];
    let mut relation_list: Vec<serde_json::Value> = Vec::new();

    for rel in data.as_array().unwrap() {
        let washed_relation = json!({
            "id"        : rel["id"],
            "romaji"    : rel["title"]["romaji"],
            "english"   : rel["title"]["english"],
            "native"    : rel["title"]["native"],
            "synonyms"  : rel["synonyms"],
            "type"      : rel["type"],
            "dataFrom"  : "API"
        });
        relation_list.push(washed_relation);
    }

    let data: serde_json::Value = json!({
        "relations": relation_list
    });

    logger.debug("Data has been washed", "Relations");
    data
}