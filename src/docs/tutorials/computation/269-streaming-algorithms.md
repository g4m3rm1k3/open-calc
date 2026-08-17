# Lesson 269: Streaming Algorithms

**What you will build**: a single-pass algorithm — the Boyer-Moore majority vote algorithm — that finds a majority element in a sequence of data using a working state that is always exactly two numbers, no matter how long the sequence is, measured directly against a naive full-storage approach whose memory grows with the data itself. The transferable problem: how to compute a real answer over data too large, or too continuous, to ever hold in memory all at once, seeing each piece exactly once — and how to know when a fast single-pass answer needs a second look before it can be trusted.

**What you need to know first**: Lesson 84's vectors and index-based `get`; Lesson 89's hash tables (Clojure maps) built up with `assoc`; Lesson 119's recursion-with-accumulator, this curriculum's replacement for `loop`/`recur`; Lesson 85's vector-as-pair state, threaded through recursion via `(get state 0)`/`(get state 1)` instead of destructuring; Lesson 264's certificate/candidate framing — a fast proposed answer, checked afterward by a separate, cheaper computation; Lesson 268's online-algorithm framing this lesson extends — an algorithm that must act without having seen the whole input yet.

**Terms used in this lesson**

- **streaming algorithm** — an algorithm that processes its input as a sequence of items arriving one at a time, and that is never allowed to hold the entire input in memory at once. It exists because real input — a live sensor feed, a network connection, a log file larger than available memory — is sometimes too large, or arrives too continuously, to collect in full before computation can even start.
- **single-pass algorithm** — an algorithm that reads every input item exactly once, in the order it arrives, and never goes back to re-read an item already processed. This is the mechanical restriction a streaming algorithm imposes on itself, since "store everything so it can be re-read later" is exactly the thing a real stream makes impossible.
- **sublinear space** — a memory budget for the algorithm's own working state that does not grow in proportion to the input's size: fixed, or growing only as slowly as the logarithm of the input size. This is the actual measurable bar behind the word "streaming" — a single-pass algorithm that still remembers everything it has ever seen has only solved the re-reading problem, not the memory problem.
- **majority element** — an element of a sequence that occurs strictly more than half of the sequence's total length. This is the concrete problem this lesson solves under the streaming constraint.
- **candidate** — a proposed answer a fast algorithm produces without yet proving it correct, distinguished from a verified answer by having cost less — here, less memory — to produce than a full proof would.
- **certificate** (verification pass) — reappearing from Lesson 264's `verify-subset-sum`: a second, separate computation, run after a candidate answer already exists, that checks whether the candidate is actually correct. Cheaper than finding the answer was, but still a real, executed computation, never an assumption.

**Objects and methods used**

- **`build-frequencies`**
  - *What it is:* this lesson's own naive, full-storage baseline — a function that scans a stream once and returns a complete count of every distinct value it saw.
  - *Implementation:* `(defn build-frequencies [stream index frequencies] ...)`, recursion-with-accumulator over a vector `stream`, returning a Clojure map from item to occurrence count.
  - *Its use:* the thing this lesson measures against, to prove Boyer-Moore's fixed state is smaller by actual, counted numbers — not just smaller by claim.
- **`majority-apply`** / **`majority-step`** / **`stream-majority-candidate`** / **`find-majority-candidate`**
  - *What it is:* the Boyer-Moore majority-vote algorithm, split into its single-step decision logic (`majority-apply`) and the recursion that drives it across a whole stream.
  - *Implementation:* `majority-apply` takes `[candidate tally item]` and returns a new `[candidate tally]` pair; `stream-majority-candidate` calls it once per index, threading the pair forward as an accumulator; `find-majority-candidate` unwraps the final candidate.
  - *Its use:* this lesson's central algorithm — proposes a majority-element candidate in one pass, using a state that never grows past two values, regardless of stream length.
