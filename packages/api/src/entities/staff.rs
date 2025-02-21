use crate::anilist::queries::get_query;
use crate::entities::traits::Entity;
use crate::structs::shared::{Avatar, Date, Name, StaffNodes};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Staff {
    pub id:             i32,
    pub age:            Option<i32>,
    pub gender:         Option<String>,
    pub favourites:     Option<i32>,
    pub home_town:      Option<String>,
    pub image:          Avatar,
    pub name:           Name,
    pub date_of_birth:  Date,
    pub date_of_death:  Date,
    pub language_v2:    Option<String>,
    pub site_url:       Option<String>,
    pub staff_media:    StaffNodes,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FormattedStaff {
    pub id:             i32,
    pub age:            Option<i32>,
    pub gender:         Option<String>,
    pub home_town:      Option<String>,
    pub favourites:     Option<i32>,
    pub language:       Option<String>,
    pub full_name:      Option<String>,
    pub native_name:    Option<String>,
    pub date_of_birth:  String,
    pub date_of_death:  String,
    pub site_url:       Option<String>,
    pub image:          Option<String>,
    pub staff_data:     StaffNodes,
}

#[derive(Deserialize)]
pub struct StaffRequest {
    staff_name: String,
    media_type: Option<String>,
}

impl Entity<FormattedStaff, StaffRequest> for Staff {
    fn entity_name() -> String {
        "Staff".into()
    }

    fn data_index() -> Vec<String> {
        vec!["data".into(), "Page".into(), Self::entity_name().to_lowercase(), "0".into()]
    }

    fn format(self, _request: &StaffRequest) -> FormattedStaff {
        FormattedStaff {
            id: self.id,
            age: self.age,
            gender: self.gender,
            home_town: self.home_town,
            favourites: self.favourites,
            language: self.language_v2,
            full_name: self.name.full,
            native_name: self.name.native,
            date_of_birth: format!("{}/{}/{}", self.date_of_birth.day.unwrap_or_else(|| 0), self.date_of_birth.month.unwrap_or_else(|| 0), self.date_of_birth.year.unwrap_or_else(|| 0)),
            date_of_death: format!("{}/{}/{}", self.date_of_death.day.unwrap_or_else(|| 0), self.date_of_death.month.unwrap_or_else(|| 0), self.date_of_death.year.unwrap_or_else(|| 0)),
            site_url: self.site_url,
            image: self.image.large,
            staff_data: self.staff_media,
        }
    }

    fn cache_key(request: &StaffRequest) -> String {
        format!("staff:{}", request.staff_name)
    }

    fn query(request: &StaffRequest) -> Value {
        if request.media_type.is_none() {
            json!({"query": get_query("staff"),"variables": { "search": request.staff_name } })
        } else {
            json!({"query": get_query("staff"),"variables": { "search": request.staff_name, "mediaType": request.media_type.clone().unwrap()}})
        }
    }

    fn validate_request(request: &StaffRequest) -> Result<(), String> {
        if request.staff_name.len() == 0 {
            return Err("No staff name was included".into());
        }

        Ok(())
    }
}
