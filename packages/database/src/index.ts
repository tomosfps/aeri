import { connectPrisma } from "./sql.js";
import { createAnilistUser } from "./utility/createAnilistUser.js";
import { deleteAnilistUser } from "./utility/deleteAnilistUser.js";
import { fetchAllUsers } from "./utility/fetchAllUsers.js";
import { fetchAnilistUser } from "./utility/fetchAnilistUser.js";
import { fetchGuild } from "./utility/fetchGuild.js";
import { fetchUser } from "./utility/fetchUser.js";
import { removeFromGuild } from "./utility/removeFromGuild.js";
import { updateGuild } from "./utility/updateGuild.js";

export {
    fetchUser,
    createAnilistUser,
    fetchAllUsers,
    fetchGuild,
    updateGuild,
    fetchAnilistUser,
    removeFromGuild,
    deleteAnilistUser,
};
const prisma = connectPrisma();
export default prisma;
