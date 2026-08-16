# Lesson 199: Branch Prediction

- **What you will build** — a formal name and cost for the guess Lesson
  197's `fetch` was already silently making, a smarter predictor that
  remembers a branch's last real outcome instead of always assuming the
  same thing, and a real, quantified comparison — `4` mispredictions
  against `2`, `20` wasted cycles against `10` — for the exact same
  five-iteration loop. The transferable problem: Lesson 197 showed fetch
  has to guess the next instruction before execute confirms anything.
  That guess has a name — a **branch prediction** — and a real, growing
  cost when it's wrong, which is exactly why real CPUs don't just guess
  "nothing ever jumps" and call it done.
- **What you need to know first** — `fetch`'s tentative program counter,
  `resolve-pc` (Lesson 197); `jump-if-zero`'s condition-testing shape
  (Lessons 195, 196); the real, quantified cycle-cost accounting Lesson
  198 already established for cache hits and misses.
- **Terms introduced in this lesson**
  - **branch** — any instruction whose next-instruction address isn't
    simply "the one right after it" — a jump, or a conditional jump like
    `jump-if-zero`.
  - **taken / not-taken** — whether a branch actually redirected
    execution (taken) or fell through to the next instruction as normal
    (not-taken), the two possible real outcomes any single run of a
    branch can have.
  - **branch prediction** — a guess, made at fetch time, about whether an
    upcoming branch will be taken or not, before execute has actually
    resolved it.
  - **misprediction (misprediction penalty)** — what happens when a
    prediction turns out wrong: whatever was fetched (and, in real
    hardware, partly executed) on the wrong assumption has to be thrown
    away, at a real, measurable cost.
- **Objects and methods used**: None new. This lesson reuses `if`, `=`,
  `+`, `*` (Section I), `empty?`, `first`, `rest` (Section II), each
  already covered.

---

## Concept Unit: Naming the Guess, and Its Cost

### The Problem

Lesson 197's `fetch` always returned `pc + 1` as its tentative guess, and
`resolve-pc` only ever overrode it for an actual jump. That guess was
never given a name, and neither was what should happen when it's wrong —
Lesson 197's own trace only ever showed `resolve-pc` quietly correcting
it, with no cost attached at all.

### Introduce the Concept in Isolation

Skipped — this unit only names and measures something Lesson 197 already
built; no new syntax is involved.

### Discard the Throwaway Example

Not applicable — there is no separate throwaway example in this unit.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch addition
  continuing directly from Lesson 197's fetch-decode-execute cycle.
- **Files affected**: None — a standalone `bb` script for this lesson.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

The simplest possible **branch prediction** strategy — and exactly what
Lesson 197's `fetch` was already doing, now given its real name — always
guesses **not-taken**:

```clojure
(defn predict-always-not-taken
  [history]
  "not-taken")
```

Whether that guess was right or wrong is a plain comparison against what
actually happened:

```clojure
(defn actual-outcome
  [r0-value]
  (if (= r0-value 0) "not-taken" "taken"))
```

```clojure
(defn mispredicted?
  [prediction actual]
  (if (= prediction actual) false true))
```

### The Updated Project

Skipped — no enclosing file exists yet; these are freestanding functions
used directly at the `bb` REPL.

### Mechanical Walkthrough

Enumerating `predict-always-not-taken`'s body: `"not-taken"`, returned
unconditionally — **(a) first appearance**: this is Lesson 197's own
`fetch` behavior, exactly, now stated as a named, deliberate strategy
rather than something that just happened to be true of how `fetch` was
written.

Enumerating `actual-outcome`'s body: `(= r0-value 0)` — **(c) already
basic**; the same test `jump-if-zero`'s own execution already performs,
here used only to describe the outcome, not to act on it.

Enumerating `mispredicted?`'s body: `(= prediction actual)` — **(c)
already basic**; a prediction is wrong exactly when it doesn't match
what really happened, nothing more subtle than that.

Trace `predict-always-not-taken` and `mispredicted?` against a
`jump-if-zero` testing register `0` across a countdown from `4` down to
`0` — the same shape Lesson 195's and 197's own loop used, extended one
more iteration to make the pattern unmistakable:

```
r0 = 4: predict "not-taken", actual "taken"     (4 ≠ 0) → mispredicted!
r0 = 3: predict "not-taken", actual "taken"     → mispredicted!
r0 = 2: predict "not-taken", actual "taken"     → mispredicted!
r0 = 1: predict "not-taken", actual "taken"     → mispredicted!
r0 = 0: predict "not-taken", actual "not-taken" → correct
```

