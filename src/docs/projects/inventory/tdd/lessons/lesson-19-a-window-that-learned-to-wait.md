# Lesson 19: A Window That Learned to Wait

## What you will build

`cnc-desktop`, a real, new, third top-level project: an Electron shell
that opens a native desktop window and loads the app already built in
every prior lesson — `cnc-web`'s dev server, itself talking to
`cnc-service` — inside it. Built and verified three times over: a
minimal window that works when everything's already running, then a
version that survives the window opening before its dev server is
actually listening (a real, live `ERR_CONNECTION_REFUSED`, caught this
session), then a second, subtler real bug in that very fix, caught only
by watching real, live terminal output during actual testing. The
transferable problem this lesson is really about: **opening a window is
not the same as the thing inside it being ready** — and once you've
actually proven something is reachable, a later failure means something
different than a first failure does, and deserves a different response.

## What you need to know first

Lesson 1: `app.whenReady()`'s own real echo of Flask's `app = Flask(__name__)`
— one object the rest of a file attaches behavior to. Lesson 7: Promises,
`fetch`, and the real gap named there and never closed until now —
`fetchPath`'s real network call, with no timeout or retry logic anywhere
in this project. `retry-timeout-and-backoff.md` (cataloged, never
applied to real project code until this lesson) and
`event-driven-ui-callbacks.md` (the general event-driven model, applied
here to a different concrete API).

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/javascript-commonjs-require.md` — new.
- `../concepts/electron-main-process-and-browserwindow.md` — new.
- `../concepts/node-process-platform.md` — new.
- `../concepts/data-url-scheme.md` — new.
- `../concepts/retry-timeout-and-backoff.md` — reappearing; a real gap
  named as far back as Lesson 7 and never closed in real project code
  until this lesson.
- `../concepts/event-driven-ui-callbacks.md` — reappearing, extended
  (the same general model, a different concrete API — Node's
  `EventEmitter`-style `.on(...)`, not DOM `addEventListener`).
- `../concepts/javascript-destructuring.md`,
  `../concepts/javascript-arrow-functions.md` — reappearing, no
  extension.

## No pipeline diagram change

`cnc-desktop` is packaging/shell around the existing app, not a stage of
the `Text → Tokens → Commands → Machine State → Points → Picture`
pipeline — same as the persistence lessons before it.

---

## Concept Unit: A New Top-Level Project, on an Older Module System

*(Full standalone treatment: `../concepts/javascript-commonjs-require.md`.)*

### The Problem

Every real gap named in `CURRICULUM.md`'s Correction #4 is still open:
this app is web-only today, opened in a browser tab — but per direct,
recorded decision, it's meant to be a real desktop application, not a
web-hosted one. Nothing built so far can open a native window at all.

### The Concept, Isolated

Full standalone lab, run for real, in the concept file above. Not
repeated here — reused directly, at its very next appearance, in this
project's own new entry file.

### Project Change

- **Reference Source** — none. The reference app (`cnc-sim/`) is
  browser-only, with no desktop shell of any kind to port from — this is
  Stage 2 ("requested functionality") of `CURRICULUM.md`'s four-stage
  plan, a real addition beyond the reference, not a port.
- **Files affected** — new folder `cnc-desktop/`, new
  `cnc-desktop/package.json`.
- **Change type** — add.
- **Location** — top-level, alongside the existing `cnc/`, `cnc-sim/`,
  `cnc-web/`, `cnc-service/` folders.
- **Dependencies** — Node.js (already installed, used since Lesson 7);
  `electron` itself, installed into this new folder specifically.

### The New Code

```json
{
  "name": "cnc-desktop",
  "private": true,
  "version": "0.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  },
  "devDependencies": {
    "electron": "^43.1.1"
  }
}
```

### The Updated Project

This is the complete, brand-new `cnc-desktop/package.json` — nothing
precedes it, so there's no larger enclosing file to show it inside of.

### Commands and Real Output

```
npm install
```
```
added 13 packages, and audited 14 packages in 1s
found 0 vulnerabilities
```
Run for real, this session — `electron`'s real, current version was
checked first (`npm view electron version` → `43.1.1`) rather than
guessed at; an earlier, unchecked guess of `^33.2.1` was caught and
corrected specifically because `npm audit` reported a real, high-severity
advisory range on that older major version, fixed by bumping to the
version actually checked.

### Mechanical Walkthrough
- `"main": "main.js"` — **(a) first appearance** of this field's real
  meaning for an Electron project specifically: Electron's own `electron .`
  command reads this exact field to find which file is the application's
- entry point — the same role Flask's `if __name__ == "__main__":` block
  plays (Lesson 1), pointed to declaratively instead of run positionally.
- `"scripts": { "start": "electron ." }` — **(b) reappearing** the same
  `package.json` `"scripts"` mechanism `cnc-web`'s own `"dev": "vite"`
- already established (Lesson 7) — a new command name (`start`, npm's own
  conventional name for "run the built application," distinct from `dev`),
  same mechanism.
- `"devDependencies": { "electron": "^43.1.1" }` — **(b) reappearing**
  the same `package.json` dependency-declaration shape already
  established; `electron` is a dev dependency specifically because it's
  a tool this project runs *with*, not a library `main.js`'s own logic
- imports and calls — the identical reasoning `vite`/`typescript` already
  used as dev dependencies in `cnc-web`.

### CS Lens

No new CS concept here beyond what `npm-project-scaffolding.md` and
`npm-package-json.md` already cover — reused directly on a third,
independent project inside the same repository.

### SE Lens

Pinning a real, checked current version (`43.1.1`) rather than an
unchecked guess is the exact same discipline Lesson 1's `requirements.txt`
already established for Python — the concrete, real cost of skipping it,
demonstrated this session rather than just claimed: the unchecked guess
this project's own first draft used was already several major versions
behind, carrying eighteen real, published security advisories `npm audit`
found immediately.

---

## Concept Unit: The Application That Waits to Be Ready

*(Full standalone treatment: `../concepts/electron-main-process-and-browserwindow.md`.)*

### The Problem

`package.json` now points at `main.js` — but that file doesn't exist yet,
and nothing yet knows how to actually open a real window showing this
project's real, existing frontend.

### The Concept, Isolated

Full standalone lab, run for real, in the concept file above. Not
repeated here.

### Project Change

- **Reference Source** — none (same reasoning as the previous unit).
- **Files affected** — new `cnc-desktop/main.js`.
- **Change type** — add.
- **Dependencies** — the `electron` package from the previous unit.

### The New Code

```javascript
const { app, BrowserWindow } = require("electron");

