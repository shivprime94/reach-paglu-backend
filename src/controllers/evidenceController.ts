import { Request, Response } from 'express';

import { Evidence } from '../models/Evidence';
import { evidenceKey } from '../utils/cacheKeys';
import { redisService } from '../services/redis.service';

export const getEvidence = async (req: Request, res: Response): Promise<void> => {
  const { platform, accountId } = req.params;
  
  // Create account key
  const accountKey = `${platform}:${accountId}`;
  const cacheKey = evidenceKey(platform, accountId);
  
  try {
    // Check if data exists in cache
    const cachedData = await redisService.get(cacheKey);
    
    if (cachedData) {
      // Return cached response
      res.json(JSON.parse(cachedData));
      return;
    }
    
    // No cached data found, fetch from database
    const evidenceList = await Evidence.find({ accountKey }).sort({ timestamp: -1 });
    
    // Cache the response (30 minutes)
    await redisService.set(cacheKey, JSON.stringify(evidenceList), 1800);
    
    res.json(evidenceList);
  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
}; 