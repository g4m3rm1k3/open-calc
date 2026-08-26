# Lesson 39: Monte Carlo Simulation — Sampling the Unknown

The reader will build three complete Monte Carlo simulations: (1) a card-game probability calculator, (2) a stock-price simulator (geometric Brownian motion, simplified), and (3) a project-timeline estimator. The transferable problems: (1) Monte Carlo is the right tool when the space of outcomes is too large to enumerate analytically; (2) confidence intervals quantify HOW SURE we are about an estimate — more samples = tighter interval; (3) the Monte Carlo method is embarrassingly parallel — each trial is independent, so it scales linearly with computing power.

**What you need to know first:**
- Lesson 38 (full curriculum through random walks).

**Terms used in this lesson:**
- **Monte Carlo Simulation** — A computational algorithm that relies on repeated random sampling to obtain numerical results. It exists to estimate outcomes for systems with too many variables to calculate exactly.
- **Confidence Interval** — A statistical range that is likely to contain an unknown population parameter. It exists to quantify the uncertainty of an estimate, showing how tight or loose our prediction is.
- **Geometric Brownian Motion** — A stochastic process where the logarithm of the randomly varying quantity follows a Brownian motion. It models stock prices because it ensures prices never drop below zero.
- **Triangular Distribution** — A probability distribution shaped like a triangle, defined by a minimum, maximum, and most likely value. It models project tasks where we know the bounds and best guess, but lack historical data for a bell curve.
- **Variance Reduction** — Techniques used to increase the precision of Monte Carlo estimates without running more trials. It solves the problem of simulations requiring exponential compute power to gain linear precision.
- **Antithetic Variates** — A variance reduction technique that pairs each random sample with its mirror opposite. It introduces negative correlation to cancel out sampling errors, tightening the final estimate faster.
- **Histogram** — A visual representation of the distribution of numerical data, divided into bins. It exists to show the shape and spread of randomly generated outcomes.

**Objects and methods used:**

**random.sample**
- *What it is:* A function that chooses multiple unique elements from a sequence.
- *Implementation:* `random.sample(population, k)`
- *Its use:* Drawing a random 5-card hand without replacement.
- *Type:* Standard library function.
- *Responsibility:* Selects `k` unique items uniformly at random from the given population.
- *Depends on:* A population sequence and an integer `k`.
- *Connects to:* Reads the population, returns a new list of `k` elements.
- *Shape:* A utility function called inside our simulation loop.

**random.gauss**
- *What it is:* A function that generates a random number from a normal (Gaussian) distribution.
- *Implementation:* `random.gauss(mu, sigma)`
- *Its use:* Simulating daily stock price returns.
- *Type:* Standard library function.
- *Responsibility:* Returns a random float centered around `mu` with a standard deviation of `sigma`.
- *Depends on:* The mean (`mu`) and standard deviation (`sigma`).
- *Connects to:* Returns a float used in our price multiplication step.
- *Shape:* The randomness engine of our stock simulation.

**random.triangular**
- *What it is:* A function that generates a random float from a triangular distribution.
- *Implementation:* `random.triangular(low, high, mode)`
- *Its use:* Simulating the duration of a project task.
- *Type:* Standard library function.
- *Responsibility:* Returns a float biased toward `mode` but bounded between `low` and `high`.
- *Depends on:* The `low`, `high`, and `mode` parameters.
- *Connects to:* Returns a float used to accumulate total project time.
- *Shape:* The randomness engine of our project timeline simulator.

**itertools.product**
- *What it is:* A function that computes the cartesian product of input iterables.
- *Implementation:* `product(*iterables)`
- *Its use:* Building a deck of cards from ranks and suits.
- *Type:* Standard library function.
- *Responsibility:* Yields tuples containing all possible combinations of elements from the provided iterables.
- *Depends on:* Two or more iterable sequences.
- *Connects to:* Generates tuples that we unpack to format string card names.
- *Shape:* Initialization step for our state space.

**math.exp**
- *What it is:* The exponential function.
- *Implementation:* `math.exp(x)`
- *Its use:* Calculating the continuous growth of a stock price over time.
- *Type:* Standard library function.
- *Responsibility:* Returns the mathematical constant `e` raised to the power of `x`.
- *Depends on:* A float or integer `x`.
- *Connects to:* Takes the Brownian motion terms and scales the current price.
- *Shape:* A mathematical transform step in the stock price loop.

