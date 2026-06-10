# Master Learning Plan — CAD/CAM MVP

Everything in one file: all topics, all lessons, all concepts.
Build individual lessons from this. Nothing here is implicit.

---

## What You Have

| Topic | Status |
|---|---|
| React + TypeScript | In progress |
| SQL + SQLite | In progress |
| UI patterns / layout | In progress |
| G-code | Professional experience |

---

## The MVP

A machinist draws a closed 2D profile at specific Z heights, selects it, defines
a contour toolpath (tool diameter, depth of cut, step-down, feed, speed), and
generates G-code for a 3-axis CNC mill. The output is real — correct enough to
cut a real part.

**2.5D means:** profiles are 2D shapes (lines and arcs) but exist at specific Z heights.
Depth comes from stepping Z down between passes. The viewport must be 3D — you cannot
know what Z height geometry is at from a top-down view.

---

## Technology Stack

```
Frontend                  Backend                 Shared
──────────────────        ────────────────────    ──────────────
React 19 + TypeScript     Python 3.12+            react-dock-canvas ✓
React Three Fiber         FastAPI                 Vitest (TS tests)
Drei                      Pydantic v2             pytest (Python)
Zustand                   SQLAlchemy 2
React Query               SQLite → PostgreSQL
Vite + Electron           numpy / scipy
                          WebSockets
```

---

## Topic Sequence and Timeline

| # | Topic | New Lessons | Weeks |
|---|---|---|---|
| 0 | Git Workflow | 1 | 0.5 |
| 1 | TypeScript: CSV → API → MongoDB | 20 | 3 |
| 2 | Software Architecture Survey | 7 | 2 |
| 3 | TDD and Clean Testing | 8 | 2 |
| 4 | Domain Modeling | 10 | 2 |
| 5 | Python + FastAPI | 24 | 4 |
| 6 | React Patterns + State | 8 | 2 |
| 7 | 3D Math | 7 | 1 |
| 8 | React Three Fiber + Drei | 6 | 2 |
| 9 | Parsing and Tokenisation | 5 | 1 |
| 10 | Computational Geometry | 9 | 2 |
| 11 | WebSockets + Real-time | 5 | 1 |
| — | **CAD/CAM MVP Build** | — | 5–6 |
| **Total** | | **~110** | **~29 weeks** |

---

## Design Patterns — Integrated Reference

Patterns are not a standalone topic. They appear where needed.

| Pattern | First appears | Also in |
|---|---|---|
| Adapter | Topic 2 | Topic 4 (Repository), Topic 5 |
| Repository | Topic 3 | Topic 4, Topic 5 |
| Value Object | Topic 3 | Topic 4 |
| Factory | Topic 4 | Topic 9 (token types) |
| Strategy | Topic 4 | Topic 10 (toolpath algorithms) |
| Observer | Topic 4 | Topic 6 (React Query) |
| Command | Topic 6 (undo/redo) | MVP |
| State Machine | Topic 9 (G-code modal) | Topic 8 (UI state) |
| Visitor | Topic 9 (AST walk) | MVP |
| Decorator pattern | Topic 5 | Topic 5 (FastAPI) |
| Event Bus | Topic 2 | MVP |

---

## Topic 0 — Git Workflow

**Project:** None — setup used for every subsequent project.

### Lesson 0.1 — Version Control and Git Basics

**Major concepts:**
- Why version control: the ability to go back to any point, work on multiple versions simultaneously
- `git init`, `git add`, `git commit`, `git status`, `git log`
- `.gitignore`: what to exclude — `node_modules/`, `__pycache__/`, `.env`, `dist/`, `*.pyc`
- Branches: creating (`git checkout -b`), switching, merging
- Merge conflicts: what they are, how to read the conflict markers, how to resolve

**Minor concepts:**
- Commit messages — imperative present tense convention: "Add validation" not "Added validation"
- `git diff` — seeing what changed before staging
- `git stash` — temporarily shelving uncommitted work
- The staging area — why `add` is separate from `commit`
- Remote vs local — `git push`, `git pull`, `git clone`

---

## Topic 1 — TypeScript: CSV → JSON API → MongoDB

**Project:** A contacts tool that grows through three phases — CSV parsing, API
fetching, MongoDB persistence.

**Why:** TypeScript is the language of the entire frontend. Language features must
be learned before framework features. Every subsequent topic uses TypeScript.

---

### Lesson 1.0a — Destructuring and Spread

**Major concepts:**
- Object destructuring: `const { name, age } = person`
- Renaming in destructuring: `const { name: fullName } = person`
- Default values: `const { name = 'unknown' } = person`
- Array destructuring: `const [first, ...rest] = items`
- Function parameter destructuring: `function greet({ name, age }: Person)`
- Spread in objects: `{ ...existing, newField: value }` — shallow merge, right side wins
- Spread in arrays: `[...array1, ...array2]`

**Minor concepts:**
- Nested destructuring: `const { address: { city } } = person`
- Spread creates a shallow copy — nested objects are still shared references
- Computed property names: `{ [dynamicKey]: value }`
- Rest in object destructuring: `const { id, ...rest } = person`

---

### Lesson 1.0b — Optional Chaining, Nullish Coalescing, Short-circuit

**Major concepts:**
- `?.` optional chaining: stops and returns `undefined` if any step is `null` or `undefined`
- `??` nullish coalescing: uses the right side only when left side is `null` or `undefined`
- `||` short-circuit: uses the right side when left side is any falsy value
- The critical difference: `0 || 'fallback'` → `'fallback'`; `0 ?? 'fallback'` → `0`
- `&&` short-circuit: evaluates right side only when left side is truthy
- `??=`, `||=`, `&&=` — nullish/logical assignment operators

**Minor concepts:**
- Optional chaining with method calls: `obj.method?.()`
- Optional chaining with indexing: `arr?.[0]`
- Chaining multiple `??`: `a ?? b ?? c`
- Why `??` replaced the `|| 'default'` pattern for optional config values

---

### Lesson 1.0c — Closures and `this` Binding

**Major concepts:**
- Closure: a function that captures variable references from its enclosing scope
- The closure captures the reference, not the value — the classic loop bug with `var`
- `let`/`const` in loops — each iteration gets its own binding
- Arrow functions: `this` is captured from the enclosing scope at definition time
- Regular functions: `this` is determined by how the function is called, not where it is defined
- `.bind(thisArg)` — creating a new function with a fixed `this`

**Minor concepts:**
- `.call(thisArg, ...args)` and `.apply(thisArg, args)` — calling with explicit `this`
- Why class methods lose `this` when passed as callbacks (and how to fix with arrow functions or `.bind`)
- The temporal dead zone — `let`/`const` exist in scope but are not yet initialised

---

### Lesson 1.0d — Map, Set, WeakMap, WeakSet

**Major concepts:**
- `Map<K, V>`: keys can be any type; preserves insertion order; O(1) get/set/has
- `Map` vs plain object: use `Map` when keys are not strings, when you need `.size`, when key order matters
- `Set<T>`: no duplicates; O(1) membership test with `.has()`
- Set operations via manual iteration: union, intersection, difference
- `WeakMap<object, V>`: entries are garbage-collected when the key object is; no iteration
- `WeakSet<object>`: same principle — tracks object presence without preventing GC

**Minor concepts:**
- `Map` iteration: `for (const [key, value] of map)` always yields pairs
- `Object.fromEntries(map)` — converting a `Map` back to a plain object
- `new Map(Object.entries(obj))` — creating a `Map` from a plain object
- Why `WeakMap` is used for caching computed values on DOM elements or objects

---

### Lesson 1.0e — Comprehensive Array and Object Methods

**Major concepts:**
- Array: `find`, `findIndex`, `findLast`, `findLastIndex` — first/last match
- Array: `some`, `every` — any/all items match
- Array: `flat(depth)`, `flatMap` — flatten nested arrays
- Array: `at(-1)` — negative indexing (last element without `.length - 1`)
- Array: `Array.from(iterable, mapFn)` — creating arrays from iterables
- Object: `Object.entries(obj)`, `Object.keys(obj)`, `Object.values(obj)`
- Object: `Object.fromEntries(entries)` — the inverse of `Object.entries`

**Minor concepts:**
- `structuredClone(obj)` — deep cloning without a library
- `Object.assign(target, source)` — shallow merge (vs spread)
- `Object.freeze(obj)` — preventing mutations (shallow freeze only)
- `Array.isArray(x)` — the only reliable way to check for arrays
- `groupBy` — grouping array elements (native in newer environments)

---

### Lesson 1.0f — Enums and Const Objects

**Major concepts:**
- `enum Direction { Up, Down }` — numeric enum; members assigned 0, 1, 2...
- `enum Status { Active = 'active', Inactive = 'inactive' }` — string enum
- `const enum` — inlined at compile time; no runtime object generated
- The alternative: `const STATUS = { Active: 'active' } as const` + `type Status = typeof STATUS[keyof typeof STATUS]`
- When to use `enum` vs `const` object: `const` object has better type inference and no double-emit

**Minor concepts:**
- Reverse mapping: numeric enums create both `Direction[0] === 'Up'` and `Direction.Up === 0`
- `const enum` cannot be used across module boundaries in some configs
- Why string enums are almost always better than numeric enums for readability

---

### Lesson 1.0g — Iterators and Generators

**Major concepts:**
- The iterator protocol: an object with `next()` returning `{ value: T, done: boolean }`
- Making a class iterable: implementing `[Symbol.iterator]()`
- `for...of` — consumes an iterator; works on any iterable (arrays, Maps, Sets, generators, strings)
- `function*` — generator function; execution pauses at each `yield`
- `yield` — produces a value and suspends; caller can get the next value with `next()`
- `yield*` — delegates to another iterable

**Minor concepts:**
- `Symbol.iterator` — the well-known symbol that marks an object as iterable
- Infinite generators — a counter that yields forever; use `take(n)` to get first N
- Async generators: `async function*` and `for await...of` — for streaming data
- Generator as state machine: `generator.next(inputValue)` sends a value in

---

### Lesson 1.1 — The TypeScript Type System

