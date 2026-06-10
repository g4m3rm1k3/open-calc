# Junior to Senior — T2·L5 — Modular Monolith vs Microservices

**Prerequisites:** T2·L4 (Event-Driven Architecture). You understand how
components can communicate without direct coupling. This lesson covers the
deployment architecture decision: one deployable unit or many?

**What this lab adds:**
- What a monolith actually is (not necessarily bad)
- What microservices actually are (not necessarily good)
- The distributed systems tax — the hidden cost of microservices
- The modular monolith — strong boundaries without network overhead
- When to split a monolith and when not to
- The strangler fig pattern — the safe migration path

**Time:** 45–60 minutes (reading and analysis)

---

> **Quick Check — try to answer before reading:**
>
> 1. A developer says "our monolith is a Big Ball of Mud, we should move to
>    microservices." Is the Big Ball of Mud caused by being a monolith?
> 2. Microservices communicate over a network. Name three things that can go
>    wrong that cannot go wrong in a monolith.
> 3. Two teams own two microservices. Service A needs a field from Service B.
>    What must happen before either team can ship?
>
> *(Answers at the end of this lab)*

---

## The Monolith Misconception

"Monolith" has become a dirty word. Developers say "we have a monolith" the
same way they say "we have a problem." This is wrong.

**A monolith is just a single deployable unit.** A single executable, a single
process, a single deployment. That is the entire definition.

A monolith can be:
- A Big Ball of Mud (terrible) — everything tightly coupled, no structure
- A well-structured layered application (fine) — clear layers, testable
- A modular monolith (good) — strong module boundaries, deployable as one unit

The Big Ball of Mud is caused by lack of architectural discipline — not by
being a monolith. You can have a Big Ball of Mud with 50 microservices.
Each service is its own ball of mud, and they are tangled together through
network calls.

---

### Concept: What Microservices Actually Cost

**What it is:** Microservices decompose a system into independently deployable
services that communicate over a network. Each service owns its own data store.

**The benefits (real, but conditional):**

- Independent deployment: Team A can ship without waiting for Team B
- Independent scaling: scale only the services that need it
- Technology choice: each service uses the best tool for its job
- Fault isolation: one service failing does not crash everything

**The distributed systems tax (the costs nobody mentions):**

Every call between microservices becomes a network call. Network calls introduce:

1. **Latency** — a local function call takes nanoseconds; a network call takes milliseconds
2. **Failure modes** — networks fail, time out, deliver messages out of order, deliver them twice
3. **Distributed transactions** — updating two services atomically requires two-phase commit or saga patterns (extremely complex)
4. **Service discovery** — services must find each other (DNS, service mesh, registry)
5. **API versioning** — services must maintain backward compatibility; breaking changes require coordinated releases
6. **Observability** — a single request can touch 10 services; tracing it requires distributed tracing infrastructure
7. **Operational complexity** — instead of deploying one thing, you deploy 30 things with interdependencies

**The question to ask:**

> "Is the problem we are solving worth paying the distributed systems tax?"

For a startup with 3 engineers: almost certainly no.
For a FAANG company with 3,000 engineers, 100 teams, and global traffic: possibly yes.
For a CAD/CAM application: probably not until the user base demands it.

**Canonical example:** Microservices are like separate restaurants instead of one kitchen.
Each restaurant (service) specialises, operates independently, and can expand its
dining room without affecting others. But customers (requests) must travel between
restaurants if they want multiple courses. Each travel introduces delay, traffic jams
(network failures), and the risk of one restaurant being closed (service unavailable).

---

### Concept: The Modular Monolith

**What it is:** A modular monolith deploys as a single unit but has strong
internal module boundaries — each module owns its data, exposes a clean API,
and does not allow other modules to reach into its internals.

```
┌──────────────────────────────────────────────────────┐
│  One deployable unit (one process)                   │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Contacts   │  │  Toolpaths   │  │  Projects  │ │
│  │   Module     │  │   Module     │  │   Module   │ │
│  │              │  │              │  │            │ │
│  │ contacts_db  │  │ toolpaths_db │  │ projects_db│ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬─────┘ │
│         │                 │                  │       │
│         └─────────────────┴──────────────────┘       │
│                   EventBus (in-process)               │
└──────────────────────────────────────────────────────┘
```

Each module:
- Has its own code and its own data store (or separate schema/tables)
- Exposes a public API (interfaces or module boundaries)
- Does not allow other modules to query its database directly
- Communicates via events or through its public API

**The advantages over microservices:**

- No network calls between modules (in-process is nanoseconds, not milliseconds)
- Atomic transactions across modules are trivial (same database)
- One deployment, one monitoring system, one CI/CD pipeline
- Full IDE refactoring across module boundaries

**The advantages over a Ball of Mud:**

- Boundaries are explicit — other modules cannot reach into your data
- Changes are isolated — touching Contacts does not break Toolpaths
- Teams can own modules without stepping on each other

