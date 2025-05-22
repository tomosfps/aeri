import { readdir } from "node:fs/promises";
import type { GatewayDispatchEvents, MappedEvents } from "@discordjs/core";
import { Logger } from "logger";
import type { HandlerClient } from "../classes/HandlerClient.js";

export interface Event<T extends GatewayDispatchEvents & keyof MappedEvents> {
    name: T;
    on: (data: MappedEvents[T][0] & { client: HandlerClient }) => Promise<void>;
}

const logger = new Logger();

export function event<T extends GatewayDispatchEvents & keyof MappedEvents>(
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

    const events = new Map<string, Event<GatewayDispatchEvents & keyof MappedEvents>>();
    const jsFiles = allFiles.filter((file) => file.endsWith(".js"));

    for (const file of jsFiles) {
        try {
            const eventModule = await import(`../events/${file}`);
            const event = eventModule.default as Event<GatewayDispatchEvents & keyof MappedEvents>;

            if (!event || !event.name || !event.on) {
                logger.error(`Failed to load event (📝) file: ${file}`, "Files", {
                    eventModule: eventModule,
                    event: event,
                });
                continue;
            }

            client.on(event.name, (data: MappedEvents[typeof event.name][0]) => {
                logger.debugSingle(`Received event: ${event.name}`, "Files");
                event.on({ ...data, client });
            });
            events.set(event.name, event);
        } catch (error: any) {
            logger.error(`Failed to load event (📝) file: ${file}`, "Files", error);
        }
    }
    logger.info("Successfully registered events (📝) files.", "Files", {
        events: Array.from(events.keys()),
        count: events.size,
    });
}
