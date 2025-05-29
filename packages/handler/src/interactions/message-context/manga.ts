import {
    MediaGalleryItemBuilder,
    SectionBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ThumbnailBuilder,
    inlineCode,
} from "@discordjs/builders";
import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    InteractionContextType,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { fetchGuildUsers } from "database";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import { ContextMenuCommandBuilder } from "../../builders/ContextMenuCommandBuilder.js";
import type { PaginatedMessageContextCommand } from "../../services/commands.js";
import { createSimplePagination } from "../../utility/paginationUtils.js";

const logger = new Logger();

interface MangaUserScoreItem {
    mediaId: number;
    searchTerm: string;
    isNSFWChannel: boolean;
}

export const interaction: PaginatedMessageContextCommand<MangaUserScoreItem> = {
    data: new ContextMenuCommandBuilder()
        .setName("manga")
        .setType(ApplicationCommandType.Message)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM),
    pageLimit: 15,

    async getItems(interaction) {
        const manga = interaction.target.content;
        const container = interaction.getContainer();

        const { result, error: apiError } = await api.fetch(
            Routes.Relations,
            {
                media_name: manga,
                media_type: MediaType.Manga,
            },
            { isNSFWChannel: interaction.isNSFW },
        );

        if (apiError || result === null) {
            logger.error("Error while fetching data from the API.", "Anilist", { error: apiError });
            container.updateComponent(
                "error",
                "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
            );
            await interaction.followUpContainer(true);
            return undefined;
        }

        const nsfwMediaCount = result.relations.filter((relation) => relation.isNSFW).length;
        const filteredRelations = result.relations.filter((relation) => !relation.isNSFW || interaction.isNSFW);

        if (nsfwMediaCount > 0 && !interaction.isNSFW && filteredRelations.length === 0) {
            container.updateComponent(
                "warning",
                `NSFW media was filtered out and no other media was found close to ${inlineCode(manga)}\nTo view them, use this command in a NSFW channel.`,
            );
            await interaction.followUpContainer(true);
            return undefined;
        }

        if (filteredRelations.length === 0) {
            container.updateComponent("warning", `Could not find a relation close to ${inlineCode(manga)}`);
            await interaction.followUpContainer(true);
            return undefined;
        }

        if (!interaction.guildID) {
            container.updateComponent("error", "This command can only be used in a server.");
            await interaction.followUpContainer(true);
            return undefined;
        }

        const firstRelation = filteredRelations[0];

        if (!firstRelation) {
            return undefined;
        }

        const guildMembers = await fetchGuildUsers(interaction.guildID);
        const usersWithAnilist = guildMembers
            .filter((user) => user.anilist?.username)
            .map((user) => user.anilist?.username);

        if (usersWithAnilist.length === 0) {
            container.updateComponent("warning", "No members in this server have linked their Anilist accounts.");
            await interaction.followUpContainer(true);
            return undefined;
        }

        return usersWithAnilist.map(() => ({
            mediaId: firstRelation.id,
            searchTerm: manga,
            isNSFWChannel: interaction.isNSFW,
        }));
    },

    async renderPage(items, pageNumber, _totalPages, interaction) {
        const container = interaction.getContainer().setComponentOrder(["media", "section", "actionRow"]);

        if (items.length === 0) {
            container.updateComponent("text", "No manga data to display.");
            return container;
        }

        const mangaItem = items[0];
        if (!mangaItem) {
            container.updateComponent("text", "No manga data available.");
            return container;
        }

        const { result: mediaResult, error: mediaError } = await api.fetch(
            Routes.Media,
            {
                media_id: mangaItem.mediaId,
                media_type: MediaType.Manga,
            },
            {
                user_id: interaction.userID,
                guild_id: interaction.guildID,
                pageOptions: { page: pageNumber, limit: this.pageLimit },
            },
        );

        if (mediaError || !mediaResult) {
            logger.error("Error while fetching media data from the API.", "Anilist", { mediaError });
            container.updateComponent("text", "An error occurred while fetching manga details.");
            return container;
        }

        const title = mediaResult.title.english || mediaResult.title.romaji || mediaResult.title.native;

        const sectionBuilder = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(`## [${title}](${mediaResult.siteUrl})\n${mediaResult.description}`),
        );

        if (mediaResult.cover) {
            sectionBuilder.setThumbnailAccessory(new ThumbnailBuilder().setURL(mediaResult.cover));
        }

        const { result: allRelations } = await api.fetch(
            Routes.Relations,
            {
                media_name: mangaItem.searchTerm,
                media_type: MediaType.Manga,
            },
            { isNSFWChannel: mangaItem.isNSFWChannel },
        );

        const filteredRelations =
            allRelations?.relations.filter((relation) => !relation.isNSFW || mangaItem.isNSFWChannel) || [];

        if (mediaResult.banner) {
            container
                .updateComponent("media", [new MediaGalleryItemBuilder().setURL(mediaResult.banner)])
                .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);
        } else {
            container.updateComponent("media", []).updateComponent("separator", []);
        }

        container
            .updateComponent("section", [sectionBuilder])
            .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
            .updateComponent("actionRow", [
                [
                    new StringSelectMenuBuilder()
                        .setCustomId(`media:${interaction.userID}:${MediaType.Manga}`)
                        .setPlaceholder("Choose A Manga...")
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(
                            filteredRelations.slice(0, 25).map((relation) => {
                                return new StringSelectMenuOptionBuilder()
                                    .setLabel(
                                        `${relation.english || relation.romaji || relation.native || ""}`.slice(0, 100),
                                    )
                                    .setValue(`${relation.id}`)
                                    .setDescription(`${relation.format} - (${relation.airingType})`.slice(0, 100));
                            }),
                        ),
                ],
            ])
            .setComponent("footer", mediaResult.footer);

        return container;
    },

    async execute(interaction) {
        await interaction.defer();

        try {
            await createSimplePagination(this, interaction, "message-context-manga");
        } catch (error: any) {
            logger.error("Error in manga message-context command", "MangaMessageContext", { error });
            const errorMessage = error.message || "An error occurred while processing the manga command.";
            const container = interaction.getContainer();

            container.updateComponent("error", errorMessage);
            await interaction.followUpContainer(true);
        }
    },
};
