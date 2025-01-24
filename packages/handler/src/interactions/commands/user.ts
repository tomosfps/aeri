import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { fetchAnilistUser } from "database";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "log";
import type { Command } from "../../services/commands.js";
import { fetchAnilistUserData, getCommandOption, intervalTime } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: Command = {
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("View a user's anilist account")
        .addStringOption((option) => option.setName("username").setDescription("Anilist Username").setRequired(false)),
    async execute(interaction): Promise<void> {
        let username = getCommandOption("username", ApplicationCommandOptionType.String, interaction.options);

        if (username === null) {
            username = (await fetchAnilistUser(interaction.member_id)).username;

            logger.debug(`Attempt fetched user from database: ${username}`, "User");
            if (username === null) {
                logger.warn("No user found in database", "User");
                return interaction.edit({
                    content: "Please provide a username or link your Anilist account",
                    ephemeral: true,
                });
            }
        }

        logger.debug(`Fetching user: ${username}`, "User");
        const userFetch = await fetchAnilistUserData(username, interaction);
        if (userFetch === null) {
            return interaction.edit({ content: "User not found", ephemeral: true });
        }

        logger.debug("Gained user data", "User", userFetch.result);
        const footer = `${userFetch.result.dataFrom === "API" ? "Data from Anilist API" : `Displaying cached data : refreshes in ${intervalTime(userFetch.result.leftUntilExpire)}`}`;
        const embed = new EmbedBuilder()
            .setTitle(userFetch.result.name)
            .setURL(userFetch.result.url)
            .setDescription(userFetch.description)
            .setThumbnail(userFetch.result.avatar)
            .setImage(userFetch.result.banner)
            .setFooter({ text: footer })
            .setColor(0x2f3136);

        return interaction.reply({
            embeds: [embed],
        });
    },
};
