# TypeScript Spreadsheet — Lesson 22 (Optional) — From Functions to a Class

## What You Will Build

Nothing new appears on screen. `cells`, `cellFormats`, `cellStyles`,
`dependencies`, `dependents`, and `valueCache` — six independent
top-level variables, each read and written by functions scattered across
`spreadsheet.ts` — become fields of one real `Spreadsheet` class. This is
the same refactor Video Notes' lesson 18 performed on its own scattered
`videos` array, applied here to a genuinely larger pile of interrelated
state, encountered for a second time in this curriculum specifically so
the pattern is recognised, not just remembered from one example.

---

## What You Need to Know First

By lesson 21, six separate top-level variables in `spreadsheet.ts` are
each modified by several different functions, with no single place
responsible for keeping them consistent with each other.

---

## Concept: Recognising the Same Repetition Twice

Video Notes' lesson 18 named the motivating pattern once: the same
lookup, written independently in several places, is exactly what a class
method exists to collapse into one. This project has a related but
distinct version of that same pressure: it is not one repeated lookup,
but *six pieces of state that always change together* — editing a cell
touches `cells`, `dependencies`, `dependents`, and `valueCache` all at
once, currently coordinated only by every caller remembering to call the
right functions in the right order. A class does not just deduplicate
code here — it gives those six variables a single, named home, and makes
"keeping them consistent" the class's own job, not every caller's.

---

## Step 1 — Define the Class Around Existing State

Add to `spreadsheet.ts`:

```typescript
class Spreadsheet {
  private cells: Record<CellId, Cell> = {};
  private cellFormats: Record<CellId, CellFormat> = {};
  private cellStyles: Record<CellId, CellStyle> = {};
  private dependencies = new Map<CellId, CellId[]>();
  private dependents = new Map<CellId, Set<CellId>>();
  private valueCache = new Map<CellId, EvaluationResult>();

  getCell(id: CellId): Cell | undefined {
    return this.cells[id];
  }

  getFormat(id: CellId): CellFormat {
    return this.cellFormats[id] ?? 'plain';
  }

  getStyle(id: CellId): CellStyle {
    return this.cellStyles[id] ?? { bold: false, italic: false };
  }
}
```

**Walkthrough — `private`, a new keyword protecting these fields.**
`private` means these six fields can only be read or written from
*inside* the class's own methods — code elsewhere, even in the same file,
cannot write `someSpreadsheet.cells['A1'] = ...` directly, only through
whatever methods the class chooses to expose, like `getCell`. This is a
real, compiler-enforced version of the informal discipline this project
already followed since lesson 04 — "`cells` is only ever mutated through
`commitEdit`" was a convention before; `private` makes violating it a
real, caught error instead of a rule a future change could simply forget.

---

## Step 2 — Move Dependency Tracking and Caching In

Add to the `Spreadsheet` class:

```typescript
private addDependent(dependency: CellId, dependent: CellId): void {
  const existingSet = this.dependents.get(dependency);
  if (existingSet) {
    existingSet.add(dependent);
  } else {
    this.dependents.set(dependency, new Set([dependent]));
  }
}

private updateDependencies(coordinate: Coordinate, cell: Cell): void {
  const id = cellId(coordinate);

  const oldDependencies = this.dependencies.get(id) ?? [];
  for (const oldDependency of oldDependencies) {
    this.dependents.get(oldDependency)?.delete(id);
  }

  const newDependencies = cell.kind === 'formula' ? getFormulaDependencies(cell.expr) : [];
  this.dependencies.set(id, newDependencies);

  for (const newDependency of newDependencies) {
    this.addDependent(newDependency, id);
  }
}

findAllDependents(id: CellId): CellId[] {
  const visited = new Set<CellId>();
  const queue: CellId[] = [id];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      continue;
    }
    const directDependents = this.dependents.get(current);
    if (!directDependents) {
      continue;
    }
    for (const dependent of directDependents) {
      if (!visited.has(dependent)) {
        visited.add(dependent);
        queue.push(dependent);
      }
    }
  }

  return Array.from(visited);
}

invalidateCache(id: CellId): void {
  this.valueCache.delete(id);
  for (const dependentId of this.findAllDependents(id)) {
    this.valueCache.delete(dependentId);
  }
}

lookupValue(name: CellId, evaluationStack: Set<CellId>): EvaluationResult {
  if (evaluationStack.has(name)) {
    const chain = [...evaluationStack, name].join(' → ');
    return fail(`Circular reference: ${chain}`);
  }

  const cached = this.valueCache.get(name);
  if (cached) {
    return cached;
  }

  const result = this.computeCellValue(name, evaluationStack);
  this.valueCache.set(name, result);
  return result;
}

private computeCellValue(name: CellId, evaluationStack: Set<CellId>): EvaluationResult {
  const referencedCell = this.cells[name];
  if (!referencedCell) {
    return ok(0);
  }

  switch (referencedCell.kind) {
    case 'number':
      return ok(referencedCell.value);
    case 'text':
      return ok(0);
    case 'formula': {
      const parseResult = parse(tokenize(referencedCell.expr));
      if (parseResult.success === false) {
        return fail(parseResult.error.message);
      }
      const nextStack = new Set(evaluationStack);
      nextStack.add(name);
      return evaluate(parseResult.ast, (referencedName) => this.lookupValue(referencedName, nextStack));
    }
    default:
      return assertNever(referencedCell);
  }
}

setCell(coordinate: Coordinate, cell: Cell): void {
  const id = cellId(coordinate);
  this.cells[id] = cell;
  this.updateDependencies(coordinate, cell);
  this.invalidateCache(id);
}

setFormat(id: CellId, format: CellFormat): void {
  this.cellFormats[id] = format;
}

setStyle(id: CellId, updates: Partial<CellStyle>): void {
  this.cellStyles[id] = { ...this.getStyle(id), ...updates };
}
```

