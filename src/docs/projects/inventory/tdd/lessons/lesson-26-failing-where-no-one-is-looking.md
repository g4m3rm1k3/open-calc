# Lesson 26: Failing Where No One Is Looking

**What you will build:** a small, hand-rolled, leveled logger for
`cnc-web` (`logger.ts`) — the frontend half of a foundational gap named
back in `CURRICULUM.md`'s Correction #4 and never closed since: the
backend has had real Python `logging` since Lesson 18, but every network
call in `cnc-web` has run, since Lesson 7, with zero error handling at
all. Wired into the two real places that matters right now —
`App.tsx`'s `fetchPath` and `MachineStatus.tsx`'s `fetchState` — so a
failed request produces a real, readable, leveled log line instead of an
uncaught promise rejection no one asked to see.

**What you need to know first:** `logging-and-observability.md` (already
taught, Lesson 18, backend) — this lesson is that same idea, in a
language with no built-in equivalent to bring along; `javascript-promises-async.md`'s
Promise states (fulfilled/rejected); `typescript-async-await.md`;
`CURRICULUM.md`'s Correction #4, which already named this gap and
already set the policy this lesson is finally executing on:
`missing concepts.md` items get built "as features are built, not
audited separately."

---

## Where This Gap Already Cost Something

Not hypothetical. Lesson 25's own real Windows verification of
`cnc-desktop` — the window loading a fraction of a second before
`cnc-service` had finished starting — produced this, verbatim, in that
session's real terminal output:

```
[Unhandled rejection] TypeError: Failed to fetch
 > fetchState src/MachineStatus.tsx:19:25
    17 |
    18 |  async function fetchState(program: string): Promise<MachineStateData> {
    19 |    const response = await fetch("http://127.0.0.1:5000/api/simulate", {
       |                           ^
 > Object.react_stack_bottom_frame node_modules/react-dom/cjs/react-dom-client.development.js:25989:19
 ...nine more internal React frames...
```

