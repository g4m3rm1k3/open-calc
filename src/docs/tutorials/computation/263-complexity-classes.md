# Lesson 263: Complexity Classes

**What you will build**: a real, `bb`-verified step counter and a real,
`bb`-verified space (memory) tracker, each threaded through this
curriculum's own Turing machine interpreter — turning "how expensive is
this?" from a vague feeling into two separate, precisely countable
numbers, one per run, for any machine and any input. Then, the actual
payoff: a real, measured demonstration that time and space are two
genuinely *independent* resources, not two names for the same thing, by
building a naive and a memoized Fibonacci function, running both for
real, and watching the exact real numbers move in opposite directions —
work goes down, memory goes up. The transferable problem this lesson is
actually about: **complexity class**, the idea of classifying a
*problem* — not one particular program — by the resources any solving
machine is forced to spend on it, as a function of input size.

**What you need to know first**: Lesson 253's fuel-bounded computation
technique — a counting-down `fuel` argument threaded through a recursive
computation so a real program can force a "give up" answer instead of
running forever. Lesson 259's Turing machine formalism — a machine as a
finite table of 5-element transitions plus a growable tape, with
`read-tape`/`write-tape`/`pad-tape` as the tape's own interface, and
`run-tm`/`run-tm-with-transition` as the interpreter that drives a
machine from a starting state to a verdict. Lesson 260's `accept-states`
argument, passed explicitly rather than hardcoded, so one interpreter
can run genuinely different machines. Lesson 262's verification-caching
convention: `read-tape`, `write-tape`, `pad-tape`, `find-transition`,
`matches-transition?`, `member?`, and `verdict-for` are already real,
`bb`-verified code sitting in `reference-implementation.clj`, reused here
unchanged and *not* re-verified from scratch — only this lesson's own new
code gets a fresh `bb` run. Lesson 91's `(declare ...)` pattern for
functions that call each other before both are defined. Lesson 96's
`heap-extract-min`, which established returning two genuinely different
results — a value and an updated structure — as one vector pair; this
lesson extends that same idea to a three-element `[value structure
count]` vector, the "multi-piece state threaded as one vector" pattern
from Lessons 96, 126, 130, and 133.

**Terms used in this lesson**:

- **Turing machine** — a hypothetical computing device with an infinite
  (here, growable) tape and a finite table of state transitions; the
  formal model this curriculum has used since Lesson 259 to make
  "algorithm" precise enough to measure, not just describe.
- **Transition table** — the list of 5-element rules encoding a
  machine's entire behavior: current state, symbol read, next state,
  symbol written, direction moved. It exists so a machine's *entire*
  behavior is one inspectable, finite piece of data, nothing hidden.
- **Tape** — the machine's read/write memory: a growable vector of
  symbols, blank (`"_"`) anywhere nothing has been written yet. It's
  what makes "how much memory did this computation actually use"
  something a real program can measure directly, cell by cell, instead
  of guessing.
- **Fuel-bounded computation** — a counting-down argument, decremented
  once per step, that forces a recursive computation to stop and report
  "gave up" rather than run forever on an input that might never finish.
  It exists because some computations (an unbounded search, a Turing
  machine that might never halt) cannot be trusted to stop on their own,
  and a real program still needs to return *something* rather than hang.
- **Asymptotic growth (Big-O notation)** — the practice of classifying
  how a function grows by its dominant term alone, deliberately ignoring
  constant multipliers and lower-order terms. It exists because those
  ignored details depend on incidental facts — which physical machine
  ran it, which minor optimization happened to apply — that say nothing
  about the *algorithm's* own shape, while the dominant term is the one
  thing that keeps mattering more and more as input size grows without
  bound.
- **Complexity class** — a set of *problems*, not a set of programs,
  grouped by a shared resource bound: "every problem solvable using at
  most this much of some resource." It exists to let a question be asked
  about a problem itself — what is the *best any possible algorithm*
  could do — rather than only about one specific program's measured
  performance, which might just be a bad implementation of a problem
  that's actually much easier.
- **Time complexity** — the number of individual computational steps a
  machine takes to solve a problem, expressed as a function of the
  *size* of the input, not the wall-clock time of any one run. It exists
  because wall-clock time depends on the speed of whatever physical
  hardware happens to be running the code that day; step count does not.
- **Space complexity** — the amount of working memory a computation
  actually uses at its *peak* during a run, also expressed as a function
  of input size. It exists for the same reason time complexity does —
  memory usage in bytes depends on incidental facts about one specific
  machine's data representation, while "how many symbols of tape did
  this computation ever need" does not.
- **TIME(f(n))** — a formal complexity class: the set of every language
  (decision problem) decidable by *some* Turing machine whose step
  count, on every input of length `n`, is at most `f(n)` times some
  constant. The constant-times tolerance is exactly Big-O's own
  constant-factor tolerance, applied here to name a *class of problems*
  instead of describing one function's growth.
- **SPACE(f(n))** — the same idea, using peak tape cells used instead of
  steps taken.
- **Memoization** — the technique of storing every subproblem's result
  the first time it is computed, in a table that later calls check
  first, so an identical subproblem asked again returns the stored
  answer instead of being recomputed from scratch. It exists because
  some recursive decompositions ask the exact same smaller question
  along more than one path, and recomputing an already-known answer is
  pure waste.
- **Overlapping subproblems** — when a recursive problem's own
  decomposition produces the identical smaller subproblem more than
  once, reached by different paths through the recursion. It's the
  precondition that makes memoization pay off at all: a recursion whose
  subproblems never repeat gains nothing from caching them, since
  nothing is ever asked twice.

**Objects and methods used**

