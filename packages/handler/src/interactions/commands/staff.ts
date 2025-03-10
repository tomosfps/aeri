import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, inlineCode } from "@discordjs/builders";
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
        .setName("staff")
        .setDescription("Find a staff member on the name")
        .addExample("/staff name:Eiichirou Oda")
        .setCategory("Anime/Manga")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option.setName("name").setDescription("The name of the staff member").setRequired(true),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the input or not").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const staff_name = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) || "";
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const { result: staff, error } = await api.fetch(Routes.Staff, { staff_name });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                ephemeral: true,
            });
        }

        if (staff === null) {
            logger.debugSingle("Staff could not be found within the Anilist API", "Anilist");

            return interaction.reply({
                content: `Could not find ${inlineCode(staff_name)} within the Anilist API`,
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(staff.fullName)
            .setURL(staff.siteUrl)
            .setDescription(staff.description)
            .setThumbnail(staff.image)
            .setColor(interaction.base_colour)
            .setFooter({ text: staff.footer });

        const animeButton = new ButtonBuilder()
            .setCustomId(`staffShow:${staff_name}:ANIME:${interaction.user.id}`)
            .setLabel("See Anime Within/Worked On")
            .setStyle(ButtonStyle.Primary);

        const mangaButton = new ButtonBuilder()
            .setCustomId(`staffShow:${staff_name}:MANGA:${interaction.user.id}`)
            .setLabel("See Manga Created")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(animeButton, mangaButton);
        return interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: hidden,
        });
    },
};
