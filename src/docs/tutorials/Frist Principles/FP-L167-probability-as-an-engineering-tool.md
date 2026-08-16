# Lesson 167: From Formula to Decision — Probability as an Engineering Tool

**What you will build.** Three real, practical tools, each turning a piece of Era VI's own probability machinery into a genuine engineering decision: `series-uptime` and `parallel-uptime`, which compute a whole system's real reliability from its individual components'; `minimum-sample-size`, which answers "how much data is actually enough," derived directly from Lesson 166's own Chebyshev bound; and a real, working experiment that uses that derived sample size to reliably tell two different real success rates apart. The transferable idea: everything Era VI has built — expected value, variance, distributions, sampling, Chebyshev's inequality — has been proven and verified as *mathematics*; this lesson's whole point is turning that mathematics into concrete, defensible *engineering* answers: how reliable is this system, how much data does this experiment need, and how confident can this measurement actually be trusted.

**What you need to know first.** Lesson 150 (Independence) for combining independent probabilities. Lesson 154 (Variance) and Lesson 155 (Common Distributions) for a Bernoulli trial's own variance, `p(1-p)`. Lesson 159 (Monte Carlo Algorithms) for checking a probabilistic claim with real, independent trials. Lesson 162 (Sampling) for `random` and this curriculum's exact-arithmetic practice. Lesson 166 (Concentration Intuition), directly and load-bearingly — this lesson's entire Concept Unit 2 is a new, practical application of Lesson 166's own `chebyshev-bound`, rearranged to answer a different, more useful question.

**Terms used in this lesson**

- **`define`** — binds a name, at top level, to a procedure or a value.
- **`let`** — introduces one or more local bindings, visible only inside `let`'s own body.
- **Named `let` (self-referential loop)** — a `let` that gives its own body a name, so the body can call that name again with new argument values. Scheme's loop construct, with no separate `for` or `while` keyword.
- **Accumulator-passing recursion** — carrying the "answer built so far" as an extra argument on each self-call. Every loop in this lesson uses it, unchanged from its use across Lessons 162 through 166.
- **`cond`** — a multi-branch conditional, its clauses tried top to bottom, stopping at the first one whose test is true. This lesson reuses it for a genuinely three-way choice: a list of components is empty, or its first component is down, or neither.
- **`else`** — `cond`'s reserved catch-all clause, always true, always tried last if nothing earlier matched. It exists to guarantee some clause always fires, so `cond` never silently produces nothing.
- **`lambda`** — builds an anonymous procedure, created right where it's needed. This lesson uses it for a one-off "turn an uptime into a downtime" transformation, passed straight to `map`.
- **Exact rational numbers** — Guile's numeric tower represents the result of dividing two exact integers that don't divide evenly as an exact fraction, never a rounded decimal. This lesson's uptimes, sample sizes, and thresholds all stay exact fractions throughout, converted to decimals only for reading.
- **Series system** — a system that's only "up" if *every* one of its components is up; a single failed component is enough to bring the whole thing down.
- **Parallel (redundant) system** — a system that's "up" as long as *at least one* of its components is up; every component would need to fail at once to bring it down.
- **Margin of error** — how far a measurement is allowed to stray from the true value and still count as acceptable; this lesson's own `epsilon`.
- **Confidence level** — how often a measurement is required to actually fall within its own margin of error; commonly stated as `1 - delta`, where `delta` is the accepted chance of failing to meet the margin.
- **Sample size** — how many independent observations an experiment actually collects; this lesson derives, rather than guesses, how large this needs to be for a given margin of error and confidence level.

**Objects and methods used**

*This lesson's own subject, in the order its Concept Units introduce them:*

- **`series-uptime`**
  - *What it is:* a procedure this lesson derives in Concept Unit 1 — computes a series system's exact overall uptime probability from a list of its independent components' own uptime probabilities.
  - *Implementation:* `(series-uptime component-uptimes)` → an exact rational, the product of every component's own uptime.
  - *Its use:* answers "what's the real chance this whole chain of dependent components is all working at once."
