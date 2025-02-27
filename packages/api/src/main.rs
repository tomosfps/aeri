use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use actix_web::{http, middleware};

use colourful_logger::Logger as Logger;
use lazy_static::lazy_static;
use routes::get_commands::get_commands;
use std::env;

mod routes;
mod cache;
mod global;
mod client;
mod structs;
mod entities;

use routes::recommend::recommend;

use crate::entities::{
    affinity::Affinity, character::Character,
    media::Media, relations::Relations, staff::Staff,
    studio::Studio, user::User, user_score::UserScore, Entity,
    update_entry::UpdateMediaMutation
};
use crate::routes::oauth::anilist::anilist_oauth;
use crate::routes::viewer::viewer;
use cache::redis::Redis;
use client::proxy::Proxy;
use crate::routes::remove_user::remove_user;

lazy_static! {
    static ref logger: Logger = Logger::default();
    static ref redis:  Redis  = Redis::new();
    static ref proxy:  Proxy  = Proxy::new();
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().unwrap_or_default();

    logger.info_single("Starting The API", "Main");
    let ip = env::var("API_HOST").unwrap_or("0.0.0.0".to_string());
    let port = env::var("API_PORT").unwrap().parse::<u16>().unwrap_or(8080);
    let check_proxy = env::var("API_PROXY").map_err(|_| {
        logger.error_single("API_PROXY environment variable not set", "Main");
    });

    if check_proxy.is_ok() {
        tokio::spawn(async move {
            let mut attempts: u8 = 0;
            while attempts < 10 {
                if let Err(e) = proxy.update_proxy_list().await.map_err(|e| { format!("{:?}", e) }) {
                    logger.error_single(&format!("Failed to update proxy list (attempt {}): {}", attempts + 1, e), "Main");
                    tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
                    attempts += 1;
                }
            }
            if attempts == 10 {
                logger.error_single("Failed to update proxy list after 10 attempts", "Main");
                std::process::exit(1);
            }
        });
    }

    logger.info_single(&format!("Listening on {}:{}", ip, port), "Main");
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT, http::header::CONTENT_TYPE])
            .max_age(3600);

        App::new()
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .service(recommend)
            .service(anilist_oauth)
            .service(viewer)
            .service(remove_user)
            .service(get_commands)
            .route("/oauth/updateMedia", web::post().to(UpdateMediaMutation::route))
            .route("/studio", web::post().to(Studio::route))
            .route("/staff", web::post().to(Staff::route))
            .route("/user", web::post().to(User::route))
            .route("/user/score", web::post().to(UserScore::route))
            .route("/relations", web::post().to(Relations::route))
            .route("/character", web::post().to(Character::route))
            .route("/media", web::post().to(Media::route))
            .route("/affinity", web::post().to(Affinity::route))
    })
    .workers(num_cpus::get())
    .bind((ip, port))?
    .run()
    .await
}
