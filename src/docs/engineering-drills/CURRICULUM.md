# Engineering Drills — Curriculum

**What this is:** A collection of small, standalone apps — each one designed to teach
one hard engineering concept deliberately, not as a side effect of building something
bigger. Every drill is independent. Do them in any order. Each takes 1–3 labs.

**How it differs from every other series:**

| Series | Concept relationship |
|--------|---------------------|
| taski, PyReact | Concepts emerge as side effects of building the app |
| cadcam-tauri | Concepts taught at the moment the app forces them |
| **Engineering Drills** | The concept IS the goal — the app is just the vehicle |

**Spec:** `Abstract Lesson Requirements` (execution standard for every lab)
**Registry:** `CONCEPT-REGISTRY.md` in each drill folder

**Format per drill:**
- 1–3 labs
- One hard concept taught explicitly
- One small app as the pressure chamber
- Fully standalone — no dependency on other drills
- Concepts taught before the code, Law 10 closure on every concept

**Status key:** `PLANNED` → `IN PROGRESS` → `COMPLETE`

---

## How to Use This Map

Pick any drill. Read the concept. Build the app. The drill is done.
No order required. No prerequisites unless stated.

When you want to write a drill:

> "Write Drill [ID] — [Title] following the Abstract Lesson Requirements.
> Concept: [concept]. App: [what you build]. Prerequisites: [any]."

---

## Section 1 — Language Mechanics

*How the language itself works — the parts that are invisible until they bite you.*

### 1.1 — C++: The Compilation Model and Header Files
**Concept:** What a compiler actually does. Why C++ splits code into `.h` and `.cpp`.
Why `#include` is a text paste. Why the linker exists.
**App:** A tiny calculator split across multiple files — `math.h`, `math.cpp`, `main.cpp`
**Why it matters:** Every C++ project you ever touch uses this. Without the mental model,
every linker error is a mystery.
**Status:** PLANNED

### 1.2 — C++: Memory — Stack vs Heap
**Concept:** Where variables live. `new` and `delete`. Why stack overflow happens.
Why heap fragmentation matters. Smart pointers as the solution.
**App:** A small program that allocates, tracks, and frees memory — showing the bug, then the fix.
**Status:** PLANNED

### 1.3 — Python: The Import System
**Concept:** What `import` actually does. Modules vs packages. `__init__.py`. `sys.path`.
Circular imports and why they happen. The difference between absolute and relative imports.
**App:** A small multi-file Python project that breaks in three ways, then is fixed correctly.
**Status:** PLANNED

### 1.4 — Python: Virtual Environments and Packaging
**Concept:** What `pip install` does and where packages go. Why global installs break.
What a virtual environment actually is (a directory with a Python binary and packages).
`requirements.txt` vs `pyproject.toml`. How a package gets published to PyPI.
**App:** Create, publish (locally), and install a tiny Python package from scratch.
**Status:** PLANNED

### 1.5 — Python: Decorators From First Principles
**Concept:** Functions as first-class values. Closures. What a decorator actually is
(a function that takes a function and returns a function). `@wraps`. Class decorators.
**App:** Build three decorators: a timer, a retry-on-failure, and a cache — all from scratch.
**Prerequisites:** Closures (or read the concept block in this drill)
**Status:** PLANNED

### 1.6 — Python: Async From First Principles
**Concept:** Why async exists. The event loop. Coroutines. `await` as "pause here and
let other work run." The difference between I/O-bound and CPU-bound. When async helps
and when it doesn't.
**App:** A tiny async web scraper that fetches 20 URLs — timed against the sync version.
**Status:** PLANNED

### 1.7 — TypeScript: The Type System Really Explained
**Concept:** Structural typing vs nominal typing. Type inference. Generics. Conditional
types. Discriminated unions. The `unknown` vs `any` distinction. Why TypeScript is not
just "JavaScript with types."
**App:** A typed data pipeline — input data, transform it through three typed stages,
output typed result. Every stage has a deliberate type error introduced and fixed.
**Status:** PLANNED

