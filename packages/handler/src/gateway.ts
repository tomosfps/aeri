import { EventEmitter } from "node:events";
import { PubSubRedisBroker } from "@discordjs/brokers";
import type { Environment } from "core/dist/env.js";
import type { GatewayDispatchPayload, GatewaySendPayload } from "discord-api-types/v10";
import type { Redis } from "ioredis";
import { Logger } from "log";
import { commands } from "./index.js";
import { deployCommands } from "./services/commands.js";

const logger = new Logger();

type eventPayload = {
    data: { data: GatewayDispatchPayload };
    ack(): Promise<void>;
};

export type gatewayOptions = {
    redis: Redis;
    env: Environment;
};

export class Gateway extends EventEmitter {
    private pubSubBroker: PubSubRedisBroker<Record<string, any>>;
    private env: Environment;

    constructor({ redis, env }: gatewayOptions) {
        super();

        this.env = env;
        this.pubSubBroker = new PubSubRedisBroker({ redisClient: redis });

        this.pubSubBroker.on("dispatch", ({ data, ack }: eventPayload) => {
            this.emit("dispatch", data);
            void ack();
        });

        this.pubSubBroker.on("deploy", async ({ ack }: eventPayload) => {
            await deployCommands(commands);
            void ack();
        });

        this.pubSubBroker.on("error", (error: any) => {
            logger.error("PubSubBroker error:", "Gateway", error);
        });
    }

    async connect(): Promise<void> {
        await this.pubSubBroker.subscribe("handler", ["dispatch", "deploy"]);
    }

    send = (_shardID: number, _payload: GatewaySendPayload): void => {};

    getShardCount = () => this.env.SHARD_COUNT;
}