- **`parallel-uptime`**
  - *What it is:* derived in Concept Unit 1 — computes a redundant system's exact overall uptime probability from a list of its independent components' own uptime probabilities.
  - *Implementation:* `(parallel-uptime component-uptimes)` → an exact rational, `1` minus the product of every component's own downtime.
  - *Its use:* answers "what's the real chance at least one backup is still working," the whole reason redundancy exists as an engineering strategy.
- **`minimum-sample-size`**
  - *What it is:* derived in Concept Unit 2 — computes how many independent observations are needed to guarantee, via Lesson 166's own Chebyshev bound, that a sample mean strays from the truth by at most a given margin, at most a given fraction of the time.
  - *Implementation:* `(minimum-sample-size variance-of-x delta epsilon)` → an exact integer, the smallest `n` guaranteeing `Var(X)/(n·ε²) ≤ δ`.
  - *Its use:* replaces "how much data should I collect" as a guess with an actual, derived, defensible answer.

*Everything else in the file, not this lesson's subject but still explained:*

- **`random`**
  - *What it is:* Guile's built-in source of pseudo-randomness, first given full treatment in Lesson 162.
  - *Implementation:* `(random n)`, for exact integer `n`, returns an exact integer uniformly chosen from `0` up to (not including) `n`.
  - *Its use:* every simulated component failure and every simulated trial in this lesson bottoms out in a call to `random`.
- **`apply`**
  - *What it is:* a procedure that calls another procedure, but with its arguments taken from a list instead of written out individually.
  - *Implementation:* `(apply proc list)` calls `proc` with `list`'s own elements as its separate arguments.
  - *Its use:* multiplies together an entire list of component uptimes (or downtimes) at once, without needing to know in advance how many components there are.
- **`map`**
  - *What it is:* a transformation procedure — applies a given procedure to every element of a list, returning a new list of the results.
  - *Implementation:* `(map proc list)` returns a new list, `(proc x)` for each `x` in `list`.
  - *Its use:* turns a whole list of component uptimes into a matching list of downtimes, one subtraction at a time.
- **`car`**
  - *What it is:* an accessor — returns the first element of a pair, and by extension a list's first element.
  - *Implementation:* `(car p)` returns the first component of pair `p`.
  - *Its use:* reads the current component's own uptime probability off the front of the list being scanned.
- **`cdr`**
  - *What it is:* an accessor — returns everything in a pair after the first element; for a list, the rest of the list.
  - *Implementation:* `(cdr p)` returns the second component of pair `p`.
  - *Its use:* advances the scan through a list of component uptimes one component at a time.
- **`null?`**
  - *What it is:* a predicate — reports whether a value is the empty list.
  - *Implementation:* `(null? x)` returns `#t` if `x` is `'()`.
  - *Its use:* detects that every component in a system has already been checked, with none causing an early answer.
- **`not`**
  - *What it is:* a predicate — flips a boolean value.
  - *Implementation:* `(not x)` returns `#t` if `x` is `#f`, and `#f` for anything else.
  - *Its use:* turns "is this component up" into "is this component down," the condition a series system needs to check.
- **`ceiling`**
  - *What it is:* a procedure — rounds a number up to the nearest integer.
  - *Implementation:* `(ceiling x)` returns the smallest integer greater than or equal to `x`, preserving exactness if `x` was exact.
  - *Its use:* a derived sample size has to be a whole number of observations, and rounding *down* would fall just short of the guarantee the derivation actually proves — `ceiling` rounds the right direction.
- **`abs`**
  - *What it is:* a procedure — returns a number's absolute value.
  - *Implementation:* `(abs x)` returns `x` if `x ≥ 0`, and `-x` otherwise.
  - *Its use:* measures how far a sample mean strayed from a true rate, in either direction.
- **`exact->inexact`**
  - *What it is:* a converter — turns an exact number into an ordinary inexact decimal, for reading.
  - *Implementation:* `(exact->inexact n)` returns the closest floating-point representation of `n`.
  - *Its use:* converts this lesson's exact uptimes, sample sizes, and measured rates into readable decimals.
- **`display`**
  - *What it is:* an output procedure — writes a human-readable representation of a value to the terminal.
  - *Implementation:* `(display obj)` sends `obj`'s printed form to the current output port.
  - *Its use:* every real result in this lesson's Run It sections was produced with `display`.
