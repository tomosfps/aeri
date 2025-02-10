use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone, Default)]
pub enum MediaFormat {
    #[serde(rename = "TV")]
    TV,
    #[serde(rename = "TV_SHORT")]
    TVShort,
    #[serde(rename = "MOVIE")]
    Movie,
    #[serde(rename = "SPECIAL")]
    Special,
    #[serde(rename = "OVA")]
    OVA,
    #[serde(rename = "ONA")]
    ONA,
    #[serde(rename = "MUSIC")]
    Music,
    #[serde(rename = "MANGA")]
    Manga,
    #[serde(rename = "NOVEL")]
    Novel,
    #[serde(rename = "ONE_SHOT")]
    OneShot,
    #[serde(rename = "UNKNOWN")]
    #[default]
    Unknown,
}

impl MediaFormat {
    pub fn as_str(&self) -> &str {
        match self {
            MediaFormat::TV => "TV",
            MediaFormat::Movie => "Movie",
            MediaFormat::OVA => "OVA",
            MediaFormat::ONA => "ONA",
            MediaFormat::Special => "Special",
            MediaFormat::Music => "Music",
            MediaFormat::Manga => "Manga",
            MediaFormat::Novel => "Novel",
            MediaFormat::OneShot => "OneShot",
            MediaFormat::TVShort => "TV Short",
            MediaFormat::Unknown => "Unknown",
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub enum MediaListStatus {
    #[serde(rename = "CURRENT")]
    Current,
    #[serde(rename = "PLANNING")]
    Planning,
    #[serde(rename = "COMPLETED")]
    Completed,
    #[serde(rename = "DROPPED")]
    Dropped,
    #[serde(rename = "PAUSED")]
    Paused,
    #[serde(rename = "REPEATING")]
    Repeating,
}

impl MediaListStatus {
    pub fn as_str(&self) -> &str {
        match self {
            MediaListStatus::Current => "Current",
            MediaListStatus::Planning => "Planning",
            MediaListStatus::Completed => "Completed",
            MediaListStatus::Dropped => "Dropped",
            MediaListStatus::Paused => "Paused",
            MediaListStatus::Repeating => "Repeating",
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub enum MediaStatus {
    #[serde(rename = "FINISHED")]
    Finished,
    #[serde(rename = "RELEASING")]
    Releasing,
    #[serde(rename = "NOT_YET_RELEASED")]
    NotYetReleased,
    #[serde(rename = "CANCELLED")]
    Cancelled,
    #[serde(rename = "HIATUS")]
    Hiatus,
}

#[derive(Deserialize, Serialize, Debug, Clone, Default)]
pub enum Type {
    #[serde(rename = "ANIME")]
    #[default]
    Anime,
    #[serde(rename = "MANGA")]
    Manga,
}

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
    pub format:     Option<MediaFormat>,
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
    pub format:     Option<MediaFormat>,
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
    pub format: MediaFormat,
    pub count:  i32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct AnimeStatusDistribution {
    pub status:     MediaListStatus,
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
    #[serde(rename = "chaptersRead")]
    pub chapters_read:   i32,
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
