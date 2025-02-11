import {
    ActionRowBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "@discordjs/builders";

import { fetchAnilistMedia } from "anilist";
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
        const mediaType = media === "ANIME" ? MediaType.Anime : MediaType.Manga;

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

            return interaction.reply({
                content: "An error occurred while fetching data from the API.",
                ephemeral: true,
            });
        }

        if (!user) {
            return interaction.followUp({ content: "User not found" });
        }

        logger.debug("Gained user data", "Recommend", user);

        const topGenres = user.animeStats.genres
            ? user.animeStats.genres
                  .sort((a: any, b: any) => b.count - a.count)
                  .slice(0, 5)
                  .map((genre: any) => genre.genre)
            : [];

        logger.debug("Got top 5 genres", "Recommend", topGenres);
        if (topGenres.length === 0) {
            logger.error("User genres are undefined or empty", "Recommend");
            return interaction.followUp({ content: "Error: User genres are undefined or empty" });
        }

        const recommendation = await api
            .fetch(Routes.Recommend, { media: mediaType, genres: topGenres })
            .catch((error: any) => {
                logger.error("Error while fetching data from the API.", "Anilist", error);
                return undefined;
            });

        if (recommendation === undefined) {
            return interaction.reply({
                content: "An error occurred while fetching data from the API",
                ephemeral: true,
            });
        }

        const result = await fetchAnilistMedia(mediaType, Number(recommendation), interaction);
        const footer = `${result.result.dataFrom === "API" ? "Displaying API data" : `Displaying cache data : expires in ${formatSeconds(result.result.leftUntilExpire)}`}`;
        const embed = new EmbedBuilder()
            .setTitle(result.result.romaji)
            .setURL(result.result.url)
            .setImage(result.result.banner)
            .setThumbnail(result.result.cover.extraLarge)
            .setDescription(result.description)
            .setFooter({ text: footer })
            .setColor(0x2f3136);

        await interaction.followUp({ embeds: [embed] });
    },
};