**Major concepts:**
- Primitive types: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`
- Type annotations — explicit declaration vs type inference
- `interface` vs `type` alias — structural typing; both describe shape; `interface` is extendable
- Union types: `string | number`
- Intersection types: `TypeA & TypeB`
- Literal types: `"active" | "inactive"`, `42`

**Minor concepts:**
- `any` — disables type checking; avoid
- `unknown` — like `any` but forces a type check before use
- `never` — the empty type; a function that never returns has this return type
- `void` — the return type of functions that return `undefined`

---

### Lesson 1.2 — Generics and Utility Types

**Major concepts:**
- Generics: `function identity<T>(x: T): T` — reusable logic that works for any type
- Generic constraints: `<T extends string>` — T must be assignable to string
- Utility types: `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`
- `ReturnType<F>` and `Parameters<F>` — extracting types from function signatures
- `keyof T` — the union of an object type's key names

**Minor concepts:**
- Indexed access types: `T[K]` — the type of property K on type T
- `Awaited<T>` — the type a Promise resolves to
- `NonNullable<T>` — removes `null` and `undefined` from a union
- Multiple type parameters: `function pair<A, B>(a: A, b: B): [A, B]`

---

### Lesson 1.3 — Discriminated Unions and Type Guards

**Major concepts:**
- Discriminated union: a union where each member has a shared literal field (`kind`, `type`)
- Type narrowing: TypeScript refining a type inside an `if`, `switch`, or after a type guard
- Built-in type guards: `typeof`, `instanceof`, `in`
- Custom type predicates: `function isString(x: unknown): x is string { return typeof x === 'string' }`
- `as const` — prevents literal widening; `'active'` stays `'active'`, not `string`

**Minor concepts:**
- Exhaustive checks: a `default` that assigns to `never` proves all cases handled
- The difference between a type guard (returns boolean with predicate) and type assertion (`as`)
- Why `as Type` casts are dangerous — they override the type checker with no runtime check

---

### Lesson 1.4 — Node.js File I/O and Modules

**Major concepts:**
- CommonJS (`require`/`module.exports`) vs ESM (`import`/`export`) — what each is and when used
- Reading files: `fs.readFileSync('path', 'utf-8')` vs `fs.promises.readFile('path', 'utf-8')`
- Buffers and encoding — why `'utf-8'` is required; without it you get a Buffer, not a string
- Named exports vs default exports — `export function foo()` vs `export default foo`
- Module resolution — how Node.js finds a file from a bare import string

**Minor concepts:**
- `import.meta.url` — the current file's URL in ESM (replaces `__dirname`)
- `path.join` vs `path.resolve` — relative vs absolute path construction
- `fs.existsSync` — checking a file exists before reading (avoids try/catch)
- Barrel files (`index.ts`) — re-exporting from a directory for cleaner imports

---

### Lesson 1.5 — Parsing Structured Text Without Regex

**Major concepts:**
- `.split(delimiter)` — splitting a string on a character or string
- `.trim()`, `.trimStart()`, `.trimEnd()` — removing whitespace
- `.map()` — transforming each element
- `.filter()` — removing elements that do not match
- `.reduce()` — folding an array into a single value
- Chaining methods — the output of one method is the input to the next

**Minor concepts:**
- Why regex is wrong for structured formats — brittle, unreadable, hard to test
- Handling edge cases: empty strings, trailing delimiters, quoted commas in CSV
- The state machine approach to CSV with quoted fields — introduced here, not yet implemented
- `.join()` — the inverse of `.split()`

---

### Lesson 1.6 — Validation Patterns and Error Accumulation

**Major concepts:**
- Fail-fast validation: throw on the first error; simpler but hides subsequent errors
- Error accumulation: collect all errors before reporting; better UX for form/file validation
- A `Result<T, E>` type: `{ ok: true; value: T } | { ok: false; errors: E[] }` — return errors, don't throw them
- Reporting with context: which row, which field, what value, what was wrong

**Minor concepts:**
- `try/catch` — synchronous exception handling; when to use and when to prefer `Result`
- Extending `Error` with a custom class for typed error handling
- The `zod` library — schema-based validation; introduced here, used in depth in Topic 6

---

### Lesson 1.7 — Async/Await and Promises

**Major concepts:**
- A Promise: a value that may not exist yet; has three states: pending, fulfilled, rejected
- `async function`: always returns a Promise; allows `await` inside
- `await`: pauses execution of the async function until the Promise resolves
- Error handling: `try/catch` with async/await; `.catch()` on a Promise chain
- `Promise.all([...])`: runs all Promises concurrently; resolves when all resolve; rejects if any reject

**Minor concepts:**
- `Promise.allSettled`: resolves with all results even if some reject — use when partial failure is acceptable
- `Promise.race`: resolves with the first to finish (either fulfilled or rejected)
- `Promise.any`: resolves with the first to fulfil; rejects only if all reject
- Unhandled promise rejection — crashes Node.js; always handle or `.catch()`

---

### Lesson 1.8 — HTTP with fetch

**Major concepts:**
- `fetch(url, options)` — the browser and Node.js HTTP client
- HTTP methods: GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE
- HTTP status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 500 Server Error
- `response.ok` — `true` for 200–299; network success ≠ application success
- `response.json()` — parsing JSON response body; returns a Promise
- Typing the response: `const data = await response.json() as MyType`

**Minor concepts:**
- HTTP headers: `Content-Type`, `Authorization`, `Accept`
- Query parameters: `new URLSearchParams({ page: '1' })` appended to URL
- Two distinct errors: network failure (fetch throws) vs non-200 status (fetch resolves but `response.ok` is false)
- `AbortController` — cancelling a fetch request

---

### Lesson 1.9 — Pagination and Data Transformation

**Major concepts:**
- Offset pagination: `?page=2&limit=20` — simple but fragile with insertions
- Cursor pagination: `?after=id_xyz` — stable; the cursor is an opaque identifier
- Fetching all pages: a `while` loop that stops when the next-page cursor is `null`
- Joining two data sources on a shared key — merging CSV data with API data by email

**Minor concepts:**
- Rate limiting: HTTP 429 status; exponential backoff retry pattern
- Why not to fetch all pages simultaneously — API rate limits and memory
- Data normalisation: storing each fact in one place; avoid duplicating fields across sources

---

### Lesson 1.10 — MongoDB Fundamentals

**Major concepts:**
- Document database vs relational: documents are self-contained JSON-like objects; no joins required for embedded data
- Collection: equivalent of a table; contains documents with no enforced schema
- `ObjectId`: MongoDB's default 12-byte document identifier
- Connecting with the native driver or Mongoose; when to use each
- BSON: MongoDB's binary JSON superset — supports `Date`, `ObjectId`, `Binary`, `Decimal128`

**Minor concepts:**
- Schema flexibility: documents in the same collection can have different fields — power and risk
- Embedded documents vs references: embed when data is always accessed together; reference when shared across documents
- The `_id` field: automatically created; always present; indexed by default

---

### Lesson 1.11 — MongoDB CRUD

**Major concepts:**
- `insertOne(doc)` / `insertMany(docs)` — create; returns inserted ID(s)
- `findOne(filter)` / `find(filter)` — read; `find` returns a cursor
- `cursor.toArray()` — materialising results (loads all into memory)
- `updateOne(filter, update)` with `$set`, `$unset`, `$inc`, `$push` — partial document updates
- `deleteOne(filter)` / `deleteMany(filter)` — remove documents

**Minor concepts:**
- `upsert: true` — insert if not found, update if found
- Projection: `{ name: 1, _id: 0 }` — returning only specific fields
- `sort()`, `limit()`, `skip()` — ordering and paginating results
- `replaceOne` — replacing the entire document (not just updating fields)

---

### Lesson 1.12 — MongoDB Query Operators and Indexes

**Major concepts:**
- Comparison: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`
- Array membership: `$in`, `$nin`, `$all`
- Logical: `$and`, `$or`, `$not`, `$nor`
- What an index is: a sorted data structure that lets MongoDB find documents without scanning every one
- `createIndex({ field: 1 })` — ascending index on a field

**Minor concepts:**
- Compound indexes: `{ lastName: 1, firstName: 1 }` — efficient for queries filtering on both
- Unique indexes: `{ email: 1 }, { unique: true }` — enforces no duplicates
- `explain('executionStats')` — seeing whether a query uses an index
- Full-text search index — `$text` search; introduced, not implemented

---

### Lesson 1.13 — MongoDB Aggregation Pipeline

**Major concepts:**
- Pipeline: a sequence of stages that each transform the documents flowing through
- `$match` — filter documents (always place early to reduce the working set)
- `$group` — aggregate: `{ _id: '$city', count: { $sum: 1 } }`
- `$sort` — order results
- `$project` — include or exclude fields; compute new fields
- `$lookup` — left join from another collection

**Minor concepts:**
- `$unwind` — flatten an array field into multiple documents (one per array element)
- `$limit` and `$skip` — pagination inside a pipeline
- `$facet` — running multiple pipelines in parallel on the same input
- Pipeline performance: `$match` and `$sort` before `$group` and `$lookup` reduce data early

---

## Topic 2 — Software Architecture Survey

**Project:** Redesign the contacts tool from Topic 1 using three different architectures.
Observe the tradeoffs directly by building the same logic three ways.

---

### Lesson 2.1 — What Architecture Is

**Major concepts:**
- Architecture = the rules about which parts of the code can depend on which other parts
- Coupling: how many things must change when one thing changes
- Cohesion: how related the code within a module is to each other
- The dependency rule: high-level policy should not depend on low-level detail
- Technical debt: the accumulation of shortcuts that slow down future changes

**Minor concepts:**
- Big Ball of Mud: the anti-pattern where everything depends on everything
- Conway's Law: the architecture mirrors the team's communication structure
- Accidental vs essential complexity — complexity the problem requires vs complexity introduced by the solution

---

### Lesson 2.2 — Layered (N-Tier) Architecture

**Major concepts:**
- Three layers: Presentation (UI) → Business Logic → Data Access
- Strict layering: each layer may only call the layer directly below it
- Why separation makes each layer independently testable
- The anemic domain model: when the logic layer is just data containers with no behaviour

**Minor concepts:**
- Four-layer variant: Presentation → Application → Domain → Infrastructure
- Transaction script: all logic in the application layer; domain is passive data
- Where layered architecture breaks down: vertical slice changes cut through all layers simultaneously

