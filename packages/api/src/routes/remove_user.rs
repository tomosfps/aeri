use crate::cache::redis::Redis;
use actix_web::{post, web, HttpResponse, Responder};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use serde::Deserialize;
use serde_json::json;

lazy_static! {
    static ref logger: Logger = Logger::default();
}

#[derive(Deserialize)]
struct UserExpireRequest {
    username: String,
    user_id: String,
}

#[post("/remove-user")]
async fn remove_user(req: web::Json<UserExpireRequest>, redis: web::Data<Redis>) -> impl Responder {
    if req.username.is_empty() || req.user_id.is_empty() {
        return HttpResponse::BadRequest().json(json!({
            "status": "No username or user_id was included"
        }));
    }

    redis.expire_user(&req.user_id, &req.username).await;

    HttpResponse::Ok().json(json!({
        "message": "User data has been expired"
    }))
}
