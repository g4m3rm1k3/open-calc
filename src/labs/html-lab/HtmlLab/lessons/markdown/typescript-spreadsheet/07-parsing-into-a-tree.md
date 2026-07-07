# TypeScript Spreadsheet — Lesson 07 — Parsing Into a Tree

## What You Will Build

The debug panel gains a second section: alongside the token list, it now
shows a real **Abstract Syntax Tree** — a structured shape that correctly
understands `10+5*2` as "add 10 to the result of 5 times 2," never "add 10
and 5, then multiply by 2." Nothing is computed yet; that is lesson 08's
job entirely. This lesson's only responsibility is turning a flat list of
tokens into real structure, using a technique called **recursive descent
parsing** — the standard, most direct way to build a parser by hand, and
the technique this lesson uses deliberately instead of shortcuts like
`eval()` that would compute an answer while teaching nothing about how.

---

## What You Need to Know First

Lesson 06 left `tokenize(expr)` turning a formula's raw text into a real
`Token[]` — numbers, operators, parentheses, and cell references, each
correctly identified, shown live in the debug panel.

---

## Concept: A Flat List Still Isn't Enough

`tokenize("10+5*2")` produces five tokens in a row: `10`, `+`, `5`, `*`,
`2`. Nothing about that flat list says which operation happens first.
Read left to right, naively, you would compute `10+5=15`, then `15*2=30`
— the wrong answer. Real arithmetic gives multiplication higher
**precedence** than addition: `10+5*2` means `10+(5*2)`, which is `20`.

A **parser**'s job is to consume a flat list of tokens and produce a
**tree** — a shape where "what happens first" is expressed directly by
*nesting*, not by reading order. The multiplication ends up *nested
inside* the addition, as one of its two operands:

```
      +
     / \
   10   *
       / \
      5   2
```

This tree has a name: an **Abstract Syntax Tree**, or **AST** — "abstract"
because it represents the *meaning* of the formula's structure, not its
literal text (there is no node anywhere for the `+` sign's exact character
position, or for whitespace). Evaluating this tree correctly, in lesson
08, will turn out to be remarkably simple, precisely because the hard part
— figuring out precedence — is already finished by the time evaluation
starts.

---

## Concept: The Grammar, and Where This Project Is Headed

The complete formula language this project is building toward looks like
this, written in a common notation for describing grammars (`|` means "or,"
`*` means "zero or more," `?` means "optional"):

```text
Expression
    → Addition

Addition
    → Multiplication ( ("+" | "-") Multiplication )*

Multiplication
    → Unary ( ("*" | "/") Unary )*

Unary
    → "-" Unary
    | Primary

Primary
    → Number
    | CellReference
    | FunctionCall
    | "(" Expression ")"
```

This lesson builds everything *except* `CellReference` and `FunctionCall`
— those arrive in lessons 09 and 10, extending the exact same functions
this lesson writes, the same way `Cell` and `Token` were each extended
with a new variant in earlier lessons rather than rewritten. For now,
`Primary` only produces a number or a parenthesized expression.

**Reading the grammar as a plan for code.** Each named rule above —
`Expression`, `Addition`, `Multiplication`, `Unary`, `Primary` — becomes
its own function: `parseExpression`, `parseAddition`,
`parseMultiplication`, `parseUnary`, `parsePrimary`. This is the defining
trait of **recursive descent**: the grammar is not converted into some
other data structure at all — it is translated, rule for rule, directly
into ordinary function calls. A grammar rule that says "an Addition is a
Multiplication, optionally followed by more Multiplications" becomes a
function that calls `parseMultiplication()`, then checks for `+` or `-`
in a loop, calling `parseMultiplication()` again for each one it finds.

**Precedence is encoded by nesting, not by numbers.** `parseAddition`
never looks at `*` or `/` directly — it delegates entirely to
`parseMultiplication` for each operand, and `parseMultiplication`
*already* handles every `*` and `/` before ever returning. By the time
`parseAddition` sees its own `+` and `-` operators, any multiplication
touching its operands has already been fully resolved into a single tree
node. This is why the order of these five functions — lowest precedence
called first, delegating down to progressively higher precedence — is
not arbitrary. It is the entire mechanism.

---

## Step 1 — AST Node Types

**The problem:** Nothing yet describes what a node in this tree actually
looks like.

Add to `script.ts`:

```typescript
interface NumberNode {
  kind: 'Number';
  value: number;
}

interface UnaryExpressionNode {
  kind: 'UnaryExpression';
  operator: '-';
  operand: ExpressionNode;
}

interface BinaryExpressionNode {
  kind: 'BinaryExpression';
  operator: '+' | '-' | '*' | '/';
  left: ExpressionNode;
  right: ExpressionNode;
}

type ExpressionNode =
  | NumberNode
  | UnaryExpressionNode
  | BinaryExpressionNode;
```

**Walkthrough — the third discriminated union this project has built, and
why that repetition is worth noticing.** `Cell` (lesson 04) described what
a spreadsheet cell can be. `Token` (lesson 06) described what a piece of a
formula's text can be. `ExpressionNode` now describes what a piece of a
formula's *meaning* can be — and it uses the exact same shape: a `kind`
field naming the variant, each variant carrying whatever data is specific
to it. Once you have built this pattern three times, in three genuinely
different contexts, it stops being "the way this project happens to model
one thing" and becomes visible for what it actually is: the standard way
TypeScript code represents "this is honestly one of several distinct
possibilities," reached for again every time that situation comes up.

**Walkthrough — why `UnaryExpressionNode` and `BinaryExpressionNode` refer
to `ExpressionNode` inside their own fields.** `operand: ExpressionNode`
and `left: ExpressionNode` / `right: ExpressionNode` make this a
**recursive type** — a `BinaryExpressionNode`'s children are themselves
full expressions, which could themselves be another `BinaryExpressionNode`,
nested arbitrarily deep. This is exactly what makes a *tree* possible:
`10+5*2`'s `+` node's right child is not a plain number — it is an entire
`BinaryExpressionNode` in its own right, representing `5*2`.

---

## Step 2 — Build the Parser, One Precedence Level at a Time

**The problem:** Nothing yet turns a `Token[]` into an `ExpressionNode`.

Add to `script.ts`:

```typescript
interface ParseError {
  message: string;
}

type ParseResult =
  | { success: true; ast: ExpressionNode }
  | { success: false; error: ParseError };

function parse(tokens: Token[]): ParseResult {
  let position = 0;

  function peek(): Token | undefined {
    return tokens[position];
  }

  function advance(): Token {
    const token = tokens[position];
    position++;
    return token;
  }

  function parsePrimary(): ExpressionNode {
    const token = peek();

    if (!token) {
      throw new Error('Expected a number or "(", but the formula ended');
    }

    if (token.type === 'number') {
      advance();
      return { kind: 'Number', value: token.value };
    }

    if (token.type === 'paren' && token.value === '(') {
      advance();
      const expression = parseExpression();

      const closingToken = peek();
      if (!closingToken || closingToken.type !== 'paren' || closingToken.value !== ')') {
        throw new Error('Expected a closing ")"');
      }
      advance();

      return expression;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }

  function parseUnary(): ExpressionNode {
    const token = peek();

    if (token && token.type === 'operator' && token.value === '-') {
      advance();
      const operand = parseUnary();
      return { kind: 'UnaryExpression', operator: '-', operand };
    }

    return parsePrimary();
  }

  function parseMultiplication(): ExpressionNode {
    let left = parseUnary();

    while (true) {
      const token = peek();
      if (!token || token.type !== 'operator' || (token.value !== '*' && token.value !== '/')) {
        break;
      }

      advance();
      const right = parseUnary();
      left = { kind: 'BinaryExpression', operator: token.value, left, right };
    }

    return left;
  }

  function parseAddition(): ExpressionNode {
    let left = parseMultiplication();

    while (true) {
      const token = peek();
      if (!token || token.type !== 'operator' || (token.value !== '+' && token.value !== '-')) {
        break;
      }

      advance();
      const right = parseMultiplication();
      left = { kind: 'BinaryExpression', operator: token.value, left, right };
    }

    return left;
  }

  function parseExpression(): ExpressionNode {
    return parseAddition();
  }

  try {
    const ast = parseExpression();

    const leftoverToken = peek();
    if (leftoverToken) {
      return {
        success: false,
        error: { message: `Unexpected token after formula: ${JSON.stringify(leftoverToken)}` },
      };
    }

    return { success: true, ast };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: { message } };
  }
}
```

**Walkthrough — `peek()` and `advance()`, the parser's only way to look at
tokens.** `peek()` returns whatever token sits at `position` without
moving anywhere — declared `Token | undefined`, the same honest gap
lesson 03's `Record` lookups and lesson 06's `expr[position]` both had:
`tokens[position]` genuinely returns `undefined` once `position` runs past
the end of the array, and TypeScript's default array typing does not
warn you about this on its own. `advance()` reads the current token
*and* moves `position` forward by one — every function below calls one or
both of these, and neither ever reads or writes `position` any other way.

