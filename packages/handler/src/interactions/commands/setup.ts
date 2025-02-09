import { createAnilistUser, fetchUser } from "database";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: Command = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Connect your anilist account with the bot")
        .addExample("/setup username:anilist_username")
        .addStringOption((option) =>
            option.setName("username").setDescription("Your Anilist username").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        const username = getCommandOption("username", ApplicationCommandOptionType.String, interaction.options) || "";
        const isInDatabase = await fetchUser(interaction.member_id);

        if (!isInDatabase) {
            const user = await api.fetch(Routes.User, { username }).catch((error: any) => {
                logger.error("Error while fetching data from the API.", "Anilist", error);
                return null;
            });

            if (user === null) {
                return interaction.reply({ content: "An error occurred while fetching data from the API." });
            }

            if (interaction.guild_id === undefined) {
                return interaction.reply({
                    content: "This command can only be used in a server.",
                    ephemeral: true,
                });
            }

            await createAnilistUser(
                interaction.member_id,
                interaction.member_name,
                user.id,
                user.name,
                BigInt(interaction.guild_id),
            );

            return interaction.reply({
                content: `Successfully linked ${user.name} to your discord account.`,
                ephemeral: true,
            });
        }
        return interaction.reply({
            content:
                "You already have an anilist account linked to your discord account. Use /unlink to unlink your account.",
            ephemeral: true,
        });
    },
};
