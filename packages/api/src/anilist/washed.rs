use crate::global::compare_strings::compare_strings;
use lazy_static::lazy_static;
use colourful_logger::Logger;
use serde_json::json;

lazy_static! {
    static ref logger: Logger = Logger::default();
}

pub async fn wash_media_data(media_data: serde_json::Value) -> serde_json::Value {
    logger.debug_single("Washing up media data", "Media");
    let mut data = media_data["data"]["Media"].clone();

    if data["status"] == "NOT_YET_RELEASED" {
        data["status"] = "Not Yet Released".into();
    }

    let washed_data: serde_json::Value = json!({
        "id"            : data["id"],
        "romaji"        : data["title"]["romaji"],
        "airing"        : data["airingSchedule"]["nodes"],
        "averageScore"  : data["averageScore"],
        "meanScore"     : data["meanScore"],
        "banner"        : Some(data["bannerImage"].clone()),
        "cover"         : Some(data["coverImage"].clone()),
        "duration"      : data["duration"],
        "episodes"      : data["episodes"],
        "chapters"      : data["chapters"],
        "volumes"       : data["volumes"],
        "format"        : data["format"],
        "genres"        : data["genres"],
        "popularity"    : data["popularity"],
        "favourites"    : data["favourites"],
        "status"        : data["status"],
        "url"           : data["siteUrl"],
        "endDate"       : format!("{}/{}/{}", data["endDate"]["day"], data["endDate"]["month"], data["endDate"]["year"]),
        "startDate"     : format!("{}/{}/{}", data["startDate"]["day"], data["startDate"]["month"], data["startDate"]["year"]),
        "dataFrom"      : "API",
    });

    logger.debug_single("Data has been washed and being returned", "Media");
    washed_data
}

pub async fn wash_relation_data(parsed_string: String, relation_data: serde_json::Value) -> serde_json::Value {
    logger.debug_single("Washing up relational data", "Relations");
    let data: &serde_json::Value = &relation_data["data"]["Page"]["media"];
    let mut relation_list: Vec<serde_json::Value> = Vec::new();
    let parsed_string = &parsed_string.to_lowercase();

    for rel in data.as_array().unwrap() {
        let romaji = &rel["title"]["romaji"].as_str().unwrap_or("").to_lowercase();
        let english = &rel["title"]["english"].as_str().unwrap_or("").to_lowercase();
        let native = &rel["title"]["native"].as_str().unwrap_or("").to_lowercase();

        let empty_vec = vec![];
        let synonyms = rel["synonyms"].as_array().unwrap_or(&empty_vec);

        let result = compare_strings(parsed_string, vec![romaji, english, native]);
        logger.debug("Similarity Score Given: ", "Wash Relation", false, result.clone());

        let lowercase_synonyms: Vec<String> = synonyms.iter().map(|x| x.as_str().unwrap().to_lowercase()).collect();
        let synonyms_result = compare_strings(parsed_string, lowercase_synonyms.iter().collect());
        logger.debug("Similarity Score Given: ", "Wash Relation", false, synonyms_result.clone());

        let combined = result.iter().chain(synonyms_result.iter());
        let result = combined.max_by(|a, b| a.1.partial_cmp(&b.1).unwrap()).unwrap();
        logger.debug("Overall Score Given: ", "Wash Relation", false, result.clone());

        let status_text = match rel["status"].as_str() {
            Some("RELEASING") => "Releasing",
            Some("NOT_YET_RELEASED") => "Upcoming",
            Some("FINISHED") => "Finished",
            Some("CANCELLED") => "Cancelled",
            Some("HIATUS") => "On Hiatus",
            _ => "Unknown",
        };

        let washed_relation = json!({
            "id"            : rel["id"],
            "romaji"        : rel["title"]["romaji"],
            "english"       : rel["title"]["english"],
            "native"        : rel["title"]["native"],
            "synonyms"      : rel["synonyms"],
            "type"          : rel["type"],
            "format"        : rel["format"],
            "airingType"    : status_text,
            "similarity"    : result.1,
            "dataFrom"      : "API",
        });

        logger.debug("Washed Relation: ", "Relations", false, washed_relation.clone());
        relation_list.push(washed_relation);
    }

    relation_list.sort_by(|a, b| b["similarity"].as_f64().unwrap().partial_cmp(&a["similarity"].as_f64().unwrap()).unwrap());
    let data: serde_json::Value = json!({
        "relations": relation_list
    });

    logger.debug_single("Data has been washed and being returned ", "Relations");
    data
}

