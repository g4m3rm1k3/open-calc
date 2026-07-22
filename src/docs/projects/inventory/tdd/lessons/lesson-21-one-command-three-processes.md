# Lesson 21: One Command, Three Processes

## What you will build

`cnc-desktop/main.js` grows to spawn `cnc-web`'s Vite dev server the
same way Lesson 20 spawned `cnc-service` — the deliberately deferred
half of that lesson's own scope decision. `npm start` in `cnc-desktop`
now brings up the entire app — backend, frontend, and the window that
loads them — with nothing left to start by hand, verified live this
session end to end, including real API calls succeeding
(`GET /api/tools`, `POST /api/simulate`) with zero manual steps. A real,
concrete cross-platform difference showed up building this that
`cnc-service`'s own spawn call never had to deal with: `npm` isn't a
directly-executable file on every platform, and a second real, live
difference showed up tearing it back down — the two backends this app
now manages don't respond to being stopped in the same way. The
transferable problem this lesson is really about: **the exact same
`spawn` call can need different real handling depending on what,
specifically, is being spawned** — assuming one tool's quirks generalize
to every tool is a real, common way this kind of code quietly breaks on
a different platform, or a different subprocess, than the one it was
written and tested against.

## What you need to know first

Lesson 20, directly: `child_process.spawn`, `path.join`/`__dirname`, the
`before-quit` cleanup pattern, and the same real question that lesson's
own "Verified, Run for Real" already answered once for `cnc-service`
(does killing the process you hold a reference to actually kill
everything it started) — asked again here, for a different real tool,
with a genuinely different real answer.

## Concepts cataloged from this lesson

- `../concepts/node-child-process-spawn.md` — reappearing, extended (the
  `shell` option, not demonstrated in that file's own isolated lab).
- `../concepts/node-path-module-and-dirname.md`,
  `../concepts/node-process-platform.md` — reappearing, no extension.

## No pipeline diagram change

Same reasoning as Lessons 19–20.

---

## Concept Unit: Spawning `cnc-web` the Same Way — Almost

*(Reappearing, extended: `../concepts/node-child-process-spawn.md`.)*

### The Problem

`cnc-web`'s dev server is still the one thing this app doesn't start on
its own — the exact gap both Lesson 19 and Lesson 20 named and
deliberately deferred.

### Project Change

- **Reference Source** — none (same reasoning as every unit in Lessons
  19–20 — Stage 2, no reference counterpart).
- **Files affected** — `cnc-desktop/main.js`.
- **Change type** — add.
- **Location** — a new function, alongside `startBackend`.
- **Dependencies** — `CNC_WEB_DIR`, a new constant built the same way as
  `CNC_SERVICE_DIR` (Lesson 20).

### The New Code

```javascript
const CNC_WEB_DIR = path.join(__dirname, "..", "cnc-web");

function startFrontend() {
  const isWindows = process.platform === "win32";
  frontendProcess = spawn("npm", ["run", "dev"], {
    cwd: CNC_WEB_DIR,
    shell: isWindows,
  });

  frontendProcess.stdout.on("data", (chunk) => {
    console.log(`[cnc-web] ${chunk.toString().trimEnd()}`);
  });
  frontendProcess.stderr.on("data", (chunk) => {
    console.log(`[cnc-web] ${chunk.toString().trimEnd()}`);
  });
  frontendProcess.on("exit", (code) => {
    console.log(`[cnc-web] exited with code ${code}`);
    frontendProcess = null;
  });
}
```

### The Updated Project

`startFrontend`, in full, placed directly after `startBackend` —
structurally identical to it, `let frontendProcess = null;` declared
alongside `backendProcess` at the top of the file:
```javascript
let backendProcess = null;
let frontendProcess = null;

// ...startBackend, unchanged from Lesson 20...

function startFrontend() {
  const isWindows = process.platform === "win32";
  frontendProcess = spawn("npm", ["run", "dev"], {
    cwd: CNC_WEB_DIR,
    shell: isWindows,
  });

  frontendProcess.stdout.on("data", (chunk) => {
    console.log(`[cnc-web] ${chunk.toString().trimEnd()}`);
  });
  frontendProcess.stderr.on("data", (chunk) => {
    console.log(`[cnc-web] ${chunk.toString().trimEnd()}`);
  });
  frontendProcess.on("exit", (code) => {
    console.log(`[cnc-web] exited with code ${code}`);
    frontendProcess = null;
  });
}
```

### Mechanical Walkthrough

- `path.join(__dirname, "..", "cnc-web")` — **(b) reappearing**, the
  identical pattern Lesson 20 used for `CNC_SERVICE_DIR`, pointed at a
  different real sibling folder.
- `spawn("npm", ["run", "dev"], { cwd: CNC_WEB_DIR, shell: isWindows })`
  — **(b) reappearing** `spawn` itself; **(a) first appearance of the
  `shell` option**, not shown in `node-child-process-spawn.md`'s own
  isolated lab. Confirmed, this session: on macOS, `which npm` resolves
  to a real, directly-executable file starting with `#!/usr/bin/env node`
  — the operating system itself knows how to run it, no shell needed.
  On Windows, the installed command is `npm.cmd`, a batch script — the
  OS cannot execute a `.cmd` file the way it executes a real binary or a
  `#!`-scripted one; `spawn` needs `shell: true` there specifically, so
  the command runs through `cmd.exe` instead of being launched directly.
  `startBackend`'s own `python`/`python3` split (Lesson 20) never needed
  this, because a real Python interpreter *is* a directly-executable
  file on every platform — the same `spawn` call, two genuinely different
  real requirements, driven by what's actually being spawned.
- Everything else in `startFrontend` — **(b) reappearing**, identical in
  shape to `startBackend`, just prefixed `[cnc-web]` instead of
  `[cnc-service]`.

### CS Lens

Same **inter-process communication** framing the concept file already
names. Worth stating precisely, since it's the real point of this whole
lesson: `spawn`'s own contract (start a program, stream its output,
report its exit) is uniform — but *how* a given program is correctly
invoked at all is not, and depends on real, external facts about that
specific program and platform, not on anything `spawn` itself can paper
over.

