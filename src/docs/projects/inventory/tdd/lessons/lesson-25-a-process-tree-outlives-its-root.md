# Lesson 25: A Process Tree Outlives Its Root

**What you will build:** a real fix for a bug this project actually shipped
and only found by running `cnc-desktop` on Windows for the first time: the
Electron shell's own graceful-quit cleanup (`before-quit`, Lesson 20) was
already calling `.kill()` on every process it started — and on Windows,
that call was silently failing to do its job. Quitting the app left a real
`node`/Vite process running behind it, still holding port 5180, invisible
until the *next* launch collided with it. The transferable problem
underneath: a process you started is not the same thing as the process
that started because of you — and the exact command line you use to start
something determines whether "stop it" actually reaches everything that
resulted from starting it.

**What you need to know first:** Lesson 19's Electron main-process
lifecycle (`app`, `BrowserWindow`, `app.whenReady()`); Lesson 20's
`startBackend`/`backendProcess` and its original `before-quit` cleanup;
Lesson 21's `startFrontend`, and its own comment explaining *why*
`shell: isWindows` exists at all (`npm` ships as a real executable on
macOS/Linux, but as `npm.cmd` — a Windows batch script — on Windows, which
`spawn` cannot run directly without a shell); `node-child-process-spawn.md`,
already covering `spawn` itself in full.

---

## How This Bug Was Actually Found

Not by reading code — by running it. `cnc-desktop` had only ever been
verified on macOS (an open item this project had already named honestly
in `STATUS.md`). Launching it on Windows for the first time surfaced two
separate, real problems in quick succession, and this lesson is about the
second one specifically — the first is worth stating plainly since it's
exactly the kind of thing that only shows up by actually running a thing,
not by reading it:

The very first launch crashed immediately: `Cannot read properties of
undefined (reading 'whenReady')`, thrown from `main.js`'s own
`app.whenReady()` call — the exact API `electron-main-process-and-browserwindow.md`
already proved works. The real cause: this specific development shell had
`ELECTRON_RUN_AS_NODE=1` set in its environment (VS Code's own integrated
terminal sets this, so that any Electron binary launched *inside* it runs
as plain Node instead of popping up a nested GUI window). With that set,
`require("electron")` genuinely returns a path string, not the real `app`/
`BrowserWindow` API — a real environment-variable gotcha, not a bug in
`main.js` at all. Unsetting it (`env -u ELECTRON_RUN_AS_NODE npm start`)
made the app launch normally. Worth naming, not worth a full lesson: this
is a fact about *this specific terminal*, not a transferable code fix.

The second problem was real, reproducible, and lived in `main.js` itself —
and it's what the rest of this lesson is about.

---

## Concept Unit: Finding What's Holding a Port

### The Problem

Relaunching `cnc-desktop` a second time, right after quitting it once
cleanly, failed with a real error from `cnc-web`'s own dev server:
`Error: Port 5180 is already in use`. `network-port.md` (already covered,
early in this project) already establishes that a port can only be held
by one program at a time — but that fact alone doesn't say which program.
Staring at "already in use" with no next step isn't good enough; the real
next step is finding the exact process responsible.

### The Concept, Isolated

First real use of process/port inspection tooling in this project. The
full isolated lab — resolving a held port back to a real PID with
`Get-NetTCPConnection`, then that PID back to a real process name and
path with `Get-Process` — lives in `concepts/windows-process-port-inspection.md`,
run for real this session against an actual stray process on this
machine.

### Project Change

- **Reference Source:** none — this is a real Windows-only diagnostic
  need, first encountered on this project's first real Windows run, with
  no counterpart in any earlier lesson or the `cnc-sim` reference app.
- **Files affected:** none. This is a terminal technique used to diagnose
  the problem, not a change to any project file.
- **Change type:** n/a.
- **Location:** n/a.
- **Dependencies:** none.

There is no throwaway example to discard here, and nothing to return to
in an "Updated Project" step — unlike every other unit in this project so
far, this one's "new code" is a command run directly against the live
machine, not a fragment landing inside a file.

