export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'stat6-003',
  slug: 'chi-squared-tests',
  chapter: 'stat6',
  order: 3,
  title: 'Chi-Squared Tests',
  subtitle: 'Testing hypotheses about categorical data — goodness-of-fit and independence.',
  tags: ['chi-squared', 'chi-squared test', 'goodness of fit', 'independence', 'contingency table', 'expected frequency', 'observed frequency', 'categorical data'],
  aliases: 'chi squared chi-square goodness of fit independence contingency table categorical data observed expected frequency Pearson chi-square test',
  timeToComplete: 40,
  coreConcept: 'Chi-squared tests analyze categorical data by comparing observed counts to expected counts. The goodness-of-fit test checks whether observed category frequencies match a hypothesized distribution. The test of independence checks whether two categorical variables are related. Both use χ² = Σ(O−E)²/E, which follows a chi-squared distribution under H₀. Unlike t-tests, chi-squared tests require counts, not means — they are the tool for categorical outcomes.',
  prerequisites: ['stat6-001', 'stat4-001'],
  nextLesson: 'stat7-001',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: `A genetics experiment crosses two pea plants and produces 315 round-yellow, 108 round-green, 101 wrinkled-yellow, and 32 wrinkled-green offspring. Mendel's laws predict a 9:3:3:1 ratio. The observed counts are close to this ratio but not exact. How do we decide whether the deviation is just sampling noise — or evidence against Mendel's model?`,
    realWorldContext: `Chi-squared tests are the workhorse tool for analyzing categorical data across virtually every field. In medicine, a chi-squared test of independence answers: "Is treatment type (drug A vs drug B) related to patient outcome (recovered vs not recovered)?" In marketing, it asks: "Does the click-through rate differ across ad designs?" In genetics, the goodness-of-fit test checks whether observed allele frequencies match Mendelian prediction. In public health, it examines whether smoking status is independent of disease incidence. In computer science, it tests whether a random number generator produces each digit with equal frequency. Whenever your outcome variable is categorical — a label, a group, a count in a table cell — the chi-squared test is usually the first tool to reach for. Karl Pearson developed the test in 1900, making it one of the oldest formal statistical tests still in wide use today.`,
    previewVisualizationId: 'ChiSquaredDistViz',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      `**Roadmap for this lesson.** By the end you will: (1) describe what a chi-squared distribution is and how its shape depends on degrees of freedom; (2) perform a goodness-of-fit test step by step; (3) set up a contingency table and perform a test of independence; (4) compute the chi-squared statistic manually and verify with Python/MATLAB; (5) know when the chi-squared test is valid (expected cell counts ≥ 5) and what to do when it is not.`,

      `**The core intuition: comparing observed vs expected.** All chi-squared tests share one logic: compare what you observed to what you would expect under the null hypothesis. If the discrepancies are large, the null is implausible. If they are small (easily explainable by sampling variability), the null is plausible. The chi-squared statistic $\\chi^2 = \\sum \\frac{(O-E)^2}{E}$ formalizes this: it takes each cell's discrepancy $(O-E)$, squares it (to make it positive), and divides by $E$ (to normalize by scale). A discrepancy of 5 in a cell with expected count 10 is much more surprising than the same discrepancy in a cell with expected count 1000.`,

      `**Before reading on, predict:** Suppose you roll a die 60 times and get counts [8, 11, 9, 12, 10, 10] for faces 1 through 6. Does this look like a fair die? Now suppose you got [20, 5, 8, 9, 10, 8]. Which is more surprising? Write down your intuition about what "too far from expected" means before seeing the formula.`,

      `**The chi-squared distribution.** When you compute $\\chi^2 = \\sum (O_i - E_i)^2/E_i$ on count data where H₀ is true, the result approximately follows a chi-squared distribution with k−1 degrees of freedom (for goodness-of-fit with k categories) or (r−1)(c−1) degrees of freedom (for an r×c contingency table). The chi-squared distribution is right-skewed, always non-negative, and indexed by its degrees of freedom ν. As ν increases, it becomes more symmetric and bell-shaped (it is the distribution of the sum of ν squared standard normals).`,

      `**Goodness-of-fit test: does the data match a model?** Given a sample of n observations in k categories with observed counts O₁,...,Oₖ, and a null hypothesis specifying probabilities p₁,...,pₖ (with Σpᵢ = 1), the expected counts are Eᵢ = n×pᵢ. The test statistic χ² = Σ(Oᵢ−Eᵢ)²/Eᵢ is compared to χ²(k−1). Reject H₀ if χ² > critical value or if p-value < α. The degrees of freedom are k−1 because the observed counts must sum to n, leaving k−1 free.`,

      `**Test of independence: are two categorical variables related?** Given a two-way table with r rows (one categorical variable) and c columns (another categorical variable), H₀ states the two variables are independent. Under independence: expected count for cell (i,j) = (row i total × column j total) / grand total = Rᵢ × Cⱼ / n. The chi-squared statistic sums (O−E)²/E over all r×c cells and is compared to χ²((r−1)(c−1)). Larger tables lose more degrees of freedom because more row/column marginals are fixed.`,

      `**Effect size: Cramér's V.** A significant chi-squared test tells you an association exists, but not how strong it is. Cramér's V = √(χ²/(n × min(r−1, c−1))) ∈ [0,1], where 0 = no association and 1 = perfect association. Just like Cohen's d for t-tests, Cramér's V separates statistical significance from practical importance. Conventions: 0.1 = small, 0.3 = medium, 0.5 = large.`,

      `**When chi-squared tests can fail.** The chi-squared approximation is unreliable when expected cell counts are small (rule of thumb: all Eᵢ ≥ 5). For 2×2 tables with small expected counts, use Fisher's exact test. For goodness-of-fit with small expected counts, combine rare categories. The chi-squared test is also one-sided (always tests whether χ² is too large) — unlike the t-test, you never test whether χ² is too small (that would mean data fits too perfectly, suggesting data fabrication, but that is a different test).`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Chi-Squared Distribution',
        body: `The chi-squared distribution with ν degrees of freedom is the distribution of $Z_1^2 + Z_2^2 + \\cdots + Z_\\nu^2$ where each $Z_i \\sim N(0,1)$ independently.\n\nProperties:\n• Mean = ν, Variance = 2ν\n• Right-skewed, especially for small ν; approaches normal for large ν\n• Always ≥ 0\n• PDF: $f(x) = x^{\\nu/2-1}e^{-x/2}/(2^{\\nu/2}\\Gamma(\\nu/2))$ for $x > 0$\n\nIn Python: scipy.stats.chi2(df=ν). In MATLAB: chi2cdf, chi2inv.`,
      },
      {
        type: 'procedure',
        title: 'Chi-Squared Goodness-of-Fit: Step by Step',
        body: `**Given:** n observations, k categories, observed counts O₁,...,Oₖ, null proportions p₁,...,pₖ.\n\n1. Compute expected counts: Eᵢ = n × pᵢ\n2. Check validity: all Eᵢ ≥ 5 (combine categories if needed)\n3. Compute: χ² = Σ (Oᵢ − Eᵢ)² / Eᵢ\n4. Degrees of freedom: ν = k − 1\n5. p-value = P(χ²(ν) ≥ χ²_obs)\n6. Reject H₀ if p < α\n\n**Note:** If null proportions were estimated from the data (k parameters estimated), subtract k−1 more from the df.`,
      },
      {
        type: 'procedure',
        title: 'Chi-Squared Independence Test: Step by Step',
        body: `**Given:** An r × c contingency table with row totals Rᵢ, column totals Cⱼ, grand total n.\n\n1. Expected count for cell (i,j): Eᵢⱼ = Rᵢ × Cⱼ / n\n2. Check: all Eᵢⱼ ≥ 5\n3. Compute: χ² = ΣΣ (Oᵢⱼ − Eᵢⱼ)² / Eᵢⱼ (sum over all cells)\n4. Degrees of freedom: ν = (r−1)(c−1)\n5. p-value = P(χ²(ν) ≥ χ²_obs)\n6. Effect size: Cramér's V = √(χ² / (n × min(r−1, c−1)))`,
      },
      {
        type: 'warning',
        title: 'Expected Count Rule and Fisher\'s Exact Test',
        body: `The chi-squared approximation requires **all expected cell counts ≥ 5**. This is often violated with:\n• Small total sample sizes\n• Many categories (rare events in some cells)\n• Unequal category sizes\n\n**If violated:**\n• For 2×2 tables: use Fisher's exact test (exact p-value, no approximation)\n• For larger tables: combine rare categories until all Eᵢⱼ ≥ 5\n• For goodness-of-fit: use Monte Carlo simulation of the null distribution\n\nViolating this rule makes the test anti-conservative (p-values too small, too many false rejections).`,
      },
    ],
    visualizations: [
      {
        id: 'ChiSquaredDistViz',
        title: 'Chi-Squared Distribution — Critical Values and Rejection Region',
        mathBridge: `Drag df to match your contingency table's degrees of freedom (rows−1)(cols−1). Use the α dropdown to set the significance level. The purple curve is the χ²(df) distribution; the red shaded region is the rejection region. The critical value χ²* marks the boundary — any test statistic to its right leads to rejecting H₀ of independence.`,
        caption: `The chi-squared distribution is always right-skewed and always positive — because the test statistic χ² = Σ(O−E)²/E is a sum of squares and can only be zero or positive.`,
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────
  math: {
    prose: [
      `**Pearson's chi-squared statistic: the asymptotic derivation.** Consider a multinomial distribution: n independent trials, each in one of k categories with probabilities $p_1, \\ldots, p_k$. Let $O_i$ be the count in category $i$. Then $E_i = np_i$ and $\\text{Var}(O_i) = np_i(1-p_i)$. Standardizing: $(O_i - E_i)/\\sqrt{E_i} \\approx (O_i - np_i)/\\sqrt{np_i}$ is approximately $N(0, 1-p_i)$ for large $n$. Pearson showed that $\\chi^2 = \\sum_{i=1}^k (O_i - E_i)^2/E_i \\to \\chi^2(k-1)$ in distribution as $n \\to \\infty$. The $k-1$ (not $k$) comes from the constraint $\\sum O_i = n$, which reduces the effective dimension by 1.`,

      `**Expected counts for the independence test.** Under independence of row variable $R$ and column variable $C$: $P(R=i, C=j) = P(R=i) \\times P(C=j)$. Estimating these marginal probabilities from data: $\\hat{P}(R=i) = R_i/n$ and $\\hat{P}(C=j) = C_j/n$. Expected count $E_{ij} = n \\times (R_i/n)(C_j/n) = R_i C_j/n$. This uses $r-1$ free row probabilities (they sum to 1) and $c-1$ free column probabilities, leaving df $= rc - 1 - (r-1) - (c-1) = (r-1)(c-1)$.`,

      `**The chi-squared distribution and variance.** The $\\chi^2(\\nu)$ distribution has mean $\\nu$ and variance $2\\nu$. For large $\\nu$ (say $\\nu > 30$), $\\chi^2(\\nu) \\approx N(\\nu, 2\\nu)$ approximately. The right-skewed shape for small $\\nu$ means the critical values are much larger relative to the mean for small df tests. For example: $\\chi^2(1, 0.95) = 3.84$, but $\\chi^2(10, 0.95) = 18.31$ (the mean is 10, so the critical value is only 1.831× the mean for df=10 vs 3.84× for df=1).`,

      `**Relationship to z-test: the 2×2 case.** For a 2×2 table testing equality of two proportions, the chi-squared test statistic equals the square of the z-test statistic: $\\chi^2 = z^2$. The chi-squared critical value $\\chi^2(1, 0.95) = 3.84 = 1.96^2$. This confirms that the two tests are identical for two-sided tests on a 2×2 table — a useful sanity check.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Chi-Squared Statistic and Its Distribution',
        body: `For a chi-squared goodness-of-fit test with $k$ categories:\n$$\\chi^2 = \\sum_{i=1}^k \\frac{(O_i - E_i)^2}{E_i} \\xrightarrow{d} \\chi^2(k-1)$$\nunder $H_0$ as $n \\to \\infty$, provided all $E_i \\to \\infty$ (i.e., all $E_i$ are large).\n\nFor a test of independence in an $r \\times c$ table:\n$$\\chi^2 = \\sum_{i=1}^r \\sum_{j=1}^c \\frac{(O_{ij} - E_{ij})^2}{E_{ij}} \\xrightarrow{d} \\chi^2((r-1)(c-1))$$\nunder $H_0: \\text{independence}$, with $E_{ij} = R_i C_j / n$.`,
      },
      {
        type: 'theorem',
        title: 'Cramér\'s V: Effect Size for Chi-Squared',
        body: `$$V = \\sqrt{\\frac{\\chi^2}{n \\cdot \\min(r-1, c-1)}}$$\n\n$V \\in [0, 1]$: 0 = no association, 1 = perfect association.\n\nConventions (Cohen, 1988):\n• Small: V ≈ 0.10\n• Medium: V ≈ 0.30\n• Large: V ≈ 0.50\n\nAlways report $V$ alongside the p-value. A table with n=10,000 can give a highly significant p-value for a trivially small association (V=0.02).`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Chi-Squared Tests — Python',
        initialProps: {
          initialCells: [
            {
              id: 'cell1',
              cellTitle: 'Goodness-of-Fit Test: Mendelian Genetics',
              prose: `Reproducing Mendel's famous pea experiment: testing whether observed offspring ratios match the predicted 9:3:3:1 ratio.`,
              code: `import numpy as np
from scipy import stats

# Mendel's pea experiment
# 4 phenotypes: Round-Yellow, Round-Green, Wrinkled-Yellow, Wrinkled-Green
observed = np.array([315, 108, 101, 32])
n = observed.sum()

# H0: 9:3:3:1 ratio (Mendelian prediction)
expected_props = np.array([9, 3, 3, 1]) / 16
expected = n * expected_props

print("Mendelian Goodness-of-Fit Test")
print(f"Total n = {n}")
print()
print(f"{'Phenotype':<22} {'Observed':>10} {'Expected':>10} {'(O-E)²/E':>10}")
labels = ['Round-Yellow', 'Round-Green', 'Wrinkled-Yellow', 'Wrinkled-Green']
chi2_manual = 0
for lbl, o, e in zip(labels, observed, expected):
    contrib = (o - e)**2 / e
    chi2_manual += contrib
    print(f"  {lbl:<20} {o:>10} {e:>10.2f} {contrib:>10.4f}")

print(f"  {'TOTAL':<20} {n:>10} {expected.sum():>10.2f} {chi2_manual:>10.4f}")

df = len(observed) - 1
p_value = 1 - stats.chi2.cdf(chi2_manual, df=df)

print(f"\nχ² statistic = {chi2_manual:.4f}")
print(f"Degrees of freedom = {df}")
print(f"p-value = {p_value:.4f}")
print(f"χ²_critical (α=0.05) = {stats.chi2.ppf(0.95, df=df):.4f}")
print()

# Verify with scipy
chi2_scipy, p_scipy = stats.chisquare(observed, f_exp=expected)
print(f"scipy verification: χ²={chi2_scipy:.4f}, p={p_scipy:.4f}")
print()
if p_value > 0.05:
    print("FAIL TO REJECT H0: data is consistent with 9:3:3:1 ratio")
else:
    print("REJECT H0: data deviates significantly from 9:3:3:1 ratio")`,
            },
            {
              id: 'cell2',
              cellTitle: 'Test of Independence: Contingency Table',
              prose: `Testing whether vaccine type (A, B, or placebo) is independent of outcome (infected or not).`,
              code: `import numpy as np
from scipy import stats

# Contingency table: 3 groups × 2 outcomes
# Rows: Vaccine A, Vaccine B, Placebo
# Columns: Infected, Not Infected
observed = np.array([
    [15, 185],   # Vaccine A
    [20, 180],   # Vaccine B
    [45, 155],   # Placebo
])

n = observed.sum()
row_totals = observed.sum(axis=1)
col_totals = observed.sum(axis=0)

print("Contingency Table (Vaccine Type vs Infection)")
print(f"{'':>12} {'Infected':>10} {'Not Infected':>14} {'Row Total':>12}")
for i, (label, row) in enumerate(zip(['Vaccine A', 'Vaccine B', 'Placebo'], observed)):
    print(f"  {label:<10} {row[0]:>10} {row[1]:>14} {row_totals[i]:>12}")
print(f"  {'Col Total':<10} {col_totals[0]:>10} {col_totals[1]:>14} {n:>12}")

# Expected counts
expected = np.outer(row_totals, col_totals) / n
print(f"\nExpected Counts:")
for i, label in enumerate(['Vaccine A', 'Vaccine B', 'Placebo']):
    print(f"  {label:<10} {expected[i, 0]:>10.2f} {expected[i, 1]:>14.2f}")

# Chi-squared statistic
chi2_stat = ((observed - expected)**2 / expected).sum()
df = (observed.shape[0] - 1) * (observed.shape[1] - 1)
p_value = 1 - stats.chi2.cdf(chi2_stat, df=df)

# Cramér's V
cramers_v = np.sqrt(chi2_stat / (n * min(observed.shape[0]-1, observed.shape[1]-1)))

print(f"\nχ² statistic = {chi2_stat:.4f}")
print(f"Degrees of freedom = {df}")
print(f"p-value = {p_value:.4f}")
print(f"Cramér's V = {cramers_v:.4f}")

chi2_scipy, p_scipy, df_scipy, expected_scipy = stats.chi2_contingency(observed)
print(f"\nscipy chi2_contingency: χ²={chi2_scipy:.4f}, p={p_scipy:.4f}, df={df_scipy}")
print()
if p_value < 0.05:
    print("REJECT H0: vaccine type and infection status are NOT independent")
else:
    print("FAIL TO REJECT H0: no significant association detected")`,
            },
            {
              id: 'cell3',
              cellTitle: 'Chi-Squared Distribution: Shape and Critical Values',
              prose: `Visualizing the chi-squared distribution for different degrees of freedom and understanding how to find critical values.`,
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

fig, axes = plt.subplots(1, 2, figsize=(12, 4))

# Chi-squared PDFs for different df
x = np.linspace(0, 30, 400)
for df_val, color in [(1, 'steelblue'), (2, 'orange'), (5, 'green'), (10, 'red')]:
    axes[0].plot(x, stats.chi2.pdf(x, df=df_val), color=color, linewidth=2,
                label=f'df = {df_val}')
axes[0].set_xlim(0, 30)
axes[0].set_ylim(0, 0.5)
axes[0].set_title('Chi-Squared PDF for Various df')
axes[0].set_xlabel('χ²'); axes[0].set_ylabel('f(x)')
axes[0].legend()

# Shade the rejection region for df=5 at alpha=0.05
df_demo = 5
crit = stats.chi2.ppf(0.95, df=df_demo)
x_fill = np.linspace(crit, 30, 200)
axes[0].fill_between(x_fill, stats.chi2.pdf(x_fill, df=df_demo),
                     alpha=0.3, color='green', label=f'Rejection region (df=5)')

# Critical value table
alphas = [0.10, 0.05, 0.01]
dfs = [1, 2, 3, 4, 5, 10, 20]
print("Critical values χ²(df, 1−α):")
print(f"{'df':>4} | {'α=0.10':>8} | {'α=0.05':>8} | {'α=0.01':>8}")
print("-" * 38)
for d in dfs:
    row = f"{d:>4}"
    for a in alphas:
        row += f" | {stats.chi2.ppf(1-a, df=d):>8.3f}"
    print(row)

axes[1].bar(dfs, [stats.chi2.ppf(0.95, df=d) for d in dfs], color='steelblue', alpha=0.7)
axes[1].set_xlabel('Degrees of Freedom')
axes[1].set_ylabel('Critical Value (α=0.05)')
axes[1].set_title('χ² Critical Values Grow with df')

plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              cellTitle: 'Challenge: Fair Die and Independence Test',
              prose: `**Part 1 (Goodness-of-Fit):** You roll a die 120 times and get counts: [25, 17, 20, 22, 18, 18] for faces 1–6. Test H₀: the die is fair (each face equally likely). Report χ², df, p-value, and conclusion.

**Part 2 (Independence):** Survey of 200 students on study habit (morning/night) vs performance (pass/fail):
- Morning studiers: 70 pass, 30 fail
- Night studiers: 60 pass, 40 fail

Test independence at α=0.05. Compute Cramér's V.`,
              starterCode: `from scipy import stats
import numpy as np

# Part 1: Goodness-of-fit
observed_die = np.array([25, 17, 20, 22, 18, 18])
expected_die = # np.full(6, 120/6)
chi2_die, p_die = # stats.chisquare(observed_die, f_exp=expected_die)
print(f"Die test: χ²={chi2_die:.3f}, p={p_die:.4f}")

# Part 2: Independence
table = np.array([
    [70, 30],   # morning: pass, fail
    [60, 40],   # night: pass, fail
])
chi2_ind, p_ind, df_ind, expected_ind = # stats.chi2_contingency(table)
n = table.sum()
cramers_v = # np.sqrt(chi2_ind / (n * min(table.shape[0]-1, table.shape[1]-1)))
print(f"Independence test: χ²={chi2_ind:.3f}, p={p_ind:.4f}")
print(f"Cramér's V = {cramers_v:.4f}")`,
              solution: `from scipy import stats
import numpy as np

# Part 1: Goodness-of-fit
observed_die = np.array([25, 17, 20, 22, 18, 18])
expected_die = np.full(6, 120/6)
chi2_die, p_die = stats.chisquare(observed_die, f_exp=expected_die)
print(f"Die test: χ²={chi2_die:.3f}, df=5, p={p_die:.4f}")
print(f"  {'REJECT: die appears unfair' if p_die < 0.05 else 'FAIL TO REJECT: die could be fair'}")
print()

# Part 2: Independence
table = np.array([[70, 30], [60, 40]])
chi2_ind, p_ind, df_ind, expected_ind = stats.chi2_contingency(table)
n = table.sum()
cramers_v = np.sqrt(chi2_ind / (n * min(table.shape[0]-1, table.shape[1]-1)))
print(f"Independence test: χ²={chi2_ind:.3f}, df={df_ind}, p={p_ind:.4f}")
print(f"Cramér's V = {cramers_v:.4f} ({'small' if cramers_v < 0.3 else 'medium' if cramers_v < 0.5 else 'large'} effect)")
print(f"Expected counts:\n{expected_ind}")
print(f"  {'REJECT: study habit and performance are associated' if p_ind < 0.05 else 'FAIL TO REJECT: no significant association'}")`,
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Chi-Squared Tests — MATLAB/Octave',
        initialProps: {
          initialCells: [
            {
              id: 'mat1',
              cellTitle: 'Goodness-of-Fit in MATLAB',
              prose: `MATLAB's chi2gof function and manual chi-squared computation for Mendel's pea data.`,
              code: `pkg load statistics
% Chi-squared goodness-of-fit: Mendel's peas
observed = [315, 108, 101, 32];
n = sum(observed);
expected_props = [9, 3, 3, 1] / 16;
expected = n * expected_props;

chi2_stat = sum((observed - expected).^2 ./ expected);
df = length(observed) - 1;
p_value = 1 - chi2cdf(chi2_stat, df);
crit = chi2inv(0.95, df);

fprintf('Mendel Goodness-of-Fit Test\\n');
fprintf('χ² = %.4f\\n', chi2_stat);
fprintf('df = %d\\n', df);
fprintf('p-value = %.4f\\n', p_value);
fprintf('Critical value (α=0.05) = %.4f\\n', crit);

% Show contributions
labels = {'Round-Yellow', 'Round-Green', 'Wrinkled-Yellow', 'Wrinkled-Green'};
fprintf('\\n%-20s %8s %8s %10s\\n', 'Phenotype', 'Obs', 'Exp', '(O-E)²/E');
for i = 1:4
    fprintf('  %-18s %8d %8.2f %10.4f\\n', labels{i}, observed(i), expected(i), ...
            (observed(i)-expected(i))^2/expected(i));
end`,
            },
            {
              id: 'mat2',
              cellTitle: 'Contingency Table Test in MATLAB',
              prose: `Testing independence using a 2×3 contingency table in MATLAB.`,
              code: `% Test of independence: vaccine trial
observed = [15, 185; 20, 180; 45, 155];  % 3 rows × 2 cols

n = sum(observed(:));
row_totals = sum(observed, 2);
col_totals = sum(observed, 1);

% Expected counts
expected = (row_totals * col_totals) / n;

chi2_stat = sum(sum((observed - expected).^2 ./ expected));
df = (size(observed,1) - 1) * (size(observed,2) - 1);
p_value = 1 - chi2cdf(chi2_stat, df);
cramers_v = sqrt(chi2_stat / (n * min(size(observed,1)-1, size(observed,2)-1)));

fprintf('Chi-Squared Test of Independence\\n');
fprintf('χ² = %.4f,  df = %d\\n', chi2_stat, df);
fprintf('p-value = %.4f\\n', p_value);
fprintf("Cramér's V = %.4f\\n", cramers_v);

if p_value < 0.05
    fprintf('REJECT H0: vaccination type and infection are not independent\\n');
else
    fprintf('FAIL TO REJECT H0\\n');
end

fprintf('\\nExpected counts:\\n');
disp(expected);`,
            },
          ],
        },
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────
  rigor: {
    prose: [
      `**The likelihood ratio test (G-test) as an alternative.** The chi-squared test uses Pearson's statistic $\\chi^2 = \\sum (O-E)^2/E$. An alternative is the G-test (log-likelihood ratio): $G = 2\\sum O_i \\ln(O_i/E_i)$. Both are asymptotically $\\chi^2$ under H₀ with the same df. The G-test has slightly better theoretical properties (it is the score statistic from the likelihood, and it equals twice the log-likelihood ratio) but Pearson's $\\chi^2$ is more standard and easier to compute by hand. For large n, they give identical results.`,

      `**Fisher's exact test for 2×2 tables.** When expected counts are small, the chi-squared approximation is poor. Fisher's exact test computes the exact p-value by summing the hypergeometric probabilities of all tables at least as extreme as the observed one. For the observed 2×2 table with fixed row and column marginals, there are only a finite number of possible tables, and their probabilities under H₀ (independence) are given exactly by the hypergeometric distribution. Fisher's exact test is conservative (overstates p-values) for tables with small marginals, but it is always valid.`,

      `**Chi-squared and the multinomial distribution.** The formal statement of Pearson's theorem requires the multinomial framework: if $(O_1, \\ldots, O_k) \\sim \\text{Multinomial}(n, p_1, \\ldots, p_k)$, then $\\chi^2 = \\sum (O_i - np_i)^2/(np_i) \\to \\chi^2(k-1)$ in distribution as $n \\to \\infty$ with $p_i$ fixed. The proof uses the multivariate central limit theorem applied to the standardized counts $(O_i - np_i)/\\sqrt{np_i}$, which converge to a k-dimensional Gaussian constrained to sum to 0. The resulting quadratic form has rank k−1, giving the chi-squared degrees of freedom.`,
    ],
  },

  // ── Examples ──────────────────────────────────────────────────
  examples: [
    {
      title: 'Goodness-of-Fit: Is a Die Fair?',
      steps: [
        `**Setup.** A die is rolled 300 times with results: [42, 55, 48, 57, 46, 52] for faces 1–6. Test H₀: fair die at α = 0.05.`,
        `**Expected counts.** Under a fair die, each face has probability 1/6. E = 300/6 = 50 for each face. All E = 50 ≥ 5, so the chi-squared approximation is valid.`,
        `**Compute χ².** χ² = (42−50)²/50 + (55−50)²/50 + (48−50)²/50 + (57−50)²/50 + (46−50)²/50 + (52−50)²/50 = 64/50 + 25/50 + 4/50 + 49/50 + 16/50 + 4/50 = 162/50 = 3.24.`,
        `**p-value.** df = 6 − 1 = 5. χ²_critical(5, 0.95) = 11.07. Our χ² = 3.24 < 11.07. p = P(χ²(5) ≥ 3.24) ≈ 0.663.`,
        `**Conclusion.** Fail to reject H₀. The data is consistent with a fair die. The deviations are well within what sampling variability would produce.`,
      ],
      annotations: [
        `All expected counts = 50 (well above 5), so the chi-squared approximation is valid.`,
        `χ² = 3.24 with df = 5 is a very small test statistic relative to the critical value 11.07 — the die looks fair.`,
        `A fair die check is a common test for random number generators in simulations.`,
      ],
    },
    {
      title: 'Independence Test: Gender and Major Choice',
      steps: [
        `**Setup.** A survey of 400 students records gender (M/F) and chosen major (STEM/Humanities/Arts). Observed table:\n\n|       | STEM | Humanities | Arts | Row Total |\n|-------|------|-----------|------|----------|\n| Male  |  90  |     45    |  15  |   150    |\n| Female|  70  |     90    |  90  |   250    |\n| Col   | 160  |    135    | 105  |   400    |`,
        `**Expected counts.** E(Male,STEM) = 150×160/400 = 60. E(Male,Humanities) = 150×135/400 = 50.6. E(Male,Arts) = 150×105/400 = 39.4. E(Female,STEM) = 250×160/400 = 100. E(Female,Humanities) = 84.4. E(Female,Arts) = 65.6. All ≥ 5 — valid.`,
        `**Compute χ².** Sum of (O−E)²/E over all 6 cells: (90−60)²/60 + (45−50.6)²/50.6 + (15−39.4)²/39.4 + (70−100)²/100 + (90−84.4)²/84.4 + (90−65.6)²/65.6 ≈ 15.0 + 0.62 + 15.09 + 9.0 + 0.37 + 9.06 = 49.14.`,
        `**p-value.** df = (2−1)(3−1) = 2. χ²_critical(2, 0.95) = 5.99. Our χ² = 49.14 >> 5.99. p << 0.001.`,
        `**Effect size.** Cramér's V = √(49.14/(400 × 1)) = √0.1229 ≈ 0.35 — medium-to-large association.`,
        `**Conclusion.** Reject H₀. Gender and major choice are not independent (p << 0.001). The effect size (V=0.35) indicates a meaningful association — men disproportionately choose STEM, women disproportionately choose Arts and Humanities.`,
      ],
      annotations: [
        `df = (rows−1)(cols−1) = 1×2 = 2. The table has 6 cells but only 2 degrees of freedom because 4 cells are determined once you know 2.`,
        `χ² = 49.14 with df=2 is extremely large — this is a very strong signal of association.`,
        `Cramér's V = 0.35 = medium-large effect. With n=400, even a small association would be statistically significant, so effect size is crucial for interpretation.`,
      ],
    },
  ],

  // ── Challenges ────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1',
      difficulty: 'easy',
      problem: `A bag of M&Ms is claimed to contain colors in equal proportions (1/6 each: red, orange, yellow, green, blue, brown). You count a bag of 120 M&Ms: [18, 22, 20, 25, 17, 18] for those colors.\n\n(a) Compute χ² by hand.\n(b) What is the p-value? Should you reject at α=0.05?\n(c) Which color contributed most to the chi-squared statistic?`,
      walkthrough: [
        `(a) E = 120/6 = 20 for each color. χ² = (18−20)²/20 + (22−20)²/20 + (20−20)²/20 + (25−20)²/20 + (17−20)²/20 + (18−20)²/20 = 4/20 + 4/20 + 0 + 25/20 + 9/20 + 4/20 = 46/20 = **2.3**.\n\n(b) df = 5. χ²_critical(5, 0.95) = 11.07. χ² = 2.3 < 11.07. p ≈ 0.806. **Fail to reject H₀**.\n\n(c) Green contributed (25−20)²/20 = 25/20 = 1.25 — the most, accounting for 54% of the statistic.`,
      ]
    },
    {
      id: 'ch2',
      difficulty: 'medium',
      problem: `A hospital records whether patients were given Drug A, Drug B, or a Placebo, and whether their pain was reduced (Yes/No):\n\n|         | Yes | No |\n|---------|-----|----|\n| Drug A  |  40 | 10 |\n| Drug B  |  35 | 15 |\n| Placebo |  20 | 30 |\n\n(a) Test independence at α=0.01.\n(b) Compute Cramér's V and interpret.\n(c) Looking at the table, which treatment appears most effective?`,
      walkthrough: [
        `(a) n=150. Row totals: 50, 50, 50. Col totals: 95, 55. Expected: E(A,Y)=50×95/150=31.67, E(A,N)=18.33, E(B,Y)=31.67, E(B,N)=18.33, E(Pl,Y)=31.67, E(Pl,N)=18.33. χ²=(40−31.67)²/31.67+(10−18.33)²/18.33+(35−31.67)²/31.67+(15−18.33)²/18.33+(20−31.67)²/31.67+(30−18.33)²/18.33 = 2.19+3.79+0.35+0.61+4.29+7.42 = **18.65**. df=(3−1)(2−1)=2. χ²_critical(2,0.99)=9.21. 18.65>9.21. **REJECT** at α=0.01. p≈0.00009.\n\n(b) V=√(18.65/(150×1))=√0.1243≈**0.353** — medium-large effect.\n\n(c) Drug A: 80% success rate (40/50). Drug B: 70%. Placebo: 40%. Drug A appears most effective.`,
      ]
    },
    {
      id: 'ch3',
      difficulty: 'hard',
      problem: `**Chi-squared vs Fisher's exact test.** Create a 2×2 table with small expected counts: 5 patients received treatment, 3 recovered; 8 received placebo, 2 recovered. Run both the chi-squared test (without continuity correction) and Fisher's exact test using Python. Compare p-values. Then discuss: why might the chi-squared test be unreliable here, and which test should you report?`,
      walkthrough: [
        `Table: [[3,2],[2,6]]. n=13. Expected: E(T,R)=5×5/13=1.92, E(T,NR)=3.08, E(Pl,R)=3.08, E(Pl,NR)=4.92. The minimum expected count is 1.92 — below 5, so chi-squared approximation is unreliable.\n\nPython:\n\`\`\`python\nfrom scipy import stats\ntable = [[3,2],[2,6]]\nchi2, p_chi, df, exp = stats.chi2_contingency(table, correction=False)\nodds, p_fisher = stats.fisher_exact(table)\nprint(f"Chi-squared: p={p_chi:.4f}")\nprint(f"Fisher's exact: p={p_fisher:.4f}")\n\`\`\`\nTypical result: chi-squared p≈0.10, Fisher's p≈0.15 or so (both likely non-significant). Chi-squared with min E=1.92 gives an unreliable approximation — it tends to be anti-conservative (too small p-values) when E<5. Fisher's exact test should be reported.`,
      ]
    },
  ],

  // ── Quiz ──────────────────────────────────────────────────────
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: `A chi-squared goodness-of-fit test has 5 categories. What are the degrees of freedom?`,
      options: [`5`, `4`, `3`, `Depends on sample size n`],
      answer: `4`,
      hints: [
        `Degrees of freedom = k − 1 where k is the number of categories.`,
        `One df is lost because the observed counts must sum to n (one constraint).`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q2',
      type: 'choice',
      text: `For a chi-squared test of independence in a 4×3 contingency table, what are the degrees of freedom?`,
      options: [`12`, `6`, `4`, `11`],
      answer: `6`,
      hints: [
        `df = (rows − 1)(cols − 1) = (4−1)(3−1) = 3 × 2 = 6.`,
        `Not 12 (that would be all cells) — the marginal totals constrain the table.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q3',
      type: 'choice',
      text: `A cell in a contingency table has an observed count of 8 and an expected count of 2. What is the contribution of this cell to the chi-squared statistic?`,
      options: [`36`, `18`, `6`, `3`],
      answer: `18`,
      hints: [
        `Each cell contributes (O − E)² / E to χ².`,
        `(8 − 2)² / 2 = 36/2 = 18.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q4',
      type: 'choice',
      text: `When is Fisher's exact test preferred over the chi-squared test of independence?`,
      options: [
        `When the sample size is very large (n > 1000).`,
        `When the table has many rows and columns.`,
        `When expected cell counts are small (less than 5 in some cells).`,
        `When the chi-squared statistic is very large.`,
      ],
      answer: `When expected cell counts are small (less than 5 in some cells).`,
      hints: [
        `Fisher's exact test gives exact p-values and doesn't rely on the chi-squared approximation.`,
        `The chi-squared approximation breaks down when expected counts are small.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q5',
      type: 'choice',
      text: `Cramér's V for a 2×2 contingency table equals 0.15. What does this indicate?`,
      options: [
        `A large, highly significant association.`,
        `A small effect size; the association, though possibly significant, is weak.`,
        `The test is statistically non-significant.`,
        `The chi-squared statistic must be below the critical value.`,
      ],
      answer: `A small effect size; the association, though possibly significant, is weak.`,
      hints: [
        `V=0.15 is between 0.1 (small) and 0.3 (medium) — small effect.`,
        `Cramér's V measures effect size, not statistical significance. A small V with large n can give a significant p-value.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q6',
      type: 'choice',
      text: `A chi-squared goodness-of-fit test for a fair coin (two categories: heads/tails) with n=100 is conceptually equivalent to which other test?`,
      options: [
        `A paired t-test comparing heads and tails.`,
        `A two-sided one-sample z-test for p = 0.5.`,
        `A two-sample t-test comparing the two groups.`,
        `A chi-squared test of independence on a 2×2 table.`,
      ],
      answer: `A two-sided one-sample z-test for p = 0.5.`,
      hints: [
        `For two categories, χ² = z² where z is the test statistic for testing a proportion.`,
        `χ²(1, 0.95) = 3.84 = 1.96² — the critical values are related by squaring.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q7',
      type: 'choice',
      text: `In a goodness-of-fit test with n=200 and null probability p₁=0.25, what is the expected count E₁?`,
      options: [`25`, `50`, `75`, `0.25`],
      answer: `50`,
      hints: [
        `Expected count Eᵢ = n × pᵢ = 200 × 0.25 = 50.`,
        `The rule: all expected counts must be ≥ 5 for the chi-squared approximation to be valid.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q8',
      type: 'choice',
      text: `Chi-squared statistics are always:`,
      options: [
        `Between −1 and +1`,
        `Non-negative, since each term is (O−E)²/E ≥ 0`,
        `Normally distributed for large n`,
        `Less than the degrees of freedom`,
      ],
      answer: `Non-negative, since each term is (O−E)²/E ≥ 0`,
      hints: [
        `(O−E)² is a square → always ≥ 0. Divided by E > 0 → still ≥ 0. Sum of non-negative terms ≥ 0.`,
        `Chi-squared tests are always one-tailed (right tail only): large χ² = evidence against H₀.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q9',
      type: 'choice',
      text: `For a 3×4 contingency table, the degrees of freedom for the chi-squared test of independence is:`,
      options: [`12`, `6`, `7`, `11`],
      answer: `6`,
      hints: [
        `df = (rows−1)(cols−1) = (3−1)(4−1) = 2×3 = 6.`,
        `Not 12 (total cells) — the row and column marginal totals constrain the table, removing degrees of freedom.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q10',
      type: 'choice',
      text: `A chi-squared test gives χ² = 12.5 with df = 4, p = 0.014. Cramér's V = 0.08. What is the most complete interpretation?`,
      options: [
        `Statistically significant; the association is practically meaningful`,
        `Statistically significant (p < 0.05) but effect size is very small (V=0.08)`,
        `Not significant because effect size is too small`,
        `The test is invalid because V < 0.1`,
      ],
      answer: `Statistically significant (p < 0.05) but effect size is very small (V=0.08)`,
      hints: [
        `p = 0.014 < 0.05 → reject H₀ (statistically significant with a large sample).`,
        `V = 0.08 < 0.1 → very small effect size. Statistical significance does not imply practical importance.`,
      ],
      reviewSection: `intuition`,
    },
  ],

  // ── Checkpoints ───────────────────────────────────────────────
  checkpoints: [
    `Described what the chi-squared distribution is and how degrees of freedom affect its shape`,
    `Computed expected counts for a goodness-of-fit test`,
    `Performed a chi-squared goodness-of-fit test and interpreted the p-value`,
    `Set up a contingency table and computed expected counts for independence`,
    `Performed a chi-squared test of independence`,
    `Computed Cramér's V and interpreted effect size`,
  ],

  // ── Semantics ─────────────────────────────────────────────────
  semantics: {
    coreSymbols: [
      { symbol: `χ²`, meaning: `Chi-squared test statistic: Σ(O−E)²/E` },
      { symbol: `O`, meaning: `Observed count in a category or cell` },
      { symbol: `E`, meaning: `Expected count under H₀ (= n × p for goodness-of-fit, = RᵢCⱼ/n for independence)` },
      { symbol: `k−1`, meaning: `Degrees of freedom for goodness-of-fit with k categories` },
      { symbol: `(r−1)(c−1)`, meaning: `Degrees of freedom for independence test on r×c table` },
      { symbol: `V`, meaning: `Cramér's V: effect size in [0,1]; 0.1=small, 0.3=medium, 0.5=large` },
    ],
    rulesOfThumb: [
      `All expected counts must be ≥ 5 for the chi-squared approximation to be valid.`,
      `For 2×2 tables with small expected counts, use Fisher's exact test.`,
      `The chi-squared test is always one-sided (right tail only) — large χ² = evidence against H₀.`,
      `Report Cramér's V alongside p-value to show effect magnitude, not just significance.`,
      `For a 2×2 table: χ² ≈ z² where z is the z-test for two proportions.`,
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────
  spiral: {
    recovery: `If you are confused about the degrees of freedom formula: for goodness-of-fit, you have k categories and one constraint (counts sum to n), so df = k−1. For independence, you have r×c cells with r−1 free row proportions and c−1 free column proportions — both constrained by the marginals, leaving df = (r−1)(c−1).`,
    links: [
      {
        lessonId: `stat7-001`,
        relationship: `The chi-squared distribution reappears in regression: the F-statistic for overall model significance follows an F-distribution (ratio of chi-squareds), and the chi-squared test is used to test whether regression coefficients jointly equal zero.`,
      },
      {
        lessonId: `stat4-001`,
        relationship: `The expected counts Eᵢⱼ = RᵢCⱼ/n come directly from the multiplication rule for independent events: P(A and B) = P(A)×P(B). Independence in probability theory is exactly what the chi-squared test of independence checks.`,
      },
    ],
  },

  // ── Mastery ───────────────────────────────────────────────────
  mastery: {
    badge: `Chi-Squared Tests`,
    description: `You can perform chi-squared goodness-of-fit and independence tests, compute expected counts, interpret the p-value and Cramér's V, and know when to use Fisher's exact test instead.`,
  },

  // ── Definitions ───────────────────────────────────────────────
  definitions: [
    {
      term: `Chi-squared test`,
      definition: `A family of hypothesis tests for categorical data based on the statistic χ² = Σ(O−E)²/E, which follows a chi-squared distribution under H₀. Includes goodness-of-fit and independence tests.`,
      symbol: `χ²`,
    },
    {
      term: `Goodness-of-fit test`,
      definition: `Tests whether observed counts in k categories match a hypothesized distribution. Uses df = k−1.`,
      symbol: null,
    },
    {
      term: `Contingency table`,
      definition: `A table of counts cross-classifying two categorical variables. The test of independence checks whether the row variable and column variable are associated.`,
      symbol: null,
    },
    {
      term: `Expected count`,
      definition: `The count predicted under H₀. For goodness-of-fit: E = n×p. For independence: E = (row total × col total) / n.`,
      symbol: `E`,
    },
    {
      term: `Fisher's exact test`,
      definition: `An exact test of independence in a 2×2 table that computes the exact hypergeometric p-value. Used when expected counts are less than 5.`,
      symbol: null,
    },
    {
      term: `Cramér's V`,
      definition: `Effect size for chi-squared tests: V = √(χ²/(n × min(r−1,c−1))). Ranges 0 to 1; 0.1=small, 0.3=medium, 0.5=large.`,
      symbol: `V`,
    },
  ],
};
