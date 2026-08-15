# Lesson 80: Markov Chains

**What you will build**: By the end of this lesson you'll be able to model a system that moves between states over time — where each move's probability depends only on the current state, never on how it got there — and compute a multi-step probability by recursively marginalizing over every intermediate state, naming and reusing a pattern Lesson 74's `p-positive` already used without naming it.

**What you need to know first**: Lesson 71's probability distributions, Lesson 41's `quote` and symbols, and Lesson 34's accumulator-style recursion.

**Terms introduced in this lesson**:

- **Markov chain** — a system that moves between a fixed set of **states**, where each transition's probability depends only on the *current* state. *Why it matters*: a genuinely common, powerful model for systems that evolve randomly over time — weather, board games, text generation, and more all fit this shape.
- **Markov property** (memorylessness) — the defining constraint: the probability of the next state depends only on the current state, never on the sequence of states that preceded it. *Why it matters*: without this constraint, "which state comes next" could depend on arbitrarily much history, making the system far harder to reason about.
- **law of total probability** — computing an event's overall probability by summing its probability across every way it could happen, weighted by how likely each way is. *Why it matters*: this is precisely what Lesson 74's `p-positive` already computed, without a name; this lesson names the pattern directly and reuses it to combine multiple future states into one.

**Objects and methods used**: None new. This lesson combines `quote`/symbols (Lesson 41), `if`, `=`, `+`, `-`, and `*`, each already covered.

---

## Concept Unit: Modeling State Transitions

### The Problem

Model tomorrow's weather as depending on today's weather, probabilistically: a sunny day is likely (but not certain) to be followed by another sunny day; a rainy day is a toss-up between staying rainy or clearing up. How should "today's state" and "tomorrow's probability" be connected?

### Introduce the concept in isolation

Represent each **state** as a quoted symbol (Lesson 41) — `'sunny` and `'rainy` — and the transition probability as an ordinary function of the current state:

```clojure
(defn p-sunny-tomorrow [today]
  (if (= today 'sunny) 9/10 1/2))
```

```
user=> (p-sunny-tomorrow 'sunny)
9/10
user=> (p-sunny-tomorrow 'rainy)
1/2
```

Given today is sunny, there's a `9/10` chance tomorrow is sunny too (and, since there are only two states, a `1/10` chance of rain). Given today is rainy, it's an even `1/2` chance either way. This is the entire model: two numbers, each depending only on *today's* state.

### Discard the throwaway example

Not applicable — `p-sunny-tomorrow` is the real transition function this lesson builds on.

### Project Change