- **`count-matches`** / **`is-majority?`**
  - *What it is:* the certificate pass that checks whether a candidate `find-majority-candidate` produced is an actual majority element.
  - *Implementation:* `count-matches` recounts one specific candidate's occurrences in one more single pass; `is-majority?` compares that count against half the stream's length using only integer multiplication, no division.
  - *Its use:* proves — or disproves — a Boyer-Moore candidate, since Boyer-Moore alone will answer confidently even when no true majority exists.

This lesson also reuses vectors and index-based `get` (Lesson 84), Clojure maps built with `assoc` (Lesson 89), recursion-with-accumulator in place of `loop`/`recur` (Lesson 119), vector-as-pair state threaded through recursion (Lesson 85), and the certificate/candidate framing (Lesson 264), each already covered.

---

## Concept Unit: The Streaming Model

### The Problem

Every algorithm built so far in this curriculum — sorting, searching, graph traversal, dynamic programming, even Lesson 268's online ski-rental decision — has had its entire input sitting in a vector or a value before the algorithm ever starts running. `merge-sort` gets handed the whole vector up front. `dijkstra` gets handed the whole graph. Even Lesson 268's online algorithm, which had to commit to a decision without knowing how many days were left, could still inspect every day it had already lived through at will.

Now imagine the input does not fit anywhere at all. A network router has to report the most common source address it has seen, but it cannot store every packet header that has ever passed through it — there could be billions, and the router only has a few kilobytes of fast memory. A sensor logging a reading once a second for a year produces over thirty million readings; a monitoring app cannot keep all of them in memory just to answer "which value came up the most?" In both cases, the data arrives once, in order, and then it is gone unless something was done with it the moment it arrived.

This is the problem a streaming algorithm exists to solve: compute a real answer over data read exactly once, in order, using a working-memory budget that does not grow just because the input got longer.

### Introduce the concept in isolation

To see exactly what goes wrong with the ordinary approach, build the obvious one and measure it directly. Given a sequence of values, the ordinary way to find "what showed up the most" is to keep a running count of every distinct value seen so far, using Lesson 89's hash tables:

```clojure
(defn frequency-of
  [frequencies item]
  (if (get frequencies item)
    (get frequencies item)
    0))

(defn count-into
  [frequencies item]
  (assoc frequencies item (+ (frequency-of frequencies item) 1)))

(defn build-frequencies
  [stream index frequencies]
  (if (= index (count stream))
    frequencies
    (build-frequencies stream (+ index 1) (count-into frequencies (get stream index)))))
```

Run it against two different streams — one with three distinct values, one where every value is distinct:

```
user=> (build-frequencies ["a" "b" "a" "a" "c" "a" "a"] 0 {})
{"a" 5, "b" 1, "c" 1}
user=> (count (build-frequencies ["a" "b" "a" "a" "c" "a" "a"] 0 {}))
3
user=> (build-frequencies ["a" "b" "c" "d" "e"] 0 {})
{"a" 1, "b" 1, "c" 1, "d" 1, "e" 1}
user=> (count (build-frequencies ["a" "b" "c" "d" "e"] 0 {}))
5
user=> (count ["a" "b" "c" "d" "e"])
5
```

`build-frequencies` genuinely is single-pass — it reads `stream` from index `0` to the end exactly once, never re-reading an earlier index. But its memory use is not fixed: the second stream has five distinct values, so the resulting map has exactly five entries — as many entries as the stream had elements. If a stream kept growing and every new value differed from every value before it, this map would grow without bound, one entry per new element, forever.

That unbounded growth is exactly what **sublinear space** rules out. `build-frequencies` reads the stream once, but it does not compute in sublinear space, because its own memory use is tied directly to how many distinct values the stream has produced so far. Being single-pass and being a genuine **streaming algorithm** are two different claims — this function proves it satisfies only the first one.

### Discard the throwaway example

Not applicable — `build-frequencies` is real, hand-verified code (verified this session via `bb`), and stays in this lesson as the baseline the rest of the lesson measures against; it is not a throwaway.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because Section XII's lessons are standalone `bb`-verified demonstrations, not edits to a persistent project file.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

