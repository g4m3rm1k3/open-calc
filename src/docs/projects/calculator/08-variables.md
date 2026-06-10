# Lesson 08 — Variables

## What You Will Build

`A = 42` stores `42` under the name `A`. Typing `A + 8 =` returns `50`.
`pi` and `e` are pre-defined. A variable panel shows all stored names and values.

## What You Need to Know First

Lessons 01–07. The full expression parser is the base this lesson extends.

---

## The Lesson

### The problem

The calculator can compute expressions but forgets everything immediately. There
is no way to store a result and reuse it. Every real calculator has memory.
The question is how a name maps to a value.

---

### Step 1 — The environment

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

export function lookupVariable(name: string, env: Environment): number | undefined {
  return env.bindings[name]
}

export function bindVariable(name: string, value: number, env: Environment): Environment {
  return {
    bindings: { ...env.bindings, [name]: value },
  }
}
```

**CS lens — symbol table:**
`env.bindings` is a symbol table — the standard data structure for mapping names
to values. Every language runtime has one. A JavaScript engine uses one to resolve
variable names. A compiler uses one to resolve identifiers to memory addresses.
Here it is a plain object: keys are names, values are numbers.

`lookupVariable` is a dictionary read — `O(1)`. `bindVariable` creates a new
environment with one additional binding — it does not mutate the original. The
old environment still exists. This immutability matters: if functions (lesson 10)
create nested scopes, the outer scope must be unchanged when the inner scope exits.

**SE lens — the repository pattern:**
`Environment` is a repository — a data store with a defined read/write interface.
The parser does not know how bindings are stored. It calls `lookupVariable` and
`bindVariable`. If the storage changes (localStorage, a database), only the
environment module changes. Everything else stays the same.

---

### Step 2 — Environment in calculator state

Update `src/calculator-state.ts`:

```typescript
import { Environment, createEnvironment } from './environment.js'

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

### Step 3 — Extend the lexer for identifiers

In `src/expression-lexer.ts`, add identifier support:

```typescript
export type ExprToken =
  // ... existing types ...
  | { type: 'IDENTIFIER'; name: string }

// In the tokenise loop, before the switch statement:
if ((character >= 'a' && character <= 'z') ||
    (character >= 'A' && character <= 'Z') ||
     character === '_') {
  let identifierName = ''
  while (
    position < source.length &&
    ((source[position]! >= 'a' && source[position]! <= 'z') ||
     (source[position]! >= 'A' && source[position]! <= 'Z') ||
     (source[position]! >= '0' && source[position]! <= '9') ||
      source[position] === '_')
  ) {
    identifierName += source[position]
    position++
  }
  tokens.push({ type: 'IDENTIFIER', name: identifierName })
  continue
}
```

**CS lens — character classification:**
An identifier starts with a letter or underscore. It continues with letters,
digits, or underscores. This rule is expressed as character range checks.
The lexer classifies each character and decides what token is being built.
This is the same finite state machine approach as the OpenMAT lexer — except
here the grammar is smaller so the state machine is simpler.

---

### Step 4 — Extend the parser for identifiers and assignment

Update `src/expression-parser.ts` to accept an environment:

```typescript
import { Environment, lookupVariable, bindVariable } from './environment.js'

export type ParseResult = number | CalcError
export type ParseWithEnv = { result: ParseResult; environment: Environment }

export function parseExpression(
  source:      string,
  environment: Environment,
): ParseWithEnv {
  // ... tokenise ...

  // Check for assignment: IDENTIFIER '=' expression
  if (
    tokens.length >= 2 &&
    tokens[0]?.type === 'IDENTIFIER' &&
    tokens[1]?.type === 'EQUALS'
  ) {
    const variableName = (tokens[0] as { type: 'IDENTIFIER'; name: string }).name
    // Skip the identifier and '=' tokens
    currentPosition = 2
    const valueResult = parseAdditive()

    if (typeof valueResult === 'object') {
      return { result: valueResult, environment }
    }

    const newEnvironment = bindVariable(variableName, valueResult, environment)
    return { result: valueResult, environment: newEnvironment }
  }

  // ... existing parsing ...

  // In parsePrimary, add identifier lookup:
  if (token.type === 'IDENTIFIER') {
    consume()
    const value = lookupVariable(token.name, environment)
    if (value === undefined) {
      return makeError('INVALID_EXPRESSION', `'${token.name}' is not defined`)
    }
    return value
  }
}
```

Add `EQUALS` to `ExprToken` in the lexer:

```typescript
| { type: 'EQUALS' }
// and in the switch: case '=': tokens.push({ type: 'EQUALS' }); break
```

---

### Step 5 — Update the reducer and display

In `src/input-reducer.ts`, update `applyEquals` to pass the environment and
store any new binding:

```typescript
function applyEquals(state: CalculatorState): CalculatorState {
  const { result, environment: newEnvironment } =
    parseExpression(state.displayValue, state.environment)

  if (isCalcError(result)) {
    return { ...state, displayValue: `Error: ${result.message}`, inputState: InputState.IDLE }
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

Add a variable panel to `index.html`:

```html
<div class="variable-panel" id="variable-panel"></div>
```

Render it in `src/main.ts`:

```typescript
function renderVariables(): void {
  const panel = document.querySelector<HTMLDivElement>('#variable-panel')
  if (panel === null) return

  panel.innerHTML = ''
  const entries = Object.entries(calculatorState.environment.bindings)
    .filter(([name]) => name !== 'pi' && name !== 'e') // hide built-in constants

  if (entries.length === 0) return

  for (const [variableName, variableValue] of entries) {
    const row = document.createElement('div')
    row.className = 'variable-row'
    row.textContent = `${variableName} = ${formatResult(variableValue, calculatorState.precision)}`
    panel.appendChild(row)
  }
}
```

Call `renderVariables()` at the end of `updateDisplay()`.

---

## Connect the Pieces

The `Environment` object is the foundation of lesson 10 (user functions). When a
function is called, a new environment is created that extends the current one —
the function's parameter is bound in the new scope, and the function body is
evaluated in that scope. After the function returns, the inner environment is
discarded. The outer environment is unchanged.

---

## What Breaks Without This

Without a symbol table, variable lookup is a string search through an array of
`{name, value}` pairs. `O(n)` lookup. Works for 5 variables. Struggles at 50.
Breaks the architecture when nested scopes are needed, because you cannot
efficiently chain two arrays.

A plain object (`Record<string, number>`) gives `O(1)` lookup and can be chained
by prototype — exactly how JavaScript itself resolves scope chains.

---

## Definition of Done

- [ ] `A = 42` stores `42` and displays `42`
- [ ] `A + 8 =` returns `50`
- [ ] `pi` evaluates to `3.141592653589793`
- [ ] `e` evaluates to `2.718281828459045`
- [ ] Referencing an undefined variable → `Error: 'B' is not defined`
- [ ] The variable panel shows all stored names and current values
- [ ] Variables persist across calculations in the same session
