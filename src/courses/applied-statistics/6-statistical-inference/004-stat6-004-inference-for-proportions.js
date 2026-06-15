export default {
  id: 'stat6-004',
  slug: 'inference-for-proportions',
  chapter: 'stat6',
  order: 4,
  title: 'Inference for Proportions',
  subtitle: 'z-tests and confidence intervals for population proportions — one sample and two samples.',
  tags: ['proportion', 'z-test', 'confidence interval', 'two-proportion z-test', 'sample proportion', 'margin of error', 'one proportion z-test'],
  aliases: 'proportion confidence interval z-test two proportion hypothesis test percentage rate binary outcome',
  timeToComplete: 40,
  coreConcept: `When the response is binary (yes/no, success/failure, defect/no defect), the parameter of interest is the population proportion p. We estimate it with p̂ = x/n. For large n, p̂ is approximately normal with mean p and SE = √(p(1−p)/n) — this enables z-tests and confidence intervals for p. Two-proportion tests compare p₁ and p₂ from two independent groups.`,
  prerequisites: ['stat6-001', 'stat5-004'],
  nextLesson: 'stat6-005',

  hook: {
    question: `A tech company A/B tests a new signup page: 412 of 1800 visitors on version A sign up (22.9%), versus 489 of 1800 on version B (27.2%). Is version B genuinely better, or could the difference be random sampling noise?`,
    realWorldContext: `Inference for proportions is the workhorse of digital product teams, public health agencies, and political polling. When a polling firm says "48% of likely voters support Candidate X, margin of error ±3 points," they are reporting a 95% confidence interval for a proportion. When the FDA approves a COVID vaccine at 94.5% efficacy, that number is a proportion estimate with a confidence interval. When a software team compares click-through rates between two UI designs, the statistical question is whether two population proportions differ. The math in all three cases is identical: the one-proportion or two-proportion z-test. Understanding this test means you can interpret virtually every percentage you see in the news, a medical paper, or a product report.`,
    previewVisualizationId: 'HypothesisTestViz',
  },

  intuition: {
    prose: [
      `**Roadmap for this lesson.** By the end you will: (1) construct a confidence interval for a single proportion p; (2) perform a one-proportion z-test to test H₀: p = p₀; (3) perform a two-proportion z-test to test H₀: p₁ = p₂; (4) apply the success-failure condition to verify when the normal approximation is valid; (5) correctly interpret confidence intervals — including the common misinterpretation.`,

      `**From counts to proportions.** When every observation falls into one of two categories, the natural summary is a proportion. In the A/B test example: version A got x₁ = 412 sign-ups out of n₁ = 1800 visitors, so p̂₁ = 412/1800 ≈ 0.229. Version B got x₂ = 489 out of n₂ = 1800, so p̂₂ = 0.272. The question is whether the 4.3 percentage point difference reflects a real improvement or random variation. Both p̂₁ and p̂₂ are random — they would be slightly different if you ran the same experiment again tomorrow. How much random variation should we expect?`,

      `**Before reading on, predict:** If the true sign-up rate is p = 0.25 for both versions (no real difference), and you show each version to 1800 people, how far from 0.25 could the observed proportion reasonably land just by chance? Is a 4.3 percentage point difference surprising or routine?`,

      `**The Central Limit Theorem for proportions.** A sample proportion p̂ = x/n is the mean of n independent Bernoulli(p) random variables. By the CLT, for large enough n: $$\\hat{p} \\approx N\\left(p, \\frac{p(1-p)}{n}\\right)$$ The standard error is $SE = \\sqrt{p(1-p)/n}$. For p = 0.25 and n = 1800: $SE = \\sqrt{0.25 \\times 0.75/1800} \\approx 0.0102$. A difference of 4.3 percentage points is $0.043/0.0102 \\approx 4.2$ standard errors — extremely unlikely by chance alone. This is the test statistic.`,

      `**The success-failure condition.** The normal approximation is valid when both $np \\geq 10$ AND $n(1-p) \\geq 10$. This is the same condition as for the binomial normal approximation. When testing H₀: p = p₀, use p₀ to check: $n \\cdot p_0 \\geq 10$ and $n \\cdot (1-p_0) \\geq 10$. When computing a confidence interval, use p̂ instead: $n\\hat{p} \\geq 10$ and $n(1-\\hat{p}) \\geq 10$. If either condition fails, use exact binomial methods (Fisher's exact test, Clopper-Pearson intervals) instead.`,

      `**One-proportion z-test.** To test H₀: p = p₀ vs H₁: p ≠ p₀ (two-sided), the test statistic uses the null value p₀ in the denominator (not p̂): $$z = \\frac{\\hat{p} - p_0}{\\sqrt{p_0(1-p_0)/n}}$$ This is because under H₀, p₀ IS the true proportion, so the SE formula uses p₀. Compare z to the standard normal: p-value = 2·P(Z > |z|). For a one-sided test (H₁: p > p₀), the p-value is just P(Z > z).`,

      `**Confidence interval for p.** A confidence interval does NOT use the null value — it uses the estimated p̂: $$\\hat{p} \\pm z^* \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}$$ For 95% confidence, z* = 1.96. For 99%, z* = 2.576. The margin of error is $ME = z^* \\cdot SE$. For the A/B example with version A: $0.229 \\pm 1.96\\sqrt{0.229(0.771)/1800} = 0.229 \\pm 0.019 = (0.210, 0.248)$. We are 95% confident the true sign-up rate for version A is between 21% and 24.8%.`,

      `**Two-proportion z-test.** To compare two independent proportions p₁ and p₂, the test statistic pools the two samples under H₀: p₁ = p₂: $$\\hat{p}_{\\text{pool}} = \\frac{x_1 + x_2}{n_1 + n_2}, \\quad z = \\frac{\\hat{p}_1 - \\hat{p}_2}{\\sqrt{\\hat{p}_{\\text{pool}}(1-\\hat{p}_{\\text{pool}})(1/n_1 + 1/n_2)}}$$ Pooling under H₀ is more efficient than using separate estimates. For the A/B test: $\\hat{p}_{\\text{pool}} = (412+489)/(1800+1800) = 901/3600 = 0.2503$. The test statistic becomes $z = (0.272-0.229)/\\sqrt{0.2503(0.7497)(1/1800 + 1/1800)} \\approx 0.043/0.0144 \\approx 2.98$. The two-sided p-value is $2 \\times P(Z > 2.98) \\approx 0.0029$ — version B is significantly better at the α = 0.01 level.`,

      `**Correct interpretation of a CI.** "I am 95% confident that p lies in (0.210, 0.248)" means: if I repeated this sampling procedure many times and computed a CI each time, 95% of those intervals would contain the true p. It does NOT mean "there is a 95% probability that p is in this interval" — the true p is fixed, not random. It also does NOT mean "95% of individuals have proportions in this range." The confidence is in the procedure, not in any single interval.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: One-Proportion z-Test',
        body: `**Step 1.** State H₀: p = p₀ and H₁ (two-sided: p ≠ p₀, or one-sided).
**Step 2.** Check success-failure: n·p₀ ≥ 10 and n(1−p₀) ≥ 10.
**Step 3.** Compute p̂ = x/n.
**Step 4.** Compute z = (p̂ − p₀) / √(p₀(1−p₀)/n).
**Step 5.** Find p-value: 2·P(Z > |z|) for two-sided, or P(Z > z) for right-sided.
**Step 6.** Compare p-value to α. Reject H₀ if p < α.`,
      },
      {
        type: 'procedure',
        title: 'Procedure: Confidence Interval for p',
        body: `**Step 1.** Compute p̂ = x/n.
**Step 2.** Check success-failure: n·p̂ ≥ 10 and n(1−p̂) ≥ 10.
**Step 3.** Choose z* (1.96 for 95%, 2.576 for 99%).
**Step 4.** SE = √(p̂(1−p̂)/n).
**Step 5.** CI = p̂ ± z* · SE.
Note: Use p₀ in the SE formula for the hypothesis test, use p̂ for the CI.`,
      },
      {
        type: 'insight',
        title: 'Why Pooled SE in Two-Proportion Test?',
        body: `Under H₀: p₁ = p₂, both groups have the same true proportion p. Rather than use two separate p̂ estimates (which are noisy), pool all data to get one better estimate p̂_pool. This pooled estimate gives a more accurate SE under the null. For a confidence interval on p₁−p₂ (not a test), use the unpooled SE: √(p̂₁(1−p̂₁)/n₁ + p̂₂(1−p̂₂)/n₂), because you no longer assume p₁ = p₂.`,
      },
      {
        type: 'warning',
        title: 'Using p̂ vs p₀ in the SE',
        body: `The most common mistake: using p̂ in the SE for the hypothesis test, and using p₀ in the SE for the confidence interval.

**Correct:**
- For the z-test: SE_test = √(p₀(1−p₀)/n) — use p₀ because H₀ says p = p₀.
- For the CI: SE_ci = √(p̂(1−p̂)/n) — use p̂ because we do not assume H₀ is true.

This is a key conceptual difference: the test is conditional on H₀ being true; the interval is not.`,
      },
      {
        type: 'insight',
        title: 'Sample Size for Desired Margin of Error',
        body: `To achieve margin of error ME with confidence level z*: solve ME = z*·√(p̂(1−p̂)/n) for n:
$$n = \\left(\\frac{z^*}{ME}\\right)^2 p(1-p)$$
If p is unknown, use p = 0.5 — this maximizes p(1−p) = 0.25 and gives the most conservative (largest) required n. For ME = 0.03 at 95%: n ≥ (1.96/0.03)² × 0.25 ≈ 1068. This is why most polls use n ≈ 1000 for a ±3% margin of error.`,
      },
    ],
    visualizations: [
      {
        id: 'HypothesisTestViz',
        title: 'Two-Proportion Test — Where Does z = 2.98 Land?',
        mathBridge: `Set the z-stat slider to 2.98 (the A/B test result from the hook). Observe that the p-value (blue) is tiny — well inside the rejection region (red). Switch to one-tailed to see how the p-value changes. This is identical to any z-test: the test statistic tells you how many SEs the observed difference is from zero, and the distribution tells you how often you would see something this extreme under H₀.`,
        caption: `Move the z-slider to ±1.96 to see the boundary of the 5% rejection region. Try z = 1.5 to see a non-significant result.`,
      },
    ],
  },

  math: {
    prose: [
      `**Formal setup.** Let $X_1, X_2, \\ldots, X_n \\overset{iid}{\\sim} \\text{Bernoulli}(p)$ where $p \\in (0,1)$ is unknown. The MLE of $p$ is $\\hat{p} = \\bar{X} = X/n$ where $X = \\sum X_i \\sim \\text{Binomial}(n, p)$. By the CLT, for large $n$: $\\sqrt{n}(\\hat{p} - p) \\xrightarrow{d} N(0, p(1-p))$, so $\\hat{p} \\approx N(p, p(1-p)/n)$.`,

      `**Wald confidence interval.** Replacing $p$ with $\\hat{p}$ in the variance gives the Wald 95% CI: $\\hat{p} \\pm 1.96\\sqrt{\\hat{p}(1-\\hat{p})/n}$. The Wald interval has poor coverage for small $n$ or extreme $p$ — coverage can drop to 85% when the nominal level is 95%. The **Wilson interval** is more accurate: $$\\frac{\\hat{p} + z^{*2}/(2n)}{1 + z^{*2}/n} \\pm \\frac{z^*}{1+z^{*2}/n}\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n} + \\frac{z^{*2}}{4n^2}}$$ The Wilson interval is the default in most software (Python's \`proportion_confint\` with \`method='wilson'\`).`,

      `**One-proportion z-test power.** The power of the z-test at alternative $p = p_a$ is: $\\text{Power} = 1 - \\Phi\\left(z^* - \\frac{|p_a - p_0|}{\\sqrt{p_0(1-p_0)/n}}\\right) + \\Phi\\left(-z^* - \\frac{|p_a - p_0|}{\\sqrt{p_0(1-p_0)/n}}\\right)$ where $\\Phi$ is the normal CDF. For a one-sided test of $H_1: p > p_0$, power simplifies to $1 - \\Phi\\left(z_\\alpha - \\frac{p_a - p_0}{\\sqrt{p_0(1-p_0)/n}}\\right)$. Power increases with sample size $n$ and with the effect size $|p_a - p_0|$.`,
    ],
    callouts: [],
  },

  examples: [
    {
      id: 'ex1',
      title: 'Example 1 — One-Proportion z-Test: Quality Control',
      prose: `A manufacturer claims the defect rate is at most 2% (p₀ = 0.02). An inspector finds 7 defects in a sample of 250 parts. Is there evidence the rate exceeds 2% at α = 0.05?`,
      steps: [
        { expression: `H_0: p = 0.02, \\quad H_1: p > 0.02 \\text{ (right-sided)}`, annotation: `One-sided test — we only care if the defect rate is ABOVE the claim.` },
        { expression: `\\hat{p} = 7/250 = 0.028`, annotation: `Sample proportion.` },
        { expression: `\\text{Check: } np_0 = 250(0.02) = 5 \\geq 10? \\text{ — borderline.}`, annotation: `The success condition is barely satisfied. Results should be interpreted cautiously.` },
        { expression: `SE = \\sqrt{0.02(0.98)/250} = \\sqrt{0.0000784} \\approx 0.00885`, annotation: `Use p₀ = 0.02 (the null value) in the SE for the test.` },
        { expression: `z = (0.028 - 0.02)/0.00885 \\approx 0.904`, annotation: `Test statistic: the observed proportion is 0.9 SEs above the null.` },
        { expression: `p\\text{-value} = P(Z > 0.904) = 1 - \\Phi(0.904) \\approx 0.183`, annotation: `Right-sided p-value.` },
        { expression: `0.183 > 0.05 \\Rightarrow \\text{Fail to reject } H_0`, annotation: `Not enough evidence that the defect rate exceeds 2%. The result is not statistically significant.` },
      ],
    },
    {
      id: 'ex2',
      title: 'Example 2 — Confidence Interval for a Poll',
      prose: `A poll of 1,200 registered voters finds 552 support Measure A. Find the 95% CI for the proportion of all voters who support it.`,
      steps: [
        { expression: `\\hat{p} = 552/1200 = 0.46`, annotation: `Sample proportion.` },
        { expression: `\\text{Check: } 1200(0.46) = 552 \\geq 10, \\; 1200(0.54) = 648 \\geq 10 \\checkmark`, annotation: `Success-failure condition satisfied.` },
        { expression: `SE = \\sqrt{0.46(0.54)/1200} = \\sqrt{0.000207} \\approx 0.01439`, annotation: `Use p̂ (not p₀) for CI.` },
        { expression: `ME = 1.96 \\times 0.01439 \\approx 0.0282`, annotation: `Margin of error for 95% CI.` },
        { expression: `\\text{CI} = 0.46 \\pm 0.028 = (0.432, 0.488)`, annotation: `We are 95% confident the true support is between 43.2% and 48.8%. Since 0.50 is outside this interval, the measure is likely to fail.` },
      ],
    },
  ],

  PythonNotebook: {
    cells: [
      {
        id: 'py1',
        cellTitle: 'One-Proportion z-Test and CI',
        prose: `Testing whether a website's conversion rate differs from a claimed 5%, and computing the confidence interval.`,
        code: `import numpy as np
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest, proportion_confint

# Problem: claim is p0 = 0.05 (5% conversion)
# Observed: 63 conversions out of 1100 visitors
x = 63
n = 1100
p0 = 0.05
p_hat = x / n

print("=== One-Proportion z-Test ===")
print(f"p_hat = {p_hat:.4f}, n = {n}, p0 = {p0}")

# Check success-failure condition
print(f"n*p0 = {n*p0:.0f} (>= 10? {n*p0 >= 10})")
print(f"n*(1-p0) = {n*(1-p0):.0f} (>= 10? {n*(1-p0) >= 10})")

# Manual calculation
se_test = np.sqrt(p0 * (1 - p0) / n)
z_stat = (p_hat - p0) / se_test
p_value_2sided = 2 * stats.norm.sf(abs(z_stat))

print(f"\\nSE (using p0) = {se_test:.5f}")
print(f"z-statistic = {z_stat:.4f}")
print(f"p-value (two-sided) = {p_value_2sided:.4f}")

# Using statsmodels
z_sm, p_sm = proportions_ztest(x, n, value=p0, alternative='two-sided')
print(f"\\nstatsmodels z = {z_sm:.4f}, p = {p_sm:.4f}")

# 95% Confidence Interval (Wilson)
ci_low, ci_high = proportion_confint(x, n, alpha=0.05, method='wilson')
print(f"\\n95% Wilson CI: ({ci_low:.4f}, {ci_high:.4f})")
print(f"Interpretation: 95% confident true conversion rate is between {ci_low*100:.1f}% and {ci_high*100:.1f}%")`,
      },
      {
        id: 'py2',
        cellTitle: 'Two-Proportion z-Test: A/B Test',
        prose: `Comparing version A and version B sign-up rates from the hook example.`,
        code: `import numpy as np
from statsmodels.stats.proportion import proportions_ztest, proportion_confint

# A/B test data
x1, n1 = 412, 1800  # Version A
x2, n2 = 489, 1800  # Version B

p1 = x1 / n1
p2 = x2 / n2
p_pool = (x1 + x2) / (n1 + n2)

print("=== Two-Proportion z-Test ===")
print(f"Version A: p̂1 = {p1:.4f}  ({x1}/{n1})")
print(f"Version B: p̂2 = {p2:.4f}  ({x2}/{n2})")
print(f"Pooled p̂ = {p_pool:.4f}")

# Manual test statistic
se_pool = np.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2))
z_stat = (p2 - p1) / se_pool
from scipy import stats
p_value = 2 * stats.norm.sf(abs(z_stat))

print(f"\\nSE (pooled) = {se_pool:.5f}")
print(f"z-statistic = {z_stat:.4f}")
print(f"p-value (two-sided) = {p_value:.4f}")

# Using statsmodels (one call)
z_sm, p_sm = proportions_ztest([x2, x1], [n2, n1], alternative='two-sided')
print(f"\\nstatsmodels: z = {z_sm:.4f}, p = {p_sm:.4f}")

# 95% CI for difference p2 - p1 (unpooled)
diff = p2 - p1
se_unpooled = np.sqrt(p1*(1-p1)/n1 + p2*(1-p2)/n2)
from scipy.stats import norm
z_star = norm.ppf(0.975)
ci = (diff - z_star*se_unpooled, diff + z_star*se_unpooled)
print(f"\\n95% CI for difference (p2 - p1): ({ci[0]:.4f}, {ci[1]:.4f})")
print(f"= ({ci[0]*100:.1f}%, {ci[1]*100:.1f}%) percentage points")
print(f"\\nConclusion: Version B is significantly better (p = {p_value:.4f} < 0.01)")`,
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: `In a one-proportion z-test of H₀: p = 0.30, which SE formula should you use for the test statistic?`,
      options: [
        `√(0.30 × 0.70 / n)`,
        `√(p̂(1 − p̂) / n)`,
        `√(0.30 / n)`,
        `p̂ / √n`,
      ],
      answer: `√(0.30 × 0.70 / n)`,
      hints: [`The test statistic is computed under the assumption that H₀ is true — so use p₀ = 0.30.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `The success-failure condition for a proportion inference is:`,
      options: [
        `np̂ ≥ 10 AND n(1 − p̂) ≥ 10`,
        `n ≥ 30`,
        `np̂ ≥ 5`,
        `n ≥ 100`,
      ],
      answer: `np̂ ≥ 10 AND n(1 − p̂) ≥ 10`,
      hints: [`Both tails of the binomial need enough expected counts — at least 10 successes AND 10 failures.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `In a two-proportion z-test (H₀: p₁ = p₂), why is the pooled proportion used in the SE?`,
      options: [
        `Under H₀, both groups have the same true p, so pooling gives a better estimate`,
        `Pooling is always required for proportions`,
        `The pooled estimate reduces the test statistic`,
        `It avoids the need for the success-failure condition`,
      ],
      answer: `Under H₀, both groups have the same true p, so pooling gives a better estimate`,
      hints: [`Under H₀: p₁ = p₂ = p, all observations are sampling from the same proportion p — use all data to estimate it.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A 95% confidence interval for a proportion means:`,
      options: [
        `If repeated many times, 95% of such intervals would contain the true p`,
        `There is a 95% probability the true p is in this specific interval`,
        `95% of individual observations fall in the interval`,
        `The sample proportion is within 5% of the true proportion`,
      ],
      answer: `If repeated many times, 95% of such intervals would contain the true p`,
      hints: [`The true p is fixed (unknown but not random). Confidence refers to the procedure, not to any single computed interval.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A poll of n = 900 finds p̂ = 0.52. What is the 95% margin of error?`,
      options: [
        `≈ 3.3 percentage points`,
        `≈ 1.7 percentage points`,
        `≈ 5.2 percentage points`,
        `≈ 0.5 percentage points`,
      ],
      answer: `≈ 3.3 percentage points`,
      hints: [`ME = 1.96 × √(0.52×0.48/900). Compute √(0.2496/900) = √(0.000277) ≈ 0.01664, then 1.96 × 0.01664 ≈ 0.033.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `For an A/B test: x₁ = 50/500, x₂ = 70/500. Under H₀: p₁ = p₂, what is p̂_pool?`,
      options: [
        `(50 + 70)/(500 + 500) = 0.12`,
        `(0.10 + 0.14)/2 = 0.12`,
        `√(0.10 × 0.14) = 0.118`,
        `50/500 = 0.10`,
      ],
      answer: `(50 + 70)/(500 + 500) = 0.12`,
      hints: [`Pool the raw counts (numerators) and total sample sizes (denominators).`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `You want a 95% CI for p with margin of error ≤ 0.02. How large must n be (using worst-case p = 0.5)?`,
      options: [
        `n ≥ 2401`,
        `n ≥ 625`,
        `n ≥ 9604`,
        `n ≥ 100`,
      ],
      answer: `n ≥ 2401`,
      hints: [`n ≥ (z*/ME)² × 0.25 = (1.96/0.02)² × 0.25 = 98² × 0.25 = 9604 × 0.25 = 2401.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `A one-sided test of H₁: p > p₀ yields z = 1.65. At α = 0.05, the critical value is z* = 1.645. What is the conclusion?`,
      options: [
        `Reject H₀ — barely (z > z*)`,
        `Fail to reject H₀ (z < z*)`,
        `Reject H₀ at α = 0.01 too`,
        `Cannot conclude without the sample size`,
      ],
      answer: `Reject H₀ — barely (z > z*)`,
      hints: [`For a right-sided test at α = 0.05, reject H₀ if z > 1.645. Since 1.65 > 1.645, we just barely reject.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `Why is the Wilson interval preferred over the Wald interval for proportions close to 0 or 1?`,
      options: [
        `The Wald interval has poor actual coverage for extreme p̂ or small n`,
        `Wilson is always narrower`,
        `The Wald interval requires the normal distribution`,
        `Wilson works for paired proportions`,
      ],
      answer: `The Wald interval has poor actual coverage for extreme p̂ or small n`,
      hints: [`When p̂ is near 0 or 1, the normal approximation is poor. The Wilson interval uses a different formula that maintains closer to 95% coverage.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `In a one-proportion z-test, the p-value is 0.04 and α = 0.05. You:`,
      options: [
        `Reject H₀ — the data is statistically significant at the 5% level`,
        `Fail to reject H₀ — 0.04 is close to 0.05 so it's not convincing`,
        `Report "borderline" and take no action`,
        `Need more data before concluding`,
      ],
      answer: `Reject H₀ — the data is statistically significant at the 5% level`,
      hints: [`The rule is simple: reject H₀ if p-value < α. Since 0.04 < 0.05, you reject. "Close to α" is not a statistical concept — the threshold is the threshold.`],
      reviewSection: 'intuition',
    },
  ],

  definitions: [
    {
      term: "sample proportion p̂",
      definition: "The fraction of successes in a sample: p̂ = x/n where x is the count of successes and n is the sample size. An unbiased estimate of the population proportion p.",
    },
    {
      term: "success-failure condition",
      definition: "The condition required for normal approximation of a proportion: np̂ ≥ 10 AND n(1−p̂) ≥ 10. Ensures both the expected number of successes and failures are large enough for the normal approximation to be valid.",
    },
    {
      term: "one-proportion z-test",
      definition: "A hypothesis test for H₀: p = p₀. Test statistic: z = (p̂ − p₀) / √(p₀(1−p₀)/n). Uses p₀ (the null value) in the SE — not p̂ — because the test is computed under the assumption H₀ is true.",
    },
    {
      term: "two-proportion z-test",
      definition: "A hypothesis test for H₀: p₁ = p₂. Uses the pooled proportion p̂_pool = (x₁+x₂)/(n₁+n₂) in the SE because under H₀ both groups share the same true p.",
    },
    {
      term: "margin of error (proportion)",
      definition: "ME = z* × √(p̂(1−p̂)/n). Half-width of a confidence interval for a proportion. Increases with higher confidence level (larger z*), higher p̂(1−p̂), and smaller n.",
    },
    {
      term: "Wilson confidence interval",
      definition: "A confidence interval for a proportion that outperforms the Wald interval (p̂ ± ME) when p̂ is near 0 or 1 or n is small. Maintains closer to nominal coverage in these conditions.",
    },
  ],

  checkpoints: [
    { id: 'cp1', label: 'Read the hook and name the test needed for A/B proportions', type: 'read' },
    { id: 'cp2', label: 'State the success-failure condition from memory', type: 'recall' },
    { id: 'cp3', label: 'Run Python Cell 1: one-proportion z-test', type: 'lab' },
    { id: 'cp4', label: 'Run Python Cell 2: two-proportion z-test', type: 'lab' },
    { id: 'cp5', label: 'Complete Example 2 CI calculation by hand', type: 'example' },
    { id: 'cp6', label: 'Pass the quiz with ≥ 80%', type: 'quiz' },
  ],
}
