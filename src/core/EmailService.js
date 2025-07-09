const ProviderA = require('../providers/ProviderA');
const ProviderB = require('../providers/ProviderB');

const IdempotencyStore = require('./IdempotencyStore');
const RateLimiter = require('./RateLimiter');
const StatusTracker = require('./StatusTracker');
const CircuitBreaker = require('./CircuitBreaker');
const logger = require('./Logger');

class EmailService {
  constructor() {
    this.primaryProvider = new ProviderA();
    this.fallbackProvider = new ProviderB();
    this.maxRetries = 3;
    this.initialDelay = 200; // in ms

    this.idempotencyStore = new IdempotencyStore();
    this.rateLimiter = new RateLimiter(5); // 5 requests per second
    this.statusTracker = new StatusTracker();
    this.circuitBreaker = new CircuitBreaker(3, 10000); // 3 failures, 10s reset
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async sendWithRetry(provider, email) {
    let attempt = 0;
    let delay = this.initialDelay;

    if (this.circuitBreaker.isTripped(provider.name)) {
      logger.warn(`Skipping ${provider.name} due to circuit breaker tripped.`);
      return { success: false, message: `[${provider.name}] Skipped: circuit breaker tripped.` };
    }

    while (attempt < this.maxRetries) {
      logger.info(`Attempt ${attempt + 1} to send email via ${provider.name} to ${email.id}`);

      let result;
      try {
        result = await provider.sendEmail(email);
      } catch (error) {
        result = { success: false, message: error.message || 'Unknown error occurred' };
      }

      const isSuccess = result?.success === true;
      this.statusTracker.setStatus(email.id, {
        status: isSuccess ? 'sent' : 'retrying',
        provider: provider.name,
        attempts: attempt + 1
      });

      if (isSuccess) {
        this.circuitBreaker.reset(provider.name);
        return { ...result, provider: provider.name, attempts: attempt + 1 };
      } else {
        this.circuitBreaker.recordFailure(provider.name);
        const errorMessage = result?.message || 'Unknown failure';
        logger.warn(`[${provider.name}] Attempt ${attempt + 1} failed: ${errorMessage}`);        
        await this.delay(delay);
        delay *= 2;
        attempt++;
      }
    }

    logger.error(`[${provider.name}] All attempts failed after ${this.maxRetries} retries.`);
    return { success: false, message: `/Rate limit exceeded/` };
  }

  async sendEmail(email) {
    logger.info(`\n📤 Request to send email to: ${email.to}`);

    if (!this.rateLimiter.isAllowed()) {
      const errorMessage = '🚫 Rate limit exceeded. Please try again later.';
      logger.error(errorMessage);
      this.statusTracker.setStatus(email.id, {
        status: 'failed',
        provider: null,
        attempts: 0
      });
      return { success: false, message: errorMessage };
    }

    if (this.idempotencyStore.isSent(email.id)) {
      logger.warn(`📧 Email with ID ${email.id} has already been sent.`);
      return this.idempotencyStore.getStatus(email.id);
    }

    let result = await this.sendWithRetry(this.primaryProvider, email);

    if (!result.success) {
      logger.warn(`⚠️ Primary provider failed. Switching to fallback provider.`);
      result = await this.sendWithRetry(this.fallbackProvider, email);
    }

    this.idempotencyStore.markAsSent(email.id, result);

    if (result.success) {
      logger.info(`✅ Email sent successfully via ${result.provider} in ${result.attempts} attempt(s).\n`);
      this.statusTracker.setStatus(email.id, {
        status: 'sent',
        provider: result.provider,
        attempts: result.attempts
      });
    } else {
      logger.error(`❌ Email failed to send via both providers.\n`);
      this.statusTracker.setStatus(email.id, {
        status: 'failed',
        provider: null,
        attempts: this.maxRetries * 2
      });
    }
    return result;
  }

  getEmailStatus(emailId) {
    logger.info(`📜 Fetching status for email ID: ${emailId}`);
    return this.statusTracker.getStatus(emailId);
  }
}

module.exports = EmailService;