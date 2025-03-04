import { EmbedBuilder } from "@discordjs/builders";
import { dbFetchAnilistUser } from "database";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationCommandOptionType, ApplicationIntegrationType } from "discord-api-types/v10";
import { Logger } from "logger";
import { MediaListStatus, MediaType, Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("update-manga")
        .setDescription("Update an manga entry on your Anilist account.")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild)
        .addExample("/update-manga name:Berserk score:10 status:Current progress:153 volumes:40")
        .addExample("/update-manga name:One Piece score:10")
        .addExample("/update-manga name:One Piece status:Paused")
        .addExample("/update-manga name:One Piece progress:1140")
        .addExample("/update-manga name:One Piece volumes:100")
        .addExample(
            "Any choices that are left out, will be automatically grabbed from the user and set to the current value.",
        )
        .setCategory("OAuth")
        .addStringOption((option) =>
            option
                .setName("name")
                .setAutocomplete(true)
                .setDescription("The name of the manga you want to update.")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("status")
                .setDescription("The status of the manga.")
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
            option.setName("score").setDescription("The score you want to give the manga.").setRequired(false),
        )
        .addNumberOption((option) =>
            option.setName("progress").setDescription("The progress you have made in the manga.").setRequired(false),
        )
        .addNumberOption((option) =>
            option.setName("volumes").setDescription("The amount of volumes read for the manga.").setRequired(false),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the input or not").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        if (interaction.guild_id === undefined) {
            return interaction.reply({
                content: "This command can only be used in a server.",
                ephemeral: true,
            });
        }

        const name = getCommandOption("name", ApplicationCommandOptionType.String, interaction.options) as string;
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const status = getCommandOption("status", ApplicationCommandOptionType.String, interaction.options);
        const score = getCommandOption("score", ApplicationCommandOptionType.Number, interaction.options);
        const progress = getCommandOption("progress", ApplicationCommandOptionType.Number, interaction.options);
        const volumes = getCommandOption("volume", ApplicationCommandOptionType.Number, interaction.options);
        const inDatabase = await dbFetchAnilistUser(interaction.user_id);

        if (!inDatabase || inDatabase.token === null) {
            return interaction.reply({
                content: "You need to setup OAuth first. Use `/login` to do so.",
                ephemeral: true,
            });
        }

        const { result: updateMedia, error: updateError } = await api.fetch(Routes.UpdateMedia, {
            status: status as MediaListStatus,
            score,
            progress,
            id: Number(name),
            token: inDatabase.token,
            volumes,
        });

        if (updateError || updateMedia === null) {
            logger.error("Error while fetching data MUTATION from the API.", "Anilist", { updateError });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                ephemeral: true,
            });
        }

        const { result, error } = await api.fetch(
            Routes.Media,
            { media_type: MediaType.Manga, media_id: Number(name) },
            { guild_id: interaction.guild_id, user_id: interaction.user_id, isGroupDM: interaction.isGroupDM },
        );

        if (error || result === null) {
            logger.error("Error while fetching data MEDIA from the API.", "Anilist", { error });

            return interaction.reply({
                content:
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(result.title.romaji)
            .setURL(result.siteUrl)
            .setImage(result.banner)
            .setThumbnail(result.cover)
            .setColor(interaction.base_colour)
            .setDescription(result.description)
            .setFooter({
                text: `${result.footer}\n• If the score doesn't update, use /refresh`,
            });

        return interaction.reply({ embeds: [embed], ephemeral: hidden });
    },
};
