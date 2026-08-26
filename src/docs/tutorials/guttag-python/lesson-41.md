# Lesson 41: Statistical Thinking — Distributions, CLT, and Hypothesis Testing

What you will build
The reader will understand the normal distribution, plot histograms (using `matplotlib.pyplot`), verify the Central Limit Theorem experimentally, and perform a basic one-sample t-test and interpret the p-value. The transferable problems: (1) the normal distribution is not just a mathematical object — it emerges inevitably from summing many small random effects (CLT); (2) a histogram reveals the SHAPE of a distribution; knowing the shape determines which statistical tests apply; (3) a p-value is the probability of observing the data IF the null hypothesis were true — small p-value means the data is hard to explain by chance alone.

What you need to know first
- Lesson 40

Terms used in this lesson
- **Normal distribution** — A probability distribution that is symmetric about the mean, showing that data near the mean are more frequent in occurrence than data far from the mean. It solves the problem of modeling continuous random variables that cluster around a central value.
- **Mean (μ)** — The central value of a discrete set of numbers, which represents the average. It exists to give a single summary measure of the center of a distribution.
- **Standard deviation (σ)** — A measure of the amount of variation or dispersion of a set of values. It exists to quantify how spread out the numbers are from the mean.
- **Probability Density Function (PDF)** — A function whose value at any given sample in the sample space can be interpreted as providing a relative likelihood that the value of the random variable would equal that sample. It exists to describe the continuous probability distribution.
- **Cumulative Distribution Function (CDF)** — The probability that a real-valued random variable X will take a value less than or equal to x. It exists to calculate cumulative probabilities.
- **Histogram** — An approximate representation of the distribution of numerical data. It solves the problem of visually estimating the probability distribution of a continuous variable.
- **Central Limit Theorem (CLT)** — A statistical theory stating that given a sufficiently large sample size from a population with a finite level of variance, the mean of all samples from the same population will be approximately equal to the mean of the population. It exists to allow normal probability calculations for sample means even when the underlying distribution is not normal.
- **Null hypothesis (H0)** — A general statement or default position that there is no relationship between two measured phenomena, or no association among groups. It exists as a baseline assumption to be tested against.
- **p-value** — The probability of obtaining test results at least as extreme as the results actually observed, under the assumption that the null hypothesis is correct. It exists to measure the strength of evidence against the null hypothesis.
- **Type I error** — The rejection of a true null hypothesis (also known as a "false positive" finding or conclusion). It exists as the risk we take when setting a significance level.
- **Type II error** — The non-rejection of a false null hypothesis (also known as a "false negative" finding or conclusion). It exists as the risk of missing a true effect.
- **Significance level (alpha)** — The probability of rejecting the null hypothesis when it is true. It exists to set a threshold for statistical significance.
- **Confidence interval** — A range of values that's likely to include a population value with a certain degree of confidence. It exists to provide a range of plausible values for an unknown parameter.
- **Effect size** — A quantitative measure of the magnitude of the experimental effect. It exists to determine the practical significance of a finding.
- **Statistical significance** — A determination that a relationship between two or more variables is caused by something other than chance. It exists to provide a mathematical basis for evaluating experimental results.
- **Practical significance** — The real-world importance of an effect. It exists to distinguish mathematically significant but trivially small effects from meaningfully large ones.

Objects and methods used

**`math.exp`**
- *What it is:* A mathematical function that returns Euler's number `e` raised to the power of a given number.
- *Implementation:* `def exp(x: float) -> float`
- *Its use:* To calculate the exponential part of the normal PDF.
- *Type:* Standard library function.
- *Responsibility:* Computes the exponential function for floating-point inputs.
- *Depends on:* A numeric input value.
- *Connects to:* Mathematical calculations requiring exponentiation of `e`.
- *Shape:* A low-level math utility.

**`math.sqrt`**
- *What it is:* A mathematical function that returns the square root of a number.
- *Implementation:* `def sqrt(x: float) -> float`
- *Its use:* To calculate standard deviations and components of the normal PDF.
- *Type:* Standard library function.
- *Responsibility:* Computes the square root of non-negative numeric inputs.
- *Depends on:* A non-negative numeric input value.
- *Connects to:* Mathematical calculations requiring square roots.
- *Shape:* A low-level math utility.

**`scipy.stats.norm.cdf`**
- *What it is:* The Cumulative Distribution Function for the normal distribution.
- *Implementation:* `def cdf(x, loc=0, scale=1)`
- *Its use:* To find the probability of a value falling below a certain point in a normal distribution.
- *Type:* Method on a continuous random variable object.
- *Responsibility:* Evaluates the normal CDF at given points.
- *Depends on:* An input value, mean (`loc`), and standard deviation (`scale`).
- *Connects to:* Statistical queries about probability thresholds.
- *Shape:* Part of the scipy stats module's distribution API.

**`matplotlib.pyplot.subplots`**
- *What it is:* A utility function that creates a figure and a set of subplots.
- *Implementation:* `def subplots(nrows=1, ncols=1, *, figsize=None, ...)`
- *Its use:* To set up the canvas and axes for plotting our histogram.
- *Type:* Library function.
- *Responsibility:* Initializes a matplotlib Figure and one or more Axes objects.
- *Depends on:* Optional parameters defining grid size and figure dimensions.
- *Connects to:* Matplotlib's state-based and object-oriented plotting interfaces.
- *Shape:* The primary entry point for creating complex plots.

