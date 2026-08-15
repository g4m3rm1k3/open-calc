# Lesson 31: Tracing Recursive Evaluation

**What you will build:** A real, instrumented version of `fib` that prints every single call it makes, confirming by hand and by machine that Fibonacci's recursive calls form a branching tree, not the straight line every earlier traced procedure has produced. The transferable problem this lesson is actually about: Lesson 28's execution trace for `factorial` was a single chain, one call leading directly to the next — a shape simple enough to trace without needing any special technique. `fib` makes *two* recursive calls per invocation, and tracing it honestly requires a genuinely different tool: a tree, not a line, and counting reveals something a linear trace never could — the same value can be recomputed many times over within a single top-level call.

**What you need to know first:** Lesson 28 (`FP-L028-recursive-functions.md`) — specifically `factorial.scm`'s execution trace, revisited directly in Concept Unit 1 as the linear case this lesson contrasts against. Lesson 29 (`FP-L029-base-cases.md`) — specifically `fib.scm`, reused directly and instrumented further in this lesson.

**Terms introduced in this lesson**

- **Evaluation tree** — a diagram of a recursive computation's calls, where each call is a node and each recursive call it makes is a child node beneath it, branching whenever a call makes more than one recursive call. A procedure like `factorial`, making exactly one recursive call per invocation, produces an evaluation tree that is really just a straight line; a procedure like `fib`, making two, produces a tree that genuinely branches.

## Objects and methods used

- **`set!`**
  - *What it is:* a real Scheme special form that reassigns an already-`define`d name to a new value — a reappearance of *reassignment* (Lesson 6), now as genuine, callable syntax rather than mathematical notation.
  - *Implementation:* takes a name and a new value, `(set! name new-value)`; unlike `define`, it requires the name to already exist, and it changes what that name refers to rather than introducing it for the first time.
  - *Its use:* Concept Unit 4's instrumented `fib` uses `set!` to increment a shared call counter every time `fib` is invoked, giving this lesson a real, machine-counted total to check hand-counting against.

---

## Concept Unit 1: A Trace That Doesn't Branch — factorial, Revisited

### The Problem

Lesson 28's execution trace for `(factorial 5)` listed eleven steps, each one either a call going deeper or a call resuming after the one below it returned — but at every single point in that trace, there was only ever one call waiting on one other call. It's worth confirming this explicitly, because it's exactly the property that made a simple, linear list of steps sufficient, and exactly the property `fib` will not share.

### No isolated lab for this step

This concept has no code of its own to isolate — reviewing the shape of an already-traced computation is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Counting factorial's Branches

**Lesson 28's traced calls, listed again:** `(factorial 5) → (factorial 4) → (factorial 3) → (factorial 2) → (factorial 1) → (factorial 0)`, then unwinding back up through each one in reverse.

**Checking how many recursive calls each invocation makes:** `(factorial n)`'s recursive case, `(* n (factorial (- n 1)))`, contains exactly one call to `factorial`. Every single invocation in the trace, from `(factorial 5)` down to `(factorial 1)`, makes exactly one further call.

**Naming what this means for the trace's shape:** a diagram of these calls, each one pointing to the one call it makes, would be a straight line — `(factorial 5)` pointing to `(factorial 4)`, pointing to `(factorial 3)`, and so on, with no point at which a single call splits into two separate branches.

### Walkthrough

- **The eleven-step trace, reappearing from Lesson 28** — re-examined here specifically for its branching structure, a question that lesson never needed to ask.
- **"exactly one call to `factorial`," checked in the recursive case's own text** — confirms, by looking directly at the code rather than assuming it, that `factorial` genuinely never branches.
- **"a straight line"** — not a new concept yet, but the direct, visual conclusion this unit reaches, setting up Concept Unit 2's contrast.

### CS Lens

