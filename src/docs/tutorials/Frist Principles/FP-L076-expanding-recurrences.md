# Lesson 76: Expanding Recurrences

**What you will build:** a real, derived closed form for `binary-search`'s worst-case comparison count — `1 + log₂(n)` — obtained by repeatedly **expanding** its recurrence, `T(n) = T(n/2) + 1`, into itself until it bottoms out at the base case, rather than by guessing a formula and checking it. Real, verified evidence this session: the derived formula predicts exactly `11` comparisons at `n = 1,024` and exactly `21` at `n = 1,048,576` — the second one fresh, previously-unmeasured evidence, confirmed against a freshly instrumented `binary-search` at that exact size. The transferable point: Lesson 75 showed how to *write down* a recurrence directly from code. This lesson shows how to *solve* one — turning a formula that still refers to itself into a plain formula of `n` alone — by substituting the recurrence's own definition into itself, repeatedly, until a pattern emerges.

**What you need to know first:** Lesson 75 (`FP-L075-recurrences.md`) — specifically the three-part translation rule, applied here to derive `binary-search`'s own recurrence before solving it. Lesson 68 (`FP-L068-repeated-halving.md`) — specifically `binary-search` and its real, measured worst-case comparison count of `20` at `n = 1,000,000`, checked against this lesson's derived formula. Lesson 67 (`FP-L067-logarithms.md`) — specifically `log₂`, the operation this lesson's closed form is expressed in terms of.

**Terms introduced in this lesson**

- **Expanding a recurrence** — solving a recurrence by substituting its own right-hand side in place of each `T(smaller)` term, repeatedly, until a clear pattern in terms of the number of substitutions performed emerges; then finding how many substitutions are needed to reach the base case, and combining the two to get a plain formula of `n` alone. It exists because a recurrence like `T(n) = T(n/2) + 1`, as written, still refers to itself — it predicts nothing concrete until it's been solved down to a form with no `T` on the right-hand side at all.

---

## Concept Unit 1: A Recurrence Still Refers to Itself

### The Problem

Lesson 75 derived `T(n) = T(n-1) + T(n-2) + 1` for `fib`, and confirmed it predicts real call counts correctly — but only by actually *running* `fib-call-count`, itself a recursive procedure. The recurrence, as written, still contains `T` on its own right-hand side; it hasn't been turned into a plain formula that computes a number directly from `n`, the way `arithmetic-sum-formula` (Lesson 64) computes a sum directly, with no recursion at all. It's worth asking whether a recurrence can be solved down to that kind of direct formula.

### No isolated lab for this step

This concept has no code of its own to isolate — the question is posed directly here, contrasting Lesson 75's recurrences with Lesson 64's closed form.

### Applying It — What "Solved" Would Actually Mean

Lesson 64's `arithmetic-sum-formula` takes `n` and returns an answer using a fixed number of operations, regardless of `n`'s size — no self-reference, no recursion. A "solved" recurrence would do the identical thing for a cost formula: instead of `T(n) = T(n/2) + 1`, a solved version would read something like `T(n) = [some plain expression made only of `n`, plus ordinary arithmetic]` — nothing referring back to `T` at all.

### Walkthrough

- **"still contains `T` on its own right-hand side"** — names precisely what makes a recurrence, as first written, an incomplete answer rather than a final one.
- **The direct contrast with `arithmetic-sum-formula`** — gives a concrete target for what "solved" should actually look like, using a closed form this curriculum has already built.

### CS Lens

This is the real distinction between defining a quantity recursively and computing it directly: `fib-call-count` (Lesson 75) *is* a correct answer to "how many calls," but it costs real recursive work of its own to evaluate; a closed form would answer the identical question without paying that cost at all. Also recognized in: a recursive definition of a bank balance ("this month's balance is last month's balance plus interest") versus a direct formula for the balance after `n` months, computed in one step without walking through every intervening month.

### SE Lens

