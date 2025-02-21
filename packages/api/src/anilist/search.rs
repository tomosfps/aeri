use crate::anilist::format::{format_affinity_data, format_main_affinity};
use crate::anilist::queries::{get_query, QUERY_URL};
use crate::cache::redis::Redis;
use crate::client::client::Client;
use crate::global::pearson_correlation::pearson;
use crate::structs::shared::MediaListStatus;
use actix_web::{post, web, HttpResponse, Responder};
use colourful_logger::Logger;
use futures::future::join_all;
use lazy_static::lazy_static;
use reqwest::Response;
use serde::Deserialize;
use serde_json::{json, Value};
use std::collections::HashMap;

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
}


#[post("/affinity")]
pub async fn fetch_affinity(req: web::Json<AffinityRequest>) -> impl Responder {
    if req.username.is_empty() || req.other_users.is_empty() {
        return HttpResponse::NotFound().json(json!({"error": "No username or other users was included in the request"}));
    }

    let cache_key = format!("affinity:{}", req.username.to_lowercase());
    match redis.get(&cache_key) {
        Ok(data) => {
            let mut affinity_data: serde_json::Value = serde_json::from_str(&data).unwrap();
            affinity_data["dataFrom"] = "Cache".into();
            affinity_data["leftUntilExpire"] = redis.ttl(cache_key).unwrap().into();
            return HttpResponse::Ok().json(affinity_data);
        },
        Err(_) => {
            logger.debug_single("No affinity data found in cache", "Affinity");
        }
    }

    let mut client:   Client    = Client::new().with_proxy().await.unwrap();
    let json:     Value     = json!({ "query": get_query("affinity"), "variables": { "userName": req.username, "perChunk": 100, "type": "ANIME" }});
    let response: Response  = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 { return Client::error_response(response).await; }

    let response: Value = response.json().await.unwrap();
    let user_affinity: Affinity = match serde_json::from_value(response["data"]["MediaListCollection"].clone()) {
        Ok(user_affinity) => user_affinity,
        Err(err) => {
            logger.error_single(&format!("Error parsing affinity: {}", err), "Affinity");
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse affinity"}));
        }
    };

    let futures = req.other_users.iter().map(|user| {
        let mut client = client.clone();
        let user_affinity = user_affinity.clone();
        async move {
            let json = json!({ "query": get_query("affinity"), "variables": { "userName": user, "perChunk": 100, "type": "ANIME" }});
            let response = client.post(QUERY_URL, &json).await.unwrap();

            if response.status().as_u16() != 200 {
                return Err(Client::error_response(response).await);
            }

            let response: Value = response.json().await.unwrap();
            let affinity: Affinity = match serde_json::from_value(response["data"]["MediaListCollection"].clone()) {
                Ok(affinity) => affinity,
                Err(err) => {
                    logger.error_single(&format!("Error parsing affinity: {}", err), "Affinity");
                    return Err(HttpResponse::InternalServerError().json(json!({"error": "Failed to parse affinity"})));
                }
            };

            let scores: (f64, i32) = compare_scores(&user_affinity, &affinity);
            let affinity: Value = format_affinity_data(&affinity, &scores.0, &scores.1).await;
            Ok(json!(affinity))
        }
    });

    let results: Vec<Result<Value, HttpResponse>> = join_all(futures).await;
    let mut affinity_data: Vec<Value> = Vec::new();
    for result in results {
        match result {
            Ok(affinity) => affinity_data.push(affinity),
            Err(err) => return err,
        }
    }

    let format_user: Value = format_main_affinity(&user_affinity).await;
    let result:      Value = json!({"comparedAgainst": format_user, "affinity": affinity_data, "dataFrom": "API"});
    let _ = redis.setexp(&cache_key, result.to_string(), 86400).await;
    HttpResponse::Ok().json(result)
}

fn compare_scores(user: &Affinity, other_user: &Affinity) -> (f64, i32) {
    let mut user_scores_map: HashMap<i32, f64> = HashMap::new();
    let mut user_scores = Vec::new();
    let mut other_user_scores = Vec::new();

    let binding = Vec::new();
    let user_entries = user.lists.as_ref().unwrap_or(&binding).iter();
    let other_user_entries = other_user.lists.as_ref().unwrap_or(&binding).iter();

    for user_entry in user_entries {
        for media in &user_entry.entries {
            if !matches!(media.status.as_ref().unwrap_or(&MediaListStatus::Completed).as_str(), "PLANNING" | "DROPPED" | "PAUSED") {
                user_scores_map.insert(media.media_id, media.score.unwrap_or(0) as f64);
            }
        }
    }

    for other_user_entry in other_user_entries {
        for media in &other_user_entry.entries {
            if let Some(&user_score) = user_scores_map.get(&media.media_id) {
                user_scores.push(user_score);
                other_user_scores.push(media.score.unwrap_or(0) as f64);
            }
        }
    }

    if !user_scores.is_empty() && !other_user_scores.is_empty() {
        (pearson(&user_scores, &other_user_scores), user_scores.len() as i32)
    } else {
        (0.0, 0)
    }
}
