import { GatewayDispatchEvents as Events } from "@discordjs/core";
import { Logger } from "logger";
import { event } from "../services/events.js";
import { onGuild } from "../utility/guildUtils.js";

const logger = new Logger();

export default event(Events.GuildMemberRemove, async ({ data: member }) => {
    if (member.user?.bot) return;

    if (member.user === undefined) {
        logger.warnSingle("Undefined member left server", "Handler");
        return;
    }

    await onGuild(false, member.user, member);
});
