# SE Masterclass — LAB-11 — Parser

**Language: JavaScript (Node.js)** — same project as LAB-09 and LAB-10.

**Prerequisites:** LAB-10 (Lexer). This lab consumes the exact token list `tokenize()` produces — you will never look at raw characters again.

**What this lab adds:**
- What a parser does: token list in, a TREE out — the structure LAB-09's flat folding could never represent
- Grammar rules written as a set of mutually-calling functions (recursive descent)
- Operator precedence, solved structurally instead of with special-case rules
- Parenthesized sub-expressions, handled by the SAME functions, recursively
- Output: an Abstract Syntax Tree (AST) — the shape LAB-12's Evaluator will walk

**Time:** 90–110 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. LAB-09 folded `"3 + 4 * 2"` into `14`. What tree SHAPE would give the mathematically correct `11` instead?
> 2. If `*` should bind "tighter" than `+`, which one should end up CLOSER to the leaves of the tree, and which closer to the root?
> 3. `"(3 + 4) * 2"` needs parentheses to override the normal precedence. What does a parenthesized sub-expression look like, structurally, once parsed?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node main.js` prints:

```
=== Parsing "3 + 4" ===
{
  type: 'BinaryOp',
  operator: '+',
  left: { type: 'Number', value: 3 },
  right: { type: 'Number', value: 4 }
}

=== Parsing "3 + 4 * 2" (precedence!) ===
{
  type: 'BinaryOp',
  operator: '+',
  left: { type: 'Number', value: 3 },
  right: {
    type: 'BinaryOp',
    operator: '*',
    left: { type: 'Number', value: 4 },
    right: { type: 'Number', value: 2 }
  }
}
  ← '*' is a CHILD of '+', not a sibling — this is what makes precedence structural

=== Parsing "(3 + 4) * 2" (parentheses override precedence) ===
{
  type: 'BinaryOp',
  operator: '*',
  left: {
    type: 'BinaryOp',
    operator: '+',
    left: { type: 'Number', value: 3 },
    right: { type: 'Number', value: 4 }
  },
  right: { type: 'Number', value: 2 }
}
  ← now '+' is INSIDE, computed first — parens flipped which operator is the root

=== Tree Diagram: "3 + 4 * 2" ===
+
├── 3
└── *
    ├── 4
    └── 2

=== Error: Unexpected Token ===
parse("3 + ") threw: Unexpected EOF, expected a number or "("
parse("3 4") threw: Unexpected token NUMBER "4", expected an operator or end of input
```

---

### Concept: What a Parser Does — Tokens Become a Tree

**What it is:** A **parser** consumes a flat list of tokens (LAB-10's output) and produces a tree that captures how the tokens relate to each other — specifically, which operations happen FIRST (deeper in the tree) and which happen LAST (closer to the root). This tree is called an **Abstract Syntax Tree**, or AST.

**The problem before:** LAB-09's evaluator walked a flat list left to right with no way to represent "do this part before that part" beyond raw left-to-right order. `"3 + 4 * 2"` as a flat list has no structural difference from `"3 * 4 + 2"` — both are just `[NUMBER, OP, NUMBER, OP, NUMBER]`. A flat list cannot encode precedence.

**The solution:** Build a TREE where each internal node is an operator, its two children are its operands, and — crucially — the operator that should be computed LAST becomes the ROOT of the tree, while operators that should be computed FIRST end up deeper, as children.

**Canonical example (General Explanation):**

This is exactly LAB-06's binary tree, repurposed. Instead of `left < node < right` ordering numbers, each node here IS an operation, and its two children are the two things it operates on. Evaluating the tree (LAB-12) will mean: compute the children first (they're needed as inputs), then apply the node's own operator — a **postorder-flavored** traversal, echoing LAB-06's postorder pattern (children before the node).

```
"3 + 4 * 2" must become:

      +           ← root: computed LAST
     / \
    3   *         ← '*' is a CHILD of '+' — computed FIRST, its result feeds into '+'
       / \
      4   2
