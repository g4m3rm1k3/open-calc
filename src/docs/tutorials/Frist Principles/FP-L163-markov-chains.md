# Lesson 163: Systems Without Memory — Markov Chains

**What you will build.** A working model of a server's health over time — `healthy`, `degraded`, or `down` — where the chance of moving to each next state depends only on which state it's in *right now*, never on how it got there. Three real procedures: `simulate-step` and `simulate-trajectory`, which play out one random, concrete path through the system, and `distribution-step`/`n-step-distribution`, which compute the *exact* probability of being in each state after `n` steps, with no simulation at all. Both are checked against each other for real. The transferable problem: many real systems — not just this one — are naturally described by "what state am I in, and what's the chance of moving to each other state from here," and a huge amount of power comes from that "from here" being the *whole* story, with the past thrown away entirely.

**What you need to know first.** Lesson 17 and Lesson 113 for graphs as a set of things connected by relationships — a Markov chain's states and transitions form exactly this shape, weighted by probability instead of plain distance. Lesson 147 (Sample Spaces) and Lesson 148 (Events) for outcomes and the probabilities assigned to them. Lesson 150 (Independence) for what it means for one random outcome to carry no information about another. Lesson 152 (Random Variables) for treating an outcome as a value a variable can take. Lesson 159 (Monte Carlo Algorithms) for checking a probabilistic claim by running many real trials and measuring a frequency. Lesson 162 (Sampling) for `random`, exact rational arithmetic, and this curriculum's now-standard practice of proving a probabilistic claim two independent ways — once by simulation, once by exact computation — rather than trusting either alone.

**Terms used in this lesson**

- **`define`** — binds a name, at top level, to a procedure or a value. It exists so a piece of behavior or data can be given a name and reused by that name.
- **`let`** — introduces one or more local bindings, visible only inside `let`'s own body. It exists to name an intermediate value once, without leaking that name into the surrounding scope.
- **Named `let` (self-referential loop)** — a `let` that gives its own body a name, so the body can call that name again with new argument values. This is Scheme's loop construct: there is no separate `for` or `while` keyword, so a loop is a locally defined, self-calling procedure.
- **Accumulator-passing recursion** — carrying the "answer built so far" as an extra argument on each self-call, updated each time through, handed back once a base case stops the recursion. This lesson reuses it to build up a trajectory's history one step at a time, exactly as Lesson 162 used it to build up a sample one draw at a time.
- **`if`** — a two-branch conditional: evaluates its test, then evaluates exactly one of its remaining sub-expressions.
- **`or`** — a logical connective over any number of sub-expressions, evaluated left to right; it returns the first one that isn't `#f`, and stops evaluating the rest the moment it finds one — it exists so a test like "the stream is empty, *or* there's only one item left" can be written as one expression instead of a nested `if`.
- **`and`** — a logical connective over any number of sub-expressions, evaluated left to right; it returns `#f` the moment any sub-expression is `#f`, stopping without evaluating the rest, and only returns a true value if every sub-expression does. It exists so a test requiring *every one* of several conditions to hold at once can be written as one expression instead of nested `if`s.
- **`lambda`** — builds an anonymous procedure: a procedure with no top-level name of its own, created right where it's needed. It exists for exactly the case this lesson uses it for: a tiny, one-off transformation (like "look up this state's name") that isn't worth a separate `define` because nothing else in the lesson ever calls it by name.
- **`begin`** — sequences two or more expressions, evaluated one after another purely for their side effects, and returns the last one's value. It exists because most of Scheme's expression forms only have room for *one* expression in a given position (like the "then" branch of an `if`); `begin` groups several into one, when a single position genuinely needs to do more than one thing in order.
- **Exact rational numbers** — Guile's numeric tower represents the result of dividing two exact integers that don't divide evenly as an exact fraction, like `9/10`, never a rounded decimal. This lesson's transition probabilities are written and computed as exact fractions throughout, so a claim like "these three probabilities sum to exactly `1`" is something `=` can confirm outright, not something that merely looks close enough.
- **State** — one of a fixed, finite set of conditions a system can be in at any given moment. This lesson's states are `healthy`, `degraded`, and `down`.
- **Transition probability** — the probability of moving from one specific state to one specific other state (or staying put) on the next step. Every state has its own full set of transition probabilities, one for each state it could move to next, including itself.
- **Stochastic matrix** — a grid of transition probabilities, one row per state, where every row's own probabilities sum to exactly `1`. It has to sum to exactly `1` because a system in some state *has* to end up in *some* state next — staying, degrading, or otherwise — with no missing possibility and no double-counted one.
- **Markov chain** — a system that moves between a fixed set of states, where the probability of the next state depends only on the current state, never on any state visited before it.
- **The Markov property (memorylessness)** — the defining constraint a Markov chain must satisfy: the transition probabilities out of a state are exactly the same no matter how the system arrived at that state, whether this is its first time there or its fifth time in a row. This lesson proves this for real, not just by definition, in Concept Unit 2.
- **Categorical distribution** — a probability distribution over more than two discrete outcomes, each with its own probability, all summing to `1`. This generalizes the Bernoulli trial named in Lesson 162 (a yes/no decision, exactly two outcomes) to any fixed number of outcomes — the tool this lesson needs, since a system usually has more than two states to choose among.
- **Trajectory** — one concrete, realized path a system actually takes through its states over time, produced by making an actual random choice at every step. Different runs from the same start can produce different trajectories.
- **Probability distribution over states** — instead of one concrete current state, a full accounting of how likely the system is to be in *each* state right now, all probabilities summing to `1`. A trajectory is one sample from this distribution at each step; the distribution itself is the complete, exact picture no single trajectory can show alone.

**Objects and methods used**

*This lesson's own subject, in the order its Concept Units introduce them:*

- **`weighted-pick`**
  - *What it is:* a procedure this lesson derives in Concept Unit 2 — takes one row of a stochastic matrix (a vector of exact-rational probabilities summing to `1`) and returns the index of one outcome, chosen randomly according to those probabilities, not uniformly.
  - *Implementation:* `(weighted-pick row)` → an exact integer index into `row`.
  - *Its use:* the one genuinely new random-choice primitive this lesson needs — Lesson 162 built tools for choosing *uniformly*; a Markov chain's transitions are almost never uniform.
