# Software Engineering BRD — Building, Evolving, and Operating Reliable Software Systems

## 1. Purpose

This BRD defines a rigorous, first-principles curriculum for **Software Engineering**.

Its purpose is to teach how to transform computational ideas into software systems that can be:

* specified;
* designed;
* implemented;
* tested;
* reviewed;
* deployed;
* operated;
* evolved;
* scaled;
* migrated;
* debugged;
* secured;
* maintained;
* and eventually replaced.

The curriculum assumes that the learner already has, or is acquiring in parallel, a strong **Computational Foundations** background in mathematics, algorithms, programming, computation, and basic systems concepts.

The central question of this BRD is:

> **How do we make large software systems work correctly today and continue working correctly as they change tomorrow?**

This is deliberately different from the central question of Computer Science:

> What is computation, and what can be computed?

Software engineering is primarily concerned with **change, correctness, complexity, coordination, failure, and long-term system evolution**.

---

# 2. Position in the Curriculum Family

The Software Engineering BRD is a major branch of the foundational Computational BRD.

```text
                         COMPUTATIONAL FOUNDATIONS
                         Math + CS + Algorithms
                         + Computation + Programming
                                  │
                                  ▼
                         SOFTWARE ENGINEERING
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
     Application             Systems                 AI Systems
     Engineering            Engineering             Engineering
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  ▼
                         Large-Scale Software
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
          Security             Reliability         Specialization
```

Software Engineering should **not duplicate** the Computational Foundations curriculum.

For example:

* vectors belong primarily to Foundations;
* asymptotic complexity belongs primarily to Foundations;
* graph algorithms belong primarily to Foundations;
* probability fundamentals belong primarily to Foundations;
* programming-language fundamentals belong primarily to Foundations.

Software Engineering may **use those concepts**, but its job is to teach how they affect the engineering of real systems.

---

# 3. Core Learning Objective

By the end of this BRD, the learner should be able to approach a large software problem and reason through the entire lifecycle:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

The learner should understand not merely **how to write code**, but how to construct and maintain a system whose behavior remains understandable under increasing:

* size;
* complexity;
* team count;
* traffic;
* data volume;
* dependency count;
* failure rate;
* organizational pressure;
* and rate of change.

---

# 4. Scope

The BRD covers:

1. Software engineering principles
2. Requirements engineering
3. Domain modeling
4. Specifications and contracts
5. Software architecture
6. Modularity and interfaces
7. API design
8. Implementation practices
9. Version control
10. Code review
11. Testing
12. Verification
13. Debugging
14. Profiling and performance engineering
15. Build systems
16. Dependency management
17. Package management
18. Release engineering
19. CI/CD
20. Deployment
21. Configuration management
22. Observability
23. Production operations
24. Reliability engineering
25. Incident response
26. Scalability
27. Capacity planning
28. Maintainability
29. Refactoring
30. Technical debt
31. Legacy systems
32. Database evolution
33. Data migrations
34. Backwards compatibility
35. Distributed application architecture
36. Cloud architecture
37. Engineering processes
38. Team development
39. Documentation
40. Technical decision making
41. Engineering economics
42. Large-system evolution

---

# 5. Explicit Non-Goals

This BRD should **not attempt to become the curriculum for every adjacent discipline**.

### Primarily owned by Computational Foundations

* discrete mathematics;
* calculus;
* linear algebra;
* probability fundamentals;
* algorithms;
* data structures;
* computability;
* complexity theory;
* programming fundamentals;
* formal mathematical reasoning.

### Primarily owned by AI/ML

* statistical learning theory;
* neural networks;
* deep learning;
* transformers;
* generative modeling;
* reinforcement learning;
* model training;
* representation learning.

### Primarily owned by Systems Engineering

* operating-system internals;
* networking fundamentals;
* database internals;
* compiler implementation;
* storage systems;
* distributed-systems theory;
* runtime implementation.

Software Engineering **uses these disciplines** but does not replace them.

---

# 6. Foundational Engineering Principles

The learner should repeatedly encounter a small set of principles throughout the curriculum.

### Principle 1 — Software is a changing system

Software engineering is fundamentally about managing change.

### Principle 2 — Complexity is the primary enemy

