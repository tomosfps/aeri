use std::sync::Arc;
use crate::entities::Entity;
use crate::entities::format::watch_list_addon::{WatchListAddon, watch_list_addon};
use crate::global::queries::get_query;
use crate::structs::shared::{Avatar, MediaFormat, MediaListStatus, Title, Type};
use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use crate::global::metrics::Metrics;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WatchList {
    pub user:   WatchListUser,
    pub lists:  Vec<WatchListCollection>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WatchListUser {
    pub id:             Option<i32>,
    pub name:           Option<String>,
    pub avatar:         Avatar,
    pub banner_image:   Option<String>,
    pub site_url:       Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WatchListCollection {
    pub status:     MediaListStatus,
    pub entries:    Vec<WatchListEntry>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WatchListEntry {
    pub media:  Media,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Media {
    pub id:         i32,
    pub title:      Title,
    pub format:     MediaFormat,
    pub site_url:   Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct FormattedWatchList {
    pub user:       WatchListUser,
    pub list:       Vec<WatchListAddon>
}

#[derive(Deserialize)]
pub struct UserRequest {
    username:   String,
    r#type:     Type,
    status:     MediaListStatus,
}

impl Entity<FormattedWatchList, UserRequest> for WatchList {
    fn entity_name() -> String {
        "MediaListCollection".into()
    }

    async fn format(self, _request: &UserRequest, _metrics: web::Data<Arc<Metrics>>) -> Result<FormattedWatchList, HttpResponse> {
        let addon = watch_list_addon(&self, _request.status);

        Ok(FormattedWatchList {
            user: self.user,
            list: addon.lists,
        })
    }

    fn cache_key(request: &UserRequest) -> String {
        format!("watchlist:{}:{:?}:{:?}", request.username.to_lowercase(), request.status, request.r#type)
    }

    fn query(request: &UserRequest) -> Value {
        json!({ "query": get_query("user_list"), "variables": { "userName": request.username, "type": request.r#type, "status": request.status } })
    }

    fn validate_request(request: &UserRequest) -> Result<(), String> {
        if request.username.is_empty() {
            return Err("No username name was included".into());
        }

        Ok(())
    }
}
