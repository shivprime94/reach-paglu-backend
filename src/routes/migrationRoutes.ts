import { Router } from 'express';
import { migrateData } from '../controllers/migrationController';
import { migrateDataSchema } from '../schemas/migration.schema';
import { validate } from '../middlewares/validate.middleware';
import { rateLimiter } from '../middlewares/rateLimiter.middleware';
import { rateLimitConfig } from '../config/rateLimit.config';

const router = Router();

// Migrate existing data from JSON to MongoDB
router.get('/migrate-data', 
  rateLimiter(rateLimitConfig.migration), // Add rate limiting
  validate(migrateDataSchema),
  migrateData
);

export default router;