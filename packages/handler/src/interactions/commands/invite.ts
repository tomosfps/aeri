import { hideLinkEmbed } from "@discordjs/builders";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationIntegrationType } from "discord-api-types/v10";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite the bot to your server!")
        .addExample("/invite")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM),
    async execute(interaction): Promise<void> {
        await interaction.reply({
            content: hideLinkEmbed("https://discord.com/oauth2/authorize?client_id=795916241193140244"),
        });
    },
};
