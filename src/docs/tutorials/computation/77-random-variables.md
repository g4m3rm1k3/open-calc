# Lesson 77: Random Variables

**What you will build**: By the end of this lesson you'll be able to state precisely what `X` and `Y` have actually been throughout the previous three lessons — ordinary functions, in exactly Lesson 4's sense, mapping sample-space outcomes to numbers — and derive a distribution directly from such a function, rather than being handed one already built.

**What you need to know first**: Lesson 4's function definition, Lesson 71's sample space, and Lesson 75's expected value.

**Terms introduced in this lesson**:

- **random variable** — a function that assigns a real number to each outcome in a sample space. *Why it matters*: formalizes what "the sum of two dice" or "the coin's payout" have actually been all along — an ordinary function, in exactly Lesson 4's sense, applied to a random outcome rather than a plain argument.
- **indicator random variable** — a random variable that equals `1` if some event occurs, `0` otherwise. *Why it matters*: a genuinely useful special case whose expected value equals the event's probability directly — a real, common technique this series returns to in Lesson 78's randomized algorithms.

**Objects and methods used**: None new. This lesson combines `map` (Lesson 25) and `mod` (Lesson 54), each already covered.

---

## Concept Unit: A Random Variable Is a Function

### The Problem

Lessons 75 and 76 wrote `E[X]` and `Var(X)` freely, treating `X` as some quantity attached to a die roll. What, precisely, *is* `X` — a number, a variable in Lesson 3's sense, or something else entirely?

### Introduce the concept in isolation

`X` — "the sum of two dice" — is neither a fixed number nor a Lesson 3 binding; it's a **function**, taking a specific outcome (a pair of die values, Lesson 71's sample space) and returning a number:

```clojure
(defn sum-rv [outcome]
  (+ (first outcome) (second outcome)))
```

```
user=> (sum-rv [3 4])
7
```

This is exactly Lesson 4's function definition — an input, a rule, an output — applied to a random outcome instead of an ordinary argument. "Random" describes *which* outcome the function happens to be applied to (determined by rolling actual dice), not anything about the function `sum-rv` itself, which is completely ordinary and deterministic once given a specific outcome.

### Discard the throwaway example

Not applicable — `sum-rv` is a real function, directly connecting this lesson to Lesson 4's original vocabulary.

### Generalizing

Every random variable this series has used — the previous three lessons' `X` and `Y` — is, precisely, a function from a sample space to numbers: "sum," "is even," "payout," all fit this identical shape.

### CS Lens

Recognizing a random variable as "just a function" is exactly the same demystification Lesson 41 performed for symbolic expressions and Lesson 30 performed for trees-as-lists — a concept that sounded like it might need new machinery turns out to be a direct application of something this series already fully understands.

### SE Lens

This recognition is practically useful, not just tidy: any tool this series has built for functions (composition, Lesson 5; higher-order functions, Lesson 25) applies to random variables too, without needing separate, specialized versions.

---

## Concept Unit: Deriving a Distribution From a Random Variable

### The Problem