- **`newline`**
  - *What it is:* an output procedure — writes a single line break.
  - *Implementation:* `(newline)` takes no required arguments.
  - *Its use:* keeps each displayed result on its own line.
- **`+`, `-`, `*`, `/`**
  - *What it is:* four of Scheme's arithmetic procedures — ordinary procedures, not special syntax.
  - *Implementation:* each takes any number of numeric arguments; `/` on two exact integers that don't divide evenly returns an exact rational.
  - *Its use:* `+` accumulates trial counts and successes; `-` computes a component's downtime from its uptime; `*` multiplies uptimes and downtimes together, and scales thresholds; `/` computes every rate, bound, and sample size in this lesson.
- **`<`, `>`, `=`**
  - *What it is:* numeric comparison procedures, returning `#t` or `#f`.
  - *Implementation:* `(< a b)`, `(> a b)`, and `(= a b)` compare two numbers.
  - *Its use:* `<` decides whether a simulated component came up or down; `>` decides which of two measured sample means came out higher; `=` recognizes every loop's base case.

---

## Concept Unit: Reliability — Series and Parallel Systems

### The Problem

A real system is rarely just one component — it's several, wired together in one of two fundamentally different ways. A **series** arrangement — a request that has to pass through a load balancer, then a web server, then a database, in sequence — is only as reliable as its *weakest single link*: any one component failing takes the whole chain down. A **parallel**, redundant arrangement — two backup generators, either one capable of powering the building alone — is far more forgiving: every single one would have to fail at once for the whole system to go down. Given each individual component's own real uptime probability, independent of the others, what's the exact probability the *whole system* — series or parallel — is actually up?

### Project Change

- **Reference Source** — No reference counterpart. This lesson derives its reliability model from first principles, reusing Lesson 150's own independence rules.
- **Files affected** — this lesson's own file. As established in Lesson 162, this curriculum has no separate, persisted project source tree.
- **Change type** — add: two new top-level procedures.
- **Location** — nothing precedes them in this lesson yet; these are the first definitions this lesson makes.
- **Dependencies** — none beyond Guile's built-in list procedures.

### The New Code

```scheme
(define (series-uptime component-uptimes)
  (apply * component-uptimes))

(define (parallel-uptime component-uptimes)
  (- 1 (apply * (map (lambda (p) (- 1 p)) component-uptimes))))
```

### The Updated Project

Skipped — `series-uptime` and `parallel-uptime` are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside yet; Project Change already covers this case.

### Isolated Lab: One Redundant Pair, Checked by Direct Enumeration

The core new idea here is the "at least one works" calculation for a redundant pair — computed not by directly counting the ways at least one could work, but by the easier complementary route: `1` minus the probability *both* fail. Isolated, on two identical, fair, `50%`-reliable backup generators:

```scheme
(define (redundant-uptime p1 p2) (- 1 (* (- 1 p1) (- 1 p2))))
```

Run for real:

```scheme
(redundant-uptime 1/2 1/2)
;=> 3/4
```

A direct check, by hand, confirms it: two `50%`-reliable generators have exactly four equally likely combinations — (up, up), (up, down), (down, up), (down, down) — and the system is down in exactly one of those four, `(down, down)`, probability `1/4`. `1 - 1/4 = 3/4`, matching `redundant-uptime`'s own real output exactly. Computing `1` minus "both fail" is easier than directly summing "up-up," "up-down," and "down-up" separately, and it only gets easier as more components join a redundant group — every added generator is one more factor multiplied into "all fail," never a new case to separately enumerate.

### Discarding the Lab

