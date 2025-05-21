use std::str::FromStr;
use std::sync::Arc;
use crate::structs::shared::{Type, DataFrom};
use crate::{cache::redis::Redis, entities::Entity};
use crate::global::queries::get_query;
use actix_web::{web, HttpResponse};
use rand::{self, seq::IteratorRandom};
use reqwest::Response;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use crate::global::metrics::Metrics;

#[derive(Serialize, Deserialize)]
pub struct Random {
    pub id:         i64,
    pub media_type: Type,
}

#[derive(Deserialize)]
pub struct RandomRequest {
    formats: Vec<String>,
}

impl Entity<Random, RandomRequest> for Random {
    fn entity_name() -> String {
        "Page".into()
    }

    fn data_index() -> Vec<String> {
        vec!["data".into(), Self::entity_name()]
    }

    async fn format(self, _request: &RandomRequest, _metrics: web::Data<Arc<Metrics>>) -> Result<Random, HttpResponse> {
        Ok(self)
    }

    fn cache_key(_request: &RandomRequest) -> String {
        String::new()
    }

    async fn cache_get(_request: &RandomRequest, _redis: &web::Data<Redis>) -> Option<(Random, DataFrom)> {
        None
    }

    async fn cache_set(_data: &Random, _request: &RandomRequest, _redis: &web::Data<Redis>) { }

    fn query(request: &RandomRequest) -> Value {
        json!({ "query": get_query("random"), "variables": { "formats": request.formats }})
    }

    fn validate_request(request: &RandomRequest) -> Result<(), String> {
        if request.formats.is_empty() {
            return Err("Genres cannot be empty".to_string());
        }

        Ok(())
    }

    async fn parse_response(response: Response) -> Result<Self, String> {
        let json: Value = response.json().await.unwrap();
        
        if let Some(media_array) = json["data"]["Page"]["media"].as_array() {
            if media_array.is_empty() {
                return Err("No media found for the given genres".to_string());
            }
            
            let mut rng = rand::rng();
            if let Some(chosen_media) = media_array.iter().choose(&mut rng) {
                let id = chosen_media["id"].as_i64().unwrap_or(0);
                let media_type = Type::from_str(chosen_media["type"].as_str().unwrap())
                    .map_err(|_| "Failed to parse media type".to_string())?;
                return Ok(Random{ id, media_type });
            }
            return Err("Could not parse the selected media".to_string());
        }
        
        Err("Failed to extract media array from response".to_string())
    }
}