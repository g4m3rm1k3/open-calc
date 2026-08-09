# Tutorial 1: What is Software Engineering?

## Introduction

This is the most important tutorial in the entire curriculum. If you skip it, everything that follows will feel like arbitrary rules. If you understand it deeply, everything else will feel inevitable.

**The central thesis:** Software engineering is not programming. Programming is a skill. Engineering is a discipline. This tutorial explains the difference.

---

## Part 1: The Fundamental Distinction

### 1.1 What is Programming?

Programming is the act of giving instructions to a computer. At its core, it answers one question:

> **"How do I make the computer do X?"**

A programmer:
- Writes code that produces the correct output
- Solves the immediate problem
- Gets the tests to pass
- Makes the feature work

This is valuable and necessary. Every engineer must be a programmer first. But programming alone is not engineering.

### 1.2 What is Engineering?

Engineering is the discipline of building systems that work reliably under constraints. It answers a different set of questions:

> **"How do I build something that:**
> - **Works correctly now?**
> - **Keeps working when requirements change?**
> - **Can be understood by others?**
> - **Can be modified without breaking?**
> - **Fails gracefully when something goes wrong?**
> - **Can be tested systematically?**
> - **Can be deployed and operated safely?"**

An engineer:
- Writes code that is correct, maintainable, and evolvable
- Considers how today's decisions affect tomorrow's options
- Designs for failure, not just success
- Documents decisions so others can understand them
- Builds systems, not just features

### 1.3 The Critical Difference

| Dimension | Programmer | Engineer |
|-----------|------------|----------|
| **Goal** | Make it work | Make it work, stay working, and remain understandable |
| **Time horizon** | This sprint | The next five years |
| **Question** | "Does it pass tests?" | "What happens when X changes?" |
| **Failure mode** | Code doesn't run | System is unmaintainable |
| **Success metric** | Feature ships | System remains healthy |
| **Primary output** | Working code | Understandable system |

### 1.4 Why This Matters

Consider a simple example. You need to save a user record to a database.

**The programmer's solution:**

```python
def save_user(name, email):
    db.execute(f"INSERT INTO users (name, email) VALUES ('{name}', '{email}')")
```

This works. It saves the user. Tests pass.

**The engineer's questions:**

1. What if the email already exists? (Uniqueness constraint)
2. What if the database is down? (Error handling)
3. What if someone passes a malicious email? (SQL injection)
4. What if we need to add a phone number later? (Evolvability)
5. What if another developer needs to understand this? (Clarity)
6. What if we change databases? (Coupling)
7. What if we need to audit who created the user? (Traceability)

**The engineer's solution** addresses all of these concerns. It looks different—not because engineers like complexity, but because engineers think about consequences.

---

## Part 2: The Cost of Ignoring Engineering

### 2.1 Technical Debt

When you write code that "just works" without considering engineering concerns, you create **technical debt**. Like financial debt, technical debt accumulates interest over time.

| Type of Debt | Example | Interest Payment |
|--------------|---------|------------------|
| **Architecture debt** | No clear module boundaries | Every feature touches everything |
| **Testing debt** | No automated tests | Manual testing before every release |
| **Documentation debt** | No ADRs or comments | New team members can't understand decisions |
| **Naming debt** | Vague variable names | Hours spent deciphering code |
| **Duplication debt** | Copy-paste code | Fix the same bug in seven places |

### 2.2 The Maintenance Trap

Most software spends 80% of its life in maintenance. This means:

- For every hour writing code, you'll spend four hours reading it
- For every feature you add, you'll fix ten bugs
- For every decision you make, someone else will live with the consequences

**The programmer optimizes for writing speed.**
**The engineer optimizes for reading speed.**

### 2.3 Real-World Consequences

In our Manufacturing Engineering Platform, consider what happens without engineering discipline:

| Scenario | Programmer Approach | Consequence |
|----------|---------------------|-------------|
| Store G-code files | Save to filesystem | Can't track versions, can't audit access |
| Track tool usage | Add a "used" column | Can't see history, can't analyze trends |
| Handle machine lockout | Check a flag | Race condition causes two operators to edit simultaneously |
| Validate CAM import | Parse and save | Invalid data corrupts downstream processes |
| Approve program release | Set "approved = true" | No audit trail, no accountability, no rollback |

Each of these "programmer solutions" works in isolation. Together, they create a system that:
- Can't be trusted
- Can't be audited
- Can't be extended
- Can't be maintained

---

## Part 3: The Engineering Mindset

### 3.1 Think in Trade-offs

Every decision has benefits and costs. Engineers don't seek "the best" solution—they seek the **appropriate** solution given constraints.

| Decision | Benefit | Cost | When to Choose |
|----------|---------|------|----------------|
| Use ORM | Easy to write | Harder to optimize | When queries are simple |
| Use raw SQL | Full control | Verbose, maintenance burden | When performance is critical |
| Validate early | Fast feedback | Scattered validation | When boundaries are clear |
| Validate late | Centralized | Delayed errors | When context is needed |