This is the exact code shown and run above. Per this curriculum's own convention, established since roughly Lesson 130: for a from-scratch algorithm, the isolated demonstration is the real, reusable code — not a separate throwaway version discarded afterward.

### The Updated Project

Skipped — no enclosing file exists yet; `frequency-of`, `count-into`, and `build-frequencies` are brand-new, freestanding functions with nothing to show them inside.

### Mechanical Walkthrough

- `(defn frequency-of [frequencies item] ...)` — `defn` defines a new named function; `frequency-of` is its name; `[frequencies item]` is its parameter vector, two positional parameters, no destructuring.
- `(if (get frequencies item) (get frequencies item) 0)` — `if` is the three-part conditional: a test, a then-branch, an else-branch, evaluating only the branch its test selects.
- `(get frequencies item)`, as the test — `get` here is the two-argument form on a Clojure map: given a map and a key, it returns the value stored under that key, or `nil` if the key is absent. `frequencies` is a read of the first parameter; `item` is a read of the second.
- The `if`'s test relies on Clojure's truthiness rule, already established: every value is truthy except `nil` and `false`. So this test is really asking "did `get` find something real?" — if the key was never stored, `get` returns `nil`, which is falsy, and the else-branch runs.
- The then-branch repeats `(get frequencies item)` — since the test already proved the key is present, this call safely returns the real stored count.
- The else-branch is the literal `0` — the count to use for an item never seen before.
- `(defn count-into [frequencies item] ...)` — same `defn`/name/parameter-vector pattern as above, this time building the next version of the map.
- `(assoc frequencies item (+ (frequency-of frequencies item) 1))` — `assoc` is the three-argument form: given a map, a key, and a new value, it returns a **new** map with that key set to that value. Clojure maps are immutable, the same structural-sharing discipline established back in Lesson 104's persistent data structures — `assoc` never changes the map handed to it, it returns a fresh one, reusing whatever structure it can. `frequencies` is the map argument; `item` is the key argument; `(+ (frequency-of frequencies item) 1)` is the value argument.
- `(+ (frequency-of frequencies item) 1)` — `+` is ordinary two-argument addition; `(frequency-of frequencies item)` calls the just-defined function, passing the current map and item, to get the count-so-far before adding one.
- `(defn build-frequencies [stream index frequencies] ...)` — three parameters: `stream`, the vector being read; `index`, the current read position; `frequencies`, the accumulator carrying the map built so far — this is exactly Lesson 119's recursion-with-accumulator pattern, used here in place of `loop`/`recur`.
- `(if (= index (count stream)) frequencies (build-frequencies ...))` — the base-case test. `=` is equality comparison; `(count stream)` calls `count` on the vector `stream`, returning its length (Lesson 84). When `index` has reached that length, every position has been read, and the then-branch returns `frequencies` — the finished map.
- The else-branch, `(build-frequencies stream (+ index 1) (count-into frequencies (get stream index)))`, is the recursive call: `stream` is passed unchanged; `(+ index 1)` advances the read position by one; `(count-into frequencies (get stream index))` computes the next accumulator — `(get stream index)` is `get`'s other form, on a vector by integer index (Lesson 84), reading the element currently at `index`, which is then handed to `count-into` along with the map built so far.

### CS Lens

This is **space complexity** treated as a first-class constraint, independent of time complexity — a computation can be fast and still be disqualified for using too much memory. Also recognized in: a live video broadcast's encoder computing running statistics without ever buffering the whole broadcast, a network router's per-packet counters, a database engine scanning a table too large to fit in RAM, an embedded sensor with only kilobytes of memory, and log analysis tools processing files larger than the machine's own disk cache.

### SE Lens

The alternative not chosen here is "just use more memory" — buffer the whole input, or write it to disk and process it later, offline, once it has all arrived. The real tradeoff: sometimes there is no later — a live, unbounded feed never finishes arriving, and a monitoring system that needs an answer *now* cannot wait for a batch job to run tonight. The honest cost this lesson is about to demonstrate is that trading memory for speed this way often means trading certainty for speed too: a streaming algorithm can only look at each item once, so it frequently can only produce a fast **candidate** answer rather than a fully proven one, which is exactly the debt Concept Unit 3 pays down.

