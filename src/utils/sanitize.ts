/**
 * Utility functions for sanitizing inputs to prevent XSS and other security issues
 */

// Sanitize input strings to prevent XSS
export function sanitizeInput(input: any): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Basic sanitization
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .trim();
}

// Sanitize MongoDB queries to prevent NoSQL injection
export function sanitizeQuery(query: Record<string, any>): Record<string, any> {
  const sanitizedQuery: Record<string, any> = {};
  
  Object.keys(query).forEach(key => {
    // Sanitize keys
    const sanitizedKey = sanitizeInput(key);
    
    // Sanitize values
    let value = query[key];
    if (typeof value === 'string') {
      value = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      value = sanitizeQuery(value);
    }
    
    sanitizedQuery[sanitizedKey] = value;
  });
  
  return sanitizedQuery;
}
