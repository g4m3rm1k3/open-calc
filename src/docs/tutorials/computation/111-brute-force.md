# Lesson 111: Brute Force

**What you will build**: By the end of this lesson you'll name directly what Lesson 110's `find-largest-from` already was — a **brute-force** algorithm, checking every possibility exhaustively — and reuse it repeatedly to build a complete sorting algorithm, establishing both its guaranteed correctness and its real, measured cost as the baseline every later, cleverer sorting algorithm in this section will be compared against.

**What you need to know first**: Lesson 110's `find-largest-from` and `is-largest?`; Lesson 94's `heap-swap`; Lesson 46's arithmetic series, for this lesson's cost derivation.

**Terms introduced in this lesson**:

- **brute force** (or **exhaustive search**) — an algorithm that checks every possibility a specification allows, guaranteeing correctness by never skipping a candidate that could matter. *Why it matters*: Lesson 110's `find-largest-from` already did this — examined every element, skipped none — without this series stopping to name the strategy directly; naming it now makes it a deliberate baseline to measure future algorithms against, not just one function's own implementation choice.

**Objects and methods used**: None new. This lesson reuses `heap-swap` (Lesson 94), `get`/`count` (Lesson 84), and `find-largest-from`'s own comparison shape (Lesson 110), each already covered.

---

## Concept Unit: Naming What `find-largest-from` Already Was

### The Problem

Lesson 110's `find-largest-from` checked every element in its input, one at a time, never skipping any. Was that thoroughness incidental to how the function happened to be written, or a deliberate strategy worth naming and reusing on purpose?

### Introduce the concept in isolation

**Brute force** is exactly this: check every possibility a specification allows, exhaustively, guaranteeing correctness because nothing that could matter is ever skipped. Lesson 110's `find-largest-from` is brute force, precisely — it examines every one of `n` elements, and its correctness proof (`is-largest?`, checked directly in that lesson) follows immediately *because* nothing was skipped: if the true maximum exists anywhere in the input, an exhaustive scan is guaranteed to pass over it.

### Discard the throwaway example

Not applicable — this unit names an already-built, already-verified algorithm, introducing no new code.

### CS Lens

