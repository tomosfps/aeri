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
        .addExample("Must have a user account linked to Anilist"),
    async execute(interaction): Promise<void> {
        const guild_id = interaction.guild_id_bigint;
        let username = "";

        try {
            username = (await dbFetchAnilistUser(interaction.user_id)).username;
        } catch (error: any) {
            logger.error(`Error fetching user from database: ${error}`, "User");
            return interaction.reply({ content: "Please setup your account with /setup!", ephemeral: true });
        }

        const guildMembers = await dbFetchGuildUsers(guild_id).then((users: any) => {
            return users.map((user: { anilist: any }) => user.anilist.username);
        });

        if (guildMembers.includes(username)) {
            guildMembers.splice(guildMembers.indexOf(username), 1);
        }

        if (guildMembers.length === 0) {
            return interaction.reply({
                content: "There must be at least 1 other member in the server to use this command!",
                ephemeral: true,
            });
        }

        logger.debug(`Fetching affinity for ${username} against ${guildMembers.length} users`, "Anilist", {
            username,
            guildMembers,
        });

        const { result: affinity, error } = await api.fetch(Routes.Affinity, {
            username: username,
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
            .setTitle(`${affinity.comparedAgainst.user.name} affinity`)
            .setURL(affinity.comparedAgainst.user.siteUrl)
            .setThumbnail(affinity.comparedAgainst.user.avatar.large)
            .setDescription(affinity.description)
            .setFooter({ text: affinity.footer })
            .setColor(0x2f3136);

        await interaction.reply({ embeds: [embed] });
    },
};