### The Commands

```powershell
Get-NetTCPConnection -LocalPort 5180 -State Listen | Select-Object OwningProcess
Get-Process -Id 28424 | Select-Object Id, ProcessName, Path, StartTime
```

### Mechanical Walkthrough

Full first-appearance treatment of both cmdlets lives in
`windows-process-port-inspection.md`. Summarized: `Get-NetTCPConnection`
queries the OS's own real network-socket state, filtered to one port and
the `Listen` state; `Get-Process -Id` looks up one specific process by its
numeric PID (not by name, which could match several unrelated processes
at once — a real distinction that mattered here, since this machine had
six separate `node.exe` processes running at the time, only one of which
was the actual culprit).

### CS Lens

Per `windows-process-port-inspection.md`: reverse lookup through
OS-maintained state — the kernel already tracks the socket-to-process
mapping for its own purposes; these cmdlets just expose it.

### SE Lens

The real alternative — restarting the whole machine, or guessing which of
six running `node` processes to kill — is slower and destroys more state
than necessary. Two chained, read-only queries reached the exact right
PID with nothing else disturbed.

### Run It — Real Output

```
OwningProcess
-------------
        28424

Id          : 28424
ProcessName : node
Path        : C:\nvm4w\nodejs\node.exe
StartTime   : 7/19/2026 1:12:32 PM
```

A real process, started two days before this check, confirmed as the
actual thing holding port 5180 — and, tellingly, started *before* this
session's own first `cnc-desktop` launch even happened. That timing gap
is the first real clue that this isn't a one-off fluke: something has
been leaving processes behind across multiple past sessions, not just
this one.

---

## Concept Unit: A Process Tree Outlives Its Root

### The Problem

The stray process found above raised the real question this project
actually needed answered: `main.js`'s `before-quit` handler (Lesson 20)
already calls `backendProcess.kill()` and `frontendProcess.kill()` on
every quit. If that code has run every time this app was quit, why is
anything ever left behind at all?

### The Concept, Isolated

First real look, in this project, at what happens to a child process when
its parent is the one that gets terminated. The full isolated lab lives
in `concepts/os-process-tree-and-orphaned-processes.md` — run for real
this session with a fully synthetic setup (no project code): a trivial
`node` script, launched through a shell wrapper (`{ shell: true }`, the
same option `startFrontend` uses), then killed via `wrapper.kill()`.

**Real result, run this session:**
```
wrapper.pid (the shell, not the node script): 53820
grandchild pid: 79856
--- calling wrapper.kill() ---
```
Checked immediately after: `Get-Process -Id 79856` (the real `node`
script) — still running. `Get-Process -Id 53820` (the shell) — gone.

**What it proves:** `.kill()` terminated exactly the one PID it was
called on — the shell — and had no effect at all on the real process that
shell had, in turn, launched.

### Escalating to the Real Case

The isolated lab above uses a script with no relationship to this
project, on purpose, to prove the mechanism cleanly. The same shape,
against this project's own real dev server, confirms it's not a
lab-only artifact:

```javascript
const { spawn } = require("child_process");
const p = spawn("npm", ["run", "dev"], { cwd: "cnc-web", shell: true });
setTimeout(() => p.kill(), 4000);
```

**Real output, run this session:**
```
spawned wrapper pid: 110568
[child]
> cnc-web@0.0.0 dev
> vite
--- calling p.kill() now ---
done
```

Checked immediately after: `Get-NetTCPConnection -LocalPort 5180` still
resolved to a real, live `node.exe` — a different PID than the wrapper
`spawn` had returned. The exact same gap, this time against the exact
command `startFrontend` itself runs.

### Discard

Both the fully synthetic lab and this escalation script were run once,
to prove the mechanism, and are not part of the project — nothing from
either one is copied into `cnc-desktop`.

### CS Lens

Per `os-process-tree-and-orphaned-processes.md`: a process tree, and what
"orphaning" means when a parent exits (or is killed) while its child
keeps running — a real OS-level fact, not something either the shell or
Node hides or works around by default.

