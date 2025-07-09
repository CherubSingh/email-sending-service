## 📧 Resilient Email Sending Service
A Node.js service for sending emails using multiple providers with built-in retry logic, fallback, rate limiting, idempotency, status tracking, and an optional circuit breaker mechanism.

## Features
1) Retry with exponential backoff
2) Fallback to secondary provider
3) Idempotency (avoid resending the same email)
4) Status tracking per email (sent, failed, retrying)
5) Rate limiting (e.g., 5 req/sec)
6) Circuit breaker to avoid retrying failing providers

## Setup Instructions
1) Clone the repository
    - git clone https://github.com/CherubSingh/email-sending-service.git
    - cd resilient-email-service

2) Install dependencies
    - npm install

3) Run tests(uses Jest for unit testing)
    - npm test


## Assumptions
- Each email has a unique id for idempotency.

- ProviderA and ProviderB simulate external email services and have a sendEmail(email) method that returns a Promise<{ success: boolean, message: string }>

- Email delivery is attempted on ProviderA first, then fallbacks to ProviderB if needed.

- Retry attempts are spaced using exponential backoff.

- If both providers fail, the system logs and tracks the failure.

- Circuit breaker prevents retrying a failing provider for a cool-off period.
