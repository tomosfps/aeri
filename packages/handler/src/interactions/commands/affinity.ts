import { EmbedBuilder } from "@discordjs/builders";
import { fetchAllUsers, fetchAnilistUser } from "database";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { type Command, SlashCommandBuilder } from "../../classes/slashCommandBuilder.js";

const logger = new Logger();

export const interaction: Command = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("affinity")
        .setDescription("Compare your affinity with server members!")
        .addExample("/affinity")
        .addExample("Must have a user account linked to Anilist"),
    async execute(interaction): Promise<void> {
        const guild_id = BigInt(interaction.guild_id || 0);
        let username = "";

        try {
            username = (await fetchAnilistUser(interaction.member_id)).username;
        } catch (error: any) {
            logger.error(`Error fetching user from database: ${error}`, "User");
            return interaction.reply({ content: "Please setup your account with /setup!", ephemeral: true });
        }

        const guildMembers = await fetchAllUsers(guild_id).then((users: any) => {
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
