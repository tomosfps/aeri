import { bold, hyperlink, italic } from "@discordjs/formatters";
import type { Routes } from "../types.js";
import type { TransformersType } from "./index.js";
import { filteredDescription } from "./util.js";

export const affinityTransformer: TransformersType[Routes.Affinity] = async (data, { pageOptions }) => {
    if (!pageOptions) {
        pageOptions = {
            page: 1,
            limit: 20,
        };
    }

    // Sort by affinity in descending order
    data.affinity.sort((a, b) => b.affinity - a.affinity);

    // Calculate pagination values
    const totalItems = data.affinity.length;
    const totalPages = Math.ceil(totalItems / pageOptions.limit);
    const currentPage = Math.min(pageOptions.page, totalPages) || 1;

    // Get the items for the current page
    const startIndex = (currentPage - 1) * pageOptions.limit;
    const endIndex = Math.min(startIndex + pageOptions.limit, totalItems);
    const paginatedAffinity = data.affinity.slice(startIndex, endIndex);

    const list = [];
    for (const user of paginatedAffinity) {
        list.push(
            `${bold(`${user.affinity.toFixed(2)}%`)} with ${bold(hyperlink(user.user.name, user.user.siteUrl))} - [${italic(`${user.count} media shared`)}]`,
        );
    }

    const descriptionBuilder = [`${list.join("\n")}`];

    const filtered = filteredDescription(descriptionBuilder, false);
    return {
        description: filtered,
        pagination: {
            currentPage,
            totalPages,
        },
    };
};
