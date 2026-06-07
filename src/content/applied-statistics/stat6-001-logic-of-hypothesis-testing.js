export default {
  id: 'stat6-001',
  slug: 'logic-of-hypothesis-testing',
  chapter: 'stat6',
  order: 1,
  title: 'The Logic of Hypothesis Testing',
  subtitle: 'How statisticians use data to decide whether a claim about the world is credible.',
  tags: [
    'hypothesis testing',
    'null hypothesis',
    'alternative hypothesis',
    'p-value',
    'type I error',
    'type II error',
    'significance level',
    'test statistic',
    'statistical inference',
    'alpha',
    'rejection region',
  ],
  aliases:
    'hypothesis test null alternative p-value alpha significance level type I error type II error rejection region test statistic one-sided two-sided A/B testing drug approval',
  timeToComplete: 50,
  coreConcept:
    'Hypothesis testing is a formal framework for deciding whether data provides enough evidence to reject a specific claim (H₀). You quantify how surprising the data would be if H₀ were true using a p-value. If the p-value falls below a pre-set threshold α, you reject H₀ — not because you proved H₁, but because the data is too unlikely to have arisen by chance alone.',
  prerequisites: ['stat5-005', 'stat1-004'],
  nextLesson: 'stat6-002',

  hook: {
    question:
      'A pharmaceutical company claims a new drug reduces blood pressure by more than 5 mmHg. After a clinical trial, the sample shows an average reduction of 5.9 mmHg. How do you decide whether that 0.9 mmHg difference is real — or just random noise?',
    realWorldContext:
      'Every day, decisions worth billions of dollars and millions of lives hinge on hypothesis tests. In medicine, the FDA requires randomized controlled trials to show that a new drug outperforms a placebo — not just by luck, but with a p-value below 0.05 in a pre-registered test. In technology, every A/B test at companies like Google, Netflix, and Amazon asks: "Did version B genuinely outperform version A, or did we just get a lucky sample?" In manufacturing, Six Sigma quality engineers use hypothesis tests to decide whether a new machining process has truly shifted the defect rate, or whether the improvement seen in a pilot batch is within normal random variation. In genomics, researchers conduct hundreds of thousands of simultaneous hypothesis tests to identify which genes are associated with disease. The logic in every case is identical: start with a specific claim (the null hypothesis), collect data, measure how surprising the data would be if the claim were true, and decide. Understanding this framework is the gateway to all of statistical inference.',
    previewVisualizationId: 'HypothesisTestViz',
  },

  intuition: {
    prose: [
      '**Roadmap for this lesson.** By the end, you will be able to (1) state the null and alternative hypotheses for a real problem, (2) explain what a p-value measures in plain English, (3) define Type I and Type II errors and identify which is controlled by α, (4) distinguish one-sided from two-sided tests, and (5) correctly apply the decision rule "reject H₀ if p-value < α." This lesson is the foundation for all of Chapter 6 — every specific test (t-test, chi-square, ANOVA) is just a different way to compute the test statistic within this same logical framework.',

      '**A concrete starting example.** A vending machine is supposed to dispense 12 oz of soda. Quality control engineers sample 30 cups and find the sample mean is 11.7 oz with a sample standard deviation of 0.6 oz. The question: is the machine misbehaving, or is 11.7 oz close enough to 12 oz to attribute to random variation? The null hypothesis is H₀: μ = 12 (the machine is working correctly). The alternative is H₁: μ ≠ 12 (the machine is off). If H₀ were true, what would a sample mean of 11.7 look like? The standard error is 0.6/√30 ≈ 0.11 oz. So 11.7 is about (11.7 − 12)/0.11 ≈ −2.7 standard errors below what H₀ predicts. That is the test statistic. It tells you how many "standard errors away from H₀" the data landed.',

      '**Before reading on, predict:** If you repeated this sampling procedure 10,000 times with a machine that truly dispenses exactly 12 oz on average, what fraction of those samples would produce a mean 2.7 or more standard errors away from 12 — purely by random chance? Think about what a very small fraction would mean for the vending machine.',

      '**The p-value answers that question.** The p-value is the probability of observing a test statistic as extreme or more extreme than the one you actually got, assuming H₀ is true. For a test statistic of −2.7 from a normal distribution, this probability (two-sided) is about 0.007 — less than 1%. If the machine truly dispensed 12 oz on average, you would get a sample this extreme less than 1% of the time just by luck. That is the surprise measure: "how often would random sampling produce data this far from H₀?" A tiny p-value says the data is very surprising under H₀, which is evidence against H₀. Crucially, the p-value is NOT the probability that H₀ is true. It is P(data this extreme | H₀ is true) — a conditional probability.',

      '**Type I and Type II errors: the two ways to be wrong.** There are two possible mistakes in hypothesis testing. A **Type I error** (false positive) occurs when you reject H₀ even though it is actually true — you concluded the machine was broken when it was fine. The probability of a Type I error is exactly α, the significance level you choose before the test. Common choices are α = 0.05 (5% chance of falsely crying wolf) or α = 0.01 for high-stakes decisions. A **Type II error** (false negative) occurs when you fail to reject H₀ even though H₁ is actually true — you concluded the machine was fine when it was actually broken. The probability of a Type II error is called β. The **power** of a test is 1 − β: the probability of correctly detecting a real effect. You cannot make both α and β arbitrarily small simultaneously with a fixed sample size — reducing α increases β, and vice versa. This tradeoff is why large clinical trials are essential: bigger samples reduce β without inflating α.',

      '**One-sided vs. two-sided alternatives.** The alternative hypothesis H₁ shapes the test. A **two-sided** (two-tailed) test asks: "Is the parameter different from H₀ in either direction?" (H₁: μ ≠ 12). You reject if the data is surprisingly large OR surprisingly small. A **one-sided** (one-tailed) test asks: "Is the parameter larger (or smaller) than H₀?" (H₁: μ < 12 or H₁: μ > 12). One-sided tests have more power to detect an effect in the predicted direction, but you must commit to the direction before seeing the data. Never switch to a one-sided test after seeing that the result is in the "wrong" direction for a two-sided test — that is p-hacking. In practice, two-sided tests are the default for most scientific contexts because effects can surprise you.',

      '**The decision rule and its logic.** You set α before collecting data. You compute the p-value from the data. The rule: **reject H₀ if p-value < α; fail to reject H₀ if p-value ≥ α**. "Fail to reject" is not the same as "accept H₀." Absence of evidence is not evidence of absence. With a very small sample, a real effect might exist but produce a large p-value because the test has low power. In manufacturing and engineering contexts, "fail to reject H₀" means you have not shown the process has changed — not that you have proven it is stable. This asymmetry is fundamental: hypothesis tests can disprove H₀ with high confidence, but they cannot prove it.',

      '**CNC and manufacturing application.** In CNC precision machining, tolerances are tight: a shaft diameter might need to be 25.00 ± 0.02 mm. A quality engineer runs a hypothesis test after a tool change: H₀: μ = 25.00 (process is centered), H₁: μ ≠ 25.00. If the p-value from 20 sample measurements is 0.03 and α = 0.05, the engineer rejects H₀ — the process appears to have shifted, and the machine needs recalibration before producing more parts. If the p-value is 0.15, the engineer fails to reject H₀ — no convincing evidence of a shift. The same framework governs whether a new drug cures cancer, whether a webpage redesign increases clicks, or whether a new alloy meets strength specifications.',

      '**Why p = 0.05 specifically?** The 0.05 threshold is a convention introduced by Ronald Fisher in the 1920s, not a law of nature. Fisher chose it as a convenient threshold for "small enough to take seriously." In fields where errors are costly (medicine, aerospace), α = 0.01 or even 0.001 is standard. In exploratory research or A/B testing with low stakes, α = 0.10 is sometimes used. The important thing is to set α before the experiment, not to tune it until you get the desired result. The reproducibility crisis in science has been partly caused by researchers implicitly using α = 0.05 as a hard binary while also running many tests and selecting favorable results — a practice that inflates the true Type I error rate far above 5%.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: The Five Steps of a Hypothesis Test',
        body: 'Step 1. **State the hypotheses.** Write H₀ (the null — always an equality, e.g., μ = μ₀) and H₁ (the alternative — e.g., μ ≠ μ₀, μ > μ₀, or μ < μ₀). Both must be stated before looking at the data.\n\nStep 2. **Choose α.** Select the significance level (0.05, 0.01, or 0.10) based on the cost of a Type I error. Higher stakes → lower α.\n\nStep 3. **Compute the test statistic.** This measures how far the data is from H₀ in standard-error units. The formula depends on the test (z, t, chi-square, F).\n\nStep 4. **Compute the p-value.** The p-value is the probability of observing a test statistic as extreme or more extreme, assuming H₀ is true. For a two-sided test: p = 2·P(Z > |test stat|). For one-sided (upper): p = P(Z > test stat).\n\nStep 5. **Make the decision.** If p-value < α → reject H₀ (evidence supports H₁). If p-value ≥ α → fail to reject H₀ (insufficient evidence against H₀). State the conclusion in context, not just in symbols.',
      },
      {
        type: 'definition',
        title: 'Definition: p-Value',
        body: 'The **p-value** is P(observing a test statistic as extreme or more extreme than the one computed | H₀ is true).\n\nKey clarifications:\n• p-value is NOT P(H₀ is true | data)\n• p-value is NOT the probability the result occurred by chance\n• A small p-value means: "if H₀ were true, data this extreme would be very unlikely"\n• p-value does NOT measure the size or importance of an effect\n• Two studies: p = 0.001 with n = 1,000,000 and p = 0.04 with n = 20 can both be "statistically significant" but tell very different stories about effect magnitude',
      },
      {
        type: 'definition',
        title: 'Definition: Type I and Type II Errors',
        body: '|  | H₀ True | H₀ False |\n|---|---|---|\n| **Reject H₀** | Type I Error (α) | Correct (Power = 1−β) |\n| **Fail to Reject** | Correct (1−α) | Type II Error (β) |\n\n**Type I error (α):** Rejecting H₀ when it is true — a false positive. Controlled by your choice of α.\n**Type II error (β):** Failing to reject H₀ when it is false — a false negative. Controlled by sample size and effect size.\n**Power (1−β):** Probability of correctly detecting a true effect. Aim for ≥ 80% in well-designed studies.',
      },
      {
        type: 'warning',
        title: 'Warning: "Fail to Reject" ≠ "Accept H₀"',
        body: 'A p-value ≥ α does NOT mean H₀ is true or proven. It means the data did not provide enough evidence to reject it — which might be because:\n(a) H₀ is genuinely true, OR\n(b) The sample was too small to detect the real effect (low power)\n\nExample: You test H₀: a coin is fair (p=0.5). You flip 10 times and get 6 heads. p-value ≈ 0.75 → fail to reject. But with 10 flips you have very low power to detect a coin with p=0.6. A 60%-biased coin would fail detection most of the time with n=10.\n\nConclusion: Always report confidence intervals alongside p-values, and discuss power when failing to reject.',
      },
      {
        type: 'warning',
        title: 'Warning: One-Sided Tests Require Pre-Commitment',
        body: 'You must decide the direction of the one-sided alternative BEFORE collecting data.\n\nForbidden practice: Collect data, see that the effect is positive, then switch from H₁: μ ≠ μ₀ to H₁: μ > μ₀ to get a smaller p-value (halving the two-sided p-value).\n\nThis doubles your true Type I error rate. The p-value is valid only when the test design (including direction of H₁) is fixed before data collection. Changing direction post-hoc is p-hacking.',
      },
      {
        type: 'insight',
        title: 'Insight: The Asymmetry of Hypothesis Testing',
        body: 'Hypothesis testing is deliberately asymmetric — it is designed to protect H₀ (the status quo) from being wrongly overturned.\n\nH₀ is like the defendant in a trial: presumed innocent until proven guilty beyond reasonable doubt (α = the acceptable doubt level). Evidence must be overwhelming before you convict. This asymmetry is intentional: in medicine, you do not want to approve ineffective drugs; in manufacturing, you do not want to declare a functioning machine broken; in science, you do not want to publish false discoveries.\n\nThe asymmetry means: strong evidence → reject H₀. Weak evidence → do not conclude anything. You never "prove" H₀ with a hypothesis test.',
      },
      {
        type: 'strategy',
        title: 'Strategy: Choosing α',
        body: 'Set α based on the relative cost of errors:\n\n• α = 0.001: Use when Type I errors are catastrophic (nuclear safety, FDA drug approval for serious side effects)\n• α = 0.01: Standard in medicine, genetics, high-stakes engineering\n• α = 0.05: Default in most scientific research and A/B testing\n• α = 0.10: Sometimes used in exploratory studies or when Type II errors are more costly (missing a real effect)\n\nRule of thumb: If a false positive (crying wolf) is more damaging than a false negative (missing a real effect), use smaller α. If missing a real effect is worse (e.g., missing a disease), use larger α (or equivalently, prioritize high power).',
      },
    ],
    visualizations: [
      {
        id: 'HypothesisTestViz',
        title: 'p-Value as Tail Area Under the Null Distribution',
        mathBridge:
          'Drag the z-stat slider to position your observed test statistic. The blue shaded region is the p-value — the probability of data this extreme assuming H₀ is true. The red dashed lines mark the critical values at your chosen α. When the blue region is smaller than the red region (z crosses the critical value), you reject H₀.',
        caption:
          'Switch between one-tailed and two-tailed, and change α, to see how the critical values and decision boundary shift.',
      },
    ],
  },

  math: {
    prose: [
      '**Formal setup.** Let $X_1, X_2, \\ldots, X_n$ be a random sample from a population with unknown parameter $\\theta$. A hypothesis test evaluates two competing claims: the null hypothesis $H_0: \\theta = \\theta_0$ (a specific value) and the alternative $H_1$, which can be $\\theta \\neq \\theta_0$ (two-sided), $\\theta > \\theta_0$ (upper one-sided), or $\\theta < \\theta_0$ (lower one-sided). A **test statistic** $T = T(X_1, \\ldots, X_n)$ is a function of the data whose sampling distribution under $H_0$ is known. The test statistic measures how far the data is from what $H_0$ predicts, in units of its own standard deviation.',

      '**The p-value defined precisely.** For an observed test statistic $t_{obs}$, the p-value is:\n$$p = \\begin{cases} P(T \\geq t_{obs} \\mid H_0) & \\text{upper one-sided} \\\\\\\\ P(T \\leq t_{obs} \\mid H_0) & \\text{lower one-sided} \\\\\\\\ 2 \\cdot P(T \\geq |t_{obs}| \\mid H_0) & \\text{two-sided} \\end{cases}$$\nThe two-sided formula uses $|t_{obs}|$ because either tail is equally extreme. For a standard normal test statistic $Z$, the two-sided p-value is $2(1 - \\Phi(|z_{obs}|))$ where $\\Phi$ is the standard normal CDF.',

      '**Decision rule and critical values.** The rejection region approach: find the critical value $z_{\\alpha}$ such that $P(Z > z_{\\alpha}) = \\alpha$ for an upper one-sided test, or $P(Z > z_{\\alpha/2}) = \\alpha/2$ for a two-sided test. Reject $H_0$ if $|t_{obs}| > z_{\\alpha/2}$ (two-sided). For $\\alpha = 0.05$: $z_{\\alpha/2} = 1.96$. For $\\alpha = 0.01$: $z_{\\alpha/2} = 2.576$. The p-value and critical value approaches are equivalent: p-value $< \\alpha$ iff $|t_{obs}| > z_{\\alpha/2}$.',

      '**Type I and Type II error probabilities.** Under a specific alternative $H_1: \\theta = \\theta_1$, the power function is $\\beta(\\theta_1) = P(\\text{Reject } H_0 \\mid \\theta = \\theta_1)$. For a z-test with known $\\sigma$, $n$ observations, and two-sided $H_1$:\n$$\\text{Power} = \\Phi\\!\\left(z_{\\alpha/2} + \\frac{\\theta_1 - \\theta_0}{\\sigma/\\sqrt{n}}\\right) + \\Phi\\!\\left(-z_{\\alpha/2} + \\frac{\\theta_1 - \\theta_0}{\\sigma/\\sqrt{n}}\\right)$$\nwhere the second term is usually negligible. This shows that power increases as (a) the true effect $|\\theta_1 - \\theta_0|$ grows, (b) $n$ increases, (c) $\\sigma$ decreases, or (d) $\\alpha$ increases.',

      '**The z-test for a population mean (known σ).** If $X_1, \\ldots, X_n \\overset{iid}{\\sim} N(\\mu, \\sigma^2)$ with $\\sigma$ known (or $n$ large enough for CLT), the test statistic for $H_0: \\mu = \\mu_0$ is:\n$$Z = \\frac{\\bar{X} - \\mu_0}{\\sigma / \\sqrt{n}} \\sim N(0, 1) \\text{ under } H_0$$\nFor the vending machine example: $Z = (11.7 - 12)/(0.6/\\sqrt{30}) = -0.3/0.1095 \\approx -2.74$. Two-sided p-value $= 2(1 - \\Phi(2.74)) \\approx 2(0.0031) = 0.0062 < 0.05$. Reject $H_0$: the machine appears miscalibrated.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Insight: p-Value Uniformity Under H₀',
        body: 'Under H₀, the p-value $p$ follows a Uniform(0,1) distribution. This means that if H₀ is true, every p-value between 0 and 1 is equally likely. In particular:\n• P(p < 0.05 | H₀ true) = 0.05 exactly (definition of α)\n• If you run 100 tests all with H₀ true, expect about 5 to yield p < 0.05 by chance alone\n\nThis is why multiple testing correction (Bonferroni, FDR) is essential when running many tests simultaneously — each test has a 5% false-positive rate, which compounds quickly.',
      },
      {
        type: 'warning',
        title: 'Warning: p-Value Depends on Sample Size',
        body: 'For fixed effect size $\\delta = \\theta_1 - \\theta_0$, the z-statistic scales as $\\sqrt{n}$:\n$$Z = \\frac{\\delta}{\\sigma/\\sqrt{n}} = \\frac{\\delta \\sqrt{n}}{\\sigma}$$\nAs $n \\to \\infty$, any nonzero $\\delta$ will eventually yield $p < 0.05$. With $n = 10{,}000$ patients, a blood pressure reduction of 0.1 mmHg (clinically irrelevant) can produce $p < 0.001$. Statistical significance ≠ practical importance. Always report effect size alongside p-value.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Hypothesis Testing Logic in Python/NumPy',
        mathBridge:
          'This notebook simulates the p-value concept from scratch: generate data under H₀, compute test statistics for thousands of samples, and observe that the p-value distribution is uniform. Then conduct a real one-sample z-test and visualize the rejection region.',
        caption: 'Run each cell to see the math become code.',
        initialProps: {
          initialCells: [
            {
              id: 'py-cell-1',
              cellTitle: 'Simulating the p-Value Distribution Under H₀',
              prose: [
                'We simulate the p-value concept by generating thousands of samples from a population where H₀ is true (μ = 10), computing the test statistic for each, and computing the corresponding two-sided p-value.',
                'Under H₀, p-values should be uniformly distributed between 0 and 1. We confirm this with a histogram — any departure from uniform suggests a problem with the test setup.',
                'The key line is `p_values = 2 * (1 - stats.norm.cdf(np.abs(z_stats)))`. This computes the two-sided p-value for each simulated z-statistic using the standard normal CDF.',
                'We count how many p-values fall below α=0.05 — it should be very close to 5% (the Type I error rate), confirming the test is properly calibrated.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

np.random.seed(42)

# Simulate many samples from the null distribution (mu=10, sigma=2, n=25)
mu_0 = 10.0
sigma = 2.0
n = 25
n_simulations = 10000

# Draw 10,000 samples under H0
samples = np.random.normal(loc=mu_0, scale=sigma, size=(n_simulations, n))
sample_means = samples.mean(axis=1)

# Compute z-statistics
se = sigma / np.sqrt(n)
z_stats = (sample_means - mu_0) / se

# Compute two-sided p-values
p_values = 2 * (1 - stats.norm.cdf(np.abs(z_stats)))

# How many fall below alpha = 0.05?
alpha = 0.05
false_positives = np.sum(p_values < alpha)
print(f"Simulations: {n_simulations}")
print(f"p-values < 0.05: {false_positives} ({100*false_positives/n_simulations:.1f}%)")
print(f"Expected by Type I error definition: ~{100*alpha:.0f}%")
print()

# Visualize: p-value distribution under H0 should be Uniform(0,1)
fig, axes = plt.subplots(1, 2, figsize=(12, 4))

axes[0].hist(p_values, bins=20, color='steelblue', edgecolor='white', alpha=0.8)
axes[0].axhline(n_simulations/20, color='red', linestyle='--', label='Expected (uniform)')
axes[0].axvline(alpha, color='orange', linestyle='--', label=f'α = {alpha}')
axes[0].set_xlabel('p-value')
axes[0].set_ylabel('Count')
axes[0].set_title('p-Value Distribution Under H₀ (should be uniform)')
axes[0].legend()

axes[1].hist(z_stats, bins=40, color='seagreen', edgecolor='white', alpha=0.8, density=True)
x = np.linspace(-4, 4, 200)
axes[1].plot(x, stats.norm.pdf(x), 'r-', linewidth=2, label='N(0,1) theoretical')
axes[1].set_xlabel('z-statistic')
axes[1].set_ylabel('Density')
axes[1].set_title('z-Statistics Under H₀ follow N(0,1)')
axes[1].legend()

plt.tight_layout()
plt.show()
`,
            },
            {
              id: 'py-cell-2',
              cellTitle: 'Conducting a Two-Sided z-Test and Visualizing the Rejection Region',
              prose: [
                'We now test a concrete hypothesis: a vending machine should dispense μ₀ = 12 oz. We observe n=30 cups with sample mean x̄ = 11.7 oz and assume σ = 0.6 oz (known from historical data).',
                'The test statistic `z_obs = (x_bar - mu_0) / (sigma / np.sqrt(n))` measures how many standard errors the sample mean is from H₀. A z-score of −2.74 means the sample is 2.74 SEs below the null hypothesis value.',
                'The two-sided p-value `p_value = 2 * (1 - stats.norm.cdf(abs(z_obs)))` is the area in BOTH tails beyond ±2.74 under the N(0,1) curve. This is the probability of seeing data this extreme under H₀.',
                'The shaded regions in the plot are the rejection regions — the two tails containing 2.5% each (for α=0.05 two-sided). If the test statistic falls in either shaded tail, we reject H₀.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

# Observed data
x_bar = 11.7    # sample mean
mu_0 = 12.0     # null hypothesis value
sigma = 0.6     # known population SD (historical data)
n = 30          # sample size
alpha = 0.05    # significance level

# Step 1: Compute the test statistic
se = sigma / np.sqrt(n)
z_obs = (x_bar - mu_0) / se
print(f"Standard error: {se:.4f}")
print(f"Test statistic: z = ({x_bar} - {mu_0}) / {se:.4f} = {z_obs:.4f}")

# Step 2: Compute the two-sided p-value
p_value = 2 * (1 - stats.norm.cdf(abs(z_obs)))
print(f"Two-sided p-value: {p_value:.4f}")

# Step 3: Critical value for alpha=0.05 two-sided
z_crit = stats.norm.ppf(1 - alpha/2)
print(f"Critical value (z_alpha/2): ±{z_crit:.4f}")

# Step 4: Decision
if p_value < alpha:
    print(f"\\nDecision: p={p_value:.4f} < α={alpha} → REJECT H₀")
    print("Conclusion: Evidence that the machine is not dispensing 12 oz.")
else:
    print(f"\\nDecision: p={p_value:.4f} ≥ α={alpha} → FAIL TO REJECT H₀")

# Visualize
fig, ax = plt.subplots(figsize=(10, 5))
x = np.linspace(-4, 4, 400)
y = stats.norm.pdf(x)
ax.plot(x, y, 'b-', linewidth=2, label='N(0,1) under H₀')

# Shade rejection regions
x_right = np.linspace(z_crit, 4, 100)
x_left = np.linspace(-4, -z_crit, 100)
ax.fill_between(x_right, stats.norm.pdf(x_right), alpha=0.4, color='red', label=f'Rejection region (α/2 = {alpha/2})')
ax.fill_between(x_left, stats.norm.pdf(x_left), alpha=0.4, color='red')

# Mark observed test statistic
ax.axvline(z_obs, color='darkgreen', linewidth=2.5, linestyle='--', label=f'Observed z = {z_obs:.2f}')
ax.axvline(-z_crit, color='red', linewidth=1.5, linestyle=':')
ax.axvline(z_crit, color='red', linewidth=1.5, linestyle=':')

ax.set_xlabel('z-statistic')
ax.set_ylabel('Density')
ax.set_title(f'Two-Sided z-Test: H₀: μ=12 vs H₁: μ≠12\\np-value = {p_value:.4f}  |  {"REJECT H₀" if p_value < alpha else "FAIL TO REJECT H₀"}')
ax.legend()
plt.tight_layout()
plt.show()
`,
            },
            {
              id: 'py-cell-3',
              cellTitle: 'One-Sided vs. Two-Sided Tests: A/B Testing Scenario',
              prose: [
                'In an A/B test for a website, the control conversion rate is 5%. After showing version B to 1,000 users, 63 converted (6.3%). We test whether version B is BETTER (one-sided) vs. simply DIFFERENT (two-sided).',
                'The test statistic uses the normal approximation to the binomial. Under H₀: p = 0.05, the standard error is sqrt(p₀(1-p₀)/n) = sqrt(0.05*0.95/1000) ≈ 0.00689.',
                'For the one-sided test (H₁: p > 0.05), the p-value is just the upper tail: `p_one_sided = 1 - stats.norm.cdf(z_obs)`. For the two-sided test, it is doubled. The one-sided p-value is always half the two-sided p-value (when the observed effect is in the predicted direction).',
                'This shows why pre-committing to direction matters: choosing one-sided vs. two-sided after seeing the data is inappropriate and inflates false positive rate.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

# A/B test: control conversion rate p0 = 5%
# Version B: 63 conversions out of 1000 users
p_0 = 0.05      # null hypothesis conversion rate
x_conv = 63     # observed conversions
n = 1000        # sample size
p_hat = x_conv / n  # observed proportion

alpha = 0.05

# Standard error under H0
se = np.sqrt(p_0 * (1 - p_0) / n)
z_obs = (p_hat - p_0) / se

print(f"Observed proportion: {p_hat:.4f} ({p_hat*100:.1f}%)")
print(f"Null proportion: {p_0:.4f} ({p_0*100:.1f}%)")
print(f"Standard error under H₀: {se:.5f}")
print(f"Test statistic: z = {z_obs:.4f}")
print()

# One-sided p-value (H1: p > p0)
p_one_sided = 1 - stats.norm.cdf(z_obs)
# Two-sided p-value (H1: p ≠ p0)
p_two_sided = 2 * (1 - stats.norm.cdf(abs(z_obs)))

print(f"One-sided p-value (H₁: p > 0.05):  {p_one_sided:.4f}")
print(f"Two-sided p-value (H₁: p ≠ 0.05): {p_two_sided:.4f}")
print(f"Ratio: {p_two_sided/p_one_sided:.1f}x (two-sided is always 2× one-sided when effect is in predicted direction)")
print()

for test_type, p_val, h1 in [('One-sided', p_one_sided, 'p > 0.05'), ('Two-sided', p_two_sided, 'p ≠ 0.05')]:
    decision = 'REJECT H₀' if p_val < alpha else 'FAIL TO REJECT H₀'
    print(f"{test_type} (H₁: {h1}): p = {p_val:.4f} → {decision}")

# Plot
fig, axes = plt.subplots(1, 2, figsize=(14, 4))
x = np.linspace(-4, 4, 400)
y = stats.norm.pdf(x)

for ax, (test_type, p_val, title) in zip(axes, [
    ('one', p_one_sided, f'One-Sided Test (H₁: p > 0.05)\\np = {p_one_sided:.4f}'),
    ('two', p_two_sided, f'Two-Sided Test (H₁: p ≠ 0.05)\\np = {p_two_sided:.4f}')
]):
    ax.plot(x, y, 'b-', linewidth=2)
    if test_type == 'one':
        x_fill = np.linspace(z_obs, 4, 100)
        ax.fill_between(x_fill, stats.norm.pdf(x_fill), alpha=0.4, color='red', label='p-value')
    else:
        x_r = np.linspace(abs(z_obs), 4, 100)
        x_l = np.linspace(-4, -abs(z_obs), 100)
        ax.fill_between(x_r, stats.norm.pdf(x_r), alpha=0.4, color='red', label='p-value')
        ax.fill_between(x_l, stats.norm.pdf(x_l), alpha=0.4, color='red')
    ax.axvline(z_obs, color='darkgreen', linewidth=2, linestyle='--', label=f'z = {z_obs:.2f}')
    ax.set_title(title)
    ax.set_xlabel('z')
    ax.legend()

plt.tight_layout()
plt.show()
`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Simulate Type I Error Rate',
              difficulty: 'medium',
              prompt:
                'A quality control process tests H₀: μ = 50 (machine is centered) with α = 0.05. The true population has μ = 50 (H₀ is TRUE), σ = 5, n = 20. Simulate 5,000 hypothesis tests (z-tests) and confirm that the Type I error rate is approximately 5%. Then repeat with α = 0.01 and confirm ~1% false positive rate. Plot histograms of both p-value distributions.',
              code: `import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

np.random.seed(99)

# Parameters
mu_true = 50  # H0 is actually TRUE
sigma = 5
n = 20
n_sims = 5000

# TODO: Simulate n_sims samples under H0
# For each sample, compute z-stat and p-value
# Count how many p-values fall below alpha=0.05 and alpha=0.01
# Print both Type I error rates
# Plot histogram of p-values under H0
`,
              hint: 'Draw samples with `np.random.normal(mu_true, sigma, (n_sims, n))`, then compute sample means, z-stats, and p-values in vectorized form. The p-value histogram under H₀ should look approximately uniform (flat).',
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Code: Hypothesis Testing Logic in OpenMAT / MATLAB',
        mathBridge:
          'The MATLAB code replicates the p-value simulation and z-test visualization, demonstrating the same concepts with MATLAB syntax — useful for engineers who work in MATLAB/Simulink environments.',
        caption: 'OpenMAT mirrors real MATLAB syntax.',
        initialProps: {
          initialCells: [
            {
              id: 'mat-cell-1',
              cellTitle: 'Simulating p-Value Distribution Under H₀',
              prose: [
                'We simulate 10,000 samples from the null distribution and compute z-statistics and p-values for each.',
                'Under H₀, p-values are Uniform(0,1). We verify this by counting the fraction below α = 0.05 — it should be approximately 5%.',
                'The `normpdf` and `normcdf` functions compute the normal density and CDF respectively. `normcdf(-abs(z), 0, 1)` gives the lower tail probability.',
                'The histogram is plotted with `histogram` and a reference line for the expected uniform frequency is added with `yline`.',
              ],
              code: `pkg load statistics
% Simulate p-value distribution under H0
rng(42);
mu_0 = 10; sigma = 2; n = 25;
n_sims = 10000;

% Generate 10,000 samples of size n under H0
samples = mu_0 + sigma * randn(n_sims, n);
sample_means = mean(samples, 2);   % column vector of means

% Compute z-statistics
se = sigma / sqrt(n);
z_stats = (sample_means - mu_0) / se;

% Two-sided p-values
p_values = 2 * (1 - normcdf(abs(z_stats)));

% Count Type I errors at alpha = 0.05
alpha = 0.05;
n_reject = sum(p_values < alpha);
fprintf('Simulations: %d\\n', n_sims);
fprintf('p-values < 0.05: %d (%.1f%%)\\n', n_reject, 100*n_reject/n_sims);
fprintf('Expected: ~%.0f%%\\n', 100*alpha);

% Plot p-value histogram
figure('Position', [100 100 600 400]);
histogram(p_values, 20, 'FaceColor', [0.27 0.51 0.71], 'EdgeColor', 'white');
yline(n_sims/20, 'r--', 'LineWidth', 2, 'Label', 'Expected (uniform)');
xline(alpha, 'Color', [1 0.5 0], 'LineWidth', 2, 'Label', sprintf('\\alpha = %.2f', alpha));
xlabel('p-value');
ylabel('Count');
title('p-Value Distribution Under H_0 (should be uniform)');
`,
            },
            {
              id: 'mat-cell-2',
              cellTitle: 'Two-Sided z-Test: Vending Machine Example',
              prose: [
                'We test H₀: μ = 12 oz vs H₁: μ ≠ 12 oz for a vending machine that dispensed a sample mean of 11.7 oz (n=30, σ=0.6).',
                'The `norminv(1 - alpha/2)` call returns the critical z-value (1.96 for α=0.05). The decision is automatic: compare z_obs to z_crit or p to alpha.',
                'The plot uses `fill` to shade the rejection regions red and marks the observed z-statistic with a vertical dashed line.',
                'Reading the output: z = −2.74, p = 0.0062 < 0.05 → reject H₀. The machine is dispensing below specification.',
              ],
              code: `% Two-sided z-test: vending machine example
x_bar = 11.7;   % sample mean
mu_0 = 12.0;    % null hypothesis value
sigma = 0.6;    % known SD
n = 30;
alpha = 0.05;

% Standard error and test statistic
se = sigma / sqrt(n);
z_obs = (x_bar - mu_0) / se;
fprintf('Standard error: %.4f\\n', se);
fprintf('z-statistic: %.4f\\n', z_obs);

% Two-sided p-value
p_value = 2 * (1 - normcdf(abs(z_obs)));
fprintf('Two-sided p-value: %.4f\\n', p_value);

% Critical value
z_crit = norminv(1 - alpha/2);
fprintf('Critical value (z_{alpha/2}): %.4f\\n', z_crit);

if p_value < alpha
    fprintf('Decision: p < alpha -> REJECT H0\\n');
    fprintf('Conclusion: Machine is not dispensing 12 oz on average.\\n');
else
    fprintf('Decision: p >= alpha -> FAIL TO REJECT H0\\n');
end

% Plot
x = linspace(-4, 4, 400);
y = normpdf(x);
figure('Position', [100 100 700 450]);
plot(x, y, 'b-', 'LineWidth', 2);
hold on;

% Shade rejection regions
x_right = linspace(z_crit, 4, 100);
x_left  = linspace(-4, -z_crit, 100);
fill([x_right fliplr(x_right)], [normpdf(x_right) zeros(1,100)], 'red', 'FaceAlpha', 0.4);
fill([x_left  fliplr(x_left)],  [normpdf(x_left)  zeros(1,100)], 'red', 'FaceAlpha', 0.4);

xline(z_obs, '--g', 'LineWidth', 2.5, 'Label', sprintf('z_{obs} = %.2f', z_obs));
xline(-z_crit, ':r', 'LineWidth', 1.5);
xline(z_crit,  ':r', 'LineWidth', 1.5);

xlabel('z-statistic'); ylabel('Density');
title(sprintf('Two-Sided z-Test: H_0: \\mu=12 vs H_1: \\mu\\neq 12\\np-value = %.4f', p_value));
legend('N(0,1) under H_0', 'Rejection region', '', 'Observed z');
hold off;
`,
            },
            {
              id: 'mat-cell-3',
              cellTitle: 'One-Sided vs. Two-Sided: A/B Test Example',
              prose: [
                'We compare one-sided and two-sided p-values for an A/B test where the control conversion rate is 5% and version B showed 6.3% (63/1000 users).',
                'The one-sided p-value is `1 - normcdf(z_obs)` (upper tail only). The two-sided is `2*(1 - normcdf(abs(z_obs)))`.',
                'We display results using `fprintf` and create a side-by-side subplot showing the shaded tail areas for each test type.',
                'Note: the two-sided p-value is exactly twice the one-sided p-value when the effect is in the predicted direction — demonstrating the cost of not pre-committing to directionality.',
              ],
              code: `% One-sided vs. two-sided: A/B test
p_0 = 0.05;     % null conversion rate
x_conv = 63;    % observed conversions
n = 1000;       % sample size
p_hat = x_conv / n;
alpha = 0.05;

% Standard error and test statistic
se = sqrt(p_0 * (1 - p_0) / n);
z_obs = (p_hat - p_0) / se;

fprintf('Observed proportion: %.4f (%.1f%%)\\n', p_hat, p_hat*100);
fprintf('z-statistic: %.4f\\n', z_obs);

p_one = 1 - normcdf(z_obs);       % one-sided (H1: p > p0)
p_two = 2 * (1 - normcdf(abs(z_obs)));  % two-sided
fprintf('One-sided p-value: %.4f\\n', p_one);
fprintf('Two-sided p-value: %.4f\\n', p_two);

if p_one < alpha
    fprintf('One-sided: REJECT H0\\n');
else
    fprintf('One-sided: FAIL TO REJECT H0\\n');
end
if p_two < alpha
    fprintf('Two-sided: REJECT H0\\n');
else
    fprintf('Two-sided: FAIL TO REJECT H0\\n');
end

% Side-by-side plots
x = linspace(-4, 4, 400);
y = normpdf(x);

figure('Position', [100 100 1000 400]);
subplot(1, 2, 1);
plot(x, y, 'b-', 'LineWidth', 2); hold on;
x_fill = linspace(z_obs, 4, 100);
fill([x_fill fliplr(x_fill)], [normpdf(x_fill) zeros(1,100)], 'red', 'FaceAlpha', 0.4);
xline(z_obs, '--g', 'LineWidth', 2, 'Label', sprintf('z=%.2f', z_obs));
title(sprintf('One-Sided (H_1: p > 0.05)\\np = %.4f', p_one));
xlabel('z'); ylabel('Density'); hold off;

subplot(1, 2, 2);
plot(x, y, 'b-', 'LineWidth', 2); hold on;
x_r = linspace(abs(z_obs), 4, 100);
x_l = linspace(-4, -abs(z_obs), 100);
fill([x_r fliplr(x_r)], [normpdf(x_r) zeros(1,100)], 'red', 'FaceAlpha', 0.4);
fill([x_l fliplr(x_l)], [normpdf(x_l) zeros(1,100)], 'red', 'FaceAlpha', 0.4);
xline(z_obs, '--g', 'LineWidth', 2, 'Label', sprintf('z=%.2f', z_obs));
title(sprintf('Two-Sided (H_1: p \\neq 0.05)\\np = %.4f', p_two));
xlabel('z'); ylabel('Density'); hold off;
`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Simulate Type I and Type II Error Rates in MATLAB',
              difficulty: 'medium',
              prompt:
                'Simulate 5,000 z-tests under H₀: μ=100 true (σ=10, n=25, α=0.05) and compute the Type I error rate. Then simulate 5,000 tests under H₁: μ=103 true and compute the power (1−β). Use `randn` and `normcdf`. Report both rates with `fprintf`.',
              code: `% TODO: Simulate 5000 z-tests
% Parameters: mu_0 = 100, sigma = 10, n = 25, alpha = 0.05
% Case 1: Generate samples with mu_true = 100 (H0 true) -> compute Type I error rate
% Case 2: Generate samples with mu_true = 103 (H1 true) -> compute power

rng(123);
mu_0 = 100; sigma = 10; n = 25;
alpha = 0.05; n_sims = 5000;

% Case 1: H0 is true (mu_true = mu_0)
% TODO ...

% Case 2: H1 is true (mu_true = 103)
% TODO ...
`,
              hint: 'For each simulation, draw `randn(n_sims, n)` scaled to the appropriate mu and sigma, compute sample means, z-stats, p-values, and count rejections. For Case 1 the count/n_sims ≈ 0.05. For Case 2 it will be larger — that is the power.',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Formal definition: hypothesis and test.** A statistical hypothesis is a statement about the parameter $\\theta$ of a probability distribution. A **hypothesis test** is a procedure that maps the observed data $\\mathbf{X} = (X_1, \\ldots, X_n)$ to a decision in $\\{\\text{Reject } H_0, \\text{Fail to Reject } H_0\\}$. Formally, we partition the sample space into a **rejection region** (critical region) $C$ and its complement. The test function is $\\phi(\\mathbf{X}) = \\mathbf{1}[\\mathbf{X} \\in C]$. The size of the test is $\\alpha = \\sup_{\\theta \\in H_0} E_\\theta[\\phi(\\mathbf{X})]$, the maximum Type I error probability over all parameter values consistent with $H_0$.',

      '**Neyman-Pearson Lemma (key theorem).** For testing a simple null $H_0: \\theta = \\theta_0$ vs. simple alternative $H_1: \\theta = \\theta_1$, the most powerful level-$\\alpha$ test rejects when the likelihood ratio exceeds a threshold $k$:\n$$\\text{Reject } H_0 \\text{ if } \\frac{L(\\theta_1; \\mathbf{X})}{L(\\theta_0; \\mathbf{X})} > k$$\nwhere $k$ is chosen so that $P(\\text{Reject} \\mid \\theta_0) = \\alpha$. This is the **uniformly most powerful (UMP) test** for simple hypotheses. For composite alternatives (e.g., $H_1: \\mu > \\mu_0$ for normal data), the one-sided z-test is UMP by an extension. The two-sided test has no UMP test in general but is obtained as the UMP unbiased test.',

      '**Geometric interpretation.** The test statistic $Z = (\\bar{X} - \\mu_0) / (\\sigma/\\sqrt{n})$ maps the sample mean onto the standard normal scale. The rejection region $|Z| > z_{\\alpha/2}$ corresponds to sample means outside the interval $\\mu_0 \\pm z_{\\alpha/2} \\cdot \\sigma/\\sqrt{n}$ — which is exactly the $(1-\\alpha)$ confidence interval for $\\mu$. This is the **duality between confidence intervals and hypothesis tests**: $H_0: \\mu = \\mu_0$ is rejected at level $\\alpha$ if and only if $\\mu_0$ falls outside the $(1-\\alpha)$ confidence interval for $\\mu$.',

      '**Counter-example and edge case: point null vs. continuous distribution.** When $H_0$ is a composite hypothesis (e.g., $H_0: \\mu \\leq \\mu_0$), the supremum in the size definition is taken over all $\\mu \\leq \\mu_0$, and it is achieved at the boundary $\\mu = \\mu_0$. This is why one-sided tests are calibrated using the boundary value. A subtlety: for discrete distributions (counts, binomial data), the exact p-value may never equal $\\alpha$ exactly, because the test statistic takes integer values. In this case, the test is **conservative** (true Type I error rate $\\leq \\alpha$).',

      '**Links to future content.** The t-test (stat6-002) extends this framework to the case where $\\sigma$ is unknown, replacing the standard normal distribution with a Student\'s t-distribution. Chi-square tests (stat6-004) use the $\\chi^2$ distribution for categorical data. ANOVA (stat6-005) uses the F-distribution to test equality of multiple means simultaneously. In Bayesian statistics, the entire framework is replaced: instead of "reject H₀ if p-value < α," one computes the posterior probability of each hypothesis directly — a conceptually cleaner but computationally heavier approach. In machine learning, hypothesis testing appears in model comparison, feature selection (testing if a coefficient is nonzero), and permutation testing for classification accuracy.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Insight: Duality of Hypothesis Tests and Confidence Intervals',
        body: 'A two-sided test at level α is equivalent to checking whether μ₀ is inside the (1−α) confidence interval.\n\nFormal statement: Reject H₀: μ = μ₀ at level α ⟺ μ₀ ∉ CI_{1−α}(μ)\n\nThis means you can invert any hypothesis test into a confidence interval and vice versa. The confidence interval is richer: it shows the entire set of μ₀ values that are consistent with the data, not just a binary reject/not-reject decision. Always prefer reporting a confidence interval over just a p-value.',
      },
      {
        type: 'warning',
        title: 'Warning: Multiple Testing Inflation',
        body: 'If you run k independent hypothesis tests each at level α, the family-wise error rate (FWER) — the probability of at least one false rejection — is:\n\nFWER = 1 − (1 − α)^k\n\nFor k=20 tests at α=0.05: FWER = 1 − 0.95²⁰ ≈ 0.64. You have a 64% chance of at least one false positive!\n\nCorrections:\n• Bonferroni: use α/k per test (conservative but simple)\n• Benjamini-Hochberg: controls false discovery rate (FDR) — better for many tests\n\nIn genomics with k = 100,000 tests, Bonferroni requires p < 5×10⁻⁷ for significance.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'stat6-001-ex1',
      title: 'State hypotheses and identify error types for a quality control scenario',
      difficulty: 'easy',
      problem:
        'A bolt manufacturer claims their bolts have a mean tensile strength of at least 500 MPa. A quality inspector tests 40 bolts and finds the sample mean is 487 MPa. (a) State H₀ and H₁. (b) If the inspector concludes the bolts are substandard when they are actually fine, what type of error is this? (c) If the bolts are truly substandard but the inspector concludes they are fine, what type of error is this?',
      steps: [
        {
          expression:
            'H_0: \\mu \\geq 500 \\text{ MPa (bolts meet specification)} \\\\ H_1: \\mu < 500 \\text{ MPa (bolts are substandard)}',
          annotation:
            'The manufacturer\'s claim becomes H₀. The inspector is testing whether the evidence justifies concluding the bolts are weaker than claimed. Since the concern is specifically that the mean might be BELOW 500, this is a one-sided (lower-tail) test. H₀ is the "status quo" (bolts are acceptable) and H₁ is the new claim the inspector wants to establish.',
          strategyTitle: 'Step 1: Identify H₀ and H₁',
          hints: ['H₀ always contains the equality (or direction of no concern).', 'The inspector wants to detect weakness below 500 MPa → lower one-sided alternative.'],
        },
        {
          expression:
            '\\text{Reject } H_0 \\text{ when true} \\Rightarrow \\text{Type I error} \\\\ \\text{Concluding bolts are bad when they are fine} \\Rightarrow \\alpha',
          annotation:
            'A Type I error is rejecting a true H₀. Here H₀ says the bolts are at least 500 MPa (fine). If the inspector rejects this and declares the bolts substandard when they actually meet specification, that is a Type I error — a false alarm. The manufacturer would unnecessarily scrap a good batch. The probability of this error is controlled by α.',
          strategyTitle: 'Step 2: Type I error',
          hints: ['Type I error = false positive = rejecting truth.'],
        },
        {
          expression:
            '\\text{Fail to reject } H_0 \\text{ when } H_1 \\text{ is true} \\Rightarrow \\text{Type II error} \\\\ \\text{Concluding bolts are fine when they are substandard} \\Rightarrow \\beta',
          annotation:
            'A Type II error is failing to reject H₀ when it is actually false. Here H₁ (bolts are substandard) is true, but the inspector concludes "no evidence of a problem." Substandard bolts would enter service — a potentially dangerous outcome. In safety-critical applications, reducing β (increasing power) is paramount, which requires a larger sample or a higher α.',
          strategyTitle: 'Step 3: Type II error',
          hints: ['Type II error = false negative = missing a real effect.'],
        },
      ],
      conclusion:
        'The one-sided hypothesis reflects the specific concern (weakness, not excess strength). Type I error (α) is a false alarm — acceptable at 5% for manufacturing QC. Type II error (β) is missing a real defect — more dangerous in safety contexts, mitigated by larger n.',
    },
    {
      id: 'stat6-001-ex2',
      title: 'Compute a two-sided z-test p-value by hand',
      difficulty: 'medium',
      problem:
        'A drug company claims a new formulation reduces systolic blood pressure by exactly 10 mmHg on average. A clinical trial of n = 64 patients shows a sample mean reduction of 8.4 mmHg with σ = 8 mmHg (known from prior studies). Test H₀: μ = 10 vs. H₁: μ ≠ 10 at α = 0.05.',
      steps: [
        {
          expression:
            'SE = \\frac{\\sigma}{\\sqrt{n}} = \\frac{8}{\\sqrt{64}} = \\frac{8}{8} = 1.0 \\text{ mmHg}',
          annotation:
            'The standard error of the sample mean is σ/√n. With n = 64, √n = 8, so SE = 8/8 = 1.0. This is the typical random variation we expect in sample means from samples of this size, assuming σ = 8.',
          strategyTitle: 'Step 1: Standard error',
          hints: ['SE shrinks as n grows — larger samples produce more precise estimates.'],
        },
        {
          expression:
            'z = \\frac{\\bar{x} - \\mu_0}{SE} = \\frac{8.4 - 10}{1.0} = \\frac{-1.6}{1.0} = -1.60',
          annotation:
            'The z-statistic is −1.60: the sample mean is 1.60 standard errors below the H₀ value of 10 mmHg. Under H₀, z follows a standard normal distribution, so we can look up P(Z ≤ −1.60) in a z-table or use the normal CDF.',
          strategyTitle: 'Step 2: Test statistic',
          hints: ['z negative means x̄ < μ₀.', 'Standard normal table: P(Z ≤ −1.60) ≈ 0.0548.'],
        },
        {
          expression:
            'p\\text{-value} = 2 \\cdot P(Z \\leq -1.60) = 2 \\times 0.0548 = 0.1096',
          annotation:
            'For a two-sided test, the p-value is twice the one-sided tail probability. P(Z ≤ −1.60) ≈ 0.0548 from the standard normal table. Doubling: p = 0.1096. This means about 11% of samples from a population with μ = 10 would produce a mean as far as 8.4 or further from 10 by random chance alone.',
          strategyTitle: 'Step 3: p-value',
          hints: ['Two-sided: multiply by 2 because both tails count.'],
        },
        {
          expression:
            'p = 0.1096 > \\alpha = 0.05 \\Rightarrow \\text{Fail to reject } H_0',
          annotation:
            'Since p = 0.1096 ≥ α = 0.05, we fail to reject H₀. The data is not statistically surprising under the assumption that the drug reduces BP by 10 mmHg. This does NOT mean the drug effect is exactly 10 mmHg — it means this sample (8.4 mmHg reduction) is consistent with the null. The 95% CI for μ is 8.4 ± 1.96(1.0) = [6.44, 10.36] mmHg, which includes 10.',
          strategyTitle: 'Step 4: Decision and conclusion',
          hints: ['Always state the conclusion in plain English, not just symbols.', 'Report the CI alongside the p-value for a complete picture.'],
        },
      ],
      conclusion:
        'Fail to reject H₀. The trial results (mean reduction 8.4 mmHg) are statistically consistent with the claim of 10 mmHg reduction (p = 0.11). However, the 95% CI [6.44, 10.36] shows substantial uncertainty — a larger trial would be needed to rule out a clinically meaningful deviation from 10 mmHg.',
    },
    {
      id: 'stat6-001-ex3',
      title: 'Identify the appropriate test type and interpret a p-value in context',
      difficulty: 'hard',
      problem:
        'An A/B test at an e-commerce company tested two checkout page designs. Version A (control): 5,200 visitors, 312 purchases (6.0%). Version B: 5,100 visitors, 357 purchases (7.0%). The analyst computes z = 2.85 and p = 0.0044. (a) Is this one-sided or two-sided? Justify. (b) State the conclusion at α = 0.05. (c) A colleague says "p = 0.0044 means there is only a 0.44% chance that version B is no better than A." Is this correct?',
      steps: [
        {
          expression:
            'H_0: p_B = p_A \\text{ (no difference)} \\\\ H_1: p_B \\neq p_A \\text{ (two-sided — either could be better)}',
          annotation:
            'In practice, A/B tests almost always use two-sided alternatives because (a) the new version might unexpectedly be worse, which is also important information, and (b) pre-committing to "B will be better" before running the test is rarely justified. A two-sided test is the safer and more common choice for A/B testing. The analyst presumably computed a two-sided p-value: p = 2 × P(Z > 2.85) = 2 × 0.0022 = 0.0044.',
          strategyTitle: 'Step 1: One-sided or two-sided?',
          hints: ['Default to two-sided unless there is a specific a priori reason to expect a directional effect.'],
        },
        {
          expression:
            'p = 0.0044 < \\alpha = 0.05 \\Rightarrow \\text{Reject } H_0 \\\\ \\text{Conclusion: Version B has a statistically different conversion rate from A}',
          annotation:
            'With p = 0.0044, we reject H₀ at α = 0.05. The evidence strongly suggests the two versions have different conversion rates. The effect: B converts at 7.0% vs. A at 6.0%, an absolute difference of 1 percentage point and a relative improvement of 17%. With ~5,000 visitors per arm, this is a well-powered test that can detect even modest effects reliably.',
          strategyTitle: 'Step 2: Decision and conclusion',
          hints: ['p < α → reject H₀ → conclude versions differ.'],
        },
        {
          expression:
            'p \\neq P(H_0 \\text{ is true} \\mid \\text{data}) \\\\ \\text{Correct: } p = P(|Z| \\geq 2.85 \\mid H_0 \\text{ true}) = 0.0044',
          annotation:
            'The colleague\'s interpretation is the most common p-value misinterpretation. P = 0.0044 does NOT mean there is a 0.44% probability that H₀ is true. It means: "if H₀ were true (both versions identical), we would see a test statistic this extreme or more in only 0.44% of experiments." P(H₀ is true | data) requires a Bayesian framework with a prior on H₀, which is a separate analysis entirely. The frequentist p-value makes no probability statement about H₀ being true or false.',
          strategyTitle: 'Step 3: Correct p-value interpretation',
          hints: ['p-value = probability of the data | H₀ true. It is NOT the probability that H₀ is true.'],
        },
      ],
      conclusion:
        'The two-sided z-test strongly rejects H₀ (p = 0.0044 < 0.05). Version B significantly outperforms Version A. The colleague\'s interpretation is incorrect — the p-value is not the probability that H₀ is true; it is the probability of observing data this extreme under H₀.',
    },
  ],

  challenges: [
    {
      id: 'stat6-001-ch1',
      difficulty: 'easy',
      problem:
        'A coffee shop claims its espresso shots contain exactly 1 oz (28.35 mL) of liquid. You measure 16 shots and find x̄ = 27.8 mL with σ = 1.2 mL (assumed known). Compute the z-statistic and two-sided p-value. At α = 0.05, do you reject H₀?',
      hint: 'SE = σ/√n. Two-sided p-value = 2 × P(Z ≤ z_obs) when z_obs is negative.',
      walkthrough: [
        {
          expression: 'SE = 1.2 / \\sqrt{16} = 1.2/4 = 0.30 \\text{ mL}',
          annotation: 'Standard error of the sample mean with σ=1.2 and n=16.',
        },
        {
          expression: 'z = (27.8 - 28.35)/0.30 = -0.55/0.30 = -1.833',
          annotation: 'Test statistic: 1.833 standard errors below the null value.',
        },
        {
          expression: 'p = 2 \\times P(Z \\leq -1.833) = 2 \\times 0.0334 = 0.0668',
          annotation: 'From the z-table, P(Z ≤ −1.833) ≈ 0.0334. Two-sided: p = 0.0668.',
        },
        {
          expression: 'p = 0.0668 > \\alpha = 0.05 \\Rightarrow \\text{Fail to reject } H_0',
          annotation: 'Borderline result: p = 0.0668 > 0.05. No statistically significant evidence that the machine is mispoured at α = 0.05. However, p is close to 0.05 — a larger sample might detect a real shift.',
        },
      ],
      answer: 'z = −1.833, p = 0.0668. Fail to reject H₀ at α = 0.05. No statistically significant evidence that mean shot volume differs from 28.35 mL, though the result is borderline.',
    },
    {
      id: 'stat6-001-ch2',
      difficulty: 'medium',
      problem:
        'A researcher tests 20 different genetic variants simultaneously for association with a disease, each at α = 0.05. Assuming ALL 20 null hypotheses are actually true (no real associations), what is the probability of at least one false positive (family-wise error rate)? If the researcher applies Bonferroni correction, what per-test α should they use, and how does this change the family-wise error rate?',
      hint: 'FWER = 1 − (1 − α)^k for k independent tests. Bonferroni: use α/k per test.',
      walkthrough: [
        {
          expression: 'FWER = 1 - (1 - 0.05)^{20} = 1 - 0.95^{20} \\approx 1 - 0.358 = 0.642',
          annotation: 'Without correction, 64.2% chance of at least one false positive in 20 tests. This is far above the 5% error rate each test was designed for.',
        },
        {
          expression: '\\alpha_{\\text{Bonferroni}} = \\alpha / k = 0.05 / 20 = 0.0025',
          annotation: 'Bonferroni correction: divide α by the number of tests. Each test uses α = 0.0025.',
        },
        {
          expression: 'FWER_{\\text{Bonferroni}} = 1 - (1 - 0.0025)^{20} \\approx 1 - 0.9512 = 0.0488 < 0.05',
          annotation: 'With Bonferroni correction, FWER ≈ 0.049, which is controlled below 0.05. The trade-off: each test is now harder to reject (requires stronger evidence), reducing power.',
        },
      ],
      answer: 'Without correction, FWER ≈ 64.2% — far too high. With Bonferroni correction (α = 0.0025 per test), FWER ≈ 4.9% ≤ 0.05. Cost: lower power to detect real associations.',
    },
    {
      id: 'stat6-001-ch3',
      difficulty: 'hard',
      problem:
        'A study tests whether a new CNC tool reduces surface roughness. Historical data shows Ra (surface roughness) mean = 1.8 μm, σ = 0.4 μm. The engineer wants 90% power to detect a reduction to 1.5 μm, using α = 0.05 (one-sided, lower-tail). What sample size n is required? Use the power formula: n = ((z_α + z_β) × σ / Δ)² where Δ = |μ₁ − μ₀|.',
      hint: 'For 90% power: z_β = z_{0.10} = 1.282. For α = 0.05 one-sided: z_α = 1.645. Δ = 1.8 − 1.5 = 0.3 μm.',
      walkthrough: [
        {
          expression: 'z_\\alpha = 1.645 \\text{ (one-sided, } \\alpha = 0.05\\text{)}, \\quad z_\\beta = 1.282 \\text{ (90\\% power)}',
          annotation: 'Critical values from the standard normal table. One-sided α = 0.05 → z = 1.645. Power = 90% → β = 10% → z_{0.10} = 1.282.',
        },
        {
          expression: 'n = \\left( \\frac{(z_\\alpha + z_\\beta) \\cdot \\sigma}{\\Delta} \\right)^2 = \\left( \\frac{(1.645 + 1.282) \\times 0.4}{0.3} \\right)^2',
          annotation: 'Substituting: numerator = 2.927 × 0.4 = 1.1708. Denominator = 0.3. Ratio = 3.9027.',
        },
        {
          expression: 'n = (3.9027)^2 = 15.23 \\Rightarrow n = 16 \\text{ (round up to next integer)}',
          annotation: 'Always round up sample size to ensure power is at least 90%. With n = 16 measurements using the new CNC tool, the test has ≥ 90% power to detect a reduction from 1.8 to 1.5 μm.',
        },
      ],
      answer: 'Required sample size n = 16. With 16 measurements at α = 0.05 (one-sided), the test achieves ≥ 90% power to detect a 0.3 μm reduction in surface roughness.',
    },
  ],

  definitions: [
    {
      term: "null hypothesis H₀",
      definition: "The default hypothesis that is assumed true until evidence overturns it. Always specifies a precise parameter value (equality). Example: H₀: μ = 50 or H₀: p = 0.30.",
    },
    {
      term: "alternative hypothesis H₁",
      definition: "The claim the researcher is trying to find evidence for. Can be two-sided (H₁: μ ≠ 50) or one-sided (H₁: μ > 50 or H₁: μ < 50). Only adopted if sufficient evidence against H₀ is found.",
    },
    {
      term: "p-value",
      definition: "P(test statistic as extreme or more extreme | H₀ is true). The probability of observing data this extreme if the null hypothesis were true. NOT the probability that H₀ is true. Reject H₀ if p-value < α.",
    },
    {
      term: "Type I error (α)",
      definition: "Rejecting H₀ when it is actually true. A false positive. The probability of a Type I error equals the significance level α, set by the researcher (typically 0.05).",
    },
    {
      term: "Type II error (β)",
      definition: "Failing to reject H₀ when H₁ is actually true. A false negative. The probability of a Type II error is β = 1 − power. Decreasing β requires larger n or larger effect size.",
    },
    {
      term: "statistical power",
      definition: "P(reject H₀ | H₁ is true) = 1 − β. The probability of correctly detecting a true effect. Increases with larger n, larger effect size, or larger α. Target ≥ 80% in well-designed studies.",
    },
  ],

  semantics: {
    core: [
      { symbol: 'H_0', meaning: 'Null hypothesis: the specific parameter value being tested (the status quo claim). Always contains an equality.' },
      { symbol: 'H_1', meaning: 'Alternative hypothesis: what we conclude if evidence against H₀ is strong enough. Can be two-sided (≠) or one-sided (< or >).' },
      { symbol: 'p', meaning: 'p-value: P(test statistic as extreme or more extreme | H₀ true). Measures how surprising the data is under H₀.' },
      { symbol: '\\alpha', meaning: 'Significance level: the pre-set threshold for the p-value. Also equals the Type I error rate (probability of false positive).' },
      { symbol: '\\beta', meaning: 'Type II error rate: probability of failing to reject H₀ when H₁ is true (false negative rate).' },
      { symbol: '1 - \\beta', meaning: 'Power: probability of correctly rejecting H₀ when H₁ is true. Target ≥ 80% in well-designed studies.' },
    ],
    rulesOfThumb: [
      'Always set α before collecting data. Changing α after seeing results is p-hacking.',
      'p-value < α → reject H₀. p-value ≥ α → fail to reject H₀ (never "accept H₀").',
      'Fail to reject ≠ H₀ is true. Low power can cause false negatives even when H₁ is true.',
      'Two-sided tests are the default. Only use one-sided if the direction of H₁ was pre-committed before data collection.',
      'With very large n, even trivially small effects become "statistically significant." Always report effect size alongside p-value.',
      'Running k tests at α = 0.05 each produces ~5% false positives per test — use Bonferroni or FDR correction for multiple tests.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'stat5-005', label: 'Central Limit Theorem', note: 'The CLT justifies using the normal distribution for the sampling distribution of x̄, which underpins the z-test p-value calculation.' },
      { lessonId: 'stat1-004', label: 'Confidence Intervals', note: 'CIs and hypothesis tests are dual: H₀: μ = μ₀ is rejected at level α iff μ₀ falls outside the (1−α) CI. Review before the math section.' },
    ],
    futureLinks: [
      { lessonId: 'stat6-002', label: 'One-Sample t-Test', note: 'The t-test applies the same framework when σ is unknown, using the t-distribution instead of the normal.' },
      { lessonId: 'stat6-006', label: 'p-Values, Effect Size & Power', note: 'Deep dive into why statistical significance ≠ practical importance, and how to plan sample sizes using power analysis.' },
      { lessonId: 'stat7-001', label: 'Regression Inference', note: 'Every regression coefficient has a hypothesis test attached: H₀: βⱼ = 0 (the predictor has no effect). Same framework, t-distribution, same decision rule.' },
    ],
  },

  checkpoints: [
    { id: 'cp-stat6-001-1', label: 'Read: state H₀ and H₁ for the vending machine example in your own words', type: 'read' },
    { id: 'cp-stat6-001-2', label: 'Read: explain the p-value without using the word "probability of H₀"', type: 'read' },
    { id: 'cp-stat6-001-3', label: 'Read: fill in the 2×2 error table from memory (Type I, Type II, correct decisions)', type: 'read' },
    { id: 'cp-stat6-001-4', label: 'Example 1: state H₀ and H₁ for the bolt problem and classify both error types before reading the solution', type: 'example' },
    { id: 'cp-stat6-001-5', label: 'Example 2: compute the z-statistic and p-value for the blood pressure trial by hand', type: 'example' },
    { id: 'cp-stat6-001-6', label: 'Lab: run Python cell 1 and confirm the p-value histogram is approximately uniform', type: 'lab' },
    { id: 'cp-stat6-001-7', label: 'Lab: run Python cell 3 and explain why the one-sided p-value is half the two-sided p-value', type: 'lab' },
    { id: 'cp-stat6-001-8', label: 'Challenge 2: compute the FWER for 20 simultaneous tests before reading the solution', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'stat6-001-assess-1',
        type: 'choice',
        text: 'A researcher computes p = 0.03 and α = 0.05. Which conclusion is correct?',
        options: [
          'There is a 3% probability that H₀ is true.',
          'Reject H₀ — if H₀ were true, data this extreme would occur only 3% of the time.',
          'Accept H₁ — the alternative hypothesis has been proven.',
          'Fail to reject H₀ — p = 0.03 is less than 0.05.',
        ],
        answer: 'Reject H₀ — if H₀ were true, data this extreme would occur only 3% of the time.',
        hint: 'p < α → reject H₀. The p-value measures how surprising the data is UNDER H₀, not the probability of H₀.',
      },
    ],
  },

  quiz: [
    {
      id: 'stat6-001-quiz-1',
      type: 'choice',
      text: 'The null hypothesis H₀ in a hypothesis test always:',
      options: [
        'States that the effect is large and meaningful',
        'Contains a specific numerical claim (equality) about a parameter',
        'Is the hypothesis the researcher hopes to prove',
        'Is rejected whenever the sample size is large enough',
      ],
      answer: 'Contains a specific numerical claim (equality) about a parameter',
      hints: [
        'H₀ is the "status quo" claim that is assumed true until evidence overturns it.',
        'H₀ always contains an equality: μ = μ₀, p = p₀, etc.',
      ],
      reviewSection: 'Intuition → "The concrete starting example"',
    },
    {
      id: 'stat6-001-quiz-2',
      type: 'choice',
      text: 'A Type I error is:',
      options: [
        'Failing to reject H₀ when H₁ is true',
        'Rejecting H₀ when it is actually true',
        'Using too large a sample size',
        'Computing the wrong test statistic',
      ],
      answer: 'Rejecting H₀ when it is actually true',
      hints: [
        'Type I error = false positive = rejecting a true null hypothesis.',
        'The probability of a Type I error equals α.',
      ],
      reviewSection: 'Intuition → "Type I and Type II errors"',
    },
    {
      id: 'stat6-001-quiz-3',
      type: 'choice',
      text: 'A p-value of 0.04 means:',
      options: [
        'There is a 4% probability that H₀ is true.',
        'If H₀ were true, data as extreme as observed would occur about 4% of the time.',
        'The effect size is 4% of the mean.',
        'The study had 4% statistical power.',
      ],
      answer: 'If H₀ were true, data as extreme as observed would occur about 4% of the time.',
      hints: [
        'p-value = P(data this extreme | H₀ true) — it is a conditional probability.',
        'The p-value says nothing about the probability that H₀ is true.',
      ],
      reviewSection: 'Math section — p-value defined precisely',
    },
    {
      id: 'stat6-001-quiz-4',
      type: 'choice',
      text: 'If p = 0.08 and α = 0.05, the correct conclusion is:',
      options: [
        'Reject H₀ — there is strong evidence against it.',
        'Accept H₀ — it has been proven true.',
        'Fail to reject H₀ — insufficient evidence to conclude H₁.',
        'Accept H₁ — the p-value is close to 0.05.',
      ],
      answer: 'Fail to reject H₀ — insufficient evidence to conclude H₁.',
      hints: [
        'p ≥ α → fail to reject H₀.',
        '"Fail to reject" is not "accept" — absence of evidence is not evidence of absence.',
      ],
      reviewSection: 'Intuition → "The decision rule and its logic"',
    },
    {
      id: 'stat6-001-quiz-5',
      type: 'choice',
      text: 'Compared to a two-sided test, a one-sided test at the same α has:',
      options: [
        'Less power to detect an effect in the predicted direction',
        'More power to detect an effect in the predicted direction, but only if that direction was committed to before data collection',
        'The same power as a two-sided test',
        'A higher Type I error rate',
      ],
      answer: 'More power to detect an effect in the predicted direction, but only if that direction was committed to before data collection',
      hints: [
        'One-sided concentrates all α in one tail → more sensitive to that direction.',
        'You must pre-commit the direction; switching after seeing data inflates α.',
      ],
      reviewSection: 'Intuition → "One-sided vs. two-sided alternatives"',
    },
    {
      id: 'stat6-001-quiz-6',
      type: 'choice',
      text: 'A researcher runs 50 independent tests, all at α = 0.05, and finds 3 "significant" results. The most likely explanation is:',
      options: [
        'All 3 results represent genuine discoveries.',
        'All 3 results are Type II errors.',
        'Under the null, we expect about 2–3 false positives (0.05 × 50 = 2.5), so these may simply be chance.',
        'The researcher should have used a larger sample size.',
      ],
      answer: 'Under the null, we expect about 2–3 false positives (0.05 × 50 = 2.5), so these may simply be chance.',
      hints: [
        'With 50 tests at α=0.05, expect ~2.5 false positives even when all H₀ are true.',
        'Multiple testing correction (Bonferroni, FDR) is needed to interpret these results.',
      ],
      reviewSection: 'Rigor → Warning: Multiple Testing Inflation',
    },
    {
      id: 'stat6-001-quiz-7',
      type: 'choice',
      text: 'Statistical power is defined as:',
      options: [
        'P(reject H₀ | H₁ is true)',
        'P(H₀ is true | data shows significance)',
        '1 − α',
        'P(reject H₀ | H₀ is true)',
      ],
      answer: 'P(reject H₀ | H₁ is true)',
      hints: [
        'Power = 1 − β where β = P(Type II error) = P(fail to reject H₀ | H₁ is true).',
        'Power is the probability of correctly detecting a true effect.',
      ],
      reviewSection: 'Intuition → "Statistical power and sample size"',
    },
    {
      id: 'stat6-001-quiz-8',
      type: 'choice',
      text: 'For a fixed significance level α, increasing the sample size n:',
      options: [
        'Decreases the Type I error rate below α',
        'Increases power (reduces the chance of a Type II error)',
        'Has no effect on power',
        'Increases both α and β',
      ],
      answer: 'Increases power (reduces the chance of a Type II error)',
      hints: [
        'Larger n → smaller SE → test statistic is larger for the same effect size → easier to detect a true effect.',
        'α is fixed by the researcher (the rejection threshold). n controls power/β.',
      ],
      reviewSection: 'Intuition → "Statistical power and sample size"',
    },
    {
      id: 'stat6-001-quiz-9',
      type: 'choice',
      text: "Cohen's d effect size benchmark classifies d = 0.2 as:",
      options: ['Negligible', 'Small', 'Medium', 'Large'],
      answer: 'Small',
      hints: [
        "Cohen's benchmarks: d ≈ 0.2 = small, d ≈ 0.5 = medium, d ≈ 0.8 = large.",
        'A small effect can still be statistically significant with a large enough sample.',
      ],
      reviewSection: 'Intuition → "Effect size: what statistical significance cannot tell you"',
    },
    {
      id: 'stat6-001-quiz-10',
      type: 'choice',
      text: 'The key distinction between statistical significance and practical significance is:',
      options: [
        'Statistical significance proves the effect is large and important',
        'A result can be statistically significant (p < α) but practically trivial, especially with large n',
        'Practical significance requires p < 0.001',
        'They are equivalent when n ≥ 30',
      ],
      answer: 'A result can be statistically significant (p < α) but practically trivial, especially with large n',
      hints: [
        'With n = 1,000,000, a 0.001-unit difference can be statistically significant but meaningless in practice.',
        'Always report effect size (Cohen\'s d, percentage change) alongside the p-value.',
      ],
      reviewSection: 'Misconceptions → "Statistical significance implies the effect is large"',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'The p-value is the probability that H₀ is true.',
      whyStudentsThinkIt:
        'Students confuse P(H₀ true | data) — what they want — with P(data this extreme | H₀ true) — what the p-value provides. The two are related by Bayes\' theorem and depend on the prior probability of H₀, which frequentist statistics does not specify.',
      correctionExample:
        'p = 0.03 does NOT mean H₀ has a 3% chance of being true. It means: in a world where H₀ is true, experiments this extreme would happen 3% of the time. Whether H₀ is actually true depends on the prior odds (how plausible H₀ was before the study) and can only be computed with Bayesian methods.',
      contrastCase:
        'Correct: "If H₀ were true, we would see data this extreme only 3% of the time — so we reject H₀ at α = 0.05." Incorrect: "There is only a 3% chance that the null hypothesis is true."',
    },
    {
      falseBelief: '"Fail to reject H₀" means H₀ is confirmed or proved.',
      whyStudentsThinkIt:
        'Students think of hypothesis testing like a binary verdict: either reject (H₀ is wrong) or accept (H₀ is right). The asymmetric design of the test — which treats H₀ as the default — is not intuitive.',
      correctionExample:
        'If a drug trial with n = 10 patients shows p = 0.20, failing to reject H₀ might simply reflect that 10 patients is far too few to detect a modest real effect. A well-powered trial with n = 500 might clearly reject H₀. "Fail to reject" = insufficient evidence, not confirmation.',
      contrastCase:
        'Correct: "We did not find statistically significant evidence against H₀; however, the study may have been underpowered." Incorrect: "We proved the drug has no effect."',
    },
    {
      falseBelief: 'Statistical significance implies the effect is large and practically meaningful.',
      whyStudentsThinkIt:
        'Students conflate "statistically significant" (p < α) with "important." The word "significant" in everyday language means important or large — but in statistics it just means the evidence against H₀ crossed a threshold.',
      correctionExample:
        'With n = 100,000 online users, a website change that increases conversion rate from 5.00% to 5.01% (a 0.01 percentage point difference) might yield p < 0.001 — "highly significant." But the absolute effect is negligible. Deploying such a change adds development cost with almost no practical benefit.',
      contrastCase:
        'Statistical significance is about whether an effect is reliably detectable, not about whether it is large enough to matter. Always report effect size (Cohen\'s d, percentage change, absolute difference) alongside the p-value.',
    },
  ],

  transferPrompts: [
    {
      situation:
        'A manufacturing engineer tests a new coolant in CNC milling and finds it reduces average tool wear from 0.18 mm to 0.16 mm per hour. With n = 40 per group, the two-sample z-test gives p = 0.03. The plant manager asks: "Should we switch coolants for all 200 machines?"',
      competingTechniques: [
        'Conclude the coolant is definitively better because p < 0.05 and immediately switch all machines',
        'Report p = 0.03 alongside the confidence interval for the difference and discuss the practical significance of 0.02 mm/hr reduction in wear',
        'Ignore the test result as too small to be practically meaningful',
      ],
      whyThisTechniqueWins:
        'Report p alongside effect size and CI. The p-value (0.03) tells you the evidence is statistically significant — the 0.02 mm/hr reduction is unlikely to be pure noise. But the decision depends on practical context: Is 0.02 mm/hr wear reduction enough to justify switching costs across 200 machines? How much does the new coolant cost? What is the cost per tool replacement? The 95% CI for the difference might be [0.001, 0.039] — indicating the true saving could be as small as 0.001 mm/hr. Statistical significance does not answer the business question; it only confirms the direction of the effect is real.',
    },
    {
      situation:
        'A medical researcher runs a genomic study testing 50,000 SNPs (genetic variants) for association with Type 2 diabetes, each at α = 0.05 using a chi-square test.',
      competingTechniques: [
        'Report all SNPs with p < 0.05 as significant genetic risk factors',
        'Apply Bonferroni correction (p < 0.05/50,000 = 10⁻⁶) before claiming significance',
        'Apply Benjamini-Hochberg FDR correction at 5% FDR and report the set of discoveries',
      ],
      whyThisTechniqueWins:
        'BH FDR correction (option 3) is the standard in genomics. Bonferroni (option 2) is very conservative — it will miss many real associations in a setting where thousands of SNPs may truly be associated. FDR at 5% means: of all SNPs you declare significant, you expect at most 5% to be false positives — a reasonable tradeoff between false positives and false negatives in discovery research. Reporting all p < 0.05 without correction (option 1) would yield ~2,500 false positives from 50,000 null tests — worthless. The right correction depends on the cost of false positives vs. false negatives and the expected number of real associations.',
    },
  ],

  debugging: [
    {
      commonError: 'Reporting a one-sided p-value after computing a two-sided test statistic when the result was "in the wrong direction."',
      symptom: 'Student computes z = −1.8 hoping for z > 0, sees p(two-sided) = 0.072, then reports p = 0.036 by "taking only the upper tail" to achieve p < 0.05.',
      whyItHappened: 'The student switched from a pre-specified two-sided test to a one-sided test after seeing the data direction, halving the p-value. This is p-hacking — the true Type I error rate is inflated to 10%.',
      repairStrategy: 'The alternative hypothesis must be specified before data collection. If you pre-specified H₁: μ > μ₀ and observed z = −1.8, then the one-sided p-value for H₁: μ > μ₀ is actually 1 − 0.036 = 0.964 (the data went in the opposite direction from H₁). Never choose the direction of H₁ after seeing the data.',
    },
    {
      commonError: 'Concluding "the drug works" from a small p-value without checking if the effect size is clinically meaningful.',
      symptom: 'A trial with 50,000 participants reports p = 0.0001 for a 0.5 mmHg blood pressure reduction. The researcher concludes the drug should be prescribed to all hypertensive patients.',
      whyItHappened: 'With very large n, even trivially small effects become "statistically significant." The researcher confused statistical significance (p < α) with clinical significance (effect is large enough to matter for patients).',
      repairStrategy: 'Always report effect size alongside p-value. A 0.5 mmHg BP reduction is clinically negligible (typical measurement error in a clinical setting is ±2–5 mmHg). Standard clinical thresholds for meaningful BP reduction are typically ≥ 5 mmHg. Report: "Statistically significant but clinically negligible reduction of 0.5 mmHg (95% CI: [0.3, 0.7])."',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently:
      'Given a real-world scenario, state H₀ and H₁, identify the appropriate alternative (one-sided vs. two-sided), compute a z-test statistic and p-value, apply the decision rule correctly, and state the conclusion in plain English.',
    explainVerbally:
      'Explain the p-value without using the word "probability that H₀ is true." Describe the difference between Type I and Type II errors with a concrete example. Explain why "fail to reject H₀" is not the same as "accept H₀."',
    detectIncorrectApplication:
      'Identify errors when: (1) a researcher claims "p = 0.04 means H₀ has a 4% chance of being true"; (2) "fail to reject" is described as "proving the null"; (3) a one-sided test is used after seeing the data direction; (4) statistical significance is confused with practical importance.',
    transferToUnfamiliar:
      'Given a novel hypothesis testing problem in a new domain (genomics, finance, sports analytics), correctly set up H₀ and H₁, identify whether a one-sided or two-sided test is appropriate, apply the five-step procedure, and interpret the result in context — including noting limitations from sample size, multiple testing, or effect size considerations.',
  },
};
