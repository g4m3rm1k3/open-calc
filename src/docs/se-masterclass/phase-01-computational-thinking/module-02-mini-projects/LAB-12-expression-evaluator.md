# SE Masterclass — LAB-12 — Expression Evaluator

**Language: JavaScript (Node.js)** — same project as LAB-09, LAB-10, and LAB-11.

**Prerequisites:** LAB-11 (Parser). This lab consumes the AST `parse()` produces and finally computes a number — completing the lexer → parser → evaluator pipeline this whole module has been building toward.

**What this lab adds:**
- Walking an AST recursively to compute a value — the **interpreter pattern**
- Confirming, with real output, that precedence now "just works" — no special-case logic needed
- Variables: an environment (symbol table) that remembers assigned names between expressions
- Completing the full pipeline: raw string in, correct number out, in one function

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Evaluating a `BinaryOp` node needs the VALUES of its `left` and `right` children first. What programming pattern from LAB-06/LAB-07 does "resolve children before the parent" describe?
> 2. If the evaluator has no special code anywhere that mentions "precedence," how does `"3 + 4 * 2"` still correctly evaluate to `11`?
> 3. `"x = 5"` followed later by `"x + 3"` — what has to persist BETWEEN two separate calls to the evaluator for this to work?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node main.js` prints:

```
=== Evaluating "3 + 4" ===
3 + 4 = 7

=== Evaluating "3 + 4 * 2" (precedence, for free) ===
3 + 4 * 2 = 11

=== Evaluating "(3 + 4) * 2" ===
(3 + 4) * 2 = 14

