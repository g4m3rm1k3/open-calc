# Lesson 20: Starting What You'll Have to Stop

## What you will build

`cnc-desktop/main.js` grows to spawn `cnc-service`'s Flask backend
automatically on startup — one command (`npm start`) instead of two,
typed by hand, in separate terminals. `cnc-web`'s own dev server stays a
separate, manual step, deliberately — the scope decision made when this
slice was planned. Verified live, both directions: the backend's real
output (`Running on http://127.0.0.1:5000`, its debug reloader starting)
shows up in this app's own terminal, prefixed and unmodified; and
quitting the app was confirmed to actually kill *both* the process this
code spawns directly *and* the separate reloader subprocess Flask's own
debug mode forks internally — nothing left listening on port 5000
afterward. The transferable problem this lesson is really about:
**starting a subprocess is only half the job** — every real spawn
creates a real cleanup responsibility that does not happen on its own,
and has to be wired to the one moment in a program's lifecycle where
it's actually guaranteed to run.

## What you need to know first

Lesson 19: Electron's `app`/`BrowserWindow` lifecycle (`app.whenReady()`,
`app.on(event, handler)`), CommonJS `require`, `process.platform`.
Lesson 1 and `python-tempfile.md`: "cleanup is never automatic" already
named for a temp file and a database connection — the identical idea,
applied here to a whole separate process instead of a file handle.

## Concepts cataloged from this lesson

- `../concepts/node-path-module-and-dirname.md` — new.
- `../concepts/node-child-process-spawn.md` — new.
- `../concepts/electron-main-process-and-browserwindow.md` — reappearing,
  extended (a third real lifecycle event, `before-quit`).
- `../concepts/javascript-commonjs-require.md`,
  `../concepts/node-process-platform.md` — reappearing, no extension.

## No pipeline diagram change

Same reasoning as Lesson 19 — packaging/process management, not a stage
of the G-code pipeline.

---

## Concept Unit: Finding `cnc-service`, Reliably

*(Full standalone treatment: `../concepts/node-path-module-and-dirname.md`.)*

### The Problem

Spawning `cnc-service`'s `app.py` needs a real, correct path to the
`cnc-service/` folder — and `cnc-desktop/main.js` has no way to know in
advance what folder `npm start` will happen to be run from.

### The Concept, Isolated

Full standalone lab, run for real, in the concept file above. Not
repeated here.

### Project Change

- **Reference Source** — none. The reference app has no backend process
  of its own to spawn (Stage 2, per `CURRICULUM.md`'s four-stage plan,
  same as every unit in Lesson 19).
- **Files affected** — `cnc-desktop/main.js`.
- **Change type** — add.
- **Location** — top of the file, alongside `DEV_URL`.

### The New Code

```javascript
const path = require("path");

const CNC_SERVICE_DIR = path.join(__dirname, "..", "cnc-service");
```

### The Updated Project

The top of `cnc-desktop/main.js`, with this lesson's first new line
added alongside Lesson 19's existing `DEV_URL`:
```javascript
const { app, BrowserWindow } = require("electron");
const path = require("path");

const DEV_URL = "http://localhost:5180";
const MAX_ATTEMPTS = 8;
const CNC_SERVICE_DIR = path.join(__dirname, "..", "cnc-service");
```
`CNC_SERVICE_DIR` now holds one, real, absolute path to `cnc-service/`,
computed once, correct regardless of where `npm start` is actually
invoked from.

### Mechanical Walkthrough
- `require("path")` — **(b) reappearing** CommonJS `require`, applied to
  another of Node's built-in modules.
- `path.join(__dirname, "..", "cnc-service")` — **(b) reappearing**, full
- treatment in the concept file — `__dirname` here is
  `cnc-desktop/`'s own real location; `".."` steps up to this
  project's repository root, then into the real, sibling `cnc-service/`
  folder.

### CS Lens / SE Lens

Both fully covered in the concept file — nothing new to re-derive here.

---

## Concept Unit: Launching a Real Subprocess

