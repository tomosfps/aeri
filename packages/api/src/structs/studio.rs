use super::shared::MediaNodes;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Studio {
    id:             i32,
    is_animation:   bool,
    name:           String,
    site_url:       String,
    favourites:     i32,
    media:          Vec<MediaNodes>,
}