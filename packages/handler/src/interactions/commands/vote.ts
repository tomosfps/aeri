import { EmbedBuilder } from "@discordjs/builders";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationIntegrationType } from "discord-api-types/v10";
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
        const embed = new EmbedBuilder()
            .setTitle("Vote on top.gg")
            .setDescription("Vote for Aeri!\n[Click here to vote](https://top.gg/bot/795916241193140244)")
            .setColor(interaction.base_colour)
            .setFooter({ text: "PS: You can also leave a rating or review!" })
            .setThumbnail("https://cdn.aeri.live/bot_pfp.png")
            .setURL("https://top.gg/bot/795916241193140244");

        await interaction.reply({ embeds: [embed] });
    },
};
