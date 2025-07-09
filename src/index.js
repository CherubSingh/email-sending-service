const EmailService = require('./core/EmailService');
const QueueManager = require('./queue/QueueManager');
const Logger = require('./core/Logger');

// Initialize services
const emailService = new EmailService();
const queueManager = new QueueManager(emailService, 5000); // Retry every 5 seconds

// Start background queue processor
queueManager.start();

// Simulate multiple emails
const emails = [
  {
    id: 'email-001',
    to: 'user1@example.com',
    subject: 'Welcome!',
    body: 'Thanks for joining our platform!'
  },
  {
    id: 'email-002',
    to: 'user2@example.com',
    subject: 'Reminder',
    body: 'Don\'t forget to verify your email.'
  },
  {
    id: 'email-003',
    to: 'user3@example.com',
    subject: 'Discount Inside!',
    body: 'Here’s your 20% off coupon.'
  }
];

// Attempt to send all emails
(async () => {
  for (const email of emails) {
    const result = await emailService.sendEmail(email);
    if (!result.success) {
      queueManager.enqueue(email); // Retry later if failed
    }
  }
})();
