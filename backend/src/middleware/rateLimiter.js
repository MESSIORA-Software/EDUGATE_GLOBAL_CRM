/**
 * Sliding window in-memory rate limiter for public endpoints (such as referral code validation).
 */
const requestCounts = new Map();

export function createRateLimiter({ windowMs = 60000, maxRequests = 30 } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = requestCounts.get(ip) || [];
    timestamps = timestamps.filter(t => t > windowStart);

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests. Please try again later.',
      });
    }

    timestamps.push(now);
    requestCounts.set(ip, timestamps);

    // Periodically clean up old IPs to prevent memory leak
    if (requestCounts.size > 5000) {
      for (const [key, ts] of requestCounts.entries()) {
        const filtered = ts.filter(t => t > windowStart);
        if (filtered.length === 0) requestCounts.delete(key);
        else requestCounts.set(key, filtered);
      }
    }

    next();
  };
}
