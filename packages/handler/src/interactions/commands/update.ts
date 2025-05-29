import { MediaGalleryItemBuilder, SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { fetchAnilistUser } from "database";
import { Logger } from "logger";
import { MediaListStatus, MediaType, Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { PaginatedChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";
import { getCommandOption } from "../../utility/interactionUtils.js";
import { createSimplePagination } from "../../utility/paginationUtils.js";

const logger = new Logger();

interface UpdateItem {
    mediaId: number;
    mediaType: MediaType;
    status?: MediaListStatus | null;
    score?: number | null;
    progress?: number | null;
    volumes?: number | null;
    token: string;
}

export const interaction: PaginatedChatInputCommand<UpdateItem> = {
    data: new SlashCommandBuilder()
        .setName("update")
        .setDescription("Update an entry on your Anilist account.")
        .addExample("/update manga entry name:Berserk score:10 status:Current progress:153")
        .addExample("/update anime entry name:One Piece score:10")
        .addExample("/update anime entry name:One Piece status:Paused")
        .addExample("/update manga entry name:Vagabond status:Paused")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
        .setCategory("OAuth")
        .addSubcommandGroup((group) =>
            group
                .setName("anime")
                .setDescription("Update an anime entry on your AniList account")
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("entry")
                        .setDescription("Update an anime entry on your AniList account")
                        .addStringOption((option) =>
                            option
                                .setName("name")
                                .setAutocomplete(true)
                                .setDescription("The name of the anime you want to update.")
                                .setRequired(true),
                        )
                        .addStringOption((option) =>
                            option
                                .setName("status")
                                .setDescription("The status of the anime.")
                                .setRequired(false)
                                .addChoices(
                                    ...Object.entries(MediaListStatus)
                                        .slice(0, -1)
                                        .map(([key, value]) => ({
                                            name: key,
                                            value: value,
                                        })),
                                ),
                        )
                        .addNumberOption((option) =>
                            option
                                .setName("score")
                                .setDescription("The score you want to give the anime.")
                                .setRequired(false),
                        )
                        .addNumberOption((option) =>
                            option
                                .setName("progress")
                                .setDescription("The progress you have made in the anime.")
                                .setRequired(false),
                        )
                        .addBooleanOption((option) =>
                            option
                                .setName("hidden")
                                .setDescription("Hide the interaction from appearing in chat")
                                .setRequired(false),
                        ),
                ),
        )
        .addSubcommandGroup((group) =>
            group
                .setName("manga")
                .setDescription("Update a manga entry on your AniList account")
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("entry")
                        .setDescription("Update a manga entry on your AniList account")
                        .addStringOption((option) =>
                            option
                                .setName("name")
                                .setAutocomplete(true)
                                .setDescription("The name of the manga you want to update.")
                                .setRequired(true),
                        )
                        .addStringOption((option) =>
                            option
                                .setName("status")
                                .setDescription("The status of the manga.")
                                .setRequired(false)
                                .addChoices(
                                    ...Object.entries(MediaListStatus)
                                        .slice(0, -1)
                                        .map(([key, value]) => ({
                                            name: key,
                                            value: value,
                                        })),
                                ),
                        )
                        .addNumberOption((option) =>
                            option
                                .setName("score")
                                .setDescription("The score you want to give the manga.")
                                .setRequired(false),
                        )
                        .addNumberOption((option) =>
                            option
                                .setName("progress")
                                .setDescription("The progress you have made in the manga.")
                                .setRequired(false),
                        )
                        .addNumberOption((option) =>
                            option
                                .setName("volumes")
                                .setDescription("The amount of volumes read for the manga.")
                                .setRequired(false),
                        )
                        .addBooleanOption((option) =>
                            option
                                .setName("hidden")
                                .setDescription("Hide the interaction from appearing in chat")
                                .setRequired(false),
                        ),
                ),
        ) as SlashCommandBuilder,
    pageLimit: 15,

    async getItems(interaction) {
        const command = interaction.subcommand === "anime" ? MediaType.Anime : MediaType.Manga;
        const name = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) as string;
        const status = getCommandOption("status", ApplicationCommandOptionType.String, interaction.options);
        const score = getCommandOption("score", ApplicationCommandOptionType.Number, interaction.options);
        const progress = getCommandOption("progress", ApplicationCommandOptionType.Number, interaction.options);
        const volumes =
            command === MediaType.Manga
                ? getCommandOption("volumes", ApplicationCommandOptionType.Number, interaction.options)
                : null;
        const inDatabase = await fetchAnilistUser(interaction.userID);

        if (!inDatabase || inDatabase.token === null) {
            await interaction.followUp({
                content: `You need to setup OAuth first. Use ${await getCommandAsMention("login")} to do so.`,
                flags: MessageFlags.Ephemeral,
            });
            return undefined;
        }

        const { result: updateMedia, error: updateError } = await api.fetch(Routes.UpdateMedia, {
            status: status as MediaListStatus,
            score: score,
            progress: progress,
            id: Number(name),
            token: inDatabase.token,
            volumes,
        });

        if (updateError || updateMedia === null) {
            logger.error("Error while fetching data MUTATION from the API.", "Anilist", { updateError });
            await interaction.followUp({
                content:
                    "An error occurred while updating your entry on Anilist.\nPlease try again later. If the issue persists, contact the bot owner.",
                flags: MessageFlags.Ephemeral,
            });
            return undefined;
        }

        return [
            {
                mediaId: Number(name),
                mediaType: command,
                status: status as MediaListStatus,
                score: score,
                progress: progress,
                volumes: volumes,
                token: inDatabase.token,
            },
        ];
    },

    async renderPage(items, pageNumber, _totalPages, interaction) {
        const container = interaction.getContainer();

        if (items.length === 0) {
            container.updateComponent("text", "No update data to display.");
            return container;
        }

        const updateItem = items[0];
        if (!updateItem) {
            container.updateComponent("text", "No update data available.");
            return container;
        }

        const { result, error } = await api.fetch(
            Routes.Media,
            { media_type: updateItem.mediaType, media_id: updateItem.mediaId },
            {
                user_id: interaction.userID,
                guild_id: interaction.guildID,
                pageOptions: { page: pageNumber, limit: this.pageLimit },
            },
        );

        if (error || result === null) {
            logger.error("Error while fetching data MEDIA from the API.", "Anilist", { error });
            container.setComponent(
                "error",
                "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
            );
            return container;
        }

        const title = result.title?.romaji || result.title?.english || result.title?.native || "Unknown Title";

        if (result.banner) {
            container
                .updateComponent("media", [new MediaGalleryItemBuilder().setURL(result.banner)])
                .updateComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);
        } else {
            container.updateComponent("media", []).updateComponent("separator", []);
        }

        if (result.cover) {
            const section = new SectionBuilder()
                .addTextDisplayComponents((builder) =>
                    builder.setContent(`## [${title}](${result.siteUrl})\n${result.description}`),
                )
                .setThumbnailAccessory(new ThumbnailBuilder().setURL(result.cover));
            container.setComponent("section", [section]);
        } else {
            container.setComponent("text", `## [${title}](${result.siteUrl})\n${result.description}`);
        }

        container.setComponent("footer", result.footer);
        return container;
    },

    async execute(interaction): Promise<void> {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        await interaction.defer(hidden);
        const container = interaction.getContainer();

        try {
            await createSimplePagination(this, interaction, "update");
        } catch (error: any) {
            logger.error("Error in update command", "UpdateCommand", { error });
            const errorMessage = error.message || "An error occurred while processing the update command.";

            container.setComponent("error", errorMessage);
            await interaction.replyContainer(true);
        }
    },
};
