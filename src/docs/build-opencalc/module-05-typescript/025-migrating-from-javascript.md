# 025 — Migrating from JavaScript

*How to convert a JavaScript file to TypeScript with zero regressions, and what to do with type errors*

---

## What You Will Build

You will migrate `src/Calculator.jsx` to `src/Calculator.tsx` — the most complex file in the project. You will type every state variable, every function parameter and return type, every event handler. You will encounter and fix type errors that reveal real edge cases. The component will pass `npx tsc --noEmit` with zero errors.

---

## What You Need to Know First

Lesson 024 — Interfaces as Contracts. TypeScript interfaces, structural typing, and `src/types.ts`.

Lesson 016 — useEffect. The current `Calculator.jsx` implementation.

---

## The Lesson

### The migration strategy

Migrating from JavaScript to TypeScript correctly has a strategy: **one file at a time, zero regressions.**

The wrong approach: enable `allowJs: true` in `tsconfig.json`, leave all files as `.js`, and add types gradually. This produces a hybrid codebase that is harder to reason about — some files are typed, some are not, and the boundary between them is invisible.

The correct approach:
1. Enable TypeScript for all new files (already done — Vite handles `.tsx`)
2. Rename `.jsx` to `.tsx`, one file at a time
3. Fix all type errors in that file before moving to the next
4. Verify the component still works in the browser after each migration

This approach produces a codebase where the boundary is always clear: `.ts`/`.tsx` files are fully typed, `.js`/`.jsx` files are not yet migrated.

---

**CS lens — the type coverage gradient:**

Type coverage is the percentage of your codebase that is fully typed. A codebase at 0% coverage has no types. At 100%, every variable, parameter, and return type is typed.

The migration produces a monotonically increasing coverage gradient. Each migrated file moves the boundary:

```
Before: [typed: types.ts, registry.ts, LabCard.tsx, CalculatorDisplay.tsx]
        [untyped: Calculator.jsx, App.jsx, Sidebar.jsx, HistoryPanel.jsx, ...]

After:  [typed: types.ts, registry.ts, LabCard.tsx, CalculatorDisplay.tsx, Calculator.tsx]
        [untyped: App.jsx, Sidebar.jsx, HistoryPanel.jsx, ...]
```

The gradient works because TypeScript can check typed files even when they import from untyped files. Untyped imports are inferred as `any`, which reduces type safety at the import boundary — but the migrated file itself is fully checked.

---

**SE lens — migration as risk management:**

The single-file migration approach minimises risk. Each migration is small enough to:
- Test completely before moving on
- Revert if something breaks (one file to revert)
- Review in isolation (a focused diff)

Large-scale migrations ("rename all 200 files at once") are high-risk: if something breaks, the cause is hard to identify and the revert is large. The one-at-a-time approach accepts more elapsed time in exchange for less risk per step.

This is the same agile principle from lesson 001: deliver working software frequently, even in internal refactors.

---

### Rename and open the file

Rename `src/Calculator.jsx` to `src/Calculator.tsx`.

Vite and TypeScript will now check this file. Run `npx tsc --noEmit` — you will see errors. Fix them one by one.

---

### Add types to Calculator.tsx

Here is the fully typed version:

```tsx
// src/Calculator.tsx

import { useState, useEffect, useMemo } from 'react'
import CalculatorDisplay  from './CalculatorDisplay.js'
import CalculatorButton   from './CalculatorButton.js'
import HistoryPanel       from './HistoryPanel.js'
import StatsPanel         from './StatsPanel.js'
import type { HistoryEntry } from './types.js'

// ---- localStorage helpers ----
// Typed: returns HistoryEntry[] (guaranteed by the guards)

function loadInitialHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem('calc-history')
    if (stored === null) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    // Validate each entry has the expected shape
    return parsed.filter(isHistoryEntry)
  } catch {
    return []
  }
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'expression' in value &&
    'result' in value &&
    typeof (value as HistoryEntry).id         === 'number' &&
    typeof (value as HistoryEntry).expression === 'string' &&
    typeof (value as HistoryEntry).result     === 'string'
  )
}

function loadInitialNextId(history: HistoryEntry[]): number {
  if (history.length === 0) return 1
  const maxId = Math.max(...history.map((entry) => entry.id))
  return maxId + 1
}

// ---- Component ----

export default function Calculator(): JSX.Element {
  const [expression, setExpression] = useState<string>('')
  const [isError,    setIsError]    = useState<boolean>(false)
  const [history,    setHistory]    = useState<HistoryEntry[]>(loadInitialHistory)
  const [nextId,     setNextId]     = useState<number>(
    () => loadInitialNextId(loadInitialHistory())
  )

  // Persist history to localStorage
  useEffect(() => {
    localStorage.setItem('calc-history', JSON.stringify(history))
  }, [history])

  // Update browser tab title
  useEffect(() => {
    document.title = expression !== '' ? `${expression} — Calculator` : 'Calculator'
    return () => {
      document.title = 'my-platform'
    }
  }, [expression])

  function appendDigit(digit: string): void {
    if (isError) return
    if (digit === '0' && expression === '0') return
    if (expression === '0' && digit !== '.') {
      setExpression(digit)
    } else {
      setExpression((prev) => prev + digit)
    }
  }

  function appendOperator(op: string): void {
    if (isError)          return
    if (expression === '') return
    const lastChar = expression.slice(-1)
    if (['+', '-', '*', '/'].includes(lastChar)) {
      setExpression((prev) => prev.slice(0, -1) + op)
    } else {
      setExpression((prev) => prev + op)
    }
  }

  function appendDecimal(): void {
    if (isError) return
    const segments    = expression.split(/[+\-*/]/)
    const lastSegment = segments[segments.length - 1]
    if (lastSegment === undefined || lastSegment.includes('.')) return
    setExpression((prev) => prev === '' ? '0.' : prev + '.')
  }

  function evaluate(): void {
    if (isError)          return
    if (expression === '') return

    try {
      // eslint-disable-next-line no-eval
      const rawResult = eval(expression) as unknown
      if (typeof rawResult !== 'number' && typeof rawResult !== 'string') {
        throw new Error(`Unexpected eval result type: ${typeof rawResult}`)
      }
      const resultStr = String(rawResult)

      setHistory((prev) => [
        ...prev,
        { id: nextId, expression, result: resultStr },
      ])
      setNextId((prev) => prev + 1)
      setExpression(resultStr)
      setIsError(false)

    } catch {
      setExpression('')
      setIsError(true)
    }
  }

  function clear(): void {
    setExpression('')
    setIsError(false)
  }

  function clearHistory(): void {
    setHistory([])
    setNextId(1)
  }

  const clearLabel: string = expression !== '' || isError ? 'C' : 'AC'

  interface ButtonDef {
    label:   string
    action:  () => void
    variant?: 'default' | 'operator' | 'equals' | 'clear'
  }

  const buttonDefs: ButtonDef[] = [
    { label: '7', action: () => appendDigit('7') },
    { label: '8', action: () => appendDigit('8') },
    { label: '9', action: () => appendDigit('9') },
    { label: '/', action: () => appendOperator('/'), variant: 'operator' },
    { label: '4', action: () => appendDigit('4') },
    { label: '5', action: () => appendDigit('5') },
    { label: '6', action: () => appendDigit('6') },
    { label: '*', action: () => appendOperator('*'), variant: 'operator' },
    { label: '1', action: () => appendDigit('1') },
    { label: '2', action: () => appendDigit('2') },
    { label: '3', action: () => appendDigit('3') },
    { label: '-', action: () => appendOperator('-'), variant: 'operator' },
    { label: '0', action: () => appendDigit('0') },
    { label: '.', action: () => appendDecimal()   },
    { label: clearLabel, action: clear, variant: 'clear' },
    { label: '+', action: () => appendOperator('+'), variant: 'operator' },
  ]

  const stats = useMemo(() => {
    const numericResults = history
      .map((entry) => parseFloat(entry.result))
      .filter((n) => !isNaN(n))

    if (numericResults.length === 0) return null

    const sum = numericResults.reduce((acc, n) => acc + n, 0)

    return {
      count: history.length,
      sum,
      avg: sum / numericResults.length,
      min: Math.min(...numericResults),
      max: Math.max(...numericResults),
    }
  }, [history])

  return (
    <div style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', overflow: 'hidden', maxWidth: '340px' }}>
      <CalculatorDisplay expression={expression} isError={isError} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#e0e0e0' }}>
        {buttonDefs.map(({ label, action, variant = 'default' }) => (
          <CalculatorButton key={label} label={label} onClick={action} variant={variant} />
        ))}
        <CalculatorButton key="equals" label="=" onClick={evaluate} variant="equals" />
      </div>
      <HistoryPanel history={history} onClear={clearHistory} />
      <StatsPanel stats={stats} />
    </div>
  )
}
```

