// tests/EmailService.test.js
const EmailService = require('../src/core/EmailService');

const mockSendEmailA = jest.fn();
const mockSendEmailB = jest.fn();

jest.mock('../src/providers/ProviderA', () => {
  return jest.fn().mockImplementation(() => ({
    name: 'ProviderA',
    sendEmail: mockSendEmailA
  }));
});

jest.mock('../src/providers/ProviderB', () => {
  return jest.fn().mockImplementation(() => ({
    name: 'ProviderB',
    sendEmail: mockSendEmailB
  }));
});

describe('EmailService', () => {
  let emailService;

  beforeEach(() => {
    emailService = new EmailService();
    emailService.rateLimiter.tokens = 5;
    emailService.idempotencyStore.sentEmails = new Map();
    emailService.statusTracker.statusMap = new Map();
    emailService.circuitBreaker.failureCounts = {};
    emailService.circuitBreaker.trippedUntil = {};
    jest.clearAllMocks();
  });

  test('should send email successfully via ProviderA', async () => {
    mockSendEmailA.mockResolvedValueOnce({ success: true, message: 'Success A' });

    const result = await emailService.sendEmail({
      id: 'email-001',
      to: 'test@example.com',
      subject: 'Test',
      body: 'Body'
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe('ProviderA');
  });

  test('should fallback to ProviderB if ProviderA fails', async () => {
    mockSendEmailA.mockResolvedValue({ success: false, message: 'Fail A' });
    mockSendEmailB.mockResolvedValueOnce({ success: true, message: 'Success B' });

    const result = await emailService.sendEmail({
      id: 'email-002',
      to: 'fallback@example.com',
      subject: 'Fallback',
      body: 'Fallback body'
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe('ProviderB');
  });

  test('should not send the same email twice (idempotency)', async () => {
    mockSendEmailA.mockResolvedValueOnce({ success: true, message: 'Sent once' });

    const email = {
      id: 'email-003',
      to: 'repeat@example.com',
      subject: 'Hello',
      body: 'again'
    };

    const first = await emailService.sendEmail(email);
    const second = await emailService.sendEmail(email);

    expect(second).toEqual(first);
  });

  test('should block email if rate limit exceeded', async () => {
    jest.spyOn(emailService.rateLimiter, 'isAllowed').mockReturnValue(false);

    const email = {
      id: 'email-limit-test-' + Date.now(),
      to: 'limit@example.com',
      subject: 'Rate',
      body: 'limit'
    };

    const result = await emailService.sendEmail(email);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Rate limit exceeded/);

    const status = emailService.getEmailStatus(email.id);
    expect(status).toEqual({
      status: 'failed',
      provider: null,
      attempts: 0,
      timestamp: expect.any(Number)
    });
  });

  test('should trip circuit breaker after multiple failures', async () => {
    mockSendEmailA.mockResolvedValue({ success: false, message: 'fail' });
    mockSendEmailB.mockResolvedValue({ success: false, message: 'fail' });

    for (let i = 0; i < 3; i++) {
      await emailService.sendEmail({
        id: `email-cb-${i}`,
        to: `fail${i}@example.com`,
        subject: 'Breaker',
        body: 'Boom'
      });
    }

    const result = await emailService.sendEmail({
      id: 'email-cb-final',
      to: 'blocked@example.com',
      subject: 'Final',
      body: 'fail again'
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/circuit breaker/);
  });

  test('should correctly update status during retries', async () => {
    mockSendEmailA
      .mockResolvedValueOnce({ success: false, message: 'fail' })
      .mockResolvedValueOnce({ success: true, message: 'finally' });

    const email = {
      id: 'email-status-001',
      to: 'status@example.com',
      subject: 'Status',
      body: 'Testing retry status'
    };

    const result = await emailService.sendEmail(email);

    const status = emailService.getEmailStatus(email.id);
    expect(status).toMatchObject({
      status: 'sent',
      provider: 'ProviderA',
      attempts: 2,
      timestamp: expect.any(Number)
    });
    expect(result.success).toBe(true);
  });

  test('should fallback and fail if both providers fail', async () => {
    mockSendEmailA.mockResolvedValue({ success: false });
    mockSendEmailB.mockResolvedValue({ success: false });

    const result = await emailService.sendEmail({
      id: 'email-both-fail',
      to: 'fail@example.com',
      subject: 'Failure',
      body: 'All down'
    });

    expect(result.success).toBe(false);
    const status = emailService.getEmailStatus('email-both-fail');
    expect(status).toMatchObject({
      status: 'failed',
      provider: null,
      attempts: 6,
      timestamp: expect.any(Number)
    });
  });
});
