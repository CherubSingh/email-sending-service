/**
 * Simple fixed-window rate limiter.
 * Allows N requests per second.
 */
class RateLimiter {
  constructor(maxRequestsPerSecond) {
    this.maxRequests = maxRequestsPerSecond;
    this.timestamps = [];
  }

  /**
   * Check if a new request is allowed.
   * @returns {boolean}
   */
  isAllowed() {
    const now = Date.now();
    // Remove timestamps older than 1 second
    this.timestamps = this.timestamps.filter(ts => now - ts < 1000);

    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      return true;
    }

    return false;
  }
}

module.exports = RateLimiter;
