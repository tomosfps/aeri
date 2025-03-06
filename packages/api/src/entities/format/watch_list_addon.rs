use serde::{Serialize, Deserialize};
use crate::entities::watch_list::WatchList;
use crate::structs::shared::{MediaFormat, MediaListStatus, Title};

#[derive(Serialize, Deserialize)]
pub struct AddonData {
    pub lists: Vec<WatchListAddon>
}

#[derive(Serialize, Deserialize)]
pub struct WatchListAddon {
    pub id:         i32,
    pub title:      Title,
    pub format:     MediaFormat,
    pub site_url:   Option<String>,
    pub status:     MediaListStatus
}

pub fn watch_list_addon(media_list_collection: &WatchList, status: MediaListStatus) -> AddonData {
   
    let media_list = match media_list_collection.lists
        .iter()
        .find(|entry| entry.status == status) {
            Some(list) => list,
            None => return AddonData { lists: Vec::new() }
        };

    let lists = media_list.entries
        .iter()
        .map(|entry| WatchListAddon {
            id: entry.media.id,
            title: entry.media.title.clone(),
            format: entry.media.format.clone(),
            site_url: entry.media.site_url.clone(),
            status: status
        })
        .collect();

    AddonData { lists }
}