### Commands

Run this file with Babashka, a fast, no-JVM-startup Clojure interpreter this curriculum has used since Section VI: `bb path/to/file.clj`. `bb` is the program name; the single argument is the path to the `.clj` script to execute top to bottom. Success looks like the script running to completion with no error printed; each `(println ...)` call inside it prints one line of real output.

### Run it

Already run and shown above — `build-frequencies` genuinely single-pass, but its own memory grows to match the number of distinct values, not fixed.

### Connecting this unit

This unit establishes the actual bar — sublinear space, not just single-pass reading — that the next unit's algorithm has to clear for real, not just claim to clear.

---

## Concept Unit: Boyer-Moore Majority Vote

### The Problem

Concept Unit 1 proved that reading a stream once is not enough on its own — `build-frequencies` does that, and its memory still grows with the data. Is there any way to find a majority element using memory that stays genuinely fixed, no matter how long the stream gets or how many distinct values it contains?

### Introduce the concept in isolation

```clojure
(defn majority-apply
  [candidate tally item]
  (if (= tally 0)
    [item 1]
    (if (= item candidate)
      [candidate (+ tally 1)]
      [candidate (- tally 1)])))

(defn majority-step
  [state item]
  (majority-apply (get state 0) (get state 1) item))

(defn stream-majority-candidate
  [stream index state]
  (if (= index (count stream))
    state
    (stream-majority-candidate stream (+ index 1) (majority-step state (get stream index)))))

(defn find-majority-candidate
  [stream]
  (get (stream-majority-candidate stream 0 [nil 0]) 0))
```

Run it against the same seven-element stream from Concept Unit 1:

```
user=> (find-majority-candidate ["a" "b" "a" "a" "c" "a" "a"])
"a"
user=> (stream-majority-candidate ["a" "b" "a" "a" "c" "a" "a"] 0 [nil 0])
["a" 3]
```

Every step this algorithm takes uses only two numbers of state — a `candidate` and a `tally` — regardless of how long the stream is or how many distinct values it holds. This is called the **Boyer-Moore majority vote algorithm**: on each new item, if the tally has hit zero, adopt the new item as the candidate and reset the tally to one; otherwise, increment the tally if the item matches the current candidate, or decrement it if it does not.

The full trace, item by item, over `["a" "b" "a" "a" "c" "a" "a"]` starting from `[nil 0]`:

```
Iteration 1: index 0 → 1, item "a", tally 0 → 1, candidate nil → "a" (tally was 0, so "a" becomes the new candidate)
Iteration 2: index 1 → 2, item "b", tally 1 → 0, candidate "a" unchanged ("b" ≠ candidate "a", so decrement)
Iteration 3: index 2 → 3, item "a", tally 0 → 1, candidate "a" unchanged (tally was 0, so "a" becomes the new candidate — already "a")
Iteration 4: index 3 → 4, item "a", tally 1 → 2, candidate "a" unchanged ("a" = candidate "a", so increment)
Iteration 5: index 4 → 5, item "c", tally 2 → 1, candidate "a" unchanged ("c" ≠ candidate "a", so decrement)
Iteration 6: index 5 → 6, item "a", tally 1 → 2, candidate "a" unchanged ("a" = candidate "a", so increment)
Iteration 7: index 6 → 7, item "a", tally 2 → 3, candidate "a" unchanged ("a" = candidate "a", so increment)
```

`index` now equals `(count stream)`, `7`, so the base case returns the final state, `["a" 3]` — matching the real run above exactly.

Now run it against a stream where no element is a true majority — three values, two occurrences each, six elements total, so nothing occurs more than three times:

```
user=> (find-majority-candidate ["a" "a" "b" "b" "c" "c"])
"c"
user=> (stream-majority-candidate ["a" "a" "b" "b" "c" "c"] 0 [nil 0])
["c" 2]
```

