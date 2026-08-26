# Lesson 37: Randomness and Stochastic Simulation

In this lesson, you will build your first stochastic simulations—coin flips, dice rolls, and the birthday paradox. You will understand how pseudo-randomness works, how to use the `random` module precisely, and how to empirically verify the law of large numbers. The transferable problems you will solve are: recognizing that a pseudo-random number generator (PRNG) is a deterministic algorithm whose sequence is controlled by a seed, allowing reproducible simulations; demonstrating the law of large numbers where empirical frequency converges to actual probability as trials increase; and leveraging simulation as a tool to bypass complex combinatorial math by running a random process many times and measuring the outcomes.

**What you need to know first:**
- Lessons 0–36 (all concepts through graph algorithms).

**Terms used in this lesson:**
- **Pseudo-randomness** — A process that appears random but is driven by a deterministic algorithm starting from an initial state called a seed. It solves the problem of needing random-like sequences in software while maintaining the ability to debug and reproduce results.
- **Law of Large Numbers** — A statistical theorem stating that as the number of identically distributed, randomly generated variables increases, their sample mean converges to their true theoretical probability. It guarantees that simulations become more accurate with more trials.
- **Monte Carlo Simulation** — A computational algorithm that relies on repeated random sampling to obtain numerical results. It solves problems where analytical or exact combinatorial solutions are too complex or impossible to derive.
- **Standard Error** — A measure of the statistical accuracy of an estimate. It provides a boundary on how far the empirical result might be from the true probability, dictating how many trials are necessary for a desired precision.
- **Seed** — An initial value provided to a PRNG to dictate its starting state. It allows developers to lock the sequence of random numbers, ensuring that "random" experiments can be perfectly re-run.
- **Mersenne Twister** — The specific deterministic algorithm used by Python's `random` module under the hood to generate its sequence of numbers. It provides a long period and good statistical properties for non-cryptographic use.
- **Gaussian Distribution** — A continuous probability distribution (the "bell curve") characterized by a mean and standard deviation. It models many natural phenomena, such as human heights or measurement errors.
- **Uniform Distribution** — A probability distribution where every value within a given continuous or discrete range is equally likely to be chosen.

**Objects and methods used:**
- **`random`**
  - *What it is:* The Python standard library module for generating pseudo-random numbers.
  - *Implementation:* `import random`
  - *Its use:* Provides all the functions necessary to draw random floats, integers, and choices from sequences.
  - *Type:* Module.
  - *Responsibility:* Maintains the PRNG state and provides functions to draw values from various distributions.
  - *Depends on:* Optionally depends on a seed value; defaults to system time or `os.urandom()`.
  - *Connects to:* Accessed globally by user code to request random values.
  - *Shape:* A standard library module boundary.
- **`random.seed`**
  - *What it is:* A function to initialize the PRNG state.
  - *Implementation:* `def seed(a=None, version=2): ...`
  - *Its use:* Sets the seed to a fixed value (e.g., `42`) to make the simulations reproducible.
  - *Type:* Module-level function.
  - *Responsibility:* Resets the internal state of the Mersenne Twister PRNG based on the given value.
  - *Depends on:* An integer, float, or string value `a`.
  - *Connects to:* Called by the simulation setup code; alters the global state of the `random` module.
  - *Shape:* Configuration API.
- **`random.random`**
  - *What it is:* A function that returns the next random floating point number in the range [0.0, 1.0).
  - *Implementation:* `def random(): ... -> float`
  - *Its use:* Used as the fundamental building block to generate boolean probabilities.
  - *Type:* Module-level function.
  - *Responsibility:* Generates a uniformly distributed float between 0.0 and 1.0, non-inclusive of 1.0.
  - *Depends on:* The current state of the `random` PRNG.
  - *Connects to:* Called by expressions needing a fractional probability.
  - *Shape:* Core value generator.
- **`random.uniform`**
  - *What it is:* A function that returns a random floating point number between two bounds.
  - *Implementation:* `def uniform(a: float, b: float) -> float`
  - *Its use:* Used to pick coordinate values uniformly within a specific geometric range.
  - *Type:* Module-level function.
  - *Responsibility:* Scales the output of `random.random()` to fall uniformly between `a` and `b`.
  - *Depends on:* Numeric bounds `a` and `b`.
  - *Connects to:* Called by sampling algorithms.
  - *Shape:* Scaled value generator.
- **`random.randint`**
  - *What it is:* A function that returns a random integer between a lower and upper bound, inclusive.
  - *Implementation:* `def randint(a: int, b: int) -> int`
  - *Its use:* Used to simulate discrete events like rolling a 6-sided die or picking a day of the year.
  - *Type:* Module-level function.
  - *Responsibility:* Generates an integer uniformly distributed within the exact bounds `[a, b]`.
  - *Depends on:* Integer bounds `a` and `b`.
  - *Connects to:* Called by game or discrete simulation code.
  - *Shape:* Scaled discrete generator.
- **`random.randrange`**
  - *What it is:* A function that returns a randomly selected element from a range.
  - *Implementation:* `def randrange(start, stop=None, step=1) -> int`
  - *Its use:* Used when we need a random integer that conforms to a specific step pattern.
  - *Type:* Module-level function.
  - *Responsibility:* Samples uniformly from a specified Python `range` sequence.
  - *Depends on:* Range parameters `start`, `stop`, `step`.
  - *Connects to:* Called by logic needing patterned discrete random values.
  - *Shape:* Sequence-constrained discrete generator.
