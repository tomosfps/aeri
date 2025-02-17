pub const QUERY_URL: &str = "https://graphql.anilist.co";

pub fn get_query(query_name: &str) -> String {
    let search: &str = "
    query ($id: Int, $search: String, $type: MediaType) {
    Media (id: $id, search: $search, type: $type) {
            id
            season
            format
            episodes
            chapters
            volumes
            duration
            status
            genres
            averageScore
            meanScore
            popularity
            siteUrl
            favourites
            bannerImage
            startDate {
                year
                month
                day
            }
            endDate {
                year
                month
                day
            }
            airingSchedule(notYetAired: true){
                nodes{
                    timeUntilAiring
                    episode
                    }
            }
            coverImage{
                extraLarge
            }
            title{
                romaji
                native
                english
            }
        }
    }
    ";

    let character: &str = "
    query Character($search: String, $characterId: Int) {
    Character(search: $search, id: $characterId) {
        age
        description
        gender
        id
        favourites
        siteUrl
        image {
            large
        }
        name {
            full
            first
            last
            middle
            native
            alternative
        }
        dateOfBirth {
            day
            month
            year
        }
        media {
            nodes {
                id
                siteUrl
                format
                title {
                    english
                    native
                    romaji
                }
            }
        }
    }
    }";

    let staff: &str = "
    query Page($search: String, $mediaType: MediaType) {
    Page {
    staff(search: $search) {
        age
        favourites
        gender
        homeTown
        id
        image {
            large
        }
        dateOfBirth {
          day
          year
          month
        }
        dateOfDeath {
          day
          year
          month
        }
        languageV2
        name {
            full
            native
        }
        siteUrl
        staffMedia(type: $mediaType) {
            nodes {
                id
                format
                siteUrl
                title {
                    english
                    native
                    romaji
                }
            }
        }
        }
    }
    }";

    let studio: &str = "
    query Studio($search: String) {
    Studio(search: $search) {

        favourites
        id
        isAnimationStudio
        name
        siteUrl
        media {
            nodes {
                title {
                    native
                    english
                    romaji
                }
                format
                siteUrl
                id
                }
            }
        }
    }";

    let user: &str = "
    query ($id: Int, $name: String) {
    User(id: $id, name: $name) {
        id
        name
        siteUrl
        updatedAt
        bannerImage
        about
        avatar {
            large
            medium
        }
        favourites {
            anime {
                nodes {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    format
                    siteUrl
                }
            }
            manga {
                nodes {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    format
                    siteUrl
                }
            }
        }
        statistics {
            anime {
                count
                meanScore
                minutesWatched
                episodesWatched
                scores {
                    score
                    count
                    mediaIds
                }
                genres {
                    count
                    genre
                    meanScore
                    minutesWatched
                    chaptersRead
                }
                formats {
                    format
                    count
                }
                statuses {
                    status
                    meanScore
                    count
                }
            }
            manga {
                count
                meanScore
                chaptersRead
                volumesRead
                scores {
                    score
                    count
                    mediaIds
                }
                genres {
                    count
                    genre
                    meanScore
                    minutesWatched
                    chaptersRead
                }
                }
            }
        }
    }";

    let user_stats: &str = "
    query ($userId: Int, $userName: String, $mediaId: Int) {
        MediaList(userId: $userId, userName: $userName, mediaId: $mediaId) {
            progressVolumes
            status
            score(format: POINT_10)
            progress
            repeat
            user {
                name
            }
        }
    }";

    let relation_stats: &str = "
    query ($id: Int, $page: Int, $perPage: Int, $search: String, $type: MediaType) {
    Page (page: $page, perPage: $perPage) {
        media (id: $id, search: $search, type: $type) {
            id
            type
            synonyms
            status
            format
            title {
                romaji
                english
                native
                }
            }
        }
    }";

    let affinity: &str = "
    query ($userName: String, $perChunk: Int, $type: MediaType) {
    MediaListCollection(userName: $userName, perChunk: $perChunk, type: $type) {
        user {
            name
            avatar { large }
            siteUrl
        }
        lists {
            entries {
                status
                score(format: POINT_100)
                mediaId
                }
            }
        }
    }
    ";

    let recommendation_amount: &str =  "
        query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
            pageInfo {
                hasNextPage,
                lastPage,
            }
            media {
                id
            }
        }
        }";

    let recommendation: &str =  "
        query ($genres: [String], $type: MediaType, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
            pageInfo {
                hasNextPage,
                lastPage,
            }
            media(type: $type, genre_in: $genres, sort: ID) {
                id
            }
            }
        }";

    let viewer: &str = "
        {
            Viewer {
                id
                name
            }
        }
    ";

    match query_name {
        "search" => search.to_string(),
        "user_scores" => user_stats.to_string(),
        "relation_stats" => relation_stats.to_string(),
        "user" => user.to_string(),
        "affinity" => affinity.to_string(),
        "recommendation" => recommendation.to_string(),
        "recommendations" => recommendation_amount.to_string(),
        "staff" => staff.to_string(),
        "character" => character.to_string(),
        "studio" => studio.to_string(),
        "viewer" => viewer.to_string(),
        _ => panic!("Invalid Query Name"),
    }
}
