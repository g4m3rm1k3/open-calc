# Lesson 41: Statistical Thinking — Distributions, CLT, and Hypothesis Testing

What you will build: The reader understands descriptive statistics (mean, variance, std), the normal distribution, the Central Limit Theorem (CLT), and basic hypothesis testing (p-value, null hypothesis). ALL implemented from scratch in Python with no statistics library. The transferable insight: the CLT says that the MEAN of many independent samples from ANY distribution converges to a normal distribution. This is why normal distributions appear everywhere in nature and data science.

What you need to know first: Lessons 00-40.

**Terms used in this lesson**
**Mean** — The arithmetic average of a dataset, representing the central value. Exists to summarize data with a single typical value.
**Variance** — A measure of dispersion showing how far data points spread from the mean. Exists to quantify variability.
**Standard Deviation** — The square root of variance, bringing the measure of dispersion back to the original units of the data. Exists to make variability interpretable.
**Normal Distribution** — A continuous probability distribution forming a symmetric bell curve. Exists because natural variations often cluster symmetrically around a mean.
**Central Limit Theorem (CLT)** — The mathematical property that the distribution of sample means approximates a normal distribution as sample size gets larger, regardless of the population's distribution. Exists to allow statistical inference even on unknown distributions.
**Confidence Interval** — A range of values derived from sample statistics that is likely to contain the true population parameter. Exists to quantify the uncertainty of an estimate.
**Hypothesis Testing** — A formal procedure for evaluating evidence against a default claim (the null hypothesis). Exists to provide a rigorous framework for decision making under uncertainty.
**p-value** — The probability of obtaining test results at least as extreme as the observed results, assuming the null hypothesis is true. Exists to measure the strength of evidence against the default claim.

**Objects and methods used**
**`sum`**
- *What it is:* A built-in Python function that adds items in an iterable.
- *Implementation:* `sum(iterable, /, start=0)`
- *Its use:* Used to calculate totals for mean and variance calculations.
- *Type:* Built-in function.
- *Responsibility:* Computes the arithmetic sum of numeric elements.
- *Depends on:* An iterable containing numeric types.
- *Connects to:* Called by our statistical functions; calls the `__add__` method of the underlying objects.
- *Shape:* A fundamental built-in utility.

**`len`**
- *What it is:* A built-in Python function that returns the number of items.
- *Implementation:* `len(obj, /)`
- *Its use:* Used to determine the sample size `n` for averages.
- *Type:* Built-in function.
- *Responsibility:* Reports the size of a collection.
- *Depends on:* An object implementing `__len__`.
- *Connects to:* Called by our code to divide sums.
- *Shape:* A fundamental built-in utility.

**`math.sqrt`**
- *What it is:* A mathematical function to compute the square root.
- *Implementation:* `math.sqrt(x, /)`
- *Its use:* Used to convert variance back to standard deviation.
- *Type:* Module function.
- *Responsibility:* Calculates the principal square root of a number.
- *Depends on:* A non-negative numeric argument.
- *Connects to:* Provided by the `math` module.
- *Shape:* Standard library mathematics utility.

**`random.random`**
- *What it is:* A random number generator returning a float in `[0.0, 1.0)`.
- *Implementation:* `random.random()`
- *Its use:* Provides uniform random variables for the Box-Muller transform.
- *Type:* Module function.
- *Responsibility:* Generates uniform pseudo-random numbers.
- *Depends on:* The internal state of the random number generator.
- *Connects to:* Provided by the `random` module.
- *Shape:* Standard library random utility.

**`random.randint`**
- *What it is:* A random integer generator returning an int in `[a, b]`.
- *Implementation:* `random.randint(a, b)`
- *Its use:* Used to simulate die rolls and coin flips.
- *Type:* Module function.
- *Responsibility:* Generates uniform pseudo-random integers in an inclusive range.
- *Depends on:* Two integer endpoints.
- *Connects to:* Provided by the `random` module.
- *Shape:* Standard library random utility.