**Key type decisions:**

`useState<string>('')` — explicit generic to make the state type clear. TypeScript would infer `string` from `''`, but being explicit makes the intent obvious.

`useState<HistoryEntry[]>(loadInitialHistory)` — TypeScript cannot infer this from the function reference alone; the generic parameter makes it explicit. Without it, TypeScript might infer `HistoryEntry[] | undefined` if the function return type were ambiguous.

`function isHistoryEntry(value: unknown): value is HistoryEntry` — a **type predicate function**. The return type `value is HistoryEntry` is a type assertion: if this function returns `true`, TypeScript narrows `value`'s type to `HistoryEntry` in the caller. Without this, `parsed.filter(...)` would require an explicit cast.

```typescript
const entries = parsed.filter(isHistoryEntry)
// entries: HistoryEntry[]  (TypeScript knows the type after the filter)
```

Without the type predicate, `parsed.filter((item) => item.id !== undefined)` returns `unknown[]` — TypeScript does not know the shape of filtered items.

`const rawResult = eval(expression) as unknown` — `eval()` returns `any` in TypeScript. Widening it to `unknown` forces explicit type checking before use. The subsequent `typeof` check narrows `unknown` to `number | string`. This is the safest way to handle `eval`'s output.

`interface ButtonDef { ... }` — an interface defined inside the component function. Interfaces can be declared anywhere in TypeScript — they exist only at type-check time and produce no runtime code. Defining it inside the function limits its scope.

`variant?: 'default' | 'operator' | 'equals' | 'clear'` — the `?` makes `variant` optional. TypeScript allows `{ label: '7', action: ... }` (no variant) and `{ label: '/', action: ..., variant: 'operator' }` (with variant).

---

**CS lens — narrowing and control flow analysis:**

TypeScript performs **control flow analysis** — it tracks the possible types of a value through conditional branches.

```typescript
function appendDecimal(): void {
  const segments    = expression.split(/[+\-*/]/)
  const lastSegment = segments[segments.length - 1]
  // TypeScript: lastSegment is 'string | undefined'
  // (Array index access can return undefined if the index is out of bounds)

  if (lastSegment === undefined || lastSegment.includes('.')) return
  // After this check: lastSegment is 'string' (not undefined)

  setExpression((prev) => prev === '' ? '0.' : prev + '.')
}
```

Before the `if` check, `lastSegment` has type `string | undefined`. After the `if (lastSegment === undefined)` check, TypeScript knows that if the code continues past the `if`, `lastSegment` is not `undefined` — it is `string`. This is **narrowing**: the type is narrowed from the union to a specific member.

TypeScript tracks narrowing through `if/else`, `switch`, `typeof`, `instanceof`, `in`, and comparison checks. This is what makes `strictNullChecks` workable: you check for null/undefined, TypeScript narrows the type, and you can use the value safely.

---

**SE lens — type errors as design feedback:**

Some type errors in migration reveal real code issues:

```typescript
// JavaScript (no error):
const lastSegment = segments[segments.length - 1]
lastSegment.includes('.')  // if segments is [], this crashes at runtime

// TypeScript (error with noUncheckedIndexedAccess or strict array bounds):
const lastSegment = segments[segments.length - 1]
// lastSegment: string | undefined — TypeScript forces handling the empty case
if (lastSegment === undefined) return  // now safe
lastSegment.includes('.')
```