---

### Lesson 2.3 — Hexagonal Architecture (Ports and Adapters)

**Major concepts:**
- The domain is at the centre — it defines what it needs via interfaces (ports)
- Adapters implement those interfaces — swappable infrastructure (database, HTTP, file system)
- Primary adapters drive the application: HTTP request, CLI command, test runner
- Secondary adapters are driven by the application: database, email, message queue
- Dependency inversion: domain defines the interface; infrastructure implements it

**Minor concepts:**
- Why "hexagonal" — the shape is arbitrary; the symmetry between primary and secondary is the point
- Testing benefit: swap real adapters for fakes; domain logic tests run without any infrastructure
- The domain must not import any framework, ORM, or HTTP library

---

### Lesson 2.4 — Event-Driven Architecture

**Major concepts:**
- Events as immutable facts: "ContactSaved" happened — not "save a contact"
- Producers emit events; consumers react — no direct coupling between them
- Event bus: the mechanism that routes events from producers to consumers
- Choreography: each service knows what events to react to (no central coordinator)
- Orchestration: a central process tells other services what to do (explicit control flow)

**Minor concepts:**
- Event sourcing: storing events as the source of truth, not the current state
- At-least-once delivery: a consumer may receive the same event twice; idempotency required
- CQRS: separating the write model (commands, events) from the read model (queries)

---

### Lesson 2.5 — Modular Monolith vs Microservices

**Major concepts:**
- Monolith: one deployable unit; modules are logically separate but deploy together
- Microservices: independently deployable; communicate over a network
- Start with a monolith: no network overhead, easier refactoring, simpler operations
- When microservices make sense: different scaling needs per service, different team ownership, independent deployment cadence

**Minor concepts:**
- The distributed systems tax: network failure, latency, distributed transactions, service discovery
- Strangler fig: extracting a microservice from a monolith incrementally, without a rewrite
- Domain-driven service boundaries: services align with business capabilities, not technical layers

---

### Lesson 2.6 — Internal Event Bus Implementation

**Major concepts:**
- Event bus in code: a typed dispatcher that maps event names to subscriber functions
- Subscribing: `bus.on('ContactSaved', handler)` — registering a listener
- Publishing: `bus.emit('ContactSaved', payload)` — dispatching to all listeners
- Unsubscribing: preventing memory leaks when a component is destroyed
- Synchronous vs asynchronous dispatch — whether handlers run before or after `emit` returns

**Minor concepts:**
- Typed events: a discriminated union of all event shapes; TypeScript knows the payload type for each event name
- Re-entrancy: a handler that emits another event; event order can become surprising
- The difference between an internal event bus (in-process) and a message broker (between processes)

---

### Lesson 2.7 — Applying Architecture: Three Implementations

**Major concepts:**
- Reading existing code and identifying its architecture pattern
- Refactoring toward hexagonal without changing observable behaviour
- Tests as the safety net: if all tests pass after restructuring, behaviour is preserved
- Identifying the seam: the boundary between domain logic and infrastructure

**Minor concepts:**
- Adapter pattern as the concrete mechanism behind hexagonal ports
- Observer pattern as the concrete mechanism behind event-driven consumers
- Why tests written against the public interface survive refactoring; tests against internals do not

---

## Topic 3 — TDD and Clean Testing

**Project:** A library checkout system — books, members, checkouts, fines.
Every rule becomes a test before the code that satisfies it.

---

### Lesson 3.1 — What a Test Is

**Major concepts:**
- A test is an executable specification: it states what the code should do and proves it does so
- Tests as documentation that cannot go out of date — if the test passes, the behaviour is real
- The cost of not testing: bugs found in production cost 10–100× more than bugs found in tests

**Minor concepts:**
- Test runner: executes tests and reports results (pytest, Vitest, Jest)
- Assertion library: provides `assert`, `expect`, `assertEqual` — what tests use to check results
- Test coverage: the percentage of code lines executed by tests; 100% coverage ≠ bug-free

---

### Lesson 3.2 — Arrange / Act / Assert

**Major concepts:**
- Arrange: set up the objects and state the test needs
- Act: call exactly one function or method — the single thing being tested
- Assert: check exactly one outcome
- Why one Act and one Assert: a failing test should identify one broken behaviour, not leave you guessing

**Minor concepts:**
- Blank lines between phases as a visual signal
- Given / When / Then — the BDD names for the same three phases
- `beforeEach` / `setUp` for shared Arrange code — reduces duplication but makes individual tests less readable

---

### Lesson 3.3 — Red / Green / Refactor

**Major concepts:**
- Red: write a failing test — proves the test can catch the bug; names the feature before it exists
- Green: write the minimum code to pass — no more; do not anticipate future requirements
- Refactor: improve the code structure without changing observable behaviour — tests protect you
- The test must be seen to fail: a test that never fails proves nothing

**Minor concepts:**
- Triangulation: write two or three tests to force a general solution rather than a hardcoded one
- Fake it till you make it: return a hardcoded value to get green, then generalise in the refactor step
- The temptation to skip Red — this makes tests untrustworthy

---

### Lesson 3.4 — Test Naming

**Major concepts:**
- Test names are failing report messages: `member cannot check out more than 5 books`
- Names describe behaviour, not implementation: `test_cannot_checkout_more_than_limit` not `test_counter_gt_5`
- One behaviour per test function: if the test name requires "and", split it into two

**Minor concepts:**
- `describe` / `class` grouping: `describe('Member')` → `test('cannot check out more than 5 books')`
- Parameterised tests: one test body, multiple input sets — reduces duplication
- Flaky tests: tests that sometimes pass and sometimes fail without code changes — a sign of hidden state

---

### Lesson 3.5 — Unit vs Integration vs End-to-End Tests

**Major concepts:**
- Unit test: one function or class; no real infrastructure; uses fakes for dependencies; fast
- Integration test: two or more real components together (domain + real database); slower
- End-to-end test: the full system from the outside; slowest; highest confidence; most fragile
- The testing pyramid: many unit, fewer integration, fewest E2E

**Minor concepts:**
- The testing trophy (Kent C. Dodds): emphasises integration tests over unit tests for UI-heavy systems
- Why unit tests are valuable: they run in milliseconds, pinpoint failures precisely, run in any environment
- Contract tests: verify that a fake and a real implementation behave identically

---

### Lesson 3.6 — Test Doubles: Stub, Mock, Fake, Spy

**Major concepts:**
- Stub: returns a fixed value; does not record whether it was called
- Mock: records calls; can assert it was called with specific arguments in a specific order
- Fake: a working simplified implementation — an in-memory database that behaves like a real one
- Spy: wraps a real implementation; lets you observe and record actual calls

**Minor concepts:**
- Why overusing mocks produces brittle tests: they test how something works, not what it does
- Fakes are usually the best choice: they test behaviour through real logic
- Mock libraries: `unittest.mock` (Python), `vi.fn()` / `jest.fn()` (TypeScript)

---

### Lesson 3.7 — What NOT to Test

**Major concepts:**
- Do not test framework behaviour — if Django renders a template, do not prove that
- Do not test third-party library behaviour — you did not write it; the library author tested it
- Do not test private methods — test through the public interface only
- The golden rule: if you could swap the implementation for a completely different one and all tests still pass, the tests are correct

**Minor concepts:**
- Testing implementation details causes tests to break during refactoring even when behaviour is unchanged
- Tests that access private fields or internal state are fragile by design
- Property-based testing: generating random inputs to find edge cases the developer did not anticipate

---

### Lesson 3.8 — Testing with Fakes

**Major concepts:**
- A fake repository: an in-memory dictionary that satisfies the same interface as a real database
- Why fakes: tests run in microseconds; no database to set up or tear down; completely deterministic
- The interface a fake must satisfy: derived from what the domain needs, not from what the database provides
- Keeping fakes honest: the risk of a fake that behaves differently from the real implementation

**Minor concepts:**
- Contract tests: the same test suite runs against both the fake and the real implementation
- `conftest.py` / `beforeEach` fixtures for providing a fresh fake to each test
- When to use a real database in tests: for integration tests that verify the ORM queries are correct

---

## Topic 4 — Domain Modeling

**Project:** An event scheduling system — rooms, calendars, events, time ranges.
Includes interval overlap detection (CS algorithm) and a slot-finding scheduler.

---

### Lesson 4.0 — Big O Notation and Complexity

**Major concepts:**
- O(1): constant time — no matter the input size, same duration (hash map lookup)
- O(log n): logarithmic — each step halves the problem (binary search)
- O(n): linear — work grows with input size (scanning a list)
- O(n log n): common for efficient sorting (merge sort, quicksort)
- O(n²): quadratic — checking every pair; fine for n=10, catastrophic for n=10,000

**Minor concepts:**
- Best vs worst vs average case — Big O describes the worst case unless stated otherwise
- Space complexity — memory usage, not just time
- Practical threshold: O(n²) starts to hurt around n=10,000 on modern hardware
- Why this matters for CAD: 1,000 geometry items × O(n²) picking = 1,000,000 comparisons per click

---

### Lesson 4.1 — Data Structures Reference

**Major concepts:**
- Stack (LIFO): push, pop, peek — used for undo/redo, call stack, expression parsing
- Queue (FIFO): enqueue, dequeue — used for job queues, breadth-first search
- Hash map / dictionary: O(1) get/set/has by key — the most frequently used data structure
- Tree: hierarchical structure; root, parent, child, leaf — used for scene graphs, ASTs, split trees
- Graph: nodes connected by edges (directed or undirected) — used for dependency tracking

**Minor concepts:**
- Priority queue (heap): always returns the minimum (or maximum) element — used for scheduling
- Linked list: O(1) insert/delete at a known position; O(n) access by index
- Deque (double-ended queue): efficient push/pop from both ends
- When to use each: hash map for lookup, stack for reversal, queue for processing order, tree for hierarchy

---

### Lesson 4.2 — What a Domain Model Is

**Major concepts:**
- Domain: the problem the software solves — the rules and concepts the business owns
- Domain model: the code representation of those rules
- Why the domain must not know about databases, HTTP, or UI — these are delivery mechanisms, not the problem
- Rich domain model: objects contain both data and the rules that govern that data
- Anemic domain model: objects are just data containers; all logic is in service scripts — avoid