Four mispredictions out of five checks of the *same* branch. This is not
a contrived worst case — it's the exact shape a loop naturally produces
once its exit test sits at the *bottom*, checking "should this repeat,"
which real compiled loops overwhelmingly do: taken almost every time,
not-taken exactly once, at the very end.

### CS Lens

A real, measurable cost for guessing wrong about control flow is not a
detail invented for this lesson — it's a defining fact about every real
CPU built in the last several decades.

```
Also recognized in: real, published, often ten-to-twenty-cycle branch
misprediction penalties on modern CPUs — directly caused by how deep a
real pipeline (Lesson 200) is, since a deeper pipeline has more
already-started work to discard when a guess turns out wrong; real
profiling and performance-counter tools, which report "branch
misprediction rate" as a genuine, measured statistic; and the general
"speculate now, correct later" pattern, recurring in optimistic database
transactions and optimistic concurrency protocols far outside CPU design
```

### SE Lens

Never speculating at all — waiting for execute to fully resolve a branch
before fetching anything else — was the available alternative, and it is
always correct: zero mispredictions, ever. Its real, severe cost is that
the fetch unit then sits completely idle every single cycle a branch is
pending, which is exactly what a naive, non-speculating CPU has to
accept. Guessing, as Lesson 197's `fetch` already did and this unit now
names directly, risks a real, measurable misprediction cost — but lets
the CPU keep working most of the time instead of stalling on every single
branch. Whether that bet pays off depends entirely on how often the guess
turns out right, which is exactly what the next unit tries to improve.

---

## Concept Unit: A Smarter Predictor

### The Problem

"Always guess not-taken" mispredicted four times out of five on a
completely ordinary loop. Real branches — especially loop branches — tend
to repeat their *own* last outcome far more often than not. Can a
predictor use that?

### Introduce the Concept in Isolation

Skipped — this unit's new functions reuse only already-lab'd `if` and
plain values; the real content is the strategy itself, demonstrated
directly in the trace below.

### Discard the Throwaway Example

Not applicable — same as the first unit.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the first unit.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `mispredicted?`.
- **Dependencies**: Babashka, already installed.

### The New Code

A **last-outcome predictor** guesses whatever this branch actually did
the previous time it ran, defaulting to not-taken before there's any
history at all:

```clojure
(defn predict-last-outcome
  [history]
  history)
```

```clojure
(defn update-history
  [history actual]
  actual)
```

### The Updated Project

Running a whole sequence of checks against a chosen predictor, counting
mispredictions:

```clojure
(defn run-predictions
  [predict-fn history r0-values mispredictions]
  (if (empty? r0-values)
    mispredictions
    (run-predictions-step predict-fn history r0-values mispredictions
                           (predict-fn history) (actual-outcome (first r0-values)))))
```

```clojure
(defn run-predictions-step
  [predict-fn history r0-values mispredictions prediction actual]
  (run-predictions predict-fn (update-history history actual) (rest r0-values)
                    (+ mispredictions (if (mispredicted? prediction actual) 1 0))))
```

### Mechanical Walkthrough

Enumerating `predict-last-outcome`'s and `update-history`'s bodies:
`history`, `actual`, returned directly — **(a) first appearance**: this
predictor carries real, if minimal, state between calls — one
remembered value, updated every time — the first prediction strategy in
this lesson that isn't a fixed, unconditional answer.

Enumerating `run-predictions`'s and `run-predictions-step`'s bodies —
**(b) a hard concept reappearing**: compute-once-pass-to-helper and
accumulator recursion, threading `history` and `mispredictions` forward
together, the same discipline this whole section has used since Lesson
184.

Trace `run-predictions` with `predict-last-outcome`, starting `history =
"not-taken"`, against the same five checks — `r0-values = (4 3 2 1 0)`:

```
r0=4: predict "not-taken" (default), actual "taken"  → WRONG, history → "taken"
r0=3: predict "taken",               actual "taken"  → correct, history → "taken"
r0=2: predict "taken",               actual "taken"  → correct, history → "taken"
r0=1: predict "taken",               actual "taken"  → correct, history → "taken"
r0=0: predict "taken",               actual "not-taken" → WRONG, history → "not-taken"
```

