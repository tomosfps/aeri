import type { APIUser, GatewayGuildMemberRemoveDispatchData } from "@discordjs/core";
import { fetchDiscordUser, fetchGuildUser, removeUser, updateGuild } from "database";
import { Logger } from "logger";

const logger = new Logger();

export async function onGuild(
    hasLeft: boolean,
    user: APIUser,
    member: GatewayGuildMemberRemoveDispatchData,
): Promise<void> {
    const inDatabase = await fetchDiscordUser(user.id);

    if (inDatabase) {
        logger.debugSingle(`Member ${user.username} is already in the database`, "Handler");
        const guildData = await fetchGuildUser(member.guild_id, user.id);

        if (!guildData) {
            logger.debugSingle(`Member ${user.username} is not within the guild database`, "Handler");
            return;
        }

        const checkGuild = guildData.users[0]?.discord_id.toString() === user.id;
        if (checkGuild) {
            logger.debugSingle(`Member ${user.username} is within the guild database`, "Handler");
            hasLeft ? await removeUser(user.id, member.guild_id) : await updateGuild(member.guild_id, user.id);
            logger.debugSingle(`Removed ${user.username} from the database`, "Handler");
        } else {
            logger.debugSingle(`Member ${user.username} is not within the guild database`, "Handler");
        }
    }
}
