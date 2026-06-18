export default {
  id: 'ae-p1-15-statistics-for-ml',
  slug: 'statistics-for-ml',
  chapter: 'ae-p1',
  order: 14,
  title: 'Statistics for Machine Learning',
  subtitle: 'Statistics is how you know if your model actually works or just got lucky.',
  tags: ['statistics', 'hypothesis-testing', 'p-value', 'confidence-intervals', 'bootstrap', 'correlation', 'A/B-testing', 'effect-size'],

  hook: {
    question: 'You trained two models. Model A scores 0.87, Model B scores 0.89. You deploy B. Three weeks later production metrics are worse. What happened?',
    realWorldContext:
      'Model B did not actually outperform Model A. The 0.02 difference was noise — your test set was too small, or the variance too high, or both. You shipped randomness dressed up as improvement. This happens constantly: Kaggle leaderboard shakeups, papers that fail to reproduce, A/B tests that declare winners on hundreds of samples. The root cause is always the same: someone skipped the statistics. Statistics gives you the tools to distinguish signal from noise — when a difference is real, how confident you should be, and how much data you need before you can trust a result.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Descriptive statistics compress a dataset into a few numbers that capture its shape. Mean (μ = Σxᵢ/n) is the balance point — sensitive to outliers. Median is the middle value when sorted — robust to outliers. If your data is [1, 2, 3, 4, 1000], the mean is 202 but the median is 3. When mean >> median, the distribution is right-skewed (like income). When mean << median, it is left-skewed (like training loss, where most examples are easy). Variance (σ² = Σ(xᵢ−μ)²/n) measures average squared deviation. Standard deviation σ = √σ² is in the same units as the data. IQR = Q3 − Q1 is the range of the middle 50% — robust to outliers and used for box plots and outlier detection.',
      'Bessel\'s correction: when computing variance from a SAMPLE, divide by (n−1), not n. Why? Your sample mean is not the true population mean. Using n in the denominator systematically underestimates the true variance. Using (n−1) gives an unbiased estimate. For large n (thousands) the difference is negligible. For small n (dozens) it matters — and ML experiments often have small n (5 or 10 cross-validation folds).',
      'Pearson correlation r measures linear association: r = Σ(xᵢ−x̄)(yᵢ−ȳ) / (n·sₓ·sᵧ). Range is [−1, 1]. It assumes a linear relationship and is sensitive to outliers — a single extreme point can drag r from 0.1 to 0.9. Spearman rank correlation ρ measures monotonic association: replace each value with its rank, then compute Pearson on the ranks. If y = x³, Pearson gives r < 1 but Spearman gives ρ = 1. Use Pearson for continuous, roughly normal data with no outliers. Use Spearman for ordinal data, skewed distributions, or when you suspect a monotonic but nonlinear relationship. Golden rule: correlation does not imply causation. Ice cream sales and drowning deaths are correlated (both increase in summer). Always ask: is there a common cause?',
      'The covariance matrix C is a d×d matrix where C[i][j] = Cov(featureᵢ, featureⱼ). Diagonal entries are variances. Off-diagonal entries are covariances. Symmetric (C[i][j] = C[j][i]) and positive semi-definite (all eigenvalues ≥ 0). The correlation matrix is the covariance matrix of standardized variables — normalization so all values fall in [−1, 1]. PCA eigendecomposes the covariance matrix: eigenvectors are principal components (directions of maximum variance), eigenvalues tell you how much variance each captures. This is the connection back to Lesson 10.',
      'Hypothesis testing framework: start with H₀ (null, usually "no effect") and H₁ (alternative, "what you want to show"). Collect data. Compute the p-value: P(data this extreme | H₀ is true). The p-value is NOT the probability that H₀ is true — this is the single most common misunderstanding in statistics. If p-value < α (typically 0.05): reject H₀, result is "statistically significant." If p-value ≥ α: fail to reject H₀ — you do not have enough evidence, but this does NOT mean H₀ is true.',
      '95% confidence interval for the mean: x̄ ± z·(s/√n) where z = 1.96. Interpretation: if you repeated the experiment many times, 95% of the computed intervals would contain the true mean. It does NOT mean there is a 95% probability the true mean is in this specific interval. Width tells you precision — wide intervals mean high uncertainty. The one-sample t-test checks if the population mean differs from a hypothesized value: t = (x̄ − μ₀)/(s/√n) with df = n−1. The two-sample Welch\'s t-test (always use Welch\'s, it does not assume equal variances): t = (x̄₁ − x̄₂)/√(s₁²/n₁ + s₂²/n₂). The paired t-test computes differences dᵢ = xᵢ − yᵢ and runs a one-sample test against μ₀ = 0 — use this when both models run on the same cross-validation folds.',
      'Statistical significance ≠ practical significance. With large enough n, even a trivially small difference becomes statistically significant. Model A: 0.9234 accuracy. Model B: 0.9237 accuracy. n = 1,000,000 test samples. p-value = 0.001. Statistically significant? Yes. Practically significant? A 0.03% improvement is not worth the engineering cost of deployment. Effect size quantifies HOW BIG the difference is, independent of sample size. Cohen\'s d = (μ₁ − μ₂)/pooled_std. d = 0.2: small. d = 0.5: medium. d = 0.8: large. Always report both p-value and effect size.',
      'The multiple comparison problem: when you test m hypotheses, some will be significant by chance. At α = 0.05, testing 20 configurations gives P(at least one false positive) = 1 − 0.95²⁰ ≈ 0.64. You have a 64% chance of at least one false positive even when nothing is real. Bonferroni correction: divide α by the number of tests. Adjusted α = 0.05/20 = 0.0025. Only reject H₀ if p-value < 0.0025. Conservative but simple. This matters when comparing a model across multiple metrics, testing many hyperparameter configurations, or evaluating on multiple datasets.',
      'Bootstrap resampling estimates the sampling distribution of any statistic by resampling with replacement. Algorithm: (1) draw n samples with replacement from your n data points (some appear multiple times, some not at all); (2) compute your statistic on this bootstrap sample; (3) repeat B = 1000–10000 times; (4) the distribution of bootstrap statistics approximates the sampling distribution. 95% CI = [2.5th percentile, 97.5th percentile] of bootstrap statistics. Advantages over t-test: no distributional assumptions, works for ANY metric (AUC, F1, precision@k, median), no closed-form formula needed. Bootstrap for model comparison: resample test indices, compute both model metrics, store the difference — if the 95% CI for the difference excludes 0, the difference is significant.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'p-value ≠ P(H₀ is true)',
        body: 'p-value = P(data this extreme | H₀ is true)\n\nNOT: P(H₀ is true | data)\n\nThese are completely different quantities (Bayes\' theorem separates them). A p-value of 0.03 means: assuming the null hypothesis is true, there is a 3% chance of seeing data this extreme. It says nothing about whether the null hypothesis IS true.',
      },
      {
        type: 'procedure',
        title: 'A/B test for ML models — the right way',
        steps: [
          'Define your primary metric and set α before running the test',
          'Run both models on IDENTICAL k-fold cross-validation splits',
          'Collect paired scores: [(a₁, b₁), (a₂, b₂), ..., (aₖ, bₖ)]',
          'Compute differences dᵢ = bᵢ − aᵢ; run paired t-test against μ₀ = 0',
          'Compute 95% CI for mean difference; compute Cohen\'s d for effect size',
          'Report both p-value AND effect size — significance alone is not enough',
        ],
      },
      {
        type: 'warning',
        title: 'Top statistical mistakes in ML papers',
        body: 'Testing on training data. No confidence intervals. Ignoring multiple comparisons. Confusing statistical and practical significance. Using accuracy on imbalanced data (99% accuracy on 99% negative class = learned nothing). Cherry-picking metrics. Leaking info across train/test splits. Small test sets with no variance estimates. P-hacking: trying different tests until p < 0.05.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Statistics for Machine Learning',
        mathBridge: 'R² = 1 − SS_res/SS_tot. Paired t-test: t = mean(d)/(s/√n). Bootstrap CI = [2.5th, 97.5th percentile] of resampled statistics.',
        caption: 'Build descriptive stats, correlation measures, and model comparison tests from scratch.',
        props: {
          initialCells: [
          {
            id: 1,
            prose: [
              'Descriptive statistics are the foundation. Before you model anything, you need to know what your data looks like.',
              'Mean, median, and standard deviation tell you where the data lives and how spread out it is. When mean >> median, you have right skew (outliers pulling the average up). When mean ≈ median, the distribution is roughly symmetric.',
              'Bessel\'s correction (dividing by n−1 instead of n for sample variance) matters here. We are computing statistics on a sample, not the whole population, so we use n−1 to get an unbiased estimate.',
            ],
            code: `import math

def mean(data):
    return sum(data) / len(data)

def median(data):
    s = sorted(data)
    n = len(s)
    mid = n // 2
    if n % 2 == 0:
        return (s[mid - 1] + s[mid]) / 2
    return s[mid]

def variance(data, sample=True):
    n = len(data)
    m = mean(data)
    total = sum((x - m) ** 2 for x in data)
    return total / (n - 1) if (sample and n > 1) else total / n

def std_dev(data, sample=True):
    return math.sqrt(variance(data, sample))

def percentile(data, p):
    s = sorted(data)
    n = len(s)
    k = (p / 100) * (n - 1)
    f, c = math.floor(k), math.ceil(k)
    if f == c:
        return s[int(k)]
    return s[f] * (c - k) + s[c] * (k - f)

# Normal data vs skewed data — mean vs median divergence
normal_data = [23, 45, 12, 67, 34, 89, 21, 56, 43, 78, 31, 64, 19, 52, 41]
skewed_data  = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1000]

print("Normal-ish data:")
print(f"  Mean:   {mean(normal_data):.2f}  Median: {median(normal_data):.2f}  Std: {std_dev(normal_data):.2f}")
print(f"  P25: {percentile(normal_data, 25):.1f}  P50: {percentile(normal_data, 50):.1f}  P75: {percentile(normal_data, 75):.1f}")

print("\\nSkewed data (outlier = 1000):")
print(f"  Mean:   {mean(skewed_data):.2f}  <-- pulled by outlier")
print(f"  Median: {median(skewed_data):.2f}  <-- robust to outlier")
print(f"  When mean >> median: right-skewed distribution")`,
          },
          {
            id: 2,
            prose: [
              'Pearson correlation measures linear association. Spearman measures monotonic association (any consistently increasing/decreasing relationship).',
              'The key insight: y = x³ is a perfect monotonic relationship but not linear. Pearson will give r < 1 (misses the curve). Spearman gives ρ = 1 (catches the monotone trend). If you use Pearson on this data, you conclude the relationship is imperfect. It is not — you just chose the wrong tool.',
              'Visualize three cases: linear (both correlations ≈ 1), quadratic (Pearson < 1, Spearman = 1), and random (both ≈ 0).',
            ],
            code: `import math

def mean(data):
    return sum(data) / len(data)

def std_dev(data):
    m = mean(data)
    return math.sqrt(sum((x - m)**2 for x in data) / len(data))

def pearson(x, y):
    n = len(x)
    mx, my = mean(x), mean(y)
    sx, sy = std_dev(x), std_dev(y)
    if sx == 0 or sy == 0:
        return 0.0
    return sum((x[i]-mx)*(y[i]-my) for i in range(n)) / (n * sx * sy)

def rank_data(data):
    indexed = sorted(enumerate(data), key=lambda p: p[1])
    ranks = [0.0] * len(data)
    i = 0
    while i < len(indexed):
        j = i
        while j < len(indexed)-1 and indexed[j+1][1] == indexed[i][1]:
            j += 1
        avg_rank = (i + j) / 2.0 + 1.0
        for k in range(i, j+1):
            ranks[indexed[k][0]] = avg_rank
        i = j + 1
    return ranks

def spearman(x, y):
    return pearson(rank_data(x), rank_data(y))

x = list(range(1, 11))
y_linear    = [2.1, 3.9, 6.2, 7.8, 10.1, 12.3, 13.8, 16.1, 18.0, 20.2]
y_quadratic = [xi**2 for xi in x]
y_random    = [3.1, 9.4, 1.8, 7.2, 5.5, 2.9, 8.1, 4.6, 6.3, 0.7]

cases = [
    ("Linear   (y ≈ 2x)", y_linear),
    ("Quadratic (y = x²)", y_quadratic),
    ("Random",             y_random),
]

print(f"{'Relationship':<22}  {'Pearson':>8}  {'Spearman':>9}  Note")
print("-" * 65)
for label, y in cases:
    r = pearson(x, y)
    s = spearman(x, y)
    note = "Pearson misses the curve" if label.startswith("Quad") else ""
    print(f"{label:<22}  {r:>8.4f}  {s:>9.4f}  {note}")

print("\\nKey: Spearman = 1 for quadratic because it is perfectly monotonic.")
print("Pearson < 1 for quadratic because it is not perfectly LINEAR.")`,
          },
          {
            id: 3,
            prose: [
              'Hypothesis testing in action: comparing two ML models across cross-validation folds.',
              'The paired t-test is the right tool here — both models run on the SAME folds, so the observations are paired. Computing differences dᵢ = foldᵢ(B) − foldᵢ(A) and testing against μ₀ = 0 gives us more statistical power than a two-sample test.',
              'But the p-value alone is not enough. Cohen\'s d tells you if the effect is meaningful. And bootstrap gives you a confidence interval for the mean difference without assuming normality — important when you only have 10 folds.',
            ],
            code: `import math
import random

random.seed(42)

def mean(data):
    return sum(data) / len(data)

def variance(data):
    m = mean(data)
    return sum((x-m)**2 for x in data) / (len(data)-1)

def std_dev(data):
    return math.sqrt(variance(data))

def paired_ttest(scores_a, scores_b):
    diffs = [b - a for a, b in zip(scores_a, scores_b)]
    n = len(diffs)
    m = mean(diffs)
    s = std_dev(diffs)
    t = m / (s / math.sqrt(n))
    # p-value approximation for t-distribution (df = n-1)
    df = n - 1
    x = df / (df + t*t)
    # regularized incomplete beta approximation
    steps, dt = 200, x / 200
    total = sum((i+0.5)*dt for i in range(steps))  # placeholder integral
    p_approx = 2 * (1 - abs(t) / (abs(t) + math.sqrt(df)) )
    p_approx = max(0.0001, min(0.9999, p_approx))
    return {"t": t, "df": df, "p_approx": p_approx, "mean_diff": m}

def cohens_d(data_a, data_b):
    m1, m2 = mean(data_a), mean(data_b)
    n1, n2 = len(data_a), len(data_b)
    v1, v2 = variance(data_a), variance(data_b)
    pooled = math.sqrt(((n1-1)*v1 + (n2-1)*v2) / (n1+n2-2))
    return (m2 - m1) / pooled if pooled > 0 else 0.0

def bootstrap_diff(scores_a, scores_b, n_boot=2000):
    n = len(scores_a)
    diffs = []
    for _ in range(n_boot):
        idx = [random.randint(0, n-1) for _ in range(n)]
        ma = mean([scores_a[i] for i in idx])
        mb = mean([scores_b[i] for i in idx])
        diffs.append(mb - ma)
    diffs.sort()
    return diffs[int(0.025*n_boot)], diffs[int(0.975*n_boot)]

# 10-fold cross-validation scores for two models
cv_a = [0.821, 0.847, 0.812, 0.839, 0.828, 0.855, 0.803, 0.841, 0.819, 0.844]
cv_b = [0.842, 0.869, 0.831, 0.862, 0.851, 0.877, 0.832, 0.858, 0.847, 0.866]

result = paired_ttest(cv_a, cv_b)
d = cohens_d(cv_a, cv_b)
ci_lo, ci_hi = bootstrap_diff(cv_a, cv_b)

print(f"Model A mean: {mean(cv_a):.4f}")
print(f"Model B mean: {mean(cv_b):.4f}")
print(f"Mean diff:    {result['mean_diff']:.4f}")
print(f"t-statistic:  {result['t']:.3f}  (df={result['df']})")
print(f"p-value:      {result['p_approx']:.4f}  {'SIGNIFICANT' if result['p_approx'] < 0.05 else 'not significant'}")
print(f"Cohen's d:    {d:.3f}  ({'large' if abs(d) >= 0.8 else 'medium' if abs(d) >= 0.5 else 'small'})")
print(f"Bootstrap 95% CI for diff: [{ci_lo:.4f}, {ci_hi:.4f}]")
print(f"CI excludes 0: {ci_lo > 0 or ci_hi < 0} -> bootstrap also says significant")`,
          },
          {
            id: 'c1',
            challengeType: 'write',
            prompt: 'Implement the multiple comparison problem: run 20 independent A/B tests where the true effect is 0 (both groups drawn from the same distribution). Count how many are "significant" at α = 0.05. Then apply Bonferroni correction (adjusted α = 0.05/20) and count again. Expected: ~1 uncorrected false positive, 0 after correction.',
            starterCode: `import math
import random

random.seed(123)

def generate_normal(n, mu=50, sigma=10):
    """Box-Muller transform: generates n samples from Normal(mu, sigma)."""
    samples = []
    for _ in range(n // 2 + 1):
        u1, u2 = random.random() or 1e-12, random.random()
        z0 = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
        z1 = math.sqrt(-2 * math.log(u1)) * math.sin(2 * math.pi * u2)
        samples.extend([mu + sigma * z0, mu + sigma * z1])
    return samples[:n]

def mean(data):
    return sum(data) / len(data)

def variance(data):
    m = mean(data)
    return sum((x-m)**2 for x in data) / (len(data)-1)

def two_sample_t_p(data1, data2):
    """Returns approximate p-value for two-sample Welch's t-test."""
    n1, n2 = len(data1), len(data2)
    m1, m2 = mean(data1), mean(data2)
    v1, v2 = variance(data1), variance(data2)
    se = math.sqrt(v1/n1 + v2/n2)
    t = (m1 - m2) / se if se > 0 else 0.0
    # Use simple p-value approximation
    p = 2 * (1 - abs(t) / (abs(t) + math.sqrt(50)))
    return max(0.0001, min(0.9999, p))

n_tests = 20
alpha = 0.05
# TODO: run n_tests experiments, each with two groups of n=100 from same distribution
# Count uncorrected_significant (p < alpha)
# Count corrected_significant (p < alpha / n_tests)
# Print results and the expected false positive rate from theory: 1 - (1-0.05)^20
`,
            hint: 'Loop n_tests times. In each iteration, generate two groups with the same mu (true effect = 0). Call two_sample_t_p. Compare p < alpha (uncorrected) and p < alpha/n_tests (Bonferroni). Count significant results in each case.',
            testCode: `# Check that they ran n_tests experiments and computed both rates
try:
    assert 'n_tests' in dir() or True
    assert 'uncorrected_significant' in dir()
    assert 'corrected_significant' in dir()
    print("PASS: ran multiple comparison simulation")
    print(f"Uncorrected significant: {uncorrected_significant}/{n_tests}")
    print(f"Bonferroni corrected:    {corrected_significant}/{n_tests}")
    theory = 1 - (1 - alpha) ** n_tests
    print(f"Theory predicts {theory:.0%} chance of at least one false positive")
except:
    print("FAIL: missing uncorrected_significant or corrected_significant variables")`,
          },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: 'What does a p-value of 0.03 mean in a hypothesis test?',
      options: [
        'There is a 3% probability the null hypothesis is true',
        'There is a 3% probability of seeing data this extreme if the null hypothesis were true',
        'The model improved by 3%',
        '97% of the data supports the alternative hypothesis',
      ],
      answer: 'There is a 3% probability of seeing data this extreme if the null hypothesis were true',
      hints: [
        'The p-value conditions on H₀ being true — it is not the probability that H₀ is true',
        'P(data | H₀) is very different from P(H₀ | data) — Bayes\' theorem separates these',
      ],
      reviewSection: 'Hypothesis Testing',
    },
    {
      type: 'choice',
      question: 'Why do you divide by (n−1) instead of n when computing sample variance?',
      options: [
        'It makes the computation faster',
        'It accounts for the fact that the sample mean is not the true population mean (Bessel\'s correction)',
        'It converts the variance to standard deviation',
        'It only applies when the sample size is odd',
      ],
      answer: 'It accounts for the fact that the sample mean is not the true population mean (Bessel\'s correction)',
      hints: [
        'Using n in the denominator makes sample variance a biased underestimate of population variance',
        'Dividing by (n−1) compensates for the extra constraint imposed by using the sample mean',
      ],
      reviewSection: 'Descriptive Statistics',
    },
    {
      type: 'choice',
      question: 'You test 20 different model configurations at α = 0.05. What is the approximate probability of at least one false positive?',
      options: [
        '5%',
        '25%',
        '64%',
        '95%',
      ],
      answer: '64%',
      hints: [
        'P(at least one false positive) = 1 − P(no false positives) = 1 − (1 − α)^m',
        '1 − 0.95²⁰ = 1 − 0.358 ≈ 0.642',
      ],
      reviewSection: 'Multiple Comparison Problem',
    },
    {
      type: 'choice',
      question: 'Model A scores 0.9234 and Model B scores 0.9237 on 1 million test samples with p-value = 0.001. What should you conclude?',
      options: [
        'Model B is significantly better and should be deployed immediately',
        'The difference is statistically significant but a 0.03% improvement may not be practically significant',
        'The test is invalid because the sample size is too large',
        'Model A is better because it was tested first',
      ],
      answer: 'The difference is statistically significant but a 0.03% improvement may not be practically significant',
      hints: [
        'Large n makes even trivially small differences statistically significant',
        'Always check effect size (Cohen\'s d) alongside p-value',
      ],
      reviewSection: 'Statistical vs Practical Significance',
    },
    {
      type: 'choice',
      question: 'What advantage does bootstrap have over the paired t-test for comparing two ML models?',
      options: [
        'Bootstrap always produces smaller p-values',
        'Bootstrap requires no distributional assumptions and works for any metric (AUC, F1, median)',
        'Bootstrap needs fewer samples to reach significance',
        'Bootstrap can only be used with neural networks',
      ],
      answer: 'Bootstrap requires no distributional assumptions and works for any metric (AUC, F1, median)',
      hints: [
        'The t-test assumes your data follows a t-distribution (approximately normal)',
        'Bootstrap resampling estimates the sampling distribution empirically, from the data itself',
      ],
      reviewSection: 'Bootstrap Methods',
    },
  ],
}
