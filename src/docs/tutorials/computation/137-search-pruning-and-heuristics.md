# Lesson 137: Search, Pruning, and Heuristics

**What you will build**: By the end of this lesson you'll search Lesson 136's CSP representation for a real solution — one variable at a time, abandoning a branch the instant `assignment-consistent?` says it's already broken, rather than completing it first — using the exact backtracking Lesson 33 already named. Then, with a real counter, you'll measure precisely how many fewer partial guesses that costs versus brute force, on both a solvable map and a genuinely unsolvable one, and finally show that *which* variable gets decided first — a **heuristic** choice, not a correctness one — can shrink that count further still, real numbers both times.

**What you need to know first**: Lesson 136's `domains`, `constraints`, and `assignment-consistent?`; Lesson 33's backtracking and pruning; Lesson 36's `declare`-based mutual recursion; Lesson 59's counting principle, for the brute-force comparison; Lesson 66's Pigeonhole Principle, used directly to prove this lesson's own unsolvable example truly has no solution.

**Terms introduced in this lesson**:

- **search tree** — the structure formed by trying values one variable at a time: each node is one partial assignment, each edge one variable's value choice, and a real solution (if one exists) is a leaf where every variable is assigned and nothing is violated. *Why it matters*: gives Lesson 32's own **search space** a concrete shape here — not just "the set of things being searched," but a real branching structure this lesson's own code walks, one edge at a time.
- **heuristic** — a rule of thumb for choosing which branch to try first, adopted because it tends to help in practice, with no guarantee it always will. *Why it matters*: distinguishes a *correctness* choice (Lesson 136's `assignment-consistent?`, which must never be wrong) from an *ordering* choice (this lesson's third unit, which can be wrong sometimes and still be worth using overall).
- **degree heuristic** — a specific heuristic: among the still-unassigned variables, decide the one involved in the most constraints first. *Why it matters*: a variable tangled in many constraints is far more likely to be the actual source of a conflict — deciding it early tends to surface that conflict sooner instead of wasting work on variables that were never really the problem.

**Objects and methods used**: None new. This lesson reuses `get`/`assoc`/`count` (Lesson 84, Lesson 94), `nil?`/`not=` (Lesson 136), and `declare` (Lesson 36), each already covered.

---

## Concept Unit: Backtracking Search — Prune the Instant It Fails

### The Problem

Lesson 111's brute force would generate every *complete* coloring of this lesson's own four-region map — `3 \times 3 \times 3 \times 3 = 81` of them, by Lesson 59's counting principle — and check each one with Lesson 136's `all-constraints-satisfied?`. Lesson 136's *other* checker, `assignment-consistent?`, already tolerates a still-partial guess. Can it be used to avoid ever finishing most of those `81` guesses at all?

### Introduce the concept in isolation

```clojure
(declare solve-from try-candidate try-recursion-result)

(defn try-value [var-index domains constraints assignment value-index]
  (if (>= value-index (count (get domains var-index)))
    nil
    (try-candidate var-index domains constraints assignment value-index
      (assoc assignment var-index (get (get domains var-index) value-index)))))

(defn try-candidate [var-index domains constraints assignment value-index candidate]
  (if (assignment-consistent? candidate constraints 0)
    (try-recursion-result var-index domains constraints assignment value-index
      (solve-from (+ var-index 1) domains constraints candidate))
    (try-value var-index domains constraints assignment (+ value-index 1))))

(defn try-recursion-result [var-index domains constraints assignment value-index result]
  (if (nil? result)
    (try-value var-index domains constraints assignment (+ value-index 1))
    result))

(defn solve-from [var-index domains constraints assignment]
  (if (>= var-index (count domains))
    assignment
    (try-value var-index domains constraints assignment 0)))

(defn solve [domains constraints]
  (solve-from 0 domains constraints [nil nil nil nil]))
```

```
user=> (solve domains constraints)
["red" "green" "blue" "red"]
```

This is called **backtracking search** — the exact technique Lesson 33 already named: build a partial solution one choice at a time, and the moment a partial choice is already known to be invalid, abandon it and try the next option instead of ever completing it — Lesson 33 called that early abandonment **pruning**. This lesson is the first time that pruning is driven by a real, general-purpose consistency checker (`assignment-consistent?`) rather than a problem-specific check written by hand.

