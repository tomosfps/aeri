use std::sync::Arc;
use crate::structs::shared::DataFrom;
use crate::{cache::redis::Redis, entities::Entity};
use crate::global::queries::get_query;
use actix_web::{web, HttpResponse};
use rand::{self, seq::IteratorRandom};
use reqwest::Response;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use crate::global::metrics::Metrics;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Recommend {
    pub id:     i64,
}

#[derive(Deserialize)]
pub struct RecommendRequest {
    media:          String,
    genres:         Vec<String>,
}

impl Entity<Recommend, RecommendRequest> for Recommend {
    fn entity_name() -> String {
        "Page".into()
    }

    fn data_index() -> Vec<String> {
        vec!["data".into(), Self::entity_name()]
    }

    async fn format(self, _request: &RecommendRequest, _metrics: web::Data<Arc<Metrics>>) -> Result<Recommend, HttpResponse> {
        Ok(self)
    }

    fn cache_key(_request: &RecommendRequest) -> String {
        String::new()
    }

    async fn cache_get(_request: &RecommendRequest, _redis: &web::Data<Redis>) -> Option<(Recommend, DataFrom)> {
        None
    }

    async fn cache_set(_data: &Recommend, _request: &RecommendRequest, _redis: &web::Data<Redis>) { }

    fn query(request: &RecommendRequest) -> Value {
        json!({ "query": get_query("recommendation"), "variables": { "type": request.media, "genres": request.genres }})
    }

    fn validate_request(request: &RecommendRequest) -> Result<(), String> {
        if request.media.is_empty() {
            return Err("Media type is required".to_string());
        }

        if request.genres.is_empty() {
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
                return Ok(Recommend{ id });
            }
            
            return Err("Could not parse the selected media".to_string());
        }
        
        Err("Failed to extract media array from response".to_string())
    }
}