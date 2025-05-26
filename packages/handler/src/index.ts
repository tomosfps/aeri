import { type APIUser, type RESTPostAPIApplicationCommandsJSONBody, Routes } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { getRedis } from "core";
import { env } from "core/dist/env.js";
import { HandlerClient } from "./classes/HandlerClient.js";
import { Gateway } from "./gateway.js";
import { FileType, load } from "./services/commands.js";
import { registerEvents } from "./services/events.js";
import { OauthTokenHandler } from "./services/oauthTokenHandler.js";

const redis = await getRedis();
const rest = new REST().setToken(env.DISCORD_TOKEN);

const chatInputCommands = await load(FileType.Commands);
const buttons = await load(FileType.Buttons);
const selectMenus = await load(FileType.SelectMenus);
const messageContextCommands = await load(FileType.MessageContext);
const userContextCommands = await load(FileType.UserContext);
const autoCompleteCommands = await load(FileType.AutoComplete);
const bot = (await rest.get(Routes.user("@me"))) as APIUser;

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
    ...chatInputCommands.values().map((c) => c.data.toJSON()),
    ...messageContextCommands.values().map((c) => c.data.toJSON()),
    ...userContextCommands.values().map((c) => c.data.toJSON()),
];

const gateway = new Gateway({ redis, env, commands });
const client = new HandlerClient({
    rest,
    gateway,
    metricsClient: gateway.metricsClient,
    commands: chatInputCommands,
    buttons,
    selectMenus,
    messageContextCommands,
    userContextCommands,
    autoCompleteCommands,
    bot,
});

const oauthTokenHandler = new OauthTokenHandler(redis);
void oauthTokenHandler.listen();

await gateway.connect();
await registerEvents(client);
