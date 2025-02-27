use crate::cache::redis::Redis;
use actix_web::{get,  HttpResponse, Responder};
use lazy_static::lazy_static;
use serde_json::json;

lazy_static! {
    static ref redis:  Redis  = Redis::new();
}

#[get("/get_commands")]
async fn get_commands() -> impl Responder {
    
    let command_keys = match redis.hgetall("commands").await {
        Ok(commands) => commands,
        Err(_) => vec![]
    };

    HttpResponse::Ok().json(json!({"commands": command_keys}))
}
