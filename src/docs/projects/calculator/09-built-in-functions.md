# Calculator — Lesson 09 — Built-in Functions

## What You Will Build

`sin(30)` in degree mode → `0.5`. `cos(0)` → `1`. `log(100)` → `2`. `sqrt(9)` → `3`.
`sqrt(-1)` → a clear error message, not `NaN`. A DEG/RAD toggle button switches the
angle mode. Adding a new built-in function (say, `cbrt` for cube root) requires
exactly one line in one file.

## What You Need to Know First

Lessons 01–08. The expression parser (lesson 07) handles the structure of function
call syntax. The environment (lesson 08) introduced the symbol table. The identifier
handling added in lesson 08 already makes the parser read `sin` as an `IDENTIFIER`
token — this lesson makes the parser *do something useful* when that identifier is
followed by a parenthesised argument.

---

## The Problem

A calculator without `sin`, `cos`, and `log` is a four-function calculator, not a
scientific one. The design question is not which functions to add but *how to add
them without modifying the parser*.

A naive approach: add `if (name === 'sin') { ... } else if (name === 'cos') { ... }`
inside the parser. Each new function requires editing the parser. The parser knows
the *semantics* of trigonometry — it should not. The parser should handle syntax
(name followed by parentheses) and delegate semantics entirely.

The solution: the parser recognises `name(argument)` generically. When it encounters
this pattern, it looks the name up in a **dispatch table** — an object mapping
function names to their implementations. Adding a new function means adding one
entry to the table. The parser never changes.

---

## Step 1 — Trigonometry and Angle Mode

### Maths — trigonometric functions

Trigonometric functions relate the angles of a right triangle to the ratios of
its sides. Given a right triangle with acute angle θ:

```
sin(θ) = opposite side / hypotenuse
cos(θ) = adjacent side / hypotenuse
tan(θ) = opposite side / adjacent side
```

These ratios depend only on the angle, not the triangle's size. The function
`sin(θ)` is defined for every angle and produces a value between -1 and 1.
`cos(θ)` also produces values between -1 and 1. `tan(θ)` is unbounded and
undefined at 90° (and at every 180° from there).

The key exact values to know:

| angle | sin    | cos    | tan     |
|-------|--------|--------|---------|
| 0°    | 0      | 1      | 0       |
| 30°   | 0.5    | √3/2   | 1/√3    |
| 45°   | √2/2   | √2/2   | 1       |
| 60°   | √3/2   | 0.5    | √3      |
| 90°   | 1      | 0      | undefined |

`sin(30°) = 0.5` exactly — not an approximation — because in a 30-60-90 triangle
the side opposite 30° is exactly half the hypotenuse. This geometric fact predates
calculators by millennia.

### Two ways to measure angles

There are two systems for measuring angles:
- **Degrees:** a full circle is 360°. A right angle is 90°. Human-intuitive.
- **Radians:** a full circle is 2π ≈ 6.283. A right angle is π/2 ≈ 1.571.

Radians are the natural unit for mathematics. An angle of `r` radians subtends an
arc of length `r` on a unit circle — the angle directly measures arc length. Calculus
formulas for derivatives of trigonometric functions are simple in radians
(`d/dx sin(x) = cos(x)`) and include a conversion factor in degrees
(`d/dx sin(x°) = (π/180) cos(x°)`). Radians are how the universe is actually wired.

JavaScript's `Math.sin` and `Math.cos` expect **radians**. To use degrees, convert:

```
radians = degrees × π / 180
```

`sin(30°) = Math.sin(30 × π / 180) = Math.sin(π/6) = 0.5` ✓

A scientific calculator must support both — degrees for human use, radians for
mathematically aware use.

### Angle mode in state

Add to `src/types.ts`:

```typescript
export const AngleMode = {
  DEGREES: 'DEGREES',
  RADIANS: 'RADIANS',
} as const

export type AngleMode = typeof AngleMode[keyof typeof AngleMode]
```

