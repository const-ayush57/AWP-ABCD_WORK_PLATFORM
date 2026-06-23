import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimiter } from "@/lib/rate-limiter";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ maxRequests: 3, windowMs: 60_000 });
  });

  it("allows requests under the limit", () => {
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
  });

  it("blocks the 4th request when maxRequests=3", () => {
    limiter.check("client-1");
    limiter.check("client-1");
    limiter.check("client-1");

    const result = limiter.check("client-1");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThanOrEqual(0);
    }
  });

  it("tracks clients independently", () => {
    limiter.check("client-1");
    limiter.check("client-1");
    limiter.check("client-1");

    // client-1 is blocked
    expect(limiter.check("client-1").allowed).toBe(false);
    // client-2 is fresh
    expect(limiter.check("client-2").allowed).toBe(true);
  });

  it("allows requests again after the window expires", () => {
    vi.useFakeTimers();

    limiter.check("client-1");
    limiter.check("client-1");
    limiter.check("client-1");
    expect(limiter.check("client-1").allowed).toBe(false);

    // Fast-forward past the window
    vi.advanceTimersByTime(61_000);
    expect(limiter.check("client-1").allowed).toBe(true);

    vi.useRealTimers();
  });

  it("reset() clears a specific client's state", () => {
    limiter.check("client-1");
    limiter.check("client-1");
    limiter.check("client-1");
    expect(limiter.check("client-1").allowed).toBe(false);

    limiter.reset("client-1");
    expect(limiter.check("client-1").allowed).toBe(true);
  });

  it("clearAll() clears all client state", () => {
    limiter.check("client-1");
    limiter.check("client-1");
    limiter.check("client-1");
    limiter.check("client-2");
    limiter.check("client-2");
    limiter.check("client-2");

    expect(limiter.check("client-1").allowed).toBe(false);
    expect(limiter.check("client-2").allowed).toBe(false);

    limiter.clearAll();

    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-2").allowed).toBe(true);
  });

  it("provides retryAfterMs when rate limited", () => {
    vi.useFakeTimers();

    limiter.check("client-1");
    limiter.check("client-1");
    limiter.check("client-1");

    const result = limiter.check("client-1");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      // retryAfterMs should be roughly the window size (60s)
      expect(result.retryAfterMs).toBeLessThanOrEqual(60_000);
      expect(result.retryAfterMs).toBeGreaterThan(0);
    }

    vi.useRealTimers();
  });
});
