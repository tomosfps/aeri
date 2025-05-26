import { EmbedBuilder, inlineCode } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "@discordjs/core";
import { createAnilistUser, fetchAnilistUser } from "database";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("Link your anilist account with the bot")
        .addExample("/link username:anilist_username")
        .setCategory("Anime/Manga")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option.setName("username").setDescription("Your Anilist username").setRequired(true),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const username = getCommandOption(
            "username",
            ApplicationCommandOptionType.String,
            interaction.options,
        ) as string;
        const isInDatabase = await fetchAnilistUser(interaction.userID);
        if (!isInDatabase) {
            const { result: user, error } = await api.fetch(Routes.User, { username });

            if (error) {
                logger.error("Error while fetching data from the API.", "Anilist", { error });

                return interaction.reply({
                    content:
                        "An error occurred while fetching your Anilist account.\nPlease try again later. If the issue persists, contact the bot owner.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            if (!user) {
                return interaction.reply({
                    content: `Could not find user with username ${inlineCode(username)}`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            await createAnilistUser(interaction.userID, user.id, user.name, interaction.guildID);

            const embed = new EmbedBuilder()
                .setTitle(`Anilist Account Linked | ${user.name}`)
                .setDescription(user.description)
                .setThumbnail(user.avatar)
                .setColor(interaction.baseColour);

            return interaction.reply({
                embeds: [embed],
                flags: hidden ? MessageFlags.Ephemeral : undefined,
            });
        }

        return interaction.reply({
            content:
                "You already have an anilist account linked to your discord account. Use `/unlink` to unlink your account.",
            flags: MessageFlags.Ephemeral,
        });
    },
};