const DEV_URL = "http://localhost:5180";

function createWindow() {
  const win = new BrowserWindow({ width: 1280, height: 800 });
  win.loadURL(DEV_URL);
}

app.whenReady().then(createWindow);
```

### The Updated Project

This is the complete, first version of `cnc-desktop/main.js` — nothing
precedes it yet.

### Mechanical Walkthrough
- `const { app, BrowserWindow } = require("electron")` — **(b)
  reappearing** `require`/destructuring, full treatment in the previous
  unit's concept file, applied to Electron's own two most central
  exports.
- `const DEV_URL = "http://localhost:5180"` — **(c) already
  established** a `const` string, holding the real address `cnc-web`'s
  own Vite dev server has used, unchanged, since Lesson 7.
- `function createWindow() { ... }` — **(c) already established**
  function declaration syntax; what's new is only its contents, covered
  below.
- `new BrowserWindow({ width: 1280, height: 800 })` /
- `win.loadURL(DEV_URL)` / `app.whenReady().then(createWindow)` — **(b)
  reappearing**, full treatment in this unit's concept file, applied
  here to this project's own real dev-server address instead of the
  lab's throwaway `data:` URL.

### CS Lens

Same as the concept file's own CS Lens — a framework-managed application
lifecycle, this project's first encounter with one. Nothing new to
re-derive.

### SE Lens

`DEV_URL` pointing at `cnc-web`'s dev server, rather than at
`cnc-service`'s own port or some new address, is a deliberate, minimal
first slice: this window changes nothing about how the app is served —
it only wraps the exact same two dev servers every prior lesson already
used, in a native window instead of a browser tab. Spawning those
servers automatically from this file is real, valuable follow-on work,
named explicitly as a *separate*, later slice, not bundled in here.

### Commands and Real Output

```
npm start
```
Real, verified this session via a screenshot, with both `cnc-service`
and `cnc-web`'s dev server already running: a real native window titled
"cnc-web" (matching `cnc-web/index.html`'s own `<title>`) opened, showing
the real "Toolpath" heading, the real Three.js viewport with a real
rendered toolpath line, and the real JSON point data from `PathDump.tsx`
— the exact same content a browser tab shows, now inside a real desktop
window instead.

---

## Concept Unit: A Real, Live Race Condition

### The Problem

The previous unit's `npm start` was verified with both dev servers
*already* running. Started in the more realistic order — the desktop
shell opened before `cnc-web`'s dev server had finished starting — it
fails instead, for real:

```
(node:78800) electron: Failed to load URL: http://localhost:5180/ with error: ERR_CONNECTION_REFUSED
```

Electron never retries a failed `loadURL` on its own — the window is
simply left blank, with no explanation, no matter how long you wait
afterward. Every dev server in this project has always been started by
hand, in separate terminals — this specific race (the window coming up
before the thing it loads is listening yet) is not a hypothetical, it's
what actually happened, this session, on the very first real attempt to
run this outside a controlled test.

### CS Lens

This is a **race condition** — the correctness of the whole system
depends on the real, wall-clock order two independent processes happen
to reach a certain state in, and nothing in either process's own code
enforces that order. Same category of problem as two threads reading and
writing shared memory with no lock between them, just expressed across
process boundaries and real, human-scale startup time instead of
nanoseconds.

Also recognized in: any multi-process system started by separate
commands (a database and the application that connects to it, a message
queue and its consumers), and, in this exact project's own real history,
the reason `seed_tools_if_empty()` (Lesson 14) checks for existing rows
before inserting — a different race (two startups both trying to seed),
same underlying category of bug.

### SE Lens

The honest options here are exactly two: enforce a strict startup order
by hand, every time, forever (fragile — the very next person to run this,
including a future version of the same author, will eventually get the
order wrong), or make the code itself tolerant of the disorder that's
always possible. The next unit takes the second option, for the same
reason `retry-timeout-and-backoff.md` already gives in general: a real,
transient failure at startup is not a reason to fail permanently.

---

## Concept Unit: Retrying a Failed Load, With Backoff and Jitter

*(Reappearing, closing a gap named in Lesson 7 and never closed until
now: `../concepts/retry-timeout-and-backoff.md`. Extended:
`../concepts/event-driven-ui-callbacks.md`. New:
`../concepts/data-url-scheme.md`.)*

### The Problem

The failure just caused is exactly the shape `retry-timeout-and-backoff.md`
already covers in full — a transient failure, worth a bounded number of
retries with a growing delay between them — applied here to `loadURL`
instead of `fetch`, real project code standing in for a real gap this
project has carried, named but unclosed, since Lesson 7.

### Project Change

- **Reference Source** — none (same reasoning as every unit this lesson).
- **Files affected** — `cnc-desktop/main.js`.
- **Change type** — replace (`createWindow`'s body).
- **Dependencies** — the concept files cited above.

### The New Code

```javascript
const MAX_ATTEMPTS = 8;