**Minor concepts:**
- Ubiquitous language: code uses the exact words the domain experts use — no translation
- Bounded context: the boundary within which a domain model applies; different contexts may use the same word differently
- Domain events: something that happened that the domain cares about

---

### Lesson 4.3 — Entity vs Value Object

**Major concepts:**
- Entity: defined by its identity — a `Room` with ID `room-42` is the same room even if its name changes
- Value Object: defined by its value — two `TimeRange(9am, 11am)` objects are equal regardless of instance
- Immutability for Value Objects: never modify; create a new one instead
- Python: `@dataclass(frozen=True)` with `__eq__` by value; `__hash__` automatic with `frozen=True`

**Minor concepts:**
- When to give something its own identity: if it must be tracked, referenced, or compared by ID
- The primitive obsession code smell: using `str` for email instead of an `Email` value object
- Enforcing invariants in Value Object construction: `TimeRange` raises if `end <= start`

---

### Lesson 4.4 — Aggregates

**Major concepts:**
- Aggregate: a cluster of objects that must stay consistent with each other
- Aggregate root: the only entry point — you do not reach inside and modify parts directly
- Consistency boundary: all changes to an aggregate happen in one transaction
- Small aggregates: easier to test, fewer concurrency conflicts, faster to load

**Minor concepts:**
- Reference by ID: aggregates reference each other by ID, not by object reference
- Why large aggregates cause contention: two users modifying different parts of the same aggregate block each other
- Eventual consistency between aggregates: they do not need to be consistent at the same instant

---

### Lesson 4.5 — Domain Services

**Major concepts:**
- Domain service: an operation that does not belong to a single entity
- Takes domain objects as arguments; returns domain objects or raises domain exceptions
- Contains business rules — not just coordination between infrastructure calls
- Naming: `SchedulingService.find_next_available_slot(attendees, duration)`

**Minor concepts:**
- Domain service vs application service: application services coordinate infrastructure; domain services contain rules
- When to put logic in an entity vs a domain service: entity if it needs its own state; service if it operates across multiple entities

---

### Lesson 4.6 — Repository Pattern in the Domain

**Major concepts:**
- Repository: an interface the domain defines — `get(id)`, `add(entity)`, `list(filter)`
- The domain never calls `session.commit()` or `collection.insertOne()` — those are infrastructure
- In tests: a fake repository (in-memory dictionary) satisfies the same interface
- In production: a SQLAlchemy or MongoDB implementation satisfies the same interface

**Minor concepts:**
- Unit of Work: the pattern that groups repository operations into a single transaction
- The repository feels like a collection — not like a query engine
- Why `list()` returns domain objects, not database rows or raw dictionaries

---

### Lesson 4.7 — Dependency Graph and Topological Sort

**Major concepts:**
- Dependency graph: a directed graph where an edge A→B means "A depends on B"
- DAG (Directed Acyclic Graph): no cycles — A cannot depend on itself via any path
- Topological sort: ordering nodes so every dependency comes before its dependent
- Why this matters for CAD/CAM: changing a profile must trigger regeneration of dependent toolpaths, which triggers dependent G-code

**Minor concepts:**
- Cycle detection: detecting "A depends on B depends on A" — an error in the domain
- Incremental regeneration: only regenerate nodes whose dependencies changed — not everything
- Depth-first search as the basis of topological sort

---

### Lesson 4.8 — Building the Scheduling Domain: Identifying Objects

**Major concepts:**
- Extracting entities and value objects from business rules by identifying nouns and verbs
- Identifying aggregates: "if I change X, must Y also change atomically?"
- Writing the ubiquitous language glossary before writing any code
- Drawing aggregate boundaries on paper first

**Minor concepts:**
- `Room` (entity), `Event` (entity), `TimeRange` (value object), `Duration` (value object), `Attendee` (value object)
- `Calendar` as the aggregate root for `Event`s
- `SchedulingService` as the domain service for slot-finding

---

### Lesson 4.9 — Building the Scheduling Domain: TDD

**Major concepts:**
- Writing tests from business rules: each rule in the glossary becomes at least one test
- Interval overlap as a CS problem: `[a, b]` and `[c, d]` overlap if `a < d and c < b`
- Sorting events by start time as a prerequisite to efficient overlap detection
- The slot-finding algorithm: a greedy search for the first gap that accommodates a duration

**Minor concepts:**
- Greedy algorithm: makes the locally optimal choice at each step; optimal here because we want the earliest slot
- Using a fake repository for all scheduling tests — no database needed
- Testing edge cases: zero-duration events, events at midnight, events that span midnight

---

### Lesson 4.10 — Applying Patterns to the Domain

**Major concepts:**
- Factory method: `Event.create(title, organiser, start, end)` — validates invariants before returning
- Strategy: multiple recurrence rules (daily, weekly, custom) implement a common interface
- Repository: fake implementation used in tests; SQLAlchemy implementation used in production

**Minor concepts:**
- Constructor vs factory: constructors cannot fail gracefully; factory methods return `Result` or raise
- The Open/Closed principle: adding a new recurrence strategy does not modify existing code
- Observer: `Calendar.add_event` emits `EventAdded`; listeners handle downstream effects

---

## Topic 5 — Python + FastAPI

**Project:** A task management API — projects, tasks, assignees, due dates.
Built with TDD before endpoints.

---

### Lesson 5.0a — Classes and OOP

**Major concepts:**
- `class` declaration, `__init__`, instance attributes vs class attributes
- Inheritance: `class Dog(Animal):` — inheriting methods and attributes
- `super().__init__()` — calling the parent initialiser
- `isinstance(obj, ClassName)` — checking type at runtime
- Method Resolution Order (MRO): which parent's method runs with multiple inheritance

**Minor concepts:**
- The difference between instance attributes (on `self`) and class attributes (on the class)
- `__new__` vs `__init__` — constructor vs initialiser; `__new__` creates, `__init__` configures
- Multiple inheritance with `super()`: the MRO ensures each class in the chain is called once

---

### Lesson 5.0b — Dunder Methods

**Major concepts:**
- `__repr__`: developer-readable representation; what you see in the REPL and in `repr(obj)`
- `__str__`: human-readable representation; what `print(obj)` calls
- `__eq__` and `__hash__`: equality (`==`) and use as dictionary key or set member
- `__len__` and `__contains__`: `len(obj)` and `item in obj`
- `__iter__` and `__next__`: making an object usable in `for x in obj:`

**Minor concepts:**
- `__getitem__` and `__setitem__`: `obj[key]` and `obj[key] = value`
- `__call__`: making an instance callable like a function: `obj()`
- `__enter__` and `__exit__`: the context manager protocol — introduced here, detailed in Lesson 5.0i
- `@functools.total_ordering`: implement `__eq__` and one comparison; get the rest automatically

---

### Lesson 5.0c — Decorators: The Mechanism

**Major concepts:**
- A decorator is a function that takes a function and returns a function
- `@decorator` syntax is sugar for `func = decorator(func)`
- `@functools.wraps(func)` — preserving the original function's name and docstring
- Decorators with arguments: `@retry(max_attempts=3)` — a function that returns a decorator
- Class decorators — applied to a class rather than a function

**Minor concepts:**
- Stacking decorators: `@a @b def f()` is `a(b(f))` — innermost runs first
- Why decorators must preserve the wrapped function's signature (for debugging and introspection)
- Decorator factories: a callable that takes config and returns a decorator

---

### Lesson 5.0d — `@property`, `@staticmethod`, `@classmethod`

**Major concepts:**
- `@property`: a method that behaves like an attribute — `obj.area` not `obj.get_area()`
- `@property.setter`: `obj.radius = 5` calls the setter method
- `@staticmethod`: belongs to the class but receives no `self` or `cls` — utility functions
- `@classmethod`: receives the class (`cls`) — alternative constructors: `Event.from_dict(data)`

**Minor concepts:**
- Read-only property: `@property` without a setter raises `AttributeError` on assignment
- `@cached_property`: computed once, then cached as an instance attribute (Python 3.8+)
- When to use `@staticmethod` vs a module-level function — use `@staticmethod` when the function conceptually belongs to the class

---

### Lesson 5.0e — `@dataclass` in Depth

**Major concepts:**
- `@dataclass`: auto-generates `__init__`, `__repr__`, `__eq__` from field declarations
- `field(default_factory=list)` — required for mutable defaults (never use `field: list = []`)
- `frozen=True` — immutable; assignments raise `FrozenInstanceError`; `__hash__` generated automatically
- `__post_init__` — runs after `__init__`; used for computed fields and validation
- `order=True` — auto-generates `__lt__`, `__le__`, `__gt__`, `__ge__` based on field order

**Minor concepts:**
- `ClassVar[T]` — class-level attribute excluded from `__init__` and `__repr__`
- `InitVar[T]` — constructor parameter that is not stored as an attribute
- `dataclasses.asdict(obj)` and `dataclasses.astuple(obj)` — serialisation helpers
- `@dataclass(slots=True)` — memory-efficient instances (Python 3.10+)

---

### Lesson 5.0f — Abstract Classes and Protocol

**Major concepts:**
- `ABC` (Abstract Base Class): `from abc import ABC, abstractmethod`
- `@abstractmethod` — subclasses must implement; instantiating the abstract class raises `TypeError`
- `Protocol` — structural typing: a class is compatible if it has the right methods, without inheriting
- Nominal typing (ABC): explicit "is-a" relationship declared in code
- Structural typing (Protocol): "has the right shape" — duck typing with type-checker support

**Minor concepts:**
- `@runtime_checkable` — allows `isinstance` checks against a Protocol class
- Abstract properties: `@property @abstractmethod` — subclasses must provide a property
- When to use ABC vs Protocol: ABC when the hierarchy matters; Protocol when you only care about the interface

---

### Lesson 5.0g — Enums

**Major concepts:**
- `enum.Enum`: members have a name and a value; `Status.ACTIVE` is not equal to `'active'`
- `enum.StrEnum` (Python 3.11+): members are strings; serialise cleanly to JSON as their value
- `enum.IntEnum`: members are integers; compatible with integer comparisons
- `enum.Flag` / `enum.IntFlag`: members can be combined with `|` — bit flags
- Why enums beat string constants: typos caught at definition time, not at runtime; IDE autocomplete

