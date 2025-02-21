use crate::anilist::queries::get_query;
use crate::entities::traits::Entity;
use crate::format::relation_addon::relation_addon;
use crate::structs::shared::{MediaFormat, MediaStatus, Title, Type};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Deserialize)]
pub struct Relations {
    pub media: Vec<RelationData>,
}

#[derive(Deserialize)]
pub struct RelationData {
    pub id:              i32,
    pub title:           Title,
    pub format:          Option<MediaFormat>,
    pub r#type:          Option<Type>,
    pub synonyms:        Option<Vec<String>>,
    pub status:          Option<MediaStatus>,
}

#[derive(Serialize, Deserialize)]   
pub struct FormattedRelation {
    pub id:              i32,
    pub romaji:          String,
    pub english:         String,
    pub native:          String,
    pub synonyms:        Vec<String>,
    pub r#type:          Type,
    pub format:          MediaFormat,
    pub airing_type:     MediaStatus,
    pub similarity:      f32,
}

#[derive(Serialize, Deserialize)]   
pub struct FormattedRelations {
    pub relations: Vec<FormattedRelation>,
}

#[derive(Deserialize)]
pub struct RelationRequest {
    media_name: String,
    media_type: String,
}

impl Entity<FormattedRelations, RelationRequest> for Relations {
    fn entity_name() -> String {
        "Media".into()
    }

    fn data_index() -> Vec<String> {
        vec!["data".into(), "Page".into()]
    }

    fn format(self, request: &RelationRequest) -> FormattedRelations {
        let mut relations: Vec<FormattedRelation> = vec![];

        for relation in &self.media {
            let similarity = relation_addon(&request.media_name, relation);
            let frelation = FormattedRelation {
                id:             relation.id,
                romaji:         relation.title.romaji.clone().unwrap_or_else(|| String::new()),
                english:        relation.title.english.clone().unwrap_or_else(|| String::new()),
                native:         relation.title.native.clone().unwrap_or_else(|| String::new()),
                synonyms:       relation.synonyms.clone().unwrap_or_else(|| Vec::new()),
                r#type:         relation.r#type.clone().unwrap_or_else(|| Type::default()),
                format:         relation.format.clone().unwrap_or_else(|| MediaFormat::default()),
                airing_type:    relation.status.clone().unwrap_or_else(|| MediaStatus::default()),
                similarity:     similarity.similarity,
            };
            relations.push(frelation);
        }

        FormattedRelations { relations }
    }

    fn cache_key(request: &RelationRequest) -> String {
        format!("relation:{}:{}", request.media_name, request.media_type)
    }

    fn query(request: &RelationRequest) -> Value {
        json!({ "query": get_query("relation_stats"), "variables": { "search": request.media_name, "type": request.media_type.to_uppercase() }})
    }

    fn validate_request(request: &RelationRequest) -> Result<(), String> {
        if request.media_name.len() == 0 || request.media_type.len() == 0 {
            return Err("No Media Name or Type was included".into());
        }

        Ok(())
    }

}