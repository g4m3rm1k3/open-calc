# SE Masterclass — LAB-28 — Logging System

**Language: TypeScript (Node.js)** — the capstone of Phase 2's mini-project module.

**Prerequisites:** LAB-17 (interfaces — this lab's `LogTransport` is another `Repository`-shaped contract), LAB-19 (composition — a logger is COMPOSED of transports, not one monolithic class).

**What this lab adds:**
- Log levels (`DEBUG < INFO < WARN < ERROR`) and filtering — why `console.log` everywhere doesn't scale
- Structured logging: key-value data instead of free-form interpolated strings
- Multiple transports (console, file) behind one shared interface — LAB-21's plugin idea, applied to log OUTPUT instead of text transforms
- Correlation IDs: tying multiple log lines from ONE request together, across the whole call chain

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In production, you set the minimum log level to `WARN`. A `logger.debug(...)` call still executes in your code. What should happen to its output?
> 2. `console.log("User " + userId + " logged in at " + time)` vs `logger.info("user login", { userId, time })` — what can you do with the SECOND one that you can't easily do with the first?
> 3. A single HTTP request touches 5 different functions, each logging something. How do you know, later, which 5 log lines all belong to the SAME request?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== Log Levels: Filtering ===
minimum level: INFO
logger.debug("verbose detail"): (suppressed — below minimum level)
logger.info("server started"): [INFO] server started
logger.warn("disk space low"): [WARN] disk space low
logger.error("connection failed"): [ERROR] connection failed

=== Structured Logging ===
logger.info("user login", { userId: 42, method: "password" }):
[INFO] user login {"userId":42,"method":"password"}

=== Multiple Transports ===
registered: ConsoleTransport, FileTransport
logger.info("order placed", { orderId: "o-1" }):
[console] [INFO] order placed {"orderId":"o-1"}
[file] wrote to app.log: [INFO] order placed {"orderId":"o-1"}

=== Child Logger With Bound Context ===
requestLogger = logger.child({ requestId: "req-abc123" })
requestLogger.info("handling request"):
[console] [INFO] handling request {"requestId":"req-abc123"}
requestLogger.info("request complete", { durationMs: 42 }):
[console] [INFO] request complete {"requestId":"req-abc123","durationMs":42}
  ← requestId appears on EVERY log line from this child, without repeating it manually

=== Correlation Across Multiple Functions ===
[console] [INFO] validating order {"requestId":"req-xyz789"}
[console] [INFO] charging payment {"requestId":"req-xyz789"}
[console] [INFO] order complete {"requestId":"req-xyz789"}
  ← all three lines share requestId — you can filter logs by this ID to see the whole request's story

=== Redacting Sensitive Fields ===
logger.info("user registered", { email: "a@b.com", password: "hunter2" }):
[console] [INFO] user registered {"email":"a@b.com","password":"[REDACTED]"}
```

---

### Concept: Log Levels and Filtering

**What it is:** Log messages are tagged with a **severity level** — commonly `DEBUG` (verbose, developer-only detail) `< INFO` (normal operation) `< WARN` (something's off, not broken) `< ERROR` (something failed). A logger has a configured MINIMUM level — anything below it is SUPPRESSED, not printed at all.

**The problem before:** `console.log` everywhere treats EVERY message as equally important — in production, you'd be drowning in verbose debug detail, unable to find the one `ERROR` line that actually matters; in development, you WANT the debug detail. One codebase, two very different needs, with no way to switch between them using plain `console.log`.

**The solution:** Tag every log call with a level, and let the LOGGER (not the call site) decide what actually gets printed, based on a configured threshold. This is LAB-25's config-driven behavior applied to logging — `LOG_LEVEL=debug` in development, `LOG_LEVEL=warn` in production, same code, different output.

**Project Application (The "Why" here):** This is LAB-08's O(1) short-circuit applied to observability: checking "is this level enabled?" before doing any work is cheap, and it's exactly why real logging libraries let you write `logger.debug(...)` calls freely throughout your code without worrying about performance in production — they're simply skipped.

---

## Step 1 — Levels and Filtering

```ts
// logger.ts

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  constructor(private minLevel: LogLevel = LogLevel.INFO) {}

  private log(level: LogLevel, levelName: string, message: string): void {
    if (level < this.minLevel) return              // ← add: below threshold — suppressed, do nothing
    console.log(`[${levelName}] ${message}`)
  }

  debug(message: string): void { this.log(LogLevel.DEBUG, 'DEBUG', message) }
  info(message: string): void { this.log(LogLevel.INFO, 'INFO', message) }
  warn(message: string): void { this.log(LogLevel.WARN, 'WARN', message) }
  error(message: string): void { this.log(LogLevel.ERROR, 'ERROR', message) }
}
```

```ts
// main.ts
import { Logger, LogLevel } from './logger'

