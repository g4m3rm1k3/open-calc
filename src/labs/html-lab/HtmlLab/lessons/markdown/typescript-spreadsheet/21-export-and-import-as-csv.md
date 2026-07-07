# TypeScript Spreadsheet — Lesson 21 — Export and Import as CSV

## What You Will Build

A "Download CSV" button saves the whole grid as a real `.csv` file — the
same format Excel, Google Sheets, and every spreadsheet tool can open. An
"Import CSV" control reads one back in. This lesson writes a second real
parser — much smaller than the formula one, but built the same way,
character by character — and uses `async`/`await` for the first time in
this project, reading a file's contents as something to wait for, not
something delivered through a callback.

---

## What You Need to Know First

Lesson 20 left this project split across five files, with `spreadsheet.ts`
owning all state and rendering.

---

## Step 1 — Export the Grid as CSV

**The problem:** Nothing turns this project's grid into the plain,
comma-separated text format `.csv` actually is.

Add to `spreadsheet.ts`:

```typescript
function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function exportToCsv(): string {
  const rows: string[] = [];

  for (let row = 0; row < ROW_COUNT; row++) {
    const rowValues: string[] = [];
    for (let col = 0; col < COLUMN_COUNT; col++) {
      const id = cellId({ col, row });
      rowValues.push(csvEscape(displayCell(cells[id], id)));
    }
    rows.push(rowValues.join(','));
  }

  return rows.join('\n');
}
```

Add a button to the HTML tab and wire it up in `spreadsheet.ts`:

```html
<button id="export-csv-button">Download CSV</button>
```

```typescript
requireElement('export-csv-button').addEventListener('click', () => {
  const csv = exportToCsv();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'spreadsheet.csv';
  link.click();

  URL.revokeObjectURL(url);
});
```

Click **▶ Preview**, fill in a few cells, and click "Download CSV": a
real `.csv` file downloads, readable by any spreadsheet program.

