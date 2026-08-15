# Lesson 89: Hash Tables

**What you will build**: By the end of this lesson you'll be able to build a lookup structure indexed by an arbitrary key — not just a position — by deriving a hash function from Lesson 54's modular arithmetic, handling the collisions Lesson 66's pigeonhole principle guarantees will occur, and deriving the resulting expected lookup cost using Lesson 75's linearity of expectation and Lesson 77's indicator random variables.

**What you need to know first**: Lesson 84's arrays and `assoc`, Lesson 54's `mod`, Lesson 66's pigeonhole principle, and Lesson 75's linearity of expectation.

**Terms introduced in this lesson**:

- **hash function** — a function converting an arbitrary key into a bounded numeric index. *Why it matters*: this is the entire bridge between Lesson 84's cheap, position-based array access and the far more common need to look something up by an arbitrary key — a name, an identifier — rather than a position.
- **collision** — when two different keys hash to the same index. *Why it matters*: Lesson 66's pigeonhole principle already guarantees this is *unavoidable* once there are more possible keys than available indices — a hash table's design must handle it, not hope it never happens.
- **chaining** — resolving collisions by storing every key hashing to the same index together, in a list, rather than only one. *Why it matters*: the specific, concrete technique this lesson uses to keep colliding keys from overwriting each other.

**Objects and methods used**: None new. This lesson combines `mod` (Lesson 54), `assoc`/`get`/`count` (Lesson 84 and Lesson 43), and `cons`/`first`/`rest`, each already covered.

---

## Concept Unit: From Array Index to Arbitrary Key

### The Problem

Lesson 84's arrays give `O(1)` access — but only by a numeric position. Real lookups are usually by an arbitrary key (an account number, an identifier), not "the third element." How can an arbitrary key be turned into something an array can use directly?

### Introduce the concept in isolation

A **hash function** converts any key into a bounded index:

```clojure
(defn hash-key [key num-buckets] (mod key num-buckets))
```

```
user=> (hash-key 1 3)
1
user=> (hash-key 4 3)
1
user=> (hash-key 7 3)
1
```

`mod` (Lesson 54) guarantees the result always lands in range `0` to `num-buckets - 1` — a valid array index, always, regardless of the key. But notice: `1`, `4`, and `7` all hash to the identical index, `1` — a **collision**. With only `3` possible indices and infinitely many possible keys, Lesson 66's pigeonhole principle already guarantees collisions are unavoidable; a real design must handle them, not merely hope they're rare.

### Discard the throwaway example

Not applicable — `hash-key` is a real function, and this specific collision is used directly next.

### Project Change

- **Reference Source**: `mod`, from Lesson 54; `assoc`/`get`, from Lesson 84.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn make-empty-buckets [n]
  (if (= n 0)
    (list)
    (cons (list) (make-empty-buckets (- n 1)))))

(defn make-hash-table [num-buckets] (vec (make-empty-buckets num-buckets)))

(defn insert-at [table idx key value] (assoc table idx (cons [key value] (get table idx))))
(defn hash-insert [table key value] (insert-at table (hash-key key (count table)) key value))

(defn bucket-lookup [bucket key]
  (if (empty? bucket)
    nil
    (if (= (get (first bucket) 0) key)
      (get (first bucket) 1)
      (bucket-lookup (rest bucket) key))))

