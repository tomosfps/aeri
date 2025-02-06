import { workerData } from "node:worker_threads";
import { PubSubRedisBroker } from "@discordjs/brokers";
import { WebSocketShardEvents, WorkerBootstrapper } from "@discordjs/ws";
import { calculateWorkerId, env } from "core";
import { getRedis } from "core";
import { Logger } from "log";

const bootstrapper = new WorkerBootstrapper();
const logger = new Logger();
const redis = await getRedis();
const subscriber = redis.duplicate();
const broker = new PubSubRedisBroker(redis, { group: "gateway" });

const workerId = calculateWorkerId(workerData.shardIds, env.SHARDS_PER_WORKER);
logger.info("Starting...", `Worker ${workerId}`, { shardIds: workerData.shardIds });

if (workerId === 0) {
    await broker.publish("deploy", null);
}

subscriber.psubscribe("__keyevent@0__:expired", (err: any, count: any) => {
    if (err) {
        logger.error("Error subscribing to key events", "Redis", err.message);
    } else {
        logger.infoSingle(`Subscribed to ${count} channels.`, "Redis");
    }
});

subscriber.on("pmessage", async (pattern: string, channel: string, message: string) => {
    logger.debug("Received key event", "Redis", { pattern, channel, message });

    if (channel === "__keyevent@0__:expired") {
        const [prefix, selectId, memberId] = message.split(":") as [string, string, string];
        if (prefix === "select") {
            logger.debug("Select menu expired", "Redis", { selectId, memberId });
        } else if (prefix === "button") {
            logger.debug("Button expired", "Redis", { selectId, memberId });
        }
    }
});

void bootstrapper.bootstrap({
    forwardEvents: [
        WebSocketShardEvents.Closed,
        WebSocketShardEvents.Ready,
        WebSocketShardEvents.Resumed,
        WebSocketShardEvents.Error,
        WebSocketShardEvents.Hello,
    ],
    shardCallback: (shard) => {
        shard.on(WebSocketShardEvents.Dispatch, async (event) => {
            await broker.publish("dispatch", {
                shardId: shard.id,
                data: event,
            });

            logger.debugSingle(`Shard ${shard.id} received event ${event.t}`, `Gateway worker ${workerId}`);
        });
    },
});
