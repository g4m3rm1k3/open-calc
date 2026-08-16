# Lesson 168: When the Assumption Is the Bug — Reasoning Under Uncertainty

**What you will build.** A real, general tool for checking a probabilistic assumption instead of silently trusting it: `independence-check`, which measures whether two real events actually behave independently, or only looked that way because nobody checked. Applied first to a case where independence genuinely holds, then to a real, named failure mode — **common-cause failure** — where it dramatically doesn't. And, closing Era VI, `checked-parallel-uptime`: a version of Lesson 167's own reliability formula that refuses to answer with false confidence when its own independence assumption hasn't actually been verified. The transferable habit, closing out this entire Era: every formula this curriculum has built — `series-uptime`, `chebyshev-bound`, `n-step-distribution`, all of it — is only as true as the assumptions it was derived under, and *naming those assumptions explicitly*, rather than pretending uncertainty about them doesn't exist, is the actual engineering skill underneath all the mathematics.

**What you need to know first.** Lesson 150 (Independence) for the formal definition this lesson tests directly: independent events satisfy `P(A and B) = P(A)·P(B)`. Lesson 163 (Markov Chains) for this curriculum's first real empirical check of an assumed property (the Markov property itself), the direct ancestor of this lesson's own diagnostic. Lesson 167 (Probability as an Engineering Tool), directly — `parallel-uptime`'s own independence assumption is exactly what this lesson tests, and finds a real, concrete case where it fails. Lesson 159 (Monte Carlo Algorithms) for checking a claim with many real, independent trials.

**Terms used in this lesson**

- **`define`** — binds a name, at top level, to a procedure or a value.
- **`let`** — introduces one or more local bindings, visible only inside `let`'s own body.
- **`let*`** — like `let`, but each binding can see the ones before it in the same block. This lesson reuses it for a chain of values that each depend on the one before: a raw measurement, then the individual rates read out of it, then a prediction computed from those rates.
- **Named `let` (self-referential loop)** — a `let` that gives its own body a name, so the body can call that name again with new argument values. Scheme's loop construct, with no separate `for` or `while` keyword.
- **Accumulator-passing recursion** — carrying the "answer built so far" as an extra argument on each self-call. Every loop in this lesson uses it, unchanged from its use across every lesson since Lesson 162.
- **`if`** — a two-branch conditional: evaluates its test, then evaluates exactly one of its remaining sub-expressions.
- **`lambda`** — builds an anonymous procedure, created right where it's needed. This lesson reuses it, unchanged from Lesson 167, inside `parallel-uptime`'s own `map` call.
- **Quoted symbol** — a bare name, written with a leading `'`, treated as a literal, unevaluated value rather than a variable reference. This lesson uses one, `'assumption-violated`, as a plain, readable tag marking a result that couldn't be trusted.
- **Exact rational numbers** — Guile's numeric tower represents the result of dividing two exact integers that don't divide evenly as an exact fraction, never a rounded decimal. This lesson's measured rates and gaps stay exact fractions throughout, converted to decimals only for reading.
- **Empirical independence check** — measuring `P(A)`, `P(B)`, and `P(A and B)` directly from real joint trials, then comparing the measured `P(A and B)` against the *predicted* `P(A)·P(B)` — a real, direct test of Lesson 150's own independence definition, rather than an assumption taken on faith.
- **Common-cause failure** — a real reliability-engineering term for when a single shared factor (a shared power supply, a shared software bug, a shared network link) causes multiple components to fail *together*, breaking the independence a redundancy calculation like `parallel-uptime` silently assumes.
- **Tolerance** — how large a gap between a measured value and a predicted one is still considered "close enough" to count as confirming an assumption, rather than refuting it.

**Objects and methods used**

*This lesson's own subject, in the order its Concept Units introduce them:*

- **`independence-check`**
  - *What it is:* a procedure this lesson derives in Concept Unit 1 — runs many real joint trials of two events and measures how well the data actually supports treating them as independent.
  - *Implementation:* `(independence-check joint-trial trials)` → a list of three exact rationals: the measured `P(A)`, `P(B)`, and `P(A and B)`.
  - *Its use:* the one general diagnostic every other piece of this lesson is built from — applicable to any two events, not just this lesson's own examples.
