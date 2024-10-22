import type { Button } from "../../services/commands.js";

export const interaction: Button = {
    custom_id: "dislike_post",
    async execute(interaction): Promise<void> {
        await interaction.reply({
            content: "Button!",
            ephemeral: true,
        });
    },
};
