import type { DataFrom, MediaFormat, MediaListStatus, MediaStatus, MediaType } from "./enums.js";

export enum Routes {
    Relations = "relations",
    User = "user",
    UserScore = "user/score",
    Character = "character",
    Staff = "staff",
    Studio = "studio",
    Media = "media",
    Affinity = "affinity",
    Recommend = "recommend",
    CurrentUser = "viewer",
    UpdateMedia = "oauth/updateMedia",
    RefreshUser = "remove-user",
    WatchList = "watchlist",
}

type WatchListInfo = {
    id: number;
    title: Title;
    format: MediaFormat;
    site_url: string;
    status: MediaListStatus;
};

type WatchListUser = {
    id: number;
    name: string;
    avatar: string;
    siteUrl: string;
    bannerImage: string;
};

type AffinityUser = {
    name: string;
    siteUrl: string;
    avatar: AvatarTypes;
};

type Favourites = {
    anime: MediaNodes;
    manga: MediaNodes;
};

type AvatarTypes = {
    large: string | null;
    medium: string | null;
};

type AiringSchedule = {
    nodes: AiringScheduleNode[];
};

type AiringScheduleNode = {
    episode: number;
    timeUntilAiring: number;
};

type GenreDistribution = {
    genre: string;
    count: number;
    meanScore: number;
    minutesWatched: number;
    chaptersRead: number;
};

type ScoreDistribution = {
    score: number;
    count: number;
    mediaIds: number[];
};

type AnimeFormatDistribution = {
    format: MediaFormat;
    count: number;
};

type AnimeStatusDistribution = {
    status: MediaListStatus;
    count: number;
    meanScore: number;
};

type AnimeStatistics = {
    count: number;
    meanScore: number;
    minutesWatched: number;
    episodesWatched: number;
    scores: ScoreDistribution[];
    genres: GenreDistribution[];
    formats: AnimeFormatDistribution[];
    statuses: AnimeStatusDistribution[];
};

type MangaStatistics = {
    count: number;
    meanScore: number;
    chaptersRead: number;
    volumesRead: number;
    scores: ScoreDistribution[];
    genres: GenreDistribution[];
};

type Statistics = {
    anime: AnimeStatistics;
    manga: MangaStatistics;
};

type Title = {
    romaji: string | null;
    native: string | null;
    english: string | null;
};

type MediaNode = {
    id: number;
    siteUrl: string;
    title: Title;
    format: MediaFormat;
};

type MediaNodes = {
    nodes: MediaNode[];
};

type BaseAPIResponse = {
    dataFrom: DataFrom.API;
};

export type BaseCacheResponse = {
    dataFrom: DataFrom.Cache;
    leftUntilExpire: number;
};

export type BaseResponse = BaseAPIResponse | BaseCacheResponse;

export type BaseTransformed = {
    footer: string;
};

type Relations = {
    body: {
        media_name: string;
        media_type: MediaType;
    };
    response: BaseResponse & {
        relations: {
            airingType: MediaStatus;
            english: string;
            isAdult: boolean;
            genres: string[];
            format: MediaFormat;
            id: number;
            native: string;
            romaji: string;
            similarity: number;
            synonyms: string[];
            type: MediaType;
        }[];
    };
    transformed: {
        relations: {
            airingType: string;
            english: string;
            format: string;
            isAdult: boolean;
            genres: string[];
            id: number;
            native: string;
            romaji: string;
            similarity: number;
            synonyms: string[];
            type: string;
            isNSFW: boolean;
        }[];
    };
    transformer_args: {
        isNotAutoComplete: boolean;
    };
};

type Media = {
    body: {
        search?: string;
        media_id?: number;
        media_type: MediaType;
    };
    response: BaseResponse & {
        id: number;
        title: Title;
        airing: AiringSchedule[] | null;
        isAdult: boolean;
        averageScore: number | null;
        meanScore: number | null;
        banner: string | null;
        cover: string | null;
        duration: number | null;
        episodes: number | null;
        chapters: number | null;
        volumes: number | null;
        format: MediaFormat | null;
        genres: string[];
        popularity: number | null;
        favourites: number | null;
        status: MediaStatus;
        siteUrl: string | null;
        endDate: string | null;
        startDate: string | null;
    };
    transformed: {
        description: string;
        userResults: Array<{
            username: string;
            score: number;
            progress: number;
            volumes: number;
            status: MediaListStatus;
        }>;
    };
    transformer_args: {
        user_id: string;
        guild_id: string | undefined;
    };
};

