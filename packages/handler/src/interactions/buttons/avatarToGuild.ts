import type { Button } from "../../services/commands.js";

type ButtonData = {
    targetUserId: string;
    userId: string;
};

export const interaction: Button<ButtonData> = {
    custom_id: "server",
    toggleable: true,
    timeout: 3600,
    parse(data) {
        if (!data[0] || !data[1]) {
            throw new Error("Invalid button data");
        }
        return { targetUserId: data[0], userId: data[1] };
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

        const guildMemberAvatar = (await interaction.guilds.getMember(interaction.guild_id, data.targetUserId)).avatar;
        embedData.image = {
            url: `https://cdn.discordapp.com/guilds/${interaction.guild_id}/users/${data.targetUserId}/avatars/${guildMemberAvatar}.png?size=1024`,
        };

        embedData.title = `${member.user?.username}'s Guild Avatar`;
        await interaction.edit({
            embeds: [embedData],
        });
    },
};
