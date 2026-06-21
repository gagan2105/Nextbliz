import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  REDIS_URL: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten());
  process.exit(1);
}

const env = parsed.data;

if (env.NODE_ENV === 'production') {
  if (!env.MONGODB_URI || !env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET) {
    console.error('Production requires MONGODB_URI, JWT_ACCESS_SECRET, and JWT_REFRESH_SECRET');
    process.exit(1);
  }
}

export default {
  ...env,
  MONGODB_URI: env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nxtbiz',
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET || 'dev-access-secret',
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
};
