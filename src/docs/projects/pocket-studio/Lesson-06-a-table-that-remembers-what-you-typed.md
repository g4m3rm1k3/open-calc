# Lesson 6: A Table That Remembers What You Typed

**What you will build** — real, working forms: create a real table by
typing its name and columns, then insert a real row into it — both
through the actual, running window, both genuinely, permanently
persisted, provable by reopening the real `.pdb` file in a completely
separate process.

**What you need to know first:** Lesson 5 (`Grid`, controlled
inputs); `pocket-db`'s own already-real `create_table`/`insert`
(its own Lessons 1 and 11 — no new `pocket-db` capability needed this
lesson, the first time that's been true).

**Terms introduced in this lesson:** **Immutable array update** — a
real, standard React rule: never change an existing array or object
in real, component state directly (`array[i] = x`); always build a
real, new one (`const next = [...array]; next[i] = x;`) and pass that
to the real state setter — React compares real state by *reference*,
not by real, deep content, so a real, direct mutation wouldn't be
noticed at all.

**Objects and methods used**
- **`[...insertValues]`**
  - *What it is:* real, standard JavaScript **spread syntax** — copies
    every real element of an existing array into a real, brand-new
    one.
  - *Implementation:* `const next = [...insertValues]; next[index] =
    event.target.value; setInsertValues(next);`
  - *Its use:* this lesson's own real, entire "update one field in a
    real, dynamic list of inputs" logic.

---

## Concept Unit: Two Real Operations, Already Built

### The Problem

Every real write this project has ever made (S02's own real setup
data) happened outside the actual, running window. Nothing yet lets a
real, actual user create a table or insert a row through the UI
itself.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `query_server.py` (modified — `"create_table"`/
  `"insert_row"` added), `src/main.ts`/`src/preload.ts` (modified —
  matching real IPC channels), `src/App.tsx` (modified — a real
  "Create Table" form).
- **Change type:** Add.
- **Dependencies:** `pocket-db`'s own already-real `Database.
  create_table`/`.insert` (its Lessons 1, 11) — genuinely nothing new
  needed there this time.

### The New Code — `query_server.py`

```python
elif method == "create_table":
    table = params["table"]
    columns = params["columns"]
    conn._db.create_table(table, **columns)
    return {"ok": True}
elif method == "insert_row":
    table = params["table"]
    values = params["values"]
    conn._db.insert(table, *values)
    return {"ok": True}
```

Real, isolated proof:

```bash
printf '{"id": 1, "method": "open", "params": {"path": "test.pdb"}}\n{"id": 2, "method": "create_table", "params": {"table": "games", "columns": {"id": 0, "player": 1, "score": 0}}}\n{"id": 3, "method": "insert_row", "params": {"table": "games", "values": [1, "Alice", 100]}}\n{"id": 4, "method": "get_rows", "params": {"table": "games"}}\n' | python query_server.py
```

Real output:

```text
{"id": 1, "result": {"ok": true}}
{"id": 2, "result": {"ok": true}}
{"id": 3, "result": {"ok": true}}
{"id": 4, "result": {"columns": ["id", "player", "score"], "rows": [["1", "'Alice'", "100"]]}}
```

### The New Code — `src/main.ts` / `src/preload.ts`

```typescript
ipcMain.handle(
  "create-table",
  async (_event, table: string, columns: Record<string, number>): Promise<void> => {
    const client = await getDbClient();
    await client.request("create_table", { table, columns });
  }
);

ipcMain.handle(
  "insert-row",
  async (_event, table: string, values: string[]): Promise<void> => {
    const client = await getDbClient();
    await client.request("insert_row", { table, values });
  }
);
```

```typescript
contextBridge.exposeInMainWorld("pocketStudio", {
  // ... ping, listTables, getRows, runQuery, unchanged ...
  createTable: (table: string, columns: Record<string, number>): Promise<void> =>
    ipcRenderer.invoke("create-table", table, columns),
  insertRow: (table: string, values: string[]): Promise<void> =>
    ipcRenderer.invoke("insert-row", table, values),
});
```

### The New Code — `src/App.tsx`, the Create Table Form

```typescript
const INTEGER = 0;
const TEXT = 1;

function parseColumnsSpec(spec: string): Record<string, number> {
  const columns: Record<string, number> = {};
  for (const part of spec.split(",")) {
    const [name, type] = part.split(":").map((piece) => piece.trim());
    columns[name] = type.toUpperCase() === "TEXT" ? TEXT : INTEGER;
  }
  return columns;
}
```

```typescript
  const [newTableName, setNewTableName] = useState("");
  const [newTableColumns, setNewTableColumns] = useState("");

  async function createTable() {
    const columns = parseColumnsSpec(newTableColumns);
    await api.createTable(newTableName, columns);
    const result = await api.listTables();
    setTables(result);
    setNewTableName("");
    setNewTableColumns("");
  }
```

```typescript
      <h3>Create Table</h3>
      <input
        type="text"
        value={newTableName}
        onChange={(event) => setNewTableName(event.target.value)}
        placeholder="table name"
      />
      <input
        type="text"
        value={newTableColumns}
        onChange={(event) => setNewTableColumns(event.target.value)}
        placeholder="id:INTEGER,player:TEXT,score:INTEGER"
        size={40}
      />
      <button onClick={createTable}>Create</button>
```

### Discard the Throwaway Example

```bash
rm test.pdb
```

Every real file change above is kept — permanent project code.

### Mechanical Walkthrough

- `conn._db.create_table(table, **columns)` — reappearing shape
  (`pocket-db`'s own real `**kwargs` API, its Lesson 11) — `columns`
  arrives as a real, plain dict from the real, parsed JSON request;
  `**columns` real-unpacks it into the identical real keyword
  arguments `pocketdb.py`'s own real `create_table` already expects.
- `parseColumnsSpec("id:INTEGER,player:TEXT,score:INTEGER")` — a real,
  small, hand-rolled parser — `"id:INTEGER"` splits on `":"` into a
  real name and a real type word; `INTEGER`/`TEXT` match `pocket-db`'s
  own real, established numeric codes (`0`/`1`) exactly.
- `createTable()` real-refetches the table list immediately after a
  successful real create — the real, new table appears in the real UI
  without a real, manual refresh.

### CS Lens

`parseColumnsSpec`'s own real, tiny grammar (`name:TYPE`, comma-
separated) is a genuinely smaller, real instance of the identical real
idea `pocket-db`'s own `where_parser.py` already used (its Lesson 22):
a real, deliberately minimal parser, honest about what it does and
doesn't handle, built only as large as the real, actual, felt need.

### SE Lens

Why does this lesson need *no* new, real `pocket-db` capability at
all, unlike S02/S05? Because `create_table`/`insert` were already,
genuinely complete, real, public API from `pocket-db`'s own very first
slice (its Lessons 1 and 11) — this lesson is real, direct proof that
a well-designed, real API doesn't need to anticipate every future,
real caller; it only needs to be genuinely, honestly complete for what
it already claims to do.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Proven together with this lesson's own second unit, next.

### Connection

A real table can now be created through the UI. Inserting a real row
into it — with real, dynamic inputs matching whatever real columns
that table actually has — is last.

---

## Concept Unit: As Many Real Inputs As There Are Real Columns

### The Problem

Insert forms are always real: `pocket-db`'s own `insert` takes as many
real values as a table has real columns — a fixed, hardcoded set of
input fields would only ever work for one, particular, real table
shape.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/App.tsx` (modified — the real "Insert Row"
  form).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit; Lesson 4's own real
  `rows.columns`.

### The New Code — `src/App.tsx`

```typescript
  const [insertValues, setInsertValues] = useState<string[]>([]);

  useEffect(() => {
    setInsertValues(rows.columns.map(() => ""));
  }, [rows.columns]);

  async function insertRow() {
    if (selectedTable === null) {
      return;
    }
    await api.insertRow(selectedTable, insertValues);
    const result = await api.getRows(selectedTable);
    setRows(result);
    setInsertValues(rows.columns.map(() => ""));
  }
```

```typescript
          <h3>Insert Row</h3>
          {rows.columns.map((column, index) => (
            <input
              key={column}
              placeholder={column}
              value={insertValues[index] ?? ""}
              onChange={(event) => {
                const next = [...insertValues];
                next[index] = event.target.value;
                setInsertValues(next);
              }}
            />
          ))}
          <button onClick={insertRow}>Insert</button>
```

Real, end-to-end proof — create a real table, select it, insert a real
row, all through the actual, running window:

```text
AFTER_INSERT: <div>...<h2>games</h2><table ...><thead><tr><th>id</th><th>player</th><th>score</th></tr></thead><tbody><tr><td>1</td><td>Alice</td><td>100</td></tr></tbody></table><h3>Insert Row</h3><input placeholder="id" value=""><input placeholder="player" value=""><input placeholder="score" value=""><button>Insert</button>...</div>
```

The real, actual point — reopened in a completely separate process,
with no live window at all:

```bash
printf '{"id": 1, "method": "open", "params": {"path": "games.pdb"}}\n{"id": 2, "method": "get_rows", "params": {"table": "games"}}\n' | python query_server.py
```

Real output:

```text
{"id": 1, "result": {"ok": true}}
{"id": 2, "result": {"columns": ["id", "player", "score"], "rows": [["1", "'Alice'", "100"]]}}
```

### Discard the Throwaway Example

```bash
rm games.pdb
```

Every real file change above is kept — permanent project code.

### Mechanical Walkthrough

- `useEffect(() => { setInsertValues(rows.columns.map(() => "")); },
  [rows.columns]);` — reappearing shape (Lesson 4's own dependency-
  array pattern) — every real time a *different* table's own real
  columns arrive, the real form resets to the correct real number of
  real, empty inputs — a 5-column table's own insert form never keeps
  3 real, stale inputs from whatever table was selected before.
- `const next = [...insertValues]; next[index] = event.target.value;
  setInsertValues(next);` — covered fully in Objects and methods
  used, above (Terms) — real, deliberate, never `insertValues[index] =
  ...` directly.
- `insertValues[index] ?? ""` — the real, standard **nullish
  coalescing** operator — real-guards against `insertValues[index]`
  being real, `undefined` for one, brief render (the real gap between
  a table being selected and its own real columns actually arriving).

### CS Lens

React deciding whether to real, actually re-render by comparing
*references*, not real, deep content, is the identical real reason
`useState`'s own setter needs a real, brand-new array or object every
real time something changes — a real, direct mutation
(`insertValues[index] = x`) leaves the array's own real, memory
address completely unchanged, so React has real, no way to know
anything happened at all.

### SE Lens

Why does `insertRow()` real-refetch `getRows` immediately after a
successful real insert, rather than real, optimistically appending
the new real row to `rows` directly in JavaScript? Because the real,
displayed grid should always reflect what `pocket-db` itself actually,
genuinely stored — this lesson's own real proof (a completely separate
process reopening the file) is the entire, real point: real, local
optimism could drift from real, actual, persisted truth in ways this
project has no real way to detect yet (S07's own real, upcoming
subject touches this directly).

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