**What `src/types.ts` is (recap):**
`types.ts` is the central type registry — the single file for shared types used
across multiple modules. `AngleMode` is added here because it is used by
`built-in-functions.ts` (for the implementations), `expression-parser.ts` (receives
it as a parameter), `calculator-state.ts` (stores it), and `main.ts` (reads it for
the toggle button).

**`as const` and the derived type (recap from lesson 02):**
`as const` freezes the object — both its structure and its string values become
literal types. `typeof AngleMode[keyof typeof AngleMode]` extracts the union of all
values: `'DEGREES' | 'RADIANS'`. The type is derived from the object, so they can
never disagree.

Add `angleMode: AngleMode` to `CalculatorState` in `src/calculator-state.ts`:

```typescript
import { AngleMode } from './types.js'

export interface CalculatorState {
  // ... existing fields ...
  angleMode: AngleMode
}

export function createInitialState(): CalculatorState {
  return {
    // ... existing fields ...
    angleMode: AngleMode.DEGREES,
  }
}
```

**Import explanation:**
`import { AngleMode } from './types.js'` — `types.ts` is the central type registry
(lesson 02). We import `AngleMode` — the type and the object of named values — because
`CalculatorState.angleMode` must be typed as `AngleMode`, and `createInitialState`
uses `AngleMode.DEGREES` as the default. Both the type and the value come from the
same module.

---

## Step 2 — The Built-in Function Dispatch Table

### The problem

If the parser contains `if (name === 'sin') { ... }`, adding `cbrt` requires editing
the parser. If the parser delegates to a lookup table, adding `cbrt` is one line in
the table. The table is the correct extension point.

### The code

Create `src/built-in-functions.ts`:

```typescript
import { AngleMode }            from './types.js'
import { CalcError, makeError } from './calc-error.js'
```

**Import explanation:**
`import { AngleMode } from './types.js'` — `types.ts` is the central type registry
(lesson 02). We import `AngleMode` — the type — because the `BuiltInFn` function
type includes `angleMode: AngleMode` as a parameter. Every built-in function receives
the current angle mode so trig functions can convert if needed.

`import { CalcError, makeError } from './calc-error.js'` — `calc-error.ts` is the
module responsible for the error type (lesson 04). We import `CalcError` (the type,
for the return type of `BuiltInFn`) and `makeError` (the constructor, for creating
domain errors like "log requires x > 0"). Functions that can fail return
`number | CalcError` — the same union as the parser.

```typescript
export type BuiltInFn =
  (argument: number, angleMode: AngleMode) => number | CalcError

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export const BUILT_IN_FUNCTIONS: Readonly<Record<string, BuiltInFn>> = {
  sin: (argument, angleMode) =>
    Math.sin(angleMode === AngleMode.DEGREES ? toRadians(argument) : argument),

  cos: (argument, angleMode) =>
    Math.cos(angleMode === AngleMode.DEGREES ? toRadians(argument) : argument),

  tan: (argument, angleMode) => {
    const radians = angleMode === AngleMode.DEGREES ? toRadians(argument) : argument
    const result  = Math.tan(radians)
    if (!isFinite(result)) {
      return makeError('INVALID_EXPRESSION', 'tan is undefined at this angle')
    }
    return result
  },

  log: (argument) => {
    if (argument <= 0) {
      return makeError('INVALID_EXPRESSION', 'log requires x > 0')
    }
    return Math.log10(argument)
  },

  ln: (argument) => {
    if (argument <= 0) {
      return makeError('INVALID_EXPRESSION', 'ln requires x > 0')
    }
    return Math.log(argument)
  },

  sqrt: (argument) => {
    if (argument < 0) {
      return makeError('INVALID_EXPRESSION', 'sqrt requires x ≥ 0')
    }
    return Math.sqrt(argument)
  },

  abs:   (argument) => Math.abs(argument),
  floor: (argument) => Math.floor(argument),
  ceil:  (argument) => Math.ceil(argument),
  round: (argument) => Math.round(argument),
}
```

