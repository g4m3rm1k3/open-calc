# SE Masterclass — LAB-101 — Capstone Design

**Prerequisites:** LAB-100 (Job Scheduler) — all of Phase 8

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why should architecture decisions be written down *before* any code exists, rather than discovered by starting to type?
2. What makes an interface contract different from just "the shape of a function's parameters"?
3. Why is "distributed" doing real work in "distributed task runner," rather than being a buzzword — what specifically becomes distributed?

## What You Will Design

A written design document for **Riverbed** — a distributed task runner where clients submit task pipelines (defined in a small DSL), a server persists and schedules them, a pool of workers executes them, and a live dashboard shows progress in real time. By the end of this lab, nothing is implemented — but every component, every interface between components, and every major trade-off will be decided and written down, so LAB-102 is pure execution against a plan rather than design-while-coding.

```
Client (writes .task file)
   |
   v
Task DSL Parser (Phase 7) --> Task AST
   |
   v
REST API (Phase 4) --submit--> SQLite (Phase 5, with migrations)
   |                              |
   v                              v
WebSocket feed <---- Worker Pool (Phase 6 ECS-style) ----> pulls queued tasks, executes, reports progress
   |
   v
Dashboard (Phase 3) -- live task status, reusing LAB-41/42/43's component patterns
```

## Concept: System Design — Decisions Before Implementation

**What it is:** System design is the act of deciding a system's components, the contracts between them, and the trade-offs those decisions imply — all *before* writing implementation code. A component map names the pieces and what each owns. An interface contract specifies exactly what crosses each boundary (a REST endpoint's request/response shape, a WebSocket message's schema, a DSL's grammar) independent of how either side happens to implement it. A trade-off analysis names what was given up for what was gained, explicitly, instead of leaving it as an unstated assumption.

**The problem before:** Every previous lab in this curriculum designed *and* built in the same breath, because each one taught a single, bounded concept — there wasn't much to decide beyond "how do I implement this one idea." A capstone spanning five phases' worth of skills has real architectural choices with genuine trade-offs: should the worker pool live in the same process as the API server, or be genuinely separate processes (LAB-92)? Should task state live only in memory, or be persisted so a server restart doesn't lose in-flight work (LAB-56, LAB-59)? Committing to code before deciding these produces exactly the kind of tangled, hard-to-untangle system this entire curriculum has been teaching you to avoid — LAB-18's SOLID principles, LAB-19's composition-over-inheritance, all of it assumes some prior thought about boundaries.

**The solution:** Write the design down as artifacts a human (or a future version of yourself) could review and critique *before* any code exists — a component map, one interface contract per component boundary, and an explicit list of trade-offs with the reasoning for each choice. This lab produces those artifacts. LAB-102 executes against them.

**Canonical example:**

```typescript
// An interface contract is written and agreed on BEFORE either side is implemented:
interface SubmitTaskRequest { name: string; dslSource: string }
interface SubmitTaskResponse { taskId: string; status: "queued" }
// POST /tasks -> SubmitTaskResponse
```

**Project Application:** Every artifact this lab produces is what LAB-102 builds against, directly — the component map becomes the project's folder structure, each interface contract becomes a concrete API/schema/grammar, and the trade-off list becomes the "why we built it this way" documentation LAB-103 revisits during review.

**Watch for:** Designing components around *implementation technology* ("the Node.js part," "the Python part") instead of *responsibility* ("the part that persists task state," "the part that executes tasks"). The former couples the design to a specific tech stack the moment it's written; the latter stays valid even if a later decision swaps SQLite for Postgres, or Node for Python — a design should describe *what* each piece does before *how*.

