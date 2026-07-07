# TypeScript Spreadsheet — Lesson 10 — Functions and Ranges

## What You Will Build

`=SUM(A1,B1)` adds two specific cells. `=SUM(A1:A10)` adds ten, without
typing all ten names — a **range**, expanding into every cell between two
corners. `AVG`, `MIN`, `MAX`, and `COUNT` all work the same way, sharing
one small dispatch table. This is the last lesson that extends the
tokenizer and parser themselves; lessons 11 onward build on top of what
exists rather than growing the grammar further.

---

## What You Need to Know First

Lesson 09 left `ExpressionNode` with four variants — `Number`,
`CellReference`, `UnaryExpression`, `BinaryExpression` — and `evaluate`
resolving cell references by recursively parsing and evaluating whatever
they point to.

---

## Step 1 — Recognise Function Names and Commas

**The problem:** `tokenize` currently assumes every run of uppercase
letters is a cell reference — but `SUM` has no digits after it at all, and
nothing yet produces a token for `,`.

Update the uppercase-letter branch of `tokenize` in `script.ts`:

```typescript
if (isUppercaseLetter(character)) {
  let letters = character;
  position++;
  while (position < expr.length && isUppercaseLetter(expr[position])) {
    letters += expr[position];
    position++;
  }

  let digits = '';
  while (position < expr.length && isDigit(expr[position])) {
    digits += expr[position];
    position++;
  }

  if (digits !== '') {
    tokens.push({ type: 'cell', name: letters + digits });
  } else {
    tokens.push({ type: 'identifier', name: letters });
  }
  continue;
}
```

Update `Token` and add a comma and colon:

```typescript
type Token =
  | { type: 'number'; value: number }
  | { type: 'cell'; name: string }
  | { type: 'identifier'; name: string }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'paren'; value: '(' | ')' }
  | { type: 'comma' }
  | { type: 'colon' };
```

Add two more single-character checks to `tokenize`, alongside the
existing operator and paren checks:

```typescript
if (character === ',') {
  tokens.push({ type: 'comma' });
  position++;
  continue;
}

if (character === ':') {
  tokens.push({ type: 'colon' });
  position++;
  continue;
}
```

**Walkthrough — one loop, now distinguishing two different things it used
to treat identically.** Previously, any uppercase letter started exactly
one letter followed by digits. Now, `tokenize` first consumes *every*
consecutive uppercase letter (`letters`), then *separately* tries to
consume digits (`digits`) right after. `"A1"` produces `letters = "A"`,
`digits = "1"` — a `'cell'` token, exactly as before. `"SUM"` produces
`letters = "SUM"`, `digits = ""` — no digits followed, so it becomes a
new kind of token, `'identifier'`, instead. `"AA3"` would produce
`letters = "AA"`, `digits = "3"` — a `'cell'` token spanning multiple
letters, something this tokenizer happens to support correctly even
though this project's own grid never has more than six columns.

`{ type: 'comma' }` and `{ type: 'colon' }` carry no extra data at all —
unlike every other token kind, there is only one possible comma and one
possible colon, so there is nothing else to record.

---

## Step 2 — Parse a Function Call

**The problem:** `parsePrimary` has no way to recognise an `'identifier'`
token, or to parse the parenthesized, comma-separated arguments that
follow one.

Add to `script.ts`:

```typescript
interface FunctionCallNode {
  kind: 'FunctionCall';
  name: string;
  args: ExpressionNode[];
}

type ExpressionNode =
  | NumberNode
  | CellReferenceNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | FunctionCallNode;
```

Update `parsePrimary` in `script.ts`, adding a case for `'identifier'`:

```typescript
if (token.type === 'identifier') {
  const functionName = token.name;
  advance();

  const openParen = peek();
  if (!openParen || openParen.type !== 'paren' || openParen.value !== '(') {
    throw new Error(`Expected "(" after function name "${functionName}"`);
  }
  advance();

  const args: ExpressionNode[] = [];

  const maybeCloseParen = peek();
  if (!maybeCloseParen || maybeCloseParen.type !== 'paren' || maybeCloseParen.value !== ')') {
    args.push(parseExpression());

    while (true) {
      const nextToken = peek();
      if (!nextToken || nextToken.type !== 'comma') {
        break;
      }
      advance();
      args.push(parseExpression());
    }
  }

  const closeParen = peek();
  if (!closeParen || closeParen.type !== 'paren' || closeParen.value !== ')') {
    throw new Error(`Expected ")" to close function call "${functionName}"`);
  }
  advance();

  return { kind: 'FunctionCall', name: functionName, args };
}
```

