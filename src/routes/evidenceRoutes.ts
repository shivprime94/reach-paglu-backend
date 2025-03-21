import { Router } from 'express';
import { TValidationAccepted } from '../types';
import { getEvidence } from '../controllers/evidenceController';
import { getEvidenceSchema } from '../schemas/evidence.schema';
import { rateLimitConfig } from '../config/rateLimit.config';
import { rateLimiter } from '../middlewares/rateLimiter.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Get all evidence for an account - caching now handled in controller
router.get('/evidence/:platform/:accountId', 
  rateLimiter(rateLimitConfig.getEvidence),
  validate(getEvidenceSchema, TValidationAccepted.PARAMS),
  getEvidence
);

export default router; 