`redundant-uptime`, fixed at exactly two components, is discarded now. It never appears in the project again — `parallel-uptime`, defined above, generalizes this exact same "one minus the product of every downtime" idea to a list of any length.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (series-uptime component-uptimes) (apply * component-uptimes))`** — `define` binds `series-uptime` to a one-parameter procedure. `component-uptimes` is a list of independent probabilities, one per component; `(apply * component-uptimes)` multiplies every one of them together in a single step. This is Lesson 150's own independence rule, generalized past two events: for independent events, the probability of *all* of them happening is the product of their individual probabilities — here, "every component is up."
- **`(define (parallel-uptime component-uptimes) ...)`** — `define` binds `parallel-uptime` to a one-parameter procedure.
- **`(map (lambda (p) (- 1 p)) component-uptimes)`** — `(lambda (p) (- 1 p))` is a small anonymous procedure: given one component's own uptime, `p`, it computes that same component's downtime, `1 - p`. `map` applies this to every uptime in `component-uptimes`, producing a matching list of downtimes.
- **`(apply * ...)`** — multiplies every one of those downtimes together — by the same independence rule `series-uptime` used, this is the probability *every single component* is down at once, the only way a redundant system actually fails.
- **`(- 1 ...)`** — subtracts that "all down" probability from `1`, giving the probability of the complementary event: *not* every component down, meaning at least one is up.

### CS Lens

This is combining independent probabilities via structure — **series** systems multiplying uptimes directly (an "and every one" requirement), **parallel** systems multiplying *downtimes* and complementing the result (an "and none of them" avoided, meaning "at least one").

Also recognized in: circuit reliability analysis, where series and parallel circuits are named for exactly this same up/down logic, historically the origin of the terminology itself; RAID storage redundancy, where multiple disks in a redundant array tolerate individual drive failures using precisely this "not all fail at once" reasoning; airline scheduling, where a single connecting flight is a series dependency (miss one leg, miss the whole trip) while multiple daily flights on the same route act as a parallel backup; and distributed systems' own replica-based fault tolerance, where a request only fails if *every* replica serving it happens to be down simultaneously.

### SE Lens

The design principle here is **redundancy as a deliberate, quantifiable trade**, not just an intuitive "more backups are safer" feeling. `parallel-uptime` makes the actual *size* of that benefit computable: two `99%`-reliable components in parallel aren't merely "safer," they're `99.99%`-reliable together — a real, tenfold reduction in downtime probability, not a vague improvement.

An alternative that was *not* chosen: build every system as a series chain, treating any duplication as unnecessary complexity. That alternative is genuinely simpler — fewer components to manage, deploy, and monitor — and it's the right choice whenever a component is already reliable enough on its own that the extra complexity isn't worth it. The real cost of choosing series-only regardless: `series-uptime` makes clear that a chain's reliability is *always* less than or equal to its least reliable single link — stacking six `99%`-reliable components in series, with nothing redundant, gives a whole-system uptime under `95%` (`0.99⁶ ≈ 0.9415`), a real, measurable degradation that compounds with every additional link, precisely the cost that makes redundancy worth its own real complexity for the components that matter most.

### Run It

Three real components — a load balancer at `99%` uptime, a web server at `98%`, a database at `99.5%` — wired in series:

```scheme
(series-uptime (list 99/100 49/50 199/200))
;=> 965349/1000000

(exact->inexact (series-uptime (list 99/100 49/50 199/200)))
;=> 0.965349
```

Three individually-reliable components, chained together, give a whole system barely above `96.5%` — real, exact evidence of how quickly series reliability compounds downward.

Two of those same-tier components — `99%` and `98%` — wired in parallel instead:

```scheme
(parallel-uptime (list 99/100 49/50))
;=> 4999/5000

(exact->inexact (parallel-uptime (list 99/100 49/50)))
;=> 0.9998
```

`99.98%` — noticeably higher than either individual component alone, real confirmation that redundancy genuinely compounds *upward*, the mirror image of series reliability's downward compounding.

**Checked against real simulation, not just the formula:** flipping a biased coin for each component, independently, every simulated "hour," and checking whether the whole system — series or parallel — came up:

```scheme
(define (component-up? p) (< (random 10000) (* 10000 p)))

