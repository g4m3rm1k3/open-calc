# SE Masterclass — LAB-09 — Calculator

**Language: JavaScript (Node.js)** — the language for all of Module 2.
*Why one language now:* Module 1 rotated languages because each lab stood alone. Module 2 is different — this calculator's dispatch table becomes the Lexer's token dispatch (LAB-10), which feeds the Parser (LAB-11), which feeds the Evaluator (LAB-12), which grows into a full VM (LAB-16). Code and concepts carry forward lab to lab, so the language has to stay fixed.

**Prerequisites:** LAB-01–08 (all of Module 1).

**What this lab adds:**
- Decomposing "evaluate an expression" into separate, testable pieces
- Dispatch tables: replacing a chain of `if/else` with an object that maps a key to a function
- Input validation at a system boundary — the terminal, where anything can be typed
- A real limitation you will feel directly, that motivates the rest of Module 2

**Time:** 60–80 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If you write `if (op === '+') ... else if (op === '-') ... else if (op === '*') ...`, and later need to add 10 more operators, what has to change?
> 2. `"3 + 4 * 2"` — evaluated strictly left to right, ignoring math class precedence rules — what answer do you get? Is it the mathematically "correct" one?
> 3. A user types `"3 / 0"` into your calculator. What should happen — a crash, a special value, or an error message?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `node main.js` prints:

```
=== Two-Operand Calculator ===
3 + 4 = 7
10 - 3 = 7
6 * 7 = 42
20 / 4 = 5
7 / 0 = Error: division by zero
9 % 2 = 1
2 ^ 8 = 256
9 ? 3 = Error: unknown operator "?"

=== Dispatch Table Contents ===
registered operators: + - * / % ^

=== Left-to-Right Multi-Term Evaluation ===
"3 + 4 * 2" evaluated left-to-right = 14   ← NOT the math-class answer of 11!
"10 - 2 - 3" evaluated left-to-right = 5
"2 ^ 3 ^ 2" evaluated left-to-right = 64   ← math class says right-to-left would give 512

=== Input Validation ===
"abc + 4": Error: "abc" is not a number
"5 +": Error: incomplete expression
"": Error: empty expression
```

---

### Concept: Decomposition

**What it is:** Decomposition means breaking one big task ("evaluate a math expression") into smaller, separately understandable, separately testable pieces — each with one clear job.

**The problem before:** A single function that reads input, parses numbers, figures out the operator, computes the answer, formats output, AND handles every possible error is nearly impossible to test in isolation or fix without touching everything else. A bug in number-parsing and a bug in the actual math get tangled together.

**The solution:** Split the calculator into named pieces with one job each:
- `parseOperand(str)` — turn a string into a number, or fail clearly
- `applyOperator(op, a, b)` — given two numbers and an operator, compute the result
- `evaluateExpression(str)` — orchestrate: split the string, call the two pieces above, return the result

**Canonical example (General Explanation):**

Think of a restaurant kitchen. One person does not take the order, chop vegetables, grill the meat, plate the food, AND wash dishes as one single unbroken action — different stations do different jobs, and each station can be checked/fixed independently without shutting down the whole kitchen. `parseOperand` is prep. `applyOperator` is the grill. `evaluateExpression` is the expediter who coordinates the stations.

**Project Application (The "Why" here):**

Every mini-project for the rest of Module 2 is decomposition applied at a larger scale: the Lexer (LAB-10) turns text into tokens, the Parser (LAB-11) turns tokens into a tree, the Evaluator (LAB-12) turns a tree into an answer. This calculator is that exact three-stage pipeline in miniature, before it earns those bigger names.

**Watch for:** A function that does two unrelated things (parses AND prints, or computes AND validates with no way to separate the two) is a decomposition smell. If you can't test "does this compute the right answer" without ALSO triggering a `console.log`, the pieces are fused when they should be separate.

---

## Step 1 — Parse Operands and Apply One Operator

