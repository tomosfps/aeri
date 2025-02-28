import { z } from "zod";

export const envSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:8080"),
});

export type Environment = z.infer<typeof envSchema>;

const result = envSchema.safeParse(import.meta.env);

if (!result.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(result.error.format(), null, 4)
  );
  throw new Error("Invalid environment variables");
}

export const env = {
  API_URL: result.data.VITE_API_URL,
};