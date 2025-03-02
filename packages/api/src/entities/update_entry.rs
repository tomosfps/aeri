use std::sync::Arc;
use crate::entities::Entity;
use crate::global::mutations::get_mutation;
use crate::structs::shared::{Title, MediaListStatus, DataFrom};
use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use crate::cache::redis::Redis;
use crate::global::metrics::Metrics;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMediaMutation {
    pub repeat:     u8,
    pub score:      f32,
    pub progress:   i32,
    pub status:     MediaListStatus,
    pub media:      MediaUpdateData
}

#[derive(Serialize, Deserialize)]
pub struct MediaUpdateData {
    id:     i32,
    title:  Title
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormattedUpdateMedia {
    pub id:         i32,
    pub title:      Title,
    pub score:      f32,
    pub progress:   i32,
    pub repeats:    u8,
    pub status:     MediaListStatus,
}

#[derive(Deserialize)]
pub struct MutationMediaRequest {
    status:     MediaListStatus,
    score:      i32,
    progress:   i32,
    id:         i32,
}

impl Entity<FormattedUpdateMedia, MutationMediaRequest> for UpdateMediaMutation {
    fn entity_name() -> String {
        "SaveMediaListEntry".into()
    }

    fn data_index() -> Vec<String> {
        vec!["data".into(), Self::entity_name()]
    }

    async fn format(self, _request: &MutationMediaRequest, _metrics: web::Data<Arc<Metrics>>) -> Result<FormattedUpdateMedia, HttpResponse> {
        Ok(FormattedUpdateMedia {
            id:         self.media.id,
            title:      self.media.title,
            score:      self.score,
            progress:   self.progress,
            status:     self.status,
            repeats:    self.repeat,
        })
    }

    fn auth_required() -> bool {
        true
    }

    fn cache_key(_request: &MutationMediaRequest) -> String {
        String::new()
    }

    async fn cache_get(_request: &MutationMediaRequest, _redis: &web::Data<Redis>) -> Option<(FormattedUpdateMedia, DataFrom)> {
        None
    }

    async fn cache_set(_data: &FormattedUpdateMedia, _request: &MutationMediaRequest, _redis: &web::Data<Redis>) { }

    fn query(request: &MutationMediaRequest) -> Value {
        json!({ "query": get_mutation("update_media"), "variables": { "status": request.status, "score": request.score, "progress": request.progress, "id": request.id } })
    }

    fn validate_request(_request: &MutationMediaRequest) -> Result<(), String> {
        Ok(())
    }
}
