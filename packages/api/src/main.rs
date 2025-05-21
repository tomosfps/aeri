use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use actix_web::{http, middleware};

use colourful_logger::Logger as Logger;
use std::sync::LazyLock;
use std::env;
use std::sync::Arc;
use prometheus_client::registry::Registry;

mod routes;
mod cache;
mod global;
mod client;
mod structs;
mod entities;

use crate::entities::{
    affinity::Affinity, character::Character,
    media::Media, relations::Relations, staff::Staff,
    studio::Studio, user::User, user_score::UserScore, Entity,
    update_entry::UpdateMediaMutation, watch_list::WatchList,
    recommend::Recommend, random::Random, find_sauce::FindSauce
};

use crate::routes::oauth::anilist::anilist_oauth;
use crate::routes::oauth::viewer::viewer;
use cache::redis::Redis;
use client::proxy::Proxy;
use crate::global::metrics::{Metrics, MetricsMiddleware};
use crate::routes::metrics::commands::commands;
use crate::routes::metrics::metrics_viewer::metrics_viewer;
use crate::routes::commands::remove_user::remove_user;
use crate::routes::metrics::shards::shards;
use crate::routes::metrics::statistics::statistics;

static LOGGER: std::sync::LazyLock<Logger> = LazyLock::new(Logger::default);

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().unwrap_or_default();

    LOGGER.info_single("Starting The API", "Main");
    let ip = env::var("API_HOST").unwrap_or(String::from("0.0.0.0"));
    let port = env::var("API_PORT").unwrap().parse::<u16>().unwrap_or(8080);
    let check_proxy = env::var("MAIN_PROXIES").map_err(|_| {
        LOGGER.error_single("MAIN_PROXIES environment variable not set", "Main");
    });

    let redis = Redis::new().await;
    let proxy = Proxy::new().await;
    let mut registry = Registry::default();
    let metrics_data = Arc::new(Metrics::new().register(&mut registry));
    let registry_arc = Arc::new(registry);    if check_proxy.is_ok() {
        let proxy_clone = proxy.clone();
        tokio::spawn(async move {
            let mut attempts: u8 = 0;
            let mut using_backup = false;
            let backup_proxy = env::var("BACKUP_PROXIES").ok();
            let mut final_proxy_url = None;
            
            while attempts < 10 {
                let proxy_url = if using_backup {
                    backup_proxy.as_deref()
                } else {
                    None 
                };
                
                if let Err(e) = proxy_clone.update_proxy_list(proxy_url).await.map_err(|e| { format!("{:?}", e) }) {
                    LOGGER.error_single(&format!("Failed to update proxy list (attempt {}): {}", attempts + 1, e), "Main");
                    
                    if attempts == 4 && !using_backup && backup_proxy.is_some() {
                        LOGGER.warn_single("Switching to backup proxy list", "Main");
                        using_backup = true;
                        attempts = 0;
                    } else {
                        tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
                        attempts += 1;
                    }
                } else {
                    final_proxy_url = proxy_url;
                    break;
                }
            }
            
            if attempts == 10 {
                LOGGER.error_single("Failed to update proxy list after 10 attempts (including backup attempts)", "Main");
                std::process::exit(1);
            }
            
            LOGGER.info_single("Starting continuous proxy update loop", "Main");
            if let Err(e) = proxy_clone.start_proxy_update_loop(final_proxy_url).await {
                LOGGER.error_single(&format!("Proxy update loop unexpectedly terminated: {}", e), "Main");
            }
        });
    }

    LOGGER.info_single(&format!("Listening on {}:{}", ip, port), "Main");
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT, http::header::CONTENT_TYPE])
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(redis.clone()))
            .app_data(web::Data::new(registry_arc.clone()))
            .app_data(web::Data::new(metrics_data.clone()))
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .wrap(MetricsMiddleware::new(metrics_data.clone()))
            .service(anilist_oauth)
            .service(viewer)
            .service(remove_user)
            .service(commands)
            .service(shards)
            .service(metrics_viewer)
            .service(statistics)
            .route("/sauce", web::post().to(FindSauce::route))
            .route("/random", web::post().to(Random::route))
            .route("/recommend", web::post().to(Recommend::route))
            .route("/watchlist", web::post().to(WatchList::route))
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
    .bind((ip, port))?
    .run()
    .await
}
