import { dbFetchAnilistUser } from "database";
import { ApplicationIntegrationType } from "discord-api-types/v10";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("refresh")
        .setDescription("Refresh your scores in the cache")
        .addExample("/refresh")
        .addExample("Must have used /link before using this command")
        .setCategory("Anime/Manga")
        .setCooldown(1800)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),
    async execute(interaction): Promise<void> {
        const anilistUser = await dbFetchAnilistUser(interaction.user_id);
        const userId = anilistUser ? anilistUser.id : null;
        const username = anilistUser ? anilistUser.username : null;

        if (username === null || userId === null) {
            return interaction.reply({
                content:
                    "You must link your Anilist account to use this command. You can do so by using the `/link` command.",
                ephemeral: true,
            });
        }

        const { result, error } = await api.fetch(Routes.RefreshUser, {
            user_id: String(userId),
            username: username,
        });

        if (error || result === null) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content: "There was a problem trying to refresh your scores.",
                ephemeral: true,
            });
        }

        await interaction.reply({ content: "Sucessfully removed your scores!", ephemeral: true });
    },
};
