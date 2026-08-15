# Lesson 59: Counting Without Listing

**What you will build**: By the end of this lesson you'll be able to count how many possibilities exist without generating a single one of them — deriving the fundamental counting principle from direct enumeration on a small case, then recognizing it as the exact mechanism already hiding inside `power-set`'s `2ⁿ` and `permutation-count`'s shrinking product.

**What you need to know first**: Lesson 42's `power` and Lesson 45's `permutation-count` — this lesson names the single principle both were already built on.

**Terms introduced in this lesson**:

- **fundamental counting principle** — if one choice can be made in `m` ways, and a second, independent choice can be made in `n` ways, then both choices together can be made in `m × n` ways. *Why it matters*: the single fact underneath every combinatorial count this series has already computed — `power-set`'s `2ⁿ` subsets, `permutation-count`'s shrinking product — named explicitly for the first time.

**Objects and methods used**: None new. This lesson reuses `power` (Lesson 42), applied to a new kind of problem.

---

## Concept Unit: The Fundamental Counting Principle, Derived

### The Problem

Two shirts, three pairs of pants — how many complete outfits (one shirt, one pants) are possible? Small enough to list directly; is there a shortcut that doesn't require listing, and can it be trusted for cases too large to list at all?

### Introduce the concept in isolation

List every outfit directly: shirt A with pants 1, 2, 3; shirt B with pants 1, 2, 3 — six outfits total, `(A,1), (A,2), (A,3), (B,1), (B,2), (B,3)`. Notice the structure: for *each* of the `2` shirt choices, there are `3` independent pants choices — `2` groups of `3`, giving `2 × 3 = 6`, matching the direct count exactly.

### Discard the throwaway example

Not applicable — this small, fully-listed case is the direct evidence behind the general principle stated next.

### Generalizing

Nothing about this argument depended on the specific numbers `2` and `3`, or on shirts and pants — any two *independent* choices, one with `m` options and one with `n`, combine into exactly `m × n` total possibilities, by the identical "each of the m groups contains n options" reasoning.

### Formal Definition, Walked Through

> The **fundamental counting principle**: if a first choice can be made in `m` ways, and a second choice, independent of the first, can be made in `n` ways, then the two choices together can be made in `m × n` ways.

- *"independent of the first"* — this matters: if the second choice's *options* changed depending on the first choice (not just relabeled, but a genuinely different count of options), simple multiplication wouldn't apply directly — a case this series already handled differently in `permutation-count` (Lesson 45), covered again in Concept Unit 3.

### CS Lens

This is exactly Lesson 10's Cartesian product, counted rather than listed — `A × B`'s size is `|A| × |B|`, the identical multiplication, now justified by direct enumeration rather than merely defined.

### SE Lells

Counting via this principle instead of generating every possibility is a real, practical difference: listing `1024` outfits to know there are `1024` of them is wasted work the moment the *count* alone, not the specific list, is what's actually needed.

---

## Concept Unit: Counting a PIN's Possibilities Without Generating Them

### The Problem

A four-digit PIN, each digit `0` through `9` independently — how many possible PINs exist, without listing any of them?

### Introduce the concept in isolation

Four independent choices, each with `10` options (the counting principle applied three times in a row: `10 × 10 × 10 × 10`):

```clojure
(defn count-combinations [choices-per-step num-steps]
  (power choices-per-step num-steps))
```

```
user=> (count-combinations 10 4)
10000
```

`10,000` possible PINs — computed in one step, without generating a single one of them, matching `power`'s own repeated-multiplication definition (Lesson 42) exactly, because repeated application of the counting principle to the *same* number of options at every step *is* exponentiation.

### Discard the throwaway example

Not applicable — `count-combinations` is a real, reusable function.

### Project Change

- **Reference Source**: No reference counterpart — a direct application of `power` to a new problem.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed; `power`, from Lesson 42.

### The New Code — type it yourself

```clojure
(defn count-combinations [choices-per-step num-steps]
  (power choices-per-step num-steps))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(power choices-per-step num-steps)`** — reappearing `power` (Lesson 42): the fundamental counting principle, applied `num-steps` times to the identical `choices-per-step` options each time, is precisely what exponentiation already meant — this unit gives that repeated multiplication a combinatorial meaning, not a new mechanism.

### CS Lens

A four-digit PIN having `10,000` possibilities, checkable by a single computer in well under a second, is why real PIN systems require additional protections (lockouts after failed attempts) — the counting principle is exactly what makes this vulnerability precisely quantifiable rather than vaguely "a lot of options."

### SE Lells

Counting without generating scales to numbers no computer could ever actually enumerate — a `128`-bit encryption key has `2^128` possibilities, a number `power` computes instantly and no computer could ever list one at a time, a direct, practical reason this principle matters far beyond small examples like a PIN.

### Connection to the previous unit

The previous unit proved the principle on a tiny, fully-listed case; this unit applies it at a scale where listing is never actually an option, trusting the proof rather than needing to re-verify by enumeration.

---

## Concept Unit: Recognizing the Principle Already at Work

### The Problem

