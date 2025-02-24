import { EmbedBuilder } from "@discordjs/builders";
import { dbFetchAnilistUser } from "database";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "logger";
import { MediaListStatus, MediaType, Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("update-anime")
        .setDescription("Update an anime entry on your Anilist account.")
        .addExample("/update-anime name:Berserk score:10 status:Current progress:153")
        .addExample("/update-anime name:One Piece score:10")
        .addExample("/update-anime name:One Piece status:Paused")
        .addExample("/update-anime name:One Piece progress:1140")
        .addExample(
            "Any choices that are left out, will be automatically grabbed from the user and set to the current value.",
        )
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
                            value: value,
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

        if (!inDatabase || inDatabase.token === null) {
            return interaction.reply({
                content: "You need to setup OAuth first. Use `/login` to do so.",
                ephemeral: true,
            });
        }

        const { result, error } = await api.fetch(
            Routes.Media,
            { media_type: MediaType.Anime, media_id: Number(name) },
            { guild_id: interaction.guild_id },
        );

        if (error || result === null) {
            logger.error("Error while fetching data MEDIA from the API.", "Anilist", { error });

            return interaction.reply({
                content: "An error occurred while fetching data from the API",
                ephemeral: true,
            });
        }

        logger.debug("Fetched data from the API.", "Anilist", { result });
        const getUserResults = result.userResults.find((userResult) => userResult.username === inDatabase.username);
        if (!getUserResults) {
            return;
        } // This shouldn't get called

        const status =
            getCommandOption("status", ApplicationCommandOptionType.String, interaction.options) ||
            (getUserResults.status as MediaListStatus);
        const score =
            getCommandOption("score", ApplicationCommandOptionType.Number, interaction.options) ||
            (getUserResults.score as number);
        const progress =
            getCommandOption("progress", ApplicationCommandOptionType.Number, interaction.options) ||
            (getUserResults.progress as number);

        const { result: updateMedia, error: updateError } = await api.fetch(Routes.UpdateMedia, {
            status: status as MediaListStatus,
            score: score,
            progress: progress,
            id: Number(name),
            token: inDatabase.token,
        });

        if (updateError || updateMedia === null) {
            logger.error("Error while fetching data MUTATION from the API.", "Anilist", { updateError });

            return interaction.reply({
                content: "An error occurred while fetching data from the API",
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(result.title.romaji)
            .setURL(result.siteUrl)
            .setImage(result.banner)
            .setThumbnail(result.cover)
            .setDescription(result.description)
            .setFooter({
                text: `${result.footer} •\nIf the score doesn't update, use /refresh`,
            })
            .setColor(0x2f3136);

        return interaction.reply({ embeds: [embed] });
    },
};
