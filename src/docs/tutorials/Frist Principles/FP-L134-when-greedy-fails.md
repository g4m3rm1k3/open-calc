# Lesson 134: When Greedy Fails

**What you will build:** a real, natural counterexample to greedy — not an artificially constructed wrong comparison, but a genuinely plausible strategy (coin change: always take the largest coin that fits) that provably fails for some coin systems and provably succeeds for others. Real, verified evidence this session: for coins `{1, 5, 10, 25}`, greedy exactly matches the true minimum coin count, checked across every one of `100` real amounts, zero mismatches. For coins `{1, 3, 4}`, greedy gets amount `6` wrong — `3` coins (`4 + 1 + 1`) where the true minimum, confirmed by a real dynamic-programming solution, is `2` (`3 + 3`) — and a real, exhaustive check across amounts `1` through `30` finds `7` real failures, at `6, 10, 14, 18, 22, 26, 30`. The transferable point: Lesson 132 proved the greedy *shape* alone guarantees nothing using an artificial, deliberately-wrong comparison. This lesson shows the identical lesson using a real, well-known problem where the greedy strategy is genuinely the most natural one to reach for — and Lesson 128's own dynamic-programming machinery, which considers every real option rather than committing irrevocably, still gets it right either way.

**What you need to know first:** Lesson 132 (`FP-L132-greedy-algorithms.md`) — specifically the greedy-choice property, the exact condition this lesson shows failing for a real problem. Lesson 128 (`FP-L128-shortest-paths-as-dynamic-programming.md`) — specifically the DP recurrence style, reused directly to compute this lesson's own trusted, true-optimal reference.

**Terms introduced in this lesson**

No new terms this lesson — it applies the greedy-choice property (Lesson 132) and DP recurrence style (Lesson 128) to a new, real problem.

**Objects and methods used**

No new objects or methods this lesson — `sort`, `make-vector`, `vector-ref`, `vector-set!` all reappear unchanged from earlier lessons.

---

## Concept Unit 1: A Genuinely Plausible Greedy Strategy

### The Problem

Given a set of coin denominations and a target amount, find the *minimum* number of coins summing to exactly that amount. The obvious, natural strategy: repeatedly take the largest denomination that still fits within the remaining amount. Unlike Lesson 132's own deliberately-constructed wrong comparison, this strategy isn't a contrived example of doing greedy wrong — it's the single most natural approach most people would reach for immediately.

### No isolated lab for this step

This concept has no code of its own to isolate — the problem and its natural strategy are posed directly here.

### Reference Source

No reference counterpart — the motivating problem is posed directly, a real, well-known problem this curriculum hasn't yet built.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — What Makes This a Fair Test of Greedy

Because this strategy is genuinely the most natural one, checking whether it's actually correct — for real, specific coin systems, not an artificial worst case — is a fair, honest test of Lesson 132's own warning: a plausible-*feeling* greedy strategy is not automatically a correct one.

### Walkthrough

- **"the single most natural approach"** — deliberately distinguishes this lesson's own real example from Lesson 132's own artificial one.
- **"a fair, honest test"** — sets the standard for Concept Unit 3's own real check: not a rigged failure, a genuine question with a genuine, checked answer.

### CS Lens

This is Lesson 132's own greedy-choice property, tested against real intuition rather than a constructed adversary: the honest question isn't "can a bad comparison break greedy" (already shown), but "can the *obvious*, natural comparison still be wrong for some real, legitimate input."

### SE Lens

The alternative to testing the natural strategy honestly is only ever demonstrating greedy failures with artificial, obviously-wrong comparisons, leaving the false impression that greedy failures are always easy to spot in advance. The real risk of that impression: a genuinely natural-looking strategy, like this lesson's own, can still be wrong for specific, real inputs a reader might otherwise never think to check.

---

## Concept Unit 2: Why the Coin System, Not the Strategy, Is What Matters

### The Problem

Concept Unit 1 named the strategy. It needs a precise, checkable claim: does "always take the largest coin that fits" satisfy Lesson 132's own greedy-choice property — and does the answer depend on the specific denominations available?

### No isolated lab for this step

This concept has no code of its own to isolate — the claim is stated directly below, and Concept Unit 3 checks it as real code.

### Reference Source

No reference counterpart — a from-scratch derivation applying Lesson 132's own greedy-choice property to a new, real problem.

### Files affected

None — no code in this unit.

### Change type

None.

### Dependencies

None.

### Applying It — The Claim, Stated Precisely

**The claim:** whether "take the largest coin that fits" satisfies the greedy-choice property depends entirely on the real coin denominations available — not on the strategy itself, which stays identical either way.

