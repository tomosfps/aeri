import {
    MediaGalleryItemBuilder,
    SectionBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ThumbnailBuilder,
    inlineCode,
} from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { fetchGuildUsers } from "database";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { PaginatedChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";
import { createSimplePagination } from "../../utility/paginationUtils.js";

const logger = new Logger();

interface MangaUserScoreItem {
    mediaId: number;
    searchTerm: string;
    isNSFWChannel: boolean;
}

export const interaction: PaginatedChatInputCommand<MangaUserScoreItem> = {
    data: new SlashCommandBuilder()
        .setName("manga")
        .setDescription("Find an manga based on the name")
        .setComment("NSFW media will be filtered out if the command is used in a SFW channel")
        .setCategory("Anime/Manga")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addExample("/manga name:One Piece")
        .addStringOption((option) => option.setName("name").setDescription("The name of the manga").setRequired(true))
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    pageLimit: 15,

    async getItems(interaction) {
        const manga = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) || "";

        const { result, error } = await api.fetch(
            Routes.Relations,
            {
                media_name: manga,
                media_type: MediaType.Manga,
            },
            { isNSFWChannel: interaction.isNSFW },
        );

        if (error || !result) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });
            await interaction.followUp({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                flags: MessageFlags.Ephemeral,
            });
            return undefined;
        }

        const nsfwMediaCount = result.relations.filter((relation) => relation.isNSFW).length;
        const filteredRelations = result.relations.filter((relation) => !relation.isNSFW || interaction.isNSFW);

        if (nsfwMediaCount > 0 && !interaction.isNSFW && filteredRelations.length === 0) {
            await interaction.followUp({
                content: `NSFW media was filtered out and no other media was found close to ${inlineCode(manga)}\nTo view them, use this command in a NSFW channel.`,
                flags: MessageFlags.Ephemeral,
            });
            return undefined;
        }

        if (filteredRelations.length === 0) {
            await interaction.followUp({
                content: `Could not find a relation close to ${inlineCode(manga)}`,
                flags: MessageFlags.Ephemeral,
            });
            return undefined;
        }

        if (!interaction.guildID) {
            await interaction.followUp({
                content: "This command can only be used in a server.",
                flags: MessageFlags.Ephemeral,
            });
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
            await interaction.followUp({
                content: "No members in this server have linked their Anilist accounts.",
                flags: MessageFlags.Ephemeral,
            });
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

        if (mediaResult.banner) {
            container
                .updateComponent("media", [new MediaGalleryItemBuilder().setURL(mediaResult.banner)])
                .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);
        } else {
            container.updateComponent("media", []).updateComponent("separator", []);
        }

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
        }

        container
            .updateComponent("section", [sectionBuilder])
            .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
            .updateComponent("actionRow", [
                [
                    new StringSelectMenuBuilder()
                        .setCustomId(`media:${interaction.userID}:${MediaType.Manga}`)
                        .setPlaceholder("Choose An Manga...")
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
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        await interaction.defer(hidden);

        try {
            await createSimplePagination(this, interaction, "manga");
        } catch (error: any) {
            logger.error("Error in manga command", "MangaCommand", { error });
            const errorMessage = error.message || "An error occurred while processing the manga command.";

            await interaction.followUp({
                content: errorMessage,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