### 1.8 — Rust: Ownership and Borrowing
**Concept:** Why Rust has no garbage collector and no manual memory management.
The ownership model. Move vs copy. Borrowing. The borrow checker. Why this prevents
entire classes of bugs.
**App:** A small program that manages a list of items — written first in a way that
would be unsafe in C, then rewritten with Rust's ownership rules.
**Status:** PLANNED

---

## Section 2 — Data and Storage

*How data is structured, stored, and retrieved.*

### 2.1 — How a Database Actually Stores Data
**Concept:** A database is not magic — it is a program that reads and writes structured
binary files. Pages, B-trees, the WAL (write-ahead log). Why indexes are separate files.
Why `EXPLAIN QUERY PLAN` shows what you expect after this drill.
**App:** Build a tiny key-value store that persists to disk — using a simple file format,
then add an index.
**Status:** PLANNED

### 2.2 — Serialization: What Happens When Data Crosses a Boundary
**Concept:** Why data must be serialized. JSON, binary formats (MessagePack, Protobuf).
Schema evolution — what breaks when you add a field. Versioning strategies.
The difference between serialization (structure preserved) and marshalling (including types).
**App:** Build a versioned save/load system for a small game state — where version 2 must
still load version 1 files.
**Status:** PLANNED

### 2.3 — The Repository Pattern In Practice
**Concept:** The Repository pattern is one of the highest-ROI patterns in application
development. It separates what the app wants from how the data is stored.
Business logic never imports SQLAlchemy, pymongo, or any storage technology.
Switching from SQLite to PostgreSQL changes one file.
**App:** A tiny contact book backed by SQLite — then switch the backend to JSON files
without changing a single line outside the repository.
**Status:** PLANNED

### 2.4 — Database Transactions and ACID
**Concept:** What a transaction actually is. Atomicity — all or nothing. Why partial writes
are catastrophic. Isolation levels and what "dirty read" means. The real cost of
SERIALIZABLE isolation. When to use transactions and when not to.
**App:** A bank transfer simulation — demonstrate each failure mode, then fix with
transactions.
**Status:** PLANNED

### 2.5 — Indexes: Why Queries Are Slow and How to Fix Them
**Concept:** What a B-tree index is. Why `SELECT * FROM parts WHERE name = 'foo'`
scans every row without one. How to read `EXPLAIN`. Index design: which columns,
which order, when indexes hurt. The N+1 query problem.
**App:** A 100,000-row SQLite database. Benchmark a query before and after adding the
right index. Show the query plan change.
**Status:** PLANNED

### 2.6 — MongoDB: The Document Model and When to Use It
**Concept:** Why document databases exist. Schema flexibility vs schema enforcement.
When variable-structure data wins over relational tables. When it loses.
Embedded documents vs references. The aggregation pipeline.
**App:** A tool library where each tool type (drill, end mill, insert) has different fields —
impossible to model cleanly in a fixed schema.
**Prerequisites:** Basic Python, pip
**Status:** COMPLETE (taski lab06–08 cover this)

---

## Section 3 — Authentication and Security

*The concepts most tutorials skip or get wrong.*

