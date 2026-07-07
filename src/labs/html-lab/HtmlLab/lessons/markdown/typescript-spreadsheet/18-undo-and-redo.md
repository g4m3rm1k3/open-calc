# TypeScript Spreadsheet — Lesson 18 — Undo and Redo

## What You Will Build

Press Ctrl+Z, and the last edit reverses — not just the last cell typed
into, but the *entire sheet*, exactly as it was one step earlier. Press
Ctrl+Shift+Z, and it moves forward again. Every edit until now has been a
dead end, permanent the moment it happened; this lesson builds a real
history, using `Readonly<T>` to make a concrete promise: once a past
version of the sheet is saved, nothing can accidentally reach back and
change it.

---

## What You Need to Know First

Lesson 17 left `cells`, `cellFormats`, and `cellStyles` as this project's
complete state, saved and loaded together.

---

## Step 1 — Snapshot the Whole Sheet

**The problem:** Undoing one cell's edit is not enough — a real undo
needs to capture *everything* that could have changed, together, at each
step.

Add to `script.ts`:

```typescript
interface SpreadsheetSnapshot {
  readonly cells: Readonly<Record<CellId, Cell>>;
  readonly cellFormats: Readonly<Record<CellId, CellFormat>>;
  readonly cellStyles: Readonly<Record<CellId, CellStyle>>;
}

function takeSnapshot(): SpreadsheetSnapshot {
  return {
    cells: { ...cells },
    cellFormats: { ...cellFormats },
    cellStyles: { ...cellStyles },
  };
}
```

**Walkthrough — `readonly` on the interface, `Readonly<T>` on its
fields, two related but different protections.** `readonly cells: ...`
inside `SpreadsheetSnapshot` means a `snapshot.cells = somethingElse`
would be rejected — the snapshot's own three fields can never be
reassigned once created. `Readonly<Record<CellId, Cell>>` goes further,
for the object *inside* that field: it forbids `snapshot.cells['A1'] =
newCell` too — adding or replacing a key inside the record itself.
Together, once a `SpreadsheetSnapshot` exists, nothing about it can be
changed, in either direction, by any code holding a reference to it.

**A real, honest limit — `Readonly` is shallow.** `Readonly<Record<CellId,
Cell>>` protects the record's own keys, but says nothing about the `Cell`
objects the keys point to — if this project ever mutated a `Cell`'s own
fields in place, a snapshot's protection would not reach that deep. This
project never does that: every mutation, since lesson 04, has always
*replaced* a cell entirely (`cells[id] = parseRawInput(...)`) rather than
editing one of its fields directly. `takeSnapshot`'s shallow copy —
`{ ...cells }`, copying only the record's own top-level keys — is safe
specifically *because* of that existing discipline, not by accident.

---

## Step 2 — Restore a Snapshot

**The problem:** Nothing yet takes a saved snapshot and makes it the
sheet's actual, current state again.

Add to `script.ts`:

```typescript
function restoreSnapshot(snapshot: SpreadsheetSnapshot): void {
  for (const key of Object.keys(cells)) {
    delete cells[key];
  }
  Object.assign(cells, snapshot.cells);

  for (const key of Object.keys(cellFormats)) {
    delete cellFormats[key];
  }
  Object.assign(cellFormats, snapshot.cellFormats);

  for (const key of Object.keys(cellStyles)) {
    delete cellStyles[key];
  }
  Object.assign(cellStyles, snapshot.cellStyles);

  for (const id of Object.keys(cells)) {
    updateDependencies(parseCellName(id), cells[id]);
  }
  valueCache.clear();
}

function renderAllCells(): void {
  for (let row = 0; row < ROW_COUNT; row++) {
    for (let col = 0; col < COLUMN_COUNT; col++) {
      renderCell({ col, row });
    }
  }
}
```

**Walkthrough — clearing before restoring.** `Object.assign` only ever
*adds or overwrites* keys — it never removes one that exists in the
target but not in the source. If the sheet currently has a cell the
snapshot being restored does not (because it was typed *after* that
snapshot was taken), simply assigning the snapshot's keys on top would
leave that newer cell behind, un-undone. The `delete` loop empties each
`Record` completely first, so the restored state matches the snapshot
exactly — nothing extra left over, nothing missing.

**Walkthrough — rebuilding dependencies and clearing the cache, again.**
The exact same two steps lesson 17's `loadSpreadsheet` needed: restored
cells never went through `commitEdit`, so `dependents` needs rebuilding
from scratch, and `valueCache.clear()` throws away every memoized value,
since practically everything about the sheet may have just changed at
once. `renderAllCells` then redraws every cell in the grid, since undo
can affect any of them, not just one.

---

## Step 3 — Two Stacks

**The problem:** A snapshot function and a restore function exist, but
nothing decides *when* to take one, or manages moving backward and
forward through a sequence of them.

Add to `script.ts`:

