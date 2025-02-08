import { bold, inlineCode } from "@discordjs/builders";
import { env } from "core";
import { Logger } from "logger";
import { checkResponse } from "../util/anilistUtil.js";

const logger = new Logger();

export async function fetchUserScores(user: number, media_id: number) {
    const response = await fetch(`${env.API_URL}/user/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: user,
            media_id: media_id,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });
    const result = await checkResponse(response, "User Score");
    return result;
}

export async function fetchAnilistUserData(username: string, interaction: any): Promise<any> {
    const response = await fetch(`${env.API_URL}/user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: username,
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });

    const result = await checkResponse(response, "User");

    if (result === null || result.error) {
        logger.error("An error occurred while fetching data from the API.", "Anilist", result);
        return null;
    }

    const descriptionBuilder =
        `[${bold("Anime Information")}](${result.url}/animelist)\n` +
        `${inlineCode("Anime Count        :")} ${result.animeStats.count?.toLocaleString()}\n` +
        `${inlineCode("Mean Score         :")} ${result.animeStats.meanScore}\n` +
        `${inlineCode("Episodes Watched   :")} ${result.animeStats.watched?.toLocaleString()}\n` +
        `${inlineCode("Watch Time         :")} ${interaction.format_seconds(result.animeStats.minutes * 60)}\n\n` +
        `[${bold("Manga Information")}](${result.url}/mangalist)\n` +
        `${inlineCode("Manga Count        :")} ${result.mangaStats.count?.toLocaleString()}\n` +
        `${inlineCode("Mean Score         :")} ${result.mangaStats.meanScore}\n` +
        `${inlineCode("Chapters Read      :")} ${result.mangaStats.chapters?.toLocaleString()}\n` +
        `${inlineCode("Volumes Read       :")} ${result.mangaStats.volumes?.toLocaleString()}\n\n` +
        `[${bold("Other Statistics")}](${result.url}/stats/anime/overview)\n` +
        `${inlineCode("Total Entries      :")} ${result.totalEntries?.toLocaleString()}\n` +
        `${inlineCode("Top Genre          :")} ${result.topGenre}\n` +
        `${inlineCode("Favourite Format   :")} ${result.favouriteFormat}\n` +
        `${inlineCode("Completion Rate    :")} ${result.completionPercentage}%\n`;

    return {
        result: result,
        description: descriptionBuilder,
    };
}
