import Redis from 'ioredis';
import { config } from '../config/env';

class RedisService {
  private client: Redis;
  private ttl: number;

  constructor() {
    this.client = new Redis(config.redis.uri);
    this.ttl = config.redis.ttl;

    this.client.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, expireIn?: number): Promise<void> {
    try {
      await this.client.set(key, value, 'EX', expireIn || this.ttl);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Redis invalidate pattern error:', error);
    }
  }

  // Check if a key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  // Get the remaining TTL for a key (in seconds)
  async ttlOf(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -1;
    }
  }
  
  // Rate limiting methods
  
  // Remove values from sorted set that are outside the window
  async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
    try {
      return await this.client.zremrangebyscore(key, min, max);
    } catch (error) {
      console.error('Redis zremrangebyscore error:', error);
      return 0;
    }
  }
  
  // Count number of elements in sorted set
  async zcard(key: string): Promise<number> {
    try {
      return await this.client.zcard(key);
    } catch (error) {
      console.error('Redis zcard error:', error);
      return 0;
    }
  }
  
  // Add value to sorted set with score
  async zadd(key: string, score: number, value: string): Promise<number> {
    try {
      return await this.client.zadd(key, score, value);
    } catch (error) {
      console.error('Redis zadd error:', error);
      return 0;
    }
  }
  
  // Set key expiry
  async expire(key: string, seconds: number): Promise<number> {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      console.error('Redis expire error:', error);
      return 0;
    }
  }
}

// Create a singleton instance
export const redisService = new RedisService(); 