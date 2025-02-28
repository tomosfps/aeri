import {
    ActionRowBuilder,
    ContextMenuCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    inlineCode,
} from "@discordjs/builders";
import { ApplicationCommandType } from "discord-api-types/v10";
import { Logger } from "logger";
import { MediaType, Routes, api } from "wrappers/anilist";
import type { MessageContextCommand } from "../../services/commands.js";

const logger = new Logger();

export const interaction: MessageContextCommand = {
    data: new ContextMenuCommandBuilder().setName("manga").setType(ApplicationCommandType.Message),
    async execute(interaction) {
        const manga = interaction.target.content;

        logger.debug("Fetching data from the API", "Anilist", { manga });
        const { result, error } = await api.fetch(Routes.Relations, {
            media_name: manga,
            media_type: MediaType.Manga,
        });

        if (error || result === null) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                ephemeral: true,
            });
        }

        if (result.relations.length === 0) {
            return interaction.reply({
                content: `Could not find a relation close to ${inlineCode(manga)}`,
                ephemeral: true,
            });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId(`media_selection:manga:${interaction.user_id}`)
            .setPlaceholder("Choose A Media...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                result.relations.slice(0, 25).map((relation) => {
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
