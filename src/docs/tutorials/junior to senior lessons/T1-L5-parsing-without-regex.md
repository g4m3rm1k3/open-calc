# Junior to Senior — T1·L5 — Parsing Structured Text Without Regex

**Prerequisites:** T1·L4 (Node.js File I/O and Modules). You can read files.
This lesson covers how to extract structured data from text using only string
methods — no regular expressions needed for well-structured formats.

**What this lab adds:**
- `split`, `trim`, `map`, `filter` — the four core methods for text parsing
- Chaining array methods into a pipeline
- Handling edge cases: empty lines, extra whitespace, quoted fields
- Why structured formats should not be parsed with regex
- The state machine concept — introduced here for quoted CSV fields

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `'  Alice , alice@example.com , London  '.split(',')` — what does each
>    element contain? What method removes the extra whitespace?
> 2. What does `filter(Boolean)` do to an array of strings?
> 3. A CSV field contains a comma: `"Smith, John",john@example.com`. Why does
>    `line.split(',')` fail for this line?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A CSV validator that reads a contacts file, parses every row, and reports which
rows are valid and which have problems:

```
$ npx ts-node parse-contacts.ts

Parsing contacts.csv...

✓ Row 1: Alice <alice@example.com> — London
✓ Row 2: Bob <bob@example.com> — Paris
✗ Row 3: Missing email (got 2 fields, expected 3)
✓ Row 4: Charlie <charlie@example.com> — Berlin
✗ Row 5: Empty row skipped

Summary: 3 valid, 2 with issues
```

---

### Concept: `split`, `trim`, and the Parsing Pipeline

**What it is:** Three string methods form the core of text parsing:
- `str.split(delimiter)` — divides a string into an array at each delimiter
- `str.trim()` — removes leading and trailing whitespace
- `arr.map(fn)` — transforms each element (used to trim all parts at once)

**The problem before:**

Reading a CSV line character by character in a manual loop is tedious, hard
to read, and easy to get wrong:

```ts
// Manual approach — verbose, fragile:
function parseLineManual(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  for (const char of line) {
    if (char === ',') {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim()); // don't forget the last field
  return fields;
}
```

**The solution:**

```ts
// Split + trim — readable, correct for simple CSV:
function parseLine(line: string): string[] {
  return line.split(',').map(field => field.trim());
}
```

**What it hides:** The `split`/`map` pipeline hides the loop and the accumulator.
The intent — "divide by comma, trim each piece" — is expressed directly in
two method calls. No state to track, no off-by-one error possible.

The invariant: `split` always produces `n + 1` elements when there are `n`
occurrences of the delimiter. `'a,b,c'.split(',')` gives 3 elements.
`'a'.split(',')` gives 1 element (no delimiter found).

**Canonical example:** `split` is like a butcher's saw. You put the sausage
in, set the blade to comma-width, and get evenly divided pieces. `trim` is
the trim knife that removes fat from the edges of each piece. The butcher
(you) does not touch the meat piece by piece.

**Smallest possible example:**
```ts
const raw   = '  Alice , alice@example.com , London  ';
const parts = raw.split(',').map(p => p.trim());
// ['Alice', 'alice@example.com', 'London']
```

**You will see this again in:** Every CSV parser, every log file parser,
every configuration file reader, any time you extract structured data from
a string. `split`/`map`/`filter` is the canonical parsing pipeline in
every language — Python, Ruby, Go all use this same pattern.

**Watch for:** `'a,,b'.split(',')` gives `['a', '', 'b']` — the empty string
between the two commas is a valid array element. If you want to remove empty
fields, add `.filter(Boolean)` (which removes empty strings, `null`, and
`undefined`).

---

## Step 1 — Basic Line Parsing

Create `contacts-with-issues.csv`:

```
Alice,alice@example.com,London
Bob,bob@example.com,Paris
Charlie,charlie@example.com
Dave,dave@example.com,Berlin

Eve,eve@example.com,Madrid
```

Create `parse-contacts.ts`:

```ts
import * as fs   from 'fs';
import * as path from 'path';

console.log('Parsing contacts.csv...\n');

const csvPath  = path.join(__dirname, 'contacts-with-issues.csv');
const rawText  = fs.readFileSync(csvPath, 'utf-8');

// Split into lines — \r\n on Windows, \n on Mac/Linux:
const rawLines = rawText.split(/\r?\n/);

// Parse one line — split by comma and trim each field:
function parseLine(line: string): string[] {
  return line.split(',').map(field => field.trim());
}

// Test the parser on line 1:
const firstLine  = rawLines[0];
const firstParts = parseLine(firstLine);
console.log('First line raw:', JSON.stringify(firstLine));
console.log('First line parsed:', firstParts);
```

