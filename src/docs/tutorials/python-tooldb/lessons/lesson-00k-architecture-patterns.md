# Python Tool Database — LAB 00k — Architecture Patterns: The Map of All the Options

**Prerequisites:** Labs 00–00j. You understand Hexagonal Architecture (Lab 00f), DDD (Lab 00h), and design patterns (Lab 00j).

**What this lab adds:**
- Every major software architecture pattern, compared against each other
- The specific reasons Hexagonal Architecture was chosen for this project
- An Architecture Decision Record (ADR) document — the formal record of the architecture choice
- A vocabulary for discussing architecture with other developers

**Time:** 45–60 minutes (reading and analysis — no new code)

---

> **Quick Check — try to answer before reading:**
>
> 1. What is the difference between a "design pattern" (Lab 00j) and an "architecture pattern"? Are they the same thing at different scales?
> 2. Layered Architecture ("presentation → business → data") is taught in most textbooks. Why might a project outgrow it?
> 3. You are building a desktop app for one shop. Should you use Microservices? Why or why not?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

This lesson produces:

1. An **Architecture Decision Record** (`ADR-001-architecture-choice.md`) in the project root — a formal one-page record of the architecture choice, the alternatives considered, and the reasons
2. A clear understanding of nine architecture patterns and when each is appropriate

---

## Design Pattern vs. Architecture Pattern

Before the comparison, a clarification:

**Design pattern** (Lab 00j): A solution to a recurring problem within a codebase — how one class relates to another. Scope: a few classes, one subsystem. Examples: Repository, Adapter, Observer.

**Architecture pattern**: A solution to how the entire system is organized — where responsibility lives and how large sections communicate. Scope: the whole system. Examples: Layered, Hexagonal, CQRS, Microservices.

They are not the same at different scales — they address different concerns. You can use the Repository design pattern inside any architecture pattern. The architecture pattern determines how the whole system is structured; the design pattern determines how individual pieces are shaped.

---

## The Nine Patterns

---

### Big Ball of Mud

**What it is:** No architecture. Functions call each other freely. No layers, no enforced boundaries, no rules about who can call what.

**Why it exists:** It is what happens when development starts with no plan. Every feature is added wherever it fits at the moment. Works perfectly for a 100-line script.

**The problem:** As the codebase grows, everything depends on everything. Changing one function requires understanding dozens of others that might call it. Testing requires the whole system to be running. New developers cannot understand the system without reading all of it.

**The diagram:**

```
function A ←→ function B ←→ function C
    ↕                          ↕
function D ←→ function E ←→ function F
(everything calls everything)
```

**When it appears:** Most software starts here accidentally — "I'll clean it up later." Many systems never leave. The Big Ball of Mud is the default state of software that grows without architectural discipline.

**For this project:** Unacceptable. The project explicitly has multiple adapters (SQLite, future PostgreSQL, PySide6, future React). Without architecture, swapping any adapter requires changing everything that touches it.

---

### Layered Architecture (N-Tier)

**What it is:** The system is divided into horizontal layers. Each layer only communicates with the layer directly below it:

```
Presentation Layer (UI — forms, buttons, tables)
        ↓
Business Logic Layer (services, validators, calculations)
        ↓
Data Access Layer (repositories, SQL queries)
        ↓
Database (SQLite, PostgreSQL)
```

**Why it works:** Simple to understand. Every developer knows where things go. Widely taught. A good first step beyond Big Ball of Mud.

**The weakness:** Layers still depend on each other concretely. The business logic layer imports from the data access layer. If the data access layer changes (SQLite → PostgreSQL), the business logic layer must be updated. The dependency arrow points down — but it is still a direct import, not an abstraction.

**Also:** Presentation layers tend to accumulate logic. "Just put it in the controller" is how Fat Controller anti-patterns form — controllers that contain validation, business logic, and SQL queries all mixed together.

**For this project:** A reasonable starting point but insufficient for the requirement that the domain have zero infrastructure imports.

---

### MVC — Model, View, Controller

**What it is:** Designed for GUIs and web applications. Three roles:

- **Model**: owns the data and the business rules
- **View**: renders what the user sees
- **Controller**: receives input from the user, updates the Model, tells the View to refresh

```
User → Controller → Model
           ↓            ↓
         View    ←  (changes)
```

**Why it works:** Separates data from display from input handling. The View can change without touching the Model. The Model can change without touching the View (in principle).

