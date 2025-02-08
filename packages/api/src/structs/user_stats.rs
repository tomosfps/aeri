use serde::Deserialize;

#[derive(Deserialize)]
pub struct UserScores {
    progress_volumes:   Option<i32>,
    progress:           Option<i32>,
    score:              Option<i32>,
    status:             Option<String>,
    repeat:             Option<i32>,
    user:               UserScoresName,
}

#[derive(Deserialize)]
pub struct UserScoresName {
    name:   Option<String>,
}