(This goes inside `parsePrimary`, alongside the existing `'number'`,
`'cell'`, and `'('` checks — order among them does not matter, since each
one checks a different token type.)

**Walkthrough — a comma-separated list, the same shape as the operator
loops.** Reading zero-or-more arguments follows the identical
`while (true) { ...; if (stop) break; }` shape lesson 07 already used for
repeated `+`/`-` and `*`/`/` — here, the loop continues for as long as a
comma keeps appearing, calling `parseExpression()` again after each one.
The check *before* the loop — `if (the next token isn't ")") { parse one
argument first }` — exists so that `SUM()`, a function called with zero
arguments, parses correctly too: the loop only ever runs after at least
one argument has already been read.

**Walkthrough — why arguments are parsed with the full
`parseExpression()`, not something more limited.** `SUM(A1+B1, 5*2)` is a
completely reasonable formula — each argument can be any expression this
grammar already knows how to parse, arithmetic included, simply by
calling back into `parseExpression` at the very top of the precedence
chain. Nothing new had to be written to make this work; it is a direct
consequence of every parsing function ultimately being reachable from
every other one.

---

## Step 3 — Ranges

**The problem:** `SUM(A1,A2,A3,A4,A5,A6,A7,A8,A9,A10)` works today, but
nobody wants to type that. `A1:A10` needs to mean "every cell from `A1`
to `A10`," which is not a single expression this grammar currently has
any way to produce.

Add to `script.ts`:

```typescript
interface RangeNode {
  kind: 'Range';
  from: string;
  to: string;
}

type ExpressionNode =
  | NumberNode
  | CellReferenceNode
  | RangeNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | FunctionCallNode;
```

Add a two-token lookahead helper, and a dedicated argument parser, to
`script.ts`:

```typescript
function peekAt(offset: number): Token | undefined {
  return tokens[position + offset];
}

function parseArgument(): ExpressionNode {
  const currentToken = peek();
  const nextToken = peekAt(1);

  if (currentToken && currentToken.type === 'cell' && nextToken && nextToken.type === 'colon') {
    const fromName = currentToken.name;
    advance();
    advance();

    const toToken = peek();
    if (!toToken || toToken.type !== 'cell') {
      throw new Error('Expected a cell reference after ":"');
    }
    advance();

    return { kind: 'Range', from: fromName, to: toToken.name };
  }

  return parseExpression();
}
```

(`peekAt` and `parseArgument` both go inside `parse`'s body, alongside
`peek` and `advance`.) Update both `args.push(parseExpression())` calls
inside the function-call parsing from Step 2 to `args.push(parseArgument())`
instead.

Click **▶ Preview**. `=SUM(A1:A10)` now parses correctly — the debug
panel's AST shows a real `Range` node with `from: "A1"` and `to: "A10"`
inside the function call's `args` array.

**Walkthrough — `peekAt`, a lookahead of more than one token.** Every
other decision this parser has made so far needed only the *current*
token. Deciding whether `A1` starts a range or is just a plain cell
reference genuinely requires looking *one token further ahead* first,
without committing to either interpretation yet: `peekAt(1)` looks at
`position + 1` without moving `position` at all, exactly like `peek()`
looks at `position` itself. Only once both tokens are known — a cell,
*then* a colon — does `parseArgument` commit to consuming them as a range.
If the second token were anything else, `parseArgument` falls through to
the ordinary `parseExpression()`, and a lone `A1` used as an argument
still works exactly as it always has.

**A gap, named honestly.** Nothing in this grammar prevents a `Range` from
appearing somewhere other than a function argument — `parseArgument` is
the *only* place that ever produces one, but `RangeNode` is still, quite
loosely, a member of the general `ExpressionNode` union. A stricter
grammar could separate "a value" from "a function argument" as two
distinct types entirely, forbidding this at the type level. This project
accepts the small looseness — Step 4 below closes the gap at evaluation
time instead, with a clear runtime error, which is a reasonable trade-off
for the amount of extra type complexity avoided.

---

## Step 4 — Evaluate Functions and Ranges

**The problem:** `evaluate` does not know what a `FunctionCall` or a
`Range` node means yet.

Add to `script.ts`:

```typescript
function parseCellName(name: string): Coordinate {
  const match = name.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell reference: "${name}"`);
  }

  const [, letters, digits] = match;
  const col = letters.charCodeAt(0) - 65;
  const row = Number(digits) - 1;
  return { col, row };
}