**The migration path:**

A modular monolith is a microservices system with zero network calls.
If a module later needs to be extracted as a service (because it genuinely
needs independent scaling or deployment), the boundary is already clean —
you add a network call and deploy separately. No refactoring needed.

---

### Concept: The Strangler Fig Pattern

**What it is:** The strangler fig is a safe migration strategy for evolving
a legacy system. New features are built as separate, well-structured modules.
The old code continues to run. Over time, new modules replace old functionality
incrementally — like a strangler fig tree that grows around a host tree until
the host is fully replaced.

**Why you don't do a big rewrite:**

Every "let's rewrite it from scratch" project in history has failed or taken
10× longer than estimated. The reason: the original system has years of
accumulated business logic, edge case handling, and bug fixes that are not
documented anywhere — only in the working code. A rewrite starts from scratch
and re-discovers every edge case the hard way.

**The strangler fig approach:**

```
Month 1: New contact creation goes to the new Contacts module.
         Old contact reading still uses legacy code.

Month 2: New contact reading goes to the new module.
         Legacy code is still running but no new traffic.

Month 3: Legacy contact code is deleted.
         New module handles 100% of contact operations.

Month 4: Repeat for Toolpaths module.
```

Each step is small, reversible, and verifiable. If month 2 breaks reading,
you route back to legacy code. The system is never down, never completely
rewritten.

**You will see this again in:** Any large system migration. The strangler fig
is the standard safe approach for legacy system evolution.

---

## Step 1 — Build a Modular Monolith

This step demonstrates the structure — the key is the module boundaries,
not a large amount of code.

Create `modular-monolith.ts`:

```ts
// ══════════════════════════════════════════════════════════════════════
// MODULE 1: CONTACTS — owns contact data, exposes public API
// Other modules CANNOT access contactsDb directly
// ══════════════════════════════════════════════════════════════════════

const contactsDb: Map<string, { id: string; name: string; email: string }> = new Map();

// The public API of the Contacts module:
const ContactsModule = {
  create(name: string, email: string): { id: string; name: string; email: string } {
    const contact = { id: `c-${Date.now()}`, name, email };
    contactsDb.set(contact.id, contact);
    eventBus.emit('contacts.contact_created', contact);  // notify other modules
    return contact;
  },

  findById(id: string): { id: string; name: string; email: string } | undefined {
    return contactsDb.get(id);
  },
};

// ══════════════════════════════════════════════════════════════════════
// MODULE 2: PROJECTS — owns project data, uses contacts via public API
// Cannot query contactsDb directly — uses ContactsModule.findById()
// ══════════════════════════════════════════════════════════════════════

const projectsDb: Map<string, { id: string; name: string; ownerId: string }> = new Map();

const ProjectsModule = {
  create(name: string, ownerId: string): { id: string; name: string; ownerId: string } {
    // Validate ownerId exists — via the Contacts module's public API:
    const owner = ContactsModule.findById(ownerId);
    if (!owner) throw new Error(`Contact ${ownerId} not found`);

    const project = { id: `p-${Date.now()}`, name, ownerId };
    projectsDb.set(project.id, project);
    return project;
  },
};

// ══════════════════════════════════════════════════════════════════════
// IN-PROCESS EVENT BUS — modules communicate without direct coupling
// ══════════════════════════════════════════════════════════════════════

const eventBus = {
  handlers: new Map<string, Array<(p: unknown) => void>>(),

  on(event: string, handler: (p: unknown) => void): void {
    const existing = this.handlers.get(event) ?? [];
    this.handlers.set(event, [...existing, handler]);
  },

  emit(event: string, payload: unknown): void {
    (this.handlers.get(event) ?? []).forEach(h => h(payload));
  },
};

// Audit module listens for contacts events:
eventBus.on('contacts.contact_created', (contact: unknown) => {
  const c = contact as { name: string; email: string };
  console.log(`[Audit] New contact: ${c.name} <${c.email}>`);
});

// ── Demo ──────────────────────────────────────────────────────────────

const alice = ContactsModule.create('Alice', 'alice@example.com');
console.log('Created contact:', alice.id);

const project = ProjectsModule.create('CNC Part 001', alice.id);
console.log('Created project:', project.name, 'for owner:', alice.name);

try {
  ProjectsModule.create('Invalid Project', 'nonexistent-id');
} catch (error) {
  console.log('Error:', (error as Error).message);
}
```

### SAVE AND TRY

```bash
npx ts-node modular-monolith.ts
```

Expected:
```
[Audit] New contact: Alice <alice@example.com>
Created contact: c-1234567890
Created project: CNC Part 001 for owner: Alice
Error: Contact nonexistent-id not found
```

**Change something:** Try accessing `contactsDb` directly from `ProjectsModule`
instead of `ContactsModule.findById()`. It works (TypeScript does not enforce
module boundaries in this simple version) — but doing so breaks the encapsulation.
In a real codebase, TypeScript's `private` or a strict module system enforces this.

