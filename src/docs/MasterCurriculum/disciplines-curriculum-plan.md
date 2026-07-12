# Disciplines Curriculum Plan

**Core principle:** Stop thinking in languages. Think in disciplines.
A language teaches *how to express ideas*. A discipline teaches *how to build software*.
Languages are vehicles. Disciplines are the destination.

Everything here is browser-teachable using the existing lesson engine, CodeLens,
visualizers, and labs. New tools are called out explicitly.

---

## What Already Exists

| Series ID | Label |
|---|---|
| python-fundamentals | Python Fundamentals |
| javascript-fundamentals | JavaScript Fundamentals |
| typescript-fundamentals | TypeScript Fundamentals |
| cpp-fundamentals | C++ Fundamentals |
| csharp-fundamentals | C# Fundamentals |
| java-fundamentals | Java Fundamentals |
| sql-fundamentals | SQL Fundamentals |
| dsa-python | Data Structures & Algorithms (Python) |
| html-dom | HTML & the DOM |
| css-fundamentals | CSS Fundamentals |
| css-selectors | CSS Selectors |
| css-box-model | CSS Box Model |
| css-layout | CSS Layout |
| css-flexbox | CSS Flexbox |
| css-grid | CSS Grid |
| css-visual-design | CSS Visual Design |
| css-responsive | CSS Responsive |
| css-animation | CSS Animation |
| css-professional | CSS Professional |
| backend-fundamentals | Backend Fundamentals |
| git-version-control | Git & Version Control |
| git-advanced | Git Advanced |
| contributor-series | Contributor Series |

---

## Disciplines to Build

---

### 1. Software Construction
**The missing bridge between "I know a language" and "I build software."**
Not tied to any ecosystem. Python or JS as the vehicle.

Levels (15):
1. From script to program
2. Decomposing problems
3. Designing functions
4. Building reusable modules
5. Designing library APIs
6. Error handling
7. Configuration
8. Data modeling
9. State management
10. Building reusable components
11. Organising larger projects
12. Refactoring
13. Testing as you build
14. Extending an existing system
15. Designing for change

**New tools needed:** None. Existing editor + output handles it.
Series ID: `software-construction`

---

### 2. Clean Code
**Naming, readability, duplication, magic numbers, comments, smells, refactoring.**

Levels (8):
0. What clean code is and why it matters
1. Naming
2. Functions
3. Comments
4. Duplication and DRY
5. Code smells
6. Refactoring safely
7. Capstone — before/after refactor

**New tools needed:** **Diff Panel** (new right tab) — Monaco side-by-side diff of
before/after a refactor. Used in challenges to show the transformation.
Series ID: `clean-code`

---

### 3. Object-Oriented Design
**Classes, objects, encapsulation, inheritance, polymorphism, composition, SOLID.**

Levels (10):
0. What objects are and why they exist
1. Encapsulation
2. Inheritance
3. Polymorphism
4. Composition over inheritance
5. SOLID — Single Responsibility
6. SOLID — Open/Closed
7. SOLID — Liskov Substitution
8. SOLID — Interface Segregation + Dependency Inversion
9. Capstone — design a small OO system

**New tools needed:** **Object Diagram Panel** (new right tab) — renders live object
instances, fields, and relationships as boxes+arrows while code runs. Connects to
the step-through debugger so you can watch the object graph evolve.
Series ID: `oop-design`

---

### 4. Design Patterns
**The 11 patterns every professional engineer recognises on sight.**

Levels (12):
0. What patterns are and why they exist
1. Strategy
2. Observer
3. Factory
4. Builder
5. Adapter
6. Decorator
7. Facade
8. Command
9. State
10. Composite
11. Dependency Injection
12. Capstone — identify patterns in a real codebase

**New tools needed:** Object Diagram Panel (same as OOP — shared).
Also benefits from **Diagram Panel** (see Architecture) for static structure diagrams.
Series ID: `design-patterns`

---

### 5. Architecture
**Client/server, MVC, MVVM, layered, event-driven, microservices concepts, plugins.**

Levels (9):
0. What architecture is — the decisions that are expensive to change
1. Client/Server
2. Layered Architecture
3. MVC
4. MVVM and component architecture
5. Event-driven
6. Microservices vs monolith
7. Plugin architectures
8. Capstone — diagram and critique a real architecture

**New tools needed:** **Diagram Panel** (new right tab) — renders boxes-and-arrows
architecture diagrams from a simple DSL in lesson markdown (lightweight Mermaid-style).
Lesson defines `diagram` code blocks; panel renders them. This tool also serves
OOP, Design Patterns, and Database Design.
Series ID: `software-architecture`

