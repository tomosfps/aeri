import { bold, formatEmoji, inlineCode } from "@discordjs/formatters";
import { formatSeconds } from "core";
import { mediaFormatString } from "../enums.js";
import type { Routes } from "../types.js";
import type { TransformersType } from "./index.js";

export const userTransformer: TransformersType[Routes.User] = (data) => {
    const description =
        `[${bold("Anime Information")}](${data.siteUrl}/animelist)\n` +
        `${formatEmoji("1344752859702366311")} ${inlineCode("Anime Count        :")} ${data.statistics.anime.count?.toLocaleString("en-US")}\n` +
        `${formatEmoji("1344752918041067635")} ${inlineCode("Mean Score         :")} ${data.statistics.anime.meanScore.toFixed(2)}\n` +
        `${formatEmoji("1344752979236094024")} ${inlineCode("Episodes Watched   :")} ${data.statistics.anime.episodesWatched?.toLocaleString("en-US")}\n` +
        `${formatEmoji("1344752987582496829")} ${inlineCode("Watch Time         :")} ${formatSeconds(data.statistics.anime.minutesWatched * 60)}\n\n` +
        `[${bold("Manga Information")}](${data.siteUrl}/mangalist)\n` +
        `${formatEmoji("1344752859702366311")} ${inlineCode("Manga Count        :")} ${data.statistics.manga.count?.toLocaleString("en-US")}\n` +
        `${formatEmoji("1344752918041067635")} ${inlineCode("Mean Score         :")} ${data.statistics.manga.meanScore.toFixed(2)}\n` +
        `${formatEmoji("1344752987582496829")} ${inlineCode("Chapters Read      :")} ${data.statistics.manga.chaptersRead?.toLocaleString("en-US")}\n` +
        `${formatEmoji("1344752859702366311")} ${inlineCode("Volumes Read       :")} ${data.statistics.manga.volumesRead?.toLocaleString("en-US")}\n\n` +
        `[${bold("Other Statistics")}](${data.siteUrl}/stats/anime/overview)\n` +
        `${formatEmoji("1344752859702366311")} ${inlineCode("Total Entries      :")} ${data.totalEntries?.toLocaleString("en-US")}\n` +
        `${formatEmoji("1344753004443734017")} ${inlineCode("Top Genre          :")} ${data.topGenre}\n` +
        `${formatEmoji("1344752832397447298")} ${inlineCode("Favourite Format   :")} ${mediaFormatString(data.topFormat)}\n` +
        `${formatEmoji("1344752841121857536")} ${inlineCode("Completion Rate    :")} ${data.completionRate}%\n`;

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
        animeFavourites: `${formatEmoji("1344752979236094024")} ${inlineCode("Anime Favourites   :")}\n${animeDescription}`,
        mangaFavourites: `${formatEmoji("1344752859702366311")} ${inlineCode("Manga Favourites   :")}\n${mangaDescription}`,
        favouriteFormat: mediaFormatString(data.topFormat),
    };
};
