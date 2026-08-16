# Lesson 75: Recurrences

**What you will build:** `fib-call-count`, a real procedure that predicts exactly how many calls `fib` (Lesson 31) will make for a given `n` — derived directly from `fib`'s own code, before running `fib` at all. Real, verified evidence this session: `fib-call-count(4) = 9`, matching Lesson 31's own real, measured `fib(4)` call count exactly. More importantly, real, *fresh* evidence: `fib-call-count(10) = 177` and `fib-call-count(20) = 21891`, both confirmed against actually running a freshly instrumented `fib` at those sizes for the first time this curriculum has measured them — numbers nobody derived first and checked after, but predicted first and confirmed after. The transferable point: Lesson 46 showed correctness could be predicted from a recursive definition's shape alone, by the leap of faith, without tracing execution. This lesson shows *cost* can be predicted the identical way — by mechanically translating a recursive procedure's own shape into a **recurrence**, before ever running it.

**What you need to know first:** Lesson 31 (`FP-L031-tracing-recursive-evaluation.md`) — specifically `fib-traced` and its real, measured call count of `9` at `n = 4`, the evidence this lesson's recurrence is checked against. Lesson 46 (`FP-L046-recursive-invariants.md`) — specifically the recursive leap of faith, whose reasoning this lesson applies to cost instead of correctness.

**Terms introduced in this lesson**

- **Recurrence** — a formula for a recursive algorithm's real cost, defined in terms of the identical cost formula applied to smaller inputs, mirroring the algorithm's own recursive structure exactly. It exists so a cost can be *predicted* directly from a procedure's shape — the same leap-of-faith reasoning Lesson 46 used to predict correctness without tracing execution, now applied to counting instead.

---

## Concept Unit 1: Predicting Cost From Shape Alone

### The Problem

Every recursive procedure's real cost in this curriculum so far — `fib`'s `9` calls at `n = 4` (Lesson 31), `all-subsets`'s real call counts (Lesson 51), `fast-expt`'s `27` calls (Lesson 66) — was discovered by actually running instrumented code and counting. Lesson 46 showed something different was possible for *correctness*: trusting a recursive definition's own shape, by the leap of faith, to reason about what it computes without tracing a single execution. It's worth asking whether an analogous shortcut exists for *cost* — predicting how many calls a procedure will make directly from its own code, before running anything.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, using real numbers this curriculum has already measured.

### Applying It — Why This Is a Genuinely Different Question From Measuring

Measuring `fib(4)`'s cost (Lesson 31) required actually running `fib`, instrumented, and reading off `call-count`'s final value — real evidence, but *after the fact*, and only for the one specific `n` that was run. Predicting `fib(4)`'s cost, if it's possible at all, would mean reading `fib`'s own recursive-case code — `(+ (fib (- n 1)) (fib (- n 2)))` — and reasoning about the number of calls it implies for *any* `n`, checked afterward against real measurement rather than discovered by it.

### Walkthrough

- **"discovered by actually running instrumented code"** — names precisely what every prior cost measurement in this curriculum has been: real, but retrospective.
- **The reframed goal — predicting before running** — sets up exactly what Concept Unit 2's translation rule needs to deliver.

### CS Lens

This is the same shift in kind Lesson 46 made for correctness, now applied to cost: reasoning about a recursive definition's *structure*, rather than tracing or running it, to answer a question about every input at once rather than one input at a time. Also recognized in: an architect predicting a building's material cost directly from its blueprint, before any construction happens, rather than only discovering the true cost after building it; a recipe's stated prep time, derived from its own steps, checked afterward against how long cooking it actually took.

### SE Lens

The alternative to seeking a predictive shortcut is to accept that a recursive procedure's cost can only ever be known by running it at whatever specific size is needed, every time. The real cost of that alternative is exactly what Lesson 66's `fast-expt` versus `naive-expt` comparison already hinted at: some recursive procedures cost dramatically more at realistic sizes than anyone would want to discover by actually running them first. A predictive shortcut, if a sound one exists, would let a cost be estimated *before* committing to running something expensive — precisely the motivation Concept Unit 2 turns into a real, mechanical rule.

