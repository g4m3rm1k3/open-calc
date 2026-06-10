# OpenMAT — Lesson 11 — For Loops

## What You Will Build

Type this into the console:

```
>> for i = 1:5
     drawTriangle(i * 80, 250, 40)
   end
```

Five triangles appear on the canvas at positions x = 80, 160, 240, 320, 400.
This is the first moment where OpenMAT code changes what the visualiser renders.
The interpreter is no longer a calculator — it is a programming environment with
graphical output.

---

## What You Need to Know First

Lessons 01–10 complete. `if/else/end` works. The console accumulates multi-line
blocks. The lexer from lesson 04 already produces a `COLON` token for `:` and
`KEYWORD` tokens for `for`, `while`, and `end`. The `evaluate`, `parse`,
`tokenize`, `Environment`, `IfNode`, and `BlockNode` pieces are in place and
tested. `BLOCK_OPENERS` already includes `for`.

---

## Concept: Iteration, Sequences, and the Range Operator

**What it is:**

A `for` loop in OpenMAT iterates a variable over a sequence of values. The range
`1:5` produces the sequence `1, 2, 3, 4, 5`. The loop body runs once per value.

`start:step:end` produces a sequence with a custom step. `1:2:9` → `1, 3, 5, 7, 9`.

The range is end-inclusive to match mathematical convention: the set
`{1, 2, 3, 4, 5}` includes 5. Python's `range(1, 6)` is end-exclusive — a
common source of confusion when moving between languages.

**Maths concept — sequences:**

A *sequence* is an ordered list of numbers. Each element has a position (its
*index*) and a value. Sequences that increase by a fixed amount at each step are
called *arithmetic sequences*; the fixed amount is the *common difference*.

`1, 3, 5, 7, 9` is an arithmetic sequence with common difference 2. The element
at position `n` (counting from 1) is:

```
a(n) = start + (n − 1) × step
```

The range syntax `start:step:end` produces exactly an arithmetic sequence.
A `for` loop is the computational implementation: "for each element of this
sequence, do something with it."

**Maths connection — sigma notation:**

`∑(i=1 to n) f(i)` is mathematical notation for summing a function over a range.
A `for` loop that accumulates a running total implements this directly:

| Maths | OpenMAT |
|-------|---------|
| `∑(i=1 to 5) i` | `sum = 0; for i = 1:5; sum = sum + i; end` |
| `∑(i=1 to n) i²` | `sum = 0; for i = 1:n; sum = sum + i^2; end` |

**CS lens — loop invariants:**

A *loop invariant* is a condition that is true before the loop starts, true after
every iteration, and true when the loop ends. For a sum loop:

```
sum = 0
for i = 1:N
  sum = sum + i
end
```

The invariant is: "after iteration k, `sum` holds `1 + 2 + ... + k`."

Loop invariants are the formal tool for proving loops correct. They are also the
mental model that makes complex loops understandable: instead of tracing every
step, you ask "what is always true?" The invariant at the loop's end gives the
final result directly.

**SE lens — TDD on boundary conditions:**

Loops are where off-by-one errors live. A test that checks the exact iteration
count is not optional:

```typescript
test('for loop runs exactly the right number of times', () => {
  const env = new Environment();
  run('count = 0\nfor i = 1:5\n  count = count + 1\nend', env);
  expect(env.get('count')).toBe(5);
});
```

An implementation that checks `i < 5` runs 4 times. One that starts at `i = 0`
runs 6 times. Only the test catches this without careful manual counting. The
boundary test is: `1:5` must run exactly 5 times with `i` taking values `1, 2,
3, 4, 5`.

---

## Step 1 — Add the ForNode AST Type

Open `src/parser.ts`. Add `ForNode` to the `ASTNode` union:

```typescript
export type ASTNode =
  | NumberNode | StringNode | BooleanNode | IdentifierNode
  | BinaryOpNode | UnaryOpNode | AssignmentNode | FunctionCallNode
  | IfNode | BlockNode
  | ForNode;   // ← new

export interface ForNode {
  kind:       'For';
  variable:   string;
  rangeStart: ASTNode;
  rangeStep:  ASTNode;
  rangeEnd:   ASTNode;
  body:       ASTNode[];
  line:       number;
}
```

**Why store `rangeStart`, `rangeStep`, `rangeEnd` as AST nodes:**