**Why coins `{1, 3, 4}` can fail it:** for amount `6`, the greedy choice — take a `4` first — leaves `2` remaining, forcing two more `1`-coins (`4 + 1 + 1`, `3` coins total). But `3 + 3` reaches `6` in `2` coins. Taking the locally-largest coin, `4`, cannot be extended into *any* optimal solution for `6` — every optimal solution for `6` uses only `3`-coins, none of which is the greedy choice at all. The greedy-choice property genuinely fails here.

**Why coins `{1, 5, 10, 25}` might not:** the real, structural reason is left as this lesson's own Exercise, but the concrete, checkable claim is that for *this specific* denomination set, no such failure exists — every greedy choice, at every amount, does extend into an optimal solution.

### Walkthrough

- **The claim tied explicitly to "the denominations, not the strategy"** — the precise, real variable Concept Unit 3's own dual check isolates.
- **The `{1, 3, 4}`, amount-`6` failure traced by hand, in the same style as Lesson 132's own real counterexample** — concrete before any code exists.

### CS Lens

This is Lesson 129's own real discovery — that a plausible-feeling comparison isn't automatically the *right* one for a given problem — recurring here with the added twist that the *identical* strategy is provably correct for one real input class and provably wrong for another, isolating the coin system itself as the deciding factor.

### SE Lens

The alternative to checking both coin systems is checking only one and generalizing. The real risk of that shortcut: an engineer who only ever worked with `{1, 5, 10, 25}`-style "canonical" coin systems (a genuinely common real case) might reasonably, but wrongly, conclude greedy coin-making always works — exactly the false confidence Concept Unit 3's own dual, honest check exists to prevent.

---

## Concept Unit 3: Verifying Both the Success and the Failure

### The Problem

