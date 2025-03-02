import { mediaFormatString, mediaStatusString, mediaTypeString } from "../enums.js";
import type { Routes } from "../types.js";
import type { TransformersType } from "./index.js";

export const relationsTransformer: TransformersType[Routes.Relations] = async (data) => {
    return {
        relations: data.relations.map((relation) => {
            return {
                airingType: mediaStatusString(relation.airingType),
                english: relation.english,
                format: mediaFormatString(relation.format),
                id: relation.id,
                native: relation.native,
                romaji: relation.romaji,
                similarity: relation.similarity,
                synonyms: relation.synonyms,
                type: mediaTypeString(relation.type),
            };
        }),
    };
};
