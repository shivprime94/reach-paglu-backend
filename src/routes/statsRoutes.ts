import { Router } from 'express';
import { getStats } from '../controllers/statsController';
import { getStatsSchema } from '../schemas/stats.schema';
import { rateLimitConfig } from '../config/rateLimit.config';
import { rateLimiter } from '../middlewares/rateLimiter.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Get statistics - caching now handled in controller
router.get('/stats', 
  rateLimiter(rateLimitConfig.getStats),
  validate(getStatsSchema),
  getStats
);

export default router; 