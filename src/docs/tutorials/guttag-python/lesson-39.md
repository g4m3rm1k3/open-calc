# Lesson 39: Monte Carlo Simulation — Sampling the Unknown

**What you will build**
The reader understands Monte Carlo simulation: using random sampling to estimate quantities that are hard or impossible to compute analytically. They implement pi estimation, the gambler's ruin, and a simple random walk. The transferable insight: Monte Carlo works because of the law of large numbers. With enough samples, the sample mean converges to the true expected value. The error decreases as O(1/sqrt(n)): 100x more samples means 10x more precision.

**What you need to know first**
Lessons 00-38.

**Terms used in this lesson**
- **Monte Carlo simulation** — A computational technique that uses repeated random sampling to estimate numerical results, typically used when deterministic algorithms are too complex or impossible to run. It solves the problem of finding answers to intractable problems by approximating them through probability.
- **Law of large numbers** — A theorem in probability stating that the average of the results obtained from a large number of trials should be close to the expected value and will tend to become closer to the expected value as more trials are performed. It provides the mathematical justification for why Monte Carlo simulations work.
- **Confidence interval** — A range of values, derived from sample statistics, that is likely to contain the value of an unknown population parameter. It gives a measure of reliability or certainty to an estimate, quantifying the error instead of just providing a single point estimate.
- **Random walk** — A mathematical object that describes a path that consists of a succession of random steps on some mathematical space such as the integers. It models unpredictable movements like stock prices or molecular diffusion.
- **Random seed** — An initial value used to initialize a pseudorandom number generator (PRNG). Using the same seed guarantees the exact same sequence of random numbers is produced, solving the problem of reproducing bugs or experimental results in simulations.

**Objects and methods used**

- **`random.uniform`**
  - *What it is*: A standard library function that returns a random floating-point number between two specified bounds.
  - *Implementation*: `def uniform(a: float, b: float) -> float`
  - *Its use*: Used to generate random `x` and `y` coordinates within the bounding box `[-1, 1]` for the Monte Carlo pi estimation.
  - *Type*: A module-level function in the `random` module.
  - *Responsibility*: Generates a continuous uniform distribution of random floats over the interval `[a, b]`.
  - *Depends on*: The underlying Mersenne Twister PRNG state. Needs lower bound `a` and upper bound `b`.
  - *Connects to*: Called by our sampling loop; returns a float that is mathematically tested against the circle equation.
  - *Shape*: Standard library API boundary.

- **`random.random`**
  - *What it is*: A standard library function that returns a random floating-point number in the range `[0.0, 1.0)`.
  - *Implementation*: `def random() -> float`
  - *Its use*: Used to determine the probability of a win in the gambler's ruin simulation by comparing its return value to a probability threshold.
  - *Type*: A module-level function in the `random` module.
  - *Responsibility*: Generates the base uniform pseudorandom float that most other `random` functions build upon.
  - *Depends on*: The underlying Mersenne Twister PRNG state. Takes no arguments.
  - *Connects to*: Called by our simulation loop; returns a float.
  - *Shape*: Standard library API boundary.

- **`random.choice`**
  - *What it is*: A standard library function that returns a randomly selected element from a non-empty sequence.
  - *Implementation*: `def choice(seq: Sequence[T]) -> T`
  - *Its use*: Used to pick either a step left (`-1`) or a step right (`1`) with equal probability in the random walk.
  - *Type*: A module-level function in the `random` module.
  - *Responsibility*: Picks one element uniformly at random from the provided sequence.
  - *Depends on*: A non-empty sequence like a list or tuple. The PRNG state.
  - *Connects to*: Called by the random walk generator; returns a single element of the sequence's type.
  - *Shape*: Standard library API boundary.

- **`random.seed`**
  - *What it is*: A standard library function that initializes the internal state of the pseudorandom number generator.
  - *Implementation*: `def seed(a: Any = None, version: int = 2) -> None`
  - *Its use*: Used to ensure our simulations produce the exact same sequence of random numbers across different runs for reproducible experiments.
  - *Type*: A module-level function in the `random` module.
  - *Responsibility*: Resets and seeds the global PRNG state.
  - *Depends on*: An optional seed value (usually an integer, string, or bytes).
  - *Connects to*: Called at the start of a script or function; updates the global `random` module state.
  - *Shape*: Standard library API boundary (global state mutator).