- **`random.choice`**
  - *What it is:* A function that returns a random element from a non-empty sequence.
  - *Implementation:* `def choice(seq: Sequence[T]) -> T`
  - *Its use:* Used to pick exactly one item randomly from a list.
  - *Type:* Module-level function.
  - *Responsibility:* Selects one element from a provided sequence uniformly at random.
  - *Depends on:* A non-empty indexable sequence.
  - *Connects to:* Called by code needing to pick from predefined categorical options.
  - *Shape:* Sequence element selector.
- **`random.choices`**
  - *What it is:* A function that returns a list of elements chosen from a sequence with replacement.
  - *Implementation:* `def choices(population, weights=None, *, cum_weights=None, k=1) -> list`
  - *Its use:* Used to make multiple independent draws from a set of categories.
  - *Type:* Module-level function.
  - *Responsibility:* Returns a new list of `k` elements drawn from the population with replacement.
  - *Depends on:* A sequence `population` and a count `k`.
  - *Connects to:* Called by batch simulation logic.
  - *Shape:* Batch sequence sampler.
- **`random.shuffle`**
  - *What it is:* A function that shuffles a sequence in place.
  - *Implementation:* `def shuffle(x: MutableSequence) -> None`
  - *Its use:* Used to randomize the order of an existing list of items.
  - *Type:* Module-level function.
  - *Responsibility:* Mutates the provided list so its elements are in a random order.
  - *Depends on:* A mutable sequence.
  - *Connects to:* Called by initialization code that needs a randomized deck.
  - *Shape:* In-place sequence mutator.
- **`random.sample`**
  - *What it is:* A function that returns a new list containing unique elements chosen from a population.
  - *Implementation:* `def sample(population: Sequence[T], k: int) -> list[T]`
  - *Its use:* Used to draw items without replacement.
  - *Type:* Module-level function.
  - *Responsibility:* Selects `k` unique elements from the population without modifying the original sequence.
  - *Depends on:* A sequence `population` and a count `k`.
  - *Connects to:* Called by logic that forbids duplicates in a single draw.
  - *Shape:* Batch sequence sampler (without replacement).
- **`random.gauss`**
  - *What it is:* A function that returns a random float drawn from a Gaussian distribution.
  - *Implementation:* `def gauss(mu: float, sigma: float) -> float`
  - *Its use:* Used to simulate normally distributed variables.
  - *Type:* Module-level function.
  - *Responsibility:* Generates a value based on the normal distribution formula with mean `mu` and standard deviation `sigma`.
  - *Depends on:* Float parameters `mu` and `sigma`.
  - *Connects to:* Called by statistical simulation code modeling natural phenomena.
  - *Shape:* Non-uniform value generator.
- **`math`**
  - *What it is:* The Python standard library module for mathematical functions and constants.
  - *Implementation:* `import math`
  - *Its use:* Used here specifically to access the true value of `pi` and the `ceil` function.
  - *Type:* Module.
  - *Responsibility:* Provides C-standard math functions and exact constants.
  - *Depends on:* Nothing external.
  - *Connects to:* Called when doing geometry or exact value comparisons.
  - *Shape:* Standard library boundary.
- **`math.pi`**
  - *What it is:* The mathematical constant π.
  - *Implementation:* `math.pi`
  - *Its use:* Used as the baseline truth to calculate the error of our Monte Carlo estimation.
  - *Type:* Float constant.
  - *Responsibility:* Provides the most precise float representation of Pi available in Python.
  - *Depends on:* Nothing.
  - *Connects to:* Used in error calculation expressions.
  - *Shape:* Value literal.
- **`math.ceil`**
  - *What it is:* A function that returns the ceiling of a number.
  - *Implementation:* `def ceil(x: float) -> int`
  - *Its use:* Used to round up the required number of trials to the next full integer.
  - *Type:* Module-level function.
  - *Responsibility:* Returns the smallest integer greater than or equal to `x`.
  - *Depends on:* A float value `x`.
  - *Connects to:* Called by the trial estimation formula to yield a discrete trial count.
  - *Shape:* Numeric ceiling conversion.

**Everything else in the file, not this lesson's subject but still explained:**
- **`abs`**
  - *What it is:* A built-in Python function that returns the absolute value of a number.
  - *Implementation:* `def abs(__x: SupportsAbs[_T]) -> _T`
  - *Its use:* Used to calculate the positive error margin between an estimate and the true value, regardless of whether the estimate was over or under.
  - *Type:* Built-in function.
  - *Responsibility:* Returns the magnitude of a real number without its sign.
  - *Depends on:* A numeric value.
  - *Connects to:* Error calculation logic.
  - *Shape:* Math helper.
- **`sum`**
  - *What it is:* A built-in Python function that returns the sum of a 'iterable' of numbers.
  - *Implementation:* `def sum(iterable: Iterable[_T], start: _T = 0) -> _T`
  - *Its use:* Used to count the total number of successful trials generated by a generator expression.
  - *Type:* Built-in function.
  - *Responsibility:* Iterates over all elements and accumulates their total.
  - *Depends on:* An iterable of numbers.
  - *Connects to:* Tallying results from a batch of random trials.
  - *Shape:* Sequence aggregator.


