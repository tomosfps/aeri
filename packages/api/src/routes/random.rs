use crate::client::client::Client;
use crate::global::queries::{get_query, QUERY_URL};
use crate::global::metrics::Metrics;
use actix_web::{post, web, HttpResponse, Responder};
use rand::seq::IndexedRandom;
use serde::Deserialize;
use serde_json::json;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct RandomRequest {
    formats: Vec<String>,
}

#[post("/random")]
async fn random(req: web::Json<RandomRequest>, metrics: web::Data<Arc<Metrics>>) -> impl Responder {
    if req.formats.is_empty() {
        return HttpResponse::BadRequest().json(json!({"error": "No formats were included"}));
    }

    let mut rng = rand::rng();
    let mut client = Client::new_proxied(metrics.clone()).await;

    let variables = json!({
        "formats": req.formats,
        "page": 1,
        "perPage": 50 
    });
    
    let query_json = json!({
        "query": get_query("random"), 
        "variables": variables
    });
    
    let response = match client.post(QUERY_URL, &query_json).await {
        Ok(resp) => resp,
        Err(_) => return HttpResponse::InternalServerError().json(json!({"error": "Failed to connect to AniList"}))
    };
    
    if response.status().as_u16() != 200 {
        return Client::error_response(response).await;
    }
    
    let response_json: serde_json::Value = match response.json().await {
        Ok(json) => json,
        Err(_) => return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse AniList response"}))
    };
    
    let media = &response_json["data"]["Page"]["media"];
    
    if !media.is_array() || media.as_array().unwrap().is_empty() {
        return HttpResponse::NotFound().json(json!({"error": "No media found matching the given formats"}));
    }
    
    let media_array = media.as_array().unwrap();
    let chosen_media = media_array.choose(&mut rng).unwrap();
    
    HttpResponse::Ok().json(json!({
        "id": chosen_media["id"],
        "media_type": chosen_media["type"],
    }))
}