- **`math.sqrt`**
  - *What it is*: A standard library function that returns the square root of a number.
  - *Implementation*: `def sqrt(x: float) -> float`
  - *Its use*: Used to calculate the standard deviation and the theoretical expected distance in a random walk.
  - *Type*: A module-level function in the `math` module.
  - *Responsibility*: Computes the principal square root of a non-negative number.
  - *Depends on*: A non-negative numeric argument `x`.
  - *Connects to*: Called by statistical calculation code; returns a float.
  - *Shape*: Standard library API boundary.

- **`math.pi`**
  - *What it is*: A mathematical constant representing the ratio of a circle's circumference to its diameter.
  - *Implementation*: `pi: float = 3.141592653589793`
  - *Its use*: Used as the true theoretical value of pi to calculate our estimation error.
  - *Type*: A module-level constant in the `math` module.
  - *Responsibility*: Provides the highest-precision available float representation of pi.
  - *Depends on*: Nothing.
  - *Connects to*: Read by our error-calculation expression.
  - *Shape*: Standard library constant.

## Concept Unit: Monte Carlo pi estimation
### The Problem
How can we calculate a numerical value like pi using only randomness and geometry? If we throw darts randomly at a square board, how can we use the hits within an inscribed circle to approximate pi?

### Introduce the concept in isolation
```python
import random
random.seed(42)
x = random.uniform(-1, 1)
y = random.uniform(-1, 1)
print(f"Point ({x:.2f}, {y:.2f})")
print(f"Inside unit circle: {x**2 + y**2 <= 1}")
```
Output:
```
Point (0.28, -0.95)
Inside unit circle: True
```
This isolates the core logic: generating a random coordinate and mathematically testing if it falls within a unit circle. This logic forms the basis of a **Monte Carlo simulation**.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: Created `simulation.py`.
- **Change type**: Add.
- **Location**: Top of the new file.
- **Dependencies**: None.

### The New Code
```python
import random
import math

def estimate_pi(num_samples):
    inside = 0
    for _ in range(num_samples):
        x = random.uniform(-1, 1)
        y = random.uniform(-1, 1)
        if x**2 + y**2 <= 1:  # inside unit circle
            inside += 1
    return 4 * inside / num_samples

random.seed(42)  # reproducible results
for n in [100, 1000, 10000, 100000, 1000000]:
    estimate = estimate_pi(n)
    error = abs(estimate - math.pi)
    print(f'n={n:8d}: pi~{estimate:.5f}, error={error:.5f}')
```

### The Updated Project
```python
1: import random  # ← new
2: import math  # ← new
3: 
4: def estimate_pi(num_samples):  # ← new
5:     inside = 0  # ← new
6:     for _ in range(num_samples):  # ← new
7:         x = random.uniform(-1, 1)  # ← new
8:         y = random.uniform(-1, 1)  # ← new
9:         if x**2 + y**2 <= 1:  # inside unit circle  # ← new
10:             inside += 1  # ← new
11:     return 4 * inside / num_samples  # ← new
12: 
13: random.seed(42)  # reproducible results  # ← new
14: for n in [100, 1000, 10000, 100000, 1000000]:  # ← new
15:     estimate = estimate_pi(n)  # ← new
16:     error = abs(estimate - math.pi)  # ← new
17:     print(f'n={n:8d}: pi~{estimate:.5f}, error={error:.5f}')  # ← new
```
This sets up a script to estimate pi by randomly sampling points in a 2D square and calculating the ratio that land inside a unit circle.

### Mechanical walkthrough
- `import random` pulls in the Python standard library module for random number generation.
- `import math` pulls in the standard library module for mathematical functions and constants.
- `def estimate_pi(num_samples):` defines a function taking a parameter for the total iterations to run.
- `inside = 0` initializes an accumulator variable to count points inside the circle.
- `for _ in range(num_samples):` loops the specified number of times, using `_` to discard the index.
- `x = random.uniform(-1, 1)` gets a random float between `-1` and `1` for the x-coordinate.
- `y = random.uniform(-1, 1)` gets a random float between `-1` and `1` for the y-coordinate.
- `if x**2 + y**2 <= 1:` uses the Pythagorean theorem to check if the point's distance from origin is less than or equal to 1.
- `inside += 1` increments the accumulator if the condition is met.
- `return 4 * inside / num_samples` returns the ratio of inside hits to total throws, multiplied by 4 (the area of the bounding square).
- `random.seed(42)` initializes the random state so everyone gets the same sequence.
- `for n in [100, 1000, 10000, 100000, 1000000]:` loops through a list of exponentially increasing sample sizes.
- `estimate = estimate_pi(n)` calls our function for a given size and stores the returned float.
- `error = abs(estimate - math.pi)` calculates the absolute difference between our estimate and the true constant.
- `print(...)` displays formatted strings with the sample size, estimate, and error.

