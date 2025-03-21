use std::sync::Arc;
use crate::entities::Entity;
use crate::global::queries::get_query;
use crate::structs::shared::{Avatar, Date, MediaNodes, Name};
use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use crate::global::metrics::Metrics;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Character {
    pub id:             i32,
    pub age:            Option<String>,
    pub description:    Option<String>,
    pub gender:         Option<String>,
    pub favourites:     Option<i32>,
    pub site_url:       Option<String>,
    pub image:          Avatar,
    pub name:           Name,
    pub date_of_birth:  Date,
    pub media:          MediaNodes,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormattedCharacter {
    pub id:                 i32,
    pub full_name:          Option<String>,
    pub native_name:        Option<String>,
    pub alternative_names:  Option<Vec<String>>,
    pub site_url:           Option<String>,
    pub favourites:         Option<i32>,
    pub image:              Option<String>,
    pub age:                Option<String>,
    pub gender:             Option<String>,
    pub date_of_birth:      String,
    pub media:              MediaNodes,
    pub description:        Option<String>,
}

#[derive(Deserialize)]
pub struct CharacterRequest {
    character_name: String
}

impl Entity<FormattedCharacter, CharacterRequest> for Character {
    fn entity_name() -> String {
        "Character".into()
    }

    async fn format(self, _request: &CharacterRequest, _metrics: web::Data<Arc<Metrics>>) -> Result<FormattedCharacter, HttpResponse> {
        Ok(FormattedCharacter {
            id:                 self.id,
            full_name:          self.name.full,
            native_name:        self.name.native,
            alternative_names:  self.name.alternative,
            site_url:           self.site_url,
            favourites:         self.favourites,
            image:              self.image.large,
            age:                self.age,
            gender:             self.gender,
            date_of_birth:      format!("{}/{}/{}", self.date_of_birth.day.unwrap_or_default(), self.date_of_birth.month.unwrap_or_default(), self.date_of_birth.year.unwrap_or_default()),
            media:              self.media,
            description:        self.description,
        })
    }

    fn cache_key(request: &CharacterRequest) -> String {
        format!("character:{}", request.character_name.to_lowercase())
    }

    fn query(request: &CharacterRequest) -> Value {
        json!({ "query": get_query("character"), "variables": { "search": request.character_name }})
    }

    fn validate_request(request: &CharacterRequest) -> Result<(), String> {
        if request.character_name.is_empty() {
            return Err("No character name was included".into());
        }

        Ok(())
    }
}
