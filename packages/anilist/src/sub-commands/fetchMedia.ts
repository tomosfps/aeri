import { inlineCode } from "@discordjs/builders";
import { capitalise, env } from "core";
import { fetchAllUsers } from "database";
import { Logger } from "log";
import { checkResponse, filteredDescription } from "../util/anilistUtil.js";
import { fetchUserScores } from "./fetchUserData.js";

const logger = new Logger();

export async function fetchAnilistMedia(mediaType: string, mediaID: number, interaction: any): Promise<any> {
    const response = await fetch(`${env.API_URL}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            media_id: mediaID,
            media_type: mediaType,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return undefined;
    });
    const result = await checkResponse(response, "Media");

    if (result === null) {
        return null;
    }

    const genresToShow = result.genres.slice(0, 3);
    const additionalGenresCount = result.genres.length - genresToShow.length;
    const genresDisplay =
        genresToShow.join(", ") + (additionalGenresCount > 0 ? ` + ${additionalGenresCount} more` : "");

    const currentEpisode = result.airing[0] ? result.airing[0].episode - 1 : null;
    const nextEpisode = result.airing[0] ? interaction.format_seconds(result.airing[0].timeUntilAiring) : null;

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

    const guildId = BigInt(interaction.guild_id);
    const allUsers = await fetchAllUsers(guildId).then((users: any) => {
        logger.debugSingle(`Fetched ${users.length} users from the database`, "Anilist");
        return users.map((user: { anilist: any }) => user.anilist.id);
    });

    if (allUsers.length !== 0) {
        for (const member in allUsers) {
            const userScore = await fetchUserScores(Number(allUsers[member]), mediaID);
            logger.debug("User information", "Anilist", userScore);

            switch (userScore.status) {
                case "REPEATING":
                    userData.current.push(
                        `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.progress} | ${userScore.score}/10 (${userScore.repeat}) `)}\n`,
                    );
                    break;
                case "CURRENT": {
                    const userRepeats = userScore.repeat === 0 ? "" : `(${userScore.repeat})`;
                    userData.current.push(
                        `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.progress} | ${userScore.score}/10 ${userRepeats} `)}\n`,
                    );
                    break;
                }
                case "COMPLETED": {
                    const userRepeats = userScore.repeat === 0 ? "" : `(${userScore.repeat})`;
                    userData.completed.push(
                        `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.score}/10 ${userRepeats} `)}\n`,
                    );
                    break;
                }
                case "PLANNING":
                    userData.planning.push(`> ${inlineCode(userScore.user)}\n`);
                    break;
                case "DROPPED":
                    userData.dropped.push(
                        `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.progress} | ${userScore.score}/10 `)}\n`,
                    );
                    break;
                case "PAUSED":
                    userData.paused.push(
                        `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.progress} | ${userScore.score}/10 `)}\n`,
                    );
                    break;
                default:
                    break;
            }
        }
    }

    const descriptionBuilder = [
        `${inlineCode("total episodes    :")} ${result.episodes?.toLocaleString()}\n`,
        `${inlineCode("current episode   :")} ${currentEpisode?.toLocaleString()}\n`,
        `${inlineCode("next airing       :")} ${nextEpisode}\n`,
        `${inlineCode("chapters          :")} ${result.chapters?.toLocaleString()}\n`,
        `${inlineCode("volumes           :")} ${result.volumes?.toLocaleString()}\n`,
        `${inlineCode("status            :")} ${capitalise(result.status)}\n`,
        `${inlineCode("average score     :")} ${result.averageScore}%\n`,
        `${inlineCode("mean score        :")} ${result.meanScore}%\n`,
        `${inlineCode("popularity        :")} ${result.popularity.toLocaleString()}\n`,
        `${inlineCode("favourites        :")} ${result.favourites.toLocaleString()}\n`,
        `${inlineCode("start date        :")} ${result.startDate}\n`,
        `${inlineCode("end date          :")} ${result.endDate}\n`,
        `${inlineCode("genres            :")} ${genresDisplay}\n\n`,
        `${inlineCode("completed         :")} \n ${userData.completed.join("")}\n`,
        `${inlineCode("current           :")} \n ${userData.current.join("")}\n`,
        `${inlineCode("planning          :")} \n ${userData.planning.join("")}\n`,
        `${inlineCode("dropped           :")}\n ${userData.dropped.join("")}\n`,
        `${inlineCode("paused            :")}\n ${userData.paused.join("")}\n\n`,
    ];
    const filtered = filteredDescription(descriptionBuilder, false);
    return {
        result: result,
        description: filtered,
    };
}
