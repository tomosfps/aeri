use std::env;
use redis::{Client, ToRedisArgs, RedisResult, Commands};
use colourful_logger::Logger as Logger;
use lazy_static::lazy_static;

lazy_static! {
    static ref logger: Logger = Logger::default();
}

pub struct Redis {
    client: Client,
}

impl Redis {
    pub fn new() -> Self {
        let redis_url = env::var("REDIS_URL").unwrap_or("redis://localhost:6379".to_string()).to_string();
        logger.debug_single(&format!("Created Client with URL : {}", redis_url), "Redis");
        Redis {
            client: Client::open(redis_url).unwrap(),
        }
    }

    pub fn get_client(&self) -> Client {
        self.client.clone()
    }

    pub fn get<T: ToRedisArgs + std::fmt::Debug>(&self, key: T) -> RedisResult<String> {
        logger.debug_single(&format!("Trying to grab key : {:?}", key), "Redis");
        let mut con = self.client.get_connection()?;
        let rv: Option<String> = con.get(key)?;

        match rv {
            Some(data) => {
                let data: serde_json::Value = serde_json::from_str(data.as_str()).unwrap();
                logger.debug_single("Found value for key", "Redis");

                let data = data.to_string();
                return Ok(data);
            },
            None => {
                logger.warn_single("No value found for key", "Redis");
                return Err(redis::RedisError::from((redis::ErrorKind::ResponseError, "No value found for key")));
            }
        }
    }

    pub fn set<T: ToRedisArgs + std::fmt::Debug, V: ToRedisArgs + std::fmt::Debug>(&self, key: T, value: V) -> RedisResult<()> {
        logger.debug_single(&format!("Setting Key with data {:?}", key).as_str(), "Redis");
        let mut con = self.client.get_connection()?;
        
        let result: RedisResult<()> = con.set(key, value);
        match result {
            Ok(_) => {
                logger.debug_single("Key and Value have been set", "Redis");
                return Ok(());
            },
            Err(e) => {
                logger.error_single(&format!("Error setting key : {:?}", e).as_str(), "Redis");
                return Err(e);
            }
        }
    }

    pub fn expire<T: ToRedisArgs + std::fmt::Debug>(&self, key: T, seconds: i64) -> RedisResult<()> {
        logger.debug_single(&format!("Setting Key to expire in {} seconds : {:?}", seconds, key).as_str(), "Redis");
        let mut con = self.client.get_connection()?;
        let result: RedisResult<()> = con.expire(key, seconds);
        
        match result {
            Ok(_) => {
                logger.debug_single("Key has been set to expire", "Redis");
                return Ok(());
            },
            Err(e) => {
                logger.error_single(&format!("Error setting key to expire : {:?}", e).as_str(), "Redis");
                return Err(e);
            }
        }
    }

    pub fn ttl<T: ToRedisArgs + std::fmt::Debug>(&self, key: T) -> RedisResult<i64> {
        logger.debug_single(&format!("Getting TTL for key : {:?}", key).as_str(), "Redis");
        let mut con = self.client.get_connection()?;
        let result: RedisResult<i64> = con.ttl(key);

        match result {
            Ok(data) => {
                logger.debug_single(&format!("TTL for key is : {}", data).as_str(), "Redis");
                return Ok(data);
            },
            Err(e) => {
                logger.error_single(&format!("Error getting TTL for key : {:?}", e).as_str(), "Redis");
                return Err(e);
            }
        }
    }

    pub async fn expire_user<T: ToRedisArgs + std::fmt::Debug + std::fmt::Display>(&self, user_id: T) -> RedisResult<()> {
        logger.debug_single(&format!("Deleting all cached related for user ID {:?}", user_id).as_str(), "Redis");
        let mut con = self.client.get_connection()?;
    
        let mut count = 0;
        let iter: redis::Iter<String> = con.scan()?;
        let keys: Vec<String> = iter.collect();
        for key in keys {
            let parts: Vec<&str> = key.split(":").collect();
            logger.debug_single(&format!("Split up parts: {:?}", &parts), "Redis");

            if parts.get(1) == Some(&user_id.to_string().as_str()) {
                logger.debug_single(&format!("Found Key: {:?}", key), "Redis");
                let _: () = con.del(key)?;
                count += 1;
            }
        }

        if count == 0 {
            logger.warn_single("No keys found for user ID", "Redis");
            return Err(redis::RedisError::from((redis::ErrorKind::ResponseError, "No keys found for user ID")));
        }

        Ok(())
    }
}