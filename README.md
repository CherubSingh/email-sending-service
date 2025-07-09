## 📧 Resilient Email Sending Service
A Node.js service for sending emails using multiple providers with built-in retry logic, fallback, rate limiting, idempotency, status tracking, and an optional circuit breaker mechanism.

## Features
. Retry with exponential backoff

. Fallback to secondary provider

. Idempotency (avoid resending same email)

. Status tracking per email (sent, failed, retrying)

. Rate limiting (e.g., 5 req/sec)

. Circuit breaker to avoid retrying failing providers

##  Project Structure
resilient-email-service/
│
├── src/
│ ├── core/
│ │ ├── EmailService.js
│ │ ├── IdempotencyStore.js
│ │ ├── RateLimiter.js
│ │ ├── StatusTracker.js
│ │ ├── CircuitBreaker.js
│ │ ├── Logger.js
│ │
│ ├── providers/
│ │ ├── EmailProvider.js
│ │ ├── ProviderA.js
│ │ └── ProviderB.js
│ │
│ ├── queue/
│ │ └── QueueManager.js
│ │
│ └── index.js ← Entry point
│
├── tests/ (optional)
│
├── package.json
└── README.md

## Setup Instructions
1) Clone the repository
    git clone https://github.com/CherubSingh/email-sending-service.git
    cd resilient-email-service

2) Install dependencies
    npm install

3) Run tests(uses Jest for unit testing)
    npm test


## Assumptions
. Each email has a unique id for idempotency.

. ProviderA and ProviderB simulate external email services and have a sendEmail(email) method that returns a Promise<{ success: boolean, message: string }>

. Email delivery is attempted on ProviderA first, then fallbacks to ProviderB if needed.

. Retry attempts are spaced using exponential backoff.

. If both providers fail, the system logs and tracks the failure.

. Circuit breaker prevents retrying a failing provider for a cool-off period.