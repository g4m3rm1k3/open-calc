# Lesson 4: A Grid That Follows Your Click

**What you will build** — clicking any real table name in the actual
window now shows that real table's own actual rows, in a real grid —
through both real process boundaries again, this time carrying real
row data instead of just table names.

**What you need to know first:** Lesson 3 (`App`, `useState`,
`useEffect` with an empty dependency array).

**Terms introduced in this lesson:** **Conditional rendering** — real
JSX, shown or omitted based on a real, ordinary JavaScript condition —
there is no separate, special "if" syntax in JSX at all. **Dependency
array** — `useEffect`'s own real, second argument; React compares it,
real value by real value, to what it was on the *previous* render, and
only re-runs the effect if something real actually changed.
**Fragment (`<>...</>`)** — real, standard JSX shorthand for grouping
several real elements without adding a real, extra, wrapping DOM
element that serves no purpose.

**Objects and methods used**
- **`useEffect` with a real, non-empty dependency array**
  - *What it is:* the identical real hook from Lesson 3, used here
    with `[selectedTable]` instead of `[]` — real-runs once after the
    first render, *and* again every real time `selectedTable` itself
    changes.
  - *Implementation:* `useEffect(() => { ...; }, [selectedTable]);`
  - *Its use:* this lesson's own real, entire "fetch new rows when a
    different table is clicked" logic.

---

## Concept Unit: A Real Answer For "Show Me This Table"

### The Problem

`list_tables` (Lesson 2) only ever answers "what tables exist." Real,
actual row data — the entire real point of a database GUI — has no
real way to reach the renderer yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `query_server.py` (modified — `"get_rows"`
  added), `src/main.ts` (modified — `"get-rows"` IPC channel added,
  `getDbClient()` extracted), `src/preload.ts` (modified — `getRows`
  exposed).
- **Change type:** Add.
- **Dependencies:** Lesson 2's real protocol; `pocket-db`'s own real
  `query`/`schema` (already built, Lessons 4 and 18).

### The New Code — `query_server.py`

```python
elif method == "get_rows":
    table = params["table"]
    records = db.query(table)
    if not records:
        return {"columns": db.schema(table), "rows": []}
    return {"columns": records[0].columns(), "rows": [r.values() for r in records]}
```

Real, isolated proof, piped directly in, exactly like Lesson 2's own
first proof:

```bash
printf '{"id": 1, "method": "open", "params": {"path": "test.pdb"}}\n{"id": 2, "method": "get_rows", "params": {"table": "games"}}\n' | python query_server.py
```

Real output:

```text
{"id": 1, "result": {"ok": true}}
{"id": 2, "result": {"columns": ["id", "player", "score"], "rows": [["1", "'Alice'", "100"], ["2", "'Bob'", "85"]]}}
```

The real, empty-table edge case:

```text
{"id": 2, "result": {"columns": ["id"], "rows": []}}
```

### The New Code — `src/main.ts`, Extended

```typescript
let dbClient: PocketDBClient | null = null;

async function getDbClient(): Promise<PocketDBClient> {
  if (!dbClient) {
    dbClient = new PocketDBClient(
      "python",
      path.join(__dirname, "..", "query_server.py"),
      "C:\\msys64\\ucrt64\\bin"
    );
    await dbClient.request("open", { path: path.join(__dirname, "..", "games.pdb") });
  }
  return dbClient;
}

ipcMain.handle("list-tables", async (): Promise<string[]> => {
  const client = await getDbClient();
  const result = (await client.request("list_tables")) as { tables: string[] };
  return result.tables;
});

interface RowsResult {
  columns: string[];
  rows: string[][];
}

ipcMain.handle("get-rows", async (_event, table: string): Promise<RowsResult> => {
  const client = await getDbClient();
  return (await client.request("get_rows", { table })) as RowsResult;
});
```

### The New Code — `src/preload.ts`, Extended

```typescript
interface RowsResult {
  columns: string[];
  rows: string[][];
}

contextBridge.exposeInMainWorld("pocketStudio", {
  ping: (): Promise<string> => ipcRenderer.invoke("ping"),
  listTables: (): Promise<string[]> => ipcRenderer.invoke("list-tables"),
  getRows: (table: string): Promise<RowsResult> => ipcRenderer.invoke("get-rows", table),
});
```

### Discard the Throwaway Example

```bash
rm test.pdb
```

Every real `.py`/`.ts` change above is kept — permanent project code.

### Mechanical Walkthrough