console.log('=== Log Levels: Filtering ===')
const logger = new Logger(LogLevel.INFO)
console.log('minimum level: INFO')

process.stdout.write('logger.debug("verbose detail"): ')
logger.debug('verbose detail')
console.log('(suppressed — below minimum level)')

process.stdout.write('logger.info("server started"): ')
logger.info('server started')
process.stdout.write('logger.warn("disk space low"): ')
logger.warn('disk space low')
process.stdout.write('logger.error("connection failed"): ')
logger.error('connection failed')
```

### SAVE AND TRY

```bash
npx tsc --init --strict true
npx ts-node main.ts
```

**Expected:**
```
=== Log Levels: Filtering ===
minimum level: INFO
logger.debug("verbose detail"): (suppressed — below minimum level)
logger.info("server started"): [INFO] server started
logger.warn("disk space low"): [WARN] disk space low
logger.error("connection failed"): [ERROR] connection failed
```

**Confirm the numeric ordering is what makes filtering work:** `LogLevel.DEBUG = 0` is LESS than `this.minLevel` (`LogLevel.INFO = 1`), so `0 < 1` is `true`, and the function returns immediately WITHOUT printing — the entire filtering mechanism is one numeric comparison, exactly like LAB-13's state machine transition table being "just" a lookup.

**Change something:** Create a SECOND logger with `new Logger(LogLevel.ERROR)`. Confirm `.info()` and `.warn()` calls are now ALSO suppressed — only `.error()` prints. This is what a production deployment typically configures.

---

## Step 2 — Structured Logging

**What it is:** Instead of building a message by STRING CONCATENATION (`"user " + userId + " logged in"`), pass a MESSAGE and a separate DATA object — machine-parseable key-value pairs, not just human-readable prose.

**The problem before:** `console.log("User 42 logged in via password at 2026-01-01")` is easy for a HUMAN to read once, but a log-analysis tool trying to answer "how many logins used the 'password' method last week?" would need to PARSE that string back apart with regex — fragile, and different developers phrasing similar messages slightly differently makes automated analysis nearly impossible.

**The solution:** Separate the human-readable MESSAGE from the machine-queryable DATA.

```ts
// Add to logger.ts's Logger class:
private log(level: LogLevel, levelName: string, message: string, data?: Record<string, unknown>): void {
  if (level < this.minLevel) return
  const suffix = data ? ` ${JSON.stringify(data)}` : ''
  console.log(`[${levelName}] ${message}${suffix}`)
}

debug(message: string, data?: Record<string, unknown>): void { this.log(LogLevel.DEBUG, 'DEBUG', message, data) }
info(message: string, data?: Record<string, unknown>): void { this.log(LogLevel.INFO, 'INFO', message, data) }
warn(message: string, data?: Record<string, unknown>): void { this.log(LogLevel.WARN, 'WARN', message, data) }
error(message: string, data?: Record<string, unknown>): void { this.log(LogLevel.ERROR, 'ERROR', message, data) }
```

Add to `main.ts`:

```ts
console.log('\n=== Structured Logging ===')
console.log('logger.info("user login", { userId: 42, method: "password" }):')
logger.info('user login', { userId: 42, method: 'password' })
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Structured Logging ===
logger.info("user login", { userId: 42, method: "password" }):
[INFO] user login {"userId":42,"method":"password"}
```

**Confirm this is genuinely parseable:** `{"userId":42,"method":"password"}` is valid JSON — a real log-aggregation tool (Datadog, ELK, CloudWatch) can extract `userId` and `method` as SEARCHABLE, FILTERABLE fields directly, without regex-parsing a free-form sentence. This is why production logging almost always looks like this instead of `console.log`'s casual string concatenation.

---

## Step 3 — Multiple Transports

**What it is:** A **transport** is WHERE a log line ultimately goes — the console, a file, a remote logging service. LAB-21's plugin pattern, applied to log OUTPUT: the `Logger` doesn't know or care how many transports are registered, or what they each do with a log line — it just hands each line to all of them.

```ts
// transport.ts
export interface LogTransport {
  write(formatted: string): void
}

