# SE Masterclass — LAB-92 — Processes and Threads

**Prerequisites:** LAB-91 (Code Generator) — all of Phase 7

## Quick Check

Before starting, answer these (answers at the bottom):

1. What does a process have that a thread doesn't?
2. Why can two threads in the same process silently corrupt each other's data, while two processes generally can't?
3. Why does Node.js's `child_process.spawn` need to communicate over streams instead of just sharing variables with the parent?

## What You Will Build

A parent script that spawns a child process, sends it data, and reads its output — in both Node.js (`child_process`) and Python (`subprocess`) — directly observing that the child has its own separate memory, and can only be talked to through explicit channels.

```
Parent (Node.js):
  spawning child...
  child stdout: "received: hello from parent"
  child exited with code 0

Parent (Python):
  spawning child...
  child stdout: "received: hello from parent"
  child exited with code 0
```

## Concept: The Process Model — Isolated Execution Environments

**What it is:** A process is an operating-system-level unit of execution with its *own* private memory address space, its own file descriptors, its own everything — the OS guarantees one process cannot accidentally read or write another's memory. A thread is a unit of execution *within* a process, sharing that process's memory with every other thread in it. Every program this curriculum has run so far — every Nano interpreter (LAB-83), every Node.js server (Phase 4) — has run as a single process, usually a single thread.

**The problem before:** Nothing in this curriculum so far has needed more than one process at a time — a calculator, a web server, a database all fit comfortably inside one process's memory. But real systems constantly need *more than one program running at once*, cooperating: a build tool spawning `tsc` and `eslint` in parallel, a web server handling a CPU-heavy task without blocking other requests, a shell running the command a user typed. None of that works inside a single process's single flow of control.

**The solution:** Spawn a **child process** — a new, fully isolated OS process, with its own memory, started from a program (an executable, a script) — and communicate with it only through explicit channels the OS provides: standard input/output streams, exit codes, and (LAB-93) more structured IPC mechanisms. The isolation is the whole point: a crash in the child process cannot corrupt the parent's memory, because the OS never lets them share any.

**Canonical example:**

```typescript
import { spawn } from "child_process"

const child = spawn("node", ["-e", "console.log('hello from child')"])
child.stdout.on("data", (data) => console.log(`child stdout: ${data}`))
child.on("exit", (code) => console.log(`child exited with code ${code}`))
```

**Project Application:** LAB-93's IPC channels, LAB-96's shell, and LAB-97's process manager all build directly on `child_process`/`subprocess` — this lab establishes the foundational primitive every later Phase 8 mini-project spawns and manages.

**Watch for:** Assuming a spawned child process can read a variable from the parent's scope. It cannot — not because of a language limitation, but because the OS itself enforces separate memory; the *only* way information crosses from parent to child is through the channels explicitly wired up when spawning (stdin, environment variables, command-line arguments) or afterward (LAB-93's IPC).

## Step 1: Spawning a child process in Node.js

```typescript
import { spawn } from "child_process"

function spawnChild(): void {
  const child = spawn("node", ["-e", `
    process.stdin.on("data", (data) => {
      console.log("received: " + data.toString().trim())
      process.exit(0)
    })
  `])

  child.stdout.on("data", (data) => console.log(`child stdout: ${data.toString().trim()}`))
  child.stderr.on("data", (data) => console.error(`child stderr: ${data.toString().trim()}`))
  child.on("exit", (code) => console.log(`child exited with code ${code}`))

  child.stdin.write("hello from parent\n")
}

spawnChild()
```

`spawn` returns immediately — it doesn't block waiting for the child to finish, which is why every interaction with the child happens through event listeners (`.on("data", ...)`, `.on("exit", ...)`) rather than a direct return value. `child.stdin.write(...)` is the *only* way this parent gets data into the child's process — there is no shared variable, no direct memory access, just a stream.

### SAVE AND TRY

Run `spawnChild()`. Confirm the output shows `child stdout: received: hello from parent` followed by `child exited with code 0` — and that removing the `child.stdin.write(...)` line makes the child hang forever waiting for input that never arrives, since `process.stdin.on("data", ...)` in the child has nothing else that could satisfy it.

## Step 2: The same isolation, in Python

```python
import subprocess

def spawn_child() -> None:
    child = subprocess.Popen(
        ["python3", "-c", "import sys; data = sys.stdin.readline(); print(f'received: {data.strip()}')"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True,
    )
    stdout, _ = child.communicate(input="hello from parent\n")
    print(f"child stdout: {stdout.strip()}")
    print(f"child exited with code {child.returncode}")

spawn_child()
```

