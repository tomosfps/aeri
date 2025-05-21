import { ApplicationIntegrationType, InteractionContextType, MessageFlags } from "@discordjs/core";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("Get support through the support server.")
        .addExample("/support")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM),
    async execute(interaction): Promise<void> {
        await interaction.reply({ content: "https://discord.gg/kKqsaKYUfz", flags: MessageFlags.Ephemeral });
    },
};
