export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'stat5-003',
  slug: 'poisson-distribution',
  chapter: 'stat5',
  order: 3,
  title: 'The Poisson Distribution',
  subtitle: 'Modeling rare events per unit of time, space, or opportunity.',
  tags: ['Poisson', 'PMF', 'rare events', 'Poisson process', 'lambda', 'rate', 'memoryless'],
  aliases: 'Poisson distribution lambda rare events arrivals per hour count data radioactive decay typos call center',
  timeToComplete: 30,
  coreConcept: 'The Poisson(λ) distribution counts the number of rare, independent events in a fixed interval. Its PMF is P(X=k) = e^(−λ)λ^k/k!. The unique property: E[X] = Var(X) = λ. When you know only the average rate, the Poisson is the default model.',
  prerequisites: ['stat5-001', 'stat5-002'],
  nextLesson: 'stat5-004',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: 'A hospital emergency room admits an average of 6 patients per hour. What is the probability that exactly 10 patients arrive in the next hour — and how do you even compute that without listing all possible sequences of arrivals?',
    realWorldContext: 'The Poisson distribution is the invisible engine behind an enormous range of real-world count data. When Amazon Web Services engineers model the number of server requests per millisecond to size their infrastructure, they use Poisson. When epidemiologists track the number of rare disease cases per county per year, they use Poisson. When nuclear physicists count the number of alpha particles emitted by a radioactive sample in one second, they use Poisson. When a copy editor estimates the probability of finding at least one typo on a page given a historical error rate of 0.5 per page, they use Poisson. The common thread: you are counting rare, independent occurrences in a fixed window, and you know only the average rate. Once you master the Poisson distribution, you can model all of these with a single formula and one parameter.',
    previewVisualizationId: 'PoissonDistributionViz',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Roadmap for this lesson.** By the end you will be able to: (1) recognize when a Poisson model is appropriate; (2) compute $P(X=k)$ using the PMF formula; (3) use the CDF to find $P(X \\leq k)$ and related inequalities; (4) state E[X] = Var(X) = λ and know why this equality is diagnostic; (5) derive the Poisson as a limit of the Binomial; (6) use the Poisson to approximate Binomial probabilities when n is large and p is small.',

      '**Building the model from a parking lot.** An intersection has 200 cars passing per hour, each independently turning left with probability 0.03. Let $X$ = number of left turns in one hour. $X \\sim \\text{Binomial}(200, 0.03)$. Mean: $E[X] = 200 \\times 0.03 = 6$. Now imagine refining the model: 20,000 cars, $p = 0.0003$ — still an average of 6 left turns. The binomial PMF requires computing $\\binom{20000}{k}$ — computationally awful. But as $n \\to \\infty$ with $np = \\lambda$ held fixed, the binomial PMF converges to a far simpler formula: $$P(X = k) = \\frac{e^{-\\lambda} \\lambda^k}{k!}$$ This is the Poisson PMF. For our intersection with $\\lambda = 6$: $P(X=10) = e^{-6} \\cdot 6^{10}/10! \\approx 0.0413$.',

      '**Before reading on, predict:** For a Poisson(6) distribution, which do you think is higher — $P(X=6)$ (hitting exactly the mean) or $P(X=5)$? What about $P(X=0)$ — the probability of zero events? Write down your guess for $P(X=0)$ before computing $e^{-6}$.',

      '**The PMF formula decoded.** $P(X=k) = e^{-\\lambda}\\lambda^k/k!$ has three parts: (1) $e^{-\\lambda}$ is the probability of zero events — it is always positive and decreases as $\\lambda$ grows (higher rate → harder to get zero); (2) $\\lambda^k$ grows as the rate $\\lambda$ rises and as $k$ rises; (3) $k!$ grows faster than $\\lambda^k$ for large $k$, pulling the probabilities down for very large counts. For $\\lambda = 6$: $P(X=0) = e^{-6} \\approx 0.0025$. A quiet hour (zero arrivals) with an average rate of 6 per hour has only a 0.25% chance.',

      '**The signature property: mean equals variance.** For any Poisson($\\lambda$): $E[X] = \\lambda$ and $\\text{Var}(X) = \\lambda$, so $\\sigma = \\sqrt{\\lambda}$. This equality is a diagnostic test. If you compute the sample mean and sample variance from real count data and they are approximately equal, a Poisson model is plausible. If the variance is much larger than the mean (overdispersion), consider a Negative Binomial model instead. If variance is much smaller (underdispersion), the events may not be independent.',

      '**The Poisson process: three defining properties.** A sequence of random events forms a Poisson process with rate $\\lambda$ if: (1) **Independence** — the number of events in non-overlapping intervals are independent; (2) **Stationarity** — the probability of $k$ events in an interval depends only on its length, not its position in time; (3) **Rarity** — in a very short interval $[t, t+dt)$, $P(\\text{one event}) \\approx \\lambda \\, dt$ and $P(\\text{two or more events}) \\approx 0$. When these three hold, counts in a fixed interval of length $T$ follow Poisson($\\lambda T$). Double the time window → double the rate parameter.',

      '**Rescaling the window.** If calls arrive at a rate of 6 per hour (Poisson(6) per hour), then in a 30-minute window the count follows Poisson(3). In a 10-minute window: Poisson(1). In a 2-hour window: Poisson(12). The rate $\\lambda$ scales linearly with the window length. This makes the Poisson extremely flexible: state the rate per unit of your choice, then multiply by however long you are watching.',

      '**Poisson approximation to Binomial.** When $n$ is large (say $n > 50$) and $p$ is small (say $p < 0.05$) with $\\lambda = np$ moderate, computing Binomial(n,p) exactly is expensive. The Poisson($\\lambda$) approximation is excellent: use it when $n \\geq 20$ and $p \\leq 0.05$. Example: a hard drive has 10,000 sectors; each sector independently fails with probability 0.0001. $X \\sim \\text{Binomial}(10000, 0.0001)$. $\\lambda = 1$. $P(X=0) \\approx e^{-1} \\approx 0.368$. Computing the exact binomial would require $\\binom{10000}{0}(0.0001)^0(0.9999)^{10000} = 0.9999^{10000} \\approx 0.368$ — matching to three decimal places.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Poisson Distribution',
        body: 'A random variable $X$ follows Poisson($\\lambda$) if $P(X=k) = \\frac{e^{-\\lambda}\\lambda^k}{k!}$ for $k = 0, 1, 2, \\ldots$ where $\\lambda > 0$ is the average rate. Properties:\n\n• $E[X] = \\lambda$\n• $\\text{Var}(X) = \\lambda$ (same as mean)\n• $\\sigma = \\sqrt{\\lambda}$\n• $X$ takes values $0, 1, 2, \\ldots$ (all non-negative integers)',
      },
      {
        type: 'procedure',
        title: 'Procedure: When to Use Poisson',
        body: 'A Poisson model is appropriate when:\n\n(1) **Counting events** per unit of time, area, volume, or opportunity.\n(2) Events are **rare and independent** — one occurring doesn\'t make another more or less likely.\n(3) You know or can estimate the **average rate** λ.\n(4) The **window is fixed** in advance (not "count until 10 events happen" — that would be Negative Binomial).\n\nDiagnostic check: if sample mean ≈ sample variance, Poisson is a good fit.',
      },
      {
        type: 'insight',
        title: 'Why Mean = Variance Is Unusual',
        body: 'For a Binomial(n,p): $E[X] = np$ but $\\text{Var}(X) = np(1-p) < np$. Variance is always less than the mean. For a Poisson, they are equal. For an overdispersed count (e.g., number of insurance claims per customer — some customers are much riskier than others): variance exceeds the mean. Mean-variance equality is a specific signature of the Poisson model, useful for model diagnostics.',
      },
      {
        type: 'warning',
        title: 'Poisson Requires Independence',
        body: 'If events cluster (one accident increases the risk of another — the Hawkes process; disease cases cluster by household — the negative binomial), the Poisson fails. The independence assumption is the most commonly violated condition. Always ask: "Does one event make others more likely?" If yes, the Poisson underestimates the probability of high counts.',
      },
    ],
    visualizations: [
      {
        id: 'PoissonDistributionViz',
        title: 'Poisson PMF — Interactive λ Explorer',
        mathBridge:
          'Drag the λ slider to see how the distribution shifts: mean = variance = λ at all times. Click any bar to read its exact probability $P(X=k) = e^{-\\lambda}\\lambda^k/k!$. As λ increases the distribution spreads and the peak moves right; as λ → ∞ the shape becomes approximately normal.',
        caption:
          'Notice that the amber dashed line (mean = λ) always matches the balance point of the bars, and that mean = variance is a unique Poisson property.',
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────
  math: {
    prose: [
      '**Deriving the Poisson from the Binomial.** Consider $X \\sim \\text{Binomial}(n, p)$ with $np = \\lambda$ fixed. The PMF is $P(X=k) = \\binom{n}{k}p^k(1-p)^{n-k}$. Substitute $p = \\lambda/n$:\n$$P(X=k) = \\frac{n!}{k!(n-k)!} \\cdot \\frac{\\lambda^k}{n^k} \\cdot \\left(1 - \\frac{\\lambda}{n}\\right)^{n-k}$$\nAs $n \\to \\infty$: $\\frac{n!}{(n-k)! \\, n^k} \\to 1$, and $\\left(1 - \\frac{\\lambda}{n}\\right)^{n} \\to e^{-\\lambda}$, and $\\left(1 - \\frac{\\lambda}{n}\\right)^{-k} \\to 1$. Therefore $P(X=k) \\to \\frac{e^{-\\lambda}\\lambda^k}{k!}$.',

      '**Proof that E[X] = λ.** Using the PMF: $E[X] = \\sum_{k=0}^{\\infty} k \\cdot \\frac{e^{-\\lambda}\\lambda^k}{k!}$. The $k=0$ term is 0. For $k \\geq 1$, cancel $k$ with $k!$ to get $(k-1)!$: $E[X] = e^{-\\lambda} \\sum_{k=1}^{\\infty} \\frac{\\lambda^k}{(k-1)!} = e^{-\\lambda} \\lambda \\sum_{j=0}^{\\infty} \\frac{\\lambda^j}{j!} = e^{-\\lambda} \\lambda e^{\\lambda} = \\lambda$.',

      '**Proof that Var(X) = λ.** Compute $E[X(X-1)] = \\sum_{k=2}^{\\infty} k(k-1) \\frac{e^{-\\lambda}\\lambda^k}{k!} = e^{-\\lambda}\\lambda^2 \\sum_{j=0}^{\\infty} \\frac{\\lambda^j}{j!} = \\lambda^2$. Then $E[X^2] = E[X(X-1)] + E[X] = \\lambda^2 + \\lambda$. Therefore $\\text{Var}(X) = E[X^2] - (E[X])^2 = \\lambda^2 + \\lambda - \\lambda^2 = \\lambda$.',

      '**Poisson CDF and sums.** $P(X \\leq k) = e^{-\\lambda} \\sum_{j=0}^{k} \\frac{\\lambda^j}{j!}$. There is no closed form simplification — in practice this is computed numerically. If $X$ and $Y$ are independent Poisson($\\lambda_1$) and Poisson($\\lambda_2$), then $X + Y \\sim \\text{Poisson}(\\lambda_1 + \\lambda_2)$. This reproductive property makes Poisson aggregation easy: combining two independent Poisson processes gives another Poisson process with summed rates.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Poisson PMF and Moments',
        body: '$X \\sim \\text{Poisson}(\\lambda)$:\n$$P(X=k) = \\frac{e^{-\\lambda}\\lambda^k}{k!}, \\quad k = 0, 1, 2, \\ldots$$\n$$E[X] = \\lambda \\qquad \\text{Var}(X) = \\lambda \\qquad \\sigma = \\sqrt{\\lambda}$$',
      },
      {
        type: 'theorem',
        title: 'Reproductive Property',
        body: 'If $X \\sim \\text{Poisson}(\\lambda_1)$ and $Y \\sim \\text{Poisson}(\\lambda_2)$ are independent, then $X + Y \\sim \\text{Poisson}(\\lambda_1 + \\lambda_2)$.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Poisson Distribution in Python',
        mathBridge: '`scipy.stats.poisson` computes the PMF and CDF analytically. `np.random.poisson` simulates draws. Comparing the simulated histogram to the theoretical PMF validates the formula — and shows how the distribution shape changes as λ increases.',
        caption: 'Run each cell in order. Cell 3 challenges you to fit a Poisson model to real count data.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Poisson PMF, CDF, and shape exploration',
              prose: [
                'We use `scipy.stats.poisson` for exact PMF and CDF values. `poisson.pmf(k, mu=lam)` computes $P(X=k)$ for Poisson($\\lambda$). `poisson.cdf(k, mu=lam)` computes $P(X \\leq k)$.',
                'Notice how the PMF shifts right and widens as λ increases — the distribution is right-skewed for small λ and becomes more symmetric and bell-shaped as λ grows (by the CLT, Poisson($\\lambda$) → Normal($\\lambda, \\lambda$) as $\\lambda \\to \\infty$).',
                'The vertical red dashed line marks E[X] = λ. For small λ (say λ=1), the mode is at 0 or 1 — far from what feels like an average. For λ=6, the mode is at 5 or 6, and the distribution looks almost symmetric.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import poisson

# Explore several Poisson distributions
lambdas = [1, 3, 6, 12]
k_max = 25

fig, axes = plt.subplots(1, len(lambdas), figsize=(14, 4))

for ax, lam in zip(axes, lambdas):
    k = np.arange(0, k_max + 1)
    pmf = poisson.pmf(k, mu=lam)

    ax.bar(k, pmf, color='steelblue', edgecolor='navy', alpha=0.8, width=0.7)
    ax.axvline(lam, color='red', linestyle='--', linewidth=1.5, label=f'λ={lam}')
    ax.set_title(f'Poisson(λ={lam})', fontsize=11)
    ax.set_xlabel('k'); ax.set_ylabel('P(X=k)' if lam == 1 else '')
    ax.legend(fontsize=9); ax.grid(True, alpha=0.3)

plt.suptitle('Poisson PMF for Different λ', fontsize=13, y=1.01)
plt.tight_layout()
plt.show()

# Compute key probabilities for λ=6
lam = 6
print(f"Poisson(λ={lam}) probabilities:")
print(f"  P(X=0)  = {poisson.pmf(0, lam):.4f}   (e^-6 ≈ {np.exp(-6):.4f})")
print(f"  P(X=6)  = {poisson.pmf(6, lam):.4f}")
print(f"  P(X=10) = {poisson.pmf(10, lam):.4f}")
print(f"  P(X≤5)  = {poisson.cdf(5, lam):.4f}")
print(f"  P(X>8)  = {1 - poisson.cdf(8, lam):.4f}")
print(f"  E[X] = {lam}, Var(X) = {lam}, SD = {np.sqrt(lam):.4f}")`,
            },
            {
              id: 2,
              cellTitle: 'Simulation: Law of Large Numbers for Poisson',
              prose: [
                '`np.random.poisson(lam=6, size=N)` generates N independent Poisson(6) random values. As N grows, the sample mean converges to λ=6 and the sample variance converges to λ=6 as well — this is the unique mean=variance property of the Poisson.',
                'The histogram of simulated counts should match the theoretical PMF bars closely for large N. This validates both the formula and the simulation.',
                'The ratio of sample mean to sample variance (the **index of dispersion**) should be close to 1 for Poisson data. Values much greater than 1 indicate overdispersion; much less than 1 indicate underdispersion.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import poisson

np.random.seed(42)
lam = 6
N = 50_000

# Simulate N Poisson(6) draws
X = np.random.poisson(lam=lam, size=N)

# Verify E[X] ≈ Var(X) ≈ λ
sample_mean = np.mean(X)
sample_var  = np.var(X, ddof=0)
index_of_dispersion = sample_var / sample_mean

print(f"Simulation results (N={N:,}):")
print(f"  Sample mean    = {sample_mean:.4f}  (theoretical: {lam})")
print(f"  Sample variance = {sample_var:.4f}  (theoretical: {lam})")
print(f"  Index of dispersion (var/mean) = {index_of_dispersion:.4f}  (should be ≈1 for Poisson)")

# Compare histogram to theoretical PMF
k = np.arange(0, 20)
pmf_theory = poisson.pmf(k, mu=lam)

fig, ax = plt.subplots(figsize=(9, 4))
ax.hist(X, bins=np.arange(-0.5, 20.5), density=True,
        color='lightsteelblue', edgecolor='navy', alpha=0.7, label='Simulated')
ax.bar(k, pmf_theory, alpha=0.5, color='red', edgecolor='darkred',
       width=0.4, label='Theoretical PMF', align='center')
ax.set_xlabel('k', fontsize=12)
ax.set_ylabel('Relative frequency / PMF', fontsize=12)
ax.set_title(f'Simulation vs Theory: Poisson(λ={lam}), N={N:,}', fontsize=13)
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Poisson approximation to Binomial',
              prose: [
                'When n is large and p is small, Binomial(n,p) ≈ Poisson(np). This approximation is excellent when n ≥ 20 and p ≤ 0.05. The Poisson is much faster to compute (no binomial coefficients).',
                'The plot shows the absolute difference between Binomial and Poisson PMFs for several values of k. The approximation is best near the mean (k ≈ np) and deteriorates in the tails.',
                'Real use case: hard drive failure modeling. 10,000 sectors, each fails independently with p=0.00015. Computing the exact Binomial requires `binom(10000, k)` — possible but slow. Poisson(λ=1.5) is immediate.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import poisson, binom

# Hard drive failure: n=10000 sectors, p=0.00015
n, p = 10_000, 0.00015
lam = n * p  # λ = 1.5

k = np.arange(0, 10)
pmf_binom  = binom.pmf(k, n, p)
pmf_poiss  = poisson.pmf(k, mu=lam)
error      = np.abs(pmf_binom - pmf_poiss)

print(f"Binomial({n},{p}) vs Poisson(λ={lam})")
print(f"{'k':>4} | {'Binomial':>10} | {'Poisson':>10} | {'|Error|':>10}")
print("-" * 42)
for ki, pb, pp, err in zip(k, pmf_binom, pmf_poiss, error):
    print(f"{ki:>4} | {pb:>10.6f} | {pp:>10.6f} | {err:>10.2e}")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

width = 0.35
ax1.bar(k - width/2, pmf_binom, width, label=f'Binomial({n},{p})', color='steelblue', alpha=0.8)
ax1.bar(k + width/2, pmf_poiss, width, label=f'Poisson(λ={lam})', color='coral', alpha=0.8)
ax1.set_title('PMF Comparison', fontsize=12)
ax1.set_xlabel('k'); ax1.set_ylabel('P(X=k)')
ax1.legend(); ax1.grid(True, alpha=0.3)

ax2.bar(k, error, color='purple', alpha=0.7)
ax2.set_title('Absolute Error |Binomial − Poisson|', fontsize=12)
ax2.set_xlabel('k'); ax2.set_ylabel('|Error|')
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Emergency room arrivals and Poisson window scaling',
              difficulty: 'medium',
              prompt: 'An emergency room receives an average of 6 patients per hour following a Poisson process. (1) Find P(X=10) in one hour. (2) Find P(X≤3) in one hour. (3) What is the probability of zero arrivals in a 10-minute window? (Hint: 10 minutes = 1/6 hour, so the rate scales to λ=1.) (4) Simulate 10,000 one-hour periods and verify the simulated mean and variance both equal 6.',
              code: `import numpy as np
from scipy.stats import poisson

# Rate: 6 patients per hour
lam_hour = 6

# 1. P(X = 10) in one hour

# 2. P(X ≤ 3) in one hour

# 3. λ for 10 minutes (scale from hourly rate)

# 4. Simulate 10,000 one-hour periods
np.random.seed(0)
`,
              hint: 'poisson.pmf(k, mu=lam), poisson.cdf(k, mu=lam). For 10 minutes: lam_10min = 6 * (10/60) = 1. Simulate with np.random.poisson(lam_hour, size=10000).',
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Code: Poisson Distribution in OpenMAT / MATLAB',
        mathBridge: 'MATLAB\'s Statistics Toolbox provides `poisspdf`, `poisscdf`, and `poissrnd` for the Poisson distribution. Element-wise operations work naturally on vectors of k values.',
        caption: 'MATLAB functions mirror scipy.stats.poisson. The key difference: MATLAB uses `mu` as the parameter name.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Poisson PMF and CDF',
              prose: [
                '`poisspdf(k, lambda)` computes $P(X=k)$ for Poisson(λ). `poisscdf(k, lambda)` computes $P(X \\leq k)$. Both accept vector inputs for k.',
                '`bar(k, pmf, ...)` creates the PMF bar chart. The `xline(lambda, ...)` command marks the expected value.',
              ],
              code: `pkg load statistics
% Poisson PMF and CDF
lam = 6;
k = 0:20;

pmf = poisspdf(k, lam);
cdf_vals = poisscdf(k, lam);

fprintf('Poisson(lambda=%.0f) probabilities:\\n', lam);
fprintf('  P(X=0)  = %.4f\\n', poisspdf(0, lam));
fprintf('  P(X=6)  = %.4f\\n', poisspdf(6, lam));
fprintf('  P(X=10) = %.4f\\n', poisspdf(10, lam));
fprintf('  P(X<=5) = %.4f\\n', poisscdf(5, lam));
fprintf('  P(X>8)  = %.4f\\n', 1 - poisscdf(8, lam));

% PMF bar chart
figure;
bar(k, pmf, 0.7, 'FaceColor', [0.27 0.51 0.71], 'EdgeColor', 'navy');
hold on;
xline(lam, 'r--', 'LineWidth', 2);
xlabel('k'); ylabel('P(X = k)');
title(sprintf('Poisson(\\lambda=%d) PMF', lam));
legend('PMF', sprintf('\\lambda = %d', lam));
grid on; hold off;`,
            },
            {
              id: 2,
              cellTitle: 'Simulation and mean = variance verification',
              prose: [
                '`poissrnd(lambda, 1, N)` generates N independent Poisson(λ) samples as a row vector.',
                'The index of dispersion `var(X)/mean(X)` should be close to 1 for Poisson data. This is a standard test for Poisson goodness-of-fit in real count data.',
              ],
              code: `% Simulate Poisson(6) and verify E[X] = Var(X) = 6
rng(42);
lam = 6;
N = 50000;

X = poissrnd(lam, 1, N);

fprintf('Simulation (N=%d):\\n', N);
fprintf('  Sample mean     = %.4f  (theory: %.1f)\\n', mean(X), lam);
fprintf('  Sample variance = %.4f  (theory: %.1f)\\n', var(X), lam);
fprintf('  Index of disp.  = %.4f  (should be ~1 for Poisson)\\n', var(X)/mean(X));

% Histogram vs theoretical PMF
k = 0:20;
pmf_theory = poisspdf(k, lam);

figure;
histogram(X, -0.5:1:20.5, 'Normalization', 'probability', ...
          'FaceColor', [0.68 0.85 0.90], 'EdgeColor', 'navy');
hold on;
bar(k, pmf_theory, 0.4, 'FaceColor', [0.84 0.19 0.15], 'FaceAlpha', 0.5, 'EdgeColor', 'darkred');
xlabel('k'); ylabel('P(X=k)');
title(sprintf('Simulation vs Theory: Poisson(\\lambda=%d)', lam));
legend('Simulated', 'Theoretical PMF');
grid on; hold off;`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Server request modeling',
              difficulty: 'medium',
              prompt: 'A web server receives requests at an average rate of 120 per minute. (1) Compute P(X=120) for a one-minute window. (2) Compute P(X<100) for a one-minute window. (3) Find the probability that in a 0.5-second window (λ=1), there are zero requests. (4) Simulate 5,000 one-minute windows; verify the sample mean and variance both equal 120.',
              code: `% Server requests: Poisson(120) per minute
lam_per_min = 120;

% 1. P(X = 120)

% 2. P(X < 100) = P(X <= 99)

% 3. λ for 0.5 seconds

% 4. Simulate 5000 one-minute windows
rng(0);
`,
              hint: 'poisspdf(k, mu), poisscdf(k, mu). For 0.5s: lam_half = 120 * (0.5/60) = 1. Simulate with poissrnd(lam_per_min, 1, 5000).',
            },
          ],
        },
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Generating function proof of mean and variance.** The **probability generating function** (PGF) of $X$ is $G(z) = E[z^X] = \\sum_{k=0}^{\\infty} P(X=k) z^k$. For Poisson($\\lambda$): $G(z) = e^{\\lambda(z-1)}$. The first factorial moment $E[X] = G\'(1) = \\lambda e^{\\lambda(z-1)}|_{z=1} = \\lambda$. The second factorial moment $E[X(X-1)] = G\'\'(1) = \\lambda^2$, giving $\\text{Var}(X) = G\'\'(1) + G\'(1) - [G\'(1)]^2 = \\lambda^2 + \\lambda - \\lambda^2 = \\lambda$. PGFs provide a clean unified proof of all moments.',

      '**The Poisson process and exponential inter-arrivals.** In a Poisson process with rate $\\lambda$, the waiting time $T$ between consecutive events follows an Exponential($\\lambda$) distribution: $P(T > t) = e^{-\\lambda t}$, $E[T] = 1/\\lambda$. The connection: if inter-arrival times are i.i.d. Exponential($\\lambda$), then the count of arrivals in $[0,t]$ is Poisson($\\lambda t$). The Exponential distribution is the continuous counterpart — and like the Poisson, it is the unique distribution satisfying the memoryless property: $P(T > s + t | T > s) = P(T > t)$.',

      '**Overdispersion and the negative binomial.** Real count data often has variance greater than the mean. For example, insurance claims per customer: some customers are inherently high-risk, so claims cluster. The **negative binomial** distribution $\\text{NB}(r, p)$ has $\\text{Var}(X) = E[X] + E[X]^2/r > E[X]$. As $r \\to \\infty$, NB → Poisson. Fitting a Poisson to overdispersed data underestimates tail probabilities — a critical error in risk modeling. The **index of dispersion** $D = \\hat{\\sigma}^2/\\bar{X}$ is the standard diagnostic: if $D \\approx 1$, Poisson is plausible; if $D \\gg 1$, consider negative binomial.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Poisson as Maximum Entropy Distribution',
        body: 'Among all distributions on $\\{0,1,2,\\ldots\\}$ with a fixed mean $\\lambda$, the Poisson distribution maximizes entropy. This gives it a maximum-ignorance interpretation: if you know only the average count, Poisson is the least-committed distribution consistent with that constraint.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ──────────────────────────────────────────────────
  examples: [
    {
      id: 'stat5-003-ex1',
      title: 'Hospital ER Arrivals',
      problem: 'An ER admits patients at a Poisson rate of $\\lambda = 6$ per hour. Find: (a) $P(X=10)$; (b) $P(X \\leq 3)$; (c) $P(X \\geq 9)$.',
      steps: [
        {
          expression: 'P(X=10) = \\frac{e^{-6} \\cdot 6^{10}}{10!}',
          annotation: 'Apply the Poisson PMF directly. $6^{10} = 60{,}466{,}176$ and $10! = 3{,}628{,}800$.',
          strategyTitle: 'Apply PMF formula',
          hints: ['$e^{-6} \\approx 0.002479$. Compute $\\lambda^k / k!$ separately.'],
        },
        {
          expression: 'P(X=10) = 0.002479 \\times \\frac{60{,}466{,}176}{3{,}628{,}800} \\approx 0.002479 \\times 16.667 \\approx 0.0413',
          annotation: 'About a 4.1% chance of exactly 10 arrivals. In practice you would use a table or software.',
          strategyTitle: 'Numerical evaluation',
          hints: [],
        },
        {
          expression: 'P(X \\leq 3) = \\sum_{k=0}^{3} \\frac{e^{-6}6^k}{k!} = e^{-6}\\left(1 + 6 + 18 + 36\\right) = 0.002479 \\times 61 \\approx 0.1512',
          annotation: '$P(0) + P(1) + P(2) + P(3) = e^{-6}(1 + 6 + 6^2/2 + 6^3/6) = e^{-6}(1+6+18+36) = 61e^{-6}$.',
          strategyTitle: 'Sum CDF terms by hand',
          hints: ['Only 4 terms to sum. $6^0/0!=1$, $6^1/1!=6$, $6^2/2!=18$, $6^3/6=36$.'],
        },
        {
          expression: 'P(X \\geq 9) = 1 - P(X \\leq 8) \\approx 1 - 0.8472 = 0.1528',
          annotation: 'Use the complement: $P(X \\geq 9) = 1 - \\text{CDF}(8)$. The CDF at 8 is computed by summing $P(0)$ through $P(8)$, which requires software for precision.',
          strategyTitle: 'Complement rule',
          hints: [],
        },
      ],
      conclusion: '$P(X=10) \\approx 0.041$, $P(X \\leq 3) \\approx 0.151$, $P(X \\geq 9) \\approx 0.153$.',
    },
    {
      id: 'stat5-003-ex2',
      title: 'Scaling the Poisson Window',
      problem: 'Customers enter a coffee shop at a Poisson rate of 30 per hour. Find the probability of: (a) exactly 3 customers in a 10-minute window; (b) at least one customer in a 2-minute window.',
      steps: [
        {
          expression: '\\lambda_{10\\text{min}} = 30 \\times \\frac{10}{60} = 5',
          annotation: 'Scale the rate. 30 per hour → 5 per 10-minute window.',
          strategyTitle: 'Scale rate to window',
          hints: ['Always convert to the same unit. 10 minutes = 10/60 of an hour.'],
        },
        {
          expression: 'P(X=3) = \\frac{e^{-5} \\cdot 5^3}{3!} = \\frac{e^{-5} \\cdot 125}{6} \\approx 0.1404',
          annotation: 'Apply Poisson(5) PMF at k=3.',
          strategyTitle: 'Apply scaled PMF',
          hints: [],
        },
        {
          expression: '\\lambda_{2\\text{min}} = 30 \\times \\frac{2}{60} = 1',
          annotation: 'Scale for 2 minutes: $\\lambda = 1$.',
          strategyTitle: 'Scale for new window',
          hints: [],
        },
        {
          expression: 'P(X \\geq 1) = 1 - P(X=0) = 1 - e^{-1} \\approx 1 - 0.3679 = 0.6321',
          annotation: 'Use complement. $P(X=0) = e^{-1}$ for Poisson(1).',
          strategyTitle: 'Complement rule for P(X ≥ 1)',
          hints: ['P(X≥1) = 1 − P(X=0) = 1 − e^(−λ). This formula is the "probability of at least one event" for any Poisson.'],
        },
      ],
      conclusion: 'Scaling the rate is the core skill. $P(X=3)_{10\\text{min}} \\approx 0.140$; $P(X \\geq 1)_{2\\text{min}} \\approx 0.632$.',
    },
  ],

  // ── Challenges ────────────────────────────────────────────────
  challenges: [
    {
      id: 'stat5-003-ch1',
      difficulty: 'easy',
      problem: 'Typos occur in a document at an average rate of 0.5 per page (Poisson process). Find $P(X=0)$, $P(X=1)$, and $P(X \\geq 2)$ for a single page.',
      hint: 'P(X=0) = e^(−0.5). P(X=1) = 0.5·e^(−0.5). P(X≥2) = 1 − P(X=0) − P(X=1).',
      walkthrough: [
        { expression: 'P(X=0) = e^{-0.5} \\approx 0.6065', annotation: 'About 61% of pages are typo-free.' },
        { expression: 'P(X=1) = 0.5 \\cdot e^{-0.5} \\approx 0.3033', annotation: 'About 30% of pages have exactly 1 typo.' },
        { expression: 'P(X \\geq 2) = 1 - 0.6065 - 0.3033 = 0.0902', annotation: 'About 9% of pages have 2 or more typos.' },
      ],
      answer: '$P(X=0) \\approx 0.607$, $P(X=1) \\approx 0.303$, $P(X \\geq 2) \\approx 0.090$.',
    },
    {
      id: 'stat5-003-ch2',
      difficulty: 'medium',
      problem: 'A nuclear sample emits particles at 10 per second. (a) Find $P(X=0)$ in 0.1 seconds. (b) Find $P(X > 15)$ in 1 second. (c) What is the expected number of particles in 5 seconds?',
      hint: 'Scale λ by window length. For 0.1s: λ=1. For 1s: λ=10. For 5s: E[X]=5×10=50.',
      walkthrough: [
        { expression: 'P(X=0)_{0.1\\text{s}} = e^{-1} \\approx 0.368', annotation: '37% chance of zero emissions in 0.1 seconds.' },
        { expression: 'P(X>15)_{1\\text{s}} = 1 - P(X \\leq 15) \\approx 1 - 0.9513 = 0.0487', annotation: 'About 5% chance of more than 15 per second.' },
        { expression: 'E[X]_{5\\text{s}} = 5 \\times 10 = 50', annotation: 'Linearity: expected count scales with window.' },
      ],
      answer: '$P(X=0) \\approx 0.368$; $P(X>15) \\approx 0.049$; $E[X]_{5s} = 50$.',
    },
    {
      id: 'stat5-003-ch3',
      difficulty: 'hard',
      problem: 'A network router processes packets from two independent streams: stream A at rate $\\lambda_A = 4$ per ms, stream B at rate $\\lambda_B = 3$ per ms. (a) What distribution does the total traffic $T = A + B$ follow? (b) Find $P(T \\leq 5)$ per ms. (c) If the router can handle at most 10 packets per ms before dropping, what fraction of milliseconds will there be packet loss?',
      hint: 'Use the reproductive property: T ~ Poisson(λ_A + λ_B). Then P(T>10) = 1 − CDF(10) for Poisson(7).',
      walkthrough: [
        { expression: 'T = A + B \\sim \\text{Poisson}(4 + 3) = \\text{Poisson}(7)', annotation: 'Reproductive property: sum of independent Poissons is Poisson with summed rates.' },
        { expression: 'P(T \\leq 5) \\approx 0.3007', annotation: 'CDF of Poisson(7) at k=5, computed numerically.' },
        { expression: 'P(T > 10) = 1 - P(T \\leq 10) \\approx 1 - 0.9015 = 0.0985', annotation: 'About 9.9% of milliseconds will experience packet loss.' },
      ],
      answer: '$T \\sim \\text{Poisson}(7)$; $P(T \\leq 5) \\approx 0.301$; packet-loss rate ≈ 9.9% of ms.',
    },
  ],

  // ── Quiz ──────────────────────────────────────────────────────
  quiz: [
    {
      id: 'stat5-003-q1',
      type: 'choice',
      text: 'A Poisson random variable $X$ has $E[X] = 4$. What is $\\text{Var}(X)$?',
      options: ['2', '4', '16', '√4 = 2'],
      answer: '4',
      hints: ['The defining property of the Poisson distribution: E[X] = Var(X) = λ.'],
      reviewSection: 'Intuition → The signature property: mean equals variance',
    },
    {
      id: 'stat5-003-q2',
      type: 'choice',
      text: 'For Poisson(λ=2), what is $P(X=0)$?',
      options: ['0.5', '0.135', '0.271', '0.018'],
      answer: '0.135',
      hints: ['P(X=0) = e^(−λ) = e^(−2) ≈ 0.135.'],
      reviewSection: 'Math → Poisson PMF',
    },
    {
      id: 'stat5-003-q3',
      type: 'choice',
      text: 'Events occur at a Poisson rate of 12 per hour. What is the expected number of events in 15 minutes?',
      options: ['12', '4', '3', '6'],
      answer: '3',
      hints: ['15 minutes = 15/60 = 0.25 hours. λ per 15 min = 12 × 0.25 = 3.'],
      reviewSection: 'Intuition → Rescaling the window',
    },
    {
      id: 'stat5-003-q4',
      type: 'choice',
      text: 'Which condition is NOT required for a Poisson process?',
      options: [
        'Events in non-overlapping intervals are independent',
        'The number of trials n is fixed',
        'The rate λ is constant over time',
        'At most one event can occur in a very short interval',
      ],
      answer: 'The number of trials n is fixed',
      hints: ['A fixed n is a Binomial requirement (BINS). The Poisson process has no concept of "number of trials" — it counts events in a continuous time window.'],
      reviewSection: 'Intuition → The Poisson process: three defining properties',
    },
    {
      id: 'stat5-003-q5',
      type: 'choice',
      text: 'If $X \\sim \\text{Poisson}(3)$ and $Y \\sim \\text{Poisson}(5)$ are independent, what distribution does $X+Y$ follow?',
      options: ['Poisson(15)', 'Poisson(8)', 'Binomial(8, 0.5)', 'Normal(8, 8)'],
      answer: 'Poisson(8)',
      hints: ['Reproductive property: the sum of independent Poisson random variables is Poisson with the sum of the rates.'],
      reviewSection: 'Math → Reproductive property',
    },
    {
      id: 'stat5-003-q6',
      type: 'choice',
      text: 'When is the Poisson distribution a good approximation for a Binomial(n, p)?',
      options: [
        'When n is small and p is close to 0.5',
        'When n is large and p is small, with λ = np moderate',
        'When n = p',
        'Only when np > 30',
      ],
      answer: 'When n is large and p is small, with λ = np moderate',
      hints: ['The rule of thumb: n ≥ 20 and p ≤ 0.05. The Poisson approximation improves as n → ∞ with np = λ fixed.'],
      reviewSection: 'Intuition → Poisson approximation to Binomial',
    },
    {
      id: 'stat5-003-q7',
      type: 'choice',
      text: 'A hospital receives 3 emergency calls per hour on average. What is $P(X=0)$ — the probability of no calls in the next hour?',
      options: ['0.368', '0.224', '0.0498', '0.149'],
      answer: '0.0498',
      hints: [
        'P(X=0) = e^(−λ) = e^(−3).',
        'e^(−3) ≈ 0.0498. About a 5% chance of no calls in an hour.',
      ],
      reviewSection: 'Math → Poisson PMF',
    },
    {
      id: 'stat5-003-q8',
      type: 'choice',
      text: 'For a Poisson(λ) random variable, the standard deviation is:',
      options: ['λ', 'λ²', '√λ', '1/λ'],
      answer: '√λ',
      hints: [
        'Var(X) = λ for a Poisson distribution.',
        'SD = √Var(X) = √λ.',
      ],
      reviewSection: 'Semantics → Var(X) = λ',
    },
    {
      id: 'stat5-003-q9',
      type: 'choice',
      text: 'A machine produces defects at a rate of 8 per hour. What is the expected number of defects in a 30-minute window?',
      options: ['8', '4', '2', '16'],
      answer: '4',
      hints: [
        'Scale the rate: λ_new = λ_base × (new window / base window).',
        '8 per hour × (30 min / 60 min) = 8 × 0.5 = 4.',
      ],
      reviewSection: 'Intuition → Rescaling the window',
    },
    {
      id: 'stat5-003-q10',
      type: 'choice',
      text: 'A count dataset has sample mean 5.2 and sample variance 9.8. The index of dispersion D = 9.8/5.2 ≈ 1.88. What does this indicate?',
      options: [
        'Perfect Poisson fit (D = 1 expected)',
        'Underdispersed — Poisson overfits',
        'Overdispersed — Poisson may not fit; consider negative binomial',
        'Underdispersed — use binomial instead',
      ],
      answer: 'Overdispersed — Poisson may not fit; consider negative binomial',
      hints: [
        'For Poisson: E[X] = Var(X), so D = Var/Mean should be ≈1.',
        'D > 1 → variance exceeds mean → overdispersed. Poisson model may underestimate variability.',
      ],
      reviewSection: 'Semantics → Index of dispersion D',
    },
  ],

  // ── Checkpoints ───────────────────────────────────────────────
  checkpoints: [
    { id: 'stat5-003-cp1', label: 'State the four conditions for a Poisson model.', type: 'read' },
    { id: 'stat5-003-cp2', label: 'Compute P(X=0) and P(X=3) for Poisson(λ=2) by hand.', type: 'example' },
    { id: 'stat5-003-cp3', label: 'Scale a rate: arrivals at 24/hour → rate per 5-minute window.', type: 'example' },
    { id: 'stat5-003-cp4', label: 'Explain why mean = variance is a diagnostic property.', type: 'read' },
    { id: 'stat5-003-cp5', label: 'Apply the reproductive property: find the distribution of the sum of two independent Poissons.', type: 'challenge' },
    { id: 'stat5-003-cp6', label: 'Simulate Poisson(5) in Python and verify sample mean ≈ sample variance ≈ 5.', type: 'lab' },
  ],

  definitions: [
    {
      term: "Poisson distribution",
      definition: "A discrete probability distribution counting the number of events in a fixed interval (time, space, volume) when events occur at a constant average rate λ and independently. P(X=k) = e^(−λ)λᵏ/k!. E[X] = Var(X) = λ.",
    },
    {
      term: "Poisson process",
      definition: "A stochastic process satisfying: (1) events in non-overlapping intervals are independent; (2) the rate λ is constant; (3) at most one event occurs in any infinitesimally small interval. The count in any fixed window follows a Poisson distribution.",
    },
    {
      term: "rate parameter λ (lambda)",
      definition: "The average number of events per unit time (or space) in a Poisson process. Also equals the mean and variance of the Poisson distribution. To rescale: λ_new = λ_base × (new window / base window).",
    },
    {
      term: "overdispersion",
      definition: "When the observed variance exceeds the mean in count data (index of dispersion D = Var/Mean > 1). Violates the Poisson assumption E[X]=Var(X). Suggests a negative binomial or other overdispersed model.",
    },
    {
      term: "reproductive property",
      definition: "If X ~ Poisson(λ₁) and Y ~ Poisson(λ₂) are independent, then X+Y ~ Poisson(λ₁+λ₂). The sum of independent Poisson random variables is also Poisson with rate equal to the sum of rates.",
    },
    {
      term: "index of dispersion",
      definition: "D = sample variance / sample mean. For Poisson data, D ≈ 1. D > 1 indicates overdispersion; D < 1 indicates underdispersion. A key diagnostic for whether the Poisson model fits a dataset.",
    },
  ],

  // ── Semantics ─────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'P(X=k) = e^{-\\lambda}\\lambda^k/k!', meaning: 'Poisson PMF — probability of exactly k events when the average rate is λ' },
      { symbol: 'E[X] = \\lambda', meaning: 'Expected number of events equals the rate parameter' },
      { symbol: '\\text{Var}(X) = \\lambda', meaning: 'Variance equals the rate parameter — unique to Poisson; mean-variance equality is the Poisson diagnostic' },
      { symbol: 'D = \\hat{\\sigma}^2/\\bar{X}', meaning: 'Index of dispersion — should be ≈1 for Poisson data; > 1 = overdispersed; < 1 = underdispersed' },
    ],
    rulesOfThumb: [
      'Mean = variance for Poisson. If they differ significantly in your data, the Poisson model may not fit.',
      'P(X ≥ 1) = 1 − e^(−λ): the probability of at least one event. Useful shortcut.',
      'Scale the rate by the window: λ_new = λ_base × (new window / base window).',
      'Use Poisson ≈ Binomial when n ≥ 20 and p ≤ 0.05.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      { lessonId: 'stat5-001', label: 'Discrete Random Variables & E[X]', note: 'Review PMF definition, E[X] formula, and Var shortcut if the Poisson formulas feel unfamiliar.' },
      { lessonId: 'stat5-002', label: 'Binomial Distribution', note: 'The Poisson arises as the n→∞ limit of Binomial(n,p) with np=λ fixed.' },
    ],
    futureLinks: [
      { lessonId: 'stat5-004', label: 'Normal Distribution', note: 'For large λ, Poisson(λ) ≈ Normal(λ, λ) — the CLT applied to count data.' },
      { lessonId: 'stat6-001', label: 'Hypothesis Testing', note: 'Testing whether an observed count is consistent with a claimed Poisson rate uses a likelihood-ratio test.' },
    ],
  },

  // ── Mastery ───────────────────────────────────────────────────
  mastery: {
    targetLevel: 3,
    solveIndependently: 'Given a described Poisson scenario, identify λ, scale it for a given window, compute PMF and CDF probabilities, and apply the reproductive property.',
    explainVerbally: 'Explain why mean = variance is the Poisson signature and what overdispersion means for model validity.',
    detectIncorrectApplication: 'Identify when the independence assumption of the Poisson is violated (clustering events) or when the Binomial should be used instead of the Poisson approximation.',
    transferToUnfamiliar: 'Model a new count-data scenario (network packets, mutations, defects) as a Poisson process, compute relevant probabilities, and simulate to verify.',
  },
};
