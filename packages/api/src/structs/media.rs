use super::shared::{Date, Title, MediaCoverImage, AiringSchedule};
use serde::{Serialize, Deserialize};

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Media {
    pub id:              i32,
    pub season:          Option<String>,
    pub format:          Option<String>,
    pub episodes:        Option<i32>,
    pub chapters:        Option<i32>,
    pub volumes:         Option<i32>,
    pub duration:        Option<i32>,
    pub status:          Option<String>,
    pub genres:          Option<Vec<String>>,
    #[serde(rename = "averageScore")]
    pub average_score:   Option<i32>,
    #[serde(rename = "meanScore")]
    pub mean_score:      Option<i32>,
    pub popularity:      Option<i32>,
    #[serde(rename = "siteUrl")]
    pub site_url:        Option<String>,
    pub favourites:      Option<i32>,
    #[serde(rename = "bannerImage")]
    pub banner_image:    Option<String>,
    #[serde(rename = "startDate")]
    pub start_date:      Date,
    #[serde(rename = "endDate")]
    pub end_date:        Date,
    #[serde(rename = "airingSchedule")]
    pub airing_schedule: Option<AiringSchedule>,
    #[serde(rename = "coverImage")]
    pub cover_image:     MediaCoverImage,
    pub title:           Title,
}