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
        .setName("support")
        .setDescription("Get support through the support server.")
        .addExample("/support")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        await interaction.reply({
            content: "https://discord.gg/kKqsaKYUfz",
            flags: hidden ? MessageFlags.Ephemeral : undefined,
        });
    },
};
