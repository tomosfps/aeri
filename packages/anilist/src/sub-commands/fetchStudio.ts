import { bold, inlineCode } from "@discordjs/builders";
import { capitalise, env } from "core";
import { Logger } from "log";
import { checkResponse, filteredDescription, truncateAnilistIfExceedsDescription } from "../util/anilistUtil.js";

const logger = new Logger();

export async function fetchAnilistStudio(studio_name: string): Promise<any> {
    const response = await fetch(`${env.API_URL}/studio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            studio_name: studio_name,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });
    const result = await checkResponse(response, "Studio");

    if (result === null) {
        return null;
    }

    logger.debug("Studio data", "Anilist", result);

    const descriptionBuilder = [
        `${inlineCode("Type Of Studio    :")} ${result.isAnimationStudio ? "Animation Studio" : "Production Studio"}\n`,
        `${inlineCode("Favourites        :")} ${result.favourites?.toLocaleString()}\n`,
    ];
    const filtered = filteredDescription(descriptionBuilder.join(""), false);

    let animeList = result.media
        .filter((media: any) => media.format !== "MANGA" && media.format !== "NOVEL" && media.format !== "ONE_SHOT")
        .map((media: any) => {
            const format = media.format === null ? "Unknown" : media.format;
            return `${bold(`[${media.title.romaji}](${media.siteUrl})`)} - (${capitalise(format)})`;
        })
        .join("\n");

    const maxDescriptionLength = 4096;
    const animeMaxLength = (filtered + animeList).length;

    if (animeMaxLength > maxDescriptionLength) {
        const excessLength = animeMaxLength - maxDescriptionLength;
        const itemsToRemove = Math.ceil(
            excessLength / (animeList[0].title.romaji.length + animeList[0].siteUrl.length + 20),
        );
        animeList = truncateAnilistIfExceedsDescription(animeList, itemsToRemove);
    }

    return {
        result: result,
        description: filtered,
        animeDescription: `\n${inlineCode("Anime List        :")}\n${animeList}`,
    };
}
