import { SlashCommandBuilder } from "@discordjs/builders";
import { env } from "core";
import { Logger } from "log";
import type { Command } from "../../services/commands.js";
//import { ApplicationCommandOptionType } from "discord-api-types/v10";
//import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: Command = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Setup your anilist account!")
        .addStringOption((option) =>
            option.setName("username").setDescription("Your anilist username").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        //const username = getCommandOption("language", ApplicationCommandOptionType.String, interaction.options);
        logger.infoSingle(`Fetching data from the API at: ${env.API_URL}`, "Anilist");

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

        logger.info("Successfully fetched data from the API.", "Anilist", result);

        await interaction.reply({ content: "Pong!" });
    },
};
