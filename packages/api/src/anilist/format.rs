use crate::structs::affinity::Affinity;
use colourful_logger::Logger;
use lazy_static::lazy_static;
use serde_json::json;

lazy_static! {
    static ref logger: Logger = Logger::default();
}

pub async fn format_affinity_data(affinity_data: &Affinity, affinity: &f64, total_count: &i32) -> serde_json::Value {
    let data = affinity_data.clone();

    let washed_data = json!({
        "user":         data.user,
        "count":        total_count,
        "affinity":     (affinity * 100.0).clamp(0.0, 100.0),
    });
    washed_data
}

pub async fn format_main_affinity(affinity_data: &Affinity) -> serde_json::Value {
    let data = affinity_data.clone();

    let washed_data = json!({
        "user":         data.user,
    });
    washed_data
}