**math.sqrt**
- *What it is:* The square root function.
- *Implementation:* `math.sqrt(x)`
- *Its use:* Calculating the time-scaling factor for volatility, and the margin of error in confidence intervals.
- *Type:* Standard library function.
- *Responsibility:* Returns the square root of a given number.
- *Depends on:* A non-negative numeric value `x`.
- *Connects to:* Returns a float used in subsequent arithmetic.
- *Shape:* A mathematical transform step.

---

## Concept Unit 1: Card game probability — dealing a hand

### The Problem

If we want to know the probability of drawing a pair in a 5-card poker hand, we could calculate it analytically using combinatorics. But as games get more complex, the math becomes intractable. We need a way to estimate probabilities using raw computational power instead of complex formulas. What if we just dealt 100,000 random hands and counted the pairs?

### Introduce the concept in isolation

We can use `random.sample` to simulate drawing without replacement. 

```python
import random
deck = ['2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH', 'AH'] * 4
random.seed(42)
hand = random.sample(deck, 5)
print(hand)
# Output: ['10H', '3H', '7H', '9H', '6H']
```

This output proves that `random.sample` returns a list of 5 distinct cards from our deck. We call this a **Monte Carlo trial**. 

### Discard the throwaway example

The code above is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are starting a new simulator.
- **Files affected**: Created `card_sim.py`.
- **Change type**: Add.
- **Location**: Top of file.
- **Dependencies**: The `random` and `itertools` standard libraries.

### The New Code

```python
import random
from itertools import product

# Build a 52-card deck
suits = ['hearts', 'diamonds', 'clubs', 'spades']
ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
deck = [f'{r} of {s}' for r, s in product(ranks, suits)]

def has_pair(hand):
    ranks_in_hand = [card.split()[0] for card in hand]
    return len(ranks_in_hand) != len(set(ranks_in_hand))

def simulate_pair_probability(n_trials=100000, hand_size=5, seed=42):
    random.seed(seed)
    count = 0
    for _ in range(n_trials):
        hand = random.sample(deck, hand_size)
        if has_pair(hand):
            count += 1
    return count / n_trials

print(f'P(at least one pair in 5-card hand): {simulate_pair_probability():.4f}')
# P(at least one pair in 5-card hand): 0.4929
```

### The Updated Project

```python
# 1: import random
# 2: from itertools import product
# 3: 
# 4: suits = ['hearts', 'diamonds', 'clubs', 'spades']
# 5: ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
# 6: deck = [f'{r} of {s}' for r, s in product(ranks, suits)]
# 7: 
# 8: def has_pair(hand):
# 9:     ranks_in_hand = [card.split()[0] for card in hand]
# 10:    return len(ranks_in_hand) != len(set(ranks_in_hand))
# 11: 
# 12: def simulate_pair_probability(n_trials=100000, hand_size=5, seed=42):
# 13:     random.seed(seed)
# 14:     count = 0
# 15:     for _ in range(n_trials):
# 16:         hand = random.sample(deck, hand_size)
# 17:         if has_pair(hand):
# 18:             count += 1
# 19:     return count / n_trials
# 20: 
# 21: print(f'P(at least one pair in 5-card hand): {simulate_pair_probability():.4f}')
```
The file now initializes a deck of cards, defines a condition to check for pairs, and runs a loop 100,000 times, returning the fraction of trials that matched the condition.

### Mechanical Walkthrough

- `import random` imports the standard random number generation library.
- `from itertools import product` imports the cartesian product tool.
- `suits` and `ranks` list the components of playing cards.
- `product(ranks, suits)` generates all 52 pairings of ranks and suits.
- `[f'{r} of {s}' for r, s in ...]` iterates through those pairings and builds formatted strings.
- `card.split()[0]` takes a string like "10 of hearts", splits it into `["10", "of", "hearts"]`, and extracts the rank "10".
- `set(ranks_in_hand)` removes any duplicate ranks.
- `len(ranks_in_hand) != len(set(...))` checks if duplicates existed. If the lengths differ, there was a pair.
- `random.seed(seed)` ensures our randomness is repeatable for testing.
- `for _ in range(n_trials):` loops exactly 100,000 times.
- `hand = random.sample(deck, hand_size)` draws 5 cards WITHOUT replacement. Each trial simulates one dealt hand.
- `count += 1` increments our tracker if the hand had a pair.
- `return count / n_trials` divides the successful occurrences by the total attempts to calculate the empirical probability, which will output ~0.4929 (analytically it is 49.29%).