pub async fn wash_staff_data(staff_data: serde_json::Value) -> serde_json::Value {
    logger.debug_single("Washing up staff data", "Staff");
    let data: &serde_json::Value = &staff_data["data"]["Page"]["staff"][0];

    logger.debug("Original staff data", "Staff", false, data.clone());

    let washed_data = json!({
        "id":               data["id"],
        "age":              data["age"],
        "gender":           data["gender"],
        "home":             data["homeTown"],
        "favourites":       data["favourites"],
        "language":         data["languageV2"],
        "fullName":         data["name"]["full"],
        "nativeName":       data["name"]["native"],
        "dateOfBirth":      format!("{}/{}/{}", data["dateOfBirth"]["day"], data["dateOfBirth"]["month"], data["dateOfBirth"]["year"]),
        "dateOfDeath":      format!("{}/{}/{}", data["dateOfDeath"]["day"], data["dateOfDeath"]["month"], data["dateOfDeath"]["year"]),
        "url":              data["siteUrl"],
        "image":            Some(data["image"]["large"].clone()),
        "staffData":        data["staffMedia"]["nodes"],
        "dataFrom":         "API",
    });
    washed_data
}

pub async fn wash_studio_data(studio_data: serde_json::Value) -> serde_json::Value {
    logger.debug_single("Washing up studio data", "Studio");
    let data: &serde_json::Value = &studio_data["data"]["Page"]["studios"][0];

    let washed_data = json!({
        "id":                   data["id"],
        "favourites":           data["favourites"],
        "name":                 data["name"],
        "url":                  data["siteUrl"],
        "media":                data["media"]["nodes"],
        "isAnimationStudio":    data["isAnimationStudio"],
        "dataFrom":             "API",
    });
    washed_data
}

pub async fn wash_character_data(character_data: serde_json::Value) -> serde_json::Value {
    logger.debug_single("Washing up character data", "Character");
    let data: &serde_json::Value = &character_data["data"]["Character"];

    let washed_data = json!({
        "id":                   data["id"],
        "fullName":             data["name"]["full"],
        "nativeName":           data["name"]["native"],
        "alternativeNames":     data["name"]["alternative"],
        "url":                  data["siteUrl"],
        "favourites":           data["favourites"],
        "image":                Some(data["image"]["large"].clone()),
        "url":                  data["siteUrl"],
        "age":                  data["age"],
        "gender":               data["gender"],
        "dateOfBirth":          format!("{}/{}/{}", data["dateOfBirth"]["day"], data["dateOfBirth"]["month"], data["dateOfBirth"]["year"]),
        "media":                data["media"]["nodes"],
        "description":          data["description"],
        "dataFrom":             "API",
        
    });
    washed_data
}

pub async fn wash_user_score(json_data: serde_json::Value) -> serde_json::Value {
    logger.debug_single("Washing up score data", "User Score");
    let data = &json_data["data"]["MediaList"];
    let washed_data = json!({
        "progress"      : data["progress"],
        "volumes"       : data["progressVolumes"].as_str().unwrap_or("0"),
        "score"         : data["score"],
        "status"        : data["status"],
        "repeat"        : data["repeat"],
        "user"          : data["user"]["name"],
        "dataFrom"      : "API"
    });

    logger.debug("Data has been washed", "User", false, washed_data.clone());
    washed_data
}

