import type { Button } from "../../services/commands.js";

type DescriptionType = "INVITE" | "SUPPORT";

type ButtonData = {
    type: DescriptionType;
};

export const interaction: Button<ButtonData> = {
    custom_id: "infoAdd",
    toggleable: false,
    timeout: 3600,
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
        }

        await interaction.reply({
            content: description,
            ephemeral: true,
        });
    },
};