(define (series-up? uptimes)
  (cond
    ((null? uptimes) #t)
    ((not (component-up? (car uptimes))) #f)
    (else (series-up? (cdr uptimes)))))

(define (parallel-up? uptimes)
  (cond
    ((null? uptimes) #f)
    ((component-up? (car uptimes)) #t)
    (else (parallel-up? (cdr uptimes)))))

(define (measure-uptime-fraction up? uptimes trials)
  (let loop ((t 0) (up 0))
    (if (= t trials)
        (/ up trials)
        (loop (+ t 1) (if (up? uptimes) (+ up 1) up)))))

(exact->inexact (measure-uptime-fraction series-up? (list 99/100 49/50 199/200) 100000))
;=> 0.96493

(exact->inexact (measure-uptime-fraction parallel-up? (list 99/100 49/50) 100000))
;=> 0.99987
```

`100,000` real simulated hours: measured series uptime `0.96493` against a predicted `0.965349`, and measured parallel uptime `0.99987` against a predicted `0.9998` — both real, independent confirmations, matching to within a fraction of a percent.

### Connection

Reliability is now something this lesson can compute exactly, for a system whose components are already known. The next problem shifts from a known system to an *unknown* one: given a real experiment still to be run, how much data does it actually need before the result can be trusted?

---

## Concept Unit: How Much Data Is Enough?

### The Problem

Lesson 166 proved `chebyshev-bound`: given a sample size `n`, it computes the worst-case probability a sample mean strays more than some margin from the truth. That's a real, useful check *after* deciding how much data to collect — but real engineering decisions usually come the other way around: given a *maximum acceptable* chance of being wrong, and a *maximum acceptable* margin of error, how large does `n` actually need to be, chosen *before* a single observation is collected?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: one new, freestanding top-level procedure.
- **Location** — after `parallel-uptime`; independent of Concept Unit 1's own reliability tools.
- **Dependencies** — reuses Lesson 166's own Chebyshev bound formula, restated here rather than imported, per this curriculum's practice of full, self-contained treatment.

### The New Code

```scheme
(define (minimum-sample-size variance-of-x delta epsilon)
  (ceiling (/ variance-of-x (* delta (* epsilon epsilon)))))
```

### The Updated Project

Skipped — a brand-new, freestanding top-level procedure with no existing enclosing structure to place it inside.

### Isolated Lab: Verifying a Rearranged Formula by Substitution

The core new idea here is algebraic, not a new Scheme construct: Lesson 166's own Chebyshev bound, `P(|X̄_n − mean| ≥ ε) ≤ Var(X)/(n·ε²)`, treats `n` as a known quantity and produces a bound. This lesson needs the *opposite* direction — starting from a desired bound, `delta`, and solving for the smallest `n` that achieves it: `Var(X)/(n·ε²) ≤ delta` rearranges, by ordinary algebra, into `n ≥ Var(X)/(delta·ε²)`. Isolated, checked by substituting the rearranged answer directly back into the *original* inequality, on a small made-up case:

```scheme
(define lab-variance 1/4)
(define lab-delta 1/10)
(define lab-epsilon 1/10)
(define lab-n (/ lab-variance (* lab-delta (* lab-epsilon lab-epsilon))))
```

Run for real:

```scheme
lab-n
;=> 250

(/ lab-variance (* lab-n (* lab-epsilon lab-epsilon)))
;=> 1/10

(= (/ lab-variance (* lab-n (* lab-epsilon lab-epsilon))) lab-delta)
;=> #t
```

Solving for `n` gives `250`; substituting `250` back into the *original*, un-rearranged bound formula gives back exactly `1/10` — precisely `lab-delta`, confirmed with `=`, not merely "close." The rearrangement is exact algebra, not an approximation, and this real substitution proves it round-trips correctly before trusting it inside a real procedure.

### Discarding the Lab

`lab-variance`, `lab-delta`, `lab-epsilon`, and `lab-n` are discarded now. They never appear in the project again — `minimum-sample-size`, defined above, performs this exact same rearranged computation, generalized to any real variance, confidence, and margin.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (minimum-sample-size variance-of-x delta epsilon) ...)`** — `define` binds `minimum-sample-size` to a three-parameter procedure: a variance, an acceptable failure probability, and an acceptable margin of error.
- **`(* epsilon epsilon)`** — computes `epsilon`'s own square, `ε²`, exactly as the Chebyshev bound's own denominator requires.
- **`(* delta (* epsilon epsilon))`** — multiplies that squared margin by `delta`, computing `δ·ε²`, the rearranged formula's own full denominator.
- **`(/ variance-of-x ...)`** — divides the given variance by that denominator, computing `Var(X)/(δ·ε²)` — this Concept Unit's own Isolated Lab, generalized past one specific numeric case.
- **`(ceiling ...)`** — rounds the result up to the nearest whole number. A sample size has to be a whole number of real observations, and the underlying math only proves the guarantee holds for `n` *at least* this large — rounding down, even slightly, would produce an `n` the derivation no longer actually covers.

### CS Lens

This is **inverting a bound**: instead of using a formula to check a claim about a chosen `n`, solving that same formula for the smallest `n` that would make a *desired* claim true.

Also recognized in: capacity planning, inverting a queueing formula to find the minimum server count that keeps expected wait time under some target, rather than only checking wait time for an already-chosen server count; cryptographic key-length selection, inverting a brute-force cost formula to find the minimum key length that makes breaking it computationally infeasible within some target time budget; and structural engineering, inverting a load-bearing formula to find the minimum beam thickness that keeps a real safety margin, rather than only checking whether an already-chosen thickness happens to be safe.

### SE Lens

The design principle here is **deciding a resource commitment with a provable minimum, instead of a guess padded "to be safe."** `minimum-sample-size` gives an exact number, derived from an exact, statable confidence requirement — not "collect a few thousand and hope," but "collect exactly this many, and the guarantee is real."

An alternative that was *not* chosen: pick a round, comfortable-feeling sample size — "let's just collect ten thousand" — without deriving it from an explicit margin-of-error and confidence requirement at all. That alternative is faster to decide and requires no formula at all, and for a low-stakes, exploratory check, it's often perfectly reasonable. The real cost of skipping the derivation for something that actually matters: an undersized "comfortable-feeling" sample size might silently fail to meet the confidence a decision actually needs, with nothing in the process ever surfacing that gap — while an oversized one wastes real collection cost (time, money, user exposure to an experiment) buying a confidence margin nobody asked for. `minimum-sample-size`'s own real cost, in exchange: it needs an honest, upfront answer to "how much error is actually acceptable, and how often," questions a "just collect a lot" approach never has to face directly.

### Run It

A margin of error of `1/20` (`5` percentage points), and a `1/20` chance of missing that margin — a `95%` confidence requirement — for a worst-case Bernoulli variance of `1/4`:

```scheme
(minimum-sample-size 1/4 1/20 1/20)
;=> 2000
```

`2,000` observations, derived, not guessed. Checked against real, independent simulation — running `5,000` independent `2,000`-flip experiments at the worst-case rate, `p = 1/2`, and measuring how often the sample mean actually strayed by `1/20` or more:

```scheme
(define (flip-p p) (if (< (random 10000) (* 10000 p)) 1 0))
(define (sample-mean-p p k)
  (let loop ((i 0) (total 0))
    (if (= i k)
        (/ total k)
        (loop (+ i 1) (+ total (flip-p p))))))
(define (fraction-exceeding-p p k epsilon trials)
  (let loop ((t 0) (bad 0))
    (if (= t trials)
        (/ bad trials)
        (let ((m (exact->inexact (sample-mean-p p k))))
          (loop (+ t 1) (if (>= (abs (- m (exact->inexact p))) epsilon) (+ bad 1) bad))))))

(exact->inexact (fraction-exceeding-p 1/2 2000 1/20 5000))
;=> 0.0
```

`0` — not one of `5,000` real, independent `2,000`-flip experiments strayed by the full `1/20` margin, comfortably inside the `1/20` (`5%`) failure rate the derivation promised. Exactly the same honest looseness Lesson 166 already flagged: `minimum-sample-size` computed the smallest `n` Chebyshev's *worst-case* guarantee needs, and the true rate, for this specific fair-coin case, turns out to be far better than that worst case demands.

### Connection

A real, derived sample size now exists. The next problem is putting it to its actual intended use: not just confirming one rate is measured accurately, but reliably telling *two different* real rates apart.

---

## Concept Unit: Distinguishing Two Real Rates

### The Problem

The real reason an experiment collects data is rarely "measure one rate accurately" in isolation — it's usually "does variant B actually convert better than variant A." Two real conversion rates, `p_A = 1/10` and `p_B = 3/20` (a real, `5`-percentage-point difference) — how large does an experiment's sample size need to be to reliably tell these two apart, and does the sample size this lesson already knows how to derive actually deliver that?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: real experiment code, reusing `minimum-sample-size` and `sample-mean-p` from Concept Unit 2 with no modification.
- **Location** — after Concept Unit 2's own Run It.
- **Dependencies** — `minimum-sample-size` and `sample-mean-p`, both from Concept Unit 2.

### The New Code

None — this Concept Unit's own contribution is entirely a new *application* of already-derived tools, not new syntax or a new procedure shape.

### The Updated Project

Not applicable — no new code is being added to any existing structure.

### Isolated Lab: None — Justified Skip

Every construct this Concept Unit's own Run It section uses — `minimum-sample-size`, `sample-mean-p`, a count-terminated named-let loop, comparison — already has full, real treatment, either earlier in this lesson or in Lesson 166. This Concept Unit's own real content is a decision — how to set `epsilon` when the actual question is "which of two rates is bigger," not "how close is this one rate" — worked through directly in the section immediately below, not a new piece of syntax needing its own isolated demonstration.

### Choosing the Margin of Error

Distinguishing two real rates that differ by `1/20` needs a margin of error *smaller* than that difference — otherwise, both sample means could land close enough to the *midpoint* of the true rates that either could plausibly appear larger, even with the guarantee from Concept Unit 2 fully intact for each rate on its own. Setting `epsilon = 1/40` — half the true difference — means: if variant A's own sample mean lands within `1/40` of its own true rate, *and* variant B's own sample mean lands within `1/40` of its own true rate, the two sample means are guaranteed to be correctly ordered, since the true rates themselves are a full `1/20` (twice `1/40`) apart.

### Run It

```scheme
(minimum-sample-size 1/4 1/20 1/40)
;=> 8000
```

`8,000` observations *per variant* — four times Concept Unit 2's own `2,000`, since halving the margin of error quadruples the required sample size (`epsilon` is squared in the denominator of the underlying formula).

```scheme
(exact->inexact (sample-mean-p 1/10 8000))
;=> 0.103

(exact->inexact (sample-mean-p 3/20 8000))
;=> 0.1535
```

One real experiment: variant A measured at `0.103` (true rate `0.1`), variant B measured at `0.1535` (true rate `0.15`) — both real sample means land close to their own true rates, and correctly ordered, `B > A`.

**Checked across many independent real experiments, not just one:**

```scheme
(define (experiment-correct? k) (> (sample-mean-p 3/20 k) (sample-mean-p 1/10 k)))
(define (fraction-correct trials k)
  (let loop ((t 0) (correct 0))
    (if (= t trials)
        (/ correct trials)
        (loop (+ t 1) (if (experiment-correct? k) (+ correct 1) correct)))))

(exact->inexact (fraction-correct 2000 8000))
;=> 1.0
```

`2,000` independent, real, full experiments — each one running `8,000` fresh flips for variant A and `8,000` fresh flips for variant B — and every single one correctly identified variant B as the higher real rate. This is the direct, practical payoff of everything this lesson built: a defensible, derived sample size, applied to a genuine two-variant decision, verified to actually deliver the reliability it promised.

### Connection

Three genuinely different engineering questions — how reliable is a system, how much data does an experiment need, and can two real rates be told apart — have each been answered with a real, derived number, not a guess. What's left is tracing one thread through all three, and being honest about what happens when the sample size derivation gets skipped.

---

## Closing

### Connect the Pieces

One chain of real engineering decisions, start to finish:

```scheme
(series-uptime (list 99/100 49/50 199/200))
;=> 965349/1000000
```

A real system's own exact reliability, computed from Concept Unit 1's own independence-based formula.

```scheme
(minimum-sample-size 1/4 1/20 1/20)
;=> 2000
```

A real, derived minimum sample size — not for this reliability question specifically, but the same formula, from Concept Unit 2, that any experiment measuring an unknown rate would need, built directly on Lesson 166's own Chebyshev bound.

```scheme
(exact->inexact (fraction-correct 2000 8000))
;=> 1.0
```

And, using that same derivation with a tighter margin, a real experiment reliably distinguishing two different real rates, `2,000` independent times out of `2,000` — the concrete, practical payoff of every piece of mathematics Era VI has built, from Lesson 146's first "why does probability matter to computing" through Lesson 166's own Chebyshev bound, landing here as an actual, defensible engineering decision.

### What Breaks Without This

Concept Unit 3's own sample size, `8,000` per variant, was *derived* — computed from an explicit margin of error and confidence requirement, not chosen because it felt like enough. Breaking that discipline on purpose: skip the derivation, and just guess a plausible-sounding round number instead — `100` observations per variant "feels" like a reasonable amount of data to collect.

```scheme
(define (experiment-correct-guessed? k) (> (sample-mean-p 3/20 k) (sample-mean-p 1/10 k)))
(define (fraction-correct-guessed trials k)
  (let loop ((t 0) (correct 0))
    (if (= t trials)
        (/ correct trials)
        (loop (+ t 1) (if (experiment-correct-guessed? k) (+ correct 1) correct)))))

(exact->inexact (fraction-correct-guessed 2000 100))
```

Run for real:

```
;; real output:
;; 0.833
```

Not a crash — `100` observations per variant is a perfectly ordinary, legal sample size, and nothing about `experiment-correct-guessed?` or `sample-mean-p` can tell the difference between a *guessed* sample size and a *derived* one; both are just numbers. But the real measured success rate drops from Concept Unit 3's clean `1.0` all the way down to `0.833` — real, independent experiments using the guessed `100`-observation sample size got the comparison backwards **one time out of every six**, `334` real failures out of `2,000` real experiments. Nothing about running `100` real flips per variant *feels* obviously too small — the number is round, plausible-sounding, and would pass a casual sanity check — but it falls far short of the `8,000` this lesson's own Concept Unit 2 formula actually derives for these two rates, and the real, measured cost of that shortfall is an experiment that's right only five times out of six, not the reliable, defensible result Concept Unit 3 actually delivered.

### Exercises

- This lesson's `series-uptime` compounds downward fast: three `99%`-reliable components already drop under `98%` combined. Compute, for real, how many `99%`-reliable components in series it takes before the whole system's uptime drops under `90%`.
- Redo Concept Unit 3's whole distinguishing-two-rates analysis for a *smaller* true difference — `p_A = 1/10`, `p_B = 11/100` (only a single percentage point apart) — and observe, for real, how much larger the required sample size becomes.
- `parallel-uptime` assumes every component's failure is genuinely independent of every other's — the same assumption Lesson 150 named directly. Consider (in prose, no code needed) a real scenario where two "redundant" servers might *not* fail independently — sharing a single power source, say — and explain why `parallel-uptime`'s own formula would then overstate the system's real reliability.
- Build a three-way experiment instead of two: three variants, `p_A = 1/10`, `p_B = 3/20`, `p_C = 1/5`, and derive a real sample size that reliably ranks all three correctly, not just the top two.

### Definition of Done

- [ ] `series-uptime`, `parallel-uptime`, and `minimum-sample-size` are all defined, all actually run in Guile this session, with real output pasted in for every claim.
- [ ] Both reliability formulas have been checked against real Monte Carlo simulation, not trusted from the formula alone.
- [ ] `minimum-sample-size`'s own guarantee has been checked empirically at least twice: once for a single rate's own accuracy, and once for correctly distinguishing two different real rates.
- [ ] The guessed-sample-size failure has been caused on purpose, its real (non-crashing, silently degraded) success rate measured, and the reason — a plausible-sounding guess is not the same guarantee as a derived minimum — has been articulated, not just observed.
- [ ] `git commit` — a message explaining *why* this lesson's three tools are genuinely different engineering questions, not three phrasings of the same one: reliability asks about a system that already exists, sample size asks how much data a not-yet-run experiment needs, and rate-distinguishing asks whether a specific derived sample size actually delivers on its own promise.
