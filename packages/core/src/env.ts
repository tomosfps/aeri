import { z } from "zod";

export const envSchema = z.object({
    DISCORD_TOKEN: z.string(),
    DISCORD_APPLICATION_ID: z.string(),
    DISCORD_TEST_GUILD_ID: z.string().optional(),
    POSTGRES_URL: z.string().optional(),
    POSTGRES_HOST: z.string().default("database"),
    POSTGRES_PORT: z.coerce.number().default(5432),
    POSTGRES_DB: z.string().default("bot"),
    POSTGRES_USER: z.string().default("admin"),
    POSTGRES_PASSWORD: z.string().default("root"),
    PISTON_HOST: z.string().default("piston"),
    PISTON_PORT: z.coerce.number().default(2000),
    PISTON_URL: z.string().default("http://piston:2000"),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().default(""),
    REDIS_DATABASE: z.coerce.number().default(0),
    SHARD_COUNT: z.coerce.number(),
    SHARDS_PER_WORKER: z.coerce.number(),
    LOG_LEVEL: z.coerce.number().default(3),
});

export type Environment = z.infer<typeof envSchema>;

export const env: Environment = envSchema.parse(process.env);