- **`run-tm-counted` / `run-tm-counted-with-transition`**
  - *What it is:* this lesson's own new pair of mutually recursive
    functions — a variant of Lesson 259/260's `run-tm` that also counts
    and returns the real number of transitions taken.
  - *Implementation:* `run-tm-counted` takes the same six arguments as
    `run-tm` plus one more, `steps`; it returns a 4-element vector
    `[verdict final-state final-tape steps]` instead of `run-tm`'s
    3-element `[verdict final-state final-tape]`.
  - *Its use:* the concrete mechanism this unit builds — a real,
    printable number for "how much time did this computation cost."
- **`run-tm-spaced` / `run-tm-spaced-with-transition` /
  `run-tm-spaced-step`**
  - *What it is:* this lesson's own new trio of mutually recursive
    functions, symmetric to `run-tm-counted` but tracking peak tape
    length instead of step count.
  - *Implementation:* takes the same arguments as `run-tm` plus a
    `max-len` accumulator, seeded with the starting tape's own length;
    returns `[verdict final-state final-tape max-len]`.
  - *Its use:* the concrete mechanism for "how much memory did this
    computation ever actually use," measured the same disciplined way
    as time.
- **`fib-counted`**
  - *What it is:* a naive, unmemoized recursive Fibonacci function,
    instrumented to also count its own real recursive calls.
  - *Implementation:* returns `[fibonacci-value call-count]`.
  - *Its use:* establishes the real, measured baseline this unit's
    payoff compares against.
- **`memo-fib` and its helpers (`memo-lookup`, `memo-fib-store`,
  `memo-fib-finish`, `memo-fib-combine`, `memo-fib-base`,
  `memo-fib-compute-branch`, `memo-fib-compute`,
  `memo-fib-lookup-or-compute`)**
  - *What it is:* a memoized Fibonacci function built from the naive one
    by adding a real, threaded lookup table.
  - *Implementation:* the memo table is a vector of `[n value]` pairs;
    `memo-fib` returns `[fibonacci-value final-memo-table
    real-computation-count]`.
  - *Its use:* the actual demonstration — real numbers proving
    memoization trades measured space for measured time.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`read-tape`**
  - *What it is:* the tape's read operation from Lesson 259, reused
    unchanged.
  - *Implementation:* `(read-tape tape position)` returns the symbol at
    `position` if it exists in the tape vector, or the blank symbol
    `"_"` if `position` is past the tape's current end — a real Clojure
    `if` comparing `position` against `(count tape)`.
  - *Its use:* every step of `run-tm-counted`/`run-tm-spaced` reads the
    current tape cell through this, exactly as `run-tm` always has.
- **`write-tape`**
  - *What it is:* the tape's write operation from Lesson 259, reused
    unchanged.
  - *Implementation:* `(write-tape tape position symbol)` first pads the
    tape out to at least `position + 1` cells with blanks (via
    `pad-tape`), then `assoc`s the new symbol in at `position` —
    genuinely growing the tape only when a write actually reaches past
    its current end.
  - *Its use:* every step of both new interpreters writes through this;
    it's also the thing whose *effect on tape length* `run-tm-spaced`
    measures.
- **`pad-tape`**
  - *What it is:* the tape-growing helper from Lesson 259, reused
    unchanged.
  - *Implementation:* recursively `conj`s blank cells onto the tape
    until it reaches at least the requested `length`.
  - *Its use:* called by `write-tape`, never called directly by this
    lesson's own new code.
- **`find-transition`**
  - *What it is:* the transition-table lookup from Lesson 259, reused
    unchanged.
  - *Implementation:* recursively scans the transition list, returning
    the first entry whose state and symbol both match via
    `matches-transition?`, or `nil` if the table has nothing for this
    combination.
  - *Its use:* every step of both new interpreters calls this once to
    decide what happens next; a `nil` result is exactly how a machine
    halts in this curriculum's model.
- **`matches-transition?`**
  - *What it is:* the single-transition predicate from Lesson 259,
    reused unchanged.
  - *Implementation:* `(and (= (get transition 0) state) (= (get
    transition 1) symbol))` — true only when both the state and the
    symbol match this specific transition's first two slots.
  - *Its use:* the actual comparison `find-transition` calls on each
    candidate transition.
- **`member?`**
  - *What it is:* the list-membership check from Lesson 259, reused
    unchanged.
  - *Implementation:* recursively walks a collection, returning `true`
    the moment it finds an element equal to the target, `false` if the
    collection runs out first.
  - *Its use:* the mechanism `verdict-for` uses to check whether the
    machine's final state is in the accept set.
- **`verdict-for`**
  - *What it is:* the accept/reject decision from Lesson 260, reused
    unchanged.
  - *Implementation:* `(if (member? state accept-states) "accept"
    "reject")`.
  - *Its use:* both new interpreters call this exactly once, at the
    moment a `nil` transition signals the machine has halted.

---

## Concept Unit: Time as a Countable Resource

### The Problem

Every lesson so far has talked about "how expensive" some code is only
informally — a passing "this scans the whole list" or "this only checks
one cell." That's a real observation, but it's never been turned into an
actual number a real program produces. Before "time" can be treated as a
resource — something with a measurable cost, tradeable against other
resources — there has to be an honest, agreed-on unit of work to count
in the first place, and a real mechanism for counting it.

### Introduce the Concept, Isolated

A throwaway, disposable function — nothing to do with Turing machines,
never reused after this section:

```clojure
(defn countdown-counted [n steps]
  (if (= n 0)
    steps
    (countdown-counted (- n 1) (inc steps))))
```

Run it:

```
user=> (countdown-counted 5 0)
5
user=> (countdown-counted 12 0)
12
```

