mod caches;
use colourful_logger::Logger as Logger;
use lazy_static::lazy_static;
use crate::caches::cache::Redis;

lazy_static! {
    static ref logger: Logger = Logger::new();
}

fn main() {
    let redis = Redis::new();
    logger.info("Starting Redis Client", "Redis");
}