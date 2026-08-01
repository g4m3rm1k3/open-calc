# SE Masterclass — LAB-37 — Reactive Spreadsheet

**Language: TypeScript (Browser)** — Module 3 begins: seven complete frontend systems, each combining everything from Modules 1–2.

**Prerequisites:** LAB-32 (signals — automatic dependency tracking), LAB-14 (cycle detection — a spreadsheet's dependency graph can have cycles too), LAB-10/11 (lexer/parser — formulas are expressions), and LAB-33 (components — rendering the grid).

**What this lab adds:**
- Cells as signals — exactly LAB-32's `createSignal`, one per grid cell
- Formula parsing: `=A1+B2` reusing LAB-10/11's tokenize/parse pipeline, extended with cell references
- Automatic dependency tracking BETWEEN CELLS — no manual "which cells does this formula depend on" bookkeeping, exactly LAB-32's `currentEffect` trick
- Circular reference detection — LAB-14's `detectCycle`, applied to spreadsheet cells instead of packages

**Time:** 110–130 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Cell `C1` contains `=A1+B1`. When `A1` changes, how does `C1` "know" to recalculate — who tells it?
> 2. Cell `A1` contains `=B1`, and `B1` contains `=A1`. What should happen when you try to set this up?
> 3. `C1 = A1 + B1`, and `D1 = C1 * 2`. If `A1` changes, does `D1` need to be told directly, or does it just follow from `C1` updating?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the browser shows a small spreadsheet grid, and DevTools console shows:

```
=== Cells as Signals ===
A1 = 10
B1 = 20
C1 formula: =A1+B1
C1 value: 30

=== Automatic Dependency Tracking ===
A1.set(100)
C1 value: 120   ← recalculated automatically — nothing told C1 to update
D1 formula: =C1*2
D1 value: 240   ← a formula depending on a FORMULA cell, also automatic

=== Circular Reference Detection ===
A1 = "=B1", B1 = "=A1"
Error: circular reference detected: A1 -> B1 -> A1

=== Multi-Level Dependency Chain ===
A1.set(5)
B1 (=A1+1): 6
C1 (=B1+1): 7
D1 (=C1+1): 8
  ← one change at the root propagated through 3 levels automatically
```

---

### Concept: Cells Are Signals, Formulas Are Effects

**What it is:** Each spreadsheet cell is exactly LAB-32's `createSignal` — a reactive value. A cell containing a FORMULA is a `createComputed` (LAB-32) whose function READS other cells' getters — and by reading them, it AUTOMATICALLY subscribes to them, exactly like LAB-32's `currentEffect` trick. No spreadsheet-specific "dependency tracking" code is needed beyond what LAB-32 already built.

**Project Application (The "Why" here):** This lab is not a new mechanism — it's LAB-32's exact signal/computed system, applied to a GRID of named cells instead of a handful of individually-named variables.

---

## Step 1 — A Grid of Cell Signals

```ts
// spreadsheet.ts
import { createSignal, createComputed } from './signals'

export type CellRef = string    // e.g. "A1"

interface Cell {
  raw: () => string                       // the LITERAL text the user typed: "10" or "=A1+B1"
  setRaw: (v: string) => void
  value: () => number                      // the COMPUTED numeric result
}

const cells = new Map<CellRef, Cell>()

export function getCell(ref: CellRef): Cell {
  if (!cells.has(ref)) {
    const [raw, setRaw] = createSignal('0')
    const value = createComputed(() => evaluateFormula(raw(), ref))
    cells.set(ref, { raw, setRaw, value })
  }
  return cells.get(ref)!
}

function evaluateFormula(raw: string, ownRef: CellRef): number {
  if (!raw.startsWith('=')) {
    return Number(raw) || 0                 // a plain number, LAB-01's Number() coercion
  }
  // formula parsing added in Step 2
  return 0
}
```

```ts
// main.ts
import { getCell } from './spreadsheet'

console.log('=== Cells as Signals ===')
const a1 = getCell('A1')
const b1 = getCell('B1')
a1.setRaw('10')
b1.setRaw('20')
console.log(`A1 = ${a1.raw()}`)
console.log(`B1 = ${b1.raw()}`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts   # or check the browser console, per this phase's Vite setup
```

**Expected:**
```
=== Cells as Signals ===
A1 = 10
B1 = 20
```

**Confirm each cell is created lazily, ONCE, and cached:** `getCell('A1')` called twice returns the SAME `Cell` object both times (the `cells.has(ref)` check) — exactly like a real spreadsheet doesn't recreate cell A1 every time a formula references it; it looks up the SAME underlying reactive cell.

---

## Step 2 — Parse and Evaluate Formulas

Reuse LAB-10's tokenizer and LAB-11's parser, extended with an `IDENTIFIER`-like `CELLREF` token (`A1`, `B2`, matching a letter-then-digits pattern) and a `CellRef` AST node type.

```ts
// formula-lexer.ts (extends LAB-10's tokenizer)
export function tokenizeFormula(input: string): { type: string; value: string }[] {
  const tokens: { type: string; value: string }[] = []
  let pos = 0
  while (pos < input.length) {
    const char = input[pos]
    if (char === ' ') { pos++; continue }
    if (/[A-Za-z]/.test(char)) {                          // ← add: a cell ref starts with a letter
      let start = pos
      while (pos < input.length && /[A-Za-z]/.test(input[pos])) pos++
      while (pos < input.length && /[0-9]/.test(input[pos])) pos++
      tokens.push({ type: 'CELLREF', value: input.slice(start, pos) })
      continue
    }
    if (/[0-9]/.test(char)) {
      let start = pos
      while (pos < input.length && /[0-9.]/.test(input[pos])) pos++
      tokens.push({ type: 'NUMBER', value: input.slice(start, pos) })
      continue
    }
    if ('+-*/'.includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char })
      pos++
      continue
    }
    throw new Error(`Unexpected character "${char}" in formula`)
  }
  tokens.push({ type: 'EOF', value: '' })
  return tokens
}
```

```ts
// formula-evaluator.ts — a simplified LAB-11/LAB-12, left-to-right for brevity (no operator precedence, to keep this lab focused)
import { tokenizeFormula } from './formula-lexer'
import { getCell } from './spreadsheet'

export function evaluateFormula(raw: string, ownRef: string): number {
  if (!raw.startsWith('=')) return Number(raw) || 0

  const tokens = tokenizeFormula(raw.slice(1))
  let result = 0
  let pendingOp = '+'

  for (const token of tokens) {
    let operandValue: number | null = null

    if (token.type === 'NUMBER') {
      operandValue = Number(token.value)
    } else if (token.type === 'CELLREF') {
      if (token.value === ownRef) throw new Error(`self-reference in ${ownRef}`)
      operandValue = getCell(token.value).value()          // ← THE KEY LINE: reading another cell's signal
    } else if (token.type === 'OPERATOR') {
      pendingOp = token.value
      continue
    } else {
      continue                                                // EOF
    }

    result = pendingOp === '+' ? result + operandValue
      : pendingOp === '-' ? result - operandValue
      : pendingOp === '*' ? result * operandValue
      : result / operandValue
  }
  return result
}
```

Update `spreadsheet.ts` to import `evaluateFormula` from the new file instead of the stub.

Add to `main.ts`:

```ts
const c1 = getCell('C1')
c1.setRaw('=A1+B1')
console.log(`C1 formula: ${c1.raw()}`)
console.log(`C1 value: ${c1.value()}`)
```

### SAVE AND TRY

**Expected:**
```
C1 formula: =A1+B1
C1 value: 30
```

**Confirm the "THE KEY LINE" comment is doing real work:** `getCell(token.value).value()` inside `evaluateFormula` calls `.value()` — which is a `createComputed`'s getter, which is ITSELF built on `createSignal`'s `get()` — meaning this call, happening WHILE `C1`'s own computed is being evaluated (so `currentEffect` is set to `C1`'s internal effect), causes `A1` and `B1`'s signals to automatically add `C1`'s effect as a subscriber. This is EXACTLY LAB-32's mechanism, with zero spreadsheet-specific tracking code added.

