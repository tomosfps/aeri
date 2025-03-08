import { EmbedBuilder } from "@discordjs/builders";
import { getRedis } from "core";
import { dbFetchAnilistUser, dbFetchGuildUsers } from "database";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationCommandType, ApplicationIntegrationType } from "discord-api-types/v10";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { ContextMenuCommandBuilder } from "../../classes/ContextMenuCommandBuilder.js";
import type { UserContextCommand } from "../../services/commands.js";
import { createPage } from "../../utility/paginationUtilts.js";

const logger = new Logger();
const redis = await getRedis();

export const interaction: UserContextCommand = {
    data: new ContextMenuCommandBuilder()
        .setName("user affinity")
        .setType(ApplicationCommandType.User)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setContexts(InteractionContextType.Guild),
    pageLimit: 1,
    async execute(interaction) {
        if (!interaction.guild_id) {
            return interaction.reply({
                content: "This command can only be used in a server.",
                ephemeral: true,
            });
        }

        logger.debug("Fetching user data", "User", { user: interaction.target_id });
        const user = await dbFetchAnilistUser(interaction.target.id);

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

        // biome-ignore lint/style/noNonNullAssertion: filtered above
        const maxPages = Math.ceil(guildMembers.length / this.pageLimit!);
        const affinityKey = `user affinity:${interaction.user_id}:user-affinity`;

        await redis.hmset(affinityKey, {
            username: user.username,
            guildMembers: JSON.stringify(guildMembers),
            target_id: interaction.target_id,
            guild_id: interaction.guild_id,
        });
        await redis.expire(affinityKey, 900);

        await createPage(
            interaction,
            {
                userID: interaction.user_id,
                commandID: "user affinity",
                totalPages: maxPages,
            },
            async (page: number) => (this.page ? await this.page(page, interaction) : { embeds: [] }),
        );
    },

    async page(pageNumber, interaction) {
        const affinityKey = `user affinity:${interaction.user_id}:user-affinity`;
        const affinityData = await redis.hgetall(affinityKey);

        // biome-ignore lint/style/noNonNullAssertion: filtered above
        const guildMembers = JSON.parse(affinityData["guildMembers"]!);

        // biome-ignore lint/style/noNonNullAssertion: filtered above
        const startingIdx = (pageNumber - 1) * this.pageLimit!;
        // biome-ignore lint/style/noNonNullAssertion: filtered above
        const pageUsers = guildMembers.slice(startingIdx, startingIdx + this.pageLimit!);

        const { result: affinity, error } = await api.fetch(
            Routes.Affinity,
            {
                // biome-ignore lint/style/noNonNullAssertion: filtered above
                username: affinityData["username"]!,
                other_users: pageUsers,
            },
            // biome-ignore lint/style/noNonNullAssertion: filtered above
            { pageOptions: { page: pageNumber, limit: this.pageLimit! } },
        );

        if (error || !affinity) {
            logger.error("Error while fetching data from the API.", "Anilist", { error });

            const errorEmbed = new EmbedBuilder()
                .setTitle("Error")
                .setDescription(
                    "An error occurred while fetching data from the API\nPlease try again later. If the issue persists, contact the bot owner.",
                )
                .setColor(interaction.base_colour);

            return {
                embeds: [errorEmbed],
            };
        }

        const embed = new EmbedBuilder()
            .setTitle(`${affinity.comparedAgainst.name} affinity`)
            .setURL(affinity.comparedAgainst.siteUrl)
            .setThumbnail(affinity.comparedAgainst.avatar.large)
            .setDescription(affinity.description)
            .setColor(interaction.base_colour)
            .setFooter({
                text: `${affinity.footer}\nIf you believe the calculations are wrong, head over to GitHub and open an issue.`,
            });

        return { embeds: [embed] };
    },
};
