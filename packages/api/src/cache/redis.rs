use colourful_logger::Logger as Logger;
use lazy_static::lazy_static;
use redis::{Client, AsyncCommands, RedisResult, ToRedisArgs, FromRedisValue, AsyncIter};
use std::env;
use redis::aio::MultiplexedConnection;

lazy_static! {
    static ref logger: Logger = Logger::default();
}

#[derive(Debug, Clone)]
pub struct Redis {
    connection: MultiplexedConnection,
}

impl Redis {
    pub async fn new() -> Self {
        let redis_url = env::var("REDIS_URL").unwrap_or("redis://localhost:6379".to_string()).to_string();
        logger.debug_single(format!("Created Client with URL : {}", redis_url).as_str(), "Redis");

        let client = Client::open(redis_url).unwrap();
        let connection = client.get_multiplexed_tokio_connection().await.unwrap();

        Redis { connection }
    }

    pub async fn get<K: ToRedisArgs + Send + Sync, RV: FromRedisValue>(&self, key: K) -> Option<RV> {
        self.connection.clone().get::<_, Option<RV>>(key).await.unwrap_or_else(|e| {
            logger.error("GET", "Redis", false, format!("{:?}", e));
            None
        })
    }

    pub async fn set_ex<K: ToRedisArgs + Send + Sync, V: ToRedisArgs + Send + Sync>(&self, key: K, value: V, seconds: u64) -> bool {
        match self.connection.clone().set_ex::<_, _, ()>(key, value, seconds).await {
            Ok(_) => true,
            Err(e) => {
                logger.error("SETEX", "Redis", false, format!("{:?}", e));
                false
            }
        }
    }

    pub async fn ttl<K: ToRedisArgs + Send + Sync>(&self, key: K) -> Option<i64> {
        match self.connection.clone().ttl(key).await {
            Ok(data) => Some(data),
            Err(e) => {
                logger.error("TTL", "Redis", false, format!("{:?}", e));
                None
            }
        }
    }

    pub async fn del<K: ToRedisArgs + Send + Sync>(&self, key: K) -> bool {
        match self.connection.clone().del::<_, ()>(key).await {
            Ok(_) => true,
            Err(e) => {
                logger.error("DEL", "Redis", false, format!("{:?}", e));
                false
            }
        }
    }

    pub async fn xadd<T: ToRedisArgs + Send + Sync + Clone, F: ToRedisArgs + Send + Sync, V: ToRedisArgs + Send + Sync>(&self, stream: T, field: F, data: V) -> Option<()> {
        let mut conn = self.connection.clone();

        let _: RedisResult<()> = conn.xgroup_create_mkstream(stream.clone(), "api", "0").await;

        match conn.xadd::<_, _, _, _, ()>(stream, "*", &[(field, data)]).await {
            Ok(_) => Some(()),
            Err(e) => {
                logger.error("XADD", "Redis", false, format!("{:?}", e));
                None
            }
        }
    }

    pub async fn sadd<T: ToRedisArgs + Send + Sync, V: ToRedisArgs + Send + Sync>(&self, key: T, value: V) -> Option<()> {
        match self.connection.clone().sadd::<_, _, ()>(key, value).await {
            Ok(_) => Some(()),
            Err(e) => {
                logger.error("SADD", "Redis", false, format!("{:?}", e));
                None
            }
        }
    }

    pub async fn srem<T: ToRedisArgs + Send + Sync, V: ToRedisArgs + Send + Sync>(&self, key: T, value: V) -> Option<()> {
        match self.connection.clone().srem::<_, _, ()>(key, value).await {
            Ok(_) => Some(()),
            Err(e) => {
                logger.error("SREM", "Redis", false, format!("{:?}", e));
                None
            }
        }
    }

    pub async fn srandmember<T: ToRedisArgs + Send + Sync, RV: FromRedisValue>(&self, key: T) -> Option<RV> {
        match self.connection.clone().srandmember(key).await {
            Ok(data) => Some(data),
            Err(e) => {
                logger.error("SRANDMEMBER", "Redis", false, format!("{:?}", e));
                None
            }
        }
    }

    pub async fn hvals<T: ToRedisArgs + Send + Sync, RV: FromRedisValue>(&self, key: T) -> Option<RV> {
        match self.connection.clone().hvals(key).await {
            Ok(data) => Some(data),
            Err(e) => {
                logger.error("HVALS", "Redis", false, format!("{:?}", e));
                None
            }
        }
    }

    pub async fn expire_user(&self, user_id: &str, username: &str) {
        let mut conn = self.connection.clone();
        let mut iter_conn1 = self.connection.clone();
        let mut iter_conn2 = self.connection.clone();

        let _ = conn.del::<_, ()>(format!("user:{}", username)).await;
        let _ = conn.del::<_, ()>(format!("affinity:{}", username)).await;

        let iter: Result<AsyncIter<String>, _> = iter_conn1.scan_match(format!("score:*:{}", username)).await;

        if let Ok(mut iter) = iter {
            while let Some(key) = iter.next_item().await {
                let _ = conn.del::<_, ()>(key).await;
            }
        }

        let iter: Result<AsyncIter<String>, _> = iter_conn2.scan_match(format!("score:*:{}", user_id)).await;

        if let Ok(mut iter) = iter {
            while let Some(key) = iter.next_item().await {
                let _ = conn.del::<_, ()>(key).await;
            }
        }
    }
}
