# Lesson 23: Tracing Recursive Evaluation

**What you will build**: By the end of this lesson you'll be able to trace any recursive function's execution systematically — not just the single-branch traces earlier lessons already did informally, but genuinely branching recursion, drawn as an evaluation tree, revealing something a linear trace hides completely: the same call sometimes happening more than once, independently, without either branch knowing about the other.

**What you need to know first**: The linear traces already performed for `sum-to` and `factorial`, and the termination-measure vocabulary from the previous lesson.

**Terms introduced in this lesson**:

- **call stack** — informally, the sequence of function calls currently waiting for a result, each one paused until the call it made returns. *Why it matters*: gives a name to what's actually "piling up" during a trace like `sum-to`'s, before Lesson 193 gives the identical idea its full, formal, memory-level treatment.
- **evaluation tree** — a diagram showing a recursive function's execution: each call is a node, the calls it makes recursively are that node's children, and calls that hit a base case are leaves with nothing further beneath them. *Why it matters*: makes visible what a purely linear trace hides the moment a function makes more than one recursive call per invocation — genuine branching, and, sometimes, the exact same call recurring in more than one place.
- **overlapping subproblems** — when a recursive function's evaluation tree contains the identical call more than once, computed independently in separate branches. *Why it matters*: directly visible in this lesson's own worked example, and precisely the situation Lesson 38's memoization exists to eliminate.

**Objects and methods used**: None new. This lesson traces `sum-to` (already covered) and introduces one new function, `fib`, built entirely from `defn`, `if`, `<=`, and `+`, all already covered.

---

## Concept Unit: Tracing Linear Recursion — the Call Stack

### The Problem

Earlier lessons traced `sum-to 4` by repeatedly substituting each call's definition, arriving at a chain of nested additions. That worked, but it obscures something worth naming directly: while `(sum-to 4)` is waiting on `(sum-to 3)` to finish, what exactly is happening to the `4` — where is it being "held" until it's needed?

### Introduce the concept in isolation

Retrace `(sum-to 4)`, but this time, track explicitly which calls are *waiting*, not yet finished, at each point:

```
Call sum-to(4) — waiting on sum-to(3) to return, so it can compute 4 + [that result]
  Call sum-to(3) — waiting on sum-to(2), so it can compute 3 + [that result]
    Call sum-to(2) — waiting on sum-to(1), so it can compute 2 + [that result]
      Call sum-to(1) — waiting on sum-to(0), so it can compute 1 + [that result]
        Call sum-to(0) — base case, returns 0 immediately, nothing to wait on
      sum-to(1) resumes: 1 + 0 = 1, returns 1
    sum-to(2) resumes: 2 + 1 = 3, returns 3
  sum-to(3) resumes: 3 + 3 = 6, returns 6
sum-to(4) resumes: 4 + 6 = 10, returns 10
```

At the deepest point (right after `sum-to(0)` is called), there are five calls simultaneously waiting — `sum-to(4)`, `sum-to(3)`, `sum-to(2)`, `sum-to(1)`, and `sum-to(0)` itself — each one paused, holding onto its own `n` and remembering exactly what it still needs to do (`4 + [...]`, `3 + [...]`, and so on) once the call it made returns. This sequence of waiting calls is the **call stack**: calls pile up as each one makes a further recursive call before it can finish, and unwind in the reverse order, each one resuming and completing only once the call directly below it on the stack has returned a result.

### Discard the throwaway example

Not applicable — this is a more careful version of a trace this series has already performed informally.

### CS Lens

"Piling up, then unwinding in reverse order" is the exact behavior of a **stack** data structure (Lesson 86 covers this formally, as a general-purpose tool, independent of recursion) — the last call made is always the first one to finish and return, precisely the LIFO (last-in, first-out) discipline that gives a stack its name. Lesson 193 (*Stack Frames*) shows this isn't just a metaphor: a real, running program genuinely keeps something very much like this trace in memory, one frame per waiting call, exactly as sketched here.

### SE Lens

Naming the call stack explicitly is what makes a subtle fact about recursion visible: every waiting call consumes some real resource (memory, to remember where it is and what it still needs to do) for as long as it's paused. A recursive function whose call stack grows very deep — `sum-to` on a huge input, say — isn't free just because each individual step is simple; Lesson 35 (*Tail Recursion*) returns to this exact cost directly, and shows one specific circumstance where it can be avoided entirely.

---

## Concept Unit: A Doubly-Recursive Function — Fibonacci

### The Problem

Every function traced so far makes exactly *one* recursive call per invocation — a straight line of waiting calls, one on top of the next. What happens to a trace once a function makes *two* recursive calls in the same invocation, each one needing its own answer before the current call can finish?

### Introduce the concept in isolation

Define the Fibonacci sequence — each number is the sum of the two before it, starting `0, 1` — recursively:

```clojure
(defn fib [n]
  (if (<= n 1)
    n
    (+ (fib (- n 1)) (fib (- n 2)))))
```