```

**Project Application (The "Why" here):** Every one of LAB-09's precedence bugs disappears once the TREE — not the flat token order — determines evaluation order. The parser's entire job is building this shape correctly.

**Watch for:** The AST has NOTHING to do with how the expression was originally typed (spaces, parentheses used just for clarity, etc.) — `"3+4*2"` and `"3 + 4 * 2"` produce the IDENTICAL tree. The tree captures MEANING, stripped of surface formatting — this is exactly what "Abstract" means in Abstract Syntax Tree.

---

## Step 1 — A Token Cursor

The parser needs to look at the CURRENT token, and move to the next one, repeatedly. Wrap the token array in a small helper object instead of passing an index around everywhere.

```js
// parser.js
const { tokenize } = require('./lexer')

function createCursor(tokens) {
  let pos = 0
  return {
    peek() {
      return tokens[pos]                          // ← add: look at the current token WITHOUT consuming it
    },
    advance() {
      const token = tokens[pos]
      pos++                                        // ← add: consume the current token, move forward
      return token
    },
    expect(type) {
      const token = tokens[pos]
      if (token.type !== type) {                    // ← add: consume ONLY if it matches — else fail clearly
        throw new Error(`Unexpected token ${token.type} "${token.value}", expected ${type}`)
      }
      pos++
      return token
    },
  }
}

