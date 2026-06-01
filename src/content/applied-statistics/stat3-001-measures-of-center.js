export default {
  id: "stat3-001",
  slug: "measures-of-center",
  chapter: "stat3",
  order: 1,
  title: "Measures of Center",
  subtitle:
    "Mean, median, and mode — summarizing the typical value of a distribution.",
  tags: [
    "mean",
    "median",
    "mode",
    "center",
    "descriptive statistics",
    "outlier effect",
    "skewness",
    "weighted mean",
  ],
  aliases:
    "mean average median mode center typical value descriptive statistics trimmed mean weighted mean outlier effect skewed distribution",
  timeToComplete: 35,
  coreConcept:
    "The mean is the arithmetic average: sensitive to every value including outliers. The median is the middle value when data is sorted: resistant to outliers. The mode is the most frequent value: the only measure meaningful for categorical data. The relationship between mean and median signals the shape of the distribution.",
  prerequisites: ["stat2-006"],
  nextLesson: "stat3-002",

  hook: {
    question:
      'A neighborhood has 9 households with annual incomes: $42k, $45k, $48k, $51k, $53k, $55k, $58k, $61k, and $980k. The mean income is $154,778 and the median is $53,000. Which better describes the "typical" household?',
    realWorldContext:
      'The median ($53,000) is the better description of the typical household. Eight of the nine households earn between $42k and $61k — a range the $53k median sits comfortably within. The mean ($154,778) is higher than 8 of the 9 households because it is pulled upward by the one very high earner ($980k). This is why median income is reported in economic statistics, not mean income — a few billionaires would make the US "average" household look much wealthier than it actually is. Whenever you report a measure of center for economic or income data, or any right-skewed distribution, default to the median.',
  },

  intuition: {
    prose: [
      "**The mean: sum divided by count.** The arithmetic mean $\\bar{x} = \\frac{\\sum_{i=1}^n x_i}{n}$ is the balance point of the distribution — if you placed a see-saw under the number line, the mean is the exact point where the distribution balances. The mean uses every data point equally. This is its strength (efficiency) and its weakness (sensitivity to outliers). The mean is appropriate when: the distribution is approximately symmetric (no heavy skew), there are no extreme outliers, and you want to minimize the total squared error (the mean minimizes $\\sum(x_i - c)^2$ over all choices of constant $c$).",
      "**The median: the middle value.** Sort the data. If n is odd, the median is the middle value at position $(n+1)/2$. If n is even, the median is the average of the two middle values at positions $n/2$ and $n/2 + 1$. The median divides the distribution at the 50th percentile: exactly half the values are at or below, half at or above. The median is resistant — changing any value that is not the middle value (as long as it stays on the same side) does not change the median. Use the median when: the distribution is skewed, there are outliers, or you are working with income, house prices, or time-to-event data.",
      "**Before reading on, predict:** For the dataset [2, 4, 4, 5, 7, 7, 7, 9, 12], what is the mean? What is the median? What is the mode? Will the mean or median be larger?",
      "**The mode: most frequent value.** The mode is the value (or values) that appears most often. A dataset can be unimodal (one mode), bimodal (two modes), or multimodal. The mode is the only measure of center defined for categorical data (e.g., the mode of {Red, Blue, Red, Green, Red} is Red). For continuous quantitative data, the mode is less useful since exact repetition is rare — you would need to bin the data into a histogram first. For grouped data, the modal class is the bin with the highest frequency.",
      "**Mean vs. median and distribution shape.** The relationship between mean and median tells you about the shape of the distribution:\n- Symmetric: mean ≈ median (e.g., heights, standardized test scores)\n- Right-skewed: mean > median — the right tail pulls the mean up (e.g., incomes, house prices, time between events)\n- Left-skewed: mean < median — the left tail pulls the mean down (e.g., scores on an easy exam where most students get near-perfect, few get very low)\nThis is a reliable rule of thumb, not a strict guarantee — asymmetric distributions can occasionally violate it.",
      "**Weighted mean.** When observations contribute unequally to the average — for example, quiz grades worth 30% and exam grades worth 70% — use the weighted mean: $\\bar{x}_w = \\frac{\\sum w_i x_i}{\\sum w_i}$. The regular arithmetic mean is a special case of the weighted mean where all weights $w_i = 1$. Weighted means appear in grade calculation, portfolio returns, and demographic averaging (weighting by population size).",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Choosing Mean vs. Median",
        body: "Step 1. Plot a histogram of the data.\n\nStep 2. Is the distribution approximately symmetric (roughly bell-shaped, no heavy tails)? → Use the mean.\n\nStep 3. Is the distribution right-skewed (long right tail) or left-skewed (long left tail)? → Use the median.\n\nStep 4. Are there extreme outliers (values far beyond the main cluster)? → Use the median (or report both).\n\nStep 5. Is the data categorical (nominal)? → Use the mode (mean and median are undefined for categories).\n\nDefault: When in doubt about skewness, report both mean and median. If they differ by more than 10% of the mean, the distribution is noticeably skewed.",
      },
      {
        type: "insight",
        title: "The Mean as a Balance Point",
        body: "Place five weight tokens at positions 2, 4, 6, 10, 18 on a number line. The mean is (2+4+6+10+18)/5 = 8. At position 8, the total moment on the left (6+4+2=12 units away total) equals the total moment on the right (2+10=12 units away total) — the see-saw balances.\n\nThis is why one extreme outlier shifts the mean dramatically: the 18 pulls the balance point far right. Moving 18 to 100 would move the mean from 8 to 24.4 — but the median would remain at 6.\n\nPractical implication: the mean minimizes the sum of squared deviations $\\sum(x_i - c)^2$. The median minimizes the sum of absolute deviations $\\sum|x_i - c|$. The latter is more robust to outliers because it penalizes distance linearly rather than quadratically.",
      },
      {
        type: "warning",
        title: "When the Mean Misleads",
        body: "1. **Income and wealth data:** Always right-skewed. Mean income is pulled up by high earners. Report median.\n2. **Housing prices:** Right-skewed. Mean is pulled up by luxury homes. Use median.\n3. **Time-to-event data:** Response time, time to recover, time until equipment failure — nearly always right-skewed. Use median.\n4. **Bimodal data:** The mean of a bimodal distribution may fall between the two peaks — a value that no observation in the data is near. Report both modes and describe the bimodality instead.\n5. **Small samples:** With n < 10, the mean is highly sensitive to each individual observation. Report the median, or report both with a note about sample size.",
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Mean formulas.** Population mean: $\\mu = \\frac{\\sum_{i=1}^N x_i}{N}$ (all N members of the population). Sample mean: $\\bar{x} = \\frac{\\sum_{i=1}^n x_i}{n}$ (n observations from a sample). The sample mean $\\bar{x}$ is an unbiased estimator of $\\mu$: $E[\\bar{x}] = \\mu$.",
      "**Trimmed mean (robustness with less information loss).** The $p\\%$ trimmed mean removes the bottom $p\\%$ and top $p\\%$ of values and computes the mean of the remainder. A 10% trimmed mean on $n=100$ observations removes the 10 lowest and 10 highest values and averages the remaining 80. The trimmed mean is more resistant to outliers than the ordinary mean while using more data than the median. It is used in Olympic scoring (remove highest and lowest judge scores) and in robust statistics.",
      "**Median for grouped data.** When data is presented in a frequency table with class intervals, the median falls in the class whose cumulative frequency first reaches or exceeds $n/2$. The exact median is estimated by linear interpolation: $M = L + \\frac{(n/2 - F)}{f} \\times h$, where $L$ is the lower boundary of the median class, $F$ is the cumulative frequency before the median class, $f$ is the frequency of the median class, and $h$ is the class width.",
    ],
  },

  rigor: {
    prose: [
      '**R1 — Conditions for mean ≈ median.** The claim "for symmetric distributions, mean = median" is true only for symmetric distributions whose symmetry is perfect (a.k.a. symmetric about a single central value). For a symmetric bimodal distribution (two peaks equidistant from center), mean = median = center, but the center is a value between the two modes. The mean and median being equal does not imply unimodal or normal.',
      "**R2 — Resistance vs. efficiency.** The median is resistant (small-breakdown-point = 0.5, meaning up to 50% of the data can be arbitrarily changed before the median breaks down). The mean is not resistant (breakdown point = 0). However, the mean is efficient: it uses all the information in the data and has a smaller sampling variance than the median for normally distributed data. This is why statisticians prefer the mean for data they believe to be approximately normal with no outliers — it produces more precise estimates. For skewed data or data with outliers, the median's robustness outweighs its efficiency loss.",
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: "stat3-001-cell-1",
        type: "python",
        cellTitle: "Compute and compare mean vs. median",
        code: `import pandas as pd

# Household incomes (in thousands) — 9 households, 1 high earner
incomes = [42, 45, 48, 51, 53, 55, 58, 61, 980]

n = len(incomes)
mean_income = sum(incomes) / n
sorted_incomes = sorted(incomes)

# Median (n=9, odd: middle value at index 4)
median_income = sorted_incomes[n // 2]

print(f"n = {n}")
print(f"Mean income:   \${mean_income:,.0f}k = \${mean_income*1000:,.0f}")
print(f"Median income: \${median_income:,.0f}k = \${median_income*1000:,.0f}")
print(f"Ratio mean/median: {mean_income/median_income:.2f}x")

# Visualize
fig = Figure(width=7, height=5)
fig.axes(xmin=0, xmax=1000, ymin=0, ymax=4)
fig.histogram(values=incomes, bins=10, color="steelblue")
fig.text(500, 3.7, "Household Income Distribution", size=12, bold=True)
fig.show()
`,
        instructions:
          "The histogram reveals why mean and median diverge: 8 values cluster under $100k while one value ($980k) is far to the right. The mean is pulled into a region where no household actually lives.",
      },
      {
        id: "stat3-001-cell-2",
        type: "python",
        cellTitle: "Weighted mean — GPA calculation",
        code: `# Course grades and credit weights
courses = ["Calculus", "English", "Chemistry", "PE", "Statistics"]
grades  = [3.3, 3.7, 3.0, 4.0, 3.5]   # grade points (A=4.0, B=3.0, ...)
credits = [4, 3, 4, 1, 3]              # credit hours

# Weighted GPA
weighted_sum = sum(g * c for g, c in zip(grades, credits))
total_credits = sum(credits)
weighted_gpa = weighted_sum / total_credits

# Unweighted (simple mean)
simple_gpa = sum(grades) / len(grades)

print("Course grades and weights:")
for course, g, c in zip(courses, grades, credits):
    print(f"  {course}: {g} ({c} credits)")
print()
print(f"Simple (unweighted) GPA: {simple_gpa:.3f}")
print(f"Weighted GPA:            {weighted_gpa:.3f}")
print(f"Difference:              {abs(weighted_gpa - simple_gpa):.3f}")
`,
        instructions:
          "PE (4.0, 1 credit) has outsized influence in the simple mean. The weighted GPA correctly gives more weight to the 4-credit courses (Calculus, Chemistry). When weights differ substantially, the difference between weighted and unweighted means is significant.",
      },
    ],
  },

  examples: [
    {
      id: "stat3-001-ex1",
      title: "Compute mean, median, mode for a small dataset",
      difficulty: "easy",
      problem:
        "Dataset: [3, 7, 7, 5, 9, 2, 7, 4, 8, 6]. Find the mean, median, and mode.",
      steps: [
        {
          expression:
            "\\bar{x} = \\frac{3+7+7+5+9+2+7+4+8+6}{10} = \\frac{58}{10} = 5.8",
          annotation: "Sum all values (58), divide by n=10. Mean = 5.8.",
          strategyTitle: "Step 1: Mean",
        },
        {
          expression: "\\text{Sorted: } [2, 3, 4, 5, 6, 7, 7, 7, 8, 9]",
          annotation: "Sort the data — required for finding the median.",
          strategyTitle: "Step 2: Sort",
        },
        {
          expression:
            "\\text{n=10 (even): median} = \\frac{x_{(5)} + x_{(6)}}{2} = \\frac{6+7}{2} = 6.5",
          annotation:
            "With even n, median = average of the two middle values (positions 5 and 6). x₅=6, x₆=7, median = 6.5.",
          strategyTitle: "Step 3: Median",
        },
        {
          expression:
            "\\text{Mode} = 7 \\text{ (appears 3 times: positions 6, 7, 8 in sorted list)}",
          annotation:
            "7 appears 3 times. No other value appears more than once. The dataset is unimodal with mode=7.",
          strategyTitle: "Step 4: Mode",
        },
        {
          expression:
            "\\text{Mean (5.8) < Median (6.5) < Mode (7) — slightly left-skewed}",
          annotation:
            "When mean < median < mode, the distribution is left-skewed (slight here). The one value of 2 pulls the mean leftward.",
          strategyTitle: "Step 5: Shape inference",
        },
      ],
    },
    {
      id: "stat3-001-ex2",
      title: "Compute weighted mean",
      difficulty: "medium",
      problem:
        "A student's assessment grades: Quiz average=82 (weight 20%), Midterm=75 (weight 30%), Final=88 (weight 50%). What is the weighted final grade?",
      steps: [
        {
          expression:
            "\\bar{x}_w = \\frac{\\sum w_i x_i}{\\sum w_i} = \\frac{0.20(82) + 0.30(75) + 0.50(88)}{0.20+0.30+0.50}",
          annotation:
            "Substitute weights and grades into the weighted mean formula.",
          strategyTitle: "Step 1: Setup",
        },
        {
          expression:
            "= \\frac{16.4 + 22.5 + 44.0}{1.00} = \\frac{82.9}{1.00} = 82.9",
          annotation:
            "Compute each product: 0.20×82=16.4, 0.30×75=22.5, 0.50×88=44.0. Sum=82.9. Weights sum to 1.00, so denominator = 1.",
          strategyTitle: "Step 2: Compute",
        },
        {
          expression: "\\text{Simple mean: } (82+75+88)/3 = 81.7",
          annotation:
            "The unweighted mean is 81.7. The weighted mean (82.9) is pulled up by the 50%-weighted final exam grade of 88.",
          strategyTitle: "Step 3: Compare",
        },
      ],
    },
    {
      id: "stat3-001-ex3",
      title: "Effect of an outlier on mean vs. median",
      difficulty: "medium",
      problem:
        "Original dataset: [12, 14, 15, 16, 17, 18, 19]. Then the value 19 is replaced by 190. Compute the mean and median before and after, and explain why one changes more.",
      steps: [
        {
          expression:
            "\\text{Original: } \\bar{x} = (12+14+15+16+17+18+19)/7 = 111/7 = 15.86",
          annotation: "Mean of the original 7 values.",
          strategyTitle: "Original mean",
        },
        {
          expression:
            "\\text{Original: sorted } [12,14,15,16,17,18,19], \\text{ median} = x_{(4)} = 16",
          annotation: "n=7, middle value at position 4. Median = 16.",
          strategyTitle: "Original median",
        },
        {
          expression:
            "\\text{After: } \\bar{x} = (12+14+15+16+17+18+190)/7 = 282/7 = 40.29",
          annotation:
            "Mean changes from 15.86 to 40.29 — more than doubled — because the sum increased by 171 (190-19).",
          strategyTitle: "New mean",
        },
        {
          expression:
            "\\text{After: sorted } [12,14,15,16,17,18,190], \\text{ median} = x_{(4)} = 16",
          annotation:
            "Replacing 19 with 190 does not change the sorted position of the middle value. Median remains 16 — completely unchanged.",
          strategyTitle: "New median: unchanged",
        },
        {
          expression:
            "\\text{Mean changed by } +154\\%; \\text{ median unchanged. Outlier 190 broke the mean, not the median.}",
          annotation:
            "This is the key property: the median is resistant to outliers. No matter how large 190 becomes (1,900 or 19,000,000), the median stays at 16, because there are still 3 values below and 3 above it.",
          strategyTitle: "Conclusion: resistance",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat3-001-ch1",
      title: "When mean and median tell different stories",
      difficulty: "medium",
      problem:
        'Company salaries ($000s): [35, 38, 40, 42, 45, 45, 48, 52, 55, 60, 380]. (a) Compute mean and median. (b) A newspaper reports "average salary is $76,364." A union reports "typical salary is $45,000." Who is misleading, and who is correct?',
      walkthrough: [
        {
          expression:
            "\\bar{x} = (35+38+40+42+45+45+48+52+55+60+380)/11 = 840/11 = 76.4k",
          annotation:
            "Sum = 840. Mean = 840/11 ≈ $76,364. The newspaper is technically correct: $76,364 is the arithmetic mean.",
        },
        {
          expression:
            "\\text{Sorted: [35,38,40,42,45,45,48,52,55,60,380]}\\\\\\text{n=11, median = } x_{(6)} = 45",
          annotation:
            "Middle position = (11+1)/2 = 6. The 6th value is 45. Median = $45,000. The union is technically correct: $45,000 is the median.",
        },
        {
          expression:
            "\\text{Neither is lying — both statistics are arithmetically correct}",
          annotation:
            "The question is which is more informative for the stated purpose. 10 out of 11 employees earn $35k–$60k. The mean ($76k) is above 10 of 11 employees because the CEO earns $380k.",
        },
        {
          expression:
            '\\text{Conclusion: median is the better "typical salary" here. Mean is appropriate for total payroll.}',
          annotation:
            'Mean × n = total payroll ($840k). Median = what a randomly selected employee is likely to earn. For "what does the typical employee earn," median wins. For "what is the total compensation cost," mean wins.',
        },
      ],
      answer:
        'Mean = $76,364 (correct arithmetic, misleading for "typical"). Median = $45,000 (better for typical employee). Neither is lying — they are reporting different statistics. The median is the appropriate measure here.',
    },
    {
      id: "stat3-001-ch2",
      title: "Reverse-engineer the mean",
      difficulty: "hard",
      problem:
        "Five exam scores have a mean of 84. Four of the scores are: 78, 82, 88, 91. What is the fifth score?",
      walkthrough: [
        {
          expression:
            "\\bar{x} = \\frac{\\sum x_i}{5} = 84 \\implies \\sum x_i = 84 \\times 5 = 420",
          annotation:
            "If the mean is 84 and there are 5 scores, the total sum must be 420.",
        },
        {
          expression: "\\text{Known scores sum: } 78 + 82 + 88 + 91 = 339",
          annotation: "Sum the four known scores.",
        },
        {
          expression: "x_5 = 420 - 339 = 81",
          annotation:
            "The fifth score must be 420 - 339 = 81 to produce a mean of 84.",
        },
        {
          expression:
            "\\text{Verify: } (78+82+88+91+81)/5 = 420/5 = 84 \\checkmark",
          annotation: "Check: sum is 420, mean = 84. Correct.",
        },
      ],
      answer: "Fifth score = 81.",
    },
    ,
    {
      id: "stat3-001-ch3",
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

  semantics: {
    core: [
      { symbol: "\\bar{x}", meaning: "Sample mean = (sum of all values) / n." },
      {
        symbol: "\\mu",
        meaning: "Population mean = (sum of all N population values) / N.",
      },
      {
        symbol: "M \\text{ or } \\tilde{x}",
        meaning: "Median — middle value when sorted. 50th percentile.",
      },
      {
        symbol: "\\bar{x}_w = \\frac{\\sum w_i x_i}{\\sum w_i}",
        meaning: "Weighted mean — each value xi weighted by wi.",
      },
      {
        symbol: "\\text{mean} > \\text{median}",
        meaning: "Indicates right skew (long right tail pulling mean up).",
      },
      {
        symbol: "\\text{mean} < \\text{median}",
        meaning: "Indicates left skew (long left tail pulling mean down).",
      },
    ],
    rulesOfThumb: [
      "Symmetric distribution: use mean (more efficient).",
      "Skewed distribution or outliers: use median (resistant).",
      "Categorical data: use mode only.",
      "Income, housing, time: almost always skewed → report median.",
      "If mean/median differ by >10%, the distribution is noticeably skewed.",
      "Weighted mean: use when observations have different importance or group sizes.",
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      {
        lessonId: "stat3-002",
        label: "Measures of Spread",
        note: "Standard deviation and IQR measure spread around the mean and median respectively.",
      },
      {
        lessonId: "stat3-006",
        label: "Shape of a Distribution",
        note: "stat3-006 formalizes skewness mathematically and introduces kurtosis.",
      },
      {
        lessonId: "stat6-001",
        label: "Inferential Statistics",
        note: "The sample mean x̄ is the key estimator in t-tests and confidence intervals.",
      },
    ],
  },

  checkpoints: [
    {
      id: "cp-stat3-001-1",
      label:
        "Read: state when to use mean vs. median with one concrete example each",
      type: "read",
    },
    {
      id: "cp-stat3-001-2",
      label: "Read: explain why income data uses median, not mean",
      type: "read",
    },
    {
      id: "cp-stat3-001-3",
      label:
        "Apply example 1: compute mean, median, mode for [3,7,7,5,9,2,7,4,8,6] before reading",
      type: "example",
    },
    {
      id: "cp-stat3-001-4",
      label:
        "Lab: run cell 1 and describe how the histogram explains why mean ≫ median",
      type: "lab",
    },
    {
      id: "cp-stat3-001-5",
      label:
        "Apply example 3: predict which statistic changes more when 19 becomes 190",
      type: "example",
    },
    {
      id: "cp-stat3-001-6",
      label:
        "Lab: run cell 2 and verify the weighted GPA formula with one manual check",
      type: "lab",
    },
    {
      id: "cp-stat3-001-7",
      label:
        "Attempt challenge 2: find the fifth score from the mean and four known scores",
      type: "challenge",
    },
    {
      id: "cp-stat3-001-8",
      label:
        "Read: state the mean-median relationship for right-skewed, left-skewed, and symmetric data",
      type: "read",
    },
  ],

  assessment: {
    questions: [
      {
        id: "stat3-001-assess-1",
        type: "choice",
        text: "A dataset of 100 salaries has mean = $85,000 and median = $62,000. Which description is correct?",
        options: [
          "The distribution is left-skewed; most employees earn more than $85,000",
          "The distribution is right-skewed; a few high earners pull the mean above most salaries",
          "The distribution is symmetric; the mean and median should be the same",
          "The data has errors because mean and median differ",
        ],
        answer:
          "The distribution is right-skewed; a few high earners pull the mean above most salaries",
        instructions:
          "When mean > median, the right tail (high values) is pulling the mean upward.",
      },
    ],
  },

  quiz: [
    {
      id: "stat3-001-quiz-1",
      type: "choice",
      text: "For the data [2, 4, 4, 6, 8], what is the median?",
      options: ["4", "4.8", "5", "6"],
      answer: "4.8",
      hints: [
        "With n=5, the median is the middle (3rd) value when sorted.",
        "Sorted: [2, 4, 4, 6, 8]. The 3rd value is 4.",
      ],
      reviewSection: 'Intuition → "The median: the middle value" paragraph',
    },
    {
      id: "stat3-001-quiz-2",
      type: "choice",
      text: "The mean minimizes which quantity?",
      options: [
        "The sum of absolute deviations: Σ|xi − c|",
        "The sum of squared deviations: Σ(xi − c)²",
        "The maximum absolute deviation: max|xi − c|",
        "The number of outliers",
      ],
      answer: "The sum of squared deviations: Σ(xi − c)²",
      hints: [
        'This is the "balance point" property of the mean.',
        "The median minimizes the sum of absolute deviations instead.",
      ],
      reviewSection: "Insight callout — The Mean as a Balance Point",
    },
    {
      id: "stat3-001-quiz-3",
      type: "choice",
      text: "Which measure of center is defined for categorical data?",
      options: ["Mean", "Median", "Mode", "All three"],
      answer: "Mode",
      hints: [
        'You cannot compute an average or "middle" of categories like Red, Blue, Green.',
        "The mode is the most frequent category.",
      ],
      reviewSection: 'Intuition → "The mode: most frequent value" paragraph',
    },
    {
      id: "stat3-001-quiz-4",
      type: "choice",
      text: "A distribution has mean = 72 and median = 78. The distribution is:",
      options: ["Symmetric", "Right-skewed", "Left-skewed", "Bimodal"],
      answer: "Left-skewed",
      hints: [
        "mean < median indicates which direction of skew?",
        "When the left tail is longer, it pulls the mean below the median.",
      ],
      reviewSection:
        'Intuition → "Mean vs. median and distribution shape" paragraph',
    },
    {
      id: "stat3-001-quiz-5",
      type: "choice",
      text: "Six scores have a mean of 75. Five of the scores are 70, 72, 78, 80, and 82. What is the sixth score?",
      options: ["65", "68", "73", "75"],
      answer: "68",
      hints: [
        "Total sum must be 75 × 6 = 450.",
        "Known scores sum to 70+72+78+80+82 = 382. Sixth = 450 - 382.",
      ],
      reviewSection: "Challenge 2 — Reverse-engineer the mean",
    },
    {
      id: "stat3-001-quiz-6",
      type: "choice",
      text: "A student scores 90 on a midterm (worth 40%) and 70 on a final (worth 60%). The weighted average is:",
      options: ["78", "80", "82", "79.5"],
      answer: "78",
      hints: ["Weighted mean = 0.40(90) + 0.60(70).", "36 + 42 = 78."],
      reviewSection: "Example 2 — Compute weighted mean",
    },
  ],

  misconceptions: [
    {
      falseBelief:
        'The mean is always the "best" measure of center because it uses all the data.',
      whyStudentsThinkIt:
        'Students are taught the mean as the default average. They associate "uses more data" with "better."',
      correctionExample:
        'Nine households earn $42k–$61k and one earns $980k. The mean is $154k — above 9 of 10 households. Reporting $154k as the "typical income" is factually correct but deeply misleading for anyone trying to understand what most households earn.',
      contrastCase:
        "For a dataset of height measurements (approximately symmetric, no extreme outliers), the mean is the better choice: it is more statistically efficient (smaller standard error) than the median, and it accurately represents the center of the symmetric distribution.",
    },
    {
      falseBelief:
        "You can compute the mean of any data type, including categories.",
      whyStudentsThinkIt:
        'Students have seen "mean" applied broadly and assume it works for all variables. They might compute the mean of zip codes or ID numbers.',
      correctionExample:
        "Computing the mean of colors (Red=1, Blue=2, Green=3) produces a number (e.g., 1.8) that does not correspond to any actual color and has no meaningful interpretation. The assignment of 1, 2, 3 to colors is arbitrary — swapping the codes changes the mean.",
      contrastCase:
        "The mode (most frequent color) is valid for categorical data. The mean is only meaningful for interval or ratio data where arithmetic operations have genuine meaning.",
    },
    {
      falseBelief:
        "Mean and median are always close to each other for large datasets.",
      whyStudentsThinkIt:
        "Students confuse the central limit theorem (sample means converge to normal) with distributions themselves becoming symmetric.",
      correctionExample:
        "The US household income distribution has millions of observations and has been right-skewed throughout modern history. With 130 million households, the mean income is ~20% above the median — the large sample size has not made them converge. The skewness of the population distribution persists regardless of sample size.",
      contrastCase:
        "When the population is truly symmetric (heights, IQ scores), mean ≈ median regardless of sample size. The relationship between mean and median reflects population shape, not sample size.",
    },
  ],

  transferPrompts: [
    {
      situation:
        'A streaming service reports that users watch an "average" of 4.2 hours of video per week. A journalist wants to know if this accurately describes typical user behavior.',
      competingTechniques: [
        "Accept the mean as accurate",
        "Request the median and mode in addition to the mean",
        "Request a histogram of weekly viewing hours",
      ],
      whyThisTechniqueWins:
        'Request both median and a histogram: viewing time is almost certainly right-skewed (most users watch 0–2 hours but a small fraction of "superfans" watch 20–40 hours). If the median is 1.5 hours while the mean is 4.2, the "4.2 hours" figure is dominated by heavy users and misrepresents the majority. A histogram would show the full distribution — possibly revealing that 40% of users watch 0 hours (inactive subscribers). For engagement metrics, mean and median together tell the complete story.',
    },
    {
      situation:
        'A school district wants to report a single number representing "student performance" on the statewide math test. Scores range from 120 to 420, with a cluster of low scores around 200 (struggling students) and a cluster around 360 (high performers).',
      competingTechniques: [
        "Report the mean score",
        "Report the median score",
        "Report both and describe the bimodal distribution",
      ],
      whyThisTechniqueWins:
        "Report both and describe the bimodal distribution: for a bimodal distribution, both the mean and median fall between the two peaks — a value few students actually scored near. The mean would be pulled toward the larger cluster; the median is the 50th percentile. But neither single number communicates the critical finding: there are two distinct groups of students whose needs are entirely different. The bimodal structure should be the lead finding, with separate mean/median for each group.",
    },
  ],

  debugging: [
    {
      commonError: "Median computed incorrectly for even n.",
      symptom:
        "For data [1, 3, 5, 7], you report the median as 5 (the value at position n//2 + 1 = 3).",
      whyItHappened:
        "For even n, the median is the average of the two middle values. With n=4, positions 2 and 3 (1-indexed) are the middle values (3 and 5). Median = (3+5)/2 = 4. Using only one middle value gives the wrong answer.",
      repairStrategy:
        "In Python: `sorted_data = sorted(data); n = len(sorted_data); median = sorted_data[n//2] if n%2==1 else (sorted_data[n//2-1] + sorted_data[n//2])/2`. Verify: for [1,3,5,7], n=4 (even), positions n//2-1=1 and n//2=2 (0-indexed) → sorted_data[1]=3, sorted_data[2]=5, median=(3+5)/2=4.",
    },
    {
      commonError:
        "Weighted mean gives wrong result because weights sum to more than 1.",
      symptom:
        "You use raw weights like [20, 30, 50] instead of proportions [0.20, 0.30, 0.50] and forget to divide by sum(weights).",
      whyItHappened:
        "The formula is Σ(wi × xi) / Σwi. If you compute Σ(wi × xi) = 20(82)+30(75)+50(88) = 8290 but forget to divide by Σwi = 100, you get 8290 instead of 82.9.",
      repairStrategy:
        "Always divide by the sum of weights: `weighted_mean = sum(w*x for w,x in zip(weights, values)) / sum(weights)`. This works whether weights are proportions (summing to 1) or raw counts (summing to any value).",
    },
  ],

  mastery: {
    targetLevel:
      "Apply (Level 3) — compute mean, median, mode, and weighted mean; choose the correct measure for a given distribution type; explain the effect of outliers on each measure.",
    solveIndependently:
      "Given a dataset of 7–15 values, compute all three measures of center, identify distribution shape from mean-median relationship, and justify which measure to report.",
    explainVerbally:
      "Explain the mean-median relationship for right-skewed data using a concrete real-world example and describe why income statistics use median.",
    detectIncorrectApplication:
      "Identify an error when: (1) a researcher reports mean salary for a right-skewed dataset; (2) mean is computed for categorical data; (3) median is computed as n//2-th value for odd n without checking parity.",
    transferToUnfamiliar:
      "Given a novel dataset from an unfamiliar domain (time-to-event, environmental measurements, financial returns), select the appropriate measure(s) of center with justification based on the expected distribution shape.",
  },
};
