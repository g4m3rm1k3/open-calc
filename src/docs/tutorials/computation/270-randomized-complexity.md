# Lesson 270: Randomized Complexity

**What you will build**: Freivalds' algorithm — a randomized check for whether a claimed matrix product `A * B = C` is correct, using a single random vector instead of computing the full product — measured with real, repeated experiments showing how running several independent copies of that check shrinks its error probability exponentially. The transferable problem: some problems have no known fast, always-correct algorithm, but do have a fast algorithm that is merely very likely to be correct — and repeating that algorithm with fresh randomness, not just running it once, is what turns "likely correct" into "correct with overwhelming confidence," cheaply.

**What you need to know first**: Lesson 78's randomized algorithms and real randomness via `rand-int`; Lesson 81's Monte Carlo and Las Vegas vocabulary; Lesson 84's vectors and index-based `get`; Lesson 119's recursion-with-accumulator; Lesson 263's pattern of formalizing an informal idea into a real complexity class, which this lesson extends into randomized classes; Lesson 264 and 265's deterministic complexity-class landscape (`P`, `NP`, `NP`-complete), which randomization sits alongside rather than replaces.

**Terms used in this lesson**

- **randomized algorithm** — reappearing from Lesson 78/81: an algorithm whose behavior depends on random choices it makes internally, not only on its input. It exists because for some problems, letting a real coin flip guide a decision produces a faster or simpler correct algorithm, on average, than any known algorithm forced to be fully deterministic.
- **Monte Carlo algorithm** — reappearing from Lesson 81: a randomized algorithm that always finishes in bounded time, but may return a wrong answer with some bounded probability. Distinguished from a Las Vegas algorithm, which is always correct but whose running time itself varies randomly.
- **one-sided error** — an error pattern where a randomized algorithm can only be wrong in one specific direction — it might incorrectly accept a false claim, but can never incorrectly reject a true one, or the reverse — as opposed to two-sided error, where either direction of mistake is possible.
- **coRP** (co-Randomized Polynomial time) — the complexity class of decision problems solvable by a polynomial-time randomized algorithm that always answers correctly on "yes" instances, and answers correctly on "no" instances with probability at least one-half. This lesson's own algorithm belongs to this class specifically, not its mirror.
- **RP** (Randomized Polynomial time) — coRP's mirror: always correct on "no" instances, correct on "yes" instances with probability at least one-half. The two classes share the same one-sided-error shape; only which side is guaranteed differs.
- **error amplification** (probability amplification) — running several independent trials of a bounded-error randomized algorithm and combining their results to drive the overall error probability down exponentially, from a single trial's constant bound toward an arbitrarily small one. This is the actual "computational tradeoff" this lesson's own title refers to: a small amount of extra time bought for an exponential gain in reliability.
- **independent trials** — reappearing, informally, from Section IV's probability lessons: repeated random draws where no draw's outcome has any bearing on any other draw's outcome. This lesson's own What Breaks section shows exactly what is lost when trials stop being independent.

**Objects and methods used**

- **`random-bit`** / **`random-vector3`**
  - *What it is:* this lesson's real source of randomness — one random `0`-or-`1` value, and a 3-element vector of them.
  - *Implementation:* `random-bit` calls `rand-int` with `2`; `random-vector3` calls `random-bit` three separate times.
  - *Its use:* supplies the actual "coin flips" the whole algorithm depends on — without genuinely fresh randomness here, the method collapses, exactly as this lesson's own What Breaks section demonstrates.
- **`dot3`** / **`matrix-vector-multiply3`** / **`vectors-equal3?`** / **`freivalds-check`** / **`freivalds-trial`**
  - *What it is:* Freivalds' single-trial randomized check for whether `A * B = C`, using one random vector instead of the full matrix product.
  - *Implementation:* `matrix-vector-multiply3` computes a 3x3-matrix-times-vector product via three `dot3` calls; `freivalds-check` compares `A * (B * v)` against `C * v` via `vectors-equal3?`; `freivalds-trial` supplies a fresh `(random-vector3)` on every call.
  - *Its use:* this lesson's core randomized algorithm — verifies a claimed matrix product using far less arithmetic than actually multiplying the matrices would cost.
