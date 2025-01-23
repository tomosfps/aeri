import { SlashCommandBuilder } from "@discordjs/builders";
import { env } from "core";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "log";
import type { Command } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: Command = {
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
            return interaction.reply({ content: "Please select only one option", ephemeral: true });
        }

        const listOfGenres = ["Action", "Adventure"];

        const response = await fetch(`${env.API_URL}/recommend`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                media: media,
                genres: listOfGenres,
                user_id: 1,
            }),
        }).catch((error) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (response === null) {
            logger.error("Request returned null", "Anilist");
            return interaction.followUp({ content: "Problem trying to fetch data", ephemeral: true });
        }

        const result = await response.json().catch((error) => {
            logger.error("Error while parsing JSON data.", "Anilist", error);
            return interaction.followUp({ content: "Problem trying to fetch data", ephemeral: true });
        });

        if (result === null) {
            return interaction.followUp({ content: "Problem trying to fetch data", ephemeral: true });
        }

        interaction.followUp({ content: result, ephemeral: true });
    },
};
