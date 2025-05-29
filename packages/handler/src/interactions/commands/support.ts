import { ButtonBuilder } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    ButtonStyle,
    InteractionContextType,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { env } from "core";
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
        const container = interaction.getContainer();

        container
            .setComponent("text", "Use the buttons below to get support or join the support server.")
            .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
            .setComponent("actionRow", [
                [
                    new ButtonBuilder()
                        .setLabel("Invite")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://discord.com/oauth2/authorize?client_id=795916241193140244"),
                    new ButtonBuilder()
                        .setLabel("Support")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://discord.gg/kKqsaKYUfz"),
                    new ButtonBuilder()
                        .setLabel("Status")
                        .setStyle(ButtonStyle.Link)
                        .setURL(`${env.WEBSITE_URL}/status`),
                    new ButtonBuilder()
                        .setLabel("Top.gg")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://top.gg/bot/795916241193140244"),
                ],
            ]);

        await interaction.replyContainer(hidden);
    },
};
