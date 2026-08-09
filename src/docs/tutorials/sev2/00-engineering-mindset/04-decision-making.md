# Tutorial 4: How Engineers Make Decisions

## Introduction

Engineering is decision-making under constraints. Every day, engineers choose between:
- Libraries and frameworks
- Architectures and patterns
- Trade-offs between competing goals
- Solutions that are "good enough" vs. "perfect"

This tutorial teaches you **how to make decisions** and—just as importantly—**how to document them** so that future developers (including yourself) understand why.

---

## Part 1: The Nature of Engineering Decisions

### 1.1 There Are No "Right" Answers

In programming puzzles, there's typically one correct solution. In engineering, there are many valid solutions, each with different trade-offs.

| Decision Type | Programming | Engineering |
|---------------|-------------|-------------|
| Solution space | Narrow (one right answer) | Wide (many viable options) |
| Evaluation criteria | Correctness | Fitness for context |
| Time horizon | Immediate | Long-term |
| Stakeholders | Self | Team, future developers, users |

### 1.2 What Makes a Decision "Engineering"

An engineering decision:
- Has **multiple viable alternatives**
- Involves **trade-offs** (gaining X means losing Y)
- Is **context-dependent** (right for this project, wrong for another)
- Has **long-term consequences** (affects future development)
- Requires **documentation** (so others understand why)

### 1.3 Examples of Engineering Decisions

| Category | Example Decision | Trade-off |
|----------|------------------|-----------|
| **Language** | Python vs. TypeScript | Developer velocity vs. type safety |
| **Database** | SQLite vs. PostgreSQL | Simplicity vs. features |
| **Architecture** | Monolith vs. microservices | Simplicity vs. scalability |
| **Testing** | Unit tests vs. integration tests | Speed vs. coverage |
| **API** | REST vs. GraphQL | Simplicity vs. flexibility |

---

## Part 2: The Decision-Making Framework

### 2.1 The Five-Step Framework

Every engineering decision should follow this process:

```
1. CONTEXT     → What is the situation?
2. OPTIONS     → What are the alternatives?
3. CRITERIA    → What matters most?
4. ANALYSIS    → How do options compare?
5. DECISION    → What do we choose and why?
```

### 2.2 Step 1: Context

Before evaluating options, understand the context:

| Context Factor | Questions to Ask |
|----------------|------------------|
| **Problem** | What are we trying to solve? |
| **Constraints** | What limits our choices? (time, budget, skills) |
| **Stakeholders** | Who is affected by this decision? |
| **Timeline** | How long do we have to decide? |
| **Reversibility** | How hard is it to change this decision later? |

**Example: Database choice for PartFlow**

| Factor | Answer |
|--------|--------|
| Problem | Need persistent storage for manufacturing data |
| Constraints | Single developer, local development first, eventual deployment |
| Stakeholders | Developer, future maintainers, users |
| Timeline | Decide before implementation starts |
| Reversibility | Medium (requires migration, but repository pattern isolates) |

### 2.3 Step 2: Options

List all viable alternatives. Don't evaluate yet—just enumerate.

| Option | Description |
|--------|-------------|
| SQLite | File-based, zero config, SQL |
| PostgreSQL | Full-featured, production-grade |
| MySQL | Popular, well-known |
| JSON files | Simple, no database |
| MongoDB | Document store, schemaless |

### 2.4 Step 3: Criteria

Define what "good" means for this decision. Criteria should be:
- **Relevant** to the context
- **Measurable** (or at least comparable)
- **Weighted** by importance

| Criterion | Weight | Definition |
|-----------|--------|------------|
| Setup simplicity | High | How easy to start using? |
| Data integrity | High | Supports constraints, transactions? |
| Future scalability | Medium | Can handle production load? |
| Team familiarity | Medium | Do we know this technology? |
| Migration path | Low | How hard to switch later? |

### 2.5 Step 4: Analysis

Compare options against criteria:

| Criterion | SQLite | PostgreSQL | JSON Files |
|-----------|--------|------------|------------|
| Setup simplicity | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| Data integrity | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| Future scalability | ⭐ | ⭐⭐⭐ | ⭐ |
| Team familiarity | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Migration path | ⭐⭐ | N/A | ⭐ |

