/**
 * Simple in-memory rate limiter for server-side actions/APIs.
 * In production with multiple instances, use Redis.
 */

const tracker = new Map<string, { count: number; lastAttempt: number }>();

const LIMIT = 5; // Max attempts
const WINDOW = 15 * 60 * 1000; // 15 minutes window

export function checkRateLimit(identifier: string) {
  const now = Date.now();
  const record = tracker.get(identifier);

  if (!record) {
    tracker.set(identifier, { count: 1, lastAttempt: now });
    return { success: true };
  }

  // Reset if window passed
  if (now - record.lastAttempt > WINDOW) {
    tracker.set(identifier, { count: 1, lastAttempt: now });
    return { success: true };
  }

  if (record.count >= LIMIT) {
    return { 
      success: false, 
      remainingTime: Math.ceil((WINDOW - (now - record.lastAttempt)) / 60000) 
    };
  }

  record.count++;
  record.lastAttempt = now;
  return { success: true };
}

export function resetRateLimit(identifier: string) {
  tracker.delete(identifier);
}
