import { EmbedBuilder, inlineCode } from "@discordjs/builders";
import { ApplicationCommandOptionType } from "@discordjs/core";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: ChatInputCommand = {
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

        const { result: studio, error } = await api.fetch(Routes.Studio, { studio_name });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.reply({
                content: "An error occurred while fetching data from the API",
                ephemeral: true,
            });
        }

        if (studio === null) {
            logger.debugSingle("Studio could not be found within the Anilist API", "Anilist");

            return interaction.reply({
                content: `Could not find ${inlineCode(studio_name)} within the Anilist API`,
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(studio.name)
            .setURL(studio.siteUrl)
            .setDescription(studio.description + studio.animeDescription)
            .setFooter({ text: studio.footer })
            .setColor(0x2f3136);

        return interaction.reply({
            embeds: [embed],
        });
    },
};