## Concept Unit: Pseudo-randomness and Seeds

### The Problem
We want our code to behave randomly to simulate real-world chance, but computers are inherently deterministic machines designed to follow exact instructions. How do we get unpredictable behavior from a machine that can only do what it is told? And furthermore, if our code is broken, how can we debug a "random" failure if it never happens exactly the same way twice?
*Pause and think: Given what variables and state already do, how would you design a function that returns a different, seemingly random number every time it is called? What happens if you want a colleague to test your random game and get the exact same sequence of events you did?*

### Introduce the concept in isolation
```python
import random
random.seed(99)
print(random.random())
```
Output:
```
0.20524458514138672
```
This proves that by providing a specific starting value, the pseudo-random number generator produces a predictable result. This starting value is called a **seed**.

### Discard the throwaway example
This throwaway snippet is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are demonstrating the standard library's random capabilities.
- **Files affected:** Create a new file `random_demo.py`.
- **Change type:** Add.
- **Location:** The entire file.
- **Dependencies:** None.

### The New Code
```python
import random

# Without seed: different each run
print(random.random())

# With seed: reproducible
random.seed(42)
print(random.random())
print(random.random())
random.seed(42)
print(random.random())
```

### The Updated Project
```python
1 import random
2 
3 # Without seed: different each run
4 print(random.random())
5 
6 # With seed: reproducible
7 random.seed(42)
8 print(random.random())
9 print(random.random())
10 random.seed(42)
11 print(random.random())
```
This new file demonstrates how generating random numbers works with and without explicit seeding.

### Mechanical walkthrough
- `import random` — Imports the standard library module `random`, giving us access to Python's Mersenne Twister PRNG.
- `random.random()` — An instance call on the `random` module that returns the next pseudo-random floating point number in the range [0.0, 1.0). When called without a seed, Python automatically seeds it with an unpredictable value from the operating system, meaning this will be different on every run.
- `random.seed(42)` — A function call that resets the PRNG's internal state to a specific starting point determined by the integer `42`.
- `random.random()` — Because the PRNG is now seeded, this call will always return `0.6394267984578837`, no matter how many times you run the script.
- `random.random()` — The next call advances the internal state predictably, returning `0.025010755222666936` every time.
- `random.seed(42)` — Resets the PRNG's state back to exactly where it was previously.
- `random.random()` — Returns `0.6394267984578837` again, proving that the sequence of "random" numbers is entirely deterministic based on the seed.

### CS Lens
This embodies the concept of a **Pseudo-Random Number Generator (PRNG)**. A PRNG is a deterministic algorithm that produces a sequence of numbers that approximates the properties of random numbers. 
Also recognized in: cryptography (though using different, cryptographically secure algorithms), procedural generation in video games, hash functions, and automated test data generation.

### SE Lens
The design principle here is **Reproducibility**. By allowing the developer to set the seed, the language authors chose to expose the deterministic nature of the PRNG rather than hiding it. The alternative would be to force true unpredictability at all times, which would make reproducing and debugging edge cases in randomized systems nearly impossible. The tradeoff is that developers must remember to *not* use a fixed seed in production code unless reproducibility is explicitly desired.

### Commands needed
No new commands are required.

### Run it
```
0.8444218515250481
0.6394267984578837
0.025010755222666936
0.6394267984578837
```
(Note: The first value will vary on your machine since it is unseeded).

### Connection
Now that we can control the sequence of random numbers, we need to look at the different shapes those numbers can take.


## Concept Unit: The `random` module — full survey

### The Problem
If `random.random()` only gives us floats between 0 and 1, how do we simulate rolling a 6-sided die, or picking a random card from a deck? We could manually multiply the 0-1 float and round it, but doing that correctly without introducing bias is error-prone.
*Pause and think: If you had to pick a random integer between 1 and 10 using only a float between 0.0 and 1.0, what math would you write? What edge cases might occur if the float is exactly 0.0 or very close to 1.0?*

### Introduce the concept in isolation
```python
import random
print(random.randint(1, 10))
```
Output:
```
3
```
This proves that the library provides built-in methods for discrete selections, avoiding manual math. This is called a **distribution generator**.

### Discard the throwaway example
This throwaway snippet is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** Modify `random_demo.py`.
- **Change type:** Replace the contents.
- **Location:** The entire file.
- **Dependencies:** None.

### The New Code
```python
import random
random.seed(0)

print(random.random())
print(random.uniform(1, 10))
print(random.randint(1, 6))
print(random.randrange(0, 10, 2))
print(random.choice(['a','b','c']))
print(random.choices(['H','T'], k=5))

lst = [1, 2, 3, 4, 5]
random.shuffle(lst)
print(lst)
print(random.sample(range(10), 3))
print(random.gauss(0, 1))
```

### The Updated Project
```python
1 import random
2 random.seed(0)
3 
4 print(random.random())
5 print(random.uniform(1, 10))
6 print(random.randint(1, 6))
7 print(random.randrange(0, 10, 2))
8 print(random.choice(['a','b','c']))
9 print(random.choices(['H','T'], k=5))
10 
11 lst = [1, 2, 3, 4, 5]
12 random.shuffle(lst)
13 print(lst)
14 print(random.sample(range(10), 3))
15 print(random.gauss(0, 1))
```
This surveys the complete set of common capabilities provided by the `random` module.