- `if not records: return {"columns": db.schema(table), "rows": []}`
  — a real, deliberate edge case: `records[0]` would real-crash on a
  genuinely empty table (Lesson 15's own real `IndexError` territory)
  — `db.schema(table)` (Lesson 18) still real-supplies the correct
  column headers even when there's real, nothing to show yet.
- `getDbClient()` — a real, small, extracted helper — both
  `ipcMain.handle` callbacks now share the identical real,
  lazily-initialized `PocketDBClient`, rather than each one real-
  duplicating the same real check.

### CS Lens

Extracting `getDbClient()` the moment a *second* real caller needed
the identical real logic — not before — is the same real,
felt-need-driven judgment this whole curriculum, and `pocket-db`
before it, has used throughout: real structure earns its place when a
real, second use case actually shows up, not preemptively.

### SE Lens

Why does `get_rows` real-return every real row at once, rather than a
real, paginated slice? Because this lesson's own real, stated goal is
"clicking a table shows its rows" — real pagination is a real,
legitimate, later concern (this project's own S02's real, small
one-page-per-table capacity already caps how large a real result can
even be for now) — building it before a real, felt need for it exists
would be the identical real overreach this project's own design
principles already reject.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

Real row data can now reach the renderer. Actually showing it — only
when a real table is selected, replaced correctly when a different one
is clicked — is next.

---

## Concept Unit: Showing It Only When There's Something to Show

### The Problem

Nothing in `App` yet tracks *which* real table is selected, or shows
anything beyond the real table list itself.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/App.tsx` (modified).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit; Lesson 3's `App`.

### The New Code — `src/App.tsx`

```typescript
import { useState, useEffect } from "react";

interface RowsResult {
  columns: string[];
  rows: string[][];
}

interface PocketStudioApi {
  ping: () => Promise<string>;
  listTables: () => Promise<string[]>;
  getRows: (table: string) => Promise<RowsResult>;
}

const api = (window as unknown as { pocketStudio: PocketStudioApi }).pocketStudio;

function stripQuotes(value: string): string {
  return value.startsWith("'") && value.endsWith("'") ? value.slice(1, -1) : value;
}

export function App() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [rows, setRows] = useState<RowsResult>({ columns: [], rows: [] });

  useEffect(() => {
    api.listTables().then((result) => setTables(result));
  }, []);

  useEffect(() => {
    if (selectedTable === null) {
      return;
    }
    api.getRows(selectedTable).then((result) => setRows(result));
  }, [selectedTable]);

  return (
    <div>
      <h1>PocketStudio</h1>
      <h2>Tables</h2>
      <ul>
        {tables.map((name) => (
          <li key={name}>
            <button onClick={() => setSelectedTable(name)}>{name}</button>
          </li>
        ))}
      </ul>

      {selectedTable !== null && (
        <>
          <h2>{selectedTable}</h2>
          <table border={1} cellPadding={4}>
            <thead>
              <tr>
                {rows.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((value, columnIndex) => (
                    <td key={columnIndex}>{stripQuotes(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
```

Real, end-to-end proof — a real click, a real grid:

```javascript
await window.webContents.executeJavaScript("document.querySelector('button').click()");
```

Real, resulting DOM (read directly from a real, running window):

```html
<div><h1>PocketStudio</h1><h2>Tables</h2><ul><li><button>games</button></li></ul><h2>games</h2><table border="1" cellpadding="4"><thead><tr><th>id</th><th>player</th><th>score</th></tr></thead><tbody><tr><td>1</td><td>Alice</td><td>100</td></tr><tr><td>2</td><td>Bob</td><td>85</td></tr></tbody></table></div>
```

Real proof the grid correctly *replaces itself* on a second, different
click, not just appends:

```text
after clicking games: games
after clicking scores: scores
scores rows shown: 1500
```

### Discard the Throwaway Example

The click-and-read verification scripts above are real, throwaway
proofs — not saved as project files. `src/App.tsx` is kept — real,
permanent project code.

### Mechanical Walkthrough

- `{selectedTable !== null && ( ... )}` — covered fully in Objects and
  methods used, above (Terms) — real, ordinary JavaScript: `&&`
  real-evaluates its right side only when the left side is real-true;
  React real-renders whatever real value the whole expression produces
  — here, either real JSX, or the real, literal value `false`, which
  React knows to render as nothing at all.
- `useEffect(() => { ...; }, [selectedTable]);` — covered fully in
  Objects and methods used; on the real, second click ("scores"),
  React compares the new `selectedTable` ("scores") to the previous
  real render's value ("games"), finds them genuinely different, and
  real-runs the effect again — fetching `"scores"`'s own real rows.
- `<>...</>` — covered fully in Objects and methods used (Terms) — a
  real table needs both an `<h2>` and a `<table>` at the same real
  level; JSX real-requires exactly one, real, top-level element per
  expression, and a `<>` real-satisfies that without adding a real,
  meaningless extra `<div>`.
- `stripQuotes(value)` — a real, small, deliberate UI-level cleanup:
  `pocket-db`'s own `TextValue.to_string()` (its own Lesson 4) wraps
  real text in real, literal single quotes — a real, already-documented
  `pocket-db` quirk (its own Lesson 18 exercises); this lesson strips
  them for real, honest display, without needing to change `pocket-db`
  itself.

### CS Lens

React comparing `[selectedTable]` render-to-render, and only real-
re-running the effect when something inside it genuinely changed, is a
real, small instance of **memoization** — real, expensive work (a real
IPC round trip, a real Python query) is only redone when its own real
inputs actually change, not on every single real render for any
reason at all.

### SE Lens

Why does `stripQuotes` live in `App.tsx`, a real, presentation-layer
file, rather than being fixed inside `query_server.py` or `pocket-db`
itself? Because `pocket-db`'s own real, raw, quoted format is real,
correct and useful for *its own* purposes (Lesson 18's own real
`Record.__repr__`, for instance, depends on it) — this lesson's own
real UI is one, particular *consumer* of that real data with its own,
real display preferences; fixing it at the display layer, not the
source, keeps `pocket-db` itself honest and unchanged for its own,
already-established real reasons.

### Commands Needed

```bash
npm start
```

### Run It

Click any real table name in the real, running window. Its real,
actual rows appear in a real grid below it. Click a different real
table name — the real grid correctly, entirely replaces itself.

### Connection

S04 is complete: a real click now shows real, actual row data, through
both of this project's own real process boundaries, replacing itself
correctly as different tables are selected. S05, next, is where a real
query — not just "show me everything" — finally reaches
`pocket-db`'s own real `WHERE`/`ORDER BY`/`LIMIT` support.

---

## Closing

### Connect the Pieces

This lesson's first unit added `get_rows` to the real, hand-rolled
protocol from Lesson 2, reusing nothing but `pocket-db`'s own already-
real `query`/`schema` methods, and extracted `getDbClient()` the exact
real moment a second, real caller needed it. The second unit taught
`App` to track which real table is selected, fetch its real rows only
when that real selection actually changes (a real, non-empty
`useEffect` dependency array, proven by clicking two different, real
tables in sequence and confirming the grid genuinely replaces itself),
and render real, conditional JSX only once there's something real to
show — proven, again, by reading the real, actual DOM out of a real,
running window.

### What Breaks Without This

Change `useEffect`'s own real dependency array from `[selectedTable]`
to `[]`, rebuild, and click two different, real table buttons in
sequence in the real, running app. The real grid shows the *first*
real table's own rows correctly — then never updates again; clicking
"scores" after "games" leaves `games`'s own real rows on real, visible
display, silently wrong. Restore `[selectedTable]` and confirm the
real, second click correctly replaces the grid.

### Exercises

- Add a real, third `useState` tracking the currently-selected
  table's own real row *count* (`rows.rows.length`), displayed next to
  its real heading (e.g., `"games (2 rows)"`).
- `get_rows` currently returns *every* real row a table has. Using
  `pocket-db`'s own already-real `database_row_count` (Lesson 18),
  add a real warning in the UI when a selected table's own real row
  count is suspiciously close to this project's own known, real page
  capacity limit (`~95`-`130` rows, depending on schema).
- Deliberately click a table name, then immediately click a *different*
  one before the first real `getRows` call has actually resolved.
  Explain, referencing this lesson's own CS Lens on `useEffect`'s
  real dependency comparison, whether a real, stale response from the
  first call could ever incorrectly overwrite the real, second table's
  own rows — and if so, what a real fix would need to check.

### Definition of Done

- [ ] `query_server.py`'s `get_rows`, and `src/main.ts`/
      `src/preload.ts`'s matching real IPC plumbing, all exist as
      real, permanent code.
- [ ] Clicking a real table name in the real, running window shows its
      real, actual rows in a real grid.
- [ ] Clicking a second, different real table name correctly replaces
      the real grid, not appends to it.
- [ ] You caused the real "effect never re-runs" failure yourself
      (reverting to an empty dependency array) and confirmed restoring
      `[selectedTable]` fixes it.
- [ ] You can explain, from memory, why `stripQuotes` lives in the UI
      layer instead of being fixed inside `pocket-db` itself —
      referencing this lesson's own SE Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a real, clickable row grid per table"`.