let attempt = 0;

const tryLoad = () => {
  attempt += 1;
  win.loadURL(DEV_URL);
};

win.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
  if (errorCode === -3) return;

  if (attempt >= MAX_ATTEMPTS) {
    win.loadURL(
      "data:text/html," +
        encodeURIComponent(`<h2>Couldn't reach ${DEV_URL}</h2>`)
    );
    return;
  }

  const delayMs = 2 ** attempt * 150 + Math.random() * 150;
  setTimeout(tryLoad, delayMs);
});

tryLoad();
```

### The Updated Project

`createWindow`, in full, with the retry logic replacing the previous
unit's single `win.loadURL(DEV_URL)` call:
```javascript
function createWindow() {
  const win = new BrowserWindow({ width: 1280, height: 800 });

  const MAX_ATTEMPTS = 8;
  let attempt = 0;

  const tryLoad = () => {
    attempt += 1;
    win.loadURL(DEV_URL);
  };

  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    if (errorCode === -3) return;

    if (attempt >= MAX_ATTEMPTS) {
      win.loadURL(
        "data:text/html," +
          encodeURIComponent(`<h2>Couldn't reach ${DEV_URL}</h2>`)
      );
      return;
    }

    const delayMs = 2 ** attempt * 150 + Math.random() * 150;
    setTimeout(tryLoad, delayMs);
  });

  tryLoad();
}
```
`createWindow` now opens the window, then repeatedly attempts to load
the real dev URL — up to `MAX_ATTEMPTS` times, waiting longer between
each attempt — and only shows a real, explained failure page once every
attempt has been exhausted, instead of leaving a blank window with no
explanation, as the previous unit's real, caused failure did.

### Mechanical Walkthrough
- `let attempt = 0;` / `const tryLoad = () => { attempt += 1; ... }` —
  **(b) reappearing** a **closure**, the same mechanism
  `event-driven-ui-callbacks.md`'s own Mechanical Walkthrough already
- named by that word — `tryLoad` and the `did-fail-load` handler below
  are two separate functions that both read and mutate the same one
  `attempt` variable from their shared enclosing scope, across many
  separate calls over real, elapsed time — not two independent copies.
- `win.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {...})`
  — **(b) reappearing**, full treatment in
- `electron-main-process-and-browserwindow.md` — Electron's own real,
  documented event, fired with the failing URL's real numeric error code
  and a human-readable description as its second and third arguments.
- `if (errorCode === -3) return;` — **(a) first appearance** of a real,
  documented Electron quirk: `-3` is `ERR_ABORTED`, fired when a load is
  superseded by another one before finishing — including, concretely,
  this very retry logic starting a new attempt before an earlier one's
  failure has fully resolved. Never a real reachability problem, so
  never worth retrying on — checked and returned first, before any other
  logic runs.
- `attempt >= MAX_ATTEMPTS` / the fallback `win.loadURL("data:text/html," + ...)`
  — **(b) reappearing** the bounded-retry-count half of
  `retry-timeout-and-backoff.md`'s own pattern, and **(a) first
  appearance** of the `data:` URL scheme + `encodeURIComponent`, full
- treatment in `data-url-scheme.md` — building one real, safe URL whose
  entire content is the error message itself, shown directly in the
  window in place of the unreachable page.
- `2 ** attempt * 150 + Math.random() * 150` — **(b) reappearing**
  exponential backoff with jitter, the identical formula shape
  `retry-timeout-and-backoff.md`'s own isolated example already proved,
  reused here with different real constants (`150`ms base instead of
- `100`ms — chosen smaller since a local `loadURL` failure resolves far
  faster than a real network `fetch` would).
- `setTimeout(tryLoad, delayMs)` — **(b) reappearing**, also full
  treatment in the same concept file.

### Verified, Run for Real

```
[cnc-desktop] attempt 1 failed (ERR_CONNECTION_REFUSED), retrying in 326ms
[cnc-desktop] attempt 2 failed (ERR_CONNECTION_REFUSED), retrying in 701ms
[cnc-desktop] attempt 3 failed (ERR_CONNECTION_REFUSED), retrying in 1232ms
[cnc-desktop] attempt 4 failed (ERR_CONNECTION_REFUSED), retrying in 2421ms
[cnc-desktop] attempt 5 failed (ERR_CONNECTION_REFUSED), retrying in 4928ms
```
Real terminal output, this session: the dev server was deliberately kept
down for the first several seconds, then started — the real, growing
delays above are exactly `2 ** attempt * 150 (+ jitter)`, confirmed
against the formula.

### CS Lens / SE Lens

Both fully covered in `retry-timeout-and-backoff.md` — nothing new to
re-derive; this unit is that concept file's own general pattern paying
off in real project code, closing a debt this project named specifically
in Lesson 7 (`fetchPath`'s own zero-retry network call) and carried,
unclosed, for twelve lessons.

---

## Concept Unit: A Second Real Bug — Giving Up on a Target Already Proven Real

### The Problem

The previous unit's fix, run for real, produced a second, subtler bug —
caught only by watching real, live terminal output during actual testing,
not by reasoning about the code alone:

```
[cnc-desktop] loaded http://localhost:5180 successfully on attempt 2
[cnc-desktop] attempt 3 failed (ERR_CONNECTION_REFUSED), retrying in 1301ms
[cnc-desktop] loaded http://localhost:5180 successfully on attempt 3
[cnc-desktop] attempt 4 failed (ERR_CONNECTION_REFUSED), retrying in 2535ms
[cnc-desktop] loaded http://localhost:5180 successfully on attempt 4
```
A real success, immediately followed by another failure, repeating —
`attempt` kept climbing toward `MAX_ATTEMPTS` *even after the app had
already, genuinely, loaded successfully*. Run for long enough, this
would eventually reach `MAX_ATTEMPTS` and show the "couldn't reach it"
fallback page — while the app was, in fact, reachable and had already
proven so, more than once.

### The Investigation, for Real, This Session

Vite (`cnc-web`'s dev server) forces a real, full page reload on its own,
mid-session, the moment its cold-start dependency crawl discovers a
package it hadn't bundled yet — a real, documented Vite behavior, not a
bug in this project. Each of those self-triggered reloads is a real new
navigation, which can itself hit a real, momentary failure while Vite's
dev server is still busy handling that discovery — and this project's
own `did-fail-load` handler, from the previous unit, could not tell that
failure apart from the very first, "is anything even there" kind of
failure the retry logic was originally built for.

### The Fix

```javascript
let hasConnectedOnce = false;