---

## Step 3 — Automatic Recalculation

```ts
console.log('\n=== Automatic Dependency Tracking ===')
console.log('A1.set(100)')
a1.setRaw('100')
console.log(`C1 value: ${c1.value()}   ← recalculated automatically — nothing told C1 to update`)

const d1 = getCell('D1')
d1.setRaw('=C1*2')
console.log(`D1 formula: ${d1.raw()}`)
console.log(`D1 value: ${d1.value()}   ← a formula depending on a FORMULA cell, also automatic`)
```

### SAVE AND TRY

**Expected:**
```
=== Automatic Dependency Tracking ===
A1.set(100)
C1 value: 120   ← recalculated automatically — nothing told C1 to update
D1 formula: =C1*2
D1 value: 240   ← a formula depending on a FORMULA cell, also automatic
```

**Confirm D1 depending on C1 (a FORMULA cell, not a raw value) still works correctly:** `D1`'s formula reads `C1.value()` — and `C1` is ITSELF a `createComputed`. LAB-32's signals don't care whether what they're reading is a "raw" signal or a "derived" one — `createComputed`'s return value IS a signal getter, so chaining formulas through other formulas just falls out of the SAME mechanism, no special case needed.

---

### Concept: Circular References — LAB-14's Cycle Detection, Applied to Cells

