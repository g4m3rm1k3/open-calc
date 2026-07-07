# TypeScript Spreadsheet — Lesson 06 — Tokenizing a Formula

## What You Will Build

Select any cell containing a formula, and a small debug panel below the
grid shows exactly how this project sees `=A1+B2*5` under the hood: not as
one string, but as a real, structured list — `A1`, `+`, `B2`, `*`, `5` —
each piece correctly identified as a cell reference, an operator, or a
number. This is the first stage of a real interpreter, the same first
stage this site's own OpenMAT project builds in full: before anything can
be computed, it first has to be *read* correctly.

---

## What You Need to Know First

Lesson 05 left `Cell` with a `{ kind: 'formula'; expr: string }` variant,
storing a formula's text with its leading `=` already removed. Nothing yet
looks inside that text at all.

---

## Concept: A Computer Doesn't "See" Math

To you, `=A1+B2*5` is an equation. To this project, right now, `cell.expr`
is just the string `"A1+B2*5"` — fourteen individual characters, with no
inherent structure at all. Before anything can add, multiply, or look up a
cell, something has to answer a much smaller question first: *what are the
meaningful pieces this string is actually made of?* Is `A1` one thing, or
two? Is `5` a number, or a stray digit? A human reads `A1+B2*5` and
instantly groups it correctly. A computer has to be told, explicitly, how
to do that grouping — one character at a time.

This first stage has a name: **tokenizing**, or **lexing**. It converts a
raw string into a list of **tokens** — the smallest meaningful pieces a
language is built from. This project's tokenizer is small, but it is the
same first stage every real programming language, and every real
spreadsheet, is built on.

---

## Step 1 — A Type for What a Token Can Be

**The problem:** Nothing yet describes what one meaningful piece of a
formula actually looks like.

Add to `script.ts`:

```typescript
type Token =
  | { type: 'number'; value: number }
  | { type: 'cell'; name: string }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'paren'; value: '(' | ')' };
```

**Walkthrough — another discriminated union, the same shape as `Cell`.**
`Token` has four variants, each tagged by `type` instead of `kind` (a
different field name, chosen only because "token" and "cell" are different
concepts — nothing requires the tag field to always be called the same
thing). A `'number'` token carries a real `value: number`. A `'cell'`
token carries the cell's name as text, like `"A1"`. An `'operator'` token's
`value` is not just `string` — it is the union of the four exact
characters `'+' | '-' | '*' | '/'`, a **string literal type**: TypeScript
will reject `{ type: 'operator', value: '%' }` outright, because `'%'` is
not one of the four values this type permits.

**Scope, stated honestly.** This tokenizer recognises exactly what this
project's formulas need for now: numbers, cell references, the four basic
arithmetic operators, and parentheses. Lesson 10 adds a fifth kind of
token once function names like `SUM` need one. A real spreadsheet
language has many more token kinds than this — string literals inside
formulas, comparison operators, sheet references — none of which this
project needs to support to teach what it is actually trying to teach.

---

## Step 2 — Scan the String, One Character at a Time

**The problem:** Nothing yet turns a string like `"A1+B2*5"` into a real
`Token[]`.

Add to `script.ts`:

```typescript
function isDigit(character: string): boolean {
  return character >= '0' && character <= '9';
}

function isUppercaseLetter(character: string): boolean {
  return character >= 'A' && character <= 'Z';
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  while (position < expr.length) {
    const character = expr[position];

    if (character === ' ') {
      position++;
      continue;
    }

    if (character === '+' || character === '-' || character === '*' || character === '/') {
      tokens.push({ type: 'operator', value: character });
      position++;
      continue;
    }

    if (character === '(' || character === ')') {
      tokens.push({ type: 'paren', value: character });
      position++;
      continue;
    }

    if (isDigit(character)) {
      let numberText = '';
      while (position < expr.length && (isDigit(expr[position]) || expr[position] === '.')) {
        numberText += expr[position];
        position++;
      }
      tokens.push({ type: 'number', value: Number(numberText) });
      continue;
    }

    if (isUppercaseLetter(character)) {
      let cellName = character;
      position++;
      while (position < expr.length && isDigit(expr[position])) {
        cellName += expr[position];
        position++;
      }
      tokens.push({ type: 'cell', name: cellName });
      continue;
    }

    throw new Error(`Unexpected character "${character}" in formula`);
  }

  return tokens;
}
```

