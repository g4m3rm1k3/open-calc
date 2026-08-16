# Lesson 121: Knapsack

**What you will build**: By the end of this lesson you'll solve the 0/1 knapsack problem — choose items maximizing value without exceeding a weight capacity, each item usable at most once — using a correct two-dimensional state, then build a *simpler-looking* one-dimensional formulation and watch it confidently violate the "at most once" rule, proving directly that a dynamic program's state must capture everything its transition actually depends on, not merely enough to make the code run.

**What you need to know first**: Lesson 120's two-dimensional table-filling technique and `zero-row`; Lesson 119's `dp-coins`, for direct contrast with this lesson's own second formulation; Lesson 30's `max`.

**Terms introduced in this lesson**: None new — this lesson compares two state designs for one problem rather than naming a new concept.

**Objects and methods used**: None new. This lesson reuses `get`, `assoc`, `count` (Lesson 84, Lesson 94), `max` (Lesson 30), and Lesson 120's `zero-row`, each already covered.

---

## Concept Unit: A Correct State — Item Index *and* Capacity

### The Problem

Given items, each with a weight and a value, and a capacity limit, choose a subset maximizing total value without exceeding capacity — each item used **at most once**. What state captures enough information for a transition to respect that constraint?

### Introduce the concept in isolation

**State**: `dp[i][w]` — the maximum value achievable using only the *first `i` items*, within capacity `w`. **Base case**: `dp[0][w] = 0` for every `w` — no items considered, no value possible. **Transition**: if item `i`'s weight exceeds `w`, it can't be used: `dp[i][w] = dp[i-1][w]`. Otherwise, take the better of *excluding* it (`dp[i-1][w]`) or *including* it (`\text{value}_i + dp[i-1][w - \text{weight}_i]`) — critically, both alternatives read from row `i-1`, *never* row `i` itself, which is exactly what guarantees item `i` is never counted twice.

```clojure
(defn max-of-two [a b] (if (> a b) a b))

(defn knap-cell [dp weights values i w]
  (if (> (get weights (- i 1)) w)
    (get (get dp (- i 1)) w)
    (max-of-two (get (get dp (- i 1)) w) (+ (get values (- i 1)) (get (get dp (- i 1)) (- w (get weights (- i 1))))))))
```

```
user=> (knap-cell [[0 0 0 0 0 0 0] [0 0 3 3 3 3 3]] [2 3 4] [3 4 5] 2 5)
7
```

Row `1` (item `0`, weight `2`, value `3`) is already built. At `i=2` (item `1`, weight `3`, value `4`), `w=5`: excluding gives `dp[1][5]=3`; including gives `4 + dp[1][5-3]=4+dp[1][2]=4+3=7`. Including wins.

### Discard the throwaway example

Not applicable — `knap-cell` is a real, reusable function.

### Project Change

