# Lesson 79: Birthday Paradox

**What you will build**: By the end of this lesson you'll be able to derive one of the most famous surprising results in probability — that a group far smaller than intuition suggests has better-than-even odds of a shared birthday — using the complement technique, verified completely on a small, hand-checkable version before applying it to the real, famous `365`-day case.

**What you need to know first**: Lesson 71's probability axioms and Lesson 61's permutation-style products.

**Terms introduced in this lesson**:

- **complement** — the event that `A` does *not* occur; `P(\text{not } A) = 1 - P(A)`. *Why it matters*: the key technique this lesson relies on — directly computing "at least one shared birthday" is awkward, but its complement, "every birthday is different," is a clean, direct product.

**Objects and methods used**: None new. This lesson combines `if`, `=`, `-`, `*`, and `/`, each already covered.

---

## Concept Unit: Computing via the Complement

### The Problem

Directly computing "the probability that at least two people, out of a group, share a birthday" is awkward — there are many different ways a collision could happen (any pair, any triple, and so on). Is there an easier route?

### Introduce the concept in isolation

Compute the **complement** instead — the probability that *every* birthday is different — which has a clean, direct structure: the first person can have any birthday (`365/365` chance of "no conflict," trivially); the second must avoid the first's (`364/365`); the third must avoid both (`363/365`); and so on.

```clojure
(defn prob-all-different [total-days num-people]
  (if (= num-people 0)
    1
    (* (/ (- total-days (- num-people 1)) total-days) (prob-all-different total-days (- num-people 1)))))
```

```
user=> (prob-all-different 7 3)
30/49
```

For a "mini" `7`-day week and `3` people: `(7/7) × (6/7) × (5/7) = 30/49 ≈ 0.612` chance every birthday is different — leaving `1 - 30/49 = 19/49 ≈ 0.388` chance of at least one shared birthday among `3` people, out of only `7` possible days.

### Discard the throwaway example

Not applicable — `prob-all-different` is a real, reusable function, verified against the smaller case before scaling up.

### Project Change

