use crate::entities::format::user_addon::user_addon;
use crate::entities::Entity;
use crate::global::queries::get_query;
use crate::structs::shared::{Avatar, Favourites, MediaFormat, Statistics};
use actix_web::HttpResponse;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id:             Option<i32>,
    pub name:           Option<String>,
    pub site_url:       Option<String>,
    pub updated_at:     Option<i32>,
    pub banner_image:   Option<String>,
    pub about:          Option<String>,
    pub avatar:         Avatar,
    pub favourites:     Favourites,
    pub statistics:     Statistics,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormattedUser {
    pub id:                 Option<i32>,
    pub name:               Option<String>,
    pub avatar:             Option<String>,
    pub banner_image:       Option<String>,
    pub about:              Option<String>,
    pub site_url:           Option<String>,
    pub updated_at:         Option<i32>,
    pub favourites:         Favourites,
    pub statistics:         Statistics,
    pub total_entries:      i32,
    pub top_genre:          String,
    pub top_format:         MediaFormat,
    pub completion_rate:    i64,
}

#[derive(Deserialize)]
pub struct UserRequest {
    username: String,
}

impl Entity<FormattedUser, UserRequest> for User {
    fn entity_name() -> String {
        "User".into()
    }

    async fn format(self, _request: &UserRequest) -> Result<FormattedUser, HttpResponse> {
        let addon = user_addon(&self);

        Ok(FormattedUser {
            id: self.id,
            name: self.name,
            avatar: self.avatar.large,
            banner_image: self.banner_image,
            about: self.about,
            site_url: self.site_url,
            updated_at: self.updated_at,
            favourites: self.favourites,
            statistics: self.statistics,
            total_entries: addon.total_entries,
            top_genre: addon.top_genre,
            top_format: addon.top_format,
            completion_rate: addon.completion_rate,
        })
    }

    fn cache_key(request: &UserRequest) -> String {
        format!("user:{}", request.username.to_lowercase())
    }

    fn query(request: &UserRequest) -> Value {
        json!({ "query": get_query("user"), "variables": { "name": request.username }})
    }

    fn validate_request(request: &UserRequest) -> Result<(), String> {
        if request.username.is_empty() {
            return Err("No username name was included".into());
        }

        Ok(())
    }
}