Two mispredictions — one at the very start, before any history exists to
predict from, and one at the very end, when the loop's pattern finally
breaks. Every check in between, once the predictor had a real history to
work from, was correct. Compare that to the first unit's four
mispredictions on the identical sequence: this predictor's error count
doesn't grow with how many times the loop repeats — a longer loop would
still mispredict exactly twice, while "always not-taken" would
mispredict on *every* additional taken iteration.

### CS Lens

Remembering a branch's own recent history to predict its next outcome is
a real, established family of predictor designs, not a simplification
invented for this lesson.

```
Also recognized in: real one-bit and two-bit saturating-counter branch
predictors, genuinely used in real, simpler CPU designs — this lesson's
own predictor is an honest, if simplified, member of that family, not a
strawman; modern CPUs' far more sophisticated predictors, which track
long patterns of history and are a real, direct evolution of this same
idea; and weather forecasting's own "persistence" method — betting
tomorrow will resemble today — the identical statistical wager, in a
completely unrelated domain
```

### SE Lens

"Always not-taken," the first unit's baseline, needs no extra hardware
state at all — nothing to remember, nothing to update. A last-outcome
predictor needs a small memory slot *per branch*, a real, if modest,
hardware cost paid whether or not that particular branch ever benefits
from it. The reduction in mispredictions this unit just measured — half,
on a short loop, and proportionally far more on a longer one — is the
real, well-documented reason CPU designers have accepted that cost for
decades. Neither predictor is free; one pays in wasted cycles when
wrong, the other pays in silicon dedicated to remembering history whether
or not it helps.

---

## Concept Unit: Quantifying the Real Cost

### The Problem

Mispredictions have been counted so far, but not priced. Lesson 198
already established that cycles have a real, comparable cost — what does
translating "four mispredictions" and "two mispredictions" into an actual
cycle cost, the same way Lesson 198 priced cache hits and misses, reveal?

### Introduce the Concept in Isolation

Skipped — pricing a count is one multiplication, already fully covered;
the real payoff is the comparison itself, shown directly below.

### Discard the Throwaway Example

Not applicable — same as the earlier units.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, same as
  the earlier units.
- **Files affected**: None — same standalone `bb` script, extended.
- **Change type**: Add.
- **Location**: Directly below `run-predictions-step`.
- **Dependencies**: Babashka, already installed.

### The New Code

A flat penalty per misprediction, the same flat-cost style Lesson 198
used for a cache miss:

```clojure
(defn misprediction-cost
  [mispredictions penalty]
  (* mispredictions penalty))
```

### The Updated Project

Skipped — no enclosing file exists yet; a standalone call comparing both
predictors' totals at the `bb` REPL.

### Mechanical Walkthrough

`(* mispredictions penalty)` — **(c) already basic** arithmetic; the
entire point is what it's applied to, not the arithmetic itself.

Price both predictors' results from the earlier units at a `5`-cycle
misprediction penalty:

```
misprediction-cost 4 5   → 20    ("always not-taken," this lesson's first unit)
misprediction-cost 2 5   → 10    (last-outcome, this lesson's second unit)
```

Twenty wasted cycles against ten — for the exact same five-check
sequence, on the exact same branch. And the gap is not fixed: a
ten-iteration version of this same loop would cost "always not-taken"
`9 × 5 = 45` wasted cycles (mispredicting on every taken iteration but the
last), while last-outcome would still cost exactly `2 × 5 = 10` — the
same two mispredictions it always pays, no matter how long the loop runs.
This is the real, quantified reason branch prediction quality matters
more, not less, as programs and their loops get larger.

### CS Lens

A fixed, per-event cost multiplied by how often that event happens is the
same shape of accounting Lesson 198 already used for caches, applied here
to a different kind of penalty entirely.

```
Also recognized in: real, published misprediction-penalty figures for
real commercial CPUs, used by hardware engineers to justify investment
in better predictors; and the direct, historical feedback loop between
pipeline depth (Lesson 200) and predictor sophistication — a deeper
pipeline makes each individual misprediction cost more cycles to recover
from, which is exactly why CPUs with deeper pipelines have historically
invested in smarter predictors, not simpler ones
```

### SE Lens

Accepting "always not-taken" and its larger, loop-length-dependent cost
was the available alternative, and for some programs, it costs almost
nothing extra to accept: a branch that's genuinely unpredictable — no
real pattern to its own history at all — gains nothing from a smarter
predictor no matter how sophisticated, since there's no real regularity
there to learn. A last-outcome predictor's bookkeeping — updating history
on *every* branch, whether or not that branch ever benefits — is itself a
small, real, constant cost paid unconditionally. Real programs are
overwhelmingly loop-and-branch heavy, which is why the trade is worth it
in aggregate, not because every single branch individually benefits.

