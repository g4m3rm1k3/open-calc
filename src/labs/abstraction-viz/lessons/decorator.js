export default {
  id: 'decorator',
  title: 'Decorator Pattern',
  tag: 'Design Pattern',
  steps: [
    {
      title: 'Base object — a plain logger',
      semanticEvent: 'DefineFunction',
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
        '`createLogger()` establishes the **base component contract**: one method (`log(msg)`) that writes to the console. This is the object being decorated. Every decorator layer built on top of it must honour this same interface — that is what makes decorators composable. The base does one thing and nothing else.',
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
      semanticEvent: 'DefineFunction',
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
        '`withTimestamp(logger)` establishes the **decorator → base delegation relationship**: it captures the original `logger` in a closure and returns a new object with the same `log` interface. When `tsLogger.log(msg)` is called, it prepends the timestamp and then calls `logger.log()` — the original. The caller\'s interface is unchanged; the behaviour is extended without modifying the base.',
        'CS — The decorator wraps the original by capturing it in a closure (`logger` in the outer function\'s scope) and delegating to it inside the new method. The interface is identical — both `logger` and `tsLogger` have a `log(msg)` method. The caller switches from one to the other by replacing the variable. This is transparent wrapping.',
        'SE — Express middleware is exactly this: `app.use(morgan(\'dev\'))` wraps the request handler with a logging layer. The original handler does not change. The logging happens before it. Winston (the Node.js logging library) implements its formatters as a decorator chain — each formatter wraps the next, adding timestamps, colours, and JSON serialisation in layers.',
        'Without this: without the decorator, you modify the base `log` function to add timestamps — making timestamps a permanent part of the logger. Now you can\'t have a logger without timestamps. The decorator keeps concerns separate: the base logger logs, the timestamp decorator adds time. Remove the decorator, and timestamps are gone — base logger unchanged.',
      ],
      active: [
        { startLine: 9,  endLine: 14, color: 'violet',  label: 'withTimestamp — wraps log, delegates inside' },
        { startLine: 20, endLine: 21, color: 'emerald', label: 'tsLogger has same interface — prepends timestamp' },
      ],
      connections: [{ fromLine: 12, toLine: 3, color: 'violet', label: 'decorator delegates to original log', type: 'calls' }],
    },
    {
      title: 'Level filter decorator — only log at or above a level',
      semanticEvent: 'DefineFunction',
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
        '`withLevel(logger, minLevel)` establishes a **threshold-gated delegation**: the closed-over `levels` map converts label strings to integers, and only messages at or above `minLevel` are forwarded to the inner `logger.log()`. Messages below the threshold are silently dropped — the delegation chain is never entered. `debug` (0) and `info` (1) are suppressed when `minLevel` is `\'warn\'` (2).',
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
      semanticEvent: 'CallFunction',
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
        'Four decorators stack into a **delegation chain**: `prefixed → leveled → ts → base`. Each call propagates inward, each layer adding or filtering before forwarding. `prefixed.log(\'too many attempts\', \'warn\')` chains: prefix adds `[AuthService]`, level check passes, timestamp adds `[2024-01-15]`, base prints. `debug` and `info` are silently dropped by the level filter before reaching the timestamp or base.',
        'CS — The decorator chain is evaluated inside-out on each call. Calling `prefixed.log()` invokes `withPrefix.log` → `withLevel.log` → `withTimestamp.log` → `base.log`. This is the same as function composition: `base ∘ ts ∘ leveled ∘ prefixed`. Each decorator is a pure transformation layer. The order matters: put level-filtering before timestamp addition so suppressed messages don\'t waste timestamp formatting work.',
        'SE — Winston\'s transport system is exactly this: `createLogger({ transports: [new Console(), new File()], format: combine(timestamp(), colorize(), json()) })`. Each `format` is a decorator. Pino\'s `pino-multi-stream` chains transports. Morgan\'s middleware is a single-layer decorator on Express. The Decorator pattern is the architecture of every production logger.',
        'Without this: without composable decorators, each logger variation is a class: `TimestampLogger`, `LevelLogger`, `PrefixLogger`, `TimestampLevelLogger`, `TimestampPrefixLogger`, `LevelPrefixLogger`, `TimestampLevelPrefixLogger` — 7 classes for 3 features. With decorators: 3 functions, infinite combinations. This is composition vs. inheritance: composition wins.',
      ],
      active: [
        { startLine: 29, endLine: 34, color: 'indigo',  label: 'withPrefix — fourth decorator in the chain' },
        { startLine: 37, endLine: 40, color: 'violet',  label: 'four decorators stacked: base→ts→leveled→prefixed' },
        { startLine: 41, endLine: 44, color: 'emerald', label: 'debug+info suppressed, warn+error output with full prefix chain' },
      ],
      connections: [{ fromLine: 31, toLine: 30, color: 'violet', label: 'each decorator delegates down the chain', type: 'calls' }],
    },
    {
      title: 'Decorator tracks state — call counting',
      semanticEvent: 'DefineFunction',
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
        '`withCallCount` establishes a **stateful decorator**: the closed-over `count` variable persists across calls, incrementing once per `log` invocation. It also **extends the interface** by adding `getCount()` — a method that exists only on this decorator, not on the base. `counted.getCount()` returns `3` after three log calls, proving that state survives between invocations through the closure.',
        'CS — The decorator now holds state. The closed-over `count` variable is private to the `withCallCount` call — no other code can read or mutate it except through `getCount()`. This demonstrates that decorators can extend the interface (add `getCount`) while still conforming to the base interface (`log`). The extended method is only available if the caller holds a reference to the counted decorator directly.',
        'SE — Stateful decorators are used in metrics collection. A production HTTP logger decorator counts requests, tracks latency (measures time before and after delegation), and buckets error rates. Prometheus client libraries wrap handlers in counted decorators. DataDog\'s APM agent wraps database query methods to track duration and frequency — all without touching the query logic.',
        'Without this: without the decorator, you add `count++` inside the base logger — coupling counting to logging permanently. Every logger would count, even when you don\'t want counts. The decorator makes counting optional: wrap with `withCallCount` to count, skip it and the count doesn\'t exist.',
      ],
      active: [
        { startLine: 36, endLine: 46, color: 'violet',  label: 'withCallCount — stateful decorator' },
        { startLine: 37, endLine: 37, color: 'indigo',  label: 'count — private to this decorator via closure' },
        { startLine: 56, endLine: 56, color: 'emerald', label: 'getCount() → 3 — three log calls reached the counter' },
      ],
      connections: [{ fromLine: 40, toLine: 37, color: 'indigo', label: 'count++ on every log call', type: 'writes' }],
    },
    {
      title: 'Function decorator — wrap any function',
      semanticEvent: 'DefineFunction',
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
        '`memoize(fn)` generalises the decorator to **any single-argument function**: it wraps `fn` in a cache check — on a cache hit it short-circuits without calling `fn`; on a miss it calls `fn`, stores the result, and returns it. `fastDouble(5)` computes once, the third call reads from cache. The decorator pattern works equally on objects (logger) and functions (memoize).',
        'CS — `memoize` is a higher-order function that returns a function: it takes `fn` and returns a new function with the same signature. The cache is a closure variable — private to this memoized version. This is the function-level decorator pattern: wrap a function in another function that intercepts calls and adds caching, logging, retry, or any other cross-cutting concern.',
        'SE — `_.memoize` in Lodash, `React.memo` (component-level), `useMemo` (value-level), and `reselect`\'s `createSelector` are all memoize decorators. Python\'s `@functools.lru_cache` is the same pattern. Express\'s `compression()` middleware is a function decorator that wraps the response to compress output. Function decorators are the most reusable form of the pattern.',
        'Without this: without the decorator, you add caching inside `expensiveDouble` — coupling the caching logic to the function permanently. `expensiveDouble` can no longer be tested without the cache. With the decorator, `expensiveDouble` is pure: given 5, always returns 10. The cache is separate. You can test both independently.',
      ],
      active: [
        { startLine: 48, endLine: 56, color: 'indigo',  label: 'memoize — function decorator, works on any fn' },
        { startLine: 60, endLine: 60, color: 'violet',  label: 'fastDouble = memoize(expensiveDouble)' },
        { startLine: 73, endLine: 75, color: 'emerald', label: '10, 20, 10 — third call hits cache' },
      ],
      connections: [{ fromLine: 53, toLine: 57, color: 'violet', label: 'cache miss — calls original fn', type: 'calls' }],
    },
  ],
}
