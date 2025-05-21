use crate::cache::redis::Redis;
use actix_web::{get, web, HttpResponse, Responder};
use serde_json::json;

#[get("/statistics")]
async fn statistics(redis: web::Data<Redis>) -> impl Responder {
    let statistics: Vec<String> = redis.hvals("statistics").await.unwrap_or_default();
    let statistics: Vec<serde_json::Value> = statistics.iter().map(|stat| {
        serde_json::from_str(stat).unwrap()
    }).collect();

    HttpResponse::Ok().json(json!(statistics))
}