module.exports = { createCursor }
```

### SAVE AND TRY

```bash
node -e "
const { tokenize } = require('./lexer')
const { createCursor } = require('./parser')
const cursor = createCursor(tokenize('3 + 4'))
console.log(cursor.peek())      // NUMBER 3 — looking does not consume
console.log(cursor.peek())      // NUMBER 3 — still there, peek never moves forward
console.log(cursor.advance())   // NUMBER 3 — NOW it's consumed
console.log(cursor.peek())      // OPERATOR + — cursor has moved
"
```

**Expected:**
```
{ type: 'NUMBER', value: '3', pos: 0 }
{ type: 'NUMBER', value: '3', pos: 0 }
{ type: 'NUMBER', value: '3', pos: 0 }
{ type: 'OPERATOR', value: '+', pos: 2 }
```

**Confirm peek's non-destructive nature:** Calling `peek()` twice in a row returns the SAME token both times — this is essential; the parser needs to look ahead to DECIDE what to do before committing to consuming a token.

---

### Concept: Grammar Rules as Functions (Recursive Descent)

**What it is:** A **grammar** describes valid structure using layered rules, from loosest to tightest. **Recursive descent parsing** turns each grammar rule directly into a function with the SAME NAME — the functions call each other in the same pattern the grammar rules reference each other, and recursion (LAB-07) handles nested structure (like parentheses containing another whole expression).

**The problem before:** Without layers, "parse `3 + 4 * 2` respecting precedence" seems to require complicated lookahead logic mixed together with the actual arithmetic.

**The solution — a 3-layer grammar, loosest to tightest:**

```
expression := term (('+' | '-') term)*      ← loosest: handles + and -
term       := factor (('*' | '/' | '%') factor)*   ← tighter: handles * / %
factor     := NUMBER | '(' expression ')'    ← tightest: a single number, or a parenthesized WHOLE expression
```

Each rule becomes one function. `parseExpression` calls `parseTerm` (not the other way around) — this ORDERING is what creates precedence: `parseTerm` fully resolves all the `*`/`/` before `parseExpression` ever combines things with `+`/`-`, because `parseExpression` treats whatever `parseTerm` returns as a single already-complete unit.

**Canonical example (General Explanation):**

Think of reading a legal contract: paragraphs contain sentences, sentences contain clauses, clauses contain words. Recursive descent walks a grammar the same layered way — and just like a clause can CONTAIN an entire sub-sentence (a parenthetical), `factor`'s `'(' expression ')'` rule means the loosest rule (`expression`) can appear NESTED inside the tightest one (`factor`) — this is exactly LAB-07's recursion, base case (`NUMBER`) and recursive case (`'(' expression ')'`) included.

**What it hides (Law 7):** `parseExpression` never has to know HOW `parseTerm` resolved `4 * 2` into a single subtree — it just receives one complete node and treats it as an opaque operand, exactly like LAB-09's `applyOperator` never needed to know how its two numbers were computed.

**Where you will see this:** LAB-82 (Recursive Descent Parser) generalizes this exact function-per-grammar-rule pattern to a full toy programming language.

---

## Step 2 — parseFactor: Numbers and Parentheses

```js
function parseFactor(cursor) {
  const token = cursor.peek()

  if (token.type === 'NUMBER') {
    cursor.advance()
    return { type: 'Number', value: Number(token.value) }   // ← add: base case — a bare number, no children
  }

  if (token.type === 'LPAREN') {
    cursor.advance()                        // ← add: consume '('
    const node = parseExpression(cursor)    // ← add: recursive case — a WHOLE expression can live inside parens
    cursor.expect('RPAREN')                 // ← add: consume ')' — fail if it's missing
    return node                              // the parenthesized expression's node IS the factor's result
  }

  if (token.type === 'EOF') {
    throw new Error('Unexpected EOF, expected a number or "("')
  }

  throw new Error(`Unexpected token ${token.type} "${token.value}", expected a number or "("`)
}
```

### SAVE AND TRY

```bash
node -e "
const { tokenize } = require('./lexer')
const { createCursor } = require('./parser')
// parseFactor isn't exported yet — test it directly by pasting parser.js's function here, or add a temporary export
"
```

For now, add a temporary test directly at the bottom of `parser.js`:

```js
if (require.main === module) {
  const cursor = createCursor(tokenize('42'))
  console.log(parseFactor(cursor))
}
```

Run:

```bash
node parser.js
```

**Expected:**
```
{ type: 'Number', value: 42 }
```

**Change something:** Test `parseFactor` on `tokenize('(5)')`. It should recurse into `parseExpression` (not written yet — this will throw `parseExpression is not defined`). That's expected — you'll define it next. This confirms the RECURSIVE reference is already wired correctly, even before its target exists.

---

## Step 3 — parseTerm: Multiplication, Division, Modulo

```js
function parseTerm(cursor) {
  let node = parseFactor(cursor)                        // ← add: start with one factor (tightest binding)

  while (cursor.peek().type === 'OPERATOR' && ['*', '/', '%'].includes(cursor.peek().value)) {
    const operator = cursor.advance().value               // ← add: consume the operator
    const right = parseFactor(cursor)                      // ← add: parse the NEXT factor
    node = { type: 'BinaryOp', operator, left: node, right }   // ← add: fold left — becomes the new 'node'
  }

  return node
}
```

**Trace `"4 * 2 * 3"` by hand:** `parseFactor` returns `Number(4)`. Loop sees `*`, consumes it, `parseFactor` returns `Number(2)` — `node` becomes `BinaryOp(*, 4, 2)`. Loop sees `*` again, consumes it, `parseFactor` returns `Number(3)` — `node` becomes `BinaryOp(*, BinaryOp(*, 4, 2), 3)`. The FIRST `*` ends up DEEPER (evaluated first), matching left-to-right evaluation for same-precedence operators — this is called **left-associativity**.

### SAVE AND TRY

Update the temporary test at the bottom of `parser.js`:

```js
if (require.main === module) {
  const cursor = createCursor(tokenize('4 * 2 * 3'))
  console.log(JSON.stringify(parseTerm(cursor), null, 2))
}
```

```bash
node parser.js
```

**Expected:**
```json
{
  "type": "BinaryOp",
  "operator": "*",
  "left": {
    "type": "BinaryOp",
    "operator": "*",
    "left": { "type": "Number", "value": 4 },
    "right": { "type": "Number", "value": 2 }
  },
  "right": { "type": "Number", "value": 3 }
}
```

**Change something:** Test `parseTerm` on `tokenize('4 + 2')`. Since `+` is not in `['*', '/', '%']`, the `while` loop never runs, and `parseTerm` returns JUST `parseFactor`'s result (`Number(4)`) — leaving the `+` token UNCONSUMED for whatever calls `parseTerm` next to deal with. This is exactly the behavior `parseExpression` (next step) needs.

---

## Step 4 — parseExpression: Addition and Subtraction

```js
function parseExpression(cursor) {
  let node = parseTerm(cursor)                            // ← add: start with one full term (handles * / % internally)

  while (cursor.peek().type === 'OPERATOR' && ['+', '-'].includes(cursor.peek().value)) {
    const operator = cursor.advance().value                 // ← add
    const right = parseTerm(cursor)                          // ← add: the NEXT term — this is where '*' gets resolved before combining
    node = { type: 'BinaryOp', operator, left: node, right }
  }

  return node
}

