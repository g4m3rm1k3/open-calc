# Calculator — Lesson 10 — User Functions

## What You Will Build

`f(x) = x^2 + 1` defines a function. `f(3)` evaluates to `10`. `g(x) = 2*x - 1`
defines a second function. `g(f(2))` evaluates to `9` — function composition works.
Defined functions appear in a panel showing their name and body expression. An
invalid body like `f(x) = x^^2` produces an error at definition time, not silently
at call time.

## What You Need to Know First

Lessons 01–09. Specifically:

- **Lesson 08** introduced the environment — the `bindings` record that maps variable
  names to numbers. This lesson extends it with a second record for function definitions.
- **Lesson 09** introduced function call syntax (`sin(30)`) and the dispatch table.
  This lesson adds user-defined functions as a second lookup after the dispatch table.
- **Lesson 03** introduced spread syntax (`...state`). It is used here to create
  updated environments.
- **Lesson 04** introduced Vitest tests (`describe`, `test`, `expect`). Tests in this
  lesson follow the same pattern.

---

## The Problem

Built-in functions are fixed. The user cannot define new computation. A graphing
calculator's power comes from defining `f(x) = x^2` once and then graphing it,
integrating it, and finding its roots. That requires user-defined functions.

The mechanism is the same as lesson 08's symbol table, extended to store function
definitions alongside variable bindings. A function definition is metadata: it
records the parameter name and the body expression. When the function is called,
the body is re-evaluated with the parameter bound to the argument.

---

## Step 1 — Maths: Functions as Mathematical Objects

In mathematics, `f(x) = x^2 + 1` defines a function named `f`. The `x` is a
**parameter** — a placeholder name, not a variable with a current value. When you
evaluate `f(3)`, you **substitute** `x = 3` everywhere in the body:

```
f(3) = 3^2 + 1 = 9 + 1 = 10
```

A function is a **mapping from input values to output values**. The domain of
`f(x) = sqrt(x)` is `x ≥ 0` because square root is undefined for negative inputs.
The mapping exists for valid inputs and does not exist outside the domain.

This mathematical notion maps directly to a programming function: a named computation
that takes an argument and returns a value. The parameter becomes a local variable
bound in a temporary scope. The body is evaluated in that scope. When the function
returns, the scope is discarded.

---

## Step 2 — The UserFunction Type

### The problem

To evaluate `f(3)` later, the calculator must remember two things: what the parameter
is called (`x`) and what the body expression is (`x^2 + 1`). These two pieces of
data must travel together. They need a type.

### The code

Add to `src/types.ts`:

```typescript
export interface UserFunction {
  parameterName:  string
  bodyExpression: string
}
```

**`interface` recap (from lessons 02 and 08):**
An interface in TypeScript is a named type for an object shape. It says: any object
claiming to be a `UserFunction` must have a `parameterName` (a `string`) and a
`bodyExpression` (a `string`). TypeScript rejects any object missing either field.
Interfaces are erased at compile time and produce no runtime code.

### Walkthrough — what a concrete `UserFunction` looks like

When the user types `f(x) = x^2 + 1` and presses Enter, the parser creates:

```typescript
const newFunction: UserFunction = {
  parameterName:  'x',
  bodyExpression: 'x^2 + 1',
}
```

No computation has happened. No `3` has been substituted. The object contains only
the *description* of the function: "the parameter is called `x`, and the body is
the string `x^2 + 1`." The description is stored. Evaluation happens later, at
call time.

When `g(t) = 2*t - 1` is defined, the object is:

```typescript
{ parameterName: 't', bodyExpression: '2*t - 1' }
```

The parameter name is whatever the user typed — `t`, `x`, `n`, anything. It is
the name that will be bound when the function is called.

**CS lens — symbolic representation:**
`UserFunction` is a **symbolic representation** of a computation, not an executable
one. It stores the string `'x^2 + 1'` — a sequence of characters — not a JavaScript
function. The difference matters: a string can be displayed, inspected, serialised
to JSON, and re-evaluated in any environment. A JavaScript function can only be called.

