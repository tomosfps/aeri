use serde::Deserialize;
use serde_json::{json, Value};
use actix_web::{web, post, HttpResponse, Responder};
use colourful_logger::Logger;
use crate::anilist::queries::{get_query, QUERY_URL};
use crate::structs::user::User;
use crate::structs::user_stats::UserScores;
use lazy_static::lazy_static;
use crate::cache::redis::Redis;
use crate::anilist::format::{format_user_data, format_user_score};
use crate::client::client::Client;

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
}

#[derive(Deserialize, Debug)]
struct ScoreRequest {
    user_id: i64,
    media_id: i64,
}

#[derive(Deserialize)]
struct UserRequest {
    user_id: String,
}

#[post("/user/score")]
pub async fn user_score(req: web::Json<ScoreRequest>) -> impl Responder {
    let redis_key = req.media_id.to_string() + ":" + req.user_id.to_string().as_str();

    match redis.get(redis_key.clone()) {
        Ok(data) => {
            let mut user_data: serde_json::Value = serde_json::from_str(data.as_str()).unwrap();
            user_data["dataFrom"] = "Cache".into();
            user_data["leftUntilExpire"] = redis.ttl(redis_key.to_string()).unwrap().into();
            return HttpResponse::Ok().json(user_data);
        },
        Err(_) => {
            logger.debug_single(&format!("{} was not found within the cache", redis_key), "User Score");
        }
    }

    let client = Client::new().with_proxy().await.unwrap();
    let json = json!({"query": get_query("user_scores"), "variables": {"userId": req.user_id, "mediaId": req.media_id}});
    let response = client.post(QUERY_URL, &json).await.unwrap();
    
    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }

    let response:       Value = response.json().await.unwrap();
    let user:           UserScores = match serde_json::from_value(response["data"]["MediaList"].clone()) {
        Ok(user) => user,
        Err(err) => {
            logger.error_single(&format!("Error parsing user scores: {}", err), "User Score");
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse user score"}));
        }
    };

    let user: Value = format_user_score(user).await;
    let _ = redis.setexp(redis_key.clone(), user.to_string(), 86400).await;
    HttpResponse::Ok().json(user)
}

#[post("/user")]
pub async fn user_search(username: String) -> impl Responder {
    if username.len() == 0 {
        logger.error_single("No username was included", "User");
        return HttpResponse::NotFound().json(json!({"error": "No username was included", "errorCode": 404}));
    }

    match redis.get(username.clone()) {
        Ok(data) => {
            let mut user_data: serde_json::Value = serde_json::from_str(data.as_str()).unwrap();
            user_data["dataFrom"] = "Cache".into();
            user_data["leftUntilExpire"] = redis.ttl(username.to_string()).unwrap().into();
            return HttpResponse::Ok().json(user_data);
        },
        Err(_) => {
            logger.debug_single(&format!("{} was not found within the cache", username), "User");
        }
    }

    let client = Client::new().with_proxy().await.unwrap();
    let json = json!({"query": get_query("user"), "variables": {"name": username}});
    let response = client.post(QUERY_URL, &json).await.unwrap();
    
    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = client.remove_proxy().await;
        }
        return HttpResponse::BadRequest().json(json!({"error": "Request returned an error", "errorCode": response.status().as_u16()}));
    }

    let response:       Value = response.json().await.unwrap();
    let user:           User  = match serde_json::from_value(response["data"]["User"].clone()) {
        Ok(user) => user,
        Err(err) => {
            logger.error_single(&format!("Error parsing user: {}", err), "User");
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse user"}));
        }
    };
    
    let user: Value = format_user_data(user).await;
    let _ = redis.setexp(username.clone(), user.to_string(), 86400).await;
    HttpResponse::Ok().json(user)
}

#[post("/expire-user")]
async fn expire_user(req: web::Json<UserRequest>) -> impl Responder {
    match redis.expire_user(&req.user_id).await {
        Ok(_) => {
            HttpResponse::Ok().json(json!({
                "status": "success",
                "message": "Removed all user data"
            }))
        },
        Err(e) => {
            HttpResponse::InternalServerError().json(json!({
                "status": "error",
                "message": e.to_string()
            }))
        }
    }
}