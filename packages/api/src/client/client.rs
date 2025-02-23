use crate::cache::redis::Redis;
use actix_web::http::StatusCode;
use actix_web::HttpResponse;
use colourful_logger::Logger;
use lazy_static::lazy_static;
use reqwest::{Proxy, Response};
use serde_json::{json, Value};

lazy_static! {
    static ref logger: Logger = Logger::default();
}

#[derive(Debug, Clone)]
pub struct Client {
    client: reqwest::Client,
    redis: Redis,
    using_proxy: bool,
    current_proxy: String,
}

impl Client {
    #[allow(dead_code)]
    pub fn new() -> Self {
        let client = reqwest::Client::new();
        let redis = Redis::new();
        Client {
            client,
            redis,
            using_proxy: false,
            current_proxy: String::from(""),
        }
    }

    pub async fn new_proxied() -> Self {
        let redis = Redis::new();
        let proxy_url = Self::fetch_proxy(&redis).await.unwrap();
        let proxy = Proxy::http(&proxy_url).unwrap();
        let client = reqwest::Client::builder().proxy(proxy).build().unwrap();

        Client {
            client,
            redis,
            using_proxy: true,
            current_proxy: proxy_url,
        }
    }

    pub async fn set_proxy(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.current_proxy = Self::fetch_proxy(&self.redis).await?;
        Ok(())
    }

    pub async fn post(&mut self, url: &str, query: &Value) -> Result<Response, Box<dyn std::error::Error>> {
        if self.using_proxy {
            let response = self.client.post(url)
                .header("Content-Type", "application/json")
                .json(query)
                .send()
                .await?;

            if response.status().as_u16() == 403 {
                let _ = self.remove_proxy().await;
                let _ = self.set_proxy().await;
                return Box::pin(async move { self.post(url, query).await }).await;
            }
            return Ok(response);
        }

        let response = self.client.post(url)
            .header("Content-Type", "application/json")
            .json(query)
            .send()
            .await?;

        Ok(response)
    }

    pub async fn post_with_auth(&mut self, url: &str, query: &Value, auth: &str) -> Result<Response, Box<dyn std::error::Error>> {
        if self.using_proxy {
            let response = self.client.post(url)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("Authorization", auth)
                .json(query)
                .send()
                .await?;

            if response.status().as_u16() == 403 {
                let _ = self.remove_proxy().await;
                let _ = self.set_proxy().await;
                return Box::pin(async move { self.post(url, query).await }).await;
            }
            return Ok(response);
        }

        let response = self.client.post(url)
            .header("Content-Type", "application/json")
            .header("Authorization", auth)
            .json(query)
            .send()
            .await?;

        Ok(response)
    }

    async fn fetch_proxy(redis: &Redis) -> Result<String, Box<dyn std::error::Error>> {
        logger.debug_single("Getting random proxy", "Proxy");
        let proxy = redis.srandmember("proxies").await?;

        if proxy.is_empty() {
            logger.error_single("Failed to find a proxy", "Proxy");
            return Err("No proxies found".into());
        }

        logger.debug("Returning random proxy in redis", "Proxy", false, proxy.clone());
        Ok(proxy)
    }

    pub async fn remove_proxy(&self) -> Result<(), Box<dyn std::error::Error>> {
        logger.debug_single(&format!("Removing proxy: {}", self.current_proxy), "Proxy");
        let _: () = self.redis.srem("proxies", &self.current_proxy).await?;
        Ok(())
    }

    pub async fn error_response(response: Response) -> HttpResponse {
        let code = response.status().as_u16();
        let error = response.text().await.unwrap();

        HttpResponse::build(StatusCode::from_u16(code).unwrap())
            .append_header(("Content-Type", "application/json"))
            .body(json!({"error": error, "errorCode": code}).to_string())
    }
}