**What `src/built-in-functions.ts` is:**
`built-in-functions.ts` owns the implementations of all mathematical functions.
It has no knowledge of the parser, the DOM, or the state. Adding a new built-in
function changes only this file. Removing one changes only this file. The parser
never needs to know which functions exist.

**`BuiltInFn` type — functions as values — first appearance:**
`type BuiltInFn = (argument: number, angleMode: AngleMode) => number | CalcError`
is a **function type annotation**. It describes the *shape* of a function: what
arguments it takes and what it returns. Every entry in `BUILT_IN_FUNCTIONS` must
match this type — TypeScript checks each implementation.

Functions in JavaScript are **first-class values**: they can be stored in variables,
placed in objects, passed as arguments, and returned from other functions. The
dispatch table stores function values in an object. Looking up `'sin'` returns the
function stored under that key. Calling `BUILT_IN_FUNCTIONS['sin'](30, AngleMode.DEGREES)`
calls that function with the given arguments.

**Ternary operator — first appearance:**
`angleMode === AngleMode.DEGREES ? toRadians(argument) : argument` is the **ternary
operator**. It is a compact if-else *expression* (not a statement):

```
condition ? valueIfTrue : valueIfFalse
```

`angleMode === AngleMode.DEGREES ? toRadians(argument) : argument` reads: "if the
mode is degrees, convert to radians; otherwise use the argument directly." The
ternary is appropriate here because we are choosing between two values — not
executing side effects.

**`Math.log` vs `Math.log10` — first appearance:**
`Math.log(x)` is the **natural logarithm** (base e): `Math.log(Math.E)` = `1`.
`Math.log10(x)` is the **base-10 logarithm**: `Math.log10(100)` = `2`.
A calculator's `log` button conventionally means base-10. `ln` means base-e (natural).
Both functions expect `x > 0`.

**`Math.floor`, `Math.ceil`, `Math.round` — first appearance:**
`Math.floor(3.7)` = `3` — rounds toward negative infinity (always rounds down).
`Math.ceil(3.2)` = `4` — rounds toward positive infinity (always rounds up).
`Math.round(3.5)` = `4`, `Math.round(3.4)` = `3` — rounds to nearest integer.
`Math.floor(-3.2)` = `-4` (not `-3`): "toward negative infinity" means more negative
for negative numbers.

**`isFinite(value)` — first appearance:**
`isFinite(value)` returns `false` for `Infinity`, `-Infinity`, and `NaN`. It returns
`true` for all finite numbers. Used for `tan`: `tan(90°)` is mathematically undefined
(the tangent of a right angle is infinite). Due to floating point, `Math.tan(Math.PI / 2)`
is approximately `16331239353195370` (a very large number) rather than exactly `Infinity`.
Checking `!isFinite(result)` catches both the infinite case and extremely large values
that indicate the function is near an asymptote.

**`Readonly<Record<string, BuiltInFn>>`:**
`Readonly` prevents any code from adding, replacing, or deleting entries in the
dispatch table at runtime. An accidental
`BUILT_IN_FUNCTIONS['sin'] = somethingElse` is a TypeScript compile error. The table
is defined once at module load time and never changes.

**CS lens — dispatch table:**
A **dispatch table** is a data structure that maps action names (strings) to
implementations (functions). Looking up `'sin'` in the object is a single O(1)
hash map lookup — the same time regardless of how many entries the table has. A
chain of 20 `if/else if` blocks would scan up to 20 conditions on every function
call.

The dispatch table is also its own documentation: to see which functions exist,
read the table. To add a function, add one line. To remove one, delete one line.
The extension point is explicit rather than hidden inside conditional logic.

**SE lens — the open/closed principle:**
The system is **open for extension** (new functions can be added to the table)
and **closed for modification** (the parser does not need to change). Adding cube
root:

```typescript
cbrt: (argument) => Math.cbrt(argument),
```

One line. Zero parser changes. Zero test changes for existing functions. Zero
changes to `main.ts`, `calculator-state.ts`, or anything else. This is the
open/closed principle made concrete.

