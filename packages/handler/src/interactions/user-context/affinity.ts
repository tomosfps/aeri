import { ContextMenuCommandBuilder, EmbedBuilder } from "@discordjs/builders";
import { dbFetchAnilistUser, dbFetchGuildUsers } from "database";
import { ApplicationCommandType } from "discord-api-types/v10";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import type { UserContextCommand } from "../../services/commands.js";

const logger = new Logger();

export const interaction: UserContextCommand = {
    data: new ContextMenuCommandBuilder().setName("affinity").setType(ApplicationCommandType.User),
    async execute(interaction) {
        const user = interaction.target_user;
        logger.debug("Fetching user data", "User", { user });

        const guild_id = interaction.guild_id_bigint;
        let username = "";

        if (!user) {
            return interaction.reply({
                content: "This user is not in the server.",
                ephemeral: true,
            });
        }

        try {
            username = (await dbFetchAnilistUser(BigInt(user.id))).username;
        } catch (error: any) {
            logger.error(`Error fetching user from database: ${error}`, "User");
            return interaction.followUp({
                content: `${user.username} hasn't set up their anilist account yet!`,
                ephemeral: true,
            });
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