**Walkthrough — `isDigit` and `isUppercaseLetter`, comparing characters
directly.** `character >= '0' && character <= '9'` works because
JavaScript compares strings **lexicographically** — character by
character, using each character's underlying numeric code point (the same
Unicode numbering `String.fromCharCode` used in the *other* direction back
in lesson 01, to turn a number into a letter). `'0'` through `'9'` sit at
consecutive code points, so any single character between them, inclusive,
is a real digit. `'A'` through `'Z'` work the same way for uppercase
letters.

**Walkthrough — `position`, the scanner's one piece of memory.**
`tokenize` reads through `expr` using a single index, `position`,
advanced explicitly every time a character (or several) has been
consumed. This is the standard shape of a **scanner**: look at the
character `position` currently points to, decide what it starts, consume
however many characters that thing actually needs, and move `position`
past all of them before looping again.

Whitespace is simply skipped — `position++` with nothing pushed to
`tokens` — so `A1 + B2` and `A1+B2` tokenize identically. A single
operator or parenthesis character always produces exactly one token and
advances `position` by exactly one.

**Walkthrough — multi-character tokens: numbers and cell references.** A
digit does not necessarily mean a *one-digit* number — `"52"` must become
the single token `{ type: 'number', value: 52 }`, not two separate `5`
and `2` tokens. The inner `while` loop keeps consuming characters —
digits, and a decimal point, for numbers with a fractional part like
`3.14` — for as long as they keep being part of the same number, building
up `numberText` as a string before converting the whole thing to a real
number, once, at the end. A cell reference works the same way: one
uppercase letter, then as many following digits as exist — `"A1"`,
`"B12"`, `"F10"` are each built into one single `{ type: 'cell' }` token,
never split apart.

**Walkthrough — the `throw`, and why an unrecognised character is a real
error, not a silent skip.** If `position` points at a character that
matches none of the checks above — a lowercase letter, a stray symbol —
`tokenize` throws immediately, with the exact character named in the
message. Silently ignoring an unrecognised character would be worse: a
formula with a typo would tokenize into something *plausible-looking* but
wrong, and the mistake would only surface later, confusingly, as an
incorrect result rather than a clear message pointing at the actual typo.

**Scope, stated honestly, again.** This tokenizer does not support a
leading minus sign for a negative number — `-5` always tokenizes as an
`'operator'` token followed by a `'number'` token, never as one negative
number. Supporting that correctly requires the *parser*, built in lesson
07, to understand that a `-` can mean two different things depending on
where it appears — a reasonable extension to attempt once lesson 08's
evaluator is working, not something this lesson's tokenizer needs to solve
on its own.

---

## Step 3 — Make Tokens Visible: A Debug Panel

**The problem:** `tokenize` works, but nothing on the page shows its
result — exactly the "invisible infrastructure" this curriculum avoids
building.

Update the HTML tab, adding a panel below the table:

```html
<table id="spreadsheet" class="spreadsheet">
  <thead>
    <tr id="header-row"></tr>
  </thead>
  <tbody id="spreadsheet-body"></tbody>
</table>

<div class="debug-panel">
  <h3>Debug: Tokens</h3>
  <pre id="debug-output">(select a formula cell to see its tokens)</pre>
</div>
```

Add to the CSS tab:

```css
.debug-panel {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #0f172a;
  color: #e2e8f0;
  border-radius: 6px;
  max-width: 500px;
}

.debug-panel h3 {
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.debug-panel pre {
  font-family: monospace;
  font-size: 0.8rem;
  white-space: pre-wrap;
}
```

Add to `script.ts`, and call it from `selectCell` and `commitEdit`:

```typescript
function updateDebugPanel(coordinate: Coordinate | null): void {
  const output = requireElement('debug-output');
  const cell = coordinate ? cells[cellId(coordinate)] : undefined;

  if (!cell || cell.kind !== 'formula') {
    output.textContent = '(select a formula cell to see its tokens)';
    return;
  }

  output.textContent = JSON.stringify(tokenize(cell.expr), null, 2);
}
```