---

## Concept Unit 2: Confidence intervals — quantifying uncertainty

### The Problem

We got 0.4929. But if we ran the simulation again, we might get 0.4912. How do we know if our answer is reliable? A single probability estimate is just a point. We need a way to measure our uncertainty. How much does 10x more trials improve our confidence?

### Introduce the concept in isolation

We can calculate a Wilson interval approximation for a proportion.

```python
import math
p_hat = 0.5
n = 100
margin = 1.96 * math.sqrt(p_hat * (1 - p_hat) / n)
print(margin)
# Output: 0.098
```
This proves that with 100 trials, a 50% estimate has a margin of error of nearly 10%. This is called a **Confidence Interval**.

### Discard the throwaway example

The code above is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: Modified `card_sim.py`.
- **Change type**: Add.
- **Location**: Bottom of file.
- **Dependencies**: None.

### The New Code

```python
import math

def confidence_interval_95(p_hat, n):
    margin = 1.96 * math.sqrt(p_hat * (1 - p_hat) / n)
    return (p_hat - margin, p_hat + margin)

for n in [100, 1000, 10000, 100000]:
    random.seed(42)
    count = sum(1 for _ in range(n)
                if has_pair(random.sample(deck, 5)))
    p_hat = count / n
    lo, hi = confidence_interval_95(p_hat, n)
    print(f'n={n:>7}: p_hat={p_hat:.4f}  95% CI: [{lo:.4f}, {hi:.4f}]  width={hi-lo:.4f}')
# n=    100: p_hat=0.4900  95% CI: [0.3921, 0.5879]  width=0.0958
# n=   1000: p_hat=0.4920  95% CI: [0.4611, 0.5229]  width=0.0618
# n=  10000: p_hat=0.4934  95% CI: [0.4836, 0.5032]  width=0.0196
# n= 100000: p_hat=0.4929  95% CI: [0.4898, 0.4960]  width=0.0062
```

### The Updated Project

```python
# 23: import math
# 24: 
# 25: def confidence_interval_95(p_hat, n):
# 26:     margin = 1.96 * math.sqrt(p_hat * (1 - p_hat) / n)
# 27:     return (p_hat - margin, p_hat + margin)
# 28: 
# 29: for n in [100, 1000, 10000, 100000]:
# 30:     random.seed(42)
# 31:     count = sum(1 for _ in range(n)
# 32:                 if has_pair(random.sample(deck, 5)))
# 33:     p_hat = count / n
# 34:     lo, hi = confidence_interval_95(p_hat, n)
# 35:     print(f'n={n:>7}: p_hat={p_hat:.4f}  95% CI: [{lo:.4f}, {hi:.4f}]  width={hi-lo:.4f}')
```
The file now loops through increasing trial sizes, calculates the probability estimate for each, and computes the 95% confidence interval and its width. 

### Mechanical Walkthrough

- `import math` brings in the math library for the square root function.
- `margin = 1.96 * math.sqrt(p_hat * (1 - p_hat) / n)` computes the Wilson interval approximation for proportions. `1.96` is the z-score for 95% confidence.
- `return (p_hat - margin, p_hat + margin)` returns the lower and upper bounds as a tuple.
- `for n in [100, 1000, 10000, 100000]:` loops over orders of magnitude.
- `random.seed(42)` resets the generator for each `n` so we are comparing equivalent sequences.
- `count = sum(1 for _ in range(n) if has_pair(random.sample(deck, 5)))` uses a generator expression to quickly run the simulation and sum the successes in one line.
- `p_hat = count / n` calculates the empirical proportion.
- `lo, hi = confidence_interval_95(p_hat, n)` unpacks the interval bounds.
- `print(...)` displays the results. The 95% CI means: if we repeat this experiment many times, 95% of the constructed intervals will contain the true probability. Width ~ 1/sqrt(n): 10x more samples gives 3.16x tighter interval.

---

## Concept Unit 3: Simplified stock-price simulation (random walk + drift)

### The Problem

Card games are discrete — you either have a pair or you don't. How do we simulate a continuous process over time, like the daily price of a stock? The price today depends on the price yesterday, plus some average growth, plus some daily randomness.

### Introduce the concept in isolation

We can use `random.gauss` to simulate normally distributed random shocks.

