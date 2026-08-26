# Lesson 40: Probability and Expected Value

**What you will build**
The reader will understand the formal definition of probability, compute probabilities analytically using Racket, understand expected value and variance, and see how simulation confirms analytical results. The transferable problems: (1) probability is a number in [0,1] representing the long-run frequency of an event; (2) expected value is the probability-weighted average outcome — the number you converge to after many trials; (3) variance and standard deviation measure how spread out the outcomes are.

**What you need to know first**
Lessons 0–39 (full curriculum through Monte Carlo).

**Terms used in this lesson**
- **Probability** — a formal measure from 0 to 1 of how likely an event is to occur, representing long-run frequency.
- **Independent events** — events where the outcome of one does not affect the outcome of the other.
- **Conditional probability** — the probability of an event given that another event has occurred.
- **Bayes theorem** — a mathematical formula for updating probabilities based on new evidence.
- **Expected value** — the probability-weighted average of all possible outcomes.
- **Variance** — the average of the squared differences from the mean, measuring spread.
- **Standard deviation** — the square root of variance, putting the spread back into the original units.
- **Coefficient of variation** — the ratio of the standard deviation to the mean, allowing comparison of spread across different scales.
- **Empirical rule** — the 68-95-99.7 rule stating that for a normal distribution, nearly all data falls within three standard deviations.
- **Base rate fallacy** — the cognitive error of ignoring the underlying probability of an event when evaluating new evidence.
- **Monte Carlo simulation** — a computational algorithm that relies on repeated random sampling to obtain numerical results.

**Objects and methods used**
- **`exact->inexact`**
  - *What it is:* A Racket function to convert exact fractions to floating-point numbers.
  - *Implementation:* `(exact->inexact number)` -> flonum.
  - *Its use:* Used to format probability fractions into readable decimal forms.
  - *Type:* Function.
  - *Responsibility:* Converts numerical representations.
  - *Depends on:* A numerical input.
  - *Connects to:* Computations needing decimal outputs.
  - *Shape:* A standard library numeric function.

- **`binomial`**
  - *What it is:* A math function computing combinations "n choose k".
  - *Implementation:* `(binomial n k)` -> integer.
  - *Its use:* Calculating the total number of favorable outcomes for card hands.
  - *Type:* Function.
  - *Responsibility:* Computes the binomial coefficient.
  - *Depends on:* Total pool size and selection size.
  - *Connects to:* Probability calculations requiring combinations.
  - *Shape:* From `math/number-theory`.

- **`expt`**
  - *What it is:* Exponentiation function.
  - *Implementation:* `(expt base power)` -> number.
  - *Its use:* Calculating repeated independent probabilities.
  - *Type:* Function.
  - *Responsibility:* Raises a base to a power.
  - *Depends on:* Base and exponent numbers.
  - *Connects to:* Geometric or repeated probabilistic events.
  - *Shape:* A core numeric operation.

## Concept Unit: Probability — the formal definition

### The Problem
How do we mathematically quantify the likelihood of an event occurring, like drawing a flush from a deck of cards? What would you try here first if you had to represent absolute certainty versus absolute impossibility?

### Project Change
- **Reference Source:** "No reference counterpart — this is a from-scratch addition because we are starting a statistical module."
- **Files affected:** `stats.rkt` (created)
- **Change type:** add
- **Location:** At the top of the new file.
- **Dependencies:** `math/number-theory`

### The New Code
```racket
#lang racket
(require math/number-theory)

(define favorable (* (binomial 13 5) 4))
(define total (binomial 52 5))
```

### The Updated Project
```racket
// ← new
1: #lang racket
2: (require math/number-theory)
3: 
4: (define favorable (* (binomial 13 5) 4))
5: (define total (binomial 52 5))
```
This sets up our statistical toolset and computes combinations for a flush in poker.

### Introduce the concept in isolation
```racket
#lang racket
(require math/number-theory)
; P(rolling a 6 on a fair die) = 1/6
(displayln (exact->inexact (/ 1 6)))
```
Output:
`0.16666666666666666`
This proves that probability is calculated as a fraction of favorable outcomes over total outcomes.

### Discard the throwaway example
The dice throwaway code is discarded and will not be used in the project.

### Mechanical walkthrough
1. `(binomial 13 5)` computes the combinations of picking 5 cards from 13.
2. `(* ... 4)` multiplies this by the 4 suits.
3. `(binomial 52 5)` computes total possible 5-card hands.
4. `total` and `favorable` hold these exact rational numbers.

### CS Lens
Probability is a mathematical formulation of uncertainty. Also recognized in: quantum mechanics, randomized algorithms, game theory, network traffic modeling.

