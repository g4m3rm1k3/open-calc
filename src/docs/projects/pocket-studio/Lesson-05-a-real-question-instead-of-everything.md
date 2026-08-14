# Lesson 5: A Real Question, Instead of Everything

**What you will build** — a real, live query box: type a real
`WHERE`/`ORDER BY`/`LIMIT` query, click Run, and see real, filtered,
sorted results — reusing `pocket-db`'s own real, already-built
`Cursor` (its Lessons 19, 22, and 29) exactly, not a second, parallel
query engine.

**What you need to know first:** Lesson 4 (`App`, real state, real
row grids); `pocket-db`'s own real `dbapi.py`/`Cursor` (its Lessons
19, 22, 29 — `.execute()`, `WHERE`/`ORDER BY`/`LIMIT`,
`.description`).

**Terms introduced in this lesson:** **Controlled input** — a real
React `<input>` whose own real, displayed value is driven entirely by
real component state (`value={queryText}`), not by the real DOM
element's own, independent memory — every real keystroke updates real
state first, and the real, displayed character only follows because
React re-renders with the new, real value.

**Objects and methods used**
- **`value` / `onChange`, together**
  - *What they are:* the real, standard React pattern making an
    `<input>` "controlled" — `value` sets what's real, currently
    shown; `onChange` fires on every real keystroke, real-updating
    state, which then real-drives `value` again on the next render.
  - *Implementation:* `<input value={queryText} onChange={(event) =>
    setQueryText(event.target.value)} />`
  - *Its use:* this lesson's own real, entire query text box.

---

## Concept Unit: One Component, Two Real Jobs

### The Problem

Lesson 4's own `Grid`-shaped JSX — real headers, real rows — is about
to be needed in a *second*, real place: showing a real table's own
rows (already built), and now showing a real *query's* own results.
Duplicating the identical, real markup twice would be real, obvious
waste.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/App.tsx` (modified — `Grid` extracted as
  its own, real, second component).
- **Change type:** Refactor.
- **Dependencies:** Lesson 4's own real row-rendering JSX.

### The New Code — `Grid`, Extracted

```typescript
interface GridProps {
  result: RowsResult;
}

