import { env } from "core";
import { Logger } from "logger";
import { checkResponse } from "../util/anilistUtil.js";

const logger = new Logger();

// THIS NEEDS TO STAY DUE TO MEDIA USING IT
// REMOVE ONCE MEDIA IS REMOVED

export async function fetchUserScores(user: number, media_id: number) {
    const response = await fetch(`${env.API_URL}/user/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: user,
            media_id: media_id,
        }),
    }).catch((error) => {
        logger.error("Error while fetching data from the API.", "Anilist", error);
        return null;
    });

    return await checkResponse(response, "User Score");
}
