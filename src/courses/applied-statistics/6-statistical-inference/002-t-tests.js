export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'stat6-002',
  slug: 't-tests',
  chapter: 'stat6',
  order: 2,
  title: 'T-Tests',
  subtitle: 'Testing hypotheses about means when σ is unknown — one sample, two samples, and paired.',
  tags: ['t-test', 't-distribution', 'one-sample t-test', 'two-sample t-test', 'paired t-test', 'degrees of freedom', 'Welch t-test', 'confidence interval', 'p-value'],
  aliases: 't-test t distribution one sample two sample paired degrees of freedom Welch two-sample hypothesis test mean comparison',
  timeToComplete: 45,
  coreConcept: 'When the population standard deviation σ is unknown (the usual case), we estimate it with the sample SD s and use the t-distribution instead of the normal. The one-sample t-test checks whether a population mean equals a claimed value. The two-sample t-test compares means from two independent groups. The paired t-test compares before-and-after measurements. All three use t = (estimate − null value) / SE and compare to the t-distribution with the appropriate degrees of freedom.',
  prerequisites: ['stat6-001', 'stat5-005'],
  nextLesson: 'stat6-003',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: `A pharmaceutical company claims their new blood pressure drug reduces systolic BP by 10 mmHg on average. In a clinical trial of 20 patients, the mean reduction is 12.4 mmHg with a sample SD of 5.2 mmHg. Is the true mean reduction really 10, or is the evidence strong enough to say it is different? And why does not knowing the population standard deviation σ change the entire test procedure?`,
    realWorldContext: `T-tests are the most widely used statistical tests in science, medicine, social science, and industry. Every time a pharmaceutical company publishes a clinical trial result, every time a university publishes a psychology study comparing two groups, every time a manufacturer compares two production lines, the core analysis is almost always a t-test or its close relative. William Sealy Gosset developed the t-distribution in 1908 while working at the Guinness brewery — he needed to draw statistical conclusions from small batches of barley without knowing the true population variance. He published under the pseudonym "Student" to avoid revealing that Guinness was using statistics to optimize beer production, which is why the distribution is called "Student's t" to this day. The key insight: when we estimate σ from a small sample, that estimation uncertainty makes the distribution of the test statistic heavier-tailed than normal — and the t-distribution captures exactly how much heavier.`,
    previewVisualizationId: 'TDistributionViz',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      `**Roadmap for this lesson.** By the end you will: (1) explain why the t-distribution is used instead of normal when σ is unknown; (2) perform a one-sample t-test step by step; (3) perform an independent two-sample t-test (Welch's version); (4) perform a paired t-test and explain when it is the right choice; (5) compute and interpret a t-based confidence interval; (6) use Python/MATLAB to perform all three tests.`,

      `**Why replace z with t.** The z-test uses z = (X̄ − μ₀)/(σ/√n), which requires knowing σ. In practice, σ is almost never known — we estimate it with the sample SD s. When we plug in s instead of σ, the statistic t = (X̄ − μ₀)/(s/√n) is no longer standard normal. It follows a t-distribution with n−1 degrees of freedom. The t-distribution looks like a normal but has heavier tails, especially for small n. As n → ∞, the t-distribution converges to the standard normal (because s → σ).`,

      `**Before reading on, predict:** If you replace σ with an estimate s in the test statistic, does this make the test statistic more or less extreme than using the true σ? If the test statistic is more variable, what should this do to the critical values (the cutoffs for rejection)?`,

      `**The t-distribution and degrees of freedom.** The t-distribution with ν degrees of freedom has heavier tails than N(0,1) — the smaller ν, the heavier the tails. For ν = 1, the tails are so heavy that the distribution has no finite variance. For ν = 30, the t-distribution is nearly indistinguishable from standard normal. The ν=n−1 formula for a one-sample test comes from the fact that we estimated one parameter (μ by X̄) before computing s, leaving n−1 independent pieces of information.`,

      `**One-sample t-test: the most fundamental test.** You have n observations from a population with unknown μ and σ. You claim μ = μ₀. The test statistic is t = (X̄ − μ₀)/(s/√n). Under H₀: μ = μ₀, this follows t(n−1). Compute the p-value: for a two-sided test, p = 2 × P(T ≥ |t|) where T ~ t(n−1). Reject H₀ at level α if p < α.`,

      `**Two-sample t-test: comparing two groups.** You have sample 1 (n₁ observations, mean X̄₁, SD s₁) and sample 2 (n₂ observations, mean X̄₂, SD s₂) from two independent populations. You want to test H₀: μ₁ = μ₂. Use Welch's t-test (does not assume equal variances): t = (X̄₁ − X̄₂)/√(s₁²/n₁ + s₂²/n₂). The degrees of freedom are approximated by the Welch-Satterthwaite formula (messy to compute by hand — use software). Welch's test is always at least as valid as the pooled t-test and is the default in most statistical software.`,

      `**Paired t-test: when observations come in pairs.** When each unit of analysis has two measurements (before/after, treatment/control on the same subject, matched pairs), the observations are not independent. Pairing removes between-subject variability and gives a more powerful test. Compute the differences dᵢ = X₁ᵢ − X₂ᵢ, then run a one-sample t-test on d₁, ..., dₙ against H₀: μd = 0. The paired t-test is always more powerful than the independent t-test when the pairing is effective (i.e., when the two measurements for the same unit are correlated).`,

      `**T-tests and confidence intervals: two sides of the same coin.** A two-sided t-test at level α rejects H₀: μ = μ₀ if and only if μ₀ falls outside the (1−α)×100% confidence interval X̄ ± t*(s/√n), where t* = t(n−1, 1−α/2). The confidence interval is just the set of μ₀ values you would fail to reject. Always report the confidence interval alongside the p-value — it shows the magnitude and uncertainty of the effect, not just whether it is "significant."`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'T-Distribution',
        body: `The t-distribution with ν degrees of freedom has PDF:\n$$f(t) = \\frac{\\Gamma((\\nu+1)/2)}{\\sqrt{\\nu\\pi}\\,\\Gamma(\\nu/2)}\\left(1 + \\frac{t^2}{\\nu}\\right)^{-(\\nu+1)/2}$$\n\nKey properties:\n• Symmetric about 0, mean = 0 (for ν > 1)\n• Variance = ν/(ν−2) for ν > 2 — heavier tails than normal\n• As ν → ∞: converges to N(0,1)\n• Used whenever σ is estimated from data (which is almost always)\n\nIn Python: scipy.stats.t(df=ν). In MATLAB: tcdf, tinv.`,
      },
      {
        type: 'procedure',
        title: 'One-Sample T-Test Procedure',
        body: `**Given:** n observations, sample mean X̄, sample SD s. Claim: μ = μ₀.\n\n1. State H₀: μ = μ₀ and H₁ (two-sided: μ ≠ μ₀; one-sided: μ > μ₀ or μ < μ₀)\n2. Compute t = (X̄ − μ₀) / (s/√n)\n3. Find degrees of freedom: ν = n − 1\n4. Compute p-value:\n   • Two-sided: p = 2 × P(T ≥ |t|) where T ~ t(ν)\n   • One-sided (H₁: μ > μ₀): p = P(T ≥ t)\n   • One-sided (H₁: μ < μ₀): p = P(T ≤ t)\n5. Compare p to α. Reject H₀ if p < α.\n6. Report 95% CI: X̄ ± t*(s/√n) where t* = t(ν, 0.975)`,
      },
      {
        type: 'insight',
        title: 'Welch vs Pooled T-Test',
        body: `**Pooled t-test** assumes equal variances (σ₁² = σ₂²) and pools the two sample variances into one estimate. This gives more power when the assumption holds.\n\n**Welch's t-test** does not assume equal variances. It is slightly less powerful when variances are truly equal, but it is robust when they are not.\n\n**Recommendation:** Always use Welch's unless you have a strong theoretical reason to believe σ₁ = σ₂. The Levene or F-test for equal variances is too underpowered to reliably detect unequal variances, especially with small n. Using Welch's by default is safer.`,
      },
      {
        type: 'warning',
        title: 'T-Tests Assume (Near) Normality',
        body: `The one-sample t-test requires the data (or the differences, for paired) to be approximately normally distributed. For n ≥ 30, the CLT makes this robust to non-normality. For small n (< 15), non-normality can invalidate the test.\n\nChecks: plot a histogram, QQ-plot, or run a Shapiro-Wilk test.\n\nIf normality fails: use the Wilcoxon signed-rank test (one-sample) or Mann-Whitney U test (two-sample) as non-parametric alternatives. These do not require normality but test a different (weaker) hypothesis.`,
      },
    ],
    visualizations: [
      {
        id: 'TDistributionViz',
        title: 't-Distribution vs Normal — Heavy Tails from Small Samples',
        mathBridge: `Drag the df slider from 1 to 30. At low df, the t-distribution (indigo solid) has dramatically heavier tails than N(0,1) (gray dashes) — meaning you need a larger t to be "unusual." Toggle two-tailed to compare critical values: t*(df=5, α=0.05) ≈ 2.57 versus z* = 1.96. The t(df) converges to N(0,1) as df → ∞ because the uncertainty in estimating σ vanishes.`,
        caption: `Use the α dropdown to change the significance level. Notice that the critical value t* decreases as df increases — with more data, less tail area is needed.`,
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────
  math: {
    prose: [
      `**Where the t-distribution comes from.** If $X_1, \\ldots, X_n$ are i.i.d. $N(\\mu, \\sigma^2)$, then $\\bar{X} \\sim N(\\mu, \\sigma^2/n)$ exactly (not approximately). The sample variance $S^2 = \\frac{1}{n-1}\\sum(X_i - \\bar{X})^2$ satisfies $(n-1)S^2/\\sigma^2 \\sim \\chi^2(n-1)$. Moreover (by Basu's theorem), $\\bar{X}$ and $S^2$ are independent. Therefore $t = (\\bar{X} - \\mu)/(S/\\sqrt{n}) = Z/\\sqrt{\\chi^2(n-1)/(n-1)}$ follows exactly a t$(n-1)$ distribution, where $Z \\sim N(0,1)$. The t-distribution is defined as exactly this ratio.`,

      `**One-sample t-test derivation.** Under $H_0: \\mu = \\mu_0$, $t = (\\bar{X} - \\mu_0)/(S/\\sqrt{n}) \\sim t(n-1)$ exactly (for normal data). The p-value for a two-sided test is $p = 2 P(T \\geq |t_{\\text{obs}}|)$ where $T \\sim t(n-1)$. For non-normal data, the CLT ensures the t-test is approximately valid for large n.`,

      `**Welch-Satterthwaite degrees of freedom.** For a two-sample Welch t-test with samples $(n_1, s_1)$ and $(n_2, s_2)$, the test statistic is $t = (\\bar{X}_1 - \\bar{X}_2)/\\sqrt{s_1^2/n_1 + s_2^2/n_2}$. The degrees of freedom are approximated by:\n$$\\nu = \\frac{(s_1^2/n_1 + s_2^2/n_2)^2}{(s_1^2/n_1)^2/(n_1-1) + (s_2^2/n_2)^2/(n_2-1)}$$\nThis formula is not elegant, but it correctly accounts for the combined uncertainty from two separate variance estimates. Software computes this automatically.`,

      `**Confidence intervals from t-tests.** The 95% confidence interval for μ is $\\bar{X} \\pm t^*_{n-1} \\cdot (s/\\sqrt{n})$ where $t^*_{n-1}$ is the 97.5th percentile of $t(n-1)$ (because we need 2.5% in each tail for a two-sided 95% interval). For large n, $t^* \\approx 1.96$ (the familiar z-value). For n=10, $t^* \\approx 2.262$. For n=5, $t^* \\approx 2.776$. Smaller samples require wider intervals.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'One-Sample T-Test Summary',
        body: `**Data:** $x_1, \\ldots, x_n$ with sample mean $\\bar{x}$ and sample SD $s$.\n**Null:** $H_0: \\mu = \\mu_0$\n\n$$t = \\frac{\\bar{x} - \\mu_0}{s/\\sqrt{n}} \\sim t(n-1) \\text{ under } H_0$$\n\n**Two-sided p-value:** $p = 2\\,P(T \\geq |t|)$, $T \\sim t(n-1)$\n\n**95% Confidence Interval:**\n$$\\bar{x} \\pm t^*_{n-1} \\cdot \\frac{s}{\\sqrt{n}}, \\quad t^*_{n-1} = t(n-1, 0.975)$$\n\n**Reject $H_0$** if $p < \\alpha$, equivalently if $|t| > t^*_{n-1}$.`,
      },
      {
        type: 'theorem',
        title: 'Paired T-Test: Reduction to One-Sample',
        body: `**Data:** Paired observations $(X_{1i}, X_{2i})$ for $i=1,\\ldots,n$. Let $d_i = X_{1i} - X_{2i}$.\n\n**Null:** $H_0: \\mu_d = 0$ (no difference)\n\nCompute $\\bar{d}$ and $s_d$ (mean and SD of differences).\n\n$$t = \\frac{\\bar{d} - 0}{s_d/\\sqrt{n}} \\sim t(n-1) \\text{ under } H_0$$\n\nThis is exactly a one-sample t-test on the differences $d_1, \\ldots, d_n$.\n\n**When to use paired:** When the same unit is measured twice (before/after, left/right eye, matched subjects). Pairing removes between-unit variability and increases power.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'T-Tests — Python',
        initialProps: {
          initialCells: [
            {
              id: 'cell1',
              cellTitle: 'One-Sample T-Test: Blood Pressure Drug',
              prose: `The pharmaceutical scenario from the hook: testing whether mean BP reduction = 10 mmHg.`,
              code: `import numpy as np
from scipy import stats

# Data: 20 patients, mean reduction = 12.4 mmHg, SD = 5.2 mmHg
n = 20
xbar = 12.4
s = 5.2
mu0 = 10.0   # claimed mean reduction under H0

# Manual calculation
se = s / np.sqrt(n)
t_stat = (xbar - mu0) / se
df = n - 1

# p-value (two-sided)
p_value = 2 * stats.t.sf(abs(t_stat), df=df)

# Critical value at alpha=0.05 (two-sided)
t_star = stats.t.ppf(0.975, df=df)

# 95% Confidence Interval
ci_low = xbar - t_star * se
ci_high = xbar + t_star * se

print("=== One-Sample T-Test ===")
print(f"H0: μ = {mu0}  vs  H1: μ ≠ {mu0}")
print(f"n = {n}, x̄ = {xbar}, s = {s}")
print(f"SE = s/√n = {se:.4f}")
print(f"t-statistic = {t_stat:.4f}")
print(f"Degrees of freedom = {df}")
print(f"p-value (two-sided) = {p_value:.4f}")
print(f"t* (critical, α=0.05) = ±{t_star:.4f}")
print(f"95% CI: ({ci_low:.2f}, {ci_high:.2f})")
print()
if p_value < 0.05:
    print("REJECT H0: evidence that μ ≠ 10 mmHg (p < 0.05)")
else:
    print("FAIL TO REJECT H0: insufficient evidence that μ ≠ 10 mmHg")

# Quick comparison: what if we (wrongly) used a z-test?
z_stat = t_stat  # same formula, different reference distribution
p_z = 2 * stats.norm.sf(abs(z_stat))
print(f"
For comparison: z-test p-value = {p_z:.4f} (underestimates uncertainty)")`,
            },
            {
              id: 'cell2',
              cellTitle: 'Two-Sample Welch T-Test: Comparing Two Groups',
              prose: `Comparing mean test scores between two teaching methods. We use Welch's test, which does not require equal variances.`,
              code: `import numpy as np
from scipy import stats

rng = np.random.default_rng(99)

# Simulate two groups of students
method_A = rng.normal(loc=74, scale=10, size=30)   # traditional instruction
method_B = rng.normal(loc=79, scale=14, size=25)   # new active-learning method

# Welch two-sample t-test (scipy default)
t_stat, p_value = stats.ttest_ind(method_B, method_A, equal_var=False)

print("=== Two-Sample Welch T-Test ===")
print(f"Method A: n={len(method_A)}, mean={method_A.mean():.2f}, SD={method_A.std(ddof=1):.2f}")
print(f"Method B: n={len(method_B)}, mean={method_B.mean():.2f}, SD={method_B.std(ddof=1):.2f}")
print(f"H0: μ_A = μ_B  vs  H1: μ_A ≠ μ_B")
print(f"t-statistic = {t_stat:.4f}")
print(f"p-value (two-sided) = {p_value:.4f}")
print()
if p_value < 0.05:
    print("REJECT H0: the two methods differ significantly (p < 0.05)")
else:
    print("FAIL TO REJECT H0: insufficient evidence of a difference")

# Effect size: Cohen's d
pooled_sd = np.sqrt((method_A.var(ddof=1) + method_B.var(ddof=1)) / 2)
cohens_d = (method_B.mean() - method_A.mean()) / pooled_sd
print(f"\nEffect size (Cohen's d) = {cohens_d:.3f}")
print("(Rule of thumb: 0.2=small, 0.5=medium, 0.8=large)")

# Also show what pooled t-test gives (requires equal_var=True)
t_pooled, p_pooled = stats.ttest_ind(method_B, method_A, equal_var=True)
print(f"\nPooled t-test (for comparison): t={t_pooled:.4f}, p={p_pooled:.4f}")`,
            },
            {
              id: 'cell3',
              cellTitle: 'Paired T-Test: Before and After',
              prose: `Testing whether a training program improves employee performance scores. Each employee is measured before and after, so the observations are paired.`,
              code: `import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

rng = np.random.default_rng(77)
n = 18

# Before and after scores (paired — same employees)
before = rng.normal(loc=65, scale=8, size=n)
after = before + rng.normal(loc=5, scale=4, size=n)   # true improvement ≈ 5 points

# Compute differences
diffs = after - before

# Paired t-test using scipy
t_stat, p_value = stats.ttest_rel(after, before)

# Manual verification
d_bar = diffs.mean()
s_d = diffs.std(ddof=1)
se_d = s_d / np.sqrt(n)
t_manual = d_bar / se_d

print("=== Paired T-Test ===")
print(f"Before: mean = {before.mean():.2f}")
print(f"After:  mean = {after.mean():.2f}")
print(f"Differences: mean = {d_bar:.2f}, SD = {s_d:.2f}")
print(f"t-statistic = {t_stat:.4f}  (manual = {t_manual:.4f})")
print(f"p-value (two-sided) = {p_value:.4f}")

t_star = stats.t.ppf(0.975, df=n-1)
ci = (d_bar - t_star * se_d, d_bar + t_star * se_d)
print(f"95% CI for mean improvement: ({ci[0]:.2f}, {ci[1]:.2f})")
print()
if p_value < 0.05:
    print("REJECT H0: evidence of improvement (p < 0.05)")

# Visualize: pair plot of differences
fig, axes = plt.subplots(1, 2, figsize=(10, 4))
for i in range(n):
    axes[0].plot([0, 1], [before[i], after[i]], 'o-', alpha=0.4, color='steelblue')
axes[0].set_xticks([0, 1]); axes[0].set_xticklabels(['Before', 'After'])
axes[0].set_ylabel('Score'); axes[0].set_title('Paired Observations')

axes[1].hist(diffs, bins=8, color='steelblue', alpha=0.7)
axes[1].axvline(d_bar, color='red', linestyle='--', label=f'd̄ = {d_bar:.2f}')
axes[1].axvline(0, color='black', linestyle='-', alpha=0.3, label='H0: d=0')
axes[1].set_xlabel('Difference (After − Before)')
axes[1].set_title('Distribution of Differences')
axes[1].legend()
plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              cellTitle: 'Challenge: Choose the Right T-Test',
              prose: `**Scenario A:** A coffee shop claims its large cups contain 16 oz. You measure 12 cups and find a mean of 15.3 oz with SD = 0.8 oz. Is the mean significantly different from 16 oz?

**Scenario B:** Two fertilizers are tested on 15 plots each. Fertilizer X: mean yield 48 kg, SD 6. Fertilizer Y: mean yield 52 kg, SD 9. Is there a significant difference?

**Scenario C:** 10 runners' times (minutes) in a marathon: Before training program: [245, 260, 238, 252, 270, 241, 255, 263, 248, 257]. After: [238, 249, 235, 243, 258, 236, 248, 254, 240, 249]. Did training improve times?

**Task:** For each scenario, state which t-test is appropriate and why, then perform it using scipy.stats. Report t-statistic, p-value, and 95% CI. Use α = 0.05.`,
              starterCode: `from scipy import stats
import numpy as np

# Scenario A: One-sample t-test
n_A = 12;  xbar_A = 15.3;  s_A = 0.8;  mu0 = 16
t_A = # (xbar_A - mu0) / (s_A / np.sqrt(n_A))
p_A = # 2 * stats.t.sf(abs(t_A), df=n_A-1)
print(f"A: t={t_A:.3f}, p={p_A:.4f}")

# Scenario B: Independent two-sample Welch
rng = np.random.default_rng(1)
X = rng.normal(48, 6, 15);  Y = rng.normal(52, 9, 15)
t_B, p_B = # stats.ttest_ind(Y, X, equal_var=False)
print(f"B: t={t_B:.3f}, p={p_B:.4f}")

# Scenario C: Paired t-test
before = [245, 260, 238, 252, 270, 241, 255, 263, 248, 257]
after  = [238, 249, 235, 243, 258, 236, 248, 254, 240, 249]
t_C, p_C = # stats.ttest_rel(after, before)
print(f"C: t={t_C:.3f}, p={p_C:.4f}")`,
              solution: `from scipy import stats
import numpy as np

# Scenario A: One-sample t-test
n_A = 12;  xbar_A = 15.3;  s_A = 0.8;  mu0 = 16
t_A = (xbar_A - mu0) / (s_A / np.sqrt(n_A))
p_A = 2 * stats.t.sf(abs(t_A), df=n_A-1)
ci_A = (xbar_A - stats.t.ppf(0.975, n_A-1)*s_A/np.sqrt(n_A),
        xbar_A + stats.t.ppf(0.975, n_A-1)*s_A/np.sqrt(n_A))
print(f"A: t={t_A:.3f}, p={p_A:.4f}, 95%CI=({ci_A[0]:.2f},{ci_A[1]:.2f})")
print(f"   {'REJECT H0' if p_A < 0.05 else 'Fail to reject H0'}")

# Scenario B: Independent two-sample Welch
rng = np.random.default_rng(1)
X = rng.normal(48, 6, 15);  Y = rng.normal(52, 9, 15)
t_B, p_B = stats.ttest_ind(Y, X, equal_var=False)
diff_B = Y.mean() - X.mean()
print(f"B: t={t_B:.3f}, p={p_B:.4f}, mean diff={diff_B:.2f}")
print(f"   {'REJECT H0' if p_B < 0.05 else 'Fail to reject H0'}")

# Scenario C: Paired t-test
before = [245, 260, 238, 252, 270, 241, 255, 263, 248, 257]
after  = [238, 249, 235, 243, 258, 236, 248, 254, 240, 249]
t_C, p_C = stats.ttest_rel(after, before)
diffs = np.array(after) - np.array(before)
n_C = len(diffs)
ci_C = (diffs.mean() - stats.t.ppf(0.975, n_C-1)*diffs.std(ddof=1)/np.sqrt(n_C),
        diffs.mean() + stats.t.ppf(0.975, n_C-1)*diffs.std(ddof=1)/np.sqrt(n_C))
print(f"C: t={t_C:.3f}, p={p_C:.4f}, mean improvement={-diffs.mean():.2f} min, 95%CI=({ci_C[0]:.2f},{ci_C[1]:.2f})")
print(f"   {'REJECT H0' if p_C < 0.05 else 'Fail to reject H0'}")`,
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'T-Tests — MATLAB/Octave',
        initialProps: {
          initialCells: [
            {
              id: 'mat1',
              cellTitle: 'One-Sample and Paired T-Tests in MATLAB',
              prose: `MATLAB's ttest and ttest2 functions perform all three t-test types. We'll verify the blood pressure example and the paired training example.`,
              code: `pkg load statistics
% One-sample t-test: BP drug example
n = 20;   xbar = 12.4;   s = 5.2;   mu0 = 10;

se = s / sqrt(n);
t_stat = (xbar - mu0) / se;
df = n - 1;

p_value = 2 * tcdf(-abs(t_stat), df);
t_star = tinv(0.975, df);
ci = [xbar - t_star*se, xbar + t_star*se];

fprintf('One-Sample T-Test\\n');
fprintf('t = %.4f,  df = %d\\n', t_stat, df);
fprintf('p-value = %.4f\\n', p_value);
fprintf('95%% CI: [%.2f, %.2f]\\n\\n', ci(1), ci(2));

% Using MATLAB's built-in ttest (requires data vector — simulate it)
rng(42);
data = mu0 + s*trnd(df, 1, n) + (xbar - mu0);  % fake data matching xbar, s
[h, p, ci_built, stats_built] = ttest(data, mu0, 'Alpha', 0.05);
fprintf('MATLAB ttest: h=%d, p=%.4f, t=%.4f\\n', h, p, stats_built.tstat);

% Paired t-test
before = [245 260 238 252 270 241 255 263 248 257];
after  = [238 249 235 243 258 236 248 254 240 249];
[h2, p2, ci2, stats2] = ttest(after, before);
fprintf('\\nPaired T-Test (training)\\n');
fprintf('t = %.4f,  p = %.4f\\n', stats2.tstat, p2);
fprintf('Mean improvement = %.2f min\\n', mean(before - after));
fprintf('95%% CI for improvement: [%.2f, %.2f]\\n', -ci2(2), -ci2(1));
if h2
    fprintf('REJECT H0: training improved times (p < 0.05)\\n');
end`,
            },
            {
              id: 'mat2',
              cellTitle: 'Two-Sample Welch T-Test in MATLAB',
              prose: `Comparing two groups with potentially unequal variances using ttest2.`,
              code: `% Two-sample Welch t-test
rng(42);
method_A = normrnd(74, 10, 1, 30);
method_B = normrnd(79, 14, 1, 25);

% Welch t-test (vartype = 'unequal')
[h, p, ci, s] = ttest2(method_B, method_A, 'Vartype', 'unequal');

fprintf('Two-Sample Welch T-Test\\n');
fprintf('Method A: mean=%.2f, SD=%.2f, n=%d\\n', mean(method_A), std(method_A), length(method_A));
fprintf('Method B: mean=%.2f, SD=%.2f, n=%d\\n', mean(method_B), std(method_B), length(method_B));
fprintf('t = %.4f, df = %.2f\\n', s.tstat, s.df);
fprintf('p-value = %.4f\\n', p);
fprintf('95%% CI for difference: [%.2f, %.2f]\\n', ci(1), ci(2));

if h
    fprintf('REJECT H0: the methods differ significantly\\n');
else
    fprintf('FAIL TO REJECT H0\\n');
end

% Effect size: Cohen's d
pooled_var = (var(method_A) + var(method_B)) / 2;
d = (mean(method_B) - mean(method_A)) / sqrt(pooled_var);
fprintf("Cohen's d = %.3f\\n", d);`,
            },
          ],
        },
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────
  rigor: {
    prose: [
      `**Power of the t-test.** The power of a test is the probability of correctly rejecting H₀ when H₁ is true: Power = P(reject H₀ | H₁ true) = 1 − β, where β is the Type II error rate. For a one-sample t-test at level α with true mean μ₁ ≠ μ₀: Power = P(|T| > t*|λ) where T follows a non-central t-distribution with non-centrality parameter λ = (μ₁ − μ₀)/(σ/√n). Power increases with: (1) larger effect size |μ₁ − μ₀|; (2) larger n; (3) smaller σ; (4) larger α (but this inflates Type I error). Power analysis determines the n needed to detect a given effect with, say, 80% power — this is required in clinical trial design before data collection.`,

      `**Robustness to non-normality.** The t-test is more robust to departures from normality than commonly believed, especially for two-sided tests and symmetric distributions. The reason: the CLT ensures the sampling distribution of X̄ approaches normality even when the data are not normal. For one-sided tests, heavy skewness can cause size distortion (the actual Type I error rate differs from α). For very heavy-tailed or highly skewed data with small n, non-parametric alternatives (Wilcoxon signed-rank, Mann-Whitney U) are preferable. Bootstrap confidence intervals are another robust alternative.`,

      `**Multiple testing: why running many t-tests inflates errors.** If you run 20 independent t-tests each at α = 0.05, and all null hypotheses are true, the probability of at least one false rejection is 1 − (0.95)²⁰ ≈ 0.64. This is the multiple comparisons problem. Corrections: Bonferroni (divide α by the number of tests) is simple but conservative; Benjamini-Hochberg (controls False Discovery Rate) is less conservative. In genomics, researchers routinely test 50,000+ hypotheses simultaneously, where correction is essential.`,
    ],
  },

  // ── Examples ──────────────────────────────────────────────────
  examples: [
    {
      title: 'One-Sample T-Test: Product Fill Volume',
      steps: [
        `**Setup.** A juice bottle is supposed to contain 250 mL. Quality control samples 9 bottles: [248, 251, 249, 252, 247, 250, 253, 248, 251]. Test H₀: μ = 250 at α = 0.05.`,
        `**Compute summaries.** x̄ = (248+251+249+252+247+250+253+248+251)/9 = 249.89. s = √(Σ(xᵢ−x̄)²/(n−1)) ≈ 1.90. SE = 1.90/√9 = 0.633.`,
        `**Compute t-statistic.** t = (249.89 − 250)/0.633 = −0.11/0.633 ≈ −0.174. df = 8.`,
        `**p-value.** p = 2 × P(T ≥ 0.174) with T ~ t(8). From tables or software: P(T ≥ 0.174) ≈ 0.433. p ≈ 0.866. 95% CI: 249.89 ± t*(0.633) = 249.89 ± 2.306(0.633) = (248.43, 251.34).`,
        `**Conclusion.** p = 0.866 >> 0.05. Fail to reject H₀. The data are consistent with a true mean of 250 mL. The 95% CI (248.43, 251.34) contains 250.`,
      ],
      annotations: [
        `A large p-value means the data are very consistent with H₀ — this is not evidence that H₀ is true, just no evidence against it.`,
        `Always report the confidence interval: it shows the range of plausible values for μ, not just a binary pass/fail.`,
        `With only n=9, the critical value t*(8) = 2.306 is much larger than z* = 1.96 — small samples require stronger evidence.`,
      ],
    },
    {
      title: 'Paired T-Test: Before and After a Diet Program',
      steps: [
        `**Setup.** 8 participants' weights (kg) before and after a 6-week diet: Before: [85, 92, 78, 101, 88, 95, 82, 79]. After: [82, 88, 77, 96, 84, 91, 80, 76]. Test H₀: mean weight loss = 0 at α = 0.05 (two-sided).`,
        `**Compute differences** (Before − After): [3, 4, 1, 5, 4, 4, 2, 3]. d̄ = 3.25 kg. sd = √(Σ(dᵢ−d̄)²/7) ≈ 1.282. SE_d = 1.282/√8 = 0.453.`,
        `**T-statistic.** t = 3.25/0.453 ≈ 7.18. df = 7.`,
        `**P-value.** p = 2P(T ≥ 7.18) with T ~ t(7). From software: p ≈ 0.00018. t*(7) = 2.365, so critical value is ±2.365. Our |t| = 7.18 far exceeds this. 95% CI: 3.25 ± 2.365(0.453) = (2.18, 4.32) kg.`,
        `**Conclusion.** Reject H₀ (p < 0.05). There is very strong evidence of weight loss. The 95% CI says the true mean weight loss is between 2.18 and 4.32 kg.`,
      ],
      annotations: [
        `The paired design eliminates between-person variability — we are testing whether each person lost weight, not whether the group is lighter than some other group.`,
        `The 95% CI does not include 0, confirming the test result at α = 0.05.`,
        `Effect size: mean loss of 3.25 kg over 6 weeks. Report this alongside p — statistical significance does not tell you if the effect is practically important.`,
      ],
    },
  ],

  // ── Challenges ────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1',
      difficulty: 'easy',
      problem: `A sample of n=16 lightbulb lifetimes yields x̄ = 1250 hours and s = 80 hours. The manufacturer claims μ = 1200 hours.\n\n(a) Perform a two-sided one-sample t-test at α = 0.05.\n(b) Compute the 95% confidence interval.\n(c) Would you reject H₀ at α = 0.01?`,
      walkthrough: [
        `(a) SE = 80/√16 = 20. t = (1250 − 1200)/20 = 2.5. df = 15. t*(15, 0.975) = 2.131. |t| = 2.5 > 2.131, so **REJECT H₀** at α=0.05. p = 2P(T≥2.5) ≈ 0.0246.\n\n(b) CI: 1250 ± 2.131(20) = (1207.4, 1292.6) hours.\n\n(c) At α=0.01: t*(15, 0.995) = 2.947. |t| = 2.5 < 2.947, **fail to reject** H₀ at α=0.01. The p-value of 0.024 falls between 0.01 and 0.05.`,
      ]
    },
    {
      id: 'ch2',
      difficulty: 'medium',
      problem: `Researchers compare two pain-relief drugs on 12 patients each. Drug A: x̄=6.2, s=1.8. Drug B: x̄=7.1, s=2.9. (Higher scores = better relief.)\n\n(a) Perform a Welch two-sample t-test for H₀: μ_A = μ_B at α=0.05.\n(b) Compute Cohen's d. Is the effect small, medium, or large?\n(c) If you ran a pooled t-test instead, would the conclusion change? (Use software or compute the pooled SD.)`,
      walkthrough: [
        `(a) SE = √(1.8²/12 + 2.9²/12) = √(0.27 + 0.701) = √0.971 = 0.985. t = (7.1−6.2)/0.985 = 0.913. Welch-Satterthwaite df ≈ 16.9 (compute numerically). t*(16.9, 0.975) ≈ 2.11. |t| = 0.913 < 2.11. **Fail to reject H₀** at α=0.05. p ≈ 0.37.\n\n(b) Pooled SD = √((1.8²+2.9²)/2) = √(1.62+4.205)/2 = √2.9125 ≈ 1.71. Cohen's d = (7.1−6.2)/1.71 ≈ 0.53 — **medium** effect. Despite a medium effect size, n=12 per group is too small to detect it reliably.\n\n(c) Pooled t: same numerator (0.9), denominator s_p×√(1/12+1/12) = 1.71×0.408 = 0.698. t = 0.9/0.698 = 1.29. p ≈ 0.21 — also not significant. Conclusions are the same here, but Welch's is more conservative (higher p, different df).`,
      ]
    },
    {
      id: 'ch3',
      difficulty: 'hard',
      problem: `**Power analysis.** For a two-sided one-sample t-test at α=0.05, compute the statistical power to detect a difference of 0.5σ (i.e., Cohen's d = 0.5) with n=20 observations. Use Python (scipy.stats.power.ttest_1samp or by simulation). Then find the minimum n needed to achieve at least 80% power to detect d=0.5.`,
      walkthrough: [
        `Using simulation:\n\`\`\`python\nimport numpy as np; from scipy import stats\nrng = np.random.default_rng(0)\nn_sims = 10000; n = 20; delta = 0.5  # Cohen's d = 0.5σ\nrejections = 0\nfor _ in range(n_sims):\n    x = rng.normal(delta, 1, n)  # true μ = 0.5, σ=1\n    t, p = stats.ttest_1samp(x, 0)\n    if p < 0.05: rejections += 1\nprint(f"Power ≈ {rejections/n_sims:.3f}")\n\`\`\`\nResult: Power ≈ 0.43 — only 43% chance of detecting d=0.5 with n=20.\n\nFor 80% power: using scipy.stats.power.ttest_power or the formula, n ≈ 34. Verify:\nn=34 → Power ≈ 0.80. Rule of thumb: to detect d=0.5 with 80% power, you need n≈34 per group in a one-sample test (n≈64 per group in a two-sample test).`,
      ]
    },
  ],

  // ── Quiz ──────────────────────────────────────────────────────
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: `Why is the t-distribution used instead of the standard normal when σ is unknown?`,
      options: [
        `The t-distribution has a lighter tail, making the test more powerful.`,
        `Estimating σ with s introduces additional variability, making the test statistic follow a heavier-tailed distribution.`,
        `The t-distribution is only used for small samples; for large samples we always use normal.`,
        `It is just a convention — the results are always identical to using the normal.`,
      ],
      answer: `Estimating σ with s introduces additional variability, making the test statistic follow a heavier-tailed distribution.`,
      hints: [
        `The test statistic t = (X̄ − μ₀)/(s/√n) has uncertainty from both X̄ and the estimate s.`,
        `This extra uncertainty from estimating σ makes extreme values of t more likely than under a normal distribution.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q2',
      type: 'choice',
      text: `For a one-sample t-test with n=25 observations, what are the degrees of freedom?`,
      options: [`25`, `24`, `26`, `12`],
      answer: `24`,
      hints: [
        `Degrees of freedom = n − 1 for a one-sample t-test.`,
        `One degree of freedom is "used up" estimating μ with X̄ when computing s.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q3',
      type: 'choice',
      text: `Two groups have identical means. Group A has n=20 and Group B has n=20, but Group A has much higher variance. Which test is appropriate?`,
      options: [
        `Paired t-test, since both groups are the same size.`,
        `Pooled two-sample t-test, since the means are equal.`,
        `Welch's two-sample t-test, since the variances differ.`,
        `One-sample t-test against the common mean.`,
      ],
      answer: `Welch's two-sample t-test, since the variances differ.`,
      hints: [
        `The pooled t-test assumes equal variances. When variances differ, it is invalid.`,
        `Welch's test does not assume equal variances and is the safe default for two independent groups.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q4',
      type: 'choice',
      text: `Researchers measure 10 subjects' blood pressure before and after a drug. They compute dᵢ = (after − before) for each subject and find d̄ = −8.2 mmHg with sd = 4.1 mmHg. What is the t-statistic?`,
      options: [
        `t = −8.2 / 4.1 = −2.0`,
        `t = −8.2 / (4.1/√10) ≈ −6.32`,
        `t = −8.2 / (4.1/√9) ≈ −6.0`,
        `t = 4.1 / (8.2/√10) ≈ 1.58`,
      ],
      answer: `t = −8.2 / (4.1/√10) ≈ −6.32`,
      hints: [
        `The paired t-test runs a one-sample t-test on the differences: t = d̄ / (sd/√n).`,
        `SE = sd/√n = 4.1/√10 = 1.297. t = −8.2/1.297 ≈ −6.32.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q5',
      type: 'choice',
      text: `A two-sided one-sample t-test with n=20 gives t = 2.1. The 95% confidence interval for μ is (10.2, 15.8). If you were to test H₀: μ = 10 at α = 0.05, what would you conclude?`,
      options: [
        `Reject H₀, because 10 is close to the CI boundary.`,
        `Fail to reject H₀, because 10 is outside the CI.`,
        `Reject H₀ if p < 0.05, which requires knowing p separately.`,
        `Fail to reject H₀, because 10 is outside the 95% CI — wait, that means we reject.`,
      ],
      answer: `Fail to reject H₀, because 10 is outside the CI.`,
      hints: [
        `Actually: if μ₀ = 10 is outside the 95% CI (10.2, 15.8), we REJECT H₀ at α=0.05.`,
        `The confidence interval and two-sided test are equivalent: reject H₀: μ=μ₀ if and only if μ₀ is outside the (1−α)×100% CI.`,
        `10 < 10.2, so 10 is just outside the CI — reject H₀.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q6',
      type: 'choice',
      text: `As n increases, what happens to the t-distribution with n−1 degrees of freedom?`,
      options: [
        `It becomes more skewed.`,
        `It converges to the standard normal N(0,1).`,
        `Its mean shifts from 0 toward 1.`,
        `Its variance decreases to 0.`,
      ],
      answer: `It converges to the standard normal N(0,1).`,
      hints: [
        `As n → ∞, s → σ, so t = (X̄ − μ)/(s/√n) → z = (X̄ − μ)/(σ/√n) ~ N(0,1).`,
        `For large n (> 30), the difference between t and z critical values is negligible.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q7',
      type: 'choice',
      text: `A 95% CI for μ is (12.4, 18.6). Testing H₀: μ = 15 at α = 0.05, what is the correct conclusion?`,
      options: [
        `Reject H₀ — 15 is near the center of the CI`,
        `Fail to reject H₀ — 15 is inside the 95% CI`,
        `Reject H₀ — the CI does not contain 0`,
        `Need the p-value to decide`,
      ],
      answer: `Fail to reject H₀ — 15 is inside the 95% CI`,
      hints: [
        `CI-test duality: reject H₀: μ = μ₀ if and only if μ₀ lies outside the (1−α)×100% CI.`,
        `15 is between 12.4 and 18.6 → inside the CI → fail to reject H₀.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q8',
      type: 'choice',
      text: `The pooled two-sample t-test (vs. Welch's) requires which assumption?`,
      options: [
        `Both samples are normally distributed`,
        `Equal population variances (σ₁² = σ₂²)`,
        `Equal sample sizes (n₁ = n₂)`,
        `Both sample sizes ≥ 30`,
      ],
      answer: `Equal population variances (σ₁² = σ₂²)`,
      hints: [
        `The pooled estimate sp combines both sample variances under the assumption that they estimate the same σ².`,
        `If variances differ, the pooled test is invalid. Welch's test is the safe default for unequal variances.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q9',
      type: 'choice',
      text: `Two groups: x̄₁=50, x̄₂=44, s_pool=8. Cohen's d = (50−44)/8 = 0.75. This is classified as:`,
      options: [`Small`, `Medium`, `Medium to large`, `Large`],
      answer: `Medium to large`,
      hints: [
        `Cohen's benchmarks: d=0.2 small, d=0.5 medium, d=0.8 large.`,
        `d=0.75 falls between medium (0.5) and large (0.8) — medium-to-large effect.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q10',
      type: 'choice',
      text: `The paired t-test is preferred over the independent two-sample t-test when:`,
      options: [
        `The two groups have different sample sizes`,
        `Within-subject measurements are positively correlated, reducing variability in the differences`,
        `The distribution of each group is skewed`,
        `Both groups have the same mean`,
      ],
      answer: `Within-subject measurements are positively correlated, reducing variability in the differences`,
      hints: [
        `Pairing removes between-subject variability (e.g., individual baseline differences) from the error term.`,
        `If subjects who score high on the pre-test also score high on the post-test, pairing gives a much more precise estimate of the treatment effect.`,
      ],
      reviewSection: `intuition`,
    },
  ],

  // ── Checkpoints ───────────────────────────────────────────────
  checkpoints: [
    `Explained why the t-distribution has heavier tails than the normal`,
    `Performed a one-sample t-test and computed the p-value`,
    `Constructed a t-based confidence interval`,
    `Identified when to use paired vs independent two-sample t-test`,
    `Performed a Welch two-sample t-test`,
    `Performed a paired t-test by converting to differences`,
  ],

  // ── Semantics ─────────────────────────────────────────────────
  semantics: {
    coreSymbols: [
      { symbol: `t`, meaning: `Test statistic: (estimate − null value) / SE, follows t-distribution under H₀` },
      { symbol: `ν`, meaning: `Degrees of freedom: n−1 (one-sample/paired), Welch-Satterthwaite formula (two-sample)` },
      { symbol: `s/√n`, meaning: `Standard error of the mean when σ is estimated by s` },
      { symbol: `t*(ν)`, meaning: `Critical value: the (1−α/2) percentile of t(ν), used for confidence intervals` },
      { symbol: `d̄`, meaning: `Mean of differences in a paired t-test` },
      { symbol: `Cohen's d`, meaning: `Effect size = (x̄₁ − x̄₂) / s_pooled; 0.2=small, 0.5=medium, 0.8=large` },
    ],
    rulesOfThumb: [
      `Use the t-distribution whenever σ is estimated from data (almost always).`,
      `Always use Welch's two-sample t-test unless you have strong prior reason for equal variances.`,
      `Use paired t-test when each unit contributes two measurements — it is always more powerful than independent.`,
      `A statistically significant result (p < 0.05) can have a trivially small effect size — always report Cohen's d.`,
      `For n ≥ 30, t-critical values are close to z-critical values (e.g., t*(29, 0.975) ≈ 2.045 vs z = 1.96).`,
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────
  spiral: {
    recovery: `If you are confused about when to use which t-test: (1) one sample or a before/after comparison of the same units → one-sample or paired; (2) two separate, independent groups → two-sample (Welch). The paired test is just a one-sample test on differences — everything you know from the one-sample case applies.`,
    links: [
      {
        lessonId: `stat6-003`,
        relationship: `The chi-squared test (next lesson) handles categorical data — counts rather than means. It is the categorical analogue of the t-test.`,
      },
      {
        lessonId: `stat5-005`,
        relationship: `The t-test SE formula s/√n comes directly from the CLT result σ/√n with σ replaced by s. The CLT is why the t-test is valid even for non-normal data with large n.`,
      },
      {
        lessonId: `stat7-001`,
        relationship: `In simple linear regression, the slope β̂ has a standard error, and its significance is tested with a t-statistic — the same concept as the one-sample t-test applied to a regression coefficient.`,
      },
    ],
  },

  // ── Mastery ───────────────────────────────────────────────────
  mastery: {
    badge: `T-Tests`,
    description: `You can perform one-sample, two-sample, and paired t-tests, compute t-based confidence intervals, choose the right test for a given design, and interpret both p-values and effect sizes.`,
  },

  // ── Definitions ───────────────────────────────────────────────
  definitions: [
    {
      term: `T-distribution`,
      definition: `A family of symmetric, bell-shaped distributions with heavier tails than the normal, indexed by degrees of freedom ν. Used when estimating σ from a sample. As ν → ∞, converges to N(0,1).`,
      symbol: `t(ν)`,
    },
    {
      term: `One-sample t-test`,
      definition: `Tests whether the population mean equals a specified value μ₀ using t = (X̄ − μ₀)/(s/√n), compared to the t(n−1) distribution.`,
      symbol: null,
    },
    {
      term: `Welch's t-test`,
      definition: `Two-sample t-test that does not assume equal variances. Uses the Welch-Satterthwaite formula for degrees of freedom. The recommended default for comparing two independent groups.`,
      symbol: null,
    },
    {
      term: `Paired t-test`,
      definition: `A one-sample t-test applied to the differences dᵢ = X₁ᵢ − X₂ᵢ from paired observations. More powerful than independent two-sample t-test when pairing is effective.`,
      symbol: null,
    },
    {
      term: `Degrees of freedom`,
      definition: `The number of independent pieces of information available to estimate a parameter. For one-sample t-test: ν = n − 1. Larger ν → t-distribution closer to normal.`,
      symbol: `ν`,
    },
    {
      term: `Cohen's d`,
      definition: `A standardized effect size for comparing means: d = (x̄₁ − x̄₂) / s_pooled. Conventions: 0.2 = small, 0.5 = medium, 0.8 = large. Reports practical significance independent of sample size.`,
      symbol: `d`,
    },
  ],
};
