/**
 * Memory-backed sliding window rate limiter for API endpoints
 */
const rateMap = new Map<string, number[]>();

export function checkRateLimit(ipOrUserId: string, maxRequests = 60, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = rateMap.get(ipOrUserId) || [];
  const validTimestamps = timestamps.filter((ts) => ts > windowStart);

  if (validTimestamps.length >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  validTimestamps.push(now);
  rateMap.set(ipOrUserId, validTimestamps);

  return {
    allowed: true,
    remaining: maxRequests - validTimestamps.length,
  };
}
