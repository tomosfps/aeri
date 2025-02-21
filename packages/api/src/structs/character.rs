use super::shared::{Avatar, Date, MediaNodes, Name};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Character {
    pub id:             i32,
    pub age:            Option<String>,
    pub description:    Option<String>,
    pub gender:         Option<String>,
    pub favourites:     Option<i32>,
    #[serde(rename = "siteUrl")]
    pub site_url:       Option<String>,
    pub image:          Avatar,
    pub name:           Name,
    #[serde(rename = "dateOfBirth")]
    pub date_of_birth:  Date,
    pub media:          MediaNodes,
}
