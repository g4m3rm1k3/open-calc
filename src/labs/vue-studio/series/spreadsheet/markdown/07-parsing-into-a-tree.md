# Vue Spreadsheet — Lesson 07 — Parsing Into a Tree

## What you will build

The debug panel gains a second section: alongside the token list, it now shows a real **Abstract Syntax Tree** — a nested structure that correctly understands `10+5*2` as "add 10 to the result of 5 times 2," never the other way around. Nothing is computed yet. This lesson's only job is turning a flat list of tokens into real structure, using a technique called **recursive descent parsing**.

```
=10+5*2 → AST:
{
  "kind": "BinaryExpression",
  "operator": "+",
  "left": { "kind": "Number", "value": 10 },
  "right": {
    "kind": "BinaryExpression",
    "operator": "*",
    "left": { "kind": "Number", "value": 5 },
    "right": { "kind": "Number", "value": 2 }
  }
}
```

The multiplication is *nested inside* the addition. No explicit precedence table. No rule numbers. The nesting is what encodes precedence.

---

## What you need to know first

Lesson 06 left `tokenize(expr)` turning a formula's text into a `Token[]`. Nothing yet looks at the meaning of those tokens — their order, or which ones group with which.

---

## Concept: a flat list is not enough

`tokenize("10+5*2")` produces five tokens in order: `10`, `+`, `5`, `*`, `2`. That flat list says nothing about which operation happens first. Read left to right, naively: `10+5=15`, then `15*2=30`. Wrong. Real arithmetic says `*` has higher precedence than `+`: `10+5*2` means `10+(5*2) = 20`.

A parser's job is to consume a flat list of tokens and produce a **tree** where "what happens first" is expressed by nesting. The multiplication ends up nested *inside* the addition as one of its two children:

```
      +
     / \
   10   *
       / \
      5   2
```

This is an **Abstract Syntax Tree** — "abstract" because it represents the formula's meaning, not its literal text. There is no node for the `+` character's position, no node for whitespace. Only the structure of the computation matters.

Evaluating this tree in lesson 08 will be remarkably simple, because the hard work — figuring out precedence — is already done before evaluation starts.

---

## Concept: the grammar, and how it becomes code

The formula language this project builds toward follows these rules ("|" means "or", "*" means "zero or more"):

```
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
    | "(" Expression ")"
```

This lesson builds everything here. Lesson 09 extends `Primary` to include cell references.