### SE Lens

The real, easy assumption this project's own original `before-quit` code
made without ever stating it: "the process I called `.kill()` on is the
process doing the real work." That assumption is only true when nothing
sits between the call and the real work — and `startFrontend`'s own
`shell: isWindows` (Lesson 21) is exactly that "something," on Windows
specifically. The bug wasn't in `.kill()` being broken; it was in
`before-quit` calling it as if `frontendProcess` were the real `npm`/Vite
process, when on Windows it's actually the shell wrapping it.

Worth stating plainly, not glossed over: Lesson 21 itself already claims,
in `CURRICULUM.md`, that killing this exact process "cascades to the real
child process it spawns internally, no orphan." That claim was real — and
scoped, without saying so at the time, to macOS, the only platform
`cnc-desktop` had actually been run on. It was never re-verified on
Windows until this lesson. See `CURRICULUM.md`'s own Lesson 25 correction,
alongside Slice 3, for the full record.

### Run It — Real Output

Already shown above, twice — once fully synthetic, once against this
project's own real dev-server command. Neither run touched `main.js`
itself yet; both exist only to prove the mechanism before the fix below
changes real project code.

---

## Concept Unit: Running a Command and Waiting for It — `execSync`

### The Problem

The fix needs to run one specific, short administrative command
(terminating a whole process tree) and know whether it actually succeeded
before moving on — not stream ongoing output the way `spawn` does for a
long-running server.

### The Concept, Isolated

First real use of `execSync` in this project. The full isolated lab lives
in `concepts/node-child-process-execsync.md` — run for real this session:

```javascript
const { execSync } = require("child_process");

const output = execSync("node --version");
console.log("got back:", JSON.stringify(output.toString().trim()));

try {
  execSync('node -e "process.exit(7)"');
} catch (err) {
  console.log("threw, status:", err.status);
}
```

### Discard

This lab (checking a Node version, and a deliberately-failing `-e`
script) is not part of the project — its only job was proving `execSync`
blocks and reports failure correctly, before using it for something real
below.

### Project Change

- **Reference Source:** none — this is a language/runtime API lab, not a
  port of anything.
- **Files affected:** none yet. This unit only proves `execSync` itself
  behaves as expected; the next unit is where it first touches
  `cnc-desktop/main.js` for real.
- **Change type:** n/a.
- **Location:** n/a.
- **Dependencies:** none.

### Mechanical Walkthrough

- `execSync("node --version")` — **(a) first appearance** — runs the
  string as a real shell command and blocks until it finishes, returning
  everything the command wrote to stdout as one value, all at once —
  contrast `node-child-process-spawn.md`'s own `"data"` events, which can
  fire many times for a single long-running command.
- `output.toString().trim()` — **(b) reappearing** `Buffer.toString()`
  (`node-child-process-spawn.md`); `.trim()` — **(c) already basic**.
- `try { execSync(...) } catch (err) { ... }` — **(b) reappearing**
  `try`/`catch` (`python-try-except.md`'s same idea, a different
  language); what triggers the throw is **(a) first appearance** — a
  non-zero exit code from the command itself, translated by `execSync`
  into a real thrown error.
- `err.status` — **(a) first appearance** — the real numeric exit code
  the command terminated with, attached to the thrown error.

### CS Lens

Per `node-child-process-execsync.md`: synchronous blocking I/O — the
calling code genuinely pauses until the command finishes, the right trade
specifically because nothing else needs to happen at the same moment.

### SE Lens

The real cost, stated honestly: `execSync` freezes the *entire* calling
program for as long as the command takes. Fine for a `taskkill` that
resolves in milliseconds; a real problem if misapplied to anything
longer-running, since it would also freeze Electron's own UI event loop
while it waited.

### Run It — Real Output

```
got back: "v24.12.0"
threw, status: 7
```