Engineering consists largely of controlling accidental and essential complexity.

### Principle 3 — Interfaces are boundaries of responsibility

Good systems make responsibilities explicit.

### Principle 4 — Correctness must be made observable

A system cannot be reliably maintained if engineers cannot determine whether it is behaving correctly.

### Principle 5 — Failure is normal

Reliable systems are designed around failure rather than assuming its absence.

### Principle 6 — Local simplicity matters

A system becomes difficult when too many components require simultaneous reasoning.

### Principle 7 — Every abstraction has a cost

Abstractions should reduce the complexity visible to their users without merely moving complexity elsewhere.

### Principle 8 — Change has a cost

Architecture should be evaluated partly by how easily the system can accommodate expected future changes.

### Principle 9 — Automation converts repeated human decisions into infrastructure

Builds, tests, deployments, migrations, and operational procedures should increasingly become reproducible processes.

### Principle 10 — Engineering is optimization under constraints

There is rarely a universally optimal design.

Engineering decisions balance:

```text
Correctness
Performance
Reliability
Security
Maintainability
Velocity
Cost
Complexity
Risk
```

---

# 7. Curriculum Architecture

Target size:

**~250 lessons**

The curriculum is organized into 18 major domains.

| Domain                                      | Approx. Lessons |
| ------------------------------------------- | --------------: |
| 1. Software Engineering Foundations         |              12 |
| 2. Requirements Engineering                 |              15 |
| 3. Specification & Contracts                |              12 |
| 4. Domain Modeling                          |              12 |
| 5. Software Design & Modularity             |              20 |
| 6. Architecture                             |              20 |
| 7. Implementation Engineering               |              12 |
| 8. Version Control & Collaboration          |              10 |
| 9. Testing & Verification                   |              24 |
| 10. Debugging & Diagnosis                   |              12 |
| 11. Performance Engineering                 |              12 |
| 12. Build & Dependency Engineering          |              12 |
| 13. Release & Deployment Engineering        |              15 |
| 14. Observability & Operations              |              15 |
| 15. Reliability & Resilience                |              18 |
| 16. Scalability & Distributed Applications  |              18 |
| 17. Maintenance, Evolution & Legacy Systems |              22 |
| 18. Engineering Organizations & Economics   |              16 |
| **Total**                                   |        **~267** |

---

# 8. Domain 1 — Software Engineering Foundations

### Objective

Establish the conceptual distinction between programming and engineering.

### Lessons

1. What Software Engineering Is
2. Programming vs Software Engineering
3. Software as a Socio-Technical System
4. Essential vs Accidental Complexity
5. Change as the Central Engineering Problem
6. Correctness, Reliability, and Maintainability
7. Abstraction as a Complexity-Management Tool
8. Separation of Concerns
9. Cohesion and Coupling
10. Local Reasoning
11. Engineering Tradeoffs
12. The Software Lifecycle

The learner should finish this domain understanding that:

> Writing code solves an immediate computational problem; software engineering manages the entire system that surrounds that code.

---

# 9. Domain 2 — Requirements Engineering

### Objective

Teach how to determine what a system is actually supposed to do.

### Topics

* stakeholders;
* requirements;
* goals;
* constraints;
* assumptions;
* functional requirements;
* non-functional requirements;
* acceptance criteria;
* ambiguity;
* requirements conflicts;
* requirements prioritization;
* traceability;
* requirement changes;
* requirements failure.

### Lessons

13. Problems vs Solutions
14. Stakeholders
15. User Goals
16. Functional Requirements
17. Non-Functional Requirements
18. Constraints
19. Assumptions
20. Acceptance Criteria
21. Ambiguous Requirements
22. Conflicting Requirements
23. Requirements Prioritization
24. Requirements Traceability
25. Requirements Validation
26. Requirements Change
27. Requirements Failure Modes

A key exercise should require the learner to transform an ambiguous business request into a precise engineering specification.

---

# 10. Domain 3 — Specification & Contracts

### Objective

Move from informal requirements toward machine-reasonable behavioral specifications.

### Topics

* preconditions;
* postconditions;
* invariants;
* contracts;
* state machines;
* algebraic properties;
* temporal behavior;
* error semantics;
* API contracts;
* compatibility contracts.