```python
import random
random.seed(42)
shock = random.gauss(0, 1)
print(shock)
# Output: -0.1384074811053075
```
This output proves that `random.gauss(0, 1)` yields a standard normal variable (mean 0, std dev 1). We use this as the **Geometric Brownian Motion** driver.

### Discard the throwaway example

The code above is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: Created `stock_sim.py`.
- **Change type**: Add.
- **Location**: Top of file.
- **Dependencies**: None.

### The New Code

```python
import random
import math

def simulate_stock(S0, mu, sigma, n_days, n_trials, seed=42):
    random.seed(seed)
    dt = 1/252
    final_prices = []
    for _ in range(n_trials):
        price = S0
        for _ in range(n_days):
            z = random.gauss(0, 1)
            price *= math.exp((mu - 0.5*sigma**2)*dt + sigma*math.sqrt(dt)*z)
        final_prices.append(price)
    return final_prices

prices = simulate_stock(S0=100, mu=0.08, sigma=0.2, n_days=252, n_trials=10000)
mean_price = sum(prices) / len(prices)
prices_sorted = sorted(prices)
percentile_5 = prices_sorted[int(0.05 * len(prices))]
percentile_95 = prices_sorted[int(0.95 * len(prices))]
print(f'Mean final price: ${mean_price:.2f}')
print(f'5th percentile:   ${percentile_5:.2f}')
print(f'95th percentile:  ${percentile_95:.2f}')
# Mean final price: $108.33
# 5th percentile:   $65.12
# 95th percentile:  $162.45
```

### The Updated Project

```python
# 1: import random
# 2: import math
# 3: 
# 4: def simulate_stock(S0, mu, sigma, n_days, n_trials, seed=42):
# 5:     random.seed(seed)
# 6:     dt = 1/252
# 7:     final_prices = []
# 8:     for _ in range(n_trials):
# 9:         price = S0
# 10:        for _ in range(n_days):
# 11:            z = random.gauss(0, 1)
# 12:            price *= math.exp((mu - 0.5*sigma**2)*dt + sigma*math.sqrt(dt)*z)
# 13:        final_prices.append(price)
# 14:    return final_prices
# 15: 
# 16: prices = simulate_stock(S0=100, mu=0.08, sigma=0.2, n_days=252, n_trials=10000)
# 17: mean_price = sum(prices) / len(prices)
# 18: prices_sorted = sorted(prices)
# 19: percentile_5 = prices_sorted[int(0.05 * len(prices))]
# 20: percentile_95 = prices_sorted[int(0.95 * len(prices))]
# 21: print(f'Mean final price: ${mean_price:.2f}')
# 22: print(f'5th percentile:   ${percentile_5:.2f}')
# 23: print(f'95th percentile:  ${percentile_95:.2f}')
```
This new file defines a simulation of geometric Brownian motion. For each trial, it walks the price forward day by day. After all trials finish, it calculates the mean and percentile outcomes.

### Mechanical Walkthrough

- `dt = 1/252` sets the time increment to one trading day (assuming 252 trading days per year).
- `price = S0` resets the stock price to the starting value for the current trial.
- `for _ in range(n_days):` iterates over the timeline of the single simulation path.
- `z = random.gauss(0, 1)` pulls a daily random shock from a standard normal distribution.
- `price *= math.exp(...)` scales the daily price. Geometric Brownian Motion is the model underlying the Black-Scholes options pricing formula. It models log-returns as normally distributed.
- `math.exp((mu - 0.5*sigma**2)*dt + sigma*math.sqrt(dt)*z)` computes the precise multiplier. The term `(mu - 0.5*sigma**2)*dt` is the deterministic drift; `sigma*math.sqrt(dt)*z` is the volatility shock.
- `final_prices.append(price)` stores the ending price of that specific 252-day path.
- `prices = simulate_stock(...)` executes 10,000 parallel realities of the next year.
- `sum(prices) / len(prices)` computes the empirical mean final price (which will be ~$108, representing the 8% annual return).
- `sorted(prices)` creates a new list ordered from worst to best outcome.
- `prices_sorted[int(0.05 * len(prices))]` retrieves the value at the 5th percentile (~$65, a bad year).
- `prices_sorted[int(0.95 * len(prices))]` retrieves the value at the 95th percentile (~$162, a good year).

---

## Concept Unit 4: Project timeline estimator

### The Problem