`power-set` (Lesson 32) and `permutation-count` (Lesson 45) were both derived earlier in this series, before this lesson's principle had a name. Were they secretly using it all along?

### Introduce the concept in isolation

`power-set`'s `2ⁿ` subsets: for each of `n` elements, an *independent* binary choice — include it, or don't — exactly `2` options, applied `n` times: `2 × 2 × ... × 2 = 2ⁿ`, the fundamental counting principle, applied repeatedly to the identical two-option choice.

`permutation-count(n, k)`'s shrinking product `n × (n-1) × ... × (n-k+1)`: here the choices are *not* independent in the strict sense (each pick reduces what's available for the next) — but the counting principle still applies at each individual step, multiplying together, because at the moment each choice is made, its own number of options is fixed and known, even though that number depends on the *previous* choices' outcomes rather than staying constant.

### Discard the throwaway example

Not applicable — both functions are already fully trusted from earlier lessons.

### Generalizing

The counting principle's "independent" requirement is really about each step's option *count* being determined and fixed at the moment that step is counted — `permutation-count`'s option count shrinks in a perfectly predictable way (exactly one fewer each time), which is enough structure for the multiplication to still be valid, even though the *specific* remaining items available do depend on earlier choices.

### CS Lens

Recognizing `power-set` and `permutation-count` as two applications of one shared principle — rather than two unrelated formulas — is the identical realization Lesson 27 had about `sum-to` and `factorial` sharing a recursive shape: the underlying idea existed before it had one name, and naming it makes the connection between separately-derived results visible.

### SE Lells

Once a counting problem is recognized as "independent choices, multiply the option counts," the actual count can usually be written down directly, without deriving a new formula from scratch each time — the same reuse benefit this series has argued for constantly, now applied to combinatorial reasoning itself.

### Connection to the previous unit

The previous unit applied the principle to a new problem (PIN counting); this unit looks backward and finds the identical principle already embedded in two functions this series trusted well before it had a name — the same "recognize the pattern was already there" realization this series has now made several times.

---

## Connect the Pieces

All three counting problems, confirmed to share one underlying principle:

```clojure
(println "PIN combinations:" (count-combinations 10 4))
(println "power-set(1,2,3) count:" (my-length (power-set (list 1 2 3))))
(println "2^3, via counting principle:" (power 2 3))
(println "permutation-count(5,2):" (permutation-count 5 2))
```

```
PIN combinations: 10000
power-set(1,2,3) count: 8
2^3, via counting principle: 8
permutation-count(5,2): 20
```

`power-set`'s actual output length matches `2³` exactly, confirming the counting-principle explanation isn't just plausible, it's verifiably correct — the same value, reached two different ways (generating and counting, versus computing directly), agreeing exactly.

## What Breaks Without This

Suppose the counting principle were applied to a case where the two choices *aren't* actually independent — say, "how many ways to choose a captain and a co-captain from a team of `5`," assumed to be `5 × 5 = 25` (treating both picks as independent choices from all `5` players). This overcounts: the co-captain can't be the *same* person as the captain, so the second choice only really has `4` options once the first is fixed — the true count is `5 × 4 = 20` (exactly `permutation-count(5,2)`), not `25`. Applying the principle without checking whether the "independent" condition genuinely holds produces a specific, confidently wrong answer — precisely why Concept Unit 1 flagged that condition explicitly rather than treating multiplication as universally safe.

## Exercises

1. **Trace.** List all six outfits from Concept Unit 1's shirts-and-pants example directly, confirming the count matches `2 × 3`.
2. **Predict.** Before computing it, predict how many possible license plates exist with `3` letters (`26` options each) followed by `3` digits (`10` options each). Verify using the counting principle directly.
3. **Diagnose.** Using this lesson's captain/co-captain example, explain precisely why `5 × 5` overcounts, and state what's actually being double-counted.
4. **Break it, on purpose.** Construct your own example where naively multiplying two counts overcounts, the way the captain/co-captain case did, and state the correct count.
5. **Generalize.** How many distinct `3`-digit codes are possible if no digit may repeat (each of the `10` digits usable at most once)? Compute it using the counting principle, checking whether each step's option count is independent or shrinking.
6. **Reconstruct.** Close this lesson. From memory, state the fundamental counting principle, and explain why `permutation-count`'s shrinking product still counts as a valid application of it.

## Definition of Done

- [ ] You can state the fundamental counting principle from memory and apply it to a new, small example.
- [ ] You can explain why `power-set` and `permutation-count` are both applications of the same principle.
- [ ] You completed Exercise 3 and can state precisely what the captain/co-captain overcount double-counts.
- [ ] You completed Exercise 5, correctly distinguishing independent from shrinking option counts.
- [ ] Commit your Exercise 2 and Exercise 5 counts to your notes repository, with a commit message stating each result — for example, `"License plates: 26^3 * 10^3 = 17,576,000; 3-digit no-repeat codes: 10*9*8=720"` — not just `"lesson 59 exercise"`.

---

**Next lesson:** Lesson 60, *Addition and Multiplication Rules*, states the counting principle's own counterpart for combining *alternative* choices rather than *sequential* ones — completing the two basic rules every combinatorial count in this section builds from.
