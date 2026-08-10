# Concept: Launching a Real Subprocess (`child_process.spawn`)

**What you'll understand by the end:** how one running program starts a completely separate, independent program, and how it stays connected to that program's real output and eventual exit without waiting, line by line, for it to finish.

**Prerequisites:** `javascript-commonjs-require.md`, `event-driven-ui-callbacks.md`.

## Setup

Any Node.js install — `child_process` is a built-in module, no install needed, `require("child_process")` only.

## The Problem

Some real work isn't something the current program's own code can do — it needs an entirely separate program, written in a different language, doing its own independent thing (a build tool, a database server, a backend written in a different language) — started, monitored, and eventually stopped, from inside the first program.

## The Isolated Example

```javascript
const { spawn } = require("child_process");

const child = spawn("node", ["-e", "console.log('hi from child'); console.error('a warning'); process.exit(3);"]);

console.log("spawned, pid:", child.pid);

child.stdout.on("data", (chunk) => {
  console.log("stdout chunk:", JSON.stringify(chunk.toString()));
});

child.stderr.on("data", (chunk) => {
  console.log("stderr chunk:", JSON.stringify(chunk.toString()));
});

child.on("exit", (code) => {
  console.log("child exited with code:", code);
});
```

**Real output, run this session:**
```
spawned, pid: 88138
stdout chunk: "hi from child\n"
stderr chunk: "a warning\n"
child exited with code: 3
```

**What this proves:** `spawn` returned control immediately — `"spawned, pid: ..."` printed before the child had done anything at all — while a real, separate operating-system process (a real `pid`, confirmed) ran independently and reported its real output and real exit code back asynchronously, through events, exactly matching what it actually printed and the exact code it actually exited with (`3`, matching `process.exit(3)` in the child's own script).

## Mechanical Walkthrough

- `spawn("node", ["-e", "..."])` — **(a) first appearance.** The first argument is the real program to run (found the same way a shell would look it up); the second is an array of separate command-line arguments — never one concatenated string, which matters the moment any argument might contain spaces or characters a shell would otherwise misinterpret. Returns immediately with a real `ChildProcess` object — it does not wait for the child to do anything.
- `child.pid` — **(a) first appearance** — the real, OS-assigned process id of the just-started subprocess, confirming a genuinely separate process exists, not something running inside the current one.
- `child.stdout` / `child.stderr` — **(a) first appearance** — two separate real **Readable Streams**, one for everything the child process writes to its own standard output, one for standard error — kept separate so a caller can tell normal output from error output, the same real distinction a terminal makes when a program's output is piped versus its errors.
- `.on("data", (chunk) => {...})` — **(b) reappearing, extended** the same general event-driven-callback model `event-driven-ui-callbacks.md` already covers, and the same concrete `EventEmitter`-style `.on(...)` API `electron-main-process-and-browserwindow.md` already used — a *third* real object type implementing it (a stream, not a DOM element or an Electron `webContents`) — `"data"` fires every time a new chunk of output becomes available, potentially several times for one long-running program, never all at once.
- `chunk.toString()` — **(a) first appearance** — a stream's `"data"` event delivers a raw `Buffer` (a real, binary byte sequence, not a JavaScript string yet); `.toString()` decodes it as text (UTF-8 by default) so it can be printed or compared as ordinary text.
- `child.on("exit", (code) => {...})` — **(b) reappearing** the same `.on(...)` pattern, on the `ChildProcess` object itself this time — fires exactly once, real proof the child process actually terminated, with the real exit code it terminated with.

## CS Lens

This is **inter-process communication (IPC)** in its simplest real form: two independent operating-system processes, each with their own memory and execution, connected only through real, OS-level pipes (`stdout`/`stderr`) that one process's output writes into and the other's `"data"` events read back out of — no shared memory, no direct function calls between them, only a real stream of bytes.

Also recognized in: every shell pipeline (`cmd1 | cmd2` — the OS wiring one process's stdout directly to another's stdin, the identical underlying mechanism), any CI system running build/test commands as subprocesses and capturing their output, and — directly relevant to this project's own real use — any desktop application (Electron included) that bundles or manages a separate backend server process rather than reimplementing its logic in the app's own language.

## SE Lens

The real alternative to `spawn` here is `exec` (a close sibling, not shown in this lab) — which buffers a child's *entire* output in memory and only hands it back once the process has fully finished, rather than streaming it as it happens. That's fine for a short-lived command producing a small, fixed amount of output; it's a real, concrete problem for a long-running server process, whose real, live output (or genuine failure to start at all) needs to be visible as it happens, not after the process has already exited — exactly why a real subprocess management use case reaches for `spawn`'s streaming events, not `exec`'s all-at-once return value.

## Connection

Builds on `javascript-commonjs-require.md` (`child_process` is a CommonJS built-in) and extends `event-driven-ui-callbacks.md`'s general model to a third concrete API surface (Node's `Readable` stream). Directly relevant to any program that needs to start, monitor, and eventually stop a real, independent subprocess — including this project's own next real use, right after this concept file: an Electron app managing its own backend server's process.

## Try It Yourself

1. Change the child script's exit code from `3` to `0`, and add an `if (code === 0)`/`else` branch in the `"exit"` handler distinguishing a clean exit from a real failure — the same "0 means success" convention `http-status-codes.md`'s own 2xx-versus-everything-else distinction echoes at a completely different layer.
2. Change the child script to print many separate lines in a loop with a short delay between each (`setInterval`, briefly), and confirm the parent's `"data"` handler fires multiple separate times, each with a real, partial chunk — not once with everything at the end.
3. Look up `child.kill()` (not shown in this lab) and call it a moment after spawning a child that would otherwise run for a long time (e.g. `setInterval` with no end) — confirm the real `"exit"` event still fires, with a signal-based reason instead of a normal exit code, and reason about why a parent process needs a real way to stop a child it started, not just start one.