This is the recognition that a recursive procedure's *call structure* — how many further calls each invocation makes — is a property worth examining on its own, separate from what the procedure actually computes. Also recognized in: a single-threaded assembly line, where each station hands work to exactly one next station; a relay race, where each runner hands off to exactly one next runner; a chain of command with no delegation, where each order passes to exactly one subordinate; a single hallway with no branching corridors.

### SE Lens

The alternative to checking a procedure's branching structure explicitly is to assume every recursive trace looks like `factorial`'s — a reasonable assumption after only ever having traced one example, and one this lesson exists specifically to correct. The real cost of that alternative, made concrete in Concept Unit 2, is being unprepared for a call structure that a simple linear list cannot honestly represent at all. Checking `factorial`'s branching explicitly here, even though the answer turns out to be "it doesn't," costs one direct look at the code; it establishes the baseline Concept Unit 2 needs to contrast against.

---

## Concept Unit 2: A Trace That Branches — fib Makes Two Calls

### The Problem

`fib`'s recursive case, `(+ (fib (- n 1)) (fib (- n 2)))`, contains two calls to `fib`, not one. Tracing `(fib 4)` the way Lesson 28 traced `(factorial 5)` — a single numbered list, each step waiting on exactly one other — cannot honestly represent this, because at the very first recursive step, there are genuinely two separate calls to account for, not one.

### No isolated lab for this step

This concept has no code of its own to isolate — the branching call structure is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Where fib(4) Splits

**`fib`'s recursive case, examined the way Concept Unit 1 examined `factorial`'s:** `(+ (fib (- n 1)) (fib (- n 2)))` contains two separate calls to `fib` — `(fib (- n 1))` and `(fib (- n 2))` — both needed before the surrounding `+` can produce a result.

**What this means for `(fib 4)` specifically:** it needs both `(fib 3)` and `(fib 2)` — two separate, independent computations, neither one waiting on the other, both eventually needed by the same `+`.

**Checking whether either of those two calls branches again:** `(fib 3)` needs both `(fib 2)` and `(fib 1)` — branching again. `(fib 2)` — the *second* one, needed directly by `(fib 4)` — separately needs its own `(fib 1)` and `(fib 0)`, branching yet again, entirely independently of `(fib 3)`'s own branching.

**Naming what this confirms:** unlike `factorial`, where every invocation led to exactly one further call, `fib`'s invocations keep splitting into two, all the way down to the base cases — a structure a single linear list cannot represent honestly.

### Walkthrough

- **`(+ (fib (- n 1)) (fib (- n 2)))`, examined for its two calls** — a reappearance of Lesson 29's `fib.scm`, examined here specifically for branching, exactly the question Concept Unit 1 asked of `factorial`.
- **`(fib 4)` needing both `(fib 3)` and `(fib 2)`** — the first concrete branch point, demonstrating the split directly rather than asserting it.
- **`(fib 3)` and `(fib 2)` each branching further, independently of each other** — confirms the branching isn't a one-time event; it recurs at every level until the base cases are reached.

### CS Lens

This is the structural difference between a computation that delegates to one dependent step and one that delegates to several independent ones, each of which may itself delegate further — the shape underlying every divide-and-conquer algorithm this curriculum will introduce later. Also recognized in: a company's org chart, where a manager with two direct reports creates a genuine branch, unlike a strict single-report chain; a family tree, branching at every generation into two parents, each of whom branches into two more; a tournament bracket, where each round splits participants rather than passing them through a single line; a river system's tributaries, branching upstream into multiple smaller streams.

### SE Lens

The alternative to noticing this branching explicitly is to keep trying to trace `fib` with `factorial`'s linear format, forcing a numbered list onto a structure that doesn't actually fit one. The real cost of that alternative is a trace that's either incomplete (silently dropping one of the two branches) or misleading (implying a sequential dependency between two calls that are actually independent of each other). Recognizing the branch explicitly, as this unit does, costs nothing beyond examining the recursive case's own code; it is what makes Concept Unit 3's tree diagram the honest choice, rather than a stylistic preference.