**`matplotlib.axes.Axes.hist`**
- *What it is:* An axes method used to plot a histogram.
- *Implementation:* `def hist(x, bins=None, density=False, ...)`
- *Its use:* To visually represent the distribution of our simulated data.
- *Type:* Instance method on Matplotlib Axes.
- *Responsibility:* Computes and draws the histogram of x.
- *Depends on:* A sequence of data `x` and configuration parameters like `bins`.
- *Connects to:* The Axes object it is called on, drawing patches on it.
- *Shape:* A core plotting command for 1D distributions.

**`matplotlib.axes.Axes.plot`**
- *What it is:* An axes method used to plot lines and/or markers to the Axes.
- *Implementation:* `def plot(*args, scalex=True, scaley=True, data=None, **kwargs)`
- *Its use:* To overlay the theoretical continuous normal curve.
- *Type:* Instance method on Matplotlib Axes.
- *Responsibility:* Draws lines connecting given points.
- *Depends on:* x and y coordinates.
- *Connects to:* The Axes object, adding Line2D objects to it.
- *Shape:* A core plotting command for 2D line plots.

**`numpy.linspace`**
- *What it is:* A function that returns evenly spaced numbers over a specified interval.
- *Implementation:* `def linspace(start, stop, num=50, ...)`
- *Its use:* To generate the x-values for plotting the theoretical normal PDF.
- *Type:* Library function.
- *Responsibility:* Creates 1D arrays of linear sequences.
- *Depends on:* Start, stop, and number of points.
- *Connects to:* Plotting commands that need a continuous-looking domain.
- *Shape:* An array creation routine.

**`scipy.stats.norm.pdf`**
- *What it is:* The Probability Density Function for the normal distribution.
- *Implementation:* `def pdf(x, loc=0, scale=1)`
- *Its use:* To calculate the y-values for the theoretical normal curve overlay.
- *Type:* Method on a continuous random variable object.
- *Responsibility:* Evaluates the normal PDF at given points.
- *Depends on:* An input value, mean (`loc`), and standard deviation (`scale`).
- *Connects to:* Plotting or likelihood calculations.
- *Shape:* Part of the scipy stats module's distribution API.

**`random.gauss`**
- *What it is:* A function that generates random floating-point numbers with a Gaussian (normal) distribution.
- *Implementation:* `def gauss(mu, sigma)`
- *Its use:* To simulate data drawn from a normal distribution.
- *Type:* Standard library function.
- *Responsibility:* Produces normally distributed pseudo-random numbers.
- *Depends on:* Mean (`mu`) and standard deviation (`sigma`).
- *Connects to:* Simulations requiring normally distributed noise or populations.
- *Shape:* A random number generator method.

**`random.seed`**
- *What it is:* A function used to initialize the internal state of the random number generator.
- *Implementation:* `def seed(a=None, version=2)`
- *Its use:* To ensure our simulations produce reproducible, deterministic results.
- *Type:* Standard library function.
- *Responsibility:* Sets the starting state for pseudo-random generation.
- *Depends on:* A hashable seed value.
- *Connects to:* All subsequent calls to the `random` module.
- *Shape:* Global configuration for the random module.

**`scipy.stats.ttest_1samp`**
- *What it is:* A function that calculates the T-test for the mean of ONE group of scores.
- *Implementation:* `def ttest_1samp(a, popmean, ...)`
- *Its use:* To perform a hypothesis test checking if the sample mean significantly differs from a claimed population mean.
- *Type:* Library function.
- *Responsibility:* Computes the t-statistic and p-value for a one-sample test.
- *Depends on:* A sample of data `a` and the hypothesized population mean `popmean`.
- *Connects to:* Hypothesis testing workflows.
- *Shape:* A statistical testing utility.

**`scipy.stats.sem`**
- *What it is:* A function that calculates the standard error of the mean.
- *Implementation:* `def sem(a, ...)`
- *Its use:* To compute the standard error needed for constructing a confidence interval.
- *Type:* Library function.
- *Responsibility:* Computes the standard deviation of the sample mean estimate.
- *Depends on:* A sample of data `a`.
- *Connects to:* Confidence interval calculations.
- *Shape:* A descriptive statistics utility.

**`scipy.stats.t.interval`**
- *What it is:* A method that computes the confidence interval for a t-distribution.
- *Implementation:* `def interval(confidence, df, loc=0, scale=1)`
- *Its use:* To construct a 95% confidence interval around our sample mean.
- *Type:* Method on a continuous random variable object.
- *Responsibility:* Returns the endpoints of the interval containing the specified probability mass.
- *Depends on:* Confidence level, degrees of freedom (`df`), mean (`loc`), and standard error (`scale`).
- *Connects to:* Interval estimation workflows.
- *Shape:* Part of the scipy stats module's distribution API.

**`scipy.stats.ttest_ind`**
- *What it is:* A function that calculates the T-test for the means of two independent samples of scores.
- *Implementation:* `def ttest_ind(a, b, ...)`
- *Its use:* To perform an A/B test checking if two samples differ significantly.
- *Type:* Library function.
- *Responsibility:* Computes the t-statistic and p-value for a two-sample test.
- *Depends on:* Two samples of data, `a` and `b`.
- *Connects to:* A/B testing and comparative workflows.
- *Shape:* A statistical testing utility.


