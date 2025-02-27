use crate::cache::redis::Redis;
use actix_web::{get,  HttpResponse, Responder};
use lazy_static::lazy_static;
use serde_json::json;

lazy_static! {
    static ref redis:  Redis  = Redis::new();
}

#[get("/get_commands")]
async fn get_commands() -> impl Responder {
    let get_commands = redis.get("commands").unwrap();
    HttpResponse::Ok().json(json!({"commands": get_commands}))
}
