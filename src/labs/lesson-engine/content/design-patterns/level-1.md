---
series: design-patterns
level: 1
title: Creational Patterns — Factory, Builder, Singleton
lang: javascript
---

# Creational Patterns — Factory, Builder, Singleton

Creational patterns address object creation. The problem they solve is simple: when construction logic grows complex, it pollutes the call site. A `new User(id, email, name, role, createdAt, updatedAt, preferences, ...)` call with eight arguments is hard to read, hard to call correctly, and tightly couples the caller to the internal structure of the object.

Creational patterns separate construction from use.

## Factory

A factory is any function that creates and returns a configured object. The caller doesn't know (or care) how the object is built.

```javascript
// WITHOUT FACTORY: caller knows too much
const user = {
  id: crypto.randomUUID(),
  email: email.toLowerCase().trim(),
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
  preferences: { theme: 'light', notifications: true },
}

// WITH FACTORY: construction logic in one place
function createUser(email, options = {}) {
  return {
    id: crypto.randomUUID(),
    email: email.toLowerCase().trim(),
    role: options.role ?? 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: { theme: 'light', notifications: true, ...options.preferences },
  }
}

const user = createUser('alice@example.com')
const admin = createUser('bob@example.com', { role: 'admin' })
```

```text
FACTORY VARIANTS:

  SIMPLE FACTORY FUNCTION: a function that creates one type of object.
    function createOrder(items) { ... }

  FACTORY THAT SELECTS A TYPE based on input:
    function createShape(type, config) {
      if (type === 'circle') return new Circle(config.radius)
      if (type === 'rect')   return new Rectangle(config.w, config.h)
      throw new Error('Unknown shape: ' + type)
    }
    
    This is often implemented as a registry object:
    const SHAPE_FACTORIES = {
      circle: (cfg) => new Circle(cfg.radius),
      rect:   (cfg) => new Rectangle(cfg.w, cfg.h),
    }
    function createShape(type, cfg) {
      const factory = SHAPE_FACTORIES[type]
      if (!factory) throw new Error('Unknown shape: ' + type)
      return factory(cfg)
    }

  ABSTRACT FACTORY: a factory that creates families of related objects.
    function createDatabaseAdapter(env) {
      if (env === 'test')       return new InMemoryDatabase()
      if (env === 'production') return new PostgresDatabase()
    }
    The caller gets a consistent interface regardless of the concrete type.
```

**CS lens:** The factory pattern is an instance of **abstraction by indirection**: by introducing a function between the creation site and the construction logic, we can change the construction without affecting callers. This is the same principle that makes function calls useful — you don't care how `Math.sqrt` is implemented, only what it returns. Factories apply this principle to object construction.

## Builder

The Builder pattern constructs a complex object step by step. It is most useful when an object has many optional or conditional fields that would make a constructor call hard to read.

```javascript
// WITHOUT BUILDER: long constructor with many optional arguments
// Which undefined is which? What's the default? Is this right?
const request = new HttpRequest(
  'https://api.example.com/users',
  'POST',
  { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
  JSON.stringify(body),
  30000,    // timeout
  true,     // followRedirects
  undefined, undefined, undefined  // no idea what these are
)

// WITH BUILDER: each step is named, optional steps can be skipped
class HttpRequestBuilder {
  constructor(url) {
    this._url = url
    this._method = 'GET'
    this._headers = {}
    this._body = null
    this._timeout = 30000
    this._followRedirects = true
  }

  method(m)             { this._method = m; return this }
  header(key, value)    { this._headers[key] = value; return this }
  body(data)            { this._body = JSON.stringify(data); return this }
  timeout(ms)           { this._timeout = ms; return this }
  noRedirects()         { this._followRedirects = false; return this }

  build() {
    return new HttpRequest(
      this._url, this._method, this._headers,
      this._body, this._timeout, this._followRedirects
    )
  }
}

// Call site: reads like a sentence
const request = new HttpRequestBuilder('https://api.example.com/users')
  .method('POST')
  .header('Content-Type', 'application/json')
  .header('Authorization', 'Bearer token')
  .body({ name: 'Alice', role: 'admin' })
  .timeout(10000)
  .build()
```

```text
BUILDER CHARACTERISTICS:
  ✓ Each setter returns `this` (fluent interface / method chaining)
  ✓ .build() performs validation and creates the final object
  ✓ Optional fields are set only when needed — no undefined arguments
  ✓ The builder itself is mutable (state accumulates); the product is immutable

WHEN BUILDER IS OVERKILL:
  If an object has ≤ 3 required fields and no optional ones, use a simple factory.
  Builders add a class (or closure) just to configure another object.
  Use builder when: many optional fields, complex validation at build time,
  or when the same builder can produce different product types.

BUILDER IN THE WILD:
  new URLSearchParams().set('q', 'test').set('page', '1')
  knex('users').where({ role: 'admin' }).orderBy('name').limit(10)  // SQL query builder
  docker run --rm -it -p 3000:3000 --env-file .env myapp  // CLI is a builder
```

