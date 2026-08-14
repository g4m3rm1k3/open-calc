# Lesson 7: A Failure That Says Something

**What you will build** — the two real gaps this project has left open
since it started: a real, wrong query now shows a real, readable error
message instead of a silent, unhandled rejection (Lesson 5's own,
named, deferred problem), and the real, initial table list shows a
real "Loading..." message instead of a real, blank flash before data
arrives (Lesson 3's own, named, deferred exercise).

**What you need to know first:** Lesson 5 (`runQuery`, the real,
undefended failure path), Lesson 3 (the real, initial `useEffect`
fetch).

**Terms introduced in this lesson:** None — this lesson's own real
subject is finally, honestly closing two gaps this project has named
directly since Lessons 3 and 5, using nothing but real `useState` and
real `try`/`catch`, both already fully taught.

**Objects and methods used**
- **`try`/`catch` around a real, `await`ed IPC call**
  - *What it is:* real, standard JavaScript — catches a real, rejected
    `Promise` (here, `ipcRenderer.invoke`'s own real rejection when the
    main process's own handler throws) the identical real way it
    catches a real, synchronous exception.
  - *Implementation:* `try { const result = await api.runQuery
    (queryText); ...; } catch (err) { setError(...); }`
  - *Its use:* this lesson's own real, entire error-handling logic.

---

## Concept Unit: What an IPC Error Actually Looks Like

### The Problem

`query_server.py`'s own real errors (Lesson 2's own protocol) already
reach the renderer as a real, rejected `Promise` — Lesson 5 proved
this, then explicitly deferred handling it. Before writing real,
user-facing error UI, it's worth seeing exactly what a real, caught
error message actually contains.

### Introduce the Concept in Isolation

Real, direct proof, run against the real, already-built S05/S06 app,
with no UI changes yet:

```javascript
const result = await window.pocketStudio.runQuery("SELEKT * FROM games");
```

Real, caught result:

```text
caught: Error invoking remote method 'run-query': Error: Unsupported SQL: SELEKT * FROM games
```

*What this proves:* the real, original Python error
(`"Unsupported SQL: SELEKT * FROM games"`, from `query_server.py`'s
own `except Exception as e:` branch) really does reach the renderer —
but Electron's own real IPC machinery wraps it in its own, real,
additional text (`"Error invoking remote method '...': Error: "`)
along the way. A real, honest error UI needs to strip this real,
consistent, extra wrapping before showing anything to a real user.

### Discard the Throwaway Example

No real files created for this unit — the real proof was run directly
against already-existing code.

### Mechanical Walkthrough

- `"Error invoking remote method 'run-query': Error: ..."` — the real,
  first `"Error invoking remote method '<channel>':"` segment is
  Electron's own, real, standard IPC wrapping; the second, real
  `"Error: "` is the real, original JavaScript `Error` object's own
  `.toString()` (from `PocketDBClient`'s own real `new Error(response.
  error)`, Lesson 2), stacked on top.

### CS Lens

An error message picking up real, additional context as it crosses
each real, successive boundary — Python's own exception, wrapped into
a real JSON `"error"` field (Lesson 2), turned into a real JS `Error`
(`PocketDBClient`), then wrapped again by real, standard Electron IPC
— is a genuinely common, real shape: every real boundary a message
crosses is real, free to add its own, real context, and a real, final
consumer often needs to deliberately peel some of it back off.

### SE Lens

Why not just show the real, full, wrapped message directly to a real
user? Because `"Error invoking remote method 'run-query': Error: ..."`
real-exposes this project's own internal implementation (that there's
a real, named IPC channel called `run-query` at all) to someone who
only real, honestly needs to know their own real query was wrong — a
real, small but genuine violation of the same real, narrow-boundary
principle Lesson 1 already established for `contextBridge` itself.

### Commands Needed

No new, separate commands for this unit.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

The real, exact shape of an IPC error is understood. Cleaning it up,
and showing it — along with a real, honest loading state — is next.

---

## Concept Unit: Real State For What's Actually Happening

### The Problem

`runQuery` (Lesson 5) has no real `try`/`catch` at all — a real,
malformed query becomes a real, silent, unhandled rejection, visible
only in a real developer's own DevTools console, never to a real user.
The real, initial table list also renders as a real, empty list for
however long the real, first fetch takes, with nothing telling a real
user anything is happening at all.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/App.tsx` (modified — `error`/
  `loadingTables` state, `cleanErrorMessage`, real `try`/`catch`).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit.

### The New Code — `src/App.tsx`

```typescript
function cleanErrorMessage(message: string): string {
  const marker = "Error: ";
  const lastIndex = message.lastIndexOf(marker);
  return lastIndex === -1 ? message : message.slice(lastIndex + marker.length);
}
```

```typescript
  const [loadingTables, setLoadingTables] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingTables(true);
    api.listTables().then((result) => {
      setTables(result);
      setLoadingTables(false);
    });
  }, []);
```

```typescript
  async function runQuery() {
    setError(null);
    try {
      const result = await api.runQuery(queryText);
      setQueryResult(result);
    } catch (err) {
      setError(cleanErrorMessage((err as Error).message));
      setQueryResult(null);
    }
  }
```

```typescript
      <h2>Tables</h2>
      {loadingTables ? (
        <p>Loading tables...</p>
      ) : (
        <ul>
          {tables.map((name) => (
            <li key={name}>
              <button onClick={() => setSelectedTable(name)}>{name}</button>
            </li>
          ))}
        </ul>
      )}
```

```typescript
      <button onClick={runQuery}>Run</button>
      {error !== null && <p style={{ color: "red" }}>{error}</p>}
      {queryResult !== null && <Grid result={queryResult} />}
```

Real, end-to-end proof — a real, deliberately malformed query:

```javascript
await window.webContents.executeJavaScript(setVal(2, "SELEKT * FROM games"));
await window.webContents.executeJavaScript(clickButtonWithText("Run"));
```

Real, resulting DOM:

```text
<p style="color: red;">Unsupported SQL: SELEKT * FROM games</p>
```

*What this proves:* the real, clean, original Python error — with
none of Electron's own real IPC wrapping — appears, real, visibly, in
the actual, running window.

### Discard the Throwaway Example

Every real change to `src/App.tsx` above is kept — permanent project
code.

### Mechanical Walkthrough

- `setError(null)` at the real, very start of `runQuery` — a real,
  deliberate reset: a real, previous error shouldn't stay real, visible
  once a real, new attempt begins, whether it succeeds or fails again.
- `catch (err) { setError(cleanErrorMessage((err as Error).message));
  setQueryResult(null); }` — `(err as Error)` is a real, necessary
  TypeScript assertion — a real, caught value is typed `unknown` by
  default (real, strict TypeScript doesn't assume every real `throw`
  is genuinely an `Error`); `setQueryResult(null)` real-clears any
  real, previous, successful results, so a real, stale grid doesn't
  stay visible next to a real, new error.
- `loadingTables ? (<p>Loading tables...</p>) : (<ul>...</ul>)` —
  reappearing shape (conditional rendering, Lesson 4) — a real,
  ternary instead of `&&`, since this lesson's own real UI needs one
  of *two* real, mutually exclusive things shown, not "something or
  nothing."

### CS Lens

`error`/`loadingTables` are both real, small, explicit instances of
representing a real, ongoing **asynchronous operation's own state**
directly, in real, component state — not left implicit, inferable only
from *absence* of data. A real UI that never explicitly tracks "is
this still loading" or "did this fail" can only ever show one, real,
true state (success) honestly; every other, real, actual condition
looks identical to a real user.

### SE Lens

Why does `loadingTables` only cover the real, *initial* table fetch,
not every real, subsequent operation (`runQuery`, `insertRow`,
`createTable`) in this lesson? Because this lesson's own real,
stated scope — closing Lessons 3 and 5's own, specifically named gaps
— is deliberately narrower than "add loading state everywhere";
real, honest, incremental scope, the identical real judgment this
whole project has used since Lesson 4's own `getDbClient()}` extraction,
applies here too — the real, remaining gaps are worth naming as real,
future exercises, not silently pretending they don't exist.

### Commands Needed

```bash
npm start
```

### Run It

Type a real, deliberately wrong query (`SELEKT * FROM games`) into the
real, running window's own query box, click Run, and see a real,
clean, readable error message — no Electron IPC boilerplate, no silent
failure.

### Connection

S07 is complete: this project's own two, real, longest-standing,
explicitly named gaps are honestly closed. S08, next, is the last
slice — packaging this project into a real, actual, installable build,
the final, real step from "runs via `npm start`" to "a real
application that exists on disk."

---

## Closing

### Connect the Pieces

This lesson's first unit real, directly inspected what an IPC error
actually contains once it reaches the renderer — real, original Python
text, wrapped twice more by real, successive boundaries (this
project's own protocol, then Electron's own IPC) — and found a real,
consistent, strippable pattern. The second unit added real,
explicit `error`/`loadingTables` state, a real `cleanErrorMessage`
helper, and wrapped `runQuery` in a real `try`/`catch` — closing
Lesson 5's own, named gap — while the real, initial table fetch
finally shows real, honest "Loading tables..." text instead of a real,
silent, empty flash — closing Lesson 3's own, named gap.

### What Breaks Without This

Remove the real `try`/`catch` from `runQuery`, leaving only `const
result = await api.runQuery(queryText); setQueryResult(result);`,
rebuild, and run the identical, real, malformed-query proof. The real,
running app shows real, nothing at all where the error message used to
be — no red text, no visible change — while a real, unhandled
`Promise` rejection appears only in DevTools, invisible to any real
user who isn't a developer. Restore the real `try`/`catch` and confirm
the real, correct, red error text returns.

### Exercises

- Extend the identical, real `try`/`catch`/`cleanErrorMessage` pattern
  to `createTable` and `insertRow`, so a real, malformed columns spec
  or a real, wrong-column-count insert shows the identical, real, clean
  error text instead of a real, silent failure.
- Add a real, second loading state — `insertingRow` — disabling the
  real "Insert" button (`<button disabled={insertingRow}>`) while a
  real insert is in flight, preventing a real, accidental double-click
  from inserting the same real row twice.
- `cleanErrorMessage`'s own real `lastIndexOf("Error: ")` approach
  assumes Electron's own real IPC wrapping format stays consistent.
  Deliberately craft a real Python error message that itself contains
  the literal real text `"Error: "` inside it, and explain what this
  lesson's own real helper does with it — correctly, or not.

### Definition of Done

- [ ] `error`/`loadingTables` state and `cleanErrorMessage` all exist
      as real, permanent code in `App.tsx`.
- [ ] A real, deliberately wrong query shows a real, clean, readable
      error message in the actual, running window.
- [ ] The real, initial table list shows "Loading tables..." before
      real data arrives (even briefly — confirm the real code path is
      correct even if it resolves too fast to see reliably by eye).
- [ ] You caused the real "silent failure" regression yourself
      (removing `try`/`catch`) and confirmed restoring it fixes it.
- [ ] You can explain, from memory, why `cleanErrorMessage` is needed
      at all — referencing this lesson's own first unit.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add real error and loading states, closing two long-deferred gaps"`.
