# Lesson 53: Repeated Subproblems

**What you will build:** Real, instrumented confirmation that `fib(10)` makes `177` total calls while touching only `11` distinct values of `n` — and a precise explanation of why this particular redundancy is fundamentally different from Lesson 51's, one that `let` alone cannot fix. The transferable problem this lesson is actually about: Lesson 31 first noticed `fib(4)` recomputing `fib(2)` from scratch, and Lesson 51 fixed a superficially similar redundancy with a single `let`. `fib`'s redundancy survives that fix completely, because it isn't caused by writing the same call twice in one place — it's caused by two genuinely different calls, `fib(n − 1)` and `fib(n − 2)`, independently needing the same smaller subproblems many calls later, deep inside their own separate recursions.

**What you need to know first:** Lesson 29 (`FP-L029-base-cases.md`) — specifically `fib.scm`, reused directly throughout. Lesson 31 (`FP-L031-tracing-recursive-evaluation.md`) — specifically `fib(4)`'s nine-call trace, revisited directly and confirmed to match this lesson's own recurrence. Lesson 51 (`FP-L051-generating-possibilities.md`) — specifically the `let`-based fix for redundant computation, deliberately contrasted against this lesson's different kind of redundancy. Lesson 52 (`FP-L052-counting-recursive-possibilities.md`) — specifically deriving a recurrence for a procedure's own call count, applied here to `fib` directly.

**Terms introduced in this lesson**

- **Overlapping subproblems** — a situation where a recursive computation's different branches independently arrive at the exact same smaller subproblem more than once, each one solving it completely from scratch. `fib(n − 1)` and `fib(n − 2)` are different calls, each with its own independent recursion — but both recursions, several levels down, eventually call `fib(n − 2)`, `fib(n − 3)`, and so on, recomputing the identical values entirely separately each time.

## Objects and methods used

- **`member`**
  - *What it is:* a real Scheme procedure checking whether a value appears anywhere in a list.
  - *Implementation:* takes a value and a list, returning the matching tail of the list if found, `#f` otherwise; confirmed this session as `(member n seen-args)`.
  - *Its use:* Concept Unit 3's instrumented `fib` uses it to check whether a given `n` has already been recorded, distinguishing a genuinely new subproblem from a repeat of one already seen.

---

## Concept Unit 1: Revisiting fib's Redundancy — Now Countable

### The Problem

Lesson 31 traced `fib(4)`'s nine calls by hand and noticed `fib(2)` appeared twice, `fib(1)` three times. Lesson 52 built the tool to derive such counts mathematically rather than only tracing them by hand. It's worth applying that tool directly to `fib`, to see whether its total call count can be predicted the same way `all-subsets`'s could.

### No isolated lab for this step

This concept has no code of its own to isolate — extracting `fib`'s own recurrence is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Deriving fib's Call-Count Recurrence

**`fib`'s recursive case, reappearing from Lesson 29:** `(+ (fib (- n 1)) (fib (- n 2)))`.

**Letting `F(n)` denote the total number of calls `(fib n)` makes, including itself, and reading the recursive case as an equation about `F`:** one call for the current invocation, plus every call `(fib (- n 1))` makes — `F(n − 1)` of them — plus every call `(fib (- n 2))` makes — `F(n − 2)` of them.

**The recurrence:** `F(n) = 1 + F(n − 1) + F(n − 2)`, for `n > 1`.

**The base cases, read directly from `fib`'s own two base-case-covering values:** `F(0) = 1` and `F(1) = 1` — each one makes exactly one call, itself, with no further recursion.

**Checking this recurrence against Lesson 31's own hand-traced count:** `F(2) = 1 + F(1) + F(0) = 1 + 1 + 1 = 3`. `F(3) = 1 + F(2) + F(1) = 1 + 3 + 1 = 5`. `F(4) = 1 + F(3) + F(2) = 1 + 5 + 3 = 9` — matching Lesson 31's own real, traced count of nine calls for `fib(4)` exactly.

### Walkthrough

- **`fib`'s recursive case, reappearing from Lesson 29** — the direct source this unit's recurrence is extracted from.
- **`F(n) = 1 + F(n − 1) + F(n − 2)`** — a reappearance of Lesson 52's recurrence-extraction technique, applied here to a procedure with two recursive calls rather than one.
- **`F(4) = 9`, checked against Lesson 31's real trace** — confirms the derived recurrence agrees with data already established independently, several lessons earlier.

