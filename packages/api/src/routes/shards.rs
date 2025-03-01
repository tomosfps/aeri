use crate::cache::redis::Redis;
use actix_web::{get, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Shard {
    #[serde(deserialize_with = "parse_to_i32")]
    id: i32,
    #[serde(deserialize_with = "parse_to_i32")]
    events_per_second: i32,
    status: String,
}

fn parse_to_i32<'de, D>(deserializer: D) -> Result<i32, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let s: String = serde::Deserialize::deserialize(deserializer)?;
    s.parse::<i32>().map_err(serde::de::Error::custom)
}

#[get("/shards")]
async fn shards(redis: web::Data<Redis>) -> impl Responder {
    let shard_statuses = redis.clone().get_shard_statuses().await;
    let shard_statuses: Vec<Shard> = serde_json::from_value(json!(shard_statuses)).unwrap();

    HttpResponse::Ok().json(json!(shard_statuses))
}
