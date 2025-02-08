import { EmbedBuilder } from "@discordjs/builders";
import { ApplicationCommandOptionType } from "@discordjs/core";
import { fetchAnilistStudio } from "anilist";
import { Logger } from "logger";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: Command = {
    cooldown: 5,
    owner_only: true,
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
        const studio = await fetchAnilistStudio(studio_name).catch((error: any) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (studio === null) {
            logger.debugSingle("No studio found", "Anilist");
            return interaction.reply({
                content: `Could not find ${studio_name} within the Anilist API`,
                ephemeral: true,
            });
        }

        const footer = `${studio.result.dataFrom === "API" ? "Data from Anilist API" : `Displaying cached data : refreshes in ${interaction.format_seconds(studio.result.leftUntilExpire)}`}`;
        const embed = new EmbedBuilder()
            .setTitle(studio.result.name)
            .setURL(studio.result.url)
            .setDescription(studio.description + studio.animeDescription)
            .setFooter({ text: footer })
            .setColor(0x2f3136);

        return interaction.reply({
            embeds: [embed],
        });
    },
};