### CS Lens

This is Lesson 52's exact technique, confirmed to generalize immediately to a mutually-branching recursion like `fib`'s, rather than being specific to the single-branch, doubling structure `all-subsets` happened to have. Also recognized in: a population model's recurrence, generalizing immediately from a single-parent species to one with two-parent reproduction; a financial model's recurrence, generalizing immediately from simple compounding to a case depending on two separate prior periods; an engineering load calculation, generalizing immediately from a single-support structure to one with two independent supports.

### SE Lens

The alternative to re-deriving the recurrence for `fib` specifically is to assume Lesson 52's `all-subsets` result, `2ⁿ`, applies here too, since both involve doubling-looking recursive calls. The real cost of that alternative would be a wrong prediction — `fib`'s two recursive calls shrink by different amounts (`n − 1` and `n − 2`, not both `n − 1`), producing a genuinely different recurrence and, as Concept Unit 2 examines, a genuinely different growth rate. Re-deriving the recurrence directly from `fib`'s own code, as this unit does, costs nothing beyond the same careful extraction already practiced; it avoids exactly this kind of unchecked, incorrect assumption.

---

## Concept Unit 2: Overlapping Subproblems — Not Just Redundant, but Identical

### The Problem

Lesson 51's redundancy and `fib`'s redundancy can look superficially similar — both involve a recursive call happening more times than strictly necessary — but they arise for genuinely different reasons, and it's worth stating the difference precisely before assuming Lesson 51's fix, `let`, applies here too.

### No isolated lab for this step

This concept has no code of its own to isolate — the distinction is demonstrated directly below, not through a construct with its own syntax.

### Applying It — Two Different Kinds of Redundancy

**Lesson 51's redundancy, restated precisely:** the *same expression*, `(all-subsets (cdr items))`, was written twice in one place in the code, causing the identical call to be made twice at every level — fixed entirely by computing it once and naming it with `let`.

**`fib`'s redundancy, examined the same way:** `(fib (- n 1))` and `(fib (- n 2))` are two *different* expressions, with different arguments, each written exactly once. Neither one is a duplicate of the other at the point they're called.

**Tracing where the actual overlap comes from, instead:** `(fib (- n 1))`'s own recursion eventually calls `(fib (- n 2))`, deep inside itself. `(fib (- n 2))`, called directly at the top level, computes the exact same value independently, entirely separately from the copy buried inside `(fib (- n 1))`'s own recursion. Neither call site can see the other; each one solves `fib(n − 2)` completely from scratch.

**Confirming `let` cannot fix this the way it fixed `all-subsets`:** `let` binds a name to a value computed once, within one call's own local scope — it has no way to let a call happening inside `(fib (- n 1))`'s recursion share a result with a completely separate call happening inside `(fib (- n 2))`'s recursion, several function calls away, with no shared `let` scope connecting them at all.

**Naming this precisely:** overlapping subproblems — not one expression written twice, but two independent computations, arising naturally from otherwise entirely correct code, that happen to need the identical smaller answer without any way to know the other one already computed it.

### Walkthrough

- **Lesson 51's redundancy, restated as "the same expression written twice"** — establishes the baseline this unit is about to contrast against.
- **`fib`'s redundancy, traced to two different, correctly-written expressions whose recursions happen to overlap** — the central distinction this unit exists to draw.
- **The explicit confirmation that `let` cannot help here** — not a new concept, but a direct, honest check against the fix this curriculum already has available, confirming it genuinely doesn't apply.
- **"overlapping subproblems"** — first appearance of this lesson's central term, defined by precise contrast with Lesson 51's different kind of redundancy.

### CS Lens

This is one of the two defining conditions (the other being optimal substructure, examined once dynamic programming is properly introduced) that separates problems where a specific optimization technique applies from problems where it doesn't — recognizing the distinction precisely, as this unit does, is what will let this curriculum correctly identify, later, exactly which problems that technique actually helps. Also recognized in: two separate research teams, working independently and without communication, both re-deriving the identical intermediate result because neither one knew the other needed it too; two separate delivery routes both passing through the identical intersection, neither driver aware the other already checked the traffic there; two separate students, working independently on related homework problems, both re-deriving the identical lemma because neither one knew to share it.

