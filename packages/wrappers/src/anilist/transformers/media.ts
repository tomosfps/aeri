import { formatEmoji, inlineCode } from "@discordjs/formatters";
import { formatSeconds } from "core";
import { dbFetchGuildUsers } from "database";
import { mediaStatusString } from "../enums.js";
import { MediaListStatus, api } from "../index.js";
import { Routes } from "../types.js";
import type { TransformersType } from "./index.js";
import { filteredDescription } from "./util.js";

export const mediaTransformer: TransformersType[Routes.Media] = async (data, { guild_id }) => {
    const genresToShow = data.genres.slice(0, 3);
    const additionalGenresCount = data.genres.length - genresToShow.length;
    const genresDisplay =
        genresToShow.join(", ") + (additionalGenresCount > 0 ? ` + ${additionalGenresCount} more` : "");

    const currentEpisode = data.airing?.[0]?.nodes?.[0]?.episode ? data.airing[0].nodes[0].episode - 1 : null;
    const nextEpisode = data.airing?.[0]?.nodes?.[0]?.episode
        ? formatSeconds(data.airing[0].nodes[0].timeUntilAiring)
        : null;

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

    const userResults: { username: string; score: number; progress: number; status: MediaListStatus }[] = [];
    const allUsers = await dbFetchGuildUsers(guild_id).then((users) => {
        return users.map((user) => user.anilist?.username).filter((username) => username !== undefined);
    });

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
                status: userScore.status ?? MediaListStatus.Current,
            });

            const formatProgress = userScore.progress?.toString().padStart(2, "0") ?? "00";
            const formatScore = userScore.score?.toString().padStart(2, "0") ?? "00";

            switch (userScore?.status) {
                case "REPEATING":
                    userData.current.push(
                        `> ${inlineCode(`${userScore.username.padEnd(maxLength)}:`)} ${inlineCode(` ${formatProgress} | ${formatScore}/10 (${userScore.repeat})`)}\n`,
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
                        `> ${inlineCode(`${userScore.username.padEnd(maxLength)}:`)} ${inlineCode(` ${formatProgress} | ${formatScore}/10`)}\n`,
                    );
                    break;
                case "PAUSED":
                    userData.paused.push(
                        `> ${inlineCode(`${userScore.username.padEnd(maxLength)}:`)} ${inlineCode(` ${formatProgress} | ${formatScore}/10`)}\n`,
                    );
                    break;
                default:
                    break;
            }
        }
    }

    const descriptionBuilder = [
        `${formatEmoji("1343816899493888031")} ${inlineCode("total episodes    :")} ${data.episodes?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1343816811325558846")} ${inlineCode("current episode   :")} ${currentEpisode?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1343816859690078289")} ${inlineCode("next airing       :")} ${nextEpisode}\n`,
        `${formatEmoji("1343816792170303580")} ${inlineCode("chapters          :")} ${data.chapters?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1343816899493888031")} ${inlineCode("volumes           :")} ${data.volumes?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1343816883924893746")} ${inlineCode("status            :")} ${mediaStatusString(data.status)}\n`,
        `${formatEmoji("1343818590037741639")} ${inlineCode("average score     :")} ${data.averageScore}%\n`,
        `${formatEmoji("1343816851699793930")} ${inlineCode("mean score        :")} ${data.meanScore}%\n`,
        `${formatEmoji("1343816811325558846")} ${inlineCode("popularity        :")} ${data.popularity?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1343816833488257086")} ${inlineCode("favourites        :")} ${data.favourites?.toLocaleString("en-US")}\n`,
        `${formatEmoji("1343816783890743336")} ${inlineCode("start date        :")} ${data.startDate}\n`,
        `${formatEmoji("1343816783890743336")} ${inlineCode("end date          :")} ${data.endDate}\n`,
        `${formatEmoji("1343816843101732946")} ${inlineCode("genres            :")} ${genresDisplay}\n\n`,
        `${formatEmoji("1343818590037741639")} ${inlineCode("completed         :")}\n${userData.completed.join("")}\n`,
        `${formatEmoji("1343816800353259541")} ${inlineCode("current           :")}\n${userData.current.join("")}\n`,
        `${formatEmoji("1343816875770904586")} ${inlineCode("planning          :")}\n${userData.planning.join("")}\n`,
        `${formatEmoji("1343816819999248444")} ${inlineCode("dropped           :")}\n${userData.dropped.join("")}\n`,
        `${formatEmoji("1343816867411918918")} ${inlineCode("paused            :")}\n${userData.paused.join("")}\n\n`,
    ];

    const filtered = filteredDescription(descriptionBuilder, false);

    return {
        description: filtered,
        userResults,
    };
};