---

## Concept Unit 2: Defining a Recurrence — The Translation Rule

### The Problem

Concept Unit 1's goal needs a precise, mechanical procedure for turning a piece of recursive code into a cost prediction — not a vague impression of "it looks expensive," but a real formula, derived the same reliable way every time.

### No isolated lab for this step

This concept has no code of its own to isolate — the rule is stated directly below, and Concept Unit 3 applies it to real code.

### Applying It — The Translation Rule, Stated Precisely

Given a recursive procedure, its cost formula — its **recurrence**, written `T(n)` — is built from three ingredients, read directly off the code:

1. **Every recursive call becomes a `T` term.** A call `(f (- n 1))` inside `f`'s own definition contributes a `T(n - 1)` term to `f`'s recurrence; a call `(f (/ n 2))` contributes `T(n/2)`; two separate recursive calls contribute two separate `T` terms, added together.
2. **Everything else in the same case becomes a stated cost, usually a constant.** Comparisons, arithmetic, and any other non-recursive work performed in that case, beyond the recursive calls themselves, contributes its own real cost — most often a small constant, written `1` (or `c`, if the exact constant doesn't matter yet), since fixed, non-recursive work per call doesn't grow with `n`.
3. **Each base case gets its own stated cost, separately.** Since a base case makes no recursive call, its entire cost is non-recursive work — again, usually a small constant.

Combining all three for a procedure with one recursive case (two recursive calls) and one base case gives a recurrence of the shape: `T(n) = T(smaller) + T(smaller) + c` for `n` past the base case, and `T(base) = c'` stated separately.

### Walkthrough

- **Rule 1, recursive calls become `T` terms** — the mechanical heart of the translation: the recurrence's own right-hand side literally mirrors the code's own recursive call sites, one for one.
- **Rule 2, non-recursive work becomes a constant** — captures the cost of everything the recursive calls themselves don't already account for.
- **Rule 3, base cases stated separately** — without this, the recurrence would have no starting point to actually compute from, the same way a recursive definition without a base case would never terminate.

### CS Lens

This is a direct structural mapping from code to mathematics: a recurrence is not an approximation or a summary of what a recursive procedure does, it is the *identical* recursive structure, restated in terms of cost instead of value — which is exactly why it can be derived from the code alone, without running it. Also recognized in: a company's total labor cost formula, built by literally mirroring its own org chart — each manager's reported cost includes their direct reports' costs, recursively, down to individual contributors' base salaries.

### SE Lens

The alternative to a precise, three-part rule is to write down a recurrence informally, by intuition, risking a mismatch between what the formula says and what the code actually does. The real cost of that alternative is a prediction that looks plausible but was never actually checked against the code it claims to describe — exactly the gap this curriculum has warned against since Lesson 22. Stating the rule mechanically, tied to specific, nameable parts of the code, is what makes Concept Unit 3's translation checkable rather than merely asserted.

---

## Concept Unit 3: Translating fib's Real Code Into a Recurrence

### The Problem

Concept Unit 2's rule needs applying to a real, already-built, already-measured procedure — `fib` (Lesson 31) — to see whether it actually predicts the one real number this curriculum already has (`fib(4)`'s `9` calls), and whether it correctly predicts fresh numbers nobody has measured yet.

### Applying the Rule to fib's Real Code

`fib`'s real code, unchanged from Lesson 31:

```scheme
(define (fib n)
  (set! call-count (+ call-count 1))
  (if (< n 2)
      n
      (+ (fib (- n 1)) (fib (- n 2)))))
```

**Applying Rule 1:** `fib`'s recursive case makes exactly two recursive calls, `(fib (- n 1))` and `(fib (- n 2))` — two `T` terms, `T(n - 1)` and `T(n - 2)`.