Create one instance, replacing every one of the six top-level variables:

```typescript
const spreadsheet = new Spreadsheet();
```

**Walkthrough — `this`, reused from Video Notes lesson 18, now
threading through mutual recursion.** `computeCellValue`'s
`'formula'` case calls `evaluate(parseResult.ast, (referencedName) =>
this.lookupValue(referencedName, nextStack))` — an arrow function
capturing `this`, so that when `evaluate` later calls it, `this` still
correctly refers to *this specific* `Spreadsheet` instance, not something
ambiguous. Arrow functions do not have their own `this` at all; they
always use whatever `this` meant in the surrounding code at the moment
they were created — exactly what makes passing `this.lookupValue` around
as a plain callback safe here.

**SE lens — `setCell` as one atomic action, the same payoff as
`addVideo`.** Before this class existed, adding a cell required
remembering three separate steps, in the right order, at every call
site: assign into `cells`, call `updateDependencies`, call
`invalidateCache`. `setCell` now performs all three as one unit — no
caller can forget the second or third step, because there is no way to
do the first without going through this one method.

---

## Step 3 — Update Every Call Site

Replace every reference to the old top-level variables throughout
`spreadsheet.ts` with calls through `spreadsheet`. Three representative
examples. `commitEdit`:

```typescript
function commitEdit(coordinate: Coordinate, rawInput: string): void {
  recordHistory();
  const cell = parseRawInput(rawInput);
  spreadsheet.setCell(coordinate, cell);
  editingCoordinate = null;
  renderCell(coordinate);

  for (const dependentId of spreadsheet.findAllDependents(cellId(coordinate))) {
    renderCell(parseCellName(dependentId));
  }

  updateDebugPanel(coordinate);
}
```

`displayCell`'s formula case:

```typescript
const result = evaluate(parseResult.ast, (name) => spreadsheet.lookupValue(name, new Set([ownId])));
```

`renderCell`'s style application:

```typescript
const style = spreadsheet.getStyle(cellId(coordinate));
```

Click **▶ Preview**. Every feature behaves identically to before this
lesson.

---

## Connect the Pieces

```
spreadsheet.ts   Spreadsheet — one class owning cells, formats, styles,
                 the dependency graph, and the value cache together
                 spreadsheet — the one instance this project creates
                 Rendering, undo/redo, and persistence remain plain
                 functions, taking spreadsheet as the state they operate on
```

`takeSnapshot`, `restoreSnapshot`, `saveSpreadsheet`, and
`loadSpreadsheet` still need updating to read from `spreadsheet`'s public
methods instead of the old bare variables — the exact same mechanical
change applied throughout this step, left as a direct continuation of it
rather than repeated here line for line.

---

## What Breaks Without This

**This lesson is a pure refactor — there is no new user-facing failure
mode.** The real, ongoing cost of *not* doing it is the same one lesson
18 named in Video Notes: a seventh piece of related state, added by some
future feature, written as an independent top-level variable instead of
a class field, would have no structural reminder to keep it consistent
with the other six — exactly the kind of drift `private` fields and a
handful of methods exist to prevent by construction.

---

## Definition of Done

- [ ] Every feature from lesson 21 works identically after this refactor
- [ ] `cells`, `cellFormats`, `cellStyles`, `dependencies`, `dependents`, and `valueCache` no longer exist as bare top-level variables
- [ ] `setCell` is the only place a cell's value, dependencies, and cache entry are ever touched together
- [ ] You can explain what `private` prevents, and name one place in this project's own history where that discipline was previously only a convention
- [ ] You can explain why the arrow function passed to `evaluate` inside `computeCellValue` needs to be an arrow function specifically, not a plain `function`

---

*Next: Lesson 23 (optional) — Generics, Revisited. `EvaluationResult` and
`NumberListResult`, and this project's `Grid`-shaped storage, all share a
pattern generics exist specifically to express once instead of several
times.*