### SAVE AND TRY

```bash
npx ts-node parse-contacts.ts
```

Expected:
```
Parsing contacts.csv...

First line raw: "Alice,alice@example.com,London"
First line parsed: [ 'Alice', 'alice@example.com', 'London' ]
```

**Change something:** Change the CSV first line to `' Alice , alice@example.com , London '`
(spaces around everything). The `trim()` in `parseLine` removes them. Remove the `.map(f => f.trim())`
and run again — each field has leading/trailing spaces. Add it back.

---

### Concept: Building a Validation Pipeline

**What it is:** Chaining `map` and `filter` produces a pipeline where each
stage transforms or removes elements. The result of one stage feeds the next
without creating intermediate variables.

**The problem before:**

```ts
// Imperative — tracks multiple variables:
const results = [];
for (const line of rawLines) {
  const trimmed = line.trim();
  if (trimmed.length === 0) continue;
  const parts = trimmed.split(',').map(p => p.trim());
  if (parts.length !== 3) continue;
  results.push({ name: parts[0], email: parts[1], city: parts[2] });
}
```

**The solution:**

```ts
// Declarative pipeline — each step is one clear operation:
const contacts = rawLines
  .map(line => line.trim())              // trim each line
  .filter(line => line.length > 0)       // remove empty lines
  .map(line => line.split(',').map(f => f.trim())) // split each non-empty line
  .filter(parts => parts.length === 3)   // keep only 3-field rows
  .map(([name, email, city]) => ({ name, email, city })); // destructure to object
```

**Canonical example:** A pipeline is an assembly line. Blank lines go in the
reject bin at station 1 (filter). Lines with wrong field counts go in the
reject bin at station 2 (filter). What remains has exactly 3 fields — it gets
assembled into a Contact object at station 3 (map). The line goes through
every station in sequence.

**You will see this again in:** Data processing in every language. Python's
list comprehensions and generators. Unix pipes (`cat file | grep active | awk ...`).
React component props that chain transformations before display.

**Watch for:** Chaining many `map` and `filter` calls iterates the array multiple
times. For small data (< 10,000 items), this is fine. For large data, use `reduce`
or a single-pass approach.

---

## Step 2 — Validation Pipeline

Replace the content of `parse-contacts.ts` after the `parseLine` function:

```ts
interface Contact { name: string; email: string; city: string }
type ParseResult =
  | { kind: 'ok';    contact: Contact; rowNumber: number }
  | { kind: 'error'; message: string;  rowNumber: number };

function validateRow(parts: string[], rowNumber: number): ParseResult {
  if (parts.length !== 3) {
    return {
      kind: 'error',
      message: `Missing field (got ${parts.length} fields, expected 3)`,
      rowNumber,
    };
  }
  const [name, email, city] = parts;
  if (!email.includes('@')) {
    return { kind: 'error', message: `Invalid email: "${email}"`, rowNumber };
  }
  return { kind: 'ok', contact: { name, email, city }, rowNumber };
}

// Build results for every non-empty line:
const results: ParseResult[] = rawLines
  .map((line, index) => ({ line: line.trim(), rowNumber: index + 1 }))
  .filter(({ line }) => line.length > 0)            // skip blank lines
  .map(({ line, rowNumber }) => ({
    parts: parseLine(line),
    rowNumber,
  }))
  .map(({ parts, rowNumber }) => validateRow(parts, rowNumber));

// Report results:
let validCount   = 0;
let invalidCount = 0;

results.forEach(result => {
  if (result.kind === 'ok') {
    const { name, email, city } = result.contact;
    console.log(`✓ Row ${result.rowNumber}: ${name} <${email}> — ${city}`);
    validCount++;
  } else {
    console.log(`✗ Row ${result.rowNumber}: ${result.message}`);
    invalidCount++;
  }
});

console.log(`\nSummary: ${validCount} valid, ${invalidCount} with issues`);
```

### SAVE AND TRY

```bash
npx ts-node parse-contacts.ts
```

Expected:
```
Parsing contacts.csv...

✓ Row 1: Alice <alice@example.com> — London
✓ Row 2: Bob <bob@example.com> — Paris
✗ Row 3: Missing field (got 2 fields, expected 3)
✓ Row 4: Dave <dave@example.com> — Berlin
✓ Row 6: Eve <eve@example.com> — Madrid

Summary: 4 valid, 1 with issues
```

