use super::shared::{MediaNodes, Avatar, Name, Date};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Character {
    id:             i32,
    age:            Option<i32>,
    description:    Option<String>,
    gender:         Option<String>,
    favourites:     Option<i32>,
    site_url:       Option<String>,
    image:          Avatar,
    name:           Name,
    date_of_birth:  Date,
    date_of_death:  Date,
    media:          Vec<MediaNodes>,
}