**The problem in practice:** Controllers grow. If the Controller is the only thing that touches both Model and View, all application logic ends up in the Controller. "Fat Controller, anemic Model" — the Controller does everything; the Model is just data.

**Where it appears in this project:** Qt's `QAbstractTableModel` is a genuine MVC implementation at the UI layer. The model owns the tool data, the `QTableView` renders it, and Qt's signal/slot mechanism acts as the controller. MVC is the right architecture for the UI layer — it is not sufficient as the whole-system architecture.

---

### MVP — Model, View, Presenter

**What it is:** A stricter variation of MVC. The View is completely passive — it only displays what the Presenter tells it and forwards all input to the Presenter without processing it.

```
User → View (passive) → Presenter → Model
           ↑                ↓
        (updates)      (reads model)
```

**The key difference from MVC:** In MVP, the View has no logic. It is a "dumb screen." The Presenter has all logic. This makes the Presenter testable without a real screen — you can inject a test View that records what the Presenter asked it to display.

**For this project:** MVP is the architecture of the PySide6 UI layer (Block 3). Each form is a passive View; each Presenter handles its logic. This is what makes the UI testable without running a window.

---

### MVVM — Model, View, ViewModel

**What it is:** The architecture behind React, Angular, Vue, and WPF. The ViewModel holds the state of the UI as plain data. The View binds to the ViewModel automatically — when the ViewModel changes, the View updates without explicit code.

```
Model (domain) → ViewModel (UI state as data) ↔ View (renders ViewModel)
```

**The key difference from MVP:** In MVVM, the binding is automatic (React re-renders when state changes; WPF binds controls to properties). In MVP, the Presenter explicitly tells the View what to display.

**For this project:** When the React frontend is built (Block 11), this is what you will be doing. Component state is the ViewModel. JSX is the View. The React component re-renders automatically when state changes.

---

### Hexagonal Architecture (Ports and Adapters)

**What it is:** The domain is at the center with zero external dependencies. Ports (abstract interfaces) define what the domain needs from the outside. Adapters implement ports for specific technologies.

```
      CLI ─── [incoming port] ─── ToolService ─── [outgoing port] ─── SQLite
   PySide6 ─── [incoming port] ─── (domain)   ─── [outgoing port] ─── FakeRepo (tests)
  REST API ─── [incoming port] ───            ─── [outgoing port] ─── PostgreSQL (future)
```

**Why it works:** The domain can be tested in isolation — the test suite uses `FakeToolRepository` and never touches a database. External systems can be swapped by replacing an adapter. The domain code is stable.

**The tradeoff:** More files and more indirection. Three places to look when something breaks (domain, port, adapter) instead of one. The cognitive overhead is real. Worth it for systems that will live for years and have multiple adapters.

**For this project:** The right choice. Details follow.

---

### Clean Architecture (Robert Martin)

**What it is:** A more prescriptive version of Hexagonal, with four explicit concentric rings:

```
Outer ring:   Frameworks & Drivers (Qt, SQLAlchemy, Flask, React)
              Interface Adapters (controllers, presenters, repositories)
              Use Cases (application services — ToolService, ImportService)
Inner ring:   Entities (Tool, Assembly, Job — pure domain, no imports)
```

**The one strict rule:** The Dependency Rule — source code dependencies must point inward only. An entity may not import from a use case. A use case may not import from an adapter. Nothing in an inner ring knows about an outer ring.

**Why it differs from Hexagonal:** More ceremony. More explicit layer definitions. Better for large teams where different rings are owned by different teams. The principles are identical to Hexagonal; the structure is more formal.

**For this project:** The same goals as Hexagonal, with more structure than needed for one developer. Worth knowing because it names the rings explicitly.

---

### Event-Driven Architecture

**What it is:** Components communicate by publishing and subscribing to events rather than calling each other directly.

```
ToolService.create_tool() → publishes "ToolCreated" event
→ AuditLogger subscribes → writes log entry
→ SearchIndex subscribes → updates search
→ UINotifier subscribes → refreshes table
```

**Why it works:** Very loose coupling. Any new subscriber can be added without changing the publisher. The system is extensible without modification (Open/Closed Principle at the architecture level).

**The problem:** Hard to debug. Following the flow of a request requires tracing through subscriptions, not just reading the call stack. "Who handles this event?" is not obvious from reading any single file.

**For this project:** The Observer pattern (Qt signals) gives us event-driven behavior at the UI layer. Full event-driven architecture would add unnecessary complexity for a desktop tool database.

