import type { Button } from "../../services/commands.js";

export const interaction: Button = {
    custom_id: "to_default_avatar",
    async execute(interaction): Promise<void> {
        const embedData = interaction.embed_data;
        const member = interaction.member?.user;

        if (!embedData) {
            return;
        }

        if (!member) {
            return;
        }

        if (!member.avatar) {
            embedData.image = {
                url: `https://cdn.discordapp.com/avatars/${(Number(member.id) >> 22) % 6}.png?size=1024`,
            };
        } else {
            embedData.image = {
                url: `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=1024`,
            };
        }

        embedData.title = `${member.username}'s Avatar`;
    
        await interaction.edit({
            embeds: [embedData],
        });
    },
};
