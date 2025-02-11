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
        .setName("staff")
        .setDescription("Find a staff member on the name")
        .addExample("/staff name:Eiichirou Oda")
        .addStringOption((option) =>
            option.setName("name").setDescription("The name of the staff member").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        const staff_name = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) || "";

        const { result: staff, error } = await api.fetch(Routes.Staff, { staff_name });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);

            return interaction.reply({
                content: "An error occurred while fetching data from the API",
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

        logger.debug("Staff found", "Anilist", staff);
        const footer = `${staff.dataFrom === "API" ? "Data from Anilist API" : `Displaying cached data : refreshes in ${formatSeconds(staff.leftUntilExpire)}`}`;

        const embed = new EmbedBuilder()
            .setTitle(staff.fullName)
            .setURL(staff.siteUrl)
            .setDescription(staff.description)
            .setThumbnail(staff.image)
            .setFooter({ text: footer })
            .setColor(0x2f3136);

        const animeButton = new ButtonBuilder()
            .setCustomId(`staffShow:${staff_name}:ANIME:${interaction.member?.user.id}`)
            .setLabel("See Anime Within/Worked On")
            .setStyle(ButtonStyle.Primary);

        const mangaButton = new ButtonBuilder()
            .setCustomId(`staffShow:${staff_name}:MANGA:${interaction.member?.user.id}`)
            .setLabel("See Manga Worked On")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(animeButton, mangaButton);
        return interaction.reply({
            embeds: [embed],
            components: [row],
        });
    },
};