**Change something:** The blank line in the CSV (between Dave and Eve) is being
silently skipped. Add this to the filter step to report it instead of silently skip:
Track which original line number is blank. Hint: the `.map((line, index) => ...)` already
tracks the `rowNumber`. Can you add blank-line reporting?

---

### Concept: Why Regex Is Wrong for Structured Formats

**What it is:** Regular expressions match patterns in text. They are correct
for simple token patterns (does this string contain `@`?). They are wrong for
structured formats where the grammar has nesting, escaping, or stateful rules.

**The CSV quoting problem:**

```
Alice,alice@example.com,London            ← simple — split on comma works
"Smith, John",john@example.com,New York   ← comma inside quotes — split breaks!
"O'Brien, Pat","pat@example.com",Dublin   ← quote inside quotes — gets worse
```

A single regex for all valid CSV is notoriously complex:
```
/(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^,]*))(?:,|$)/g
```

Nobody can read or maintain this. It is also wrong for many edge cases.

**The correct solution:** A state machine.

**What a state machine is:** A system with a finite set of states and rules
for transitioning between them based on input. For CSV:

```
States:   FIELD_START, IN_UNQUOTED, IN_QUOTED, AFTER_QUOTE
Transitions:
  FIELD_START + '"'  → IN_QUOTED
  FIELD_START + ','  → emit field, → FIELD_START
  FIELD_START + char → IN_UNQUOTED
  IN_UNQUOTED + ','  → emit field, → FIELD_START
  IN_QUOTED   + '"'  → AFTER_QUOTE
  IN_QUOTED   + char → stay IN_QUOTED
  AFTER_QUOTE + '"'  → stay IN_QUOTED (escaped quote "")
  AFTER_QUOTE + ','  → emit field, → FIELD_START
```

Each character causes a state transition. The current state determines what
the character means. This is how all real CSV parsers work.

**The lesson:** For the simple CSV in this project (no quoted fields), `split`
is correct. For general-purpose CSV, use a library (`csv-parse`, `papaparse`)
rather than writing your own regex or state machine.

**What it hides:** The `csv-parse` library hides the state machine. It handles
all edge cases — quoted fields, escaped quotes, different delimiters, byte order
marks, multi-line fields — and has been tested by thousands of users.

**You will see this again in:** Every format that looks simple but has edge cases:
CSV, JSON (already have `JSON.parse`), XML (do not use regex), INI files,
G-code (the tokeniser in Topic 9 is a state machine).

---

## Step 3 — Introduce a Simple State Machine for Quoted Fields

```ts
console.log('\n--- Quoted Field Handling ---');

// A simple state machine for CSV with quoted fields:
function parseCSVLine(line: string): string[] {
  type State = 'FIELD_START' | 'IN_UNQUOTED' | 'IN_QUOTED' | 'AFTER_QUOTE';

  let state: State = 'FIELD_START';
  const fields: string[] = [];
  let current = '';

  for (const char of line) {
    switch (state) {
      case 'FIELD_START':
        if (char === '"')  { state = 'IN_QUOTED'; }
        else if (char === ',') { fields.push(current.trim()); current = ''; }
        else { current += char; state = 'IN_UNQUOTED'; }
        break;

      case 'IN_UNQUOTED':
        if (char === ',') { fields.push(current.trim()); current = ''; state = 'FIELD_START'; }
        else { current += char; }
        break;

      case 'IN_QUOTED':
        if (char === '"') { state = 'AFTER_QUOTE'; }
        else { current += char; }
        break;

      case 'AFTER_QUOTE':
        if (char === '"') { current += '"'; state = 'IN_QUOTED'; }    // escaped quote
        else if (char === ',') { fields.push(current); current = ''; state = 'FIELD_START'; }
        else { state = 'IN_UNQUOTED'; }  // ignore char after closing quote
        break;
    }
  }
  fields.push(current.trim()); // last field
  return fields;
}

// Test with quoted fields:
const quoted = '"Smith, John",john@example.com,"New York"';
console.log('Quoted line:', parseCSVLine(quoted));

const escaped = '"Say ""hello"" to Bob",bob@example.com,Paris';
console.log('Escaped quotes:', parseCSVLine(escaped));
```

### SAVE AND TRY

```bash
npx ts-node parse-contacts.ts
```

Expected new output at the bottom:
```
--- Quoted Field Handling ---
Quoted line: [ 'Smith, John', 'john@example.com', 'New York' ]
Escaped quotes: [ 'Say "hello" to Bob', 'bob@example.com', 'Paris' ]
```

