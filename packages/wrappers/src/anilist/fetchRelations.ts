import type { AiringType, DataFrom, MediaFormat, MediaType } from "./enums.js";
import { validateResponse } from "./util.js";
import { anilistFetch, Route } from "./fetch.js";

export type relation = {
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
}

export async function fetchRelations(media_name: string, media_type: string): Promise<relation[]> {
    const response = await anilistFetch(Route.Relations, {
        media_name: media_name,
        media_type: media_type,
    })

    return await validateResponse<relation[]>(response);
}
