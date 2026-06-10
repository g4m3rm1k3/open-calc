# OpenMAT — Lesson 15 — Standard Library

## What You Will Build

After this lesson, the REPL accepts the full set of mathematical functions:

```
>> sin(pi / 6)
0.5
>> cos(pi)
-1
>> log(exp(1))
1
>> sqrt(2)
1.41421356237
>> abs(-5)
5
>> floor(3.7)
3
>> mod(10, 3)
1
```

All mathematical constants and functions live in a single dedicated module
(`src/stdlib.ts`), connected to the evaluator through a *dispatch table*. A
`degrees` mode converts trig inputs automatically so users can write `sin(30)`
instead of `sin(pi/6)`.

---

## What You Need to Know First

Lessons 01–14 complete. You have a working evaluator with `evaluate`,
`parseExpression`, a symbol table (`Environment`), scope chains, user-defined
functions, recursion, and the `callDepth` guard. Built-in functions such as
`sqrt`, `sin`, and `disp` currently live as `case` branches inside the
`evaluateBuiltin` switch in `evaluator.ts`. This lesson extracts all of them
into a separate module and replaces the switch with a lookup.

---

## Concept: Functions Are Values

In many older languages, a function is syntax — something you declare and call,
but not something you can store in a variable or pass to another function.
JavaScript and TypeScript do not work that way.

In JavaScript and TypeScript, **a function is a value**. You can store it in a
variable, put it in an array, use it as a property of an object, pass it to
another function, or return it from a function. A language that supports this is
said to have *first-class functions*.

This is not an obscure feature. It is the foundation of callbacks, event
handlers, `Array.prototype.map`, `setTimeout`, React's `useState`, and almost
every pattern in modern JavaScript.

Here is first-class functions at their most direct:

```typescript
// A function assigned to a variable — exactly like a number or string.
const double = (x: number): number => x * 2;

// That variable can be passed to another function.
function applyToFive(fn: (x: number) => number): number {
  return fn(5);
}

applyToFive(double); // → 10
```

`double` is a value of type `(x: number) => number` — a function that accepts a
number and returns a number. `applyToFive` does not call `double` by name; it
receives a function object and calls it. It would work identically if you passed
`(x) => x * 3` or `Math.abs` — any function with a matching signature.

The type `(x: number) => number` is a *function type annotation*. The part
before `=>` is the parameter list; the part after is the return type. TypeScript
uses this to verify at compile time that every function you pass has the right
shape.

---

## Concept: The Dispatch Table

This is where first-class functions become practically powerful. Right now,
`evaluateBuiltin` contains a `switch(name)` that maps function names to
behaviour. It works, but every new function requires a new `case` in the switch,
a new type check, and a new error message. The switch is already long. Add ten
more functions and it becomes unreadable.

A *dispatch table* replaces the switch with a data structure: a plain JavaScript
object whose keys are function names and whose values are the corresponding
function objects. Dispatch then becomes a single lookup, the same for every
function:

```typescript
const fn = STDLIB[name];
if (fn) return fn(args, callLine);
```

This is not just shorter — it is a fundamentally different design. The switch is
logic: the interpreter needs to be modified to add a function. The dispatch table
is data: adding a function is adding an entry to an object. **Logic stays
constant; data grows.**

This is also called *table-driven programming* — replacing conditional branching
with data lookup. Text editors use dispatch tables to map key bindings to
actions. Game engines use them to map input events to handlers. Web frameworks
use them to map URL patterns to view functions.

---

## Concept: The Open/Closed Principle

The design just described has a name in software engineering: the *open/closed
principle*. It states that a well-designed component should be:

- **Open for extension** — new behaviour can be added.
- **Closed for modification** — existing code does not need to change when new
  behaviour is added.

Adding a new function to `STDLIB` requires exactly one line: one new entry in
the object. The dispatch logic — `const fn = STDLIB[name]; if (fn) return fn(...)` —
never changes. It is closed for modification. `STDLIB` is open for extension.

You have already seen this principle in this codebase. In lesson 03, the
`TokenType` const object let you add new token types without modifying the
lexer's main loop. The lexer reads token types as data; it does not branch on
every possible token type. Same principle, same pattern.

When you see it named again later in the project — in the intersection solver
in lesson 19, or in the plugin system in lesson 22 — you will recognise it. That
recognition is the point. A principle seen once in one context is fragile. Seen
in three contexts, connected explicitly each time, it becomes permanent.