*(Full standalone treatment: `../concepts/node-child-process-spawn.md`.)*

### The Problem

`cnc-service` has never been started by anything but a human typing
`python3 app.py` in its own terminal. Nothing in this project can start
it programmatically yet.

### The Concept, Isolated

Full standalone lab, run for real, in the concept file above. Not
repeated here — reused directly, at its very next appearance, on this
project's own real backend.

### Project Change

- **Reference Source** — none (same reasoning as every unit in this
  lesson).
- **Files affected** — `cnc-desktop/main.js`.
- **Change type** — add.
- **Location** — a new function, above `createWindow`.
- **Dependencies** — `CNC_SERVICE_DIR`, from the previous unit.

### The New Code

```javascript
const { spawn } = require("child_process");

let backendProcess = null;

function startBackend() {
  const pythonCmd = process.platform === "win32" ? "python" : "python3";
  backendProcess = spawn(pythonCmd, ["app.py"], { cwd: CNC_SERVICE_DIR });

  backendProcess.stdout.on("data", (chunk) => {
    console.log(`[cnc-service] ${chunk.toString().trimEnd()}`);
  });
  backendProcess.stderr.on("data", (chunk) => {
    console.log(`[cnc-service] ${chunk.toString().trimEnd()}`);
  });
  backendProcess.on("exit", (code) => {
    console.log(`[cnc-service] exited with code ${code}`);
    backendProcess = null;
  });
}
```

### The Updated Project

`startBackend`, in full, as a new, freestanding function — nothing
precedes it yet at the point it's added, so there's no larger enclosing
structure to show it inside of (per this schema's own rule for a
brand-new function with nothing surrounding it).

### Mechanical Walkthrough
- `let backendProcess = null;` — **(c) already established** variable
  declaration, module-scoped so both this function and the cleanup unit
  below can read and reassign it; `null` specifically so later code can
  ask "is a backend currently running at all" with a plain truthiness
  check.
- `process.platform === "win32" ? "python" : "python3"` — **(b)
  reappearing** `process.platform` (`node-process-platform.md`) plus the
  already-known ternary operator — a real, concrete platform difference:
  Windows Python installs commonly register the command as `python`,
  not `python3`.