### CS lens
This is Monte Carlo Integration. It appears in computer graphics for path tracing (simulating light rays), in computational chemistry for modeling molecular structures, and in financial risk management for pricing options under uncertainty.

### SE lens
This code demonstrates an approximation design principle. We trade off absolute exactness for a computable estimate. The alternative chosen was simple sequential looping; an alternative NOT chosen was using array vectorization (like NumPy), which would be much faster but less conceptually clear for learning the base logic.

### Commands needed
`python3 simulation.py`

### Run it
```
n=     100: pi~3.08000, error=0.06159
n=    1000: pi~3.18400, error=0.04241
n=   10000: pi~3.14280, error=0.00121
n=  100000: pi~3.14144, error=0.00015
n= 1000000: pi~3.14159, error=0.00003
```
(Error decreases ~10x for every 100x more samples).

### One sentence connecting to previous unit
Now that we have established a basic simulation with single estimates, how do we systematically quantify our confidence in the results when the true answer is unknown?

## Concept Unit: Law of large numbers and confidence intervals
### The Problem
If we run a simulation once, we get an answer. How do we know if it's a typical answer or a fluke? Without knowing the true answer ahead of time, how can we mathematically bound where the true value lies?

### Introduce the concept in isolation
```python
import random
import math
trials = [2.0, 3.0, 4.0]
mean = sum(trials) / len(trials)
variance = sum((r - mean)**2 for r in trials) / len(trials)
std = math.sqrt(variance)
print(f"Mean: {mean}, StdDev: {std:.2f}")
```
Output:
```
Mean: 3.0, StdDev: 0.82
```
This isolates calculating standard deviation to measure spread. This allows us to construct a **Confidence interval** to bound our simulation uncertainty using the **Law of large numbers**.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition.
- **Files affected**: Modified `simulation.py`.
- **Change type**: Add.
- **Location**: Append to the bottom of the file.
- **Dependencies**: The `estimate_pi` function from the prior unit.

### The New Code
```python
def simulate_mean_and_std(func, num_trials, samples_per_trial):
    '''Run func num_trials times, each with samples_per_trial samples.
       Returns mean and std of the trial results.'''
    results = [func(samples_per_trial) for _ in range(num_trials)]
    mean = sum(results) / len(results)
    variance = sum((r - mean)**2 for r in results) / len(results)
    std = math.sqrt(variance)
    return mean, std

random.seed(0)
mean, std = simulate_mean_and_std(estimate_pi, num_trials=100, samples_per_trial=1000)
print(f'Mean estimate: {mean:.4f}')
print(f'Std deviation: {std:.4f}')
print(f'95% CI: ({mean - 2*std:.4f}, {mean + 2*std:.4f})')
print(f'True pi: {math.pi:.4f}')
```

### The Updated Project
```python
...
17:     print(f'n={n:8d}: pi~{estimate:.5f}, error={error:.5f}')
18: 
19: def simulate_mean_and_std(func, num_trials, samples_per_trial):  # ← new
20:     '''Run func num_trials times, each with samples_per_trial samples.  # ← new
21:        Returns mean and std of the trial results.'''  # ← new
22:     results = [func(samples_per_trial) for _ in range(num_trials)]  # ← new
23:     mean = sum(results) / len(results)  # ← new
24:     variance = sum((r - mean)**2 for r in results) / len(results)  # ← new
25:     std = math.sqrt(variance)  # ← new
26:     return mean, std  # ← new
27: 
28: random.seed(0)  # ← new
29: mean, std = simulate_mean_and_std(estimate_pi, num_trials=100, samples_per_trial=1000)  # ← new
30: print(f'Mean estimate: {mean:.4f}')  # ← new
31: print(f'Std deviation: {std:.4f}')  # ← new
32: print(f'95% CI: ({mean - 2*std:.4f}, {mean + 2*std:.4f})')  # ← new
33: print(f'True pi: {math.pi:.4f}')  # ← new
```
This adds a statistical wrapper to run multiple simulation trials, measure their variance, and compute a 95% confidence interval for the true answer.

