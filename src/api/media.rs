use reqwest::Response;
use serde::Deserialize;
use serde_json::json;
use actix_web::{web, post, HttpResponse, Responder};
use colourful_logger::Logger as Logger;
use crate::api::queries::{get_query, QUERY_URL};
use lazy_static::lazy_static;

lazy_static! {
    static ref logger: Logger = Logger::new();
}

#[derive(Deserialize)]
struct MediaRequest {
    media_name: String,
    media_type: String,
}

#[post("/relations")]
pub async fn relations_search(req: web::Json<MediaRequest>) -> impl Responder {
    let client = reqwest::Client::new();
    let query = get_query("relation_stats");
    let json = json!({"query": query, "variables": {"search": req.media_name, "type": req.media_type.to_uppercase()}});

    logger.debug(format!("Sending request with relational data : {} / {}", req.media_name, req.media_type).as_str(), "Media");

    let response: Response = client
            .post(QUERY_URL)
            .json(&json)
            .send()
            .await
            .unwrap();

    if response.status().as_u16() != 200 {
        logger.error(format!("Request returned {} when trying to fetch data for {} with type {}", response.status().as_str(), req.media_name, req.media_type).as_str(), "Relations");
        return HttpResponse::BadRequest().finish();
    }
        
    let relations = response.json::<serde_json::Value>().await.unwrap();
    let relations = wash_relation_data(relations).await;
    HttpResponse::Ok().json(relations)
}


#[post("/media")]
pub async fn media_search(req: web::Json<MediaRequest>) -> impl Responder {
    let client = reqwest::Client::new();
    let query = get_query("search");
    let json = json!({"query": query, "variables": {"search": req.media_name, "type": req.media_type.to_uppercase()}});
    logger.debug(format!("Sending request with media data : {} / {}", req.media_name, req.media_type).as_str(), "Media");

    let response: Response = client
            .post(QUERY_URL)
            .json(&json)
            .send()
            .await
            .unwrap();

    if response.status().as_u16() != 200 {
        logger.error(format!("Request returned {} when trying to fetch data for {} with type {}", response.status().as_str(), req.media_name, req.media_type).as_str(), "Media");
        return HttpResponse::BadRequest().finish();
    }
        
    let media = response.json::<serde_json::Value>().await.unwrap();

    let media = wash_media_data(media).await;
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
        "banner"        : data["bannerImage"].as_str().unwrap_or("null"),
        "cover"         : data["coverImage"]["extraLarge"].as_str().unwrap_or("null"),
        "duration"      : data["duration"],
        "episodes"      : data["episodes"],
        "chapters"      : data["chapters"],
        "volumes"       : data["volumes"],
        "format"        : data["format"],
        "genres"        : data["genres"],
        "popularity"    : data["popularity"],
        "status"        : data["status"],
        "url"           : data["siteUrl"],
        "endDate"       : format!("{}/{}/{}", data["endDate"]["day"].as_str().unwrap_or("0"), data["endDate"]["month"].as_str().unwrap_or("0"), data["endDate"]["year"].as_str().unwrap_or("0")),
        "startDate"     : format!("{}/{}/{}", data["endDate"]["day"].as_str().unwrap_or("0"), data["endDate"]["month"].as_str().unwrap_or("0"), data["endDate"]["year"].as_str().unwrap_or("0")),
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
        });
        relation_list.push(washed_relation);
    }

    let data: serde_json::Value = json!({
        "relations": relation_list
    });

    logger.debug("Data has been washed", "Relations");

    data
}