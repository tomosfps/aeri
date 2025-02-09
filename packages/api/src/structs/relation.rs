use super::shared::Title;
use serde::{Deserialize, Serialize};
use struct_iterable::Iterable;

#[derive(Deserialize, Serialize, Iterable, Debug)]
pub struct Relations {
    pub media: Vec<RelationData>,
}

#[derive(Deserialize, Serialize, Iterable, Debug)]
pub struct RelationData {
    pub id:              i32,
    pub title:           Title,
    pub format:          Option<String>,
    pub r#type:          Option<String>,
    pub synonyms:        Option<Vec<String>>,
    pub status:          Option<String>,
}