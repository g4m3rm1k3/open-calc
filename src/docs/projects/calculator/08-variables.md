# Calculator — Lesson 08 — Variables

## What You Will Build

`A = 42` stores `42` under the name `A`. Typing `A + 8 =` returns `50`. `pi`
evaluates to `3.141592653`. `e` evaluates to `2.718281828`. Referencing an
undefined variable shows `Error: 'B' is not defined`. A variable panel below
the button grid shows all stored names and their current values.

## What You Need to Know First

Lessons 01–07. The full expression parser from lesson 07 is the base this lesson
extends. Two things are added: identifier tokens to the lexer, and an environment —
the data structure that maps names to values — passed into and returned from the
parser.

---

## The Problem

The calculator can compute `3 + 4` but immediately forgets the result. There is no
way to store a value and use it in a later calculation. Typing `A = 42` then
`A * 2` should give `84` — but right now, `A` is an unrecognised character that
causes a lexer error.

The solution is the same as the solution used by every programming language runtime
ever written: a **symbol table** — an object that maps names (strings) to values
(numbers). When JavaScript resolves `let x = 5`, it stores `x → 5` in the scope's
symbol table. When `x + 1` is evaluated, the runtime looks up `x` and finds `5`.
This lesson builds exactly the same mechanism from scratch.

---

## Step 1 — The Environment

### The problem

A symbol table needs three operations: create (with default bindings), lookup (find
the value for a name), and bind (add or replace a binding). These operations must
produce new symbol tables rather than modifying existing ones — the same immutability
principle that governs history and state.

This is not optional. In lesson 10 (user functions), calling `f(3)` will bind
`x = 3` *inside the call* without disturbing the outer `x`. If binding mutated the
existing table, calling `f(3)` would overwrite any outer variable named `x` permanently.
Immutable environments are required for correct scoping.

### The code

Create `src/environment.ts`:

```typescript
export interface Environment {
  readonly bindings: Readonly<Record<string, number>>
}

export function createEnvironment(): Environment {
  return {
    bindings: {
      pi: Math.PI,
      e:  Math.E,
    },
  }
}

export function lookupVariable(
  name:        string,
  environment: Environment,
): number | undefined {
  return environment.bindings[name]
}

export function bindVariable(
  name:        string,
  value:       number,
  environment: Environment,
): Environment {
  return {
    bindings: {
      ...environment.bindings,
      [name]: value,
    },
  }
}
```

**What `src/environment.ts` is:**
`environment.ts` owns the symbol table — the only module that knows how to store
and retrieve name-to-value bindings. The parser calls `lookupVariable` and
`bindVariable`. If the storage mechanism ever changed (to `localStorage`, a
database, or a remote API), only this module would change. The parser would be
unchanged.

**`Record<string, number>` — first appearance:**
`Record<string, number>` is a TypeScript **utility type** describing a plain object
where every key is a `string` and every value is a `number`. It is equivalent to
`{ [key: string]: number }` but more readable. Used here to describe the shape of
the bindings object: any string name maps to a numeric value.

`Readonly<Record<string, number>>` wraps it to prevent runtime mutation. The outer
`readonly bindings` prevents the `bindings` property itself from being reassigned.
Together they create a fully immutable symbol table at the type level.