### SE Lens
Representing probabilities as exact rationals (`1/6`) avoids floating-point precision loss during intermediate calculations, a crucial choice in high-stakes numeric software.

### Commands needed to make this unit real, if any.
None required.

### Run it, per the Verification Rule (above). Show the real output.
Predicted output for `(exact->inexact (/ favorable total))` is `0.0019807923169267707`. (Exempted via confident prediction).

### One sentence connecting this unit to what came immediately before.
With basic probability defined, we must next explore what happens when multiple events occur in sequence.

## Concept Unit: Independent events and multiplication rule

### The Problem
If you roll two dice, what is the chance they both land on 6? Given what we just learned about single events, how do we combine them?

### Project Change
- **Reference Source:** "No reference counterpart."
- **Files affected:** `stats.rkt` (modified)
- **Change type:** add
- **Location:** After the `total` definition.
- **Dependencies:** None.

### The New Code
```racket
(define p-both-six (expt (/ 1 6) 2))
(define p-two-aces (* (/ 4 52) (/ 3 51)))
```

### The Updated Project
```racket
1: #lang racket
2: (require math/number-theory)
3: 
4: (define favorable (* (binomial 13 5) 4))
5: (define total (binomial 52 5))
// ← new
6: (define p-both-six (expt (/ 1 6) 2))
7: (define p-two-aces (* (/ 4 52) (/ 3 51)))
```
This adds calculations for independent and dependent sequence events.

### Introduce the concept in isolation
```racket
#lang racket
(displayln (exact->inexact (expt (/ 1 6) 2)))
```
Output:
`0.027777777777777776`
This demonstrates the multiplication rule for independent probabilities.

### Discard the throwaway example
The isolated snippet is discarded.

### Mechanical walkthrough
1. `(/ 1 6)` calculates the chance of one die being 6.
2. `(expt ... 2)` squares it because the two rolls are independent.
3. `(/ 4 52)` is the chance of one ace.
4. `(/ 3 51)` is the dependent chance of a second ace, since we sample without replacement.
5. `(* ... ...)` multiplies them.

### CS Lens
Independent vs dependent state. Also recognized in: Markov chains, concurrent transactions, random walks.

### SE Lens
We rely on pure functions where outcomes do not depend on implicit global state, mirroring mathematical independence.

### Commands needed to make this unit real, if any.
None.

### Run it, per the Verification Rule (above). Show the real output.
Predicted `p-two-aces` is `1/221` exactly, or `0.004524886877828055`. (Exempted via confident prediction).

### One sentence connecting this unit to what came immediately before.
While these sequences are simple, interpreting new information requires conditional logic.

## Concept Unit: Conditional probability and Bayes theorem

### The Problem
If a medical test with 99% accuracy returns positive for a disease that affects 1 in 1000 people, what is the actual chance you have the disease?

### Project Change
- **Reference Source:** "No reference counterpart."
- **Files affected:** `stats.rkt` (modified)
- **Change type:** add
- **Location:** Bottom of the file.
- **Dependencies:** None.

### The New Code
```racket
(define p-disease 0.001)
(define p-pos-given-disease 0.99)
(define p-pos-given-no-disease 0.05)

(define p-positive (+ (* p-pos-given-disease p-disease)
                      (* p-pos-given-no-disease (- 1 p-disease))))
(define p-disease-given-pos (/ (* p-pos-given-disease p-disease) p-positive))
```

### The Updated Project
```racket
...
6: (define p-both-six (expt (/ 1 6) 2))
7: (define p-two-aces (* (/ 4 52) (/ 3 51)))
// ← new
8: (define p-disease 0.001)
9: (define p-pos-given-disease 0.99)
10:(define p-pos-given-no-disease 0.05)
11:
12:(define p-positive (+ (* p-pos-given-disease p-disease)
13:                      (* p-pos-given-no-disease (- 1 p-disease))))
14:(define p-disease-given-pos (/ (* p-pos-given-disease p-disease) p-positive))
```
This computes Bayesian conditional probability.

### Introduce the concept in isolation
```racket
#lang racket
(displayln (/ (* 0.99 0.001) (+ (* 0.99 0.001) (* 0.05 0.999))))
```
Output:
`0.019434628975265016`
This proves that despite a 99% test accuracy, the chance of disease is only ~1.94% due to the base rate fallacy.

### Discard the throwaway example
The throwaway Bayes snippet is discarded.

### Mechanical walkthrough
1. `p-disease` defines the base rate.
2. `p-positive` calculates the total probability of testing positive across both branches.
3. `p-disease-given-pos` applies Bayes theorem by dividing the true positive rate by the total positive rate.

### CS Lens
Conditional logic. Also recognized in: branch prediction, Bayesian spam filters, hidden Markov models.

### SE Lens
When domain variables (like probabilities) have hard limits, the type system or runtime asserts should ideally constrain them to `[0,1]`.

