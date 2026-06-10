# OpenMAT — Lesson 12 — While Loops

## What You Will Build

```
>> x = 1
>> while x < 100
     x = x * 2
   end
>> disp(x)
128
```

The loop doubles `x` until it reaches or exceeds 100. The `while` loop repeats
a block as long as a condition is true — unlike the `for` loop, which iterates
over a fixed sequence, a `while` loop's iteration count is determined by the
data, not declared up front.

This lesson also adds a safety limit: if a `while` loop exceeds 10,000
iterations without stopping, the evaluator throws a `RuntimeError` with a
message that says "while loop exceeded maximum iteration limit." This prevents
an accidental infinite loop from freezing the page.

---

## What You Need to Know First

Lessons 01–11 complete. `for` loops work. The `isTruthy` helper exists in the
evaluator. The `isKeyword` helper exists in the parser. `RuntimeError` exists in
the error hierarchy from lesson 09. The `Environment` class, the `evaluate`
function, and the `ASTNode` discriminated union are all in use.

---

## Concept: Condition-Controlled Loops

**For loops vs while loops — when you know vs when you don't:**

A `for` loop is used when you know the number of iterations before the loop
starts. The range defines the count; the count is fixed.

A `while` loop is used when you do not know how many iterations you will need —
you continue until something changes. The count is determined by what happens
inside the loop body.

```
for i = 1:5      -- runs exactly 5 times — decided before the loop starts
while x < 100    -- runs until x reaches 100 — decided by x's evolution
```

Concrete example: use `for` to draw 5 triangles (you know it's 5 before you
start). Use `while` to keep asking the user for input until they enter a valid
number — you do not know how many mistakes they will make. If you use a `while`
where a `for` is natural, you have to manually declare and increment the loop
variable, which is error-prone. If you use a `for` where a `while` is natural,
you have to guess a maximum count in advance, which is either wrong or wasteful.

**Convergence — while loops as the computational form of iterative refinement:**

While loops are the computational form of convergence: keep iterating until a
condition is met. In mathematics, many algorithms work this way — they are
not "do this n times" but "keep refining until the answer is close enough."

Newton's method for approximating √2:
1. Start with a guess `x = 1`
2. Improve the guess: `x = (x + 2/x) / 2`
3. Repeat until `|x² - 2| < ε` (epsilon — a small tolerance value)

In OpenMAT:
```
x = 1
while abs(x^2 - 2) > 0.000001
  x = (x + 2/x) / 2
end
disp(x)
```

This converges to approximately `1.4142135`. The number of iterations is not
known before the loop runs — it depends on how quickly Newton's method converges.
A `for` loop with a fixed count would either stop too early (wrong answer) or
too late (wasted work).

This pattern is everywhere in computing: gradient descent in machine learning,
the bisection algorithm for finding roots, and numerical solvers all use while
loops that terminate when the answer is close enough. The WHILE_LIMIT constant
you will write in Step 4 is the interpreter's version of a safety ceiling —
every system that accepts potentially unbounded iteration needs one.

**Real-world connection — safety ceilings in production systems:**

Database query limits work on the same principle. An API that returns paginated
results (`LIMIT 100 OFFSET 0`) prevents a runaway query from returning millions
of rows in one response. Rate limiters on web APIs cap the number of requests per
second. Every system that accepts potentially unbounded iteration needs a safety
ceiling. The `WHILE_LIMIT` constant in the evaluator is OpenMAT's version: a
hard stop that prevents a loop from blocking the browser, expressed as a number
the programmer chose deliberately, not a hidden engine behaviour.

**Loop termination and the halting problem:**

For a `for` loop, termination is guaranteed: the loop variable advances each
iteration and the range is finite. The loop always terminates.

For a `while` loop, termination is not guaranteed. If the condition never becomes
false, the loop runs forever. This is related to the *halting problem*: in
general, it is mathematically impossible to write a program that decides whether
any given program will terminate. Alan Turing proved this in 1936.

