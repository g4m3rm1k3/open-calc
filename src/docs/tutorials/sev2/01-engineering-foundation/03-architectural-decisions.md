# Tutorial 3: Architectural Decisions

## Introduction

Architectural decisions define the **shape of your system**. They determine:
- What technologies you use
- How components are organized
- What patterns you apply
- What trade-offs you accept

This tutorial produces the **Architectural Decision Records (ADRs)** for PartFlow—every major decision documented with rationale.

---

## Part 1: The ADRs for PartFlow

### ADR-001: Programming Language - Python

```markdown
# ADR-001: Use Python for Backend Development

## Status
Accepted

## Context
We need to choose a programming language for the PartFlow backend.

Requirements:
- Process CAM/G-code files (text parsing)
- Manage manufacturing data (CRUD operations)
- Serve web API
- Developed incrementally, single developer initially
- Teaching/learning context—clarity valued

## Decision
Use **Python 3.11+** for all backend development.

## Rationale
1. **Readability**: Clean syntax supports learning and maintenance
2. **Data processing**: Strong standard library for file/text processing
3. **Web ecosystem**: Flask provides simple, explicit web framework
4. **Manufacturing fit**: Domain commonly uses Python for tooling
5. **Developer familiarity**: Primary developer proficient in Python

## Alternatives Considered

### TypeScript/Node.js
- Pros: Strong typing, npm ecosystem, full-stack JS
- Cons: More complex tooling, async-by-default adds cognitive load
- Rejected: Clarity > ecosystem size for this project

### Go
- Pros: Fast, simple deployment, strong typing
- Cons: More verbose, smaller web ecosystem
- Rejected: Development speed more important than runtime speed

### Rust
- Pros: Memory safety, performance
- Cons: Steep learning curve, slower iteration
- Rejected: Premature optimization for our scale

## Consequences
### Positive
- Faster development
- Easier code review and onboarding
- Rich library support for parsing

### Negative
- Slower than compiled languages (acceptable)
- GIL limits parallelism (acceptable for our workload)
- Optional typing requires discipline (will enforce via tooling)

## When to Revisit
- Performance profiling shows Python is bottleneck
- Need shared code with TypeScript frontend
- Team composition changes significantly
```

---

### ADR-002: Database - SQLite

```markdown
# ADR-002: Use SQLite for Development and Initial Deployment

## Status
Accepted

## Context
We need persistent storage for manufacturing data.

Requirements:
- Store Parts, Machines, Programs, etc.
- Support relationships (foreign keys)
- Support transactions (data integrity)
- Minimal setup for development
- Eventually deploy to production

## Decision
Use **SQLite** for initial development, with planned migration path to PostgreSQL.

## Rationale
1. **Zero configuration**: No server installation
2. **File-based**: Single file, easy to share/backup
3. **Full SQL**: Supports joins, constraints, transactions
4. **Standard interface**: Same Python DB-API
5. **Good enough**: Adequate for single-user/low-concurrency

## Alternatives Considered

### PostgreSQL
- Pros: Production-grade, full features, excellent concurrency
- Cons: Requires server setup, more complex
- Rejected: Overkill for development phase

### JSON Files
- Pros: Simplest possible
- Cons: No queries, no constraints, no transactions
- Rejected: Manufacturing data needs relational integrity

### MongoDB
- Pros: Flexible schema
- Cons: No foreign keys, harder to enforce invariants
- Rejected: Relational model fits domain better

## Consequences
### Positive
- Instant setup
- No infrastructure dependencies
- Easy testing (in-memory option)

### Negative
- Limited concurrent writes (single writer lock)
- No advanced features (JSONB, full-text)
- Migration needed for production

## When to Revisit
- Deploying to production with multiple users
- Need concurrent write performance
- Need PostgreSQL-specific features
```

---

### ADR-003: Web Framework - Flask

