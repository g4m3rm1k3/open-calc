# OpenMAT — Lesson 16 — Vectors

## What You Will Build

```
>> v = [3, 4]
>> disp(magnitude(v))
5
>> w = [1, 0]
>> disp(dot(v, w))
3
>> clearCanvas()
>> drawVector(v)
```

The canvas shows an arrow from the origin pointing to (3, 4). The length of the
arrow is 5 — the magnitude of `[3, 4]`. The maths is visible.

---

## What You Need to Know First

Lessons 01–15 complete. The evaluator handles `number | string | boolean |
FunctionDefNode` as `EnvironmentValue`. The BRD lexer from lesson 04 already
produces `LBRACKET` (`[`) and `RBRACKET` (`]`) tokens.

---

## Concept: Vectors — Direction and Magnitude

**What a vector is:**

A vector is an ordered list of numbers that represents either a *point* in space
or a *displacement* (direction and distance). The vector `[3, 4]` can mean:
"the point 3 units to the right and 4 units up from the origin" (a point), or
"move 3 right and 4 up from wherever you are" (a displacement).

In graphics and physics, this distinction matters. In lesson 18, homogeneous
coordinates handle both cases correctly with 3×3 matrices.

**Magnitude:**

The magnitude (or length) of a 2D vector `[x, y]` is:

```
|v| = √(x² + y²)
```

This is the Pythagorean theorem. `[3, 4]` forms a right triangle with legs 3
and 4, and hypotenuse `√(9 + 16) = √25 = 5`. The `[3, 4, 5]` triangle is the
simplest Pythagorean triple.

**Addition:**

Adding two vectors adds their corresponding components:

```
[a, b] + [c, d] = [a+c, b+d]
```

Geometrically, place the tail of the second vector at the head of the first.
The result is the vector that goes from the start of the first to the end of
the second. This is how velocity and force compose in physics.

**Dot product:**

The dot product of two vectors produces a *number*:

```
[a, b] · [c, d] = a×c + b×d
```

Geometrically, it equals `|u| × |v| × cos(θ)`, where `θ` is the angle between
the vectors. If two vectors are perpendicular, `cos(90°) = 0`, so their dot
product is `0`. The dot product is how you test perpendicularity and project one
vector onto another.

**CS concept — arrays as structured data:**

An *array* stores a fixed-size sequence of elements of the same type, each
accessible by its *index* — a numeric position starting at zero. The key
property is *random access*: reading element `v[i]` takes O(1) time regardless
of array size.

For vectors, the index is the meaning: `v[0]` is the x-component, `v[1]` is
the y-component. Every vector operation — addition, scaling, dot product —
accesses elements by position. Swapping `v[0]` and `v[1]` produces a
mathematically different vector, not just a storage layout change.

**CS lens — type extension:**

The evaluator currently returns `EnvironmentValue = number | string | boolean |
FunctionDefNode`. Adding vectors requires extending to include `number[]`. Every
consumer of `EnvironmentValue` — the environment, the evaluator's switch cases,
the built-in functions — must handle the new type. TypeScript's type system
enforces this: the compiler shows every place that needs updating before the
code compiles.

**SE lens — backwards compatibility:**

Adding `number[]` to `EnvironmentValue` is a breaking change for code that
assumed the value was always a scalar. TypeScript will show errors at every
consumer that treats an `EnvironmentValue` as a `number` without a type guard. This
is TypeScript's static type checking in action: no runtime surprises.

---

## Step 1 — Extend EnvironmentValue

Open `src/environment.ts`. Import `FunctionDefNode` and extend the type:

```typescript
import type { FunctionDefNode } from './parser';

export type EnvironmentValue = number | string | boolean | FunctionDefNode | number[];
```

TypeScript will now show errors at every place that treats an `EnvironmentValue`
as a bare number. Add type guard helpers in `src/evaluator.ts`:

```typescript
function assertNumber(value: EnvironmentValue, context: string, line: number): number {
  if (typeof value === 'number') return value;
  throw new RuntimeError(`expected a number in ${context}, got ${Array.isArray(value) ? 'a vector' : typeof value}`, line);
}

function assertVector(value: EnvironmentValue, context: string, line: number): number[] {
  if (Array.isArray(value)) return value as number[];
  throw new RuntimeError(`expected a vector in ${context}, got ${typeof value}`, line);
}
```

**What `Array.isArray` does — and why it is the right test:**

