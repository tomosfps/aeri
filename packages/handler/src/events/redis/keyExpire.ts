import { Logger } from "logger";
import { redisEvent } from "../../services/redisEvents.js";
import { handleComponentExpiry } from "../../utility/redisUtil.js";

const logger = new Logger();

export default redisEvent("pmessage", "__keyevent@0__:expired", async ({ channel, message }) => {
    if (channel === "__keyevent@0__:expired") {
        const [prefix, customId, interactionToken, userId] = message.split(":") as [string, string, string, string];

        if (prefix === "component") {
            logger.debug("Component expired", "Redis", { customId, userId });
            await handleComponentExpiry(interactionToken);
        }
    }
});
