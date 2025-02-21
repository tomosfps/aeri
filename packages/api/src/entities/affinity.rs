use crate::anilist::queries::get_query;
use crate::entities::traits::Entity;
use crate::format::affinity_func::compare_scores;
use crate::structs::shared::{MediaListStatus, Avatar};
use futures::future::join_all;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

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
    pub user:      Option<AffinityUser>,
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
    compared_to: AffinityUser,
}

#[derive(Serialize, Deserialize)]
pub struct FormatAffinity {
    pub affinity: Vec<FormatAffinityData>,
}

impl Entity<FormatAffinity, AffinityRequest> for Affinity {
    fn entity_name() -> String {
        "Studio".into()
    }

    async fn format(self, request: &AffinityRequest) -> FormatAffinity {
        let self_clone = &self;
        let futures = request.other_users.iter().map(move |user| {
            let self_clone = self_clone.clone();
            async move {
                let (affinity, count) = compare_scores(self_clone, self_clone);

                let compared_to = AffinityUser {
                    name: user.clone(),
                    site_url: None,
                    avatar: None,
                };
                
                FormatAffinityData {
                    user: self_clone.user.as_ref().unwrap().clone(),
                    affinity,
                    count,
                    compared_to,
                }
            }
        });

        let results: Vec<FormatAffinityData> = join_all(futures).await;
        FormatAffinity { affinity: results }
    

    }

    fn cache_key(request: &AffinityRequest) -> String {
        format!("affinity:{}", request.username.to_lowercase())
    }

    fn query(request: &AffinityRequest) -> Value {
        json!({ "query": get_query("affinity"), "variables": { "userName": request.username, "perChunk": 100, "type": "ANIME" }})
    }

    fn validate_request(request: &AffinityRequest) -> Result<(), String> {
        if request.other_users.len() == 0 || request.username.is_empty() {
            return Err("No username or other users was included in the request".into());
        }

        Ok(())
    }
}