```markdown
# ADR-003: Use Flask for Web Layer

## Status
Accepted

## Context
We need to serve HTTP APIs and render HTML pages.

Requirements:
- REST API endpoints
- HTML template rendering
- Form handling
- Session management
- Simple, explicit, understandable

## Decision
Use **Flask** (with Jinja2 for templates).

## Rationale
1. **Explicit**: No magic—everything is visible
2. **Minimal**: Add what you need, nothing extra
3. **Well-documented**: Extensive docs and community
4. **Teaching-friendly**: Easy to explain each part
5. **Sufficient**: Handles our requirements without overhead

## Alternatives Considered

### Django
- Pros: Batteries included, admin panel, ORM
- Cons: Heavy, opinionated, hides mechanics
- Rejected: Want to build and understand each piece

### FastAPI
- Pros: Modern, async, automatic OpenAPI
- Cons: Async adds complexity, more magic with Pydantic
- Rejected: Sync is simpler for learning; can migrate later

### Express (Node.js)
- Pros: Minimal, flexible
- Cons: Different language, ecosystem change
- Rejected: Staying with Python ecosystem

## Consequences
### Positive
- Every route is explicit
- Easy to trace request handling
- Full control over behavior

### Negative
- Must build what Django provides free
- More boilerplate for common patterns
- No built-in ORM (using raw SQL intentionally)

## When to Revisit
- Need async performance (thousands of concurrent users)
- Want to leverage FastAPI's automatic docs
- Team prefers more structure
```

---

### ADR-004: Architecture - Layered/Clean

```markdown
# ADR-004: Use Layered Architecture with Dependency Inversion

## Status
Accepted

## Context
We need an architecture that:
- Separates concerns
- Makes testing easy
- Makes replacement possible
- Scales with complexity
- Is understandable

## Decision
Use **layered architecture** with these layers:
1. **Domain Layer**: Entities, value objects, business rules
2. **Repository Layer**: Data access abstraction
3. **Service Layer**: Use case orchestration
4. **Web Layer**: HTTP handling, templates

Dependencies point **inward** (web → service → domain).

## Rationale
1. **Separation**: Each layer has one job
2. **Testability**: Domain can be tested without database
3. **Flexibility**: Can swap database without touching domain
4. **Understandability**: Clear request flow
5. **Industry standard**: Well-documented pattern

## Diagram
```
┌─────────────────────────────────────────┐
│            Web Layer (Edge)             │
│   Routes, Templates, HTTP handling      │
└─────────────────┬───────────────────────┘
                  │ depends on
                  ▼
┌─────────────────────────────────────────┐
│          Service Layer                  │
│   Use cases, orchestration              │
└─────────────────┬───────────────────────┘
                  │ depends on
                  ▼
┌─────────────────────────────────────────┐
│     Domain Layer (Core)                 │
│   Entities, business rules, interfaces  │
└─────────────────────────────────────────┘
                  ▲
                  │ implements
┌─────────────────┴───────────────────────┐
│       Repository Layer                  │
│   Data access, database operations      │
└─────────────────────────────────────────┘
```

## Alternatives Considered

### Monolithic (no layers)
- Pros: Simpler initially
- Cons: Becomes unmaintainable, untestable
- Rejected: Too risky for anything beyond trivial

### Microservices
- Pros: Independent deployment, scaling
- Cons: Massive overhead for small team, distributed complexity
- Rejected: Premature; can extract later if needed

### Hexagonal/Ports-and-Adapters
- Pros: Very clean, highly testable
- Cons: More abstraction, more interfaces
- Rejected: We'll approximate this without the ceremony; can formalize later

## Consequences
### Positive
- Clear ownership (domain logic in domain layer)
- Easy to test (mock repositories)
- Easy to trace issues

### Negative
- More files/directories
- Must be disciplined about layers
- Some indirection

## When to Revisit
- If layers become too many hops for simple operations
- If need to extract microservices
```

---

### ADR-005: ORM vs Raw SQL