---

## Step 1 — Create `src/stdlib.ts`

**The problem:** Mathematical functions and constants currently scattered across
`evaluator.ts` have no single owner. Adding a new function means modifying the
evaluator. The evaluator's job is evaluating AST nodes — it should not also be
the place you go to add `atan2`.

**The solution:** a dedicated module whose single responsibility is defining what
mathematical functions and constants OpenMAT supports.

**Why this file name and location:** `src/stdlib.ts` — `stdlib` is the
conventional abbreviation for *standard library*, the set of built-in functions
provided by a language. Python's standard library is `import math`. C's is
`<math.h>`. OpenMAT's is this file. It lives in `src/` alongside the other
interpreter modules, not in a subdirectory, because it is a peer of `lexer.ts`
and `evaluator.ts`.

Create `src/stdlib.ts`:

```typescript
import { EnvironmentValue } from './environment';
import { RuntimeError }     from './evaluator';

export type BuiltinFn = (args: EnvironmentValue[], callLine: number) => EnvironmentValue;

// Degree mode: when true, trig inputs are in degrees.
// Default: false (radians, the scientific standard).
let degreeMode = false;

export function setDegreeMode(enabled: boolean): void {
  degreeMode = enabled;
}

export function isDegreeMode(): boolean {
  return degreeMode;
}

function toRad(x: EnvironmentValue, line: number): number {
  if (typeof x !== 'number') throw new RuntimeError('trig function requires a number', line);
  return degreeMode ? (x * Math.PI) / 180 : x;
}

function num(x: EnvironmentValue, name: string, line: number): number {
  if (typeof x !== 'number') throw new RuntimeError(`${name} requires a number`, line);
  return x;
}

export const STDLIB: Record<string, BuiltinFn> = {
  // ── Arithmetic ────────────────────────────────────────────────────────────
  sqrt:  ([x], l) => { const n = num(x, 'sqrt', l); if (n < 0) throw new RuntimeError('sqrt of negative number', l); return Math.sqrt(n); },
  abs:   ([x], l) => Math.abs(num(x, 'abs', l)),
  floor: ([x], l) => Math.floor(num(x, 'floor', l)),
  ceil:  ([x], l) => Math.ceil(num(x, 'ceil', l)),
  round: ([x], l) => Math.round(num(x, 'round', l)),
  sign:  ([x], l) => Math.sign(num(x, 'sign', l)),
  mod:   ([x, y], l) => num(x, 'mod', l) % num(y, 'mod', l),
  max:   (args, l) => Math.max(...args.map(a => num(a, 'max', l))),
  min:   (args, l) => Math.min(...args.map(a => num(a, 'min', l))),
  pow:   ([x, y], l) => Math.pow(num(x, 'pow', l), num(y, 'pow', l)),

  // ── Trigonometry (respects degreeMode) ───────────────────────────────────
  sin:   ([x], l) => Math.sin(toRad(x, l)),
  cos:   ([x], l) => Math.cos(toRad(x, l)),
  tan:   ([x], l) => Math.tan(toRad(x, l)),
  asin:  ([x], l) => { const r = Math.asin(num(x, 'asin', l)); return degreeMode ? r * 180 / Math.PI : r; },
  acos:  ([x], l) => { const r = Math.acos(num(x, 'acos', l)); return degreeMode ? r * 180 / Math.PI : r; },
  atan:  ([x], l) => { const r = Math.atan(num(x, 'atan', l)); return degreeMode ? r * 180 / Math.PI : r; },
  atan2: ([y, x], l) => { const r = Math.atan2(num(y, 'atan2', l), num(x, 'atan2', l)); return degreeMode ? r * 180 / Math.PI : r; },

  // ── Exponential and logarithm ─────────────────────────────────────────────
  exp:   ([x], l) => Math.exp(num(x, 'exp', l)),
  log:   ([x], l) => { const n = num(x, 'log', l); if (n <= 0) throw new RuntimeError('log of non-positive number', l); return Math.log(n); },
  log2:  ([x], l) => Math.log2(num(x, 'log2', l)),
  log10: ([x], l) => Math.log10(num(x, 'log10', l)),
};

// Mathematical constants — accessible as zero-argument functions or identifiers
export const CONSTANTS: Record<string, number> = {
  pi:  Math.PI,
  e:   Math.E,
  inf: Infinity,
  nan: NaN,
};
```

