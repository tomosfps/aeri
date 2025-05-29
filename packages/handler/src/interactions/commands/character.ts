import { ButtonBuilder, SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    ButtonStyle,
    InteractionContextType,
    MessageFlags,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
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
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const character_name = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) || "";
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const { result: character, error } = await api.fetch(Routes.Character, { character_name });

        if (error || !character) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const minDescriptionLength = 23;
        const container = interaction.getContainer();

        const section = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(
                `# [${character.fullName}](${character.siteUrl})\n${character.description}${character.addOnDescription}`,
            ),
        );

        if (character.image) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(character.image));
        }

        const descriptionButton = new ButtonBuilder()
            .setCustomId(`character:${character_name}:DESCRIPTION:${interaction.user.id}`)
            .setLabel("Description")
            .setStyle(ButtonStyle.Primary);

        const animeButton = new ButtonBuilder()
            .setCustomId(`character:${character_name}:ANIME:${interaction.user.id}`)
            .setLabel("Anime Appearances")
            .setDisabled(character.animeDescription.length <= minDescriptionLength)
            .setStyle(ButtonStyle.Secondary);

        const mangaButton = new ButtonBuilder()
            .setCustomId(`character:${character_name}:MANGA:${interaction.user.id}`)
            .setLabel("Manga Appearances")
            .setDisabled(character.mangaDescription.length <= minDescriptionLength)
            .setStyle(ButtonStyle.Secondary);

        container
            .setComponentOrder(["section", "actionRow"])
            .setComponent("section", [section])
            .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
            .setComponent("actionRow", [[descriptionButton, animeButton, mangaButton]])
            .setComponent("footer", character.footer);

        await interaction.replyContainer(hidden);
    },
};
