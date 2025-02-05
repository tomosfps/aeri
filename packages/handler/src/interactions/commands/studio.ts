import { ApplicationCommandOptionType } from "@discordjs/core";
import { Logger } from "log";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { fetchAnilistStudio } from "../../utility/anilistUtil.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: Command = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("studio")
        .setDescription("Find a studio based on the name")
        .addExample("/studio studio:MAPPA")
        .addStringOption((option) =>
            option.setName("studio_name").setDescription("The name of the studio").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        const studio_name =
            getCommandOption("studio_name", ApplicationCommandOptionType.String, interaction.options) || "";
        const studio = await fetchAnilistStudio(studio_name).catch((error: any) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (studio === null) {
            logger.debug("No studio found", "Anilist", studio);
            return interaction.reply({ content: "No studio found", ephemeral: true });
        }

        logger.debug("Result information", "Test", studio);
        await interaction.reply({ content: "Success", ephemeral: true });
    },
};
