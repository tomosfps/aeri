use reqwest::{Client, Response};
use crate::cache::proxy::{get_random_proxy, remove_proxy};
use serde_json::json;
use serde::Deserialize;
use actix_web::{web, post, HttpResponse, Responder};
use crate::anilist::queries::{get_query, QUERY_URL};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use crate::cache::redis::Redis;
use crate::anilist::washed::{wash_character_data, wash_staff_data, wash_studio_data};

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
}

#[derive(Deserialize)]
struct CharacterRequest {
    character_name: String
}

#[derive(Deserialize)]
struct StaffRequest {
    staff_name: String
}

#[derive(Deserialize)]
struct StudioRequest {
    studio_name: String
}

#[post("/character")]
pub async fn character_search(req: web::Json<CharacterRequest>) -> impl Responder {
    if req.character_name.is_empty() {
        logger.error_single("No Character name was parsed", "Character");
        let bad_json = json!({"error": "No character name was included in the request"});
        return HttpResponse::BadRequest().json(bad_json);
    }

    let get_proxy = get_random_proxy(&redis.get_client()).await.unwrap();
    let proxy = reqwest::Proxy::http(get_proxy.clone()).unwrap();
    let client = Client::builder().proxy(proxy).build().unwrap();
    let staff_query = get_query("character");
    let json = json!({
        "query": staff_query,
        "variables": {
            "search": req.character_name,
        }
    });

    let response: Response = client
        .post(QUERY_URL)
        .json(&json)
        .send()
        .await
        .unwrap();


    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = remove_proxy(&redis.get_client(), get_proxy.as_str()).await;
        }

        let status = response.status();
        let response_text = response.text().await.unwrap();
        logger.error_single(format!("Request returned {} : {:?}", status, response_text).as_str(), "Character");
        let bad_json = json!({"error": "Request returned an error", "errorCode": status.as_u16(), "response": response_text});
        return HttpResponse::BadRequest().json(bad_json);
    }

    let character: serde_json::Value = response.json::<serde_json::Value>().await.unwrap();
    let character: serde_json::Value = wash_character_data(character).await;

    logger.debug_single("Returning character data", "Character");
    HttpResponse::Ok().json(character)

}


#[post("/studio")]
pub async fn studio_search(req: web::Json<StudioRequest>) -> impl Responder {
    if req.studio_name.is_empty() {
        logger.error_single("No Studio name was parsed", "Studio");
        let bad_json = json!({"error": "No studio name was included in the request"});
        return HttpResponse::BadRequest().json(bad_json);
    }

    let get_proxy = get_random_proxy(&redis.get_client()).await.unwrap();
    let proxy = reqwest::Proxy::http(get_proxy.clone()).unwrap();
    let client = Client::builder().proxy(proxy).build().unwrap();
    let staff_query = get_query("studio");
    let json = json!({
        "query": staff_query,
        "variables": {
            "search": req.studio_name,
        }
    });

    let response: Response = client
        .post(QUERY_URL)
        .json(&json)
        .send()
        .await
        .unwrap();


    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = remove_proxy(&redis.get_client(), get_proxy.as_str()).await;
        }

        let status = response.status();
        let response_text = response.text().await.unwrap();
        logger.error_single(format!("Request returned {} : {:?}", status, response_text).as_str(), "Studio");
        let bad_json = json!({"error": "Request returned an error", "errorCode": status.as_u16(), "response": response_text});
        return HttpResponse::BadRequest().json(bad_json);
    }

    let studio: serde_json::Value = response.json::<serde_json::Value>().await.unwrap();
    let studio: serde_json::Value = wash_studio_data(studio).await;

    logger.debug_single("Returning studio data", "Studio");    
    HttpResponse::Ok().json(studio)

}


#[post("/staff")]
pub async fn staff_search(req: web::Json<StaffRequest>) -> impl Responder {
    if req.staff_name.is_empty() {
        logger.error_single("No Staff name was parsed", "Staff");
        let bad_json = json!({"error": "No staff name was included in the request"});
        return HttpResponse::BadRequest().json(bad_json);
    }

    let get_proxy = get_random_proxy(&redis.get_client()).await.unwrap();
    let proxy = reqwest::Proxy::http(get_proxy.clone()).unwrap();
    let client = Client::builder().proxy(proxy).build().unwrap();
    let staff_query = get_query("staff");
    let json = json!({
        "query": staff_query,
        "variables": {
            "search": req.staff_name,
        }
    });

    let response: Response = client
        .post(QUERY_URL)
        .json(&json)
        .send()
        .await
        .unwrap();


    if response.status().as_u16() != 200 {
        if response.status().as_u16() == 403 {
            let _ = remove_proxy(&redis.get_client(), get_proxy.as_str()).await;
        }

        let status = response.status();
        let response_text = response.text().await.unwrap();
        logger.error_single(format!("Request returned {} : {:?}", status, response_text).as_str(), "Staff");
        let bad_json = json!({"error": "Request returned an error", "errorCode": status.as_u16(), "response": response_text});
        return HttpResponse::BadRequest().json(bad_json);
    }

    let staff: serde_json::Value = response.json::<serde_json::Value>().await.unwrap();
    let staff: serde_json::Value = wash_staff_data(staff).await;

    logger.debug_single("Returning staff data", "Staff");
    HttpResponse::Ok().json(staff)
}