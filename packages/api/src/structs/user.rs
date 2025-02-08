use super::shared::{Avatar, Statistics};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct User {
    id:             i32,
    name:           String,
    site_url:       String,
    updated_at:     String,
    banner_image:   String,
    about:          String,
    avatar:         Avatar,
    statistics:     Statistics,
}