---

## Concept Unit 3: Drawing the Evaluation Tree

### The Problem

Concept Unit 2 established that `(fib 4)` branches, and branches again within each branch. Representing this precisely, in a form that can actually be checked against a real run, needs a diagram built for branching structure — a tree — rather than a numbered list built for a single chain.

### No isolated lab for this step

This concept has no code of its own to isolate — the tree is drawn and explained directly below, not through a construct with its own syntax.

### Applying It — The Full Tree for fib(4)

**The complete evaluation tree, drawn with indentation showing each call's children beneath it:**

```
fib(4)
├── fib(3)
│   ├── fib(2)
│   │   ├── fib(1) → 1
│   │   └── fib(0) → 0
│   └── fib(1) → 1
└── fib(2)
    ├── fib(1) → 1
    └── fib(0) → 0
```

**Reading the tree's structure, level by level:** `fib(4)` has two children, `fib(3)` and `fib(2)`. `fib(3)` has its own two children, `fib(2)` and `fib(1)`. That first `fib(2)` has two children of its own, `fib(1)` and `fib(0)`, both base cases, needing no further branches. `fib(4)`'s second child, a completely separate `fib(2)`, has its own two children, likewise both base cases.

**Confirming the tree, worked bottom-up, produces `fib(4)`'s known correct value:** the leftmost `fib(2)` computes `fib(1) + fib(0) = 1 + 0 = 1`. `fib(3)` then computes `fib(2) + fib(1) = 1 + 1 = 2`. The rightmost `fib(2)` computes `fib(1) + fib(0) = 1 + 0 = 1`. `fib(4)` computes `fib(3) + fib(2) = 2 + 1 = 3` — matching Lesson 29's already-verified `fib(4)` result exactly (visible directly in that lesson's `(map fib '(0 1 2 3 4 5))` output, `(0 1 1 2 3 5)`).

### Walkthrough

- **The full tree diagram, drawn with branching indentation** — first appearance of *evaluation tree*, built directly from Concept Unit 2's identified branch points, at every level of `(fib 4)`'s computation.
- **Two separate nodes both labeled `fib(2)`** — confirms directly, visually, that `fib(2)` is computed as two entirely separate branches of the tree, not shared or reused between them — a fact Concept Unit 4 examines for its consequences.
- **The bottom-up arithmetic, reaching `3`** — a reappearance of innermost-first reduction (Lesson 4), applied here to a tree's leaves and working back up to its root, confirming the tree is not just a structural diagram but an actual, checkable computation.

### CS Lens

This is the standard way of visualizing any computation whose recursive calls branch — a tree whose leaves are base cases and whose internal nodes combine their children's results, the same shape underlying recursive search, divide-and-conquer sorting, and parsing, all introduced later in this curriculum. Also recognized in: a tournament bracket, read from its early rounds (leaves) up to its champion (root); a corporate org chart, read from individual contributors up to the CEO; a family tree, read from ancestors down to a descendant, or the reverse; an arithmetic expression's own nested structure (Lesson 4), which is itself a tree, evaluated the same innermost-first way `(fib 4)`'s tree just was.

### SE Lens

The alternative to drawing the tree explicitly is to try to hold `fib(4)`'s branching structure in mind without writing it down, trusting intuition to track which calls are still pending and which have already returned. The real cost of that alternative grows quickly with tree depth — `fib(4)`'s tree is small enough to track mentally, but a deeper call, `fib(10)` or beyond, produces a tree with far more nodes than most people can reliably track without an external diagram. Drawing the tree explicitly, as this unit does, costs the effort of the diagram itself; it is what makes Concept Unit 4's next observation — how often each specific value gets recomputed — actually visible, rather than easy to miss.

---

## Concept Unit 4: Counting Calls — Noticing Repeated Work

### The Problem

Concept Unit 3's tree shows `fib(2)` appearing as two entirely separate nodes, computed independently, with no connection between them at all — the tree doesn't reuse one `fib(2)` computation for the other; it does the identical work twice. It's worth counting exactly how much of this repetition happens across the whole tree, and confirming the count against a real, running, instrumented version of `fib`.

### The New Code — Type It Yourself

```scheme
(define call-count 0)

