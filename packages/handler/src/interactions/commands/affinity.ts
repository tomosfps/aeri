import { EmbedBuilder } from "@discordjs/builders";
import { getRedis } from "core";
import { dbFetchAnilistUser, dbFetchGuildUsers } from "database";
import { InteractionContextType } from "discord-api-types/v9";
import { ApplicationIntegrationType } from "discord-api-types/v10";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";
import { SlashCommandBuilder } from "../../classes/SlashCommandBuilder.js";
import type { ChatInputCommand } from "../../services/commands.js";
import { getCommandAsMention } from "../../utility/formatUtils.js";
import { createPage } from "../../utility/paginationUtilts.js";

const logger = new Logger();
const redis = await getRedis();

export const interaction: ChatInputCommand = {
    data: new SlashCommandBuilder()
        .setName("affinity")
        .setDescription("Compare your affinity with server members!")
        .setCategory("Anime/Manga")
        .setCooldown(5)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setContexts(InteractionContextType.Guild)
        .addExample("/affinity"),
    pageLimit: 20,
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
                content: `You must link your Anilist account to use this command!\nUse ${await getCommandAsMention("link")} to link your account.`,
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
                content: "There must be at least 1 other member in the server to use this command.",
                ephemeral: true,
            });
        }

        logger.debug(`Fetching affinity for ${user.username} against ${guildMembers.length} users`, "Anilist", {
            username: user.username,
            guildMembers,
        });

        // biome-ignore lint/style/noNonNullAssertion: filtered above
        const maxPages = Math.ceil(guildMembers.length / this.pageLimit!);
        const affinityKey = `affinity:${interaction.user_id}:${interaction.guild_id}`;

        await redis.hmset(affinityKey, {
            username: user.username,
            guildMembers: JSON.stringify(guildMembers),
        });
        await redis.expire(affinityKey, 900);

        await createPage(
            interaction,
            {
                userID: interaction.user_id,
                commandID: interaction.data.name,
                totalPages: maxPages,
            },
            async (page: number) => (this.page ? await this.page(page, interaction) : { embeds: [] }),
        );
    },

    async page(pageNumber, interaction) {
        const affinityKey = `affinity:${interaction.user_id}:${interaction.guild_id}`;
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