### Mechanical walkthrough
- `def simulate_mean_and_std(func, num_trials, samples_per_trial):` defines a higher-order function that takes another function (`func`) as an argument.
- `results = [func(samples_per_trial) for _ in range(num_trials)]` uses a list comprehension to execute `func` `num_trials` times, collecting the outputs into a list.
- `mean = sum(results) / len(results)` computes the average estimate.
- `variance = sum((r - mean)**2 for r in results) / len(results)` calculates the average of the squared differences from the mean (variance).
- `std = math.sqrt(variance)` takes the square root of the variance to get standard deviation, using `math.sqrt`.
- `return mean, std` returns a tuple of the calculated statistics.
- `random.seed(0)` resets the PRNG state.
- `mean, std = simulate_mean_and_std(...)` unpacks the returned tuple into variables.
- `print(...)` formats the confidence interval, notably subtracting and adding `2*std` to approximate a 95% bounds around the mean.

### CS lens
This highlights higher-order functions and functional composition. Passing a simulation function into a statistical analyzer decouples the *what we are simulating* from *how we measure its reliability*. It shows up in statistical profiling tools, performance benchmarking harnesses, and hyperparameter tuning in machine learning.

### SE lens
This applies the Separation of Concerns design principle. We could have written standard deviation logic directly into `estimate_pi`, but separating them allows `simulate_mean_and_std` to evaluate any arbitrary function later. The tradeoff is passing a function reference, which is slightly more abstract than hardcoded loops but vastly more reusable.

### Commands needed
`python3 simulation.py`

### Run it
```
Mean estimate: 3.1418
Std deviation: 0.0165
95% CI: (3.1088, 3.1748)
True pi: 3.1416
```

### One sentence connecting to previous unit
With the tools to run and statistically measure arbitrary simulations, let's look at modeling a scenario driven by sequential probabilistic steps.

## Concept Unit: Gambler's ruin simulation
### The Problem
How can we model an ongoing sequence of random events where each step depends on the outcome of the previous one? Can we predict the probability of long-term survival when facing a system stacked against us?

### Introduce the concept in isolation
```python
import random
random.seed(1)
money = 10
outcome = "win" if random.random() < 0.5 else "lose"
money += 1 if outcome == "win" else -1
print(f"Outcome: {outcome}, New balance: {money}")
```
Output:
```
Outcome: lose, New balance: 9
```
This isolates probabilistic branching based on a float comparison. Doing this continuously until a terminal condition is met demonstrates a **Random walk** applied to gambling.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modified `simulation.py`.
- **Change type**: Add.
- **Location**: Append to the bottom of the file.
- **Dependencies**: The `random` module.

### The New Code
```python
def gamblers_ruin(start_money, goal, win_prob=0.5, max_steps=10000):
    '''Simulate gambler with 'start_money'. Bets $1 each step.
       Win with probability win_prob. Goal is 'goal' dollars.
       Returns (reached_goal: bool, steps_taken: int).'''
    money = start_money
    for step in range(max_steps):
        if money == 0 or money == goal:
            return money == goal, step
        if random.random() < win_prob:
            money += 1   # win
        else:
            money -= 1   # lose
    return False, max_steps  # didn't finish

def run_gamblers_experiment(start, goal, prob, num_trials=10000):
    wins = sum(1 for _ in range(num_trials)
               if gamblers_ruin(start, goal, prob)[0])
    theory = start / goal if prob == 0.5 else None
    print(f'Start=${start}, Goal=${goal}, p={prob}: win rate={wins/num_trials:.3f}', end='')
    if theory: print(f' (theory={theory:.3f})')
    else: print()

random.seed(42)
run_gamblers_experiment(50, 100, 0.5)   # fair game: win rate ~0.5
run_gamblers_experiment(10, 100, 0.5)   # start small: win rate ~0.1
run_gamblers_experiment(50, 100, 0.49)  # slight house edge: disaster
```

