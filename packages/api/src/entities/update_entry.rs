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
    pub repeat:     Option<u8>,
    pub score:      Option<f32>,
    pub progress:   Option<i32>,
    pub status:     Option<MediaListStatus>,
    pub media:      Option<MediaUpdateData>,
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
    status:     Option<MediaListStatus>,
    score:      Option<i32>,
    progress:   Option<i32>,
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
        let media = self.media.unwrap();

        Ok(FormattedUpdateMedia {
            id:         media.id,
            title:      media.title,
            score:      self.score.unwrap_or(0.0),
            progress:   self.progress.unwrap_or(0),
            status:     self.status.unwrap_or(MediaListStatus::Current),
            repeats:    self.repeat.unwrap_or(0),
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
        let mut variables = serde_json::Map::new();
        variables.insert("id".to_string(), request.id.to_string().into());
        
        if let Some(status) = &request.status {
            variables.insert("status".to_string(), json!(status));
        }
        
        if let Some(score) = &request.score {
            variables.insert("score".to_string(), json!(score));
        }
        
        if let Some(progress) = &request.progress {
            variables.insert("progress".to_string(), json!(progress));
        }
        
        json!({
            "query": get_mutation("update_media"),
            "variables": variables
        })
    }

    fn validate_request(_request: &MutationMediaRequest) -> Result<(), String> {
        Ok(())
    }
}