function expandRange(from: string, to: string): CellId[] {
  const fromCoordinate = parseCellName(from);
  const toCoordinate = parseCellName(to);

  const ids: CellId[] = [];
  for (let row = fromCoordinate.row; row <= toCoordinate.row; row++) {
    for (let col = fromCoordinate.col; col <= toCoordinate.col; col++) {
      ids.push(cellId({ col, row }));
    }
  }
  return ids;
}

const SPREADSHEET_FUNCTIONS: Record<string, (values: number[]) => number> = {
  SUM: (values) => values.reduce((total, value) => total + value, 0),
  AVG: (values) => (values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length),
  MIN: (values) => (values.length === 0 ? 0 : Math.min(...values)),
  MAX: (values) => (values.length === 0 ? 0 : Math.max(...values)),
  COUNT: (values) => values.length,
};

function evaluateArgumentToNumbers(node: ExpressionNode, lookupCell: (name: CellId) => number): number[] {
  if (node.kind === 'Range') {
    return expandRange(node.from, node.to).map(lookupCell);
  }
  return [evaluate(node, lookupCell)];
}

function evaluateFunctionCall(node: FunctionCallNode, lookupCell: (name: CellId) => number): number {
  const implementation = SPREADSHEET_FUNCTIONS[node.name];
  if (!implementation) {
    throw new Error(`Unknown function: "${node.name}"`);
  }

  const values = node.args.flatMap((arg) => evaluateArgumentToNumbers(arg, lookupCell));
  return implementation(values);
}
```

Update `evaluate`'s `switch` in `script.ts`, adding two cases:

```typescript
case 'Range':
  throw new Error('A range can only be used inside a function like SUM()');
case 'FunctionCall':
  return evaluateFunctionCall(node, lookupCell);
```

**A new way to fail, that `ParseResult` alone does not cover.** Until now,
the only way evaluating a formula could go wrong was a parse error —
something `ParseResult` already represents cleanly. `evaluateFunctionCall`
introduces a second, different kind of failure: a formula that *parses*
perfectly correctly (`=TOTAL(A1:A5)` is a completely valid function call,
grammatically) but fails while actually being *evaluated*, because
`"TOTAL"` is not a real function. That failure is a plain `throw`, not a
`ParseResult` — and nothing yet catches it.

Update `displayCell`'s `'formula'` case in `script.ts` to catch it:

```typescript
case 'formula': {
  const parseResult = parse(tokenize(cell.expr));
  if (parseResult.success === false) {
    return '#ERROR';
  }

  try {
    return evaluate(parseResult.ast, lookupCellValue).toString();
  } catch {
    return '#ERROR';
  }
}
```

Click **▶ Preview**. Fill A1 through A10 with numbers, then type
`=SUM(A1:A10)`: the correct total appears. Try `=AVG(A1:A10)`,
`=MAX(A1:A5)`, `=COUNT(A1:A10)` — each one works through the same
dispatch table. Type `=TOTAL(A1:A5)` (not a real function) or `=A1:A5` (a
range with nothing to consume it): both show `#ERROR` instead of freezing
or crashing the page.

**A blunt safety net, on purpose, for now.** Every evaluation failure
currently collapses into the same generic `'#ERROR'` text, whether the
real problem was an unknown function, a range used somewhere it should
not be, or something else entirely — genuinely less helpful than the
specific messages `evaluateFunctionCall` and `evaluate` already throw.
This is a deliberate, temporary trade-off: without *some* catch here,
lesson 10's own new failure modes would crash the page, which is worse
than an unhelpfully generic message. Lesson 13, Errors as Values, replaces
this blunt `catch` with a proper, considered design that preserves the
specific reason a formula failed, all the way through to what a person
actually sees.

`updateDebugPanel` (lessons 07–08) calls `evaluate` too, and needs the
identical protection — without it, merely *selecting* a cell containing
`=TOTAL(A1:A5)` would crash, since `updateDebugPanel` runs on every
selection. Update its result line in `script.ts`:

```typescript
try {
  resultOutput.textContent = evaluate(parseResult.ast, lookupCellValue).toString();
} catch (error) {
  resultOutput.textContent = `Evaluation error: ${error instanceof Error ? error.message : String(error)}`;
}
```

The debug panel is a developer-facing tool, not the main display, so it
keeps the *real* error message here rather than collapsing it to
`'#ERROR'` — a small, reasonable difference in how much detail each
audience actually needs.