**The key insight:** There are no universally "right" answers. There are only decisions that are right **for your context**—and the discipline to document why.

### 3.2 Think in Consequences

Before writing code, ask:
1. **What happens if this succeeds?**
2. **What happens if this fails?**
3. **What happens if this is used differently than expected?**
4. **What happens if this needs to change?**
5. **What happens if someone else needs to understand this?**

For every decision, fill out this table mentally:

| If... | Then... |
|-------|---------|
| This function receives null | ? |
| This function receives unexpected type | ? |
| The database is unavailable | ? |
| The user is malicious | ? |
| The requirements change | ? |
| A new developer reads this | ? |

### 3.3 Think in Boundaries

Systems are made of modules. Modules have:
- **Responsibilities** (what they do)
- **Contracts** (what they promise)
- **Dependencies** (what they need)

Good engineering creates clear boundaries:

| Module | Responsibility | Cannot Access |
|--------|---------------|---------------|
| Domain (entities) | Business rules | Database, HTTP |
| Repository | Data access | HTTP, UI |
| Service | Orchestration | Database directly |
| API | HTTP interface | Database directly |

Bad engineering has everything accessing everything. This is called a **Big Ball of Mud**—and it's the default outcome when no one thinks about architecture.

### 3.4 Think in Time

Code exists in time. Today's code will be:
- **Read** by someone who didn't write it
- **Modified** for requirements that don't exist yet
- **Debugged** at 3 AM during an outage
- **Extended** in ways you can't predict
- **Replaced** when it can't evolve anymore

**The engineer's question:** "How will this code feel in two years?"

---

## Part 4: How Engineers Work

### 4.1 Understand Before Building

Before writing code, an engineer:

1. **Reads the requirements** (and questions them)
2. **Identifies the domain model** (what are the "things"?)
3. **Maps relationships** (how do things connect?)
4. **Defines invariants** (what must always be true?)
5. **Considers failure modes** (what can go wrong?)
6. **Documents decisions** (why this approach?)

Only then does coding begin.

### 4.2 Test Before Implementing

**Test-Driven Development (TDD)** is not about testing—it's about thinking.

When you write a test first, you must:
1. Define what "correct" means
2. Consider edge cases
3. Design the interface
4. Clarify requirements

The test becomes executable documentation of expected behavior.

### 4.3 Design for Change

Requirements will change. Guaranteed. The question is: how much of your codebase breaks when they do?

Good architecture **minimizes the blast radius** of change:

| Change | Poor Architecture | Good Architecture |
|--------|-------------------|-------------------|
| Add a field to Part | Change 15 files | Change 2 files |
| Switch databases | Rewrite everything | Change 1 adapter |
| Add a new user role | Change every endpoint | Change 1 policy file |
| Change validation rule | Hunt through code | Change 1 validator |

### 4.4 Document Decisions

Engineers write **Architectural Decision Records (ADRs)**:

```markdown
# ADR-001: Use SQLite for Initial Storage

## Status
Accepted

## Context
We need persistent storage. Options: PostgreSQL, MySQL, SQLite, JSON files.

## Decision
Use SQLite for initial development.

## Rationale
- No server setup required
- Single file deployment
- Sufficient for early development
- Easy to upgrade later

## Consequences
- Limited concurrency (acceptable for now)
- No advanced features like JSONB
- Will need migration strategy for production

## When to Revisit
When we need multi-user concurrent writes or production deployment.
```

This documentation:
- Captures **why**, not just what
- Records **alternatives considered**
- Notes **trade-offs accepted**
- Specifies **when to reconsider**

---

## Part 5: Applying This to PartFlow

Let's apply engineering thinking to our Manufacturing Engineering Platform.

### 5.1 What the BRD Says

> "The Platform shall manage Parts as first-class entities with unique identity, revision history, and support for major and minor revisions."

### 5.2 What a Programmer Sees

A database table with columns. A CRUD API. Done.

### 5.3 What an Engineer Sees

**Domain Questions:**
- What is a "Part"? What properties define it?
- What makes two Parts "the same"? (Identity)
- What rules must a Part always satisfy? (Invariants)
- What can a Part be related to? (Relationships)

**Change Questions:**
- What if we add a new property to Part?
- What if we need to track Part categories?
- What if Parts can have parent relationships?

**Failure Questions:**
- What if someone tries to delete a Part with active programs?
- What if two people edit the same Part simultaneously?
- What if invalid data is imported?

**System Questions:**
- Where is Part validation enforced?
- Who is responsible for Part persistence?
- How do other modules interact with Parts?

### 5.4 The Engineering Outcome

From this analysis, an engineer produces:

1. **Domain Model**: Part entity with typed properties
2. **Invariants**: Rules that Part must satisfy
3. **Identity Rules**: What makes Parts unique
4. **Boundary Definition**: What "owns" Parts
5. **Change Impact Analysis**: What breaks if Parts change
6. **Error Handling Strategy**: How to handle Part failures

This happens **before** any code is written.

---

## Part 6: Self-Assessment

Answer these questions honestly:

