# SE Masterclass — LAB-102 — Capstone Build

**Prerequisites:** LAB-101 (Capstone Design)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why build the DSL parser and the database schema before the dashboard, rather than starting with whatever feels most visually satisfying first?
2. When the worker pool and the API server both need to know "is this task still queued," why does SQLite — not an in-memory variable in either process — have to be the source of truth?
3. Why does integrating five phases' worth of components tend to surface bugs that none of the individual components had on their own?

## What You Will Build

The full implementation of Riverbed, Phase 9's distributed task runner — every component from LAB-101's design, built in dependency order (innermost/most-depended-upon first), integrated into one working system you can submit a `.task` file to and watch execute live in a browser dashboard.

```
$ riverbed submit build_and_test.task
Task queued: a3f9c112

$ open http://localhost:3000
[dashboard shows: compile (running) -> test (pending) -> lint (pending)]
... a few seconds later ...
[dashboard shows: compile (done) -> test (running) -> lint (running)]
... 
[dashboard shows: compile (done) -> test (done) -> lint (done) -- task complete]
```

## Concept: Full-Stack Integration — All Phases Combined

**What it is:** Integration is where independently-correct components meet and either compose cleanly — because their contracts (LAB-101) were well-specified — or reveal that a contract had a gap nobody noticed until two real implementations tried to talk through it. Building in **dependency order** (the DSL parser has no dependencies on anything else in the system; the dashboard depends on everything) means each new piece can be tested against real, working pieces beneath it, rather than against mocks that might not reflect reality.

**The problem before:** Every lab in Phases 1–8 was built and tested in isolation — a lexer tested against hand-written token expectations, a WebSocket server tested against a hand-written client script, an ECS tested with a handful of manually created entities. None of that isolation testing catches integration bugs: what happens when the *real* frontend (Phase 3 patterns) subscribes to the *real* WebSocket server (Phase 4 patterns) which is relaying updates from the *real* worker pool (Phase 6 patterns) reading from the *real* database (Phase 5 patterns)? Each piece can be flawless alone and the seams between them can still be wrong.

**The solution:** Build bottom-up against LAB-101's contracts, integration-testing each new layer against the *real* layer beneath it as soon as it exists — the DSL parser first (no dependencies), then the database schema and migrations, then the REST/WebSocket API (depends on the database), then the worker pool (depends on the database and DSL parser), then the dashboard (depends on the API). This lab is organized in exactly that order.

**Canonical example:**

```typescript
// Every layer is verified against the REAL layer beneath it, not a mock:
const ast = parseTaskDsl(fileContents)          // Layer 1, standalone
const taskId = await db.insertTask(ast)          // Layer 2, tested against Layer 1's real output
const response = await fetch(`/tasks/${taskId}`)  // Layer 3, tested against Layer 2's real row
```

**Project Application:** This lab *is* the project — every earlier lab in this curriculum was preparation for exactly this kind of integration. The specific reuse map: LAB-86 (DSL) → Layer 1; LAB-56/57/59/64 (SQLite, indexing, transactions, migrations) → Layer 2; LAB-45/51 (REST, WebSocket) → Layer 3; LAB-74/92/97 (ECS, processes, lifecycle) → Layer 4; LAB-33/34/41 (components, state, recursive views) → Layer 5.

**Watch for:** Skipping straight to the dashboard because it's the most visually rewarding part to build. Without the lower layers actually working first, the dashboard has nothing real to display — and debugging "the dashboard shows nothing" when the bug is actually three layers down, in the worker pool, is far harder than debugging each layer against real data as you go.

## Layer 1: The Task DSL (extending LAB-86)

```typescript
// Reuses LAB-86's tokenizer/parser shape, extended for nested step blocks
interface TaskStep { name: string; dependsOn: string | null; command: string }
interface ParsedTask { name: string; steps: TaskStep[] }

function parseTaskDsl(source: string): ParsedTask {
  const tokens = tokenizeTaskDsl(source) // LAB-86 Step 2's tokenizer, extended with nested braces
  return parseTaskTokens(tokens)          // LAB-86 Step 3's recursive descent, extended one level deeper
}
```

