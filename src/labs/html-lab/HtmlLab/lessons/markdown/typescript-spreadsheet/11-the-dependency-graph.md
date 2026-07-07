# TypeScript Spreadsheet — Lesson 11 — The Dependency Graph

## What You Will Build

Put `5` in A1 and `=A1+1` in B1: B1 shows `6`, as it already could. Now
change A1 to `10` — and, for the first time, B1 updates to `11`
*automatically*, with no need to reopen and re-commit it yourself. This
lesson has a name for the structure that makes this possible: a
**dependency graph**, tracking which cells depend on which, so changing
one cell can correctly find and refresh every other cell affected by it,
however far the effect actually reaches.

---

## What You Need to Know First

Lesson 10 left every formula re-parsed and re-evaluated fresh, on demand,
each time it needs to be displayed — correct, but only for the *one* cell
being displayed. Nothing yet tracks which cells' *displayed text* needs
refreshing when some other cell changes.

---

## Concept: The Gap, Named Precisely

`lookupCellValue` (lesson 09) already *reads* other cells correctly,
recursively, whenever a formula needs their values — that part of this
project has been correct since lesson 09. The actual gap is different: 
when A1's own stored value changes, nothing tells B1 to redraw itself at
all. B1's cell in the DOM still shows whatever text `renderCell` last put
there — stale, until something else happens to call `renderCell(B1)`
again, for an unrelated reason. A dependency graph closes this gap by
answering one specific question fast: "given that this cell just changed,
exactly which other cells need to be told to redraw?"

---

## Step 1 — Extract a Formula's Dependencies

**The problem:** Nothing yet reads an `ExpressionNode` and lists every
cell it actually references.

Add to `script.ts`:

```typescript
function extractDependencies(node: ExpressionNode): CellId[] {
  switch (node.kind) {
    case 'Number':
      return [];
    case 'CellReference':
      return [node.name];
    case 'Range':
      return expandRange(node.from, node.to);
    case 'UnaryExpression':
      return extractDependencies(node.operand);
    case 'BinaryExpression':
      return [...extractDependencies(node.left), ...extractDependencies(node.right)];
    case 'FunctionCall':
      return node.args.flatMap(extractDependencies);
    default:
      return assertNever(node);
  }
}

function getFormulaDependencies(expr: string): CellId[] {
  const parseResult = parse(tokenize(expr));
  if (parseResult.success === false) {
    return [];
  }
  return extractDependencies(parseResult.ast);
}
```

**Walkthrough — a tree walk that collects instead of computing.** This
looks like `evaluate`'s own `switch` — the same six cases, the same
recursive shape — but its job is entirely different: instead of reducing
the tree down to one number, it collects *every cell name mentioned
anywhere in it* into a flat list. `Range` contributes every individual
cell it expands to, via lesson 10's own `expandRange` — a range's
dependencies are exactly the cells it would actually read from, not the
two names written at its edges. `BinaryExpression` concatenates its left
and right subtrees' dependencies with `[...left, ...right]` — the spread
operator's fourth distinct job in this project so far, this time
combining two separate arrays into one.

`getFormulaDependencies` wraps the whole tokenize-then-parse-then-extract
pipeline into one function, returning an empty list for a formula that
fails to parse at all — a formula with a syntax error has no reliable
dependencies to speak of, and an empty list is the honest answer.

---

## Step 2 — Track Dependencies in Both Directions

**The problem:** Knowing what *one* formula depends on is not the same as
knowing, given *any* cell, everything that depends on *it* — which is the
direction that actually matters when a cell changes.

Add to `script.ts`:

```typescript
const dependencies = new Map<CellId, CellId[]>();
const dependents = new Map<CellId, Set<CellId>>();

function addDependent(dependency: CellId, dependent: CellId): void {
  const existingSet = dependents.get(dependency);
  if (existingSet) {
    existingSet.add(dependent);
  } else {
    dependents.set(dependency, new Set([dependent]));
  }
}

function updateDependencies(coordinate: Coordinate, cell: Cell): void {
  const id = cellId(coordinate);

  const oldDependencies = dependencies.get(id) ?? [];
  for (const oldDependency of oldDependencies) {
    dependents.get(oldDependency)?.delete(id);
  }

  const newDependencies = cell.kind === 'formula' ? getFormulaDependencies(cell.expr) : [];
  dependencies.set(id, newDependencies);

  for (const newDependency of newDependencies) {
    addDependent(newDependency, id);
  }
}
```

**Walkthrough — `Map`, used here for the first time in this project.**
Every lookup table so far — `cells`, `SPREADSHEET_FUNCTIONS` — has been a
plain `Record<K, V>`. `dependencies` and `dependents` use `Map` instead,
for a concrete reason: a `Map` has real methods — `.get()`, `.set()`,
`.has()`, `.delete()` — for exactly the operations this lesson needs
(checking whether a key exists yet, removing one cleanly), where a plain
`Record` would need slightly awkward workarounds for the same operations.
`new Map<CellId, Set<CellId>>()` declares its key and value types the
same way `Record`'s two type parameters do.

**Walkthrough — `Set`, also used here for the first time.** `dependents`
maps a cell to a **`Set`** of the cells that depend on it, not an array.
A `Set` automatically refuses duplicate values — adding a cell id that is
already present has no effect — which is exactly the guarantee needed
here: if a formula somehow referenced the same cell twice, that cell
should still only be told to redraw *once* when a dependency changes, not
once per mention.

**Walkthrough — `addDependent`, and why it checks before creating a
`Set`.** `dependents.get(dependency)` returns `undefined` the first time
any cell ever depends on `dependency` — there is no `Set` to add to yet.
`addDependent` checks for this explicitly and creates a brand-new `Set`
(seeded with the one dependent it already knows about) exactly when
needed, rather than assuming one already exists.

**Walkthrough — `updateDependencies`, cleaning up before rebuilding.**
Before recording a cell's *new* dependencies, this function first removes
its *old* ones: `dependencies.get(id)` recalls whatever this cell
depended on the last time it was set, and each of those relationships is
explicitly deleted from `dependents` before anything new is added. Without
this cleanup, changing a formula from `=A1+B1` to `=C1` would leave a
stale, invisible edge saying this cell still depends on `A1` and `B1`
long after it stopped referencing either one — a real, if quiet, source
of bugs where a cell keeps "reacting" to changes it no longer actually
cares about.

---

## Step 3 — Propagate a Change

**The problem:** Nothing yet asks "given that this cell changed, which
other cells need to redraw?" and actually acts on the answer.

Add to `script.ts`:

```typescript
function findAllDependents(id: CellId): CellId[] {
  const visited = new Set<CellId>();
  const queue: CellId[] = [id];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      continue;
    }

    const directDependents = dependents.get(current);
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
```

Update `commitEdit` in `script.ts`:

```typescript
function commitEdit(coordinate: Coordinate, rawInput: string): void {
  const id = cellId(coordinate);
  cells[id] = parseRawInput(rawInput);
  updateDependencies(coordinate, cells[id]);
  editingCoordinate = null;
  renderCell(coordinate);

  for (const dependentId of findAllDependents(id)) {
    renderCell(parseCellName(dependentId));
  }

  updateDebugPanel(coordinate);
}
```

Click **▶ Preview**. Put `5` in A1, `=A1+1` in B1 (shows `6`), `=B1+1` in
C1 (shows `7`). Change A1 to `10`: B1 updates to `11` and C1 updates to
`12`, automatically, with no need to touch either one yourself.

**Walkthrough — `findAllDependents`, a real breadth-first search.**
`queue` starts holding just the one cell that changed. `queue.shift()`
removes and returns the *front* of the queue — the standard behaviour of
a **queue**, first in, first out. For each direct dependent of the
current cell, `findAllDependents` adds it to `visited` and pushes it onto
the *back* of the queue, so it will be processed in its own turn later —
finding *its* dependents, and so on, spreading outward one layer at a
time until nothing new is left to explore. `visited` prevents processing
the same cell twice, which matters the moment two different cells both
depend on some common third cell further down the chain.