- **Reference Source**: No reference counterpart — a direct implementation of the "each new person must avoid every already-used day" argument.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn prob-all-different [total-days num-people]
  (if (= num-people 0)
    1
    (* (/ (- total-days (- num-people 1)) total-days) (prob-all-different total-days (- num-people 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(- total-days (- num-people 1))`** — the number of days still available to the *current* (last-added) person, given everyone before them already claimed one distinct day each.
- **`(* (/ ... total-days) (prob-all-different total-days (- num-people 1)))`** — reappearing product-accumulation shape (Lesson 61's `permutation-count`), multiplying one more "avoid the used days" probability onto the smaller group's already-computed probability.

### CS Lens

`prob-all-different`'s structure is exactly `permutation-count`'s own recursive shape (Lesson 45), with each term divided by `total-days` — computing `P(\text{all different}) = \text{permutation-count}(365, k) / 365^k` without ever needing to compute the enormous intermediate factorials that closed form would require, precisely by staying in the recursive, term-by-term version instead.

### SE Lens

Choosing the complement's *recursive product* form, rather than the closed-form `365!/(365-k)!/365^k` (which would require computing `365!` — an almost incomprehensibly large intermediate number, far larger than anything actually needed for the final answer), is a real, practical engineering choice: the same final probability, reached without ever constructing a number vastly larger than necessary along the way.

---

## Concept Unit: The Surprising Threshold

### The Problem

At what group size does "at least one shared birthday" become *more* likely than not? Intuition (wrongly) suggests something close to half the number of possible days — verify against the actual numbers.

### Introduce the concept in isolation

Continue the `7`-day mini-example one more person:

```
user=> (prob-all-different 7 4)
120/343
```

`P(\text{all different}, 4 \text{ people}) = 120/343 ≈ 0.35`, so `P(\text{at least one shared}) = 1 - 120/343 = 223/343 ≈ 0.65` — already past `50\%` at just `4` people, out of `7` possible days, far sooner than "half of `7`" (`3.5`) would naively suggest.

The same computation, applied to the real, famous case — `365` days, `23` people — gives the well-known result: `P(\text{all different}) ≈ 0.493`, so `P(\text{at least one shared}) ≈ 0.507` — just over half, with only `23` people, out of `365` possible birthdays. This is the **birthday paradox**: not a logical contradiction, but a result so far from naive intuition that it earns the name anyway.

### Discard the throwaway example

Not applicable — this is a genuine, famous, well-established result, derived here by the identical, verified method as the smaller `7`-day case.

### CS Lens

The birthday paradox is the direct probabilistic cousin of Lesson 66's pigeonhole principle: pigeonhole *guarantees* a collision once `n` exceeds the number of containers; the birthday paradox shows a collision becomes *merely likely* — here, more likely than not — at a group size far smaller than the number of containers (`365`) itself, a genuinely different, probabilistic kind of claim.

### SE Lens

This exact mathematics underlies a real, practical security concern: hash collisions (Lesson 66's own example) become likely far sooner than "half the hash space" would suggest, precisely the birthday paradox's own lesson — a `64`-bit hash isn't safe from collisions until you've hashed close to `2^32` items (the square root, not half, of the total space), a direct, important consequence of this lesson's math.

### Connection to the previous unit

The previous unit derived and verified `prob-all-different` completely on a small, hand-checkable case; this unit applies the identical, already-trusted method to the much larger, famous case, without needing to re-derive or re-verify the underlying technique.

---

## Connect the Pieces

The complete mini-example, both directions, confirming the complement technique end to end:

```clojure
(println "P(all different), 7 days, 3 people:" (prob-all-different 7 3))
(println "P(at least one shared), 7 days, 3 people:" (- 1 (prob-all-different 7 3)))
(println "P(all different), 7 days, 4 people:" (prob-all-different 7 4))
(println "P(at least one shared), 7 days, 4 people:" (- 1 (prob-all-different 7 4)))
```

```
P(all different), 7 days, 3 people: 30/49
P(at least one shared), 7 days, 3 people: 19/49
P(all different), 7 days, 4 people: 120/343
P(at least one shared), 7 days, 4 people: 223/343
```

`19/49 ≈ 0.388` (not yet past `50\%`) crossing to `223/343 ≈ 0.65` (well past `50\%`) at just one more person — the threshold, crossed between `3` and `4` people out of `7` days, the identical *shape* of surprise the real `365`-day case produces at `23` people, just scaled to numbers small enough to verify completely by hand.

## What Breaks Without This

Suppose someone estimated the threshold group size using the naive "half the days" intuition directly — guessing `4` people would be needed for even odds out of `7` days (roughly half), when the actual crossing point, confirmed by direct computation, is precisely between `3` and `4`. For the real `365`-day case, the same naive intuition would guess something close to `183` people (half of `365`) — wildly larger than the true answer, `23`. This isn't a minor estimation error; it's off by a factor of roughly `8`, precisely because the complement's *product* structure (each new person facing worse and worse odds, multiplicatively) behaves nothing like the *linear* "half the days" intuition assumes.

## Exercises

1. **Trace.** By hand, compute `prob-all-different(7,2)` and confirm `P(\text{at least one shared}) < 50\%` at `2` people.
2. **Predict.** Before computing it, predict whether `10` days would need more or fewer people than `7` days to cross the `50\%` threshold. Verify by computing `prob-all-different(10, k)` for a few values of `k`.
3. **Verify.** Confirm the crossing point for the `7`-day case is genuinely between `3` and `4` people, not `2` and `3` or `4` and `5`.
4. **Break it, on purpose.** Compute the "naive half the days" estimate for a `100`-day case, and compare it to the actual crossing point found by computing `prob-all-different(100, k)` for increasing `k`.
5. **Generalize.** Using `prob-all-different`, find the smallest group size where `P(\text{at least one shared birthday})` exceeds `90\%` for the real `365`-day case (you may reason about the trend rather than computing every value by hand).
6. **Reconstruct.** Close this lesson. From memory, explain why computing the complement is easier than computing "at least one shared" directly, and explain why the birthday paradox's threshold is so much smaller than naive intuition suggests.

## Definition of Done

- [ ] You can compute `prob-all-different` for a small case and derive the complement probability.
- [ ] You completed Exercise 2 and found the crossing threshold for a `10`-day case.
- [ ] You completed Exercise 4 and can state, concretely, how far off the naive "half the days" estimate is for a `100`-day case.
- [ ] You can explain, precisely, why the complement technique avoids computing an enormous, unnecessary intermediate factorial.
- [ ] Commit your Exercise 2 and Exercise 4 findings to your notes repository, with a commit message stating the thresholds you found — for example, `"10-day crossing point is between 4-5 people; 100-day naive estimate (50) is roughly 3-4x the actual crossing point"` — not just `"lesson 79 exercise"`.

---

**Next lesson:** Lesson 80, *Markov Chains*, introduces state transitions governed by probabilities — a system that moves between states over time, each move depending only on the current state, connecting this section's probability tools directly to Section II's recursive state-machine thinking.