### 2.6 Step 5: Decision

State the decision clearly, with rationale:

> **Decision**: Use SQLite for initial development.
>
> **Rationale**: SQLite provides the best balance of simplicity and data integrity. It requires no server setup, works locally, and supports SQL/constraints needed for manufacturing data. The repository pattern will isolate database access, making future migration to PostgreSQL manageable.
>
> **Trade-offs accepted**: Limited concurrent write performance (acceptable for single-user development). No advanced features like JSONB.
>
> **Revisit when**: We need multi-user concurrent writes, or when deploying to production with multiple instances.

---

## Part 3: Architectural Decision Records (ADRs)

### 3.1 What is an ADR?

An ADR is a document that captures a single architectural decision. It's:
- **Immutable** (once accepted, doesn't change)
- **Accumulated** (new decisions add new ADRs)
- **Searchable** (explains why things are the way they are)

### 3.2 Why Write ADRs?

| Problem | How ADRs Help |
|---------|---------------|
| "Why did we use X?" | ADR explains the reasoning |
| "Should we change X?" | ADR lists when to revisit |
| New team members confused | ADRs provide history |
| Repeated debates | ADR settles the question |
| Decision forgotten | ADR preserves knowledge |

### 3.3 ADR Template

```markdown
# ADR-[NUMBER]: [TITLE]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context
[What is the situation? What problem are we solving?]

## Decision
[What did we decide?]

## Rationale
[Why did we choose this option?]
- Reason 1
- Reason 2
- Reason 3

## Alternatives Considered
### [Alternative 1]
- Pros: ...
- Cons: ...
- Why rejected: ...

### [Alternative 2]
- Pros: ...
- Cons: ...
- Why rejected: ...

## Consequences
[What are the trade-offs? What are we giving up?]
- Positive: ...
- Negative: ...

## When to Revisit
[Under what conditions should we reconsider?]
```

### 3.4 Example ADR

```markdown
# ADR-001: Use Python for Backend Development

## Status
Accepted

## Context
We need to choose a programming language for the Manufacturing Engineering Platform backend. The platform will:
- Parse CAM/G-code files
- Manage manufacturing data
- Serve a web API
- Be developed incrementally by a single developer initially

Key constraints:
- Developer proficiency in Python
- Need for readable, maintainable code
- Future team members should onboard quickly
- Manufacturing domain often uses Python in tooling

## Decision
Use Python 3.11+ for all backend development.

## Rationale
1. **Readability**: Python's syntax supports teaching goals and maintainability
2. **Data processing**: Strong ecosystem for parsing and data manipulation
3. **Web framework**: Flask provides simple, understandable web layer
4. **Domain fit**: Manufacturing and engineering tooling commonly uses Python
5. **Developer familiarity**: Primary developer is most productive in Python

## Alternatives Considered

### TypeScript/Node.js
- Pros: Full-stack JavaScript, strong typing, npm ecosystem
- Cons: More complex tooling, less domain presence
- Why rejected: Adds complexity without significant benefit for this domain

### Go
- Pros: Fast compilation, strong typing, good performance
- Cons: Less expressive for rapid development, smaller web ecosystem
- Why rejected: Productivity more important than performance for this phase

### Rust
- Pros: Memory safety, high performance
- Cons: Steep learning curve, slower development
- Why rejected: Premature optimization; development speed is priority

## Consequences

### Positive
- Faster initial development
- Easier onboarding for new developers
- Good library support for file parsing

### Negative
- Slower than compiled languages (acceptable for our scale)
- Optional typing requires discipline (will enforce via tooling)
- GIL limits parallelism (acceptable; not CPU-bound)

## When to Revisit
- If performance profiling shows Python is the bottleneck
- If we need to share code with a TypeScript frontend
- If the team composition changes significantly
```

---

## Part 4: Common Decision Patterns

### 4.1 Start Simple, Extend Later

**The pattern**: Choose the simplest solution that meets current needs, but ensure it can be extended.

| Situation | Simple Choice | Extension Path |
|-----------|---------------|----------------|
| Storage | SQLite | Migrate to PostgreSQL |
| Auth | Simple session | Add OAuth later |
| Validation | Inline checks | Extract to validation layer |
| Caching | None | Add Redis when needed |

**When it fails**: When the simple choice creates irreversible coupling.

### 4.2 Defer Decisions

**The pattern**: Delay decisions until you have more information.

| Decide Now | Defer Until Needed |
|------------|-------------------|
| Core domain model | Specific database engine |
| Primary language | Deployment platform |
| Module boundaries | Caching strategy |
| Testing approach | CI/CD pipeline details |

**When it fails**: When defer means "never" and creates technical debt.

### 4.3 Reversibility Over Perfection

**The pattern**: Prefer decisions that are easy to change over decisions that are "perfect" but permanent.

| Hard to Reverse | Easy to Reverse |
|-----------------|-----------------|
| Database schema | JSON API format |
| Core domain model | UI layout |
| Language choice | Library choice |
| Architecture | Implementation details |

**When it fails**: When the "easy to reverse" choice accumulates debt.

### 4.4 Boring Technology

**The pattern**: Prefer well-understood, widely-used technology over novel solutions.

| Exciting | Boring (Better) |
|----------|-----------------|
| New framework | Proven framework |
| Custom solution | Standard library |
| Latest version | Stable version |
| Novel architecture | Common pattern |

**When it fails**: When boring technology doesn't meet requirements.

---

## Part 5: Decision Anti-Patterns

### 5.1 Resume-Driven Development

**What it is**: Choosing technology because it looks good on a resume.

**Symptoms**:
- "Let's use Kubernetes for our single-user app!"
- "We should use microservices from day one!"
- "GraphQL is the future—we have to use it!"

**The fix**: Ask "Does this solve a problem we actually have?"

### 5.2 Analysis Paralysis

**What it is**: Unable to decide because you're still researching options.

**Symptoms**:
- Weeks of comparing frameworks
- Endless "what if" scenarios
- Waiting for perfect information

**The fix**: Set a decision deadline. Accept that some information will be unknown.

### 5.3 Highest Paid Person's Opinion (HiPPO)

**What it is**: Decisions made by authority, not evidence.

**Symptoms**:
- "The CTO said use React, so we use React"
- No documented rationale
- Dissent discouraged

**The fix**: Require ADRs. Authority can decide, but must document reasoning.

### 5.4 Copycat Architecture

**What it is**: Using what big companies use without considering context.

**Symptoms**:
- "Netflix uses microservices, so we should too"
- "Google uses Kubernetes, it must be right"
- Ignoring scale differences

**The fix**: Ask "Do we have their problems? Do we have their resources?"

### 5.5 Sunk Cost Fallacy

**What it is**: Continuing with a bad decision because of past investment.

**Symptoms**:
- "We've spent months on this, we can't switch now"
- Ignoring evidence that the choice isn't working
- Throwing good effort after bad

**The fix**: Evaluate based on future value, not past investment.

---

## Part 6: Decisions for PartFlow

Let's document key decisions for our Manufacturing Engineering Platform.

### 6.1 Core Technology Decisions

| Decision Area | Choice | Short Rationale |
|---------------|--------|-----------------|
| Language | Python 3.11+ | Readable, domain-appropriate, developer familiarity |
| Web framework | Flask | Simple, explicit, good for teaching |
| Database | SQLite (initially) | Zero config, SQL capabilities |
| ORM | None (raw SQL) | Full control, learning value |
| Testing | pytest | Industry standard, clear syntax |
| Templating | Jinja2 | Comes with Flask, clean syntax |

### 6.2 Architectural Decisions

| Decision Area | Choice | Short Rationale |
|---------------|--------|-----------------|
| Architecture | Layered (Clean-ish) | Clear boundaries, testable |
| Module structure | By domain concept | Parts, Machines, Programs as modules |
| Dependency direction | Inward to domain | Domain is stable, edges are volatile |
| Error handling | Exceptions for programmer errors, result types for business errors | Clear semantics |

### 6.3 Process Decisions

| Decision Area | Choice | Short Rationale |
|---------------|--------|-----------------|
| Development style | TDD | Forces design thinking |
| Version control | Git | Industry standard |
| Documentation | ADRs + inline | Decisions and code together |
| Review | Self-review + checklists | Single developer initially |

---

## Part 7: Documenting Decisions in Practice

### 7.1 Where to Store ADRs

```
project/
├── docs/
│   ├── adr/
│   │   ├── 001-use-python.md
│   │   ├── 002-use-sqlite.md
│   │   ├── 003-layered-architecture.md
│   │   └── README.md
│   └── ...
└── ...
```

### 7.2 ADR Naming Convention

```
[NUMBER]-[short-description].md

001-use-python.md
002-use-sqlite.md
003-layered-architecture.md
```

- Numbers are sequential
- Description is hyphenated, lowercase
- Never reuse numbers

### 7.3 ADR Lifecycle

```
Proposed → Accepted → [Deprecated | Superseded]
                            │
                            ▼
                    New ADR explains replacement
```

### 7.4 When to Write an ADR

Write an ADR when:
- [ ] The decision affects architecture
- [ ] The decision affects multiple modules
- [ ] The decision is hard to reverse
- [ ] You had to discuss trade-offs
- [ ] Future developers might ask "why?"

Don't write an ADR for:
- Variable names
- Minor implementation details
- Obvious choices with no trade-offs

---

## Exercises

### Exercise 1: Decision Analysis

You're building a user authentication system. Analyze these options:

1. Session-based auth (cookies)
2. JWT tokens
3. OAuth with external provider

Create a decision matrix using criteria: simplicity, security, scalability, user experience.

<details>
<summary>Hints</summary>

- What does your app actually need?
- Who are your users?
- What infrastructure do you have?
- What are the team's skills?

</details>

<details>
<summary>Solution</summary>

**Context:**
- Single-tenant manufacturing app
- Users are internal employees
- Admin creates all accounts (no self-registration)
- Initial deployment is single server

**Decision Matrix:**

| Criterion | Session-based | JWT | OAuth |
|-----------|---------------|-----|-------|
| Simplicity | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Security | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Scalability | ⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| User experience | ⭐⭐⭐ | ⭐⭐ | ⭐ (redirect-based) |
| Admin control | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ (depends on provider) |

**Decision:** Session-based authentication.

**Rationale:**
1. Simplest to implement and understand
2. Admin creates accounts—no external provider needed
3. Single server initially—scalability not needed
4. Best user experience for internal users
5. Can add JWT for API access later if needed

**Trade-offs:**
- Requires sticky sessions for multi-server (future concern)
- Less "modern" (irrelevant for this use case)

</details>

---

### Exercise 2: Write an ADR

Write an ADR for this decision:

> "We will use SQLite instead of PostgreSQL for the initial development phase."

Use the full template.

<details>
<summary>Hints</summary>

- What makes SQLite appropriate for initial development?
- What would make PostgreSQL better later?
- What are you giving up?

</details>

<details>
<summary>Solution</summary>

```markdown
# ADR-002: Use SQLite for Initial Development

## Status
Accepted

## Context
We need persistent storage for manufacturing data including Parts, Machines, 
Programs, and their relationships. Options considered are relational databases
(SQLite, PostgreSQL, MySQL) and document stores (MongoDB).

Constraints:
- Single developer initially
- Local development focus
- Need for data integrity (foreign keys, transactions)
- Eventually will deploy to production

## Decision
Use SQLite for initial development, with plan to evaluate PostgreSQL 
for production deployment.

## Rationale
1. **Zero configuration**: No server to install or maintain
2. **File-based**: Database is a single file, easy to manage and share
3. **Full SQL**: Supports the SQL features we need (joins, constraints)
4. **Transactional**: ACID compliant for data integrity
5. **Good enough for single-user development**: Performance adequate

## Alternatives Considered

### PostgreSQL
- Pros: Full-featured, production-grade, excellent concurrent write support
- Cons: Requires server installation, more complex setup
- Why rejected: Overkill for initial development; can migrate later

### JSON Files
- Pros: Simplest possible storage
- Cons: No query capability, no constraints, no transactions
- Why rejected: Manufacturing data needs relational integrity

### MongoDB
- Pros: Flexible schema, good for prototyping
- Cons: No foreign keys, schema discipline harder to enforce
- Why rejected: Relational model better fits manufacturing domain

## Consequences

### Positive
- Faster development startup
- No infrastructure dependencies
- Easy to test (in-memory option)

### Negative
- Limited concurrent writes (single writer)
- No advanced features (JSONB, full-text search)
- Will need migration strategy for production

## When to Revisit
- When deploying to production with multiple users
- When we need concurrent write performance
- When we need PostgreSQL-specific features (JSONB, etc.)
```

</details>

---

### Exercise 3: Identify Anti-Patterns

For each scenario, identify the decision anti-pattern:

1. "Let's use MongoDB because it's web-scale and all the cool startups use it."

2. We've been evaluating frontend frameworks for 3 weeks. Let's look at one more before deciding.

3. "I know our tests are slow, but we've already written 500 of them this way. Too late to change."

4. The tech lead says we should use GraphQL. No one on the team has used it, but he's the lead.

<details>
<summary>Solution</summary>

1. **Copycat Architecture** + **Resume-Driven Development**
   - Using MongoDB because startups use it, not because it fits the problem
   - "Web-scale" is a buzzword, not a requirement

2. **Analysis Paralysis**
   - 3 weeks of research with no decision
   - "One more framework" is delay tactic
   - Set deadline, accept imperfect information

3. **Sunk Cost Fallacy**
   - Past investment doesn't justify future suffering
   - 500 slow tests will only get slower
   - Evaluate: how much pain are we avoiding vs. accepting?

4. **HiPPO (Highest Paid Person's Opinion)**
   - Authority-based, not evidence-based
   - No consideration of team capability
   - Should require documented rationale

</details>

---

### Exercise 4: Reversibility Assessment

Rate these decisions by reversibility (1 = hard to reverse, 5 = easy to reverse):

1. Programming language for the backend
2. CSS framework for styling
3. Variable naming convention
4. Database schema for core entities
5. REST API URL structure

<details>
<summary>Solution</summary>

| Decision | Reversibility | Explanation |
|----------|---------------|-------------|
| Programming language | 1 | Requires complete rewrite |
| CSS framework | 4 | Can swap with some UI work |
| Variable naming | 5 | Find-and-replace, local impact |
| Database schema (core) | 2 | Migrations needed, data at risk |
| REST API URLs | 3 | Can version API, but clients need updating |

**Key insight:** Invest more decision effort in hard-to-reverse decisions.

</details>

---

## Summary

### Key Takeaways

| Concept | What It Means |
|---------|---------------|
| **No right answers** | Engineering decisions are trade-offs |
| **Five-step framework** | Context → Options → Criteria → Analysis → Decision |
| **ADRs** | Document decisions so future developers understand why |
| **Decision patterns** | Start simple, defer, prefer reversibility, boring technology |
| **Anti-patterns** | Resume-driven, analysis paralysis, HiPPO, copycat, sunk cost |

### Decision-Making Checklist

Before making any significant decision:

- [ ] Defined the context (problem, constraints, stakeholders)
- [ ] Listed all viable options
- [ ] Defined evaluation criteria
- [ ] Analyzed options against criteria
- [ ] Documented the decision with rationale
- [ ] Noted alternatives considered
- [ ] Listed trade-offs accepted
- [ ] Specified when to revisit

---

## What's Next

You've completed **Phase 00: Engineering Mindset**. You now have the mental framework to approach software as an engineer, not just a programmer.

**Key skills acquired:**
1. Distinguish engineering from programming
2. Read requirements systematically
3. Think in systems
4. Make and document decisions

[→ Begin Phase 01: Engineering Foundation](../01-engineering-foundation/README.md)

In Phase 01, you'll apply these skills to model the Manufacturing Platform domain, define invariants, and make architectural decisions—all before writing any code.
