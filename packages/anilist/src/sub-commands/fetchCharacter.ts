import { bold, inlineCode } from "@discordjs/builders";
import { capitalise, env } from "core";
import { Logger } from "logger";
import {
    checkResponse,
    filteredDescription,
    truncateAnilistDescription,
    truncateAnilistIfExceedsDescription,
} from "../util/anilistUtil.js";

const logger = new Logger();

export async function fetchAnilistCharacter(character_name: string): Promise<any> {
    const response = await fetch(`${env.API_URL}/character`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            character_name: character_name,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });
    const result = await checkResponse(response, "Character");

    if (result === null) {
        return null;
    }

    logger.debug("Character data", "Anilist", result);

    const alternativeNames =
        result.alternativeNames !== undefined && result.alternativeNames.length > 0
            ? result.alternativeNames.slice(0, 3).join(", ") +
              (result.alternativeNames.length > 3 ? ` + ${result.alternativeNames.length - 3} more` : "")
            : "None";

    const descriptionBuilder = [
        `${inlineCode("Age               :")} ${result.age}\n`,
        `${inlineCode("Gender            :")} ${result.gender}\n`,
        `${inlineCode("Date Of Birth     :")} ${result.dateOfBirth}\n`,
        `${inlineCode("Favourites        :")} ${result.favourites?.toLocaleString()}\n`,
        `${inlineCode("Alternative Names :")} ${alternativeNames}\n`,
    ];

    const addOnDescription = `${inlineCode("Description       :")}\n${result.description}\n`;
    const filteredAddOn = filteredDescription(addOnDescription, true);

    const filtered = filteredDescription(descriptionBuilder.join(""), false);
    let animeList = result.media
        .filter((media: any) => media.format !== "MANGA" && media.format !== "NOVEL" && media.format !== "ONE_SHOT")
        .map((media: any) => {
            const format = media.format === null ? "Unknown" : media.format;
            return `${bold(`[${media.title.romaji}](${media.siteUrl})`)} - (${capitalise(format)})`;
        })
        .join("\n");

    let mangaList = result.media
        .filter((media: any) => media.format === "MANGA" || media.format === "NOVEL" || media.format === "ONE_SHOT")
        .map((manga: any) => {
            let format = manga.format === "ONE_SHOT" ? "One Shot" : manga.format;
            format = format === null ? "Unknown" : format;
            return `${bold(`[${manga.title.romaji}](${manga.siteUrl})`)} - (${capitalise(format)})`;
        })
        .join("\n");

    const maxDescriptionLength = 4096;
    const animeMaxLength = (filtered + animeList).length;
    const mangaMaxLength = (filtered + mangaList).length;

    if (animeMaxLength > maxDescriptionLength) {
        const excessLength = animeMaxLength - maxDescriptionLength;
        const itemsToRemove = Math.ceil(
            excessLength / (animeList[0].title.romaji.length + animeList[0].siteUrl.length + 20),
        );
        animeList = truncateAnilistIfExceedsDescription(animeList, itemsToRemove);
    }

    if (mangaMaxLength > maxDescriptionLength) {
        const excessLength = mangaMaxLength - maxDescriptionLength;
        const itemsToRemove = Math.ceil(
            excessLength / (mangaList[0].title.romaji.length + mangaList[0].siteUrl.length + 20),
        );
        mangaList = truncateAnilistDescription(mangaList, itemsToRemove);
    }

    return {
        result: result,
        description: filtered,
        addOnDescription: `\n${filteredAddOn}`,
        animeDescription: `\n${inlineCode("Anime List        :")}\n${animeList}`,
        mangaDescription: `\n${inlineCode("Manga List        :")}\n${mangaList}`,
    };
}
