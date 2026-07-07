# TypeScript Spreadsheet — Lesson 16 — Cell Styles

## What You Will Build

Select a cell, click "B," and its text turns bold. Click "I" for italic,
or pick a colour: each applies independently, and each survives being
toggled without disturbing the others. This lesson extends the same
metadata-separate-from-value idea lesson 15 introduced, this time using a
real `interface`, optional properties, and `Partial<T>` — updating just
one style field at a time without needing to restate every other one.

---

## What You Need to Know First

Lesson 15 left `cellFormats: Record<CellId, CellFormat>` as display
metadata kept entirely separate from `cells`.

---

## Step 1 — A Shape for a Cell's Style

**The problem:** Nothing yet describes what visual styling a cell can
have.

Add to `script.ts`:

```typescript
interface CellStyle {
  bold: boolean;
  italic: boolean;
  color?: string;
}

const cellStyles: Record<CellId, CellStyle> = {};

function getCellStyle(id: CellId): CellStyle {
  return cellStyles[id] ?? { bold: false, italic: false };
}

function updateCellStyle(id: CellId, updates: Partial<CellStyle>): void {
  const current = getCellStyle(id);
  cellStyles[id] = { ...current, ...updates };
}
```

**Walkthrough — `color?: string`, an optional property.** The `?` before
the colon means this field can be **omitted entirely** — `{ bold: true,
italic: false }`, with no `color` field at all, is a completely valid
`CellStyle`. This is different from writing `color: string | undefined`,
which would *require* the field to be present, even if its value is
`undefined` — a subtle but real distinction: one says "this key might not
exist," the other says "this key exists, and might hold nothing."
`color` is optional because a cell with no colour override is the normal,
expected case; forcing every cell's style to explicitly declare "no
colour" would add noise for no benefit.

**Walkthrough — `Partial<CellStyle>`, a second generic utility type.**
Lesson 03 used `Record<K, V>`; `Partial<CellStyle>` is a different
built-in generic: it produces a *new* type identical to `CellStyle`, but
with every field made optional, whether it originally was or not.
`updateCellStyle(id, { bold: !current.bold })` can therefore pass just
one field, `bold`, without needing to also restate `italic` and `color`
— `Partial<CellStyle>` is precisely "some subset of a `CellStyle`'s
fields, however many," which is exactly what "toggle one style property"
needs to accept.

**Walkthrough — merging with the spread operator, again.**
`{ ...current, ...updates }` is the same object-merge pattern this
project's sibling series used for loading preferences with defaults:
copy every field from `current` first, then copy every field from
`updates` on top, so any field actually present in `updates` wins, and
every field *not* mentioned in `updates` keeps its existing value from
`current` untouched.

---

## Step 2 — Apply the Style When Rendering

**The problem:** `cellStyles` can be read and written, but `renderCell`
never applies any of it visually.

Update `renderCell`'s non-editing branch in `script.ts`:

```typescript
} else {
  element.textContent = displayCell(cell, cellId(coordinate));

  const style = getCellStyle(cellId(coordinate));
  element.style.fontWeight = style.bold ? 'bold' : 'normal';
  element.style.fontStyle = style.italic ? 'italic' : 'normal';
  element.style.color = style.color ?? '';
}
```

Click **▶ Preview** — nothing looks different yet, since no style has
been set on any cell.

**Walkthrough:** `element.style.color = style.color ?? ''` sets the
inline CSS `color` property directly to the stored colour, or to an
empty string when none is set — an empty string is CSS's own way of
saying "remove this inline override, fall back to whatever the
stylesheet already says," which correctly resets a cell's colour the
moment its style is cleared.

---

## Step 3 — Wire Up the Controls

**The problem:** Nothing yet lets a person actually change a cell's
style.

Update the HTML tab, adding controls near the format dropdown:

```html
<button id="bold-button">B</button>
<button id="italic-button">I</button>
<input type="color" id="color-input" />
```

Add to `script.ts`:

```typescript
requireElement('bold-button').addEventListener('click', () => {
  if (!selectedCoordinate) {
    return;
  }
  const id = cellId(selectedCoordinate);
  updateCellStyle(id, { bold: !getCellStyle(id).bold });
  renderCell(selectedCoordinate);
});

requireElement('italic-button').addEventListener('click', () => {
  if (!selectedCoordinate) {
    return;
  }
  const id = cellId(selectedCoordinate);
  updateCellStyle(id, { italic: !getCellStyle(id).italic });
  renderCell(selectedCoordinate);
});

requireElement('color-input').addEventListener('change', (event) => {
  if (!selectedCoordinate) {
    return;
  }
  const input = event.target as HTMLInputElement;
  updateCellStyle(cellId(selectedCoordinate), { color: input.value });
  renderCell(selectedCoordinate);
});
```

Click **▶ Preview**, select a cell, and click "B": it turns bold, with
its colour and italic state completely unaffected. Pick a colour: it
applies without disturbing bold or italic.

**Walkthrough — `<input type="color">`, a native colour picker.** This
specialised input type gives every browser's own built-in colour-picker
UI, for free — clicking it opens a real picker, and `.value` always
reads back as a hex string like `"#ff0000"`, regardless of how the
person actually chose it (a colour wheel, RGB sliders, a saved swatch).

**Walkthrough — `!getCellStyle(id).bold`, toggling exactly one field.**
`getCellStyle(id)` returns the cell's current style, defaulting to
`{ bold: false, italic: false }` if nothing was ever set. `!...bold`
flips whichever boolean that field currently holds. Passing just `{ bold:
... }` into `updateCellStyle` — thanks to `Partial<CellStyle>` — leaves
`italic` and `color` exactly as they already were, merged in
automatically by the spread inside `updateCellStyle` itself.

---

## Connect the Pieces

```
index.html   #bold-button, #italic-button, #color-input — new controls,
             each changing one field of the selected cell's style
script.ts    CellStyle, cellStyles — a third independent metadata table,
             alongside cells and cellFormats
             updateCellStyle() — the only place a style is ever changed,
             using Partial<CellStyle> to accept a partial update
```

---

## What Breaks Without This

**Requiring every field in `updateCellStyle`'s parameter (changing
`Partial<CellStyle>` to plain `CellStyle`):** Clicking "B" would need to
also specify `italic` and `color` explicitly, every time, even though
neither is changing — and worse, it would have to know the cell's
*current* italic and colour values just to pass them back unchanged,
duplicating exactly what `updateCellStyle`'s own spread-merge already
does automatically.

**Setting `color: ''` as a required default in `CellStyle` instead of
making it optional:** Every cell, styled or not, would need a real
`color` field from the moment it is first created — `getCellStyle`'s
fallback object would need `color: ''` added to it too, and every place
checking "does this cell have a custom colour" would need to compare
against the empty string instead of simply checking whether the field
exists at all.

---

## Definition of Done

- [ ] Bold, italic, and colour can each be toggled independently for the selected cell
- [ ] Changing one style property never resets or disturbs the others
- [ ] You can explain the difference between `color?: string` and `color: string | undefined`
- [ ] You can explain what `Partial<CellStyle>` produces and why `updateCellStyle` needs it
- [ ] You can explain why `getCellStyle` returns a default object instead of `undefined` when a cell has no stored style yet

---

*Next: Lesson 17 — Saving and Loading. Reload the page, and every cell,
formula, format, and style survives — the first time this project asks
`JSON.stringify` to serialize something more complex than a single flat
object.*
