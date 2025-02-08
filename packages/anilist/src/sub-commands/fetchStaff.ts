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

export async function fetchAnilistStaff(staff_name: string, media_type?: string): Promise<any> {
    let json = JSON.stringify({});

    if (media_type) {
        json = JSON.stringify({
            staff_name: staff_name,
            media_type: media_type,
        });
    } else {
        json = JSON.stringify({
            staff_name: staff_name,
        });
    }

    const response = await fetch(`${env.API_URL}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });
    const result = await checkResponse(response, "Staff");

    if (result === null) {
        return null;
    }

    logger.debug("Staff found!", "Anilist", result);

    const descriptionBuilder = [
        `${inlineCode("Age               :")} ${result.age}\n`,
        `${inlineCode("Gender            :")} ${result.gender}\n`,
        `${inlineCode("Birth             :")} ${result.dateOfBirth}\n`,
        `${inlineCode("Death             :")} ${result.dateOfDeath}\n`,
        `${inlineCode("Language          :")} ${result.language}\n`,
        `${inlineCode("Home Town         :")} ${result.home}\n`,
        `${inlineCode("Favourites        :")} ${result.favourites?.toLocaleString()}\n`,
    ];

    const filtered = filteredDescription(descriptionBuilder.join(""), false);
    let animeList = result.staffData
        .filter((media: any) => media.format !== "MANGA" && media.format !== "NOVEL" && media.format !== "ONE_SHOT")
        .map((media: any) => {
            const format = media.format === null ? "Unknown" : media.format;
            return `${bold(`[${media.title.romaji}](${media.siteUrl})`)} - (${capitalise(format)})`;
        })
        .join("\n");

    let mangaList = result.staffData
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
        animeDescription: `\n${inlineCode("Anime List        :")}\n${animeList}`,
        mangaDescription: `\n${inlineCode("Manga List        :")}\n${mangaList}`,
    };
}
