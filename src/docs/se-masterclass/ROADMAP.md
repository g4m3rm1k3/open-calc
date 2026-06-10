# Software Engineering Masterclass — Full Curriculum Roadmap

Follow this document linearly. Every lab builds on the previous one.
Each lab is independently runnable — you can stop at any point and resume.

**Language for console output:** Node.js (JavaScript) throughout Phase 1–2.
Phases 3+ introduce TypeScript, Python, and the browser as required.

---

## How to Use This Roadmap

- Work through labs in the order listed below
- Do not skip labs — concepts build on each other
- Every lab has a `SAVE AND TRY` that proves it works before you move on
- Challenges are optional but strongly recommended

---

## Phase 1 — Computational Thinking

**Goal:** Understand how software actually works at the fundamental level.
**Runtime:** Node.js
**Time estimate:** ~40 hours

### Module 1 — Fundamentals

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 01 | [LAB-01 — Variables, Types, and Memory](phase-01-computational-thinking/module-01-fundamentals/LAB-01-variables-types-memory.md) | Value vs reference semantics | ✅ Written |
| 02 | [LAB-02 — Functions and Abstraction](phase-01-computational-thinking/module-01-fundamentals/LAB-02-functions-and-abstraction.md) | Pure functions, parameters, return values | 🔲 Pending |
| 03 | [LAB-03 — Arrays and Iteration](phase-01-computational-thinking/module-01-fundamentals/LAB-03-arrays-and-iteration.md) | Sequences, loops, map/filter/reduce | 🔲 Pending |
| 04 | [LAB-04 — Objects and Hash Maps](phase-01-computational-thinking/module-01-fundamentals/LAB-04-objects-and-hash-maps.md) | Key-value storage, lookup tables | 🔲 Pending |
| 05 | [LAB-05 — Stacks and Queues](phase-01-computational-thinking/module-01-fundamentals/LAB-05-stacks-and-queues.md) | LIFO vs FIFO, call stack mental model | 🔲 Pending |
| 06 | [LAB-06 — Trees and Graphs](phase-01-computational-thinking/module-01-fundamentals/LAB-06-trees-and-graphs.md) | Hierarchical and networked data | 🔲 Pending |
| 07 | [LAB-07 — Recursion](phase-01-computational-thinking/module-01-fundamentals/LAB-07-recursion.md) | Self-reference, base cases, call stack | 🔲 Pending |
| 08 | [LAB-08 — Complexity](phase-01-computational-thinking/module-01-fundamentals/LAB-08-complexity.md) | Big-O, trade-offs, measuring performance | 🔲 Pending |

### Module 2 — Mini Projects

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 09 | [LAB-09 — Calculator](phase-01-computational-thinking/module-02-mini-projects/LAB-09-calculator.md) | Decomposition, operator dispatch | 🔲 Pending |
| 10 | [LAB-10 — Lexer](phase-01-computational-thinking/module-02-mini-projects/LAB-10-lexer.md) | Tokenization, character classification | 🔲 Pending |
| 11 | [LAB-11 — Parser](phase-01-computational-thinking/module-02-mini-projects/LAB-11-parser.md) | Recursive descent, grammar rules | 🔲 Pending |
| 12 | [LAB-12 — Expression Evaluator](phase-01-computational-thinking/module-02-mini-projects/LAB-12-expression-evaluator.md) | Tree walking, operator precedence | 🔲 Pending |
| 13 | [LAB-13 — State Machine](phase-01-computational-thinking/module-02-mini-projects/LAB-13-state-machine.md) | Finite state, transitions, events | 🔲 Pending |
| 14 | [LAB-14 — Dependency Graph](phase-01-computational-thinking/module-02-mini-projects/LAB-14-dependency-graph.md) | Directed graphs, topological sort | 🔲 Pending |
| 15 | [LAB-15 — Scheduler](phase-01-computational-thinking/module-02-mini-projects/LAB-15-scheduler.md) | Priority queues, ordering | 🔲 Pending |
| 16 | [LAB-16 — Simple VM / Interpreter](phase-01-computational-thinking/module-02-mini-projects/LAB-16-simple-vm.md) | Instruction sets, fetch-decode-execute | 🔲 Pending |