**Walkthrough — `csvEscape`, and why a comma inside a value is a real
problem.** CSV uses commas to separate fields — a cell whose *own text*
contains a comma would be misread as two separate fields unless something
distinguishes it. Wrapping a value in quotes when it contains a comma
(or a quote, or a newline) tells any CSV reader "treat everything between
these quotes as one field, commas included." `value.replace(/"/g, '""')`
doubles any quote character already inside the value — the standard CSV
convention for "this is a literal quote character, not the end of the
field" — before the whole thing gets wrapped in its own surrounding pair
of quotes.

**Walkthrough — exporting `displayCell`'s output, not the raw formula.**
CSV has no concept of a formula at all — every cell in a `.csv` file is
just text. Exporting the *computed*, displayed value (`20`, not `=A1+B1`)
means the exported file is genuinely usable by any other program, showing
the same numbers this project shows, at the cost of losing the formulas
themselves — a real, honest trade-off worth stating plainly rather than
leaving implicit.

---

## Step 2 — A Small CSV Parser

**The problem:** Reading a `.csv` file back in requires understanding its
format well enough to reverse `csvEscape` — splitting on commas naively
would break the moment a quoted field contains one.

Add to `spreadsheet.ts`:

```typescript
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let insideQuotes = false;
  let position = 0;

  while (position < line.length) {
    const character = line[position];

    if (insideQuotes) {
      if (character === '"' && line[position + 1] === '"') {
        current += '"';
        position += 2;
        continue;
      }
      if (character === '"') {
        insideQuotes = false;
        position++;
        continue;
      }
      current += character;
      position++;
      continue;
    }

    if (character === '"') {
      insideQuotes = true;
      position++;
      continue;
    }

    if (character === ',') {
      fields.push(current);
      current = '';
      position++;
      continue;
    }

    current += character;
    position++;
  }

  fields.push(current);
  return fields;
}
```

**Walkthrough — this project's second hand-written parser, much smaller
than the first.** `parseCsvLine` uses the exact same shape `tokenize`
(lesson 06) did: a `position` index, a character-by-character scan,
explicit state (`insideQuotes`) tracking what the parser currently
believes it is looking at. `line[position + 1] === '"'` looks one
character *ahead* without consuming it yet — the same kind of lookahead
`parseArgument` used in lesson 10, here deciding between "this is an
escaped quote inside the field" and "this is the field's actual closing
quote," which look identical one character at a time without checking
what comes immediately after.

`fields.push(current);` after the loop ends catches the *last* field —
nothing after it triggers the comma-handling branch, so it would
otherwise never be added to `fields` at all.

---

## Step 3 — Read a File and Apply It

**The problem:** Reading a file's contents is genuinely asynchronous —
the browser has to actually access disk, which does not happen instantly
— and this project has not yet used the language features built for
that.

Add to `spreadsheet.ts`:

```typescript
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
```

Add a file input and wire it up:

```html
<input type="file" id="import-csv-input" accept=".csv" />
```

```typescript
requireElement('import-csv-input').addEventListener('change', async (event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    return;
  }

  const text = await readFileAsText(file);
  const lines = text.split('\n').filter((line) => line.length > 0);

  recordHistory();

  for (let row = 0; row < lines.length && row < ROW_COUNT; row++) {
    const fields = parseCsvLine(lines[row]);
    for (let col = 0; col < fields.length && col < COLUMN_COUNT; col++) {
      const coordinate = { col, row };
      const id = cellId(coordinate);
      cells[id] = parseRawInput(fields[col]);
      updateDependencies(coordinate, cells[id]);
    }
  }

  valueCache.clear();
  renderAllCells();
  saveSpreadsheet();
});
```

Click **▶ Preview**, export a CSV, clear a few cells, then import that
same file back in: the grid is restored.

**Walkthrough — `Promise<string>`, a value that arrives later.** A
`Promise` represents a result that is not ready yet, but will be —
`new Promise((resolve, reject) => { ... })` takes an **executor**
function, given two functions of its own: call `resolve(value)` once the
real result is ready, or `reject(error)` if something went wrong instead.
`readFileAsText` wraps `FileReader`'s older, callback-based API (`reader.
onload`, first used in Video Notes lesson 19) inside a `Promise` — the
underlying browser API has not changed at all; this function simply gives
it a more modern shape to be called with.

**Walkthrough — `async`/`await`.** Marking the event listener `async`
means it is always allowed to use `await` inside it, and always itself
returns a `Promise`, whether or not it explicitly says so. `await
readFileAsText(file)` pauses this specific function at exactly that line
— *not* the whole page, not any other code running elsewhere — until the
promise resolves, then continues with `text` holding the real string
directly, as if `readFileAsText` had simply returned it immediately. This
reads like ordinary, top-to-bottom synchronous code, even though real
time genuinely passes while the browser reads the file from disk.

**Walkthrough — `input.files?.[0]`, optional chaining.** `input.files` is
a `FileList | null` — `null` specifically when nothing has been selected
yet. `?.[0]` — **optional chaining** — reads index `0` only if `input.
files` is not `null` or `undefined`; if it is, the whole expression
short-circuits to `undefined` immediately, without throwing, the same
protective spirit as every `if (!x)` guard this project has used since
lesson 01, expressed as its own dedicated operator instead.

---

## Connect the Pieces

```
spreadsheet.ts   exportToCsv(), csvEscape() — grid to text
                 parseCsvLine() — this project's second hand-written
                 parser, structurally identical in spirit to tokenize()
                 readFileAsText() — wraps an older callback API in a
                 Promise; the import handler awaits it directly
```

---

## What Breaks Without This

**Splitting an imported line on a plain `line.split(',')` instead of
`parseCsvLine`:** Export a cell containing the text `"hello, world"`
(with a comma inside it — `csvEscape` would have wrapped it in quotes on
export). A naive split on every comma breaks that one field into two,
shifting every subsequent column in that row over by one.

**Forgetting `async` on the event listener while still using `await`
inside it:** Monaco itself refuses to compile this — `await` is only
valid inside a function explicitly marked `async`, a real, checked rule,
not just a convention.

---

## Definition of Done

- [ ] "Download CSV" produces a real, valid `.csv` file readable by other spreadsheet programs
- [ ] A value containing a comma exports correctly, wrapped in quotes, and re-imports as the exact same text
- [ ] Importing a CSV file replaces the grid's contents and can itself be undone with Ctrl+Z
- [ ] You can explain what a `Promise` represents and why `readFileAsText` wraps `FileReader` in one
- [ ] You can explain what `await` actually pauses, and what it does not
- [ ] You can explain what `?.` does differently from a plain `.`, using `input.files?.[0]` as the example

---

*Next: Lesson 22 (optional) — From Functions to a Class. The same
behaviour, reorganised around a `Spreadsheet` class — motivated by real,
felt repetition across the state this project has been managing as
independent variables since lesson 01.*