---

### 6. Testing
**Assertions, unit tests, integration tests, mocking, TDD, regression.**

Levels (8):
0. Why testing exists — the cost of bugs at each stage
1. Assertions
2. Unit testing
3. Mocking and test doubles
4. Integration testing
5. Test-driven development
6. Regression testing
7. Capstone — write a full test suite for an existing module

**New tools needed:** **Test Suite Panel** (enhanced Tests tab) — shows the
describe/it block tree, marks each test pass/fail, shows actual vs expected for
failures. Jest-style output renderer. The existing test runner handles challenges;
this is for the testing discipline itself where the student writes the tests.
Series ID: `testing-fundamentals`

---

### 7. Debugging
**Stack traces, logging, breakpoints, variable inspection, hypothesis-driven debugging.**

Levels (7):
0. What debugging is — the scientific method applied to code
1. Reading stack traces
2. Logging strategy
3. Using a debugger (breakpoints, step, inspect)
4. Binary search debugging
5. Minimal reproduction
6. Capstone — debug a series of intentionally broken programs

**New tools needed:** CodeLens already covers step-through. The step-through debugger
needs a **Stack Trace Panel** mode — paste a stack trace, panel highlights the
relevant frame and explains each line. A mode of the Debug tab, not a new one.
Series ID: `debugging-fundamentals`

---

### 8. Performance
**Time complexity, space complexity, Big-O, profiling, memory, caching.**

Levels (8):
0. What performance means — time vs space, asymptotic thinking
1. Big-O notation
2. O(1), O(log n), O(n)
3. O(n log n), O(n²), O(2ⁿ)
4. Profiling — finding where time is spent
5. Memory and garbage collection
6. Caching strategies
7. Capstone — profile and optimise a slow program

**New tools needed:** **Complexity Graph Panel** (new right tab) — plots O(1), O(log n),
O(n), O(n log n), O(n²) curves on a graph with a slider for n. Shows where an
algorithm's curve falls. Small build, high value for DSA and Performance series.
Series ID: `performance-engineering`

---

### 9. Security
**Input validation, SQL injection, XSS, CSRF, authentication, authorisation, hashing, secrets.**

Levels (8):
0. The attacker's mindset — trust boundaries and threat models
1. Input validation
2. SQL injection
3. XSS (Cross-Site Scripting)
4. CSRF
5. Authentication vs authorisation
6. Password hashing
7. Secrets management — what never goes in code

**New tools needed:** None new. XSS demos run in the existing iframe sandbox.
SQL injection runs in the SQL executor. Lesson design carries it.
Series ID: `web-security`

---

### 10. APIs and HTTP
**HTTP methods, status codes, headers, JSON, CRUD, REST design, auth, pagination, versioning.**

Levels (9):
0. What HTTP is — request/response, statelessness
1. Methods and status codes
2. Headers and content types
3. JSON — design and structure
4. CRUD and REST resource design
5. Authentication (tokens, JWT, API keys)
6. Pagination
7. Versioning
8. Capstone — design and test a complete REST API

**New tools needed:** **API Simulator** (new executor + Network tab) — a mock HTTP
server running in the browser. Lessons define route handlers in a `server` block;
student's `fetch()` calls hit those handlers. Network tab shows request + response
headers + body. The single most important new tool for backend and API curricula.
Series ID: `rest-apis`

---

### 11. Frontend Engineering
**DOM architecture, event system, rendering pipeline, accessibility, forms, SPA concepts.**

Levels (9):
0. What the browser is — the platform beneath the framework
1. The DOM as a data structure
2. Events and event propagation
3. The rendering pipeline (style, layout, paint, composite)
4. Forms and input handling
5. Accessibility — what the accessibility tree is
6. Component model — why components
7. State and the UI
8. SPA routing concepts

**New tools needed:** DOM Panel already exists. Rendering pipeline benefits from
a **Pipeline Diagram** (could be a static SVG in the lesson, not a new tab).
Series ID: `frontend-engineering`

---

### 12. React
**JSX, components, props, state, effects, context, reducers, routing, forms, performance, hooks.**

Levels (12):
0. What React is — the problem it solves
1. JSX
2. Components and props
3. State
4. Effects
5. Lists and keys
6. Forms
7. Context
8. Reducers
9. Routing
10. Performance (memo, useCallback, useMemo)
11. Custom hooks
12. Capstone — build a complete small app

