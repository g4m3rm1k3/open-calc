export default {
  id: "stat2-001",
  slug: "what-is-data-visualization",
  chapter: "stat2",
  order: 1,
  title: "What Is Data Visualization?",
  subtitle: "The right chart for the right question â€” and why it matters.",
  tags: [
    "data visualization",
    "chart types",
    "Anscombe quartet",
    "exploratory data analysis",
    "variable types",
  ],
  aliases:
    "EDA chart selection histogram bar chart scatter plot box plot data types visualization principles",
  timeToComplete: 25,
  coreConcept:
    "Data visualization converts numerical information into geometric shapes the visual cortex can interpret in milliseconds. The choice of chart type is not aesthetic â€” it is determined by the type of variables and the statistical question being asked.",
  prerequisites: ["stat1-001"],
  nextLesson: "stat2-002",

  hook: {
    question:
      "Four datasets have the exact same mean, variance, and correlation. Are they the same?",
    realWorldContext:
      "In 1973, statistician Frank Anscombe constructed four datasets now known as Anscombe's Quartet. Every dataset has: mean of x â‰ˆ 9.0, mean of y â‰ˆ 7.5, variance of x â‰ˆ 11.0, variance of y â‰ˆ 4.1, correlation â‰ˆ 0.816, regression line y = 3.0 + 0.5x. If you looked only at these summary statistics, you would conclude the four datasets are essentially identical. But when you plot them, they are wildly different: Dataset I is a cloud of points around a linear trend. Dataset II is a perfect curved parabola â€” linear regression is completely wrong. Dataset III is perfectly linear except for one massive outlier that is pulling the regression line. Dataset IV is eight points with identical x-values and one outlier at a completely different x. The lesson Anscombe wanted to teach: always visualize your data before fitting any model. Summary statistics can hide the actual structure of the data.",
  },

  intuition: {
    prose: [
      "**What visualization does that statistics cannot.** The human visual system can detect patterns in 2D space in under 200 milliseconds â€” clustering, trends, outliers, gaps, and asymmetries that would take several statistical tests to detect numerically. A well-chosen plot is a high-bandwidth diagnostic: it transmits many statistical properties simultaneously. A summary statistic (mean, correlation, variance) is a severe compression: it throws away everything except the single quantity it measures.",
      "**The variable type determines the chart type.** Before choosing a chart, answer two questions: (1) How many variables? (2) What type is each variable â€” categorical (nominal or ordinal) or quantitative (continuous or discrete)?\n\n**One quantitative variable:** histogram or boxplot (distribution shape, center, spread, outliers).\n**One categorical variable:** bar chart (frequencies, proportions).\n**Two quantitative variables:** scatter plot (association, form, direction, strength).\n**One quantitative + one categorical:** side-by-side boxplots or grouped bar chart (comparison of distributions across groups).\n**Change over time (quantitative):** line chart (trends, seasonality, abrupt shifts).\n**Part-to-whole (proportions of a whole):** pie chart or stacked bar (only use pie charts for â‰¤5 categories with large proportion differences).",
      "**Before reading on, predict:** An analyst wants to compare the distribution of annual salaries across five job titles. Name two chart types that could work and explain which is better and why.",
      "**Histogram vs. bar chart â€” a common confusion.** Bar charts display frequencies of categorical groups. Each bar is a separate category, and there is no ordering constraint (you can reorder the bars freely). Histograms display the distribution of a single quantitative variable: the x-axis is a continuous number line, bars represent bins (ranges), and bar width encodes bin width. The bars touch because the number line is continuous. You cannot reorder the bars without destroying the meaning. A histogram shows shape (skew, modality, spread); a bar chart shows category comparisons.",
      "**Scatter plots reveal what correlations hide.** Anscombe's Quartet showed four datasets with correlation â‰ˆ 0.816. Dataset I: a genuinely linear relationship. Dataset II: a curved relationship where linear correlation is misleading. Dataset III: a perfectly linear relationship with one outlier, which dominates the fit. Dataset IV: an artificial construct. The correlation coefficient $r$ measures linear association â€” it says nothing about nonlinearity, outliers, or heteroscedasticity. Plot first; fit second.",
      "**Principles for honest visualization.** Edward Tufte's guidelines:\n- Maximize data-ink ratio: every pixel of ink should encode data. Remove unnecessary gridlines, borders, background fills.\n- Do not truncate the y-axis at a value other than zero for bar charts â€” this visually inflates differences.\n- Do not use 3D charts â€” they distort perceived areas and depths.\n- Label directly rather than via legend when possible â€” direct labels reduce cognitive load.\n- Choose bin sizes in histograms carefully: too few bins hide structure, too many create noise.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Selecting a Chart Type",
        body: "Step 1. Identify each variable: categorical (nominal/ordinal) or quantitative (discrete/continuous).\n\nStep 2. Determine the primary statistical question: distribution? comparison across groups? relationship between two variables? trend over time? part-to-whole?\n\nStep 3. Map to chart type:\n- 1 quantitative variable â†’ histogram (distribution shape) or boxplot (outlier detection)\n- 1 categorical â†’ bar chart\n- 2 quantitative â†’ scatter plot\n- 1 quantitative + 1 categorical â†’ grouped boxplots or grouped bar chart\n- Sequential over time â†’ line chart\n- Part of a whole (â‰¤5 parts) â†’ pie chart\n\nStep 4. Verify: does the chart honestly represent the data? Check axis scale, bin widths, and whether 3D distortion was added.",
      },
      {
        type: "insight",
        title: "Anscombe's Quartet â€” The Core Lesson",
        body: "Always plot your data before computing summary statistics or fitting models.\n\nAnscombe's four datasets have identical: mean(x), mean(y), var(x), var(y), correlation, and regression line. They are visually and structurally completely different.\n\n- Dataset I: appropriate for linear regression.\n- Dataset II: curved â€” needs polynomial or transformation.\n- Dataset III: linear except one outlier â€” investigate the outlier before fitting.\n- Dataset IV: absurd â€” regression is meaningless, this is not a real dataset structure.\n\nThis failure of summary statistics motivates EDA (Exploratory Data Analysis) as the mandatory first step in any analysis.",
      },
      {
        type: "warning",
        title: "Five Common Visualization Mistakes",
        body: "1. **Truncated y-axis on bar charts:** starting the y-axis at 58 instead of 0 makes a 2% difference look like a 100% difference.\n2. **Using pie charts with too many categories:** with 12 slices of similar size, no one can read the chart.\n3. **Using bar charts for continuous distributions:** use a histogram instead; bar charts imply the x-axis categories are unordered.\n4. **3D charts:** perspective distortion makes smaller categories look larger or smaller than they are.\n5. **Connecting dots that are not time series:** a line chart implies continuity between the connected points. If the x-axis is categories (not time), use a bar chart or scatter plot.",
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Bin width and Sturges' rule.** For a histogram with $n$ observations, a common default bin count is Sturges' rule: $k = \\lceil \\log_2 n + 1 \\rceil$. For $n=100$: $k = \\lceil 6.64 + 1 \\rceil = 8$ bins. For $n=1000$: $k = 11$ bins. The bin width is $h = (x_{\\max} - x_{\\min}) / k$. Other rules include Scott's rule $h = 3.49\\hat{\\sigma}/n^{1/3}$ and the Freedman-Diaconis rule $h = 2 \\cdot \\text{IQR} / n^{1/3}$. Freedman-Diaconis is robust to outliers because it uses the IQR instead of the standard deviation.",
      "**Data-ink ratio.** Tufte defines the data-ink ratio as (data ink) / (total ink used). Data ink = the ink that encodes data and cannot be removed without losing information. Non-data ink includes decorative borders, background shading, 3D effects, redundant gridlines. The principle: maximize the ratio. Equivalent formulations: (1) erase non-data ink, (2) erase redundant data ink. In practice: remove gridlines that are not needed for reading specific values, remove chart borders, remove fill colors that do not encode data.",
    ],
  },

  rigor: {
    prose: [
      '**R1 â€” Perception and preattentive attributes.** Colin Ware\'s vision science research identifies "preattentive attributes" â€” visual properties processed in parallel before conscious attention: color hue, color intensity, orientation, length, size, shape, motion. Bar chart lengths are processed preattentively â€” you perceive "longer bar = more" without effort. Angles in pie charts are not fully preattentive â€” the brain must work harder to compare two non-adjacent slices. This is why bar charts are more accurate for comparison tasks than pie charts, even when both encode the same data (Cleveland & McGill, 1984).',
      "**R2 â€” Overplotting in scatter plots.** When thousands of points overlap in a scatter plot, the visual impression is distorted â€” dense regions appear as solid blobs. Solutions: (1) Alpha transparency: set each point to 10â€“20% opacity so overlapping points accumulate to darker colors. (2) Jitter: add small random noise to discrete variables to separate overlapping points. (3) Hex bins or 2D density plots: aggregate points into cells and color by count. (4) Sample: randomly display a representative subset if N is very large (>100,000).",
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: 'stat2-001-py1',
        cellTitle: 'Bar Chart vs. Histogram â€” Not the Same Thing',
        prose: `A bar chart displays counts for categorical groups (x-axis = discrete categories). A histogram displays the distribution of a continuous variable (x-axis = a numeric scale; bars touch because the scale is continuous). Run this cell to see both side by side.`,
        code: `import numpy as np
import matplotlib.pyplot as plt
from collections import Counter

# Categorical data â†’ bar chart
favorite_colors = ["Blue", "Red", "Blue", "Green", "Blue", "Red",
                   "Green", "Blue", "Yellow", "Red", "Blue", "Green"]
color_counts = Counter(favorite_colors)
sorted_items = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)
labels, values = zip(*sorted_items)

print("Favorite colors (categorical):")
for lbl, val in zip(labels, values):
    print(f"  {lbl:<8}: {'â–ˆ' * val} ({val})")

# Continuous data â†’ histogram
np.random.seed(42)
heights = np.random.normal(170, 8, 200)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].bar(labels, values, color='steelblue', alpha=0.85, edgecolor='white')
axes[0].set_title('Bar Chart â€” Categorical Variable\\n(bars separated; order arbitrary)', fontsize=11)
axes[0].set_ylabel('Count')
axes[0].set_ylim(0, max(values) + 1)

axes[1].hist(heights, bins=15, color='tomato', alpha=0.8, edgecolor='white')
axes[1].set_title('Histogram â€” Continuous Variable\\n(bars touch; order is fixed by number line)', fontsize=11)
axes[1].set_xlabel('Height (cm)')
axes[1].set_ylabel('Frequency')

plt.suptitle('Bar Chart vs. Histogram', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.show()`,
      },
      {
        id: 'stat2-001-py2',
        cellTitle: "Anscombe's Quartet â€” Same Statistics, Different Structures",
        prose: `Four datasets that share nearly identical mean, variance, correlation, and regression line â€” yet look completely different when plotted. This is the strongest argument for always plotting your data before modeling.`,
        code: `import numpy as np
import matplotlib.pyplot as plt

anscombe = {
    'Dataset I':   {'x': [10,8,13,9,11,14,6,4,12,7,5],  'y': [8.04,6.95,7.58,8.81,8.33,9.96,7.24,4.26,10.84,4.82,5.68]},
    'Dataset II':  {'x': [10,8,13,9,11,14,6,4,12,7,5],  'y': [9.14,8.14,8.74,8.77,9.26,8.10,6.13,3.10,9.13,7.26,4.74]},
    'Dataset III': {'x': [10,8,13,9,11,14,6,4,12,7,5],  'y': [7.46,6.77,12.74,7.11,7.81,8.84,6.08,5.39,8.15,6.42,5.73]},
    'Dataset IV':  {'x': [8,8,8,8,8,8,8,19,8,8,8],      'y': [6.58,5.76,7.71,8.84,8.47,7.04,5.25,12.50,5.56,7.91,6.89]},
}

fig, axes = plt.subplots(2, 2, figsize=(10, 8))
axes = axes.flatten()

for ax, (name, d) in zip(axes, anscombe.items()):
    x, y = np.array(d['x']), np.array(d['y'])
    r = np.corrcoef(x, y)[0, 1]
    m, b = np.polyfit(x, y, 1)
    xr = np.linspace(2, 21, 100)
    ax.scatter(x, y, color='steelblue', s=60, zorder=3)
    ax.plot(xr, m * xr + b, color='tomato', lw=2, label=f'y={m:.2f}x+{b:.2f}')
    ax.set_title(f'{name}   r = {r:.3f}', fontsize=11)
    ax.set_xlim(2, 21); ax.set_ylim(2, 14)
    ax.legend(fontsize=8)

plt.suptitle("Anscombe's Quartet â€” Identical Summary Statistics, Wildly Different Plots",
             fontsize=11, fontweight='bold')
plt.tight_layout()
plt.show()

print("All four datasets share nearly the same:")
print("  mean(x) â‰ˆ 9.0  |  mean(y) â‰ˆ 7.5")
print("  var(x)  â‰ˆ 11.0 |  var(y)  â‰ˆ 4.1")
print("  r â‰ˆ 0.816  |  regression: y â‰ˆ 3.0 + 0.5x")
print()
print("But structurally they are completely different.")
print("â†’ Always plot before computing or fitting.")`,
      },
      {
        id: 'stat2-001-py3',
        cellTitle: 'Misleading vs. Honest Y-Axis',
        prose: `Truncating a bar chart's y-axis inflates visual differences. The same data can look like a dramatic change or a minor one depending on where the y-axis starts. Run this to see both versions of the same data.`,
        code: `import matplotlib.pyplot as plt

months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
product_a = [100, 102, 101, 103, 102, 104]
product_b = [100, 105, 108, 112, 115, 120]

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Misleading: y-axis starts at 99
axes[0].plot(months, product_a, 'o-', color='steelblue', label='Product A', lw=2, ms=7)
axes[0].plot(months, product_b, 's-', color='tomato', label='Product B', lw=2, ms=7)
axes[0].set_ylim(99, 121)
axes[0].set_title('MISLEADING: y-axis starts at 99\\n(Product A appears completely flat)', color='red', fontsize=11)
axes[0].legend(); axes[0].set_ylabel('Sales (units)')

# Honest: y-axis starts at 0
axes[1].plot(months, product_a, 'o-', color='steelblue', label='Product A', lw=2, ms=7)
axes[1].plot(months, product_b, 's-', color='tomato', label='Product B', lw=2, ms=7)
axes[1].set_ylim(0, 130)
axes[1].set_title('HONEST: y-axis starts at 0\\n(Both growing; B grows faster)', color='green', fontsize=11)
axes[1].legend(); axes[1].set_ylabel('Sales (units)')

print("Product A: 100 â†’ 104  (+4.0% over 6 months)")
print("Product B: 100 â†’ 120  (+20.0% over 6 months)")
print()
print("Misleading chart: the y-axis range is 99â€“121 = 22 units.")
print("Product A's 4-unit rise occupies 4/22 = 18% of chart height â€” looks dramatic.")
print("Honest chart: 4-unit rise on a 0â€“130 scale = 3% of chart height â€” its true proportion.")

plt.tight_layout()
plt.show()`,
      },
    ],
  },

  examples: [
    {
      id: "stat2-001-ex1",
      title: "Choose the right chart for each question",
      difficulty: "easy",
      problem:
        "For each scenario, name the best chart type and justify it in one sentence.\n(a) Distribution of heights (continuous) in a sample of 200 adults.\n(b) Number of sales per product category (6 categories) for a retail store.\n(c) Relationship between advertising spend and revenue across 50 campaigns.\n(d) Temperature readings every day for one year.",
      steps: [
        {
          expression: "\\text{(a) Heights: histogram}",
          annotation:
            "One continuous quantitative variable. A histogram shows the distribution shape â€” is it symmetric? skewed? bimodal? Are there outliers? A bar chart would be wrong because height is continuous, not categorical.",
          strategyTitle: "(a) One continuous variable",
        },
        {
          expression: "\\text{(b) Sales per category: bar chart}",
          annotation:
            "One categorical variable with a count/frequency for each level. Bars can be ordered by value for easy comparison. The 6 categories are distinct, unordered groups.",
          strategyTitle: "(b) One categorical variable",
        },
        {
          expression: "\\text{(c) Ad spend vs. revenue: scatter plot}",
          annotation:
            "Two quantitative variables. A scatter plot reveals: Is the relationship linear? Curved? Strong or weak? Are there outliers (campaigns that over- or under-performed)? A correlation coefficient alone would miss nonlinearity.",
          strategyTitle: "(c) Two quantitative variables",
        },
        {
          expression: "\\text{(d) Temperature over one year: line chart}",
          annotation:
            "One quantitative variable (temperature) measured sequentially over time. The line connects consecutive measurements, encoding the temporal continuity and making trends, seasonality, and abrupt shifts visible.",
          strategyTitle: "(d) Sequential over time",
        },
      ],
    },
    {
      id: "stat2-001-ex2",
      title: "Diagnose what Anscombe's Quartet reveals",
      difficulty: "medium",
      problem:
        "Dataset II in Anscombe's Quartet has x values 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 and y values 3.1, 4.7, 6.1, 7.3, 8.1, 8.8, 8.8, 8.5, 7.9, 6.9, 5.5. The correlation is 0.816 and the regression line is y = 3.0 + 0.5x. (a) What does the scatter plot reveal that the correlation missed? (b) What model is appropriate?",
      steps: [
        {
          expression:
            "\\text{Plot: y increases from x=4 to x=9, then decreases â€” a clear parabola}",
          annotation:
            "The relationship is perfectly curved. y rises, peaks around x=9, then falls. A scatter plot reveals this immediately. The correlation coefficient only measures linear association â€” it can be high even for a perfect curve if the trend is roughly increasing.",
          strategyTitle: "Step 1: What the plot shows",
        },
        {
          expression:
            "r = 0.816 \\text{ misleads: it measures linear fit quality, not curve quality}",
          annotation:
            'r = 0.816 indicates "strong positive linear association." But the relationship is not linear â€” it is quadratic. A linear model will systematically underpredict at the extremes and overpredict in the middle.',
          strategyTitle: "Step 2: Why correlation misleads",
        },
        {
          expression:
            "y \\approx \\beta_0 + \\beta_1 x + \\beta_2 x^2 \\text{ (quadratic regression)}",
          annotation:
            "The appropriate model is a quadratic (second-degree polynomial) regression, not a linear one. This would be discovered only by plotting the data first â€” summary statistics alone gave no indication.",
          strategyTitle: "Step 3: Appropriate model",
        },
      ],
    },
    {
      id: "stat2-001-ex3",
      title: "Identify visualization errors",
      difficulty: "medium",
      problem:
        "A bar chart comparing two products' satisfaction scores shows Product A at 87% and Product B at 83%. The y-axis starts at 80% and ends at 90%. A pie chart with 15 categories is shown alongside. Identify all errors.",
      steps: [
        {
          expression: "\\text{Error 1: Truncated y-axis (bar chart)}",
          annotation:
            "The y-axis starts at 80%, not 0%. The bar for Product A appears twice as tall as Product B visually, but the actual difference is 87 - 83 = 4 percentage points, which is only a 4.8% relative difference. The chart implies a ~100% difference. Fix: start the y-axis at 0%.",
          strategyTitle: "Error 1: y-axis truncation",
        },
        {
          expression: "\\text{Error 2: Pie chart with 15 categories}",
          annotation:
            "A pie chart is unreadable with 15 slices of similar size. The human eye cannot accurately compare angles and arc lengths, especially for adjacent slices. Fix: use a bar chart, sorted by frequency, for more than 5â€“6 categories.",
          strategyTitle: "Error 2: Too many pie slices",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat2-001-ch1",
      title: "Diagnose a misleading chart",
      difficulty: "medium",
      problem:
        'A news article shows a line chart of company stock price. The y-axis runs from $98 to $102. The stock went from $99.50 to $101.00 over 6 months. The headline reads "Stock surges 52% in six months." (a) Compute the actual percentage change. (b) Explain the visual distortion. (c) Describe the honest chart.',
      walkthrough: [
        {
          expression:
            "\\text{Actual \\% change} = \\frac{101.00 - 99.50}{99.50} \\times 100 = \\frac{1.50}{99.50} \\times 100 \\approx 1.5\\%",
          annotation:
            "The actual change is about $1.50 on a $99.50 base â€” approximately 1.5%, not 52%. The 52% headline is wrong or refers to a different metric.",
        },
        {
          expression:
            "\\text{Visual distortion: y-axis from \\$98 to \\$102 compresses \\$99.50 â†’ \\$101.00 into a large visual jump}",
          annotation:
            "The chart uses a 4-dollar y-axis range for a stock whose full range is only $1.50. This makes the $1.50 increase occupy ~37% of the chart height, implying a dramatic surge.",
        },
        {
          expression:
            "\\text{Honest chart: y-axis from \\$0 (or at minimum shows the full proportional context)}",
          annotation:
            "For a stock chart where the baseline matters, the y-axis should start at $0, making it obvious that $1.50 on a $100 stock is a small change. Alternatively, explicitly label the percentage change on the chart rather than relying on visual impression.",
        },
      ],
      answer:
        "Actual change is ~1.5%. The chart truncates the y-axis, making a small change appear dramatic. Fix: start the y-axis at $0 or explicitly annotate the true percentage change.",
    },
    {
      id: "stat2-001-ch2",
      title: "Match Anscombe datasets to appropriate actions",
      difficulty: "hard",
      problem:
        "For each Anscombe dataset description, state: (a) what the scatter plot reveals, (b) whether linear regression is appropriate, and (c) the recommended next analytical step.\n\nDataset I: points scattered roughly around a line with no obvious pattern in residuals.\nDataset III: points tightly on a line except one point far above the line at x=13.\nDataset IV: eight points at x=8 (all with different y values), one isolated point at x=19.",
      walkthrough: [
        {
          expression:
            "\\text{Dataset I: linear trend, random scatter â†’ linear regression appropriate}",
          annotation:
            "(a) A genuine linear relationship with random noise around the line. (b) Yes, linear regression is appropriate. (c) Proceed with fitting, check residual plot for remaining patterns.",
        },
        {
          expression: "\\text{Dataset III: linear except one outlier at x=13}",
          annotation:
            "(a) Almost perfectly linear, but one point (x=13) is a high-leverage outlier that dramatically shifts the regression line. (b) Linear regression is technically applicable but the one outlier dominates the fit. (c) Investigate the outlier: Is it a data entry error? A genuine extreme observation? Fit regression with and without it and report both. Do not automatically delete it.",
        },
        {
          expression:
            "\\text{Dataset IV: 9 points at x=8, one isolated point at x=19}",
          annotation:
            '(a) Not a real bivariate relationship â€” the x variable has almost no variance. Linear regression produces a line through the x=19 point and the mean of the x=8 cluster. (b) No â€” meaningful regression requires variation in x across a range, not two clusters. (c) Question whether regression is the right analysis. The "relationship" is entirely driven by one extreme point.',
        },
      ],
      answer:
        "Dataset I: linear regression appropriate. Dataset III: investigate the outlier at x=13 before fitting. Dataset IV: regression is inappropriate â€” insufficient x-variation, results driven by a single extreme point.",
    },
    ,
    {
      id: "stat2-001-ch3",
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
      {
        symbol: "k",
        meaning:
          "Number of histogram bins â€” determines resolution; too few hides shape, too many creates noise",
      },
      { symbol: "h", meaning: "Histogram bin width: h = (x_max âˆ’ x_min) / k" },
      {
        symbol: "r",
        meaning:
          "Pearson correlation â€” measures only LINEAR association; ignores curve shape, outlier structure, heteroscedasticity",
      },
    ],
    rulesOfThumb: [
      "Always plot the data before computing summary statistics or fitting a model.",
      "Bar chart â†’ categorical variable. Histogram â†’ continuous variable. They are not interchangeable.",
      "Scatter plot for two quantitative variables â€” correlation alone is not sufficient.",
      "Line chart only for sequential (time-ordered) data â€” connecting unordered dots is misleading.",
      "Pie charts: â‰¤5 categories with clearly different proportions. Otherwise use a bar chart.",
      "Never truncate a bar chart y-axis below zero â€” it inflates visual differences.",
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      {
        lessonId: "stat2-002",
        label: "Python for Data Visualization",
        note: "stat2-002 implements these chart types using the opencalc Figure API in actual code.",
      },
      {
        lessonId: "stat3-001",
        label: "Measures of Center",
        note: "Histograms and boxplots visualize distributions whose center and spread are quantified by mean, median, variance, IQR in stat3.",
      },
      {
        lessonId: "stat8-001",
        label: "Linear Regression",
        note: "Scatter plots are the visual diagnostic for regression â€” residual plots (a form of scatter plot) are used throughout stat8.",
      },
    ],
  },

  definitions: [
    { term: "data visualization", definition: "The encoding of numerical information as geometric shapes (bars, points, lines, areas) that the visual system can interpret rapidly. A well-chosen chart transmits multiple statistical properties simultaneously — distribution shape, outliers, trends, and group comparisons — that summary statistics alone cannot convey." },
    { term: "exploratory data analysis (EDA)", definition: "The mandatory first phase of data analysis: inspect distributions, identify outliers, visualize relationships, and check assumptions before fitting models. Coined by John Tukey. Anscombe's Quartet is the canonical argument for EDA — four datasets with identical statistics but different structures." },
    { term: "histogram", definition: "A chart for one continuous quantitative variable. The x-axis is a continuous number line divided into bins; bar height = count (or density) within each bin. Bars touch because the scale is continuous — gaps imply no data in that range. Order is fixed and cannot be changed." },
    { term: "bar chart", definition: "A chart for one categorical variable. Each bar represents a category; bar height = frequency, count, or mean. Bars are separated by gaps because categories are discrete and unordered — you can reorder bars freely without losing meaning. Not interchangeable with a histogram." },
    { term: "Anscombe's Quartet", definition: "Four datasets constructed by F.J. Anscombe (1973) that share nearly identical summary statistics (mean, variance, correlation ≈ 0.816, regression line y ≈ 3 + 0.5x) but have completely different scatter plot structures: linear, curved, one-outlier, and degenerate. The canonical demonstration that visualization is essential before modeling." },
    { term: "data-ink ratio", definition: "Tufte's principle: data-ink ratio = ink encoding data / total ink. Maximize it by erasing non-data ink (decorative borders, background fills, redundant gridlines). Every pixel of ink should either encode data or be removed." },
  ],

  checkpoints: [
    {
      id: "cp-stat2-001-1",
      label: "Read: name four chart types and the variable type each requires",
      type: "read",
    },
    {
      id: "cp-stat2-001-2",
      label:
        "Read: explain Anscombe's Quartet and the principle it demonstrates",
      type: "read",
    },
    {
      id: "cp-stat2-001-3",
      label:
        "Read: distinguish histogram from bar chart with one key structural difference",
      type: "read",
    },
    {
      id: "cp-stat2-001-4",
      label:
        "Apply chart selection procedure to example 1 before reading the solutions",
      type: "example",
    },
    {
      id: "cp-stat2-001-5",
      label:
        "Complete example 3: identify both visualization errors before reading",
      type: "example",
    },
    {
      id: "cp-stat2-001-6",
      label:
        "Attempt challenge 1: compute the actual percentage change and explain the distortion",
      type: "challenge",
    },
    {
      id: "cp-stat2-001-7",
      label: "Read: state Tufte's data-ink ratio principle and one consequence",
      type: "read",
    },
    {
      id: "cp-stat2-001-8",
      label: "Read: explain why Pearson r can be 0.816 for a curved dataset",
      type: "read",
    },
  ],

  assessment: {
    questions: [
      {
        id: "stat2-001-assess-1",
        type: "choice",
        text: "Which chart type is most appropriate for displaying the relationship between two continuous quantitative variables?",
        options: ["Bar chart", "Pie chart", "Scatter plot", "Histogram"],
        answer: "Scatter plot",
        instructions:
          "Think about which chart uses both axes to encode quantitative values.",
      },
    ],
  },

  quiz: [
    {
      id: "stat2-001-quiz-1",
      type: "choice",
      text: "A histogram differs from a bar chart primarily because:",
      options: [
        "Histograms use colors; bar charts do not",
        "Histograms display continuous quantitative data with touching bars; bar charts display categorical data with separate bars",
        "Bar charts can only show two groups; histograms can show more",
        "Histograms are only for time series data",
      ],
      answer:
        "Histograms display continuous quantitative data with touching bars; bar charts display categorical data with separate bars",
      hints: [
        "What does the x-axis represent in each chart type?",
        "Can you reorder the bars of a histogram without losing meaning?",
      ],
      reviewSection: 'Intuition â†’ "Histogram vs. bar chart" paragraph',
    },
    {
      id: "stat2-001-quiz-2",
      type: "choice",
      text: "Anscombe's Quartet demonstrates that:",
      options: [
        "Mean and standard deviation are always sufficient to describe a dataset",
        "Correlation is a better measure than regression",
        "Summary statistics can be identical for very different datasets â€” always visualize before modeling",
        "Scatter plots are only useful for linear relationships",
      ],
      answer:
        "Summary statistics can be identical for very different datasets â€” always visualize before modeling",
      hints: [
        "All four datasets have the same mean, variance, correlation, and regression line.",
        "What is different between them?",
      ],
      reviewSection: "Hook â€” Anscombe's Quartet",
    },
    {
      id: "stat2-001-quiz-3",
      type: "choice",
      text: "A bar chart's y-axis starts at 80% instead of 0%. The effect is:",
      options: [
        "It focuses attention on the relevant range of values",
        "It visually inflates differences between bars, misrepresenting their relative magnitude",
        "It makes the chart more accurate by reducing white space",
        "It is acceptable practice when all values are above 75%",
      ],
      answer:
        "It visually inflates differences between bars, misrepresenting their relative magnitude",
      hints: [
        "Bar length encodes value. If the y-axis starts at 80%, a bar representing 82% appears to be 2 units tall, but visually it could look twice as tall as 80%.",
        "This is one of Tufte's key data honesty violations.",
      ],
      reviewSection: "Warning callout â€” Five Common Visualization Mistakes",
    },
    {
      id: "stat2-001-quiz-4",
      type: "choice",
      text: "Which is the best chart to compare the distribution of test scores for five different schools?",
      options: [
        "Five separate pie charts",
        "Side-by-side boxplots",
        "A single histogram with all schools combined",
        "A line chart",
      ],
      answer: "Side-by-side boxplots",
      hints: [
        "You need to compare distributions (not just counts) across a categorical grouping variable.",
        "Boxplots show median, IQR, and outliers simultaneously.",
      ],
      reviewSection: "Intuition â†’ variable type â†’ chart type table",
    },
    {
      id: "stat2-001-quiz-5",
      type: "choice",
      text: "When should you use a line chart instead of a scatter plot?",
      options: [
        "When you have more than 100 data points",
        "When the x-axis represents time or an ordered sequence where consecutive points are meaningfully connected",
        "When both variables are categorical",
        "When the relationship is nonlinear",
      ],
      answer:
        "When the x-axis represents time or an ordered sequence where consecutive points are meaningfully connected",
      hints: [
        "What does drawing a line between points imply about the space between them?",
        "A line chart implies continuity and order.",
      ],
      reviewSection: "Intuition â†’ chart selection table",
    },
    {
      id: "stat2-001-quiz-6",
      type: "choice",
      text: "Pearson's correlation coefficient r = 0.95 for a dataset. You should conclude:",
      options: [
        "The two variables have a strong linear relationship â€” no further investigation needed",
        "The relationship is causal",
        "The correlation is strong, but you should still plot the data to check for nonlinearity, outliers, or clusters",
        "A regression model will predict perfectly",
      ],
      answer:
        "The correlation is strong, but you should still plot the data to check for nonlinearity, outliers, or clusters",
      hints: [
        "What does Anscombe's Quartet show about datasets with r â‰ˆ 0.816?",
        "r measures only linear association.",
      ],
      reviewSection:
        'Intuition â†’ "Scatter plots reveal what correlations hide"',
    },
    {
      type: 'choice',
      question: `Tufte's "data-ink ratio" principle says you should:`,
      options: [
        `Maximize the total ink used so the chart looks professional`,
        `Remove non-data ink (gridlines, borders, backgrounds) that adds no information`,
        `Use color gradients to fill chart backgrounds for aesthetic appeal`,
        `Always include a legend even when labels are already on the chart`,
      ],
      answer: `Remove non-data ink (gridlines, borders, backgrounds) that adds no information`,
      hints: [`Data ink = ink that encodes data; non-data ink = decorative ink. Maximize the ratio data-ink/total-ink.`],
      reviewSection: 'Math section â€” data-ink ratio',
    },
    {
      type: 'choice',
      question: `A dataset has 400 observations. Using Sturges' rule, approximately how many histogram bins should you use?`,
      options: [`5`, `9`, `20`, `40`],
      answer: `9`,
      hints: [`Sturges' rule: k = âŒˆlogâ‚‚(n) + 1âŒ‰. logâ‚‚(400) â‰ˆ 8.64, so k = âŒˆ8.64 + 1âŒ‰ = âŒˆ9.64âŒ‰ = 10. Closest answer is 9.`],
      reviewSection: 'Math section â€” Sturges rule',
    },
    {
      type: 'choice',
      question: `In a scatter plot of 50,000 points, most points overlap and the chart looks like a solid blob. The best remedy is:`,
      options: [
        `Switch to a line chart`,
        `Use alpha transparency or a 2D density / hex-bin plot`,
        `Remove all points and just show the regression line`,
        `Switch to a bar chart`,
      ],
      answer: `Use alpha transparency or a 2D density / hex-bin plot`,
      hints: [`Overplotting hides structure. Transparency accumulates: overlapping semi-transparent points appear darker. Hex bins count points per cell and color by density.`],
      reviewSection: 'Rigor â†’ overplotting section',
    },
    {
      type: 'choice',
      question: `Why are bar charts more accurate for comparison tasks than pie charts, according to vision science research?`,
      options: [
        `Bar charts use more colors`,
        `Bar chart lengths are processed preattentively, while pie chart angles require more cognitive effort to compare`,
        `Pie charts can only show two categories`,
        `Bar charts display absolute counts while pie charts only show percentages`,
      ],
      answer: `Bar chart lengths are processed preattentively, while pie chart angles require more cognitive effort to compare`,
      hints: [`Preattentive attributes are processed in parallel before conscious attention. Length/position is preattentive; angle comparison is not.`],
      reviewSection: 'Rigor â€” preattentive attributes',
    },
  ],

  misconceptions: [
    {
      falseBelief: "A pie chart is always a good way to show proportions.",
      whyStudentsThinkIt:
        'Pie charts are the most common "proportions" chart in popular media and business presentations.',
      correctionExample:
        "A pie chart with 10 slices of 8â€“12% each is unreadable â€” the angles are too similar to distinguish. A sorted bar chart with percentage labels is faster to read and allows direct comparison between any two categories.",
      contrastCase:
        "A pie chart with 3 categories (60%, 30%, 10%) works well because the angle differences are large enough to perceive preattentively.",
    },
    {
      falseBelief: "More complex charts (3D, animated) are more informative.",
      whyStudentsThinkIt:
        "Visual complexity is associated with effort and sophistication. Students confuse visual complexity with informational richness.",
      correctionExample:
        "A 3D bar chart introduces perspective distortion that makes bars in the back appear shorter than equally-tall bars in the front. The extra dimension encodes nothing but actively misleads the reader.",
      contrastCase:
        "A heat map with a well-chosen color scale can display a 20x20 matrix of values more honestly than any 3D surface chart of the same data.",
    },
    {
      falseBelief:
        "Histograms and bar charts are the same thing with different names.",
      whyStudentsThinkIt:
        "Both use rectangular bars. In many visualization tools, they look similar and are even created by the same function with different arguments.",
      correctionExample:
        'A bar chart of "number of students per major" has separate bars for Chemistry, English, Math â€” you can reorder them freely. A histogram of "exam scores" has contiguous bars for 60â€“70, 70â€“80, 80â€“90 â€” the order is fixed by the number line. Reordering would be meaningless.',
      contrastCase:
        "In Python/R, `plt.bar()` and `plt.hist()` look similar but operate differently: `hist()` bins raw continuous data automatically; `bar()` expects pre-computed category counts.",
    },
  ],

  transferPrompts: [
    {
      situation:
        "A public health department has data on: (1) vaccination rate by county (continuous, 0â€“100%), (2) hospitalization rate by county (continuous), and (3) county classification (Urban/Suburban/Rural). They want to show the relationship between vaccination and hospitalization AND how it differs by county type.",
      competingTechniques: [
        "Three separate scatter plots (one per county type)",
        "One scatter plot with three colors for county type",
        "A bar chart of average hospitalization per county type",
      ],
      whyThisTechniqueWins:
        "A single scatter plot with color-coded county types (Urban=blue, Suburban=orange, Rural=green) communicates the most information: the overall vaccination-hospitalization relationship, how the three groups cluster spatially, and whether the relationship differs in slope or strength across groups. Three separate plots split the visual comparison that the reader needs to make. The bar chart discards the continuous vaccination rate information.",
    },
    {
      situation:
        "You have daily stock closing prices for the past 2 years (730 data points). You want to: (a) show the price trend over time, and (b) show the distribution of daily returns (% change day-to-day).",
      competingTechniques: [
        "One chart for both",
        "Two separate charts: line chart for trend, histogram for return distribution",
        "Scatter plot of price vs. return",
      ],
      whyThisTechniqueWins:
        "(a) Line chart for price trend: the x-axis is time (ordered, sequential), a line chart shows the temporal path of prices including bull runs, crashes, and plateaus. (b) Histogram for daily returns: returns are a continuous distribution â€” does it follow a bell curve? Is it fat-tailed (more extreme days than a normal distribution predicts)? These are two different questions requiring two different chart types. A single chart would obscure at least one question.",
    },
  ],

  debugging: [
    {
      commonError:
        "Using a bar chart for a continuous variable (e.g., showing test score ranges as categories).",
      symptom:
        'The x-axis shows labels like "60-70", "70-80", "80-90" as separate categorical bars with gaps between them.',
      whyItHappened:
        "The analyst manually created score buckets and treated them as categories. Many BI tools (Tableau, Power BI) default to categorical bar charts, requiring explicit selection of histogram mode.",
      repairStrategy:
        "Use a histogram directly on the raw continuous data. Gaps between bars imply no observations exist in that range â€” which is false for a continuous variable. Histogram bars must touch because the underlying scale is continuous.",
    },
    {
      commonError:
        "Interpreting a high correlation as proof of a linear relationship.",
      symptom:
        'A regression report shows r = 0.90 and the analyst concludes "the linear model is a good fit without examining residuals or a scatter plot."',
      whyItHappened:
        'r = 0.90 is conventionally described as "very strong." Students learn this label and skip the plot.',
      repairStrategy:
        "Always produce the scatter plot and residual plot before concluding a linear model is appropriate. r can be high for curved relationships, data with one influential outlier, or data with clusters. The residual plot (residuals vs. fitted values) reveals systematic pattern if the linear model is wrong.",
    },
  ],

  mastery: {
    targetLevel:
      "Apply (Level 3) â€” given a dataset description with variable types and an analytical question, select the appropriate chart type with justification, and identify at least two ways a given chart could be misleading.",
    solveIndependently:
      "Given a dataset with three variables (types specified), select the most appropriate chart type, draw a rough sketch labeling axes, and justify the choice in terms of variable types and the question being answered.",
    explainVerbally:
      "Explain Anscombe's Quartet: why four datasets with identical summary statistics are fundamentally different and what principle this teaches about data analysis workflow.",
    detectIncorrectApplication:
      "Identify at least three visualization errors in a given chart (truncated axis, wrong chart type, 3D distortion, pie with too many slices) and propose specific fixes for each.",
    transferToUnfamiliar:
      "Given a novel dataset and research question not covered in lessons, select and justify the visualization approach using the chart selection procedure.",
  },
};