**`Math.PI` and `Math.E`:**
`Math.PI` is JavaScript's built-in constant for π: `3.141592653589793`.
`Math.E` is e (Euler's number): `2.718281828459045`. They live in the `Math` namespace
alongside `Math.sin`, `Math.sqrt`, and every other standard mathematical function.
Pre-binding `pi` and `e` means the user can type `pi =` and see the value immediately,
and `2 * pi =` computes the circumference ratio without any definition step.

**Computed property keys — `[name]: value` — first appearance:**
`{ ...environment.bindings, [name]: value }` uses a **computed property key**.
The square brackets around `name` mean: use the *value of the variable* `name` as
the key, not the literal string `"name"`. If `name` is `'A'`, the result has a key
named `'A'`. If `name` is `'temperature'`, the result has a key named `'temperature'`.

Without the brackets:
```typescript
{ name: value }  // always creates key "name" — the literal string, not the variable
```

With the brackets:
```typescript
{ [name]: value }  // creates a key whose name is the value of the `name` variable
```

Computed property keys appear throughout the project wherever a string variable
determines which property to set.

**Spread syntax on objects — recap (from lesson 03):**
`{ ...environment.bindings, [name]: value }` creates a **new object** containing
all properties of `environment.bindings` with `[name]: value` added or overriding.
If the name already existed, the spread copies the old value, then `[name]: value`
overwrites it — producing an updated binding without mutating the original.
`environment.bindings` is unchanged.

### Walkthrough — binding `A = 42`

Initial environment from `createEnvironment()`:
```
{ bindings: { pi: 3.14159..., e: 2.71828... } }
```

Call: `bindVariable('A', 42, environment)`.

`{ ...environment.bindings, ['A']: 42 }`:
→ spread copies `{ pi: 3.14159..., e: 2.71828... }`
→ `['A']: 42` adds `A: 42`
→ result: `{ pi: 3.14159..., e: 2.71828..., A: 42 }`

Returned environment: `{ bindings: { pi: 3.14159..., e: 2.71828..., A: 42 } }`

Original environment: `{ bindings: { pi: 3.14159..., e: 2.71828... } }` — unchanged.

`lookupVariable('A', newEnvironment)` → `42`. ✓
`lookupVariable('A', originalEnvironment)` → `undefined` — the original had no `A`. ✓

**Redefining a variable:**
`bindVariable('A', 99, newEnvironment)` creates yet another new environment:
`{ bindings: { pi: ..., e: ..., A: 99 } }`. The spread copies `A: 42` from
`newEnvironment.bindings`, then `['A']: 99` overwrites it. The previous environment
still has `A: 42`. The new one has `A: 99`. Both coexist in memory.

**CS lens — symbol table:**
`environment.bindings` is a **symbol table** — the standard data structure for
name-to-value binding in programming language implementation. Every language runtime
has one. The V8 JavaScript engine stores variable bindings in objects called "contexts"
that are structurally identical to this `Environment`. When JavaScript says
`ReferenceError: x is not defined`, it means the symbol table lookup returned
`undefined`.

The lookup is O(1): JavaScript object property access is a hash map lookup. The same
performance profile as the language runtime itself. 100 variables lookup in the same
time as 10 variables.

**SE lens — immutable environment and nested scopes:**
`bindVariable` returns a new environment. This enables **nested scopes**: when
lesson 10 calls `f(3)` for `f(x) = x^2`, the call creates a new environment with
`x: 3` added, evaluates `x^2` in that new environment, then discards the call
environment. The outer environment is unchanged. After `f(3)` returns, the outer
`x` (if any) is exactly what it was before.

This is how JavaScript's own closures work: each function call creates a new scope
object that extends the enclosing scope. The enclosing scope is not modified.
Variables in the outer scope are not affected by the inner scope. This project
makes the mechanism explicit by building it from scratch.

---

## Step 2 — Environment in Calculator State

### The problem

The environment must travel with the application state. If it lived in a module-level
variable, clearing or resetting the calculator would require reaching into
`environment.ts` to reset it. With `environment` in `CalculatorState`, resetting
is a state transition: `createInitialState()` returns a fresh environment
automatically.

### The code

Update `src/calculator-state.ts`:

```typescript
import { InputState }                        from './input-state.js'
import { PrecisionLevel, DEFAULT_PRECISION } from './format-number.js'
import { HistoryEntry }                      from './types.js'
import { Environment, createEnvironment }    from './environment.js'
```

**Import explanation:**
The first three imports existed before; they are unchanged.

`import { Environment, createEnvironment } from './environment.js'` —
`environment.ts` is the module responsible for the symbol table (this lesson).
We import `Environment` (the type) because `CalculatorState.environment` must be
typed as an `Environment`. We import `createEnvironment` (the constructor function)
because `createInitialState` uses it to create the initial symbol table with `pi`
and `e` pre-bound. Both the type and the factory belong to the module that owns
the environment concept.

```typescript
export interface CalculatorState {
  displayValue:    string
  inputState:      InputState
  hasDecimalPoint: boolean
  precision:       PrecisionLevel
  history:         readonly HistoryEntry[]
  environment:     Environment
}

export function createInitialState(): CalculatorState {
  return {
    displayValue:    '0',
    inputState:      InputState.IDLE,
    hasDecimalPoint: false,
    precision:       DEFAULT_PRECISION,
    history:         [],
    environment:     createEnvironment(),
  }
}
```

---

## Step 3 — Extend the Lexer for Identifiers

### The problem

The lexer throws on letters. `A + 8` causes `Unexpected character: 'A'`. The lexer
must recognise identifier tokens: sequences starting with a letter or underscore,
continuing with letters, digits, or underscores.

### The code

Add to the `ExprToken` union type in `src/expression-lexer.ts`:

```typescript
| { type: 'IDENTIFIER'; name: string }
| { type: 'EQUALS'                   }
```

Add to the tokeniser loop, **before** the existing `switch` statement, after the
space check:

```typescript
// Identifiers: [a-zA-Z_][a-zA-Z0-9_]*
if (
  (currentChar >= 'a' && currentChar <= 'z') ||
  (currentChar >= 'A' && currentChar <= 'Z') ||
   currentChar === '_'
) {
  let identifierName = ''
  while (
    currentPosition < source.length &&
    ((source[currentPosition]! >= 'a' && source[currentPosition]! <= 'z') ||
     (source[currentPosition]! >= 'A' && source[currentPosition]! <= 'Z') ||
     (source[currentPosition]! >= '0' && source[currentPosition]! <= '9') ||
      source[currentPosition] === '_')
  ) {
    identifierName += source[currentPosition]
    currentPosition++
  }
  tokenList.push({ type: 'IDENTIFIER', name: identifierName })
  continue
}
```

Add `'='` to the `switch` statement:

```typescript
case '=': tokenList.push({ type: 'EQUALS' }); break
```

**CS lens — character classification:**
An identifier starts with `[a-zA-Z_]` and continues with `[a-zA-Z0-9_]*`. These
are the same rules used by JavaScript, Python, C, and most programming languages.
The rule says: numbers cannot start an identifier (so `42` is unambiguously a number),
but numbers can appear later (so `x2` is a valid identifier). Underscores are allowed
everywhere (so `my_variable` and `_private` are valid).

The classifier reads one character at a time and accumulates the name — the same
finite state machine approach used for numbers in lesson 07. Two states: "reading
identifier" and "done." One transition: reading a non-identifier character.

### Walkthrough — tokenising `A + pi`

`currentChar = 'A'` — in range `'A'`–`'Z'` → identifier branch.
`identifierName` accumulates: `'A'` (next char `' '` — space, not a letter/digit/`_`
→ exit inner loop). `currentPosition = 1`.
Push `{ type: 'IDENTIFIER', name: 'A' }`. `continue`.

`currentChar = ' '` (index 1) → skip.
`currentChar = '+'` (index 2) → push `PLUS`.
`currentChar = ' '` (index 3) → skip.
`currentChar = 'p'` (index 4) → identifier branch.
`identifierName` accumulates: `'p'`, `'i'`. Next is EOF → exit.
Push `{ type: 'IDENTIFIER', name: 'pi' }`.

Result: `[ IDENTIFIER('A'), PLUS, IDENTIFIER('pi'), EOF ]` ✓

---

## Step 4 — Extend the Parser for Variables and Assignment

### The problem

The parser must handle two new cases: a bare identifier like `A` (look up its value
in the environment) and an assignment like `A = 42` (bind a new value and return
an updated environment).

The parser now needs to accept the environment and return it alongside the result.
Callers must use the returned environment for the next calculation.

### The code

Update `src/expression-parser.ts`:

```typescript
import { tokeniseExpression, ExprToken }      from './expression-lexer.js'
import { CalcError, makeError, isCalcError }  from './calc-error.js'
import { Environment, lookupVariable,
         bindVariable }                       from './environment.js'
```

**Import explanation:**
The first two imports existed before; they are unchanged.

`import { Environment, lookupVariable, bindVariable } from './environment.js'` —
`environment.ts` is the module responsible for the symbol table (this lesson).
We import three things: `Environment` (the type, for the new parameter and return
type), `lookupVariable` (the function that reads a name's value, called in
`parsePrimary` when an identifier is encountered), and `bindVariable` (the function
that creates a new binding, called when an assignment like `A = 42` is parsed).

Add the return type interface and update the function signature:

```typescript
export interface ParseWithEnv {
  result:      ParseResult
  environment: Environment
}

export function parseExpression(
  source:      string,
  environment: Environment,
): ParseWithEnv {
  let tokens: ExprToken[]
  try {
    tokens = tokeniseExpression(source)
  } catch (lexerError) {
    return { result: makeError('INVALID_EXPRESSION', String(lexerError)), environment }
  }

  if (tokens.length === 1 && tokens[0]?.type === 'EOF') {
    return { result: makeError('INVALID_EXPRESSION', 'Empty expression'), environment }
  }

  let currentPosition = 0

  function peek(): ExprToken {
    return tokens[currentPosition] ?? { type: 'EOF' }
  }

  function consume(): ExprToken {
    const token = tokens[currentPosition] ?? { type: 'EOF' }
    currentPosition++
    return token
  }
```

Detect assignment at the start, before the main parse:

```typescript
  // Assignment: IDENTIFIER EQUALS expression
  if (
    tokens.length >= 3      &&
    tokens[0]?.type === 'IDENTIFIER' &&
    tokens[1]?.type === 'EQUALS'
  ) {
    const nameToken = tokens[0] as { type: 'IDENTIFIER'; name: string }
    currentPosition = 2  // skip past IDENTIFIER and EQUALS

    const valueResult = parseAdditive()
    if (isCalcError(valueResult)) {
      return { result: valueResult, environment }
    }

    const newEnvironment = bindVariable(nameToken.name, valueResult, environment)
    return { result: valueResult, environment: newEnvironment }
  }
```

**`tokens[0] as { type: 'IDENTIFIER'; name: string }` — type assertion recap:**
TypeScript knows `tokens[0]` is an `ExprToken` — a union that includes `IDENTIFIER`,
`PLUS`, `NUMBER`, and others. The `?.type === 'IDENTIFIER'` condition narrows it
*in the condition*, but TypeScript does not always carry that narrowing into later
statements. The `as` assertion tells the compiler: "I verified this is the
`IDENTIFIER` variant; trust me when I access `.name`." The two-condition check
(`tokens[0]?.type === 'IDENTIFIER'`) guarantees the assertion is true. Using `as`
on an unchecked value would be incorrect — it would move a type error to a silent
runtime error.

In `parsePrimary`, add the identifier case after the `NUMBER` case:

```typescript
    if (currentToken.type === 'IDENTIFIER') {
      consume()
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

The return type changes: instead of returning `ParseResult` directly, every return
becomes `{ result: ..., environment }` or `{ result: ..., environment: newEnv }`.
Update all existing returns in the function accordingly.

The final return:
```typescript
  const finalResult = parseAdditive()
  if (isCalcError(finalResult)) return { result: finalResult, environment }
  if (peek().type !== 'EOF') {
    return {
      result: makeError('INVALID_EXPRESSION', 'Unexpected input after expression'),
      environment,
    }
  }
  return { result: finalResult, environment }
```

### Walkthrough — `A = 42` followed by `A + 8`

**Parsing `A = 42`:**
Tokens: `[ IDENTIFIER('A'), EQUALS, NUMBER(42), EOF ]`

Assignment check: `tokens.length >= 3` ✓, `tokens[0].type === 'IDENTIFIER'` ✓,
`tokens[1].type === 'EQUALS'` ✓. Detected as assignment.

`nameToken.name = 'A'`. `currentPosition = 2` (skip to `NUMBER(42)`).
`parseAdditive()` → ... → `parsePrimary` sees `NUMBER(42)` → returns `42`.
`bindVariable('A', 42, environment)` → new environment with `A: 42`.
Return `{ result: 42, environment: newEnvironment }`.

Display shows `42`. State's environment now contains `A: 42`.

**Parsing `A + 8`:**
Tokens: `[ IDENTIFIER('A'), PLUS, NUMBER(8), EOF ]`

Assignment check: `tokens[1].type` is `PLUS`, not `EQUALS` → not an assignment.
`parseAdditive()` → `parseMultiplicative()` → `parsePower()` → `parseUnary()` →
`parsePrimary()`.

`parsePrimary` sees `IDENTIFIER('A')` → consume → `lookupVariable('A', environment)`.
`environment.bindings['A']` → `42`. Return `42`.

Back in `parseAdditive`: `leftValue = 42`. Peek is `PLUS` → consume → `parseMultiplicative()`
→ ... → `parsePrimary` sees `NUMBER(8)` → `8`. `leftValue = 42 + 8 = 50`.
Return `{ result: 50, environment }` (environment unchanged).

Display shows `50`. ✓

---

## Step 5 — Update the Reducer and Variable Panel

Update `applyEquals` in `src/input-reducer.ts`:

```typescript
import { parseExpression }     from './expression-parser.js'
import { isCalcError }         from './calc-error.js'
import { formatResult }        from './format-number.js'
import { InputState }          from './input-state.js'
import { CalculatorState }     from './calculator-state.js'
import { HistoryEntry }        from './types.js'
import type { ButtonConfig }   from './buttons.js'
```

**Import explanation:**
All these imports existed before. The only change: `parseExpression` now returns
`ParseWithEnv` (an object with `result` and `environment`) instead of
`ParseResult` (just a number or error). The import itself does not change — only
how the return value is used.

```typescript
function applyEquals(state: CalculatorState): CalculatorState {
  const { result, environment: newEnvironment } =
    parseExpression(state.displayValue, state.environment)

  if (isCalcError(result)) {
    return {
      ...state,
      displayValue: `Error: ${result.message}`,
      inputState:   InputState.IDLE,
    }
  }

  const formattedResult = formatResult(result, state.precision)
  const newEntry: HistoryEntry = {
    expression: state.displayValue,
    result:     formattedResult,
    timestamp:  Date.now(),
  }

  return {
    ...state,
    displayValue:    formattedResult,
    inputState:      InputState.AFTER_EQUALS,
    hasDecimalPoint: formattedResult.includes('.'),
    history:         [...state.history, newEntry],
    environment:     newEnvironment,
  }
}
```

**Destructuring assignment — first appearance:**
`const { result, environment: newEnvironment } = parseExpression(...)` is
**destructuring assignment** applied to an object. It extracts properties from the
returned object into local variables:
- `result` gets the `result` property
- `environment: newEnvironment` gets the `environment` property and renames it to
  `newEnvironment` (to distinguish it from the `state.environment` input)

Without destructuring:
```typescript
const parseResult    = parseExpression(state.displayValue, state.environment)
const result         = parseResult.result
const newEnvironment = parseResult.environment
```

Destructuring is shorthand for this pattern. It is used throughout lessons 08–22
wherever functions return objects. The rename syntax (`property: localName`) is the
key feature: it avoids naming collisions when the property name is already taken.

Add to `index.html`:

```html
<div class="variable-panel" id="variable-panel"></div>
```

Add to `src/main.ts`:

```typescript
import { formatResult }  from './format-number.js'
import { InputState }    from './input-state.js'
```

```typescript
function renderVariables(): void {
  const panelElement =
    document.querySelector<HTMLDivElement>('#variable-panel')
  if (panelElement === null) return

  panelElement.textContent = ''

  const userBindings = Object.entries(
    calculatorState.environment.bindings,
  ).filter(([name]) => name !== 'pi' && name !== 'e')

  for (const [variableName, variableValue] of userBindings) {
    const rowElement = document.createElement('div')
    rowElement.className   = 'variable-row'
    rowElement.textContent =
      `${variableName} = ${formatResult(variableValue, calculatorState.precision)}`
    panelElement.appendChild(rowElement)
  }
}
```

Call `renderVariables()` at the end of `updateDisplay()`.

Add to `style.css`:

```css
.variable-row {
  color:       var(--colour-precision-text);
  font-size:   var(--font-size-history);
  font-family: var(--font-display);
  padding:     0.2rem 0;
}
```

**`Object.entries(object)` — first appearance:**
`Object.entries(obj)` returns an array of `[key, value]` pairs for every enumerable
property of `obj`. `Object.entries({ pi: 3.14, A: 42 })` returns
`[ ['pi', 3.14], ['A', 42] ]`. The `for (const [name, value] of entries)` loop
uses **array destructuring** — the same principle as object destructuring, applied
to arrays. `[variableName, variableValue]` extracts the first and second element of
each pair.

**`Array.filter(predicate)` — first appearance:**
`.filter(predicate)` creates a **new array** containing only elements for which
`predicate` returns `true`. The original array is not modified. Here, `pi` and `e`
are filtered out — they are pre-defined constants that the user did not store. Showing
them in the variable panel alongside user-defined variables would be confusing. The
filter uses array destructuring in the parameter: `([name])` extracts the first
element (the key) of each `[name, value]` pair.

### Walkthrough — rendering the variable panel after `A = 42` and `B = 7`

```
calculatorState.environment.bindings = {
  pi: 3.141592653589793,
  e:  2.718281828459045,
  A:  42,
  B:  7,
}
```

`Object.entries(...)` returns:
```
[ ['pi', 3.14...], ['e', 2.71...], ['A', 42], ['B', 7] ]
```

`.filter(([name]) => name !== 'pi' && name !== 'e')`:
```
[ ['A', 42], ['B', 7] ]
```

The loop creates two `<div>` elements:
```
A = 42
B = 7
```

---

## Debugging: When Variables Behave Wrongly

**Symptom: `A = 42` shows `42` on the display but `A + 8` says `'A' is not defined`**

The environment returned by `parseExpression` when processing `A = 42` is not being
saved to state. Check `applyEquals` in `input-reducer.ts`: the destructured
`newEnvironment` must be included in the returned state as `environment: newEnvironment`.
If it is missing, `newEnvironment` is computed and then discarded.

Add a temporary log to check:
```typescript
console.log('environment after assignment:', newEnvironment)
```
If `newEnvironment` shows `A: 42` but `calculatorState.environment` does not, the
state update is missing the environment field.

**Symptom: `pi` shows `Error: 'pi' is not defined`**

`createEnvironment()` is not being called, or the initial environment is not being
passed to `parseExpression`. Check `applyEquals` — it should call
`parseExpression(state.displayValue, state.environment)`. If the second argument
is missing or wrong, the parser receives an environment with no bindings.

**Symptom: variable panel shows `pi` and `e` alongside user variables**

The `.filter(([name]) => name !== 'pi' && name !== 'e')` call is missing from
`renderVariables`. Without the filter, `Object.entries` returns all bindings
including the pre-defined ones.

**Symptom: variable panel never updates after storing a variable**

`renderVariables()` is not called from `updateDisplay()`. Check that the call is
at the end of `updateDisplay` — after the display value is set.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The `Environment` established here is the foundation of lesson 10 (user functions).
When `f(x) = x^2` is called with `f(3)`, the parser creates a *new* environment
by calling `bindVariable('x', 3, environment)` — adding `x: 3` to the existing
environment. The function body `x^2` is evaluated in that extended environment.
After the call, the extended environment is discarded. The outer environment is
unchanged. The mechanism is identical to what is built here.

This is also how JavaScript itself handles function calls:

```javascript
const x = 10
function f(x) { return x * 2 }
f(3)   // x inside f is 3; x outside is still 10
```

JavaScript creates a new scope for `f` that shadows the outer `x`. This project's
`bindVariable` implements the same mechanism explicitly.

The `environment` field in `CalculatorState` means the symbol table persists across
calculations in the same session. In lesson 06, `history` was added to `CalculatorState`
for the same reason: both are session-level state that must travel with the application.

---

## What Breaks Without This

**O(n) lookup if stored as an array:**
Without a plain object (`Record`), variable lookup requires scanning an array of
`{name, value}` pairs. For 5 variables, negligible. For 50, noticeably slow. More
critically, chaining two symbol tables for nested scopes (lesson 10) requires O(n)
search per lookup. Object property access is O(1) regardless of how many properties
exist.

**Mutable environment — the scoping disaster:**
If `bindVariable` mutated `environment.bindings` in place (`environment.bindings[name] = value`),
then every call to a user function (lesson 10) would permanently modify the outer
environment. Calling `f(3)` with `f(x) = x^2` would set `x = 3` in the global
environment. Any outer variable named `x` would be permanently overwritten after
the first function call. The program would become unpredictable after any function
call. Immutability is not a style choice — it is required for correct behaviour.

**Without `Object.entries` filtering:**
`pi` and `e` would appear in the variable panel alongside user-defined variables.
The panel would always show two entries the user did not create, making it appear
that the user defined them. The filter is the line between "show what the user
explicitly stored" and "show everything in the symbol table."

---

## Definition of Done

- [ ] `A = 42` stores `42` and displays `42`
- [ ] `A + 8 =` returns `50`
- [ ] `pi =` returns `3.141592653` (at 10 sig. fig.)
- [ ] `e =` returns `2.718281828` (at 10 sig. fig.)
- [ ] Referencing an undefined variable → `Error: 'B' is not defined`
- [ ] Redefining a variable updates it: `A = 10`, then `A = 20`, then `A =` → `20`
- [ ] The variable panel shows user-defined names and values but not `pi` or `e`
- [ ] Variables persist across calculations in the same session
- [ ] `npm test` still passes all tests from previous lessons
- [ ] You can explain what a symbol table is and name one real-world system that uses one
- [ ] You can explain `Record<string, number>` and what it describes
- [ ] You can explain computed property keys (`[name]: value`) and how they differ from
      `{ name: value }`
- [ ] You can explain destructuring assignment for both objects and arrays, including
      the rename syntax `{ environment: newEnvironment }`
- [ ] You can explain why `bindVariable` returns a new environment instead of mutating
      the existing one, and what would break in lesson 10 if it mutated
- [ ] You can explain `Object.entries` and what it returns
- [ ] You can explain `Array.filter` and how destructuring works in the predicate
      parameter
- [ ] Run:
      ```
      git add src/environment.ts src/calculator-state.ts src/expression-lexer.ts src/expression-parser.ts src/input-reducer.ts src/main.ts index.html src/style.css
      git commit -m "Add variables: symbol table stores name-to-value bindings, pi and e are pre-defined, assignment syntax A=42 updates the environment"
      ```

---

*Next: Lesson 09 — Built-in Functions. `sin(30)` → `0.5`. `log(100)` → `2`. A
dispatch table maps function names to implementations. Adding a new built-in function
requires exactly one line. The open/closed principle in a concrete example.*