Rather than being handed a distribution (the way Lesson 70's convolution supplied one), derive one directly from a random variable applied across an entire sample space.

### Introduce the concept in isolation

```clojure
(defn is-even-rv [outcome]
  (if (= (mod outcome 2) 0) 1 0))
```

```
user=> (map is-even-rv (list 1 2 3 4 5 6))
(0 1 0 1 0 1)
```

Applying `is-even-rv` (an **indicator random variable** — `1` if the outcome is even, `0` otherwise) across the entire single-die sample space produces a list of `0`s and `1`s, one per outcome — the distribution *derived directly*, rather than assumed. Its expected value:

```
user=> (expected-value-from-counts (list 3 3) 2 0)
```

More directly, since every outcome is equally likely, `E[\text{is-even-rv}]` is simply the average of `(0 1 0 1 0 1)`: `3/6 = 1/2` — exactly `P(\text{even})`. This is the indicator random variable's defining property: **its expected value always equals the probability of the event it indicates.**

### Discard the throwaway example

Not applicable — this is a genuine, general, and useful fact about indicator random variables.

### Project Change

- **Reference Source**: No reference counterpart — a direct application of `map` to derive a distribution from a random variable's own definition.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code — type it yourself

```clojure
(defn is-even-rv [outcome]
  (if (= (mod outcome 2) 0) 1 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Mechanical walkthrough — how it works in isolation

- **`(mod outcome 2)`** — reappearing `mod` (Lesson 54), testing evenness directly.
- **`(map is-even-rv (list 1 2 3 4 5 6))`** — reappearing `map` (Lesson 25), applying the random variable to every outcome in the sample space at once — exactly how a distribution is genuinely derived from a random variable's own definition, rather than assumed.

### CS Lens

`E[\text{indicator}] = P(\text{event})` is exactly why indicator random variables are so useful in probabilistic algorithm analysis: summing many indicators together and using linearity of expectation (Lesson 75) — even for wildly dependent events — turns "expected number of times something happens" into a sum of individual probabilities, without ever needing the full joint distribution.

### SE Lens

Deriving a distribution by actually applying a random variable across a sample space, the way `map` did here, is the honest, checkable version of what Lesson 70's convolution did implicitly — recognizing the connection means Lesson 70's technique is now understood as one specific, efficient way to derive exactly this kind of distribution, not a separate, unrelated tool.

### Connection to the previous unit

The previous unit established that a random variable is an ordinary function; this unit uses that function the way any function gets used — applied across its actual domain — to derive a distribution directly, rather than trusting one handed over already built.

---

## Connect the Pieces

Both random variables — `sum-rv` and `is-even-rv` — connected back to this section's earlier results:

```clojure
(println "sum-rv([3,4]):" (sum-rv [3 4]))
(println "is-even-rv distribution over a die:" (map is-even-rv (list 1 2 3 4 5 6)))
(println "E[is-even-rv], matches P(even)=1/2:" (= 1/2 (/ (reduce + 0 (map is-even-rv (list 1 2 3 4 5 6))) 6)))
```

```
sum-rv([3,4]): 7
is-even-rv distribution over a die: (0 1 0 1 0 1)
E[is-even-rv], matches P(even)=1/2: true
```

Both random variables, `sum-rv` from Lesson 75's own quantity and `is-even-rv` built fresh this lesson, are ordinary Clojure functions, applied and reasoned about with exactly the tools (`map`, `reduce`, expected value) this series has trusted since early in this curriculum.

## What Breaks Without This

Suppose "the sum of two dice" were treated as if it were a fixed *value* rather than a function applied to a specific outcome — writing code that tried to use `sum-rv` without ever actually supplying a concrete outcome to apply it to, the same category of confusion Lesson 4 first addressed by distinguishing a function's definition from any one specific call. `sum-rv` alone, unapplied, says nothing about any particular roll — exactly the way `(defn square [n] (* n n))` alone computes nothing until called with an actual number; recognizing a random variable as a function, not a value, is what keeps "what does X equal" and "what could X equal, and with what probability" from being confused with each other.

## Exercises

1. **Trace.** Compute `(sum-rv [5 6])` and `(sum-rv [1 1])` directly.
2. **Predict.** Before computing it, predict `(map is-even-rv (list 1 2 3 4 5 6 7 8))` (an eight-sided die) and its expected value.
3. **Verify.** Define an indicator random variable `is-greater-than-4-rv`, apply it across a single die's sample space, and confirm its expected value matches `P(\text{value}>4)` computed directly.
4. **Break it, on purpose.** Attempt to compute `E[\text{sum-rv}]` by calling `sum-rv` on a single number instead of a pair (an outcome shaped incorrectly for the random variable's actual domain). Read the real error.
5. **Generalize.** Define a random variable `product-rv` on the two-dice sample space (the product of both values, not the sum), and derive its distribution by applying it across all `36` outcomes (you may enumerate the pairs directly by hand or with nested `map` calls).
6. **Reconstruct.** Close this lesson. From memory, define a random variable precisely, and explain why an indicator random variable's expected value always equals a probability.

## Definition of Done

- [ ] You can define a random variable as an ordinary function and apply it to a specific outcome.
- [ ] You completed Exercise 3, deriving an indicator random variable's distribution and confirming its expectation matches a directly-computed probability.
- [ ] You completed Exercise 5, deriving `product-rv`'s distribution over the full two-dice sample space.
- [ ] You can explain why treating a random variable as a value instead of a function is a real, catchable mistake.
- [ ] Commit your Exercise 3 and Exercise 5 work to your notes repository, with a commit message stating what you verified — for example, `"Verify is-greater-than-4-rv expectation (1/3) matches P(value>4); derive product-rv distribution over 36 dice outcomes"` — not just `"lesson 77 exercise"`.

---

**Next lesson:** Lesson 78, *Randomized Algorithms*, uses this lesson's random variables as an actual algorithmic resource — an algorithm that makes its own random choices, analyzed using exactly the expectation and indicator-variable tools this section has just built.