### Walkthrough — what this file contains and why

**The imports.** Two things are imported:

`environment.ts` is the module responsible for storing and resolving named
values — variables and functions the user has defined. `EnvironmentValue` is the
union type that describes everything an OpenMAT expression can evaluate to: a
number, a string, a function definition. It is imported here because every entry
in `STDLIB` receives `EnvironmentValue` arguments and returns an `EnvironmentValue`.

`evaluator.ts` exports `RuntimeError` — the error class introduced in lesson 09
for errors that occur at evaluation time (wrong type, division by zero). It is
imported here because `stdlib.ts` needs to throw runtime errors when a caller
passes a string to `sqrt` or a negative number to `log`. Importing `RuntimeError`
from `evaluator.ts` keeps the error hierarchy consistent: the same error type,
the same structure, whether the error comes from the evaluator itself or from a
standard library function.

**`BuiltinFn`** is a type alias for the function signature every entry in the
dispatch table must match: it receives an array of `EnvironmentValue` arguments
and a line number, and returns an `EnvironmentValue`. The line number is there so
that if a function throws a `RuntimeError`, the error can report which line in
the user's program caused it — the same reason `RuntimeError` takes a `line`
argument throughout the evaluator.

**`degreeMode`** is a module-level `let` variable. It is the second instance of
module-level mutable state in this project — the first was `callDepth` in
`evaluator.ts`. The pattern is the same: some state must persist across calls but
does not belong to any specific object. `callDepth` tracks how deeply the
evaluator has recursed. `degreeMode` tracks whether the user has chosen degree or
radian input for trig functions. Both are singletons: there is one value for the
entire session.

This is appropriate for `degreeMode`: the user sets it once and it applies to all
subsequent calculations — exactly what a global mode should do. It would be wrong
for a server handling multiple concurrent users (each user would need their own
`degreeMode`, which means it would need to live on a per-request context object,
not at module level). For a single-user browser application, a module-level
variable is the right tool.

`setDegreeMode` and `isDegreeMode` are the public API for reading and writing
that state. The variable itself is not exported — it is `let degreeMode`, not
`export let degreeMode`. This is the public/private distinction applied to
module-level state: callers must use the functions; they cannot reach the variable
directly. If the internal representation of degree mode ever needed to change
(say, to a three-way enum: radians/degrees/gradians), the exported functions
would absorb that change without callers needing to know.

**`toRad`** and **`num`** are private helper functions — not exported. `toRad`
converts a value from degrees to radians if `degreeMode` is on, and validates
that the input is a number. `num` validates that an input is a number and
provides a useful error message naming the function that rejected the value. Both
helpers are used by multiple entries in `STDLIB`. Without them, every trig
function would repeat the same type check. Shared helpers are why DRY (Don't
Repeat Yourself) is a principle, not a preference: repeated code means repeated
bugs.

**`STDLIB`** is declared as `Record<string, BuiltinFn>`. `Record<string, BuiltinFn>`
is a TypeScript type that describes a plain JavaScript object where every key is
a `string` and every value is a `BuiltinFn`. TypeScript will reject any value
that does not match `BuiltinFn`. The alternative — typing it as `object` or `any`
— would give up compile-time verification that every entry in the table actually
has the right signature. TypeScript's job here is to make the contract between
`STDLIB` and the dispatch logic machine-checked, not just documented.

**Arrow functions inside `STDLIB`.** Each entry is an arrow function. Arrow
functions used here for the first time in this context: `([x], l) => ...` is an
arrow function with two parameters. The first parameter, `[x]`, uses
*array destructuring* — it unpacks the first element of the `args` array into a
local name `x`. This is equivalent to writing `(args, l) => { const x = args[0]; ... }`.
Destructuring is the language telling you what shape of data you expect: `([x])` says
"I expect an array and I care about its first element." The second parameter, `l`, is
the line number — `l` is acceptable shorthand here only because the parameter is used
immediately in the same expression, making its meaning obvious from context. In any
other situation, prefer `callLine` or `lineNumber`.

**`CONSTANTS`** is a `Record<string, number>` — a plain object mapping string
names to number values. It exists separately from `STDLIB` because constants
(`pi`, `e`) are not functions — the user can write `pi` as a bare identifier, not
just `pi()`. The evaluator handles this distinction; the standard library just
provides the data.

---

## Step 2 — Integrate the Standard Library into the Evaluator

