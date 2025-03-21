/**
 * Utility functions for generating consistent cache keys
 */

// Function to generate account status cache key
export function accountStatusKey(platform: string, accountId: string): string {
  return `account:status:${platform}:${accountId}`;
}

// Function to generate evidence cache key
export function evidenceKey(platform: string, accountId: string): string {
  return `evidence:${platform}:${accountId}`;
}

// Function to generate stats cache key
export function statsKey(): string {
  return 'stats:global';
}

// Pattern for invalidating all account-related keys
export function accountRelatedKeysPattern(platform: string, accountId: string): string {
  return `*:${platform}:${accountId}`;
}

// Pattern for invalidating all account status keys
export function allAccountStatusKeysPattern(): string {
  return 'account:status:*';
}

// Pattern for invalidating all stats keys
export function allStatsKeysPattern(): string {
  return 'stats:*';
}