- **`simulate-step`**
  - *What it is:* derived in Concept Unit 2 — takes the system's current state (an index into `states`) and returns its next state, chosen according to that state's own row of `trans-matrix`.
  - *Implementation:* `(simulate-step current-state)` → an exact integer, the next state's index.
  - *Its use:* the single unit of "what happens next" a Markov chain is built from; everything else in this lesson that involves an actual random path calls this, directly or indirectly.
- **`simulate-trajectory`**
  - *What it is:* derived in Concept Unit 2 — takes a starting state and a number of steps, and returns the full list of states actually visited, start to finish.
  - *Implementation:* `(simulate-trajectory start-state n)` → a list of `n + 1` state indices, beginning with `start-state`.
  - *Its use:* produces one real, concrete path through the system — the thing an actual running server would experience, one hour at a time.
- **`distribution-step`**
  - *What it is:* derived in Concept Unit 3 — takes a full probability distribution over the three states (not one concrete state) and returns the distribution one step later, computed exactly, with no randomness at all.
  - *Implementation:* `(distribution-step dist)` → a length-3 vector of exact rational probabilities summing to `1`.
  - *Its use:* answers "what's the exact probability of being in each state next," a different and stronger question than any single trajectory can answer.
- **`n-step-distribution`**
  - *What it is:* derived in Concept Unit 3 — applies `distribution-step` repeatedly, `n` times, to a starting distribution.
  - *Implementation:* `(n-step-distribution dist n)` → a length-3 vector of exact rational probabilities, the distribution after `n` steps.
  - *Its use:* answers "what's the exact probability of each state after a whole shift, a whole day, a whole week," without simulating a single random trajectory.

*Everything else in the file, not this lesson's subject but still explained:*

- **`random`**
  - *What it is:* Guile's built-in source of pseudo-randomness, first given full treatment in Lesson 162.
  - *Implementation:* `(random n)`, for exact integer `n`, returns an exact integer uniformly chosen from `0` up to (not including) `n`.
  - *Its use:* `weighted-pick` draws one uniform integer and then interprets *which range it fell in* as the weighted choice — uniform randomness underneath, non-uniform meaning read out of it.
- **`vector`**
  - *What it is:* a constructor — builds a new vector from the arguments given to it.
  - *Implementation:* `(vector v0 v1 ... vn)` returns a fresh vector holding exactly those values, in that order.
  - *Its use:* builds `states` (the three state names) and each row of `trans-matrix`.
- **`make-vector`**
  - *What it is:* a constructor — builds a new vector of a given length.
  - *Implementation:* `(make-vector k)` returns a fresh vector of length `k` with an unspecified placeholder in every slot; `(make-vector k fill)` sets every slot to `fill` instead.
  - *Its use:* allocates the tally vectors this lesson's Monte Carlo verifications count into.
- **`vector-ref`**
  - *What it is:* an accessor — reads the value stored at a given index of a vector.
  - *Implementation:* `(vector-ref v i)` returns the value at index `i` (0-based).
  - *Its use:* looks up a specific state's row in `trans-matrix`, and a specific probability within a row.
- **`vector-set!`**
  - *What it is:* a mutator — overwrites a vector's value at a given index, in place.
  - *Implementation:* `(vector-set! v i x)` sets index `i` of `v` to `x`.
  - *Its use:* records a tally count, one increment at a time, in this lesson's Monte Carlo verifications.
- **`cons`**
  - *What it is:* a constructor — builds one new pair from two values; repeated `cons`ing builds a list.
  - *Implementation:* `(cons a b)` returns a fresh pair whose `car` is `a` and whose `cdr` is `b`.
  - *Its use:* `simulate-trajectory` builds its history one visited state at a time, exactly the way Lesson 162's `sample-with-replacement` built its result.
- **`car`**
  - *What it is:* an accessor — returns the first element of a pair, and by extension a list's first element.
  - *Implementation:* `(car p)` returns the first component of pair `p`.
  - *Its use:* reads the current or previous state off the front of a trajectory list while walking it.
- **`cdr`**
  - *What it is:* an accessor — returns everything in a pair after the first element; for a list, the rest of the list.
  - *Implementation:* `(cdr p)` returns the second component of pair `p`.
  - *Its use:* advances the walk through a trajectory one recorded state at a time.
- **`cadr`**
  - *What it is:* an accessor — a shorthand for the extremely common combination "the second element of a list."
  - *Implementation:* `(cadr lst)` is exactly equivalent to `(car (cdr lst))`: `cdr` skips past the first element, and `car` then reads what's now in front.
  - *Its use:* the memorylessness check reads `nxt`, the state one position ahead of the current one being examined, as `(cadr rest)` — "the second element of what's left of the trajectory" — without writing out the two-step `(car (cdr rest))` by hand.
- **`reverse`**
  - *What it is:* a converter — builds a new list holding the same elements as a given list, but in the opposite order.
  - *Implementation:* `(reverse lst)` returns a fresh list; `lst` itself is untouched.
  - *Its use:* `simulate-trajectory` builds its `history` accumulator by `cons`ing each new state onto the front, which leaves the most recent state first and the starting state last — `reverse`, applied once at the very end, puts the finished trajectory back into the order it was actually visited.
- **`null?`**
  - *What it is:* a predicate — reports whether a value is the empty list.
  - *Implementation:* `(null? x)` returns `#t` if `x` is `'()`.
  - *Its use:* detects the end of a trajectory list while scanning it for the memorylessness check.
- **`list`**
  - *What it is:* a constructor — builds a list directly from its arguments, without writing out nested `cons` calls by hand.
  - *Implementation:* `(list v0 v1 ... vn)` returns a fresh list holding exactly those values, in that order.
  - *Its use:* `simulate-trajectory` uses the one-argument form, `(list start-state)`, to build the initial one-element history a trajectory starts from, before any step has actually been simulated.
- **`map`**
  - *What it is:* a transformation procedure — applies a given procedure to every element of a list, returning a new list of the results.
  - *Implementation:* `(map proc list)` returns `(list (proc x0) (proc x1) ...)` for each `x` in `list`, left to right; the original list is untouched.
  - *Its use:* turns a trajectory of raw state indices, like `0`, into a trajectory of readable state names, like `healthy`, by looking each index up in `states`.
- **`display`**
  - *What it is:* an output procedure — writes a human-readable representation of a value to the terminal.
  - *Implementation:* `(display obj)` sends `obj`'s printed form to the current output port.
  - *Its use:* every real result in this lesson's Run It sections was produced with `display`.
