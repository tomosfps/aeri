import { REST } from "@discordjs/rest";
import { getRedis } from "core";
import { env } from "core/dist/env.js";
import { HandlerClient } from "./classes/handlerClient.js";
import { Gateway } from "./gateway.js";
import { FileType, load } from "./services/commands.js";
import { registerEvents } from "./services/events.js";

const redis = await getRedis();
const rest = new REST().setToken(env.DISCORD_TOKEN);

export const commands = await load(FileType.Commands);
export const buttons = await load(FileType.Buttons);
export const selectMenus = await load(FileType.SelectMenus);
export const modals = await load(FileType.Modals);

const gateway = new Gateway({ redis, env });
const client = new HandlerClient({ rest, gateway, commands });

await gateway.connect();
await registerEvents(client);
