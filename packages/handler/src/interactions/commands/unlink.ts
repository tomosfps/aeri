import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
    SeparatorSpacingSize,
} from "@discordjs/core";
import { deleteAnilistUser, fetchAnilistUser } from "database";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("Unlink or logout from your anilist account.")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addExample("/unlink")
        .setCategory("Anime/Manga")
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const isInDatabase = await fetchAnilistUser(interaction.userID);

        if (isInDatabase === null) {
            return interaction.reply({
                content: `You do not have an anilist account linked. Use ${await getCommandAsMention("link")} to link your account.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        const deleteAccount = await deleteAnilistUser(interaction.userID);

        if (deleteAccount) {
            const container = interaction.getContainer();

            container
                .setComponent(
                    "text",
                    "## Account Unlinked Successfully\nYour AniList account has been successfully unlinked from this Discord account.",
                )
                .setComponent("separator", [{ divider: true, spacing: SeparatorSpacingSize.Large }])
                .setComponent(
                    "footer",
                    `-# You can relink your account anytime using ${await getCommandAsMention("link")}`,
                );

            return interaction.replyContainer(hidden);
        }

        return interaction.reply({
            content: "An error occurred while unlinking your account. Please try again later.",
            flags: MessageFlags.Ephemeral,
        });
    },
};