function Grid({ result }: GridProps) {
  return (
    <table border={1} cellPadding={4}>
      <thead>
        <tr>
          {result.columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {result.rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((value, columnIndex) => (
              <td key={columnIndex}>{stripQuotes(value)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Discard the Throwaway Example

`Grid` is kept — a real, permanent, second component.

### Mechanical Walkthrough

- `interface GridProps { result: RowsResult; }` then `function Grid({
  result }: GridProps)` — real, standard React **props** — the
  identical real shape `App` itself has never needed until now
  (nothing has passed data *into* a component from outside before);
  `Grid` takes a real `RowsResult` and knows nothing about where it
  came from — a real table browse, or a real query.

### CS Lens

Extracting `Grid` the exact real moment a *second* real caller needs
the identical real rendering logic — not before — is the identical
real, felt-need-driven judgment this whole project has used
throughout (Lesson 4's own `getDbClient()`, `pocket-db`'s own entire
design philosophy): real structure earns its place when a real, second
use case actually shows up.

### SE Lens

Why does `Grid` take one, real `result: RowsResult` prop rather than
two, separate `columns`/`rows` props? Because `columns` and `rows` are
never real, independently meaningful — a real caller always has both
together (this lesson's own `RowsResult` interface already bundles
them, from Lesson 4) — one real prop matching one real, existing,
already-bundled shape is simpler than two real props that would always
be passed together anyway.

### Commands Needed

No new, separate commands for this unit.

### Run It

Proven together with this lesson's own second unit, next.

### Connection

`Grid` is real and reusable. Building the real query box that feeds it
a second, real way is next.

---

## Concept Unit: A Real Question, Answered By `pocket-db` Itself

### The Problem

Nothing yet lets a real, actual query reach `pocket-db`'s own real
`WHERE`/`ORDER BY`/`LIMIT` support (its own Lessons 8 and 22) — S04's
own real `get_rows` always fetches an entire, real table.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `query_server.py` (modified — switched to
  `dbapi.connect`, `"run_query"` added), `src/main.ts` (modified —
  `"run-query"` channel), `src/preload.ts` (modified — `runQuery`
  exposed), `src/App.tsx` (modified — the real query box).
- **Change type:** Add/Refactor.
- **Dependencies:** This lesson's own first unit; `pocket-db`'s own
  real `dbapi.py`/`Cursor`.

### The New Code — `query_server.py`

```python
import dbapi

conn = None


def handle_request(request):
    method = request["method"]
    params = request.get("params", {})

    if method == "open":
        global conn
        conn = dbapi.connect(params["path"])
        return {"ok": True}
    elif method == "list_tables":
        return {"tables": conn._db.table_names()}
    elif method == "get_rows":
        table = params["table"]
        records = conn._db.query(table)
        if not records:
            return {"columns": conn._db.schema(table), "rows": []}
        return {"columns": records[0].columns(), "rows": [r.values() for r in records]}
    elif method == "run_query":
        sql = params["sql"]
        cursor = conn.cursor()
        cursor.execute(sql)
        columns = [d[0] for d in cursor.description] if cursor.description else []
        return {"columns": columns, "rows": cursor.fetchall()}
    else:
        raise ValueError(f"Unknown method: {method}")
```

Real, isolated proof — the identical real `WHERE`/`ORDER BY` this
project has always been building toward:

```bash
printf '{"id": 1, "method": "open", "params": {"path": "test.pdb"}}\n{"id": 2, "method": "run_query", "params": {"sql": "SELECT * FROM games WHERE score > 80 ORDER BY score DESC"}}\n' | python query_server.py
```

Real output:

```text
{"id": 1, "result": {"ok": true}}
{"id": 2, "result": {"columns": ["id", "player", "score"], "rows": [["1", "'Alice'", "100"], ["3", "'Carol'", "92"], ["2", "'Bob'", "85"]]}}
```

### The New Code — `src/main.ts` / `src/preload.ts`, Extended

```typescript
ipcMain.handle("run-query", async (_event, sql: string): Promise<RowsResult> => {
  const client = await getDbClient();
  return (await client.request("run_query", { sql })) as RowsResult;
});
```

```typescript
contextBridge.exposeInMainWorld("pocketStudio", {
  ping: (): Promise<string> => ipcRenderer.invoke("ping"),
  listTables: (): Promise<string[]> => ipcRenderer.invoke("list-tables"),
  getRows: (table: string): Promise<RowsResult> => ipcRenderer.invoke("get-rows", table),
  runQuery: (sql: string): Promise<RowsResult> => ipcRenderer.invoke("run-query", sql),
});
```

### The New Code — `src/App.tsx`, the Real Query Box

```typescript
export function App() {
  // ... tables/selectedTable/rows state, unchanged from Lesson 4 ...
  const [queryText, setQueryText] = useState("");
  const [queryResult, setQueryResult] = useState<RowsResult | null>(null);

  async function runQuery() {
    const result = await api.runQuery(queryText);
    setQueryResult(result);
  }

  return (
    <div>
      {/* ... table list and selected-table Grid, unchanged ... */}

      <h2>Query</h2>
      <input
        type="text"
        value={queryText}
        onChange={(event) => setQueryText(event.target.value)}
        placeholder="SELECT * FROM games WHERE score > 80 ORDER BY score DESC"
        size={50}
      />
      <button onClick={runQuery}>Run</button>
      {queryResult !== null && <Grid result={queryResult} />}
    </div>
  );
}
```

Real, end-to-end proof — a real, typed query, a real click, real
results:

```text
REAL_RENDERED_HTML: <div>...<h2>Query</h2><input ... value="SELECT * FROM games WHERE score &gt; 80 ORDER BY score DESC"><button>Run</button><table border="1" cellpadding="4"><thead><tr><th>id</th><th>player</th><th>score</th></tr></thead><tbody><tr><td>1</td><td>Alice</td><td>100</td></tr><tr><td>3</td><td>Carol</td><td>92</td></tr><tr><td>2</td><td>Bob</td><td>85</td></tr></tbody></table></div>
```

### Discard the Throwaway Example

```bash
rm test.pdb
```

Every real file change above is kept — permanent project code.

### Mechanical Walkthrough

- `conn = dbapi.connect(params["path"])` — reappearing shape
  (`pocket-db`'s own Lesson 19) — `query_server.py` now opens the real
  database through `dbapi.py`'s own real `Connection`, not a plain
  `Database` directly, so the identical real object backs
  `list_tables`/`get_rows`/`run_query` all at once — no real, second,
  competing file handle.
- `conn._db.table_names()` / `conn._db.query(table)` — reaching into
  `dbapi.Connection`'s own `_db` attribute directly — the identical
  real pattern `dbapi.py`'s own `Cursor._execute_select` already uses
  internally (`pocket-db`'s own Lesson 22).
- `columns = [d[0] for d in cursor.description] if cursor.description
  else []` — reappearing shape (`pocket-db`'s own Lesson 29) — real,
  defensive handling for the real case `cursor.description` is `None`
  (an `INSERT`, or nothing executed yet).
- `value={queryText}` / `onChange={(event) => setQueryText(event.
  target.value)}` — covered fully in Objects and methods used, above.

### CS Lens

A **controlled input** is a real, small, concrete instance of the
identical real, declarative principle this whole project's UI has used
since Lesson 3: the real, displayed text is never set directly — it's
whatever real state says it should be, and React keeps the real DOM
honest to that real state on every render.

### SE Lens

Why does `App.tsx` still call the exact same `pocket-db`-shaped SQL
subset (`WHERE`/`AND`/`OR`/`ORDER BY`/`LIMIT`) rather than inventing
its own, simpler query language for this lesson's own real box?
Because `pocket-db`'s own `Cursor` (its Lessons 19, 22) already,
honestly does this real job — real-reimplementing query parsing here
would be the identical real duplication this whole curriculum has
avoided from Lesson 2 onward: `pocket-studio` is a real *client*,
never a second, competing engine.

### Commands Needed

```bash
npm start
```

### Run It

Type a real query — `SELECT * FROM games WHERE score > 80 ORDER BY
score DESC` — into the real, running window's own query box, click
Run, and see real, correctly filtered and sorted rows.

### Connection

S05 is complete: a real, typed question now reaches `pocket-db`'s own
real query engine and comes back as real, rendered rows — the same
real `Grid` component serving two, real, genuinely different data
sources. S06, next, is where this project's own real UI can finally
*write* — creating a table, inserting a row, through a real form.

---

## Closing

### Connect the Pieces

This lesson's first unit extracted `Grid` — a real, second component
— the exact moment a real, second consumer (query results, alongside
the already-real table browser) needed the identical real rendering
logic. The second unit gave `query_server.py` a real `run_query`
method built on `pocket-db`'s own already-real `dbapi.Cursor` (its own
Lessons 19, 22, and 29's freshly-added `.description`), wired a real,
controlled `<input>` to it, and proved the whole real chain end to end
— a real, typed `WHERE`/`ORDER BY` query, answered correctly by
`pocket-db` itself, not a second, parallel implementation.

### What Breaks Without This

Remove the real `onChange` handler from the query `<input>` (keep
`value={queryText}`), rebuild, and try typing into the real, running
box. React itself real-warns, in the real DevTools console: `"You
provided a value prop to a form field without an onChange handler.
This will render a read-only field..."` — and the real, displayed box
genuinely can't be typed into at all; every real keystroke is
silently discarded, because `value` alone tells React what to show,
with nothing real ever updating it. Restore `onChange` and confirm the
real box accepts real typing again.

### Exercises

- Add a second, real query box preset — a button labeled `"Show
  everyone"` that sets `queryText` to `"SELECT * FROM games"` and
  immediately calls `runQuery()`, without the user typing anything.
- `run_query` currently has no real, deliberate handling for a
  malformed query (`"SELEKT * FROM games"`) — it real-raises inside
  Python, and the resulting rejected `Promise` currently has nowhere
  real to go in `App.tsx`. Confirm this yourself (a real, unhandled
  rejection appears in the console), and note it as this lesson's own,
  honest, deferred problem — S07's own real, upcoming subject.
- Explain, in your own words, why setting a real `<input>`'s own
  `.value` property directly (outside of React, e.g. from a real,
  automated test script) does *not* reliably update what a real,
  controlled React input displays — referencing this lesson's own CS
  Lens on declarative rendering.

### Definition of Done

- [ ] `Grid` exists as its own, real, separate component; `query_
      server.py`'s `run_query` and the matching real IPC plumbing all
      exist.
- [ ] Typing a real `WHERE`/`ORDER BY` query into the real, running
      window and clicking Run shows real, correctly filtered and
      sorted rows.
- [ ] You caused the real "read-only input" failure yourself (removing
      `onChange`) and confirmed restoring it fixes it, including
      reading React's own real, exact console warning.
- [ ] You can explain, from memory, why `query_server.py` switched to
      `dbapi.connect` instead of a plain `Database`, for this
      lesson's own specific, real reason — referencing this lesson's
      own Mechanical Walkthrough.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a real, live query box reusing pocket-db's own Cursor"`.