This is the difference between **data** and **code**. Every compiler and interpreter
works with symbolic representations of programs before executing them. A tokeniser
turns source characters into tokens (data). A parser turns tokens into a syntax tree
(data). An interpreter evaluates the tree. At each stage, the representation is
data — not executable until the final step.

**SE lens — store source, not compiled form:**
`bodyExpression` is the original source string. The alternatives are: store a parsed
AST (the tree produced by the parser) or store a compiled JavaScript function.
Storing the source is the most flexible:

- The source can be **displayed**: `f(x) = x^2 + 1` is readable in the function panel.
- The source can be **re-evaluated with different environments**: function composition
  and nested scopes work because the body is re-parsed every call.
- The source is the **smallest representation**: a string, not a tree or a closure.

Storing a compiled JavaScript function would be fast at call time but impossible
to display, impossible to serialise, and would reintroduce `eval` indirectly.
Storing an AST would be faster to evaluate but would require the AST to be
serialisable (it is not, by default). For a calculator evaluated at human-input speed,
re-parsing the body on each call is imperceptible.

**What breaks without this:**
Without `UserFunction`, you would store function definitions as raw strings and parse
them into a structure only at call time. Every call site would need to know the
structure. With `UserFunction`, every caller knows exactly what it has: a parameter
name and a body. The shape is documented by the type.

---

## Step 3 — Functions in the Environment

### The problem

Variables and functions both live in the environment. They need separate namespaces:
a user might define both `A = 5` (a number) and `A(x) = x + 1` (a function) with
the same name. Keeping them in separate records prevents the collision.

### The code

Update `src/environment.ts`:

```typescript
import { UserFunction } from './types.js'
```

**Import explanation:**
`types.ts` is the central type registry introduced in lesson 02. It owns shared type
definitions used across multiple modules. We import `UserFunction` — the type just
defined — because `environment.ts` will store `UserFunction` objects and must know
their shape.

```typescript
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

export function lookupFunction(
  name:        string,
  environment: Environment,
): UserFunction | undefined {
  return environment.functions[name]
}

export function bindFunction(
  name:         string,
  userFunction: UserFunction,
  environment:  Environment,
): Environment {
  return {
    ...environment,
    functions: { ...environment.functions, [name]: userFunction },
  }
}
```

**`Readonly<Record<string, UserFunction>>` recap (from lesson 08):**
`Record<string, UserFunction>` describes an object where every key is a `string`
and every value is a `UserFunction`. `Readonly<...>` wraps it to prevent runtime
mutation. Any attempt to add or replace entries is a compile error. The functions
record, like the bindings record, is immutable — it can only be replaced, not
modified in place.

**Spread syntax recap (from lesson 03):**
`{ ...environment, functions: ... }` creates a new object with all of `environment`'s
properties, overriding `functions` with the new value. `environment` is unchanged.
The inner `{ ...environment.functions, [name]: userFunction }` does the same for
the functions record: copies all existing function bindings and adds the new one.

**Computed property key recap (from lesson 08):**
`[name]: userFunction` uses a computed property key. The square brackets mean: use
the value of the variable `name` as the key, not the literal string `"name"`. If
`name` is `'f'`, the result is `{ f: userFunction }`. If `name` is `'temperature'`,
the result is `{ temperature: userFunction }`.

### Walkthrough — before and after `bindFunction('f', newFunction, env)`

**Before:**
```
environment = {
  bindings:  { pi: 3.14159..., e: 2.71828... },
  functions: {},
}
```

**Call:** `bindFunction('f', { parameterName: 'x', bodyExpression: 'x^2 + 1' }, environment)`

**After (new object returned):**
```
newEnvironment = {
  bindings:  { pi: 3.14159..., e: 2.71828... },
  functions: {
    f: { parameterName: 'x', bodyExpression: 'x^2 + 1' }
  },
}
```