The range bounds may be expressions, not literals. `for i = x:y` uses variables
as bounds. Storing them as AST nodes means the evaluator resolves them at
runtime when `x` and `y` are known. Storing numbers would restrict ranges to
literals only.

---

## Step 2 — Parse the For Loop

Add `parseFor` to `src/parser.ts`. It uses the same `isKeyword()` helper
established in lesson 10:

```typescript
function parseFor(): ForNode {
  const kw = advance();   // consume KEYWORD 'for'

  // The loop variable: 'for i = ...'
  if (peek().type !== TokenType.IDENTIFIER) {
    throw new ParseError("expected a variable name after 'for'", peek().line);
  }
  const varName = advance();   // consume identifier

  expect(TokenType.EQUALS);   // consume '='

  // Parse the range: start:end or start:step:end
  const first  = parseAddSub();   // stop before COLON — colon is not an addSub operator

  expect(TokenType.COLON);
  const second = parseAddSub();

  let stepNode: ASTNode;
  let endNode:  ASTNode;

  if (peek().type === TokenType.COLON) {
    advance();   // consume second ':'
    stepNode = second;
    endNode  = parseAddSub();
  } else {
    stepNode = { kind: 'Number', value: 1, line: kw.line };
    endNode  = second;
  }

  // Parse the body until keyword 'end'
  skipNewlines();
  const body: ASTNode[] = [];
  while (!isKeyword('end') && !atEnd()) {
    body.push(parseStatement());
    skipNewlines();
  }

  if (!isKeyword('end')) {
    throw new ParseError("expected 'end' to close 'for' loop", kw.line);
  }
  advance();   // consume 'end'

  return { kind: 'For', variable: varName.value!, rangeStart: first, rangeStep: stepNode, rangeEnd: endNode, body, line: kw.line };
}
```

Add `parseFor` to `parseStatement`:

```typescript
function parseStatement(): ASTNode {
  skipNewlines();
  if (isKeyword('if'))  return parseIf();
  if (isKeyword('for')) return parseFor();
  return parseAssignment();
}
```

**Why the range parser calls `parseAddSub` instead of `parseAssignment`:**

The colon `:` in `1:5` must be parsed by the range handler, not as part of the
expression. If `parseAssignment` were called, it would recursively call the full
expression chain, which has no stopping point at `:`. By stopping at `parseAddSub`
(the level above unary), we ensure the parser reads `1`, sees the `:`, stops, and
the range handler takes over. This is a deliberate grammar boundary.

**For loop evaluation walkthrough — `for i = 1:3 \n disp(i) \n end`:**

The parser produces:

```
ForNode {
  variable: 'i',
  rangeStart: NumberNode(1),
  rangeStep:  NumberNode(1),   // default when no step is given
  rangeEnd:   NumberNode(3),
  body: [ FunctionCall('disp', [Identifier('i')]) ]
}
```

When the evaluator receives this node it first resolves the three range
expressions: `start = 1`, `step = 1`, `end = 3`. It then computes
`tolerance = Math.abs(1) * 1e-10`.

- **Iteration 1:** `env.set('i', 1)`. Execute body: `disp(1)` prints `1`.
  Next candidate: `1 + 1 = 2`. Is `2 <= 3 + tolerance`? Yes — continue.
- **Iteration 2:** `env.set('i', 2)`. Execute body: `disp(2)` prints `2`.
  Next candidate: `2 + 1 = 3`. Is `3 <= 3 + tolerance`? Yes — continue.
- **Iteration 3:** `env.set('i', 3)`. Execute body: `disp(3)` prints `3`.
  Next candidate: `3 + 1 = 4`. Is `4 <= 3 + tolerance`? No — loop ends.

Output: `1`, `2`, `3`. Exactly three iterations. The `Environment` object here is
the same one established in lesson 05 — `env.set` writes a name-to-value binding
to the symbol table, and the body can read it back with `env.get` when evaluating
`Identifier('i')`.

---

## Step 3 — Write the Tests First (Red)

Add to `src/evaluator.test.ts`:

```typescript
test('for loop iterates the correct number of times', () => {
  const env = new Environment();
  run('count = 0\nfor i = 1:5\n  count = count + 1\nend', env);
  expect(env.get('count')).toBe(5);
});

test('for loop variable takes the correct values', () => {
  const env = new Environment();
  run('last = 0\nfor i = 1:5\n  last = i\nend', env);
  expect(env.get('last')).toBe(5);
});

test('for loop with step', () => {
  const env = new Environment();
  run('count = 0\nfor i = 1:2:9\n  count = count + 1\nend', env);
  expect(env.get('count')).toBe(5);   // values: 1, 3, 5, 7, 9
});

test('for loop handles floating-point range', () => {
  const env = new Environment();
  run('count = 0\nfor i = 0:0.1:1\n  count = count + 1\nend', env);
  expect(env.get('count')).toBe(11);   // 0.0, 0.1, ..., 1.0
});
```

