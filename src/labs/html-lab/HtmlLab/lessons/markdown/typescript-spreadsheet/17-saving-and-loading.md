# TypeScript Spreadsheet — Lesson 17 — Saving and Loading

## What You Will Build

Build a sheet — numbers, formulas, formats, styles — then reload the
browser tab entirely. Everything is exactly as you left it. This project
now has *three* separate pieces of state (`cells`, `cellFormats`,
`cellStyles`) that all need to survive together, saved and loaded as one
coordinated snapshot, honestly handling data saved before a field like
`cellStyles` even existed.

---

## What You Need to Know First

Lesson 16 left three independent `Record`s — `cells`, `cellFormats`,
`cellStyles` — each declared once, at the top of `script.ts`, and never
touched by anything outside this project's own running memory.

---

## Step 1 — Save Everything Together

**The problem:** Nothing currently writes any of this project's state to
`localStorage` at all.

Add to `script.ts`:

```typescript
const STORAGE_KEY = 'typescript-spreadsheet';

function saveSpreadsheet(): void {
  const snapshot = { cells, cellFormats, cellStyles };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
```

Call `saveSpreadsheet()` at the end of `commitEdit`, the bold/italic
click handlers, and the color-input and format-select change handlers in
`script.ts` — every place any of the three `Record`s changes.

**Walkthrough — one snapshot, three independent pieces.** `{ cells,
cellFormats, cellStyles }` is **shorthand property syntax** — equivalent
to `{ cells: cells, cellFormats: cellFormats, cellStyles: cellStyles }`,
just shorter, whenever a variable's name and the property name you want
should match. `JSON.stringify` serializes all three `Record`s together
into one string, under one key — a single save operation covering
everything this project currently tracks, rather than three separate,
independently-timed writes that could theoretically drift out of sync
with each other.

---

## Step 2 — Load on Startup, Honestly

**The problem:** Nothing reads anything back, and a real concern needs
addressing: data saved by an earlier version of this project (before
`cellStyles` existed at all, for instance) should not crash a newer
version that expects it.

Add to `script.ts`:

```typescript
function loadSpreadsheet(): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    Object.assign(cells, parsed.cells ?? {});
    Object.assign(cellFormats, parsed.cellFormats ?? {});
    Object.assign(cellStyles, parsed.cellStyles ?? {});

    for (const id of Object.keys(cells)) {
      updateDependencies(parseCellName(id), cells[id]);
    }
  } catch {
    // Corrupted or unreadable data — the three Records stay empty, a
    // fresh, working start rather than a crash.
  }
}
```

Call `loadSpreadsheet();` near the bottom of `script.ts`, immediately
*before* `renderGrid();`.

Click **▶ Preview**, build a sheet with a few numbers, formulas, and
styles, then reload the browser tab (not just click Preview again —
actually reload). Everything is exactly as you left it.

**Walkthrough — `Object.assign`, mutating instead of replacing.**
`cells`, `cellFormats`, and `cellStyles` are all declared `const` — they
cannot be *reassigned* to a different object entirely. `Object.assign
(cells, parsed.cells ?? {})` does not need to reassign anything: it
copies every key from `parsed.cells` directly *into* the existing
`cells` object, mutating its contents in place. This is exactly why
`const` was never a problem here — `const` only ever prevented pointing
the variable at a *different* object, and this code never needed to.

`parsed.cells ?? {}` guards against data saved before a field existed at
all: if `parsed.cells` is missing entirely (`undefined`), `Object.assign`
receives an empty object instead, adding nothing — the same honest
"missing field defaults to empty, never crashes" handling this project's
sibling series used for `preferences`.

**Walkthrough — rebuilding the dependency graph after loading.**
`updateDependencies` (lesson 11) has, until now, only ever been called
from `commitEdit` — the one place a person actively changes a cell. Cells
restored from storage never went through `commitEdit` at all, so nothing
has told the dependency graph about them yet. The `for` loop calls
`updateDependencies` once per loaded cell, exactly as if each one had
just been typed in by hand — after this loop, `dependents` and
`dependencies` are fully correct, and automatic recalculation (lesson 11)
and caching (lesson 14) both work correctly from the very first edit
after a reload.

**Walkthrough — `Object.keys(cells)`.** `Object.keys` returns a real
array containing every key of an object, as strings — here, every cell
id currently in `cells`, letting the `for...of` loop visit each one in
turn.

---

## Connect the Pieces

```
script.ts    STORAGE_KEY, saveSpreadsheet(), loadSpreadsheet() — the
             whole persistence layer, covering all three of this
             project's independent metadata tables together
             Every mutation point (commitEdit, style buttons, format
             select) now ends with a call to saveSpreadsheet()
```

---

## What Breaks Without This

**Skipping the dependency-graph rebuild after loading:** Save a sheet
containing `=A1+1` in B1, reload the page, then change A1. B1 does not
update — `dependents` is empty for every loaded cell, since nothing ever
told it what depends on what, until B1 happens to be edited directly by
hand at least once.

**Without `parsed.cells ?? {}`:** Manually clear `localStorage`'s saved
value to `'{}'` (an empty JSON object, valid but missing every expected
field) using the browser's DevTools, then reload. `Object.assign(cells,
undefined)` throws a real `TypeError` — `Object.assign` cannot copy keys
from `undefined` — crashing this project's startup from a single missing
field, instead of degrading to an honestly empty sheet.

---

## Definition of Done

- [ ] Reloading the browser tab preserves every cell's value, formula, format, and style exactly
- [ ] Automatic recalculation (lesson 11) works correctly immediately after a reload, with no manual edit required first
- [ ] Manually corrupting the saved value results in a fresh, empty, working sheet — not a crash
- [ ] You can explain why `Object.assign` was used instead of reassigning `cells` directly
- [ ] You can explain why the dependency graph needs to be rebuilt after loading, even though the saved data itself is already correct

---

*Next: Lesson 18 — Undo and Redo. Every edit so far has been a dead end —
there is no way back. This lesson builds a real history stack, using
`Readonly<T>` to make a real promise: a past snapshot, once saved, can
never accidentally change out from under you.*
