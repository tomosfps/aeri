import { PubSubRedisBroker } from "@discordjs/brokers";
import { getRedis } from "core";
import type { MetricsClient, SerializedHandlerMetrics } from "metrics";

type EventPayload = {
    data: SerializedHandlerMetrics;
    ack(): Promise<void>;
};

export async function aggregateHandlerMetrics(metricsClient: MetricsClient) {
    const redis = await getRedis();

    const broker = new PubSubRedisBroker(redis, { group: "metrics" });

    broker.on("metrics", ({ data, ack }: EventPayload) => {
        void ack();
        metricsClient.mergeHandlerMetrics(data);
    });

    await broker.subscribe(["metrics"]);
}
