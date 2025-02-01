use reqwest::{Client, Response};
use serde::Deserialize;
use serde_json::json;
use actix_web::{web, post, HttpResponse, Responder};
use colourful_logger::Logger;
use crate::anilist::queries::{get_query, QUERY_URL};
use lazy_static::lazy_static;
use crate::cache::redis::Redis;
use crate::cache::proxy::{get_random_proxy, remove_proxy};

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
}

#[derive(Deserialize, Debug)]
struct ScoreRequest {
    user_id: i64,
    media_id: i64,
}

#[derive(Deserialize)]
struct UserRequest {
    user_id: String,
}

#[post("/user/score")]
pub async fn user_score(req: web::Json<ScoreRequest>) -> impl Responder {
    let redis_key = req.media_id.to_string() + ":" + req.user_id.to_string().as_str();

    match redis.get(redis_key.clone()) {
        Ok(data) => {
            logger.debug_single(&format!("Found data for {}, returning data for ID : {}", req.user_id, req.media_id), "User Score");
            let mut user_data: serde_json::Value = serde_json::from_str(data.as_str()).unwrap();
            user_data["dataFrom"] = "Cache".into();
            user_data["leftUntilExpire"] = redis.ttl(redis_key.to_string()).unwrap().into();
            return HttpResponse::Ok().json(user_data);
        },
        Err(_) => {
            logger.debug_single(&format!("{} was not found within the cache", redis_key), "User Score");
        }
    }

    let get_proxy = get_random_proxy(&redis.get_client()).await.unwrap();
    let proxy = reqwest::Proxy::http(get_proxy.clone()).unwrap();
    let client = Client::builder().proxy(proxy).build().unwrap();
    let user_query = get_query("user_stats");
    let json = json!({"query": user_query, "variables": {"userId": req.user_id, "mediaId": req.media_id}});
    logger.debug_single(format!("Sending request to client with JSON query").as_str(), "User Score");

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

        logger.error_single(format!("Request returned {} when trying to fetch {}", response.status().as_str(), req.user_id).as_str(), "User Score");
        let bad_json = json!({"error": "Request returned an error", "errorCode": response.status().as_u16()});
        return HttpResponse::BadRequest().json(bad_json);
    }

    let user = response.json::<serde_json::Value>().await.unwrap();
    logger.debug("Washing up user score data", "User Score", false, user.clone());

    let user = wash_user_score(user).await;

    redis.set(redis_key.clone(), user.to_string()).unwrap();
    redis.expire(redis_key, 86400).unwrap();

    logger.debug_single(format!("Returning JSON data for user ID: {}", req.user_id).as_str(), "User Score");
    HttpResponse::Ok().json(user)
}

#[post("/user")]
pub async fn user_search(username: String) -> impl Responder {

    if username.len() == 0 {
        logger.error_single("No username was included", "User");
        let bad_json = json!({"error": "No username was included"});
        return HttpResponse::BadRequest().json(bad_json);
    }

    match redis.get(username.clone()) {
        Ok(data) => {
            logger.debug_single(&format!("Found {} data in cache. Returning cached data", username), "User");
            let mut user_data: serde_json::Value = serde_json::from_str(data.as_str()).unwrap();
            user_data["dataFrom"] = "Cache".into();
            user_data["leftUntilExpire"] = redis.ttl(username.to_string()).unwrap().into();
            return HttpResponse::Ok().json(user_data);
        },
        Err(_) => {
            logger.debug_single(&format!("{} was not found within the cache", username), "User");
        }
    }

    let get_proxy = get_random_proxy(&redis.get_client()).await.unwrap();
    let proxy = reqwest::Proxy::http(get_proxy.clone()).unwrap();
    let client = Client::builder().proxy(proxy).build().unwrap();
    let user_query = get_query("user");
    let json = json!({"query": user_query, "variables": {"name": username}});
    logger.debug_single(format!("Sending request to client with JSON query").as_str(), "User");

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
        
        logger.error_single(format!("Request returned {} when trying to fetch {}", response.status().as_str(), username).as_str(), "User");
        let bad_json = json!({"error": "Request returned an error", "errorCode": response.status().as_u16()});
        return HttpResponse::BadRequest().json(bad_json);
    }

    let user = response.json::<serde_json::Value>().await.unwrap();
    logger.debug("Washing up user score data", "User Score", false, user.clone());
    let user = wash_user_data(user).await;

    redis.set(username.clone(), user.to_string()).unwrap();
    redis.expire(username.clone(), 86400).unwrap();

    logger.debug_single(format!("Returning JSON data for user: {}", username).as_str(), "User");
    HttpResponse::Ok().json(user)
}

#[post("/expire-user")]
async fn expire(req: web::Json<UserRequest>) -> impl Responder {
    
    match redis.expire_user(&req.user_id).await {
        Ok(_) => {
            HttpResponse::Ok().json(json!({
                "status": "success",
                "message": "Removed all user data"
            }))
        },
        Err(e) => {
            HttpResponse::InternalServerError().json(json!({
                "status": "error",
                "message": e.to_string()
            }))
        }
    }
}

