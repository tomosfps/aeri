import { env } from "core";
import { Logger } from "log";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";

const logger = new Logger();
export const interaction: Command = {
    data: new SlashCommandBuilder()
        .setName("test-character")
        .setDescription("Testing character")
        .addExample("/test-character"),
    async execute(interaction): Promise<void> {
        const response = await fetch(`${env.API_URL}/character`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                character_name: "Saitama",
            }),
        }).catch((error) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (response === null) {
            logger.error("Request returned null", "Anilist");
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        const result = await response.json().catch((error) => {
            logger.error("Error while parsing JSON data.", "Anilist", error);
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        });

        if (result === null) {
            return interaction.reply({ content: "Problem trying to fetch data", ephemeral: true });
        }

        logger.debug("Result information", "Test", result);
        await interaction.reply({ content: "Success", ephemeral: true });
    },
};
