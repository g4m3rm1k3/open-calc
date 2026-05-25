export default {
  id: 'stat3-005',
  slug: 'frequency-tables-and-distributions',
  chapter: 'stat3',
  order: 5,
  title: 'Frequency Tables and Distributions',
  subtitle: 'Organizing data into tables — frequency, relative frequency, and cumulative frequency.',
  tags: ['frequency table', 'relative frequency', 'cumulative frequency', 'class interval', 'histogram', 'ogive', 'grouped data', 'value_counts'],
  aliases: 'frequency table relative frequency cumulative frequency class interval bin grouped data tally ogive frequency distribution pandas value_counts',
  timeToComplete: 35,
  coreConcept: 'A frequency table organizes raw data into categories (or class intervals) with counts. Relative frequency expresses counts as proportions. Cumulative frequency accumulates proportions across ordered categories. Frequency tables are the bridge between raw data and graphical summaries (histograms, bar charts, ogives).',
  prerequisites: ['stat3-001', 'stat3-002'],
  nextLesson: 'stat3-006',

  hook: {
    question: '300 students were asked how many hours per week they study. You have a list of 300 individual numbers. How do you make sense of it — and how do you communicate it to someone in 30 seconds?',
    realWorldContext: 'A frequency table compresses 300 individual values into 8–12 rows, each representing a range of study hours, with a count of how many students fall in each range. From this table you can immediately see: the most common range (mode class), whether most students study a lot or a little (center), and how spread out the values are. Relative frequency lets you say "32% of students study 6–10 hours per week" — a statement that is immediately interpretable regardless of the sample size. This is why frequency distributions are the first step in every exploratory data analysis: they transform raw data into communicable summaries.',
  },

  intuition: {
    prose: [
      '**Frequency: raw counts.** For each category or class interval, the frequency is simply a count of how many observations fall in that range. For categorical data, categories are natural (Male/Female, Freshman/Sophomore/etc.). For numerical data, you create class intervals (bins) that divide the range into equal-width groups.',
      '**Relative frequency: counts as proportions.** Relative frequency = count / n. If 48 out of 300 students study 6–8 hours, the relative frequency is 48/300 = 0.16 = 16%. Relative frequencies sum to 1 (100%). Relative frequency is better than raw frequency when comparing two groups of different sizes: you cannot compare "48 students from Group A" vs. "32 students from Group B" without knowing that Group A has 300 students and Group B has 200 — but 16% vs. 16% is an immediate comparison.',
      '**Before reading on, predict:** 20 test scores: [55, 60, 62, 68, 70, 72, 73, 75, 76, 78, 78, 80, 82, 83, 85, 88, 90, 92, 95, 98]. If you create class intervals of width 10 starting at 50, how many intervals do you need, and which interval has the most scores?',
      '**Cumulative frequency: running totals.** Cumulative relative frequency at class k = sum of relative frequencies for all classes up through k. At the last class, cumulative frequency = 100%. Cumulative frequency answers "What fraction of observations fall at or below this value?" — the empirical CDF (cumulative distribution function). A graph of cumulative frequency vs. class boundaries is called an ogive.',
      '**Building class intervals.** For continuous or wide-range data: (1) Find range = max − min. (2) Choose the number of classes (typically 5–15, often 7–10 for most datasets). (3) Class width ≈ range / number of classes, rounded up to a convenient number. (4) Start the first class slightly below the minimum. (5) Each observation belongs to exactly one class (use consistent left-closed intervals: [a, b)).',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Build a Frequency Table for Numerical Data',
        body: 'Step 1. Find the range: range = max − min.\n\nStep 2. Choose the number of classes k (typically 7–10 for n between 50 and 500). Rough rule: k ≈ √n.\n\nStep 3. Compute class width: w = ceil(range / k). Round up to a convenient number.\n\nStep 4. Set class boundaries: First class starts at or just below the minimum. Each class is [lower, lower + w). Continue until the maximum is covered.\n\nStep 5. Tally: for each data value, determine which class it belongs to and add 1 to that class count.\n\nStep 6. Compute relative frequency: divide each count by n.\n\nStep 7. Compute cumulative relative frequency: running sum of relative frequencies.',
      },
      {
        type: 'insight',
        title: 'Frequency Table → Histogram: One-to-One Correspondence',
        body: 'A histogram is the graphical version of a frequency table for numerical data:\n- Each class interval = one bar\n- Bar height = frequency (or relative frequency)\n- Bar width = class width\n- No gaps between bars (data is continuous)\n\nA bar chart is the graphical version for categorical data:\n- Each category = one bar\n- Gaps between bars are conventional (data is discrete)\n\nChoosing the number of bins (class width) affects histogram shape the same way it affects the frequency table — too few classes: overly smooth (hides peaks), too many classes: choppy (hides overall pattern). Most software defaults (like pandas histogram) choose bins automatically using rules like Sturges\' rule (k = 1 + log₂n) or Freedman-Diaconis.',
      },
      {
        type: 'warning',
        title: 'Class Interval Ambiguity and Boundary Rules',
        body: 'When a data value falls exactly on a class boundary, a rule is needed to assign it consistently. The standard convention: each class is left-closed, right-open: [lower, upper). This means:\n- Lower bound is included in the class\n- Upper bound is excluded (belongs to the next class)\n\nExample: classes [60, 70) and [70, 80). A score of exactly 70 belongs to [70, 80), not [60, 70).\n\nAlways state your boundary convention. If you say "60–69" and "70–79" for integer data, there is no ambiguity. For continuous data, use [a, b) notation explicitly.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      '**Relative frequency and proportion.** For class $i$ with count $f_i$ and total sample size $n$: relative frequency $= f_i / n$. All relative frequencies sum to 1: $\\sum_i (f_i/n) = (\\sum_i f_i)/n = n/n = 1$.',
      '**Cumulative relative frequency.** Let $r_i = f_i/n$ be the relative frequency of class $i$ (ordered). Cumulative relative frequency of class $k$: $F_k = \\sum_{i=1}^k r_i$. Note $F_K = 1$ for the last class $K$. The ogive is the graph of $(\\text{upper boundary of class } k, F_k)$ — a step function that approximates the empirical CDF.',
      '**Mean and SD from a frequency table (grouped data).** When only the frequency table is available (not raw data), approximate the mean using class midpoints $m_i$: $\\bar{x} \\approx \\sum_i m_i \\cdot (f_i/n)$. And the variance: $s^2 \\approx \\sum_i (m_i - \\bar{x})^2 \\cdot (f_i/n)$. These are approximations because the exact within-class distribution is unknown.',
    ],
  },

  rigor: {
    prose: [
      '**R1 — Bin width and information content.** Bin width is a bias-variance tradeoff: wide bins → low variance (smooth histogram) but high bias (masks structure). Narrow bins → low bias but high variance (choppy). The optimal bin width minimizes the integrated mean squared error between the histogram and the true density. The Freedman-Diaconis rule gives: width $= 2 \\cdot IQR \\cdot n^{-1/3}$. This is more robust than Sturges\' rule because it uses IQR rather than range and therefore adapts to the spread of the data without being dominated by outliers.',
      '**R2 — Empirical CDF vs. ogive.** The empirical CDF (ECDF) places a probability mass of 1/n at each observed value. The ogive approximates the ECDF by using class midpoints. For large n, the ogive approaches the true ECDF. The Kolmogorov-Smirnov goodness-of-fit test is based on the maximum vertical distance between the empirical CDF and a theoretical CDF — the foundation of normality testing.',
    ],
    visualizations: [],
  },

  code: {
    cells: [
      {
        id: 'stat3-005-cell-1',
        type: 'python',
        label: 'Build a frequency table manually and with pandas',
        starterCode: `# Exam scores for 20 students
scores = [55, 60, 62, 68, 70, 72, 73, 75, 76, 78,
          78, 80, 82, 83, 85, 88, 90, 92, 95, 98]

n = len(scores)
# Class intervals: [50,60), [60,70), [70,80), [80,90), [90,100]
classes = [(50, 60), (60, 70), (70, 80), (80, 90), (90, 101)]
labels = ["50–59", "60–69", "70–79", "80–89", "90–100"]

print(f"{'Class':<10} {'Freq':>6} {'Rel Freq':>10} {'Cum Freq':>10}")
print("-" * 38)

cumulative = 0
freqs = []
for (lo, hi), lbl in zip(classes, labels):
    freq = sum(1 for x in scores if lo <= x < hi)
    rel = freq / n
    cumulative += rel
    freqs.append(freq)
    print(f"{lbl:<10} {freq:>6} {rel:>10.3f} {cumulative:>10.3f}")

print("-" * 38)
print(f"{'Total':<10} {sum(freqs):>6} {'1.000':>10}")
`,
        hint: 'Check that all relative frequencies sum to 1.000 and that cumulative frequency in the last row equals 1.000. Which class interval has the most scores (modal class)?',
      },
      {
        id: 'stat3-005-cell-2',
        type: 'python',
        label: 'Frequency table from categorical data + bar chart',
        starterCode: `# Major selection for 30 students
majors = ["CS","Bio","CS","Math","Bio","CS","Eng","CS","Bio","Math",
          "Eng","CS","CS","Bio","Math","Eng","Bio","CS","CS","Eng",
          "Math","CS","Bio","Bio","CS","Eng","Math","CS","Bio","CS"]

n = len(majors)
# Count each major
counts = {}
for m in majors:
    counts[m] = counts.get(m, 0) + 1

# Sort by frequency (descending)
sorted_majors = sorted(counts.items(), key=lambda x: x[1], reverse=True)

print(f"{'Major':<8} {'Count':>7} {'Rel Freq':>10} {'Cum Freq':>10}")
print("-" * 36)
cumulative = 0
labels_list = []
values_list = []
for major, count in sorted_majors:
    rel = count / n
    cumulative += rel
    print(f"{major:<8} {count:>7} {rel:>10.3f} {cumulative:>10.3f}")
    labels_list.append(major)
    values_list.append(count)

fig = Figure(width=8, height=5)
fig.axes(xmin=-0.5, xmax=len(labels_list)-0.5, ymin=0, ymax=max(values_list)+2)
fig.bars(labels=labels_list, values=values_list, color="steelblue")
fig.text((len(labels_list)-1)/2, max(values_list)+1.5, "Student Majors", size=12, bold=True)
fig.show()
`,
        hint: 'Notice that the table is sorted by frequency (descending). This is called a Pareto arrangement and makes the modal category immediately obvious. The bar chart should match the table ordering.',
      },
    ],
  },

  examples: [
    {
      id: 'stat3-005-ex1',
      title: 'Build a frequency table from scratch',
      difficulty: 'easy',
      problem: 'Dataset (n=15): [12, 15, 17, 19, 21, 22, 23, 25, 27, 28, 30, 33, 35, 38, 42]. Create a frequency table with 5 equal-width classes.',
      steps: [
        { expression: '\\text{Range} = 42-12 = 30; \\quad \\text{Class width} = \\lceil 30/5 \\rceil = 6', annotation: 'Range = 30. With 5 classes, width = 30/5 = 6.', strategyTitle: 'Step 1: Class width' },
        { expression: '\\text{Classes: } [12,18), [18,24), [24,30), [30,36), [36,42]', annotation: 'Start at the minimum (12). Each class has width 6.', strategyTitle: 'Step 2: Class boundaries' },
        { expression: '[12,18): \\{12,15,17\\} \\rightarrow f=3, r=3/15=0.200', annotation: 'Three values fall in [12,18): 12, 15, 17.', strategyTitle: 'Step 3: Class [12,18)' },
        { expression: '[18,24): \\{19,21,22,23\\} \\rightarrow f=4, r=4/15=0.267', annotation: 'Four values in [18,24): 19, 21, 22, 23.', strategyTitle: 'Step 4: Class [18,24)' },
        { expression: '[24,30): \\{25,27,28\\} \\rightarrow f=3, r=0.200', annotation: 'Three values in [24,30): 25, 27, 28.', strategyTitle: 'Step 5: Classes [24,30)' },
        { expression: '[30,36): \\{30,33,35\\} \\rightarrow f=3, r=0.200; \\quad [36,42]: \\{38,42\\} \\rightarrow f=2, r=0.133', annotation: 'Remaining classes: 3 values in [30,36), 2 in [36,42]. Total: 3+4+3+3+2=15 ✓. Relative frequencies sum to 0.200+0.267+0.200+0.200+0.133 = 1.000 ✓.', strategyTitle: 'Step 6: Remaining classes' },
      ],
    },
    {
      id: 'stat3-005-ex2',
      title: 'Cumulative frequency and percentile from a table',
      difficulty: 'medium',
      problem: 'From the table: [50,60): f=3, [60,70): f=7, [70,80): f=15, [80,90): f=12, [90,100]: f=3. Total n=40. (a) What percentage of scores are below 80? (b) In which class does the 75th percentile fall?',
      steps: [
        { expression: 'r_1 = 3/40=0.075, \\; r_2 = 7/40=0.175, \\; r_3 = 15/40=0.375, \\; r_4 = 12/40=0.300, \\; r_5 = 3/40=0.075', annotation: 'Compute relative frequencies for each class.', strategyTitle: 'Step 1: Relative frequencies' },
        { expression: 'F(\\text{below 80}) = r_1+r_2+r_3 = 0.075+0.175+0.375 = 0.625 = 62.5\\%', annotation: 'Cumulative frequency up through [70,80): 62.5% of scores are below 80.', strategyTitle: '(a) Scores below 80' },
        { expression: 'F(\\text{below 70}) = 0.075+0.175 = 0.250; \\quad F(\\text{below 80}) = 0.625', annotation: 'The 75th percentile falls in the class [70,80) because the cumulative frequency crosses 0.75 in that class (goes from 0.25 to 0.625 — but wait: 0.75 is between 0.625 and 0.925). Re-check: F(below 90) = 0.075+0.175+0.375+0.300 = 0.925. So 75th percentile is in [80,90).', strategyTitle: '(b) 75th percentile class' },
        { expression: 'F(\\text{below 80}) = 0.625 < 0.75 < 0.925 = F(\\text{below 90}) \\Rightarrow P75 \\in [80, 90)', annotation: 'The cumulative frequency exceeds 0.75 for the first time at the upper boundary of [80,90). The 75th percentile falls in the class [80,90).', strategyTitle: 'Step 4: Locate 75th percentile class' },
      ],
    },
    {
      id: 'stat3-005-ex3',
      title: 'Compute approximate mean from frequency table',
      difficulty: 'medium',
      problem: 'From example 2\'s table: classes and midpoints [55, 65, 75, 85, 95], frequencies [3, 7, 15, 12, 3], n=40. Estimate the mean score.',
      steps: [
        { expression: '\\bar{x} \\approx \\frac{55(3) + 65(7) + 75(15) + 85(12) + 95(3)}{40}', annotation: 'Use class midpoints × frequencies, divided by n.', strategyTitle: 'Step 1: Setup' },
        { expression: '= \\frac{165 + 455 + 1125 + 1020 + 285}{40} = \\frac{3050}{40} = 76.25', annotation: 'Sum of (midpoint × frequency) = 3050. Divide by n=40 → mean ≈ 76.25.', strategyTitle: 'Step 2: Compute' },
        { expression: '\\text{This is an approximation — true mean requires raw data}', annotation: 'All 15 values in [70,80) are assumed to be at the midpoint 75. In reality they vary within [70,80). The approximation is better for narrower class intervals.', strategyTitle: 'Step 3: Caveat' },
      ],
    },
  ],

  challenges: [
    {
      id: 'stat3-005-ch1',
      title: 'Compare two groups using relative frequency',
      difficulty: 'medium',
      problem: 'School A (n=200) and School B (n=350) both took the same math test. School A: [60,70): 20 students, [70,80): 60 students, [80,90): 80 students, [90,100]: 40 students. School B: [60,70): 42, [70,80): 105, [80,90): 140, [90,100]: 63. Which school performed better?',
      walkthrough: [
        { expression: '\\text{School A rel. freqs: } 0.10, 0.30, 0.40, 0.20', annotation: '20/200=0.10, 60/200=0.30, 80/200=0.40, 40/200=0.20. Sum = 1.00 ✓.' },
        { expression: '\\text{School B rel. freqs: } 0.12, 0.30, 0.40, 0.18', annotation: '42/350=0.12, 105/350=0.30, 140/350=0.40, 63/350=0.18. Sum = 1.00 ✓.' },
        { expression: '\\text{School A: 20\\% in [90,100] vs. School B: 18\\%; School A: 10\\% in [60,70] vs. School B: 12\\%}', annotation: 'Comparing relative frequencies: School A has slightly more high scorers (20% vs. 18%) and fewer low scorers (10% vs. 12%). The [70,80) and [80,90) bands are identical.' },
        { expression: '\\text{School A slightly outperforms School B, though the difference is small}', annotation: 'Raw counts (200 vs. 350) cannot be compared directly. Relative frequencies make the comparison valid. The difference is modest — both schools have very similar distributions. You cannot compare "80 students" (School A, [80,90)) vs. "140 students" (School B, [80,90)) because the schools are different sizes.' },
      ],
      answer: 'School A slightly outperforms School B: 20% vs. 18% in [90,100] and 10% vs. 12% in [60,70]. Using raw counts would be misleading because the schools have different sizes.',
    },
    {
      id: 'stat3-005-ch2',
      title: 'Reconstruct a histogram from a frequency table',
      difficulty: 'hard',
      problem: 'Frequency table: [0,5): f=8, [5,10): f=20, [10,15): f=35, [15,20): f=22, [20,25): f=10, [25,30): f=5. Total n=100. (a) What is the modal class? (b) What is the cumulative relative frequency up to 20? (c) Describe the shape of the distribution.',
      walkthrough: [
        { expression: '\\text{Modal class: } [10,15) \\text{ with } f=35 \\text{ (highest frequency)}', annotation: 'The modal class is [10,15): 35 out of 100 observations fall here. The mode is approximately 12.5 (midpoint).' },
        { expression: 'F(\\text{up to 20}) = (8+20+35+22)/100 = 85/100 = 0.85', annotation: '85% of observations fall below 20. Cumulative relative frequency at 20 = 0.85.' },
        { expression: '\\text{Shape: right-skewed. Peak at [10,15), tail extends to [25,30)}', annotation: 'The distribution peaks in the middle-lower range and has a right tail (frequencies decrease to the right: 22, 10, 5). Left side rises steeply (8, 20, 35). The distribution is right-skewed (positive skew): more mass is below the peak than above.' },
      ],
      answer: '(a) Modal class: [10,15). (b) Cumulative rel. freq up to 20 = 85%. (c) Right-skewed: peak at [10,15) with a longer right tail.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'f_i', meaning: 'Frequency of class i = count of observations in class i.' },
      { symbol: 'r_i = f_i/n', meaning: 'Relative frequency of class i = proportion of observations in class i.' },
      { symbol: 'F_k = \\sum_{i=1}^k r_i', meaning: 'Cumulative relative frequency up to class k. F_K = 1 for the last class.' },
      { symbol: '\\text{Modal class}', meaning: 'The class interval with the highest frequency.' },
      { symbol: '\\bar{x} \\approx \\sum_i m_i \\cdot r_i', meaning: 'Approximate mean from frequency table, using class midpoints mᵢ.' },
      { symbol: '\\text{Ogive}', meaning: 'Graph of cumulative relative frequency vs. upper class boundary. Approximates the empirical CDF.' },
    ],
    rulesOfThumb: [
      'Number of classes k ≈ √n (or 7–10 for most datasets).',
      'Class width = ceil(range / k) — round up to a convenient number.',
      'All relative frequencies sum to 1. Last cumulative relative frequency = 1.',
      'Modal class = highest frequency class.',
      'Frequency table → histogram (one-to-one correspondence).',
      'Use relative frequency (not raw count) to compare groups of different sizes.',
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      { lessonId: 'stat3-006', label: 'Shape of a Distribution', note: 'Frequency tables reveal the shape of a distribution — skewness is visible by inspecting which tail of the table has higher frequencies.' },
      { lessonId: 'stat5-002', label: 'Normal Distribution', note: 'The CDF of the normal distribution is the theoretical counterpart of the empirical ogive (cumulative frequency curve).' },
      { lessonId: 'stat7-001', label: 'Chi-Square Goodness of Fit', note: 'Chi-square tests compare observed frequency tables to expected frequency tables to test whether data fits a theoretical distribution.' },
    ],
  },

  checkpoints: [
    { id: 'cp-stat3-005-1', label: 'Read: define frequency, relative frequency, and cumulative frequency', type: 'read' },
    { id: 'cp-stat3-005-2', label: 'Read: state the procedure for choosing class intervals (width and boundaries)', type: 'read' },
    { id: 'cp-stat3-005-3', label: 'Apply example 1: build the 5-class frequency table for [12,15,…,42] before reading', type: 'example' },
    { id: 'cp-stat3-005-4', label: 'Lab: run cell 1 and identify the modal class interval for the score data', type: 'lab' },
    { id: 'cp-stat3-005-5', label: 'Apply example 3: compute the approximate mean from the frequency table before reading', type: 'example' },
    { id: 'cp-stat3-005-6', label: 'Lab: run cell 2 and verify that the relative frequencies sum to 1.000', type: 'lab' },
    { id: 'cp-stat3-005-7', label: 'Attempt challenge 1: compute relative frequencies for both schools to compare', type: 'challenge' },
    { id: 'cp-stat3-005-8', label: 'Read: explain why relative frequency is needed for comparing groups of different sizes', type: 'read' },
  ],

  assessment: {
    questions: [
      {
        id: 'stat3-005-assess-1',
        type: 'choice',
        text: 'A frequency table has classes [10,20), [20,30), [30,40) with cumulative relative frequencies of 0.25, 0.70, 1.00 respectively. What percentage of data falls in [20,30)?',
        options: ['70%', '45%', '25%', '30%'],
        answer: '45%',
        hint: 'Relative frequency of [20,30) = cumulative frequency at end of [20,30) minus cumulative frequency at end of [10,20) = 0.70 − 0.25 = 0.45 = 45%.',
      },
    ],
  },

  quiz: [
    {
      id: 'stat3-005-quiz-1',
      type: 'choice',
      text: 'For n=100 observations with range=50, how many classes would you typically create?',
      options: ['3', '5', '10', '50'],
      answer: '10',
      hints: ['Rule of thumb: k ≈ √n = √100 = 10.', 'Class width would be ceil(50/10) = 5.'],
      reviewSection: 'Procedure: Build a Frequency Table',
    },
    {
      id: 'stat3-005-quiz-2',
      type: 'choice',
      text: 'In a left-closed, right-open class interval [70, 80), which value goes in this class?',
      options: ['79.9', '80.0', 'Both 79.9 and 80.0', 'Neither'],
      answer: '79.9',
      hints: ['[70, 80) includes 70 but excludes 80.', '79.9 < 80 → belongs to [70,80). 80.0 = 80 → belongs to [80,90).'],
      reviewSection: 'Warning callout — Class Interval Ambiguity',
    },
    {
      id: 'stat3-005-quiz-3',
      type: 'choice',
      text: 'The cumulative relative frequency in the last row of a complete frequency table equals:',
      options: ['The relative frequency of the largest class', 'n (sample size)', '1.00 (100%)', 'The modal class frequency'],
      answer: '1.00 (100%)',
      hints: ['Cumulative = running sum of relative frequencies.', 'All relative frequencies sum to 1, so the last cumulative frequency = 1.'],
      reviewSection: 'Math section — Cumulative relative frequency',
    },
    {
      id: 'stat3-005-quiz-4',
      type: 'choice',
      text: 'School A has 20 students in the [80,90) range (n=100). School B has 40 students in [80,90) (n=400). Which school has a higher proportion of students scoring in this range?',
      options: ['School A', 'School B', 'They are equal', 'Cannot determine without more information'],
      answer: 'School A',
      hints: ['Convert to relative frequency: A = 20/100 = 20%; B = 40/400 = 10%.', 'School A: 20% in [80,90). School B: 10%. School A has the higher proportion.'],
      reviewSection: 'Hook — relative frequency for comparing different-sized groups',
    },
    {
      id: 'stat3-005-quiz-5',
      type: 'choice',
      text: 'An ogive (cumulative frequency curve) is used to:',
      options: [
        'Display the modal class',
        'Determine what percentage of data falls below a given value',
        'Show the frequency of the largest class',
        'Identify outliers',
      ],
      answer: 'Determine what percentage of data falls below a given value',
      hints: ['Cumulative frequency answers "What % of data is ≤ this value?"', 'The ogive is the graph of cumulative relative frequency vs. class upper boundary.'],
      reviewSection: 'Math section — Empirical CDF vs. ogive',
    },
    {
      id: 'stat3-005-quiz-6',
      type: 'choice',
      text: 'Which visualization corresponds directly to a frequency table for numerical data?',
      options: ['Pie chart', 'Scatter plot', 'Histogram', 'Line chart'],
      answer: 'Histogram',
      hints: ['Each class interval becomes one bar in a histogram.', 'Bar height = frequency. Bar width = class width. No gaps between bars (continuous data).'],
      reviewSection: 'Insight callout — Frequency Table → Histogram',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'You can compare raw frequencies across groups of different sizes.',
      whyStudentsThinkIt: 'Frequency is a direct count and feels like the "real" number. Students do not automatically divide by n.',
      correctionExample: '"40 students from Group B scored 80–90" vs. "20 students from Group A scored 80–90." If Group A has 100 students and Group B has 400, then Group A (20%) outperforms Group B (10%). Using raw counts leads to the opposite conclusion. Always use relative frequency for cross-group comparison.',
      contrastCase: 'If both groups have the same size (n), raw frequencies are directly comparable. But since sample sizes differ in most real studies, relative frequency is the safe default.',
    },
    {
      falseBelief: 'The modal class in a frequency table is the mean or median.',
      whyStudentsThinkIt: 'Students hear "the most common value" and conflate it with average or middle.',
      correctionExample: 'Frequency table: [50,60): f=5, [60,70): f=12, [70,80): f=18, [80,90): f=10, [90,100]: f=5. Modal class = [70,80) (highest count=18). But the mean (≈ 74.8) and median (approximately in [70,80)) are also near this class only by coincidence. For a left-skewed distribution, the modal class and mean/median can be in different parts of the table.',
      contrastCase: 'Mode, median, and mean are related to the distribution shape. For a symmetric distribution, all three are close. For right-skewed data, mode < median < mean, and the modal class is to the left of the median and mean.',
    },
    {
      falseBelief: 'Fewer class intervals always gives a better (cleaner) frequency table.',
      whyStudentsThinkIt: 'Simpler tables look cleaner. Students minimize complexity.',
      correctionExample: 'For 100 exam scores, using 3 classes ([0,33), [33,66), [67,100)) hides the shape completely: you know there are three blobs of data but no detail. Using 10 classes reveals whether scores are clustered near 70–80, whether there are two peaks (bimodal), and whether the distribution is skewed. Too few classes destroys information. Too many classes creates noise.',
      contrastCase: 'Optimal: k ≈ √n classes for typical datasets. For n=100: √100 = 10 classes. This is a starting point — domain context might call for wider or narrower classes. Always visually inspect the resulting histogram to check if the choice reveals meaningful structure.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A retail company wants to understand customer purchase amounts. They have 500 transactions ranging from $5 to $420. They want to present this to marketing executives in a summary format.',
      competingTechniques: ['List all 500 individual transaction amounts', 'Compute mean and SD only', 'Build a frequency table with ~10 classes, compute relative frequency, and display as a histogram'],
      whyThisTechniqueWins: 'Frequency table + histogram: executives see at a glance where most purchases cluster (modal class), what proportion of transactions are high-value (upper classes), and the shape of the distribution (right-skewed is common for purchase amounts). Listing 500 values is unreadable. Mean and SD alone hide whether most customers spend near the mean or whether there are two clusters (small vs. large purchases). The frequency table + relative frequency enables comparison to next quarter\'s data regardless of whether transaction volume changes.',
    },
    {
      situation: 'A health clinic records the number of days between appointments for 200 patients. They want to identify patients who wait too long between visits (>90 days) and those who visit too frequently (<14 days).',
      competingTechniques: ['Scan individual records for values outside [14, 90]', 'Compute mean and flag values more than 2 SDs from mean', 'Build a frequency table and examine cumulative frequencies at the boundary values'],
      whyThisTechniqueWins: 'Frequency table with cumulative frequency: build classes that align with the boundaries (e.g., [0,14), [14,30), [30,60), [60,90), [90+)). Cumulative frequency at 90 immediately tells you what % of patients are in the normal range. The last class [90+) count tells you how many are overdue. This is more systematic than scanning individual records and more interpretable than SD-based flagging (which assumes normality and might miss the specific thresholds that matter clinically).',
    },
  ],

  debugging: [
    {
      commonError: 'Data values are counted multiple times due to ambiguous class boundaries.',
      symptom: 'Total frequency > n (more tallied observations than actual data points).',
      whyItHappened: 'Classes [60,70] and [70,80] both claim the value 70 — it satisfies both ≤70 and ≥70. Without consistent left-closed/right-open convention, boundary values get double-counted.',
      repairStrategy: 'Use strict left-closed intervals: [60,70), [70,80), [80,90). Each value belongs to exactly one interval. Check: `count = sum(1 for x in data if lower <= x < upper)`. Verify `sum(counts) == n`.',
    },
    {
      commonError: 'Relative frequencies do not sum to exactly 1.000 due to rounding.',
      symptom: 'Sum of relative frequencies = 0.998 or 1.002.',
      whyItHappened: 'Each relative frequency was individually rounded before summing. Rounding 5 numbers each to 3 decimal places can accumulate error of up to 5×0.0005 = ±0.0025.',
      repairStrategy: 'Compute relative frequencies to sufficient precision before display. Adjust the largest class\' relative frequency to make the sum exactly 1: `rel_freqs[-1] = 1 - sum(rel_freqs[:-1])`. Alternatively, report frequencies as fractions (3/15) and only convert to decimals for display.',
    },
  ],

  mastery: {
    targetLevel: 'Apply (Level 3) — build a frequency table from raw data (choosing class intervals, computing relative and cumulative frequencies), read a frequency table to answer percentage questions, and compare two groups using relative frequency.',
    solveIndependently: 'Given 20–50 raw numerical values, choose appropriate class intervals, build the full frequency table (frequency, relative frequency, cumulative frequency), identify the modal class, and estimate the approximate mean using class midpoints.',
    explainVerbally: 'Explain why relative frequency is required for comparing two groups of different sizes, and why fewer class intervals are not always better.',
    detectIncorrectApplication: 'Identify errors when: (1) raw frequencies are compared across groups of different sizes; (2) a boundary value is counted in two classes; (3) cumulative frequencies do not end at 1.000.',
    transferToUnfamiliar: 'Given a novel dataset (customer purchase amounts, patient wait times, production defect counts), build a frequency table using appropriate class intervals, compute relative and cumulative frequencies, and answer specific percentile questions from the cumulative column.',
  },
};
