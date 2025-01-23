import { EmbedBuilder, inlineCode } from "@discordjs/builders";
import { env } from "core";
import { fetchAllUsers } from "database";
import { Logger } from "log";
import type { SelectMenu } from "../../services/commands.js";
import { intervalTime } from "../../utility/interactionUtils.js";

const logger = new Logger();

type SelectMenuData = {
    custom_id: string;
};

export const interaction: SelectMenu<SelectMenuData> = {
    custom_id: "media_selection",
    cooldown: 8,
    parse(data) {
        if (!data[0]) {
            throw new Error("Invalid Select Menu Data");
        }

        return { custom_id: data[0] };
    },
    async execute(interaction, data): Promise<void> {
        const mediaType = data.custom_id === "anime" ? "ANIME" : "MANGA";

        const response = await fetch(`${env.API_URL}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                media_id: Number(interaction.menuValues[0]),
                media_type: mediaType,
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

        if (result.error) {
            logger.error("An Error Occured when trying to access the API", "Anilist", result);
            return interaction.reply({ content: "An Error Occured when trying to access the API", ephemeral: true });
        }

        if (interaction.guild_id === undefined) {
            return interaction.reply({ content: "This command can only be used in a server", ephemeral: true });
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
                const userScore = await fetchUserData(Number(allUsers[member]), Number(interaction.menuValues[0]));
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

        const descriptionBuilder = [
            `${inlineCode("total episodes    :")} ${result.episodes}\n`,
            `${inlineCode("current episode   :")} ${currentEpisode}\n`,
            `${inlineCode("next airing       :")} ${nextEpisode}\n`,
            `${inlineCode("chapters          :")} ${result.chapters}\n`,
            `${inlineCode("volumes           :")} ${result.volumes}\n`,
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

        if (result.status === "Not_Yet_Released") {
            result.status = "Not Yet Released";
        }

        const filteredDescription = descriptionBuilder.filter((line) => {
            return !(
                /^\s*$/.test(line) ||
                /null/.test(line) ||
                line === "`completed         :`\n \n" ||
                line === "`current watching  :`\n \n" ||
                line === "`current reading   :`\n \n" ||
                line === "`planning to watch :`\n \n" ||
                line === "`planning to read  :`\n \n" ||
                line === "`dropped           :`\n \n" ||
                line === "`paused            :`\n \n\n"
            );
        });

        const embed = new EmbedBuilder()
            .setTitle(result.romaji)
            .setURL(result.url)
            .setImage(result.banner)
            .setThumbnail(result.cover.extraLarge)
            .setDescription(filteredDescription.join(""))
            .setFooter({
                text: `${result.dataFrom === "API" ? "Displaying API data" : `Displaying cache data : expires in ${intervalTime(result.leftUntilExpire)}`}`,
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