export class ConsoleTransport implements LogTransport {
  write(formatted: string): void {
    console.log(`[console] ${formatted}`)
  }
}

export class FileTransport implements LogTransport {
  private lines: string[] = []           // simulating a file — LAB-26's territory, kept in-memory for this lab
  constructor(private filename: string) {}

  write(formatted: string): void {
    this.lines.push(formatted)
    console.log(`[file] wrote to ${this.filename}: ${formatted}`)
  }
}
```

```ts
// Modify logger.ts's Logger class:
export class Logger {
  private transports: LogTransport[] = []       // ← add: LAB-21's plugin registry, reused for output instead of text transforms

  constructor(private minLevel: LogLevel = LogLevel.INFO, transports: LogTransport[] = []) {
    this.transports = transports
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport)
  }

  private log(level: LogLevel, levelName: string, message: string, data?: Record<string, unknown>): void {
    if (level < this.minLevel) return
    const suffix = data ? ` ${JSON.stringify(data)}` : ''
    const formatted = `[${levelName}] ${message}${suffix}`
    for (const transport of this.transports) {      // ← add: broadcast to EVERY registered transport
      transport.write(formatted)
    }
  }
  // debug/info/warn/error unchanged
}
```

Add to `main.ts`:

```ts
import { ConsoleTransport, FileTransport } from './transport'

console.log('\n=== Multiple Transports ===')
const multiLogger = new Logger(LogLevel.INFO)
multiLogger.addTransport(new ConsoleTransport())
multiLogger.addTransport(new FileTransport('app.log'))
console.log('registered: ConsoleTransport, FileTransport')

console.log('logger.info("order placed", { orderId: "o-1" }):')
multiLogger.info('order placed', { orderId: 'o-1' })
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Multiple Transports ===
registered: ConsoleTransport, FileTransport
logger.info("order placed", { orderId: "o-1" }):
[console] [INFO] order placed {"orderId":"o-1"}
[file] wrote to app.log: [INFO] order placed {"orderId":"o-1"}
```

**Confirm `Logger` never imports `ConsoleTransport` or `FileTransport` directly:** It only depends on `LogTransport`, the interface — LAB-17's dependency direction, once more. Adding a THIRD transport (a remote logging service, say) requires zero changes to `Logger` itself.

---

## Step 4 — Child Loggers With Bound Context

**What it is:** A **child logger** wraps a parent logger with EXTRA context data that gets automatically attached to every log call made through it — without needing to repeat that context manually every single time.

**The problem before:** Manually adding `{ requestId }` to every single `logger.info(...)` call within a request handler is repetitive and easy to forget on ONE call, breaking your ability to correlate that one line back to the request.

**The solution:**

```ts
// Add to logger.ts's Logger class:
child(context: Record<string, unknown>): Logger {
  const child = new Logger(this.minLevel, this.transports)
  const originalLog = child['log'].bind(child)
  child['log'] = (level: LogLevel, levelName: string, message: string, data?: Record<string, unknown>) => {
    originalLog(level, levelName, message, { ...context, ...data })    // merge BOUND context with per-call data
  }
  return child
}
```

Add to `main.ts`:

```ts
console.log('\n=== Child Logger With Bound Context ===')
console.log('requestLogger = logger.child({ requestId: "req-abc123" })')
const requestLogger = multiLogger.child({ requestId: 'req-abc123' })

console.log('requestLogger.info("handling request"):')
requestLogger.info('handling request')

