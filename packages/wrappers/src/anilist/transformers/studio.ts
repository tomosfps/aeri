import { bold, formatEmoji, inlineCode } from "@discordjs/formatters";
import { capitalise } from "core";
import type { Routes } from "../types.js";
import type { TransformersType } from "./index.js";
import { filteredDescription, truncateAnilistIfExceedsDescription } from "./util.js";

const MAX_DESCRIPTION_LENGTH = 4096;

export const studioTransformer: TransformersType[Routes.Studio] = (data) => {
    const descriptionBuilder = [
        `${formatEmoji("1343816892531474444")} ${inlineCode("Type Of Studio    :")} ${data.isAnimationStudio ? "Animation Studio" : "Production Studio"}\n`,
        `${formatEmoji("1343816833488257086")} ${inlineCode("Favourites        :")} ${data.favourites?.toLocaleString("en-US")}\n`,
    ];

    const filtered = filteredDescription(descriptionBuilder.join(""), false);
    const animeList = data.media.nodes.filter(
        (media: any) => media.format !== "MANGA" && media.format !== "NOVEL" && media.format !== "ONE_SHOT",
    );

    let animeListString = animeList
        .map((media: any) => {
            const format = media.format === null ? "Unknown" : media.format;
            return `${bold(`[${media.title.romaji}](${media.siteUrl})`)} - (${capitalise(format)})`;
        })
        .join("\n");

    const animeMaxLength = (filtered + animeListString).length;

    if (animeMaxLength > MAX_DESCRIPTION_LENGTH) {
        const excessLength = animeMaxLength - MAX_DESCRIPTION_LENGTH;
        const itemsToRemove = animeList[0]
            ? Math.ceil(
                  excessLength /
                      ((animeList[0].title.romaji ? animeList[0].title.romaji.length : 0) +
                          animeList[0].siteUrl.length +
                          20),
              )
            : 0;
        animeListString = truncateAnilistIfExceedsDescription(animeListString, itemsToRemove);
    }

    return {
        description: filtered,
        animeDescription: `\n${formatEmoji("1343816800353259541")} ${inlineCode("Anime List        :")}\n${animeListString}`,
    };
};
