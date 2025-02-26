import { EmbedBuilder } from "@discordjs/builders";
import { dbFetchAnilistUser, dbFetchGuildUsers } from "database";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";

const logger = new Logger();

export const interaction: ChatInputCommand = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("affinity")
        .setDescription("Compare your affinity with server members!")
        .addExample("/affinity")
        .addExample("Must have a user account linked to Anilist")
        .addCategory("Anime/Manga"),
    async execute(interaction): Promise<void> {
        if (!interaction.guild_id) {
            return interaction.reply({
                content: "This command can only be used in a server.",
                ephemeral: true,
            });
        }

        logger.debug("Fetching user data", "User", { user: interaction.user_id });
        const user = await dbFetchAnilistUser(interaction.user_id);

        if (!user) {
            return interaction.reply({
                content: "This user hasn't set up their anilist account yet!",
                ephemeral: true,
            });
        }

        const guildMembers = (await dbFetchGuildUsers(interaction.guild_id))
            .filter((user) => user.anilist !== null)
            // biome-ignore lint/style/noNonNullAssertion: filtered above
            .map((user) => user.anilist!.username);

        if (guildMembers.includes(user.username)) {
            guildMembers.splice(guildMembers.indexOf(user.username), 1);
        }

        if (guildMembers.length === 0) {
            return interaction.reply({
                content: "There must be at least 1 other member in the server to use this command!",
                ephemeral: true,
            });
        }

        logger.debug(`Fetching affinity for ${user.username} against ${guildMembers.length} users`, "Anilist", {
            username: user.username,
            guildMembers,
        });

        const { result: affinity, error } = await api.fetch(Routes.Affinity, {
            username: user.username,
            other_users: guildMembers,
        });

        if (error || affinity === null) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            return interaction.reply({
                content: "An error occurred while fetching data from the API",
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${affinity.comparedAgainst.name} affinity`)
            .setURL(affinity.comparedAgainst.siteUrl)
            .setThumbnail(affinity.comparedAgainst.avatar.large)
            .setDescription(affinity.description)
            .setColor(interaction.base_colour)
            .setFooter({ text: affinity.footer });
        interaction.base_colour;

        await interaction.reply({ embeds: [embed] });
    },
};
