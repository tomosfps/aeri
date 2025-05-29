import { MediaGalleryItemBuilder, SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import { MessageFlags, SeparatorSpacingSize } from "@discordjs/core";
import { Logger } from "logger";
import { type MediaListStatus, type MediaType, Routes, api } from "wrappers/anilist";
import type { SelectMenuInteraction } from "../../classes/SelectMenuInteraction.js";
import type { PaginatedSelectMenu } from "../../services/commands.js";
import { createSimplePagination } from "../../utility/paginationUtils.js";

const logger = new Logger();

type SelectMenuData = {
    userName: string;
    mediaType: string;
    userId: string;
};

interface StatusItem {
    username: string;
    mediaType: MediaType;
    status: MediaListStatus;
    userID: string;
}

// TODO: fix this

export const interaction: PaginatedSelectMenu<SelectMenuData> = {
    data: { custom_id: "status" },
    pageLimit: 15,

    parse(data) {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid Select Menu Data");
        }
        return { userName: data[0], mediaType: data[1], userId: data[2] };
    },

    async getItems(interaction: SelectMenuInteraction): Promise<StatusItem[] | undefined> {
        const customIdParts = interaction.customID.split(":");
        const userName = customIdParts[1];
        const mediaType = customIdParts[2];
        const userId = customIdParts[3];

        if (!userName || !mediaType || !userId) {
            throw new Error("Invalid Select Menu Data");
        }

        const status = interaction.menuValues[0] as MediaListStatus;

        return [
            {
                username: userName,
                mediaType: mediaType as MediaType,
                status: status,
                userID: userId,
            },
        ];
    },

    async renderPage(items, _pageNumber, _totalPages, interaction) {
        const container = interaction.getContainer();

        if (items.length === 0) {
            container.setComponent("text", "No status data to display.");
            return container;
        }

        const statusItem = items[0];
        if (!statusItem) {
            container.setComponent("text", "No status data available.");
            return container;
        }

        const { result: userList, error } = await api.fetch(
            Routes.WatchList,
            {
                username: statusItem.username,
                type: statusItem.mediaType,
                status: statusItem.status,
            },
            {
                pageOptions: {
                    page: 1,
                    limit: this.pageLimit,
                },
            },
        );

        if (error || !userList) {
            logger.error("Error while fetching user list from the API.", "Anilist", { error });
            container.setComponent(
                "error",
                "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
            );
            return container;
        }

        const section = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(
                `## ${statusItem.username}'s ${statusItem.mediaType} List\n${userList.description || "No description available."}`,
            ),
        );

        if (userList.user?.avatar) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(userList.user.avatar));
        }

        if (userList.user?.bannerImage) {
            container
                .setComponent("media", [new MediaGalleryItemBuilder().setURL(userList.user.bannerImage)])
                .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);
        }

        container
            .setComponentOrder(["media", "section", "separator", "footer"])
            .setComponent("section", [section])
            .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);

        if (userList.footer) {
            container.setComponent("footer", userList.footer);
        }

        return container;
    },

    async execute(interaction: SelectMenuInteraction): Promise<void> {
        try {
            await createSimplePagination(this, interaction, "status");
        } catch (error: any) {
            logger.error("Error in status select menu", "StatusSelect", { error });
            const errorMessage = error.message || "An error occurred while processing the status selection.";

            await interaction.followUp({
                content: errorMessage,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
