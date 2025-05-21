use crate::cache::redis::Redis;
use colourful_logger::Logger;
use reqwest::{Client, Response, StatusCode};
use std::env;
use std::error::Error;
use std::sync::LazyLock;

static LOGGER: std::sync::LazyLock<Logger> = LazyLock::new(Logger::default);

#[derive(Clone)]
pub struct Proxy {
    pub client: Client,
    pub redis: Redis,
}

impl Proxy {
    pub async fn new() -> Self {
        let client: Client = Client::new();
        let redis = Redis::new().await;
        
        Proxy {
            client,
            redis,
        }
    }

    pub async fn fetch_proxies(&self, url: &str) -> Result<Vec<String>, Box<dyn Error>> {
        LOGGER.debug_single("Fetching fresh proxies", "Proxy");
        let response: Response  = self.client.get(url).send().await?;

        if response.status() != StatusCode::OK {
            LOGGER.error("Failed to fetch proxies", "Proxy", false, response.status().to_string());
            return Err(format!("Failed to fetch proxies: {}", response.status()).into());
        }

        let proxy_list:     serde_json::Value = response.json().await?;
        let mut proxy_vec:  Vec<String> = vec![];

        for proxy in proxy_list.as_array().unwrap() {
            if let Some(prox) = proxy["proxy"].as_str() {
                proxy_vec.push(prox.to_string());
            }
        }

        LOGGER.debug_single(&format!("Gathered {} proxies and returning them", proxy_vec.len()), "Proxy");
        Ok(proxy_vec)
    }

    async fn remove_all_proxies(&self) -> Result<(), Box<dyn Error>> {
        LOGGER.debug_single("Removing all proxies", "Proxy");
        self.redis.del("proxies").await;
        Ok(())
    }    pub async fn update_proxy_list(&self, url_override: Option<&str>) -> Result<(), Box<dyn Error>> {
        let url = match url_override {
            Some(override_url) => override_url.to_string(),
            None => env::var("MAIN_PROXIES").unwrap_or("https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/all/data.json".to_string())
        };
        
        LOGGER.debug_single(&format!("Updating proxy list from {}", url), "Proxy");
        let proxies = self.fetch_proxies(url.as_str()).await?;

        match proxies.len() {
            0 => {
                LOGGER.error_single("No proxies found", "Proxy");
                return Err("No proxies found".into());
            },
            _ => {
                LOGGER.debug_single(&format!("Found {} proxies", proxies.len()), "Proxy");
                let _: () = self.remove_all_proxies().await?;
            }
        }

        LOGGER.debug_single("Updating redis with new proxies", "Proxy");
        self.redis.sadd("proxies", proxies).await;
        LOGGER.debug_single("Updated proxies", "Proxy");
        
        Ok(())
    }
      pub async fn start_proxy_update_loop(&self, url_override: Option<&str>) -> Result<(), Box<dyn Error>> {
        loop {
            if let Err(e) = self.update_proxy_list(url_override).await {
                LOGGER.error_single(&format!("Failed to update proxy list in loop: {}", e), "Proxy");
            }
            tokio::time::sleep(tokio::time::Duration::from_secs(18000)).await;
        }
    }
}