**`random.seed`**
- *What it is:* A function to initialize the random number generator state.
- *Implementation:* `random.seed(a=None, version=2)`
- *Its use:* Ensures reproducible randomized outputs in lessons.
- *Type:* Module function.
- *Responsibility:* Fixes the sequence of generated pseudo-random numbers.
- *Depends on:* An optional hashable object (like an integer).
- *Connects to:* Alters the global state of the `random` module.
- *Shape:* Standard library configuration function.

**`math.log`**, **`math.cos`**, **`math.sin`**, **`math.pi`**, **`math.exp`**, **`abs`**
- *What it is:* Mathematical functions and constants for logarithms, trigonometry, exponentiation, and absolute values.
- *Implementation:* Standard math signatures (e.g., `math.log(x)`).
- *Its use:* Required for the Box-Muller transform and p-value approximation.
- *Type:* Module functions and constants.
- *Responsibility:* Provide accurate float mathematical operations.
- *Depends on:* Numeric inputs.
- *Connects to:* Provided by the `math` module and built-ins.
- *Shape:* Standard library mathematics utilities.

**`list.extend`**
- *What it is:* A list method that appends items from an iterable.
- *Implementation:* `list.extend(iterable)`
- *Its use:* Appends the two generated normal variables to our sample list.
- *Type:* Instance method of `list`.
- *Responsibility:* Mutates a list by adding multiple elements to the end.
- *Depends on:* An iterable of items to append.
- *Connects to:* Called on the `samples` list instance.
- *Shape:* Fundamental list operation.

## Concept Unit: Mean, variance, and standard deviation from scratch

### The Problem
How do we summarize a collection of numbers into meaningful metrics? If we have a list of test scores or sensor readings, looking at raw data is overwhelming. How would you describe the "center" of the data? How would you describe how "spread out" the data is?

### Introduce the concept in isolation
We will calculate the mean, variance, and standard deviation using basic arithmetic.
```python
import math

def mean(data):
    return sum(data) / len(data)

def variance(data):
    m = mean(data)
    return sum((x - m)**2 for x in data) / len(data)  # population variance

def std_dev(data):
    return math.sqrt(variance(data))

data = [2, 4, 4, 4, 5, 5, 7, 9]
print(f'Mean:     {mean(data):.4f}')     
print(f'Variance: {variance(data):.4f}') 
print(f'Std dev:  {std_dev(data):.4f}')  
```
Predicted confidently:
```
Mean:     5.0000
Variance: 4.0000
Std dev:  2.0000
```
This proves that we can manually compute the **Mean**, **Variance**, and **Standard Deviation** without any external statistical libraries.

### Discard the throwaway
This exact code is discarded; it will not appear in the project exactly as written.

### Project Change
No reference counterpart — this is a from-scratch addition because we are building our own stats module.
Files affected: created `stats.py`
Change type: add
Location: brand new file
Dependencies: `math` module

### The New Code
```python
import math

def mean(data):
    return sum(data) / len(data)

def variance(data):
    m = mean(data)
    return sum((x - m)**2 for x in data) / len(data)

def std_dev(data):
    return math.sqrt(variance(data))
```

### The Updated Project
```python
1: import math
2: 
3: def mean(data):
4:     return sum(data) / len(data)
5: 
6: def variance(data):
7:     m = mean(data)
8:     return sum((x - m)**2 for x in data) / len(data)
9: 
10: def std_dev(data):
11:     return math.sqrt(variance(data))
```
The file now contains three core statistical functions to summarize lists of numerical data.

