# Vue Spreadsheet — Lesson 14 — Testing: Proving the Pure Functions Are Right

## What you will build

A results panel below the grid: a scrollable list of every test this lesson writes, each with a ✓ or ✗, a running "N / M passing" count, and — for any failure — the exact expected value versus what actually came back. Every pure function this series has built since Lesson 01 gets tests: `columnLetter`, `cellId`, `tokenize`, `parse` + `evaluate` together, `formatNumber`. Then, deliberately, one working function gets broken, and you watch a test that was passing turn red — the single most useful thing a test suite does, made visible on purpose.

```
Tests: 11 / 12 passing

✓ columnLetter(0) is 'A'
✓ columnLetter(25) is 'Z'
✓ cellId at F10
✓ tokenize a single number
✗ tokenize handles multi-digit numbers
    expected [{"type":"number","value":52}], got [{"type":"number","value":5},{"type":"number","value":2}]
✓ evaluates simple arithmetic
...
```

---

## What you need to know first

Nothing beyond Lessons 01–13 of this series. This lesson tests functions already built: `columnLetter` and `cellId` (Lesson 01), `tokenize` (Lesson 06), `parse` and `evaluate` (Lessons 07–09), `formatNumber` (Lesson 13). If you don't remember one of them precisely, its own lesson is named at the point this lesson reuses it.

---

## Concept: why pure functions are what you test first

Every function this project has built has been sorted into one of two kinds since Lesson 01: **pure functions** — same input, same output, no side effects — and everything else (functions that read or write `ref`s, functions tangled up with the DOM). Pure functions are, deliberately, the *easiest possible thing to test*: call one with an input, check what comes back, done. No setup. No mocking Vue's reactivity. No simulating a click. No cleanup afterward, because nothing was ever changed. This project has been quietly building an enormous pile of testable code since Lesson 01, one small pure function at a time, without ever once being asked to test any of it — this lesson is where that investment gets cashed in.

**Why this couldn't happen earlier, and why it can happen now without a single new tool:** Vue Studio has no terminal, no `npm install`, and therefore no real test runner installed — Vitest, the real tool a production Vue project uses for this, is an `npm` package, and package management is deliberately deferred to this series' "Leaving the Sandbox" arc, not introduced early. That does not mean testing itself has to wait. Testing is a *practice* — call a function, check the result, record whether it matched — and a practice can be built by hand, in about fifteen lines, using nothing but functions and objects this series has already taught. This lesson builds that fifteen-line harness once, uses it for the rest of the lesson, and explicitly shows you, at the end, what the same tests look like written against the real Vitest — so the leap to a real project later is "same idea, different syntax," not "an entirely new skill."

---

## Concept Lab — a hand-built test harness, proven on a disposable function first

**The problem:** Before testing this project's real functions, the testing *mechanism itself* — what does "run a test" even mean, mechanically — needs to exist and be understood, on something with zero spreadsheet complexity attached.

Run this throwaway first — a function about dogs, not cells, exactly the disposable-host convention this series has used since Lesson 01's `Dog`/`MathHelper` example:

```vue
<script setup lang="ts">
function bark(volume: number): string {
  return volume > 5 ? 'WOOF' : 'woof'
}

interface TestResult {
  readonly description: string
  readonly passed: boolean
  readonly detail?: string
}

const results: TestResult[] = []

function test(description: string, run: () => void): void {
  try {
    run()
    results.push({ description, passed: true })
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    results.push({ description, passed: false, detail })
  }
}

function expectEqual<T>(actual: T, expected: T): void {
  const same = JSON.stringify(actual) === JSON.stringify(expected)
  if (!same) {
    throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

test('quiet bark is lowercase', () => expectEqual(bark(3), 'woof'))
test('loud bark is uppercase', () => expectEqual(bark(9), 'WOOF'))
test('this one is deliberately wrong', () => expectEqual(bark(9), 'woof'))
</script>
<template>
  <ul>
    <li v-for="r in results" :key="r.description">
      {{ r.passed ? '✓' : '✗' }} {{ r.description }}
      <span v-if="!r.passed">— {{ r.detail }}</span>
    </li>
  </ul>
</template>
```

