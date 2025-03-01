import { EventEmitter } from "node:events";
import { PubSubRedisBroker } from "@discordjs/brokers";
import type { GatewayDispatchPayload, GatewaySendPayload, Gateway as IGateway } from "@discordjs/core";
import type { Environment } from "core/dist/env.js";
import type { RESTPostAPIApplicationCommandsJSONBody as CommandData } from "discord-api-types/v10";
import type { Redis } from "ioredis";
import { Logger } from "logger";
import { HandlerMetricsClient } from "metrics";
import { deployCommands } from "./services/commands.js";

const logger = new Logger();

type eventPayload = {
    data: { data: GatewayDispatchPayload };
    ack(): Promise<void>;
};

export type gatewayOptions = {
    redis: Redis;
    env: Environment;
    commands: CommandData[];
};

export class Gateway extends EventEmitter implements IGateway {
    private readonly pubSubBroker: PubSubRedisBroker<Record<string, any>>;
    private readonly env: Environment;
    private readonly commands: CommandData[];
    private metricsClient: HandlerMetricsClient;

    constructor({ redis, env, commands }: gatewayOptions) {
        super();

        this.env = env;
        this.pubSubBroker = new PubSubRedisBroker(redis, { group: "handler" });
        this.metricsClient = new HandlerMetricsClient(-1); // TODO use actual IDs, probably from dockers local container api
        this.commands = commands;

        this.pubSubBroker.on("dispatch", ({ data, ack }: eventPayload & { data: { shardId: number } }) => {
            this.emit("dispatch", data.data, data.shardId);
            void ack();

            this.metricsClient.incEvents();
        });

        this.pubSubBroker.on("deploy", async ({ ack }: eventPayload) => {
            await deployCommands(this.commands);
            void ack();
        });

        this.pubSubBroker.on("error", (error: any) => {
            logger.error("PubSubBroker error:", "Gateway", error);
        });

        setInterval(async () => {
            const metrics = this.metricsClient.serialize();

            await this.pubSubBroker.publish("metrics", metrics);

            this.metricsClient.reset();
        }, 10000);
    }

    async connect(): Promise<void> {
        await this.pubSubBroker.subscribe(["dispatch", "deploy"]);
    }

    send = (_shardID: number, _payload: GatewaySendPayload): void => {};
    getShardCount = () => this.env.SHARD_COUNT;
}
