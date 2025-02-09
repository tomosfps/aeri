use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct MediaCoverImage {
    #[serde(rename = "extraLarge")]
    pub extra_large: Option<String>,
    pub large:       Option<String>,
    pub medium:      Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Avatar {
    pub large:      Option<String>,
    pub medium:     Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct AiringSchedule {
    pub nodes: Option<Vec<AiringScheduleNode>>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct AiringScheduleNode {
    #[serde(rename = "timeUntilAiring")]
    pub time_until_airing:  i32,
    pub episode:            i32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Title {
    pub romaji:  Option<String>,
    pub native:  Option<String>,
    pub english: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Name {
    pub full:        Option<String>,
    pub native:      Option<String>,
    pub first:       Option<String>,
    pub last:        Option<String>,
    pub middle:      Option<String>,
    pub alternative: Option<Vec<String>>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Date {
    pub year:   Option<i32>,
    pub month:  Option<i32>,
    pub day:    Option<i32>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct MediaNodes {
    pub nodes: Vec<MediaNodeData>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct MediaNodeData {
    pub id:         i32,
    #[serde(rename = "siteUrl")]
    pub site_url:   Option<String>,
    pub title:      Option<Title>,
    pub format:     Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct StaffNodes {
    pub nodes: Vec<StaffNodeData>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct StaffNodeData {
    pub id:         i32,
    #[serde(rename = "siteUrl")]
    pub site_url:   Option<String>,
    pub title:      Option<Title>,
    pub format:     Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Statistics {
    pub anime:  AnimeStatistics,
    pub manga:  MangaStatistics,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct AnimeStatistics {
    pub count:              i32,
    #[serde(rename = "meanScore")]
    pub mean:               f32,
    #[serde(rename = "minutesWatched")]
    pub minutes_watched:    i32,
    #[serde(rename = "episodesWatched")]
    pub episodes_watched:   i32,
    pub scores:             Vec<ScoreDistribution>,
    pub genres:             Vec<GenreDistribution>,
    pub formats:            Vec<AnimeFormatDistribution>,
    pub statuses:           Vec<AnimeStatusDistribution>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct AnimeFormatDistribution {
    pub format: String,
    pub count:  i32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct AnimeStatusDistribution {
    pub status:     String,
    #[serde(rename = "meanScore")]
    pub mean_score: f32,
    pub count:      i32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct MangaStatistics {
    pub count:              i32,
    #[serde(rename = "meanScore")]
    pub mean:               f32,
    #[serde(rename = "chaptersRead")]
    pub chapters_read:      i32,
    #[serde(rename = "volumesRead")]
    pub volumes_read:       i32,
    pub scores:             Vec<ScoreDistribution>,
    pub genres:             Vec<GenreDistribution>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ScoreDistribution {
    pub score:      i32,
    pub count:      i32,
    #[serde(rename = "mediaIds")]
    pub media_ids:  Vec<i32>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct GenreDistribution {
    pub genre:           String,
    pub count:           i32,
    #[serde(rename = "meanScore")]
    pub mean_score:      f32,
    #[serde(rename = "minutesWatched")]
    pub minutes_watched: i32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct PageInfo {
    pub total:      Option<i32>,
    #[serde(rename = "perPage")]
    pub per_page:   Option<i32>,
    pub current:    Option<i32>,
    #[serde(rename = "lastPage")]
    pub last_page:  Option<i32>,
    #[serde(rename = "hasNext")]
    pub has_next:   Option<bool>,
}
