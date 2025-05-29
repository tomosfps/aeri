import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "@discordjs/core";
import { fetchAnilistUser } from "database";
import { Logger } from "logger";
import { MediaListStatus, MediaType } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { PaginatedChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";
import { getCommandOption } from "../../utility/interactionUtils.js";
import { createSimplePagination } from "../../utility/paginationUtils.js";

const logger = new Logger();

interface WatchListItem {
    username: string;
    mediaType: MediaType;
    userID: string;
}

// TODO: fix this

export const interaction: PaginatedChatInputCommand<WatchListItem> = {
    data: new SlashCommandBuilder()
        .setName("watch-list")
        .setDescription("View one of your lists on Anilist")
        .addExample("/watch-list media:Anime")
        .addExample("/watch-list media:Manga hidden:true")
        .addExample("/watch-list media:Anime username:JavaScript")
        .setCategory("Anime/Manga")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option
                .setName("media")
                .setDescription("The media to view")
                .setRequired(true)
                .addChoices({ name: "Anime", value: MediaType.Anime }, { name: "Manga", value: MediaType.Manga }),
        )
        .addStringOption((option) =>
            option.setName("username").setDescription("The user who's list you would like to view.").setRequired(false),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    pageLimit: 1,

    async getItems(interaction) {
        const type = getCommandOption("media", ApplicationCommandOptionType.String, interaction.options) as MediaType;
        let username = getCommandOption("username", ApplicationCommandOptionType.String, interaction.options);

        if (username === null) {
            logger.debug("Attempting fetching user from database", "User");

            const dbUser = await fetchAnilistUser(interaction.userID);

            if (!dbUser) {
                await interaction.followUp({
                    content: `Please setup your account with ${await getCommandAsMention("link")} or parse a username with the command.`,
                    flags: MessageFlags.Ephemeral,
                });
                return undefined;
            }

            username = dbUser.username;
        }

        if (!username) {
            await interaction.followUp({
                content: `Please provide a username, or setup your account with ${await getCommandAsMention("link")}`,
                flags: MessageFlags.Ephemeral,
            });
            return undefined;
        }

        return [
            {
                username,
                mediaType: type,
                userID: interaction.userID,
            },
        ];
    },

    async renderPage(items, _pageNumber, _totalPages, interaction) {
        const container = interaction.getContainer();

        if (items.length === 0) {
            container.updateComponent("text", "No watchlist data to display.");
            return container;
        }

        const watchListItem = items[0];
        if (!watchListItem) {
            container.updateComponent("text", "No watchlist data available.");
            return container;
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId(`status:${watchListItem.username}:${watchListItem.mediaType}:${watchListItem.userID}`)
            .setPlaceholder("Choose A Media Status...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                Object.entries(MediaListStatus)
                    .slice(0, -1)
                    .map(([key, value]) => new StringSelectMenuOptionBuilder().setLabel(key).setValue(value)),
            );

        container
            .setComponentOrder(["text", "actionRow"])
            .setComponent(
                "text",
                `Select a status to view ${watchListItem.username}'s ${watchListItem.mediaType} list:`,
            )
            .setComponent("actionRow", [[select]]);

        return container;
    },

    async execute(interaction) {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        await interaction.defer(hidden);

        try {
            await createSimplePagination(this, interaction, "watch-list");
        } catch (error: any) {
            logger.error("Error in watchList command", "WatchListCommand", { error });
            const errorMessage = error.message || "An error occurred while processing the watchlist command.";

            await interaction.followUp({
                content: errorMessage,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