Click ▶ Run. Two lines show ✓. The third shows ✗, with the exact message `expected "woof", got "WOOF"`.

**Walkthrough — `test(description, run)`, what "running a test" actually means:**

`test` takes two things: a human-readable `description` (a **string** — a sentence describing what should be true) and `run` — a **callback**, the same "function handed over to be called later" idea from Lesson 03's `:ref` — containing the actual check. `test` calls `run()` immediately, wrapped in `try`/`catch` (Lesson 06). If `run()` completes with no `throw`, the test passed — `test` records `{ description, passed: true }`. If anything inside `run()` throws, `catch` catches it, reads the thrown error's `.message` (the same `instanceof Error` pattern from Lesson 07's parser boundary), and records `{ description, passed: false, detail }`. `test` never inspects *what* the test was checking — it only cares whether `run()` finished quietly or threw. This is the entire mechanism every test framework in every language is built on, underneath whatever syntax sits on top: **run some code; did it throw; record the outcome.**

**Walkthrough — `expectEqual<T>(actual, expected)`, an assertion:**

An **assertion** is a statement that must be true, checked at a specific point in code — if it isn't, execution stops there with a clear signal, rather than continuing on top of a wrong assumption. `expectEqual` is this project's own assertion function: it compares `actual` against `expected` using `JSON.stringify` on both sides (the same serialization already used throughout this series' debug panels) rather than `===`, specifically because `===` on two objects or arrays checks *identity* (are these literally the same object in memory), which would make `expectEqual({ a: 1 }, { a: 1 })` incorrectly fail — two different objects that happen to contain identical data are, for testing purposes, equal, even though `{ a: 1 } === { a: 1 }` is `false` in plain JavaScript. Comparing their `JSON.stringify` output sidesteps this: two structurally identical values produce identical strings, and strings *do* compare correctly with `===`.

`<T>` is the same generic-type-parameter idea as `Record<K, V>` and `Array<T>` from earlier lessons, applied to a function this time: `expectEqual<T>(actual: T, expected: T)` says "these two arguments must be the *same* type as each other, whatever that type turns out to be at the call site" — `expectEqual(5, 5)` infers `T` as `number`; `expectEqual('a', 'a')` infers `T` as `string`. This is what stops you from accidentally writing `expectEqual(cellId({ col: 0, row: 0 }), 42)` — comparing a `string` against a `number` — as a compile error, before the test even runs.

**Walkthrough — why the failure message says exactly what it says:**

`` `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}` `` is not an incidental detail — it is the single most important design decision in this entire harness, and it deserves its own lens.

**The Design lens — a test failure message is a user interface, and its user is you at 2am.** A test framework's *only* job, the instant something fails, is answering one question as fast as possible: what did I expect, and what did I actually get? A framework that just says "test failed" forces you to re-read the test, add `console.log`s, and re-run — every failure costs minutes. A framework that states both values, side by side, in the failure itself, answers the question immediately, in the same glance that told you something was wrong. This is **error message design**, a real, specific discipline (the same family of thinking behind Lesson 07's parse-error messages naming the exact unexpected token) — and it applies here with extra force, because the *user* reading this message is a developer under pressure, possibly you, months from now, having forgotten exactly how this function works. Every professional test framework — Vitest, Jest, JUnit — invests heavily in exactly this: showing a rich, colored diff between expected and actual, not just a boolean.

**This lab is now finished.** `bark`, and this exact copy of `test`/`expectEqual`/`TestResult`, are deleted and will not appear in the project again — but the real versions, built next, are line-for-line the same code, applied to real functions instead of a disposable dog.

---

## Step 1 — The real harness, and a visible results panel

**The problem:** The project needs its own `test`/`expectEqual`/`TestResult`, reactive this time (so results show in the live preview, not just a throwaway `<ul>`), and a place on screen for them to appear — per this series' Agile Delivery rule since Lesson 01: a lesson that changes code with no visible result is not a vertical slice.

Add to `<script setup>`:

```typescript
import { ref, computed } from 'vue'

interface TestResult {
  readonly description: string
  readonly passed: boolean
  readonly detail?: string
}

const testResults = ref<TestResult[]>([])

function test(description: string, run: () => void): void {
  try {
    run()
    testResults.value.push({ description, passed: true })
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    testResults.value.push({ description, passed: false, detail })
  }
}

function expectEqual<T>(actual: T, expected: T): void {
  const same = JSON.stringify(actual) === JSON.stringify(expected)
  if (!same) {
    throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

const passCount = computed(() => testResults.value.filter(r => r.passed).length)
```

Add to `<template>`, below the grid:

```html
<div class="test-results">
  <h3>Tests: {{ passCount }} / {{ testResults.length }} passing</h3>
  <ul>
    <li v-for="r in testResults" :key="r.description" :class="r.passed ? 'pass' : 'fail'">
      <span class="icon">{{ r.passed ? '✓' : '✗' }}</span>
      {{ r.description }}
      <div v-if="!r.passed" class="detail">{{ r.detail }}</div>
    </li>
  </ul>
</div>
```

Add to `<style>`:

```css
.test-results {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  max-width: 500px;
  font-family: monospace;
  font-size: 0.8rem;
}
.test-results h3 { margin-bottom: 0.5rem; font-size: 0.8rem; }
.test-results ul { list-style: none; }
.test-results li.pass .icon { color: #16a34a; }
.test-results li.fail .icon { color: #dc2626; }
.test-results .detail {
  margin: 2px 0 6px 1.25rem;
  color: #dc2626;
  font-size: 0.75rem;
}
```

**Walkthrough — `testResults.value.filter(r => r.passed).length`, a third array method:**

`.filter(predicateFn)` — a **predicate** is a function that returns `true` or `false` — returns a *new* array containing only the items `predicateFn` returned `true` for, in the same relative order, leaving the original untouched. This is the third array-transformation method this series has built on top of, alongside `.map` (Lesson 01, transform each item) and `Array.from` (Lesson 01, build from a length): `.filter` selects a subset instead of transforming every item. `passCount` is a `computed` (Lesson 06) — it recomputes automatically every time `testResults.value` changes, so the count in the heading never needs a manual update anywhere `test()` is called.

**The Design lens — why `.pass`/`.fail` are set via `:class`, and monospace again:**

Green for pass, red for fail is not just decoration — it is the same **"never rely on one signal alone"** principle from Lesson 02's selection state, applied here to a different pairing: the ✓/✗ *character* carries the information for anyone who can't distinguish the colors (or is reading a black-and-white terminal-style rendering), and the color reinforces it for everyone else, redundantly. `font-family: monospace` on the whole panel is Lesson 06's debug-panel convention again — this is diagnostic tool output, not spreadsheet data, and monospace signals that at a glance, consistently, everywhere this series uses it.

---

## Step 2 — Test `columnLetter` and `cellId`, in an escalating sequence

**The problem:** `columnLetter` and `cellId` (Lesson 01) have run correctly, by inspection, since the very first lesson — but "I looked at it and it seemed right" is not the same claim as "this is checked, every time, automatically."

Add to `<script setup>`, after the harness:

```typescript
test('columnLetter(0) is A', () => {
  expectEqual(columnLetter(0), 'A')
})

test('columnLetter(5) is F', () => {
  expectEqual(columnLetter(5), 'F')
})

test('columnLetter(25) is Z — the alphabet boundary', () => {
  expectEqual(columnLetter(25), 'Z')
})

test('cellId at the origin is A1', () => {
  expectEqual(cellId({ col: 0, row: 0 }), 'A1')
})

test('cellId at F10', () => {
  expectEqual(cellId({ col: 5, row: 9 }), 'F10')
})
```

Click ▶ Run. Five green checks appear in the results panel — nothing about the grid changed; these tests run purely for their side effect of pushing into `testResults`.

**Incremental practice, named explicitly:** these five tests are not arbitrary — they escalate deliberately, the same "small, deliberately varied inputs" discipline Lesson 01's contract-level convention requires for any new construct exercised against real input. `columnLetter(0)` checks the simplest case. `columnLetter(5)` checks a value in the middle of this project's actual 6-column grid. `columnLetter(25)` checks `'Z'` — the alphabet's boundary, a value `columnLetter` supports even though this project's grid never uses a column that high, precisely the kind of edge case a quick glance at the function wouldn't prompt you to check by hand, but a written test costs nothing to include.

**Why these run at the top level of `<script setup>`, not inside a function:**

Every earlier `test(...)` call in this file executes once, immediately, the moment this component's `<script setup>` runs top to bottom (Lesson 01's execution-order diagram) — not on a click, not inside a `computed`. This is deliberate: tests should run automatically, every time, without anyone remembering to trigger them. A test suite that has to be manually invoked is a test suite someone eventually forgets to run.

