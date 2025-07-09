const EmailProvider = require('./EmailProvider');

/**
 * Mock email provider B
 * Simulates email sending with 85% success rate
 */
class ProviderB extends EmailProvider {
  constructor() {
    super('ProviderB');
  }

  /**
   * Simulates sending an email.
   * @param {Object} email - The email object { to, subject, body, id }
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async sendEmail(email) {
    console.log(`[${this.name}] Attempting to send email to ${email.to}...`);

    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuccess = Math.random() < 0.85; // 85% success rate
        if (isSuccess) {
          resolve({ success: true, message: `[${this.name}] Email sent successfully.` });
        } else {
          resolve({ success: false, message: `[${this.name}] Failed to send email.` });
        }
      }, 300); // Simulate longer delay
    });
  }
}

module.exports = ProviderB;
