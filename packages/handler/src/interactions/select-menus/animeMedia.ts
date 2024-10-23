import { EmbedBuilder, inlineCode } from "@discordjs/builders";
import { env } from "core";
import { fetchAllUsers } from "database";
import { Logger } from "log";
import type { SelectMenu } from "../../services/commands.js";

const logger = new Logger();
const invalidPatterns = [
    "null",
    "null/null/null",
    "Dropped           :`\n \n",
    "`Planning to Watch :`\n \n",
    "`Paused            :`\n \n",
    "`Completed         :`\n \n",
    "`Current Watching  :`\n \n",
];

export const interaction: SelectMenu = {
    custom_id: "choose_media_anime",
    async execute(interaction): Promise<void> {
        const response = await fetch(`${env.API_URL}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                media_id: Number(interaction.menuValues[0]),
                media_type: "ANIME",
            }),
        }).catch((error) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (response === null) {
            logger.error("Request returned null", "Anilist");
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        const result = await response.json().catch((error) => {
            logger.error("Error while parsing JSON data.", "Anilist", error);
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        });

        const genresToShow = result.genres.slice(0, 3);
        const additionalGenresCount = result.genres.length - genresToShow.length;
        const genresDisplay =
            genresToShow.join(", ") + (additionalGenresCount > 0 ? ` + ${additionalGenresCount} more` : "");

        const currentEpisode = result.airing[0].episode ? result.airing[0].episode - 1 : null;
        const nextEpisode = result.airing[0].timeUntilAiring ? result.airing[0].timeUntilAiring : null;

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

        const allUsers = await fetchAllUsers().then((users) => {
            logger.infoSingle(`Fetched ${users.length} users from the database`, "Anilist");
            return users.map((user: { anilist: any }) => user.anilist.id);
        });

        if (allUsers.length !== 0) {
            for (const member in allUsers) {
                const userScore = await fetchUserData(Number(allUsers[member]), Number(interaction.menuValues[0]));
                
                switch (userScore.status) {
                    case "REPEATING":
                        userData.current.push(
                            `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.progress} | ${userScore.score}/10 (${userScore.repeat}) `)}\n`,
                        );
                        break;
                    case "CURRENT":
                        userData.current.push(
                            `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.progress} | ${userScore.score}/10 `)}\n`,
                        );
                        break;
                    case "COMPLETED":
                        userData.completed.push(
                            `> ${inlineCode(`${userScore.user}:`)} ${inlineCode(` ${userScore.score}/10 `)}\n`,
                        );
                        break;
                    case "PLANNING":
                        userData.planning.push(`> ${inlineCode(userScore.user)}\n`);
                        break;
                    case "DROPPED":
                        userData.dropped.push(`> ${inlineCode(userScore.user)}\n`);
                        break;
                    case "PAUSED":
                        userData.paused.push(`> ${inlineCode(userScore.user)}\n`);
                        break;
                    default:
                        break;
                }
            }
        }

        const descriptionBuilder = [
            `${inlineCode("total episodes    :")} ${result.episodes}\n`,
            `${inlineCode("current episode   :")} ${currentEpisode}\n`,
            `${inlineCode("next airing       :")} ${nextEpisode}\n`,
            `${inlineCode("status            :")} ${capitalise(result.status)}\n`,
            `${inlineCode("average score     :")} ${result.averageScore}%\n`,
            `${inlineCode("popularity        :")} ${result.popularity}\n`,
            `${inlineCode("format            :")} ${result.format}\n`,
            `${inlineCode("start date        :")} ${result.startDate}\n`,
            `${inlineCode("end date          :")} ${result.endDate}\n`,
            `${inlineCode("duration          :")} ${result.duration}\n`,
            `${inlineCode("genres            :")} ${genresDisplay}\n\n`,
            `${inlineCode("Completed         :")}\n ${userData.completed.join("")}\n`,
            `${inlineCode("Current Wattching :")}\n ${userData.current.join("")}\n`,
            `${inlineCode("Planning to Watch :")}\n ${userData.planning.join("")}\n`,
            `${inlineCode("Dropped           :")}\n ${userData.dropped.join("")}\n`,
            `${inlineCode("Paused            :")}\n ${userData.paused.join("")}\n\n`,
        ];

        if (result.banner === "null") {
            result.banner = null;
        }

        if (result.cover === "null") {
            result.cover = null;
        }

        if (result.stauts === "Not_Yet_Released") {
            result.status = "Not Yet Released";
        }

        const filteredDescription = descriptionBuilder.filter((line) => {
            return !invalidPatterns.some((pattern) => line.includes(pattern));
        });

        const embed = new EmbedBuilder()
            .setTitle(result.romaji)
            .setURL(result.url)
            .setImage(result.banner)
            .setThumbnail(result.cover.extraLarge)
            .setDescription(filteredDescription.join(""))
            .setFooter({
                text: `${result.dataFrom === "API" ? "Displaying API data" : `Displaying cache data : expires in ${result.leftUntilExpire} seconds`}`,
            })
            .setColor(0x2f3136);

        await interaction.edit({ embeds: [embed] });
    },
};

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
