use std::collections::HashMap;
use crate::{entities::affinity::Affinity, global::pearson_correlation::pearson, structs::shared::MediaListStatus};

pub fn compare_scores(user: &Affinity, other_user: &Affinity) -> (f64, i32) {
    let mut user_scores_map: HashMap<i32, f64> = HashMap::new();
    let mut user_scores = Vec::new();
    let mut other_user_scores = Vec::new();

    let binding = Vec::new();
    let user_entries = user.lists.as_ref().unwrap_or(&binding).iter();
    let other_user_entries = other_user.lists.as_ref().unwrap_or(&binding).iter();

    for user_entry in user_entries {
        for media in &user_entry.entries {
            if !matches!(media.status.as_ref().unwrap_or(&MediaListStatus::Completed).as_str(), "PLANNING" | "DROPPED" | "PAUSED") {
                user_scores_map.insert(media.media_id, media.score.unwrap_or(0) as f64);
            }
        }
    }

    for other_user_entry in other_user_entries {
        for media in &other_user_entry.entries {
            if let Some(&user_score) = user_scores_map.get(&media.media_id) {
                user_scores.push(user_score);
                other_user_scores.push(media.score.unwrap_or(0) as f64);
            }
        }
    }

    if !user_scores.is_empty() && !other_user_scores.is_empty() {
        (pearson(&user_scores, &other_user_scores), user_scores.len() as i32)
    } else {
        (0.0, 0)
    }
}