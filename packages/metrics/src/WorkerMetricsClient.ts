import type { GatewayDispatchEvents } from "discord-api-types/v10";
import { Counter, type MetricObjectWithValues, type MetricValue } from "prom-client";

export type SerializedWorkerMetrics = MetricObjectWithValues<MetricValue<"type" | "shard_id" | "worker_id">>;

export class WorkerMetricsClient {
    public events = new Counter({
        name: "gateway_events_received_total",
        help: "Total number of events received",
        labelNames: ["type", "shard_id", "worker_id"] as const,
    });

    public constructor(public workerId: number) {}

    public async serialize() {
        const eventsData = await this.events.get();
        this.events.reset();

        return eventsData;
    }

    public record(shardId: number, event: GatewayDispatchEvents) {
        this.events.inc({ type: event, shard_id: shardId, worker_id: this.workerId });
    }
}