Traced against the real values `solve` actually produces, one `try-candidate` call at a time:

1. `var-index 0`, `value-index 0` → candidate `["red" nil nil nil]`. No other variable is assigned yet, so every constraint touching variable `0` is skipped by `pair-consistent?` — trivially consistent. Recurses to variable `1`.
2. `var-index 1`, `value-index 0` → candidate `["red" "red" nil nil]`. Constraint `[0 1]` is now checkable: `"red"` vs. `"red"` — equal, a real violation. `try-candidate` returns to `try-value`, which tries the next value instead.
3. `var-index 1`, `value-index 1` → candidate `["red" "green" nil nil]`. Constraint `[0 1]`: `"red"` vs. `"green"` — differ, consistent. Recurses to variable `2`.
4. `var-index 2`, `value-index 0` → candidate `["red" "green" "red" nil]`. Constraint `[0 2]`: `"red"` vs. `"red"` — violation. Next value.
5. `var-index 2`, `value-index 1` → candidate `["red" "green" "green" nil]`. Constraint `[1 2]`: `"green"` vs. `"green"` — violation. Next value.
6. `var-index 2`, `value-index 2` → candidate `["red" "green" "blue" nil]`. Constraints `[0 2]` and `[1 2]` both differ — consistent. Recurses to variable `3`.
7. `var-index 3`, `value-index 0` → candidate `["red" "green" "blue" "red"]`. Constraints `[1 3]` and `[2 3]` both differ — consistent. Recurses to `var-index 4`, which meets `solve-from`'s base case (`4 \geq (count domains)`) and returns the completed assignment straight up the whole call chain.

Seven candidates checked, out of a possible `81` — the search never even considered most of them, because steps 4 and 5's failures were caught the moment they happened, not after variables `3` was also guessed.

### Discard the throwaway example