The original `environment.functions` was `{}`. A new functions object is created
containing the single new entry `f`. The new environment is returned. The original
environment's `functions` field is still `{}` — it was not modified.

**After defining `g(x) = 2*x - 1` using `newEnvironment`:**
```
newerEnvironment = {
  bindings:  { pi: 3.14159..., e: 2.71828... },
  functions: {
    f: { parameterName: 'x', bodyExpression: 'x^2 + 1' },
    g: { parameterName: 'x', bodyExpression: '2*x - 1' },
  },
}
```

Each `bindFunction` call creates a new functions object with all previous entries
plus the new one. The chain of environments is immutable.

**CS lens — parallel namespaces:**
`bindings` and `functions` are separate records for the same reason that a
programming language's global scope separates variable names from function names:
they are different kinds of things. A lookup for a variable (reading `A`) and a
lookup for a function (calling `A(3)`) are different operations and should resolve
differently. Having separate records makes the distinction explicit and enforced by
the type system.

**SE lens — extending without modifying:**
`environment.ts` now has four functions: `createEnvironment`, `lookupVariable`,
`bindVariable`, `lookupFunction`, and `bindFunction`. The first three from lesson 08
are unchanged. The last two are added. This is the open/closed principle in practice:
the module is open for extension (new functions added) and closed for modification
(existing functions unchanged). Every lesson that already calls `lookupVariable` or
`bindVariable` continues to work exactly as before.

---

## Step 4 — Parse Function Definitions

### The problem

The parser currently handles two patterns: variable assignment (`A = 42`) and bare
expressions (`3 + 4`). A function definition (`f(x) = x^2 + 1`) looks like neither.
It has a different token structure: `IDENTIFIER LPAREN IDENTIFIER RPAREN EQUALS ...`.
The parser must detect this pattern before falling through to the existing logic.

### The code

In `parseExpression` in `src/expression-parser.ts`, add the detection at the start,
before the assignment check:

```typescript
// Detect: f(x) = x^2 + 1
// Pattern: IDENTIFIER LPAREN IDENTIFIER RPAREN EQUALS
if (
  tokens.length >= 5          &&
  tokens[0]?.type === 'IDENTIFIER' &&
  tokens[1]?.type === 'LPAREN'     &&
  tokens[2]?.type === 'IDENTIFIER' &&
  tokens[3]?.type === 'RPAREN'     &&
  tokens[4]?.type === 'EQUALS'
) {
  const functionNameToken  = tokens[0] as { type: 'IDENTIFIER'; name: string }
  const parameterNameToken = tokens[2] as { type: 'IDENTIFIER'; name: string }
  const functionName       = functionNameToken.name
  const parameterName      = parameterNameToken.name

  // Body is everything after the '='
  const equalsPosition = source.indexOf('=')
  const bodyExpression = source.slice(equalsPosition + 1).trim()

  const newFunction: UserFunction = { parameterName, bodyExpression }

  // Validate the body: parse it with the parameter bound to 0
  const validationEnvironment = bindVariable(
    parameterName,
    0,
    bindFunction(functionName, newFunction, environment),
  )
  const validationParse = parseExpression(
    bodyExpression,
    validationEnvironment,
    angleMode,
  )

  if (isCalcError(validationParse.result)) {
    return { result: validationParse.result, environment }
  }

  const newEnvironment = bindFunction(functionName, newFunction, environment)
  return { result: 0, environment: newEnvironment }
}
```

**Type assertion `as { type: 'IDENTIFIER'; name: string }` — first appearance:**
`tokens[0] as { type: 'IDENTIFIER'; name: string }` is a **type assertion**. TypeScript
knows `tokens[0]` is an `ExprToken` — a union that includes many variants. The `?.type === 'IDENTIFIER'` check narrows it to the `IDENTIFIER` variant for the condition, but
TypeScript does not always carry that narrowing through to later statements where the
token is accessed. The `as` assertion tells the compiler: "I know this is specifically
the `IDENTIFIER` variant — trust me." We know this is safe because the check at the
top of the if block already verified it.

