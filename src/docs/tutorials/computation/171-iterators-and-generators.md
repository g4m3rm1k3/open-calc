# Lesson 171: Iterators and Generators

**What you will build**: By the end of this lesson you'll build `next-fib`, a function producing one Fibonacci number *and* a real, resumable state to pick up exactly where it left off — no loop, no precomputed list, just a value and a state, over and over. Four successive calls produce `0, 1, 1, 2`; a small driver produces the first eight, `[0 1 1 2 3 5 8 13]`, without ever computing "all" Fibonacci numbers at once.

**What you need to know first**: Lesson 96's `heap-extract-min` and its own value-plus-updated-structure pair; Lesson 166's thunks, revisited here as a related but different way to defer work.

**Terms introduced in this lesson**:

- **generator** — a function producing one value at a time from an ongoing, potentially unbounded sequence, along with enough state to produce the next one on demand. *Why it matters*: a genuinely different shape than a function returning a whole collection at once — a generator never needs the *entire* sequence to exist anywhere, only the next value and a way to keep going.
- **suspension/resumption** — pausing a computation partway through, then continuing later from exactly that point rather than starting over. *Why it matters*: `next-fib`'s own returned state *is* the paused computation, made into a real, inspectable value — the same "capture and hand back a piece of computation" idea Lesson 169's continuations already used, applied here to picking up later instead of routing to a different place next.

**Objects and methods used**: None new. This lesson reuses `get`/`assoc`/`count` (Lesson 84, Lesson 94), each already covered.

---

## Concept Unit: A Value and a Resumable State, Not a Whole List

### The Problem

Computing "the first eight Fibonacci numbers" is easy with a loop that runs eight times. Computing "the next Fibonacci number, whenever asked, indefinitely" is a genuinely different problem — there's no fixed count to loop over, and no upper bound to stop at.

### Introduce the concept in isolation

```clojure
(defn next-fib [state]
  [(get state 0) [(get state 1) (+ (get state 0) (get state 1))]])
```

```
user=> (def r1 (next-fib [0 1]))
user=> r1
[0 [1 1]]
user=> (def r2 (next-fib (get r1 1)))
user=> r2
[1 [1 2]]
user=> (def r3 (next-fib (get r2 1)))
user=> r3
[1 [2 3]]
```

`next-fib` returns a pair: the *current* Fibonacci number (index `0`), and a *new state* (index `1`) to hand to the next call. `[0 1]` is the starting state — nothing computed yet. The first call returns `0` and a fresh state, `[1 1]`; feeding that state back in produces `1` and `[1 2]`; feeding *that* back in produces `1` again (the second `1` in the sequence) and `[2 3]`. Each call resumes exactly where the previous one left off — nothing is recomputed, and nothing about "how many numbers total" was ever decided in advance.

### Discard the throwaway example

Not applicable — `next-fib` is real, reusable, and verified across three successive calls producing the correct, real Fibonacci values.

### Project Change

- **Reference Source**: Lesson 96's own `heap-extract-min`, whose value-plus-updated-structure pair shape this lesson reuses directly, applied here to an unbounded sequence instead of a shrinking heap.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn next-fib [state]
  [(get state 0) [(get state 1) (+ (get state 0) (get state 1))]])
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get state 0)`**, returned first — the current value: whatever the previous call already decided was "next," now handed out.
- **`[(get state 1) (+ (get state 0) (get state 1))]`** — first appearance of this specific idea: the *new* state, built from the current state's own two numbers — `state`'s second slot becomes the new first slot, and their sum becomes the new second slot, the ordinary Fibonacci recurrence, but computed one step at a time rather than all at once.
- **`[value new-state]`**, the overall return shape — reappearing vector-as-pair (Lesson 85 onward, Lesson 96's own `heap-extract-min` specifically): a **generator**'s defining shape, one value plus everything needed to produce the next.

### CS Lens

`next-fib`'s returned state is **suspension and resumption**, made concrete: the computation genuinely pauses after producing one value, and the state vector *is* the paused computation, sitting there as an ordinary value until something calls `next-fib` on it again — no special language feature required, only ordinary data.

### SE Lens

Nothing about `next-fib` ever computes "all" Fibonacci numbers, or even decides how many will eventually be asked for — a real, practical property: a caller wanting the first three numbers and a caller wanting the first three thousand both use `next-fib` identically, paying only for however many calls they actually make.

---

## Concept Unit: Producing a Finite Prefix of an Unbounded Sequence

### The Problem

A generator alone produces one value per call. Can a small driver, built on top of it, produce a real, finite list of results — the first eight, say — without the generator itself ever needing to know that count in advance?

### Introduce the concept in isolation

```clojure
(declare take-step)
(defn take-n [state n i acc]
  (if (>= i n)
    acc
    (take-step (next-fib state) n i acc)))

(defn take-step [result n i acc]
  (take-n (get result 1) n (+ i 1) (assoc acc (count acc) (get result 0))))