### SE Lens

The real, tempting shortcut here — writing `shell: true` unconditionally,
on every platform, since it would have worked fine on macOS too — was
deliberately not taken. `node-child-process-spawn.md`'s own SE Lens
already names the real cost of an unnecessary shell layer: an extra real
process (the shell itself) sits between this code and the actual
program, and any part of the command string a shell would interpret
specially (quoting, `&&`, environment-variable expansion) becomes a
real, if narrow, injection surface the moment any part of that string
isn't a fixed literal — irrelevant here (`"npm"`/`"run"`/`"dev"` are all
fixed), but a real, general reason not to reach for `shell: true` as a
default habit rather than a specific, named requirement.

### Verified, Run for Real

```
[cnc-web] 
> cnc-web@0.0.0 dev
> vite

  VITE v8.1.5  ready in 224 ms

  ➜  Local:   http://localhost:5180/
[cnc-desktop] attempt 1 failed (ERR_CONNECTION_REFUSED), retrying in 375ms
[cnc-desktop] loaded http://localhost:5180 successfully on attempt 1
[cnc-service]  * Serving Flask app 'app'
 * Running on http://127.0.0.1:5000
[cnc-service] 127.0.0.1 - - [21/Jul/2026 07:37:56] "GET /api/tools HTTP/1.1" 200 -
```
Real terminal output, this session, from a single `npm start` — with
*nothing* started by hand beforehand: both real dev servers came up on
their own, the window's own Lesson-19 retry logic absorbed the real,
brief gap before Vite was ready (identical shape to every previous
lesson's own verification of that logic), and a real API call
(`GET /api/tools`) succeeded, confirming the whole real chain — window,
frontend, backend — actually works end to end from one command.

---

## Concept Unit: Cleaning Up Both, and a Second Real Difference

### The Problem

`before-quit` (Lesson 20) only knows how to stop `backendProcess` —
`frontendProcess` would be left running, and orphaned, exactly the
failure Lesson 20 already caused and fixed once, now reintroduced by
this lesson's own new code.

### Project Change

- **Files affected** — `cnc-desktop/main.js`.
- **Change type** — replace (`before-quit`'s handler body); replace
  (`app.whenReady()`'s callback, adding one call).

### The New Code

```javascript
app.whenReady().then(() => {
  startBackend();
  startFrontend();
  createWindow();
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendProcess) {
    frontendProcess.kill();
  }
});
```

### The Updated Project

Both call sites, in their real, current, complete form — no other part
of either function changed:
```javascript
app.whenReady().then(() => {
  startBackend();
  startFrontend();
  createWindow();
});

// ...window-all-closed, activate, unchanged from Lesson 19...

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendProcess) {
    frontendProcess.kill();
  }
});
```

### Mechanical Walkthrough

- `startFrontend();` added to the `whenReady` callback — **(c) already
  established** a function call; order (`startBackend`, then
  `startFrontend`, then `createWindow`) is written top-to-bottom but
  doesn't enforce any real waiting between the three, same reasoning
  Lesson 20 already gave for why `startBackend` and `createWindow`
  don't block each other either.
- The second `if (frontendProcess) { frontendProcess.kill(); }` block —
  **(b) reappearing**, structurally identical to the existing
  `backendProcess` check right above it.

### CS Lens / SE Lens

Same as Lesson 20's own "Cleaning Up on Quit" unit — nothing new to
re-derive about the pattern itself. What *is* new, found only by
actually testing this rather than assuming the previous lesson's result
would simply repeat:

### Verified, Run for Real — a Real, Different Exit Code

```
ps -o pid,ppid,command -p 88822
  PID  PPID COMMAND
88822 88803 node .../cnc-web/node_modules/.bin/vite
```
Confirmed, this session, *before* quitting: `frontendProcess` (the `npm`
process this code directly holds a reference to) is not the same real
process as the one actually listening on port 5180 — `npm run dev`
itself spawns `vite` as its own child, `88822`, exactly the same
one-level-removed relationship Lesson 20 already found between
`backendProcess` and Flask's own debug-mode reloader child.

```
[cnc-service] exited with code 0
[cnc-web] exited with code 143
```
Real output, this session, after the same `before-quit` handler ran:
both real process trees were confirmed fully gone (`ps -p` on every real
pid involved returned nothing; `lsof -i :5000 -i :5180` showed nothing
listening) — `.kill()` cascaded correctly to `vite`, the same as it
cascaded to Flask's reloader. But the two backends reported genuinely
different exit codes for the identical `.kill()` call: Flask's own
signal handling shuts down cleanly and reports `0`; `npm`/`vite` simply
terminated on the signal and reported `143` — `128 + 15`, the standard
Unix convention for "this process was ended by signal number 15"
(`SIGTERM`, what `.kill()` sends by default). Both are real, correct
success — the *shape* of that success just isn't identical across
different real tools, exactly this lesson's own point.

---

## Connect the Pieces

`npm start` now runs one real chain, start to finish, confirmed live
with nothing started by hand first: `app.whenReady()` resolves,
`startBackend()` and `startFrontend()` each spawn a real, independent
process — `python3 app.py` directly, `npm run dev` via a shell only on
Windows — and `createWindow()` opens the real window and begins
Lesson 19's retry loop against `cnc-web`'s dev URL, unaffected by
whether either backend has actually finished starting yet. Both real
dev servers' own output streams into this app's single terminal,
prefixed by name. When the app quits, `before-quit` fires once and calls
`.kill()` on both processes this code directly holds references to —
which, confirmed live for both, tears down not just that one process but
the real child each of them independently spawns underneath it
(Flask's debug reloader, `npm`'s own `vite` child), even though the two
report their own shutdown differently.

## What Breaks Without This

Caused for real, this session: the `frontendProcess.kill()` block was
temporarily removed from `before-quit`, leaving only the existing
`backendProcess` cleanup. The app was started (both dev servers coming
up automatically, as normal) and then quit normally.

**Real failure confirmed:** `cnc-service` and its reloader child were
both gone, exactly as Lesson 20 already verified — but `ps -ef | grep
vite` still showed the real `npm run dev`/`vite` process pair, alive,
and `lsof -i :5180` still showed something listening. Restoring the
removed block and repeating the identical quit: both real process pairs
confirmed gone, both ports free.

## Exercises

1. Temporarily change `shell: isWindows` to `shell: false` unconditionally
   and run this on the platform you actually have — if it's macOS/Linux,
   confirm nothing breaks (per this lesson's own reasoning about why);
   if you have access to a Windows machine, confirm it does, and read
   the real error.
2. Add a `console.log(process.platform)` at the very top of `startFrontend`
   and confirm, on your own machine, which real branch `isWindows`
   actually takes.
3. Look up Node's own list of standard signal-to-exit-code mappings (the
   `128 + signal number` convention this lesson's own "Verified" section
   named) and, without changing any code, predict what exit code
   `backendProcess` would report if it were stopped with `SIGKILL`
   (signal 9) instead of the default `SIGTERM` `.kill()` sends — then
   confirm by actually calling `backendProcess.kill("SIGKILL")` once.

## Definition of Done

- [ ] `npm start` in `cnc-desktop`, with *nothing* started by hand first,
      brings up the complete app — both real dev servers' output visible,
      prefixed, in one terminal.
- [ ] A real API call through the loaded app (any tool-table action, or
      running a program) succeeds, confirming the frontend actually
      reached the backend, not just that both processes happened to
      start.
- [ ] Quitting the app leaves nothing listening on either port 5000 or
      5180 — confirmed yourself with `lsof` (or your platform's
      equivalent) immediately after.
- [ ] You reproduced this lesson's own "What Breaks Without This" and
      confirmed the real orphaned-frontend failure yourself before
      restoring the fix.
- [ ] A git commit exists explaining *why* (one command instead of
      three, and the real, different way two different tools respond to
      the same shutdown signal) — not just a list of files changed.
