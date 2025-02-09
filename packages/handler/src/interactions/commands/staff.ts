import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { ApplicationCommandOptionType, ButtonStyle } from "@discordjs/core";
import { fetchAnilistStaff } from "anilist";
import { formatSeconds } from "core";
import { Logger } from "logger";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: Command = {
    cooldown: 5,
    owner_only: true,
    data: new SlashCommandBuilder()
        .setName("staff")
        .setDescription("Find a staff member on the name")
        .addExample("/staff staff_name:Eiichirou Oda")
        .addStringOption((option) =>
            option.setName("staff_name").setDescription("The name of the staff member").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        const staff_name =
            getCommandOption("staff_name", ApplicationCommandOptionType.String, interaction.options) || "";

        const staff = await fetchAnilistStaff(staff_name).catch((error: any) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return interaction.reply({ content: "An error occurred while fetching data from the API." });
        });

        if (staff === null) {
            logger.debug("Staff could not be found within the Anilist API", "Anilist", staff);
            return interaction.reply({
                content: `Could not find ${staff_name} within the Anilist API`,
                ephemeral: true,
            });
        }

        const minDescriptionLength = 23;
        const footer = `${staff.result.dataFrom === "API" ? "Data from Anilist API" : `Displaying cached data : refreshes in ${formatSeconds(staff.result.leftUntilExpire)}`}`;

        const embed = new EmbedBuilder()
            .setTitle(staff.result.fullName)
            .setURL(staff.result.url)
            .setThumbnail(staff.result.image)
            .setDescription(staff.description)
            .setFooter({ text: footer })
            .setColor(0x2f3136);

        const animeButton = new ButtonBuilder()
            .setCustomId(`staffAnimeShow:${staff_name}:${interaction.member?.user.id}`)
            .setLabel("See Anime Within/Worked On")
            .setDisabled(staff.animeDescription.length <= minDescriptionLength)
            .setStyle(ButtonStyle.Primary);

        const mangaButton = new ButtonBuilder()
            .setCustomId(`staffMangaShow:${staff_name}:${interaction.member?.user.id}`)
            .setLabel("See Manga Worked On")
            .setDisabled(staff.mangaDescription.length <= minDescriptionLength)
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(animeButton, mangaButton);
        return interaction.reply({
            embeds: [embed],
            components: [row],
        });
    },
};