`Popen` (Node's `spawn` counterpart) launches the child immediately, non-blocking, same as Node's version. `communicate()` is the one call that *does* block — it writes `input` to the child's stdin, waits for the child to finish, and collects all of its stdout, bundling three separate operations (send, wait, receive) into one call, whereas Node's version spread them across explicit stream writes and event listeners. Both approaches are talking to an isolated child through the exact same OS-level primitive: pipes connecting the parent's and child's stdin/stdout.

### SAVE AND TRY

Run `spawn_child()`. Confirm the output matches the Node version's shape exactly (`child stdout: received: hello from parent`, then the exit code) — different language, different API ergonomics, identical underlying OS mechanism.

## Step 3: Threads share memory — the opposite of process isolation

```typescript
import { Worker, isMainThread, parentPort, workerData } from "worker_threads"

if (isMainThread) {
  const sharedBuffer = new SharedArrayBuffer(4)
  const sharedArray = new Int32Array(sharedBuffer)
  sharedArray[0] = 100

  const worker = new Worker(__filename, { workerData: { buffer: sharedBuffer } })
  worker.on("message", () => {
    console.log("Main thread sees:", sharedArray[0]) // sees the WORKER's change, no message needed
  })
} else {
  const sharedArray = new Int32Array(workerData.buffer)
  sharedArray[0] += 1 // mutating memory the main thread can also see directly
  parentPort!.postMessage("done")
}
```

`SharedArrayBuffer` is deliberately named to contrast with everything in Steps 1–2: a worker thread and the main thread *can* directly read and write the exact same memory, with no pipe, no serialization, no `stdin`/`stdout` round-trip — the defining property of threads (shared memory within one process) versus processes (isolated memory, communication only through explicit channels). This is also precisely why threads are more dangerous: nothing stops both sides from writing to `sharedArray[0]` at the same moment, corrupting it — the exact problem LAB-94 addresses with synchronization primitives.

### SAVE AND TRY

Run the worker thread example and confirm `Main thread sees: 101` — the main thread's `sharedArray` reflects the worker's mutation with no message payload carrying the actual value, only a signal that the mutation happened. Compare this to Step 1's child process: there, the *only* way to get a value across was explicitly writing it to a stream — here, the value crossed because it was never actually two copies to begin with.

## Step 4: Passing data via arguments and environment variables — the other parent-to-child channels

```typescript
import { spawn } from "child_process"

function spawnWithArgsAndEnv(): void {
  const child = spawn("node", ["-e", `
    console.log("argv[2]:", process.argv[2])
    console.log("env.SECRET_TOKEN:", process.env.SECRET_TOKEN)
  `, "some-argument"], {
    env: { ...process.env, SECRET_TOKEN: "abc123" },
  })

  child.stdout.on("data", (data) => console.log(data.toString().trim()))
}

spawnWithArgsAndEnv()
```

Command-line arguments and environment variables are two more explicit channels for getting data from parent to child *at spawn time* — distinct from Step 1's ongoing `stdin` channel, which can send data any time after the child starts. `env: { ...process.env, SECRET_TOKEN: "abc123" }` deliberately spreads the parent's existing environment first — forgetting the spread would give the child a completely empty environment, missing things like `PATH`, which would break the child's ability to find other executables.

### SAVE AND TRY

Run `spawnWithArgsAndEnv()` and confirm the child prints both `argv[2]: some-argument` and `env.SECRET_TOKEN: abc123` — then remove `...process.env` from the `env` object and re-run; the child should still see `SECRET_TOKEN` but likely fail or behave unexpectedly if it tried to invoke anything relying on `PATH`, since the rest of the parent's environment was silently dropped.

## 🎯 Challenge

Write a Node.js parent that spawns three child processes concurrently (all three `spawn` calls issued before waiting for any to finish), each computing a different sum via `-e` script, and collect all three results only once every child has exited — using `Promise.all` over a `waitForExit(child)` helper that wraps each child's `"exit"` event in a Promise.

<details>
<summary>Solution</summary>

```typescript
import { spawn, ChildProcess } from "child_process"

function waitForExit(child: ChildProcess): Promise<string> {
  return new Promise((resolve) => {
    let output = ""
    child.stdout!.on("data", (data) => { output += data.toString() })
    child.on("exit", () => resolve(output.trim()))
  })
}

async function spawnThreeConcurrently(): Promise<void> {
  const sums = [
    spawn("node", ["-e", "console.log(1 + 2)"]),
    spawn("node", ["-e", "console.log(10 + 20)"]),
    spawn("node", ["-e", "console.log(100 + 200)"]),
  ]

  const results = await Promise.all(sums.map(waitForExit))
  console.log("All results:", results) // ["3", "30", "300"]
}

spawnThreeConcurrently()
```

All three `spawn` calls happen synchronously, one after another, before any `await` — meaning all three child processes are running *concurrently*, each in its own isolated memory space, and `Promise.all` only resolves once every one of them has independently exited. This is real OS-level parallelism (three separate processes, potentially on three separate CPU cores), not JavaScript's single-threaded concurrency illusion.

</details>

## Mental Model

| Concept | Process | Thread |
|---|---|---|
| Memory | Fully isolated from every other process | Shared with every other thread in the same process |
| Communication | Explicit channels only (stdin/stdout, IPC) | Direct shared-memory access |
| Crash impact | Contained to that process | Can corrupt the entire process |
| Cost to create | Relatively expensive (new memory space) | Relatively cheap (shares existing memory space) |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why can't a spawned child process just read a variable from its parent's scope? | |
| 2 | Why is `SharedArrayBuffer` the exception to the "no shared memory" rule other examples in this lab rely on? | |
| 3 | Why must `env` spread `...process.env` before adding new variables when spawning a child? | |

## Quick Check Answers

1. A process has its own private memory address space and file descriptors — a complete, OS-enforced execution environment; a thread has none of that on its own, sharing everything with the other threads in its parent process.
2. Within one process, all threads share the exact same memory — one thread writing to a shared variable and another reading or writing it at the same instant can interleave in ways that corrupt the data; between processes, the OS's memory isolation makes that kind of accidental interference structurally impossible.
3. Because a spawned child process has no shared memory with its parent at all — variables, functions, and objects in the parent's scope simply don't exist in the child's separate address space, so the only way to move data across is through explicit channels the OS provides.

*Next: [LAB-93 — IPC](LAB-93-ipc.md)*