### Lessons

28. Preconditions
29. Postconditions
30. Invariants
31. Design by Contract
32. State-Based Specifications
33. State Machines
34. Behavioral Properties
35. Error Contracts
36. API Contracts
37. Compatibility Contracts
38. Contract Testing
39. Specification Refinement

This domain connects directly to the formal reasoning taught in Foundations.

---

# 11. Domain 4 — Domain Modeling

### Objective

Teach the learner to represent the problem domain before prematurely designing implementation details.

### Topics

* entities;
* value objects;
* relationships;
* state;
* identity;
* lifecycle;
* business rules;
* aggregates;
* domain boundaries;
* domain language.

### Lessons

40. Why Domain Models Matter
41. Entities
42. Value Objects
43. Identity
44. Relationships
45. State
46. Lifecycle Modeling
47. Business Rules
48. Domain Invariants
49. Aggregates
50. Bounded Contexts
51. Domain Language

---

# 12. Domain 5 — Software Design & Modularity

### Objective

Teach how to structure software so that humans can reason about it.

### Topics

* modules;
* interfaces;
* encapsulation;
* information hiding;
* dependency direction;
* cohesion;
* coupling;
* composition;
* polymorphism;
* dependency inversion;
* architectural boundaries;
* design patterns;
* anti-patterns.

### Lessons

52. What Is a Module?
53. Information Hiding
54. Encapsulation
55. Interface Design
56. Dependency
57. Dependency Direction
58. Coupling
59. Cohesion
60. Stable Dependencies
61. Dependency Inversion
62. Composition
63. Substitution
64. Polymorphism in Engineering
65. Extension Points
66. Configuration vs Code
67. Side Effects
68. State Ownership
69. Boundary Design
70. Design Patterns
71. Pattern Selection

The learner should understand **why** patterns work rather than memorizing catalogs of patterns.

---

# 13. Domain 6 — Software Architecture

### Objective

Teach system-level decomposition and architectural decision making.

### Topics

* architecture;
* architectural constraints;
* architectural styles;
* layered systems;
* modular monoliths;
* services;
* event-driven systems;
* queues;
* asynchronous architectures;
* data ownership;
* distributed boundaries;
* architecture fitness;
* architectural decisions.

### Lessons

72. What Is Architecture?
73. Architectural Drivers
74. Quality Attributes
75. Architectural Constraints
76. Architectural Boundaries
77. Layered Architecture
78. Hexagonal Architecture
79. Ports and Adapters
80. Modular Monoliths
81. Service-Oriented Architecture
82. Microservices
83. Event-Driven Architecture
84. Message-Oriented Architecture
85. Asynchronous Systems
86. Data Ownership
87. Service Boundaries
88. Architecture Decision Records
89. Architecture Tradeoffs
90. Architecture Fitness
91. Architecture Failure
92. Architecture Evolution

A central theme:

> **Do not introduce distributed complexity unless the problem justifies it.**

---

# 14. Domain 7 — Implementation Engineering

### Objective

Teach professional construction of software without turning this BRD into another programming curriculum.

### Topics

* code organization;
* readability;
* naming;
* error handling;
* state management;
* side effects;
* defensive programming;
* configuration;
* interfaces;
* code smells.

### Lessons

93. Readable Code
94. Naming
95. Function and Method Design
96. State Management
97. Error Handling
98. Failure Semantics
99. Side Effects
100. Input Validation
101. Configuration
102. Code Organization
103. Code Smells
104. Engineering Conventions

---

# 15. Domain 8 — Version Control & Collaboration

### Objective

Teach software development as a coordinated multi-person activity.

### Topics

* version control;
* commits;
* branches;
* merging;
* rebasing;
* history;
* pull requests;
* code review;
* ownership;
* collaboration;
* conflict resolution.

### Lessons

105. Why Version Control Exists
106. Versioned State
107. Commits
108. Branches
109. Merging
110. Rebasing
111. Conflict Resolution
112. Pull Requests
113. Code Review
114. Collaborative Ownership

Git is used as the primary practical vehicle, but the concepts should remain broader than one tool.

---

# 16. Domain 9 — Testing & Verification