---

## Connect the Pieces

Follow one five-iteration loop through every idea this lesson built.
`predict-always-not-taken`, formalizing exactly what Lesson 197's `fetch`
already did with no extra logic, mispredicts four times out of five
checks — once for every taken iteration, since it never learns anything
from what already happened. `predict-last-outcome`, remembering the
single most recent real outcome, mispredicts only twice — once before it
has any history, once when the pattern finally breaks — regardless of how
many times the loop actually repeats. `misprediction-cost`, priced the
same way Lesson 198 priced a cache miss, turns those counts into `20`
wasted cycles against `10` for this exact loop, with the gap only growing
for a longer one. Nothing about `resolve-pc` (Lesson 197) or the loop's
own instructions changed anywhere in this lesson — only how well the
guess fetch has to make, every single cycle, actually holds up.

## What Breaks Without This

`run-predictions-step`'s entire point is threading `update-history`'s
result *forward* into the next call. Drop that — call `update-history`
but never use what it returns, reusing the *original* `history` on every
step instead:

```clojure
(defn run-predictions-broken
  [predict-fn history r0-values mispredictions]
  (if (empty? r0-values)
    mispredictions
    (run-predictions-broken-step predict-fn history r0-values mispredictions
                                  (predict-fn history) (actual-outcome (first r0-values)))))
```

```clojure
(defn run-predictions-broken-step
  [predict-fn history r0-values mispredictions prediction actual]
  (run-predictions-broken predict-fn history (rest r0-values)
                           (+ mispredictions (if (mispredicted? prediction actual) 1 0))))
```

Trace it with `predict-last-outcome`, `history = "not-taken"`, on the
same `(4 3 2 1 0)` sequence: `history` is passed straight through to the
next call, completely unchanged, on every single step — `update-history`
is still called, its return value just never goes anywhere.
`predict-last-outcome` therefore reads the identical, permanently-stuck
`"not-taken"` value on every check, exactly like `predict-always-not-
taken`. The result: `4` mispredictions, not `2` — this "smarter"
predictor silently regresses to the naive baseline's exact performance,
even though its own code still calls `predict-last-outcome` and
`update-history` and looks, on a casual read, like it's doing something
more sophisticated. Nothing crashes, and nothing about the code's shape
announces the bug — the failure is entirely in one function receiving
the *stale* `history` argument instead of the freshly updated one.
Threading `update-history`'s real return value forward, as the original
`run-predictions-step` does, is what lets the predictor actually learn
anything at all.

## Exercises

1. Trace `run-predictions` with `predict-always-not-taken` on a *shorter*
   sequence, `r0-values = (1 0)` — a two-iteration loop — and confirm it
   mispredicts exactly once, matching the "one misprediction per taken
   iteration" pattern this lesson names.
2. Trace `run-predictions` with `predict-last-outcome` on a sequence with
   no pattern at all, `r0-values = (1 0 1 0 1)` — alternating every time —
   and count the mispredictions. State whether this predictor still
   outperforms `predict-always-not-taken` on this input, and why or why
   not.
3. Using `misprediction-cost`, compute the real cycle cost of `predict-
   always-not-taken`'s mispredictions on a twenty-iteration loop (`19`
   taken checks, `1` not-taken) at a `5`-cycle penalty, and compare it to
   `predict-last-outcome`'s cost on the same loop.

## Definition of Done

- [ ] `predict-always-not-taken`, `actual-outcome`, and `mispredicted?`
      are written and hand-traced for the five-check countdown, matching
      this lesson's `4` mispredictions.
- [ ] `predict-last-outcome`, `update-history`, `run-predictions`, and
      `run-predictions-step` are written and hand-traced for the same
      sequence, matching `2` mispredictions.
- [ ] `misprediction-cost` is confirmed against both predictors' totals,
      matching `20` and `10` cycles.
- [ ] The "What Breaks Without This" trace is understood well enough to
      explain, without notes, why the broken version's mispredictions
      match `predict-always-not-taken`'s count exactly, `4`, rather than
      producing some other wrong number.
- [ ] Commit with a message explaining *why* a predictor's misprediction
      count stays constant as a loop gets longer while the naive
      strategy's grows, not just *what* functions were added.
