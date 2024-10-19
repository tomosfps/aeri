use reqwest::Response;
use serde_json::json;
use actix_web::{post, HttpResponse, Responder};
use colourful_logger::Logger as Logger;
use crate::api::queries::{get_query, QUERY_URL};

#[post("/user")]
pub async fn user(username: String) -> impl Responder {
    let logger = Logger::new();
    let client = reqwest::Client::new();
    let user_query = get_query("user");
    let json = json!({"query": user_query, "variables": {"name": username}});
    
    logger.debug(format!("Sending request to client with JSON query").as_str(), "User");

    let response: Response = client
                        .post(QUERY_URL)
                        .json(&json)
                        .send()
                        .await
                        .unwrap();
    
    if response.status().as_u16() != 200 {
        logger.error(format!("Request returned {} when trying to fetch {}", response.status().as_str(), username).as_str(), "User");
        return HttpResponse::BadRequest().finish();
    }

    logger.debug(format!("Returning JSON data for user: {}", username).as_str(), "User");
    let user = response.json::<serde_json::Value>().await.unwrap();
    HttpResponse::Ok().json(user)
}