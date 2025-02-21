use crate::anilist::queries::get_query;
use crate::entities::traits::Entity;
use crate::structs::shared::MediaNodes;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Studio {
    pub id:                     i32,
    pub is_animation_studio:    bool,
    pub name:                   String,
    pub site_url:               String,
    pub favourites:             i32,
    pub media:                  MediaNodes,
}

#[derive(Deserialize)]
pub struct StudioRequest {
    pub studio_name:            String,
}

impl Entity<Studio, StudioRequest> for Studio {
    fn entity_name() -> String {
        "Studio".into()
    }

    fn format(self, _request: &StudioRequest) -> Studio {
        self
    }

    fn cache_key(request: &StudioRequest) -> String {
        format!("studio:{}", request.studio_name)
    }

    fn query(request: &StudioRequest) -> Value {
        json!({ "query": get_query("studio"), "variables": { "search": request.studio_name }})
    }

    fn validate_request(request: &StudioRequest) -> Result<(), String> {
        if request.studio_name.len() == 0 {
            return Err("No studio name was included".into());
        }

        Ok(())
    }
}
