---
series: software-architecture
level: 3
title: API Design
lang: javascript
---

# API Design

An API is a contract between a producer and all its consumers. Once consumers exist, the contract is difficult to change — breaking it requires coordinating changes across every caller simultaneously. Joshua Bloch's 2006 talk "How to Design a Good API and Why It Matters" established the core principles that still hold: minimize, don't reveal, protect invariants, consider performance. By the end of this lesson you will understand the three API design principles that determine whether an API can evolve without breaking callers, the trade-offs between REST/GraphQL/gRPC, and how to detect breaking changes.

## Principle 1 — Minimal Surface Area

Every public function, field, and parameter is a promise to keep forever. Expose the minimum needed for the use cases.

```javascript
// Demonstrating the cost of a large surface area:
function demonstrateMinimalSurface() {
  // BAD: exposes internal configuration that callers shouldn't know about
  function createDatabaseConnectionBloated(host, port, username, password, database,
    maxConnections, connectionTimeout, idleTimeout, ssl, sslCert, sslKey,
    retryCount, retryDelay, queryTimeout) {
    return { type: 'db', host, port }  // 14 parameters — callers must know all internals
  }

  // GOOD: minimal surface — sane defaults for everything optional
  function createDatabaseConnection(url, options = {}) {
    const defaults = {
      maxConnections: 10,
      connectionTimeout: 5000,
      ssl: url.startsWith('postgres+ssl://'),
      retryCount: 3,
    }
    const config = { ...defaults, ...options }
    console.log(`  connecting to ${url}`)
    console.log(`  config: maxConns=${config.maxConnections}, timeout=${config.connectionTimeout}ms, ssl=${config.ssl}`)
    return { url, config }
  }

  console.log('Default connection (most common case):')
  createDatabaseConnection('postgres://localhost/myapp')

  console.log('\nCustom connection (advanced case):')
  createDatabaseConnection('postgres://prod-server/myapp', { maxConnections: 50, ssl: true })
}

demonstrateMinimalSurface()
```

```text
Default connection (most common case):
  connecting to postgres://localhost/myapp
  config: maxConns=10, timeout=5000ms, ssl=false

Custom connection (advanced case):
  connecting to postgres://prod-server/myapp
  config: maxConns=50, timeout=5000ms, ssl=true
```

**CS lens:** The principle behind minimal surface area is the **Principle of Least Privilege** applied to API design. Each exposed element is a dependency a caller can take on. Dependencies create coupling; coupling resists change. When the Go team says "when in doubt, leave it out," they are saying: unexposed things can be added later without breaking callers; exposed things cannot be removed without breaking callers.

## Principle 2 — Hard to Misuse

Good APIs make the correct usage the easy usage, and make incorrect usage obvious or impossible.

```javascript
// Demonstrating easy-to-misuse vs hard-to-misuse APIs:
function demonstrateMisuse() {
  // BAD: positional parameters are easy to swap
  function createUserBad(name, email, age, isAdmin, isVerified) {
    return { name, email, age, isAdmin, isVerified }
  }

  // BAD usage — swapped args, no compiler/runtime error:
  const badUser = createUserBad('alice@example.com', 'Alice', true, 25, false)
  //             name is email, email is name, age is true — silent bug

  // GOOD: named parameters (options object) — impossible to swap
  function createUserGood({ name, email, age, isAdmin = false, isVerified = false }) {
    if (!name || typeof name !== 'string') throw new Error('name is required string')
    if (!email || !email.includes('@'))    throw new Error('email must be valid')
    if (!Number.isInteger(age) || age < 0) throw new Error('age must be non-negative integer')
    return { name, email, age, isAdmin, isVerified }
  }

  console.log('Good API with correct usage:')
  console.log(createUserGood({ name: 'Alice', email: 'alice@example.com', age: 30 }))

  console.log('\nGood API catches misuse early:')
  try {
    createUserGood({ name: 'Alice', email: 'not-an-email', age: 30 })
  } catch (e) {
    console.log(`  Error caught: ${e.message}`)
  }

  try {
    createUserGood({ name: 'Alice', email: 'alice@example.com', age: -5 })
  } catch (e) {
    console.log(`  Error caught: ${e.message}`)
  }
}

demonstrateMisuse()
```