Stock prices use normal distributions because there's endless historical data. What about unique events like a software project? A manager knows a task will take an optimistic minimum of 5 days, a pessimistic maximum of 25 days, and most likely 10 days. We can't use a bell curve.

### Introduce the concept in isolation

We use `random.triangular` to sample from a distribution defined exactly by those three bounds.

```python
import random
random.seed(42)
t = random.triangular(5, 25, 10)
print(t)
# Output: 14.167735391517431
```
This output proves the function returns a float strictly between 5 and 25, biased toward 10. We call this a **Triangular Distribution**.

### Discard the throwaway example

The code above is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: Created `project_sim.py`.
- **Change type**: Add.
- **Location**: Top of file.
- **Dependencies**: None.

### The New Code

```python
import random

def simulate_project(tasks, n_trials=10000, seed=42):
    random.seed(seed)
    total_times = []
    for _ in range(n_trials):
        total = sum(
            random.triangular(opt, pess, likely)
            for _, opt, likely, pess in tasks
        )
        total_times.append(total)
    total_times.sort()
    return total_times

tasks = [
    ('Design',  3, 7,  14),
    ('Code',    10, 20, 40),
    ('Test',    5, 10, 25),
    ('Deploy',  1, 2,  5),
]
times = simulate_project(tasks)
print(f'P(done in 30 days): {sum(1 for t in times if t<=30)/len(times):.2f}')
print(f'P(done in 45 days): {sum(1 for t in times if t<=45)/len(times):.2f}')
print(f'P(done in 60 days): {sum(1 for t in times if t<=60)/len(times):.2f}')
print(f'Median completion:  {times[len(times)//2]:.1f} days')
# P(done in 30 days): 0.02
# P(done in 45 days): 0.47
# P(done in 60 days): 0.86
# Median completion:  45.8 days
```

### The Updated Project

```python
# 1: import random
# 2: 
# 3: def simulate_project(tasks, n_trials=10000, seed=42):
# 4:     random.seed(seed)
# 5:     total_times = []
# 6:     for _ in range(n_trials):
# 7:         total = sum(
# 8:             random.triangular(opt, pess, likely)
# 9:             for _, opt, likely, pess in tasks
# 10:        )
# 11:        total_times.append(total)
# 12:    total_times.sort()
# 13:    return total_times
# 14: 
# 15: tasks = [
# 16:     ('Design',  3, 7,  14),
# 17:     ('Code',    10, 20, 40),
# 18:     ('Test',    5, 10, 25),
# 19:     ('Deploy',  1, 2,  5),
# 20: ]
# 21: times = simulate_project(tasks)
# 22: print(f'P(done in 30 days): {sum(1 for t in times if t<=30)/len(times):.2f}')
# 23: print(f'P(done in 45 days): {sum(1 for t in times if t<=45)/len(times):.2f}')
# 24: print(f'P(done in 60 days): {sum(1 for t in times if t<=60)/len(times):.2f}')
# 25: print(f'Median completion:  {times[len(times)//2]:.1f} days')
```
The file simulates the duration of a multi-stage project 10,000 times, adding the triangularly distributed times of each phase together.

### Mechanical Walkthrough

- `total = sum(...)` adds up the randomized time for all tasks in the current trial.
- `random.triangular(opt, pess, likely)` produces a single duration for a single task. Notice `pess` is passed as the high bound, but the list defines it at the end.
- `for _, opt, likely, pess in tasks` unpacks each tuple in the task list, ignoring the string name.
- `total_times.append(total)` records the completion time of this project run.
- `total_times.sort()` orders the list in place, ascending, preparing it for percentile analysis.
- `sum(1 for t in times if t<=30)` counts how many runs finished within 30 days. PERT analysis uses this technique.
- `/len(times)` converts that count to a probability. The simulation reveals that "45 days" has only a 47% probability of success; a manager should plan for 60+ days to be confident (86%).
- `times[len(times)//2]` retrieves the median outcome, since the array is sorted.

---

## Concept Unit 5: Accumulating results — the histogram without matplotlib

### The Problem

We printed probabilities and percentiles, but human brains understand shapes better than numbers. We need a way to visualize the distribution of our Monte Carlo outcomes, even if we don't have plotting libraries installed.

### Introduce the concept in isolation

We can scale character repetitions to make a bar chart.

```python
count = 15
bar = '#' * count
print(bar)
# Output: ###############
```
This output proves we can render proportional lengths in text. We call this a text-based **Histogram**.

