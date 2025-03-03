import { parentPort, workerData } from "node:worker_threads";
import { PubSubRedisBroker } from "@discordjs/brokers";
import { WebSocketShardEvents, WorkerBootstrapper, type WorkerSendPayload, WorkerSendPayloadOp } from "@discordjs/ws";
import { calculateWorkerId, env, getRedis } from "core";
import { Logger } from "logger";
import { type SerializedWorkerMetrics, WorkerMetricsClient } from "metrics";
import { EventCounter } from "../classes/EventCounter.js";
import { isUnwantedEvent } from "../utility/eventUtils.js";

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
const eventCounters = new Map<number, EventCounter>();

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

            eventCounters.set(payload.shardId, new EventCounter());
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
        // Safety measure to ensure that the event counter is always initialized
        if (!eventCounters.has(shard.id)) {
            eventCounters.set(shard.id, new EventCounter());
        }

        shard.on(WebSocketShardEvents.Dispatch, async (event) => {
            if (isUnwantedEvent(event.t)) return;

            await broker.publish("dispatch", {
                shardId: shard.id,
                data: event,
            });

            metricsClient.record(shard.id, event.t);

            const counter = eventCounters.get(shard.id);
            counter?.inc();

            updateShardEvents(shard.id);

            logger.debugSingle(`Shard ${shard.id} received event ${event.t}`, `Gateway worker ${workerId}`);
        });
    },
});

const updateShardEvents = (shardId: number) => {
    const counter = eventCounters.get(shardId);
    if (counter) {
        const eventsPerSecond = counter.getPerSecond();
        redis.hset(`shardstatus:${shardId}`, { eventsPerSecond });
    }
};

setInterval(() => {
    for (const shardId of workerData.shardIds) {
        updateShardEvents(shardId);
    }
}, 1000);

setInterval(async () => {
    const metrics = await metricsClient.serialize();

    // biome-ignore lint/style/noNonNullAssertion: This is always a worker process
    parentPort!.postMessage({
        op: CustomWorkerPayloadOp.Metrics,
        data: metrics,
    });
}, 10000);
