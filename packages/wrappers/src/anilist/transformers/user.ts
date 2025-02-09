import { bold, inlineCode } from "@discordjs/formatters";
import { formatSeconds } from "core";
import type { Routes } from "../types.js";
import type { TransformersType } from "./index.js";

export const userTransformer: TransformersType[Routes.User] = (data) => {
    const description =
        `[${bold("Anime Information")}](${data.siteUrl}/animelist)\n` +
        `${inlineCode("Anime Count        :")} ${data.animeStats.count?.toLocaleString("en-US")}\n` +
        `${inlineCode("Mean Score         :")} ${data.animeStats.meanScore.toFixed(2)}\n` +
        `${inlineCode("Episodes Watched   :")} ${data.animeStats.watched?.toLocaleString("en-US")}\n` +
        `${inlineCode("Watch Time         :")} ${formatSeconds(data.animeStats.minutes * 60)}\n\n` +
        `[${bold("Manga Information")}](${data.siteUrl}/mangalist)\n` +
        `${inlineCode("Manga Count        :")} ${data.mangaStats.count?.toLocaleString("en-US")}\n` +
        `${inlineCode("Mean Score         :")} ${data.mangaStats.meanScore.toFixed(2)}\n` +
        `${inlineCode("Chapters Read      :")} ${data.mangaStats.chapters?.toLocaleString("en-US")}\n` +
        `${inlineCode("Volumes Read       :")} ${data.mangaStats.volumes?.toLocaleString("en-US")}\n\n` +
        `[${bold("Other Statistics")}](${data.siteUrl}/stats/anime/overview)\n` +
        `${inlineCode("Total Entries      :")} ${data.totalEntries?.toLocaleString("en-US")}\n` +
        `${inlineCode("Top Genre          :")} ${data.topGenre}\n` +
        `${inlineCode("Favourite Format   :")} ${data.favouriteFormat}\n` +
        `${inlineCode("Completion Rate    :")} ${data.completionPercentage}%\n`;

    return { description };
};
