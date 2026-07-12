---
series: design-patterns
level: 2
title: Structural Patterns — Adapter, Decorator, Proxy, Facade
lang: javascript
---

# Structural Patterns — Adapter, Decorator, Proxy, Facade

Structural patterns describe how objects are composed into larger structures. The recurring problem: you have objects that don't fit together (Adapter), you want to add behaviour without modifying the original (Decorator), you need to control access or intercept calls (Proxy), or you want to simplify a complex subsystem (Facade).

All four patterns involve wrapping an object. The differences are in intent.

## Adapter

The Adapter converts one interface into another that the client expects. Use it when you have existing code that expects a specific interface but you want to use an object with a different interface.

```javascript
// PROBLEM: you have a logging library that uses .write() but your app uses .log()

// Existing code your app calls:
logger.log('User created', { userId: 42 })
logger.log('Error', { code: 500, message: 'Internal error' })

// Third-party library that only has .write():
class ThirdPartyLogger {
  write(message, metadata) {
    const line = `[${new Date().toISOString()}] ${message} ${JSON.stringify(metadata)}`
    process.stdout.write(line + '\n')
  }
}

// ADAPTER: wraps the third-party logger and exposes the .log() interface
class LoggerAdapter {
  constructor(thirdPartyLogger) {
    this._logger = thirdPartyLogger
  }

  log(message, metadata = {}) {
    this._logger.write(message, metadata)  // translates the interface
  }
}

const logger = new LoggerAdapter(new ThirdPartyLogger())
logger.log('User created', { userId: 42 })   // app code unchanged
```

```text
ADAPTER CHARACTERISTICS:
  → The adapter has the SAME interface as what the client expects
  → The adapter WRAPS the adaptee (the object being adapted)
  → The adaptee is untouched — no modification to third-party code
  
ADAPTER vs FACADE:
  Both wrap an object or subsystem.
  Adapter: matches a SPECIFIC interface that already exists in the codebase
  Facade: creates a NEW, SIMPLER interface to a subsystem
  
  Adapter: "I need this square peg to fit this round hole."
  Facade:  "I need a simpler way to use this complicated machine."

ADAPTER IN THE WILD:
  → Database drivers: pg, mysql2, sqlite3 all expose the same query() interface
  → fetch() in Node.js: adapts the browser Fetch API to Node's HTTP internals
  → React's synthetic events: adapter over different browsers' event objects
```

## Decorator

The Decorator wraps an object to add new behaviour without modifying the original object. It has the same interface as the wrapped object, so it can be used wherever the original can be used.

```javascript
// BASE: a simple user repository
class UserRepository {
  async findById(id) {
    return db.query('SELECT * FROM users WHERE id = ?', [id])
  }

  async save(user) {
    return db.query('INSERT INTO users ... VALUES ...', [user])
  }
}

// DECORATOR: adds caching without changing UserRepository
class CachedUserRepository {
  constructor(repo, cache) {
    this._repo = repo     // the wrapped repository
    this._cache = cache   // the cache (e.g., Redis client)
  }

  async findById(id) {
    const cached = await this._cache.get(`user:${id}`)
    if (cached) return JSON.parse(cached)

    const user = await this._repo.findById(id)   // delegate to wrapped repo
    if (user) await this._cache.set(`user:${id}`, JSON.stringify(user), 'EX', 300)
    return user
  }

  async save(user) {
    const result = await this._repo.save(user)
    await this._cache.del(`user:${user.id}`)   // invalidate on write
    return result
  }
}

// ANOTHER DECORATOR: adds logging
class LoggedUserRepository {
  constructor(repo, logger) {
    this._repo = repo
    this._logger = logger
  }

  async findById(id) {
    const start = Date.now()
    const result = await this._repo.findById(id)
    this._logger.log('findById', { id, ms: Date.now() - start, found: !!result })
    return result
  }

  async save(user) {
    const result = await this._repo.save(user)
    this._logger.log('save', { userId: user.id })
    return result
  }
}

// COMPOSITION: decorators stack — each wraps the previous
const repo = new LoggedUserRepository(
  new CachedUserRepository(
    new UserRepository(),
    redisClient
  ),
  logger
)

// Usage: identical to plain UserRepository — the interface is the same
const user = await repo.findById(42)
```

