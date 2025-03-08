import { formatEmoji, inlineCode } from "@discordjs/formatters";
import { formatSeconds } from "core";
import { dbFetchAnilistUser, dbFetchGuildUsers } from "database";
import { mediaStatusString } from "../enums.js";
import { MediaListStatus, api } from "../index.js";
import { Routes } from "../types.js";
import type { TransformersType } from "./index.js";
import { filteredDescription, getNextAiringEpisode } from "./util.js";

export const mediaTransformer: TransformersType[Routes.Media] = async (data, { user_id, guild_id, pageOptions }) => {
    const genresToShow = data.genres.slice(0, 3);
    const additionalGenresCount = data.genres.length - genresToShow.length;
    const genresDisplay =
        genresToShow.join(", ") + (additionalGenresCount > 0 ? ` + ${additionalGenresCount} more` : "");

    const { nextEpisodeNumber, timeUntilNextEpisode } = getNextAiringEpisode(data.airing);
    const currentEpisode = nextEpisodeNumber ? nextEpisodeNumber - 1 : null;
    const nextEpisode = timeUntilNextEpisode ? formatSeconds(timeUntilNextEpisode) : null;

    const userData: {
        current: string[];
        planning: string[];
        completed: string[];
        dropped: string[];
        paused: string[];
    } = {
        current: [],
        planning: [],
        completed: [],
        dropped: [],
        paused: [],
    };

    const userResults: {
        username: string;
        score: number;
        progress: number;
        volumes: number;
        status: MediaListStatus;
    }[] = [];

    let allUsers: string[] = [];
    const currentUserData = await dbFetchAnilistUser(user_id);

    if (!pageOptions) {
        pageOptions = {
            page: 1,
            limit: 15,
        };
    }

    if (guild_id) {
        const guildUsersData = await dbFetchGuildUsers(guild_id);
        let allPotentialUsers = guildUsersData.map((user) => user.anilist?.username).filter(Boolean) as string[];

        if (currentUserData) {
            allPotentialUsers = [
                currentUserData.username,
                ...allPotentialUsers.filter((username) => username !== currentUserData.username),
            ];
        }

        const startIndex = (pageOptions.page - 1) * pageOptions.limit;
        allUsers = allPotentialUsers.slice(startIndex, startIndex + pageOptions.limit);
    } else if (currentUserData) {
        allUsers.push(currentUserData.username);
    }

    if (allUsers.length !== 0) {
        const maxLength = Math.max(...allUsers.map((user: any) => user.length + 2));

        for (const member in allUsers) {
            const { result: userScore, error } = await api.fetch(Routes.UserScore, {
                user_name: String(allUsers[member]),
                media_id: data.id,
            });

            if (error || !userScore) {
                continue;
            }

            userResults.push({
                username: userScore.username,
                score: userScore.score ?? 0,
                progress: userScore.progress ?? 0,
                volumes: userScore.volumes ?? 0,
                status: userScore.status ?? MediaListStatus.Current,
            });

            const formatProgress = userScore.progress?.toString().padStart(2, "0") ?? "00";
            const formatScore = userScore.score?.toString().padStart(2, "0") ?? "00";

            switch (userScore?.status) {
                case "REPEATING":
                    userData.current.push(
                        `> ${inlineCode(`${userScore.username.padEnd(maxLength)}:`)} ${inlineCode(` ${formatProgress} | ${formatScore}/10 (${userScore.repeat}) `)}\n`,
                    );
                    break;
                case "CURRENT": {
                    const userRepeats = userScore.repeat && userScore.repeat > 0 ? `(${userScore.repeat})` : "";
                    userData.current.push(
                        `> ${inlineCode(`${userScore.username.padEnd(maxLength)}:`)} ${inlineCode(` ${formatProgress} | ${formatScore}/10 ${userRepeats}`)}\n`,
                    );
                    break;
                }
                case "COMPLETED": {
                    const userRepeats = userScore.repeat && userScore.repeat > 0 ? `(${userScore.repeat})` : "";
                    userData.completed.push(
                        `> ${inlineCode(`${userScore.username.padEnd(maxLength)}:`)} ${inlineCode(` ${formatScore}/10 ${userRepeats}`)}\n`,
                    );
                    break;
                }
                case "PLANNING":
                    userData.planning.push(`> ${inlineCode(userScore.username)}\n`);
                    break;
                case "DROPPED":
                    userData.dropped.push(
                        `> ${inlineCode(`${userScore.username.padEnd(maxLength)}:`)} ${inlineCode(` ${formatProgress} | ${formatScore}/10 `)}\n`,
                    );
                    break;
                case "PAUSED":
                    userData.paused.push(
                        `> ${inlineCode(`${userScore.username.padEnd(maxLength)}:`)} ${inlineCode(` ${formatProgress} | ${formatScore}/10 `)}\n`,
                    );
                    break;
                default:
                    break;
            }
        }
    }

    const descriptionBuilder = [
        `${formatEmoji("1344752868753801336")} ${inlineCode("total episodes    :")} ${data.episodes?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1344752971816112158")} ${inlineCode("current episode   :")} ${currentEpisode?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1344752908679516233")} ${inlineCode("next airing       :")} ${nextEpisode}\n`,
        `${formatEmoji("1344752987582496829")} ${inlineCode("chapters          :")} ${data.chapters?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1344752859702366311")} ${inlineCode("volumes           :")} ${data.volumes?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1344752878794838016")} ${inlineCode("status            :")} ${mediaStatusString(data.status)}\n`,
        `${formatEmoji("1344753004443734017")} ${inlineCode("average score     :")} ${data.averageScore}%\n`,
        `${formatEmoji("1344752918041067635")} ${inlineCode("mean score        :")} ${data.meanScore}%\n`,
        `${formatEmoji("1344752971816112158")} ${inlineCode("popularity        :")} ${data.popularity?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1344752948055642142")} ${inlineCode("favourites        :")} ${data.favourites?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1344752996965154917")} ${inlineCode("start date        :")} ${data.startDate}\n`,
        `${formatEmoji("1344752996965154917")} ${inlineCode("end date          :")} ${data.endDate}\n`,
        `${formatEmoji("1344752926308171859")} ${inlineCode("genres            :")} ${genresDisplay}\n\n`,
    ];

    if (userData.completed.length > 0) {
        descriptionBuilder.push(
            `${formatEmoji("1344753004443734017")} ${inlineCode("completed         :")}\n${userData.completed.join("")}\n`,
        );
    }
    if (userData.current.length > 0) {
        descriptionBuilder.push(
            `${formatEmoji("1344752979236094024")} ${inlineCode("current           :")}\n${userData.current.join("")}\n`,
        );
    }
    if (userData.planning.length > 0) {
        descriptionBuilder.push(
            `${formatEmoji("1344752889003773994")} ${inlineCode("planning          :")}\n${userData.planning.join("")}\n`,
        );
    }
    if (userData.dropped.length > 0) {
        descriptionBuilder.push(
            `${formatEmoji("1344752960705400933")} ${inlineCode("dropped           :")}\n${userData.dropped.join("")}\n`,
        );
    }
    if (userData.paused.length > 0) {
        descriptionBuilder.push(
            `${formatEmoji("1344752900328525926")} ${inlineCode("paused            :")}\n${userData.paused.join("")}\n`,
        );
    }

    const filtered = filteredDescription(descriptionBuilder, false);

    return {
        description: filtered,
        userResults,
        pagination: {
            currentPage: pageOptions.page,
            totalPages: pageOptions.limit,
        },
    };
};
