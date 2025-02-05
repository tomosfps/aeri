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
            description
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
            siteUrl
            title {
                english
                native
                romaji
            }
            format
        }
        }
    }
    }";

    let staff: &str = "
    query Staff($staffId: Int, $search: String) {
    Staff(id: $staffId, search: $search) {
        age
        dateOfBirth {
            day
            month
            year
        }
        dateOfDeath {
            day
            month
            year
        }
        gender
        homeTown
        id
        image {
            large
        }
        languageV2
        name {
            first
            full
            last
            middle
            native
        }
        siteUrl
        staffMedia {
            nodes {
                title {
                    romaji
                    native
                    english
                }
            siteUrl
            type
            }
        }
    }
    }
    ";

    let studio: &str = "
    query Studio($studioId: Int, $search: String) {
     Studio(id: $studioId, search: $search) {
        favourites
        id
        isAnimationStudio
        name
        siteUrl
        media {
            nodes {
                title {
                    english
                    native
                    romaji
                }
            siteUrl
            type
            id
            }
        }
    }
    }
    ";

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
                standardDeviation
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

    match query_name {
        "search" => search.to_string(),
        "user_stats" => user_stats.to_string(),
        "relation_stats" => relation_stats.to_string(),
        "user" => user.to_string(),
        "affinity" => affinity.to_string(),
        "recommendation" => recommendation.to_string(),
        "recommendation_amount" => recommendation_amount.to_string(),
        "staff" => staff.to_string(),
        "character" => character.to_string(),
        "studio" => studio.to_string(),
        _ => panic!("Invalid Query Name"),
    }
}