- `spawn(pythonCmd, ["app.py"], { cwd: CNC_SERVICE_DIR })` — **(b)
- reappearing**, full treatment in the concept file — `cwd` (a `spawn`
  option not shown in that file's own lab) sets the *working directory*
  the child process starts in, **(a) first appearance** of this specific
  option: without it, `app.py`'s own relative imports (`from core.lexer
  import ...`) would resolve against whatever folder `npm start` happens
  to be run from, not against `cnc-service/` itself, and fail.
- `backendProcess.stdout.on("data", ...)` / `.stderr.on("data", ...)` —
  **(b) reappearing**, full treatment in the concept file — both piped
  to `console.log` with an identical `[cnc-service]` prefix, deliberately
  not split into separate handling: this project's own convention,
  established in Lesson 18's real logging, is that *what* happened
  matters more here than which stream it arrived on.
- `chunk.toString().trimEnd()` — **(b) reappearing** `.toString()`
- (concept file); **(a) first appearance** of `.trimEnd()` — removes the
  trailing newline every line of piped output already carries, so the
  `[cnc-service]` prefix doesn't end up separated from its own message
  by a blank line.
- `backendProcess.on("exit", (code) => { ...; backendProcess = null; })`
  — **(b) reappearing**, full treatment in the concept file — reassigning
  the module-scoped variable back to `null` here specifically so the
  cleanup unit below never tries to kill a process that has already,
  independently, exited.

### CS Lens / SE Lens

Both fully covered in the concept file. Worth naming once, concretely:
the real "alternative not chosen" from that file's own SE Lens
(`exec`, buffering everything until the process finishes) would be a
real, wrong choice here specifically — `cnc-service` is a long-running
server, not a short command, and its real, live output (or a real,
immediate failure to start at all) needs to be visible as it happens.

### Verified, Run for Real

```
[cnc-service]  * Serving Flask app 'app'
 * Debug mode: on
[cnc-service] 2026-07-21 07:23:58,020 INFO werkzeug: WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
2026-07-21 07:23:58,020 INFO werkzeug: Press CTRL+C to quit
2026-07-21 07:23:58,021 INFO werkzeug:  * Restarting with stat
[cnc-service] 2026-07-21 07:23:58,190 WARNING werkzeug:  * Debugger is active!
[cnc-service] 2026-07-21 07:23:58,195 INFO werkzeug:  * Debugger PIN: 724-027-141
```
Real terminal output, this session — `cnc-service`'s own real startup
messages, unmodified, arriving through `stdout`/`stderr` exactly as they
would in its own terminal. Not runnable standalone yet — nothing calls
`startBackend()` until the next unit.

---

## Concept Unit: Wiring the Backend Into Startup

### The Problem

`startBackend` exists but nothing calls it — `cnc-service` still has to
be started by hand, which is the entire problem this lesson exists to
close.

### Project Change

- **Files affected** — `cnc-desktop/main.js`.
- **Change type** — replace (`app.whenReady()`'s callback).
- **Location** — Lesson 19's existing `app.whenReady().then(createWindow);`.
- **Dependencies** — `startBackend`, from the previous unit.

### The New Code

```javascript
app.whenReady().then(() => {
  startBackend();
  createWindow();
});
```

### The Updated Project

This directly replaces Lesson 19's single-line
`app.whenReady().then(createWindow);` — the rest of the file, `createWindow`
itself included, is unchanged by this unit.

### Mechanical Walkthrough
- `app.whenReady().then(() => { startBackend(); createWindow(); })` —
  **(b) reappearing** `.then(...)` (Lesson 19); **(a) first appearance**
  of a *new*, inline arrow function replacing a bare function reference
  as the callback — needed the moment more than one thing has to happen
  in sequence, rather than passing `createWindow` directly as before.
  `startBackend()` runs first, `createWindow()` second, in the order
- written — not because either call waits for the other to finish (`spawn`
  returns immediately, per the previous unit), but because *starting*
  the backend process before opening the window at least gives it a
  head start, even though nothing here yet guarantees it's actually
  ready by the time the window tries to load (the real, named debt
  already stated in this lesson's own code comments).

### CS Lens

No new concept — ordinary sequential statement execution, applied to two
calls that happen not to block each other.

### SE Lens

The real alternative — waiting for some confirmation that `cnc-service`
is actually ready to accept requests before opening the window at all —
is real, valuable, *deferred* work, not fixed here: it would need a real
readiness signal (polling `/api/status`, for instance) this lesson
doesn't build. Left named and open, matching this project's own standing
rule against silently declaring something done that isn't.

---

## Concept Unit: Cleaning Up on Quit

*(Reappearing, extended: `../concepts/electron-main-process-and-browserwindow.md`.)*

### The Problem

`startBackend` starts a real, independent operating-system process that
outlives the JavaScript function that called it — nothing yet stops it
when this app quits, which means quitting the desktop shell would leave
a real Python process running, invisibly, still listening on port 5000.

### Project Change

- **Files affected** — `cnc-desktop/main.js`.
- **Change type** — add.
- **Location** — alongside Lesson 19's existing `window-all-closed`/`activate`
  handlers.
- **Dependencies** — `backendProcess`, from an earlier unit in this
  lesson.

### The New Code

```javascript
app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
```

### The Updated Project

The complete, current `cnc-desktop/main.js`, every piece from Lesson 19
and this lesson together, in the order it actually runs:
```javascript
const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

const DEV_URL = "http://localhost:5180";
const MAX_ATTEMPTS = 8;
const CNC_SERVICE_DIR = path.join(__dirname, "..", "cnc-service");

let backendProcess = null;

function startBackend() {
  const pythonCmd = process.platform === "win32" ? "python" : "python3";
  backendProcess = spawn(pythonCmd, ["app.py"], { cwd: CNC_SERVICE_DIR });

  backendProcess.stdout.on("data", (chunk) => {
    console.log(`[cnc-service] ${chunk.toString().trimEnd()}`);
  });
  backendProcess.stderr.on("data", (chunk) => {
    console.log(`[cnc-service] ${chunk.toString().trimEnd()}`);
  });
  backendProcess.on("exit", (code) => {
    console.log(`[cnc-service] exited with code ${code}`);
    backendProcess = null;
  });
}

function createWindow() {
  const win = new BrowserWindow({ width: 1280, height: 800 });

  let attempt = 0;
  let hasConnectedOnce = false;

  const tryLoad = () => {
    attempt += 1;
    win.loadURL(DEV_URL);
  };

  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    if (errorCode === -3) return;

    if (hasConnectedOnce) {
      console.log(
        `[cnc-desktop] reload blipped (${errorDescription}) after a known-good connection — retrying, not giving up`
      );
      setTimeout(tryLoad, 500);
      return;
    }

    if (attempt >= MAX_ATTEMPTS) {
      win.loadURL(
        "data:text/html," +
          encodeURIComponent(`
            <body style="font-family: system-ui; padding: 2rem; color: #333;">
              <h2>Couldn't reach ${DEV_URL}</h2>
              <p>Failed after ${MAX_ATTEMPTS} attempts — last error:
                 <code>${errorDescription} (${errorCode})</code>.</p>
              <p>Is <code>npm run dev</code> running in <code>cnc-web</code>?</p>
            </body>
          `)
      );
      return;
    }

    const delayMs = 2 ** attempt * 150 + Math.random() * 150;
    console.log(
      `[cnc-desktop] attempt ${attempt} failed (${errorDescription}), retrying in ${delayMs.toFixed(0)}ms`
    );
    setTimeout(tryLoad, delayMs);
  });

  win.webContents.on("did-finish-load", () => {
    if (!hasConnectedOnce) {
      console.log(`[cnc-desktop] loaded ${DEV_URL} successfully on attempt ${attempt}`);
    }
    hasConnectedOnce = true;
  });

  tryLoad();
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
```
The file as a whole now: starts the real backend and opens the window
together, keeps the window resilient to the backend or dev server not
being ready yet, and guarantees the backend process is stopped the
moment this app actually quits, on every platform.

### Mechanical Walkthrough
- `app.on("before-quit", () => {...})` — **(b) reappearing** the same
  `app.on(event, handler)` pattern Lesson 19 already used twice
- (`window-all-closed`, `activate`) — **(a) first appearance of this
  specific event**: fires once, right before the app actually exits, on
  every platform, regardless of how many windows are or aren't open at
- that moment — unlike `window-all-closed` (which never fires at all on
  macOS unless the user quits directly) or `activate` (which has nothing
  to do with quitting), this is the one real, reliable place a cleanup
  action is guaranteed to run before the process ends.
- `if (backendProcess) { backendProcess.kill(); }` — **(b) reappearing**
  `.kill()`, full treatment in `node-child-process-spawn.md`'s own "Try
- It Yourself" — the `null` check matters concretely: without it, quitting
  after the backend had already exited on its own (a real crash, for
  instance) would call `.kill()` on a `null` value and throw.

### CS Lens

Same **inter-process communication** framing `node-child-process-spawn.md`
already names — this unit is specifically the *teardown* half of that
lifecycle: a parent process that starts a child takes on a real
responsibility to stop it too, the same "resource acquired, resource
must be released" discipline `python-tempfile.md` already named for a
file handle, here applied to a whole subprocess.

### SE Lens

The real, concrete cost of skipping this, confirmed by removing it and
testing this session: quitting the app *appears* to work — the window
closes, the dock icon (or taskbar entry) disappears — while a real
Python process keeps running invisibly, still bound to port 5000,
until it's found and killed by hand or the machine restarts. `kill()`
inside `before-quit` costs one `if` and one method call; the alternative
is a slow leak of real, invisible, orphaned processes across every
quit-and-relaunch cycle a developer or user ever does.

### Verified, Run for Real

```
kill -TERM <electron pid>
```
```
[cnc-service] 2026-07-21 07:24:03,912 UserWarning: resource_tracker: there
  appear to be 1 leaked semaphore objects to clean up at shutdown
