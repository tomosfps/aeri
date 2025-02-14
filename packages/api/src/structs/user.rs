use super::shared::{Avatar, Favourites, Statistics};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct User {
    pub id:             Option<i32>,
    pub name:           Option<String>,
    #[serde(rename = "siteUrl")]
    pub site_url:       Option<String>,
    pub updated_at:     Option<String>,
    #[serde(rename = "bannerImage")]
    pub banner_image:   Option<String>,
    pub about:          Option<String>,
    pub avatar:         Avatar,
    pub favourites:     Favourites,
    pub statistics:     Statistics,
}