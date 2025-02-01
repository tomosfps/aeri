import {
    ActionRowBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "@discordjs/builders";
import { fetchAnilistUser } from "database";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "log";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { fetchAnilistMedia, fetchAnilistUserData, fetchRecommendation } from "../../utility/anilistUtil.js";

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
        const mediaType = media === "ANIME" ? "ANIME" : "MANGA";
        const genre = getCommandOption("genre", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const score = getCommandOption("score", ApplicationCommandOptionType.Boolean, interaction.options) || false;

        if (genre && score) {
            return interaction.followUp({ content: "Please select only one option" });
        }

        if (genre === null && score === null) {
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

        const userFetch = await fetchAnilistUserData(username, interaction);
        if (!userFetch) {
            return interaction.followUp({ content: "User not found" });
        }
        logger.debug("Gained user data", "Recommend", userFetch.result);

        const topGenres = userFetch.result.animeStats.genres
            ? userFetch.result.animeStats.genres
                  .sort((a: any, b: any) => b.count - a.count)
                  .slice(0, 5)
                  .map((genre: any) => genre.genre)
            : [];

        logger.debug("Got top 5 genres", "Recommend", topGenres);
        if (topGenres.length === 0) {
            logger.error("User genres are undefined or empty", "Recommend");
            return interaction.followUp({ content: "Error: User genres are undefined or empty" });
        }

        const recommendation = await fetchRecommendation(media, topGenres);
        if (recommendation === null) {
            logger.errorSingle("Problem trying to fetch data in result", "recommend");
            return interaction.followUp({ content: "Problem trying to fetch data" });
        }

        const result = await fetchAnilistMedia(mediaType, Number(recommendation), interaction);
        const embed = new EmbedBuilder()
            .setTitle(result.result.romaji)
            .setURL(result.result.url)
            .setImage(result.result.banner)
            .setThumbnail(result.result.cover.extraLarge)
            .setDescription(result.description.join(""))
            .setFooter({
                text: `${result.result.dataFrom === "API" ? "Displaying API data" : `Displaying cache data : expires in ${interaction.format_seconds(result.result.leftUntilExpire)}`}`,
            })
            .setColor(0x2f3136);

        await interaction.followUp({ embeds: [embed] });
    },
};
