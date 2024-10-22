import { SlashCommandBuilder } from "@discordjs/builders";
import { codeBlock } from "@discordjs/builders";
import { env } from "core";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "log";
import type { Command } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: Command = {
    data: new SlashCommandBuilder()
        .setName("anime")
        .setDescription("Find an ANIME")
        .addStringOption((option) => option.setName("anime").setDescription("Name of the anime").setRequired(true)),
    async execute(interaction): Promise<void> {
        const anime = getCommandOption("anime", ApplicationCommandOptionType.String, interaction.options);

        const response = await fetch(`${env.API_URL}/relations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                media_name: anime,
                media_type: "ANIME",
            }),
        }).catch((error) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (response === null) {
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        const result = await response.json().catch((error) => {
            logger.error("Error while parsing JSON data.", "Anilist", error);
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        });

        if (result === null) {
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        logger.info("Result:", "Result", result);

        const allRomaji = result.relations.map((item: { romaji: any }) => `${item.romaji}\n`);

        /*
        const response = await fetch(`${env.API_URL}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                media_id: 21,
                media_type: "ANIME",
            }),
        }).catch((error) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (response === null) {
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        const result = await response.json().catch((error) => {
            logger.error("Error while parsing JSON data.", "Anilist", error);
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        });
        */

        // Add Select Menu Here

        await interaction.reply({ content: `${codeBlock(allRomaji)}` });
    },
};
