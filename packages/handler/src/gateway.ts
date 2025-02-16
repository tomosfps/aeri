import { EventEmitter } from "node:events";
import { PubSubRedisBroker } from "@discordjs/brokers";
import type { GatewayDispatchPayload, GatewaySendPayload, Gateway as IGateway } from "@discordjs/core";
import type { Environment } from "core/dist/env.js";
import type { Redis } from "ioredis";
import { Logger } from "logger";
import { type BaseCommand, deployCommands } from "./services/commands.js";

const logger = new Logger();

type eventPayload = {
    data: { data: GatewayDispatchPayload };
    ack(): Promise<void>;
};

export type gatewayOptions = {
    redis: Redis;
    env: Environment;
    commands: BaseCommand[];
};

export class Gateway extends EventEmitter implements IGateway {
    private readonly pubSubBroker: PubSubRedisBroker<Record<string, any>>;
    private readonly env: Environment;
    private readonly commands: BaseCommand[];

    constructor({ redis, env, commands }: gatewayOptions) {
        super();

        this.env = env;
        this.pubSubBroker = new PubSubRedisBroker(redis, { group: "handler" });
        this.commands = commands;

        this.pubSubBroker.on("dispatch", ({ data, ack }: eventPayload & { data: { shardId: number } }) => {
            this.emit("dispatch", data.data, data.shardId);
            void ack();
        });

        this.pubSubBroker.on("deploy", async ({ ack }: eventPayload) => {
            const commandsMap = new Map(
                this.commands
                    .filter((command) => command.data.name !== undefined)
                    .map((command) => [command.data.name as string, command]),
            );
            await deployCommands(commandsMap);
            void ack();
        });

        this.pubSubBroker.on("error", (error: any) => {
            logger.error("PubSubBroker error:", "Gateway", error);
        });
    }

    async connect(): Promise<void> {
        await this.pubSubBroker.subscribe(["dispatch", "deploy"]);
    }

    send = (_shardID: number, _payload: GatewaySendPayload): void => {};

    getShardCount = () => this.env.SHARD_COUNT;
}