**Minor concepts:**
- `auto()` — auto-assigning values without specifying each one
- Iterating: `list(Status)` gives all members
- Enum methods: members can have their own methods — `Status.ACTIVE.label()` returning "Active"
- Using enums with Pydantic and SQLAlchemy (preview)

---

### Lesson 5.0h — Generators and `yield`

**Major concepts:**
- `yield` turns a function into a generator; execution pauses at each `yield` and resumes on `next()`
- `StopIteration` — raised when a generator is exhausted
- Generator expression: `(x * 2 for x in items)` — lazy; no list created until iterated
- `yield from iterable` — delegates to another iterable; equivalent to yielding each item
- Memory efficiency: a generator that yields 1 billion items uses O(1) memory

**Minor concepts:**
- `next(generator, default)` — gets next value or returns `default` if exhausted
- Generator pipelines: chain generators without materialising intermediate results
- `send(value)` — sends a value into the generator; the `yield` expression evaluates to it
- The tokeniser pattern: a generator that yields tokens one at a time from input text

---

### Lesson 5.0i — Context Managers

**Major concepts:**
- `with statement`: the block runs; cleanup runs even if an exception occurs
- `__enter__` returns a value (assigned to `as target`); `__exit__` receives exception info
- `contextlib.contextmanager`: write a context manager using `yield` in a generator
- Async context managers: `async with session.begin():` — `__aenter__` and `__aexit__`

**Minor concepts:**
- `contextlib.suppress(ExceptionType)` — silently ignoring specific exceptions
- Nested context managers: `with open(a) as f1, open(b) as f2:`
- `contextlib.ExitStack` — managing a variable number of context managers
- Why `with` is always better than `try/finally` for resource cleanup — it is `try/finally`

---

### Lesson 5.0j — `functools`, `itertools`, `collections`

**Major concepts:**
- `functools.partial(func, *args)` — pre-filling arguments; returns a new callable
- `functools.lru_cache(maxsize=128)` — memoising expensive pure functions
- `itertools.chain(*iterables)` — treating multiple iterables as one
- `itertools.groupby(iterable, key)` — grouping consecutive items (requires sorted input)
- `collections.defaultdict(factory)` — dict with automatic default values for missing keys
- `collections.Counter(iterable)` — counting occurrences; most common elements
- `collections.deque(maxlen=N)` — O(1) append and pop from both ends

**Minor concepts:**
- `functools.reduce(func, iterable, initial)` — fold a sequence to a single value
- `itertools.islice(iterable, n)` — first N items without materialising the whole iterable
- `itertools.combinations(iterable, r)` and `itertools.permutations`
- `collections.namedtuple` — lightweight immutable record type

---

### Lesson 5.0k — Advanced Type Hints

**Major concepts:**
- `TypeVar('T')` — a placeholder type used in generics; `T` is "some consistent type"
- `Generic[T]` — parameterised class: `class Stack(Generic[T]):`
- `Callable[[ArgType1, ArgType2], ReturnType]` — the type of a function
- `TypedDict` — a dictionary with typed keys: `class Config(TypedDict): host: str; port: int`
- `TYPE_CHECKING` — avoiding circular imports while preserving type annotations: `if TYPE_CHECKING: import X`

**Minor concepts:**
- `@overload` — declaring multiple type signatures for the same function
- `cast(TargetType, value)` — telling the type checker to treat a value as a specific type
- `ParamSpec` — capturing the parameter signature of a callable for decorator typing
- `Final[T]` — a value that must not be reassigned after initialisation

---

### Lesson 5.1a — Pydantic v2 (Standalone)

**Major concepts:**
- `BaseModel` — auto `__init__`, `__repr__`, validation on assignment; all from field declarations
- `Field(alias='json_name', ge=0, le=100, min_length=1)` — per-field constraints and metadata
- `@field_validator('field_name')` — custom validation for one field
- `@model_validator(mode='after')` — validation across multiple fields after all are set
- `model_dump()` — to dict; `model_validate(dict)` — from dict
- Discriminated unions: `Annotated[Cat | Dog, Field(discriminator='kind')]`
- `model_config = ConfigDict(frozen=True, extra='forbid')` — model-level settings

**Minor concepts:**
- `@computed_field @property` — a field computed from other fields; included in serialisation
- `RootModel[list[str]]` — a model whose root is a single value
- Alias and serialisation alias: different names in Python code and JSON
- `model_rebuild()` — required when models have forward references to each other

---

### Lesson 5.0 — Environment Configuration and Python Setup

**Major concepts:**
- Virtual environment: isolated Python installation per project — prevents dependency conflicts
- `python -m venv .venv` and activating it — every project needs this
- `requirements.txt` vs `pyproject.toml` — two ways to declare dependencies; `pyproject.toml` is current
- `.env` file: key=value pairs for secrets and configuration; never committed to git
- `python-dotenv`: loading `.env` into `os.environ`
- Pydantic `BaseSettings`: typed, validated configuration from environment variables

**Minor concepts:**
- `pip install -r requirements.txt` and `pip freeze > requirements.txt`
- `poetry` and `uv` — modern dependency managers (introduced; not used in depth)
- Dev vs prod config: different database URLs, debug flags, log levels
- Why secrets must not be in source code: git history is permanent

---

### Lesson 5.1 — FastAPI Routing

**Major concepts:**
- `@app.get("/path")`, `@app.post("/path")` — route decorators
- Path parameters: `/tasks/{task_id}` — typed automatically by FastAPI
- Query parameters: `?status=active` — declared as function parameters with defaults
- Request body: a Pydantic model declared as a function parameter
- Response model: `response_model=TaskResponse` — controls what FastAPI serialises

**Minor concepts:**
- `status_code=201` for creates; `status_code=204` for deletes with no body
- `HTTPException(status_code=404, detail="Not found")` — raising HTTP errors
- `APIRouter` — grouping routes into separate modules
- Automatic OpenAPI docs at `/docs` — generated from your code for free

---

### Lesson 5.2 — FastAPI Dependency Injection

**Major concepts:**
- `Depends(get_db)` — declaring a dependency; FastAPI calls it and passes the result
- Dependency chaining: a dependency that itself has dependencies
- Database session as a dependency: `async with AsyncSession(...) as session: yield session`
- Authentication as a dependency: `current_user: User = Depends(get_current_user)`

**Minor concepts:**
- `yield` in a dependency: setup runs before `yield`, teardown runs after
- Shared dependencies: FastAPI calls the dependency once and shares the result across handlers that need it
- Testing with dependency overrides: `app.dependency_overrides[get_db] = get_fake_db`

---

### Lesson 5.3 — SQLAlchemy 2: Models and Relationships

**Major concepts:**
- Mapped classes: `class Task(Base): __tablename__ = "tasks"`
- Column types: `Mapped[int]`, `Mapped[str]`, `Mapped[datetime | None]`
- Relationships: `Mapped[list["Task"]] = relationship(back_populates="project")`
- `AsyncSession`: async equivalent of `Session`
- Session operations: `session.add(obj)`, `await session.commit()`, `await session.refresh(obj)`

**Minor concepts:**
- The identity map: SQLAlchemy tracks objects; fetching the same row twice returns the same object
- `lazy='select'` vs `'joined'` vs `'subquery'` loading strategies
- `expire_on_commit=False` — keeping attribute values after a commit

---

### Lesson 5.4 — SQLAlchemy 2: Queries

**Major concepts:**
- `select(Task)` — building a SELECT statement
- `where(Task.status == "active")` — filtering
- `session.scalars(stmt).all()` — executing and materialising results
- `session.get(Task, task_id)` — fetch by primary key; returns `None` if not found
- `update(Task).where(Task.id == id).values(status="done")` — bulk update

**Minor concepts:**
- `order_by(Task.created_at.desc())`, `limit(20)`, `offset(page * 20)` — sorting and pagination
- `select(Task).join(Project)` — joining related tables
- `all()` vs `first()` vs `one()` vs `one_or_none()` — what each returns on zero or multiple results

---

### Lesson 5.5 — Alembic: Database Migrations

**Major concepts:**
- Migration: a versioned, reversible change to the database schema
- `alembic init migrations` — setting up migration infrastructure
- `alembic revision --autogenerate -m "add tasks table"` — generating a migration from model changes
- `alembic upgrade head` — applying all pending migrations
- `alembic downgrade -1` — reversing the most recent migration

**Minor concepts:**
- Migration conflicts: two developers create migrations on different branches; must be resolved
- Data migrations: transforming existing data alongside schema changes
- Why never edit production database manually — the migration log is the source of truth

---

### Lesson 5.6 — Async Python

**Major concepts:**
- `async def`: always returns a coroutine; must be `await`ed to run
- `await`: pauses the coroutine until the awaited operation completes; the event loop runs other tasks
- Why async helps I/O-bound work: while waiting for the database, the server handles another request
- Why async does NOT help CPU-bound work: the GIL still runs only one thread at a time

**Minor concepts:**
- `asyncio.gather(*coroutines)` — running multiple coroutines concurrently
- `asyncio.create_task` — scheduling a coroutine to run without immediately awaiting it
- Async context managers: `async with`, `async for`
- The event loop — what runs your coroutines; not usually interacted with directly

---

### Lesson 5.7 — Authentication: JWT and Password Hashing

**Major concepts:**
- Never store plaintext passwords — use `bcrypt` or `argon2` (one-way hashing)
- JWT (JSON Web Token): a signed token containing claims; the server signs it, the client stores it
- JWT structure: `header.payload.signature` — base64url encoded; the signature prevents tampering
- Protected route: a FastAPI dependency that reads the token, verifies the signature, returns the user
- OAuth2 password flow: the client sends username + password; receives an access token

**Minor concepts:**
- `python-jose` or `PyJWT` — libraries for encoding and decoding JWTs
- `passlib[bcrypt]` — password hashing library
- Access token vs refresh token — short-lived vs long-lived; why two tokens
- Token expiry: `exp` claim in the JWT payload; expired tokens are rejected

---

### Lesson 5.8 — Testing FastAPI with pytest

