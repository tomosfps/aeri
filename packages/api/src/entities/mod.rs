use crate::cache::redis::Redis;
use crate::client::client::Client;
use crate::global::queries::QUERY_URL;
use crate::structs::shared::DataFrom;
use actix_web::{web, HttpRequest, HttpResponse, Responder};
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
pub mod update_entry;

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

    fn auth_required() -> bool {
        false
    }

    fn token(request: &HttpRequest) -> Option<&str> {
        request
            .headers()
            .get("Authorization")
            .and_then(|header| header.to_str().ok())
    }

    fn cache_key(request: &R) -> String;

    fn cache_time() -> u64 {
        86400
    }

    fn cache_get(request: &R) -> Option<(F, DataFrom)> {
        match redis.get(Self::cache_key(request)) {
            Ok(data) => {
                let result = serde_json::from_str::<F>(&data).unwrap();
                let ttl = redis.ttl(Self::cache_key(request)).unwrap();
                Some((result, DataFrom::Cache(ttl)))
            },
            Err(_) => {
                None
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

    async fn route(body: web::Json<R>, request: HttpRequest) -> impl Responder {
        if let Err(e) = Self::validate_request(&body) {
            return HttpResponse::BadRequest().json(json!({"error": e}));
        }

        if let Some((data, data_from)) = Self::cache_get(&body) {
            return HttpResponse::Ok().json(Self::apply_data_from(data, data_from));
        }
        
        let mut client = Client::new_proxied().await;
        
        let response = if Self::auth_required() {
            let token = Self::token(&request);
            
            let token = match token {
                Some(token) => token,
                None => {
                    return HttpResponse::Unauthorized().json(json!({"error": "No token was included in the request"}));
                }
            };
            
            client.post_with_auth(QUERY_URL, &Self::query(&body), token).await.unwrap()
        } else {
            client.post(QUERY_URL, &Self::query(&body)).await.unwrap()
        };

        if response.status().as_u16() != 200 {
            return Client::error_response(response).await;
        }

        let data = match Self::parse_response(response).await {
            Ok(data) => data,
            Err(e) => return HttpResponse::InternalServerError().json(json!({"error": e})),
        };

        let formatted = match data.format(&body).await {
            Ok(data) => data,
            Err(response) => return response,
        };

        let _ = Self::cache_set(&formatted, &body).await;

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
