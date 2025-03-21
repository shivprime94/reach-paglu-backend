import { Request, Response } from 'express';
import { accountStatusKey, accountRelatedKeysPattern, allAccountStatusKeysPattern, allStatsKeysPattern } from '../utils/cacheKeys';
import { Evidence } from '../models/Evidence';
import { Report } from '../models/Report';
import { Reporter } from '../models/Reporter';
import { config } from '../config/env';
import { redisService } from '../services/redis.service';
import { sanitizeInput } from '../utils/sanitize';

export const checkAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate and sanitize inputs from the request parameters
    const platform = sanitizeInput(req.params.platform);
    const accountId = sanitizeInput(req.params.accountId);
    
    if (!platform || !accountId) {
      res.status(400).json({ error: 'Invalid platform or accountId' });
      return;
    }
    
    // Create account key
    const accountKey = `${platform}:${accountId}`;
    const cacheKey = accountStatusKey(platform, accountId);
    
    // Check if data exists in cache
    const cachedData = await redisService.get(cacheKey);
    
    if (cachedData) {
      // Return cached response
      res.json(JSON.parse(cachedData));
      
      // Perform background revalidation - no await to avoid blocking
      updateAccountStatusCache(platform, accountId, cacheKey).catch(err => 
        console.error('Error updating cache in background:', err)
      );
      return;
    }
    
    // No cached data found, fetch from database
    const responseData = await getAccountStatus(platform, accountId);
    
    // Cache the response
    await redisService.set(cacheKey, JSON.stringify(responseData), 3600); // 1 hour cache
    
    res.json(responseData);
  } catch (error) {
    console.error('Error checking account:', error);
    // Don't expose internal error details
    res.status(500).json({ error: 'Failed to check account status' });
  }
};

// Helper function to get account status
async function getAccountStatus(platform: string, accountId: string) {
  const accountKey = `${platform}:${accountId}`;
  const report = await Report.findOne({ accountKey });
  
  if (report) {
    const votes = report.votes;
    const isScammer = votes >= config.threshold;
    
    return {
      status: isScammer ? 'scammer' : 'safe',
      votes: votes
    };
  } else {
    return {
      status: 'safe',
      votes: 0
    };
  }
}

// Helper function to update cache in background
async function updateAccountStatusCache(platform: string, accountId: string, cacheKey: string) {
  try {
    const responseData = await getAccountStatus(platform, accountId);
    await redisService.set(cacheKey, JSON.stringify(responseData), 3600); // 1 hour cache
  } catch (error) {
    console.error('Error during background cache revalidation:', error);
    throw error;
  }
}

export const submitReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate required User-Agent header
    if (!req.headers['user-agent']) {
      res.status(400).json({ error: 'User agent is required' });
      return;
    }
    
    // Validate and sanitize input
    const platform = sanitizeInput(req.body.platform);
    const accountId = sanitizeInput(req.body.accountId);
    const evidence = sanitizeInput(req.body.evidence);
    const evidenceUrl = req.body.evidenceUrl ? sanitizeInput(req.body.evidenceUrl) : null;
    const reporterToken = req.body.reporterToken ? sanitizeInput(req.body.reporterToken) : null;
    
    // Check if required fields are present
    if (!platform || !accountId || !evidence) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    // Validate URL format if provided
    if (evidenceUrl && !isValidUrl(evidenceUrl)) {
      res.status(400).json({ error: 'Invalid evidence URL format' });
      return;
    }
    
    // Create account key
    const accountKey = `${platform}:${accountId}`;
    
    // Create reporter identifier (combine IP with token if provided)
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
    const reporterUserAgent = req.headers['user-agent'] as string;
    const reporterId = reporterToken 
      ? `${ip}:${reporterToken}:${sanitizeInput(reporterUserAgent)}`
      : `${ip}:${sanitizeInput(reporterUserAgent)}`;
    
    // Check if this reporter has already reported this account
    let reporter = await Reporter.findOne({ reporterId });
    
    if (!reporter) {
      reporter = new Reporter({ reporterId, reportedAccounts: [] });
    }
    
    if (reporter.reportedAccounts.includes(accountKey)) {
      res.status(400).json({ 
        error: 'Duplicate report', 
        message: 'You have already reported this account',
        isDuplicate: true
      });
      return;
    }
    
    // Find or create report for this account
    let report = await Report.findOne({ accountKey });
    
    if (!report) {
      report = new Report({
        accountKey,
        platform,
        accountId,
        votes: 0,
        lastReported: new Date()
      });
    }
    
    // Add evidence
    const newEvidence = new Evidence({
      accountKey,
      evidence,
      evidenceUrl: evidenceUrl || null,
      timestamp: new Date(),
      reporterId
    });
    
    await newEvidence.save();
    
    // Increment vote count
    report.votes += 1;
    report.lastReported = new Date();
    await report.save();
    
    // Mark this account as reported by this reporter
    reporter.reportedAccounts.push(accountKey);
    await reporter.save();
    
    // Check if account is now a scammer
    const isScammer = report.votes >= config.threshold;
    
    // Clear specific cache for this account (more efficient than clearing all caches)
    await redisService.invalidatePattern(accountRelatedKeysPattern(platform, accountId));
    await redisService.invalidatePattern(allStatsKeysPattern());
    
    res.json({
      success: true,
      status: isScammer ? 'scammer' : 'safe',
      votes: report.votes
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    // Don't expose internal error details
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Add this new controller function
export const getAccountReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const platform = sanitizeInput(req.params.platform);
    const accountId = sanitizeInput(req.params.accountId);

    if (!platform || !accountId) {
      res.status(400).json({ error: 'Invalid platform or accountId' });
      return;
    }

    // Use indexed fields for efficient query
    const report = await Report.findOne(
      { platform, accountId },
      { votes: 1, lastReported: 1 }
    ).lean();

    if (!report) {
      res.json({
        reportCount: 0,
        lastReported: null
      });
      return;
    }

    res.json({
      reportCount: report.votes,
      lastReported: report.lastReported
    });

  } catch (error) {
    console.error('Error fetching account reports:', error);
    res.status(500).json({ error: 'Failed to fetch report data' });
  }
};