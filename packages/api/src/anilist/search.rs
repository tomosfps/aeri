use crate::global::compare_strings::normalize_name;
use crate::structs::affinity::Affinity;
use crate::structs::character::Character;
use crate::structs::staff::Staff;
use crate::structs::studio::Studio;
use reqwest::Response;
use serde_json::{json, Value};
use serde::Deserialize;
use actix_web::{web, post, HttpResponse, Responder};
use crate::anilist::queries::{get_query, QUERY_URL};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use crate::cache::redis::Redis;
use crate::anilist::format::{format_character_data, format_staff_data, format_studio_data, format_affinity_data};
use crate::client::client::Client;
use crate::global::pearson_correlation::pearson;
use std::collections::HashMap;

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
}

#[derive(Deserialize)]
struct AffinityRequest {
    username: String,
    other_users: Vec<String>,
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

    let client = Client::new().with_proxy().await.unwrap();
    let json = json!({ "query": get_query("character"), "variables": { "search": req.character_name }});
    let response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }

    let response:       Value      = response.json().await.unwrap();
    let character:      Character  = match serde_json::from_value(response["data"]["Character"].clone()) {
        Ok(character) => character,
        Err(err) => {
            logger.error_single(&format!("Error parsing character: {}", err), "Character");
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse character"}));
        }
    };

    let character: Value = format_character_data(character).await;
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
            let mut studio_data: serde_json::Value = serde_json::from_str(&data).unwrap();
            studio_data["dataFrom"] = "Cache".into();
            studio_data["leftUntilExpire"] = redis.ttl(cache_key).unwrap().into();
            return HttpResponse::Ok().json(studio_data);
        },
        Err(_) => {
            logger.debug_single("No studio data found in cache", "Studio");
        }
    }

    let client = Client::new().with_proxy().await.unwrap();
    let json = json!({ "query": get_query("studio"), "variables": { "search": req.studio_name }});
    let response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }

    let response:       Value       = response.json().await.unwrap();
    let studio:         Studio      = match serde_json::from_value(response["data"]["Studio"].clone()) {
        Ok(studio) => studio,
        Err(err) => {
            logger.error_single(&format!("Error parsing studio: {}", err), "Studio");
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse studio"}));
        }
    };

    let studio: Value = format_studio_data(studio).await;
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

    let client = Client::new().with_proxy().await.unwrap();
    let response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }

    let response:       Value   = response.json().await.unwrap();
    let staff:          Staff   = match serde_json::from_value(response["data"]["Page"]["staff"][0].clone()) {
        Ok(staff) => staff,
        Err(err) => {
            logger.error_single(&format!("Error parsing staff: {}", err), "Staff");
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse staff"}));
        }
    };

    let staff: Value = format_staff_data(staff).await;
    let _ = redis.setexp(&cache_key, staff.to_string(), 86400).await;
    HttpResponse::Ok().json(staff)
}


#[post("/affinity")]
pub async fn fetch_affinity(req: web::Json<AffinityRequest>) -> impl Responder {
    if req.username.is_empty() {
        return HttpResponse::NotFound().json(json!({"error": "No username was included in the request"}));
    }

    if req.other_users.is_empty() {
        return HttpResponse::NotFound().json(json!({"error": "No other users were included in the request"}));
    }

    let client:   Client    = Client::new().with_proxy().await.unwrap();
    let json:     Value     = json!({ "query": get_query("affinity"), "variables": { "userName": req.username, "perChunk": 100, "type": "ANIME" }});
    let response: Response  = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }

    let response: Value = response.json().await.unwrap();
    let affinity: Affinity = match serde_json::from_value(response["data"]["MediaListCollection"].clone()) {
        Ok(affinity) => affinity,
        Err(err) => {
            logger.error_single(&format!("Error parsing affinity: {}", err), "Affinity");
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse affinity"}));
        }
    };
    
    let user_affinity: Value = format_affinity_data(affinity).await;
    let _ = redis.setexp(user_affinity["user"]["name"].to_string(), user_affinity.to_string(), 86400).await;
    let mut user_data = HashMap::<String, Value>::new();

    for user in req.other_users.iter() {
        let json:     Value     = json!({ "query": get_query("affinity"), "variables": { "userName": user, "perChunk": 100, "type": "ANIME" }});
        let response: Response  = client.post(QUERY_URL, &json).await.unwrap();

        if response.status().as_u16() != 200 {
            if response.status().as_u16() == 403 {
                let _ = client.remove_proxy().await;
            }
            return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
        }

        let response: Value = response.json().await.unwrap();
        let affinity: Affinity = match serde_json::from_value(response["data"]["MediaListCollection"].clone()) {
            Ok(affinity) => affinity,
            Err(err) => {
                logger.error_single(&format!("Error parsing affinity: {}", err), "Affinity");
                return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse affinity"}));
            }
        };
        let affinity:   Value = format_affinity_data(affinity).await;
        let scores:     f64 = compare_scores(&user_affinity, &affinity);
        let _ = redis.setexp(affinity["user"]["name"].to_string(), affinity.to_string(), 86400).await;
        user_data.insert(user.clone(), json!({"affinity": scores}));
    }
    HttpResponse::Ok().json(user_data)
}


fn compare_scores(user: &Value, other_user: &Value) -> f64 {
    let mut user_scores:        Vec<f64> = Vec::new();
    let mut other_user_scores:  Vec<f64> = Vec::new();

    for user_entry in user["entries"].as_array().unwrap() {
        if let Some(entry) = user_entry["entries"].as_array() {
            for media in entry.iter() {
                user_scores.push(media["score"].as_f64().unwrap());
            }
        }
    }

    for other_user_entry in other_user["entries"].as_array().unwrap() {
        if let Some(entry) = other_user_entry["entries"].as_array() {
            for media in entry.iter() {
                other_user_scores.push(media["score"].as_f64().unwrap());
            }
        }
    }

    while user_scores.len() < other_user_scores.len() {
        user_scores.push(0.0);
    }

    while other_user_scores.len() < user_scores.len() {
        other_user_scores.push(0.0);
    }

    if !user_scores.is_empty() && !other_user_scores.is_empty() {
        return pearson(&user_scores, &other_user_scores);
    } else {
        return 0.0;
    }
}