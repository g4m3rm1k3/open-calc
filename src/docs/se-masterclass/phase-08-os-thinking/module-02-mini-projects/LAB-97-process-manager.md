# SE Masterclass — LAB-97 — Process Manager

**Prerequisites:** LAB-96 (Shell)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why does a process manager need a state machine, rather than just tracking "running" vs. "not running"?
2. Why is "restart" not simply "stop, then start" from the process manager's point of view?
3. Why must the process registry (LAB-95's leak lesson) remove entries for processes that have permanently stopped, rather than accumulating them forever?

## What You Will Build

A process manager (a tiny PM2/systemd-style tool) that starts named child processes, tracks each one through a lifecycle state machine, automatically restarts crashed processes up to a retry limit, and reports live status for all managed processes.

```
$ start web "node server.js"
Started 'web' (pid 4821)

$ status
web       running   pid=4821   uptime=12s   restarts=0

# server.js crashes...
'web' exited unexpectedly (code 1) -- restarting (attempt 1/5)
Started 'web' (pid 4830)

$ stop web
'web' stopped
```

## Concept: Process Lifecycle Management

**What it is:** A process manager tracks each child process it spawns (LAB-92) through a small, well-defined set of states — starting, running, stopping, stopped, crashed — and reacts to state transitions with policy (restart on crash, report on status query). This is the same state-machine discipline LAB-13 (Phase 1) applied to traffic lights and vending machines, applied here to something with real operational consequences: a crashed web server should come back up automatically, not require a human watching a terminal.

**The problem before:** LAB-92's `spawn` calls and LAB-96's shell both fire-and-forget — spawn a process, maybe relay its output, done. Neither tracks what happens to that process *afterward*: did it crash? Is it still running an hour later? Should it be restarted? A real long-running service (a web server, a background worker) needs exactly that ongoing supervision, which requires modeling the process's lifecycle explicitly rather than treating "spawned" as the end of the story.

**The solution:** A `ProcessEntry` state machine (LAB-13's transition-table technique) with states `starting → running → (stopping → stopped) | crashed`, where a `crashed` state — reached via the child's `"exit"` event firing with a non-zero code and no explicit stop having been requested — automatically triggers a restart, up to a configured limit, to avoid an infinite restart loop on a process that's crashing immediately every time (a classic "crash loop").

**Canonical example:**

```typescript
type ProcessState = "starting" | "running" | "stopping" | "stopped" | "crashed"

interface ProcessEntry {
  name: string
  state: ProcessState
  child: ChildProcess | null
  restartCount: number
  startedAt: number | null
}
```

**Project Application:** This lab's registry-plus-lifecycle pattern is exactly what LAB-100's job scheduler needs for tracking scheduled jobs' running/completed/failed states — the two labs share the same underlying state-machine-over-a-Map architecture.

**Watch for:** Restarting a process that was deliberately stopped by the user. The `"exit"` handler must distinguish "this process crashed on its own" from "this process exited because we explicitly told it to stop" — conflating the two turns every intentional `stop` command into an unwanted automatic restart.

## Step 1: The process registry and lifecycle states

```typescript
import { spawn, ChildProcess } from "child_process"

type ProcessState = "starting" | "running" | "stopping" | "stopped" | "crashed"

interface ProcessEntry {
  name: string
  command: string
  args: string[]
  state: ProcessState
  child: ChildProcess | null
  restartCount: number
  startedAt: number | null
  stopRequested: boolean // distinguishes an intentional stop from an unexpected crash
}

const registry = new Map<string, ProcessEntry>()
const MAX_RESTARTS = 5
```

`stopRequested` is the flag that resolves this lab's "watch for" directly — set to `true` the instant a `stop` command is issued, checked inside the `"exit"` handler (Step 2) before deciding whether a restart is warranted. `registry` is a plain `Map`, same shape as LAB-95's cache examples — and same leak risk if entries for permanently-stopped processes are never removed, which Step 4 addresses explicitly.

### SAVE AND TRY

```typescript
const entry: ProcessEntry = {
  name: "web", command: "node", args: ["server.js"],
  state: "stopped", child: null, restartCount: 0, startedAt: null, stopRequested: false,
}
registry.set("web", entry)
console.log(registry.get("web")?.state) // "stopped"
```

## Step 2: Starting a process and reacting to its exit

```typescript
function startProcess(name: string, command: string, args: string[]): void {
  const entry: ProcessEntry = registry.get(name) ?? {
    name, command, args, state: "starting", child: null, restartCount: 0, startedAt: null, stopRequested: false,
  }
  entry.state = "starting"
  entry.stopRequested = false

  const child = spawn(command, args)
  entry.child = child
  entry.startedAt = Date.now()
  entry.state = "running"
  registry.set(name, entry)

  console.log(`Started '${name}' (pid ${child.pid})`)

  child.on("exit", (code) => {
    const current = registry.get(name)
    if (!current) return

    if (current.stopRequested) {
      current.state = "stopped"
      console.log(`'${name}' stopped`)
      return
    }

    current.state = "crashed"
    console.log(`'${name}' exited unexpectedly (code ${code})`)

    if (current.restartCount < MAX_RESTARTS) {
      current.restartCount++
      console.log(`restarting (attempt ${current.restartCount}/${MAX_RESTARTS})`)
      startProcess(name, current.command, current.args) // recursive restart, same registry entry
    } else {
      console.log(`'${name}' exceeded max restarts (${MAX_RESTARTS}) -- giving up`)
    }
  })
}
```

The `"exit"` handler is where the whole lifecycle policy lives: check `stopRequested` first (an intentional stop is not a crash, and must not trigger a restart), and only treat the exit as `crashed` — eligible for automatic restart — when it wasn't. `restartCount` persists across restarts on the *same* registry entry (not reset each time), which is exactly what makes `MAX_RESTARTS` an effective circuit breaker against crash loops rather than a counter that silently resets and allows infinite restarts.

### SAVE AND TRY

```typescript
startProcess("crasher", "node", ["-e", "process.exit(1)"]) // crashes immediately, every time
```

Watch it restart automatically up to 5 times, then print `'crasher' exceeded max restarts (5) -- giving up` and stop — confirming the circuit breaker engages rather than restarting forever.

## Step 3: Stopping a process — the "intentional exit" path

```typescript
function stopProcess(name: string): void {
  const entry = registry.get(name)
  if (!entry || !entry.child) {
    console.log(`'${name}' is not running`)
    return
  }

  entry.stopRequested = true // set BEFORE killing -- the exit handler checks this
  entry.state = "stopping"
  entry.child.kill("SIGTERM")
}
```

Setting `stopRequested = true` *before* calling `.kill()` is the critical ordering: `.kill()` triggers the child's exit asynchronously (it doesn't die instantly), and by the time the `"exit"` event actually fires and Step 2's handler runs, `stopRequested` must already be `true`, or the handler would see the default `false` and incorrectly treat this intentional stop as a crash worth restarting.

### SAVE AND TRY

```typescript
startProcess("web", "node", ["-e", "setInterval(() => {}, 1000)"]) // long-running, never exits on its own
setTimeout(() => stopProcess("web"), 500)
```

After roughly 500ms, confirm the output shows `'web' stopped` — *not* a crash message and *not* a restart attempt — proving `stopRequested` correctly suppressed the restart logic for this intentional termination.

## Step 4: Status reporting and registry cleanup

```typescript
function reportStatus(): void {
  for (const entry of registry.values()) {
    const uptime = entry.startedAt ? Math.floor((Date.now() - entry.startedAt) / 1000) : 0
    const pid = entry.child?.pid ?? "-"
    console.log(`${entry.name.padEnd(10)}${entry.state.padEnd(10)}pid=${pid}   uptime=${uptime}s   restarts=${entry.restartCount}`)
  }
}

function removeProcess(name: string): void {
  const entry = registry.get(name)
  if (entry && (entry.state === "stopped" || entry.state === "crashed")) {
    registry.delete(name) // LAB-95's lesson applied: don't let permanently-dead entries accumulate forever
  } else {
    console.log(`cannot remove '${name}' -- it is still ${entry?.state}`)
  }
}
```

`removeProcess` only deletes entries in a terminal state (`stopped` or a `crashed` entry that's given up on restarting) — exactly LAB-95's cache-eviction discipline, applied to a process registry instead of a data cache: without some form of cleanup, a long-running manager that starts and stops many short-lived processes over its lifetime would accumulate `ProcessEntry` objects (each holding a reference to a dead `ChildProcess`) forever, the identical shape of leak Step 2 of LAB-95 demonstrated with strings.

### SAVE AND TRY

Start a few processes, stop one, call `reportStatus()` and confirm every entry (including the stopped one) still shows — then call `removeProcess` on the stopped one and confirm it disappears from a subsequent `reportStatus()` call, while running processes remain untouched by `removeProcess` (attempting to remove a still-running one should print the "cannot remove" message instead of deleting it).

## 🎯 Challenge

Add exponential backoff to the restart logic: instead of restarting immediately on crash, wait `attempt * 1000` milliseconds before each restart attempt (so attempt 1 waits 1s, attempt 2 waits 2s, etc.) — preventing a crash-looping process from consuming CPU in a tight restart cycle.

<details>
<summary>Solution</summary>

```typescript
child.on("exit", (code) => {
  const current = registry.get(name)
  if (!current) return

  if (current.stopRequested) {
    current.state = "stopped"
    console.log(`'${name}' stopped`)
    return
  }

  current.state = "crashed"
  console.log(`'${name}' exited unexpectedly (code ${code})`)

  if (current.restartCount < MAX_RESTARTS) {
    current.restartCount++
    const delayMs = current.restartCount * 1000
    console.log(`restarting in ${delayMs}ms (attempt ${current.restartCount}/${MAX_RESTARTS})`)
    setTimeout(() => startProcess(name, current.command, current.args), delayMs)
  } else {
    console.log(`'${name}' exceeded max restarts (${MAX_RESTARTS}) -- giving up`)
  }
})
```

The only change is wrapping the recursive `startProcess` call in a `setTimeout` scaled by the current attempt number — a process crashing instantly and repeatedly now restarts with growing delays (1s, 2s, 3s...) instead of as fast as the OS can spawn it, which is the real-world reason production process managers (PM2, systemd) implement backoff: an unthrottled crash loop can peg CPU and fill logs before a human even notices.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Process states | "running" or "not running" | starting → running → (stopping → stopped) or crashed |
| Restart on crash | Always restart, forever | Restart up to `MAX_RESTARTS`, then give up |
| Distinguishing stop from crash | Assume any exit is a crash | Check `stopRequested`, set before calling `.kill()` |
| Registry lifetime | Keep every entry forever | Remove entries once in a terminal state (LAB-95's leak lesson) |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why must `stopRequested` be set before `.kill()` is called, not after? | |
| 2 | Why does `restartCount` persist on the same entry across restarts instead of resetting to 0 each time? | |
| 3 | What real-world problem does exponential backoff (the Challenge) prevent that a fixed, immediate restart doesn't? | |

## Quick Check Answers

1. A process can be in several distinct situations that all "count" differently — mid-startup, healthily running, intentionally being stopped, already stopped, or unexpectedly crashed — and the correct response (restart automatically vs. do nothing) depends on which of these it's actually in, not just a binary running/not-running flag.
2. Because stopping a managed process should be a deliberate, expected transition to `stopped`, while an automatic restart-on-crash policy exists specifically for *unexpected* exits — conflating the two means every normal `stop` command would look identical to a crash and get "restarted" right back up against the user's wishes.
3. Every dead `ProcessEntry` still holds a reference to its (now-exited) `ChildProcess` and remains reachable through the `registry` Map — exactly LAB-95's leak pattern, where a long-lived collection accumulating references it no longer needs keeps growing memory usage indefinitely unless something explicitly removes entries once they're truly done.

*Next: [LAB-98 — File Watcher](LAB-98-file-watcher.md)*
