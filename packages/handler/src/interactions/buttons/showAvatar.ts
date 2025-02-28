import { Logger } from "logger";
import type { Button } from "../../services/commands.js";

const logger = new Logger();

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
                url = interaction.guild_url(guild_id, member.user.id, member.avatar || "");
                title = `${member.user?.username}'s Guild Avatar`;
                break;
            }
        }

        embedData.title = title;
        embedData.image = {
            url: url,
        };

        logger.debug("Showing avatar", "ShowAvatar", {
            hash: member.user?.avatar,
            targetUserId: data.targetUserId,
            type: data.type,
            url: url,
        });

        await interaction.edit({
            embeds: [embedData],
        });
    },
};