```
user=> (fib 4)
3
user=> (fib 5)
5
```

Unlike every function traced so far, `fib`'s recursive case makes *two* recursive calls — `(fib (- n 1))` and `(fib (- n 2))` — both needed before `+` can combine them. A single vertical chain of waiting calls no longer captures this: `fib(4)` waits on *two* separate things, each of which may itself wait on two more.

### Discard the throwaway example

Not applicable — `fib` is a standard, reusable function, central to the rest of this lesson.

### Project Change

- **Reference Source**: No reference counterpart — a direct structural translation of Fibonacci's own recursive definition (base cases `0` and `1`; every later term is the sum of the two before it).
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn fib [n]
  (if (<= n 1)
    n
    (+ (fib (- n 1)) (fib (- n 2)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(<= n 1)`** — a reappearing comparison, combining two base cases (`n = 0` and `n = 1`) into a single condition: for either value, `fib` should return `n` itself directly (`fib(0) = 0`, `fib(1) = 1`), so one comparison covers both.
- **`(+ (fib (- n 1)) (fib (- n 2)))`** — first appearance, in this series, of a recursive case making *two* separate recursive calls, both evaluated (per Lesson 2's sub-expression rule) before `+` combines their results. Neither call knows about or depends on the other directly — they're independent sub-computations that happen to both be needed by the same `+`.

### CS Lens

A recursive case with more than one recursive call is exactly the shape Lesson 30's trees will need — a binary tree's recursive case, from Lesson 19's own definition, refers to *two* smaller trees (left and right), and a structurally recursive function over a tree will, just like `fib`, need two recursive calls to handle both.

### SE Lens

`fib`, written this directly recursive way, is a completely faithful translation of its own mathematical definition — and, as the next unit shows concretely, a genuinely expensive one to actually run for larger inputs, for a reason a purely linear trace (like `sum-to`'s) could never reveal. This is exactly why the next unit's evaluation tree matters: some costs are invisible until the *shape* of a computation, not just its individual steps, is actually drawn out.

### Connection to the previous unit

The previous unit traced a function with one recursive call per invocation, producing a straight vertical chain; this unit introduces a function whose recursive case branches into two, which the next unit will show can no longer be captured by a simple chain at all.

---

## Concept Unit: Reading an Evaluation Tree

### The Problem

`fib(4)`'s trace branches at every non-base-case call. Drawn out completely, what does that branching actually look like — and does anything surprising show up once it's fully drawn?

### Introduce the concept in isolation

Draw `fib(4)`'s complete **evaluation tree** — every call as a node, its recursive calls as children, base cases as leaves:

```
fib(4)
├── fib(3)
│   ├── fib(2)
│   │   ├── fib(1) → 1   [base case]
│   │   └── fib(0) → 0   [base case]
│   │   → 1 + 0 = 1
│   └── fib(1) → 1        [base case]
│   → 1 + 1 = 2
└── fib(2)
    ├── fib(1) → 1        [base case]
    └── fib(0) → 0        [base case]
    → 1 + 0 = 1
→ 2 + 1 = 3
```

Reading it bottom-up confirms `(fib 4)` correctly returns `3`, matching the earlier REPL output. But look at what's drawn: `fib(2)` appears **twice** — once under `fib(3)`'s branch, once directly under `fib(4)`'s second branch — computed completely independently both times, with neither call aware the other exists or shares the same answer. This is **overlapping subproblems**: the identical call, `fib(2)`, recomputed from scratch in two separate places in the same evaluation tree. `fib(1)` fares even worse — it appears *three* separate times across this small tree.

For `fib(4)`, recomputing `fib(2)` twice is nine total calls instead of a theoretical minimum of five distinct ones (`fib(0)` through `fib(4)`) — already noticeable, and this waste compounds quickly: `fib(5)`'s tree contains `fib(4)`'s entire tree as one branch, plus another full copy of `fib(3)`'s tree as its other branch, doubling the redundant work roughly every step further out.

### Discard the throwaway example

Not applicable — this evaluation tree is the actual, complete record of `(fib 4)`'s real execution, not a simplified stand-in for it.

### Formal Definition, Walked Through

> An **evaluation tree** for a recursive call represents that call as a node; each recursive call it makes is drawn as a child node; a call that hits a base case is a leaf, with no children.

- *"each recursive call it makes is drawn as a child"* — a function like `sum-to`, with exactly one recursive call per invocation, produces a tree that's really just a single vertical chain — every node has at most one child, which is why a straight linear trace was sufficient for it, and why `fib`'s genuine branching is what actually requires this unit's fuller notation.

### CS Lens

An evaluation tree with repeated subtrees, like `fib`'s, is exactly what Lesson 38 (*Memoization*) targets directly: once a repeated call is recognized (the same input appearing at more than one node), remembering its answer the first time it's computed and reusing it the second time turns this tree's redundant branches into simple lookups — the single biggest idea that lesson builds around, made concrete here, several lessons early, by literally seeing the duplication in the drawn tree.

### SE Lens

Nothing about `fib`'s *code* looks inefficient — it's a short, direct, structurally faithful translation of Fibonacci's own definition, exactly the kind of function Lesson 21 praised for being nearly forced by the data's recursive structure. The inefficiency is invisible in the code itself and only becomes visible once the evaluation tree is actually drawn — a concrete argument for why tracing execution, not just reading code, is sometimes the only way to notice a real problem before it shows up as a program that runs far slower than its short definition would suggest.

### Connection to the previous unit

The previous unit introduced `fib`'s two-recursive-call shape without yet showing what it produces when actually traced; this unit draws the complete tree and finds something a linear trace could never have revealed — the same subproblem, solved more than once, for no algorithmic reason at all.

---

## Connect the Pieces

Both tracing styles, side by side, for the two functions this lesson covered:

**`sum-to(4)`** — one recursive call per invocation, a straight chain, five distinct calls, none repeated:

```
sum-to(4) → sum-to(3) → sum-to(2) → sum-to(1) → sum-to(0)
```

**`fib(4)`** — two recursive calls per invocation, a genuine tree, nine total calls, but only five *distinct* ones (`fib(0)` through `fib(4)`), because `fib(2)` and `fib(1)` each recur more than once:

```
fib(4) branches into fib(3) and fib(2);
fib(3) branches into fib(2) [again] and fib(1);
each fib(2) branches into fib(1) and fib(0).
```

The call stack (Concept Unit 1) explains what's happening at any single moment during either trace — which calls are currently paused, waiting on something else to finish. The evaluation tree (Concept Unit 3) explains the *complete shape* of all the work a call ultimately does, including duplication a moment-by-moment stack view doesn't make obvious on its own. Both views describe the same execution; each makes a different fact about it visible.

## What Breaks Without This

Suppose someone, having only ever traced `sum-to`-style single-recursive-call functions, assumed `fib`'s runtime would scale the same simple way — proportional to `n`, doubling only if `n` roughly doubles. Trace the actual number of calls each evaluation tree contains: `fib(4)` needed `9` calls; extending the same tree-drawing exercise to `fib(6)` needs `25` calls; `fib(8)` needs `67`. This isn't growing proportionally to `n` at all — it's growing far faster, exactly *because* of the overlapping subproblems Concept Unit 3 revealed, each additional step roughly doubling the number of redundant recomputations rather than simply adding one more unit of work the way `sum-to`'s single-chain recursion does. A prediction based on `sum-to`'s shape, applied uncritically to `fib`'s different shape, would be wrong by a wide and rapidly growing margin — precisely the kind of mistake actually drawing the evaluation tree, rather than assuming all recursion behaves alike, prevents.

## Exercises

1. **Trace.** Draw the complete evaluation tree for `(fib 3)`, labeling every node with its return value, the way this lesson did for `(fib 4)`.
2. **Predict.** Before drawing it, predict how many times `fib(1)` will appear as a node in `(fib 5)`'s evaluation tree. Draw the tree to check.
3. **Count.** Using your Exercise 1 tree, count the total number of calls (nodes) in `(fib 3)`'s evaluation tree, and separately count how many *distinct* Fibonacci values it actually needed to compute. What's the gap between the two counts, and where exactly does it come from?
4. **Break it, on purpose.** Write a three-recursive-call function (any reasonable one — for instance, a function that calls itself on `n-1`, `n-2`, and `n-3`, summing all three plus `n`), and draw its evaluation tree for a small input. How does the branching compare to `fib`'s two-way branching?
5. **Generalize.** `sum-to`'s call stack, at its deepest point, held exactly as many waiting calls as its input value. Does `fib`'s call stack ever hold more calls simultaneously than `fib`'s own input value, at any point during its execution? Trace `(fib 4)` again, this time tracking the call stack's *depth* (not the full tree) at each point, to check.
6. **Reconstruct.** Close this lesson. From memory, explain the difference between a call stack and an evaluation tree — what does each one show that the other doesn't?

## Definition of Done

- [ ] You can trace a single-recursive-call function using explicit call-stack notation, the way this lesson traced `sum-to(4)`.
- [ ] You can draw a complete evaluation tree for a two-recursive-call function, correctly labeling every node.
- [ ] You completed Exercise 3 and can state precisely how many redundant calls `(fib 3)`'s tree contains.
- [ ] You can explain why `fib`'s evaluation tree reveals a cost that a linear trace of a function like `sum-to` never could.
- [ ] Commit your Exercise 4 function and its evaluation tree (as a comment or a small diagram in a notes file) to your notes repository, with a commit message stating how many total calls versus distinct calls it required — for example, `"Add three-way recursive sum, trace fib-style tree for n=4 — 2x more branching than fib at each level"` — not just `"lesson 23 exercise"`.

---

**Next lesson:** Lesson 24, *Lists from First Principles*, finally introduces this series' first real, general-purpose list operations — `cons`, `first`, and `rest` — giving every recursive technique built so far on plain numbers a genuine collection to operate on instead.
