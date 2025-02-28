use crate::cache::redis::Redis;
use actix_web::{get, web, HttpResponse, Responder};
use serde_json::json;

#[get("/commands")]
async fn commands(redis: web::Data<Redis>) -> impl Responder {
    let command_keys: Vec<String> = redis.clone().hvals("commands").await.unwrap_or_default();

    HttpResponse::Ok().json(json!({"commands": command_keys}))
}