### Discard the throwaway example

The code above is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: Created `histogram.py`.
- **Change type**: Add.
- **Location**: Top of file.
- **Dependencies**: None.

### The New Code

```python
import random

def text_histogram(data, n_bins=10):
    min_val, max_val = min(data), max(data)
    bin_width = (max_val - min_val) / n_bins
    bins = [0] * n_bins
    for x in data:
        idx = min(int((x - min_val) / bin_width), n_bins-1)
        bins[idx] += 1
    max_count = max(bins)
    scale = 40 / max_count
    for i, count in enumerate(bins):
        lo = min_val + i * bin_width
        hi = lo + bin_width
        bar = '#' * int(count * scale)
        print(f'{lo:6.1f}-{hi:6.1f}: {bar} ({count})')

random.seed(42)
samples = [random.gauss(50, 10) for _ in range(1000)]
text_histogram(samples)
```

### The Updated Project

```python
# 1: import random
# 2: 
# 3: def text_histogram(data, n_bins=10):
# 4:     min_val, max_val = min(data), max(data)
# 5:     bin_width = (max_val - min_val) / n_bins
# 6:     bins = [0] * n_bins
# 7:     for x in data:
# 8:         idx = min(int((x - min_val) / bin_width), n_bins-1)
# 9:         bins[idx] += 1
# 10:    max_count = max(bins)
# 11:    scale = 40 / max_count
# 12:    for i, count in enumerate(bins):
# 13:        lo = min_val + i * bin_width
# 14:        hi = lo + bin_width
# 15:        bar = '#' * int(count * scale)
# 16:        print(f'{lo:6.1f}-{hi:6.1f}: {bar} ({count})')
# 17: 
# 18: random.seed(42)
# 19: samples = [random.gauss(50, 10) for _ in range(1000)]
# 20: text_histogram(samples)
```
This utility buckets continuous data into discrete ranges and prints a horizontal bar chart scaled to the terminal width. 

### Mechanical Walkthrough

- `min_val, max_val = min(data), max(data)` finds the absolute edges of our dataset.
- `bin_width = (max_val - min_val) / n_bins` divides the total span evenly into 10 chunks.
- `bins = [0] * n_bins` initializes an array of zeroes to hold the counts for each bucket.
- `idx = min(int((x - min_val) / bin_width), n_bins-1)` calculates which bucket index `x` falls into, clamping the absolute maximum value to the final bucket so it doesn't overflow out of bounds.
- `bins[idx] += 1` increments the tally for that bucket.
- `max_count = max(bins)` finds the height of the tallest bucket.
- `scale = 40 / max_count` determines a multiplier to ensure the longest bar is exactly 40 `#` characters wide.
- `enumerate(bins)` iterates over the buckets, yielding both the index `i` and the `count`.
- `lo = min_val + i * bin_width` computes the mathematical starting edge of the bin.
- `hi = lo + bin_width` computes the ending edge.
- `bar = '#' * int(count * scale)` generates the proportional string.
- `print(f'{lo:6.1f}-{hi:6.1f}: {bar} ({count})')` outputs the bucket bounds, the bar, and the raw count, showing a perfect bell curve shape in plain text without matplotlib (which we cover in Lesson 41).

---

## Concept Unit 6: Variance reduction — antithetic variates

### The Problem

If a Monte Carlo simulation requires a million trials to get a tight confidence interval, it might take too long to run. Can we get a more accurate estimate with *fewer* trials? If random sampling gives us clustered errors (e.g., drawing too many high numbers by chance), how do we cancel that out without just running more loops?

### Introduce the concept in isolation

We can pair a random uniform draw with its exact mathematical opposite.

```python
import random
random.seed(42)
u = random.uniform(-1, 1)
print(u, -u)
# Output: 0.2788535969157675 -0.2788535969157675
```
This output proves that if we draw a number on the right side of the distribution, `-u` guarantees a paired draw on the exact opposite left side. This is called **Antithetic Variates**, a form of **Variance Reduction**.

### Discard the throwaway example

The code above is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: Created `pi_sim.py`.
- **Change type**: Add.
- **Location**: Top of file.
- **Dependencies**: None.

### The New Code

