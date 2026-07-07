# TypeScript Spreadsheet — Lesson 14 — Recalculation Performance

## What You Will Build

A visible counter in the debug panel — "Total Formula Computations" —
that currently climbs rapidly every time any cell is merely *selected*,
because selecting a cell re-parses and re-evaluates every formula it
depends on, from scratch, every single time. This lesson adds a cache, so
a formula is only actually recomputed when something it depends on has
genuinely changed — and the counter, watched live, is the proof.

---

## What You Need to Know First

Lesson 13 left `lookupCellValue` recursively parsing and evaluating any
formula it encounters, every time it is called, with no memory of
anything it computed a moment ago.

---

## Concept: Measuring Before Fixing

Build a chain first, to make the problem real rather than assumed: put a
plain number in A1, then `=A1+1` in B1, `=B1+1` in C1, up through several
more cells each referencing the one before. Select the last cell in the
chain repeatedly. Every single selection re-evaluates *every* cell in the
entire chain, from the beginning, even though none of them changed
between selections. For a chain this short, that waste is not something
you can feel — but the *shape* of the waste is real, and grows directly
with how deep formulas chain together, exactly the kind of cost this
lesson makes visible before fixing.

---

## Step 1 — Count Every Real Computation

**The problem:** There is currently no way to see how much redundant work
is actually happening.

Add to `script.ts`:

```typescript
let cellComputeCount = 0;
```

Update `computeCellValue` — a new function, extracted from the body of
`lookupCellValue`, isolating "how to actually compute a cell's value"
from "how to avoid recomputing it unnecessarily," which Step 2 adds:

```typescript
function computeCellValue(name: CellId, evaluationStack: Set<CellId>): EvaluationResult {
  cellComputeCount++;

  const referencedCell = cells[name];
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

      return evaluate(parseResult.ast, (referencedName) => lookupCellValue(referencedName, nextStack));
    }
    default:
      return assertNever(referencedCell);
  }
}

function lookupCellValue(name: CellId, evaluationStack: Set<CellId>): EvaluationResult {
  if (evaluationStack.has(name)) {
    const chain = [...evaluationStack, name].join(' → ');
    return fail(`Circular reference: ${chain}`);
  }

  return computeCellValue(name, evaluationStack);
}
```

Add to the HTML tab's debug panel:

```html
<h3>Debug: Total Formula Computations</h3>
<pre id="debug-compute-count">0</pre>
```

Update `updateDebugPanel` in `script.ts` to refresh it every time:

```typescript
requireElement('debug-compute-count').textContent = cellComputeCount.toString();
```

Click **▶ Preview**, build the chain described above, and select its last
cell a few times in a row. Watch the counter — it climbs by the entire
chain's length on every single selection, even though nothing changed.

**Walkthrough — splitting `lookupCellValue` in two.** `computeCellValue`
now does exactly one job: given a cell name, figure out its value,
however that requires. `lookupCellValue` does a different job: decide
*whether* `computeCellValue` actually needs to run at all — right now, it
always does, since Step 1 has not added caching yet, but the split
itself is what makes Step 2 possible without tangling "check the cache"
and "do the real work" into one function.

---

## Step 2 — Cache Results, Invalidate on Change

**The problem:** Nothing remembers a cell's last computed value, so
nothing can ever skip recomputing it.

Add to `script.ts`:

```typescript
const valueCache = new Map<CellId, EvaluationResult>();

function invalidateCache(id: CellId): void {
  valueCache.delete(id);
  for (const dependentId of findAllDependents(id)) {
    valueCache.delete(dependentId);
  }
}
```

Update `lookupCellValue` in `script.ts` to check the cache first:

```typescript
function lookupCellValue(name: CellId, evaluationStack: Set<CellId>): EvaluationResult {
  if (evaluationStack.has(name)) {
    const chain = [...evaluationStack, name].join(' → ');
    return fail(`Circular reference: ${chain}`);
  }

  const cached = valueCache.get(name);
  if (cached) {
    return cached;
  }

  const result = computeCellValue(name, evaluationStack);
  valueCache.set(name, result);
  return result;
}
```

