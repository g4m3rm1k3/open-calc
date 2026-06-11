# Lesson 19 — Circuit Breaker and Rate Limiting

## What You Will Build

When the execution server is down, Run clicks on Go and Rust blocks show a clear message
instantly — not a 30-second hang waiting for a timeout. After 3 failures, the circuit
opens: subsequent clicks bypass the network entirely and show "Remote execution unavailable
— retrying in 30s." After 30 seconds, the circuit half-opens and makes one trial request.
The server also enforces 10 requests per minute per IP.

---

## What You Need to Know First

- Lesson 18: `RemoteExecutor`, the execution API server, Express, HTTP status codes
- Lesson 13: `FallbackExecutor`, the chain of responsibility

---

## The Lesson

### Step 1 — The Circuit Breaker Pattern

**Why it exists:**
Without a circuit breaker, a failing dependency causes cascading damage. Each request to
a down server waits for a timeout (typically 10–30 seconds) before failing. If 100
students click Run simultaneously while the server is down, 100 requests pile up, each
waiting 30 seconds. The server comes back up and is immediately overwhelmed by 100
simultaneous retries — it may go down again.

The circuit breaker prevents this:
- After a threshold of failures, the breaker **opens** — requests are rejected immediately
  without attempting the network call
- After a cooldown period, the breaker **half-opens** — one trial request is allowed
- If the trial succeeds, the breaker **closes** — normal operation resumes
- If the trial fails, the breaker opens again for another cooldown period

**CS lens:** The circuit breaker is a state machine with three states. This is the same
concept as the `RunState` FSM in the code block (Lesson 5) and the loading state in
`ChapterView` (Lesson 3) — a formal state machine with named states and defined transitions.

```
CLOSED ──(3 failures)──→ OPEN ──(30s cooldown)──→ HALF-OPEN
  ↑                                                    │
  └──────────(trial succeeds)──────────────────────────┘
  (if trial fails → OPEN again)
```

**SE lens:** The circuit breaker is a **resilience pattern** — it makes systems behave
better under failure, not just prevent failures. The goal is not to fix the broken server
(we cannot control that), but to limit the damage: fast failures instead of slow ones,
protection against retry storms, and a clear signal to the user about what is wrong.

The circuit breaker is the third major SE pattern introduced in the executor package:
strategy (Lesson 6 — different executors), chain of responsibility (Lesson 13 — fallback
chain), and now circuit breaker (resilience around a specific tier).

The same pattern appears in production systems everywhere:
- Netflix's Hystrix library — circuit breakers around every microservice call
- Resilience4j (Java) — circuit breakers for Spring services
- Polly (.NET) — resilience strategies including circuit breakers

### Step 2 — The Circuit Breaker Class

In `packages/executor/src/CircuitBreaker.ts`:

```typescript
type CircuitState =
  | { status: 'closed'; failureCount: number }
  | { status: 'open'; openedAt: number }
  | { status: 'half-open' }

interface CircuitBreakerOptions {
  readonly failureThreshold: number
  readonly cooldownMs: number
}

export class CircuitBreaker {
  private state: CircuitState = { status: 'closed', failureCount: 0 }
  private readonly options: CircuitBreakerOptions

  constructor(options: CircuitBreakerOptions) {
    this.options = options
  }

  get isOpen(): boolean {
    if (this.state.status === 'open') {
      const elapsed = Date.now() - this.state.openedAt
      if (elapsed >= this.options.cooldownMs) {
        this.state = { status: 'half-open' }
        return false
      }
      return true
    }
    return false
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen) {
      const elapsed = this.state.status === 'open'
        ? Date.now() - this.state.openedAt
        : 0
      const remaining = Math.ceil((this.options.cooldownMs - elapsed) / 1000)
      throw new CircuitOpenError(
        `Remote execution unavailable — retrying in ${remaining}s`
      )
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (err) {
      if (err instanceof CircuitOpenError) throw err
      this.onFailure()
      throw err
    }
  }

  private onSuccess(): void {
    this.state = { status: 'closed', failureCount: 0 }
  }

  private onFailure(): void {
    if (this.state.status === 'closed') {
      const newCount = this.state.failureCount + 1
      if (newCount >= this.options.failureThreshold) {
        this.state = { status: 'open', openedAt: Date.now() }
      } else {
        this.state = { status: 'closed', failureCount: newCount }
      }
    } else {
      this.state = { status: 'open', openedAt: Date.now() }
    }
  }
}

export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CircuitOpenError'
  }
}
```

**`get isOpen` as a getter explained:**
A getter is a property that computes its value on access. `if (this.isOpen)` calls
`isOpen` as if it were a property, but it executes as a method. Getters are appropriate
for computed properties that have no side effects and are cheap to compute. Here,
`isOpen` also transitions the state from OPEN to HALF-OPEN when the cooldown expires —
the transition happens naturally as part of reading the state.

**The `CircuitOpenError` class explained:**
A custom error class allows callers to distinguish circuit-open failures from other errors.
`FallbackExecutor` catches errors and tries the next executor. Without a custom error class,
it would try the next executor when the circuit is open — defeating the purpose. The check
`if (err instanceof CircuitOpenError) throw err` in the `call` method re-throws without
trying to fall back. The `FallbackExecutor` must also propagate `CircuitOpenError`.

