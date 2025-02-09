use crate::{
    global::compare_strings::compare_strings,
    structs::{affinity::Affinity, character::Character, media::Media, relation::Relations, staff::Staff, studio::Studio, user::User, user_stats::UserScores},
};
use colourful_logger::Logger;
use lazy_static::lazy_static;
use serde_json::{json, Value};

lazy_static! {
    static ref logger: Logger = Logger::default();
}

pub async fn format_media_data(media_data: Media) -> serde_json::Value {
    let mut data = media_data.clone();

    if let Some(status) = data.status.as_deref_mut() {
        if status == "NOT_YET_RELEASED" {
            data.status = Some("Not Yet Released".to_string());
        }
    }

    let end_date = if let Some(end_date) = data.end_date.as_ref() {
        format!("{}/{}/{}", end_date.day.unwrap_or(0), end_date.month.unwrap_or(0), end_date.year.unwrap_or(0))
    } else {
        String::new()
    };

    let start_date = if let Some(start_date) = data.start_date.as_ref() {
        format!("{}/{}/{}", start_date.day.unwrap_or(0), start_date.month.unwrap_or(0), start_date.year.unwrap_or(0))
    } else {
        String::new()
    };

    let washed_data: serde_json::Value = json!({
        "id"            : data.id,
        "romaji"        : data.title.unwrap().romaji,
        "airing"        : data.airing_schedule,
        "averageScore"  : data.average_score,
        "meanScore"     : data.mean_score,
        "banner"        : data.banner_image,
        "cover"         : data.cover_image.unwrap().extra_large,
        "duration"      : data.duration,
        "episodes"      : data.episodes,
        "chapters"      : data.chapters,
        "volumes"       : data.volumes,
        "format"        : data.format,
        "genres"        : data.genres,
        "popularity"    : data.popularity,
        "favourites"    : data.favourites,
        "status"        : data.status,
        "url"           : data.site_url,
        "endDate"       : end_date,
        "startDate"     : start_date,
        "dataFrom"      : "API",
    });
    washed_data
}

pub async fn format_relation_data(parsed_string: String, relation_data: Relations) -> Value {
    let data = relation_data.media;
    let mut relation_list: Vec<Value> = Vec::new();
    let parsed_string: &String = &parsed_string.to_lowercase();

    for rel in data.iter() {
        let romaji:   String =  rel.title.as_ref().unwrap().romaji.clone().unwrap_or_else(|| String::new());
        let english:  String =  rel.title.as_ref().unwrap().english.clone().unwrap_or_else(|| String::new());
        let native:   String =  rel.title.as_ref().unwrap().native.clone().unwrap_or_else(|| String::new());
        let synonyms: Vec<String> = rel.synonyms.clone().unwrap_or_else(|| Vec::new());

        let result = compare_strings(parsed_string, vec![&romaji, &english, &native]);

        let lowercase_synonyms: Vec<String> =
            synonyms.iter().map(|x| x.as_str().to_lowercase()).collect();
        let synonyms_result = compare_strings(parsed_string, lowercase_synonyms.iter().collect());

        let combined = result.iter().chain(synonyms_result.iter());
        let result = combined
            .max_by(|a, b| a.1.partial_cmp(&b.1).unwrap())
            .unwrap();

        let status_text = match rel.status.as_ref().unwrap().as_str() {
            "RELEASING" => "Releasing",
            "NOT_YET_RELEASED" => "Upcoming",
            "FINISHED" => "Finished",
            "CANCELLED" => "Cancelled",
            "HIATUS" => "On Hiatus",
            _ => "Unknown",
        };

        let washed_relation = json!({
            "id"            : rel.id.unwrap(),
            "romaji"        : romaji,
            "english"       : english,
            "native"        : native,
            "synonyms"      : synonyms,
            "type"          : rel.r#type.clone().unwrap_or_else(|| String::new()),
            "format"        : rel.format.clone().unwrap_or_else(|| String::new()),
            "airingType"    : status_text,
            "similarity"    : result.1,
        });
        relation_list.push(washed_relation);
    }

    relation_list.sort_by(|a, b| {
        b["similarity"]
            .as_f64()
            .unwrap()
            .partial_cmp(&a["similarity"].as_f64().unwrap())
            .unwrap()
    });
    json!(relation_list)
}

