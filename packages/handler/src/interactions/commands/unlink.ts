import { dbDeleteAnilistUser, dbFetchAnilistUser } from "database";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationIntegrationType } from "discord-api-types/v10";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("Unlink or logout from your anilist account.")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addExample("/unlink")
        .setCategory("Anime/Manga"),
    async execute(interaction): Promise<void> {
        const isInDatabase = await dbFetchAnilistUser(interaction.user_id);

        if (isInDatabase === null) {
            return interaction.reply({
                content: `You do not have an anilist account linked. Use ${await getCommandAsMention("link")} to link your account.`,
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
