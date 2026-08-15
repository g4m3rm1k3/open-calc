# Lesson 67: Stars and Bars

**What you will build**: By the end of this lesson you'll be able to count the number of ways to distribute identical items among distinct groups — a genuinely different kind of counting problem than anything else in this section, where the items themselves have no identity to permute — using a representation trick that reduces it directly back to `combination-count`.

**What you need to know first**: Lesson 62's `combination-count` — this lesson's entire result is a single call to it, once the right representation is found.

**Terms introduced in this lesson**:

- **stars and bars** — a technique for counting the number of ways to distribute `n` identical items among `k` distinct groups, by representing a distribution as a row of `n` stars and `k-1` dividing bars, then counting arrangements of that row. *Why it matters*: solves a genuinely different *kind* of counting problem — identical items, not distinct ones — by reducing it to a combination count already derived.

**Objects and methods used**: None new. This lesson applies `combination-count` (Lesson 62) to a new problem shape.

---

## Concept Unit: The Stars and Bars Representation

### The Problem

Distribute `3` identical coins among `2` distinct accounts — how many different distributions are possible? This isn't quite Lesson 61's permutations (the coins are identical — swapping two coins within the same account changes nothing) and it isn't quite Lesson 62's combinations either (a coin can be "chosen" more than once, landing several in the same account). What tool actually fits?

### Introduce the concept in isolation

Represent one specific distribution — say, `2` coins in account one, `1` in account two — as a row of symbols: `**|*` — two stars, a bar (dividing account one from account two), one more star. Every possible distribution of `3` identical coins into `2` accounts corresponds to *exactly one* arrangement of `3` stars and `1` bar (one bar, since `2` accounts need exactly `1` divider between them):

```
***|    → 3 in account one, 0 in account two
**|*    → 2 in account one, 1 in account two
*|**    → 1 in account one, 2 in account two
|***    → 0 in account one, 3 in account two
```

Four distributions, corresponding exactly to the four positions the single bar could occupy among the `4` total symbols (`3` stars `+ 1` bar). Counting distributions has become counting *arrangements of a row of symbols* — a problem this series already knows how to solve.

### Discard the throwaway example

Not applicable — this representation is the direct basis for the formula in the next unit.

### Generalizing

Nothing about this representation depended on `3` coins or `2` accounts specifically — `n` identical items distributed among `k` distinct groups always corresponds to arranging a row of `n` stars and `k-1` bars (one fewer bar than the number of groups, since `k` groups need `k-1` dividers to separate them).

### CS Lens

This is a genuine representation trick — Lesson 1's own lesson about choosing the right representation for a problem, applied here at the level of an entire combinatorial technique rather than a single data structure: recasting "distribute identical items" as "arrange a row of symbols" is what makes an already-solved tool (combinations) apply to a problem that didn't look like it fit at first.

### SE Lens