Run `npx vitest run` — all fail. That is the Red step.

`npx vitest run` asks `npx` (the Node package runner, covered in lesson 01) to
run `vitest run` without a watch loop. The four new tests appear in red because
`evaluateFor` does not exist yet. That is the correct state: tests that fail
before implementation are the Red step of the Red–Green–Refactor cycle.

---

## Step 4 — Evaluate the For Loop (Green)

Add to `src/evaluator.ts`:

```typescript
case 'For': {
  const start = evaluate(node.rangeStart, env) as number;
  const step  = evaluate(node.rangeStep,  env) as number;
  const end   = evaluate(node.rangeEnd,   env) as number;

  if (typeof start !== 'number' || typeof step !== 'number' || typeof end !== 'number') {
    throw new RuntimeError('for loop range must be numeric', node.line);
  }

  const ascending = step > 0;
  let i = start;

  // Small tolerance handles floating-point ranges like 0:0.1:1
  // where accumulated rounding may make 0.9999... fail a strict <= 1.0 check.
  const tolerance = Math.abs(step) * 1e-10;

  while (ascending ? i <= end + tolerance : i >= end - tolerance) {
    env.set(node.variable, i);
    for (const stmt of node.body) {
      evaluate(stmt, env);
    }
    i += step;
  }

  return 0;
}
```

Run the tests — all should pass.

**Why `tolerance = Math.abs(step) * 1e-10`:**

The tolerance scales with the step size. A step of `0.1` has rounding error on
the order of `1e-17`; `0.1 * 1e-10 = 1e-11` is well above that noise. A step of
`1000` has no rounding issue; `1000 * 1e-10 = 1e-7` is still far below the step
size and causes no spurious extra iterations. Scaling by the step is more robust
than a fixed epsilon.

**Floating-point range walkthrough — `for i = 0.1:0.1:0.3`:**

Without tolerance this loop silently drops the last iteration. With tolerance,
here is what happens step by step:

- **Step 1:** `i = 0.1`. Is `0.1 <= 0.3 + tolerance`? Yes. Execute body.
- **Step 2:** `i = 0.1 + 0.1 = 0.2`. Is `0.2 <= 0.3 + tolerance`? Yes. Execute body.
- **Step 3:** `i = 0.2 + 0.1 = 0.30000000000000004`. Is `0.30000000000000004 <= 0.3 + tolerance`
  where `tolerance = 0.1 * 1e-10`? Yes — `0.30000000000000004` is within the
  tolerance of `0.3`. Execute body.
- **Step 4:** `i = 0.30000000000000004 + 0.1 = 0.4`. Is `0.4 <= 0.3 + tolerance`?
  No. Loop ends.

Without tolerance, step 3 would fail because `0.30000000000000004 > 0.3` strictly.
The loop would stop one iteration early and `count` would be `2` instead of `3`.
This is the same floating-point behaviour introduced in lesson 07 — binary fractions
cannot represent `0.1` exactly, so repeated addition drifts. The tolerance absorbs
that drift without hiding real over-runs.

---

## Step 5 — Add drawTriangle to the Built-ins

The `drawTriangle` function draws on the canvas, not to the console. It needs
access to the canvas drawing context from `main.ts`.

**New file: `src/canvas.ts`**

`canvas.ts` has a single responsibility: canvas drawing operations. `main.ts`
owns the canvas element and sets it up; `canvas.ts` exposes drawing functions that
operate on that element. The two responsibilities are kept in separate files so
that neither file has to know about the other's concerns.

```typescript
let ctx: CanvasRenderingContext2D | null = null;

export function setCanvasContext(context: CanvasRenderingContext2D): void {
  ctx = context;
}

export function drawTriangleAt(cx: number, cy: number, size: number): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const fill = getComputedStyle(document.documentElement)
                 .getPropertyValue('--colour-triangle').trim();
  ctx.beginPath();
  ctx.moveTo(cx,        cy - size);
  ctx.lineTo(cx - size, cy + size);
  ctx.lineTo(cx + size, cy + size);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function clearCanvas(): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
```

