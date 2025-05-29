import { ButtonBuilder } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    ButtonStyle,
    InteractionContextType,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("vote")
        .setDescription("Vote for Aeri!")
        .addExample("/vote")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const container = interaction.getContainer();

        container
            .setComponent(
                "text",
                "If you enjoy using Aeri, please consider voting for us on Top.gg!\nIt helps us grow and improve the bot.",
            )
            .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
            .setComponent("actionRow", [
                [
                    new ButtonBuilder()
                        .setLabel("Vote Here!")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://top.gg/bot/795916241193140244/vote"),
                ],
            ]);

        await interaction.replyContainer(hidden);
    },
};
