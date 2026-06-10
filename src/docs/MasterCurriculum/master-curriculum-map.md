# Master Curriculum Map — Enterprise Software Engineering

**Purpose:** A knowledge library. Every item is a standalone project with its own
lesson series. You pick what to build next based on what gap you want to close.
Each project teaches a cluster of skills that compound across everything you build.

---

## How to Read This Map

Each project has:
- **Teaches** — the concrete skills, concepts, and technologies the project instils
- **Builds on** — what you should have done first (not strict prerequisites — lessons
  are self-contained — but the concepts will land harder with context)
- **Unlocks** — what becomes possible or easier after this project
- **Language** — what you write it in, and why that language for this project
- **Approx. lessons** — size of the lesson series

The projects are grouped into five tracks. You do not have to follow any track
in order. The map is a menu, not a syllabus.

---

## Track A — Foundations of Computer Science

These projects teach the core concepts that everything else is built on.
No prior knowledge required beyond basic scripting.

---

### A1 — Build a Stack, Queue, and Hash Map from Scratch
**Language:** Python  
**Approx. lessons:** 8  
**Teaches:**
- What data structures actually are (arrays in memory, pointer arithmetic)
- The stack: LIFO, call stack, undo history, expression evaluation
- The queue: FIFO, job queues, BFS, event loops
- The hash map: hash functions, collision resolution, load factor, rehashing
- Big-O notation: what it measures, why it matters, how to reason about it
- Memory allocation: stack vs heap, what `malloc` conceptually does
- Why Python lists are not arrays in the CS sense

**Builds on:** Nothing  
**Unlocks:** Every other project — data structures are the vocabulary of all code

---

### A2 — Build a Binary Search Tree and a Graph
**Language:** Python  
**Approx. lessons:** 10  
**Teaches:**
- Trees: nodes, edges, parent/child, depth, height, leaf nodes
- BST invariant: left < root < right, and why it makes search O(log n)
- Tree traversal: in-order, pre-order, post-order, BFS, DFS
- Recursion: the call stack, base cases, stack overflow, tail recursion
- Graphs: directed vs undirected, weighted vs unweighted, adjacency list vs matrix
- Graph traversal: BFS, DFS, what they find and what they miss
- Connected components, cycles, topological sort
- Where this appears: file systems, dependency resolution, route finding, org charts

**Builds on:** A1 (hash maps used in graph representation)  
**Unlocks:** A3, A4, database indexing in the PDM project, any networked system

---

### A3 — Build a Simple Virtual Machine
**Language:** Python  
**Approx. lessons:** 12  
**Teaches:**
- What a CPU actually does: fetch, decode, execute
- Registers, the instruction pointer, the program counter
- A minimal instruction set: PUSH, POP, ADD, JUMP, CALL, RETURN
- The call stack in detail: stack frames, local variables, return addresses
- How function calls work at the machine level (not the language level)
- What bytecode is and how Python/JavaScript actually run
- Memory segmentation: code, stack, heap
- The connection between your calculator/MATLAB clone and this machine

**Builds on:** A1 (the VM uses a stack internally)  
**Unlocks:** Understanding any debugger, any profiler, any performance problem

---

### A4 — Implement Sorting and Searching Algorithms
**Language:** Python  
**Approx. lessons:** 8  
**Teaches:**
- Bubble, insertion, selection, merge, quick, heap sort — implemented and analysed
- Why merge sort is O(n log n) and why that is provably optimal for comparison sorts
- Binary search: the invariant, why it requires sorted input, the off-by-one traps
- In-place vs out-of-place algorithms, stable vs unstable sort
- Space complexity (not just time complexity)
- When to use which algorithm — the practical decision, not just the theory
- Randomised algorithms: quicksort's average vs worst case, why random pivots help
- The connection to database indexes (a B-tree is a sorted structure for search)

**Builds on:** A1, A2  
**Unlocks:** Database internals understanding, any performance-critical code

---