**The problem:** `evaluator.ts` currently has a `switch(name)` that grows every
time a new built-in is added. It needs to be replaced with a lookup against
`STDLIB`.

**The imports:** Add these to the top of `src/evaluator.ts`:

```typescript
import { STDLIB, CONSTANTS } from './stdlib';
```

`stdlib.ts` is the module whose single responsibility is defining the standard
library. We import `STDLIB` (the dispatch table) and `CONSTANTS` (the built-in
mathematical constants). We do not import `BuiltinFn` or `degreeMode` here
because the evaluator does not need to know the function type or manipulate the
degree flag directly — those details belong to `stdlib.ts`.

**Replace `evaluateBuiltin`:**

```typescript
function evaluateBuiltin(
  name:     string,
  argNodes: ASTNode[],
  env:      Environment,
  callLine: number
): EnvironmentValue {
  // User-defined function check (unchanged from lesson 13)
  const maybe = env.get(name);
  if (maybe && typeof maybe === 'object' && 'kind' in maybe && maybe.kind === 'FunctionDef') {
    return callUserFunction(maybe, argNodes, env);
  }

  // Constants as zero-argument "functions": pi(), e()
  if (name in CONSTANTS && argNodes.length === 0) {
    return CONSTANTS[name];
  }

  // Standard library lookup
  const fn = STDLIB[name];
  if (fn) {
    const args = argNodes.map(arg => evaluate(arg, env));
    return fn(args, callLine);
  }

  // disp — kept separate because it needs printOutput from console.ts
  if (name === 'disp') {
    const args = argNodes.map(arg => evaluate(arg, env));
    const val = args[0] ?? 0;
    printOutput(formatResult(val));
    return val;
  }

  // Canvas drawing functions (from lesson 11)
  if (name === 'drawTriangle') {
    const args = argNodes.map(arg => evaluate(arg, env)) as number[];
    drawTriangleAt(args[0] ?? 250, args[1] ?? 250, args[2] ?? 50);
    return 0;
  }
  if (name === 'clearCanvas') {
    clearCanvas();
    return 0;
  }

  throw new RuntimeError(`Function '${name}' is not defined`, callLine);
}
```

**Also update the `Identifier` case in `evaluate`** to resolve constants before
checking the user's environment:

```typescript
case 'Identifier': {
  // Mathematical constants are built-in identifiers
  if (node.name in CONSTANTS) return CONSTANTS[node.name];

  const value = env.get(node.name);
  if (value === undefined) throw new RuntimeError(`Variable '${node.name}' is not defined`, node.line);
  return value;
}
```

### Walkthrough — the dispatch logic

The dispatch in `evaluateBuiltin` follows a priority order. First, check whether
the name refers to a user-defined function — a `FunctionDef` the user stored in
the environment with `function f(x) = ...`. User definitions shadow built-ins.
If the user writes `function sin(x) = x`, their version wins. This matches how
Python and JavaScript work: user definitions override built-ins.

Second, check whether the name is a constant called with no arguments. This lets
the user write `pi()` as well as `pi` — a minor convenience that makes OpenMAT
consistent with MATLAB.

Third — the new part — look up `name` in `STDLIB`. `STDLIB[name]` is a plain
property access on a JavaScript object. JavaScript's object property lookup is
O(1) — it hashes the key and retrieves the value. If the name is in the table,
`fn` is a `BuiltinFn` function object. The evaluator evaluates all argument
nodes against the current environment (`argNodes.map(arg => evaluate(arg, env))`),
producing an array of `EnvironmentValue` results, and passes them to `fn`.

Notice what `evaluateBuiltin` does not know: it does not know it is calling
`Math.sin` or `Math.sqrt`. It knows it has a `BuiltinFn` — a function with a
known signature. The dispatch logic is generic. This is first-class functions
doing their job: the caller and the implementation are decoupled by the shared
type.

`disp` and the canvas functions remain as explicit `if` branches because they
depend on side-effecting functions (`printOutput`, `drawTriangleAt`) imported
from other modules that `stdlib.ts` should not know about. Keeping them separate
is the module boundary working as intended: `stdlib.ts` is pure mathematics,
`evaluator.ts` owns the side effects.

The `Identifier` case change is equally important. Before, `pi` would fail with
"Variable 'pi' is not defined" unless the user had explicitly assigned it.
Now, the evaluator checks `CONSTANTS` first. The user can write `pi` anywhere a
number is valid. The lookup order — constants first, then the environment — also
means the user cannot accidentally shadow `pi` with a variable assignment.