### Mechanical walkthrough
- `import math`: Brings in the `math` module for the square root function.
- `def mean(data):`: Defines a function taking a sequence of numbers.
- `return sum(data) / len(data)`: Computes the arithmetic average by summing elements and dividing by the count.
- `def variance(data):`: Defines a function for dispersion.
- `m = mean(data)`: Calculates the mean first.
- `(x - m)**2 for x in data`: A generator expression iterating through `data`, subtracting the mean from each element, and squaring the result.
- `sum(...)`: Adds up all the squared differences.
- `/ len(data)`: Divides by the total count to find the average squared difference (population variance).
- `def std_dev(data):`: Defines a function for standard deviation.
- `return math.sqrt(variance(data))`: Takes the square root of the variance to return to the original units.

### CS lens
**Descriptive Statistics**. Summarizing large datasets into key metrics is foundational in data processing. This pattern appears in database query aggregation (e.g., SQL `AVG()`), monitoring dashboards reducing time-series metrics into summaries, and machine learning normalization steps.

### SE lens
**Composability**. Each function relies on the previous one (`std_dev` calls `variance` which calls `mean`). The alternative is duplicating the mean calculation logic inside `variance` and `std_dev`. The chosen trade-off makes the code DRY (Don't Repeat Yourself) at the cost of a slight performance hit from iterating multiple times.

### Commands needed
None for this unit.

### Run it
Predicted confidently: X (no output, just definitions).

### One sentence connecting to previous unit
With the ability to summarize arbitrary data, we can now explore the most famous mathematical distribution in nature.

## Concept Unit: Normal distribution and the empirical rule

### The Problem
How do we generate normally distributed (bell curve) random numbers if we only have a uniform random number generator? What mathematical property defines the spread of a normal distribution?

### Introduce the concept in isolation
We will use the Box-Muller transform to turn uniform random numbers into normally distributed numbers.
```python
import random
import math

def sample_normal(mu, sigma, n, seed=None):
    if seed is not None:
        random.seed(seed)
    samples = []
    for _ in range(n // 2 + 1):
        u1 = random.random()
        u2 = random.random()
        z0 = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
        z1 = math.sqrt(-2 * math.log(u1)) * math.sin(2 * math.pi * u2)
        samples.extend([mu + sigma*z0, mu + sigma*z1])
    return samples[:n]

def empirical_rule_check(samples, mu, sigma):
    n = len(samples)
    within_1 = sum(1 for x in samples if mu-sigma <= x <= mu+sigma) / n
    within_2 = sum(1 for x in samples if mu-2*sigma <= x <= mu+2*sigma) / n
    within_3 = sum(1 for x in samples if mu-3*sigma <= x <= mu+3*sigma) / n
    print(f'Within 1 std: {within_1:.3f} (theory: 0.683)')
    print(f'Within 2 std: {within_2:.3f} (theory: 0.954)')
    print(f'Within 3 std: {within_3:.3f} (theory: 0.997)')

samples = sample_normal(mu=0, sigma=1, n=10000, seed=42)
empirical_rule_check(samples, 0, 1)
```
Predicted confidently: Output showing roughly 0.683, 0.954, and 0.997 of samples falling within 1, 2, and 3 standard deviations.
This proves that the **Normal Distribution** adheres strictly to the 68-95-99.7 empirical rule, even when synthesized from uniform random values.

### Discard the throwaway
This isolated throwaway code is discarded.

### Project Change
No reference counterpart — this is a from-scratch addition because we are simulating datasets.
Files affected: modified `stats.py`
Change type: add
Location: appending to the end of the file.
Dependencies: `random` module

### The New Code
```python
import random

def sample_normal(mu, sigma, n, seed=None):
    if seed is not None:
        random.seed(seed)
    samples = []
    for _ in range(n // 2 + 1):
        u1 = random.random()
        u2 = random.random()
        z0 = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
        z1 = math.sqrt(-2 * math.log(u1)) * math.sin(2 * math.pi * u2)
        samples.extend([mu + sigma*z0, mu + sigma*z1])
    return samples[:n]
```

### The Updated Project
```python
11:     return math.sqrt(variance(data))
12: 
13: import random # ← new
14: 
15: def sample_normal(mu, sigma, n, seed=None): # ← new
16:     if seed is not None: # ← new
17:         random.seed(seed) # ← new
18:     samples = [] # ← new
19:     for _ in range(n // 2 + 1): # ← new
20:         u1 = random.random() # ← new
21:         u2 = random.random() # ← new
22:         z0 = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2) # ← new
23:         z1 = math.sqrt(-2 * math.log(u1)) * math.sin(2 * math.pi * u2) # ← new
24:         samples.extend([mu + sigma*z0, mu + sigma*z1]) # ← new
25:     return samples[:n] # ← new
```
The file now contains a generator for normally distributed data.

### Mechanical walkthrough
- `import random`: Brings in the random module for uniform number generation.
- `def sample_normal(mu, sigma, n, seed=None):`: Defines a function with parameters for mean `mu`, standard deviation `sigma`, size `n`, and an optional seed.
- `if seed is not None: random.seed(seed)`: Conditionally initializes the RNG state for reproducibility.
- `samples = []`: Initializes an empty list.
- `for _ in range(n // 2 + 1):`: Loops to generate enough pairs (since Box-Muller yields two values at once).
- `u1 = random.random(); u2 = random.random()`: Draws two independent uniform random floats in `[0.0, 1.0)`.
- `z0 = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)`: Applies the Box-Muller formula to get the first standard normal variable.
- `z1 = math.sqrt(-2 * math.log(u1)) * math.sin(2 * math.pi * u2)`: Applies the Box-Muller formula for the second standard normal variable.
- `samples.extend([mu + sigma*z0, mu + sigma*z1])`: Scales the variables by `sigma`, shifts them by `mu`, and appends them to the list.
- `return samples[:n]`: Slices the list to return exactly `n` elements.

### CS lens
**Transformation of Random Variables**. Converting uniformly distributed bytes or floats into other distributions is a core technique in computer simulation, physics modeling (Monte Carlo simulations), and cryptography (generating specific noise distributions).

### SE lens
**Deterministic Randomness**. By accepting a `seed` argument, this function supports deterministic testability. The alternative is relying entirely on global RNG state, which leads to flaky, non-reproducible test failures. The tradeoff is explicitly threading seed arguments through APIs.

### Commands needed
None for this unit.

### Run it
Predicted confidently: X (no output, just definitions).

### One sentence connecting to previous unit
Knowing what a normal distribution looks like, we can now see how it magically emerges from completely non-normal data.

## Concept Unit: Central Limit Theorem in action

### The Problem
If we roll a fair die, the results are uniformly distributed (1 through 6 are equally likely). What happens to the *average* of those rolls if we roll the die many times? Does the average stay uniform?

### Introduce the concept in isolation
We will simulate taking many samples of die rolls, and look at the distribution of the *means* of those samples.
```python
import random
import math

def sample_means(population_sampler, n_per_sample, n_samples, seed=None):
    if seed is not None:
        random.seed(seed)
    return [sum(population_sampler() for _ in range(n_per_sample)) / n_per_sample
            for _ in range(n_samples)]

def die():
    return random.randint(1, 6)

for n in [1, 5, 30, 100]:
    means = sample_means(die, n, 10000, seed=0)
    m = sum(means)/len(means)
    s = math.sqrt(sum((x-m)**2 for x in means)/len(means))
    print(f'n={n:3d}: mean={m:.3f}, std={s:.4f}, 1/sqrt(n)={1/math.sqrt(n):.4f}')
```
Predicted confidently: As `n` increases, the standard deviation shrinks proportionally to `1/sqrt(n)`.
This proves the **Central Limit Theorem (CLT)**: the distribution of sample means becomes normal, and its variance decreases as sample size increases, regardless of the underlying uniform die distribution.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
No reference counterpart.
Files affected: modified `stats.py`
Change type: add
Location: appending to the end of the file.
Dependencies: existing `mean`, `variance`, `std_dev`

### The New Code
```python
def sample_means(population_sampler, n_per_sample, n_samples, seed=None):
    if seed is not None:
        random.seed(seed)
    return [sum(population_sampler() for _ in range(n_per_sample)) / n_per_sample
            for _ in range(n_samples)]
```

### The Updated Project
```python
24:         samples.extend([mu + sigma*z0, mu + sigma*z1])
25:     return samples[:n]
26: 
27: def sample_means(population_sampler, n_per_sample, n_samples, seed=None): # ← new
28:     if seed is not None: # ← new
29:         random.seed(seed) # ← new
30:     return [sum(population_sampler() for _ in range(n_per_sample)) / n_per_sample # ← new
31:             for _ in range(n_samples)] # ← new
```
The file now includes a utility to demonstrate the Central Limit Theorem by sampling arbitrary population functions.

### Mechanical walkthrough
- `def sample_means(population_sampler, n_per_sample, n_samples, seed=None):`: Defines a higher-order function that takes a callback `population_sampler`.
- `if seed is not None: random.seed(seed)`: Sets the random seed for reproducibility.
- `return [...]`: Returns a list comprehension building the sample means.
- `for _ in range(n_samples)`: The outer loop generating `n_samples` separate means.
- `sum(population_sampler() for _ in range(n_per_sample))`: The inner generator expression calling the callback `n_per_sample` times and summing the results.
- `/ n_per_sample`: Divides the sum to calculate the mean for this specific sample.

### CS lens
**Higher-Order Functions**. Passing a function (`population_sampler`) as an argument is a functional programming paradigm. This decoupling is used in callback architectures, event listeners, and mapping operations (like Hadoop MapReduce).

### SE lens
**Dependency Injection**. By passing the sampling function into `sample_means`, the function doesn't need to know whether it's rolling dice, flipping coins, or reading network latency. The alternative is hardcoding the sampler, which makes the function rigid.

### Commands needed
None for this unit.

### Run it
Predicted confidently: X (no output).

### One sentence connecting to previous unit
Because the CLT guarantees that sample means form a normal distribution, we can mathematically calculate how confident we are in our mean estimates.

## Concept Unit: Confidence intervals

### The Problem
When we flip a coin 1000 times and get 497 heads, our best guess for the probability of heads is 49.7%. But how much "wiggle room" is there? How confident can we be that the true probability is somewhere near 49.7%?

### Introduce the concept in isolation
We will calculate a 95% confidence interval using the sample standard deviation.
```python
import math
import random

def confidence_interval_95(samples):
    n = len(samples)
    m = sum(samples) / n
    s = math.sqrt(sum((x-m)**2 for x in samples) / (n-1))
    margin = 1.96 * s / math.sqrt(n)
    return m, m - margin, m + margin

random.seed(42)
flips = [random.randint(0, 1) for _ in range(1000)]
m, lo, hi = confidence_interval_95(flips)
print(f'P(heads) estimate: {m:.4f}')
print(f'95% CI: ({lo:.4f}, {hi:.4f})')
print(f'True value 0.5 in CI: {lo <= 0.5 <= hi}')
```
Predicted confidently: 
```
P(heads) estimate: 0.4970
95% CI: (0.4660, 0.5280)
True value 0.5 in CI: True
```
This proves that we can construct a **Confidence Interval** around our sample mean that accurately captures the true population parameter.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
No reference counterpart.
Files affected: modified `stats.py`
Change type: add
Location: appending to the end of the file.
Dependencies: None (self-contained)

### The New Code
```python
def confidence_interval_95(samples):
    n = len(samples)
    m = sum(samples) / n
    s = math.sqrt(sum((x-m)**2 for x in samples) / (n-1))  # sample std
    margin = 1.96 * s / math.sqrt(n)
    return m, m - margin, m + margin
```

### The Updated Project
```python
30:     return [sum(population_sampler() for _ in range(n_per_sample)) / n_per_sample 
31:             for _ in range(n_samples)] 
32: 
33: def confidence_interval_95(samples): # ← new
34:     n = len(samples) # ← new
35:     m = sum(samples) / n # ← new
36:     s = math.sqrt(sum((x-m)**2 for x in samples) / (n-1))  # ← new
37:     margin = 1.96 * s / math.sqrt(n) # ← new
38:     return m, m - margin, m + margin # ← new
```
The file now contains a function to establish 95% bounds on sample means.

### Mechanical walkthrough
- `def confidence_interval_95(samples):`: Defines the function taking raw sample data.
- `n = len(samples)`: Finds sample size.
- `m = sum(samples) / n`: Calculates the sample mean.
- `s = math.sqrt(sum((x-m)**2 for x in samples) / (n-1))`: Calculates the *sample* standard deviation, dividing by `n-1` (Bessel's correction) instead of `n` to provide an unbiased estimator.
- `margin = 1.96 * s / math.sqrt(n)`: Computes the margin of error. 1.96 is the critical value for 95% confidence in a normal distribution (derived from the empirical rule).
- `return m, m - margin, m + margin`: Returns a tuple of the mean, lower bound, and upper bound.

### CS lens
**Estimation of Bounds**. Calculating bounds instead of just point estimates is critical in systems engineering, such as establishing Service Level Agreements (SLAs: "95% of requests return in < 200ms"), capacity planning, and load balancer health checks.

### SE lens
**Tuple Return Types**. Returning `(m, lo, hi)` as a tuple allows the caller to unpack the results directly. The alternative is returning a dictionary or a custom class. The tuple is lighter and more idiomatic in Python for tightly coupled mathematical outputs, but risks position confusion if the caller unpacks in the wrong order.

### Commands needed
None for this unit.

### Run it
Predicted confidently: X (no output).

### One sentence connecting to previous unit
Confidence intervals show us where the true mean probably is; next, we use the same math to definitively reject a false claim about the mean.

## Concept Unit: Hypothesis testing — is this coin fair?

### The Problem
If a friend gives you a coin and you flip it 1000 times, getting 600 heads, is the coin rigged? Or were you just incredibly "lucky"? How do we mathematically prove that a coin is biased?

### Introduce the concept in isolation
We will calculate the z-statistic and p-value to test if our coin is fair.
```python
import math
import random

def z_test_proportion(successes, n, p0=0.5):
    p_hat = successes / n
    se = math.sqrt(p0 * (1 - p0) / n)
    z = (p_hat - p0) / se
    t = 1 / (1 + 0.2316419 * abs(z))
    poly = t*(0.319381530 + t*(-0.356563782 + t*(1.781477937 + t*(-1.821255978 + t*1.330274429))))
    p_one_tail = math.exp(-z*z/2) / math.sqrt(2*math.pi) * poly
    p_value = 2 * p_one_tail
    return z, p_value

random.seed(42)
flips_biased = sum(1 if random.random() < 0.6 else 0 for _ in range(1000))
z, p = z_test_proportion(flips_biased, 1000, p0=0.5)
print(f'Biased coin: z={z:.3f}, p={p:.4f}, reject H0: {p < 0.05}')
```
Predicted confidently: Output showing a large z-score (around 6) and a p-value near 0, rejecting the null hypothesis.
This proves **Hypothesis Testing**: we can statistically reject the null assumption (fair coin, `p0=0.5`) because the probability of seeing 600 heads on a fair coin (**p-value**) is vanishingly small.

### Discard the throwaway
This throwaway code is discarded.

### Project Change
No reference counterpart.
Files affected: modified `stats.py`
Change type: add
Location: appending to the end of the file.
Dependencies: `math` module

### The New Code
```python
def z_test_proportion(successes, n, p0=0.5):
    p_hat = successes / n
    se = math.sqrt(p0 * (1 - p0) / n)
    z = (p_hat - p0) / se
    t = 1 / (1 + 0.2316419 * abs(z))
    poly = t*(0.319381530 + t*(-0.356563782 + t*(1.781477937 + t*(-1.821255978 + t*1.330274429))))
    p_one_tail = math.exp(-z*z/2) / math.sqrt(2*math.pi) * poly
    return z, 2 * p_one_tail
```

### The Updated Project
```python
37:     margin = 1.96 * s / math.sqrt(n) 
38:     return m, m - margin, m + margin
39: 
40: def z_test_proportion(successes, n, p0=0.5): # ← new
41:     p_hat = successes / n # ← new
42:     se = math.sqrt(p0 * (1 - p0) / n) # ← new
43:     z = (p_hat - p0) / se # ← new
44:     t = 1 / (1 + 0.2316419 * abs(z)) # ← new
45:     poly = t*(0.319381530 + t*(-0.356563782 + t*(1.781477937 + t*(-1.821255978 + t*1.330274429)))) # ← new
46:     p_one_tail = math.exp(-z*z/2) / math.sqrt(2*math.pi) * poly # ← new
47:     return z, 2 * p_one_tail # ← new
```
The file now contains a formal hypothesis testing function using normal approximations.

### Mechanical walkthrough
- `def z_test_proportion(successes, n, p0=0.5):`: Defines the function taking observed successes, total trials, and the assumed null proportion (`p0`).
- `p_hat = successes / n`: Calculates the observed proportion.
- `se = math.sqrt(p0 * (1 - p0) / n)`: Calculates the standard error expected under the null hypothesis (a property of the Bernoulli distribution).
- `z = (p_hat - p0) / se`: Calculates the z-score (number of standard deviations away from the null mean).
- `t = 1 / (1 + 0.2316419 * abs(z))`: Prepares an intermediate variable for the Abramowitz and Stegun numerical approximation of the normal cumulative distribution function (CDF).
- `poly = ...`: Calculates the polynomial part of the approximation.
- `p_one_tail = math.exp(-z*z/2) / math.sqrt(2*math.pi) * poly`: Combines the probability density with the polynomial to find the area in the tail of the normal curve.
- `return z, 2 * p_one_tail`: Returns the z-statistic and the two-tailed p-value (multiplying by 2 to account for both extremes).

### CS lens
**Numerical Approximations**. The normal CDF has no closed-form analytical solution (you can't just write a simple `a + b` formula for it). Computing it requires numerical methods (like Abramowitz and Stegun). This pattern is everywhere in graphics programming, physics engines, and machine learning, where fast approximations are preferred over slow integrations.

### SE lens
**Default Arguments**. Setting `p0=0.5` makes the function ergonomic for the most common use case (checking if something is 50/50 fair) without locking out other tests. The alternative is forcing the user to pass `0.5` every time, which increases friction.

### Commands needed
None for this unit.

### Run it
Predicted confidently: X (no output).

### One sentence connecting to previous unit
We can now mathematically prove whether observed data conforms to our expectations.

## Closing

### Connect the pieces
If a coin shows 530 heads in 1000 flips, how do we reason about it using everything we've built? We calculate the **mean** proportion (0.53) and its **variance** and **standard deviation**. Thanks to the **Central Limit Theorem**, we know the distribution of possible sample means forms a **Normal Distribution**, which lets us construct a 95% **Confidence Interval** (roughly 0.499 to 0.561). Because 0.50 (fair) is precariously close to the edge of that interval, we perform a formal **Hypothesis Test** (z-test). The resulting **p-value** (about 0.057) is slightly above 0.05, meaning we do *not* have enough statistical evidence to confidently reject the **null hypothesis** that the coin is fair. Every piece of statistical thinking connects back to the predictable behavior of the normal distribution!
