import { dbFetchDiscordUser, dbFetchGuildUser, dbRemoveFromGuild, dbUpdateGuild } from "database";
import type { APIUser } from "discord-api-types/v10";
import { Logger } from "logger";

const logger = new Logger();

export async function onGuild(hasLeft: boolean, user: APIUser, member: any): Promise<void> {
    const memberId = BigInt(user.id);
    const inDatabase = await dbFetchDiscordUser(memberId);

    if (inDatabase) {
        logger.debugSingle(`Member ${user.username} is already in the database`, "Handler");
        const guildId = BigInt(member.guild_id);
        const guildData = await dbFetchGuildUser(guildId, memberId);

        if (!guildData) {
            logger.debugSingle(`Member ${user.username} is not within the guild database`, "Handler");
            return;
        }

        const checkGuild = guildData.discord_id === memberId;
        if (checkGuild) {
            logger.debugSingle(`Member ${user.username} is within the guild database`, "Handler");
            hasLeft ? await dbRemoveFromGuild(memberId, guildId) : await dbUpdateGuild(guildId, memberId);
            logger.debugSingle(`Removed ${user.username} from the database`, "Handler");
        } else {
            logger.debugSingle(`Member ${user.username} is not within the guild database`, "Handler");
        }
    }
}
