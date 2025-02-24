import { dbCreateAnilistUser, dbFetchAnilistUser } from "database";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("Link your anilist account with the bot")
        .addExample("/link username:anilist_username")
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
            if (interaction.guild_id === undefined) {
                return interaction.reply({
                    content: "This command can only be used in a server.",
                    ephemeral: true,
                });
            }

            const { result: user, error } = await api.fetch(Routes.User, { username });

            if (error) {
                logger.error("Error while fetching data from the API.", "Anilist", { error });

                return interaction.reply({
                    content: "An error occurred while fetching your Anilist account.",
                    ephemeral: true,
                });
            }

            if (!user) {
                return interaction.reply({
                    content: "Anilist user not found.",
                    ephemeral: true,
                });
            }

            await dbCreateAnilistUser(interaction.user_id, user.id, user.name, interaction.guild_id);
            return interaction.reply({
                content: `Successfully linked ${user.name} to your discord account.`,
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
