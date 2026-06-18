export default {
  id: "stat3-003",
  slug: "percentiles-and-quartiles",
  chapter: "stat3",
  order: 3,
  title: "Percentiles and Quartiles",
  subtitle:
    "Locating a value within a distribution — ranks, quartiles, and z-scores.",
  tags: [
    "percentile",
    "quartile",
    "Q1",
    "Q2",
    "Q3",
    "z-score",
    "standardization",
    "rank",
    "cumulative frequency",
  ],
  aliases:
    "percentile quartile Q1 Q2 Q3 z-score standardize rank cumulative frequency interquartile range percentile rank percentile score",
  timeToComplete: 35,
  coreConcept:
    "The pth percentile is the value below which p% of the data falls. Quartiles divide data into four equal groups. The z-score standardizes any value relative to the mean and SD, expressing how many standard deviations it is above or below average. Together these tools locate a single value within its distribution.",
  prerequisites: ["stat3-001", "stat3-002"],
  nextLesson: "stat3-004",

  hook: {
    question:
      "A student scores 78 on a math test. The class mean is 72 and SD is 8. Another student scores 82 on a science test where the class mean is 75 and SD is 14. Who performed better relative to their class?",
    realWorldContext:
      "The math student (78) is (78−72)/8 = 0.75 SDs above the mean. The science student (82) is (82−75)/14 = 0.50 SDs above the mean. Despite a lower raw score, the math student outperformed their class by more. This is the power of standardization: raw scores are incomparable across different tests, but z-scores allow direct comparison by expressing each score relative to its own distribution. This same principle is used in college admissions (SAT, ACT), sports analytics (comparing players across eras), and medical diagnostics (how far is a patient's lab result from the normal range?).",
  },

  intuition: {
    prose: [
      "**Percentile: location in a distribution.** The pth percentile is the value in a sorted dataset below which p% of the observations fall. The 25th percentile (Q1) means 25% of values are below it. The 50th percentile (Q2, median) means 50% are below. The 75th percentile (Q3) means 75% are below. If you score at the 90th percentile on a standardized test, you scored higher than 90% of test-takers — your raw score matters less than your relative position.",
      "**How to find a percentile.** For a sorted dataset of n values, the position of the pth percentile is $L = (p/100) \\times n$. If L is a whole number, the percentile is the average of the Lth and (L+1)th values. If L is not a whole number, round up to the next whole number position.\n\nExample: 10 values, p=25. L = (25/100) × 10 = 2.5. Round up to 3. The 25th percentile is the 3rd value in the sorted list.",
      "**Before reading on, predict:** Dataset [5, 8, 10, 12, 14, 15, 18, 22, 25, 30] (n=10). What are Q1, Q2, Q3? (Hint: use the formula L = (p/100) × n.)",
      "**Quartiles divide data into four equal groups.** Q1 = 25th percentile (1st quartile). Q2 = 50th percentile (median, 2nd quartile). Q3 = 75th percentile (3rd quartile). The four groups are: [min, Q1], (Q1, Q2], (Q2, Q3], (Q3, max]. Each contains (approximately) 25% of the data. IQR = Q3 − Q1.",
      "**Z-score: standardized position.** The z-score of an observation x in a distribution with mean μ (or x̄) and SD σ (or s) is $z = (x - \\mu)/\\sigma$. It measures how many standard deviations x is from the mean: z = 0 means exactly at the mean; z = +2 means 2 SDs above; z = −1.5 means 1.5 SDs below. Z-scores are dimensionless (no units) — this is why they enable comparison across different scales and distributions.",
      "**Using z-scores to find percentiles (for normal distributions).** If the distribution is approximately normal, a z-score table (or the empirical rule) converts z to a cumulative percentage. z = 0 → 50th percentile. z = +1 → 84th percentile. z = +2 → 97.7th percentile. z = −1 → 16th percentile. This connection between z-scores and percentiles requires normality — for non-normal distributions, z-scores measure position but cannot be directly converted to percentiles without more information.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Find Q1, Q2, Q3 for n data points",
        body: "Step 1. Sort the data in ascending order.\n\nStep 2. Q2 (median): find the middle value. If n is odd: median = value at position (n+1)/2. If n is even: median = average of values at positions n/2 and n/2+1.\n\nStep 3. Q1: apply the same median procedure to the lower half of the data (values below Q2, not including Q2 itself if n is odd).\n\nStep 4. Q3: apply the median procedure to the upper half of the data (values above Q2).\n\nNote: Different software and textbooks use slightly different quartile algorithms (pandas uses linear interpolation). For hand calculations and exams, use the split-at-median approach above.",
      },
      {
        type: "insight",
        title: "Why Z-Scores Enable Comparison",
        body: 'A z-score is a linear transformation that shifts and scales any distribution to have mean = 0 and SD = 1. Specifically: z = (x − μ)/σ. After this transformation:\n- The new mean is 0 (because shifting by −μ moves the center to 0)\n- The new SD is 1 (because dividing by σ scales the spread to 1)\n\nThis is called standardization. Any dataset can be standardized. Comparing z-scores is equivalent to asking: "In units of typical variability, how far is this value from the center?"\n\nKey property: z-scores are unit-free. A z-score of +2 means the same thing whether the original data was in dollars, centimeters, or seconds.',
      },
      {
        type: "warning",
        title: "Percentile Interpolation — Software Differences",
        body: "Different software implementations of percentiles give slightly different answers for small datasets:\n\n- pandas `quantile(0.25)` uses linear interpolation between adjacent values.\n- Excel PERCENTILE uses a similar interpolation.\n- Hand calculation (splitting at median) may give a different Q1 value.\n\nFor a dataset [2, 4, 6, 8, 10] (n=5):\n- Hand calculation: Q1 = value at position L=(25/100)×5=1.25, rounded up to 2 → Q1=4\n- pandas: Q1 = 3.0 (linear interpolation between 2 and 4)\n\nFor this course, use the sorted-split method for hand calculations. Acknowledge that software may give slightly different values for small n — this is expected.",
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Z-score formula and interpretation.** $z = \\frac{x - \\mu}{\\sigma}$. The z-score is signed: positive means above mean, negative means below. |z| measures the number of SDs from mean. For a normal distribution, the cumulative probability $P(Z \\leq z) = \\Phi(z)$ is the z-table or `scipy.stats.norm.cdf(z)`. For example: $\\Phi(1.96) = 0.975$, meaning P(Z ≤ 1.96) = 97.5%, so 1.96 SDs above the mean corresponds to the 97.5th percentile.",
      '**Five-number summary.** The five-number summary {min, Q1, median, Q3, max} concisely describes a distribution\'s center, spread, and extremes. Combined with the mean and SD, these seven numbers (often called the "seven-number summary") give a complete basic description of a quantitative variable.',
      '**Percentile rank.** Given a dataset of n values, the percentile rank of value x is $\\frac{\\text{(number of values} < x)}{n} \\times 100\\%$ (or, in some definitions, including x: $\\frac{\\text{number of values} \\leq x}{n} \\times 100\\%$). Percentile rank answers: "What percentage of the data is below this value?"',
    ],
  },

  rigor: {
    prose: [
      '**R1 — Quartile algorithms.** There are at least three common methods for computing quartiles (Tukey/inclusive median method, exclusive median method, linear interpolation). These agree closely for large n but may give noticeably different Q1/Q3 values for small n (n<20). The method described in the procedure callout is the exclusive median method (standard in introductory statistics). Python pandas uses linear interpolation (method="linear") by default, equivalent to the Type 7 algorithm in the 9 algorithms defined in Hyndman & Fan (1996).',
      '**R2 — Outlier flagging with quartiles.** The Tukey fence rule for outliers is: values below Q1 − 1.5×IQR or above Q3 + 1.5×IQR are flagged as potential outliers. This rule has a theoretical justification: for normally distributed data, less than 0.7% of values fall outside these fences. Values outside Q1 − 3×IQR or Q3 + 3×IQR are called "far outliers" (less than 0.05% of normal data). These thresholds are heuristics, not absolute rules — domain knowledge should guide outlier decisions.',
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: "stat3-003-cell-1",
        type: "python",
        cellTitle: "Compute quartiles and percentiles manually",
        code: `# Exam scores for 12 students
scores = [62, 70, 74, 77, 78, 80, 82, 85, 88, 90, 93, 97]
n = len(scores)
sorted_scores = sorted(scores)

# Q2 (median) — n=12, even
q2 = (sorted_scores[n//2 - 1] + sorted_scores[n//2]) / 2

# Q1 — median of lower half (first 6 values)
lower = sorted_scores[:n//2]
q1 = (lower[len(lower)//2 - 1] + lower[len(lower)//2]) / 2

# Q3 — median of upper half (last 6 values)
upper = sorted_scores[n//2:]
q3 = (upper[len(upper)//2 - 1] + upper[len(upper)//2]) / 2

iqr = q3 - q1
lower_fence = q1 - 1.5 * iqr
upper_fence = q3 + 1.5 * iqr

print(f"Five-number summary:")
print(f"  Min = {min(scores)}, Q1 = {q1}, Median = {q2}, Q3 = {q3}, Max = {max(scores)}")
print(f"  IQR = {iqr}")
print(f"  Outlier fences: ({lower_fence:.1f}, {upper_fence:.1f})")
print(f"  Outliers: {[x for x in scores if x < lower_fence or x > upper_fence]}")
`,
        instructions:
          "Check: are there any outliers in this dataset? Compute (Q1 - 1.5×IQR) and (Q3 + 1.5×IQR). Any values outside these fences would be flagged.",
      },
      {
        id: "stat3-003-cell-2",
        type: "python",
        cellTitle: "Z-scores: comparing across distributions",
        code: `# Comparing two student performances (from the hook)
math_score  = 78;  math_mean  = 72;  math_sd  = 8
sci_score   = 82;  sci_mean   = 75;  sci_sd   = 14

z_math = (math_score - math_mean) / math_sd
z_sci  = (sci_score  - sci_mean)  / sci_sd

print(f"Math:    raw={math_score}, z={z_math:.3f}")
print(f"Science: raw={sci_score},  z={z_sci:.3f}")
print(f"Better relative performance: {'Math' if z_math > z_sci else 'Science'}")
print()

# Standardize a full dataset to z-scores
import pandas as pd
scores = [62, 70, 74, 77, 78, 80, 82, 85, 88, 90, 93, 97]
mean_s = sum(scores)/len(scores)
sd_s = (sum((x-mean_s)**2 for x in scores)/(len(scores)-1))**0.5

z_scores = [(x - mean_s)/sd_s for x in scores]
print("Original → Z-score:")
for orig, z in zip(scores, z_scores):
    print(f"  {orig} → {z:+.2f}")
`,
        instructions:
          "After standardization, the z-scores should have mean ≈ 0 and SD ≈ 1. Verify this. Also note: which original scores correspond to positive z-scores (above mean) and which to negative?",
      },
    ],
  },

  examples: [
    {
      id: "stat3-003-ex1",
      title: "Find quartiles for a small dataset",
      difficulty: "easy",
      problem:
        "Dataset: [3, 7, 8, 10, 12, 14, 17, 21, 25, 30] (n=10). Find Q1, Q2, Q3, IQR.",
      steps: [
        {
          expression:
            "\\text{Already sorted: } [3, 7, 8, 10, 12, 14, 17, 21, 25, 30]",
          annotation: "Data is already in ascending order.",
          strategyTitle: "Step 1: Sort",
        },
        {
          expression:
            "Q2 = \\frac{x_{(5)} + x_{(6)}}{2} = \\frac{12 + 14}{2} = 13",
          annotation:
            "n=10 (even). Q2 = average of 5th and 6th values = (12+14)/2 = 13.",
          strategyTitle: "Step 2: Q2 (median)",
        },
        {
          expression: "\\text{Lower half: } [3, 7, 8, 10, 12]",
          annotation: "First 5 values (below median).",
          strategyTitle: "Step 3: Split",
        },
        {
          expression: "Q1 = x_{(3)} = 8 \\text{ (middle of lower half)}",
          annotation: "Lower half has 5 values; middle is position 3. Q1 = 8.",
          strategyTitle: "Step 4: Q1",
        },
        {
          expression:
            "\\text{Upper half: } [14, 17, 21, 25, 30]; \\quad Q3 = x_{(3)} = 21",
          annotation: "Upper half has 5 values; middle is position 3. Q3 = 21.",
          strategyTitle: "Step 5: Q3",
        },
        {
          expression: "IQR = Q3 - Q1 = 21 - 8 = 13",
          annotation:
            "The middle 50% of the data spans from 8 to 21, a range of 13 units.",
          strategyTitle: "Step 6: IQR",
        },
      ],
    },
    {
      id: "stat3-003-ex2",
      title: "Compute and interpret z-scores",
      difficulty: "medium",
      problem:
        "Adult heights in a population are normally distributed with mean 68 inches and SD 3 inches. (a) Find the z-score for a person who is 74 inches tall. (b) Find the z-score for a person who is 62 inches tall. (c) What height corresponds to z = +1.5?",
      steps: [
        {
          expression: "z_{74} = \\frac{74 - 68}{3} = \\frac{6}{3} = +2.00",
          annotation:
            "A person 74 inches tall is 2 standard deviations above the mean. For a normal distribution, this is about the 97.7th percentile.",
          strategyTitle: "(a) z for 74 inches",
        },
        {
          expression: "z_{62} = \\frac{62 - 68}{3} = \\frac{-6}{3} = -2.00",
          annotation:
            "A person 62 inches tall is 2 standard deviations below the mean. About the 2.3rd percentile.",
          strategyTitle: "(b) z for 62 inches",
        },
        {
          expression:
            "x = \\mu + z \\cdot \\sigma = 68 + 1.5 \\times 3 = 68 + 4.5 = 72.5 \\text{ inches}",
          annotation:
            "Reverse the z-score formula: x = μ + z×σ. A z-score of +1.5 corresponds to 72.5 inches — about the 93rd percentile for a normal distribution.",
          strategyTitle: "(c) Height for z = +1.5",
        },
      ],
    },
    {
      id: "stat3-003-ex3",
      title: "Percentile rank",
      difficulty: "easy",
      problem:
        "Class exam scores: [55, 62, 68, 72, 75, 78, 80, 82, 85, 88, 90, 94]. A student scored 82. What is their percentile rank?",
      steps: [
        {
          expression:
            "\\text{Count values below 82: } 55, 62, 68, 72, 75, 78, 80 \\rightarrow 7 \\text{ values}",
          annotation: "Seven scores are strictly less than 82.",
          strategyTitle: "Step 1: Count below",
        },
        {
          expression:
            "\\text{Percentile rank} = \\frac{7}{12} \\times 100\\% = 58.3\\%",
          annotation:
            "Approximately the 58th percentile. The student scored higher than about 58% of the class.",
          strategyTitle: "Step 2: Compute rank",
        },
        {
          expression:
            "\\text{Interpretation: better than ~58\\% of classmates}",
          annotation:
            'A score of 82 sounds like a "B" grade, but contextually it is a relatively average performance — it is below the class median.',
          strategyTitle: "Step 3: Interpret",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat3-003-ch1",
      title: "Reverse z-score: find the original value",
      difficulty: "medium",
      problem:
        "Weights of cereal boxes are normally distributed with mean 16.00 oz and SD 0.12 oz. (a) What weight corresponds to the 97.5th percentile? (b) What weight corresponds to the 2.5th percentile? (c) What percentage of boxes have weight within [15.76, 16.24] oz?",
      walkthrough: [
        {
          expression: "z_{97.5\\%} \\approx +1.96 \\text{ (from z-table)}",
          annotation:
            "The 97.5th percentile of the standard normal distribution corresponds to z ≈ +1.96. (Exact: 1.959964.)",
        },
        {
          expression:
            "\\text{Weight at 97.5th percentile: } x = 16.00 + 1.96(0.12) = 16.00 + 0.235 = 16.235 \\text{ oz}",
          annotation: "Use x = μ + z×σ.",
        },
        {
          expression:
            "\\text{Weight at 2.5th percentile: } x = 16.00 - 1.96(0.12) = 15.765 \\text{ oz}",
          annotation:
            "By symmetry, z = −1.96 corresponds to the 2.5th percentile.",
        },
        {
          expression:
            "z_{15.76} = (15.76-16.00)/0.12 = -0.24/0.12 = -2.0, \\quad z_{16.24} = (16.24-16.00)/0.12 = +2.0",
          annotation: "15.76 and 16.24 are exactly ±2 SDs from the mean.",
        },
        {
          expression:
            "\\text{Empirical Rule: 95\\% of values within 2 SDs. So 95\\% of boxes are in [15.76, 16.24] oz.}",
          annotation:
            "The interval [15.76, 16.24] spans mean ± 2×SD. By the Empirical Rule, about 95% of normally distributed values fall within 2 SDs.",
        },
      ],
      answer:
        "Weight at 97.5th percentile ≈ 16.24 oz; at 2.5th percentile ≈ 15.77 oz. About 95% of boxes weigh between 15.76 and 16.24 oz.",
    },
    {
      id: "stat3-003-ch2",
      title: "Build the five-number summary and detect outliers",
      difficulty: "medium",
      problem:
        "Delivery times (days): [1, 2, 2, 3, 3, 3, 4, 4, 5, 6, 6, 7, 8, 9, 32]. Find the five-number summary, IQR, outlier fences, and identify outliers.",
      walkthrough: [
        {
          expression:
            "\\text{Sorted (n=15): } [1,2,2,3,3,3,4,4,5,6,6,7,8,9,32]",
          annotation: "Already sorted. n=15 (odd).",
        },
        {
          expression:
            "Q2 = x_{(8)} = 4 \\quad \\text{(middle value at position (15+1)/2 = 8)}",
          annotation: "Median = 4 days.",
        },
        {
          expression:
            "\\text{Lower half: } [1,2,2,3,3,3,4] \\quad Q1 = x_{(4)} = 3",
          annotation:
            "Lower half is the first 7 values (excluding median). Q1 = middle = 4th value = 3.",
        },
        {
          expression:
            "\\text{Upper half: } [5,6,6,7,8,9,32] \\quad Q3 = x_{(4)} = 7",
          annotation:
            "Upper half is the last 7 values. Q3 = middle = 4th value of upper half = 7.",
        },
        {
          expression:
            "IQR = 7 - 3 = 4; \\quad \\text{Lower fence} = 3 - 6 = -3; \\quad \\text{Upper fence} = 7 + 6 = 13",
          annotation:
            "Fences: Q1−1.5×IQR = 3−6 = −3 and Q3+1.5×IQR = 7+6 = 13.",
        },
        {
          expression:
            "\\text{Outlier: 32 > 13 (upper fence). Five-number: {1, 3, 4, 7, 32}}",
          annotation:
            "The value 32 is beyond the upper fence → flagged as outlier. The 32-day delivery is anomalous — worth investigating.",
        },
      ],
      answer:
        "Five-number: {1, 3, 4, 7, 32}. IQR=4. Upper fence=13. Outlier: 32 (32 > 13).",
    },
    ,
    {
      id: "stat3-003-ch3",
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
      term: "percentile",
      definition: "The pth percentile is the value below which p% of the observations in a sorted dataset fall. For example, the 90th percentile is the value below which 90% of the data lies.",
    },
    {
      term: "quartile",
      definition: "One of three values (Q1, Q2, Q3) that divide a sorted dataset into four equal groups. Q1 = 25th percentile, Q2 = 50th percentile (median), Q3 = 75th percentile. IQR = Q3 − Q1.",
    },
    {
      term: "z-score",
      definition: "A standardized score measuring how many standard deviations an observation is from the mean: z = (x − μ)/σ. Positive z means above the mean; negative z means below. Z-scores are dimensionless and enable comparison across different distributions.",
    },
    {
      term: "five-number summary",
      definition: "A concise description of a distribution using five order statistics: {min, Q1, median, Q3, max}. Forms the basis for a boxplot.",
    },
    {
      term: "Tukey fence",
      definition: "Heuristic rule for outlier detection: values below Q1 − 1.5×IQR or above Q3 + 1.5×IQR are flagged as potential outliers. For normally distributed data, fewer than 0.7% of values fall outside these fences.",
    },
    {
      term: "percentile rank",
      definition: "The percentage of values in a dataset that fall below a given value: (number of values < x) / n × 100%. Answers: 'What fraction of the data is below this observation?'",
    },
  ],

  semantics: {
    core: [
      {
        symbol: "Q1, Q2, Q3",
        meaning:
          "25th, 50th, 75th percentiles. Quartiles divide data into four equal groups.",
      },
      {
        symbol: "z = (x - \\mu)/\\sigma",
        meaning:
          "Z-score = number of standard deviations x is from the mean. Dimensionless.",
      },
      {
        symbol: "x = \\mu + z \\cdot \\sigma",
        meaning:
          "Reverse z-score formula: find original value given z, mean, and SD.",
      },
      {
        symbol: "\\text{Lower fence} = Q1 - 1.5 \\times IQR",
        meaning: "Tukey lower outlier threshold.",
      },
      {
        symbol: "\\text{Upper fence} = Q3 + 1.5 \\times IQR",
        meaning: "Tukey upper outlier threshold.",
      },
      {
        symbol: "L = (p/100) \\times n",
        meaning:
          "Percentile position formula. Round up if L is not a whole number.",
      },
    ],
    rulesOfThumb: [
      "Q1 = 25th percentile, Q2 = 50th (median), Q3 = 75th.",
      "Outlier flag: outside Q1−1.5×IQR or Q3+1.5×IQR (Tukey rule).",
      "Z-score enables comparison across distributions (unit-free).",
      "Reverse z-score: x = mean + z × SD.",
      "Z-to-percentile conversion requires normality (use z-table or Empirical Rule).",
      "Different software may give slightly different quartile values for small n — this is expected.",
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      {
        lessonId: "stat3-004",
        label: "Boxplots",
        note: "Boxplots visually display the five-number summary and Tukey outlier fences.",
      },
      {
        lessonId: "stat6-003",
        label: "Confidence Intervals",
        note: "The z-score formula z = (x̄ - μ)/(σ/√n) and z-table percentiles (z=1.96 for 95%) are the basis of confidence intervals.",
      },
      {
        lessonId: "stat5-002",
        label: "Normal Distribution",
        note: "stat5 develops z-to-percentile conversion formally using the standard normal CDF.",
      },
    ],
  },

  checkpoints: [
    {
      id: "cp-stat3-003-1",
      label: "Read: define the pth percentile in your own words",
      type: "read",
    },
    {
      id: "cp-stat3-003-2",
      label:
        "Read: state the procedure for finding Q1, Q2, Q3 by the split-at-median method",
      type: "read",
    },
    {
      id: "cp-stat3-003-3",
      label:
        "Apply example 1: find Q1, Q2, Q3 for [3,7,8,10,12,14,17,21,25,30] before reading",
      type: "example",
    },
    {
      id: "cp-stat3-003-4",
      label:
        "Lab: run cell 1 and verify the outlier fences — are there any outliers in the exam data?",
      type: "lab",
    },
    {
      id: "cp-stat3-003-5",
      label: "Apply example 2: compute all three z-scores before reading",
      type: "example",
    },
    {
      id: "cp-stat3-003-6",
      label:
        "Lab: run cell 2 and verify z-score mean ≈ 0 and SD ≈ 1 after standardization",
      type: "lab",
    },
    {
      id: "cp-stat3-003-7",
      label:
        "Attempt challenge 2: build the five-number summary and find the outlier",
      type: "challenge",
    },
    {
      id: "cp-stat3-003-8",
      label: "Read: explain why z-scores enable cross-distribution comparison",
      type: "read",
    },
  ],

  assessment: {
    questions: [
      {
        id: "stat3-003-assess-1",
        type: "choice",
        text: "A student's z-score on an exam is −1.5. This means the student:",
        options: [
          "Scored 1.5 points below the class average",
          "Scored 1.5 standard deviations below the class mean",
          "Failed the exam",
          "Is at the 1.5th percentile",
        ],
        answer: "Scored 1.5 standard deviations below the class mean",
        instructions:
          "Z-score measures SDs from the mean — not raw points, not percentile (unless we know the distribution shape).",
      },
    ],
  },

  quiz: [
    {
      id: "stat3-003-quiz-1",
      type: "choice",
      text: "For data [2, 5, 7, 9, 11, 14, 16, 20] (n=8), what is Q1?",
      options: ["5", "7", "6", "5.5"],
      answer: "6",
      hints: [
        "n=8: Q2 = (9+11)/2 = 10. Lower half = [2,5,7,9].",
        "Q1 = median of lower half [2,5,7,9] = (5+7)/2 = 6.",
      ],
      reviewSection: "Procedure: Find Q1, Q2, Q3",
    },
    {
      id: "stat3-003-quiz-2",
      type: "choice",
      text: "A value has z = +3.2 in a normal distribution. It is:",
      options: [
        "Very likely (about 32% of data is here)",
        "Very unlikely — beyond 3 SDs, less than 0.1% of normal data",
        "Exactly at the 75th percentile",
        "An error — z-scores cannot exceed 3",
      ],
      answer: "Very unlikely — beyond 3 SDs, less than 0.1% of normal data",
      hints: [
        "The Empirical Rule: 99.7% of normal data is within 3 SDs.",
        "Less than 0.3% total outside 3 SDs → less than 0.15% above z=+3.",
      ],
      reviewSection: "Math section — Z-score formula",
    },
    {
      id: "stat3-003-quiz-3",
      type: "choice",
      text: "The Tukey outlier rule flags values outside Q1 − 1.5×IQR and Q3 + 1.5×IQR. For Q1=40, Q3=60, IQR=20, the upper fence is:",
      options: ["80", "90", "100", "110"],
      answer: "90",
      hints: ["Upper fence = Q3 + 1.5 × IQR.", "60 + 1.5 × 20 = 60 + 30 = 90."],
      reviewSection: "Rigor section — Outlier flagging with quartiles",
    },
    {
      id: "stat3-003-quiz-4",
      type: "choice",
      text: "A test has mean 70 and SD 10. What is the raw score for a student at z = −0.5?",
      options: ["65", "60", "75", "69.5"],
      answer: "65",
      hints: [
        "Reverse z-score formula: x = mean + z × SD.",
        "70 + (−0.5)(10) = 70 − 5 = 65.",
      ],
      reviewSection: "Semantics — x = μ + z × σ",
    },
    {
      id: "stat3-003-quiz-5",
      type: "choice",
      text: "Scoring at the 90th percentile means:",
      options: [
        "You scored 90% correct",
        "Your score is 90 points",
        "You scored higher than 90% of the reference group",
        "Your z-score is 0.90",
      ],
      answer: "You scored higher than 90% of the reference group",
      hints: [
        "Percentile rank is about relative position, not absolute score.",
        "The 90th percentile: 90% of values are below yours.",
      ],
      reviewSection:
        'Intuition → "Percentile: location in a distribution" paragraph',
    },
    {
      id: "stat3-003-quiz-6",
      type: "choice",
      text: "After standardizing a dataset to z-scores, the new mean and SD are:",
      options: [
        "Mean=1, SD=0",
        "Mean=0, SD=1",
        "Mean=original mean, SD=1",
        "Mean=0, SD=original SD",
      ],
      answer: "Mean=0, SD=1",
      hints: [
        "Standardization: z = (x − mean)/SD shifts mean to 0 and scales SD to 1.",
        "This is the definition of the standard normal distribution.",
      ],
      reviewSection: "Insight callout — Why Z-Scores Enable Comparison",
    },
    {
      id: "stat3-003-quiz-7",
      type: "choice",
      text: "The five-number summary consists of:",
      options: [
        "Mean, SD, min, max, n",
        "Min, Q1, median, Q3, max",
        "Q1, Q2, Q3, IQR, range",
        "Min, mean, median, mode, max",
      ],
      answer: "Min, Q1, median, Q3, max",
      hints: [
        "The five-number summary uses five positional statistics (order statistics).",
        "It is the data source for a boxplot — all five are needed to draw one.",
      ],
      reviewSection: "Math section — Five-number summary",
    },
    {
      id: "stat3-003-quiz-8",
      type: "choice",
      text: "Find the median of the sorted dataset [12, 15, 18, 22, 25, 28, 35] (n=7).",
      options: ["18", "22", "25", "20"],
      answer: "22",
      hints: [
        "For odd n, the median is the value at position (n+1)/2.",
        "(7+1)/2 = 4. The 4th value in [12,15,18,22,25,28,35] is 22.",
      ],
      reviewSection: "Procedure callout — Find Q1, Q2, Q3",
    },
    {
      id: "stat3-003-quiz-9",
      type: "choice",
      text: "Q3 is equivalent to which percentile?",
      options: ["50th", "60th", "75th", "90th"],
      answer: "75th",
      hints: [
        "The quartiles divide data at the 25th, 50th, and 75th percentiles.",
        "Q1 = 25th, Q2 = 50th (median), Q3 = 75th.",
      ],
      reviewSection: "Intuition — Quartiles divide data into four equal groups",
    },
    {
      id: "stat3-003-quiz-10",
      type: "choice",
      text: "A dataset has Q1 = 30 and IQR = 20. What is the Tukey lower fence?",
      options: ["0", "−10", "20", "10"],
      answer: "0",
      hints: [
        "Lower fence = Q1 − 1.5 × IQR.",
        "30 − 1.5 × 20 = 30 − 30 = 0.",
      ],
      reviewSection: "Rigor section — Outlier flagging with quartiles",
    },
  ],

  misconceptions: [
    {
      falseBelief:
        "The percentile rank equals the percentage of correct answers.",
      whyStudentsThinkIt:
        'The word "percentile" sounds like "percent" — students confuse the relative measure (position in distribution) with an absolute measure (percent correct).',
      correctionExample:
        "A student answers 72% of questions correctly (raw score 72/100). If everyone else also scored 72%, this student is at the 50th percentile (not the 72nd). Conversely, if the student scored 60% but that was the highest score in the class, they would be at the 100th percentile. Percentile rank is always relative to others — it says nothing about absolute performance.",
      contrastCase:
        'If someone says their GRE score is "in the 94th percentile," they mean they scored higher than 94% of all test-takers. If they say they got "94% correct," they mean they answered 94 out of 100 questions right. Both involve the number 94 but mean completely different things.',
    },
    {
      falseBelief:
        "A z-score of +2 means the same percentile in any distribution.",
      whyStudentsThinkIt:
        "Students learn z=+2 ≈ 97.7th percentile from the normal distribution and apply this to any distribution.",
      correctionExample:
        "For a right-skewed income distribution, z=+2 might correspond to the 92nd percentile (more observations on the right tail than the normal curve predicts). For a bimodal distribution, z=+2 might be in the gap between two modes — actually a less common observation than z=+1. The z→percentile conversion is only valid for approximately normal distributions.",
      contrastCase:
        "For a known normal distribution, z=+2 reliably gives the 97.7th percentile. For income data (always right-skewed), use actual percentile ranks from the data rather than the normal approximation.",
    },
    {
      falseBelief:
        "Quartiles always divide the data into groups of exactly equal size.",
      whyStudentsThinkIt:
        'Students hear "quartiles divide data into four equal groups" and interpret "equal" as "same number of observations."',
      correctionExample:
        "Dataset [1, 2, 3, 4, 5] (n=5). Q1=1.5 (between 1 and 2), Q2=3, Q3=4.5 (between 4 and 5). The four groups are: {1}, {2,3}, {4}, {5} — not equal in count. Quartiles divide the distribution at equal probability points (0%, 25%, 50%, 75%, 100%), not at points that create groups of identical size. With small n, exact equal-group division is often impossible.",
      contrastCase:
        "For large n (e.g., 1 million observations), the groups will each contain very close to 25% of observations. The equal-group interpretation becomes approximately true only for large datasets.",
    },
  ],

  transferPrompts: [
    {
      situation:
        "A company screens job applicants using a cognitive test. The test has mean 100 and SD 15 in the general population. The company wants to only interview applicants scoring above the 90th percentile.",
      competingTechniques: [
        "Set a cutoff of score > 115 (mean + 1 SD)",
        "Compute z-score for each applicant and flag z > 1.28",
        "Rank all applicants and take the top 10%",
      ],
      whyThisTechniqueWins:
        "Z-score cutoff at z > 1.28 (the exact 90th percentile of the normal distribution): 1.28 = Φ⁻¹(0.90). This is the principled approach when the distribution is known to be approximately normal. Setting score > 115 (mean + 1 SD) gives the 84th percentile, not the 90th — the wrong threshold. Ranking all applicants and taking the top 10% is equivalent but requires all scores to be collected first. The z-score cutoff can be applied immediately to each incoming score.",
    },
    {
      situation:
        "A financial analyst wants to flag unusual daily stock returns for further investigation. Over the past year (252 trading days), returns have mean +0.03% and SD 1.2%.",
      competingTechniques: [
        "Flag returns outside [−2%, +2%]",
        "Flag returns with |z| > 2 (2 SDs from mean)",
        "Flag the top and bottom 2.5% of actual returns",
      ],
      whyThisTechniqueWins:
        "The three methods give almost the same threshold here (|z| > 2 ↔ outside [0.03 − 2.4%, 0.03 + 2.4%] = [−2.37%, +2.43%]), but z-score-based flagging scales automatically if the distribution changes (new market regime with higher volatility). The flat [−2%, +2%] threshold is arbitrary. Flagging actual top/bottom 2.5% is robust but always flags the same count regardless of whether returns are truly extreme. Z-score flagging balances principled thresholds with distribution-awareness.",
    },
  ],

  debugging: [
    {
      commonError:
        "Q3 computed as the upper quartile of the entire dataset instead of the upper half.",
      symptom:
        "For [1,3,5,7,9], you report Q3=9 (max) instead of Q3=8 (average of 7 and 9).",
      whyItHappened:
        "Q3 is the median of the upper half, not the maximum. The upper half of [1,3,5,7,9] (n=5) is [7,9] (values above the median of 5). Median of [7,9] = (7+9)/2 = 8.",
      repairStrategy:
        "Step: (1) Find median (Q2). (2) Split at Q2. (3) Find median of upper half → Q3. Upper half is all values greater than Q2 (for odd n, do not include Q2 itself). For [1,3,5,7,9]: Q2=5, upper half = [7,9], Q3=(7+9)/2=8.",
    },
    {
      commonError: "Forgetting to sort data before finding percentiles.",
      symptom:
        'You find the "middle value" of unsorted data and get a wrong answer.',
      whyItHappened:
        'Percentiles are defined on the sorted order of the data. The "5th value" in the original order is meaningless. You need the 5th smallest value.',
      repairStrategy:
        'Always sort first: `data_sorted = sorted(data)`. Then apply the percentile position formula to `data_sorted`. If using pandas: `df["col"].quantile(0.25)` handles sorting internally.',
    },
  ],

  mastery: {
    targetLevel:
      "Apply (Level 3) — compute Q1/Q2/Q3 by the split-at-median method, compute and interpret z-scores, reverse-compute original values from z-scores, and apply Tukey outlier fences.",
    solveIndependently:
      "Given an unsorted dataset of 8–15 values, compute the five-number summary, IQR, Tukey fences, identify outliers, and compute the z-score of any specified value.",
    explainVerbally:
      "Explain why z-scores enable comparison across different distributions and why converting z to a percentile requires the distribution to be approximately normal.",
    detectIncorrectApplication:
      'Identify errors when: (1) quartiles are found without sorting; (2) z = +2 is claimed to be the 97.7th percentile of a heavily skewed distribution; (3) "80th percentile" is interpreted as "scored 80% correct."',
    transferToUnfamiliar:
      "Given a novel context (blood pressure readings, athletic performance times, financial returns), compute z-scores for specified values, build the five-number summary, and flag outliers using Tukey fences.",
  },
};
