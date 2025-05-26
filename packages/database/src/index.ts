import { connectPrisma } from "./sql.js";
import { createAnilistUser } from "./utility/createAnilistUser.js";
import { createGuild } from "./utility/createGuild.js";
import { deleteAnilistUser } from "./utility/deleteAnilistUser.js";
import { fetchAnilistUser } from "./utility/fetchAnilistUser.js";
import { fetchDiscordUser } from "./utility/fetchDiscordUser.js";
import { fetchGuildUser } from "./utility/fetchGuildUser.js";
import { fetchGuildUsers } from "./utility/fetchGuildUsers.js";
import { getCommandCount } from "./utility/getCommandCount.js";
import { removeUser } from "./utility/removeUser.js";
import { setCommandCount } from "./utility/setCommandCount.js";
import { updateGuild } from "./utility/updateGuild.js";

export {
    fetchDiscordUser,
    fetchGuildUsers,
    fetchGuildUser,
    updateGuild,
    fetchAnilistUser,
    removeUser,
    createAnilistUser,
    createGuild,
    setCommandCount,
    getCommandCount,
    deleteAnilistUser,
};
const prisma = connectPrisma();
export default prisma;
