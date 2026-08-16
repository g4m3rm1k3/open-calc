# Lesson 120: Longest Common Subsequence

**What you will build**: By the end of this lesson you'll apply Lesson 119's four-part recipe — state, transition, base case, order — to a state genuinely more complex than a single number: a *pair* of positions, one into each of two strings, deriving the length of their longest common subsequence completely, verified cell by cell against a real hand trace.

**What you need to know first**: Lesson 119's four-part dynamic-programming recipe; Lesson 101's `get` on strings; Lesson 30's `max`.

**Terms introduced in this lesson**:

- **subsequence** — a sequence derivable from another by deleting zero or more elements, *without* reordering what remains. *Why it matters*: distinct from a **substring** (which must be contiguous) — `"AC"` is a subsequence of `"ABC"` (delete `"B"`) but not a substring of it.
- **longest common subsequence (LCS)** — the longest sequence that is a subsequence of *both* of two given sequences. *Why it matters*: this lesson's actual problem — genuinely different from anything comparison-based sorting or coin change asked, needing a two-dimensional state to answer.

**Objects and methods used**: None new. This lesson reuses `get` on strings (Lesson 101), `assoc`, `count` (Lesson 84, Lesson 94), and `max` (Lesson 30), each already covered.

---

## Concept Unit: State and Base Case — a Position in *Two* Strings at Once

### The Problem

Lesson 119's `dp[a]` needed one number to describe a subproblem — an amount. Comparing two entire strings for their longest common subsequence needs to track progress through *both* at once. What, precisely, does a subproblem need to specify here?

### Introduce the concept in isolation

**State**: `dp[i][j]` — the length of the longest common subsequence of the first `i` characters of `x` and the first `j` characters of `y`. **Base case**: `dp[0][j] = 0` for every `j`, and `dp[i][0] = 0` for every `i` — an empty prefix of either string shares no characters with anything.

```clojure
(defn zero-row [width j row]
  (if (> j width)
    row
    (zero-row width (+ j 1) (assoc row j 0))))
```

```
user=> (zero-row 2 1 [0])
[0 0 0]
```

`zero-row` builds one entire base-case row — `dp[0][0]` through `dp[0][\text{width}]`, all zero — the starting point every later row's own transition will read from.

### Discard the throwaway example

