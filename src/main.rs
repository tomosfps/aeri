mod api;

use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use crate::api::user::*;

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Welcome to Anilist API Proxy")
}

async fn manual() -> impl Responder {
    HttpResponse::Ok().body("Anilist API Proxy")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(hello)
            .service(user)
            .route("/hey", web::get().to(manual))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}