This proves that an ordinary extra argument, incremented by exactly one
at exactly one place in the code, turns "how much work happened" into a
real, printable number — here, the number of recursive calls it took to
count down from `n` to `0`. This technique is called **instrumentation**:
adding code whose only purpose is to measure the computation, without
changing what the computation actually returns as its real answer.
`countdown-counted`'s real "answer" (`steps`, which happens to equal `n`
here) is a coincidence of this specific toy example — the technique
itself is what matters, and it works the same way no matter what the
underlying computation is actually doing.

### Discard the Throwaway Example

`countdown-counted` is deleted here. It never appears in this lesson's
real code again — only the instrumentation *technique* it demonstrated
carries forward.

### Project Change

- **Reference Source**: No reference counterpart — this is a
  from-scratch addition because no earlier lesson has needed to count a
  Turing machine's own steps.
- **Files affected**: None (standalone lesson script, per the Section
  VI+ convention).
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `read-tape`,
  `write-tape`, `find-transition`, `verdict-for` from
  `reference-implementation.clj`'s cached, already-verified Section XII
  core.

### The New Code

Apply the exact instrumentation technique just proven — one extra
argument, incremented once, at the one place real work happens — to
Lesson 259's own `run-tm`/`run-tm-with-transition` pair:

```clojure
(defn run-tm-counted [transitions state tape position accept-states fuel steps]
  (if (= fuel 0)
    ["exhausted" state tape steps]
    (run-tm-counted-with-transition transitions state accept-states tape position fuel steps
                                     (find-transition transitions state (read-tape tape position)))))

(defn run-tm-counted-with-transition [transitions state accept-states tape position fuel steps transition]
  (if (nil? transition)
    [(verdict-for state accept-states) state tape steps]
    (run-tm-counted transitions
                     (get transition 2)
                     (write-tape tape position (get transition 3))
                     (if (= (get transition 4) "R") (inc position) (dec position))
                     accept-states
                     (dec fuel)
                     (inc steps))))
```

### The Updated Project

Skipped — no enclosing file exists yet; this pair is the whole new
structure, with nothing surrounding it to show it inside.

### Mechanical Walkthrough

Every distinct syntactic element in both functions, in order:

- **`(defn run-tm-counted [transitions state tape position accept-states fuel steps] ...)`**
  — defines a 7-argument function, one more argument than Lesson 259's
  `run-tm`. The new argument, `steps`, is this unit's entire reason for
  existing: a running count of real transitions taken so far, threaded
  the same way `fuel`, `position`, and every other piece of machine
  state already is.
- **`(if (= fuel 0) ... ...)`** — the same fuel-exhaustion check Lesson
  253 introduced and Lesson 259 reused: if the counting-down `fuel`
  argument has reached exactly `0`, this run gives up rather than risk
  never stopping.
- **`["exhausted" state tape steps]`** — a 4-element vector literal, one
  element longer than Lesson 259's 3-element `["exhausted" state tape]`.
  The extra `steps` slot is what makes this unit's whole point real:
  even a run that gives up still reports exactly how much work it did
  before giving up, not just that it gave up.
- **`(run-tm-counted-with-transition transitions state accept-states tape position fuel steps (find-transition transitions state (read-tape tape position)))`**
  — calls the sibling function, passing every current piece of state
  through unchanged plus the freshly looked-up transition.
  `find-transition` and `read-tape` are both reused exactly as Lesson
  259 built them, computing "what should happen next" without yet
  committing to it.
- **`(if (nil? transition) ... ...)`** — `nil?` checks whether
  `find-transition` found a matching rule at all; per this curriculum's
  own model, a machine halts precisely when no transition matches the
  current state and symbol, so a `nil` result here is the halting
  condition itself, not an error.
- **`[(verdict-for state accept-states) state tape steps]`** — the halt
  case's own 4-element result: the accept/reject verdict from
  `verdict-for`, the final state, the final tape, and — the new part —
  however many real transitions it took to get here.
- **`(run-tm-counted transitions (get transition 2) (write-tape tape position (get transition 3)) (if (= (get transition 4) "R") (inc position) (dec position)) accept-states (dec fuel) (inc steps))`**
  — the recursive step, identical to Lesson 259's own `run-tm`'s
  recursive call in every argument except the last: `(inc steps)`
  instead of nothing. `(get transition 2)` reads the transition's
  next-state slot; `(write-tape tape position (get transition 3))`
  writes the transition's write-symbol slot onto the tape at the
  current position; the nested `if` on `(get transition 4)` moves
  `position` right (`inc`) or left (`dec`) depending on the
  transition's direction slot; `(dec fuel)` spends one unit of the
  fuel budget, exactly as it always has. `(inc steps)` is the one new
  piece: every single transition actually taken increments the real
  step count by exactly one, at the one place in the code where a
  transition is actually taken — nowhere else, so nothing is ever
  double-counted or skipped.

### CS Lens

This is the formal definition of **time complexity**: not "how long the
program felt like it took," but the number of individual transitions a
specific Turing machine takes on a specific input — a number as exact
and countable as `run-tm-counted`'s own `steps` result. From this, the
class **TIME(f(n))** can be defined precisely for the first time: the set
of every language decidable by *some* Turing machine whose step count,
on every input of length `n`, never exceeds `f(n)` times some constant —
the same constant-factor tolerance Big-O notation already established,
now naming a class of *problems* rather than describing one function's
growth. Also recognized in: a database query planner's own "estimated
cost" number, a CPU's published cycle-count-per-instruction tables, a
network protocol's round-trip counting, and every algorithms textbook's
habit of counting "basic operations" instead of trusting a stopwatch.

### SE Lens

