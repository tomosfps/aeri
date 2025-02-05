import { ApplicationCommandOptionType } from "@discordjs/core";
import { Logger } from "log";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { fetchAnilistStaff } from "../../utility/anilistUtil.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: Command = {
    cooldown: 5,
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
            return null;
        });

        if (staff === null) {
            logger.debug("No staff member found", "Anilist", staff);
            return interaction.reply({ content: "Could not find staff member", ephemeral: true });
        }

        logger.debug("Result information", "Test", staff);
        await interaction.reply({ content: "Success", ephemeral: true });
    },
};
