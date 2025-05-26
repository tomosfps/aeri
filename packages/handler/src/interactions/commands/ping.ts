import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "@discordjs/core";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong! (Used for testing)")
        .addExample("/ping")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        await interaction.reply({ content: "Pong!", flags: hidden ? MessageFlags.Ephemeral : undefined });
    },
};