```js
// main.js

function parseOperand(str) {
  const trimmed = str.trim()
  const num = Number(trimmed)                    // reused from LAB-01's Number() conversion
  if (Number.isNaN(num)) {
    throw new Error(`"${trimmed}" is not a number`)   // fail clearly — see LAB-01's Number("abc") = NaN
  }
  return num
}

function add(a, b) { return a + b }               // ← add: each operator is its own tiny, pure function
function subtract(a, b) { return a - b }
function multiply(a, b) { return a * b }
function divide(a, b) {
  if (b === 0) throw new Error('division by zero')   // guard clause, from LAB-02's safe_divide pattern
  return a / b
}

console.log('=== Two-Operand Calculator ===')
console.log(`3 + 4 = ${add(parseOperand('3'), parseOperand('4'))}`)
console.log(`10 - 3 = ${subtract(parseOperand('10'), parseOperand('3'))}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Two-Operand Calculator ===
3 + 4 = 7
10 - 3 = 7
```

**In the terminal:**

```bash
node -e "console.log(Number.isNaN(Number('abc')))"
```

**Expected:** `true` — confirms the exact check `parseOperand` relies on to detect bad input.

**Change something:** Call `add(parseOperand('  4  '), parseOperand('5'))` — extra whitespace around the number. `.trim()` handles it, still prints `9`.

---

### Concept: The Dispatch Table

**What it is:** A **dispatch table** is an object (or map) whose VALUES are functions, used to look up "which function handles this case" by a key, instead of writing a chain of `if/else if` comparisons.

**The problem before:**

```js
function applyOperatorChain(op, a, b) {
  if (op === '+') return add(a, b)
  else if (op === '-') return subtract(a, b)
  else if (op === '*') return multiply(a, b)
  else if (op === '/') return divide(a, b)
  else if (op === '%') return a % b
  else if (op === '^') return a ** b
  else throw new Error(`unknown operator "${op}"`)
}
```

This WORKS, but adding a 7th operator means finding the right spot in a growing chain, and the function's length grows linearly with every operator ever added — there is no way to just "look up" an operator; the code must check them one at a time, in order, top to bottom.

**The solution:**

```js
const operators = {                 // the dispatch table — operator string -> function
  '+': add,
  '-': subtract,
  '*': multiply,
  '/': divide,
  '%': (a, b) => a % b,
  '^': (a, b) => a ** b,
}

function applyOperator(op, a, b) {
  const fn = operators[op]          // O(1) lookup — from LAB-08's Concept box on hash maps
  if (!fn) throw new Error(`unknown operator "${op}"`)
  return fn(a, b)
}
```

**Canonical example (General Explanation):**

Think of a hotel's room-key system: instead of a security guard checking "is this room 101? Is it 102? Is it 103?" one at a time down a list, each key card is looked up DIRECTLY by room number in a table — one lookup, not a sequential scan. Adding room 104 means adding ONE entry to the table, not lengthening a comparison chain everyone must scan past.

**Project Application (The "Why" here):**

This exact pattern — a plain object mapping a string key to a handler function — reappears as: the Lexer's character-class dispatch (LAB-10), the Parser's token-type dispatch (LAB-11), the state machine's event handlers (LAB-13), and the VM's opcode dispatch (LAB-16). Learning to reach for a dispatch table instead of a long `if/else` chain is one of the highest-leverage habits in this entire curriculum.

**Watch for:** A dispatch table trades "read top to bottom to see all cases" for "look up by key" — for a SMALL number of cases either style is fine, but a dispatch table also makes it trivial to ask "what operators exist?" (`Object.keys(operators)`), which an `if/else` chain cannot answer without re-reading all the code.

---

## Step 2 — Build the Dispatch Table

```js
const operators = {                                   // ← add
  '+': add,
  '-': subtract,
  '*': multiply,
  '/': divide,
  '%': (a, b) => a % b,                                // ← add: modulo — remainder after division
  '^': (a, b) => a ** b,                                // ← add: exponentiation
}