### SE Lens

The alternative to distinguishing these two kinds of redundancy is to reach for `let` reflexively whenever a recursive procedure seems to be doing repeated work, without checking whether the repetition is actually the same-expression-written-twice kind Lesson 51 fixed. The real cost of that alternative is real, wasted effort: applying `let` to `fib`'s code changes nothing about its `2ⁿ`-scale redundancy, because there's no single expression computed twice in one place to name and reuse — the repetition is scattered across genuinely separate branches of the recursion. Diagnosing which kind of redundancy is actually present, as this unit teaches, costs the careful tracing just performed; it is what correctly points toward Lesson 54's actual fix, rather than a fix that happens not to apply here.

---

## Concept Unit 3: Detecting Overlapping Subproblems — Distinct vs. Total Calls

### The Problem

Concept Unit 2's claim — that `fib`'s branches independently arrive at identical subproblems — is worth confirming directly, by instrumenting `fib` to record not just how many total calls it makes, but how many *distinct* values of `n` it's ever actually called with.

### The New Code — Type It Yourself

```scheme
(define total-calls 0)
(define seen-args '())

(define (fib n)
  (set! total-calls (+ total-calls 1))
  (if (not (member n seen-args))
      (set! seen-args (cons n seen-args)))
  (if (< n 2)
      n
      (+ (fib (- n 1)) (fib (- n 2)))))
```

### The Updated Project

This is `fib-overlap.scm`, in full:

```scheme
(define total-calls 0)
(define seen-args '())

(define (fib n)
  (set! total-calls (+ total-calls 1))
  (if (not (member n seen-args))
      (set! seen-args (cons n seen-args)))
  (if (< n 2)
      n
      (+ (fib (- n 1)) (fib (- n 2)))))

(display (fib 10))
(newline)
(display "total calls: ")
(display total-calls)
(newline)
(display "distinct n values: ")
(display (length seen-args))
(newline)
```

### Reference Source