S06 is complete: a real table, created through the UI, holding a real
row, inserted through the UI, both genuinely, permanently persisted —
provable by a completely separate process, with no live window at all,
reading the exact same real bytes back. S07, next, is where this
project finally, honestly handles what happens when a real query
fails, or a real fetch is still in flight — real gaps this lesson's own
SE Lens already, deliberately left open.

---

## Closing

### Connect the Pieces

This lesson's first unit added `create_table`/`insert_row` to
`query_server.py`, needing zero new, real `pocket-db` capability —
genuine proof that `create_table`/`insert` (its own Lessons 1, 11)
were already, honestly complete — and built a real "Create Table" form
around a real, small, hand-rolled `parseColumnsSpec` parser. The
second built a real, *dynamic* "Insert Row" form — as many real, live
inputs as the selected table actually has real columns, reset
correctly via a real, dependency-array-driven `useEffect` whenever a
different table is selected, updated through React's own real,
required immutable-array pattern — and proved the entire, real chain:
create a table, insert a row, both through the actual window, both
genuinely surviving a completely separate process reopening the exact
same real file.

### What Breaks Without This

In the `onChange` handler for an "Insert Row" input, change `const
next = [...insertValues]; next[index] = event.target.value;
setInsertValues(next);` to a real, direct mutation:
`insertValues[index] = event.target.value; setInsertValues
(insertValues);`, rebuild, and try typing into any real insert-row
field in the running app. Real, nothing visibly happens — the real
input never appears to update at all, because `setInsertValues` is
real-called with the *identical* real array reference it already had;
React real-sees no reason to re-render. Restore the real, spread-based
update and confirm real typing works again.

