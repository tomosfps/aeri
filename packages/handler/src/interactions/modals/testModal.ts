import { bold } from "@discordjs/builders";
import type { Modal } from "../../services/commands.js";

export const interaction: Modal = {
    custom_id: "test-modal",
    async execute(interaction): Promise<void> {
        await interaction.reply({
            content: bold("You done did it"),
            ephemeral: true,
        });
    },
};