**CS lens:** The circuit breaker's state machine is implemented as a discriminated union
(`CircuitState`). TypeScript narrows the type inside each `if` branch: inside
`if (this.state.status === 'open')`, TypeScript knows `this.state` has `openedAt: number`.
This is the same discriminated union pattern used for `RunState` in Lesson 5.

### Step 3 — Wrapping RemoteExecutor with the Circuit Breaker

```typescript
// In packages/executor/src/RemoteExecutor.ts

export class RemoteExecutor implements Executor {
  readonly name = 'remote'
  private readonly apiUrl: string
  private readonly breaker: CircuitBreaker

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
    this.breaker = new CircuitBreaker({
      failureThreshold: 3,
      cooldownMs: 30_000,
    })
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { language, code } = options
    const startTime = Date.now()

    return this.breaker.call(async () => {
      const response = await fetch(`${this.apiUrl}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
        signal: AbortSignal.timeout(15_000),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Remote executor returned ${response.status}: ${error}`)
      }

      const result = await response.json() as ExecutionResult
      return { ...result, durationMs: Date.now() - startTime }
    })
  }
}
```

**`AbortSignal.timeout(15_000)` explained:**
`fetch` does not have a built-in timeout. Without a timeout, a request to a server that
accepts the connection but never responds hangs indefinitely. `AbortSignal.timeout(ms)`
creates an `AbortSignal` that triggers after `ms` milliseconds, cancelling the request.
This is a modern alternative to the older `AbortController` pattern.

**`15_000` for the fetch timeout vs `10_000` for the circuit threshold:**
The fetch timeout (15s) is longer than the Docker execution timeout (10s). Docker will
kill the container after 10s and return a timeout result. The 15s gives the server time
to respond after the container is killed. If the server itself is unreachable (not just
slow), the 15s timeout fires and the circuit breaker counts a failure.

### Step 4 — Rate Limiting in the Server

In `apps/server/src/index.ts`, add rate limiting:

```typescript
import rateLimit from 'express-rate-limit'

const executionLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many execution requests — maximum 10 per minute',
    retryAfter: 60,
  },
})

app.post('/api/execute', executionLimiter, async (req, res) => {
  // ... handler unchanged
})
```

Install `express-rate-limit`:

```
$ npm install express-rate-limit --workspace=apps/server
```

**`windowMs: 60_000` explained:**
The rate limiter counts requests in a sliding window. `windowMs: 60_000` means: count
requests in the last 60,000 milliseconds (1 minute). `max: 10` means: allow at most 10
requests per window per IP. The 11th request in a minute receives a 429 Too Many Requests
response.

**`standardHeaders: true` explained:**
Standard rate limit headers are added to every response:
- `RateLimit-Limit: 10` — the maximum requests allowed
- `RateLimit-Remaining: 7` — requests remaining in the current window
- `RateLimit-Reset: 1714000000` — Unix timestamp when the window resets

The client (`RemoteExecutor`) can read `RateLimit-Remaining` to show a warning before
hitting the limit. `legacyHeaders: false` disables older non-standard headers (`X-RateLimit-*`)
that have been replaced by the standard ones.

**Handle rate limit errors in RemoteExecutor:**
```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('RateLimit-Reset')
  throw new Error(`Rate limited. ${retryAfter ? `Resets at ${new Date(Number(retryAfter) * 1000).toLocaleTimeString()}` : 'Try again in a minute.'}`)
}
```

---

## Connect the Pieces

The `CircuitBreaker` class has no knowledge of the execution system — it wraps any
async function. In Lesson 21 (search), a circuit breaker could wrap a search index
build if it failed repeatedly. The pattern is general.

The rate limiter protects against one student accidentally or intentionally overwhelming
the server. In a production deployment, rate limiting is applied per-user (via auth tokens),
not per-IP (IPs are shared behind NAT). For a development tool without auth, per-IP is sufficient.

---

## What Breaks Without This

Without the circuit breaker, 3 failed requests is 3 × 15 seconds = 45 seconds of waiting.
The student clicks Run three times, sees nothing happen for 15 seconds each time, and
concludes the app is broken. With the circuit breaker, the first failure takes 15 seconds;
the second and third open the circuit immediately; subsequent clicks fail in <1ms with a
clear message. The student knows the server is down, not that their code is wrong.

---

## Definition of Done

- [ ] Stop the server. Click Run on a Go block three times.
  - First click: waits ~15 seconds, then shows an error
  - Second click: waits ~15 seconds (second failure), shows an error
  - Third click: waits ~15 seconds (third failure, circuit opens), shows an error
  - Fourth click: shows "unavailable — retrying in 30s" immediately (<100ms)
- [ ] Wait 30 seconds. Click Run again. Circuit is HALF-OPEN; one trial request.
- [ ] Rate limit: make 11 requests in under 60 seconds. Verify 429 response.
- [ ] You can answer: what is a "retry storm" and how does the circuit breaker prevent one?
- [ ] You can answer: why is the circuit breaker in the client (`RemoteExecutor`) and not
      the server?
- [ ] `git commit` with a message explaining why