```markdown
# ADR-005: Use Raw SQL with Repository Pattern

## Status
Accepted

## Context
We need to interact with SQLite database.

Options:
- Full ORM (SQLAlchemy ORM)
- Query builder (SQLAlchemy Core)
- Raw SQL with thin wrapper

## Decision
Use **raw SQL** encapsulated in Repository classes.

## Rationale
1. **Learning**: Understanding SQL is foundational
2. **Control**: Know exactly what queries run
3. **No magic**: No ORM surprises or N+1 queries hidden
4. **Performance**: Can optimize queries directly
5. **Migration**: Easier to understand when moving to PostgreSQL

## Example
```python
# Repository using raw SQL
class PartRepository:
    def find_by_number(self, part_number: str) -> Optional[Part]:
        row = self.db.execute(
            "SELECT * FROM parts WHERE part_number = ?",
            [part_number]
        ).fetchone()
        return Part.from_row(row) if row else None
```

## Alternatives Considered

### SQLAlchemy ORM
- Pros: Less SQL, object mapping, relationships
- Cons: Hides queries, complex for edges cases, magic
- Rejected: Want to understand database interaction

### SQLAlchemy Core
- Pros: Query builder, no string SQL
- Cons: Another abstraction to learn
- Rejected: Extra layer without enough benefit

### Django ORM
- Pros: Integrated with Django
- Cons: Would require Django (rejected in ADR-003)
- Rejected: Not using Django

## Consequences
### Positive
- Full SQL knowledge required and gained
- Complete visibility into queries
- Easy to optimize

### Negative
- More verbose
- Manual mapping entity ↔ row
- Must prevent SQL injection (use parameters)

## When to Revisit
- If SQL boilerplate becomes excessive
- If team wants ORM productivity
- If complex relationships become hard to manage
```

---

### ADR-006: Testing Strategy

```markdown
# ADR-006: Testing Strategy

## Status
Accepted

## Context
We need a testing approach that:
- Catches bugs before production
- Documents expected behavior
- Enables safe refactoring
- Doesn't slow development

## Decision
- **Unit tests** for domain logic
- **Integration tests** for repository/database
- **End-to-end tests** for critical paths
- Use **pytest** as framework
- Practice **TDD** where practical

## Test Pyramid
```
         ┌───────────┐
         │   E2E     │ Few (slow, brittle)
        ┌┴───────────┴┐
        │ Integration  │ Some (database, services)
       ┌┴─────────────┴┐
       │    Unit        │ Many (fast, isolated)
       └────────────────┘
```

## Rationale
1. **Unit tests** are fast, test business logic in isolation
2. **Integration tests** verify database operations work
3. **E2E tests** verify user flows (sparingly)
4. **pytest** is standard, good fixtures, clear syntax
5. **TDD** forces thinking about design before implementation

## What to Test

| Layer | Test Type | What to Test |
|-------|-----------|--------------|
| Domain | Unit | Validation, invariants, state transitions |
| Repository | Integration | CRUD operations, SQL correctness |
| Service | Unit (mocked repo) | Orchestration logic |
| API | Integration | Request/response handling |
| E2E | Full stack | Critical user journeys |

## Consequences
### Positive
- High confidence in domain logic
- Safe refactoring
- Documentation via tests

### Negative
- Time investment in writing tests
- Must maintain tests as code changes
- Test quality matters (bad tests are worse than none)

## When to Revisit
- If test suite becomes too slow
- If test maintenance exceeds value
- If different testing philosophy preferred
```

---

## Part 2: ADR Summary Table

| ADR | Decision | Key Rationale |
|-----|----------|---------------|
| 001 | Python | Readable, good for data processing, developer familiarity |
| 002 | SQLite | Zero config, sufficient for development |
| 003 | Flask | Explicit, minimal, teaching-friendly |
| 004 | Layered architecture | Separation, testability, understandability |
| 005 | Raw SQL + Repository | Learning, control, no magic |
| 006 | pytest + TDD | Fast feedback, design-first thinking |

---

## Part 3: Exercises

### Exercise 1: Write an ADR

Write an ADR for this decision:

> "We will use UUID for internal entity IDs instead of auto-increment integers."

<details>
<summary>Hints</summary>

- What are the pros/cons of each?
- What about database migration?
- What about URL readability?

</details>

<details>
<summary>Solution</summary>