**What it is:** If `A1 = B1` and `B1 = A1`, there is no valid order to compute either — exactly LAB-14's dependency-graph cycle, just with spreadsheet cells as the "packages."

---

## Step 4 — Detect Circular References

```ts
// Add to spreadsheet.ts:
export function detectCircularReference(startRef: CellRef): string[] | null {
  const visiting = new Set<CellRef>()
  const visited = new Set<CellRef>()

  function extractRefs(raw: string): CellRef[] {
    if (!raw.startsWith('=')) return []
    const refs: CellRef[] = []
    const matches = raw.match(/[A-Za-z]+[0-9]+/g) || []
    return matches
  }

  function visit(ref: CellRef, path: CellRef[]): string[] | null {
    if (visited.has(ref)) return null
    if (visiting.has(ref)) return [...path, ref]          // LAB-14's exact cycle-detection shape

    visiting.add(ref)
    const cell = cells.get(ref)
    if (cell) {
      for (const dep of extractRefs(cell.raw())) {
        const cycle = visit(dep, [...path, ref])
        if (cycle) return cycle
      }
    }
    visiting.delete(ref)
    visited.add(ref)
    return null
  }

  return visit(startRef, [])
}
```

Add to `main.ts`:

```ts
import { detectCircularReference } from './spreadsheet'

console.log('\n=== Circular Reference Detection ===')
const circA = getCell('CircA')
const circB = getCell('CircB')
circA.setRaw('=CircB')
circB.setRaw('=CircA')
console.log(`A1 = "=B1", B1 = "=A1"`)

const cycle = detectCircularReference('CircA')
if (cycle) {
  console.log(`Error: circular reference detected: ${cycle.join(' -> ')}`)
}
```

### SAVE AND TRY

**Expected:**
```
=== Circular Reference Detection ===
A1 = "=B1", B1 = "=A1"
Error: circular reference detected: CircA -> CircB -> CircA
```

**Confirm this is LITERALLY LAB-14's algorithm:** `visiting`/`visited` two-state tracking, the `[...path, ref]` cycle-reporting, the recursive `visit` function — every piece is identical to LAB-14's `detectCycle`, with `extractRefs` (parsing cell references out of a formula string) as the ONLY spreadsheet-specific addition. A real spreadsheet application should run this check BEFORE committing a new formula, rejecting the edit with a clear error rather than letting `createComputed`'s effect recurse forever.

---

## 🎯 Challenge: Multi-Level Dependency Chain

**You know:** Each formula cell automatically tracks whatever it reads, and chains correctly through other formula cells (Step 3).

**Task:** Build a 4-level chain (`A1` raw, `B1 = A1+1`, `C1 = B1+1`, `D1 = C1+1`) and confirm changing `A1` alone correctly propagates all the way to `D1`.

