use crate::entities::Entity;
use crate::global::queries::get_query;
use crate::structs::shared::{AiringSchedule, Date, MediaCoverImage, MediaFormat, MediaStatus, Title};
use actix_web::HttpResponse;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Media {
    pub id:              i32,
    pub season:          Option<String>,
    pub format:          Option<MediaFormat>,
    pub episodes:        Option<i32>,
    pub chapters:        Option<i32>,
    pub volumes:         Option<i32>,
    pub duration:        Option<i32>,
    pub status:          Option<MediaStatus>,
    pub genres:          Option<Vec<String>>,
    pub average_score:   Option<i32>,
    pub mean_score:      Option<i32>,
    pub popularity:      Option<i32>,
    pub site_url:        Option<String>,
    pub favourites:      Option<i32>,
    pub banner_image:    Option<String>,
    pub start_date:      Date,
    pub end_date:        Date,
    pub airing_schedule: Option<AiringSchedule>,
    pub cover_image:     MediaCoverImage,
    pub title:           Title,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormattedMedia {
    pub id:              i32,
    pub title:           Title,
    pub airing:          Option<AiringSchedule>,
    pub season:          Option<String>,
    pub average_score:   Option<i32>,
    pub mean_score:      Option<i32>,
    pub banner:          Option<String>,
    pub cover:           Option<String>,
    pub duration:        Option<i32>,
    pub episodes:        Option<i32>,
    pub chapters:        Option<i32>,
    pub volumes:         Option<i32>,
    pub format:          Option<MediaFormat>,
    pub genres:          Option<Vec<String>>,
    pub popularity:      Option<i32>,
    pub favourites:      Option<i32>,
    pub status:          Option<MediaStatus>,
    pub site_url:        Option<String>,
    pub end_date:        String,
    pub start_date:      String,
}

#[derive(Deserialize)]
pub struct MediaRequest {
    media_id:   i32,
    media_type: String,
}

impl Entity<FormattedMedia, MediaRequest> for Media {
    fn entity_name() -> String {
        "Media".into()
    }

    async fn format(self, _request: &MediaRequest) -> Result<FormattedMedia, HttpResponse> {
        Ok(FormattedMedia {
            id: self.id,
            title: self.title,
            airing: self.airing_schedule,
            season: self.season,
            average_score: self.average_score,
            mean_score: self.mean_score,
            banner: self.banner_image,
            cover: self.cover_image.extra_large,
            duration: self.duration,
            episodes: self.episodes,
            chapters: self.chapters,
            volumes: self.volumes,
            format: self.format,
            genres: self.genres,
            popularity: self.popularity,
            favourites: self.favourites,
            status: self.status,
            site_url: self.site_url,
            end_date: format!("{}/{}/{}", self.end_date.day.unwrap_or_default(), self.end_date.month.unwrap_or_default(), self.end_date.year.unwrap_or_default()),
            start_date: format!("{}/{}/{}", self.start_date.day.unwrap_or_default(), self.start_date.month.unwrap_or_default(), self.start_date.year.unwrap_or_default()),
        })
    }

    fn cache_time(data: &FormattedMedia) -> u64 {
        data.airing
            .as_ref()
            .and_then(|airing| airing.nodes.as_ref())
            .and_then(|nodes| nodes.first())
            .map_or(86400, |next_airing| next_airing.time_until_airing as u64)
    }

    fn cache_key(request: &MediaRequest) -> String {
        format!("media:{}:{}", request.media_type, request.media_id)
    }

    fn query(request: &MediaRequest) -> Value {
        json!({ "query": get_query("search"), "variables": { "id": request.media_id, "type": request.media_type.to_uppercase() }})
    }

    fn validate_request(request: &MediaRequest) -> Result<(), String> {
        if request.media_type.is_empty() || request.media_id == 0 {
            return Err("No Media Type or ID was included".into());
        }

        Ok(())
    }
}
