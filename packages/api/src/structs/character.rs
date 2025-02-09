use super::shared::{MediaNodes, Avatar, Name, Date};
use serde::{Serialize, Deserialize};

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Character {
    pub id:             Option<i32>,
    pub age:            Option<String>,
    pub description:    Option<String>,
    pub gender:         Option<String>,
    pub favourites:     Option<i32>,
    #[serde(rename = "siteUrl")]
    pub site_url:       Option<String>,
    pub image:          Option<Avatar>,
    pub name:           Option<Name>,
    #[serde(rename = "dateOfBirth")]
    pub date_of_birth:  Option<Date>,
    pub media:          Option<MediaNodes>,
}