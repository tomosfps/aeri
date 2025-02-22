use crate::entities::format::relation_addon::relation_addon;
use crate::entities::Entity;
use crate::global::queries::get_query;
use crate::structs::shared::{MediaFormat, MediaStatus, Title, Type};
use actix_web::HttpResponse;
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
#[serde(rename_all = "camelCase")]
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
        "Relations".into()
    }

    fn data_index() -> Vec<String> {
        vec!["data".into(), "Page".into()]
    }

    async fn format(self, request: &RelationRequest) -> Result<FormattedRelations, HttpResponse> {
        let mut relations: Vec<FormattedRelation> = vec![];

        for relation in &self.media {
            let similarity = relation_addon(&request.media_name, relation);
            let formatted_relation = FormattedRelation {
                id:             relation.id,
                romaji:         relation.title.romaji.clone().unwrap_or_default(),
                english:        relation.title.english.clone().unwrap_or_default(),
                native:         relation.title.native.clone().unwrap_or_default(),
                synonyms:       relation.synonyms.clone().unwrap_or_default(),
                r#type:         relation.r#type.unwrap_or_default(),
                format:         relation.format.unwrap_or_default(),
                airing_type:    relation.status.unwrap_or_default(),
                similarity:     similarity.similarity,
            };
            relations.push(formatted_relation);
        }

        Ok(FormattedRelations { relations })
    }

    fn cache_key(request: &RelationRequest) -> String {
        format!("relation:{}:{}", request.media_name, request.media_type)
    }

    fn query(request: &RelationRequest) -> Value {
        json!({ "query": get_query("relation_stats"), "variables": { "search": request.media_name, "type": request.media_type.to_uppercase() }})
    }

    fn validate_request(request: &RelationRequest) -> Result<(), String> {
        if request.media_name.is_empty() || request.media_type.is_empty() {
            return Err("No Media Name or Type was included".into());
        }

        Ok(())
    }

}
