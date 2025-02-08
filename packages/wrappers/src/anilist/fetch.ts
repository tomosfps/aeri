import { env } from "core";
import type { AiringType, DataFrom, MediaFormat, MediaType } from "./enums.js";
import { validateResponse } from "./util.js";

export enum Routes {
    Relations = "relations",
}

type RouteBodyMap = {
    [Routes.Relations]: {
        media_name: string;
        media_type: MediaType;
    };
};

type relation = {
    airingType: AiringType;
    dataFrom: DataFrom;
    english: string;
    format: MediaFormat;
    id: number;
    native: string;
    romaji: string;
    similarity: number;
    synonyms: string[];
    type: MediaType;
};

type RouteResponseMap = {
    [Routes.Relations]: { relations: relation[] };
};

export async function anilistFetch<T extends Routes>(route: T, body: RouteBodyMap[T]): Promise<RouteResponseMap[T]> {
    const response = await fetch(`${env.API_URL}/${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    return await validateResponse<RouteResponseMap[T]>(response);
}
