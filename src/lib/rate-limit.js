/**
 * Simple in-memory rate limiter for Next.js API routes
 * Used for mitigating simple DOS/DDOS and brute force attacks
 */

const rateLimitMap = new Map();

export default function createRateLimiter({ interval = 60000, max = 5 } = {}) {
  return {
    check: (limit, ip) => {
      return new Promise((resolve, reject) => {
        const tokenCount = rateLimitMap.get(ip) || [0];
        if (tokenCount[0] === 0) {
          rateLimitMap.set(ip, [1]);
          setTimeout(() => {
            rateLimitMap.delete(ip);
          }, interval);
          return resolve();
        }
        
        if (tokenCount[0] >= limit) {
          return reject(new Error('Rate limit exceeded'));
        }
        
        tokenCount[0] += 1;
        rateLimitMap.set(ip, tokenCount);
        return resolve();
      });
    },
  };
}

/**
 * Fixed-window limiter: rateLimit("login:1.2.3.4", 10, 600000) → false once the key
 * has been used `max` times in the window. In-memory (per server instance).
 */
const windows = new Map();
export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    if (windows.size > 5000) {
      for (const [k, v] of windows) if (v.resetAt <= now) windows.delete(k);
    }
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}