### Walkthrough — `sin(30)` in degrees

Tokens: `[ IDENTIFIER('sin'), LPAREN, NUMBER(30), RPAREN, EOF ]`

`parsePrimary` sees `IDENTIFIER('sin')`. Peek is `LPAREN` → function call detected.
Consume `sin`. Consume `(`. Evaluate argument: `parsePrimary` sees `NUMBER(30)` →
`argumentValue = 30`. Consume `)`.

Look up `'sin'` in `BUILT_IN_FUNCTIONS` → found: the sin function.
Call `sin(30, AngleMode.DEGREES)`.

Inside:
`angleMode === AngleMode.DEGREES` → `true` → `toRadians(30)`.
`toRadians(30) = 30 × (3.14159... / 180) = 30 × 0.01745... = 0.5235...` (π/6).
`Math.sin(0.5235...)` = `0.5`.

`formatResult(0.5, 10)` → `'0.5'`. Display shows `0.5`. ✓

---

## Step 3 — Extend the Parser for Function Calls

### The problem

The parser already handles `IDENTIFIER` tokens for variable lookup. Now it must
distinguish between a bare identifier (`A`, for variable lookup) and a function
call (`sin(30)`, for dispatch table lookup). The distinction is what follows the
identifier: if the next token is `LPAREN`, it is a function call.

### The code

Update `parsePrimary` in `src/expression-parser.ts`. Change the `IDENTIFIER` case:

```typescript
import { BUILT_IN_FUNCTIONS }  from './built-in-functions.js'
import { AngleMode }           from './types.js'
```

**Import explanation:**
`import { BUILT_IN_FUNCTIONS } from './built-in-functions.js'` — `built-in-functions.ts`
is the module that owns function implementations (this lesson). We import
`BUILT_IN_FUNCTIONS` — the dispatch table — because `parsePrimary` looks up function
names in it. The import makes `parsePrimary` a consumer of the dispatch table, not
a container of implementations.

`import { AngleMode } from './types.js'` — `types.ts` is the central type registry
(lesson 02). We import `AngleMode` because `parseExpression` must receive the angle
mode and pass it to built-in function calls. The `AngleMode` type appears in the
function signature.

Update the function signature to accept `angleMode`:

```typescript
export function parseExpression(
  source:      string,
  environment: Environment,
  angleMode:   AngleMode,
): ParseWithEnv
```

Update `parsePrimary` — the `IDENTIFIER` case:

```typescript
    if (currentToken.type === 'IDENTIFIER') {
      consume()

      // Function call: IDENTIFIER '(' argument ')'
      if (peek().type === 'LPAREN') {
        consume()  // consume '('

        const argumentValue = parseAdditive()
        if (isCalcError(argumentValue)) return argumentValue

        if (peek().type !== 'RPAREN') {
          return makeError(
            'INVALID_EXPRESSION',
            `Missing ')' after argument to '${currentToken.name}'`,
          )
        }
        consume()  // consume ')'

        const builtInFunction = BUILT_IN_FUNCTIONS[currentToken.name]
        if (builtInFunction !== undefined) {
          const functionResult = builtInFunction(argumentValue, angleMode)
          if (isCalcError(functionResult)) return functionResult
          return functionResult
        }

        return makeError(
          'INVALID_EXPRESSION',
          `'${currentToken.name}' is not a function`,
        )
      }

      // Bare identifier: variable lookup
      const variableValue = lookupVariable(currentToken.name, environment)
      if (variableValue === undefined) {
        return makeError(
          'INVALID_EXPRESSION',
          `'${currentToken.name}' is not defined`,
        )
      }
      return variableValue
    }
```

**Lookup order:**
The parser checks the dispatch table first: `BUILT_IN_FUNCTIONS[name]`. If not
found there, the error message says "is not a function." Built-in functions cannot
be overridden by the user. If the user defines `sin(x) = x + 1`, calling `sin(30)`
still uses the built-in `sin`. This is intentional: the graphing and solver subsystems
(lessons 12–22) depend on built-ins producing correct mathematical results.

