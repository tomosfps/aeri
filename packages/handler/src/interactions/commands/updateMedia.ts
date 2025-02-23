import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { getCommandOption } from "../../utility/interactionUtils.js";
import { api, MediaListStatus, MediaType, Routes } from "wrappers/anilist";
import { dbFetchAnilistUser } from "database";
import { Logger } from "logger";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("update-media")
        .setDescription("Update a media entry on your Anilist account.")
        .addExample("/update-media")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("The name of the media you want to update.")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("The type of the media.")
                .setRequired(true)
                .addChoices(
                    { name: "Anime", value: "ANIME" },
                    { name: "Manga", value: "MANGA" },
                ),
        )
        .addStringOption((option) =>
            option
                .setName("status")
                .setDescription("The status of the media.")
                .setRequired(false)
                .addChoices(
                    ...Object.entries(MediaListStatus).map(([key, value]) => ({ name: key, value: value.toUpperCase() }))
                ),
        )
        .addNumberOption((option) =>
            option
                .setName("score")
                .setDescription("The score you want to give the media.")
                .setRequired(false),
        )
        .addNumberOption((option) =>
            option
                .setName("progress")
                .setDescription("The progress you have made in the media.")
                .setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        if (interaction.guild_id === undefined) {
            return interaction.reply({
                content: "This command can only be used in a server.",
                ephemeral: true,
            });
        }

        const inDatabase = await dbFetchAnilistUser(interaction.user_id);

        if (!inDatabase) {
            return interaction.reply({
                content: "You need to link your Anilist account first. Use `/link` to do so.",
                ephemeral: true,
            });
        }

        const name = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) as string;
        const type = getCommandOption("type", ApplicationCommandOptionType.String, interaction.options) as MediaType;
        const status = getCommandOption("status", ApplicationCommandOptionType.String, interaction.options) as MediaListStatus;
        const score = getCommandOption("score", ApplicationCommandOptionType.Number, interaction.options) as number;
        const progress = getCommandOption("progress", ApplicationCommandOptionType.Number, interaction.options) as number;
        
        const { result, error } = await api.fetch(Routes.Media, {
            search:     name,
            media_type: type,
        }, { guild_id: interaction.guild_id });

        if (error || result === null) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content: "An error occurred while fetching data from the API",
                ephemeral: true,
            });
        }

        const { result: updateMedia, error: updateError } = await api.fetch(Routes.UpdateMedia, { 
            status, score, progress,
            id:         inDatabase.id,
            token:      inDatabase.token
        });

        if (updateError) {
            logger.error("Error while fetching data from the API.", "Anilist", updateError);
            return await interaction.reply({ content: "An error occurred while fetching data from the API", ephemeral: true });
        }

        if (updateMedia === null) {
            logger.debugSingle("User could not be found within the Anilist API", "Anilist");
            return await interaction.reply({ content: "An error occurred while fetching data from the API", ephemeral: true });
        }

        return interaction.reply({
            content: updateMedia.status,
            ephemeral: true,
        });

        
    },
};