### Objective

Build a deep understanding of how evidence of correctness is produced.

This should be one of the largest domains.

### Topics

* testing philosophy;
* unit tests;
* integration tests;
* system tests;
* end-to-end tests;
* property-based testing;
* fuzzing;
* mutation testing;
* test doubles;
* mocks;
* contract tests;
* regression testing;
* deterministic testing;
* flaky tests;
* coverage;
* verification;
* formal methods.

### Lessons

115. Why Test?
116. Testing vs Verification
117. Test Oracles
118. Unit Tests
119. Integration Tests
120. System Tests
121. End-to-End Tests
122. Test Boundaries
123. Test Doubles
124. Mocks
125. Stubs
126. Fakes
127. Contract Tests
128. Property-Based Testing
129. Generative Testing
130. Fuzz Testing
131. Mutation Testing
132. Regression Testing
133. Test Isolation
134. Determinism
135. Flaky Tests
136. Test Data
137. Test Environments
138. Coverage
139. Testing Strategy
140. Verification Strategies
141. Formal Verification

The learner should understand:

```text
Example-based testing
        ↓
Property-based testing
        ↓
Generative testing
        ↓
Model-based testing
        ↓
Formal verification
```

as increasingly different ways of producing evidence about system behavior.

---

# 17. Domain 10 — Debugging & Diagnosis

### Objective

Teach debugging as disciplined inference rather than random experimentation.

### Lessons

142. What Debugging Actually Is
143. Reproduction
144. Observations vs Hypotheses
145. Binary Search Through Failure
146. Minimal Reproduction
147. Stack Traces
148. Logging for Diagnosis
149. Debuggers
150. State Inspection
151. Heisenbugs
152. Race Conditions
153. Production Debugging

The fundamental loop:

```text
Observation
    ↓
Hypothesis
    ↓
Experiment
    ↓
Evidence
    ↓
Updated Hypothesis
    ↓
Root Cause
```

---

# 18. Domain 11 — Performance Engineering

### Objective

Teach performance as measurement-driven engineering.

### Topics

* latency;
* throughput;
* utilization;
* profiling;
* benchmarking;
* memory;
* CPU;
* I/O;
* caching;
* contention;
* tail latency.

### Lessons

154. What Performance Means
155. Latency
156. Throughput
157. Utilization
158. Benchmarking
159. Benchmark Design
160. Profiling
161. CPU Profiling
162. Memory Profiling
163. I/O Profiling
164. Contention
165. Caching

The rule:

> **Measure before optimizing.**

Performance reasoning should connect back to algorithms and systems fundamentals rather than being taught as a collection of optimization tricks.

---

# 19. Domain 12 — Build & Dependency Engineering

### Objective

Teach how source code becomes reproducible software artifacts.

### Topics

* compilation;
* builds;
* dependency graphs;
* package managers;
* lockfiles;
* reproducibility;
* hermetic builds;
* artifacts;
* build caching;
* dependency conflicts;
* supply-chain concerns.

### Lessons

166. Source to Artifact
167. Build Graphs
168. Build Systems
169. Incremental Builds
170. Reproducible Builds
171. Hermetic Builds
172. Dependency Graphs
173. Package Managers
174. Version Constraints
175. Lockfiles
176. Dependency Conflicts
177. Build Artifacts

---

# 20. Domain 13 — Release & Deployment Engineering

### Objective

Teach how software moves safely from development into production.

### Topics

* environments;
* release artifacts;
* deployment strategies;
* feature flags;
* blue/green deployment;
* canary deployment;
* rollback;
* configuration;
* infrastructure;
* CI/CD.

### Lessons

178. Development Environments
179. Staging
180. Production
181. Release Artifacts
182. Continuous Integration
183. Continuous Delivery
184. Continuous Deployment
185. Deployment Pipelines
186. Feature Flags
187. Rolling Deployments
188. Blue-Green Deployment
189. Canary Deployment
190. Rollbacks
191. Configuration Management
192. Infrastructure as Code

---

# 21. Domain 14 — Observability & Operations

### Objective

Teach how engineers understand software after deployment.

### Topics

* logs;
* metrics;
* traces;
* telemetry;
* dashboards;
* alerting;
* operational signals;
* service-level indicators;
* service-level objectives.

