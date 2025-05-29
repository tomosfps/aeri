import { ButtonBuilder, SectionBuilder, ThumbnailBuilder, inlineCode } from "@discordjs/builders";
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
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
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
                flags: MessageFlags.Ephemeral,
            });
        }

        if (staff === null) {
            logger.debugSingle("Staff could not be found within the Anilist API", "Anilist");

            return interaction.reply({
                content: `Could not find ${inlineCode(staff_name)} within the Anilist API`,
                flags: MessageFlags.Ephemeral,
            });
        }

        const container = interaction.getContainer();

        const section = new SectionBuilder().addTextDisplayComponents((builder) =>
            builder.setContent(`# [${staff.fullName}](${staff.siteUrl})\n${staff.description}`),
        );

        if (staff.image) {
            section.setThumbnailAccessory(new ThumbnailBuilder().setURL(staff.image));
        }

        const animeButton = new ButtonBuilder()
            .setCustomId(`staff:${staff_name}:ANIME:${interaction.user.id}`)
            .setLabel("Anime Within/Worked On")
            .setStyle(ButtonStyle.Primary);

        const mangaButton = new ButtonBuilder()
            .setCustomId(`staff:${staff_name}:MANGA:${interaction.user.id}`)
            .setLabel("Manga Created")
            .setStyle(ButtonStyle.Secondary);

        container
            .setComponentOrder(["section", "actionRow"])
            .setComponent("section", [section])
            .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
            .setComponent("actionRow", [[animeButton, mangaButton]])
            .setComponent("footer", staff.footer);

        await interaction.replyContainer(hidden);
    },
};
