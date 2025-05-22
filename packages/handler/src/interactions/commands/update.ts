import { EmbedBuilder } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "@discordjs/core";
import { dbFetchAnilistUser } from "database";
import { Logger } from "logger";
import { MediaListStatus, MediaType, Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
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
    async execute(interaction): Promise<void> {
        const command = interaction.subcommand === "anime" ? MediaType.Anime : MediaType.Manga;
        const name = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) as string;
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const status = getCommandOption("status", ApplicationCommandOptionType.String, interaction.options);
        const score = getCommandOption("score", ApplicationCommandOptionType.Number, interaction.options);
        const progress = getCommandOption("progress", ApplicationCommandOptionType.Number, interaction.options);
        const volumes =
            command === MediaType.Manga
                ? getCommandOption("volumes", ApplicationCommandOptionType.Number, interaction.options)
                : null;
        const inDatabase = await dbFetchAnilistUser(interaction.userID);

        if (!inDatabase || inDatabase.token === null) {
            return interaction.reply({
                content: `You need to setup OAuth first. Use ${await getCommandAsMention("login")} to do so.`,
                flags: MessageFlags.Ephemeral,
            });
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

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const { result, error } = await api.fetch(
            Routes.Media,
            { media_type: command, media_id: Number(name) },
            { user_id: interaction.userID, guild_id: interaction.guildID },
        );

        if (error || result === null) {
            logger.error("Error while fetching data MEDIA from the API.", "Anilist", { error });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(result.title.romaji)
            .setURL(result.siteUrl)
            .setImage(result.banner)
            .setThumbnail(result.cover)
            .setColor(interaction.baseColour)
            .setDescription(result.description)
            .setFooter({
                text: `${result.footer}\n• If the score doesn't update, use /refresh`,
            });

        return interaction.reply({ embeds: [embed], flags: hidden ? MessageFlags.Ephemeral : undefined });
    },
};
