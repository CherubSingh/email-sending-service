/**
 * Tracks status of each email attempt.
 * Stores by email ID: sent, failed, retried, etc.
 */
class StatusTracker {
  constructor() {
    this.statusMap = new Map(); // emailId -> status object
  }

  /**
   * Save status for a specific email
   * @param {string} emailId
   * @param {object} status - { status: 'sent' | 'failed' | 'retrying', provider, attempts, timestamp }
   */
  setStatus(emailId, status) {
    this.statusMap.set(emailId, {
      ...status,
      timestamp: Date.now()
    });
  }

  /**
   * Get the status of a specific email
   * @param {string} emailId
   * @returns {object|null}
   */
  getStatus(emailId) {
    return this.statusMap.get(emailId) || null;
  }

  /**
   * List all tracked statuses (for testing/debug)
   * @returns {object[]}
   */
  listAllStatuses() {
    return Array.from(this.statusMap.values());
  }
}

module.exports = StatusTracker;