---

## Step 3 — Test `tokenize`, and watch a real regression get caught

**The problem:** `tokenize` (Lesson 06) is where this project's own "What breaks without this" section already predicted a real bug — multi-digit numbers accidentally becoming multiple single-digit tokens — without ever mechanically proving it wouldn't happen.

Add to `<script setup>`:

```typescript
test('tokenize a single-digit number', () => {
  expectEqual(tokenize('5'), [{ type: 'number', value: 5 }])
})

test('tokenize handles multi-digit numbers as one token', () => {
  expectEqual(tokenize('52'), [{ type: 'number', value: 52 }])
})

test('tokenize a cell reference', () => {
  expectEqual(tokenize('A1'), [{ type: 'cell', name: 'A1' }])
})

test('tokenize an operator expression', () => {
  expectEqual(tokenize('A1+B2'), [
    { type: 'cell', name: 'A1' },
    { type: 'operator', value: '+' },
    { type: 'cell', name: 'B2' },
  ])
})
```

Click ▶ Run. Four more green checks.

**Now, deliberately, break `tokenize`.** Find the inner `while` loop that accumulates multi-digit numbers:

```typescript
if (isDigit(character)) {
  let numberText = ''
  while (position < expr.length && (isDigit(expr[position]) || expr[position] === '.')) {
    numberText += expr[position]
    position++
  }
  tokens.push({ type: 'number', value: Number(numberText) })
  continue
}
```