## Step 1: The component map

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Task DSL       │     │   REST API +      │     │   SQLite +       │
│   (Phase 7)       │────>│   WebSocket        │<───>│   Migrations     │
│   parses .task    │     │   (Phase 4)        │     │   (Phase 5)       │
│   files to AST     │     │   owns HTTP/WS      │     │   owns durable    │
└─────────────────┘     │   surface           │     │   task state      │
                          └──────────────────┘     └─────────────────┘
                                    │                          ^
                                    v                          │
                          ┌──────────────────┐                │
                          │   Worker Pool      │────────────────┘
                          │   (Phase 6 ECS)    │  claims + executes
                          │   entities=tasks    │  queued tasks
                          └──────────────────┘
                                    │
                                    v
                          ┌──────────────────┐
                          │   Dashboard         │
                          │   (Phase 3)         │
                          │   subscribes to WS   │
                          └──────────────────┘
```

Five components, each owning exactly one responsibility: the DSL owns *parsing task definitions into structured data*; the API owns *the network surface* (nothing about task execution logic); SQLite+migrations owns *durable state*; the worker pool owns *executing tasks and reporting progress*; the dashboard owns *presenting live state to a human*. This is LAB-18's Single Responsibility Principle applied at the scale of whole components instead of individual classes — and it's deliberately named by responsibility (per this lab's "watch for"), not by "the Node part" or "the browser part."

### SAVE AND TRY

For each of the five components above, write one sentence answering "what would have to change in every *other* component if I swapped this one's implementation technology entirely?" (e.g., "if SQLite became Postgres, does the API layer's code need to change?"). If the honest answer for any component is "yes, extensively," that component's boundary is drawn in the wrong place — revisit it before moving to Step 2.

## Step 2: Interface contracts — the Task DSL grammar

Reusing LAB-86's "write examples before designing the grammar" discipline directly:

```
task build_and_test {
  step compile { run "tsc --noEmit" }
  step test depends compile { run "npm test" }
  step lint { run "eslint src/" }
}
```

```
program   := task
task      := "task" IDENTIFIER "{" step* "}"
step      := "step" IDENTIFIER ("depends" IDENTIFIER)? "{" "run" STRING "}"
```

This is deliberately close to LAB-86's TaskLang — the capstone doesn't need to reinvent a DSL design from nothing; it needs to *extend* a design already proven to work for exactly this problem shape (named steps, dependencies, commands to run). The AST this grammar produces is what crosses the boundary from "DSL parser" to "REST API" in Step 3's contract below — `Task DSL` never needs to know about HTTP, SQLite, or workers at all.

### SAVE AND TRY

Write two more example `.task` programs (a single-step task, and one where two steps both depend on the same earlier step — a diamond dependency) and confirm the grammar above covers both without any grammar change — the same "example-first, then grammar" validation LAB-86 demonstrated is just as valid here, at capstone scale.

## Step 3: Interface contracts — the REST API and WebSocket protocol

```typescript
// REST: submitting a task
interface SubmitTaskRequest { name: string; dslSource: string }
interface SubmitTaskResponse { taskId: string; status: "queued" }
// POST /tasks -> 201 SubmitTaskResponse

interface TaskStatusResponse {
  taskId: string
  name: string
  status: "queued" | "running" | "completed" | "failed"
  steps: { name: string; status: "pending" | "running" | "completed" | "failed"; output?: string }[]
}
// GET /tasks/:id -> 200 TaskStatusResponse

