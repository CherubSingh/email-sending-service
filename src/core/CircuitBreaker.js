/**
 * Circuit Breaker to disable a provider temporarily after repeated failures
 */
class CircuitBreaker {
  constructor(failureThreshold = 3, resetTimeout = 10000) {
    this.failureThreshold = failureThreshold; // e.g., 3 consecutive failures
    this.resetTimeout = resetTimeout;         // e.g., 10 seconds
    this.failureCountMap = new Map();         // providerName -> failure count
    this.trippedMap = new Map();              // providerName -> trip timestamp
  }

  /**
   * Records a failure for a provider
   * @param {string} providerName
   */
  recordFailure(providerName) {
    const current = this.failureCountMap.get(providerName) || 0;
    const newCount = current + 1;
    this.failureCountMap.set(providerName, newCount);

    if (newCount >= this.failureThreshold) {
      console.warn(`🛑 Circuit breaker tripped for ${providerName}`);
      this.trippedMap.set(providerName, Date.now());
    }
  }

  /**
   * Resets failure count (after success)
   * @param {string} providerName
   */
  reset(providerName) {
    this.failureCountMap.set(providerName, 0);
    this.trippedMap.delete(providerName);
  }

  /**
   * Checks if circuit is currently open for a provider
   * @param {string} providerName
   * @returns {boolean}
   */
  isTripped(providerName) {
    if (!this.trippedMap.has(providerName)) return false;

    const trippedAt = this.trippedMap.get(providerName);
    const now = Date.now();

    if (now - trippedAt >= this.resetTimeout) {
      // Cool-off complete — close the circuit
      console.log(`🔄 Circuit breaker reset for ${providerName}`);
      this.reset(providerName);
      return false;
    }

    return true;
  }
}

module.exports = CircuitBreaker;
