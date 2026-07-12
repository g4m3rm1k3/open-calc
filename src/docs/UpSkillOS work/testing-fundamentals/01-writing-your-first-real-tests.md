# Testing Fundamentals: Writing and Reading Real Tests in This App

Today we study **automated testing** — code that checks other code, run by a
computer instead of a human clicking through the app by hand. Our case study is
real, currently-running test files in this repository:
`src/labs/image-lab-wip/imageMath.test.ts` (from this app's own recent work) and
`packages/openmat/src/__tests__/engine.test.ts`.

---

## What You Will Build

A real test file for a real, existing, currently-untested function in this app, run
with `npm test`, watched fail on purpose, then watched pass.

---

## What You Need to Know First

Function calls and `interface`/types (Flutter Playground Lesson 1). Nothing else is
assumed.

---

## The Lesson

### Step 1 — Why "I Tried It And It Worked" Isn't Enough

Every lesson in this curriculum so far has verified code by running the app and
looking at it — a real, valid way to check something once. The problem: it only
proves the code worked **at that moment, on that one input, while you were
watching**. Change something unrelated three weeks later, and nothing tells you
whether that manual check from three weeks ago still holds — you'd have to remember
to re-check it by hand, for every past feature, every single time you change
anything. **Automated tests are that manual check, written down once, re-run by a
computer in seconds, forever**, catching exactly the "I broke something I forgot
even existed" class of mistake that manual testing structurally cannot.

### Step 2 — Reading a Real Test File

Open `src/labs/image-lab-wip/imageMath.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { clamp } from './imageMath.js'

describe('clamp', () => {
  it('clamps below the low bound', () => { expect(clamp(-10)).toBe(0) })
  it('clamps above the high bound', () => { expect(clamp(300)).toBe(255) })
  it('passes through in-range values', () => { expect(clamp(128)).toBe(128) })
})
```

**`import { describe, it, expect } from 'vitest'`** — `vitest` is this project's
**test runner**: a program (already installed — check `devDependencies` in
`package.json`) that finds every file matching a `*.test.ts` naming pattern, runs
it, and reports which checks passed and which failed. `describe`, `it`, and
`expect` are three functions vitest provides specifically for *writing* tests in a
readable, structured way.

**`describe('clamp', () => { ... })`** — groups related tests under one readable
label — everything inside this block is "about the `clamp` function." This grouping
is purely organizational; it doesn't change what runs, only how results are
reported and read.

**`it('clamps below the low bound', () => { ... })`** — one individual **test
case**. The string is a plain-English description of what's being checked — when
this test fails, vitest prints this exact sentence, which is why a good description
(`'clamps below the low bound'`, not `'test 1'`) matters: it's the first thing a
future developer (including future you) reads when something breaks.

**`expect(clamp(-10)).toBe(0)`** — an **assertion**: call the real function
(`clamp(-10)`), wrap the result in `expect(...)`, and state what it must equal
(`.toBe(0)`) for this test to pass. If `clamp(-10)` ever returns anything other
than `0` — today, or after some future change — this specific line fails, and
vitest reports exactly this test's description, the expected value, and the actual
value it got instead.

**Three separate `it` blocks, not one** — Lesson 1's "vary the input once and run
again" principle, now literally what a real test file does: one case for below the
range, one for above, one for inside it — the same escalating-tiny-variation
discipline `LESSON_CONTRACT.md`'s "Incremental practice" section names, applied to
verification instead of teaching.

### Step 3 — Running It For Real

```
npm test
```

**What this command does:** `package.json`'s `"test"` script runs `vitest` (check
it yourself — open `package.json` and find the `"scripts"` section). Vitest scans
this whole project for every `*.test.ts`/`*.test.tsx` file, runs every `describe`/`it`
inside each one, and prints a summary.

**Expected output** (abbreviated — the real run includes every test file in this
project, not just this one):
```
✓ src/labs/image-lab-wip/imageMath.test.ts (16 tests)
  ✓ clamp > clamps below the low bound
  ✓ clamp > clamps above the high bound
  ✓ clamp > passes through in-range values
  ...

Test Files  19 passed (19)
     Tests  386 passed (386)
```

Every one of those `386` is a real, individual assertion, like the three you just
read, somewhere in this codebase — and every one runs again, automatically, in
seconds, any time anyone runs `npm test`.

---

### Step 4 — Watch a Test Actually Fail

This step matters as much as writing a passing test — a test you've never watched
fail is a test you can't fully trust to catch a real future mistake, because you
don't actually know it's checking what you think it is.