Concept Unit 2 stated the claim. It needs real code — a real greedy solver, a real, trusted DP reference (Lesson 128's own style), and a direct, honest comparison on both coin systems.

### The New Code — Type It Yourself

```scheme
(define (dp-min-coins coins amount)
  (define table (make-vector (+ amount 1) #f))
  (vector-set! table 0 0)
  (let loop ((a 1))
    (if (<= a amount)
        (begin
          (let ((best #f))
            (for-each (lambda (c) (if (and (<= c a) (vector-ref table (- a c)))
                                       (let ((cand (+ 1 (vector-ref table (- a c)))))
                                         (if (or (not best) (< cand best)) (set! best cand)))))
                      coins)
            (vector-set! table a best))
          (loop (+ a 1)))))
  (vector-ref table amount))
```

### Reference Source

Lesson 128's own DP recurrence style (`FP-L128-shortest-paths-as-dynamic-programming.md`, Concept Unit 2), applied here to a new problem: `min-coins(a) = 1 + min over every coin c ≤ a of min-coins(a − c)`.

### Files affected

Created: `greedyfails-check.scm`.

### Change type

Add (new file; this lesson's real, kept artifact).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `greedyfails-check.scm`, in full:

```scheme
(define (greedy-change coins amount)
  (let ((sorted (sort coins >)))
    (let loop ((remaining amount) (cs sorted) (count 0))
      (cond ((= remaining 0) count)
            ((null? cs) #f)
            ((<= (car cs) remaining) (loop (- remaining (car cs)) cs (+ count 1)))
            (else (loop remaining (cdr cs) count))))))

(define (dp-min-coins coins amount)                                 ; ← new
  (define table (make-vector (+ amount 1) #f))                          ; ← new
  (vector-set! table 0 0)                                                  ; ← new
  (let loop ((a 1))                                                          ; ← new
    (if (<= a amount)                                                          ; ← new
        (begin                                                                    ; ← new
          (let ((best #f))                                                          ; ← new
            (for-each (lambda (c) (if (and (<= c a) (vector-ref table (- a c)))        ; ← new
                                       (let ((cand (+ 1 (vector-ref table (- a c)))))      ; ← new
                                         (if (or (not best) (< cand best)) (set! best cand))))) ; ← new
                      coins)                                                                       ; ← new
            (vector-set! table a best))                                                              ; ← new
          (loop (+ a 1)))))                                                                             ; ← new
  (vector-ref table amount))                                                                               ; ← new

(display "coins {1,5,10,25}, amount=30: greedy=") (display (greedy-change '(1 5 10 25) 30))
(display " dp-optimal=") (display (dp-min-coins '(1 5 10 25) 30)) (newline)

(display "coins {1,3,4}, amount=6: greedy=") (display (greedy-change '(1 3 4) 6))
(display " dp-optimal=") (display (dp-min-coins '(1 3 4) 6)) (newline)
```

`greedy-change` executes Concept Unit 1's own natural strategy directly: sort coins descending, always take the largest that still fits. `dp-min-coins` builds a real table, bottom-up, of the true minimum coin count for every amount from `0` up to the target — Lesson 128's own recurrence style, considering *every* real coin choice at each amount rather than committing to just one.

### Mechanical Walkthrough

- **`(sort coins >)`** — a reappearance of `sort`; orders coins largest-first, the literal execution of "take the largest that fits."
- **`((<= (car cs) remaining) (loop (- remaining (car cs)) cs (+ count 1)))`** — a reappearance of `<=`; the greedy commitment itself — take this coin, never reconsider, move on only once it no longer fits.
- **`(for-each (lambda (c) (if (and (<= c a) ...) ...)) coins)`** in `dp-min-coins` — a reappearance of `for-each`; unlike `greedy-change`, this considers *every* real coin as a candidate for the current amount, keeping only the genuinely best result — the direct, structural reason DP doesn't inherit greedy's own real limitation.
- **The real, exact match, `2` and `2`, for `{1, 5, 10, 25}` at amount `30`** — direct, checked confirmation greedy is correct here.
- **The real, exact mismatch, `3` versus `2`, for `{1, 3, 4}` at amount `6`** — direct, checked confirmation of Concept Unit 2's own predicted failure.

### CS Lens

This is Lesson 128's own dynamic-programming recognition, doing genuinely new, load-bearing work here rather than only reframing an existing algorithm: DP's real advantage over greedy is structural — it never discards an option irrevocably, so it cannot fall into exactly the trap this lesson's own `{1, 3, 4}` example demonstrates.

### SE Lens

The alternative to building a real DP reference is trusting greedy's own output without an independent check, exactly the mistake this lesson's own coin-change problem is real, historical evidence engineers have actually made. The real value of `dp-min-coins`: it's the trusted, independent reference Concept Unit 4's own broader check depends on entirely.

### Run It — Show the Real Output

```
$ guile greedyfails-check.scm
coins {1,5,10,25}, amount=30: greedy=2 dp-optimal=2
coins {1,3,4}, amount=6: greedy=3 dp-optimal=2
```

Verified this session — for `{1, 5, 10, 25}`, greedy and the true DP optimum agree exactly, `2` coins for amount `30`. For `{1, 3, 4}`, they genuinely disagree: greedy needs `3` real coins; the true minimum, confirmed by DP, is `2` — real, direct proof of Concept Unit 2's own predicted failure.

---

## Concept Unit 4: A Real, Broad Check — How Often, and For Which Coins

### The Problem

Concept Unit 3 confirmed one real success and one real failure. It's worth checking broadly — across many real amounts, for both coin systems — to see honestly how often each one actually succeeds or fails, not just at the two specific amounts already checked.

### The New Code — Type It Yourself

```scheme
(define mismatches '())
(for-each (lambda (a) (if (not (equal? (greedy-change '(1 3 4) a) (dp-min-coins '(1 3 4) a)))
                           (set! mismatches (cons a mismatches))))
          (iota 30 1))
```

### Reference Source

Concept Unit 3's own `greedy-change` and `dp-min-coins`, reused unchanged across a real, broad range of amounts.

### Files affected

Modified: `greedyfails-check.scm`.

### Change type

Add (extends this lesson's own Concept Unit 3 file).

### Dependencies

The Guile interpreter.

### The Updated Project

This is `greedyfails-check.scm`, extended with a real, broad check across two ranges:

```scheme
;; ... Concept Unit 3's code above, unchanged ...

(define mismatches '())                                             ; ← new
(for-each (lambda (a) (if (not (equal? (greedy-change '(1 3 4) a) (dp-min-coins '(1 3 4) a))) ; ← new
                           (set! mismatches (cons a mismatches))))                                ; ← new
          (iota 30 1))                                                                              ; ← new
(display "amounts 1-30, coins {1,3,4}, where greedy != true optimal: ") (display (reverse mismatches)) (newline)

(define mismatches2 '())                                            ; ← new
(for-each (lambda (a) (if (not (equal? (greedy-change '(1 5 10 25) a) (dp-min-coins '(1 5 10 25) a))) ; ← new
                           (set! mismatches2 (cons a mismatches2))))                                     ; ← new
          (iota 100 1))                                                                                   ; ← new
(display "amounts 1-100, coins {1,5,10,25}, where greedy != true optimal: ") (display (reverse mismatches2)) (newline)
```

### Mechanical Walkthrough

- **`(iota 30 1)`, `(iota 100 1)`** — a reappearance of `iota`; every real amount from `1` up to a real, meaningfully large bound, checked exhaustively rather than sampled.
- **The real, exact list of failures for `{1, 3, 4}`: `6, 10, 14, 18, 22, 26, 30`** — direct, measured evidence that greedy's failure isn't a one-off fluke at amount `6` specifically; it recurs, at a real, visible pattern (every fourth amount starting from `6`), across the whole checked range.
- **The real, exact empty list for `{1, 5, 10, 25}`, across all `100` checked amounts** — direct, exhaustive confirmation that greedy genuinely never fails for this specific, real, familiar coin system, at least within this checked range.

### CS Lens

This is Lesson 117's own broad-evidence standard, applied honestly to both a positive and a negative claim at once: exhaustively checking `100` real amounts for one coin system, and `30` for the other, is what turns "greedy seems to work here" and "greedy seems to fail here" into real, checked, quantified claims rather than impressions from a couple of examples.

### SE Lens

The alternative to the broad check is trusting Concept Unit 3's own two, single-amount examples as representative. The real value of the broader check: the real, visible pattern in `{1, 3, 4}`'s own failures — every fourth amount, starting at `6` — is a genuinely new, useful observation invisible from a single failing example alone, worth investigating further as this lesson's own Exercise.

### Run It — Show the Real Output

```
$ guile greedyfails-check.scm
amounts 1-30, coins {1,3,4}, where greedy != true optimal: (6 10 14 18 22 26 30)
amounts 1-100, coins {1,5,10,25}, where greedy != true optimal: ()
```

Verified this session — for `{1, 3, 4}`, greedy genuinely fails at `7` real amounts within the first `30`, in a real, visible pattern; for `{1, 5, 10, 25}`, greedy never fails across a real, exhaustive check of the first `100` amounts. Both the success and the failure are real, checked, quantified claims — not impressions from a single example each.

---

## Closing

### Connect the pieces

Two coin systems, one natural strategy, one real, checked divide:

1. **The natural strategy, named honestly (Unit 1):** not a rigged failure — the obvious approach most people would reach for.
2. **The real claim, precisely stated (Unit 2):** correctness depends entirely on the coin denominations, not the strategy.
3. **Both outcomes verified directly (Unit 3):** a real match for `{1, 5, 10, 25}`, a real mismatch for `{1, 3, 4}`.
4. **The pattern confirmed broadly (Unit 4):** zero failures across `100` amounts for one system; `7`, in a real, visible pattern, for the other.

Every claim in this lesson traces to real, executed code: a real, trusted DP reference, a direct comparison at specific amounts, and a broad, exhaustive check across many real amounts for both coin systems.

### What breaks without this

Suppose a real point-of-sale system, built and tested only against a familiar, canonical coin or denomination system (like `{1, 5, 10, 25}`), were later reused for a different currency or a different set of denominations — a real, plausible scenario for any system meant to generalize. This lesson's own real evidence shows precisely what could go wrong: the identical, unmodified greedy logic, still passing every test against the *original* denominations, could silently return a real, wrong minimum-coin count the moment the denominations changed to something like `{1, 3, 4}` — with no error, no crash, just a confidently suboptimal answer.

### Exercises

1. **Observe.** Before checking, predict whether coins `{1, 2, 5}` (a real, common alternative denomination set) would ever cause greedy to fail, using this lesson's own real check technique to justify your prediction rather than intuition alone.
2. **Formalize.** Confirm your Exercise 1 prediction with real code, checking every amount from `1` to `100`.
3. **Formalize.** Investigate the real, visible pattern in `{1, 3, 4}`'s own failures (every fourth amount, starting at `6`) — compute the real greedy and DP-optimal coin counts at each failing amount, and state, in your own words, what's happening structurally at each one.
4. **Explain.** In your own words, explain why `dp-min-coins` can never inherit greedy's own failure mode, referencing exactly what `for-each` over every coin, at every amount, guarantees that `greedy-change`'s own single, committed choice does not.
5. **Explain.** Using this lesson's real numbers and Lesson 132's own greedy-choice property, state precisely, for coins `{1, 3, 4}` at amount `6`, which specific choice violates the property, and what the property would have required instead.

### Definition of done

- [ ] You can state why "always take the largest coin that fits" is a genuinely natural strategy, not a contrived example of doing greedy wrong.
- [ ] You can explain why the same strategy is correct for some coin systems and provably wrong for others, referencing what specifically differs between them.
- [ ] You can point to this lesson's own real numbers — the `100`-amount clean sweep for one system, the `7` real failures for the other — as concrete, checked, quantified evidence.
- [ ] You completed Exercises 1–5, including a real investigation of the visible failure pattern in `{1, 3, 4}`.
- [ ] Commit your Exercise 2 and 3 findings, with a commit message stating your real, checked results.