(define (fib n)
  (set! call-count (+ call-count 1))
  (display "calling fib(") (display n) (display ")") (newline)
  (if (< n 2)
      n
      (+ (fib (- n 1)) (fib (- n 2)))))
```

### The Updated Project

This is `fib-traced.scm`, in full:

```scheme
(define call-count 0)

(define (fib n)
  (set! call-count (+ call-count 1))
  (display "calling fib(") (display n) (display ")") (newline)
  (if (< n 2)
      n
      (+ (fib (- n 1)) (fib (- n 2)))))

(define result (fib 4))
(display "result: ") (display result) (newline)
(display "total calls: ") (display call-count) (newline)
```

### Reference Source

`fib.scm` (Lesson 29, Concept Unit 3), with two additions: a shared counter, incremented on every call, and a `display` inside the procedure body itself, printing every call as it happens — not just the final result.

### Files affected

Created: `fib-traced.scm`.

### Change type

Add (new file, a diagnostic variant of `fib.scm`).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile fib-traced.scm
calling fib(4)
calling fib(3)
calling fib(2)
calling fib(1)
calling fib(0)
calling fib(1)
calling fib(2)
calling fib(1)
calling fib(0)
result: 3
total calls: 9
```

Verified this session.

**Checking this real output against Concept Unit 3's hand-drawn tree, node by node, in the order they'd actually be visited (left branch fully explored before the right branch begins, since `(fib (- n 1))` is written first inside the `+`):** `fib(4)`, `fib(3)`, `fib(2)` [the first one], `fib(1)`, `fib(0)`, `fib(1)` [`fib(3)`'s second child], `fib(2)` [`fib(4)`'s second child], `fib(1)`, `fib(0)` — nine calls, in exactly this order, matching the real output exactly.

**Counting how many times each value was called, from the real output:** `fib(4)`: once. `fib(3)`: once. `fib(2)`: twice. `fib(1)`: three times. `fib(0)`: twice. `1 + 1 + 2 + 3 + 2 = 9`, matching the real, machine-counted total exactly.

### Mechanical Walkthrough

- **`(define call-count 0)`** — a reappearance of `define` binding a plain value (Lesson 28), used here to hold a running total.
- **`(set! call-count (+ call-count 1))`** — first appearance of `set!` (see Objects and methods used), incrementing the counter by reading its current value and reassigning it, a reappearance of *reassignment* (Lesson 6) in real code.
- **`(display "calling fib(") (display n) (display ")") (newline)`** — a reappearance of `display` and `newline` (Lesson 28), called four times in a row to assemble one readable line of output from several pieces.
- **`fib(2)` appearing twice, `fib(1)` appearing three times, `fib(0)` appearing twice, in the real output** — not a new syntactic element, but the concrete, machine-verified confirmation of exactly what Concept Unit 3's tree diagram predicted: real, repeated computation of the same values, entirely independently, within one top-level call.

### CS Lens

This is the discovery of overlapping subproblems — a single top-level computation recomputing the identical smaller result more than once, because nothing in `fib`'s current definition remembers a result once it's been computed. Also recognized in: recalculating the same expensive database query multiple times within one page load, when the result never changed between calls; a hiking group repeatedly re-measuring the same trail segment because no one wrote the distance down after the first measurement; a spreadsheet recalculating the same intermediate formula in several different cells instead of computing it once and referencing it; a research team unknowingly re-deriving a result another team in the same building already worked out the week before.

### SE Lens