- **`freivalds-repeated`** / **`count-false-accepts`**
  - *What it is:* the error-amplification wrapper, and the experiment harness that measures its real, empirical error rate.
  - *Implementation:* `freivalds-repeated` recurses down from a `trials` count to `0`, short-circuiting to `false` the instant any single trial catches a mismatch; `count-false-accepts` runs a whole `freivalds-repeated` experiment many times and counts how often it was fooled.
  - *Its use:* turns one trial's fixed error bound into a real, measured, shrinking number as `trials` grows.

This lesson also reuses vectors and `get` (Lesson 84), recursion-with-accumulator (Lesson 119), `rand-int`-based randomness (Lesson 78), and the Monte Carlo/Las Vegas vocabulary (Lesson 81), each already covered.

---

## Concept Unit: One-Sided Error and a Randomized Check

### The Problem

You are handed a claim: "matrix `A` times matrix `B` equals matrix `C`." Multiplying two 3x3 matrices the ordinary way takes real work — nine output positions, each needing a three-term dot product, twenty-seven multiplications and eighteen additions in total. For a general `n x n` matrix, the ordinary method costs on the order of `n^3` operations. If you wanted to *check* someone else's claimed product instead of trusting it blindly, the obvious way is to just recompute `A * B` yourself and compare it to `C` — but that costs exactly the same `n^3` work the original claim cost to produce. Checking a claim shouldn't have to cost as much as making the claim in the first place — is there a way to verify `A * B = C` using meaningfully less arithmetic than actually computing `A * B`?

### Introduce the concept in isolation

```clojure
(defn random-bit
  []
  (rand-int 2))

(defn random-vector3
  []
  [(random-bit) (random-bit) (random-bit)])

(defn dot3
  [row v]
  (+ (* (get row 0) (get v 0))
     (* (get row 1) (get v 1))
     (* (get row 2) (get v 2))))

(defn matrix-vector-multiply3
  [matrix v]
  [(dot3 (get matrix 0) v)
   (dot3 (get matrix 1) v)
   (dot3 (get matrix 2) v)])

(defn vectors-equal3?
  [v1 v2]
  (if (= (get v1 0) (get v2 0))
    (if (= (get v1 1) (get v2 1))
      (= (get v1 2) (get v2 2))
      false)
    false))

(defn freivalds-check
  [a b c v]
  (vectors-equal3? (matrix-vector-multiply3 a (matrix-vector-multiply3 b v)) (matrix-vector-multiply3 c v)))

(defn freivalds-trial
  [a b c]
  (freivalds-check a b c (random-vector3)))
```

Test it against a genuinely correct claim first — `A = [[2 0 1] [1 1 0] [0 3 1]]`, `B = [[1 2 0] [0 1 1] [3 0 2]]`, and `C-true`, the real, hand-and-`bb`-computed product `[[5 4 2] [1 3 1] [3 3 5]]`:

```
user=> (freivalds-check [[2 0 1] [1 1 0] [0 3 1]] [[1 2 0] [0 1 1] [3 0 2]] [[5 4 2] [1 3 1] [3 3 5]] [1 0 1])
true
user=> (freivalds-check [[2 0 1] [1 1 0] [0 3 1]] [[1 2 0] [0 1 1] [3 0 2]] [[5 4 2] [1 3 1] [3 3 5]] [0 1 1])
true
```

Checked against all eight possible `0`/`1` vectors (there are only eight: `[0 0 0]` through `[1 1 1]`), the true claim passes every single one — `0` of `8` wrongly flag it as a mismatch. Now test a genuinely *wrong* claim — `C-false = [[5 4 2] [1 3 1] [3 3 6]]`, identical to `C-true` except its very last entry is `6` instead of `5`:

```
user=> (freivalds-trial [[2 0 1] [1 1 0] [0 3 1]] [[1 2 0] [0 1 1] [3 0 2]] [[5 4 2] [1 3 1] [3 3 6]])
true
user=> (freivalds-trial [[2 0 1] [1 1 0] [0 3 1]] [[1 2 0] [0 1 1] [3 0 2]] [[5 4 2] [1 3 1] [3 3 6]])
false
user=> (freivalds-trial [[2 0 1] [1 1 0] [0 3 1]] [[1 2 0] [0 1 1] [3 0 2]] [[5 4 2] [1 3 1] [3 3 6]])
false
```

Checked exhaustively against all eight possible vectors, exactly `4` of `8` correctly detect this specific mismatch — the other `4` wrongly report "equal." This is called a **Monte Carlo algorithm**: it always finishes fast, but on a false claim, it can be wrong. Specifically, it only ever makes one kind of mistake — it can wrongly say "equal" when the matrices are not, but it can never wrongly say "not equal" when they genuinely are, as the exhaustive `0`-of-`8` check on the true claim just proved. This asymmetry is called **one-sided error**, and the exact class this algorithm belongs to is **coRP**: always correct on true claims, correct with probability at least one-half on false ones — for this specific false claim, the real probability of being fooled by a single random trial is exactly `4/8`, or one-half, matching coRP's own guarantee precisely.

### Discard the throwaway example

Not applicable — this is real, hand-verified code (verified this session via `bb`), and stays in the lesson as its central algorithm.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because Section XII's lessons are standalone `bb`-verified demonstrations, not edits to a persistent project file.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

This is the exact code shown and run above, per this curriculum's convention, established since roughly Lesson 130, that the isolated demonstration for a from-scratch algorithm is the real, reusable code.

### The Updated Project

Skipped — no enclosing file exists yet; these seven functions are brand-new and freestanding.

### Mechanical Walkthrough

- `(defn random-bit [] (rand-int 2))` — `defn`, name `random-bit`, an empty parameter vector `[]` — a function that needs no input at all. `rand-int`, reappearing from Lesson 78: given one integer `n`, it returns a real, genuinely random integer chosen uniformly from `0` up to but not including `n`. Called here with `2`, it returns either `0` or `1`, each equally likely — this is the lesson's actual coin flip, encoded as an integer.
- `(defn random-vector3 [] [(random-bit) (random-bit) (random-bit)])` — `defn`, name, `[]`. The body is a 3-element vector literal (Lesson 84) whose three entries are three separate calls to `random-bit`; each call is independent and draws its own fresh coin flip, so the whole vector can come out as any of the eight possible `0`/`1` combinations, each equally likely.
- `(defn dot3 [row v] (+ (* (get row 0) (get v 0)) (* (get row 1) (get v 1)) (* (get row 2) (get v 2))))` — `defn`, name, two parameters. The body is one `+` call taking three arguments — Clojure's arithmetic operators accept however many arguments they're given, not only two. Each argument is a `*` (multiplication) of one `get`-by-index (Lesson 84) from `row` and the matching index from `v`. This computes the mathematical dot product of two 3-element vectors, hardcoded for exactly three positions rather than a general loop — legitimate here because this lesson only ever works with 3x3 matrices.
- `(defn matrix-vector-multiply3 [matrix v] [(dot3 (get matrix 0) v) (dot3 (get matrix 1) v) (dot3 (get matrix 2) v)])` — `defn`, name, two parameters. The body is a 3-element vector literal, each entry a call to `dot3`, passing one row of `matrix` (`get`-by-index) together with the same `v`. This multiplies a 3x3 matrix by a 3-element vector, one dot product per output position, producing a new 3-element vector.
- `(defn vectors-equal3? [v1 v2] ...)` — `defn`, name ending `?`, this curriculum's predicate-naming convention. The body is a nested `if`: the outer test, `(= (get v1 0) (get v2 0))`, compares the first entries; if that fails, the whole expression short-circuits to the literal `false` without ever inspecting the remaining entries. If it succeeds, a second `if` checks the second entries the same way, and only if both checks succeed does execution reach `(= (get v1 2) (get v2 2))`, whose own result becomes the function's final answer. Two vectors are equal exactly when all three positions match.
- `(defn freivalds-check [a b c v] (vectors-equal3? (matrix-vector-multiply3 a (matrix-vector-multiply3 b v)) (matrix-vector-multiply3 c v)))` — `defn`, name, four parameters. `(matrix-vector-multiply3 b v)` computes `B * v` first; that result becomes the second argument to an outer `matrix-vector-multiply3` call with `a`, computing `A * (B * v)`. Separately, `(matrix-vector-multiply3 c v)` computes `C * v`. `vectors-equal3?` compares the two. This is the entire algorithm: instead of computing the full `A * B` matrix (nine numbers, at real matrix-multiplication cost) and comparing it to `C`, it computes two 3-element vectors — each `matrix-vector-multiply3` call is only three `dot3` calls, not nine — and compares those.
- `(defn freivalds-trial [a b c] (freivalds-check a b c (random-vector3)))` — `defn`, name, three parameters. The body calls `freivalds-check`, supplying a freshly generated `(random-vector3)` as the fourth argument. `freivalds-check` alone is deterministic once handed a vector; `freivalds-trial` is what introduces real randomness, drawing a genuinely new vector on every call.

