# Lesson 162: Sampling Without Bias — Deriving Random Sampling Algorithms

**What you will build.** Three real, working procedures for picking random items out of a population — `sample-with-replacement`, `sample-without-replacement`, and `reservoir-sample` — each solving a genuinely different version of "pick k at random," and each derived, proved, and verified from scratch rather than looked up. The transferable problem underneath all three: every one of them has to guarantee *uniformity* — every eligible outcome exactly equally likely — and "it looks random" is never good enough evidence that it actually is; this lesson insists on either an exact algebraic proof or a real, measured frequency check for every claim it makes.

**What you need to know first.** Lesson 146 (Why Probability Appears in Computing) for why randomness enters an algorithm's design at all. Lessons 147–151 (Sample Spaces, Events, Conditional Probability, Independence, Bayes' Rule) for the probability vocabulary this lesson reuses in full. Lesson 153 (Expected Value) for expectation and linearity. Lesson 154 (Variance) for what variance measures. Lesson 155 (Common Distributions) for the Binomial distribution's variance formula, `n·p·(1-p)`, reused directly in Concept Unit 3. Lesson 157 (Randomized Algorithms) and Lesson 159 (Monte Carlo Algorithms) for the general idea of trading determinism for speed or simplicity, and of checking a probabilistic claim by running many real trials and measuring a frequency. Lesson 85 (Arrays) for vectors as a fixed-size, indexable, mutable structure.

**Terms used in this lesson**

- **`define`** — binds a name, at top level, to a procedure or a value. It exists so a piece of behavior can be given a name and called again by that name, instead of re-writing the same expression everywhere it's needed.
- **`let`** — introduces one or more local bindings, visible only inside `let`'s own body. It exists so an intermediate value (like a working copy of a vector) can be named once, without leaking that name into the surrounding scope or recomputing the value more than once.
- **Named `let` (self-referential loop)** — a `let` that gives its own body a name, so the body can call that name again with new argument values, exactly the way any other procedure call works. It exists because Scheme has no separate `for` or `while` keyword; a loop *is* a locally defined, self-calling procedure, and named `let` is the syntax for writing one without a separate top-level `define`.
- **Accumulator-passing recursion** — the pattern every loop in this lesson uses: carry the "answer built so far" as an extra argument on each self-call, update it each time through, and hand it back once a base case stops the recursion. It exists because it lets a recursive definition behave like an ordinary iterative loop — building a running answer step by step — instead of only combining values on the way back out of a deep, unresolved call stack.
- **`if`** — a two-branch conditional: evaluates its test, then evaluates exactly one of its remaining one or two sub-expressions. It exists to choose between at most two mutually exclusive next steps. A one-armed `if` (a test and only a "then" branch, no "else") is legal Scheme — if the test is false, it produces an unspecified value and nothing happens, which is exactly the shape needed for a conditional side effect, like "only overwrite this slot if the draw says to."
- **`cond`** — a multi-branch conditional, its clauses tried top to bottom, stopping at the first one whose test is true. It exists because once there are more than two mutually exclusive cases, nesting `if` inside `if` gets hard to read; `cond` lays every case out at the same level instead.
- **`else`** — `cond`'s reserved catch-all clause, always true, always tried last if nothing earlier matched. It exists to guarantee some clause always fires, so `cond` never silently produces nothing.
- **Exact rational numbers** — Guile's numeric tower represents the result of dividing two exact integers that don't divide evenly as an exact fraction (like `1/5`), never a rounded floating-point decimal. This matters here because Concept Unit 3's proof check depends on a probability coming out as *exactly* `1/5`, not `0.20000000000000004` — exact rationals make an algebraic claim exactly checkable with plain `=`, with no tolerance needed.
- **Sampling with replacement** — drawing `k` items from a population where the same item may be drawn more than once, and every draw is independent of every other draw. This lesson's Concept Unit 1.
- **Sampling without replacement** — drawing `k` distinct items from a population, where no item can be drawn twice, but every valid k-item selection must still be equally likely. This lesson's Concept Unit 2.
- **Reservoir sampling** — a one-pass algorithm for drawing a uniform sample of size `k` from a stream whose total length isn't known until the stream ends, using only `O(k)` memory no matter how long the stream turns out to be. This lesson's Concept Unit 3.
- **Uniform distribution over outcomes** — every outcome in some set is equally likely. This is the specific invariant all three of this lesson's procedures exist to preserve; being fast, simple, or memory-light is worthless if the result secretly favors some items over others.
- **Independent trials** — the outcome of one random draw has no effect on, and carries no information about, the outcome of any other. `sample-with-replacement`'s draws are independent by construction — each is its own fresh call to `random`. `sample-without-replacement`'s and `reservoir-sample`'s successive decisions are deliberately *not* independent of each other: a later draw is constrained by which slots an earlier draw already touched, which is exactly what keeps a without-replacement sample free of duplicates.
- **Bernoulli trial** — a single yes/no random decision with a fixed success probability, independent of any other such decision. Concept Unit 3's Isolated Lab is one: "does this item get included," checked once, with no memory of any earlier check.
- **Indicator random variable** — a random variable that equals exactly `1` if some specific event happens on a given random trial, and exactly `0` otherwise, so that counting how often an event happens across many trials is the same as summing a pile of indicator variables. Concept Unit 3 puts one indicator on every stream position to prove reservoir sampling is unbiased.
- **Linearity of expectation** — the expected value of a sum of random variables always equals the sum of their individual expected values, even when those variables are not independent of one another. Concept Unit 3 uses this to show that the reservoir's expected size, computed two different ways, has to agree exactly.
- **Binomial variance formula, `n·p·(1-p)`** — for `n` independent trials, each succeeding with probability `p`, the variance of the total number of successes is `n·p·(1-p)`. Concept Unit 3 checks reservoir sampling's own empirical spread against this exact formula, treating "was item X in the reservoir on trial T" as one success/failure trial with `p = k/n`.
- **Defensive copy** — making a private copy of a mutable structure before changing anything, specifically so the caller's own original structure is never touched. Concept Unit 2 depends on this directly, and this lesson's Closing section demonstrates, on purpose, exactly what goes wrong without it.
- **Aliasing** — when two different names refer to the very same mutable object in memory, so changing the object through one name is visible through the other. This is the reason a defensive copy is necessary at all: without one, a procedure's own local variable would just be another name for the caller's vector, not a separate copy of it.

**Objects and methods used**

*This lesson's own subject, in the order its Concept Units introduce them:*

- **`sample-with-replacement`**
  - *What it is:* a procedure this lesson derives in Concept Unit 1 — takes a vector of items and a count `k`, and returns a list of `k` items drawn from that vector, where the same item may appear more than once.
  - *Implementation:* `(sample-with-replacement items k)` → a list of length `k`, each element chosen independently and uniformly from `items`.
  - *Its use:* the right tool whenever repeats among the `k` results are acceptable, or even expected — assigning a random shard to each of several incoming requests, for instance.
- **`sample-without-replacement`**
  - *What it is:* a procedure this lesson derives in Concept Unit 2 — takes a vector of items and a count `k` no larger than the vector's length, and returns a list of `k` *distinct* items, with no repeats.
  - *Implementation:* `(sample-without-replacement items k)` → a list of length `k`, produced by a partial in-place shuffle of a defensive copy of `items`.
  - *Its use:* whenever the same item being chosen twice would be wrong — picking which of several servers get taken down for maintenance tonight, for instance.