=== Evaluating "2 ^ 3 ^ 2" (compare to LAB-09's naive left-to-right) ===
2 ^ 3 ^ 2 = 64
  ← same left-associative answer as LAB-09 — this evaluator doesn't special-case ^ as right-associative

=== Division by Zero ===
"10 / 0" threw: division by zero

=== Variables ===
x = 5
x + 3 = 8
y = x * 2
y = 10
x + y = 15

=== Undefined Variable ===
"z + 1" threw: undefined variable "z"

=== Full Pipeline, Start to Finish ===
"3 + 4 * (2 - 1)" -> tokenize -> parse -> evaluate -> 7
```

---

### Concept: The Interpreter Pattern — Walking a Tree to Produce a Value

**What it is:** Evaluating an AST means visiting each node and computing a value FOR that node, using the ALREADY-COMPUTED values of its children. A `Number` node's value is itself. A `BinaryOp` node's value is `operator(evaluate(left), evaluate(right))`.

**The problem before:** The AST is just nested objects — `{ type: 'BinaryOp', operator: '+', left: {...}, right: {...} }`. Nothing about it, by itself, produces a number. Something has to walk it and turn structure into a value.

**The solution:** A recursive function, structurally identical to LAB-06's `postorder` traversal (children before the node) and LAB-07's branching recursion (two recursive calls per `BinaryOp` node, echoing Tower of Hanoi's two calls per invocation):

```js
function evaluate(node) {
  if (node.type === 'Number') {
    return node.value                                    // base case — nothing to recurse into
  }
  if (node.type === 'BinaryOp') {
    const left = evaluate(node.left)                       // recurse — resolve the left subtree first
    const right = evaluate(node.right)                      // recurse — resolve the right subtree
    return applyOperator(node.operator, left, right)        // NOW combine — reusing LAB-09's dispatch table
  }
}
```

**Canonical example (General Explanation):**

Think of a company org chart (LAB-06's tree again) where each manager's "total headcount under them" can only be computed once every DIRECT REPORT's headcount is known — which itself requires knowing THEIR reports' headcounts. You resolve the leaves (individual contributors, headcount 1) first, then sum upward. `evaluate` resolves numeric leaves first, then combines upward through every `BinaryOp` node, ending at the root.

**Project Application (The "Why" here):**

`applyOperator` is LITERALLY the dispatch table from LAB-09, unchanged. Nothing about combining two numbers with an operator is different — what changed across three labs is WHERE the two numbers come from: LAB-09 got them from array positions, this lab gets them from recursively evaluating subtrees.

**Watch for:** `evaluate` never looks at `node.operator` for `Number` nodes, and never looks at `node.value` for `BinaryOp` nodes — each node TYPE has its own shape, and the function branches on `node.type` first, exactly like LAB-06's traversal functions branched on `node == nullptr` before touching `node->value`.

---

## Step 1 — Walk the Tree

```js
// evaluator.js
const { parse } = require('./parser')

const operators = {                              // ← add: reused directly from LAB-09's dispatch table
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => {
    if (b === 0) throw new Error('division by zero')
    return a / b
  },
  '%': (a, b) => a % b,
  '^': (a, b) => a ** b,
}

function evaluate(node) {
  if (node.type === 'Number') {
    return node.value                              // ← add: base case
  }

  if (node.type === 'BinaryOp') {
    const left = evaluate(node.left)                 // ← add: recurse left FIRST
    const right = evaluate(node.right)                // ← add: recurse right SECOND
    const fn = operators[node.operator]
    return fn(left, right)                             // ← add: combine LAST — same order as LAB-06's postorder
  }

  throw new Error(`Unknown node type: ${node.type}`)
}

function run(input) {
  return evaluate(parse(input))                       // ← add: full pipeline — string in, number out
}

module.exports = { evaluate, run }
```

```js
// main.js
const { run } = require('./evaluator')

console.log('=== Evaluating "3 + 4" ===')
console.log(`3 + 4 = ${run('3 + 4')}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Evaluating "3 + 4" ===
3 + 4 = 7
```

**Trace it by hand:** `parse('3 + 4')` produces `BinaryOp('+', Number(3), Number(4))`. `evaluate` sees `BinaryOp`, calls `evaluate(Number(3))` → returns `3` (base case). Calls `evaluate(Number(4))` → returns `4`. Looks up `operators['+']`, calls it with `(3, 4)` → `7`.

**Change something:** Call `run('100 - 58')`. Should print `42`. This confirms the SAME `evaluate` function handles every operator — nothing operator-specific is hardcoded in `evaluate` itself, only inside the `operators` dispatch table.

---

## Step 2 — Precedence, Confirmed by Real Output

```js
console.log('\n=== Evaluating "3 + 4 * 2" (precedence, for free) ===')
console.log(`3 + 4 * 2 = ${run('3 + 4 * 2')}`)

console.log('\n=== Evaluating "(3 + 4) * 2" ===')
console.log(`(3 + 4) * 2 = ${run('(3 + 4) * 2')}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Evaluating "3 + 4 * 2" (precedence, for free) ===
3 + 4 * 2 = 11

=== Evaluating "(3 + 4) * 2" ===
(3 + 4) * 2 = 14
```

**This is the payoff of the entire module.** LAB-09's naive left-to-right folding gave `14` for `"3 + 4 * 2"` — WRONG. This evaluator gives `11` — CORRECT — and `evaluate` contains ZERO code that mentions precedence, operator binding strength, or "check if the next operator is `*`." The correctness comes ENTIRELY from the TREE SHAPE that LAB-11's parser built. `evaluate` just walks whatever tree it's given, children before parent, every time — the grammar layering (`parseExpression` calling `parseTerm` calling `parseFactor`) did all the precedence work, once, at parse time, so the evaluator never has to think about it again.

**Change something:** Evaluate `"2 ^ 3 ^ 2"`:

```js
console.log('\n=== Evaluating "2 ^ 3 ^ 2" (compare to LAB-09\'s naive left-to-right) ===')
console.log(`2 ^ 3 ^ 2 = ${run('2 ^ 3 ^ 2')}`)
console.log("  ← same left-associative answer as LAB-09 — this evaluator doesn't special-case ^ as right-associative")
```

**Expected:** `64` (computed as `(2^3)^2 = 8^2 = 64`), matching LAB-09's left-to-right answer exactly — because LAB-11's `parseTerm`/`parseExpression` pattern doesn't currently give `^` special right-associative treatment (real math convention says `2^(3^2) = 2^9 = 512`). This is a genuine, honest limitation carried forward from LAB-11 — not every mathematical convention was implemented, and this lab doesn't hide that.

---

## Step 3 — Errors Propagate Naturally

```js
console.log('\n=== Division by Zero ===')
try {
  run('10 / 0')
} catch (err) {
  console.log(`"10 / 0" threw: ${err.message}`)
}
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Division by Zero ===
"10 / 0" threw: division by zero
```

**Why no extra code was needed:** `operators['/']`'s guard clause (`if (b === 0) throw ...`) was already written in Step 1, reused directly from LAB-09's `divide()`. The error thrown deep inside a recursive `evaluate` call automatically propagates all the way back up through every level of recursion — JavaScript's `throw`/`catch` unwinds the call stack exactly like LAB-07's stack-frame diagrams showed returns unwinding, except it skips straight past every pending frame to the nearest `catch`, instead of returning normally through each one.

---

### Concept: Variables Need Memory Between Calls

**What it is:** So far, `evaluate` is a **pure function** (LAB-02's term) — same AST in, same number out, every time, with no memory of anything. Supporting `"x = 5"` followed later by `"x + 3"` requires something that PERSISTS across two separate calls: an **environment** (also called a symbol table) — a hash map (LAB-04) from variable names to their current values.

**The problem before:** If `evaluate` only ever looks at the AST it's given, `"x + 3"` has no way to know what `x` is — the information "`x` was assigned `5`" lived in a PREVIOUS, now-finished call to `evaluate`, and that call's local variables are gone (LAB-07's call-stack lesson: a finished call's stack frame doesn't linger).

**The solution:** Store the environment OUTSIDE any single `evaluate` call — as a plain object that lives as long as the program (or REPL session) does, and pass it INTO `evaluate` so every call can read from and write to the SAME shared map.

**Canonical example (General Explanation):**

Think of a whiteboard in a shared office. Each meeting (each call to `evaluate`) can read what's currently written on it and add new notes — but the whiteboard itself persists between meetings; it isn't erased when one meeting ends. The environment object is that whiteboard.

```js
const env = {}                       // the whiteboard — persists across calls

function evaluate(node, env) {
  if (node.type === 'Assignment') {
    const value = evaluate(node.value, env)
    env[node.name] = value            // write to the shared whiteboard
    return value
  }
  if (node.type === 'Identifier') {
    if (!(node.name in env)) throw new Error(`undefined variable "${node.name}"`)
    return env[node.name]             // read from the shared whiteboard
  }
  // ... Number and BinaryOp cases as before, threading env through recursive calls
}
```

**Where you will see this again:** LAB-83 (Tree-Walking Interpreter) generalizes this EXACT environment pattern to a full language with functions and scoping. LAB-16 (Simple VM) reintroduces the same idea as VM "registers" or "memory slots" instead of a JS object.

---

## Step 4 — Add Variables to the Lexer, Parser, and Evaluator

Variables require small additions at every stage of the pipeline — a good final check that you understand how the three stages connect.

**Lexer addition** (`lexer.js`):

```js
function isLetter(char) {
  return /[a-zA-Z_]/.test(char)                     // ← add: identifiers start with a letter or underscore
}
```

Inside `tokenize`'s main loop, add a new case (alongside the existing digit/operator/paren cases):

```js
if (isLetter(char)) {
  const start = pos
  while (pos < input.length && /[a-zA-Z0-9_]/.test(input[pos])) {
    pos++                                            // ← add: consume letters, digits, underscores
  }
  tokens.push({ type: 'IDENTIFIER', value: input.slice(start, pos), pos: start })
  continue
}
```

Add `'='` as a recognized single-character token type, `ASSIGN`, alongside the existing operator/paren cases.

**Parser addition** (`parser.js`):

```js
function parseStatement(cursor) {
  if (cursor.peek().type === 'IDENTIFIER') {
    const savedPos = cursor.peek().pos                       // for a clean error if this ISN'T actually an assignment
    const nameToken = cursor.advance()
    if (cursor.peek().type === 'ASSIGN') {
      cursor.advance()                                          // consume '='
      const value = parseExpression(cursor)
      return { type: 'Assignment', name: nameToken.value, value }
    }
    // not an assignment after all — an identifier used inside an expression, like "x + 3"
    // rewind isn't simple with this cursor design, so instead: build an Identifier node directly here
    // and let parseExpression-style logic continue from the '+' — for this lab, keep it simple:
    // require assignments to be the ENTIRE statement, and handle bare identifiers inside parseFactor instead.
  }
  return parseExpression(cursor)
}
```

Add an `IDENTIFIER` case inside `parseFactor` (alongside `NUMBER` and `LPAREN`):

```js
if (token.type === 'IDENTIFIER') {
  cursor.advance()
  return { type: 'Identifier', name: token.value }
}
```

**Evaluator addition** (`evaluator.js`):

```js
function evaluate(node, env) {                        // ← changed: evaluate now takes env
  if (node.type === 'Number') return node.value

  if (node.type === 'Identifier') {                     // ← add
    if (!(node.name in env)) throw new Error(`undefined variable "${node.name}"`)
    return env[node.name]
  }

  if (node.type === 'Assignment') {                      // ← add
    const value = evaluate(node.value, env)
    env[node.name] = value
    return value
  }

  if (node.type === 'BinaryOp') {
    const left = evaluate(node.left, env)                  // ← changed: thread env through
    const right = evaluate(node.right, env)
    const fn = operators[node.operator]
    return fn(left, right)
  }

  throw new Error(`Unknown node type: ${node.type}`)
}

function run(input, env) {
  const cursor = createCursor(tokenize(input))
  const node = parseStatement(cursor)
  cursor.expect('EOF')
  return evaluate(node, env)                              // ← changed: pass env through
}
```

### SAVE AND TRY

```js
console.log('\n=== Variables ===')
const env = {}                                            // ← add: one shared environment for this whole session
console.log(`x = 5`); run('x = 5', env)
console.log(`x + 3 = ${run('x + 3', env)}`)
console.log(`y = x * 2`); run('y = x * 2', env)
console.log(`y = ${env.y}`)
console.log(`x + y = ${run('x + y', env)}`)
```

```bash
node main.js
```

**Expected:**
```
=== Variables ===
x = 5
x + 3 = 8
y = x * 2
y = 10
x + y = 15
```

**Confirm the persistence:** `run('x + 3', env)` on its OWN would fail with `undefined variable "x"` if `run('x = 5', env)` hadn't already written `x` into `env` FIRST, using the SAME `env` object passed both times. This is the environment acting as the "whiteboard" from the Concept box — one shared object, mutated across multiple calls.

**Change something:** Call `run('x + 3', {})` — a FRESH, empty environment instead of the shared one. Confirm it throws `undefined variable "x"`, proving the persistence comes from REUSING the same `env` object, not from some hidden global state.

---

## 🎯 Challenge: Undefined Variable Error

**You know:** `evaluate`'s `Identifier` case already checks `if (!(node.name in env))` before returning a value.

**Task:** Confirm this produces a clear error for a variable that was never assigned, and wire it into `main.js`.

<details>
<summary>▶ Show Solution</summary>

The check already exists from Step 4 — no new code needed, just exercising it:

```js
console.log('\n=== Undefined Variable ===')
try {
  run('z + 1', env)
} catch (err) {
  console.log(`"z + 1" threw: ${err.message}`)
}
```

**Key insight:** This is the SAME boundary-validation habit from LAB-09 and LAB-10, applied at the evaluator stage — `in` is a fast, direct hash-map membership check (LAB-04, LAB-08's O(1) hash lookups), so verifying a variable exists before reading it costs almost nothing and turns a silent `undefined` (JavaScript's default behavior for a missing object property) into a clear, immediate, catchable error.

</details>

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Undefined Variable ===
"z + 1" threw: undefined variable "z"
```

---

## Step 5 — The Complete Pipeline, Named Explicitly

```js
console.log('\n=== Full Pipeline, Start to Finish ===')
const input = '3 + 4 * (2 - 1)'
const result = run(input, {})
console.log(`"${input}" -> tokenize -> parse -> evaluate -> ${result}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Full Pipeline, Start to Finish ===
"3 + 4 * (2 - 1)" -> tokenize -> parse -> evaluate -> 7
```

**Trace the whole pipeline by hand, one more time, start to finish:**
1. **Lexer:** `"3 + 4 * (2 - 1)"` → `[NUMBER(3), OPERATOR(+), NUMBER(4), OPERATOR(*), LPAREN, NUMBER(2), OPERATOR(-), NUMBER(1), RPAREN, EOF]`
2. **Parser:** builds `BinaryOp('+', Number(3), BinaryOp('*', Number(4), BinaryOp('-', Number(2), Number(1))))`
3. **Evaluator:** `evaluate` resolves `2 - 1 = 1` first (deepest), then `4 * 1 = 4`, then `3 + 4 = 7`

Three labs, three independently-testable stages, one correct answer — and each stage's OUTPUT is exactly the next stage's documented INPUT, which is the entire reason decomposition (LAB-09's opening Concept) was worth doing.

---

## Final Check

| Feature | How to verify |
|---|---|
| `run('3 + 4')` returns `7` | Step 1 |
| `run('3 + 4 * 2')` returns `11`, not LAB-09's incorrect `14` | Step 2 — precedence confirmed |
| `run('(3 + 4) * 2')` returns `14` | Step 2 |
| Division by zero throws and is catchable | Step 3 |
| `env` persists a variable's value across two separate `run()` calls | Step 4 |
| An undefined variable throws a clear error, not silent `undefined` | Challenge |
| The full pipeline (`tokenize` → `parse` → `evaluate`) produces the correct answer for a nested expression | Step 5 |
| You can explain why `evaluate` has no precedence-related code, out loud | The tree shape already encodes it |

---

## Quick Check Answers

**1. "Resolve children before the parent" — what pattern is this?**

Postorder traversal, from LAB-06 (children before the node) — and more generally, the recursive base-case/recursive-case contract from LAB-07: a `BinaryOp` node's own value cannot be computed until its `left` and `right` children have ALREADY produced their values, which is exactly the dependency order LAB-06's `postorder(node)` used (recurse left, recurse right, THEN visit the node itself).

**2. How does `"3 + 4 * 2"` evaluate correctly with zero precedence-related code in `evaluate`?**

Because the WORK of respecting precedence already happened, once, in LAB-11's parser — by the time `evaluate` receives the tree, `*` is already positioned as a CHILD of `+` in the tree structure. `evaluate` doesn't need to know or care WHY the tree is shaped that way; it just recursively resolves children before parents, every time, for every tree, regardless of what expression produced it. Precedence became a PARSE-TIME concern entirely, invisible at evaluation time — this separation of concerns across pipeline stages is the payoff of decomposing the problem into lexer/parser/evaluator in the first place.

**3. What has to persist between `"x = 5"` and a later `"x + 3"`?**

The environment object (`env`) — specifically, the SAME environment object instance must be passed into both calls to `run`/`evaluate`. `"x = 5"` writes `env.x = 5`. Nothing inside `evaluate` itself remembers this — `evaluate` is still a pure function of `(node, env)` — the memory lives entirely in the `env` object the CALLER chooses to keep and reuse. This lab confirmed the shared-state requirement directly: reusing `env` across calls let `x` resolve to `5` later, while passing a fresh `{}` for the same `"x + 3"` correctly failed with `undefined variable "x"`.

---

*Next: [LAB-13 — State Machine](LAB-13-state-machine.md) — JavaScript, a new mini-project*
