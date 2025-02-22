use super::shared::PageInfo;
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Recommendation {
    pub page_info:  PageInfo,
    pub media:      Vec<RecommendationMedia>,
}

#[derive(Deserialize)]
pub struct RecommendationMedia {
    pub id:         i32,
}
