use std::sync::Arc;
use crate::cache::redis::Redis;
use actix_web::http::StatusCode;
use actix_web::{web, HttpResponse};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use reqwest::{Proxy, Response};
use serde_json::{json, Value};
use crate::global::metrics::Metrics;

lazy_static! {
    static ref logger: Logger = Logger::default();
}

#[derive(Debug, Clone)]
pub struct Client {
    client: reqwest::Client,
    redis: Redis,
    using_proxy: bool,
    current_proxy: String,
    metrics: web::Data<Arc<Metrics>>,
}

impl Client {
    #[allow(dead_code)]
    pub async fn new(metrics: web::Data<Arc<Metrics>>) -> Self {
        let client = reqwest::Client::new();
        let redis = Redis::new().await;
        Client {
            client,
            redis,
            using_proxy: false,
            current_proxy: String::from(""),
            metrics,
        }
    }

    pub async fn new_proxied(metrics: web::Data<Arc<Metrics>>) -> Self {
        let redis = Redis::new().await;
        let proxy_url = Self::fetch_proxy(&redis).await.unwrap();
        let proxy = Proxy::http(&proxy_url).unwrap();
        let client = reqwest::Client::builder().proxy(proxy).build().unwrap();

        Client {
            client,
            redis,
            using_proxy: true,
            current_proxy: proxy_url,
            metrics,
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
                .header("Accept", "application/json")
                .json(query)
                .send()
                .await?;

            if response.status().as_u16() == 403 {
                let _ = self.remove_proxy().await;
                let _ = self.set_proxy().await;
                return Box::pin(async move { self.post(url, query).await }).await;
            }
            
            self.metrics.record_anilist(response.status().as_u16(), false);
            return Ok(response);
        }

        let response = self.client.post(url)
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .json(query)
            .send()
            .await?;

        self.metrics.record_anilist(response.status().as_u16(), false);
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
            
            self.metrics.record_anilist(response.status().as_u16(), true);
            return Ok(response);
        }

        let response = self.client.post(url)
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .header("Authorization", auth)
            .json(query)
            .send()
            .await?;

        self.metrics.record_anilist(response.status().as_u16(), true);
        Ok(response)
    }

    async fn fetch_proxy(redis: &Redis) -> Result<String, String> {
        let proxy: Option<String> = redis.srandmember("proxies").await;

        let proxy = match proxy {
            Some(proxy) => proxy,
            None => {
                logger.error_single("Failed to find a proxy", "Proxy");
                return Err("No proxies found".into());
            }
        };

        logger.debug("Returning random proxy in redis", "Proxy", false, proxy.clone());
        Ok(proxy)
    }

    pub async fn remove_proxy(&self) -> Result<(), Box<dyn std::error::Error>> {
        logger.debug_single(&format!("Removing proxy: {}", self.current_proxy), "Proxy");
        let _ = self.redis.srem("proxies", &self.current_proxy).await;
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
