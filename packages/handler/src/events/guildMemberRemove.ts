import { GatewayDispatchEvents as Events } from "@discordjs/core";
import { Logger } from "logger";
import { event } from "../services/events.js";
import { onGuild } from "../utility/guildUtils.js";

const logger = new Logger();

export default event(Events.GuildMemberRemove, async ({ data: member }) => {
    logger.debug(`Member left: ${member.user?.username}`, "Handler");
    if (member.user?.bot) return;

    if (member.user === undefined) {
        logger.warnSingle("Member is undefined", "Handler");
        return;
    }

    await onGuild(false, member.user, member);
});