- **Reference Source**: `knap-cell` reuses Lesson 120's `lcs-cell` two-case shape directly — one branch reading only backward into the previous row, matching this problem's own "each item once" requirement, which never needs same-row access the way LCS's no-match case did.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn knap-cell [dp weights values i w]
  (if (> (get weights (- i 1)) w)
    (get (get dp (- i 1)) w)
    (max-of-two (get (get dp (- i 1)) w) (+ (get values (- i 1)) (get (get dp (- i 1)) (- w (get weights (- i 1))))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(> (get weights (- i 1)) w)`** — first appearance: item `i` genuinely cannot be included at this capacity — the only option is carrying forward `dp[i-1][w]` unchanged.
- **`(get (get dp (- i 1)) w)`, both branches** — reappearing nested `get` (Lesson 120): every read reaches into row `i-1` only, never row `i` — the structural reason this transition can never reuse the current item.
- **`(+ (get values (- i 1)) (get (get dp (- i 1)) (- w (get weights (- i 1)))))`** — first appearance: including item `i` means its own value, plus whatever the *previous* items alone could achieve in the *remaining* capacity.

### CS Lens

Reading only from row `i-1`, never row `i`, is what makes "each item used at most once" a structural guarantee rather than a rule that has to be checked separately — the state (`i`, the item boundary) and the transition (backward-only reads) work together to enforce it automatically.

### SE Lens

Filling this table (using Lesson 120's exact row-by-row order) for `weights=[2 3 4]`, `values=[3 4 5]`, capacity `6`, gives `dp[3][6] = 8` — items `0` and `2` (weights `2+4=6`, values `3+5=8`), genuinely optimal, confirmed directly by comparing every combination that fits by hand.

---

## Concept Unit: A Simpler-Looking State — and Why It's Wrong

### The Problem

`dp[i][w]` needs a full 2D table. Coin change (Lesson 119) solved a similar-looking problem — pick items to reach a target — using only `dp[w]`, one dimension. Does the identical simplification work here?

### Introduce the concept in isolation

```clojure
(defn unbounded-cell [dp weights values w i best]
  (if (>= i (count weights))
    best
    (if (<= (get weights i) w)
      (unbounded-cell dp weights values w (+ i 1) (max-of-two best (+ (get values i) (get dp (- w (get weights i))))))
      (unbounded-cell dp weights values w (+ i 1) best))))

(defn unbounded-fill [dp weights values w capacity]
  (if (> w capacity)
    dp
    (unbounded-fill (assoc dp w (unbounded-cell dp weights values w 0 0)) weights values (+ w 1) capacity)))

(defn unbounded-knapsack [weights values capacity]
  (get (unbounded-fill [0] weights values 1 capacity) capacity))
```

```
user=> (unbounded-knapsack [2 3 4] [3 4 5] 6)
9
```

`9`, not `8` — this formulation reports a *higher* value than the previous unit's provably correct answer. It does so by reusing item `0` (weight `2`, value `3`) **three times** (`2+2+2=6$ weight, `3+3+3=9` value) — `dp[w]` alone has no way to know an item has already been "used," since nothing in its state tracks which items remain available, exactly Lesson 119's own coin-change formulation, which was correct *there* only because coins genuinely can repeat.

### Discard the throwaway example

Not applicable — every function here is real, and `9` is a genuine, verified (if wrong-for-this-problem) result.

### Project Change

- **Reference Source**: `unbounded-cell`/`unbounded-fill` reuse Lesson 119's `dp-best-for-amount`/`dp-fill-from` structure directly, unchanged in shape — proof that the *same* one-dimensional recipe that was correct for coin change is being applied here, not a new mistake invented for this lesson.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn unbounded-knapsack [weights values capacity]
  (get (unbounded-fill [0] weights values 1 capacity) capacity))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(get dp (- w (get weights i)))`** — reappearing (Lesson 119's own `dp-best-for-amount`): reads `dp` at a *smaller capacity*, with no reference anywhere to which items contributed to that smaller answer — item `0` could be part of it once, twice, or not at all, and this formulation has no way to tell or to prevent it.
- **`(unbounded-cell dp weights values w (+ i 1) ...)`** — reappearing (Lesson 119): tries every item at every capacity, exactly `dp-best-for-amount`'s own shape — the code is correct *for the problem it actually solves* (unbounded reuse), just not for 0/1 knapsack.

### CS Lens

This is Lesson 106's own lesson in reverse: where Lesson 106 showed two different representations correctly satisfying the *identical* ADT, this unit shows two dynamic-programming states that *look* like formulations of the same problem but actually solve **two different problems** — 0/1 knapsack and unbounded knapsack — that happen to share almost all of their code.

### SE Lens

`unbounded-knapsack`'s answer, `9`, is not a bug in the sense of a crash or a malformed value — it's a confident, well-formed, *wrong* answer to the question actually being asked, precisely the failure mode Lesson 110's specification-first discipline exists to catch: the specification "each item at most once" was never encoded in this state at all, so nothing about the code could have caught the violation.

### Connection to the previous unit

The previous unit built a state that correctly encodes "each item once"; this unit builds a state that doesn't, using code structurally identical to a lesson where that same simplification was entirely correct — proof that state design, not code style, is what decides correctness here.

---

## Concept Unit: Comparing the Two Formulations Honestly

### The Problem

`unbounded-knapsack` is wrong for this problem, but it isn't obviously *worse* code, and it isn't even cheaper — is there any honest sense in which the simpler-looking formulation was worth attempting at all?

### Introduce the concept in isolation

Both formulations cost the same asymptotic class: `dp[i][w]`'s table has `O(n \times \text{capacity})` cells, each `O(1)`; `unbounded-cell` tries every one of `n` items at every one of `\text{capacity}` levels, also `O(n \times \text{capacity})`. **The one-dimensional formulation is not cheaper — it is only simpler to write, and wrong.** State design's real question was never "how few dimensions can I get away with" — it was always "what does the transition actually need to know to be correct," and for 0/1 knapsack, that answer genuinely requires tracking which items remain, which `w` alone cannot express.

### Discard the throwaway example

Not applicable — a direct cost comparison of two already-built formulations, not new code.

### CS Lens

This is the general lesson every dynamic-programming state design has to answer: a state is correct exactly when the transition's dependencies are fully determined by it — `dp[w]` alone determines "how much value is achievable" only when items may repeat; `dp[i][w]` is required the moment they may not.

### SE Lens

Choosing a state dimension isn't a performance optimization to reach for once correctness is settled — it's part of correctness itself, decided before any code is written, exactly Lesson 119's own "state" question, now shown to have a genuinely wrong answer available that looks just as reasonable as the right one until checked.

### Connection to the previous unit

The previous unit demonstrated the wrong formulation's failure directly; this unit is why that failure isn't explained by cost, effort, or code quality — it's explained entirely by what information the chosen state did or didn't preserve.

---

## Connect the Pieces

Both formulations, the same input, one correct and one not:

```clojure
(println "0/1 knapsack (correct):" (knapsack [2 3 4] [3 4 5] 6))
(println "Unbounded knapsack (wrong here):" (unbounded-knapsack [2 3 4] [3 4 5] 6))
(println "Both formulations' cost: O(n x capacity)")
```

```
0/1 knapsack (correct): 8
Unbounded knapsack (wrong here): 9
Both formulations' cost: O(n x capacity)
```

Identical cost, identical problem size, one right answer and one confidently wrong one — the entire difference traced back to what each state actually remembers.

## What Breaks Without This

Suppose a real system used `unbounded-knapsack`'s formulation to select, say, which of several one-time-use promotional items to include in a shipment under a weight limit — a genuine 0/1 constraint, each item physically unique and available only once. The algorithm would report a plan requiring three copies of the same physical item that only exists once, an answer that looks completely legitimate (a well-formed number, a set of "selected" items) right up until someone tries to actually assemble the shipment and discovers the plan is physically impossible — the exact silent, confident failure this lesson's second unit demonstrated on paper, now costing real time to discover in production instead.

## Exercises

1. **Trace.** By hand, verify `dp[2][4]` in the 0/1 table (item `0` and item `1` considered, capacity `4`), confirming it equals `4`.
2. **Predict.** Before checking, predict `(unbounded-knapsack [2 3 4] [3 4 5] 4)` — does reusing item `0` twice (weight `4`, value `6`) beat every 0/1-valid option at this smaller capacity too?
3. **Verify.** Confirm `(knapsack [2 3 4] [3 4 5] 6)` genuinely equals `8` by checking every 0/1-valid subset of the three items by hand, confirming none reaches `9`.
4. **Break it, on purpose.** Construct a *different* three-item input where `unbounded-knapsack` and `knapsack` happen to agree, the way Lesson 119's coin-change example agreed with greedy on standard denominations — showing the bug doesn't always manifest, only sometimes.
5. **Generalize.** State this lesson's two formulations' state definitions explicitly, side by side, the way Lesson 119 stated coin change's four-part recipe.
6. **Reconstruct.** Close this lesson. From memory, explain precisely what information `dp[w]` alone is missing that `dp[i][w]` preserves, and why that missing information is exactly what "each item once" requires.

## Definition of Done

- [ ] You can implement `knapsack` (2D, correct) and explain why its transition reads only from row `i-1`.
- [ ] You can implement `unbounded-knapsack` (1D) and explain precisely what it silently allows that 0/1 knapsack forbids.
- [ ] You can explain why the two formulations cost the same, despite only one being correct.
- [ ] You completed Exercise 3 and confirmed `8` is genuinely optimal by exhaustive check.
- [ ] You completed Exercise 4 and found an input where both formulations happen to agree.
- [ ] Commit your Exercise 3 and Exercise 4 work to your notes repository, with a commit message stating what you confirmed and found — for example, `"Confirm knapsack=8 optimal via exhaustive check; find input where unbounded-knapsack and knapsack coincidentally agree"` — not just `"lesson 121 exercise"`.

---

**Next lesson:** Lesson 122, *Interval Problems*, returns to greedy algorithms for a family of scheduling and selection problems built around intervals, deriving several related strategies and studying which of Lesson 118's exchange arguments justifies each one.