**Walkthrough — why every loop is `while (true) { ...; if (...) { break;
} ...}` instead of a normal `while (condition)`.** Each loop needs to
*look at* the next token before it can decide whether to continue — and
that token might not exist at all, or might exist but be the wrong kind.
Capturing it once, into a local `const token = peek()`, and checking that
one captured value, means the rest of the loop body can keep using
`token` directly, fully narrowed by the `if` check above it — exactly
lesson 01's `requireElement` pattern, reused here for a loop instead of a
function's top. Writing the same check directly inside a `while (...)`
condition would either have to call `peek()` a second time inside the
loop body (risking the two calls disagreeing if anything changed between
them) or leave `token`'s type unnarrowed when it is finally used.

**Walkthrough — how `10+5*2` actually flows through these five
functions.** `parseExpression` calls `parseAddition`, which immediately
calls `parseMultiplication` to get its first operand — *before* looking
at any `+` at all. `parseMultiplication` calls `parseUnary`, which calls
`parsePrimary`, which reads the token `10` and returns `{ kind: 'Number',
value: 10 }`. Back in `parseMultiplication`, the next token is `+`, not
`*` or `/` — the `while` loop's condition fails immediately, and it
returns the plain `10` node unchanged. Back in `parseAddition`, `left` is
now `10`, and the next token really is `+`: the loop body runs,
`advance()` consumes the `+`, and `parseMultiplication` is called *again*
for the right-hand side — this time, it sees `5`, then genuinely finds `*`
next, and *its own* loop combines `5` and `2` into one `BinaryExpression`
node before returning that whole node as one unit. `parseAddition` then
wraps `10` and that `5*2` node together into the final `+` node — exactly
the tree shown at the top of this lesson, produced with no explicit
precedence table anywhere in the code.

**Walkthrough — `throw` inside, `ParseResult` outside.** Every function
except `parse` itself throws a plain `Error` the moment something goes
wrong — an unexpected token, a missing `)`, a formula that ends too soon.
None of those inner functions know anything about `ParseResult` at all;
each one only has to focus on its own single grammar rule. The `try`/
`catch` inside `parse` is the *one* place that converts whatever was
thrown into the typed, public shape the rest of this project will
actually use: `{ success: false, error: { message } }`. This is a
deliberate trade-off, not an oversight — threading a `ParseResult` through
every recursive call individually, checking it at every single step,
would make each function noticeably harder to read for comparatively
little benefit, when one boundary at the very top can catch anything any
of them might throw.

**Walkthrough — the leftover-token check.** After `parseExpression`
returns, a well-formed formula should have consumed *every* token —
`position` should equal `tokens.length`. A formula like `5 5` (two numbers
with nothing joining them) would have `parseExpression` happily return
just the first `5`, leaving the second `5` token sitting unconsumed. The
explicit check `if (leftoverToken)` catches exactly this: a formula that
*looks* like it parsed successfully but secretly left something over,
which would otherwise be silently ignored.

---

## Step 3 — Show the Tree in the Debug Panel

**The problem:** `parse` works, but nothing shows its result yet.

Update `updateDebugPanel` in `script.ts`:

```typescript
function updateDebugPanel(coordinate: Coordinate | null): void {
  const tokensOutput = requireElement('debug-tokens');
  const astOutput = requireElement('debug-ast');
  const cell = coordinate ? cells[cellId(coordinate)] : undefined;

  if (!cell || cell.kind !== 'formula') {
    tokensOutput.textContent = '(select a formula cell)';
    astOutput.textContent = '(select a formula cell)';
    return;
  }

  const tokens = tokenize(cell.expr);
  tokensOutput.textContent = JSON.stringify(tokens, null, 2);

  const result = parse(tokens);
  astOutput.textContent = result.success === true
    ? JSON.stringify(result.ast, null, 2)
    : `Parse error: ${result.error.message}`;
}
```