console.log('requestLogger.info("request complete", { durationMs: 42 }):')
requestLogger.info('request complete', { durationMs: 42 })
console.log('  ← requestId appears on EVERY log line from this child, without repeating it manually')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Child Logger With Bound Context ===
requestLogger = logger.child({ requestId: "req-abc123" })
requestLogger.info("handling request"):
[console] [INFO] handling request {"requestId":"req-abc123"}
[file] wrote to app.log: [INFO] handling request {"requestId":"req-abc123"}
requestLogger.info("request complete", { durationMs: 42 }):
[console] [INFO] request complete {"requestId":"req-abc123","durationMs":42}
[file] wrote to app.log: [INFO] request complete {"requestId":"req-abc123","durationMs":42}
  ← requestId appears on EVERY log line from this child, without repeating it manually
```

**Confirm per-call data MERGES with bound context, rather than replacing it:** The second call's `{ durationMs: 42 }` appears ALONGSIDE `requestId`, not instead of it — `{ ...context, ...data }` (LAB-25's `mergeConfig` pattern, reused) layers per-call data ON TOP of the bound context, exactly like LAB-25 layered config sources.

---

### Concept: Correlation IDs

**What it is:** A **correlation ID** (often `requestId` or `traceId`) is a unique identifier generated once, at the START of handling a request, then threaded through EVERY function that request touches — so every log line from anywhere in the call chain can be filtered/grouped back into "everything that happened for THIS one request."

**Where you will see this:** LAB-45 (REST API) and LAB-51 (WebSocket Server) both need this in real deployments — a production server handles THOUSANDS of concurrent requests, and without a correlation ID, log lines from different simultaneous requests are hopelessly interleaved with no way to tell which lines belong together.

---

## Step 5 — Correlation Across Functions

```ts
function validateOrder(log: Logger): void {
  log.info('validating order')
}
function chargePayment(log: Logger): void {
  log.info('charging payment')
}
function completeOrder(log: Logger): void {
  log.info('order complete')
}

function handleOrderRequest(requestId: string, baseLogger: Logger): void {
  const log = baseLogger.child({ requestId })    // created ONCE, threaded through every function that needs it
  validateOrder(log)
  chargePayment(log)
  completeOrder(log)
}
```

Add to `main.ts`:

```ts
console.log('\n=== Correlation Across Multiple Functions ===')
handleOrderRequest('req-xyz789', new Logger(LogLevel.INFO, [new ConsoleTransport()]))
console.log("  ← all three lines share requestId — you can filter logs by this ID to see the whole request's story")
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Correlation Across Multiple Functions ===
[console] [INFO] validating order {"requestId":"req-xyz789"}
[console] [INFO] charging payment {"requestId":"req-xyz789"}
[console] [INFO] order complete {"requestId":"req-xyz789"}
  ← all three lines share requestId — you can filter logs by this ID to see the whole request's story
```

**Confirm none of `validateOrder`/`chargePayment`/`completeOrder` mention `requestId` directly:** They each just call `log.info(...)` on whatever `Logger` they were HANDED — the `requestId` binding happened ONCE, in `handleOrderRequest`, via `child()`. This is LAB-20's dependency injection again: the functions depend on "a logger," injected in, without needing to know or manage WHERE its bound context came from.

---

## 🎯 Challenge: Redact Sensitive Fields

**You know:** LAB-21's plugin pipeline transformed data through a chain. A redaction step can run BEFORE data reaches any transport.

**Task:** Modify `Logger`'s `log` method so any field literally named `password` (or matching a configurable list of sensitive keys) is replaced with `"[REDACTED]"` before being formatted and sent to transports.

<details>
<summary>▶ Show Solution</summary>

```ts
// Add to logger.ts:
const SENSITIVE_KEYS = ['password', 'token', 'secret']

function redact(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    result[key] = SENSITIVE_KEYS.includes(key) ? '[REDACTED]' : value
  }
  return result
}