**The `setCanvasContext` function is dependency injection.** The canvas context is
passed *into* the module rather than the module searching for it with
`document.getElementById`. This is a deliberate design decision: `canvas.ts` can
be tested without a real DOM (pass in a mock context), and it can be used in
different rendering environments (pass in a WebGL context) without changing its
code. *Dependency injection* is the technique; the pattern it belongs to is
*Inversion of Control* — callers decide what the module receives, rather than the
module deciding for itself. In lesson 05 the `Environment` class used the same
idea: test code constructs a fresh `Environment` and passes it in rather than
relying on a global.

**Why this file lives at `src/canvas.ts`:**

It lives in `src/` alongside `evaluator.ts` and `main.ts` because it is
first-party source code, not a third-party package. The name `canvas.ts`
communicates its single responsibility: everything canvas-related lives here and
nothing else does. Contrast with a name like `utils.ts` or `helpers.ts`, which
communicates nothing about scope or ownership.

**What would happen if this file were missing:**

`main.ts` would have to contain drawing code — mixing DOM setup, event handling,
and rendering in one file. `evaluator.ts` would have to import from `main.ts` —
a dependency that runs backwards through the pipeline (the evaluator knowing about
the entry point). The build would still work, but any change to the canvas API
would require changes in multiple files that should not know about each other.

In `src/main.ts`, after creating the canvas context:

```typescript
import { setCanvasContext } from './canvas';
// After: const ctx = canvasElement.getContext('2d')!;
setCanvasContext(ctx);
```

**What `getContext('2d')` does:** it asks the browser's canvas element for a
`CanvasRenderingContext2D` — the object that exposes drawing methods like
`beginPath`, `moveTo`, `lineTo`, `fill`, and `clearRect`. The argument `'2d'`
selects the 2D drawing API as opposed to `'webgl'` or `'webgl2'`. The `!` at the
end is a TypeScript non-null assertion: `getContext` can theoretically return
`null` (on a browser that does not support canvas), but no modern browser does.
TypeScript requires us to acknowledge the possibility; the `!` says "I am certain
this is not null." If it were null and the assertion were wrong, `main.ts` would
throw a runtime error at the `setCanvasContext` call.

In the `evaluateBuiltin` function in `src/evaluator.ts`, add:

```typescript
import { drawTriangleAt, clearCanvas } from './canvas';

case 'drawTriangle': {
  const [cx, cy, size] = args as number[];
  drawTriangleAt(cx ?? 250, cy ?? 250, size ?? 50);
  return 0;
}
case 'clearCanvas': {
  clearCanvas();
  return 0;
}
```

**Import treatment — `drawTriangleAt` and `clearCanvas` from `./canvas`:**

1. `canvas.ts` is the module whose single responsibility is canvas drawing
   operations — it owns the rendering context and every operation that changes
   pixels on screen.
2. `drawTriangleAt` draws a single equilateral triangle centred at `(cx, cy)`
   with half-size `size`. `clearCanvas` erases the entire canvas surface.
3. These are imported here rather than calling `ctx` directly because the
   evaluator must not know that a canvas context exists. The evaluator's job is
   interpreting AST nodes. If it held a reference to the canvas context it would
   be coupled to the DOM — it could no longer run in a Node.js test environment
   or be reused in a different renderer. Importing named functions from
   `canvas.ts` keeps the evaluator decoupled from the rendering layer.

**SE lens — module boundaries for side effects:**

Drawing to the canvas is a *side effect* — it changes state outside the
function's return value. The `canvas.ts` module is the single place that knows
about the canvas context. The evaluator calls `drawTriangleAt` without knowing
anything about how rendering works. If we later switch from `<canvas>` to WebGL,
only `canvas.ts` changes — not the evaluator. This is the same separation of
concerns as `console.ts` (lesson 02) handling all console I/O.

### SAVE AND TRY

```
>> clearCanvas()
>> for i = 1:5
     drawTriangle(i * 80, 250, 40)
   end
```

Five triangles at x = 80, 160, 240, 320, 400.

Try making them grow:
```
>> clearCanvas()
>> for i = 1:5
     drawTriangle(i * 80, 250, i * 15)
   end
```

The triangles grow in size from left to right.

---

## Performance: Synchronous Loops and Rendering

This is the first lesson where a loop draws to the canvas. Before moving on,
it is worth understanding what actually happens at the CPU level when you run
that for loop — because the behaviour changes dramatically at scale.

