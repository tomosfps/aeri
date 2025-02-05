import { bold, inlineCode } from "@discordjs/builders";
import { capitalise, env } from "core";
import { fetchAllUsers } from "database";
import { Logger } from "log";

const logger = new Logger();

async function checkResponse(response: any, type: string): Promise<any> {
    if (response === null) {
        logger.error(`Request returned null for type ${type}`, "Anilist");
        return null;
    }

    const result = await response.json().catch((error: any) => {
        logger.error(`Error while parsing JSON data for type ${type}`, "Anilist", error);
        return null;
    });

    if (result === null) {
        logger.errorSingle(`Request returned null for type ${type}`, "Anilist");
        return null;
    }

    logger.debug(`Returning result for type: ${type}`, "Anilist", result);
    return result;
}

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
    logger.debug("Result from API", "Anilist", result);

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
            const userScore = await fetchUserData(Number(allUsers[member]), mediaID);
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

    const filteredDescription = descriptionBuilder.filter((line) => {
        return !(
            /^\s*$/.test(line) ||
            /null/.test(line) ||
            /undefined/.test(line) ||
            line === "`completed         :`\n \n" ||
            line === "`current           :`\n \n" ||
            line === "`planning          :`\n \n" ||
            line === "`dropped           :`\n \n" ||
            line === "`paused            :`\n \n\n"
        );
    });

    return {
        result: result,
        description: filteredDescription,
    };
}

async function fetchUserData(user: number, media: number) {
    const response = await fetch(`${env.API_URL}/user/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: user,
            media_id: media,
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
    logger.debug("Result from API", "Anilist", result);

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

export async function fetchRecommendation(mediaType: string, genres: string[]): Promise<any> {
    const response = await fetch(`${env.API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            media: mediaType,
            genres: genres,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });

    const result = await checkResponse(response, "Recommendation");
    return result;
}

export async function fetchAnilistRelations(media_name: string, media_type: string): Promise<any> {
    const response = await fetch(`${env.API_URL}/relations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            media_name: media_name,
            media_type: media_type,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });

    if (response === null) {
        logger.error("Request returned null", "Anilist");
        return null;
    }

    const result = await checkResponse(response, "Relations");
    return result.relations;
}

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

    if (response === null) {
        logger.error("Request returned null", "Anilist");
        return null;
    }

    const result = await checkResponse(response, "Character");
    return result;
}

export async function fetchAnilistStaff(staff_name: string): Promise<any> {
    const response = await fetch(`${env.API_URL}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            staff_name: staff_name,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });

    if (response === null) {
        logger.error("Request returned null", "Anilist");
        return null;
    }

    const result = await checkResponse(response, "Staff");
    return result;
}

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

    if (response === null) {
        logger.error("Request returned null", "Anilist");
        return null;
    }

    const result = await checkResponse(response, "Studio");
    return result;
}
