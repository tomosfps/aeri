use crate::entities::Entity;
use crate::global::mutations::get_mutation;
use crate::structs::shared::{Title, MediaListStatus};
use actix_web::HttpResponse;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMediaMutation {
    pub repeat: u8,
    pub score: f64,
    pub progress: i64,
    pub status: MediaListStatus,
    pub media:  MediaUpdateData
}

#[derive(Serialize, Deserialize)]
pub struct MediaUpdateData {
    id:     i64,
    title:  Title
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormattedUpdateMedia {
    pub id:         i64,
    pub title:      Title,
    pub score:      f64,
    pub progress:   i64,
    pub repeats:    u8,
    pub status:     MediaListStatus,
}

#[derive(Deserialize)]
pub struct MutationMediaRequest {
    status:     MediaListStatus,
    score:      i64,
    progress:   i64,
    id:         i64,
    token:      String,
}

impl Entity<FormattedUpdateMedia, MutationMediaRequest> for UpdateMediaMutation {
    fn entity_name() -> String {
        "SaveMediaListEntry".into()
    }

    fn auth_required() -> bool {
        true
    }

    fn token(request: &MutationMediaRequest) -> Option<&str> {
        Some(&request.token)
    }

    fn data_index() -> Vec<String> {
        vec!["data".into(), Self::entity_name()]
    }

    async fn format(self, _request: &MutationMediaRequest) -> Result<FormattedUpdateMedia, HttpResponse> {
        Ok(FormattedUpdateMedia {
            id:         self.media.id,
            title:      self.media.title,
            score:      self.score,
            progress:   self.progress,
            status:     self.status,
            repeats:    self.repeat,
        })
    }

    fn cache_key(request: &MutationMediaRequest) -> String {
        format!("mutation:{}:{}:{}", request.id, request.progress, request.score)
    }

    fn query(request: &MutationMediaRequest) -> Value {
        json!({ "query": get_mutation("update_media"), "variables": { "status": request.status, "score": request.score, "progress": request.progress, "id": request.id } })
    }

    fn validate_request(request: &MutationMediaRequest) -> Result<(), String> {
        if request.token.is_empty() {
            return Err("No token was included in the request".into());
        }

        Ok(())
    }
}