The type error reveals that the original JavaScript code had an unhandled edge case: `expression.split(...)` on an empty string returns `['']`, not `[]`, so `segments.length - 1 === 0` and `segments[0]` is `''` — fine. But TypeScript's array access type `string | undefined` catches potential edge cases that JavaScript would miss silently.

Some type errors are false positives — TypeScript is overly conservative. Some are real bugs. When migrating, distinguish between the two: if you can construct a real input that would fail, fix the code. If the type error is provably unreachable, use a more specific type annotation or a type assertion with a comment explaining why it is safe.

---

### Fix remaining type errors

Run `npx tsc --noEmit` after renaming the file. Common errors and their fixes:

**Implicit `any` parameters:**

```
Parameter 'prev' implicitly has an 'any' type.
```

```typescript
setExpression((prev: string) => prev + digit)  // add explicit type
```

Or: TypeScript infers `prev` from the state type (`string`), but if the inference chain breaks, add the type explicitly.

**Non-callable potential `undefined`:**

```
Cannot invoke an object which is possibly 'undefined'.
```

```typescript
const LabComponent = getComponent(id)  // LabComponent: ComponentType | null
// Error: LabComponent cannot be called — it might be null
<LabComponent />  // Error
```

Fix: check for null before rendering:

```tsx
{LabComponent !== null && (
  <Suspense fallback={<LabLoader />}>
    <LabComponent />
  </Suspense>
)}
```

**Missing return type:**

```
Function lacks ending return statement and return type does not include 'undefined'.
```

```typescript
function getCategoryColor(category: string): string {
  if (category === 'math') return '#1565c0'
  // TypeScript: 'string' category might not be 'math' — returns undefined implicitly
}
```

Fix: add a default return or use `string | undefined` as the return type.

---

## Connect the Pieces

**Connection to lesson 023:** The type errors in migration are the same categories as the examples in `types-demo.ts`. Now they appear in real code and must be fixed.

**Connection to lesson 027:** The typed `Calculator.tsx` makes tests more reliable. Test helper functions (`render`, `fireEvent`) are typed; passing wrong props to the component in a test is a compile error, not a runtime failure.

**Connection to the real open-calc codebase:** The actual `Calculator.tsx` in `src/labs/` uses the same migration approach. TypeScript annotations in the production codebase were added one file at a time, with zero regressions at each step.

---

## What Breaks Without This

**Widening `as any` after `eval()`:**

```typescript
const result = eval(expression) as number  // Wrong: eval can return non-numbers
setExpression(String(result))
// If expression is "typeof 'hello'", eval returns "string" (a string), not a number
```

The cast `as number` tells TypeScript "trust me, this is a number." But `eval()` can return any type. Casting directly to `number` is wrong — use `unknown` first, then type-check, then use.

**`noUncheckedIndexedAccess` and array access:**

In `tsconfig.json`, the option `"noUncheckedIndexedAccess": true` makes `array[n]` return `T | undefined` instead of `T`. This finds all places where array access might fail. For this project with `"strict": true`, this option is not enabled (it is not included in `strict`), but it can be added for additional safety.

---

## Definition of Done

- [ ] `src/Calculator.tsx` exists (renamed from `.jsx`)
- [ ] All function parameters have explicit type annotations
- [ ] All state variables have explicit `useState<T>` generic parameters
- [ ] `isHistoryEntry` type predicate function exists for safe JSON loading
- [ ] `npx tsc --noEmit` reports zero errors for `Calculator.tsx`
- [ ] The calculator still works correctly in the browser after migration
- [ ] History persists to localStorage correctly after migration
- [ ] You can explain what a type predicate (`value is Type`) is and when to use it
- [ ] You can explain TypeScript's control flow analysis with a concrete example from this file
- [ ] You can explain when a type error reveals a real bug vs is a false positive
- [ ] Git commit:
    ```
    git add src/Calculator.tsx
    git commit -m "Migrate Calculator.jsx to Calculator.tsx with full type annotations

    All state: useState<string>, useState<boolean>, useState<HistoryEntry[]>.
    isHistoryEntry type predicate enables safe JSON parsing from localStorage.
    eval() result widened to unknown, narrowed before use.
    npx tsc --noEmit reports zero errors.
    Calculator behaviour is unchanged — zero regressions."
    ```