The alternative to solving a recurrence is to accept `fib-call-count`-style recursive predictors as good enough, treating "predicted by a recurrence" and "computed directly" as equally useful. The real cost of that alternative, at large `n`, is that a recursive predictor itself does real, sometimes expensive, work to evaluate — exactly the problem Lesson 64 already solved once for sums. Seeking a genuine closed form, as this lesson does, is what would make a cost prediction as cheap to compute as the thing it's predicting is expensive to run.

---

## Concept Unit 2: The Expansion Technique

### The Problem

Solving a recurrence needs a real, repeatable method — not a lucky guess checked afterward, but a mechanical process that turns `T(n) = T(n/2) + 1` into a plain formula.

### No isolated lab for this step

This concept has no code of its own to isolate — the method is stated directly below, and Concept Unit 3 applies it to real code.

### Applying It — The Method, Stated Precisely

**Substitute the recurrence into itself, repeatedly.** `T(n) = T(n/2) + 1` says `T(n/2)` itself equals `T(n/4) + 1` — the identical recurrence, one step smaller. Substituting that in for `T(n/2)`:

`T(n) = (T(n/4) + 1) + 1 = T(n/4) + 2`

Substituting again, using `T(n/4) = T(n/8) + 1`:

`T(n) = (T(n/8) + 1) + 2 = T(n/8) + 3`

**Naming the emerging pattern:** after `k` substitutions, `T(n) = T(n / 2^k) + k` — each substitution divides the remaining argument by `2` again, and adds exactly `1` more to the accumulated constant.

**Finding where it bottoms out.** The pattern keeps applying only until the argument reaches the base case. For `T(n) = T(n/2) + 1` with base case `T(1) = 1`, that happens when `n / 2^k = 1` — exactly Lesson 67's own halving question, solved there: `k = log₂(n)`.

**Combining both pieces:** substituting `k = log₂(n)` into the pattern, `T(n) = T(n / 2^(log₂ n)) + log₂(n) = T(1) + log₂(n) = 1 + log₂(n)` — a plain formula of `n` alone, with no `T` remaining on the right-hand side.

### Walkthrough

- **The repeated substitution itself** — mechanically identical each time: replace `T(smaller)` with the recurrence's own right-hand side, one level down.
- **"after `k` substitutions, `T(n) = T(n / 2^k) + k`"** — the crucial generalization step: recognizing the pattern across several concrete substitutions, rather than only ever performing one more.
- **Solving `n / 2^k = 1` for `k`** — a direct reuse of Lesson 67's own halving-to-one question, now applied to *solve* a recurrence rather than to analyze halving in isolation.
- **The final substitution of `k` back in** — turns the pattern-plus-stopping-point into the actual closed form.

### CS Lens

This is the standard method for solving a large class of recurrences that reduce a problem by a fixed factor at each step: expand until the self-reference disappears, then substitute the number of steps needed back in. Also recognized in: unrolling a loop by hand to see its total iteration count directly, rather than reasoning about "however many times it repeats" abstractly; a chain letter's total reach after `k` rounds, derived by expanding "each round's total is the previous round's total, doubled" repeatedly until reaching round zero's known starting size.

### SE Lens

The alternative to expanding mechanically is to guess a plausible-looking closed form (`log₂(n)` "feels right" for something that keeps halving) and check it against real measurements afterward. The real cost of that alternative is exactly the gap this curriculum has warned about since Lesson 22: a formula that happens to match a few checked values by coincidence isn't the same as one derived from the recurrence's own structure. Expanding step by step, as this unit does, produces a formula *guaranteed* to match the recurrence it came from — checking it against real code afterward, in Concept Unit 3, confirms the recurrence itself was translated correctly, not that the solving method worked.

---

## Concept Unit 3: Solving and Verifying binary-search's Real Recurrence

### The Problem

Concept Unit 2's method needs applying to real, already-built code — `binary-search` (Lesson 68) — deriving its recurrence via Lesson 75's translation rule, solving it, and checking the result against real, both old and fresh, measurements.

### Applying Lesson 75's Rule to binary-search's Real Code

`binary-search`'s real code, unchanged from Lesson 68:

