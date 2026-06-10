# Junior to Senior — T2·L1 — What Software Architecture Is

**Prerequisites:** T1·L13 (MongoDB Aggregation). You can build a full data
pipeline. This lesson introduces software architecture — the decisions that
determine how the pieces of a system relate to each other.

**What this lab adds:**
- A precise definition of architecture (not the vague one)
- Coupling and cohesion — the two forces architecture manages
- The dependency rule — the principle that underlies every good architecture
- Technical debt — what it is, how it accumulates, why it matters
- Big Ball of Mud — the anti-pattern that architecture prevents

**Time:** 45–60 minutes (reading and analysis — no new code)

---

> **Quick Check — try to answer before reading:**
>
> 1. Two modules: `UserService` imports from `Database`. `Database` imports
>    from `UserService`. What is wrong with this?
> 2. A change to the `email` field in the database schema requires changes
>    to 12 different files. What does this tell you about the architecture?
> 3. "Technical debt" — what is the debt metaphor specifically referring to?
>
> *(Answers at the end of this lab)*

---

## What Architecture Actually Is

Most definitions of software architecture are vague:
*"The high-level structure of a system."*
*"The important design decisions."*
*"The blueprint of a system."*

These are true but not useful. Here is a precise definition:

> **Architecture is the set of decisions about which parts of the system are
> allowed to know about which other parts — and in which direction.**

That is all. Architecture is about **dependencies** — which module can import
which other module, which layer can call which layer, which service can talk
to which service.

Everything else (microservices, hexagonal, event-driven) is a specific answer
to this question.

---

### Concept: Coupling — The Cost of Dependencies

**What it is:** Coupling measures how much one module depends on the internals
of another. High coupling means a change in one module forces changes in others.
Low coupling means modules can change independently.

**The problem before:**

```ts
// High coupling — UserService reaches into Database internals:
class UserService {
  findUser(id: string) {
    const connection = DatabasePool.getConnection();       // depends on DatabasePool
    const result = connection.execute(                    // depends on SQL API
      'SELECT * FROM users WHERE id = ?', [id]
    );
    return result.rows[0];                                // depends on row format
  }
}
```

A change to `DatabasePool`, the SQL API, or the row format requires changing
`UserService`. Three sources of coupling — three reasons `UserService` might break.

**The solution:**

```ts
// Low coupling — UserService depends only on an interface:
interface UserRepository {
  findById(id: string): Promise<User | null>;
}

class UserService {
  constructor(private readonly users: UserRepository) {}

  findUser(id: string) {
    return this.users.findById(id);  // depends only on the interface
  }
}
```

Now `UserService` is isolated from the database implementation. You can change
the database, the SQL library, or the connection pooling without touching `UserService`.

**Types of coupling (from worst to least bad):**

| Type | Example | Impact |
|---|---|---|
| **Content coupling** | Module A modifies module B's private variables | Catastrophic |
| **Common coupling** | Two modules share mutable global state | Very high |
| **Control coupling** | A passes a flag to B that controls B's behaviour | High |
| **Data coupling** | A calls B with a simple data structure | Low (acceptable) |
| **Message coupling** | A emits an event; B reacts | Minimal |

**Canonical example:** Coupling is like plumbing. Tightly coupled pipes are
welded together — replacing one section requires cutting the whole pipe.
Loosely coupled pipes use standard fittings — you can replace one section
without touching the others.

**You will see this again in:** Every architecture pattern in this topic,
every design pattern discussion, every code review comment that says "this
is too tightly coupled."

**Watch for:** Import statements are coupling made visible. Count how many
modules a file imports from. Many imports = high coupling = harder to change.

---

### Concept: Cohesion — Modules That Belong Together

**What it is:** Cohesion measures how related the code within a module is to
a single purpose. High cohesion means everything in the module serves one job.
Low cohesion means the module is a grab-bag of unrelated things.

**Low cohesion — a "utility" module:**

```ts
// utils.ts — contains everything that did not fit anywhere else:
export function formatDate(date: Date): string { ... }
export function hashPassword(password: string): string { ... }
export function validateEmail(email: string): boolean { ... }
export function sendEmail(to: string, body: string): void { ... }
export function generatePDF(data: Record<string, unknown>): Buffer { ... }
```

This module has no single purpose. It is a rubbish bin. When it needs to
change, the reason could be "date formatting rules changed" OR "email sending
broke" OR "PDF library update" — three unrelated reasons.

**High cohesion — focused modules:**

```ts
// date-formatter.ts — only date formatting:
export function formatDate(date: Date): string { ... }
export function parseDate(str: string): Date { ... }

// password.ts — only password operations:
export function hashPassword(password: string): string { ... }
export function verifyPassword(input: string, hash: string): boolean { ... }
```

Each module changes for exactly one reason.