### 3.1 — Password Hashing: The Attack First
**Concept:** Why storing plain passwords is wrong (breach = everyone's password exposed).
Why SHA-256 is also wrong (rainbow tables, speed). What bcrypt/argon2 actually does
(key stretching, salt, work factor). How to verify without storing the password.
**App:** Demonstrate a dictionary attack against SHA-256 hashes. Then show the same
attack failing against bcrypt. Build register/login with bcrypt from scratch.
**Status:** PLANNED

### 3.2 — JWT: Build It By Hand
**Concept:** What a JWT actually is. The three parts: header, payload, signature.
Why the signature prevents tampering. Why JWT is stateless (no database lookup needed).
What goes in the payload and what must not (never store passwords or secrets in JWT).
Expiry, refresh tokens, revocation problem.
**App:** Encode and decode a JWT by hand using only `hmac` and `base64` — no JWT library.
Then verify it, tamper with it, and show the verification fail.
**Status:** PLANNED

### 3.3 — OAuth 2.0: What Actually Happens
**Concept:** Why OAuth exists (you should never handle another service's passwords).
The authorization code flow step by step. Access tokens vs refresh tokens. Scopes.
Why the state parameter prevents CSRF. What happens when the token expires.
**App:** Connect to GitHub's API using OAuth — no library, just raw HTTP requests.
Fetch the authenticated user's repositories.
**Status:** PLANNED

### 3.4 — HTTPS and TLS: What the Padlock Actually Means
**Concept:** What TLS does (encrypt + authenticate). The handshake: key exchange,
certificate, symmetric session key. Why self-signed certs trigger browser warnings.
Certificate chains. Why HTTP is dangerous for anything authenticated.
**App:** Run an HTTP server and intercept your own traffic with mitmproxy. Then enable
HTTPS and show the interception fail.
**Status:** PLANNED

### 3.5 — SQL Injection: The Attack and the Fix
**Concept:** How SQL injection works — the attacker's perspective first.
Why string concatenation in queries is always wrong. Parameterized queries as the fix.
ORM protection (and where ORMs can still be vulnerable). Input validation vs sanitization.
**App:** A vulnerable login form — demonstrate the `' OR '1'='1` attack. Then fix it
with parameterized queries. Then demonstrate a second injection vector the first fix misses.
**Status:** PLANNED

### 3.6 — CORS: Why the Browser Blocks Your Request
**Concept:** The same-origin policy — why it exists. What CORS actually is (a relaxation
of the same-origin policy). Preflight requests. Why `Access-Control-Allow-Origin: *` is
sometimes correct and sometimes a security hole. Credentials and cookies across origins.
**App:** A frontend that calls a backend on a different port — demonstrate the blocked
request, then add correct CORS headers, then show what happens with wrong CORS config.
**Status:** PLANNED

---

## Section 4 — Design Patterns In Isolation

*One pattern, one small app, full closure. No other series covers them this directly.*

### 4.1 — Strategy: Swappable Algorithms
**Concept:** The Strategy pattern. When `if/else` or `switch` grows without end.
How to encapsulate algorithms behind an interface so the caller never changes.
Connection to the Open/Closed Principle.
**App:** A text formatter that supports plain, markdown, and HTML output —
each format is a strategy, switchable at runtime.
**Status:** PLANNED

### 4.2 — Observer / Pub-Sub: Reactive Events
**Concept:** The Observer pattern. When one change should notify many listeners
without the source knowing who is listening. Event emitters. Pub-Sub as a
decoupled variant. Where this pattern appears: DOM events, React state, WebSockets,
message queues.
**App:** A tiny event system from scratch — a store that notifies subscribers when
data changes. Then connect two UI "components" (just print functions) to the same store.
**Status:** PLANNED

### 4.3 — Command: Encapsulating Actions
**Concept:** The Command pattern. When you need undo/redo, queuing, logging, or
retry — any time an action must be an object, not just a function call.
**App:** A text editor (in the terminal) with undo/redo — every edit is a Command object
on a stack.
**Status:** PLANNED

### 4.4 — Factory: Creating Without Specifying
**Concept:** The Factory pattern (Factory Method and Abstract Factory).
When the caller should not decide the concrete type. How factories hide instantiation
logic. Connection to Dependency Inversion.
**App:** A notification system that sends email, SMS, or push — the caller asks for
"a notifier" and the factory decides which concrete implementation to return.
**Status:** PLANNED

### 4.5 — Decorator Pattern (not Python decorators)
**Concept:** The GoF Decorator structural pattern — adding behaviour to an object
without subclassing. How it differs from inheritance. How Python's `@decorator`
syntax is a related but different concept.
**App:** A logging system where each logger can be wrapped with timestamp, level-filter,
or format decorators — combinable in any order.
**Status:** PLANNED

### 4.6 — Repository + Service Layer Together
**Concept:** How Repository and Service Layer work as a pair. The Service Layer owns
business logic. The Repository owns data access. Neither knows about the other's
implementation. This is the architecture behind every serious backend.
**App:** A tiny inventory management backend — Service Layer handles business rules
(can't go below zero), Repository handles storage. Swap the storage in one place.
**Status:** PLANNED

### 4.7 — Dependency Injection: Explicit Dependencies
**Concept:** Dependency Injection as the Dependency Inversion Principle in practice.
Why functions and classes should declare their dependencies instead of creating them.
Constructor injection vs parameter injection. IoC containers. FastAPI's `Depends`.
**App:** A Python API endpoint that needs a database session, a logger, and an email
service — wired three ways: hardcoded (bad), injected by hand (good), injected by
FastAPI Depends (professional).
**Status:** PLANNED

### 4.8 — CQRS: Separating Reads from Writes
**Concept:** Command Query Responsibility Segregation. Why reads and writes often need
different data shapes. How separating them enables optimization, event sourcing,
and scaling. When CQRS is overkill and when it is necessary.
**App:** An order management system — write side creates orders (commands), read side
serves a dashboard (queries) from a denormalized view.
**Status:** PLANNED

---

## Section 5 — Systems and Communication

*How code talks to other code, and what happens at the boundaries.*

### 5.1 — HTTP From Raw Sockets
**Concept:** HTTP is text. Every request is a string with a specific format. Every
response is a string. The "framework" is just a program that reads strings in that
format and writes strings in that format back. Understanding this makes every HTTP
concept (headers, methods, status codes, keep-alive) concrete.
**App:** An HTTP/1.1 server written in Python using only `socket` — no framework.
Serve a static HTML file. Return a 404 for unknown paths.
**Status:** PLANNED

### 5.2 — WebSockets: Persistent Two-Way Communication
**Concept:** Why HTTP request/response is wrong for real-time. What the WebSocket
upgrade handshake does. Frame format. Ping/pong. Why connection state matters.
The difference between polling, long-polling, SSE, and WebSockets.
**App:** A real-time chat room — server in Python (raw sockets, no framework),
client in browser JavaScript. No Socket.IO. No library.
**Status:** PLANNED

### 5.3 — Message Queues: Decoupling Producers and Consumers
**Concept:** Why HTTP is wrong for background work. The queue as a buffer.
At-least-once vs exactly-once delivery. Why idempotency is required. Dead-letter queues.
Worker scaling. The relationship to the Observer pattern.
**App:** A job queue in Python using Redis — a producer that enqueues image-processing
jobs and a worker that processes them, with retry on failure.
**Status:** PLANNED

### 5.4 — gRPC and Protocol Buffers: Typed Service Communication
**Concept:** Why REST/JSON has a type problem. Protocol Buffers as a schema language.
How gRPC generates client and server code from a `.proto` file. Streaming.
When to choose gRPC over REST.
**App:** A calculator service in Python with a gRPC client in Python and one in another
language — same `.proto`, two implementations.
**Status:** PLANNED

### 5.5 — How a Compiler Works (Tiny Version)
**Concept:** Lexing (text → tokens), parsing (tokens → AST), evaluation (walk the tree).
Every compiler, interpreter, template engine, and query language uses this pipeline.
**App:** A tiny expression evaluator that handles `2 + 3 * (4 - 1)` — lexer, parser,
and evaluator, all from scratch. Then extend it to handle variables.
**Status:** PLANNED

---

## Section 6 — Concurrency

*The hardest class of bugs — because they're invisible until production.*

### 6.1 — Race Conditions: The Bug You Can't See
**Concept:** What a race condition actually is. Why the same code can produce different
results on different runs. Atomicity. The memory model. Why "it works on my machine"
is the worst possible race condition symptom.
**App:** A counter incremented by 10 threads simultaneously — show the wrong result,
explain why, then fix with locks. Then show a deadlock. Then fix that.
**Status:** PLANNED

### 6.2 — The Event Loop: How Node.js and Python asyncio Work
**Concept:** Single-threaded concurrency. The task queue. Microtasks vs macrotasks.
Why `await` does not block the thread. Why CPU-bound work breaks async. How the
event loop scheduler decides what runs next.
**App:** Visualize the event loop — a Python script that prints exactly when each
coroutine runs and why, using `asyncio.sleep` and real I/O to show the scheduler.
**Status:** PLANNED

### 6.3 — Parallelism vs Concurrency
**Concept:** Concurrency = dealing with many things at once. Parallelism = doing many
things at once. Why Python's GIL blocks true parallelism for CPU-bound work.
`multiprocessing` vs `threading` vs `asyncio`. When each is the right tool.
**App:** The same workload (compute-heavy + I/O-heavy) run four ways. Timed.
Results compared and explained.
**Status:** PLANNED

---

## Section 7 — Architecture and System Design

*The big picture — how to reason about whole systems.*

### 7.1 — Layered Architecture From Scratch
**Concept:** Presentation → Application → Domain → Infrastructure.
Why each layer only imports from the layer below it. What breaks when you violate
the dependency direction. How this connects to Clean Architecture and Hexagonal Architecture.
**App:** A tiny expense tracker built wrong (everything mixed), then refactored layer by layer.
Each refactoring step shows exactly what problem it solves.
**Status:** PLANNED

### 7.2 — The Twelve-Factor App
**Concept:** The twelve factors that make an application deployable, scalable, and maintainable
across environments. Config in environment variables. Logs as streams. Stateless processes.
Why these matter even for single-developer projects.
**App:** Take a small broken app (hardcoded config, local files, manual setup) and apply
each factor. Show what each one enables.
**Status:** PLANNED

### 7.3 — CAP Theorem and Distributed System Tradeoffs
**Concept:** Consistency, Availability, Partition Tolerance — pick two. What each
means concretely (not abstractly). How MongoDB, PostgreSQL, Redis, and Cassandra
each make different tradeoffs. Eventual consistency — what applications must handle.
**App:** A simulation — two "servers" with a network partition. Show what each
consistency model produces.
**Status:** PLANNED

### 7.4 — Event Sourcing: The History as the Data
**Concept:** Instead of storing current state, store every event that produced it.
State is always derived by replaying events. Why this enables time travel, audit logs,
and CQRS. The cost: complexity, storage, snapshot strategy.
**App:** A bank account — no balance field. Every deposit and withdrawal is an event.
Balance is computed by summing events. Replay from any point.
**Status:** PLANNED

---

## Section 8 — Testing Deliberately

*The test types most developers never write.*

### 8.1 — Property-Based Testing
**Concept:** Instead of writing specific test cases, define invariants — properties
that must always be true — and let the framework generate thousands of test cases.
Finds bugs that no human would think to test.
**App:** A sorting function tested with `hypothesis` (Python). A string sanitizer with
hundreds of auto-generated attack strings.
**Status:** PLANNED

### 8.2 — Contract Testing
**Concept:** Frontend and backend tests that verify both sides agree on the shape
of their communication. How a contract test catches the bug where the backend
changes a field name and the frontend silently breaks.
**App:** A React component and a FastAPI endpoint — contract test proves they
agree, then show the test catching a breaking API change.
**Status:** PLANNED

### 8.3 — Mutation Testing
**Concept:** How do you know your tests are good? Mutation testing deliberately
introduces bugs into your code and checks whether your test suite catches them.
A test suite with 100% coverage can still miss mutations.
**App:** Take the taski test suite from the testing labs. Run `mutmut` against it.
Find the surviving mutants (bugs your tests miss). Add tests to kill them.
**Prerequisites:** Taski testing labs
**Status:** PLANNED

### 8.4 — Load Testing
**Concept:** How does your app behave under real traffic? Throughput (requests/second).
Latency percentiles (p50, p95, p99). The difference between average latency and
tail latency. Finding the breaking point before production does.
**App:** A FastAPI endpoint load-tested with `locust` — find the throughput limit,
identify the bottleneck, fix it, retest.
**Status:** PLANNED

---

## Section 9 — Professional Tooling

*The tools that separate working alone from working on a team.*

### 9.1 — Git Internals: What git Actually Stores
**Concept:** Git's object model — blobs, trees, commits, tags. How a branch is just
a pointer. What `git rebase` actually does to the object graph. Why force push is
dangerous. Reading `.git/objects` directly.
**App:** Rebuild a tiny git from scratch — `git init`, `git add`, `git commit` —
using only Python's `hashlib` and file I/O.
**Status:** PLANNED

### 9.2 — Docker: What a Container Actually Is
**Concept:** A container is not a VM. Linux namespaces (process, network, filesystem).
cgroups for resource limits. The image as a layered filesystem. Why containers
reproduce environments reliably. What the Dockerfile actually builds.
**App:** Containerize the taski app — write the Dockerfile, build the image, run it,
understand every line of the Dockerfile.
**Prerequisites:** taski series
**Status:** PLANNED

### 9.3 — CI/CD: Automated Quality Gates
**Concept:** What CI/CD actually does. The pipeline as a contract: code cannot
merge if tests fail, lint fails, or types fail. Why humans should not decide
what is safe to deploy. How to write a pipeline that catches real problems.
**App:** Add a GitHub Actions (or GitLab CI) pipeline to any existing project —
tests, linting, type checking. Intentionally break it, watch it fail, fix it.
**Status:** PLANNED

### 9.4 — Profiling: Finding the Real Bottleneck
**Concept:** "It's slow" is not a problem statement. Profiling finds the actual
line of code using 80% of the time. Python's `cProfile`, flame graphs, memory
profiling with `memory_profiler`. Why the obvious optimization is usually wrong.
**App:** A slow Python script — profile it, find the real bottleneck (it won't
be what you expect), optimize it, measure the improvement.
**Status:** PLANNED

---

## Drill Index — Quick Reference

| ID | Title | Concept | Language | Status |
|----|-------|---------|----------|--------|
| 1.1 | Compilation Model | Header files, linking, compilation units | C++ | PLANNED |
| 1.2 | Memory — Stack vs Heap | new/delete, smart pointers, ownership | C++ | PLANNED |
| 1.3 | The Import System | Modules, packages, sys.path, circular imports | Python | PLANNED |
| 1.4 | Virtual Environments | pip, venv, packaging, PyPI | Python | PLANNED |
| 1.5 | Decorators From Scratch | Closures, higher-order functions, @wraps | Python | PLANNED |
| 1.6 | Async From Scratch | Event loop, coroutines, await, I/O-bound | Python | PLANNED |
| 1.7 | TypeScript Type System | Structural typing, generics, discriminated unions | TypeScript | PLANNED |
| 1.8 | Rust Ownership | Move, borrow, borrow checker, memory safety | Rust | PLANNED |
| 2.1 | How Databases Store Data | B-trees, pages, WAL, indexes | Python | PLANNED |
| 2.2 | Serialization | JSON, binary, schema evolution, versioning | Python | PLANNED |
| 2.3 | Repository Pattern | Data access separation, interface, swappable backend | Python | PLANNED |
| 2.4 | Transactions and ACID | Atomicity, isolation levels, dirty reads | Python+SQL | PLANNED |
| 2.5 | Indexes and Query Plans | B-tree index, EXPLAIN, N+1 problem | SQL | PLANNED |
| 2.6 | MongoDB Document Model | Document store, aggregation pipeline | Python | COMPLETE |
| 3.1 | Password Hashing | Dictionary attack, bcrypt, key stretching | Python | PLANNED |
| 3.2 | JWT By Hand | Header/payload/signature, HMAC, stateless auth | Python | PLANNED |
| 3.3 | OAuth 2.0 Flow | Authorization code flow, tokens, scopes | Python | PLANNED |
| 3.4 | HTTPS and TLS | Handshake, certificates, certificate chains | Any | PLANNED |
| 3.5 | SQL Injection | Attack first, parameterized queries, ORM limits | Python+SQL | PLANNED |
| 3.6 | CORS | Same-origin policy, preflight, credentials | JS+Python | PLANNED |
| 4.1 | Strategy Pattern | Swappable algorithms, Open/Closed | Python | PLANNED |
| 4.2 | Observer / Pub-Sub | Event-driven, decoupled listeners | Python | PLANNED |
| 4.3 | Command Pattern | Undo/redo, action as object, history stack | Python | PLANNED |
| 4.4 | Factory Pattern | Creation abstraction, Dependency Inversion | Python | PLANNED |
| 4.5 | Decorator Pattern (GoF) | Behaviour composition, wrapping without subclassing | Python | PLANNED |
| 4.6 | Repository + Service Layer | Business logic separation, architecture pair | Python | PLANNED |
| 4.7 | Dependency Injection | Explicit dependencies, IoC, FastAPI Depends | Python | PLANNED |
| 4.8 | CQRS | Read/write separation, optimized projections | Python | PLANNED |
| 5.1 | HTTP From Raw Sockets | Request/response format, headers, status codes | Python | PLANNED |
| 5.2 | WebSockets From Scratch | Upgrade handshake, frames, real-time | Python+JS | PLANNED |
| 5.3 | Message Queues | Async jobs, at-least-once, idempotency, Redis | Python | PLANNED |
| 5.4 | gRPC and Protobuf | Typed RPC, schema-first, code generation | Python | PLANNED |
| 5.5 | Tiny Compiler | Lexer, parser, AST, evaluator | Python | PLANNED |
| 6.1 | Race Conditions | Atomicity, locks, deadlock | Python | PLANNED |
| 6.2 | The Event Loop | Single-threaded concurrency, scheduler, microtasks | Python | PLANNED |
| 6.3 | Parallelism vs Concurrency | GIL, multiprocessing, when each wins | Python | PLANNED |
| 7.1 | Layered Architecture | Dependency direction, Clean Architecture | Python | PLANNED |
| 7.2 | Twelve-Factor App | Config, logs, statelessness, deployability | Any | PLANNED |
| 7.3 | CAP Theorem | Consistency vs availability, distributed tradeoffs | Any | PLANNED |
| 7.4 | Event Sourcing | Events as source of truth, state derivation | Python | PLANNED |
| 8.1 | Property-Based Testing | Invariants, hypothesis, generative tests | Python | PLANNED |
| 8.2 | Contract Testing | Frontend/backend agreement, breaking change detection | Python+JS | PLANNED |
| 8.3 | Mutation Testing | Test quality, surviving mutants, mutmut | Python | PLANNED |
| 8.4 | Load Testing | Throughput, latency percentiles, bottleneck finding | Python | PLANNED |
| 9.1 | Git Internals | Objects, blobs, trees, commits, branches | Python | PLANNED |
| 9.2 | Docker Internals | Namespaces, cgroups, layers, Dockerfile | Any | PLANNED |
| 9.3 | CI/CD Pipelines | Automated gates, pipeline as contract | Any | PLANNED |
| 9.4 | Profiling | cProfile, flame graphs, memory profiler | Python | PLANNED |

**Total drills: 44** (1 complete, 43 planned)

---

## Concept Registry

Populated as drills complete. A concept listed here has been formally taught
and must not be re-introduced as new in a later drill.

| Concept | Drill | Notes |
|---------|-------|-------|
| MongoDB document model | 2.6 (taski lab06–08) | Full closure — insert, find, update, delete, indexes, aggregation |

---

## Amendment Log

| Date | Drill | Change | Reason |
|------|-------|--------|--------|
| 2026-05-13 | All | Initial curriculum created | Map the full space before writing any drills |
