const EmailProvider = require('./EmailProvider');

/**
 * Mock email provider A
 * Simulates success or failure randomly
 */
class ProviderA extends EmailProvider {
  constructor() {
    super('ProviderA');
    this.name = 'ProviderA';
  }

  /**
   * Simulates sending an email with 70% success rate.
   * @param {Object} email - The email object { to, subject, body, id }
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async sendEmail(email) {
    console.log(`[${this.name}] Attempting to send email to ${email.to}...`);

    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuccess = Math.random() < 0.7; // 70% success rate
        if (isSuccess) {
          resolve({ success: true, message: `[${this.name}] Email sent successfully.` });
        } else {
          resolve({ success: false, message: `[${this.name}] Failed to send email.` });
        }
      }, 200); // Simulate delay
    });
  }
}

module.exports = ProviderA;
