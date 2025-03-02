use std::sync::Arc;
use crate::client::client::Client;
use crate::global::queries::{get_query, QUERY_URL};
use crate::structs::oauth::Viewer;
use actix_web::{post, web, HttpRequest, HttpResponse, Responder};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use serde_json::{json, Value};
use crate::global::metrics::Metrics;

lazy_static! {
    static ref logger: Logger = Logger::default();
}

#[post("/viewer")]
async fn viewer(req: HttpRequest, metrics: web::Data<Arc<Metrics>>) -> impl Responder {
    let auth = req.headers().get("Authorization");

    let auth = match auth {
        Some(auth) => auth,
        None => {
            return HttpResponse::Unauthorized().json(json!({
                "error": "No Authorization header was included"
            }));
        }
    };

    let auth = auth.to_str().unwrap();

    if auth.is_empty() {
        return HttpResponse::Unauthorized().json(json!({
            "error": "No Authorization header was included"
        }));
    }

    let mut client = Client::new_proxied(metrics).await;
    let json = json!({"query": get_query("viewer")});
    let response = client.post_with_auth(QUERY_URL, &json, auth).await.unwrap();

    if response.status().as_u16() != 200 { return Client::error_response(response).await; }

    let response: Value = response.json().await.unwrap();

    let user: Viewer  = match serde_json::from_value(response["data"]["Viewer"].clone()) {
        Ok(user) => user,
        Err(err) => {
            logger.error_single(&format!("Error parsing user: {}", err), "User");
            return HttpResponse::InternalServerError().json(json!({"error": "Failed to parse user"}));
        }
    };

    HttpResponse::Ok().json(user)
}
