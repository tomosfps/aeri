import type { Button } from "../../services/commands.js";

type DescriptionType = "DEFAULT" | "GUILD";

type ButtonData = {
    targetUserId: string;
    type: DescriptionType;
    userId: string;
};

export const interaction: Button<ButtonData> = {
    custom_id: "showAvatar",
    toggleable: true,
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1] || !data[2]) {
            throw new Error("Invalid button data");
        }
        return { targetUserId: data[0], type: data[1] as DescriptionType, userId: data[2] };
    },
    async execute(interaction, data): Promise<void> {
        const embedData = interaction.embed_data;
        const guild_id = interaction.interaction.guild_id;

        if (!embedData) {
            return;
        }
        if (!guild_id) {
            return;
        }

        const member = await interaction.guilds.getMember(guild_id, data.targetUserId);

        if (!member) {
            return;
        }

        let url = "";
        let title = "";

        switch (data.type) {
            case "DEFAULT":
                url = interaction.avatar_url;
                title = `${member.user?.username}'s Avatar`;
                break;
            case "GUILD": {
                url = interaction.guild_url(guild_id, data.targetUserId, member.user?.avatar || "");
                title = `${member.user?.username}'s Guild Avatar`;
                break;
            }
        }

        embedData.title = title;
        embedData.image = {
            url: url,
        };

        await interaction.edit({
            embeds: [embedData],
        });
    },
};