The alternative not chosen here is wall-clock timing — literally
starting a clock, running the code, and reading how many milliseconds
elapsed (the same technique Lesson 256 actually used, for a different,
legitimate reason: measuring real backtracking cost on one specific
machine, at one specific moment). Wall-clock timing is *easier* to add,
but it bakes in whatever the current machine happens to be doing at that
moment — background processes, one CPU running hot, a garbage collection
pass landing mid-measurement — none of which has anything to do with the
algorithm's own real cost. Counting actual transitions, the way
`run-tm-counted` does, produces the identical number every single time,
on any machine, because it counts the computation's own structure rather
than borrowing a clock from whatever hardware happens to be nearby. The
real cost of this approach: it only works because this curriculum
already has a single, unambiguous, agreed-on "one step" (one Turing
machine transition) to count — ordinary Clojure code has no such
built-in unit, which is exactly why Unit 3, later in this lesson,
instruments *calls* instead of transitions, an honest, slightly
different choice made explicit rather than left silent.

### Commands

None new — this unit runs entirely inside the same `bb` REPL/script
workflow already established since Lesson 214.

### Run It — Real Output

```
user=> (def parity-transitions
         [["even" "0" "even" "0" "R"] ["even" "1" "odd" "1" "R"]
          ["odd" "0" "odd" "0" "R"] ["odd" "1" "even" "1" "R"]])
user=> (run-tm-counted parity-transitions "even" ["1" "1"] 0 ["even"] 20 0)
["accept" "even" ["1" "1"] 2]
user=> (run-tm-counted parity-transitions "even" ["1" "1" "1"] 0 ["even"] 20 0)
["reject" "odd" ["1" "1" "1"] 3]
user=> (run-tm-counted parity-transitions "even" ["1" "1" "1" "1"] 0 ["even"] 20 0)
["accept" "even" ["1" "1" "1" "1"] 4]
user=> (run-tm-counted parity-transitions "even" ["1" "1" "1" "1" "1" "1"] 0 ["even"] 20 0)
["accept" "even" ["1" "1" "1" "1" "1" "1"] 6]
```

`parity-transitions` is exactly Lesson 260's own cached, already-verified
parity-checking machine, reused unchanged. The real numbers are exact
and honest: an input of length `2` costs `2` real steps; length `3`
costs `3`; length `4` costs `4`; length `6` costs `6` — this specific
machine's step count is *exactly* its input length, every single time,
which is what it means, concretely, for this machine's own time
complexity to be `TIME(n)`.

### Connecting Back

`run-tm-counted` turns "this machine is fast" from a feeling into a real
number this lesson can now compare — the next unit does the identical
thing for memory instead of time.

---

## Concept Unit: Space as a Countable Resource

### The Problem

Time isn't the only thing a computation can run out of. A real machine
also has finite memory, and "this uses more memory" deserves the exact
same honest treatment time just got — a real, countable number, not a
feeling, produced by a real instrumented run rather than asserted.

### Introduce the Concept, Isolated

A second throwaway function, unrelated to Turing machines, never reused
after this section:

```clojure
(defn max-of [a b] (if (> a b) a b))

(defn depth-tracked [n depth max-depth]
  (if (= n 0)
    max-depth
    (depth-tracked (- n 1) (+ depth 1) (max-of max-depth (+ depth 1)))))
```

Run it:

```
user=> (depth-tracked 5 0 0)
5
```

This proves a second, related technique: instead of a count that only
ever goes up (like `steps` in Unit 1), tracking the *peak* of some
quantity that goes up and down over a computation requires comparing the
new value against the best-seen-so-far value at every step and keeping
the larger one. This is called a **running maximum**, or **high-water
mark** — the name comes from a literal flood gauge, marking the highest
water level ever reached even after the water recedes. `max-of` is the
one-line comparison this technique is built on; `depth-tracked` applies
it at every recursive call.

### Discard the Throwaway Example

`depth-tracked` is deleted here. Only the high-water-mark *technique* —
compare, keep the larger, thread it forward — carries into this
lesson's real code. `max-of` is small and general enough to survive as a
real helper, reused below.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, for the
  same reason as Unit 1: no earlier lesson measured a Turing machine's
  own peak tape usage.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka; the same cached core functions Unit 1
  reused.

### The New Code

```clojure
(defn run-tm-spaced [transitions state tape position accept-states fuel max-len]
  (if (= fuel 0)
    ["exhausted" state tape max-len]
    (run-tm-spaced-with-transition transitions state accept-states tape position fuel max-len
                                    (find-transition transitions state (read-tape tape position)))))

(defn run-tm-spaced-with-transition [transitions state accept-states tape position fuel max-len transition]
  (if (nil? transition)
    [(verdict-for state accept-states) state tape max-len]
    (run-tm-spaced-step transitions transition state accept-states position fuel max-len
                         (write-tape tape position (get transition 3)))))

(defn run-tm-spaced-step [transitions transition state accept-states position fuel max-len new-tape]
  (run-tm-spaced transitions
                  (get transition 2)
                  new-tape
                  (if (= (get transition 4) "R") (inc position) (dec position))
                  accept-states
                  (dec fuel)
                  (max-of max-len (count new-tape))))
```

### The Updated Project

Skipped — no enclosing file exists yet; this trio is the whole new
structure.

### Mechanical Walkthrough

- **`(defn run-tm-spaced [transitions state tape position accept-states fuel max-len] ...)`**
  — a 7-argument function shaped like `run-tm-counted`, but `max-len`
  replaces `steps`: instead of counting up by a fixed amount every step,
  it tracks the largest tape length seen at any point in the run.
- **`(if (= fuel 0) ["exhausted" state tape max-len] ...)`** — the same
  fuel-exhaustion halt as Unit 1, reporting the peak tape length reached
  before giving up, not just that it gave up.