win.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
  if (errorCode === -3) return;

  if (hasConnectedOnce) {
    setTimeout(tryLoad, 500);
    return;
  }

  // ...MAX_ATTEMPTS / backoff logic, unchanged from the previous unit...
});

win.webContents.on("did-finish-load", () => {
  hasConnectedOnce = true;
});
```

### The Updated Project

`createWindow`, in full, with both real fixes from this lesson now
present together:
```javascript
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
```
This function now draws a real, permanent line between two genuinely
different situations: *"has this ever actually worked"* and *"is it
working right now"* — only the first one ever gives up.

### Mechanical Walkthrough
- `let hasConnectedOnce = false;` — **(c) already established** variable
  declaration; what's new is only its role, covered below.
- `did-finish-load` — **(b) reappearing**, full treatment already given
  in an earlier unit's concept file — a second, separate event on the
  same `webContents`, fired only on a real, successful load, never on a
  failure.
- `if (hasConnectedOnce) { ...; return; }` placed *before* the
- `MAX_ATTEMPTS` check — **(a) first appearance** of this lesson's real
  design decision: once the target has been proven reachable even once,
  every later failure takes a completely different branch — a short,
  fixed-delay retry that never counts toward giving up — rather than the
  bounded, escalating branch meant only for "is anything even there yet."
- `console.log(...)` calls throughout — **(b) reappearing** already-basic
  syntax, worth naming once: every real log line quoted as "Verified, Run
  for Real" throughout this lesson came from these exact calls, not from
  paraphrasing what the code "should" print.

### CS Lens

This is the same **fault-tolerant design** idea `retry-timeout-and-backoff.md`
already names, refined one level further: not every failure carries the
same information. A failure *before* any success is genuine uncertainty
("does this exist at all?"); a failure *after* a proven success is
different in kind ("it exists, something just blipped") — treating both
identically, as the previous unit's version did, throws away real
information the system already has.

### SE Lens

The real, concrete cost of not making this distinction, demonstrated live
this session and not just argued for: a perfectly working app, still
running, still reachable, would eventually have been replaced by its own
"couldn't reach it" error page — the worst kind of bug, one that actively
makes a working system look broken. The fix costs one boolean and one
extra branch; the alternative was a real, reproducible false failure.

### Verified, Run for Real

```
[cnc-desktop] loaded http://localhost:5180 successfully on attempt 1
[cnc-desktop] reload blipped (ERR_CONNECTION_REFUSED) after a known-good connection — retrying, not giving up
[cnc-desktop] reload blipped (ERR_CONNECTION_REFUSED) after a known-good connection — retrying, not giving up
```
Real terminal output, this session, from Vite's own cold-start churn —
confirmed never escalating to the fallback page, and confirmed (a
separate, later run, once Vite's dependency crawl had settled) stabilizing
on a real, successful, permanent load.

---

## Concept Unit: Quitting Cleanly, By Platform

*(Full standalone treatment: `../concepts/node-process-platform.md`.)*

### The Problem

Nothing yet governs what happens when the window closes, or when the
app is reactivated afterward (clicking its dock icon on macOS, for
instance) — real, platform-specific conventions this project hasn't
addressed at all yet.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-desktop/main.js`.
- **Change type** — add.
- **Location** — top level of the file, alongside `app.whenReady()`.

