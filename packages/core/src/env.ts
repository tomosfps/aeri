import { z } from "zod";

export const envSchema = z.object({
    DISCORD_TOKEN: z.string(),
    DISCORD_APPLICATION_ID: z.string(),
    DISCORD_TEST_GUILD_ID: z.string().optional(),
    DISCORD_OWNER_IDS: z
        .string()
        .transform((val) => val.split(",").map((id) => id.trim()))
        .optional(),

    ANILIST_CLIENT_ID: z.string(),
    ANILIST_CLIENT_SECRET: z.string(),
    ANILIST_REDIRECT_URL: z.string(),

    POSTGRES_URL: z.string(),
    POSTGRES_HOST: z.string().default("localhost"),
    POSTGRES_PORT: z.coerce.number().default(5432),
    POSTGRES_DB: z.string().default("bot"),
    POSTGRES_USER: z.string().default("admin"),
    POSTGRES_PASSWORD: z.string().default("root"),

    API_HOST: z.string().default("localhost"),
    API_PORT: z.coerce.number().default(8080),
    API_URL: z.string().default("http://localhost:8080"),
    MAIN_PROXIES: z.string(),
    BACKUP_PROXIES: z.string(),

    VITE_API_URL: z.string(),
    VITE_DISCORD_SUPPORT_INVITE: z.string().optional(),
    VITE_DISCORD_APPLICATION_ID: z.string(),
    VITE_DISCORD_INVITE_PERMISSIONS: z.coerce.number().default(8),

    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().default(""),
    REDIS_DATABASE: z.coerce.number().default(0),
    REDIS_URL: z.string(),

    WEBSITE_URL: z.string(),
    OAUTH_SUCCESS_PATH: z.string().default("/success"),
    OAUTH_FAIL_PATH: z.string().default("/fail"),

    SHARD_COUNT: z.coerce.number(),
    SHARDS_PER_WORKER: z.coerce.number(),

    GATEWAY_METRICS_PORT: z.coerce.number().default(9091),
    PROMETHEUS_URL: z.string(),
    GF_SECURITY_ADMIN_USER: z.string().default("admin"),
    GF_SECURITY_ADMIN_PASSWORD: z.string().default("admin"),

    LOG_LEVEL: z.coerce.number().default(3),
});

export type Environment = z.infer<typeof envSchema>;

export const env: Environment = envSchema.parse(process.env);
