use std::error::Error;
use colourful_logger::Logger;
use reqwest::{Client, StatusCode};
use redis::{Client as RedisClient, Commands};
use lazy_static::lazy_static;

lazy_static! {
    static ref logger: Logger = Logger::default();
}

async fn fetch_proxies(url: &String) -> Result<Vec<String>, Box<dyn Error>> {
    logger.debug_single("Fetching fresh proxies", "Proxy");
    let client = Client::new();
    let response = client.get(url).send().await?;
    
    if response.status() != StatusCode::OK {
        logger.error("Failed to fetch proxies", "Proxy", false, response.status().to_string());
        return Err("Failed to fetch proxies".into());
    }

    let proxy_list: serde_json::Value = response.json().await?;
    let mut proxy_vec = vec![];

    for proxy in proxy_list.as_array().unwrap() {
        if let Some(prox) = proxy["proxy"].as_str() {
            proxy_vec.push(prox.to_string());
        }
    }

    logger.debug_single("Returning proxy list", "Proxy");
    Ok(proxy_vec)
}

pub async fn get_random_proxy(redis_client: &RedisClient) -> Result<String, Box<dyn Error>> {
    logger.debug_single("Getting random proxy", "Proxy");
    let mut con = redis_client.get_connection()?;
    let proxy: std::collections::HashMap<String, String> = con.hgetall("proxies")?;

    if proxy.is_empty() {
        logger.error("Failed to find a proxy", "Proxy", false, proxy.len().to_string());
        return Err("No proxies found".into());
    }

    let proxy_value = proxy.iter().next().unwrap().1;
    logger.debug("Returning first proxy in redis", "Proxy", false, proxy_value.clone());
    Ok(proxy_value.to_string())
}

pub async fn remove_proxy(redis_client: &RedisClient, proxy: &str) -> Result<(), Box<dyn Error>> {
    logger.debug_single(&format!("Removing proxy: {}", proxy), "Proxy");
    let mut con = redis_client.get_connection()?;
    let _: () = con.hdel("proxies", proxy)?;
    Ok(())
}

async fn remove_all_proxies(redis_client: &RedisClient) -> Result<(), Box<dyn Error>> {
    logger.debug_single("Removing all proxies", "Proxy");
    let mut con = redis_client.get_connection()?;
    let _: () = con.del("proxies")?;
    Ok(())
}

pub async fn update_proxy_list(redis_client: &RedisClient, url: &String) -> Result<(), Box<dyn Error>> {
    loop {
        logger.debug_single("Updating proxy list", "Proxy");
        let proxies = fetch_proxies(url).await?;

        match proxies.len() {
            0 => {
                logger.error_single("No proxies found", "Proxy");
                tokio::time::sleep(tokio::time::Duration::from_secs(18000)).await; // 18000 seconds = 5 hours
                continue;
            },
            _ => {
                logger.debug_single(&format!("Found {} proxies", proxies.len()), "Proxy");
                let _: () = remove_all_proxies(redis_client).await?;
            }
        }
        let mut con = redis_client.get_connection()?;

        logger.debug_single("Updating redis with new proxies", "Proxy");
        for (index, proxy) in proxies.iter().enumerate() {
            let key = format!("proxy:{}", index);
            let value = format!("{}", proxy);
            let _: () = con.hset("proxies", key, value)?;
        }
        tokio::time::sleep(tokio::time::Duration::from_secs(18000)).await; // 18000 seconds = 5 hours
    }
}