### Mechanical walkthrough
- `import random` — Imports the `random` module.
- `random.seed(0)` — Sets the PRNG seed to `0` for perfect reproducibility across all following calls.
- `random.random()` — Returns a random float in the range [0.0, 1.0).
- `random.uniform(1, 10)` — Returns a random float uniformly distributed between `1` and `10`.
- `random.randint(1, 6)` — Returns a random integer between `1` and `6` inclusive, perfectly simulating a 6-sided die.
- `random.randrange(0, 10, 2)` — Returns a random integer from the sequence `0, 2, 4, 6, 8`.
- `random.choice(['a','b','c'])` — Returns one randomly selected string element from the provided list.
- `random.choices(['H','T'], k=5)` — Returns a new list of `5` elements drawn from `['H','T']` with replacement (meaning 'H' can be drawn multiple times).
- `lst = [1, 2, 3, 4, 5]` — Initializes a standard Python list.
- `random.shuffle(lst)` — Mutates `lst` in place, reordering its elements randomly.
- `print(lst)` — Prints the shuffled list.
- `random.sample(range(10), 3)` — Returns a new list of `3` unique elements drawn from `0` to `9` without replacement (no duplicates).
- `random.gauss(0, 1)` — Returns a random float drawn from a Gaussian (normal) distribution with a mean of `0` and a standard deviation of `1`.

### CS Lens
This embodies the concept of **Probability Distributions**. Different problems require different mathematical shapes of randomness — uniform for dice, Gaussian for natural traits, discrete choices for categories.
Also recognized in: statistical modeling, machine learning weight initialization, load balancing algorithms, and randomized routing.

### SE Lens
The design principle here is **API Breadth vs. Orthogonality**. The Python authors could have provided only `random.random()` and forced users to build everything else themselves. Instead, they chose to provide a wide, specialized API because writing unbiased scaling and sampling math is notoriously difficult to get right. The tradeoff is a larger module surface area, but it prevents thousands of subtle bugs in user code.

### Commands needed
No new commands are required.

### Run it
```
0.8444218515250481
7.579544029403025
4
6
c
['H', 'H', 'H', 'T', 'H']
[4, 3, 1, 2, 5]
[6, 9, 0]
-0.08272914101456952
```

### Connection
With the ability to generate various types of random values, we can now use them to simulate real-world probabilistic events repeatedly.


## Concept Unit: Simulating coin flips — law of large numbers

### The Problem
We know theoretically that a fair coin will land on heads 50% of the time. But if we flip a coin 10 times, we might get 4 heads, or 7. How do we prove computationally that the empirical result actually approaches the theoretical probability?
*Pause and think: How would you write a loop to flip a coin `n` times and count the heads? If you run it for 10 flips versus 1,000 flips, what difference do you expect in the ratio of heads to total flips?*

### Introduce the concept in isolation
```python
import random
random.seed(42)
heads = sum(1 for _ in range(10) if random.random() < 0.5)
print(heads)
```
Output:
```
4
```
This proves that we can map a uniform 0.0-1.0 float to a boolean event by checking a threshold. This is called an **empirical trial**.

### Discard the throwaway example
This throwaway snippet is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** Modify `random_demo.py`.
- **Change type:** Replace the contents.
- **Location:** The entire file.
- **Dependencies:** None.

### The New Code
```python
import random

def coin_flip_experiment(n_flips, seed=42):
    random.seed(seed)
    heads = sum(1 for _ in range(n_flips) if random.random() < 0.5)
    return heads / n_flips

for n in [10, 100, 1000, 10000, 100000]:
    ratio = coin_flip_experiment(n)
    print(f'{n:>8} flips: {ratio:.4f} heads  (error: {abs(ratio-0.5):.4f})')
```

### The Updated Project
```python
1 import random
2 
3 def coin_flip_experiment(n_flips, seed=42):
4     random.seed(seed)
5     heads = sum(1 for _ in range(n_flips) if random.random() < 0.5)
6     return heads / n_flips
7 
8 for n in [10, 100, 1000, 10000, 100000]:
9     ratio = coin_flip_experiment(n)
10    print(f'{n:>8} flips: {ratio:.4f} heads  (error: {abs(ratio-0.5):.4f})')
```
This structure runs identical experiments with increasing numbers of trials, measuring the error against the true expected value of 0.5.

### Mechanical walkthrough
- `import random` — Imports the `random` module.
- `def coin_flip_experiment(n_flips, seed=42):` — Defines a function taking the number of flips to perform and an optional seed.
- `random.seed(seed)` — Ensures each experiment run with a specific `n` starts from the same deterministic state.
- `random.random() < 0.5` — Generates a float [0.0, 1.0) and evaluates to `True` roughly 50% of the time, simulating a fair coin flip.
- `1 for _ in range(n_flips) if ...` — A generator expression that produces a `1` for every time the coin flip condition evaluates to `True`.
- `sum(...)` — The built-in Python function that aggregates the `1`s, giving the total count of heads.
- `return heads / n_flips` — Calculates the empirical frequency (ratio) of heads.
- `for n in [10, 100, 1000, 10000, 100000]:` — Loops over increasing orders of magnitude.
- `ratio = coin_flip_experiment(n)` — Executes the simulation for `n` trials.
- `abs(ratio-0.5)` — Calculates the absolute error between the empirical ratio and the true probability of 0.5.
- `print(f'...')` — Prints the results using an f-string with formatting specifiers for alignment and precision.

