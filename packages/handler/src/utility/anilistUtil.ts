import { bold, inlineCode } from "@discordjs/builders";
import { env } from "core";
import { fetchAllUsers } from "database";
import { Logger } from "log";

const logger = new Logger();
export function intervalTime(seconds: number, granularity = 2): string {
    const intervals: [string, number][] = [
        ["weeks", 604800],
        ["days", 86400],
        ["hours", 3600],
        ["minutes", 60],
        ["seconds", 1],
    ];

    const result: string[] = [];
    let secondsLeft = seconds;

    for (const [name, count] of intervals) {
        const value = Math.floor(secondsLeft / count);
        if (value) {
            secondsLeft -= value * count;
            let formattedName = name;
            if (value === 1) {
                formattedName = name.slice(0, -1); // Remove 's' for singular
            }
            result.push(`${value} ${formattedName}`);
        }
    }

    return result.slice(0, granularity).join(", ");
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

    if (response === null || response === undefined) {
        logger.error("Request returned null", "Anilist");
        return undefined;
    }

    const result = await response.json().catch((error) => {
        logger.error("Error while parsing JSON data.", "Anilist", error);
        return undefined;
    });

    if (result.error) {
        logger.error("An Error Occured when trying to access the API", "Anilist", result);
        return undefined;
    }

    const genresToShow = result.genres.slice(0, 3);
    const additionalGenresCount = result.genres.length - genresToShow.length;
    const genresDisplay =
        genresToShow.join(", ") + (additionalGenresCount > 0 ? ` + ${additionalGenresCount} more` : "");

    const currentEpisode = result.airing[0] ? result.airing[0].episode - 1 : null;
    const nextEpisode = result.airing[0] ? intervalTime(result.airing[0].timeUntilAiring) : null;

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

    const isReading = mediaType === "MANGA" ? "current reading " : "current watching";
    const isPlanning = mediaType === "MANGA" ? "planning to read " : "planning to watch";

    if (result.status === "Not_Yet_Released") {
        result.status = "Not Yet Released";
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
        `${inlineCode("completed         :")}\n ${userData.completed.join("")}\n`,
        `${inlineCode(`${isReading}  :`)}\n ${userData.current.join("")}\n`,
        `${inlineCode(`${isPlanning} :`)}\n ${userData.planning.join("")}\n`,
        `${inlineCode("dropped           :")}\n ${userData.dropped.join("")}\n`,
        `${inlineCode("paused            :")}\n ${userData.paused.join("")}\n\n`,
    ];

    if (result.banner === "null") {
        result.banner = null;
    }
    if (result.cover === "null") {
        result.cover = null;
    }

    const filteredDescription = descriptionBuilder.filter((line) => {
        return !(
            /^\s*$/.test(line) ||
            /null/.test(line) ||
            /undefined/.test(line) ||
            line === "`completed         :`\n \n" ||
            line === "`current watching  :`\n \n" ||
            line === "`current reading   :`\n \n" ||
            line === "`planning to watch :`\n \n" ||
            line === "`planning to read  :`\n \n" ||
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

    if (response === null) {
        logger.error("Request returned null", "Anilist");
        return;
    }

    const userScore = await response.json().catch((error) => {
        logger.error("Error while parsing JSON data.", "Anilist", error);
        return;
    });
    return userScore;
}

function capitalise(message: string) {
    return message.charAt(0).toUpperCase() + message.toLowerCase().slice(1);
}

export async function fetchAnilistUserData(username: string, interaction: any): Promise<any> {
    const request = await fetch(`${env.API_URL}/user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: username,
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });

    if (!request) {
        interaction.reply({
            content: `Unable to find ${username} within the Anilist API. `,
            ephemeral: true,
        });
        return null;
    }

    const result = await request.json().catch((error) => {
        logger.error("Error while parsing JSON data.", "Anilist", error);
        return null;
    });

    if (result.error) {
        logger.error("An Error Occured when trying to access the API", "Anilist", result);
        return null;
    }

    logger.debug("Result from API", "Anilist", result);
    const descriptionBuilder =
        `[${bold("Anime Information")}](${result.url}/animelist)\n` +
        `${inlineCode("Anime Count        :")} ${result.animeStats.count?.toLocaleString()}\n` +
        `${inlineCode("Mean Score         :")} ${result.animeStats.meanScore}\n` +
        `${inlineCode("Episodes Watched   :")} ${result.animeStats.watched?.toLocaleString()}\n` +
        `${inlineCode("Watch Time         :")} ${intervalTime(result.animeStats.minutes * 60)}\n\n` +
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

    if (result.banner === "null") {
        result.banner = null;
    }

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

    if (response === null) {
        logger.error("Request returned null", "Anilist");
        return null;
    }

    const result = await response.json().catch((error) => {
        logger.error("Error while parsing JSON data.", "Anilist", error);
        return null;
    });

    if (result === null) {
        logger.errorSingle("Request returned null", "Anilist");
        return null;
    }
    return result;
}