### Lessons

193. Why Observability Exists
194. Logs
195. Structured Logging
196. Metrics
197. Histograms
198. Traces
199. Distributed Tracing
200. Correlation
201. Telemetry
202. Dashboards
203. Alerting
204. Service-Level Indicators
205. Service-Level Objectives
206. Operational Debugging
207. Observability Architecture

---

# 22. Domain 15 — Reliability & Resilience

### Objective

Teach the engineering of systems that continue functioning despite failure.

### Topics

* reliability;
* availability;
* failure modes;
* redundancy;
* retries;
* timeouts;
* circuit breakers;
* bulkheads;
* graceful degradation;
* backpressure;
* recovery;
* disaster recovery;
* incident response.

### Lessons

208. Reliability
209. Availability
210. Failure Models
211. Failure Domains
212. Redundancy
213. Timeouts
214. Retries
215. Exponential Backoff
216. Circuit Breakers
217. Bulkheads
218. Backpressure
219. Graceful Degradation
220. Idempotency
221. Recovery
222. Disaster Recovery
223. Incident Response
224. Postmortems
225. Reliability Tradeoffs

The learner should internalize:

> A reliable system is not one that never fails. It is one whose failures are constrained, observable, recoverable, and understood.

---

# 23. Domain 16 — Scalability & Distributed Applications

### Objective

Teach application-level scalability without replacing the dedicated Systems Engineering curriculum.

### Topics

* horizontal scaling;
* vertical scaling;
* load balancing;
* statelessness;
* caching;
* queues;
* asynchronous work;
* partitioning;
* consistency;
* concurrency;
* distributed failure;
* rate limiting;
* capacity.

### Lessons

226. What Scalability Means
227. Vertical Scaling
228. Horizontal Scaling
229. Stateless Services
230. Load Balancing
231. Caching
232. Queues
233. Background Processing
234. Partitioning
235. Concurrency
236. Distributed Failure
237. Consistency at the Application Layer
238. Rate Limiting
239. Capacity Planning
240. Bottleneck Analysis
241. Scaling Architectures
242. Scaling Failure

---

# 24. Domain 17 — Maintenance, Evolution & Legacy Systems

### Objective

This is one of the defining domains of the BRD.

Most software engineering education overemphasizes greenfield development. Real engineering requires understanding systems that already exist.

### Topics

* maintenance;
* technical debt;
* refactoring;
* legacy systems;
* migrations;
* schema evolution;
* compatibility;
* deprecation;
* replacement;
* strangler patterns;
* backwards compatibility;
* organizational constraints.

### Lessons

243. Why Software Decays
244. Technical Debt
245. Refactoring
246. Safe Refactoring
247. Large-Scale Refactoring
248. Legacy Systems
249. Working Without Full Understanding
250. Characterization Tests
251. Legacy Dependencies
252. Database Evolution
253. Schema Migration
254. Zero-Downtime Migration
255. Data Backfills
256. API Evolution
257. Backwards Compatibility
258. Deprecation
259. Versioning
260. Compatibility Windows
261. Strangler Architecture
262. Incremental Replacement
263. System Migration
264. Migration Failure

The learner should be able to take a system they did not design and improve it **without destroying the behavior people depend on**.

---

# 25. Domain 18 — Engineering Organizations & Economics

### Objective

Teach the human and economic dimensions of engineering.

Software engineering is not performed by isolated programmers.

### Topics

* teams;
* ownership;
* communication;
* technical leadership;
* documentation;
* estimation;
* prioritization;
* decision making;
* organizational boundaries;
* incentives;
* engineering economics;
* opportunity cost;
* build vs buy;
* staffing;
* technical strategy.

### Lessons

265. Software Teams
266. Team Boundaries
267. Ownership
268. Communication
269. Documentation
270. Technical Decision Making
271. Decision Records
272. Estimation
273. Uncertainty
274. Prioritization
275. Opportunity Cost
276. Build vs Buy
277. Engineering Economics
278. Technical Strategy
279. Organizational Architecture
280. Engineering Leadership

This completes the curriculum at approximately **280 lessons**.

---

# 26. Cross-Cutting Competencies