- **`checked-parallel-uptime`**
  - *What it is:* derived in Concept Unit 3 — Lesson 167's own `parallel-uptime`, wrapped so it only answers once `independence-check` has actually confirmed the independence it depends on.
  - *Implementation:* `(checked-parallel-uptime component-uptimes joint-trial trials tolerance)` → either a real uptime probability, or a tagged `assumption-violated` result naming the real measured gap.
  - *Its use:* the closing synthesis of this entire lesson — a formula that refuses to lie by omission.

*Everything else in the file, not this lesson's subject but still explained:*

- **`random`**
  - *What it is:* Guile's built-in source of pseudo-randomness, first given full treatment in Lesson 162.
  - *Implementation:* `(random n)`, for exact integer `n`, returns an exact integer uniformly chosen from `0` up to (not including) `n`.
  - *Its use:* every simulated coin flip and every simulated component failure in this lesson bottoms out in a call to `random`.
- **`car`**
  - *What it is:* an accessor — returns the first element of a pair, and by extension a list's first element.
  - *Implementation:* `(car p)` returns the first component of pair `p`.
  - *Its use:* reads the first of a two-element result — event `A`'s own outcome — off a real joint trial.
- **`cadr`**
  - *What it is:* an accessor — a shorthand for the extremely common combination "the second element of a list," exactly equivalent to `(car (cdr lst))`.
  - *Implementation:* `(cadr lst)` returns the second element of `lst`.
  - *Its use:* reads event `B`'s own outcome off a real joint trial, and reads the second entry back out of `independence-check`'s own three-element result.
- **`caddr`**
  - *What it is:* an accessor — a shorthand for "the third element of a list," exactly equivalent to `(car (cdr (cdr lst)))`.
  - *Implementation:* `(caddr lst)` returns the third element of `lst`.
  - *Its use:* reads the measured `P(A and B)` back out of `independence-check`'s own three-element result.
- **`and`**
  - *What it is:* a logical connective, evaluated left to right, returning `#f` the moment any sub-expression is `#f`, and a true value only if every one is.
  - *Implementation:* `(and expr1 expr2 ...)` short-circuits on the first false expression.
  - *Its use:* checks whether *both* halves of a joint trial came out true, at once, the exact event `independence-check`'s own third measurement is counting.
- **`or`**
  - *What it is:* a logical connective, evaluated left to right, returning the first sub-expression that isn't `#f`.
  - *Implementation:* `(or expr1 expr2 ...)` short-circuits on the first true expression.
  - *Its use:* this lesson's shared-cause failure model uses it directly: a component is down if its own individual cause fires, *or* the shared cause does.
- **`abs`**
  - *What it is:* a procedure — returns a number's absolute value.
  - *Implementation:* `(abs x)` returns `x` if `x ≥ 0`, and `-x` otherwise.
  - *Its use:* measures the real size of the gap between a measured joint probability and its predicted, independence-assuming value, regardless of which one came out larger.
- **`>`, `=`**
  - *What it is:* numeric comparison procedures, returning `#t` or `#f`.
  - *Implementation:* `(> a b)` and `(= a b)` compare two numbers.
  - *Its use:* `>` decides whether a measured gap exceeds the accepted tolerance; `=` recognizes every loop's base case, and checks a simulated die roll or coin flip against a target value.
- **`apply`**
  - *What it is:* a procedure that calls another procedure, but with its arguments taken from a list instead of written out individually.
  - *Implementation:* `(apply proc list)` calls `proc` with `list`'s own elements as its separate arguments.
  - *Its use:* `parallel-uptime`, reused unchanged from Lesson 167, still multiplies a whole list of downtimes together this way.
- **`map`**
  - *What it is:* a transformation procedure — applies a given procedure to every element of a list, returning a new list of the results.
  - *Implementation:* `(map proc list)` returns a new list, `(proc x)` for each `x` in `list`.
  - *Its use:* `parallel-uptime`, reused unchanged, still turns a list of uptimes into a matching list of downtimes this way.
- **`list`**
  - *What it is:* a constructor — builds a list directly from its arguments.
  - *Implementation:* `(list v0 v1 ... vn)` returns a fresh list holding exactly those values, in that order.
  - *Its use:* bundles a joint trial's two outcomes together, and bundles `independence-check`'s own three measured rates together.