**Major concepts:**
- `httpx.AsyncClient(app=app, base_url="http://test")` — testing without a running server
- pytest fixtures for database: create tables, provide a session, roll back after each test
- Dependency overrides: `app.dependency_overrides[get_session] = get_test_session`
- Testing happy paths and all error paths: 400 on invalid input, 404 on missing ID, 401 on no token

**Minor concepts:**
- `@pytest.mark.asyncio` — running async test functions with pytest
- `conftest.py` — sharing fixtures across test files
- `@pytest.mark.parametrize` — one test body, multiple input sets
- Factory helpers for test data — `make_task(title="Test")` with sensible defaults

---

## Topic 6 — React Patterns and State Management

**Project:** A contact manager UI connecting to the FastAPI backend from Topic 5.

---

### Lesson 6.1 — Zustand: Basic Store

**Major concepts:**
- What a store is: global state that any component can subscribe to and update
- `create<State>((set) => ({ ... }))` — creating a store
- `useStore(state => state.value)` — subscribing to a slice; re-renders only when that slice changes
- Actions: functions inside the store that call `set` to update state
- Selector: `useStore(s => s.selectedId)` — deriving a value from store state

**Minor concepts:**
- Zustand vs Context: Context re-renders all consumers on any change; Zustand re-renders only subscribers to the changed slice
- `useShallow` — preventing re-renders when an object reference changes but values are the same
- Why not everything goes in one store: unrelated state should be separate stores

---

### Lesson 6.2 — Zustand: Middleware and Slices

**Major concepts:**
- `immer` middleware: write mutations directly; Zustand applies them immutably
- `persist` middleware: saves state to `localStorage` automatically on every change
- `devtools` middleware: exposes state to Redux DevTools browser extension
- Slices: logically separate sections of state with their own actions; combined into one store

**Minor concepts:**
- When not to persist: transient UI state (modal open, hover) should not survive a page reload
- State migration in persisted stores: when the stored shape changes between versions
- `subscribeWithSelector` middleware: efficiently subscribing to deep state changes

---

### Lesson 6.3 — React Query: Fetching and Caching

**Major concepts:**
- `useQuery({ queryKey, queryFn })` — declarative data fetching; handles loading, error, success states
- Query key: `['contacts', { city: 'London' }]` — the cache key; same key = same cache entry
- Stale time: how long data is considered fresh; during this time, no background refetch
- Cache time: how long inactive data stays in memory before being garbage collected
- Automatic refetching: on window focus, on network reconnect

**Minor concepts:**
- `enabled` option: `enabled: !!userId` — only fetch when a condition is true
- `select` option: transforms data before the component receives it; result is separately memoised
- `isLoading` (never fetched, no data) vs `isFetching` (fetching, may have stale data)
- `initialData` — providing data before the first fetch

---

### Lesson 6.4 — React Query: Mutations and Optimistic Updates

**Major concepts:**
- `useMutation({ mutationFn, onSuccess })` — sending data to the server
- `onSuccess`: `queryClient.invalidateQueries(['contacts'])` — marks cache stale, triggers refetch
- Optimistic updates: update the cache immediately; roll back if the server rejects
- Pattern: `onMutate` (snapshot + update), `onError` (roll back), `onSettled` (always refetch)

**Minor concepts:**
- `queryClient.setQueryData` — directly writing to the cache without a fetch
- `isPending` — the mutation is in flight; use to disable submit buttons
- `isError` and `error` — what to show the user when a mutation fails
- Retry on failure: `retry: 3` on a mutation

---

### Lesson 6.5 — Custom Hooks

**Major concepts:**
- A custom hook: a function starting with `use` that may call other hooks
- Extracting logic: when the same stateful code appears in two or more components
- Return shape: `return { value, setValue }` vs `return [value, setValue]` — object for named fields, tuple for convention
- Composing hooks: a custom hook that calls other custom hooks

**Minor concepts:**
- Rules of hooks apply to custom hooks: only call hooks at the top level
- Testing custom hooks: `renderHook(() => useMyHook())` from React Testing Library
- The "God hook" anti-pattern: a hook that does many unrelated things

---

### Lesson 6.6 — react-hook-form and Zod

**Major concepts:**
- `useForm<Schema>({ resolver: zodResolver(schema) })` — typed form with schema validation
- `register('fieldName')` — connecting an HTML input to the form
- `handleSubmit(onValid, onInvalid)` — validating on submit; calling handler only if valid
- `formState.errors` — accessing per-field error messages
- Controlled vs uncontrolled: react-hook-form defaults to uncontrolled for performance

**Minor concepts:**
- `watch('fieldName')` — reading a field value in real time; use sparingly (re-renders on change)
- `setValue`, `reset`, `setError` — programmatically interacting with the form
- `useFieldArray` — dynamic lists of inputs (add/remove)
- Zod schemas: `z.object({ name: z.string().min(1), email: z.string().email() })`

---

### Lesson 6.7 — Error Boundaries and Suspense

**Major concepts:**
- Error boundary: a React component that catches render errors in its child subtree
- What error boundaries catch: errors during render, in lifecycle methods, in constructors
- What they do NOT catch: async errors, event handler errors, errors outside React
- `<Suspense fallback={<Spinner />}>` — showing a fallback while children are loading

**Minor concepts:**
- `react-error-boundary` library — the `ErrorBoundary` function component version
- `resetKeys` — automatically resetting the boundary when specific props change
- React Query + Suspense: `throwOnError: true` in `useQuery` lets Suspense handle loading

---

### Lesson 6.8 — Frontend Testing with React Testing Library

**Major concepts:**
- Testing philosophy: test what the user sees and does; not implementation details
- `render(component)` and `screen` — rendering and querying the DOM
- Accessible queries: `getByRole('button', { name: 'Submit' })`, `getByLabelText('Email')`
- `userEvent.type(input, 'hello')` and `userEvent.click(button)` — simulating real interactions
- `waitFor(() => expect(el).toBeInTheDocument())` — waiting for async DOM changes
- `msw` (Mock Service Worker): intercepting `fetch` at the network level in tests

**Minor concepts:**
- `findByRole` vs `getByRole` vs `queryByRole` — async vs synchronous vs nullable
- Why `getByRole` is preferred: it tests accessibility, not CSS class names
- `within(container).getByText('...')` — scoping a query to a specific element
- `screen.debug()` — printing the current DOM for debugging

---

## Topic 7 — 3D Math Fundamentals

**Project:** A coordinate explorer — a Three.js scene where you can type coordinates,
see points move, apply rotations, and click to see world-space positions.

---

### Lesson 7.1 — Vectors

**Major concepts:**
- Vector: a magnitude and direction, represented as `(x, y, z)` components
- Vector addition: `A + B` — moving in two directions sequentially
- Scalar multiplication: `2 * v` — scaling the magnitude
- Vector subtraction: `B - A` — the vector pointing from A to B
- Magnitude: `|v| = sqrt(x² + y² + z²)`
- Normalisation: `v / |v|` — unit vector; length 1; direction preserved

**Minor concepts:**
- The difference between a point (a position) and a vector (a displacement) — same representation, different meaning
- Zero vector — has no direction; normalising it is undefined
- Why normalised vectors are used for directions: the length carries no information

---

### Lesson 7.2 — Dot Product and Cross Product

**Major concepts:**
- Dot product: `a · b = |a||b|cos(θ)` — gives the cosine of the angle between two vectors
- Dot product of unit vectors: the result is directly the cosine of the angle
- Uses of dot product: checking if vectors point the same way (positive), opposite (negative), perpendicular (zero)
- Cross product: `a × b` — a vector perpendicular to both; magnitude = `|a||b|sin(θ)`
- Uses of cross product: computing surface normals; determining winding order (CW vs CCW)

**Minor concepts:**
- Right-hand rule: fingers curl from a to b; thumb points in the direction of a × b
- Cross product is not commutative: `a × b = -(b × a)`
- 2D cross product: the Z component of the 3D cross product tells CW/CCW winding

---

### Lesson 7.3 — Matrices and Transforms

**Major concepts:**
- A 4×4 matrix represents any combination of translation, rotation, and scale
- Multiplying a point by a matrix transforms it into a new position
- Composing transforms by multiplying matrices: `M_world = M_scale * M_rotate * M_translate`
- Matrix multiplication order matters: TRS vs SRT produce different results
- Model matrix, view matrix, projection matrix — the three transforms in 3D rendering

**Minor concepts:**
- Homogeneous coordinates: why 4×4 instead of 3×3 — translation cannot be represented in 3×3
- Row-major vs column-major: different libraries store matrices in memory differently; know which yours uses
- Matrix inverse: undoing a transform — if M transforms world to view, M⁻¹ transforms view to world

---

### Lesson 7.4 — Coordinate Systems

**Major concepts:**
- Local space: an object's own coordinate system, origin at the object's pivot
- World space: the shared coordinate system all objects live in
- View space: world coordinates relative to the camera's position and orientation
- Clip space: after the projection matrix; normalised to a cube for the GPU
- NDC (Normalised Device Coordinates): clip space divided by W; (-1,-1) to (1,1)

**Minor concepts:**
- Screen space: NDC remapped to pixel coordinates in the window
- The full pipeline: local → world → view → clip → NDC → screen
- Y-up vs Z-up: Three.js is Y-up; most CNC machine coordinate systems are Z-up

---

### Lesson 7.5 — Quaternions

**Major concepts:**
- Gimbal lock: why composing three Euler-angle rotations causes a degree of freedom to be lost
- Quaternion: encodes a rotation as an axis and angle in 4 numbers; avoids gimbal lock
- Composing quaternion rotations: multiply them (non-commutative, like matrices)
- `slerp`: smooth spherical linear interpolation between two rotations (used in animation)
- How to use quaternions without deriving them: create from axis+angle, multiply, apply to vector

**Minor concepts:**
- Normalising a quaternion: floating-point drift accumulates; renormalise periodically
- Converting between Euler angles and quaternions — useful when the user inputs angles
- Why cameras in 3D applications store orientation as a quaternion internally

---

### Lesson 7.6 — Ray Casting and Picking

**Major concepts:**
- A ray: an origin point and a direction vector — `P(t) = origin + t * direction`
- Screen to world: a 2D mouse position → NDC → unproject through inverse projection and view matrices → 3D ray
- Ray-plane intersection: where the ray hits a flat plane (e.g. the XY plane at Z=construction_z)
- Application: clicking on the 3D viewport returns the world-space position of the click on the construction plane