Update `selectCell`'s last line, and `commitEdit`'s last line, in
`script.ts`, to each call `updateDebugPanel`:

```typescript
function selectCell(coordinate: Coordinate): void {
  if (selectedCoordinate) {
    const previousElement = requireElement(`cell-${cellId(selectedCoordinate)}`);
    previousElement.classList.remove('cell-selected');
  }
  selectedCoordinate = coordinate;
  const nextElement = requireElement(`cell-${cellId(coordinate)}`);
  nextElement.classList.add('cell-selected');
  updateDebugPanel(coordinate);
}
```

```typescript
function commitEdit(coordinate: Coordinate, rawInput: string): void {
  cells[cellId(coordinate)] = parseRawInput(rawInput);
  editingCoordinate = null;
  renderCell(coordinate);
  updateDebugPanel(coordinate);
}
```

Click **▶ Preview**. Type `=A1+B2*5` into a cell and press Enter, with
that cell still selected: the panel below the grid shows a real, indented
JSON array — five tokens, each with its own `type` and value. Select a
cell holding plain text or a number instead: the panel resets to its
placeholder message.

**Walkthrough — why `updateDebugPanel` takes `Coordinate | null`, not just
`Coordinate`.** `selectCell` always has a real coordinate by the time it
calls this — but stating the parameter as `Coordinate | null` keeps the
function honest about what it can actually be asked to handle, and costs
nothing extra here since the very first check, `!cell`, already covers
both "no coordinate at all" and "a coordinate with no formula in it" in
one place.

**SE lens — a debug panel is a real, if unusual, feature, not just a
teaching aid.** Many real applications ship an inspector panel like this
one, hidden behind a toggle or a developer mode, specifically so the
person building on top of the system can see what it is actually doing
internally. This project keeps its version visible permanently, for the
same reason OpenMAT's own console echoes tokens before it can evaluate
anything: a stage of a pipeline that produces no visible output is much
harder to trust, debug, or even believe is correct at all.

---

## Connect the Pieces

```
index.html   #debug-output — a new panel, entirely separate from the
             grid, showing whatever selectCell or commitEdit last put there
script.ts    Token — a discriminated union describing every meaningful
             piece a formula can be broken into
             tokenize() — the only function that reads a formula's raw
             text directly; every later stage works with its output
             updateDebugPanel() — called from two places, keeping the
             panel in sync with whatever is currently selected
```

---

## What Breaks Without This

**Removing the inner `while` loop that builds up `numberText`, replacing
it with a single-character read:** Type `=52+1` into a cell. Instead of
one `{ type: 'number', value: 52 }` token, tokenizing produces two
separate tokens for `5` and `2` — `=52+1` would be silently
misunderstood as `5`, `2`, `+`, `1`, a completely different formula from
the one actually typed, with no error anywhere to explain the wrong
result later.

**Removing the `throw` for an unrecognised character:** Type
`=A1+b2` (a lowercase `b`) into a cell. Without the `throw`, a silent
`continue` or skip would let tokenizing finish "successfully," having
quietly dropped the lowercase letter — the resulting tokens would describe
a formula that was never actually typed, and the mistake would surface,
confusingly, only once evaluation produces a wrong answer several lessons
from now.

---

## Definition of Done

- [ ] Selecting a formula cell shows its real token breakdown in the debug panel
- [ ] `=A1+B2*5` tokenizes into exactly five tokens, correctly typed
- [ ] Multi-digit numbers and multi-digit cell references (`B12`, not `B` then `1` then `2`) each produce exactly one token
- [ ] An unrecognised character in a formula throws a clear error naming the exact character
- [ ] You can explain what tokenizing is and why it is a separate step from actually computing a result
- [ ] You can explain why `character >= '0' && character <= '9'` correctly identifies a digit
- [ ] You can explain why this tokenizer does not yet support a leading minus sign for negative numbers

---

*Next: Lesson 07 — Parsing Into a Tree. A flat list of tokens still cannot
tell you that `*` should happen before `+` in `10+5*2` — that requires
real structure, built by a parser, into a shape called an Abstract Syntax
Tree.*
