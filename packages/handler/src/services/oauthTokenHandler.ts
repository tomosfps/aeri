import { randomBytes } from "node:crypto";
import { EmbedBuilder } from "@discordjs/builders";
import { API } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { env } from "core";
import { createAnilistUser } from "database";
import { type Redis, ReplyError } from "ioredis";
import { Logger } from "logger";
import { Routes, api } from "wrappers/anilist";

const logger = new Logger();
const rest = new REST().setToken(env.DISCORD_TOKEN);
const dapi = new API(rest);

enum TokenType {
    Anilist = "Anilist",
    Discord = "Discord",
}

type TokenData = {
    type: TokenType;
    user_id: string;
    guild_id: string;
    access_token: string;
};

export class OauthTokenHandler {
    public constructor(private redis: Redis) {}

    public async listen() {
        const streamReadClient = this.redis.duplicate();
        const consumerName = randomBytes(20).toString("hex");

        try {
            await this.redis.xgroup("CREATE", "oauth_token", "handler", "$", "MKSTREAM");
        } catch (error: any) {
            if (!(error instanceof ReplyError)) {
                throw error;
            }
        }

        logger.debugSingle("Listening for Oauth Tokens", "OauthTokenHandler");

        while (true) {
            const data = (await streamReadClient.xreadgroup(
                "GROUP",
                "handler",
                consumerName,
                "COUNT",
                10,
                "BLOCK",
                5000,
                "STREAMS",
                "oauth_token",
                ">",
            )) as null | [string, [string, string[]][]][];

            if (data === null) {
                continue;
            }

            for (const [_stream, messages] of data) {
                for (const message of messages) {
                    const [id, fields] = message;

                    await streamReadClient.xack("oauth_token", "handler", id);

                    if (fields[0] !== "data" || !fields[1]) {
                        logger.error("Invalid message data", "OauthTokenHandler", { fields });
                        continue;
                    }

                    const tokenData = JSON.parse(fields[1]) as TokenData;

                    await this.createAnilistUser(tokenData.user_id, tokenData.guild_id, tokenData.access_token);
                }
            }
        }
    }

    private async finishInteraction(userId: string, success: boolean) {
        const token = await this.redis.get(`anilist_setup_interaction:${userId}`);

        if (token === null) {
            return;
        }

        await this.redis.del(`anilist_setup_interaction:${userId}`);

        const embed = new EmbedBuilder()
            .setColor(success ? 0x69ff8c : 0xff5e5e)
            .setTitle(success ? "Success!" : "Error!")
            .setDescription(
                success
                    ? "Your anilist account has been linked successfully!"
                    : "An error occurred while linking your account.",
            );

        await dapi.interactions.editReply(env.DISCORD_APPLICATION_ID, token, {
            content: "",
            embeds: [embed.toJSON()],
            components: [],
        });
    }

    private async createAnilistUser(userId: string, guildId: string, token: string) {
        const { result: currentUser, error } = await api.fetch(Routes.CurrentUser, { token });

        if (error) {
            logger.error("Error while fetching data from the API.", "Anilist", error);
            return await this.finishInteraction(userId, false);
        }

        if (currentUser === null) {
            logger.debugSingle("User could not be found within the Anilist API", "Anilist");
            return await this.finishInteraction(userId, false);
        }

        await createAnilistUser(BigInt(userId), BigInt(currentUser.id), currentUser.name, token, BigInt(guildId));

        return await this.finishInteraction(userId, true);
    }
}
