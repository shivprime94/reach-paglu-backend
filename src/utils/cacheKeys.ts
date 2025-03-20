/**
 * Utility functions for generating consistent cache keys
 */

// Account status cache key
export const accountStatusKey = (platform: string, accountId: string): string => {
  return `account:status:${platform}:${accountId}`;
};

// Evidence cache key
export const evidenceKey = (platform: string, accountId: string): string => {
  return `evidence:${platform}:${accountId}`;
};

// Stats cache key
export const statsKey = (): string => {
  return `stats:global`;
};

// All account status keys pattern for invalidation
export const allAccountStatusKeysPattern = (): string => {
  return `account:status:*`;
};

// All evidence keys pattern for invalidation
export const allEvidenceKeysPattern = (): string => {
  return `evidence:*`;
};

// All stats keys pattern for invalidation
export const allStatsKeysPattern = (): string => {
  return `stats:*`;
};

// Specific account's evidence and status for invalidation
export const accountRelatedKeysPattern = (platform: string, accountId: string): string => {
  return `*:${platform}:${accountId}`;
}; 