### Walkthrough — choosing between variable lookup and function call

**`A` (bare identifier):**
`parsePrimary` sees `IDENTIFIER('A')`. Consume. Peek is `PLUS` — not `LPAREN`.
Takes the variable lookup path: `lookupVariable('A', environment)`.

**`sin(30)` (function call):**
`parsePrimary` sees `IDENTIFIER('sin')`. Consume. Peek is `LPAREN`.
Takes the function call path: consumes `(`, evaluates argument, checks for `)`,
looks up in `BUILT_IN_FUNCTIONS`.

The single check `peek().type === 'LPAREN'` separates the two cases. This is the
standard approach in every real expression parser.

---

## Step 4 — The DEG/RAD Toggle

Add to `index.html`:

```html
<button class="angle-mode-toggle" id="angle-mode-toggle">DEG</button>
```

Wire in `src/main.ts`:

```typescript
import { AngleMode } from './types.js'
```

**Import explanation:**
`import { AngleMode } from './types.js'` — `types.ts` is the central type registry
(lesson 02). We import `AngleMode` — the object of named values — because the click
handler uses `AngleMode.DEGREES` and `AngleMode.RADIANS` to toggle the mode. Without
this import, these identifiers are undefined.

```typescript
const angleModeToggleButton =
  document.querySelector<HTMLButtonElement>('#angle-mode-toggle')

angleModeToggleButton?.addEventListener('click', () => {
  const newMode =
    calculatorState.angleMode === AngleMode.DEGREES
      ? AngleMode.RADIANS
      : AngleMode.DEGREES

  calculatorState = { ...calculatorState, angleMode: newMode }

  if (angleModeToggleButton !== null) {
    angleModeToggleButton.textContent =
      newMode === AngleMode.DEGREES ? 'DEG' : 'RAD'
  }
})
```

Also update `applyEquals` in `src/input-reducer.ts` to pass `state.angleMode` to
`parseExpression`:

```typescript
const { result, environment: newEnvironment } =
  parseExpression(state.displayValue, state.environment, state.angleMode)
```

Open the browser: `sin(30) =` in DEG mode → `0.5`. Click the toggle (now shows
`RAD`). `sin(30) =` → `0.9880316...` (the sine of 30 radians, not 30 degrees).

---

## Step 5 — Tests

Create `src/built-in-functions.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { parseExpression }        from './expression-parser.js'
import { createEnvironment }      from './environment.js'
import { AngleMode }              from './types.js'
import { isCalcError }            from './calc-error.js'
```

**Import explanation:**
`import { parseExpression } from './expression-parser.js'` — `expression-parser.ts`
is the evaluation engine (lesson 07, extended here). We import `parseExpression`
because testing built-in functions requires evaluating full expressions — we test
the entire pipeline, not the dispatch table in isolation.

`import { createEnvironment } from './environment.js'` — `environment.ts` owns the
symbol table (lesson 08). We import `createEnvironment` to create a fresh environment
for each test. Tests should not share state — each test starts with an independent
environment.

`import { AngleMode } from './types.js'` — `types.ts` is the central type registry
(lesson 02). We import `AngleMode` because `parseExpression` requires an angle mode
argument. Tests must specify whether they use degrees or radians.

`import { isCalcError } from './calc-error.js'` — `calc-error.ts` owns the error
type (lesson 04). We import `isCalcError` for tests that verify error cases —
`sqrt(-1)` must return a `CalcError`, not a number.

