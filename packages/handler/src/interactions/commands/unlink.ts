import { dbDeleteAnilistUser, dbFetchDiscordUser } from "database";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("Unlink your anilist account from the bot")
        .addExample("/unlink"),
    async execute(interaction): Promise<void> {
        const isInDatabase = await dbFetchDiscordUser(interaction.user_id);

        if (isInDatabase === null) {
            return interaction.reply({
                content: "You don't have an anilist account linked to your discord account.",
                ephemeral: true,
            });
        }

        const deleteAccount = await dbDeleteAnilistUser(interaction.user_id);
        if (deleteAccount) {
            return interaction.reply({
                content: "Your anilist account has been unlinked.",
                ephemeral: true,
            });
        }

        return interaction.reply({
            content: "An error occurred while unlinking your account.",
            ephemeral: true,
        });
    },
};
