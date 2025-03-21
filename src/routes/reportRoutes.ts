import { checkAccount, submitReport, getAccountReports } from '../controllers/reportController';
import { checkAccountSchema, submitReportSchema } from '../schemas/report.schema';

import { Router } from 'express';
import { TValidationAccepted } from '../types';
import { rateLimitConfig } from '../config/rateLimit.config';
import { rateLimiter } from '../middlewares/rateLimiter.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Check account status - caching now handled in controller
router.get('/check/:platform/:accountId', 
  rateLimiter(rateLimitConfig.checkAccount),
  validate(checkAccountSchema, TValidationAccepted.PARAMS),
  checkAccount
);

// Submit a report - cache clearing now handled in controller
router.post('/report', 
  rateLimiter(rateLimitConfig.submitReport),
  validate(submitReportSchema),
  submitReport
);

// New route to get account reports
router.get('/reports/:platform/:accountId',
  rateLimiter(rateLimitConfig.getEvidence),
  getAccountReports
);

export default router;