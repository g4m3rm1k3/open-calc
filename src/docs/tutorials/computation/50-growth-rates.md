# Lesson 50: Growth Rates

**What you will build**: By the end of this lesson you'll be able to name six standard growth-rate families — constant, logarithmic, linear, quadratic (a specific polynomial), exponential, and factorial — and you'll have computed real numbers for each one at the same input sizes, side by side, making the difference between them a concrete, visceral fact rather than an abstract ranking.

**What you need to know first**: Every closed form Lesson 49 derived, and `count-halvings` (Lesson 43), `permutation-count` (Lesson 45).

**Terms introduced in this lesson**:

- **growth rate** — how a quantity, usually a cost, changes as its input size increases; a named category (linear, quadratic, exponential, and so on) describes the *shape* of that change, not its exact value for any one specific input. *Why it matters*: this is the precise idea every closed form Lesson 49 derived was actually describing — this lesson gives the shapes themselves their standard names and puts them side by side.

**Objects and methods used**: None new. This lesson computes and compares values from already-written functions.

---

## Concept Unit: The Growth Rate Families, Named

### The Problem

Lesson 49 derived closed forms for three specific functions: `nc` (linear), `n(n-1)/2` (quadratic), and a bound of `2ⁿ` (exponential). These have standard names, and there are others this series has already produced examples of without naming the category. What are all of them, and which already-built function represents each one?

### Introduce the concept in isolation

Six named **growth rates**, each with a function this series has already built and trusted as its representative:

- **Constant** — cost doesn't depend on input size at all. A single arithmetic operation, like one `+`, is the simplest example.
- **Logarithmic** — cost grows by roughly one unit each time the input *doubles*. `count-halvings` (Lesson 43) is exactly this.
- **Linear** — cost grows proportionally to the input size itself. `sum-to` (Lesson 20), with its `T(n) = T(0) + nc` closed form (Lesson 49).
- **Quadratic** — cost grows proportionally to the input size *squared*. `reverse-naive` (Lesson 28), with its `n(n-1)/2` closed form — quadratic is one specific member of the broader **polynomial** family (any fixed power of `n`; Lesson 42's polynomial evaluation itself is degree-dependent, generalizing this further).
- **Exponential** — cost grows proportionally to a fixed number raised to the power of the input size. `fib`'s bounded cost, `2ⁿ` (Lesson 49).
- **Factorial** — cost grows proportionally to the input size's own factorial. `permutation-count(n, n)` — which equals `factorial(n)` exactly, per Lesson 45's own Connect the Pieces.

### Discard the throwaway example

Not applicable — every representative function is already built and trusted from an earlier lesson.

### Generalizing

Every one of these six categories was already present in this series before it had a name — this unit is naming what was already there, the same "the pattern existed before the vocabulary" realization Lesson 27 had about `reduce`, and Lesson 33 had about backtracking.

### CS Lens

This ordered list — constant, logarithmic, linear, polynomial, exponential, factorial — is, not coincidentally, also an ordering from "grows slowest" to "grows fastest," a claim the next unit makes concrete with real numbers rather than asserting it abstractly.

### SE Lens

Having a name for a function's growth rate is what makes a design conversation precise: "this is logarithmic" or "this is quadratic" communicates, in one word, exactly how a cost will scale — information "this seems reasonably fast" never actually contains.

---

## Concept Unit: Comparing Them at Increasing Input Sizes

### The Problem

Naming six categories in order of "slowest to fastest-growing" is a claim. Is it true, concretely — and by how much?

### Introduce the concept in isolation

Compute each representative's actual value, at the identical input sizes, by hand:

| `n` | Constant | Logarithmic (`count-halvings`) | Linear (`n`) | Quadratic (`n(n-1)/2`) | Exponential (`2ⁿ`) | Factorial (`n!`) |
|---|---|---|---|---|---|---|
| `5` | `1` | `2` | `5` | `10` | `32` | `120` |
| `10` | `1` | `3` | `10` | `45` | `1,024` | `3,628,800` |
| `20` | `1` | `4` | `20` | `190` | `1,048,576` | `2,432,902,008,176,640,000` |

Every row uses the identical `n`. The constant column never changes. The logarithmic column barely changes — doubling `n` from `10` to `20` adds only `1`. The linear and quadratic columns grow noticeably but stay within reach of ordinary arithmetic. The exponential column has already passed a million by `n = 20`. The factorial column, at `n = 20`, is a twenty-digit number — larger than there are grains of sand on Earth, for an input size a small loop would process in a fraction of a second if it only needed linear or logarithmic work.

### Discard the throwaway example

Not applicable — every number in this table is a directly, honestly computed value.

### CS Lens

This table is the concrete evidence behind Section IV's formal treatment (Lesson 51's Big-O) of exactly this ordering — the categories aren't ranked by convention or intuition, they're ranked by what actually happens to the numbers as `n` grows, verified here directly rather than asserted.

### SE Lens

The gap between quadratic and exponential at `n = 20` (a few hundred versus over a million) is already dramatic; by `n = 40`, exponential cost is in the trillions and factorial cost is a number with more digits than most calculators display — the practical consequence being that an algorithm with exponential or factorial cost isn't merely "slower," it becomes completely unusable for real input sizes well before an algorithm with any polynomial cost would, a difference in *kind*, not just degree.

### Connection to the previous unit

The previous unit named six categories and asserted an ordering; this unit is the direct, computed proof of that ordering, using real numbers rather than trusting the claim on its own.

---

## Concept Unit: Where Each Growth Rate Becomes Impractical

### The Problem