### The Updated Project
```python
...
33: print(f'True pi: {math.pi:.4f}')
34: 
35: def gamblers_ruin(start_money, goal, win_prob=0.5, max_steps=10000):  # ← new
36:     '''Simulate gambler with 'start_money'. Bets $1 each step.  # ← new
37:        Win with probability win_prob. Goal is 'goal' dollars.  # ← new
38:        Returns (reached_goal: bool, steps_taken: int).'''  # ← new
39:     money = start_money  # ← new
40:     for step in range(max_steps):  # ← new
41:         if money == 0 or money == goal:  # ← new
42:             return money == goal, step  # ← new
43:         if random.random() < win_prob:  # ← new
44:             money += 1   # win  # ← new
45:         else:  # ← new
46:             money -= 1   # lose  # ← new
47:     return False, max_steps  # didn't finish  # ← new
48: 
49: def run_gamblers_experiment(start, goal, prob, num_trials=10000):  # ← new
50:     wins = sum(1 for _ in range(num_trials)  # ← new
51:                if gamblers_ruin(start, goal, prob)[0])  # ← new
52:     theory = start / goal if prob == 0.5 else None  # ← new
53:     print(f'Start=${start}, Goal=${goal}, p={prob}: win rate={wins/num_trials:.3f}', end='')  # ← new
54:     if theory: print(f' (theory={theory:.3f})')  # ← new
55:     else: print()  # ← new
56: 
57: random.seed(42)  # ← new
58: run_gamblers_experiment(50, 100, 0.5)   # fair game: win rate ~0.5  # ← new
59: run_gamblers_experiment(10, 100, 0.5)   # start small: win rate ~0.1  # ← new
60: run_gamblers_experiment(50, 100, 0.49)  # slight house edge: disaster  # ← new
```
We define a stateful step-by-step simulation to run until a boundary is hit (ruin or goal), and repeatedly run it to estimate total win probabilities under different conditions.

### Mechanical walkthrough
- `def gamblers_ruin(start_money, goal, win_prob=0.5, max_steps=10000):` defines a function with default arguments for the probability and maximum loop length.
- `money = start_money` copies the starting parameter into a mutable state variable.
- `for step in range(max_steps):` bounds our loop to avoid infinite execution (a safety limit).
- `if money == 0 or money == goal:` tests for the termination condition at the boundaries.
- `return money == goal, step` returns a boolean tuple element indicating success, and the duration.
- `if random.random() < win_prob:` calls `random.random()` (returns `[0.0, 1.0)`) and compares to the win threshold.
- `money += 1` increments state on a win.
- `money -= 1` decrements state on a loss.
- `return False, max_steps` handles the safety fallback if we exhaust steps.
- `wins = sum(1 for _ in range(num_trials) if gamblers_ruin(start, goal, prob)[0])` uses a generator expression inside `sum` to elegantly count True returns from index `[0]` of the tuple.
- `theory = start / goal if prob == 0.5 else None` applies inline conditional logic for the known theoretical equation.
- `print(..., end='')` overrides the default print newline.
- `run_gamblers_experiment(...)` executes three variations of the setup to prove edge behaviors.

### CS lens
This models a Markov Chain with absorbing states. The concept appears in garbage collection algorithms (tracing object reachability), queueing theory for server load forecasting, and packet loss recovery protocols in networking.

### SE lens
This demonstrates bounded execution limits (the `max_steps` variable). Instead of a purely infinite `while` loop, bounding the iterations prevents catastrophic hanging if parameters cause a non-terminating path. The tradeoff is potentially cutting off an extraordinarily long but valid run, in exchange for guaranteed system stability.

### Commands needed
`python3 simulation.py`

### Run it
```
Start=$50, Goal=$100, p=0.5: win rate=0.504 (theory=0.500)
Start=$10, Goal=$100, p=0.5: win rate=0.103 (theory=0.100)
Start=$50, Goal=$100, p=0.49: win rate=0.117
```

### One sentence connecting to previous unit
If we remove the boundaries of money and ruin and just let the sequential steps wander continuously, we arrive at the formal mathematical concept of a random walk.

## Concept Unit: Random walks
### The Problem
How can we simulate pure diffusion, like a molecule bouncing randomly in a fluid? If an object steps randomly left or right, does it tend to stay put or drift endlessly?