Recognizing when a counting problem involves genuinely *identical*, interchangeable items (coins, identical product units, indistinguishable tokens) versus *distinct* ones (Lesson 61 and 62's people, cards, letters) is the actual judgment call — the representation only works because the items truly have no individual identity to permute.

---

## Concept Unit: Counting via Combinations

### The Problem

Turn "arrange `n` stars and `k-1` bars in a row" into an actual count.

### Introduce the concept in isolation

A row of `n + (k-1)` total symbols, where choosing *which* `k-1` of those positions hold bars (the rest automatically holding stars) completely determines the arrangement — exactly `combination-count(n+k-1, k-1)`, choosing bar positions from all available positions:

```clojure
(defn stars-and-bars [n k]
  (combination-count (+ n k -1) (- k 1)))
```

```
user=> (stars-and-bars 3 2)
4
```

Matching Concept Unit 1's direct enumeration exactly. Check the `2`-group case generally: distributing `n` identical items between exactly `2` accounts is also directly countable without any representation trick at all — simply choose how many go to the first account, `0` through `n` — exactly `n+1` possibilities:

```
user=> (stars-and-bars 5 2)
6
```

`5 + 1 = 6`, matching the direct "choose how many go to account one" count exactly — a real, independent cross-check for the `2`-group case, confirming the general formula agrees with the simplest possible direct reasoning where one is available.

### Discard the throwaway example

Not applicable — `stars-and-bars` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct application of `combination-count` to this lesson's own derived representation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `combination-count`, from Lesson 62.

### The New Code — type it yourself

```clojure
(defn stars-and-bars [n k]
  (combination-count (+ n k -1) (- k 1)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(+ n k -1)`** — reappearing arithmetic (Lesson 2): the total row length, `n` stars plus `k-1` bars.
- **`(combination-count (+ n k -1) (- k 1))`** — reappearing `combination-count` (Lesson 62), choosing which `k-1` of the total positions hold bars — the entire problem, reduced to a single already-solved formula.

### CS Lens

Distributing identical resources among distinct groups — exactly this lesson's problem — is a common real shape: allocating a fixed total of memory among several processes, distributing a budget among several departments, or counting how many ways a fixed number of identical tasks could be assigned to distinct workers, all reduce to the identical stars-and-bars formula.

### SE Lens

The representation trick is what made this problem tractable at all — without it, counting distributions of identical items directly (without first recognizing the stars-and-bars correspondence) would require either enumerating every case by hand or deriving a new formula from first principles, exactly the extra work this lesson's single reduction avoids.

### Connection to the previous unit

The previous unit built the representation; this unit turns it into a direct count, cross-checked against the simplest case (`k=2`) where an independent, representation-free count was also available.

---

## Connect the Pieces

`stars-and-bars`, verified two ways on a case large enough to be non-trivial:

```clojure
(println "Distribute 5 coins among 3 accounts:" (stars-and-bars 5 3))
(println "Direct check via combination-count(7,2):" (combination-count 7 2))
```

```
Distribute 5 coins among 3 accounts: 21
Direct check via combination-count(7,2): 21
```

`stars-and-bars(5,3)` and the underlying `combination-count(7,2)` it reduces to agree exactly, by construction — `5` stars and `2` bars (for `3` accounts) makes `7` total positions, choosing `2` of them for the bars.

## What Breaks Without This

Suppose the number of bars were miscounted — using `k` bars instead of `k-1` (an easy off-by-one, since "the number of accounts" and "the number of dividers between them" differ by exactly one, the same kind of boundary mistake Lesson 22 named directly):

```
user=> (combination-count (+ 3 3) 3)
20
```

`20`, not the correct `4` for `3` coins among `2` accounts (using `k=2` bars incorrectly instead of `k-1=1`) — a specific, plausible-looking wrong answer, produced by miscounting how many dividers `k` groups actually need. Getting this boundary exactly right — `k` groups need `k-1` dividers, never `k` — is the entire reason Concept Unit 1's small, fully-enumerated example was worked out by hand first, rather than trusting the formula from the very start.

## Exercises

1. **Trace.** By hand, list all ways to distribute `2` identical items among `3` accounts (using stars and bars directly), and confirm the count matches `stars-and-bars(2,3)`.
2. **Predict.** Before computing it, predict `stars-and-bars(4,2)` using the direct "`n+1`" shortcut available for exactly `2` groups. Verify against the general formula.
3. **Verify.** Confirm `stars-and-bars(0,3)` (distributing nothing among `3` accounts) gives `1` — the single way of giving everyone nothing — and explain why using the formula directly.
4. **Break it, on purpose.** Reproduce the off-by-one mistake from "What Breaks Without This" yourself, using `k` bars instead of `k-1` for a distribution problem of your own choosing, and state the wrong answer it produces.
5. **Generalize.** How many ways can `10` identical tokens be distributed among `4` distinct players? Compute using `stars-and-bars` directly.
6. **Reconstruct.** Close this lesson. From memory, explain the stars-and-bars representation, and derive why `k` groups need exactly `k-1` bars, not `k`.

## Definition of Done

- [ ] You can construct the stars-and-bars representation for a small distribution problem, and count it two ways.
- [ ] You completed Exercise 3 and can explain why distributing nothing gives exactly `1` way.
- [ ] You completed Exercise 5 and can state the result for `10` tokens among `4` players.
- [ ] You can explain why `k` groups require `k-1` bars, using the representation directly, not just recalling the formula.
- [ ] Commit your Exercise 1 and Exercise 5 work to your notes repository, with a commit message stating each verified count — for example, `"Verify stars-and-bars(2,3)=6 by direct listing; 10 tokens among 4 players: C(13,3)=286"` — not just `"lesson 67 exercise"`.

---

**Next lesson:** Lesson 68, *Counting Recursive Structures*, turns from these closed-form combinatorial formulas back toward recurrence relations (Lesson 48), counting trees, strings, and paths directly from their own recursive definitions.
