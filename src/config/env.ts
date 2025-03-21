import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/reach-paglu',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  threshold: 10, // Number of reports needed to flag as scammer
  redis: {
    uri: process.env.REDIS_URI || 'redis://localhost:6379',
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10) // Default 1 hour cache
  }
}; 