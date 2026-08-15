# Lesson 54: Modular Arithmetic

**What you will build**: By the end of this lesson you'll be able to define and reason about arithmetic modulo `n` — the number system behind a clock face, checksums, and hashing — precisely, including the non-obvious fact that addition and multiplication modulo `n` are *well-defined*: it never matters which specific representative of an equivalence class you compute with, the final answer is always the same.

**What you need to know first**: Lesson 6's equality (this lesson builds a *coarser* notion of "the same" on top of it) and Lesson 12's relations.

**Terms introduced in this lesson**:

- **modulus** — the fixed number a modular arithmetic system is defined relative to (the `12` in "mod 12"). *Why it matters*: names the one parameter that determines an entire modular number system — everything else in this lesson depends on a specific, stated modulus.
- **equivalence class (mod n)** — the set of all integers that give the same remainder when divided by `n`; two such numbers are called **congruent** mod `n`. *Why it matters*: the precise mathematical object behind "13 o'clock is the same as 1 o'clock" — a formal name for the intuitive idea of numbers being interchangeable for modular purposes.
- **modular arithmetic** — arithmetic performed on remainders after division by a fixed modulus, where numbers differing by a multiple of the modulus are treated as equivalent. *Why it matters*: a genuinely different, cyclical number system from the ordinary integers this series has used throughout — one where, for instance, `10 + 5` can equal `3`.

**Objects and methods used**:

- **`mod`**
  - *What it is:* a function in Clojure's core library that computes the remainder of division, always returning a non-negative result for a positive modulus.
  - *Implementation:* `(mod a n)` — established behavior: `(mod 13 12)` → `1`; `(mod -1 12)` → `11` (not `-1` — `mod` always matches the modulus's sign convention, unlike ordinary remainder).
  - *Its use:* Concept Unit 1, to compute which equivalence class a number belongs to.

---

## Concept Unit: Equivalence Classes — When Two Numbers Are "The Same" Modulo n

### The Problem

A clock reads `1` o'clock both one hour after midnight and thirteen hours after midnight — `1` and `13` are, for the clock's purposes, "the same." Ordinary equality (Lesson 6) says `1 ≠ 13` — they're genuinely different numbers. What precise, different notion of "the same" is the clock actually using?

### Introduce the concept in isolation

```
user=> (mod 13 12)
1
user=> (mod 1 12)
1
user=> (mod 25 12)
1
```

`13`, `1`, and `25` all give the identical result, `1`, when reduced **mod 12** — the **modulus** here is `12`. Every one of these numbers belongs to the same **equivalence class**: the set of integers `{..., -11, 1, 13, 25, 37, ...}`, all differing from each other by a multiple of `12`. Two numbers in the same equivalence class are called **congruent** mod `12` — a coarser notion of "the same" than Lesson 6's `=`, deliberately: it says "the same, *for clock purposes*," ignoring how many full trips around the clock face have already happened.

### Discard the throwaway example

Not applicable — this is the actual foundational concept the rest of this lesson builds on.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(mod 13 12)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`mod`** — first appearance as a called function (covered fully in Objects and methods used, above): reduces a number to its equivalence class's standard representative — always a number from `0` to `n-1`, for a positive modulus `n`.

### CS Lens

This "coarser than equality, but still precise" idea is exactly Lesson 6's equality versus identity distinction, generalized: `=` asked "are these the exact same value"; congruence mod `n` asks a deliberately weaker, differently useful question, "do these behave the same way *for a specific purpose* (wrapping around every `n`)." Lesson 145 (*Equivalence Relations*), much later, formalizes exactly this pattern — a relation weaker than equality that still partitions a whole domain into well-defined, non-overlapping groups.

### SE Lells

Modular arithmetic is the exact mathematics behind array indices that "wrap around" (a circular buffer), a week's day-of-week calculation (`day mod 7`), and, as this lesson's closing unit shows directly, the basic idea behind hashing — reducing a huge space of possible values down to a small, fixed number of "buckets."

---

## Concept Unit: Modular Addition and Multiplication Are Well-Defined

### The Problem

If `7` and `12` are congruent mod `5` (both reduce to `2`), does it actually matter, when adding `7 + 8`, whether the *original* numbers or their *reduced* equivalents are used? Is `(7 + 8) mod 5` guaranteed to equal `((7 mod 5) + (8 mod 5)) mod 5`?

### Introduce the concept in isolation

```
user=> (mod (+ 7 8) 5)
0
user=> (mod (+ (mod 7 5) (mod 8 5)) 5)
0
```

Both routes give `0`. Now substitute a *different* representative for `7`'s equivalence class — `12`, which is congruent to `7` mod `5` (`12 - 7 = 5`, a multiple of `5`):

```
user=> (mod (+ 12 8) 5)
0
```

Still `0` — swapping `7` for `12` (an equally valid representative of the same equivalence class) didn't change the final answer at all. This is not a coincidence for this one example: modular addition (and multiplication) is **well-defined** — the result only ever depends on which equivalence class each input belongs to, never on which specific representative was used to compute it.

### Discard the throwaway example

Not applicable — this well-definedness property is a genuine, provable mathematical fact, confirmed concretely here.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(mod (+ 12 8) 5)
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(+ 12 8)`, `(+ 7 8)`** — reappearing addition (Lesson 2); the point of this comparison is that *different* sums, from *different* representatives of the same equivalence class, produce results that are still congruent to each other mod `5` — confirmed directly by both reducing to `0`.

### CS Lens

Well-definedness is what makes modular arithmetic an actual, self-consistent number *system* rather than just a convenient rounding trick — the same guarantee that lets `13:00` and `1:00` be freely interchanged on a twelve-hour clock without ever producing an inconsistent answer, no matter which representation a particular calculation happens to start from.

### SE Lells

This is exactly why a hash function (the next unit, and Lesson 89 fully) can safely reduce an enormous space of possible inputs down to a small number of buckets using `mod`: the arithmetic guarantees that congruent values behave identically under further modular operations, so nothing about the reduction process itself introduces inconsistency.

### Connection to the previous unit

The previous unit defined what makes two numbers "the same" mod `n`; this unit proves that sameness is actually safe to compute with — swapping one representative for another never silently changes a modular calculation's result.

---

## Connect the Pieces

A tiny hash function, using this lesson's equivalence classes for a genuine purpose — mapping account IDs to one of a fixed number of storage buckets:

```clojure
(defn bucket-for [account-id num-buckets]
  (mod account-id num-buckets))

(println "Account 1042 goes to bucket:" (bucket-for 1042 10))
(println "Account 1052 goes to bucket:" (bucket-for 1052 10))
(println "Account 2042 goes to bucket (same class as 1042, mod 10):" (bucket-for 2042 10))
```

```
Account 1042 goes to bucket: 2
Account 1052 goes to bucket: 2
Account 2042 goes to bucket: 2
```

Every account ID congruent to `1042` mod `10` lands in the identical bucket, `2` — a direct, working instance of this lesson's central claim: the modular reduction is well-defined and consistent, regardless of which specific account ID within that equivalence class is used. This is precisely the idea Lesson 89 (*Hash Tables*) builds a full, general-purpose data structure around.

## What Breaks Without This

Suppose a system used ordinary equality to decide whether two account IDs "belong together" in the same processing batch, while a *different* part of the same system used modular bucketing (this lesson's `bucket-for`) to decide storage location — without recognizing these are two genuinely different notions of "the same." Two accounts, `1042` and `2042`, are *not* equal (`Lesson 6`'s `=` correctly says `false`) but *are* congruent mod `10` (both land in bucket `2`) — a system that assumed "different bucket" always meant "unrelated accounts," or the reverse, would draw a wrong conclusion, not because either individual calculation was wrong, but because two different, both valid, notions of sameness were silently conflated.

## Exercises

1. **Trace.** Compute `(mod 100 7)` by hand (repeated subtraction of `7`, or long division), and verify against Clojure's `mod`.
2. **Predict.** Before checking, predict whether `17` and `32` are congruent mod `5`. Verify using `mod` directly.
3. **Verify.** Confirm modular multiplication is well-defined the way Concept Unit 2 confirmed addition: compute `(mod (* 7 8) 5)` and `(mod (* 12 8) 5)` (using `12`, congruent to `7` mod `5`), and confirm they match.
4. **Break it, on purpose.** Compute `(mod -7 5)` and compare it to what ordinary (non-modular) division-with-remainder might naively suggest (a negative remainder). Explain, using this lesson's definition, why Clojure's `mod` returns a non-negative result here.
5. **Generalize.** Using `bucket-for`, find two account IDs, both under `100`, that land in the same bucket out of `10` buckets, without either one being a "nice" multiple of the other.
6. **Reconstruct.** Close this lesson. From memory, explain what an equivalence class mod `n` is, and explain why well-definedness matters for `bucket-for` to behave consistently.

## Definition of Done

- [ ] You can compute a number's equivalence class mod `n` using `mod`, and explain what "congruent" means precisely.
- [ ] You completed Exercise 3, confirming modular multiplication is well-defined the way addition was shown to be.
- [ ] You can explain why `(mod -7 5)` is non-negative, using this lesson's definition rather than guessing.
- [ ] You can explain the difference between ordinary equality and congruence mod `n`, using a concrete example where the two disagree.
- [ ] Commit your Exercise 3 and Exercise 5 findings to your notes repository, with a commit message stating what you verified — for example, `"Verify modular multiplication well-defined for 7*8 vs 12*8 mod 5; find account IDs 1017 and 1057 both bucket to 7 out of 10"` — not just `"lesson 54 exercise"`.

---

**Next lesson:** Lesson 55, *Greatest Common Divisor*, derives Euclid's algorithm — one of the oldest algorithms known — directly from the mathematical identity behind it, using this lesson's modular reduction as its core operation.
