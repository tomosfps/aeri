import { REST } from "@discordjs/rest";
import { SimpleIdentifyThrottler, WebSocketManager, WebSocketShardEvents, WorkerShardingStrategy } from "@discordjs/ws";
import { Cache } from "cache";
import { env } from "core";
import { GatewayIntentBits } from "discord-api-types/v10";
import { Logger } from "log";

const rest = new REST().setToken(env.DISCORD_TOKEN);
const logger = new Logger();
const cache = await Cache.new("gateway:");

const manager = new WebSocketManager({
    token: env.DISCORD_TOKEN,
    intents: GatewayIntentBits.Guilds,
    rest,
    shardCount: 2,
    buildIdentifyThrottler: async (manager) => {
        const gatewayInformation = await manager.fetchGatewayInformation();
        return new SimpleIdentifyThrottler(gatewayInformation.session_start_limit.max_concurrency);
    },
    buildStrategy: (manager) => {
        return new WorkerShardingStrategy(manager, {
            shardsPerWorker: 4,
            workerPath: `${import.meta.dirname}/worker.js`,
        });
    },
    retrieveSessionInfo: cache.gateway.getSession.bind(cache.gateway),
    updateSessionInfo: cache.gateway.saveSession.bind(cache.gateway),
});

manager.on(WebSocketShardEvents.Resumed, ({ shardId }) => {
    logger.debugSingle(`Shard ${shardId} resumed.`, "Gateway");
});

manager.on(WebSocketShardEvents.Ready, ({ shardId }) => {
    logger.infoSingle(`Shard ${shardId} ready.`, "Gateway");
});

manager.on(WebSocketShardEvents.Closed, ({ shardId }) => {
    logger.debugSingle(`Shard ${shardId} closed.`, "Gateway");
});

manager.on(WebSocketShardEvents.Error, ({ shardId, error }) => {
    logger.error(`Shard ${shardId} errored.`, "Gateway", error);
});

await manager.connect();