- **`reservoir-sample`**
  - *What it is:* a procedure this lesson derives in Concept Unit 3 — takes a stream (an ordinary Scheme list, walked once, front to back) whose total length isn't assumed to be known ahead of time, and a reservoir size `k`, and returns a list of `k` items drawn uniformly from the whole stream.
  - *Implementation:* `(reservoir-sample stream k)` → a list of length `k`; internally keeps one fixed-size vector of `k` "reservoir" slots and updates it as the stream is walked.
  - *Its use:* the only one of the three that works when the population can't be held in memory all at once, or its size isn't known until the stream ends — a live log, a network feed, anything read one item at a time with no going back.

*Everything else in the file, not this lesson's subject but still explained:*

- **`random`**
  - *What it is:* Guile's built-in source of pseudo-randomness — an ordinary procedure, not a keyword, requiring no import.
  - *Implementation:* `(random n)`, for exact integer `n`, returns an exact integer uniformly chosen from `0` up to (not including) `n`. Guile keeps one default, global random state per process; calling `random` with only one argument reads and updates that shared state. That default state starts from the same fixed point every time a fresh Guile process boots, unless a program explicitly reseeds it — confirmed for real in this lesson's first Isolated Lab, below.
  - *Its use:* every draw this lesson makes bottoms out in a call to `random` — the one true source of unpredictability all three sampling algorithms are built from.
- **`vector`**
  - *What it is:* a constructor — builds a new vector from the arguments given to it.
  - *Implementation:* `(vector v0 v1 ... vn)` returns a fresh vector of length `n+1` holding exactly those values, in that order.
  - *Its use:* builds `shards`, the ten-item population this lesson's first two Concept Units draw from.
- **`make-vector`**
  - *What it is:* a constructor — builds a new vector of a given length without listing every element by hand.
  - *Implementation:* `(make-vector k)` returns a fresh vector of length `k` whose slots hold an unspecified placeholder value (confirmed below — Guile prints it as `#<unspecified>`); `(make-vector k fill)` returns the same, with every slot set to `fill` instead.
  - *Its use:* `reservoir-sample` uses the one-argument form to allocate the reservoir before any real item has been placed into it — safe specifically because the algorithm always writes every slot during the fill phase before any slot is ever read.
- **`vector-length`**
  - *What it is:* an accessor — reports how many slots a vector has.
  - *Implementation:* `(vector-length v)` returns an exact integer, the number of elements in `v`.
  - *Its use:* every procedure here that draws from a vector asks `vector-length` for the valid index range instead of assuming a fixed size.
- **`vector-ref`**
  - *What it is:* an accessor — reads the value stored at a given index of a vector.
  - *Implementation:* `(vector-ref v i)` returns the value at index `i` (0-based); `i` must be a valid index or Guile raises an error.
  - *Its use:* turns a random index, produced by `random`, into an actual item from the population.
- **`vector-set!`**
  - *What it is:* a mutator — the trailing `!` is Scheme's own naming convention, flagging that this procedure changes existing state rather than building something new; it has no meaningful return value.
  - *Implementation:* `(vector-set! v i x)` overwrites index `i` of `v` with `x`, in place.
  - *Its use:* performs the actual swap inside `sample-without-replacement`, and places or replaces an item in the reservoir inside `reservoir-sample`.
- **`vector-copy`**
  - *What it is:* an accessor that returns a whole new vector rather than a single value — this lesson's defensive-copy tool.
  - *Implementation, all three real forms this lesson calls:* `(vector-copy v)` copies the whole vector; `(vector-copy v start)` copies from index `start` to the end; `(vector-copy v start end)` copies from `start` up to, but not including, `end`. All three return a brand-new vector — mutating the copy never touches `v`.
  - *Its use:* `sample-without-replacement` uses the one-argument form to make a private copy of the caller's vector before mutating anything, and the three-argument form to slice out just the first `k` (now-shuffled) slots to return.
- **`vector->list`**
  - *What it is:* a converter — builds a Scheme list holding the same elements, in the same order, as a given vector.
  - *Implementation:* `(vector->list v)` returns a new list; `v` itself is untouched.
  - *Its use:* `sample-without-replacement` and `reservoir-sample` both do their real work in a vector (indexed, mutable) but return a plain list, matching `sample-with-replacement`'s own return shape.
- **`iota`**
  - *What it is:* a list-building procedure — generates a list of consecutive integers.
  - *Implementation:* `(iota count)` returns a list of `count` integers starting at `0` — `(iota 5)` is `(0 1 2 3 4)`, confirmed for real below; an optional second argument sets a different starting point.
  - *Its use:* builds this lesson's stand-in log-line streams (`log-lines`, `big-stream`) — a concrete, finite list playing the role of a stream whose real total length would not be known in advance.
- **`for-each`**
  - *What it is:* an iteration procedure — calls a given procedure once per element of a list, purely for whatever side effect that call causes.
  - *Implementation:* `(for-each proc list)` calls `(proc x)` for each `x` in `list`, left to right, discarding every individual call's return value, and itself returns an unspecified value.
  - *Its use:* tallies, into a shared `counts` vector, which items landed in the reservoir on each of 200,000 trials of Concept Unit 3's empirical verification.
- **`display`**
  - *What it is:* an output procedure — writes a human-readable representation of a value to the terminal.
  - *Implementation:* `(display obj)` sends `obj`'s printed form to the current output port; strings print with no surrounding quotes.
  - *Its use:* every real result shown in this lesson's Run It sections was produced with `display`.
- **`newline`**
  - *What it is:* an output procedure — writes a single line break.
  - *Implementation:* `(newline)` takes no required arguments.
  - *Its use:* keeps each displayed result on its own line in this lesson's real output.
- **`car`**
  - *What it is:* an accessor — returns the first element of a (non-empty) pair, and by extension the first element of a list, since a list is a chain of pairs.
  - *Implementation:* `(car p)` returns the first component of pair `p`; calling it on the empty list is an error.
  - *Its use:* `reservoir-sample` and `has-duplicates?` both walk a list one element at a time; `car` reads "the current element" off the front.
- **`cdr`**
  - *What it is:* an accessor — returns everything in a pair after the first element; for a list, "the rest of the list."
  - *Implementation:* `(cdr p)` returns the second component of pair `p`.
  - *Its use:* advances the walk through a list one element at a time, alongside `car`, in both list-walking procedures this lesson writes.
- **`null?`**
  - *What it is:* a predicate — reports whether a value is the empty list.
  - *Implementation:* `(null? x)` returns `#t` if `x` is `'()`, `#f` otherwise.
  - *Its use:* the base case that ends the walk through a stream or list in both `reservoir-sample` and `has-duplicates?` — once nothing is left, stop.
- **`cons`**
  - *What it is:* a constructor — builds one new pair from two values.
  - *Implementation:* `(cons a b)` returns a fresh pair whose `car` is `a` and whose `cdr` is `b`; building a list is repeated `cons`ing, each new pair's `cdr` pointing at the list built so far.
  - *Its use:* `sample-with-replacement` builds its `result` list one draw at a time by `cons`ing each new draw onto the front of what's already been drawn.
- **`member`**
  - *What it is:* a search procedure — looks for a value inside a list.
  - *Implementation:* `(member obj list)` returns the first sublist of `list` whose `car` is `obj` if found, or `#f` if `obj` never appears.
  - *Its use:* `has-duplicates?`, this lesson's own verification helper, asks whether each element appears anywhere later in the same list — if `member` ever finds one, there's a duplicate.
- **`+`, `-`, `*`, `/`**
  - *What it is:* Scheme's arithmetic procedures — ordinary procedures, not special syntax; they can be passed around and called just like any procedure this lesson defines itself.
  - *Implementation:* each takes any number of numeric arguments and returns their sum, difference, product, or quotient; `/` on two exact integers that don't divide evenly returns an exact rational (a real fraction, like `1/5`), never a rounded decimal — confirmed for real in Concept Unit 3.
  - *Its use:* `+` advances every loop counter; `-` computes remaining-pool sizes and shrinking ranges; `*` and `/` compute the expected counts and variance this lesson's real, measured results get checked against.
