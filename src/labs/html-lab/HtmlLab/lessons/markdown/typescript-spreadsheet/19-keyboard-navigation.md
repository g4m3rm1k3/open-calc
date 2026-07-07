# TypeScript Spreadsheet — Lesson 19 — Keyboard Navigation

## What You Will Build

Arrow keys move the selection around the grid, stopping cleanly at its
edges. Press Enter while editing, and the value commits *and* the
selection drops to the cell below — the same rhythm every real
spreadsheet uses for typing a column of values quickly. Escape cancels an
edit, discarding whatever was typed, leaving the cell exactly as it was.

---

## What You Need to Know First

Lesson 18 left one `document`-level `keydown` listener handling Ctrl+Z,
Ctrl+Shift+Z, and Enter-to-start-editing, guarded by an
`isTypingInField` check.

---

## Step 1 — Move the Selection

**The problem:** Nothing currently changes `selectedCoordinate` except a
mouse click.

Add to `script.ts`:

```typescript
function moveSelection(deltaCol: number, deltaRow: number): void {
  if (!selectedCoordinate) {
    return;
  }

  const nextCol = selectedCoordinate.col + deltaCol;
  const nextRow = selectedCoordinate.row + deltaRow;

  if (nextCol < 0 || nextCol >= COLUMN_COUNT || nextRow < 0 || nextRow >= ROW_COUNT) {
    return;
  }

  selectCell({ col: nextCol, row: nextRow });
}
```

**Walkthrough:** `deltaCol`/`deltaRow` describe a direction and distance
— `moveSelection(0, -1)` means "same column, one row up." The bounds
check rejects any move that would land outside the real 6×10 grid,
silently doing nothing rather than selecting a coordinate that has no
corresponding cell at all — pressing the up arrow while already on row
one simply has no effect, exactly as a person would expect.

---

## Step 2 — Wire Up the Arrow Keys

**The problem:** Nothing calls `moveSelection` yet.

Update the `document`-level `keydown` listener in `script.ts`:

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
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    moveSelection(0, -1);
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    moveSelection(0, 1);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    moveSelection(-1, 0);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    moveSelection(1, 0);
  }
});
```

Click **▶ Preview**, select a cell, and use the arrow keys: the selection
moves, stopping cleanly at the grid's edges.

**Walkthrough — `event.preventDefault()`, yet another context.** By
default, arrow keys can scroll the page itself if there is anything to
scroll. `event.preventDefault()` here stops that default scrolling —
this project's fourth distinct reason to call the exact same method,
after cancelling a form submission (Video Notes lesson 03), allowing a
drop target (lesson 13), and stopping a browser's own "quick find"
(lesson 17 of the same project) — always "cancel this event's default
behaviour," always a different behaviour depending on which event it is.

---

## Step 3 — Enter Commits and Moves Down; Escape Cancels

**The problem:** Pressing Enter while editing commits a value but leaves
the selection exactly where it was — real spreadsheets move down,
letting a person type a whole column without touching the mouse.
Pressing Escape currently does nothing at all.

Update the note-editing `<input>`'s `keydown` listener, inside
`renderCell`, in `script.ts`:

```typescript
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.stopPropagation();
    commitEdit(coordinate, input.value);
    selectCell(coordinate);
    moveSelection(0, 1);
  } else if (event.key === 'Escape') {
    event.stopPropagation();
    editingCoordinate = null;
    renderCell(coordinate);
  }
});
```

Click **▶ Preview**. Type a value, press Enter: it commits, and the cell
below becomes selected. Start editing another cell, type something, then
press Escape: the edit is discarded, and the cell shows whatever it held
*before* you started typing.

**Walkthrough — `selectCell(coordinate)` before `moveSelection`, not
after.** `moveSelection` always moves *relative to whatever
`selectedCoordinate` currently is*. Explicitly reselecting the
just-edited cell first guarantees `moveSelection(0, 1)` moves down from
*exactly* the cell that was edited, regardless of what was selected
before editing began — a small, deliberate safeguard rather than an
assumption that the two were already in sync.

**Walkthrough — Escape, and why it never calls `commitEdit`.**
`editingCoordinate = null; renderCell(coordinate);` closes the editor the
same way `commitEdit` does, but skips the one line that actually matters:
nothing ever writes to `cells[id]`. `renderCell` then redraws the cell
using whatever it already held, exactly the same behaviour `displayCell`
has always produced for an unedited cell — cancelling is not a special
case `displayCell` needs to know about at all, only a matter of `commitEdit`
never being called in the first place.

---

## Connect the Pieces

```
script.ts    moveSelection() — the only place selectedCoordinate changes
             other than a direct mouse click
             The document keydown listener — now handles undo/redo,
             starting an edit, and all four arrow directions, in one place
             The input's own keydown listener — Enter commits and
             advances; Escape discards and closes
```

---

## What Breaks Without This

**Removing the bounds check from `moveSelection`:** Select a cell in row
one and press the up arrow. `nextRow` becomes `-1` — `selectCell({ col,
row: -1 })` would try to highlight a DOM element with an id like
`cell-A0`, which does not exist, and `requireElement` would throw exactly
the clear error it was built for back in lesson 01, crashing selection
entirely from a single, easy-to-make off-by-one mistake.

**Removing `selectCell(coordinate)` before `moveSelection` in the Enter
handler:** In the unlikely event `selectedCoordinate` and the cell being
edited had drifted out of sync, pressing Enter would move the selection
relative to the *wrong* cell — a subtle bug, exactly the kind explicit,
deliberate synchronization exists to rule out rather than hope never
happens.

---

## Definition of Done

- [ ] Arrow keys move the selection in all four directions, stopping cleanly at the grid's edges
- [ ] Pressing Enter while editing commits the value and selects the cell below
- [ ] Pressing Escape while editing discards the change and restores the cell's previous display
- [ ] Undo, redo, and starting an edit all still work correctly alongside the new arrow-key handling
- [ ] You can explain why `selectCell(coordinate)` runs immediately before `moveSelection` in the Enter handler
- [ ] You can name all four different reasons `event.preventDefault()` has been used across this project's two series

---

*Next: Lesson 20 — Organising Into Modules. Every function this project
has wired together lives in one growing file. This lesson splits it
across `types.ts`, `parser.ts`, `evaluator.ts`, and more — and confronts
directly what "a module" even means in an environment with no real
`import` or `export`.*