**The Single Responsibility Principle stated precisely:**
*A module should have exactly one reason to change.*

Not "do one thing" — "have one reason to change." `ContactValidator` validates
contacts. If contact validation rules change, `ContactValidator` changes.
If logging changes, it should not.

**Canonical example:** Cohesion is like a toolbox where each drawer has one
type of tool. The screwdrivers are together, the wrenches are together.
You can find what you need instantly, and when you need to reorganise screwdrivers,
you do not disturb the wrenches.

---

### Concept: The Dependency Rule

**What it is:** In a well-structured system, dependencies point in one direction
— from volatile outer layers toward stable inner layers. Inner layers never
import from outer layers.

```
┌─────────────────────────────────────────────────┐
│  Infrastructure (database, HTTP, file system)    │  ← volatile: changes often
│  ┌───────────────────────────────────────────┐  │
│  │  Application (services, use cases)        │  │  ← changes when features change
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │  Domain (entities, business rules)   │ │  │  ← stable: changes when business changes
│  │  └─────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

Arrows point INWARD only:
  Infrastructure → Application → Domain
  Domain NEVER imports Infrastructure
```

**Why this matters:**

If `Domain` imports `Database`, then every database change risks breaking
domain logic. But the domain — the core business rules — should be the
most stable part of the system.

If `Domain` defines an interface (`UserRepository`), and `Infrastructure`
implements it, then:
- `Domain` is tested without any database
- You can swap from SQLite to MongoDB by changing only `Infrastructure`
- Business logic is never affected by database changes

**What it hides:** The dependency rule hides infrastructure decisions from
business logic. The domain does not know whether data lives in SQLite,
MongoDB, or an in-memory dictionary. Infrastructure handles that;
domain handles business rules.

**Canonical example:** A compass has a stable needle (domain) that always
points north regardless of where you carry it (infrastructure). The case,
the strap, the GPS — all change with models and years. The needle never
changes. The dependency rule keeps business logic as stable as the needle.

---

### Concept: Technical Debt

**What it is:** Technical debt is the accumulated cost of shortcuts and poor
decisions. Like financial debt, it has principal (the original shortcut) and
interest (the ongoing cost of maintaining the shortcut and working around it).

**How it accumulates:**

```
Week 1: "We'll hardcode the database URL for now — we can make it configurable later."
         Interest: every new environment needs a code change instead of a config change.

Week 3: "We'll put this validation directly in the route handler — we'll move it later."
         Interest: validation is now duplicated in 5 handlers; a rule change requires 5 edits.

Week 5: "We'll access the global variable directly — we'll encapsulate it later."
         Interest: any test that modifies the global affects every other test.

Month 3: A senior developer estimates a 2-week feature. It takes 6 weeks.
          4 weeks was interest on accumulated debt.
```

**The Big Ball of Mud:**

The Big Ball of Mud is the end state of a codebase with unrestricted debt.
Everything depends on everything. No module can be changed without examining
the whole codebase. Estimates are meaningless because no one knows what a
change will break. Onboarding takes months because there are no boundaries
to explain.

It is called a "Big Ball of Mud" because it has the same structural properties:
amorphous, undifferentiated, and gets bigger but never better organised.

**Why debt is rational in the short term:**

"We'll fix it later" is rational when:
- You are exploring — you do not know yet what the right design is
- The deadline is real — the debt will be paid before it accrues interest
- The scope is contained — the shortcut affects only a small, bounded area

It becomes irrational when:
- "Later" never arrives — the shortcut becomes permanent
- The scope grows — a "temporary" global becomes used everywhere
- Debt compounds — shortcuts build on shortcuts until the system is incomprehensible

**Canonical example:** Technical debt is like deferred home maintenance.
Not fixing a small roof leak in year 1 (cheap) leads to water damage in year 2,
structural damage in year 3, and a total roof replacement in year 4 (expensive).
Each year of deferral increases the cost.

---

### The Questions Architecture Answers

Every architectural decision answers one or more of these questions:

1. **Which module can import which other module?**
   *Domain cannot import Infrastructure. Application can import both.*

2. **How does information flow between modules?**
   *Domain emits events. Infrastructure listens and reacts.*

3. **What changes together?**
   *Business rules change when the business changes. Database schema changes when the data model changes.*

4. **What is stable and what is volatile?**
   *Business rules are stable. Database technology is volatile.*

5. **What can be replaced without touching anything else?**
   *The database implementation can be replaced without touching the domain.*

The next six lessons each answer these questions differently — each architecture
is a different set of decisions.

---

## Step 1 — Diagnose an Architecture

Read this fictional module structure and identify the architectural problems:

