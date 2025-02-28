import { REST } from "@discordjs/rest";
import { SimpleIdentifyThrottler, WebSocketManager, WebSocketShardEvents, WorkerShardingStrategy } from "@discordjs/ws";
import { Cache } from "cache";
import { env } from "core";
import { ActivityType, GatewayIntentBits, GatewayOpcodes, PresenceUpdateStatus } from "discord-api-types/v10";
import { Logger } from "logger";

const rest = new REST().setToken(env.DISCORD_TOKEN);
const logger = new Logger();
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
    intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages | GatewayIntentBits.GuildMembers,
    rest,
    shardCount: env.SHARD_COUNT,
    buildIdentifyThrottler: async (manager) => {
        const gatewayInformation = await manager.fetchGatewayInformation();
        return new SimpleIdentifyThrottler(gatewayInformation.session_start_limit.max_concurrency);
    },
    buildStrategy: (manager) => {
        return new WorkerShardingStrategy(manager, {
            shardsPerWorker: env.SHARDS_PER_WORKER,
            workerPath: `${import.meta.dirname}/worker.js`,
        });
    },
    retrieveSessionInfo: cache.gateway.getSession.bind(cache.gateway),
    updateSessionInfo: cache.gateway.saveSession.bind(cache.gateway),
});

manager.on(WebSocketShardEvents.Resumed, (shardId) => {
    logger.debugSingle(`Shard ${shardId} resumed.`, "Gateway");
});

manager.on(WebSocketShardEvents.Ready, (_data, shardId) => {
    logger.infoSingle(`Shard ${shardId} ready.`, "Gateway");
});

manager.on(WebSocketShardEvents.Closed, (code, shardId) => {
    logger.debugSingle(`Shard ${shardId} closed (Code ${code}).`, "Gateway");
});

manager.on(WebSocketShardEvents.Error, (error, shardId) => {
    logger.error(`Shard ${shardId} errored.`, "Gateway", error);
});

const shardAmount = await manager.getShardCount();
(async () => {
    setInterval(async () => {
        logger.debugSingle("Updating presences", "Gateway");
        for (let shard = 0; shard < shardAmount; shard++) {
            const presences = presencesList[currentPresenceIndex] as any;
            manager.send(shard, {
                op: GatewayOpcodes.PresenceUpdate,
                d: presences,
            });
            currentPresenceIndex = (currentPresenceIndex + 1) % presencesList.length;
        }
    }, 3_600_000);
})();

await manager.connect();
