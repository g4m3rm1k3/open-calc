# Lesson 66: Pigeonhole Principle

**What you will build**: By the end of this lesson you'll be able to prove something *must* be true without constructing a single concrete instance of it — this series' first genuine existence proof technique — and apply it directly to guarantee, with certainty rather than likelihood, that Lesson 54's hash bucketing must eventually produce a collision.

**What you need to know first**: Lesson 17's proof by contradiction, and Lesson 54's `bucket-for`.

**Terms introduced in this lesson**:

- **pigeonhole principle** — if `n` items are placed into `m` containers and `n > m`, at least one container holds more than one item. *Why it matters*: this series' first pure existence proof — proving something *must* exist without identifying which specific instance it is.
- **existence proof** — a proof that something exists, or must happen, without necessarily identifying a specific instance of it. *Why it matters*: names the general category the pigeonhole principle belongs to, distinguishing "I can prove a collision must occur somewhere" from the separate, harder question of "which specific items collide."

**Objects and methods used**: None new. This lesson applies `bucket-for` (Lesson 54) to a new, guaranteed conclusion.

---

## Concept Unit: The Principle, Proven by Contradiction

### The Problem

Eleven pigeons, ten pigeonholes, every pigeon in some hole. Must some hole contain more than one pigeon — and can this be *proven*, not just seem intuitively obvious?

### Introduce the concept in isolation

**Claim:** if `11` items are distributed among `10` containers, at least one container holds `2` or more.