`fib.scm` (Lesson 29), instrumented with a total-call counter (Lesson 31's own technique) and a second counter tracking distinct arguments, using `member` (see Objects and methods used) to check for repeats.

### Files affected

Created: `fib-overlap.scm`.

### Change type

Add (new file).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile fib-overlap.scm
55
total calls: 177
distinct n values: 11
```

Verified this session — `fib(10) = 55`, correctly; `177` total calls, matching this lesson's own recurrence, `F(10)`, worked out directly from `F(n) = 1 + F(n − 1) + F(n − 2)`; and only `11` genuinely distinct values of `n` — every integer from `0` to `10` — were ever actually called.

**Stating what this confirms, precisely:** `177` total calls, spread across only `11` distinct subproblems, means each distinct subproblem was solved, on average, more than sixteen separate times — direct, measured confirmation of Concept Unit 2's claim that `fib`'s branches independently arrive at identical smaller subproblems, repeatedly.

### Mechanical Walkthrough

- **`(define seen-args '())`** — a second piece of shared state, alongside Lesson 31's `call-count`, tracking which specific arguments have already been seen.
- **`(if (not (member n seen-args)) (set! seen-args (cons n seen-args)))`** — first appearance of `member` (see Objects and methods used), checking whether the current `n` is already recorded before adding it, ensuring `seen-args` only ever grows by genuinely new values.
- **`(length seen-args)`, reporting `11`** — confirms directly, by counting rather than by argument, exactly how many distinct subproblems exist within `fib(10)`'s entire computation.

### CS Lens

This is a direct, empirical technique for detecting overlapping subproblems in any recursive procedure: instrument it to record every argument it's ever called with, and compare the count of distinct arguments against the count of total calls — a large gap between the two is the measurable signature of exactly the redundancy Concept Unit 2 described. Also recognized in: a customer service system logging every inquiry and separately tracking distinct customers, revealing how much repeat contact a single unresolved issue generates; a web server logging every request and separately tracking distinct pages requested, revealing how much traffic concentrates on a small number of pages; a manufacturing quality system logging every defect and separately tracking distinct root causes, revealing how much of the total defect volume traces back to a small number of underlying problems.

### SE Lens

The alternative to measuring distinct-versus-total calls directly is to rely on Concept Unit 2's prose argument alone, trusting that overlapping subproblems exist without ever confirming it with real data. The real cost of that alternative is exactly the evidence-versus-proof gap this curriculum has repeatedly warned about — a reasonable-sounding argument about where redundancy comes from is not the same as a measured confirmation that it actually does. Instrumenting `fib` directly, as this unit does, costs one small addition to already-familiar code; it turns Concept Unit 2's argument into a checked, quantified fact: `177` calls across only `11` distinct subproblems.

---

## Closing

### Connect the pieces

One procedure, `fib`, and one input, `10`, traced through every unit built in this lesson, start to finish:

1. **The recurrence derived (Unit 1):** `F(n) = 1 + F(n − 1) + F(n − 2)`, checked against Lesson 31's own hand-traced `F(4) = 9`.
2. **The redundancy diagnosed precisely (Unit 2):** distinguished from Lesson 51's same-expression-written-twice problem — `fib`'s two recursive calls are genuinely different expressions whose recursions happen to overlap deep inside themselves, a problem `let` cannot fix.
3. **The overlap measured directly (Unit 3):** `177` total calls, only `11` distinct subproblems, for `fib(10)` — confirming, with real numbers, exactly the redundancy Concept Unit 2 described in prose.

Unit 3's real, instrumented measurement directly confirms Unit 2's prose diagnosis — not a separate finding, but the concrete, checked evidence for the exact claim Unit 2 made about where `fib`'s redundancy actually comes from.

### What breaks without this

Suppose a learner, having successfully fixed `all-subsets`'s redundancy with `let` in Lesson 51, encountered `fib`'s exponential slowness and reached for the identical fix, wrapping `(fib (- n 1))` and `(fib (- n 2))` in a `let` expecting the same dramatic improvement. Because these are two genuinely different expressions, not one expression written twice, `let` would bind two different names to two different values, changing nothing at all about the underlying redundancy — the fix would appear to do nothing, and without this lesson's precise diagnosis, the natural but wrong conclusion might be that `fib`'s slowness is simply unfixable, or that `let` itself doesn't work as advertised. Restoring this lesson's discipline — checking, precisely, whether a recursive procedure's redundancy comes from one expression written twice (fixable with `let`) or from independently overlapping subproblems scattered across genuinely different branches (requiring an entirely different fix) — is what correctly identifies which situation is actually present, before reaching for a tool that only solves one of the two.

### Exercises

1. **Observe.** Take a recursive procedure of your own that makes more than one recursive call (from Lesson 41's `tree-size`, or a procedure of your own design) and derive its own call-count recurrence, following Concept Unit 1's exact technique.
2. **Explain.** Determine whether your Exercise 1 procedure's multiple recursive calls could ever arrive at the identical subproblem from two different branches, the way `fib(n − 1)` and `fib(n − 2)` both eventually call `fib(n − 2)`. State your reasoning precisely.
3. **Formalize.** If your Exercise 1 procedure does have overlapping subproblems, instrument it the way Concept Unit 3 instrumented `fib`, tracking both total calls and distinct arguments.
4. **Explain.** Run your Exercise 3 instrumentation on a real input and report the gap between total calls and distinct subproblems, the way Concept Unit 3 reported `177` against `11`.
5. **Explain.** If your Exercise 1 procedure does *not* have overlapping subproblems, explain precisely why not, using Concept Unit 2's exact reasoning — trace where its recursive calls actually go, and confirm they never independently arrive at the identical smaller instance.

### Definition of done

- [ ] You can derive a recurrence for a recursive procedure's own call count directly from its code, for a procedure making more than one recursive call.
- [ ] You can explain, precisely, the difference between redundancy caused by writing one expression twice and redundancy caused by overlapping subproblems, and why only the first is fixable with `let`.
- [ ] You can instrument a recursive procedure to measure the gap between its total calls and its distinct subproblems, and interpret what a large gap means.
- [ ] You can determine, for a recursive procedure of your own, whether it has overlapping subproblems, and justify your answer by tracing where its recursive calls actually lead.
- [ ] You completed Exercises 1–5 using a procedure of your own choosing, not `fib`.
- [ ] Commit your Exercise 1 recurrence and your Exercise 3–4 measurements (or Exercise 5 explanation), with a commit message stating whether your procedure turned out to have overlapping subproblems, and how you determined this.