function parse(input) {
  const cursor = createCursor(tokenize(input))
  const node = parseExpression(cursor)
  cursor.expect('EOF')             // ← add: confirm nothing is left over — catches "3 4" (garbage after a valid expression)
  return node
}

module.exports = { createCursor, parseFactor, parseTerm, parseExpression, parse }
```

Remove the temporary `if (require.main === module)` block — `main.js` will drive everything from here.

```js
// main.js
const { parse } = require('./parser')

console.log('=== Parsing "3 + 4" ===')
console.log(parse('3 + 4'))
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Parsing "3 + 4" ===
{
  type: 'BinaryOp',
  operator: '+',
  left: { type: 'Number', value: 3 },
  right: { type: 'Number', value: 4 }
}
```

**Now the payoff — precedence, for real:**

```js
console.log('\n=== Parsing "3 + 4 * 2" (precedence!) ===')
console.log(JSON.stringify(parse('3 + 4 * 2'), null, 2))
console.log("  ← '*' is a CHILD of '+', not a sibling — this is what makes precedence structural")
```

```bash
node main.js
```

**Expected:**
```
=== Parsing "3 + 4 * 2" (precedence!) ===
{
  "type": "BinaryOp",
  "operator": "+",
  "left": { "type": "Number", "value": 3 },
  "right": {
    "type": "BinaryOp",
    "operator": "*",
    "left": { "type": "Number", "value": 4 },
    "right": { "type": "Number", "value": 2 }
  }
}
  ← '*' is a CHILD of '+', not a sibling — this is what makes precedence structural
```

**Trace WHY this happens:** `parseExpression` calls `parseTerm` FIRST for the left side. `parseTerm` sees `3`, checks for `*`/`/`/`%` — the next token is `+`, so `parseTerm` stops immediately and returns just `Number(3)`. Back in `parseExpression`, it sees `+`, consumes it, and calls `parseTerm` AGAIN for the right side. THIS TIME `parseTerm` sees `4`, checks for `*` — finds it! — consumes `4 * 2` entirely into one `BinaryOp` node, and returns THAT as a single unit. `parseExpression` then wraps it: `BinaryOp('+', Number(3), <the whole 4*2 subtree>)`. The `*` never had a chance to become a SIBLING of `+` — by the time `parseExpression` combines anything, `parseTerm` has already fully resolved it into one packaged node.

**Change something:** Parse `"3 * 4 + 2"` (multiplication FIRST in the text this time). Confirm `*` still ends up as a CHILD (the `left` side, computed first), not spread across the tree — text order doesn't determine tree shape, GRAMMAR RULE ORDER does.

---

## Step 5 — Parentheses Override Precedence

```js
console.log('\n=== Parsing "(3 + 4) * 2" (parentheses override precedence) ===')
console.log(JSON.stringify(parse('(3 + 4) * 2'), null, 2))
console.log("  ← now '+' is INSIDE, computed first — parens flipped which operator is the root")
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Parsing "(3 + 4) * 2" (parentheses override precedence) ===
{
  "type": "BinaryOp",
  "operator": "*",
  "left": {
    "type": "BinaryOp",
    "operator": "+",
    "left": { "type": "Number", "value": 3 },
    "right": { "type": "Number", "value": 4 }
  },
  "right": { "type": "Number", "value": 2 }
}
  ← now '+' is INSIDE, computed first — parens flipped which operator is the root