function applyOperator(op, a, b) {                     // ← add
  const fn = operators[op]                              // ← add: O(1) lookup, not a comparison chain
  if (!fn) throw new Error(`unknown operator "${op}"`)   // ← add
  return fn(a, b)
}

function safeCalculate(a, op, b) {                     // ← add: wraps applyOperator, catches thrown errors
  try {
    return String(applyOperator(op, a, b))
  } catch (err) {
    return `Error: ${err.message}`
  }
}
```

Replace the last two `console.log` lines in `main.js` with:

```js
console.log(`3 + 4 = ${safeCalculate(3, '+', 4)}`)
console.log(`10 - 3 = ${safeCalculate(10, '-', 3)}`)
console.log(`6 * 7 = ${safeCalculate(6, '*', 7)}`)
console.log(`20 / 4 = ${safeCalculate(20, '/', 4)}`)
console.log(`7 / 0 = ${safeCalculate(7, '/', 0)}`)
console.log(`9 % 2 = ${safeCalculate(9, '%', 2)}`)
console.log(`2 ^ 8 = ${safeCalculate(2, '^', 8)}`)
console.log(`9 ? 3 = ${safeCalculate(9, '?', 3)}`)

console.log('\n=== Dispatch Table Contents ===')
console.log(`registered operators: ${Object.keys(operators).join(' ')}`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Two-Operand Calculator ===
3 + 4 = 7
10 - 3 = 7
6 * 7 = 42
20 / 4 = 5
7 / 0 = Error: division by zero
9 % 2 = 1
2 ^ 8 = 256
9 ? 3 = Error: unknown operator "?"

=== Dispatch Table Contents ===
registered operators: + - * / % ^
```

**Confirm the O(1) claim:** `Object.keys(operators)` lists every registered operator WITHOUT any code needing to know in advance how many there are — this only works because they live in one lookup structure, not scattered across `if/else` branches.

**Change something:** Add a new operator, `'//'` (integer division): `'//': (a, b) => Math.floor(a / b)`. Call `safeCalculate(7, '//', 2)`. No changes needed anywhere else — this is the payoff of the dispatch table.

---

### Concept: Input Validation at the Boundary

**What it is:** A **system boundary** is any place where data enters your program from OUTSIDE your control — user typing, a file, a network request. Code at the boundary should validate aggressively, because you cannot trust what arrives there. Code deep INSIDE your program can trust its inputs, because the boundary already checked them.

**The problem before:** If `evaluateExpression("abc + 4")` is called without checking, `parseOperand("abc")` throws `NaN`-related confusion deep inside the computation, far from where the bad input actually entered — the error message, if any, won't clearly say "the user's input was bad."

**The solution:** Validate as early as possible, with a message that describes exactly what was wrong and where.

**Canonical example (General Explanation):**

Airport security checks bags AT THE ENTRANCE, not at the gate right before boarding. Checking early means a problem is caught close to its source, with time to fix it, instead of discovered deep into a process that now has to unwind.

**Project Application (The "Why" here):**

This is exactly what the Lexer will do in LAB-10 — reject invalid characters immediately, before a Parser ever has to reason about a token stream containing garbage. Validating early, at the boundary, is a habit that scales up unchanged.

**Watch for:** Empty input (`""`), incomplete input (`"5 +"` with nothing after the operator), and malformed numbers (`"5..5"`) are three DIFFERENT boundary failures. Bundling them into one generic "invalid input" error loses information the user needs to fix their mistake.

---

## Step 3 — Multi-Term Expressions (and a Real Limitation)

So far, the calculator only handles exactly two operands and one operator. Real expressions have many terms: `"3 + 4 * 2"`. Handle this by splitting on spaces and processing operators strictly left to right.

```js
function evaluateExpression(str) {
  const trimmed = str.trim()
  if (trimmed === '') throw new Error('empty expression')    // ← add: boundary check #1

  const tokens = trimmed.split(/\s+/)                          // ← add: split on any amount of whitespace

  if (tokens.length < 3 || tokens.length % 2 === 0) {           // ← add: boundary check #2
    throw new Error('incomplete expression')                    // valid shape: num op num op num...
  }

  let result = parseOperand(tokens[0])                          // ← add: first operand
  for (let i = 1; i < tokens.length; i += 2) {                  // ← add: step by 2 — operator, operand, operator, operand...
    const op = tokens[i]
    const operand = parseOperand(tokens[i + 1])
    result = applyOperator(op, result, operand)                 // ← add: fold left to right, no precedence awareness
  }
  return result
}
```

Add to `main.js`:

```js
console.log('\n=== Left-to-Right Multi-Term Evaluation ===')
console.log(`"3 + 4 * 2" evaluated left-to-right = ${evaluateExpression('3 + 4 * 2')}   ← NOT the math-class answer of 11!`)
console.log(`"10 - 2 - 3" evaluated left-to-right = ${evaluateExpression('10 - 2 - 3')}`)
console.log(`"2 ^ 3 ^ 2" evaluated left-to-right = ${evaluateExpression('2 ^ 3 ^ 2')}   ← math class says right-to-left would give 512`)
```

### SAVE AND TRY

```bash
node main.js
```

**Expected:**
```
=== Left-to-Right Multi-Term Evaluation ===
"3 + 4 * 2" evaluated left-to-right = 14   ← NOT the math-class answer of 11!
"10 - 2 - 3" evaluated left-to-right = 5
"2 ^ 3 ^ 2" evaluated left-to-right = 64   ← math class says right-to-left would give 512
```

**The bug, made visible:** `"3 + 4 * 2"` folds as `((3 + 4) * 2) = 14`, because this evaluator has no concept of "multiplication happens before addition." Standard math notation says `*` should bind tighter than `+`, giving `3 + (4 * 2) = 11`. This calculator does not know that rule — it just walks left to right, blindly.

**This is not a bug you should fix here.** Fixing it properly requires a real grammar with **operator precedence** — knowing `*` binds tighter than `+` without hardcoding every combination. That is exactly what LAB-10 (Lexer) and LAB-11 (Parser) build. This lab's left-to-right folding is the naive version you are about to outgrow — feeling its limitation firsthand is the point.

**Change something:** Try `"20 / 5 / 2"`. Left-to-right gives `(20/5)/2 = 2`. Confirm this is what your evaluator produces — division is also order-sensitive, exactly like subtraction.

---

## 🎯 Challenge: Full Input Validation

**You know:** Boundary validation should catch different failure modes with distinct, useful messages.

**Task:** Extend `evaluateExpression` (or wrap it) so all three of these produce clear, distinct error messages instead of a crash or a confusing `NaN`:
- `"abc + 4"` → an operand isn't a valid number
- `"5 +"` → the expression is incomplete (trailing operator, no second operand)
- `""` (empty string) → nothing was entered at all

**Starting code:** `evaluateExpression` already throws for the empty and incomplete cases (Step 3). Confirm `parseOperand` correctly reports the bad-number case for `"abc + 4"` — trace through the function by hand: what does `tokens` look like, and which call to `parseOperand` fails first?

<details>
<summary>▶ Show Solution</summary>

The existing `evaluateExpression` already handles all three cases correctly, because each check was placed at the earliest point it could fail:

```js
function safeEvaluate(str) {
  try {
    return String(evaluateExpression(str))
  } catch (err) {
    return `Error: ${err.message}`
  }
}
```

- `""` → `trimmed === ''` is checked FIRST, before splitting — throws `"empty expression"` immediately.
- `"5 +"` → `tokens = ['5', '+']`, length `2`, which is even — throws `"incomplete expression"` before ever trying to parse a second operand that doesn't exist.
- `"abc + 4"` → `tokens = ['abc', '+', '4']`, length `3`, passes the shape check — THEN `parseOperand('abc')` runs and throws `""abc" is not a number"`.

**Key insight:** The ORDER of checks matters. Checking `tokens.length` before attempting to parse any operand means a malformed SHAPE (wrong number of tokens) is reported clearly, instead of accidentally producing a confusing `undefined is not a number` from reading past the end of the array. Boundary validation isn't just "check everything" — it's checking things in an order where each check protects the ones after it.

</details>

Add to `main.js`:

```js
console.log('\n=== Input Validation ===')
console.log(`"abc + 4": ${safeEvaluate('abc + 4')}`)
console.log(`"5 +": ${safeEvaluate('5 +')}`)
console.log(`"": ${safeEvaluate('')}`)
```

### SAVE AND TRY

**Expected:**
```
=== Input Validation ===
"abc + 4": Error: "abc" is not a number
"5 +": Error: incomplete expression
"": Error: empty expression
```

---

## Mental Model: Where This Calculator Is Headed

| This lab | Becomes | In |
|---|---|---|
| `tokens = trimmed.split(/\s+/)` | A real **Lexer** that handles `3+4` (no spaces), decimals, and multi-character operators | LAB-10 |
| Left-to-right folding, no precedence | A real **Parser** that builds a tree respecting `*` before `+` | LAB-11 |
| `applyOperator(op, a, b)` walking a flat token list | An **Evaluator** that walks a TREE instead of a flat list | LAB-12 |
| `operators` dispatch table | An **opcode dispatch table** for a bytecode VM | LAB-16 |

You are not about to throw this code away — you are about to replace ONE piece of it (the flat, precedence-blind folding) with something structurally better, while the dispatch table and boundary-validation habits carry forward unchanged.

---

## Final Check

| Feature | How to verify |
|---|---|
| All six two-operand operators compute correctly | `+ - * / % ^` section |
| Division by zero produces a caught error, not a crash | `7 / 0 = Error: division by zero` |
| Unknown operator produces a caught error | `9 ? 3 = Error: unknown operator "?"` |
| `Object.keys(operators)` lists all registered operators | Dispatch Table Contents section |
| Left-to-right evaluation visibly disagrees with math-class precedence | `3 + 4 * 2` gives `14`, not `11` |
| Empty, incomplete, and non-numeric input each produce a distinct, clear error | Input Validation section |
| You can explain, out loud, why a dispatch table scales better than `if/else` | Without looking at the code |

---

## Quick Check Answers

**1. Adding 10 more operators to an `if/else if` chain — what has to change?**

The chain grows by 10 more `else if` branches, and every new operator gets checked in SEQUENCE against every earlier operator's condition before its own condition is reached — the chain scales linearly with operator count. With a dispatch table, adding an operator means adding ONE key-value entry; nothing about the LOOKUP mechanism changes size or shape, and `applyOperator`'s code never needs to be touched again.

**2. `"3 + 4 * 2"` folded strictly left to right — what answer, and is it "correct"?**

`14` — computed as `(3 + 4) * 2`. It is NOT the standard math-class answer (`11`, from `3 + (4 * 2)`, since multiplication binds tighter than addition). It IS a well-defined, consistent answer for the specific (naive) rule this evaluator uses: "always combine strictly left to right, ignoring what the operator is." This lab deliberately builds that naive version so LAB-10/11's real precedence-aware parser has a felt problem to solve, not an abstract one.

**3. `"3 / 0"` — crash, special value, or error message?**

An error message, thrown as a catchable `Error` and reported clearly (`Error: division by zero`) — not a silent special value (JavaScript's raw `/` operator actually produces `Infinity` for `3/0`, which this lab's `divide()` deliberately overrides with an explicit guard clause) and not an uncaught crash that kills the whole program. Deciding which of these three responses is appropriate is itself a design decision — this lab chose "clear, catchable error" because a calculator should tell the user their input was invalid, not silently return a nonsensical number or take down the whole process over one bad calculation.

---

*Next: [LAB-10 — Lexer](LAB-10-lexer.md) — JavaScript, same project*