```text
DECORATOR CHARACTERISTICS:
  → Same interface as the component it wraps (both are "repositories")
  → Multiple decorators can be composed (stacked)
  → Each decorator does ONE thing (logging, caching, retrying, etc.)
  → The wrapped object is unmodified

DECORATOR vs INHERITANCE:
  Inheritance adds behaviour at class definition time, statically.
  Decorator adds behaviour at object creation time, dynamically.
  
  With inheritance: to log + cache, you need a LoggedCachedUserRepository.
  With Decorator: compose at runtime — any order, any combination.
  Decorators follow the Open/Closed Principle: open for extension (new decorators),
  closed for modification (UserRepository never changes).

DECORATOR IN THE WILD:
  → Express middleware: each middleware is a decorator on the request/response pipeline
  → Python @decorator syntax
  → Java Spring's @Transactional, @Cacheable, @Retry annotations
  → React's HOC (Higher-Order Component) pattern
```

**CS lens:** The Decorator pattern is a form of **function composition** applied to objects. Just as `pipe(f, g, h)(x)` applies f, then g, then h, a chain of decorators applies their behaviour in sequence around a central operation. The decorator chain is a pipeline, and each decorator is a pure transform of the operation's behaviour (before, after, or both). This is why middleware systems (Express, Koa, Redux middleware) use the decorator pattern: they are composable pipelines.

## Proxy

The Proxy pattern provides a surrogate for another object to control access to it. Unlike Decorator (which adds behaviour), Proxy controls access: it may delay, restrict, log, or validate before delegating.

```javascript
// VIRTUAL PROXY: delays expensive initialisation until first use
class LazyDatabase {
  constructor(config) {
    this._config = config
    this._db = null     // not connected yet
  }

  _getDb() {
    if (!this._db) {
      this._db = new ExpensiveDatabase(this._config)   // connect on first use
    }
    return this._db
  }

  async query(sql, params) {
    return this._getDb().query(sql, params)
  }
}

// PROTECTION PROXY: restricts access based on permissions
class ReadOnlyProxy {
  constructor(repository) {
    this._repo = repository
  }

  async findById(id) {
    return this._repo.findById(id)   // reads are allowed
  }

  async save() {
    throw new Error('Read-only access — writes are not permitted')
  }
}
```

```javascript
// JAVASCRIPT ES6 Proxy: built-in proxy with traps
const handler = {
  get(target, prop) {
    console.log(`Getting: ${prop}`)
    return Reflect.get(target, prop)
  },
  set(target, prop, value) {
    console.log(`Setting: ${prop} = ${value}`)
    return Reflect.set(target, prop, value)
  }
}

const user = new Proxy({ name: 'Alice', role: 'user' }, handler)
user.name    // logs: "Getting: name"
user.role = 'admin'  // logs: "Setting: role = admin"
```

```text
PROXY vs DECORATOR:
  Both wrap an object. The difference is intent:
  
  Proxy: CONTROLS ACCESS — same interface, may deny/delay/intercept
    "You can only read, not write." (Protection proxy)
    "I'll connect lazily when you first need me." (Virtual proxy)
    "I'll track every property access." (Logging proxy)

  Decorator: ADDS BEHAVIOUR — same interface, always delegates
    "I'll cache the result of your findById call."
    "I'll log after every operation."

  Proxy often says "maybe": maybe it delegates, maybe it doesn't.
  Decorator always delegates to the wrapped object.
```

## Facade

The Facade provides a simple interface to a complex subsystem. It doesn't add new behaviour — it simplifies interaction with something that already exists.

```javascript
// COMPLEX SUBSYSTEM: low-level audio processing
const audioContext = new AudioContext()
const oscillator = audioContext.createOscillator()
const gainNode = audioContext.createGain()
oscillator.connect(gainNode)
gainNode.connect(audioContext.destination)
oscillator.type = 'sine'
oscillator.frequency.value = 440
gainNode.gain.value = 0.5
oscillator.start()
// ... 10 more lines to play a single note

// FACADE: a simple interface over the complexity
class AudioPlayer {
  constructor() {
    this._ctx = new AudioContext()
  }

  playTone(frequency, duration, volume = 0.5) {
    const osc = this._ctx.createOscillator()
    const gain = this._ctx.createGain()
    osc.connect(gain)
    gain.connect(this._ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.value = volume
    osc.start()
    osc.stop(this._ctx.currentTime + duration)
  }
}

const player = new AudioPlayer()
player.playTone(440, 0.5)   // A4 note for 0.5 seconds
```

