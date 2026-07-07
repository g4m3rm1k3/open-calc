# TypeScript Spreadsheet — Lesson 15 — Number Formatting

## What You Will Build

Select a cell holding `19.999`, choose "Currency" from a new dropdown, and
it displays `$20.00` — while the cell's *actual, stored* value stays
exactly `19.999`, unrounded, still usable in any formula that references
it. This is the first feature since lesson 09 that touches only *how* a
value is shown, never what it actually computes to — a real, meaningful
distinction this lesson makes concrete.

---

## What You Need to Know First

Lesson 14 left every cell's value computed through `lookupCellValue`,
cached in `valueCache`, and displayed by `displayCell`.

---

## Step 1 — A Type for How a Number Should Look

**The problem:** Nothing distinguishes "the number this cell holds" from
"how that number should be displayed" — right now, those have always
been the same thing.

Add to `script.ts`:

```typescript
type CellFormat = 'plain' | 'currency' | 'percentage';

const cellFormats: Record<CellId, CellFormat> = {};

function formatNumber(value: number, format: CellFormat): string {
  switch (format) {
    case 'plain':
      return value.toString();
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    case 'percentage':
      return new Intl.NumberFormat('en-US', { style: 'percent' }).format(value);
    default:
      return assertNever(format);
  }
}
```

**Walkthrough — `CellFormat`, a string literal union with no object shape
at all.** Unlike `Cell` or `Token`, `CellFormat` is not a discriminated
union of object variants — it is simply three exact allowed strings.
`cellFormats: Record<CellId, CellFormat>` is a second, independent lookup
table, entirely separate from `cells` — a cell's format is metadata
*about* its display, not part of what the cell actually *is*, the same
separation `preferences` kept from `videos` in this project's sibling
series.

**Walkthrough — `Intl.NumberFormat`, a real browser API doing real
formatting work.** `new Intl.NumberFormat('en-US', { style: 'currency',
currency: 'USD' })` constructs a formatter — `'en-US'` is a **locale**,
telling it which regional conventions to use (decimal points versus
commas, where a currency symbol goes); `{ style: 'currency', currency:
'USD' }` is an options object choosing what *kind* of formatting to
apply. `.format(value)` then turns a plain number into a correctly
formatted string — `19.999` becomes `"$20.00"`, rounded to two decimal
places and prefixed with a currency symbol, entirely handled by the
browser's own, already-correct implementation of a genuinely tricky
problem (currency and percentage formatting differ meaningfully across
regions in ways easy to get subtly wrong by hand).

---

## Step 2 — Apply Formatting When Displaying

**The problem:** `formatNumber` exists, but `displayCell` never calls it.

Update `displayCell` in `script.ts`:

```typescript
function displayCell(cell: Cell | undefined, ownId: CellId): string {
  if (!cell) {
    return '';
  }

  const format = cellFormats[ownId] ?? 'plain';

  switch (cell.kind) {
    case 'number':
      return formatNumber(cell.value, format);
    case 'text':
      return cell.value;
    case 'formula': {
      const parseResult = parse(tokenize(cell.expr));
      if (parseResult.success === false) {
        return '#ERROR';
      }

      const result = evaluate(parseResult.ast, (name) => lookupCellValue(name, new Set([ownId])));
      return result.kind === 'success' ? formatNumber(result.value, format) : '#ERROR';
    }
    default:
      return assertNever(cell);
  }
}
```

**Walkthrough — why `'text'` cells are untouched.** Formatting only
makes sense for something that is honestly a number — `formatNumber` is
never even called in the `'text'` case. This is `displayCell`'s `switch`
doing the same job it always has: deciding, per variant, exactly what
applies and what does not, rather than forcing one behaviour onto every
kind of cell uniformly.

---

## Step 3 — Choose a Format

**The problem:** `cellFormats` can be read, but nothing ever writes to
it.

Update the HTML tab, adding a format dropdown near the settings area:

```html
<select id="format-select">
  <option value="plain">Plain</option>
  <option value="currency">Currency</option>
  <option value="percentage">Percentage</option>
</select>
```

Add to `script.ts`:

```typescript
requireElement('format-select').addEventListener('change', (event) => {
  if (!selectedCoordinate) {
    return;
  }

  const select = event.target as HTMLSelectElement;
  cellFormats[cellId(selectedCoordinate)] = select.value as CellFormat;
  renderCell(selectedCoordinate);
});
```

Click **▶ Preview**, select a cell holding a number, and choose
"Currency": it reformats immediately. Reference that same cell from a
formula elsewhere (`=A1*2`, if A1 is the formatted cell): the formula
computes using A1's real, unrounded value, completely unaffected by how
A1 happens to be *displayed*.

**Walkthrough — `as HTMLSelectElement`, a real type assertion, used for
the first time in this project.** `event.target`'s real type is a broad,
generic `EventTarget | null` — TypeScript cannot know, just from the
event system itself, that this specific listener happens to be attached
to a `<select>` element specifically. `as HTMLSelectElement` is a **type
assertion**: it tells TypeScript "trust me, I know this is more specific
than you can prove," with *no* runtime check backing it up at all — unlike
every `if (!element)` guard this project has used since lesson 01, which
actually verifies something before trusting it. This assertion is
reasonable here specifically because this exact listener is only ever
attached to the one real `<select id="format-select">` this project's
own HTML defines — `event.target`, inside *this* handler, structurally
can only ever be that one element.

`select.value as CellFormat` is a second assertion: `.value` on any
`<select>` is typed as plain `string` by the browser's own type
definitions, since HTML has no way to promise which exact strings a
person might see. Asserting it as `CellFormat` assumes every `<option>`
in this dropdown's HTML uses one of the three exact values `CellFormat`
allows — true today, because this project's own HTML was written to
match, but a real risk if the two were ever edited independently without
each other in mind. A stricter version of this project might validate the
string at runtime instead of asserting it; this project accepts the small
risk, stated honestly, in exchange for simplicity.

---

## Connect the Pieces

```
index.html   #format-select — a new control, changing metadata about the
             selected cell, never its actual stored value
script.ts    CellFormat, cellFormats — display metadata, kept entirely
             separate from cells, the same separation preferences kept
             from videos in this project's sibling series
             formatNumber() — the only place a CellFormat actually
             changes what a string looks like
```

---

## What Breaks Without This

**Storing the formatted string directly in `cells` instead of keeping
`cellFormats` separate:** Format a cell as currency, showing `$20.00`,
then reference it from another formula. If the *stored* value had been
overwritten with the formatted string instead of kept as a real number
alongside separate format metadata, `=A1*2` would need to parse `"$20.00"`
back into a number just to do arithmetic — fragile, and completely
unnecessary, exactly why format and value were kept apart from the start.

**Removing the `if (!selectedCoordinate)` guard in the format-select
listener:** Change the dropdown before ever selecting a single cell.
`cellId(selectedCoordinate)` would run on `null`, and TypeScript itself
refuses to compile this — `selectedCoordinate` is typed `Coordinate |
null`, and `cellId` demands a real `Coordinate`, the same kind of
protection this project's very first union type provided back in lesson 02.

---

## Definition of Done

- [ ] A selected cell's format can be changed via the dropdown
- [ ] A formatted cell's display changes; its underlying stored value does not
- [ ] A formula referencing a formatted cell computes using its real, unrounded value
- [ ] Text cells are unaffected by format changes
- [ ] You can explain why `cellFormats` is a separate lookup table from `cells`, not a field added onto `Cell` itself
- [ ] You can explain what a type assertion is, and why `as HTMLSelectElement` here is a reasonable, if not perfectly safe, thing to write

---

*Next: Lesson 16 — Cell Styles. Bold, italic, and colour, applied per
cell — the same separation-of-metadata idea as formatting, extended to
`interface CellStyle`, optional properties, and `Partial<T>`.*
