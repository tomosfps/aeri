use crate::cache::redis::Redis;
use colourful_logger::Logger;
use lazy_static::lazy_static;
use reqwest::{Client, Response, StatusCode};
use std::env;
use std::error::Error;

lazy_static! {
    static ref logger: Logger = Logger::default();
}

pub struct Proxy {
    pub client: reqwest::Client,
    pub redis: Redis,
}

impl Proxy {
    pub fn new() -> Self {
        let client: Client = reqwest::Client::new();
        let redis = Redis::new();
        Proxy {
            client,
            redis,
        }
    }

    pub async fn fetch_proxies(&self, url: &str) -> Result<Vec<String>, Box<dyn Error>> {
        logger.debug_single("Fetching fresh proxies", "Proxy");
        let response: Response  = self.client.get(url).send().await?;

        if response.status() != StatusCode::OK {
            logger.error("Failed to fetch proxies", "Proxy", false, response.status().to_string());
            return Err(format!("Failed to fetch proxies: {}", response.status()).into());
        }

        let proxy_list:     serde_json::Value = response.json().await?;
        let mut proxy_vec:  Vec<String> = vec![];

        for proxy in proxy_list.as_array().unwrap() {
            if let Some(prox) = proxy["proxy"].as_str() {
                proxy_vec.push(prox.to_string());
            }
        }

        logger.debug_single(&format!("Gathered {} proxies and returning them", proxy_vec.len()), "Proxy");
        Ok(proxy_vec)
    }

    async fn remove_all_proxies(&self) -> Result<(), Box<dyn Error>> {
        logger.debug_single("Removing all proxies", "Proxy");
        let _ = self.redis.del("proxies")?;
        Ok(())
    }

    pub async fn update_proxy_list(&self) -> Result<(), Box<dyn Error>> {
        let url = env::var("PROXY_URL").unwrap_or("https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/all/data.json".to_string());
        loop {
            logger.debug_single("Updating proxy list", "Proxy");
            let proxies = self.fetch_proxies(url.as_str()).await?;

            match proxies.len() {
                0 => {
                    logger.error_single("No proxies found", "Proxy");
                    continue;
                },
                _ => {
                    logger.debug_single(&format!("Found {} proxies", proxies.len()), "Proxy");
                    let _: () = self.remove_all_proxies().await?;
                }
            }

            logger.debug_single("Updating redis with new proxies", "Proxy");
            self.redis.sadd("proxies", proxies).await?;
            logger.debug_single("Updated proxies", "Proxy");
            tokio::time::sleep(tokio::time::Duration::from_secs(18000)).await;
        }
    }

}
