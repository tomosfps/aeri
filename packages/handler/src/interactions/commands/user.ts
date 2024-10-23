import { EmbedBuilder, SlashCommandBuilder, bold, inlineCode } from "@discordjs/builders";
import { env } from "core";
import { fetchAnilistUser } from "database";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "log";
import type { Command } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: Command = {
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("View a user's anilist account")
        .addStringOption((option) => option.setName("username").setDescription("Anilist Username").setRequired(false)),
    async execute(interaction): Promise<void> {
        let username = getCommandOption("username", ApplicationCommandOptionType.String, interaction.options);

        if (username === null) {
            username = (await fetchAnilistUser(interaction.member_id)).username;

            if (username === null) {
                return interaction.reply({
                    content: "Please provide a username or link your Anilist account",
                    ephemeral: true,
                });
            }
        }

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

        if (request === null) {
            return interaction.reply({
                content: `Unable to find ${username} within the Anilist API. `,
                ephemeral: true,
            });
        }

        const result = await request.json().catch((error) => {
            logger.error("Error while parsing JSON data.", "Anilist", error);
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        });

        const descriptionBuilder =
            `[${bold(result.name)}](${result.url})\n\n[${bold("Anime Information")}](${result.url}/animelist)\n` +
            `${inlineCode("Anime Count        :")} ${result.animeStats.count}\n` +
            `${inlineCode("Mean Score         :")} ${result.animeStats.meanScore}\n` +
            `${inlineCode("Episodes Watched   :")} ${result.animeStats.watched}\n` +
            `${inlineCode("Watch Time         :")} ${Math.round(result.animeStats.minutes / 1440)}\n\n` +
            `[${bold("Manga Information")}](${result.url}/mangalist)\n` +
            `${inlineCode("Manga Count        :")} ${result.mangaStats.count}\n` +
            `${inlineCode("Mean Score         :")} ${result.mangaStats.meanScore}\n` +
            `${inlineCode("Chapters Read      :")} ${result.mangaStats.chapters}\n` +
            `${inlineCode("Volumes Read       :")} ${result.mangaStats.volumes}\n`;

        const footer = `${result.dataFrom === "API" ? "Data from Anilist API" : `Displaying cached data : refreshes in ${result.leftUntilExpire} seconds`}`;

        if (result.banner === "null") {
            result.banner = null;
        }

        const embed = new EmbedBuilder()
            .setDescription(descriptionBuilder)
            .setThumbnail(result.avatar)
            .setImage(result.banner)
            .setFooter({ text: footer })
            .setColor(0x2f3136);

        return interaction.reply({
            embeds: [embed],
        });
    },
};
