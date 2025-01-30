import { readdir } from "node:fs/promises";
import type { GatewayDispatchEvents, MappedEvents } from "@discordjs/core";
import { Logger } from "log";
import type { HandlerClient } from "../classes/handlerClient.js";

export interface Event<T extends GatewayDispatchEvents> {
    name: T;
    on: (data: MappedEvents[T][0] & { client: HandlerClient }) => Promise<void>;
}

const logger = new Logger();

export function event<T extends GatewayDispatchEvents>(
    name: T,
    handler: (data: MappedEvents[T][0] & { client: HandlerClient }) => Promise<void>,
): Event<T> {
    return {
        name,
        on: handler,
    };
}

export async function registerEvents(client: HandlerClient): Promise<void> {
    logger.infoSingle("Started loading event (📝) files.", "Files");
    const allFiles = await readdir(new URL("../events/", import.meta.url));

    if (!allFiles) {
        logger.error("Failed to find events (📝)", "Files");
        throw new Error("Failed to find events (📝)");
    }

    const jsFiles = allFiles.filter((file) => file.endsWith(".js"));
    for (const file of jsFiles) {
        try {
            const event = (await import(`../events/${file}`)).event as Event<GatewayDispatchEvents>;
            client.on(event.name, (data: MappedEvents[GatewayDispatchEvents][0]) => {
                event.on({ ...data, client });
            });
        } catch (error: any) {
            logger.error(`Failed to load event (📝) file: ${file}`, "Files", error);
        }
    }

    logger.info("Successfully registered events (📝)", "Files");
}
