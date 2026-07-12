---
series: debugging-fundamentals
level: 4
title: Isolating Bugs — Divide and Conquer
lang: javascript
---

# Isolating Bugs — Divide and Conquer

The hardest part of debugging is not fixing the bug — it is finding where it is. A codebase with 10,000 lines has 10,000 candidate locations. Exhaustive search is not a strategy; it is a time sink. The strategy that finds bugs efficiently in any codebase of any size is **binary search on the execution path**: repeatedly halve the search space until the bug is pinned to a single location.

This lesson is about the systematic techniques for isolating bugs — narrowing from "something is wrong somewhere" to "this specific line, called with these specific values, produces this incorrect result." By the end of it you will be able to use binary search, delta debugging, and minimal reproducible examples to isolate any bug, regardless of its complexity.

## Binary search on code: halving the search space

Binary search on a sorted array finds the target in O(log n) steps by eliminating half the candidates at each step. The same strategy applied to code eliminates half the candidate bug locations at each step.

```text
SETUP:
  You have a bug. The symptom appears at the END of a chain of function calls.
  You do not know WHERE in the chain the bug originates.

STRATEGY:
  1. Identify the execution path from program entry to the symptom.
     Example: main() → loadData() → parseItems() → validateItem() → formatOutput()
  
  2. Place an observation HALFWAY through the path.
     Check: is the data correct at the halfway point?
  
  3. CORRECT at halfway: bug is in the second half. Discard the first half.
     WRONG at halfway: bug is in the first half. Discard the second half.
  
  4. Repeat on the remaining half.
  
  Five-step path → 3 observations to find which step is wrong.
  Twenty-step path → 5 observations.
  100-step path → 7 observations.

This is O(log n) — the most efficient possible search strategy.
```

```javascript
// Applying binary search to a pipeline of transforms:

function processData(rawInput) {
  const step1 = parseInput(rawInput)       // step 1
  const step2 = normaliseFields(step1)     // step 2
  const step3 = filterInvalid(step2)       // step 3
  const step4 = enrichWithMetadata(step3)  // step 4
  return formatOutput(step4)               // step 5 — symptom appears here (wrong output)
}
```

```text
Binary search: check at the midpoint (step3 — output of filterInvalid):

  console.log('After step3:', JSON.stringify(step3))
  → If step3 looks CORRECT: bug is in step4 or step5.
    → Check step4. If correct: bug is in step5.
  → If step3 looks WRONG: bug is in step1, step2, or step3.
    → Check step2. If correct: bug is in step3.

Worst case: 3 observations for a 5-step pipeline.
Compare to "check every step": 5 observations.
For a 100-step pipeline: 7 observations vs 100.
```

## Delta debugging: finding the smallest failing input

Sometimes you know the bug exists but cannot tell what input triggers it. The input is complex — a large JSON payload, a long string, a deeply nested structure. **Delta debugging** systematically shrinks the input until the smallest possible input that still triggers the bug is found.

```text
ALGORITHM (binary search on inputs):

  1. Start with the full failing input.
  2. Remove HALF of the input.
  3. Does the bug still occur?
     YES → the bug is in the remaining half. Discard the removed half.
     NO  → the removed half contains something needed to trigger the bug. Restore and try differently.
  4. Repeat until the input cannot be reduced further without losing the bug.

RESULT: a Minimal Reproducible Example (MRE) — the smallest input that triggers the bug.

Example: an array of 1000 items causes a crash in sort().
  Try [items 0–499]:    crash? NO
  Try [items 500–999]:  crash? YES → bug is in second half
  Try [items 500–749]:  crash? NO
  Try [items 750–999]:  crash? YES → bug is in last quarter
  ...continue...
  Result: items[847] has a null property that the sort comparator does not handle.
  MRE: [items[846], items[847]] — the minimum input that reproduces the crash.
```

**CS lens:** Delta debugging is a formalisation of the scientific principle of **controlled variables**: to understand which variable causes an effect, hold all others constant and vary one. In delta debugging, the "variable" is which portion of the input is present. By systematically varying which half is present and observing whether the bug occurs, you identify exactly which part of the input is necessary to trigger it. This technique is used in compiler testing (finding the smallest program that triggers a compiler bug), browser testing (smallest HTML that triggers a rendering bug), and security research (smallest payload that triggers a vulnerability).

## Minimal Reproducible Examples (MRE)

A Minimal Reproducible Example is the smallest possible, self-contained piece of code that demonstrates a bug. Creating an MRE is not optional overhead — it is the act that most reliably leads to finding the root cause.

