import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { env, getRedis } from "core";
import { dbFetchDiscordUser } from "database";
import { ButtonStyle } from "discord-api-types/v10";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

const redis = await getRedis();

export const interaction: ChatInputCommand = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("oauth")
        .setDescription("Setup OAuth with the Discord bot!")
        .addExample("/oauth"),
    async execute(interaction): Promise<void> {
        const isInDatabase = await dbFetchDiscordUser(interaction.user_id);

        if (interaction.guild_id === undefined) {
            return interaction.reply({
                content: "This command can only be used in a server.",
                ephemeral: true,
            });
        }

        if (isInDatabase === null) {
            return interaction.reply({
                content: "Please use `/link` to link your Discord account with the bot first.",
                ephemeral: true,
            });
        }

        if (isInDatabase.anilist?.token !== null) {
            return interaction.reply({
                content:
                    "You already have OAuth setup with the bot. If you want to unlink your account, use the `/unlink` command.",
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setDescription("Click the button below to link your Anilist account with the bot.")
            .setColor(0x2f3136);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Link Anilist Account")
                .setStyle(ButtonStyle.Link)
                .setURL(
                    `https://anilist.co/api/v2/oauth/authorize?client_id=${env.ANILIST_CLIENT_ID}&response_type=code&state=${interaction.user_id}_${interaction.guild_id}`,
                ),
        );

        await redis.set(`anilist_setup_interaction:${interaction.user_id}`, interaction.token, "EX", 60 * 15);
        return await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },
};
