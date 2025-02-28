import { dbDeleteAnilistUser, dbFetchAnilistUser } from "database";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("Unlink your anilist account from the bot")
        .addExample("/unlink")
        .addCategory("Anime/Manga"),
    async execute(interaction): Promise<void> {
        const isInDatabase = await dbFetchAnilistUser(interaction.user_id);

        if (isInDatabase === null) {
            return interaction.reply({
                content: "You do not have an anilist account linked. Use `/link` to link your account.",
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
