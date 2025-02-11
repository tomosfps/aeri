import {
    ActionRowBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "@discordjs/builders";

import { formatSeconds } from "core";
import { fetchAnilistUser } from "database";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
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

export const interaction: Command = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("recommend")
        .setDescription("Recommend an anime or manga based on genre(s) or score")
        .addExample("/recommend media:Anime genre:true")
        .addExample("/recommend media:Manga score:true")
        .addExample("/recommend media:Anime score:true")
        .addExample("/recommend media:Manga genre:true")
        .addExample("You can not use both genre and score at the same time")
        .addStringOption((option) =>
            option
                .setName("media")
                .setDescription("Choose a media type")
                .setRequired(true)
                .addChoices({ name: "Anime", value: "ANIME" }, { name: "Manga", value: "MANGA" }),
        )
        .addBooleanOption((option) =>
            option.setName("genre").setDescription("Base recommendation on genre(s)").setRequired(false),
        )
        .addBooleanOption((option) =>
            option.setName("score").setDescription("Base recommendation on scores").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        await interaction.defer();

        const media = getCommandOption("media", ApplicationCommandOptionType.String, interaction.options) || "";
        const genre = getCommandOption("genre", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const score = getCommandOption("score", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const media_type = media === "ANIME" ? MediaType.Anime : MediaType.Manga;

        if (genre && score) {
            return interaction.followUp({ content: "Please select only one option" });
        }

        if (!genre && !score) {
            return interaction.followUp({ content: "Please select an option" });
        }

        if (genre) {
            const select = new StringSelectMenuBuilder()
                .setCustomId(`genre_selection:${media}:${interaction.member_id}`)
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
            return await interaction.followUp({ components: [row] });
        }

        const username = (await fetchAnilistUser(interaction.member_id)).username ?? null;
        if (username === null) {
            return interaction.followUp({
                content:
                    "Could not find your Anilist account. If you haven't please link your account using the `/setup` command.",
                ephemeral: true,
            });
        }

        const { result: user, error } = await api.fetch(Routes.User, { username });

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

        const topGenres = user.animeStats.genres
            ? user.animeStats.genres
                  .sort((a: any, b: any) => b.count - a.count)
                  .slice(0, 5)
                  .map((genre: any) => genre.genre)
            : [];

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
        const guild_id = BigInt(interaction.guild_id || 0);
        
        const { result: mediaResult, error: mediaError } = await api.fetch(Routes.Media, { media_type, media_id }, { guild_id });
        
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

        const footer = `${mediaResult.dataFrom === "API" ? "Displaying API data" : `Displaying cache data : expires in ${formatSeconds(mediaResult.leftUntilExpire)}`}`;
        const embed = new EmbedBuilder()
            .setTitle(mediaResult.title.romaji)
            .setURL(mediaResult.siteUrl)
            .setImage(mediaResult.banner)
            .setThumbnail(mediaResult.cover)
            .setDescription(mediaResult.description)
            .setFooter({ text: footer })
            .setColor(0x2f3136);

        await interaction.followUp({ embeds: [embed] });
    },
};

