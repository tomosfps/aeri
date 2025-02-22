use crate::cache::redis::Redis;
use crate::client::client::Client;
use crate::global::queries::QUERY_URL;
use crate::structs::shared::DataFrom;
use actix_web::{web, HttpResponse, Responder};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use ::redis::RedisResult;
use reqwest::Response;
use serde::de::DeserializeOwned;
use serde::Serialize;
use serde_json::{json, Value};

pub mod studio;
pub mod staff;
pub mod user;
pub mod user_score;
pub mod relations;
pub mod character;
pub mod media;
pub mod affinity;
pub mod format;

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
}

pub trait Entity<F: DeserializeOwned + Serialize, R>: DeserializeOwned {
    fn entity_name() -> String;

    fn data_index() -> Vec<String> {
        vec!["data".to_string(), Self::entity_name()]
    }

    async fn format(self, request: &R) -> Result<F, HttpResponse>;

    fn cache_key(request: &R) -> String;

    fn cache_time() -> u64 {
        86400
    }

    fn cache_get(request: &R) -> Result<(F, DataFrom), String> {
        match redis.get(Self::cache_key(request)) {
            Ok(data) => {
                let result = serde_json::from_str::<F>(&data).unwrap();
                let ttl = redis.ttl(Self::cache_key(request)).unwrap();
                Ok((result, DataFrom::Cache(ttl)))
            },
            Err(_) => {
                Err("No data found in cache".to_string())
            }
        }
    }

    async fn cache_set(data: &F, request: &R) -> RedisResult<()> {
        let string = serde_json::to_string(data)?;
        redis.setexp(Self::cache_key(request), string, Self::cache_time()).await
    }

    fn query(request: &R) -> Value;

    fn validate_request(request: &R) -> Result<(), String>;

    async fn parse_response(response: Response) -> Result<Self, String> {
        let json: Value = response.json().await.unwrap();

        let mut indexed = &json;
        for key in Self::data_index() {
            if let Ok(index) = key.parse::<usize>() {
                indexed = &indexed[index]
            } else {
                indexed = &indexed[&key]
            }
        }

        match serde_json::from_value(indexed.clone()) {
            Ok(data) => Ok(data),
            Err(e) => Err(e.to_string()),
        }
    }

    async fn route(req: web::Json<R>) -> impl Responder {
        if let Err(e) = Self::validate_request(&req) {
            return HttpResponse::BadRequest().json(json!({"error": e}));
        }

        if let Ok((data, data_from)) = Self::cache_get(&req) {
            return HttpResponse::Ok().json(Self::apply_data_from(data, data_from));
        }

        let mut client = Client::new_proxied().await;
        let response = client.post(QUERY_URL, &Self::query(&req)).await.unwrap();

        if response.status().as_u16() != 200 {
            return Client::error_response(response).await;
        }

        let data = match Self::parse_response(response).await {
            Ok(data) => data,
            Err(e) => return HttpResponse::InternalServerError().json(json!({"error": e})),
        };

        let formatted = match data.format(&req).await {
            Ok(data) => data,
            Err(response) => return response,
        };

        let _ = Self::cache_set(&formatted, &req).await;

        HttpResponse::Ok().json(Self::apply_data_from(formatted, DataFrom::Api))
    }

    fn apply_data_from(data: F, data_from: DataFrom) -> Value {
        let mut value: Value = serde_json::to_value(data).unwrap();

        match data_from {
            DataFrom::Api => {
                value["dataFrom"] = "API".into();
            }
            DataFrom::Cache(expiry) => {
                value["dataFrom"] = "Cache".into();
                value["leftUntilExpire"] = expiry.into();
            }
        }

        value
    }
}