**A real quirk, verified rather than assumed.** You might expect
`result.success ? ... : ...` — checking the field directly, the same way
`if (!cell)` has worked throughout this project — to narrow `result`
correctly here too. In this project's Monaco setup, it does not: a plain
truthy check on a field typed as `true | false` does not reliably narrow
which branch of `ParseResult` you are in, and the `.error` access below
gets flagged as an error even though the code is completely valid
TypeScript. Writing the comparison explicitly, `result.success === true`,
narrows correctly every time. This is exactly the kind of thing this
project's "How TypeScript Actually Works in This Environment" section
warned about in the README: Monaco's checking is real, but it is one
specific tool with its own edges, not an oracle that behaves identically
to every other TypeScript setup you might use later. `Cell.kind` and
`Token.type` never hit this, because comparing a *string* literal (`cell.
kind === 'formula'`) narrows reliably here — it is specifically the
`true`/`false` boolean case that needs the explicit comparison.

Update the debug panel in the HTML tab:

```html
<div class="debug-panel">
  <h3>Debug: Tokens</h3>
  <pre id="debug-tokens">(select a formula cell)</pre>
  <h3>Debug: AST</h3>
  <pre id="debug-ast">(select a formula cell)</pre>
</div>
```

Click **▶ Preview**. Type `=10+5*2` into a cell, keep it selected: the
panel shows both the token list and, below it, a real nested tree — a
`BinaryExpression` with operator `+`, whose `right` field is *itself* a
whole `BinaryExpression` with operator `*`. Type something intentionally
broken, like `=10+`, and the AST panel shows a clear parse error message
instead of a crash.

**SE lens — the parser has been tested the whole time, without a test
file.** Nothing about `parse` reads `cells`, `selectedCoordinate`, or
touches the DOM in any way — it is a **pure function**: tokens go in, a
`ParseResult` comes out, with nothing else affected and nothing else
consulted. You could open this project's browser console right now and
type `parse(tokenize("10+5*2"))` directly, with no cell, no grid, and no
UI involved at all, and get back the exact same tree the debug panel
shows. This independence is not an accident — it is what Step 2's design
was for: a parser that only depends on its own input can be verified in
complete isolation from everything this project has built around it.

---

## Connect the Pieces

```
script.ts    ExpressionNode — a discriminated union: Number,
             UnaryExpression, BinaryExpression (CellReference and
             FunctionCall arrive in lessons 09 and 10)
             ParseResult — success/failure, the same tagged-union shape
             as Cell and Token, applied to "did parsing work?"
             parse() — pure: Token[] in, ParseResult out, nothing else
             touched; five nested functions encode the grammar's five
             precedence levels directly as call structure
```

---

## What Breaks Without This

**Swapping the order so `parseAddition` calls itself directly instead of
delegating to `parseMultiplication` for each operand:** `10+5*2` would
parse as `(10+5)*2` — addition grouping first, multiplication second, the
exact wrong precedence this entire lesson exists to get right. Try it
deliberately: temporarily make `parseAddition` call `parseAddition`
(itself) for operands instead of `parseMultiplication`, and check the AST
panel's shape for `=10+5*2`.

**Removing the leftover-token check:** Type `=5 5` into a cell. Without
the check, `parse` reports success with an AST representing just the
first `5`, silently discarding the second token — a malformed formula
that looks, from the AST alone, exactly like a correctly parsed one.

**Changing `result.success === true` back to a plain `result.success`:**
Monaco immediately shows `Property 'error' does not exist on type
'ParseResult'` on the line below it, even though the code is entirely
valid. This is the verified quirk from Step 3 — try it yourself and
confirm the exact wording, so you recognise it instantly if it appears
again in a later lesson's boolean-discriminated type.

---

## Definition of Done

- [ ] The debug panel shows a real, correctly nested AST for any arithmetic formula
- [ ] `=10+5*2` produces a tree where the `*` is nested inside the `+`, not the other way around
- [ ] Parentheses correctly override precedence: `=(10+5)*2` produces a tree where the `+` is nested inside the `*`
- [ ] A malformed formula like `=10+` shows a clear parse error, not a crash
- [ ] You can explain why precedence is expressed through which function calls which, not through a table of numbers
- [ ] You can explain why every loop in the parser captures `peek()` into a local variable before checking it
- [ ] You can explain why the parser throws internally but returns a typed `ParseResult` at its outer boundary
- [ ] You can call `parse(tokenize(...))` directly from the browser console and explain why that works with no cell or grid involved at all
- [ ] You can explain why `result.success === true` is written explicitly instead of `result.success`, and reproduce the Monaco error that appears without it

---

*Next: Lesson 08 — Evaluating the Tree. The AST already has the right
shape — this lesson walks it, recursively, and `=10+5*2` finally produces
a real number: `20`, not `30`.*