### Introduce the concept in isolation
```python
import random
random.seed(42)
steps = [random.choice([-1, 1]) for _ in range(5)]
print(f"Steps: {steps}, Final position: {sum(steps)}")
```
Output:
```
Steps: [1, 1, -1, -1, -1], Final position: -1
```
This demonstrates `random.choice` to pick discrete directions uniformly, producing a 1-dimensional **Random walk**.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: Modified `simulation.py`.
- **Change type**: Add.
- **Location**: Append to the bottom of the file.
- **Dependencies**: The `math` and `random` modules.

### The New Code
```python
def random_walk_1d(steps):
    position = 0
    for _ in range(steps):
        position += random.choice([-1, 1])  # step left or right
    return position

def simulate_walk_stats(num_steps, num_trials):
    final_positions = [random_walk_1d(num_steps) for _ in range(num_trials)]
    mean_pos = sum(final_positions) / len(final_positions)
    mean_abs = sum(abs(p) for p in final_positions) / len(final_positions)
    # Theory: E[|position|] ~ sqrt(num_steps)
    theory = math.sqrt(num_steps)
    print(f'steps={num_steps:5d}: mean_pos={mean_pos:.2f}, mean_dist={mean_abs:.2f}, sqrt(n)={theory:.2f}')

random.seed(1)
for n in [100, 400, 900, 1600]:
    simulate_walk_stats(n, 10000)
```

### The Updated Project
```python
...
60: run_gamblers_experiment(50, 100, 0.49)  # slight house edge: disaster
61: 
62: def random_walk_1d(steps):  # ← new
63:     position = 0  # ← new
64:     for _ in range(steps):  # ← new
65:         position += random.choice([-1, 1])  # step left or right  # ← new
66:     return position  # ← new
67: 
68: def simulate_walk_stats(num_steps, num_trials):  # ← new
69:     final_positions = [random_walk_1d(num_steps) for _ in range(num_trials)]  # ← new
70:     mean_pos = sum(final_positions) / len(final_positions)  # ← new
71:     mean_abs = sum(abs(p) for p in final_positions) / len(final_positions)  # ← new
72:     # Theory: E[|position|] ~ sqrt(num_steps)  # ← new
73:     theory = math.sqrt(num_steps)  # ← new
74:     print(f'steps={num_steps:5d}: mean_pos={mean_pos:.2f}, mean_dist={mean_abs:.2f}, sqrt(n)={theory:.2f}')  # ← new
75: 
76: random.seed(1)  # ← new
77: for n in [100, 400, 900, 1600]:  # ← new
78:     simulate_walk_stats(n, 10000)  # ← new
```
We define an unbounded random walk, run it across 10,000 trials, and compute its mean displacement and absolute distance to compare against the theoretical square root of `n`.

### Mechanical walkthrough
- `def random_walk_1d(steps):` defines a function to take a number of steps.
- `position = 0` sets the origin.
- `for _ in range(steps):` loops for the given duration.
- `position += random.choice([-1, 1])` uses `random.choice` to pick uniformly from a list and adds it to the state.
- `return position` provides the final coordinate.
- `def simulate_walk_stats(...)` sets up a statistical aggregator similar to our previous confidence interval tool.
- `final_positions = [...]` collects array of endpoint coordinates for thousands of trials.
- `mean_pos = sum(final_positions) / len(final_positions)` gets the literal average position (which should cancel out to near 0).
- `mean_abs = sum(abs(p) for p in final_positions) / len(...)` gets the mean absolute distance traveled from origin.
- `theory = math.sqrt(num_steps)` calculates the square root representing expected magnitude.
- `print(...)` outputs the results to prove the $\sqrt{n}$ growth rate.
- `for n in [100, 400, 900, 1600]:` scales the step lengths by perfect squares to neatly compare to their integer roots.

### CS lens
This is Brownian Motion. Random walk geometry appears in distributed peer-to-peer network routing (gossip protocols), PageRank algorithms determining website authority by random web surfing, and probabilistic roadmap planning in robotics.

### SE lens
This demonstrates data isolation vs aggregation. By returning only the final `position`, we throw away the full path taken. The alternative NOT chosen is appending every step to a list and returning the whole path. Returning just the integer saves massive amounts of memory, trading off deep inspectability for high-volume aggregate simulation scalability.

