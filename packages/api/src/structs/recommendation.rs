use super::shared::{PageInfo, MediaNodes};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct Recommendation {
    #[serde(rename = "pageInfo")]
    pub page_info:  PageInfo,
    pub media:      Vec<MediaNodes>,
}