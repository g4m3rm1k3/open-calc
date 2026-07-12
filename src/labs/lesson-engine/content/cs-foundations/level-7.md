---
series: cs-foundations
level: 7
title: How the OS Runs Your Program
lang: javascript
---

# How the OS Runs Your Program

When you run a program, something turns your compiled bytes into a running process. That something is the operating system kernel. Every program runs inside a container the OS creates for it — a process — with its own view of memory, its own set of open files, and its own allocation of CPU time. The OS controls which process runs, for how long, and what it can access.

Understanding the OS layer is what makes processes, threads, async I/O, environment variables, signals, and exit codes make sense rather than being mysterious black boxes. When a Node.js process uses `process.env`, spawns a child process, or handles `SIGTERM` — all of these are interactions with the OS that have specific machine-level meanings.

By the end of this lesson you will understand what a process is, how the OS schedules CPU time, what threads are and why they exist, and what happens when a process ends.

## Processes: isolated containers for programs

A process is the OS's unit of running program. It contains:

```text
WHAT A PROCESS CONTAINS:
  — A copy of the program's code (the instructions), loaded into memory.
  — The program's stack (one per thread — see below).
  — The program's heap (shared across threads in the same process).
  — A table of open file descriptors: file handles, network sockets, pipes.
  — Environment variables: key-value pairs inherited from the parent process.
  — A Process ID (PID): an integer the OS uses to identify the process.
  — The process's state: running, waiting for I/O, sleeping, zombie.

KEY PROPERTY: each process has its OWN memory space.
  Process A cannot read or write process B's memory (without OS-mediated IPC).
  This isolation is what prevents one program from corrupting another.
  A crash in process A does not affect process B.

In Node.js:
  process.pid           — this process's PID
  process.env.HOME      — environment variable from the parent (your shell)
  process.exit(0)       — terminate with exit code 0 (success)
  process.exit(1)       — terminate with exit code 1 (error)
```

```text
How processes are created:
  On Unix/Linux/macOS: the `fork` system call creates an exact copy of the current process.
  The parent process continues. The child process starts from the same point.
  After fork, the child typically calls `exec` to replace itself with a new program.

  fork + exec = "start a new program"
  Node.js child_process.spawn() does exactly this.

Exit codes:
  When a process exits, it returns an integer exit code to its parent.
  0 = success (by convention). Non-zero = error.
  In shell scripts: if ./script exits non-zero, the script failed.
  In CI pipelines: a non-zero exit code fails the build.
```

## The CPU scheduler: sharing time between processes

There is usually one CPU (or a small number of cores), and many processes. The OS scheduler decides which process runs on which CPU core, and for how long.

```text
CONTEXT SWITCH: the OS suspending one process and resuming another.

  1. The OS saves the state of process A:
     — All register values (including the program counter).
     — The stack pointer.
     — This saved state is called the "process context."
  2. The OS loads the saved context of process B.
  3. Process B resumes exactly where it left off.

  This happens thousands of times per second. From the process's perspective,
  it appears to run continuously — the context switch is invisible to the program.

SCHEDULING POLICIES:
  Round-robin: each process gets a fixed "time slice" (e.g., 10ms), then yields.
  Priority-based: higher-priority processes run first, lower-priority wait.
  Completely Fair Scheduler (Linux): tracks "virtual runtime" — processes that have
  run less get scheduled sooner.

This is why "concurrency" ≠ "parallelism":
  Concurrency: multiple tasks in progress at once (via context switching on one CPU).
  Parallelism: multiple tasks executing simultaneously (on multiple CPU cores).
  A single-core machine can be concurrent but not parallel.
```

## Threads: concurrency within a process

A thread is a unit of execution within a process. Multiple threads share the same heap (same memory space) but each has its own stack.

```text
PROCESS vs THREAD:
  Process: isolated memory, high creation cost, expensive communication (IPC).
  Thread:  shared memory, low creation cost, cheap communication (shared heap).

Single-threaded process:
  One stack. One program counter. One execution path.
  JavaScript's runtime is single-threaded (one JS call stack at a time).
  
Multi-threaded process:
  Multiple stacks. Multiple program counters. Multiple execution paths.
  All threads share the same heap — they can read and write the same variables.
  
The shared-heap advantage: threads communicate by writing and reading shared memory.
The shared-heap danger:   two threads writing the same memory simultaneously produces
  undefined behaviour — this is a "data race." The result depends on scheduling order.

In Node.js: the event loop runs JavaScript on ONE thread. Worker Threads (worker_threads
module) add threads with separate JS contexts — they communicate by message passing,
not shared memory, to avoid data races.
```