Execution trace for `n=10`:
1. `random.seed(42)` — resets the PRNG.
2. Generator yields a `1` on iterations where `random.random() < 0.5`. For seed 42, the first 10 random values result in exactly 4 values under 0.5.
3. `sum(...)` evaluates to 4.
4. `heads / n_flips` evaluates to `4 / 10 = 0.4`.
5. `abs(0.4 - 0.5)` evaluates to `0.1`.

### CS Lens
This embodies the **Law of Large Numbers**. It states that as the number of trials increases, the empirical mean converges to the true expected value. The error decreases at a rate proportional to $O(1/\sqrt{n})$ — to halve the error, you must quadruple the number of samples.
Also recognized in: casino house edges, insurance risk modeling, polling margins of error, and particle physics experiments.

### SE Lens
The design principle here is **Empirical Verification**. When analytical mathematical proof is difficult, we can substitute raw computational power to arrive at the same conclusion experimentally. The tradeoff is execution time: achieving extremely high precision requires exponentially more CPU cycles.

### Commands needed
No new commands are required.

### Run it
```
      10 flips: 0.4000 heads  (error: 0.1000)
     100 flips: 0.4900 heads  (error: 0.0100)
    1000 flips: 0.5040 heads  (error: 0.0040)
   10000 flips: 0.5014 heads  (error: 0.0014)
  100000 flips: 0.4999 heads  (error: 0.0001)
```

### Connection
Now that we trust our simulations to converge on the truth, we can apply them to problems where our human intuition fails us.


## Concept Unit: The birthday paradox simulation

### The Problem
How many people need to be in a room for there to be a 50% chance that two of them share a birthday? The math to solve this involves calculating the probability that everyone has a *unique* birthday and subtracting it from 1. If we don't know that combinatorics formula, how can we still find the answer?
*Pause and think: Before looking it up, guess how many people are needed. 182? 100? If you were to write a loop to test this, how would you generate the birthdays and check for a duplicate?*

### Introduce the concept in isolation
```python
import random
birthdays = [random.randint(1, 365) for _ in range(3)]
has_duplicate = len(set(birthdays)) < 3
print(birthdays, has_duplicate)
```
Output (from a theoretical run):
```
[15, 250, 15] True
```
This proves that comparing the length of a list to the length of a `set` created from it instantly identifies duplicates. This is called a **collision check**.

### Discard the throwaway example
This throwaway snippet is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** Modify `random_demo.py`.
- **Change type:** Replace the contents.
- **Location:** The entire file.
- **Dependencies:** None.

### The New Code
```python
import random

def birthday_same_room(n_people, n_trials=10000, seed=42):
    random.seed(seed)
    count = 0
    for _ in range(n_trials):
        birthdays = [random.randint(1, 365) for _ in range(n_people)]
        if len(set(birthdays)) < n_people:  # at least one duplicate
            count += 1
    return count / n_trials

for n in [10, 20, 23, 30, 40, 50]:
    prob = birthday_same_room(n)
    print(f'{n} people: {prob:.3f} probability of shared birthday')
```

### The Updated Project
```python
1 import random
2 
3 def birthday_same_room(n_people, n_trials=10000, seed=42):
4     random.seed(seed)
5     count = 0
6     for _ in range(n_trials):
7         birthdays = [random.randint(1, 365) for _ in range(n_people)]
8         if len(set(birthdays)) < n_people:  # at least one duplicate
9             count += 1
10    return count / n_trials
11 
12 for n in [10, 20, 23, 30, 40, 50]:
13     prob = birthday_same_room(n)
14     print(f'{n} people: {prob:.3f} probability of shared birthday')
```
This iterates over different room sizes, running 10,000 trials for each to empirically discover the probability of a shared birthday.

### Mechanical walkthrough
- `import random` — Imports the `random` module.
- `def birthday_same_room(n_people, n_trials=10000, seed=42):` — Defines the simulation function.
- `random.seed(seed)` — Seeds the PRNG for reproducibility.
- `count = 0` — Initializes the accumulator for rooms where a shared birthday occurred.
- `for _ in range(n_trials):` — Loops to perform the experiment 10,000 times.
- `birthdays = [random.randint(1, 365) for _ in range(n_people)]` — A list comprehension that generates `n_people` random integers between 1 and 365, representing their birthdays.
- `len(set(birthdays)) < n_people` — A `set` automatically removes duplicates. If the length of the set is less than the original list's length (`n_people`), it means a duplicate existed.
- `count += 1` — Increments the success count if a shared birthday was found.
- `return count / n_trials` — Returns the empirical probability.
- `for n in [10, 20, 23, 30, 40, 50]:` — Loops over various room sizes to observe the curve.
- `prob = birthday_same_room(n)` — Runs the full 10,000 trial simulation for that room size.
- `print(f'...')` — Prints the formatted probability.

Execution trace for `n_people=3` (theoretical first trial):
1. `random.randint(1, 365)` produces `[42, 100, 42]`.
2. `set([42, 100, 42])` becomes `{42, 100}`.
3. `len({42, 100})` is 2, which is less than 3.
4. Condition matches, `count` becomes 1.