### A5 — Discrete Mathematics via Code
**Language:** Python  
**Approx. lessons:** 15  
**Teaches:**
- Logic: truth tables, boolean algebra, De Morgan's laws — built as code
- Set theory: union, intersection, complement, power set — built as code
- Relations and functions: injective, surjective, bijective — why these matter in databases
- Modular arithmetic: clocks, hashing, cryptography fundamentals, why modulo is everywhere
- Combinatorics: permutations, combinations, the birthday problem
- Proof by induction: what it means and how to read one (not write one — reading is what
  you need to understand algorithm correctness proofs)
- Graph theory fundamentals: already covered in A2, revisited formally here
- Probability: conditional probability, Bayes' theorem, expected value

**Builds on:** A1, A2  
**Unlocks:** Cryptography (B3), distributed systems (C3), any ML/statistics work

---

## Track B — Systems Programming and the Machine

These projects take you below the language level. You learn what the runtime
is actually doing, how the OS manages processes and memory, and how networks work
at the wire level. These are the gaps that make debugging hard when you don't have them.

---

### B1 — Build a Shell (Command Line Interpreter)
**Language:** C or Rust  
**Approx. lessons:** 14  
**Why this language:** Shells deal with OS primitives directly — processes, file
descriptors, signals. You cannot learn this in Python because Python abstracts it
away. C exposes everything; Rust exposes the same things safely. Either teaches
you what is actually happening.  
**Teaches:**
- What a process is: a running program, its own memory space, PID
- `fork()` and `exec()`: how a shell launches a program (fork creates a copy of the
  current process; exec replaces the copy with the new program)
- File descriptors: everything is a file. stdin=0, stdout=1, stderr=2
- Pipes: `|` redirects one process's stdout to another's stdin — how this works in memory
- Signals: SIGINT (Ctrl+C), SIGTERM, SIGKILL — what they are and why they differ
- Environment variables: what they are, how processes inherit them
- Exit codes: 0 = success, non-zero = error — what your scripts should be returning
- The difference between a compiled and interpreted language, from the inside

**Builds on:** A1, A2  
**Unlocks:** Understanding CI/CD systems, Docker, any DevOps work, B2

---

### B2 — Memory Management: Build a Memory Allocator
**Language:** C  
**Approx. lessons:** 10  
**Why this language:** Memory allocation is a C-level concept. This is the one project
where C is the only real choice.  
**Teaches:**
- The heap: what it is, how `malloc` and `free` work
- Fragmentation: internal vs external, why it matters
- The free list: how an allocator tracks available memory
- First-fit, best-fit, worst-fit strategies — trade-offs
- What happens when you `free` the wrong pointer, double-free, or forget to free
- Garbage collection: what it is, why Python and JavaScript have it, what it costs
- Why Rust has no garbage collector and no manual memory management (ownership model)
- Buffer overflows: what they are, why they are the most common class of security bug

**Builds on:** A1 (free list is a linked list), B1  
**Unlocks:** Understanding any C extension, any performance-critical Python, any
systems-level security discussion

---

### B3 — Cryptography from First Principles
**Language:** Python  
**Approx. lessons:** 12  
**Teaches:**
- What cryptographic hash functions are: SHA-256, why they are one-way
- Symmetric encryption: AES, keys, IV, the difference between ECB and CBC modes
- Asymmetric encryption: RSA and elliptic curve — the mathematical intuition (modular
  exponentiation, discrete logarithm) not just the API
- Digital signatures: proving you wrote something without revealing your key
- TLS/HTTPS: what happens during the handshake, what a certificate is, what a CA is
- JWT tokens: how they work, how they are verified, how they are attacked
- Password hashing: bcrypt, scrypt, argon2 — why MD5 and SHA-1 are not password hashes
- Common attacks: replay attacks, MITM, timing attacks, padding oracle

**Builds on:** A5 (modular arithmetic), A1  
**Unlocks:** The auth lessons in the PDM project become deep instead of surface-level.
Any security-sensitive system.

---

### B4 — Networking from Scratch: Build a Tiny HTTP Server
**Language:** Python or Go  
**Approx. lessons:** 14  
**Why Go is offered:** Go's concurrency model (goroutines and channels) is the
clearest introduction to concurrent servers. Python with `asyncio` teaches the same
concepts with more friction.  
**Teaches:**
- TCP/IP: what packets are, what a socket is, the three-way handshake
- HTTP/1.1 in detail: headers, methods, status codes, keep-alive, chunked encoding
- Writing a socket server by hand: `accept()`, `recv()`, `send()`
- Parsing an HTTP request from raw bytes
- Concurrent servers: the `select()` model, the thread-per-connection model,
  the event loop model — what each costs