### Exercises

- `parseColumnsSpec` currently has no real, deliberate handling for a
  malformed spec (a missing `":"`, an empty part). Deliberately break
  it, observe the real, actual failure, and decide — referencing
  Lesson 5's own SE Lens on deferred error handling — whether this is
  an honest gap worth fixing now or in S07.
- Add a real "Delete last row" button. Explain, referencing
  `pocket-db`'s own real, established feature set (`README.md`'s own
  slice plan), why this real feature cannot actually be built yet —
  and what real, underlying capability `pocket-db` itself would need
  first.
- The "Create Table" form's own two, real inputs (`newTableName`,
  `newTableColumns`) don't reuse the `[...array]` pattern this lesson's
  own second unit introduced. Explain why they don't need to,
  referencing this lesson's own CS Lens on reference-based state
  comparison.

### Definition of Done

- [ ] `query_server.py`'s `create_table`/`insert_row`, and the
      matching real IPC plumbing, all exist as real, permanent code.
- [ ] Creating a real table and inserting a real row through the
      actual, running window both work correctly.
- [ ] You reopened the real `.pdb` file in a completely separate
      process (no live window) and confirmed the real, inserted row
      was actually, permanently there.
- [ ] You caused the real "direct array mutation" failure yourself and
      confirmed restoring the spread-based update fixes it.
- [ ] You can explain, from memory, why React compares state by
      reference, not content — referencing this lesson's own CS Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add real forms: create a table, insert a row"`.
