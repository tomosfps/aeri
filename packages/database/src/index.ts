import { connectPrisma } from "./sql.js";
import { createAnilistUser } from "./utility/createAnilistUser.js";
import { createGuild } from "./utility/createGuild.js";
import { fetchAllUsers } from "./utility/fetchAllUsers.js";
import { fetchAnilistUser } from "./utility/fetchAnilistUser.js";
import { fetchGuild } from "./utility/fetchGuild.js";
import { fetchUser } from "./utility/fetchUser.js";

export { fetchUser, createAnilistUser, fetchAllUsers, fetchGuild, createGuild, fetchAnilistUser };
const prisma = connectPrisma();
export default prisma;
