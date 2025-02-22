use crate::{entities::relations::RelationData, global::compare_strings::compare_strings};

pub struct AddonData {
    pub similarity:     f32,
}

pub fn relation_addon(original_media: &str, relation: &RelationData) -> AddonData {
    let parsed_string: &String   = &original_media.to_lowercase();

    let romaji:   String      =  relation.title.romaji.clone().unwrap_or_default();
    let english:  String      =  relation.title.english.clone().unwrap_or_default();
    let native:   String      =  relation.title.native.clone().unwrap_or_default();
    let synonyms: Vec<String> =  relation.synonyms.clone().unwrap_or_default();
    let result = compare_strings(parsed_string, vec![&romaji, &english, &native]);
    let lowercase_synonyms: Vec<String> =
        synonyms.iter().map(|x| x.as_str().to_lowercase()).collect();
    let synonyms_result = compare_strings(parsed_string, lowercase_synonyms.iter().collect());
    let combined = result.iter().chain(synonyms_result.iter());
    let result = combined
            .max_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal))
            .unwrap();

    AddonData {
        similarity: result.1,
    }

}
