import { MediaGalleryItemBuilder, SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import { MessageFlags, SeparatorSpacingSize } from "@discordjs/core";
import { fetchGuildUsers } from "database";
import { Logger } from "logger";
import { type MediaType, Routes, api } from "wrappers/anilist";
import type { ContainerManager } from "wrappers/discord";
import type { SelectMenuInteraction } from "../../classes/SelectMenuInteraction.js";
import type { PaginatedSelectMenu } from "../../services/commands.js";
import { createSimplePagination } from "../../utility/paginationUtils.js";

type SelectMenuData = {
    userID: string;
    mediaType: MediaType;
};

interface MediaScoreItem {
    username: string;
    mediaId: number;
    mediaType: MediaType;
    guildID: string;
}

const logger = new Logger();

export const interaction: PaginatedSelectMenu<SelectMenuData> = {
    data: { custom_id: "media" },
    pageLimit: 15,

    parse(data: string[]): SelectMenuData {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid Select Menu Data");
        }
        return {
            userID: data[0],
            mediaType: data[1] as MediaType,
        };
    },

    async getItems(interaction: SelectMenuInteraction): Promise<MediaScoreItem[] | undefined> {
        if (!interaction.guildID) {
            await interaction.followUp({ content: "This command can only be used in a server." });
            return undefined;
        }

        const mediaId = Number(interaction.menuValues[0]);
        const customIdParts = interaction.customID.split(":");
        const mediaType = customIdParts[2] as MediaType;

        const guildMembers = (await fetchGuildUsers(interaction.guildID))
            .filter((user) => user.anilist?.username)
            // biome-ignore lint/style/noNonNullAssertion: filtered above
            .map((user) => user.anilist!.username);

        if (guildMembers.length === 0) {
            await interaction.followUp({
                content: "No members in this server have linked their Anilist accounts.",
                flags: MessageFlags.Ephemeral,
            });
            return undefined;
        }

        return guildMembers.map((username) => ({
            username,
            mediaId,
            mediaType,
            // biome-ignore lint/style/noNonNullAssertion: filtered above
            guildID: interaction.guildID!,
        }));
    },

    async renderPage(
        items: MediaScoreItem[],
        pageNumber: number,
        _totalPages: number,
        interaction: SelectMenuInteraction,
    ): Promise<ContainerManager> {
        const container = interaction.getContainer();

        if (items.length === 0) {
            container.updateComponent("text", "No user data to display.");
            return container;
        }

        const scoreItem = items[0];
        if (!scoreItem) {
            container.updateComponent("text", "No user data available.");
            return container;
        }

        const { result: media, error } = await api.fetch(
            Routes.Media,
            {
                media_id: scoreItem.mediaId,
                media_type: scoreItem.mediaType,
            },
            {
                user_id: interaction.userID,
                guild_id: interaction.guildID,
                pageOptions: { page: pageNumber, limit: this.pageLimit },
            },
        );

        if (error || !media) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });
            container.updateComponent("text", "An error occurred while fetching media scores. Please try again later.");
            return container;
        }

        const title = media.title?.romaji || media.title?.english || media.title?.native || "Unknown Title";

        if (media.banner) {
            container
                .updateComponent("media", [new MediaGalleryItemBuilder().setURL(media.banner)])
                .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);
        } else {
            container.updateComponent("media", []).updateComponent("separator", []);
        }

        const section = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(`## [${title}](${media.siteUrl})\n${media.description || "No description available."}`),
        );

        if (media.cover) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(media.cover));
        }

        container
            .setComponentOrder(["media", "section", "actionRow"])
            .updateComponent("section", [section])
            .updateComponent("footer", `${media.footer}`);
        return container;
    },

    async execute(interaction: SelectMenuInteraction): Promise<void> {
        try {
            await createSimplePagination(this, interaction, "media");
        } catch (error: any) {
            logger.error("Error in media select menu", "MediaScoresSelect", { error });
            const errorMessage = error.message || "An error occurred while processing the media scores.";

            await interaction.followUp({
                content: errorMessage,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