**JavaScript is single-threaded.** There is one execution thread for your
JavaScript code and for the browser's rendering engine. They share the same
thread. This means: when your for loop runs, the browser cannot render anything
until the loop finishes. The loop executes completely first. Then the browser
gets control back. Then it updates the screen.

For 5 triangles the loop runs in microseconds — invisible to a human eye.

For 1,000 triangles in a loop with expensive drawing operations, the loop might
take 500ms. The user sees a frozen page for 500ms, then all 1,000 triangles
appear simultaneously. No intermediate frames. No animation. Just a freeze
followed by a result.

**`requestAnimationFrame` is the browser's mechanism for animation.** It accepts
a callback and schedules it to run just before the browser's next screen repaint —
at most 60 times per second (once every 16.6ms). Code placed inside a
`requestAnimationFrame` callback runs at the right time in the browser's rendering
pipeline. Code in a synchronous for loop does not — it runs whenever JavaScript
runs, with no regard for when the screen is about to update.

```
// What requestAnimationFrame looks like conceptually:
requestAnimationFrame(() => {
  // This callback is called just before the next repaint.
  // Safe to draw here — the browser will show the result.
  drawTriangleAt(x, y, size);
});
```

**OpenMAT's for loop is intentionally synchronous.** This is a deliberate design
decision with a stated trade-off: OpenMAT is an interpreter built for learning,
not a production animation system. Making every drawing call go through
`requestAnimationFrame` would require turning the evaluator into an async state
machine — dramatically increasing complexity in a codebase whose purpose is to be
readable and teachable. The trade-off accepted is: for loops with small iteration
counts work correctly; for loops with thousands of drawing calls will produce a
visible freeze. That is a reasonable constraint for a learning tool.

**Real-world connection:** Every animation loop in browser games uses
`requestAnimationFrame` instead of a synchronous loop — for exactly the reason
stated above: synchronous loops block rendering. React's animation library Framer
Motion, the game engine Phaser, and the data visualisation library D3.js all use
`requestAnimationFrame` internally to schedule drawing work. When you see smooth
animation in a web application, there is a `requestAnimationFrame` loop underneath
it. When you see a frozen tab, there is a synchronous long-running task underneath
that.

---

## Connect the Pieces

```
source: 'for i = 1:5 ...'
    ↓  tokenize: [KEYWORD:'for', IDENTIFIER:'i', EQUALS, NUMBER:'1', COLON, NUMBER:'5', ...]
    ↓  parse: ForNode { variable:'i', rangeStart:Number(1), rangeEnd:Number(5), body:... }
    ↓  evaluate: iterates i = 1, 2, 3, 4, 5; evaluates body each time
    ↓  body calls drawTriangleAt via evaluateBuiltin
canvas renders triangles
```

---

## What Breaks Without This

Remove the floating-point tolerance:

```typescript
while (ascending ? i <= end : i >= end) {
```

Add the floating-point range test:

```
count = 0
for i = 0:0.1:1
  count = count + 1
end
disp(count)
```

With no tolerance, this may print `10` instead of `11` — the final iteration
at `i ≈ 1.0` fails the strict `<= 1.0` check due to accumulated rounding error.
The test `expect(env.get('count')).toBe(11)` documents the exact failure and the
reason for the epsilon.

---

## Definition of Done

- [ ] `for i = 1:5; disp(i); end` prints `1`, `2`, `3`, `4`, `5`
- [ ] Boundary test: exactly 5 iterations for `1:5`
- [ ] Step test: `1:2:9` gives 5 iterations (values 1, 3, 5, 7, 9)
- [ ] Floating-point range test: `0:0.1:1` gives 11 iterations
- [ ] `clearCanvas()` followed by a `for` loop with `drawTriangle` renders
      multiple triangles
- [ ] All evaluator tests pass
- [ ] You can explain what a loop invariant is and state one for a sum loop
- [ ] You can explain why floating-point tolerance is needed and why it scales
      with the step size
- [ ] You can explain why OpenMAT's for loop is synchronous and what the trade-off is
- [ ] You can explain what dependency injection means in the context of `setCanvasContext`
- [ ] `git add src/parser.ts src/evaluator.ts src/canvas.ts` then `git commit -m "Add for loops: range syntax parsed, five triangles drawn with one loop statement"`

---

*Next: Lesson 12 — While Loops. `while condition` repeats until the condition
becomes false. The evaluator gains an infinite-loop safety limit.*