Confirms both halves before either one is trusted inside real project
code: a successful command's real output comes back as a plain value, and
a failing one throws with the real exit code attached — exactly what
`killProcessTree`, in the next unit, needs to tell "the tree is gone" from
"something went wrong."

---

## Concept Unit: `taskkill /T /F` — Killing the Whole Tree

### The Problem

`os-process-tree-and-orphaned-processes.md` proved the gap; `execSync`
provides a way to run a command and wait for it. What's still missing is
the one real command that actually terminates a wrapper process *and*
everything it started, in one operation.

### The Concept, Isolated

First real use of `taskkill`'s tree-kill flags in this project. The full
isolated lab lives in `concepts/windows-taskkill-process-tree.md` — the
identical synthetic setup as the orphan lab above, this time killed with
`taskkill /pid <wrapper> /t /f` instead of `.kill()`.

**Real output, run this session:**
```
wrapper.pid: 73480
grandchild pid: 82416
--- killing the whole tree: taskkill /pid <wrapper> /t /f ---
```
Checked immediately after: `Get-Process -Id 82416` — not found.
`Get-Process -Id 73480` — not found. Both gone, in contrast to the
identical setup's `.kill()` result above, where the real `node` process
(`79856`, that run) survived.

### Discard

This lab is not part of the project. The real fix, applied below, is the
first place this mechanism touches actual project code.

### Project Change

- **Reference Source:** none — `cnc-sim` has no Electron shell of its own
  to clean up after; this is a from-scratch fix to this project's own
  `cnc-desktop`, the same "no reference counterpart" as every unit in
  Lessons 19–21.
- **Files affected:** `cnc-desktop/main.js`.
- **Change type:** refactor — replacing two direct `.kill()` calls inside
  the existing `before-quit` handler (Lesson 20) with a call to a new,
  small helper.
- **Location:** a new `killProcessTree` function, placed directly above
  the existing `app.on("before-quit", ...)` handler; the handler's own
  body is what changes.
- **Dependencies:** `execSync`, added to this file's existing
  `require("child_process")` destructure alongside `spawn`.

### The New Code

```javascript
function killProcessTree(child) {
  if (!child) return;
  if (process.platform === "win32") {
    try {
      execSync(`taskkill /pid ${child.pid} /t /f`);
    } catch {
      // Already exited on its own — nothing left to kill.
    }
  } else {
    child.kill();
  }
}
```

### The Updated Project

`main.js` in full — every line built up across Lessons 19–21, with this
unit's changes marked. Nothing below is elided or assumed unchanged
off-screen; this is the entire real file:

```javascript
const { app, BrowserWindow } = require("electron");
const { spawn, execSync } = require("child_process");    // ← changed: added execSync
const path = require("path");

const DEV_URL = "http://localhost:5180";
const MAX_ATTEMPTS = 8;
const CNC_SERVICE_DIR = path.join(__dirname, "..", "cnc-service");
const CNC_WEB_DIR = path.join(__dirname, "..", "cnc-web");

let backendProcess = null;
let frontendProcess = null;

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

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
  });

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
  startFrontend();
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

function killProcessTree(child) {                          // ← new
  if (!child) return;                                       // ← new
  if (process.platform === "win32") {                        // ← new
    try {                                                     // ← new
      execSync(`taskkill /pid ${child.pid} /t /f`);           // ← new
    } catch {                                                  // ← new
      // Already exited on its own — nothing left to kill.     // ← new
    }                                                           // ← new
  } else {                                                     // ← new
    child.kill();                                              // ← new
  }                                                             // ← new
}                                                               // ← new

app.on("before-quit", () => {
  killProcessTree(backendProcess);                          // ← changed: was backendProcess.kill()
  killProcessTree(frontendProcess);                         // ← changed: was frontendProcess.kill()
});
```

Every function above `killProcessTree` is exactly what Lessons 19–21 already
built — `startBackend`/`startFrontend` spawning both real subprocesses,
`createWindow` retrying `loadURL` with backoff, the three `app.on(...)`
lifecycle hooks. `before-quit` now routes both cleanup calls through one
platform-aware helper instead of assuming `.kill()` is always enough —
`backendProcess` (plain `python`, no shell involved) is unaffected in
practice, since killing the one PID `spawn` returned for it was always
correct; `frontendProcess` is the one this fix actually changes the
behavior of.