The curriculum should not teach each domain in isolation.

The learner should repeatedly practice five capabilities.

## A. Decomposition

Take:

```text
Large problem
```

and derive:

```text
Responsibilities
→ Components
→ Interfaces
→ Contracts
→ Dependencies
```

## B. Verification

Take:

```text
Claim
```

and ask:

```text
How do we know?
```

Then select appropriate evidence:

```text
Test
Measurement
Invariant
Property
Monitoring
Formal proof
```

## C. Failure Analysis

Take:

```text
System failure
```

and reason:

```text
What failed?
Why did it fail?
Why was it possible?
Why wasn't it detected?
Why wasn't it contained?
How do we prevent recurrence?
```

## D. Evolution

Take:

```text
Existing system
```

and determine:

```text
What can change safely?
What must remain compatible?
What should be migrated?
What should be deprecated?
What evidence is required?
```

## E. Tradeoff Analysis

Every significant design should be evaluated across:

```text
Correctness
Complexity
Performance
Reliability
Security
Maintainability
Cost
Development speed
Operational burden
Future change
```

---

# 27. Practical Project Sequence

The BRD should not be purely theoretical.

Projects should progressively increase the scale of the engineering problem.

### Project 1 — Small Library

Build a well-specified reusable library.

Focus:

* contracts;
* modularity;
* testing;
* documentation;
* version control.

### Project 2 — Production Application

Build a complete application.

Focus:

* requirements;
* architecture;
* APIs;
* persistence;
* testing;
* deployment.

### Project 3 — CI/CD System

Create an automated pipeline.

Focus:

* builds;
* tests;
* artifacts;
* environments;
* deployment;
* rollback.

### Project 4 — Observable Service

Operate a service under load.

Focus:

* metrics;
* logs;
* traces;
* performance;
* alerts.

### Project 5 — Reliable Distributed Application

Introduce:

* concurrency;
* queues;
* retries;
* timeouts;
* idempotency;
* failure recovery.

### Project 6 — Legacy System

Give the learner an intentionally unfamiliar codebase.

Tasks:

* understand it;
* characterize behavior;
* add tests;
* identify architectural problems;
* refactor safely.

### Project 7 — Large Migration

Perform a backwards-compatible migration involving:

* APIs;
* data;
* schemas;
* deployments;
* old and new implementations.

### Capstone — Evolving Production System

The final project should not simply be:

> "Build an application."

Instead:

> **Build, operate, break, diagnose, scale, migrate, and evolve an application over time.**

The system should deliberately undergo changing requirements and increasing load.

---

# 28. Dependency Structure

The curriculum should have explicit prerequisites.

```text
Computational Foundations
          │
          ├──────────────► Software Engineering Foundations
          │                         │
          │                         ▼
          │                  Requirements
          │                         │
          │                         ▼
          │                  Specifications
          │                         │
          │                         ▼
          │                     Design
          │                         │
          │                         ▼
          │                    Architecture
          │                         │
          ├─────────────────────────┤
          │                         │
          ▼                         ▼
       Systems                Testing/Verification
          │                         │
          └──────────────┬──────────┘
                         ▼
                  Production Systems
                         │
             ┌───────────┼────────────┐
             ▼           ▼            ▼
         Reliability  Scalability  Operations
             │           │            │
             └───────────┼────────────┘
                         ▼
                  Evolution/Migration
                         │
                         ▼
                Large-Scale Engineering
```

---

# 29. Relationship to the Other BRDs

## Computational Foundations → Software Engineering

Provides:

* algorithms;
* complexity;
* programming;
* abstraction;
* mathematical reasoning;
* computational models.

Software Engineering turns those capabilities into **maintainable systems**.

## Computational Foundations → AI/ML

Provides:

* linear algebra;
* probability;
* statistics;
* optimization;
* algorithms;
* numerical computation.

AI/ML turns those capabilities into **learning systems**.

## Computational Foundations → Systems Engineering

Provides:

* computation;
* data structures;
* algorithms;
* mathematical models;
* programming.

Systems Engineering turns them into **machines and infrastructure that execute computation at scale**.

## Software Engineering → AI/ML

Provides engineering practices needed to turn models into reliable products:

