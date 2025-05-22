use std::sync::Arc;
use crate::entities::Entity;
use crate::structs::shared::URLType;
use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use crate::global::metrics::Metrics;

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum EpisodeValue {
    Number(u32),
    String(String),
    Array(Vec<u32>),
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FindSauce {
    frame_count: u32,
    error: Option<String>,
    result: Vec<FindSauceInformation>,
}

#[derive(Serialize, Deserialize)]
pub struct FindSauceInformation {
    anilist: Option<u32>,
    filename: String,
    episode: Option<EpisodeValue>,
    from: f32,
    to: f32,
    similarity: f64,
    video: String,
    image: String,
}

#[derive(Deserialize)]
pub struct FindSauceRequest {
    pub url:       String,
}

impl Entity<FindSauce, FindSauceRequest> for FindSauce {
    fn entity_name() -> String {
        String::new()
    }

    async fn format(self, _request: &FindSauceRequest, _metrics: web::Data<Arc<Metrics>>) -> Result<FindSauce, HttpResponse> {
        Ok(self)
    }

    fn url_type() -> String {
        URLType::FindSauce.to_string()
    }

    fn url(request: &FindSauceRequest) -> String {
        format!("{}{}", URLType::FindSauce.to_string(), request.url)
    }

    fn cache_key(request: &FindSauceRequest) -> String {
        format!("{}{}", URLType::FindSauce.to_string(), request.url)
    }

    fn query(_request: &FindSauceRequest) -> Value { json!({}) }

    fn validate_request(request: &FindSauceRequest) -> Result<(), String> {
        if request.url.is_empty() {
            return Err("URL is required".to_string());
        }

        Ok(())
    }
}
