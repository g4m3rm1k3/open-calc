# Lesson 39 — Monitoring, Logging, and Observability

## What You Will Build

Production-grade observability: structured JSON logging with request IDs, error tracking
with Sentry, a health check endpoint that validates database and Redis connectivity,
uptime monitoring, and a metrics dashboard. When something breaks in production, you have
the tools to find it in minutes, not hours.

---

## What You Need to Know First

- Lesson 11: Express middleware, request/response
- Lesson 15: Error handling, structured errors
- Lesson 31: Deployment, systemd, Nginx

---

## The Lesson

### Step 1 — The Three Pillars of Observability

**Observability** is the ability to understand a system's internal state from its external
outputs. Three pillars:

1. **Logs:** Discrete events. "User 42 completed lesson 7 at 14:32:01."
2. **Metrics:** Aggregated measurements over time. "API p95 response time is 230ms."
3. **Traces:** The path of a single request through the system. "This request took 430ms:
   20ms in auth middleware, 350ms in the database query, 60ms serializing the response."

Most production incidents are diagnosed with logs. Metrics alert you that something is
wrong. Traces tell you where. You need all three.

**CS lens — observability vs testability:**
Testability is observability at compile/test time: given inputs, you can verify outputs.
Observability is testability at runtime: given a production incident, you can reconstruct
what happened from the system's recorded state. Pure functions (Lesson 33) are testable
because they are referentially transparent. Observable systems are "testable in production."

### Step 2 — Structured Logging

**Why structured (JSON) logging:**
```
# Unstructured log
2024-01-15 14:32:01 INFO User 42 completed lesson 7, streak is now 5

# Structured log
{"timestamp":"2024-01-15T14:32:01Z","level":"info","userId":42,"lessonId":7,"streak":5,"action":"lesson_complete","requestId":"req_abc123"}
```

Unstructured logs require `grep` and regex to search. Structured logs allow SQL-like
queries: "find all requests where `userId = 42` and `action = lesson_complete`." In
Datadog, Grafana, or CloudWatch, structured logs are indexed by field.

**Pino for structured logging (already introduced in Lesson 31):**
```typescript
import pino from 'pino'

const logger = pino({
  level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
})

export { logger }
```

**Request IDs — correlating logs:**
A request ID is a unique identifier assigned to each incoming request. Every log line
for that request includes the request ID. When a user reports an error, they provide the
time and their user ID; you query logs by `requestId` to see every operation that request
performed.

```typescript
import { randomUUID } from 'crypto'

app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] as string ?? randomUUID()
  res.setHeader('x-request-id', req.id)
  next()
})

// Add to Express type declarations
declare global {
  namespace Express {
    interface Request {
      id: string
    }
  }
}

// Use in route handlers
router.post('/lessons/:id/complete', authenticate, async (req, res, next) => {
  logger.info({ requestId: req.id, userId: req.userId, lessonId: req.params['id'] }, 'lesson_complete_start')
  // ...
  logger.info({ requestId: req.id, streak: updatedStreak }, 'lesson_complete_done')
})
```

**Child loggers:**
```typescript
// Bind context to a logger so you do not repeat it on every call
const requestLogger = logger.child({ requestId: req.id, userId: req.userId })
requestLogger.info({ lessonId: 7 }, 'lesson_complete')
// Produces: {"requestId":"req_abc","userId":42,"lessonId":7,"message":"lesson_complete"}
```

### Step 3 — Error Tracking with Sentry

Logs record what happened. Sentry records what went wrong — unhandled exceptions,
with stack traces, environment context, and user information.

```bash
$ npm install @sentry/node @sentry/react-native
```

```typescript
// server/src/index.ts — initialize before routes
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env['SENTRY_DSN'],
  environment: process.env['NODE_ENV'] ?? 'development',
  tracesSampleRate: 0.1,   // sample 10% of requests for performance tracing
})

// Add Sentry's request handler before routes
app.use(Sentry.Handlers.requestHandler())

// Add Sentry's error handler AFTER routes, BEFORE your error handler
app.use(Sentry.Handlers.errorHandler())

// Your error handler remains for custom responses
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const eventId = res.sentry   // Sentry adds the event ID to the response
  logger.error({ error, requestId: req.id, sentryEventId: eventId }, 'unhandled_error')
  // ...
})
```

**`Sentry.Handlers.requestHandler()` explained:**
Sentry's request handler captures the request URL, method, IP, user agent, and (optionally)
request body for every request. When an error is captured, Sentry includes this context
automatically — you see not just the stack trace but what request triggered it.

**`tracesSampleRate: 0.1` explained:**
Performance tracing (recording the full request timeline) has overhead. `0.1` means 10%
of requests are traced. For high-traffic endpoints, tracing every request is too expensive.
For low-traffic apps, `1.0` (100%) is fine.

### Step 4 — Health Check Endpoint

