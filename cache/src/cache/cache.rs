use std::env;
use redis::{Client, ToRedisArgs, RedisResult, Commands};
use colourful_logger::Logger as Logger;
use lazy_static::lazy_static;

lazy_static! {
    static ref logger: Logger = Logger::new();
}

pub struct Redis {
    client: Client,
}

impl Redis {
    pub fn new() -> Self {
        let redis_url = env::var("REDIS_URL").unwrap_or("redis://localhost:6379".to_string()).to_string();
        logger.info("Created Client", "Redis");
        Redis {
            client: Client::open(redis_url).unwrap(),
        }
    }

    pub fn get<T: ToRedisArgs>(&self, key: T) -> RedisResult<String> {
        logger.info("Getting Value", "Redis");
        let mut con = self.client.get_connection()?;
        let rv: String = con.get(key).unwrap();
        
        logger.info(format!("Got Value: {}", rv).as_str(), "Redis");
        Ok(rv)
        
    }

    pub fn set<T: ToRedisArgs, V: ToRedisArgs>(&self, key: T, value: V) -> RedisResult<()> {
        logger.info("Setting Value", "Redis");
        let mut con = self.client.get_connection()?;
        let _: () = con.set(key, value)?;

        logger.info("Set Value", "Redis");

        Ok(())
    }
}