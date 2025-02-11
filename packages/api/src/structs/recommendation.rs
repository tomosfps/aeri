use super::shared::PageInfo;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct Recommendation {
    #[serde(rename = "pageInfo")]
    pub page_info:  PageInfo,
    pub media:      Vec<RecommendationMedia>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct RecommendationMedia {
    pub id:         i32,
}