- HTTP/2 concepts: multiplexing, header compression, why it exists
- What nginx does and why you would not write your own in production
- Content-Type, MIME types, how the browser decides how to render a response

**Builds on:** A1 (queues used in the event loop), B1 (file descriptors are sockets)  
**Unlocks:** Every web service you build, the PDM API layer, C1, C2, C3

---

### B5 — Build a Key-Value Store (like Redis)
**Language:** Go or Rust  
**Approx. lessons:** 12  
**Teaches:**
- In-memory data stores: why they are fast, what they give up (durability)
- The RESP protocol: how Redis clients talk to Redis servers
- TTL: time-to-live, expiry, why caches need it
- Persistence: write-ahead log, snapshotting, the trade-off between them
- Concurrency: multiple clients hitting the same in-memory store simultaneously
- What a cache miss is, the thundering herd problem, cache invalidation
- Why "cache invalidation is one of the two hard problems in CS" — cache invalidation
  and naming things
- Connection pooling revisited: why this store needs it too

**Builds on:** A1, B4  
**Unlocks:** C1 (caching is a distributed systems concept), C2, performance in any system

---

## Track C — Distributed Systems and Architecture

These projects teach you how to build systems that run on more than one machine,
handle failures, and scale. This is where enterprise software engineering lives.

---

### C1 — Build a Message Queue (like RabbitMQ/Kafka)
**Language:** Go  
**Approx. lessons:** 14  
**Teaches:**
- What a message queue is and why it exists (decoupling producers from consumers)
- Topics, partitions, offsets — how Kafka models a log
- At-most-once, at-least-once, exactly-once delivery — what these mean and the
  cost of each
- Consumer groups: multiple consumers sharing work
- Backpressure: what happens when consumers are slower than producers
- Dead letter queues: where failed messages go
- The event-driven architecture pattern: how large systems communicate without
  direct API calls
- The connection to the PDM project: the checkout event could be a message that
  triggers notifications, audit logs, and backup jobs — all decoupled

**Builds on:** A1 (queues), B4 (networking), B5 (persistence)  
**Unlocks:** C2, C3, any microservices architecture

---

### C2 — Service Mesh: Build a Load Balancer and Reverse Proxy
**Language:** Go  
**Approx. lessons:** 10  
**Teaches:**
- What a reverse proxy is: a server that forwards requests to other servers
- Load balancing strategies: round-robin, least-connections, consistent hashing
- Health checks: how a load balancer knows which backends are alive
- Circuit breakers: stopping requests to a failing service before it cascades
- Rate limiting: token bucket and leaky bucket algorithms — implemented
- SSL termination: why HTTPS ends at the proxy, not the backend
- Service discovery: how does Service A find Service B when IPs change?
- The connection to nginx, Envoy, AWS ALB — what they do that you now understand

**Builds on:** B4, B5, C1  
**Unlocks:** C3, deploying any multi-service system

---

### C3 — Consensus and Distributed State: Implement Raft
**Language:** Go  
**Approx. lessons:** 16  
**This is the hardest project on the map. It earns its difficulty.**  
**Teaches:**
- Why distributed systems are fundamentally different from single-machine systems
- The CAP theorem: Consistency, Availability, Partition tolerance — pick two
- The Byzantine generals problem: reaching agreement when you cannot trust all nodes
- Leader election: how nodes agree on who is in charge
- Log replication: how the leader's state is copied to followers
- Split-brain: what happens when the network partitions and two leaders form
- Raft as a concrete, readable alternative to Paxos
- What etcd, CockroachDB, and Consul actually do at their core
- Why your PDM system does not need this (and when a system does)

**Builds on:** A5, B4, C1  
**Unlocks:** Architecting any system where data must be replicated correctly

---

