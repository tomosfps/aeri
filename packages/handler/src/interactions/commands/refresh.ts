import { ApplicationIntegrationType, InteractionContextType } from "@discordjs/core";
import { fetchAnilistUser } from "database";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("refresh")
        .setDescription("Refresh your scores in the cache")
        .addExample("/refresh")
        .addExample("Must have used /link before using this command")
        .setCategory("Anime/Manga")
        .setCooldown(1800)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM),
    async execute(interaction): Promise<void> {
        const anilistUser = await fetchAnilistUser(interaction.userID);
        const userId = anilistUser ? anilistUser.id : null;
        const username = anilistUser ? anilistUser.username : null;
        const container = interaction.getContainer();

        if (username === null || userId === null) {
            container.setComponent(
                "warning",
                `You must link your Anilist account to use this command. You can do so by using the ${await getCommandAsMention("link")} command.`,
            );
            return interaction.replyContainer(true);
        }

        const { result, error } = await api.fetch(Routes.RefreshUser, {
            user_id: String(userId),
            username: username,
        });

        if (error || result === null) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            container.setComponent(
                "error",
                "An error occurred while refreshing your scores.\nPlease try again later. If the issue persists, contact the bot owner.",
            );
            return await interaction.replyContainer(true);
        }

        container.setComponent(
            "success",
            `Successfully refreshed your scores! You can now use commands like ${await getCommandAsMention("anime")} and ${await getCommandAsMention("manga")} commands to view your scores.`,
        );
        await interaction.replyContainer(true);
    },
};
