import { bold, hyperlink, italic } from "@discordjs/formatters";
import type { Routes } from "../types.js";
import type { TransformersType } from "./index.js";
import { filteredDescription } from "./util.js";

export const affinityTransformer: TransformersType[Routes.Affinity] = async (data) => {
    const list = [];
    data.affinity.sort((a, b) => b.affinity - a.affinity);

    for (const user of data.affinity) {
        list.push(
            `${bold(`${user.affinity}%`)} with ${bold(hyperlink(user.user.name, user.user.siteUrl))} - [${italic(`${user.count} media shared`)}]`,
        );
    }

    const descriptionBuilder = [`${list.join("\n")}`];

    const filtered = filteredDescription(descriptionBuilder, false);
    return {
        description: filtered,
    };
};
