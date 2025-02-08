use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct CoverImage {
    pub extra_large:    Option<String>,
    pub medium:         Option<String>,
    pub large:          Option<String>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Avatar {
    pub large:      Option<String>,
    pub medium:     Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct AiringSchedule {
    pub nodes: Vec<AiringScheduleNode>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct AiringScheduleNode {
    pub time_until_airing:  Option<i32>,
    pub episode:            Option<i32>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Title {
    pub romaji:  String,
    pub native:  String,
    pub english: Option<String>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Name {
    pub full:        Option<String>,
    pub native:      Option<String>,
    pub first:       Option<String>,
    pub last:        Option<String>,
    pub middle:      Option<String>,
    pub alternative: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Date {
    pub date:   Option<DateInput>
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct DateInput {
    pub day:    Option<i32>,
    pub month:  Option<i32>,
    pub year:   Option<i32>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct MediaNodes {
    pub id:         Option<i32>,
    pub site_url:   Option<String>,
    pub title:      Title,
    pub format:     Option<String>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct StaffNodes {
    pub id:         Option<i32>,
    pub site_url:   Option<String>,
    pub title:      Title,
    pub format:     Option<String>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Statistics {
    pub anime:  AnimeStatistics,
    pub manga:  MangaStatistics,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct AnimeStatistics {
    pub count:              Option<i32>,
    pub mean:               Option<f32>,
    pub minutes_watched:    Option<i32>,
    pub episodes_watched:   Option<i32>,
    pub scores:             Vec<AnimeScoreDistribution>,
    pub genres:             Vec<AnimeGenreDistribution>,
    pub formats:            Vec<AnimeFormatDistribution>,
    pub statuses:           Vec<AnimeStatusDistribution>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct AnimeScoreDistribution {
    pub score:      Option<i32>,
    pub count:      Option<i32>,
    pub media_ids:  Option<Vec<i32>>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct AnimeGenreDistribution {
    pub genre:           Option<String>,
    pub count:           Option<i32>,
    pub mean_score:      Option<f32>,
    pub minutes_watched: Option<i32>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct AnimeFormatDistribution {
    pub format: Option<String>,
    pub count:  Option<i32>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct AnimeStatusDistribution {
    pub status:     Option<String>,
    pub mean_score: Option<f32>,
    pub count:      Option<i32>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct MangaStatistics {
    pub count:              Option<i32>,
    pub mean:               Option<f32>,
    pub chapters_read:      Option<i32>,
    pub volumes_read:       Option<i32>,
    pub scores:             Vec<MangaScoreDistribution>,
    pub genres:             Vec<MangaGenreDistribution>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct MangaScoreDistribution {
    pub score:      Option<i32>,
    pub count:      Option<i32>,
    pub media_ids:  Option<Vec<i32>>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct MangaGenreDistribution {
    pub genre:           Option<String>,
    pub count:           Option<i32>,
    pub mean_score:      Option<f32>,
    pub chapters_read:   Option<i32>,
    pub volumes_read:    Option<i32>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct PageInfo {
    pub total:      Option<i32>,
    pub per_page:   Option<i32>,
    pub current:    Option<i32>,
    pub last_page:  Option<i32>,
    pub has_next:   Option<bool>,
}
