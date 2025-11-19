import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().transform(Number).default(3000),
    JWT_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string(),
    JWT_REFRESH_EXPIRES_IN: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    const tree = z.treeifyError(_env.error);
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(tree, null, 2));
    throw new Error("Invalid environment variables");
}

export const env = _env.data;