**Minor concepts:**
- Near and far clip planes: the ray starts at the near plane and ends at the far plane
- Ray-triangle intersection: the Möller–Trumbore algorithm — picking arbitrary 3D meshes
- `Raycaster` in Three.js: the built-in helper that handles the math

---

### Lesson 7.7 — Perspective vs Orthographic Projection

**Major concepts:**
- Perspective projection: objects further away appear smaller — matches human vision; 3D sense of depth
- Orthographic projection: no foreshortening — parallel lines stay parallel; dimensions are accurate
- Field of view (FOV): wider = more in view but more distortion; narrower = telephoto effect
- Why CAD tools default to orthographic: dimensions look accurate; no foreshortening to confuse measurements

**Minor concepts:**
- The frustum: the visible volume of the perspective camera — a truncated pyramid
- The ortho box: the visible volume of the orthographic camera — a rectangular box
- Near and far clip planes: everything outside this range is invisible; affects depth buffer precision

---

## Topic 8 — React Three Fiber + Drei

**Project:** An interactive 3D model viewer with orbit, picking, measurement, and view cube.

---

### Lesson 8.1 — The R3F Mental Model

**Major concepts:**
- R3F reconciler: translates JSX into Three.js `new` calls; props map to properties and methods
- `<mesh>`, `<boxGeometry>`, `<meshStandardMaterial>` — lowercase because they are Three.js classes, not React components
- `position={[x, y, z]}` — R3F calls `mesh.position.set(x, y, z)` automatically
- `args={[width, height, depth]}` — the array passed to the Three.js constructor
- `attach="geometry"` — explicitly attaching a child to a specific parent property

**Minor concepts:**
- `extend({ MyGeometry })` — registering a custom Three.js class for use as JSX
- Why mutations (rotation animation) go in `useFrame`, not in render — render runs only on state change
- The canvas: `<Canvas>` creates the WebGL context, renderer, and scene; everything inside is R3F

---

### Lesson 8.2 — `useFrame` and `useThree`

**Major concepts:**
- `useFrame((state, delta) => { ... })` — callback called every animation frame
- `delta`: seconds since the last frame — use to make animation frame-rate independent
- `state.camera`, `state.scene`, `state.gl` — access to core Three.js objects
- `useThree()` — access the same state outside of `useFrame`

**Minor concepts:**
- `useFrame` priority: `useFrame(callback, priority)` — lower number runs first
- `state.clock.elapsedTime` — seconds since the canvas was created
- Why `useState` setters in `useFrame` are expensive: they trigger re-renders; use refs for per-frame values

---

### Lesson 8.3 — Geometry, Materials, and Lights

**Major concepts:**
- Geometry: the shape data — `BoxGeometry`, `SphereGeometry`, `BufferGeometry` (custom)
- Material: the appearance — `MeshStandardMaterial` (PBR, needs lights), `MeshBasicMaterial` (no lighting), `LineBasicMaterial`
- `mesh` = geometry + material — one mesh, one geometry, one material
- Lights: `ambientLight` (fills all directions equally), `directionalLight` (parallel rays), `pointLight` (radiates from a point)

**Minor concepts:**
- `useMemo` for geometry: creating geometry inside a component would recreate it on every render
- Wireframe: `<meshStandardMaterial wireframe={true} />` — useful for debugging geometry
- `side={THREE.DoubleSide}` — rendering both faces of a plane; needed for flat geometry visible from behind

---

### Lesson 8.4 — Drei Helpers

**Major concepts:**
- `<OrbitControls>` — mouse: left=orbit, right=pan, scroll=zoom
- `<Grid>` — the reference grid on the XZ (or XY) plane
- `<Line points={[[x1,y1,z1],[x2,y2,z2]]}` — drawing lines through world-space points
- `<Html>` — rendering React/HTML inside the 3D scene, anchored to a 3D position
- `<GizmoHelper>` — the view cube overlay showing current camera orientation

**Minor concepts:**
- `<Text>` — 3D text rendering with anti-aliasing (uses troika-three-text)
- `<Billboard>` — making an object always face the camera (for labels and icons)
- `<Environment>` — HDR image-based lighting for realistic reflections
- `<useGLTF(url)>` — loading .glb/.gltf model files

---

### Lesson 8.5 — Pointer Events and Hit Testing

**Major concepts:**
- `onClick`, `onPointerDown`, `onPointerOver`, `onPointerOut` on any R3F mesh
- The event object: `event.point` (3D hit position), `event.object` (the mesh hit), `event.distance`
- `event.stopPropagation()` — prevents the event from reaching meshes behind the hit one
- Hover state pattern: store the hovered mesh ID in `useState`; update `onPointerOver`/`Out`

**Minor concepts:**
- `visible={false}` — invisible meshes do not receive pointer events
- Custom `raycast` prop — providing your own intersection test function for non-standard geometry
- Performance: pointer events run raycasting every frame; `meshes` with `raycast={noop}` are excluded

---

### Lesson 8.6 — R3F Performance Patterns

**Major concepts:**
- `useMemo` for geometry and material — created once; do not recreate on every render
- `instancedMesh` — rendering thousands of identical objects in one draw call
- `<Instances>` from Drei — the declarative API for instanced rendering
- `dispose()` in `useEffect` cleanup — releasing GPU memory when a component unmounts

**Minor concepts:**
- Draw calls: the GPU switch between each draw call costs time; fewer is always better
- `<Stats>` from Drei — FPS and draw call counter overlaid on the canvas during development
- `frustumCulled={true}` (default) — Three.js skips rendering objects outside the camera's view
- LOD (Level of Detail): showing simpler geometry for distant objects — `<Lod>` in Drei

---

## Topic 9 — Parsing and Tokenisation

**Project:** A G-code parser that produces typed move objects from `.nc` files.
The focus is the CS — tokenisation, parsing, modal state — not learning G-code.

---

### Lesson 9.1 — What Parsing Is

**Major concepts:**
- Raw text → tokens → structure — the two-stage pipeline
- Token: the smallest meaningful unit — `G01`, `X50.0`, `F400`, `;comment`
- Parser: consumes a token stream and produces a structured result
- Why parsers matter: all compilers, config files, data formats, and protocols are parsed

**Minor concepts:**
- Lexer / tokeniser / scanner — different names for the same first stage
- Context-free grammar: a formal description of what a language contains
- AST (Abstract Syntax Tree): the tree representation of a parsed program

---

### Lesson 9.2 — Tokenisation

**Major concepts:**
- The tokeniser reads the raw string character by character and emits typed tokens
- Token types for G-code: G-word, M-word, axis-word (X/Y/Z), F-word, N-word, comment, end-of-block
- Handling whitespace and comments during tokenisation — skip or capture, depending on the format
- Emitting a stream (generator) rather than a list: the parser can start before tokenisation finishes

**Minor concepts:**
- Regex for tokenisation: this IS the right use of regex — matching fixed token patterns at the start of a string
- Lookahead: reading one extra character to decide what token type is starting
- Error tokens: what to emit when an unexpected character appears — do not crash

---

### Lesson 9.3 — Parsing Tokens into Typed Objects

**Major concepts:**
- Recursive descent: one function per grammar rule; each function consumes tokens and returns an object
- A G-code block: a collection of word tokens on one line → one command object
- Error recovery: on an invalid block, report the error, advance to the next line, continue
- The visitor pattern: walking the parsed structure to produce output (e.g. summary text)

**Minor concepts:**
- First set: the tokens that can start a grammar rule — used for lookahead decisions
- Serialisation: producing the canonical text representation from the parsed structure
- Separating parsing (recognising structure) from interpretation (applying meaning)

---

### Lesson 9.4 — Modal State Tracking

**Major concepts:**
- Modal state: a setting that persists until explicitly changed — current feed rate, current plane, current positioning mode
- Implementing a modal state object carried through the entire parse
- Resolving implied values: `G01 X50` with no feed rate uses the last stated feed rate
- State machine: the parser transitions between states as it encounters modal G-codes

**Minor concepts:**
- Default initial modal values at program start (control-specific; Fanuc: G17, G90, G94, G40)
- Why modal state makes tests need complete setup — fixtures provide default state
- Detecting invalid modal combinations at parse time (e.g. G02 without I/J or R)

---

### Lesson 9.5 — Testing Parsers

**Major concepts:**
- Round-trip testing: parse a file → serialise → compare with original (modulo whitespace)
- Testing each grammar rule independently with minimal input
- Parametrised tests: `@pytest.mark.parametrize` — one test body, many input/expected pairs
- Error case testing: invalid input must produce a specific error message, not a crash or silent wrong result

**Minor concepts:**
- Snapshot testing: storing expected output; comparing future runs against the stored snapshot
- Property-based testing: generating random valid G-code to find parser crashes
- The importance of testing the modal state machine: which state did we start in, which did we end in

---

## Topic 10 — Computational Geometry

**Project:** A 2D geometry library with full test coverage.
Also adds DXF file import at the end.

---

### Lesson 10.0 — Floating Point Precision

**Major concepts:**
- IEEE 754: floats are binary fractions; many decimal values have no exact binary representation
- `0.1 + 0.2 !== 0.3` — the canonical example; not a bug, it is how binary arithmetic works
- Machine epsilon: the smallest difference between two representable floats (`Number.EPSILON` in JS, `sys.float_info.epsilon` in Python)
- Epsilon comparison: `abs(a - b) < EPSILON` instead of `a == b` for geometry checks
- Absolute vs relative tolerance: absolute for small values (coordinates near zero), relative for large values

**Minor concepts:**
- Accumulation error: many floating-point operations accumulate rounding errors
- The `Decimal` type in Python: arbitrary precision; use when exact arithmetic is required
- Why CAD applications use tolerances everywhere: a point "on" a line has distance < epsilon, not distance == 0
- `round(x, n)` — rounds to n decimal places; useful for output, not for comparison

---

### Lesson 10.1 — 2D Primitive Types

**Major concepts:**
- Point: `(x, y)` — a position in the plane; immutable value object
- Line segment: two endpoints; finite length; direction
- Arc: centre, radius, start angle, end angle, direction (CW or CCW)
- Polyline: an ordered list of points connected by segments
- Closed profile: a polyline where the last point equals the first; represents a boundary

