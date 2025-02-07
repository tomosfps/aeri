import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "@discordjs/builders";
import { fetchAnilistRelations } from "anilist";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "log";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();
export const interaction: Command = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("manga")
        .setDescription("Find an manga based on the name")
        .addExample("/manga media_name:One Piece")
        .addStringOption((option) =>
            option.setName("media_name").setDescription("The name of the manga").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        const manga = getCommandOption("media_name", ApplicationCommandOptionType.String, interaction.options) || "";
        const relations = await fetchAnilistRelations(manga, "MANGA").catch((error: any) => {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return null;
        });

        if (relations === null) {
            logger.debug("No relations found", "Anilist", relations);
            return interaction.reply({ content: "No relations found", ephemeral: true });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId(`media_selection:manga:${interaction.member_id}`)
            .setPlaceholder("Choose A Media...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                relations.slice(0, 25).map(
                    (items: {
                        native: string;
                        english: string;
                        romaji: string;
                        id: number;
                        format: string;
                        airingType: string;
                    }) => {
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(`${items.english || items.romaji || items.native || ""}`.slice(0, 100))
                            .setValue(`${items.id}`)
                            .setDescription(`${items.format} - (${items.airingType})`.slice(0, 100));
                    },
                ),
            );
        const row = new ActionRowBuilder().addComponents(select);
        await interaction.reply({ components: [row] });
    },
};
