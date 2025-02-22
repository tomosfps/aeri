use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Default, Clone, Copy)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum MediaFormat {
    Tv,
    TvShort,
    Movie,
    Special,
    Ova,
    Ona,
    Music,
    Manga,
    Novel,
    OneShot,
    #[default]
    Unknown,
}

#[derive(Deserialize, Serialize, Default, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum MediaListStatus {
    Current,
    Planning,
    Completed,
    Dropped,
    Paused,
    Repeating,
    #[default]
    Unknown,
}

#[derive(Deserialize, Serialize, Default, Clone, Copy)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum MediaStatus {
    Finished,
    Releasing,
    NotYetReleased,
    Cancelled,
    Hiatus,
    #[default]
    Unknown,
}

#[derive(Deserialize, Serialize, Default, Clone, Copy)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum Type {
    #[default]
    Anime,
    Manga,
}

#[derive(Deserialize, Serialize)]
pub struct Favourites {
    pub anime:  MediaNodes,
    pub manga:  MediaNodes,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaCoverImage {
    pub extra_large: Option<String>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Avatar {
    pub large:      Option<String>,
    pub medium:     Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct AiringSchedule {
    pub nodes: Option<Vec<AiringScheduleNode>>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AiringScheduleNode {
    pub time_until_airing:  i32,
    pub episode:            i32,
}

#[derive(Deserialize, Serialize)]
pub struct Title {
    pub romaji:  Option<String>,
    pub native:  Option<String>,
    pub english: Option<String>,
}

#[derive(Deserialize)]
pub struct Name {
    pub full:        Option<String>,
    pub native:      Option<String>,
    pub alternative: Option<Vec<String>>,
}

#[derive(Deserialize)]
pub struct Date {
    pub year:   Option<i32>,
    pub month:  Option<i32>,
    pub day:    Option<i32>,
}

#[derive(Deserialize, Serialize)]
pub struct MediaNodes {
    pub nodes: Vec<MediaNodeData>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaNodeData {
    pub id:         Option<i32>,
    pub site_url:   Option<String>,
    pub title:      Option<Title>,
    pub format:     Option<MediaFormat>,
}

#[derive(Deserialize, Serialize)]
pub struct StaffNodes {
    pub nodes: Vec<StaffNodeData>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StaffNodeData {
    pub id:         i32,
    pub site_url:   Option<String>,
    pub title:      Option<Title>,
    pub format:     Option<MediaFormat>,
}

#[derive(Deserialize, Serialize)]
pub struct Statistics {
    pub anime:  AnimeStatistics,
    pub manga:  MangaStatistics,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AnimeStatistics {
    pub count:              i32,
    pub mean_score:         f32,
    pub minutes_watched:    i32,
    pub episodes_watched:   i32,
    pub scores:             Vec<ScoreDistribution>,
    pub genres:             Vec<GenreDistribution>,
    pub formats:            Vec<AnimeFormatDistribution>,
    pub statuses:           Vec<AnimeStatusDistribution>,
}

#[derive(Deserialize, Serialize)]
pub struct AnimeFormatDistribution {
    pub format: MediaFormat,
    pub count:  i32,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AnimeStatusDistribution {
    pub status:     MediaListStatus,
    pub mean_score: f32,
    pub count:      i32,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MangaStatistics {
    pub count:              i32,
    pub mean_score:         f32,
    pub chapters_read:      i32,
    pub volumes_read:       i32,
    pub scores:             Vec<ScoreDistribution>,
    pub genres:             Vec<GenreDistribution>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScoreDistribution {
    pub score:      i32,
    pub count:      i32,
    pub media_ids:  Vec<i32>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[derive(Clone)]
pub struct GenreDistribution {
    pub genre:           String,
    pub count:           i32,
    pub mean_score:      f32,
    pub minutes_watched: i32,
    pub chapters_read:   i32,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PageInfo {
    pub last_page:  Option<i32>,
}

pub enum DataFrom {
    Api,
    Cache(i64),
}
