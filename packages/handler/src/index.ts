import { REST } from "@discordjs/rest";
import { getRedis } from "core";
import { env } from "core/dist/env.js";
import type { RESTPostAPIApplicationCommandsJSONBody as CommandData } from "discord-api-types/v10";
import { HandlerClient } from "./classes/handlerClient.js";
import { Gateway } from "./gateway.js";
import { FileType, load } from "./services/commands.js";
import { registerEvents } from "./services/events.js";
import { registerRedisEvents } from "./services/redisEvents.js";

const redis = await getRedis();
const rest = new REST().setToken(env.DISCORD_TOKEN);

const chatInputCommands = await load(FileType.Commands);
const buttons = await load(FileType.Buttons);
const selectMenus = await load(FileType.SelectMenus);
const modals = await load(FileType.Modals);
const messageContextCommands = await load(FileType.MessageContext);

const commands: CommandData[] = [
    ...chatInputCommands.values().map((c) => c.data.toJSON()),
    ...messageContextCommands.values().map((c) => c.data.toJSON()),
];

const gateway = new Gateway({ redis, env, commands });
const client = new HandlerClient({
    rest,
    gateway,
    commands: chatInputCommands,
    buttons,
    selectMenus,
    modals,
    messageContextCommands,
});

await gateway.connect();
await registerEvents(client);
await registerRedisEvents();
