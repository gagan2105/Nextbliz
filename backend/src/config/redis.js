import Redis from 'ioredis';
import env from './env.js';

let redis = null;

export function getRedis() {
  if (!env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(env.REDIS_URL);
  }
  return redis;
}

export function isRedisAvailable() {
  return Boolean(env.REDIS_URL);
}
