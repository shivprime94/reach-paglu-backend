import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 3000,
  threshold: process.env.REPORT_THRESHOLD ? parseInt(process.env.REPORT_THRESHOLD, 10) : 10,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  mongoUri: process.env.MONGO_URI || '',
  
  // Redis configuration
  redis: {
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : 3600,
    useTLS: process.env.REDIS_USE_TLS,
  },
  
  // Add any other configuration values here
  environment: process.env.NODE_ENV || 'development',
};

// Validate required configuration
if (!config.mongoUri) {
  throw new Error('MONGO_URI environment variable is required');
}

if (!config.redis.password && (config.environment === 'production' || config.redis.host !== 'localhost')) {
  console.warn('WARNING: Redis password not set for non-local Redis instance');
}