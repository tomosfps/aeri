use std::env;
use redis::{Client, ToRedisArgs, RedisResult, Commands};

pub struct Redis {
    client: Client,
}

impl Redis {
    pub fn new() -> Self {
        let redis_url = env::var("REDIS_URL").unwrap_or("redis://localhost:6379".to_string()).to_string();
        Redis {
            client: Client::open(redis_url).unwrap(),
        }
    }

    fn get<T: ToRedisArgs>(&self, key: T) -> RedisResult<String> {
        let mut con = self.client.get_connection()?;
        let rv: String = con.get(key).unwrap();

        Ok(rv)
        
    }

    fn set<T: ToRedisArgs, V: ToRedisArgs>(&self, key: T, value: V) -> RedisResult<()> {
        let mut con = self.client.get_connection()?;
        con.set(key, value)?;

        Ok(())
    }
}