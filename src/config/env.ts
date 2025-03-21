import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 3000,
  threshold: process.env.REPORT_THRESHOLD ? parseInt(process.env.REPORT_THRESHOLD, 10) : 10,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  mongoUri: process.env.MONGO_URI || '',
  
  // Redis configuration - simplified for Upstash
  redis: {
    ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : 3600,
    url: process.env.UPSTASH_URI || '',
  },
  
  // Add any other configuration values here
  environment: process.env.NODE_ENV || 'development',
};

// Validate required configuration
if (!config.mongoUri) {
  throw new Error('MONGO_URI environment variable is required');
}