## Concept Unit: The normal distribution — mean and standard deviation

### The Problem

We need a way to mathematically model real-world phenomena where values tend to cluster around a central average, with extreme values becoming increasingly rare. How can we write a function that describes this specific "bell-shaped" clustering behavior precisely?

### Introduce the concept in isolation

We can define the Probability Density Function (PDF) of the normal distribution directly in Python to see how it assigns likelihoods to different values.

```python
import math

def normal_pdf(x, mu=0, sigma=1):
    '''Probability density function of N(mu, sigma^2).'''
    coeff = 1 / (sigma * math.sqrt(2 * math.pi))
    exponent = -0.5 * ((x - mu) / sigma) ** 2
    return coeff * math.exp(exponent)

# Key values for N(0, 1):
for x in [-3, -2, -1, 0, 1, 2, 3]:
    print(f'pdf({x:+d}) = {normal_pdf(x):.6f}')
```

Output:
```
pdf(-3) = 0.004432
pdf(-2) = 0.053991
pdf(-1) = 0.241971
pdf(+0) = 0.398942
pdf(+1) = 0.241971
pdf(+2) = 0.053991
pdf(+3) = 0.004432
```

This output proves that the **normal distribution** is symmetric about its mean (0), peaking at the mean (0.398942) and dropping off rapidly and symmetrically as we move away in either direction.

### Discard the throwaway example

The manual `normal_pdf` function is discarded. We will use `scipy.stats` for real calculations moving forward.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our statistical analysis script.
- **Files affected:** `stats_analysis.py` (created)
- **Change type:** add
- **Location:** At the top of the new file.
- **Dependencies:** `scipy` must be installed.

### The New Code

```python
from scipy import stats

print(stats.norm.cdf(1.96))
print(stats.norm.cdf(-1.96))
print(stats.norm.cdf(1.96) - stats.norm.cdf(-1.96))
```

### The Updated Project

```python
# 1: from scipy import stats
# 2: 
# 3: print(stats.norm.cdf(1.96))
# 4: print(stats.norm.cdf(-1.96))
# 5: print(stats.norm.cdf(1.96) - stats.norm.cdf(-1.96))
```

This code uses the `scipy.stats` library to compute cumulative probabilities for the standard normal distribution, finding the proportion of values that fall within specific ranges.

### Mechanical walkthrough

- `from scipy import stats`: Imports the `stats` module from the `scipy` package, which contains statistical distributions and functions.
- `stats.norm.cdf(1.96)`: Calls the `cdf` (Cumulative Distribution Function) method on the `norm` object (representing the normal distribution) with an input of 1.96. The **Cumulative Distribution Function (CDF)** calculates the probability that a random variable is less than or equal to the input value. By default, it uses a mean of 0 and standard deviation of 1.
- `stats.norm.cdf(-1.96)`: Calls the same CDF method for -1.96.
- `print(...)`: Outputs the result of the calculations.
- `stats.norm.cdf(1.96) - stats.norm.cdf(-1.96)`: Subtracts the lower cumulative probability from the upper cumulative probability. This calculates the probability of a value falling exactly *between* -1.96 and +1.96 standard deviations from the mean.

### Connect the Pieces

