# TypeScript Spreadsheet — Lesson 04 — Numbers and Text

## What You Will Build

Type `12` into a cell, and it becomes a real number. Type `hello`, and it
stays real text. Nothing about how you interact with the grid changes —
you still double-click, type, and press Enter exactly as lesson 03 built.
What changes is what this project *understands* about what it is holding:
every cell's value is now honestly one of two distinct, mutually exclusive
shapes, and the type system knows the difference. This is the type this
entire project is built around, and everything from lesson 05 onward adds
a new shape to it.

---

## What You Need to Know First

Lesson 03 left `rawValues: Record<CellId, string>` storing whatever text
was typed into a cell, displayed as-is by `renderCell`.

---

## Step 1 — A Type That Is Honestly One of Two Things

**The problem:** `rawValues` stores every cell's content as a plain
string, whether `"12"` was typed or `"hello"` was — nothing distinguishes a
number a person almost certainly wants to do arithmetic with later from
text that just happens to be sitting in a cell.

Add to `script.ts`, replacing the `rawValues` declaration:

```typescript
type Cell =
  | { kind: 'number'; value: number }
  | { kind: 'text'; value: string };

const cells: Record<CellId, Cell> = {};
```

**Walkthrough — a discriminated union, TypeScript's answer to "this is
one of several distinct shapes."** `Cell` is a union of two object types,
exactly like `Coordinate | null` from lesson 02 — except here, both sides
of the union are real object shapes, not one object and `null`. Each side
carries a `kind` field set to one specific, exact string — `'number'` on
the first, `'text'` on the second — never just `string` in general. This
"tag" field is what makes the union **discriminated**: given any real
`Cell` value, checking its `kind` tells you, with certainty, exactly which
of the two shapes you are holding, and therefore exactly what its `value`
field actually contains.

Both variants deliberately share the same field name, `value`, holding a
different type in each — `number` in one, `string` in the other. This is a
real design choice, not an accident: it means any code that has already
checked `kind` can read `.value` the same way regardless of which variant
it turned out to be, which will matter more as `Cell` grows a third shape
in lesson 05.

`const cells: Record<CellId, Cell>` replaces the old `rawValues` — the
lookup table now maps every cell id to a real `Cell`, not a raw string.

---

## Step 2 — Turn Typed Text Into a Real Cell

**The problem:** Nothing yet decides whether a freshly typed string should
become a number or text.

Add to `script.ts`:

```typescript
function parseRawInput(rawInput: string): Cell {
  const trimmed = rawInput.trim();
  const numericValue = Number(trimmed);

  if (trimmed !== '' && !Number.isNaN(numericValue)) {
    return { kind: 'number', value: numericValue };
  }

  return { kind: 'text', value: rawInput };
}
```

**Walkthrough — `Number(trimmed)`, and why it was chosen over the more
lenient `parseFloat`.** `Number(string)` converts a string to a number,
but strictly: the *entire* string must be a valid number, or the result is
the special value `NaN` ("Not a Number"). `Number("12")` is `12`;
`Number("12abc")` is `NaN` — the trailing letters make the whole thing
invalid, rather than being silently ignored. This strictness is exactly
right here: a cell containing `"12abc"` is honestly text someone typed,
not the number 12 with garbage after it, which is what the more lenient
`parseFloat("12abc")` (returning `12`) would have wrongly implied.

**Walkthrough — `Number.isNaN`, and a real, classic JavaScript trap it
avoids.** `Number.isNaN(value)` returns `true` only when `value` genuinely
*is* the special `NaN` value. This is different from the older, global
`isNaN(value)` function, which first tries to *convert* its argument to a
number before checking — `isNaN("hello")` is `true` (because converting
`"hello"` to a number produces `NaN`), but so is `isNaN(undefined)`, and a
whole category of inputs nobody meant to ask about. `Number.isNaN`, used
here, only ever answers the one question actually being asked: "is this
specific value NaN?"

**Walkthrough — `trimmed !== ''`, guarding against a genuine quirk.**
`Number('')` is not `NaN` — it is `0`. An empty string converts to zero,
a real, well-known surprise in JavaScript. Without checking `trimmed !==
''` first, clearing a cell's text entirely (typing nothing) would silently
turn it into the *number* zero, rather than empty text — a real, wrong
result this one extra check exists specifically to prevent.

---

## Step 3 — Display a Cell, Narrowing on Its `kind`

**The problem:** `renderCell` still expects a plain string to display —
it has no way to turn a real `Cell` back into text.

Add to `script.ts`:

```typescript
function displayCell(cell: Cell | undefined): string {
  if (!cell) {
    return '';
  }

  switch (cell.kind) {
    case 'number':
      return cell.value.toString();
    case 'text':
      return cell.value;
  }
}
```

Update `renderCell` and `commitEdit` in `script.ts` to use `cells` and
these two new functions instead of `rawValues` directly:

```typescript
function renderCell(coordinate: Coordinate): void {
  const element = requireElement(`cell-${cellId(coordinate)}`);
  element.innerHTML = '';

  const isEditing = editingCoordinate !== null
    && editingCoordinate.col === coordinate.col
    && editingCoordinate.row === coordinate.row;

  const cell = cells[cellId(coordinate)];

  if (isEditing) {
    const input = document.createElement('input');
    input.className = 'cell-input';
    input.value = displayCell(cell);

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
    element.textContent = displayCell(cell);
  }
}

function commitEdit(coordinate: Coordinate, rawInput: string): void {
  cells[cellId(coordinate)] = parseRawInput(rawInput);
  editingCoordinate = null;
  renderCell(coordinate);
}
```

Click **▶ Preview**. Type `12` into a cell and press Enter: it displays as
`12`, exactly as before — but type `12` into a *different* cell, then look
at what `typeof` would call it: it is now genuinely a number. Type `hello`
into a third cell: it stays text. Nothing looks different yet — lesson 07
is where a real number, stored as a real number, finally starts to matter
visibly.

**Walkthrough — `cell: Cell | undefined`, the same honest gap from lesson
03, now on a richer type.** `cells[cellId(coordinate)]` is typed by
TypeScript as a plain `Cell` — `Record`'s index signature does not, by
default, admit that a key might be missing. But a cell nothing has ever
been typed into genuinely has no entry in `cells` at all, and looking one
up genuinely returns `undefined` at runtime. `displayCell` states this
honestly in its own parameter type, `Cell | undefined`, rather than
trusting `Record`'s optimism — the exact same gap lesson 03's `??` defended
against, handled here with an explicit `if (!cell) { return ''; }` instead.

**Walkthrough — the `switch` statement, and why this is real type
narrowing, not just a display detail.** Inside `case 'number':`, TypeScript
knows — not by guessing, but by proving it from the code's own structure —
that `cell` can *only* be the `{ kind: 'number'; value: number }` branch
of the union at that exact point, so `cell.value` is known to be a real
`number`, and `.toString()` is safe to call on it. Inside `case 'text':`,
the same narrowing proves `cell.value` is a `string`. Try writing
`cell.value.toUpperCase()` inside the `'number'` case: Monaco immediately
flags it, because a `number` genuinely has no `.toUpperCase()` method —
this is the type system actively preventing a real category of mistake,
using nothing more than the `kind` tag you already had to write anyway.

**CS lens — this is the practical answer to "why do discriminated unions
exist?"** Without the `kind` tag, `Cell` would have to be something like
`{ value: number | string }` — and *every* piece of code touching `.value`
would need its own separate check, unrelated to any other, to figure out
which one it actually got. The `kind` field turns "what am I holding?"
into one small, structured question, asked once per function, that
TypeScript itself can then verify was asked correctly.

**SE lens — one function, reused everywhere a cell needs to become text.**
`displayCell` is called from two different places inside `renderCell` —
populating an editing input's starting text, and showing a cell's plain
display text — and for now, both calls produce identical output, because a
number or a string, shown plainly, has no reason yet to look different in
one context versus the other. That will not stay true once formulas exist
in lesson 05, which is exactly why this single-function design matters
now: whatever changes there, there is exactly one place responsible for
"what does this cell look like as text."

---

## Connect the Pieces

```
script.ts    Cell — a discriminated union: { kind: 'number'; value:
             number } | { kind: 'text'; value: string }
             cells: Record<CellId, Cell> — replaces rawValues entirely
             parseRawInput() — the only place raw typed text becomes a
             real Cell
             displayCell() — the only place a Cell becomes text again,
             called for both editing and plain display
```

---

## What Breaks Without This

**Removing the `trimmed !== ''` check from `parseRawInput`:** Double-click
a cell that already has "hello" typed into it, select all the text, delete
it, and press Enter. `Number('')` is `0`, not `NaN` — the cell silently
becomes the number `0` instead of empty, even though nothing that looks
like a number was actually typed.

**Trying `cell.value.toUpperCase()` inside the `'number'` case of
`displayCell`'s switch, on purpose:** Monaco shows a real error —
`Property 'toUpperCase' does not exist on type 'number'` — immediately,
before Preview ever runs. This is the type narrowing from Step 3 doing
exactly its job: it does not just help you write correct code, it actively
stops a specific, real category of mistake at the moment you make it.

---

## Definition of Done

- [ ] Typing a number into a cell stores it as a real `{ kind: 'number' }` value
- [ ] Typing anything else stores it as `{ kind: 'text' }`
- [ ] Clearing a cell's text entirely results in empty text, never the number `0`
- [ ] You can explain what makes a union "discriminated," using `Cell`'s `kind` field as the example
- [ ] You can explain why `Number(trimmed)` was chosen over `parseFloat`, using `"12abc"` as the concrete example
- [ ] You can explain the real difference between `Number.isNaN` and the older global `isNaN`
- [ ] You can trigger a real Monaco type error on purpose by calling a string-only method inside the `'number'` case, and explain exactly why TypeScript catches it

---

*Next: Lesson 05 — Formulas Appear. Typing `=anything` is recognised and
stored as a third kind of cell — the moment `Cell` grows past two shapes,
and the exact moment "what should TypeScript do if I forget a case?"
becomes a real question with a real, checkable answer.*
