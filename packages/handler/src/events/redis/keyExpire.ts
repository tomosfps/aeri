import { Logger } from "logger";
import { redisEvent } from "../../services/redisEvents.js";
import { handlerComponentExpiry } from "../../utility/redisUtil.js";

const logger = new Logger();

export default redisEvent("pmessage", "__keyevent@0__:expired", async ({ channel, message }) => {
    if (channel === "__keyevent@0__:expired") {
        const [prefix, prefixID, interactionToken, memberID] = message.split(":") as [string, string, string, string];

        if (!interactionToken || !memberID || !prefixID) {
            logger.warn("Invalid message format", "Redis", { message });
            return;
        }

        if (prefix === "select") {
            logger.debug("Select menu expired", "Redis", { prefix, interactionToken, memberID });
            await handlerComponentExpiry(interactionToken);
        } else if (prefix === "button") {
            logger.debug("Button expired", "Redis", { prefix, interactionToken, memberID });
            await handlerComponentExpiry(interactionToken);
        }
    }
});