```text
REQUIREMENTS for an MRE:
  MINIMAL:        No line that can be removed while the bug still reproduces.
  REPRODUCIBLE:   Runs the same way every time. No timing dependencies, no random data.
  SELF-CONTAINED: Needs no external database, no running server, no external files.

HOW TO CREATE AN MRE:
  1. Start with the full failing test case or usage.
  2. Remove dependencies one at a time (replace with stubs or hardcoded values).
  3. After each removal: verify the bug still occurs.
  4. Remove unused code (functions, imports, variables not in the path to the bug).
  5. Continue until nothing more can be removed.

WHY MRE WORKS:
  In the process of creating an MRE, you are forced to understand exactly what the
  code does with the minimum input. This understanding usually reveals the bug.
  "I was going to file a bug report and then I found the bug while making the MRE"
  is one of the most common outcomes of this technique.
```

```javascript
// Full application code where the bug appears:
// app.js → routes.js → controllers/order.js → services/order.js → utils/price.js

// MRE — extracted to a single self-contained file:
function calculateTax(priceUsd, stateCode) {
  const TAX_RATES = { CA: 0.0725, NY: 0.08, TX: 0.0625 }
  return priceUsd * TAX_RATES[stateCode]
}

console.log(calculateTax(100, 'FL'))   // → undefined (FL not in TAX_RATES)
// Bug: missing state returns undefined, not 0. MRE makes it immediately obvious.
```

```text
The MRE reveals what 500 lines of application code obscured:
  TAX_RATES has no entry for 'FL'. Multiplying by undefined gives NaN.
  The fix is obvious: return TAX_RATES[stateCode] ?? 0 (default to 0 if missing).

A bug that takes hours to find in 500 lines takes 30 seconds to understand in 5 lines.
The MRE IS the understanding.
```

**SE lens:** In collaborative environments, the MRE is the currency of bug reports. A bug report with an MRE can be reproduced and fixed by anyone on the team in minutes. A bug report without one ("sometimes the price is wrong on checkout") cannot be fixed without first spending hours reproducing it. When filing a bug report — to a team member, to an open source project, to a framework's issue tracker — the MRE transforms it from a report into a fixable issue. Teams that require MREs in bug reports ship faster than teams that do not.

**Common mistakes:**
- Checking in chronological order (first step 1, then step 2, ...) instead of binary search — this is O(n) instead of O(log n). For a 20-step pipeline, that is 20 checks vs 5. Develop the instinct to check the middle first.
- Stopping the MRE process too early — "I think the bug is in validateItem, so I'll stop here." An MRE that still contains 100 lines is not minimal. Continue until you cannot remove anything more.
- Changing the input while debugging — if you cannot control the input exactly, you cannot reproduce the bug reliably. Fix the input first, then debug.

**Debug tip:** When a bug only happens with production data, extract a sample of that data and use it as the starting point for delta debugging. The goal is to reduce the production dataset to a 3–10 item fixture that reliably triggers the bug. That fixture becomes the MRE. Once you have it, the bug is usually obvious.

## Challenge: binary_search_debug

Apply binary search to find the first broken step in this data pipeline.

```challenge
function step1_parse(raw) {
  return raw.split(',').map(s => s.trim())
}

function step2_toNumbers(arr) {
  return arr.map(s => parseInt(s, 10))
}

function step3_filterPositive(nums) {
  return nums.filter(n => n >= 0)   // BUG: should be n > 0, not n >= 0 (0 is not positive)
}

function step4_double(nums) {
  return nums.map(n => n * 2)
}

function pipeline(raw) {
  const s1 = step1_parse(raw)
  const s2 = step2_toNumbers(s1)
  const s3 = step3_filterPositive(s2)
  const s4 = step4_double(s3)
  return s4
}

// Input: '-3, 0, 5, -1, 8' — expected output excludes 0, so: [10, 16]
// Actual output includes 0 doubled: [0, 10, 16]

const debugAnalysis = {
  // What does step1_parse('-3, 0, 5, -1, 8') return?
  step1Output: [],

  // What does step2_toNumbers output given step1's result?
  step2Output: [],

  // What does step3_filterPositive output? (this is where the bug is)
  step3Output: [],

  // Which step contains the bug?
  bugInStep: '',   // 'step1', 'step2', 'step3', or 'step4'

  // What is the fix? (describe in one sentence)
  fix: '',
}
```

```test
const d = debugAnalysis
assert JSON.stringify(d.step1Output) === JSON.stringify(['-3', '0', '5', '-1', '8'])
assert JSON.stringify(d.step2Output) === JSON.stringify([-3, 0, 5, -1, 8])
assert JSON.stringify(d.step3Output) === JSON.stringify([0, 5, 8])
assert d.bugInStep === 'step3'
assert d.fix.includes('>') || d.fix.toLowerCase().includes('strictly') || d.fix.toLowerCase().includes('zero')
```