For practical use, the evaluator enforces a safety limit: if a `while` loop
exceeds 10,000 iterations, it throws a `RuntimeError`. This does not solve the
halting problem — it just prevents the browser from freezing. The limit is a
practical safeguard, not a proof of correctness.

The key to reasoning about while loop termination is identifying the *loop
variant*: a value that changes toward the termination condition with each
iteration. In `while x < 100; x = x * 2; end`, the variant is `x` itself —
it doubles each time, so it will eventually reach or cross 100. Identifying
the loop variant is how you convince yourself (and others) that a while loop
will stop.

---

## Step 1 — Add WhileNode to the AST

**The problem:** the parser does not yet understand the `while` keyword. When it
encounters `while`, `parseStatement` falls through to `parseAssignment`, which
cannot handle a keyword-led statement. We need a new AST node type and a new
parse function.

Open `src/parser.ts`. The `ASTNode` union type (introduced in lesson 04) is the
discriminated union that names every node shape the parser can produce. Add
`WhileNode` to it:

```typescript
export type ASTNode =
  | NumberNode | StringNode | BooleanNode | IdentifierNode
  | BinaryOpNode | UnaryOpNode | AssignmentNode | FunctionCallNode
  | IfNode | BlockNode | ForNode
  | WhileNode;   // ← new

export interface WhileNode {
  kind:      'While';
  condition: ASTNode;
  body:      ASTNode[];
  line:      number;
}
```

**Walkthrough of the type:**

`WhileNode` is an interface — a TypeScript construct that names the shape of an
object. `kind: 'While'` is the discriminant (the string literal that tells
TypeScript which branch of the `ASTNode` union this is — the same pattern used
by `IfNode`, `ForNode`, and every other node). `condition` is the expression
that is evaluated before each iteration — it must be an `ASTNode` because the
parser will parse it as an expression. `body` is the list of statements between
`while` and `end`. `line` is the source line number, carried from the `while`
token so that runtime errors can report where in the source the loop lives.

**CS lens:** this is the same discriminated union pattern that the entire AST
uses. Adding `WhileNode` to the union means TypeScript will now report a
compile error if the evaluator's `switch` statement does not handle `'While'`
— the type system enforces completeness.

**SE lens:** `condition` and `body` are typed as `ASTNode` and `ASTNode[]`, not
as strings or numbers. This means the evaluator receives a fully parsed
structure, not raw text. The separation of parsing from evaluation (established
in lesson 04) means neither stage has to understand the other's concerns.

---

## Step 2 — Parse the While Loop

**The problem:** the parser needs a function that reads `while <condition> ...
<body> end` and returns a `WhileNode`.

Add `parseWhile` to `src/parser.ts`:

```typescript
function parseWhile(): WhileNode {
  const kw = advance();   // consume KEYWORD 'while'
  const condition = parseAssignment();
  skipNewlines();

  const body: ASTNode[] = [];
  while (!isKeyword('end') && !atEnd()) {
    body.push(parseStatement());
    skipNewlines();
  }

  if (!isKeyword('end')) {
    throw new ParseError("expected 'end' to close 'while' loop", kw.line);
  }
  advance();   // consume 'end'

  return { kind: 'While', condition, body, line: kw.line };
}
```

**Walkthrough:**

`advance()` moves past the `while` keyword token and returns it — we save it as
`kw` so we have its line number for error reporting. `parseAssignment()` (the
top-level expression parser, established in earlier lessons) reads the condition
expression and returns an `ASTNode`. `skipNewlines()` advances past any
newlines between the condition and the first body statement.

