/**
 * Abstract class representing an Email Provider.
 * All email providers should extend this class and implement the sendEmail method.
 */
class EmailProvider {
  constructor(name) {
    if (new.target === EmailProvider) {
      throw new TypeError("Cannot instantiate abstract class EmailProvider directly");
    }
    this.name = name;
  }

  /**
   * Simulate sending an email.
   * @param {Object} email - The email object containing { to, subject, body, id }
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async sendEmail(email) {
    throw new Error("sendEmail() must be implemented by subclass");
  }
}

module.exports = EmailProvider;