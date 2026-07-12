---
series: debugging-fundamentals
level: 3
title: Logging and Observability
lang: javascript
---

# Logging and Observability

The debugger pauses a running program so you can inspect it. Logging records what a program did so you can inspect it afterwards. The debugger is for development. Logs are for production. In production, you cannot pause the program — users are using it. When something goes wrong, the logs are the only record of what happened.

**Observability** is the property of a system that tells you what it is doing by looking at its outputs. A program with good observability produces logs, metrics, and traces that let you reconstruct what happened in any given execution without needing to reproduce it. A program with poor observability is a black box: when it fails, you have no information about why.

By the end of this lesson you will understand structured logging, log levels, what to log and what not to log, and how to use logs for effective debugging.

## Log levels: filtering signal from noise

Not all log messages are equally important. Log levels create a hierarchy that lets you filter messages by severity — seeing all detail in development, only critical events in production.

```text
LOG LEVELS (lowest to highest severity):

  DEBUG   — fine-grained detail for diagnosing specific problems.
    "Processing item 3 of 100: { id: 'prod-42', price: 19.99 }"
    NOT for production. Too verbose. Contains data not suitable for logs at scale.

  INFO    — normal operation events worth recording.
    "Server started on port 3000"
    "User logged in: userId=u_123"
    "Payment processed: orderId=ord-456, amount=$29.99"

  WARN    — something unexpected happened but the system recovered.
    "Cache miss for key 'user:123' — falling back to database"
    "Retry 2/3 for external API call"

  ERROR   — something failed and needs attention.
    "Payment failed: orderId=ord-456, reason=card_declined"
    "Database connection lost — retrying in 5s"

  FATAL   — system cannot continue. Immediate attention required.
    "Cannot bind to port 3000: permission denied. Exiting."

Production configuration:
  Development: DEBUG and above (see everything)
  Staging:     INFO and above (see normal operations and problems)
  Production:  WARN and above (only problems — reduce log volume and cost)
```

## Structured logging: logs machines can read

A plain text log message is readable by humans but not by machines. Structured logging formats messages as JSON (or another parseable format) so that log aggregation tools (Datadog, Splunk, CloudWatch) can index, filter, and alert on specific fields.

```javascript
// Unstructured log: only a human can parse this
console.log(`Payment failed for user u_123: card declined, amount 29.99, orderId ord-456`)

// Structured log: machine-readable and human-readable
const logger = {
  info:  (msg, data = {}) => console.log(JSON.stringify({ level: 'INFO',  msg, ...data, ts: Date.now() })),
  warn:  (msg, data = {}) => console.log(JSON.stringify({ level: 'WARN',  msg, ...data, ts: Date.now() })),
  error: (msg, data = {}) => console.error(JSON.stringify({ level: 'ERROR', msg, ...data, ts: Date.now() })),
}

logger.error('Payment failed', {
  userId:  'u_123',
  orderId: 'ord-456',
  amount:  29.99,
  reason:  'card_declined',
})
```

```text
Output:
  {"level":"ERROR","msg":"Payment failed","userId":"u_123","orderId":"ord-456",
   "amount":29.99,"reason":"card_declined","ts":1720000000000}

What a log aggregation tool can now do:
  Filter by level:   level:ERROR → show only errors
  Filter by field:   userId:u_123 → show all events for this user
  Filter by field:   reason:card_declined → show all declined payments
  Alert on:          level:ERROR count > 10 in 1 minute → page on-call engineer
  Chart:             reason:card_declined count over time → see trends

With unstructured logging, all of these require writing regex parsers.
With structured logging, they are standard queries.
```

**CS lens:** Structured logging is the application of the **data vs code** distinction to observability: a parseable format (JSON) separates the data (the fields) from the message (the shape), enabling programmatic processing. The same principle underlies CSV vs free-text, SQL vs plain files, and machine-readable APIs vs scraping HTML. Any time you want a machine to process output intended for humans, structure it first.

## What to log — and what not to

```text
LOG:
  ✓ Request/response boundaries: "received request", "sent response", duration, status code
  ✓ External system calls: database queries (without data), API calls, cache hits/misses
  ✓ Business events: payment processed, user signed up, order placed
  ✓ Errors with context: what failed, which entity, why (the error message)
  ✓ Configuration at startup (with secrets redacted)
  ✓ System lifecycle events: startup, shutdown, configuration reload

DO NOT LOG:
  ✗ Passwords, tokens, session IDs, API keys — these belong to the user, not the log
  ✗ Credit card numbers, SSNs, health data — regulated by law (PCI, HIPAA, GDPR)
  ✗ Every function entry and exit in production — O(calls) log volume, unusable
  ✗ Large data payloads — log the ID or a summary, not the full payload
  ✗ Irreversible state changes without a transaction ID — you need to correlate events

REDACTING IN PRACTICE:
  const safeConfig = { ...config, apiKey: '[REDACTED]', dbPassword: '[REDACTED]' }
  logger.info('Starting with config', safeConfig)
```