- **`exact->inexact`**
  - *What it is:* a converter — turns an exact number into an ordinary inexact decimal, for reading.
  - *Implementation:* `(exact->inexact n)` returns the closest floating-point representation of `n`.
  - *Its use:* converts this lesson's exact measured rates and gaps into readable decimals.
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
  - *Its use:* `+` accumulates every real count in this lesson; `-` computes a downtime from an uptime, and an uptime back from a measured downtime; `*` computes both a predicted joint probability and a scaled random-draw threshold; `/` computes every measured rate.

---

## Concept Unit: Testing Independence, For Real

### The Problem

Lesson 150 defined independence precisely: two events `A` and `B` are independent exactly when `P(A and B) = P(A)·P(B)`. Every probability formula built since — `sample-with-replacement`'s own draws, `series-uptime` and `parallel-uptime`'s own component failures, this whole curriculum's Monte Carlo trials — has *assumed* independence somewhere, usually without ever checking it against real data. What would it actually look like to check, instead of assume — to measure `P(A)`, `P(B)`, and `P(A and B)` for real, and see whether the equation genuinely holds?

### Project Change

- **Reference Source** — No reference counterpart. This lesson derives its diagnostic from Lesson 150's own definition, checked directly against real data.
- **Files affected** — this lesson's own file. As established in Lesson 162, this curriculum has no separate, persisted project source tree.
- **Change type** — add: one new, freestanding top-level procedure.
- **Location** — nothing precedes it in this lesson yet; this is the first definition this lesson makes.
- **Dependencies** — none beyond Guile's built-in procedures.

### The New Code

```scheme
(define (independence-check joint-trial trials)
  (let loop ((t 0) (a-count 0) (b-count 0) (both-count 0))
    (if (= t trials)
        (list (/ a-count trials) (/ b-count trials) (/ both-count trials))
        (let* ((result (joint-trial)) (a (car result)) (b (cadr result)))
          (loop (+ t 1)
                (+ a-count (if a 1 0))
                (+ b-count (if b 1 0))
                (+ both-count (if (and a b) 1 0)))))))
```

### The Updated Project

Skipped — `independence-check` is a brand-new, freestanding top-level procedure with no existing enclosing structure to place it inside yet; Project Change already covers this case.

### Isolated Lab: A Case Where Independence Provably Fails, Checked Exactly

The core new idea here is the comparison itself — measured `P(A and B)` against predicted `P(A)·P(B)` — worth seeing first on a case small enough to compute *exactly*, with no simulation at all. A single fair six-sided die: event `A` is "the roll is even" (`{2, 4, 6}`), event `B` is "the roll is greater than `3`" (`{4, 5, 6}`).

```scheme
(define P-even 1/2)
(define P->3 1/2)
(define P-even-and->3 1/3)   ; the roll is in {4, 6} -- 2 of 6 outcomes
```

Run for real:

```scheme
(* P-even P->3)
;=> 1/4

P-even-and->3
;=> 1/3

(= (* P-even P->3) P-even-and->3)
;=> #f
```

`1/4`, predicted if independent, against `1/3`, the real exact probability — genuinely different, confirmed with `=` returning `#f`, not just "close but not identical." "Even" and "greater than `3`" are *not* independent for a single die roll: they overlap more than independence would predict, because `4` and `6` both satisfy *both* conditions at once, while `2` satisfies only "even" and `5` satisfies only "greater than `3`" — the two events share more of their own probability than two truly unrelated events would. This is exactly the comparison `independence-check` performs — `P(A)·P(B)` against a real, measured `P(A and B)` — generalized from an exactly-enumerable six-outcome case to any real process, checked by real trials instead of exhaustive enumeration.

### Discarding the Lab

