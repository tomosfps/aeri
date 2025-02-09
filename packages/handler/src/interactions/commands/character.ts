import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, inlineCode } from "@discordjs/builders";
import { ApplicationCommandOptionType, ButtonStyle } from "@discordjs/core";
import { formatSeconds } from "core";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: Command = {
    cooldown: 5,
    owner_only: true,
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

        const character = await api.fetch(Routes.Character, { character_name }).catch((error: any) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return undefined;
        });

        if (character === undefined) {
            return interaction.reply({
                content: "An error occurred while fetching data from the API",
                ephemeral: true,
            });
        }

        if (character === null) {
            logger.debugSingle("Character could not be found within the Anilist API", "Anilist");
            return interaction.reply({
                content: `Could not find ${inlineCode(character_name)} within the Anilist API`,
                ephemeral: true,
            });
        }

        logger.debug("Character found", "Anilist", character);

        const footer = `${character.dataFrom === "API" ? "Data from Anilist API" : `Displaying cached data : refreshes in ${formatSeconds(character.leftUntilExpire)}`}`;
        const minDescriptionLength = 23;

        const embed = new EmbedBuilder()
            .setTitle(character.fullName)
            .setURL(character.siteUrl)
            .setDescription(character.description + character.addOnDescription)
            .setThumbnail(character.image)
            .setFooter({ text: footer })
            .setColor(0x2f3136);

        const descriptionButton = new ButtonBuilder()
            .setCustomId(`characterShow:${character_name}:DESCRIPTION:${interaction.member?.user.id}`)
            .setLabel("See Character Description")
            .setStyle(ButtonStyle.Primary);

        const animeButton = new ButtonBuilder()
            .setCustomId(`characterShow:${character_name}:ANIME:${interaction.member?.user.id}`)
            .setLabel("See Anime Show Appearances")
            .setDisabled(character.animeDescription.length <= minDescriptionLength)
            .setStyle(ButtonStyle.Secondary);

        const mangaButton = new ButtonBuilder()
            .setCustomId(`characterShow:${character_name}:MANGA:${interaction.member?.user.id}`)
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
