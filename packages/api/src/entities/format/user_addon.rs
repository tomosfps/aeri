use crate::entities::user::User;
use crate::structs::shared::{MediaFormat, MediaListStatus};
use std::collections::HashMap;

pub struct AddonData {
    pub total_entries:      i32,
    pub top_genre:          String,
    pub top_format:         MediaFormat,
    pub completion_rate:    i64,
}

pub fn user_addon(user: &User) -> AddonData {
    let statistics = &user.statistics;

    let mut combined_genres_map = HashMap::new();

    for genre in statistics.anime.genres.iter().chain(statistics.manga.genres.iter()) {
        let entry = combined_genres_map
            .entry(genre.genre.as_str())
            .or_insert(0);

        *entry += genre.count;
    }

    let mut combined_genres: Vec<_> = combined_genres_map.into_iter().collect();
    combined_genres.sort_by(|a, b| b.1.cmp(&a.1));

    let top_genre = combined_genres
        .first()
        .map_or("Unknown", |g| g.0);

    let favourite_format = statistics.anime.formats
        .iter()
        .max_by_key(|format| format.count)
        .map_or(MediaFormat::default(), |format| format.format);

    let (total_entries, completed_entries) = statistics.anime.statuses
        .iter()
        .fold((0, 0), |(total, completed), status| {
            let count = status.count;
            if status.status == MediaListStatus::Completed {
                (total + count, completed + count)
            } else {
                (total + count, completed)
            }
        });

    let completion_rate = if total_entries > 0 {
        ((completed_entries as f64 / total_entries as f64) * 100.0).ceil() as i64
    } else {
        0
    };

    AddonData {
        total_entries,
        top_genre:      top_genre.to_string(),
        top_format:     favourite_format,
        completion_rate,
    }
}
