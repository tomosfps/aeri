import { ContainerBuilder, MediaGalleryItemBuilder } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "@discordjs/core";
import { Logger } from "logger";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getUserAvatar, getUserGuildAvatar } from "../../utility/formatUtils.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("View a users or bots avatar")
        .addExample("/avatar target:@tomosfps")
        .setCategory("Utility")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addUserOption((option) =>
            option.setName("target").setDescription("The user/bot to view their avatar").setRequired(true),
        ),
    async execute(interaction): Promise<void> {
        const targetUserId = getCommandOption("target", ApplicationCommandOptionType.User, interaction.options);
        if (!targetUserId) {
            await interaction.reply({
                content: "Please provide a valid user to view their avatar.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const user = await interaction.api.users.get(targetUserId).catch(() => null);
        if (!user) {
            await interaction.reply({
                content: "Could not fetch user information. The user may not exist.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        let guildAvatar: string | undefined = undefined;
        if (interaction.guildID) {
            try {
                const memberData = await interaction.guilds.getMember(interaction.guildID, targetUserId);
                if (memberData?.avatar) {
                    guildAvatar = getUserGuildAvatar(interaction.guildID, memberData.user.id, memberData.avatar);
                }
            } catch (error) {
                logger.error("Error occured", "Avatar", { error });
            }
        }

        const container = new ContainerBuilder()
            .setAccentColor(interaction.baseColour)
            .addMediaGalleryComponents((builder) =>
                builder.addItems(
                    new MediaGalleryItemBuilder()
                        .setDescription(`${user.username}'s Avatar`)
                        .setURL(getUserAvatar(user.id, user.avatar)),
                    ...(guildAvatar
                        ? [
                              new MediaGalleryItemBuilder()
                                  .setDescription(`${user.username}'s Guild Avatar`)
                                  .setURL(guildAvatar),
                          ]
                        : []),
                ),
            );

        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },
};
