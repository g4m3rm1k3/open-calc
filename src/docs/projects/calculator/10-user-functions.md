# Lesson 10 — User Functions

## What You Will Build

`f(x) = x^2 + 1` defines a function. `f(3)` evaluates to `10`.
`g(f(2)) = 9` — function composition works. Defined functions appear in the
variable/function panel.

## What You Need to Know First

Lessons 01–09. Variables (lesson 08) introduced environments. Built-in functions
(lesson 09) introduced function call syntax. This lesson adds user-defined functions
stored in the environment.

---

## The Lesson

### The problem

Built-in functions are fixed. The user cannot define new computation. A graphing
calculator's power comes from defining `f(x)` and then graphing, integrating, and
finding roots of that function. That requires user-defined functions.

---

### Step 1 — Maths — functions as mathematical objects

**Maths — f(x) notation:**
In mathematics, `f(x) = x^2 + 1` defines a function named `f`. The `x` is a
parameter — a placeholder. When you evaluate `f(3)`, you substitute `x = 3`
everywhere in the body, getting `3^2 + 1 = 10`.

A function is a mapping from input values to output values. `f : ℝ → ℝ` says
`f` maps real numbers to real numbers. The domain is the set of valid inputs.
The range is the set of possible outputs. For `f(x) = sqrt(x)`, the domain is
`x ≥ 0` — square root is undefined for negative inputs.

This mathematical notion maps directly to a programming function: a named
computation that takes an argument and returns a value.

---

### Step 2 — The user function type

Add to `src/types.ts`:

```typescript
export interface UserFunction {
  parameterName: string
  bodyExpression: string
}
```

**SE lens — store the source, not the compiled form:**
`bodyExpression` stores the original string like `x^2 + 1`. When `f(3)` is
called, the string is parsed with `x` bound to `3`. Storing the source means:
the function can be displayed, edited, and re-evaluated with different environments.
Storing a compiled form would make display and editing much harder.

This is a general principle: prefer the most flexible representation. In this case,
source string > parsed AST > compiled bytecode, in terms of flexibility.

---

### Step 3 — Functions in the environment

Update `src/environment.ts`:

```typescript
import { UserFunction } from './types.js'

export interface Environment {
  readonly bindings:  Readonly<Record<string, number>>
  readonly functions: Readonly<Record<string, UserFunction>>
}

export function createEnvironment(): Environment {
  return {
    bindings:  { pi: Math.PI, e: Math.E },
    functions: {},
  }
}

export function lookupFunction(name: string, env: Environment): UserFunction | undefined {
  return env.functions[name]
}

export function bindFunction(name: string, fn: UserFunction, env: Environment): Environment {
  return {
    ...env,
    functions: { ...env.functions, [name]: fn },
  }
}
```

**CS lens — closures and scope:**
A user function captures the environment at the time it is called, not the time
it is defined. When `f(3)` is evaluated, the parser receives the current
environment extended with `{ x: 3 }`. If the user has stored `A = 5` and the
function body references `A`, it will find `A = 5` in the outer environment.

This is lexical scoping: a function body can access names from the scope it was
called in, plus its own parameters. The parameter shadows any outer variable with
the same name — `x` inside `f(x)` is always the argument, never an outer `x`.

---

### Step 4 — Parse function definitions

In `parseExpression`, detect the pattern `IDENTIFIER '(' IDENTIFIER ')' '=' expression`:

```typescript
// Detect: f(x) = x^2 + 1
if (
  tokens.length >= 4 &&
  tokens[0]?.type === 'IDENTIFIER' &&
  tokens[1]?.type === 'LPAREN' &&
  tokens[2]?.type === 'IDENTIFIER' &&
  tokens[3]?.type === 'RPAREN' &&
  tokens[4]?.type === 'EQUALS'
) {
  const functionName  = (tokens[0] as ExprIdentifier).name
  const paramName     = (tokens[2] as ExprIdentifier).name
  // Everything after '=' is the body
  const bodyStart     = source.indexOf('=') + 1
  const bodySource    = source.slice(bodyStart).trim()

  const newFunction: UserFunction = {
    parameterName:  paramName,
    bodyExpression: bodySource,
  }

  const newEnvironment = bindFunction(functionName, newFunction, environment)
  // Evaluate the body with x=0 to validate it parses
  const validationEnv  = bindVariable(paramName, 0, newEnvironment)
  const validationResult = parseExpression(bodySource, validationEnv, angleMode)

  if (isCalcError(validationResult.result)) {
    return { result: validationResult.result, environment }
  }

  return { result: 0, environment: newEnvironment } // returns 0, stores the function
}
```

---

### Step 5 — Evaluate user function calls

In `parsePrimary`, after checking built-ins, check user functions:

```typescript
const userFunction = lookupFunction(token.name, environment)
if (userFunction !== undefined) {
  const argumentEnv = bindVariable(userFunction.parameterName, argument, environment)
  const callResult  = parseExpression(
    userFunction.bodyExpression,
    argumentEnv,
    angleMode,
  )
  return callResult.result
}
```

**CS lens — substitution model:**
Evaluating `f(3)` where `f(x) = x^2 + 1` works by:
1. Binding `x = 3` in a new environment
2. Evaluating `x^2 + 1` in that environment
3. `x` resolves to `3` → `3^2 + 1 = 10`

This is the substitution model of evaluation: parameters are substituted with
their argument values. The function body is then evaluated as if those values
were written directly. It is the same model used in every functional programming
language.

---

### Step 6 — Tests

```typescript
describe('user functions', () => {
  test('define and call f(x) = x^2 + 1', () => {
    const { environment } = parseExpression('f(x) = x^2 + 1', createEnvironment(), AngleMode.DEGREES)
    const result = parseExpression('f(3)', environment, AngleMode.DEGREES)
    expect(result.result).toBe(10)
  })

  test('function composition: g(f(2)) = 9', () => {
    let env = createEnvironment()
    env = parseExpression('f(x) = x^2 + 1', env, AngleMode.DEGREES).environment
    env = parseExpression('g(x) = 2 * x - 1', env, AngleMode.DEGREES).environment
    const result = parseExpression('g(f(2))', env, AngleMode.DEGREES)
    expect(result.result).toBe(9) // f(2) = 5, g(5) = 9
  })

  test('parameter does not pollute outer scope', () => {
    let env = bindVariable('x', 99, createEnvironment())
    env = parseExpression('f(x) = x^2', env, AngleMode.DEGREES).environment
    parseExpression('f(3)', env, AngleMode.DEGREES)
    // outer x should still be 99
    const outerResult = parseExpression('x', env, AngleMode.DEGREES)
    expect(outerResult.result).toBe(99)
  })
})
```

---

## Connect the Pieces

`UserFunction` stored in the environment is the input to every lesson from here
forward that works with functions: graphing (lesson 12) calls
`parseExpression(f.bodyExpression, envWithX, angleMode)` for each x sample.
The bisection solver (lesson 18) calls it for each iteration. Integration (lesson 16)
calls it for each rectangle. The function definition done here is the foundation
everything else stands on.

---

## Definition of Done

- [ ] `f(x) = x^2 + 1` defines a function and displays `0` (successful definition)
- [ ] `f(3)` evaluates to `10`
- [ ] `g(f(2))` evaluates to `9` where `g(x) = 2*x - 1`
- [ ] Redefining `f` replaces the old definition
- [ ] The function panel shows all defined functions with their expressions
- [ ] `npm test` passes all new tests