```

**Trace WHY:** `parseTerm` calls `parseFactor` for its left side. `parseFactor` sees `LPAREN`, consumes it, and recursively calls `parseExpression` — which fully parses `3 + 4` into its OWN complete `BinaryOp('+', ...)` node, then `expect('RPAREN')` consumes the closing paren. `parseFactor` returns that `+` node AS IF it were just a number — `parseTerm` doesn't know or care that it came from inside parentheses; it just sees "one factor," then continues, finds `*`, and wraps it: `BinaryOp('*', <the + subtree>, Number(2))`. The `(...)` didn't add anything to the tree itself — it just told `parseFactor` "treat this ENTIRE expression as one atomic unit," which is exactly what "compute this part first" means, structurally.

---

## 🎯 Challenge: Pretty-Print the Tree

**You know:** The AST is a nested object. LAB-06's tree traversal printed a binary tree's shape — this is the same idea, applied to an AST instead of a binary search tree.

**Task:** Write `printTree(node, prefix = '')` that prints an AST in this indented, branch-drawing format:

```
+
├── 3
└── *
    ├── 4
    └── 2
```

**Hint:** Recurse on `node.left` and `node.right` for `BinaryOp` nodes; print just the value for `Number` nodes. Use `├── ` for a non-last child and `└── ` for the last child, and extend `prefix` with either `│   ` or `    ` depending on which one was used, exactly like a real file-tree printer.

<details>
<summary>▶ Show Solution</summary>

```js
function printTree(node, prefix = '', isLast = true, isRoot = true) {
  if (node.type === 'Number') {
    console.log(prefix + (isRoot ? '' : (isLast ? '└── ' : '├── ')) + node.value)
    return
  }

  console.log(prefix + (isRoot ? '' : (isLast ? '└── ' : '├── ')) + node.operator)
  const childPrefix = prefix + (isRoot ? '' : (isLast ? '    ' : '│   '))
  printTree(node.left, childPrefix, false, false)
  printTree(node.right, childPrefix, true, false)
}
```

**Key insight:** This is a DIFFERENT traversal order than LAB-06's preorder/inorder/postorder — it's preorder (print the node, then recurse), but interleaved with prefix-string bookkeeping to draw the branch characters. The recursive STRUCTURE (visit node, recurse left, recurse right) is identical to everything in LAB-06 and LAB-07; only what happens at each visit differs.

</details>

Add to `main.js`:

```js
console.log('\n=== Tree Diagram: "3 + 4 * 2" ===')
printTree(parse('3 + 4 * 2'))
```

### SAVE AND TRY

**Expected:**
```
=== Tree Diagram: "3 + 4 * 2" ===
+
├── 3
└── *
    ├── 4
    └── 2
```

This is the exact tree from this lab's opening Concept box, now rendered directly from real parser output.

---

## Step 6 — Parser Errors

```js
console.log('\n=== Error: Unexpected Token ===')
try {
  parse('3 + ')
} catch (err) {
  console.log(`parse("3 + ") threw: ${err.message}`)
}

