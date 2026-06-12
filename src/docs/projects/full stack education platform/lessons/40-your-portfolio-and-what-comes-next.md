# Lesson 40 — Your Portfolio and What Comes Next

## What You Will Build

A polished portfolio entry for the Codex app: a case study document with architecture
diagrams, the key engineering decisions, performance numbers, and what you would do
differently. Then: a map of what you now know, what the curriculum deliberately skipped,
and where to go next.

---

## What You Need to Know First

Everything. This lesson synthesizes the entire curriculum.

---

## The Lesson

### Step 1 — What You Built

Across 39 lessons, you built a production full-stack application from scratch:

**What it does:**
- Students learn to code through interactive lessons with a sandboxed execution engine
- Lessons check output deterministically and mark completion in a database
- Auth supports email/password and Google OAuth with JWT sessions
- Real-time viewer counts via WebSockets
- Push notifications for daily streak reminders
- File uploads with magic-byte validation and object storage
- Full-text search with a PostgreSQL inverted index
- Mobile apps for iOS and Android via React Native / Expo
- A desktop app for macOS, Windows, and Linux via Electron
- Deployed to a VPS with Nginx, Certbot, and GitHub Actions CI/CD

**What powers it:**
TypeScript · React Native · Expo · Electron · Monaco Editor · Express · PostgreSQL ·
Prisma · Redis · Socket.io · TanStack Query · Zod · Vitest · bcrypt · JWT · OAuth 2.0 ·
Worker Threads · OpenAPI · Sentry · pino

### Step 2 — The Architecture Case Study

**The architecture in one diagram:**
```
Mobile (Expo)     Desktop (Electron)     Web (Vercel)
        ↓                ↓                    ↓
                  API Gateway (Nginx)
                         ↓
               Express API (Node.js / systemd)
               ├── Auth middleware (JWT)
               ├── REST routes (Zod validation)
               ├── WebSocket server (Socket.io)
               └── Background workers (cron, push notifications)
                    ↓          ↓           ↓
                 PostgreSQL   Redis      S3/MinIO
                 (Prisma ORM)  (cache)   (file storage)
```

**The five most consequential architectural decisions:**

**1. Stateless API (twelve-factor Factor VI):**
Sessions live in the database (JWT tokens); no in-memory session state. Effect: the API
can run as multiple instances behind a load balancer. Horizontal scaling is possible
without any code change.

**2. Repository pattern for all database access:**
Route handlers call `lessonRepository.getLessonById(id)`, not `prisma.lesson.findUnique(...)`.
Effect: if you switch from PostgreSQL to another database, only the repository layer changes.
Route handlers, business logic, and tests are unaffected.

**3. Sandbox isolation for user code (iframe + CSP):**
User-submitted JavaScript runs in a sandboxed iframe with no same-origin access and a
5-second timeout. Effect: user code cannot exfiltrate tokens, modify the DOM, or hang
the app. This decision prevents an entire class of security vulnerabilities.

**4. Data-driven lessons:**
Lessons are rows in the database, not hardcoded functions. The engine processes all
lessons identically. Effect: content creators add lessons without code deployments.
The lesson engine (code) is stable; lesson content (data) changes independently.

**5. Strategy pattern for execution backends:**
JavaScript and Python execution are swappable `ExecutionStrategy` implementations.
Effect: adding a new language requires a new class and no changes to the lesson engine.
Open/closed principle at the code level.

### Step 3 — What You Know Now

Map each lesson to the CS concept it introduced:

**Computer Science:**
- Program model, runtime, type systems (L01)
- Variables, call stack, primitive vs reference types (L02)
- Tree data structures, virtual DOM, diff algorithms (L03)
- Box model, Flexbox layout algorithm (L04)
- Stack data structure, finite state machines (L05)
- Process model, compilation targets, privilege separation (L06)
- Text editor internals, event-driven programming (L07)
- Pure functions as state (L08)
- Code injection, same-origin policy, sandboxing (L09)
- Test assertions, TDD, testing pyramid (L10)
- Client-server model, HTTP, TCP/IP (L11)
- Relational model, SQL, B-tree indexes, ACID (L12)
- Entity-relationship modeling, joins, normalization (L13)
- REST, idempotency, request lifecycle (L14)
- Exception handling, error propagation (L15)
- Async programming, Promises, race conditions (L16)
- Hashing vs encryption, PKI (L17)
- RBAC, IDOR, principle of least privilege (L18)
- OAuth 2.0, PKCE, state parameter CSRF (L19)
- Cookie attributes, CSRF, session management (L20)
- String comparison, determinism, diff algorithms (L21)
- Unix timestamps, streak algorithms, atomicity (L22)
- Inverted index, tsvector, GIN, debouncing (L23)
- Binary data, base64, magic bytes, object storage (L24)
- WebSockets, pub/sub, exponential backoff (L25)
- Big O, profiling, caching, N+1 queries (L26)
- Inter-thread communication, JSI, safe areas (L27)
- Push notification infrastructure, store-and-forward (L28)
- IPC, privilege separation in OS terms (L29)
- PKI, code signing, build pipelines (L30)
- Twelve-factor app, stateless processes, CI/CD (L31)
- Trie, heap, graph cycle detection, DAG (L32)
- Pure functions, composition, immutability (L33)
- Observer, adapter, repository, strategy, command (L34)
- TCP/IP layers, DNS, shell injection (L35)
- GC, reachability, memory leaks, WeakMap (L36)
- Event loop, cooperative multitasking, mutex (L37)
- Code review, ADRs, OpenAPI (L38)
- Logs, metrics, traces, observability (L39)