**Walkthrough — `parseCellName`, undoing `cellId` and `columnLetter`.**
`name.match(/^([A-Z]+)(\d+)$/)` is a **regular expression**, first used
back in lesson 14 of this project's sibling series and now used here for
the first time: it matches a string made of one or more uppercase letters
followed by one or more digits, from start (`^`) to end (`$`), capturing
each part in parentheses. `letters.charCodeAt(0) - 65` converts a single
letter back into a zero-based column index — the exact reverse of lesson
01's `String.fromCharCode(65 + col)`. This project's grid never has more
than one letter's worth of columns, so only the first character is used;
a real spreadsheet supporting hundreds of columns would need real
base-26-style math to convert something like `"AA"` back into a number,
which this project does not attempt.

**Walkthrough — `evaluateArgumentToNumbers`, bridging two different
shapes.** A function's arguments are not all the same *kind* of thing: a
plain `A1` or `5*2` produces exactly one number; a `Range` produces many.
`evaluateArgumentToNumbers` always returns an array either way — one
element for anything that is not a `Range`, however many cells a `Range`
actually expands to — so `evaluateFunctionCall` can treat every argument
identically afterward, regardless of which kind it started as.

**Walkthrough — `flatMap`, and the spread operator's third job in this
project.** `node.args.flatMap((arg) => evaluateArgumentToNumbers(arg,
lookupCell))` calls `evaluateArgumentToNumbers` once per argument — the
same as `.map()` — and then flattens the resulting array-of-arrays into
one single flat array, in one step. `Math.min(...values)` uses the spread
operator for a third distinct purpose in this project: lesson 12 (Video
Notes) used it to copy an array, lesson 16 used it to merge two objects,
and here it **spreads an array out into individual arguments** — `Math.
min` does not accept an array directly, only a separate argument per
number to compare, and `...values` supplies exactly that from whatever
array happens to be there, however long it is.

**Walkthrough — why `MIN`/`MAX` guard against an empty array first.**
`Math.min()` and `Math.max()`, called with *zero* arguments, return
`Infinity` and `-Infinity` respectively — real, working numbers, but
almost certainly not what a person means by "the minimum of nothing."
`values.length === 0 ? 0 : ...` chooses a more sensible default instead of
silently returning an infinity that would then poison any further
arithmetic built on top of it.

---

## Connect the Pieces

```
script.ts    Token — two new kinds: 'identifier' and 'comma' (plus
             'colon', used only for ranges)
             ExpressionNode — two more variants: Range, FunctionCall
             parseArgument(), peekAt() — a two-token lookahead, used only
             where a plain one-token check cannot decide what follows
             SPREADSHEET_FUNCTIONS — a typed dispatch table, the same
             Record<string, ...> shape used since lesson 03
```

---

## What Breaks Without This

**Removing the `try`/`catch` from `displayCell`'s `'formula'` case:** Type
`=TOTAL(A1:A10)` (not a real function). `evaluateFunctionCall`'s `throw`
propagates all the way up through `evaluate`, out of `displayCell`, out of
`renderCell` — uncaught, crashing the render entirely. Select the debug
panel's version of the same formula (which does keep its own `try`/`catch`)
to see the real message, `Unknown function: "TOTAL"`, without the crash.

**Removing the `digits !== ''` check in Step 1, always treating uppercase
letters as a cell reference:** Type `=SUM(A1:A10)`. Tokenizing `SUM` would
try to also consume trailing digits that do not exist, producing a
`'cell'` token with an empty `digits` part — `parsePrimary` would then
fail to recognise `(` as the start of a function call at all, since it
never produces an `'identifier'` token to trigger that branch in the
first place.

---

## Definition of Done

- [ ] `=SUM(A1,B1)` and `=SUM(A1:A10)` both compute the correct total
- [ ] `AVG`, `MIN`, `MAX`, and `COUNT` all work the same way, through the same dispatch table
- [ ] `MIN`/`MAX` over an empty range shows `0`, not `Infinity`
- [ ] An unknown function name shows `#ERROR` in the cell, and the specific message in the debug panel, without crashing either
- [ ] You can explain how `tokenize` now distinguishes `"SUM"` from `"A1"` using the same uppercase-letter branch
- [ ] You can explain why `parseArgument` needs to look two tokens ahead, not just one
- [ ] You can explain the three different jobs the spread operator (`...`) has now done across this project's two series
- [ ] You can explain why `displayCell` collapses every evaluation error to `'#ERROR'` while the debug panel keeps the real message, and why lesson 13 exists to improve on both

---

*Next: Lesson 11 — The Dependency Graph. Every formula is currently
re-parsed and re-evaluated from scratch, on demand, every time it needs
to be shown. This lesson builds the structure that will let a future
lesson stop doing that — starting with correctly tracking which cells
depend on which.*
