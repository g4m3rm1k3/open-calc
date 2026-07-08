# React Calculator — Lesson 13 — Evaluating the Tree

## What You Will Build

A single public function, `evaluate`, that takes a raw string like
`"2+3×4"` and gives back either a correct number or a clear, specific
error — never a crash, and never a silent `Infinity` for dividing by
zero. This is the function lesson 14 finally connects to the real keypad.

---

## What You Need to Know First

Lesson 12 — a working parser producing a real `ExpressionNode` tree.

---

## Step 1 — Turn a Tree Back Into a Number

Add to `engine.ts`:

```typescript
function evaluateNode(node: ExpressionNode): number {
  if (node.kind === "number") {
    return node.value;
  }
  if (node.kind === "negate") {
    return -evaluateNode(node.operand);
  }
  const leftValue = evaluateNode(node.left);
  const rightValue = evaluateNode(node.right);
  if (node.operator === "÷" && rightValue === 0) {
    throw new Error("Division by zero");
  }
  return OPERATORS[node.operator](leftValue, rightValue);
}
```

**Walkthrough — recursion mirroring the tree's own shape.** `evaluateNode`
calls itself on `node.left` and `node.right` before it can compute
anything for the current node — a `binary` node's value is only knowable
once both of its children have their own values, and *those* might
themselves be `binary` nodes needing the same treatment first. This is
**tree recursion**: the function's structure directly mirrors the
recursive structure of the data it's processing. Lesson 12 defined a
recursive function's two required parts; here, `{ kind: "number" }` is the
**base case** — a leaf node lesson 02's tree vocabulary already named,
answered directly with no further recursive call — and `{ kind: "binary" }`
is the **recursive case**, always calling `evaluateNode` on smaller
pieces (its own children) until it bottoms out at leaves. `2+3×4`'s tree
evaluates correctly not because of any special-case logic, but because
`evaluateNode` is called on the `×` subtree (`3×4 → 12`) as an ordinary
step in evaluating the outer `+` node (`2+12 → 14`) — the nesting the
parser built is exactly what makes the correct order happen automatically.

**Walkthrough — the division-by-zero check, and where it lives.** This
check happens *here*, in the evaluator, not in `engine.ts`'s plain `divide`
function from lesson 09 — `divide` stays exactly as simple as it was,
because "what should happen when a calculation is undefined" is a decision
about *how this calculator behaves*, not a fact about division itself.
`throw new Error("Division by zero")` stops evaluation immediately with a
specific, human-readable message, instead of letting `12 / 0` silently
become JavaScript's own `Infinity` and continue on as if nothing went
wrong — the exact gap named honestly back in lesson 09.

**CS lens — the call stack, and why deep recursion has a real limit.**
Every time `evaluateNode` calls itself, the calling environment — which
node it's on, whether it's waiting on the left or right child — is pushed
onto the **call stack**, a real, finite region of memory tracking every
function call currently in progress, waiting to resume once the call it
made returns. `2+3×4`'s tree is only three levels deep, so this is
invisible in practice — but an expression with thousands of nested
parentheses would push thousands of stack frames before the first base
case is ever reached, and every real language's call stack has a genuine
size limit. Exceeding it throws a real, specific error — `RangeError:
Maximum call stack size exceeded` in JavaScript — a **stack overflow**, a
real failure mode of recursive code, not a defect unique to this project.
This project's expressions are short enough by construction that this
limit is never a practical concern, but it's worth knowing by name, since
it's the honest cost every recursive solution (this evaluator, the parser,
even `.reduce()` implemented recursively) implicitly carries.

**CS lens — reusing the dispatch table.** `OPERATORS[node.operator]` is the
same lookup used in `handleOperator` since lesson 08 — a tree node's
`operator` field (`"+" | "-" | "×" | "÷"`) is exactly the kind of string
key `OPERATORS` was built to accept. The evaluator doesn't need its own
copy of "what does `×` mean" — it reuses the one this project already has.

---

## Step 2 — Errors as a Real Value, Not Just a Thrown Exception

**The problem:** `evaluateNode` (and `tokenize`/`parsePrimary` before it)
can all `throw`. A thrown error is invisible to TypeScript's type system —
nothing in a function's signature says it might throw, so nothing forces a
caller to handle that possibility. The TypeScript Spreadsheet project
solved exactly this problem in its own lesson 13, refactoring thrown
errors into a real, checked type. This project reuses that same pattern.

Add to `engine.ts`:

```typescript
type CalculatorResult =
  | { kind: "success"; value: number }
  | { kind: "error"; message: string };

function evaluate(source: string): CalculatorResult {
  try {
    const tokens = tokenize(source);
    const tree = parseExpression({ tokens, position: 0 });
    const value = evaluateNode(tree);
    return { kind: "success", value };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return { kind: "error", message };
  }
}
```

**Walkthrough — `CalculatorResult`, the same shape as `Cell` and `Token`.**
Another two-variant discriminated union: either a `success` carrying a
real `number`, or an `error` carrying a human-readable `message` — never
both, never neither. Anything calling `evaluate` is *forced*, by
TypeScript, to check `result.kind` before it can safely read `.value` —
narrowing works exactly as it did for `Token` and `ExpressionNode`.