### The New Code

```javascript
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
```

### The Updated Project

The complete, current `cnc-desktop/main.js`, every piece from every unit
in this lesson, in the order it actually runs:
```javascript
const { app, BrowserWindow } = require("electron");

const DEV_URL = "http://localhost:5180";
const MAX_ATTEMPTS = 8;

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

app.whenReady().then(createWindow);

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
```
The file as a whole now: waits for Electron to be ready, opens one real
window that loads this app with real, tolerant retry logic, and follows
each platform's own real convention for what happens after every window
closes.

### Mechanical Walkthrough
- `app.on("window-all-closed", ...)` — **(b) reappearing** the same
  `EventEmitter` pattern already used for `did-fail-load`, on `app`
- instead of `webContents` — Electron's own real, documented event,
  fired once every open window has closed.
- `process.platform !== "darwin"` — **(b) reappearing**, full treatment
- in this unit's concept file — `"darwin"` specifically identifies
  macOS.
- `app.quit()` — **(b) reappearing**, already used once in the concept
  file's own isolated lab.
- `app.on("activate", ...)` — **(a) first appearance** of this specific
  event: fired on macOS when the app is reactivated (its dock icon
  clicked) with no windows currently open — checked via
  `BrowserWindow.getAllWindows().length === 0` (a real, live count of
  every currently-open window, **(a) first appearance** of this static
  method) before creating a new one, so activating an app that already
  has an open window doesn't open a redundant second one.

