import {
    ActionRowBuilder,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "@discordjs/builders";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "log";
import type { Command } from "../../services/commands.js";
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
    //cooldown: 20,
    data: new SlashCommandBuilder()
        .setName("recommend")
        .setDescription("Get recommended an anime or manga based on genre or your scores.")
        .addStringOption((option) =>
            option
                .setName("media")
                .setDescription("anime or manga")
                .setRequired(true)
                .addChoices({ name: "Anime", value: "ANIME" }, { name: "Manga", value: "MANGA" }),
        )
        .addBooleanOption((option) =>
            option
                .setName("genre")
                .setDescription("Would you like to base the recommendation on genre")
                .setRequired(false),
        )
        .addBooleanOption((option) =>
            option
                .setName("score")
                .setDescription("Would you like to base the recommendation on your scores")
                .setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        await interaction.defer();

        const media = getCommandOption("media", ApplicationCommandOptionType.String, interaction.options) || "";
        const genre = getCommandOption("genre", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const score = getCommandOption("score", ApplicationCommandOptionType.Boolean, interaction.options) || false;

        if (genre && score) {
            return interaction.followUp({ content: "Please select only one option", ephemeral: true });
        }

        if (!genre && !score) {
            return interaction.followUp({ content: "Please select an option", ephemeral: true });
        }

        if (genre) {
            const select = new StringSelectMenuBuilder()
                .setCustomId(`genre_selection:${media}`)
                .setPlaceholder("Choose A Genre...")
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

            logger.debug("Select Menu Created", "Recommend", select);
            const row = new ActionRowBuilder().addComponents(select);
            await interaction.followUp({ components: [row] });
            return;
        }

        await interaction.followUp({ content: "User search!", ephemeral: true });
    },
};
