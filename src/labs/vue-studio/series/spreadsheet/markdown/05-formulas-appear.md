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

**Walkthrough — `.startsWith()` and `.slice()`, two string methods used together here for the first time:**

`someString.startsWith(prefix)` is a built-in string method that returns `true` or
`false`: does `someString` begin with exactly `prefix`? `'=A1+B1'.startsWith('=')` is
`true`; `'A1+B1'.startsWith('=')` is `false`. It checks the very start only —
`'x=y'.startsWith('=')` is also `false`, since the string doesn't begin with `=`.

`someString.slice(start)` returns a new string containing everything from index
`start` onward, leaving the original string untouched. `'=A1+B1'.slice(1)` skips
index `0` (the `=` character itself) and returns everything after it: `'A1+B1'`.
`slice` can also take a second argument (an end index, exclusive) to cut out a middle
section, but this project only ever needs "everything after position 1," so only one
argument is used. `trimmed.slice(1)` removes the leading `=`. The tag `kind: 'formula'` already communicates "this is a formula" — storing the `=` inside `expr` would be redundant.

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

**CS concept — `Cell` is a sum type; `Coordinate` is a product type. This is real type theory, not project jargon.** Every type this series has built falls into one of two families, and knowing which is which tells you immediately how many values a type can hold.

A **product type** — `Coordinate`, `CellStyle`, any `interface` with several required fields — needs *every* field simultaneously. The number of distinct `Coordinate` values is the number of possible `col`s *multiplied by* the number of possible `row`s (a "product," in the literal mathematical sense). Adding a field to a product type — say, a third field to `Coordinate` — *multiplies* the space of possible values.

A **sum type** — `Cell`, `Token`, `ExpressionNode`, `EvalResult` — needs *exactly one* of several alternatives. The number of distinct `Cell` values is the number of `'number'` cells *plus* the number of `'text'` cells *plus* the number of `'formula'` cells (a "sum"). Adding a variant to a sum type *adds* to the space of possible values, rather than multiplying it — which is exactly why `Cell` growing from two variants to three, in this very lesson, required exactly one new case per switch, not a combinatorial explosion of new cases.

This distinction is not TypeScript-specific — it's how type theory classifies every data type in every language with this feature. Rust calls sum types `enum`; Haskell and OCaml call them (unglamorously) "sum types" or "tagged unions" directly; Swift calls them `enum` too. `interface`/`struct`/`record` are the product-type side in each of those languages. Once you can look at any type and ask "does this need all of these fields at once, or exactly one of these shapes?", you can classify a type in a language you've never used before.

*Recognized elsewhere:* Redux's action types (`{ type: 'INCREMENT' } | { type: 'DECREMENT' }`) are a sum type dispatched through an exhaustive `switch`, the exact shape of this project's `Cell` and `displayCell`. Rust's `Option<T>` (`Some(value)` or `None`) and `Result<T, E>` (already named directly in Lesson 10) are sum types baked into the language. GraphQL's union types are sum types at the API-schema level. Every one of these gets the identical exhaustiveness question `assertNever` answers here: has every case been handled?

**A second, related CS concept — total versus partial functions.** A function is
**total** if it produces a valid result for every input its type allows; it is
**partial** if some allowed inputs can make it fail or return something meaningless.
Before Step 3's `assertNever`, `displayCell` was secretly partial — the type
signature promised a `string` for any `Cell`, but a `Cell` variant the `switch`
didn't handle would fall through and actually return `undefined`, breaking that
promise silently. `assertNever` doesn't make the underlying problem (an unhandled
case) go away — it converts a silently partial function into one that is honestly
total in a different sense: total in that *every* input path is accounted for, either
with a real answer or a compiler error demanding one. This is the same standard
real functional languages hold `match`/`switch` expressions to by default — Rust's
compiler refuses to build code with a non-exhaustive `match`, no `assertNever`
required, because the language treats what this project hand-builds as a mandatory
rule instead of an opt-in convention.

**This is technical debt being paid down structurally, before it accrues — a real
Agile/engineering distinction worth naming precisely.** A silently-missed switch case
is exactly the kind of bug real teams call technical debt: it costs nothing today,
compiles fine, ships fine, and becomes a production incident months later when someone
adds a fifth `Cell` variant under sprint pressure and forgets `displayCell` even
exists. Two teams could ship the identical feature today; one pays a five-minute cost
now (`assertNever`, once), the other accepts an invisible, compounding risk that a
future team member inherits with no warning. Naming the trade-off explicitly — "we
are choosing to spend five minutes now to remove a whole category of future bug" — is
the actual skill; `assertNever` is just the mechanism.

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
- [ ] You can explain the difference between a sum type and a product type, and classify `Coordinate` and `Cell` correctly without looking back
- [ ] You can explain what makes a function partial versus total, using `displayCell` before and after `assertNever` as the example

---

*Next: Lesson 06 — Tokenizing a Formula. `=A1+B2*5` is still just a string as far as this project is concerned — one string of characters with no understood structure. Lesson 06 changes that: building the first stage of a real interpreter that reads a formula character by character and produces a structured list of meaningful pieces.*