The inner `while` loop reads body statements one at a time until it sees `end`
or runs out of tokens. `isKeyword('end')` peeks at the current token without
consuming it — this is the same lookahead pattern the `if` and `for` parsers
use. If the token stream ends without `end`, we throw a `ParseError` naming the
line of the opening `while` — this gives the student a useful message ("expected
'end' to close 'while' loop on line 3") rather than a cryptic failure further
down the pipeline.

`advance()` at the end consumes the `end` keyword, leaving the parser positioned
correctly for the next statement.

Now wire `parseWhile` into `parseStatement`:

```typescript
function parseStatement(): ASTNode {
  skipNewlines();
  if (isKeyword('if'))    return parseIf();
  if (isKeyword('for'))   return parseFor();
  if (isKeyword('while')) return parseWhile();
  return parseAssignment();
}
```

**CS lens:** `parseStatement` is a dispatch table for statement-level constructs
— the same pattern as the evaluator's `switch`. Each keyword maps to a dedicated
parse function. Adding `while` here is an open/closed extension: the existing
cases are untouched.

**SE lens:** `parseWhile` is small and has one job — read a while loop and
return a node. It does not evaluate, it does not care about the runtime
environment. This is the separation of concerns established in lesson 04: the
parser's only responsibility is turning a flat token stream into a structured
tree. Every subsequent stage (evaluation, error reporting) receives the tree,
not tokens.

---

## Step 3 — Write the Tests First (Red)

In TDD (test-driven development, established in lesson 06), tests are written
before the implementation. The tests describe the expected behaviour; the
implementation is written to make them pass. Running the tests before the
implementation confirms they are actually testing something — a test that passes
before the code is written is not testing the code.

Create `src/while.test.ts`:

```typescript
import { tokenize }    from './lexer';
import { parse }       from './parser';
import { evaluate }    from './evaluator';
import { Environment } from './environment';

function run(source: string, env = new Environment()) {
  return evaluate(parse(tokenize(source)), env);
}

test('while loop doubles until >= 100', () => {
  const env = new Environment();
  run('x = 1\nwhile x < 100\n  x = x * 2\nend', env);
  expect(env.get('x')).toBe(128);
});

test('while loop body does not run when condition is false initially', () => {
  const env = new Environment();
  run('x = 0\ncount = 0\nwhile x > 0\n  count = count + 1\nend', env);
  expect(env.get('count')).toBe(0);
});

test('while loop throws RuntimeError after 10000 iterations', () => {
  expect(() => run('while 1\n  x = 1\nend')).toThrow('while loop exceeded');
});
```

**Walkthrough of the test file:**

`run` is a local helper that composes the full pipeline: `tokenize` converts the
source string into a token list, `parse` converts the token list into an AST,
and `evaluate` runs the AST against an `Environment`. This is the same pipeline
the REPL uses — the test exercises exactly what the user will run.

The first test checks that the loop body runs the correct number of times: `x`
doubles (1 → 2 → 4 → 8 → 16 → 32 → 64 → 128) until it exceeds 100. The
expected value is 128, not 100, because the loop condition is `x < 100` — at
128, the condition `128 < 100` is false, so the loop stops. Seven iterations.

The second test checks the boundary case: if the condition is false before the
loop starts, the body must run zero times. `count` stays 0.

The third test checks the safety limit: `while 1` (1 is always truthy) should
throw a `RuntimeError` whose message contains "while loop exceeded."

Run the tests with `npx vitest run` — all three fail. `npx` (node package
execute) runs a locally installed package without installing it globally. `vitest
run` (the subcommand) runs all tests once and exits, rather than watching for
file changes.

---

## Step 4 — Evaluate the While Loop (Green)

**The problem:** the evaluator's `switch` does not yet have a `'While'` case.
Every `WhileNode` in the AST currently falls through to the `default` branch
and throws "unknown node kind."

Add to `src/evaluator.ts`:

```typescript
const WHILE_LIMIT = 10_000;

case 'While': {
  let iterations = 0;

  while (true) {
    if (iterations >= WHILE_LIMIT) {
      throw new RuntimeError(
        `while loop exceeded maximum iteration limit (${WHILE_LIMIT})`,
        node.line
      );
    }

    const cond = evaluate(node.condition, env);
    if (!isTruthy(cond)) break;

    for (const stmt of node.body) {
      evaluate(stmt, env);
    }

    iterations += 1;
  }

  return 0;
}
```

**Walkthrough — tracing `x = 1 \n while x < 3 \n x = x + 1 \n end`:**

`evaluate(WhileNode, env)` is called. `iterations` is set to `0`. The outer
`while (true)` begins.

**Iteration 1:** `iterations` is `0`. `0 >= 10_000` is false — limit check
passes. `evaluate(node.condition, env)` evaluates `x < 3`: looks up `x` (which
is `1`) and computes `1 < 3` → `true`. `isTruthy(true)` returns `true` — the
condition check introduced in lesson 10. The body executes: `x = x + 1` →
`env.set('x', 2)`. `iterations` increments to `1`.

**Iteration 2:** `iterations` is `1`. `1 >= 10_000` is false. `evaluate`
condition: `x < 3` → `2 < 3` → `true`. Body: `env.set('x', 3)`. `iterations`
increments to `2`.

**Iteration 3:** `iterations` is `2`. `2 >= 10_000` is false. `evaluate`
condition: `x < 3` → `3 < 3` → `false`. `isTruthy(false)` returns `false`.
`break` exits the outer `while (true)`.

`return 0`. `env.get('x')` is `3`.

**Why the limit is checked BEFORE the body:**

The `if (iterations >= WHILE_LIMIT)` check appears at the top of the loop,
before the condition is evaluated and before the body runs. This is deliberate.

If the check were at the bottom — after the body — a loop that hit the limit
would have already run the body one extra time. For a loop that modifies global
state (drawing to canvas, updating variables) that extra iteration is wrong. The
body has produced a side effect that should not have occurred.

Checking at the top means: "if we have already run the maximum number of
iterations, stop before running again." The counter starts at `0`, increments at
the bottom of each iteration, and the check at the top of the next iteration
catches it at `WHILE_LIMIT`. So the body runs at most `WHILE_LIMIT` times (0
through 9,999), then the error fires on the 10,001st cycle before the body
executes.

**Why `WHILE_LIMIT` is a named constant, not a literal:**

`10_000` appears once. If it appeared inline (as `if (iterations >= 10_000)`),
a future reader would have to guess what the number means and why it was chosen.
A named constant communicates intent: this is a limit, it is 10,000, and it
applies to while loops specifically. The `_` separator is a TypeScript (and
JavaScript) feature that makes large numbers readable without changing their
value — `10_000` and `10000` are identical at runtime.

**Why this throws `RuntimeError` and not `ParseError`:**

`while 1\n x = 1\nend` is syntactically valid — the parser accepts it without
complaint. The problem is not in the syntax; it is detected at runtime after the
loop has run 10,000 times. A `ParseError` (established in lesson 04) reports
problems the parser finds before execution. A `RuntimeError` (established in
lesson 09) reports problems detected during execution. The distinction matters:
it tells the student where to look. A `ParseError` means the source is
malformed. A `RuntimeError` means the source is valid but the execution went
wrong.

**CS lens — the loop variant:**

For a loop to terminate, something must change toward the termination condition
on each iteration. This changing quantity is the *loop variant*. In `while x <
100; x = x * 2; end`, the variant is `x` — it doubles each iteration,
approaching and eventually exceeding 100. A loop without a variant is infinite:
`while x < 100; y = y + 1; end` never modifies `x`, so the condition never
changes. When you write a while loop, identifying the loop variant is how you
convince yourself — and future readers — that it terminates.

**SE lens — separation of concerns:**

The `case 'While'` block in the evaluator knows nothing about parsing and
nothing about the REPL. It receives a `WhileNode` (the parser's output),
evaluates it against an `Environment` (the symbol table), and returns a value.
Each concern is isolated: the parser handles syntax, the evaluator handles
semantics, the REPL handles I/O.

Run `npx vitest run` — all three tests should now pass.

---

## Step 5 — Add Console Block Tracking

The console's block depth counter from lesson 10 tracks `if`, `for`, `while`,
and `function` keywords. `while` is already in the `BLOCK_OPENERS` set:

```typescript
const BLOCK_OPENERS = new Set(['if', 'for', 'while', 'function']);
```

No change needed to the console — `while ... end` blocks already accumulate
correctly. This is the open/closed principle from lesson 09 in action: adding a
new block type to the evaluator did not require modifying the console's block
tracking code, because the console's tracking is keyed on keywords, not on
evaluator cases.

### SAVE AND TRY

```
>> x = 1
>> while x < 100
     x = x * 2
   end
>> x
128
```

Newton's method for √2:
```
>> x = 1
>> while abs(x^2 - 2) > 0.000001
     x = (x + 2/x) / 2
   end
>> x
1.41421356237
```

Type an infinite loop (expect the safety error):
```
>> while 1
     x = 1
   end
RuntimeError on line 1: while loop exceeded maximum iteration limit (10000)
```

---

## Connect the Pieces

```
'while' keyword → parser builds WhileNode → evaluator:
  check iterations < WHILE_LIMIT → evaluate condition → isTruthy? → evaluate body → repeat
  if iterations >= WHILE_LIMIT → throw RuntimeError
```

The `while` evaluator reuses components established in prior lessons:

- `isTruthy()` from lesson 10 — the same function the `if` evaluator uses to
  decide whether a condition is true. It handles numbers (0 is false, anything
  else is true), booleans, and strings — the while loop gets this for free.
- `RuntimeError` from lesson 09 — the same error class used for division by
  zero and undefined variable access. The safety limit is another runtime
  condition, so it uses the same error path.
- `Environment` threading — `env` is passed to every `evaluate` call in the
  body. Variable assignments inside the loop body (`x = x * 2`) update the same
  environment the condition reads. This is how the loop body can change the
  condition — they share the same symbol table.
- The `ASTNode` discriminated union — `WhileNode`'s `kind: 'While'` routes to
  the correct evaluator case. The same dispatch mechanism used by every other
  node type.

---

## What Breaks Without This

Remove the iteration limit:

```typescript
case 'While': {
  while (true) {
    const cond = evaluate(node.condition, env);
    if (!isTruthy(cond)) break;
    for (const stmt of node.body) evaluate(stmt, env);
  }
  return 0;
}
```

Type `while 1; x = 1; end`. The browser freezes — the JavaScript call stack is
blocked by the infinite loop, the event loop cannot process any events (including
the page's render or input events), and the browser tab becomes unresponsive.
The user has no way to stop it short of killing the tab.

With the 10,000-iteration limit, the evaluator throws a `RuntimeError` before
the loop can block the event loop. The error is caught by the `try/catch` in
`main.ts`, which calls `printOutput` — a normal I/O operation. The page stays
responsive. The error message tells the user exactly what happened and where.

This is a concrete demonstration of the performance principle from lesson 11:
synchronous JavaScript blocks rendering. A `for` loop over a bounded range
terminates predictably. An unchecked `while` loop does not. The 16.6ms per-frame
budget has no meaning when a loop can run indefinitely.

---

## Definition of Done

- [ ] `while x < 100; x = x * 2; end` leaves `x = 128`
- [ ] A while loop with an initially false condition runs the body zero times
- [ ] `while 1` throws `RuntimeError` after the iteration limit
- [ ] All three while loop tests pass
- [ ] You can explain the difference between a `for` loop and a `while` loop in
      terms of when the iteration count is determined, with a concrete example
      of each
- [ ] You can trace the evaluation of `x = 1 \n while x < 3 \n x = x + 1 \n end`
      step by step, stating the value of `x` and `iterations` at the start of
      each iteration
- [ ] You can explain why the limit is checked before the body runs, not after
- [ ] You can explain why the safety limit throws a `RuntimeError` and not a
      `ParseError`
- [ ] You can identify the loop variant for `while x < 100; x = x * 2; end` and
      explain how it proves the loop terminates
- [ ] You can name one real-world system that uses the same safety-ceiling
      principle as `WHILE_LIMIT`
- [ ] `git add src/parser.ts src/evaluator.ts` then `git commit -m "Add while loops: condition-driven iteration with 10,000-iteration safety limit"`

---

*Next: Lesson 13 — Functions. Define a function once, call it many times. Each
call gets its own scope — variables inside do not leak out, and outer variables
do not bleed in unless explicitly passed.*