### CS Lens

Same platform-detection idea `node-process-platform.md` already covers.

### SE Lens

Real, current macOS and Windows/Linux users each expect their own
platform's real, long-standing convention for "what happens when I close
the last window" — matching neither by accident (picking one behavior and
shipping it everywhere) would be a real, visible rough edge for roughly
half of any real userbase, not a cosmetic detail.

---

## Concept Unit: `.gitignore` for a New npm Project

### The Problem

`npm install` (the very first unit) already produced a real
`node_modules/` folder and `package-lock.json` — nothing yet tells `git`
which of those belong in version control.

### Project Change

- **Files affected** — new `cnc-desktop/.gitignore`.
- **Change type** — add.

### The New Code

```
node_modules
dist
out
release
.DS_Store
```

### The Updated Project

The complete, new `cnc-desktop/.gitignore` — the `dist`/`out`/`release`
entries name real Electron packaging output directories nothing in this
project produces yet, added now so they're already excluded the moment
packaging becomes real, later work.

### Mechanical Walkthrough
- `node_modules` — **(b) reappearing** the identical entry `cnc-web/.gitignore`
- and `cnc/.gitignore` already use — real, regeneratable from
  `package-lock.json` via `npm install` alone, never committed.
- `package-lock.json` is **not** in this file — **(a) first appearance
  of a deliberate omission** worth naming: confirmed against
  `cnc-web/package-lock.json`/`cnc/package-lock.json`/`cnc-sim/package-lock.json`,
  all real, already tracked in this repository — the same pinned-dependency
  discipline Lesson 1's `requirements.txt` established, extended to this
  third project rather than silently dropped.