- **`newline`**
  - *What it is:* an output procedure — writes a single line break.
  - *Implementation:* `(newline)` takes no required arguments.
  - *Its use:* keeps each displayed result on its own line.
- **`+`, `-`, `*`**
  - *What it is:* three of Scheme's arithmetic procedures — ordinary procedures, not special syntax. (This lesson's fractions, like `9/10`, are numeric literals — `/` written directly into a number token — not calls to a `/` procedure; Lesson 162 covers `/` as an actual call.)
  - *Implementation:* each takes any number of numeric arguments and returns their sum, difference, or product; on exact rational arguments, every result stays an exact rational too.
  - *Its use:* `+` sums a row's probabilities and combines weighted contributions in `distribution-step`; `-` counts down a trajectory's remaining steps and a distribution's remaining steps-to-compute; `*` scales a probability by a matrix entry, and scales a lab's cumulative-probability threshold up to a whole-number range.
- **`<`, `=`**
  - *What it is:* numeric comparison procedures, returning `#t` or `#f`.
  - *Implementation:* `(< a b)` and `(= a b)` compare two numbers.
  - *Its use:* `<` decides which range a random draw falls in, inside `weighted-pick`; `=` recognizes every loop's base case and checks a row-sum against `1` exactly.

---

## Concept Unit: State Space and the Stochastic Transition Matrix

### The Problem

A server's health, checked once an hour, is always in exactly one of three conditions: `healthy`, `degraded`, or `down`. History shows this system doesn't move between conditions uniformly at random — a healthy server usually stays healthy, an occasional dip to degraded is far more common than a sudden crash, and a downed server, once someone's paged, usually comes back healthy rather than lingering. What's needed is a way to write down, precisely, *how much* more likely each of these outcomes is than the others, separately for each starting condition — and a way to be sure that whatever numbers get written down are actually valid probabilities, not just plausible-looking guesses.

### Project Change

- **Reference Source** — No reference counterpart. This lesson derives a Markov chain model from first principles, the same way Era VI's other lessons have, rather than porting a reference implementation.
- **Files affected** — this lesson's own file. As established in Lesson 162, this curriculum has no separate, persisted project source tree; each lesson's real, run-and-verified Guile code lives entirely inside that lesson's own Concept Units.
- **Change type** — add: two new top-level definitions (data, not procedures).
- **Location** — nothing precedes them in this lesson yet; these are the first definitions this lesson makes.
- **Dependencies** — none beyond Guile's built-in vector procedures.

### The New Code

```scheme
(define states (vector 'healthy 'degraded 'down))

(define trans-matrix
  (vector (vector 9/10  2/25  1/50)    ; from healthy
          (vector 1/2   3/10  1/5)     ; from degraded
          (vector 3/10  0     7/10)))  ; from down
```

### The Updated Project

Skipped — `states` and `trans-matrix` are brand-new top-level definitions with no existing enclosing structure to place them inside yet; Project Change already covers this case.

### Isolated Lab: A Two-State Stochastic Matrix

The core new idea here is the **stochastic matrix** itself: a grid of probabilities where every row has to sum to exactly `1`. Isolated, on the simplest possible system — a flaky light switch with only two states, `off` and `on` — before meeting the real three-state server model:

```scheme
(define switch-matrix
  (vector (vector 7/10 3/10)     ; from off: 70% stays off, 30% turns on
          (vector 2/5  3/5)))    ; from on: 40% turns off, 60% stays on

(define (row-sum2 row) (+ (vector-ref row 0) (vector-ref row 1)))
```

Run for real:

```scheme
(row-sum2 (vector-ref switch-matrix 0))
;=> 1

(row-sum2 (vector-ref switch-matrix 1))
;=> 1
```

Both rows come out to *exactly* `1` — not `0.9999999` or `1.00001`, because `7/10` and `3/10` are exact rationals, and `+` on two exact rationals produces another exact rational, with no rounding anywhere in the chain. This is the invariant a **stochastic matrix** exists to guarantee: from `off`, the system has to end up somewhere — staying `off` or moving to `on` — with no missing possibility (the two probabilities can't sum to less than `1`) and no double-counted one (they can't sum to more than `1` either). This is exactly what the real `trans-matrix` above needs to satisfy, at three rows instead of two.

### Discarding the Lab

