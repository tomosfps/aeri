use crate::client::client::Client;
use crate::global::get_recommend::get_recommendation;
use crate::global::queries::{get_query, QUERY_URL};
use crate::structs::recommendation::Recommendation;
use actix_web::{post, web, HttpResponse, Responder};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use rand::Rng;
use reqwest::Response;
use serde::Deserialize;
use serde_json::{json, Value};

lazy_static! {
    static ref logger: Logger = Logger::default();
}

#[derive(Deserialize)]
struct RecommendRequest {
    media:      String,
    genres:     Option<Vec<String>>,
}

#[post("/recommend")]
async fn recommend(req: web::Json<RecommendRequest>) -> impl Responder {
    if req.media.is_empty() {
        return HttpResponse::NotFound().json(json!({"error": "No Media Type was included"}));
    }

    let genres:         Vec<String> = req.genres.clone().unwrap_or_default();
    let genres = if genres.len() >= 5 {
        let mut rng = rand::rng();
        let mut chosen_genres = Vec::new();
        while chosen_genres.len() < 3 {
            let index = rng.random_range(0..genres.len());
            if !chosen_genres.contains(&genres[index]) {
                chosen_genres.push(genres[index].clone());
            }
        }
        chosen_genres
    } else {
        genres
    };

    let mut rng:        rand::prelude::ThreadRng = rand::rng();
    let mut client:     Client = Client::new_proxied().await;
    let json:           Value = json!({"query": get_query("recommendations"), "variables": { "page": 1, "perPage": 50 }});
    let response:       Response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 { return Client::error_response(response).await; }

    let response:       Value              = response.json().await.unwrap();
    let recommendation: Recommendation     = serde_json::from_value(response["data"]["Page"].clone()).unwrap();

    let last_page:      i32 = recommendation.page_info.last_page.unwrap();
    let pages:          i32 = rng.random_range(1..last_page);
    let mut recommend:  Value = get_recommendation(pages, genres.clone(), req.media.clone()).await;

    if recommend["error"].is_string() {
        recommend = get_recommendation(1, genres.clone(), req.media.clone()).await;
    }

    logger.debug_single(&format!("Recommendation for {} found", recommend), "Recommend");
    HttpResponse::Ok().json(json!({"id": recommend}))
}