**Walkthrough — `evaluate` is the one place `try`/`catch` still exists in
this project.** `tokenize`, `parsePrimary`, and `evaluateNode` all still
throw plain `Error`s internally, exactly as lessons 11 and 12 wrote them —
that code did not need to change. `evaluate` is the single **boundary**
where those internal exceptions get caught and converted into a real,
checked `CalculatorResult`, once, in one place. Everything *inside* the
engine is free to throw when something goes wrong, because every possible
path back out is guaranteed to pass through this one function first.

**Walkthrough — `error instanceof Error`.** JavaScript technically allows
`throw` with *any* value, not just an `Error` object — `throw "oops"` is
legal, if unusual. `catch (error)` therefore receives something typed as
`unknown`, not `Error`, and TypeScript refuses to let code assume
`error.message` exists without checking first. `error instanceof Error`
is a **type guard** — a runtime check that also narrows the type for
TypeScript afterward — confirming this specific caught value really is an
`Error` object (which every `throw` in this project's own code actually
is) before trusting it has a `.message` property at all.

**SE lens — domain errors versus programmer errors, the real distinction
behind this design.** "Division by zero" is a **domain error** — a failure
that's a completely normal, expected part of the problem this program
solves; any calculator will eventually be asked to divide by zero, and the
right response is a clear, handled message, never a crash. A **programmer
error** — calling a function with the wrong number of arguments, accessing
a property on `undefined` due to an actual coding mistake — represents a
genuine bug that should be fixed in the code, not gracefully handled at
runtime. `CalculatorResult` exists specifically for the first category:
`evaluate` returns `{ kind: "error", ... }` for the kinds of failure a
correct calculator must expect and handle every day, while an actual
programmer error elsewhere in this project's own code (say, `OPERATORS[node.operator]`
being called with a key that was never registered, from lesson 09's
typo scenario) is still allowed to throw and crash loudly — because that
represents the code itself being wrong, not the user's input being
invalid, and a loud crash during development is far more useful than a
quietly swallowed bug.

**Connect to the real world — this pattern has a name in nearly every
modern language, and this project just built its own version.** Rust's
standard library has `Result<T, E>`, an enum with exactly the same two
shapes as `CalculatorResult` — `Ok(value)` or `Err(error)` — used
pervasively throughout the entire language specifically so that every
function whose caller might need to handle failure says so directly in
its own return type. Haskell's `Either` is the same idea under a different
name. TypeScript has no built-in equivalent, which is exactly why this
project (and the TypeScript Spreadsheet series before it) had to define
`CalculatorResult` by hand — the pattern is powerful enough that
languages without it in the standard library tend to have it reinvented,
by convention, in nearly every serious codebase written in them.

**SE lens — why not make `tokenize` and `parsePrimary` return
`CalculatorResult` too, instead of throwing?** That's a completely
reasonable alternative design — the TypeScript Spreadsheet project's
lesson 13 discusses exactly this choice. It would mean checking `result.kind`
after every single internal step, even though only the outermost
caller (`evaluate`) actually needs to make a final decision about success
or failure. Catching exceptions at one clear boundary, rather than
threading a `Result` through every internal function, is a legitimate,
common pattern — the important discipline is that *some* boundary exists
and is never skipped, which `evaluate` guarantees here.

---

## Step 3 — Confirm It in the Console

Click **▶ Preview**, open DevTools (F12) → Console, and try:

```js
evaluate("2+3×4")
```

Confirm it returns `{ kind: "success", value: 14 }` — the correct answer,
finally, for the exact expression lesson 10 got wrong. Try:

```js
evaluate("5÷0")
```

Confirm it returns `{ kind: "error", message: "Division by zero" }`
instead of `Infinity`.

---

## Connect the Pieces

```
engine.ts   evaluateNode() — recursive tree evaluation, reusing OPERATORS
            CalculatorResult — success/error, the checked replacement for
            a thrown exception
            evaluate() — the one public boundary function: raw string in,
            CalculatorResult out, every internal throw caught here
```

---

## What Breaks Without This

**Calling `evaluateNode` directly from the UI, instead of through
`evaluate`:** any malformed input — an unbalanced parenthesis, a division
by zero — throws an uncaught exception straight out of a React event
handler, which crashes the component (lesson 27 covers what a React
**Error Boundary** does about crashes exactly like this one, but relying
on that safety net for an entirely preventable case would be treating a
last resort as a first line of defense).

---

## Definition of Done

- [ ] `evaluateNode` correctly evaluates a full tree, respecting precedence
- [ ] `evaluate("2+3×4")` returns `{ kind: "success", value: 14 }`
- [ ] `evaluate("5÷0")` returns a real error, not `Infinity`
- [ ] You can explain why `try`/`catch` only appears inside `evaluate`, nowhere else
- [ ] You can explain what `error instanceof Error` checks and why it's needed
- [ ] You can explain the difference between a domain error and a programmer error, using this lesson's design as the example
- [ ] You can name at least one real language whose standard library has a built-in equivalent of `CalculatorResult`
- [ ] You can explain what a stack overflow is and why this project's expressions are safely short of it

---

*Next: Lesson 14 — Real Buttons, Real Precedence. The eager operator model
is finally replaced — the display builds a real expression string, and
`evaluate` computes it correctly on `=`.*
