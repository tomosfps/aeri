import { parentPort, workerData } from "node:worker_threads";
import { PubSubRedisBroker } from "@discordjs/brokers";
import { WebSocketShardEvents, WorkerBootstrapper, type WorkerSendPayload, WorkerSendPayloadOp } from "@discordjs/ws";
import { calculateWorkerId, env, getRedis } from "core";
import { Logger } from "logger";
import { type SerializedWorkerMetrics, WorkerMetricsClient } from "metrics";

export enum CustomWorkerPayloadOp {
    Metrics = "metrics",
}

export interface CustomWorkerPayloadMap {
    [CustomWorkerPayloadOp.Metrics]: SerializedWorkerMetrics;
}

export type CustomWorkerPayload = {
    op: CustomWorkerPayloadOp;
    data: CustomWorkerPayloadMap[keyof CustomWorkerPayloadMap];
};

const bootstrapper = new WorkerBootstrapper();
const logger = new Logger();
const redis = await getRedis();
const broker = new PubSubRedisBroker(redis, { group: "gateway" });

const workerId = calculateWorkerId(workerData.shardIds, env.SHARDS_PER_WORKER);
logger.info("Starting...", `Worker ${workerId}`, { shardIds: workerData.shardIds });

const metricsClient = new WorkerMetricsClient(workerId);

if (workerId === 0) {
    await broker.publish("deploy", null);
}

// biome-ignore lint/style/noNonNullAssertion: This is always a worker process
parentPort!.on("message", async (payload: WorkerSendPayload) => {
    switch (payload.op) {
        case WorkerSendPayloadOp.Connect: {
            redis.hset(`shardstatus:${payload.shardId}`, {
                id: payload.shardId,
                status: "starting",
                eventsPerSecond: 0,
            });
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

            metricsClient.record(shard.id, event.t);

            logger.debugSingle(`Shard ${shard.id} received event ${event.t}`, `Gateway worker ${workerId}`);
        });
    },
});

setInterval(async () => {
    const metrics = await metricsClient.serialize();

    // biome-ignore lint/style/noNonNullAssertion: This is always a worker process
    parentPort!.postMessage({
        op: CustomWorkerPayloadOp.Metrics,
        data: metrics,
    });
}, 10000);
