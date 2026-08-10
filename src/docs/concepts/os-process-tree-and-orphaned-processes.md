# Concept: Process Trees and Orphaned Processes

**What you'll understand by the end:** why killing a process that started
another process does not automatically kill the one it started — and why
a real, deliberate wrapper (like a shell) makes this worse, not better.

**Prerequisites:** `node-child-process-spawn.md`.

## Setup

Any Node.js install, on Windows. No project code needed.

## The Problem

`node-child-process-spawn.md` already established that `spawn` starts a
genuinely separate operating-system process, connected back to its parent
only by pipes and events. What it didn't cover: what happens to that
child process if the *parent* is the one that gets terminated — does the
child die with it, or does it just keep running, now with nothing tracking
it at all?

## The Concept, Isolated

```javascript
const { spawn } = require("child_process");
const path = require("path");

// grandchild.js contains just:
//   console.log("grandchild pid:", process.pid);
//   setInterval(() => {}, 1000);
const wrapper = spawn("node", [path.join(__dirname, "grandchild.js")], { shell: true });

console.log("wrapper.pid (the shell, not the node script):", wrapper.pid);
wrapper.stdout.on("data", (d) => process.stdout.write(d));

setTimeout(() => {
  console.log("--- calling wrapper.kill() ---");
  wrapper.kill();
}, 1500);
```

**Real output, run this session:**
```
wrapper.pid (the shell, not the node script): 53820
grandchild pid: 79856
--- calling wrapper.kill() ---
```

Checked immediately after, with `Get-Process`:
```
Get-Process -Id 79856   → still running (real node.exe, still alive)
Get-Process -Id 53820   → not found (the wrapper is gone)
```

**What this proves:** `wrapper.kill()` terminated exactly the one process
`spawn` returned — the shell (`cmd.exe /c node grandchild.js`) — and
nothing else. The real `node` process the shell had itself launched
(`grandchild.js`, PID `79856`) was never told to stop by anything, and it
kept running, completely on its own, with no process left tracking it.

## Mechanical Walkthrough

- `spawn("node", [...], { shell: true })` — **(b) reappearing**
  `spawn` itself (`node-child-process-spawn.md`); `shell: true` — **(a)
  first appearance** — tells `spawn` to run the command through a system
  shell (`cmd.exe` on Windows) instead of launching the named program
  directly. `wrapper` is a real, separate `ChildProcess` object referring
  to *that shell*, not to whatever the shell itself goes on to run.
- `wrapper.pid` vs. the `grandchild pid:` line the child script prints
  itself — **(a) first appearance of the distinction** — two different
  real PIDs exist here, not one: the shell process `spawn` directly
  started, and the `node` process that shell process started in turn.
  Nothing before this made that gap visible.
- `wrapper.kill()` — **(b) reappearing**, per `node-child-process-spawn.md`'s
  own "Try It Yourself" — sends a termination signal to exactly the PID
  stored in `wrapper.pid`. It has no knowledge of, and no effect on, any
  process *that* PID may have gone on to start.

## CS Lens

This is a **process tree**: an operating system tracks processes as a
tree, each one (except the very first) started by exactly one parent, and
free to start children of its own. Terminating a node in that tree does
not, by itself, terminate its subtree — a child whose parent has exited
becomes an **orphan**: still real, still running, still holding whatever
resources it holds (a port, a file, memory), just with the specific
process that started it no longer present to account for it or is even
aware of it.

Also recognized in: a Unix shell's own job control (`kill %1` targeting
one job, its own grandchildren surviving unless explicitly signaled too),
Docker's well-known "PID 1 problem" (a container's main process not
reaping its own orphaned children, a widely-documented real bug class),
and any browser tab's renderer process outliving a crashed parent
coordinator process just long enough to be cleaned up separately.

## SE Lens

The real alternative many tools reach for — assuming "kill the process I
started" is equivalent to "kill everything that resulted from starting
it" — is a strictly false assumption the instant any layer of
indirection (a shell, a script runner, a build tool) sits between the
call and the real work. It costs nothing to *believe* the assumption,
which is exactly why it's a common, quiet source of dev-server processes
and locked ports outliving the tool that supposedly launched and owned
them — discovered later, by someone else, confused about why a port that
"should" be free still isn't.

## Connection

Builds on `node-child-process-spawn.md`. Directly sets up
`windows-taskkill-process-tree.md` — the real, correct way to terminate
not just one PID but everything it started, which this concept file's own
isolated example proves is genuinely necessary, not a theoretical
edge case.

## Try It Yourself

1. Rerun the isolated example without `{ shell: true }` (spawn `"node"`
   directly, with the script path as its only argument, no shell) and
   confirm `wrapper.pid` and the child's own printed PID are now the
   *same* number — no wrapper, no gap, `wrapper.kill()` now genuinely
   terminates the real process.
2. Add a third layer — have `grandchild.js` itself `spawn` a fourth
   process — and reason through (or verify with `Get-Process`) how many
   real processes survive `wrapper.kill()` now.
3. Look up what a Unix-family OS does with an orphaned process's parent
   PID (`getppid()`) after the original parent exits — it gets reassigned
   to a reaping ancestor (traditionally PID 1) rather than left pointing
   at a process that no longer exists.
