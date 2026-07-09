# Vue Spreadsheet — Lesson 05 — Formulas Appear

## What you will build

Type `=A1+B1` into a cell and it is stored as a formula — a distinct shape, displayed with its leading `=` restored. It does not compute anything yet; that is the job of lessons 06–08. What this lesson builds is the moment `Cell` grows a third shape, and you learn the one pattern that prevents `switch` statements from silently missing new cases as the type grows.

```
    A       B       C
1 | 10   | 20   | =A1+B1 |   ← C1 shows "=A1+B1", not "30" yet
```

---

## What you need to know first

Lesson 04 left `Cell` as a two-variant discriminated union — `{ kind: 'number' }` or `{ kind: 'text' }` — with `parseRawInput` deciding which one a typed string becomes, and `displayCell` turning either back into text via a `switch` on `cell.kind`.

---

## Step 1 — A third shape

**The problem:** `parseRawInput` has no way to recognise that `=A1+B1` means something different from ordinary text.

Update `Cell` in `<script setup>`:

```typescript
type Cell =
  | { kind: 'number';  value: number }
  | { kind: 'text';    value: string }
  | { kind: 'formula'; expr: string  }
```

Update `parseRawInput`:

```typescript
function parseRawInput(rawInput: string): Cell {
  const trimmed = rawInput.trim()

  if (trimmed.startsWith('=')) {
    return { kind: 'formula', expr: trimmed.slice(1) }
  }

  const numericValue = Number(trimmed)
  if (trimmed !== '' && !Number.isNaN(numericValue)) {
    return { kind: 'number', value: numericValue }
  }

  return { kind: 'text', value: rawInput }
}
```

**Walkthrough — `{ kind: 'formula'; expr: string }`:**

The third variant uses a different field name than the others: `expr` instead of `value`. This is intentional. A formula does not *have* a value yet — it has an expression that will produce a value once the evaluator (lesson 08) runs. Using a different field name makes this distinction visible in the type.

`trimmed.slice(1)` removes the leading `=`. The tag `kind: 'formula'` already communicates "this is a formula" — storing the `=` inside `expr` would be redundant.

**Why check `startsWith('=')` before the number check:**

Swap the order in your mind. `=A1` reaches `Number('=A1')`, which is `NaN`. The number check fails — good. But then it falls through to `{ kind: 'text', value: '=A1' }`. The formula is silently stored as plain text, forever, with no error anywhere. The `startsWith('=')` check must come first.

Run this throwaway to see all three cases:

```vue
<script setup lang="ts">
type Cell =
  | { kind: 'number';  value: number }
  | { kind: 'text';    value: string }
  | { kind: 'formula'; expr: string  }

function parseRawInput(rawInput: string): Cell {
  const trimmed = rawInput.trim()
  if (trimmed.startsWith('=')) return { kind: 'formula', expr: trimmed.slice(1) }
  const n = Number(trimmed)
  if (trimmed !== '' && !Number.isNaN(n)) return { kind: 'number', value: n }
  return { kind: 'text', value: rawInput }
}

const tests = ['42', 'hello', '=A1+B1', '=SUM(A1:A10)', '', '12abc']
const parsed = tests.map(t => ({ input: t, cell: parseRawInput(t) }))
</script>
<template>
  <table>
    <tr v-for="p in parsed" :key="p.input">
      <td>"{{ p.input }}"</td>
      <td>→ kind: {{ p.cell.kind }}</td>
    </tr>
  </table>
</template>
```

Verify: `'42'` → number, `'hello'` → text, `'=A1+B1'` → formula, `''` → text, `'12abc'` → text.

---

## Step 2 — Update `displayCell`

**The problem:** `displayCell`'s `switch` handles two cases. `Cell` now has three.

Update `displayCell`:

```typescript
function displayCell(cell: Cell | undefined): string {
  if (!cell) return ''

  switch (cell.kind) {
    case 'number':
      return cell.value.toString()
    case 'text':
      return cell.value
    case 'formula':
      return '=' + cell.expr
  }
}
```

Click ▶ Run. Type `=A1+B1` into a cell — it shows `=A1+B1`. Type `42` into another — shows `42`. Nothing computes yet; the formula is stored and displayed, not evaluated.

**Before moving on — try this deliberately:**

Comment out the `case 'formula':` line and its `return`. Leave only `'number'` and `'text'`. Click ▶ Run. Does TypeScript warn you?

It depends on your strictness settings. In many configurations, no error appears — the function compiles silently. A real `formula` cell would now silently fall through the switch and return `undefined` at runtime, which is a bug with no editor warning. This is a real gap in TypeScript's switch analysis under default settings.

This gap is why Step 3 exists. Restore the `'formula'` case before continuing.

---

## Step 3 — `assertNever`: ask the exhaustiveness question directly

**The problem:** A `switch` that silently misses a new union variant is a real, reproducible bug. The current `displayCell` has no protection against it.

Add to `<script setup>`:

```typescript
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)
}
```

Update `displayCell` to add a `default` case:

```typescript
function displayCell(cell: Cell | undefined): string {
  if (!cell) return ''

  switch (cell.kind) {
    case 'number':
      return cell.value.toString()
    case 'text':
      return cell.value
    case 'formula':
      return '=' + cell.expr
    default:
      return assertNever(cell)
  }
}
```

**Walkthrough — `never`, the type with no possible values:**

