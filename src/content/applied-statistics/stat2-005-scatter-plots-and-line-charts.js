export default {
  id: "stat2-005",
  slug: "scatter-plots-and-line-charts",
  chapter: "stat2",
  order: 5,
  title: "Scatter Plots and Line Charts",
  subtitle:
    "Visualizing relationships between quantitative variables and trends over time.",
  tags: [
    "scatter plot",
    "line chart",
    "correlation",
    "trend",
    "time series",
    "association",
    "direction",
    "form",
    "strength",
    "outliers",
  ],
  aliases:
    "scatter plot scatter diagram line chart time series correlation association trend outlier fig.scatter fig.plot linear nonlinear",
  timeToComplete: 35,
  coreConcept:
    "A scatter plot shows the relationship between two quantitative variables — direction, form, strength, and outliers. A line chart connects sequential data points to show trends or changes over time. The correlation coefficient r quantifies linear strength but misses non-linear patterns, clusters, and influential points that are immediately visible in a scatter plot.",
  prerequisites: ["stat2-002", "stat2-003"],
  nextLesson: "stat2-006",

  hook: {
    question:
      "Two datasets both have r = 0.70. Are their scatter plots the same?",
    realWorldContext:
      'Not at all. Dataset A might show a tight cluster of points along a straight line — a genuine strong linear relationship. Dataset B might show a broad oval cloud with a few outliers pulling r upward — the "relationship" is mostly driven by two extreme observations. Dataset C might show a perfect S-curve that happens to have overall r = 0.70 because the curve is monotone. All three have r = 0.70 but require completely different analytical approaches. The scatter plot reveals what r cannot: the shape of the relationship, whether there are distinct subgroups, and which points are influential. This is why the scatter plot is the mandatory first step before any regression analysis.',
  },

  intuition: {
    prose: [
      "**Four features to describe in every scatter plot.** When you look at a scatter plot, describe four things:\n1. **Direction:** Positive association (as x increases, y increases) or negative (as x increases, y decreases)?\n2. **Form:** Linear (points scatter around a line) or nonlinear (curved, S-shaped, parabolic)?\n3. **Strength:** How tightly do points cluster around the trend? Strong (close together), moderate (some scatter), weak (widely scattered)?\n4. **Unusual features:** Outliers (isolated points far from the main cloud), influential points (points that would greatly change the regression line if removed), clusters or gaps (two separate groups of points).",
      '**Correlation coefficient r recap.** The Pearson correlation $r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i-\\bar{x})^2 \\cdot \\sum(y_i-\\bar{y})^2}}$ is a number between -1 and +1 that measures the strength and direction of the LINEAR association between x and y. Conventions: |r| ≥ 0.8 = strong, 0.5 ≤ |r| < 0.8 = moderate, |r| < 0.5 = weak. Important limits: r measures only linear association (a perfect parabola has r ≈ 0 if symmetric); r is sensitive to outliers (one extreme point can shift r by 0.3 or more); r = 0 does not mean "no relationship" — it means no linear relationship.',
      "**Before reading on, predict:** You have monthly average temperature (x) and monthly energy consumption (y, electricity + heating) for a city over one year. Would you expect r to be positive, negative, or near zero? Would the scatter plot be linear?",
      "**Line charts for time series.** A line chart is a scatter plot where (1) the x-axis is time (or an ordered sequence) and (2) consecutive points are connected by line segments. The line encoding makes the temporal progression visible — you see upward trends, downward trends, plateaus, seasonal cycles, and abrupt jumps. Use a line chart when: the x-axis is genuinely time-ordered, consecutive values are meaningfully connected (the line between them represents a trajectory), and you want to show change over time rather than the distribution at one point in time.",
      "**Scatter plot with a trend line overlay.** To add a linear trend line to a scatter plot, compute the regression line $\\hat{y} = b_0 + b_1 x$ and plot it using `fig.plot()` with a few points on the line. The trend line helps the reader see the overall direction and form, especially when the scatter is moderate to weak. (Regression details are in stat8; here we focus on the visual.)",
      "**Overplotting.** When many data points have similar x and y values (e.g., integer-valued scores with lots of ties), points overlap into a blob. The visual density of the blob does not accurately represent the actual point density. Use `alpha` (transparency) in `fig.scatter()` to show overlapping points as darker regions. Add a small amount of random jitter (small noise on x or y) to spread overlapping discrete values.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Describing a Scatter Plot",
        body: 'Step 1. Direction: Do points trend upward (positive) or downward (negative) left to right? Or no trend?\n\nStep 2. Form: Do the points roughly follow a straight line? A curve? A U-shape? Multiple clusters?\n\nStep 3. Strength: Are points tightly packed around the trend (strong) or widely scattered (weak)?\n\nStep 4. Unusual features: Are there isolated points far from the main cloud (outliers)? Are there two separate groups (clusters)? Are there any points that would dramatically change a regression line if removed (influential points — typically extreme x-values)?\n\nStep 5. Write a one-sentence summary combining all four: "There is a [strong/moderate/weak] [positive/negative] [linear/curved] association between x and y, with [one notable outlier at x=..., y=...]."',
      },
      {
        type: "insight",
        title: "Influential Points vs. Outliers",
        body: "An **outlier** is a point that does not follow the overall pattern of the data — it has an unusually large residual (vertical distance from the regression line).\n\nAn **influential point** is a point whose removal would substantially change the regression line. An influential point is almost always at an extreme x-value (high leverage).\n\nA point can be:\n- An outlier but not influential: a point with unusual y-value but average x-value. It increases scatter (se) but does not strongly pull the line.\n- Influential but not an outlier: a point with extreme x-value that happens to fall on the existing trend line. It strongly constrains the line position but fits the pattern.\n- Both: a point with extreme x and unusual y — the most dangerous case. It pulls the regression line toward itself, away from the true relationship.\n\nAlways check: what happens to the regression line if you remove that point?",
      },
      {
        type: "warning",
        title: "Correlation Is Not the Full Story",
        body: 'r = 0 does NOT mean "no relationship" — it means no LINEAR relationship. A perfect parabola (y = x²) has r = 0 if centered at x=0.\n\nr is sensitive to outliers. One extreme point at (x=100, y=100) in a dataset of points clustered near (0,0) with no correlation can create r = 0.9.\n\nr does not distinguish: one linear relationship vs. two separate clusters vs. a curved trend vs. an outlier-driven apparent trend. Plot first.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Pearson r formula and interpretation.** $r = \\frac{1}{n-1}\\sum_{i=1}^n \\left(\\frac{x_i - \\bar{x}}{s_x}\\right)\\left(\\frac{y_i - \\bar{y}}{s_y}\\right)$. The term in each pair of parentheses is the z-score of each observation. $r$ is the average product of z-scores. When x and y tend to be jointly large or jointly small (same direction deviations from mean), the products are positive and $r > 0$. When one is large while the other is small, products are negative and $r < 0$. The $r^2$ (coefficient of determination) gives the proportion of y-variance explained by the linear relationship with x.",
      "**Least-squares regression line.** Given $n$ data points $(x_i, y_i)$, the least-squares regression line $\\hat{y} = b_0 + b_1 x$ has slope $b_1 = r \\cdot (s_y / s_x)$ and intercept $b_0 = \\bar{y} - b_1 \\bar{x}$. The regression line always passes through $(\\bar{x}, \\bar{y})$. This formula shows that $b_1$ is proportional to $r$: the stronger the linear correlation, the steeper (relative to the units) the regression line. (Full regression treatment in stat8.)",
    ],
  },

  rigor: {
    prose: [
      "**R1 — Leverage and cook's distance.** A formal measure of influence is Cook's Distance $D_i = \\frac{\\sum_{j=1}^n (\\hat{y}_j - \\hat{y}_{j(i)})^2}{p \\cdot \\text{MSE}}$, where $\\hat{y}_{j(i)}$ is the predicted value when observation $i$ is excluded. Large $D_i$ (conventionally $D_i > 1$) indicates an influential observation. Leverage $h_{ii}$ measures how extreme observation $i$ is in the x-direction; high leverage combined with a large residual creates high influence.",
      "**R2 — Spearman rank correlation.** Pearson r requires approximately linear relationships and is sensitive to outliers. When the relationship is monotone but nonlinear, or when there are extreme outliers, Spearman's rank correlation $r_s$ is more appropriate. $r_s$ is computed by ranking both x and y values (replacing each with their rank) and computing Pearson r on the ranks. $r_s$ measures monotone association and is robust to outliers and nonlinearity.",
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: "stat2-005-cell-1",
        type: "python",
        cellTitle: "Scatter plot: describe the relationship",
        code: `# Hours of sleep vs. reaction time (milliseconds)
sleep  = [5.0, 5.5, 6.0, 6.5, 7.0, 7.0, 7.5, 7.5, 8.0, 8.0, 8.5, 9.0]
react  = [310, 285, 270, 250, 235, 245, 220, 230, 210, 225, 205, 195]

fig = Figure(width=7, height=5)
fig.axes(xmin=4.5, xmax=9.5, ymin=180, ymax=330)
fig.scatter(xs=sleep, ys=react, color="coral", size=6)
fig.text(7, 325, "Sleep Hours vs. Reaction Time", size=13, bold=True)
fig.show()

# Compute correlation manually
n = len(sleep)
xbar = sum(sleep)/n
ybar = sum(react)/n
sx = (sum((x-xbar)**2 for x in sleep)/(n-1))**0.5
sy = (sum((y-ybar)**2 for y in react)/(n-1))**0.5
r = sum((sleep[i]-xbar)*(react[i]-ybar) for i in range(n)) / ((n-1)*sx*sy)
print(f"r = {r:.3f}")
`,
        instructions:
          "Describe the scatter plot using all four features: direction, form, strength, unusual features. Then check if r matches your visual assessment.",
      },
      {
        id: "stat2-005-cell-2",
        type: "python",
        cellTitle: "Scatter plot with trend line overlay",
        code: `import pandas as pd

# Study hours vs. exam score (from stat2-002)
hours  = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5,
          6.0, 6.5, 7.0, 7.5, 8.0]
scores = [52, 57, 63, 65, 70, 73, 78, 79, 85, 86, 88, 90, 92, 93, 95]

# Compute regression line manually
n = len(hours)
xbar = sum(hours)/n
ybar = sum(scores)/n
b1 = sum((hours[i]-xbar)*(scores[i]-ybar) for i in range(n)) / \
     sum((x-xbar)**2 for x in hours)
b0 = ybar - b1*xbar
print(f"Regression line: y = {b0:.2f} + {b1:.2f}x")

# Plot scatter + regression line
fig = Figure(width=7, height=5)
fig.axes(xmin=0, xmax=9, ymin=45, ymax=100)
fig.scatter(xs=hours, ys=scores, color="coral", size=5)

# Add regression line: compute y at x=0 and x=9
line_x = [0, 9]
line_y = [b0 + b1*x for x in line_x]
fig.plot(xs=line_x, ys=line_y, color="navy", lw=2)

fig.text(4.5, 98, "Study Hours vs. Exam Score", size=13, bold=True)
fig.show()
`,
        instructions:
          "The regression line passes through (x̄, ȳ). Verify: compute the line y-value at x=xbar and check it equals ybar.",
      },
      {
        id: "stat2-005-cell-3",
        type: "python",
        cellTitle: "Line chart: monthly temperature trend",
        code: `# Average monthly temperature (°C)
months = list(range(1, 13))  # 1=Jan, 12=Dec
temps  = [2.1, 3.4, 7.8, 13.2, 18.5, 22.3, 24.7, 23.9, 19.4, 13.1, 7.2, 3.0]

fig = Figure(width=8, height=5)
fig.axes(xmin=0, xmax=13, ymin=-2, ymax=28)
fig.plot(xs=months, ys=temps, color="tomato", lw=2)
fig.scatter(xs=months, ys=temps, color="tomato", size=4)
fig.text(6.5, 27, "Monthly Average Temperature", size=13, bold=True)
fig.show()

print("Max temperature:", max(temps), "in month", months[temps.index(max(temps))])
print("Min temperature:", min(temps), "in month", months[temps.index(min(temps))])
`,
        instructions:
          "The line chart shows a clear seasonal pattern — temperature peaks in summer (month 7) and bottoms in winter (month 1). Try overlaying a scatter() call with the same data to highlight individual data points.",
      },
    ],
  },

  examples: [
    {
      id: "stat2-005-ex1",
      title: "Describe four features of a scatter plot",
      difficulty: "easy",
      problem:
        "A scatter plot of average daily temperature (x, °C) vs. daily ice cream sales (y, units) shows points trending upward from lower-left to upper-right, roughly following a straight line, with moderate scatter around the trend, and one isolated point at (8°C, 350 units) far above the trend. Describe all four features.",
      steps: [
        {
          expression:
            "\\text{Direction: positive — as temperature increases, sales increase}",
          annotation:
            "Points go from lower-left to upper-right — a positive association.",
          strategyTitle: "Feature 1: Direction",
        },
        {
          expression: "\\text{Form: approximately linear}",
          annotation:
            "Points roughly follow a straight line, not a noticeable curve. Linear regression is plausible.",
          strategyTitle: "Feature 2: Form",
        },
        {
          expression:
            "\\text{Strength: moderate — noticeable scatter around the line}",
          annotation:
            'The description says "moderate scatter" — points are not tightly packed. The correlation would likely be 0.5–0.75.',
          strategyTitle: "Feature 3: Strength",
        },
        {
          expression:
            "\\text{Unusual: outlier at (8°C, 350 units) — far above the trend}",
          annotation:
            "This point has a cool temperature (8°C) but very high sales (350 units). It deviates from the general pattern. Possible explanation: a special event on that day (festival, sale). Investigate before including in regression.",
          strategyTitle: "Feature 4: Unusual features",
        },
      ],
    },
    {
      id: "stat2-005-ex2",
      title: "Compute r and interpret it",
      difficulty: "medium",
      problem:
        "Five observations: x = [2, 4, 6, 8, 10], y = [3, 7, 6, 11, 12]. Compute the Pearson correlation r and interpret it.",
      steps: [
        {
          expression:
            "\\bar{x} = (2+4+6+8+10)/5 = 6, \\quad \\bar{y} = (3+7+6+11+12)/5 = 7.8",
          annotation: "Compute means first.",
          strategyTitle: "Step 1: Means",
        },
        {
          expression:
            "s_x = \\sqrt{\\frac{(2-6)^2+(4-6)^2+(6-6)^2+(8-6)^2+(10-6)^2}{4}} = \\sqrt{\\frac{16+4+0+4+16}{4}} = \\sqrt{10} \\approx 3.16",
          annotation: "Sample standard deviation of x (denominator n-1=4).",
          strategyTitle: "Step 2: sx",
        },
        {
          expression:
            "s_y = \\sqrt{\\frac{(3-7.8)^2+(7-7.8)^2+(6-7.8)^2+(11-7.8)^2+(12-7.8)^2}{4}} = \\sqrt{\\frac{23.04+0.64+3.24+10.24+17.64}{4}} = \\sqrt{13.7} \\approx 3.70",
          annotation: "Sample standard deviation of y.",
          strategyTitle: "Step 3: sy",
        },
        {
          expression:
            "\\text{Numerator: } \\sum (x_i-\\bar{x})(y_i-\\bar{y}) = (-4)(-4.8)+(-2)(-0.8)+(0)(-1.8)+(2)(3.2)+(4)(4.2) = 19.2+1.6+0+6.4+16.8 = 44",
          annotation: "Sum of cross-products.",
          strategyTitle: "Step 4: Cross-products",
        },
        {
          expression:
            "r = \\frac{44}{(n-1) s_x s_y} = \\frac{44}{4 \\times 3.16 \\times 3.70} = \\frac{44}{46.77} \\approx 0.941",
          annotation:
            "Interpretation: r ≈ 0.94 indicates a strong positive linear association. 88.7% of the variance in y is explained by the linear relationship with x (r² ≈ 0.887).",
          strategyTitle: "Step 5: r and interpretation",
        },
      ],
    },
    {
      id: "stat2-005-ex3",
      title: "Line chart: identify trend and seasonality",
      difficulty: "medium",
      problem:
        "Monthly website traffic (thousands): Jan=45, Feb=47, Mar=52, Apr=58, May=61, Jun=70, Jul=74, Aug=72, Sep=65, Oct=59, Nov=51, Dec=48. (a) What is the overall annual trend? (b) Is there a seasonal pattern? (c) Identify the peak and trough months.",
      steps: [
        {
          expression:
            "\\text{Annual trend: compare Jan (45) to Dec (48) — roughly flat with 6.7\\% growth}",
          annotation:
            "Jan=45 and Dec=48 are similar, suggesting no strong year-over-year growth trend in this single year. Traffic is roughly at the same level at start and end.",
          strategyTitle: "(a) Annual trend",
        },
        {
          expression:
            "\\text{Seasonal: peaks in summer (Jun=70, Jul=74), troughs in winter (Jan=45, Feb=47)}",
          annotation:
            "Traffic rises from spring through summer and falls in fall through winter. This is a regular seasonal pattern — probably driven by school calendars, vacations, or other seasonal factors.",
          strategyTitle: "(b) Seasonal pattern",
        },
        {
          expression:
            "\\text{Peak: July (74k). Trough: January (45k). Range: 29k (64\\% variation)}",
          annotation:
            "The seasonal swing is 29,000 visits — summer is 64% higher than winter. This is large enough to significantly affect any business planning based on this data.",
          strategyTitle: "(c) Peak and trough",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat2-005-ch1",
      title: "Identify an influential point and its effect",
      difficulty: "medium",
      problem:
        "Dataset: x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 50], y = [2.1, 3.9, 6.2, 8.0, 9.8, 11.9, 14.1, 16.0, 17.9, 100]. (a) Describe the scatter plot including the unusual point. (b) Without the last point, what does the relationship look like? (c) Is the last point an outlier, influential, or both?",
      walkthrough: [
        {
          expression:
            "\\text{First 9 points: x ∈ [1,9], y ≈ 2x — tight linear relationship}",
          annotation:
            "Plotting the first 9 points reveals a very tight linear relationship: y ≈ 2x. These points have almost no scatter around the line y = 0 + 2x.",
        },
        {
          expression:
            "\\text{10th point: (50, 100) — which is exactly y = 2x = 100}",
          annotation:
            "The 10th point at (50, 100) falls exactly on the extension of y = 2x from the first 9 points. It is not an outlier in terms of the pattern — it follows the same relationship.",
        },
        {
          expression:
            "\\text{Influential? Removing (50,100) shifts the x-range from 1–50 to 1–9}",
          annotation:
            "With the 10th point, the regression line is anchored by a data point 50 units away. Its extreme x-value gives it very high leverage. However, because it falls on the trend, removing it barely changes the slope.",
        },
        {
          expression:
            "\\text{Conclusion: influential (high leverage) but NOT an outlier (fits the trend)}",
          annotation:
            'The point is influential because it constrains the right end of the regression line. It is not an outlier because it has a small residual. This is the "influential but not outlier" case from the insight callout.',
        },
      ],
      answer:
        "The 10th point (50, 100) has high leverage (extreme x) but is not an outlier (falls on the linear trend). It is influential but in a benign way — it confirms the trend without distorting it.",
    },
    {
      id: "stat2-005-ch2",
      title: "Build a scatter plot with regression line from scratch",
      difficulty: "hard",
      problem:
        "Data: advertising spend (x, $000s) = [5, 10, 15, 20, 25, 30] and sales (y, $000s) = [22, 41, 58, 79, 94, 112]. (a) Compute x̄, ȳ, b₁, b₀. (b) Write complete opencalc code to display the scatter plot and regression line.",
      walkthrough: [
        {
          expression:
            "\\bar{x} = (5+10+15+20+25+30)/6 = 105/6 = 17.5, \\quad \\bar{y} = (22+41+58+79+94+112)/6 = 406/6 \\approx 67.7",
          annotation: "Compute means first.",
        },
        {
          expression:
            "b_1 = \\frac{\\sum(x_i-\\bar{x})(y_i-\\bar{y})}{\\sum(x_i-\\bar{x})^2}",
          annotation:
            "Numerator: (-12.5)(-45.7)+(-7.5)(-26.7)+(-2.5)(-9.7)+(2.5)(11.3)+(7.5)(26.3)+(12.5)(44.3) = 571.25+200.25+24.25+28.25+197.25+553.75 = 1575. Denominator: 156.25+56.25+6.25+6.25+56.25+156.25 = 437.5.",
        },
        {
          expression:
            "b_1 = 1575/437.5 = 3.6, \\quad b_0 = 67.7 - 3.6(17.5) = 67.7 - 63.0 = 4.7",
          annotation:
            "Regression line: ŷ = 4.7 + 3.6x. Interpretation: for each additional $1,000 in ad spend, sales increase by $3,600.",
        },
        {
          expression:
            '\\texttt{fig.scatter(xs=[5,10,15,20,25,30], ys=[22,41,58,79,94,112])}\\\\\\texttt{fig.plot(xs=[5,30], ys=[4.7+3.6*5, 4.7+3.6*30], color="navy", lw=2)}',
          annotation:
            "Plot scatter first (coral dots), then the regression line from x=5 to x=30. The two-point line is sufficient since regression lines are straight.",
        },
      ],
      answer:
        "b₁ = 3.6, b₀ = 4.7. Regression line: ŷ = 4.7 + 3.6x. Scatter + line plot: fig.scatter() then fig.plot() with line y-values at x=5 and x=30.",
    },
    ,
    {
      id: "stat2-005-ch3",
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
        symbol: "r",
        meaning:
          "Pearson correlation coefficient — measures strength and direction of LINEAR association. Range: −1 to +1.",
      },
      {
        symbol: "r^2",
        meaning:
          "Coefficient of determination — proportion of variance in y explained by the linear relationship with x.",
      },
      {
        symbol: "b_1",
        meaning:
          "Regression slope = r × (s_y/s_x) — expected change in y per unit increase in x.",
      },
      {
        symbol: "b_0",
        meaning: "Regression intercept = ȳ − b₁x̄ — predicted y when x = 0.",
      },
      {
        symbol: "\\hat{y}",
        meaning:
          "Predicted value of y from the regression equation: ŷ = b₀ + b₁x.",
      },
    ],
    rulesOfThumb: [
      "Always plot the scatter before computing r or fitting a regression.",
      "r = 0 means no linear relationship, NOT no relationship.",
      "r is sensitive to outliers — one extreme point can dominate.",
      "Line chart only for ordered/sequential data. Connecting unordered dots is misleading.",
      "Both scatter + line are often plotted together: scatter shows raw data, line shows trend.",
      "|r| ≥ 0.8 = strong, 0.5–0.8 = moderate, < 0.5 = weak (rough conventions).",
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      {
        lessonId: "stat8-001",
        label: "Linear Regression",
        note: "stat8 develops the regression line formally, including slope/intercept formulas, residuals, R², and inference.",
      },
      {
        lessonId: "stat3-006",
        label: "Measures of Spread",
        note: "The standard deviations sx and sy used in the r formula are developed fully in stat3.",
      },
      {
        lessonId: "stat21-001",
        label: "Time Series",
        note: "stat21 extends line charts to formal time series analysis: trend decomposition, autocorrelation, forecasting.",
      },
    ],
  },

  checkpoints: [
    {
      id: "cp-stat2-005-1",
      label: "Read: name the four features to describe in a scatter plot",
      type: "read",
    },
    {
      id: "cp-stat2-005-2",
      label: "Read: explain two limits of the Pearson r — what it misses",
      type: "read",
    },
    {
      id: "cp-stat2-005-3",
      label:
        "Lab: run cell 1 and write a four-feature description of the scatter plot",
      type: "lab",
    },
    {
      id: "cp-stat2-005-4",
      label:
        "Apply the description procedure to example 1 before reading the solution",
      type: "example",
    },
    {
      id: "cp-stat2-005-5",
      label: "Complete example 2: compute r for 5 data points step by step",
      type: "example",
    },
    {
      id: "cp-stat2-005-6",
      label:
        "Lab: run cell 2 and verify the regression line passes through (x̄, ȳ)",
      type: "lab",
    },
    {
      id: "cp-stat2-005-7",
      label:
        "Attempt challenge 2: compute b₁, b₀ and write the complete scatter + line chart code",
      type: "challenge",
    },
    {
      id: "cp-stat2-005-8",
      label:
        "Read: distinguish an outlier from an influential point with one example each",
      type: "read",
    },
  ],

  assessment: {
    questions: [
      {
        id: "stat2-005-assess-1",
        type: "choice",
        text: "A scatter plot shows a perfect U-shape (parabola) with no outliers. The Pearson correlation r would be approximately:",
        options: ["1.0", "-1.0", "0", "0.5"],
        answer: "0",
        instructions:
          "r measures linear association. A symmetric parabola has equal upward and downward trends that cancel out.",
      },
    ],
  },

  quiz: [
    {
      id: "stat2-005-quiz-1",
      type: "choice",
      text: "Which feature of a scatter plot does the Pearson correlation r NOT capture?",
      options: [
        "The direction of the association (positive or negative)",
        "The strength of the linear relationship",
        "Nonlinear patterns, outliers, and clusters",
        "Whether the association is positive",
      ],
      answer: "Nonlinear patterns, outliers, and clusters",
      hints: [
        "r = 0.816 for all four of Anscombe's datasets.",
        "r only measures linear association — curves, clusters, and influential points are invisible to r.",
      ],
      reviewSection: 'Intuition → "Correlation coefficient r recap" paragraph',
    },
    {
      id: "stat2-005-quiz-2",
      type: "choice",
      text: "A line chart is appropriate when:",
      options: [
        "Both x and y are categorical",
        "The x-axis represents time or an ordered sequence where consecutive values are meaningfully connected",
        "You have more than 50 data points",
        "You want to compare distributions across multiple groups",
      ],
      answer:
        "The x-axis represents time or an ordered sequence where consecutive values are meaningfully connected",
      hints: [
        "What does the line segment between two points imply?",
        "A line chart implies continuity and order between consecutive points.",
      ],
      reviewSection: 'Intuition → "Line charts for time series" paragraph',
    },
    {
      id: "stat2-005-quiz-3",
      type: "choice",
      text: "A scatter plot shows a strong positive linear relationship with one isolated point far below the trend line in the middle of the x-range. This point is best described as:",
      options: [
        "An influential point with high leverage",
        "An outlier with a large negative residual",
        "A point with positive leverage",
        "Not unusual because it is in the middle of the x-range",
      ],
      answer: "An outlier with a large negative residual",
      hints: [
        "The point is in the middle of the x-range — not extreme in x.",
        "It is far below the trend line — large residual.",
      ],
      reviewSection: "Insight callout — Influential Points vs. Outliers",
    },
    {
      id: "stat2-005-quiz-4",
      type: "choice",
      text: "r = −0.85 means:",
      options: [
        "There is no relationship between x and y",
        "There is a strong negative linear association — as x increases, y tends to decrease",
        "x causes a decrease in y",
        "The regression slope is −0.85",
      ],
      answer:
        "There is a strong negative linear association — as x increases, y tends to decrease",
      hints: [
        "r = -0.85: negative direction (as x increases, y decreases), |r| = 0.85 (strong).",
        "Correlation is not causation.",
      ],
      reviewSection: 'Intuition → "Correlation coefficient r recap" paragraph',
    },
    {
      id: "stat2-005-quiz-5",
      type: "choice",
      text: "To add a regression line to a scatter plot in opencalc, you:",
      options: [
        "Call fig.regression(data=xs, ys=ys)",
        "Compute b₀ and b₁, then call fig.plot() with xs=[x_min, x_max] and the corresponding y values",
        "The trend line is drawn automatically by fig.scatter()",
        "Call fig.bars() with the slope value",
      ],
      answer:
        "Compute b₀ and b₁, then call fig.plot() with xs=[x_min, x_max] and the corresponding y values",
      hints: [
        "A regression line is a straight line — two points define it.",
        "fig.plot() draws a line through any two points.",
      ],
      reviewSection: "Code cell 2 — scatter plot with trend line overlay",
    },
    {
      id: "stat2-005-quiz-6",
      type: "choice",
      text: "Overplotting in a scatter plot (many overlapping points) can be reduced by:",
      options: [
        "Making all points the same color",
        "Using transparency (alpha < 1) so overlapping points appear darker",
        "Switching to a bar chart",
        "Using a larger figure size",
      ],
      answer:
        "Using transparency (alpha < 1) so overlapping points appear darker",
      hints: [
        "When many points overlap at the same location, the visual density should represent the actual data density.",
        "Transparency causes overlapping points to accumulate to a darker color.",
      ],
      reviewSection: 'Intuition → "Overplotting" paragraph',
    },
  ],

  misconceptions: [
    {
      falseBelief: "r = 0 means x and y are unrelated.",
      whyStudentsThinkIt:
        'r = 0 is associated with "no correlation" and students interpret that as "no relationship."',
      correctionExample:
        "y = x² (for x from -3 to 3) has a perfect deterministic relationship: knowing x tells you exactly y. But the symmetric parabola produces r = 0 because the positive and negative sides cancel. Plot it — the relationship is obvious visually. r = 0 means no LINEAR relationship, not no relationship.",
      contrastCase:
        "Random noise: if x and y are generated independently, r ≈ 0 and there genuinely is no relationship. Compare to y = sin(x): r ≈ 0 but there is a perfect nonlinear relationship.",
    },
    {
      falseBelief:
        "A larger correlation coefficient always means a stronger actual relationship.",
      whyStudentsThinkIt:
        'Students learn "|r| closer to 1 means stronger." They apply this without checking whether r is inflated by outliers.',
      correctionExample:
        "Dataset: 9 points in a cloud with r ≈ 0.1, plus one extreme point at (x=100, y=100). The overall r could be 0.9 — not because the 9 points have a strong relationship, but because the one extreme point creates apparent correlation. The scatter plot would immediately show the truth.",
      contrastCase:
        "A genuine r = 0.9 with no outliers: all 50 points form a tight ellipse. Here r = 0.9 accurately reflects a strong linear relationship.",
    },
    {
      falseBelief:
        "Line charts and scatter plots can be used interchangeably for two quantitative variables.",
      whyStudentsThinkIt:
        "Both use an x-y coordinate system with dots (and lines). Students see them as similar.",
      correctionExample:
        'A line chart of "student ID number vs. exam score" would connect students in ID order and imply that there is a meaningful trajectory from student 1 to student 2 to student 3. There is not — the connection is arbitrary. A scatter plot shows the relationship without implying order.',
      contrastCase:
        'A line chart of "month vs. average temperature" is correct: months have a natural order, and the trajectory from January to February to March represents a genuine progression through the year.',
    },
  ],

  transferPrompts: [
    {
      situation:
        "A real estate analyst wants to understand the relationship between house size (square feet) and sale price for 500 transactions in one city.",
      competingTechniques: [
        "Compute r directly without plotting",
        "Scatter plot of size vs. price, then describe features, then compute r",
        "Line chart connecting sales in chronological order",
      ],
      whyThisTechniqueWins:
        "Scatter plot first: with 500 transactions there may be clusters (neighborhood price tiers), nonlinearity (diminishing returns for very large houses), and outliers (luxury homes at unusual prices). Computing r without looking would miss all of this. A line chart would be wrong — the 500 transactions are not a time series. Scatter plot → four features → correlation → regression → residual check is the correct sequence.",
    },
    {
      situation:
        "A public health researcher has weekly flu case counts for 5 years (260 weeks). She wants to show: (1) the year-over-year trend, and (2) within-year seasonal patterns.",
      competingTechniques: [
        "One scatter plot of week number vs. cases",
        "One line chart of all 260 weeks",
        "Five separate line charts (one per year)",
      ],
      whyThisTechniqueWins:
        "One line chart of all 260 weeks is best: the x-axis is time (260 consecutive weeks), and the line shows both the overall multi-year trend (is the baseline rising over 5 years?) and the annual seasonal cycles (winter peaks visible as repeated spikes). A scatter plot without lines would make it harder to see the seasonal shape. Five separate charts require mental comparison across charts to see year-over-year change.",
    },
  ],

  debugging: [
    {
      commonError:
        "The regression line does not pass through the scatter cloud — it is far above or below.",
      symptom:
        "The line plotted with fig.plot() appears disconnected from the scatter points.",
      whyItHappened:
        "The y-values for the line were computed using the wrong formula (e.g., forgot to add b₀, or mixed up b₀ and b₁). Or the x-range for the line (line_x) is different from the data range.",
      repairStrategy:
        "Verify: (1) line_y = [b0 + b1*x for x in line_x] — not just b1*x. (2) Check b₀ and b₁ by verifying the line passes through (x̄, ȳ): compute b0 + b1*xbar and compare to ybar. They should be equal. (3) Ensure line_x covers the same range as the scatter x-values.",
    },
    {
      commonError: "r computed manually differs from expected value.",
      symptom:
        "Your manual r calculation gives a different value from the reference.",
      whyItHappened:
        "Common mistakes: (1) using n instead of n-1 in the denominator (computing population instead of sample standard deviation); (2) computing the sum of products incorrectly (forgetting to subtract the means); (3) arithmetic errors in sy or sx.",
      repairStrategy:
        "Step by step: compute xbar and ybar first. Then compute each (xi-xbar) and (yi-ybar) as a list. Multiply pairs to get cross-products. Sum them. Compute sx and sy with denominator n-1. Compute r = sum_of_products / ((n-1) × sx × sy). Verify with a calculator or Python: `import statistics; statistics.correlation(x, y)` (Python 3.10+).",
    },
  ],

  mastery: {
    targetLevel:
      "Apply (Level 3) — describe a scatter plot using all four features, compute r manually, identify outliers and influential points, and write opencalc code for scatter + regression line.",
    solveIndependently:
      "Given 5–8 (x, y) data points, compute r, compute the regression line (b₀, b₁), write complete opencalc code for a scatter + line chart, and describe the relationship in one sentence.",
    explainVerbally:
      'Explain why r = 0 does not mean "no relationship" and give a concrete example of a dataset with r = 0 that has a perfect nonlinear relationship.',
    detectIncorrectApplication:
      "Given code that (1) computes r without first plotting, and (2) draws a line chart for non-temporal data, identify both errors and explain the correct approach.",
    transferToUnfamiliar:
      "Given a novel two-variable dataset (described by context, not seen in lessons), select the correct chart type, describe what the scatter plot would reveal about r limitations, and write the code.",
  },
};
