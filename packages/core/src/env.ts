import { z } from "zod";

export const envSchema = z.object({
    DISCORD_TOKEN: z.string(),
    DISCORD_APPLICATION_ID: z.string(),
    DISCORD_TEST_GUILD_ID: z.string().optional(),
    DISCORD_OWNER_IDS: z
        .string()
        .transform((val) => val.split(","))
        .optional(),
    POSTGRES_URL: z.string().optional(),
    POSTGRES_HOST: z.string().default("database"),
    POSTGRES_PORT: z.coerce.number().default(5432),
    POSTGRES_DB: z.string().default("bot"),
    POSTGRES_USER: z.string().default("admin"),
    POSTGRES_PASSWORD: z.string().default("root"),
    PISTON_HOST: z.string().default("piston"),
    PISTON_PORT: z.coerce.number().default(2000),
    PISTON_URL: z.string().default("https://emkc.org/api/v2/piston"),
    API_PORT: z.coerce.number().default(8080),
    API_HOST: z.string().default("0.0.0.0"),
    API_URL: z.string().default("http://localhost:8080"),
    ANILIST_CLIENT_ID: z.string(),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().default(""),
    REDIS_DATABASE: z.coerce.number().default(0),
    REDIS_URL: z.string().optional(),
    SHARD_COUNT: z.coerce.number(),
    SHARDS_PER_WORKER: z.coerce.number(),
    METRICS_HOST: z.string().default("gateway"),
    GATEWAY_METRICS_PORT: z.coerce.number().default(9091),
    LOG_LEVEL: z.coerce.number().default(3),
});

export type Environment = z.infer<typeof envSchema>;

export const env: Environment = envSchema.parse(process.env);