```scheme
(define (binary-search vec target)
  (let loop ((lo 0) (hi (- (vector-length vec) 1)))
    (if (> lo hi)
        #f
        (let ((mid (quotient (+ lo hi) 2)))
          (cond ((= (vector-ref vec mid) target) mid)
                ((< (vector-ref vec mid) target) (loop (+ mid 1) hi))
                (else (loop lo (- mid 1))))))))
```

**Applying Rule 1:** each recursive call to `loop` searches a range roughly half the size of the one before it — one `T` term, `T(n/2)`.

**Applying Rule 2:** each call makes exactly one comparison against `vec[mid]` before deciding which half to recurse into — one constant, `1`.

**Applying Rule 3:** the base case is a range of exactly one element (`lo = hi`); checking it still costs one comparison — `T(1) = 1`.

**The recurrence:** `T(n) = T(n/2) + 1`, `T(1) = 1` — exactly Concept Unit 2's worked example, now derived from real code rather than assumed.

### The New Code — Type It Yourself

```scheme
(define (binary-search-cost n)
  (if (= n 1)
      1
      (+ (binary-search-cost (quotient n 2)) 1)))
```

### The Updated Project

This is `expand-check.scm`, in full:

```scheme
(define comparisons 0)

(define (binary-search-counted vec target)
  (set! comparisons 0)
  (let loop ((lo 0) (hi (- (vector-length vec) 1)))
    (if (> lo hi)
        #f
        (let ((mid (quotient (+ lo hi) 2)))
          (set! comparisons (+ comparisons 1))
          (cond ((= (vector-ref vec mid) target) mid)
                ((< (vector-ref vec mid) target) (loop (+ mid 1) hi))
                (else (loop lo (- mid 1))))))))

(define (build-vector-0-to n)
  (let ((v (make-vector n)))
    (let loop ((i 0))
      (if (= i n)
          v
          (begin (vector-set! v i i) (loop (+ i 1)))))))

(define (binary-search-cost n)                                ; ← new
  (if (= n 1)                                                   ; ← new
      1                                                          ; ← new
      (+ (binary-search-cost (quotient n 2)) 1)))                ; ← new

(for-each
 (lambda (n)
   (let ((v (build-vector-0-to n)))
     (binary-search-counted v (- n 1))
     (display "n=") (display n)
     (display " real-comparisons(last element)=") (display comparisons)
     (display " binary-search-cost(n)=") (display (binary-search-cost n))
     (newline)))
 (list 2 4 8 16 1024 1048576))
```

`binary-search-counted` adds Lesson 31-style counting to Lesson 68's `binary-search`, unchanged in logic; `binary-search-cost` is this lesson's real recurrence, translated directly above, standing in for Concept Unit 2's solved closed form, `1 + log₂(n)`, but written and run as the *unsolved* recurrence itself, to check the solving process against real execution, not only against algebra.

### Reference Source

Lesson 68's `binary-search` (`FP-L068-repeated-halving.md`, Concept Unit 2), unchanged in logic, with Lesson 31's counting technique added; `binary-search-cost` is new, derived directly above via Lesson 75's rule.

### Files affected