// Modify log() to call redact() on data before JSON.stringify:
private log(level: LogLevel, levelName: string, message: string, data?: Record<string, unknown>): void {
  if (level < this.minLevel) return
  const safeData = data ? redact(data) : undefined
  const suffix = safeData ? ` ${JSON.stringify(safeData)}` : ''
  const formatted = `[${levelName}] ${message}${suffix}`
  for (const transport of this.transports) transport.write(formatted)
}
```

**Key insight:** Redaction happens at ONE central point — inside `log()`, before ANY transport sees the data — rather than requiring every single call site to remember to redact sensitive fields manually. This mirrors LAB-25's config validation happening at ONE boundary rather than scattered everywhere: a security-relevant safeguard should be structurally impossible to forget, not dependent on every developer remembering it at every call site.

</details>

Add to `main.ts`:

```ts
console.log('\n=== Redacting Sensitive Fields ===')
console.log('logger.info("user registered", { email: "a@b.com", password: "hunter2" }):')
multiLogger.info('user registered', { email: 'a@b.com', password: 'hunter2' })
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Redacting Sensitive Fields ===
logger.info("user registered", { email: "a@b.com", password: "hunter2" }):
[console] [INFO] user registered {"email":"a@b.com","password":"[REDACTED]"}
[file] wrote to app.log: [INFO] user registered {"email":"a@b.com","password":"[REDACTED]"}
```

---

## Mental Model: Where This Shows Up

| Real system | This lab's equivalent |
|---|---|
| Winston, Pino (Node.js logging libraries) | `Logger`, `LogLevel`, transports — nearly identical concepts |
| Datadog, ELK, CloudWatch Logs | Consume structured JSON logs exactly like Step 2's output |
| Distributed tracing (OpenTelemetry) | Correlation IDs, generalized across MULTIPLE services, not just multiple functions |
| Every production incident investigation | "Grep the logs for this requestId" — Step 5's whole point |

---

## Module 2 Complete — Phase 2 Complete

You've now built eight systems that appear in nearly every real production codebase: a **plugin system**, an **event bus**, a **command pattern**, an **undo/redo stack**, a **configuration system**, a **serialization engine**, a **testing framework**, and a **logging system** — all built on the architectural foundations from Module 1 (modules/interfaces, SOLID, composition, dependency injection). None of these were taught as abstract theory; each one is something you will recognize, and reach for, in every codebase you touch from here forward.

---

## Final Check

| Feature | How to verify |
|---|---|
| Messages below the minimum level are suppressed | Step 1 |
| Structured data appears as parseable JSON alongside the message | Step 2 |
| Multiple transports each receive every log line | Step 3 |
| A child logger's bound context appears on every one of its log calls | Step 4 |
| Per-call data merges with, rather than replaces, bound context | Step 4 |
| One correlation ID appears across log lines from several different functions | Step 5 |
| Sensitive fields are redacted before reaching any transport | Challenge |

---

## Quick Check Answers

**1. `logger.debug(...)` still executes in code, but minimum level is `WARN` — what happens?**

The function call still runs, but `log()`'s FIRST check (`if (level < this.minLevel) return`) exits immediately, before any formatting or transport writing happens — the DEBUG line is suppressed, cheaply, without ever reaching `console.log` or any file write. This is why logging libraries encourage liberal use of `.debug()` throughout code — the cost of a suppressed call is one cheap numeric comparison, not the full cost of formatting and writing output.

**2. String concatenation vs. `logger.info(message, data)` — what's the practical difference?**

The structured version (Step 2) produces MACHINE-PARSEABLE key-value data (`{"userId":42,"method":"password"}`) that a log-analysis tool can query directly — "show me all logins where `method = 'password'`" — without regex-parsing free-form sentences. String concatenation produces something a HUMAN can read once, but loses the field BOUNDARIES the moment it's flattened into one string, making automated analysis fragile or impossible at scale.

**3. One request touches 5 functions — how do you know which log lines belong together, later?**

A correlation ID (`requestId`), generated ONCE at the start of handling that request and threaded through every function via a CHILD LOGGER (Step 4–5) — every log line produced through that child automatically carries the same `requestId`, so filtering your log storage by that one value later reconstructs the FULL story of that specific request, even among thousands of other concurrent requests' interleaved log lines.

---

*Phase 2 complete. Next: [Phase 3 — Frontend Systems](../../phase-03-frontend-systems/README.md), starting with [LAB-29 — Raw DOM Manipulation](../../phase-03-frontend-systems/module-01-raw-dom/LAB-29-raw-dom-manipulation.md)*
