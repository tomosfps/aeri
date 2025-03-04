import { EmbedBuilder, inlineCode } from "@discordjs/builders";
import { dbCreateAnilistUser, dbFetchAnilistUser } from "database";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationCommandOptionType, ApplicationIntegrationType } from "discord-api-types/v10";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
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
        ),
    async execute(interaction): Promise<void> {
        const username = getCommandOption(
            "username",
            ApplicationCommandOptionType.String,
            interaction.options,
        ) as string;
        const isInDatabase = await dbFetchAnilistUser(interaction.user_id);
        if (!isInDatabase) {
            const { result: user, error } = await api.fetch(Routes.User, { username });

            if (error) {
                logger.error("Error while fetching data from the API.", "Anilist", { error });

                return interaction.reply({
                    content:
                        "An error occurred while fetching your Anilist account.\nPlease try again later. If the issue persists, contact the bot owner.",
                    ephemeral: true,
                });
            }

            if (!user) {
                return interaction.reply({
                    content: `Could not find user with username ${inlineCode(username)}`,
                    ephemeral: true,
                });
            }

            await dbCreateAnilistUser(interaction.user_id, user.id, user.name, interaction.guild_id);

            const embed = new EmbedBuilder()
                .setTitle(`Anilist Account Linked | ${user.name}`)
                .setDescription(user.description)
                .setThumbnail(user.avatar)
                .setColor(interaction.base_colour);

            return interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }

        return interaction.reply({
            content:
                "You already have an anilist account linked to your discord account. Use `/unlink` to unlink your account.",
            ephemeral: true,
        });
    },
};
