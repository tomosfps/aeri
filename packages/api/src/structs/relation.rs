use super::shared::Title;
use serde::{Deserialize, Serialize};
use struct_iterable::Iterable;

#[derive(Deserialize, Serialize, Iterable, Debug)]
pub struct Relations {
    pub media: Vec<RelationData>,
}

#[derive(Deserialize, Serialize, Iterable, Debug)]
pub struct RelationData {
    pub id:              Option<i32>,
    pub title:           Option<Title>,
    pub format:          Option<String>,
    pub r#type:          Option<String>,
    pub synonyms:        Option<Vec<String>>,
    pub status:          Option<String>,
}