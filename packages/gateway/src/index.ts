import { REST } from "@discordjs/rest";
import { SimpleIdentifyThrottler, WebSocketManager, WebSocketShardEvents, WorkerShardingStrategy } from "@discordjs/ws";
import { Cache } from "cache";
import { env, getRedis } from "core";
import {
    ActivityType,
    GatewayIntentBits,
    GatewayOpcodes,
    PresenceUpdateStatus,
    type RESTGetCurrentApplicationResult,
    Routes,
} from "discord-api-types/v10";
import { Logger } from "logger";
import { MetricsClient } from "metrics";
import { aggregateHandlerMetrics } from "./services/metricsAggregator.js";
import { setupMetricsServer } from "./services/metricsServer.js";
import type { CustomWorkerPayload } from "./services/worker.js";

const metricsClient = new MetricsClient();
await aggregateHandlerMetrics(metricsClient);
await setupMetricsServer();

const rest = new REST().setToken(env.DISCORD_TOKEN);
const logger = new Logger();
const redis = await getRedis();
const cache = await Cache.new("gateway:");

let currentPresenceIndex = 0;
const presencesList = [
    {
        activities: [{ name: "Sakamoto Days", type: ActivityType.Watching }],
        status: PresenceUpdateStatus.Online,
        since: null,
        afk: false,
    },
    {
        activities: [{ name: "/help", type: ActivityType.Playing }],
        status: PresenceUpdateStatus.Online,
        since: null,
        afk: false,
    },
    {
        activities: [{ name: "Zankyou Sanka", type: ActivityType.Listening }],
        status: PresenceUpdateStatus.Online,
        since: null,
        afk: false,
    },
];

const manager = new WebSocketManager({
    token: env.DISCORD_TOKEN,
    intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMembers,
    rest,
    shardCount: env.SHARD_COUNT,
    buildIdentifyThrottler: async (manager) => {
        const gatewayInformation = await manager.fetchGatewayInformation();
        return new SimpleIdentifyThrottler(gatewayInformation.session_start_limit.max_concurrency);
    },
    buildStrategy: (manager) => {
        return new WorkerShardingStrategy(manager, {
            shardsPerWorker: env.SHARDS_PER_WORKER,
            workerPath: `${import.meta.dirname}/services/worker.js`,
            unknownPayloadHandler: async ({ op, data }: CustomWorkerPayload) => {
                switch (op) {
                    case "metrics": {
                        metricsClient.mergeGatewayMetrics(data);
                        break;
                    }
                }
            },
        });
    },
    retrieveSessionInfo: cache.gateway.getSession.bind(cache.gateway),
    updateSessionInfo: cache.gateway.saveSession.bind(cache.gateway),
});

manager.on(WebSocketShardEvents.Resumed, (shardId) => {
    logger.debugSingle(`Shard ${shardId} resumed.`, "Gateway");

    redis.hset(`shardstatus:${shardId}`, {
        status: "online",
    });
});

manager.on(WebSocketShardEvents.Ready, (_data, shardId) => {
    logger.infoSingle(`Shard ${shardId} ready.`, "Gateway");

    redis.hset(`shardstatus:${shardId}`, {
        status: "online",
    });
});

manager.on(WebSocketShardEvents.Closed, (code, shardId) => {
    logger.debugSingle(`Shard ${shardId} closed (Code ${code}).`, "Gateway");

    redis.hset(`shardstatus:${shardId}`, {
        status: "offline",
    });
});

manager.on(WebSocketShardEvents.Error, (error, shardId) => {
    logger.error(`Shard ${shardId} errored.`, "Gateway", error);
});

async function updateGuildUserMetrics() {
    logger.debugSingle("Updating guild and user install counts", "Gateway");
    const application = (await rest.get(Routes.currentApplication())) as RESTGetCurrentApplicationResult;

    if (application.approximate_guild_count && application.approximate_user_install_count) {
        metricsClient.guild_count.set(application.approximate_guild_count);
        metricsClient.user_install_counter.set(application.approximate_user_install_count);
    }
}

function updatePresences() {
    logger.debugSingle("Updating presences", "Gateway");
    for (let shard = 0; shard < env.SHARD_COUNT; shard++) {
        const presences = presencesList[currentPresenceIndex] as any;
        manager.send(shard, {
            op: GatewayOpcodes.PresenceUpdate,
            d: presences,
        });
        currentPresenceIndex = (currentPresenceIndex + 1) % presencesList.length;
    }
}

await manager.connect();

await updateGuildUserMetrics().catch();
updatePresences();

setInterval(async () => {
    updatePresences();
    await updateGuildUserMetrics().catch();
}, 3_600_000);
