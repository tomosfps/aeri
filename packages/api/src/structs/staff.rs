use super::shared::{Date, Avatar, Name, StaffNodes};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Staff {
    id:             i32,
    age:            Option<i32>,
    gender:         Option<String>,
    favourites:     Option<i32>,
    home_town:      Option<String>,
    image:          Avatar,
    name:           Name,
    date_of_birth:  Date,
    date_of_death:  Date,
    language_v2:    Option<String>,
    site_url:       Option<String>,
    staff_media:    Vec<StaffNodes>,
}