**Applying Rule 2:** everything else in that case — the `set!`, the `if`'s condition check, the `+` combining the two recursive results — is a fixed, small amount of non-recursive work per call, however many individual operations it actually is: one constant, `1`.

**Applying Rule 3:** the base case (`n < 2`) makes no recursive call at all; its entire cost is the same kind of small, fixed non-recursive work: one constant, `1`.

**The complete recurrence:** `T(n) = T(n - 1) + T(n - 2) + 1` for `n ≥ 2`, and `T(0) = T(1) = 1`.

### The New Code — Type It Yourself

```scheme
(define (fib-call-count n)
  (if (< n 2)
      1
      (+ (fib-call-count (- n 1)) (fib-call-count (- n 2)) 1)))
```

### The Updated Project

This is `recurrence.scm`, in full:

```scheme
(define call-count 0)

(define (fib n)
  (set! call-count (+ call-count 1))
  (if (< n 2)
      n
      (+ (fib (- n 1)) (fib (- n 2)))))

(define (fib-call-count n)                                    ; ← new
  (if (< n 2)                                                  ; ← new
      1                                                         ; ← new
      (+ (fib-call-count (- n 1)) (fib-call-count (- n 2)) 1))) ; ← new

(for-each
 (lambda (n)
   (set! call-count 0)
   (fib n)
   (display "n=") (display n)
   (display " real-call-count=") (display call-count)
   (display " fib-call-count(n)=") (display (fib-call-count n))
   (newline))
 (list 4 10 20))
```

`fib` and `call-count` are Lesson 31's own, unchanged; `fib-call-count` is this lesson's new, real translation of the recurrence derived above, structurally mirroring `fib`'s own shape almost exactly — because that is precisely what a correct translation should look like.

### Reference Source

Lesson 31's `fib` (`FP-L031-tracing-recursive-evaluation.md`, Concept Unit 4), unchanged; `fib-call-count` is new, derived directly above from `fib`'s own code via Concept Unit 2's rule — not a from-scratch invention.

### Files affected

Created: `recurrence.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile recurrence.scm
n=4 real-call-count=9 fib-call-count(n)=9
n=10 real-call-count=177 fib-call-count(n)=177
n=20 real-call-count=21891 fib-call-count(n)=21891
```

Verified this session — at `n = 4`, `fib-call-count(4) = 9`, matching Lesson 31's own real, independently measured `fib(4)` call count exactly, not approximately. At `n = 10` and `n = 20`, `fib-call-count` predicts `177` and `21891` — and running a freshly instrumented `fib` at those identical sizes, for the first time this curriculum has measured them, confirms both exactly. The prediction came first; the measurement confirmed it afterward, the reverse order from every prior cost measurement in this curriculum.

### Mechanical Walkthrough

- **`(if (< n 2) 1 ...)`** — a reappearance of `if` and `<`; `fib-call-count`'s own base case, directly implementing Rule 3's stated base cost of `1`.
- **`(+ (fib-call-count (- n 1)) (fib-call-count (- n 2)) 1)`** — a reappearance of `+` and `-`; directly implementing the derived recurrence's right-hand side: two recursive `T`-terms plus the constant `1` from Rule 2, exactly mirroring `fib`'s own two recursive calls plus its own non-recursive work.
- **The real, exact match at `n = 4`, against already-existing evidence** — confirms the translation rule against a known result.
- **The real, exact match at `n = 10` and `n = 20`, against freshly gathered evidence** — confirms the recurrence genuinely predicts, rather than merely restating, a result already known in advance.

### CS Lens

This is a recurrence functioning exactly as intended: a cost formula derived purely from a procedure's own shape, checked against real measurement, and then trusted to predict sizes not yet measured — the same derive-then-verify discipline this curriculum has applied to correctness since Lesson 22, now applied to cost prediction specifically. Also recognized in: a bridge engineer's load formula, derived from the bridge's own structural design, checked against a known reference case, then trusted to predict the safe load for a bridge of a new size not yet built.

### SE Lens