**Change something:** Replace `parseCSVLine` with `parseLine` (the simple
split version) for the quoted line. Expected: `[ '"Smith', ' John"', 'john@example.com', '"New York"' ]`
— the quotes appear in the output and the comma inside the name splits it.
This confirms why the state machine is needed for real CSV.

---

## 🎯 Challenge: CSV Writer

**You know:** String splitting, trimming, pipeline chaining, the state machine concept.

**Task:** Write a `toCSVLine(fields: string[]): string` function that converts
an array of fields back to a valid CSV line. If a field contains a comma,
a double quote, or a newline, it must be wrapped in double quotes. Existing
double quotes inside a field must be escaped as `""`.

```ts
toCSVLine(['Alice', 'alice@example.com', 'London'])
// → 'Alice,alice@example.com,London'

toCSVLine(['Smith, John', 'john@example.com', 'New York'])
// → '"Smith, John",john@example.com,"New York"'

toCSVLine(['Say "hello"', 'bob@example.com', 'Paris'])
// → '"Say ""hello""",bob@example.com,Paris'
```

**Requirements:**
- Fields with no special characters are not quoted
- Fields with `,`, `"`, or `\n` are wrapped in double quotes
- Internal `"` characters are doubled to `""`

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function toCSVLine(fields: string[]): string {
  return fields
    .map(field => {
      // Does this field need quoting?
      const needsQuoting = field.includes(',') ||
                           field.includes('"') ||
                           field.includes('\n');

      if (!needsQuoting) return field;

      // Escape internal double quotes by doubling them, then wrap in quotes:
      const escaped = field.replaceAll('"', '""');
      return `"${escaped}"`;
    })
    .join(',');
}

// Tests:
console.log(toCSVLine(['Alice', 'alice@example.com', 'London']));
// Alice,alice@example.com,London

console.log(toCSVLine(['Smith, John', 'john@example.com', 'New York']));
// "Smith, John",john@example.com,"New York"

console.log(toCSVLine(['Say "hello"', 'bob@example.com', 'Paris']));
// "Say ""hello""",bob@example.com,Paris
```

**Key insight:** The writer and the reader are inverses. `parseCSVLine(toCSVLine(fields))`
should return `fields` unchanged for any input. Testing this round-trip property
(parse → write → parse again yields the same result) is the most effective way
to verify both functions are correct. This is called a "round-trip property test."

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| Split works | `'a,b,c'.split(',')` | `['a', 'b', 'c']` |
| Empty field preserved | `'a,,b'.split(',')` | `['a', '', 'b']` |
| filter(Boolean) removes empty | `['a', '', 'b'].filter(Boolean)` | `['a', 'b']` |
| Trim removes whitespace | `' hello '.trim()` | `'hello'` |
| Split count | `'a,b'.split(',').length` | `2` |
| State machine handles quotes | `parseCSVLine('"a,b",c')` | `['a,b', 'c']` |
| Pipeline produces objects | Run full pipeline | Array of Contact objects |

---

## Quick Check Answers

**1. What does each element of `' Alice , alice@example.com , London '.split(',')` contain?**

`[' Alice ', ' alice@example.com ', ' London ']` — each element has leading and
trailing spaces because `split` just divides at the comma; it does not remove
surrounding whitespace. Calling `.map(p => p.trim())` after the split gives
`['Alice', 'alice@example.com', 'London']` — each element clean.

**2. What does `filter(Boolean)` do?**

It removes all *falsy* values from the array. In the context of string arrays,
this removes empty strings (`''`), `null`, `undefined`, `0`, and `false`.
For a string array from splitting a CSV with blank lines (`''.split('\n')`),
`filter(Boolean)` removes the empty strings that represent blank lines.
It is equivalent to `filter(s => s.length > 0)` for purely string arrays,
but `filter(Boolean)` is shorter and works for mixed arrays.

**3. Why does `split(',')` fail for `"Smith, John",john@example.com`?**

`split(',')` is character-level — it splits at every comma, regardless of
whether the comma is inside quotes or not. The input has commas at three
positions: inside the quoted name, between the quoted name and the email,
and there is no more. `split(',')` gives `['"Smith', ' John"', 'john@example.com']`
— the quoted field is broken across two array elements. A correct CSV parser
must be context-aware: commas inside quoted fields are part of the field value,
not delimiters. This requires a state machine that tracks whether parsing is
currently "inside quotes" or not.
