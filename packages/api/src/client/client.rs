use lazy_static::lazy_static;
use colourful_logger::Logger;
use reqwest::{Proxy, Response};
use crate::cache::redis::Redis;
use serde_json::Value;

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
    pub fn new() -> Self {
        let client = reqwest::Client::new();
        let redis = Redis::new();
        Client {
            client,
            redis,
            using_proxy: false,
            current_proxy: "".to_string(),
        }
    }

    pub async fn with_proxy(&self) -> Result<Self, Box<dyn std::error::Error>> {
        let redis = Redis::new();
        let proxy_url = self.fetch_proxy().await?;
        let proxy = Proxy::http(&proxy_url)?;
        let client = reqwest::Client::builder().proxy(proxy).build()?;
        Ok(Client {
            client,
            redis,
            using_proxy: true,
            current_proxy: proxy_url,
        })
    }

    pub async fn post(&self, url: &str, json: &Value) -> Result<Response, Box<dyn std::error::Error>> {
        if self.using_proxy {
            let response = self.client.post(url)
                .header("Content-Type", "application/json")
                .json(json)
                .send()
                .await?;
            return Ok(response);
        }

        let response = self.client.post(url)
            .header("Content-Type", "application/json")
            .json(json)
            .send()
            .await?;
        Ok(response)
    }

    pub async fn post_with_auth(&self, url: &str, json: &Value, auth: &str) -> Result<Response, Box<dyn std::error::Error>> {
        if self.using_proxy {
            let response = self.client.post(url)
                .header("Content-Type", "application/json")
                .header("Authorization", auth)
                .json(json)
                .send()
                .await?;
            return Ok(response);
        }

        let response = self.client.post(url)
            .header("Content-Type", "application/json")
            .header("Authorization", auth)
            .json(json)
            .send()
            .await?;
        Ok(response)
    }

    async fn fetch_proxy(&self) -> Result<String, Box<dyn std::error::Error>> {
        logger.debug_single("Getting random proxy", "Proxy");
        let proxy = self.redis.srandmember("proxies").await?;

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
}