### Commands needed
`python3 simulation.py`

### Run it
```
steps=  100: mean_pos=0.03, mean_dist=7.92, sqrt(n)=10.00
steps=  400: mean_pos=-0.11, mean_dist=15.93, sqrt(n)=20.00
steps=  900: mean_pos=0.15, mean_dist=24.08, sqrt(n)=30.00
steps= 1600: mean_pos=-0.38, mean_dist=31.81, sqrt(n)=40.00
```
Mean distance grows proportional to `sqrt(steps)`, confirming diffusion theory.

### One sentence connecting to previous unit
Through all these simulations, we've relied on a critical background mechanism to ensure the outputs don't wildly shift every time we run the script.

## Concept Unit: Setting a random seed for reproducibility
### The Problem
If a Monte Carlo simulation uses random numbers, running it twice produces different outputs. How do we scientifically replicate a finding, write a deterministic test, or debug a specific failure if the data changes under us?

### Introduce the concept in isolation
```python
import random
random.seed(42)
print([random.randint(1, 6) for _ in range(5)])
random.seed(42)
print([random.randint(1, 6) for _ in range(5)])
```
Output:
```
[1, 5, 6, 1, 5]
[1, 5, 6, 1, 5]
```
By providing a **Random seed**, the exact sequence of "randomness" is mathematically locked in and identical every time.

### Discard the throwaway
This throwaway code is explicitly discarded and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart.
- **Files affected**: None modified. This concept is a holistic explanation of the `random.seed(42)` lines we have placed in every preceding unit.
- **Change type**: Configure.
- **Location**: N/A.
- **Dependencies**: The `random` module.

### The New Code
```python
# No new code block; this explains the `random.seed(42)`
# already present at the start of all earlier units.
```

### The Updated Project
```python
13: random.seed(42)  # reproducible results
...
28: random.seed(0)
...
57: random.seed(42)
...
76: random.seed(1)
```
These lines lock the PRNG (pseudorandom number generator) state before executing their respective batches of trials.

### Mechanical walkthrough
- `random.seed(42)` injects a specific integer into the PRNG algorithm's internal mathematical state matrix.
- Any subsequent calls to `random.random()`, `random.uniform()`, or `random.choice()` will deterministically transform this state into the exact same sequence of values.
- `random.seed(0)` or `random.seed(1)` behaves exactly the same way, just establishing a different starting state (and thus a different deterministic sequence).
- By default, if `seed` is not called (or called as `random.seed(None)`), Python seeds the PRNG using the current system time or OS entropy, rendering it non-reproducible.

### CS lens
This reveals that computers don't do true randomness well. They do Pseudorandom Number Generation (PRNG). The PRNG is a deterministic mathematical equation (like the Mersenne Twister). Given the same starting state (seed), the equation produces the same sequence of outputs forever. True randomness requires hardware entropy sources, like thermal noise or radioactive decay.

### SE lens
This is the principle of reproducible builds and test determinism. Flaky tests — tests that fail sometimes due to random data — are a massive drag on engineering velocity. The alternative chosen was explicitly seeding our simulations. The alternative NOT chosen is letting it run on OS entropy. We trade off genuine unpredictability in exchange for scientific reproducibility and debuggability. In a real application like a game or crypto, you want unpredictability. In tests and simulations, you demand determinism.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The output of our simulations will be exactly identical no matter how many times you run `python3 simulation.py`.

### One sentence connecting to previous unit
We can rely on our statistical aggregations, gamblers' boundaries, and Pi estimates because the PRNG mechanism obeys strict deterministic rules when seeded.

## Closing
### Connect the pieces
Trace estimating pi using Monte Carlo through all concept units:
We started with generating a single random coordinate and geometrically bounding it (Monte Carlo pi estimation). We wrapped it in a framework that measured average error and variance, proving the reliability of the method via the Law of large numbers and confidence intervals. We took this sequential probabilistic logic and applied it to state changes, discovering the gambler's ruin and observing Brownian diffusion via the random walk. Throughout it all, the engine driving our experiments was the pseudo-random generator, mathematically tethered to consistency by a random seed, ensuring that as our sample size $n$ scaled up by $100x$, our error shrank reliably by $10x$. You now understand how to sample the unknown.
