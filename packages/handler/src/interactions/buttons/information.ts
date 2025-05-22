import type { Button } from "../../services/commands.js";

type DescriptionType = "INVITE" | "SUPPORT";
type ButtonData = {
    type: DescriptionType;
};

// TODO: Revert this once I use the container in a different command
// TODO: ComponentsV2 for the Anime/Manga
// TODO: Add hidden to all commands

export const interaction: Button<ButtonData> = {
    custom_id: "information",
    toggleable: false,
    timeout: 900,
    parse(data) {
        if (!data[0]) {
            throw new Error("Invalid button data");
        }
        return { type: data[0] as DescriptionType };
    },
    async execute(interaction, data): Promise<void> {
        const manager = interaction.getContainer().setAccentColor(0x5c6bc0);

        let description = "";
        switch (data.type) {
            case "INVITE":
                description = "https://discord.com/oauth2/authorize?client_id=795916241193140244";
                manager.updateSection("text", `Click the link below to invite Aeri to your server.\n\n${description}`);
                break;
            case "SUPPORT":
                description = "https://discord.com/invite/kKqsaKYUfz";
                manager.updateSection("text", `Click the link below to join the support server.\n\n${description}`);
                break;
        }

        await interaction.updateContainer();
    },
};
