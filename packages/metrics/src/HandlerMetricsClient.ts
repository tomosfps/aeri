import { Counter, type MetricObjectWithValues, type MetricValue } from "prom-client";

export type SerializedHandlerMetrics = {
    events: MetricObjectWithValues<MetricValue<"handler_id">>;
    mediaCommands: MetricObjectWithValues<MetricValue<"media_type" | "media_id" | "media_name">>;
    interactionTypes: MetricObjectWithValues<MetricValue<"type">>;
};

export class HandlerMetricsClient {
    public events = new Counter({
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

    public constructor(public handlerId: number) {}

    public async serialize() {
        const eventsData = await this.events.get();
        this.events.reset();

        const mediaCommandsData = await this.media_commands.get();
        this.media_commands.reset();

        const interactionTypesData = await this.interaction_types.get();
        this.interaction_types.reset();

        return {
            events: eventsData,
            mediaCommands: mediaCommandsData,
            interactionTypes: interactionTypesData,
        };
    }

    public recordEvent() {
        this.events.inc({ handler_id: this.handlerId });
    }
}
