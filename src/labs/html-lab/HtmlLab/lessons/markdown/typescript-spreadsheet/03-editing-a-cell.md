# TypeScript Spreadsheet — Lesson 03 — Editing a Cell

## What You Will Build

Double-click a cell, or select one and press Enter, and it turns into a
real text input. Type something, press Enter again (or click elsewhere),
and the value sticks — displayed as plain text, stored somewhere real, and
still there the next time you look at that cell. Every cell's raw text is
now genuinely data this project owns, not just something a person happened
to see on screen for a moment.

---

## What You Need to Know First

Lesson 02 left `selectedCoordinate: Coordinate | null`, updated by
`selectCell()`, with `readonly` fields on `Coordinate` preventing any of
this project's own code from mutating one after it is created.

---

## Step 1 — Store Every Cell's Raw Text

**The problem:** Nothing currently remembers what was typed into a cell —
there is no data structure for it at all.

Add to `script.ts`:

```typescript
const rawValues: Record<CellId, string> = {};
let editingCoordinate: Coordinate | null = null;
```

**Walkthrough — `Record<K, V>`, your first generic utility type.**
`Record<CellId, string>` describes an object where every key is a
`CellId` (recall from lesson 01: just a more meaningful name for
`string`) and every value is a `string`. This is equivalent to writing
`{ [key: string]: string }` yourself, but `Record` states the same thing
more directly — "a lookup table from this kind of key to this kind of
value." The `<...>` after `Record` are **type parameters** — `Record`
itself is generic, meaning it does not commit to any specific key or value
type until you tell it which ones you want, right here. Lesson 19 returns
to generics properly; for now, treat `Record<CellId, string>` as this
project's name for "a plain object used as a lookup table."

`editingCoordinate: Coordinate | null` is the same union shape lesson 02
introduced for `selectedCoordinate`, applied to a second, independent
question: not *which* cell is selected, but *which* cell, if any, is
currently showing a text input instead of plain text.

---

## Step 2 — Render a Cell's Content, One Cell at a Time

**The problem:** A cell currently has no way to show either its stored
text, or an input for changing it — `renderGrid()` only ever built empty
`<td>` elements.

Add to `script.ts`:

```typescript
function renderCell(coordinate: Coordinate): void {
  const element = requireElement(`cell-${cellId(coordinate)}`);
  element.innerHTML = '';

  const isEditing = editingCoordinate !== null
    && editingCoordinate.col === coordinate.col
    && editingCoordinate.row === coordinate.row;

  if (isEditing) {
    const input = document.createElement('input');
    input.className = 'cell-input';
    input.value = rawValues[cellId(coordinate)] ?? '';

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.stopPropagation();
        commitEdit(coordinate, input.value);
      }
    });

    input.addEventListener('blur', () => {
      commitEdit(coordinate, input.value);
    });

    element.appendChild(input);
    input.focus();
  } else {
    element.textContent = rawValues[cellId(coordinate)] ?? '';
  }
}
```

**Walkthrough — conditional rendering, decided per cell.** `isEditing`
answers one question — "is *this specific* coordinate the one currently
being edited?" — by comparing both fields against `editingCoordinate`,
after first checking it is not `null` (the same type-narrowing shape
`requireElement` used in lesson 01: TypeScript will not let you read
`.col` off something that might be `null` without proving, first, that it
is not). `if (isEditing) { ... } else { ... }` then builds one of two
completely different things for this one cell — a real `<input>`, or plain
text — decided fresh, every single time `renderCell` runs for it.

**Walkthrough — `??`, the nullish coalescing operator.** `rawValues
[cellId(coordinate)] ?? ''` reads: "the stored value for this cell, or an
empty string if there isn't one." `??` returns its left side unless that
side is `null` or `undefined`, in which case it returns the right side
instead. This matters here for an honest reason worth stating plainly:
`Record<CellId, string>`'s type tells TypeScript "every value here is a
real string" — but nothing has actually been typed into most cells yet, so
looking one up genuinely returns `undefined` at runtime, in a way
TypeScript's default settings will not warn you about. This is a real,
known sharp edge of plain object index types: the type system trusts you
more than it should here. `??` is not working around a TypeScript feature
— it is defending against a gap the type system does not close on its own.

`element.innerHTML = ''` clears whatever this one cell held before —
either leftover plain text, or a previous `<input>` left over from a prior
edit — the same "clear before rebuilding" idea lesson 01's `renderGrid`
used for its containers, scoped down here to a single cell.

`input.focus()` moves the browser's keyboard focus directly into the new
input the instant it exists, so typing can start immediately without an
extra click.

---

## Step 3 — Commit an Edit, and Trigger It From Two Places

**The problem:** `commitEdit`, called from Step 2's input listeners, does
not exist yet — and nothing currently starts editing in the first place.

Add to `script.ts`:

```typescript
function commitEdit(coordinate: Coordinate, value: string): void {
  rawValues[cellId(coordinate)] = value;
  editingCoordinate = null;
  renderCell(coordinate);
}

function startEditing(coordinate: Coordinate): void {
  editingCoordinate = coordinate;
  renderCell(coordinate);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && selectedCoordinate && !editingCoordinate) {
    startEditing(selectedCoordinate);
  }
});
```

Update `renderGrid()`'s row loop in `script.ts` — note that
`body.appendChild(tableRow)` moves earlier, right after `tableRow` is
created, instead of waiting until the row is fully built:

