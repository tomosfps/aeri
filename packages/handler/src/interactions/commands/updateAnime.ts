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
        .setName("update-anime")
        .setDescription("Update an anime entry on your Anilist account.")
        .addExample("/update-anime")
        .addStringOption((option) =>
            option
                .setName("name")
                .setAutocomplete(true)
                .setDescription("The name of the anime you want to update.")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("status")
                .setDescription("The status of the anime.")
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
            option.setName("score").setDescription("The score you want to give the anime.").setRequired(false),
        )
        .addNumberOption((option) =>
            option.setName("progress").setDescription("The progress you have made in the anime.").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        if (interaction.guild_id === undefined) {
            return interaction.reply({
                content: "This command can only be used in a server.",
                ephemeral: true,
            });
        }

        const name = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) as string;
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

        const user_id = Number(inDatabase.id);
        const { result, error } = await api.fetch(Routes.UserScore, { user_id, media_id: Number.parseInt(name) });

        if (error || result === null) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content: "An error occurred while fetching data from the API",
                ephemeral: true,
            });
        }

        const status =
            getCommandOption("status", ApplicationCommandOptionType.String, interaction.options) ||
            (result.status as MediaListStatus);
        const score =
            getCommandOption("score", ApplicationCommandOptionType.Number, interaction.options) ||
            (result.score as number);
        const progress =
            getCommandOption("progress", ApplicationCommandOptionType.Number, interaction.options) ||
            (result.progress as number);

        if (!status && !score && !progress) {
            return interaction.reply({
                content: "You must provide at least one of the following: `status, score, progress`",
                ephemeral: true,
            });
        }

        const id = Number(name);
        const token = inDatabase.token;
        const { result: updateMedia, error: updateError } = await api.fetch(Routes.UpdateMedia, {
            status: status as MediaListStatus,
            score: score,
            progress: progress,
            id: id,
            token: token,
        });

        if (updateError || updateMedia === null) {
            logger.error("Error while fetching MUTATION data from the API.", "Anilist", { updateError });

            return interaction.reply({
                content: "An error occurred while fetching MUTATION data from the API",
                ephemeral: true,
            });
        }

        return interaction.reply({
            content: "Anime entry updated successfully.",
            ephemeral: true,
        });
    },
};
