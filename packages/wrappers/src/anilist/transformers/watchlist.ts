import { bold, hyperlink } from "@discordjs/formatters";
import type { Routes } from "../types.js";
import type { TransformersType } from "./index.js";
import { filteredDescription } from "./util.js";

export const watchListTransformer: TransformersType[Routes.WatchList] = async (data, { pageOptions }) => {
    if (!pageOptions) {
        pageOptions = {
            page: 1,
            limit: 15,
        };
    }

    const startIndex = (pageOptions.page - 1) * pageOptions.limit;
    const endIndex = startIndex + pageOptions.limit;
    const paginatedList = data.list.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.list.length / pageOptions.limit);

    const formatted = paginatedList
        .map((item: any) => {
            return `${bold(hyperlink(item.title.english || item.title.romaji || item.title.native || "", item.site_url))} - [${bold(item.format)}]`;
        })
        .join("\n");

    const filtered = filteredDescription(formatted, false);

    if (filtered.length === 0) {
        return {
            description: "No items found.",
            pagination: {
                currentPage: pageOptions.page,
                totalPages: 1,
            },
        };
    }

    return {
        description: filtered,
        pagination: {
            currentPage: pageOptions.page,
            totalPages: totalPages,
        },
    };
};