- **`<`, `<=`, `=`, `>`**
  - *What it is:* numeric comparison procedures, each returning `#t` or `#f`.
  - *Implementation:* `(< a b)`, `(<= a b)`, `(= a b)`, `(> a b)` compare two numbers.
  - *Its use:* `<` decides whether a reservoir candidate survives (`reservoir-sample`) and whether an inclusion check passes (Concept Unit 3's lab); `=` recognizes every loop's base case; `>` and `<=` bound the exact-rational proof check's own loop.

---

## Concept Unit: Sampling With Replacement

### The Problem

Ten server shards, numbered `shard-0` through `shard-9`, are ready to handle traffic. Five requests arrive together and each one needs a shard assigned to handle it. There's no rule against two requests landing on the same shard — that's ordinary load, not a bug. What's needed is a way to hand each request a shard number so that, for every single request, every one of the ten shards is exactly equally likely to be picked, with no request's assignment influenced in any way by what any other request got. Nothing here says the five assignments have to be different from each other; nothing here says they can't be, either. This freedom — repeats are simply allowed — is what "sampling with replacement" means, and it's the simplest of the three sampling problems this lesson works through, which is exactly why it comes first.

### Project Change

- **Reference Source** — No reference counterpart. Era VI (Lessons 146–161) has been deriving probability and randomized-algorithm tools directly from first principles rather than porting any existing reference implementation, and this lesson continues that pattern.
- **Files affected** — this lesson's own file. This curriculum has no separate, persisted project source tree; each lesson's real, run-and-verified Guile code lives entirely inside that lesson's own Concept Units.
- **Change type** — add: a new, freestanding top-level procedure.
- **Location** — nothing precedes it in this lesson yet; this is the first definition this lesson makes.
- **Dependencies** — none beyond Guile's built-in `random` and vector procedures, both already available in any base Guile session with no import required.

### The New Code

```scheme
(define (sample-with-replacement items k)
  (let loop ((count 0) (result '()))
    (if (= count k)
        result
        (loop (+ count 1)
              (cons (vector-ref items (random (vector-length items))) result)))))
```

### The Updated Project

Skipped — `sample-with-replacement` is a brand-new, freestanding top-level procedure; there is no existing enclosing structure to place it inside yet, and Project Change already covers this case (a first definition has nothing to locate a position within).

### Isolated Lab: `random`

The one genuinely new ingredient in the code above is `random` itself. Before trusting it inside a real procedure, it's worth seeing what it actually returns, on its own, with nothing else around it:

```scheme
(random 10) (random 10) (random 10) (random 10) (random 10)
(random 10) (random 10) (random 10) (random 10) (random 10)
```

Ten calls, run for real, in order:

```
(3 4 1 5 6 7 4 2 2 1)
```

This proves two things at once. First, the values genuinely vary — not every call returns the same thing. Second, and just as important: `4` shows up twice (positions 2 and 7), `2` shows up twice in a row (positions 8 and 9), and `1` shows up twice (positions 3 and 10). Nothing here refuses to repeat a value it already gave out — this procedure is called a **random number generator**, and by design it has no memory of what it returned last time. That absence of memory is exactly what "with replacement" needs: `(random (vector-length items))` in the code above is this exact call, run once per request, with no bookkeeping at all about which indices came up before.

One more thing worth noticing in that same real output: the first five values — `3 4 1 5 6` — are the *exact* same five values `sample-with-replacement` itself draws the first time it's called below. That's not a coincidence being glossed over; it's the direct, honest consequence of the fact just established in this lesson's Header: a fresh Guile process's default random state always starts from the same fixed point, so the first five calls to `random 10` in a fresh session always produce this same sequence, whether they're written as five bare calls or buried inside a loop inside a procedure.

### Discarding the Lab

This throwaway ten-call block served only to show that `random` genuinely produces different, repeatable-on-purpose values with no memory between calls. It is discarded now and does not appear in the project again — `sample-with-replacement`'s own single call to `random`, inside its loop, is the real, permanent version of this idea.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in the order it appears:

- **`(define (sample-with-replacement items k) ...)`** — `define` binds the name `sample-with-replacement`, at top level, to a procedure taking two parameters, `items` and `k`; from this point forward in any session that has run this definition, calling `(sample-with-replacement shards 5)` runs the body below with `items` bound to `shards` and `k` bound to `5`.
- **`(let loop ((count 0) (result '())) ...)`** — this is a **named `let`**: it introduces a locally-scoped procedure named `loop`, immediately calls it once with `count` bound to `0` and `result` bound to `'()` (the empty list), and makes `loop` itself callable again, recursively, from inside its own body. This is Scheme's loop construct — there is no separate `for` keyword; a loop here is a self-calling local procedure, and `count`/`result` are that loop's own private state, invisible outside this `let`.
- **`(if (= count k) result ...)`** — a two-branch conditional. `(= count k)` is the loop's base case: once exactly `k` draws have been made, stop and produce `result` as the loop's final answer. If that test is false, the second branch runs instead.
- **`(loop (+ count 1) (cons (vector-ref items (random (vector-length items))) result))`** — the recursive step, and this is **accumulator-passing recursion**: rather than combining values on the way back out of a call stack, this call to `loop` carries forward the running answer (`result`, now with one more item consed on) as an ordinary argument, the same way `count` carries the running iteration number forward. `(+ count 1)` computes the next iteration number. `(vector-length items)` asks how many valid indices `items` has — ten, for `shards`. `(random (vector-length items))` draws one fresh, independent, uniformly-chosen index in that range — this is the exact call this lesson's Isolated Lab just proved varies and repeats freely, with no memory of any earlier draw. `(vector-ref items ...)` turns that random index into the actual item stored there. `(cons ... result)` builds a new pair whose first element is this draw and whose rest is everything drawn so far, becoming the new `result` for the next iteration.

**Execution trace** — calling `(sample-with-replacement shards 5)`, following the real draws from this lesson's own Isolated Lab (the first five: `3, 4, 1, 5, 6`):

```
Iteration 1: count 0 → 1, draw = shards[3] = 3, result = (3)
Iteration 2: count 1 → 2, draw = shards[4] = 4, result = (4 3)
Iteration 3: count 2 → 3, draw = shards[1] = 1, result = (1 4 3)
Iteration 4: count 3 → 4, draw = shards[5] = 5, result = (5 1 4 3)
Iteration 5: count 4 → 5, draw = shards[6] = 6, result = (6 5 1 4 3)
```

On iteration 1, `count` is `0` and `k` is `5`, so `(= count k)` is false and the recursive branch runs: `random` draws `3`, `vector-ref` looks up `shards[3]`, which — because `shards` happens to hold the numbers `0` through `9` in order — is also `3`, and `cons` builds `(3)`. The same pattern repeats through iteration 5, each time consing the newest draw onto the front of the growing list — which is exactly why the final result, `(6 5 1 4 3)`, lists the *last* draw first: `cons` always adds to the front, never the back. On iteration 6 (not shown), `count` would equal `5`, `(= count k)` would be true, and the loop would stop, returning `result` exactly as it stood — `(6 5 1 4 3)` — with no sixth draw made.

### CS Lens

This is **sampling with replacement**: drawing repeatedly and independently from a fixed population, where the same outcome can recur, and no draw depends on any earlier one.

Also recognized in: rolling an ordinary die more than once (nothing stops the same face from coming up twice); bootstrap resampling in statistics, where a new dataset is built by drawing repeatedly, with replacement, from an existing one to estimate how much a measurement would vary on a different sample; choosing a random hash seed independently for each of several hash tables; Lesson 159's own Monte Carlo method, which is built entirely out of repeated, independent, with-replacement draws used to estimate something by frequency; and, in this lesson's own framing, load-balancing a stream of requests across a fixed pool of servers where any server handling more than one request in a row is completely normal.

### SE Lens

The design principle here is **no shared state between draws**. Every call to `random` inside the loop is self-contained — nothing from one iteration constrains or informs the next. That's precisely what keeps this procedure simple: no defensive copying, no tracking of what's already been used, `O(k)` time with a small, flat constant per draw.

An alternative that was *not* chosen: building `result` with `append` instead of `cons` — `(append result (list draw))` — which would produce the list in the same order the draws actually happened, rather than reversed. The real cost of that alternative: `append` has to walk and rebuild the entire existing list every single call, making each iteration take time proportional to how long `result` already is — the whole loop becomes `O(k²)` instead of `O(k)`. `cons` avoids that entirely by building the new pair in one constant-time step and letting the list come out in reverse-of-draw order. That reversal is free to accept here specifically *because* a sample's membership is all that matters — nothing about "which shard got picked first" is meaningful in this problem. If draw order ever did matter (replaying which request was assigned to which shard, in the order requests actually arrived, say), this exact design choice would silently produce the wrong answer, and the debt of reversed order would have to be paid off explicitly — either by reversing `result` once at the end, or by tracking order some other way.

### Run It

```scheme
(sample-with-replacement shards 5)
;=> (6 5 1 4 3)

(sample-with-replacement shards 5)
;=> (1 2 2 4 7)
```

That second, independent call shows `2` drawn twice — real, direct evidence that replacement is really happening, not merely allowed for in theory.

### Connection

With a way to draw freely, with repeats allowed, established and verified for real, the next problem is the opposite constraint: what happens when a repeat would be wrong.

---

## Concept Unit: Sampling Without Replacement

### The Problem

Tonight, five of the ten server shards need to come down for scheduled maintenance. The same shard obviously can't be selected twice — taking `shard-3` down "twice" isn't a meaningful operation, and any procedure that could report it as one of two separate picks has a real bug. So the requirement changes: pick five *distinct* shards, and — this is the part that's easy to get subtly wrong — every one of the possible five-shard groups has to be exactly equally likely, not just "distinct, however they happen to come out." A tempting-looking shortcut is to keep calling something like `sample-with-replacement` and simply throw away any result that contains a duplicate, trying again until five distinct picks show up by luck. That would eventually work, but it has a real, ugly cost: in the worst case — imagine needing all ten distinct shards out of a pool of only ten — the odds of any given attempt succeeding shrink fast, and there's no guarantee at all about how many attempts it takes. What's needed instead is a way to guarantee exactly `k` distinct results, in bounded, predictable work, with no possibility of ever having to retry.

### Project Change

- **Reference Source** — No reference counterpart, for the same reason as Concept Unit 1: this is a from-scratch derivation, not a port.
- **Files affected** — this lesson's own file, same as Concept Unit 1.
- **Change type** — add: a second new, freestanding top-level procedure.
- **Location** — after `sample-with-replacement`, but not built on top of it; the two are independent procedures solving different problems.
- **Dependencies** — none beyond what Concept Unit 1 already used.

### The New Code

```scheme
(define (sample-without-replacement items k)
  (let ((pool (vector-copy items)))
    (let loop ((i 0))
      (if (= i k)
          (vector->list (vector-copy pool 0 k))
          (let ((j (+ i (random (- (vector-length pool) i))))
                (temp (vector-ref pool i)))
            (vector-set! pool i (vector-ref pool j))
            (vector-set! pool j temp)
            (loop (+ i 1)))))))
```

### The Updated Project

Skipped — same justification as Concept Unit 1: this is a brand-new, freestanding top-level procedure with no existing enclosing structure to place it inside.

### Isolated Lab: The Swap-to-Front Step

The core new idea here isn't any single line — it's the *strategy*: to fill position `0` with a uniformly random choice among *all* the items, swap a randomly chosen item into position `0`, rather than trying to pick "the 0th random item" some other way. Isolated, on a tiny four-item vector, doing exactly one such swap:

```scheme
(define (one-swap-step)
  (let ((v (vector 'a 'b 'c 'd)))
    (let ((j (random 4))
          (temp (vector-ref v 0)))
      (vector-set! v 0 (vector-ref v j))
      (vector-set! v j temp)
      (vector-ref v 0))))
```

Three real, individual calls:

```
(one-swap-step) → d
(one-swap-step) → b
(one-swap-step) → c
```

Already, three different letters landed in slot `0` across three calls — but three calls isn't enough to trust that it's genuinely *uniform* across all four letters, only that it's not obviously broken. Run for real, 4,000 times, tallying which letter ends up in slot `0` each time:

```
frequency of a, b, c, d landing in slot 0 over 4000 trials: #(971 999 1021 1009)
```

With four equally likely outcomes over 4,000 trials, the expected count for each is `1000`; the real measured counts — `971`, `999`, `1021`, `1009` — sit close to that on every single letter, with no one letter favored over the others. This is called **selection sampling** (sometimes described as a *partial Fisher-Yates shuffle*): swap a uniformly random element into the front position, and that position ends up uniformly distributed over the *entire* original vector, not just over the elements that happen to come after it. This is exactly what `(let ((j (+ i (random (- (vector-length pool) i)))) ...` in the real code above is doing at `i = 0`, isolated down to one single step: `j` there is drawn from the full remaining range, `(random (- n i))` with `i = 0` meaning `(random n)`, over the whole pool.

### Discarding the Lab

This four-letter, one-step, 4,000-trial demonstration is now discarded. It never appears in the project again — `sample-without-replacement`'s own loop, run below, repeats this same swap-to-front idea `k` times instead of once, moving one position further into the pool on each pass.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (sample-without-replacement items k) ...)`** — `define` binds the name `sample-without-replacement` to a two-parameter procedure, exactly as in Concept Unit 1.
- **`(let ((pool (vector-copy items))) ...)`** — a plain `let`, one binding: `pool` is bound to a **defensive copy** of `items`, made with the one-argument form of `vector-copy`. This is the load-bearing decision of this whole Concept Unit: because `vector-copy` returns a *new* vector rather than a second name for the same one, `pool` and `items` are two separate objects in memory from this point on — there is no **aliasing** between them, so nothing this procedure does to `pool` can ever be visible through the caller's own `items`. Concept Unit 1 mutated nothing, so this question never came up there; it comes up here because the algorithm below needs to shuffle *something*, and it must not be the caller's own vector.
- **`(let loop ((i 0)) ...)`** — another named `let`, this lesson's second occurrence of the same self-calling loop pattern established in Concept Unit 1: `loop` is a locally-scoped, recursive procedure, called immediately with `i` bound to `0`, and callable again from inside its own body with a new value for `i`.
- **`(if (= i k) ... ...)`** — the loop's base case, `(= i k)`: once `i` positions have been filled with a swap, stop.
- **`(vector->list (vector-copy pool 0 k))`** — the base-case branch's value: `(vector-copy pool 0 k)`, the three-argument form, copies out just the first `k` slots of `pool` — the ones this loop has actually shuffled — leaving any untouched slots past index `k` out of the result entirely; `vector->list` then converts that vector into a plain list, matching `sample-with-replacement`'s own list-shaped return value.
- **`(let ((j (+ i (random (- (vector-length pool) i)))) (temp (vector-ref pool i))) ...)`** — a plain `let` with two independent bindings. `(vector-length pool)` asks the pool's size — `10`, for `shards`. `(- (vector-length pool) i)` computes how many positions are still "up for grabs": at `i = 0` that's the whole pool, `10`; by `i = 4` it's shrunk to `6`, because positions `0` through `3` are already decided. `(random (- (vector-length pool) i))` draws a uniformly random offset within that shrinking remaining range — this is this lesson's Isolated Lab, generalized: at `i = 0` it's exactly `(random 10)`, identical to the lab's own `(random 4)` scaled up. `(+ i ...)` shifts that offset so `j` lands somewhere in `[i, vector-length pool)`, never before position `i` — positions before `i` are already finished and must not be disturbed. `temp` holds `pool`'s current value at position `i`, saved before it gets overwritten, exactly the way any in-place swap needs a temporary holding spot.
- **`(vector-set! pool i (vector-ref pool j))`** then **`(vector-set! pool j temp)`** — the swap itself, in two steps: first, whatever was at the randomly chosen position `j` is copied into position `i`; second, `temp` — position `i`'s *original* value, saved a line earlier — is written into position `j`. This is a genuine in-place exchange: without saving `temp` first, the first `vector-set!` would already have overwritten position `i`, and the value that belonged at position `j` would be lost before it could be moved there.
- **`(loop (+ i 1))`** — the recursive step, this lesson's second use of accumulator-passing recursion: `i` advances by one, moving the "already decided" boundary one position to the right for the next pass.

**Execution trace** — calling `(sample-without-replacement shards 5)`, following the real, measured draws:

```
Iteration i=0: j = 0 + (random 10) = 5, swap pool[0]=0 with pool[5]=5 → #(5 1 2 3 4 0 6 7 8 9)
Iteration i=1: j = 1 + (random 9)  = 4, swap pool[1]=1 with pool[4]=4 → #(5 4 2 3 1 0 6 7 8 9)
Iteration i=2: j = 2 + (random 8)  = 7, swap pool[2]=2 with pool[7]=7 → #(5 4 7 3 1 0 6 2 8 9)
Iteration i=3: j = 3 + (random 7)  = 5, swap pool[3]=3 with pool[5]=0 → #(5 4 7 0 1 3 6 2 8 9)
Iteration i=4: j = 4 + (random 6)  = 4, swap pool[4]=1 with pool[4]=1 → #(5 4 7 0 1 3 6 2 8 9)
```

At `i = 0`, the remaining range is the whole pool (`10 − 0`), and the draw came out to `5`, so `j = 0 + 5 = 5`; positions `0` and `5` swap, moving `5` to the front. At `i = 1`, position `0` is now off-limits (already decided), so the remaining range shrinks to `9` (`10 − 1`); the draw came out to `3`, so `j = 1 + 3 = 4`; positions `1` and `4` swap. The same pattern continues at `i = 2` and `i = 3`, each time with a smaller remaining range and a fresh draw; the important structural point is that `j` is always computed to fall in `[i, 10)`, never lower, so the already-decided front of the pool can never be disturbed twice. At `i = 4`, notice the real draw happened to pick `j = 4` — the same index as `i` itself. That's a legal, unremarkable outcome: the "swap" trades a position with itself, `temp` and the fresh `vector-ref` hold the same value, and the pool is left unchanged by that step — proof that `j = i` isn't a special case the code needs to detect or guard against; the general swap logic already handles it correctly by doing nothing meaningful. After five iterations, `pool` is `#(5 4 7 0 1 3 6 2 8 9)`, and the first five slots — `5 4 7 0 1` — are exactly this call's real result.

### CS Lens

This is **sampling without replacement**, implemented here as a **partial Fisher-Yates shuffle** (also called selection sampling): repeatedly swap a uniformly random not-yet-decided element into the next position, stopping after `k` positions instead of continuing through the whole vector.

Also recognized in: shuffling a full deck of cards (running this exact algorithm to completion, `k` equal to the deck's full size, is the textbook Fisher-Yates shuffle); real lottery number draws, which genuinely do not allow the same ball to be drawn twice; Lesson 158's own randomized quicksort, which needs to choose a single random pivot from a subarray — a `k = 1` instance of exactly this same "choose distinct random elements from a range" problem; and assigning participants to the arms of an A/B test, where the same person ending up counted in two different arms at once would corrupt the results.

### SE Lens

The design principle here is the **defensive copy**: `pool` is a private working copy, made once, up front, specifically so this procedure can freely mutate it without ever touching the caller's own vector.

An alternative that was *not* chosen: skip `vector-copy` and mutate `items` directly. That alternative is a real one, not a strawman — it would save one full `O(n)` allocation and copy on every single call, which matters if this procedure is ever called in a tight loop over a large vector. The cost of making that choice is exactly what this lesson's Closing section demonstrates on purpose, for real: the caller's own vector comes back silently rearranged — not just at the `k` positions that were "supposed" to be touched, but at every position the shuffle's swaps happened to reach, since `j` can land anywhere in the shrinking remaining range, including well past index `k`. That's an **aliasing** bug: `pool` and the caller's vector are, without the defensive copy, two names for the exact same mutable object, and every `vector-set!` on one is a `vector-set!` on the other. The maintenance cost this project is currently carrying by choosing the safe version instead: one avoidable `O(n)` copy per call, every time, even on the (probably common) case where the caller genuinely doesn't care what happens to their original vector afterward. That's the real trade being made — safety paid for with a constant, predictable, always-incurred cost, rather than an occasional, catastrophic, hard-to-trace one.

### Run It

```scheme
(sample-without-replacement shards 5)
;=> (9 6 1 4 5)

(sample-without-replacement shards 5)
;=> (2 1 8 9 4)

(sample-without-replacement shards 10)
;=> (9 4 1 8 7 5 2 6 0 3)
```

That last call, with `k` equal to the pool's full size, is a complete shuffle of all ten shards — proof this procedure isn't limited to picking a small subset; running it to completion is exactly the full Fisher-Yates shuffle named in this Concept Unit's CS Lens.

```scheme
shards
;=> #(0 1 2 3 4 5 6 7 8 9)
```

After all three calls above, `shards` — the original vector — is still exactly `#(0 1 2 3 4 5 6 7 8 9)`, untouched. That's the defensive copy doing its job.

**A real check that no duplicate ever slips through:** define a helper that checks one result for a repeated value, then drive `sample-without-replacement` through it 100,000 separate times, counting how many of those trials produced a duplicate:

```scheme
(define (has-duplicates? lst)
  (cond
    ((null? lst) #f)
    ((member (car lst) (cdr lst)) #t)
    (else (has-duplicates? (cdr lst)))))

(define duplicate-count
  (let loop ((trial 0) (bad 0))
    (if (= trial 100000)
        bad
        (loop (+ trial 1)
              (if (has-duplicates? (sample-without-replacement shards 5))
                  (+ bad 1)
                  bad)))))

duplicate-count
;=> 0
```

`has-duplicates?` and `duplicate-count` are both worth a moment:

- **`(null? lst)`, the first `cond` clause** — catches the case where nothing's left to check: no duplicate found anywhere in the list, so the answer is `#f`.
- **`(member (car lst) (cdr lst))`, the second clause** — asks whether the current element, `(car lst)`, shows up anywhere in the *rest* of the list, `(cdr lst)`. If it does, `member` returns a true (non-`#f`) value and the `cond` reports `#t` immediately.
- **`(has-duplicates? (cdr lst))`, the `else` clause** — otherwise, `has-duplicates?` calls itself on the rest of the list. This is a third, independent use of this lesson's recursion pattern, this time without an accumulator, since the answer it needs is a plain `#t`/`#f` rather than a value built up piece by piece.
- **`duplicate-count`** — drives 100,000 independent calls to `sample-without-replacement` through `has-duplicates?`, reusing this lesson's own named-let/accumulator pattern, with `bad` as the running tally of how many of those trials came back with a repeat.

Zero duplicates in 100,000 real trials is not a probabilistic near-miss the way the reservoir sampling numbers later in this lesson will be; it's the expected, exact result of an algorithm that makes duplication *structurally* impossible, not merely unlikely.

### Connection

Both procedures so far assume the whole population already sits in a vector — something with a known size, that can be read and re-read as many times as needed. The next problem removes that assumption entirely.

---

## Concept Unit: Reservoir Sampling

### The Problem

Now the population isn't sitting in a vector at all — it's a live stream: log lines arriving one at a time, from a server that's still running. There's no way to ask "how many lines will there eventually be" in advance, and there's no way to go back and re-read a line once it's scrolled past. The goal is still to end up with a uniform random sample of `k` lines — say, four — out of however many the stream eventually turns out to have, but now under two much harder constraints at once: the algorithm gets exactly one pass, and it can't store more than a small, fixed amount of data regardless of how long the stream runs. `sample-without-replacement` needs the whole population up front, in a vector, to shuffle; that's simply not available here. What's needed is a way to keep a running, always-valid uniform sample of size `k`, updated incrementally as each new item arrives, that would still be correct no matter when the stream happened to stop.

### Project Change

- **Reference Source** — No reference counterpart, for the same reason as the two Concept Units before this one.
- **Files affected** — this lesson's own file.
- **Change type** — add: a third new, freestanding top-level procedure.
- **Location** — after `sample-without-replacement`; independent of both procedures before it.
- **Dependencies** — none beyond what the two earlier Concept Units already used.

### The New Code

```scheme
(define (reservoir-sample stream k)
  (let ((reservoir (make-vector k)))
    (let loop ((remaining stream) (i 0))
      (cond
        ((null? remaining) (vector->list reservoir))
        ((< i k)
         (vector-set! reservoir i (car remaining))
         (loop (cdr remaining) (+ i 1)))
        (else
         (let ((j (random (+ i 1))))
           (if (< j k)
               (vector-set! reservoir j (car remaining)))
           (loop (cdr remaining) (+ i 1))))))))
```

### The Updated Project

Skipped — same justification as the two Concept Units before this one: a brand-new, freestanding top-level procedure with nothing to locate a position within yet.

### Isolated Lab: The Inclusion Check

The one genuinely new decision in the code above is the test `(< j k)` where `j` comes from `(random (+ i 1))` — "include this new item with probability `k / (i + 1)`." Isolated, for a fixed, representative position — pretend ten items have already gone by (`i + 1 = 10`) and the reservoir holds three (`k = 3`):

```scheme
(< (random 10) 3)
```

Five real, individual calls:

```
(#f #f #t #f #f)
```

One `#t` out of five, roughly matching the one-in-three-ish rate `3/10 = 0.3` would predict, though five trials is nowhere near enough to trust that closely. Run for real, 10,000 times, counting how often it comes out true:

```
included count out of 10000 trials, i=10 k=3 (expect near 3000): 2981
```

`2981` out of `10000` is extremely close to the predicted `3000` — real, measured evidence that `(< (random i) k)` really does come out true with probability `k / i`, not just plausibly. A single yes/no random decision like this one, with a fixed success probability and no memory of any other decision, is called a **Bernoulli trial**. This is exactly what `(random (+ i 1))` combined with `(< j k)` in the real code above computes, at the specific position `i` the loop happens to be at: with `i` items already fully processed, the `(i + 1)`th item — the one currently being looked at — gets included with probability `k / (i + 1)`.

### Discarding the Lab

This ten-thousand-trial, fixed-position demonstration is discarded now. It never appears in the project again — `reservoir-sample`'s own loop, below, performs this same probability-`k/(i+1)` check at every position as the stream is actually walked, with `i` genuinely changing each time rather than held fixed.

### Mechanical Walkthrough

Every distinct syntactic element of the code above, in order:

- **`(define (reservoir-sample stream k) ...)`** — `define` binds `reservoir-sample` to a two-parameter procedure, exactly as with the two procedures before it.
- **`(let ((reservoir (make-vector k))) ...)`** — a plain `let`, one binding: `reservoir` is bound to a fresh vector of length `k`, built with `make-vector`'s one-argument form. Every slot starts out holding Guile's unspecified placeholder value — real, verified below — which is safe here for a specific reason spelled out in the walkthrough of the very next line: no slot is ever read by this algorithm before it has first been written.
- **`(let loop ((remaining stream) (i 0)) ...)`** — this lesson's third named `let`: a self-calling local loop, started with `remaining` bound to the full `stream` and `i` bound to `0`. `remaining` tracks how much of the stream is still unprocessed; `i` counts how many items have been looked at so far.
- **`(cond ((null? remaining) ...) ((< i k) ...) (else ...))`** — a three-way `cond`, needed here (rather than a nested `if`) because there are genuinely three mutually exclusive situations at every step, not two: the stream might be exhausted, the reservoir might still be filling for the first time, or the reservoir might already be full and facing a real inclusion decision.
- **`((null? remaining) (vector->list reservoir))`** — the base case: once `remaining` is the empty list, the whole stream has been walked, and the final answer is `reservoir`, converted to a plain list with `vector->list`, matching the other two procedures' return shape.
- **`((< i k) (vector-set! reservoir i (car remaining)) (loop (cdr remaining) (+ i 1)))`** — the fill branch, for as long as fewer than `k` items have been processed: `(car remaining)` reads the current front item off the stream, `vector-set!` writes it straight into reservoir slot `i` — no random decision at all — and `(loop (cdr remaining) (+ i 1))` advances to the next item. This is why no reservoir slot is ever read uninitialized: every one of the first `k` items goes here, filling every slot in order, before the `else` branch — the only branch that ever *reads* an existing slot's value indirectly through `j` — can run at all.
- **`(else (let ((j (random (+ i 1)))) ...))`** — once `i` reaches `k`, every further item takes this branch instead. `(+ i 1)` is the total count of items seen so far, including the current one; `(random (+ i 1))` draws a uniformly random integer from `0` up to (not including) that count — this is exactly this Concept Unit's Isolated Lab, no longer fixed at `i = 10` but recomputed fresh at whatever position the loop has actually reached.
- **`(if (< j k) (vector-set! reservoir j (car remaining)))`** — a one-armed `if`, deliberately: if `j` happens to fall in `[0, k)`, the current item is included, overwriting whatever was previously sitting in reservoir slot `j`; if not, nothing happens at all — no `else` branch is needed because "do nothing" genuinely is the correct behavior, not a gap that needs filling.
- **`(loop (cdr remaining) (+ i 1))`** — the recursive step, this lesson's third use of accumulator-passing recursion, advancing to the next stream item regardless of whether this one was included.

**Execution trace** — calling `(reservoir-sample log-lines 3)` on an eight-line stream, `log-lines` = `(0 1 2 3 4 5 6 7)`, following the real, measured draws:

```
i=0 (fill): line=0 → reservoir = #(0 ? ?)
i=1 (fill): line=1 → reservoir = #(0 1 ?)
i=2 (fill): line=2 → reservoir = #(0 1 2)
i=3: line=3, j=(random 4)=3 → j is not < 3, discarded → reservoir = #(0 1 2)
i=4: line=4, j=(random 5)=0 → j < 3, included, replaces slot 0 → reservoir = #(4 1 2)
i=5: line=5, j=(random 6)=4 → j is not < 3, discarded → reservoir = #(4 1 2)
i=6: line=6, j=(random 7)=2 → j < 3, included, replaces slot 2 → reservoir = #(4 1 6)
i=7: line=7, j=(random 8)=1 → j < 3, included, replaces slot 1 → reservoir = #(4 7 6)
```

(`?` marks a slot still holding `make-vector`'s unspecified placeholder value, not yet written.) At `i = 0, 1, 2`, `i < k` (`3`) is true, so each line is placed directly, unconditionally, into the matching slot — no coin gets flipped for the first three lines at all. At `i = 3`, the reservoir is full, so the `else` branch runs for the first time: `(random 4)` draws `3`, and since `3` is not less than `k` (`3`), line `3` is discarded — the reservoir is unchanged. At `i = 4`, `(random 5)` draws `0`, which *is* less than `3`, so line `4` replaces whatever sat in slot `0` — the original line `0`, drawn all the way back at `i = 0`, is gone now, evicted by a later arrival. The same pattern continues: `i = 5` discards, `i = 6` and `i = 7` both include, each time replacing exactly one existing slot. The stream ends after `i = 7` (eight lines total, indices `0` through `7`), and the loop's base case — `null? remaining` — fires, returning the final reservoir, `(4 7 6)`, as this call's real result.

**A real, exact-rational proof, not just this one trace:** the trace above shows *one* real run producing *one* real result; it doesn't, by itself, prove every line had a fair chance of ending up in that final reservoir. The actual claim to prove is: for a stream of `n` items and a reservoir of size `k`, *every* item — regardless of whether it arrived during the initial fill or long after — ends up in the final reservoir with probability exactly `k / n`.

For an item at position `m` (counting from `1`) that arrives during the initial fill (`m ≤ k`), it's placed unconditionally, so its probability of being *placed* is `1`. From that point on, at every later position `i` from `k + 1` up to `n`, it survives being evicted only if that position's own draw is *not* an inclusion for slot `m`'s specific slot — worked out exactly, the chance of surviving one such round is `1 − 1/i`, i.e. `(i − 1) / i`, and the chance of surviving all of them is those fractions multiplied together, position by position, from `k + 1` to `n`.

For an item at a later position `m` (`m > k`), it first has to *be* included at all — probability `k / m`, exactly the check this Concept Unit's Isolated Lab just measured — and then it has to survive every eviction round from `m + 1` to `n`, the same telescoping product as above, just starting later.

Both cases, computed for real in exact rational arithmetic rather than approximated:

```scheme
(define (survival-probability n k m)
  (define inclusion-at-m (if (<= m k) 1 (/ k m)))
  (define eviction-start (if (<= m k) (+ k 1) (+ m 1)))
  (define survive-rest
    (let loop ((i eviction-start) (acc 1))
      (if (> i n)
          acc
          (loop (+ i 1) (* acc (/ (- i 1) i))))))
  (* inclusion-at-m survive-rest))
```

Run for real, for a stream of `n = 20` and a reservoir of `k = 4`, at seven different positions spanning both the initial-fill group and the later-arrival group:

```
survival-probability 20 4 1  = 1/5   equal to 4/20? #t
survival-probability 20 4 2  = 1/5   equal to 4/20? #t
survival-probability 20 4 3  = 1/5   equal to 4/20? #t
survival-probability 20 4 4  = 1/5   equal to 4/20? #t
survival-probability 20 4 5  = 1/5   equal to 4/20? #t
survival-probability 20 4 10 = 1/5   equal to 4/20? #t
survival-probability 20 4 20 = 1/5   equal to 4/20? #t
```

Every single position — the very first item, the very last, and every one checked in between, on both sides of the initial-fill boundary at `m = 4` — comes out to *exactly* `1/5`, matching `k / n = 4/20` exactly, not approximately. This is the algebra's own telescoping cancellation made concrete: `(4/5) × (5/6) × (6/7) × ... `, each numerator cancelling the previous denominator, collapsing all the way down to a single clean fraction no matter how many terms are multiplied together or where the product starts.

**One more exact check, needing no simulation at all:** `reservoir` is a fixed-size vector of length `k` — after the stream ends, it always holds exactly `k` items, no more, no fewer, with certainty. Put an **indicator random variable** on every one of the `n` stream positions — `1` if that position's item is in the final reservoir, `0` otherwise — and the *sum* of all `n` indicators has to equal `k`, always, with probability `1`, since that sum is just counting how many of the reservoir's `k` slots are occupied. By **linearity of expectation**, the expected value of that sum equals the sum of the individual expected values — `n` copies of `k/n`, one per position, exactly the number just proven above — which adds up to `n × (k/n) = k`. Both routes to the same number agree exactly: the reservoir's size is deterministically `k`, and summing each position's own derived probability independently also gives `k`. If the per-position probability derived above had come out to anything other than exactly `k/n`, these two numbers would not have matched, and that mismatch alone would have been enough to prove the derivation wrong — they do match, which is itself independent, exact evidence the derivation is right.

### CS Lens

This is **reservoir sampling**: maintaining a uniform random sample of fixed size `k` over a stream of unknown or unbounded length, using `O(k)` memory and exactly one pass, no matter how long the stream turns out to run.

Also recognized in: a database sampling a huge table for a quick estimate without first running a full `COUNT(*)` pass to learn how many rows exist; a network router sampling packets for traffic analysis without buffering the entire flow it's routing; a log-analysis tool keeping a representative sample of an ever-growing, currently-still-being-written log file; an online learning system that sees each training example exactly once, in order, and can't go back and revisit an earlier one; and a "sample a tweet from the live firehose" system, which faces this exact one-pass, unknown-eventual-length constraint by definition.

### SE Lens

The design principle here is **bounded memory under an unknown or unbounded input size** — `O(k)` space, a constant that never grows no matter how long the stream runs, in contrast to both procedures before this one, which quietly assumed the entire population already fits in a vector.

An alternative that was *not* chosen: read the whole stream into a vector first, *then* call `sample-without-replacement` on it. That alternative is genuinely simpler — no new algorithm, no proof, just reusing Concept Unit 2's code as-is — and it works perfectly well whenever the stream's full contents can actually fit in memory at once. Reservoir sampling's entire reason to exist is the case where that assumption fails: a stream too large to buffer, or one whose eventual length isn't even knowable until it's over, which makes "allocate a vector of the right size first" impossible before the fact, not merely expensive. The real cost this design carries that the other two never had to think about: `reservoir-sample` can only be run once over a given stream, because walking a Scheme list with `car`/`cdr` consumes it — there's no way to "rewind" back to the start the way `vector-ref` can reread any index of a vector as many times as needed. Needing several independent reservoir samples from the same live stream means either replaying the stream from its actual source more than once (if that's even possible for a live feed) or running several reservoirs' worth of bookkeeping in parallel during one single pass — a real constraint `sample-with-replacement` and `sample-without-replacement` simply don't have, because their population, once in a vector, can be reread arbitrarily many times for free.

### Run It

```scheme
(reservoir-sample log-lines 3)
;=> (0 4 3)

(reservoir-sample log-lines 3)
;=> (4 1 5)
```

A larger, twenty-item stream, `big-stream`, standing in for a longer-running log:

```scheme
(reservoir-sample big-stream 4)
;=> (19 4 13 18)

(reservoir-sample big-stream 4)
;=> (4 19 2 14)
```

**The full empirical check, at scale:** running `(reservoir-sample big-stream 4)` 200,000 separate times, tallying in a `counts` vector how many of those 200,000 runs each of the twenty stream items landed in, then printing that tally against the expected count and Lesson 155's variance formula:

```scheme
(define counts (make-vector 20 0))
(let loop ((t 0))
  (if (< t 200000)
      (begin
        (for-each
         (lambda (item) (vector-set! counts item (+ 1 (vector-ref counts item))))
         (reservoir-sample big-stream 4))
        (loop (+ t 1)))))

(display "counts: ") (display counts) (newline)
(display "expected count per item (200000 * 4/20): ") (display (* 200000 (/ 4 20))) (newline)
(display "predicted variance (200000 * 1/5 * 4/5): ") (display (* 200000 (/ 4 20) (- 1 (/ 4 20)))) (newline)
;; real output:
;; counts: #(40239 39973 39860 39904 39998 40016 39788 39906 39987 40232
;;           39993 40340 39972 40101 40107 39728 39847 39839 40274 39896)
;; expected count per item (200000 * 4/20): 40000
;; predicted variance (200000 * 1/5 * 4/5): 32000
```

Every single one of the twenty items landed within roughly `500` of the predicted `40000` — including item `0`, one of the four items placed unconditionally during the initial fill, and item `19`, the very last item to arrive, facing a real inclusion draw at the very end of the stream. Those two items reached the reservoir through completely different mechanics — one placed automatically and then having to survive nineteen straight eviction rounds, the other having to win its own inclusion draw with only a fraction of a single round left to survive afterward — and yet both land at essentially the same real, measured frequency. Treating "was item `X` in the reservoir on trial `T`" as one Binomial trial with `p = k/n = 1/5`, the predicted variance across `200000` such trials is `200000 × (1/5) × (4/5) = 32000`, this lesson's own reuse of Lesson 155's variance formula; the real, measured spread across all twenty counts stays consistent with a variance of that rough size, exactly as the theory predicts, with no item standing out as suspiciously over- or under-represented.

### Connection

Three different sampling problems — repeats allowed, repeats forbidden, population not even fully known yet — have each produced a real, derived, verified procedure. What's left is tying all three together into one working picture, and being honest about what happens when one of this lesson's own load-bearing decisions gets removed.

---

## Closing

### Connect the Pieces

One real value, moving through all three procedures built in this lesson, start to finish:

```scheme
shards
;=> #(0 1 2 3 4 5 6 7 8 9)

(sample-with-replacement shards 5)
;=> (4 9 2 3 0)
```

Five requests, assigned shards with repeats allowed — nothing here checked whether `4`, `9`, `2`, `3`, and `0` were all distinct, because for this problem, they don't need to be.

```scheme
(sample-without-replacement shards 5)
;=> (4 5 1 3 6)
```

The same ten-shard population, now used for tonight's maintenance picks — five *distinct* shards this time, guaranteed by construction, verified for real, zero duplicates across 100,000 trials, earlier in this lesson.

```scheme
log-lines
;=> (0 1 2 3 4 5 6 7)

(reservoir-sample log-lines 3)
;=> (6 1 4)
```

The same shape of problem — pick a uniform random subset — but now over a stream instead of a vector, with no size known in advance and only one pass allowed, solved by keeping a running reservoir instead of shuffling a whole population at once. All three results share the exact same underlying guarantee this lesson opened by naming: every eligible outcome, exactly equally likely — proved by exact algebra for reservoir sampling, guaranteed by construction for the without-replacement case, and built directly into a single independent call to `random` for the with-replacement case.

### What Breaks Without This

Concept Unit 2's SE Lens named a real, deliberate design decision: `sample-without-replacement` copies `items` before doing anything else, specifically so the caller's own vector is never touched. Removing that one line, on purpose, to see exactly what breaks:

```scheme
(define (sample-without-replacement-buggy items k)
  (let ((pool items))   ; ← no vector-copy: pool is now just another name for the same vector
    (let loop ((i 0))
      (if (= i k)
          (vector->list (vector-copy pool 0 k))
          (let ((j (+ i (random (- (vector-length pool) i))))
                (temp (vector-ref pool i)))
            (vector-set! pool i (vector-ref pool j))
            (vector-set! pool j temp)
            (loop (+ i 1)))))))
```

Run for real:

```scheme
(define menu (vector 0 1 2 3 4 5 6 7 8 9))
(display "menu before: ") (display menu) (newline)
(display "sample: ") (display (sample-without-replacement-buggy menu 5)) (newline)
(display "menu after: ") (display menu) (newline)
;; real output:
;; menu before: #(0 1 2 3 4 5 6 7 8 9)
;; sample: (3 5 0 8 9)
;; menu after: #(3 5 0 8 9 1 6 7 2 4)
```

`menu` came in as `#(0 1 2 3 4 5 6 7 8 9)` and, after asking only for a `5`-item sample, came back as `#(3 5 0 8 9 1 6 7 2 4)` — every single slot rearranged, not just the first five. This is **aliasing**, exactly as named in this lesson's Header: with the defensive copy removed, `pool` was never a separate vector at all, just a second name for `menu` itself, so every `vector-set!` inside the loop was a real, permanent mutation of the caller's own data. Worse, the corruption isn't confined to the `k` positions that were actually requested — the shuffle's own `j` can land anywhere in the shrinking-but-still-large remaining range, so slots well past index `5` got touched too, here reaching all the way out to index `9`. Restoring the single line — `(let ((pool (vector-copy items))) ...)`, exactly as it stands in this lesson's own Concept Unit 2 — fixes it completely; every earlier real run in this lesson already confirmed `shards` stays untouched after any number of calls.

### Exercises

- `sample-without-replacement` currently has no guard against `k` being larger than the population: try calling it with `k = 15` on a ten-item vector for real, and read the actual error Guile produces. Then modify the procedure to detect `k > (vector-length items)` up front and report a clear, direct error instead — and confirm, by calling it again, that the clear version fires before any shuffling starts.
- `sample-with-replacement`'s result comes back in reverse-of-draw order, and this lesson's own SE Lens explained why that's acceptable here. Write a version that preserves draw order instead, using an approach other than `append`, and measure for real whether it changes this lesson's own `O(k)` time bound.
- Modify `reservoir-sample` to keep a reservoir of size `k = 1` and run it, for real, a few thousand times over a small, fixed-length stream, tallying which single stream position gets returned each time. Every position should come out close to equally often — confirm that for real, and connect the result back to this Concept Unit's own exact-rational proof at `k = 1`.
- This lesson's empirical reservoir-sampling check used `n = 20`, `k = 4`. Pick a very different pair — say `n = 1000`, `k = 3` — and rerun both the Monte Carlo frequency check and the exact-rational `survival-probability` check at a few real positions, confirming both still agree with `k / n`.

### Definition of Done

- [ ] `sample-with-replacement`, `sample-without-replacement`, and `reservoir-sample` are all defined, all actually run in Guile this session, with real output pasted in for every claim.
- [ ] `sample-without-replacement`'s zero-duplicate guarantee is backed by a real 100,000-trial check, not just a read of the code.
- [ ] Reservoir sampling's `k/n` claim is backed by both a real, large-scale Monte Carlo frequency check *and* an independent, exact-rational algebraic proof-check — not either one alone.
- [ ] The aliasing bug from skipping `sample-without-replacement`'s defensive copy has been caused on purpose, its real broken output observed, and the fix restored and reconfirmed.
- [ ] Every one of this lesson's three procedures' own execution traces has been followed by hand against its real printed output, not taken on faith.
- [ ] `git commit` — a message explaining *why* three separate procedures were needed instead of one general one: each solves a genuinely different constraint (repeats allowed, repeats forbidden, population size unknown), and no single one of the three satisfies all three problems at once.
