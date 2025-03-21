import { Request, Response } from 'express';

import { IReport } from '../models/Report';
import { Report } from '../models/Report';
import { config } from '../config/env';
import { redisService } from '../services/redis.service';
import { statsKey } from '../utils/cacheKeys';

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = statsKey();
    
    // Check if data exists in cache
    const cachedData = await redisService.get(cacheKey);
    
    if (cachedData) {
      // Return cached response
      res.json(JSON.parse(cachedData));
      
      // Perform background revalidation - no await to avoid blocking
      updateStatsCache(cacheKey);
      return;
    }
    
    // No cached data found, fetch from database
    const statsData = await fetchStats();
    
    // Cache the response (1 hour)
    await redisService.set(cacheKey, JSON.stringify(statsData), 3600);
    
    res.json(statsData);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Helper function to fetch stats
async function fetchStats() {
  const scammerCount = await Report.countDocuments({ votes: { $gte: config.threshold } });
  const reports = await Report.find();
  const reportCount = reports.reduce((sum: number, account: IReport) => sum + account.votes, 0);
  const accountCount = await Report.countDocuments();
  
  return {
    scammerCount,
    reportCount,
    accountCount
  };
}

// Helper function to update cache in background
async function updateStatsCache(cacheKey: string) {
  try {
    const statsData = await fetchStats();
    await redisService.set(cacheKey, JSON.stringify(statsData), 3600); // 1 hour cache
  } catch (error) {
    console.error('Error during background cache revalidation:', error);
  }
} 