The alternative to deriving `fib-call-count` from the rule is to keep measuring `fib`'s cost only by actually running it at whatever size is needed, accepting that any size not yet run is simply unknown until it is. The real cost of that alternative, at genuinely large `n`, is exactly what `fib`'s own exponential growth (visible already in `9` calls at `n = 4` growing to `21891` at `n = 20`) makes expensive to discover by brute force alone. Having a verified recurrence, as this unit derives, means a cost at a much larger `n` can be estimated by computing `fib-call-count` — itself still real work, but far cheaper than running the true exponential `fib` at that size, and Lesson 76 will show a closed form removing even that cost.

---

## Concept Unit 4: One Rule, Not One Trick — and Its Honest Limits

### The Problem

Concept Unit 3 worked for `fib`. It's worth checking, honestly, whether Concept Unit 2's rule is a genuinely general method or something that happened to work only because `fib`'s two recursive calls are so symmetric.

### No isolated lab for this step

This concept has no code of its own to isolate — the check is a direct application of the rule to a second, structurally different real procedure, without re-deriving or re-verifying it in full.

### Applying It — Checking the Rule Against fast-expt's Different Shape

Lesson 66's `fast-expt`, unchanged:

```scheme
(define (fast-expt a n)
  (cond ((= n 0) 1)
        ((even? n) (square (fast-expt a (/ n 2))))
        (else (* a (fast-expt a (- n 1))))))
```

Applying Rule 1 here is less tidy than it was for `fib`: `fast-expt` makes exactly *one* recursive call per invocation, same as `fib`'s pattern of "one `T` term per recursive call" — but *which* call, `(fast-expt a (/ n 2))` or `(fast-expt a (- n 1))`, depends on whether `n` is even or odd, a condition the recurrence itself would need to track to be fully precise. A simplified version, ignoring the odd case as a comparatively rare detour (Lesson 66 confirmed odd steps happen only until the next even number, not at every level), gives roughly `T(n) = T(n/2) + 1` — structurally different from `fib`'s recurrence in a way worth naming: one `T` term instead of two.

**Naming the honest limit:** the translation rule still applies — every recursive call still becomes a `T` term, exactly as Rule 1 states — but `fast-expt`'s branching on even versus odd means a fully precise recurrence needs to track which branch is taken, something this lesson's simplified `T(n) = T(n/2) + 1` glosses over. A completely rigorous recurrence for `fast-expt` is possible, but not attempted here — this unit's purpose is confirming the *rule itself* transfers to a differently-shaped procedure, not producing a second fully-verified prediction to match Concept Unit 3's rigor.

### Walkthrough

- **`fast-expt`'s single recursive call per branch, versus `fib`'s two** — the concrete structural difference between a one-term and a two-term recurrence, both produced by the identical translation rule.
- **The explicit "not attempted here" admission** — distinguishes a rule that's been shown to *apply* from a claim that's been *fully verified*, honestly, rather than blurring the two.

### CS Lens

This is exactly the reason recurrences come in recognizably different shapes across real algorithms — one-term recurrences like `T(n) = T(n/2) + 1` (halving, single-branch recursion) and two-term recurrences like `fib`'s `T(n) = T(n-1) + T(n-2) + 1` (branching recursion) — and why the two will need different solving techniques, taken up directly in Lessons 76 and 77. Also recognized in: a single hallway with one door at the end (one path, one recursive step) versus a hallway that splits into two separate hallways at every junction (branching into two recursive paths) — genuinely different shapes of the identical "keep going smaller" idea.

### SE Lens

The alternative to checking a second, differently-shaped procedure is to let Concept Unit 3's single successful translation stand as proof the rule works in general. The real cost of that alternative is exactly the kind of overgeneralization this curriculum has cautioned against since Lesson 24 (drawing a general conclusion from one confirming example) — a rule confirmed once, on a procedure with unusually clean symmetry, could easily hide a limitation that only shows up on a differently-shaped procedure. Checking `fast-expt` honestly, including admitting where the translation gets less clean, is what keeps this lesson's claim about the rule's generality from outrunning what was actually checked.

