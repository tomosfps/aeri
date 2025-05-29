import { SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import {
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { getRedis } from "core";
import { fetchAnilistUser, fetchGuildUsers } from "database";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { PaginatedChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";
import { createSimplePagination } from "../../utility/paginationUtils.js";

const logger = new Logger();

interface AffinityItem {
    username: string;
    guildID: string;
    currentUser: string;
}

export const interaction: PaginatedChatInputCommand<AffinityItem> = {
    data: new SlashCommandBuilder()
        .setName("affinity")
        .setDescription("Compare your affinity with server members!")
        .setCategory("Anime/Manga")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setContexts(InteractionContextType.Guild)
        .addExample("/affinity")
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    pageLimit: 20,

    async getItems(interaction) {
        if (!interaction.guildID) {
            await interaction.followUp({ content: "This command can only be used in a server." });
            return undefined;
        }

        const user = await fetchAnilistUser(interaction.userID);
        if (!user) {
            await interaction.followUp({
                content: `You must link your Anilist account to use this command!\nUse ${await getCommandAsMention("link")} to link your account.`,
            });
            return undefined;
        }

        const guildMembers = (await fetchGuildUsers(interaction.guildID))
            .filter((user) => user.anilist !== null)
            // biome-ignore lint/style/noNonNullAssertion: filtered above
            .map((user) => user.anilist!.username);

        if (guildMembers.includes(user.username)) {
            guildMembers.splice(guildMembers.indexOf(user.username), 1);
        }

        if (guildMembers.length === 0) {
            await interaction.followUp({
                content:
                    "There must be at least 1 other member in the server whom have linked their account to use this command.",
            });
            return undefined;
        }

        return guildMembers.map((username) => ({
            username,
            // biome-ignore lint/style/noNonNullAssertion: JUST FOR NOW
            guildID: interaction.guildID!,
            currentUser: user.username,
        }));
    },

    async renderPage(items, pageNumber, _totalPages, interaction) {
        const container = interaction.getContainer();

        if (items.length === 0) {
            container.updateComponent("text", "No affinity data to display.");
            return container;
        }

        const affinityItem = items[0];
        if (!affinityItem) {
            container.updateComponent("text", "No affinity data available.");
            return container;
        }

        const redis = await getRedis();
        const key = `pagination:${interaction.userID}:affinity`;
        const paginationData = await redis.hgetall(key);
        const allItems = paginationData["itemsData"] ? JSON.parse(paginationData["itemsData"]) : items;
        const allUsernames = allItems.map((item: AffinityItem) => item.username);

        const { result: affinity, error } = await api.fetch(
            Routes.Affinity,
            {
                username: affinityItem.currentUser,
                other_users: allUsernames,
            },
            { pageOptions: { page: pageNumber, limit: this.pageLimit } },
        );

        if (error || !affinity) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });
            container.updateComponent(
                "text",
                "An error occurred while fetching affinity data. Please try again later.",
            );
            return container;
        }

        const section = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(
                `## [${affinity.comparedAgainst.name}' Affinity](${affinity.comparedAgainst.siteUrl})\n${affinity.description}`,
            ),
        );

        if (affinity.comparedAgainst.avatar?.large) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(affinity.comparedAgainst.avatar.large));
        }

        container
            .setComponentOrder(["section", "actionRow"])
            .updateComponent("section", [section])
            .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
            .updateComponent("footer", `${affinity.footer}`);

        return container;
    },

    async execute(interaction) {
        await interaction.defer();

        try {
            await createSimplePagination(this, interaction, "affinity");
        } catch (error: any) {
            logger.error("Error in affinity command", "AffinityCommand", { error });
            const errorMessage = error.message || "An error occurred while processing the affinity command.";

            await interaction.followUp({
                content: errorMessage,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