- **`(run-tm-spaced-with-transition ... (find-transition transitions state (read-tape tape position)))`**
  — looks up what should happen next, exactly as `run-tm-counted` does,
  reusing `find-transition`/`read-tape` unchanged.
  - **`(if (nil? transition) [(verdict-for state accept-states) state tape max-len] ...)`**
  — the halt case, reporting the final peak tape length alongside the
  verdict, symmetric to Unit 1's own `steps`-reporting halt case.
- **`(run-tm-spaced-step transitions transition state accept-states position fuel max-len (write-tape tape position (get transition 3)))`**
  — computes the transition's new tape *first*, as `new-tape`, before
  deciding whether it set a new peak — the actual reason this unit is
  split into three functions instead of two: `run-tm-spaced-step` exists
  specifically to hold `new-tape` as a real value so it can be measured
  once and reused, rather than being written twice (once to pass on,
  once to measure) and risking those two writes ever disagreeing.
- **`(run-tm-spaced transitions (get transition 2) new-tape (if (= (get transition 4) "R") (inc position) (dec position)) accept-states (dec fuel) (max-of max-len (count new-tape)))`**
  — the recursive step: state, tape, and position advance exactly as
  `run-tm-counted`'s do, `(dec fuel)` spends the fuel budget the same
  way, and `(max-of max-len (count new-tape))` is the one genuinely new
  piece — `count` measures `new-tape`'s real current length, and
  `max-of`, reused from this unit's own throwaway lab, keeps whichever
  of the old peak or this new length is larger. Nothing here ever
  *decreases* `max-len`, by construction — a high-water mark, once set,
  can only be matched or exceeded, never walked back down, exactly like
  the real flood gauge the name comes from.

### CS Lens

This is the formal definition of **space complexity**: the largest
amount of tape a machine ever actually uses during one run, as a
function of input length — giving **SPACE(f(n))** the identical formal
shape as Unit 1's `TIME(f(n))`, substituting peak tape cells for step
count. Also recognized in: a database's own "peak memory" query-planner
statistic, a video game's texture-memory budget, a phone OS killing the
largest-resident background app first, and any embedded system's fixed,
non-negotiable RAM ceiling.

### SE Lens

The alternative not chosen: measuring only the *final* tape length,
which would be far simpler code — no running maximum, no `max-of`, just
`(count tape)` at the moment of halting. That number would be wrong for
this exact purpose: a computation can genuinely grow its working memory
far larger in the middle of a run than it ends up needing at the end
(a sort that builds a large temporary buffer before collapsing back down
to a small final result is the classic real case), and a system that
only tracks final size would be blind to a real memory spike that could
have crashed it hours before the run finished. The real cost paid here:
`run-tm-spaced` needs a third function (`run-tm-spaced-step`) that
`run-tm-counted` didn't need, purely to avoid computing `new-tape` twice
— a small, honest complexity increase, taken on specifically because
peak tracking is a strictly harder question than "how many steps
happened," and pretending otherwise would have produced silently wrong
numbers.

### Commands

None new.

### Run It — Real Output

```
user=> (run-tm-spaced parity-transitions "even" ["1" "1"] 0 ["even"] 20 (count ["1" "1"]))
["accept" "even" ["1" "1"] 2]
user=> (run-tm-spaced parity-transitions "even" ["1" "1" "1" "1"] 0 ["even"] 20 (count ["1" "1" "1" "1"]))
["accept" "even" ["1" "1" "1" "1"] 4]
user=> (run-tm-spaced parity-transitions "even" ["1" "1" "1" "1" "1" "1"] 0 ["even"] 20 (count ["1" "1" "1" "1" "1" "1"]))
["accept" "even" ["1" "1" "1" "1" "1" "1"] 6]
```

For this specific machine, on these specific inputs, peak tape length
turns out to equal input length exactly — the same real numbers Unit 1's
`steps` produced. That's not a coincidence to gloss over: this parity
machine reads straight through its tape once, left to right, writing
back the exact symbol it read at every cell, so it never touches more
cells than the input already had, and it takes exactly one step per
cell. For *this* machine, `TIME(n)` and `SPACE(n)` genuinely coincide.
That is not a general law — it's a property of this one simple,
single-pass machine — and the next unit builds a real case where time
and space pull apart from each other by orders of magnitude.

### Connecting Back

Time and space now both have real, `bb`-verified numbers behind them,
measured the identical disciplined way. The next unit asks the question
this one's closing paragraph just raised: are they always this tightly
coupled, or can a real program trade one for the other?

---

## Concept Unit: Trading Time for Space, for Real

### The Problem

Units 1 and 2 measured time and space for the same machine on the same
inputs, and they moved together — not a general fact, just what that one
machine happened to do. The real, useful question complexity theory asks
is sharper: can a program that's too slow ever be made faster by
spending *more* memory instead — and, if so, exactly how much of each,
in real, countable numbers, not a vague "it's a tradeoff" gesture?

Naive recursive Fibonacci is where this shows up starkly. Computing
`fib(n)` by definition — `fib(n) = fib(n-1) + fib(n-2)` — asks for
`fib(n-2)` twice: once directly, and once again *inside* the recursive
call that computes `fib(n-1)`, which itself needs `fib(n-2)` on its own
path back down to the base case. Every one of those repeated asks
triggers a full, independent re-computation, and the repetition compounds
at every level of the recursion.

### Introduce the Concept, Isolated

This lesson's real code already *is* the smallest way to show the
problem honestly — Fibonacci's overlapping subproblems don't show up in
a smaller toy without losing the actual point, so the "isolated" version
and the real project code are the same functions here, following the
established, honest precedent set once concept isolation and real
project code fully coincide (the norm since roughly Lesson 130):