### CS Lens / SE Lens

Same as every prior `.gitignore` in this project — nothing new to
re-derive; this unit exists only to record the real, deliberate choice
for this specific new folder.

### Verified, Run for Real

```
git add -n cnc-desktop/
add 'cnc-desktop/.gitignore'
add 'cnc-desktop/main.js'
add 'cnc-desktop/package-lock.json'
add 'cnc-desktop/package.json'
```
Real, dry-run output confirming exactly the intended four files, and
only those, would be staged.

---

## Connect the Pieces

One real trip through the whole lesson, start to finish: `npm start`
runs `electron .` (the `"main"` field in `package.json`), which loads
`main.js` under Electron's own CommonJS module system. `app.whenReady()`
resolves once Electron's real startup finishes, and `createWindow()`
opens one real native window, then calls `tryLoad()`. If `cnc-web`'s dev
server isn't listening yet, `win.webContents`'s `did-fail-load` event
fires — `errorCode -3` is ignored, `hasConnectedOnce` is still `false`,
so the bounded, backing-off retry loop runs, trying again with a growing
delay each time, up to eight real attempts, before ever showing a real,
explained failure page. The moment the dev server *is* reachable,
`did-finish-load` fires, `hasConnectedOnce` becomes `true` permanently,
and every later failure — including Vite's own self-triggered reloads
mid-session — retries quietly and unconditionally instead of ever
escalating to "give up." Closing the last window quits the app on
Windows/Linux and leaves it running on macOS, matching each platform's
own real convention.

## What Breaks Without This

Caused for real, this session, before the retry-with-backoff unit was
written: the desktop shell was started with `cnc-web`'s dev server
deliberately not running yet.

**Real failure captured:**
```
(node:78800) electron: Failed to load URL: http://localhost:5180/ with error: ERR_CONNECTION_REFUSED
```
With no retry logic, this is the end of the story — a real, permanently
blank window, no explanation, no recovery, even once the dev server
starts moments later. Restoring the retry-with-backoff unit and rerunning
the identical scenario: the same real `ERR_CONNECTION_REFUSED` still
happens (removing the retry logic doesn't change *that* — the race is
real), but it's now followed by real, automatic recovery the instant the
dev server actually comes up, confirmed live earlier in this lesson.

## Exercises

1. Change `DEV_URL` to a port nothing is listening on at all (e.g.
   `:5999`) and run `npm start`. Confirm it retries the full
   `MAX_ATTEMPTS` times, then shows the real fallback page — read the
   real error code and description it displays.
2. Lower `MAX_ATTEMPTS` to `2` and deliberately start the dev server
   later than that short budget allows. Confirm the fallback page appears
   sooner, and reason about the real tradeoff `MAX_ATTEMPTS` controls —
   a short budget gives up faster on a genuinely absent server, but also
   gives a slow-starting one less real time to come up.
3. Comment out the `if (hasConnectedOnce)` branch entirely (but keep
   `did-finish-load` setting the flag) and force a post-success failure
   by quitting and restarting `cnc-web`'s dev server while the app is
   already open and loaded. Confirm you can reproduce this lesson's own
   second real bug, then restore the branch and confirm it's gone.

## Definition of Done

- [ ] `cnc-desktop/` exists with a real `package.json`, `main.js`, and
      `.gitignore`; `npm install` completes with 0 vulnerabilities.
- [ ] `npm start`, with both dev servers already running, opens a real
      window showing the real app within a few seconds.
- [ ] `npm start`, with `cnc-web`'s dev server started a few seconds
      *after* the desktop shell, recovers on its own with no manual
      restart, and prints real, growing retry delays to the terminal
      while it waits.
- [ ] You reproduced this lesson's second real bug yourself (Exercise 3)
      and understand why a post-success failure needed different
      handling than a pre-success one.
- [ ] A git commit exists explaining *why* (this app is a desktop
      application, not a web-hosted one, per direct, recorded decision —
      and the two real bugs a naive first version would have shipped
      with), not just a list of files added.