## Singleton

The Singleton pattern ensures that a class or module has exactly one instance. In JavaScript, modules already behave as singletons (they are executed once; the export is cached). This makes the traditional Singleton class largely unnecessary.

```javascript
// JAVASCRIPT MODULE SINGLETON (preferred):
// db.js
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Exporting the instance — every importer shares the same pool
module.exports = pool

// In any other file:
const db = require('./db')   // always the same Pool instance
```

```javascript
// CLASSIC SINGLETON CLASS (rarely needed in JavaScript):
class Config {
  static #instance = null

  constructor() {
    if (Config.#instance) return Config.#instance
    this._data = {}
    Config.#instance = this
  }

  set(key, value) { this._data[key] = value; return this }
  get(key) { return this._data[key] }
}

const a = new Config()
const b = new Config()
console.log(a === b)   // true — same instance
```

```text
SINGLETON TRADEOFFS:
  ADVANTAGE:
    Ensures shared state is consistent — only one database connection pool,
    one configuration store, one logger instance.

  DISADVANTAGE (why singleton is often called an anti-pattern):
    → Global state: any code anywhere can access and mutate the singleton
    → Hard to test: tests share state — test A's mutations affect test B
    → Hidden dependencies: a function that calls Config.getInstance() has
      an implicit dependency that is invisible at the call site
    
  BETTER ALTERNATIVE (dependency injection):
    Pass the shared instance as a parameter to functions that need it.
    function createUserService(db, config, logger) { ... }
    Now the dependencies are explicit, testable, and replaceable.

WHEN SINGLETON IS APPROPRIATE:
  → A module-level constant that cannot change: a regex, a frozen config object
  → A resource with true global cardinality: the process's event loop, stdout
  → When you need lazy initialisation + shared instance: use a module with a
    top-level let and a lazy getter
```

**SE lens:** The Singleton is an example of a pattern that solves a real problem (shared global instance) but creates a worse one (hidden global state). In practice, the module system in Node.js makes explicit Singleton classes unnecessary: just export an instance from a module. For testability, prefer dependency injection: pass shared instances as constructor arguments. This makes the dependency explicit and replaceable in tests, while still sharing the instance in production.

**Common mistakes:**
- Using Builder where a plain options object suffices — `createUser({ email, role, preferences })` is often cleaner than a builder when the options are well-understood and few. Use Builder for complex multi-step construction where the order matters or validation is needed at build time.
- Making every factory function a class — `createUser()` doesn't need a `UserFactory` class. A function is the simplest factory. Use a class only when the factory itself needs state (e.g., a counter-based ID generator) or when you need multiple factory methods on a shared interface.
- Creating singletons for things that should be injectable — if you find yourself calling `Config.getInstance()` inside a function, that function has a hidden dependency. Pass config as a parameter instead.

**Debug tip:** When a test fails because state from a previous test leaked in, you likely have a singleton. Find the shared mutable state (a module-level variable, a static class field, a global) and either reset it in `beforeEach`/`afterEach`, or refactor to pass it as a parameter. The test failure is the pattern telling you the singleton is in the wrong place.

## Challenge: createHttpRequestBuilder

Implement an HTTP request builder.

```challenge
function createHttpRequestBuilder(url) {
  // Returns a builder object with the following methods (each returns the builder):
  //   .method(verb)             — sets the HTTP method (default: 'GET')
  //   .header(name, value)      — adds a header (can be called multiple times)
  //   .body(data)               — sets the JSON body (default: null)
  //   .timeout(ms)              — sets the timeout in ms (default: 30000)
  //
  // .build() — returns the final request object:
  //   { url, method, headers, body, timeout }
  //   headers: object with all headers set via .header()
  //   body: JSON.stringify(data) if .body() was called, else null
}
```

```test
// Default GET request
const req1 = createHttpRequestBuilder('https://api.example.com/users').build()
assert req1.method === 'GET' && req1.body === null && req1.timeout === 30000

// POST with headers and body
const req2 = createHttpRequestBuilder('https://api.example.com/users')
  .method('POST')
  .header('Content-Type', 'application/json')
  .body({ name: 'Alice' })
  .timeout(10000)
  .build()
assert req2.method === 'POST' && req2.headers['Content-Type'] === 'application/json'
assert req2.body === JSON.stringify({ name: 'Alice' }) && req2.timeout === 10000

// Method chaining returns the builder itself, not undefined
const builder = createHttpRequestBuilder('https://example.com')
assert builder.method('DELETE') === builder

// Multiple builds are independent snapshots
const b = createHttpRequestBuilder('https://example.com')
b.header('X-A', '1')
const r1 = b.build()
b.header('X-B', '2')
assert !('X-B' in r1.headers)   // r1 was built before X-B was set
```