// WebSocket: live progress, pushed by the server, not polled by the client
interface StepProgressEvent {
  type: "step-progress"
  taskId: string
  stepName: string
  status: "running" | "completed" | "failed"
  output?: string
}
```

Every field here was decided by asking "what does the *other* side of this boundary actually need to know, and nothing more" — `TaskStatusResponse` includes per-step status because the dashboard (Step 1's component map) needs to render a step-by-step view, not because it happens to be convenient for the API's internal implementation. This is the same discipline LAB-45's REST API design and LAB-51's WebSocket message shapes (Phase 4) already established — reused here, not reinvented.

### SAVE AND TRY

For `StepProgressEvent`, write down exactly which component (from Step 1's map) is responsible for *creating* this event, and which is responsible for *consuming* it. If more than one component could plausibly create it, or the consumer needs information this shape doesn't carry, that's a contract gap worth fixing now — a design-time question — rather than an integration bug discovered in LAB-102.

## Step 4: Trade-off analysis — naming the real decisions

| Decision | Chosen | Alternative | Why |
|---|---|---|---|
| Worker execution model | Separate OS processes (LAB-92) | In-process async tasks | Real isolation — one crashing task can't take down the API server |
| Task state persistence | SQLite from the start (LAB-56–59) | In-memory only | A server restart shouldn't silently lose in-flight or queued tasks |
| Worker-to-server communication | Poll SQLite for queued work | Push via a message queue (LAB-93-style IPC) | Simpler to build correctly first; documented as a LAB-103 extension idea |
| Dashboard updates | WebSocket push (LAB-51) | Client polling `GET /tasks/:id` | Real-time feel; avoids wasted requests when nothing has changed |
| Task entity model | ECS (LAB-74), tasks as entities with `Status`/`Dependencies`/`Output` components | Plain class hierarchy per task type | Tasks genuinely vary in which "traits" apply — ECS avoids a rigid hierarchy for something inherently compositional |

Every row names what was picked, what was passed over, and the actual reasoning — not "because it's better" but the specific property that mattered (isolation, durability, simplicity, real-time feel, compositional flexibility). This table is the artifact LAB-103 will revisit and potentially challenge once real implementation experience (LAB-102) has tested whether these predictions held up.

### SAVE AND TRY

Add a sixth row to this table for a decision this lab's design *hasn't* made yet — for example, "what happens if two workers try to claim the same queued task at once?" (a real synchronization question, LAB-94-shaped). Write the chosen approach and the alternative you're passing over, with your reasoning, before LAB-102 forces the question by way of an actual race condition.

## 🎯 Challenge

Draft the SQLite schema (tables and columns, no migration code yet) for `tasks` and `steps`, informed directly by Step 3's `TaskStatusResponse` contract — every field the API needs to return must be derivable from this schema, and nothing in the schema should exist that the API contract never surfaces.

<details>
<summary>Solution</summary>

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dsl_source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  created_at INTEGER NOT NULL
);

CREATE TABLE steps (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  name TEXT NOT NULL,
  depends_on TEXT, -- nullable: a step name, or NULL for no dependency
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  output TEXT
);
```

Every column traces back to a field `TaskStatusResponse` (Step 3) needs to populate — `steps.output` exists because `TaskStatusResponse.steps[].output` is part of the contract; nothing extra was added "just in case." This is the schema-design discipline LAB-56 established (model exactly what the domain needs) applied here with the *API contract itself* as the concrete definition of "what the domain needs," rather than an abstract judgment call.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Component boundaries | Drawn around implementation tech | Drawn around responsibility |
| Interface contracts | Discovered while wiring two pieces together | Written and agreed on before either side is built |
| Trade-offs | Left as unstated defaults | Written down explicitly, with the reasoning |
| Where this lab's output goes | A document nobody reads again | The literal blueprint LAB-102 builds against |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why is "the worker pool" named by responsibility rather than "the Python part" or "the Node part"? | |
| 2 | What would make an interface contract incomplete, even if every field currently has a type? | |
| 3 | Why does the trade-off table need a stated *reason* for each decision, not just the decision itself? | |

## Quick Check Answers

1. Design decisions made verbally or "in your head" are invisible to review, easy to silently contradict later, and impossible for a collaborator (or future you) to critique before real effort has gone into implementation — writing them down first turns them into something that can be checked against reality and revised cheaply.
2. It specifies the complete shape of data crossing a component boundary — every field, its meaning, and which side produces versus consumes it — independent of either side's internal implementation, unlike a function signature, which only describes one specific call site within one specific codebase.
3. "Distributed" here means the worker pool executes tasks as genuinely separate OS processes (LAB-92), potentially even on separate machines, communicating with the API/database only through explicit contracts (REST, WebSocket, shared SQLite) — not sharing memory, not running inside the same process as the API server.

*Next: [LAB-102 — Capstone Build](LAB-102-capstone-build.md)*