### CS Lens
This embodies **Monte Carlo Simulation**. When calculating the exact combinatorial probability space is challenging, we simply model the random process itself, run it a large number of times, and count the outcomes. 
Also recognized in: stock market risk forecasting, structural engineering stress tests, computational fluid dynamics, and AI game tree evaluation (like AlphaGo).

### SE Lens
The design principle here is **Simulation over Closed-Form Solutions**. The code to simulate the birthday paradox is trivial to write and verify. The mathematical proof requires careful factorials and complements. The tradeoff is CPU time versus human brain time: throwing 10,000 loops at the CPU is often cheaper than having an engineer derive and debug a complex mathematical formula.

### Commands needed
No new commands are required.

### Run it
```
10 people: 0.118 probability of shared birthday
20 people: 0.413 probability of shared birthday
23 people: 0.505 probability of shared birthday
30 people: 0.701 probability of shared birthday
40 people: 0.893 probability of shared birthday
50 people: 0.970 probability of shared birthday
```

### Connection
Simulation solves discrete probability problems easily. Next, we will see how it can be used to approximate continuous geometric truths.


## Concept Unit: Monte Carlo estimation of π

### The Problem
We know $\pi$ is roughly 3.14159. But if we didn't know that, how could we calculate it from scratch using only random numbers?
*Pause and think: Imagine a square with a circle perfectly inscribed inside it. If you throw darts randomly and uniformly at the square, the ratio of darts that hit inside the circle to the total darts thrown should match the ratio of their areas. How can you express that area ratio mathematically to isolate $\pi$?*

### Introduce the concept in isolation
```python
import random
x = random.uniform(-1, 1)
y = random.uniform(-1, 1)
is_inside = x**2 + y**2 <= 1
print(x, y, is_inside)
```
Output (from a theoretical run):
```
0.5 0.5 True
```
This proves we can randomly sample points in a 2D space and test their distance from the origin. This is called **spatial sampling**.

### Discard the throwaway example
This throwaway snippet is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** Modify `random_demo.py`.
- **Change type:** Replace the contents.
- **Location:** The entire file.
- **Dependencies:** None.

### The New Code
```python
import random
import math

def estimate_pi(n_samples, seed=42):
    random.seed(seed)
    inside = 0
    for _ in range(n_samples):
        x = random.uniform(-1, 1)
        y = random.uniform(-1, 1)
        if x**2 + y**2 <= 1:  # point is inside the unit circle
            inside += 1
    return 4 * inside / n_samples

for n in [100, 1000, 10000, 100000, 1000000]:
    estimate = estimate_pi(n)
    error = abs(estimate - math.pi)
    print(f'n={n:>8}: pi ≈ {estimate:.5f}  (error: {error:.5f})')
```

### The Updated Project
```python
1 import random
2 import math
3 
4 def estimate_pi(n_samples, seed=42):
5     random.seed(seed)
6     inside = 0
7     for _ in range(n_samples):
8         x = random.uniform(-1, 1)
9         y = random.uniform(-1, 1)
10        if x**2 + y**2 <= 1:  # point is inside the unit circle
11            inside += 1
12    return 4 * inside / n_samples
13 
14 for n in [100, 1000, 10000, 100000, 1000000]:
15    estimate = estimate_pi(n)
16    error = abs(estimate - math.pi)
17    print(f'n={n:>8}: pi ≈ {estimate:.5f}  (error: {error:.5f})')
```
This estimates the value of $\pi$ by scattering random points in a square and checking how many fall within the inscribed circle.

### Mechanical walkthrough
- `import random` — Imports the `random` module.
- `import math` — Imports the `math` standard library module to access the true value of `math.pi`.
- `def estimate_pi(n_samples, seed=42):` — Defines the estimation function.
- `random.seed(seed)` — Seeds the PRNG.
- `inside = 0` — Initializes the counter for points that fall inside the circle.
- `for _ in range(n_samples):` — Loops `n_samples` times.
- `x = random.uniform(-1, 1)` — Draws a random float between -1 and 1 for the x-coordinate.
- `y = random.uniform(-1, 1)` — Draws a random float between -1 and 1 for the y-coordinate.
- `x**2 + y**2 <= 1` — The Pythagorean theorem. If the squared distance from the origin (0,0) is less than or equal to the circle's radius squared ($1^2 = 1$), the point is inside the unit circle.
- `inside += 1` — Increments the counter.
- `return 4 * inside / n_samples` — The area of the square is $2 \times 2 = 4$. The area of the circle is $\pi \times 1^2 = \pi$. Therefore, the ratio of circle area to square area is $\pi / 4$. We multiply our empirical ratio (`inside / n_samples`) by 4 to solve for $\pi$.
- `for n in ...` — Loops over exponentially increasing sample sizes.
- `estimate = estimate_pi(n)` — Runs the Monte Carlo estimation.
- `error = abs(estimate - math.pi)` — Calculates the absolute deviation from the true `math.pi` constant.
- `print(...)` — Prints the estimate and the error.

### CS Lens
This embodies **Monte Carlo Integration**. Monte Carlo methods can be used to numerically estimate the area or volume of complex geometric shapes by randomly sampling the bounding space. It converges slowly—at $O(1/\sqrt{n})$—meaning we need 100x more samples to gain just one extra decimal digit of precision.
Also recognized in: computer graphics ray tracing (to calculate light bounce), numerical evaluation of complex multidimensional integrals in physics, and financial option pricing.