This layer has zero dependencies on anything else in the system — no database, no network, no UI — which is exactly why it comes first: it can be fully built and unit-tested (LAB-27-style, if you want real test coverage) in complete isolation, the same way LAB-86's TaskLang was tested standalone before this capstone ever needed it.

### SAVE AND TRY

Parse the example `.task` file from LAB-101 Step 2 and confirm the resulting `ParsedTask` has 3 steps with `test`'s `dependsOn` correctly set to `"compile"` — verified with zero other system components running, exactly the isolated-layer testing this lab's concept section described.

## Layer 2: Persistence — SQLite schema, migrations, and the queued-task query

```typescript
// migrations/001_initial.sql -- LAB-64's migration technique
// CREATE TABLE tasks (...) / CREATE TABLE steps (...)  -- from LAB-101's Challenge schema

async function insertTask(db: Database, parsed: ParsedTask, dslSource: string): Promise<string> {
  const taskId = crypto.randomUUID()
  await db.run(
    "INSERT INTO tasks (id, name, dsl_source, status, created_at) VALUES (?, ?, ?, 'queued', ?)",
    [taskId, parsed.name, dslSource, Date.now()]
  )
  for (const step of parsed.steps) {
    await db.run(
      "INSERT INTO steps (id, task_id, name, depends_on, status) VALUES (?, ?, ?, ?, 'pending')",
      [crypto.randomUUID(), taskId, step.name, step.dependsOn]
    )
  }
  return taskId
}

async function claimNextQueuedTask(db: Database): Promise<string | null> {
  // A transaction (LAB-59) so two workers polling simultaneously can't both claim the same task
  return db.transaction(async (tx) => {
    const row = await tx.get("SELECT id FROM tasks WHERE status = 'queued' ORDER BY created_at LIMIT 1")
    if (!row) return null
    await tx.run("UPDATE tasks SET status = 'running' WHERE id = ?", [row.id])
    return row.id
  })
}
```

`claimNextQueuedTask` wrapping its read-then-update in a transaction is this lab's answer to LAB-101 Step 4's unresolved trade-off row ("what happens if two workers claim the same task?") — the transaction makes "read the oldest queued task, then mark it running" atomic, so two workers racing to call this function at the same instant can't both walk away believing they claimed the same task, the exact same correctness guarantee LAB-59's bank-transfer example demonstrated for money instead of tasks.

### SAVE AND TRY

Insert three tasks, then call `claimNextQueuedTask` twice in a row (sequentially, not concurrently, for this first check) — confirm it returns two *different* task IDs, and a third call after only two tasks were left returns the correct remaining one, oldest-first (`created_at` ordering).

## Layer 3: REST API and WebSocket — the network surface

```typescript
import { WebSocketServer } from "ws" // LAB-51's ConnectionManager pattern

const wss = new WebSocketServer({ port: 8081 })
const connections = new Set<WebSocket>() // LAB-51's broadcast set

app.post("/tasks", async (req, res) => {
  const parsed = parseTaskDsl(req.body.dslSource) // Layer 1
  const taskId = await insertTask(db, parsed, req.body.dslSource) // Layer 2
  res.status(201).json({ taskId, status: "queued" }) // LAB-101's SubmitTaskResponse contract, exactly
})

app.get("/tasks/:id", async (req, res) => {
  const task = await getTaskWithSteps(db, req.params.id) // Layer 2
  res.json(task) // LAB-101's TaskStatusResponse contract, exactly
})

function broadcastProgress(event: StepProgressEvent): void {
  for (const conn of connections) conn.send(JSON.stringify(event)) // LAB-51's broadcast, unchanged
}
```

