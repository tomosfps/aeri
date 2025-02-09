use super::shared::{Date, Avatar, Name, StaffNodes};
use serde::{Serialize, Deserialize};

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Staff {
    pub id:             i32,
    pub age:            Option<i32>,
    pub gender:         Option<String>,
    pub favourites:     Option<i32>,
    #[serde(rename = "homeTown")]
    pub home_town:      Option<String>,
    pub image:          Avatar,
    pub name:           Name,
    #[serde(rename = "dateOfBirth")]
    pub date_of_birth:  Date,
    #[serde(rename = "dateOfDeath")]
    pub date_of_death:  Date,
    #[serde(rename = "languageV2")]
    pub language:       Option<String>,
    #[serde(rename = "siteUrl")]
    pub site_url:       Option<String>,
    #[serde(rename = "staffMedia")]
    pub staff_media:    StaffNodes,
}