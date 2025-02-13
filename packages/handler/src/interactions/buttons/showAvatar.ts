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
                url =
                    member.user?.avatar !== null
                        ? `https://cdn.discordapp.com/avatars/${member.user?.id}/${member.user?.avatar}.png?size=1024`
                        : `https://cdn.discordapp.com/embed/avatars/${(Number(member.user.id) >> 22) % 6}.png?size=1024`;
                title = `${member.user?.username}'s Avatar`;
                break;
            case "GUILD": {
                const guildMemberAvatar = interaction.guild_id
                    ? (await interaction.guilds.getMember(interaction.guild_id, data.targetUserId)).avatar
                    : null;
                url = `https://cdn.discordapp.com/guilds/${interaction.guild_id}/users/${data.targetUserId}/avatars/${guildMemberAvatar}.png?size=1024`;
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