pub async fn format_staff_data(staff_data: Staff) -> serde_json::Value {
    let data = staff_data.clone();
    
    let date_of_birth = if let Some(date_of_birth) = data.date_of_birth.as_ref() {
        format!("{}/{}/{}", date_of_birth.day.unwrap_or(0), date_of_birth.month.unwrap_or(0), date_of_birth.year.unwrap_or(0))
    } else {
        String::new()
    };

    let date_of_death = if let Some(date_of_death) = data.date_of_death.as_ref() {
        format!("{}/{}/{}", date_of_death.day.unwrap_or(0), date_of_death.month.unwrap_or(0), date_of_death.year.unwrap_or(0))
    } else {
        String::new()
    };

    let washed_data = json!({
        "id":               data.id,
        "age":              data.age,
        "gender":           data.gender,
        "home":             data.home_town,
        "favourites":       data.favourites,
        "language":         data.language,
        "fullName":         data.name.as_ref().unwrap().full,
        "nativeName":       data.name.as_ref().unwrap().native,
        "dateOfBirth":      date_of_birth,
        "dateOfDeath":      date_of_death,
        "url":              data.site_url,
        "image":            data.image.unwrap().large,
        "staffData":        data.staff_media,
        "dataFrom":         "API",
    });
    washed_data
}

pub async fn format_studio_data(studio_data: Studio) -> serde_json::Value {
    let data = studio_data.clone();

    let washed_data = json!({
        "id":                   data.id,
        "favourites":           data.favourites,
        "name":                 data.name,
        "url":                  data.site_url,
        "media":                data.media,
        "isAnimationStudio":    data.is_animation,
        "dataFrom":             "API",
    });
    washed_data
}

pub async fn format_character_data(character_data: Character) -> serde_json::Value {
    let data = character_data.clone();

    let date_of_birth = if let Some(date_of_birth) = data.date_of_birth.as_ref() {
        format!("{}/{}/{}", date_of_birth.day.unwrap_or(0), date_of_birth.month.unwrap_or(0), date_of_birth.year.unwrap_or(0))
    } else {
        String::new()
    };

    let washed_data = json!({
        "id":                   data.id,
        "fullName":             data.name.as_ref().unwrap().full,
        "nativeName":           data.name.as_ref().unwrap().native,
        "alternativeNames":     data.name.as_ref().unwrap().alternative,
        "url":                  data.site_url,
        "favourites":           data.favourites,
        "image":                data.image.unwrap().large,
        "age":                  data.age,
        "gender":               data.gender,
        "dateOfBirth":          date_of_birth,
        "media":                data.media,
        "description":          data.description,
        "dataFrom":             "API",
    });
    washed_data
}

pub async fn format_user_score(user_score_data: UserScores) -> serde_json::Value {
    let data = user_score_data.clone();

    let washed_data = json!({
        "progress"      : data.progress,
        "volumes"       : data.progress_volumes,
        "score"         : data.score,
        "status"        : data.status,
        "repeat"        : data.repeat,
        "user"          : data.user.unwrap().name,
        "dataFrom"      : "API"
    });
    washed_data
}