---

## Phase 2 — Core Software Engineering

**Goal:** Learn maintainable architecture and reusable design.
**Runtime:** Node.js / TypeScript
**Time estimate:** ~35 hours

### Module 1 — Architecture Principles

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 17 | [LAB-17 — Modules and Interfaces](phase-02-core-software-engineering/module-01-architecture/LAB-17-modules-and-interfaces.md) | Information hiding, contracts | 🔲 Pending |
| 18 | [LAB-18 — SOLID Principles](phase-02-core-software-engineering/module-01-architecture/LAB-18-solid-principles.md) | SRP, OCP, LSP, ISP, DIP | 🔲 Pending |
| 19 | [LAB-19 — Composition over Inheritance](phase-02-core-software-engineering/module-01-architecture/LAB-19-composition-over-inheritance.md) | Mixins, composition, why inheritance breaks | 🔲 Pending |
| 20 | [LAB-20 — Dependency Injection](phase-02-core-software-engineering/module-01-architecture/LAB-20-dependency-injection.md) | Inversion of control, testability | 🔲 Pending |

### Module 2 — Mini Projects

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 21 | [LAB-21 — Plugin System](phase-02-core-software-engineering/module-02-mini-projects/LAB-21-plugin-system.md) | Extension points, open/closed principle | 🔲 Pending |
| 22 | [LAB-22 — Event Bus](phase-02-core-software-engineering/module-02-mini-projects/LAB-22-event-bus.md) | Observer pattern, decoupled communication | 🔲 Pending |
| 23 | [LAB-23 — Command System](phase-02-core-software-engineering/module-02-mini-projects/LAB-23-command-system.md) | Command pattern, encapsulated actions | 🔲 Pending |
| 24 | [LAB-24 — Undo/Redo Stack](phase-02-core-software-engineering/module-02-mini-projects/LAB-24-undo-redo-stack.md) | Command history, reversible operations | 🔲 Pending |
| 25 | [LAB-25 — Configuration System](phase-02-core-software-engineering/module-02-mini-projects/LAB-25-configuration-system.md) | Layered config, environment overrides | 🔲 Pending |
| 26 | [LAB-26 — Serialization Engine](phase-02-core-software-engineering/module-02-mini-projects/LAB-26-serialization-engine.md) | Deep clone, JSON, schema validation | 🔲 Pending |
| 27 | [LAB-27 — Testing Framework](phase-02-core-software-engineering/module-02-mini-projects/LAB-27-testing-framework.md) | Assertions, test runners, isolation | 🔲 Pending |
| 28 | [LAB-28 — Logging System](phase-02-core-software-engineering/module-02-mini-projects/LAB-28-logging-system.md) | Log levels, structured output, observability | 🔲 Pending |

---

## Phase 3 — Frontend Systems

**Goal:** Understand how UIs are built and why frameworks exist.
**Runtime:** Browser (TypeScript + React)
**Time estimate:** ~40 hours

### Module 1 — Raw DOM (Before Frameworks)

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 29 | [LAB-29 — Raw DOM Manipulation](phase-03-frontend-systems/module-01-raw-dom/LAB-29-raw-dom-manipulation.md) | What frameworks abstract away | 🔲 Pending |
| 30 | [LAB-30 — Event Propagation](phase-03-frontend-systems/module-01-raw-dom/LAB-30-event-propagation.md) | Bubbling, capturing, delegation | 🔲 Pending |
| 31 | [LAB-31 — Manual State Sync](phase-03-frontend-systems/module-01-raw-dom/LAB-31-manual-state-sync.md) | The pain that motivates reactivity | 🔲 Pending |