Brute force's defining tradeoff is the opposite of every clever algorithm this series will build from here forward: it trades speed for a correctness argument that requires almost no cleverness to trust — "did it check everything?" is a much easier question to answer than "does this specific shortcut actually preserve correctness?", exactly the kind of question Lesson 91's `binary-search` needed a real proof (Lesson 93's structural induction lineage) to answer, that brute force never needs to ask at all.

### SE Lens

Establishing a brute-force baseline *before* building a faster algorithm is a genuine, common engineering discipline — it gives a slow-but-obviously-correct reference implementation to test faster candidates against, exactly the role `is-largest?` played for `buggy-find-largest` in Lesson 110, and the role this lesson's own sort will play for every faster sort this section builds next.

---

## Concept Unit: `max-index-from` — Locating, Not Just Finding

### The Problem

`find-largest-from` returns the largest *value*. Building a full sort needs something slightly different: the *position* of the largest value among only some of the elements — not the whole input, since earlier positions will already hold values placed by previous steps.

### Introduce the concept in isolation

```clojure
(defn max-index-from [values i best-i]
  (if (>= i (count values))
    best-i
    (if (> (get values i) (get values best-i))
      (max-index-from values (+ i 1) i)
      (max-index-from values (+ i 1) best-i))))
```

```
user=> (max-index-from [3 7 2 9 4] 0 0)
3
user=> (max-index-from [3 7 2 9 4] 1 1)
1
```

`(max-index-from [3 7 2 9 4] 0 0)` scans every position starting at `0`, tracking the *index* of the largest value seen so far (`best-i`), not the value itself — returns `3`, the position holding `9`. `(max-index-from [3 7 2 9 4] 1 1)` scans only from position `1` onward — a genuinely different, smaller exhaustive search, still brute force, just over a *subrange* rather than the whole input.

### Discard the throwaway example

Not applicable — `max-index-from` is a real, reusable function.

### Project Change

- **Reference Source**: `max-index-from` reuses Lesson 110's `find-largest`'s exact comparison shape, adapted to track an index (`best-i`) instead of a value, and to start its scan from an arbitrary position rather than always position `0`.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn max-index-from [values i best-i]
  (if (>= i (count values))
    best-i
    (if (> (get values i) (get values best-i))
      (max-index-from values (+ i 1) i)
      (max-index-from values (+ i 1) best-i))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(>= i (count values))`** — reappearing counting-up base case (Lesson 94): every position from the scan's own starting point through the end has been checked.
- **`(> (get values i) (get values best-i))`** — reappearing comparison (Lesson 110), now comparing two elements *by index* rather than a running value against an element — `best-i` always names a position, never a copied-out value.
- **`(max-index-from values (+ i 1) i)`** — first appearance of updating the *tracked index* itself, rather than a separately-carried best value, to `i` — the newly-found larger position becomes the new candidate.

### CS Lens

Starting the scan from an arbitrary position `i`, rather than always `0`, is still brute force in exactly this lesson's own sense — every remaining possibility, from `i` onward, is checked exhaustively; "brute force" describes *thoroughness over whatever range is in question*, not a commitment to always scanning an entire structure from its start.

### SE Lens

Returning an index rather than a value is what makes this function reusable for the next unit's purpose — sorting needs to know *where* the maximum sits, so it can be moved there, not merely what its value is, the same distinction between "found" and "found at" this series first drew back when Lesson 91's `binary-search` returned a position rather than a boolean.

### Connection to the previous unit

The previous unit named the strategy behind `find-largest-from`; this unit adapts the identical strategy — check everything, remaining, exhaustively — to answer a related but different question, position rather than value.

---

## Concept Unit: `brute-force-sort` — Repeated Exhaustive Search

### The Problem

If the largest remaining value's *position* can always be found exhaustively, can an entire list be sorted by repeatedly finding that position and placing it correctly — one value settled per pass, brute force applied over and over?

### Introduce the concept in isolation

```clojure
(defn brute-force-sort-from [values i]
  (if (>= i (count values))
    values
    (brute-force-sort-from (heap-swap values i (max-index-from values i i)) (+ i 1))))

(defn brute-force-sort [values]
  (brute-force-sort-from values 0))
```

```
user=> (brute-force-sort [3 7 2 9 4])
[9 7 4 3 2]
```

At each position `i`, `max-index-from` locates the largest value among positions `i` through the end; `heap-swap` (Lesson 94) moves it directly into position `i`. Once position `i` holds its final, correct value, the next call only ever searches positions `i+1` onward — never re-examining a position already settled. Five passes, one value locked into place each time, produces a fully descending sort.

### Discard the throwaway example

Not applicable — `brute-force-sort-from` and `brute-force-sort` are real, reusable functions.

### Project Change

- **Reference Source**: `brute-force-sort-from` reuses `max-index-from` (this lesson's own second unit) and `heap-swap` (Lesson 94) directly, combined here for the first time into a repeated, position-by-position placement.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn brute-force-sort [values]
  (brute-force-sort-from values 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(max-index-from values i i)`** — reappearing (this lesson's second unit), called fresh at every position `i`, always starting its own exhaustive scan from exactly where the previous pass left off.
- **`(heap-swap values i (max-index-from values i i))`** — reappearing `heap-swap` (Lesson 94), placing the located maximum directly into position `i` — a self-swap (when the maximum is already at `i`) is harmless, since `heap-swap` was already proven to handle that case correctly.
- **`(brute-force-sort-from ... (+ i 1))`** — reappearing counting-up recursion: exactly one position advances per pass, guaranteeing the process reaches every position exactly once.

### CS Lens

This is brute force applied *twice over*: exhaustively searching for the maximum (this lesson's second unit) *and* exhaustively repeating that search once per position — correctness follows from the identical argument both times: nothing is ever skipped, so nothing can be placed incorrectly.

### SE Lens

**Cost, measured precisely, not just asymptotically**: position `0`'s scan checks `5` elements, position `1`'s checks `4`, down to position `4`'s checking `1` — total comparisons `5+4+3+2+1=15$, exactly Lesson 46's arithmetic series formula, `n(n+1)/2$, for `n=5$. This is `O(n^2)$ — the real, honest baseline cost this section's later, cleverer sorts (Lesson 113's merge sort, Lesson 114's quick sort) will be measured against directly.

### Connection to the previous unit

The previous unit found one position's maximum; this unit repeats that exhaustive search once per position in the entire input, and Lesson 46's own arithmetic series gives its total cost a precise, derived number rather than only an asymptotic label.

---

## Connect the Pieces

The full sort, its cost, and a direct citation of what "baseline" means for this section going forward:

```clojure
(println "Sorted:" (brute-force-sort [3 7 2 9 4]))
(println "Total comparisons, n=5:" (+ 5 4 3 2 1))
(println "Arithmetic series formula, n(n+1)/2:" (/ (* 5 6) 2))
```

```
Sorted: [9 7 4 3 2]
Total comparisons, n=5: 15
Arithmetic series formula, n(n+1)/2: 15
```

A fully correct sort, its exact comparison count computed two ways and matching, and a name — brute force — that every faster algorithm in this section will be explicitly measured against from here forward.

## What Breaks Without This

Suppose `brute-force-sort-from` searched from position `0` every single pass, instead of from the current position `i` onward:

```clojure
(defn broken-sort-from [values i]
  (if (>= i (count values))
    values
    (broken-sort-from (heap-swap values i (max-index-from values 0 0)) (+ i 1))))
```

Every pass would find the *same* global maximum and swap it into position `i` — but once the true maximum has already been placed at position `0`, every later pass keeps re-finding *that same value* (now correctly the largest remaining in positions `0` onward, trivially, since it's still sitting right there) and swapping it with itself, never actually advancing the sort past position `0`'s own value for the rest of the array. `max-index-from`'s own starting position — matching `brute-force-sort-from`'s current `i`, not always `0$ — is what guarantees each pass genuinely searches only what remains unsettled.

## Exercises

1. **Trace.** By hand, trace `(brute-force-sort [5 1 4 2])`, showing every `max-index-from` call and every swap.
2. **Predict.** Before checking, predict `(brute-force-sort [1 2 3 4])` (already sorted). Does brute force still perform its full `O(n^2)$ comparisons, or does it recognize the input is already sorted and stop early?
3. **Verify.** Count `broken-sort-from`'s actual comparisons on `[3 7 2 9 4]`, and confirm the output is not fully sorted, using `is-largest?`-style reasoning (Lesson 110) on the *last* position to show it's wrong.
4. **Break it, on purpose.** Modify `max-index-from`'s comparison from `>` to `>=`, and explain, using this lesson's own no-op self-swap reasoning, whether this changes the final sorted result.
5. **Generalize.** Using Lesson 44's summation notation and Lesson 46's arithmetic series, derive the total comparison count for a general `n`, not just `n=5$, and confirm it matches `n(n+1)/2$.
6. **Reconstruct.** Close this lesson. From memory, explain why brute force's correctness argument is easy to trust, and derive its `O(n^2)$ cost from the arithmetic series, without looking back at this lesson's own worked numbers.

## Definition of Done

- [ ] You can explain brute force's defining property — exhaustiveness — and why it makes correctness easy to argue.
- [ ] You can implement `max-index-from` and explain why it starts its scan from a variable position, not always `0`.
- [ ] You can implement `brute-force-sort` and derive its `O(n^2)$ cost from Lesson 46's arithmetic series.
- [ ] You completed Exercise 3 and demonstrated `broken-sort-from`'s incorrect output concretely.
- [ ] You completed Exercise 5 and derived the general `n(n+1)/2$ comparison count.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you found and derived — for example, `"Confirm broken-sort-from leaves output unsorted; derive general n(n+1)/2 comparison count via Lesson 46's arithmetic series"` — not just `"lesson 111 exercise"`.

---

**Next lesson:** Lesson 112, *Divide and Conquer*, derives a genuinely different strategy — breaking a problem into smaller pieces solved independently — establishing the technique Lesson 113's merge sort will use to beat this lesson's own `O(n^2)$ baseline decisively.