### Step 4 — What Was Deliberately Left Out

This curriculum prioritized breadth and real-world integration. These topics were left
out or only briefly touched — they are natural next steps:

**Backend:**
- GraphQL (alternative to REST; efficient for nested data queries)
- gRPC and Protocol Buffers (efficient binary serialization for service-to-service communication)
- Message queues (RabbitMQ, Kafka) for decoupled async processing
- Microservices architecture (splitting the monolith into independent services)
- Kubernetes and container orchestration (beyond single-server deployment)

**Frontend:**
- Server-Side Rendering (SSR) with Next.js (HTML sent from the server, hydrated on the client)
- React Server Components (components that run on the server, zero JS sent to the client)
- Animation libraries (Framer Motion, React Native Reanimated advanced usage)
- Accessibility (WCAG guidelines, screen reader support, ARIA)

**Computer Science:**
- Formal algorithm analysis (amortized complexity, Master Theorem)
- Distributed systems theory (CAP theorem, eventual consistency, consensus algorithms)
- Compilers (lexing, parsing, ASTs, code generation — all touched in the code runner but not built from scratch)
- Machine learning integration (local LLM inference via llama.cpp, API-based AI features)

**Operations:**
- Kubernetes, Helm, and container orchestration
- Multi-region deployment and geographic data residency
- Chaos engineering (testing system behavior under failure)
- Cost optimization (right-sizing instances, reserved capacity, spot instances)

### Step 5 — Writing the Portfolio Case Study

A portfolio case study is not a list of technologies. It tells a story with three parts:

**1. The problem:**
"I built a coding education platform that teaches full-stack development. The core challenge
was building a sandboxed code execution engine — running user-submitted JavaScript safely
without allowing it to access the auth tokens or modify the UI."

**2. The approach and why:**
"I used a sandboxed `<iframe>` with `sandbox="allow-scripts"` (no same-origin access) and
`postMessage` for communication. I evaluated server-side execution (Docker containers) but
chose iframe execution for latency — server round-trips add 100–500ms; iframe execution is
instantaneous. The iframe runs with a 5-second timeout and origin-verified message passing."

**3. What you learned (including what you would do differently):**
"I would add a CSP header to the iframe's srcdoc to prevent eval in the sandboxed context.
I would also replace the in-memory `lessonViewers` Map (Lesson 25) with Redis to survive
server restarts — currently, a restart clears all viewer counts."

**What interviewers are looking for:**
- Did you understand the tradeoffs you made? (You did: iframe vs Docker, stateful vs stateless)
- Can you explain the architecture to a non-technical audience? (The case study above can be)
- What would you do better? (Intellectual honesty about limitations is valued more than claiming perfection)
- Did you build the whole thing? (40 lessons, one app, one architecture — yes)

### Step 6 — Where to Go Next

**For the next 3 months:**
1. **Contribute to open source.** Find a library you use (TanStack Query, Prisma, Expo).
   Fix a bug. Answer a GitHub issue. The process teaches you to read unfamiliar code at scale.

2. **Read one book.** Recommendations: *Designing Data-Intensive Applications* (Kleppmann) for
   distributed systems depth, or *A Philosophy of Software Design* (Ousterhout) for engineering
   judgment. Both are investment in understanding *why*, not *what*.

3. **Build something with an unfamiliar constraint.** One week, no TypeScript (JavaScript only,
   see what you miss). One week, no frameworks (plain HTML, CSS, Node.js). Constraints reveal
   what abstractions actually provide.

**For interviews:**
- Practice explaining your architecture out loud. Record yourself. Play it back.
- The question "tell me about a hard technical problem you solved" is answered by Lesson 09 (sandbox),
  Lesson 17 (timing attack prevention), or Lesson 37 (race condition fix).
- Behavioral questions use the same structure as the case study: problem → approach → result → learning.

---

## What You Built

You built a full-stack application across eight platforms (web, iOS, Android, macOS, Windows,
Linux) in a stack that powers the majority of production software today. You understood why
each decision was made, not just how to make it work.

More important: you have a mental model for how systems fail, how they scale, and how to
reason about correctness and security. That mental model is what distinguishes a developer
who can build features from one who can design systems.

---

## Definition of Done

- [ ] A case study document exists (not a README — a narrative with architecture diagram, key decisions, and tradeoffs)
- [ ] The architecture diagram shows all components and data flows
- [ ] Three engineering decisions are documented with the alternatives considered and rejected
- [ ] At least one "what I would do differently" is written honestly
- [ ] You can explain the sandbox (Lesson 09) architecture and its tradeoffs in 2 minutes to a non-technical person
- [ ] You can answer: what are the five most consequential architectural decisions in this app?
- [ ] You can answer: what three topics in the "left out" list are most relevant to your next job or project?
- [ ] You can explain the entire data flow: from a user typing code to the lesson being marked complete in the database
- [ ] `git commit` with a message explaining why — "Add portfolio case study: architecture decisions, tradeoffs, and what comes next"
