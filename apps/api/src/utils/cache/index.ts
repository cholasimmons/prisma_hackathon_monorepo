import type { RedisClient } from "bun";
import redis from "~/utils/cache/config";

export class CacheService {
  private redis: RedisClient | null = null;
  private enabled = true;

  constructor() {
    if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
      this.redis = redis;
      console.log("Redis cache enabled");
    } else {
      this.enabled = false;
      console.warn("Redis not configured — caching disabled");
    }
  }

  /**
   * Set a cache value with optional TTL
   */
  async set<T = unknown>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    if (!this.enabled || !this.redis) return;

    try {
      const str = JSON.stringify(value);

      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, str);
      } else {
        await this.redis.set(key, str);
      }
    } catch (err) {
      console.warn(`Cache set failed for key "${key}":`, err);
    }
  }

  /**
   * Get a cached value (automatically parses JSON)
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    if (!this.enabled || !this.redis) return null;

    try {
      const result = await this.redis.get(key);
      if (!result) return null;
      return JSON.parse(result) as T;
    } catch (err) {
      console.warn(`Cache get failed for key "${key}":`, err);
      return null;
    }
  }

  /**
   * Delete a single key
   */
  async del(key: string): Promise<void> {
    if (!this.enabled || !this.redis) return;

    try {
      await this.redis.del(key);
    } catch (err) {
      console.warn(`Cache delete failed for key "${key}":`, err);
    }
  }

  /**
   * Delete many keys at once
   */
  async delMany(keys: string[]): Promise<void> {
    if (!this.enabled || !this.redis || keys.length === 0) return;

    try {
      // Redis DEL supports multiple keys
      await this.redis.del(...keys);
    } catch (err) {
      console.warn("Cache delMany failed:", err);
    }
  }

  /**
   * Delete keys matching patterns (supports wildcards)
   * Example: invalidate(["vehicles:*", "users:123:*"])
   */
  async invalidate(patterns: string[]): Promise<void> {
    if (!this.enabled || !this.redis) return;

    try {
      for (const pattern of patterns) {
        let cursor: string = "0";
        const found: string[] = [];
        // const keys: string[] = [];

        do {
          const result: [string, string[]] = await this.redis.scan(
            cursor,
            "MATCH",
            pattern,
            "COUNT",
            100,
          );

          const [newCursor, keys] = result;
          cursor = newCursor;

          if (keys.length > 0) {
            found.push(...keys);
          }
        } while (cursor !== "0");

        if (found.length > 0) {
          for (let i = 0; i < found.length; i += 200) {
            await this.redis.del(...found.slice(i, i + 200));
          }
        }
      }
    } catch (err) {
      console.warn("Cache invalidation error:", err);
    }
  }

  /**
   * Check if Redis is usable
   */
  isEnabled(): boolean {
    return this.enabled && !!this.redis;
  }

  /**
   * Simple metrics (manual counters recommended for real analytics)
   */
  async keys(pattern = "*"): Promise<string[]> {
    if (!this.enabled || !this.redis) return [];
    return this.redis.keys(pattern);
  }
}

// Singleton
export const cache = new CacheService();
