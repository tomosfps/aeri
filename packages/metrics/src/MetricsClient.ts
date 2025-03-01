import { Counter, collectDefaultMetrics } from "prom-client";
import type { HandlerMetricsMessage } from "./HandlerMetricsClient.js";
import type { WorkerMetricsMessage } from "./WorkerMetricsClient.js";

export class MetricsClient {
    constructor() {
        collectDefaultMetrics();
    }

    public events = new Counter({
        name: "gateway_events_total",
        help: "Total number of events received",
        labelNames: ["shard_id", "worker_id", "handler_id"] as const,
    });

    public mergeWorkerMetrics({ metrics, workerId, shardIds }: WorkerMetricsMessage) {
        this.events.inc(metrics.events.total);

        for (const shardId of shardIds) {
            const value = metrics.events[`shard_${shardId}`];
            this.events.inc({ shard_id: shardId }, value);
        }

        this.events.inc({ worker_id: workerId }, metrics.events[`worker_${workerId}`]);
    }

    public mergeHandlerMetrics({ metrics, handlerId }: HandlerMetricsMessage) {
        this.events.inc({ handler_id: handlerId }, metrics.events[`handler_${handlerId}`]);
    }
}
