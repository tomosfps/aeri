use crate::cache::redis::Redis;
use crate::client::client::Client;
use actix_web::web::Redirect;
use actix_web::{get, web, Responder};
use colourful_logger::Logger;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::env;
use std::sync::{Arc, LazyLock};
use crate::global::metrics::Metrics;

static LOGGER: std::sync::LazyLock<Logger> = LazyLock::new(Logger::default);
static OAUTH_SUCCESS_URL: std::sync::LazyLock<String> = LazyLock::new(|| format!("{}{}", env::var("WEBSITE_URL").unwrap(), env::var("OAUTH_SUCCESS_PATH").unwrap()));
static OAUTH_FAIL_URL: std::sync::LazyLock<String> = LazyLock::new(|| format!("{}{}", env::var("WEBSITE_URL").unwrap(), env::var("OAUTH_FAIL_PATH").unwrap()));

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
    guild_id: Option<String>,
    access_token: String,
}

#[get("/oauth/anilist")]
pub async fn anilist_oauth(params: web::Query<OauthParams>, redis: web::Data<Redis>, metrics: web::Data<Arc<Metrics>>) -> impl Responder {
    let json: Value = json!({
        "grant_type": "authorization_code",
        "client_id": env::var("ANILIST_CLIENT_ID").unwrap(),
        "client_secret": env::var("ANILIST_CLIENT_SECRET").unwrap(),
        "redirect_uri": env::var("ANILIST_REDIRECT_URL").unwrap(),
        "code": params.code,
    });

    let mut client = Client::new_proxied(metrics).await;
    let response = client.post("https://anilist.co/api/v2/oauth/token", &json).await;

    let response = match response {
        Ok(response) => response,
        Err(err) => {
            LOGGER.error_single(&format!("Error getting response: {}", err), "Anilist");
            return Redirect::to(OAUTH_FAIL_URL.clone());
        }
    };

    if response.status().as_u16() != 200 {
        let code = response.status().as_u16();
        let error = response.text().await.unwrap();

        LOGGER.error(&format!("Error getting token ({})", code), "Anilist", false, error.clone());

        return Redirect::to(OAUTH_FAIL_URL.clone());
    }

    let params: Vec<&str> = params.state.split("_").collect();

    let response_json = response.json::<TokenResponse>().await;

    let response_json = match response_json {
        Ok(response_json) => response_json,
        Err(err) => {
            LOGGER.error_single(&format!("Error parsing response: {}", err), "Anilist");
            return Redirect::to(OAUTH_FAIL_URL.clone());
        }
    };

    let token_data = TokenData {
        r#type: TokenTypes::Anilist,
        user_id: params[0].to_string(),
        guild_id: if params.len() == 2 { Some(params[1].to_string()) } else { None },
        access_token: response_json.access_token,
    };

    redis.xadd("oauth_token", "data", serde_json::to_string(&token_data).unwrap()).await.unwrap();

    Redirect::to(OAUTH_SUCCESS_URL.clone())
}