`Array.isArray(value)` returns `true` if and only if `value` is a JavaScript
array. It is the idiomatic way to test for an array for a subtle reason: `typeof
[3, 4]` returns `'object'`, not `'array'` — JavaScript arrays are objects, so
`typeof` cannot distinguish them from plain objects or `null`. The alternative,
`[3, 4] instanceof Array`, fails when code crosses iframe boundaries in a browser
(each frame has its own `Array` constructor, so an array from one frame is not an
`instanceof` the other frame's `Array`). `Array.isArray` is defined by the
language specification to always return the correct answer regardless of where
the array was created.

**Walkthrough — `assertNumber`:**

`assertNumber(5, 'magnitude()', 1)`: the condition `typeof 5 === 'number'` is
`true`, so the function immediately returns `5`.

`assertNumber([3, 4], 'magnitude()', 1)`: `typeof [3, 4]` returns `'object'`,
not `'number'`, so the condition is `false`. The function reaches the `throw`.
`Array.isArray([3, 4])` is `true`, so the error message reads
`'expected a number in magnitude(), got a vector'`. A `RuntimeError` is thrown
with that message and line number `1`.

**Walkthrough — `assertVector`:**

`assertVector([3, 4], 'dot()', 1)`: `Array.isArray([3, 4])` is `true`, so the
function returns `[3, 4]` (cast to `number[]`).

`assertVector(5, 'dot()', 1)`: `Array.isArray(5)` is `false`, so the throw is
reached. `typeof 5` is `'number'`, so the error reads `'expected a vector in
dot(), got number'`. A `RuntimeError` is thrown.

**CS lens — defensive programming:**

`assertNumber` and `assertVector` are *type guards with runtime enforcement*. At
compile time TypeScript knows a value is `EnvironmentValue` — it could be any
member of the union. These functions narrow the type by either confirming it or
throwing before unsafe operations run. The pattern appears in every well-typed
runtime: TypeScript's own `never` narrowing, Java's `instanceof` checks, Rust's
`match` exhaustiveness — all are forms of the same principle.

**SE lens — fail loudly at the boundary:**

Without these guards, passing a vector to `magnitude()` when it expects a scalar
would produce `NaN` — a silent wrong answer rather than a clear error message.
The guard moves the failure from "wrong output somewhere downstream" to "explicit
error at the exact point of misuse." This is the *fail fast* principle: surface
the error as close to its source as possible so the stack trace points directly
at the problem.

---

## Step 2 — Add the VectorNode AST Type

Open `src/parser.ts`. Add `VectorNode` to the `ASTNode` union:

```typescript
export type ASTNode =
  | NumberNode | StringNode | BooleanNode | IdentifierNode
  | BinaryOpNode | UnaryOpNode | AssignmentNode | FunctionCallNode
  | IfNode | BlockNode | ForNode | WhileNode | FunctionDefNode
  | VectorNode;   // ← new

export interface VectorNode {
  kind:     'Vector';
  elements: ASTNode[];
  line:     number;
}
```

Update `parseAtom` in the parser to detect vector literals when `[` is not
followed by an expression that closes with `)`:

```typescript
if (token.type === TokenType.LBRACKET) {
  advance();   // consume '['
  const elements: ASTNode[] = [];

  if (peek().type !== TokenType.RBRACKET) {
    elements.push(parseAssignment());
    while (peek().type === TokenType.COMMA) {
      advance();   // consume ','
      elements.push(parseAssignment());
    }
  }
  expect(TokenType.RBRACKET);

  return { kind: 'Vector', elements, line: token.line };
}
```

---

## Step 3 — Extend the Evaluator for Vectors

Update the `BinaryOp` case in `src/evaluator.ts` to dispatch on value types:

```typescript
case 'BinaryOp': {
  const left  = evaluate(node.left,  env);
  const right = evaluate(node.right, env);

  // ── Scalar arithmetic (unchanged) ───────────────────────────────────────
  if (typeof left === 'number' && typeof right === 'number') {
    switch (node.operator) {
      case '+':  return left + right;
      case '-':  return left - right;
      case '*':  return left * right;
      case '/':
        if (right === 0) throw new RuntimeError('Division by zero', node.line);
        return left / right;
      case '^':  return Math.pow(left, right);
      case '>':  return left >  right;
      case '<':  return left <  right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '==': return left === right;
      case '~=': return left !== right;
      case '&&': return (left !== 0) && (right !== 0);
      case '||': return (left !== 0) || (right !== 0);
    }
  }

  // ── Vector arithmetic ──────────────────────────────────────────────────
  if (Array.isArray(left) && Array.isArray(right)) {
    const L = left as number[], R = right as number[];
    if (node.operator === '+') return L.map((c, i) => c + R[i]);
    if (node.operator === '-') return L.map((c, i) => c - R[i]);
  }

  if (Array.isArray(left) && typeof right === 'number') {
    const L = left as number[];
    if (node.operator === '*') return L.map(c => c * right);
    if (node.operator === '/') return L.map(c => c / right);
  }

  if (typeof left === 'number' && Array.isArray(right)) {
    const R = right as number[];
    if (node.operator === '*') return R.map(c => c * left);
  }

  throw new RuntimeError(`operator '${node.operator}' is not supported for these types`, node.line);
}
```

**Walkthrough — `BinaryOp` dispatch for `[1, 2] + [3, 4]`:**

The evaluator reaches the `BinaryOp` case. It evaluates the left operand first:
`evaluate(node.left, env)` recurses into the left `VectorNode` and returns the
JavaScript array `[1, 2]`. Then it evaluates the right: `evaluate(node.right,
env)` returns `[3, 4]`.

Now the dispatch runs. `typeof left === 'number'`? No — `typeof [1, 2]` is
`'object'`. The scalar branch is skipped. `Array.isArray(left) &&
Array.isArray(right)`? Yes. `node.operator === '+'`? Yes. The call
`L.map((c, i) => c + R[i])` runs.

`Array.prototype.map` — first explanation: `.map(fn)` returns a new array the
same length as the original, where each element is replaced by the result of
calling `fn(element, index, array)`. It does **not** mutate the original array;
it always returns a fresh one. Here `fn` is the arrow function `(c, i) => c +
R[i]` — `c` is the current element from `L`, and `i` is its index.

The three iterations:

- Index `0`: `c = 1`, `i = 0`, `R[0] = 3`. Returns `1 + 3 = 4`.
- Index `1`: `c = 2`, `i = 1`, `R[1] = 4`. Returns `2 + 4 = 6`.

Result: `[4, 6]`.

**Walkthrough — scalar multiplication `[3, 4] * 2`:**

`evaluate(node.left, env)` → `[3, 4]`. `evaluate(node.right, env)` → `2`.
`Array.isArray(left) && Array.isArray(right)`? No — `right` is a number. Next
branch: `Array.isArray(left) && typeof right === 'number'`? Yes. `node.operator
=== '*'`? Yes. `L.map(c => c * right)` runs:

- Index `0`: `c = 3`. Returns `3 * 2 = 6`.
- Index `1`: `c = 4`. Returns `4 * 2 = 8`.

Result: `[6, 8]`.

**CS lens — type-based dispatch:**

The `BinaryOp` case is now a *multi-method* — a function whose behaviour depends
on the runtime types of its arguments, not just their syntactic position. This is
the same idea as operator overloading in C++ or Python's `__add__`. Here it is
implemented manually with `typeof` and `Array.isArray` guards rather than through
language machinery, which makes the dispatch rules explicit and readable.

**SE lens — open/closed principle:**

This is the open/closed principle again — the same principle that shaped the
dispatch table in lesson 09. The vector arithmetic branches are *added* alongside
the scalar branches without touching the existing scalar logic. The scalar path is
closed for modification; the vector path is open for addition. When matrices
arrive in lesson 17, the same pattern repeats: add new branches, leave existing
ones untouched.

Add the `Vector` case:

```typescript
case 'Vector': {
  const values = node.elements.map(el => {
    const v = evaluate(el, env);
    if (typeof v !== 'number') {
      throw new RuntimeError('vector elements must be numbers', node.line);
    }
    return v;
  });
  return values;
}
```

**Walkthrough — `case 'Vector':` for `[3, 4]`:**

The parser produced `VectorNode({ kind: 'Vector', elements: [NumberNode(3),
NumberNode(4)], line: 1 })`. The evaluator reaches this case and calls
`node.elements.map(el => ...)`. This iterates over the two element nodes.

First element: `evaluate(NumberNode(3), env)` returns `3`. `typeof 3 !==
'number'`? No — it is a number, so no error is thrown. The value `3` is
returned from the arrow function and placed at index `0` of the new array.

Second element: `evaluate(NumberNode(4), env)` returns `4`. Same check passes.
The value `4` is placed at index `1`.

`node.elements.map(...)` returns the new array `[3, 4]`. This is the return
value of the `Vector` case: the JavaScript array `[3, 4]`, which becomes the
runtime representation of the vector.

---

## Step 4 — Write the Tests First (Red)

Create `src/vector.test.ts`:

```typescript
import { tokenize }    from './lexer';
import { parse }       from './parser';
import { evaluate }    from './evaluator';
import { Environment } from './environment';

function run(src: string, env = new Environment()) {
  return evaluate(parse(tokenize(src)), env);
}

test('stores a vector literal', () => {
  const result = run('[3, 4]');
  expect(Array.isArray(result)).toBe(true);
  expect(result).toEqual([3, 4]);
});

test('vector addition', () => {
  expect(run('[1, 2] + [3, 4]')).toEqual([4, 6]);
});

test('vector scalar multiplication', () => {
  expect(run('[3, 4] * 2')).toEqual([6, 8]);
});

test('magnitude([3, 4]) = 5', () => {
  expect(run('magnitude([3, 4])')).toBeCloseTo(5, 10);
});

test('dot([3, 4], [1, 0]) = 3', () => {
  expect(run('dot([3, 4], [1, 0])')).toBe(3);
});

test('dot([1, 0], [0, 1]) = 0 (perpendicular)', () => {
  expect(run('dot([1, 0], [0, 1])')).toBe(0);
});
```

Run `npx vitest run` — tests fail.

---

## Step 5 — Add Vector Built-in Functions (Green)

Add to `src/stdlib.ts` and/or directly in `evaluateBuiltin`:

```typescript
// In evaluateBuiltin — vector functions (before the STDLIB dispatch):
if (name === 'magnitude') {
  const v = assertVector(evaluate(argNodes[0], env), 'magnitude()', callLine);
  return Math.sqrt(v.reduce((s, c) => s + c * c, 0));
}
if (name === 'dot') {
  const u = assertVector(evaluate(argNodes[0], env), 'dot()', callLine);
  const v = assertVector(evaluate(argNodes[1], env), 'dot()', callLine);
  return u.reduce((s, c, i) => s + c * v[i], 0);
}
if (name === 'normalize') {
  const v = assertVector(evaluate(argNodes[0], env), 'normalize()', callLine);
  const mag = Math.sqrt(v.reduce((s, c) => s + c * c, 0));
  if (mag === 0) throw new RuntimeError('cannot normalize a zero vector', callLine);
  return v.map(c => c / mag);
}
```

**`Array.prototype.map` and `.reduce` — explained at first use:**

`.map(fn)` returns a new array where each element is replaced by `fn(element,
index, array)`. It does not mutate the original. We saw it in Step 3 for vector
arithmetic; here the same method builds the squared-components array and the
normalised array.

`.reduce((accumulator, current, index) => ..., initialValue)` folds an array
into a single value. Starting from `initialValue`, it calls the function once per
element: the return value becomes the next `accumulator`. For magnitude:
`v.reduce((s, c) => s + c * c, 0)` starts with `s = 0` and adds `c * c` for
each component `c`.

For `v = [3, 4]`:

- Start: `s = 0`.
- Index `0`: `c = 3`. `s = 0 + 3 * 3 = 0 + 9 = 9`.
- Index `1`: `c = 4`. `s = 9 + 4 * 4 = 9 + 16 = 25`.

`v.reduce(...)` returns `25`. `Math.sqrt(25) = 5`. This is the Pythagorean
theorem executed as a fold over the array.

`Math.sqrt(x)` is a built-in JavaScript function. It accepts a non-negative
number and returns the principal (positive) square root. For negative input it
returns `NaN`; it does not throw.

Update `disp` to format vectors:

```typescript
if (name === 'disp') {
  const val = evaluate(argNodes[0], env);
  const formatted = Array.isArray(val) ? '[' + (val as number[]).map(formatResult).join(', ') + ']' : formatResult(val);
  printOutput(formatted);
  return val;
}
```

Run the tests — all should pass.

---

## Step 6 — Add drawVector to the Canvas Module

Open `src/canvas.ts`:

```typescript
export function drawVector(
  vector:  number[],
  originX: number = 250,
  originY: number = 250,
  scale:   number = 30
): void {
  if (!ctx || vector.length < 2) return;

  const [x, y] = vector;
  const tipX   = originX + x * scale;
  const tipY   = originY - y * scale;   // flip y: positive y is upward on screen

  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(tipX, tipY);
  const colour = getComputedStyle(document.documentElement).getPropertyValue('--colour-triangle').trim();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.stroke();

  const angle = Math.atan2(tipY - originY, tipX - originX);
  const head  = 10;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - head * Math.cos(angle - Math.PI / 6), tipY - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(tipX - head * Math.cos(angle + Math.PI / 6), tipY - head * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = colour;
  ctx.fill();
}
```

Add to `evaluateBuiltin`:

```typescript
if (name === 'drawVector') {
  const v = assertVector(evaluate(argNodes[0], env), 'drawVector()', callLine);
  drawVectorOnCanvas(v);
  return 0;
}
```

### SAVE AND TRY

```
>> v = [3, 4]
>> magnitude(v)
5
>> w = [1, 0]
>> dot(v, w)
3
>> clearCanvas()
>> drawVector(v)
```

Arrow appears from the canvas centre, pointing toward the upper-right.

```
>> u = [1, 0]
>> w = [0, 1]
>> clearCanvas()
>> drawVector(u)
>> drawVector(w)
>> dot(u, w)
0
```

Two perpendicular arrows. Dot product is zero.

---

## Connect the Pieces

```
EnvironmentValue = number | string | boolean | FunctionDefNode | number[]
                                                                      ↑
                                              VectorNode evaluates to number[]
BinaryOp dispatches on typeof left, typeof right, Array.isArray
evaluateBuiltin handles magnitude, dot, normalize, drawVector
```

In lesson 17, `number[][]` (matrices) is added to `EnvironmentValue`. The same
pattern repeats: add the type, add type guards, add cases to `BinaryOp`, add
built-in functions.

**Real-World Connection:**

The data structure built in this lesson is not a toy. 3D game engines — Unity,
Unreal Engine — represent every position, velocity, and force in the simulation
as a vector. Every physics update (applying gravity, resolving a collision,
moving a character) is a vector addition or scalar multiplication of exactly the
kind implemented above. WebGL shader programs have `vec2`, `vec3`, and `vec4`
as first-class built-in types; the GPU executes component-wise addition and
dot products in parallel hardware for every pixel on screen. NumPy's `ndarray`
extends the same concept to arbitrary dimensions and is the foundation of machine
learning frameworks like PyTorch and TensorFlow. The `.map` and `.reduce`
pattern in this lesson is the scalar version of what those systems do on
thousands of elements simultaneously.

---

## What Breaks Without This

Replace the type-dispatching `BinaryOp` with a cast:

```typescript
case 'BinaryOp': {
  const left  = evaluate(node.left,  env) as number;
  const right = evaluate(node.right, env) as number;
  return left + right;   // 'as number' silences TypeScript but not JavaScript
}
```

`[3, 4] + 1` produces `'3,41'` — JavaScript coerces the array to the string
`'3,4'`, then concatenates `'1'`. Silent wrong output with no error. The `if
(Array.isArray(...))` guards dispatch to the correct operation before the
arithmetic runs.

---

## Definition of Done

- [ ] `v = [3, 4]`; `disp(v)` shows `[3, 4]`
- [ ] `magnitude([3, 4])` → `5`
- [ ] `dot([3, 4], [1, 0])` → `3`
- [ ] `[1, 2] + [3, 4]` → `[4, 6]`
- [ ] `drawVector([3, 4])` draws an arrow on the canvas
- [ ] `dot([1, 0], [0, 1])` → `0`
- [ ] All vector tests pass
- [ ] You can derive the magnitude formula from the Pythagorean theorem
- [ ] You can explain what the dot product measures geometrically
- [ ] You can explain why `Array.isArray` is used instead of `typeof` or `instanceof`
- [ ] You can trace what `.reduce((s, c) => s + c * c, 0)` produces for `[3, 4]` step by step

```
git add src/environment.ts src/parser.ts src/evaluator.ts src/canvas.ts src/vector.test.ts
git commit -m "Add vectors: [3, 4] syntax parsed, magnitude/dot/normalize built-ins, drawVector on canvas"
```

---

*Next: Lesson 17 — Matrices. `A * B` multiplies two matrices. Matrices are the
mathematical foundation of the transformation in lesson 18.*
