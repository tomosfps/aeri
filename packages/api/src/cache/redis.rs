use colourful_logger::Logger as Logger;
use lazy_static::lazy_static;
use redis::{Client, Commands, RedisResult, ToRedisArgs};
use std::env;

lazy_static! {
    static ref logger: Logger = Logger::default();
}

#[derive(Debug, Clone)]
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

    pub fn ttl<T: ToRedisArgs + std::fmt::Debug>(&self, key: T) -> RedisResult<i64> {
        logger.debug_single(&format!("Getting TTL for key : {:?}", key).as_str(), "Redis");
        let mut con: redis::Connection = self.client.get_connection()?;
        let result:  RedisResult<i64> = con.ttl(key);

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

    pub fn del<T: ToRedisArgs + std::fmt::Debug>(&self, key: T) -> RedisResult<()> {
        logger.debug_single(&format!("Deleting key : {:?}", key).as_str(), "Redis");
        let mut con = self.client.get_connection()?;
        let result: RedisResult<()> = con.del(key);

        match result {
            Ok(_) => {
                logger.debug_single("Key has been deleted", "Redis");
                return Ok(());
            },
            Err(e) => {
                logger.error_single(&format!("Error deleting key : {:?}", e).as_str(), "Redis");
                return Err(e);
            }
        }
    }

    pub async fn expire_user<T: ToRedisArgs + std::fmt::Debug + std::fmt::Display>(&self, k: T) -> RedisResult<()> {
        logger.debug_single(&format!("Deleting all cached related for user ID {:?}", k).as_str(), "Redis");
        let mut con = self.client.get_connection()?;

        let mut count = 0;
        let iter: redis::Iter<String> = con.scan()?;
        let keys: Vec<String> = iter.collect();
        for key in keys {
            let parts: Vec<&str> = key.split(":").collect();
            logger.debug_single(&format!("Split up parts: {:?}", &parts), "Redis");

            if parts.get(1) == Some(&k.to_string().as_str()) {
                logger.debug_single(&format!("Found Key: {:?}", key), "Redis");
                let _: () = con.del(key)?;
                count += 1;
            }
        }

        if count == 0 {
            logger.warn_single("No keys found", "Redis");
        }

        Ok(())
    }

    pub async fn setexp<T: ToRedisArgs + std::fmt::Debug, V: ToRedisArgs + std::fmt::Debug>(&self, key: T, value: V, seconds: u64) -> RedisResult<()> {
        logger.debug_single(&format!("Setting {:?} with data and expiring in {} seconds", key, seconds).as_str(), "Redis");
        let mut con = self.client.get_connection()?;

        let result: RedisResult<()> = con.set_ex(key, value, seconds);
        match result {
            Ok(_) => {
                return Ok(());
            },
            Err(e) => {
                logger.error_single(&format!("Error setting key : {:?}", e).as_str(), "Redis");
                return Err(e);
            }
        }
    }

    pub async fn xadd<T: ToRedisArgs + std::fmt::Debug + Clone, F: ToRedisArgs + std::fmt::Debug, V: ToRedisArgs + std::fmt::Debug>(&self, stream: T, field: F, data: V) -> RedisResult<()> {
        logger.debug_single(&format!("Adding entry to stream {:?}", stream).as_str(), "Redis");
        let mut con = self.client.get_connection()?;

        let _: RedisResult<String> = con.xgroup_create_mkstream(stream.clone(), "api", "0");

        let result: RedisResult<String> = con.xadd(stream, "*", &[(field, data)]);
        match result {
            Ok(entry_id) => {
                logger.debug_single(&format!("Entry added with ID {:?}", entry_id).as_str(), "Redis");
                Ok(())
            },
            Err(e) => {
                logger.error_single(&format!("Error adding entry to stream: {:?}", e).as_str(), "Redis");
                Err(e)
            }
        }
    }

    pub async fn sadd<T: ToRedisArgs + std::fmt::Debug, V: ToRedisArgs + std::fmt::Debug>(&self, key: T, value: V) -> RedisResult<()> {
        logger.debug_single(&format!("Adding value(s) to set {:?}", key).as_str(), "Redis");
        let mut con = self.client.get_connection()?;

        let result: RedisResult<()> = con.sadd(key, value);
        match result {
            Ok(_) => {
                logger.debug_single("Value added to set", "Redis");
                Ok(())
            },
            Err(e) => {
                logger.error_single(&format!("Error adding value to set: {:?}", e).as_str(), "Redis");
                Err(e)
            }
        }
    }

    pub async fn srandmember<T: ToRedisArgs + std::fmt::Debug>(&self, key: T) -> RedisResult<String> {
        logger.debug_single(&format!("Getting random member from set {:?}", key).as_str(), "Redis");
        let mut con = self.client.get_connection()?;

        let result: RedisResult<String> = con.srandmember(key);
        match result {
            Ok(member) => {
                logger.debug_single(&format!("Random member from set is {:?}", member).as_str(), "Redis");
                Ok(member)
            },
            Err(e) => {
                logger.error_single(&format!("Error getting random member from set: {:?}", e).as_str(), "Redis");
                Err(e)
            }
        }
    }

    pub async fn srem<T: ToRedisArgs + std::fmt::Debug, V: ToRedisArgs + std::fmt::Debug>(&self, key: T, value: V) -> RedisResult<()> {
        logger.debug_single(&format!("Removing value from set {:?}", key).as_str(), "Redis");
        let mut con = self.client.get_connection()?;

        let result: RedisResult<()> = con.srem(key, value);
        match result {
            Ok(_) => {
                logger.debug_single("Value removed from set", "Redis");
                Ok(())
            },
            Err(e) => {
                logger.error_single(&format!("Error removing value from set: {:?}", e).as_str(), "Redis");
                Err(e)
            }
        }
    }
}
