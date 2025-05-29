import { MediaGalleryItemBuilder, SectionBuilder, ThumbnailBuilder, bold, inlineCode } from "@discordjs/builders";
import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import { ContextMenuCommandBuilder } from "../../builders/ContextMenuCommandBuilder.js";
import type { PaginatedMessageContextCommand } from "../../services/commands.js";
import { createSimplePagination } from "../../utility/paginationUtils.js";

const logger = new Logger();

interface SauceItem {
    anilistId: number;
    similarity: number;
    filename: string;
    episode?: number | undefined;
    imageUrl: string;
}

export const interaction: PaginatedMessageContextCommand<SauceItem> = {
    data: new ContextMenuCommandBuilder()
        .setName("find anime")
        .setType(ApplicationCommandType.Message)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM),

    pageLimit: 1,

    async getItems(interaction) {
        const media = interaction.target.attachments;
        let imageUrl: string | undefined;

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
            return [];
        }

        const { result, error } = await api.fetch(Routes.Sauce, { url: encodeURIComponent(imageUrl) });

        if (error || !result) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            await interaction.followUp({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                flags: MessageFlags.Ephemeral,
            });
            return [];
        }

        if (!result.result || result.result.length === 0) {
            await interaction.followUp({
                content: "No sauce results found for this image.",
                flags: MessageFlags.Ephemeral,
            });
            return [];
        }

        const sauceItems: SauceItem[] = result.result
            .filter((item) => item.anilist && item.anilist > 0)
            .map((item) => ({
                // biome-ignore lint/style/noNonNullAssertion: We filter out any that dont have an anilist ID
                anilistId: item.anilist!,
                similarity: item.similarity,
                filename: item.filename,
                episode: typeof item.episode === "number" ? item.episode : undefined,
                imageUrl: item.image,
            }))
            .sort((a, b) => b.similarity - a.similarity);

        return sauceItems;
    },

    async renderPage(items, _pageNumber, _totalPages, interaction) {
        const container = interaction.getContainer();

        if (items.length === 0) {
            container.updateComponent("text", "No sauce results to display.");
            return container;
        }

        const sauceItem = items[0];
        if (!sauceItem) {
            container.updateComponent("text", "No sauce data available.");
            return container;
        }

        const { result: mediaResult, error: mediaError } = await api.fetch(
            Routes.Media,
            { media_type: MediaType.Anime, media_id: sauceItem.anilistId },
            { user_id: interaction.userID, guild_id: interaction.guildID },
        );

        if (mediaError || !mediaResult) {
            logger.error("Error while fetching media data from the API.", "Anilist", { error: mediaError });
            container.updateComponent("text", "An error occurred while fetching media data. Please try again later.");
            return container;
        }

        const title = (mediaResult.title.romaji ||
            mediaResult.title.english ||
            mediaResult.title.native ||
            "Unknown Title") as string;
        mediaResult.description += `${bold(inlineCode("extra data    :"))}\n`;
        mediaResult.description += `> ${bold(inlineCode("similarity  :"))} ${(sauceItem.similarity * 100).toFixed(2)}%\n`;

        if (sauceItem.episode) {
            mediaResult.description += `> ${bold(inlineCode("episode     :"))} ${sauceItem.episode}\n`;
        }

        const section = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(`# [${title}](${mediaResult.siteUrl})\n${mediaResult.description}`),
        );

        if (mediaResult.cover) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(mediaResult.cover));
        }

        if (mediaResult.banner) {
            container
                .updateComponent("media", [new MediaGalleryItemBuilder().setURL(mediaResult.banner)])
                .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);
        } else {
            container.updateComponent("media", []).updateComponent("separator", []);
        }

        container
            .setComponentOrder(["media", "separator", "section", "footer"])
            .updateComponent("section", [section])
            .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
            .updateComponent("footer", `${mediaResult.footer}`);

        return container;
    },

    async execute(interaction) {
        await interaction.defer();
        await createSimplePagination(this, interaction, "find anime");
    },
};