**New tools needed:** **Component Tree Panel** (new right tab) — shows the React
component hierarchy live as the preview renders, with props and state values.
Requires React running in iframe posting a message back to the parent with the
component tree. Significant but teachable build.
Series ID: `react-fundamentals`

---

### 13. Vue
**Components, reactivity, Composition API, stores, routing, forms, lifecycle.**

Levels (8):
0. What Vue is — reactivity as the core concept
1. Templates and directives
2. Components and props
3. Reactivity and refs
4. Computed and watchers
5. Composition API
6. Pinia (state management)
7. Vue Router + forms

**New tools needed:** Component Tree Panel (same as React — shared tool).
Series ID: `vue-fundamentals`

---

### 14. Browser APIs
**Fetch, Storage, Canvas, Audio, Workers, IndexedDB, WebSocket, Drag & Drop.**

Levels (8):
0. The browser as a platform — what APIs exist and why
1. Fetch and network
2. localStorage / sessionStorage / cookies
3. Canvas 2D
4. Web Workers
5. IndexedDB
6. WebSocket
7. Drag & Drop + Clipboard

**New tools needed:** None. All run in the existing iframe sandbox.
Canvas, Audio, IndexedDB all work in browser.
Series ID: `browser-apis`

---

### 15. Computer Science Foundations
**Recursion, trees, graphs, automata, compilers, memory, CPU, OS, networking.**

Levels (10):
0. Computation — what computers actually do
1. Recursion
2. Trees
3. Graphs
4. Finite automata and state machines
5. Parsing and grammars
6. Compilation pipeline
7. Memory model (stack, heap, garbage collection)
8. Operating system concepts
9. Networking concepts

**New tools needed:**
- **State Machine Visualizer** — FSM states as circles+arrows, highlights current
  state as input is processed. Needed for automata level.
- **Memory Model Panel** — stack frames + heap boxes, connected to step-through
  debugger. Could be a mode of the Debug tab. Needed for memory level, Rust, C++.
- **Parse Tree Panel** — shows AST for an expression as the lesson explains parsing.

Series ID: `cs-foundations`

---

### 16. Functional Programming
**Pure functions, immutability, closures, HOFs, map/filter/reduce, currying, composition.**

Levels (8):
0. What functional programming is — why immutability and purity matter
1. Pure functions
2. Immutability
3. Closures
4. Higher-order functions
5. Map, filter, reduce
6. Currying and partial application
7. Function composition

**New tools needed:** **Pipeline Visualizer** (new right tab) — shows data flowing
through composed functions as a chain. Input → f → g → h → output with intermediate
values visible. Can be built as a specialised CodeLens mode.
Series ID: `functional-programming`

---

### 17. Concurrent and Async Programming
**Event loop, call stack, task queue, microtasks, callbacks, promises, async/await, race conditions.**

Levels (8):
0. Why concurrency is hard — shared state and timing
1. The event loop
2. The call stack and task queue
3. Microtasks vs macrotasks
4. Callbacks and callback hell
5. Promises
6. Async/await
7. Race conditions and how to avoid them

**New tools needed:** **Event Loop Visualizer** (new right tab) — animated call stack,
task queue, and microtask queue. Code runs and each frame is pushed/popped, tasks
are queued, microtasks drain. The most-requested JavaScript teaching tool that
doesn't exist in the lesson engine yet. Significant build.
Series ID: `async-programming`

---

### 18. Database Design
**Relational design, normalisation, ER modeling, indexes, transactions, ACID, NoSQL.**

Levels (8):
0. What a database is — persistence and the cost of data loss
1. Relational model
2. Entity-relationship modeling
3. Normalisation (1NF, 2NF, 3NF)
4. Indexes
5. Transactions and ACID
6. Joins deep-dive
7. NoSQL — document stores and when to use them

**New tools needed:** **ER Diagram Panel** — renders entity-relationship diagrams
from a schema DSL in lessons. Can share infrastructure with the Diagram Panel.
Series ID: `database-design`

---

### 19. DevOps Concepts
**Build, compile, package, deploy, environments, config, logging, monitoring, CI, CD.**

Levels (8):
0. The software delivery pipeline — what happens between commit and user
1. Build and compile
2. Packaging and artefacts
3. Environments (dev, staging, prod)
4. Configuration management
5. Logging and observability
6. CI concepts
7. CD concepts

**New tools needed:** None. Conceptual teaching with bash executor handles it.
Series ID: `devops-concepts`

---

### 20. Professional Software Engineering
**The things teams know that tutorials skip.**