## Correlation IDs: connecting related log entries

A single user request often generates dozens of log entries across multiple functions and services. A **correlation ID** (also called request ID or trace ID) is a unique identifier generated at the start of a request and included in every log entry it produces. This makes it possible to filter all log entries for a specific request.

```javascript
function handleRequest(req, res) {
  const requestId = crypto.randomUUID()   // unique per request

  logger.info('Request started', {
    requestId,
    method: req.method,
    path:   req.path,
  })

  try {
    const result = processOrder(req.body, requestId)   // pass requestId through
    logger.info('Request completed', { requestId, statusCode: 200 })
    res.json(result)
  } catch (err) {
    logger.error('Request failed', { requestId, error: err.message })
    res.status(500).json({ error: 'Internal error', requestId })   // return to client too
  }
}

function processOrder(order, requestId) {
  logger.info('Processing order', { requestId, orderId: order.id })
  // ... all logs from here include requestId
}
```

```text
Log output for one request:
  {"level":"INFO","msg":"Request started","requestId":"abc-123","method":"POST","path":"/orders"}
  {"level":"INFO","msg":"Processing order","requestId":"abc-123","orderId":"ord-789"}
  {"level":"ERROR","msg":"Payment declined","requestId":"abc-123","reason":"insufficient_funds"}
  {"level":"ERROR","msg":"Request failed","requestId":"abc-123","error":"Payment declined"}

Query in log tool: requestId:abc-123 → all four entries for this request, in order.
Without correlation ID: you see four separate errors with no way to know they are related.
```

**SE lens:** Correlation IDs are the minimum viable observability feature for any HTTP service. Without them, a user reporting "I got an error at 2:47 PM" produces: search all ERROR logs near 2:47 PM → find dozens of errors from hundreds of concurrent users → no way to identify which error was theirs. With correlation IDs: the client returns the requestId in the error response; the user includes it in the bug report; one query finds all 4 log entries for that specific request. This is not a nice-to-have — it is the baseline that makes production debugging possible.

**Common mistakes:**
- Logging at DEBUG level in production and wondering why costs are high — log aggregation services charge per GB ingested. DEBUG-level logging at production scale can easily generate hundreds of GB per day.
- Logging inside tight loops — O(n) log calls for n=100,000 is 100,000 log entries per invocation. Log before the loop ("processing N items") and after ("completed N items in Xms"), not inside.
- Not logging errors in catch blocks — the most common logging omission. If you catch an error and do not log it, it disappears without a trace.

**Debug tip:** When investigating a production incident, start with the earliest ERROR in the relevant time window, find its requestId (or correlation ID), and filter all logs to that ID. The full chain of events for that request — from the first INFO to the final ERROR — is your timeline. Every relevant log entry will have the same ID.

## Challenge: structured_logger

Implement a structured logger that enforces log levels.

```challenge
function createLogger(minLevel) {
  // minLevel: 'DEBUG', 'INFO', 'WARN', or 'ERROR'
  // Returns an object with methods: debug(msg, data), info(msg, data), warn(msg, data), error(msg, data)
  // Each method: if level >= minLevel, write JSON to console.log/console.error.
  // Format: { level, msg, ...data, ts: <current unix timestamp in ms> }
  // error() uses console.error. All others use console.log.
  // If level < minLevel, do nothing.
}
```

```test
const captured = []
const origLog = console.log
const origErr = console.error
console.log = (s) => captured.push(JSON.parse(s))
console.error = (s) => captured.push(JSON.parse(s))

const log = createLogger('WARN')
log.debug('debug message', { x: 1 })
log.info('info message',  { y: 2 })
log.warn('warn message',  { z: 3 })
log.error('error message', { w: 4 })

console.log = origLog
console.error = origErr

assert captured.length === 2
assert captured[0].level === 'WARN'  && captured[0].msg === 'warn message'  && captured[0].z === 3
assert captured[1].level === 'ERROR' && captured[1].msg === 'error message' && captured[1].w === 4
assert typeof captured[0].ts === 'number' && captured[0].ts > 0
```