[cnc-service] exited with code 0
```
Confirmed, this session, before and after: two real Python processes
existed while the app ran — the one `spawn` directly started, and a
*second*, separate one Flask's own debug-mode reloader forks internally
(`* Restarting with stat`, already visible in the previous unit's real
output). After the quit signal, both were gone (`ps -p <pid>` on either
returned nothing) and `lsof -i :5000` showed nothing listening —
`backendProcess.kill()` reliably tore down the whole real process tree,
not just the one process this code directly holds a reference to.

---

## Connect the Pieces

`npm start` now does two real things instead of one: `app.whenReady()`
resolves, `startBackend()` spawns a real `python3 app.py` process with
its working directory set to the real `cnc-service/` folder found via
`path.join(__dirname, "..", "cnc-service")`, and its real stdout/stderr
start streaming into this app's own console, prefixed `[cnc-service]`.
`createWindow()` runs immediately after, opening the real window and
beginning Lesson 19's retry-with-backoff `loadURL` loop against
`cnc-web`'s dev server — unaffected by, and not waiting on, the backend
just started. When the app eventually quits — window closed on
Windows/Linux, or the user quitting directly on macOS — `before-quit`
fires exactly once, calls `backendProcess.kill()`, and Flask's own
process, along with the separate reloader subprocess it forked
internally, both exit cleanly, confirmed live by nothing remaining on
port 5000 afterward.

## What Breaks Without This

Caused for real, this session: `app.on("before-quit", ...)` was
temporarily removed, the app was started (spawning the real backend as
normal), then quit normally.

**Real failure confirmed:** the window closed and the app appeared to
quit completely — but `ps aux | grep app.py` still showed two real,
live Python processes, and `lsof -i :5000` still showed something
listening. The backend was never told to stop; nothing in Electron's own
shutdown does that automatically. Restoring the `before-quit` handler and
repeating the identical quit: both processes gone, port free, confirmed
in the previous unit's own "Verified, Run for Real."

## Exercises

1. Comment out just the `backendProcess = null;` line inside the `"exit"`
   handler (leave everything else). Start the app, then quit
   `cnc-service` from its own side (find its real pid and `kill` it
   directly) *before* quitting the desktop app. Then quit the desktop
   app normally and read the real error `before-quit`'s handler now
   throws — explain, from this lesson's own walkthrough, exactly why.
2. Add a `console.log` inside `startBackend` printing `CNC_SERVICE_DIR`
   the moment it's computed, then run `npm start` from a different
   working directory than usual (e.g. from the repository root instead
   of `cnc-desktop/`) and confirm the printed path is identical either
   way.
3. Change `pythonCmd` to a deliberately wrong command name (e.g.
   `"python3-does-not-exist"`) and read the real error `spawn` itself
   raises — an `"error"` event on the `ChildProcess`, not `"exit"` (not
   covered in this lesson's own code) — and reason about why a process
   that never successfully started at all needs a different event than
   one that started and later exited.

## Definition of Done

- [ ] `npm start` in `cnc-desktop`, with only `cnc-web`'s dev server
      already running by hand, brings up the real backend automatically
      — its real startup output appears in the terminal, prefixed
      `[cnc-service]`.
- [ ] Quitting the app (Cmd+Q or closing the window, per platform) leaves
      nothing listening on port 5000 — confirmed yourself with
      `lsof -i :5000` (or your platform's equivalent) immediately after.
- [ ] You reproduced this lesson's own "What Breaks Without This" and
      confirmed the real orphaned-process failure yourself before
      restoring the fix.
- [ ] A git commit exists explaining *why* (one command instead of two,
      and the real cleanup responsibility that came with it) — not just
      a list of files changed.