Comment out the inner `while` loop's condition so it only ever runs once (or simply delete the `while` and keep just the first character):

```typescript
if (isDigit(character)) {
  tokens.push({ type: 'number', value: Number(character) })
  position++
  continue
}
```

Click ▶ Run. Watch the results panel: `tokenize handles multi-digit numbers as one token` turns ✗, with the message `expected [{"type":"number","value":52}], got [{"type":"number","value":5},{"type":"number","value":2}]`. Every other test — including `tokenize a single-digit number`, which never exercised the multi-digit path — still passes.

**This is the entire point of this lesson, made visible, not just claimed.** Lesson 06's "What breaks without this" section described this exact failure in prose: *"`'52'` produces two tokens... The formula `=52+1` would be silently interpreted as `5+2+1=8`, not `52+1=53`."* That was a prediction. This is the same bug, actually reproduced, actually caught, with the exact wrong output shown in the failure message — not by careful manual re-reading of `tokenize`, but automatically, the instant ▶ Run executed, by a test written *before* the bug existed. **Restore the correct `while` loop before continuing** — revert your change and confirm all tests pass again.

**Recognized elsewhere:** this exact workflow — a change silently breaks something, and a test that already existed catches it immediately — is what "regression testing" means as a term, and it is the single reason continuous integration (automatically running a test suite on every change, covered in this series' "Leaving the Sandbox" arc) exists as standard practice at nearly every real software company. A test suite is not primarily about proving new code correct on the day it's written — it's about catching the day, months later, when someone (possibly an AI coding agent making a change on your behalf) touches something nearby and breaks this without meaning to.

---

## Step 4 — Test `parse` and `evaluate` together, cashing in Lesson 09's design decision

**The problem:** `evaluate` needs a `lookupCell` function to resolve cell references — in the real app, that function reads live `cells.value`. A test has no `cells.value`, no Vue component, no reactive state at all.

Add to `<script setup>`:

```typescript
function mockLookup(knownValues: Record<string, number>): (name: string) => EvalResult {
  return (name) => ({ kind: 'ok', value: knownValues[name] ?? 0 })
}

test('evaluates arithmetic with correct precedence', () => {
  const parseResult = parse(tokenize('10+5*2'))
  if (parseResult.success === false) throw new Error('parse failed')
  const result = evaluate(parseResult.ast, mockLookup({}))
  expectEqual(result, { kind: 'ok', value: 20 })
})

test('resolves cell references through evaluate', () => {
  const parseResult = parse(tokenize('A1+B1'))
  if (parseResult.success === false) throw new Error('parse failed')
  const result = evaluate(parseResult.ast, mockLookup({ A1: 5, B1: 10 }))
  expectEqual(result, { kind: 'ok', value: 15 })
})

test('a malformed formula fails to parse', () => {
  const parseResult = parse(tokenize('10+'))
  expectEqual(parseResult.success, false)
})
```

Click ▶ Run. Three more green checks — including `evaluate`, running with zero Vue, zero `cells` ref, zero component in sight.

**This is the moment Lesson 09 was written for.** Its own walkthrough said, directly: *"Passing `lookupCell` as a parameter keeps `evaluate` testable in isolation... you cannot unit-test `evaluate` in isolation [if it closed over `cells.value` directly]."* Five lessons later, that design choice is exactly why `mockLookup({ A1: 5, B1: 10 })` — a plain function, built in two lines, with no relationship to this project's real reactive state — is a completely legitimate stand-in. **Dependency injection**, named explicitly back in Lesson 09, is not an abstract principle paid lip service to — this test is the concrete payoff: the dependency (`lookupCell`) was injected instead of reached for, so a fake one slots in perfectly for testing, and `evaluate` never has to know the difference.

**Walkthrough — `mockLookup`, a function that returns a function:**

`mockLookup(knownValues)` doesn't do the lookup itself — it *returns* a new function (an arrow function, closing over `knownValues` — Lesson 07's closures, again, a new facet: here the closure is the entire point, not an implementation detail) that performs the lookup when later called. This lets each test configure its own tiny, fake "spreadsheet" — `{ A1: 5, B1: 10 }` — without touching anything real. A **mock**, in testing vocabulary generally, is exactly this: a fake stand-in for a real dependency, built specifically to make a test possible, discarded after.

