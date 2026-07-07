# TypeScript Spreadsheet — Lesson 01 — The Grid

## What You Will Build

A real grid: column headers `A` through `F` across the top, rows `1`
through `10` down the side, and sixty empty, addressable cells between
them — the visible skeleton every later lesson fills in. This lesson is
entirely HTML, CSS, and just enough TypeScript to generate the grid from
two numbers instead of typing sixty cells by hand.

---

## What You Need to Know First

Nothing about this project specifically. If this is your first time in
**HTML Lab** at all, [Video Notes lesson 01](../video-notes/01-the-app-shell.md)
gives the full tour of its tabs, the ▶ Preview button, and what HTML Lab
generates for you automatically. This lesson assumes that much and moves
straight to what's different here: every file in the JavaScript tab will
end in `.ts`, not `.js`.

---

## Step 1 — Start a TypeScript File

**The problem:** A brand-new HTML Lab project starts with one JavaScript
file, `script.js` — a plain `.js` file gets no TypeScript checking from
Monaco at all, no matter what you type into it.

Click **+ New** to start a blank project. In the **JavaScript** tab, rename
the default `script.js` file to `script.ts`.

**Walkthrough:** Monaco decides whether to apply TypeScript's rules based
entirely on a file's extension — `.ts` for plain TypeScript, `.tsx` for
TypeScript that also contains JSX (not needed in this project). The moment
a file is named `script.ts`, Monaco starts checking every line against
real TypeScript rules, live, with red squiggly lines under anything that
breaks them — exactly as described in this project's [README](README.md),
worth rereading now if you have not yet.

---

## Step 2 — Build the Table Shell

**The problem:** Nothing on the page can hold a grid of cells yet.

Click the **HTML** tab and type:

```html
<table id="spreadsheet" class="spreadsheet">
  <thead>
    <tr id="header-row"></tr>
  </thead>
  <tbody id="spreadsheet-body"></tbody>
</table>
```

Click the **CSS** tab and type:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  padding: 1rem;
}

.spreadsheet {
  border-collapse: collapse;
}

.spreadsheet th,
.spreadsheet td {
  border: 1px solid #cbd5e1;
  min-width: 90px;
  height: 28px;
  text-align: left;
  padding: 0 6px;
  font-size: 0.875rem;
}

.spreadsheet thead th,
.spreadsheet tbody th {
  background-color: #f1f5f9;
  color: #475569;
  font-weight: 600;
  text-align: center;
}
```

Click **▶ Preview**. An empty table frame appears — no headers, no cells
yet, because nothing has generated them.

**Walkthrough:** `<table>` is HTML's dedicated element for genuinely
tabular data — rows and columns of related values — which is exactly what
a spreadsheet is, not a layout trick borrowed from somewhere else.
`<thead>` groups the header row (the column letters, added in Step 3);
`<tbody>` groups every real data row. `id="header-row"` and
`id="spreadsheet-body"` are empty for now — both are containers Step 3's
TypeScript will fill, the same "build the container in HTML, fill it from
code" split every project in this curriculum uses.

`border-collapse: collapse` merges adjacent cell borders into a single
line instead of doubled ones — the standard, correct choice for any table
meant to look like a real grid rather than a stack of separate boxes.

---

## Step 3 — Generate the Grid With TypeScript

**The problem:** Typing sixty individual `<td>` elements by hand — and
getting every single coordinate label right — is exactly the kind of
repetitive, error-prone work code should do instead.

Click the **JavaScript** tab (your file is `script.ts`) and type:

```typescript
const COLUMN_COUNT = 6;
const ROW_COUNT = 10;

interface Coordinate {
  col: number;
  row: number;
}

type CellId = string;

function columnLetter(col: number): string {
  return String.fromCharCode(65 + col);
}

