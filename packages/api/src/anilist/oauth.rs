use std::env;
use actix_web::{get, web, HttpResponse, Responder};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use crate::cache::redis::Redis;
use crate::client::client::Client;

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis: Redis = Redis::new();
    static ref client: Client = Client::new();
}

#[derive(Deserialize)]
struct OauthParams {
    code: String,
    state: String,
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
}

#[derive(Serialize)]
enum TokenTypes {
    Anilist,
}

#[derive(Serialize)]
struct TokenData {
    r#type: TokenTypes,
    user_id: String,
    guild_id: String,
    access_token: String,
}

#[get("/oauth/anilist")]
pub async fn anilist_oauth(params: web::Query<OauthParams>) -> impl Responder {
    let json: Value = json!({
        "grant_type": "authorization_code",
        "client_id": env::var("ANILIST_CLIENT_ID").unwrap(),
        "client_secret": env::var("ANILIST_CLIENT_SECRET").unwrap(),
        "redirect_uri": env::var("ANILIST_REDIRECT_URL").unwrap(),
        "code": params.code,
    });

    let response = client.post("https://anilist.co/api/v2/oauth/token", &json).await.unwrap();

    if response.status().as_u16() != 200 {
        return HttpResponse::BadRequest().json(json!({
            "error": "Request returned an error",
            "errorCode": response.status().as_u16(),
            "errorMessage": response.text().await.unwrap()
        }));
    }

    let params: Vec<&str> = params.state.split("_").collect();

    let response_json = response.json::<TokenResponse>().await.unwrap();
    let token_data = TokenData {
        r#type: TokenTypes::Anilist,
        user_id: params[0].to_string(),
        guild_id: params[1].to_string(),
        access_token: response_json.access_token,
    };

    redis.xadd("oauth_token", "data", serde_json::to_string(&token_data).unwrap()).await.unwrap();

    // Needs to be changed to Redirect::to(<success page url>)
    HttpResponse::Ok().json(token_data)
}