```typescript
describe('built-in functions', () => {
  const env = createEnvironment()

  test('sin(30) in degrees ≈ 0.5', () => {
    const { result } = parseExpression('sin(30)', env, AngleMode.DEGREES)
    expect(typeof result).toBe('number')
    expect(Math.abs((result as number) - 0.5)).toBeLessThan(1e-10)
  })

  test('cos(0) = 1', () => {
    const { result } = parseExpression('cos(0)', env, AngleMode.DEGREES)
    expect(result).toBe(1)
  })

  test('log(100) = 2', () => {
    const { result } = parseExpression('log(100)', env, AngleMode.DEGREES)
    expect(result).toBe(2)
  })

  test('sqrt(9) = 3', () => {
    const { result } = parseExpression('sqrt(9)', env, AngleMode.DEGREES)
    expect(result).toBe(3)
  })

  test('sqrt(-1) → CalcError', () => {
    const { result } = parseExpression('sqrt(-1)', env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(true)
  })

  test('abs(-7) = 7', () => {
    const { result } = parseExpression('abs(-7)', env, AngleMode.DEGREES)
    expect(result).toBe(7)
  })

  test('sin in radians: sin(pi/6) ≈ 0.5', () => {
    const { result } = parseExpression('sin(pi/6)', env, AngleMode.RADIANS)
    expect(typeof result).toBe('number')
    expect(Math.abs((result as number) - 0.5)).toBeLessThan(1e-10)
  })

  test('unknown function name → CalcError', () => {
    const { result } = parseExpression('foo(3)', env, AngleMode.DEGREES)
    expect(isCalcError(result)).toBe(true)
  })
})
```

**Why `sin(30)` uses `Math.abs(result - 0.5) < 1e-10` instead of `toBe(0.5)`:**
`Math.sin(Math.PI / 6)` may produce `0.4999999999999999` or `0.5000000000000001`
depending on the IEEE 754 precision available for `Math.PI / 6`. The epsilon
comparison from lesson 05 applies here: test that the result is *close enough to*
the expected value, not *exactly equal to* it.

Run `npm test`. All tests pass.

---

## Debugging: When Built-in Functions Behave Wrongly

**Symptom: `sin(30)` in DEG mode returns the radian value (a number near 0.988...
instead of 0.5)**

The angle mode is not being passed to `parseExpression` or is being passed
incorrectly. Check `applyEquals` in `input-reducer.ts`: the call must be
`parseExpression(state.displayValue, state.environment, state.angleMode)`. If
`state.angleMode` is missing as the third argument, the parser's closure over
`angleMode` will either error (if the parameter is required) or use a default.

**Symptom: `log(0)` or `sqrt(-1)` shows `NaN` instead of an error message**

The domain check is missing from the implementation. Check `built-in-functions.ts`:
`log` must check `argument <= 0`, and `sqrt` must check `argument < 0`. Without the
check, `Math.log(0)` returns `-Infinity` and `Math.sqrt(-1)` returns `NaN`. Both
are valid JavaScript values — they propagate through arithmetic without error. Only
the explicit domain check produces a user-visible error message.

Add a temporary log to verify:
```typescript
log: (argument) => {
  console.log('log called with:', argument)
  if (argument <= 0) { ... }
  return Math.log10(argument)
},
```

**Symptom: `cbrt(8)` says `'cbrt' is not a function` after adding it to the table**

The entry was added but the file was not saved, or the dev server cache is stale.
Confirm the entry appears in `BUILT_IN_FUNCTIONS` in `built-in-functions.ts` and
that `cbrt` is spelled identically in both the table key and the test input.

**Symptom: DEG/RAD toggle button text does not update after clicking**

The `angleModeToggleButton.textContent = ...` line is inside the null check but
the selector is not finding the element. Add a temporary log:
```typescript
console.log('toggle button:', angleModeToggleButton)
```
If it logs `null`, the selector `'#angle-mode-toggle'` does not match the HTML.
Check the `id` attribute in `index.html`.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The `BUILT_IN_FUNCTIONS` dispatch table is the lookup for every built-in function
call in the system. Lesson 10 (user functions) adds a second lookup: after checking
built-ins and not finding a match, the parser checks user-defined functions stored
in the environment. If neither lookup succeeds, the error `'name' is not a function`
is returned.

