import { fetchGuild, fetchUser, removeFromGuild, updateGuild } from "database";
import type { APIUser } from "discord-api-types/v10";
import { Logger } from "log";

const logger = new Logger();

export async function onGuild(hasLeft: boolean, user: APIUser, member: any): Promise<void> {
    const memberId = BigInt(user.id);
    const inDatabase = await fetchUser(memberId);

    if (inDatabase) {
        logger.debugSingle(`Member ${user.username} is already in the database`, "Handler");
        const guildId = BigInt(member.guild_id);

        const guildData = await fetchGuild(guildId, memberId);
        const checkGuild = guildData.users.some((user: { discord_id: bigint }) => user.discord_id === memberId);

        if (checkGuild) {
            logger.debugSingle(`Member ${user.username} is within the guild database`, "Handler");
            hasLeft
                ? await removeFromGuild(memberId, guildId)
                : await updateGuild(guildId, memberId, member.user.username);
            logger.debugSingle(`Removed ${user.username} from the database`, "Handler");
        } else {
            logger.debugSingle(`Member ${user.username} is not within the guild database`, "Handler");
        }
    }
}
