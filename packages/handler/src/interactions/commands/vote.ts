import { ApplicationIntegrationType, InteractionContextType, MessageFlags } from "@discordjs/core";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("vote")
        .setDescription("Vote for Aeri!")
        .addExample("/vote")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM),
    async execute(interaction): Promise<void> {
        await interaction.reply({ content: "https://top.gg/bot/795916241193140244", flags: MessageFlags.Ephemeral });
    },
};
