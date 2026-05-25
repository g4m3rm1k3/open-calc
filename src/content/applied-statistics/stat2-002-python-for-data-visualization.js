export default {
  id: 'stat2-002',
  slug: 'python-for-data-visualization',
  chapter: 'stat2',
  order: 2,
  title: 'Python for Data Visualization',
  subtitle: 'Building charts from data using the opencalc Figure API.',
  tags: ['python', 'opencalc', 'visualization', 'Figure', 'histogram', 'scatter', 'bars', 'line chart', 'data analysis'],
  aliases: 'opencalc figure API python chart histogram scatter plot bar chart pie chart data visualization code',
  timeToComplete: 40,
  coreConcept: 'The opencalc Figure API lets you describe charts as data structures, and the renderer draws them on a canvas. You pass arrays of values to methods like fig.histogram(), fig.scatter(), and fig.bars() — the library handles all the math and geometry.',
  prerequisites: ['stat2-001'],
  nextLesson: 'stat2-003',

  hook: {
    question: 'If you have 150 numbers representing exam scores, what is the fastest way to understand the distribution?',
    realWorldContext: 'A statistics professor collects midterm scores from 150 students: the lowest is 31, the highest is 99, and everything in between. She could compute the mean and standard deviation — but those two numbers would not tell her whether the scores are symmetric or skewed, whether there are clusters, or how many students are at risk of failing. In about 3 lines of Python, she can produce a histogram that answers all of those questions visually at once. This lesson shows you exactly how.',
  },

  intuition: {
    prose: [
      '**The opencalc Figure API.** In this environment, you create visualizations by building an opencalc `Figure` object, adding elements to it, and calling `show()`. The Figure API is designed to produce exactly the charts from stat2-001 — histogram, scatter, bars, boxplot, pie, and line — using Python lists as inputs.',
      '**The core pattern.** Every visualization follows the same four-line structure:\n```python\nfig = Figure(width=6, height=4)\nfig.axes(xmin=0, xmax=100, ymin=0, ymax=30)\nfig.histogram(data=scores, bins=10, color="steelblue")\nfig.show()\n```\nThe `Figure()` constructor sets the canvas size. `axes()` sets the coordinate system. A chart method like `histogram()` adds the visual element. `show()` renders it.',
      '**Before reading on, predict:** If `data = [72, 85, 91, 63, 77, 88, 95, 70, 82, 76]` and you call `fig.histogram(data=data, bins=5)`, how many bars would the histogram have, and what would each bar represent?',
      '**Histogram.** `fig.histogram(data, bins=10, color="steelblue", alpha=0.8)` computes bin edges from the data range, counts how many values fall in each bin, and draws a bar for each bin. The height of each bar equals the count in that bin. The `bins` parameter controls the number of bars. The `density=True` option normalizes bar heights so the total area equals 1 (useful for comparing with probability distributions).',
      '**Scatter plot.** `fig.scatter(xs, ys, color="coral", size=4)` takes two equal-length lists — x-values and y-values — and draws one dot per (x, y) pair. Use scatter for two quantitative variables. Optionally, `color` can be a list of the same length as xs/ys to color each point differently (e.g., by group). `size` controls dot radius.',
      '**Bar chart.** `fig.bars(labels, values, color="seagreen")` takes a list of category names and a list of corresponding heights. Draws a vertical bar for each category. Use bars for one categorical variable with a count or proportion for each level.',
      '**Line chart.** `fig.plot(xs, ys, color="navy", lw=2)` connects points in order with a line. Use for time series or other ordered sequential data. `lw` is line width.',
      '**Setting axes correctly.** `fig.axes(xmin, xmax, ymin, ymax)` is required before any chart element. If the axes do not cover the data range, elements will be clipped or invisible. A safe pattern: compute the min and max of your data and expand slightly:\n```python\nfig.axes(xmin=min(data)-5, xmax=max(data)+5, ymin=0, ymax=expected_max_count+5)\n```',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Build Any Chart in opencalc',
        body: 'Step 1. Create the Figure: `fig = Figure(width=W, height=H)`. Typical widths: 6–8; heights: 4–5.\n\nStep 2. Set the coordinate system: `fig.axes(xmin=..., xmax=..., ymin=..., ymax=...)`. Must cover all data.\n\nStep 3. (Optional) Add a title: `fig.text(x, y, "Title", size=14, bold=True)` — place at top-center of the axes range.\n\nStep 4. Call the chart method: `fig.histogram(data, bins)` or `fig.scatter(xs, ys)` or `fig.bars(labels, values)` or `fig.plot(xs, ys)`.\n\nStep 5. (Optional) Add axis labels: `fig.text(x_center, ymin-3, "X label")` and `fig.text(xmin-8, y_center, "Y label", angle=90)`.\n\nStep 6. Render: `fig.show()`.',
      },
      {
        type: 'insight',
        title: 'Histogram vs. bars() — Choosing the Right Method',
        body: '`fig.histogram(data, bins)` — pass RAW data as a list. The method computes bins for you. Use this when you have individual observations.\n\n`fig.bars(labels, values)` — pass PRE-COMPUTED counts or proportions. Use this when you already have category totals (e.g., "Category A: 45, Category B: 30, Category C: 25").\n\nCommon mistake: calling `bars()` with raw continuous data. The bars will have one bar per unique value — which is usually wrong. Always use `histogram()` for raw continuous data.',
      },
      {
        type: 'warning',
        title: 'Axes Must Cover All Data',
        body: 'If any data value is outside the `axes()` range, that element is clipped (partially or fully hidden). Always check:\n- `xmin <= min(data)` and `xmax >= max(data)` for histograms\n- `ymin = 0` for histograms and bar charts (bars extend from 0)\n- `ymax` should exceed the tallest bar (add 10–15% margin)\n\nA quick way to set axes: `fig.axes(xmin=min(data), xmax=max(data), ymin=0, ymax=len(data)//2)`.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      '**Histogram bin count and range.** Given raw data with minimum value $x_{\\min}$ and maximum $x_{\\max}$, requesting $k$ bins produces edges at $e_0 = x_{\\min}$, $e_1 = x_{\\min} + h$, ..., $e_k = x_{\\max}$, where bin width $h = (x_{\\max} - x_{\\min}) / k$. The count for bin $j$ is $c_j = |\\{x_i : e_{j-1} \\le x_i < e_j\\}|$ (last bin is inclusive on the right). When `density=True`, each bar height is $c_j / (n \\cdot h)$ so $\\sum_j c_j / (n \\cdot h) \\cdot h = \\sum_j c_j/n = 1$.',
    ],
  },

  rigor: {
    prose: [
      '**R1 — Coordinate system and scaling.** The opencalc Figure uses a mathematical coordinate system where `axes(xmin, xmax, ymin, ymax)` defines the visible region. Internally, data coordinates are mapped to canvas pixels by linear interpolation: $\\text{pixel}_x = \\text{margin} + (x - x_{\\min}) / (x_{\\max} - x_{\\min}) \\times \\text{canvas\\_width}$. If you request a histogram with bins extending outside the axes range, those bins are clipped at the canvas boundary. This is not an error — it is intentional cropping. Use it deliberately if you want to zoom into a region of the distribution, but always note in your caption if data is excluded.',
    ],
    visualizations: [],
  },

  code: {
    cells: [
      {
        id: 'stat2-002-cell-1',
        type: 'python',
        label: 'Histogram of exam scores',
        starterCode: `# Build a histogram of 20 exam scores
scores = [72, 85, 91, 63, 77, 88, 95, 70, 82, 76,
          58, 89, 74, 67, 93, 81, 71, 86, 62, 78]

fig = Figure(width=7, height=4)
fig.axes(xmin=50, xmax=100, ymin=0, ymax=8)
fig.histogram(data=scores, bins=5, color="steelblue", alpha=0.8)
fig.text(75, 8.5, "Midterm Score Distribution", size=13, bold=True)
fig.show()
`,
        expectedOutput: 'A histogram with 5 bars showing the distribution of scores from 50 to 100.',
        hint: 'Try changing `bins=5` to `bins=10`. How does the shape of the distribution change?',
      },
      {
        id: 'stat2-002-cell-2',
        type: 'python',
        label: 'Scatter plot: study hours vs. exam score',
        starterCode: `# Scatter plot: hours studied vs. exam score
hours  = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5,
          6.0, 6.5, 7.0, 7.5, 8.0, 1.0, 3.0, 5.0, 7.0, 4.0]
scores = [52,  57,  63,  65,  70,  73,  78,  79,  85,  86,
          88,  90,  92,  93,  95,  49,  68,  82,  91,  77]

fig = Figure(width=7, height=5)
fig.axes(xmin=0, xmax=9, ymin=45, ymax=100)
fig.scatter(xs=hours, ys=scores, color="coral", size=5)
fig.text(4.5, 98, "Hours Studied vs. Exam Score", size=13, bold=True)
fig.show()
`,
        expectedOutput: 'A scatter plot showing a positive relationship between study hours and exam scores.',
        hint: 'Notice the point at (1.0, 49) and the point at (1.0, 52). They have the same x-value but different y-values. What does that tell you about the relationship?',
      },
      {
        id: 'stat2-002-cell-3',
        type: 'python',
        label: 'Bar chart: students per major',
        starterCode: `# Bar chart: number of students per major
majors  = ["CS", "Math", "Physics", "Stats", "Biology"]
counts  = [42,   31,     18,        25,       38]

fig = Figure(width=7, height=5)
fig.axes(xmin=-1, xmax=5, ymin=0, ymax=50)
fig.bars(labels=majors, values=counts, color="seagreen")
fig.text(2, 48, "Students per Major", size=13, bold=True)
fig.show()
`,
        expectedOutput: 'A bar chart with five bars showing enrollment by major.',
        hint: 'Try sorting: `sorted_pairs = sorted(zip(counts, majors), reverse=True); counts, majors = zip(*sorted_pairs)`. Does sorting by count make the chart easier to read?',
      },
      {
        id: 'stat2-002-cell-4',
        type: 'python',
        label: 'Pie chart: grade distribution',
        starterCode: `# Pie chart: grade distribution in a class
labels = ["A", "B", "C", "D", "F"]
values = [22,  35,  28,  10,  5]

fig = Figure(width=6, height=6)
fig.axes(xmin=-1, xmax=1, ymin=-1, ymax=1)
fig.pie(labels=labels, values=values)
fig.text(0, 1.15, "Grade Distribution", size=13, bold=True)
fig.show()
`,
        expectedOutput: 'A pie chart with five slices labeled A through F with percentages.',
        hint: 'Pie charts work best with 5 or fewer categories and large proportion differences. This chart has 5 categories — is it readable?',
      },
    ],
  },

  examples: [
    {
      id: 'stat2-002-ex1',
      title: 'Build a histogram from raw data — step by step',
      difficulty: 'easy',
      problem: 'You have commute times (in minutes) for 12 employees: [15, 22, 8, 35, 47, 19, 28, 12, 41, 25, 33, 18]. Write the complete code to display a histogram with 4 bins.',
      steps: [
        { expression: '\\text{data = [15, 22, 8, 35, 47, 19, 28, 12, 41, 25, 33, 18]}', annotation: 'Identify the raw data. min = 8, max = 47. These determine the axes range.', strategyTitle: 'Step 1: Inspect data' },
        { expression: 'x_{\\min} = 8, \\quad x_{\\max} = 47, \\quad h = (47-8)/4 = 9.75 \\approx \\text{4 bins of width 9.75}', annotation: 'With 4 bins, the width will be (47-8)/4 ≈ 9.75. Max count per bin: at most 4–5 values, so ymax = 6 is safe.', strategyTitle: 'Step 2: Plan the axes' },
        { expression: '\\texttt{fig = Figure(width=7, height=4)}', annotation: 'Create the Figure canvas. Width 7, height 4 is a standard landscape ratio for histograms.', strategyTitle: 'Step 3: Create figure' },
        { expression: '\\texttt{fig.axes(xmin=5, xmax=50, ymin=0, ymax=6)}', annotation: 'Set axes slightly wider than data range (xmin=5 < 8, xmax=50 > 47). ymin=0 for a count histogram. ymax=6 leaves headroom above the tallest bar.', strategyTitle: 'Step 4: Set axes' },
        { expression: '\\texttt{fig.histogram(data=commute, bins=4, color="steelblue")}', annotation: 'Call histogram with the raw data list and 4 bins. The method computes bin edges and counts automatically.', strategyTitle: 'Step 5: Add histogram' },
        { expression: '\\texttt{fig.show()}', annotation: 'Render the figure to the output cell.', strategyTitle: 'Step 6: Show' },
      ],
    },
    {
      id: 'stat2-002-ex2',
      title: 'Scatter plot with a trend observation',
      difficulty: 'medium',
      problem: 'Temperature (°C) and ice cream sales (units) for 8 days: temp = [18, 21, 25, 28, 30, 33, 35, 27], sales = [120, 145, 190, 230, 265, 310, 335, 210]. Build a scatter plot and describe what you see.',
      steps: [
        { expression: '\\text{Two quantitative variables → scatter plot}', annotation: 'Temperature and sales are both continuous quantitative variables. A scatter plot is the correct chart type.', strategyTitle: 'Step 1: Chart selection' },
        { expression: '\\texttt{fig.axes(xmin=15, xmax=38, ymin=100, ymax=350)}', annotation: 'Cover data range: temp ∈ [18, 35] → xmin=15, xmax=38. Sales ∈ [120, 335] → ymin=100, ymax=350. Note: ymin=100 instead of 0 is acceptable here because we are interested in the relationship shape, not bar comparisons from zero.', strategyTitle: 'Step 2: Axes' },
        { expression: '\\texttt{fig.scatter(xs=temp, ys=sales, color="coral", size=6)}', annotation: 'Plot the 8 (temp, sales) pairs as dots.', strategyTitle: 'Step 3: Plot scatter' },
        { expression: '\\text{Observation: positive linear relationship — as temperature increases, sales increase proportionally}', annotation: 'The 8 points appear to fall roughly along a straight line with positive slope. There are no obvious outliers or curvature. This suggests a linear model would be appropriate — but remember Anscombe: check the residuals after fitting.', strategyTitle: 'Step 4: Interpret' },
      ],
    },
    {
      id: 'stat2-002-ex3',
      title: 'Bar chart: survey response frequencies',
      difficulty: 'easy',
      problem: 'A satisfaction survey had 5 response options. Results: Very Satisfied=48, Satisfied=62, Neutral=25, Dissatisfied=14, Very Dissatisfied=9. Build a bar chart using the opencalc API.',
      steps: [
        { expression: '\\text{labels = ["V.Sat", "Sat", "Neutral", "Dissat", "V.Dissat"]}', annotation: 'Pre-computed category counts — use bars(), not histogram(). The x-axis will be categorical (labels), the y-axis will be count (0 to 65+).', strategyTitle: 'Step 1: Identify chart type' },
        { expression: '\\texttt{fig.axes(xmin=-1, xmax=5, ymin=0, ymax=70)}', annotation: 'For bars(), xmin and xmax must leave room for the bars. With 5 categories, index 0–4, xmin=-1 and xmax=5 provides margins on both sides. ymax=70 exceeds the max bar height (62).', strategyTitle: 'Step 2: Axes for bars()' },
        { expression: '\\texttt{fig.bars(labels=labels, values=[48,62,25,14,9], color="steelblue")}', annotation: 'Pass the label list and value list in matching order. Each label gets one bar of the corresponding height.', strategyTitle: 'Step 3: Build the chart' },
      ],
    },
  ],

  challenges: [
    {
      id: 'stat2-002-ch1',
      title: 'Annotate a scatter plot with a trend observation',
      difficulty: 'medium',
      problem: 'Using the hours/scores data from the code cell (cell 2), add a text annotation at position (7.5, 60) that reads "Positive trend" and set bold=True. Then change the dot color to "navy". Write the complete modified code.',
      walkthrough: [
        { expression: '\\text{Same scatter setup as cell 2}', annotation: 'Keep the Figure, axes, and scatter() call. Add the text and change color.' },
        { expression: '\\texttt{fig.scatter(xs=hours, ys=scores, color="navy", size=5)}', annotation: 'Change color from "coral" to "navy" in the scatter call.' },
        { expression: '\\texttt{fig.text(7.5, 60, "Positive trend", size=11, bold=True)}', annotation: 'Add text at coordinates (7.5, 60). This is within the axes range (xmax=9, ymin=45) so it will be visible.' },
        { expression: '\\text{Check: is (7.5, 60) inside axes range?} \\quad 0 \\le 7.5 \\le 9, \\quad 45 \\le 60 \\le 100 \\checkmark', annotation: 'The annotation is within range. If coordinates were outside axes(), the text would not appear.' },
      ],
      answer: 'Add `fig.text(7.5, 60, "Positive trend", size=11, bold=True)` after the scatter call and change scatter color to "navy".',
    },
    {
      id: 'stat2-002-ch2',
      title: 'Build a histogram with density normalization',
      difficulty: 'hard',
      problem: 'You have 30 daily temperature readings (°C): [14,16,18,19,20,21,21,22,22,23,23,24,24,24,25,25,25,26,26,27,27,28,28,29,30,31,32,33,35,38]. Build a histogram with density=True and 7 bins. The y-axis should show density values (0 to 0.10 is a safe range for this data). Add a title.',
      walkthrough: [
        { expression: '\\text{min=14, max=38, bins=7} \\Rightarrow h = (38-14)/7 \\approx 3.43', annotation: 'Calculate bin width to estimate maximum bar density. Roughly 3–6 observations per bin. Max density ≈ 6/(30 × 3.43) ≈ 0.058.' },
        { expression: '\\texttt{fig.axes(xmin=12, xmax=40, ymin=0, ymax=0.10)}', annotation: 'xmin=12 < 14, xmax=40 > 38. ymax=0.10 safely exceeds estimated max density 0.058.' },
        { expression: '\\texttt{fig.histogram(data=temps, bins=7, density=True, color="teal")}', annotation: 'density=True normalizes bar heights so total area = 1. Use density mode when comparing to a probability distribution or when comparing histograms with different sample sizes.' },
        { expression: '\\texttt{fig.text(26, 0.105, "Daily Temperatures (density)", size=12, bold=True)}', annotation: 'Place title above ymax at y=0.105. Center horizontally at x=26 ≈ (12+40)/2.' },
      ],
      answer: 'Create Figure, set axes with ymax=0.10, call histogram with density=True and bins=7, add title text above the axes range, call show().',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\texttt{Figure(width, height)}', meaning: 'Creates the canvas. width/height in abstract units (not pixels).' },
      { symbol: '\\texttt{fig.axes(xmin, xmax, ymin, ymax)}', meaning: 'Sets the coordinate system. Must be called before any chart elements. Values outside this range are clipped.' },
      { symbol: '\\texttt{fig.histogram(data, bins, color, density)}', meaning: 'Draws a histogram from raw continuous data. Computes bin edges and counts automatically.' },
      { symbol: '\\texttt{fig.scatter(xs, ys, color, size)}', meaning: 'Draws a scatter plot. xs and ys must be equal-length lists.' },
      { symbol: '\\texttt{fig.bars(labels, values, color)}', meaning: 'Draws a bar chart from pre-computed category labels and their counts/proportions.' },
      { symbol: '\\texttt{fig.plot(xs, ys, color, lw)}', meaning: 'Draws a line chart connecting (x, y) points in order. Use for time series or ordered data.' },
      { symbol: '\\texttt{fig.pie(labels, values)}', meaning: 'Draws a pie chart from labels and proportional values. Best with ≤5 categories.' },
    ],
    rulesOfThumb: [
      'Raw continuous data → `histogram()`. Pre-computed category counts → `bars()`. Never swap them.',
      'Set axes before adding any elements. Data outside axes range is clipped silently.',
      'Use `density=True` in histogram when comparing shapes across different sample sizes.',
      'Always call `fig.show()` last — it renders the accumulated elements to the canvas.',
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      { lessonId: 'stat2-004', label: 'Bar Charts and Pie Charts', note: 'stat2-004 goes deeper on fig.bars() and fig.pie() with real datasets.' },
      { lessonId: 'stat2-005', label: 'Scatter Plots', note: 'stat2-005 extends scatter() with regression overlay and residual plots.' },
      { lessonId: 'stat3-001', label: 'Descriptive Statistics', note: 'The distributions you visualize in stat2 are described numerically (mean, median, IQR) in stat3.' },
    ],
  },

  checkpoints: [
    { id: 'cp-stat2-002-1', label: 'Read: describe the four-step opencalc Figure pattern', type: 'read' },
    { id: 'cp-stat2-002-2', label: 'Lab: run code cell 1 and change bins from 5 to 10', type: 'lab' },
    { id: 'cp-stat2-002-3', label: 'Lab: run code cell 2 and identify the point with lowest score', type: 'lab' },
    { id: 'cp-stat2-002-4', label: 'Read: explain when to use histogram() vs. bars()', type: 'read' },
    { id: 'cp-stat2-002-5', label: 'Complete example 1: write histogram code for commute times from scratch', type: 'example' },
    { id: 'cp-stat2-002-6', label: 'Lab: run code cell 3 and sort bars by value', type: 'lab' },
    { id: 'cp-stat2-002-7', label: 'Attempt challenge 1: annotate scatter plot with text', type: 'challenge' },
    { id: 'cp-stat2-002-8', label: 'Read: explain what happens if a data point falls outside the axes() range', type: 'read' },
  ],

  assessment: {
    questions: [
      {
        id: 'stat2-002-assess-1',
        type: 'choice',
        text: 'You have a list of 200 raw continuous measurements. Which opencalc method should you use to display their distribution?',
        options: ['fig.bars()', 'fig.histogram()', 'fig.scatter()', 'fig.plot()'],
        answer: 'fig.histogram()',
        hint: '`histogram()` takes raw data and bins it automatically. `bars()` requires pre-computed category counts.',
      },
    ],
  },

  quiz: [
    {
      id: 'stat2-002-quiz-1',
      type: 'choice',
      text: 'What does `fig.axes(xmin=0, xmax=10, ymin=0, ymax=50)` do?',
      options: [
        'Creates the figure with size 10×50',
        'Sets the coordinate system so only data in x=[0,10] and y=[0,50] is visible',
        'Draws x and y axis lines on the canvas',
        'Autoscales the axes to fit the data',
      ],
      answer: 'Sets the coordinate system so only data in x=[0,10] and y=[0,50] is visible',
      hints: ['Think about what happens to a data point at x=15 when xmax=10.', 'axes() defines the visible window, not the figure size.'],
      reviewSection: 'Intuition → "Setting axes correctly" paragraph',
    },
    {
      id: 'stat2-002-quiz-2',
      type: 'choice',
      text: 'Which is the correct way to draw a bar chart for: Category A=30, Category B=45, Category C=20?',
      options: [
        'fig.histogram(data=[30,45,20], bins=3)',
        'fig.bars(labels=["A","B","C"], values=[30,45,20])',
        'fig.scatter(xs=["A","B","C"], ys=[30,45,20])',
        'fig.plot(xs=[0,1,2], ys=[30,45,20])',
      ],
      answer: 'fig.bars(labels=["A","B","C"], values=[30,45,20])',
      hints: ['The data is pre-computed category counts, not raw continuous measurements.', 'Use bars() for categorical data with known counts.'],
      reviewSection: 'Insight callout — Histogram vs. bars()',
    },
    {
      id: 'stat2-002-quiz-3',
      type: 'choice',
      text: 'What is the purpose of `density=True` in `fig.histogram(data, bins=10, density=True)`?',
      options: [
        'It makes the bars more densely packed together',
        'It normalizes bar heights so the total area of all bars equals 1',
        'It increases the number of bins',
        'It adds a smooth curve overlay',
      ],
      answer: 'It normalizes bar heights so the total area of all bars equals 1',
      hints: ['What does "density" mean in probability? A probability density integrates to 1.', 'density=True is useful when comparing two histograms with different sample sizes.'],
      reviewSection: 'Math section — histogram bin count',
    },
    {
      id: 'stat2-002-quiz-4',
      type: 'choice',
      text: 'A scatter plot is appropriate when:',
      options: [
        'You have one categorical and one quantitative variable',
        'You have two quantitative variables and want to show their relationship',
        'You have one quantitative variable and want to show its distribution',
        'You have proportions of a whole and want to show part-to-whole',
      ],
      answer: 'You have two quantitative variables and want to show their relationship',
      hints: ['Think: how many variables? What type?', 'A scatter plot uses both axes for quantitative scales.'],
      reviewSection: 'Intuition → "Scatter plot" paragraph',
    },
    {
      id: 'stat2-002-quiz-5',
      type: 'choice',
      text: 'If you call `fig.axes(xmin=0, xmax=10, ymin=0, ymax=20)` and then plot a point at x=15, what happens?',
      options: [
        'The axes automatically expand to include the point',
        'An error is raised',
        'The point is clipped and not visible on the canvas',
        'The point appears at the edge of the canvas at x=10',
      ],
      answer: 'The point is clipped and not visible on the canvas',
      hints: ['axes() sets a fixed window. Data outside it is not shown.', 'This is intentional behavior — you control the visible range.'],
      reviewSection: 'Warning callout — Axes Must Cover All Data',
    },
    {
      id: 'stat2-002-quiz-6',
      type: 'choice',
      text: 'Which method would you use to plot a company\'s monthly revenue over 12 months?',
      options: ['fig.histogram()', 'fig.bars()', 'fig.plot()', 'fig.pie()'],
      answer: 'fig.plot()',
      hints: ['Monthly revenue over time is sequential and ordered.', 'A line chart shows how a value changes over time.'],
      reviewSection: 'Intuition → "Line chart" paragraph',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'fig.histogram() and fig.bars() are interchangeable for displaying distributions.',
      whyStudentsThinkIt: 'Both produce bar-shaped charts. Students see bars in both outputs and assume they do the same thing.',
      correctionExample: 'Calling `fig.bars(labels=scores, values=scores)` on a list of 200 exam scores would create 200 bars (one per unique value) — a barely readable vertical spike plot. `fig.histogram(data=scores, bins=10)` groups the values into 10 ranges and shows their frequency distribution.',
      contrastCase: 'If you already have the counts per bin from a previous analysis (e.g., bin="50-60": 5, "60-70": 18, ...), then `bars()` is correct — pass the bin labels and pre-computed counts.',
    },
    {
      falseBelief: 'You must always start the y-axis at 0 in every chart.',
      whyStudentsThinkIt: 'The "never truncate the y-axis" rule from bar charts is over-generalized.',
      correctionExample: 'A line chart of daily temperature over a year. The temperature never goes below 10°C. Setting ymin=0 puts the entire line in the top 30% of the chart, compressing all visible variation. In this case, ymin=5 or ymin=10 is more informative.',
      contrastCase: 'Bar charts: the zero-baseline rule is absolute for bar charts because bar length encodes the full value. For scatter plots and line charts, the baseline is not part of the visual encoding, so zooming into the relevant range is often appropriate.',
    },
    {
      falseBelief: 'fig.show() can be called multiple times to show different charts.',
      whyStudentsThinkIt: 'Students try to build two charts in one code cell by calling show() twice.',
      correctionExample: 'Creating two `Figure` objects in one cell and calling `show()` on each is the correct approach. Each `Figure` is an independent canvas.',
      contrastCase: 'Within one Figure, you can call multiple chart methods (e.g., fig.scatter() then fig.plot() for a scatter with regression line). But to produce two separate charts, create two separate Figure objects.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You are analyzing customer purchase amounts from an e-commerce site. You have 500 raw purchase amounts in dollars, ranging from $5 to $2,000, but 90% are below $200 with a few extreme purchases up to $2,000.',
      competingTechniques: ['histogram with default axes covering 0–2000', 'histogram with axes covering 0–300 and a note that outliers are excluded', 'log-transform the data then histogram'],
      whyThisTechniqueWins: 'A histogram covering the full 0–2000 range would compress 90% of the data into the first 10% of the x-axis — the distribution shape would be invisible. Zooming into 0–300 shows the main distribution and notes that a small number of high-value purchases are excluded. A log transform stretches the compressed left tail and compresses the long right tail, showing the full distribution in one chart — at the cost of a non-linear x-axis that is harder to interpret. Both zooming and log transform are valid; the choice depends on the audience and the analytical question.',
    },
    {
      situation: 'A professor wants to compare the distribution of final exam scores for three different sections of the same course (Section A: n=35, Section B: n=28, Section C: n=42).',
      competingTechniques: ['Three separate histograms in separate cells', 'Three boxplots side-by-side using fig.boxplot()', 'One combined histogram with color per section'],
      whyThisTechniqueWins: 'Boxplots side-by-side (using multiple fig.boxplot() calls on the same Figure with different x positions) allow direct visual comparison of medians, IQRs, and outliers across all three sections in a single chart. Three separate histograms force the reader to scan across charts and compare shapes mentally — harder. One combined histogram with three colors overlaid is hard to read when the distributions overlap. For comparison tasks, boxplots are optimal.',
    },
  ],

  debugging: [
    {
      commonError: 'Chart appears blank or empty after running the cell.',
      symptom: 'The code runs without errors but no chart appears, or only the axes are visible.',
      whyItHappened: 'Most common cause: the data is outside the axes() range, so all elements are clipped. Second most common: forgot to call fig.show().',
      repairStrategy: 'Step 1: Check that axes() was called. Step 2: Print min(data) and max(data) and verify they are within xmin/xmax. Step 3: For histograms, verify ymax > the maximum expected bin count (a rough estimate: max count ≈ n / bins × 2). Step 4: Verify fig.show() is the last line.',
    },
    {
      commonError: 'TypeError when passing string labels to fig.histogram().',
      symptom: '"TypeError: data must be a list of numbers" when trying to plot categories.',
      whyItHappened: 'Student called `fig.histogram(data=["A","B","C","A","B"], bins=3)` trying to get a frequency count of categories.',
      repairStrategy: 'Use `fig.bars()` for categorical data. You need to manually count frequencies first:\n```python\nfrom collections import Counter\ncounts = Counter(categories)\nfig.bars(labels=list(counts.keys()), values=list(counts.values()))\n```',
    },
  ],

  mastery: {
    targetLevel: 'Apply (Level 3) — given a dataset and question, write complete working opencalc code to produce the appropriate chart including axes, chart method, and title, with correct axes ranges.',
    solveIndependently: 'Given any dataset (described with variable names, types, and sample values), write the complete 5-line opencalc code to display it using the correct chart type with appropriate axes.',
    explainVerbally: 'Explain the difference between `fig.histogram()` and `fig.bars()` — when to use each and what goes wrong if you choose the wrong one.',
    detectIncorrectApplication: 'Given broken opencalc code (wrong axes, wrong method, missing show()), identify and fix all errors.',
    transferToUnfamiliar: 'Given a dataset type not covered in this lesson (e.g., a time series, a part-to-whole proportion), choose and apply the correct opencalc method without being told which one to use.',
  },
};
