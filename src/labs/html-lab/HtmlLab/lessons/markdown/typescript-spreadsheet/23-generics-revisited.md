# TypeScript Spreadsheet — Lesson 23 (Optional) — Generics, Revisited

## What You Will Build

Nothing new appears on screen, one final time. `EvaluationResult` and
`NumberListResult` — two separate types, noticed as nearly identical back
in lesson 13 — become one type, written once, parameterized by whatever
it needs to hold. The `Record<CellId, T>` shape this project has reached
for repeatedly since lesson 03 — for cells, for formats, for styles —
becomes a real, reusable `Grid<T>`. This is the moment generics stop
being "the thing `Record` happens to use internally" and become a tool
you write yourself.

---

## What You Need to Know First

Lesson 22 left `Spreadsheet` holding `cells`, `cellFormats`, and
`cellStyles` as three separately-typed `Record`s, and lesson 13 left
`EvaluationResult` and `NumberListResult` as two structurally identical,
separately-declared types.

---

## Step 1 — One Result Type, Not Two

**The problem:** `EvaluationResult` and `NumberListResult` differ in
exactly one place — what a success actually holds — and are otherwise
the same type, written twice.

Add to `types.ts`:

```typescript
type Result<T> =
  | { kind: 'success'; value: T }
  | { kind: 'error'; message: string };
```

Replace `EvaluationResult` and `NumberListResult` everywhere they appear
in `types.ts` and `evaluator.ts`:

```typescript
type EvaluationResult = Result<number>;
type NumberListResult = Result<number[]>;
```

Update `ok` and `fail` in `evaluator.ts`:

```typescript
function ok<T>(value: T): Result<T> {
  return { kind: 'success', value };
}

function fail<T>(message: string): Result<T> {
  return { kind: 'error', message };
}
```

**Walkthrough — `<T>`, a type parameter, the same idea `Record<K, V>` has
used since lesson 03, now written by this project itself for the first
time.** `Result<T>` does not commit to any particular type for its
success case until it is actually used — `Result<number>` and
`Result<number[]>` are both real, specific types, each produced by
"filling in" `Result`'s one parameter differently. This is exactly what
`Record<K, V>` was already doing the whole time; this project simply
never had to *write* a generic type itself before, only ever *use* ones
TypeScript already provided.

**Walkthrough — `ok<T>` and `fail<T>`, generic functions.** `function
ok<T>(value: T): Result<T>` says: whatever type `value` actually is, the
function returns a `Result` of *that same type* — calling `ok(5)`
produces a `Result<number>`; calling `ok([1, 2, 3])` produces a
`Result<number[]>`, with no need to write two separate functions, or to
tell TypeScript explicitly which one you meant. `T` is inferred
automatically from whatever argument is actually passed in.

Click **▶ Preview** — every formula still evaluates identically. This
step changes nothing about what the code does, only how much of it needed
to be written to say so.

---

## Step 2 — A Real, Reusable `Grid<T>`

**The problem:** `Record<CellId, Cell>`, `Record<CellId, CellFormat>`,
and `Record<CellId, CellStyle>` all describe the exact same shape — a
lookup table keyed by cell id — for three unrelated kinds of value, with
no shared name tying that repeated idea together.

Add to `types.ts`:

```typescript
class Grid<T> {
  private data: Record<CellId, T> = {};

  get(id: CellId): T | undefined {
    return this.data[id];
  }

  set(id: CellId, value: T): void {
    this.data[id] = value;
  }

  has(id: CellId): boolean {
    return id in this.data;
  }

  keys(): CellId[] {
    return Object.keys(this.data);
  }
}
```

Update `Spreadsheet` in `spreadsheet.ts` to use it:

```typescript
class Spreadsheet {
  private cells = new Grid<Cell>();
  private cellFormats = new Grid<CellFormat>();
  private cellStyles = new Grid<CellStyle>();
  // ...dependencies, dependents, valueCache unchanged

  getCell(id: CellId): Cell | undefined {
    return this.cells.get(id);
  }

  getFormat(id: CellId): CellFormat {
    return this.cellFormats.get(id) ?? 'plain';
  }

  getStyle(id: CellId): CellStyle {
    return this.cellStyles.get(id) ?? { bold: false, italic: false };
  }

  setCell(coordinate: Coordinate, cell: Cell): void {
    const id = cellId(coordinate);
    this.cells.set(id, cell);
    this.updateDependencies(coordinate, cell);
    this.invalidateCache(id);
  }

  setFormat(id: CellId, format: CellFormat): void {
    this.cellFormats.set(id, format);
  }

  setStyle(id: CellId, updates: Partial<CellStyle>): void {
    this.cellStyles.set(id, { ...this.getStyle(id), ...updates });
  }
}
```

