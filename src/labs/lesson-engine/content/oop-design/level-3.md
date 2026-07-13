---
series: oop-design
level: 3
title: Design Patterns — Structural and Behavioural
lang: javascript
---

# Design Patterns — Structural and Behavioural

Design patterns are reusable solutions to common design problems. They are not code to copy — they are named solutions that appear repeatedly across different codebases, different languages, and different problem domains. Knowing the patterns gives you a vocabulary: when you recognise a pattern in code you are reading, you understand the intent without decoding the implementation. When you name a pattern in a code review, your team knows what you mean without a long explanation.

This lesson covers the most practically useful structural and behavioural patterns: Observer, Strategy, Decorator, and Factory. These are the patterns you will encounter most frequently in production JavaScript/TypeScript code. By the end of this lesson you will be able to implement each pattern and recognise where it appears in the libraries and frameworks you use daily.

## Observer pattern

The Observer pattern defines a one-to-many dependency: when one object (the subject) changes state, all its dependents (observers) are notified automatically.

```javascript
// OBSERVER PATTERN: an event emitter
class EventEmitter {
  #listeners = new Map()   // event → [handlers]

  on(event, handler) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, [])
    }
    this.#listeners.get(event).push(handler)
    return () => this.off(event, handler)   // returns an unsubscribe function
  }

  off(event, handler) {
    const handlers = this.#listeners.get(event) ?? []
    this.#listeners.set(event, handlers.filter(h => h !== handler))
  }

  emit(event, data) {
    const handlers = this.#listeners.get(event) ?? []
    handlers.forEach(handler => handler(data))
  }
}

// Usage: a store notifies its subscribers when state changes
class CounterStore extends EventEmitter {
  #count = 0

  get count() { return this.#count }

  increment() {
    this.#count++
    this.emit('change', { count: this.#count })
  }
}

const store = new CounterStore()
const unsubscribe = store.on('change', ({ count }) => {
  console.log(`Count changed to ${count}`)
})

store.increment()   // logs: Count changed to 1
store.increment()   // logs: Count changed to 2
unsubscribe()       // remove the listener
store.increment()   // no log — listener removed
```

```text
WHERE OBSERVER APPEARS IN THE WILD:
  → DOM addEventListener/removeEventListener
  → Node.js EventEmitter (the base of every stream and server)
  → React useState/useEffect (React notifies components when state changes)
  → Redux store.subscribe()
  → RxJS Observable
  → WebSocket message events

WHY OBSERVER MATTERS:
  The subject (CounterStore) does not know who its observers are.
  Observers can be added and removed without touching the subject.
  This is the core decoupling of event-driven architectures.
```

**CS lens:** The Observer pattern is the software implementation of the **publish-subscribe** model from distributed systems. The subject publishes events; observers subscribe to them. The critical property: the publisher and subscriber are decoupled — the publisher does not need to know about the subscriber's existence, and the subscriber does not need to know about the publisher's implementation. This is also the basis of the **reactive programming** model: a stream of values (events) that subscribers can transform and consume.

## Strategy pattern

The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. The caller selects the algorithm at runtime.

```javascript
// STRATEGY PATTERN: sorting algorithms
const strategies = {
  bubbleSort: (arr) => {
    const a = [...arr]
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]]
      }
    }
    return a
  },
  quickSort: (arr) => {
    if (arr.length <= 1) return arr
    const pivot = arr[Math.floor(arr.length / 2)]
    const left  = arr.filter(x => x < pivot)
    const mid   = arr.filter(x => x === pivot)
    const right = arr.filter(x => x > pivot)
    return [...strategies.quickSort(left), ...mid, ...strategies.quickSort(right)]
  },
  nativeSort: (arr) => [...arr].sort((a, b) => a - b),
}

function sortData(data, strategyName = 'nativeSort') {
  const strategy = strategies[strategyName]
  if (!strategy) throw new Error(`Unknown sort strategy: ${strategyName}`)
  return strategy(data)
}

// Strategy chosen at call time — no modification to sortData needed for new strategies
sortData([3, 1, 4, 1, 5], 'quickSort')
sortData([3, 1, 4, 1, 5], 'nativeSort')
```

```text
STRATEGY IN THE REAL WORLD:
  → Authentication strategies (passport.js: LocalStrategy, JWTStrategy, GoogleStrategy)
  → Rendering strategies (server-side vs client-side vs static generation)
  → Validation strategies (different rules for different form types)
  → Payment processing strategies (from the browser-apis lesson's example)
  → Compression strategies (gzip vs brotli vs none based on client support)

STRATEGY vs OPEN/CLOSED PRINCIPLE:
  Strategy is the implementation technique for satisfying OCP.
  Instead of if-else on the algorithm name, the algorithm IS the strategy object.
```

## Decorator pattern

The Decorator pattern attaches additional responsibilities to an object dynamically. It is an alternative to subclassing for extending functionality.