### C4 — Build a Database Engine (like SQLite)
**Language:** Rust  
**Approx. lessons:** 20  
**This is the second hardest project. It is also the most universally valuable.**  
**Teaches:**
- Storage engines: how data is actually laid out on disk (pages, B-trees)
- The B-tree in detail: why databases use it instead of a hash map or BST
- SQL parsing: turning a SQL string into an AST (you have already built parsers)
- Query planning: deciding HOW to execute a query, not just what to do
- Indexes: what they are physically, why they speed reads and slow writes
- Transactions: the ACID properties implemented — not just named
- Write-ahead logging: how the database survives a crash mid-write
- MVCC (multi-version concurrency control): how PostgreSQL lets readers and writers
  not block each other
- Joins: how a nested loop join, hash join, and merge join actually work

**Builds on:** A1, A2, A4, B2  
**Unlocks:** Every performance question about any database becomes answerable.
You stop treating the database as a black box.

---

## Track D — Applied Mathematics

Mathematics taught through code, with a real application in each lesson.
The rule from the lesson contract applies: maths is taught at the moment of use.
No lesson says "apply the formula." Every formula is derived.

---

### D1 — Linear Algebra via Graphics: Build a 3D Renderer
**Language:** Python (numpy) then TypeScript/WebGL  
**Approx. lessons:** 18  
**Teaches:**
- Vectors: what they are geometrically and algebraically, dot product, cross product
- Matrices: what matrix multiplication actually computes (linear transformations)
- The rotation matrix: derived from trigonometry, not memorised
- Translation, scaling, rotation as matrix operations — and why they compose
- Homogeneous coordinates: why 3D graphics uses 4×4 matrices
- The view matrix, projection matrix, MVP matrix — what each does geometrically
- Rasterisation: how a triangle becomes pixels
- The z-buffer: solving the hidden surface problem
- The connection to your CAM system: tool paths, coordinate transforms, G-code
  transformations all use this linear algebra

**Builds on:** Nothing (the maths is derived from scratch)  
**Unlocks:** D2, D3, any graphics or simulation work, deep understanding of your
existing CAM project

---

### D2 — Calculus via Simulation: Build a Physics Engine
**Language:** Python  
**Approx. lessons:** 14  
**Teaches:**
- Derivatives: rate of change, derived geometrically before symbolically
- Integrals: area under a curve, derived as a limit of sums
- Euler integration: the simplest physics simulation — why it drifts
- Runge-Kutta: why RK4 is used in every real physics engine
- Collision detection: AABB, circle-circle, the separating axis theorem
- Impulse resolution: what happens when objects collide (conservation of momentum)
- Springs and dampers: Hooke's law, damped oscillations — used in every UI animation
- The connection to your MATLAB clone: everything it computes lives here

**Builds on:** D1 (vectors), Nothing else required  
**Unlocks:** D3, D4, any simulation work, understanding animation systems

---

### D3 — Numerical Methods: Build a Scientific Computing Library
**Language:** Python  
**Approx. lessons:** 12  
**Teaches:**
- Floating point representation: IEEE 754, why 0.1 + 0.2 ≠ 0.3, catastrophic cancellation
- Root finding: bisection, Newton-Raphson, secant method — you have bisection already
- Numerical integration: Simpson's rule, Gaussian quadrature
- Numerical differentiation: finite differences, central vs forward differences
- Linear systems: Gaussian elimination, LU decomposition, why direct methods fail
  for large sparse systems
- Eigenvalues: the power iteration method, what eigenvalues mean geometrically
- The connection to FEA (finite element analysis): every structural simulation
  uses these methods

**Builds on:** D1, D2  
**Unlocks:** D4, any engineering simulation, understanding what MATLAB actually does

---

### D4 — Statistics and Probability via Data Analysis
**Language:** Python (pandas, scipy)  
**Approx. lessons:** 12  
**Teaches:**
- Descriptive statistics: mean, median, variance, standard deviation — derived not memorised
- Probability distributions: normal, binomial, Poisson — where each appears in real data
- Bayesian inference: updating beliefs with evidence — used in spam filters,
  medical tests, A/B tests
- Hypothesis testing: p-values, Type I and Type II errors, what significance means
- Regression: linear regression derived from first principles (least squares)
- Correlation vs causation: the concrete reason they differ
- Monte Carlo simulation: using randomness to compute things that are hard to
  compute analytically
