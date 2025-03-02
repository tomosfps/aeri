use crate::cache::redis::Redis;
use actix_web::{get, web, HttpResponse, Responder};
use serde_json::json;

#[get("/commands")]
async fn commands(redis: web::Data<Redis>) -> impl Responder {
    let commands: Vec<String> = redis.hvals("commands").await.unwrap_or_default();
    let commands: Vec<serde_json::Value> = commands.iter().map(|command| {
        serde_json::from_str(command).unwrap()
    }).collect();

    HttpResponse::Ok().json(json!(commands))
}
