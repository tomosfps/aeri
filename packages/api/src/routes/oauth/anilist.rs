use crate::cache::redis::Redis;
use crate::client::client::Client;
use actix_web::web::Redirect;
use actix_web::{get, web, Responder};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::env;

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis: Redis = Redis::new();
    static ref oauth_success_url: String = format!("{}{}", env::var("WEBSITE_URL").unwrap(), env::var("OAUTH_SUCCESS_PATH").unwrap());
    static ref oauth_fail_url: String = format!("{}{}", env::var("WEBSITE_URL").unwrap(), env::var("OAUTH_FAIL_PATH").unwrap());
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

    let mut client = Client::new_proxied().await;
    let response = client.post("https://anilist.co/api/v2/oauth/token", &json).await;

    let response = match response {
        Ok(response) => response,
        Err(err) => {
            logger.error_single(&format!("Error getting response: {}", err), "Anilist");
            return Redirect::to(oauth_fail_url.clone());
        }
    };

    if response.status().as_u16() != 200 {
        let code = response.status().as_u16();
        let error = response.text().await.unwrap();

        logger.error(&format!("Error getting token ({})", code), "Anilist", false, error.clone());

        return Redirect::to(oauth_fail_url.clone());
    }

    let params: Vec<&str> = params.state.split("_").collect();

    let response_json = response.json::<TokenResponse>().await;
    
    let response_json = match response_json {
        Ok(response_json) => response_json,
        Err(err) => {
            logger.error_single(&format!("Error parsing response: {}", err), "Anilist");
            return Redirect::to(oauth_fail_url.clone());
        }
    };
    
    let token_data = TokenData {
        r#type: TokenTypes::Anilist,
        user_id: params[0].to_string(),
        guild_id: params[1].to_string(),
        access_token: response_json.access_token,
    };

    redis.xadd("oauth_token", "data", serde_json::to_string(&token_data).unwrap()).await.unwrap();

    Redirect::to(oauth_success_url.clone())
}
