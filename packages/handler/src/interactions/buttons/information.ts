import { MessageFlags } from "@discordjs/core";
import type { Button } from "../../services/commands.js";

type DescriptionType = "INVITE" | "SUPPORT" | "WEBSITE";

type ButtonData = {
    type: DescriptionType;
};

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
        let description = "";
        switch (data.type) {
            case "INVITE":
                description = "https://discord.com/oauth2/authorize?client_id=795916241193140244";
                break;
            case "SUPPORT":
                description = "https://discord.com/invite/kKqsaKYUfz";
                break;
            case "WEBSITE":
                description = "https://www.aeri.live";
                break;
        }

        await interaction.updateMessage({
            content: description,
            flags: MessageFlags.Ephemeral,
        });
    },
};
