import type { Button } from "../../services/commands.js";

type DescriptionType = "INFORMATION" | "ANIME" | "MANGA";

type ButtonData = {
    anilistUsername: string;
    type: DescriptionType;
    userId: string;
};

export const interaction: Button<ButtonData> = {
    custom_id: "userShow",
    toggleable: true,
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid button data");
        }
        return { anilistUsername: data[0], type: data[1] as DescriptionType, userId: data[2] };
    },
    async execute(interaction, data): Promise<void> {
        const anilistUsername = data.anilistUsername;

        let description = "";
        switch (data.type) {
            case "INFORMATION":
                description = "Information";
                break;
            case "ANIME":
                description = "Anime";
                break;
            case "MANGA":
                description = "Manga";
                break;
        }

        await interaction.reply({
            content: `Testing User ${description} Scores: ${anilistUsername}`,
            ephemeral: true,
        });
    },
};