This two-state light-switch matrix is discarded now. It never appears in the project again — the real `trans-matrix`, defined above, is this same idea at the scale this lesson actually needs.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define states (vector 'healthy 'degraded 'down))`** — `define` binds the name `states` to a vector of three symbols. Each symbol, written with a leading `'`, is a literal, unevaluated name — `'healthy` isn't a variable reference or a procedure call, it's a value in its own right, used here purely as a human-readable label. `states` fixes an index-to-name mapping this whole lesson relies on: index `0` means `healthy`, index `1` means `degraded`, index `2` means `down`, and every other definition in this lesson works with these indices directly rather than the symbols themselves.
- **`(define trans-matrix (vector (vector 9/10 2/25 1/50) (vector 1/2 3/10 1/5) (vector 3/10 0 7/10)))`** — `define` binds `trans-matrix` to a vector of three vectors — a **stochastic matrix**. `(vector-ref trans-matrix 0)` reads the whole first row, the transition probabilities *out of* `healthy`; `(vector-ref (vector-ref trans-matrix 0) 1)` reads one specific entry, the probability of moving from `healthy` to `degraded` specifically — two nested lookups, an outer one selecting the row (the current state), an inner one selecting the column (the next state). `9/10`, `2/25`, `1/50`, and every other entry are **exact rational numbers** — Guile's numeric tower keeps `9/10` as a genuine fraction rather than rounding it to a decimal, which is exactly what let this lesson's Isolated Lab confirm a row-sum came out to precisely `1`. The comments after each row (`; from healthy`, and so on) are not code Guile evaluates at all; they exist purely to keep a human reader oriented about which row belongs to which starting state, since the matrix itself only stores numbers, never the state names.

### CS Lens

This is a **stochastic matrix**: a table of transition probabilities, one row per state, where every row sums to exactly `1`.

Also recognized in: a board game's random-event table (a table listing, for each square, the probability of each possible outcome landing there); a genetics model's mutation-probability table (the chance one specific base pair changes into each of the others); a recommendation system's "users who liked X went on to like Y" table, built from real observed transition frequencies; and, generalized to Era V's own vocabulary, a weighted directed graph in which every node's *outgoing* edge weights are constrained to sum to exactly `1` — a Markov chain is precisely that graph, with "distance" replaced by "probability."

### SE Lens

The design principle here is **separating the model from the mechanism**: `trans-matrix` is pure data — no `random`, no loop, nothing that actually *does* anything — and every later Concept Unit in this lesson builds a different kind of behavior on top of the exact same, unchanged data.

An alternative that was *not* chosen: hard-code the transition logic directly into procedures, with a `cond` branching on the current state and literal probability constants scattered through the branches, rather than pulling every probability out into one shared matrix. That alternative would work for this exact three-state system, but the real cost shows up the moment the model needs to change: adding a fourth state, or adjusting one probability after observing more real server data, would mean hunting through every procedure that happens to branch on state, rather than editing one row of one matrix. The cost this project pays for keeping the model separate: every procedure that uses `trans-matrix` has to agree on the same index-to-state mapping (`states`), with nothing in the type system enforcing that agreement — a typo passing state index `3` to a matrix with only rows `0` through `2` would fail at `vector-ref` with an out-of-range error, not with a clear message about which state was meant.

### Run It

`row-sum` is this lesson's real three-argument version of the Isolated Lab's `row-sum2`, one more argument to match `trans-matrix`'s own three-outcome rows instead of the light switch's two:

```scheme
(define (row-sum row) (+ (vector-ref row 0) (vector-ref row 1) (vector-ref row 2)))

(row-sum (vector-ref trans-matrix 0))
;=> 1

(row-sum (vector-ref trans-matrix 1))
;=> 1

(row-sum (vector-ref trans-matrix 2))
;=> 1
```

All three of `trans-matrix`'s real rows — `healthy`, `degraded`, and `down` — sum to exactly `1`, confirmed the same way the light-switch lab was confirmed: with exact rational arithmetic, not an approximation.

### Connection

With a verified, valid model of the system's transition probabilities in hand, the next problem is turning that static table into something that actually *moves* — one real random step at a time.

---

## Concept Unit: The Markov Property and Simulating a Trajectory

### The Problem

Given the transition matrix, the next real problem is producing an actual, concrete sequence of hourly health checks — a **trajectory** — the way a real running server would actually experience it, one random step after another. Lesson 162's tools don't quite reach this: `sample-with-replacement` and `sample-without-replacement` both assumed every outcome was *equally* likely, and this system's outcomes plainly aren't — a `9/10` chance of staying healthy is nothing like a `1/50` chance of crashing. What's needed first is a way to make a single random choice among several outcomes with *different* probabilities each, and then a way to chain many such choices together into a full path. And underneath both of those sits the deeper question this whole lesson is really about: does the probability of what happens next depend only on the current state, or does it secretly depend on more — like how long the system has already been in that state?

### Project Change

- **Reference Source** — No reference counterpart, for the same reason as Concept Unit 1.
- **Files affected** — this lesson's own file.
- **Change type** — add: three new, freestanding top-level procedures.
- **Location** — after `states` and `trans-matrix`; built directly on top of that data.
- **Dependencies** — `states` and `trans-matrix`, defined in Concept Unit 1.

### The New Code

```scheme
(define (weighted-pick row)
  (let ((r (random 50)))
    (let loop ((i 0) (cum 0))
      (let ((cum2 (+ cum (* 50 (vector-ref row i)))))
        (if (< r cum2)
            i
            (loop (+ i 1) cum2))))))

(define (simulate-step current-state)
  (weighted-pick (vector-ref trans-matrix current-state)))

(define (simulate-trajectory start-state n)
  (let loop ((state start-state) (steps-left n) (history (list start-state)))
    (if (= steps-left 0)
        (reverse history)
        (let ((next (simulate-step state)))
          (loop next (- steps-left 1) (cons next history))))))
```

### The Updated Project

Skipped — all three are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside.

### Isolated Lab: Weighted Choice by Cumulative Probability

The one genuinely new idea here is choosing among several outcomes *unequally* — a **categorical distribution**, generalizing Lesson 162's Bernoulli trial from two outcomes to any fixed number. Isolated, on a made-up split — 60%, 30%, 10% — nothing to do with servers at all:

```scheme
(define (weighted-pick-demo weights)
  (let ((r (random 10)))
    (let loop ((i 0) (cum 0))
      (let ((cum2 (+ cum (* 10 (vector-ref weights i)))))
        (if (< r cum2)
            i
            (loop (+ i 1) cum2))))))

(define demo-weights (vector 6/10 3/10 1/10))
```

Five real, individual calls:

```scheme
(weighted-pick-demo demo-weights)
;=> 0

(weighted-pick-demo demo-weights)
;=> 0

(weighted-pick-demo demo-weights)
;=> 0

(weighted-pick-demo demo-weights)
;=> 0

(weighted-pick-demo demo-weights)
;=> 1
```

Four `0`s and one `1` — plausible for a 60%/30%/10% split, but five trials proves almost nothing on its own. Run for real, 10,000 times, tallying which index comes up each time:

```scheme
(define tally (make-vector 3 0))
(let loop ((t 0))
  (if (< t 10000)
      (let ((pick (weighted-pick-demo demo-weights)))
        (vector-set! tally pick (+ 1 (vector-ref tally pick)))
        (loop (+ t 1)))))

tally
;=> #(6021 2978 1001)
```

`6021`, `2978`, and `1001` sit close to the predicted `6000`, `3000`, and `1000` — real, measured evidence this genuinely respects the unequal weights, not just a coincidence from five lucky draws. The mechanism: `(random 10)` draws a uniform integer `r` from `0` up to (not including) `10`; the loop then walks the weights one at a time, keeping a running cumulative total (`cum2`) scaled up to the same `0`–`10` range as `r` — `6/10` scaled by `10` is `6`, `3/10` scaled by `10` is `3`, and so on — and stops at the first index whose cumulative total *exceeds* `r`. Since outcome `0` claims the range `r < 6` (six of the ten possible draws), outcome `1` claims `6 ≤ r < 9` (three more), and outcome `2` claims only `r = 9` (one), a uniform choice over ten equally-likely raw values becomes a non-uniform choice over three outcomes, in exact proportion to how much of that range each one was given. This is exactly what `(let ((r (random 50))) ...)` in the real code above is doing, scaled up to a range of `50` instead of `10` — the specific number chosen because, as Concept Unit 1 confirmed, `50` is a common denominator for every probability in every row of the real `trans-matrix`.

### Discarding the Lab

This 60/30/10, ten-thousand-trial demonstration is discarded now. It never appears in the project again — `weighted-pick`, defined above, is the same cumulative-probability idea, applied to whichever real row of `trans-matrix` a state's own transition probabilities live in.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (weighted-pick row) ...)`** — `define` binds `weighted-pick` to a one-parameter procedure.
- **`(let ((r (random 50))) ...)`** — a plain `let`, one binding: `r` is bound to one fresh, uniform draw from `0` up to (not including) `50` — this is this Concept Unit's Isolated Lab, generalized from a range of `10` to a range of `50`.
- **`(let loop ((i 0) (cum 0)) ...)`** — a named `let`: a self-calling local loop, started with `i` (the candidate outcome index) at `0` and `cum` (the cumulative total *before* this outcome's own share) at `0`.
- **`(let ((cum2 (+ cum (* 50 (vector-ref row i))))) ...)`** — another plain `let`, one binding: `(vector-ref row i)` reads outcome `i`'s own exact-rational probability out of `row`; `(* 50 ...)` scales it up to a whole number out of `50`, matching `r`'s own range; `(+ cum ...)` adds that scaled probability to the running total so far, giving `cum2`, the cumulative total *through and including* outcome `i`.
- **`(if (< r cum2) i (loop (+ i 1) cum2))`** — the loop's decision: if the drawn value `r` falls below this outcome's cumulative total, outcome `i` is the answer — the loop stops and returns `i`. Otherwise, `(loop (+ i 1) cum2)` moves on to the next candidate outcome, this lesson's first use of accumulator-passing recursion, carrying `cum2` forward as the new `cum` for the next comparison.
- **`(define (simulate-step current-state) (weighted-pick (vector-ref trans-matrix current-state)))`** — `define` binds `simulate-step` to a one-parameter procedure. `(vector-ref trans-matrix current-state)` selects the one row of the matrix that belongs to whatever state the system is in right now; `weighted-pick` then makes exactly one weighted choice among that row's own outcomes. Nothing about how the system arrived at `current-state` is visible anywhere in this procedure — `current-state` is the *entire* input, a single integer, with no history attached to it at all. That absence is not an oversight; it is the **Markov property**, built directly into this procedure's own signature: it is structurally impossible for `simulate-step` to consult "how did I get here," because nothing about "how" was ever passed in to consult.
- **`(define (simulate-trajectory start-state n) ...)`** — `define` binds `simulate-trajectory` to a two-parameter procedure.
- **`(let loop ((state start-state) (steps-left n) (history (list start-state))) ...)`** — a named `let`, this lesson's second: `state` tracks the current position, `steps-left` counts down how many more steps remain, and `history` accumulates every state actually visited so far. `(list start-state)` builds that starting accumulator: a fresh, one-element list holding just `start-state`, since at this point in the run, `start-state` is the only state that's actually been "visited" yet.
- **`(if (= steps-left 0) (reverse history) ...)`** — the base case: once no steps remain, the trajectory is complete, and `(reverse history)` puts the accumulated states back into the order they were actually visited — `history` was built by `cons`ing each new state onto the front, exactly the way Lesson 162's `sample-with-replacement` built its own result, so it comes out backwards unless explicitly reversed.
- **`(let ((next (simulate-step state))) (loop next (- steps-left 1) (cons next history)))`** — the recursive step: `(simulate-step state)` makes one real random transition out of the current state; `(- steps-left 1)` counts one step closer to done; `(cons next history)` records the newly-visited state at the front of the accumulated history — this lesson's second use of accumulator-passing recursion.

**Execution trace** — instrumenting `weighted-pick-demo` to print its own hidden draw confirms the real value behind the fifth call above, the one that returned `1`: `r = 6`.

```
Iteration i=0: cum=0, cum2 = 0 + (10 * 6/10) = 6, is r (6) < 6? no, continue
Iteration i=1: cum=6, cum2 = 6 + (10 * 3/10) = 9, is r (6) < 9? yes, return 1
```

At `i = 0`, `cum2` becomes `6` — all of outcome `0`'s own share of the `0..9` range — and `6 < 6` is false, so `r = 6` does *not* fall in outcome `0`'s range; the loop continues. At `i = 1`, `cum2` grows to `9` (outcome `0`'s share plus outcome `1`'s own `3`), and `6 < 9` is true, so the loop stops and returns `1`. The same mechanics explain the other four real calls without needing to instrument them individually: outcome `0` claims every draw in `0..5` (six of the ten possible values, matching its `60%` share), outcome `1` claims `6..8` (three values, `30%`), and outcome `2` claims only `9` (one value, `10%`) — which is exactly why four of the five real calls above landed on `0` and one landed on `1`, with `2` simply not having come up yet in only five draws.

### CS Lens

This is the **Markov property**: the probability of the next state depends only on the current state, never on the path taken to reach it.

Also recognized in: board games where a die roll's outcome doesn't care how a piece got to its current square (Chutes and Ladders is a textbook Markov chain); a spell-checker's next-character prediction depending only on the current character, not the whole word typed so far; a simple weather model where tomorrow's forecast category depends only on today's, not last week's; and PageRank, which models a web surfer's next click as depending only on the page they're currently on, never on their browsing history.

### SE Lens

The design principle here is **encoding an invariant in a function's own signature**, rather than trusting a comment or a convention to uphold it. `simulate-step` takes exactly one argument, `current-state` — there is no parameter anywhere for "history," so nothing calling `simulate-step` even has the *option* of accidentally leaking past states into the decision, let alone a future maintainer forgetting to ignore them.

An alternative that was *not* chosen: give `simulate-step` a second parameter, `history`, listing every previously visited state, "just in case a future version of the model needs it." That alternative is tempting precisely because it looks like harmless future-proofing, but the real cost is structural: the moment `history` exists as a parameter, nothing stops a later addition from actually reading it, and the Markov property stops being something the code *guarantees* and becomes something the code merely *happens* to respect, until someone changes it without noticing they've broken the model's own defining assumption. The real, honest cost this project accepts by refusing that parameter: if some future health model for this same server genuinely does need memory of more than the current state (a "how many consecutive degraded readings" counter, say), it can't be bolted onto `simulate-step` at all — it would need a different function with a different, larger state space (states like `degraded-first-time` and `degraded-again` instead of one shared `degraded`), not a hidden extra argument on this one.

### Run It

```scheme
(simulate-trajectory 0 10)
;=> (0 1 1 0 0 0 1 0 0 0 2)

(simulate-trajectory 0 10)
;=> (0 0 0 0 0 0 0 0 0 1 1)
```

Two independent ten-step trajectories from `healthy` (index `0`), and they look genuinely different — the first dips to `degraded` (`1`) twice and reaches `down` (`2`) once; the second stays `healthy` for nine straight steps before finally slipping to `degraded`. Both are completely ordinary outcomes given the real model: `healthy`'s own row gives it a `9/10` chance of staying `healthy` on *any single* step, so a long healthy streak, like the second trajectory's, is the expected common case, not a fluke.

Reading a trajectory as actual state names instead of raw indices:

```scheme
(map (lambda (i) (vector-ref states i)) (simulate-trajectory 0 12))
;=> (healthy healthy healthy healthy healthy healthy healthy healthy healthy healthy healthy healthy degraded)
```

**A real, direct proof of the Markov property, not just a structural argument.** The SE Lens above argued `simulate-step`'s own signature makes memorylessness structurally impossible to violate — that's true by construction, but it's worth checking empirically too, the same way every probabilistic claim in this curriculum gets checked. Take one very long trajectory, `200,000` steps, and every time it's currently in `degraded`, record what happens next — separately for the times it *just arrived* at `degraded` (the previous state was something else) versus the times it was *already* `degraded` (the previous state was `degraded` too, meaning it's been there a while):

```scheme
(define long-traj (simulate-trajectory 0 200000))
(define fresh-next (make-vector 3 0))
(define repeat-next (make-vector 3 0))

(let loop ((prev (car long-traj)) (rest (cdr long-traj)))
  (if (or (null? rest) (null? (cdr rest)))
      'done
      (let ((cur (car rest)) (nxt (cadr rest)))
        (if (= cur 1)
            (if (= prev 1)
                (vector-set! repeat-next nxt (+ 1 (vector-ref repeat-next nxt)))
                (vector-set! fresh-next nxt (+ 1 (vector-ref fresh-next nxt)))))
        (loop cur (cdr rest)))))

fresh-next
;=> #(6390 3800 2511)

repeat-next
;=> #(2739 1595 1061)
```

`fresh-next`, normalized, is approximately `(0.503, 0.299, 0.198)`; `repeat-next`, normalized, is approximately `(0.508, 0.296, 0.197)`. Both are extremely close to each other, and both are extremely close to `degraded`'s own real row in `trans-matrix`, `(1/2, 3/10, 1/5) = (0.5, 0.3, 0.2)`. This is the direct, empirical answer to this Concept Unit's own opening question: whether the system just arrived at `degraded` or has been sitting there for a while makes no real, measurable difference to what happens next — exactly what "the probability of the next state depends only on the current state" predicts, and exactly what would *not* be true if this model secretly had memory it wasn't supposed to.

### Connection

A single trajectory shows one real, concrete thing that could happen. The next problem is computing, exactly, the full range of things that *could* happen — every state's own probability, all at once, with no randomness involved in the computation at all.

---

## Concept Unit: Multi-Step Distributions

### The Problem

A single trajectory answers "what happened in this one run." A genuinely different, often more useful question: starting from `healthy` right now, what is the *exact* probability the system will be in each of the three states ten hours from now? Running `simulate-trajectory` many times and tallying the results, the way Lesson 162 verified its own probabilistic claims, would give an *estimate* — accurate, but still an estimate, with some real, unavoidable sampling noise. What's needed is a way to compute the true answer directly, with no randomness anywhere in the computation, by tracking not one concrete state but the *entire probability distribution* over all three states at once, and watching how that whole distribution moves, one step at a time.

### Project Change

- **Reference Source** — No reference counterpart, for the same reason as the two Concept Units before this one.
- **Files affected** — this lesson's own file.
- **Change type** — add: two new, freestanding top-level procedures.
- **Location** — after `weighted-pick`, `simulate-step`, and `simulate-trajectory`; depends only on `trans-matrix` from Concept Unit 1, not on anything from Concept Unit 2.
- **Dependencies** — `trans-matrix`, defined in Concept Unit 1.

### The New Code

```scheme
(define (distribution-step dist)
  (vector
   (+ (* (vector-ref dist 0) (vector-ref (vector-ref trans-matrix 0) 0))
      (* (vector-ref dist 1) (vector-ref (vector-ref trans-matrix 1) 0))
      (* (vector-ref dist 2) (vector-ref (vector-ref trans-matrix 2) 0)))
   (+ (* (vector-ref dist 0) (vector-ref (vector-ref trans-matrix 0) 1))
      (* (vector-ref dist 1) (vector-ref (vector-ref trans-matrix 1) 1))
      (* (vector-ref dist 2) (vector-ref (vector-ref trans-matrix 2) 1)))
   (+ (* (vector-ref dist 0) (vector-ref (vector-ref trans-matrix 0) 2))
      (* (vector-ref dist 1) (vector-ref (vector-ref trans-matrix 1) 2))
      (* (vector-ref dist 2) (vector-ref (vector-ref trans-matrix 2) 2)))))

(define (n-step-distribution dist n)
  (if (= n 0)
      dist
      (n-step-distribution (distribution-step dist) (- n 1))))
```

### The Updated Project

Skipped — both are brand-new, freestanding top-level procedures with no existing enclosing structure to place them inside.

### Isolated Lab: One Weighted Sum, in Isolation

The core new idea here isn't a new Scheme construct at all — every piece (`vector-ref`, `+`, `*`) has already had full treatment. The new idea is what they're being combined to compute: the probability of landing in *one specific* next state, given uncertainty about the *current* state. Isolated, with a made-up, two-outcome version — suppose there's a `3/5` chance of currently being in state A and a `2/5` chance of being in state B, and state A moves to state X with probability `1/4` while state B moves to state X with probability `1/2`:

```scheme
(+ (* 3/5 1/4) (* 2/5 1/2))
```

Run for real:

```scheme
(+ (* 3/5 1/4) (* 2/5 1/2))
;=> 7/20
```

`7/20` is the exact probability of landing in state X, accounting for *both* ways of getting there — arriving via A (weighted by how likely A is to begin with, `3/5`, times A's own chance of reaching X, `1/4`) and arriving via B (`2/5` times `1/2`) — added together because these are two separate, mutually exclusive paths to the same outcome. This is precisely what one output slot of `distribution-step` computes, generalized from two possible current states to three: `(+ (* (vector-ref dist 0) ...) (* (vector-ref dist 1) ...) (* (vector-ref dist 2) ...))` is exactly this same "weight each path by how likely its starting point is, then add every path leading to the same destination" computation, just with a third term added for the third state.

### Discarding the Lab

This two-outcome, made-up weighted sum is discarded now. It never appears in the project again — `distribution-step`, defined above, performs this same computation three times over, once for each of the three real output states.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (distribution-step dist) ...)`** — `define` binds `distribution-step` to a one-parameter procedure; `dist` is a length-3 vector, the current probability distribution over `healthy`, `degraded`, and `down`, in that index order.
- **`(vector ...)`** — the outer constructor: `distribution-step` returns a brand-new length-3 vector, the distribution one step later, built from three separately-computed entries rather than mutating `dist` in place.
- **First entry, the probability of `healthy` next:** `(+ (* (vector-ref dist 0) (vector-ref (vector-ref trans-matrix 0) 0)) (* (vector-ref dist 1) (vector-ref (vector-ref trans-matrix 1) 0)) (* (vector-ref dist 2) (vector-ref (vector-ref trans-matrix 2) 0)))` — this is this Concept Unit's own Isolated Lab, generalized to three terms instead of two: `(vector-ref dist 0)` is the current probability of being `healthy`, `(vector-ref (vector-ref trans-matrix 0) 0)` is `healthy`'s own probability of staying `healthy`, and their product is one path's contribution; the second and third `*` terms are the same idea for arriving at `healthy` *from* `degraded` and *from* `down` instead; the outer `+` sums all three paths, since a system already in any of the three states could, in principle, end up `healthy` next.
- **Second and third entries** — the same three-term weighted-sum shape, repeated for `degraded` (column index `1`) and `down` (column index `2`); nothing about the *shape* of the computation changes, only which column of `trans-matrix` each inner `vector-ref` reads.
- **`(define (n-step-distribution dist n) ...)`** — `define` binds `n-step-distribution` to a two-parameter procedure.
- **`(if (= n 0) dist (n-step-distribution (distribution-step dist) (- n 1)))`** — this lesson's third use of accumulator-passing recursion, though the "accumulator" here is the distribution itself rather than a separately-tracked value: the base case, `(= n 0)`, returns `dist` exactly as it currently stands; otherwise, `(distribution-step dist)` computes one more step forward, and `(- n 1)` counts one step closer to done, with the freshly-stepped distribution replacing `dist` for the next call.

### CS Lens

This is computing an exact **probability distribution over states**, evolved forward through a Markov chain by repeated matrix-style application, as opposed to sampling one concrete **trajectory** through it.

Also recognized in: PageRank's own actual computation, which doesn't simulate individual web surfers clicking links — it repeatedly applies the same "spread probability mass along outgoing links" step this lesson's `distribution-step` performs, until the distribution stops changing; a weather model reporting "40% chance of rain tomorrow," a single distribution computed from today's exact conditions rather than one simulated possible tomorrow; population-genetics models tracking the exact fraction of a population carrying each gene variant across generations; and queueing theory's exact probability of a system having each possible number of waiting customers, computed the same way rather than by simulating individual customers arriving one at a time.

### SE Lens

The design principle here is **computing an exact answer instead of estimating one, when an exact answer is actually available** — `n-step-distribution` gives the *true* probability of each state after `n` steps, with zero sampling error, in contrast to running `simulate-trajectory` many times and counting.

An alternative that was *not* chosen: skip `distribution-step` entirely and just answer "what's the probability of each state after `n` steps" by running a large number of trajectories through `simulate-step` and tallying where they land, the way Lesson 162 verified its own claims. That alternative is genuinely simpler to write — no new procedure, no new mental model, just reusing Concept Unit 2's own tools — and for many real questions, an estimate with some known, bounded error is perfectly acceptable. The real cost of choosing simulation as the *only* tool: every run costs real time proportional to the number of trials, and the answer still carries irreducible sampling noise no matter how many trials are spent, whereas `n-step-distribution`, computed once, is exact and free of that noise entirely. The cost `distribution-step` pays in return: it only works because `trans-matrix` is small and fully known in advance — three states, nine numbers. A system with millions of possible states, or transition probabilities nobody has written down precisely, would have no matrix to apply `distribution-step` to at all, and simulation would become the *only* available option, not merely the simpler one.

### Run It

```scheme
(distribution-step (vector 1 0 0))
;=> #(9/10 2/25 1/50)
```

Starting from "certainly `healthy`" — probability `1` on `healthy`, `0` everywhere else — one step forward reproduces `healthy`'s own row of `trans-matrix` exactly, which makes sense: with no uncertainty about the starting state, `distribution-step`'s three-path weighted sum collapses to just the one real path that has any weight at all.

```scheme
(distribution-step (distribution-step (vector 1 0 0)))
;=> #(107/125 12/125 6/125)
```

Two steps out, the exact distribution is already a less obviously "nice" fraction — real evidence the computation is genuinely combining multiple paths (`healthy → healthy → healthy`, `healthy → healthy → degraded`, `healthy → degraded → healthy`, and so on), not just repeating the first step's numbers.

```scheme
(n-step-distribution (vector 1 0 0) 10)
;=> #(778474479289/976562500000 178325245437/1953125000000 43570159197/390625000000)
```

An exact answer, still — every one of those huge exact fractions sums to precisely `1`, checkable with `+` and `=` the same way Concept Unit 1's row-sums were — but not remotely a readable one. Converted to an ordinary decimal for reading (not for computing — the computation above never used one):

```scheme
;; #(0.797157866791936 0.091302525663744 0.11153960754432)
```

Roughly `80%` `healthy`, `9%` `degraded`, `11%` `down`, ten hours out from a guaranteed-healthy start.

**Checked against Concept Unit 2's own simulation tool, for real:** run `100,000` independent ten-step trajectories from `healthy`, and tally which state each one actually lands in:

```scheme
(define mc-tally (make-vector 3 0))
(let loop ((trial 0))
  (if (< trial 100000)
      (let loop2 ((state 0) (steps 0))
        (if (= steps 10)
            (begin
              (vector-set! mc-tally state (+ 1 (vector-ref mc-tally state)))
              (loop (+ trial 1)))
            (loop2 (simulate-step state) (+ steps 1))))))

mc-tally
;=> #(79652 9145 11203)
```

Normalized, that's approximately `(0.797, 0.091, 0.112)` — matching the exact computation's `(0.797, 0.091, 0.112)` to within a fraction of a percent on every single state, real, independent confirmation that `distribution-step`'s exact arithmetic and `simulate-step`'s real random trajectories are describing the same underlying system, from two genuinely different computational routes.

### Connection

Two independent ways of asking the same question about this system — one random and concrete, one exact and abstract — now agree with each other, for real. What's left is tracing one thread through everything this lesson built, and being honest about what breaks if a Markov chain's one defining rule gets violated.

---

## Closing

### Connect the Pieces

One system, moving through every piece built in this lesson, start to finish:

```scheme
trans-matrix
;=> #(#(9/10 2/25 1/50) #(1/2 3/10 1/5) #(3/10 0 7/10))
```

The static model — nine exact probabilities, three rows, each summing to `1`, verified in Concept Unit 1.

```scheme
(simulate-trajectory 0 5)
;=> (0 0 0 0 0 0)
```

One real, concrete path the system could actually take — five real random transitions, each one a weighted choice depending only on the state immediately before it, per the Markov property demonstrated in Concept Unit 2. This particular run happened to stay `healthy` the whole way — a real, unremarkable outcome given `healthy`'s own `9/10` chance of staying put on any single step, and the same kind of long healthy streak Concept Unit 2's own Run It section already noted.

```scheme
(n-step-distribution (vector 1 0 0) 5)
;=> #(126663/156250 73651/781250 37142/390625)
```

The exact probability of each state after those same five steps — not one possible path, but the complete, precise accounting of all of them at once, computed in Concept Unit 3 with no randomness anywhere in the computation. Both routes — one trajectory at a time, or the whole distribution at once — describe exactly the same underlying system, and Concept Unit 3's own `100,000`-trial check confirmed they agree.

### What Breaks Without This

Concept Unit 2's SE Lens argued that `simulate-step`'s own signature — one argument, `current-state`, nothing else — makes the Markov property structurally impossible to violate by accident. Breaking that on purpose, to see what "with memory" would actually look like: a variant that makes `down` twice as likely to persist if the system was *already* `down` last time too, by reading an extra argument:

```scheme
(define (simulate-step-with-memory current-state was-down-last-time?)
  (if (and (= current-state 2) was-down-last-time?)
      (weighted-pick (vector 3/20 0 17/20))  ; down is stickier with memory
      (weighted-pick (vector-ref trans-matrix current-state))))
```

`and`, used here for the first time in this lesson, is a logical connective, evaluated left to right: it returns `#f` the moment any sub-expression comes back `#f`, without even evaluating the rest, and only returns a true value if every sub-expression does — here, "the current state is `down`, *and* it was already `down` last time too," both conditions genuinely required at once.

Now try to actually use it the same way `simulate-trajectory` uses ordinary `simulate-step` — plugging `simulate-step-with-memory` straight into an otherwise-identical trajectory loop, calling it with one argument, exactly the way every existing caller in this lesson calls `simulate-step`:

```scheme
(define (simulate-trajectory-with-memory start-state n)
  (let loop ((state start-state) (steps-left n) (history (list start-state)))
    (if (= steps-left 0)
        (reverse history)
        (let ((next (simulate-step-with-memory state)))
          (loop next (- steps-left 1) (cons next history))))))

(simulate-trajectory-with-memory 0 5)
```

Run for real:

```
;; real output:
;; ice-9/eval.scm:336:13: Wrong number of arguments to #<procedure simulate-step-with-memory (a b)>
```

A real, immediate error, before a single trial even runs: `simulate-step-with-memory` requires two arguments, `current-state` and `was-down-last-time?`, but `simulate-trajectory-with-memory`'s own loop — copied unchanged from `simulate-trajectory` — only ever calls it with one, `state`, because `simulate-trajectory`'s own accumulator, `history`, was never built to answer a question like "was the state one step ago the same as this one." Making memory actually work isn't a matter of fixing this one call site; it means rewriting `simulate-trajectory` itself to track and pass along whatever extra history the new rule needs, and rewriting `distribution-step` too, since a *distribution* over "current state" alone is no longer enough information to predict what happens next once the next state can depend on more than that. This is precisely the real, structural cost this lesson's SE Lens named: memory isn't a small add-on to a Markov chain — the instant one state's transition probabilities depend on anything beyond the current state, the *whole* model, every procedure this lesson built, stops being valid and needs to be rebuilt around a larger state space instead.

### Exercises

- This lesson's model never lets `degraded` move directly back and forth with itself more than the given `3/10`, nor does it allow `down` to move directly to `degraded` at all — `trans-matrix`'s `down` row only ever goes to `healthy` or stays `down`. Add a small probability of `down` moving directly to `degraded` instead, renormalize that row so it still sums to exactly `1`, and confirm the new row-sum for real before touching anything else.
- `n-step-distribution (vector 1 0 0) 10` and `n-step-distribution (vector 1 0 0) 50` turn out to be very close to each other once converted to decimals. Compute both for real, compare them, and form a hypothesis about what's happening — this curriculum will return to exactly this kind of long-run behavior in a later lesson.
- Modify `simulate-trajectory` to also return how many of its steps were spent in each state, not just the sequence of states itself, and check the fractions against `n-step-distribution`'s own prediction for a trajectory of the same length.
- Build a second, unrelated Markov chain from scratch — a simple traffic light, `red`/`yellow`/`green`, with real transition probabilities you choose — and confirm its own transition matrix's rows sum to exactly `1` before simulating a single trajectory.

### Definition of Done

- [ ] `states`, `trans-matrix`, `weighted-pick`, `simulate-step`, `simulate-trajectory`, `distribution-step`, and `n-step-distribution` are all defined, all actually run in Guile this session, with real output pasted in for every claim.
- [ ] Every row of `trans-matrix` has been checked, with exact rational arithmetic, to sum to precisely `1`.
- [ ] The Markov property has been checked for real, not just argued structurally: a long trajectory's own "arrived fresh" versus "already there" next-state tallies have been compared and shown to agree.
- [ ] The exact ten-step distribution and a `100,000`-trial Monte Carlo simulation have been compared and shown to agree, to within ordinary sampling noise.
- [ ] The memory-dependent variant has been attempted for real, and the exact reason it doesn't fit into this lesson's existing procedures has been identified, not just asserted.
- [ ] `git commit` — a message explaining *why* the state depends only on the current state and never on history: it's not a simplification made for convenience, it's the one property that makes both `distribution-step`'s exact computation and the Markov property's own memorylessness check meaningful at all.
