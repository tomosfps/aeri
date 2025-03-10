use std::sync::Arc;
use actix_web::{post, web, HttpResponse, Responder};
use rand::seq::SliceRandom;
use rand::Rng;
use serde_json::{json, Value};
use serde::Deserialize;
use crate::client::client::Client;
use crate::global::queries::{get_query, QUERY_URL};
use crate::global::metrics::Metrics;

#[derive(Deserialize)]
struct RecommendRequest {
    media: String,
    genres: Option<Vec<String>>,
}

#[post("/recommend")]
async fn recommend(req: web::Json<RecommendRequest>, metrics: web::Data<Arc<Metrics>>) -> impl Responder {
    if req.media.is_empty() {
        return HttpResponse::NotFound().json(json!({"error": "No Media Type was included"}));
    }

    let mut rng = rand::rng();
    let genres = if let Some(g) = &req.genres {
        if g.len() >= 5 {
            let mut chosen = Vec::new();
            let mut indices: Vec<usize> = (0..g.len()).collect();
            indices.shuffle(&mut rng);
            
            for i in indices.iter().take(3) {
                chosen.push(g[*i].clone());
            }
            chosen
        } else {
            g.clone()
        }
    } else {
        Vec::new()
    };
    
    let mut client = Client::new_proxied(metrics.clone()).await;
    let variables = json!({
        "type": req.media,
        "genres": genres,
        "page": 1,
        "perPage": 50 
    });
    
    let query_json = json!({
        "query": get_query("recommendation"), 
        "variables": variables
    });
    
    let response = match client.post(QUERY_URL, &query_json).await {
        Ok(resp) => resp,
        Err(_) => return HttpResponse::InternalServerError().json(json!({"error": "Failed to connect to AniList"}))
    };
    
    if response.status().as_u16() != 200 {
        return Client::error_response(response).await;
    }
    
    let response_json: Value = match response.json().await {
        Ok(json) => json,
        Err(_) => return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse AniList response"}))
    };
    
    let recommendations = &response_json["data"]["Page"]["media"];
    if !recommendations.is_array() || recommendations.as_array().unwrap().is_empty() {
        if !genres.is_empty() {         
            let fallback_variables = json!({
                "type": req.media,
                "page": 1,
                "perPage": 50
            });
            
            let fallback_json = json!({
                "query": get_query("recommendation"),
                "variables": fallback_variables
            });
            
            let fallback_response = match client.post(QUERY_URL, &fallback_json).await {
                Ok(resp) => resp,
                Err(_) => return HttpResponse::InternalServerError().json(json!({"error": "Failed to get fallback recommendations"}))
            };
            
            if fallback_response.status().as_u16() != 200 {
                return Client::error_response(fallback_response).await;
            }
            
            let fallback_json: Value = match fallback_response.json().await {
                Ok(json) => json,
                Err(_) => return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse fallback response"}))
            };
            
            let fallback_recs = &fallback_json["data"]["Page"]["media"];
            
            if !fallback_recs.is_array() || fallback_recs.as_array().unwrap().is_empty() {
                return HttpResponse::NotFound().json(json!({"error": "No recommendations found"}));
            }
            
            let media_array = recommendations.as_array().unwrap();
            let random_index = rng.random_range(0..media_array.len());
            let media_json = &media_array[random_index];
            HttpResponse::Ok().json(json!({"id": media_json}));
        }
        
        return HttpResponse::NotFound().json(json!({"error": "No recommendations found"}));
    }
    
    let media_array = recommendations.as_array().unwrap();
    let random_index = rng.random_range(0..media_array.len());
    let media_json = &media_array[random_index];
    HttpResponse::Ok().json(media_json)
}