**CS lens — naming this precisely.** This is a real, general graph
algorithm — **breadth-first search (BFS)** — applied here to a very small,
concrete graph: cells are nodes, "depends on" relationships are edges.
The same algorithm, unchanged in shape, is how a real search engine
crawls linked pages, how a router finds the shortest path across a
network, and how a social network suggests "people you may know" a few
connections away. Recognising this shape here means recognising it
everywhere else it appears too.

**Walkthrough — why `commitEdit` re-renders the edited cell *before*
walking its dependents.** The cell that was just typed into needs to show
its own new value regardless of anything else; its dependents' correct
values *depend on* that new value already being in `cells`, which is true
the instant `cells[id] = parseRawInput(rawInput)` runs, well before any
dependent is re-rendered.

---

## Step 4 — Show Dependents in the Debug Panel

**The problem:** The dependency graph now exists, but nothing about it is
visible.

Update the HTML tab's debug panel:

```html
<h3>Debug: Dependents</h3>
<pre id="debug-dependents">(select a cell)</pre>
```

Update `updateDebugPanel` in `script.ts` to fill it in, for *any*
selected cell, not just formula ones:

```typescript
const dependentsOutput = requireElement('debug-dependents');
const dependentsList = coordinate ? findAllDependents(cellId(coordinate)) : [];
dependentsOutput.textContent = dependentsList.length > 0
  ? dependentsList.join(', ')
  : '(nothing depends on this cell)';
```

(Add this near the top of `updateDebugPanel`, before the existing
`if (!cell || cell.kind !== 'formula')` check, since a plain number cell
can still have dependents even though it has no formula of its own.)

---

## Connect the Pieces

```
script.ts    dependencies: Map<CellId, CellId[]> — what each cell
             currently depends on, tracked so old edges can be removed
             dependents: Map<CellId, Set<CellId>> — the reverse direction,
             used to answer "what needs to redraw?"
             extractDependencies(), findAllDependents() — a tree walk and
             a graph search, doing two different, complementary jobs
```

---

## What Breaks Without This

**Removing the old-dependency cleanup from `updateDependencies` (skip the
`for (const oldDependency of oldDependencies)` loop):** Put `=A1` in B1,
confirm B1 tracks A1 correctly, then change B1 to `=C1` instead. B1 now
correctly depends on C1 — but `dependents.get('A1')` still, incorrectly,
contains B1. Change A1's value: B1 re-renders anyway, showing the exact
same (now unrelated) value it already had, for a dependency that no
longer actually exists in the formula.

**Removing the `visited` check inside `findAllDependents`'s inner loop:**
Build a chain where two different cells both depend on the same third
cell, all depending (directly or indirectly) on a common ancestor.
Without deduplication, that shared cell could be queued and processed
more than once — harmless for a small chain, but real, wasted, repeated
work that grows with how tangled the dependency graph actually is.

---

## Definition of Done

- [ ] Changing a cell automatically updates every formula that depends on it, directly or indirectly, with no manual re-commit needed
- [ ] Changing a formula from referencing one cell to referencing a different one correctly drops the old dependency
- [ ] The debug panel shows every cell that currently depends on whichever cell is selected
- [ ] You can explain the difference between `dependencies` and `dependents`, and why both are needed
- [ ] You can name the graph algorithm `findAllDependents` implements, and describe one real system outside this project that uses the same one
- [ ] You can explain why old dependency edges must be removed before new ones are added, using the `=A1` → `=C1` example

---

*Next: Lesson 12 — Circular References. `=A1` inside `A1` itself was
already known, back in lesson 09, to freeze the page. This lesson uses
the exact structure just built to detect that situation and refuse it
cleanly instead.*
