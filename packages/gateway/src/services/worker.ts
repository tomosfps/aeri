import { workerData } from "node:worker_threads";
import { PubSubRedisBroker } from "@discordjs/brokers";
import { WebSocketShardEvents, WorkerBootstrapper } from "@discordjs/ws";
import { calculateWorkerId, env } from "core";
import { getRedis } from "core";
import { Logger } from "log";

const bootstrapper = new WorkerBootstrapper();
const logger = new Logger();
const redis = await getRedis();
const broker = new PubSubRedisBroker({ redisClient: redis });

const workerId = calculateWorkerId(workerData.shardIds, env.SHARDS_PER_WORKER);
logger.info("Starting...", `Worker ${workerId}`, { shardIds: workerData.shardIds });

if (workerId === 0) {
    await broker.publish("deploy", null);
}

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
                data: event.data,
            });

            logger.debugSingle(`Shard ${shard.id} received event ${event.data.t}`, "Gateway");
        });
    },
});
