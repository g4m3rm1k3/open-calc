# Lesson 28: A Response That Arrived Is Not a Response That Succeeded

**What you will build:** `App.tsx`'s `fetchPath` and `MachineStatus.tsx`'s
`fetchState` now check the response body's own `error` field before
trusting the rest of it — the same convention `ToolImportPanel.tsx`
already established (Lesson 18) — and the code editor shows a real,
visible error message when a program is rejected, instead of the whole
app crashing. The transferable problem: a network request finishing
successfully and the request's *purpose* succeeding are two different
facts, and code that only checks the first one will eventually trust
data that was never meant to be trusted.

**What you need to know first:** `fetch-api.md`'s own exercise
("`fetch` only rejects on genuine network failure, not on an HTTP error
status") — this lesson is that exact fact, applied for real for the
first time; `ToolImportPanel.tsx`'s `result.error` check (Lesson 18);
Lesson 26's `logger`/`.catch()` convention; Lesson 27's `code` tab, where
a rejected program is now a real, reachable input.

---

## Concept Unit: `fetch` Resolves on a Rejected Request Too

### The Problem

`cnc-service`'s own `/api/path` and `/api/simulate` routes return a real
`{"error": "..."}` body with a `400` status whenever a program is
invalid — a deliberate, correct design (`app.py`'s own `except
UnsupportedCodeError as error: return {"error": str(error)}, 400`). But
`fetch` does not treat a `400` as a failure: it resolves normally,
handing back a real `Response` object with `response.ok` false and a
real, parseable JSON body — the exact same shape a successful response
has, just with different fields inside it. Code that calls
`response.json()` and uses the result directly, with no further check,
cannot tell a real error apart from real data.

### The Concept, Isolated

Already covered, not re-taught: `fetch-api.md`'s own "Try It Yourself"
names this exact behavior — *"fetch a path that doesn't exist... confirm
the Promise still resolves (not rejects) with a `404`."* First real
application in this project's own code is the fix below.

### CS Lens

Per `fetch-api.md`: a network-layer success (bytes arrived, a response
exists) and an application-layer success (the request's purpose was
fulfilled) are answered by two different, independent signals — the
first by whether the Promise settles at all, the second by inspecting
the response's own real content.

### SE Lens

`ToolImportPanel.tsx` (Lesson 18) already made the correct choice here —
checking `result.error` on the parsed body, not `response.ok` on the
response object — because this backend always returns real, structured
JSON on failure, never an empty or malformed body. `fetchPath`/`fetchState`
had simply never been given the same treatment, since neither had ever
been fed a program the backend would actually reject until Lesson 27's
own code editor made that a reachable, real input.

---

## Project Change (no new concept): Checking `error` Before Trusting the Rest

### Reference Source

No reference counterpart — `cnc-sim` has no backend round-trip for
G-code parsing at all, so it has no equivalent failure mode to port
from. This mirrors `ToolImportPanel.tsx`'s own established, real
convention (Lesson 18) instead.

### Files Affected

`cnc-web/src/App.tsx`, `cnc-web/src/MachineStatus.tsx` (modified),
`cnc-web/src/theme.css` (new `.code-error` rule). Change type: add (an
`error` field check, a new `programError` state, a visible banner).

### The New Code

```typescript
if (data.error) {
  throw new Error(data.error);
}
```

### The Updated Project

`App.tsx`'s `fetchPath`, in full:

```typescript
interface PathResponse {
  points?: PathPoint[];
  error?: string;
}

async function fetchPath(program: string): Promise<PathPoint[]> {
  const response = await fetch("http://127.0.0.1:5000/api/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: PathResponse = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  logger.info(`fetchPath succeeded: ${data.points!.length} points`);
  return data.points!;
}
```

The effect that calls it now tracks the real outcome as visible state,
not just a log line:

```typescript
const [programError, setProgramError] = useState<string | null>(null);

useEffect(() => {
  fetchPath(debouncedCode)
    .then((pts) => {
      setPoints(pts);
      setProgramError(null);
    })
    .catch((err: Error) => {
      logger.error(`fetchPath failed: ${err.message}`);
      setProgramError(err.message);
    });
}, [debouncedCode]);
```

And the code editor panel renders it, right where the program was typed
or loaded:

```typescript
if (id === "code") {
  return (
    <div className="code-editor-panel">
      <FileActionToolbar currentFileName={fileName} onUploadFile={handleUploadFile} />
      {programError && <div className="code-error">{programError}</div>}
      <CodeEditorTextarea code={code} onChange={setCode} />
    </div>
  );
}
```

`MachineStatus.tsx`'s `fetchState` gets the identical treatment, its own
scope:

```typescript
interface MachineStateData {
  position: Position;
  feed: number;
  spindle_rpm: number;
  spindle_dir: string;
  coolant_flood: boolean;
  coolant_mist: boolean;
  error?: string;
}

async function fetchState(program: string): Promise<MachineStateData> {
  const response = await fetch("http://127.0.0.1:5000/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: MachineStateData = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  logger.info(`fetchState succeeded: spindle ${data.spindle_rpm}rpm`);
  return data;
}
```

And the real CSS backing the visible banner:

```css
.code-error {
  padding: 6px 8px;
  font-size: 10px;
  color: var(--color-rapid);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
```

### Mechanical Walkthrough

- `points?: PathPoint[]` / `error?: string` — **(b) reappearing** —
  optional-property syntax, already established since Lessons 17–18,
  now expressing that a real response is *either* shape, never both.
- `if (data.error) { throw new Error(data.error); }` — **(a) first
  appearance of the mechanism in this project's own fetch functions**,
  per `fetch-api.md`'s already-named fact — turning a real, parsed error
  field into a real, thrown JS error, so the existing `.catch()`
  (Lesson 26) has something to catch.
- `data.points!.length` / `data.points!` — **(a) first appearance** —
  TypeScript's non-null assertion (`typescript-non-null-assertion.md`,
  already established), used here specifically because the `if
  (data.error) throw` above already guarantees `points` is real by the
  time this line runs, even though the type itself still says optional.
- `const [programError, setProgramError] = useState<string | null>(null)`
  — **(b) reappearing** `useState`, applied to a new real piece of UI
  state.
- `.then((pts) => { setPoints(pts); setProgramError(null); })` — **(b)
  reappearing** Promise chaining, now clearing a previous real error the
  moment a later request actually succeeds.
- `{programError && <div className="code-error">{programError}</div>}`
  — **(b) reappearing** — the same conditional-JSX-render shape already
  established (Lesson 26's own error banners, `isConfigOpen &&`, and
  others), rendering the real backend message directly, unmodified.

### CS Lens

Per `fetch-api.md`: this closes the exact gap that file's own exercise
already named — the difference between a Promise settling and the
operation it represents actually succeeding, now enforced in real project
code instead of only demonstrated in an isolated lab.

### SE Lens

The real, deliberate scope of this fix: it makes a rejected program
*visible and survivable*, nothing more. `MachineStatus.tsx` still has no
UI of its own for a failed state beyond staying on `"loading machine
state..."` — a real, named, separate gap, since the one place a user
actually needs to see *why* a program was rejected is where they're
editing it, not the DRO panel reading its result.

### Commands

None new.

### Run It — Real Output

Verified live, via a real browser driven against the real running app —
uploading a program the backend genuinely rejects:

```
[browser error] 2026-07-21T20:28:11.663Z ERROR MachineStatus: fetchState failed: multiple G words on one line not supported yet: [21.0, 90.0, 17.0, 40.0, 49.0, 80.0]
[browser error] 2026-07-21T20:28:11.665Z ERROR App: fetchPath failed: multiple G words on one line not supported yet: [21.0, 90.0, 17.0, 40.0, 49.0, 80.0]
```

The app itself stayed up — `.app-shell` still present, no crash — and
the code editor showed the real backend message directly, in a visible
`.code-error` banner. Uploading a valid program afterward cleared it
immediately and both fetches succeeded normally.

---

## Connect the Pieces

Follow one real rejected upload, start to finish:

1. A program the backend can't fully parse is loaded into the editor.
2. `fetchPath`/`fetchState` both receive a real `200`-shaped `fetch`
   resolution carrying a `400` status and a real `{"error": "..."}` body.
3. Both now check `data.error` before touching anything else, and throw
   a real `Error` carrying the backend's own message.
4. The existing `.catch()` handlers (Lesson 26) log it and, in `App.tsx`,
   also set `programError`.
5. The code editor panel renders the real message in a visible banner —
   the same real text the backend produced, unmodified, right where the
   program was typed or loaded.
6. Editing the program again and getting a valid result clears the
   banner and both fetches succeed, exactly as before.

## What Breaks Without This

Reverting `fetchState` to read the response directly with no `error`
check:
```typescript
const data: MachineStateData = await response.json();
logger.info(`fetchState succeeded: spindle ${data.spindle_rpm}rpm`);
return data;
```
Real, observed behavior with this version: a rejected program's real
`{"error": "..."}` body gets treated as a valid `MachineStateData`,
`setState` is called with it, and `MachineStatus`'s own render reads
`state.position.x` on an object that has no `position` field at all —
a real, uncaught `TypeError`, with no error boundary anywhere in the
app, unmounting the entire React tree. The app goes blank with no
visible explanation. Restoring the `error` check removes the bad data
before it ever reaches `setState`.

## Exercises

1. Give `MachineStatus.tsx` its own visible error state (not just a log
   line) — the real, named gap this lesson leaves open — and verify live
   that it shows something real instead of staying on "loading machine
   state..." forever.
2. `ToolCardList.tsx` and `ToolImportPanel.tsx`'s own `fetchPreview`/
   `commitImport` already check `result.error` (Lesson 18) — confirm
   directly, by reading their code, that they don't share this lesson's
   bug at all, and explain why they didn't need this same fix.
3. Add a real error boundary component around `<MachineStatus />` and
   deliberately feed it bad data again (temporarily removing the `error`
   check) — confirm the boundary catches the render crash instead of the
   whole app going blank, and reason about why an error boundary and this
   lesson's own fix are complementary, not substitutes for each other.

## Definition of Done

- [ ] `fetchPath` and `fetchState` both check `data.error` and throw
      before trusting the rest of the response — verified live.
- [ ] A program the backend rejects shows a real, visible error message
      in the code editor, and the app does not crash — verified live.
- [ ] The error clears and both fetches recover normally once a valid
      program is loaded — verified live.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] `git commit` — message explaining that this closes a real crash
      (an uncaught render error with no error boundary) by checking a
      response's own `error` field before trusting it, the same
      convention already established elsewhere in this project.
