import { MessageFlags } from "@discordjs/core";
import { Logger } from "logger";
import type { Button } from "../../services/commands.js";

const logger = new Logger();

type DescriptionType = "INVITE" | "SUPPORT";
type ButtonData = {
    type: DescriptionType;
};

export const interaction: Button<ButtonData> = {
    data: { custom_id: "info", toggleable: true },
    parse(data) {
        if (!data[0]) {
            throw new Error("Invalid button data");
        }
        return { type: data[0] as DescriptionType };
    },
    async execute(interaction, data): Promise<void> {
        logger.debugSingle(`Executing info button with data: ${JSON.stringify(data)}`, "Button Interaction");

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