The alternative to counting calls explicitly is to notice that `fib` "seems a little slow" for larger inputs without ever identifying why. The real cost of that alternative is a wasted opportunity: this lesson's tree and real call count make the actual cause of that slowness completely visible — `fib(2)` computed twice, and every base case beneath it recomputed along with it — a cause that, once seen this clearly, points directly toward an obvious fix. Counting calls explicitly, and confirming the count against real output as this unit does, costs one small instrumentation change to an already-written procedure; it is what turns a vague sense of inefficiency into a precise, countable, fixable observation — one this curriculum will return to directly, once the tools for actually fixing it (memoization) are built.

---

## Concept Unit 5: Verifying a Trace Against Real Output

### The Problem

Concept Unit 3's tree and Concept Unit 4's hand count were both worked out on paper before Concept Unit 4's real run confirmed them. It's worth stating directly, and honestly, what role the real run actually played — connecting this back to Lesson 22's evidence-versus-proof distinction, applied here to a trace rather than to a mathematical claim.

### No isolated lab for this step

This concept has no code of its own to isolate — the relationship between the hand-drawn trace and the real run is examined directly below, not through a construct with its own syntax.

### Applying It — What the Real Run Actually Confirmed

**What was established before any code ran at all:** Concept Unit 2's structural argument (fib's recursive case makes two calls, so its tree branches) and Concept Unit 3's tree diagram (drawn entirely from that structural argument, plus `fib`'s own stated base cases) were both reasoned out completely on paper, using nothing but `fib`'s own definition.

**What the real, instrumented run in Concept Unit 4 added:** a genuine, independent check — evidence, in Lesson 22's sense, that the hand-drawn tree actually matches what a real interpreter does, not merely what this lesson's own reasoning predicted it should do.

**Why this check was still worth doing, even though the tree was reasoned out correctly beforehand:** Lesson 22 already established that a plausible-looking argument can still contain an error nobody noticed — the tree in Concept Unit 3 could, in principle, have been drawn wrong (a missed branch, a miscounted level) despite looking correct, and nothing about it looking correct on the page would have caught that. The real run is what actually caught, or in this case confirmed the absence of, exactly that risk.

**Stating the honest relationship between the two, precisely:** the hand-drawn tree explains *why* the real output looks the way it does — it's the reasoning behind the numbers. The real output confirms the tree was reasoned out correctly — it's the check the reasoning alone could never provide on its own. Neither one replaces the other.

### Walkthrough

- **The structural argument and the tree, both built before Concept Unit 4's code ran** — a direct reappearance of everything Concept Units 2 and 3 already established, examined here specifically for when it was produced relative to the real run.
- **The real run's nine-call output, reappearing from Concept Unit 4** — treated here explicitly as evidence confirming the tree, in Lesson 22's precise sense, rather than as the source of the tree itself.
- **"neither one replaces the other"** — not a new concept, but the precise, honest statement of this unit's point, directly paralleling Lesson 25's own closing distinction between a proven model and a tested implementation.

### CS Lens

This is the same relationship Lesson 25 already established between a mathematical proof and a real test, now applied specifically to tracing a recursive computation: reasoning about a program's structure and actually running it are two different, complementary checks, neither one sufficient alone. Also recognized in: a flowchart of a process, checked against an actual audit of the process as performed; an architect's structural calculations, checked against an actual load test of the built structure; a musical score's notated rhythm, checked against a recording of it actually performed; a predicted eclipse path, checked against actual, real-time astronomical observation.

### SE Lens

The alternative to running the real, instrumented version is to trust the hand-drawn tree completely, on the strength of its reasoning alone. The real cost of that alternative is exactly Lesson 22's original warning, applied here: a tree that looks right, reasoned out carefully, is not guaranteed to be right, and the only way to know for certain is to check it against something independent of the reasoning that produced it. Running the real, instrumented version, as this lesson does, costs the small effort of adding a counter and a `display` call; it converts "I reasoned this out and it looks right" into "I reasoned this out, and a real interpreter confirms it," which is a meaningfully stronger claim.

