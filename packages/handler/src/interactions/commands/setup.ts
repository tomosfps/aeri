import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { env, getRedis } from "core";
import { fetchUser } from "database";
import { ButtonStyle } from "discord-api-types/v10";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

const redis = await getRedis();

export const interaction: ChatInputCommand = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Connect your anilist account with the bot")
        .addExample("/setup username:anilist_username"),
    async execute(interaction): Promise<void> {
        const isInDatabase = await fetchUser(interaction.user_id);

        if (!isInDatabase) {
            if (interaction.guild_id === undefined) {
                return interaction.reply({
                    content: "This command can only be used in a server.",
                    ephemeral: true,
                });
            }

            const embed = new EmbedBuilder()
                .setDescription("Click the button below to link your Anilist account with the bot.")
                .setColor(0x2f3136);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("Link Account")
                    .setStyle(ButtonStyle.Link)
                    .setURL(
                        `https://anilist.co/api/v2/oauth/authorize?client_id=${env.ANILIST_CLIENT_ID}&response_type=code&state=${interaction.user_id}_${interaction.guild_id}`,
                    ),
            );

            await redis.set(`anilist_setup_interaction:${interaction.user_id}`, interaction.token, "EX", 60 * 15);

            return await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }

        return interaction.reply({
            content:
                "You already have an anilist account linked to your discord account. Use /unlink to unlink your account.",
            ephemeral: true,
        });
    },
};
