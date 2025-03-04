import { EmbedBuilder } from "@discordjs/builders";
import { dbFetchAnilistUser, dbFetchGuildUsers } from "database";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationIntegrationType } from "discord-api-types/v10";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("affinity")
        .setDescription("Compare your affinity with server members!")
        .setCategory("Anime/Manga")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setContexts(InteractionContextType.Guild)
        .addExample("/affinity"),
    async execute(interaction): Promise<void> {
        if (!interaction.guild_id) {
            return interaction.reply({
                content: "This command can only be used in a server.",
                ephemeral: true,
            });
        }

        logger.debug("Fetching user data", "User", { user: interaction.user_id });
        const user = await dbFetchAnilistUser(interaction.user_id);

        if (!user) {
            return interaction.reply({
                content: "You must link your Anilist account to use this command!\nUse `/link` to link your account.",
                ephemeral: true,
            });
        }

        const guildMembers = (await dbFetchGuildUsers(interaction.guild_id))
            .filter((user) => user.anilist !== null)
            // biome-ignore lint/style/noNonNullAssertion: filtered above
            .map((user) => user.anilist!.username);

        if (guildMembers.includes(user.username)) {
            guildMembers.splice(guildMembers.indexOf(user.username), 1);
        }

        if (guildMembers.length === 0) {
            return interaction.reply({
                content: "There must be at least 1 other member in the server to use this command.",
                ephemeral: true,
            });
        }

        logger.debug(`Fetching affinity for ${user.username} against ${guildMembers.length} users`, "Anilist", {
            username: user.username,
            guildMembers,
        });

        const { result: affinity, error } = await api.fetch(Routes.Affinity, {
            username: user.username,
            other_users: guildMembers,
        });

        if (error || affinity === null) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.\nPlease try again later. If the issue persists, contact the bot owner.",
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${affinity.comparedAgainst.name} affinity`)
            .setURL(affinity.comparedAgainst.siteUrl)
            .setThumbnail(affinity.comparedAgainst.avatar.large)
            .setDescription(affinity.description)
            .setColor(interaction.base_colour)
            .setFooter({ text: affinity.footer });

        await interaction.reply({ embeds: [embed] });
    },
};
