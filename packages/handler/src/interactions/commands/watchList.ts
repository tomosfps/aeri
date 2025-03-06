import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "@discordjs/builders";
import { dbFetchAnilistUser } from "database";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationCommandOptionType, ApplicationIntegrationType } from "discord-api-types/v10";
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
            option.setName("hidden").setDescription("Hide the input or not").setRequired(false),
        ),
    async execute(interaction): Promise<void> {
        const hidden = getCommandOption("hidden", ApplicationCommandOptionType.Boolean, interaction.options) || false;
        const type = getCommandOption("media", ApplicationCommandOptionType.String, interaction.options) as MediaType;
        let username = getCommandOption("username", ApplicationCommandOptionType.String, interaction.options);

        if (username === null) {
            logger.debug("Attempting fetching user from database", "User");

            const dbUser = await dbFetchAnilistUser(interaction.user_id);

            if (!dbUser) {
                return interaction.reply({
                    content: `Please setup your account with ${await getCommandAsMention("link")} or parse a username with the command.`,
                    ephemeral: true,
                });
            }

            username = dbUser.username;
        }

        if (!username) {
            return interaction.reply({
                content: `Please provide a username, or setup your account with ${await getCommandAsMention("link")}`,
                ephemeral: true,
            });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId(`status_selection:${username}:${type}:${interaction.user_id}`)
            .setPlaceholder("Choose A Media...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                Object.entries(MediaListStatus)
                    .slice(0, -1)
                    .map(([key, value]) => new StringSelectMenuOptionBuilder().setLabel(key).setValue(value)),
            );

        const row = new ActionRowBuilder().addComponents(select);
        await interaction.reply({ components: [row], ephemeral: hidden });
    },
};
