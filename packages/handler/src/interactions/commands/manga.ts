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
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
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
    async execute(interaction): Promise<void> {
        const manga = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) || "";
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;

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

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const nsfwMediaCount = result.relations.filter((relation) => relation.isNSFW).length;
        const filteredRelations = result.relations.filter((relation) => !relation.isNSFW || interaction.isNSFW);

        if (nsfwMediaCount > 0 && !interaction.isNSFW && filteredRelations.length === 0) {
            return interaction.reply({
                content: `NSFW media was filtered out and no other media was found close to ${inlineCode(manga)}\nTo view them, use this command in a NSFW channel.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        if (filteredRelations.length === 0) {
            return interaction.reply({
                content: `Could not find a relation close to ${inlineCode(manga)}`,
                flags: MessageFlags.Ephemeral,
            });
        }

        const { result: mediaResult, error: mediaError } = await api.fetch(
            Routes.Media,
            {
                // biome-ignore lint/style/noNonNullAssertion: filtered above
                media_id: filteredRelations[0]!.id,
                media_type: MediaType.Manga,
            },
            { user_id: interaction.userID, guild_id: interaction.guildID },
        );

        if (mediaError || !mediaResult) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                flags: MessageFlags.Ephemeral,
            });
        }
        const title = mediaResult.title.english || mediaResult.title.romaji || mediaResult.title.native;
        const container = interaction.getContainer();

        if (mediaResult.banner) {
            container
                .setComponent("media", [new MediaGalleryItemBuilder().setURL(mediaResult.banner)])
                .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }]);
        }

        const sectionBuilder = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(`## [${title}](${mediaResult.siteUrl})\n${mediaResult.description}`),
        );

        if (mediaResult.cover) {
            sectionBuilder.setThumbnailAccessory(new ThumbnailBuilder().setURL(mediaResult.cover));
        }

        container
            .setComponentOrder(["media", "section", "separator", "actionRow", "text"])
            .setComponent("section", [sectionBuilder])
            .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
            .setComponent("actionRow", [
                new StringSelectMenuBuilder()
                    .setCustomId(`media:manga:${interaction.userID}`)
                    .setPlaceholder("Choose A Media...")
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
            ])
            .setComponent("text", `${mediaResult.footer}`);

        await interaction.replyContainer(hidden);
    },
};