```markdown
# ADR-007: Use UUID for Internal Entity IDs

## Status
Accepted

## Context
We need to assign unique identifiers to entities (Parts, Machines, etc.).

Options:
- Auto-increment integers (1, 2, 3, ...)
- UUIDs (550e8400-e29b-41d4-a716-446655440000)

## Decision
Use **UUIDs** for all internal entity IDs.

## Rationale
1. **Globally unique**: No collision across tables or databases
2. **No central authority**: Can generate offline/distributed
3. **Merge-friendly**: Easy to combine data from multiple sources
4. **Security**: IDs not guessable (can't enumerate)
5. **Future-proof**: Supports eventual multi-tenant/distributed

## Alternatives Considered

### Auto-increment integers
- Pros: Simple, small, human-readable
- Cons: Sequential (enumerable), collision on merge, single-authority
- Rejected: UUIDs are worth the extra bytes

## Consequences
### Positive
- Unique across all contexts
- Can generate before database insert
- Harder to guess/enumerate

### Negative
- Longer (36 characters)
- Slightly worse database performance (indexing)
- Not human-memorable

## When to Revisit
- If storage/performance becomes critical
- If user-facing readability needed (use slug in addition)
```

</details>

---

### Exercise 2: Challenge an ADR

Review ADR-005 (Raw SQL with Repository Pattern). Write a rebuttal from someone who prefers SQLAlchemy ORM. Include:
- Counter-arguments to each rationale point
- A different "Consequences" section
- When the ORM choice would be better

<details>
<summary>Solution</summary>

**Rebuttal to ADR-005:**

### Counter-Arguments

| Original Rationale | Counter |
|-------------------|---------|
| "Learning SQL is foundational" | True, but can learn SQL AND use ORM. ORM doesn't prevent SQL knowledge. |
| "Know exactly what queries run" | SQLAlchemy has query logging. Can see generated SQL. |
| "No ORM surprises" | Surprises come from not understanding the tool. Learning curve is investment. |
| "Performance" | ORM optimizations (identity map, eager loading) often outperform naive SQL |

### ORM Consequences (Alternative)

**Positive:**
- Less boilerplate (no manual mapping)
- Relationship handling automatic
- Migrations built-in (Alembic)
- Protection from common SQL mistakes

**Negative:**
- Abstraction to learn
- Must understand N+1 and eager loading
- Some operations easier in raw SQL

### When ORM Would Be Better
- Large schema with many relationships
- Team experienced with ORMs
- Complex queries that would be repetitive in raw SQL
- Need for automatic migrations

**Conclusion:** ADR-005 is valid for learning context. Production system with experienced team might choose differently.

</details>

---

### Exercise 3: Document Missing ADRs

What ADRs are missing for PartFlow? List 3 potential ADRs with:
- Title
- The question it answers
- Why the decision matters

<details>
<summary>Solution</summary>

**Missing ADR 1: Authentication Mechanism**
- Question: How do we verify user identity? Sessions? JWT? OAuth?
- Why: Affects architecture, security, session management

**Missing ADR 2: Error Handling Strategy**
- Question: How do we handle and report errors? Exceptions? Result types?
- Why: Affects all layers, user experience, debugging

**Missing ADR 3: Configuration Management**
- Question: How do we manage configuration? Environment variables? Files? Secrets?
- Why: Affects deployment, security, environment separation

**Additional candidates:**
- ADR for frontend technology (server-rendered templates vs SPA)
- ADR for logging strategy
- ADR for file storage (filesystem vs object storage)

</details>

---

## Summary

### Key Takeaways

| Concept | What It Means |
|---------|---------------|
| **ADR** | Document capturing a single architectural decision |
| **Status** | Proposed → Accepted → (Deprecated/Superseded) |
| **Rationale** | Why this choice? What criteria mattered? |
| **Alternatives** | What else was considered? Why rejected? |
| **Consequences** | What trade-offs did we accept? |
| **When to Revisit** | Under what conditions should we reconsider? |

### ADR Best Practices

- [ ] One decision per ADR
- [ ] Write when decision is made, not after
- [ ] Include rejected alternatives
- [ ] Document trade-offs honestly
- [ ] Update status, don't modify content
- [ ] Store in version control

---

## Next Tutorial

[Tutorial 4: Dependency Rules →](./04-dependency-rules.md)
