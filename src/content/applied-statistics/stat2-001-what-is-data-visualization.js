export default {
  id: "stat2-001",
  slug: "what-is-data-visualization",
  chapter: "stat2",
  order: 1,
  title: "What Is Data Visualization?",
  subtitle: "The right chart for the right question — and why it matters.",
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
    "Data visualization converts numerical information into geometric shapes the visual cortex can interpret in milliseconds. The choice of chart type is not aesthetic — it is determined by the type of variables and the statistical question being asked.",
  prerequisites: ["stat1-001"],
  nextLesson: "stat2-002",

  hook: {
    question:
      "Four datasets have the exact same mean, variance, and correlation. Are they the same?",
    realWorldContext:
      "In 1973, statistician Frank Anscombe constructed four datasets now known as Anscombe's Quartet. Every dataset has: mean of x ≈ 9.0, mean of y ≈ 7.5, variance of x ≈ 11.0, variance of y ≈ 4.1, correlation ≈ 0.816, regression line y = 3.0 + 0.5x. If you looked only at these summary statistics, you would conclude the four datasets are essentially identical. But when you plot them, they are wildly different: Dataset I is a cloud of points around a linear trend. Dataset II is a perfect curved parabola — linear regression is completely wrong. Dataset III is perfectly linear except for one massive outlier that is pulling the regression line. Dataset IV is eight points with identical x-values and one outlier at a completely different x. The lesson Anscombe wanted to teach: always visualize your data before fitting any model. Summary statistics can hide the actual structure of the data.",
  },

  intuition: {
    prose: [
      "**What visualization does that statistics cannot.** The human visual system can detect patterns in 2D space in under 200 milliseconds — clustering, trends, outliers, gaps, and asymmetries that would take several statistical tests to detect numerically. A well-chosen plot is a high-bandwidth diagnostic: it transmits many statistical properties simultaneously. A summary statistic (mean, correlation, variance) is a severe compression: it throws away everything except the single quantity it measures.",
      "**The variable type determines the chart type.** Before choosing a chart, answer two questions: (1) How many variables? (2) What type is each variable — categorical (nominal or ordinal) or quantitative (continuous or discrete)?\n\n**One quantitative variable:** histogram or boxplot (distribution shape, center, spread, outliers).\n**One categorical variable:** bar chart (frequencies, proportions).\n**Two quantitative variables:** scatter plot (association, form, direction, strength).\n**One quantitative + one categorical:** side-by-side boxplots or grouped bar chart (comparison of distributions across groups).\n**Change over time (quantitative):** line chart (trends, seasonality, abrupt shifts).\n**Part-to-whole (proportions of a whole):** pie chart or stacked bar (only use pie charts for ≤5 categories with large proportion differences).",
      "**Before reading on, predict:** An analyst wants to compare the distribution of annual salaries across five job titles. Name two chart types that could work and explain which is better and why.",
      "**Histogram vs. bar chart — a common confusion.** Bar charts display frequencies of categorical groups. Each bar is a separate category, and there is no ordering constraint (you can reorder the bars freely). Histograms display the distribution of a single quantitative variable: the x-axis is a continuous number line, bars represent bins (ranges), and bar width encodes bin width. The bars touch because the number line is continuous. You cannot reorder the bars without destroying the meaning. A histogram shows shape (skew, modality, spread); a bar chart shows category comparisons.",
      "**Scatter plots reveal what correlations hide.** Anscombe's Quartet showed four datasets with correlation ≈ 0.816. Dataset I: a genuinely linear relationship. Dataset II: a curved relationship where linear correlation is misleading. Dataset III: a perfectly linear relationship with one outlier, which dominates the fit. Dataset IV: an artificial construct. The correlation coefficient $r$ measures linear association — it says nothing about nonlinearity, outliers, or heteroscedasticity. Plot first; fit second.",
      "**Principles for honest visualization.** Edward Tufte's guidelines:\n- Maximize data-ink ratio: every pixel of ink should encode data. Remove unnecessary gridlines, borders, background fills.\n- Do not truncate the y-axis at a value other than zero for bar charts — this visually inflates differences.\n- Do not use 3D charts — they distort perceived areas and depths.\n- Label directly rather than via legend when possible — direct labels reduce cognitive load.\n- Choose bin sizes in histograms carefully: too few bins hide structure, too many create noise.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Selecting a Chart Type",
        body: "Step 1. Identify each variable: categorical (nominal/ordinal) or quantitative (discrete/continuous).\n\nStep 2. Determine the primary statistical question: distribution? comparison across groups? relationship between two variables? trend over time? part-to-whole?\n\nStep 3. Map to chart type:\n- 1 quantitative variable → histogram (distribution shape) or boxplot (outlier detection)\n- 1 categorical → bar chart\n- 2 quantitative → scatter plot\n- 1 quantitative + 1 categorical → grouped boxplots or grouped bar chart\n- Sequential over time → line chart\n- Part of a whole (≤5 parts) → pie chart\n\nStep 4. Verify: does the chart honestly represent the data? Check axis scale, bin widths, and whether 3D distortion was added.",
      },
      {
        type: "insight",
        title: "Anscombe's Quartet — The Core Lesson",
        body: "Always plot your data before computing summary statistics or fitting models.\n\nAnscombe's four datasets have identical: mean(x), mean(y), var(x), var(y), correlation, and regression line. They are visually and structurally completely different.\n\n- Dataset I: appropriate for linear regression.\n- Dataset II: curved — needs polynomial or transformation.\n- Dataset III: linear except one outlier — investigate the outlier before fitting.\n- Dataset IV: absurd — regression is meaningless, this is not a real dataset structure.\n\nThis failure of summary statistics motivates EDA (Exploratory Data Analysis) as the mandatory first step in any analysis.",
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
      '**R1 — Perception and preattentive attributes.** Colin Ware\'s vision science research identifies "preattentive attributes" — visual properties processed in parallel before conscious attention: color hue, color intensity, orientation, length, size, shape, motion. Bar chart lengths are processed preattentively — you perceive "longer bar = more" without effort. Angles in pie charts are not fully preattentive — the brain must work harder to compare two non-adjacent slices. This is why bar charts are more accurate for comparison tasks than pie charts, even when both encode the same data (Cleveland & McGill, 1984).',
      "**R2 — Overplotting in scatter plots.** When thousands of points overlap in a scatter plot, the visual impression is distorted — dense regions appear as solid blobs. Solutions: (1) Alpha transparency: set each point to 10–20% opacity so overlapping points accumulate to darker colors. (2) Jitter: add small random noise to discrete variables to separate overlapping points. (3) Hex bins or 2D density plots: aggregate points into cells and color by count. (4) Sample: randomly display a representative subset if N is very large (>100,000).",
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: "stat2-001-cell-1",
        type: "python",
        cellTitle: "Choose the right chart type for each variable",
        code: `# Decide which chart is appropriate for each variable type

# --- Categorical variable → Bar chart ---
favorite_colors = ["Blue", "Red", "Blue", "Green", "Blue", "Red",
                   "Green", "Blue", "Yellow", "Red", "Blue", "Green"]

from collections import Counter
color_counts = Counter(favorite_colors)
sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)

labels = [item[0] for item in sorted_colors]
values = [item[1] for item in sorted_colors]

print("Favorite colors (categorical) → Bar chart:")
for lbl, val in zip(labels, values):
    bar = "█" * val
    print(f"  {lbl:<8}: {bar} ({val})")

fig = Figure(width=7, height=5)
fig.axes(xmin=-0.5, xmax=len(labels)-0.5, ymin=0, ymax=max(values)+1)
fig.bars(labels=labels, values=values, color="steelblue")
fig.text((len(labels)-1)/2, max(values)+0.7, "Favorite Colors", size=12, bold=True)
fig.show()
`,
        instructions:
          "Bar charts work for categorical data because the x-axis categories have no inherent numeric order. The bars are separated by gaps to show this. If the variable were ordered (e.g., satisfaction level: Low/Medium/High), we would preserve that order rather than sorting by frequency.",
      },
      {
        id: "stat2-001-cell-2",
        type: "python",
        cellTitle:
          "Misleading vs. honest visualization — the same data told two ways",
        code: `# Sales data for two products
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
product_a = [100, 102, 101, 103, 102, 104]
product_b = [100, 105, 108, 112, 115, 120]

# --- MISLEADING: y-axis starts at 99 (exaggerates Product A's "flat" line)
fig1 = Figure(width=8, height=5)
fig1.axes(xmin=0, xmax=5, ymin=99, ymax=121)
for i, (a, b) in enumerate(zip(product_a, product_b)):
    fig1.point(i, a, color="steelblue", size=6)
    fig1.point(i, b, color="tomato", size=6)
    if i > 0:
        fig1.line(i-1, product_a[i-1], i, product_a[i], color="steelblue")
        fig1.line(i-1, product_b[i-1], i, product_b[i], color="tomato")
fig1.text(2.5, 120.5, "MISLEADING: Y starts at 99", size=11, bold=True)
fig1.show()

print("\nProduct A range: 100–104 (4% change)")
print("Product B range: 100–120 (20% change)")
print("Both charts show identical data — but truncated y-axis")
print("makes Product A look FLAT when it actually grew slightly.")
`,
        instructions:
          "When the y-axis does not start at zero, small differences get magnified. This is one of the most common chart manipulations in media and business reports. Ask: does the y-axis start at zero? If not, is there a good reason, and is it labeled clearly?",
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
            "One continuous quantitative variable. A histogram shows the distribution shape — is it symmetric? skewed? bimodal? Are there outliers? A bar chart would be wrong because height is continuous, not categorical.",
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
            "\\text{Plot: y increases from x=4 to x=9, then decreases — a clear parabola}",
          annotation:
            "The relationship is perfectly curved. y rises, peaks around x=9, then falls. A scatter plot reveals this immediately. The correlation coefficient only measures linear association — it can be high even for a perfect curve if the trend is roughly increasing.",
          strategyTitle: "Step 1: What the plot shows",
        },
        {
          expression:
            "r = 0.816 \\text{ misleads: it measures linear fit quality, not curve quality}",
          annotation:
            'r = 0.816 indicates "strong positive linear association." But the relationship is not linear — it is quadratic. A linear model will systematically underpredict at the extremes and overpredict in the middle.',
          strategyTitle: "Step 2: Why correlation misleads",
        },
        {
          expression:
            "y \\approx \\beta_0 + \\beta_1 x + \\beta_2 x^2 \\text{ (quadratic regression)}",
          annotation:
            "The appropriate model is a quadratic (second-degree polynomial) regression, not a linear one. This would be discovered only by plotting the data first — summary statistics alone gave no indication.",
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
            "A pie chart is unreadable with 15 slices of similar size. The human eye cannot accurately compare angles and arc lengths, especially for adjacent slices. Fix: use a bar chart, sorted by frequency, for more than 5–6 categories.",
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
            "The actual change is about $1.50 on a $99.50 base — approximately 1.5%, not 52%. The 52% headline is wrong or refers to a different metric.",
        },
        {
          expression:
            "\\text{Visual distortion: y-axis from \\$98 to \\$102 compresses \\$99.50 → \\$101.00 into a large visual jump}",
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
            "\\text{Dataset I: linear trend, random scatter → linear regression appropriate}",
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
            '(a) Not a real bivariate relationship — the x variable has almost no variance. Linear regression produces a line through the x=19 point and the mean of the x=8 cluster. (b) No — meaningful regression requires variation in x across a range, not two clusters. (c) Question whether regression is the right analysis. The "relationship" is entirely driven by one extreme point.',
        },
      ],
      answer:
        "Dataset I: linear regression appropriate. Dataset III: investigate the outlier at x=13 before fitting. Dataset IV: regression is inappropriate — insufficient x-variation, results driven by a single extreme point.",
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
          "Number of histogram bins — determines resolution; too few hides shape, too many creates noise",
      },
      { symbol: "h", meaning: "Histogram bin width: h = (x_max − x_min) / k" },
      {
        symbol: "r",
        meaning:
          "Pearson correlation — measures only LINEAR association; ignores curve shape, outlier structure, heteroscedasticity",
      },
    ],
    rulesOfThumb: [
      "Always plot the data before computing summary statistics or fitting a model.",
      "Bar chart → categorical variable. Histogram → continuous variable. They are not interchangeable.",
      "Scatter plot for two quantitative variables — correlation alone is not sufficient.",
      "Line chart only for sequential (time-ordered) data — connecting unordered dots is misleading.",
      "Pie charts: ≤5 categories with clearly different proportions. Otherwise use a bar chart.",
      "Never truncate a bar chart y-axis below zero — it inflates visual differences.",
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
        note: "Scatter plots are the visual diagnostic for regression — residual plots (a form of scatter plot) are used throughout stat8.",
      },
    ],
  },

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
      reviewSection: 'Intuition → "Histogram vs. bar chart" paragraph',
    },
    {
      id: "stat2-001-quiz-2",
      type: "choice",
      text: "Anscombe's Quartet demonstrates that:",
      options: [
        "Mean and standard deviation are always sufficient to describe a dataset",
        "Correlation is a better measure than regression",
        "Summary statistics can be identical for very different datasets — always visualize before modeling",
        "Scatter plots are only useful for linear relationships",
      ],
      answer:
        "Summary statistics can be identical for very different datasets — always visualize before modeling",
      hints: [
        "All four datasets have the same mean, variance, correlation, and regression line.",
        "What is different between them?",
      ],
      reviewSection: "Hook — Anscombe's Quartet",
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
      reviewSection: "Warning callout — Five Common Visualization Mistakes",
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
      reviewSection: "Intuition → variable type → chart type table",
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
      reviewSection: "Intuition → chart selection table",
    },
    {
      id: "stat2-001-quiz-6",
      type: "choice",
      text: "Pearson's correlation coefficient r = 0.95 for a dataset. You should conclude:",
      options: [
        "The two variables have a strong linear relationship — no further investigation needed",
        "The relationship is causal",
        "The correlation is strong, but you should still plot the data to check for nonlinearity, outliers, or clusters",
        "A regression model will predict perfectly",
      ],
      answer:
        "The correlation is strong, but you should still plot the data to check for nonlinearity, outliers, or clusters",
      hints: [
        "What does Anscombe's Quartet show about datasets with r ≈ 0.816?",
        "r measures only linear association.",
      ],
      reviewSection:
        'Intuition → "Scatter plots reveal what correlations hide"',
    },
  ],

  misconceptions: [
    {
      falseBelief: "A pie chart is always a good way to show proportions.",
      whyStudentsThinkIt:
        'Pie charts are the most common "proportions" chart in popular media and business presentations.',
      correctionExample:
        "A pie chart with 10 slices of 8–12% each is unreadable — the angles are too similar to distinguish. A sorted bar chart with percentage labels is faster to read and allows direct comparison between any two categories.",
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
        'A bar chart of "number of students per major" has separate bars for Chemistry, English, Math — you can reorder them freely. A histogram of "exam scores" has contiguous bars for 60–70, 70–80, 80–90 — the order is fixed by the number line. Reordering would be meaningless.',
      contrastCase:
        "In Python/R, `plt.bar()` and `plt.hist()` look similar but operate differently: `hist()` bins raw continuous data automatically; `bar()` expects pre-computed category counts.",
    },
  ],

  transferPrompts: [
    {
      situation:
        "A public health department has data on: (1) vaccination rate by county (continuous, 0–100%), (2) hospitalization rate by county (continuous), and (3) county classification (Urban/Suburban/Rural). They want to show the relationship between vaccination and hospitalization AND how it differs by county type.",
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
        "(a) Line chart for price trend: the x-axis is time (ordered, sequential), a line chart shows the temporal path of prices including bull runs, crashes, and plateaus. (b) Histogram for daily returns: returns are a continuous distribution — does it follow a bell curve? Is it fat-tailed (more extreme days than a normal distribution predicts)? These are two different questions requiring two different chart types. A single chart would obscure at least one question.",
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
        "Use a histogram directly on the raw continuous data. Gaps between bars imply no observations exist in that range — which is false for a continuous variable. Histogram bars must touch because the underlying scale is continuous.",
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
      "Apply (Level 3) — given a dataset description with variable types and an analytical question, select the appropriate chart type with justification, and identify at least two ways a given chart could be misleading.",
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