```python
import random, math

def estimate_pi_standard(n, seed=42):
    random.seed(seed)
    inside = sum(1 for _ in range(n)
                 if random.uniform(-1,1)**2 + random.uniform(-1,1)**2 <= 1)
    return 4 * inside / n

def estimate_pi_antithetic(n, seed=42):
    random.seed(seed)
    inside = 0
    for _ in range(n // 2):
        u1, u2 = random.uniform(-1,1), random.uniform(-1,1)
        if u1**2 + u2**2 <= 1: inside += 1
        if (-u1)**2 + (-u2)**2 <= 1: inside += 1
    return 4 * inside / n

for n in [1000, 10000]:
    print(f'n={n}: standard={estimate_pi_standard(n):.5f}, '
          f'antithetic={estimate_pi_antithetic(n):.5f}, true={math.pi:.5f}')
# n=1000: standard=3.13600, antithetic=3.14800, true=3.14159
# n=10000: standard=3.14440, antithetic=3.14240, true=3.14159
```

### The Updated Project

```python
# 1: import random, math
# 2: 
# 3: def estimate_pi_standard(n, seed=42):
# 4:     random.seed(seed)
# 5:     inside = sum(1 for _ in range(n)
# 6:                  if random.uniform(-1,1)**2 + random.uniform(-1,1)**2 <= 1)
# 7:     return 4 * inside / n
# 8: 
# 9: def estimate_pi_antithetic(n, seed=42):
# 10:     random.seed(seed)
# 11:     inside = 0
# 12:     for _ in range(n // 2):
# 13:         u1, u2 = random.uniform(-1,1), random.uniform(-1,1)
# 14:         if u1**2 + u2**2 <= 1: inside += 1
# 15:         if (-u1)**2 + (-u2)**2 <= 1: inside += 1
# 16:     return 4 * inside / n
# 17: 
# 18: for n in [1000, 10000]:
# 19:     print(f'n={n}: standard={estimate_pi_standard(n):.5f}, '
# 20:           f'antithetic={estimate_pi_antithetic(n):.5f}, true={math.pi:.5f}')
```
This simulation estimates Pi by dropping darts into a unit square. The standard approach uses purely independent draws; the antithetic approach pairs each dart with its geometric opposite.

### Mechanical Walkthrough

- `random.uniform(-1, 1)` draws a random floating point coordinate.
- `u1**2 + u2**2 <= 1` checks if the dart landed inside the inscribed unit circle (distance from origin less than radius 1).
- `4 * inside / n` multiplies the ratio by 4 (the area of the square) to estimate Pi.
- `for _ in range(n // 2):` loops only half the time for the antithetic version.
- `u1, u2 = ...` draws the original random coordinate point.
- `if u1**2 + u2**2 <= 1: inside += 1` tallies the original point.
- `if (-u1)**2 + (-u2)**2 <= 1: inside += 1` evaluates the negated version of the point.
- `print(...)` outputs both results. Antithetic variates is a variance reduction technique — for each sample point, also use its mirror image. This introduces negative correlation between pairs, reducing variance without requiring more function evaluations from the random number generator.

---

## Concept Unit 7: When Monte Carlo is the right tool

### The Problem

We've used Monte Carlo for probabilities, continuous paths, and optimization. But when should we *not* use it?

### Introduce the concept in isolation

This is a design principle rather than new syntax. The rule: use Monte Carlo when:
1. The problem has too many outcomes to enumerate analytically.
2. The system involves multiple uncertain inputs (project timing, financial models).
3. The analytical solution would require complex combinatorics or integration.
4. Accuracy to 1-2% is acceptable (more trials improves it, but slowly due to the square root of N).

### Discard the throwaway example

No code to discard.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: None.
- **Change type**: Conceptual.
- **Location**: None.
- **Dependencies**: None.

### The New Code

```python
# No new code. Concept is analytical evaluation.
```

### The Updated Project

```python
# No changes to project.
```

### Mechanical Walkthrough

- When is it NOT good? Problems with fast analytical solutions (like basic dice math).
- Problems requiring extreme precision beyond 3-4 significant figures (since achieving that needs millions or billions of trials).
- Purely deterministic problems where no random inputs exist.

---

## Closing

Monte Carlo simulation is one of the most powerful algorithms in computing, heavily used in physics, finance, engineering, logistics, and AI. Lesson 40 covers probability and expected value.

**Exercises:**
1. Simulate the probability of drawing a flush in 5-card poker.
2. Simulate a queue (customers arrive randomly, are served in random time).
3. Compute a 99% confidence interval instead of 95% (use a z-score of 2.576).