---

### CQRS — Command Query Responsibility Segregation

**What it is:** Reads and writes are handled by completely separate code paths.

```
Command (writes): CreateTool → ToolService → ToolRepository (write model)
Query (reads):    GetAllTools → ToolQueryService → ToolReadModel (denormalized view)
```

**Why it works:** The read model can be optimized for display (pre-joined, sorted, filtered) without making the write model messy. Scaling reads independently of writes.

**The cost:** Two codepaths for the same data. Eventual consistency (the read model may be slightly behind the write model). Significant complexity.

**For this project:** Interesting academically. Premature complexity for a desktop manufacturing tool. Worth knowing for when this concept comes up in job discussions.

---

### Microservices

**What it is:** Each part of the system is a separate deployed service with its own database, its own technology stack, and its own team.

**Why it works:** Independent scaling. Independent deployment. Teams can move autonomously without coordinating.

**The cost:** Network calls instead of function calls. Distributed transaction management. Operational complexity (service discovery, load balancers, orchestration, monitoring). Requires significant infrastructure investment.

**For this project:** Wrong tool. This is a desktop application used by one shop. One process, one database, one deployment. Microservices would add years of infrastructure work for no user-facing benefit.

**The principle:** Use the simplest architecture that meets the actual requirements. For a tool database on a shop floor, that is a well-structured monolith.

---

## Why Hexagonal for This Project

The specific reasons for this specific project:

**Requirement 1: Swap the UI (PySide6 today, React tomorrow)**
Hexagonal makes UI swappability an architectural property. The domain (`ToolService`) accepts calls from the PySide6 incoming adapter today. In Block 11, it accepts calls from the FastAPI incoming adapter. `ToolService` does not change. This is only possible if the domain has zero UI imports.

**Requirement 2: Fast, isolated tests with no database**
The domain test suite uses `FakeToolRepository` (a Python list). Tests run in milliseconds without any database setup. This is only possible if `ToolService` depends on `ToolRepositoryPort` (abstract), not `sqlite3` (concrete).

**Requirement 3: Mastercam integration without polluting the domain**
Mastercam's `.tooldb` files have a specific schema that does not match the domain's model. The `MastercamAdapter` translates. The domain never sees Mastercam's column names. This is only possible if the integration code is an adapter, not embedded in the service.

**Requirement 4: Potential database migration (SQLite → PostgreSQL)**
Write a new `PostgreSQLToolRepository` that implements `ToolRepositoryPort`. Replace the adapter injection in the startup code. `ToolService` does not change.

**Why not the others:**
- Layered: Business logic layer still imports from data access layer. Cannot have the zero-external-import invariant.
- MVC/MVP: Right for the UI layer, not sufficient for the whole system.
- MVVM: The right pattern for the React UI, not for the whole system.
- Event-Driven: Qt signals for UI events, yes. Full event-driven for business logic, overkill.
- CQRS: Worth knowing; not needed at this scale.
- Microservices: Categorically wrong for a desktop tool database.

---

## The Architecture Decision Record

Create `ADR-001-architecture-choice.md` in the `python-tooldb/` root:

```markdown
# ADR-001 — Architecture Choice: Hexagonal Architecture (Ports and Adapters)

**Status:** Accepted

**Date:** [today's date]

## Context

Building a tool database desktop application that must:
- Work with PySide6 UI today and React UI in the future
- Integrate with Mastercam .tooldb files and XML operation sheets
- Run a fast test suite that does not require a running database
- Potentially migrate from SQLite to PostgreSQL

## Decision

Use Hexagonal Architecture (Ports and Adapters).

The domain (`tooldb/service.py`, `tooldb/tool.py`, `tooldb/sfm.py`) has zero imports 
from any external technology. It depends only on abstract ports (`tooldb/ports.py`).

Adapters implement ports for specific technologies:
- `FakeToolRepository` — test adapter (Python list)
- `SQLiteToolRepository` — production adapter (Block 4)
- `MastercamAdapter` — import adapter (Block 7)
- PySide6 forms — incoming UI adapter (Block 3)
- FastAPI routes — incoming REST adapter (Block 11)

## Alternatives Considered

- **Layered Architecture**: simpler, but business layer would import from data layer directly.
  Cannot achieve zero-infrastructure-imports in the domain. Rejected.
- **Clean Architecture**: identical goals, more ceremonial structure. Appropriate for larger 
  teams; overhead not justified here. Would reconsider if team grows beyond 3 developers.
- **Microservices**: wrong tool for a desktop single-user or small-team application.
- **Big Ball of Mud**: default state without architecture. Explicitly rejected.

## Consequences

- More files than a Layered approach: each external technology requires a port + adapter pair
- Tests are fast and completely isolated from infrastructure
- New external integrations are added as adapters without touching the domain
- The domain is portable: could be extracted and used from a command-line tool, 
  a REST API, a desktop UI, or a test suite without changing a line of domain code
```