```typescript
for (let row = 0; row < ROW_COUNT; row++) {
  const tableRow = document.createElement('tr');
  body.appendChild(tableRow);

  const rowHeader = document.createElement('th');
  rowHeader.textContent = String(row + 1);
  tableRow.appendChild(rowHeader);

  for (let col = 0; col < COLUMN_COUNT; col++) {
    const cell = document.createElement('td');
    cell.id = `cell-${cellId({ col, row })}`;
    cell.className = 'cell';
    cell.addEventListener('click', () => selectCell({ col, row }));
    cell.addEventListener('dblclick', () => startEditing({ col, row }));
    tableRow.appendChild(cell);
    renderCell({ col, row });
  }
}
```

**Walkthrough — why `body.appendChild(tableRow)` had to move.**
`renderCell({ col, row })` now runs for every cell as it is built, and
`renderCell` starts with `requireElement`, which calls
`document.getElementById`. That method only ever finds elements that are
part of the real, live document — an element sitting inside a `<tr>` that
has not itself been attached to the page yet does not count, no matter how
correctly its `id` is set. Lesson 01's original order — build the entire
row, *then* attach it to `body` — worked perfectly well when nothing
needed to look a cell up by id mid-construction. The moment `renderCell`
does exactly that, `tableRow` has to already be live in the document
*before* its cells are added to it, so each cell becomes findable the
instant it exists.

Add to the CSS tab:

```css
.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 0;
  font: inherit;
  background: transparent;
}
```

Click **▶ Preview**. Double-click any cell: a text input appears. Type
something and press Enter: the input disappears, replaced by the text you
typed. Select a different cell and press Enter without double-clicking:
editing starts the same way.

**Walkthrough — two ways in, one way through.** Both a `dblclick` on a
cell and pressing Enter on an already-selected one call the same
`startEditing`, which does exactly one thing: set `editingCoordinate` and
re-render that one cell. Neither entry point needed to know anything about
inputs, focus, or rendering — that is all `renderCell`'s job, called
identically no matter which path triggered it.

**Walkthrough — `event.stopPropagation()`, a new method with a specific,
necessary job here.** Both the input's own `keydown` listener and the
`document`-level one from Step 3 listen for `'keydown'`. Without
`stopPropagation()`, pressing Enter while editing would trigger the
input's handler first (committing the edit, clearing `editingCoordinate`),
and then the *same keystroke* would continue bubbling up to `document`'s
listener — which would now see `selectedCoordinate` still set and
`editingCoordinate` freshly cleared, and immediately call `startEditing`
again, reopening the exact input that had just closed. `event.
stopPropagation()` stops the event from bubbling any further the instant
the input's own handler finishes with it, so `document`'s listener never
sees this particular keystroke at all. This is different from
`preventDefault()` (used since Video Notes lesson 03): `preventDefault()`
cancels an event's own default browser behaviour but lets it keep
bubbling; `stopPropagation()` lets the default behaviour happen but stops
the event from reaching any ancestor listeners.

**SE lens — `commitEdit` is the only place `rawValues` is ever written
to.** Both the input's Enter handler and its `blur` handler call
`commitEdit` with whatever the input currently holds — neither one writes
to `rawValues` directly. If a future lesson needs to validate or transform
a value before it is stored (lesson 04 does exactly this), there is
exactly one function that would need to change.

---

## Connect the Pieces

```
script.ts    rawValues: Record<CellId, string> — every cell's stored text
             editingCoordinate — which single cell, if any, shows an
             input right now, the same one-thing-at-a-time shape as
             selectedCoordinate
             renderCell() — decides, per cell, whether to show text or an
             input, called from renderGrid() and every edit transition
```

---

## What Breaks Without This

**Leaving `body.appendChild(tableRow)` at the end of the row loop, where
lesson 01 originally had it, instead of moving it earlier:** Click ▶
Preview and check the browser console. `Error: Expected an element with id
"cell-A1"`, thrown from inside `requireElement`, called by `renderCell`,
called by `renderGrid` — the grid never finishes rendering at all, and the
page shows nothing. This is a real, easy mistake: every cell's `id` is set
correctly before this error happens, but `document.getElementById` only
searches the page's actual, live document — a `<td>` sitting inside a
`<tr>` that has not itself been attached anywhere yet is invisible to it,
no matter how correct its `id` already is.

**Without `event.stopPropagation()` in the input's Enter handler:** Select
a cell, press Enter to start editing, type something, press Enter again.
The input closes for a single frame and then immediately reopens, empty
of focus, because the same keystroke's bubbled copy reaches `document`'s
listener and calls `startEditing` a second time. Try it yourself by
commenting out that one line.

**Removing the `!editingCoordinate` check in the `document` keydown
listener, while keeping `stopPropagation()` in place:** Nothing breaks
immediately — `stopPropagation()` already stops a commit's own Enter
keystroke from ever reaching this listener at all. The check is a second,
independent safeguard: it protects the exact same outcome through a
different mechanism, so a future change that ever removed
`stopPropagation()` by accident would not immediately reopen this same
bug. Two different lines defending against the same mistake, for two
different reasons, is a real and common pattern in event-driven code —
not redundancy for its own sake.

---

## Definition of Done

- [ ] Double-clicking a cell opens a text input inside it
- [ ] Selecting a cell and pressing Enter opens the same input
- [ ] Typing a value and pressing Enter commits it and closes the input
- [ ] Clicking away from an open input (blur) also commits its value
- [ ] The committed value displays correctly the next time you look at that cell
- [ ] You can explain what `Record<CellId, string>` means and what it is shorthand for
- [ ] You can explain the specific, real difference between `event.preventDefault()` and `event.stopPropagation()`, using this lesson's Enter-key bug as the example
- [ ] You can explain why `??` was necessary in `renderCell` even though `rawValues` is typed as holding only strings

---

*Next: Lesson 04 — Numbers and Text. Typed values stop being just raw
strings — `"12"` becomes a real number, `"hello"` stays text — and this
project defines the type everything from here on is built around: a cell
that can honestly be one of several different, mutually exclusive shapes.*
