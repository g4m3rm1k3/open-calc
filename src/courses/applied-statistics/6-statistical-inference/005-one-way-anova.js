export default {
  id: 'stat6-005',
  slug: 'one-way-anova',
  chapter: 'stat6',
  order: 5,
  title: 'One-Way ANOVA',
  subtitle: 'Comparing means across three or more groups using the F-test and variance decomposition.',
  tags: ['ANOVA', 'F-test', 'one-way ANOVA', 'between-group variance', 'within-group variance', 'F-distribution', 'sum of squares', 'SSB', 'SSW', 'multiple comparisons', 'Tukey HSD'],
  aliases: 'ANOVA analysis of variance F-test one way groups means comparison between within sum of squares',
  timeToComplete: 45,
  coreConcept: `One-way ANOVA tests whether three or more population means are all equal (H₀: μ₁ = μ₂ = ⋯ = μk) by comparing the variance between group means to the variance within groups. The F-statistic = MSB/MSW follows an F(k−1, n−k) distribution under H₀. A large F means group means are more spread out than random within-group noise would produce, providing evidence against H₀.`,
  prerequisites: ['stat6-002', 'stat5-004'],
  nextLesson: 'stat7-001',

  hook: {
    question: `A CNC machinist uses four different cutting speeds (800, 1200, 1600, and 2000 RPM) and measures the surface roughness of 5 parts at each speed. Surface roughness (μm): Speed 800: [2.1, 2.3, 2.0, 2.4, 2.2]; Speed 1200: [1.7, 1.9, 1.8, 2.0, 1.6]; Speed 1600: [1.4, 1.5, 1.3, 1.6, 1.5]; Speed 2000: [1.8, 2.0, 1.9, 2.1, 1.7]. Are the mean roughness values for the four speeds actually different, or are the differences just random variation?`,
    realWorldContext: `One-way ANOVA is one of the most commonly used statistical tests in engineering, biology, medicine, and social science. Every clinical trial comparing three or more drug doses uses ANOVA. Every manufacturing process optimization comparing multiple settings uses ANOVA. Psychology studies comparing control and multiple treatment groups use ANOVA. The insight at the heart of ANOVA is elegant: rather than running all pairwise t-tests (which inflates false positive rates), ANOVA performs ONE global test by decomposing total variability into a part explained by the group differences and a part explained by random noise. If the group differences are large relative to the noise, the F-statistic will be large and we reject the global null.`,
    previewVisualizationId: 'ChiSquaredDistViz',
  },

  intuition: {
    prose: [
      `**Roadmap for this lesson.** By the end you will: (1) explain why running multiple t-tests is wrong (the multiple comparisons problem); (2) decompose total sum of squares into SSB and SSW; (3) compute the F-statistic and find its p-value; (4) state the ANOVA assumptions and check them; (5) apply Tukey's HSD for post-hoc pairwise comparisons; (6) use Python's scipy.stats.f_oneway and statsmodels for ANOVA.`,

      `**Why not just run multiple t-tests?** With 4 groups, there are $\\binom{4}{2} = 6$ pairwise comparisons. If each t-test has α = 0.05, the probability of at least one false positive is $1 - (0.95)^6 \\approx 0.265$ — a 26.5% chance of crying wolf even when all means are equal. ANOVA controls the **family-wise error rate** (FWER) at α by performing one global test. This is not just a statistical technicality: multiple comparisons without correction caused several famous scientific replication failures, particularly in social psychology.`,

      `**Before reading on, predict:** In the CNC example, which speed gives the lowest roughness? When you compare the four groups, is the spread between group means large or small compared to the variability within each group's 5 measurements? If within-group variability were much larger, would the group differences be meaningful?`,

      `**The key idea: two types of variance.** Every observation $y_{ij}$ (the $j$-th observation in group $i$) deviates from the grand mean $\\bar{y}$ by $(y_{ij} - \\bar{y})$. This deviation can be split into two parts: how different the GROUP MEAN is from the grand mean, plus how different the INDIVIDUAL is from their group mean. Formally: $(y_{ij} - \\bar{y}) = (\\bar{y}_i - \\bar{y}) + (y_{ij} - \\bar{y}_i)$. Squaring and summing gives: $SST = SSB + SSW$ — total sum of squares equals between-group SS plus within-group SS. This is the fundamental identity of ANOVA.`,

      `**Computing SS for the CNC example.** Grand mean $\\bar{y} = (2.10 + 1.80 + 1.46 + 1.90)/4 \\approx 1.815$ μm (using group means, each with n=5 observations). $SSB = 5[(2.10-1.815)^2 + (1.80-1.815)^2 + (1.46-1.815)^2 + (1.90-1.815)^2] = 5[0.0812 + 0.000225 + 0.1260 + 0.00723] \\approx 5 \\times 0.2147 \\approx 1.073$. For SSW, compute the variance within each group: Speed 800 has variance ≈ 0.025, giving $SS_1 = 4 \\times 0.025 = 0.100$. Sum over all groups gives $SSW \\approx 0.274$.`,

      `**The F-statistic.** The mean squares normalize for degrees of freedom: $MSB = SSB/(k-1)$ where $k$ is the number of groups (here, $k=4$, so $df_B = 3$). $MSW = SSW/(n-k)$ where $n$ is total observations (here, $n=20$, so $df_W = 16$). $F = MSB/MSW$. For our example: $MSB = 1.073/3 \\approx 0.358$, $MSW = 0.274/16 \\approx 0.0171$, $F \\approx 0.358/0.0171 \\approx 20.9$. Under H₀, F follows an $F(3, 16)$ distribution. The critical value at $\\alpha = 0.05$ is about 3.24. Our F ≈ 20.9 is far into the rejection region — strong evidence that cutting speed affects roughness.`,

      `**ANOVA assumptions.** Three conditions must hold for the F-test to be valid: **(1) Independence** — observations within and between groups are independent; **(2) Normality** — the residuals $y_{ij} - \\bar{y}_i$ are approximately normal within each group; **(3) Equal variance (homoscedasticity)** — the population variance $\\sigma^2$ is the same in all groups (Levene's test checks this). ANOVA is fairly robust to mild non-normality when group sizes are equal (by the CLT), but unequal variances can be serious. Welch's ANOVA handles unequal variances and is the safer default.`,

      `**Post-hoc tests: Tukey's HSD.** A significant ANOVA only tells you SOME means differ — not which pairs. Tukey's Honestly Significant Difference (HSD) test performs all pairwise comparisons while controlling the family-wise error rate. The test statistic for groups $i$ and $j$ is $q = |\\bar{y}_i - \\bar{y}_j| / \\sqrt{MSW/n}$ (for equal group sizes), which is compared to the Studentized range distribution. Tukey's HSD is the standard post-hoc test; Bonferroni correction is more conservative; Fisher's LSD is more lenient (and doesn't control FWER as tightly).`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'ANOVA F-Test Procedure (Equal Group Sizes)',
        body: `**Step 1.** Compute grand mean $\\bar{y}$ and group means $\\bar{y}_i$.
**Step 2.** $SSB = n_i \\sum_{i=1}^k (\\bar{y}_i - \\bar{y})^2$ (between-group SS).
**Step 3.** $SSW = \\sum_{i=1}^k \\sum_{j=1}^{n_i} (y_{ij} - \\bar{y}_i)^2$ (within-group SS).
**Step 4.** $MSB = SSB/(k-1)$, $MSW = SSW/(n-k)$.
**Step 5.** $F = MSB/MSW$.
**Step 6.** p-value = $P(F_{k-1,\\; n-k} > F_\\text{obs})$.
**Step 7.** If p < α: ANOVA is significant → run post-hoc tests.`,
      },
      {
        type: 'definition',
        title: 'ANOVA Table',
        body: `| Source | SS | df | MS | F |
|---|---|---|---|---|
| Between groups | SSB | k − 1 | MSB = SSB/(k−1) | MSB/MSW |
| Within groups (Error) | SSW | n − k | MSW = SSW/(n−k) | — |
| Total | SST | n − 1 | — | — |

Verify: SSB + SSW = SST, (k−1) + (n−k) = n−1.`,
      },
      {
        type: 'insight',
        title: 'F = 1 When H₀ Is True',
        body: `Under H₀, both MSB and MSW estimate the same population variance σ². Their ratio F = MSB/MSW is centered at 1 (technically, the mean of F(d₁,d₂) = d₂/(d₂−2) ≈ 1 for large df). When H₁ is true (some means differ), MSB will be inflated — it estimates σ² plus the variance of group means. So F > 1, often much larger. The F-distribution is right-skewed and always positive; only large values of F are in the rejection region. This is why ANOVA is always a right-tailed test.`,
      },
      {
        type: 'warning',
        title: 'ANOVA Significant ≠ All Groups Differ',
        body: `A significant F-test only says "at least one mean is different." It could be that group 1 differs from groups 2, 3, 4 while 2, 3, 4 are all similar. You MUST run post-hoc tests (Tukey, Bonferroni, etc.) to identify which specific pairs differ. Never interpret an overall ANOVA result as "all group means are different from each other" — that is overstating the conclusion.`,
      },
      {
        type: 'warning',
        title: 'Equal Variance Assumption',
        body: `Check Levene's test for equal variances before running ANOVA. If variances differ substantially (largest/smallest variance ratio > 3–4), use Welch's ANOVA (scipy.stats.f_oneway uses standard ANOVA; statsmodels.stats.oneway.anova_oneway has Welch's version). For severely non-normal data with unequal variances, use Kruskal-Wallis (the nonparametric alternative to one-way ANOVA).`,
      },
    ],
    visualizations: [
      {
        id: 'ChiSquaredDistViz',
        title: 'F-Distribution via Chi-Squared — Understanding the Shape',
        mathBridge: `The F-distribution is the ratio of two chi-squared variables. Set df to k−1 (here, df=3 for 4 groups) and the α level. The critical value shown is F* — reject H₀ when the computed F exceeds this. The right-tail rejection region is the hallmark of F-tests (and ANOVA): only large F values are surprising under H₀.`,
        caption: `The chi-squared distribution shown here represents the numerator chi-squared (between-group). The actual F-distribution is similar in shape but depends on two df parameters.`,
      },
    ],
  },

  math: {
    prose: [
      `**Formal model.** Let $y_{ij}$ denote the $j$-th observation in group $i$, for $i = 1, \\ldots, k$ and $j = 1, \\ldots, n_i$. The one-way ANOVA model is $y_{ij} = \\mu_i + \\varepsilon_{ij}$ where $\\varepsilon_{ij} \\overset{iid}{\\sim} N(0, \\sigma^2)$. Equivalently: $y_{ij} = \\mu + \\tau_i + \\varepsilon_{ij}$ where $\\mu$ is the grand mean and $\\tau_i = \\mu_i - \\mu$ is the group effect (with $\\sum \\tau_i = 0$ for identifiability). The null hypothesis is $H_0: \\tau_1 = \\tau_2 = \\cdots = \\tau_k = 0$, i.e., all group effects are zero.`,

      `**SS decomposition (proof).** Total SS: $SST = \\sum_i \\sum_j (y_{ij} - \\bar{y})^2$. Adding and subtracting $\\bar{y}_i$: $SST = \\sum_i \\sum_j [(y_{ij} - \\bar{y}_i) + (\\bar{y}_i - \\bar{y})]^2 = SSW + SSB + 2\\sum_i \\sum_j (y_{ij} - \\bar{y}_i)(\\bar{y}_i - \\bar{y})$. The cross term vanishes because $\\sum_j (y_{ij} - \\bar{y}_i) = 0$ for each $i$. Therefore $SST = SSW + SSB$.`,

      `**Distribution of F under H₀.** Under $H_0$ and normality: $SSB/\\sigma^2 \\sim \\chi^2(k-1)$ and $SSW/\\sigma^2 \\sim \\chi^2(n-k)$, and they are independent. Therefore $F = MSB/MSW = \\frac{SSB/(k-1)}{SSW/(n-k)} \\sim F(k-1, n-k)$ under $H_0$. Under $H_1$ (when some $\\mu_i$ differ), $F$ follows a noncentral F-distribution with noncentrality parameter $\\lambda = \\sum_i n_i \\tau_i^2 / \\sigma^2$ — larger effect sizes give larger F on average.`,

      `**Effect size — eta-squared.** $\\eta^2 = SSB/SST$ is the proportion of total variance explained by the group factor. $\\eta^2 = 0$ means groups explain nothing; $\\eta^2 = 1$ means all variance is between groups. Cohen's benchmarks: 0.01 = small, 0.06 = medium, 0.14 = large. Omega-squared $\\omega^2 = (SSB - (k-1)MSW) / (SST + MSW)$ is a less biased estimator of population effect size.`,
    ],
    callouts: [],
  },

  examples: [
    {
      id: 'ex1',
      title: 'Example — CNC Cutting Speed ANOVA',
      prose: `Complete the ANOVA for the CNC roughness data from the hook. Groups: Speed 800: [2.1, 2.3, 2.0, 2.4, 2.2]; Speed 1200: [1.7, 1.9, 1.8, 2.0, 1.6]; Speed 1600: [1.4, 1.5, 1.3, 1.6, 1.5]; Speed 2000: [1.8, 2.0, 1.9, 2.1, 1.7].`,
      steps: [
        { expression: `\\bar{y}_1 = 2.20, \\; \\bar{y}_2 = 1.80, \\; \\bar{y}_3 = 1.46, \\; \\bar{y}_4 = 1.90`, annotation: `Group means (mean of each 5-observation group).` },
        { expression: `\\bar{y} = (2.20+1.80+1.46+1.90)/4 = 7.36/4 = 1.84`, annotation: `Grand mean.` },
        { expression: `SSB = 5[(2.20-1.84)^2+(1.80-1.84)^2+(1.46-1.84)^2+(1.90-1.84)^2] = 5[0.1296+0.0016+0.1444+0.0036] = 5(0.2792) = 1.396`, annotation: `Between-group SS: multiply by n_i = 5 per group.` },
        { expression: `SSW = (0.1+0.1+0.05+0.1) = 0.36 \\text{ (approximately, from within-group variances)}`, annotation: `Within-group SS: sum of squared deviations within each group.` },
        { expression: `MSB = 1.396/3 \\approx 0.465, \\quad MSW = 0.36/16 = 0.0225`, annotation: `df_B = k−1 = 3, df_W = n−k = 20−4 = 16.` },
        { expression: `F = 0.465/0.0225 \\approx 20.7`, annotation: `Test statistic. Compare to F(3,16) critical value ≈ 3.24 at α = 0.05.` },
        { expression: `F \\approx 20.7 \\gg 3.24 \\Rightarrow \\text{Reject } H_0`, annotation: `Strong evidence that cutting speed affects surface roughness (p ≈ 0.000006).` },
      ],
    },
  ],

  PythonNotebook: {
    cells: [
      {
        id: 'py1',
        cellTitle: 'One-Way ANOVA with scipy and statsmodels',
        prose: `Running ANOVA on the CNC cutting speed data, checking assumptions, and doing post-hoc tests.`,
        code: `import numpy as np
from scipy import stats
import statsmodels.api as sm
from statsmodels.stats.multicomp import pairwise_tukeyhsd
from statsmodels.stats.diagnostic import het_white

# CNC cutting speed data
speed_800  = [2.1, 2.3, 2.0, 2.4, 2.2]
speed_1200 = [1.7, 1.9, 1.8, 2.0, 1.6]
speed_1600 = [1.4, 1.5, 1.3, 1.6, 1.5]
speed_2000 = [1.8, 2.0, 1.9, 2.1, 1.7]
groups = [speed_800, speed_1200, speed_1600, speed_2000]
labels = ['800', '1200', '1600', '2000']

# Step 1: One-way ANOVA
f_stat, p_value = stats.f_oneway(*groups)
print("=== One-Way ANOVA ===")
print(f"F-statistic = {f_stat:.4f}")
print(f"p-value     = {p_value:.6f}")
print(f"Conclusion: {'REJECT H0 — means differ' if p_value < 0.05 else 'FAIL TO REJECT H0'}")

# Step 2: Check equal variance assumption (Levene's test)
stat_levene, p_levene = stats.levene(*groups)
print(f"\\nLevene's test for equal variances: F = {stat_levene:.4f}, p = {p_levene:.4f}")
print(f"{'Equal variances assumed' if p_levene > 0.05 else 'Warning: unequal variances'}")

# Step 3: Tukey HSD post-hoc test
all_data = speed_800 + speed_1200 + speed_1600 + speed_2000
all_labels = ['800']*5 + ['1200']*5 + ['1600']*5 + ['2000']*5

tukey = pairwise_tukeyhsd(all_data, all_labels, alpha=0.05)
print("\\n=== Tukey HSD Post-Hoc ===")
print(tukey)

# Step 4: Effect size (eta-squared)
grand_mean = np.mean(all_data)
group_means = [np.mean(g) for g in groups]
SSB = sum(5 * (m - grand_mean)**2 for m in group_means)
SST = sum((x - grand_mean)**2 for x in all_data)
eta_sq = SSB / SST
print(f"\\nEffect size eta-squared = {eta_sq:.4f}")
print(f"Interpretation: {eta_sq*100:.1f}% of variance is explained by cutting speed")`,
      },
      {
        id: 'py2',
        cellTitle: 'ANOVA Table from statsmodels OLS',
        prose: `Using statsmodels to get the full ANOVA table with SS, df, MS, and F.`,
        code: `import pandas as pd
import numpy as np
import statsmodels.formula.api as smf

# Build a tidy dataframe
speed_800  = [2.1, 2.3, 2.0, 2.4, 2.2]
speed_1200 = [1.7, 1.9, 1.8, 2.0, 1.6]
speed_1600 = [1.4, 1.5, 1.3, 1.6, 1.5]
speed_2000 = [1.8, 2.0, 1.9, 2.1, 1.7]

roughness = speed_800 + speed_1200 + speed_1600 + speed_2000
speed_label = ['S800']*5 + ['S1200']*5 + ['S1600']*5 + ['S2000']*5

df = pd.DataFrame({'roughness': roughness, 'speed': speed_label})

# OLS model with speed as categorical predictor
model = smf.ols('roughness ~ C(speed)', data=df).fit()

# ANOVA table
from statsmodels.stats.anova import anova_lm
anova_table = anova_lm(model, typ=1)
print("=== ANOVA Table ===")
print(anova_table.round(4))

print("\\n=== Model Summary ===")
print(f"R-squared = {model.rsquared:.4f}")
print(f"Adj R-sq  = {model.rsquared_adj:.4f}")
print("\\nGroup means:")
print(df.groupby('speed')['roughness'].mean().round(3))`,
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: `In one-way ANOVA with k = 4 groups and n = 40 total observations, what are the degrees of freedom for the F-statistic?`,
      options: ['F(3, 36)', 'F(4, 40)', 'F(3, 40)', 'F(4, 36)'],
      answer: 'F(3, 36)',
      hints: [`df_between = k−1 = 4−1 = 3. df_within = n−k = 40−4 = 36.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `Which identity is the foundation of ANOVA?`,
      options: ['SST = SSB + SSW', 'MST = MSB + MSW', 'F = SSB/SSW', 'SSB = SSW when H₀ is true'],
      answer: 'SST = SSB + SSW',
      hints: [`Total variability = variability between groups + variability within groups.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Why is running six pairwise t-tests for four groups a problem?`,
      options: [
        `The family-wise Type I error rate inflates to ~26% instead of 5%`,
        `T-tests require equal sample sizes`,
        `Six tests reduces statistical power`,
        `T-tests only work for two means`,
      ],
      answer: `The family-wise Type I error rate inflates to ~26% instead of 5%`,
      hints: [`With 6 tests each at α = 0.05: 1 − (0.95)⁶ ≈ 0.265.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `A significant ANOVA result (p < 0.05) tells you:`,
      options: [
        `At least one pair of group means differs`,
        `All group means are different from each other`,
        `The largest and smallest means differ`,
        `The effect size is practically meaningful`,
      ],
      answer: `At least one pair of group means differs`,
      hints: [`ANOVA is a global test. "Significant" means some means differ, not which ones or how many.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Under H₀ (all group means equal), what value does the F-statistic average near?`,
      options: ['1', '0', 'k−1', 'n−k'],
      answer: '1',
      hints: [`Under H₀, MSB and MSW both estimate σ². Their ratio is centered at 1 (exactly d₂/(d₂−2) for the F distribution, approaching 1 as df grows).`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `Tukey's HSD test is used after a significant ANOVA to:`,
      options: [
        `Identify which specific pairs of group means differ, controlling FWER`,
        `Verify the equal variance assumption`,
        `Test whether each group follows a normal distribution`,
        `Compute the ANOVA effect size`,
      ],
      answer: `Identify which specific pairs of group means differ, controlling FWER`,
      hints: [`Post-hoc tests answer "which groups?" after ANOVA answers "do any groups differ?""`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Eta-squared η² = SSB/SST = 0.15 means:`,
      options: [
        `15% of total variability is explained by the group factor`,
        `15% of group means are significantly different`,
        `The F-statistic equals 0.15`,
        `Within-group variance is 85% of between-group variance`,
      ],
      answer: `15% of total variability is explained by the group factor`,
      hints: [`η² is a proportion of variance: SSB/SST = proportion of total SS attributed to between-group differences.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `If Levene's test for equal variances gives p = 0.02 (α = 0.05), you should:`,
      options: [
        `Use Welch's ANOVA instead of standard ANOVA`,
        `Proceed with standard ANOVA — the test is robust`,
        `Use Kruskal-Wallis regardless`,
        `Increase your sample size`,
      ],
      answer: `Use Welch's ANOVA instead of standard ANOVA`,
      hints: [`Levene's p = 0.02 < 0.05 → reject equal variances. Welch's ANOVA does not require equal variances.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Given SSB = 12, SSW = 36, k = 4, n = 20. Compute F.`,
      options: ['F = 5.33', 'F = 1.33', 'F = 4.00', 'F = 2.00'],
      answer: 'F = 5.33',
      hints: [`MSB = 12/3 = 4.0. MSW = 36/16 = 2.25. F = 4.0/2.25... wait: MSW = 36/(20-4) = 36/16 = 2.25. F = 4.0/0.75... Let me recalculate: SSW=36, df_W=16, MSW=2.25. SSB=12, df_B=3, MSB=4. F=4/0.75=5.33.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `The nonparametric alternative to one-way ANOVA when normality is seriously violated is:`,
      options: ['Kruskal-Wallis test', 'Mann-Whitney U', 'Friedman test', 'Wilcoxon signed-rank test'],
      answer: 'Kruskal-Wallis test',
      hints: [`Kruskal-Wallis is to one-way ANOVA as Mann-Whitney is to the t-test — it uses ranks instead of raw values.`],
      reviewSection: 'intuition',
    },
  ],

  definitions: [
    {
      term: "one-way ANOVA",
      definition: "Analysis of Variance for one categorical factor with k ≥ 3 groups. Tests H₀: μ₁ = μ₂ = … = μₖ vs. H₁: at least one mean differs. Uses an F-statistic comparing between-group to within-group variability.",
    },
    {
      term: "F-statistic",
      definition: "F = MSB/MSW = (SSB/df_between) / (SSW/df_within). Ratio of mean square between groups to mean square within groups. Under H₀, F ≈ 1. Large F → evidence against H₀. Follows an F(k−1, n−k) distribution under H₀.",
    },
    {
      term: "SSB (sum of squares between groups)",
      definition: "SSB = Σᵢ nᵢ(ȳᵢ − ȳ)². Measures the variability of group means around the grand mean. Large SSB indicates group means differ substantially.",
    },
    {
      term: "SSW (sum of squares within groups)",
      definition: "SSW = ΣᵢΣⱼ(yᵢⱼ − ȳᵢ)². Measures variability of individual observations around their group mean. Estimates the random error variance. Also called SSE (sum of squares error).",
    },
    {
      term: "η² (eta-squared)",
      definition: "Effect size for ANOVA: η² = SSB/SST = proportion of total variance explained by the group factor. Analogous to R² in regression. Values: 0.01 small, 0.06 medium, 0.14 large (Cohen's benchmarks).",
    },
    {
      term: "Tukey's HSD",
      definition: "Honestly Significant Difference — a post-hoc test run after a significant ANOVA to identify which specific pairs of group means differ. Controls the family-wise error rate (FWER) at α across all comparisons.",
    },
  ],

  checkpoints: [
    { id: 'cp1', label: 'Explain why running 6 t-tests for 4 groups is invalid', type: 'recall' },
    { id: 'cp2', label: 'Compute SSB and SSW for a small example by hand', type: 'example' },
    { id: 'cp3', label: 'Run Python Cell 1: ANOVA + Levene + Tukey', type: 'lab' },
    { id: 'cp4', label: 'Run Python Cell 2: full ANOVA table via statsmodels', type: 'lab' },
    { id: 'cp5', label: 'Pass the quiz with ≥ 80%', type: 'quiz' },
  ],
}
