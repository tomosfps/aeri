import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { ApplicationCommandOptionType, ButtonStyle } from "@discordjs/core";
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
        .setName("character")
        .setDescription("Find a character based on the name")
        .addExample("/character name:Saitama")
        .setCategory("Anime/Manga")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option.setName("name").setDescription("The name of the character").setRequired(true),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the input or not").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const character_name = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) || "";

        const { result: character, error } = await api.fetch(Routes.Character, { character_name });

        if (error || !character) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                ephemeral: true,
            });
        }

        const minDescriptionLength = 23;
        const embed = new EmbedBuilder()
            .setTitle(character.fullName)
            .setURL(character.siteUrl)
            .setDescription(character.description + character.addOnDescription)
            .setThumbnail(character.image)
            .setColor(interaction.base_colour)
            .setFooter({ text: character.footer });

        const descriptionButton = new ButtonBuilder()
            .setCustomId(`characterShow:${character_name}:DESCRIPTION:${interaction.user.id}`)
            .setLabel("See Character Description")
            .setStyle(ButtonStyle.Primary);

        const animeButton = new ButtonBuilder()
            .setCustomId(`characterShow:${character_name}:ANIME:${interaction.user.id}`)
            .setLabel("See Anime Show Appearances")
            .setDisabled(character.animeDescription.length <= minDescriptionLength)
            .setStyle(ButtonStyle.Secondary);

        const mangaButton = new ButtonBuilder()
            .setCustomId(`characterShow:${character_name}:MANGA:${interaction.user.id}`)
            .setLabel("See Manga Character Appearances")
            .setDisabled(character.mangaDescription.length <= minDescriptionLength)
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(descriptionButton, animeButton, mangaButton);

        return interaction.reply({
            embeds: [embed],
            components: [row],
        });
    },
};