- The connection to manufacturing: statistical process control, tolerance analysis,
  six sigma — all live here

**Builds on:** A5 (probability), D3  
**Unlocks:** Any data-driven decision making, ML foundations (D5 — not in this map
but the door is open)

---

## Track E — Software Architecture and Professional Practice

These projects teach the structural and process skills of working
software engineering: how to design systems before writing them, how to
make them observable, how to deploy and maintain them.

---

### E1 — Design Patterns: Build a Plugin System
**Language:** TypeScript  
**Approx. lessons:** 10  
**Teaches:**
- The Gang of Four patterns in concrete use cases (not toy examples):
  Factory, Builder, Observer, Strategy, Decorator, Command, Iterator
- Why design patterns exist: they are solutions to recurring structural problems
- The open/closed principle demonstrated through a plugin system that adds
  functionality without modifying existing code
- Dependency injection: what it is, why it makes code testable
- Interfaces as contracts: the distinction between what a thing is and what it does
- Event emitters: the observer pattern implemented
- The connection to the PDM system: the plugin system is the extension mechanism
  the PDM project defers to a later lesson

**Builds on:** A1, A2, the PDM project's domain layer  
**Unlocks:** E2, E3, any large TypeScript/JavaScript system

---

### E2 — Testing Strategies: Build a Test Framework
**Language:** TypeScript  
**Approx. lessons:** 10  
**Teaches:**
- Unit tests: testing a single function in isolation, what isolation means
- Integration tests: testing that two components work together correctly
- End-to-end tests: testing the whole system as a user would
- Test doubles: mocks, stubs, fakes, spies — what each is and when to use which
- Property-based testing: generating test cases from invariants (not just examples)
- Test coverage: what it measures, what it does not measure, why 100% is wrong
- Building a test runner from scratch: the `describe`, `it`, `expect` API
- The testing pyramid: why you want many unit tests and few E2E tests
- The connection to the PDM system: every lesson in the PDM project has a
  definition of done — these tests are what verify it

**Builds on:** E1  
**Unlocks:** Confident refactoring of anything, the ability to review agent output

---

### E3 — Observability: Build a Structured Logging and Metrics System
**Language:** TypeScript + Go  
**Approx. lessons:** 10  
**Teaches:**
- Structured logging: why JSON logs instead of printf strings
- Correlation IDs: tracing a request across multiple services
- Log levels: DEBUG, INFO, WARN, ERROR — what each means and when to use each
- Metrics: counters, gauges, histograms — what each measures
- The RED method: Rate, Errors, Duration — the three things every service exposes
- Distributed tracing: OpenTelemetry, spans, trace context propagation
- Alerting: what to alert on, what not to alert on, alert fatigue
- The connection to your previous system: if your agent-built ball of mud had
  structured logs and metrics, you could have debugged it. This is why observability
  is built in, not bolted on.

**Builds on:** B4, C1  
**Unlocks:** Debugging any production system, working with any cloud provider

---

### E4 — CI/CD: Build an Automated Deployment Pipeline
**Language:** YAML (GitHub Actions / GitLab CI) + Shell  
**Approx. lessons:** 10  
**Teaches:**
- What continuous integration means: every commit triggers a build and tests
- What continuous delivery means: every passing build is deployable
- Containerisation: what Docker is, what a Dockerfile does, what an image is
- Docker Compose: running multiple services together locally
- Environment parity: why "it works on my machine" happens and how to prevent it
- Infrastructure as code: declaring what infrastructure you need in version control
- Secrets management: environment variables in CI, why you never hardcode secrets
- The connection to the PDM project: the PDM system needs a deployment pipeline
  to get from developer machine to a server your remote users can reach

**Builds on:** B1, E2, E3  
**Unlocks:** Deploying anything reliably, E5

---

### E5 — System Design: Architecture the Big System
**Language:** No code — diagrams, ADRs, data models  
**Approx. lessons:** 8  
**This is the capstone of the curriculum.**  
**Teaches:**
- Architecture Decision Records (ADRs): documenting why a decision was made,
  not just what it was — the thing that prevents future you from asking "why is
  this like this?"
