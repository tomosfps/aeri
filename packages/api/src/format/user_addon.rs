use crate::entities::user::User;
use serde_json::json;

pub struct AddonData {
    pub total_entries:      i32,
    pub top_genre:          String,
    pub top_format:         String,
    pub completion_rate:    i64,
}

pub fn user_addon(user: &User) -> AddonData {

    let statistics = &user.statistics;
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
                "genre": genre.genre.as_str(),
                "count": genre.count
            })
        })
        .collect();

    let manga_genres: Vec<serde_json::Value> = manga_genres
        .iter()
        .map(|genre| {
            json!({
                "genre": genre.genre.as_str(),
                "count": genre.count
            })
        })
        .collect();

    let mut combined_genres_map = std::collections::HashMap::new();
    for genre in anime_genres.iter().chain(manga_genres.iter()) {
        let entry = combined_genres_map
            .entry(genre["genre"].as_str().unwrap_or_else(|| "Unknown"))
            .or_insert(0);
        *entry += genre["count"].as_i64().unwrap_or_else(|| 0);
    }

    let mut combined_genres: Vec<_> = combined_genres_map.into_iter().collect();
    combined_genres.sort_by(|a, b| b.1.cmp(&a.1));
    let top_genre = combined_genres
        .first()
        .map(|(genre, _)| *genre)
        .unwrap_or_else(|| "Unknown");

    let favourite_format = statistics.anime.formats
        .iter()
        .map(|format| {
            let format_str = format.format.as_str();
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
            (capitalized_format, format.count)
        })
        .max_by_key(|&(_, count)| count)
        .map(|(format, _)| format)
        .unwrap_or_else(|| String::from("Unknown"));

    let completed_entries: i32 = statistics.anime.statuses
        .iter()
        .find(|status| status.status.as_str() == "Completed")
        .map_or(0, |status| status.count);

    let added_up_entries = statistics.anime.statuses
        .iter()
        .map(|status| status.count)
        .sum::<i32>();

    let completion_percentage = if added_up_entries > 0 {
        ((completed_entries as f64 / added_up_entries as f64) * 100.0).ceil() as i64
    } else {
        0
    };

    AddonData {
        total_entries:  added_up_entries,
        top_genre:      top_genre.to_string(),
        top_format:     favourite_format,
        completion_rate: completion_percentage,
    }
}