Every response shape here is the *literal* interface contract written in LAB-101 Step 3 — not "something similar," but the exact same field names and types, which is the entire payoff of having written the contract down first: there's no ambiguity left to resolve while coding, only a checklist to satisfy. `broadcastProgress` is LAB-51's `ConnectionManager` broadcast pattern, unmodified — the API layer doesn't invent new WebSocket handling, it reuses what Phase 4 already proved correct.

### SAVE AND TRY

Start this layer with Layer 2's real database (not a mock), `POST` a real `.task` file's contents to `/tasks`, and confirm `GET /tasks/:id` immediately afterward returns `status: "queued"` with all steps `status: "pending"` — a real end-to-end check of Layers 1 through 3 together, before the worker pool (which would actually execute anything) even exists yet.

## Layer 4: The Worker Pool — ECS-style task execution

```typescript
import { World } from "../phase-06.../LAB-74-ecs-architecture" // reused directly

interface TaskEntity { taskId: string }
interface StepQueue { steps: TaskStep[] } // component: which steps remain, in dependency order
interface ExecutionState { currentStepIndex: number }

function workerSystem(world: World, db: Database, broadcastFn: typeof broadcastProgress): void {
  for (const entity of world.query("taskEntity", "stepQueue", "executionState")) {
    const queue = world.getComponent<StepQueue>(entity, "stepQueue")!
    const state = world.getComponent<ExecutionState>(entity, "executionState")!
    const step = queue.steps[state.currentStepIndex]
    if (!step) continue // task fully complete -- LAB-97-style lifecycle finalization happens elsewhere

    const canRun = !step.dependsOn || queue.steps.find(s => s.name === step.dependsOn)?.status === "completed"
    if (!canRun) continue

    executeStepAsChildProcess(step, db, broadcastFn) // LAB-92's spawn, reused directly
  }
}

async function pollAndClaimLoop(db: Database, world: World): Promise<void> {
  setInterval(async () => {
    const taskId = await claimNextQueuedTask(db) // Layer 2
    if (taskId) spawnTaskEntity(world, taskId, db) // creates the ECS entity for this task
  }, 500)
}
```

The worker pool is LAB-74's `World` (ECS), unchanged in structure, populated with entities representing in-flight tasks — each task entity's `StepQueue` and `ExecutionState` components are exactly the kind of plain-data components LAB-74 designed the whole architecture around, and `workerSystem` is a system querying for entities with both, exactly LAB-74's `physicsSystem`/`renderSystem` pattern applied to task execution instead of physics or rendering. Executing a step reuses LAB-92's `spawn` directly — a step's `run "npm test"` command becomes a real child process, isolated exactly as LAB-92 argued isolation matters.

### SAVE AND TRY

Run Layer 4 against Layer 2/3's real database and API, submit the `build_and_test` task from LAB-101, and confirm — via direct database queries, before the dashboard exists — that `compile`'s step row transitions from `pending` to `running` to `completed`, and only then does `test`'s row transition out of `pending`, proving dependency ordering (Step 1's `dependsOn` field) is actually being respected by the ECS system, not just stored inertly in the database.

## Layer 5: The Dashboard — live updates in the browser

```typescript
// Reuses LAB-32's signals and LAB-41's recursive component pattern directly
function TaskDashboard(taskId: string) {
  const [task, setTask] = createSignal<TaskStatusResponse | null>(null)

  fetch(`/tasks/${taskId}`).then(r => r.json()).then(setTask) // initial state via REST

  const ws = new WebSocket("ws://localhost:8081")
  ws.onmessage = (msg) => {
    const event: StepProgressEvent = JSON.parse(msg.data)
    if (event.taskId !== taskId) return
    setTask(current => current && {
      ...current,
      steps: current.steps.map(s => s.name === event.stepName ? { ...s, status: event.status } : s),
    })
  }

  return () => StepList(task()?.steps ?? []) // LAB-33-style component function
}

function StepList(steps: TaskStatusResponse["steps"]) {
  return steps.map(step => `<div class="step ${step.status}">${step.name}: ${step.status}</div>`).join("")
}
```

