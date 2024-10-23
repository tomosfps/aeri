import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { ButtonStyle } from "@discordjs/core";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Logger } from "log";
import type { Command } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: Command = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("View someones avatar")
        .addUserOption((option) =>
            option.setName("target").setDescription("The user's avatar to view").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        const member = getCommandOption("target", ApplicationCommandOptionType.User, interaction.options);

        if (interaction.guild_id === undefined) {
            return;
        }

        if (member === null) {
            await interaction.reply({
                content: "Could not locate the member. Are they within the guild?",
                ephemeral: true,
            });
            return;
        }

        const getMember = await interaction.guilds.getMember(interaction.guild_id, member);
        const guildAvatar = (await interaction.guilds.getMember(interaction.guild_id, member)).avatar;

        const guildButton = new ButtonBuilder()
            .setCustomId("to_server_avatar")
            .setLabel("Guild Avatar")
            .setDisabled(guildAvatar === null || guildAvatar === undefined)
            .setStyle(ButtonStyle.Primary);

        const defaultButton = new ButtonBuilder()
            .setCustomId("to_default_avatar")
            .setLabel("Default Avatar")
            .setDisabled(guildAvatar === null || guildAvatar === undefined)
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(defaultButton, guildButton);

        const userAvatar =
            getMember.avatar === null || getMember.avatar === undefined
                ? `https://cdn.discordapp.com/embed/avatars/${(Number(member) >> 22) % 6}.png?size=1024`
                : `https://cdn.discordapp.com/avatars/${getMember.user?.id}/${getMember.user?.avatar}.png?size=1024`;

        logger.info(`Sending avatar for ${getMember.user?.username}`, "Avatar", { userAvatar });

        const embed = new EmbedBuilder().setTitle(`${getMember.user?.username}'s Avatar`).setImage(userAvatar);
        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
