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
    `${inlineCode("Anime Favourites   :")}\n`;

    const animeDescription =
        data.favourites.anime.nodes?.length > 0
            ? data.favourites.anime.nodes
                  .map((anime) => {
                      return `[${bold(`${anime.title.romaji}`)}](${anime.siteUrl}) - ${bold(`[${anime.format}]`)}`;
                  })
                  .join("\n")
            : bold("No Anime Favourited");

    const mangaDescription =
        data.favourites.manga.nodes?.length > 0
            ? data.favourites.manga.nodes
                  .map((manga) => {
                      return `[${bold(`${manga.title.romaji}`)}](${manga.siteUrl}) - ${bold(`[${manga.format}]`)}`;
                  })
                  .join("\n")
            : bold("No Manga Favourited");

    return {
        description: description,
        animeFavourites: `${inlineCode("Anime Favourites   :")}\n${animeDescription}`,
        mangaFavourites: `${inlineCode("Manga Favourites   :")}\n${mangaDescription}`,
    };
};
