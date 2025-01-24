import { SlashCommandBuilder } from "@discordjs/builders";
import { deleteAnilistUser, fetchUser } from "database";
import type { Command } from "../../services/commands.js";

export const interaction: Command = {
    data: new SlashCommandBuilder().setName("unlink").setDescription("Unlink your anilist account!"),
    async execute(interaction): Promise<void> {
        const isInDatabase = await fetchUser(interaction.member_id);

        if (isInDatabase === null) {
            return interaction.reply({
                content: "You don't have an anilist account linked to your discord account.",
                ephemeral: true,
            });
        }

        const deleteAccount = await deleteAnilistUser(interaction.member_id);
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