---

## Step 3 — Walkthrough: Dispatch for `sin(pi/6)`

Reading the explanation of a dispatch table is one thing. Tracing through a
concrete call makes it concrete. Here is every step when the evaluator handles
`sin(pi/6)`:

The parser has already run. The AST for `sin(pi/6)` is:

```
FunctionCall('sin', [BinaryOp('/', Identifier('pi'), NumberNode(6))])
```

1. The evaluator's `evaluate` function matches the `FunctionCall` case and calls
   `evaluateBuiltin('sin', [BinaryOp(...)], env, line)`.

2. **User-defined function check:** `env.get('sin')` returns `undefined`. The
   user has not defined a function named `sin`. Execution continues.

3. **Constants check:** `'sin'` is not in `CONSTANTS`. Execution continues.

4. **Standard library lookup:** `STDLIB['sin']` returns the arrow function
   `([x], l) => Math.sin(toRad(x, l))`. `fn` is now that function object.

5. **Evaluate arguments:** `argNodes.map(arg => evaluate(arg, env))` evaluates
   the single argument node, `BinaryOp('/', Identifier('pi'), NumberNode(6))`.
   Evaluating `Identifier('pi')` hits the CONSTANTS check first:
   `CONSTANTS['pi']` → `Math.PI` ≈ 3.14159. Evaluating `NumberNode(6)` → `6`.
   The binary `/` operator divides: `Math.PI / 6` ≈ 0.5236 (this is π/6 in
   radians — 30 degrees).

6. **Call `fn`:** `fn([Math.PI / 6], line)` calls the arrow function.
   Inside: `toRad(Math.PI / 6, line)`. `degreeMode` is `false` (the user has
   not called `degrees()`), so `toRad` returns the value unchanged:
   `Math.PI / 6`. Then `Math.sin(Math.PI / 6)` → `0.5`.

7. `evaluateBuiltin` returns `0.5`. The REPL prints `0.5`.

The evaluator never saw `Math.sin`. It saw a `BuiltinFn` value retrieved from a
table by string key. The entire dispatch mechanism is six lines of code that
never change, regardless of how many functions are in `STDLIB`.

---

## Maths: Trig Functions and the Unit Circle

This lesson introduces `sin`, `cos`, `tan`, and their inverses. If you have not
worked with trig functions before, here is the foundation you need.

The *unit circle* is the circle of radius 1 centred at the origin of the
coordinate plane. For any angle θ (the Greek letter theta, the conventional name
for an angle) measured counterclockwise from the positive x-axis:

```
cos(θ) = the x-coordinate of the point on the unit circle at angle θ
sin(θ) = the y-coordinate of the point on the unit circle at angle θ
```

That is the definition — not a formula to memorise, but a geometric fact about a
circle. The values fall out of that definition:

| θ (degrees) | θ (radians) | cos(θ)       | sin(θ)       |
|-------------|-------------|--------------|--------------|
| 0           | 0           | 1            | 0            |
| 30          | π/6         | √3/2 ≈ 0.866 | 0.5          |
| 45          | π/4         | √2/2 ≈ 0.707 | √2/2 ≈ 0.707 |
| 60          | π/3         | 0.5          | √3/2 ≈ 0.866 |
| 90          | π/2         | 0            | 1            |
| 180         | π           | -1           | 0            |

**Why radians, not degrees by default.** Degrees are a historical unit — 360
was chosen because it is divisible by many small numbers. Radians are the
*natural* unit: one radian is the angle subtended by an arc of length equal to
the radius of the circle. The number π appears in mathematics not as an arbitrary
constant but because the circumference of a unit circle is 2π.

More practically: the derivative of `sin(x)` is `cos(x)` only when `x` is in
radians. In degrees, the derivative of `sin(x)` is `(π/180)·cos(x)`. Every
calculus formula — every physics formula derived from calculus — assumes radians.
Engineering and scientific computing use radians; degrees are a convenience for
human display. OpenMAT follows the same convention as MATLAB, NumPy, and every
other scientific computing language.

`Math.sin`, `Math.cos`, and `Math.tan` in JavaScript take radians. `toRad`
converts only when `degreeMode` is on.

---

## Step 4 — Write Tests

Create `src/stdlib.test.ts`:

