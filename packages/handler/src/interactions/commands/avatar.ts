import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { ButtonStyle } from "@discordjs/core";
import { ApplicationCommandOptionType, ApplicationIntegrationType } from "discord-api-types/v10";
import { Logger } from "logger";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("View a users or bots avatar")
        .addExample("/avatar target:@tomosfps")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .addUserOption((option) =>
            option.setName("target").setDescription("The user/bot to view their avatar").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        const targetUserId = getCommandOption("target", ApplicationCommandOptionType.User, interaction.options);

        if (!targetUserId) {
            await interaction.reply({
                content: "Please provide a valid user to view their avatar.",
                ephemeral: true,
            });
            return;
        }

        const user = await interaction.api.users.get(targetUserId).catch(() => null);

        if (!user) {
            await interaction.reply({
                content: "Could not fetch user information. The user may not exist.",
                ephemeral: true,
            });
            return;
        }

        let guildAvatar: string | undefined = undefined;
        const userAvatar = user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`
            : `https://cdn.discordapp.com/embed/avatars/${(Number(user.id) >> 22) % 6}.png?size=1024`;

        if (interaction.guild_id) {
            try {
                const memberData = await interaction.guilds.getMember(interaction.guild_id, targetUserId);
                if (memberData?.avatar) {
                    guildAvatar = `https://cdn.discordapp.com/guilds/${interaction.guild_id}/users/${targetUserId}/avatars/${memberData.avatar}.png?size=1024`;
                }
            } catch (error) {
                logger.error("Error occured", "Avatar", { error });
            }
        }

        const guildButton = new ButtonBuilder()
            .setCustomId(`showAvatar:${targetUserId}:GUILD:${interaction.user.id}`)
            .setLabel("Guild Avatar")
            .setDisabled(guildAvatar === undefined)
            .setStyle(ButtonStyle.Primary);

        const defaultButton = new ButtonBuilder()
            .setCustomId(`showAvatar:${targetUserId}:DEFAULT:${interaction.user.id}`)
            .setLabel("Default Avatar")
            .setDisabled(guildAvatar === undefined)
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(defaultButton, guildButton);

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setImage(userAvatar)
            .setColor(interaction.base_colour);

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