That dump was named, at the time, as a separate, already-known, still-open
issue (`cnc-desktop`'s missing readiness signal) — correctly out of scope
for that lesson. But look at what actually happened operationally: the
*only* record of a real request failing was nine lines of React's own
internal call stack, visible only because a terminal happened to be open
and watched at that exact moment. In a packaged build with no visible
terminal, this failure leaves no trace anywhere. The DRO panel would just
sit on "loading machine state..." forever, with nothing — not a log
line, not a file, nothing — explaining why.

---

## Concept Unit: `.catch()` — Handling the Failure Half of a Promise

### The Problem

`fetchPath` (`App.tsx`) and `fetchState` (`MachineStatus.tsx`) have both
called `.then(setPoints)`/`.then(setState)` since Lessons 7 and 16,
respectively — wiring up only the *success* half of a Promise. A Promise
that rejects instead (a network error, exactly what happened above) has
nowhere registered to go. JavaScript doesn't silently drop that — it
reports it as a real, distinct failure: an **unhandled rejection**.

### The Concept, Isolated

`javascript-promises-async.md`'s own "Try It Yourself" already names
`.catch()` as an exercise, but never actually runs it with real output —
worth doing for real before this project's own code relies on it:

```javascript
function unreliableFetch(shouldFail) {
  return new Promise((resolve, reject) => {
    if (shouldFail) reject(new Error("network down"));
    else resolve("real data");
  });
}

unreliableFetch(false).then((data) => console.log("success path:", data));

unreliableFetch(true)
  .then((data) => console.log("this never runs:", data))
  .catch((err) => console.log("failure path caught:", err.message));

unreliableFetch(true).then((data) => console.log("this also never runs:", data));
```

**Real output, run this session:**
```
success path: real data
failure path caught: network down

C:\...\catch-lab.js:3
    if (shouldFail) reject(new Error("network down"));
                           ^
Error: network down
    at ...
Node.js v24.12.0
```

**What this proves:** the first two calls behaved exactly as expected —
success ran `.then`, failure ran the registered `.catch` instead, cleanly.
The *third* call — identical failure, no `.catch` registered at all —
crashed the entire process with a raw, unhandled exception and a full
stack trace. That crash shape is the exact same shape (an uncaught
rejection dumping React's own internals) this project's own real Vite
session already produced, above — proof the isolated lab reproduces a
real, not theoretical, failure mode.

### Discard

`catch-lab.js` and its `unreliableFetch` helper are not part of the
project — nothing from this lab is copied into `cnc-web`.

### CS Lens

Per `javascript-promises-async.md`: a Promise has exactly three states —
pending, fulfilled, rejected. `.then` and `.catch` are how a caller
registers a reaction to each of the two settled states; leaving `.catch`
off doesn't make rejection impossible, it just means nothing is listening
for it when it happens.

### SE Lens

The real, easy mistake this project's own code made, twice, since
Lessons 7 and 16: writing the success path first, getting it working,
and treating the failure path as an afterthought to add "later" — except
later never came, for either call site, across ten more lessons. The cost
of adding `.catch()` is one extra chained call; the cost of skipping it
is a real failure mode with zero operational record, discovered only by
accident (a terminal happening to be open at the exact right moment,
exactly how Lesson 25 found it).

---

## Concept Unit: A Named, Leveled Logger for the Browser

### The Problem

Once a rejection is actually caught, something has to happen with it that
`console.log("error")` doesn't provide: a real severity (so a reader —
human or tool — can tell "routine" from "something's wrong" without
reading every line), consistent enough that a whole codebase's log output
means the same thing everywhere. `logging-and-observability.md` already
covers this idea in full — the gap here is entirely that JavaScript ships
no built-in module like Python's `logging` to bring the idea along
automatically.

### The Concept, Isolated

First real distinction, in this project, between the browser's four
console methods — not aliases of `console.log`, each one maps to a real,
different DevTools treatment. Full isolated treatment lives in
`concepts/javascript-console-log-levels.md`, run for real this session —
captured via Playwright reading a live browser's actual console, not
just described:

```
[browser info] ...fetchState succeeded: spindle 1000rpm
[browser error] ...fetchState failed: Failed to fetch
```

Two structurally identical log calls, from the same function, tagged
with genuinely different real types (`"info"` vs. `"error"`) — because
different methods were called, not because of anything in the message
text.

### Discard

Nothing to discard here beyond what `javascript-console-log-levels.md`
already covers as its own isolated lab — the real project code below is
the first place these methods are used for a real purpose, not a
throwaway demonstration.

### Project Change

- **Reference Source:** none — `cnc-sim` has no logging system of its
  own to port from (confirmed: no console/logging calls anywhere in the
  extracted components). This is the frontend half of
  `CURRICULUM.md` Correction #4's named gap, built from scratch to
  mirror `cnc-service/app.py`'s own real `logging.basicConfig` shape
  (Lesson 18), not ported from any reference file.
- **Files affected:** `cnc-web/src/logger.ts` (new file).
- **Change type:** add.
- **Location:** top-level, new file.
- **Dependencies:** none — plain TypeScript, no package to install.

### The New Code

```typescript
type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const CONFIGURED_LEVEL: LogLevel = "info";

const CONSOLE_METHOD: Record<LogLevel, (message: string) => void> = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

export function createLogger(scope: string) {
  function log(level: LogLevel, message: string) {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[CONFIGURED_LEVEL]) return;
    const timestamp = new Date().toISOString();
    CONSOLE_METHOD[level](`${timestamp} ${level.toUpperCase()} ${scope}: ${message}`);
  }

  return {
    debug: (message: string) => log("debug", message),
    info: (message: string) => log("info", message),
    warn: (message: string) => log("warn", message),
    error: (message: string) => log("error", message),
  };
}
```

### The Updated Project

This is the entire new file — nothing surrounds it yet to return to; the
next unit is where it first gets imported and called for real.

### Mechanical Walkthrough
- `type LogLevel = "debug" | "info" | "warn" | "error"` — **(b)
- reappearing** — a union type (`typescript-union-types.md`), narrowing
  to exactly the four real severities this project uses, the same
  narrowing `ThemeDefinition["type"]` already did for theme kinds
  (Lesson 24).
- `Record<LogLevel, number>` and `Record<LogLevel, (message: string) => void>`
- — **(b) reappearing** — `typescript-record-utility-type.md` (Lesson
  23), mapping every possible `LogLevel` to a number and to a function,
  respectively — TypeScript checks both records are exhaustive (missing
  a level would be a real compile error, not a silent gap).
- `{ debug: 0, info: 1, warn: 2, error: 3 }` — **(a) first appearance of
- the mechanism** — a hand-rolled priority ordering.
- `logging-and-observability.md`
  already covers *why* a level threshold matters (Python's `logging`
  provides this natively via `basicConfig(level=...)`); JavaScript has no
  standard-library equivalent, so this project rolls the smallest real
  version by hand: lower priority number means less severe.
- `console.debug` / `console.info` / `console.warn` / `console.error`
  assigned as object values — **(a) first appearance**, per
- `javascript-console-log-levels.md` — four genuinely different browser
  methods, not `console.log` under four names.
- `LEVEL_PRIORITY[level] < LEVEL_PRIORITY[CONFIGURED_LEVEL]` — **(a)
  first appearance of the mechanism** — the actual filtering check: a
  `debug` call (`priority 0`) is silently skipped while `CONFIGURED_LEVEL`
  is `"info"` (`priority 1`), the identical *behavior*
  `logging-and-observability.md`'s own isolated lab already proved for
  Python (`logger.debug(...)` producing no output below the configured
  level) — reappearing idea, new mechanism.
- `new Date().toISOString()` — **(a) first appearance** — a real,
  sortable timestamp string (`2026-07-21T19:44:58.863Z`), the JS
  equivalent of Python's `%(asctime)s` in `cnc-service/app.py`'s own
  format string.
- `` `${timestamp} ${level.toUpperCase()} ${scope}: ${message}` `` —
  **(b) reappearing** — template literal string building, deliberately
  shaped to match `cnc-service/app.py`'s own real format string,
  `"%(asctime)s %(levelname)s %(name)s: %(message)s"`, as closely as two
  different languages' string-formatting syntax allows.
- `export function createLogger(scope: string) { ... return { debug: ..., info: ..., warn: ..., error: ... }; }`
  — **(a) first appearance of the mechanism** — a factory function
  returning a small object of scoped closures, this project's own JS
- equivalent of Python's `logging.getLogger(__name__)` (Lesson 18) —
  every caller gets its own named `scope` (`"App"`, `"MachineStatus"`),
  the same "filterable by where it came from" idea, built by hand since
  JS has no `getLogger` registry to call instead.

### CS Lens

Per `logging-and-observability.md` and `javascript-console-log-levels.md`
together: observability built from two independent real mechanisms
layered on each other — a hand-rolled severity threshold (this project's
own code deciding whether to log at all) sitting on top of the browser's
own native severity-to-icon/filter mapping (DevTools deciding how to
*display* whatever does get logged) — neither one replaces the other.

### SE Lens

The real, honest limit of this fix, not glossed over: this logger only
ever writes to the browser's own console. `missing concepts.md`'s fuller
picture (log aggregation, remote shipping, a file cnc-desktop could
persist) is real, further work this lesson deliberately doesn't attempt —
matching this project's own `logging.basicConfig` on the backend, which
also only writes to stdout, nothing more. Scoped exactly to what closes
the real, currently-open gap: a failure that currently produces *nothing*
searchable now produces one real, structured line.

### Run It — Real Output

```
$ npx tsc --noEmit
(no output — compiles cleanly)
```

Not callable yet on its own — the next unit is where `createLogger` gets
imported and actually used.

---

## Concept Unit (no new concept): Wiring the Logger Into Both Real Fetch Calls

### The Problem

`fetchPath` and `fetchState` both need the same real fix: a `.catch()`
that logs the failure, and — mirroring `cnc-service/app.py`'s own
practice of logging *both* the success and warning paths, not just
failures — a `logger.info` on success too, so a normal request leaves a
real trail, not just a failed one.

### Project Change

- **Reference Source:** none — same reasoning as the unit above.
- **Files affected:** `cnc-web/src/App.tsx`, `cnc-web/src/MachineStatus.tsx`.
- **Change type:** add (a `.catch()` handler and two `logger` calls in
  each file; no existing behavior removed).
- **Location:** `App.tsx`: `fetchPath`'s body and the `useEffect` that
  calls it. `MachineStatus.tsx`: `fetchState`'s body and its own
  `useEffect`.
- **Dependencies:** `createLogger`, from the unit above.

### The New Code

```typescript
import { createLogger } from "./logger.ts";

const logger = createLogger("App");
```

And the actual fix, chained onto the existing call:

```typescript
fetchPath(PROGRAM)
  .then(setPoints)
  .catch((err: Error) => logger.error(`fetchPath failed: ${err.message}`));
```

### The Updated Project

`App.tsx`'s relevant slice — imports, the module-level logger, `fetchPath`
itself, and the effect that calls it — with every new/changed line
marked:

```typescript
import { useEffect, useState } from "react";
import Viewport from "./Viewport.tsx";
import ToolCardList from "./ToolCardList.tsx";
import ToolImportPanel from "./ToolImportPanel.tsx";
import MachineStatus from "./MachineStatus.tsx";
import RibbonToolbar from "./RibbonToolbar.tsx";
import SidePanel from "./SidePanel.tsx";
import ConfigModal from "./ConfigModal.tsx";
import AppearanceSettings from "./AppearanceSettings.tsx";
import { applyTheme, findTheme, getStoredThemeId } from "./themes.ts";
import { createLogger } from "./logger.ts";                       // ← new
import type { PathPoint } from "./segments.ts";

interface PathResponse {
  points: PathPoint[];
}

const logger = createLogger("App");                                // ← new

async function fetchPath(program: string): Promise<PathPoint[]> {
  const response = await fetch("http://127.0.0.1:5000/api/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: PathResponse = await response.json();
  logger.info(`fetchPath succeeded: ${data.points.length} points`);  // ← new
  return data.points;
}
```

And the effect that calls it, inside `App`:

```typescript
useEffect(() => {
  fetchPath(PROGRAM)
    .then(setPoints)                                                          // ← unchanged
    .catch((err: Error) => logger.error(`fetchPath failed: ${err.message}`));  // ← new
}, []);
```

`fetchPath` now reports its own real outcome either way: a real point
count on success, or a real, readable error on failure — never silence,
never an uncaught rejection.

`MachineStatus.tsx` gets the identical treatment, its own scope:

```typescript
import { useEffect, useState } from "react";
import { createLogger } from "./logger.ts";                        // ← new

interface Position {
  x: number;
  y: number;
  z: number;
}

interface MachineStateData {
  position: Position;
  feed: number;
  spindle_rpm: number;
  spindle_dir: string;
  coolant_flood: boolean;
  coolant_mist: boolean;
}

const logger = createLogger("MachineStatus");                      // ← new

async function fetchState(program: string): Promise<MachineStateData> {
  const response = await fetch("http://127.0.0.1:5000/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: MachineStateData = await response.json();
  logger.info(`fetchState succeeded: spindle ${data.spindle_rpm}rpm`); // ← new
  return data;
}
```

And its own effect, the same shape as `App.tsx`'s:

```typescript
useEffect(() => {
  fetchState(program)
    .then(setState)                                                             // ← unchanged
    .catch((err: Error) => logger.error(`fetchState failed: ${err.message}`));  // ← new
}, [program]);
```

### Mechanical Walkthrough

- `import { createLogger } from "./logger.ts"` — **(b) reappearing** —
  ES module import syntax (`javascript-es-modules-import-export.md`),
  now pulling in this lesson's own new file.
- `const logger = createLogger("App")` / `createLogger("MachineStatus")`
  — **(b) reappearing** — calling the factory built in the unit above,
  each call site choosing its own real scope name, exactly mirroring
  `app.py`'s `getLogger(__name__)` producing differently-named loggers
  per module (Lesson 18).
- `logger.info(...)` on success — **(b) reappearing** — the logger's own
  method, called at the exact point a real fact (a successful fetch,
  with a real point count/RPM value) becomes known — the same "log at
  the point of knowledge, not gathered after the fact" discipline
  `app.py`'s own `logger.info` calls already established.
- `.catch((err: Error) => ...)` — **(b) reappearing**, per this lesson's
  first unit — the actual fix: every previously-unhandled rejection now
  has somewhere to go.
- `logger.error(\`fetchPath failed: ${err.message}\`)` — **(b)
  reappearing** — template literal interpolation, embedding the real
  `Error`'s message directly into the log line, the same "value
  interpolated into a human-readable message" shape `app.py`'s own
  `logger.warning("Import failed for %s: %s", filename, reason)` already
  established, just JS's own template-literal mechanism standing in for
  Python's `%s` placeholders.

### CS Lens

Per `logging-and-observability.md`: this is the same "log both outcomes,
not just failures" discipline `cnc-service/app.py` already established —
a system's operational record is only complete if the *success* path
leaves a trail too, not only its failures.

### SE Lens

The real, deliberate scope line drawn here: no UI change. `MachineStatus`
still shows "loading machine state..." forever on a real failure — a
named, honest gap, not silently fixed alongside this one. This lesson's
job was closing the *observability* gap (does anything, anywhere, record
what happened) — a user-facing error state is a separate, real UI
concern that deserves its own scoped pass, not bundled into a logging
lesson just because it touches the same two files.

### Commands

None new — `logger.ts` is plain TypeScript, already covered by the
existing `npx tsc --noEmit`/`npm run dev` toolchain.

### Run It — Real Output

Full, real, live verification — not just typechecking. Captured via
Playwright reading a genuinely running browser's console (`page.on("console", ...)`),
against the real `cnc-web` dev server and real `cnc-service` backend:

**Success path** — both servers running normally:
```
[browser info] 2026-07-21T19:44:28.389Z INFO MachineStatus: fetchState succeeded: spindle 1000rpm
[browser info] 2026-07-21T19:44:28.400Z INFO App: fetchPath succeeded: 6 points
```

**Failure path** — `cnc-service` killed, then the page reloaded, same
session:
```
[browser error] 2026-07-21T19:44:58.863Z ERROR MachineStatus: fetchState failed: Failed to fetch
[browser error] 2026-07-21T19:44:58.864Z ERROR App: fetchPath failed: Failed to fetch
```

Compare this directly against this lesson's own opening section: the
identical real failure (`cnc-service` unreachable) that used to produce
nine lines of React's own internal call stack now produces one real,
readable, timestamped, leveled log line — per call site, every time,
whether or not a terminal happens to be open to see it.

---

## Connect the Pieces

Follow one real failed request, start to finish, with this lesson's fix
in place:

1. `cnc-service` is down (crashed, not yet started, or the network blips
   — exactly Lesson 25's own readiness-signal gap).
2. `MachineStatus`'s `useEffect` calls `fetchState(program)`.
3. `fetch(...)` rejects — `TypeError: Failed to fetch`, a real network
   failure.
4. Before this lesson: nothing was listening for that rejection. JS
   reports it as unhandled — a raw stack dump, visible only if a
   terminal or DevTools console happened to already be open.
5. After this lesson: `.catch((err) => logger.error(...))` is listening.
   `logger.error` checks `LEVEL_PRIORITY["error"]` against the configured
   threshold (always passes — `error` is the highest level), builds a
   real timestamp, and calls the real `console.error` — which DevTools
   renders with its own red icon and error count, automatically.
6. The exact same real failure now leaves a real, searchable, leveled
   trace — the actual, concrete difference between "something failed
   and nobody will ever know" and "something failed, and here's exactly
   what, when, and where."

## What Breaks Without This

Reverting `MachineStatus.tsx`'s effect back to its pre-lesson form:

```typescript
useEffect(() => {
  fetchState(program).then(setState);
}, [program]);
```

Real, observed behavior with `cnc-service` stopped, reproduced live this
session (this lesson's own opening section, and the "before" half of
"Run It — Real Output," above, are both this exact failure, captured
twice): a raw, unhandled-rejection stack dump — nine-plus lines of
React's own internal frames — with no real operational record anywhere
that a request even failed, let alone why. Restoring the `.catch()` and
the logger call replaces that with one real, leveled, timestamped line,
every time, regardless of whether anyone is watching when it happens.

## Exercises

1. Change `CONFIGURED_LEVEL` in `logger.ts` from `"info"` to `"warn"`,
   rerun the success-path capture, and confirm the `fetchState succeeded`/
   `fetchPath succeeded` lines disappear while a deliberately-triggered
   failure's `error` line still appears — direct proof the threshold
   check in `createLogger` actually filters, the same proof
   `logging-and-observability.md`'s own isolated lab already gave for
   Python's `logging`, now confirmed on this project's own hand-rolled
   version.
2. Add a third real call site — `ToolCardList.tsx` or `ToolImportPanel.tsx`
   almost certainly has its own un-caught `fetch` — and give it the same
   treatment: `createLogger` with its own scope, `.catch()`, a
   `logger.error` call. Confirm live, the same way this lesson did, that
   killing `cnc-service` mid-session produces a real log line from that
   component too.
3. Using DevTools' own console severity filter (named in
   `javascript-console-log-levels.md`'s own "Try It Yourself"), hide
   everything except `Errors` while both servers are running normally,
   then stop `cnc-service` and confirm the two real error lines are the
   *only* things that appear — a real, live demonstration of why
   distinct console methods matter, not just distinct message text.
4. `logger.ts` currently only ever writes to the console. Sketch (in
   prose, not code) what would have to change for `cnc-desktop`'s own
   main process to *also* see these frontend log lines — reasoning about
   why that's real, separate scope (per this lesson's own SE Lens, and
   `missing concepts.md`'s broader "structured logging shipped somewhere"
   picture), not a small extension of what's here.

## Definition of Done

- [ ] `cnc-web/src/logger.ts` exists, exports `createLogger`, and
      `npx tsc --noEmit` passes with no errors.
- [ ] Both `App.tsx`'s `fetchPath` and `MachineStatus.tsx`'s `fetchState`
      log a real `info` line on success and a real `error` line on
      failure — verified live, both paths, not just read.
- [ ] Killing `cnc-service` and reloading the app produces a real,
      readable log line for each failed request — no unhandled-rejection
      stack dump.
- [ ] `concepts/javascript-console-log-levels.md` exists with real,
      executed output.
- [ ] `git commit` — message explaining that this closes the frontend
      half of `CURRICULUM.md` Correction #4's named foundational gap,
      using the real failure Lesson 25 already produced as the concrete
      proof it was worth closing.
