export default {
  id: "stat3-002",
  slug: "measures-of-spread",
  chapter: "stat3",
  order: 2,
  title: "Measures of Spread",
  subtitle:
    "Range, IQR, variance, and standard deviation — quantifying how spread out data is.",
  tags: [
    "standard deviation",
    "variance",
    "IQR",
    "range",
    "spread",
    "variability",
    "dispersion",
    "resistant",
    "population vs sample",
  ],
  aliases:
    "standard deviation variance IQR interquartile range range spread variability dispersion population sample SD coefficient of variation",
  timeToComplete: 40,
  coreConcept:
    "Spread (dispersion) describes how far values in a dataset are from the center. Range is simple but fragile. IQR is the spread of the middle 50% — resistant to outliers, paired with the median. Standard deviation is the typical distance from the mean — sensitive to outliers, paired with the mean. Variance is standard deviation squared.",
  prerequisites: ["stat3-001"],
  nextLesson: "stat3-003",

  hook: {
    question:
      "Two medical clinics have the same average wait time: 22 minutes. Clinic A: all patients wait 20–24 minutes. Clinic B: patients wait 2 minutes or 42 minutes with roughly equal probability. Which clinic is more reliable, and why does the average tell you nothing about this?",
    realWorldContext:
      "Clinic A is dramatically more reliable. With a standard deviation of ~1.5 minutes, virtually every patient at Clinic A experiences a wait close to 22 minutes. Clinic B has a standard deviation of ~20 minutes — the average is 22 minutes but you might wait 2 minutes or 42 minutes with no way to know in advance. The mean does not reveal this. Spread (variability) is the second dimension of a distribution, and for operational and financial planning, it matters just as much as the center. This is why airlines quote on-time performance (spread) not just average delay (mean), why manufacturers specify tolerances (spread), and why investors care about portfolio volatility (standard deviation) not just expected return (mean).",
  },

  intuition: {
    prose: [
      "**Range: the simplest spread measure.** Range = max − min. It is immediate and intuitive but fragile: a single outlier changes the range entirely. Dataset [5, 6, 6, 7, 7, 8] has range=3. Add one outlier (100) and range jumps to 95. Use range only as a quick sanity check or when you know there are no outliers.",
      "**IQR: spread of the middle 50%.** IQR = Q3 − Q1. Remove the bottom 25% and top 25% of the data, then measure the range of what remains. IQR is resistant — it is completely unaffected by values in the lower or upper 25%. Use IQR alongside the median for skewed distributions and data with outliers.",
      "**Before reading on, predict:** Dataset A: [10, 10, 10, 10, 10]. Dataset B: [0, 5, 10, 15, 20]. Both have mean = 10. What is the standard deviation of each? Without computing, which has more spread?",
      '**Standard deviation: the typical distance from the mean.** Informally, the standard deviation $s$ is the "typical" distance a data point sits from the mean. If $s = 5$ and $\\bar{x} = 50$, a typical observation is about 5 units away from 50 — so values of 45–55 would be common. Standard deviation uses every data point (unlike IQR) and is sensitive to outliers (unlike IQR). Use standard deviation alongside the mean for approximately symmetric distributions.',
      "**Variance: standard deviation squared.** Variance $s^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n-1}$ is the average squared deviation from the mean. It is in the squared units of the original data (e.g., dollars² for dollar data). Taking the square root gives the standard deviation back in original units. In practice, you interpret standard deviation (same units as data) but mathematically operate on variance (it has nice algebraic properties for combining independent variables).",
      "**Coefficient of variation (CV).** $CV = (s / \\bar{x}) \\times 100\\%$. The CV expresses standard deviation as a percentage of the mean. This is useful when comparing spread across datasets measured in different units. Example: comparing the variability of stock prices at $5 vs. $500 — the raw standard deviations ($0.50 vs. $50) look very different, but if CV = 10% for both, they are equally variable relative to their price level.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Computing Sample Standard Deviation",
        body: "Step 1. Compute the mean: x̄ = Σxᵢ/n.\n\nStep 2. Compute each deviation from the mean: dᵢ = xᵢ − x̄.\n\nStep 3. Square each deviation: dᵢ².\n\nStep 4. Sum the squared deviations: SS = Σdᵢ².\n\nStep 5. Divide by n−1 (not n): s² = SS/(n−1). This is the sample variance.\n\nStep 6. Take the square root: s = √s².\n\nNote: The denominator is n−1 for samples (not N for populations). This is called Bessel's correction — it makes s² an unbiased estimator of the population variance σ². When n is large (>30), n vs. n−1 makes little practical difference.",
      },
      {
        type: "insight",
        title: "Why Divide by n−1, Not n?",
        body: 'The sample mean x̄ was computed from the same data — it is already "fitted" to the sample. This means the deviations (xi − x̄) are slightly too small on average compared to the true deviations (xi − μ). If you divided by n, you would systematically underestimate the population variance.\n\nDividing by n−1 corrects for this. Intuitively: with n data points and a computed mean, you only have n−1 independent pieces of deviation information (the last deviation is determined by the others, because all deviations sum to zero: Σ(xi − x̄) = 0).\n\nThose n−1 independent pieces are called "degrees of freedom."',
      },
      {
        type: "warning",
        title: "Matched Pairs: Center and Spread",
        body: 'Mean and standard deviation go together.\nMedian and IQR go together.\n\nDo not mix them:\n- "Median ± standard deviation" is technically possible but not standard practice and can mislead.\n- "Mean ± IQR" is also non-standard.\n\nFor symmetric data: report mean ± SD.\nFor skewed data: report median (Q1, Q3) or median ± IQR.\n\nIn published papers, you will see: "Mean (SD) = 22 (1.5) minutes" for symmetric data, and "Median (IQR) = 22 (8, 36) minutes" for skewed data.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Population vs. sample formulas.** Population variance: $\\sigma^2 = \\frac{\\sum_{i=1}^N (x_i - \\mu)^2}{N}$. Sample variance: $s^2 = \\frac{\\sum_{i=1}^n (x_i - \\bar{x})^2}{n-1}$. Population SD: $\\sigma = \\sqrt{\\sigma^2}$. Sample SD: $s = \\sqrt{s^2}$. When you have the entire population, use N. When you have a sample (the typical case), use n−1.",
      "**Empirical Rule (68-95-99.7 Rule).** For a distribution that is approximately normal (bell-shaped and symmetric): approximately 68% of values fall within 1 SD of the mean ($\\bar{x} \\pm s$), approximately 95% within 2 SD, and approximately 99.7% within 3 SD. This rule provides quick context for interpreting a standard deviation: if $\\bar{x}=70$ and $s=10$, then about 95% of values are in [50, 90].",
      "**Combining variances.** For two independent variables X and Y: $\\text{Var}(X + Y) = \\text{Var}(X) + \\text{Var}(Y)$. Standard deviations do NOT add: $\\text{SD}(X+Y) = \\sqrt{\\text{SD}(X)^2 + \\text{SD}(Y)^2}$. This is why you square when combining — variances combine additively but SDs do not.",
    ],
  },

  rigor: {
    prose: [
      "**R1 — Unbiasedness of s².** $E[s^2] = \\sigma^2$: the sample variance s² with denominator n−1 is an unbiased estimator of the population variance σ². However, s = √s² is NOT an unbiased estimator of σ (the square root of an unbiased estimator is biased). For small samples the bias of s as an estimator of σ is noticeable but typically ignored in practice.",
      '**R2 — Maximum entropy interpretation.** The normal distribution is the maximum-entropy distribution for a given mean and variance. This means that if you know only the mean and variance of a distribution, the normal distribution is the "least informative" (most agnostic) choice. This is one theoretical justification for why the mean and standard deviation are natural paired statistics: they fully characterize the normal distribution.',
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: "stat3-002-cell-1",
        type: "python",
        cellTitle: "Compute spread measures from scratch",
        code: `# Wait times (minutes) for two clinics
clinic_a = [20, 21, 22, 22, 23, 23, 22, 21, 22, 24]
clinic_b = [2, 42, 3, 41, 22, 2, 42, 22, 2, 42]

def spread_summary(label, data):
    n = len(data)
    xbar = sum(data) / n
    
    # Variance and SD
    ss = sum((x - xbar)**2 for x in data)
    variance = ss / (n - 1)
    sd = variance**0.5
    
    # Range
    r = max(data) - min(data)
    
    # IQR (manual)
    s = sorted(data)
    q1 = s[n//4]
    q3 = s[3*n//4]
    iqr = q3 - q1
    
    print(f"{label}:")
    print(f"  Mean={xbar:.1f}, SD={sd:.2f}, Variance={variance:.2f}")
    print(f"  Range={r}, IQR={iqr}")
    print()

spread_summary("Clinic A", clinic_a)
spread_summary("Clinic B", clinic_b)
`,
        instructions:
          "Both clinics have mean ≈ 22 minutes. Compare the standard deviations — they tell you about the reliability of each clinic. A patient who values predictability would choose Clinic A.",
      },
      {
        id: "stat3-002-cell-2",
        type: "python",
        cellTitle: "Empirical Rule visualization",
        code: `import pandas as pd

# Simulate normally distributed data: exam scores
# Mean=75, SD=10
import random
random.seed(42)
scores = [round(75 + 10 * (random.gauss(0, 1)), 1) for _ in range(200)]

xbar = sum(scores) / len(scores)
s = (sum((x - xbar)**2 for x in scores) / (len(scores)-1))**0.5
print(f"Mean: {xbar:.2f}, SD: {s:.2f}")

# Count within 1, 2, 3 SDs
within_1 = sum(1 for x in scores if abs(x - xbar) <= s)
within_2 = sum(1 for x in scores if abs(x - xbar) <= 2*s)
within_3 = sum(1 for x in scores if abs(x - xbar) <= 3*s)
n = len(scores)
print(f"Within 1 SD: {within_1/n*100:.1f}% (expected ~68%)")
print(f"Within 2 SD: {within_2/n*100:.1f}% (expected ~95%)")
print(f"Within 3 SD: {within_3/n*100:.1f}% (expected ~99.7%)")

import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 5))
ax.hist(scores, bins=15, color="steelblue", edgecolor="white")
ax.axvline(xbar, color="crimson", lw=2, label=f"Mean = {xbar:.1f}")
ax.axvline(xbar - s, color="orange", lw=1.5, ls="--",
           label=f"±1σ = [{xbar-s:.1f}, {xbar+s:.1f}]")
ax.axvline(xbar + s, color="orange", lw=1.5, ls="--")
ax.axvline(xbar - 2*s, color="gold", lw=1.5, ls=":",
           label=f"±2σ = [{xbar-2*s:.1f}, {xbar+2*s:.1f}]")
ax.axvline(xbar + 2*s, color="gold", lw=1.5, ls=":")
ax.set_xlabel("Exam Score")
ax.set_ylabel("Count")
ax.set_title("Exam Scores — Empirical Rule Visualization")
ax.legend(fontsize=8)
plt.tight_layout()
plt.show()
`,
        instructions:
          "The histogram should look roughly bell-shaped. Verify that the empirical 68-95-99.7 rule holds approximately for this simulated normal data.",
      },
    ],
  },

  examples: [
    {
      id: "stat3-002-ex1",
      title: "Compute standard deviation step by step",
      difficulty: "easy",
      problem:
        "Dataset: [4, 7, 7, 10, 12]. Compute the sample standard deviation.",
      steps: [
        {
          expression: "\\bar{x} = (4+7+7+10+12)/5 = 40/5 = 8",
          annotation: "Mean = 8.",
          strategyTitle: "Step 1: Mean",
        },
        {
          expression: "d_i = [4-8, 7-8, 7-8, 10-8, 12-8] = [-4, -1, -1, 2, 4]",
          annotation:
            "Compute each deviation from the mean. Note: Σdᵢ = -4-1-1+2+4 = 0 (deviations always sum to zero).",
          strategyTitle: "Step 2: Deviations",
        },
        {
          expression: "d_i^2 = [16, 1, 1, 4, 16]",
          annotation:
            "Square each deviation. Squaring removes the sign — we want distance, not direction.",
          strategyTitle: "Step 3: Squared deviations",
        },
        {
          expression: "SS = 16+1+1+4+16 = 38",
          annotation: "Sum of squared deviations = 38.",
          strategyTitle: "Step 4: Sum SS",
        },
        {
          expression: "s^2 = SS/(n-1) = 38/4 = 9.5",
          annotation: "Sample variance = 9.5 (in units²).",
          strategyTitle: "Step 5: Variance",
        },
        {
          expression: "s = \\sqrt{9.5} \\approx 3.08",
          annotation:
            "Sample standard deviation ≈ 3.08 (in original units). A typical data point is about 3 units from the mean of 8.",
          strategyTitle: "Step 6: SD",
        },
      ],
    },
    {
      id: "stat3-002-ex2",
      title: "IQR vs. standard deviation: which to report",
      difficulty: "medium",
      problem:
        "Household incomes ($000s): [35, 40, 42, 45, 48, 50, 52, 55, 58, 320]. (a) Compute IQR and SD. (b) Which should you report, and why?",
      steps: [
        {
          expression: "\\text{Sorted: [35,40,42,45,48,50,52,55,58,320], n=10}",
          annotation: "Sort first. n=10 (even).",
          strategyTitle: "Step 1: Sort",
        },
        {
          expression:
            "Q1 = (40+42)/2 = 41, \\quad Q3 = (55+58)/2 = 56.5, \\quad IQR = 56.5-41 = 15.5",
          annotation:
            "Q1 = average of 2nd and 3rd values; Q3 = average of 7th and 8th. IQR = 15.5.",
          strategyTitle: "Step 2: IQR",
        },
        {
          expression: "\\bar{x} = 745/10 = 74.5, \\quad s \\approx 86.1",
          annotation:
            "Mean = 74.5 (pulled up by 320). SD ≈ 86.1 — inflated by the outlier at 320. The standard deviation of 86.1 is larger than the difference between most values in the dataset.",
          strategyTitle: "Step 3: Mean and SD",
        },
        {
          expression:
            "\\text{Report median (IQR): median=(48+50)/2=49, IQR=15.5}",
          annotation:
            "The distribution is right-skewed (one outlier at 320). Median (49) and IQR (15.5) give an honest picture: the middle 50% of households earn $41k–$56.5k, with a center around $49k. The mean ($74.5k) and SD ($86.1k) are badly distorted by the one outlier.",
          strategyTitle: "Step 4: Which to report",
        },
      ],
    },
    {
      id: "stat3-002-ex3",
      title: "Apply the Empirical Rule",
      difficulty: "medium",
      problem:
        "Bolt diameters are normally distributed with mean 10.00 mm and SD 0.02 mm. Bolts outside [9.94, 10.06] mm are defective. What percentage of bolts are defective?",
      steps: [
        {
          expression: "\\text{Defect range: below 9.94 or above 10.06}",
          annotation: "Defective bolts are those outside the specified range.",
          strategyTitle: "Step 1: Identify range",
        },
        {
          expression:
            "\\frac{10.06 - 10.00}{0.02} = \\frac{0.06}{0.02} = 3 \\text{ SDs above mean}",
          annotation:
            "10.06 is exactly 3 standard deviations above the mean. Symmetrically, 9.94 is 3 SDs below.",
          strategyTitle: "Step 2: Convert to SDs",
        },
        {
          expression: "\\text{Empirical Rule: 99.7\\% of values within 3 SD}",
          annotation:
            "99.7% of bolts are within ±3 SD of the mean → within [9.94, 10.06]. These are acceptable.",
          strategyTitle: "Step 3: Apply rule",
        },
        {
          expression: "\\text{Defective: } 100\\% - 99.7\\% = 0.3\\%",
          annotation:
            "0.3% of bolts are outside ±3 SDs and are defective. For a production run of 100,000 bolts, that is 300 defective bolts.",
          strategyTitle: "Step 4: Defect rate",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat3-002-ch1",
      title: "Add a data point to hit a target SD",
      difficulty: "hard",
      problem:
        "Dataset: [6, 8, 10]. The sample SD is approximately 2.00. You add a 4th value. (a) Adding x=10: does SD increase, decrease, or stay the same? (b) Adding x=100: what happens? (c) Adding x=8 (the mean): what is the new SD?",
      walkthrough: [
        {
          expression:
            "\\bar{x}_3 = 8, \\quad s_3 = \\sqrt{\\frac{(6-8)^2+(8-8)^2+(10-8)^2}{2}} = \\sqrt{4} = 2.00",
          annotation: "Baseline: mean=8, SD=2.00 for the original 3 values.",
        },
        {
          expression: "\\text{Add x=10: new mean} = (6+8+10+10)/4 = 34/4 = 8.5",
          annotation:
            "Mean shifts to 8.5. Now compute new SD with n=4 and x̄=8.5.",
        },
        {
          expression:
            "s_{4,x=10} = \\sqrt{\\frac{(6-8.5)^2+(8-8.5)^2+(10-8.5)^2+(10-8.5)^2}{3}} = \\sqrt{\\frac{6.25+0.25+2.25+2.25}{3}} = \\sqrt{3.667} \\approx 1.91",
          annotation:
            "SD decreased slightly (2.00 → 1.91) because adding 10 (which is at the right edge) reduces the gap for the existing right extreme. Adding values near the mean tends to decrease or maintain SD; adding extreme values increases it.",
        },
        {
          expression:
            "\\text{Add x=100: new mean} = (6+8+10+100)/4 = 31, \\quad s \\approx 43.0",
          annotation:
            "SD explodes to ~43 because 100 is far from the new mean of 31. One extreme outlier dramatically increases SD.",
        },
        {
          expression:
            "\\text{Add x=8 (current mean): new mean} = (6+8+10+8)/4 = 8",
          annotation:
            'Mean unchanged. New SS = (6-8)²+(8-8)²+(10-8)²+(8-8)² = 4+0+4+0 = 8. New s² = 8/3 ≈ 2.67. s ≈ 1.63. SD decreased because adding the mean value is a perfectly "average" point.',
        },
      ],
      answer:
        "(a) Adding x=10: SD decreases slightly (1.91). (b) Adding x=100: SD explodes to ~43. (c) Adding x=8: SD decreases to 1.63.",
    },
    {
      id: "stat3-002-ch2",
      title: "CV for comparing variability across different scales",
      difficulty: "medium",
      problem:
        "Stock A: mean price $12, SD $2.40. Stock B: mean price $350, SD $52.50. Which stock is more volatile relative to its price?",
      walkthrough: [
        {
          expression:
            "CV_A = \\frac{s_A}{\\bar{x}_A} \\times 100\\% = \\frac{2.40}{12} \\times 100\\% = 20\\%",
          annotation:
            "Stock A: CV = 20%. For every $12 of mean price, the typical swing is $2.40.",
        },
        {
          expression:
            "CV_B = \\frac{s_B}{\\bar{x}_B} \\times 100\\% = \\frac{52.50}{350} \\times 100\\% = 15\\%",
          annotation:
            "Stock B: CV = 15%. For every $350 of mean price, the typical swing is $52.50.",
        },
        {
          expression:
            "\\text{Stock A (CV=20\\%) is more volatile than Stock B (CV=15\\%) relative to price}",
          annotation:
            "Raw SDs ($2.40 vs. $52.50) suggest B is more volatile. But relative to their own prices, A swings 20% while B swings 15% — A is actually more volatile. CV enables this apples-to-apples comparison.",
        },
      ],
      answer:
        "Stock A (CV=20%) is more volatile relative to its price than Stock B (CV=15%), even though Stock B has a larger absolute standard deviation.",
    },
    ,
    {
      id: "stat3-002-ch3",
      title: "Applied Data Challenge",
      difficulty: "hard",
      problem:
        "Use a CSV dataset from data/applied-statistics, apply this lesson's core method, and report one result plus one limitation.",
      walkthrough: [
        {
          expression: "Import -> clean -> compute -> interpret",
          annotation: "Show each stage and justify one design choice.",
        },
      ],
      answer:
        "A complete response includes a reproducible computation, contextual interpretation, and a limitation statement tied to assumptions.",
    },
  ],

  definitions: [
    {
      term: "range",
      definition:
        "max − min; the simplest spread measure. Fragile: a single outlier can change it dramatically.",
    },
    {
      term: "interquartile range (IQR)",
      definition:
        "Q3 − Q1; the spread of the middle 50% of the data. Resistant to outliers; paired with the median for skewed distributions.",
    },
    {
      term: "variance (s²)",
      definition:
        "The average squared deviation from the mean: s² = Σ(xᵢ − x̄)² / (n−1). In squared units of the original data; unbiased estimator of the population variance σ².",
    },
    {
      term: "standard deviation (s)",
      definition:
        "The square root of variance; the typical distance a data point lies from the mean, in the original units. Sensitive to outliers; paired with the mean for symmetric data.",
    },
    {
      term: "coefficient of variation (CV)",
      definition:
        "CV = (s / x̄) × 100%; standard deviation expressed as a percentage of the mean. Allows comparison of spread across datasets with different units or scales.",
    },
  ],

  semantics: {
    core: [
      {
        symbol: "s",
        meaning:
          "Sample standard deviation = √(Σ(xᵢ−x̄)²/(n−1)). Typical distance from mean.",
      },
      {
        symbol: "s^2",
        meaning: "Sample variance = Σ(xᵢ−x̄)²/(n−1). SD squared.",
      },
      {
        symbol: "\\sigma",
        meaning:
          "Population standard deviation (uses N in denominator, not n−1).",
      },
      {
        symbol: "\\text{IQR} = Q3 - Q1",
        meaning:
          "Interquartile range. Spread of middle 50%. Resistant to outliers.",
      },
      {
        symbol: "CV = s/\\bar{x} \\times 100\\%",
        meaning:
          "Coefficient of variation. SD as % of mean. Unit-free, enables cross-scale comparison.",
      },
      {
        symbol: "\\bar{x} \\pm 2s",
        meaning:
          "Empirical rule: ~95% of values for approximately normal distributions.",
      },
    ],
    rulesOfThumb: [
      "Use SD with mean (symmetric data, no outliers).",
      "Use IQR with median (skewed data or outliers present).",
      "Range = quick check only; fragile to single outliers.",
      "CV for comparing variability across different scales or units.",
      "Empirical rule (68-95-99.7) applies to approximately normal distributions only.",
      "n−1 denominator for sample; N denominator for population.",
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      {
        lessonId: "stat3-003",
        label: "Percentiles and Quartiles",
        note: "Q1 and Q3 needed for IQR are defined precisely in stat3-003.",
      },
      {
        lessonId: "stat3-004",
        label: "Boxplots",
        note: "Boxplots visualize the five-number summary: min, Q1, median, Q3, max, and use 1.5×IQR for outlier detection.",
      },
      {
        lessonId: "stat6-001",
        label: "Inferential Statistics",
        note: "Standard error = SD / √n — the key ingredient in confidence intervals and hypothesis tests.",
      },
    ],
  },

  checkpoints: [
    {
      id: "cp-stat3-002-1",
      label:
        "Read: list the four measures of spread and their paired center measures",
      type: "read",
    },
    {
      id: "cp-stat3-002-2",
      label: "Read: explain why the denominator is n−1 for sample variance",
      type: "read",
    },
    {
      id: "cp-stat3-002-3",
      label:
        "Apply example 1: compute SD for [4,7,7,10,12] step by step before reading",
      type: "example",
    },
    {
      id: "cp-stat3-002-4",
      label:
        "Lab: run cell 1 and describe why Clinic B's SD is much larger than Clinic A's",
      type: "lab",
    },
    {
      id: "cp-stat3-002-5",
      label:
        "Apply example 3: set up the Empirical Rule calculation before reading the answer",
      type: "example",
    },
    {
      id: "cp-stat3-002-6",
      label:
        "Lab: run cell 2 and verify the 68-95-99.7 rule holds for the simulated data",
      type: "lab",
    },
    {
      id: "cp-stat3-002-7",
      label:
        "Attempt challenge 2: compute CV for both stocks and determine which is more volatile",
      type: "challenge",
    },
    {
      id: "cp-stat3-002-8",
      label:
        "Read: state the matched-pairs rule for center and spread reporting",
      type: "read",
    },
  ],

  assessment: {
    questions: [
      {
        id: "stat3-002-assess-1",
        type: "choice",
        text: "A dataset has one extreme outlier on the right. Which pair of statistics is most appropriate to report?",
        options: [
          "Mean and standard deviation",
          "Median and IQR",
          "Mean and range",
          "Mode and variance",
        ],
        answer: "Median and IQR",
        instructions:
          "Outliers distort both the mean and SD. The median and IQR are resistant to outliers.",
      },
    ],
  },

  quiz: [
    {
      id: "stat3-002-quiz-1",
      type: "choice",
      text: "The sample standard deviation formula uses n−1 in the denominator (instead of n) because:",
      options: [
        "It makes the formula simpler",
        "Sample deviations are computed from x̄ (not μ), using up one degree of freedom and creating a downward bias if n is used",
        "The standard deviation is larger than the variance",
        "n−1 is only used for samples smaller than 30",
      ],
      answer:
        "Sample deviations are computed from x̄ (not μ), using up one degree of freedom and creating a downward bias if n is used",
      hints: [
        'The sample mean x̄ was estimated from the data — this "uses up" one degree of freedom.',
        "Bessel's correction: dividing by n−1 makes s² an unbiased estimator of σ².",
      ],
      reviewSection: "Insight callout — Why Divide by n−1, Not n?",
    },
    {
      id: "stat3-002-quiz-2",
      type: "choice",
      text: "Which measure of spread is most resistant to outliers?",
      options: ["Range", "Standard deviation", "Variance", "IQR"],
      answer: "IQR",
      hints: [
        "Range uses only the minimum and maximum — both affected by outliers.",
        "IQR uses only Q1 and Q3 — values in the middle 50%.",
      ],
      reviewSection: 'Intuition → "IQR: spread of the middle 50%" paragraph',
    },
    {
      id: "stat3-002-quiz-3",
      type: "choice",
      text: "For an approximately normal distribution with mean 100 and SD 15, about what percentage of values fall between 70 and 130?",
      options: ["68%", "95%", "99.7%", "50%"],
      answer: "95%",
      hints: [
        "70 = 100 − 2(15) and 130 = 100 + 2(15). How many SDs from the mean are these?",
        "Empirical rule: within 2 SDs → ~95%.",
      ],
      reviewSection: "Math section — Empirical Rule (68-95-99.7 Rule)",
    },
    {
      id: "stat3-002-quiz-4",
      type: "choice",
      text: "Dataset [5, 5, 5, 5, 5] has a standard deviation of:",
      options: ["1", "5", "0", "25"],
      answer: "0",
      hints: [
        "All values equal the mean. Every deviation is 0.",
        "SD = 0 means all values are identical — no spread.",
      ],
      reviewSection: "Procedure: Computing Sample Standard Deviation",
    },
    {
      id: "stat3-002-quiz-5",
      type: "choice",
      text: "For independent random variables X and Y, Var(X + Y) equals:",
      options: [
        "Var(X) × Var(Y)",
        "Var(X) + Var(Y)",
        "SD(X) + SD(Y)",
        "SD(X)² + SD(Y)²",
      ],
      answer: "Var(X) + Var(Y)",
      hints: [
        "Variances add for independent variables. Standard deviations do NOT add.",
        "SD(X+Y) = √(Var(X) + Var(Y)), not SD(X) + SD(Y).",
      ],
      reviewSection: "Math section — Combining variances",
    },
    {
      id: "stat3-002-quiz-6",
      type: "choice",
      text: "Stock X has mean price $100 and SD $25. Stock Y has mean price $2,000 and SD $400. Which is more volatile relative to its price?",
      options: [
        "Stock X (CV = 25%)",
        "Stock Y (CV = 20%)",
        "They are equally volatile",
        "Cannot determine from this information",
      ],
      answer: "Stock X (CV = 25%)",
      hints: [
        "Compute CV = SD/mean × 100% for each.",
        "CV_X = 25/100 = 25%. CV_Y = 400/2000 = 20%.",
      ],
      reviewSection: "Challenge 2 — CV for comparing variability",
    },
    {
      id: "stat3-002-quiz-7",
      type: "choice",
      text: "Dataset A: [10, 10, 10, 10, 10]. Dataset B: [0, 5, 10, 15, 20]. Both have mean 10. Which has the larger standard deviation?",
      options: [
        "Dataset A (all values equal the mean, so SD is large)",
        "Dataset B (values spread from 0 to 20)",
        "Both have the same standard deviation",
        "Cannot be determined without the sample size",
      ],
      answer: "Dataset B (values spread from 0 to 20)",
      hints: [
        "When every value equals the mean, all deviations are zero → SD = 0.",
        "Dataset A has zero spread; Dataset B has deviations of ±10, ±5, 0 from the mean.",
      ],
      reviewSection:
        'Intuition → "Before reading on, predict" — Dataset A vs. Dataset B',
    },
    {
      id: "stat3-002-quiz-8",
      type: "choice",
      text: "By the Empirical Rule, approximately what percentage of values fall within 2 standard deviations of the mean for a normal distribution?",
      options: ["50%", "68%", "95%", "99.7%"],
      answer: "95%",
      hints: [
        "The 68-95-99.7 rule: ±1σ → 68%, ±2σ → 95%, ±3σ → 99.7%.",
        "Two standard deviations covers most, but not almost all, of the normal distribution.",
      ],
      reviewSection: "Math section — Empirical Rule (68-95-99.7 Rule)",
    },
    {
      id: "stat3-002-quiz-9",
      type: "choice",
      text: "The sample variance formula uses n − 1 in the denominator (instead of n) because:",
      options: [
        "It gives a smaller value that is easier to interpret",
        "The sample mean was estimated from the same data, consuming one degree of freedom; n−1 corrects the systematic underestimate",
        "n − 1 is always larger than n, making the variance estimate more conservative",
        "It makes the formula match the population variance formula",
      ],
      answer:
        "The sample mean was estimated from the same data, consuming one degree of freedom; n−1 corrects the systematic underestimate",
      hints: [
        "Deviations (xᵢ − x̄) always sum to zero — so the last deviation is determined by the others.",
        "With only n−1 independent pieces of deviation information, dividing by n−1 makes s² unbiased.",
      ],
      reviewSection: 'Intuition → "Why Divide by n−1, Not n?" callout',
    },
    {
      id: "stat3-002-quiz-10",
      type: "choice",
      text: "Which spread measure is correctly paired with the median as a center summary?",
      options: [
        "Standard deviation",
        "Variance",
        "Interquartile range (IQR)",
        "Coefficient of variation",
      ],
      answer: "Interquartile range (IQR)",
      hints: [
        "Mean + SD go together for symmetric data. What goes with the median?",
        "IQR and median are both resistant (robust) to outliers — they form a natural pair for skewed data.",
      ],
      reviewSection: 'Intuition → "Matched Pairs: Center and Spread" callout',
    },
  ],

  misconceptions: [
    {
      falseBelief: "Standard deviation and variance are the same thing.",
      whyStudentsThinkIt:
        "Both measure spread, both use the same deviations. Students confuse two steps of the same calculation.",
      correctionExample:
        "For [4,7,7,10,12]: variance = 9.5 (in units²), SD = √9.5 ≈ 3.08 (in original units). If data is in dollars, variance is in dollars² — a meaningless unit. SD returns to dollars and can be compared directly to the data.",
      contrastCase:
        "Variance has better algebraic properties (Var(X+Y) = Var(X)+Var(Y) for independent X,Y). SD is easier to interpret (same units as data). Both are used — variance in derivations, SD in interpretation.",
    },
    {
      falseBelief:
        "A small standard deviation is always better than a large one.",
      whyStudentsThinkIt:
        "Students associate small SD with precision and large SD with messiness.",
      correctionExample:
        "A portfolio manager who wants diversification may prefer high-SD assets that are negatively correlated. A quality control process monitoring bolt diameters wants small SD (precision). A researcher studying income inequality wants to accurately measure and report the large SD — reducing SD by ignoring high earners would be unethical and misleading.",
      contrastCase:
        "Small SD = high consistency, which is desirable for manufacturing tolerances, wait times, and medical dosing. Large SD is not intrinsically bad — it accurately describes a variable with high natural variability.",
    },
    {
      falseBelief:
        "You can always use the Empirical Rule (68-95-99.7) for any dataset.",
      whyStudentsThinkIt:
        "The rule is taught as a general fact about standard deviations.",
      correctionExample:
        "A right-skewed income distribution: mean=$52k, SD=$30k. The rule would predict ~16% of incomes are below mean−SD = $22k. But if income is right-skewed, much more than 16% may be in the low range. The Empirical Rule only applies to approximately normal (bell-shaped, symmetric) distributions.",
      contrastCase:
        "Chebyshev's inequality is the non-parametric alternative: at least 1 − 1/k² of any distribution lies within k SDs of the mean. For k=2, at least 75% (not the 95% of the normal). The Empirical Rule gives tighter bounds but only for normal distributions.",
    },
  ],

  transferPrompts: [
    {
      situation:
        "A hospital monitors the time it takes to initiate emergency treatment for stroke patients. Target: mean ≤ 60 minutes, SD ≤ 10 minutes. This month: mean = 58 minutes, SD = 24 minutes.",
      competingTechniques: [
        "Report only the mean (58 ≤ 60, target met)",
        "Report both mean and SD with the Empirical Rule implication",
        "Report median and IQR since timing data is often right-skewed",
      ],
      whyThisTechniqueWins:
        "Report SD alongside mean: the mean (58 min) technically meets the ≤60 target, but SD=24 means roughly 16% of patients are treated after 82 minutes (58+24) and some are much later (outliers). These extreme delays are the life-threatening cases. Reporting only the mean would imply the target is met, which is operationally misleading. The SD reveals that the process is dangerously inconsistent. For medical operations, both targets (mean AND SD) must be met.",
    },
    {
      situation:
        'Two classrooms take the same math test. Room A: all scores 75–85, tight distribution. Room B: scores ranging from 30 to 100, very spread out. A parent asks: "Which class is performing better?"',
      competingTechniques: [
        "Compare only the means",
        "Compare means and standard deviations",
        "Compare median and IQR for each class",
      ],
      whyThisTechniqueWins:
        'Compare both mean and SD (and ideally a histogram): Room A and B might have the same mean (say 79). But Room A (SD≈3) has consistently strong performance — everyone mastered the material. Room B (SD≈18) has a bimodal situation: some students excelling and others struggling severely. The "better class" depends on the goal — Room A for uniform mastery, Room B for identifying high achievers. Without spread, you miss the entire story.',
    },
  ],

  debugging: [
    {
      commonError: "SD computed using n instead of n−1.",
      symptom:
        "Your SD is slightly too small compared to a reference calculation (e.g., pandas std()).",
      whyItHappened:
        "Dividing SS by n (population formula) instead of n−1 (sample formula) systematically underestimates the population standard deviation. For n=5: dividing by 5 vs. 4 makes a 11.8% difference in the variance.",
      repairStrategy:
        'For sample SD: `s = (sum((x-xbar)**2 for x in data) / (n-1))**0.5`. For population SD: `sigma = (sum((x-mu)**2 for x in data) / n)**0.5`. In pandas: `df["col"].std()` uses n−1 (sample) by default; `df["col"].std(ddof=0)` uses n (population).',
    },
    {
      commonError:
        "Adding standard deviations directly instead of combining variances.",
      symptom:
        "For independent X (SD=3) and Y (SD=4), you report SD(X+Y) = 3+4 = 7 instead of 5.",
      whyItHappened:
        "Students see variances add and mistakenly apply the same rule to SDs.",
      repairStrategy:
        "SD(X+Y) = √(Var(X) + Var(Y)) = √(3² + 4²) = √(9+16) = √25 = 5. Never add SDs directly — square them first (convert to variances), add the variances, then take the square root.",
    },
  ],

  mastery: {
    targetLevel:
      "Apply (Level 3) — compute range, IQR, variance, and SD for a given dataset; choose the correct spread measure for a given distribution; apply the Empirical Rule to find percentages within k SDs.",
    solveIndependently:
      "Given a small dataset, compute all four spread measures (range, IQR, variance, SD) showing every step, and justify which to report based on the distribution shape.",
    explainVerbally:
      "Explain why n−1 is used in the sample variance formula and why the Empirical Rule only applies to normal distributions.",
    detectIncorrectApplication:
      "Identify errors when: (1) SD is reported alongside a highly skewed distribution; (2) SDs are added directly; (3) Empirical Rule is applied to a right-skewed dataset.",
    transferToUnfamiliar:
      "Given a novel dataset (manufacturing tolerances, financial returns, biological measurements), select mean±SD or median+IQR, apply the Empirical Rule if appropriate, and report a one-sentence characterization of the spread.",
  },
};