The dashboard fetches initial state via REST (Layer 3's `GET /tasks/:id`) and then layers live updates on top via the WebSocket (Layer 3's `broadcastProgress`) — exactly the "REST for initial state, WebSocket for live deltas" pattern, with `createSignal` (LAB-32) driving re-renders automatically whenever `setTask` is called, no manual DOM patching required. This is the last layer built precisely because it's the only one with nothing to display until Layers 1–4 are producing real, correct data underneath it.

### SAVE AND TRY

With all five layers running together, submit a `.task` file and watch the dashboard update live as each step transitions through `pending → running → completed` — this is the full integration test: if any earlier layer has a contract mismatch, this is where it becomes visible, as a step that never updates, or updates with the wrong status.

## 🎯 Challenge

Add graceful handling for a step that fails (`run` command exits non-zero): the worker pool should mark that step `failed`, broadcast a `StepProgressEvent` with `status: "failed"`, mark the whole task `failed` in the database, and — critically — *not* attempt to run any step that depended on the failed one, leaving it `pending` forever (or, more informatively, transitioning it to a new `"blocked"` status).

<details>
<summary>Solution</summary>

```typescript
async function executeStepAsChildProcess(step: TaskStep, db: Database, broadcastFn: typeof broadcastProgress): Promise<void> {
  const child = spawn("sh", ["-c", step.command])
  let output = ""
  child.stdout.on("data", (d) => { output += d })

  child.on("exit", async (code) => {
    const status = code === 0 ? "completed" : "failed"
    await db.run("UPDATE steps SET status = ?, output = ? WHERE name = ?", [status, output, step.name])
    broadcastFn({ type: "step-progress", taskId: step.taskId, stepName: step.name, status, output })

    if (status === "failed") {
      await db.run("UPDATE tasks SET status = 'failed' WHERE id = ?", [step.taskId])
      const blocked = await db.all("SELECT name FROM steps WHERE depends_on = ?", [step.name])
      for (const b of blocked) {
        await db.run("UPDATE steps SET status = 'blocked' WHERE name = ?", [b.name])
      }
    }
  })
}
```

This directly extends Layer 4's execution path with the same "propagate failure through the dependency graph" instinct LAB-14's cycle detection and LAB-97's crash-vs-stop distinction both relied on — a failure isn't just recorded locally on the failed step, it's actively propagated to every step that depends on it, so the dashboard shows an honest picture (blocked steps, not steps silently stuck at "pending" forever with no explanation).

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Build order | Whatever's most fun first | Dependency order — innermost layer first |
| Testing each layer | Wait until everything's built to test anything | Test each layer against the real layer beneath it, as you go |
| Concurrent task claiming | Trust that races "probably won't happen" | Wrap claim logic in a transaction (LAB-59) |
| Step failure | Only mark the failed step | Propagate `blocked` status to dependent steps too |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does Layer 1 (the DSL) have zero dependencies on any other layer? | |
| 2 | Why must `claimNextQueuedTask` be wrapped in a database transaction? | |
| 3 | What kind of bug does building bottom-up, testing each layer against real lower layers, specifically prevent? | |

## Quick Check Answers

1. Building innermost dependencies first (the DSL parser, which nothing else in the system needs to exist before it can be built and tested) means every later layer can be integration-tested against something real and already working, rather than against a guess or a mock that might not match the eventual real implementation.
2. Because both the API server (handling a `POST /tasks` from a client) and the worker pool (polling for work) run as separate processes (LAB-92) with no shared memory — an in-memory variable in either process is invisible to the other, so only a shared, durable store (SQLite) both sides actually read from can serve as the single source of truth they agree on.
3. Individually-correct components can still disagree at their boundaries — a field one side expects that the other never sends, a status value spelled slightly differently, a timing assumption that only breaks under real concurrent load — none of which shows up when each component is tested alone against hand-written expectations, only when the real components actually talk to each other.

*Next: [LAB-103 — Capstone Review](LAB-103-capstone-review.md)*