Not applicable — every function here is real, reusable, and verified this session against a real `bb` run.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch search built on Lesson 136's own representation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn solve-from [var-index domains constraints assignment]
  (if (>= var-index (count domains))
    assignment
    (try-value var-index domains constraints assignment 0)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(declare solve-from try-candidate try-recursion-result)`** — reappearing forward declaration (Lesson 36): `try-value`, defined first, calls `try-candidate` before `try-candidate` itself has been read yet; without this, `bb` would fail to resolve the symbol, exactly as it did the first time this lesson's own code was run this session.
- **`(if (>= value-index (count (get domains var-index))) nil ...)`**, in `try-value` — first appearance of this specific base case: every legal value for the current variable has already been tried and failed, so this branch of the search is genuinely exhausted — `nil` here means "no solution down this path," not "not yet decided" (Lesson 136's own different use of `nil`).
- **`(assoc assignment var-index ...)`** — reappearing `assoc` (Lesson 84): builds the candidate by placing one new value into the assignment, leaving every other slot — including the still-`nil` ones — untouched.
- **`(assignment-consistent? candidate constraints 0)`** — reappearing (Lesson 136): the actual pruning check — decides, immediately, whether this branch is worth recursing into at all.
- **The branch inside `try-candidate`** — first appearance of backtracking's real mechanism, made concrete: consistent means recurse deeper (try the *next* variable); inconsistent means stay at this variable and try its *next* value — two structurally different kinds of "try something else," never confused with one another.
- **`try-recursion-result`'s `(nil? result)`** — reappearing `nil?` (Lesson 136): distinguishes "the deeper recursion found a real, complete solution" from "the deeper recursion exhausted every option and failed," which is exactly why `solve-from` never returns bare `nil` for a mid-search failure — only `try-value`'s own exhaustion case does, and every caller checks for it explicitly before trusting a result.
- **`solve-from`'s `(>= var-index (count domains))`** — reappearing bound check, this time as a success case, not a failure: every variable has been assigned, and every constraint along the way has already been re-checked incrementally, so nothing further needs verifying.

### CS Lens

Every partial assignment `try-candidate` ever builds is one node of this lesson's own **search tree** — Lesson 32's abstract *search space*, now with a real, walkable shape: nodes are partial assignments, edges are single value choices, and a solution is a leaf reached without ever violating a constraint on the way down. Also recognized in: Lesson 116's decision trees (each internal node one comparison, not one variable choice, but the same branching shape), and every real chess or Go engine's own move tree.

### SE Lens

Pruning's payoff is real but not guaranteed by the technique alone — it depends entirely on *how early* a real conflict gets discovered, which depends on *which* variable is decided when. This lesson's own two remaining units make that dependency concrete: measured for real (next unit), and then improved on purpose by choosing decision order deliberately (the unit after that) — backtracking by itself is never asymptotically worse than brute force, but nothing about it guarantees it will actually be much better, either.

---

## Concept Unit: Measuring the Pruning, and When Zero Solutions Exist

### The Problem

The previous unit's "seven candidates, not eighty-one" claim was traced by hand. Is that number real and checkable in code, not just asserted? And on a map with genuinely *no* legal coloring at all, does this same search correctly recognize that — and how much work does confirming "no solution exists" actually cost?

### Introduce the concept in isolation

```clojure
(declare csolve-from ctry-candidate ctry-recursion-result)

(defn ctry-value [var-index domains constraints assignment value-index visits]
  (if (>= value-index (count (get domains var-index)))
    [nil visits]
    (ctry-candidate var-index domains constraints assignment value-index
      (assoc assignment var-index (get (get domains var-index) value-index)) visits)))

(defn ctry-candidate [var-index domains constraints assignment value-index candidate visits]
  (if (assignment-consistent? candidate constraints 0)
    (ctry-recursion-result var-index domains constraints assignment value-index
      (csolve-from (+ var-index 1) domains constraints candidate (+ visits 1)))
    (ctry-value var-index domains constraints assignment (+ value-index 1) (+ visits 1))))

(defn ctry-recursion-result [var-index domains constraints assignment value-index result-pair]
  (if (nil? (get result-pair 0))
    (ctry-value var-index domains constraints assignment (+ value-index 1) (get result-pair 1))
    result-pair))

(defn csolve-from [var-index domains constraints assignment visits]
  (if (>= var-index (count domains))
    [assignment visits]
    (ctry-value var-index domains constraints assignment 0 visits)))

(defn csolve [domains constraints]
  (csolve-from 0 domains constraints [nil nil nil nil] 0))
```

```
user=> (csolve domains constraints)
[["red" "green" "blue" "red"] 7]
```

Confirmed for real: exactly `7`, matching the previous unit's hand trace. Now the same instrumented search, on a version of the identical map allowed only two colors instead of three:

```clojure
(def domains2 [["red" "blue"] ["red" "blue"] ["red" "blue"] ["red" "blue"]])
```

```
user=> (csolve domains2 constraints)
[nil 10]
```

`nil` — correctly, no legal two-coloring exists. Regions `0`, `1`, and `2` are pairwise constrained (`[0 1]`, `[0 2]`, `[1 2]` are all in `constraints`) — a genuine triangle. By Lesson 66's Pigeonhole Principle, three mutually-constrained variables sharing only two colors between them must have at least two land on the same color, and every pair among them is constrained to differ — a real contradiction, not a coincidence of this search. The search costs `10` visited candidates to *discover* that, and variable `3` is never assigned even once — every branch fails at variable `2`, before variable `3`'s own domain is ever consulted.

### Discard the throwaway example

Not applicable — `csolve` is a real, reusable instrumented version of the previous unit's search, and every number shown was actually produced by `bb`, not computed by hand.

### Project Change

- **Reference Source**: No reference counterpart — an instrumented variant of this lesson's own first unit.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn csolve [domains constraints]
  (csolve-from 0 domains constraints [nil nil nil nil] 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`[nil visits]` / `[assignment visits]`** — reappearing vector-as-pair (Lesson 96's `heap-extract-min`, among others): every function in this instrumented version returns *two* things together — the real result (a completed assignment or `nil`) and a running count — rather than the count being tracked anywhere outside the function calls themselves.
- **`(+ visits 1)`, inside `ctry-candidate`** — first appearance of this specific placement: the counter advances exactly once per `try-candidate`-equivalent call, in *both* the recurse-deeper branch and the try-next-value branch — meaning it counts every partial assignment actually checked against `assignment-consistent?`, never double-counting and never skipping one.
- **`(get result-pair 0)`, `(get result-pair 1)`**, in `ctry-recursion-result` — reappearing pair-access (Lesson 85 onward): unpacks the deeper call's own answer and its own running count separately, so the count keeps accumulating correctly even across many nested recursive returns.

### CS Lens

This is Lesson 53's own amortized-analysis discipline — measure the real cost, don't assume it — applied to a search instead of a fixed-size loop. "Seven out of eighty-one" and "ten visits, variable `3` never touched" are counted facts about a real run, not estimates.

### SE Lens

It would have been easy to simply assert that pruning helps, the way most informal explanations of backtracking do. An unverified performance claim is exactly the kind of gap this curriculum's own schema refuses to accept — a real counter, threaded through and run for real, is what turns "shrinks the search space" from a plausible-sounding claim into a checked fact.

### Connection to the previous unit

The previous unit found a solution and asserted a visit count by hand; this unit adds real instrumentation confirming that exact number, then reuses the identical machinery on a provably unsolvable map, showing the search recognizes and reports impossibility correctly rather than only ever finding what was already there.

---

## Concept Unit: Heuristics — Choosing Which Variable to Decide First

### The Problem

The previous unit's unsolvable map still cost `10` visited candidates before the search could conclude "no solution." On a larger, differently-shaped unsolvable problem, does the *order* variables get decided in change how much work is wasted before the real conflict is ever found?

### Introduce the concept in isolation

Five variables, `0` through `4`, only two colors each. Variable `4` is constrained against every other variable; variables `0` and `1` are also constrained directly against each other:

```clojure
(def domains5 [["red" "blue"] ["red" "blue"] ["red" "blue"] ["red" "blue"] ["red" "blue"]])
(def constraints5 [[0 4] [1 4] [2 4] [3 4] [0 1]])
```

Variables `0`, `1`, and `4` form the identical kind of triangle as the previous unit's map — `[0 4]`, `[1 4]`, and `[0 1]` are all present — so, by the same Pigeonhole argument, this is unsolvable too. Searching in plain index order, `0` through `4`:

```
user=> (csolve domains5 constraints5)
[nil 34]
```

`34` visited candidates just to discover the same kind of contradiction the previous unit found in `10`. The reason: variable `4` — the one actually tangled in the real conflict — isn't decided until *last*, so variables `2` and `3` (each involved in only one constraint, neither part of the real triangle) get freely re-tried in every combination *before* the search ever reaches the variable that actually matters.

This is called a **heuristic**: a rule of thumb for choosing which branch to try first, adopted because it tends to help in practice, with no guarantee it always will — a genuinely different kind of choice than `assignment-consistent?`, which must always be correct. The specific heuristic tried here is the **degree heuristic**: decide the still-unassigned variable involved in the *most* constraints first. Variable `4` has degree `4` (appears in four constraints) — the highest of any variable in `constraints5` — so it goes first instead of last:

```clojure
(declare osolve-from otry-candidate otry-recursion-result)

(defn variable-at-depth [var-order depth] (get var-order depth))

(defn otry-value [depth var-order domains constraints assignment value-index visits]
  (if (>= value-index (count (get domains (variable-at-depth var-order depth))))
    [nil visits]
    (otry-candidate depth var-order domains constraints assignment value-index
      (assoc assignment (variable-at-depth var-order depth)
        (get (get domains (variable-at-depth var-order depth)) value-index)) visits)))

(defn otry-candidate [depth var-order domains constraints assignment value-index candidate visits]
  (if (assignment-consistent? candidate constraints 0)
    (otry-recursion-result depth var-order domains constraints assignment value-index
      (osolve-from (+ depth 1) var-order domains constraints candidate (+ visits 1)))
    (otry-value depth var-order domains constraints assignment (+ value-index 1) (+ visits 1))))

(defn otry-recursion-result [depth var-order domains constraints assignment value-index result-pair]
  (if (nil? (get result-pair 0))
    (otry-value depth var-order domains constraints assignment (+ value-index 1) (get result-pair 1))
    result-pair))

(defn osolve-from [depth var-order domains constraints assignment visits]
  (if (>= depth (count domains))
    [assignment visits]
    (otry-value depth var-order domains constraints assignment 0 visits)))

(defn osolve [var-order domains constraints]
  (osolve-from 0 var-order domains constraints [nil nil nil nil nil] 0))
```

```
user=> (osolve [4 0 1 2 3] domains5 constraints5)
[nil 10]
```

Same correct conclusion — no solution — for `10` visited candidates instead of `34`, more than three times fewer, with `assignment-consistent?` itself never changed at all. Deciding variable `4` first means the `0`-`1`-`4` triangle's contradiction surfaces almost immediately, instead of only after variables `2` and `3` have already been tried and re-tried in every combination on the way to a conflict that had nothing to do with either of them.

### Discard the throwaway example

Not applicable — `osolve` is a real, reusable search, and both counts (`34` and `10`) were produced by real `bb` runs, not estimated.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch reordering layer over this lesson's own second unit.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn variable-at-depth [var-order depth] (get var-order depth))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get var-order depth)`, wrapped as `variable-at-depth`** — first appearance of this lesson's one genuinely new idea: decoupling "which step of the search this is" (`depth`, always `0`, `1`, `2`, ...) from "which variable that step actually decides" (looked up in `var-order`, a vector naming variables in the order to decide them — `[4 0 1 2 3]` here). Every other function in this unit reuses the previous unit's exact shape, substituting `(variable-at-depth var-order depth)` everywhere that unit used a bare, always-sequential variable index directly.
- **`otry-value`, `otry-candidate`, `otry-recursion-result`, `osolve-from`** — reappearing (this lesson's second unit's `ctry-value`/`ctry-candidate`/`ctry-recursion-result`/`csolve-from`): identical control flow, identical counter threading, the only difference anywhere in the four being which variable each step reaches through `variable-at-depth` instead of using `depth` itself.

### CS Lens

Heuristic variable ordering is a real, recurring idea across combinatorial search generally. Also recognized in: A* search's own heuristic distance estimate (Lesson 129's shortest-path territory, extended); real SAT solvers' variable-selection heuristics, which decide which boolean variable to branch on next for exactly this reason; chess and Go engines' move-ordering heuristics, which try the *likely-best* move first specifically so a losing branch gets pruned sooner.

