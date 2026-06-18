export default {
  id: "stat2-002",
  slug: "python-for-data-visualization",
  chapter: "stat2",
  order: 2,
  title: "Python for Data Visualization",
  subtitle: "Building histograms, scatter plots, bar charts, and line charts with matplotlib.",
  tags: [
    "python",
    "matplotlib",
    "visualization",
    "histogram",
    "scatter plot",
    "bar chart",
    "pie chart",
    "line chart",
    "data analysis",
  ],
  aliases:
    "matplotlib pyplot python chart histogram scatter plot bar chart pie chart data visualization code plt",
  timeToComplete: 40,
  coreConcept:
    "matplotlib is Python's standard plotting library. You call functions like plt.hist(), plt.scatter(), plt.bar(), and plt.plot() to describe what you want, then plt.show() renders it. Every visualization follows the same three-step pattern: prepare the data, call the chart function, call plt.show().",
  prerequisites: ["stat2-001"],
  nextLesson: "stat2-003",

  hook: {
    question:
      "If you have 150 numbers representing exam scores, what is the fastest way to understand the distribution?",
    realWorldContext:
      "A statistics professor collects midterm scores from 150 students: the lowest is 31, the highest is 99, and everything in between. She could compute the mean and standard deviation â€” but those two numbers would not tell her whether the scores are symmetric or skewed, whether there are clusters, or how many students are at risk of failing. In about 3 lines of Python with matplotlib, she can produce a histogram that answers all of those questions visually at once. This lesson shows you exactly how.",
  },

  intuition: {
    prose: [
      "**The matplotlib pattern.** Every matplotlib visualization follows the same core structure:\n```python\nimport matplotlib.pyplot as plt\n\n# 1. Prepare your data\nscores = [72, 85, 91, 63, 77, 88]\n\n# 2. Call the chart function\nplt.hist(scores, bins=5, color='steelblue')\nplt.title('Score Distribution')\nplt.xlabel('Score')\n\n# 3. Render\nplt.show()\n```\nImport once, call chart functions, call `plt.show()` at the end.",
      "**Histogram: one continuous variable.** `plt.hist(data, bins=10, color='steelblue', edgecolor='white')` bins the raw data, counts how many values fall in each bin, and draws one bar per bin. The bars touch because the x-axis is a continuous number line. The `bins` parameter controls the resolution: fewer bins â†’ smoother shape, more bins â†’ more detail but noisier. Use `density=True` to normalize so the total area equals 1 (useful for probability comparisons).",
      "**Before reading on, predict:** If `data = [72, 85, 91, 63, 77, 88, 95, 70, 82, 76]` and you call `plt.hist(data, bins=5)`, how many bars would the histogram have, and what would each bar's height represent?",
      "**Scatter plot: two quantitative variables.** `plt.scatter(x, y, color='coral', s=40, alpha=0.7)` plots one point per (x, y) pair. `s` is the marker size in pointsÂ². `alpha` controls transparency (0 = invisible, 1 = opaque) â€” useful when many points overlap. Use scatter to look for relationships: linear, curved, clustered, or none.",
      "**Bar chart: one categorical variable.** `plt.bar(categories, values, color='seagreen')` draws one bar per category. The height encodes count or proportion. The x-axis labels are discrete categories â€” the bars are separated by small gaps to signal this. Sort by value with `sorted()` to make comparisons easier.",
      "**Line chart: sequential data.** `plt.plot(xs, ys, color='navy', lw=2, marker='o')` connects consecutive (x, y) points with a line. Use for time series or any ordered sequence where the trend between consecutive points is meaningful. `lw` = line width; `marker` = point style ('o', 's', '^', etc.).",
      "**Pie chart: part-to-whole.** `plt.pie(values, labels=labels, autopct='%1.1f%%')` draws sectors sized proportional to each value. The `autopct` format string controls the percentage display. Best with â‰¤5 categories and large proportion differences. For more categories, a sorted bar chart is more readable.",
      "**Figure size and multiple subplots.** `fig, axes = plt.subplots(nrows, ncols, figsize=(width, height))` creates a grid of plots. `figsize` is in inches. `axes` is a numpy array of Axes objects; index into it with `axes[i]` or `axes[i][j]` for 2D grids. Call chart methods on individual axes: `axes[0].hist(data, bins=10)`. This is the standard pattern for side-by-side comparisons.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Build Any Matplotlib Chart",
        body: `Step 1. Import: \`import matplotlib.pyplot as plt\` (add \`import numpy as np\` if needed).

Step 2. (Optional) Create figure/axes explicitly:
\`fig, ax = plt.subplots(figsize=(8, 5))\`
Then use \`ax.hist()\`, \`ax.scatter()\`, etc.
Or just call \`plt.hist()\`, \`plt.scatter()\` directly on the global figure.

Step 3. Call the chart function:
- Histogram: \`plt.hist(data, bins=10, color='steelblue', edgecolor='white')\`
- Scatter:   \`plt.scatter(x, y, color='coral', s=40, alpha=0.7)\`
- Bar chart: \`plt.bar(categories, values, color='seagreen')\`
- Line:      \`plt.plot(xs, ys, color='navy', lw=2, marker='o')\`
- Pie:       \`plt.pie(values, labels=labels, autopct='%1.1f%%')\`

Step 4. Add labels: \`plt.xlabel('...'), plt.ylabel('...'), plt.title('...')\`

Step 5. Render: \`plt.show()\``,
      },
      {
        type: "insight",
        title: "hist() vs. bar() â€” Choosing the Right Function",
        body: "`plt.hist(data, bins)` â€” pass RAW continuous data as a list. matplotlib computes the bins for you. Use when you have individual observations.\n\n`plt.bar(categories, values)` â€” pass PRE-COMPUTED counts and their category labels. Use when you already have category totals.\n\nCommon mistake: calling `plt.bar()` with raw continuous data. This creates one bar per unique value â€” usually wrong. Always use `plt.hist()` for raw continuous data.",
      },
      {
        type: "warning",
        title: "plt.show() Clears the Figure",
        body: "Calling `plt.show()` renders AND clears the current figure. Any subsequent `plt.hist()` or `plt.plot()` calls will start a fresh figure. To overlay multiple charts on the same axes, add all chart calls BEFORE `plt.show()`:\n\n```python\nplt.scatter(x, y)        # point cloud\nplt.plot(x, trend_line)  # regression line\nplt.show()               # renders both together\n```",
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Histogram bin count and range.** Given raw data with minimum $x_{\\min}$ and maximum $x_{\\max}$, requesting $k$ bins produces edges at $e_0 = x_{\\min}$, $e_1 = x_{\\min} + h$, ..., $e_k = x_{\\max}$, where bin width $h = (x_{\\max} - x_{\\min}) / k$. The count for bin $j$ is $c_j = |\\{x_i : e_{j-1} \\le x_i < e_j\\}|$ (last bin inclusive on the right). When `density=True`, each bar height is $c_j / (n \\cdot h)$ so $\\sum_j c_j / (n \\cdot h) \\cdot h = \\sum_j c_j/n = 1$.",
      "**Sturges' rule for default bin count.** For $n$ observations, Sturges' rule recommends $k = \\lceil \\log_2 n + 1 \\rceil$ bins. matplotlib's `bins='sturges'` implements this. For $n=20$: $k = \\lceil 4.32 + 1 \\rceil = 6$ bins. For $n=100$: $k = 8$ bins. numpy's `bins='fd'` (Freedman-Diaconis) uses IQR instead of variance and is more robust to outliers.",
    ],
  },

  rigor: {
    prose: [
      "**R1 â€” matplotlib's two interfaces.** matplotlib has two coding styles: the `pyplot` (functional) interface (`plt.hist()`, `plt.show()`) and the object-oriented interface (`fig, ax = plt.subplots(); ax.hist(); plt.show()`). Both produce the same output. The pyplot interface is shorter for single plots; the OO interface is required for subplots and for fine-grained control over individual axes. In production code, the OO interface is preferred because it is explicit about which axes each call modifies.",
      "**R2 â€” Why `density=True` matters for comparisons.** If two histograms have different sample sizes ($n_1 \\ne n_2$), their raw-count histograms are not directly comparable â€” the group with more observations will always have taller bars. Setting `density=True` normalizes each histogram to unit area, converting counts to probability density. This makes shape comparisons valid regardless of sample size: the height at $x$ now estimates the probability density $f(x)$, not the count.",
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: 'stat2-002-py1',
        cellTitle: 'Histogram â€” Distribution of Exam Scores',
        prose: `A histogram bins raw continuous data and shows how many values fall in each range. Run this cell, then try changing bins from 5 to 10 to see how the shape changes.`,
        code: `import matplotlib.pyplot as plt

scores = [72, 85, 91, 63, 77, 88, 95, 70, 82, 76,
          58, 89, 74, 67, 93, 81, 71, 86, 62, 78]

print(f"n={len(scores)}, min={min(scores)}, max={max(scores)}")
print(f"mean â‰ˆ {sum(scores)/len(scores):.1f}")

fig, axes = plt.subplots(1, 2, figsize=(12, 4))

# 5 bins
axes[0].hist(scores, bins=5, color='steelblue', edgecolor='white', alpha=0.9)
axes[0].set_title('5 bins â€” coarser view')
axes[0].set_xlabel('Score'); axes[0].set_ylabel('Count')

# 10 bins
axes[1].hist(scores, bins=10, color='tomato', edgecolor='white', alpha=0.9)
axes[1].set_title('10 bins â€” finer view')
axes[1].set_xlabel('Score'); axes[1].set_ylabel('Count')

plt.suptitle('Midterm Score Distribution â€” Effect of Bin Width', fontsize=12, fontweight='bold')
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'stat2-002-py2',
        cellTitle: 'Scatter Plot â€” Study Hours vs. Exam Score',
        prose: `A scatter plot reveals the relationship between two quantitative variables. Each point is one student: (hours studied, exam score). Look for direction, form (linear vs. curved), and outliers.`,
        code: `import matplotlib.pyplot as plt
import numpy as np

hours  = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5,
          6.0, 6.5, 7.0, 7.5, 8.0, 1.0, 3.0, 5.0, 7.0, 4.0]
scores = [52,  57,  63,  65,  70,  73,  78,  79,  85,  86,
          88,  90,  92,  93,  95,  49,  68,  82,  91,  77]

r = np.corrcoef(hours, scores)[0, 1]
print(f"Pearson r = {r:.3f} (strong positive linear association)")
print(f"Range: {min(hours)}â€“{max(hours)} study hours, {min(scores)}â€“{max(scores)} score")

fig, ax = plt.subplots(figsize=(8, 5))
ax.scatter(hours, scores, color='coral', s=60, alpha=0.85, edgecolor='white', zorder=3)

# Add regression line
m, b = np.polyfit(hours, scores, 1)
xr = np.linspace(0, 9, 100)
ax.plot(xr, m * xr + b, color='navy', lw=2, linestyle='--', label=f'y = {m:.1f}x + {b:.1f}')

ax.set_xlabel('Hours Studied'); ax.set_ylabel('Exam Score')
ax.set_title('Hours Studied vs. Exam Score')
ax.legend()
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'stat2-002-py3',
        cellTitle: 'Bar Chart â€” Students Per Major',
        prose: `A bar chart displays pre-computed counts for categorical groups. The categories (majors) have no inherent numeric order â€” you can sort them by count to make comparisons easier. Run this cell and notice how sorting changes readability.`,
        code: `import matplotlib.pyplot as plt

majors = ["CS", "Math", "Physics", "Stats", "Biology"]
counts = [42, 31, 18, 25, 38]

# Sort by count descending
pairs = sorted(zip(counts, majors), reverse=True)
counts_sorted, majors_sorted = zip(*pairs)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Unsorted
axes[0].bar(majors, counts, color='seagreen', alpha=0.85, edgecolor='white')
axes[0].set_title('Unsorted (original order)')
axes[0].set_ylabel('Number of Students')
axes[0].set_ylim(0, 50)

# Sorted
axes[1].bar(majors_sorted, counts_sorted, color='steelblue', alpha=0.85, edgecolor='white')
axes[1].set_title('Sorted by count (easier to compare)')
axes[1].set_ylabel('Number of Students')
axes[1].set_ylim(0, 50)

for ax in axes:
    ax.set_xlabel('Major')

plt.suptitle('Students per Major', fontsize=12, fontweight='bold')
plt.tight_layout()
plt.show()

print("Total students:", sum(counts))`,
      },
      {
        id: 'stat2-002-py4',
        cellTitle: 'Pie Chart and Line Chart',
        prose: `Pie charts show part-to-whole proportions (best with â‰¤5 categories). Line charts show sequential trends over time. Run this cell to see both.`,
        code: `import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Pie chart: grade distribution
grade_labels = ["A", "B", "C", "D", "F"]
grade_values = [22, 35, 28, 10, 5]
colors = ['#2ecc71', '#3498db', '#f39c12', '#e67e22', '#e74c3c']
axes[0].pie(grade_values, labels=grade_labels, autopct='%1.1f%%',
            colors=colors, startangle=90)
axes[0].set_title('Grade Distribution (n=100 students)')

# Line chart: monthly revenue trend
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
revenue = [120, 135, 148, 142, 160, 175, 168, 182, 195, 210, 225, 240]

axes[1].plot(months, revenue, color='navy', lw=2, marker='o', markersize=6)
axes[1].set_title('Monthly Revenue (thousands)')
axes[1].set_xlabel('Month')
axes[1].set_ylabel('Revenue ($K)')
axes[1].tick_params(axis='x', rotation=30)
axes[1].set_ylim(0, 260)

plt.suptitle('Pie Chart (part-to-whole) vs. Line Chart (trend over time)',
             fontsize=11, fontweight='bold')
plt.tight_layout()
plt.show()`,
      },
    ],
  },

  examples: [
    {
      id: "stat2-002-ex1",
      title: "Build a histogram from raw data â€” step by step",
      difficulty: "easy",
      problem:
        "You have commute times (in minutes) for 12 employees: [15, 22, 8, 35, 47, 19, 28, 12, 41, 25, 33, 18]. Write the complete matplotlib code to display a histogram with 4 bins.",
      steps: [
        {
          expression: "\\text{data = [15, 22, 8, 35, 47, 19, 28, 12, 41, 25, 33, 18]}",
          annotation: "Identify the raw data. min = 8, max = 47. These determine the bin range.",
          strategyTitle: "Step 1: Inspect data",
        },
        {
          expression: "h = (47 - 8) / 4 = 9.75 \\text{ â€” 4 bins of width 9.75}",
          annotation:
            "With 4 bins, bin edges fall at roughly 8, 17.75, 27.5, 37.25, 47. Max count per bin is about 3â€“4 values.",
          strategyTitle: "Step 2: Plan the bins",
        },
        {
          expression: "\\texttt{import matplotlib.pyplot as plt}",
          annotation: "Import matplotlib. Convention: alias as plt.",
          strategyTitle: "Step 3: Import",
        },
        {
          expression:
            "\\texttt{plt.hist(commute, bins=4, color='steelblue', edgecolor='white')}",
          annotation:
            "Call hist() with raw data list and bins=4. matplotlib computes bin edges and counts automatically. edgecolor='white' adds thin lines between bars for readability.",
          strategyTitle: "Step 4: Build histogram",
        },
        {
          expression: "\\texttt{plt.xlabel('Commute (min)'); plt.ylabel('Count'); plt.title('...')}",
          annotation: "Add axis labels and title for clarity.",
          strategyTitle: "Step 5: Label",
        },
        {
          expression: "\\texttt{plt.show()}",
          annotation: "Render the figure to the output cell. Must be called after all chart calls.",
          strategyTitle: "Step 6: Show",
        },
      ],
    },
    {
      id: "stat2-002-ex2",
      title: "Scatter plot with trend observation",
      difficulty: "medium",
      problem:
        "Temperature (Â°C) and ice cream sales (units) for 8 days: temp = [18, 21, 25, 28, 30, 33, 35, 27], sales = [120, 145, 190, 230, 265, 310, 335, 210]. Build a scatter plot and describe what you see.",
      steps: [
        {
          expression: "\\text{Two quantitative variables â†’ scatter plot}",
          annotation:
            "Temperature and sales are both continuous quantitative variables. A scatter plot is the correct chart type.",
          strategyTitle: "Step 1: Chart selection",
        },
        {
          expression:
            "\\texttt{plt.scatter(temp, sales, color='coral', s=60, alpha=0.85)}",
          annotation:
            "Plot 8 (temp, sales) pairs as dots. s=60 is the marker size; alpha=0.85 gives slight transparency.",
          strategyTitle: "Step 2: Plot scatter",
        },
        {
          expression:
            "\\texttt{plt.xlabel('Temperature (Â°C)')}\\text{ + title}",
          annotation: "Label both axes. Always include units.",
          strategyTitle: "Step 3: Label",
        },
        {
          expression:
            "\\text{Observation: positive linear relationship}",
          annotation:
            "The 8 points roughly follow a straight line with positive slope. As temperature increases, sales increase proportionally. No obvious outliers or curvature.",
          strategyTitle: "Step 4: Interpret",
        },
      ],
    },
    {
      id: "stat2-002-ex3",
      title: "Bar chart: survey response frequencies",
      difficulty: "easy",
      problem:
        "A satisfaction survey had 5 response options. Results: Very Satisfied=48, Satisfied=62, Neutral=25, Dissatisfied=14, Very Dissatisfied=9. Build a sorted bar chart.",
      steps: [
        {
          expression: "\\text{Pre-computed category counts â†’ plt.bar()}",
          annotation:
            "Category totals are already computed. Use plt.bar(), not plt.hist(). The x-axis will be discrete labels, not a continuous number line.",
          strategyTitle: "Step 1: Identify chart type",
        },
        {
          expression:
            "\\texttt{labels = ['V.Sat', 'Sat', 'Neutral', 'Dissat', 'V.Dissat']}",
          annotation: "Store category labels and their counts as matching lists.",
          strategyTitle: "Step 2: Prepare data",
        },
        {
          expression:
            "\\texttt{plt.bar(labels, [48, 62, 25, 14, 9], color='steelblue')}",
          annotation:
            "Each label gets one bar of the corresponding height. Categories are not reordered by default â€” sort explicitly if desired.",
          strategyTitle: "Step 3: Build chart",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat2-002-ch1",
      title: "Overlay a regression line on a scatter plot",
      difficulty: "medium",
      problem:
        "Using the hours/scores data from cell 2 (hours=[1,1.5,...,4.0], scores=[52,57,...,77]), write code to: (a) plot the scatter points in navy, (b) compute a linear regression line using np.polyfit, and (c) overlay the regression line in red. Call plt.show() once at the end.",
      walkthrough: [
        {
          expression: "\\texttt{import numpy as np; m, b = np.polyfit(hours, scores, 1)}",
          annotation: "np.polyfit(x, y, degree) returns [slope, intercept] for a degree-1 polynomial. m is slope, b is intercept.",
        },
        {
          expression: "\\texttt{plt.scatter(hours, scores, color='navy', s=50)}",
          annotation: "Plot the data points first.",
        },
        {
          expression: "\\texttt{xr = np.linspace(0, 9, 100); plt.plot(xr, m*xr+b, color='red', lw=2)}",
          annotation:
            "Create a dense range of x values, compute the fitted y = mx+b for each, and plot as a line. Calling plt.scatter() then plt.plot() before plt.show() overlays both on the same axes.",
        },
        {
          expression: "\\texttt{plt.show()}",
          annotation:
            "Call show() once after all chart calls. Both the scatter and the regression line will appear in the same figure.",
        },
      ],
      answer:
        "Call plt.scatter() for the points and plt.plot() for the regression line, then plt.show() once at the end to render both on the same axes.",
    },
    {
      id: "stat2-002-ch2",
      title: "Density histogram for distribution comparison",
      difficulty: "hard",
      problem:
        "You have 30 daily temperature readings: [14,16,18,19,20,21,21,22,22,23,23,24,24,24,25,25,25,26,26,27,27,28,28,29,30,31,32,33,35,38]. Build a histogram with density=True and bins=7. Add a normal distribution curve overlay using scipy.stats.norm. This lets you visually test whether the temperatures follow a normal distribution.",
      walkthrough: [
        {
          expression:
            "\\texttt{import numpy as np; from scipy import stats}",
          annotation: "Import numpy for array operations and scipy.stats for the normal distribution.",
        },
        {
          expression:
            "\\texttt{plt.hist(temps, bins=7, density=True, color='teal', edgecolor='white', alpha=0.7)}",
          annotation:
            "density=True normalizes bar heights so total area = 1. This makes the y-axis a probability density, enabling overlay with a probability distribution.",
        },
        {
          expression:
            "\\mu = \\bar{x}, \\quad \\sigma = s \\quad \\text{(sample mean and std)}",
          annotation: "Fit a normal distribution to the data using np.mean() and np.std().",
        },
        {
          expression:
            "\\texttt{xr = np.linspace(12, 40, 200); plt.plot(xr, stats.norm.pdf(xr, mu, sigma), 'r-', lw=2)}",
          annotation:
            "Overlay the normal PDF (probability density function) in red. If the histogram bars roughly follow this curve, the data is approximately normal.",
        },
      ],
      answer:
        "Use density=True in plt.hist(), compute sample mean and std, then overlay scipy.stats.norm.pdf evaluated at a fine x-range.",
    },
  ],

  checkpoints: [
    {
      id: "cp-stat2-002-1",
      label: "Read: describe the matplotlib three-step pattern (import, chart function, show)",
      type: "read",
    },
    {
      id: "cp-stat2-002-2",
      label: "Lab: run cell 1 and change bins from 5 to 10 â€” describe what changes",
      type: "lab",
    },
    {
      id: "cp-stat2-002-3",
      label: "Lab: run cell 2 and identify the student with the most hours but a below-average score",
      type: "lab",
    },
    {
      id: "cp-stat2-002-4",
      label: "Read: explain when to use plt.hist() vs. plt.bar()",
      type: "read",
    },
    {
      id: "cp-stat2-002-5",
      label: "Complete example 1: write histogram code for commute times from scratch",
      type: "example",
    },
    {
      id: "cp-stat2-002-6",
      label: "Lab: run cell 3 and explain why the sorted version is easier to read",
      type: "lab",
    },
    {
      id: "cp-stat2-002-7",
      label: "Attempt challenge 1: overlay a regression line on a scatter plot",
      type: "challenge",
    },
    {
      id: "cp-stat2-002-8",
      label: "Read: explain why density=True is needed when comparing two histograms with different sample sizes",
      type: "read",
    },
  ],

  quiz: [
    {
      type: 'choice',
      question: `What does calling \`plt.hist(data, bins=8)\` do with the raw data list?`,
      options: [
        `Draws one bar per unique value in data`,
        `Divides the data range into 8 equal-width intervals and counts how many values fall in each`,
        `Draws 8 points connected by a line`,
        `Sorts data and draws the top 8 values`,
      ],
      answer: `Divides the data range into 8 equal-width intervals and counts how many values fall in each`,
      hints: [`plt.hist() bins continuous data automatically. The bins parameter controls how many intervals to create.`],
      reviewSection: 'Intuition â€” Histogram paragraph',
    },
    {
      type: 'choice',
      question: `You have category counts: Region A=30, Region B=45, Region C=20. Which matplotlib call is correct?`,
      options: [
        `plt.hist([30, 45, 20], bins=3)`,
        `plt.bar(['A', 'B', 'C'], [30, 45, 20])`,
        `plt.scatter(['A', 'B', 'C'], [30, 45, 20])`,
        `plt.plot([30, 45, 20])`,
      ],
      answer: `plt.bar(['A', 'B', 'C'], [30, 45, 20])`,
      hints: [`The data is pre-computed category counts â€” use plt.bar(), not plt.hist(). plt.hist() takes raw continuous data.`],
      reviewSection: 'Insight callout â€” hist() vs. bar()',
    },
    {
      type: 'choice',
      question: `What is the purpose of \`density=True\` in \`plt.hist(data, bins=10, density=True)\`?`,
      options: [
        `It makes the bars more densely packed together`,
        `It normalizes bar heights so the total area of all bars equals 1`,
        `It increases the number of bins`,
        `It adds a smooth KDE curve overlay`,
      ],
      answer: `It normalizes bar heights so the total area of all bars equals 1`,
      hints: [`A probability density integrates to 1. density=True converts counts to densities, enabling comparison with probability distributions.`],
      reviewSection: 'Math section â€” histogram bin count',
    },
    {
      type: 'choice',
      question: `A scatter plot is appropriate when:`,
      options: [
        `You have one categorical and one quantitative variable`,
        `You have two quantitative variables and want to explore their relationship`,
        `You have one quantitative variable and want to show its distribution`,
        `You have proportions of a whole and want to show part-to-whole`,
      ],
      answer: `You have two quantitative variables and want to explore their relationship`,
      hints: [`Think: how many variables? What type? Scatter uses both axes for quantitative scales.`],
      reviewSection: 'Intuition â€” Scatter plot paragraph',
    },
    {
      type: 'choice',
      question: `You call plt.scatter(x, y) followed by plt.plot(x, trend). What does calling plt.show() once at the end produce?`,
      options: [
        `Two separate figures`,
        `Only the last chart called (plot overwrites scatter)`,
        `A single figure with both the scatter points and the line overlaid`,
        `An error because you can't mix chart types`,
      ],
      answer: `A single figure with both the scatter points and the line overlaid`,
      hints: [`plt.show() renders everything accumulated since the last show(). Multiple chart calls before show() overlay on the same axes.`],
      reviewSection: 'Warning callout â€” plt.show() clears the figure',
    },
    {
      type: 'choice',
      question: `Which matplotlib function is best for plotting a company's monthly revenue over 12 months?`,
      options: [`plt.hist()`, `plt.bar()`, `plt.plot()`, `plt.pie()`],
      answer: `plt.plot()`,
      hints: [`Monthly revenue over time is sequential and ordered â€” a line chart shows how the value changes between consecutive months.`],
      reviewSection: 'Intuition â€” Line chart paragraph',
    },
    {
      type: 'choice',
      question: `You use \`fig, axes = plt.subplots(1, 2, figsize=(12, 5))\`. How do you add a histogram to the LEFT subplot?`,
      options: [
        `plt.hist(data, bins=10)`,
        `axes[0].hist(data, bins=10)`,
        `axes[1].hist(data, bins=10)`,
        `fig.hist(data, bins=10)`,
      ],
      answer: `axes[0].hist(data, bins=10)`,
      hints: [`plt.subplots() returns an array of Axes objects. Index 0 = left subplot, index 1 = right subplot. Call chart methods on individual axes objects.`],
      reviewSection: 'Intuition â€” subplots paragraph',
    },
    {
      type: 'choice',
      question: `The \`alpha\` parameter in \`plt.scatter(x, y, alpha=0.3)\` controls:`,
      options: [
        `The marker shape`,
        `The marker size`,
        `The transparency of points (0 = invisible, 1 = fully opaque)`,
        `The color saturation`,
      ],
      answer: `The transparency of points (0 = invisible, 1 = fully opaque)`,
      hints: [`Alpha = transparency. alpha=0.3 means 30% opaque. When many points overlap, lower alpha lets overlapping points appear darker.`],
      reviewSection: 'Intuition â€” scatter plot paragraph',
    },
    {
      type: 'choice',
      question: `A dataset has 1000 observations. Using Sturges' rule âŒˆlogâ‚‚(n) + 1âŒ‰, how many histogram bins does it recommend?`,
      options: [`8`, `11`, `20`, `32`],
      answer: `11`,
      hints: [`logâ‚‚(1000) â‰ˆ 9.97. k = âŒˆ9.97 + 1âŒ‰ = âŒˆ10.97âŒ‰ = 11.`],
      reviewSection: 'Math section â€” Sturges rule',
    },
    {
      type: 'choice',
      question: `When is a pie chart the BEST choice over a bar chart?`,
      options: [
        `When you have more than 10 categories`,
        `When you have 3â€“5 categories with clearly different proportions and want to show part-to-whole`,
        `When comparing distributions across groups`,
        `When showing a trend over time`,
      ],
      answer: `When you have 3â€“5 categories with clearly different proportions and want to show part-to-whole`,
      hints: [`Pie charts work best with few categories (â‰¤5) where the proportions are large enough to distinguish by eye. For comparisons, bar charts are more accurate.`],
      reviewSection: 'Intuition â€” pie chart paragraph',
    },
  ],

  definitions: [
    { term: 'plt.hist()', definition: 'matplotlib function that bins raw continuous data and draws a histogram. Takes raw data; computes bins automatically.', symbol: null },
    { term: 'density=True', definition: 'Histogram normalization option: converts bar heights from counts to probability densities so total area = 1.', symbol: null },
    { term: 'plt.subplots()', definition: 'Creates a figure and a grid of Axes objects for side-by-side or multi-panel plots.', symbol: null },
    { term: 'alpha', definition: 'Transparency parameter: 0 = invisible, 1 = fully opaque. Useful for overplotting in scatter plots.', symbol: null },
  ],
};
