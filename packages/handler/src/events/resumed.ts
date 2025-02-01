import { GatewayDispatchEvents as Events } from "@discordjs/core";
import { Logger } from "log";
import { event } from "../services/events.js";

const logger = new Logger();

export default event(Events.Resumed, async () => {
    logger.infoSingle("Resumed", "Handler");
});