```javascript
// DECORATOR PATTERN: wrapping a service with logging and timing
class UserService {
  async getUser(id) {
    return db.users.findById(id)
  }
}

// Decorator: adds logging without modifying UserService
class LoggedUserService {
  constructor(inner) {
    this.inner = inner
  }

  async getUser(id) {
    console.log(`getUser called with id=${id}`)
    try {
      const user = await this.inner.getUser(id)
      console.log(`getUser succeeded: ${JSON.stringify(user)}`)
      return user
    } catch (err) {
      console.error(`getUser failed: ${err.message}`)
      throw err
    }
  }
}

// Decorator: adds timing
class TimedUserService {
  constructor(inner) {
    this.inner = inner
  }

  async getUser(id) {
    const start = Date.now()
    try {
      return await this.inner.getUser(id)
    } finally {
      console.log(`getUser took ${Date.now() - start}ms`)
    }
  }
}

// Compose decorators:
const service = new TimedUserService(new LoggedUserService(new UserService()))
await service.getUser(123)   // logs + times the call
```

```text
DECORATOR IN THE REAL WORLD:
  → Express middleware (each middleware decorates the request/response)
  → Python's @decorator syntax
  → TypeScript class decorators
  → Java's @Transactional, @Cached annotations
  → Webpack loaders and plugins
  → React Higher-Order Components (HOCs): const WrappedComponent = withLogging(MyComponent)
```

**SE lens:** The Decorator pattern is the runtime alternative to compile-time subclassing. Subclassing decides capabilities at class definition time; decorating decides them at object creation time. This makes decorating far more flexible: you can add logging to some UserService instances and not others, or add timing only in production. This flexibility is why middleware architectures (Express, Koa, Redux middleware) all use the decorator pattern — the pipeline of behaviours is configured at runtime based on environment and configuration.

## Factory pattern

The Factory pattern provides an interface for creating objects without specifying the exact class that will be created.

```javascript
// FACTORY PATTERN: create the right database connection for the environment
class SqliteDatabase {
  async query(sql, params) { /* SQLite implementation */ }
  async close() { /* cleanup */ }
}

class PostgresDatabase {
  async query(sql, params) { /* Postgres implementation */ }
  async close() { /* cleanup */ }
}

class InMemoryDatabase {
  #data = {}
  async query(sql, params) { /* in-memory mock for tests */ }
  async close() {}
}

// Factory: creates the right database for the current environment
function createDatabase(config) {
  switch (config.type) {
    case 'sqlite':   return new SqliteDatabase(config.url)
    case 'postgres': return new PostgresDatabase(config.url)
    case 'memory':   return new InMemoryDatabase()
    default:         throw new Error(`Unknown database type: ${config.type}`)
  }
}

// Usage: callers don't know which database they get
const db = createDatabase({ type: process.env.DB_TYPE ?? 'memory', url: process.env.DB_URL })
```

```text
FACTORY IN THE REAL WORLD:
  → React.createElement() (factory for virtual DOM elements)
  → document.createElement() (factory for DOM elements)
  → Connection pool factories in database libraries
  → Strategy factories (createAuthStrategy(config))
  → Logger factories (createLogger({ level: 'debug', format: 'json' }))
```

**Common mistakes:**
- Forcing patterns onto simple code — not every function that creates an object is a Factory. Call it a factory when the creation logic is complex or when the specific type created depends on runtime conditions.
- Observer memory leaks — adding listeners with `on()` but never calling the unsubscribe function means the handler keeps a reference to its closure forever. Always store the unsubscribe function and call it when the observer is no longer needed.
- Deep decorator chains that are hard to debug — when 8 decorators are stacked, a stack trace through an error is hard to follow. Name your decorator classes clearly and limit the depth.

**Debug tip:** When you see `EventEmitter`, `.on()/.off()`, or `subscribe()`/`unsubscribe()` in a codebase, you are looking at the Observer pattern. When you see a registry of strategy functions looked up by key, you are looking at the Strategy pattern. When you see a class that takes an instance of the same type as a constructor argument, you are looking at the Decorator pattern. When you see a `create*` or `make*` function that branches based on config, you are looking at the Factory pattern. Naming the pattern instantly tells you the intent.

## Challenge: event_emitter

Implement a typed event emitter that supports multiple event types.

```challenge
function createEventEmitter() {
  // Returns an object with:
  //   on(event, handler): adds a handler for the event; returns an unsubscribe function
  //   off(event, handler): removes the specific handler
  //   emit(event, data): calls all handlers registered for the event with data
  //   listenerCount(event): returns the number of listeners for the event
}
```

```test
const emitter = createEventEmitter()

const received = []
const unsub = emitter.on('data', (value) => received.push(value))
emitter.on('data', (value) => received.push(value * 2))

emitter.emit('data', 5)
assert received[0] === 5 && received[1] === 10
assert emitter.listenerCount('data') === 2

unsub()
emitter.emit('data', 7)
assert received.length === 3 && received[2] === 14   // only the second handler fired

emitter.emit('unknown', 99)   // no listeners — no error
assert emitter.listenerCount('data') === 1 && emitter.listenerCount('unknown') === 0
```