### Mechanical Walkthrough

- `function killProcessTree(child) { ... }` — **(c) already basic** — a
  plain function declaration, taking the same `ChildProcess` object
  `spawn` already returns.
- `if (!child) return;` — **(b) reappearing** — a guard clause, the same
  shape as the existing `if (backendProcess) { ... }` checks this code
  replaces, just moved inside the helper.
- `process.platform === "win32"` — **(b) reappearing**, per
  `node-process-platform.md` (Lesson 19) — this project's second real
  platform branch, after `startBackend`'s `python`/`python3` choice and
  `startFrontend`'s `shell: isWindows`.
- `` execSync(`taskkill /pid ${child.pid} /t /f`) `` — **(a) first
  appearance of both `execSync`, per `node-child-process-execsync.md`,
  and `taskkill /t /f`, per `windows-taskkill-process-tree.md`** —
  combined here for the first time as real project code, each already
  proven separately above.
- `try { ... } catch { ... }` with an empty `catch` — **(b) reappearing**
  `try`/`catch` itself; the empty body is worth a clause of its own: it
  means "a process that already exited on its own before quit ran is not
  an error," a real, deliberate choice — not a silently swallowed bug —
  since `taskkill` throws whenever its target PID no longer exists.
- `child.kill()` (the `else` branch) — **(b) reappearing**, per
  `node-child-process-spawn.md`'s own "Try It Yourself" — unchanged
  behavior on macOS/Linux, where `startFrontend` never sets
  `shell: true` in the first place.

### CS Lens

Per `windows-taskkill-process-tree.md`: subtree termination — the same
operation a recursive directory delete or a cascading database delete
performs, applied here to a process tree instead of a filesystem tree or
a table hierarchy.

### SE Lens

The real, honest limit of this fix, not glossed over: `/t /f` is
Windows-only syntax. The macOS/Linux branch (`child.kill()`, unchanged)
is correct today only because `startFrontend` never sets `shell: true`
on those platforms — if a future lesson ever needed a shell wrapper there
too, this `else` branch would need its own real fix (killing the whole
process *group*, which requires spawning with `detached: true` from the
start — a genuinely different mechanism, not attempted here since nothing
in this project currently needs it). This fix closes the real, currently
reproducible Windows gap; it does not claim to close a Unix gap that
doesn't exist yet.

### Commands

`taskkill` itself needs no install — built into Windows. No new
package-management step for this unit; `execSync` and `spawn` both come
from Node's built-in `child_process`, already a dependency of this file.

### Run It — Real Output

Full end-to-end verification, against the real app, not just the
isolated labs above:

```
$ env -u ELECTRON_RUN_AS_NODE npm start
...
[cnc-desktop] loaded http://localhost:5180 successfully on attempt 1
[cnc-service]  * Serving Flask app 'app'
 * Running on http://127.0.0.1:5000
```

