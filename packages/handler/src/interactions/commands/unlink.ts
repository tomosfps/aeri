import { dbDeleteAnilistUser, dbFetchAnilistUser } from "database";
import { ApplicationIntegrationType } from "discord-api-types/v10";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("Unlink your anilist account from the bot")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .addExample("/unlink")
        .setCategory("Anime/Manga"),
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
