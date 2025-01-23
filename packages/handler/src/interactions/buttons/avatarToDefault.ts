import type { Button } from "../../services/commands.js";

type ButtonData = {
    userId: string;
};

export const interaction: Button<ButtonData> = {
    custom_id: "default",
    parse(data) {
        if (!data[0]) {
            throw new Error("Invalid button data");
        }

        return { userId: data[0] };
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

        const member = await interaction.guilds.getMember(guild_id, data.userId);
        if (!member) {
            return;
        }

        const userAvatar =
            member.user?.avatar !== null
                ? `https://cdn.discordapp.com/avatars/${member.user?.id}/${member.user?.avatar}.png?size=1024`
                : `https://cdn.discordapp.com/embed/avatars/${(Number(member.user.id) >> 22) % 6}.png?size=1024`;

        embedData.title = `${member.user?.username}'s Avatar`;
        embedData.image = {
            url: userAvatar,
        };

        await interaction.edit({
            embeds: [embedData],
        });
    },
};
