import { SectionBuilder, ThumbnailBuilder } from "@discordjs/builders";
import { ApplicationCommandOptionType, ApplicationIntegrationType, InteractionContextType } from "@discordjs/core";
import { createAnilistUser, fetchAnilistUser } from "database";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../builders/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("Link your anilist account with the bot")
        .addExample("/link username:anilist_username")
        .setCategory("Anime/Manga")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option.setName("username").setDescription("Your Anilist username").setRequired(true),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const username = getCommandOption(
            "username",
            ApplicationCommandOptionType.String,
            interaction.options,
        ) as string;
        const isInDatabase = await fetchAnilistUser(interaction.userID);
        const container = interaction.getContainer();

        if (!isInDatabase) {
            const { result: user, error } = await api.fetch(Routes.User, { username });

            if (error || !user) {
                logger.error("Error while fetching data from the API.", "Anilist", { error });
                container.updateComponent(
                    "error",
                    "An error occurred while fetching your Anilist account.\nPlease try again later. If the issue persists, contact the bot owner.",
                );
                return interaction.replyContainer(true);
            }

            await createAnilistUser(interaction.userID, user.id, user.name, interaction.guildID);

            if (user.avatar) {
                const section = new SectionBuilder()
                    .addTextDisplayComponents((builder) =>
                        builder.setContent(
                            `# [${user.name}](${user.siteUrl})\n${user.description || "No description available."}`,
                        ),
                    )
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(user.avatar));

                container.setComponent("section", [section]);
            } else {
                container.setComponent(
                    "text",
                    `# [${user.name}](${user.siteUrl})\n${user.description || "No description available."}`,
                );
            }

            container.setComponent(
                "footer",
                `-# Account linked!\n-# You can unlink your account anytime using ${await getCommandAsMention("unlink")}`,
            );

            return interaction.replyContainer(hidden);
        }

        container.updateComponent(
            "warning",
            "You already have an anilist account linked to your discord account. Use `/unlink` to unlink your account.",
        );
        return interaction.replyContainer(true);
    },
};
