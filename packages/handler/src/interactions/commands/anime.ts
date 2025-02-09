import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "@discordjs/builders";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: Command = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("anime")
        .setDescription("Find an anime based on the name")
        .addExample("/anime name:One Piece")
        .addStringOption((option) => option.setName("name").setDescription("The name of the anime").setRequired(true)),
    async execute(interaction): Promise<void> {
        const anime = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) || "";

        const data = await api
            .fetch(Routes.Relations, {
                media_name: anime,
                media_type: MediaType.Anime,
            })
            .catch((error: any) => {
                logger.error("Error while fetching data from the API.", "Anilist", error);
                return null;
            });

        if (data === null) {
            return interaction.reply({
                content: "An error occurred while fetching data from the API",
                ephemeral: true,
            });
        }

        if (data.relations.length === 0) {
            logger.debugSingle("No relations found", "Anilist");
            return interaction.reply({ content: "No anime found", ephemeral: true });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId(`media_selection:anime:${interaction.member_id}`)
            .setPlaceholder("Choose A Media...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                data.relations.slice(0, 25).map((relation) => {
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(`${relation.english || relation.romaji || relation.native || ""}`.slice(0, 100))
                        .setValue(`${relation.id}`)
                        .setDescription(`${relation.format} - (${relation.airingType})`.slice(0, 100));
                }),
            );

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({ components: [row] });
    },
};