Update `commitEdit` in `script.ts` to invalidate the right cells the
moment something actually changes:

```typescript
function commitEdit(coordinate: Coordinate, rawInput: string): void {
  const id = cellId(coordinate);
  cells[id] = parseRawInput(rawInput);
  updateDependencies(coordinate, cells[id]);
  invalidateCache(id);
  editingCoordinate = null;
  renderCell(coordinate);

  for (const dependentId of findAllDependents(id)) {
    renderCell(parseCellName(dependentId));
  }

  updateDebugPanel(coordinate);
}
```

Click **▶ Preview**, rebuild the same chain, and select its last cell
repeatedly again. The counter now climbs *once* per cell, the first time
each one is ever computed — then stops climbing entirely on repeated
selections of the same, unchanged chain. Edit a cell partway up the
chain: the counter climbs again, but only for that cell and whatever
depends on it — cells *before* it in the chain are untouched.

**Walkthrough — `valueCache`, and why checking it comes before computing
anything.** `lookupCellValue` now checks `valueCache.get(name)` *before*
calling `computeCellValue` at all — if a value is already there, it is
returned immediately, and none of the tokenizing, parsing, or recursive
evaluation inside `computeCellValue` ever runs a second time for that
cell. This is **memoization**: remembering the result of a computation,
keyed by its input, so identical work is never repeated.

**Walkthrough — `invalidateCache`, reusing lesson 11's graph correctly.**
When a cell changes, its own cached value is obviously stale — but so is
every cell that depends on it, directly or transitively, since their
cached values were computed *using* the old one. `findAllDependents`,
built in lesson 11 for a completely different purpose (deciding what to
*redraw*), turns out to answer the exact same question needed here:
"what else is affected by this change?" One function, reused for a
second real purpose it was never specifically written for — the same
payoff `nextVideoId` delivered twice in this project's sibling series.

**SE lens — why invalidation clears the cache instead of eagerly
recomputing it.** `invalidateCache` only *deletes* entries — it does not
immediately recompute anything. The next time each affected cell's value
is actually needed (when `renderCell` calls `displayCell`, moments
later), `lookupCellValue` finds nothing cached and computes fresh,
caching the new result then. This is **lazy** recalculation: work happens
only when a value is actually requested, never speculatively ahead of
time — a real, common trade-off between "always instantly ready" and
"never compute anything nobody asked for yet."

---

## Connect the Pieces

```
script.ts    cellComputeCount — a visible proof this lesson's fix
             actually does something, not just a claim
             computeCellValue() — the real work; lookupCellValue() — the
             cache check wrapping it
             valueCache: Map<CellId, EvaluationResult> — memoized results,
             invalidated (not recomputed) the moment a real change happens
```

---

## What Breaks Without This

**Removing the dependents loop from `invalidateCache`, only deleting the
edited cell's own entry:** Build the A1→B1→C1 chain, select C1 once to
populate the cache, then change A1. C1 still shows its *old* value — its
cache entry was never cleared, even though the value it was computed from
changed — until some unrelated edit happens to touch C1's own cache entry
directly.

**Caching a value before checking whether it should exist at all (moving
`cellComputeCount++` after the cache check instead of inside
`computeCellValue`):** The counter would then only count cache *misses*
that happen to also be genuinely new computations, which is what it
already does correctly — this is worth trying deliberately to confirm the
counter is measuring the right thing, not just trusting that it is.

---

## Definition of Done

- [ ] The debug panel shows a running total of real formula computations
- [ ] Repeatedly selecting the same, unchanged cell does not increase the counter
- [ ] Editing a cell partway up a dependency chain only recomputes it and its dependents, not cells before it
- [ ] You can explain what memoization is, using `valueCache` as the example
- [ ] You can explain why invalidation deletes cache entries instead of recomputing them immediately
- [ ] You can explain why `findAllDependents`, built in lesson 11 for redrawing cells, is exactly the right function for deciding what to invalidate too

---

*Next: Lesson 15 — Number Formatting. A cell can now display as currency
or a percentage without changing the actual number stored inside it —
the first feature since lesson 09 that touches only how a value is
shown, never what it computes to.*
