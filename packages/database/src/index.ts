import { connectPrisma } from "./sql.js";
import { dbCreateAnilistUser } from "./utility/dbCreateAnilistUser.js";
import { dbCreateGuild } from "./utility/dbCreateGuild.js";
import { dbDeleteAnilistUser } from "./utility/dbDeleteUser.js";
import { dbFetchAnilistUser } from "./utility/dbFetchAnilistUser.js";
import { dbFetchDiscordUser } from "./utility/dbFetchDiscordUser.js";
import { dbFetchGuildUser } from "./utility/dbFetchGuildUser.js";
import { dbFetchGuildUsers } from "./utility/dbFetchGuildUsers.js";
import { dbGetCommandCount } from "./utility/dbGetCommandCount.js";
import { dbIncrementCommands } from "./utility/dbIncrementCommands.js";
import { dbRemoveFromGuild } from "./utility/dbRemoveFromGuild.js";
import { dbUpdateGuild } from "./utility/dbUpdateGuild.js";

export {
    dbFetchDiscordUser,
    dbCreateAnilistUser,
    dbFetchGuildUsers,
    dbFetchGuildUser,
    dbUpdateGuild,
    dbFetchAnilistUser,
    dbRemoveFromGuild,
    dbDeleteAnilistUser,
    dbCreateGuild,
    dbIncrementCommands,
    dbGetCommandCount,
};
const prisma = connectPrisma();
export default prisma;
