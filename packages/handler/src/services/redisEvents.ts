import { readdir } from "node:fs/promises";
import { getRedis } from "core";
import { Logger } from "log";

const subscriber = await getRedis({ lazyConnect: true });
const logger = new Logger();

export interface RedisEvent<T extends string> {
    name: T;
    subscribeName: T;
    on: (data: any) => Promise<void>;
}

export function redisEvent<T extends string>(
    name: T,
    subscribeName: T,
    handler: (data: any) => Promise<void>,
): RedisEvent<T> {
    return {
        name,
        subscribeName,
        on: handler,
    };
}

export async function registerRedisEvents(): Promise<void> {
    logger.infoSingle("Started loading redis event (📝) files.", "Files");
    const allFiles = await readdir(new URL("../events/redis/", import.meta.url));

    if (!allFiles) {
        logger.error("Failed to find redis events (📝)", "Files");
        throw new Error("Failed to find redis events (📝)");
    }

    const events = new Map<string, RedisEvent<string>>();
    const jsFiles = allFiles.filter((file) => file.endsWith(".js"));

    for (const file of jsFiles) {
        try {
            const eventModule = await import(`../events/redis/${file}`);
            const event = eventModule.default as RedisEvent<string>;
            logger.debug(`Loaded redis event (📝) file: ${file}`, "Files", { event });

            if (!event || !event.name || !event.on) {
                logger.error(`Failed to load redis event (📝) file: ${file}`, "Files", {
                    eventModule: eventModule,
                    event: event,
                });
                continue;
            }

            subscriber.psubscribe(event.subscribeName, (err: any, count: any) => {
                if (err) {
                    logger.errorSingle(`Error subscribing to channel: ${err}`, "Redis");
                    return;
                }
                logger.infoSingle(
                    `Subscribed to ${event.subscribeName}, currently listening to ${count} channels.`,
                    "Redis",
                );
            });

            subscriber.on(event.name, async (pattern: string, channel: string, message: string) => {
                logger.debugSingle(`Received event: ${event.name}`, "Files");
                event.on({ pattern, channel, message });
            });
            events.set(event.name, event);
        } catch (error: any) {
            logger.error(`Failed to load redis event (📝) file: ${file}`, "Files", error);
        }
    }
    logger.info("Successfully registered redis events (📝) files.", "Files", {
        events: Array.from(events.keys()),
        count: events.size,
    });
}
