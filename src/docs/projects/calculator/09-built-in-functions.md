# Lesson 09 — Built-in Functions

## What You Will Build

`sin(30)` → `0.5`. `log(100)` → `2`. `sqrt(9)` → `3`. A DEG/RAD toggle is
visible and switches the angle mode for all trigonometric functions.

## What You Need to Know First

Lessons 01–08. Specifically: the expression parser with identifiers (lesson 07–08).
This lesson extends the parser to handle function call syntax: `name(argument)`.

---

## The Lesson

### The problem

A calculator without sin, cos, and log is not a scientific calculator. The TI-84
has over 100 built-in functions. We need a small, practical set and a design that
makes adding more functions cheap.

The key design decision: built-in functions should not require parser changes when
a new function is added. The parser recognises function call syntax. The function
itself is a value in a lookup table. Adding a new function is one line.

---

### Step 1 — Trigonometry and angle mode

**Maths — trigonometric functions:**
Trigonometric functions relate the angles of a right triangle to the ratios of
its sides. For an angle θ in a right triangle:

- `sin(θ)` = opposite / hypotenuse
- `cos(θ)` = adjacent / hypotenuse
- `tan(θ)` = opposite / adjacent

These ratios depend only on the angle, not the size of the triangle. That is why
they are functions: each angle maps to exactly one set of ratios.

There are two ways to measure angles: degrees and radians.
- Degrees: a full circle is 360°. A right angle is 90°.
- Radians: a full circle is 2π. A right angle is π/2.

Radians are the natural unit for mathematics — they connect angles to arc length
directly. Degrees are the natural unit for human communication. A calculator needs
to support both.

Conversion: `radians = degrees × π / 180`

**Why `sin(30°) = 0.5`:**
In a 30-60-90 triangle, the side opposite the 30° angle is exactly half the
hypotenuse. So `sin(30°) = 0.5` exactly. This is a geometric fact.

JavaScript's `Math.sin` expects radians: `Math.sin(Math.PI / 6) = 0.5`.
In degree mode, we convert before calling: `Math.sin(30 × π / 180) = Math.sin(π/6) = 0.5`.

---

### Step 2 — Angle mode in state

Add to `src/types.ts`:

```typescript
export const AngleMode = {
  DEGREES: 'DEGREES',
  RADIANS: 'RADIANS',
} as const

export type AngleMode = typeof AngleMode[keyof typeof AngleMode]
```

Add to `CalculatorState` in `src/calculator-state.ts`:

```typescript
angleMode: AngleMode
```

Default: `AngleMode.DEGREES`.

---

### Step 3 — The built-in function dispatch table

Create `src/built-in-functions.ts`:

```typescript
import { AngleMode } from './types.js'
import { CalcError, makeError } from './calc-error.js'

export type BuiltInFn = (argument: number, angleMode: AngleMode) => number | CalcError

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
    if (!isFinite(result)) return makeError('INVALID_EXPRESSION', 'tan is undefined at this angle')
    return result
  },

  log: (argument) => {
    if (argument <= 0) return makeError('INVALID_EXPRESSION', 'log requires x > 0')
    return Math.log10(argument)
  },

  ln: (argument) => {
    if (argument <= 0) return makeError('INVALID_EXPRESSION', 'ln requires x > 0')
    return Math.log(argument)
  },

  sqrt: (argument) => {
    if (argument < 0) return makeError('INVALID_EXPRESSION', 'sqrt requires x ≥ 0')
    return Math.sqrt(argument)
  },

  abs:   (argument) => Math.abs(argument),
  floor: (argument) => Math.floor(argument),
  ceil:  (argument) => Math.ceil(argument),
  round: (argument) => Math.round(argument),
  mod:   (argument, _, ...rest) => {
    // mod takes two arguments — handled specially in the parser
    return argument
  },
}
```

**CS lens — dispatch table:**
`BUILT_IN_FUNCTIONS` is a dispatch table: a mapping from function name to function
implementation. The parser looks up the name, gets the function, calls it.
Adding `cbrt` (cube root) requires one line:
```typescript
cbrt: (argument) => Math.cbrt(argument),
```
No parser changes. No new grammar rules. The parser already handles any name
followed by `(argument)`. The dispatch table is the extension point.

This is the open/closed principle: the system is open for extension (new functions)
and closed for modification (the parser does not change).