```typescript
import { tokenize }    from './lexer';
import { parse }       from './parser';
import { evaluate }    from './evaluator';
import { Environment } from './environment';
import { setDegreeMode } from './stdlib';

function run(src: string, env = new Environment()) {
  return evaluate(parse(tokenize(src)), env);
}

afterEach(() => setDegreeMode(false));   // reset degree mode after each test

test('sin(pi/6) = 0.5', () => {
  expect(run('sin(pi/6)')).toBeCloseTo(0.5, 10);
});

test('cos(pi) = -1', () => {
  expect(run('cos(pi)')).toBeCloseTo(-1, 10);
});

test('log(exp(1)) = 1', () => {
  expect(run('log(exp(1))')).toBeCloseTo(1, 10);
});

test('sqrt(2)', () => {
  expect(run('sqrt(2)')).toBeCloseTo(1.41421356237, 10);
});

test('pi is accessible as an identifier', () => {
  expect(run('pi')).toBeCloseTo(Math.PI, 10);
});

test('mod(10, 3) = 1', () => {
  expect(run('mod(10, 3)')).toBe(1);
});

test('max and min', () => {
  expect(run('max(3, 7, 2)')).toBe(7);
  expect(run('min(3, 7, 2)')).toBe(2);
});

test('degree mode: sin(30) = 0.5', () => {
  setDegreeMode(true);
  expect(run('sin(30)')).toBeCloseTo(0.5, 10);
});

test('degree mode: cos(0) = 1 unchanged', () => {
  setDegreeMode(true);
  expect(run('cos(0)')).toBeCloseTo(1, 10);
});
```

Run the tests:

```
npx vitest run
```

`npx vitest run` — `npx` runs a locally installed package without a global
install. `vitest` is the test runner introduced in lesson 04. `run` (as opposed
to `vitest` with no subcommand, which starts a watcher) executes the test suite
once and exits. You have used this command before; it is repeated here as a
reminder that the full regression suite should always pass, not just the new
tests.

### What the tests verify

`afterEach(() => setDegreeMode(false))` resets degree mode after every test.
This is *test isolation*: each test starts from a clean state regardless of what
a previous test did. Without it, a test that calls `setDegreeMode(true)` would
contaminate all subsequent tests — `sin(pi/6)` would silently return the wrong
value because the input would be treated as 0.5236 degrees, not 0.5236 radians.
Module-level mutable state and test isolation are in direct tension; `afterEach`
is how you manage that tension.

`toBeCloseTo(value, numDigits)` is Vitest's matcher for floating-point
comparisons. Floating-point arithmetic is not exact — `Math.sin(Math.PI / 6)`
returns `0.49999999999999994`, not `0.5`, because `Math.PI` is a 64-bit
approximation of π. `toBeCloseTo(0.5, 10)` passes if the result is within
`0.5 * 10^-10` of `0.5`. For ordinary equality on integers (like `mod(10, 3)
= 1`), `toBe` is exact and correct.

---

## Step 5 — Add degrees/radians Mode Switching

**The problem:** Users who are more comfortable with degrees cannot currently
set that mode interactively. The `setDegreeMode` function exists but is only
callable from TypeScript test code, not from the REPL.

**The solution:** Add `degrees` and `radians` as callable functions in the
evaluator. They are not in `STDLIB` because they have side effects (they modify
`degreeMode`) and return nothing meaningful — a different contract from every
entry in `STDLIB`. They go in `evaluateBuiltin` just above the error throw:

```typescript
if (name === 'degrees') { setDegreeMode(true);  return 0; }
if (name === 'radians') { setDegreeMode(false); return 0; }
```

`setDegreeMode` is imported from `./stdlib` — you already import `STDLIB` and
`CONSTANTS` from there, so add it to the same import statement:

```typescript
import { STDLIB, CONSTANTS, setDegreeMode } from './stdlib';
```

### SAVE AND TRY

```
>> sin(pi/6)
0.5
>> cos(pi)
-1
>> log(exp(1))
1
>> degrees()
>> sin(30)
0.5
>> sin(90)
1
>> radians()
>> sin(pi/2)
1
```

---

## Connect the Pieces

