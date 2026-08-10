# Concept: `taskkill /T /F` — Terminating a Whole Process Tree

**What you'll understand by the end:** the one real Windows command that
terminates not just a single process but everything it started, and why
that's specifically the tool `os-process-tree-and-orphaned-processes.md`'s
own gap calls for.

**Prerequisites:** `os-process-tree-and-orphaned-processes.md`,
`node-child-process-execsync.md`.

## Setup

Windows 10/11. `taskkill` is a built-in command, available in any
terminal — no install needed.

## The Problem

`os-process-tree-and-orphaned-processes.md` proved that killing a wrapper
process (the shell `spawn`'s `shell: true` option creates) leaves whatever
that shell itself launched still running, orphaned. Something needs to
target not just one PID, but that PID's entire subtree — every process it
started, directly or indirectly — in one real operation.

## The Concept, Isolated

```javascript
const { spawn, execSync } = require("child_process");
const path = require("path");

// grandchild.js: console.log("grandchild pid:", process.pid); setInterval(() => {}, 1000);
const wrapper = spawn("node", [path.join(__dirname, "grandchild.js")], { shell: true });
console.log("wrapper.pid:", wrapper.pid);
wrapper.stdout.on("data", (d) => process.stdout.write(d));

setTimeout(() => {
  console.log("--- killing the whole tree: taskkill /pid <wrapper> /t /f ---");
  execSync(`taskkill /pid ${wrapper.pid} /t /f`);
}, 1500);
```

**Real output, run this session:**
```
wrapper.pid: 73480
grandchild pid: 82416
--- killing the whole tree: taskkill /pid <wrapper> /t /f ---
```

Checked immediately after, with `Get-Process`:
```
Get-Process -Id 82416   → not found (the real node process is gone too)
Get-Process -Id 73480   → not found (the wrapper is gone)
```

**What this proves:** targeting the wrapper's PID with `/t /f` terminated
*both* processes — the wrapper and the real `node` process it had
launched — in contrast to `os-process-tree-and-orphaned-processes.md`'s
own isolated example, where plain `wrapper.kill()` against the identical
setup left the `node` process (PID `79856`, that run) alive and
unaccounted for.

## Mechanical Walkthrough

- `taskkill` — **(a) first appearance** — a real, built-in Windows
  command-line tool for terminating processes, the same category of tool
  as `kill` on Unix-family systems, but operating on Windows's own process
  model.
- `/pid ${wrapper.pid}` — **(a) first appearance** — selects the target
  process by its exact numeric PID (as opposed to `/im`, which selects by
  executable image name and could match several unrelated processes at
  once).
- `/t` — **(a) first appearance** — "tree": also terminate every process
  that the target process started, directly or indirectly — exactly the
  subtree `os-process-tree-and-orphaned-processes.md` showed survives
  without it.
- `/f` — **(a) first appearance** — "force": terminate immediately,
  rather than sending a close request a process could ignore or take time
  to act on (the same distinction this project's own earlier live testing
  drew between a plain `taskkill /pid <pid>`, which asks nicely, and
  `taskkill /pid <pid> /f`, which does not).
- `` execSync(`taskkill /pid ${wrapper.pid} /t /f`) `` — **(b) reappearing**
  — `execSync`, per `node-child-process-execsync.md`, used here for
  exactly the case it's suited to: one short administrative command,
  whose result only matters as success-or-failure, not as an ongoing
  stream.

## CS Lens

This is **subtree termination**, the same operation any tree-shaped
structure eventually needs: deleting a filesystem directory recursively
(`rm -r`), tearing down a whole DOM subtree when a parent React component
unmounts, or cascading a database delete down a foreign-key hierarchy
(`orm-cascade-delete-vs-core-delete.md`, already covered) — in every case,
removing a node correctly means also removing everything that node was
the ancestor of, not just the node itself.

Also recognized in: Unix's own process groups (`kill -- -PID`, signaling
every process in a group at once — a different mechanism, the identical
underlying need), and container runtimes' own "stop the container"
operation, which must terminate every process inside it, not just PID 1.

## SE Lens

The real alternative — tracking every child and grandchild PID by hand
inside `cnc-desktop`'s own code, to kill each one individually — would
duplicate bookkeeping the operating system already does natively (it
already knows the real parent/child relationship for every process on the
machine); `/t` asks the OS to walk that already-correct tree itself,
rather than this project maintaining a shadow copy of it that could drift
out of sync. The real, honest limit of this fix, worth stating plainly:
`/f` is Windows-specific syntax — the equivalent on macOS/Linux is killing
the whole process *group* (`process.kill(-pid, 'SIGTERM')`, which requires
spawning with `detached: true` in the first place) — a genuinely different
mechanism this project doesn't need today, since `startFrontend` never
sets `shell: true` on those platforms (see `main.js`'s own comment), so no
orphaned wrapper exists there to clean up.

## Connection

Builds on `os-process-tree-and-orphaned-processes.md` (the real gap this
closes) and `node-child-process-execsync.md` (the mechanism used to invoke
it from inside `main.js`). This is the concept `cnc-desktop`'s own
`killProcessTree` helper is built from — the next step applies it to the
real project file.

## Try It Yourself

1. Run the isolated example again, this time with only `/f` and no `/t`
   — confirm the wrapper dies but the real `node` process survives,
   exactly like plain `.kill()` did, proving `/t` specifically (not `/f`)
   is what closes the gap.
2. Look up `taskkill`'s exit code when the target PID no longer exists
   (already exited on its own) — and confirm why `main.js`'s own
   `killProcessTree` wraps the call in `try`/`catch` rather than letting
   that case throw uncaught.
3. Compare this to Unix's `pkill -P <ppid>` (kill by parent PID) — a
   different real command reaching for the same "everything under this
   node" result, worth knowing if this project's `cnc-desktop` ever needs
   a Linux build.
