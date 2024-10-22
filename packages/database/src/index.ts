import { connectPrisma } from "./sql.js";
import { createAnilistUser } from "./utility/createAnilistUser.js";
import { fetchAnilistUser } from "./utility/fetchAnilistUser.js";

export { fetchAnilistUser, createAnilistUser };
const prisma = connectPrisma();
export default prisma;