```text
FACADE CHARACTERISTICS:
  → Simplifies a complex subsystem into a few clear methods
  → Does not add new capability — just simplifies access
  → The subsystem still exists and can be used directly if needed
  → The facade does not need to cover all the subsystem's features

FACADE IN THE WILD:
  → axios: facade over XMLHttpRequest / Node's http module
  → jQuery: facade over raw DOM APIs
  → ORM (Sequelize, Prisma): facade over SQL + connection pooling
  → Every SDK is a facade over an API

FACADE vs ADAPTER:
  Facade: simplifies a complex SUBSYSTEM (many classes/methods → few)
  Adapter: converts one INTERFACE to another (one interface → another)
  
  "Makes complex simple" (Facade) vs "Makes incompatible compatible" (Adapter)
```

**SE lens:** The Facade pattern is the principle of **information hiding** applied at the subsystem level. The complexity of the audio API — contexts, nodes, connections, scheduling — is hidden behind `playTone(frequency, duration)`. The caller only knows what they need to know. This reduces coupling between the caller and the subsystem: if the audio API changes, only the Facade needs to update, not every caller. Every service layer in a backend application is implicitly a Facade: it hides the complexity of database queries, caching, and external API calls behind a simple method interface.

**Common mistakes:**
- Decorator forgetting to implement all interface methods — if your Decorator wraps a `Repository` but only decorates `findById`, then calling `save` on the Decorator will fail or return undefined. Every method in the interface must be delegated.
- Proxy that delegates to itself — `this._proxy.query()` inside a Proxy method causes infinite recursion. Always delegate to the wrapped target, not to `this`.
- Facade hiding too much — if the Facade hides so much that users can't access critical subsystem features, they will bypass the Facade and use the subsystem directly, defeating the purpose. Good Facades expose the 80% case clearly and provide escape hatches for the 20%.

**Debug tip:** When debugging a chain of decorators: add a `console.log('called:', this.constructor.name, methodName)` to each decorator temporarily to trace which decorator is being called in which order. If you get unexpected results, the order of composition may be wrong — think of it like function composition: the outermost decorator's logic runs first.

## Challenge: createLoggingDecorator

Implement a logging Decorator for any object.

```challenge
function createLoggingDecorator(target, logger) {
  // Returns a proxy/wrapper object that:
  // - Forwards all method calls to `target`
  // - Before each call: logs { method: methodName, args }
  // - After each call: logs { method: methodName, result } (for sync methods)
  //   For async methods (returns a Promise): logs the resolved value
  //   For errors: logs { method: methodName, error: err.message } and re-throws
  //
  // logger: an object with a .log(entry) method
  //
  // Hint: iterate over the target's methods and wrap each one
  //   A method is any property that is a function

  // You may use ES6 Proxy or manual wrapping — either is acceptable
}
```

```test
const calls = []
const logger = { log: (entry) => calls.push(entry) }

const calculator = {
  add(a, b) { return a + b },
  multiply(a, b) { return a * b },
  divide(a, b) {
    if (b === 0) throw new Error('Division by zero')
    return a / b
  },
}

const logged = createLoggingDecorator(calculator, logger)

// add: logs before and after
const sum = logged.add(3, 4)
assert sum === 7
assert calls.some(c => c.method === 'add' && JSON.stringify(c.args) === JSON.stringify([3, 4]))
assert calls.some(c => c.method === 'add' && c.result === 7)

// multiply: also logged
logged.multiply(5, 6)
assert calls.some(c => c.method === 'multiply')

// error: logs the error and re-throws
let threw = false
try {
  logged.divide(10, 0)
} catch (e) {
  threw = true
  assert e.message === 'Division by zero'
}
assert threw
assert calls.some(c => c.method === 'divide' && c.error === 'Division by zero')
```