| Question | Your Answer |
|----------|-------------|
| When you read requirements, do you ask "what's missing?" | |
| Before coding, do you diagram entities and relationships? | |
| Do you consider what happens when code fails? | |
| Do you document why you chose an approach? | |
| Do you think about how code will feel in two years? | |

If you answered "no" to any of these, this curriculum will change how you work.

---

## Exercises

### Exercise 1: Identify the Problems

Review this code and identify engineering problems:

```python
def process_order(order_data):
    db.execute(f"INSERT INTO orders VALUES ('{order_data['id']}', '{order_data['customer']}')")
    for item in order_data['items']:
        db.execute(f"INSERT INTO order_items VALUES ('{item['id']}', '{order_data['id']}')")
    send_email(order_data['customer'], "Order received!")
    return "OK"
```

<details>
<summary>Hints</summary>

- What if the database fails mid-way?
- What if the email service is down?
- What if order_data is missing fields?
- What if the customer email is malicious?
- What if we need to change the email template?

</details>

<details>
<summary>Solution</summary>

**Problems identified:**

| Problem | Category | Consequence |
|---------|----------|-------------|
| SQL injection via string formatting | Security | Data breach, data corruption |
| No transaction wrapping inserts | Consistency | Partial orders in database |
| Email sending mixed with data logic | Coupling | Can't test order logic alone |
| No validation of order_data | Reliability | Crashes on missing fields |
| No error handling | Reliability | Silent failures |
| Magic strings ("OK") | Maintainability | No error information |
| No logging | Observability | Can't debug production issues |
| Direct database access | Testability | Can't test without real database |

</details>

---

### Exercise 2: Think Like an Engineer

Given this requirement:

> "Users should be able to mark a program as 'proven' after it has run successfully on the shop floor."

Write down:
1. Three questions a programmer might miss
2. Two things that could go wrong
3. One change that might happen later

<details>
<summary>Hints</summary>

- Who can mark a program as proven?
- What evidence is required?
- Can a program be un-proven?

</details>

<details>
<summary>Solution</summary>

**Questions a programmer might miss:**
1. Who has permission to mark a program proven? (Authorization)
2. What evidence is required to prove the program? (Data integrity)
3. Can a proven program be edited? What happens to proven status? (State management)
4. Is there an approval workflow, or can anyone do it? (Governance)
5. How do we audit who proved what and when? (Traceability)

**Things that could go wrong:**
1. Unauthorized user marks program proven → Quality escapes to shop floor
2. Proven program is edited without resetting status → Untested changes run on machines

**Changes that might happen later:**
1. Multiple levels of proven status (proven on one machine, proven on all)
2. Expiration of proven status (must re-prove annually)
3. Automatic proven detection from machine feedback

</details>

---

### Exercise 3: Decision Documentation

Write a brief ADR for this decision:

> "We will use Python for the backend instead of Node.js."

Use this template:

```markdown
# ADR-XXX: [Title]

## Status
[Proposed/Accepted/Deprecated]

## Context
[What is the situation?]

## Decision
[What did we decide?]

## Rationale
[Why did we decide this?]

## Consequences
[What are the trade-offs?]

## When to Revisit
[Under what conditions would we change this?]
```

<details>
<summary>Sample Solution</summary>

```markdown
# ADR-001: Use Python for Backend Development

## Status
Accepted

## Context
We need to choose a backend language for the Manufacturing Engineering Platform. 
Team has mixed experience. Platform will process CAM files, manage data, and serve APIs.

## Decision
Use Python 3.11+ for all backend development.

## Rationale
1. Strong data processing libraries (relevant for CAM/G-code parsing)
2. Readable syntax supports teaching and maintainability goals
3. Flask provides simple, understandable web framework
4. Large ecosystem for scientific/engineering computing
5. Easy to onboard new developers

## Consequences
- Slower than Node.js for pure I/O workloads (acceptable for our scale)
- Need to manage virtual environments
- Type hints optional (will enforce via tooling)
- GIL limits true parallelism (acceptable for our concurrency model)

## When to Revisit
- If we need microsecond latency for real-time features
- If we move to client-side rendering with shared code
- If performance profiling shows Python is the bottleneck
```

</details>

---

## Summary

### Key Takeaways

| Concept | What It Means |
|---------|---------------|
| **Engineering ≠ Programming** | Programming makes code work; engineering makes systems work |
| **Think in consequences** | Every decision has downstream effects |
| **Think in boundaries** | Systems are made of modules with clear responsibilities |
| **Think in time** | Code will be read, changed, and debugged for years |
| **Document decisions** | Future developers (including you) need to understand why |

### The Engineering Checklist

Before writing any code, ask:

- [ ] What are the entities involved?
- [ ] What relationships exist between them?
- [ ] What invariants must always hold?
- [ ] What can go wrong?
- [ ] What changes are likely?
- [ ] How will this be tested?
- [ ] How will this be understood by others?

---

## Next Tutorial

[Tutorial 2: Reading Requirements →](./02-reading-requirements.md)