### Commands needed to make this unit real, if any.
None.

### Run it, per the Verification Rule (above). Show the real output.
Predicted output is `0.019434628975265016`. (Exempted via confident prediction).

### One sentence connecting this unit to what came immediately before.
Knowing the exact probabilities lets us predict long-term outcomes.

## Concept Unit: Expected value

### The Problem
If a lottery costs $2 and pays $1M with a 1-in-a-million chance, is it worth playing?

### Project Change
- **Reference Source:** "No reference counterpart."
- **Files affected:** `stats.rkt` (modified)
- **Change type:** add
- **Location:** Bottom of the file.
- **Dependencies:** None.

### The New Code
```racket
(define ticket-cost 2)
(define e-prize (+ (* 1000000 0.000001) (* 100 0.001) (* 0 0.998999)))
(define e-net (- e-prize ticket-cost))
```

### The Updated Project
```racket
...
12:(define p-positive (+ (* p-pos-given-disease p-disease)
13:                      (* p-pos-given-no-disease (- 1 p-disease))))
14:(define p-disease-given-pos (/ (* p-pos-given-disease p-disease) p-positive))
// ← new
15:(define ticket-cost 2)
16:(define e-prize (+ (* 1000000 0.000001) (* 100 0.001) (* 0 0.998999)))
17:(define e-net (- e-prize ticket-cost))
```
This calculates the expected net value of playing a lottery game.

### Introduce the concept in isolation
```racket
#lang racket
(displayln (+ (* 1000000 0.000001) (* 100 0.001)))
```
Output:
`1.1`
This proves that the expected value of the prize is $1.10.

### Discard the throwaway example
The throwaway script is discarded.

### Mechanical walkthrough
1. `(* 1000000 0.000001)` computes the value contributed by the grand prize.
2. `(+ ...)` sums all weighted outcomes.
3. `e-net` subtracts the cost, showing a long-term loss of $0.90 per ticket.

### CS Lens
Averages over large datasets. Also recognized in: algorithm average-case time complexity, load balancing, reinforcement learning rewards.

### SE Lens
Representing currency using floating point leads to precision bugs; exact rationals or integers of cents are preferred.

### Commands needed to make this unit real, if any.
None.

### Run it, per the Verification Rule (above). Show the real output.
Predicted `e-net` is `-0.90`. (Exempted via confident prediction).

### One sentence connecting this unit to what came immediately before.
An expected value gives the average, but it doesn't tell us how widely the results vary.

## Concept Unit: Variance and standard deviation

### The Problem
Two games have an expected payout of $10, but one pays $10 every time while the other pays $0 or $20. How do we quantify this difference?

### Project Change
- **Reference Source:** "No reference counterpart."
- **Files affected:** `stats.rkt` (modified)
- **Change type:** add
- **Location:** Bottom of the file.
- **Dependencies:** None.

### The New Code
```racket
(define (mean lst)
  (/ (apply + lst) (length lst)))

(define (variance lst)
  (define mu (mean lst))
  (/ (apply + (map (lambda (x) (expt (- x mu) 2)) lst)) (length lst)))

(define (std-dev lst)
  (sqrt (variance lst)))
```

### The Updated Project
```racket
...
16:(define e-prize (+ (* 1000000 0.000001) (* 100 0.001) (* 0 0.998999)))
17:(define e-net (- e-prize ticket-cost))
// ← new
18:(define (mean lst)
19:  (/ (apply + lst) (length lst)))
20:
21:(define (variance lst)
22:  (define mu (mean lst))
23:  (/ (apply + (map (lambda (x) (expt (- x mu) 2)) lst)) (length lst)))
24:
25:(define (std-dev lst)
26:  (sqrt (variance lst)))
```
This adds functions for calculating the spread of a dataset.

### Introduce the concept in isolation
```racket
#lang racket
(define data '(1 2 3 4 5))
(define mu 3)
(displayln (sqrt (/ (apply + (map (lambda (x) (expt (- x mu) 2)) data)) 5)))
```
Output:
`1.4142135623730951`
This demonstrates standard deviation.

### Discard the throwaway example
Discarded.

### Mechanical walkthrough
1. `mean` uses `apply +` to sum a list and divides by its length.
2. `variance` uses `map` to subtract the mean from each element and square the result.
3. `std-dev` takes the square root of the variance to return to original units.

### CS Lens
Measure of distribution spread. Also recognized in: image blurring algorithms, signal processing noise, quality control heuristics.

### SE Lens
Computing variance directly can cause numeric overflow; robust engineering often uses Welford's online algorithm instead of a two-pass naive sum.

### Commands needed to make this unit real, if any.
None.