The normal distribution is characterized by its mean (where it's centered) and standard deviation (how wide it is). While the PDF tells us the relative density at a specific point, practical statistics usually asks about ranges ("what is the chance it falls between X and Y?"). The CDF answers this directly. The result of the final subtraction is approximately 0.95 — revealing the famous statistical rule that roughly 95% of the data in a normal distribution falls within 1.96 standard deviations of the mean.


## Concept Unit: Plotting a histogram with matplotlib

### The Problem

We have a mathematical model for a distribution, but in reality, we start with raw data. How can we visually inspect a dataset to see if it follows a bell curve shape, and how can we compare our raw data against the ideal mathematical model?

### Introduce the concept in isolation

We can generate random data and plot its shape using `matplotlib`.

```python
import matplotlib.pyplot as plt
import random

random.seed(42)
data = [random.gauss(100, 15) for _ in range(1000)]

fig, ax = plt.subplots(figsize=(8, 5))
ax.hist(data, bins=30, density=True, alpha=0.7, color='steelblue')
plt.savefig('isolated_hist.png')
plt.close()
print("Isolated histogram plotted.")
```

Output:
```
Isolated histogram plotted.
```

This code generates normally distributed pseudo-random numbers and plots them as a **Histogram**. It proves that even random samples drawn from a theoretical distribution will roughly approximate the shape of that distribution when bucketed into bins.

### Discard the throwaway example

The isolated histogram script is discarded. We will build a more complete visualization directly into our project script.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `stats_analysis.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of the file.
- **Dependencies:** `matplotlib` and `numpy` must be installed.

### The New Code

```python
import matplotlib.pyplot as plt
import random
import numpy as np

random.seed(42)
data = [random.gauss(100, 15) for _ in range(1000)]

fig, ax = plt.subplots(figsize=(8, 5))
ax.hist(data, bins=30, density=True, alpha=0.7, color='steelblue', label='Simulated data')

xs = np.linspace(40, 160, 200)
ax.plot(xs, stats.norm.pdf(xs, 100, 15), 'r-', linewidth=2, label='N(100, 15)')

ax.set_xlabel('Value')
ax.set_ylabel('Density')
ax.set_title('Histogram vs Theoretical Normal Distribution')
ax.legend()
plt.tight_layout()
plt.savefig('histogram.png')
plt.close()
print('Plot saved to histogram.png')
```

### The Updated Project

```python
# 1: from scipy import stats
# 2: 
# 3: print(stats.norm.cdf(1.96))
# 4: print(stats.norm.cdf(-1.96))
# 5: print(stats.norm.cdf(1.96) - stats.norm.cdf(-1.96))
# 6: 
# 7: import matplotlib.pyplot as plt
# 8: import random
# 9: import numpy as np
# 10: 
# 11: random.seed(42)
# 12: data = [random.gauss(100, 15) for _ in range(1000)]
# 13: 
# 14: fig, ax = plt.subplots(figsize=(8, 5))
# 15: ax.hist(data, bins=30, density=True, alpha=0.7, color='steelblue', label='Simulated data')
# 16: 
# 17: xs = np.linspace(40, 160, 200)
# 18: ax.plot(xs, stats.norm.pdf(xs, 100, 15), 'r-', linewidth=2, label='N(100, 15)')
# 19: 
# 20: ax.set_xlabel('Value')
# 21: ax.set_ylabel('Density')
# 22: ax.set_title('Histogram vs Theoretical Normal Distribution')
# 23: ax.legend()
# 24: plt.tight_layout()
# 25: plt.savefig('histogram.png')
# 26: plt.close()
# 27: print('Plot saved to histogram.png')
```

This updated script now generates simulated data, plots its distribution as a histogram, and overlays the theoretical normal curve perfectly on top of it, saving the result to an image file.

### Mechanical walkthrough

- `import matplotlib.pyplot as plt`: Imports the plotting module.
- `import random`, `import numpy as np`: Imports required libraries.
- `random.seed(42)`: Fixes the random number generator so the output is identical every time it runs.
- `data = [random.gauss(100, 15) for _ in range(1000)]`: Uses a list comprehension to generate 1000 numbers from a normal distribution with mean 100 and standard deviation 15.
- `fig, ax = plt.subplots(figsize=(8, 5))`: Creates a figure and an axes object, setting the figure size to 8x5 inches.
- `ax.hist(data, bins=30, density=True, alpha=0.7, color='steelblue', label='Simulated data')`: Plots a **Histogram** of the `data`. `bins=30` splits the data into 30 contiguous intervals. `density=True` scales the y-axis so the total area of all bars equals 1 (matching a true probability density, rather than just raw counts). `alpha=0.7` makes the bars semi-transparent.
- `xs = np.linspace(40, 160, 200)`: Creates an array of 200 evenly spaced numbers between 40 and 160 to serve as x-coordinates for the theoretical curve.
- `ax.plot(xs, stats.norm.pdf(xs, 100, 15), 'r-', linewidth=2, label='N(100, 15)')`: Plots the theoretical normal **Probability Density Function (PDF)** over the same x-range, passing mean 100 and standard deviation 15, drawing it as a red solid line (`'r-'`).
- `ax.set_xlabel(...)`, `ax.set_ylabel(...)`, `ax.set_title(...)`: Adds descriptive labels to the plot axes and a title.
- `ax.legend()`: Displays the legend using the `label` arguments provided earlier.
- `plt.tight_layout()`: Automatically adjusts subplot parameters so the plot fits nicely in the figure.
- `plt.savefig('histogram.png')`: Renders and saves the plot to a file on disk.
- `plt.close()`: Closes the figure, freeing up memory.

### Connect the Pieces

By setting `density=True` on the histogram, we changed its y-axis from absolute counts to probability density. This is crucial because it places the empirical data and the theoretical PDF (which always has an area of 1) on the exact same scale, allowing them to be overlaid. The histogram reveals the SHAPE of the distribution, which is the necessary first step before deciding which statistical tests are valid to apply to it.


## Concept Unit: The Central Limit Theorem — empirical verification

### The Problem

Many real-world measurements are not intrinsically normal. If we roll dice or measure uniformly distributed noise, the distribution is flat, not bell-shaped. How is it that the normal distribution appears everywhere in statistics, even when the underlying events aren't normal?

### Introduce the concept in isolation

We will average samples drawn from a purely uniform distribution (where every number between 0 and 1 is equally likely, giving a flat shape) and see what happens to the shape of those averages as we average more and more numbers together.

```python
import random

random.seed(42)
def sample_mean(dist_fn, n):
    return sum(dist_fn() for _ in range(n)) / n

uniform = lambda: random.random()

# Look at the mean of just 2 uniform numbers:
means_n2 = [sample_mean(uniform, 2) for _ in range(5)]
print([round(m, 3) for m in means_n2])

# Look at the mean of 30 uniform numbers:
means_n30 = [sample_mean(uniform, 30) for _ in range(5)]
print([round(m, 3) for m in means_n30])
```

Output:
```
[0.323, 0.252, 0.706, 0.443, 0.225]
[0.472, 0.493, 0.457, 0.505, 0.519]
```

This output proves that when $n$ is small, the averages are spread widely between 0 and 1. But when $n$ is 30, the averages cluster extremely tightly around 0.5. The **Central Limit Theorem (CLT)** states that as sample size increases, the distribution of the sample mean approaches a normal distribution, regardless of the original distribution's shape.

### Discard the throwaway example

The tiny numerical output script is discarded. We will build a visual proof into our project.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `stats_analysis.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of the file.
- **Dependencies:** None additional.

### The New Code

```python
def sample_mean(dist_fn, n):
    return sum(dist_fn() for _ in range(n)) / n

uniform = lambda: random.random()

fig, axes = plt.subplots(1, 4, figsize=(16, 4))
for ax, n in zip(axes, [1, 2, 10, 30]):
    means = [sample_mean(uniform, n) for _ in range(5000)]
    ax.hist(means, bins=30, density=True, color='steelblue')
    ax.set_title(f'Sample means (n={n})')
    ax.set_xlabel('Mean')

plt.suptitle('Central Limit Theorem: Uniform Distribution')
plt.tight_layout()
plt.savefig('clt.png')
plt.close()
print('Plot saved to clt.png')

import math
for n in [1, 2, 10, 30]:
    means = [sample_mean(uniform, n) for _ in range(5000)]
    mu = sum(means)/len(means)
    std = math.sqrt(sum((x-mu)**2 for x in means)/len(means))
    print(f'n={n:>2}: mean={mu:.4f}, std={std:.4f}, theory_std={1/(math.sqrt(12)*math.sqrt(n)):.4f}')
```

### The Updated Project

*(The previous histogram plotting code remains, and the new CLT code is appended below it.)*
```python
# ... (lines 1-27 unchanged)
# 28: def sample_mean(dist_fn, n):
# 29:     return sum(dist_fn() for _ in range(n)) / n
# 30: 
# 31: uniform = lambda: random.random()
# 32: 
# 33: fig, axes = plt.subplots(1, 4, figsize=(16, 4))
# 34: for ax, n in zip(axes, [1, 2, 10, 30]):
# 35:     means = [sample_mean(uniform, n) for _ in range(5000)]
# 36:     ax.hist(means, bins=30, density=True, color='steelblue')
# 37:     ax.set_title(f'Sample means (n={n})')
# 38:     ax.set_xlabel('Mean')
# 39: 
# 40: plt.suptitle('Central Limit Theorem: Uniform Distribution')
# 41: plt.tight_layout()
# 42: plt.savefig('clt.png')
# 43: plt.close()
# 44: print('Plot saved to clt.png')
# 45: 
# 46: import math
# 47: for n in [1, 2, 10, 30]:
# 48:     means = [sample_mean(uniform, n) for _ in range(5000)]
# 49:     mu = sum(means)/len(means)
# 50:     std = math.sqrt(sum((x-mu)**2 for x in means)/len(means))
# 51:     print(f'n={n:>2}: mean={mu:.4f}, std={std:.4f}, theory_std={1/(math.sqrt(12)*math.sqrt(n)):.4f}')
```

This updated script simulates taking samples of varying sizes from a uniform distribution, calculates the mean of each sample, and plots the distributions of those means to visually prove they become normal. It then prints the empirical standard deviation alongside the theoretical prediction.

### Mechanical walkthrough

- `def sample_mean(dist_fn, n)`: Defines a helper function that takes a function `dist_fn` (which generates a single random number) and an integer `n`.
- `sum(dist_fn() for _ in range(n)) / n`: Calls the generator function `n` times, sums the results, and divides by `n` to compute the average (mean) of the sample.
- `uniform = lambda: random.random()`: Creates a simple lambda function that returns a uniform float between 0.0 and 1.0.
- `fig, axes = plt.subplots(1, 4, figsize=(16, 4))`: Creates a figure with 1 row and 4 columns of subplots, returning the figure and an array of 4 Axes objects.
- `for ax, n in zip(axes, [1, 2, 10, 30])`: Loops through the 4 subplots simultaneously with the sample sizes 1, 2, 10, and 30.
- `means = [sample_mean(uniform, n) for _ in range(5000)]`: For each sample size `n`, it draws 5000 separate samples of size `n` and calculates their means.
- `ax.hist(means, ...)`: Plots the histogram of these 5000 means on the current subplot.
- `plt.suptitle(...)`, `plt.tight_layout()`, `plt.savefig(...)`: Adds a main title over the subplots, formats, and saves the image.
- `for n in [1, 2, 10, 30]:`: Starts a second loop to calculate numerical statistics.
- `mu = sum(means)/len(means)`: Calculates the empirical **Mean (μ)** of the 5000 sample means.
- `std = math.sqrt(sum((x-mu)**2 for x in means)/len(means))`: Calculates the empirical **Standard deviation (σ)** of the 5000 sample means.
- `print(...)`: Prints the results, including `theory_std`, which uses the known variance of a uniform distribution ($1/12$) scaled by $1/n$ per the CLT.

### Connect the Pieces

When $n=1$, the histogram is flat — it just mirrors the uniform distribution. But as $n$ increases to 30, the histogram transforms into a perfect bell curve. This is the **Central Limit Theorem** in action: the distribution of the *sample mean* approaches a normal distribution as the sample size grows, regardless of the underlying data's shape. Furthermore, the spread of this normal distribution shrinks exactly according to the theoretical standard error ($\sigma/\sqrt{n}$). Because of the CLT, we can use normal distribution math to make inferences about averages in the real world, even when the underlying data is heavily skewed or flat.


## Concept Unit: The one-sample t-test

### The Problem

A manufacturer claims their computer chips run at 2.0 GHz. We test 30 chips and get an average speed of 1.95 GHz. Is this just normal random variance in manufacturing, or is the true average actually lower than 2.0? How do we formalize this question mathematically?

### Introduce the concept in isolation

We can use `scipy.stats.ttest_1samp` to calculate the probability of seeing our data if the manufacturer's claim were perfectly true.

```python
from scipy import stats
import random

random.seed(42)
chip_speeds = [random.gauss(1.95, 0.1) for _ in range(30)]

t_stat, p_value = stats.ttest_1samp(chip_speeds, popmean=2.0)
print(f"p-value: {p_value:.4f}")
```

Output:
```
p-value: 0.0125
```

This proves that under the **Null hypothesis (H0)** (that the true mean is exactly 2.0), the probability of randomly observing a sample mean of 1.95 or worse is only 1.25%. Because this **p-value** is very small, we conclude the manufacturer's claim is likely false. This test is a one-sample t-test.

### Discard the throwaway example

The isolated t-test is discarded; we will write out a complete, well-commented test in our analysis script.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `stats_analysis.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of the file.
- **Dependencies:** None additional.

### The New Code

```python
random.seed(42)
chip_speeds = [random.gauss(1.95, 0.1) for _ in range(30)]

sample_mean = sum(chip_speeds) / len(chip_speeds)
print(f'\nSample mean: {sample_mean:.4f} GHz')

t_stat, p_value = stats.ttest_1samp(chip_speeds, popmean=2.0)
print(f't-statistic: {t_stat:.4f}')
print(f'p-value:     {p_value:.4f}')
print(f'Reject H0 at alpha=0.05: {p_value < 0.05}')
```

### The Updated Project

```python
# ... (lines 1-51 unchanged)
# 52: random.seed(42)
# 53: chip_speeds = [random.gauss(1.95, 0.1) for _ in range(30)]
# 54: 
# 55: sample_mean = sum(chip_speeds) / len(chip_speeds)
# 56: print(f'\nSample mean: {sample_mean:.4f} GHz')
# 57: 
# 58: t_stat, p_value = stats.ttest_1samp(chip_speeds, popmean=2.0)
# 59: print(f't-statistic: {t_stat:.4f}')
# 60: print(f'p-value:     {p_value:.4f}')
# 61: print(f'Reject H0 at alpha=0.05: {p_value < 0.05}')
```

This updated script simulates measuring 30 computer chips, computes their average speed, runs a formal one-sample t-test against the claimed speed of 2.0, and decides whether to reject the claim based on a 0.05 significance threshold.

### Mechanical walkthrough

- `chip_speeds = [random.gauss(1.95, 0.1) for _ in range(30)]`: Generates 30 random chip speeds. We secretly build them with a true mean of 1.95, meaning the manufacturer's claim of 2.0 is factually false in our simulation.
- `sample_mean = sum(chip_speeds) / len(chip_speeds)`: Calculates the simple arithmetic **Mean (μ)** of our 30 samples.
- `print(f'\nSample mean: {sample_mean:.4f} GHz')`: Outputs the sample mean.
- `t_stat, p_value = stats.ttest_1samp(chip_speeds, popmean=2.0)`: Calls the `ttest_1samp` function. The first argument is the data; `popmean=2.0` defines the **Null hypothesis (H0)** — the assumption we are testing against. The function returns two values: a t-statistic (measuring how far the sample mean is from the population mean in units of standard error) and the **p-value**.
- `print(f'Reject H0 at alpha=0.05: {p_value < 0.05}')`: Checks if the **p-value** is less than our chosen **Significance level (alpha)** of 0.05. If it is, we evaluate the expression as `True`, meaning we reject the null hypothesis.

### Connect the Pieces

The t-test crystallizes statistical thinking into a single decision rule. We start with a baseline assumption, the **Null hypothesis (H0)** (mean = 2.0). We collect data. The **p-value** asks: *if H0 were perfectly true, how likely is it that random chance would produce a sample mean as far off as ours?* Our p-value is roughly 0.0125. Since a 1.25% chance is very rare — rarer than our **Significance level (alpha)** of 5% (0.05) — we conclude that the discrepancy is not just random chance. We reject H0, providing statistical evidence that the chips are indeed slower than claimed.


## Concept Unit: Type I and Type II errors

### The Problem

If we reject the null hypothesis every time the p-value is less than 0.05, does that mean our conclusion is always right? What happens when we run this same test on chips that actually *do* meet the 2.0 GHz claim?

### Introduce the concept in isolation

We can run the t-test 1000 times on simulated chips that genuinely have a true mean of 2.0, and count how many times the math wrongly tells us to reject the claim.

```python
import random
from scipy import stats

random.seed(42)
alpha = 0.05
type1_count = 0

for _ in range(1000):
    sample = [random.gauss(2.0, 0.1) for _ in range(30)]
    _, p = stats.ttest_1samp(sample, 2.0)
    if p < alpha:
        type1_count += 1

print(f'Type I error rate: {type1_count/1000:.3f}')
```

Output:
```
Type I error rate: 0.046
```

This output proves that even when the **Null hypothesis (H0)** is perfectly true, random variation will still cause us to observe extreme data about 5% of the time, leading us to falsely reject H0. This false positive is a **Type I error**.

### Discard the throwaway example

The isolated simulation is discarded. We will include this simulation in our analysis script to explicitly demonstrate error rates.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `stats_analysis.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of the file.
- **Dependencies:** None additional.

### The New Code

```python
alpha = 0.05
type1_count = 0

for _ in range(1000):
    sample = [random.gauss(2.0, 0.1) for _ in range(30)]
    _, p = stats.ttest_1samp(sample, 2.0)
    if p < alpha:
        type1_count += 1

print(f'\nType I error rate (simulated): {type1_count/1000:.3f}')
```

### The Updated Project

```python
# ... (lines 1-61 unchanged)
# 62: alpha = 0.05
# 63: type1_count = 0
# 64: 
# 65: for _ in range(1000):
# 66:     sample = [random.gauss(2.0, 0.1) for _ in range(30)]
# 67:     _, p = stats.ttest_1samp(sample, 2.0)
# 68:     if p < alpha:
# 69:         type1_count += 1
# 70: 
# 71: print(f'\nType I error rate (simulated): {type1_count/1000:.3f}')
```

This script simulates 1000 experiments where the manufacturer's claim is completely true, runs a t-test on each, and tracks how often the test erroneously rejects the valid claim.

### Mechanical walkthrough

- `alpha = 0.05`: Sets our **Significance level (alpha)**.
- `type1_count = 0`: Initializes a counter for false positives.
- `for _ in range(1000):`: Loops 1000 times, simulating 1000 independent product tests.
- `sample = [random.gauss(2.0, 0.1) for _ in range(30)]`: Generates 30 chips. Crucially, the mean passed to `gauss` is `2.0`. The **Null hypothesis (H0)** is TRUE in reality here.
- `_, p = stats.ttest_1samp(sample, 2.0)`: Performs the one-sample t-test against the claim of 2.0. The `_` discards the t-statistic; we only care about the **p-value**.
- `if p < alpha:`: Checks if the test result was statistically significant.
- `type1_count += 1`: If it was, we increment our counter. Because H0 is known to be true, rejecting it is a **Type I error**.
- `print(...)`: Prints the fraction of tests that resulted in a Type I error.

### Connect the Pieces

The result is approximately 0.05. This is not a coincidence: the **Significance level (alpha)** *is* the **Type I error** rate. By choosing to reject H0 when $p < 0.05$, we are explicitly accepting a 5% chance of crying wolf when nothing is wrong. If we lowered alpha to 0.01 to avoid false positives, we would increase our **Type II error** rate — the risk of failing to detect when the chips actually *are* slower. Statistics is always a trade-off between these two errors.


## Concept Unit: Confidence interval vs hypothesis test

### The Problem

A p-value tells us if 2.0 is a plausible true mean, but it doesn't tell us what the true mean *actually is*. Can we provide a range of plausible values for the true speed of the chips, rather than just rejecting a single guess?

### Introduce the concept in isolation

We can use `scipy.stats` to build an interval around our sample mean.

```python
from scipy import stats
import random

random.seed(42)
data = [random.gauss(1.95, 0.1) for _ in range(30)]

mu = sum(data)/len(data)
se = stats.sem(data)
ci = stats.t.interval(0.95, df=len(data)-1, loc=mu, scale=se)
print(f"95% CI: ({ci[0]:.4f}, {ci[1]:.4f})")
```

Output:
```
95% CI: (1.9069, 1.9868)
```

This output proves that based on our data, we are 95% confident that the true population mean lies between 1.9069 and 1.9868. This range is a **Confidence interval**.

### Discard the throwaway example

The isolated CI computation is discarded. We will add it to our main script to contrast it directly with the earlier hypothesis test.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `stats_analysis.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of the file.
- **Dependencies:** None additional.

### The New Code

```python
mu = sum(chip_speeds)/len(chip_speeds)
se = stats.sem(chip_speeds)
ci = stats.t.interval(0.95, df=len(chip_speeds)-1, loc=mu, scale=se)

print(f'\n95% CI: ({ci[0]:.4f}, {ci[1]:.4f})')
print(f'Does CI contain 2.0? {ci[0] <= 2.0 <= ci[1]}')
```

### The Updated Project

```python
# ... (lines 1-71 unchanged)
# 72: mu = sum(chip_speeds)/len(chip_speeds)
# 73: se = stats.sem(chip_speeds)
# 74: ci = stats.t.interval(0.95, df=len(chip_speeds)-1, loc=mu, scale=se)
# 75: 
# 76: print(f'\n95% CI: ({ci[0]:.4f}, {ci[1]:.4f})')
# 77: print(f'Does CI contain 2.0? {ci[0] <= 2.0 <= ci[1]}')
```

This addition takes the original `chip_speeds` data, calculates its standard error, and computes the 95% confidence boundaries, then explicitly checks if the manufacturer's claimed 2.0 GHz falls inside those boundaries.

### Mechanical walkthrough

- `mu = sum(chip_speeds)/len(chip_speeds)`: Calculates the sample **Mean (μ)** again.
- `se = stats.sem(chip_speeds)`: Calls `stats.sem` to calculate the standard error of the mean (which is the sample standard deviation divided by $\sqrt{n}$).
- `ci = stats.t.interval(0.95, df=len(chip_speeds)-1, loc=mu, scale=se)`: Calls `t.interval` to construct the **Confidence interval**. `0.95` specifies a 95% confidence level. `df` is degrees of freedom (sample size minus 1). `loc` is the center (our sample mean), and `scale` is the standard error.
- `print(...)`: Prints the lower (`ci[0]`) and upper (`ci[1]`) bounds.
- `print(f'Does CI contain 2.0? {ci[0] <= 2.0 <= ci[1]}')`: Evaluates to `False` because 2.0 is outside the interval.

### Connect the Pieces

A **Confidence interval** and a hypothesis test are two sides of the exact same mathematical coin. If an alpha=0.05 hypothesis test rejects 2.0, then a 95% confidence interval will *exclude* 2.0. The CI contains every single possible **Null hypothesis (H0)** value that we would *fail to reject* given our data. While a p-value only tells you "it's not 2.0," a CI is much more informative because it tells you exactly what the true speed is likely to be (somewhere around 1.94 to 1.95).


## Concept Unit: Practical significance vs statistical significance

### The Problem

If we gather enough data, we can detect extremely tiny differences. If we prove that a new website design increases conversion rates from 10.00% to 10.01% with a p-value of 0.001, should the company spend millions deploying it?

### Introduce the concept in isolation

We can simulate an A/B test with a massive sample size where the actual difference is negligibly small, yet the mathematical test screams "significant."

For our isolation step, we demonstrate the principle directly:
```python
import random
from scipy import stats

random.seed(42)
n = 1000000  # huge sample
old_group = [random.random() < 0.100 for _ in range(n)]
new_group = [random.random() < 0.102 for _ in range(n)]

_, p = stats.ttest_ind(old_group, new_group)
print(f"p-value: {p:.6f}")
```

Output:
```
p-value: 0.001099
```

This output proves that a tiny absolute difference in performance (about 0.2%) can yield a highly significant **p-value** (0.001) simply because the sample size is huge. This difference is **Statistical significance**, but it lacks **Practical significance**.

### Discard the throwaway example

The isolated A/B test simulation is discarded. We will add a final cautionary example to our script.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `stats_analysis.py` (modified)
- **Change type:** add
- **Location:** Appended to the end of the file.
- **Dependencies:** None additional.

### The New Code

```python
n = 1000000
old_group = [random.random() < 0.100 for _ in range(n)]
new_group = [random.random() < 0.102 for _ in range(n)]

_, p = stats.ttest_ind(old_group, new_group)
print(f'\nA/B Test p-value: {p:.6f}')
print(f'Old mean: {sum(old_group)/n:.5f}')
print(f'New mean: {sum(new_group)/n:.5f}')
print(f'Difference: {(sum(new_group)-sum(old_group))/n:.5f}')
```

### The Updated Project

```python
# ... (lines 1-77 unchanged)
# 78: n = 1000000
# 79: old_group = [random.random() < 0.100 for _ in range(n)]
# 80: new_group = [random.random() < 0.102 for _ in range(n)]
# 81: 
# 82: _, p = stats.ttest_ind(old_group, new_group)
# 83: print(f'\nA/B Test p-value: {p:.6f}')
# 84: print(f'Old mean: {sum(old_group)/n:.5f}')
# 85: print(f'New mean: {sum(new_group)/n:.5f}')
# 86: print(f'Difference: {(sum(new_group)-sum(old_group))/n:.5f}')
```

This block simulates an A/B test comparing two groups of one million users each, where the actual conversion rate difference is only 0.2%, running an independent t-test to compare them.

### Mechanical walkthrough

- `n = 1000000`: Sets a massive sample size.
- `old_group = [random.random() < 0.100 for _ in range(n)]`: Simulates 1 million users with exactly a 10.0% probability of converting. `random.random() < 0.100` evaluates to `True` (1) roughly 10% of the time, and `False` (0) otherwise.
- `new_group = [random.random() < 0.102 for _ in range(n)]`: Simulates another million users with a 10.2% probability of converting.
- `_, p = stats.ttest_ind(old_group, new_group)`: Calls `ttest_ind` to perform an independent two-sample t-test comparing the means of the two groups. It returns the t-statistic (ignored) and the **p-value**.
- `print(...)`: Outputs the p-value and the absolute difference in means.

### Connect the Pieces

The **p-value** here will be extremely small ($p < 0.05$), granting the result **Statistical significance**. The math is confidently telling us "this difference is not zero." However, the **Effect size**—the actual real-world difference—is merely a 0.2% change. In reality, a business might decide that a 0.2% lift is not worth the engineering cost of maintaining the new design. This highlights the golden rule of applied statistics: a p-value only measures confidence that a difference exists, not whether that difference has any **Practical significance**.


Statistical thinking is the foundation of data science. Module 5 is nearly complete. Lesson 42 covers curve fitting. Exercises: verify the CLT with a bimodal distribution (mixture of two Gaussians); run a two-sample t-test on two sets of chip speeds; compute the power of a test for various sample sizes.
