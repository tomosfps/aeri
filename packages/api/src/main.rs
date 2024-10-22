use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use colourful_logger::Logger as Logger;
use lazy_static::lazy_static;
use dotenv::dotenv;
use std::env;

mod anilist;
mod cache;
use anilist::media::{media_search, relations_search};
use anilist::user::{user_search, user_score};

lazy_static! {
    static ref logger: Logger = Logger::new();
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

    logger.info("Starting Anilist API Proxy", "Main");
    let ip = env::var("API_IP").unwrap_or("0.0.0.0".to_string());
    let port = env::var("API_PORT").unwrap().parse::<u16>().unwrap_or(8080);
    logger.info(&format!("Listening on {}:{}", ip, port), "Main");
    
    HttpServer::new(move || {
        App::new()
            .service(hello)
            .service(user_search)
            .service(user_score)
            .service(media_search)
            .service(relations_search)
            .route("/hey", web::get().to(manual))
    })
    .bind((ip, port))?
    .run()
    .await
}