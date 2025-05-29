import { MediaGalleryItemBuilder, SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { Logger } from "logger";
import { MediaFormat, Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("random")
        .setDescription("Randomly get a media based on the format")
        .setCooldown(5)
        .addExample("/random formats:TV")
        .addExample("/random formats:MANGA")
        .addExample("/random formats:ONA")
        .setCategory("Anime/Manga")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option
                .setName("format")
                .setDescription("Random media based on format")
                .setRequired(true)
                .addChoices(
                    ...Object.entries(MediaFormat)
                        .slice(0, -1)
                        .map(([key, value]) => ({
                            name: key,
                            value: value,
                        })),
                ),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const formatStr = getCommandOption(
            "format",
            ApplicationCommandOptionType.String,
            interaction.options,
        ) as string;
        const format = [formatStr] as MediaFormat[];
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        await interaction.defer(hidden);

        const { result, error } = await api.fetch(Routes.Random, { formats: format });

        if (error || !result) {
            return interaction.followUp({ content: "Failed to fetch random media", flags: MessageFlags.Ephemeral });
        }

        const { result: mediaResult, error: mediaError } = await api.fetch(
            Routes.Media,
            { media_type: result.media_type, media_id: result.id },
            { user_id: interaction.userID, guild_id: interaction.guildID },
        );

        if (mediaError || !mediaResult) {
            logger.error("Error while fetching Media data from the API.", "Anilist", { mediaError });

            return interaction.editReply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                flags: MessageFlags.Ephemeral,
            });
        }

        const container = interaction.getContainer().setComponentOrder(["media", "section", "actionRow"]);

        const section = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(
                `# [${mediaResult.title.romaji}](${mediaResult.siteUrl})\n${mediaResult.description || "No description available."}`,
            ),
        );

        if (mediaResult.cover) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(mediaResult.cover));
        }

        container
            .setComponent("section", [section])
            .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);

        if (mediaResult.banner) {
            container
                .setComponent("media", [new MediaGalleryItemBuilder().setURL(mediaResult.banner)])
                .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);
        }

        if (mediaResult.footer) {
            container.setComponent("footer", mediaResult.footer);
        }

        await interaction.followUpContainer(hidden);
    },
};
