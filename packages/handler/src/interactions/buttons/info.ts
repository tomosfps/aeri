import { MessageFlags } from "@discordjs/core";
import type { Button } from "../../services/commands.js";

type DescriptionType = "INVITE" | "SUPPORT";
type ButtonData = {
    type: DescriptionType;
};

export const interaction: Button<ButtonData> = {
    data: { custom_id: "info" },
    parse(data) {
        if (!data[0]) {
            throw new Error("Invalid button data");
        }
        return { type: data[0] as DescriptionType };
    },
    async execute(interaction, data): Promise<void> {
        switch (data.type) {
            case "INVITE":
                return await interaction.reply({
                    content: "https://discord.com/oauth2/authorize?client_id=795916241193140244",
                    flags: MessageFlags.Ephemeral,
                });
            case "SUPPORT":
                return await interaction.reply({
                    content: "https://discord.com/invite/kKqsaKYUfz",
                    flags: MessageFlags.Ephemeral,
                });
        }
    },
};
