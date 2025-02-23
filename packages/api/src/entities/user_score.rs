use crate::entities::Entity;
use crate::global::queries::get_query;
use crate::structs::shared::MediaListStatus;
use actix_web::HttpResponse;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserScore {
    pub id:                 i64,
    pub progress_volumes:   Option<i32>,
    pub progress:           Option<i32>,
    pub score:              Option<i32>,
    pub status:             Option<MediaListStatus>,
    pub repeat:             Option<i32>,
    pub user:               UserScoresName,
}

#[derive(Serialize, Deserialize)]
pub struct UserScoresName {
    pub name:   String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormattedUserScore {
    pub id:                 i64,
    pub volumes:            Option<i32>,
    pub progress:           Option<i32>,
    pub score:              Option<i32>,
    pub status:             Option<MediaListStatus>,
    pub repeat:             Option<i32>,
    pub username:           String,
}

#[derive(Deserialize)]
pub struct UserScoreRequest {
    user_id: i64,
    media_id: i64,
}

impl Entity<FormattedUserScore, UserScoreRequest> for UserScore {
    fn entity_name() -> String {
        "UserScore".into()
    }

    fn data_index() -> Vec<String> {
        vec!["data".into(), "MediaList".into()]
    }

    async fn format(self, _request: &UserScoreRequest) -> Result<FormattedUserScore, HttpResponse> {
        Ok(FormattedUserScore {
            id: self.id,
            volumes: self.progress_volumes,
            progress: self.progress,
            score: self.score,
            status: self.status,
            repeat: self.repeat,
            username: self.user.name,
        })
    }

    fn cache_key(request: &UserScoreRequest) -> String {
        format!("score:{}:{}", request.media_id, request.user_id)
    }

    fn query(request: &UserScoreRequest) -> Value {
        json!({ "query": get_query("user_scores"), "variables": { "userId": request.user_id, "mediaId": request.media_id }})
    }

    fn validate_request(request: &UserScoreRequest) -> Result<(), String> {
        if request.user_id == 0 || request.media_id == 0 {
            return Err("No user id or media id was included".into());
        }

        Ok(())
    }
}