"Exponential is bad" is a common claim in casual conversations about algorithms. Precisely how large an input actually becomes a real problem, and does the answer depend on which growth rate is involved?

### Introduce the concept in isolation

Suppose a computer can perform roughly a billion basic operations per second — a rough, realistic modern figure. A linear algorithm's cost at `n = 1,000,000,000` (a billion) still finishes in about a second. A quadratic algorithm's cost at the *same* input size, `n(n-1)/2`, is around `500,000,000,000,000,000` operations — many years, not seconds. An exponential algorithm doesn't even need `n` in the millions to become impractical: `2^60` already exceeds a billion billion, an input size only sixty items long, well within what a real problem (Lesson 33's `power-set`, or naive `fib`) might actually be asked to handle.

This is the real, practical reason this series has spent effort deriving exact closed forms rather than only informally sensing "this feels slower": knowing *which* category a cost belongs to predicts, precisely, whether a given input size will finish in a blink, a lunch break, or never — a difference no amount of "seems fine on my small test case" (Lesson 18's own closing warning) would reveal in advance.

### Discard the throwaway example

Not applicable — this reasoning is directly actionable, not illustrative only.

### CS Lens

This is exactly why Section VI's algorithm design spends real effort avoiding exponential and factorial costs whenever a problem allows it — Lesson 33's backtracking (pruning a search space rather than generating all of it) and Lesson 38's memoization (eliminating redundant exponential-shaped recomputation) are both, precisely, techniques for moving a computation from a worse growth-rate category into a better one, not just making it "somewhat faster."

### SE Lens

A team estimating whether a feature "will scale" is, whether or not they use this vocabulary, asking exactly this question — and answering it precisely, by identifying the actual growth-rate category (not by testing on today's small dataset and hoping), is what separates a real capacity plan from an optimistic guess.

### Connection to the previous unit

The previous unit computed the same six growth rates at the same input sizes; this unit connects those numbers to a real, physical consequence — how long a computation actually takes — making the comparison's stakes concrete rather than purely abstract.

---

## Connect the Pieces

The full table, plus a direct question this series can now answer precisely: at what `n` does `reverse-naive`'s quadratic cost first exceed naive `fib`'s exponential cost?

```
n=5:  reverse-naive ≈ 10   |  fib bound ≈ 32     → exponential already ahead
n=10: reverse-naive ≈ 45   |  fib bound ≈ 1,024  → gap widening fast
n=20: reverse-naive ≈ 190  |  fib bound ≈ 1,048,576 → gap now enormous
```

Exponential overtakes quadratic almost immediately, and the gap only widens from there — a direct, numeric confirmation that "exponential is worse than quadratic" isn't a rule of thumb, it's a fact provable from the closed forms Lesson 49 derived, checkable at any `n` a reader chooses to compute.

## What Breaks Without This

Suppose two algorithms for the same problem were compared only by running both on a convenient test input, `n = 8`, and picking whichever finished first — without ever deriving or comparing their actual growth rates. An exponential algorithm can easily outperform a quadratic one at `n = 8` (small inputs don't yet show the gap this lesson's table makes visible at `n = 20`), leading to exactly the wrong conclusion: choosing the exponential algorithm because it "tested faster," only to discover, once real input sizes arrive, that it's now the one taking hours where the quadratic alternative would have taken milliseconds. This is Lesson 18's closing warning again, in its most consequential form yet: a few convenient test cases can actively mislead a real engineering decision, precisely because growth-rate differences are often invisible at small `n` and overwhelming at large `n`.

## Exercises

1. **Trace.** Compute the six growth-rate values from this lesson's table at `n = 15`, by hand or using already-verified functions.
2. **Predict.** Before computing it, predict which grows faster between `n³` (a polynomial, not yet in this lesson's table) and `2ⁿ`, at `n = 10` versus at `n = 30`. Compute both to check — does the answer change depending on which `n` you pick?
3. **Compare.** At what `n` does `permutation-count(n, n)` (factorial) first exceed one million? Find it by computing successive values.
4. **Break it, on purpose.** Construct a specific, small `n` (test it directly) where an exponential-cost function's value is *smaller* than a quadratic-cost function's value, the way "What Breaks Without This" warned could mislead a comparison based only on small test cases.
5. **Generalize.** Using this lesson's "billion operations per second" estimate, compute roughly how long an exponential algorithm (`2ⁿ` operations) would take at `n = 50`. Express your answer in a human-meaningful unit (seconds, days, years) rather than a raw operation count.
6. **Reconstruct.** Close this lesson. From memory, list all six growth-rate categories in order from slowest to fastest-growing, and name the already-built function this series uses to represent each one.

## Definition of Done

- [ ] You can list all six growth-rate categories in order, each with a representative function from earlier in this series.
- [ ] You completed Exercise 3 and found the specific `n` where factorial growth first exceeds one million.
- [ ] You completed Exercise 4 and can state, concretely, at what input size an exponential function first overtakes a quadratic one for your chosen example.
- [ ] You can explain, using a real consequence (Exercise 5's time estimate), why "exponential" is a qualitatively different problem than "slow."
- [ ] Commit your Exercise 3 and Exercise 5 findings to your notes repository, with a commit message stating the concrete numbers you found — for example, `"Factorial exceeds 1 million at n=10 (10!=3,628,800); 2^50 at 1 billion ops/sec takes roughly 13 days"` — not just `"lesson 50 exercise"`.

---

**Next lesson:** Lesson 51, *Big-O*, gives this lesson's informal "grows like" comparisons a formal, precise mathematical definition — asymptotic notation, derived directly from the idea that only a growth rate's dominant behavior matters once the constants and lower-order details are stripped away.
