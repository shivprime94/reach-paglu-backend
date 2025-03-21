import { Request, Response } from 'express';

import mongoose from 'mongoose';
import { redisService } from '../services/redis.service';

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis connection
    let redisStatus = 'disconnected';
    try {
      // Try to ping Redis
      await redisService.get('health-check');
      redisStatus = 'connected';
    } catch (error) {
      console.error('Redis health check failed:', error);
    }
    
    const healthy = mongoStatus === 'connected' && redisStatus === 'connected';
    
    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
}; 