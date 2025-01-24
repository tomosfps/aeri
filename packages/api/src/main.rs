use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use colourful_logger::Logger as Logger;
use lazy_static::lazy_static;
use dotenv::dotenv;
use std::env;
use std::thread;

mod anilist;
mod cache;
use anilist::media::{media_search, relations_search, recommend};
use anilist::user::{user_search, user_score, expire};
use cache::redis::Redis;
use cache::proxy::update_proxy_list;

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
}

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Welcome to Anilist API Proxy")
}

async fn manual() -> impl Responder {
    HttpResponse::Ok().body("Anilist API Proxy")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    logger.info_single("Starting Anilist API Proxy", "Main");
    let ip = env::var("API_HOST").unwrap_or("0.0.0.0".to_string());
    let port = env::var("API_PORT").unwrap().parse::<u16>().unwrap_or(8080);
    let check_proxy = env::var("API_PROXY").unwrap_or("false".to_string());

    if check_proxy == "false" {
        logger.error_single("No proxy URL provided, unable to make requests.", "Main");
        return Err(std::io::Error::new(std::io::ErrorKind::Other, "No proxy URL provided"));
    }

    logger.info_single(&format!("Listening on {}:{}", ip, port), "Main");
    tokio::spawn(async move {
        let mut attempts: u8 = 0;
        while attempts < 5 {
            if let Err(e) = update_proxy_list(&redis.get_client(), &check_proxy).await {
                logger.error_single(&format!("Failed to update proxy list (attempt {}): {:?}", attempts + 1, e), "Main");
                thread::sleep(std::time::Duration::from_secs(5));
                attempts += 1;
            }
        }

        if attempts == 5 {
            logger.error_single("Failed to update proxy list after 5 attempts", "Main");
        }
    });
    
    HttpServer::new(move || {
        App::new()
            .service(hello)
            .service(user_search)
            .service(user_score)
            .service(media_search)
            .service(relations_search)
            .service(expire)
            .service(recommend)
            .route("/hey", web::get().to(manual))
    })
    .bind((ip, port))?
    .run()
    .await
}