import { EmbedBuilder } from "@discordjs/builders";
import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "@discordjs/core";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import { ContextMenuCommandBuilder } from "../../classes/ContextMenuCommandBuilder.js";
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

        if (!media[0]) {
            await interaction.editReply({ content: "No media found.", flags: MessageFlags.Ephemeral });
            return;
        }

        if (!media[0].url) {
            await interaction.editReply({ content: "No media URL found.", flags: MessageFlags.Ephemeral });
            return;
        }

        const validImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
        const fileExtension = media[0].url.toLowerCase().match(/\.[^.]*$/)?.[0];

        if (!fileExtension || !validImageExtensions.includes(fileExtension)) {
            await interaction.editReply({
                content: "The attachment must be a supported image format (jpg, png, gif, etc.).",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const { result, error } = await api.fetch(Routes.Sauce, { url: media[0]?.url });

        if (error || !result) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
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

            return interaction.reply({
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
            .setFooter({ text: mediaResult.footer });

        await interaction.editReply({ embeds: [embed] });
    },
};