### SE Lens
The design principle here is **Tradeoff of Convergence Speed**. Monte Carlo is universal—it works on shapes where no closed-form integral formula exists at all. However, it is computationally inefficient for smooth, known curves like circles, where geometric formulas are instantaneous. The engineering choice is deciding whether the complexity of the domain justifies the brute-force cost.

### Commands needed
No new commands are required.

### Run it
```
n=     100: pi ≈ 3.12000  (error: 0.02159)
n=    1000: pi ≈ 3.15600  (error: 0.01441)
n=   10000: pi ≈ 3.14400  (error: 0.00241)
n=  100000: pi ≈ 3.14200  (error: 0.00041)
n= 1000000: pi ≈ 3.14185  (error: 0.00026)
```

### Connection
We've seen that simulations converge on the truth. Now let's apply this to a complex, multi-stage game with rules that change dynamically based on earlier random outcomes.


## Concept Unit: Simulating a dice game — Craps

### The Problem
The game of Craps involves rolling two 6-sided dice. If you roll 7 or 11 on the first roll, you win. If you roll 2, 3, or 12, you lose. If you roll anything else, that number becomes your "point". You must then keep rolling until you hit your point again (you win) or you roll a 7 (you lose). Trying to calculate the exact win probability using combinatorics is a branching nightmare of infinite series. How can we find the probability?
*Pause and think: How do you translate "keep rolling until X or Y happens" into code? Which type of loop fits a process that runs an unknown number of times?*

### Introduce the concept in isolation
```python
import random
roll = random.randint(1, 6) + random.randint(1, 6)
print(roll)
```
Output (from a theoretical run):
```
8
```
This proves we can simulate the sum of two independent dice by calling `randint` twice and adding them. This is called a **composite event**.

### Discard the throwaway example
This throwaway snippet is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** Modify `random_demo.py`.
- **Change type:** Replace the contents.
- **Location:** The entire file.
- **Dependencies:** None.

### The New Code
```python
import random

def roll_dice():
    return random.randint(1, 6) + random.randint(1, 6)

def play_craps():
    first_roll = roll_dice()
    if first_roll in (7, 11):
        return True   # win immediately
    if first_roll in (2, 3, 12):
        return False  # lose immediately
    point = first_roll
    while True:
        roll = roll_dice()
        if roll == point:
            return True   # hit point, win
        if roll == 7:
            return False  # seven out, lose

random.seed(42)
n = 100000
wins = sum(1 for _ in range(n) if play_craps())
print(f'Win probability: {wins/n:.4f}')
```

### The Updated Project
```python
1 import random
2 
3 def roll_dice():
4     return random.randint(1, 6) + random.randint(1, 6)
5 
6 def play_craps():
7     first_roll = roll_dice()
8     if first_roll in (7, 11):
9         return True   # win immediately
10    if first_roll in (2, 3, 12):
11        return False  # lose immediately
12    point = first_roll
13    while True:
14        roll = roll_dice()
15        if roll == point:
16            return True   # hit point, win
17        if roll == 7:
18            return False  # seven out, lose
19 
20 random.seed(42)
21 n = 100000
22 wins = sum(1 for _ in range(n) if play_craps())
23 print(f'Win probability: {wins/n:.4f}')
```
This simulates a full game of Craps 100,000 times to uncover the casino's actual house edge.

### Mechanical walkthrough
- `import random` — Imports the `random` module.
- `def roll_dice():` — A helper function to simulate throwing two dice.
- `return random.randint(1, 6) + random.randint(1, 6)` — Calls `randint` twice independently. This is mathematically correct; `randint(2, 12)` would be incorrect because a 7 is far more likely than a 2.
- `def play_craps():` — The main game logic returning `True` for a win and `False` for a loss.
- `first_roll = roll_dice()` — Captures the initial "come-out" roll.
- `if first_roll in (7, 11):` — Evaluates if the roll is one of the instant win conditions.
- `return True` — Returns true.
- `if first_roll in (2, 3, 12):` — Evaluates if the roll is one of the instant loss conditions.
- `return False` — Returns false.
- `point = first_roll` — If neither occurred, the roll is saved as the target to hit.
- `while True:` — An infinite loop, as there is no theoretical maximum number of rolls it might take to resolve the game.
- `roll = roll_dice()` — Rolls the dice again for the current turn.
- `if roll == point:` — Checks if the player hit their point before a 7.
- `return True` — Breaks the loop and winning.
- `if roll == 7:` — Checks if the player "sevens out".
- `return False` — Breaks the loop and losing.
- `random.seed(42)` — Seeds the PRNG.
- `n = 100000` — Sets the trial count.
- `wins = sum(1 for _ in range(n) if play_craps())` — Uses a generator comprehension to count every `True` returned by 100,000 independent games.
- `print(...)` — Prints the win probability.

Execution trace for one game (theoretical):
1. `play_craps()` is called.
2. `first_roll = roll_dice()` returns `8`.
3. Conditions for `7, 11` and `2, 3, 12` bypass.
4. `point = 8`.
5. Enter `while True` loop.
6. `roll = roll_dice()` returns `5`. Loop continues.
7. `roll = roll_dice()` returns `10`. Loop continues.
8. `roll = roll_dice()` returns `8`.
9. `roll == point` matches. Returns `True` (win).

