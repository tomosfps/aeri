import { EmbedBuilder } from "@discordjs/builders";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationIntegrationType } from "discord-api-types/v10";
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
        const embed = new EmbedBuilder()
            .setTitle("Support Server")
            .setDescription(
                "Join the support server for help with the bot.\n[Click here to join](https://discord.gg/kKqsaKYUfz)",
            )
            .setColor(interaction.base_colour)
            .setThumbnail(interaction.avatar_url)
            .setURL("https://discord.gg/kKqsaKYUfz");

        await interaction.reply({ embeds: [embed] });
    },
};
