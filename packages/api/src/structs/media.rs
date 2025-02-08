use super::shared::{Date, Title, CoverImage, AiringSchedule};
use serde::{Serialize, Deserialize};

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Media {
    pub id:              Option<i32>,
    pub season:          Option<String>,
    pub format:          Option<String>,
    pub episodes:        Option<i32>,
    pub chapters:        Option<i32>,
    pub volumes:         Option<i32>,
    pub duration:        Option<i32>,
    pub description:     Option<String>,
    pub status:          Option<String>,
    pub genres:          Option<Vec<String>>,
    pub average_score:   Option<f32>,
    pub mean_score:      Option<f32>,
    pub popularity:      Option<i32>,
    pub site_url:        Option<String>,
    pub favourites:      Option<i32>,
    pub banner_image:    Option<String>,
    pub start_date:      Option<Date>,
    pub end_date:        Option<Date>,
    pub airing_schedule: Option<AiringSchedule>,
    pub cover_image:     Option<CoverImage>,
    pub title:           Option<Title>,
}