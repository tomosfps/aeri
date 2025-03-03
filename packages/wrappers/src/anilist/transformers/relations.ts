import { mediaFormatString, mediaStatusString, mediaTypeString } from "../enums.js";
import type { Routes } from "../types.js";
import type { TransformersType } from "./index.js";

export const relationsTransformer: TransformersType[Routes.Relations] = async (data, { isAutoComplete }) => {
    return {
        relations: data.relations
            .filter((relation) => {
                if (isAutoComplete === false) {
                    if (relation.isAdult === true || relation.genres?.includes("Hentai")) {
                        return false;
                    }
                }
                return true;
            })
            .map((relation) => {
                return {
                    airingType: mediaStatusString(relation.airingType),
                    english: relation.english,
                    format: mediaFormatString(relation.format),
                    id: relation.id,
                    isAdult: relation.isAdult,
                    native: relation.native,
                    genres: relation.genres,
                    romaji: relation.romaji,
                    similarity: relation.similarity,
                    synonyms: relation.synonyms,
                    type: mediaTypeString(relation.type),
                    isNSFW: relation.genres?.includes("Hentai") || relation.isAdult,
                };
            }),
    };
};