Every other method referencing `this.cells[name]` directly (inside
`computeCellValue`, for instance) updates the same way: `this.cells.get
(name)` in place of the old direct property access.

Click **▶ Preview** one final time. Every feature — selection, editing,
formulas, formatting, styling, undo, persistence, CSV export — behaves
exactly as it did at the end of lesson 22.

**Walkthrough — one class, three genuinely different uses, each fully
type-checked.** `new Grid<Cell>()`, `new Grid<CellFormat>()`, and `new
Grid<CellStyle>()` are three separate instances of the *same* class,
each specialised to a different type the moment it is constructed.
`this.cells.get(id)` is known by TypeScript to return `Cell | undefined`
specifically, `this.cellFormats.get(id)` returns `CellFormat |
undefined` — the *same* `get` method, on the *same* class, correctly
narrowed differently depending on which instance it is called on. This
is the entire value generics exist to provide: write the lookup-table
logic exactly once, and let TypeScript keep every use of it fully,
independently type-safe.

**Walkthrough — `id in this.data`, a new way to check for a key.**
`has` uses the `in` operator — `id in this.data` is `true` exactly when
`this.data` has a property with that exact key, regardless of what value
it holds (even `false` or `0`, values `if (this.data[id])` would
incorrectly treat as "missing"). `Grid` did not strictly need a `has`
method for anything this project currently does — it is included as a
complete, small, reusable piece of infrastructure, the kind of extra
completeness worth adding to something meant to be reused, even beyond
today's exact requirements.

---

## Connect the Pieces

```
types.ts         Result<T> — one generic type, replacing two
                 near-duplicate ones from lesson 13
                 Grid<T> — one generic class, replacing three separate
                 Record<CellId, ...> declarations with one reusable shape
evaluator.ts     ok<T>(), fail<T>() — generic functions, inferring T
                 from whatever value is actually passed to them
spreadsheet.ts   Spreadsheet — now built from three instances of the
                 same Grid<T> class instead of three separate Records
```

---

## What Breaks Without This

**This lesson, like lesson 22, is a pure refactor.** The real cost of
*not* doing it is what lesson 13 already named directly: `Result<number>`
and `Result<number[]>`, kept as two independently-maintained types
instead of one generic one, risk drifting apart the moment either one
needs a change the other should logically share too — a fix to how
`kind: 'error'` works in one would need to be remembered and reapplied to
the other by hand, with nothing structural connecting them.

---

## Definition of Done

- [ ] `EvaluationResult` and `NumberListResult` are both defined as `Result<...>` with a specific type argument, not two independent declarations
- [ ] `Spreadsheet` stores its three lookup tables using `Grid<T>`, not three separate `Record` declarations
- [ ] Every feature from lesson 22 still behaves identically
- [ ] You can explain what a type parameter is, using `Grid<T>`'s three different instantiations as the example
- [ ] You can explain why `ok<T>` and `fail<T>` do not need their caller to specify `T` explicitly

---

## This Project Is Complete

Twenty-three lessons ago, this was a grid of sixty empty, unaddressable
`<td>` elements. It now parses and evaluates a real formula language it
tokenizes and parses by hand — arithmetic, cell references, ranges, and
five built-in functions — recalculates automatically through a real
dependency graph, catches circular references before they can freeze the
page, represents every failure as a real, typed value instead of a
crash, formats and styles cells independently of what they actually
store, undoes and redoes across its entire state at once, survives a
reload, and can leave this browser entirely as a real `.csv` file. Every
one of those features arrived because a real, plain-language spreadsheet
needed it — never because a lesson invented a reason to demonstrate a
TypeScript feature. The type system was reached for exactly where plain
JavaScript would have started to genuinely struggle: three shapes a cell
could honestly be, a tree that must never let a number pretend to be
text, a graph that must never lie about what it points to. That is not a
coincidence — it is what TypeScript, and this project, were both actually
for.
