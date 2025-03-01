export type HandlerMetrics = {
    events: {
        [key: `handler_${number}`]: number;
    };
};

export type HandlerMetricsMessage = {
    handlerId: number;
    metrics: HandlerMetrics;
};

export class HandlerMetricsClient {
    public metrics: HandlerMetrics = { events: {} };

    public constructor(public handlerId: number) {
        this.metrics.events[`handler_${this.handlerId}`] = 0;
    }

    public reset(): void {
        this.metrics.events[`handler_${this.handlerId}`] = 0;
    }

    public serialize(): HandlerMetricsMessage {
        return {
            handlerId: this.handlerId,
            metrics: this.metrics,
        };
    }

    public incEvents(): void {
        // biome-ignore lint/style/noNonNullAssertion: Created by the constructor
        this.metrics.events[`handler_${this.handlerId}`]!++;
    }
}
