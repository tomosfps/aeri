import { bold, hyperlink } from "@discordjs/formatters";
import type { Routes } from "../types.js";
import type { TransformersType } from "./index.js";
import { filteredDescription, truncateAnilistIfExceedsDescription } from "./util.js";

const MAX_DESCRIPTION_LENGTH = 4096;

export const watchListTransformer: TransformersType[Routes.WatchList] = (data) => {
    const formatted = data.list
        .map((item) => {
            return `${bold(hyperlink(item.title.english || item.title.romaji || item.title.native || "", item.site_url))} - [${bold(item.format)}]`;
        })
        .join("\n");

    const filtered = filteredDescription(formatted, false);
    const maxLength = filtered.length;

    if (maxLength > MAX_DESCRIPTION_LENGTH) {
        const excessLength = maxLength - MAX_DESCRIPTION_LENGTH;
        const itemsToRemove = Math.ceil(excessLength / filtered.length);
        const truncated = truncateAnilistIfExceedsDescription(filtered, itemsToRemove);

        return {
            description: truncated,
        };
    }

    if (filtered.length === 0) {
        return {
            description: "No items found.",
        };
    }

    return {
        description: filtered,
    };
};