<details>
<summary>▶ Show Solution</summary>

```ts
console.log('\n=== Multi-Level Dependency Chain ===')
const chainA = getCell('ChainA')
const chainB = getCell('ChainB')
const chainC = getCell('ChainC')
const chainD = getCell('ChainD')

chainB.setRaw('=ChainA+1')
chainC.setRaw('=ChainB+1')
chainD.setRaw('=ChainC+1')

console.log('A1.set(5)')
chainA.setRaw('5')
console.log(`B1 (=A1+1): ${chainB.value()}`)
console.log(`C1 (=B1+1): ${chainC.value()}`)
console.log(`D1 (=C1+1): ${chainD.value()}`)
console.log('  ← one change at the root propagated through 3 levels automatically')
```

**Key insight:** Nobody wrote "when A1 changes, also update B1, then C1, then D1" anywhere — each cell only knows about its OWN direct dependency (`B1` only reads `A1`; `C1` only reads `B1`; `D1` only reads `C1`). The FULL chain reaction — one change rippling through all four levels — emerges entirely from each cell's LOCAL, one-hop dependency tracking, exactly like LAB-32's Quick Check answer #3 about "should the effect still be listening" — the chain is just LAB-32's signal graph, four nodes deep instead of two.

</details>

### SAVE AND TRY

**Expected:**
```
=== Multi-Level Dependency Chain ===
A1.set(5)
B1 (=A1+1): 6
C1 (=B1+1): 7
D1 (=C1+1): 8
  ← one change at the root propagated through 3 levels automatically
```

---

## Mental Model: This IS How Google Sheets/Excel Work

| This lab | Real spreadsheets |
|---|---|
| `createSignal` per cell | Every cell is a reactive/observable value internally |
| `createComputed` for formula cells | Formula recalculation engines (Excel's "calculation chain") |
| Automatic dependency tracking via reads | Excel tracks "precedents"/"dependents" the same way — discovered from formula parsing |
| `detectCircularReference` | Excel's "Circular Reference Warning" |

---

## Final Check

| Feature | How to verify |
|---|---|
| Raw-value cells store and return numbers correctly | Step 1 |
| A formula cell correctly sums two other cells | Step 2 |
| Changing a dependency automatically recalculates dependent cells | Step 3 |
| A formula depending on ANOTHER formula cell also updates automatically | Step 3 |
| A circular reference is detected and reported with the exact cycle path | Step 4 |
| A 4-level dependency chain propagates a single root change through every level | Challenge |

---

## Quick Check Answers

**1. How does `C1` "know" to recalculate when `A1` changes?**

Nobody TELLS it — `C1`'s formula evaluation READ `A1.value()` while `C1`'s own computed effect was the `currentEffect` (LAB-32), which caused `A1`'s signal to automatically add `C1`'s effect to ITS subscriber list. When `A1.setRaw(...)` runs later, it notifies every subscriber it has — including `C1` — automatically, with no manually maintained "who depends on A1" list anywhere in this lab's code.

**2. `A1 = B1`, `B1 = A1` — what should happen?**

It should be REJECTED with a clear circular-reference error before it's ever allowed to actually run — demonstrated in Step 4, where `detectCircularReference` found and reported the exact cycle `CircA -> CircB -> CircA`. Without this check, `createComputed`'s effect would try to evaluate `A1`, which needs `B1`, which needs `A1` again — recursing forever with no base case, exactly the stack-overflow risk LAB-07 studied directly.

**3. `D1 = C1*2` when `A1` changes — does D1 need to be told directly?**

No — D1 only ever reads `C1`, and only NEEDS to know about `C1`. The Challenge demonstrated this precisely: a 4-level chain propagated correctly even though EACH cell's formula only referenced its own IMMEDIATE dependency, never anything further up the chain. The full propagation is an emergent property of many one-hop subscriptions chained together, not something any single cell needs to understand end-to-end.

---

*Next: [LAB-38 — Node Editor](LAB-38-node-editor.md) — TypeScript (Browser), same module*