```clojure
(defn fib-counted [n]
  (if (< n 2)
    [n 1]
    (fib-counted-combine (fib-counted (- n 1)) (fib-counted (- n 2)))))

(defn fib-counted-combine [left right]
  [(+ (get left 0) (get right 0)) (+ (get left 1) (get right 1) 1)])
```

Run it:

```
user=> (fib-counted 10)
[55 177]
user=> (fib-counted 15)
[610 1973]
user=> (fib-counted 20)
[6765 21891]
```

`fib-counted` reuses Unit 1's own instrumentation technique — an
accumulated count, this time counting real function calls instead of TM
transitions, returned alongside the real answer as a pair (Lesson 96's
`heap-extract-min` pattern). The real numbers prove the problem is not
theoretical: computing `fib(20)` correctly (`6765`, verified against the
well-known sequence) costs `21891` real recursive calls — not `20`, not
`40`, but a number more than a thousand times larger than `n` itself.
This growth is called **exponential**: each `+1` to `n` roughly doubles
the call count, because each call spawns two more calls, and that
doubling compounds at every level down to the base case.

### Discard the Throwaway Example

Not applicable — `fib-counted` is real, reusable, hand-verified-then-`bb`-confirmed
project code, following the precedent set once the isolated demo and the
real code stopped needing to be two different things (Lesson 130
onward).

### Project Change

- **Reference Source**: No reference counterpart — from-scratch, because
  this problem (overlapping subproblems, and the memoization technique
  that answers it) has never come up in this curriculum before.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka.

### The New Code

The fix reuses `fib-counted`'s own recursive shape, adding a threaded
lookup table (a **memo**) that's checked *before* any recursive work
happens, and updated the moment a genuinely new subproblem gets solved:

```clojure
(defn memo-lookup [memo n]
  (if (empty? memo)
    nil
    (if (= (get (first memo) 0) n)
      (get (first memo) 1)
      (memo-lookup (rest memo) n))))

(defn memo-fib-store [n value memo steps]
  [value (conj memo [n value]) steps])

(defn memo-fib-finish [n left-value right-result]
  (memo-fib-store n (+ left-value (get right-result 0)) (get right-result 1) (get right-result 2)))
```

Run the new piece against a tiny, already-understood case before it
meets real project scale:

```
user=> (memo-lookup [] 3)
nil
user=> (memo-lookup [[1 1] [2 1]] 2)
1
```

`memo-lookup` correctly reports "not found" (`nil`) against an empty
memo, and correctly finds `2`'s stored value (`1`) once it's actually
present — the two smallest cases the real project code below depends on
behaving correctly.

### The Updated Project

The remaining pieces complete `memo-fib` — shown whole, since nothing
here modifies a prior structure, it's all new:

```clojure
(declare memo-fib)

(defn memo-fib-combine [n left-result]
  (memo-fib-finish n (get left-result 0) (memo-fib (- n 2) (get left-result 1) (get left-result 2))))

(defn memo-fib-base [n memo steps]
  [n (conj memo [n n]) steps])

(defn memo-fib-compute-branch [n memo steps]
  (if (< n 2)
    (memo-fib-base n memo steps)
    (memo-fib-combine n (memo-fib (- n 1) memo steps))))

(defn memo-fib-compute [n memo steps]
  (memo-fib-compute-branch n memo (inc steps)))

(defn memo-fib-lookup-or-compute [n memo steps cached]
  (if (nil? cached)
    (memo-fib-compute n memo steps)
    [cached memo steps]))

(defn memo-fib [n memo steps]
  (memo-fib-lookup-or-compute n memo steps (memo-lookup memo n)))
```

Together, these nine small functions (`memo-lookup`, `memo-fib-store`,
`memo-fib-finish`, `memo-fib-combine`, `memo-fib-base`,
`memo-fib-compute-branch`, `memo-fib-compute`,
`memo-fib-lookup-or-compute`, and `memo-fib` itself) form one complete,
callable unit: call `memo-fib` with an `n`, a memo (starting empty,
`[]`), and a starting step count (`0`), and it returns `[value
final-memo real-computation-count]`.

### Mechanical Walkthrough

- **`(declare memo-fib)`** — Lesson 91's forward-declaration pattern,
  needed here because `memo-fib-combine`, defined next, calls `memo-fib`
  before `memo-fib` itself is defined later in the file; this is
  genuine mutual recursion, the same shape as Lesson 91's
  `binary-search`/`search-at-mid` — `memo-fib` calls
  `memo-fib-lookup-or-compute`, which can call `memo-fib-compute`, which
  can call back into `memo-fib` itself for a smaller `n`.
- **`(memo-fib-finish n (get left-result 0) (memo-fib (- n 2) (get left-result 1) (get left-result 2)))`**
  in `memo-fib-combine` — this is the entire reason memoization actually
  works here, not just decoration. `left-result` is the 3-element
  `[value memo steps]` triple that came back from computing `fib(n-1)`.
  `(get left-result 1)` pulls out *that call's own updated memo* — a
  table that may already contain `fib(n-2)`'s answer, since computing
  `fib(n-1)` almost always needs `fib(n-2)` somewhere along its own
  recursion — and threads that exact memo forward into the `fib(n-2)`
  call this line makes. If `fib(n-2)` was already computed and cached
  while computing `fib(n-1)`, `memo-lookup` (inside the recursive
  `memo-fib` call) finds it immediately and no further recursion
  happens at all.