### SE Lens

A stronger, real alternative exists and is worth naming honestly rather than implying this lesson built the best possible version: true **minimum-remaining-values (MRV)** ordering recomputes, *after every single assignment*, which unassigned variable now has the *fewest* legal values left, and decides that one next — reacting to what the search has actually discovered so far. The degree heuristic used here is a cheaper, **static** approximation: computed once, from the constraint list alone, before any searching starts, and never updated as the search proceeds. The real tradeoff: `variable-at-depth` costs nothing extra per node — a plain lookup — while true MRV would need to re-scan every unassigned variable's shrinking domain after each step, genuinely more work per node in exchange for potentially sharper ordering decisions later in the search, when they'd matter most.

### Connection to the previous unit

The previous unit measured a real cost and showed the search correctly detects "no solution" at all; this unit shows that cost is not fixed — the identical correct conclusion, on the identical map, can cost more than three times as much work depending purely on a choice `assignment-consistent?` never has any say in.

---

## Connect the Pieces

All three results, together — one found, one correctly failed, one failed cheaper on purpose:

```clojure
(println "Solvable map, found:" (csolve domains constraints))
(println "Unsolvable map (triangle 0-1-2), correctly failed:" (csolve domains2 constraints))
(println "Unsolvable hub map, default order:" (csolve domains5 constraints5))
(println "Unsolvable hub map, degree order:" (osolve [4 0 1 2 3] domains5 constraints5))
```

