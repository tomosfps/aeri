export enum MediaFormat {
    TV = "TV",
    TVShort = "TV_SHORT",
    Movie = "MOVIE",
    Special = "SPECIAL",
    OVA = "OVA",
    ONA = "ONA",
    Music = "MUSIC",
    Manga = "MANGA",
    Novel = "NOVEL",
    OneShot = "ONE_SHOT",
    Unknown = "UNKNOWN",
}

export function mediaFormatString(format: MediaFormat) {
    switch (format) {
        case MediaFormat.TV:
            return "TV";
        case MediaFormat.TVShort:
            return "TV Short";
        case MediaFormat.Movie:
            return "Movie";
        case MediaFormat.Special:
            return "Special";
        case MediaFormat.OVA:
            return "OVA";
        case MediaFormat.ONA:
            return "ONA";
        case MediaFormat.Music:
            return "Music";
        case MediaFormat.Manga:
            return "Manga";
        case MediaFormat.Novel:
            return "Novel";
        case MediaFormat.OneShot:
            return "One Shot";
        case MediaFormat.Unknown:
            return "Unknown";
    }
}

export enum DataFrom {
    API = "API",
    Cache = "CACHE",
}

export function dataFromString(dataFrom: DataFrom) {
    switch (dataFrom) {
        case DataFrom.API:
            return "API";
        case DataFrom.Cache:
            return "Cache";
    }
}

export enum MediaStatus {
    Finished = "FINISHED",
    Releasing = "RELEASING",
    NotYetReleased = "NOT_YET_RELEASED",
    Cancelled = "CANCELLED",
    Hiatus = "HIATUS",
    Unknown = "UNKNOWN",
}

export function mediaStatusString(status: MediaStatus) {
    switch (status) {
        case MediaStatus.Finished:
            return "Finished";
        case MediaStatus.Releasing:
            return "Releasing";
        case MediaStatus.NotYetReleased:
            return "Not Yet Released";
        case MediaStatus.Cancelled:
            return "Cancelled";
        case MediaStatus.Hiatus:
            return "Hiatus";
        case MediaStatus.Unknown:
            return "Unknown";
    }
}

export enum MediaType {
    Anime = "ANIME",
    Manga = "MANGA",
}

export function mediaTypeString(type: MediaType) {
    switch (type) {
        case MediaType.Anime:
            return "Anime";
        case MediaType.Manga:
            return "Manga";
    }
}

export enum MediaListStatus {
    Current = "CURRENT",
    Planning = "PLANNING",
    Completed = "COMPLETED",
    Dropped = "DROPPED",
    Paused = "PAUSED",
    Repeating = "REPEATING",
    Unknown = "UNKNOWN",
}

export function mediaListStatusString(status: MediaListStatus) {
    switch (status) {
        case MediaListStatus.Current:
            return "Current";
        case MediaListStatus.Planning:
            return "Planning";
        case MediaListStatus.Completed:
            return "Completed";
        case MediaListStatus.Dropped:
            return "Dropped";
        case MediaListStatus.Paused:
            return "Paused";
        case MediaListStatus.Repeating:
            return "Repeating";
        case MediaListStatus.Unknown:
            return "Unknown";
    }
}