`P-even`, `P->3`, and `P-even-and->3` are discarded now. They never appear in the project again — `independence-check`, defined above, performs this same comparison for real, measured processes where exact enumeration isn't available.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (independence-check joint-trial trials) ...)`** — `define` binds `independence-check` to a two-parameter procedure: `joint-trial`, a zero-argument procedure that produces one real trial's worth of both events' outcomes at once, and `trials`, how many such trials to run.
- **`(let loop ((t 0) (a-count 0) (b-count 0) (both-count 0)) ...)`** — a named `let`: `t` counts completed trials, `a-count` and `b-count` tally how often each event happened on its own, `both-count` tallies how often they happened together.
- **`(if (= t trials) (list (/ a-count trials) (/ b-count trials) (/ both-count trials)) ...)`** — the base case bundles three real measured rates into one list: `a-count` divided by `trials` is the measured `P(A)`, `b-count`/`trials` is the measured `P(B)`, and `both-count`/`trials` is the measured `P(A and B)`.
- **`(let* ((result (joint-trial)) (a (car result)) (b (cadr result))) ...)`** — `let*`, needed because `a` and `b`'s own bindings both depend on `result`, computed one line earlier in the same block: `(joint-trial)` runs one real trial, producing a two-element list; `car` reads event `A`'s own real outcome off the front, `cadr` reads event `B`'s.
- **`(loop (+ t 1) (+ a-count (if a 1 0)) (+ b-count (if b 1 0)) (+ both-count (if (and a b) 1 0)))`** — the recursive step: `t` advances by one; `a-count` and `b-count` each advance by `1` exactly when their own event was true this trial; `(and a b)` is `#t` only when *both* were true on the same trial, advancing `both-count` — this lesson's first use of `and`, checking the one joint event the whole diagnostic is built around.

### CS Lens

This is an **empirical independence check**: measuring whether `P(A and B) = P(A)·P(B)` actually holds in real, collected data, rather than trusting Lesson 150's own definition as an unverified assumption.

Also recognized in: A/B testing platforms that check whether a user's assignment to a test group is actually independent of other factors (like signup date) before trusting the test's own results; epidemiology, checking whether two risk factors act independently on a health outcome or whether one confounds the other; database query optimizers, which sometimes assume column values are independent when estimating how selective a combined filter will be, and can produce badly wrong query plans when that assumption doesn't hold; and every earlier "verify empirically, don't just trust the formula" moment this curriculum has built, from Lesson 159's first Monte Carlo check through Lesson 163's own real memorylessness test.

### SE Lens

The design principle here is **making an implicit assumption into an explicit, checkable one**. Every probability formula this curriculum has built took independence as a given; `independence-check` is the first tool that treats independence as a *claim requiring evidence*, the same way any other engineering assumption should be.

An alternative that was *not* chosen: never check independence at all, and simply trust that any two "unrelated-seeming" real-world events are independent because there's no obvious reason they'd be connected. That alternative costs nothing upfront — no diagnostic to write, no extra trials to run — and it's often fine, since many real events genuinely are independent, or close enough not to matter. The real cost of skipping the check every time, unconditionally: the cases where the assumption silently fails are exactly the cases most likely to matter, because a *hidden* shared cause is, by its own nature, not the "obvious reason" a human reviewer would think to look for — precisely the situation Concept Unit 2 builds a real, concrete example of next.

### Run It

Two genuinely independent fair coins, `100,000` real joint flips:

```scheme
(define (two-fair-coins) (list (= (random 2) 1) (= (random 2) 1)))

(independence-check two-fair-coins 100000)
;=> (50033/100000 50199/100000 12561/50000)

(exact->inexact (* 50033/100000 50199/100000))
;=> 0.2511606567
```