### Module 2 — Framework Concepts

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 32 | [LAB-32 — Reactivity Model](phase-03-frontend-systems/module-02-frameworks/LAB-32-reactivity-model.md) | Signals, derived state, subscriptions | 🔲 Pending |
| 33 | [LAB-33 — Component Architecture](phase-03-frontend-systems/module-02-frameworks/LAB-33-component-architecture.md) | Props, composition, slots | 🔲 Pending |
| 34 | [LAB-34 — State Management](phase-03-frontend-systems/module-02-frameworks/LAB-34-state-management.md) | Local vs global state, lifting state | 🔲 Pending |
| 35 | [LAB-35 — Rendering Pipelines](phase-03-frontend-systems/module-02-frameworks/LAB-35-rendering-pipelines.md) | Reconciliation, batching, repaint | 🔲 Pending |
| 36 | [LAB-36 — Virtual DOM](phase-03-frontend-systems/module-02-frameworks/LAB-36-virtual-dom.md) | Diffing algorithm, why vDOM exists | 🔲 Pending |

### Module 3 — Mini Projects

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 37 | [LAB-37 — Reactive Spreadsheet](phase-03-frontend-systems/module-03-mini-projects/LAB-37-reactive-spreadsheet.md) | Dependency tracking, formula evaluation | 🔲 Pending |
| 38 | [LAB-38 — Node Editor](phase-03-frontend-systems/module-03-mini-projects/LAB-38-node-editor.md) | Graph UI, drag and connect | 🔲 Pending |
| 39 | [LAB-39 — Markdown Editor](phase-03-frontend-systems/module-03-mini-projects/LAB-39-markdown-editor.md) | Parser + renderer pipeline | 🔲 Pending |
| 40 | [LAB-40 — Drawing App](phase-03-frontend-systems/module-03-mini-projects/LAB-40-drawing-app.md) | Canvas, tools as strategy pattern | 🔲 Pending |
| 41 | [LAB-41 — File Explorer](phase-03-frontend-systems/module-03-mini-projects/LAB-41-file-explorer.md) | Tree rendering, recursive components | 🔲 Pending |
| 42 | [LAB-42 — Terminal Emulator](phase-03-frontend-systems/module-03-mini-projects/LAB-42-terminal-emulator.md) | Input/output streams, command parsing | 🔲 Pending |
| 43 | [LAB-43 — IDE Layout System](phase-03-frontend-systems/module-03-mini-projects/LAB-43-ide-layout-system.md) | Panel management, resize, split views | 🔲 Pending |

---

## Phase 4 — Backend Systems

**Goal:** Build real networked services.
**Runtime:** Python (FastAPI) + Node.js
**Time estimate:** ~40 hours

### Module 1 — HTTP Fundamentals

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 44 | [LAB-44 — HTTP Protocol](phase-04-backend-systems/module-01-http/LAB-44-http-protocol.md) | Request/response, methods, status codes | 🔲 Pending |
| 45 | [LAB-45 — REST API Design](phase-04-backend-systems/module-01-http/LAB-45-rest-api.md) | Resources, endpoints, contracts | 🔲 Pending |
| 46 | [LAB-46 — Authentication Basics](phase-04-backend-systems/module-01-http/LAB-46-auth-basics.md) | Sessions, tokens, hashing | 🔲 Pending |

### Module 2 — Async Systems

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 47 | [LAB-47 — Async and Promises](phase-04-backend-systems/module-02-async/LAB-47-async-promises.md) | Event loop, non-blocking I/O | 🔲 Pending |
| 48 | [LAB-48 — Concurrency Models](phase-04-backend-systems/module-02-async/LAB-48-concurrency-models.md) | Threads vs async, cooperative scheduling | 🔲 Pending |
| 49 | [LAB-49 — Queues and Workers](phase-04-backend-systems/module-02-async/LAB-49-queues-and-workers.md) | Producer/consumer, job queues | 🔲 Pending |