### CS Lens

This is **one-sided error**, and the class it defines — **coRP** — is a hard concept: a computational guarantee that is strictly weaker than always-correct, but strictly stronger than "might be wrong in either direction." Also recognized in: Fermat and Miller-Rabin primality testing (historically the first widely used coRP algorithms — a composite number is always correctly identified as composite, but a prime number can, rarely, look composite by unlucky chance), randomized polynomial identity testing in symbolic computation and computer algebra systems, and network protocols that probabilistically detect corrupted packets via checksums rather than fully re-transmitting and byte-for-byte comparing every packet.

### SE Lens

The alternative not chosen is recomputing `A * B` in full and comparing it to `C` directly — completely reliable, but it costs exactly what producing the original claim cost, giving no advantage at all over redoing the whole computation yourself. That defeats the actual point of verification in a real setting like outsourced or untrusted computation, where the entire reason to check a claim is to avoid redoing the expensive work that produced it. Freivalds' algorithm trades that certainty away deliberately, for a real, disclosed, `1`-in-`2` chance (for this specific false claim) of being fooled by any single trial, in exchange for a genuine asymptotic speed improvement — each trial costs only as much as a handful of matrix-vector multiplications, not a full matrix-matrix multiplication. Carrying that one disclosed weakness honestly, rather than either hiding it or accepting it as-is, is exactly what the next Concept Unit closes.

### Commands

Run this file with Babashka: `bb path/to/file.clj`. `bb` is the interpreter program; the one argument is the path to the `.clj` script to run top to bottom. Success looks like the script completing with no error, each `(println ...)` printing one real line of output.

### Run it

Already run and shown above — `true` on every one of the eight possible vectors for the genuine product, `4` of `8` correctly catching the false one, with real individual `bb`-run examples of both `true` and `false` outcomes on the false claim.

### Connecting this unit

A single trial leaves a real, disclosed `1`-in-`2` chance of being fooled by this specific false claim — not good enough to actually trust. The next unit closes that gap.

---

## Concept Unit: Error Amplification

### The Problem

A `1`-in-`2` chance of being fooled is no better than a coin flip's worth of confidence — not something to build anything real on. Recomputing `A * B` in full would close the gap completely, but Concept Unit 1 already established that costs as much as the original claim. Is there a way to shrink the error toward zero without paying that full recomputation cost?