```typescript
const undoStack: SpreadsheetSnapshot[] = [];
const redoStack: SpreadsheetSnapshot[] = [];

function recordHistory(): void {
  undoStack.push(takeSnapshot());
  redoStack.length = 0;
}

function undo(): void {
  const previous = undoStack.pop();
  if (!previous) {
    return;
  }
  redoStack.push(takeSnapshot());
  restoreSnapshot(previous);
  renderAllCells();
}

function redo(): void {
  const next = redoStack.pop();
  if (!next) {
    return;
  }
  undoStack.push(takeSnapshot());
  restoreSnapshot(next);
  renderAllCells();
}
```

Update `commitEdit` in `script.ts` to record history *before* changing
anything:

```typescript
function commitEdit(coordinate: Coordinate, rawInput: string): void {
  recordHistory();
  const id = cellId(coordinate);
  cells[id] = parseRawInput(rawInput);
  // ...rest of commitEdit unchanged
```

Add the identical `recordHistory();` as the first line of the bold,
italic, colour, and format-select handlers from lessons 15 and 16.

**Walkthrough — `undoStack`/`redoStack`, and why redo is cleared on a new
edit.** Each is a plain array used as a **stack** — `.push()` adds to the
end, `.pop()` removes and returns the end, so the *most recently* pushed
snapshot is always the first one undone, the standard last-in-first-out
behaviour a real undo history needs. `recordHistory` clears `redoStack`
entirely (`redoStack.length = 0`) every time a *new* edit happens — once
you make a fresh change after undoing, the branch of history you undid
*away from* is gone; redoing back into it would no longer make sense
once something new has been built on top of the earlier state instead.

**Walkthrough — `undo`, pushing the current state onto `redoStack`
before restoring.** Before jumping back to `previous`, `undo` saves the
sheet's state *right now* onto `redoStack` — that current state is
exactly what `redo` needs to jump back *forward* to, a moment later, if
asked.

---

## Step 4 — Keyboard Shortcuts

**The problem:** `undo` and `redo` exist, but nothing calls them.

Update the `document`-level `keydown` listener from lesson 03 in
`script.ts`:

```typescript
document.addEventListener('keydown', (event) => {
  const isTypingInField = event.target instanceof HTMLInputElement;

  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    undo();
    return;
  }

  if (event.ctrlKey && event.key === 'z' && event.shiftKey) {
    event.preventDefault();
    redo();
    return;
  }

  if (isTypingInField) {
    return;
  }

  if (event.key === 'Enter' && selectedCoordinate && !editingCoordinate) {
    startEditing(selectedCoordinate);
  }
});
```

Click **▶ Preview**, type a few values, then press Ctrl+Z repeatedly: the
sheet steps backward, one whole edit at a time. Press Ctrl+Shift+Z: it
steps forward again.

**Walkthrough — `event.ctrlKey`, `event.shiftKey`.** Every keyboard event
carries these as plain booleans, `true` exactly when that modifier key is
currently held down during the keypress. Checking `ctrlKey` first, before
the `isTypingInField` guard, is deliberate: undo and redo should work
*everywhere*, including while focus happens to be inside an input — which
is exactly why editing a formula through `renderCell`'s input never
conflicts here, since typing normal characters never sets `ctrlKey` at
all.

---

## Connect the Pieces

```
script.ts    SpreadsheetSnapshot, takeSnapshot(), restoreSnapshot() —
             capturing and restoring this project's entire state at once
             undoStack, redoStack, recordHistory() — a standard two-stack
             undo/redo history, reused identically at every mutation point
```

---

## What Breaks Without This

**Removing the `delete` loops from `restoreSnapshot`, keeping only the
`Object.assign` calls:** Type a value into a brand-new cell, undo it. The
cell reappears anyway — `Object.assign` never removed it, since the
snapshot being restored simply does not mention that key at all, and
`Object.assign` only ever adds or overwrites, never deletes.

**Not clearing `redoStack` on a new edit:** Undo twice, then type
something new into a different cell, then press Ctrl+Shift+Z (redo). The
sheet jumps forward into a version of history that no longer makes sense
next to the new edit just made — a real, confusing inconsistency `redoStack.
length = 0` exists specifically to prevent.

---

## Definition of Done

- [ ] Ctrl+Z reverses the most recent edit; repeated presses step further back
- [ ] Ctrl+Shift+Z moves forward again, up to the most recent edit
- [ ] Making a new edit after undoing correctly discards the redo history that no longer applies
- [ ] Undoing the creation of a brand-new cell removes it entirely, not just resets its value
- [ ] You can explain the difference between `readonly` on an interface field and `Readonly<T>` wrapping a field's own type
- [ ] You can explain why `Readonly` alone was safe to rely on here, given how this project has always replaced cells rather than mutating them

---

*Next: Lesson 19 — Keyboard Navigation. Arrow keys move the selection;
Enter confirms an edit and moves down — extending the same keydown
listener this lesson just added undo and redo to.*
