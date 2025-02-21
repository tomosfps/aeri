use crate::anilist::format::{format_user_data, format_user_score};
use crate::anilist::queries::{get_query, QUERY_URL};
use crate::cache::redis::Redis;
use crate::client::client::Client;
use crate::structs::user::{User, Viewer};
use crate::structs::user_stats::UserScores;
use actix_web::{post, web, HttpRequest, HttpResponse, Responder};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use serde::Deserialize;
use serde_json::{json, Value};

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
struct UserExpireRequest {
    username: String,
    user_id: String,
}

#[derive(Deserialize)]
struct UserRequest {
    username: String,
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

    let mut client = Client::new().with_proxy().await.unwrap();
    let json = json!({"query": get_query("user_scores"), "variables": {"userId": req.user_id, "mediaId": req.media_id}});
    let response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 { return Client::error_response(response).await; }

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
pub async fn user_search(req: web::Json<UserRequest>) -> impl Responder {
    if req.username.len() == 0 {
        logger.error_single("No username was included", "User");
        return HttpResponse::NotFound().json(json!({"error": "No username was included", "errorCode": 404}));
    }

    match redis.get(req.username.clone()) {
        Ok(data) => {
            let mut user_data: serde_json::Value = serde_json::from_str(data.as_str()).unwrap();
            user_data["dataFrom"] = "Cache".into();
            user_data["leftUntilExpire"] = redis.ttl(req.username.to_string()).unwrap().into();
            return HttpResponse::Ok().json(user_data);
        },
        Err(_) => {
            logger.debug_single(&format!("{} was not found within the cache", req.username), "User");
        }
    }

    let mut client = Client::new().with_proxy().await.unwrap();
    let json = json!({"query": get_query("user"), "variables": {"name": req.username}});
    let response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 { return Client::error_response(response).await; }

    let response:       Value = response.json().await.unwrap();
    let user:           User  = match serde_json::from_value(response["data"]["User"].clone()) {
        Ok(user) => user,
        Err(err) => {
            logger.error_single(&format!("Error parsing user: {}", err), "User");
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse user"}));
        }
    };

    let user: Value = format_user_data(user).await;
    let _ = redis.setexp(req.username.clone(), user.to_string(), 86400).await;
    HttpResponse::Ok().json(user)
}

#[post("/expire-user")]
async fn expire_user(req: web::Json<UserExpireRequest>) -> impl Responder {
    if req.username.len() == 0 || req.user_id.len() == 0 {
        return HttpResponse::BadRequest().json(json!({
            "status": "No username or user_id was included"
        }));
    }

    match redis.expire_user(&req.user_id).await {
        Ok(_) => {
            logger.debug_single(&format!("Expired user data for {}", req.user_id), "Expire User");
        },
        Err(e) => {
            logger.error_single(&format!("Error expiring user data for {}: {}", req.user_id, e), "Expire User");
        }
    }

    match redis.expire_user(&req.username).await {
        Ok(_) => {
            logger.debug_single(&format!("Expired user data for {}", req.username), "Expire User");
        },
        Err(e) => {
            logger.error_single(&format!("Error expiring user data for {}: {}", req.username, e), "Expire User");
        }
    }

    HttpResponse::Ok().json(json!({
        "status": "User data has been expired"
    }))
}

#[post("/viewer")]
async fn current_user(req: HttpRequest) -> impl Responder {
    let auth = req.headers().get("Authorization");

    if auth.is_none() {
        return HttpResponse::Unauthorized().json(json!({
            "error": "No Authorization header was included"
        }));
    }

    let auth = auth.unwrap().to_str().unwrap();

    if auth.len() == 0 {
        return HttpResponse::Unauthorized().json(json!({
            "error": "No Authorization header was included"
        }));
    }

    logger.debug_single(&format!("Auth token: {}", auth), "User");

    let mut client = Client::new().with_proxy().await.unwrap();
    let json = json!({"query": get_query("viewer")});
    let response = client.post_with_auth(QUERY_URL, &json, auth).await.unwrap();

    if response.status().as_u16() != 200 { return Client::error_response(response).await; }

    let response:       Value = response.json().await.unwrap();

    let user:           Viewer  = match serde_json::from_value(response["data"]["Viewer"].clone()) {
        Ok(user) => user,
        Err(err) => {
            logger.error_single(&format!("Error parsing user: {}", err), "User");
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse user"}));
        }
    };

    HttpResponse::Ok().json(user)
}
