import { ApplicationIntegrationType } from "discord-api-types/v10";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong! (Used for testing)")
        .addExample("/ping")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),
    async execute(interaction): Promise<void> {
        await interaction.reply({ content: "Pong!" });
    },
};