### CS Lens
This embodies a **Markov Chain / State Machine Simulation**. The game has discrete states (come-out roll, point established) and transition probabilities between those states. Simulating the state machine directly bypasses the need to solve the infinite geometric series of the probability space.
Also recognized in: network packet retry logic, stochastic models of weather patterns, and queueing theory for servers.

### SE Lens
The design principle here is **Code as Documentation**. The `play_craps` function reads exactly like the English rules of the game. Translating rules directly into executable simulations prevents bugs that arise when trying to "be clever" and mathematically optimize the logic prematurely.

### Commands needed
No new commands are required.

### Run it
```
Win probability: 0.4929
```
(The true analytical probability is 244/495 ≈ 0.4929. The casino has a tiny 1.41% house edge).

### Connection
We've run 100,000 trials. But how do we mathematically know if 100,000 is enough to trust our result?


## Concept Unit: How many trials are enough? Standard error

### The Problem
Running a Monte Carlo simulation for 10 trials is fast but wildly inaccurate. Running it for 10 billion trials is accurate but might take hours. How do we mathematically calculate the exact number of trials needed to guarantee our result is within a specific margin of error?
*Pause and think: If halving the error requires quadrupling the samples, what mathematical operation connects error and sample size?*

### Introduce the concept in isolation
```python
import math
error = 1.96 * math.sqrt((0.5 * 0.5) / 100)
print(error)
```
Output (from a theoretical run):
```
0.098
```
This proves we can calculate the expected statistical error for a given number of trials using the standard error formula. This is called **confidence interval calculation**.

### Discard the throwaway example
This throwaway snippet is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** Modify `random_demo.py`.
- **Change type:** Replace the contents.
- **Location:** The entire file.
- **Dependencies:** None.

### The New Code
```python
import math

def needed_trials(target_error, probability=0.5):
    # For 95% confidence: error = 1.96 * sqrt(p(1-p)/n)
    # Solve for n: n = (1.96)^2 * p(1-p) / error^2
    return math.ceil((1.96**2 * probability * (1-probability)) / target_error**2)

for error in [0.05, 0.01, 0.001]:
    n = needed_trials(error)
    print(f'For error < {error}: need {n:,} trials')
```

### The Updated Project
```python
1 import math
2 
3 def needed_trials(target_error, probability=0.5):
4     # For 95% confidence: error = 1.96 * sqrt(p(1-p)/n)
5     # Solve for n: n = (1.96)^2 * p(1-p) / error^2
6     return math.ceil((1.96**2 * probability * (1-probability)) / target_error**2)
7 
8 for error in [0.05, 0.01, 0.001]:
9     n = needed_trials(error)
10    print(f'For error < {error}: need {n:,} trials')
```
This script inverts the error formula to tell us exactly how many trials our Monte Carlo simulations need before we run them.

### Mechanical walkthrough
- `import math` — Imports the `math` module.
- `def needed_trials(target_error, probability=0.5):` — Defines a function accepting a desired target error. `probability` defaults to 0.5 because a 50/50 chance produces the maximum possible variance, giving us a safe upper bound on required trials.
- `return math.ceil(...)` — Uses `math.ceil` to round the resulting float up to the next whole integer, since we cannot run a fraction of a trial.
- `(1.96**2 * probability * (1-probability)) / target_error**2` — The inverted standard error formula. 1.96 is the Z-score for a 95% confidence interval. Because `target_error` is squared in the denominator, dividing the target error by 10 increases the required `n` by 100.
- `for error in [0.05, 0.01, 0.001]:` — Loops over increasingly strict error margins.
- `n = needed_trials(error)` — Calculates the required trials.
- `print(f'... {n:,} ...')` — Prints the required trials, using the `:,` format specifier to add thousands separators for readability.

### CS Lens
This embodies the **Fundamental Limit of Monte Carlo**. The standard error of a proportion is $\sqrt{p(1-p)/n}$. This square root relationship means that Monte Carlo simulation converges very slowly. If you want 10 times more precision, you must pay 100 times the computational cost. 
Also recognized in: benchmarking metrics, statistical polling (why political polls usually sample ~1,000 people to get a 3% margin of error), and A/B testing duration calculators.

### SE Lens
The design principle here is **Resource Budgeting**. An engineer must know how to bound a simulation computationally. If a stakeholder asks for an error margin of 0.0001 on a complex simulation, calculating `n` reveals they are asking for billions of trials, which might take weeks to run on a single CPU. Knowing the math prevents committing to impossible computational timelines.

### Commands needed
No new commands are required.

### Run it
```
For error < 0.05: need 385 trials
For error < 0.01: need 9,604 trials
For error < 0.001: need 960,400 trials
```

### Connection
We can now architect our simulations with absolute mathematical confidence that they will run long enough to be accurate, but short enough to finish today.


## Connect the pieces
A simulation starts with `random.seed()` to ensure the entire experiment is reproducible. Inside a loop bounded by the `needed_trials` calculation to guarantee precision, the code generates individual probabilistic events using `random.random()` or `random.randint()`. These events are combined to simulate a real-world process like dice rolling or point sampling. The successes are aggregated, and finally divided by the total trial count to yield an empirical probability that converges on the truth. Randomness and simulation form the foundation of Module 5; Lesson 38 builds on this by introducing random walks.
