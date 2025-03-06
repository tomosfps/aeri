import type { Button } from "../../services/commands.js";
import { getUserAvatar, getUserGuildAvatar } from "../../utility/formatUtils.js";

type DescriptionType = "DEFAULT" | "GUILD";
type ButtonData = {
    targetUserId: string;
    type: DescriptionType;
};

export const interaction: Button<ButtonData> = {
    custom_id: "showAvatar",
    toggleable: true,
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid button data");
        }
        return { targetUserId: data[0], type: data[1] as DescriptionType };
    },
    async execute(interaction, data): Promise<void> {
        const embedData = interaction.embed_data;
        const guild_id = interaction.guild_id;

        if (!embedData || !guild_id || !embedData.image) {
            return;
        }

        const member = await interaction.api.guilds.getMember(guild_id, data.targetUserId);

        if (!member) {
            return;
        }

        switch (data.type) {
            case "DEFAULT":
                embedData.image.url = getUserAvatar(data.targetUserId, member.user.avatar);
                embedData.title = `${member.user.username}'s Avatar`;
                break;
            case "GUILD": {
                embedData.image.url = getUserGuildAvatar(guild_id, data.targetUserId, member.avatar);
                embedData.title = `${member.user.username}'s Guild Avatar`;
                break;
            }
        }

        await interaction.edit({
            embeds: [embedData],
        });
    },
};