Measured `P(A) ≈ 0.500`, `P(B) ≈ 0.502`, `P(A and B) ≈ 0.251` (`12561/50000`, Guile's own reduced form of `25122/100000`) — and predicted, `P(A)·P(B) ≈ 0.2512` — a match to within a few thousandths, real evidence that two genuinely unrelated fair coins really do behave the way Lesson 150's own definition says independent events should.

### Connection

A real diagnostic now exists, confirmed on a case where independence genuinely holds. The next problem is applying it to a case that looks, at a glance, exactly as reasonable to assume independent — until the real data says otherwise.

---

## Concept Unit: Common-Cause Failures

### The Problem

Two backup generators, each with its own real, measured `99%` uptime, wired in parallel exactly as Lesson 167's `parallel-uptime` expects. Both generators, though, draw their fuel from one shared supply line — a detail easy to overlook, since each generator's *own* individual failure modes really are independent of the other's. If that shared supply line fails, though, *both* generators go down together, no matter how reliable either one is on its own. Does `independence-check` actually catch this — and if it does, how badly does it change the real answer?

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — this lesson's own file.
- **Change type** — add: two new top-level procedures modeling a real common-cause failure scenario.
- **Location** — after `independence-check`; used directly as that procedure's own `joint-trial` argument.
- **Dependencies** — `independence-check`, defined in Concept Unit 1.

### The New Code

```scheme
(define individual-fail-prob 1/100)
(define shared-fail-prob 1/100)

(define (component-down? shared-shock?)
  (or shared-shock? (< (random 10000) (* 10000 individual-fail-prob))))

(define (shared-cause-trial)
  (let ((shared-shock? (< (random 10000) (* 10000 shared-fail-prob))))
    (list (component-down? shared-shock?) (component-down? shared-shock?))))
```

### The Updated Project

Skipped — `individual-fail-prob`, `shared-fail-prob`, `component-down?`, and `shared-cause-trial` are brand-new top-level definitions with no existing enclosing structure to place them inside yet.

### Isolated Lab: None — Justified Skip

`component-down?` and `shared-cause-trial` are built entirely from `or`, `<`, `*`, `let`, and `list` — every one of them already fully treated, either earlier in this lesson or in earlier lessons. What's new here isn't a Scheme construct; it's a real reliability-engineering scenario, **common-cause failure**, modeled directly in code rather than taught through an isolated syntax demonstration. Per the Concept Isolation Rule, no lab is warranted for a Concept Unit built around a modeling decision rather than a new construct.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define individual-fail-prob 1/100)`** and **`(define shared-fail-prob 1/100)`** — `define` binds two names to exact rational probabilities: each component's own chance of failing for a reason specific to itself, and the shared supply line's own chance of failing, independent of either component's own condition.
- **`(define (component-down? shared-shock?) (or shared-shock? (< (random 10000) (* 10000 individual-fail-prob))))`** — `define` binds `component-down?` to a one-parameter procedure. `(or shared-shock? ...)` is this lesson's first use of `or`: if `shared-shock?` is already true — the shared supply line already failed this trial — the whole expression short-circuits to true immediately, without even evaluating the individual check; otherwise, `(< (random 10000) (* 10000 individual-fail-prob))` draws a fresh random integer and checks it against the component's own individual failure threshold, scaled the same way Lesson 167's own simulations scaled probabilities to whole-number ranges.
- **`(define (shared-cause-trial) ...)`** — `define` binds `shared-cause-trial` to a zero-parameter procedure — exactly the shape `independence-check`'s own `joint-trial` parameter expects.
- **`(let ((shared-shock? (< (random 10000) (* 10000 shared-fail-prob)))) ...)`** — a plain `let`, one binding: `shared-shock?` is decided *once*, by a single fresh random draw, before either component is checked.
- **`(list (component-down? shared-shock?) (component-down? shared-shock?))`** — calls `component-down?` twice, once for each component — and this is the load-bearing detail: both calls receive the *exact same* `shared-shock?` value, decided once above, rather than each drawing its own independent shared-shock check. This is precisely what makes the two components' failures correlated rather than independent: whenever `shared-shock?` is true, *both* calls return true together, no matter what either component's own individual randomness would have said on its own.

### CS Lens

This is **common-cause failure**: a single shared random event injected into what would otherwise be two independent processes, breaking the independence a naive reliability calculation assumes.

Also recognized in: real power grid failures, where multiple "independent" data centers on the same regional grid all lose power together; software supply-chain vulnerabilities, where many "independently developed" applications share one compromised dependency and fail (or get breached) together; natural disaster risk models, where insurers explicitly account for correlated claims — many policyholders in one region filing at once after the same storm — rather than treating each policy as an independent risk; and cascading failures in distributed systems, where one overloaded shared service (a database, a message queue) takes down many services that appeared, individually, to have no direct connection to each other.

### SE Lens

The design principle here is **shared infrastructure is a correlation risk, not just a single point of failure**. It's easy to reason about a shared power line as "one more component that could fail" — the real, subtler cost `shared-cause-trial` makes concrete is that its failure doesn't just remove *one* source of reliability, it silently *removes the independence* the whole redundancy calculation was resting on.

An alternative that was *not* chosen: design the system so every component, including its power, network, and every other supporting dependency, is genuinely, physically separate — true independence, engineered rather than assumed. That alternative is strictly safer, and it's exactly what "independent" is supposed to mean in a reliability calculation — but it costs real money and real complexity: separate power feeds, separate physical locations, separate everything, for every redundant pair. The real cost this lesson's scenario represents instead — sharing a power line to save that cost — is a deliberate, common, often reasonable engineering trade-off; the failure isn't sharing the power line, it's *computing `parallel-uptime` as though the sharing didn't exist*.

### Run It

```scheme
(independence-check shared-cause-trial 200000)
;=> (3947/200000 4007/200000 51/5000)

(exact->inexact (* 3947/200000 4007/200000))
;=> 3.95390725e-4
```

Measured `P(A down) ≈ 0.0197`, `P(B down) ≈ 0.0200`, and measured `P(both down) ≈ 0.0102` (`51/5000`, Guile's own reduced form of `2040/200000`) — but *predicted*, assuming independence, `P(A down)·P(B down) ≈ 0.000395`. The real, measured chance of *both* going down together is roughly **`26` times larger** than independence would predict — a dramatic, unmistakable gap, nothing like the few-thousandths difference Concept Unit 1's genuinely independent coins showed.

```scheme
;; real uptime (1 - measured P(both down)): 0.9898
;; naive independence-based uptime (1 - predicted P(both down)): 0.9996046...
```

The naive, independence-assuming version of `parallel-uptime` would have reported `99.96%` uptime; the real, measured uptime is `98.98%` — both numbers *sound* similarly excellent, but the real system's actual downtime is roughly `26` times worse than the naive formula ever suggested, precisely because the formula's own independence assumption silently failed.

### Connection

`independence-check` doesn't just describe the problem — it can *catch* it, automatically, before a falsely confident number ever gets reported. The next problem is building that protection directly into the reliability formula itself.

---

## Concept Unit: Making the Assumption Explicit

### The Problem

`parallel-uptime`, exactly as Lesson 167 built it, will compute a confident-looking answer for *any* two uptime probabilities handed to it — whether or not the components behind those numbers are actually independent, as Concept Unit 2 just showed can silently fail. What's needed is a version of that same formula that doesn't just compute an answer, but first checks whether it's actually entitled to.

### Project Change

- **Reference Source** — Lesson 167's own `parallel-uptime`, reused here unmodified.
- **Files affected** — this lesson's own file.
- **Change type** — add: `parallel-uptime` itself (restated in full, per this curriculum's Repetition Rule), and one new wrapping procedure, `checked-parallel-uptime`.
- **Location** — after Concept Unit 2's own common-cause model.
- **Dependencies** — `independence-check`, defined in Concept Unit 1.

### The New Code

```scheme
(define (parallel-uptime component-uptimes)
  (- 1 (apply * (map (lambda (p) (- 1 p)) component-uptimes))))

(define (checked-parallel-uptime component-uptimes joint-trial trials tolerance)
  (let* ((check (independence-check joint-trial trials))
         (pa (car check))
         (pb (cadr check))
         (pab (caddr check))
         (predicted (* pa pb))
         (gap (abs (- pab predicted))))
    (if (> gap tolerance)
        (list 'assumption-violated gap)
        (parallel-uptime component-uptimes))))
```

### The Updated Project

Skipped — `checked-parallel-uptime` is a brand-new, freestanding top-level procedure with no existing enclosing structure to place it inside.

### Isolated Lab: None — Justified Skip

Every construct `checked-parallel-uptime` is built from — `let*`, `independence-check`, `car`/`cadr`/`caddr`, `abs`, `if`, a quoted symbol — already has full, real treatment, either earlier in this lesson or in prior ones. Its own real contribution is a design decision — refuse to answer rather than answer wrongly — not a new syntactic idea.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (parallel-uptime component-uptimes) (- 1 (apply * (map (lambda (p) (- 1 p)) component-uptimes))))`** — Lesson 167's own procedure, restated here in full: `map` turns every component uptime into its own downtime, `apply *` multiplies every downtime together (the probability every component fails at once, assuming independence), and `- 1` complements that into the probability at least one survives.
- **`(define (checked-parallel-uptime component-uptimes joint-trial trials tolerance) ...)`** — `define` binds `checked-parallel-uptime` to a four-parameter procedure: the same uptimes `parallel-uptime` needs, plus everything `independence-check` needs to actually verify them, plus a `tolerance` deciding how large a gap still counts as "close enough."
- **`(let* ((check (independence-check joint-trial trials)) (pa (car check)) (pb (cadr check)) (pab (caddr check)) (predicted (* pa pb)) (gap (abs (- pab predicted)))) ...)`** — `let*`, needed because each binding depends on the one before it: `check` runs the real diagnostic once; `pa`, `pb`, and `pab` unpack its three measured rates; `predicted` computes what `P(A and B)` *should* be if independence genuinely held; `gap` measures, with `abs`, how far the real measurement strayed from that prediction, in either direction.
- **`(if (> gap tolerance) (list 'assumption-violated gap) (parallel-uptime component-uptimes))`** — the actual decision this whole Concept Unit exists to make: if the measured gap exceeds what `tolerance` allows, the procedure refuses to compute a reliability number at all, returning `(list 'assumption-violated gap)` instead — a plain, readable tag naming exactly what went wrong, paired with the real evidence. Only when the gap stays within tolerance does `checked-parallel-uptime` actually call `parallel-uptime` and trust its answer.

### CS Lens

This is a **guarded computation**: refusing to produce a result at all when a load-bearing precondition hasn't been verified, rather than silently producing a wrong one.

Also recognized in: type systems that refuse to compile code violating a stated invariant, rather than letting it run and fail unpredictably later; database transactions that abort rather than commit when a consistency check fails mid-transaction; defensive numerical code that checks a matrix is actually invertible before attempting to invert it, rather than returning garbage; and, closing the loop on this entire curriculum's own recurring pattern, every "what breaks without this" section this curriculum has built since Lesson 162 — each one a real, deliberate demonstration that an unstated assumption, once violated, doesn't announce itself, it just quietly produces a wrong answer, unless something is built specifically to catch it.

### SE Lens

The design principle here is **failing loudly and specifically, instead of succeeding quietly and wrongly**. `checked-parallel-uptime` could have been built to just log a warning and proceed anyway — the real design choice here is refusing to return a reliability number *at all* when the assumption behind it hasn't held up, forcing whoever called it to notice.

An alternative that was *not* chosen: always compute and return `parallel-uptime`'s own answer, alongside a separate warning if the independence check failed, leaving it up to the caller to notice and act on the warning. That alternative preserves more information — a caller who genuinely wants the naive number anyway can still get it — but it repeats exactly the failure mode this whole lesson is about: a warning that's easy to silently ignore is barely different from no warning at all, and Concept Unit 2's own real numbers (`99.96%` naive against `98.98%` real) show just how confidently wrong the ignored number would look. The real cost `checked-parallel-uptime` accepts instead: a caller who *does* have a legitimate reason to proceed despite the violated assumption has to explicitly handle the `assumption-violated` tag and make that choice themselves, rather than getting a number for free — friction, deliberately, in exchange for never handing out a falsely confident answer by default.

### Run It

```scheme
(checked-parallel-uptime (list 1/2 1/2) two-fair-coins 100000 1/100)
;=> 3/4
```

Genuinely independent coins, checked against a `1/100` tolerance: the measured gap from Concept Unit 1 was only a few thousandths, comfortably inside tolerance, so `checked-parallel-uptime` proceeds and returns the same real answer `parallel-uptime` alone would have — `3/4`, exactly matching Lesson 167's own Isolated Lab.

```scheme
(checked-parallel-uptime (list 99/100 99/100) shared-cause-trial 200000 1/1000)
;=> (assumption-violated 9413567/1000000000)
```

The shared-cause components, checked against a tight `1/1000` tolerance: Concept Unit 2's own real gap — roughly `0.0094`, about `26` times the naive prediction — comfortably exceeds it, and `checked-parallel-uptime` refuses to answer at all, returning `assumption-violated` paired with the exact real gap that triggered it, rather than silently handing back a `99.96%`-uptime number that real data already disproved.

### Connection

Three real, verified checks — an assumption confirmed, an assumption caught failing, and a formula that refuses to answer once it does — close out this Era's own arc. What's left is tracing one real assumption through everything this lesson built, and being honest about the one thing a passed check still can't promise.

---

## Closing

### Connect the Pieces

One real assumption, tested through every piece built in this lesson, start to finish:

```scheme
(independence-check two-fair-coins 100000)
;=> (49833/100000 49859/100000 24923/100000)
```

A real, empirical test of independence, on a case where it genuinely holds — Concept Unit 1's own diagnostic, run again here, fresh, on the simplest case this lesson has, landing close to `P(A)·P(B) ≈ 0.2484` exactly as before.

```scheme
(independence-check shared-cause-trial 200000)
;=> (4107/200000 4083/200000 1049/100000)
```

The same exact diagnostic, unchanged, run again on a real common-cause failure model — a fresh measurement, genuinely different in its exact digits from Concept Unit 2's own run (real, independent randomness varies), but telling the same real story: measured `P(A and B) ≈ 0.0105` against a predicted, independence-assuming `P(A)·P(B) ≈ 0.00042` — still roughly `25` times larger than independence would predict, real evidence the assumption genuinely fails here every time it's checked, not just once.

```scheme
(checked-parallel-uptime (list 99/100 99/100) shared-cause-trial 200000 1/1000)
;=> (assumption-violated 24812003/2500000000)
```

And the closing synthesis: a real reliability formula that used that same diagnostic to catch its own broken assumption, and refused to report a falsely confident answer — the concrete, practical form of this whole Era's own closing lesson: not "avoid uncertainty," but "name the assumption, check it, and say so honestly when it doesn't hold."

### What Breaks Without This

Even `checked-parallel-uptime`'s own protection has a real limit worth seeing directly: its tolerance has to be *chosen*, and a tolerance set too loose lets a real violation slip through uncaught. Reusing Concept Unit 2's own shared-cause scenario, but with a deliberately loose tolerance — `1/10` instead of `1/1000`:

```scheme
(checked-parallel-uptime (list 99/100 99/100) shared-cause-trial 200000 1/10)
```

Run for real:

```
;; real output:
;; 9999/10000
```

No `assumption-violated` tag — `checked-parallel-uptime` happily reports `9999/10000`, exactly `parallel-uptime`'s own naive, independence-assuming answer for two `99/100`-uptime components (`1 - (1/100)·(1/100)`), because the real measured gap (about `0.0094`) never exceeds this loosened `1/10` tolerance, even though Concept Unit 2 already proved, directly, that the independence assumption genuinely fails here. This isn't a bug in `checked-parallel-uptime`'s own logic — every step ran exactly as designed — it's a real demonstration that a guard is only as good as the threshold it's given: `tolerance` itself is one more assumption, chosen by whoever calls `checked-parallel-uptime`, and *that* choice doesn't check itself. Naming one assumption explicitly, and building a real guard for it, doesn't retroactively catch every other unstated one sitting underneath it — a lesson closing out an entire Era on exactly this point:  uncertainty doesn't fully disappear the moment one piece of it gets named and checked; it just stops being the *specific* piece that's silently ignored.

### Exercises

- Rerun `independence-check` on the shared-cause model with `shared-fail-prob` set to `0` instead of `1/100` — no shared cause at all, only independent individual failures — and confirm, for real, that the measured gap shrinks back down to something comparable to Concept Unit 1's own genuinely-independent coins.
- This lesson's `shared-cause-trial` uses the *same* `shared-shock?` value for both components, decided once. Modify it so each component instead draws its *own*, separate shared-shock check, and confirm — for real, via `independence-check` — that this modified version behaves as though independent again, even though each component still has the same individual failure rate as before.
- `checked-parallel-uptime` refuses to answer, but never suggests *what to do instead*. Design (in prose; code if you want to build it for real) a `common-cause-uptime` that takes the measured shared-cause probability directly into account, computing a real, honest uptime number for a system where the components are *not* independent, rather than only being able to say "not independent, no number given."
- This lesson tested independence between exactly two events. Sketch, in prose, what would have to change to test independence among *three* components at once — is checking every pair independently sufficient to guarantee no hidden three-way common cause, or could three events be pairwise independent while still sharing some other correlation only visible across all three together?

### Definition of Done

- [ ] `independence-check`, `parallel-uptime`, and `checked-parallel-uptime` are all defined, all actually run in Guile this session, with real output pasted in for every claim.
- [ ] `independence-check` has been run on both a genuinely independent real case and a genuinely correlated real case, and the real gap in each has been compared, not just asserted to differ.
- [ ] `checked-parallel-uptime`'s own refusal to answer has been triggered for real, with the real `assumption-violated` tag and gap observed directly, not just described.
- [ ] The loose-tolerance failure has been caused on purpose, and the real reason a passed check still isn't a full guarantee — the tolerance itself is an unchecked assumption — has been articulated, not just observed.
- [ ] `git commit` — a message explaining *why* this lesson closes Era VI the way it does: every probability tool this curriculum built is only as trustworthy as the assumptions under it, and the actual engineering skill this whole Era was building toward is naming those assumptions and checking them, not eliminating uncertainty, which was never actually possible.
