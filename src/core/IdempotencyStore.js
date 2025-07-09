/**
 * Simple in-memory store to track sent emails by ID
 */
class IdempotencyStore {
  constructor() {
    this.sentEmailMap = new Map(); // emailId -> result
  }

  /**
   * Check if email has already been sent
   * @param {string} emailId
   * @returns {boolean}
   */
  isSent(emailId) {
    return this.sentEmailMap.has(emailId);
  }

  /**
   * Store result of sent email
   * @param {string} emailId
   * @param {object} result
   */
  markAsSent(emailId, result) {
    this.sentEmailMap.set(emailId, result);
  }

  /**
   * Get result of already sent email
   * @param {string} emailId
   * @returns {object}
   */
  getStatus(emailId) {
    return this.sentEmailMap.get(emailId);
  }
}

module.exports = IdempotencyStore;