```text
Good API with correct usage:
{ name: 'Alice', email: 'alice@example.com', age: 30, isAdmin: false, isVerified: false }

Good API catches misuse early:
  Error caught: email must be valid
  Error caught: age must be non-negative integer
```

**SE lens:** Validation at the API boundary is not paranoia — it is the correct architectural decision. The API is a **trust boundary**: everything that enters should be validated; everything internal can be trusted. This prevents bad data from propagating deep into business logic where errors are harder to trace.

## REST vs GraphQL vs gRPC — Three API Styles

Each style is a different answer to "how should services communicate?" with different trade-offs:

```javascript
// Simulating three API styles for the same "get user with their orders" query:

// REST: multiple requests, fixed response shape
async function demonstrateRESTFetching() {
  // In REST, to get user + their orders, you make 2 requests:
  const user    = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' }  // GET /users/1
  const orders  = [{ id: 101, total: 29.99 }, { id: 102, total: 9.99 }]               // GET /users/1/orders

  // Problem: got user.role when we only needed user.name — overfetch
  // Problem: needed 2 HTTP requests — underfetch
  console.log('REST approach:')
  console.log('  Request 1: GET /users/1  → full user object (overfetch)')
  console.log('  Request 2: GET /users/1/orders  → all orders')
  console.log(`  Data needed: name="${user.name}", orderCount=${orders.length}`)
  console.log(`  Wasted: email, role, full order objects`)
}

// GraphQL: one request, client specifies exact fields
function demonstrateGraphQL() {
  // Client sends this query — gets exactly what it asked for:
  const query = `
    query {
      user(id: 1) {
        name             # only what we need
        orders { total } # only totals, not full order objects
      }
    }
  `
  // Server resolves exactly this shape:
  const response = {
    user: {
      name: 'Alice',
      orders: [{ total: 29.99 }, { total: 9.99 }]
    }
  }
  console.log('\nGraphQL approach:')
  console.log('  Single POST /graphql')
  console.log('  Client specifies: name + order totals only')
  console.log('  Response:', JSON.stringify(response))
}

// gRPC: binary protocol, generated clients, for internal services
function demonstrategRPC() {
  // Proto definition (what you write):
  const proto = `
    service UserService {
      rpc GetUser (UserRequest) returns (UserResponse);
    }
    message UserRequest { int32 id = 1; }
    message UserResponse { string name = 1; string email = 2; }
  `
  console.log('\ngRPC approach:')
  console.log('  Binary protocol (not JSON) — faster, smaller')
  console.log('  Generated type-safe clients for Go, Java, Python, etc.')
  console.log('  Proto contract:')
  proto.split('\n').forEach(line => line.trim() && console.log(`    ${line.trim()}`))
  console.log('  Best for: internal service-to-service calls where performance matters')
}

demonstrateRESTFetching()
demonstrateGraphQL()
demonstrategRPC()
```

```text
REST approach:
  Request 1: GET /users/1  → full user object (overfetch)
  Request 2: GET /users/1/orders  → all orders
  Data needed: name="Alice", orderCount=2
  Wasted: email, role, full order objects

GraphQL approach:
  Single POST /graphql
  Client specifies: name + order totals only
  Response: {"user":{"name":"Alice","orders":[{"total":29.99},{"total":9.99}]}}

gRPC approach:
  Binary protocol (not JSON) — faster, smaller
  Generated type-safe clients for Go, Java, Python, etc.
  ...
```

