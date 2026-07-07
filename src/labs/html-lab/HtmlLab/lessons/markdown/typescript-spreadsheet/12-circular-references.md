# TypeScript Spreadsheet — Lesson 12 — Circular References

## What You Will Build

Type `=B1` into A1, then `=A1` into B1. Instead of freezing the tab — the
real, verified failure named honestly back in lesson 09 — both cells show
a clear `#ERROR`. This lesson closes that gap with one specific technique:
tracking, during evaluation itself, which cells are *currently* being
evaluated, so a formula that tries to depend on itself — directly or
through a chain of others — is caught the moment it happens.

---

## What You Need to Know First

Lesson 11 left `dependents`/`dependencies` tracking which cells rely on
which, used to refresh displays automatically. `lookupCellValue` (lesson
09) still recursively re-evaluates any formula it encounters, with
nothing stopping that recursion from running forever.

---

## Concept: Detecting a Cycle During the Walk, Not Before It

The dependency graph from lesson 11 could, in principle, be searched
ahead of time for cycles before ever evaluating anything. This lesson
takes a simpler, equally correct approach: track which cells are
*currently being evaluated*, as a call chain, and check every new
reference against that chain *as evaluation happens*. If evaluating A1
requires evaluating B1, which requires evaluating A1 again — A1 already
appears in the chain by the time that second request happens, and that
is precisely what a circular reference *is*.

---

## Step 1 — Carry an Evaluation Stack Through Every Lookup

**The problem:** `lookupCellValue` has no memory of which cells are
already "in progress" higher up the same call chain.

Update `lookupCellValue` in `script.ts`:

```typescript
function lookupCellValue(name: CellId, evaluationStack: Set<CellId>): number {
  if (evaluationStack.has(name)) {
    const chain = [...evaluationStack, name].join(' → ');
    throw new Error(`Circular reference detected: ${chain}`);
  }

  const referencedCell = cells[name];
  if (!referencedCell) {
    return 0;
  }

  switch (referencedCell.kind) {
    case 'number':
      return referencedCell.value;
    case 'text':
      return 0;
    case 'formula': {
      const parseResult = parse(tokenize(referencedCell.expr));
      if (parseResult.success === false) {
        return 0;
      }

      const nextStack = new Set(evaluationStack);
      nextStack.add(name);

      return evaluate(parseResult.ast, (referencedName) => lookupCellValue(referencedName, nextStack));
    }
    default:
      return assertNever(referencedCell);
  }
}
```

Update `displayCell`'s `'formula'` case and `updateDebugPanel`'s result
line in `script.ts` to seed the stack with the cell's own id — `displayCell`
now needs to know which cell it is being asked to display:

```typescript
function displayCell(cell: Cell | undefined, ownId: CellId): string {
  if (!cell) {
    return '';
  }

  switch (cell.kind) {
    case 'number':
      return cell.value.toString();
    case 'text':
      return cell.value;
    case 'formula': {
      const parseResult = parse(tokenize(cell.expr));
      if (parseResult.success === false) {
        return '#ERROR';
      }

      try {
        const value = evaluate(parseResult.ast, (name) => lookupCellValue(name, new Set([ownId])));
        return value.toString();
      } catch {
        return '#ERROR';
      }
    }
    default:
      return assertNever(cell);
  }
}
```

Update `renderCell`'s call site in `script.ts`:

```typescript
element.textContent = displayCell(cell, cellId(coordinate));
```

Click **▶ Preview**. Type `=B1` into A1, then `=A1` into B1: both show
`#ERROR` instead of freezing the tab. Check the debug panel's result for
either cell — it shows the real message, `Circular reference detected:
A1 → B1 → A1`.

**Walkthrough — why a `Set<CellId>` is passed down instead of checked
globally.** `evaluationStack` represents exactly one thing: the chain of
cells currently being evaluated *on this specific path*, starting from
whichever cell `displayCell` was originally asked about. `new Set
([ownId])` seeds it with just that one starting cell. Every time
evaluation descends into another formula, `nextStack` is a *new* `Set`
— a copy of the current one, with the newly-entered cell added — never a
mutation of the one passed in. This means two *separate* references to
the same cell, at the same level (`=A1+A1`), never falsely trigger a
cycle error: both calls check against the identical stack from that one
level, which does not yet contain `A1` unless something *above* this
level already put it there.

**Walkthrough — copying the stack instead of mutating one shared one.**
A more traditional approach might use one shared stack, pushing a cell
before recursing into it and popping it back off afterward — but that
requires remembering to pop in every possible return path, including
error paths, a real, easy place to introduce a subtle bug. Copying the
`Set` at each level costs a small amount of extra memory, trivial at this
project's scale, in exchange for a guarantee that needs no bookkeeping at
all: each level's stack is simply whatever was passed to it, plus one,
and nothing further to remember once that call returns.

**Walkthrough — the error message itself.** `[...evaluationStack, name]`
spreads the stack's current contents into a new array, with the
newly-detected repeat appended at the end, then `.join(' → ')` turns that
array into one readable string — `A1 → B1 → A1`, showing not just *that*
a cycle exists, but the exact chain of cells that forms it, genuinely
useful for finding and fixing the actual mistake.

---

## Connect the Pieces

```
script.ts    lookupCellValue() — now threads an evaluationStack through
             every recursive call, throwing the moment a cell reappears
             displayCell() — seeds the very first stack with the cell's
             own id, catching direct self-reference immediately too
```

---

## What Breaks Without This

**Typing `=A1` directly into A1 itself, without this lesson's change:**
An infinite loop, immediately, on the very first formula that references
its own cell — the simplest possible circular reference, and the one this
lesson's `displayCell` seed (`new Set([ownId])`) specifically catches
without needing any other cell involved at all.

**Copying the stack with `Array.from(evaluationStack)` reused across
sibling branches instead of a fresh `new Set(evaluationStack)` per
call:** A formula like `=SUM(A1,B1)`, where evaluating `A1` and `B1` both
recurse into further formulas, would risk one branch's additions to the
stack leaking into the other's, if the same mutable structure were passed
to both instead of each getting its own independent copy — a real formula
with two harmless, unrelated references could then falsely report a cycle
that does not exist.

---

## Definition of Done

- [ ] `=A1` typed directly into A1 shows a clear error, not a frozen tab
- [ ] Two cells referencing each other (`=B1` in A1, `=A1` in B1) both show a clear error
- [ ] The debug panel's error message names the actual chain of cells involved
- [ ] A formula referencing the same cell twice at the same level (`=A1+A1`) still works correctly, with no false cycle error
- [ ] You can explain why the evaluation stack is copied at each recursive step instead of mutated in place
- [ ] You can explain why `displayCell` needs to know its own cell's id now, when it did not before this lesson

---

*Next: Lesson 13 — Errors as Values. Every failure mode built so far —
parse errors, unknown functions, circular references — currently
collapses into the same generic `'#ERROR'` text. This lesson gives each
one a real, specific, typed shape instead.*