- Capacity estimation: back-of-envelope math — how many requests per second,
  how much storage, how much bandwidth
- The build vs buy decision: when to use a managed service, when to build
- Database selection: SQL vs NoSQL vs graph vs time-series — how to choose
- API design: REST vs GraphQL vs gRPC — trade-offs, not religion
- Failure mode analysis: what happens when each component fails, how the system
  degrades gracefully
- The connection to your whole curriculum: you will recognise every concept here
  because you built it

**Builds on:** Everything  
**Unlocks:** You stop being someone who builds features and becomes someone who
designs systems

---

## Summary: What Each Project Teaches

| ID | Project | Language | Core Skill |
|---|---|---|---|
| A1 | Stack, Queue, Hash Map | Python | Data structures, Big-O |
| A2 | BST and Graph | Python | Trees, recursion, traversal |
| A3 | Virtual Machine | Python | CPU model, call stack, bytecode |
| A4 | Sorting and Searching | Python | Algorithms, complexity analysis |
| A5 | Discrete Mathematics | Python | Logic, sets, combinatorics, probability |
| B1 | Shell | C or Rust | Processes, OS, file descriptors |
| B2 | Memory Allocator | C | Heap, GC, buffer overflows |
| B3 | Cryptography | Python | Hashing, encryption, TLS, JWT |
| B4 | HTTP Server | Python or Go | TCP, HTTP, concurrency |
| B5 | Key-Value Store | Go or Rust | Caching, persistence, concurrency |
| C1 | Message Queue | Go | Decoupling, event-driven architecture |
| C2 | Load Balancer | Go | Proxying, circuit breaking, rate limiting |
| C3 | Raft Consensus | Go | Distributed state, CAP, leader election |
| C4 | Database Engine | Rust | Storage, B-trees, transactions, MVCC |
| D1 | 3D Renderer | Python + TS | Linear algebra, transforms, graphics |
| D2 | Physics Engine | Python | Calculus, integration, simulation |
| D3 | Numerical Methods | Python | Floating point, root finding, linear systems |
| D4 | Statistics Library | Python | Probability, inference, regression |
| E1 | Plugin System | TypeScript | Design patterns, OCP, DI |
| E2 | Test Framework | TypeScript | Testing strategies, TDD |
| E3 | Observability System | TS + Go | Logging, metrics, tracing |
| E4 | CI/CD Pipeline | YAML + Shell | Docker, deployment, IaC |
| E5 | System Design | Diagrams | Architecture, ADRs, capacity planning |

---

## Recommended Starting Order

If you want a path rather than a menu, this order builds knowledge without gaps.
But any project can be started at any time — the lessons are self-contained.

**Tier 1 — Do these first (they unblock everything else)**
A1 → A2 → B4 → B3

**Tier 2 — Do these before the corresponding Tracks C/D/E**
A3 → A4 → A5 → D1 → D2

**Tier 3 — Systems (requires Tier 1)**
B1 → B2 → B5 → C1 → C2

**Tier 4 — Deep systems (requires Tier 3)**
C3 → C4 → E1 → E2 → E3 → E4

**Tier 5 — Capstone**
D3 → D4 → E5

---

## What Each Project Adds to the PDM System

You are not building these projects instead of the PDM system.
You are building them alongside it. Every project connects back.

| Project | What it adds to PDM |
|---|---|
| A1 | Understand every data structure in the codebase |
| B3 | The auth lesson becomes deep — you understand what the PAT validation actually does cryptographically |
| B4 | The Express API layer becomes transparent — you know what it replaced |
| C1 | The notification and audit log become a proper event pipeline |
| C2 | When PDM needs to scale, you know how to put a proxy in front of it |
| C4 | Every database decision in PDM becomes informed |
| D1 | The CAM module of the larger system is built on this |
| E1 | The PDM plugin system is built with these patterns |
| E2 | Every PDM lesson's definition of done has tests you can actually write |
| E3 | PDM becomes observable — you can debug what agents build |
| E4 | PDM has a deployment pipeline — remote users can get updates |
| E5 | The big system gets designed properly before a line of code is written |