**SE lens — errors are values, not exceptions:**
`sqrt(-1)` returns `makeError(...)`. It does not throw. The caller checks the
return type. The type system enforces the check. If a new function is added that
can fail, its return type `number | CalcError` communicates that to every caller.
No documentation needed — the type says it.

---

### Step 4 — Extend the lexer and parser for function calls

The lexer already handles identifiers. The parser needs to distinguish between a
bare identifier (`A`) and a function call (`sin(30)`).

In `parsePrimary` in `src/expression-parser.ts`:

```typescript
if (token.type === 'IDENTIFIER') {
  consume()

  // Check for function call: IDENTIFIER '(' argument ')'
  if (peek().type === 'LPAREN') {
    consume() // consume '('

    const argument = parseAdditive()
    if (typeof argument === 'object') return argument

    if (peek().type !== 'RPAREN') {
      return makeError('INVALID_EXPRESSION', `Missing ')' after function argument`)
    }
    consume() // consume ')'

    const builtInFn = BUILT_IN_FUNCTIONS[token.name]
    if (builtInFn !== undefined) {
      return builtInFn(argument, angleMode)
    }

    // Check user-defined functions (lesson 10 will add this)
    return makeError('INVALID_EXPRESSION', `'${token.name}' is not defined`)
  }

  // Bare identifier: variable lookup
  const value = lookupVariable(token.name, environment)
  if (value === undefined) {
    return makeError('INVALID_EXPRESSION', `'${token.name}' is not defined`)
  }
  return value
}
```

Update `parseExpression` signature to accept `angleMode`:

```typescript
export function parseExpression(
  source:      string,
  environment: Environment,
  angleMode:   AngleMode,
): ParseWithEnv
```

---

### Step 5 — The DEG/RAD toggle

Add to `index.html`:

```html
<button class="angle-mode-toggle" id="angle-mode-toggle">DEG</button>
```

Wire in `src/main.ts`:

```typescript
const angleModeToggle = document.querySelector<HTMLButtonElement>('#angle-mode-toggle')
angleModeToggle?.addEventListener('click', () => {
  const newMode = calculatorState.angleMode === AngleMode.DEGREES
    ? AngleMode.RADIANS
    : AngleMode.DEGREES

  calculatorState = { ...calculatorState, angleMode: newMode }
  if (angleModeToggle !== null) {
    angleModeToggle.textContent = newMode === AngleMode.DEGREES ? 'DEG' : 'RAD'
  }
})
```

---

### Step 6 — Tests

```typescript
describe('built-in functions', () => {
  test('sin(30) in degrees = 0.5', () => {
    const result = parseExpression('sin(30)', createEnvironment(), AngleMode.DEGREES)
    expect(typeof result.result).toBe('number')
    expect(Math.abs((result.result as number) - 0.5)).toBeLessThan(1e-10)
  })

  test('log(100) = 2', () => {
    const result = parseExpression('log(100)', createEnvironment(), AngleMode.DEGREES)
    expect(result.result).toBe(2)
  })

  test('sqrt(9) = 3', () => {
    const result = parseExpression('sqrt(9)', createEnvironment(), AngleMode.DEGREES)
    expect(result.result).toBe(3)
  })

  test('sqrt(-1) returns error', () => {
    const result = parseExpression('sqrt(-1)', createEnvironment(), AngleMode.DEGREES)
    expect(isCalcError(result.result)).toBe(true)
  })
})
```

---

## Connect the Pieces

The dispatch table in `BUILT_IN_FUNCTIONS` is also where the graphing engine
(lesson 12) will look up functions defined by the user. User-defined functions
(lesson 10) will be stored in the environment, checked after built-ins are not
found. The parser already handles the lookup order correctly.

---

## What Breaks Without This

Without a dispatch table, each new function requires a new `if` statement in the
parser. After ten functions, the parser is littered with special cases. After
twenty, it is unmaintainable. The parser knows the names of all functions instead
of having a clean separation: the parser handles syntax, the table handles semantics.

---

## Definition of Done

- [ ] `sin(30)` in degree mode → approximately `0.5`
- [ ] `cos(0)` → `1`
- [ ] `log(100)` → `2`
- [ ] `sqrt(9)` → `3`
- [ ] `sqrt(-1)` → error message
- [ ] `abs(-7)` → `7`
- [ ] DEG/RAD toggle is visible and changes angle mode
- [ ] Adding a new built-in function requires only one line in the dispatch table
- [ ] `npm test` passes all new tests
