import { Counter, Gauge } from "prom-client";
import type { SerializedHandlerMetrics } from "./HandlerMetricsClient.js";
import type { SerializedWorkerMetrics } from "./WorkerMetricsClient.js";

export class MetricsClient {
    public gateway_events = new Counter({
        name: "gateway_events_received_total",
        help: "Total number of events received",
        labelNames: ["type", "shard_id", "worker_id"] as const,
    });

    public handler_events = new Counter({
        name: "handler_events_received_total",
        help: "Total number of events received per handler",
        labelNames: ["handler_id"] as const,
    });

    public media_commands = new Counter({
        name: "handler_media_commands_total",
        help: "Total number of media commands received",
        labelNames: ["media_type", "media_id", "media_name"] as const,
    });

    public interaction_types = new Counter({
        name: "handler_interaction_types_total",
        help: "Total number of commands received",
        labelNames: ["type"] as const,
    });

    public guild_count = new Gauge({
        name: "bot_guild_count",
        help: "Total number of guilds",
    });

    public user_install_counter = new Gauge({
        name: "bot_user_install_count",
        help: "Total number of users",
    });

    public command_counter = new Gauge({
        name: "handler_interaction_commands_total",
        help: "Total number of interaction commands received",
    });

    public async mergeGatewayMetrics(data: SerializedWorkerMetrics) {
        for (const item of data.values) {
            this.gateway_events.inc(item.labels, item.value);
        }
    }

    public mergeHandlerMetrics(data: SerializedHandlerMetrics) {
        for (const item of data.events.values) {
            this.handler_events.inc(item.labels, item.value);
        }

        for (const item of data.mediaCommands.values) {
            this.media_commands.inc(item.labels, item.value);
        }

        for (const item of data.interactionTypes.values) {
            this.interaction_types.inc(item.labels, item.value);
        }

        if (data.commandCounter?.values) {
            for (const item of data.commandCounter.values) {
                this.command_counter.inc(item.value);
            }
        }
    }
}