```
Solvable map, found: [["red" "green" "blue" "red"] 7]
Unsolvable map (triangle 0-1-2), correctly failed: [nil 10]
Unsolvable hub map, default order: [nil 34]
Unsolvable hub map, degree order: [nil 10]
```

The same `assignment-consistent?` from Lesson 136, never modified once across this entire lesson, underlies every one of these four numbers — what changed each time was either the problem itself or, in the last comparison, purely the order variables were decided in. `34` versus `10`, on the identical map with the identical correct answer, is this lesson's own real proof that pruning's benefit is not automatic — it has to be earned by a real, deliberate ordering choice, not assumed from the technique's name alone.

## What Breaks Without This

Brute force (Lesson 111) on the five-variable hub map would generate and fully check all `2^5 = 32` complete colorings before concluding none work. The default-order backtracking search above visited `34` partial candidates to reach the identical conclusion — *more* raw candidates touched than brute force's own complete count, even though each of backtracking's checks is individually cheaper (often only one or two constraints are even checkable on a mostly-empty partial assignment, versus brute force's full five-constraint check on every complete tuple). Backtracking with a poorly-chosen variable order is not a strictly dominant strategy over brute force — it is a strategy whose real benefit depends entirely on decision order, and this lesson's own honest, verified numbers show a case where a careless order very nearly erases that benefit outright. Only the degree heuristic's reordering — an ordering choice with no effect whatsoever on correctness — actually delivers the reduction backtracking is usually assumed to provide for free.

## Exercises

1. **Trace.** By hand, using the previous unit's own reasoning, explain why `csolve` on `domains2`/`constraints` never assigns variable `3` at all — which specific constraint check forces every branch to fail before variable `3` is ever reached.
2. **Predict.** Before checking, predict whether `(osolve [0 1 2 3 4] domains5 constraints5)` (plain index order, run through the *reordering* machinery instead of the plain `csolve` from Unit 2) produces the identical count as `csolve domains5 constraints5` did. Then verify — and explain why `variable-at-depth` with `var-order [0 1 2 3 4]` should behave identically to `csolve`.
3. **Verify.** Confirm `(osolve [1 0 2 3 4] domains5 constraints5)` — deciding variable `1` (degree `2`) before variable `4` (degree `4`) — costs more visits than the degree-first order `[4 0 1 2 3]`, but likely fewer than the fully naive `[0 1 2 3 4]`. Report the real count.
4. **Break it, on purpose.** Modify `constraints5` to remove the `[0 1]` constraint entirely, leaving only the four `[* 4]` constraints. Confirm the map becomes solvable (two colors are now enough — no triangle remains), and report how many visits `(osolve [4 0 1 2 3] domains5 (the modified constraints))` needs to find it.
5. **Generalize.** Describe, without coding it, how true minimum-remaining-values (MRV) ordering — this lesson's own SE Lens — would need `var-order` to change *during* the search rather than being fixed once at the start, the way `[4 0 1 2 3]` is here.
6. **Reconstruct.** Close this lesson. From memory, explain why `34` versus `10` on the identical, identically-unsolvable map proves pruning's benefit is not automatic — using this lesson's own numbers, not a general statement about backtracking.

## Definition of Done

- [ ] You can implement backtracking search over a Lesson 136-style CSP, using `assignment-consistent?` to prune a branch immediately rather than completing it first.
- [ ] You can explain the real difference between `try-recursion-result`'s two outcomes — a genuine solution versus an exhausted, failed branch — and why `nil` means something different here than it did as an unassigned-variable marker in Lesson 136.
- [ ] You can instrument a search with a real visit counter and explain why the counter increments exactly once per `try-candidate`-equivalent call, never more or less.
- [ ] You can explain, using this lesson's own `34`-versus-`10` numbers, why a heuristic is a rule of thumb rather than a correctness guarantee.
- [ ] You completed Exercise 3 and reported a real, `bb`-verified visit count for the `[1 0 2 3 4]` ordering.
- [ ] You completed Exercise 4 and confirmed the modified map is solvable, with a real reported visit count.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you found — for example, `"Confirm [1 0 2 3 4] ordering costs N visits (between the naive and degree-first counts); modified 4-variable hub map solves in M visits"` — not just `"lesson 137 exercise"`.

---

**Next lesson:** Lesson 138, *Algorithm Design Workshop*, is this section's checkpoint lesson — a real design challenge worked with minimal scaffolding, using nothing but Section VI's own tools, plus a deliberately planted mistake in a companion implementation for you to find before it's revealed, the same format Lesson 108 established.