### Module 3 — Mini Projects

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 50 | [LAB-50 — Auth Service](phase-04-backend-systems/module-03-mini-projects/LAB-50-auth-service.md) | JWT, password hashing, middleware | 🔲 Pending |
| 51 | [LAB-51 — WebSocket Server](phase-04-backend-systems/module-03-mini-projects/LAB-51-websocket-server.md) | Persistent connections, pub/sub | 🔲 Pending |
| 52 | [LAB-52 — Task Scheduler](phase-04-backend-systems/module-03-mini-projects/LAB-52-task-scheduler.md) | Cron, delayed execution, priority | 🔲 Pending |
| 53 | [LAB-53 — File Indexing Engine](phase-04-backend-systems/module-03-mini-projects/LAB-53-file-indexing-engine.md) | File walking, inverted index | 🔲 Pending |
| 54 | [LAB-54 — Search Engine](phase-04-backend-systems/module-03-mini-projects/LAB-54-search-engine.md) | Tokenization, ranking, relevance | 🔲 Pending |
| 55 | [LAB-55 — Background Worker System](phase-04-backend-systems/module-03-mini-projects/LAB-55-background-worker-system.md) | Workers, queues, retry logic | 🔲 Pending |

---

## Phase 5 — Databases

**Goal:** Understand persistence, modeling, and data integrity.
**Runtime:** SQLite, PostgreSQL, Redis
**Time estimate:** ~30 hours

### Module 1 — Relational

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 56 | [LAB-56 — Relational Modeling](phase-05-databases/module-01-relational/LAB-56-relational-modeling.md) | Tables, keys, relationships | 🔲 Pending |
| 57 | [LAB-57 — Indexing](phase-05-databases/module-01-relational/LAB-57-indexing.md) | B-trees, query plans, trade-offs | 🔲 Pending |
| 58 | [LAB-58 — Normalization](phase-05-databases/module-01-relational/LAB-58-normalization.md) | 1NF-3NF, redundancy elimination | 🔲 Pending |
| 59 | [LAB-59 — Transactions](phase-05-databases/module-01-relational/LAB-59-transactions.md) | ACID, isolation levels, rollback | 🔲 Pending |

### Module 2 — NoSQL and Consistency

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 60 | [LAB-60 — NoSQL Trade-offs](phase-05-databases/module-02-nosql/LAB-60-nosql-tradeoffs.md) | Document, key-value, when to use each | 🔲 Pending |
| 61 | [LAB-61 — Consistency Models](phase-05-databases/module-02-nosql/LAB-61-consistency-models.md) | CAP theorem, eventual consistency | 🔲 Pending |

### Module 3 — Mini Projects

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 62 | [LAB-62 — ORM](phase-05-databases/module-03-mini-projects/LAB-62-orm.md) | Object-relational mapping, query builder | 🔲 Pending |
| 63 | [LAB-63 — Query Engine](phase-05-databases/module-03-mini-projects/LAB-63-query-engine.md) | Parsing SQL, execution planning | 🔲 Pending |
| 64 | [LAB-64 — Migration System](phase-05-databases/module-03-mini-projects/LAB-64-migration-system.md) | Schema versioning, up/down migrations | 🔲 Pending |
| 65 | [LAB-65 — Caching Layer](phase-05-databases/module-03-mini-projects/LAB-65-caching-layer.md) | Read-through, LRU eviction, Redis | 🔲 Pending |
| 66 | [LAB-66 — Analytics Engine](phase-05-databases/module-03-mini-projects/LAB-66-analytics-engine.md) | Aggregation, windowing, OLAP basics | 🔲 Pending |

---

## Phase 6 — Graphics & Simulation

**Goal:** Understand spatial systems, rendering, and simulation architecture.
**Runtime:** Browser (Canvas / WebGL / Three.js)
**Time estimate:** ~35 hours

### Module 1 — Math Foundations

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 67 | [LAB-67 — Vectors](phase-06-graphics-simulation/module-01-math/LAB-67-vectors.md) | Direction, magnitude, dot product | 🔲 Pending |
| 68 | [LAB-68 — Matrices and Transforms](phase-06-graphics-simulation/module-01-math/LAB-68-matrices-transforms.md) | Translation, rotation, scale, composition | 🔲 Pending |
| 69 | [LAB-69 — Coordinate Systems](phase-06-graphics-simulation/module-01-math/LAB-69-coordinate-systems.md) | World vs screen space, transform pipeline | 🔲 Pending |