Type assertions should be used sparingly and only when you can verify the assertion is
correct. Here, the five-condition check makes it safe. An assertion on an unchecked
value would move a possible runtime error into a silent type error.

### Walkthrough — parsing `f(x) = x^2 + 1`

`source = 'f(x) = x^2 + 1'`. After tokenisation:

```
tokens = [
  IDENTIFIER('f'),   // tokens[0]
  LPAREN,            // tokens[1]
  IDENTIFIER('x'),   // tokens[2]
  RPAREN,            // tokens[3]
  EQUALS,            // tokens[4]
  IDENTIFIER('x'),
  POWER,
  NUMBER(2),
  PLUS,
  NUMBER(1),
  EOF
]
```

**Detection check:**
- `tokens.length >= 5` → `true` (11 tokens)
- `tokens[0].type === 'IDENTIFIER'` → `true` (it's `f`)
- `tokens[1].type === 'LPAREN'` → `true`
- `tokens[2].type === 'IDENTIFIER'` → `true` (it's `x`)
- `tokens[3].type === 'RPAREN'` → `true`
- `tokens[4].type === 'EQUALS'` → `true`

All five conditions pass. This is a function definition.

**Extract names:**
`functionName = 'f'`. `parameterName = 'x'`.

**Extract body:**
`source.indexOf('=')` returns `7` (the position of `=` in `'f(x) = x^2 + 1'`).
`source.slice(8).trim()` = `'x^2 + 1'`. This is `bodyExpression`.

**Create the function object:**
```
newFunction = { parameterName: 'x', bodyExpression: 'x^2 + 1' }
```

**Validate the body:**
Create `validationEnvironment` with `x = 0` and `f = newFunction` bound.
Call `parseExpression('x^2 + 1', validationEnvironment, angleMode)`.
Result: `0^2 + 1 = 1` — a number, not an error. Validation passes.

**Store the function:**
`newEnvironment = bindFunction('f', newFunction, environment)`.
Return `{ result: 0, environment: newEnvironment }`.

The display shows `0`. The function is stored. Next call to `f(3)` will evaluate
`x^2 + 1` with `x = 3`.

**Why `source.indexOf('=')` and not `tokens[4]`:**
The body string is needed as a raw string for storage. The token at index 4 is just
the `EQUALS` token — it does not tell us where in the original source the body starts.
`source.indexOf('=')` finds the exact character position in the original string,
and `slice` extracts everything after it. This is the one place where working with
the raw source string is more convenient than working with tokens.

**Why validate the body:**
If the user types `f(x) = x^^2` (double caret, invalid syntax), the tokeniser will
throw on the second `^`. Without validation, the `UserFunction` is stored with an
invalid body. The next time `f(3)` is called, `parseExpression('x^^2', ...)` throws
a cryptic error. The user does not know they made a mistake at definition time.

With validation, `parseExpression('x^^2', validationEnvironment, angleMode)` is
called immediately. The tokeniser throws. `isCalcError` is `true`. The function is
not stored. The display shows `Error: Unexpected character: '^'`. The mistake is
caught at the moment it was made.

**Why return `result: 0`:**
A function definition is not an arithmetic operation. It has no numeric result.
Returning `0` is a convention: it means "I processed a definition, not an expression."
The display shows `0` briefly. Future improvements could show the function name or
a success indicator instead.

**Security — why this is safe:**
This lesson accepts user-typed function bodies and evaluates them. The contract
requires an explanation of why this is safe.

The body is evaluated by `parseExpression` — our own recursive descent parser. It
can only evaluate arithmetic expressions using operators, numbers, and identifiers
from the environment. It cannot access the DOM, the network, local storage, or any
JavaScript API. There is no code execution pathway: `parseExpression` calls
`evaluateAt` calls `bindVariable` — only our own functions, with no access to
anything outside the calculator.

Contrast with `eval(bodyExpression)`: that would execute the string as arbitrary
JavaScript. Our parser executes a subset of mathematics. The restriction is enforced
by what the parser can tokenise: only digits, operators, identifiers, and parentheses.
Any other character is an error. `fetch`, `document`, `window` — none of these can
be entered into the calculator without producing a tokenisation error.

---

## Step 5 — Evaluate User Function Calls

### The problem

The parser already handles built-in function calls (`sin(30)`). User-defined
functions follow the same syntax. After checking built-ins and not finding a match,
the parser must check user-defined functions.

### The code

In `parsePrimary` in `src/expression-parser.ts`, after the built-in check:

```typescript
// After the built-in check returns without a match:
const userFunction = lookupFunction(currentToken.name, environment)
if (userFunction !== undefined) {
  const callEnvironment = bindVariable(
    userFunction.parameterName,
    argumentValue,
    environment,
  )
  const callResult = parseExpression(
    userFunction.bodyExpression,
    callEnvironment,
    angleMode,
  )
  return callResult.result
}

return makeError('INVALID_EXPRESSION', `'${currentToken.name}' is not defined`)
```

**Import explanation (for the test file and any new imports here):**
`lookupFunction` is imported from `./environment.js`. `environment.ts` is the module
responsible for all name-to-value lookups, introduced in lesson 08. We import
`lookupFunction` specifically — the function that searches the `functions` record —
because that is the only operation from `environment.ts` needed here in `parsePrimary`.

### Walkthrough — `g(f(2))` where `f(x) = x^2 + 1`, `g(x) = 2*x - 1`

Token stream for `g(f(2))`:
```
IDENTIFIER('g'), LPAREN, IDENTIFIER('f'), LPAREN, NUMBER(2), RPAREN, RPAREN, EOF
```

**Outer call — `g`:**
`parsePrimary` sees `IDENTIFIER('g')`, `peek()` is `LPAREN` → function call.
Consume `g`. Consume `(`. Call `parseAdditive()` to evaluate the argument.

**Inner argument — `f(2)`:**
`parseAdditive` → `parseMultiplicative` → `parsePower` → `parseUnary` → `parsePrimary`.
`parsePrimary` sees `IDENTIFIER('f')`, `peek()` is `LPAREN` → function call.
Consume `f`. Consume `(`. Argument is `NUMBER(2)` → `2`. Consume `)`.

Check built-ins: `BUILT_IN_FUNCTIONS['f']` is `undefined`.
Check user functions: `lookupFunction('f', environment)` → `{ parameterName: 'x', bodyExpression: 'x^2 + 1' }`.

`callEnvironment = bindVariable('x', 2, environment)`.
`parseExpression('x^2 + 1', callEnvironment, angleMode)` → `x` resolves to `2` → `2^2 + 1 = 5`.

`f(2)` returns `5`. This is the argument for `g`.

**Outer call — `g(5)`:**
Back in `parsePrimary` for `g`. `argumentValue = 5`. Consume `)`.
Check built-ins: not found.
Check user functions: `lookupFunction('g', environment)` → `{ parameterName: 'x', bodyExpression: '2*x - 1' }`.

`callEnvironment = bindVariable('x', 5, environment)`.
`parseExpression('2*x - 1', callEnvironment, angleMode)` → `x` resolves to `5` →
`2*5 - 1 = 10 - 1 = 9`.

`g(f(2))` returns `9`. ✓

**CS lens — the substitution model:**
Evaluating `f(3)` where `f(x) = x^2 + 1` works in three steps:
1. Create `callEnvironment` by binding `x = 3` in the current environment
2. Evaluate `x^2 + 1` in `callEnvironment`
3. `x` resolves to `3` → `9 + 1 = 10`

This is the **substitution model** of function evaluation: parameters are substituted
with argument values, and the body is evaluated as if those values had been written
directly. It is the foundational model of every functional programming language —
Haskell, ML, Erlang, Clojure — and it underlies how JavaScript itself evaluates
function calls. This project makes the mechanism explicit by building it from scratch
instead of relying on the host language.

**SE lens — lookup order matters:**
The parser checks built-ins first, then user functions. This order is deliberate:
built-ins cannot be overridden. If the user defines `sin(x) = x`, calling `sin(30)`
still calls the built-in `sin`. User functions extend the calculator without
replacing the built-in functions that the graphing and solver subsystems depend on.

---

## Step 6 — Tests

Recap from lesson 04: `npm test` runs Vitest, which finds files ending in `.test.ts`,
executes them, and reports which tests passed (✓) and which failed (✗). Each test
uses `expect(value).toBe(expected)` — if the values are not strictly equal, the test
fails with the actual and expected values shown.

Create `src/user-functions.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
```

`vitest` is the test runner package, installed in lesson 02. `describe` groups tests.
`test` defines one test case. `expect` creates an assertion. All three were explained
in lesson 04 — used without re-explanation from here onward.

```typescript
import { parseExpression }     from './expression-parser.js'
import { createEnvironment,
         bindVariable }        from './environment.js'
import { AngleMode }           from './types.js'
```

`expression-parser.ts` is the evaluation engine. `createEnvironment` creates a fresh
environment with `pi` and `e`. `bindVariable` is used in one test to set up an outer
`x = 99`. `AngleMode` is the angle mode enum, needed as the third argument to
`parseExpression`.

```typescript
describe('user functions', () => {
  test('f(x) = x^2 + 1, f(3) = 10', () => {
    const { environment: envWithF } =
      parseExpression('f(x) = x^2 + 1', createEnvironment(), AngleMode.DEGREES)
    const { result } = parseExpression('f(3)', envWithF, AngleMode.DEGREES)
    expect(result).toBe(10)
  })

  test('function composition: g(f(2)) = 9', () => {
    let env = createEnvironment()
    env = parseExpression('f(x) = x^2 + 1', env, AngleMode.DEGREES).environment
    env = parseExpression('g(x) = 2*x - 1', env, AngleMode.DEGREES).environment
    const { result } = parseExpression('g(f(2))', env, AngleMode.DEGREES)
    expect(result).toBe(9)
  })

  test('parameter does not pollute outer scope', () => {
    let env = bindVariable('x', 99, createEnvironment())
    env = parseExpression('f(x) = x^2', env, AngleMode.DEGREES).environment
    parseExpression('f(3)', env, AngleMode.DEGREES)
    const { result } = parseExpression('x', env, AngleMode.DEGREES)
    expect(result).toBe(99)
  })

  test('redefining a function replaces the old definition', () => {
    let env = createEnvironment()
    env = parseExpression('f(x) = x + 1', env, AngleMode.DEGREES).environment
    env = parseExpression('f(x) = x * 2', env, AngleMode.DEGREES).environment
    const { result } = parseExpression('f(5)', env, AngleMode.DEGREES)
    expect(result).toBe(10)  // x*2, not x+1
  })

  test('invalid body expression produces an error at definition time', () => {
    const { result } =
      parseExpression('f(x) = x^^2', createEnvironment(), AngleMode.DEGREES)
    expect(typeof result).toBe('object')  // CalcError, not number
  })
})
```

The third test is the key scoping test: it directly verifies that calling `f(3)` —
which binds `x = 3` inside the call — does not change the outer `x = 99`. The outer
environment is passed in, and after the call, `x` still evaluates to `99`. This
proves the immutability guarantee.

The fifth test verifies that body validation at definition time works: a double caret
`x^^2` is an invalid token sequence. The parser returns a `CalcError` when the
function is defined, not when it is called.

Run `npm test`. All tests pass before touching `main.ts`.

**Reading a test failure:**
If the scoping test fails — `x` returns `3` instead of `99` — it means `bindVariable`
is mutating the outer environment instead of creating a new one. The fix is in
`environment.ts`: verify that `bindVariable` uses spread syntax to create a new
`bindings` object, not `Object.assign` or direct assignment to `environment.bindings`.

The test failure message would read:
```
AssertionError: expected 3 to be 99
  at user-functions.test.ts:22:3
```

Line 22 is the `expect(result).toBe(99)` line. Open `user-functions.test.ts` at
line 22 to see exactly which assertion failed, then trace backward through the
`parseExpression` call and into `environment.ts`.

---

## Step 7 — The Function Panel

### The problem

User-defined functions are stored in `calculatorState.environment.functions`. They
should be visible to the user — showing what functions exist and what their bodies are.

### The code

Add to `index.html` (below the variable panel from lesson 08):

```html
<div class="function-panel" id="function-panel"></div>
```

Add to `src/main.ts`:

```typescript
function renderFunctions(): void {
  const panelElement =
    document.querySelector<HTMLDivElement>('#function-panel')
  if (panelElement === null) return

  panelElement.textContent = ''

  for (const [functionName, userFunction] of
       Object.entries(calculatorState.environment.functions)) {
    const rowElement = document.createElement('div')
    rowElement.className   = 'function-row'
    rowElement.textContent =
      `${functionName}(${userFunction.parameterName}) = ${userFunction.bodyExpression}`
    panelElement.appendChild(rowElement)
  }
}
```

Call `renderFunctions()` at the end of `updateDisplay()`.

Add to `style.css`:

```css
.function-row {
  color:       var(--colour-precision-text);
  font-size:   var(--font-size-history);
  font-family: var(--font-display);
  padding:     0.2rem 0;
}
```

**`Object.entries` recap (from lesson 08):**
`Object.entries(obj)` returns an array of `[key, value]` pairs for every property in
`obj`. `for (const [name, fn] of Object.entries(...))` iterates with both the name
and the function object at each step — array destructuring on the pair.

After defining `f(x) = x^2 + 1` and `g(x) = 2*x - 1`, the panel shows:
```
f(x) = x^2 + 1
g(x) = 2*x - 1
```

---

## Debugging: When User Functions Behave Wrongly

**Symptom: `f(3)` says `'f' is not defined` after typing `f(x) = x^2 + 1`**

The function definition was not stored in the environment. Check that `applyEquals`
saves the returned `newEnvironment` to `calculatorState.environment`. Add a temporary log:

```typescript
console.log('functions after definition:', newEnvironment.functions)
```

If `f` is missing, the `parseExpression` function-definition branch returned the
original environment unchanged. Verify that `bindFunction(functionName, newFunction, environment)`
is called and that its result is returned as the new environment.

**Symptom: `f(3)` always returns `0` regardless of the function body**

`f(x) = x^2 + 1` was stored, but calling `f(3)` is not binding the parameter
correctly. In `parsePrimary`, the `callEnvironment` should be:
```typescript
bindVariable(userFunction.parameterName, argumentValue, environment)
```
If `argumentValue` is `0` or if `bindVariable` is using the wrong parameter name,
`f(3)` will evaluate as if `x = 0`. Add a log:
```typescript
console.log('callEnvironment bindings:', callEnvironment.bindings)
```

**Symptom: calling `f(3)` changes the outer variable `x` to 3**

`bindVariable` is mutating `environment.bindings` instead of creating a new object.
Check that `bindVariable` in `environment.ts` uses spread syntax:
```typescript
return { bindings: { ...environment.bindings, [name]: value } }
```
If it uses direct assignment (`environment.bindings[name] = value`), the outer
environment is corrupted.

**Symptom: `f(x) = x^^2` stores the function without showing an error**

The body validation step is missing. In the function-definition branch of
`parseExpression`, verify that `parseExpression(bodyExpression, validationEnvironment, angleMode)`
is called and its result is checked with `isCalcError`. If the validation call is absent,
invalid bodies are stored silently.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`UserFunction` stored in the environment is the foundation for every subsequent
lesson involving functions. The `evaluateAt` function introduced in lesson 12 is
the single interface through which all of these consume user functions:

```typescript
evaluateAt(userFunction, xValue, environment, angleMode)
// → bindVariable(parameterName, xValue, environment)
// → parseExpression(bodyExpression, callEnvironment, angleMode)
```

This is the same substitution model built in this lesson. Lesson 12 does not
implement its own substitution — it calls `evaluateAt`, which calls the mechanism
defined here. The same chain powers the table (lesson 14), integration (lesson 16),
bisection (lesson 18), Newton's method (lesson 20), and the extrema finder (lesson 21).

---

## What Breaks Without This

**Without parameter isolation (mutable environments):**
Calling `f(3)` would bind `x = 3` in the global environment. Any outer variable
also named `x` would be permanently overwritten. After the call, `x` evaluates to
`3` everywhere. Functions would be destructive and unsafe to call.

With immutable environments, `bindVariable` creates a new object for `callEnvironment`.
The call runs in this new object. When the call returns, `callEnvironment` is
discarded. The outer environment is unchanged — proven by the scoping test.

**Without body validation at definition time:**
`f(x) = 1/x` stores successfully. `f(0)` returns a `CalcError` at call time —
acceptable, because division by zero is a runtime condition, not a syntax error.

But `f(x) = x^^2` stores successfully. `f(3)` throws a tokenisation exception at
call time, deep inside `parseExpression`, with no context about which function caused
it. The user sees an opaque error at call time, not at definition time.

Validation at definition time (calling `parseExpression` with `x = 0`) catches
syntax errors before they are stored. The error message is produced at the right
moment: when the user made the mistake.

---

## Definition of Done

- [ ] `f(x) = x^2 + 1` stores the function (display shows `0`)
- [ ] `f(3)` evaluates to `10`
- [ ] `g(f(2))` evaluates to `9` where `g(x) = 2*x - 1`
- [ ] Redefining `f` with a new expression replaces the old definition
- [ ] `f(x) = x^^2` produces an error at definition time (display shows an error,
      function is not stored)
- [ ] Calling `f(3)` does not change any outer variable named `x`
- [ ] The function panel shows all defined functions with their parameter and body
- [ ] `npm test` passes all tests in `user-functions.test.ts`
- [ ] You can explain what the substitution model is and trace `g(f(2))` step by step
- [ ] You can explain why parameters do not affect outer scope (immutable environments,
      `bindVariable` creates a new object)
- [ ] You can explain why the body is stored as a string rather than a compiled function
      (displayable, re-evaluable, smallest representation)
- [ ] You can explain the type assertion `as { type: 'IDENTIFIER'; name: string }`
      and when it is safe to use
- [ ] You can explain why built-ins are checked before user functions and what
      happens if a user tries to redefine `sin`
- [ ] You can explain why `f(x) = x^^2` produces an error at definition time but
      `f(x) = 1/x` does not
- [ ] You can explain why parsing user-supplied function bodies is safe (no arbitrary
      code execution, only the calculator's arithmetic grammar is recognised)
- [ ] Run:
      ```
      git add src/types.ts src/environment.ts src/expression-parser.ts src/user-functions.test.ts src/main.ts index.html src/style.css
      git commit -m "Add user-defined functions: f(x)=x^2+1 stores body as string, substitution model evaluates with bound parameter, body validation at definition time, scopes are isolated"
      ```

---

*Next: Lesson 11 — The Coordinate Plane. A canvas appears beside the calculator
with axes, grid, and labels. The viewport transform maps mathematical coordinates
to canvas pixels. The Y-axis is flipped: maths goes up, canvas goes down.*
