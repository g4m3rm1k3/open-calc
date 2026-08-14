# Concept: Running a Command and Waiting for It (`child_process.execSync`)

**What you'll understand by the end:** how to run a real shell command
from Node and get its result back as a plain, immediate return value —
and why that's the right tool for a short administrative command, even
though `spawn` already covers running a subprocess in general.

**Prerequisites:** `node-child-process-spawn.md`.

## Setup

Any Node.js install — `child_process` is built in, no install needed.

## The Problem

`node-child-process-spawn.md`'s own SE Lens already named the real
tradeoff: `spawn` streams a subprocess's output via events, on purpose,
because a long-running server's output needs to be visible as it happens.
That's the wrong shape for a different, much smaller real need: running
one short command (a `git` lookup, a `taskkill`), where the only thing
that matters is "did it succeed, and what did it print" — known only
*after* it's already finished. Wiring up `"data"`/`"exit"` listeners for a
command that's done in milliseconds is real, unnecessary ceremony.

## The Concept, Isolated

```javascript
const { execSync } = require("child_process");

const output = execSync("node --version");
console.log("got back:", JSON.stringify(output.toString().trim()));

try {
  execSync("node -e \"process.exit(7)\"");
} catch (err) {
  console.log("threw, status:", err.status);
}
```

**Real output, run this session:**
```
got back: "v24.12.0"
threw, status: 7
```

**What this proves:** `execSync` returned control only *after* the
command had completely finished, handing back its entire real output in
one plain value — no callback, no event, nothing to wire up. The second
call, running a command that exits non-zero, didn't return a failure code
quietly; it threw a real, catchable error carrying that exact exit code
(`7`) as a property.

## Mechanical Walkthrough

- `execSync("node --version")` — **(a) first appearance** — runs the
  given string as a real shell command and blocks the calling code until
  it finishes; unlike `spawn`, there is no `ChildProcess` object handed
  back at all — nothing to attach listeners to, because by the time this
  call returns, there's nothing left running to listen to.
- The return value — **(a) first appearance** — a raw `Buffer` containing
  everything the command wrote to stdout, the *entire* output at once
  (contrast `node-child-process-spawn.md`'s own `"data"` events, which can
  fire many times for one long-running command).
- `.toString().trim()` — **(b) reappearing** — `Buffer.toString()`
  already appeared in `node-child-process-spawn.md`; `.trim()` — **(c)
  already basic** — removes the trailing newline a real terminal command's
  output almost always includes.
- `try { execSync(...) } catch (err) { ... }` — **(b) reappearing**
  `try`/`catch` (`python-try-except.md` already covers the same idea in
  Python); what's new here specifically is *what* triggers the throw —
  **(a) first appearance** — a non-zero exit code from the command
  itself, not a JavaScript exception, gets translated by `execSync` into a
  real thrown error.
- `err.status` — **(a) first appearance** — the real numeric exit code
  the command itself terminated with, attached to the error object
  `execSync` throws.

## CS Lens

This is **synchronous blocking I/O**: the calling code's own execution
genuinely pauses until the external operation completes, trading
concurrency (nothing else in this program runs meanwhile) for a simpler,
linear control flow exactly where that trade is worth making — a short,
one-shot command with no other work this program needs to be doing at the
same moment.

Also recognized in: Python's `subprocess.run(...)` (blocking by default,
the same tradeoff, the same language's own `Popen` available for the
non-blocking case), and any ORM's synchronous query call versus its own
async variant (`orm-session-unit-of-work.md`) — the same blocking-vs-streaming
choice, one layer up, applied to a database round trip instead of a
subprocess.

## SE Lens

The real, concrete cost of choosing `execSync` where `spawn` belongs: the
*entire calling program* freezes for as long as the command takes to
finish — genuinely fine for a `taskkill` that resolves in milliseconds,
a real problem for anything that might run for seconds or longer, since
nothing else (including, in `cnc-desktop`'s own case, Electron's own UI
event loop) gets to run meanwhile. Choosing between `spawn` and
`execSync` is really a question of "does anything else need to happen
while this runs" — not a default either way.

## Connection

Builds on `node-child-process-spawn.md` (the same module, the deliberately
opposite tradeoff). Directly relevant to
`windows-taskkill-process-tree.md`, next: the one specific real command
this project needs run-and-wait-for, not run-and-stream.

## Try It Yourself

1. Time how long `execSync("node -e \"setTimeout(()=>{}, 2000)\"")` takes
   to return, with a `console.log(Date.now())` immediately before and
   after — confirm the calling code really did pause for the full two
   seconds, not return early.
2. Replace `execSync` with `exec` (its async, callback-based sibling,
   briefly named but not shown in `node-child-process-spawn.md`) running
   the same `node --version` command, and confirm the calling code's very
   next line runs *before* the callback fires — the same
   run-now/react-later shape `spawn` already established, now on `exec`
   instead.
3. Run a command that doesn't exist at all (e.g. `execSync("not-a-real-command")`)
   and inspect the real error thrown — confirm it's distinguishable from
   the non-zero-exit-code case above (a command that never started at all
   versus one that started and then failed).