---

## Closing

### Connect the pieces

One recursive procedure's cost, predicted before being measured, then confirmed by real, fresh evidence:

1. **The goal, posed (Unit 1):** predict cost directly from a recursive procedure's shape, the way Lesson 46 predicted correctness, instead of only ever measuring cost after running code.
2. **A precise, three-part rule (Unit 2):** every recursive call becomes a `T` term, non-recursive work becomes a stated constant, base cases get their own stated cost.
3. **Real translation and verification (Unit 3):** `fib`'s recurrence, `T(n) = T(n-1) + T(n-2) + 1`, `T(0) = T(1) = 1`, matching Lesson 31's known `fib(4) = 9` exactly, then correctly predicting fresh, previously-unmeasured results at `n = 10` and `n = 20`.
4. **Honest generality check (Unit 4):** the identical rule applied to `fast-expt`'s differently-shaped recursion, confirming the rule transfers while honestly naming what a fully rigorous version would still need to handle.

Every claim in this lesson traces to either a real, checked match against known or freshly gathered evidence (Units 3) or an explicit, named limitation (Unit 4) — prediction-then-verification, this curriculum's standing discipline since Lesson 22, now running in the opposite direction from usual: the number was predicted first, and reality confirmed it afterward.

### What breaks without this

Suppose an engineer needed to decide, before writing any code, whether a proposed recursive algorithm would be fast enough for a system's real, much larger expected input sizes — say, `n` in the thousands, far beyond anything convenient to just run and time directly during design. Without a recurrence, the only honest answer is "build it and find out," potentially after real implementation effort has already been spent. With a recurrence, derived directly from the *planned* recursive structure before a full implementation even exists, the same question can be answered on paper — exactly the real, practical payoff `fib-call-count`'s correct advance prediction of `21891` demonstrated concretely in this lesson.

### Exercises

1. **Observe.** Before checking, predict whether `all-subsets`'s *final, `let`-based* version (Lesson 51) — which makes exactly one recursive call per invocation, not two — should have a recurrence with one `T` term or two, using Rule 1 directly.
2. **Formalize.** Write out `all-subsets`'s full recurrence, following Concept Unit 2's rule exactly, and implement it as a real Scheme procedure, following Concept Unit 3's `fib-call-count` as a model.
3. **Explain.** Run your Exercise 2 procedure at `n = 10`, and confirm it predicts Lesson 51's own real, measured call count for the `let`-based `all-subsets` at that size (re-run Lesson 51's instrumented version yourself if the exact number isn't already at hand).
4. **Formalize.** Write a complete, non-simplified recurrence for `fast-expt` that correctly accounts for both the even and odd branches Concept Unit 4 left simplified, and check it against `fast-expt`'s own real call count at a specific `n` of your choice.
5. **Explain.** In your own words, state why a recurrence that matches real measured evidence at one specific `n` (the way an untested guess might, by coincidence) is weaker evidence of a correct translation than a recurrence that correctly predicts a *fresh*, previously unmeasured `n` — referencing this lesson's own `n = 10` and `n = 20` results specifically.

### Definition of done

- [ ] You can state the three-part translation rule from memory and apply it to a recursive procedure you haven't seen analyzed before.
- [ ] You can explain, in your own words, why a two-term recurrence and a one-term recurrence correspond to genuinely different shapes of recursive code, not just different formulas.
- [ ] You derived `fib-call-count` (or reconstructed it) and confirmed it against both known and freshly gathered real evidence.
- [ ] You can explain what Concept Unit 4 admitted was left incomplete about `fast-expt`'s recurrence, and why that honesty matters more than a falsely tidy formula would.
- [ ] You completed Exercises 1–5 using a procedure not used as this lesson's own worked example.
- [ ] Commit your Exercise 2 through 5 findings, with a commit message stating the procedure you analyzed and the recurrence you derived for it.