The algorithm still answers — confidently — with `"c"`, even though `"c"` only appears twice out of six elements, nowhere near a majority. Boyer-Moore never checks its own answer; it only ever proposes one. This confirmed, real result is the exact reason Concept Unit 3 exists.

### Discard the throwaway example

Not applicable — `majority-apply`, `majority-step`, `stream-majority-candidate`, and `find-majority-candidate` are real, hand-verified code (verified this session via `bb`), and are this lesson's actual algorithm, not a throwaway.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because Section XII's lessons are standalone `bb`-verified demonstrations, not edits to a persistent project file.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

This is the exact code shown and run above, per the same since-Lesson-130 convention noted in Concept Unit 1.

### The Updated Project

Skipped — no enclosing file exists yet; these four functions are brand-new and freestanding.

### Mechanical Walkthrough

- `(defn majority-apply [candidate tally item] ...)` — `defn`, function name `majority-apply`, three parameters: `candidate` (the currently-proposed element, or `nil` if none yet), `tally` (a plain integer — deliberately not named `count`, to avoid shadowing the real `count` function this lesson also calls elsewhere), `item` (the next value from the stream).
- `(if (= tally 0) [item 1] ...)` — `if`'s test, `(= tally 0)`, equality comparison between the `tally` parameter and the literal `0`. When true, the then-branch is `[item 1]` — a two-element vector literal (Lesson 84), pairing the incoming `item` as the new candidate with a fresh tally of `1`. This is the "adopt a new candidate" case.
- The else-branch is itself another `if`: `(if (= item candidate) [candidate (+ tally 1)] [candidate (- tally 1)])`. Its test, `(= item candidate)`, checks whether the current item matches the standing candidate.
- When it matches, `[candidate (+ tally 1)]` — a vector pairing the unchanged `candidate` with `(+ tally 1)`, ordinary addition incrementing the tally by one — the "reinforce" case.
- When it does not match, `[candidate (- tally 1)]` — pairing the unchanged `candidate` with `(- tally 1)`, ordinary subtraction decrementing the tally by one — the "cancel out" case. This decrement is the entire mechanism: one item that disagrees with the candidate cancels out one item that agreed with it, so a true majority element can never be fully cancelled away, no matter how the other elements are ordered.
- `(defn majority-step [state item] ...)` — a thin wrapper: `state` is a `[candidate tally]` pair (Lesson 85's vector-as-pair convention), `item` the next stream value.
- `(majority-apply (get state 0) (get state 1) item)` — `get` on a vector by index (Lesson 84): `(get state 0)` reads the candidate out of the pair, `(get state 1)` reads the tally, both passed to `majority-apply` along with `item`, producing the next `[candidate tally]` pair.
- `(defn stream-majority-candidate [stream index state] ...)` — recursion-with-accumulator (Lesson 119) again: `stream` the vector being read, `index` the current position, `state` the `[candidate tally]` pair carried forward.
- `(if (= index (count stream)) state (stream-majority-candidate ...))` — the base case: once `index` reaches the stream's length (`count`, Lesson 84), every element has been read, and the then-branch returns `state` as-is — the final `[candidate tally]` pair.
- The recursive call, `(stream-majority-candidate stream (+ index 1) (majority-step state (get stream index)))`, advances `index` by one and computes the next `state` via `majority-step`, fed the current `state` and `(get stream index)` — `get` on a vector by index again, reading the element at the current position before advancing past it.
- `(defn find-majority-candidate [stream] ...)` — a single-parameter wrapper.
- `(get (stream-majority-candidate stream 0 [nil 0]) 0)` — calls `stream-majority-candidate` starting at `index` `0` with the initial state `[nil 0]` — `nil`, no candidate yet, and tally `0`, forcing the very first item to be adopted immediately, per the first `if` branch above — then `get`s index `0` out of the final pair, returning just the candidate, discarding the tally the caller does not need.

### CS Lens

This is a **greedy, invariant-preserving streaming algorithm** — it never looks back, never reconsiders a past decision, and yet the "cancel out" mechanism guarantees a real invariant: if a majority element exists, it can survive being decremented by every non-majority element and still end up as the returned candidate, because there are strictly more of it than everything else combined. Also recognized in: reference counting in memory management (an object's count only rises or falls by one event at a time, never recomputed from scratch), running vote tallies in election-night reporting, and any "net signal from noisy agreement/disagreement events" problem, such as a recommendation system's simple upvote-minus-downvote score.

### SE Lens

The alternative not chosen is `build-frequencies` from Concept Unit 1 — more information, easier to reason about, but unbounded memory. Boyer-Moore trades that safety net away deliberately: it commits to a running belief about the answer and never keeps enough state to double-check itself mid-stream. The real cost, made concrete at the end of Concept Unit 1's run above, is that this algorithm will always answer, even on a stream with no true majority — and the algorithm itself has no way to know it was wrong. Carrying that debt honestly, rather than hiding it, is exactly why Concept Unit 3 exists next.

### Commands

Same `bb path/to/file.clj` invocation as Concept Unit 1: `bb` is the interpreter, the single argument is the script's path, and success looks like every `(println ...)` line printing without an error interrupting the run.

### Run it

Already run and shown above — `"a"` on the true-majority stream, matching the hand-traced `["a" 3]` state exactly; `"c"` on the no-majority stream, a confident but wrong answer.

### Connecting this unit

Concept Unit 1 showed *how much* memory the naive approach costs; this unit shows a real algorithm that avoids that cost entirely — at the price of sometimes being wrong without knowing it, which the next unit has to address.

---

## Concept Unit: Verifying the Candidate

### The Problem

The run at the end of Concept Unit 2 already proved the gap: `find-majority-candidate` returned `"c"` for a stream where nothing is actually a majority. Boyer-Moore itself has no way to tell its two outcomes apart — a genuine majority element and a wrong guess look identical from inside the algorithm, since both just end up as whatever `candidate` survives to the last step. Something has to check the candidate against the real data before it can be trusted.

### Introduce the concept in isolation

```clojure
(defn matches-step
  [matches candidate item]
  (if (= item candidate)
    (+ matches 1)
    matches))

(defn count-matches
  [stream index candidate matches]
  (if (= index (count stream))
    matches
    (count-matches stream (+ index 1) candidate (matches-step matches candidate (get stream index)))))

(defn is-majority?
  [stream candidate]
  (> (* 2 (count-matches stream 0 candidate 0)) (count stream)))
```

Run it against both candidates produced in Concept Unit 2:

```
user=> (is-majority? ["a" "b" "a" "a" "c" "a" "a"] "a")
true
user=> (count-matches ["a" "b" "a" "a" "c" "a" "a"] 0 "a" 0)
5
user=> (is-majority? ["a" "a" "b" "b" "c" "c"] "c")
false
user=> (count-matches ["a" "a" "b" "b" "c" "c"] 0 "c" 0)
2
```

`"a"` really does appear `5` times out of `7`, and `5 * 2 = 10 > 7`, so `is-majority?` confirms it. `"c"` only appears `2` times out of `6`, and `2 * 2 = 4`, which is not greater than `6`, so `is-majority?` correctly rejects it — catching, with a real run, the exact wrong answer Boyer-Moore produced at the end of Concept Unit 2.

This is a **certificate** pass, reappearing from Lesson 264's `verify-subset-sum`: a second, independent computation that checks a proposed answer instead of trusting it. `count-matches` is itself another genuine single-pass, fixed-state algorithm — its own working state is just one running integer, `matches` — so verifying a candidate costs the same kind of streaming-friendly pass that produced the candidate in the first place, not a return to `build-frequencies`'s unbounded memory.

### Discard the throwaway example

Not applicable — `matches-step`, `count-matches`, and `is-majority?` are real, hand-verified code (verified this session via `bb`), and are this lesson's actual certificate pass, not a throwaway.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because Section XII's lessons are standalone `bb`-verified demonstrations, not edits to a persistent project file.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

This is the exact code shown and run above, per the same since-Lesson-130 convention noted in the earlier units.

### The Updated Project

Skipped — no enclosing file exists yet; these three functions are brand-new and freestanding.

### Mechanical Walkthrough

- `(defn matches-step [matches candidate item] ...)` — `defn`, name `matches-step`, three parameters: `matches` (a running integer count, deliberately not named `count`, for the same shadowing reason as Concept Unit 2's `tally`), `candidate` (the fixed value being checked), `item` (the current stream value).
- `(if (= item candidate) (+ matches 1) matches)` — `if`'s test, `(= item candidate)`, equality between the current item and the fixed candidate. Then-branch: `(+ matches 1)`, ordinary addition incrementing the running count by one. Else-branch: `matches`, a plain read of the parameter, unchanged — the count only ever grows on an actual match.
- `(defn count-matches [stream index candidate matches] ...)` — recursion-with-accumulator (Lesson 119) once more: `stream` the vector, `index` the position, `candidate` fixed for the whole call, `matches` the accumulator.
- `(if (= index (count stream)) matches ...)` — the base case: `=` compares `index` against `(count stream)` (Lesson 84's `count` on a vector); once every position has been read, the then-branch returns `matches`, the final tally.
- The recursive call, `(count-matches stream (+ index 1) candidate (matches-step matches candidate (get stream index)))`, advances `index` by one, keeps `candidate` unchanged, and computes the next `matches` via `matches-step`, fed the current `matches`, the fixed `candidate`, and `(get stream index)` — `get` on a vector by index, reading the element about to be checked.
- `(defn is-majority? [stream candidate] ...)` — a two-parameter function; the trailing `?` is this curriculum's own naming convention for a function that returns a true/false answer, established since the earliest predicate lessons.
- `(> (* 2 (count-matches stream 0 candidate 0)) (count stream))` — `count-matches stream 0 candidate 0` starts the pass at index `0` with a `matches` accumulator of `0`, computing the real number of times `candidate` occurs. `*` multiplies that result by the literal `2`. `>` then compares that doubled value against `(count stream)`, the stream's own length. Doubling the match count and comparing against the plain length is exactly equivalent to comparing the match count against half the length, without ever computing a fraction — this curriculum's established preference for exact integer arithmetic over division, reused from Lesson 268's exact competitive-ratio rationals.

### CS Lens

This is the **candidate-and-certificate pattern**, restated from Lesson 264's NP-verification framing but now inside the streaming model specifically: a cheap pass proposes an answer, and a second, separately-run cheap pass either confirms or refutes it, and only the combination of both is trustworthy. Also recognized in: a spell-checker's suggestion followed by a dictionary lookup to confirm it, a compiler's optimistic type inference followed by a real type-check pass, and a cache's speculative pre-fetch followed by a validity check before the cached value is actually served.

### SE Lens

The alternative not chosen is trusting `find-majority-candidate`'s output outright, since Concept Unit 2's own trace already proved that would sometimes be wrong. The real tradeoff: verification here is not free — it is a second full pass over the stream, doubling the total read time — but it stays inside the same sublinear-space budget the first pass used, so the memory cost this whole lesson is about stays paid. The honest debt this pattern still carries: `is-majority?` can only be run once the stream has actually ended, since it needs the true final length to compare against; a system that needs a trustworthy answer *before* the stream is known to be over cannot lean on this certificate pass alone, and would need the probabilistic techniques Lesson 270 picks up next.

### Commands

Same `bb path/to/file.clj` invocation as the earlier units: `bb` is the interpreter, the single argument is the script's path, and success looks like every `(println ...)` line printing without an error interrupting the run.

### Run it

Already run and shown above — `true` for the genuine majority `"a"`, `false` for the wrong candidate `"c"`, both matching the hand-computed counts exactly.

### Connecting this unit

This closes the loop Concept Unit 2 opened: a streaming algorithm that only ever proposes an answer is now paired with a streaming-friendly way to actually know whether that answer was right.

---

## Connect the pieces

Follow the value `"a"` through the whole lesson, using the seven-element stream `["a" "b" "a" "a" "c" "a" "a"]`. `build-frequencies` (Concept Unit 1) would need a three-entry map — `{"a" 5, "b" 1, "c" 1}` — just to notice `"a"` is the most common value, and that map would have grown to five entries instead of three had every value been distinct, proving its memory is not fixed. `find-majority-candidate` (Concept Unit 2) reaches the same conclusion, `"a"`, using a state that was never more than two numbers at any point in its seven-step trace — `[nil 0]` growing only ever to `["a" 3]`, never a third slot. `is-majority?` (Concept Unit 3) then spends one more single pass, `count-matches`, to confirm `"a"` genuinely occurs `5` times, and `5 * 2 = 10 > 7` certifies it — turning Concept Unit 2's fast, fixed-memory guess into a proven answer, at the cost of reading the stream a second time, still without ever storing more than a running integer.

## What breaks without this

Boyer-Moore's entire correctness rests on one specific line: when the tally hits zero, the *new item* becomes the candidate. Break exactly that, leaving everything else the same:

```clojure
(defn majority-apply-broken
  [candidate tally item]
  (if (= tally 0)
    [candidate 1]
    (if (= item candidate)
      [candidate (+ tally 1)]
      [candidate (- tally 1)])))
```

The only change is `[item 1]` becoming `[candidate 1]` in the zero-tally branch — the tally still resets to `1`, but the candidate is never actually replaced. Run it against the exact same true-majority stream Concept Unit 2 used:

```
user=> (find-majority-candidate-broken ["a" "b" "a" "a" "c" "a" "a"])
nil
user=> (stream-majority-candidate-broken ["a" "b" "a" "a" "c" "a" "a"] 0 [nil 0])
[nil 1]
```

The algorithm now returns `nil` — no candidate at all — even though `"a"` is a genuine, decisive majority in this stream. Starting from `[nil 0]`, the first item hits the zero-tally branch and produces `[nil 1]` — the tally resets, but `candidate` stays `nil`, because the broken branch reuses the old `candidate` instead of adopting `item`. Every following item then compares itself against `nil`, which never matches anything real, so the tally decrements right back to `0` on the very next step — and the zero-tally branch fires again, and again produces `[nil 1]`, forever. The tally oscillates between `1` and `0` for the rest of the stream and `candidate` never becomes anything but `nil`, no matter what the stream actually contains. Restoring the single line — `[item 1]` in place of `[candidate 1]` — brings back the correct `["a" 3]` traced in Concept Unit 2.

## Exercises

- Construct a stream with no true majority element of your own choosing (not the `["a" "a" "b" "b" "c" "c"]` one from this lesson), run `find-majority-candidate` on it, then run `is-majority?` on whatever candidate it returns, and confirm the certificate reports `false`.
- Using `build-frequencies`, compute how many map entries a stream of `10,000` sensor readings would need if the sensor only ever reports one of `4` distinct states. Compare that fixed number against `find-majority-candidate`'s state, which is always exactly `2` numbers regardless of how long the stream runs.
- `count-matches` currently has to read the whole stream a second time to verify a candidate. Write a version that computes `matches` for **every** distinct value in one combined pass instead of one candidate at a time, and explain, in your own words, why that version is no longer a fixed-memory streaming algorithm — connect the answer directly back to Concept Unit 1's `build-frequencies`.

## Definition of done

- [ ] `build-frequencies`, `find-majority-candidate`, and `is-majority?` all run in `bb` with no errors, producing the exact outputs shown in this lesson.
- [ ] You can state, from memory, the one-sentence difference between "single-pass" and "sublinear space," and give a real example of an algorithm that is one but not the other.
- [ ] You can trace `majority-apply` by hand across a five-item stream you invent yourself, predicting the final `[candidate tally]` before running it, and then confirm your prediction with a real `bb` run.
- [ ] You have run the broken `majority-apply-broken` version yourself and can explain, without looking back at this lesson, why the candidate gets stuck at `nil`.
- [ ] `git commit -m "Add Boyer-Moore majority vote as a streaming algorithm, since a majority element needs single-pass, fixed-state computation, not full frequency storage"`
