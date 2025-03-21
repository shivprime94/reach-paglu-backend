/**
 * Rate limiting configuration
 */

export const rateLimitConfig = {
  // Default rate limit for all routes
  default: {
    windowMs: 60 * 1000, // 1 minute
    max: 60,             // 60 requests per minute
    keyPrefix: 'rate-limit:default:'
  },
  // Check account status - mor lenient
  checkAccount: {
    windowMs: 60 * 1000, // 1 minute
    max: 100,            // 100 requests per minute
    keyPrefix: 'rate-limit:check:'
  },
  // Submit report - more restrictive to prevent abuse
  submitReport: {
    windowMs: 60 * 1000, // 1 minute
    max: 1000,             // 10 requests per minute
    keyPrefix: 'rate-limit:report:'
  },
  // Get evidence - more retrictive to prevent data scraping
  getEvidence: {
    windowMs: 60 * 1000, // 1 minute
    max: 30,             // 30 requests per minute
    keyPrefix: 'rate-limit:evidence:'
  },
  // Stats endoint - more lenient
  getStats: {
    windowMs: 60 * 1000, // 1 minute
    max: 100,             // 100 requests per minute
    keyPrefix: 'rate-limit:stats:'
  }
}; 