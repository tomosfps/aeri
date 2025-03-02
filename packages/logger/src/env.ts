import { z } from "zod";

export const envSchema = z.object({
    LOG_LEVEL: z.coerce.number().default(3),
});

export type Environment = z.infer<typeof envSchema>;

export const env: Environment = envSchema.parse(process.env);