The `angleMode` parameter added to `parseExpression` travels through every subsequent
evaluation: `evaluateAt` (lesson 12), the numerical integrator (lesson 16), and all
the solvers (lessons 18–22). Every function evaluation in the project uses the
current angle mode. This means a user who switches to radians gets radians consistently
in graphing, tables, and solvers — not just in direct function evaluation.

---

## What Breaks Without This

**Without the dispatch table — naive `if/else` approach:**
Each new function requires editing the parser. After 10 functions, the parser has
10 conditional branches, each containing semantic logic that belongs in its own module.
The parser's job is to handle *syntax* — it should not know that `sqrt(-1)` is
invalid, or that `log` is base-10. With the dispatch table, the parser handles
syntax and delegates semantics entirely. Any semantic change (adding a function,
changing a domain rule) requires changing only `built-in-functions.ts`.

**Without domain checks:**
`sqrt(-1)` without the guard: `Math.sqrt(-1)` = `NaN`. `NaN + 5` = `NaN`.
`NaN` propagates through all subsequent arithmetic silently. The display shows `NaN`,
which means nothing to the user. With the domain check, `sqrt(-1)` shows:
`Error: sqrt requires x ≥ 0` — immediately actionable.

**`log(0)` without the guard:** `Math.log10(0)` = `-Infinity`. Arithmetic with
`-Infinity` produces `NaN`. Same silent propagation. The guard shows:
`Error: log requires x > 0`.

**Without `isFinite` for `tan`:** `tan(90)` in degrees: `Math.PI / 2` is not
exactly representable in IEEE 754. `Math.tan(Math.PI / 2)` = `16331239353195370` —
a massive but finite number. The display would show this number. With `!isFinite`,
the check catches it: `Error: tan is undefined at this angle`.

---

## Definition of Done

- [ ] `sin(30)` in DEG mode → approximately `0.5`
- [ ] `cos(0)` → `1`
- [ ] `log(100)` → `2`
- [ ] `sqrt(9)` → `3`
- [ ] `sqrt(-1)` → error message, not `NaN`
- [ ] `abs(-7)` → `7`
- [ ] DEG/RAD toggle is visible; clicking it changes the label and affects subsequent calculations
- [ ] `sin(30)` in RAD mode gives a different result than in DEG mode
- [ ] Adding `cbrt: (a) => Math.cbrt(a)` to `BUILT_IN_FUNCTIONS` makes `cbrt(8)` work
      with zero other changes
- [ ] `npm test` passes all tests in `built-in-functions.test.ts`
- [ ] You can explain what a dispatch table is and why it is O(1) lookup
- [ ] You can explain the open/closed principle in terms of this dispatch table
- [ ] You can explain what a function type (`BuiltInFn`) is and why it is used
- [ ] You can explain the ternary operator
- [ ] You can explain `isFinite` and when it returns `false`
- [ ] You can explain why `sin(30)` needs degree-to-radian conversion before
      calling `Math.sin`
- [ ] You can explain why the parser checks built-ins before checking user functions
      (lesson 10 preview) and what happens if a user tries to redefine `sin`
- [ ] You can explain why `sqrt(-1)` shows an error but `f(x) = 1/x` (with `x = 0`)
      does not error at definition time
- [ ] You can explain why `Math.abs(result - 0.5) < 1e-10` is used in the test
      instead of `expect(result).toBe(0.5)`
- [ ] Run:
      ```
      git add src/built-in-functions.ts src/built-in-functions.test.ts src/types.ts src/calculator-state.ts src/expression-parser.ts src/input-reducer.ts src/main.ts index.html
      git commit -m "Add built-in functions: dispatch table maps names to implementations, DEG/RAD toggle, domain validation returns errors not NaN"
      ```

---

*Next: Lesson 10 — User Functions. `f(x) = x^2 + 1` defines a function. `f(3)`
evaluates to `10`. Function composition works. The substitution model of function
evaluation: a new environment binds the parameter to the argument, the body is
evaluated in that environment, then the environment is discarded.*
