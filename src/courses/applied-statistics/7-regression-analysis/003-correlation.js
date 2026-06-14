export default {
  id: 'stat7-003',
  slug: 'correlation',
  chapter: 'stat7',
  order: 3,
  title: 'Correlation',
  subtitle: 'Measuring the strength and direction of linear association — Pearson r, r², and when correlation lies.',
  tags: ['correlation', 'Pearson r', 'r-squared', 'covariance', 'scatter plot', 'spurious correlation', 'correlation vs causation', 'Spearman rank correlation'],
  aliases: 'correlation Pearson r r squared covariance linear association relationship scatter plot causation',
  timeToComplete: 35,
  coreConcept: `The Pearson correlation coefficient r measures the strength and direction of the linear relationship between two quantitative variables. r ranges from −1 (perfect negative) to +1 (perfect positive), with 0 indicating no linear association. r² is the proportion of variance in y explained by a linear relationship with x — the same R² as in simple linear regression.`,
  prerequisites: ['stat3-002', 'stat7-001'],
  nextLesson: 'stat7-002',

  hook: {
    question: `Countries with more chocolate consumption per capita have more Nobel Prize winners per capita (r ≈ 0.79). Should Switzerland increase chocolate subsidies to win more Nobel Prizes?`,
    realWorldContext: `Correlation is one of the most misunderstood and misused concepts in all of data analysis. Every day, headlines report correlations as if they were causes: "Coffee drinking linked to longevity," "Social media use correlated with depression," "Shoe size predicts reading ability in children." In each case, the correlation is real — but the implied causation is not. Understanding what correlation truly measures, what it cannot tell you, and where it breaks down is essential for reading any scientific study, analyzing any dataset, or making any data-driven decision. The Pearson r is also the foundation of multiple regression, factor analysis, principal components analysis, and virtually every other multivariate statistical method you will encounter in advanced coursework.`,
    previewVisualizationId: 'RegressionScatterViz',
  },

  intuition: {
    prose: [
      `**Roadmap for this lesson.** By the end you will: (1) compute r from raw data using the covariance formula; (2) interpret the sign, magnitude, and r² of a correlation; (3) identify why correlation ≠ causation and name three alternative explanations for correlation; (4) recognize when Pearson r is inappropriate (outliers, non-linear relationships, restricted range); (5) use Spearman rank correlation as a robust alternative.`,

      `**What r actually measures.** Imagine standardizing both x and y: z_x = (x−x̄)/s_x and z_y = (y−ȳ)/s_y. The Pearson r is simply the average product of these standardized values: $r = \\frac{1}{n-1}\\sum z_{x_i} z_{y_i}$. When x and y move together (both above their means or both below), the products $z_x z_y$ are positive and their average is positive, giving r > 0. When they move oppositely, products are negative, giving r < 0. When movement is random, positive and negative products cancel, giving r ≈ 0.`,

      `**Before reading on, predict:** Does r = 0 mean x and y are completely unrelated? Sketch a curve where y = x² — clearly x and y are related, but what is r? Now think about what "linear" in "linear association" really means.`,

      `**r = 0 does NOT mean independent.** For y = x² over symmetric x values like {−2, −1, 0, 1, 2}: $r = 0$ because the relationship is symmetric (values above and below the mean cancel perfectly). But x and y are strongly related — you can perfectly predict y from x. Pearson r only captures LINEAR relationships. A curved relationship can have r = 0. Always plot your data before computing r.`,

      `**The formula and its relationship to regression.** The most common formula is: $r = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i-\\bar{x})^2 \\cdot \\sum(y_i-\\bar{y})^2}}$. The numerator is the sample covariance (times n−1): $\\text{Cov}(x,y) = \\frac{1}{n-1}\\sum(x_i-\\bar{x})(y_i-\\bar{y})$, so $r = \\text{Cov}(x,y)/(s_x s_y)$. The slope of the simple linear regression of y on x is $\\hat{\\beta}_1 = r \\cdot (s_y/s_x)$. The coefficient of determination $R^2 = r^2$ — squaring r gives the proportion of variance in y explained by x.`,

      `**Interpreting r — Cohen's benchmarks.** |r| < 0.1: negligible; |r| = 0.1–0.3: small; |r| = 0.3–0.5: moderate; |r| = 0.5–0.7: large; |r| > 0.7: very large. These are rough guidelines — what counts as a "strong" correlation depends heavily on context. In physics, r < 0.99 might indicate a measurement problem. In psychology, r = 0.30 might be quite meaningful. Always think about the effect size in context, not just the magnitude.`,

      `**Correlation vs. causation — the three alternatives.** When x and y are correlated, there are always at least three explanations besides "x causes y": **(1) Reverse causation** — y causes x (more hospitalizations correlate with more nurses — hospitals hire nurses BECAUSE of patients, not vice versa). **(2) Common cause (confounding)** — a lurking variable z causes both x and y (shoe size and reading ability are correlated in children because BOTH are caused by age). **(3) Chance (sampling variability)** — especially with small samples, spurious correlations arise frequently. The chocolate-Nobel correlation is almost certainly a common cause: wealthier countries both consume more chocolate AND invest more in education and research. Establishing causation requires experimental design (randomization) or causal inference methods — correlation alone never proves causation.`,

      `**When Pearson r breaks down.** Four major failure modes: **(1) Outliers** — a single outlier can change r from +0.9 to +0.1 or −0.1. Always inspect scatter plots. **(2) Nonlinearity** — curved relationships produce misleading r values. **(3) Restricted range** — correlating SAT scores and GPA for students who were already selected for high SAT scores underestimates the true correlation because you have "range restriction." **(4) Non-normality** — Pearson r assumes bivariate normality for exact inference (t-tests on r). For ordinal data or non-normal distributions, use Spearman's rank correlation ρ, which correlates the ranks of x and y rather than the raw values.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Computing Pearson r by Hand',
        body: `**Step 1.** Compute x̄ and ȳ.
**Step 2.** Compute deviations: (x_i − x̄) and (y_i − ȳ).
**Step 3.** Products: (x_i − x̄)(y_i − ȳ) → sum them → numerator.
**Step 4.** Squared deviations: Σ(x_i−x̄)² and Σ(y_i−ȳ)² → multiply and take sqrt → denominator.
**Step 5.** r = numerator / denominator.

**Shortcut:** r = Cov(x,y) / (s_x · s_y). Most calculators and software use this.`,
      },
      {
        type: 'definition',
        title: 'r² — Coefficient of Determination',
        body: `r² is the proportion of variance in y explained by the linear relationship with x:
$$r^2 = 1 - \\frac{\\sum (y_i - \\hat{y}_i)^2}{\\sum (y_i - \\bar{y})^2} = 1 - \\frac{SS_{\\text{res}}}{SS_{\\text{tot}}}$$
If r = 0.7: r² = 0.49, meaning 49% of the variability in y is explained by x. The remaining 51% is unexplained — due to other factors or random noise. r² is identical to the R² from simple linear regression of y on x.`,
      },
      {
        type: 'insight',
        title: 'Testing Whether r Is Significantly Different from Zero',
        body: `The test statistic for H₀: ρ = 0 (population correlation is zero) is:
$$t = r\\sqrt{\\frac{n-2}{1-r^2}} \\sim t(n-2) \\text{ under } H_0$$
For n = 50 and r = 0.30: $t = 0.30\\sqrt{48/(1-0.09)} = 0.30\\sqrt{52.75} \\approx 2.18$, p ≈ 0.034. Even a "weak" correlation (r = 0.30) is statistically significant with enough data. This is why effect size (r or r²) matters more than p-values in large datasets.`,
      },
      {
        type: 'warning',
        title: 'Correlation Is Not Causation',
        body: `This is the most important warning in statistics. Whenever you observe a correlation between x and y, the three alternative explanations are:

1. **Reverse causation:** y causes x, not the other way around.
2. **Common cause:** a third variable z causes both x and y (confounding).
3. **Coincidence:** small samples produce spurious correlations by chance.

The only way to establish causation is through **randomized controlled experiments** (where confounders are balanced by randomization) or advanced **causal inference methods** (directed acyclic graphs, instrumental variables, regression discontinuity).`,
      },
      {
        type: 'insight',
        title: 'Spearman Rank Correlation — When to Use It',
        body: `Spearman's ρ (rho) is computed by replacing each x and y value with its rank, then computing Pearson r on the ranks. Use Spearman when: (1) data are ordinal (survey scales 1-5); (2) the relationship is monotone but not linear; (3) outliers are present; (4) variables are not normally distributed. In Python: \`scipy.stats.spearmanr(x, y)\`. Interpretation is the same as Pearson r: −1 = perfect negative rank association, +1 = perfect positive rank association.`,
      },
    ],
    visualizations: [
      {
        id: 'RegressionScatterViz',
        title: 'Correlation Strength — From Strong to None',
        mathBridge: `Switch between the five relationship presets. "Strong +" shows r ≈ 0.95; "Moderate" shows r ≈ 0.75; "Weak" shows r ≈ 0.50; "No rel." shows r ≈ 0. Watch r² — the proportion of variance explained. "Strong −" shows negative correlation. Hit Resample to see how r varies across samples from the same population — this sampling variability is what drives the significance test.`,
        caption: `The OLS line fits the scatter points to minimize squared residuals. r = ±√R², and the sign matches the slope of the line.`,
      },
    ],
  },

  math: {
    prose: [
      `**Population vs. sample correlation.** The population correlation $\\rho = \\text{Cov}(X,Y)/(\\sigma_X \\sigma_Y)$ is a parameter. The sample estimate is $r = S_{XY}/(S_X S_Y)$ where $S_{XY} = \\frac{1}{n-1}\\sum(x_i-\\bar{x})(y_i-\\bar{y})$. For bivariate normal $(X, Y)$, the sampling distribution of $r$ is complex (non-normal), but Fisher's z-transformation $z = \\tanh^{-1}(r) = \\frac{1}{2}\\ln\\frac{1+r}{1-r}$ is approximately normal with mean $\\tanh^{-1}(\\rho)$ and variance $1/(n-3)$. This is used for CIs: $z \\pm 1.96/\\sqrt{n-3}$, then transform back.`,

      `**Proof that r = cos θ for centered data.** Let $\\mathbf{u} = (x_1-\\bar{x}, \\ldots, x_n-\\bar{x})$ and $\\mathbf{v} = (y_1-\\bar{y}, \\ldots, y_n-\\bar{y})$. Then $r = \\mathbf{u}\\cdot\\mathbf{v}/(\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|) = \\cos\\theta$ where $\\theta$ is the angle between the centered data vectors. This geometric view explains why $|r| \\leq 1$ (by Cauchy-Schwarz) and why $r = \\pm 1$ iff one variable is a perfect linear function of the other (the vectors are parallel or anti-parallel).`,

      `**Partial correlation.** When controlling for a third variable $z$, the **partial correlation** between $x$ and $y$ is $r_{xy.z} = (r_{xy} - r_{xz}r_{yz})/\\sqrt{(1-r_{xz}^2)(1-r_{yz}^2)}$. This is the correlation between $x$ and $y$ after removing the linear effect of $z$ from both. Partial correlations are the foundation of multiple regression: the partial regression coefficient of $x_1$ in $y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2$ reflects the partial correlation between $y$ and $x_1$ after accounting for $x_2$.`,
    ],
    callouts: [],
  },

  examples: [
    {
      id: 'ex1',
      title: 'Example — Computing r by Hand',
      prose: `Five students' study hours (x) and exam scores (y): (2, 62), (3, 67), (5, 79), (7, 88), (8, 91). Find r.`,
      steps: [
        { expression: `\\bar{x} = (2+3+5+7+8)/5 = 25/5 = 5.0, \\quad \\bar{y} = (62+67+79+88+91)/5 = 387/5 = 77.4`, annotation: `Compute means.` },
        { expression: `\\text{Deviations: } (x_i - \\bar{x}): -3, -2, 0, 2, 3`, annotation: `x deviations from mean.` },
        { expression: `(y_i - \\bar{y}): -15.4, -10.4, 1.6, 10.6, 13.6`, annotation: `y deviations from mean.` },
        { expression: `\\sum(x_i-\\bar{x})(y_i-\\bar{y}) = (-3)(-15.4)+(-2)(-10.4)+(0)(1.6)+(2)(10.6)+(3)(13.6) = 46.2+20.8+0+21.2+40.8 = 129.0`, annotation: `Products of deviations.` },
        { expression: `\\sum(x_i-\\bar{x})^2 = 9+4+0+4+9 = 26, \\quad \\sum(y_i-\\bar{y})^2 = 237.16+108.16+2.56+112.36+184.96 = 645.2`, annotation: `Squared deviations.` },
        { expression: `r = 129.0/\\sqrt{26 \\times 645.2} = 129.0/\\sqrt{16775.2} = 129.0/129.52 \\approx 0.996`, annotation: `Very strong positive linear relationship.` },
        { expression: `r^2 \\approx 0.992`, annotation: `99.2% of variance in exam scores is explained by study hours. Virtually perfect linear fit.` },
      ],
    },
  ],

  PythonNotebook: {
    cells: [
      {
        id: 'py1',
        cellTitle: 'Pearson r, Spearman ρ, and Testing Significance',
        prose: `Computing Pearson and Spearman correlations, testing significance, and building confidence intervals using Fisher's z-transformation.`,
        code: `import numpy as np
from scipy import stats

# Study hours and exam scores from the example
x = np.array([2, 3, 5, 7, 8])
y = np.array([62, 67, 79, 88, 91])

# Pearson correlation
r, p_pearson = stats.pearsonr(x, y)
print("=== Pearson Correlation ===")
print(f"r = {r:.4f}")
print(f"r² = {r**2:.4f} ({r**2*100:.1f}% of variance explained)")
print(f"p-value = {p_pearson:.4f}")
print()

# Spearman rank correlation
rho, p_spearman = stats.spearmanr(x, y)
print("=== Spearman Rank Correlation ===")
print(f"ρ = {rho:.4f}")
print(f"p-value = {p_spearman:.4f}")
print()

# Fisher's z confidence interval for Pearson r
n = len(x)
z_r = np.arctanh(r)  # Fisher's z transform
se_z = 1 / np.sqrt(n - 3)
z_crit = 1.96
ci_z = (z_r - z_crit*se_z, z_r + z_crit*se_z)
ci_r = (np.tanh(ci_z[0]), np.tanh(ci_z[1]))
print("=== 95% CI for Pearson r (Fisher's z method) ===")
print(f"r = {r:.4f}, 95% CI: ({ci_r[0]:.4f}, {ci_r[1]:.4f})")
print()

# t-test for H0: rho = 0
t_stat = r * np.sqrt((n-2)/(1-r**2))
print(f"=== Test H0: ρ = 0 ===")
print(f"t = r√((n-2)/(1-r²)) = {t_stat:.4f}")
print(f"df = {n-2}, p = {p_pearson:.4f}")`,
      },
      {
        id: 'py2',
        cellTitle: 'Visualizing Correlation — Scatter Plots and Pitfalls',
        prose: `Demonstrating when Pearson r can mislead: Anscombe's quartet shows four datasets with the same r but wildly different patterns.`,
        code: `import numpy as np
from scipy import stats

# Anscombe's Quartet — four datasets with nearly identical r and regression lines
# but completely different scatter plot patterns

# Dataset I: linear
x1 = np.array([10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5])
y1 = np.array([8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68])

# Dataset II: curved (quadratic) but same r
x2 = np.array([10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5])
y2 = np.array([9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74])

# Dataset III: linear with one outlier
x3 = np.array([10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5])
y3 = np.array([7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73])

# Dataset IV: vertical cluster + one outlier
x4 = np.array([8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8])
y4 = np.array([6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89])

print("=== Anscombe's Quartet — Why You Must Plot Your Data ===")
print(f"{'Dataset':<12} {'r':<10} {'r²':<10} {'Slope':<10} {'Intercept'}")
print("-" * 55)

for label, x, y in [('I (linear)', x1, y1), ('II (curved)', x2, y2),
                     ('III (outlier)', x3, y3), ('IV (cluster)', x4, y4)]:
    r, _ = stats.pearsonr(x, y)
    slope, intercept, _, _, _ = stats.linregress(x, y)
    print(f"{label:<12} {r:< 10.4f} {r**2:< 10.4f} {slope:< 10.4f} {intercept:.4f}")

print()
print("All four datasets have r ≈ 0.816, r² ≈ 0.667, slope ≈ 0.5, intercept ≈ 3.0")
print("Yet the PATTERNS are completely different — only visible in a scatter plot!")
print()
print("Lesson: ALWAYS plot your data. r alone does not describe a relationship.")`,
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: `The Pearson correlation coefficient r = −0.85 indicates:`,
      options: [
        `Strong negative linear association`,
        `Strong positive linear association`,
        `Moderate negative association`,
        `No linear relationship`,
      ],
      answer: `Strong negative linear association`,
      hints: [`|r| = 0.85 is large (> 0.7); the negative sign indicates the variables move in opposite directions.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `r² = 0.64 means:`,
      options: [
        `64% of the variance in y is explained by the linear relationship with x`,
        `r = 0.64`,
        `64% of data points lie on the regression line`,
        `The regression slope is 0.64`,
      ],
      answer: `64% of the variance in y is explained by the linear relationship with x`,
      hints: [`r² is the coefficient of determination: proportion of variance in y accounted for by x.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Variables x and y have r = 0 but a clear curved (U-shaped) relationship. What does this show?`,
      options: [
        `r = 0 does not mean unrelated — Pearson r only measures linear association`,
        `The variables are truly independent`,
        `The data has too many outliers`,
        `More data is needed to find the correlation`,
      ],
      answer: `r = 0 does not mean unrelated — Pearson r only measures linear association`,
      hints: [`y = x² over symmetric x values gives r = 0 despite a perfect deterministic relationship.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Countries with more TV sets per capita have lower infant mortality. The most likely explanation is:`,
      options: [
        `Both are caused by a common factor: national wealth (confounding)`,
        `TV sets protect against infant mortality`,
        `Low infant mortality causes more TV purchases`,
        `This is purely random correlation`,
      ],
      answer: `Both are caused by a common factor: national wealth (confounding)`,
      hints: [`Wealthier countries can afford both TVs and better healthcare — wealth is the lurking variable.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `The formula for testing H₀: ρ = 0 uses which test statistic?`,
      options: [
        `t = r√((n−2)/(1−r²)) with df = n−2`,
        `z = r√n`,
        `F = r²/(1−r²)`,
        `χ² = n·r²`,
      ],
      answer: `t = r√((n−2)/(1−r²)) with df = n−2`,
      hints: [`This t-test for r uses degrees of freedom n−2 (same as in simple linear regression).`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `When should you prefer Spearman's ρ over Pearson's r?`,
      options: [
        `When data is ordinal, has outliers, or the relationship is monotone but not linear`,
        `When sample size is large`,
        `When variables are normally distributed`,
        `When r > 0.5`,
      ],
      answer: `When data is ordinal, has outliers, or the relationship is monotone but not linear`,
      hints: [`Spearman works on ranks — robust to outliers and works for any monotone (not just linear) relationship.`],
      reviewSection: 'intuition',
    },
    {
      type: 'choice',
      question: `Anscombe's quartet demonstrates that:`,
      options: [
        `Four datasets can have identical r yet completely different scatter plot patterns`,
        `r = 0.82 always indicates a strong linear relationship`,
        `Outliers always decrease r`,
        `You should always use Spearman instead of Pearson`,
      ],
      answer: `Four datasets can have identical r yet completely different scatter plot patterns`,
      hints: [`Anscombe's quartet: all four datasets have r ≈ 0.816, same slope and intercept — but plots reveal linear, curved, outlier-driven, and degenerate patterns.`],
      reviewSection: 'examples',
    },
    {
      type: 'choice',
      question: `Fisher's z-transformation is used to:`,
      options: [
        `Compute confidence intervals for Pearson r, since r is not normally distributed`,
        `Convert r to a rank-based correlation`,
        `Test whether r is greater than some non-zero ρ₀`,
        `Both A and C`,
      ],
      answer: `Both A and C`,
      hints: [`z = arctanh(r) is approximately normal with known variance — used for CIs AND testing H₀: ρ = ρ₀ for any ρ₀ (not just 0).`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `If r = 0.4 and n = 200, is the correlation statistically significant at α = 0.05?`,
      options: [
        `Yes — t = 0.4√(198/0.84) ≈ 6.1, which is far above the critical value ≈ 1.97`,
        `No — r = 0.4 is too small to be significant`,
        `Only if the data is bivariate normal`,
        `Cannot tell without the p-value formula`,
      ],
      answer: `Yes — t = 0.4√(198/0.84) ≈ 6.1, which is far above the critical value ≈ 1.97`,
      hints: [`t = r√((n-2)/(1-r²)) = 0.4√(198/0.84) = 0.4√235.7 ≈ 0.4 × 15.4 ≈ 6.1 >> 1.97. Large n makes even modest r highly significant.`],
      reviewSection: 'math',
    },
    {
      type: 'choice',
      question: `"Restricted range" is a problem for correlation because:`,
      options: [
        `Selecting only a narrow range of x values underestimates the true population correlation`,
        `Small samples inflate r`,
        `Outliers at the extremes dominate r`,
        `Skewed distributions increase r`,
      ],
      answer: `Selecting only a narrow range of x values underestimates the true population correlation`,
      hints: [`If you only study students with high SAT scores, the SAT-GPA correlation in your sample will be weaker than in the full population — you've truncated the range of x.`],
      reviewSection: 'intuition',
    },
  ],

  definitions: [
    { term: "Pearson correlation coefficient (r)", definition: "r = Cov(x,y)/(sₓ·sᵧ) = Σ(xᵢ−x̄)(yᵢ−ȳ) / √[Σ(xᵢ−x̄)²·Σ(yᵢ−ȳ)²]. Measures the strength and direction of linear association; ranges from −1 (perfect negative) to +1 (perfect positive). r = 0 does NOT mean independent — it only means no linear association." },
    { term: "covariance", definition: "Cov(x,y) = Σ(xᵢ−x̄)(yᵢ−ȳ) / (n−1). Measures how x and y move together on their original scales. Units are (units of x)×(units of y), making it hard to interpret directly — dividing by sₓ·sᵧ gives the dimensionless r." },
    { term: "coefficient of determination (r²)", definition: "r² = 1 − SSres/SStot = proportion of variance in y explained by the linear relationship with x. Identical to R² in simple linear regression. If r = 0.7, then r² = 0.49 — 49% of y's variability is explained; 51% remains unexplained." },
    { term: "spurious correlation", definition: "A correlation between x and y that is not caused by a direct relationship between them, but by a common third variable (confounder) that causes both, or by chance in small samples. Example: ice cream sales and drowning rates are correlated because both are caused by hot weather (season), not by each other." },
    { term: "Spearman rank correlation (ρ)", definition: "Pearson r applied to the ranks of x and y rather than their raw values. Robust to outliers, works for ordinal data, and captures monotone (not just linear) associations. Use when data are ordinal, heavily skewed, or contain outliers. Computed in Python via scipy.stats.spearmanr(x, y)." },
    { term: "Fisher's z-transformation", definition: "z = arctanh(r) = ½·ln((1+r)/(1−r)). Transforms r (whose sampling distribution is complex and skewed) into a quantity that is approximately normal with mean arctanh(ρ) and variance 1/(n−3). Used to construct confidence intervals for ρ and to test H₀: ρ = ρ₀ for any ρ₀." },
  ],

  checkpoints: [
    { id: 'cp1', label: 'State three alternatives to "x causes y" when r is large', type: 'recall' },
    { id: 'cp2', label: 'Compute r by hand for the five-point study hours example', type: 'example' },
    { id: 'cp3', label: 'Run Python Cell 1: Pearson r, Spearman ρ, CI, and significance test', type: 'lab' },
    { id: 'cp4', label: 'Run Python Cell 2: Anscombe\'s quartet — see why plotting matters', type: 'lab' },
    { id: 'cp5', label: 'Pass the quiz with ≥ 80%', type: 'quiz' },
  ],
}