async fn wash_user_score(json_data: serde_json::Value) -> serde_json::Value {
    logger.debug_single("Washing up score data", "User Score");
    let data = &json_data["data"]["MediaList"];
    let washed_data = json!({
        "progress"      : data["progress"],
        "volumes"       : data["progressVolumes"].as_str().unwrap_or("0"),
        "score"         : data["score"],
        "status"        : data["status"],
        "repeat"        : data["repeat"],
        "user"          : data["user"]["name"],
        "dataFrom"      : "API"
    });

    logger.debug("Data has been washed", "User", false, washed_data.clone());
    washed_data
}

async fn wash_user_data(json_data: serde_json::Value) -> serde_json::Value {
    logger.debug_single("Washing up data", "User");
    let data = &json_data["data"]["User"];

    let mut anime_genres = data["statistics"]["anime"]["genres"]
        .as_array()
        .unwrap()
        .clone();
    anime_genres.sort_by(|a, b| b["count"].as_i64().unwrap().cmp(&a["count"].as_i64().unwrap()));

    let mut manga_genres = data["statistics"]["manga"]["genres"]
        .as_array()
        .unwrap()
        .clone();
    manga_genres.sort_by(|a, b| b["count"].as_i64().unwrap().cmp(&a["count"].as_i64().unwrap()));
    
    let anime_genres: Vec<serde_json::Value> = anime_genres
        .iter()
        .map(|genre| {
            json!({
                "genre": genre["genre"].as_str().unwrap(),
                "count": genre["count"].as_i64().unwrap()
            })
        })
        .collect();

    let manga_genres: Vec<serde_json::Value> = manga_genres
        .iter()
        .map(|genre| {
            json!({
                "genre": genre["genre"].as_str().unwrap(),
                "count": genre["count"].as_i64().unwrap()
            })
        })
        .collect();

    let mut combined_genres_map = std::collections::HashMap::new();

    for genre in anime_genres.iter().chain(manga_genres.iter()) {
        let entry = combined_genres_map.entry(genre["genre"].as_str().unwrap()).or_insert(0);
        *entry += genre["count"].as_i64().unwrap();
    }

    let mut combined_genres: Vec<_> = combined_genres_map.into_iter().collect();
    combined_genres.sort_by(|a, b| b.1.cmp(&a.1));
    let top_genre = combined_genres.first().map(|(genre, _)| *genre).unwrap_or("Unknown");

    let favourite_format = data["statistics"]["anime"]["formats"]
        .as_array()
        .unwrap()
        .iter()
        .map(|format| {
            let format_str = format["format"].as_str().unwrap();
            let capitalized_format = if format_str.len() > 3 {
                format_str.chars().enumerate().map(|(i, c)| if i == 0 { c.to_uppercase().to_string() } else { c.to_string() }).collect::<String>()
            } else {
                format_str.to_string()
            };
            (capitalized_format, format["count"].as_i64().unwrap())
        })
        .max_by_key(|&(_, count)| count)
        .map(|(format, _)| format)
        .unwrap_or(String::from("Unknown"));

    let completed_entries = data["statistics"]["anime"]["statuses"]
        .as_array()
        .unwrap()
        .iter()
        .find(|status| status["status"] == "COMPLETED")
        .map_or(0, |status| status["count"].as_i64().unwrap_or(0));

    let added_up_entries = data["statistics"]["anime"]["statuses"]
        .as_array()
        .unwrap()
        .iter()
        .map(|status| status["count"].as_i64().unwrap_or(0))
        .sum::<i64>();

    let completion_percentage = if added_up_entries > 0 {
        ((completed_entries as f64 / added_up_entries as f64) * 100.0).ceil() as i64
    } else {
        0
    };

    let users: serde_json::Value = json!({
        "id"                    : data["id"],
        "name"                  : data["name"],
        "avatar"                : Some(data["avatar"]["large"].clone()),
        "banner"                : Some(data["bannerImage"].clone()),
        "about"                 : data["about"],
        "url"                   : data["siteUrl"],
        "animeStats": {
            "count"             : data["statistics"]["anime"]["count"],
            "watched"           : data["statistics"]["anime"]["episodesWatched"],
            "minutes"           : data["statistics"]["anime"]["minutesWatched"],
            "meanScore"         : data["statistics"]["anime"]["meanScore"],
            "genres"            : data["statistics"]["anime"]["genres"],
            "scores"            : data["statistics"]["anime"]["scores"],
            "formats"           : data["statistics"]["anime"]["formats"],
            "status"            : data["statistics"]["anime"]["statuses"],
            "sortedGenres"      : anime_genres,
        },
        "mangaStats": {
            "count"             : data["statistics"]["manga"]["count"],
            "chapters"          : data["statistics"]["manga"]["chaptersRead"],
            "volumes"           : data["statistics"]["manga"]["volumesRead"],
            "meanScore"         : data["statistics"]["manga"]["meanScore"],
            "deviation"         : data["statistics"]["manga"]["standardDeviation"],
            "genres"            : data["statistics"]["manga"]["genres"],
            "scores"            : data["statistics"]["manga"]["scores"],
            "sortedGenres"      : manga_genres,
        },
        "totalEntries"          : data["statistics"]["manga"]["count"].as_i64().unwrap_or(0) + data["statistics"]["anime"]["count"].as_i64().unwrap_or(0),
        "topGenre"              : top_genre,
        "favouriteFormat"       : favourite_format,
        "completionPercentage"  : completion_percentage,
        "lastUpdated"           : data["updatedAt"],
        "dataFrom"              : "API"
    });
    
    logger.debug("Data has been washed", "User", false, users.clone());
    users
}