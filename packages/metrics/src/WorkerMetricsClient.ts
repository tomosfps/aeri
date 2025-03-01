import { workerData } from "node:worker_threads";

export type WorkerMetrics = {
    events: {
        [key: `shard_${number}`]: number;
        [key: `worker_${number}`]: number;
        total: number;
    };
};

export type WorkerMetricsMessage = {
    shardIds: number[];
    workerId: number;
    metrics: WorkerMetrics;
};

export class WorkerMetricsClient {
    public metrics: WorkerMetrics = {
        events: {
            total: 0,
        },
    };

    public constructor(public workerId: number) {
        for (const shardId of workerData.shardIds) {
            this.metrics.events[`shard_${shardId}`] = 0;
        }

        this.metrics.events[`worker_${this.workerId}`] = 0;
    }

    public reset(): void {
        this.metrics.events.total = 0;

        for (const shardId of workerData.shardIds) {
            this.metrics.events[`shard_${shardId}`] = 0;
        }

        this.metrics.events[`worker_${this.workerId}`] = 0;
    }

    public serialize(): WorkerMetricsMessage {
        return {
            shardIds: workerData.shardIds,
            workerId: this.workerId,
            metrics: this.metrics,
        };
    }

    public incEvents(shardId: number): void {
        this.metrics.events.total++;

        // biome-ignore lint/style/noNonNullAssertion: Created by the constructor
        this.metrics.events[`shard_${shardId}`]!++;
        // biome-ignore lint/style/noNonNullAssertion: Created by the constructor
        this.metrics.events[`worker_${this.workerId}`]!++;
    }
}
