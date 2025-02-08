import { GatewayDispatchEvents as Events } from "@discordjs/core";
import { Logger } from "logger";
import { event } from "../services/events.js";

const logger = new Logger();

export default event(Events.Ready, async () => {
    logger.infoSingle("Ready", "Handler");
});