```
src/stdlib.ts       STDLIB dispatch table — 20+ math functions as first-class values
                    CONSTANTS lookup — pi, e, inf, nan
                    degreeMode — module-level flag, read by every trig call
                    setDegreeMode / isDegreeMode — public API for state access

src/evaluator.ts    STDLIB[name](args, line) — generic dispatch, unchanged for new functions
                    CONSTANTS[name] — identifier resolution for pi, e
                    degrees() / radians() — mode switching via setDegreeMode

src/stdlib.test.ts  Integration tests using the full pipeline: tokenize → parse → evaluate
```

The evaluator is now closed for modification when adding new math functions.
`stdlib.ts` is open for extension — one new line in `STDLIB` is all that is
required. `evaluator.ts` does not change. The test file grows by two lines per
new function.

---

## What Breaks Without This

Keep the inline `switch` and add five more trig functions: `asin`, `acos`,
`atan`, `atan2`, `sinh`. Each requires a new `case`, a type check, an error
message, and a `degreeMode` check for the inverse functions. The switch is
already ~40 lines; five new functions add ~25 more.

At 40 functions, `evaluateBuiltin` is 200 lines of nearly identical blocks. A
bug in the type check of one function does not propagate to the others — each
check is written separately. A refactor of error message format requires touching
40 cases. A new developer reading the code cannot tell which functions validate
inputs the same way.

With the dispatch table, the question "how does this function check its inputs?"
has one answer: `num()` or `toRad()`, both in `stdlib.ts`, both easily read.
Changing the error format for type mismatches means editing one line. Adding
`sinh` means one new line in `STDLIB`. The dispatch logic — always six lines —
never reads differently six months from now.

The concrete error you will see if you add a function to the switch but not the
table (or vice versa): it is not a TypeScript compile error. TypeScript does not
know the switch should be the same set as some other structure. It is a runtime
error: `RuntimeError: Function 'sinh' is not defined`. It will only appear when
the user calls `sinh`. The dispatch table approach cannot have this class of
inconsistency — there is only one place to add a function.

---

## Real-World Connection

The pattern you built in this lesson — a `Record<string, Fn>` looked up at
runtime — appears throughout production JavaScript:

**Express.js** (the most widely used Node.js web framework) stores route
handlers in a structure directly analogous to `STDLIB`. `router._routes` maps
HTTP method + URL pattern to handler functions. When a request arrives, Express
looks up the matching handler and calls it. Adding a new route is one line:
`router.get('/users/:id', getUserHandler)`. The routing logic does not change.

**Redux** (React state management) uses a dispatch table called a *reducer* — a
function that maps action type strings to state transformation functions. The
pattern: `{ INCREMENT: (state) => state + 1, DECREMENT: (state) => state - 1 }`.
When an action arrives, the reducer looks up its type and calls the corresponding
function. Adding new behaviour is adding a new key.

**Plugin systems** in virtually every extensible application — VS Code extensions,
webpack loaders, Babel plugins — work by registering function values against
string keys. The host application looks up by key and calls the function. The
host never changes; only the table grows.

A map from string keys to function values, looked up at runtime, is one of the
most frequently used patterns in production JavaScript. You have now built and
understood it from first principles.

---

## Definition of Done

- [ ] `sin(pi/6)` → `0.5`
- [ ] `log(exp(1))` → `1`
- [ ] `degrees(); sin(30)` → `0.5`; `radians(); sin(pi/6)` → `0.5`
- [ ] All stdlib tests pass (`npx vitest run`)
- [ ] All regression tests from lessons 04–14 still pass
- [ ] `pi` works as both an identifier and a zero-argument function
- [ ] You can explain what a dispatch table is and why it scales better than a switch
- [ ] You can explain what first-class functions are, and point to where they appear in `STDLIB`
- [ ] You can state the open/closed principle in one sentence and name two places it appears in this codebase
- [ ] You can trace every step of the evaluation of `sin(pi/6)` from AST node to returned value
- [ ] You can explain why `degreeMode` is module-level state and when that would be wrong
- [ ] You can draw the unit circle and give sine and cosine for 0°, 30°, 45°, 60°, and 90°
- [ ] You can explain why `sin` takes radians by default
- [ ] `git add src/stdlib.ts src/evaluator.ts src/stdlib.test.ts` then `git commit -m "Add standard library: 20+ math functions via dispatch table, degree/radian mode toggle"`

---

*Next: Lesson 16 — Vectors. `v = [3, 4]` is stored as a vector and plotted as
an arrow on the canvas. The evaluator gains a non-scalar type, and `STDLIB` gains
`dot`, `cross`, and `norm` — each a new line in the table.*
