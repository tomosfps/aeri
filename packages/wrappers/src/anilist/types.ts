import type { DataFrom, MediaFormat, MediaListStatus, MediaStatus, MediaType } from "./enums.js";

export enum Routes {
    Relations = "relations",
    User = "user",
    Character = "character",
}

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

type SortedGenre = {
    genre: string;
    count: number;
};

type AnimeStatistics = {
    count: number;
    watched: number;
    minutes: number;
    meanScore: number;
    genres: GenreDistribution[];
    scores: ScoreDistribution[];
    formats: AnimeFormatDistribution[];
    status: AnimeStatusDistribution[];
    sortedGenres: SortedGenre[];
};

type MangaStatistics = {
    count: number;
    chapters: number;
    volumes: number;
    meanScore: number;
    genres: GenreDistribution[];
    scores: ScoreDistribution[];
    sortedGenres: SortedGenre[];
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
            format: MediaFormat;
            id: number;
            native: string;
            romaji: string;
            similarity: number;
            synonyms: string[];
            type: MediaType;
        }[];
    };
    transformed: never;
};

type User = {
    body: {
        username: string;
    };
    response: BaseResponse & {
        id: bigint;
        name: string;
        avatar: string | null;
        banner: string | null;
        about: string | null;
        siteUrl: string;
        animeStats: AnimeStatistics;
        mangaStats: MangaStatistics;
        totalEntries: number;
        topGenre: string;
        favouriteFormat: string;
        completionPercentage: number;
        lastUpdated: number;
    };
    transformed: {
        description: string;
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

export type RouteMap = {
    [Routes.Relations]: Relations;
    [Routes.User]: User;
    [Routes.Character]: Character;
};
