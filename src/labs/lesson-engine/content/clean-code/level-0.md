---
series: clean-code
level: 0
title: What Clean Code Is
lang: javascript
---

# What Clean Code Is

Most programmers spend more time reading code than writing it. You read code when you fix bugs, add features, review pull requests, onboard to a new project, or return to your own code six months later. If you write code that is hard to read, every future reader — including yourself — pays a tax on every interaction with it.

Clean code is code that is easy to read, easy to understand, and easy to change. It is not about aesthetics, cleverness, or following a rigid style guide. It is about communication: the code tells the reader what it does, why it does it, and where it fits in the larger system. By the end of this series, you will have a concrete vocabulary and toolkit for writing code that your team — and your future self — can understand and modify with confidence.

## The reading/writing ratio

```text
THE RATIO:
  Studies of professional programmers consistently find:
  Time spent READING code:  ~70–80% of coding time
  Time spent WRITING code:  ~20–30% of coding time

  When you write code that is hard to read, you are trading a one-time savings in
  writing time for a permanent tax on every future reading.

  For a function you will read 50 times over its lifetime:
    Easy to write, hard to read:  1 fast write + 50 slow reads = net loss
    Slow to write, easy to read:  1 slow write + 50 fast reads = net gain

  The investment in clarity always pays off for code that lasts more than a few days.
```

## What makes code hard to read

The same problems appear in nearly every codebase with readability issues:

```javascript
// HARD TO READ:
function p(d, t) {
  let r = 0
  for (let i = 0; i < d.length; i++) {
    if (d[i].s === 1 && d[i].a >= t) {
      r += d[i].p * d[i].q
    }
  }
  return r
}
```

```javascript
// EASY TO READ:
function calculateRevenue(orders, minAmount) {
  return orders
    .filter(order => order.status === STATUS.COMPLETED && order.amount >= minAmount)
    .reduce((total, order) => total + order.price * order.quantity, 0)
}
```

```text
WHAT CHANGED:
  p          → calculateRevenue      (function name explains what it computes)
  d, t       → orders, minAmount     (parameter names explain what they are)
  r, i       → total, order          (loop variable names match their meaning)
  d[i].s === 1 → order.status === STATUS.COMPLETED  (magic number replaced with named constant)
  d[i].a     → order.amount          (abbreviated field name expanded)
  imperative loop → filter + reduce  (pattern name carries meaning: "filter then aggregate")
```

**CS lens:** The names in source code are the primary metadata that connects the abstract machine (bytes in memory) to the problem domain (orders, customers, payments). When names are abbreviated or meaningless (`d`, `r`, `s`), the reader must hold two parallel models: the abstract machine operations AND the domain meaning. The cognitive load is roughly doubled. Meaningful names collapse the two models into one — the name carries the domain meaning directly, so the reader only maintains one mental model.

## The cost of clever code

Clever code optimises for impressing the reader rather than informing the reader. It is a form of communication failure.

```javascript
// CLEVER:
const result = arr.reduce((a, b) => +!b ? a : [...a, b], []).map(x => x * 2)

// CLEAR:
const nonZeroValues = arr.filter(value => value !== 0)
const doubled = nonZeroValues.map(value => value * 2)
```

```text
CLEVER CODE COSTS:
  → Takes longer to understand on every reading.
  → Is harder to modify — changing it requires re-deriving what it does.
  → Is harder to debug — the execution path is not obvious.
  → Signals that the author prioritised their ego over the reader's time.

CLEVER CODE IS SOMETIMES JUSTIFIED:
  → Performance-critical inner loops where every nanosecond matters.
  → Operator overloads in libraries where the idiom is standard.
  In those cases: add a comment explaining WHY, and measure the performance gain.
  "Optimised for performance: reduces allocations in hot path. Benchmark: 2x faster."
```

## The four properties of clean code

```text
1. READABLE: the reader can understand what the code does without asking the author.
   Test: can a colleague understand this function in 30 seconds without context?

2. UNDERSTANDABLE: the reader knows WHY this code does what it does.
   Test: are there hidden constraints or non-obvious choices that need explanation?
   (Comments answer this — not WHAT, but WHY.)

3. CHANGEABLE: the reader can modify the code without unexpected side effects.
   Test: if you change this function, will other parts of the system break unexpectedly?
   (Coupling, side effects, and hidden dependencies hurt changeability.)

4. TESTABLE: the behaviour of the code can be verified automatically.
   Test: can you write a test that calls this function and checks its output without
   setting up a database, the filesystem, or a network connection?
   (Pure functions are testable by definition; functions with hidden dependencies are not.)
```

**SE lens:** These four properties are not independent. Code that is readable tends to be understandable (names and structure signal intent). Code that is understandable tends to be changeable (you change what you understand). Code that is changeable tends to be testable (testable code is modular by definition). The root of all four properties is the same thing: **low coupling and high cohesion** — each unit does one thing, depends on few other things, and communicates its purpose clearly.

**Common mistakes:**
- Confusing clean code with short code — fewer lines is not inherently cleaner. A three-line function with a side effect and two implicit assumptions can be harder to understand than a ten-line function with clear variable names and explicit logic.
- Adding comments that explain WHAT the code does — if the code needs a comment explaining what it does, the fix is clearer naming, not a comment. Comments explain WHY: hidden constraints, non-obvious design decisions, workarounds for external bugs.
- Conflating clean code with premature optimisation — clean code does not mean extracting every three-line pattern into a helper function. The goal is clarity, not abstraction. Abstract only when the pattern appears three or more times and the abstraction makes the code clearer, not when it satisfies a theoretical tidiness criterion.

**Debug tip:** The "what does this do?" test: read a function and try to explain in one sentence what it does. If you cannot form the sentence quickly, the function is doing too many things or its purpose is not named clearly. The fix is usually: rename the function, extract a sub-function, or break it into two functions with clearer single responsibilities.

## Challenge: readability_audit

Identify the readability issues in this code and describe the fixes.

```challenge
function readabilityAudit(codeSnippet) {
  // codeSnippet: 'snippet-a' | 'snippet-b' | 'snippet-c'
  // Returns: { issues: string[], fixes: string[] }
  //   issues: list of readability problems (as short descriptions)
  //   fixes:  corresponding list of improvements (same length as issues)

  if (codeSnippet === 'snippet-a') {
    // function calc(x, y, z) { return x > 0 ? y : z }
    // Issues: unclear names, ternary without obvious meaning
  }

  if (codeSnippet === 'snippet-b') {
    // let flag = true; ... if (flag) { ... }
    // Issues: boolean flag name doesn't say what it means
  }

  if (codeSnippet === 'snippet-c') {
    // for (let i = 0; i < a.length; i++) { if (a[i] > 100) { b.push(a[i] * 0.9) } }
    // Issues: abbreviations, magic number, imperative loop instead of pipeline
  }
}
```

```test
const a = readabilityAudit('snippet-a')
assert Array.isArray(a.issues) && a.issues.length >= 1 && a.fixes.length === a.issues.length
assert a.issues.some(i => i.toLowerCase().includes('name') || i.toLowerCase().includes('unclear'))

const b = readabilityAudit('snippet-b')
assert b.issues.length >= 1 && b.fixes.length === b.issues.length

const c = readabilityAudit('snippet-c')
assert c.issues.length >= 2 && c.fixes.length === c.issues.length
assert c.issues.some(i => i.toLowerCase().includes('magic') || i.toLowerCase().includes('100') || i.toLowerCase().includes('abbreviat'))
```
