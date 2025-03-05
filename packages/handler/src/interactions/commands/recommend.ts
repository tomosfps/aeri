import {
    ActionRowBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "@discordjs/builders";

import { dbFetchAnilistUser } from "database";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationCommandOptionType, ApplicationIntegrationType } from "discord-api-types/v10";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
const genreList = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Psychological",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Thriller",
    "Supernatural",
    "Sports",
    "Historical",
    "Mecha",
    "Music",
    "Ecchi",
    "Shoujo",
    "Shounen",
    "Josei",
    "Seinen",
    "Isekai",
    "Martial Arts",
];

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("recommend")
        .setDescription("Recommend an anime or manga based on genre(s) or score")
        .setCooldown(5)
        .addExample("/recommend media:Anime genre:true")
        .addExample("/recommend media:Manga score:true")
        .addExample("/recommend media:Anime score:true")
        .addExample("/recommend media:Manga genre:true")
        .addExample("You can not use both genre and score at the same time")
        .setCategory("Anime/Manga")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option
                .setName("media")
                .setDescription("Choose a media type")
                .setRequired(true)
                .addChoices({ name: "Anime", value: "ANIME" }, { name: "Manga", value: "MANGA" }),
        )
        .addStringOption((option) =>
            option
                .setName("based_on")
                .setDescription("Recommendation based on genre or score")
                .setRequired(true)
                .addChoices({ name: "Genre", value: "Genre" }, { name: "Score", value: "Score" }),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the input or not").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const media = getCommandOption("media", ApplicationCommandOptionType.String, interaction.options) || "";
        const basedOn = getCommandOption("based_on", ApplicationCommandOptionType.String, interaction.options) || "";
        const media_type = media === "ANIME" ? MediaType.Anime : MediaType.Manga;
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;

        if (basedOn === "Genre") {
            const select = new StringSelectMenuBuilder()
                .setCustomId(`genre_selection:${media}:${interaction.user_id}`)
                .setPlaceholder("Choose Some Genres...")
                .setMinValues(1)
                .setMaxValues(24)
                .addOptions(
                    genreList.map((genre) => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(genre)
                            .setValue(genre)
                            .setDescription(`Get recommendations for ${genre} genre`);
                    }),
                );

            const row = new ActionRowBuilder().addComponents(select);
            return await interaction.reply({ components: [row], ephemeral: hidden });
        }

        await interaction.defer();
        const dbUser = await dbFetchAnilistUser(interaction.user_id);

        if (!dbUser) {
            return interaction.followUp({
                content: `Could not find your Anilist account. If you haven't please link your account using the ${await getCommandAsMention("link")} command.`,
                ephemeral: true,
            });
        }

        const { result: user, error } = await api.fetch(Routes.User, { username: dbUser.username });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.followUp({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                ephemeral: true,
            });
        }

        if (!user) {
            return interaction.followUp({
                content: `Could not find ${dbUser.username} in Anilist.\nIf you've changed your name please do ${await getCommandAsMention("unlink")} and ${await getCommandAsMention("link")} again.`,
            });
        }

        const topGenres = user.statistics.anime.genres
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((genre) => genre.genre);

        if (topGenres.length === 0) {
            logger.error("User genres are undefined or empty.", "Recommend"); // Unlikely to ever occur, but this is here incase.
            return interaction.followUp({ content: "Could not get an recommendation based on your genres." });
        }

        const { result: recommendation, error: recommendationsError } = await api.fetch(Routes.Recommend, {
            media: media_type,
            genres: topGenres,
        });

        if (recommendationsError) {
            logger.error("Error while fetching recommendations from the API.", "Anilist", recommendationsError);

            return interaction.followUp({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                ephemeral: true,
            });
        }

        if (!recommendation) {
            return interaction.followUp({
                content: `Could not find ${dbUser.username} in Anilist.\nIf you've changed your name please do ${await getCommandAsMention("unlink")} and ${await getCommandAsMention("link")} again.`,
            });
        }

        const media_id = Number(recommendation.id);

        const { result: mediaResult, error: mediaError } = await api.fetch(
            Routes.Media,
            { media_type, media_id },
            { user_id: interaction.user_id, guild_id: interaction.guild_id },
        );

        if (mediaError) {
            logger.error("Error while fetching Media data from the API.", "Anilist", mediaError);

            return interaction.followUp({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner..",
                ephemeral: true,
            });
        }

        if (!mediaResult) {
            return interaction.followUp({
                content: `Could not find ${dbUser.username} in Anilist.\nIf you've changed your name please do ${await getCommandAsMention("unlink")} and ${await getCommandAsMention("link")} again.`,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(mediaResult.title.romaji)
            .setURL(mediaResult.siteUrl)
            .setImage(mediaResult.banner)
            .setThumbnail(mediaResult.cover)
            .setDescription(mediaResult.description)
            .setColor(interaction.base_colour)
            .setFooter({ text: mediaResult.footer });

        await interaction.followUp({ embeds: [embed], ephemeral: hidden });
    },
};
