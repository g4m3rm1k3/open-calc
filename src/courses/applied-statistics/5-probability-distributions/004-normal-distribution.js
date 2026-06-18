export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'stat5-004',
  slug: 'normal-distribution',
  chapter: 'stat5',
  order: 4,
  title: 'The Normal Distribution',
  subtitle: 'The bell curve that shows up everywhere — and why.',
  tags: ['normal distribution', 'Gaussian', 'bell curve', 'z-score', 'standardization', 'PDF', 'CDF', '68-95-99.7', 'standard normal'],
  aliases: 'normal distribution bell curve Gaussian z-score standard normal PDF CDF standardization 68-95-99.7 rule sigma',
  timeToComplete: 35,
  coreConcept: 'The Normal(μ,σ²) distribution describes continuous data concentrated symmetrically around a mean μ with spread σ. Its PDF is f(x) = (1/σ√2π)e^(−(x−μ)²/2σ²). The 68-95-99.7 rule pins probabilities to multiples of σ. Any normal can be standardized to Z=(X−μ)/σ ~ N(0,1), allowing a single z-table to solve all normal probability questions.',
  prerequisites: ['stat5-001', 'stat5-002', 'stat5-003'],
  nextLesson: 'stat5-005',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: 'Heights of adult men in the US have a mean of 69.1 inches and a standard deviation of 2.9 inches. What fraction of men are between 66.2 and 72 inches tall — and why does the exact same mathematical formula also describe the distribution of IQ scores, measurement errors in physics experiments, and the daily returns of a stock index?',
    realWorldContext: `The normal distribution — the bell curve — is the most important probability distribution in all of statistics. Heights, weights, blood pressure readings, standardized test scores, manufacturing tolerances, daily temperature anomalies, and small random errors in scientific measurements all follow, at least approximately, a normal distribution. The Central Limit Theorem (next lesson) explains why: whenever a measurement is the sum of many small, independent random factors, the result is approximately normal regardless of the distribution of those individual factors. Once you master the normal distribution, you can: compute confidence intervals for survey results, interpret z-scores on standardized tests, set quality-control limits in manufacturing, price stock options with the Black-Scholes formula, and understand why "how many standard deviations from the mean" is a universal language across every quantitative field.`,
    previewVisualizationId: 'NormalDistributionViz',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      `**Roadmap for this lesson.** By the end you will be able to: (1) identify the two parameters μ and σ and describe how each shapes the bell curve; (2) state and apply the 68-95-99.7 rule; (3) convert any normal probability to a z-score question using Z = (X − μ)/σ; (4) use a z-table (or Python/MATLAB) to find P(X ≤ x), P(X > x), and P(a ≤ X ≤ b); (5) find the x-value corresponding to a given percentile (inverse normal).`,

      `**What makes a bell curve a bell curve.** The normal distribution is fully determined by two numbers: its mean μ (the center of the bell) and its standard deviation σ (the width). Larger σ → flatter, wider bell. Smaller σ → taller, narrower bell. The curve is perfectly symmetric about μ: P(X > μ + c) = P(X < μ − c) for any c. The tails extend infinitely in both directions but the area under the entire curve equals 1, because every normal distribution is a valid probability distribution.`,

      `**Before reading on, predict:** If a set of measurements has μ = 100 and σ = 15 (IQ scores), roughly what fraction of values fall between 85 and 115? Between 70 and 130? Write your guesses before seeing the 68-95-99.7 rule.`,

      `**The 68-95-99.7 rule.** This is the most important fact about the normal distribution for everyday use. For any Normal(μ, σ²): approximately 68% of values fall within 1σ of the mean (between μ−σ and μ+σ); approximately 95% fall within 2σ; approximately 99.7% fall within 3σ. For IQ scores (μ=100, σ=15): 68% of people score between 85 and 115; 95% score between 70 and 130; nearly everyone (99.7%) scores between 55 and 145. Only 0.3% — about 3 in 1,000 — score above 145 or below 55.`,

      `**Z-scores: a universal measuring stick.** The z-score of an observation x is Z = (x − μ)/σ. It answers: "How many standard deviations above or below the mean is this value?" A z-score of +2 means 2σ above the mean; −1.5 means 1.5σ below. Z-scores let you compare across different scales: a height of 74 inches on a distribution with μ=69, σ=3 gives Z = (74−69)/3 ≈ 1.67, the same number as a test score of 133 on a distribution with μ=100, σ=20. Both values sit at the same relative position in their respective distributions.`,

      `**The standard normal distribution.** When X ~ Normal(μ, σ²), the standardized variable Z = (X − μ)/σ follows the Standard Normal distribution, written Z ~ N(0, 1). This is a normal distribution with mean 0 and standard deviation 1. The reason this matters: all normal probability calculations reduce to finding areas under the N(0,1) curve, which are tabulated in z-tables or computed by software with a single function call (scipy.stats.norm.cdf in Python, normcdf in MATLAB). You never need a separate table for each possible μ and σ.`,

      `**From z-score to probability and back.** P(X ≤ x) for X ~ N(μ,σ²): compute z = (x−μ)/σ, then look up Φ(z) where Φ is the standard normal CDF. P(a ≤ X ≤ b) = Φ((b−μ)/σ) − Φ((a−μ)/σ). The inverse problem: given a probability p, find the x such that P(X ≤ x) = p. Compute the p-th quantile of N(0,1) — call it z* — then x = μ + z*σ. For example, the 95th percentile of N(μ,σ²) is μ + 1.645σ (because Φ(1.645) ≈ 0.95).`,

      `**Normal approximation to the Binomial.** When n is large and p is not too close to 0 or 1, X ~ Binomial(n,p) is approximately Normal(np, np(1−p)). The rule of thumb: use the approximation when np ≥ 10 and n(1−p) ≥ 10. With a continuity correction, P(X = k) ≈ P(k − 0.5 ≤ Y ≤ k + 0.5) where Y ~ Normal(np, np(1−p)). This was the main computational tool before computers made exact binomial calculations cheap; understanding it also gives geometric intuition for why the CLT works.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Normal Distribution',
        body: `A continuous random variable X follows Normal(μ, σ²) if its PDF is:\n\n$$f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}\\exp\\!\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right), \\quad x \\in (-\\infty, +\\infty)$$\n\nParameters:\n• μ = mean (center of symmetry)\n• σ² = variance; σ = standard deviation (controls width)\n\nKey facts:\n• E[X] = μ, Var(X) = σ², median = mode = μ\n• Symmetric about μ: f(μ+c) = f(μ−c)\n• The PDF is maximized at x = μ (the peak of the bell)\n• P(X = any single value) = 0; probabilities = areas under the curve`,
      },
      {
        type: 'procedure',
        title: 'Procedure: Normal Probability Calculation',
        body: `To find P(a ≤ X ≤ b) for X ~ N(μ, σ²):\n\n1. Standardize both endpoints: z_a = (a − μ)/σ, z_b = (b − μ)/σ\n2. Look up or compute Φ(z_b) and Φ(z_a) (standard normal CDF)\n3. P(a ≤ X ≤ b) = Φ(z_b) − Φ(z_a)\n\nSpecial cases:\n• P(X ≤ b) = Φ((b − μ)/σ)\n• P(X > a) = 1 − Φ((a − μ)/σ)\n• P(|X − μ| ≤ kσ) = Φ(k) − Φ(−k) = 2Φ(k) − 1\n\nInverse (finding a percentile):\n• x = μ + z*σ where z* = Φ⁻¹(p)`,
      },
      {
        type: 'insight',
        title: 'The 68-95-99.7 Rule',
        body: `For X ~ Normal(μ, σ²):\n\n• P(μ − σ < X < μ + σ) ≈ **0.6827** (≈ 68%)\n• P(μ − 2σ < X < μ + 2σ) ≈ **0.9545** (≈ 95%)\n• P(μ − 3σ < X < μ + 3σ) ≈ **0.9973** (≈ 99.7%)\n\nConversely:\n• 16% of values exceed μ + σ (because 68% are within 1σ, 32% outside, 16% on each tail)\n• 2.5% of values exceed μ + 2σ\n• 0.15% exceed μ + 3σ\n\nIn quality control, a "6-sigma process" means defects are more than 6σ from the target — essentially impossible under a normal model.`,
      },
      {
        type: 'warning',
        title: 'Normal Tails Are Thin — But Not Zero',
        body: `The normal distribution assigns nonzero probability to every real number, including extreme values. In practice, the rule "basically impossible beyond 3σ" is a good heuristic but not exact. Many real-world phenomena have **fat tails** (more extreme events than the normal predicts) — stock market returns, earthquake magnitudes, internet traffic — where the normal model underestimates catastrophic events. When the stakes involve rare tail events, consider heavier-tailed distributions (Student's t, log-normal, Pareto).`,
      },
    ],
    visualizations: [
      {
        id: 'NormalDistributionViz',
        title: 'Normal Distribution — Interactive μ and σ Explorer',
        mathBridge: `Drag the μ slider to shift the bell curve left and right. Drag σ to make it wider or narrower. Click the ±1σ, ±2σ, ±3σ buttons to shade the area within each band — the percentages 68%, 95%, 99.7% are the empirical rule. Increasing σ flattens and widens the curve while conserving total area = 1.`,
        caption: `The 68-95-99.7 rule holds for any Normal distribution regardless of μ or σ — it is a shape property, not a location property.`,
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────
  math: {
    prose: [
      `**The PDF and its key properties.** The normal PDF $f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-(x-\\mu)^2/(2\\sigma^2)}$ has two crucial features. First, $(x-\\mu)^2$ in the exponent makes the function symmetric about μ and decaying away from μ — the further x is from the mean, the smaller the probability density. Second, the factor $e^{-z^2/2}$ decays extremely fast for large $|z|$: at $z = 4$ the density is $e^{-8} \\approx 0.00034$ of its maximum. The $1/(\\sigma\\sqrt{2\\pi})$ normalization constant ensures the total area equals 1 for every μ and σ.`,

      `**The CDF and the erf function.** The CDF of the standard normal is $\\Phi(z) = \\int_{-\\infty}^{z} \\frac{1}{\\sqrt{2\\pi}}e^{-t^2/2}\\,dt$. This integral has no closed form in elementary functions — it cannot be expressed using polynomials, logs, or trigonometric functions. It is computed via the error function: $\\Phi(z) = \\frac{1}{2}\\left[1 + \\text{erf}\\!\\left(\\frac{z}{\\sqrt{2}}\\right)\\right]$ where $\\text{erf}(x) = \\frac{2}{\\sqrt{\\pi}}\\int_0^x e^{-t^2}\\,dt$. Modern software (scipy.stats.norm.cdf, MATLAB normcdf) computes this to full floating-point precision instantly.`,

      `**Standardization: the algebra behind z-scores.** If $X \\sim N(\\mu, \\sigma^2)$, then $Z = (X - \\mu)/\\sigma \\sim N(0,1)$. Proof: $E[Z] = E[(X-\\mu)/\\sigma] = (E[X]-\\mu)/\\sigma = 0$. $\\text{Var}(Z) = \\text{Var}(X)/\\sigma^2 = \\sigma^2/\\sigma^2 = 1$. The shape (normal) is preserved by linear transformations. Therefore: $P(X \\leq x) = P\\!\\left(Z \\leq \\frac{x-\\mu}{\\sigma}\\right) = \\Phi\\!\\left(\\frac{x-\\mu}{\\sigma}\\right)$.`,

      `**The normal as the maximum-entropy distribution.** Among all continuous distributions with a given mean μ and variance σ², the normal distribution has the maximum entropy — it is in a precise mathematical sense "the most uncertain" (least informative) distribution consistent with those two constraints. This is one deep reason the normal appears so naturally: whenever our only knowledge is the mean and variance of a process, maximum-entropy reasoning singles out the normal as the default model.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Standardization Theorem',
        body: `If $X \\sim N(\\mu, \\sigma^2)$ and $Z = (X - \\mu)/\\sigma$, then $Z \\sim N(0,1)$.\n\nConsequences:\n$$P(X \\leq x) = \\Phi\\!\\left(\\frac{x-\\mu}{\\sigma}\\right)$$\n$$P(a \\leq X \\leq b) = \\Phi\\!\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\!\\left(\\frac{a-\\mu}{\\sigma}\\right)$$\n$$P(X > x) = 1 - \\Phi\\!\\left(\\frac{x-\\mu}{\\sigma}\\right) = \\Phi\\!\\left(\\frac{\\mu - x}{\\sigma}\\right) \\text{ (by symmetry)}$$\n\nInverse: the p-th percentile of $N(\\mu,\\sigma^2)$ is $\\mu + \\Phi^{-1}(p) \\cdot \\sigma$.`,
      },
      {
        type: 'theorem',
        title: 'Linearity of Normal Random Variables',
        body: `If $X \\sim N(\\mu_X, \\sigma_X^2)$ and $Y \\sim N(\\mu_Y, \\sigma_Y^2)$ are **independent**, then:\n$$aX + bY \\sim N\\!\\left(a\\mu_X + b\\mu_Y,\\; a^2\\sigma_X^2 + b^2\\sigma_Y^2\\right)$$\n\nSpecial cases:\n• $X + Y \\sim N(\\mu_X + \\mu_Y, \\sigma_X^2 + \\sigma_Y^2)$\n• $X - Y \\sim N(\\mu_X - \\mu_Y, \\sigma_X^2 + \\sigma_Y^2)$  ← variances **add** even for differences\n• $cX \\sim N(c\\mu_X, c^2\\sigma_X^2)$\n\nThis closure property is unique to the normal: the sum of independent normals is always normal.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Normal Distribution — Python Exploration',
        initialProps: {
          initialCells: [
            {
              id: 'cell1',
              cellTitle: 'Visualizing the Normal PDF and CDF',
              prose: `We'll explore how μ and σ shape the normal distribution, then practice computing probabilities using scipy.stats.norm.`,
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

# --- Shape exploration ---
x = np.linspace(-5, 15, 400)

configs = [
    (5, 1, 'N(5, 1)  — narrow'),
    (5, 2, 'N(5, 4)  — medium'),
    (5, 3, 'N(5, 9)  — wide'),
]

fig, axes = plt.subplots(1, 2, figsize=(12, 4))

for mu, sigma, label in configs:
    dist = stats.norm(loc=mu, scale=sigma)
    axes[0].plot(x, dist.pdf(x), label=label, linewidth=2)
    axes[1].plot(x, dist.cdf(x), label=label, linewidth=2)

axes[0].axvline(5, color='black', linestyle='--', alpha=0.4, label='μ = 5')
axes[0].set_title('PDF: different σ values, same μ=5')
axes[0].set_ylabel('f(x)')
axes[0].legend()

axes[1].set_title('CDF: Φ((x − μ)/σ)')
axes[1].set_ylabel('P(X ≤ x)')
axes[1].axhline(0.5, color='black', linestyle='--', alpha=0.4)
axes[1].legend()

plt.tight_layout()
plt.show()

# Key probabilities for N(69, 2.9²) — male heights in inches
mu, sigma = 69.1, 2.9
dist = stats.norm(loc=mu, scale=sigma)

p_between = dist.cdf(72) - dist.cdf(66.2)
p_above_74 = 1 - dist.cdf(74)
p_below_65 = dist.cdf(65)

print(f"P(66.2 ≤ X ≤ 72) = {p_between:.4f}  (within ~1σ of mean)")
print(f"P(X > 74 inches)  = {p_above_74:.4f}  (z = {(74 - mu)/sigma:.2f})")
print(f"P(X < 65 inches)  = {p_below_65:.4f}  (z = {(65 - mu)/sigma:.2f})")
print(f"95th percentile   = {dist.ppf(0.95):.2f} inches")`,
            },
            {
              id: 'cell2',
              cellTitle: 'The 68-95-99.7 Rule — Verified Numerically',
              prose: `Let's verify the rule for any normal distribution and also visualize the shaded probability regions.`,
              code: `from scipy import stats
import numpy as np
import matplotlib.pyplot as plt

dist = stats.norm(0, 1)  # Standard normal

# Verify the rule
for k in [1, 2, 3]:
    prob = dist.cdf(k) - dist.cdf(-k)
    print(f"P(|Z| ≤ {k}) = {prob:.6f}  (≈ {prob*100:.1f}%)")

print()
# Tail probabilities
print(f"P(Z > 1)  = {1 - dist.cdf(1):.6f}  (above μ + 1σ)")
print(f"P(Z > 2)  = {1 - dist.cdf(2):.6f}  (above μ + 2σ)")
print(f"P(Z > 3)  = {1 - dist.cdf(3):.7f} (above μ + 3σ)")

# Visualize the 68% region
x = np.linspace(-4, 4, 400)
fig, ax = plt.subplots(figsize=(9, 4))
ax.plot(x, dist.pdf(x), 'k-', linewidth=2)

x_fill = np.linspace(-1, 1, 200)
ax.fill_between(x_fill, dist.pdf(x_fill), alpha=0.4, color='steelblue', label='68% (within 1σ)')

x_fill2 = np.concatenate([np.linspace(-2, -1, 100), np.linspace(1, 2, 100)])
y_fill2 = dist.pdf(x_fill2)
ax.fill_between(np.linspace(-2,-1,100), dist.pdf(np.linspace(-2,-1,100)), alpha=0.3, color='orange')
ax.fill_between(np.linspace(1,2,100), dist.pdf(np.linspace(1,2,100)), alpha=0.3, color='orange', label='27% (1σ–2σ band)')

ax.set_title('Standard Normal: 68-95-99.7 Rule')
ax.set_xlabel('z')
ax.set_ylabel('f(z)')
ax.legend()
plt.tight_layout()
plt.show()`,
            },
            {
              id: 'cell3',
              cellTitle: 'Normal Approximation to the Binomial',
              prose: `When n is large and p is not too extreme, the binomial distribution is approximately normal. We'll see how well this works and when it breaks down.`,
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

def compare_binom_normal(n, p):
    mu = n * p
    sigma = np.sqrt(n * p * (1 - p))
    k_vals = np.arange(max(0, int(mu - 4*sigma)), int(mu + 4*sigma) + 1)

    binom_probs = stats.binom.pmf(k_vals, n, p)
    norm_dist = stats.norm(loc=mu, scale=sigma)

    fig, ax = plt.subplots(figsize=(10, 4))
    ax.bar(k_vals, binom_probs, alpha=0.6, color='steelblue', label=f'Binomial({n},{p})')

    x = np.linspace(k_vals[0] - 0.5, k_vals[-1] + 0.5, 400)
    ax.plot(x, norm_dist.pdf(x), 'r-', linewidth=2, label=f'Normal({mu:.1f}, {sigma**2:.1f})')
    ax.set_title(f'Binomial({n},{p}) vs Normal approximation  [np={mu:.1f}, np(1-p)={n*p*(1-p):.1f}]')
    ax.set_xlabel('k')
    ax.legend()
    plt.tight_layout()
    plt.show()

    # Max absolute error
    max_err = np.max(np.abs(binom_probs - norm_dist.pdf(k_vals)))
    print(f"n={n}, p={p}: max |binom PMF - norm PDF| = {max_err:.5f}")

compare_binom_normal(n=50, p=0.3)   # Good approximation
compare_binom_normal(n=50, p=0.05)  # Skewed — approximation worse`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              cellTitle: 'Challenge: IQ Score Analysis',
              prose: `IQ scores are defined to follow a Normal distribution with μ = 100 and σ = 15.

**Task:** Using scipy.stats.norm, compute:
1. P(IQ > 130) — the "gifted" threshold
2. P(85 < IQ < 115) — within 1 standard deviation of the mean
3. The IQ score at the 99th percentile
4. The z-score for an IQ of 145

Then create a plot of the IQ distribution shading the region above 130.`,
              starterCode: `from scipy import stats
import numpy as np
import matplotlib.pyplot as plt

mu, sigma = 100, 15
dist = stats.norm(loc=mu, scale=sigma)

# 1. P(IQ > 130)
p_gifted = # your code here

# 2. P(85 < IQ < 115)
p_middle = # your code here

# 3. 99th percentile
iq_99th = # your code here

# 4. z-score for IQ = 145
z_145 = # your code here

print(f"P(IQ > 130)       = {p_gifted:.4f}")
print(f"P(85 < IQ < 115)  = {p_middle:.4f}")
print(f"99th percentile   = {iq_99th:.1f}")
print(f"z-score for 145   = {z_145:.2f}")

# Plot with shaded tail
x = np.linspace(50, 150, 400)
fig, ax = plt.subplots(figsize=(9, 4))
ax.plot(x, dist.pdf(x), 'k-', linewidth=2)
# Shade P(IQ > 130) — fill_between from 130 to 150
# your code here
ax.set_xlabel('IQ Score')
ax.set_title('IQ Score Distribution — N(100, 225)')
plt.show()`,
              solution: `from scipy import stats
import numpy as np
import matplotlib.pyplot as plt

mu, sigma = 100, 15
dist = stats.norm(loc=mu, scale=sigma)

p_gifted = 1 - dist.cdf(130)
p_middle = dist.cdf(115) - dist.cdf(85)
iq_99th  = dist.ppf(0.99)
z_145    = (145 - mu) / sigma

print(f"P(IQ > 130)       = {p_gifted:.4f}")
print(f"P(85 < IQ < 115)  = {p_middle:.4f}")
print(f"99th percentile   = {iq_99th:.1f}")
print(f"z-score for 145   = {z_145:.2f}")

x = np.linspace(50, 150, 400)
fig, ax = plt.subplots(figsize=(9, 4))
ax.plot(x, dist.pdf(x), 'k-', linewidth=2)
x_tail = np.linspace(130, 150, 200)
ax.fill_between(x_tail, dist.pdf(x_tail), alpha=0.5, color='red', label=f'P(IQ > 130) = {p_gifted:.4f}')
ax.set_xlabel('IQ Score')
ax.set_title('IQ Score Distribution — N(100, 225)')
ax.legend()
plt.show()`,
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Normal Distribution — MATLAB/Octave',
        initialProps: {
          initialCells: [
            {
              id: 'mat1',
              cellTitle: 'Normal Probabilities in MATLAB',
              prose: `MATLAB/Octave provides normcdf, normpdf, and norminv for normal distribution calculations.`,
              code: `pkg load statistics
% Normal distribution calculations
mu = 69.1;   sigma = 2.9;   % Male heights (inches)

% CDF and probability calculations
p_between = normcdf(72, mu, sigma) - normcdf(66.2, mu, sigma);
p_above_74 = 1 - normcdf(74, mu, sigma);
z_74 = (74 - mu) / sigma;

fprintf('P(66.2 <= X <= 72) = %.4f\\n', p_between);
fprintf('P(X > 74 inches)   = %.4f  (z = %.2f)\\n', p_above_74, z_74);
fprintf('95th percentile    = %.2f inches\\n', norminv(0.95, mu, sigma));

% 68-95-99.7 rule verification (standard normal)
for k = 1:3
    prob = normcdf(k, 0, 1) - normcdf(-k, 0, 1);
    fprintf('P(|Z| <= %d) = %.6f  (%.1f%%)\\n', k, prob, prob*100);
end

% Plot the standard normal
z = linspace(-4, 4, 400);
figure;
subplot(1,2,1);
plot(z, normpdf(z, 0, 1), 'b-', 'LineWidth', 2);
title('Standard Normal PDF');
xlabel('z'); ylabel('f(z)');
grid on;

subplot(1,2,2);
plot(z, normcdf(z, 0, 1), 'r-', 'LineWidth', 2);
title('Standard Normal CDF \\Phi(z)');
xlabel('z'); ylabel('\\Phi(z)');
yline(0.5, 'k--');
grid on;`,
            },
            {
              id: 'mat2',
              cellTitle: 'Sampling from Normal Distributions',
              prose: `MATLAB's randn generates standard normal samples. We verify that the sample mean and variance converge to μ and σ².`,
              code: `% Sampling and parameter estimation
rng(42);   % reproducibility
mu_true = 5;   sigma_true = 2;

sample_sizes = [10, 100, 1000, 10000];
fprintf('n         x_bar     s         error_mean  error_std\\n');
fprintf('-------   --------  --------  ----------  ---------\\n');

for n = sample_sizes
    X = mu_true + sigma_true * randn(1, n);
    x_bar = mean(X);
    s = std(X);
    fprintf('%-8d  %.4f    %.4f    %.4f      %.4f\\n', ...
            n, x_bar, s, abs(x_bar - mu_true), abs(s - sigma_true));
end

% Visualize convergence with n=1000
n = 1000;
X = mu_true + sigma_true * randn(1, n);
figure;
histogram(X, 40, 'Normalization', 'pdf', 'FaceColor', [0.4 0.6 0.8]);
hold on;
x_grid = linspace(mu_true - 4*sigma_true, mu_true + 4*sigma_true, 400);
plot(x_grid, normpdf(x_grid, mu_true, sigma_true), 'r-', 'LineWidth', 2);
title(sprintf('N(%g, %g^2): n=1000 sample vs true PDF', mu_true, sigma_true));
xlabel('x'); ylabel('density');
legend('Sample histogram', 'True PDF');`,
            },
            {
              id: 'mc1',
              challengeType: 'write',
              cellTitle: 'Challenge: Manufacturing Tolerance Analysis',
              prose: `A factory produces bolts whose diameters follow N(10.00 mm, 0.04 mm²) (σ = 0.2 mm). Bolts outside the range [9.6, 10.4] mm are defective.

**Task:** Using normcdf and norminv:
1. Compute the defect rate P(outside [9.6, 10.4])
2. Find the tightest symmetric interval [10 − d, 10 + d] capturing 99% of bolts
3. Plot the distribution shading the defective regions`,
              starterCode: `mu = 10.00;  sigma = 0.20;

% 1. Defect rate
p_good = % normcdf(10.4, mu, sigma) - normcdf(9.6, mu, sigma)
defect_rate = % 1 - p_good

fprintf('Defect rate: %.4f (%.2f%%)\\n', defect_rate, defect_rate*100);

% 2. Interval capturing 99%  (hint: use norminv(0.005) for lower bound)
d = % norminv(0.995, mu, sigma) - mu

fprintf('99%% interval: [%.4f, %.4f]\\n', mu - d, mu + d);

% 3. Plot (shade x < 9.6 and x > 10.4)
x = linspace(9.2, 10.8, 400);
figure;
plot(x, normpdf(x, mu, sigma), 'k-', 'LineWidth', 2);
hold on;
% shade defective tails and add title`,
              solution: `mu = 10.00;  sigma = 0.20;

p_good = normcdf(10.4, mu, sigma) - normcdf(9.6, mu, sigma);
defect_rate = 1 - p_good;
fprintf('Defect rate: %.4f (%.2f%%)\\n', defect_rate, defect_rate*100);

d = norminv(0.995, mu, sigma) - mu;
fprintf('99%% interval: [%.4f, %.4f]\\n', mu - d, mu + d);

x = linspace(9.2, 10.8, 400);
y = normpdf(x, mu, sigma);
figure;
plot(x, y, 'k-', 'LineWidth', 2); hold on;
x_low = linspace(9.2, 9.6, 100);
x_high = linspace(10.4, 10.8, 100);
fill([x_low, fliplr(x_low)], [normpdf(x_low, mu, sigma), zeros(1,100)], 'r', 'FaceAlpha', 0.4);
fill([x_high, fliplr(x_high)], [normpdf(x_high, mu, sigma), zeros(1,100)], 'r', 'FaceAlpha', 0.4, 'HandleVisibility', 'off');
title(sprintf('Bolt Diameters N(%.2f, %.2f^2) — Defect rate = %.4f', mu, sigma, defect_rate));
xlabel('Diameter (mm)'); ylabel('f(x)');
legend('PDF', 'Defective region');`,
            },
          ],
        },
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────
  rigor: {
    prose: [
      `**Moment generating function.** The MGF of $X \\sim N(\\mu, \\sigma^2)$ is $M_X(t) = e^{\\mu t + \\sigma^2 t^2/2}$ for all $t \\in \\mathbb{R}$. From this, $E[X] = M_X'(0) = \\mu$ and $E[X^2] = M_X''(0) = \\mu^2 + \\sigma^2$, confirming $\\text{Var}(X) = \\sigma^2$. The MGF also proves the closure property: if $X$ and $Y$ are independent normals, $M_{X+Y}(t) = M_X(t)M_Y(t) = e^{(\\mu_X+\\mu_Y)t + (\\sigma_X^2+\\sigma_Y^2)t^2/2}$, which is the MGF of $N(\\mu_X+\\mu_Y, \\sigma_X^2+\\sigma_Y^2)$.`,

      `**Uniqueness and characterization.** The normal distribution has several remarkable characterization theorems. The Cramér–Wold theorem and Lévy's characterization of the normal via the MGF show that the normal is the only distribution for which the sample mean $\\bar{X}$ and sample variance $S^2$ are independent (Basu's theorem). This independence property is exploited in deriving the t-distribution and the F-distribution used in hypothesis testing. No other distribution shares it.`,

      `**The multivariate normal.** In higher dimensions, $\\mathbf{X} = (X_1, \\ldots, X_p)$ follows a multivariate normal distribution $\\mathcal{N}(\\boldsymbol{\\mu}, \\boldsymbol{\\Sigma})$ if every linear combination $\\mathbf{a}^T\\mathbf{X}$ is univariate normal. The covariance matrix $\\boldsymbol{\\Sigma}$ captures both variances and correlations. The PDF is $f(\\mathbf{x}) = (2\\pi)^{-p/2}|\\boldsymbol{\\Sigma}|^{-1/2}\\exp(-\\frac{1}{2}(\\mathbf{x}-\\boldsymbol{\\mu})^T\\boldsymbol{\\Sigma}^{-1}(\\mathbf{x}-\\boldsymbol{\\mu}))$. For a multivariate normal, zero correlation implies independence — a property unique to the normal family. This is the foundation of linear regression, PCA, Gaussian processes, and Kalman filtering.`,
    ],
  },

  // ── Examples ──────────────────────────────────────────────────
  examples: [
    {
      title: 'SAT Score Percentiles',
      steps: [
        `**Setup.** SAT Math scores follow approximately N(528, 117²). A student scores 700. Find: (a) their percentile rank, (b) the score needed to be in the top 5%, (c) P(score between 450 and 650).`,
        `**Part (a): z-score for 700.** $z = (700 - 528)/117 = 172/117 \\approx 1.47$. $P(X \\leq 700) = \\Phi(1.47) \\approx 0.9292$. The student is at approximately the **93rd percentile**.`,
        `**Part (b): top 5% cutoff.** We need $P(X > x) = 0.05$, so $P(X \\leq x) = 0.95$. $z^* = \\Phi^{-1}(0.95) \\approx 1.645$. $x = 528 + 1.645 \\times 117 \\approx 528 + 192.5 \\approx 720.5$. Scoring **721 or above** places you in the top 5%.`,
        `**Part (c): P(450 ≤ X ≤ 650).** $z_1 = (450-528)/117 \\approx -0.67$, $z_2 = (650-528)/117 \\approx 1.04$. $P = \\Phi(1.04) - \\Phi(-0.67) \\approx 0.8508 - 0.2514 = 0.5994$. About **60%** of test-takers score between 450 and 650.`,
      ],
      annotations: [
        `Percentile = CDF value: being at the 93rd percentile means you scored higher than 93% of test-takers.`,
        `For top-k%, solve for P(X ≤ x) = 1 − k/100 first, then invert.`,
        `Always draw a sketch: shade the region you want, then translate to CDF operations.`,
      ],
    },
    {
      title: 'Quality Control: Acceptable Tolerance Limits',
      steps: [
        `**Setup.** A machine fills bags of flour with weight ~ N(500g, 8²). Bags weighing less than 485g or more than 515g are rejected. Find the rejection rate.`,
        `**Standardize both limits.** Lower: $z_L = (485 - 500)/8 = -1.875$. Upper: $z_U = (515 - 500)/8 = 1.875$.`,
        `**P(acceptable).** $P(485 \\leq X \\leq 515) = \\Phi(1.875) - \\Phi(-1.875) = 2\\Phi(1.875) - 1 \\approx 2(0.9696) - 1 = 0.9393$. Rejection rate = 1 − 0.9393 = **6.07%**.`,
        `**Redesign question:** What σ is needed to reduce rejection to 1%? We need $P(|X - 500| > 15) = 0.01$, so $P(|Z| > 15/\\sigma) = 0.01$. From the standard normal, $P(|Z| > z) = 0.01$ gives $z = 2.576$. So $15/\\sigma = 2.576 \\Rightarrow \\sigma = 15/2.576 \\approx 5.82$g. The machine needs to be more precise.`,
      ],
      annotations: [
        `Symmetric limits (±15g from mean) let you use the formula P(|Z| ≤ z) = 2Φ(z) − 1.`,
        `The redesign problem inverts the process: given desired probability → find required σ.`,
        `This "capability analysis" is the foundation of Six Sigma manufacturing quality.`,
      ],
    },
  ],

  // ── Challenges ────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1',
      difficulty: 'easy',
      problem: `Blood pressure (systolic) in adults follows N(120, 15²) mmHg. The "high blood pressure" threshold is 140 mmHg.\n\n(a) What fraction of adults have high blood pressure by this definition?\n(b) What is the 90th percentile blood pressure?\n(c) What is the probability that two randomly selected adults both have BP below 140?`,
      walkthrough: [
        `(a) P(X > 140): z = (140−120)/15 = 1.333. P = 1 − Φ(1.333) ≈ 1 − 0.9088 = **0.0912** (about 9.1%).\n\n(b) 90th percentile: z = Φ⁻¹(0.90) ≈ 1.282. x = 120 + 1.282×15 ≈ **139.2 mmHg**.\n\n(c) By independence: P(both < 140) = P(X < 140)² = (0.9088)² ≈ **0.826**.`,
      ]
    },
    {
      id: 'ch2',
      difficulty: 'medium',
      problem: `A factory produces resistors with resistance ~ N(100Ω, 4²). Resistors are labeled "100Ω ±5%", meaning they are sold if the true resistance is between 95Ω and 105Ω. Otherwise they are reworked at a cost of $0.15 per resistor.\n\n(a) What fraction of resistors must be reworked?\n(b) If the machine is recalibrated so μ = 100Ω and σ = 2Ω, how does the rework rate change?\n(c) In a batch of 5,000 resistors at the original settings, what is the expected rework cost?`,
      walkthrough: [
        `(a) P(outside [95, 105]): z = ±5/4 = ±1.25. P(inside) = 2Φ(1.25)−1 ≈ 0.7887. Rework rate = **1 − 0.7887 = 0.2113** (about 21%).\n\n(b) New σ = 2: z = ±5/2 = ±2.5. P(inside) = 2Φ(2.5)−1 ≈ 0.9876. Rework rate = **0.0124** (about 1.2%). Halving σ cuts rework from 21% to 1.2%.\n\n(c) Expected reworks = 5000 × 0.2113 ≈ 1056 units. Cost = 1056 × $0.15 = **$158.40**.`,
      ]
    },
    {
      id: 'ch3',
      difficulty: 'hard',
      problem: `**Normal approximation with continuity correction.** X ~ Binomial(200, 0.4). Use the normal approximation with continuity correction to estimate P(X = 80) and P(75 ≤ X ≤ 85). Then compute the exact binomial probabilities using scipy (or your calculator) and compare. Explain why the continuity correction improves the approximation.`,
      walkthrough: [
        `Mean = np = 80, Var = np(1−p) = 48, σ ≈ 6.928.\n\n**P(X = 80)** with continuity correction: P(79.5 ≤ Y ≤ 80.5) where Y ~ N(80, 48). z₁ = −0.5/6.928 ≈ −0.0722, z₂ = 0.5/6.928 ≈ 0.0722. P = Φ(0.0722) − Φ(−0.0722) ≈ 0.0576. Exact: binom.pmf(80,200,0.4) ≈ 0.0567. Without continuity correction: normpdf(80)*1 ≈ 0.0577 (close but slightly off).\n\n**P(75 ≤ X ≤ 85)** with continuity correction: P(74.5 ≤ Y ≤ 85.5). z₁ = −5.5/6.928 ≈ −0.794, z₂ = 5.5/6.928 ≈ 0.794. P ≈ 2Φ(0.794)−1 ≈ 0.573. Exact ≈ 0.568. The continuity correction matters because we are approximating a discrete probability (point or interval of integers) with a continuous integral — adding ±0.5 aligns the continuous integral with the actual integer boundaries.`,
      ]
    },
  ],

  // ── Quiz ──────────────────────────────────────────────────────
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: `X ~ Normal(50, 100). What is P(40 ≤ X ≤ 60)?`,
      options: [
        `About 0.50`,
        `About 0.6827`,
        `About 0.9545`,
        `About 0.9973`,
      ],
      answer: `About 0.6827`,
      hints: [
        `σ = √100 = 10. The interval [40, 60] is [μ−σ, μ+σ] — exactly 1 standard deviation on each side.`,
        `Apply the 68-95-99.7 rule: within 1σ captures ≈68% of the distribution.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q2',
      type: 'choice',
      text: `For X ~ Normal(μ, σ²), what is the z-score of the value x = μ + 2σ?`,
      options: [`0`, `1`, `2`, `σ`],
      answer: `2`,
      hints: [
        `The z-score formula is z = (x − μ)/σ.`,
        `Substitute x = μ + 2σ: z = (μ + 2σ − μ)/σ = 2σ/σ = 2.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q3',
      type: 'choice',
      text: `The CDF of the standard normal at z = 1.96 is approximately 0.975. For X ~ Normal(100, 225), what value x satisfies P(X ≤ x) = 0.975?`,
      options: [`x = 100 + 1.96`, `x = 100 + 1.96 × 15`, `x = 100 + 1.96 × 225`, `x = 1.96`],
      answer: `x = 100 + 1.96 × 15`,
      hints: [
        `σ = √225 = 15. The inverse formula is x = μ + z*σ.`,
        `z* = 1.96 (given), μ = 100, σ = 15, so x = 100 + 1.96 × 15 = 129.4.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q4',
      type: 'choice',
      text: `Which statement correctly describes the effect of increasing σ on the normal distribution while keeping μ fixed?`,
      options: [
        `The curve shifts right without changing shape.`,
        `The curve becomes taller and narrower.`,
        `The curve becomes shorter and wider, with more probability in the tails.`,
        `The mean and median both change.`,
      ],
      answer: `The curve becomes shorter and wider, with more probability in the tails.`,
      hints: [
        `σ controls spread. Larger σ means more variability — probability spreads out from the center.`,
        `The total area under the curve is always 1, so if it spreads wider it must also be shorter.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q5',
      type: 'choice',
      text: `If X ~ N(μ, σ²) and Y ~ N(μ, σ²) are independent, what is the distribution of X − Y?`,
      options: [
        `N(0, 0) — a constant`,
        `N(0, σ²)`,
        `N(0, 2σ²)`,
        `N(0, 4σ²)`,
      ],
      answer: `N(0, 2σ²)`,
      hints: [
        `For independent normals: Var(X − Y) = Var(X) + Var(−Y) = σ² + (−1)²σ² = 2σ².`,
        `Mean of X − Y = μ − μ = 0. Variance adds, even for differences.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q6',
      type: 'choice',
      text: `The normal approximation to the Binomial works well when:`,
      options: [
        `n is large and p is close to 0 or 1`,
        `n ≥ 20 regardless of p`,
        `np ≥ 10 and n(1 − p) ≥ 10`,
        `Only when X is symmetric, i.e., p = 0.5`,
      ],
      answer: `np ≥ 10 and n(1 − p) ≥ 10`,
      hints: [
        `The approximation requires both the expected number of successes AND failures to be at least 10.`,
        `If p is close to 0 or 1, the binomial is skewed and the normal (symmetric) approximation is poor.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q7',
      type: 'choice',
      text: `$X \\sim N(100, 225)$ (mean=100, variance=225). What is the z-score for $x = 85$?`,
      options: [`-1`, `-0.67`, `+1`, `-15`],
      answer: `-1`,
      hints: [
        `σ = √225 = 15. z = (x − μ)/σ = (85 − 100)/15.`,
        `(85 − 100)/15 = −15/15 = −1.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q8',
      type: 'choice',
      text: `In the standard normal distribution, $P(-1.96 < Z < 1.96) \\approx$:`,
      options: [`0.68`, `0.95`, `0.997`, `0.90`],
      answer: `0.95`,
      hints: [
        `±1.96 corresponds to the 95% interval of the standard normal (the 2.5th and 97.5th percentiles).`,
        `This is the basis of 95% confidence intervals: z* = 1.96.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q9',
      type: 'choice',
      text: `$X \\sim N(72, 64)$ (mean=72, variance=64). $P(X > 80) \\approx$:`,
      options: [`0.841`, `0.159`, `0.023`, `0.500`],
      answer: `0.159`,
      hints: [
        `σ = √64 = 8. z = (80 − 72)/8 = 1. P(X > 80) = P(Z > 1).`,
        `P(Z > 1) = 1 − Φ(1) ≈ 1 − 0.841 = 0.159.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q10',
      type: 'choice',
      text: `A normal distribution is completely determined by:`,
      options: [
        `Mean only`,
        `Mean and variance (μ and σ²)`,
        `Mean, variance, and skewness`,
        `Only the standard deviation`,
      ],
      answer: `Mean and variance (μ and σ²)`,
      hints: [
        `The normal distribution has exactly two parameters: μ (location) and σ² (scale).`,
        `Normal distributions with the same μ and σ² are identical; the skewness is always 0.`,
      ],
      reviewSection: `math`,
    },
  ],

  // ── Checkpoints ───────────────────────────────────────────────
  checkpoints: [
    `Identified μ and σ from a problem description`,
    `Applied the 68-95-99.7 rule to a real scenario`,
    `Computed a z-score and looked it up in a normal table or with software`,
    `Found P(a ≤ X ≤ b) by standardizing both endpoints`,
    `Solved the inverse problem: found x given P(X ≤ x) = p`,
    `Verified the linearity of variance for differences of independent normals`,
  ],

  // ── Semantics ─────────────────────────────────────────────────
  semantics: {
    coreSymbols: [
      { symbol: `N(μ, σ²)`, meaning: `Normal distribution with mean μ and variance σ²` },
      { symbol: `Z`, meaning: `Standardized variable: Z = (X − μ)/σ ~ N(0,1)` },
      { symbol: `Φ(z)`, meaning: `CDF of the standard normal: P(Z ≤ z)` },
      { symbol: `Φ⁻¹(p)`, meaning: `Inverse CDF (quantile function): z such that Φ(z) = p` },
      { symbol: `f(x)`, meaning: `Normal PDF: (1/σ√2π)exp(−(x−μ)²/2σ²)` },
      { symbol: `σ`, meaning: `Standard deviation (square root of variance; controls bell width)` },
    ],
    rulesOfThumb: [
      `68% of values are within 1σ of the mean; 95% within 2σ; 99.7% within 3σ.`,
      `A z-score above ±2 is "unusual" (outside the middle 95%).`,
      `To find any normal probability: convert to z-scores, then use Φ (CDF).`,
      `For differences of independent normals, variances add (even though means subtract).`,
      `Use normal approx to Binomial when np ≥ 10 AND n(1−p) ≥ 10.`,
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────
  spiral: {
    recovery: `If the z-score formula confuses you, return to the intuition section's "Z-scores" paragraph and try computing z for a few concrete values (e.g., x = μ means z = 0; x = μ + σ means z = 1). The formula is just asking "how many σ above the mean is this value?"`,
    links: [
      {
        lessonId: `stat5-005`,
        relationship: `The Central Limit Theorem (next lesson) explains why the normal distribution appears everywhere: the sample mean of any distribution converges to normal as n grows. Everything in stat6 (hypothesis testing) builds on this.`,
      },
      {
        lessonId: `stat6-001`,
        relationship: `Hypothesis testing uses the normal distribution to compute p-values. The test statistic (z or t) is a standardized score — exactly what you computed in this lesson.`,
      },
      {
        lessonId: `stat7-001`,
        relationship: `Linear regression assumes normally distributed residuals. The z-score and standardization ideas from this lesson reappear when interpreting regression coefficients.`,
      },
    ],
  },

  // ── Mastery ───────────────────────────────────────────────────
  mastery: {
    badge: `Normal Distribution`,
    description: `You can compute probabilities for any normal distribution using z-scores, apply the 68-95-99.7 rule, solve inverse problems (finding x from a percentile), and recognize when the normal approximation to the Binomial is valid.`,
  },

  // ── Definitions ───────────────────────────────────────────────
  definitions: [
    {
      term: `Normal distribution`,
      definition: `A continuous probability distribution symmetric about its mean μ, fully described by μ and σ². Its bell-shaped PDF is f(x) = (1/σ√2π)e^(−(x−μ)²/2σ²).`,
      symbol: `N(μ, σ²)`,
    },
    {
      term: `Standard normal distribution`,
      definition: `The special case N(0, 1): mean 0, variance 1. All normal probabilities reduce to standard normal CDF values via standardization.`,
      symbol: `Z ~ N(0,1)`,
    },
    {
      term: `Z-score`,
      definition: `Z = (X − μ)/σ. The number of standard deviations an observation lies above or below the mean. A universal measure of relative position.`,
      symbol: `z`,
    },
    {
      term: `Standard normal CDF`,
      definition: `Φ(z) = P(Z ≤ z) for Z ~ N(0,1). The fundamental function for all normal probability calculations. Computed by scipy.stats.norm.cdf(z) or MATLAB normcdf(z).`,
      symbol: `Φ(z)`,
    },
    {
      term: `68-95-99.7 rule`,
      definition: `For any Normal(μ, σ²): approximately 68% of values fall within 1σ of μ, 95% within 2σ, and 99.7% within 3σ.`,
      symbol: null,
    },
  ],
};