- **`(defn memo-fib-base [n memo steps] [n (conj memo [n n]) steps])`**
  — the base case for `n < 2`: Fibonacci's own definition says `fib(0) =
  0` and `fib(1) = 1`, so the value *is* `n` itself. `(conj memo [n n])`
  stores this base fact in the memo too — a `[n n]` pair — so a later
  call asking for this exact `n` again finds it cached rather than
  re-deriving it, even though re-deriving a base case costs almost
  nothing on its own.
- **`(defn memo-fib-compute-branch [n memo steps] (if (< n 2) (memo-fib-base n memo steps) (memo-fib-combine n (memo-fib (- n 1) memo steps))))`**
  — the actual "how do I compute this from nothing" logic, reached only
  when the memo doesn't already have an answer: base case for `n < 2`,
  otherwise compute `fib(n-1)` first (threading the *current* memo into
  it) and hand the resulting triple to `memo-fib-combine`, which is
  where the `n-2` call and its shared-memo trick, explained above,
  happens.
- **`(defn memo-fib-compute [n memo steps] (memo-fib-compute-branch n memo (inc steps)))`**
  — wraps `memo-fib-compute-branch`, incrementing `steps` exactly once,
  at exactly the one place a *genuinely new* computation is about to
  happen (as opposed to a cache hit, which does no new work at all).
  This is `steps`'s entire job in this unit: count real computations,
  not cache lookups.
- **`(defn memo-fib-lookup-or-compute [n memo steps cached] (if (nil? cached) (memo-fib-compute n memo steps) [cached memo steps]))`**
  — the actual decision point: if `memo-lookup` found nothing (`cached`
  is `nil`), do the real work via `memo-fib-compute`; if it found a
  value, return `[cached memo steps]` immediately — the memo and the
  step count both pass through completely untouched, because a cache
  hit, by definition, does no new work and stores nothing new.
- **`(defn memo-fib [n memo steps] (memo-fib-lookup-or-compute n memo steps (memo-lookup memo n)))`**
  — the entry point: check the memo for `n` first, via `memo-lookup`,
  before deciding anything else. Every single call to `memo-fib`, at
  every level of recursion, starts here — which is exactly what makes
  the cache-hit shortcut reachable from *any* recursive path, not just
  the outermost call.

### CS Lens

This is a real, measured demonstration of **overlapping subproblems**
and the **memoization** that exploits them — a hard concept, not routine
syntax. Also recognized in: a web browser's HTTP cache (never re-fetch a
URL whose response is still fresh), Lesson 223's own database index
(paying storage space up front so a later lookup doesn't repeat a full
scan), a compiler's constant-folding pass reusing an already-computed
value instead of recomputing it at every use site, and any spreadsheet
that recalculates only the cells that actually changed instead of the
entire sheet from scratch.

### SE Lens

The alternative not chosen — leaving `fib-counted` as-is and simply
running it on faster hardware — doesn't touch the actual problem:
exponential growth eventually outpaces *any* fixed speedup, since
doubling the clock speed only buys one more `n` before the same wall is
hit again. Memoization is a real, structural change to the algorithm
itself, and it has a real, honest cost: `memo-fib` is more code
(`9` small functions, versus `fib-counted`'s `2`), it uses genuinely more
memory (a table growing to hold every distinct subproblem ever solved),
and unlike `fib-counted`, its running time now depends on the *order*
subproblems happen to be asked in — the "what breaks" section below
shows exactly what goes wrong when that order isn't threaded correctly.
No lesson has needed this tradeoff before now; this is the first time in
the curriculum trading real, measured space for real, measured time is
the entire point of a unit.

### Commands

None new.

### Run It — Real Output

```
user=> (memo-fib 10 [] 0)
[55 [[1 1] [0 0] [2 1] [3 2] [4 3] [5 5] [6 8] [7 13] [8 21] [9 34] [10 55]] 11]
user=> (memo-fib 15 [] 0)
[610 [[1 1] [0 0] [2 1] [3 2] [4 3] [5 5] [6 8] [7 13] [8 21] [9 34] [10 55] [11 89] [12 144] [13 233] [14 377] [15 610]] 16]
user=> (memo-fib 20 [] 0)
[6765 [[1 1] [0 0] [2 1] [3 2] [4 3] [5 5] [6 8] [7 13] [8 21] [9 34] [10 55] [11 89] [12 144] [13 233] [14 377] [15 610] [16 987] [17 1597] [18 2584] [19 4181] [20 6765]] 21]
user=> (count (get (memo-fib 20 [] 0) 1))
21
```

The real numbers, side by side:

| `n` | `fib-counted` calls | `memo-fib` real computations | memo table size |
|-----|---------------------|-------------------------------|------------------|
| 10  | 177                 | 11                             | 11               |
| 15  | 1973                | 16                             | 16               |
| 20  | 21891               | 21                             | 21               |

`memo-fib(20)`'s real computation count is `21`, exactly `n + 1` — one
real computation per distinct subproblem from `fib(0)` through `fib(20)`,
each one computed exactly once, ever. Against `fib-counted(20)`'s
`21891` real calls, that's roughly a thousandfold reduction in real,
measured work — bought with a real, measured `21`-entry memo table that
`fib-counted` never needed to build at all. Time went down by three
orders of magnitude; space went up from zero extra structure to a real,
`bb`-counted `21` entries. Neither number is asserted — both came from
the exact same `bb` run.

### Connecting Back

Time and space, both formally defined and both real, `bb`-verified
numbers across this lesson's three units, just moved in *opposite*
directions on the identical problem — the concrete proof that they are
two genuinely independent, tradeable resources, not two names for the
same underlying cost.

---

## Connect the Pieces

One thread, start to finish: `run-tm-counted`, built in Unit 1 by adding
a single incrementing argument to Lesson 259's own `run-tm`, gave a real
number — `2` steps for a length-`2` input, `6` for length-`6` — to
something this curriculum had only ever described informally before.
`run-tm-spaced`, Unit 2's symmetric twin, gave `SPACE(f(n))` the same
real, `bb`-verified treatment, and for the parity machine those two real
numbers happened to coincide (`2` steps and `2` peak tape cells for the
same input), which honestly raised the question Unit 3 answers: are time
and space *always* coupled like that? `fib-counted`, instrumented with
Unit 1's own accumulator technique, proved the answer is no — `21891`
real calls to compute `fib(20)`, a number `fib-counted`'s own code, not
a claim, produced. `memo-fib` then traded space for time on that exact
same problem: `21` real computations instead of `21891`, paid for with a
real `21`-entry memo table `fib-counted` never needed. Every number in
this lesson — `2`, `6`, `177`, `21891`, `11`, `21` — came from a real
`bb` run, not an assertion, which is the entire point: "time and space
are resources" stops being a slogan the moment both are things a real
program can actually count.

## What Breaks Without This

Memoization's real speedup depends entirely on one specific line inside
`memo-fib-combine`: threading `(get left-result 1)` — the memo *updated
by the `fib(n-1)` call* — forward into the `fib(n-2)` call. Break exactly
that, and nothing else:

```clojure
(defn memo-fib-combine-broken [n original-memo left-result]
  (memo-fib-finish n (get left-result 0) (memo-fib-broken (- n 2) original-memo (get left-result 2))))

