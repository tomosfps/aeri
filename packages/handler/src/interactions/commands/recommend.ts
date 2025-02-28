import {
    ActionRowBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "@discordjs/builders";

import { dbFetchAnilistUser } from "database";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
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
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("recommend")
        .setDescription("Recommend an anime or manga based on genre(s) or score")
        .addExample("/recommend media:Anime genre:true")
        .addExample("/recommend media:Manga score:true")
        .addExample("/recommend media:Anime score:true")
        .addExample("/recommend media:Manga genre:true")
        .addExample("You can not use both genre and score at the same time")
        .addCategory("Anime/Manga")
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
        ),
    async execute(interaction): Promise<void> {
        if (!interaction.guild_id) {
            return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
        }

        const media = getCommandOption("media", ApplicationCommandOptionType.String, interaction.options) || "";
        const basedOn = getCommandOption("based_on", ApplicationCommandOptionType.String, interaction.options) || "";
        const media_type = media === "ANIME" ? MediaType.Anime : MediaType.Manga;

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

            logger.debugSingle("Select Menu Created", "Recommend");
            const row = new ActionRowBuilder().addComponents(select);
            return await interaction.reply({ components: [row] });
        }

        await interaction.defer();

        const dbUser = await dbFetchAnilistUser(interaction.user_id);

        if (!dbUser) {
            return interaction.followUp({
                content:
                    "Could not find your Anilist account. If you haven't please link your account using the `/setup` command.",
                ephemeral: true,
            });
        }

        const { result: user, error } = await api.fetch(Routes.User, { username: dbUser.username });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.followUp({
                content: "An error occurred while fetching data from the API.",
                ephemeral: true,
            });
        }

        if (!user) {
            return interaction.followUp({ content: "User not found" });
        }

        const topGenres = user.statistics.anime.genres
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((genre) => genre.genre);

        if (topGenres.length === 0) {
            logger.error("User genres are undefined or empty", "Recommend");
            return interaction.followUp({ content: "Error: User genres are undefined or empty" });
        }

        const { result: recommendation, error: recommendationsError } = await api.fetch(Routes.Recommend, {
            media: media_type,
            genres: topGenres,
        });

        if (recommendationsError) {
            logger.error("Error while fetching recommendations from the API.", "Anilist", recommendationsError);

            return interaction.followUp({
                content: "An error occurred while fetching data from the API.",
                ephemeral: true,
            });
        }

        if (!recommendation) {
            return interaction.followUp({ content: "User not found" });
        }

        const media_id = Number(recommendation.id);

        const { result: mediaResult, error: mediaError } = await api.fetch(
            Routes.Media,
            { media_type, media_id },
            { guild_id: interaction.guild_id },
        );

        if (mediaError) {
            logger.error("Error while fetching Media data from the API.", "Anilist", mediaError);

            return interaction.followUp({
                content: "An error occurred while fetching data from the API.",
                ephemeral: true,
            });
        }

        if (!mediaResult) {
            return interaction.followUp({ content: "User not found" });
        }

        const embed = new EmbedBuilder()
            .setTitle(mediaResult.title.romaji)
            .setURL(mediaResult.siteUrl)
            .setImage(mediaResult.banner)
            .setThumbnail(mediaResult.cover)
            .setDescription(mediaResult.description)
            .setColor(interaction.base_colour)
            .setFooter({ text: mediaResult.footer });
        interaction.base_colour;

        await interaction.followUp({ embeds: [embed] });
    },
};
