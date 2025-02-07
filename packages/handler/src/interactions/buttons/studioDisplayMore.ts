import type { Button } from "../../services/commands.js";

type ButtonData = {
    studioName: string;
    userId: string;
};

export const interaction: Button<ButtonData> = {
    custom_id: "studioDisplayMore",
    toggable: true,
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid button data");
        }
        return { studioName: data[0], userId: data[1] };
    },
    async execute(interaction, data): Promise<void> {
        const studioName = data.studioName;

        await interaction.reply({
            content: `Testing Studio Show More: ${studioName}`,
            ephemeral: true,
        });
    },
};