### Module 2 — Rendering

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 70 | [LAB-70 — Render Loops](phase-06-graphics-simulation/module-02-rendering/LAB-70-render-loops.md) | requestAnimationFrame, delta time | 🔲 Pending |
| 71 | [LAB-71 — 2D Renderer](phase-06-graphics-simulation/module-02-rendering/LAB-71-2d-renderer.md) | Canvas API, layers, clear-and-redraw | 🔲 Pending |
| 72 | [LAB-72 — Painter's Algorithm](phase-06-graphics-simulation/module-02-rendering/LAB-72-painters-algorithm.md) | Draw order, layered rendering | 🔲 Pending |

### Module 3 — Simulation

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 73 | [LAB-73 — Physics Fundamentals](phase-06-graphics-simulation/module-03-simulation/LAB-73-physics-fundamentals.md) | Velocity, acceleration, integration | 🔲 Pending |
| 74 | [LAB-74 — ECS Architecture](phase-06-graphics-simulation/module-03-simulation/LAB-74-ecs-architecture.md) | Entity-Component-System, data-driven design | 🔲 Pending |
| 75 | [LAB-75 — Spatial Partitioning](phase-06-graphics-simulation/module-03-simulation/LAB-75-spatial-partitioning.md) | Quadtrees, grid hashing, broad phase | 🔲 Pending |

### Module 4 — Mini Projects

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 76 | [LAB-76 — Physics Sandbox](phase-06-graphics-simulation/module-04-mini-projects/LAB-76-physics-sandbox.md) | Full simulation loop | 🔲 Pending |
| 77 | [LAB-77 — CAD Viewer](phase-06-graphics-simulation/module-04-mini-projects/LAB-77-cad-viewer.md) | Pan/zoom, coordinate transforms | 🔲 Pending |
| 78 | [LAB-78 — G-code Backplotter](phase-06-graphics-simulation/module-04-mini-projects/LAB-78-gcode-backplotter.md) | Parser → renderer pipeline | 🔲 Pending |
| 79 | [LAB-79 — Pathfinding Visualizer](phase-06-graphics-simulation/module-04-mini-projects/LAB-79-pathfinding-visualizer.md) | A*, BFS, animated algorithm steps | 🔲 Pending |

---

## Phase 7 — Language & Tooling

**Goal:** Understand how languages work from the inside.
**Runtime:** Node.js / TypeScript
**Time estimate:** ~35 hours

### Module 1 — Parsing

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 80 | [LAB-80 — Tokenization](phase-07-language-tooling/module-01-parsing/LAB-80-tokenization.md) | Lexing, character streams, token types | 🔲 Pending |
| 81 | [LAB-81 — Abstract Syntax Trees](phase-07-language-tooling/module-01-parsing/LAB-81-ast.md) | Tree structures, grammar → code | 🔲 Pending |
| 82 | [LAB-82 — Recursive Descent Parser](phase-07-language-tooling/module-01-parsing/LAB-82-recursive-descent.md) | Grammar rules as functions | 🔲 Pending |

### Module 2 — Interpretation

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 83 | [LAB-83 — Tree-Walking Interpreter](phase-07-language-tooling/module-02-interpretation/LAB-83-tree-walking-interpreter.md) | Evaluate nodes, environment, closures | 🔲 Pending |
| 84 | [LAB-84 — Bytecode and VMs](phase-07-language-tooling/module-02-interpretation/LAB-84-bytecode-vm.md) | Compilation to instructions, stack machines | 🔲 Pending |

### Module 3 — Mini Projects

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 85 | [LAB-85 — Template Engine](phase-07-language-tooling/module-03-mini-projects/LAB-85-template-engine.md) | Interpolation, conditionals, loops | 🔲 Pending |
| 86 | [LAB-86 — DSL](phase-07-language-tooling/module-03-mini-projects/LAB-86-dsl.md) | Domain-specific language design | 🔲 Pending |
| 87 | [LAB-87 — Compiler](phase-07-language-tooling/module-03-mini-projects/LAB-87-compiler.md) | Source → target transformation | 🔲 Pending |
| 88 | [LAB-88 — Linter](phase-07-language-tooling/module-03-mini-projects/LAB-88-linter.md) | AST analysis, rule enforcement | 🔲 Pending |
| 89 | [LAB-89 — Formatter](phase-07-language-tooling/module-03-mini-projects/LAB-89-formatter.md) | AST → pretty-printed source | 🔲 Pending |
| 90 | [LAB-90 — Static Analyzer](phase-07-language-tooling/module-03-mini-projects/LAB-90-static-analyzer.md) | Type inference, data flow analysis | 🔲 Pending |
| 91 | [LAB-91 — Code Generator](phase-07-language-tooling/module-03-mini-projects/LAB-91-code-generator.md) | Template-based generation, meta-programming | 🔲 Pending |

---

## Phase 8 — Operating-System Thinking

**Goal:** Understand the abstractions that operating systems provide.
**Runtime:** Node.js / Python
**Time estimate:** ~25 hours

### Module 1 — Concepts

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 92 | [LAB-92 — Processes and Threads](phase-08-os-thinking/module-01-concepts/LAB-92-processes-threads.md) | Process model, thread model, isolation | 🔲 Pending |
| 93 | [LAB-93 — IPC](phase-08-os-thinking/module-01-concepts/LAB-93-ipc.md) | Pipes, sockets, message passing | 🔲 Pending |
| 94 | [LAB-94 — Synchronization](phase-08-os-thinking/module-01-concepts/LAB-94-synchronization.md) | Locks, deadlock, race conditions | 🔲 Pending |
| 95 | [LAB-95 — Memory Management](phase-08-os-thinking/module-01-concepts/LAB-95-memory-management.md) | Allocation, GC, virtual memory concepts | 🔲 Pending |

### Module 2 — Mini Projects

| # | Lab | Core Concept | Status |
|---|-----|-------------|--------|
| 96 | [LAB-96 — Shell](phase-08-os-thinking/module-02-mini-projects/LAB-96-shell.md) | REPL, command parsing, process spawning | 🔲 Pending |
| 97 | [LAB-97 — Process Manager](phase-08-os-thinking/module-02-mini-projects/LAB-97-process-manager.md) | Lifecycle management, signals | 🔲 Pending |
| 98 | [LAB-98 — File Watcher](phase-08-os-thinking/module-02-mini-projects/LAB-98-file-watcher.md) | inotify/FSEvents, debouncing, change detection | 🔲 Pending |
| 99 | [LAB-99 — Memory Visualizer](phase-08-os-thinking/module-02-mini-projects/LAB-99-memory-visualizer.md) | Heap simulation, allocation tracking | 🔲 Pending |
| 100 | [LAB-100 — Job Scheduler](phase-08-os-thinking/module-02-mini-projects/LAB-100-job-scheduler.md) | Scheduling algorithms, preemption | 🔲 Pending |

---

## Phase 9 — Architecture Capstone

**Goal:** Combine everything into a single system that spans multiple phases.
**Time estimate:** ~30 hours

The capstone project: **a distributed task runner**.

It has:
- A DSL for defining task pipelines (Phase 7)
- A REST API and WebSocket progress feed (Phase 4)
- A frontend dashboard with live updates (Phase 3)
- SQLite persistence with migration system (Phase 5)
- An ECS-style worker architecture (Phase 6)

| # | Lab | Description | Status |
|---|-----|-------------|--------|
| 101 | [LAB-101 — Capstone Design](phase-09-capstone/LAB-101-capstone-design.md) | Architecture decisions, component map | 🔲 Pending |
| 102 | [LAB-102 — Capstone Build](phase-09-capstone/LAB-102-capstone-build.md) | Full implementation across all layers | 🔲 Pending |
| 103 | [LAB-103 — Capstone Review](phase-09-capstone/LAB-103-capstone-review.md) | Tradeoffs, what you'd change, extensions | 🔲 Pending |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ Written | Full lesson available |
| 🔲 Pending | Stub — request this lab when ready |

---

*Total: 103 labs across 9 phases.*
*Work through them in order. Each lab is independently runnable.*