Levels (10):
0. Breaking problems down — how engineers think
1. API design principles
2. Stable interfaces and backward compatibility
3. Error handling strategy
4. Configuration design
5. Feature flags
6. Technical debt
7. Incremental development
8. Codebase evolution and maintainability
9. Software quality attributes (performance, reliability, scalability, usability)

**New tools needed:** None. The depth is in the writing.
Series ID: `professional-engineering`

---

### 21. Rust Fundamentals
**Ownership, borrow checker, lifetimes, traits, enums, pattern matching, error handling.**

Levels (10):
0. What Rust is — the problems it solves (memory safety without GC)
1. Ownership
2. Borrowing and references
3. Lifetimes
4. Structs and enums
5. Pattern matching
6. Traits
7. Error handling (Result, Option)
8. Collections and iterators
9. Concurrency in Rust

**New tools needed:** Browser Rust executor (WASM compilation). This is an executor
addition, not a new panel. The Memory Model Panel (from CS Foundations) serves double
duty here for ownership/borrowing visualisation.
Series ID: `rust-fundamentals`

---

### 22. Go Fundamentals
**Goroutines, channels, interfaces, error handling, packages, defer/panic/recover.**

Levels (9):
0. What Go is — simplicity as a design goal
1. Types and zero values
2. Functions and multiple return values
3. Structs and methods
4. Interfaces
5. Error handling
6. Goroutines
7. Channels
8. Packages and modules

**New tools needed:** Go playground API as executor. No new panels.
Series ID: `go-fundamentals`

---

## Tool Build Priority

Ranked by how many disciplines each tool unlocks.

| Priority | Tool | New Panel/Tab | Unlocks |
|---|---|---|---|
| 1 | **Diagram Panel** | New right tab | Architecture, Design Patterns, OOP, DB Design |
| 2 | **API Simulator + Network Panel** | New executor + Network tab | REST APIs, Backend, Security, DevOps |
| 3 | **Event Loop Visualizer** | New right tab | Async Programming, JS internals, CS Foundations |
| 4 | **Component Tree Panel** | New right tab | React, Vue, Frontend Engineering |
| 5 | **Object Diagram Panel** | New right tab (or Diagram mode) | OOP, Design Patterns |
| 6 | **Memory Model Panel** | Mode of Debug tab | CS Foundations, Rust, C++ |
| 7 | **Complexity Graph** | New right tab | Performance, DSA |
| 8 | **State Machine Visualizer** | New right tab (or Diagram mode) | CS Foundations, Async |
| 9 | **Pipeline Visualizer** | New right tab | Functional Programming |
| 10 | **Diff Panel** | New right tab | Clean Code, Refactoring |
| 11 | **ER Diagram** | Mode of Diagram Panel | Database Design |
| 12 | **Parse Tree Panel** | New right tab | CS Foundations, Compilers |
| 13 | **Stack Trace Panel** | Mode of Debug tab | Debugging |
| 14 | **Test Suite Panel** | Enhanced Tests tab | Testing |

---

## Build Waves

### Wave 1 — Write immediately (no new tools)
Software Construction, Clean Code, Debugging, DevOps Concepts,
Professional Software Engineering, Web Security, Browser APIs

### Wave 2 — Build one tool, unlock one series
- Complexity Graph → Performance Engineering
- Test Suite Panel → Testing Fundamentals
- Memory Model Panel → CS Foundations (partial) + helps Rust/C++

### Wave 3 — Diagram Panel unlocks a cascade
Build once, serve: Architecture, Design Patterns, OOP, Database Design, ER Diagrams

### Wave 4 — Significant infrastructure
- API Simulator + Network Panel → REST APIs, Backend, Security
- Event Loop Visualizer → Async Programming
- Component Tree Panel → React, Vue, Frontend Engineering

### Wave 5 — Language runtimes
- Rust executor (WASM) → Rust Fundamentals
- Go executor (playground API) → Go Fundamentals

---

## Series Count Summary

| Status | Count |
|---|---|
| Already exists | 23 |
| To build (disciplines) | 22 |
| **Total** | **45** |

Languages covered when complete: Python, JS, TS, C++, C#, Java, SQL, HTML, CSS, Rust, Go
Disciplines covered: Software Construction, OOP, Design Patterns, Architecture,
Clean Code, Testing, Debugging, Performance, Security, APIs, Frontend, React, Vue,
Browser APIs, CS Foundations, Functional Programming, Async, Database Design,
DevOps, Professional Engineering, Git (×2)
