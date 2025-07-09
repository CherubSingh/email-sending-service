const Logger = require('../core/Logger');

class QueueManager {
  constructor(emailService, interval = 5000) {
    this.queue = [];
    this.emailService = emailService;
    this.interval = interval; // retry interval in ms
    this.timer = null;
  }

  /**
   * Add an email to the queue
   * @param {Object} email
   */
  enqueue(email) {
    Logger.warn(`Queuing email ID ${email.id} for retry later.`);
    this.queue.push(email);
  }

  /**
   * Start processing the queue in the background
   */
  start() {
    if (this.timer) return;

    this.timer = setInterval(async () => {
      if (this.queue.length === 0) return;

      Logger.info(`Processing queue with ${this.queue.length} pending emails...`);
      const pending = [...this.queue];
      this.queue = []; // reset queue before retry

      for (const email of pending) {
        const result = await this.emailService.sendEmail(email);
        if (!result.success) {
          Logger.warn(`Retry failed again for ${email.id}. Re-queuing.`);
          this.queue.push(email); // push back for another round
        } else {
          Logger.success(`Email ID ${email.id} sent successfully from queue.`);
        }
      }
    }, this.interval);

    Logger.info(`📦 QueueManager started (interval = ${this.interval}ms)`);
  }

  /**
   * Stop the background queue processor
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      Logger.info(`🛑 QueueManager stopped.`);
    }
  }
}

module.exports = QueueManager;