`never` means: a value that can genuinely never exist. `assertNever(value: never)` is a function that only accepts a value TypeScript has already *proven* is impossible.

Inside the `switch`, by the time control reaches `default`, TypeScript has already ruled out `'number'`, `'text'`, and `'formula'` — every real variant has its own `case`. Whatever theoretically remains — having survived all three cases — is `never`. TypeScript lets you pass `cell` to `assertNever` specifically because it can prove, statically, that this line is unreachable when `Cell` has exactly these three shapes.

**Now delete `case 'formula':` but keep `default: return assertNever(cell)`.** Monaco immediately shows an error on `cell` inside `assertNever(cell)`:

> *Argument of type '{ kind: "formula"; expr: string }' is not assignable to parameter of type 'never'.*

TypeScript is saying: "a `formula` cell could reach this line — so it is not impossible — so you cannot pass it to a function that demands the impossible." The compiler is telling you directly that you missed a case. Restore `'formula'` before continuing.

**Run this throwaway to feel `never` more directly:**

```vue
<script setup lang="ts">
function assertNever(value: never): never {
  throw new Error(`Unexpected: ${JSON.stringify(value)}`)
}

type Direction = 'north' | 'south' | 'east' | 'west'

function describe(d: Direction): string {
  switch (d) {
    case 'north': return 'up'
    case 'south': return 'down'
    case 'east':  return 'right'
    case 'west':  return 'left'
    default:      return assertNever(d)   // d is 'never' here — all cases covered
  }
}

// Now add a fifth variant to Direction:
// type Direction = 'north' | 'south' | 'east' | 'west' | 'up'
// Monaco immediately underlines assertNever(d):
//   Argument of type '"up"' is not assignable to parameter of type 'never'
// TypeScript refuses to compile until 'up' gets its own case.
</script>
<template>
  <p>{{ describe('north') }} — {{ describe('east') }}</p>
</template>
```

Uncomment the extended `Direction` type. TypeScript catches the missing case before ▶ Run. This is what `assertNever` gives you: adding a variant to a union forces you to update every switch over it. The exhaustiveness check travels with the code, not with a person's memory.

**SE concept — why this matters as a project grows:**

Right now, `displayCell` is the only function that switches over every `Cell` variant. Lesson 08's evaluator, future error handling, and future formatting code will each need their own exhaustive switch. `assertNever` in a `default` case is a small, one-line insurance policy: the day a fourth `Cell` variant is added, every switch using this pattern will refuse to compile until it is updated. The protection scales linearly — zero extra effort per new switch, guaranteed completeness for all of them.

---

## What the formula variant means for the edit input

When a formula cell (`kind: 'formula'`) is opened for editing, `displayCell(cells[cellId({ col, row })])` returns `'=A1+B1'` — the full text with the `=` sign. The input shows `=A1+B1`. When the user commits, `parseRawInput('=A1+B1')` recognises the leading `=` and returns `{ kind: 'formula', expr: 'A1+B1' }`. The round-trip is correct.

No template change is needed. The two calls to `displayCell` in the template — one for the input's `:value`, one for the text display — both handle formulas automatically.

---

## What breaks without this

**Removing `startsWith('=')` check and checking number first:**

Type `=A1+B1`. `Number('=A1+B1')` is `NaN`. Number check fails. Falls through to `{ kind: 'text', value: '=A1+B1' }`. The formula is stored as plain text. Lessons 06–08 can never evaluate it. No error anywhere.

**Removing `assertNever` from `displayCell` and adding a fourth Cell variant:**

```typescript
type Cell =
  | { kind: 'number';  value: number }
  | { kind: 'text';    value: string }
  | { kind: 'formula'; expr: string  }
  | { kind: 'error';   message: string }  // new in lesson 09
```

Without `assertNever`, `displayCell` compiles silently with only three cases. A real `error` cell falls through the switch and returns `undefined`. The template shows nothing and you receive no warning — just a silent blank cell where an error message should appear.

With `assertNever`, adding `{ kind: 'error' }` immediately shows:

> *Argument of type '{ kind: "error"; message: string }' is not assignable to parameter of type 'never'*

TypeScript refuses to compile until `displayCell` handles `'error'`.

---

## Connect the pieces

```
App.vue
  <script setup>
    type Cell              — now three variants: number, text, formula
    parseRawInput()        — checks startsWith('=') before number check
    assertNever()          — parameter: never; called in switch default
    displayCell()          — switch + default: assertNever(cell)
                             restores '=' for formula display
  <template>
    no changes — displayCell handles the formula case automatically
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] Typing `=A1+B1` stores a formula and displays `=A1+B1` in the cell
- [ ] Reopening a formula cell shows `=A1+B1` ready to edit
- [ ] Typing a number or text still works as before
- [ ] Removing `case 'formula':` from `displayCell` with `assertNever` in `default` produces an immediate TypeScript error
- [ ] You can explain what `never` means and why `assertNever(value: never)` only accepts a value TypeScript proves is impossible
- [ ] You can explain why the `startsWith('=')` check must come before the number check in `parseRawInput`
- [ ] You can add a fourth `Cell` variant and watch TypeScript force you to update `displayCell`

---

*Next: Lesson 06 — Tokenizing a Formula. `=A1+B2*5` is still just a string as far as this project is concerned — one string of characters with no understood structure. Lesson 06 changes that: building the first stage of a real interpreter that reads a formula character by character and produces a structured list of meaningful pieces.*
