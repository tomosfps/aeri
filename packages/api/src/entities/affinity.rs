use crate::client::client::Client;
use crate::entities::Entity;
use crate::global::pearson_correlation::pearson;
use crate::global::queries::{get_query, QUERY_URL};
use crate::structs::shared::{Avatar, MediaListStatus};
use actix_web::{web, HttpResponse};
use futures::future::join_all;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Arc;
use crate::global::metrics::Metrics;

#[derive(Deserialize)]
pub struct AffinityLists {
    pub entries:    Vec<AffinityListData>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AffinityListData {
    pub status:     Option<MediaListStatus>,
    pub score:      Option<i32>,
    pub media_id:   i32,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AffinityUser {
    pub name:       String,
    pub site_url:   Option<String>,
    pub avatar:     Option<Avatar>,
}

#[derive(Deserialize)]
pub struct Affinity {
    pub user:      AffinityUser,
    pub lists:     Option<Vec<AffinityLists>>,
}

#[derive(Deserialize)]
pub struct AffinityRequest {
    username: String,
    other_users: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct FormatAffinityData {
    user:       AffinityUser,
    affinity:   f64,
    count:      i32,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormattedAffinity {
    pub compared_against: AffinityUser,
    pub affinity: Vec<FormatAffinityData>,
}

impl Entity<FormattedAffinity, AffinityRequest> for Affinity {
    fn entity_name() -> String {
        "Affinity".into()
    }

    fn data_index() -> Vec<String> {
        vec!["data".into(), "MediaListCollection".into()]
    }

    async fn format(self, request: &AffinityRequest, metrics: web::Data<Arc<Metrics>>) -> Result<FormattedAffinity, HttpResponse> {
        let client = Client::new_proxied(metrics).await;

        let futures = request.other_users.iter().map(|user| {
            let mut client = client.clone();
            let request = AffinityRequest { username: user.clone(), other_users: vec![] };
            let query = Self::query(&request);
            let self_ref = &self;

            async move {
                let response = client.post(QUERY_URL, &query).await.unwrap();

                if response.status().as_u16() != 200 {
                    return Err(Client::error_response(response).await);
                }

                let data = match Self::parse_response(response).await {
                    Ok(data) => data,
                    Err(e) => return Err(HttpResponse::InternalServerError().json(json!({"error": e}))),
                };

                let (affinity, count) = compare_scores(self_ref, &data);

                Ok(FormatAffinityData {
                    user: data.user,
                    affinity,
                    count,
                })
            }
        });

        let results: Result<Vec<FormatAffinityData>, HttpResponse> = join_all(futures).await.into_iter().collect();
        let results = match results {
            Ok(results) => results,
            Err(err) => return Err(err),
        };

        Ok(FormattedAffinity {
            compared_against: self.user.clone(),
            affinity: results
        })
    }

    fn cache_key(request: &AffinityRequest) -> String {
        format!("affinity:{}", request.username.to_lowercase())
    }

    fn query(request: &AffinityRequest) -> Value {
        json!({ "query": get_query("affinity"), "variables": { "userName": request.username, "perChunk": 100, "type": "ANIME" }})
    }

    fn validate_request(request: &AffinityRequest) -> Result<(), String> {
        if request.other_users.is_empty() || request.username.is_empty() {
            return Err("No username or other users was included in the request".into());
        }

        Ok(())
    }
}

pub fn compare_scores(user: &Affinity, other_user: &Affinity) -> (f64, i32) {
    let mut user_scores_map: HashMap<i32, f64> = HashMap::new();
    let mut user_scores = Vec::new();
    let mut other_user_scores = Vec::new();

    let binding = Vec::new();
    let user_entries = user.lists.as_ref().unwrap_or(&binding).iter();
    let other_user_entries = other_user.lists.as_ref().unwrap_or(&binding).iter();

    for user_entry in user_entries {
        for media in &user_entry.entries {
            if !matches!(media.status.as_ref().unwrap_or(&MediaListStatus::Completed), &MediaListStatus::Planning | &MediaListStatus::Dropped | &MediaListStatus::Paused) {
                user_scores_map.insert(media.media_id, media.score.unwrap_or(0) as f64);
            }
        }
    }

    for other_user_entry in other_user_entries {
        for media in &other_user_entry.entries {
            if let Some(&user_score) = user_scores_map.get(&media.media_id) {
                user_scores.push(user_score);
                other_user_scores.push(media.score.unwrap_or(0) as f64);
            }
        }
    }

    if !user_scores.is_empty() && !other_user_scores.is_empty() {
        (pearson(&user_scores, &other_user_scores), user_scores.len() as i32)
    } else {
        (0.0, 0)
    }
}