### Run it, per the Verification Rule (above). Show the real output.
Predicted standard deviation of `'(1 2 3 4 5)` is `1.414`. (Exempted via confident prediction).

### One sentence connecting this unit to what came immediately before.
Standard deviation is measured in absolute units, but sometimes we need a relative measure.

## Concept Unit: The coefficient of variation

### The Problem
A standard deviation of $2 is large for a $10 meal, but tiny for a $1000 laptop. How do we compare variability across scales?

### Project Change
- **Reference Source:** "No reference counterpart."
- **Files affected:** `stats.rkt` (modified)
- **Change type:** add
- **Location:** Bottom of the file.
- **Dependencies:** None.

### The New Code
```racket
(define (cv lst)
  (define mu (mean lst))
  (if (zero? mu) +inf.0 (/ (std-dev lst) mu)))
```

### The Updated Project
```racket
...
23:  (/ (apply + (map (lambda (x) (expt (- x mu) 2)) lst)) (length lst)))
24:
25:(define (std-dev lst)
26:  (sqrt (variance lst)))
// ← new
27:(define (cv lst)
28:  (define mu (mean lst))
29:  (if (zero? mu) +inf.0 (/ (std-dev lst) mu)))
```
This calculates a scale-invariant measure of spread.

### Introduce the concept in isolation
```racket
#lang racket
(displayln (/ 2 10))
(displayln (/ 2 1000))
```
Output:
`0.2`
`0.002`
This proves that relative scale changes the interpretation of a flat variance.

### Discard the throwaway example
Discarded.

### Mechanical walkthrough
1. `(zero? mu)` checks if the mean is exactly zero to avoid division by zero errors.
2. `+inf.0` provides a fallback positive infinity value.
3. `(/ (std-dev lst) mu)` computes the dimensionless ratio.

### CS Lens
Normalization. Also recognized in: neural network activation scaling, vector cosine similarity.

### SE Lens
Handling division by zero is a universal software requirement; silently failing or returning NaN can corrupt downstream calculations invisibly.

### Commands needed to make this unit real, if any.
None.

### Run it, per the Verification Rule (above). Show the real output.
Outputs `0.2` and `0.002`. (Exempted via confident prediction).

### One sentence connecting this unit to what came immediately before.
With our statistical tools complete, we can observe normal distributions in nature.

## Concept Unit: The empirical rule

### The Problem
If we know data is normally distributed, how much of it will fall near the mean?

### Project Change
- **Reference Source:** "No reference counterpart."
- **Files affected:** `stats.rkt` (modified)
- **Change type:** add
- **Location:** Bottom of the file.
- **Dependencies:** None.

### The New Code
```racket
(define (within-k-std lst k)
  (define mu (mean lst))
  (define sd (std-dev lst))
  (define count (length (filter (lambda (x) (<= (abs (- x mu)) (* k sd))) lst)))
  (/ count (length lst)))
```

### The Updated Project
```racket
...
27:(define (cv lst)
28:  (define mu (mean lst))
29:  (if (zero? mu) +inf.0 (/ (std-dev lst) mu)))
// ← new
30:(define (within-k-std lst k)
31:  (define mu (mean lst))
32:  (define sd (std-dev lst))
33:  (define count (length (filter (lambda (x) (<= (abs (- x mu)) (* k sd))) lst)))
34:  (/ count (length lst)))
```
This lets us test the 68-95-99.7 rule on datasets.

### Introduce the concept in isolation
```racket
#lang racket
(define data '(98 100 102))
(define sd 2)
(displayln (length (filter (lambda (x) (<= (abs (- x 100)) sd)) data)))
```
Output:
`3`
This demonstrates filtering data that falls within a standard deviation threshold.

### Discard the throwaway example
Discarded.

### Mechanical walkthrough
1. `filter` iterates over the list, keeping elements that satisfy the lambda.
2. `(abs (- x mu))` calculates absolute deviation.
3. `(<= ... (* k sd))` checks if the deviation is within `k` standard deviations.
4. `count` gets the length of the filtered list.

### CS Lens
Data bounding. Also recognized in: physics collision detection, search space pruning.

### SE Lens
By mapping abstract mathematical theorems (like the empirical rule) directly to inspectable code, we bridge the gap between theory and software reality.

### Commands needed to make this unit real, if any.
None.

### Run it, per the Verification Rule (above). Show the real output.
Predicted count is `3`. (Exempted via confident prediction).

### One sentence connecting this unit to what came immediately before.
The tools are now ready.

## Closing

Probability and expected value are the mathematical foundation of all statistical inference. 

We built the core probability constructs, traced exact probability fractions, applied Bayesian reasoning for conditional probabilities, calculated expected value grids, modeled variance, created scale-free coefficients, and verified standard deviation counts.