Then, from a second terminal, a graceful close request against the real
main-process PID (`taskkill /pid <main-pid>`, no `/f` — the same request
Windows sends when a user closes a window, triggering `window-all-closed`
→ `app.quit()` → this project's own `before-quit`):

```
SUCCESS: Sent termination signal to the process with PID 102060.
```

The app's own log confirmed the fixed cleanup actually ran:
```
[cnc-service] exited with code 1
[cnc-web] exited with code 1
```

And, checked immediately after, against the real machine:
```
Get-Process electron|python3   → none found
Get-NetTCPConnection 5000      → free
Get-NetTCPConnection 5180      → free
```

Both ports free, no orphaned process left — the exact failure this whole
lesson started from, gone.

---

## Connect the Pieces

Follow one real quit, start to finish, with the fix in place:

1. `app.whenReady()` (Lesson 19) calls `startBackend()` and
   `startFrontend()` (Lessons 20–21) — on Windows, `frontendProcess` ends
   up holding the PID of a `cmd.exe` wrapper, not the real Vite process
   it launches, because `shell: isWindows` is `true` here.
2. The user closes the window. `window-all-closed` (Lesson 19) calls
   `app.quit()`, since this isn't macOS.
3. `app.quit()` fires `before-quit` (Lesson 20), which now calls
   `killProcessTree(backendProcess)` and `killProcessTree(frontendProcess)`
   instead of raw `.kill()`.
4. For `backendProcess` (no shell), the `else` branch's `child.kill()`
   is enough — it always was.
5. For `frontendProcess` (the Windows shell wrapper), the `win32` branch
   runs `execSync("taskkill /pid <wrapper-pid> /t /f")` — which walks the
   real process tree the OS already tracks and terminates the wrapper
   *and* the real Vite process underneath it, together.
6. Both ports are free the instant the app closes — not sometime later,
   not "usually," and not only until the next launch collides with
   whatever got left behind.

## What Breaks Without This

Reverting `killProcessTree`'s Windows branch back to plain `child.kill()`
— exactly what this project shipped before this lesson:

```javascript
app.on("before-quit", () => {
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
});
```

Real, observed behavior with this version, reproduced live this session:
quit the app normally, then immediately check `Get-NetTCPConnection
-LocalPort 5180` — it still resolves to a real, running `node.exe`. Launch
`cnc-desktop` again, and `cnc-web`'s own dev server fails outright:
`Error: Port 5180 is already in use`. The window still loads successfully
in that case — but only by coincidence, showing whatever the *stale*
leftover server happens to be serving, not this session's real, freshly
started one.

Restoring `killProcessTree`'s real tree-kill on Windows removes the gap by
terminating the actual process holding the port, not just the wrapper
`spawn` happened to hand back.

## Exercises

1. Add a `console.log` inside `killProcessTree`'s `catch` block, then
   quit the app *twice* in a row without relaunching it in between (the
   second quit has nothing left to kill) — confirm the log fires and the
   app still exits cleanly, proving the empty `catch` is intentional, not
   a bug being hidden.
2. Temporarily set `shell: true` unconditionally in `startBackend` (not
   just `startFrontend`) and re-verify `killProcessTree`'s `win32` branch
   still correctly terminates the real `python` process — reasoning about
   why `taskkill /t` works regardless of *which* command was wrapped in a
   shell, not just `npm` specifically.
3. Using `Get-CimInstance Win32_Process -Filter "ParentProcessId=<pid>"`
   (named in `windows-process-port-inspection.md`'s own "Try It
   Yourself"), inspect `frontendProcess`'s real children *before* quitting
   the app, and confirm by hand that the real Vite process shows up as a
   child of the shell PID `frontendProcess.pid` refers to — seeing the
   real tree structure `taskkill /t` walks, rather than taking it on
   faith.
4. Look up why `taskkill` (unlike `.kill()`) needs to be invoked through
   `execSync` rather than `spawn` here, and argue the other side: what
   would have to change in `killProcessTree` if `spawn` were used instead,
   and why that would be real, unneeded complexity for a command this
   short-lived.

## Definition of Done

- [ ] `cnc-desktop` launches successfully on Windows (`env -u ELECTRON_RUN_AS_NODE npm start`,
      or from a normal terminal with no `ELECTRON_RUN_AS_NODE` set).
- [ ] Quitting the app once, then immediately checking
      `Get-NetTCPConnection -LocalPort 5000` and `-LocalPort 5180`,
      shows both free — verified live, not assumed.
- [ ] Relaunching immediately after a clean quit succeeds with no
      `EADDRINUSE`/"port already in use" error from `cnc-web`.
- [ ] All four new concept files exist in `concepts/`, each with real,
      executed output.
- [ ] `git commit` — message explaining that this fix closes a real,
      reproducible Windows-only bug found by actually running the app for
      the first time on that platform, not by reading the code.
