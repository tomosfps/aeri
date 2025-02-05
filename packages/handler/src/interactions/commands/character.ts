import { ApplicationCommandOptionType } from "@discordjs/core";
import { Logger } from "log";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { fetchAnilistCharacter } from "../../utility/anilistUtil.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: Command = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("character")
        .setDescription("Find a character based on the name")
        .addExample("/character character_name:Saitama")
        .addStringOption((option) =>
            option.setName("character_name").setDescription("The name of the character").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        const character_name =
            getCommandOption("character_name", ApplicationCommandOptionType.String, interaction.options) || "";
        const character = await fetchAnilistCharacter(character_name).catch((error: any) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (character === null) {
            logger.debug("No character found", "Anilist", character);
            return interaction.reply({ content: "No character found", ephemeral: true });
        }

        logger.debug("Result information", "Test", character);
        await interaction.reply({ content: "Success", ephemeral: true });
    },
};