**CS lens:** REST, GraphQL, and gRPC occupy different positions on the **server-client coupling** spectrum. REST couples clients to URL structure and response shape. GraphQL decouples clients from response shape but couples them to a schema. gRPC couples clients tightly to a proto definition, but the code generation makes that coupling explicit and type-checked. More coupling = less flexibility; less coupling = more complexity. Choose based on who your clients are and how they change.

## API Versioning and Evolution

```javascript
// Demonstrating backwards-compatible vs breaking changes:
function demonstrateEvolution() {
  const v1Response = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
  }

  // v2: BACKWARDS COMPATIBLE — added optional field
  const v2Response = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    createdAt: '2024-01-15T10:00:00Z',  // NEW — old clients ignore this
  }

  // v3: BREAKING — removed field, renamed field
  const v3Response = {
    id: 1,
    fullName: 'Alice Smith',  // RENAMED from 'name' — breaks callers using name
    // email removed — breaks callers using email
  }

  function checkCompatibility(old, next, label) {
    const oldKeys = new Set(Object.keys(old))
    const newKeys = new Set(Object.keys(next))

    const removed = [...oldKeys].filter(k => !newKeys.has(k))
    const added   = [...newKeys].filter(k => !oldKeys.has(k))

    const breaking = removed.length > 0
    console.log(`\n${label}: ${breaking ? 'BREAKING' : 'compatible'}`)
    if (removed.length) console.log(`  Removed fields: ${removed.join(', ')} ← callers using these will break`)
    if (added.length)   console.log(`  Added fields: ${added.join(', ')} ← callers ignore these safely`)
  }

  checkCompatibility(v1Response, v2Response, 'v1 → v2')
  checkCompatibility(v1Response, v3Response, 'v1 → v3')
}

demonstrateEvolution()
```

```text
v1 → v2: compatible
  Added fields: createdAt ← callers ignore these safely

v1 → v3: BREAKING
  Removed fields: name, email ← callers using these will break
  Added fields: fullName ← callers ignore these safely
```

**SE lens:** The rule for public APIs: **only additive changes are backwards compatible**. Add fields; never remove. Add endpoints; never remove. Add optional parameters; never make optional parameters required. When you must break an API, version it (`/v2/`) and maintain the old version long enough for all callers to migrate. At large companies, old API versions are maintained for years.

## Challenge: api_compatibility_checker

Implement an API compatibility checker.

`createApiCompatibilityChecker()` — returns an object with:
- `.check(oldSpec, newSpec)` — `oldSpec` and `newSpec` are `{ endpoints: Array<{ method: string, path: string, fields: string[] }> }`; returns `{ compatible: boolean, breakingChanges: string[], addedFeatures: string[] }`

Breaking changes: removed endpoint, removed field from existing endpoint.
Additive changes: new endpoint, new field in existing endpoint.
`compatible` is `true` only if `breakingChanges.length === 0`.

```challenge
function createApiCompatibilityChecker() {
  return {
    check(oldSpec, newSpec) {
      return { compatible: true, breakingChanges: [], addedFeatures: [] }
    },
  }
}
```

```test
const checker = createApiCompatibilityChecker()
const v1 = {
  endpoints: [
    { method: 'GET',  path: '/users',    fields: ['id', 'name', 'email'] },
    { method: 'POST', path: '/users',    fields: ['name', 'email'] },
  ]
}
const v2 = {
  endpoints: [
    { method: 'GET',    path: '/users',       fields: ['id', 'name', 'email', 'createdAt'] },
    { method: 'POST',   path: '/users',        fields: ['name', 'email'] },
    { method: 'DELETE', path: '/users/:id',    fields: [] },
  ]
}
const r1 = checker.check(v1, v2)
assert r1.compatible === true
assert r1.breakingChanges.length === 0
assert r1.addedFeatures.length === 2
const v3 = {
  endpoints: [
    { method: 'GET', path: '/users', fields: ['id', 'name'] },
  ]
}
const r2 = checker.check(v1, v3)
assert r2.compatible === false
assert r2.breakingChanges.length >= 2
```
