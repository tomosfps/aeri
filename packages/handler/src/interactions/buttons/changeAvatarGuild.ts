import type { Button } from "../../services/commands.js";

export const interaction: Button = {
    custom_id: "to_server_avatar",
    async execute(interaction): Promise<void> {
        const embedData = interaction.embed_data;
        const member = interaction.member?.user;

        if (!embedData) {
            return;
        }

        if (!member) {
            return;
        }

        if (interaction.guild_id === undefined) {
            return;
        }

        const guildMemberAvatar = (await interaction.guilds.getMember(interaction.guild_id, member.id)).avatar;

        embedData.image = {
            url: `https://cdn.discordapp.com/guilds/${interaction.guild_id}/users/${member.id}/avatars/${guildMemberAvatar}.png?size=1024`,
        };

        embedData.title = `${member.username}'s Guild Avatar`;

        await interaction.edit({
            embeds: [embedData],
        });
    },
};