**Proof, by contradiction (Lesson 17):** suppose not — suppose every one of the `10` containers holds at most `1` item. Then the total number of items across all containers is at most `10 × 1 = 10`. But there are `11` items, and `11 > 10` — a genuine contradiction (the total can't simultaneously be at most `10` and equal to `11`). So the assumption must be false: some container holds `2` or more.

### Discard the throwaway example

Not applicable — this is a formal, general proof, applied concretely in the next unit.

### Formal Definition, Walked Through

> **Pigeonhole principle**: if `n` items are placed into `m` containers, and `n > m`, at least one container holds more than one item.

- *"n > m"* — the exact condition that makes the contradiction work; if `n ≤ m`, every item genuinely could have its own separate container, and no contradiction would follow.
- The proof establishes *that* a crowded container exists, never *which* one — this is precisely what makes it an **existence proof** rather than a constructive one: knowing a collision must occur somewhere is a complete, valid conclusion on its own, even without identifying it.

### CS Lens

This is the exact "assume the opposite, derive an impossibility" shape Lesson 17 first established, applied here to counting instead of a specific function's behavior — the identical proof technique, a completely different subject matter.

### SE Lens

An existence proof is often exactly what's needed in practice, without needing the stronger, harder claim of identifying a specific instance — knowing a system *will* eventually experience a hash collision is enough to justify designing collision-handling logic, whether or not the specific colliding inputs are known in advance.

---

## Concept Unit: Hash Collisions Are Guaranteed, Not Just Likely

### The Problem

Lesson 54's `bucket-for` reduces an account ID to one of `10` buckets via `mod`. Given `11` distinct account IDs, is a bucket collision merely *probable*, or actually *certain*?

### Introduce the concept in isolation

Eleven distinct account IDs, ten buckets — exactly the pigeonhole principle's own shape, `n=11 > m=10` — guarantees a collision, with certainty, not merely high probability. Confirm concretely:

```clojure
(defn bucket-for [account-id num-buckets]
  (mod account-id num-buckets))
```

```
user=> (map (fn [id] (bucket-for id 10)) (list 1001 1002 1003 1004 1005 1006 1007 1008 1009 1010 1011))
(1 2 3 4 5 6 7 8 9 0 1)
```

Eleven account IDs, ten buckets — and `1001` and `1011` both land in bucket `1`, a genuine collision, exactly as the pigeonhole principle guaranteed *before this list was ever computed*. The proof didn't need to know these specific numbers in advance to be certain a collision would appear somewhere among any `11` distinct IDs mapped into `10` buckets.

### Discard the throwaway example

Not applicable — this confirms a genuine, proven guarantee with a real, concrete instance.

### Project Change

- **Reference Source**: `bucket-for`, from Lesson 54, is the direct function this unit's guarantee applies to.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(map (fn [id] (bucket-for id 10)) (list 1001 1002 1003 1004 1005 1006 1007 1008 1009 1010 1011))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(map (fn [id] (bucket-for id 10)) ...)`** — reappearing `map` (Lesson 25), applying `bucket-for` to each of eleven distinct account IDs, producing their ten-bucket assignments directly, visible enough to spot the guaranteed collision by inspection.

### CS Lens

This is exactly why real hash table implementations (Lesson 89) are designed *assuming* collisions will happen — the pigeonhole principle proves they're unavoidable once the number of items exceeds the number of buckets, making collision-handling a required feature, not a rare edge case to hope doesn't occur.

### SE Lens

Knowing a collision is *certain* beyond a specific threshold — rather than merely "increasingly likely" — is what justifies unconditionally building collision-handling logic into a hash-based system, rather than treating it as an optional safeguard for an unlikely event.

### Connection to the previous unit

The previous unit proved the general principle abstractly; this unit applies it to a real, already-built function (`bucket-for`), producing a genuine, verified collision exactly where the proof guaranteed one would exist.

---

## Connect the Pieces

A second, independent application, confirming the principle generalizes beyond hashing: among `13` people, at least two must share a birth month (`12` months, `13` people — `n=13 > m=12`).

```clojure
(defn find-collision [items bucket-fn]
  (if (empty? items)
    nil
    (if (not (empty? (filter (fn [other] (= (bucket-fn (first items)) (bucket-fn other))) (rest items))))
      (first items)
      (find-collision (rest items) bucket-fn))))

(println "Guaranteed collision among 11 IDs, 10 buckets:" (find-collision (list 1001 1002 1003 1004 1005 1006 1007 1008 1009 1010 1011) (fn [id] (bucket-for id 10))))
```

```
Guaranteed collision among 11 IDs, 10 buckets: 1001
```

`find-collision` searches for a genuine colliding item directly (existential search, Lesson 32) — confirming not just that a collision exists (the pigeonhole principle's own guarantee) but identifying one concretely, the difference between an existence proof and a constructive one made precise: the principle promised a collision existed before any searching happened; `find-collision` is the separate, additional work of actually locating it.

## What Breaks Without This

Suppose a system stored account data in exactly `10` buckets, assuming — without applying the pigeonhole principle — that "collisions are unlikely with only a few dozen accounts." The principle proves this assumption fails at exactly `11` accounts, not "eventually, probably" — treating collision-handling as optional, rather than mathematically guaranteed to eventually matter, is a design mistake the pigeonhole principle rules out with certainty, not probability: a system that doesn't handle collisions correctly will fail, deterministically, once the eleventh distinct account ID is added, whichever eleventh ID that happens to be.

## Exercises

1. **Trace.** Confirm, by hand, that any `13` numbers chosen from `1` to `12` must include a repeat, using the pigeonhole principle's own contradiction argument.
2. **Predict.** Before checking, predict the smallest number of account IDs that guarantees a collision into `7` buckets. Verify using `bucket-for` with a concrete example.
3. **Prove.** State and prove, using the pigeonhole principle's own contradiction structure, that any list of `366` people must include (at minimum) two who share the same birthday (ignoring leap years, `365` possible birthdays).
4. **Break it, on purpose.** Construct `10` account IDs (not `11`) into `10` buckets where no collision occurs, confirming the pigeonhole principle's `n > m` condition is exactly the boundary — not `n ≥ m`.
5. **Generalize.** Using `find-collision`, confirm a genuine collision exists among any `8` account IDs bucketed into `7` buckets of your own choosing.
6. **Reconstruct.** Close this lesson. From memory, restate the pigeonhole principle and its contradiction proof, and explain the difference between proving a collision exists and finding one.

## Definition of Done

- [ ] You can state and prove the pigeonhole principle from memory, using contradiction.
- [ ] You completed Exercise 4 and can explain why the boundary is `n > m`, not `n ≥ m`.
- [ ] You completed Exercise 3, proving a birthday-sharing guarantee using the identical proof structure.
- [ ] You can explain the difference between an existence proof and a constructive one, using `find-collision` as a concrete example of the latter.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you proved and verified — for example, `"Prove 366-person birthday pigeonhole; verify guaranteed collision among 8 IDs in 7 buckets via find-collision"` — not just `"lesson 66 exercise"`.

---

**Next lesson:** Lesson 67, *Stars and Bars*, derives a counting technique for a genuinely different kind of problem — distributing identical items among distinct groups — using a clever representation trick rather than the combination formula directly.
