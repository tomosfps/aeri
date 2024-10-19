use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use colourful_logger::Logger as Logger;
use lazy_static::lazy_static;
use dotenv::dotenv;

mod api;
use api::media::{media_search, relations_search};
use api::user::{user_search, user_score};

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
    HttpServer::new(|| {
        App::new()
            .service(hello)
            .service(user_search)
            .service(user_score)
            .service(media_search)
            .service(relations_search)
            .route("/hey", web::get().to(manual))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}