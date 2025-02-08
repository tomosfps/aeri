use super::shared::Avatar;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct AffinityLists {
    status:     Option<String>,
    score:      Option<i32>,
    media_id:   Option<i32>,
}

#[derive(Deserialize)]
pub struct AffinityUser {
    name:       String,
    site_url:   String,
    avatar:     Avatar,
}

#[derive(Deserialize)]
pub struct Affinity {
    user:      AffinityUser,
    lists:     Vec<AffinityLists>,
}