### Introduce the concept in isolation

```clojure
(defn freivalds-repeated
  [a b c trials]
  (if (= trials 0)
    true
    (if (freivalds-trial a b c)
      (freivalds-repeated a b c (- trials 1))
      false)))

(defn count-false-accepts
  [a b c trials experiments-remaining accumulated-count]
  (if (= experiments-remaining 0)
    accumulated-count
    (count-false-accepts a b c trials (- experiments-remaining 1)
      (if (freivalds-repeated a b c trials)
        (+ accumulated-count 1)
        accumulated-count))))
```

Run `1000` independent experiments against the same false claim from Concept Unit 1, at three different trial counts:

```
user=> (count-false-accepts [[2 0 1] [1 1 0] [0 3 1]] [[1 2 0] [0 1 1] [3 0 2]] [[5 4 2] [1 3 1] [3 3 6]] 1 1000 0)
519
user=> (count-false-accepts [[2 0 1] [1 1 0] [0 3 1]] [[1 2 0] [0 1 1] [3 0 2]] [[5 4 2] [1 3 1] [3 3 6]] 5 1000 0)
30
user=> (count-false-accepts [[2 0 1] [1 1 0] [0 3 1]] [[1 2 0] [0 1 1] [3 0 2]] [[5 4 2] [1 3 1] [3 3 6]] 20 1000 0)
0
```

With `1` trial per experiment, `519` of `1000` — about `52%` — of these fresh experiments were fooled, matching the `1`-in-`2` bound from Concept Unit 1 closely. With `5` trials per experiment, that drops to `30` of `1000`, about `3%` — close to the theoretical `(1/2)^5`, which is `1/32`, about `3.125%`. With `20` trials, `0` of `1000` experiments were fooled at all — consistent with a true probability near `(1/2)^20`, roughly one in a million, far too small to expect any hits across only a thousand tries.

This is called **error amplification**: running several **independent trials** — Concept Unit 1's `freivalds-trial`, drawing a genuinely fresh `random-vector3` every single call — and accepting the claim only if every one of them agrees. Since each trial has, on its own, at most a one-half chance of being fooled, and each trial's randomness is completely independent of every other trial's, the chance that *all* of them are fooled simultaneously multiplies down: `(1/2)^k` for `k` trials. This is the actual computational tradeoff named in this lesson's own title — a small, linear amount of extra work (`k` times the arithmetic of one trial) purchases an exponential improvement in reliability.

This lesson's own `freivalds-check` belongs to **coRP** specifically, defined in Concept Unit 1. Its mirror class, **RP**, is the identical one-sided-error shape with the error direction flipped — always correct on "no" instances, correct with probability at least one-half on "yes" ones. The broader class covering algorithms allowed to err in *either* direction, as long as the error stays below some fixed bound, is **BPP** (Bounded-error Probabilistic Polynomial time) — both RP and coRP are proper subsets of BPP, since one-sided error is a strictly stronger guarantee than two-sided error. A fourth class, **ZPP**, covers Las Vegas algorithms, reappearing from Lesson 81: always correct, never wrong, but with a running time that is itself a random variable. `freivalds-repeated` is not a ZPP algorithm — it always finishes in exactly `trials` steps and can still be wrong — a genuine ZPP algorithm trades the opposite way, holding correctness fixed and letting time vary instead.

### Discard the throwaway example

Not applicable — this is real, hand-verified code (verified this session via `bb`, with real randomness, so the exact counts above will vary slightly on a re-run, though the pattern of exponential decay will not).

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because Section XII's lessons are standalone `bb`-verified demonstrations, not edits to a persistent project file.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

This is the exact code shown and run above, per the same since-Lesson-130 convention noted in Concept Unit 1.

### The Updated Project

