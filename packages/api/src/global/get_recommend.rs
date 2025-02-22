use crate::client::client::Client;
use crate::global::queries::{get_query, QUERY_URL};
use crate::structs::recommendation::Recommendation;
use rand::Rng;
use reqwest::Response;
use serde_json::{json, Value};

pub async fn get_recommendation(pages: i32, genres: Vec<String>, media: String) -> Value {
    let mut rng:        rand::prelude::ThreadRng = rand::rng();
    let mut client:     Client = Client::new().with_proxy().await.unwrap();
    let json:           Value = json!({
        "query": get_query("recommendation"),
        "variables": {
            "type": media,
            "genres": genres,
            "page": pages,
            "perPage": 50
    }});
    let response: Response = client.post(QUERY_URL, &json).await.unwrap();

    if response.status().as_u16() != 200 {
        return json!({"error": "Request returned an error", "errorCode": response.status().as_u16()});
    }

    let response:       Value              = response.json().await.unwrap();
    let recommendation: Recommendation     = serde_json::from_value(response["data"]["Page"].clone()).unwrap();

    let mut ids: Vec<i32> = Vec::new();
    for media in recommendation.media.iter() {
        ids.push(media.id);
    }

    if ids.is_empty() {
        return json!({"error": "No recommendations found"});
    }

    let random_choice = rng.random_range(0..ids.len());
    json!(ids[random_choice])
}