A health check endpoint lets monitoring tools verify the app is alive and its dependencies
are functioning:

```typescript
router.get('/api/health', async (req, res) => {
  const checks: Record<string, { ok: boolean; error?: string }> = {}

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`
    checks['database'] = { ok: true }
  } catch (e) {
    checks['database'] = { ok: false, error: String(e) }
  }

  // Redis check
  try {
    await redis.ping()
    checks['redis'] = { ok: true }
  } catch (e) {
    checks['redis'] = { ok: false, error: String(e) }
  }

  const allOk = Object.values(checks).every(c => c.ok)

  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    checks,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})
```

**`prisma.$queryRaw\`SELECT 1\`` explained:**
The minimal database query — no table scan, just a round-trip to verify the connection.
If the database is unreachable, this throws. The health check captures the error and
returns `503 Service Unavailable` — the status code for "I am alive but not ready to serve."

**`503 Service Unavailable` vs `200 OK`:**
Load balancers and uptime monitors check the health endpoint. If the app returns `503`,
the load balancer stops routing traffic to this instance. If multiple instances all return
`503`, the monitoring alert fires. This is how infrastructure knows to restart the service
or alert on-call.

**`process.uptime()` explained:**
Returns the number of seconds the Node.js process has been running. Included in the health
response so you can see if the server just restarted (uptime < 60 seconds often indicates
a crash loop).

### Step 5 — Uptime Monitoring and Alerting

**What uptime monitors do:**
A third-party service (UptimeRobot, BetterUptime, Cronitor) sends an HTTP request to your
health endpoint every 60 seconds. If the response is not `200` within a timeout, it sends
an alert (email, Slack, PagerDuty).

This is **black-box monitoring** — testing from the outside, as users experience it.
It catches: server crashes, DNS issues, SSL certificate expiry, Nginx misconfiguration.
It does not catch: bugs that return `200` but produce wrong data.

Configure at UptimeRobot.com (free tier):
- Monitor type: HTTP
- URL: `https://api.codexapp.io/api/health`
- Interval: every 5 minutes
- Alert: email + Slack webhook

**Alerting philosophy:**
Alert on symptoms that affect users, not on causes. "API health check failing" is a user
symptom — alert on it. "Database CPU at 60%" is a cause — do not alert on it unless the
health check also fails. Cause-based alerts produce too many false positives; they desensitize
the on-call engineer. Alert only on what users experience.

---

## Connect the Pieces

The structured log with `requestId` is the same correlation ID pattern as the command
pattern's `id` in Lesson 37 (matching Worker Thread responses to requests) and the
WebSocket message ID in Lesson 34 (matching ack callbacks). All three solve the same
problem: correlating a request with its response when processing is asynchronous or
non-sequential.

The health check endpoint returning `503` when a dependency is down is the **fail-fast**
principle: report failure immediately and loudly, rather than propagating silently. The
alternative — returning `200` when the database is down — causes the load balancer to
keep routing traffic to a broken instance. Fail-fast + observable errors makes root cause
analysis faster.

Sentry's sampling (`tracesSampleRate: 0.1`) is the same probabilistic sampling as database
query plan sampling (`EXPLAIN ANALYZE` on production traffic). Collecting everything is too
expensive; sampling gives a statistically valid picture at a fraction of the cost. The
tradeoff: occasional bugs that appear only in rare code paths may not be traced. For most
bugs, 10% sampling is sufficient.

---

## What Breaks Without This

Without request IDs, debugging a production error means grepping logs for timestamps near
when the user reported the error. If two users reported errors at the same time, their log
lines are interleaved — impossible to separate. A 30-minute debugging session becomes a
4-hour one.

Without the health check endpoint, a load balancer has no way to detect that an instance's
database connection is broken. The load balancer routes traffic to the broken instance, users
receive `500` errors, but the instance looks alive (process is running, port is open). The
outage is visible to users before it is visible to the on-call engineer.

---

## Definition of Done

- [ ] Every HTTP request logs a `requestId` that appears in all log lines for that request
- [ ] Sentry is initialized and captures unhandled exceptions in production
- [ ] `GET /api/health` returns `200` with `database: { ok: true }` and `redis: { ok: true }`
- [ ] `GET /api/health` returns `503` when the database is stopped (test by stopping PostgreSQL)
- [ ] UptimeRobot (or equivalent) is configured to monitor the health endpoint
- [ ] A test exception is triggered and visible in the Sentry dashboard
- [ ] You can answer: what are the three pillars of observability?
- [ ] You can answer: what is a request ID and why is it included in every log line?
- [ ] You can answer: why does the health check return 503 instead of 200 when a dependency is down?
- [ ] You can answer: what is the "alert on symptoms, not causes" principle?
- [ ] `git commit` with a message explaining why — "Add structured logging with requestId, Sentry error tracking, and health check endpoint"