### SAVE AND TRY

```powershell
pytest tests/
```

All tests pass. The ADR is documentation, not code.

---

## 🎯 Challenge: Map the Architecture to the Files

**You know:** All nine architecture patterns and why Hexagonal was chosen.

**Task:** For each file currently in `tooldb/`, state which layer of the Hexagonal Architecture it belongs to (domain, port, or adapter). Then identify which pattern (from Lab 00j) each file implements.

| File | Hexagonal Layer | Pattern |
|---|---|---|
| `tooldb/tool.py` | ? | ? |
| `tooldb/ports.py` | ? | ? |
| `tooldb/service.py` | ? | ? |
| `tooldb/fakes.py` | ? | ? |
| `tooldb/validation.py` | ? | ? |
| `tooldb/sfm.py` | ? | ? |
| `tooldb/filters.py` | ? | ? |

---

<details>
<summary>▶ Show Solution</summary>

| File | Hexagonal Layer | Pattern |
|---|---|---|
| `tooldb/tool.py` | Domain (entity) | Value Object / Entity (DDD) |
| `tooldb/ports.py` | Domain (port definition) | Repository port |
| `tooldb/service.py` | Domain (application service) | Facade over domain subsystem |
| `tooldb/fakes.py` | Adapter (test adapter) | Repository (test implementation) |
| `tooldb/validation.py` | Domain (domain service, borderline) | Could evolve into Strategy |
| `tooldb/sfm.py` | Domain (domain service) | None — pure functions |
| `tooldb/filters.py` | Domain (domain utility) | None — pure functions |

**Key observation:** Everything in `tooldb/` is domain or port-definition level. No file in the current codebase imports `sqlite3`, `PySide6`, `Flask`, or any other external technology. This is the architectural invariant working correctly.

The test folder contains `FakeToolRepository` (adapter) because it is test-only infrastructure — it does not belong in the production `tooldb/` package.

**Key insight:** The architectural boundaries are visible in the import statements. If a file in `tooldb/` ever imports `sqlite3`, the hexagonal invariant is violated and should be caught by the structural test from Lab 00f's challenge.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `ADR-001-architecture-choice.md` exists | `ls` in `python-tooldb/` — file present |
| ADR includes: decision, alternatives, consequences | Open the file — all three sections present |
| All tests pass | Run `pytest tests/` — all green |
| No `tooldb/*.py` file imports `sqlite3` or `PySide6` | Open each file — no external tech imports in domain code |
| You can name all 9 patterns in 30 seconds | List them without reading |

---

## Quick Check Answers

**1. Design pattern vs. architecture pattern — the same at different scales?**

Related, but not the same. Design patterns solve recurring problems within a codebase at the class or subsystem level: how Repository decouples storage from business logic, how Observer decouples event publishers from subscribers. Architecture patterns solve how the entire system is organized: where responsibility lives, how large sections communicate, what the enforced boundaries are. You use design patterns inside an architecture pattern — Repository is a design pattern that appears inside Hexagonal Architecture's outgoing port.

**2. Why might a project outgrow Layered Architecture?**

Because layers still depend on each other concretely. The business layer imports from the data access layer. When the data access layer changes (SQLite → PostgreSQL), you must update every place in the business layer that imports it. The coupling is less chaotic than Big Ball of Mud, but it still exists. For projects with multiple external technologies or a requirement to swap components independently, Hexagonal's abstract ports eliminate this coupling. Layered works well until swappability matters.

**3. Should a desktop app for one shop use Microservices?**

No. Microservices add network calls (slower, more failure modes), distributed transactions (complex correctness problems), service discovery infrastructure, independent deployments, and significant monitoring overhead. All of these costs exist to enable independent scaling and independent team deployments — neither of which is a requirement for a shop-floor desktop tool. The principle: use the simplest architecture that meets the actual requirements. A well-structured monolith with Hexagonal Architecture meets every requirement of this project without the infrastructure tax of Microservices.