(defn memo-fib-compute-branch-broken [n memo steps]
  (if (< n 2)
    (memo-fib-base n memo steps)
    (memo-fib-combine-broken n memo (memo-fib-broken (- n 1) memo steps))))

(defn memo-fib-compute-broken [n memo steps]
  (memo-fib-compute-branch-broken n memo (inc steps)))

(defn memo-fib-lookup-or-compute-broken [n memo steps cached]
  (if (nil? cached)
    (memo-fib-compute-broken n memo steps)
    [cached memo steps]))

(defn memo-fib-broken [n memo steps]
  (memo-fib-lookup-or-compute-broken n memo steps (memo-lookup memo n)))
```

`memo-fib-combine-broken` takes the *original* memo — the one that
existed *before* the `fib(n-1)` call even started — and threads that
stale, un-updated memo into the `fib(n-2)` call instead of the one
`fib(n-1)` actually produced. It still checks a memo on every call
(`memo-fib-broken` still calls `memo-lookup` first, exactly like the
correct version), and it still builds up a real memo table as it goes —
it *looks* like memoization, right up until it's actually run:

```
user=> (memo-fib-broken 10 [] 0)
[55 [[0 0] [2 1] [4 3] [6 8] [8 21] [10 55]] 177]
user=> (memo-fib-broken 20 [] 0)
[6765 [[0 0] [2 1] [4 3] [6 8] [8 21] [10 55] [12 144] [14 377] [16 987] [18 2584] [20 6765]] 21891]
```

`177` and `21891` — `memo-fib-broken(20)`'s real computation count is not
merely worse than `memo-fib`'s `21`, it is *exactly* `fib-counted(20)`'s
own naive count, digit for digit. The memo table it built is real (it
even has fewer entries than the correct version's, because it only ever
caches at even-indexed levels of the recursion where a sibling's stale
memo happened not to matter) — but the sharing that made the real
speedup possible never happens, at any level, because every subtree's
own accumulated work gets silently discarded the moment its sibling
starts. Restoring the correct version — threading `(get left-result 1)`,
not `original-memo`, into the second recursive call — is the single line
that separates `21` real computations from `21891`.

## Exercises

1. Run `run-tm-counted` against the identical parity machine on an input
   of length `8`. Predict the step count first, then confirm it matches.
2. Build `run-tm-counted`'s missing sibling for a *different* machine:
   reuse Lesson 260's own contains-a-`1` checker (built with the same
   `accept-states`-as-argument technique), and confirm its step count
   also equals its input length.
3. `memo-fib` currently starts every top-level call with an empty memo
   (`[]`). Call `memo-fib` a second time, reusing the *first* call's own
   returned memo as the second call's starting memo, for a smaller `n`
   than the first call used. Confirm the second call's own real
   computation count drops to `0` or `1` — proving a memo genuinely
   persists useful work across separate calls, not just within one.
4. State, in your own words, why `memo-fib-broken`'s real computation
   count came out *exactly* equal to `fib-counted`'s, rather than
   somewhere in between. (Hint: trace, by hand, what memo
   `memo-fib-broken` actually passes into the `fib(n-2)` call at the
   very top level, versus what it passes at every level *beneath* that
   one — does any level's own sibling call ever see another sibling's
   real work?)

## Definition of Done

- [ ] `run-tm-counted` and `run-tm-spaced` both run correctly against the
      cached parity machine, matching the real `bb` output shown above
      for inputs of length `2`, `3`, `4`, and `6`.
- [ ] `fib-counted` produces the real, verified call counts shown above
      (`177` for `n=10`, `1973` for `n=15`, `21891` for `n=20`).
- [ ] `memo-fib` produces the real, verified computation counts shown
      above (`11`, `16`, `21`), each exactly `n + 1`.
- [ ] The broken-threading version, `memo-fib-broken`, reproduces the
      real, exact `21891`-call regression shown above — matching
      `fib-counted`'s own naive count digit for digit.
- [ ] You can state, without looking back at this lesson, the formal
      definitions of `TIME(f(n))` and `SPACE(f(n))`, and explain why the
      parity machine's own time and space happened to coincide while
      naive and memoized Fibonacci's did not.
- [ ] Commit: *"Add time and space instrumentation to the TM interpreter,
      and a real memoized Fibonacci, so complexity classes have real,
      countable numbers behind them instead of asserted growth rates."*
