use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct UserScores {
    #[serde(rename = "progressVolumes")]
    pub progress_volumes:   Option<i32>,
    pub progress:           Option<i32>,
    pub score:              Option<i32>,
    pub status:             Option<String>,
    pub repeat:             Option<i32>,
    pub user:               Option<UserScoresName>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct UserScoresName {
    pub name:   String,
}