**Minor concepts:**
- The difference between a line (infinite) and a segment (finite endpoints)
- Representing an arc by three points instead of centre/radius/angles — useful for user input
- Why direction matters for arcs: same endpoints, same centre, two possible paths

---

### Lesson 10.2 — Line-Line Intersection

**Major concepts:**
- Parametric form: `P(t) = A + t*(B - A)` where `t ∈ [0, 1]` spans the segment A→B
- Solving for t where two parametric lines intersect
- Cases: no intersection (parallel), one point, coincident (infinite intersections)
- Checking that t₁ ∈ [0,1] and t₂ ∈ [0,1] — the intersection must be within both segments

**Minor concepts:**
- The cross product test for parallelism: `(B-A) × (D-C) == 0` means parallel
- T-intersection: the point is on one segment but outside the other; useful for trim operations
- Epsilon for parallelism check: denominator < epsilon → treat as parallel

---

### Lesson 10.3 — Point-Segment Relationships

**Major concepts:**
- Closest point on a segment to a given point: project the point onto the line, clamp t to [0, 1]
- Distance from a point to a segment: the distance to the closest point
- Point-on-segment: `distance(point, segment) < epsilon`
- Application: snapping the cursor to the nearest segment during geometry creation

**Minor concepts:**
- The dot product projection formula: `t = (P-A)·(B-A) / |B-A|²`
- Clamping t: without clamping, the "closest point" may be on the segment's extension
- Signed distance: positive on one side of the line, negative on the other — used for offset direction

---

### Lesson 10.4 — Arc Parameterisation

**Major concepts:**
- From centre/radius/angles to start and end points: `x = cx + r*cos(angle)`
- From start point, end point, radius, and direction to centre: the two-circle intersection
- Arc length: `L = r * |sweep_angle|`
- Point on arc at parameter t: `angle = start_angle + t * sweep_angle`

**Minor concepts:**
- Angle wrap-around: 350° CCW to 10° spans 20°, not 340° — must detect wrap
- Three-point arc: given three points on the arc, find centre and radius via circumscribed circle
- Degenerate cases: radius too small to pass through both points, collinear points

---

### Lesson 10.5 — Offset Curves

**Major concepts:**
- Offsetting a line segment: translate it by `distance * normal_vector`
- The normal vector: perpendicular to the segment's direction; two choices; sign determines which side
- Offsetting an arc: same centre, radius ± distance (add for outside, subtract for inside)
- The sign convention: positive = outward from the enclosed area; negative = inward

**Minor concepts:**
- Degenerate offset arcs: inside offset reducing radius to ≤ 0 — remove this arc
- Corner handling at segment joints: sharp corner → extend and intersect; round corner → arc fillet; clipped → nothing
- Why offset curves are the basis of every contour toolpath: the tool centre follows the offset profile

---

### Lesson 10.6 — Winding Order and Orientation

**Major concepts:**
- CW (clockwise) profile: the enclosed area is to the left when walking the boundary
- CCW (counterclockwise) profile: the enclosed area is to the right
- Shoelace formula: `2 * Area = Σ(xᵢ * yᵢ₊₁ - xᵢ₊₁ * yᵢ)` — positive for CCW, negative for CW
- Why it matters for CNC: CW profile with negative offset = outside contour; CCW with positive = inside pocket

**Minor concepts:**
- Reversing a profile: reverse the vertex order to flip CW to CCW
- Nested profiles: outer CCW boundary containing inner CW islands — the standard pocket structure
- Winding order and cutter compensation: `G41` (left) vs `G42` (right) depends on winding

---

### Lesson 10.7 — Polygon Boolean Operations

**Major concepts:**
- Union: the area covered by either polygon
- Intersection: the area covered by both polygons
- Difference: A minus B — the part of A not covered by B (used for pockets with islands)
- Why this is non-trivial: overlapping edges, T-intersections, holes, nested polygons

**Minor concepts:**
- Why to use a library: Sutherland-Hodgman, Greiner-Hormann, and Vatti are all complex algorithms
- `pyclipper` — a Python binding to the Clipper library; production-grade 2D polygon booleans
- The winding rule: how to determine inside/outside for self-intersecting polygons (even-odd vs non-zero)

---

### Lesson 10.8 — DXF File Import

**Major concepts:**
- DXF (Drawing Exchange Format): the universal 2D CAD interchange format; every CAD tool exports it
- DXF structure: sections (HEADER, ENTITIES, BLOCKS), entity types (LINE, ARC, CIRCLE, LWPOLYLINE, SPLINE)
- `ezdxf` Python library: reading entity geometry without implementing the DXF spec manually
- Mapping DXF entities to internal geometry types: `LINE` → segment, `ARC` → arc, `LWPOLYLINE` → polyline

**Minor concepts:**
- DXF coordinate precision: DXF uses full float precision; apply epsilon handling on import
- Layer filtering: DXF files have layers; import only the selected layer
- Block references: DXF `INSERT` entities place a named block; must resolve to actual geometry
- Splines: DXF supports NURBS splines — approximate as polylines with configurable segment count

---

## Topic 11 — WebSockets and Real-time Communication

**Project:** A job runner — FastAPI accepts a job, computes in a separate process, streams progress, supports cancellation.

---

### Lesson 11.1 — HTTP vs WebSocket vs SSE

**Major concepts:**
- HTTP: request → response → connection closes; server cannot push without a request
- WebSocket: persistent bidirectional channel; either side can send at any time
- SSE (Server-Sent Events): persistent one-way channel; server pushes, client listens, cannot send back
- When to use each: HTTP for CRUD, SSE for server→client streams, WebSocket for bidirectional real-time

**Minor concepts:**
- Long polling: the old way to fake server push — client requests and server holds the connection open until there is news
- The WebSocket handshake: starts as an HTTP Upgrade request
- Binary vs text frames: WebSocket can send both; JSON text is most common; binary for performance-critical cases

---

### Lesson 11.2 — FastAPI WebSocket Endpoint

**Major concepts:**
- `@app.websocket("/ws/{client_id}")` — WebSocket route
- `await websocket.accept()` — completing the handshake; required before sending
- `await websocket.send_json({"type": "progress", "percent": 42})` — sending structured messages
- `await websocket.receive_text()` — waiting for a message from the client
- `WebSocketDisconnect` exception — handling client disconnection cleanly

**Minor concepts:**
- Managing multiple connections: storing `websocket` objects in a `set` per room or channel
- Broadcasting: iterating the set and sending to each connected client
- Heartbeat / ping-pong: detecting stale connections that did not disconnect cleanly

---

### Lesson 11.3 — CPU-Bound Work and `ProcessPoolExecutor`

**Major concepts:**
- Why asyncio does NOT help CPU-bound work: the GIL allows only one Python thread at a time
- A CPU-intensive `async` FastAPI handler blocks the entire server while computing
- `ProcessPoolExecutor`: runs a function in a separate OS process — GIL does not apply across processes
- `asyncio.run_in_executor(executor, func, *args)`: runs a blocking function in the executor without blocking the event loop

**Minor concepts:**
- `concurrent.futures.ProcessPoolExecutor(max_workers=4)` — typically set to CPU core count
- Serialisation cost: arguments and return values must be pickle-able; large numpy arrays have serialisation overhead
- `multiprocessing.Queue` vs asyncio queue — the queue must cross process boundaries
- Why threading does not solve this: the GIL prevents true CPU parallelism with threads in Python

---

### Lesson 11.4 — React useWebSocket Pattern

**Major concepts:**
- `useEffect` with `new WebSocket(url)`: set up connection; return cleanup that calls `socket.close()`
- `onopen`, `onmessage`, `onclose`, `onerror` — the four event handlers
- Parsing received messages: `JSON.parse(event.data)` → dispatch to state
- Connection state: tracking `"connecting"`, `"open"`, `"closing"`, `"closed"` in component state

**Minor concepts:**
- Reconnection with exponential backoff: retry after 1s, then 2s, then 4s, etc.
- Why not to `JSON.parse` in a `useCallback` with no dependencies — stale closure problem
- Custom `useWebSocket` hook: extracting connection and reconnection logic from the component

---

### Lesson 11.5 — Progress, Cancellation, and Reconnection

**Major concepts:**
- Progress message schema: `{ type: "progress", step: "offsetting curves", percent: 42, elapsed_seconds: 1.3 }`
- Sending progress from inside a long compute loop — every N iterations, not every iteration
- Cancellation: client sends `{ type: "cancel" }`; server checks between work units and stops
- Reconnection: client stores the job ID; on reconnect, sends `{ type: "resume", job_id: "..." }`

**Minor concepts:**
- Estimated time remaining: `elapsed / percent_complete * (100 - percent_complete)`
- Granularity vs overhead: too-frequent progress messages slow the computation itself
- Cooperative cancellation: the server checks `is_cancelled` between units, not inside tight inner loops

---

## Cross-Topic Concepts

Appear in multiple topics. Explicitly named each time.

| Concept | First explicit | Recurs in |
|---|---|---|
| Immutability | 1.0a (spread creates copies) | 4.3 (Value Objects), 5.0e (frozen dataclass) |
| Interface / Protocol | 1.1 (TypeScript interface) | 4.6 (Repository), 5.0f (Python Protocol) |
| Error accumulation | 1.6 (CSV validation) | 3.1 (test failure clarity), 9.5 (parse errors) |
| State machine | 1.0g (generators), 1.5 (quoted CSV) | 8.5 (UI hover state), 9.4 (G-code modal) |
| Dependency direction | 2.1 (architecture intro) | 4.2 (domain purity), 5.1 (FastAPI deps) |
| Adapter pattern | 2.3 (hexagonal) | 4.6 (repository), 10.8 (DXF adapter) |
| Pure functions | 3.7 (what not to test) | 7 (geometry), 9 (tokeniser) |
| Type narrowing | 1.3 (TypeScript) | 5.0k (Python typing), 9.2 (token types) |
| Big O | 4.0 | 10.2 (intersection), 10.3 (closest point) |
| Epsilon comparison | 10.0 | 10.2, 10.3, 10.4, 10.5 |
| Event Bus | 2.6 | MVP dependency graph |