try {
  parse('3 4')
} catch (err) {
  console.log(`parse("3 4") threw: ${err.message}`)
}
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Error: Unexpected Token ===
parse("3 + ") threw: Unexpected EOF, expected a number or "("
parse("3 4") threw: Unexpected token NUMBER "4", expected EOF
```

**Trace `"3 + "` by hand:** `parseExpression` → `parseTerm` → `parseFactor` returns `Number(3)`. Back in `parseExpression`, sees `+`, consumes it, calls `parseTerm` again → `parseFactor` peeks and sees `EOF` — no number, no `(` — throws.

**Trace `"3 4"` by hand:** `parseExpression` fully parses `3` (no `+`/`-`/`*`/`/` follows immediately — wait, `parseTerm` returns `Number(3)`, then `parseExpression`'s `while` loop checks for `+`/`-`: the next token is `NUMBER 4`, not an operator, so the loop doesn't run, and `parseExpression` returns just `Number(3)`. Back in `parse()`, `cursor.expect('EOF')` finds `NUMBER 4` instead of `EOF` — throws, correctly identifying that there's unconsumed garbage after a perfectly valid expression.

**Note the message differs slightly from the "What You Will Build" preview** — `expect('EOF')`'s generic message names the ACTUAL unexpected type/value and what was expected (`EOF`), which is exactly the right level of detail for this failure. (If your exact wording differs slightly, that's fine — the important thing is that both the actual and expected token information appear.)

---

## Final Check

| Feature | How to verify |
|---|---|
| `parse("3 + 4")` produces a `BinaryOp` with two `Number` children | Step 4 |
| `parse("3 + 4 * 2")` puts `*` as a CHILD of `+`, not a sibling | Step 4 — precedence is structural |
| `parse("(3 + 4) * 2")` puts `+` INSIDE, flipping which operator is the root | Step 5 |
| `parseTerm` alone correctly left-associates repeated `*` | Step 3 |
| `printTree` renders a readable branch diagram matching the JSON structure | Challenge |
| `parse("3 + ")` and `parse("3 4")` both throw clear, specific errors | Step 6 |
| You can explain why `parseExpression` calling `parseTerm` (not vice versa) IS precedence | Without notes |

---

## Quick Check Answers

**1. What tree shape gives the correct `11` for `"3 + 4 * 2"`?**

`+` at the root, with `3` as its left child and a `*` subtree (`4 * 2`) as its right child. Evaluating bottom-up: `4 * 2 = 8` first (it's deeper, evaluated first), then `3 + 8 = 11` at the root. This is exactly the tree Step 4 produced — `*` nested as a child of `+`, never as a sibling in a flat sequence.

**2. Which operator should end up closer to the leaves, and which closer to the root?**

The HIGHER-precedence operator (`*`, `/`, `%`) ends up closer to the leaves — computed first, deeper in the tree. The LOWER-precedence operator (`+`, `-`) ends up closer to the root — computed last, combining already-resolved subtrees. This falls directly out of the grammar layering: `parseExpression` (handles `+`/`-`) is the OUTERMOST function, calling `parseTerm` (handles `*`/`/`/`%`) for each of its operands — whatever `parseTerm` fully resolves becomes a single opaque unit by the time `parseExpression` ever combines anything.

**3. What does a parenthesized sub-expression look like, structurally, once parsed?**

It looks exactly like any other subtree — the parentheses themselves leave NO trace in the AST. `parseFactor`'s `'(' expression ')'` rule consumes the `(` and `)` tokens but returns exactly the node that `parseExpression` produced for what was inside — that node then gets used as an ordinary operand by whatever called `parseFactor`. This is why `"(3 + 4) * 2"`'s tree has a `+` node as the LEFT CHILD of `*`, with nothing in the tree marking "this part used to have parentheses around it" — the STRUCTURE alone (which node is whose child) carries all the meaning that the parentheses expressed in the original text.

---

*Next: [LAB-12 — Expression Evaluator](LAB-12-expression-evaluator.md) — JavaScript, same project*