Temporarily change one assertion in `imageMath.test.ts`:

```typescript
it('clamps below the low bound', () => { expect(clamp(-10)).toBe(999) })
```

Run `npm test` again. **Expected output:**
```
✗ clamp > clamps below the low bound
  AssertionError: expected 0 to be 999

  - Expected: 999
  + Received: 0
```

This is the exact same fail-loud guarantee that's run through every lesson in this
curriculum, starting from `tsc`'s type-check error in Flutter Playground Lesson 1 —
here applied to *behavior* instead of *shape*: `clamp(-10)` really did compute `0`,
correctly; the test itself was wrong, and vitest said so specifically, with the
expected and actual values right there. Revert the `999` back to `0`, run `npm
test` once more, confirm it's green again.

---

### Step 5 — Write a Real Test for Real, Currently-Untested Code

Open `src/labs/decomp-lab/mathHelpers.js` (real code from this session's own
Decomp Lab work) and find `parseXYText` — a function with **no existing test**.
Read it: it parses pasted "x, y" lines into an array of `{x, y}` points, skipping
blank lines and lines starting with `#`.

Create `src/labs/decomp-lab/mathHelpers.test.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { parseXYText } from './mathHelpers.js'

describe('parseXYText', () => {
  it('parses comma-separated pairs', () => {
    expect(parseXYText('1,2\n3,4')).toEqual([{ x: 1, y: 2 }, { x: 3, y: 4 }])
  })

  it('skips blank lines', () => {
    expect(parseXYText('1,2\n\n3,4')).toEqual([{ x: 1, y: 2 }, { x: 3, y: 4 }])
  })

  it('skips comment lines starting with #', () => {
    expect(parseXYText('# a comment\n1,2')).toEqual([{ x: 1, y: 2 }])
  })

  it('ignores lines that are not valid number pairs', () => {
    expect(parseXYText('1,2\nnotanumber,3\n4,5')).toEqual([{ x: 1, y: 2 }, { x: 4, y: 5 }])
  })
})
```

**`.toEqual(...)` instead of `.toBe(...)`** — a new, important distinction.
`.toBe` checks that two values are the **exact same value** — for objects and
arrays, that means the exact same object in memory, not just one that looks
identical. `parseXYText(...)` builds a **brand new** array and brand new objects
every time it's called — `.toBe` would always fail here, even for genuinely correct
output, because the freshly-returned array is never the literal same object as the
one written in the test. `.toEqual` instead checks **structural equality** —
"do these two things have the same shape and the same values inside," regardless of
whether they're the same object in memory. As a working rule: `.toBe` for
primitives (numbers, strings, booleans — Step 2's `clamp` tests all correctly use
it), `.toEqual` for objects and arrays.

Run `npm test`. **Expected output:** four new passing tests, all green, alongside
every existing test in the project, still passing.

---

## Connect the Pieces

`describe`/`it`/`expect` is the same three-function vocabulary in every test file
in this project — `imageMath.test.ts`, `packages/openmat/src/__tests__/engine.test.ts`,
and your new `mathHelpers.test.js` all use it identically. Once you can read one
real test file in this repo, you can read all of them; the only thing that changes
between files is *what* is being asserted, never the mechanism doing the asserting.

---

## What Breaks Without This

This entire lesson set — Flutter Playground, useRef/useEffect,
Context-from-scratch, routing — was verified by hand, by you, running the app and
watching it, every single time. That's real verification, but it doesn't survive
past the moment you did it. Six months from now, a change to `imageMath.ts`'s
`clamp` function that breaks something subtle would be caught **instantly** by
`npm test` — the same 16 assertions that exist today, run again, for free — or
missed entirely, silently, by anyone who doesn't happen to manually re-check every
consumer of `clamp` by hand, which nobody reliably does for a function that small
and that deep in the codebase.

---

## Definition of Done

- [ ] `src/labs/decomp-lab/mathHelpers.test.js` exists with at least the four real
      tests above, all passing under `npm test`
- [ ] You watched a real test fail (Step 4) and read vitest's actual
      expected-vs-received output, not just this lesson's description of it
- [ ] You can explain the difference between `.toBe` and `.toEqual`, and correctly
      predict which one a new test you haven't written yet would need
- [ ] You can explain what `npm test` actually does, mechanically — which files it
      finds, and how
- [ ] `git commit` explaining why: for example, "Add tests for parseXYText — real,
      previously-untested logic from the Decomp Lab rebuild, covering the blank-line
      and comment-line skip behavior that had no automated check before"
