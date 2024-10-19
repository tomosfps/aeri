use reqwest::Response;
use serde_json::json;
use actix_web::{post, HttpResponse, Responder};
use colourful_logger::Logger as Logger;
use crate::api::queries::{get_query, QUERY_URL};
use lazy_static::lazy_static;

lazy_static! {
    static ref logger: Logger = Logger::new();
}


#[post("/user")]
pub async fn user(username: String) -> impl Responder {
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

    let user = response.json::<serde_json::Value>().await.unwrap();
    let user = wash_data(user).await;

    logger.debug(format!("Returning JSON data for user: {}", username).as_str(), "User");
    HttpResponse::Ok().json(user)
}

async fn wash_data(json_data: serde_json::Value) -> serde_json::Value {
    logger.debug("Washing up data", "User");
    let data = &json_data["data"]["User"];
    let users: serde_json::Value = json!({
        "id"        : data["id"],
        "name"      : data["name"],
        "avatar"    : data["avatar"]["large"].as_str().unwrap_or("https://s4.anilist.co/file/anilistcdn/user/avatar/large/default.png"),
        "banner"    : data["bannerImage"].as_str().unwrap_or("null"),
        "about"     : data["about"],
        "url"       : data["siteUrl"],
        "animeStats": {
            "count"     : data["statistics"]["anime"]["count"],
            "watched"   : data["statistics"]["anime"]["episodesWatched"],
            "minutes"   : data["statistics"]["anime"]["minutesWatched"],
            "meanScore" : data["statistics"]["anime"]["meanScore"],
            "genres"    : data["favourites"]["anime"]["genres"],
            "scores"    : data["favourites"]["anime"]["scores"]
        },
        "mangaStats": {
            "count"     : data["statistics"]["manga"]["count"],
            "read"      : data["statistics"]["manga"]["chaptersRead"],
            "volumes"   : data["statistics"]["manga"]["volumesRead"],
            "meanScore" : data["statistics"]["manga"]["meanScore"],
            "deviation" : data["statistics"]["manga"]["standardDeviation"],
            "genres"    : data["favourites"]["manga"]["genres"],
            "scores"    : data["favourites"]["manga"]["scores"]
        },
        "lastUpdated"   : data["updatedAt"]
    });
    
    logger.debug("Data has been washed", "User");

    users
}