---

## Closing

### Connect the pieces

One call, `(fib 4)`, traced through every unit built in this lesson, start to finish:

1. **The linear baseline (Unit 1):** `factorial`'s trace confirmed to be a straight line — one call, one further call, always.
2. **The branch point identified (Unit 2):** `fib`'s recursive case shown to make two calls, splitting `(fib 4)` into `(fib 3)` and `(fib 2)`, and splitting again at every level beneath.
3. **The full tree drawn (Unit 3):** nine nodes, worked bottom-up to confirm the known-correct result, `3`.
4. **The tree checked against real output (Unit 4):** `fib-traced.scm`, run for real, producing exactly nine calls in exactly the predicted order, with `fib(2)` appearing twice and `fib(1)` three times.
5. **The relationship between the two named honestly (Unit 5):** the tree as reasoning, the real run as confirming evidence, neither one replacing the other.

Unit 4's real output is checked, node by node, against Unit 3's tree — not treated as a fresh discovery, but as the specific, expected confirmation of a structure already fully reasoned out on paper.

### What breaks without this

Suppose Concept Unit 3's tree had been drawn with one small mistake — say, `fib(3)`'s second child mistakenly drawn as `fib(2)` instead of `fib(1)`, an easy slip given how similar the two branches look. Without Concept Unit 4's real, instrumented run to check against, that mistake could have gone completely unnoticed: the tree would still look plausible, would still be drawn in a reasonable tree shape, and nothing about examining it alone would reveal the error, exactly the same risk Lesson 22 already demonstrated for a flawed proof that merely resembles a valid one. The real run's actual call sequence — `fib(4), fib(3), fib(2), fib(1), fib(0), fib(1), fib(2), fib(1), fib(0)` — would have disagreed with the mistaken tree at the exact point of the error, immediately exposing it. Restoring this lesson's discipline — never trusting a hand-drawn evaluation tree without checking it against a real, instrumented run, especially for a tree complex enough that a small mistake could hide in it — is what catches an error like this before it's carried forward into later reasoning that assumes the tree is correct.

### Exercises

1. **Observe.** Take a recursive procedure from your own Lesson 28 or Lesson 29 exercises and determine, by examining its recursive case directly, how many recursive calls it makes per invocation, the way Concept Units 1 and 2 did for `factorial` and `fib`.
2. **Formalize.** If your Exercise 1 procedure branches, draw its full evaluation tree by hand for a small input, the way Concept Unit 3 drew `fib(4)`'s tree, and work it bottom-up to confirm it produces the correct result.
3. **Formalize.** Add a call counter and a per-call `display` to your Exercise 1 procedure, following Concept Unit 4's exact instrumentation technique, and run it for real.
4. **Explain.** Check your Exercise 3 real output against your Exercise 2 tree, node by node, the way Concept Unit 4 checked `fib-traced.scm`'s output against the hand-drawn tree. Report whether they matched, and if not, where the disagreement was.
5. **Explain.** If your Exercise 1 procedure branches, count how many times each distinct value gets recomputed, the way Concept Unit 4 counted `fib(2)` appearing twice and `fib(1)` three times, using your real, instrumented output.

### Definition of done

- [ ] You can determine, from a recursive procedure's own code, how many recursive calls it makes per invocation, without running it.
- [ ] You can draw a complete evaluation tree for a branching recursive call, by hand, and work it bottom-up to a correct final value.
- [ ] You can instrument a recursive procedure to count and print every call it makes, and verify a hand-drawn tree against the real result.
- [ ] You can explain, in your own words, why a hand-drawn trace and a real run check different things, and why neither replaces the other.
- [ ] You completed Exercises 1–5 using your own recursive procedure, not `factorial` or `fib`.
- [ ] Commit `fib-traced.scm` and your Exercise 3 instrumented procedure, with a commit message stating how many times your Exercise 1 procedure's most-repeated value was recomputed, if it branches at all.
