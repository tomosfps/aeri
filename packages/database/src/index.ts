import { connectPrisma } from "./sql.js";
import { createGuild } from "./utility/dbCreateGuild.js";
import { createAnilistUser } from "./utility/dbCreateUser.js";
import { deleteAnilistUser } from "./utility/dbDeleteUser.js";
import { fetchUser } from "./utility/dbFetchDiscordUser.js";
import { fetchGuild } from "./utility/dbFetchGuild.js";
import { fetchAnilistUser } from "./utility/dbFetchUser.js";
import { fetchAllUsers } from "./utility/dbFetchUsers.js";
import { removeFromGuild } from "./utility/dbRemoveFromGuild.js";
import { updateGuild } from "./utility/dbUpdateGuild.js";

export {
    fetchUser,
    createAnilistUser,
    fetchAllUsers,
    fetchGuild,
    updateGuild,
    fetchAnilistUser,
    removeFromGuild,
    deleteAnilistUser,
    createGuild,
};
const prisma = connectPrisma();
export default prisma;
