use crate::structs::{affinity::Affinity, media::Media};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use serde_json::json;

lazy_static! {
    static ref logger: Logger = Logger::default();
}

pub async fn format_media_data(media_data: Media) -> serde_json::Value {
    let data = media_data.clone();

    let washed_data: serde_json::Value = json!({
        "id"            : data.id,
        "title"         : data.title,
        "airing"        : data.airing_schedule,
        "averageScore"  : data.average_score,
        "meanScore"     : data.mean_score,
        "banner"        : data.banner_image,
        "cover"         : data.cover_image.extra_large,
        "duration"      : data.duration,
        "episodes"      : data.episodes,
        "chapters"      : data.chapters,
        "volumes"       : data.volumes,
        "format"        : data.format,
        "genres"        : data.genres,
        "popularity"    : data.popularity,
        "favourites"    : data.favourites,
        "status"        : data.status,
        "siteUrl"       : data.site_url,
        "endDate"       : format!("{}/{}/{}", data.end_date.day.unwrap_or_else( || 0), data.end_date.month.unwrap_or_else( || 0), data.end_date.year.unwrap_or_else( || 0)),
        "startDate"     : format!("{}/{}/{}", data.start_date.day.unwrap_or_else( || 0), data.start_date.month.unwrap_or_else( || 0), data.start_date.year.unwrap_or_else( || 0)),
        "dataFrom"      : "API",
    });
    washed_data
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