pub async fn format_user_data(user_data: User) -> serde_json::Value {
    let data = user_data.clone();

    let statistics = data.statistics.unwrap();
    let mut anime_genres = statistics.anime.genres.clone();
    anime_genres.sort_by(|a, b| {
        b.count.cmp(&a.count)
    });

    let mut manga_genres = statistics.manga.genres.clone();
    manga_genres.sort_by(|a, b| {
        b.count.cmp(&a.count)
    });

    let anime_genres: Vec<serde_json::Value> = anime_genres
        .iter()
        .map(|genre| {
            json!({
                "genre": genre.genre.as_ref().unwrap().as_str(),
                "count": genre.count.as_ref().unwrap()
            })
        })
        .collect();

    let manga_genres: Vec<serde_json::Value> = manga_genres
        .iter()
        .map(|genre| {
            json!({
                "genre": genre.genre.as_ref().unwrap().as_str(),
                "count": genre.count.as_ref().unwrap()
            })
        })
        .collect();

    let mut combined_genres_map = std::collections::HashMap::new();
    for genre in anime_genres.iter().chain(manga_genres.iter()) {
        let entry = combined_genres_map
            .entry(genre["genre"].as_str().unwrap())
            .or_insert(0);
        *entry += genre["count"].as_i64().unwrap();
    }

    let mut combined_genres: Vec<_> = combined_genres_map.into_iter().collect();
    combined_genres.sort_by(|a, b| b.1.cmp(&a.1));
    let top_genre = combined_genres
        .first()
        .map(|(genre, _)| *genre)
        .unwrap_or("Unknown");

    let favourite_format = statistics.anime.formats
        .iter()
        .map(|format| {
            let format_str = format.format.as_ref().unwrap().as_str();
            let capitalized_format = if format_str.len() > 3 {
                format_str
                    .chars()
                    .enumerate()
                    .map(|(i, c)| {
                        if i == 0 {
                            c.to_uppercase().to_string()
                        } else {
                            c.to_string()
                        }
                    })
                    .collect::<String>()
            } else {
                format_str.to_string()
            };
            (capitalized_format, format.count.unwrap())
        })
        .max_by_key(|&(_, count)| count)
        .map(|(format, _)| format)
        .unwrap_or(String::from("Unknown"));

    let completed_entries = statistics.anime.statuses
        .iter()
        .find(|status| status.status.as_ref().unwrap().as_str() == "COMPLETED")
        .map_or(0, |status| status.count.unwrap_or(0));

    let added_up_entries = statistics.anime.statuses
        .iter()
        .map(|status| status.count.unwrap_or(0))
        .sum::<i32>();

    let completion_percentage = if added_up_entries > 0 {
        ((completed_entries as f64 / added_up_entries as f64) * 100.0).ceil() as i64
    } else {
        0
    };

    let users: serde_json::Value = json!({
        "id"                    : data.id,
        "name"                  : data.name,
        "avatar"                : data.avatar.unwrap().large,
        "banner"                : data.banner_image,
        "about"                 : data.about,
        "url"                   : data.site_url,
        "animeStats": {
            "count"             : statistics.anime.count,
            "watched"           : statistics.anime.episodes_watched,
            "minutes"           : statistics.anime.minutes_watched,
            "meanScore"         : statistics.anime.mean,
            "genres"            : statistics.anime.genres,
            "scores"            : statistics.anime.scores,
            "formats"           : statistics.anime.formats,
            "status"            : statistics.anime.statuses,
            "sortedGenres"      : anime_genres,
        },
        "mangaStats": {
            "count"             : statistics.manga.count,
            "chapters"          : statistics.manga.chapters_read,
            "volumes"           : statistics.manga.volumes_read,
            "meanScore"         : statistics.manga.mean,
            "genres"            : statistics.manga.genres,
            "scores"            : statistics.manga.scores,
            "sortedGenres"      : manga_genres,
        },
        "totalEntries"          : statistics.manga.count.unwrap_or(0) + statistics.anime.count.unwrap_or(0),
        "topGenre"              : top_genre,
        "favouriteFormat"       : favourite_format,
        "completionPercentage"  : completion_percentage,
        "lastUpdated"           : data.updated_at,
        "dataFrom"              : "API"
    });
    users
}


pub async fn format_affinity_data(affinity_data: Affinity) -> serde_json::Value {
    let data = affinity_data.clone();

    let washed_data = json!({
        "user":     data.user,
        "entries":  data.lists,
        "dataFrom": "API"
    });
    washed_data
}