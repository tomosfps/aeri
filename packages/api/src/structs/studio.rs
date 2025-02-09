use super::shared::MediaNodes;
use serde::{Serialize, Deserialize};

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Studio {
    pub id:             i32,
    #[serde(rename = "isAnimationStudio")]
    pub is_animation:   bool,
    pub name:           String,
    #[serde(rename = "siteUrl")]
    pub site_url:       String,
    pub favourites:     i32,
    pub media:          MediaNodes,
}