export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'stat5-005',
  slug: 'central-limit-theorem',
  chapter: 'stat5',
  order: 5,
  title: 'The Central Limit Theorem',
  subtitle: 'Why the normal distribution appears everywhere — and what it means for statistical inference.',
  tags: ['central limit theorem', 'CLT', 'sampling distribution', 'sample mean', 'standard error', 'normal approximation', 'law of large numbers'],
  aliases: 'central limit theorem CLT sampling distribution sample mean standard error SE standard error of mean LLN law of large numbers',
  timeToComplete: 35,
  coreConcept: 'The Central Limit Theorem (CLT) states that the sample mean X̄ of n independent, identically distributed observations converges to N(μ, σ²/n) as n → ∞, regardless of the original distribution. The standard error σ/√n shrinks as n grows. This is why statistical inference — confidence intervals, t-tests, z-tests — works even when the data are not normally distributed.',
  prerequisites: ['stat5-004'],
  nextLesson: 'stat6-001',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: `A factory produces bolts from a machine whose weight output has a highly skewed distribution — most bolts are light but occasionally a very heavy bolt slips through. Quality control samples 36 bolts per hour and computes the average weight. Why is that average approximately normally distributed even though individual bolt weights are not — and why does this single fact underpin almost every statistical test ever invented?`,
    realWorldContext: `The Central Limit Theorem is arguably the most important theorem in all of applied statistics. It explains why polling organizations can predict election outcomes from samples of a few thousand voters out of hundreds of millions. It explains why pharmaceutical companies can conclude whether a drug works from a clinical trial of a few hundred patients. It explains why scientists can report "plus or minus" error bars on measurements even when they have no idea what the distribution of individual errors looks like. The CLT says: take any population — skewed, bimodal, discrete, bounded, whatever — and repeatedly compute the average of a sample of n observations. As n grows, those sample averages will be normally distributed no matter what you started with. This single fact converts the study of virtually all averages and sums into the study of the normal distribution, which we already know how to analyze completely.`,
    previewVisualizationId: 'CLTSimulatorViz',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      `**Roadmap for this lesson.** By the end you will: (1) state the CLT precisely and identify its conditions; (2) compute the mean and standard error of X̄; (3) apply the CLT to find probabilities about sample means; (4) understand the Law of Large Numbers (LLN) and how it differs from the CLT; (5) know the practical sample size threshold for CLT to kick in; (6) recognize the CLT as the theoretical foundation for all of Chapter 6 (statistical inference).`,

      `**What the CLT says — informally.** Take any distribution with mean μ and finite variance σ². Draw n observations from it independently and compute their average X̄. The CLT says: as n increases, the distribution of X̄ looks more and more normal, centering at μ with standard deviation σ/√n. The shape of the original distribution becomes irrelevant — it averages away. The only things that matter are μ, σ, and n.`,

      `**Before reading on, predict:** Suppose individual observations are drawn from a highly skewed distribution (most values near 0, a few very large values). If you draw 5 observations and compute their mean, is that mean also highly skewed? What about the mean of 100 observations? 1,000? Write down your intuition before working through the simulation.`,

      `**Where the normal shape comes from.** The CLT is not magic — it has a mechanism. Each observation in the sample is a small random "push" to the running sum. Some push up, some push down. When these pushes are independent and come from the same distribution, they tend to cancel each other out. The sum of many small independent random effects, regardless of their individual shape, converges to a distribution that is symmetric about its mean and has a characteristic bell shape. This is because the moment generating function (MGF) of the sum converges to the MGF of a normal — a fact we prove in the rigor section.`,

      `**Standard error: how fast X̄ concentrates.** The standard deviation of X̄ is $\\sigma_{\\bar{X}} = \\sigma/\\sqrt{n}$ — called the **standard error** (SE). As n increases, the SE shrinks: larger samples give more precise estimates of μ. Crucially, SE scales as $1/\\sqrt{n}$, not $1/n$. To halve the standard error, you need 4× more observations. To cut it by 10×, you need 100× more observations. This "square root law" is one of the most important practical facts in statistics.`,

      `**The Law of Large Numbers vs the CLT.** The Law of Large Numbers says the sample mean X̄ converges to μ as n → ∞ (almost surely). This is about the value X̄ takes. The CLT says something different: it describes the shape of the probability distribution of X̄ for finite n. The LLN answers "where does X̄ land?" The CLT answers "how spread out and what shape is the sampling distribution of X̄?" Both are true simultaneously.`,

      `**Practical rule of thumb.** For a reasonably symmetric distribution, n = 30 is often enough for the CLT approximation to be accurate. For a heavily skewed distribution (e.g., incomes, wait times, claim sizes), you may need n = 100 or more. For a discrete distribution like a coin flip (Bernoulli), the CLT works well for np ≥ 10 and n(1−p) ≥ 10. These are rules of thumb, not theorems — checking with a simulation is always better than relying on any single threshold.`,

      `**Why the CLT underpins all of statistical inference.** When we test a hypothesis or build a confidence interval, we compare an observed test statistic (usually based on X̄ or a sum) to a reference distribution. That reference distribution is almost always the normal or something derived from it (the t-distribution, the chi-squared distribution). The justification for using those reference distributions is the CLT. Without the CLT, every data set would require its own custom mathematical analysis of its specific sampling distribution — statistical inference as we know it would not exist.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Central Limit Theorem (Informal)',
        body: `Let $X_1, X_2, \\ldots, X_n$ be i.i.d. random variables with mean $\\mu$ and finite variance $\\sigma^2$. Define the sample mean $\\bar{X}_n = \\frac{1}{n}\\sum_{i=1}^n X_i$.\n\nThen as $n \\to \\infty$:\n$$\\bar{X}_n \\xrightarrow{d} N\\!\\left(\\mu,\\, \\frac{\\sigma^2}{n}\\right)$$\n\nEquivalently, the **standardized** sample mean:\n$$Z_n = \\frac{\\bar{X}_n - \\mu}{\\sigma/\\sqrt{n}} \\xrightarrow{d} N(0, 1)$$\n\n**For any finite n**, this is an approximation. For practice: use it when n ≥ 30 for symmetric data, larger n for skewed data.`,
      },
      {
        type: 'definition',
        title: 'Standard Error of the Mean',
        body: `The **standard error** (SE) of $\\bar{X}$ is:\n$$\\text{SE} = \\frac{\\sigma}{\\sqrt{n}}$$\n\nIt measures how much $\\bar{X}$ varies from sample to sample. Key facts:\n• SE ≠ standard deviation σ (σ describes individual observations; SE describes sample means)\n• SE shrinks as n grows: 4× more data → SE halved; 100× more data → SE cut by 10\n• When σ is unknown, estimate SE with $s/\\sqrt{n}$ where $s$ is the sample standard deviation\n• Units of SE are the same as units of the data (and of σ)`,
      },
      {
        type: 'insight',
        title: 'What the CLT Does NOT Say',
        body: `Common misreadings:\n\n• **NOT:** "Large samples are normally distributed." Individual observations stay in their original distribution no matter how large n is. The CLT applies to sample means and sums, not to individual values.\n\n• **NOT:** "Any distribution with n=30 observations is approximately normal." The CLT requires n to be large relative to the skewness of the original distribution.\n\n• **NOT:** "The CLT applies to dependent observations." If observations are correlated (e.g., time series), the standard CLT does not apply. There are extensions (mixing conditions), but the basic CLT assumes independence.`,
      },
      {
        type: 'warning',
        title: 'Finite Variance Is Required',
        body: `The CLT requires that the underlying distribution has a **finite variance**. Some distributions — notably the Cauchy distribution and other heavy-tailed power laws — have infinite variance, and their sample means do not converge to normal. For example, the sample mean of Cauchy-distributed observations has the same Cauchy distribution as a single observation, no matter how large n is. In practice, this matters for financial returns and internet traffic, where extreme values can be so large that the CLT convergence is extremely slow.`,
      },
    ],
    visualizations: [
      {
        id: 'CLTSimulatorViz',
        title: 'CLT Simulator — Draw Samples, Watch the Bell Curve Emerge',
        mathBridge: `Select a non-normal population (Exponential is especially dramatic). Set n and click "Draw 200 Samples." Each press adds 200 sample means to the histogram. Watch the histogram converge to the indigo normal curve N(μ, σ²/n) — regardless of the population's original shape. Compare observed SE to the theoretical σ/√n as you add more samples.`,
        caption: `The CLT guarantee: the histogram of sample means converges to normal no matter how non-normal the original population — verified here in real time.`,
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────
  math: {
    prose: [
      `**Computing the mean and variance of X̄ exactly.** For $X_1, \\ldots, X_n$ i.i.d. with mean $\\mu$ and variance $\\sigma^2$:\n$$E[\\bar{X}] = E\\!\\left[\\frac{1}{n}\\sum_{i=1}^n X_i\\right] = \\frac{1}{n}\\sum_{i=1}^n E[X_i] = \\frac{1}{n} \\cdot n\\mu = \\mu$$\n$$\\text{Var}(\\bar{X}) = \\text{Var}\\!\\left(\\frac{1}{n}\\sum_{i=1}^n X_i\\right) = \\frac{1}{n^2}\\sum_{i=1}^n \\text{Var}(X_i) = \\frac{\\sigma^2}{n}$$\nwhere independence was used in the variance calculation (cross terms vanish). These exact results do not require the CLT — they hold for any n and any distribution with finite variance. The CLT adds the shape claim (normal).`,

      `**Proof sketch via MGFs.** Let $Y_i = (X_i - \\mu)/\\sigma$ (zero-mean, unit-variance). The MGF of $Y_i$ is $M_Y(t) = 1 + 0 \\cdot t + \\frac{1}{2}t^2 + O(t^3) = 1 + t^2/2 + O(t^3)$ near $t=0$. The standardized sample mean is $Z_n = \\frac{1}{\\sqrt{n}}\\sum_{i=1}^n Y_i$. Its MGF is $M_{Z_n}(t) = \\left[M_Y(t/\\sqrt{n})\\right]^n = \\left[1 + \\frac{t^2}{2n} + O(n^{-3/2})\\right]^n \\to e^{t^2/2}$ as $n \\to \\infty$. The limit $e^{t^2/2}$ is exactly the MGF of $N(0,1)$. Since the MGF uniquely determines the distribution, $Z_n \\to N(0,1)$ in distribution.`,

      `**Applying the CLT to a specific problem.** The sample mean $\\bar{X}$ of $n$ observations from a population with mean $\\mu$ and std $\\sigma$ is approximately $N(\\mu, \\sigma^2/n)$. To find $P(\\bar{X} \\leq c)$: standardize $z = (c - \\mu)/(\\sigma/\\sqrt{n})$ and compute $\\Phi(z)$. Example: monthly sales amounts in a store have $\\mu = \\$500$, $\\sigma = \\$120$. Average over $n=36$ months: $\\text{SE} = 120/\\sqrt{36} = 20$. $P(\\bar{X} \\leq 520) = \\Phi((520-500)/20) = \\Phi(1) \\approx 0.841$.`,

      `**The CLT for sums.** The CLT equivalently applies to the sum $S_n = \\sum_{i=1}^n X_i$. $E[S_n] = n\\mu$, $\\text{Var}(S_n) = n\\sigma^2$, $\\text{SD}(S_n) = \\sigma\\sqrt{n}$. Standardized: $(S_n - n\\mu)/(\\sigma\\sqrt{n}) \\to N(0,1)$. The sum is used when working with Binomial totals (sum of Bernoulli trials), Poisson totals (sum of Poisson arrivals), or total inventory/revenue.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'CLT in Practice: The Working Formula',
        body: `If $X_1, \\ldots, X_n$ are i.i.d. with mean $\\mu$ and standard deviation $\\sigma$, and $n$ is large enough:\n\n$$\\bar{X} \\approx N\\!\\left(\\mu,\\; \\left(\\frac{\\sigma}{\\sqrt{n}}\\right)^2\\right)$$\n\n$$P(\\bar{X} \\leq c) \\approx \\Phi\\!\\left(\\frac{c - \\mu}{\\sigma/\\sqrt{n}}\\right)$$\n\nThe **standard error** $\\sigma/\\sqrt{n}$ plays the role of $\\sigma$ in the normal formula for $\\bar{X}$.\n\nFor a sum: $P(S_n \\leq s) \\approx \\Phi\\!\\left(\\frac{s - n\\mu}{\\sigma\\sqrt{n}}\\right)$`,
      },
      {
        type: 'theorem',
        title: 'Law of Large Numbers',
        body: `**Weak LLN:** For i.i.d. $X_i$ with mean $\\mu$:\n$$\\bar{X}_n \\xrightarrow{P} \\mu \\quad \\text{as } n \\to \\infty$$\n("converges in probability" — for any $\\epsilon > 0$, $P(|\\bar{X}_n - \\mu| > \\epsilon) \\to 0$)\n\n**Strong LLN:** $\\bar{X}_n \\to \\mu$ almost surely (with probability 1).\n\n**Contrast with CLT:** The LLN says $\\bar{X}_n$ gets close to $\\mu$ (location). The CLT describes the shape and spread of the distribution of $\\bar{X}_n$ as it approaches $\\mu$. Both hold simultaneously: $\\bar{X}_n$ converges to $\\mu$ like a normal random variable with shrinking standard deviation $\\sigma/\\sqrt{n}$.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Central Limit Theorem — Python Simulation',
        initialProps: {
          initialCells: [
            {
              id: 'cell1',
              cellTitle: 'Simulating the CLT: Skewed Original Distribution',
              prose: `We'll draw samples from a highly skewed exponential distribution (mean=1, heavily right-skewed) and watch the distribution of X̄ become normal as n increases.`,
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

rng = np.random.default_rng(42)
mu_true = 1.0    # Exponential(rate=1) has mean=1, std=1
sigma_true = 1.0

n_simulations = 5000
sample_sizes = [1, 5, 30, 100]

fig, axes = plt.subplots(1, 4, figsize=(16, 4))

for ax, n in zip(axes, sample_sizes):
    # Draw n_simulations samples, each of size n
    samples = rng.exponential(scale=mu_true, size=(n_simulations, n))
    xbar = samples.mean(axis=1)   # Sample mean for each simulation

    se = sigma_true / np.sqrt(n)
    ax.hist(xbar, bins=50, density=True, color='steelblue', alpha=0.7, label=f'X̄ (n={n})')

    # Overlay the CLT normal approximation
    x = np.linspace(xbar.min(), xbar.max(), 300)
    ax.plot(x, stats.norm.pdf(x, loc=mu_true, scale=se), 'r-', linewidth=2, label='CLT N(μ, σ²/n)')

    ax.set_title(f'n = {n}\nSE = {se:.3f}')
    ax.set_xlabel('x̄')
    ax.legend(fontsize=7)
    if n == 1:
        ax.set_ylabel('Density')

fig.suptitle('CLT: Sample Means from Exponential(1) Distribution', y=1.02)
plt.tight_layout()
plt.show()

print("Original distribution: Exponential(rate=1)")
print(f"Mean = {mu_true},  Std = {sigma_true}")
print()
for n in sample_sizes:
    samples = rng.exponential(scale=mu_true, size=(n_simulations, n))
    xbar = samples.mean(axis=1)
    print(f"n={n:4d}: X̄ mean = {xbar.mean():.4f}  (true: {mu_true})   "
          f"X̄ std = {xbar.std():.4f}  (CLT: {sigma_true/np.sqrt(n):.4f})")`,
            },
            {
              id: 'cell2',
              cellTitle: 'Standard Error and Sample Size',
              prose: `The standard error shrinks as 1/√n. We'll visualize this relationship and compute the n needed to achieve a target SE.`,
              code: `import numpy as np
import matplotlib.pyplot as plt

sigma = 15   # e.g., IQ score standard deviation

n_values = np.arange(1, 1001)
se_values = sigma / np.sqrt(n_values)

fig, axes = plt.subplots(1, 2, figsize=(12, 4))

axes[0].plot(n_values, se_values, 'b-', linewidth=2)
axes[0].set_xlabel('Sample size n')
axes[0].set_ylabel('Standard Error (σ/√n)')
axes[0].set_title('SE vs n  (σ = 15)')
axes[0].axhline(1.5, color='red', linestyle='--', label='SE = 1.5')
axes[0].legend()

axes[1].loglog(n_values, se_values, 'b-', linewidth=2)
axes[1].set_xlabel('Sample size n (log scale)')
axes[1].set_ylabel('Standard Error (log scale)')
axes[1].set_title('Log-Log Plot: SE = σ/√n  (slope = −0.5)')

plt.tight_layout()
plt.show()

# Table: n needed for target SE
print(f"σ = {sigma}")
print(f"{'Target SE':>12}  {'n needed':>10}  {'Relative to SE=5':>18}")
print("-" * 45)
target_SEs = [5, 3, 2, 1.5, 1, 0.5]
n_base = (sigma / 5) ** 2
for target in target_SEs:
    n_needed = (sigma / target) ** 2
    print(f"{target:>12.1f}  {int(np.ceil(n_needed)):>10}  {n_needed/n_base:>18.1f}x")`,
            },
            {
              id: 'cell3',
              cellTitle: 'CLT Application: Probability for Sample Means',
              prose: `Using the CLT to answer probability questions about sample means — the template you will use in every hypothesis test and confidence interval.`,
              code: `import numpy as np
from scipy import stats

# Problem: Monthly sales ~ some skewed distribution
# μ = $2500, σ = $800
# n = 64 months sampled
# What is P(X̄ > $2600)?  P($2400 < X̄ < $2600)?

mu = 2500
sigma = 800
n = 64
se = sigma / np.sqrt(n)

print(f"Population: μ = \${mu}, σ = \${sigma}")
print(f"Sample size: n = {n}")
print(f"Standard Error: SE = σ/√n = {se:.2f}")
print()

# P(X̄ > 2600)
z1 = (2600 - mu) / se
p1 = 1 - stats.norm.cdf(z1)
print(f"P(X̄ > 2600): z = (2600 - {mu}) / {se:.2f} = {z1:.4f}")
print(f"             P(Z > {z1:.4f}) = {p1:.4f}")
print()

# P(2400 < X̄ < 2600)
z_low = (2400 - mu) / se
z_high = (2600 - mu) / se
p2 = stats.norm.cdf(z_high) - stats.norm.cdf(z_low)
print(f"P(2400 < X̄ < 2600): z = [{z_low:.4f}, {z_high:.4f}]")
print(f"                     P = {p2:.4f}")
print()

# Inverse: find x̄ exceeded only 5% of the time
x_95 = stats.norm.ppf(0.95, loc=mu, scale=se)
print(f"95th percentile of X̄ = \${x_95:.2f}")
print(f"(Only 5% of samples of n={n} will have X̄ > \${x_95:.2f})")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              cellTitle: 'Challenge: Dice Sum Distribution',
              prose: `The sum of n standard six-sided dice has mean n×3.5 and variance n×35/12.

**Task:**
1. Simulate rolling 5 dice 10,000 times and plot the distribution of the sum.
2. Overlay the CLT normal approximation.
3. Repeat for n=1, 2, 5, 20 in a 2×2 grid.
4. At what n does the distribution look "normal enough" to your eye?

(Hint: np.random.randint(1,7,size=(n_simulations, n)).sum(axis=1))`,
              starterCode: `import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

rng = np.random.default_rng(0)
n_simulations = 10000

# Single die: mean=3.5, var=35/12
mu_die = 3.5
var_die = 35/12

n_values = [1, 2, 5, 20]
fig, axes = plt.subplots(2, 2, figsize=(12, 8))

for ax, n in zip(axes.flat, n_values):
    # Roll n dice, sum them
    sums = # rng.integers(1, 7, size=(n_simulations, n)).sum(axis=1)

    mu_sum = # n * mu_die
    sigma_sum = # np.sqrt(n * var_die)

    ax.hist(sums, bins=range(n, 6*n+2), density=True, alpha=0.7, color='steelblue')

    # Overlay CLT normal
    x = # your code here
    ax.plot(x, stats.norm.pdf(x, loc=mu_sum, scale=sigma_sum), 'r-', linewidth=2)
    ax.set_title(f'Sum of n={n} dice')
    ax.set_xlabel('Sum')

plt.suptitle('CLT: Sum of n Dice Approaches Normal')
plt.tight_layout()
plt.show()`,
              solution: `import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

rng = np.random.default_rng(0)
n_simulations = 10000
mu_die = 3.5
var_die = 35/12

n_values = [1, 2, 5, 20]
fig, axes = plt.subplots(2, 2, figsize=(12, 8))

for ax, n in zip(axes.flat, n_values):
    sums = rng.integers(1, 7, size=(n_simulations, n)).sum(axis=1)
    mu_sum = n * mu_die
    sigma_sum = np.sqrt(n * var_die)
    ax.hist(sums, bins=range(n, 6*n+2), density=True, alpha=0.7, color='steelblue', label='Simulated')
    x = np.linspace(mu_sum - 4*sigma_sum, mu_sum + 4*sigma_sum, 400)
    ax.plot(x, stats.norm.pdf(x, loc=mu_sum, scale=sigma_sum), 'r-', linewidth=2, label='CLT Normal')
    ax.set_title(f'Sum of n={n} dice  (μ={mu_sum:.1f}, σ={sigma_sum:.2f})')
    ax.set_xlabel('Sum')
    ax.legend(fontsize=8)

plt.suptitle('CLT: Sum of n Dice Approaches Normal')
plt.tight_layout()
plt.show()`,
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Central Limit Theorem — MATLAB/Octave',
        initialProps: {
          initialCells: [
            {
              id: 'mat1',
              cellTitle: 'CLT Simulation in MATLAB',
              prose: `MATLAB simulation of the CLT: sampling from an exponential distribution and watching sample means become normal.`,
              code: `pkg load statistics
% CLT Simulation — Exponential Distribution
rng(42);
n_sims = 5000;
n_values = [1, 5, 30, 100];
mu_true = 1; sigma_true = 1;

figure;
for k = 1:length(n_values)
    n = n_values(k);
    samples = exprnd(mu_true, n_sims, n);  % n_sims rows, n columns
    xbar = mean(samples, 2);               % row means

    se = sigma_true / sqrt(n);

    subplot(1, 4, k);
    histogram(xbar, 50, 'Normalization', 'pdf', 'FaceColor', [0.3 0.5 0.8], 'FaceAlpha', 0.7);
    hold on;
    x_grid = linspace(min(xbar), max(xbar), 200);
    plot(x_grid, normpdf(x_grid, mu_true, se), 'r-', 'LineWidth', 2);
    title(sprintf('n = %d\\nSE = %.3f', n, se));
    xlabel('x̄');
    if k == 1; ylabel('Density'); end

    fprintf('n=%4d: mean(X̄)=%.4f  std(X̄)=%.4f  CLT SE=%.4f\\n', ...
            n, mean(xbar), std(xbar), se);
end
sgtitle('CLT: X̄ from Exponential(1) Distribution');`,
            },
            {
              id: 'mat2',
              cellTitle: 'Standard Error and Probability Calculations',
              prose: `Using the CLT to compute probabilities about sample means — the MATLAB workflow you will use in stat6.`,
              code: `% CLT probability calculations
mu = 2500;   sigma = 800;   n = 64;
se = sigma / sqrt(n);

fprintf('SE = sigma/sqrt(n) = %.2f\\n\\n', se);

% P(X̄ > 2600)
z1 = (2600 - mu) / se;
p1 = 1 - normcdf(z1, 0, 1);
fprintf('P(X̄ > 2600) = 1 - normcdf(%.4f) = %.4f\\n', z1, p1);

% P(2400 < X̄ < 2600)
z_low = (2400 - mu) / se;
z_high = (2600 - mu) / se;
p2 = normcdf(z_high) - normcdf(z_low);
fprintf('P(2400 < X̄ < 2600) = %.4f\\n', p2);

% 95th percentile of X̄
x_95 = norminv(0.95, mu, se);
fprintf('95th percentile of X̄ = $%.2f\\n', x_95);

% SE vs n plot
n_vals = 1:500;
figure;
plot(n_vals, sigma ./ sqrt(n_vals), 'b-', 'LineWidth', 2);
xlabel('Sample size n');
ylabel('Standard Error');
title(sprintf('SE = %g / sqrt(n)', sigma));
yline(se, 'r--', sprintf('SE=%.1f at n=%d', se, n));
grid on;`,
            },
          ],
        },
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────
  rigor: {
    prose: [
      `**Berry-Esseen theorem: quantifying the CLT rate.** The CLT is an asymptotic result — it says the distribution converges but not how fast. The Berry-Esseen theorem gives an explicit bound: $\\sup_z |P(Z_n \\leq z) - \\Phi(z)| \\leq \\frac{C \\rho}{\\sigma^3 \\sqrt{n}}$ where $\\rho = E[|X - \\mu|^3]$ is the third absolute moment and $C \\approx 0.4748$. The key message: the rate of convergence is $O(1/\\sqrt{n})$ — and it slows down when the distribution has large skewness (large $\\rho/\\sigma^3$). Highly skewed distributions require much larger n for the CLT to be accurate.`,

      `**When the CLT fails: heavy tails and Cauchy distribution.** The Cauchy distribution has PDF $f(x) = 1/(\\pi(1+x^2))$. Its mean and variance are undefined (diverge). The sample mean of n Cauchy observations has the same Cauchy distribution as a single observation — no convergence, ever. The Cauchy is a member of the stable distributions (Lévy-stable), which generalize the normal: for these distributions, sums converge to a stable distribution that may not be normal. In practice, financial returns and internet traffic can exhibit this behavior, which is why "fat-tailed" risk models (like Taleb's black swans) differ fundamentally from normal-distribution assumptions.`,

      `**Lyapunov and Lindeberg conditions: beyond i.i.d.** The classical CLT assumes observations are identically distributed. The Lindeberg CLT generalizes this: if the $X_i$ are independent (not necessarily identically distributed) and satisfy the Lindeberg condition (no single observation dominates the sum), then the standardized sum still converges to $N(0,1)$. This is crucial for regression theory: the residuals in a regression model are not identically distributed, but under Lindeberg conditions the least-squares estimator is still asymptotically normal — the basis for valid t-tests and F-tests in regression.`,
    ],
  },

  // ── Examples ──────────────────────────────────────────────────
  examples: [
    {
      title: 'Quality Control: Probability a Batch Average Is Out of Spec',
      steps: [
        `**Setup.** A machine fills cans with a mean of 355 mL and SD of 8 mL. An inspector measures a random sample of n=16 cans and computes the average fill. What is the probability the average is below 350 mL?`,
        `**Apply CLT.** With n=16: SE = 8/√16 = 2 mL. By CLT, X̄ ≈ N(355, 2²).`,
        `**Standardize.** z = (350 − 355)/2 = −2.5. P(X̄ < 350) = Φ(−2.5) ≈ 0.0062.`,
        `**Interpret.** There is about a 0.62% chance the sample average is below 350 mL if the machine is working correctly. If the inspector observes an average below 350, it is strong evidence the machine is off — this is the logic of a hypothesis test.`,
      ],
      annotations: [
        `SE = σ/√n = 8/4 = 2. Individual measurements vary by ±8 mL, but the average of 16 varies by only ±2 mL.`,
        `A z-score of −2.5 is far from the mean: the 0.62% probability makes this an unusual event if μ = 355.`,
        `This exact setup recurs in stat6-002 as a one-sample z-test.`,
      ],
    },
    {
      title: 'Insurance: Total Claims in a Portfolio',
      steps: [
        `**Setup.** An insurance portfolio has 500 policies. Each policy has a random annual claim with mean $800 and SD $1200. What is the probability total annual claims exceed $450,000?`,
        `**CLT for the sum.** $S_{500} = \\sum_{i=1}^{500} X_i$. $E[S] = 500 \\times 800 = 400{,}000$. $\\text{SD}(S) = 1200\\sqrt{500} \\approx 26{,}833$.`,
        `**Standardize.** z = (450,000 − 400,000)/26,833 ≈ 1.863. P(S > 450,000) = 1 − Φ(1.863) ≈ 0.031.`,
        `**Interpret.** There is about a 3.1% chance total claims exceed $450,000. An insurer pricing at $900/policy (total premium $450,000) would be operating with only a 3.1% chance of a loss year — under the CLT model. (Real insurance uses heavier-tailed models for large claims.)`,
      ],
      annotations: [
        `SD(sum of n variables) = σ√n, not σ/√n. The sum grows with n; the average shrinks with n.`,
        `CLT for sums: standardize using E[S] = nμ and SD(S) = σ√n.`,
        `The 3.1% probability (approximately 1-in-32 years) is the "Value at Risk" concept used in actuarial science.`,
      ],
    },
  ],

  // ── Challenges ────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1',
      difficulty: 'easy',
      problem: `A university entrance exam is taken by a large population with mean score 520 and SD 80. A random sample of 100 students is drawn.\n\n(a) What is the standard error of the sample mean?\n(b) What is P(X̄ > 535)?\n(c) What sample size would reduce the SE to 4 points?`,
      walkthrough: [
        `(a) SE = 80/√100 = **8**.\n\n(b) z = (535 − 520)/8 = 1.875. P(X̄ > 535) = 1 − Φ(1.875) ≈ **0.030**.\n\n(c) SE = σ/√n = 4 → n = (σ/SE)² = (80/4)² = 400. Need **n = 400** students.`,
      ]
    },
    {
      id: 'ch2',
      difficulty: 'medium',
      problem: `Website visit durations follow an exponential distribution with mean 2 minutes (highly right-skewed). You sample n=50 visits.\n\n(a) What are E[X̄] and SD(X̄)? (For Exponential(rate=1/2): mean=2, SD=2.)\n(b) Use the CLT to approximate P(1.7 ≤ X̄ ≤ 2.3).\n(c) If instead n=4, would you trust the CLT approximation? Why or why not?`,
      walkthrough: [
        `(a) E[X̄] = μ = **2 minutes**. SD(X̄) = σ/√n = 2/√50 = **0.283 minutes**.\n\n(b) z_low = (1.7 − 2)/0.283 ≈ −1.06, z_high = (2.3 − 2)/0.283 ≈ 1.06. P = 2Φ(1.06) − 1 ≈ 2(0.8554) − 1 = **0.711**.\n\n(c) With n=4 from an exponential distribution, the CLT approximation would be poor. The exponential has a skewness of 2 (very right-skewed), and the Berry-Esseen theorem implies convergence is slow for high skewness. The Berry-Esseen bound gives an error of order 2/(1·√4) = 1, which is not useful. In practice, you would need a simulation or exact distribution theory for such small samples.`,
      ]
    },
    {
      id: 'ch3',
      difficulty: 'hard',
      problem: `**Sum of a large number of fair coin flips.** Let $X_i \\sim \\text{Bernoulli}(0.5)$ for $i=1,\\ldots,400$. Let $S = \\sum X_i$ (total heads).\n\n(a) Find E[S] and SD(S).\n(b) Use the CLT with continuity correction to find P(S = 200) and compare to the exact binomial.\n(c) Find P(195 ≤ S ≤ 205) both ways.\n(d) Find the symmetric interval around 200 that captures 90% of the probability using the CLT.`,
      walkthrough: [
        `(a) E[S] = np = 200. SD(S) = √(np(1−p)) = √100 = **10**.\n\n(b) Exact: Binom.pmf(200, 400, 0.5) ≈ 0.03989. CLT with continuity: P(199.5 ≤ Y ≤ 200.5) = Φ(0.05) − Φ(−0.05) ≈ 2(0.5199) − 1 = 0.0398. Excellent agreement.\n\n(c) Exact: Binom.cdf(205,400,.5) − Binom.cdf(194,400,.5) ≈ 0.5161. CLT: P(194.5 ≤ Y ≤ 205.5) = Φ(0.55) − Φ(−0.55) = 2Φ(0.55) − 1 ≈ 2(0.7088) − 1 = 0.4176. Without CC: Φ(0.5) − Φ(−0.5) = 0.3829. The continuity correction (using 194.5 and 205.5) gives much better agreement with exact.\n\n(d) 90th percentile of N(200, 100): z = 1.645, half-interval = 1.645×10 = 16.45. Interval: [200−16.45, 200+16.45] = **[183.55, 216.45]**.`,
      ]
    },
  ],

  // ── Quiz ──────────────────────────────────────────────────────
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: `The Central Limit Theorem applies to the distribution of which quantity?`,
      options: [
        `Individual observations from a large sample`,
        `The sample mean X̄ of n i.i.d. observations`,
        `The median of a normal distribution`,
        `The maximum of n observations`,
      ],
      answer: `The sample mean X̄ of n i.i.d. observations`,
      hints: [
        `The CLT is specifically about averages (and sums), not individual observations.`,
        `Individual observations remain in their original distribution regardless of n.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q2',
      type: 'choice',
      text: `A population has σ = 20. A sample of n = 100 is drawn. What is the standard error of X̄?`,
      options: [`20`, `2`, `0.2`, `200`],
      answer: `2`,
      hints: [
        `SE = σ/√n = 20/√100 = 20/10 = 2.`,
        `The SE is σ divided by the square root of n, not by n.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q3',
      type: 'choice',
      text: `You quadruple the sample size from n = 25 to n = 100. What happens to the standard error?`,
      options: [
        `SE is halved (divided by 2)`,
        `SE is quartered (divided by 4)`,
        `SE is multiplied by 4`,
        `SE is unchanged`,
      ],
      answer: `SE is halved (divided by 2)`,
      hints: [
        `SE = σ/√n. If n multiplies by 4, √n multiplies by 2, so SE is divided by 2.`,
        `SE scales as 1/√n, not 1/n.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q4',
      type: 'choice',
      text: `Which condition does the CLT require of the underlying population?`,
      options: [
        `The population must be normally distributed`,
        `The population must be symmetric`,
        `The population must have a finite mean and finite variance`,
        `The population must be continuous`,
      ],
      answer: `The population must have a finite mean and finite variance`,
      hints: [
        `The CLT's power is that it applies to any distribution, as long as μ and σ² are finite.`,
        `If variance is infinite (like the Cauchy distribution), the CLT fails.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q5',
      type: 'choice',
      text: `Individual orders at a restaurant have mean $18 and SD $6. For a random sample of 36 orders, what is the approximate probability the average order exceeds $19?`,
      options: [
        `About 0.159`,
        `About 0.317`,
        `About 0.023`,
        `About 0.841`,
      ],
      answer: `About 0.159`,
      hints: [
        `SE = 6/√36 = 1. z = (19 − 18)/1 = 1. P(X̄ > 19) = 1 − Φ(1) ≈ 1 − 0.841 = 0.159.`,
        `P(Z > 1) ≈ 0.159 from the standard normal table (or the 68% rule: 16% in each tail beyond 1σ).`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q6',
      type: 'choice',
      text: `The Law of Large Numbers and the Central Limit Theorem both describe the behavior of X̄ as n grows. What is the key difference?`,
      options: [
        `The LLN applies only to normal distributions; the CLT applies to all distributions.`,
        `The LLN says X̄ converges to μ in value; the CLT describes the shape and spread of the distribution of X̄.`,
        `The LLN requires larger n than the CLT.`,
        `The CLT applies only when σ is known; the LLN works with unknown σ.`,
      ],
      answer: `The LLN says X̄ converges to μ in value; the CLT describes the shape and spread of the distribution of X̄.`,
      hints: [
        `LLN = where X̄ lands (converges to μ). CLT = what shape the distribution of X̄ has as it converges.`,
        `Both hold simultaneously: X̄ → μ while its distribution becomes N(μ, σ²/n).`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q7',
      type: 'choice',
      text: `A population has μ=50 and σ=12. For a sample of n=144, the standard error of X̄ is:`,
      options: [`1`, `12`, `0.5`, `144`],
      answer: `1`,
      hints: [
        `SE = σ/√n = 12/√144 = 12/12 = 1.`,
        `A sample of n=144 reduces the standard error to just 1 unit — 12× smaller than the population SD.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q8',
      type: 'choice',
      text: `Which of these is NOT a requirement for the CLT to apply?`,
      options: [
        `Observations are i.i.d. (independent and identically distributed)`,
        `The population has finite mean and variance`,
        `The population is normally distributed`,
        `n is sufficiently large`,
      ],
      answer: `The population is normally distributed`,
      hints: [
        `The CLT applies to ANY distribution with finite mean and variance — normality of the population is not required.`,
        `The power of the CLT is precisely that it works even for non-normal populations.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q9',
      type: 'choice',
      text: `For a heavy-tailed or highly skewed population, approximately what n is needed before the CLT gives a reliable normal approximation for X̄?`,
      options: [`n ≥ 5`, `n ≥ 30`, `n ≥ 100 or more`, `n ≥ 10`],
      answer: `n ≥ 100 or more`,
      hints: [
        `n ≥ 30 is the rule for mildly non-normal populations. Heavy tails or strong skew require larger n.`,
        `For very heavy-tailed distributions (excess kurtosis > 3), n ≥ 100 or more is safer.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q10',
      type: 'choice',
      text: `According to the CLT, the sampling distribution of X̄ has:`,
      options: [
        `Mean = 0, variance = 1`,
        `Mean = μ, variance = σ²/n`,
        `Mean = X̄, variance = s²`,
        `Mean = μ, variance = σ²`,
      ],
      answer: `Mean = μ, variance = σ²/n`,
      hints: [
        `X̄ is centered at the population mean μ (unbiased).`,
        `The variance of X̄ is σ²/n — shrinks as n grows. SE = σ/√n.`,
      ],
      reviewSection: `math`,
    },
  ],

  // ── Checkpoints ───────────────────────────────────────────────
  checkpoints: [
    `Stated the CLT and identified its two conditions (i.i.d., finite variance)`,
    `Computed the standard error σ/√n for a given n`,
    `Used the CLT formula to find P(X̄ ≤ c) for a specific problem`,
    `Distinguished between SD (describes individual observations) and SE (describes sample means)`,
    `Explained the 1/√n scaling law and computed required n for a target SE`,
    `Stated the difference between the Law of Large Numbers and the CLT`,
  ],

  // ── Semantics ─────────────────────────────────────────────────
  semantics: {
    coreSymbols: [
      { symbol: `X̄`, meaning: `Sample mean of n observations: (1/n)∑Xᵢ` },
      { symbol: `SE`, meaning: `Standard error of the mean: σ/√n (or s/√n when σ unknown)` },
      { symbol: `σ/√n`, meaning: `Standard deviation of the sampling distribution of X̄` },
      { symbol: `i.i.d.`, meaning: `Independent and identically distributed — the CLT's main assumption` },
      { symbol: `→d`, meaning: `Converges in distribution (the type of convergence in the CLT)` },
      { symbol: `→P`, meaning: `Converges in probability (the type of convergence in the LLN)` },
    ],
    rulesOfThumb: [
      `The SE is σ divided by √n, not by n — halving SE requires 4× more data.`,
      `n ≥ 30 is often enough for the CLT, but skewed distributions need larger n.`,
      `Individual observations do NOT become normal with large n — only averages do.`,
      `The CLT requires finite variance; it fails for Cauchy and other heavy-tailed distributions.`,
      `In practice, always check: are observations independent? Is the distribution reasonably symmetric for your n?`,
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────
  spiral: {
    recovery: `If you are confused about why SD(X̄) = σ/√n, re-read the math section's first prose paragraph. The key step is Var(1/n × sum) = (1/n²) × n × σ² = σ²/n, which uses the independence of observations. If that step is clear, the rest follows.`,
    links: [
      {
        lessonId: `stat6-001`,
        relationship: `Statistical inference (next chapter) is built on the CLT. Confidence intervals use μ ± z*(σ/√n) and hypothesis tests use z = (X̄ − μ₀)/(σ/√n) — both are direct applications of the CLT formula from this lesson.`,
      },
      {
        lessonId: `stat6-002`,
        relationship: `The t-test uses t = (X̄ − μ₀)/(s/√n) — identical to the CLT z-score but with sample SD s replacing population σ. The t-distribution (rather than normal) accounts for the extra uncertainty in estimating σ.`,
      },
      {
        lessonId: `stat7-001`,
        relationship: `In linear regression, the sampling distribution of the slope estimate β̂ is approximately normal by CLT extensions — which is why regression output includes SE(β̂) and t-statistics.`,
      },
    ],
  },

  // ── Mastery ───────────────────────────────────────────────────
  mastery: {
    badge: `Central Limit Theorem`,
    description: `You understand why the normal distribution appears everywhere, can compute the standard error for any sample size, apply the CLT to find probabilities about sample means, and know both the power and the limits of the theorem.`,
  },

  // ── Definitions ───────────────────────────────────────────────
  definitions: [
    {
      term: `Central Limit Theorem`,
      definition: `The theorem stating that the sample mean of n i.i.d. observations from any distribution with finite variance is approximately N(μ, σ²/n) for large n.`,
      symbol: `CLT`,
    },
    {
      term: `Standard error`,
      definition: `The standard deviation of the sampling distribution of a statistic. For the sample mean: SE = σ/√n. Measures how much the sample mean varies from sample to sample.`,
      symbol: `SE`,
    },
    {
      term: `Sampling distribution`,
      definition: `The probability distribution of a statistic (like X̄) computed from repeated random samples of size n from a population.`,
      symbol: null,
    },
    {
      term: `Law of Large Numbers`,
      definition: `The theorem stating that the sample mean X̄ converges to the population mean μ as n → ∞. The LLN describes convergence in value; the CLT describes convergence in distribution.`,
      symbol: `LLN`,
    },
    {
      term: `i.i.d.`,
      definition: `Independent and identically distributed. The standard assumption for the CLT: each observation is drawn independently from the same distribution.`,
      symbol: null,
    },
  ],
};
