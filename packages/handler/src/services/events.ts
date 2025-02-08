import { readdir } from "node:fs/promises";
import type { GatewayDispatchEvents, MappedEvents as OriginalMappedEvents } from "@discordjs/core";
import { Logger } from "logger";
import type { HandlerClient } from "../classes/handlerClient.js";

interface MappedEvents extends OriginalMappedEvents {
    GUILD_SOUNDBOARD_SOUNDS_UPDATE: any;
    GUILD_SOUNDBOARD_SOUND_CREATE: any;
    GUILD_SOUNDBOARD_SOUND_DELETE: any;
    GUILD_SOUNDBOARD_SOUND_UPDATE: any;
    SOUNDBOARD_SOUNDS: any;
    SUBSCRIPTION_CREATE: any;
    SUBSCRIPTION_DELETE: any;
    SUBSCRIPTION_UPDATE: any;
    VOICE_CHANNEL_EFFECT_SEND: any;
}

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

    const events = new Map<string, Event<GatewayDispatchEvents>>();
    const jsFiles = allFiles.filter((file) => file.endsWith(".js"));

    for (const file of jsFiles) {
        try {
            const eventModule = await import(`../events/${file}`);
            const event = eventModule.default as Event<GatewayDispatchEvents>;

            if (!event || !event.name || !event.on) {
                logger.error(`Failed to load event (📝) file: ${file}`, "Files", {
                    eventModule: eventModule,
                    event: event,
                });
                continue;
            }

            client.on(event.name, (data: MappedEvents[GatewayDispatchEvents][0]) => {
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