---

## 🎯 Challenge: Design a Split

**You know:** Monolith vs microservices, modular monolith, the distributed systems tax.

**Task:** You are advising a small team (3 engineers) building a CAD/CAM
application. They are starting from scratch. Answer these questions in writing
(not code):

1. Should they start with a modular monolith or microservices? Give three reasons.

2. The CAD/CAM application has these modules:
   - Contacts (users, authentication)
   - Geometry (CAD drawings, files)
   - Toolpaths (CAM operations)
   - Projects (grouping geometry and toolpaths)
   - Machine Management (CNC machine configs)

   Draw the modular monolith architecture: which modules communicate through
   which mechanism (direct API call, event bus, or shared database access)?

3. Six months later, Toolpath computation becomes extremely CPU-intensive.
   It is slowing down the entire application. Describe the strangler fig
   migration: how do you extract Toolpaths as a separate process without
   rewriting everything?

**This is a design exercise — there is no single correct answer.** The goal
is to reason about trade-offs.

---

<details>
<summary>▶ Show Solution (one valid answer)</summary>

**1. Start with a modular monolith — three reasons:**

1. Three engineers cannot maintain 5+ deployment pipelines, service meshes,
   distributed tracing, and API versioning while also building features.
   The overhead would consume more than half their time.

2. You do not yet know which module will need independent scaling.
   Prematurely splitting Toolpaths as a service is premature optimisation.
   Build the monolith, measure, then split what actually needs it.

3. Module boundaries in a modular monolith are refactorable. If you discover
   that Geometry and Projects should be merged, you refactor in-process.
   In microservices, this requires migrating databases, updating API contracts,
   and coordinating two deployment pipelines.

**2. Module communication:**

```
Contacts ← (Auth middleware) — all modules check authentication
Projects ← (direct API) — reads Contacts.findById() for owner info
Geometry ← (event bus) — listens for 'project.created' to initialise geometry store
Toolpaths ← (direct API) — reads Geometry to generate toolpaths
Toolpaths ← (event bus) — emits 'toolpath.completed' when done

NO module accesses another module's database directly.
```

**3. Strangler fig for Toolpaths:**

Step 1: Extract toolpath computation into a function that takes plain data
(no database access) and returns results. This function is now portable.

Step 2: Wrap the function with a message queue consumer (e.g. Redis queue).
The monolith enqueues toolpath jobs; the worker function (still in the same
process) dequeues and processes them.

Step 3: Move the worker to a separate Node.js process. It reads from the same
Redis queue. The monolith is unchanged — it still enqueues.

Step 4 (if needed): Move the worker to a separate server. Add horizontal
scaling by running multiple workers.

At no point is the CAD/CAM application down. No full rewrite occurred.
Each step is independently deployable and reversible.

**Key insight:** The strangler fig works because Step 1 created a clean boundary
(the pure function) before any migration happened. Having a testable, importable
function makes Steps 2-4 trivial.

</details>

---

## Final Check

| Concept | Check yourself |
|---|---|
| Monolith definition | State it without "bad" in the sentence |
| Distributed systems tax | Name 4 of the 7 costs listed |
| Modular monolith rule | "Modules must not access each other's..." (complete it) |
| Strangler fig | Describe it in one sentence to someone who hasn't read the lesson |
| Split criteria | "Extract a microservice when..." (complete with a real condition) |

---

## Quick Check Answers

**1. Is a Big Ball of Mud caused by being a monolith?**

No. A Big Ball of Mud is caused by the absence of architectural discipline —
no module boundaries, no encapsulation, no clear ownership of data. These
problems exist regardless of deployment topology. A distributed system with
50 microservices that all share the same database, call each other in circular
patterns, and have no clear domain boundaries is a distributed Big Ball of Mud.
Splitting a monolith without first establishing clean boundaries moves the mud
from one container to fifty — it does not clean it up.

**2. Three things that can go wrong with network calls that cannot go wrong in-process?**

1. **Network timeout** — the remote service takes too long or becomes unreachable.
   In-process calls never time out.
2. **Partial delivery / duplicate delivery** — a message is lost or delivered
   twice. In-process function calls always execute exactly once.
3. **Distributed transaction failure** — updating two services atomically requires
   distributed transaction protocols (two-phase commit, saga). In a monolith,
   a database transaction is trivially atomic.

**3. What must happen before either team can ship a cross-service change?**

Both teams must agree on and deploy a compatible API contract simultaneously
(or in a backwards-compatible sequence). If Team A's Service needs a new field
from Team B's Service, Team B must add the field to their API first, deploy
to production, and then Team A can ship their change. This is called a
"deployment dependency" — one team's release blocks on another's. In a monolith,
both changes go into the same codebase and ship together with no coordination
overhead.