function cellId(coordinate: Coordinate): CellId {
  return `${columnLetter(coordinate.col)}${coordinate.row + 1}`;
}
```

**Walkthrough — your first `interface`.** `interface Coordinate { col:
number; row: number; }` describes the *shape* of an object: anything
claimed to be a `Coordinate` must have a `col` property holding a number,
and a `row` property holding a number — nothing more is required, and
TypeScript will flag it as an error anywhere a `Coordinate` is expected but
one of those two fields is missing, misspelled, or the wrong type.
`interface` does not create anything at runtime — no object exists yet
from writing this alone. It exists purely so Monaco can check, everywhere
`Coordinate` is used, that the shape actually matches.

**Walkthrough — your first `type` alias, and why this project uses both.**
`type CellId = string;` gives an existing type, `string`, a second,
more meaningful name. `CellId` and `string` are completely interchangeable
as far as TypeScript is concerned — this line adds no new restriction at
all. Its entire value is to a *human reading the code*: a function signature
that says `function cellId(coordinate: Coordinate): CellId` communicates
"this returns a cell's identifying string" far more clearly than one that
says `): string`, even though both mean exactly the same thing to the
compiler. This project's convention, from here on: `interface` names the
shape of an object with more than one field; `type` names simpler aliases,
and — starting in lesson 04 — unions.

**Walkthrough — parameter and return types.** `function columnLetter(col:
number): string` states two contracts at once: `col: number` means Monaco
will reject any call passing something that is not a number — `columnLetter
("A")` becomes a real, caught error, before the code ever runs. `: string`
after the closing parenthesis is the **return type** — a promise that this
function always gives back a string, checked the same way: if the function
body tried to `return 5` instead, Monaco would flag *that* as the error,
not the caller.

`String.fromCharCode(65 + col)` is a built-in JavaScript method: every
character has a numeric code in Unicode, and `65` is the code for the
capital letter `'A'`. `String.fromCharCode(65)` returns `'A'`;
`String.fromCharCode(66)` returns `'B'` — adding `col` shifts however many
letters forward, turning the numbers `0` through `5` into `'A'` through
`'F'`, without a manually written array of six letters anywhere.

`` `${columnLetter(coordinate.col)}${coordinate.row + 1}` `` builds the
familiar spreadsheet-style id — column `0`, row `0` becomes `"A1"`, not
`"A0"`, because spreadsheet rows are traditionally counted from one while
this project's internal `row` number, like every array index so far in
this curriculum, counts from zero. The `+ 1` is the entire translation
between the two.

---

## Step 4 — Render the Grid

**The problem:** `columnLetter` and `cellId` exist, but nothing has
actually created a single DOM element yet.

Add to `script.ts`:

```typescript
function requireElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Expected an element with id "${id}"`);
  }
  return element;
}

function renderGrid(): void {
  const headerRow = requireElement('header-row');
  headerRow.innerHTML = '<th></th>';

  for (let col = 0; col < COLUMN_COUNT; col++) {
    const headerCell = document.createElement('th');
    headerCell.textContent = columnLetter(col);
    headerRow.appendChild(headerCell);
  }

  const body = requireElement('spreadsheet-body');
  body.innerHTML = '';

  for (let row = 0; row < ROW_COUNT; row++) {
    const tableRow = document.createElement('tr');

    const rowHeader = document.createElement('th');
    rowHeader.textContent = String(row + 1);
    tableRow.appendChild(rowHeader);

    for (let col = 0; col < COLUMN_COUNT; col++) {
      const cell = document.createElement('td');
      cell.id = `cell-${cellId({ col, row })}`;
      cell.className = 'cell';
      tableRow.appendChild(cell);
    }

    body.appendChild(tableRow);
  }
}

renderGrid();
```

Click **▶ Preview**. A full grid appears: column letters `A` through `F`
along the top, row numbers `1` through `10` down the side, and sixty empty,
bordered cells filling the space between them.

**Walkthrough — `requireElement`, and why it exists instead of using
`document.getElementById` directly everywhere.** TypeScript knows
`document.getElementById` might genuinely find nothing — its real return
type is `HTMLElement | null`, a union (properly introduced in lesson 04)
meaning "one of these two possibilities." Calling `.innerHTML` directly on
that result would be calling it on something that might be `null`, and
Monaco correctly refuses to allow that. `requireElement` checks once,
inside itself: `if (!element) { throw new Error(...); }` stops the function
immediately if nothing was found, with a clear message naming exactly which
id failed — and because that `throw` runs first, every line *after* it
inside `requireElement` executes only when `element` is guaranteed to be
real, letting the function's own return type honestly promise a plain
`HTMLElement`, never a possibly-`null` one, to whatever calls it.

