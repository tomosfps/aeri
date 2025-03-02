use std::sync::Arc;
use actix_web::{get, web, HttpResponse, Responder};
use prometheus_client::encoding::text::encode;
use prometheus_client::registry::Registry;

#[get("/metrics")]
async fn metrics(metrics_registry: web::Data<Arc<Registry>>) -> impl Responder {
    let mut buffer = String::new();
    encode(&mut buffer, metrics_registry.as_ref()).unwrap();

    HttpResponse::Ok().content_type("text/plain").body(buffer)
}