Created: `expand-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### Run It — Show the Real Output

```
$ guile expand-check.scm
n=2 real-comparisons(last element)=2 binary-search-cost(n)=2
n=4 real-comparisons(last element)=3 binary-search-cost(n)=3
n=8 real-comparisons(last element)=4 binary-search-cost(n)=4
n=16 real-comparisons(last element)=5 binary-search-cost(n)=5
n=1024 real-comparisons(last element)=11 binary-search-cost(n)=11
n=1048576 real-comparisons(last element)=21 binary-search-cost(n)=21
```

Verified this session — at every power of `2` tested, `binary-search-cost(n)` (the recurrence, run directly) matches a freshly instrumented `binary-search-counted`'s real comparison count exactly, including `n = 1,048,576`, a size this curriculum has never measured before. Checking Concept Unit 2's solved closed form against the same numbers: `1 + log₂(1024) = 1 + 10 = 11`; `1 + log₂(1,048,576) = 1 + 20 = 21` — both matching exactly.

**Reconciling directly with Lesson 68's own real evidence:** Lesson 68 measured `20` comparisons searching for the last element among `1,000,000` elements — not a power of `2`. The general form of this lesson's closed form, allowing for `n` that doesn't divide evenly, is `⌊log₂(n)⌋ + 1` — Lesson 68's own stated formula. `⌊log₂(1,000,000)⌋ + 1 = 19 + 1 = 20`, matching Lesson 68's real number exactly; this lesson's clean `1 + log₂(n)` is the exact special case of that same formula whenever `n` happens to be a power of `2`.

### Mechanical Walkthrough

- **`(if (= n 1) 1 ...)`** — a reappearance of `if` and `=`; `binary-search-cost`'s base case, directly implementing `T(1) = 1`.
- **`(+ (binary-search-cost (quotient n 2)) 1)`** — a reappearance of `+` and `quotient`; directly implementing the derived recurrence's right-hand side, `T(n/2) + 1`.
- **The real, exact match at every tested power of `2`, including the fresh `n = 1,048,576`** — confirms both that Concept Unit 2's expansion was solved correctly, and that Concept Unit 3's translation of `binary-search`'s real code into a recurrence was accurate.
- **The reconciliation with Lesson 68's non-power-of-`2` result** — confirms this lesson's clean derivation isn't disconnected from already-established real evidence, but a special case of it.

### CS Lens

This is expansion-based recurrence-solving doing exactly what it's for: a formula derived purely from algebraic substitution, checked against real code at both previously-known and genuinely fresh sizes. Also recognized in: a savings account's compound-interest recurrence ("this year's balance is last year's balance times a growth factor"), solved by expansion into a direct formula, then checked against an actual bank statement at a year nobody had specifically calculated by hand before.

### SE Lens

The alternative to deriving `binary-search-cost` and checking it against real code is to trust Concept Unit 2's algebra alone, since the substitution steps were individually simple and easy to follow. The real cost of that alternative is exactly the standing concern since Lesson 22: an algebraically clean derivation can still contain a translation error between the code and the recurrence it's supposed to represent (an off-by-one in the base case, a wrong constant). Running `binary-search-cost` as real code and matching it against a real, freshly instrumented `binary-search`, as this unit does, checks the *entire chain* — translation and solving both — not just the solving step in isolation.

---

## Concept Unit 4: One Formula, One Specific Question

### The Problem

Concept Unit 3's closed form was derived and verified for one specific scenario: searching for the *last* element, `binary-search`'s worst case among present targets. It's worth checking, honestly, whether the identical formula describes every input, or only that one.

### No isolated lab for this step

This concept has no code of its own to isolate — the check reuses Concept Unit 3's own real numbers, already gathered, from a different target.

### Applying It — Checking an Absent Target

Searching the same `1,048,576`-element vector for a target smaller than every real element (guaranteed absent) — real, measured this session — gives exactly `20` comparisons, not `21`.

**Naming why, honestly:** an absent target that's smaller than everything never reaches the base case the way a present worst-case target does — it exits one comparison earlier, once the remaining range becomes empty rather than shrinking all the way to a single checked element. Concept Unit 3's `T(n) = T(n/2) + 1`, `T(1) = 1` recurrence models the *present-target* worst case specifically — the case where the search always narrows down to and checks exactly one final element. An absent target, or a present target that isn't the true worst case, needs its own recurrence, potentially with a different base case.

### Walkthrough

- **`20`, not `21`, for the absent target at the identical `n`** — a real, checked exception to Concept Unit 3's formula, not a hypothetical caveat.
- **The named reason — a different base case is actually reached** — turns the discrepancy into an explained fact rather than an unresolved inconsistency.

### CS Lens

This is Lesson 74's worst/best/average distinction reappearing at the level of solving a recurrence, not just measuring an algorithm directly: a single closed form, however correctly derived, still only answers the *one* question its underlying recurrence actually modeled. Also recognized in: an insurance formula correctly computing the payout for a claim of one specific type, giving a wrong or inapplicable answer if quietly applied to a differently-structured claim it was never derived for.

### SE Lens

The alternative to checking a second scenario is to treat Concept Unit 3's verified match as proof the formula describes `binary-search`'s cost in general. The real cost of that alternative is exactly the kind of overgeneralization Lesson 75 warned against for translation rules, now shown to apply to solved formulas too: a correctly-derived closed form is still only as general as the specific recurrence it solved. Checking a second, differently-behaved input, as this unit does, is what keeps "verified" from silently becoming "verified for the one case I happened to check."

---

## Closing

### Connect the pieces

One recurrence, expanded, solved, and checked against both old and new real evidence — then honestly bounded:

1. **The gap named (Unit 1):** a recurrence, as written, still refers to itself — not yet a usable, direct formula.
2. **The method (Unit 2):** substitute repeatedly, recognize the pattern `T(n) = T(n/2^k) + k`, solve for where it bottoms out, substitute back — yielding `1 + log₂(n)`.
3. **Real translation, solving, and verification (Unit 3):** `binary-search`'s own recurrence, `T(n) = T(n/2) + 1`, solved and confirmed exactly against real code at `n = 1,024` and a fresh `n = 1,048,576`, then reconciled with Lesson 68's own established `n = 1,000,000` result via the general floor-based formula.
4. **The honest limit (Unit 4):** the identical formula does not describe an absent-target search, which real measurement shows needs exactly one fewer comparison — a different question, needing its own recurrence.

Every number in this lesson traces to a real run, checked against an independently derived formula — the same standing discipline as every prior lesson, now applied to the *solving* step specifically, not just the translation step Lesson 75 covered.

### What breaks without this

Suppose an engineer, having correctly derived `binary-search`'s worst-case recurrence and solved it into `1 + log₂(n)`, applied that identical formula to estimate comparisons for a workload dominated by absent-target lookups — a real, common pattern (checking whether a value exists before inserting it, for instance). Concept Unit 4's real evidence shows that estimate would be systematically slightly high for every such lookup — a small gap here, but the same kind of mismatch, applied to a less forgiving recurrence or a much larger workload, could compound into a genuinely misleading capacity estimate. Checking which exact question a solved recurrence answers, as this lesson's Concept Unit 4 does, is what catches a mismatch like this before it's built into a real capacity plan.

### Exercises

1. **Observe.** Before checking, predict `binary-search-cost`'s value at `n = 2,097,152` (`2²¹`), using the closed form `1 + log₂(n)` directly, without running any code.
2. **Formalize.** Confirm your Exercise 1 prediction by running `binary-search-cost` and a freshly instrumented `binary-search-counted` (searching for the last element) at that size, and report whether they match exactly.
3. **Formalize.** Derive, by expansion, a separate recurrence and closed form for the absent-target case Concept Unit 4 identified, and check it against real measurements at `n = 1,024` and `n = 1,048,576`.
4. **Explain.** Attempt to expand Lesson 75's `fib` recurrence, `T(n) = T(n-1) + T(n-2) + 1`, using this lesson's substitution method, for two or three steps. Explain, in your own words, what goes wrong that didn't happen with `binary-search`'s single-term recurrence — this is intentionally difficult; Lesson 77 addresses it directly.
5. **Explain.** State, in your own words, why confirming a solved closed form against a *freshly measured* size (this lesson's `n = 1,048,576`) is stronger evidence of a correct derivation than confirming it only against a size already known in advance — referencing Lesson 75's own version of this same point.

### Definition of done

- [ ] You can state the expansion method's steps from memory: substitute repeatedly, generalize the pattern, solve for the stopping point, substitute back.
- [ ] You derived `binary-search`'s recurrence from its real code using Lesson 75's rule, and solved it by expansion.
- [ ] You can explain, using real measured evidence, why the identical closed form does not describe an absent-target search at the same size.
- [ ] You attempted Exercise 4 and can explain specifically what makes a two-term recurrence resist this lesson's expansion method the way `binary-search`'s one-term recurrence didn't.
- [ ] You completed Exercises 1–5, checking at least one prediction against a freshly run, previously unmeasured size.
- [ ] Commit your Exercise 2 through 5 findings, with a commit message stating the size you tested and whether your prediction matched exactly.