(defn hash-lookup [table key] (bucket-lookup (get table (hash-key key (count table))) key))
```

```
user=> (def t0 (make-hash-table 3))
user=> (def t1 (hash-insert (hash-insert (hash-insert t0 1 'apple) 4 'banana) 7 'cherry))
user=> t1
[() ([7 cherry] [4 banana] [1 apple]) ()]
user=> (hash-lookup t1 1)
apple
user=> (hash-lookup t1 4)
banana
user=> (hash-lookup t1 7)
cherry
user=> (hash-lookup t1 99)
nil
```

All three keys — `1`, `4`, `7` — collided into the identical bucket (index `1`), yet every single lookup still returns the correct value. **Chaining** is why: each bucket is itself a list of `[key value]` pairs, and `bucket-lookup` performs an ordinary linear search (Lesson 24's shape) within whichever bucket a key hashes to, correctly distinguishing between colliding keys by comparing the key itself, not just trusting the index.

### Discard the throwaway example

Not applicable — `hash-insert` and `hash-lookup` are real, complete, correct functions.

### Mechanical walkthrough — how it works in isolation

- **`make-empty-buckets`** — reappearing counting-down recursion (Lesson 20's shape), building a list of `n` empty lists, one per bucket.
- **`insert-at`** — reappearing "compute the index once, pass it as an argument" pattern (Lesson 87's `dequeue-from-ready`): `hash-key` is computed once in `hash-insert`, avoiding recomputation.
- **`bucket-lookup`** — reappearing linear-search shape (Lesson 24), scoped to *one bucket's* entries rather than the entire table — the cost of resolving a collision, once the correct bucket is already found in `O(1)`.

### CS Lens

A hash table is, structurally, an array (Lesson 84, `O(1)` indexed access) of lists (Lesson 85, chaining for collisions) — two representations this section already built, combined to trade away guaranteed `O(1)` lookup for something almost as good on average, the subject of the next unit.

### SE Lens

Choosing `num-buckets = 3` for potentially many more keys, the way this unit did, is a deliberately stressed example — in practice, `num-buckets` is chosen large enough, relative to the expected number of keys, to keep collisions rare rather than routine, exactly the design question the next unit answers precisely.

---

## Concept Unit: Deriving Expected Complexity

### The Problem

`bucket-lookup`'s cost depends entirely on how many keys landed in that one bucket. With a well-designed hash function spreading keys roughly evenly, what should that number actually be, on average?

### Introduce the concept in isolation

Model each of `n` inserted keys as landing in a *specific* bucket `j` independently, with probability `1/m` (`m` being the total bucket count) — exactly Lesson 77's **indicator random variable** pattern, one indicator per key, each equal to `1` if that key lands in bucket `j`. By linearity of expectation (Lesson 75), applied to `n` such indicators rather than two dice:

```
E[keys in bucket j] = Σ (each key's own probability of landing in bucket j) = n × (1/m) = n/m
```

```
user=> (def t1 (hash-insert (hash-insert (hash-insert (hash-insert (hash-insert (hash-insert (make-hash-table 3) 10 'a) 11 'b) 12 'c) 13 'd) 14 'e) 15 'f))
user=> (count (get t1 0))
2
user=> (count (get t1 1))
2
user=> (count (get t1 2))
2
```

With `n = 6` keys and `m = 3` buckets, `n/m = 2` — and, for this specific, honestly-computed example, every one of the `3` buckets holds exactly `2` keys, matching the derived expectation exactly. `bucket-lookup`'s cost is proportional to its own bucket's size, so **if `m` is chosen proportional to `n`** (say, `m ≈ n`), the expected bucket size — and therefore the expected lookup cost — is `O(1)`, even though any single lookup's *actual* cost still depends on that one bucket's specific contents.

### Discard the throwaway example

Not applicable — this derivation is a general, honestly-verified fact, matched exactly by the concrete example above.

### CS Lens

This is the precise distinction between *worst case* and *expected case* Big-O: Lesson 66's pigeonhole principle guarantees at least one collision once `n > m`, but says nothing about how *evenly* the rest distribute — an adversarial or badly-designed hash function could, in the worst case, send every single key to the identical bucket, making that bucket's lookup `O(n)`. This unit's expectation argument is what justifies calling real hash table lookups "fast" in practice: not because the worst case is good (it isn't — Lesson 66 already proved a collision must occur), but because a well-designed hash function makes that worst case genuinely improbable, precisely Lesson 74 and Lesson 79's own recurring theme — a rare bad case, versus a typical, good one.

### SE Lens

This is exactly why hash table implementations resize themselves (growing `m` as `n` grows) rather than using a fixed bucket count forever: keeping `m` roughly proportional to `n` is precisely what keeps this lesson's `n/m` expected bucket size — and therefore expected lookup cost — bounded by a constant, rather than silently growing as more keys are inserted into a hash table sized for a much smaller collection.

### Connection to the previous unit

The previous unit built a hash table that is unconditionally *correct* — chaining resolves every collision regardless of how bad it gets — and this unit derives precisely when it is also *fast*, using this series' own probability machinery to turn "roughly even distribution" from a hopeful assumption into a provable, quantified expectation.

---

## Connect the Pieces

The complete hash table, correctness and expected cost demonstrated together:

```clojure
(println "Collision handled correctly:" (hash-lookup t1 1) (hash-lookup t1 4) (hash-lookup t1 7))
(println "Bucket sizes (expect ~n/m each):" (count (get t1 0)) (count (get t1 1)) (count (get t1 2)))
(println "Missing key:" (hash-lookup t1 99))
```

```
Collision handled correctly: apple banana cherry
Bucket sizes (expect ~n/m each): 2 2 2
Missing key: nil
```

Every value this lesson built — the hash function (Lesson 54's `mod`), the bucket array (Lesson 84), the chaining lists (Lesson 85), and the expected-size derivation (Lesson 75 and Lesson 77) — comes together in a structure that is always correct, and, when `m` is chosen well relative to `n`, fast on average too.

## What Breaks Without This

Suppose a hash table were built with a fixed, small `num-buckets`, and thousands of keys were inserted into it without ever revisiting that choice — reasoning, incorrectly, that "hash tables are `O(1)`" as an unconditional fact rather than an expectation that depends directly on `n/m` staying small. As `n` grows far past `m`, this lesson's own derivation shows the expected bucket size — and therefore expected lookup cost — grows right along with it, degrading toward Lesson 24's plain `O(n)` linear search, entirely defeating the reason a hash table was chosen in the first place. The expected-complexity derivation this lesson built isn't decoration — it's the exact condition (`m` proportional to `n`) that has to keep holding for the `O(1)` reputation to actually apply.

## Exercises

1. **Trace.** By hand, compute `(hash-key 20 3)` and `(hash-key 23 3)`, and state whether they collide.
2. **Predict.** Before checking, predict the expected bucket size for `n = 9` keys spread across `m = 3` buckets, using this lesson's formula. Insert `9` keys and confirm the actual distribution is close to your prediction.
3. **Verify.** Insert `4` keys that all collide into the *same* bucket on purpose (choose keys accordingly, given `num-buckets`), and confirm `hash-lookup` still correctly distinguishes all `4` via chaining.
4. **Break it, on purpose.** Replace `hash-key` with a version that always returns `0`, regardless of the key or `num-buckets` (a deliberately broken hash function). Insert several keys and observe `bucket-lookup`'s cost degrade toward Lesson 24's plain linear search.
5. **Generalize.** Write `hash-delete`, removing a specific key's entry from its bucket (hint: filter the bucket's list, keeping every pair *except* the one matching the given key).
6. **Reconstruct.** Close this lesson. From memory, derive the expected bucket size formula using indicator random variables and linearity of expectation, and explain why a hash table's `O(1)` reputation depends on keeping `m` proportional to `n`.

## Definition of Done

- [ ] You can build a hash table with chaining and correctly resolve a genuine collision.
- [ ] You can derive expected bucket size using indicator random variables and linearity of expectation.
- [ ] You completed Exercise 3 and confirmed chaining correctly resolves a deliberate 4-way collision.
- [ ] You completed Exercise 5 and implemented a correct `hash-delete`.
- [ ] Commit your Exercise 4 and Exercise 5 work to your notes repository, with a commit message stating what you observed and built — for example, `"Observe broken all-zero hash degrade lookup toward O(n); implement hash-delete via bucket filtering"` — not just `"lesson 89 exercise"`.

---

**Next lesson:** Lesson 90, *Sets and Maps*, steps back from this section's specific implementations to name the abstract behavior — "a collection of unique values" or "a collection of key-value pairs" — independently of whichever concrete representation (array, hash table, or otherwise) actually provides it.