Not applicable — `zero-row` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct translation of the base case "an empty prefix shares nothing," using Lesson 94's `assoc`-as-append convention to build one row at a time.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn zero-row [width j row]
  (if (> j width)
    row
    (zero-row width (+ j 1) (assoc row j 0))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(assoc row j 0)`** — reappearing `assoc`-as-append (Lesson 94): each position gets `0` directly, no comparison needed — the base case is unconditional.
- **`(> j width)`** — reappearing counting-up base case (Lesson 94): stops once every column of this one row has been filled.

### CS Lens

A `dp[i][j]` table is Lesson 105's own digit-indexed structure in spirit — two independent coordinates, each narrowing which subproblem is meant — though built here from nested vectors (a vector of rows) rather than a fixed branching factor.

### SE Lens

Building the base-case row *explicitly*, as real data, rather than only asserting "it's all zero" in prose, is exactly Lesson 93's `is-bst?` discipline: a claim about a representation is trustworthy once it's checkable directly, not merely stated.

---

## Concept Unit: The Transition — One Character, Two Cases

### The Problem

Given `dp[i-1][j-1]`, `dp[i-1][j]`, and `dp[i][j-1]` — every state one step smaller in some direction — how does `dp[i][j]` get computed from them?

### Introduce the concept in isolation

```clojure
(defn max-of-two [a b] (if (> a b) a b))

(defn lcs-cell [dp row x y i j]
  (if (= (get x (- i 1)) (get y (- j 1)))
    (+ 1 (get (get dp (- i 1)) (- j 1)))
    (max-of-two (get (get dp (- i 1)) j) (get row (- j 1)))))
```

```
user=> (lcs-cell [[0 0 0]] [0] "ABC" "AC" 1 1)
1
```

**If the two characters at this position match** (`x`'s `i`-th, `y`'s `j`-th) — here, `x[0]='A'` and `y[0]='A'` — the match extends whatever LCS existed *before* both, `dp[i-1][j-1]`, by exactly one. **If they don't match**, the best LCS so far is the larger of "skip this character of `x`" (`dp[i-1][j]`) or "skip this character of `y`" (`dp[i][j-1]`) — read here from `row`, the current row being built, since `dp[i][j-1]` sits in the *same* row as the cell being computed, not the previous one.

### Discard the throwaway example

Not applicable — `lcs-cell` and `max-of-two` are real, reusable functions.

### Project Change

- **Reference Source**: No reference counterpart — the standard LCS recurrence, derived directly from what "extend a common subsequence by one character" requires.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn lcs-cell [dp row x y i j]
  (if (= (get x (- i 1)) (get y (- j 1)))
    (+ 1 (get (get dp (- i 1)) (- j 1)))
    (max-of-two (get (get dp (- i 1)) j) (get row (- j 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get x (- i 1))`, `(get y (- j 1))`** — reappearing `get` on strings (Lesson 101), reading the `i`-th and `j`-th characters (`- 1` for the `0`-indexed shift between "first `i` characters" and index `i-1`).
- **`(+ 1 (get (get dp (- i 1)) (- j 1)))`** — first appearance: the matching case, reading the diagonal predecessor from the *already-fully-built* previous row.
- **`(get row (- j 1))`** — first appearance: reading the *current* row's own already-filled earlier column — the reason `row` is threaded through as its own argument, distinct from `dp`.

### CS Lens

`dp[i-1][j-1]`, `dp[i-1][j]`, and `dp[i][j-1]` are exactly the three cells directly above, above-left, and left of `dp[i][j]` in the table — every transition only ever reaches backward, never forward, the identical dependency discipline Lesson 119's own "order" requirement demands, now visible spatially rather than only along one dimension.

### SE Lens

The character-match branch and the no-match branch are genuinely different operations — extend by one, or carry forward the better of two alternatives — and conflating them into one formula would obscure exactly the case-based reasoning (Lesson 17's proof by cases) that makes this transition correct in the first place.

### Connection to the previous unit

The previous unit built the base case row; this unit is the single transition rule every later cell uses, reaching only backward into cells this lesson's own order guarantees are already correct.

---

## Concept Unit: Filling the Whole Table, in Order

### The Problem

One cell's transition is proven. Filling `dp[i][j]` for every `i` and `j`, in an order that guarantees every transition's own dependencies are already computed, completes the algorithm — what order does that actually require?

### Introduce the concept in isolation

```clojure
(defn lcs-fill-row [dp x y i j width row]
  (if (> j width)
    (assoc dp i row)
    (lcs-fill-row dp x y i (+ j 1) width (assoc row j (lcs-cell dp row x y i j)))))

(defn lcs-fill-rows [dp x y i height width]
  (if (> i height)
    dp
    (lcs-fill-rows (lcs-fill-row dp x y i 1 width [0]) x y (+ i 1) height width)))

(defn lcs-length [x y]
  (get (get (lcs-fill-rows [(zero-row (count y) 1 [0])] x y 1 (count x) (count y)) (count x)) (count y)))
```

```
user=> (lcs-length "ABC" "AC")
2
```

**Order**: rows fill in increasing `i`, each row filling left to right in increasing `j` — every cell's transition reaches only into the previous row (already complete) or earlier columns of its own row (already filled), never anything not yet computed. `dp[3][2] = 2` for `"ABC"` and `"AC"` — matching a direct hand check: `"AC"` itself is a length-`2` common subsequence, and no length-`3` one exists.

### Discard the throwaway example

Not applicable — `lcs-fill-row`, `lcs-fill-rows`, and `lcs-length` are real, reusable functions, hand-verified cell by cell before being presented here.

### Project Change

- **Reference Source**: `lcs-fill-row`/`lcs-fill-rows` reuse Lesson 119's `dp-fill-from` ordering discipline directly, extended to two nested dimensions instead of one.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn lcs-length [x y]
  (get (get (lcs-fill-rows [(zero-row (count y) 1 [0])] x y 1 (count x) (count y)) (count x)) (count y)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(lcs-fill-row dp x y i 1 width [0])`** — reappearing (this lesson's second unit): each new row starts as `[0]` — `dp[i][0] = 0`, the base case restated for every row, not only row `0`.
- **`(assoc dp i row)`** — reappearing `assoc`-as-append (Lesson 94): a completed row is only added to `dp` once every one of its own columns has been filled.
- **`(get (get ... (count x)) (count y))`** — reappearing nested `get`: the final answer sits at the table's own bottom-right corner, the state describing "all of `x`, all of `y`."

### CS Lens

This is Lesson 119's four-part recipe, fully instantiated on a two-dimensional state: state (a pair of positions), transition (`lcs-cell`), base case (`zero-row`), and order (row by row, left to right within each row) — every part present, every part necessary, none of them arbitrary.

### SE Lens

`lcs-length`'s cost is `O(|x| \times |y|)` — the size of the entire table, each cell computed once, in `O(1)` given its dependencies — a real, honest cost proportional to *both* input lengths, unavoidable for a problem whose answer genuinely depends on comparing every position of one string against every position of the other.

### Connection to the previous unit

The previous unit proved one cell's transition correct; this unit fills every cell the recipe requires, in the one order that keeps every dependency already resolved, producing a complete, verified answer.

---

## Connect the Pieces

The full table for `"ABC"` and `"AC"`, and its final answer:

```
       ""  A  C
  ""    0  0  0
  A     0  1  1
  B     0  1  1
  C     0  1  2
```

```clojure
(println "LCS length, ABC vs AC:" (lcs-length "ABC" "AC"))
```

```
LCS length, ABC vs AC: 2
```

Every cell in this table was computed, verified, and shown — not one of them asserted without a trace back to the base case and the transition rule this lesson derived.

## What Breaks Without This

Suppose `lcs-cell`'s no-match branch only ever checked `dp[i-1][j]`, never `dp[i][j-1]`:

```clojure
(defn broken-lcs-cell [dp row x y i j]
  (if (= (get x (- i 1)) (get y (- j 1)))
    (+ 1 (get (get dp (- i 1)) (- j 1)))
    (get (get dp (- i 1)) j)))
```

This silently drops half of the genuine alternatives a mismatch case must consider — "skip a character of `y`" is never even examined. On `"ABC"` versus `"AC"`, this specific input happens not to expose the gap, but on inputs where the best choice genuinely requires skipping a character of `y` rather than `x`, `broken-lcs-cell` would report a shorter LCS than actually exists — plausible, still non-negative, still smaller than or equal to either string's own length, and simply wrong, exactly the kind of quiet, confident failure a one-sided comparison (Lesson 110's own recurring warning) always risks.

## Exercises

1. **Trace.** By hand, recompute `dp[2][1]` and `dp[2][2]` for `"ABC"` vs `"AC"`, confirming they match this lesson's own table.
2. **Predict.** Before checking, predict `(lcs-length "ABCB" "BDCAB")` — LCS `"BCB"`, length `3`. Verify by building the full table.
3. **Verify.** Confirm `(lcs-length "ABC" "DEF")` (no characters in common at all) returns `0`.
4. **Break it, on purpose.** Run `broken-lcs-cell` on an input where the correct LCS genuinely requires the `dp[i][j-1]` branch (Exercise 2's own strings are a good candidate), and confirm it returns a smaller, wrong answer.
5. **Generalize.** State this lesson's four-part recipe (state, transition, base case, order) for this problem explicitly, the way "Connect the Pieces" summarized coin change in Lesson 119.
6. **Reconstruct.** Close this lesson. From memory, explain why the no-match case needs *both* `dp[i-1][j]` and `dp[i][j-1]`, and why `dp[i][j-1]` specifically must come from the row currently being built, not the previous row.

## Definition of Done

- [ ] You can state LCS's state, transition, base case, and order explicitly.
- [ ] You can implement `lcs-length` and trace a small table by hand.
- [ ] You can explain why the transition's no-match case needs two alternatives, not one.
- [ ] You completed Exercise 2 and verified a length-`3` LCS on a larger example.
- [ ] You completed Exercise 4 and demonstrated `broken-lcs-cell`'s incorrect, silently-too-short result.
- [ ] Commit your Exercise 2 and Exercise 4 work to your notes repository, with a commit message stating what you verified and found — for example, `"Verify LCS(ABCB, BDCAB) = 3 (BCB); demonstrate broken-lcs-cell undercounting on a case needing the dp[i][j-1] branch"` — not just `"lesson 120 exercise"`.

---

**Next lesson:** Lesson 121, *Knapsack*, compares two different ways to define a state for the same underlying problem, studying directly how the *choice* of state — not just the transition — shapes both an algorithm's correctness and its cost.
