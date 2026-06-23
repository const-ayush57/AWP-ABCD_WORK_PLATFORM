// ──────────────────────────────────────────────────────────────────────────────
// In-memory sliding-window rate limiter.
//
// Designed for a single-process LAN-only desktop app (Electron + Next.js).
// Each route gets its own RateLimiter instance keyed by client IP.
//
// NOT suitable for distributed / multi-process environments — use Redis or
// a shared store in that case.
// ──────────────────────────────────────────────────────────────────────────────

interface RateLimiterConfig {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

interface ClientBucket {
  /** Timestamps of requests within the current window. */
  timestamps: number[];
}

export class RateLimiter {
  private config: RateLimiterConfig;
  private clients: Map<string, ClientBucket> = new Map();

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  /**
   * Check whether a request from `clientKey` should be allowed.
   *
   * @returns `{ allowed: true }` if under the limit, or
   *          `{ allowed: false, retryAfterMs }` if rate-limited.
   */
  check(clientKey: string): { allowed: true } | { allowed: false; retryAfterMs: number } {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    let bucket = this.clients.get(clientKey);

    if (!bucket) {
      bucket = { timestamps: [] };
      this.clients.set(clientKey, bucket);
    }

    // Prune timestamps outside the window
    bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

    if (bucket.timestamps.length >= this.config.maxRequests) {
      // Earliest timestamp in window — when it expires, one slot opens
      const oldestInWindow = bucket.timestamps[0];
      const retryAfterMs = oldestInWindow + this.config.windowMs - now;
      return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 0) };
    }

    // Allowed — record this request
    bucket.timestamps.push(now);
    return { allowed: true };
  }

  /**
   * Reset the limiter for a specific client (useful after successful auth).
   */
  reset(clientKey: string): void {
    this.clients.delete(clientKey);
  }

  /**
   * Clear all stored state (useful for testing).
   */
  clearAll(): void {
    this.clients.clear();
  }
}

// ─── Pre-configured instances for sensitive endpoints ────────────────────────

/** Recovery endpoints: 5 requests per 15 minutes */
export const recoveryLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

/** Master key recovery: 3 requests per 30 minutes */
export const masterKeyLimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 30 * 60 * 1000, // 30 minutes
});

/** OTP verification: 10 attempts per 15 minutes (prevents brute-force) */
export const otpVerifyLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
});