Skipped — no enclosing file exists yet; `freivalds-repeated` and `count-false-accepts` are brand-new, freestanding functions (though `freivalds-repeated` does call Concept Unit 1's already-existing `freivalds-trial`).

### Mechanical Walkthrough

- `(defn freivalds-repeated [a b c trials] ...)` — `defn`, name, four parameters, `trials` a plain integer counting how many independent checks remain to run.
- `(if (= trials 0) true ...)` — the base case: `=` compares `trials` against the literal `0`; once no trials remain, and every trial run so far must therefore have passed (explained next), the function accepts, returning the literal `true`.
- The else-branch is a second `if`, testing `(freivalds-trial a b c)` — calling Concept Unit 1's function, which draws one fresh random vector and checks it. When that trial returns `true`, the recursive call `(freivalds-repeated a b c (- trials 1))` runs with one fewer trial remaining — `-` is ordinary subtraction. When the trial returns `false` — this specific fresh vector caught a real mismatch — the whole function immediately returns the literal `false`, without running any further trials: one honest "not equal" answer is enough to reject the claim outright.
- `(defn count-false-accepts [a b c trials experiments-remaining accumulated-count] ...)` — `defn`, five parameters, Lesson 119's recursion-with-accumulator pattern again, this time counting how many whole experiments came out wrong.
- `(if (= experiments-remaining 0) accumulated-count ...)` — the base case: once every experiment has run, return the final accumulated count.
- The recursive call, `(count-false-accepts a b c trials (- experiments-remaining 1) (if (freivalds-repeated a b c trials) (+ accumulated-count 1) accumulated-count))`, decrements `experiments-remaining` by one via `-`, and computes the next `accumulated-count`: it runs one entire `freivalds-repeated` experiment (itself `trials` independent checks); if that experiment wrongly accepted (`true` — the false claim slipped through every one of its `trials` checks), `(+ accumulated-count 1)` adds one to the running total via `+`; otherwise `accumulated-count` passes through unchanged.

### CS Lens

Error amplification is also recognized in: repeated independent measurements in experimental science, averaged to reduce noise; RAID and erasure-coded storage, which require multiple independent disk failures before data is actually lost; multi-factor authentication, which requires multiple independent compromises before an account is actually breached; and ensemble machine learning, which combines several independently-trained models so that no single model's mistake dominates the final answer.

### SE Lens

The alternative not chosen is trusting a single trial outright — Concept Unit 1 already showed that costs a real, measured `1`-in-`2` chance of being wrong for this test case, unacceptable for anything that matters. The real tradeoff amplification makes: `k` trials cost `k` times the arithmetic of one trial — real, linear extra work — in exchange for a failure probability that shrinks exponentially in `k`. This is a genuinely better trade than recomputation: doubling your confidence costs one more trial, a small, constant amount of extra work, not an entire additional pass at the original `n^3` cost. The debt still carried honestly: independence is doing all the real work here, not repetition on its own — a claim proven false in the What Breaks section below, where removing independence while keeping the repetition produces no improvement at all.

### Commands

Same `bb path/to/file.clj` invocation as Concept Unit 1: the interpreter, one script-path argument, success meaning every `(println ...)` prints without an error interrupting the run.

### Run it

Already run and shown above — `519`, `30`, and `0` false accepts out of `1000` real experiments, at `1`, `5`, and `20` trials respectively, tracking the theoretical `(1/2)^k` curve closely.

### Connecting this unit

This closes Concept Unit 1's disclosed weakness: a single trial's real `1`-in-`2` error becomes, with twenty independent trials, an error too small to have occurred even once across a thousand real, measured attempts.

---

## Connect the pieces

Follow the false claim, `C-false = [[5 4 2] [1 3 1] [3 3 6]]`, through the whole lesson. Concept Unit 1's exhaustive, exact enumeration over all eight possible `0`/`1` vectors found exactly `4` of `8` correctly catch it — an exact, real `1`-in-`2` per-trial error, matching coRP's own formal bound precisely. Concept Unit 2's `count-false-accepts`, run for real across `1000` independent experiments, measured `519` false accepts at `1` trial (about `52%`, tracking that `1`-in-`2` bound), `30` at `5` trials (about `3%`, tracking the theoretical `3.125%`), and `0` at `20` trials — turning a coin flip's worth of confidence into a real, measured, near-certain answer, at the cost of a handful of extra matrix-vector multiplications, never the full `A * B` recomputation Concept Unit 1 opened by ruling out.

## What breaks without this

Error amplification depends entirely on each trial drawing a genuinely fresh random vector. Break exactly that — reuse one fixed vector across every "trial" instead:

```clojure
(defn freivalds-repeated-broken
  [a b c v trials]
  (if (= trials 0)
    true
    (if (freivalds-check a b c v)
      (freivalds-repeated-broken a b c v (- trials 1))
      false)))
```

The only change: `v` is now a parameter, fixed once by the caller, instead of a fresh `(random-vector3)` drawn inside every call. Run it against the same false claim, using `[1 1 0]` — one of the four "bad" vectors Concept Unit 1's exhaustive check already found wrongly reports "equal" — at three different trial counts:

```
user=> (freivalds-repeated-broken [[2 0 1] [1 1 0] [0 3 1]] [[1 2 0] [0 1 1] [3 0 2]] [[5 4 2] [1 3 1] [3 3 6]] [1 1 0] 1)
true
user=> (freivalds-repeated-broken [[2 0 1] [1 1 0] [0 3 1]] [[1 2 0] [0 1 1] [3 0 2]] [[5 4 2] [1 3 1] [3 3 6]] [1 1 0] 5)
true
user=> (freivalds-repeated-broken [[2 0 1] [1 1 0] [0 3 1]] [[1 2 0] [0 1 1] [3 0 2]] [[5 4 2] [1 3 1] [3 3 6]] [1 1 0] 20)
true
```

`1`, `5`, and `20` "trials" all wrongly accept the false claim, identically. Reusing the same vector means every "trial" recomputes the exact same check on the exact same input, producing the exact same answer every time — there is no new information in a second, third, or twentieth check of an already-known result, so running it twenty times is exactly as informative as running it once. Restoring `freivalds-trial`'s fresh `(random-vector3)` draw per call — as `freivalds-repeated` does — brings back the real, measured exponential decay traced in Concept Unit 2.

## Exercises

- Run `count-false-accepts` against the genuine `C-true` claim instead of `C-false`, at trial counts `1`, `5`, and `20`, and confirm the count stays at `0` in every case — a true claim, per coRP's own guarantee, is never wrongly rejected, no matter how many trials run.
- Compute `(1/2)^10` by hand, then run `count-false-accepts` with `trials` `10` and `1000` experiments against `C-false`, and compare the real measured count to your hand-computed prediction.
- Change `C-false` so it differs from the true product in two entries instead of one, re-run the exhaustive eight-vector check from Concept Unit 1, and see whether the exact per-trial error count changes from `4` of `8`.

## Definition of done

- [ ] `freivalds-check`, `freivalds-trial`, `freivalds-repeated`, and `count-false-accepts` all run in `bb` with no errors, reproducing the qualitative pattern shown in this lesson (exact numbers will vary run to run, since this lesson uses real randomness).
- [ ] You can state, from memory, the difference between RP and coRP, and say which one `freivalds-check` belongs to and why.
- [ ] You can explain, without looking back at this lesson, why `(1/2)^k` is the right formula for `k` independent trials, and why `freivalds-repeated-broken` breaks that formula entirely rather than just weakening it.
- [ ] You have run the broken, fixed-vector version yourself and reproduced the real, unchanging `true` result across different trial counts.
- [ ] `git commit -m "Add Freivalds' algorithm as a coRP example, since verifying a matrix product needs randomized one-sided-error checking with independent trials, not full recomputation"`
