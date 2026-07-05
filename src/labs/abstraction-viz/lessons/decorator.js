export default {
  id: 'decorator',
  title: 'Decorator Pattern',
  tag: 'Design Pattern',
  steps: [
    {
      title: 'Base object — a plain logger',
      code:
`function createLogger() {
  return {
    log: function(msg) {
      console.log(msg)
    }
  }
}

const logger = createLogger()
logger.log('Server started')`,
      explanation: [
        '`createLogger()` returns an object with one method: `log(msg)`. Line 10 calls `logger.log(\'Server started\')` which prints the message. This is the base component — the object being decorated. It does exactly one thing: log a message to the console.',
        'CS — The Decorator pattern wraps an object, adding behaviour before or after its methods without modifying the original object\'s source code. The wrapper has the same interface as the original — callers cannot tell whether they have the original or a decorated version. This is structural composition over inheritance.',
        'SE — Decorators are everywhere in production: Express middleware (`app.use(cors())`) wraps the request handler. Python\'s `@functools.lru_cache` wraps a function. React\'s `memo()`, `forwardRef()`, and `connect()` (Redux) are all function decorators. The pattern adds cross-cutting concerns without changing core logic.',
        'Without this: without a base component, there is nothing to decorate. The decorator pattern requires a working implementation first — then we add layers on top. The base logger represents the minimal contract: every logger must implement `log(msg)`.',
      ],
      active: [
        { startLine: 1,  endLine: 7,  color: 'indigo',  label: 'createLogger — base component' },
        { startLine: 9,  endLine: 10, color: 'emerald', label: 'logger.log prints the message' },
      ],
      connections: [],
    },
    {
      title: 'Timestamp decorator — wraps log() and adds a prefix',
      code:
`function createLogger() {
  return {
    log: function(msg) {
      console.log(msg)
    }
  }
}

function withTimestamp(logger) {
  return {
    log: function(msg) {
      logger.log('[2024-01-15] ' + msg)
    }
  }
}

const logger = createLogger()
logger.log('Server started')

const tsLogger = withTimestamp(logger)
tsLogger.log('Server started')`,
      explanation: [
        '`withTimestamp(logger)` on line 9 takes the base logger and returns a new object with the same `log` interface. When `tsLogger.log(\'Server started\')` is called on line 21, the decorator\'s `log` prepends `\'[2024-01-15] \'` and delegates to `logger.log()` — the original. Line 18 prints `\'Server started\'`; line 21 prints `\'[2024-01-15] Server started\'`.',
        'CS — The decorator wraps the original by capturing it in a closure (`logger` in the outer function\'s scope) and delegating to it inside the new method. The interface is identical — both `logger` and `tsLogger` have a `log(msg)` method. The caller switches from one to the other by replacing the variable. This is transparent wrapping.',
        'SE — Express middleware is exactly this: `app.use(morgan(\'dev\'))` wraps the request handler with a logging layer. The original handler does not change. The logging happens before it. Winston (the Node.js logging library) implements its formatters as a decorator chain — each formatter wraps the next, adding timestamps, colours, and JSON serialisation in layers.',
        'Without this: without the decorator, you modify the base `log` function to add timestamps — making timestamps a permanent part of the logger. Now you can\'t have a logger without timestamps. The decorator keeps concerns separate: the base logger logs, the timestamp decorator adds time. Remove the decorator, and timestamps are gone — base logger unchanged.',
      ],
      active: [
        { startLine: 9,  endLine: 14, color: 'violet',  label: 'withTimestamp — wraps log, delegates inside' },
        { startLine: 20, endLine: 21, color: 'emerald', label: 'tsLogger has same interface — prepends timestamp' },
      ],
      connections: [{ fromLine: 12, toLine: 3, color: 'violet', label: 'decorator delegates to original log' }],
    },
    {
      title: 'Level filter decorator — only log at or above a level',
      code:
`function createLogger() {
  return {
    log: function(msg) {
      console.log(msg)
    }
  }
}

function withTimestamp(logger) {
  return {
    log: function(msg) {
      logger.log('[2024-01-15] ' + msg)
    }
  }
}

function withLevel(logger, minLevel) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 }
  return {
    log: function(msg, level) {
      level = level || 'info'
      if (levels[level] >= levels[minLevel]) {
        logger.log('[' + level.toUpperCase() + '] ' + msg)
      }
    }
  }
}

const logger = createLogger()
logger.log('Server started')

const tsLogger = withTimestamp(logger)
tsLogger.log('Server started')

const levelLogger = withLevel(createLogger(), 'warn')
levelLogger.log('debug noise', 'debug')
levelLogger.log('something happened', 'info')
levelLogger.log('disk low', 'warn')
levelLogger.log('database down', 'error')`,
      explanation: [
        '`withLevel(createLogger(), \'warn\')` creates a logger that only emits messages at `warn` level or above. Lines 36–37 are silently suppressed — `debug` (0) and `info` (1) are below `warn` (2). Lines 38–39 produce output: `\'[WARN] disk low\'` and `\'[ERROR] database down\'`. The check on line 22 compares numeric levels from the `levels` map.',
        'CS — The `levels` map converts semantic labels to integers for comparison. `levels[level] >= levels[minLevel]` is a numeric threshold check — the same pattern used in Python\'s `logging.setLevel()`, Java\'s `Log4j`, and Node\'s `pino` library. The decorator captures `minLevel` in its closure and applies the filter on every `log` call.',
        'SE — Level-based filtering is how production log volume is managed. In development you set `minLevel = \'debug\'` to see everything. In production you set `minLevel = \'warn\'` to suppress the noise. Datadog, Splunk, and CloudWatch all implement this. The decorator keeps the filter logic separate from the logger — the base logger always logs everything, and filtering is a concern added on top.',
        'Without this: without the filter decorator, you add `if (level >= minLevel)` inside every log call at every call site. When the log level needs to change, every call site must be updated. The decorator centralises the filter in one place — change it once.',
      ],
      active: [
        { startLine: 17, endLine: 26, color: 'violet',  label: 'withLevel — filters by numeric threshold' },
        { startLine: 35, endLine: 39, color: 'emerald', label: 'debug+info silenced; warn+error print' },
      ],
      connections: [],
    },
    {
      title: 'Stack decorators — timestamp + level + prefix',
      code:
`function createLogger() {
  return {
    log: function(msg) {
      console.log(msg)
    }
  }
}

function withTimestamp(logger) {
  return {
    log: function(msg) {
      logger.log('[2024-01-15] ' + msg)
    }
  }
}

function withLevel(logger, minLevel) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 }
  return {
    log: function(msg, level) {
      level = level || 'info'
      if (levels[level] >= levels[minLevel]) {
        logger.log('[' + level.toUpperCase() + '] ' + msg)
      }
    }
  }
}

function withPrefix(logger, prefix) {
  return {
    log: function(msg, level) {
      logger.log('[' + prefix + '] ' + msg, level)
    }
  }
}

const base    = createLogger()
const ts      = withTimestamp(base)
const leveled = withLevel(ts, 'warn')
const prefixed = withPrefix(leveled, 'AuthService')

prefixed.log('login attempt', 'debug')
prefixed.log('user logged in', 'info')
prefixed.log('too many attempts', 'warn')
prefixed.log('token expired', 'error')`,
      explanation: [
        'Four decorators stack: `base → ts → leveled → prefixed`. Each decorator closes over the previous. When `prefixed.log(\'too many attempts\', \'warn\')` is called: `withPrefix` adds `[AuthService]`, passes to `withLevel`; level check passes (`warn >= warn`), adds `[WARN]`, passes to `withTimestamp`; adds `[2024-01-15]`, passes to `base.log`; prints. Output: `\'[2024-01-15] [WARN] [AuthService] too many attempts\'`. Lines 41–42 are silently filtered (below `warn`).',
        'CS — The decorator chain is evaluated inside-out on each call. Calling `prefixed.log()` invokes `withPrefix.log` → `withLevel.log` → `withTimestamp.log` → `base.log`. This is the same as function composition: `base ∘ ts ∘ leveled ∘ prefixed`. Each decorator is a pure transformation layer. The order matters: put level-filtering before timestamp addition so suppressed messages don\'t waste timestamp formatting work.',
        'SE — Winston\'s transport system is exactly this: `createLogger({ transports: [new Console(), new File()], format: combine(timestamp(), colorize(), json()) })`. Each `format` is a decorator. Pino\'s `pino-multi-stream` chains transports. Morgan\'s middleware is a single-layer decorator on Express. The Decorator pattern is the architecture of every production logger.',
        'Without this: without composable decorators, each logger variation is a class: `TimestampLogger`, `LevelLogger`, `PrefixLogger`, `TimestampLevelLogger`, `TimestampPrefixLogger`, `LevelPrefixLogger`, `TimestampLevelPrefixLogger` — 7 classes for 3 features. With decorators: 3 functions, infinite combinations. This is composition vs. inheritance: composition wins.',
      ],
      active: [
        { startLine: 29, endLine: 34, color: 'indigo',  label: 'withPrefix — fourth decorator in the chain' },
        { startLine: 37, endLine: 40, color: 'violet',  label: 'four decorators stacked: base→ts→leveled→prefixed' },
        { startLine: 41, endLine: 44, color: 'emerald', label: 'debug+info suppressed, warn+error output with full prefix chain' },
      ],
      connections: [{ fromLine: 31, toLine: 30, color: 'violet', label: 'each decorator delegates down the chain' }],
    },
    {
      title: 'Decorator tracks state — call counting',
      code:
`function createLogger() {
  return {
    log: function(msg) {
      console.log(msg)
    }
  }
}

function withTimestamp(logger) {
  return {
    log: function(msg) {
      logger.log('[2024-01-15] ' + msg)
    }
  }
}

function withLevel(logger, minLevel) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 }
  return {
    log: function(msg, level) {
      level = level || 'info'
      if (levels[level] >= levels[minLevel]) {
        logger.log('[' + level.toUpperCase() + '] ' + msg)
      }
    }
  }
}

function withPrefix(logger, prefix) {
  return {
    log: function(msg, level) {
      logger.log('[' + prefix + '] ' + msg, level)
    }
  }
}

function withCallCount(logger) {
  var count = 0
  return {
    log: function(msg, level) {
      count++
      logger.log(msg, level)
    },
    getCount: function() {
      return count
    }
  }
}

const base     = createLogger()
const ts       = withTimestamp(base)
const leveled  = withLevel(ts, 'info')
const counted  = withCallCount(leveled)
const prefixed = withPrefix(counted, 'App')

prefixed.log('server ready', 'info')
prefixed.log('request received', 'info')
prefixed.log('disk low', 'warn')
console.log(counted.getCount())`,
      explanation: [
        '`withCallCount` on line 36 closes over a mutable `count` variable (line 37). Every `log` call increments it before delegating. The object returned has two methods: `log` (same interface) and `getCount` (new, decorator-only method). Line 56 prints `3` — all three log calls reached the counter (level `\'info\'` and above are all allowed by `withLevel(ts, \'info\')`). The counter is isolated in the decorator\'s closure.',
        'CS — The decorator now holds state. The closed-over `count` variable is private to the `withCallCount` call — no other code can read or mutate it except through `getCount()`. This demonstrates that decorators can extend the interface (add `getCount`) while still conforming to the base interface (`log`). The extended method is only available if the caller holds a reference to the counted decorator directly.',
        'SE — Stateful decorators are used in metrics collection. A production HTTP logger decorator counts requests, tracks latency (measures time before and after delegation), and buckets error rates. Prometheus client libraries wrap handlers in counted decorators. DataDog\'s APM agent wraps database query methods to track duration and frequency — all without touching the query logic.',
        'Without this: without the decorator, you add `count++` inside the base logger — coupling counting to logging permanently. Every logger would count, even when you don\'t want counts. The decorator makes counting optional: wrap with `withCallCount` to count, skip it and the count doesn\'t exist.',
      ],
      active: [
        { startLine: 36, endLine: 46, color: 'violet',  label: 'withCallCount — stateful decorator' },
        { startLine: 37, endLine: 37, color: 'indigo',  label: 'count — private to this decorator via closure' },
        { startLine: 56, endLine: 56, color: 'emerald', label: 'getCount() → 3 — three log calls reached the counter' },
      ],
      connections: [{ fromLine: 40, toLine: 37, color: 'indigo', label: 'count++ on every log call' }],
    },
    {
      title: 'Function decorator — wrap any function',
      code:
`function createLogger() {
  return {
    log: function(msg) {
      console.log(msg)
    }
  }
}

function withTimestamp(logger) {
  return {
    log: function(msg) {
      logger.log('[2024-01-15] ' + msg)
    }
  }
}

function withLevel(logger, minLevel) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 }
  return {
    log: function(msg, level) {
      level = level || 'info'
      if (levels[level] >= levels[minLevel]) {
        logger.log('[' + level.toUpperCase() + '] ' + msg)
      }
    }
  }
}

function withPrefix(logger, prefix) {
  return {
    log: function(msg, level) {
      logger.log('[' + prefix + '] ' + msg, level)
    }
  }
}

function withCallCount(logger) {
  var count = 0
  return {
    log: function(msg, level) {
      count++
      logger.log(msg, level)
    },
    getCount: function() {
      return count
    }
  }
}

function memoize(fn) {
  var cache = {}
  return function(arg) {
    if (cache[arg] !== undefined) return cache[arg]
    cache[arg] = fn(arg)
    return cache[arg]
  }
}

function expensiveDouble(n) {
  return n * 2
}

const fastDouble = memoize(expensiveDouble)

const base     = createLogger()
const ts       = withTimestamp(base)
const leveled  = withLevel(ts, 'info')
const counted  = withCallCount(leveled)
const prefixed = withPrefix(counted, 'App')

prefixed.log('server ready', 'info')
prefixed.log('request received', 'info')
prefixed.log('disk low', 'warn')
console.log(counted.getCount())

console.log(fastDouble(5))
console.log(fastDouble(10))
console.log(fastDouble(5))`,
      explanation: [
        '`memoize(fn)` on line 48 is a function decorator — it wraps any single-argument function. `fastDouble(5)` computes `5 * 2 = 10` and caches it. The second `fastDouble(5)` returns `10` from cache without calling `expensiveDouble` again. Lines 73–75 print `10`, `20`, `10`. `memoize` is a general-purpose decorator — it works on any function, not just loggers.',
        'CS — `memoize` is a higher-order function that returns a function: it takes `fn` and returns a new function with the same signature. The cache is a closure variable — private to this memoized version. This is the function-level decorator pattern: wrap a function in another function that intercepts calls and adds caching, logging, retry, or any other cross-cutting concern.',
        'SE — `_.memoize` in Lodash, `React.memo` (component-level), `useMemo` (value-level), and `reselect`\'s `createSelector` are all memoize decorators. Python\'s `@functools.lru_cache` is the same pattern. Express\'s `compression()` middleware is a function decorator that wraps the response to compress output. Function decorators are the most reusable form of the pattern.',
        'Without this: without the decorator, you add caching inside `expensiveDouble` — coupling the caching logic to the function permanently. `expensiveDouble` can no longer be tested without the cache. With the decorator, `expensiveDouble` is pure: given 5, always returns 10. The cache is separate. You can test both independently.',
      ],
      active: [
        { startLine: 48, endLine: 56, color: 'indigo',  label: 'memoize — function decorator, works on any fn' },
        { startLine: 60, endLine: 60, color: 'violet',  label: 'fastDouble = memoize(expensiveDouble)' },
        { startLine: 73, endLine: 75, color: 'emerald', label: '10, 20, 10 — third call hits cache' },
      ],
      connections: [{ fromLine: 53, toLine: 57, color: 'violet', label: 'cache miss — calls original fn' }],
    },
  ],
}
