use crate::cache::redis::Redis;
use actix_web::{post, web, HttpResponse, Responder};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use serde::Deserialize;
use serde_json::json;

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
}

#[derive(Deserialize)]
struct UserExpireRequest {
    username: String,
    user_id: String,
}

#[post("/remove-user")]
async fn remove_user(req: web::Json<UserExpireRequest>) -> impl Responder {
    if req.username.is_empty() || req.user_id.is_empty() {
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
        "message": "User data has been expired"
    }))
}
