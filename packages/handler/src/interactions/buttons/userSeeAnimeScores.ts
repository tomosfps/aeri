import type { Button } from "../../services/commands.js";

type ButtonData = {
    anilistUsername: string;
    userId: string;
};

export const interaction: Button<ButtonData> = {
    custom_id: "userAnimeScores",
    toggleable: true,
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid button data");
        }
        return { anilistUsername: data[0], userId: data[1] };
    },
    async execute(interaction, data): Promise<void> {
        const anilistUsername = data.anilistUsername;

        await interaction.reply({
            content: `Testing User Anime Scores: ${anilistUsername}`,
            ephemeral: true,
        });
    },
};