pub async fn wash_user_data(json_data: serde_json::Value) -> serde_json::Value {
    logger.debug_single("Washing up data", "User");
    let data = &json_data["data"]["User"];

    let mut anime_genres = data["statistics"]["anime"]["genres"]
        .as_array()
        .unwrap()
        .clone();
    anime_genres.sort_by(|a, b| b["count"].as_i64().unwrap().cmp(&a["count"].as_i64().unwrap()));

    let mut manga_genres = data["statistics"]["manga"]["genres"]
        .as_array()
        .unwrap()
        .clone();
    manga_genres.sort_by(|a, b| b["count"].as_i64().unwrap().cmp(&a["count"].as_i64().unwrap()));
    
    let anime_genres: Vec<serde_json::Value> = anime_genres
        .iter()
        .map(|genre| {
            json!({
                "genre": genre["genre"].as_str().unwrap(),
                "count": genre["count"].as_i64().unwrap()
            })
        })
        .collect();

    let manga_genres: Vec<serde_json::Value> = manga_genres
        .iter()
        .map(|genre| {
            json!({
                "genre": genre["genre"].as_str().unwrap(),
                "count": genre["count"].as_i64().unwrap()
            })
        })
        .collect();

    let mut combined_genres_map = std::collections::HashMap::new();
    for genre in anime_genres.iter().chain(manga_genres.iter()) {
        let entry = combined_genres_map.entry(genre["genre"].as_str().unwrap()).or_insert(0);
        *entry += genre["count"].as_i64().unwrap();
    }

    let mut combined_genres: Vec<_> = combined_genres_map.into_iter().collect();
    combined_genres.sort_by(|a, b| b.1.cmp(&a.1));
    let top_genre = combined_genres.first().map(|(genre, _)| *genre).unwrap_or("Unknown");

    let favourite_format = data["statistics"]["anime"]["formats"]
        .as_array()
        .unwrap()
        .iter()
        .map(|format| {
            let format_str = format["format"].as_str().unwrap();
            let capitalized_format = if format_str.len() > 3 {
                format_str.chars().enumerate().map(|(i, c)| if i == 0 { c.to_uppercase().to_string() } else { c.to_string() }).collect::<String>()
            } else {
                format_str.to_string()
            };
            (capitalized_format, format["count"].as_i64().unwrap())
        })
        .max_by_key(|&(_, count)| count)
        .map(|(format, _)| format)
        .unwrap_or(String::from("Unknown"));

    let completed_entries = data["statistics"]["anime"]["statuses"]
        .as_array()
        .unwrap()
        .iter()
        .find(|status| status["status"] == "COMPLETED")
        .map_or(0, |status| status["count"].as_i64().unwrap_or(0));

    let added_up_entries = data["statistics"]["anime"]["statuses"]
        .as_array()
        .unwrap()
        .iter()
        .map(|status| status["count"].as_i64().unwrap_or(0))
        .sum::<i64>();

    let completion_percentage = if added_up_entries > 0 {
        ((completed_entries as f64 / added_up_entries as f64) * 100.0).ceil() as i64
    } else {
        0
    };

    let users: serde_json::Value = json!({
        "id"                    : data["id"],
        "name"                  : data["name"],
        "avatar"                : Some(data["avatar"]["large"].clone()),
        "banner"                : Some(data["bannerImage"].clone()),
        "about"                 : data["about"],
        "url"                   : data["siteUrl"],
        "animeStats": {
            "count"             : data["statistics"]["anime"]["count"],
            "watched"           : data["statistics"]["anime"]["episodesWatched"],
            "minutes"           : data["statistics"]["anime"]["minutesWatched"],
            "meanScore"         : data["statistics"]["anime"]["meanScore"],
            "genres"            : data["statistics"]["anime"]["genres"],
            "scores"            : data["statistics"]["anime"]["scores"],
            "formats"           : data["statistics"]["anime"]["formats"],
            "status"            : data["statistics"]["anime"]["statuses"],
            "sortedGenres"      : anime_genres,
        },
        "mangaStats": {
            "count"             : data["statistics"]["manga"]["count"],
            "chapters"          : data["statistics"]["manga"]["chaptersRead"],
            "volumes"           : data["statistics"]["manga"]["volumesRead"],
            "meanScore"         : data["statistics"]["manga"]["meanScore"],
            "deviation"         : data["statistics"]["manga"]["standardDeviation"],
            "genres"            : data["statistics"]["manga"]["genres"],
            "scores"            : data["statistics"]["manga"]["scores"],
            "sortedGenres"      : manga_genres,
        },
        "totalEntries"          : data["statistics"]["manga"]["count"].as_i64().unwrap_or(0) + data["statistics"]["anime"]["count"].as_i64().unwrap_or(0),
        "topGenre"              : top_genre,
        "favouriteFormat"       : favourite_format,
        "completionPercentage"  : completion_percentage,
        "lastUpdated"           : data["updatedAt"],
        "dataFrom"              : "API"
    });
    
    logger.debug("Data has been washed", "User", false, users.clone());
    users
}