**Writing the grammar before writing a single line of parser code is a real,
deliberate Agile practice, not a contradiction of it.** Agile is often
misread as "skip design, start coding" — it isn't; it specifically warns against
**BDUF (Big Design Up Front)**, exhaustively designing an entire system before
building any of it. Sketching five grammar rules for exactly the arithmetic this
project needs *right now* — not a grammar for every spreadsheet function that might
ever exist — is the opposite failure mode avoided: just enough design to code with
confidence, scoped tightly to this lesson's slice, thrown away and redone the moment
reality (Lesson 09's cell references) demands more.

**Each rule becomes exactly one function.** `parseAddition`, `parseMultiplication`, `parseUnary`, `parsePrimary`, `parseExpression` — one function per grammar rule. This is recursive descent: the grammar is not converted into any other structure. It is translated, rule by rule, directly into function calls.

**Precedence through delegation:** `parseAddition` never looks at `*` or `/` directly. For each operand, it delegates to `parseMultiplication`, which handles every `*` and `/` before returning. By the time `parseAddition` sees a `+` or `-`, any multiplication touching its operands has already been fully resolved. The order of delegation — `parseAddition` calls `parseMultiplication`, which calls `parseUnary`, which calls `parsePrimary` — is the entire mechanism. Higher precedence = deeper in the call stack = resolved first.

---

## Step 1 — AST node types

**The problem:** Nothing describes what a node in the tree looks like.

Add to `<script setup>`:

```typescript
interface NumberNode {
  kind: 'Number'
  value: number
}

interface UnaryExpressionNode {
  kind: 'UnaryExpression'
  operator: '-'
  operand: ExpressionNode
}

interface BinaryExpressionNode {
  kind: 'BinaryExpression'
  operator: '+' | '-' | '*' | '/'
  left: ExpressionNode
  right: ExpressionNode
}

type ExpressionNode =
  | NumberNode
  | UnaryExpressionNode
  | BinaryExpressionNode
```

**Walkthrough — this is the third discriminated union this project has built:**

- `Cell` (lesson 04): what a spreadsheet cell can hold — number, text, or formula
- `Token` (lesson 06): what a piece of formula text can be — number, cell reference, operator, paren
- `ExpressionNode`: what a piece of formula *meaning* can be — a number, a negation, a binary operation

Same shape each time: a `kind` field naming the variant; each variant carries the data specific to it. This is the standard TypeScript pattern for "this value is honestly one of several distinct possibilities." Once you have built it three times, in three genuinely different contexts, it stops looking like a project convention and becomes recognisable as a general tool.

**Walkthrough — recursive type:**

`BinaryExpressionNode`'s `left` and `right` fields are both `ExpressionNode` — the same type being defined. This makes the tree recursive: a `BinaryExpressionNode`'s children can themselves be `BinaryExpressionNode`s, nested arbitrarily deep. `UnaryExpressionNode`'s `operand` is also `ExpressionNode`, for the same reason: `-(-5)` is a unary minus applied to another unary minus applied to `5`.

Run this throwaway to see the tree structure for a few formulas:

```vue
<script setup lang="ts">
interface NumberNode { kind: 'Number'; value: number }
interface BinaryExpressionNode { kind: 'BinaryExpression'; operator: string; left: ExpressionNode; right: ExpressionNode }
type ExpressionNode = NumberNode | BinaryExpressionNode

// Manually construct what the parser will build automatically:
const tree10Plus5Times2: ExpressionNode = {
  kind: 'BinaryExpression',
  operator: '+',
  left:  { kind: 'Number', value: 10 },
  right: {
    kind: 'BinaryExpression',
    operator: '*',
    left:  { kind: 'Number', value: 5 },
    right: { kind: 'Number', value: 2 },
  }
}

const treeParens: ExpressionNode = {
  kind: 'BinaryExpression',
  operator: '*',
  left: {
    kind: 'BinaryExpression',
    operator: '+',
    left:  { kind: 'Number', value: 10 },
    right: { kind: 'Number', value: 5 },
  },
  right: { kind: 'Number', value: 2 }
}
</script>
<template>
  <p>10+5*2 tree: <pre>{{ JSON.stringify(tree10Plus5Times2, null, 2) }}</pre></p>
  <p>(10+5)*2 tree: <pre>{{ JSON.stringify(treeParens, null, 2) }}</pre></p>
</template>
```

The `*` node is nested *inside* the `+` node for `10+5*2`. The `+` node is nested *inside* the `*` node for `(10+5)*2`. Parentheses flip the nesting — which is exactly what they should do.

---

## Step 2 — Build the parser

**The problem:** Nothing yet turns a `Token[]` into an `ExpressionNode`.

Add to `<script setup>`:

```typescript
interface ParseError {
  message: string
}

type ParseResult =
  | { success: true;  ast: ExpressionNode }
  | { success: false; error: ParseError }

function parse(tokens: Token[]): ParseResult {
  let position = 0

  function peek(): Token | undefined {
    return tokens[position]
  }

  function advance(): Token {
    const token = tokens[position]
    position++
    return token
  }

  function parsePrimary(): ExpressionNode {
    const token = peek()

    if (!token) {
      throw new Error('Expected a number or "(", but the formula ended')
    }

    if (token.type === 'number') {
      advance()
      return { kind: 'Number', value: token.value }
    }

    if (token.type === 'paren' && token.value === '(') {
      advance()
      const expression = parseExpression()
      const closing = peek()
      if (!closing || closing.type !== 'paren' || closing.value !== ')') {
        throw new Error('Expected a closing ")"')
      }
      advance()
      return expression
    }

    throw new Error(`Unexpected token: ${JSON.stringify(token)}`)
  }

  function parseUnary(): ExpressionNode {
    const token = peek()
    if (token && token.type === 'operator' && token.value === '-') {
      advance()
      const operand = parseUnary()
      return { kind: 'UnaryExpression', operator: '-', operand }
    }
    return parsePrimary()
  }

  function parseMultiplication(): ExpressionNode {
    let left = parseUnary()
    while (true) {
      const token = peek()
      if (!token || token.type !== 'operator' || (token.value !== '*' && token.value !== '/')) break
      advance()
      const right = parseUnary()
      left = { kind: 'BinaryExpression', operator: token.value, left, right }
    }
    return left
  }

  function parseAddition(): ExpressionNode {
    let left = parseMultiplication()
    while (true) {
      const token = peek()
      if (!token || token.type !== 'operator' || (token.value !== '+' && token.value !== '-')) break
      advance()
      const right = parseMultiplication()
      left = { kind: 'BinaryExpression', operator: token.value, left, right }
    }
    return left
  }

  function parseExpression(): ExpressionNode {
    return parseAddition()
  }

  try {
    const ast = parseExpression()
    const leftover = peek()
    if (leftover) {
      return { success: false, error: { message: `Unexpected token after formula: ${JSON.stringify(leftover)}` } }
    }
    return { success: true, ast }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: { message } }
  }
}
```

**Walkthrough — functions defined inside another function, and why that's what makes this work:**

`peek`, `advance`, `parsePrimary`, `parseUnary`, `parseMultiplication`, `parseAddition`,
and `parseExpression` are all declared *inside* `parse`'s body — a **nested
function**. This is not just organization; it's what lets every one of these
functions read and write the single `position` variable declared at the top of
`parse`, without `position` ever being passed as a parameter or returned anywhere. A
function defined inside another function keeps access to that outer function's
variables even while it runs — this is a **closure**, the same underlying mechanism
Lesson 02's closure-in-loop throwaway demonstrated with `var` and `let`, applied here
deliberately and usefully rather than as a bug to avoid. Every nested function here
closes over the *same* `position`, so `advance()` incrementing it is immediately
visible to `peek()`'s next call, and to every parsing function above it on the call
stack — one shared piece of state, safely contained inside `parse` and invisible to
anything outside it (nothing outside `parse` can read or corrupt `position` directly,
because `position` doesn't exist as a name anywhere outside `parse`'s body).

These two inner functions are the parser's only way to read tokens. `peek()` returns the token at `position` without moving — typed as `Token | undefined` because `tokens[position]` genuinely returns `undefined` once `position` runs past the end. `advance()` reads the current token AND increments `position`. Every parsing function uses one or both; neither one reads or writes `position` directly.

**Walkthrough — `while (true) { ...; if (...) { break } }` instead of `while (condition)`:**

Each loop needs to look at the next token before deciding to continue. Capturing `peek()` into a local `const token` once and then checking `token` means the rest of the loop body uses a narrowed type. Compare:

```typescript
// This — one peek() call, clearly narrowed:
while (true) {
  const token = peek()
  if (!token || token.type !== 'operator' || token.value !== '+') break
  // token is definitely { type: 'operator', value: '+' } here
  advance()
  ...
}

// vs this — requires TypeScript to re-check peek() on every body line:
while (peek() && peek()!.type === 'operator') {
  const token = peek()!  // ! needed, potentially called again
  ...
}
```

The `while (true)` form calls `peek()` exactly once per iteration, narrows the type once, and uses the narrowed value for the rest of the body.

**Walkthrough — how `10+5*2` flows through the functions:**

`parseExpression` calls `parseAddition`. `parseAddition` immediately calls `parseMultiplication` to get its first operand — before looking at any `+`.

`parseMultiplication` calls `parseUnary`, which calls `parsePrimary`, which reads the token `10` and returns `{ kind: 'Number', value: 10 }`. Back in `parseMultiplication`, the next token is `+` — not `*` or `/` — so the loop exits, returning the plain `10` node.

Back in `parseAddition`, `left` is `10`. The next token is `+`. The loop body runs: `advance()` consumes the `+`, then `parseMultiplication` is called again for the right side. This time, `parseMultiplication` sees `5`, then genuinely finds `*`, and combines `5` and `2` into `{ kind: 'BinaryExpression', operator: '*', ... }` before returning that whole node.

`parseAddition` wraps `10` and the `5*2` node into the outer `+` node. Precedence is encoded by which function calls which — no explicit table.

**Walkthrough — `throw` internally, `ParseResult` at the boundary:**

Every inner function (`parsePrimary`, `parseUnary`, etc.) throws a plain `Error` when something is wrong. They do not know about `ParseResult`. Each function only focuses on its own grammar rule.

The `try/catch` inside `parse` is the one place that converts a thrown error into a typed `{ success: false, error: { message } }`. This is a deliberate boundary: threading `ParseResult` through every recursive call individually — checking failure at every step — would make each function harder to read for little benefit. One boundary at the top catches everything.

**Walkthrough — `catch (error)` and `error instanceof Error`:**

Unlike lesson 06's bare `catch { ... }`, this `catch (error)` names its caught value —
`error` here holds whatever was thrown, which TypeScript can only assume is `unknown`
(literally anything can be thrown in JavaScript, including a plain string or number,
not just a real `Error` object). `instanceof` is an operator that checks whether a
value was constructed from a specific class — `error instanceof Error` asks "is this
value genuinely an `Error` object?" If the answer is `true`, TypeScript narrows
`error`'s type to `Error` for the rest of that branch, making `.message` safe to
read (every real `Error` has a `.message` string). The `? :` that follows is a
**ternary expression** — a compact `if/else` that produces a value rather than
running a statement: `condition ? valueIfTrue : valueIfFalse`. `error instanceof
Error ? error.message : String(error)` reads as "if this is a real Error, use its
message; otherwise, force whatever was thrown into a string some other way" — a
defensive fallback for the rare case something other than a proper `Error` was thrown.

**Walkthrough — `ParseResult` is also a discriminated union:**

```typescript
type ParseResult =
  | { success: true;  ast: ExpressionNode }
  | { success: false; error: ParseError }
```

When checking which branch you are in, write `result.success === true` (explicit equality), not just `result.success` (truthy check):

```typescript
// Works — explicit equality narrows correctly:
if (result.success === true) {
  result.ast   // TypeScript knows this exists
}

// May not narrow correctly in some setups:
if (result.success) {
  result.ast   // TypeScript may still think error is possible
}
```

The explicit `=== true` check reliably narrows. This is a known TypeScript edge case with `boolean` literal types as discriminants — string literals like `cell.kind === 'formula'` always narrow correctly; boolean literals need the explicit comparison.

---

## Step 3 — Show the AST in the debug panel

**The problem:** `parse` works but nothing shows its output.

Update `debugTokens` to `debugInfo` in `<script setup>` (rename and expand it):

```typescript
interface DebugInfo {
  tokens: Token[]
  parseResult: ParseResult
}

const debugInfo = computed<DebugInfo | null>(() => {
  const sel = selectedCoordinate.value
  if (sel === null) return null
  const cell = cells.value[cellId(sel)]
  if (!cell || cell.kind !== 'formula') return null
  try {
    const tokens = tokenize(cell.expr)
    const parseResult = parse(tokens)
    return { tokens, parseResult }
  } catch {
    return null
  }
})
```

Update the debug panel in `<template>`:

```html
<div class="debug-panel" v-if="debugInfo !== null">
  <h3>Tokens</h3>
  <pre>{{ JSON.stringify(debugInfo.tokens, null, 2) }}</pre>

  <h3>AST</h3>
  <template v-if="debugInfo.parseResult.success === true">
    <pre>{{ JSON.stringify(debugInfo.parseResult.ast, null, 2) }}</pre>
  </template>
  <template v-else>
    <pre class="error">Parse error: {{ debugInfo.parseResult.error.message }}</pre>
  </template>
</div>
<div class="debug-panel debug-empty" v-else>
  <p>(select a formula cell to see its tokens and AST)</p>
</div>
```

Add to `<style>`:

```css
.debug-panel .error { color: #f87171; }
```

Click ▶ Run. Type `=10+5*2` into a cell. Select it — the panel shows tokens and a nested AST with the `*` nested inside the `+`. Type `=(10+5)*2` into another cell — select it: the `+` is now nested inside the `*`. Type `=10+` — select it: parse error message appears in the AST section.

**The panel updates automatically because it is a `computed`.** The same principle from lesson 06: no explicit calls from `selectCell` or `commitEdit`. Vue tracks that `debugInfo` reads `selectedCoordinate.value` and `cells.value`. Any change to either invalidates and re-evaluates `debugInfo`.

**SE lens — parse is a pure function:**

`parse` reads nothing but `tokens`. It writes nothing. No cell lookups, no DOM, no reactive state. You could call `parse(tokenize("10+5*2"))` directly in the browser console and get the same tree the debug panel shows, with no spreadsheet involved at all. Pure functions can be verified in complete isolation — that isolation is what makes this possible.

---

## What breaks without this

**Making `parseAddition` call `parseAddition` for operands instead of `parseMultiplication`:**

Type `=10+5*2`. The function calls itself recursively — `Addition` parsing `Addition` — without ever delegating to `Multiplication`. The `*` is never processed at its correct precedence level; the tree comes out as `(10+5)*2` instead of `10+(5*2)`. Click ▶ Run and check the AST to confirm which nesting you get.

**Removing the leftover-token check:**

Type `=5 5` (two numbers with no operator). `parseExpression` happily returns a tree for the first `5`, leaving the second `5` unconsumed. Without the check, `parse` returns `{ success: true, ast: { kind: 'Number', value: 5 } }` — a successful parse of a malformed formula. The second `5` disappears silently.

**Using `if (result.success)` instead of `if (result.success === true)` in the template:**

Try it. TypeScript may flag access to `result.ast` in the truthy branch with "Property 'ast' does not exist on type 'ParseResult'", even though the logic is correct. This is the boolean discriminant narrowing edge case. The explicit `=== true` comparison avoids it.

---

## Connect the pieces

```
App.vue
  <script setup>
    ExpressionNode     — discriminated union: Number, UnaryExpression,
                         BinaryExpression; recursive type
    ParseResult        — { success: true; ast } | { success: false; error }
    parse()            — pure; Token[] → ParseResult; five nested functions
                         encode precedence via call delegation
    debugInfo          — computed; expands lesson 06's debugTokens to include
                         the parse result; zero explicit calls
  <template>
    result.success === true  — explicit equality required for boolean
                               discriminant narrowing
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] The debug panel shows a correctly nested AST for any arithmetic formula
- [ ] `=10+5*2` shows `*` nested inside `+` (not `+` inside `*`)
- [ ] `=(10+5)*2` shows `+` nested inside `*`
- [ ] A malformed formula like `=10+` shows a clear parse error message
- [ ] You can explain why precedence is encoded by which function calls which
- [ ] You can explain why `while (true) { const token = peek(); if (...) break }` is used instead of a condition in the `while`
- [ ] You can explain why `result.success === true` must be written explicitly for boolean discriminant narrowing

---

*Next: Lesson 08 — Evaluating the Tree. The AST already has the right shape. This lesson walks it recursively and `=10+5*2` finally displays `20`.*
