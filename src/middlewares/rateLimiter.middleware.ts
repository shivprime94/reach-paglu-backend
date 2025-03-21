import { NextFunction, Request, Response } from 'express';

import { redisService } from '../services/redis.service';

interface RateLimitOptions {
  windowMs?: number;     // Time window in milliseconds
  max?: number;          // Maximum number of requests in the window
  message?: string;      // Error message
  keyPrefix?: string;    // Redis key prefix
  identifierFn?: (req: Request) => string;   // Function to get request identifier
}

/**
 * Rate limiting middleware using Redis
 * @param options Rate limiting options
 */
export const rateLimiter = (options: RateLimitOptions = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // Default: 1 minute
  const max = options.max || 60; // Default: 60 requests per minute
  const message = options.message || 'Too many requests, please try again later.';
  const keyPrefix = options.keyPrefix || 'rate-limit:';
  
  // Default identifier: client IP
  const identifierFn = options.identifierFn || ((req: Request) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
    return ip;
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get request identifier (usually IP)
      const identifier = identifierFn(req);
      const key = `${keyPrefix}${identifier}`;
      
      // Current timestamp in seconds
      const now = Math.floor(Date.now() / 1000);
      
      // Window size in seconds
      const windowSize = Math.floor(windowMs / 1000);
      
      // Remove old requests outside the current window
      await redisService.zremrangebyscore(key, 0, now - windowSize);
      
      // Count requests in the current window
      const requestCount = await redisService.zcard(key);
      
      // Set expiry for the key
      await redisService.expire(key, windowSize);
      
      // Set headers for rate limiting info
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - requestCount - 1));
      
      if (requestCount >= max) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: message
        });
      }
      
      // Add current request to the sorted set with current timestamp as score
      await redisService.zadd(key, now, `${now}-${Math.random()}`);
      
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open to avoid blocking legitimate requests if Redis fails
      next();
    }
  };
};