```text
Model
→ Training pipeline
→ Evaluation
→ Deployment
→ Monitoring
→ Versioning
→ Serving
→ Evolution
```

## Software Engineering → Systems

Provides engineering practices for building systems that humans can evolve and operate.

---

# 30. What Makes This BRD Different From a Typical Software Engineering Curriculum?

A conventional curriculum often becomes:

```text
Learn language
→ learn framework
→ learn Git
→ learn testing
→ learn Agile
→ build projects
```

This BRD instead follows:

```text
Problem
→ specification
→ model
→ abstraction
→ architecture
→ implementation
→ evidence
→ deployment
→ observation
→ failure
→ recovery
→ change
→ evolution
```

The objective is not to produce familiarity with a particular technology stack.

The objective is to produce an engineer who can encounter an unfamiliar stack and still reason correctly.

---

# 31. Technology-Neutral Core

Tools should be used extensively, but they should not define the intellectual structure.

For example:

```text
Version control
        ↓
Git

Containerization
        ↓
Docker/OCI

CI/CD
        ↓
GitHub Actions / GitLab CI / Jenkins / etc.

Cloud infrastructure
        ↓
AWS / Azure / GCP / etc.

Observability
        ↓
OpenTelemetry + ecosystem

Databases
        ↓
PostgreSQL / MySQL / etc.
```

The learner should understand the **underlying engineering concept first** and then learn multiple implementations where useful.

This prevents:

> "I know Kubernetes"

from being mistaken for:

> "I understand deployment and distributed systems."

---

# 32. Assessment Philosophy

Assessment should increasingly move away from recall.

### Level 1 — Explain

Can the learner explain:

> Why is this design problematic?

### Level 2 — Implement

Can the learner build:

> A correct implementation?

### Level 3 — Diagnose

Can the learner determine:

> Why did it fail?

### Level 4 — Design

Can the learner construct:

> A system satisfying these constraints?

### Level 5 — Evaluate

Can the learner compare:

> Architecture A vs Architecture B?

### Level 6 — Evolve

Can the learner modify:

> A functioning system without breaking existing behavior?

### Level 7 — Operate

Can the learner:

> Keep it working under real-world failure?

### Level 8 — Lead

Can the learner:

> Make and communicate engineering decisions under uncertainty?

---

# 33. Final Competency

A learner completing this BRD should be able to receive a problem such as:

> "We need a service that handles millions of users, changes frequently, must remain available during deployments, has existing clients that cannot immediately upgrade, and will eventually need to migrate to a new architecture."

and systematically reason through:

```text
Requirements
    ↓
Domain model
    ↓
Contracts
    ↓
Architecture
    ↓
Data model
    ↓
Interfaces
    ↓
Implementation
    ↓
Testing strategy
    ↓
Build system
    ↓
Deployment
    ↓
Observability
    ↓
Failure handling
    ↓
Capacity
    ↓
Migration
    ↓
Compatibility
    ↓
Operations
    ↓
Evolution
```

That is the intended endpoint.

---

# 34. The Deeper Principle

The Software Engineering BRD should ultimately teach one capability above all others:

> **The ability to control complexity as software changes.**

The progression is therefore:

```text
Code
  ↓
Modules
  ↓
Components
  ↓
Systems
  ↓
Distributed Systems
  ↓
Organizations
  ↓
Evolving Socio-Technical Systems
```

At every level, the same questions recur:

```text
What does this thing promise?
What does it depend on?
How do we know it is correct?
How can it fail?
How do we observe the failure?
How do we change it safely?
What does the change cost?
What new complexity does the change introduce?
```

That makes Software Engineering a true branch of the larger curriculum rather than a collection of programming practices.

The resulting curriculum family becomes:

```text
                    COMPUTATIONAL FOUNDATIONS
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   SOFTWARE ENGINEERING     AI / ML        SYSTEMS ENGINEERING
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
          SECURITY         GRAPHICS         SPECIALIZED
          & CRYPTO         & SIMULATION      DOMAINS
```

**Computational Foundations teaches what computation is.**

**Software Engineering teaches how to make computational artifacts survive change.**

**The specialized BRDs then teach how to apply those foundations to particular classes of problems.**
