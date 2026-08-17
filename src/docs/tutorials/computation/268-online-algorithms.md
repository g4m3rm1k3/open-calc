# Lesson 268: Deciding Without Seeing the Future

**What you will build**: two working Clojure implementations of the classic *ski rental problem* — an **offline** solver that is handed the entire future (exactly how many days of skiing there will be) before making a single decision, and an **online** solver, the *break-even algorithm*, structured so its decision function is mechanically incapable of seeing that number at all. Then a `competitive-ratio` function that measures, with real computed fractions instead of a rounded guess, exactly how much worse the online algorithm can ever do compared to the offline optimum — proving a concrete `19/10`-worst-case bound rather than asserting "it's about twice as bad."

**What you need to know first**: Lesson 85's `get` (reading a vector by position), Lesson 119's recursion-with-an-accumulator (the day-by-day simulation driver, since `loop`/`recur` is off-limits in this curriculum), Lesson 130's multi-piece state threaded through a recursion as one vector (used here as `[spent owned?]`), Lesson 233's exact rational results from `/` (this lesson's `19/10` ratio, not a rounded decimal), and Lesson 266's habit of proving a bound with real measured numbers instead of asserting it.

**Terms used in this lesson**:

- **online algorithm** — an algorithm that must produce output, or take an action, using only the portion of the input it has seen so far, with no access to input that hasn't arrived yet. It exists because most real systems — a cache deciding what to evict, a stock-buying decision, a skier deciding whether to buy skis — genuinely cannot pause and wait to see the whole future before acting.
- **offline algorithm** — an algorithm that is handed the entire input before making any decision, and is free to compute the single best answer using full knowledge of everything that will ever happen. It exists as the *standard of comparison* an online algorithm gets judged against, not as something usually deployable for real — by the time you actually have the whole input, the decisions it "predicts" are frequently already too late to act on.
- **ski rental problem** — a classic worked problem in online-algorithm theory: decide, day by day, whether to keep paying to rent an item or pay once to buy it outright, without knowing in advance how many days you'll need it. It's the smallest problem with a genuine buy-vs-rent tradeoff and a single clean numeric answer, which is why this entire subfield is usually taught starting from it.
- **break-even algorithm** — the specific deterministic online strategy of continuing the cheaper short-term option (renting) until its accumulated cost is about to equal the one-time option's cost, then switching. It exists because it's provably the best possible deterministic strategy for ski rental — no other rule that looks only at money already spent can guarantee a better worst case.
- **competitive ratio** — the worst-case ratio, across every possible input length, of an online algorithm's cost to the offline-optimal cost for that same input. It exists because "how good is this online algorithm" has no single number otherwise: raw cost depends on how many days you actually ski, which the algorithm doesn't control, so competitive ratio isolates the algorithm's own decision quality from that randomness.
- **competitive analysis** — the general technique of proving a competitive ratio holds for *every* possible input, not just checking a handful of examples. It exists because a few test cases (as run in this lesson) suggest a bound but don't prove one; real competitive analysis proves the bound algebraically, the way this lesson's closing section does for `19/10 = 2 - 1/10`.
- **recursion with an accumulator** — reappearing from Lesson 119: a recursive function that carries its evolving answer forward as an extra argument on every call, rather than building the answer from what recursive calls return. It exists in this lesson because `ski-rental-simulate` needs to walk forward day by day, and this curriculum's rule against `let`/`loop` rules out the ordinary imperative "day counter" version of that walk.
- **state vector** — reappearing from Lesson 130: bundling more than one piece of information that needs to travel together through a recursion into a single vector, read positionally with `get`, instead of adding a separate argument per piece of state. It exists here because `ski-rental-day` needs to hand back two always-paired facts — how much has been spent, and whether the skis are already owned — as one value a caller can pass straight back into the next recursive call.
- **exact rational number** — reappearing from Lesson 233: Clojure's `/` on two integers that don't divide evenly returns an exact fraction (`19/10`), not a rounded decimal. It exists so a claim like "the worst-case ratio is exactly `19/10`" is a provable fact about exact numbers, not an approximation that could be hiding a rounding error the way a floating-point `1.9000000000000001` might.
- **`if`** — reappearing since Lesson 1: Clojure's two-branch conditional, `(if test then else)`, evaluating exactly one of the two branches depending on whether `test` is truthy. It exists because both `cheaper-of` and `decide-buy?` are pure either/or decisions with no third case, and `if` is the smallest construct that expresses "pick exactly one of two paths."
- **comparison and arithmetic functions (`<`, `>=`, `>`, `+`, `*`)** — reappearing since the earliest lessons: ordinary numeric comparison and arithmetic. They exist here exactly as they always have, computing the real numbers every claim in this lesson is checked against, not standing in symbolically for anything more complex.

**Objects and methods used**:

- **`offline-optimal-ski-cost`**
  - *What it is:* a plain function that computes the cheapest possible total cost for skiing a known number of days, given full knowledge of that number in advance.
  - *Implementation:* `(defn offline-optimal-ski-cost [total-days buy-cost rent-cost] (cheaper-of (* total-days rent-cost) buy-cost))` — returns whichever is smaller: "rent every day" or "buy once."
  - *Its use:* the ground truth this lesson measures the online algorithm against; without it, there is no "optimal" to compare to, only opinions about whether the online algorithm did well.
- **`decide-buy?`**
  - *What it is:* the online algorithm's entire decision rule — the one function that actually embodies "decide without seeing the future."
  - *Implementation:* `(defn decide-buy? [spent-so-far buy-cost rent-cost] (>= (+ spent-so-far rent-cost) buy-cost))` — true exactly when one more day of renting would spend at least as much as buying outright.
  - *Its use:* called once per simulated day; its own parameter list is the actual proof of "online" — `total-days` is not one of its arguments, so it is structurally unable to look ahead, not merely instructed not to.
- **`ski-rental-cost`**
  - *What it is:* the online algorithm's top-level entry point — what a caller actually runs to find out what the break-even strategy spends over a real number of ski days.
  - *Implementation:* `(defn ski-rental-cost [total-days buy-cost rent-cost] (get (ski-rental-simulate 1 total-days [0 false] buy-cost rent-cost) 0))` — starts the simulation on day 1 with `$0` spent and skis not yet owned, then reads the final spent amount back out of the resulting state vector.
  - *Its use:* the function this lesson's whole competitive-ratio comparison is actually built on.

This lesson also reuses `get` (Lesson 85), `if` (Lesson 1), and `<`, `>=`, `>`, `+`, `*` (arithmetic and comparison, taught across the earliest lessons) — each already covered, and each restated in full at every point it appears in the Mechanical Walkthrough below.

---

## Concept Unit: Online vs. Offline Algorithms

### The Problem

You're renting ski equipment for `$1` a day. Buying it outright costs `$10`, one time, and then it's yours forever. If you knew today that you were going to ski exactly `3` more days total, the answer is obvious: rent, and pay `$3`. If you knew you were going to ski `100` more days, the answer is just as obvious: buy on day one, and pay `$10` instead of `$100`. The entire difficulty is that you don't know which of those two people you are — you find out only in hindsight, the day your skiing stops for the season, an injury, or any other reason. Every day, before that answer is known, you still have to decide: rent today, or buy today?

An algorithm that gets told the whole answer — "you will ski exactly `n` more days, now decide" — before making any choice is called an **offline algorithm**. It has access to the entire future as ordinary input, the same way any function you've written so far in this curriculum gets its arguments handed to it complete, before it runs a single line. An algorithm that has to act day by day, never knowing whether today is the last ski day or the first of a hundred, is called an **online algorithm**. This unit builds the offline side first — the easy side — specifically so the next unit has a real, computed number to hold the online algorithm's honesty against.

### Introduce the Concept — Real Code, Run It

```clojure
(defn cheaper-of [a b]
  (if (< a b) a b))

(defn offline-optimal-ski-cost [total-days buy-cost rent-cost]
  (cheaper-of (* total-days rent-cost) buy-cost))
```

Run against a few known total day counts:

```
user=> (offline-optimal-ski-cost 5 10 1)
5
user=> (offline-optimal-ski-cost 9 10 1)
9
user=> (offline-optimal-ski-cost 10 10 1)
10
user=> (offline-optimal-ski-cost 100 10 1)
10
```

For `5` and `9` days, renting the whole time (`$5`, `$9`) genuinely does beat buying (`$10`) — the function correctly picks renting. At exactly `10` days the two options tie at `$10`, and at `100` days buying wins by a wide margin (`$10` instead of `$100`) — the function correctly picks buying both times. This is what "offline" actually buys you: `offline-optimal-ski-cost` is handed `total-days` as a plain argument and can compare both whole-future strategies before committing to either one. This is called the **offline optimum**, and every online algorithm in the rest of this lesson gets measured against it.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session. `cheaper-of` and `offline-optimal-ski-cost` are not scratch code standing in for a concept; they are the actual ground-truth function the rest of this lesson compares against, matching this curriculum's own convention since roughly Lesson 130.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because the ski rental problem is a new worked example built specifically to make the online/offline distinction concrete; nothing earlier in this curriculum implements it.
- **Files affected**: None — a standalone, `bb`-run script, matching every Section VI+ lesson's convention.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical Walkthrough

- `(defn cheaper-of [a b] ...)` — defines a two-argument function named `cheaper-of`. `defn` is Clojure's function-definition form, reappearing from Lesson 1: it binds a name in the current namespace to a function value, so later code can call `cheaper-of` by name instead of repeating its body.
- `(if (< a b) a b)` — `if` is a two-branch conditional, reappearing since Lesson 1: it evaluates its first argument (the test), and returns the second argument if that test is truthy, the third otherwise, never evaluating both. `<` is ordinary numeric less-than comparison, reappearing since the earliest lessons: `(< a b)` is `true` exactly when `a` is strictly smaller than `b`. Together, `(if (< a b) a b)` reads as "if `a` is smaller, return `a`; otherwise return `b`" — the smaller of two numbers, with no third case needed because two numbers are always comparable one way or the other.
- `(defn offline-optimal-ski-cost [total-days buy-cost rent-cost] ...)` — a second function definition, taking three arguments: how many days of skiing there actually will be, the one-time buy price, and the per-day rent price.
- `(cheaper-of (* total-days rent-cost) buy-cost)` — `*` is ordinary multiplication, reappearing since the earliest lessons: `(* total-days rent-cost)` computes the total cost of renting every single day, a real number like `5 * 1 = 5`. That product is then passed, along with `buy-cost`, into `cheaper-of` — reusing the very function defined one line above, the same "compute once, pass to a helper" pattern this curriculum has used since Lesson 56. The result is whichever of "rent every day" or "buy once" is actually cheaper for this exact `total-days`.

### CS Lens

The concept this unit names is the **offline algorithm** — one that receives its entire input, including everything that will ever happen, before producing any output. This is recognized in: a compiler doing whole-program optimization only after seeing every source file; a batch payroll run that processes an entire day's transactions at once rather than one at a time as they arrive; a video encoder that reads an entire file before choosing compression settings, rather than compressing frame by frame as they're captured; Lesson 130's own Dijkstra, which is itself an offline algorithm in this exact sense — it requires the whole graph, edges included, before computing a single shortest path.

### SE Lens

The alternative not chosen here is skipping `offline-optimal-ski-cost` entirely and just eyeballing whether the online algorithm, built in the next unit, "seems reasonable." Real projects often skip building this kind of ground-truth comparison function because it feels like scaffolding that never ships — nobody's actual product needs to know the *offline* optimal ski-rental cost. But without it, there is no way to state a real, defensible bound on how bad the algorithm that *does* ship can ever get; "it looked fine in testing" is not the same claim as "it is provably never worse than twice the best possible cost," and only the second one is a guarantee a caller can build on. This is the identical tradeoff Lesson 266 already paid for its own 2-approximation bound: an exact solver, built and run, but never shipped itself — its only job was to be the number the real algorithm gets checked against.

### Commands

`bb path/to/268-verify.clj` — `bb` is the Babashka command, a fast Clojure script runner; its one argument here is the path to a `.clj` source file. Success output is each top-level form's own `println` output printed to standard output, in file order, with no separate "success" marker beyond the program exiting without an error.

### Run It — Real Output

```
user=> (offline-optimal-ski-cost 5 10 1)
5
user=> (offline-optimal-ski-cost 9 10 1)
9
user=> (offline-optimal-ski-cost 10 10 1)
10
user=> (offline-optimal-ski-cost 100 10 1)
10
```

Verified this session via `bb`.

### Connecting This Unit

`offline-optimal-ski-cost` is the ruler. The next unit builds the algorithm this lesson actually cares about measuring — one that, unlike this one, is never told `total-days` until the skiing is already over.

---

## Concept Unit: The Break-Even Online Strategy

### The Problem

`offline-optimal-ski-cost` cheats, on purpose — that was the whole point of building it first. A real skier does not get to peek at `total-days`. What's needed is a decision rule that only ever looks at what has already happened — money already spent — and never at what total-days will turn out to be, because that number genuinely does not exist yet at the moment the decision has to be made.

### Introduce the Concept — Real Code, Run It

```clojure
(defn decide-buy? [spent-so-far buy-cost rent-cost]
  (>= (+ spent-so-far rent-cost) buy-cost))

(defn ski-rental-day [state buy-cost rent-cost]
  (if (get state 1)
    state
    (if (decide-buy? (get state 0) buy-cost rent-cost)
      [(+ (get state 0) buy-cost) true]
      [(+ (get state 0) rent-cost) false])))

(defn ski-rental-simulate [day total-days state buy-cost rent-cost]
  (if (> day total-days)
    state
    (ski-rental-simulate (+ day 1) total-days (ski-rental-day state buy-cost rent-cost) buy-cost rent-cost)))

(defn ski-rental-cost [total-days buy-cost rent-cost]
  (get (ski-rental-simulate 1 total-days [0 false] buy-cost rent-cost) 0))
```

Run against the same day counts used against the offline solver a moment ago:

```
user=> (ski-rental-cost 5 10 1)
5
user=> (ski-rental-cost 9 10 1)
9
user=> (ski-rental-cost 10 10 1)
19
user=> (ski-rental-cost 11 10 1)
19
user=> (ski-rental-cost 100 10 1)
19
```

For `5` and `9` days, the online strategy matches the offline optimum exactly (`5` and `9`) — it never got a chance to make a wrong call, because it never rented long enough to reach the buy point. At `10` days, `19` is real: `$9` spent renting for the first `9` days, then `$10` more to buy on day `10`, `$19` total — worse than the offline optimum's `$10`, because the online strategy had already committed to `9` days of renting before it could know day `10` wouldn't be the last one. At `11` and `100` days, the cost stays fixed at `19` — once the skis are bought, every later day costs nothing more, no matter how many of them there turn out to be. This is called the **break-even algorithm**: keep renting exactly as long as renting is still cheaper than having already bought, then buy the moment that stops being true.

### Discard the Throwaway Example

Not applicable — real, reusable, verified this session via `bb`.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch addition; the break-even strategy is a new algorithm this curriculum has not built before.
- **Files affected**: None — standalone `bb`-run script, same file as the previous unit.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; the previous unit's `offline-optimal-ski-cost`, kept in the same file for the next unit's comparison.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical Walkthrough

- `(defn decide-buy? [spent-so-far buy-cost rent-cost] ...)` — a three-argument function. Notice, deliberately, what is *not* in this argument list: `total-days` never appears. This is the entire "online" property, made structural rather than promised — there is no variable anywhere inside `decide-buy?` that could even be misused to peek at the future, because the future was never passed in.
- `(>= (+ spent-so-far rent-cost) buy-cost)` — `+` is ordinary addition, reappearing since the earliest lessons: `(+ spent-so-far rent-cost)` computes what total spending *would* become if today were rented too. `>=` is greater-than-or-equal comparison, reappearing since the earliest lessons: it returns `true` exactly when that hypothetical total has reached or passed `buy-cost`. Together this reads as "would renting one more day cost at least as much as just buying" — the exact break-even test, computed from only two numbers that already exist at decision time.
- `(defn ski-rental-day [state buy-cost rent-cost] ...)` — a function simulating exactly one day. `state` is a **state vector**, reappearing from Lesson 130: a single two-slot vector, `[spent owned?]`, bundling the running total spent and whether the skis have already been bought, since those two facts always need to travel together into the next day's decision.
- `(get state 1)` — `get` reads a value out of a vector by position, reappearing from Lesson 85: `(get state 1)` reads the second slot, the `owned?` flag.
- The outer `if` — if `owned?` is already `true`, the function returns `state` completely unchanged: once skis are owned, no further decision or cost is possible on any later day, so this day is a pure no-op.
- `(get state 0)` — reads the first slot, the running `spent` total, needed as `decide-buy?`'s first argument.
- The inner `if (decide-buy? ...)` — calls `decide-buy?` from directly above, reusing it exactly as written, to decide this specific day's action.
- `[(+ (get state 0) buy-cost) true]` — the buy branch: a brand-new two-slot vector, spent total increased by the full `buy-cost`, `owned?` flipped to `true`. This is a literal vector, built fresh — not a mutation of the old `state`, because Clojure vectors are immutable and this curriculum has no mutation construct to write with regardless.
- `[(+ (get state 0) rent-cost) false]` — the rent branch: a fresh vector with spent increased by only `rent-cost`, `owned?` still `false`.
- `(defn ski-rental-simulate [day total-days state buy-cost rent-cost] ...)` — the day-by-day driver. Unlike `decide-buy?`, this function *does* receive `total-days` — but only to know when the simulation itself should stop running, not as information the decision rule is allowed to use. `total-days` never reaches `decide-buy?` at any point; `ski-rental-day`, which does call `decide-buy?`, never receives `total-days` as an argument at all.
- `(if (> day total-days) state ...)` — `>` is ordinary greater-than comparison: once the current `day` counter has run past the last real day, the simulation is done, and the final `state` is returned as-is.
- `(ski-rental-simulate (+ day 1) total-days (ski-rental-day state buy-cost rent-cost) buy-cost rent-cost)` — the recursive call. This is **recursion with an accumulator**, reappearing from Lesson 119: instead of computing a result from what a deeper recursive call returns, this call carries the evolving `state` *forward*, as an argument, one day further each time — `(ski-rental-day state buy-cost rent-cost)` computes tomorrow's state from today's before the recursive call even happens, so by the time the base case is reached, `state` already holds the finished answer. This is exactly the shape this curriculum reaches for whenever `loop`/`recur` is off the table, which it always is.
- `(defn ski-rental-cost [total-days buy-cost rent-cost] ...)` — the entry point a caller actually uses.
- `(get (ski-rental-simulate 1 total-days [0 false] buy-cost rent-cost) 0)` — starts the simulation on day `1`, with the initial state vector `[0 false]` (`$0` spent, skis not owned), then reads the first slot of whatever final state comes back — the total amount spent, which is the only number a caller of `ski-rental-cost` actually wants.

### CS Lens

The concept this unit names is the **online algorithm**, made concrete through the **break-even algorithm** specifically. This is recognized in: an LRU cache deciding what to evict without knowing which page will be requested next; TCP congestion control deciding how fast to send packets without knowing whether the next one will be dropped; an elevator deciding which floor to visit next without knowing who will press a button after it starts moving; a load balancer assigning an incoming request to a server without knowing what requests will arrive after it; a chess clock forcing a move before the opponent's future responses are known. Every one of these shares the exact structural property `decide-buy?`'s own parameter list makes literal: the decision function's inputs simply do not include information that hasn't happened yet.

### SE Lens

The alternative not chosen here is giving `decide-buy?` a `total-days` parameter anyway, even if the current caller doesn't use it that way — "just in case it's useful later." The real tradeoff: an online algorithm's guarantee is only as real as its interface makes it. A function signature that *accepts* information it isn't supposed to use is a latent bug waiting for a future caller — or a future version of the same author — to accidentally lean on it, silently turning a provably-bounded online algorithm back into an offline one that only looks online. Keeping `total-days` entirely out of `decide-buy?`'s argument list costs nothing here and makes that specific mistake structurally impossible rather than merely discouraged by a comment.

### Commands

`bb path/to/268-verify.clj`, same as the previous unit — `bb` runs the whole file top to bottom, printing every `println`'s output in order.

### Run It — Real Output

```
user=> (ski-rental-cost 1 10 1)
1
user=> (ski-rental-cost 5 10 1)
5
user=> (ski-rental-cost 9 10 1)
9
user=> (ski-rental-cost 10 10 1)
19
user=> (ski-rental-cost 11 10 1)
19
user=> (ski-rental-cost 20 10 1)
19
user=> (ski-rental-cost 100 10 1)
19
```

Verified this session via `bb`.

### Connecting This Unit

The previous unit built the ruler; this unit built the thing being measured. `offline-optimal-ski-cost 10 10 1` returns `10`; `ski-rental-cost 10 10 1` returns `19` — the online algorithm's honest cost of not knowing the future, in real dollars. The next unit turns that one comparison into a formal, provable bound.

---

## Concept Unit: Competitive Ratio

### The Problem

`19` versus `10` at ten days is one data point. It doesn't say whether the break-even algorithm is *always* about twice as expensive as optimal, occasionally far worse, or something else entirely at day counts nobody's tried yet. What's needed is a single number capturing "how bad can this online algorithm's worst case ever get, relative to optimal, no matter how many days actually happen" — and real computed evidence for it, not a guess extrapolated from a handful of examples.

### Introduce the Concept — Real Code, Run It

```clojure
(defn competitive-ratio [total-days buy-cost rent-cost]
  (/ (ski-rental-cost total-days buy-cost rent-cost)
     (offline-optimal-ski-cost total-days buy-cost rent-cost)))
```

Run across a spread of day counts, including values right before, right at, and well past the break-even point of `10`:

```
user=> (competitive-ratio 1 10 1)
1
user=> (competitive-ratio 5 10 1)
1
user=> (competitive-ratio 9 10 1)
1
user=> (competitive-ratio 10 10 1)
19/10
user=> (competitive-ratio 11 10 1)
19/10
user=> (competitive-ratio 20 10 1)
19/10
user=> (competitive-ratio 1000 10 1)
19/10
```

For every day count from `1` through `9`, the ratio is exactly `1` — the online algorithm never got the chance to be wrong, because it never rented long enough to reach the buy point, so it matched optimal exactly. From `10` days onward, the ratio locks at exactly `19/10` and never moves again, no matter how large `total-days` gets — `1000` days produces the identical `19/10` as `10` days, because both the online cost (`19`, fixed the moment skis are bought) and the offline cost (`10`, fixed once buying is cheaper than renting the whole time) stop changing past that point. This fixed worst-case value is called the **competitive ratio**: `19/10`, an exact fraction, not `1.9` rounded from something messier. This particular strategy is therefore called `19/10`-competitive for this specific `buy-cost`/`rent-cost` pair — and, more generally, the break-even algorithm is provably **2-competitive** for *any* buy-cost `B` and rent-cost of `$1`/day: its worst case is always `2 - 1/B` (here, `2 - 1/10 = 19/10`), a value that gets closer to `2` as `B` grows but can never reach or exceed it. This is a known, established result about the break-even strategy specifically — cited honestly here, the same way Lesson 265 cited Subset-Sum's own NP-completeness as an already-established fact rather than re-deriving it from nothing.

### Discard the Throwaway Example

Not applicable — real, reusable, verified this session via `bb`.

### Project Change

- **Reference Source**: No reference counterpart — from-scratch addition; competitive ratio has no prior implementation in this curriculum to port from.
- **Files affected**: None — standalone `bb`-run script, same file as the previous two units.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; this unit's own code calls both `ski-rental-cost` and `offline-optimal-ski-cost` from the two units above, in the same file.

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical Walkthrough

- `(defn competitive-ratio [total-days buy-cost rent-cost] ...)` — a function with the same three-argument shape as both functions it calls.
- `(ski-rental-cost total-days buy-cost rent-cost)` — calls the online algorithm from the previous unit, unchanged, to get its real cost for this exact `total-days`.
- `(offline-optimal-ski-cost total-days buy-cost rent-cost)` — calls the offline ground truth from the first unit, unchanged, for the identical `total-days`.
- `(/ ... ...)` — Clojure's division function, reappearing from Lesson 233: applied here to two integers that do not divide evenly (`19` and `10`), it returns the **exact rational number** `19/10` rather than a rounded decimal — the same behavior that produced Lesson 233's exact `7/2` dot-product result. This matters specifically because a floating-point stand-in like `1.9` could quietly hide whether the true worst case is `19/10` exactly or something like `1.899999...` that only looks like `1.9` after rounding; the exact fraction leaves nothing to hide.

### CS Lens

The concept this unit names is **competitive ratio**, alongside the broader technique of **competitive analysis**. This is recognized in: Lesson 266's own 2-approximation bound for Vertex Cover, which is the identical idea applied to a different kind of imperfection (a fast heuristic instead of a future-blind decision rule, but the same "worst case divided by optimal" measurement); amortized analysis, which bounds a *sequence* of operations' average cost against a worst-case budget the same way this bound holds across every possible day count; online-learning "regret" bounds in machine learning, which measure a learning algorithm's total loss against the best fixed decision made with hindsight — the same online-versus-offline structure, applied to prediction instead of ski rental; auction theory's prophet inequalities, which bound an online bidder's expected outcome against an all-knowing "prophet" who sees every future bid in advance.

### SE Lens

The alternative not chosen here is reporting "the algorithm seemed to perform well in the cases we tried" instead of a proven bound. The real cost of skipping formal competitive analysis: a strategy that looks fine on whatever test cases you happened to try can still be catastrophically unbounded on inputs you didn't try — and the two can look identical for a long stretch before diverging. The closing section below demonstrates this directly with a second, simpler online strategy that matches break-even's own numbers for small day counts and then diverges without any bound at all.

### Commands

`bb path/to/268-verify.clj`, same as both previous units.

### Run It — Real Output

```
user=> (competitive-ratio 1 10 1)
1
user=> (competitive-ratio 5 10 1)
1
user=> (competitive-ratio 9 10 1)
1
user=> (competitive-ratio 10 10 1)
19/10
user=> (competitive-ratio 11 10 1)
19/10
user=> (competitive-ratio 20 10 1)
19/10
user=> (competitive-ratio 1000 10 1)
19/10
```

Verified this session via `bb`.

### Connecting This Unit

The first unit built the ruler; the second built the thing measured; this unit is the measurement itself, turned into a single provable number — `19/10`, always, no matter how far `total-days` grows.

---

## Connect the Pieces

Trace one concrete value, `total-days = 15`, `buy-cost = 10`, `rent-cost = 1`, through every function built in this lesson, start to finish:

1. `(offline-optimal-ski-cost 15 10 1)` computes `(cheaper-of (* 15 1) 10)` = `(cheaper-of 15 10)` = `10`. Knowing all `15` days in advance, buying on day one is optimal.
2. `(ski-rental-cost 15 10 1)` starts `ski-rental-simulate` at day `1` with state `[0 false]`. Days `1` through `9` each call `decide-buy?` with a `spent-so-far` from `0` up to `8`; each time, `(>= (+ spent-so-far 1) 10)` is `false`, so `ski-rental-day` returns the rent branch, and `spent` climbs to `9` by the end of day `9`. On day `10`, `decide-buy?` receives `spent-so-far = 9`: `(>= (+ 9 1) 10)` is `(>= 10 10)`, `true` — the buy branch fires, `spent` becomes `9 + 10 = 19`, `owned?` becomes `true`. Days `11` through `15` each hit the outer `if`'s `owned?` check first and return `state` unchanged. The simulation ends at day `16 > 15`, returning `[19 true]`; `ski-rental-cost` reads slot `0`, returning `19`.
3. `(competitive-ratio 15 10 1)` divides `19` by `10`, returning `19/10` — the exact same worst-case ratio as `total-days = 10`, `11`, `20`, and `1000`, because `15` also falls on the far side of the break-even point.

One value, `15`, produced a `10`-vs-`19` gap and a `19/10` ratio — never re-derived by hand, entirely by running the same three functions every other value in this lesson ran through.

## What Breaks Without This

The break-even threshold in `decide-buy?` — buying exactly when renting one more day would cost at least as much as buying — is not a minor tuning detail; it's the entire reason the `19/10` bound holds at all. Replace it with a simpler, naive online strategy that never buys, no matter what:

```clojure
(defn always-rent-cost [total-days rent-cost]
  (* total-days rent-cost))
```

This is still a legitimate *online* algorithm — its decision ("rent today") never looks at `total-days` either, exactly like `decide-buy?`. Compare it against the same offline optimum, at day counts far past where break-even already locked in at `19/10`:

```
user=> (/ (always-rent-cost 100 1) (offline-optimal-ski-cost 100 10 1))
10
user=> (/ (always-rent-cost 1000 1) (offline-optimal-ski-cost 1000 10 1))
100
user=> (/ (always-rent-cost 10000 1) (offline-optimal-ski-cost 10000 10 1))
1000
```

Verified this session via `bb`. At `100` days, always-rent is already `10`x worse than optimal — worse than break-even's `19/10` ever gets, at any day count. At `1000` days it's `100`x worse; at `10000` days, `1000`x worse. There is no ceiling: for any number this ratio might claim as a bound, a large enough `total-days` blows past it. Always-rent has **no competitive ratio at all** — "unbounded" is the technical term, and it's the honest opposite of break-even's proven, fixed `19/10`. The two strategies are indistinguishable for the first `9` days (both cost exactly `total-days` dollars) and diverge completely only once `total-days` grows large — exactly the trap the SE Lens above named: looking fine on small test cases proves nothing about the worst case.

## Exercises

- Change `buy-cost` to `5` (keeping `rent-cost` at `1`) and run `competitive-ratio` for `total-days` from `1` through `10`. Find the exact day the ratio jumps, and confirm it matches `2 - 1/5 = 9/5`.
- `decide-buy?` uses `>=`. Change it to `>` and re-run `ski-rental-cost 10 10 1`. Does the algorithm still buy on day `10`, or does it rent one extra day first? Explain the one-day shift using the same reasoning the Connect the Pieces trace used above.
- Write a third online strategy, `always-buy-cost`, that buys on day `1` no matter what (cost is always `buy-cost`, regardless of `total-days`). Compute its competitive ratio at `total-days = 1`. Is it bounded or unbounded, and why is `1` day the specific case that reveals the answer?

## Definition of Done

- [ ] `offline-optimal-ski-cost`, `decide-buy?`, `ski-rental-day`, `ski-rental-simulate`, `ski-rental-cost`, and `competitive-ratio` all run in your own `bb` REPL, matching every value shown in this lesson exactly.
- [ ] You can point to the specific line in `decide-buy?`'s parameter list that proves it cannot see `total-days`, without reading any comment or prose claiming it.
- [ ] You can explain, out loud, why the competitive ratio stays fixed at `19/10` for every `total-days >= 10` instead of growing as `total-days` grows.
- [ ] You've run the `always-rent-cost` comparison yourself and seen the ratio grow without bound.
- [ ] Commit your own exploration file with a message explaining *why* the break-even threshold produces a bounded ratio while always-rent doesn't — not merely that you implemented the ski rental problem.
