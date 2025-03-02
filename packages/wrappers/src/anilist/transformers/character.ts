import { bold, formatEmoji, inlineCode } from "@discordjs/formatters";
import { capitalise } from "core";
import type { Routes } from "../types.js";
import type { TransformersType } from "./index.js";
import { filteredDescription, truncateAnilistDescription, truncateAnilistIfExceedsDescription } from "./util.js";

const MAX_DESCRIPTION_LENGTH = 4096;

export const characterTransformer: TransformersType[Routes.Character] = (data) => {
    const alternativeNames =
        data.alternativeNames !== undefined && data.alternativeNames.length > 0
            ? data.alternativeNames.slice(0, 3).join(", ") +
              (data.alternativeNames.length > 3 ? ` + ${data.alternativeNames.length - 3} more` : "")
            : "None";

    const descriptionBuilder = [
        `${formatEmoji("1344752792140513342")} ${inlineCode("Age               :")} ${data.age}\n`,
        `${formatEmoji("1344752784544628798")} ${inlineCode("Gender            :")} ${data.gender}\n`,
        `${formatEmoji("1344752996965154917")} ${inlineCode("Date Of Birth     :")} ${data.dateOfBirth}\n`,
        `${formatEmoji("1344752948055642142")} ${inlineCode("Favourites        :")} ${data.favourites?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1344752820875825282")} ${inlineCode("Alternative Names :")} ${alternativeNames}\n`,
    ];

    const addOnDescription = `${formatEmoji("1344752799317102593")} ${inlineCode("Description       :")}\n${data.description}\n`;
    const filteredAddOn = filteredDescription(addOnDescription, true);

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

    const mangaList = data.media.nodes.filter(
        (media: any) => media.format === "MANGA" || media.format === "NOVEL" || media.format === "ONE_SHOT",
    );

    let mangaListString = mangaList
        .map((manga: any) => {
            let format = manga.format === "ONE_SHOT" ? "One Shot" : manga.format;
            format = format === null ? "Unknown" : format;
            return `${bold(`[${manga.title.romaji}](${manga.siteUrl})`)} - (${capitalise(format)})`;
        })
        .join("\n");

    const animeMaxLength = (filtered + animeListString).length;
    const mangaMaxLength = (filtered + mangaListString).length;

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

    if (mangaMaxLength > MAX_DESCRIPTION_LENGTH) {
        const excessLength = mangaMaxLength - MAX_DESCRIPTION_LENGTH;
        const itemsToRemove = mangaList[0]
            ? Math.ceil(
                  excessLength /
                      ((mangaList[0].title.romaji ? mangaList[0].title.romaji.length : 0) +
                          mangaList[0].siteUrl.length +
                          20),
              )
            : 0;
        mangaListString = truncateAnilistDescription(mangaListString, itemsToRemove);
    }

    return {
        description: filtered,
        addOnDescription: `\n${filteredAddOn}`,
        animeDescription: `\n${formatEmoji("1344752979236094024")} ${inlineCode("Anime List        :")}\n${animeListString}`,
        mangaDescription: `\n${formatEmoji("1344752859702366311")} ${inlineCode("Manga List        :")}\n${mangaListString}`,
    };
};