- **Reference Source**: No reference counterpart — a direct model of a two-state weather system.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn p-sunny-tomorrow [today]
  (if (= today 'sunny) 9/10 1/2))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`'sunny`, `'rainy`** — reappearing quoted symbols (Lesson 41), used here purely as opaque, distinguishable labels — exactly the role symbols play in real state-machine implementations, where a state's *name* matters, not any numeric value.
- **`(if (= today 'sunny) 9/10 1/2)`** — reappearing two-branch `if` (Lesson 7), returning a *different fixed probability* depending only on which symbol `today` is bound to — the entire Markov property, expressed directly: nothing about `p-sunny-tomorrow`'s definition has access to any day *before* `today`.

### CS Lens

The **Markov property** is precisely what `p-sunny-tomorrow`'s signature enforces structurally: it takes exactly one argument, `today`, with no way to pass in yesterday, or the day before that. A function that *needed* more history to decide its output would need a different signature entirely — the state-transition function's own shape is what makes memorylessness a real, checkable property, not just a verbal assumption.

### SE Lens

Modeling a system as a **Markov chain** is a real, deliberate simplifying choice: it discards potentially-relevant history (perhaps three sunny days in a row really does predict tomorrow differently than one sunny day does) in exchange for a dramatically simpler model — a choice worth making explicitly, not by accident, and only when the memoryless assumption is a reasonable approximation of the real system being modeled.

---

## Concept Unit: Multi-Step Transitions via the Law of Total Probability

### The Problem

`p-sunny-tomorrow` answers "what's the chance of sun *tomorrow*?" What's the chance of sun *two* days from now — a question the one-step function alone doesn't answer directly, since tomorrow's actual state isn't known yet, only its probability?

### Introduce the concept in isolation

Tomorrow could be sunny (probability `p-sunny-tomorrow(today)`) or rainy (the remaining probability) — and the day after depends on *whichever one it turns out to be*. Sum across both possibilities, weighted by how likely each is — the **law of total probability**, the identical pattern Lesson 74's `p-positive` used (summing "positive and diseased" with "positive and not diseased") without a name:

```clojure
(defn p-sunny-in-n-days [today n]
  (if (= n 0)
    (if (= today 'sunny) 1 0)
    (+ (* (p-sunny-tomorrow today) (p-sunny-in-n-days 'sunny (- n 1)))
       (* (- 1 (p-sunny-tomorrow today)) (p-sunny-in-n-days 'rainy (- n 1))))))
```

```
user=> (p-sunny-in-n-days 'sunny 0)
1
user=> (p-sunny-in-n-days 'sunny 1)
9/10
user=> (p-sunny-in-n-days 'sunny 2)
43/50
```

`(p-sunny-in-n-days 'sunny 0)` is `1` — "zero days from now" just means today, and today is known, with certainty, to be sunny. `(p-sunny-in-n-days 'sunny 1)` recovers `9/10`, matching `p-sunny-tomorrow` directly. `(p-sunny-in-n-days 'sunny 2)` gives `43/50 = 0.86` — the two-day probability, computed by summing over both of tomorrow's possible states.

### Discard the throwaway example

Not applicable — `p-sunny-in-n-days` is a real, reusable function, hand-verified next.

### Mechanical walkthrough — how it works in isolation

- **`(if (= n 0) (if (= today 'sunny) 1 0) ...)`** — reappearing base-case shape (Lesson 20): "zero steps into the future" collapses to a certain, known fact about the *current* state — no probability needed at all.
- **`(* (p-sunny-tomorrow today) (p-sunny-in-n-days 'sunny (- n 1)))`** — the "tomorrow turns out sunny" branch: its own probability, times the probability of ending up sunny `n-1` days *after that*.
- **`(* (- 1 (p-sunny-tomorrow today)) (p-sunny-in-n-days 'rainy (- n 1)))`** — the "tomorrow turns out rainy" branch, symmetric to the one above.
- **`(+ ...)`** — the law of total probability itself: summing both mutually exclusive branches together, exactly Lesson 74's `p-positive` pattern, now named and applied to a genuinely different problem — a future state, not a diagnostic test.

### Hand Trace

Trace `(p-sunny-in-n-days 'sunny 2)` completely:

```
p-sunny-in-n-days('sunny, 2)
  = (9/10 × p-sunny-in-n-days('sunny, 1)) + (1/10 × p-sunny-in-n-days('rainy, 1))

p-sunny-in-n-days('sunny, 1)
  = (9/10 × p-sunny-in-n-days('sunny, 0)) + (1/10 × p-sunny-in-n-days('rainy, 0))
  = (9/10 × 1) + (1/10 × 0)
  = 9/10

p-sunny-in-n-days('rainy, 1)
  = (1/2 × p-sunny-in-n-days('sunny, 0)) + (1/2 × p-sunny-in-n-days('rainy, 0))
  = (1/2 × 1) + (1/2 × 0)
  = 1/2

p-sunny-in-n-days('sunny, 2)
  = (9/10 × 9/10) + (1/10 × 1/2)
  = 81/100 + 1/20
  = 81/100 + 5/100
  = 86/100 = 43/50
```

Every intermediate value matches the REPL output above exactly, confirming the recursion computes precisely what the law of total probability, applied by hand, predicts.

### CS Lens

`p-sunny-in-n-days` is structurally identical to Lesson 30's tree recursion: each call branches into two smaller subproblems (one per possible next state) and combines their results — the *only* difference is the combination step uses weighted addition (probabilities) instead of, say, `+` for counting leaves or `max` for a largest value.

### SE Lens

The recursive branching here doubles in size with each additional day (`n` days deep means `2^n` total base-case evaluations in the naive version above) — precisely Lesson 31's exponential-recursion pattern, the same shape that motivated Lesson 32's memoization; a real implementation modeling many days into the future would want that same optimization applied here.

### Connection to the previous unit

The previous unit defined a single-step transition function; this unit extends it across multiple steps, using the law of total probability to marginalize over every intermediate state the system could actually pass through.

---

## Connect the Pieces

The complete model, both the one-step transition and the multi-step marginalization, verified together:

```clojure
(println "P(sunny tomorrow | sunny today):" (p-sunny-tomorrow 'sunny))
(println "P(sunny tomorrow | rainy today):" (p-sunny-tomorrow 'rainy))
(println "P(sunny in 0 days | sunny today):" (p-sunny-in-n-days 'sunny 0))
(println "P(sunny in 1 day | sunny today):" (p-sunny-in-n-days 'sunny 1))
(println "P(sunny in 2 days | sunny today):" (p-sunny-in-n-days 'sunny 2))
(println "P(sunny in 2 days | rainy today):" (p-sunny-in-n-days 'rainy 2))
```

```
P(sunny tomorrow | sunny today): 9/10
P(sunny tomorrow | rainy today): 1/2
P(sunny in 0 days | sunny today): 1
P(sunny in 1 day | sunny today): 9/10
P(sunny in 2 days | sunny today): 43/50
P(sunny in 2 days | rainy today): 7/10
```

`p-sunny-in-n-days` at `n=1` recovers `p-sunny-tomorrow` exactly, confirming the multi-step function correctly generalizes the one-step case rather than replacing it with something unrelated. The two-day probabilities, `43/50` starting sunny versus `7/10` starting rainy, are genuinely different — the current state still matters this far out — but as `n` grows large, both converge toward the same number (a **stationary distribution**, a topic beyond this lesson's scope), a well-known further fact about Markov chains this lesson does not derive.

## What Breaks Without This

Suppose "tomorrow's weather" were modeled using the *entire* history of past days, rather than only today's state — say, a function taking a list of every previous day's weather and computing tomorrow's probability from all of it. This isn't wrong, exactly, but it discards the Markov property's central simplification: `p-sunny-in-n-days` could no longer be written as a clean two-branch recursion on a single symbol, and every one of this lesson's hand-verified computations would need to account for exponentially many possible histories instead of just two possible current states. The entire tractability of this lesson's approach — computing `43/50` by hand, in a few lines — depends on the Markov property holding.

## Exercises

1. **Trace.** By hand, compute `(p-sunny-in-n-days 'rainy 2)` completely, confirming `7/10`.
2. **Predict.** Before computing it, predict whether `(p-sunny-in-n-days 'sunny 10)` and `(p-sunny-in-n-days 'rainy 10)` will be close together or far apart, compared to the `n=2` case. Justify using this lesson's convergence remark.
3. **Verify.** Confirm `(p-sunny-in-n-days 'sunny 1)` equals `(p-sunny-tomorrow 'sunny)` exactly, for any state, by re-reading the base-case definition.
4. **Break it, on purpose.** Modify `p-sunny-tomorrow` to (incorrectly) take two arguments — today's state *and* yesterday's — without actually using the second argument in the body. Explain why this change, even though the function still runs, misrepresents what a genuine Markov chain requires.
5. **Generalize.** Add a third state, `'cloudy`, to this lesson's model (inventing reasonable transition probabilities of your own, one probability per possible "tomorrow" from each of the three states, each set summing to `1`), and extend `p-sunny-in-n-days` to marginalize over all three branches.
6. **Reconstruct.** Close this lesson. From memory, state the Markov property, and re-derive `(p-sunny-in-n-days 'sunny 2)` using the law of total probability.

## Definition of Done

- [ ] You can define a one-step transition function obeying the Markov property.
- [ ] You can compute a multi-step probability by recursively marginalizing over intermediate states.
- [ ] You completed Exercise 1 and hand-verified `(p-sunny-in-n-days 'rainy 2) = 7/10`.
- [ ] You completed Exercise 5, extending the model to a three-state system.
- [ ] Commit your Exercise 1 and Exercise 5 work to your notes repository, with a commit message stating what you built — for example, `"Verify 2-day rainy-start probability (7/10) by hand; extend weather model to 3 states (sunny/rainy/cloudy)"` — not just `"lesson 80 exercise"`.

---

**Next lesson:** Lesson 81, *Monte Carlo and Las Vegas Algorithms*, names and formalizes the exact correctness/performance split Lesson 78's `randomized-search` first demonstrated, sorting randomized algorithms into two precise families.
