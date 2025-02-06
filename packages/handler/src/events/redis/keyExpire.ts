import { handleExpiration } from "core";
import { Logger } from "log";
import { redisEvent } from "../../services/redisEvents.js";

const logger = new Logger();

export default redisEvent("pmessage", "__keyevent@0__:expired", async ({ channel, message }) => {
    if (channel === "__keyevent@0__:expired") {
        const [prefix, channelId, messageId] = message.split(":") as [string, string, string];
        if (prefix === "select") {
            logger.debug("Select menu expired", "Redis", { prefix, channelId, messageId });
            await handleExpiration(message);
        } else if (prefix === "button") {
            logger.debug("Button expired", "Redis", { prefix, channelId, messageId });
            await handleExpiration(message);
        }
    }
});