---

## Step 5 — Test `formatNumber`

**The problem:** `formatNumber` (Lesson 13) has three branches (`plain`, `currency`, `percentage`) and an `assertNever` guard — a small, exhaustive, pure function, exactly the shape this lesson's harness is built for.

Add to `<script setup>`:

```typescript
test('formatNumber leaves plain numbers as-is', () => {
  expectEqual(formatNumber(42, 'plain'), '42')
})

test('formatNumber formats currency to two decimals', () => {
  expectEqual(formatNumber(5, 'currency'), '$5.00')
})

test('formatNumber formats percentage', () => {
  expectEqual(formatNumber(0.15, 'percentage'), '15%')
})
```

Click ▶ Run. The results panel now shows every test from this lesson — roughly fifteen — with a running pass count at the top.

---

## The Design lens, restated at scale: what this panel would need to become a real tool

Fifteen tests fit comfortably in a short scrollable list. A real project accumulates hundreds. The design that works here — a flat list, icon plus description plus inline failure detail — would start to fail at that scale: finding *which* of four hundred tests failed after a bad change becomes a scroll-and-scan problem. Real test-runner UIs (Vitest's own terminal output, its browser UI) solve this with grouping (tests nested under the file or function they cover), filtering (show only failures), and a persistent summary that doesn't require scrolling to see. None of that is built here — naming it is the point: a design that is correct for fifteen items is not automatically correct for four hundred, and knowing where a design's assumptions stop holding is as much a skill as building the design in the first place.

---

## What breaks without this

**Removing the `try/catch` from `test`:**

The moment any single test's `run()` throws, the throw escapes `test` entirely — uncaught, it propagates out of `<script setup>` itself. Every test after the first failure never runs at all, and Vue logs an unhandled component error. One broken test currently shows one ✗ and fourteen ✓ around it; without the `try/catch`, one broken test would silently cancel all fifteen.

**Using `actual === expected` instead of comparing `JSON.stringify` output:**

`expectEqual(tokenize('A1'), [{ type: 'cell', name: 'A1' }])` would fail *every time*, even when `tokenize` is completely correct — two structurally identical but distinct array objects are never `===` to each other in JavaScript. Every test comparing an array or object (which is most of them, in this lesson) would report a false failure, making the entire suite worthless.

**Writing tests that call `test()` inside a `function`, never invoked at the top level:**

If Step 2's tests were wrapped in `function runTests() { test(...); test(...) }` without ever calling `runTests()`, nothing would happen — the function is defined, never called, and `testResults` stays empty forever. The results panel would show `0 / 0 passing` — not a failure, just silence, which is arguably worse: nothing visibly wrong, and no evidence anything was ever checked.

---

## Connect the pieces

```
App.vue
  <script setup>
    interface TestResult    — { description, passed, detail? }
    testResults              ref<TestResult[]>([])
    test()                   — runs a callback; try/catch; pushes a TestResult
    expectEqual<T>()         — assertion; JSON.stringify comparison; throws on mismatch
    mockLookup()             — returns a fake lookupCell for testing evaluate in isolation
    ~15 test() calls         — run once, top to bottom, when <script setup> executes
    passCount                — computed; filters testResults for passed
  <template>
    .test-results panel      — v-for over testResults; ✓/✗ icon; inline failure detail
```

---

## Definition of done

Click ▶ Run and verify:

- [ ] The results panel shows every test from this lesson with a running pass count
- [ ] Deliberately breaking `tokenize`'s multi-digit accumulation turns exactly one test red, with a failure message showing the wrong token array — then restoring the code turns it green again
- [ ] You can explain why `JSON.stringify` comparison is used instead of `===` for `expectEqual`
- [ ] You can explain why `evaluate` can be tested with zero Vue state in scope, and which earlier lesson's design decision made that possible
- [ ] You can explain what a mock is, using `mockLookup` as the example
- [ ] You can write one new test for a function this lesson didn't cover (`displayCell`, `styleFor`, or `parseRawInput`) and watch it pass

---

## What this looks like with a real test framework

This project's hand-built `test`/`expectEqual` is not a toy invented for this lesson — it is a deliberately small version of exactly what a real framework provides, so the shape is recognizable rather than foreign the first time you meet the real thing. In Vitest, syntax nearly every professional Vue project actually uses, the exact same test from Step 4 reads:

```typescript
import { describe, it, expect } from 'vitest'

describe('evaluate', () => {
  it('resolves cell references', () => {
    const parseResult = parse(tokenize('A1+B1'))
    expect(parseResult.success).toBe(true)
    if (parseResult.success) {
      const result = evaluate(parseResult.ast, mockLookup({ A1: 5, B1: 10 }))
      expect(result).toEqual({ kind: 'ok', value: 15 })
    }
  })
})
```

`describe` groups related tests (this project's tests were only ever a flat list). `it` is Vitest's name for what this lesson called `test`. `expect(x).toEqual(y)` is Vitest's assertion — doing exactly what `expectEqual(x, y)` does here, including the same "compare structurally, not by identity" behavior, built in rather than hand-rolled. Recognizing this the moment you see it, rather than learning it from nothing, is the entire reason this lesson built its own version first.

---

*Next: Lesson 15 — Keyboard Navigation and the ARIA Grid Pattern. A spreadsheet nobody can drive without a mouse is not production-grade — arrow keys, roving `tabindex`, and the full ARIA grid role vocabulary are added on top of the click-and-double-click interaction this series has used since Lesson 02, and ARIA itself (first named in Lesson 13) becomes a whole system, not just one attribute.*
