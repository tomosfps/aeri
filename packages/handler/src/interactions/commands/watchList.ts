import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "@discordjs/builders";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "@discordjs/core";
import { dbFetchAnilistUser } from "database";
import { Logger } from "logger";
import { MediaListStatus, MediaType } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";
import { getCommandOption } from "../../utility/interactionUtils.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("watch-list")
        .setDescription("View one of your lists on Anilist")
        .addExample("/watch-list media:Anime")
        .addExample("/watch-list media:Manga hidden:true")
        .addExample("/watch-list media:Anime username:JavaScript")
        .setCategory("Anime/Manga")
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .addStringOption((option) =>
            option
                .setName("media")
                .setDescription("The media to view")
                .setRequired(true)
                .addChoices({ name: "Anime", value: MediaType.Anime }, { name: "Manga", value: MediaType.Manga }),
        )
        .addStringOption((option) =>
            option.setName("username").setDescription("The user who's list you would like to view.").setRequired(false),
        )
        .addBooleanOption((option) =>
            option.setName("hidden").setDescription("Hide the interaction from appearing in chat").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const type = getCommandOption("media", ApplicationCommandOptionType.String, interaction.options) as MediaType;
        let username = getCommandOption("username", ApplicationCommandOptionType.String, interaction.options);

        if (username === null) {
            logger.debug("Attempting fetching user from database", "User");

            const dbUser = await dbFetchAnilistUser(interaction.userID);

            if (!dbUser) {
                return interaction.reply({
                    content: `Please setup your account with ${await getCommandAsMention("link")} or parse a username with the command.`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            username = dbUser.username;
        }

        if (!username) {
            return interaction.reply({
                content: `Please provide a username, or setup your account with ${await getCommandAsMention("link")}`,
                flags: MessageFlags.Ephemeral,
            });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId(`status:${username}:${type}:${interaction.userID}`)
            .setPlaceholder("Choose A Media...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                Object.entries(MediaListStatus)
                    .slice(0, -1)
                    .map(([key, value]) => new StringSelectMenuOptionBuilder().setLabel(key).setValue(value)),
            );

        const row = new ActionRowBuilder().addComponents(select);
        await interaction.reply({ components: [row], flags: hidden ? MessageFlags.Ephemeral : undefined });
    },
};