type User = {
    body: {
        username: string;
    };
    response: BaseResponse & {
        id: number;
        name: string;
        avatar: string | null;
        banner: string | null;
        about: string | null;
        siteUrl: string;
        favourites: Favourites;
        statistics: Statistics;
        totalEntries: number;
        topGenre: string;
        topFormat: MediaFormat;
        completionRate: number;
        lastUpdated: number;
    };
    transformed: {
        favouriteFormat: string;
        description: string;
        animeFavourites: string;
        mangaFavourites: string;
    };
};

type UserScore = {
    body: {
        user_id?: number;
        media_id: number;
        user_name?: string;
    };
    response: BaseResponse & {
        id: number;
        progress: number | null;
        volumes: number | null;
        score: number | null;
        status: MediaListStatus | null;
        repeat: number | null;
        username: string;
    };
};

type Character = {
    body: {
        character_name: string;
    };
    response: BaseResponse & {
        id: number;
        fullName: string | null;
        nativeName: string | null;
        alternativeNames: string[];
        siteUrl: string | null;
        favourites: number | null;
        image: string | null;
        age: string | null;
        gender: string | null;
        dateOfBirth: string;
        media: MediaNodes;
        description: string | null;
    };
    transformed: {
        description: string;
        addOnDescription: string;
        animeDescription: string;
        mangaDescription: string;
    };
};

type Staff = {
    body: {
        staff_name: string;
        media_type?: MediaType;
    };
    response: BaseResponse & {
        id: number;
        age: number | null;
        gender: string | null;
        favourites: number | null;
        homeTown: string | null;
        language: string | null;
        image: string | null;
        fullName: string | null;
        nativeName: string | null;
        dateOfBirth: string;
        dateOfDeath: string;
        siteUrl: string | null;
        staffData: MediaNodes;
    };
    transformed: {
        description: string;
        animeDescription: string;
        mangaDescription: string;
    };
};

type Studio = {
    body: {
        studio_name: string;
    };
    response: BaseResponse & {
        id: number;
        favourites: number;
        name: string;
        siteUrl: string;
        isAnimationStudio: boolean;
        media: MediaNodes;
    };
    transformed: {
        description: string;
        animeDescription: string;
    };
};

type Recommend = {
    body: {
        media: MediaType;
        genres: string[];
    };
    response: BaseResponse & {
        id: number;
    };
};

type Affinity = {
    body: {
        username: string;
        other_users: string[];
    };
    response: BaseResponse & {
        comparedAgainst: AffinityUser;
        affinity: {
            user: AffinityUser;
            affinity: number;
            count: number;
        }[];
    };
    transformed: {
        description: string;
    };
};

type Viewer = {
    body: {
        token: string;
    };
    response: BaseResponse & {
        id: number;
        name: string;
    };
};

type MediaUpdated = {
    body: {
        status: MediaListStatus | null;
        score: number | null;
        progress: number | null;
        id: number;
        volumes: number | null;
        token: string;
    };
    response: BaseResponse & {
        id: number;
        title: Title;
        repeats: number;
        score: number;
        status: MediaListStatus;
        progress: number;
        volumes: number;
    };
};

type RefreshUser = {
    body: {
        user_id: string;
        username: string;
    };
    response: BaseResponse & {
        message: string;
    };
};

type WatchList = {
    body: {
        username: string;
        status: MediaListStatus;
        type: MediaType;
    };
    response: BaseResponse & {
        user: WatchListUser;
        list: WatchListInfo[];
    };
    transformed: {
        description: string;
    };
};

export type RouteMap = {
    [Routes.Relations]: Relations;
    [Routes.User]: User;
    [Routes.Character]: Character;
    [Routes.Staff]: Staff;
    [Routes.Studio]: Studio;
    [Routes.UserScore]: UserScore;
    [Routes.Media]: Media;
    [Routes.Recommend]: Recommend;
    [Routes.Affinity]: Affinity;
    [Routes.CurrentUser]: Viewer;
    [Routes.UpdateMedia]: MediaUpdated;
    [Routes.RefreshUser]: RefreshUser;
    [Routes.WatchList]: WatchList;
};
