import { EmbedBuilder, inlineCode } from "@discordjs/builders";
import { ApplicationCommandOptionType } from "@discordjs/core";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationIntegrationType } from "discord-api-types/v10";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("studio")
        .setDescription("Find a studio based on the name")
        .addExample("/studio studio:MAPPA")
        .setCategory("Anime/Manga")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option.setName("studio_name").setDescription("The name of the studio").setRequired(true),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the input or not").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const studio_name =
            getCommandOption("studio_name", ApplicationCommandOptionType.String, interaction.options) || "";
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;

        const { result: studio, error } = await api.fetch(Routes.Studio, { studio_name });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
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
            .setColor(interaction.base_colour)
            .setFooter({ text: studio.footer });

        return interaction.reply({
            embeds: [embed],
            ephemeral: hidden,
        });
    },
};
