import { EmbedBuilder } from "@discordjs/builders";
import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "@discordjs/core";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import { ContextMenuCommandBuilder } from "../../builders/ContextMenuCommandBuilder.js";
import type { MessageContextCommand } from "../../services/commands.js";

const logger = new Logger();

export const interaction: MessageContextCommand = {
    data: new ContextMenuCommandBuilder()
        .setName("find anime")
        .setType(ApplicationCommandType.Message)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM),
    async execute(interaction) {
        const media = interaction.target.attachments;
        let imageUrl: string | undefined;
        await interaction.defer();

        if (media[0]?.url) {
            imageUrl = media[0].url;
        } else if (interaction.target.content) {
            const content = interaction.target.content.trim();

            if (content.startsWith("http")) {
                imageUrl = content;
            }
        }

        if (!imageUrl) {
            await interaction.followUp({
                content: "No valid image URL found. Please provide an image attachment or a direct URL.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const { result, error } = await api.fetch(Routes.Sauce, { url: encodeURIComponent(imageUrl) });

        if (error || !result) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.followUp({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const { result: mediaResult, error: mediaError } = await api.fetch(
            Routes.Media,
            // biome-ignore lint/style/noNonNullAssertion: This is always defined from the API
            { media_type: MediaType.Anime, media_id: result.result[0]?.anilist! },
            { user_id: interaction.userID, guild_id: interaction.guildID },
        );

        if (mediaError || !mediaResult) {
            logger.error("Error while fetching data from the API.", "Anilist", { error: mediaError });

            return interaction.followUp({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const title = (mediaResult.title.romaji || mediaResult.title.english || mediaResult.title.native) as string;
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setURL(mediaResult.siteUrl)
            .setImage(mediaResult.banner)
            .setThumbnail(mediaResult.cover)
            .setDescription(mediaResult.description || "No description available.")
            .setColor(interaction.baseColour)
            .setFooter({
                text: `${mediaResult.footer} | ${(result.result[0]?.similarity || 0 * 100).toFixed(2)}% similarity`,
            });

        await interaction.followUp({ embeds: [embed] });
    },
};
