/**
 * Rate limiting configuration - Enhanced security settings
 */

export const rateLimitConfig = {
  // Default rate limit for all routes - more restrictive
  default: {
    windowMs: 60 * 1000, // 1 minute
    max: 30,             // 30 requests per minute
    keyPrefix: 'rate-limit:default:',
    message: 'Too many requests from this IP, please try again after a minute'
  },
  // Check account status - more lenient
  checkAccount: {
    windowMs: 60 * 1000, // 1 minute
    max: 60,             // 60 requests per minute
    keyPrefix: 'rate-limit:check:',
    message: 'Too many account checks, please try again after a minute'
  },
  // Submit report - more restrictive to prevent abuse
  submitReport: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,                 // 10 reports per 5 minutes
    keyPrefix: 'rate-limit:report:',
    message: 'Too many reports submitted. Please try again later.'
  },
  // Get evidence - restrictive to prevent data scraping
  getEvidence: {
    windowMs: 60 * 1000, // 1 minute
    max: 20,             // 20 requests per minute
    keyPrefix: 'rate-limit:evidence:',
    message: 'Too many evidence requests, please try again after a minute'
  },
  // Stats endpoint - more lenient
  getStats: {
    windowMs: 60 * 1000, // 1 minute
    max: 30,             // 30 requests per minute
    keyPrefix: 'rate-limit:stats:',
    message: 'Too many stats requests, please try again after a minute'
  },
  // Migration endpoint - extremely restrictive (admin only)
  migration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,                   // 5 requests per hour
    keyPrefix: 'rate-limit:migration:',
    message: 'Too many migration requests, please try again later'
  }
};