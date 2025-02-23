import { dbFetchAnilistUser } from "database";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "logger";
import { MediaListStatus, Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("update-media")
        .setDescription("Update a media entry on your Anilist account.")
        .addExample("/update-media")
        .addNumberOption((option) =>
            option
                .setName("id")
                .setAutocomplete(true)
                .setDescription("The id of the media you want to update.")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("The type of the media.")
                .setRequired(true)
                .addChoices({ name: "Anime", value: "ANIME" }, { name: "Manga", value: "MANGA" }),
        )
        .addStringOption((option) =>
            option
                .setName("status")
                .setDescription("The status of the media.")
                .setRequired(false)
                .addChoices(
                    ...Object.entries(MediaListStatus)
                        .slice(0, -1)
                        .map(([key, value]) => ({
                            name: key,
                            value: value.toUpperCase(),
                        })),
                ),
        )
        .addNumberOption((option) =>
            option.setName("score").setDescription("The score you want to give the media.").setRequired(false),
        )
        .addNumberOption((option) =>
            option.setName("progress").setDescription("The progress you have made in the media.").setRequired(false),
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
                content: "You need to setup OAuth first. Use `/login` to do so.",
                ephemeral: true,
            });
        }

        if (inDatabase.token === null || inDatabase.id === null) {
            return interaction.reply({
                content: "You need to setup OAuth first. Use `/login` to do so.",
                ephemeral: true,
            });
        }

        const id = getCommandOption("id", ApplicationCommandOptionType.Number, interaction.options) as number;
        //const type      = getCommandOption("type", ApplicationCommandOptionType.String, interaction.options) as MediaType;
        const status =
            (getCommandOption("status", ApplicationCommandOptionType.String, interaction.options) as MediaListStatus) ||
            MediaListStatus.Current;
        const score = getCommandOption("score", ApplicationCommandOptionType.Number, interaction.options) || 0.0;
        const progress = getCommandOption("progress", ApplicationCommandOptionType.Number, interaction.options) || 0;
        const token = inDatabase.token;

        const { result: updateMedia, error: updateError } = await api.fetch(Routes.UpdateMedia, {
            status,
            score,
            progress,
            id,
            token,
        });

        if (updateError || updateMedia === null) {
            logger.error("Error while fetching MUTATION data from the API.", "Anilist", { updateError });

            return interaction.reply({
                content: "An error occurred while fetching MUTATION data from the API",
                ephemeral: true,
            });
        }

        return interaction.reply({
            content: "Media entry updated successfully.",
            ephemeral: true,
        });
    },
};
