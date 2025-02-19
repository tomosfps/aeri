import { dbFetchDiscordUser, dbFetchGuildUser, dbRemoveFromGuild, dbUpdateGuild } from "database";
import type { APIUser, GatewayGuildMemberRemoveDispatchData } from "discord-api-types/v10";
import { Logger } from "logger";

const logger = new Logger();

export async function onGuild(hasLeft: boolean, user: APIUser, member: GatewayGuildMemberRemoveDispatchData): Promise<void> {
    const inDatabase = await dbFetchDiscordUser(user.id);

    if (inDatabase) {
        logger.debugSingle(`Member ${user.username} is already in the database`, "Handler");
        const guildData = await dbFetchGuildUser(member.guild_id, user.id);

        if (!guildData) {
            logger.debugSingle(`Member ${user.username} is not within the guild database`, "Handler");
            return;
        }

        const checkGuild = guildData.discord_id.toString() === user.id;
        if (checkGuild) {
            logger.debugSingle(`Member ${user.username} is within the guild database`, "Handler");
            hasLeft ? await dbRemoveFromGuild(user.id, member.guild_id) : await dbUpdateGuild(member.guild_id, user.id);
            logger.debugSingle(`Removed ${user.username} from the database`, "Handler");
        } else {
            logger.debugSingle(`Member ${user.username} is not within the guild database`, "Handler");
        }
    }
}
