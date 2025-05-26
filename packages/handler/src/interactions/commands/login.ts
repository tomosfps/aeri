import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { ApplicationIntegrationType, ButtonStyle, InteractionContextType, MessageFlags } from "@discordjs/core";
import { env, getRedis } from "core";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

const redis = await getRedis();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("login")
        .setDescription("Setup OAuth with the Discord bot!")
        .addExample("/login")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .setCategory("OAuth"),
    async execute(interaction): Promise<void> {
        const embed = new EmbedBuilder()
            .setDescription("Click the button below to link your Anilist account with the bot.")
            .setColor(interaction.baseColour);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Link Anilist Account")
                .setStyle(ButtonStyle.Link)
                .setURL(
                    `https://anilist.co/api/v2/oauth/authorize?client_id=${env.ANILIST_CLIENT_ID}&response_type=code&state=${interaction.userID}_${interaction.guildID || ""}`,
                ),
        );

        await redis.set(`anilist_setup_interaction:${interaction.userID}`, interaction.token, "EX", 60 * 15);
        return await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    },
};