```

```
user=> (take-n [0 1] 8 0 [])
[0 1 1 2 3 5 8 13]
```

`take-n` calls `next-fib` exactly `n` times, threading the returned state from each call into the next — `next-fib` itself never receives `n` at all; it has no idea a stopping point even exists. `take-n` is the piece deciding "stop after eight," entirely separate from `next-fib`'s own "produce one more" responsibility.

### Discard the throwaway example

Not applicable — `take-n`/`take-step` are real, reusable, and verified to produce the correct first eight Fibonacci numbers.

### Project Change

- **Reference Source**: No reference counterpart — a from-scratch driver built on this lesson's own `next-fib`.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn take-step [result n i acc]
  (take-n (get result 1) n (+ i 1) (assoc acc (count acc) (get result 0))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(take-step (next-fib state) n i acc)`**, in `take-n` — reappearing "compute once, pass to a helper" pattern (Lesson 56, 87, 89, 91): `next-fib` is called exactly once per step, its result handed to `take-step` rather than called again to extract each of its two slots separately.
- **`(get result 1)`, `(get result 0)`**, in `take-step` — reappearing pair-access (Lesson 85 onward): the new state feeds the next `take-n` call; the current value is appended to the accumulator.
- **`(assoc acc (count acc) (get result 0))`** — reappearing `assoc`-as-append (Lesson 94): the growing result list, one real Fibonacci number at a time.

### CS Lens

This is the exact relationship between a generator and an *iterator* in most real languages: the generator (`next-fib`) knows how to produce the next value; something else entirely (`take-n`, or a real language's own `for` loop) decides when to stop asking — two genuinely separate responsibilities, cleanly divided.

### SE Lens

Because `next-fib` never bakes in a stopping condition, the identical function serves `take-n` here and would serve an entirely different consumer wanting, say, "Fibonacci numbers less than 1000" instead of "the first eight" — that consumer would just call `next-fib` differently, with no change to `next-fib` itself required.

### Connection to the previous unit

The previous unit built one resumable step; this unit shows a real driver can turn repeated resumption into an ordinary, finite list — proving the suspend/resume model is genuinely usable, not just a conceptual curiosity.

---

## Connect the Pieces

One generator, two different ways of consuming it:

```clojure
(println "Three manual steps:" (get r1 0) (get r2 0) (get r3 0))
(println "Eight via take-n:" (take-n [0 1] 8 0 []))
```

```
Three manual steps: 0 1 1
Eight via take-n: [0 1 1 2 3 5 8 13]
```

The first three values, pulled by hand, agree exactly with the first three of `take-n`'s own eight — the identical generator, driven two different ways, always agreeing on what "next" means.

## What Breaks Without This

Suppose Fibonacci numbers were only ever available as a function computing "the first `n`, all at once" — no generator, no resumable state. Any code needing to check numbers one at a time and stop early on some condition (the first Fibonacci number over a million, say, with no known count in advance) would have to guess an `n` large enough, compute the whole list, and hope the guess was big enough — wasted work if the guess was too large, and a wrong answer entirely if it was too small. A real generator sidesteps the guess completely: ask for one more, exactly as many times as actually needed, never more.

## Exercises

1. **Trace.** By hand, using `next-fib`'s own definition, compute the fourth and fifth calls' results, continuing from `r4` in this lesson's own header example.
2. **Predict.** Before checking, predict `(take-n [0 1] 12 0 [])` — the first twelve Fibonacci numbers. Then verify.
3. **Verify.** Confirm `(get (take-n [0 1] 5 0 []) 4)` — the fifth element of a five-element result — matches the fifth value `next-fib`, called manually five times, would produce.
4. **Break it, on purpose.** Write a generator, `next-square`, producing successive perfect squares (`0, 1, 4, 9, ...`) instead of Fibonacci numbers, using the identical `[value new-state]` shape.
5. **Generalize.** Describe, without coding it, how `take-n` would need to change to stop based on a *condition* (the first value exceeding some limit) instead of a fixed count `n`.
6. **Reconstruct.** Close this lesson. From memory, explain why `next-fib` never needing to know how many values will eventually be requested is the real point of this lesson, not merely a minor implementation detail.

## Definition of Done

- [ ] You can build a generator returning a value-and-new-state pair, and call it repeatedly to produce a real sequence.
- [ ] You can build a driver that consumes a generator a fixed number of times without the generator itself knowing that count.
- [ ] You can explain why a generator's own state is a real instance of suspension and resumption, not just ordinary data.
- [ ] You completed Exercise 3 and confirmed manual and driven generator calls agree on the same value.
- [ ] You completed Exercise 4 and built a second, genuinely different generator using the identical shape.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and built — for example, `"Confirm 5th manual next-fib call matches take-n's 5th result; implement next-square generator, verify first 5 squares 0 1 4 9 16"` — not just `"lesson 171 exercise"`.

---

**Next lesson:** Lesson 172, *Coroutines*, generalizes this lesson's own suspend/resume idea one step further — not just producing values one at a time, but two separate computations trading control back and forth, each resuming exactly where it last paused.