**CS lens — this is type narrowing, your first real example of it.**
Before the `if` check, TypeScript treats `element` as possibly `null` — the
full, honest type `getElementById` actually returns. After a check that
provably rules `null` out (an `if (!element)` that `throw`s, guaranteeing
the rest of the function can only run when `element` is truthy), TypeScript
**narrows** its understanding of the variable's type for every line that
follows, from "maybe null" to "definitely a real element." You did not
have to tell Monaco this explicitly — it worked it out from the shape of
your own `if` check. Lesson 04's `switch` statement over a `Cell` does the
exact same kind of narrowing, at a larger scale.

`renderGrid(): void` — `void` is the return type for a function that does
not return a value at all; it exists purely for its side effects (building
DOM elements and inserting them into the page). Stating `void` explicitly
communicates "calling this for its return value would be a mistake — it
does not have one," the same way `string` on `columnLetter` communicates
what *is* safe to expect back.

`headerRow.innerHTML = '<th></th>'` and `body.innerHTML = ''` clear out
whatever either container held before rebuilding it — the identical reason
`container.textContent = ''` appeared at the very start of Video Notes'
own lesson 02, so that calling `renderGrid()` a second time later in this
project (which real edits will require) never leaves duplicate old cells
behind alongside new ones.

**SE lens — `cell.id` follows a naming convention deliberately.** Every
cell's DOM `id` is `cell-` followed by its real spreadsheet coordinate —
`cell-A1`, `cell-F10` — rather than an arbitrary, meaningless counter. This
means any later code that needs to find a specific cell's element can
compute its id directly from a `Coordinate`, via the exact same `cellId()`
function already written, instead of needing a separate lookup table
mapping coordinates to DOM elements.

---

## Connect the Pieces

```
index.html   #spreadsheet, #header-row, #spreadsheet-body — empty
             containers, filled entirely by script.ts
script.ts    Coordinate, CellId — the two smallest types this project
             defines; columnLetter(), cellId() — pure functions with no
             dependency on the DOM at all
             requireElement(), renderGrid() — the only two functions that
             actually touch the page
```

---

## What Breaks Without This

**Typing a raw id string like `"cell-A1"` by hand somewhere later instead
of calling `cellId(coordinate)`:** A single typo — `"cell-A!"` , `"cell-a1"`
(wrong case) — silently fails to match any real element, and nothing warns
you, because a plain string carries no guarantee about what it should
contain. Every future lesson that needs a cell's id calls `cellId()`
instead, specifically to make this class of mistake structurally
impossible rather than merely unlikely.

**Without the `if (!element) { throw ... }` guard inside `requireElement`:**
Misspell an id anywhere — `requireElement('header-rowx')` — and
`document.getElementById` quietly returns `null`. The very next line,
`.innerHTML = ...`, throws `Cannot set properties of null`, a real crash,
but one pointing at a generic DOM error deep inside `renderGrid` rather
than clearly naming which id was actually wrong.

---

## Definition of Done

- [ ] Renaming `script.js` to `script.ts` is done, and Monaco is checking the file
- [ ] Clicking ▶ Preview shows a full 6×10 grid with correct column letters and row numbers
- [ ] Every cell's real DOM id follows the `cell-A1` pattern, verified by inspecting one in the browser's DevTools
- [ ] You can explain the difference between an `interface` and a `type` alias, and why this project uses each where it does
- [ ] You can explain what `HTMLElement | null` means as `getElementById`'s real return type, and how `requireElement` turns it into a plain `HTMLElement`
- [ ] You can explain what type narrowing is, using `requireElement`'s `if` check as the example

---

*Next: Lesson 02 — Selecting a Cell. Click any cell, and it highlights —
the first piece of real state this project tracks, and the first type
that is deliberately allowed to be "nothing at all."*
