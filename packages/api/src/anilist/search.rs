use crate::global::compare_strings::normalize_name;
use serde_json::json;
use serde::Deserialize;
use actix_web::{web, post, HttpResponse, Responder};
use crate::anilist::queries::{get_query, QUERY_URL};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use crate::cache::redis::Redis;
use crate::anilist::format::{format_character_data, format_staff_data, format_studio_data};
use crate::client::client::Client;

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
}

#[derive(Deserialize)]
struct CharacterRequest {
    character_name: String
}

#[derive(Deserialize)]
struct StaffRequest {
    staff_name: String,
    media_type: Option<String>,
}

#[derive(Deserialize)]
struct StudioRequest {
    studio_name: String  
}

#[post("/character")]
pub async fn character_search(req: web::Json<CharacterRequest>) -> impl Responder {
    if req.character_name.is_empty() {
        return HttpResponse::NotFound().json(json!({"error": "No character name was included in the request"}));
    }

    let character_name = normalize_name(&req.character_name);
    let cache_key = format!("character:{}", character_name);
    match redis.get(&cache_key) {
        Ok(data) => {
            let mut character_data: serde_json::Value = serde_json::from_str(&data).unwrap();
            character_data["dataFrom"] = "Cache".into();
            character_data["leftUntilExpire"] = redis.ttl(cache_key).unwrap().into();
            return HttpResponse::Ok().json(character_data);
        },
        Err(_) => {
            logger.debug_single("No character data found in cache", "Character");
        }
    }

    let client = Client::new();
    let json = json!({ "query": get_query("character"), "variables": { "search": req.character_name }});
    let response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }

    let character: serde_json::Value = response.json::<serde_json::Value>().await.unwrap();
    if character["data"]["Character"].is_null() {
        return HttpResponse::BadRequest().json(json!({"error": "No character data was found"}));
    }

    let character: serde_json::Value = format_character_data(character).await;
    let _ = redis.setexp(&cache_key, character.to_string(), 86400).await;
    HttpResponse::Ok().json(character)

}

#[post("/studio")]
pub async fn studio_search(req: web::Json<StudioRequest>) -> impl Responder {
    if req.studio_name.is_empty() {
        return HttpResponse::NotFound().json(json!({"error": "No studio name was included in the request"}));
    }

    let cache_key = format!("studio:{}", req.studio_name);
    match redis.get(&cache_key) {
        Ok(data) => {
            logger.debug_single("Found studio data in cache. Returning cached data", "Studio");
            let mut studio_data: serde_json::Value = serde_json::from_str(&data).unwrap();
            studio_data["dataFrom"] = "Cache".into();
            studio_data["leftUntilExpire"] = redis.ttl(cache_key).unwrap().into();
            return HttpResponse::Ok().json(studio_data);
        },
        Err(_) => {
            logger.debug_single("No studio data found in cache", "Studio");
        }
    }

    let client = Client::new();
    let json = json!({ "query": get_query("studio"), "variables": { "search": req.studio_name }});
    let response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }

    let studio: serde_json::Value = response.json::<serde_json::Value>().await.unwrap();
    if studio["data"]["Page"]["studios"].is_null() {
        return HttpResponse::BadRequest().json(json!({"error": "No studio data was found"}));
    }

    let studio: serde_json::Value = format_studio_data(studio).await;
    let _ = redis.setexp(&cache_key, studio.to_string(), 86400).await; 
    HttpResponse::Ok().json(studio)

}


#[post("/staff")]
pub async fn staff_search(req: web::Json<StaffRequest>) -> impl Responder {
    if req.staff_name.is_empty() {
        return HttpResponse::NotFound().json(json!({"error": "No staff name was included in the request"}));
    }

    let cache_key = format!("staff:{}", req.staff_name);
    match redis.get(&cache_key) {
        Ok(data) => {
            let mut staff_data: serde_json::Value = serde_json::from_str(&data).unwrap();
            staff_data["dataFrom"] = "Cache".into();
            staff_data["leftUntilExpire"] = redis.ttl(cache_key).unwrap().into();
            return HttpResponse::Ok().json(staff_data);
        },
        Err(_) => {
            logger.debug_single("No staff data found in cache", "Staff");
        }
    }

    let json;
    if req.media_type.is_none() {
        json = json!({"query": get_query("staff"),"variables": { "search": req.staff_name,} });
    } else {
        json = json!({"query": get_query("staff"),"variables": { "search": req.staff_name, "mediaType": req.media_type.clone().unwrap()}});
    }

    let client = Client::new();
    let response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }

    let staff: serde_json::Value = response.json::<serde_json::Value>().await.unwrap();
    if staff["data"]["Page"]["staff"].is_null() || staff["data"]["Page"]["staff"].as_array().unwrap().is_empty() {
        return HttpResponse::BadRequest().json(json!({"error": "No staff data was found"}));
    }

    let staff: serde_json::Value = format_staff_data(staff).await;
    let _ = redis.setexp(&cache_key, staff.to_string(), 86400).await;
    HttpResponse::Ok().json(staff)
}