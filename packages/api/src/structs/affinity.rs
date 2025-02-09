use super::shared::Avatar;
use serde::{Serialize, Deserialize};

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct AffinityLists {
    pub entries:    Vec<AffinityListData>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct AffinityListData {
    pub status:     Option<String>,
    pub score:      Option<i32>,
    #[serde(rename = "mediaId")]
    pub media_id:   i32,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct AffinityUser {
    pub name:       String,
    #[serde(rename = "siteUrl")]
    pub site_url:   Option<String>,
    pub avatar:     Option<Avatar>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Affinity {
    pub user:      Option<AffinityUser>,
    pub lists:     Option<Vec<AffinityLists>>,
}