```javascript
// Node.js process-level OS interactions:

// 1. Signals: the OS sends a signal to the process; the process handles it.
process.on('SIGTERM', () => {
  console.log('Graceful shutdown: SIGTERM received')
  server.close()
  process.exit(0)
})
// SIGTERM = "terminate please" (sent by kill, systemd, Kubernetes)
// SIGKILL = "terminate NOW" (cannot be caught — the OS kills the process unconditionally)

// 2. Environment variables: inherited from the parent process (your shell or CI system).
const port = parseInt(process.env.PORT ?? '3000', 10)

// 3. Exit codes: communicate success/failure to the parent.
process.exit(0)   // 0 = success
process.exit(1)   // 1 = general error
```

```text
Signals you will encounter:
  SIGTERM — graceful shutdown request. Catch this, clean up, then exit(0).
  SIGKILL — immediate kill. Cannot be caught. The OS kills the process.
  SIGINT  — Ctrl+C in the terminal. Often handled the same as SIGTERM.
  SIGHUP  — historically "terminal hangup"; now used to signal "reload config."

Exit codes you will encounter:
  0   — success
  1   — general error
  2   — misuse of shell built-in
  127 — command not found
  130 — process killed by Ctrl+C (128 + SIGINT signal number 2)
  137 — process killed by SIGKILL (128 + SIGKILL signal number 9) — OOM killer
```

**CS lens:** The OS abstraction — presenting each process with the illusion of exclusive access to CPU and memory — is called **virtualisation**. The CPU is virtualised by the scheduler (each process believes it owns the CPU). Memory is virtualised by the MMU (Memory Management Unit): each process has a "virtual address space" that the hardware maps to physical RAM, with no two processes mapping to the same physical memory unless explicitly shared. Virtualisation is what makes "run multiple programs at once" safe — without it, any program could overwrite any other program's memory.

**SE lens:** Knowing the process model is essential for writing reliable server-side software. A server that handles `SIGTERM` gracefully (closing connections, flushing logs, then calling `process.exit(0)`) is a server that can be deployed and restarted by orchestrators like Kubernetes without dropping in-flight requests. A server that ignores `SIGTERM` will be force-killed after a timeout, potentially dropping work. This is why "graceful shutdown" is a standard production requirement, not an optional polish.

**Common mistakes:**
- Assuming threads are always faster than single-threaded code — threading adds overhead: context switching, synchronisation, potential data races. For CPU-bound work, threads on multiple cores help. For I/O-bound work (like Node.js), async I/O on a single thread is often faster than threading.
- Ignoring exit codes in shell scripts — if a command fails and you do not check its exit code, the script continues on a broken foundation. Use `set -e` in bash scripts to exit on any non-zero exit code.

**Debug tip:** When a Node.js process exits unexpectedly without an error message, check: (1) the exit code — `echo $?` after the process exits tells you the OS exit code; 137 means the OOM killer terminated it due to memory exhaustion. (2) system logs: `journalctl -u your-service` or `/var/log/syslog` for kernel messages about the process.

## Challenge: process_model

Reason about the OS process model.

```challenge
const processModel = {
  // Two Node.js processes are running on the same machine.
  // Can process A read a variable from process B's heap?
  crossProcessMemory: '',      // 'yes' or 'no' — and why in a sentence

  // What is the exit code convention for "success" and "error"?
  exitCodeSuccess: 0,
  exitCodeError: 0,

  // SIGTERM arrives at a running server process.
  // Should the process: (a) exit immediately, (b) finish in-progress requests then exit, or (c) ignore it?
  sigtermBestResponse: '',     // 'a', 'b', or 'c'

  // A process's threads share which memory region — stack or heap?
  threadsShareRegion: '',      // 'stack' or 'heap'

  // What is a "data race"?
  dataRaceDefinition: '',      // one sentence
}
```

```test
const p = processModel
assert p.crossProcessMemory.toLowerCase().startsWith('no')
assert p.exitCodeSuccess === 0
assert p.exitCodeError !== 0
assert p.sigtermBestResponse === 'b'
assert p.threadsShareRegion === 'heap'
assert p.dataRaceDefinition.length > 20
```