```ts
// contact-manager.ts — contains everything:

import * as mongoose from 'mongoose';
import * as express   from 'express';
import * as bcrypt    from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as fs         from 'fs';

// ── Database model ───────────────────────────────────────────────────

const ContactSchema = new mongoose.Schema({
  name:     String,
  email:    String,
  password: String,
});
const Contact = mongoose.model('Contact', ContactSchema);

// ── Business logic ───────────────────────────────────────────────────

async function registerContact(name: string, email: string, password: string) {
  const hashed = await bcrypt.hash(password, 10);        // depends on bcrypt
  const contact = new Contact({ name, email, password: hashed }); // depends on mongoose
  await contact.save();                                   // depends on database

  const transporter = nodemailer.createTransporter(/* ... */);
  await transporter.sendMail({                            // depends on nodemailer
    to: email,
    subject: 'Welcome',
    text: `Hello ${name}`,
  });

  fs.appendFileSync('audit.log', `${Date.now()} REGISTER ${email}\n`); // depends on fs

  return contact;
}

// ── HTTP routes ───────────────────────────────────────────────────────

const app = express();
app.post('/contacts', async (req, res) => {              // depends on express
  const { name, email, password } = req.body;
  const contact = await registerContact(name, email, password);
  res.json(contact);
});
```

### SAVE AND TRY

There is nothing to run for this lesson — it is analysis. Write your answers:

1. How many external dependencies does `registerContact` have?
2. If you want to send a Slack notification instead of an email, what do you change?
3. If you want to test `registerContact` without a database, what is the minimum setup?
4. If you switch from MongoDB to PostgreSQL, how many lines of this file change?

**Expected answers:**

1. Four: `bcrypt`, `mongoose`, `nodemailer`, `fs` (and implicitly `express` sets up the context)
2. You change `registerContact` — which means also re-testing all the database and logging logic
3. You need a running MongoDB instance — there is no way to test the business logic in isolation
4. Most of it — the `Contact` model, the `contact.save()` call, any query-building code

**Change something:** Sketch (on paper or in a comment) how you would split
this into three files:
- `contact-domain.ts` — business rules only (no database, no email, no HTTP)
- `contact-repository.ts` — database operations
- `contact-routes.ts` — HTTP handlers

What would `contact-domain.ts` import? What would import it?

---

## 🎯 Challenge: Count the Coupling

**You know:** Coupling, cohesion, the dependency rule.

**Task:** Look at the `import` statements in any file from Topic 1 (or the
CNC-SIM app if accessible). For each file:

1. Count the number of `import` statements
2. Classify each import as: domain (business logic), infrastructure (database, HTTP, file system), or utility (generic helpers)
3. If a domain file imports infrastructure, that is a coupling violation
4. Write a one-paragraph description of the architecture you observe:
   - What is the most tightly coupled file?
   - What is the most loosely coupled file?
   - What one change would most improve the architecture?

**This is not a code task — it is a reading task.** Software engineers spend
more time reading and analysing code than writing it. This skill matters.

---

## Final Check

| Concept | Check yourself |
|---|---|
| Architecture definition | Say it without looking: "Architecture is the set of decisions about..." |
| Coupling | Name one symptom of high coupling in a real codebase you have seen |
| Cohesion | Name one example of a low-cohesion module you have encountered |
| Dependency rule | Draw the layer diagram from memory |
| Technical debt | Give one example of a "shortcut" you have made or seen |

---

## Quick Check Answers

**1. `UserService` and `Database` import each other — what is wrong?**

This is a circular dependency. Module A depends on Module B depends on Module A.
This causes problems: (1) module loaders struggle with circular imports — the
first module to load sees an incomplete second module, causing hard-to-debug errors,
(2) neither module can be tested without the other — they are indistinguishable,
(3) you cannot change one without considering the other. Circular dependencies
are always a sign that either the boundary between modules is drawn incorrectly,
or one of the modules is doing too much (low cohesion).

**2. A change to `email` in the database requires changes in 12 files — what does this tell you?**

The architecture has high coupling between the database schema and application
code. The `email` field is not encapsulated behind an interface or abstraction —
it is accessed directly in 12 places. In a well-designed system, the `email`
field would be accessed only through a repository or data access object.
A schema change would require updating only the repository — 1 file, not 12.
This is also a sign of violating the dependency rule: application code is coupled
directly to infrastructure (the database schema).

**3. What is the "debt" in "technical debt"?**

The metaphor is from finance. Financial debt: you borrow money now and pay it
back later with interest. Technical debt: you take a shortcut now (borrow development
velocity) and pay it back later in maintenance cost (interest). The interest
accrues continuously — the shortcut that saves 2 hours today may cost 2 hours
every month in workarounds, confusion for new developers, and accumulated risk.
Like financial debt, small amounts are manageable and sometimes rational.
Large, unchecked amounts compound and eventually consume all available capacity —
no new features can be added because all time is spent paying interest.
