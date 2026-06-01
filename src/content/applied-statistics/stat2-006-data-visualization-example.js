export default {
  id: "stat2-006",
  slug: "data-visualization-example",
  chapter: "stat2",
  order: 6,
  title: "Data Visualization Example",
  subtitle:
    "End-to-end exploratory data analysis — inspect, choose charts, interpret findings.",
  tags: [
    "EDA",
    "exploratory data analysis",
    "histogram",
    "scatter plot",
    "bar chart",
    "boxplot",
    "pandas",
    "workflow",
    "interpretation",
  ],
  aliases:
    "EDA exploratory data analysis end-to-end workflow pandas histogram scatter bar chart boxplot interpret findings",
  timeToComplete: 40,
  coreConcept:
    "Exploratory Data Analysis (EDA) is the systematic process of inspecting a dataset, choosing appropriate visualizations for each variable and relationship, and interpreting what the charts reveal before any formal modeling. EDA uncovers distributions, outliers, relationships, and data quality issues that guide all subsequent analysis.",
  prerequisites: [
    "stat2-001",
    "stat2-002",
    "stat2-003",
    "stat2-004",
    "stat2-005",
  ],
  nextLesson: "stat3-001",

  hook: {
    question:
      "You receive a new dataset with 8 columns and 500 rows. What is the first thing you do?",
    realWorldContext:
      'A data analyst at a healthcare company receives a file: patient_data.csv. Before running any regression or test, they spend the first hour in EDA. They learn: column "age" has a maximum of 999 — clearly a data entry error. Column "bmi" has 23 missing values. The "readmission" outcome is heavily imbalanced: 88% No, 12% Yes. A scatter plot of "length_of_stay vs. cost" shows two distinct clusters — one for surgery patients and one for medical patients. None of this would be visible from a summary table alone. EDA is not optional setup — it is where the real analytical work begins.',
  },

  intuition: {
    prose: [
      "**The EDA workflow.** A complete EDA follows this sequence:\n1. **Inspect** — shape, column names, dtypes, missing values, descriptive statistics.\n2. **Univariate** — analyze each variable individually: histogram for quantitative, bar chart for categorical.\n3. **Bivariate** — analyze pairs of variables: scatter for two quantitative, grouped bar for categorical+quantitative, correlation matrix.\n4. **Interpret** — write a plain-language summary: what did you find? distributions, outliers, unexpected patterns, data quality issues.\n5. **Document** — record your findings before moving to modeling. EDA findings directly inform which models are appropriate.",
      "**Before reading on, predict:** You have a dataset of 200 college students: age, major, GPA, hours_studied_per_week, passed_exam (0 or 1). List one chart you would make for each stage of the EDA workflow — one univariate chart and one bivariate chart.",
      "**Choosing the right chart for each variable pair.** The correct chart depends on the types of both variables:\n- Quantitative + Quantitative → Scatter plot\n- Quantitative + Categorical → Boxplot (or grouped bar of means)\n- Categorical + Categorical → Grouped bar or stacked bar\n- Single quantitative → Histogram or boxplot\n- Single categorical → Bar chart\n- Quantitative over time → Line chart",
      '**Missing values as a data quality signal.** When pandas reports `df.isnull().sum()` showing 15 missing values in "income," do not immediately drop them. Ask: are they missing randomly (a few left blanks), or systematically (all high-income respondents skipped the income question)? Systematic missing values introduce bias. Plot a bar chart of missingness by group before deciding how to handle them.',
      "**Interpreting shape: symmetry and skewness.** A histogram of household incomes in almost any country is right-skewed: most values are moderate (the peak), but there is a long right tail of very high incomes. The mean is pulled right by the tail (mean > median for right-skewed distributions). A histogram of age at retirement is roughly symmetric and bell-shaped. A histogram of a uniform random variable is flat. Recognizing these shapes guides the choice of summary statistics (mean/sd for symmetric, median/IQR for skewed) and statistical tests.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Complete EDA Checklist",
        body: "Step 1. `df.shape` — how many rows and columns?\n\nStep 2. `df.dtypes` — which columns are numeric vs. categorical?\n\nStep 3. `df.isnull().sum()` — which columns have missing values, and how many?\n\nStep 4. `df.describe()` — for numeric columns: min, max (check for impossible values), mean, std, quartiles.\n\nStep 5. Univariate: histogram for each numeric column; bar chart for each categorical column.\n\nStep 6. Bivariate: scatter for numeric pairs with interesting expected relationships; boxplot or grouped bar for numeric vs. categorical.\n\nStep 7. Write a 3–5 sentence summary: what is the distribution of the main outcome variable? What relationships did you find? What data quality issues exist?\n\nNote: Do not start modeling until steps 1–7 are complete.",
      },
      {
        type: "insight",
        title: 'The "Plot First" Rule',
        body: 'Anscombe\'s quartet (four datasets with identical mean, variance, and r = 0.816) is the classic demonstration of why you must plot before computing statistics.\n\nIn practice, a common version of this mistake is: computing correlation between two variables and reporting "moderate positive correlation (r = 0.61)" without noticing that the scatter plot shows TWO clusters — a group of younger customers and a group of older customers — each with weak correlation, but with a strong between-group difference creating the apparent overall correlation.\n\nRule: compute r (or any statistic) only after looking at the scatter plot. The chart informs which statistics are meaningful.',
      },
      {
        type: "warning",
        title: "Five EDA Mistakes to Avoid",
        body: "1. **Dropping missing values without investigation** — always check if missingness is systematic before dropping.\n2. **Using mean and SD for a skewed distribution** — report median and IQR instead.\n3. **Treating every outlier as an error** — outliers may be real, important data points (high-value customers, extreme events). Investigate before removing.\n4. **Only examining individual variables, not relationships** — a variable that looks normal by itself may split into two clusters when conditioned on another variable.\n5. **Skipping EDA because the dataset looks clean** — data entry errors and unexpected distributions appear in clean-looking datasets all the time.",
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Five-number summary and outlier fences.** The five-number summary is {min, Q1, median, Q3, max}. The interquartile range IQR = Q3 − Q1. Outlier fences: lower fence = Q1 − 1.5 × IQR, upper fence = Q3 + 1.5 × IQR. Any value below the lower fence or above the upper fence is a potential outlier by the Tukey rule. A boxplot displays these five values visually — the box spans Q1 to Q3, the median line is inside the box, and whiskers extend to the last data value within the fences.",
    ],
  },

  rigor: {
    prose: [
      "**R1 — EDA vs. confirmatory data analysis.** EDA (Tukey, 1977) is exploratory — the goal is discovery, not confirmation. You look at the data with an open mind: what is unusual? what patterns exist? EDA generates hypotheses. Confirmatory analysis (t-tests, regression, chi-square) tests pre-specified hypotheses. The two must not be confused: hypotheses that emerge from EDA should be tested on new data, or at minimum acknowledged as post-hoc (data-driven) hypotheses with lower evidential weight.",
      "**R2 — Correlation matrix.** For a dataset with k numeric variables, the correlation matrix is a k×k symmetric matrix where entry (i,j) = r between variable i and variable j. Diagonal entries = 1.0. A heat map of the correlation matrix is a standard EDA output for medium-dimensional datasets (k ≤ 20). Values close to +1 or −1 suggest strong linear relationships. Values near 0 suggest no linear relationship (but could still have nonlinear ones). In pandas: `df.corr()` computes the correlation matrix.",
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: "stat2-006-cell-1",
        type: "python",
        cellTitle: "Step 1: Inspect the dataset",
        code: `import pandas as pd

# Simulated student dataset: 30 students
data = {
    "age":           [18,19,20,21,22,18,19,20,21,22,18,19,20,21,22,
                      18,19,20,21,22,18,19,20,21,22,18,19,20,21,22],
    "major":         ["CS","CS","Math","Math","CS","Bio","Bio","CS","Math","Bio",
                      "CS","Bio","Math","CS","Math","Bio","CS","Math","Bio","CS",
                      "Math","CS","Bio","Math","CS","Bio","CS","Math","CS","Bio"],
    "gpa":           [3.5,3.2,3.8,2.9,3.6,3.1,3.4,2.7,3.9,3.0,
                      3.3,2.8,3.7,3.5,3.2,2.6,3.9,3.4,3.1,3.8,
                      3.6,3.0,2.9,3.5,3.7,3.2,3.8,3.3,3.4,2.8],
    "hours_studied": [8,6,10,5,9,4,7,3,12,5,
                      6,4,11,8,6,3,13,7,5,10,
                      9,5,4,8,11,6,12,7,9,4],
    "passed":        [1,1,1,0,1,0,1,0,1,0,
                      1,0,1,1,1,0,1,1,0,1,
                      1,0,0,1,1,1,1,1,1,0],
}
df = pd.DataFrame(data)

# Step 1: Inspect
print("Shape:", df.shape)
print()
print("dtypes:")
print(df.dtypes)
print()
print("Missing values:")
print(df.isnull().sum())
print()
print("Describe:")
print(df.describe())
`,
        instructions:
          "This is the mandatory first step: understand what you have before plotting. Note which columns are numeric vs. categorical. Are there any impossible values in describe()?",
      },
      {
        id: "stat2-006-cell-2",
        type: "python",
        cellTitle: "Step 2: Univariate analysis",
        code: `import pandas as pd

data = {
    "age":           [18,19,20,21,22,18,19,20,21,22,18,19,20,21,22,
                      18,19,20,21,22,18,19,20,21,22,18,19,20,21,22],
    "major":         ["CS","CS","Math","Math","CS","Bio","Bio","CS","Math","Bio",
                      "CS","Bio","Math","CS","Math","Bio","CS","Math","Bio","CS",
                      "Math","CS","Bio","Math","CS","Bio","CS","Math","CS","Bio"],
    "gpa":           [3.5,3.2,3.8,2.9,3.6,3.1,3.4,2.7,3.9,3.0,
                      3.3,2.8,3.7,3.5,3.2,2.6,3.9,3.4,3.1,3.8,
                      3.6,3.0,2.9,3.5,3.7,3.2,3.8,3.3,3.4,2.8],
    "hours_studied": [8,6,10,5,9,4,7,3,12,5,
                      6,4,11,8,6,3,13,7,5,10,
                      9,5,4,8,11,6,12,7,9,4],
    "passed":        [1,1,1,0,1,0,1,0,1,0,
                      1,0,1,1,1,0,1,1,0,1,
                      1,0,0,1,1,1,1,1,1,0],
}
df = pd.DataFrame(data)

# Histogram: GPA distribution
gpa_vals = df["gpa"].tolist()

fig = Figure(width=7, height=5)
fig.axes(xmin=2.4, xmax=4.1, ymin=0, ymax=10)
fig.histogram(values=gpa_vals, bins=8, color="steelblue")
fig.text(3.25, 9.7, "GPA Distribution", size=13, bold=True)
fig.show()

# Bar chart: major frequency
major_counts = df["major"].value_counts()
print("Major counts:", major_counts.to_dict())

fig2 = Figure(width=6, height=5)
fig2.axes(xmin=-1, xmax=3, ymin=0, ymax=14)
fig2.bars(labels=major_counts.index.tolist(), values=major_counts.values.tolist(), color="coral")
fig2.text(1, 13.5, "Students per Major", size=13, bold=True)
fig2.show()
`,
        instructions:
          "Describe the GPA histogram: what is the shape? Is it symmetric or skewed? Are there outliers? Then examine the major bar chart: are the three majors balanced?",
      },
      {
        id: "stat2-006-cell-3",
        type: "python",
        cellTitle: "Step 3: Bivariate analysis — hours studied vs. GPA",
        code: `import pandas as pd

data = {
    "gpa":           [3.5,3.2,3.8,2.9,3.6,3.1,3.4,2.7,3.9,3.0,
                      3.3,2.8,3.7,3.5,3.2,2.6,3.9,3.4,3.1,3.8,
                      3.6,3.0,2.9,3.5,3.7,3.2,3.8,3.3,3.4,2.8],
    "hours_studied": [8,6,10,5,9,4,7,3,12,5,
                      6,4,11,8,6,3,13,7,5,10,
                      9,5,4,8,11,6,12,7,9,4],
    "major":         ["CS","CS","Math","Math","CS","Bio","Bio","CS","Math","Bio",
                      "CS","Bio","Math","CS","Math","Bio","CS","Math","Bio","CS",
                      "Math","CS","Bio","Math","CS","Bio","CS","Math","CS","Bio"],
}
df = pd.DataFrame(data)

# Scatter: hours studied vs GPA
hours = df["hours_studied"].tolist()
gpa   = df["gpa"].tolist()

# Compute correlation
n = len(hours)
xbar = sum(hours)/n
ybar = sum(gpa)/n
sx = (sum((x-xbar)**2 for x in hours)/(n-1))**0.5
sy = (sum((y-ybar)**2 for y in gpa)/(n-1))**0.5
r = sum((hours[i]-xbar)*(gpa[i]-ybar) for i in range(n)) / ((n-1)*sx*sy)
print(f"r(hours, gpa) = {r:.3f}")

# Compute regression line
b1 = r * sy/sx
b0 = ybar - b1*xbar
print(f"Regression: GPA = {b0:.2f} + {b1:.3f} * hours")

fig = Figure(width=7, height=5)
fig.axes(xmin=2, xmax=14, ymin=2.4, ymax=4.1)
fig.scatter(xs=hours, ys=gpa, color="coral", size=6)
# Overlay regression line
line_y = [b0 + b1*x for x in [2, 14]]
fig.plot(xs=[2, 14], ys=line_y, color="navy", lw=2)
fig.text(8, 4.07, "Hours Studied vs. GPA", size=13, bold=True)
fig.show()
`,
        instructions:
          "Interpret r: is the association strong, moderate, or weak? Positive or negative? Does the scatter plot show any outliers or clusters that r might be hiding?",
      },
      {
        id: "stat2-006-cell-4",
        type: "python",
        cellTitle: "Step 4: Pass rate by major",
        code: `import pandas as pd

data = {
    "major":  ["CS","CS","Math","Math","CS","Bio","Bio","CS","Math","Bio",
               "CS","Bio","Math","CS","Math","Bio","CS","Math","Bio","CS",
               "Math","CS","Bio","Math","CS","Bio","CS","Math","CS","Bio"],
    "passed": [1,1,1,0,1,0,1,0,1,0,
               1,0,1,1,1,0,1,1,0,1,
               1,0,0,1,1,1,1,1,1,0],
}
df = pd.DataFrame(data)

# Pass rate by major (proportion)
pass_rate = df.groupby("major")["passed"].mean()
print("Pass rate by major:")
print(pass_rate.round(3))

labels = pass_rate.index.tolist()
values = [round(v, 3) for v in pass_rate.values.tolist()]

fig = Figure(width=6, height=5)
fig.axes(xmin=-1, xmax=3, ymin=0, ymax=1.0)
fig.bars(labels=labels, values=values, color="teal")
fig.text(1, 0.97, "Exam Pass Rate by Major", size=13, bold=True)
fig.show()
`,
        instructions:
          "Are pass rates substantially different across majors? Is this difference meaningful, or could it be explained by chance? (The chi-square test in stat7 will answer this formally.)",
      },
    ],
  },

  examples: [
    {
      id: "stat2-006-ex1",
      title: "Complete EDA checklist for a new dataset",
      difficulty: "easy",
      problem:
        "You receive a dataset: housing.csv with columns: price (int), sqft (int), bedrooms (int), neighborhood (str), days_on_market (int). Walk through the complete EDA checklist.",
      steps: [
        {
          expression:
            "\\text{Step 1: df.shape → e.g., (1500, 5). 1500 rows, 5 columns.}",
          annotation:
            "Reasonable dataset size. No columns accidentally split into extra columns.",
          strategyTitle: "Step 1: Shape",
        },
        {
          expression:
            "\\text{Step 2: dtypes: price/sqft/bedrooms/days\\_on\\_market=int, neighborhood=object}",
          annotation:
            "neighborhood is categorical (str). The four numeric columns will get histograms. neighborhood will get a bar chart.",
          strategyTitle: "Step 2: Types",
        },
        {
          expression:
            "\\text{Step 3: df.isnull().sum() — check if any column has missing values}",
          annotation:
            "If days_on_market has 50 missing: are they all the most recent listings (days not yet countable)? Or random? If systematic, dropping them could bias analyses toward older listings.",
          strategyTitle: "Step 3: Missing values",
        },
        {
          expression:
            "\\text{Step 4: df.describe() — check price max for outliers, bedrooms min for negatives}",
          annotation:
            "Check: is there a house with price=$0 (entry error)? bedrooms=0 (studio — valid)? sqft=1 (entry error)? days_on_market=10000 (error or unusual)?",
          strategyTitle: "Step 4: Describe",
        },
        {
          expression:
            "\\text{Step 5 Univariate: histogram(price), histogram(sqft), bar(neighborhood)}",
          annotation:
            "Expect price to be right-skewed (few luxury homes). sqft might be bimodal (condos + houses). neighborhood bar reveals how balanced the sample is across areas.",
          strategyTitle: "Step 5: Univariate",
        },
        {
          expression:
            "\\text{Step 6 Bivariate: scatter(sqft, price) + trend line; boxplot(price by neighborhood)}",
          annotation:
            "scatter(sqft, price) is the most important bivariate: likely strong positive linear relationship, but may reveal two clusters (condos vs. houses). Grouped bar of mean price by neighborhood reveals location premium.",
          strategyTitle: "Step 6: Bivariate",
        },
      ],
    },
    {
      id: "stat2-006-ex2",
      title: "Choose the right chart for each variable pair",
      difficulty: "medium",
      problem:
        "Dataset: age (int), salary (float), department (str, 4 levels), performance_rating (1–5, int), tenure_years (float). For each pair, name the correct chart:\n(a) salary vs. age\n(b) performance_rating distribution alone\n(c) salary by department\n(d) department vs. performance_rating",
      steps: [
        {
          expression: "\\text{(a) salary vs. age: scatter plot}",
          annotation:
            "Both are quantitative. Scatter shows direction, form, strength, and outliers of the relationship.",
          strategyTitle: "(a) Q+Q → scatter",
        },
        {
          expression:
            "\\text{(b) performance\\_rating alone: bar chart (ordinal 1–5)}",
          annotation:
            "performance_rating is ordinal (discrete, ordered). A bar chart in natural order (1 → 5) shows the distribution. A histogram would also work if treated as continuous, but bars in 1–5 order are cleaner.",
          strategyTitle: "(b) Single ordinal → bar",
        },
        {
          expression:
            "\\text{(c) salary by department: boxplot or grouped bar of means}",
          annotation:
            "One quantitative + one categorical (4 levels). Boxplot shows the full distribution of salary within each department: median, spread, and outliers. Grouped bar of means would show only the central tendency.",
          strategyTitle: "(c) Q+Cat → boxplot",
        },
        {
          expression:
            "\\text{(d) department vs. performance\\_rating: grouped bar or stacked bar}",
          annotation:
            "Two categorical variables (4 departments × 5 rating levels). A grouped bar chart with one group per department and one bar per rating level compares the distribution of ratings across departments.",
          strategyTitle: "(d) Cat+Cat → grouped bar",
        },
      ],
    },
    {
      id: "stat2-006-ex3",
      title: "Interpret an EDA finding",
      difficulty: "medium",
      problem:
        'After running EDA on a customer churn dataset, you find: (1) the "monthly_charges" histogram is bimodal with peaks at $20 and $75; (2) the scatter of tenure_months vs. monthly_charges shows two distinct clusters. Write a plain-language interpretation and explain what this means for next steps.',
      steps: [
        {
          expression: "\\text{Bimodal histogram: two peaks at \\$20 and \\$75}",
          annotation:
            "Two peaks suggest two subpopulations: one low-spend group (budget plan?) and one high-spend group (premium plan?). These are not uniformly distributed — the data has a natural split.",
          strategyTitle: "Step 1: Interpret bimodal",
        },
        {
          expression:
            "\\text{Two clusters in scatter: corroborates two subpopulations}",
          annotation:
            "When monthly_charges vs. tenure shows two separate clouds, the clusters likely correspond to the same two groups (budget vs. premium). The relationship between tenure and charges may be different within each group.",
          strategyTitle: "Step 2: Scatter clusters confirm subgroups",
        },
        {
          expression:
            '\\text{Next step: add a "plan\\_type" or "segment" column, re-examine churn by segment}',
          annotation:
            "If you run a regression or churn model on the combined data without accounting for the two groups, the model will be confused by the mixture. The right approach is to segment first (create a plan_type indicator) and then model each segment or include segment as a predictor.",
          strategyTitle: "Step 3: Action from EDA finding",
        },
        {
          expression:
            '\\text{EDA finding summary: "Monthly charges are bimodal (peaks: \\$20, \\$75), suggesting two customer segments. Regression models should include segment as a predictor or be fit separately per segment."}',
          annotation:
            "This is the kind of plain-language EDA summary that should be written before any modeling step.",
          strategyTitle: "Step 4: Document the finding",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat2-006-ch1",
      title: "Design a complete EDA plan",
      difficulty: "medium",
      problem:
        "Dataset: fitness_tracker.csv — user_id, age, gender (M/F), steps_per_day (int), calories_burned (float), sleep_hours (float), heart_rate_avg (int). Design a complete EDA plan: list every chart you would make, the chart type, and what you expect to find.",
      walkthrough: [
        {
          expression:
            "\\text{Univariate: histogram(steps\\_per\\_day), histogram(calories\\_burned), histogram(sleep\\_hours)}",
          annotation:
            "Steps and calories are likely right-skewed (a few very active users). Sleep hours should be approximately normal (centered around 7–8 hours). Histograms reveal shape, outliers, and whether any values seem impossible (steps=1,000,000?).",
        },
        {
          expression:
            "\\text{Univariate: bar(gender) — check balance, bar(age) — likely discrete bins}",
          annotation:
            "Gender bar: is the sample balanced? Age: is there a wide range? Are all age groups represented?",
        },
        {
          expression:
            "\\text{Bivariate: scatter(steps, calories) — expect strong positive linear}",
          annotation:
            "More steps → more calories burned. This is likely strong and roughly linear. May show different trends for M vs. F users (consider coloring by gender).",
        },
        {
          expression:
            "\\text{Bivariate: scatter(sleep\\_hours, heart\\_rate\\_avg) — expect negative correlation}",
          annotation:
            "More sleep → lower resting heart rate. Could be moderate negative. Check for outliers (athletes with unusually low heart rate despite little sleep).",
        },
        {
          expression:
            "\\text{Bivariate: bar(mean steps by gender) or boxplot(steps by gender)}",
          annotation:
            "Does average daily steps differ by gender? Boxplot shows the full distribution including outliers. Bar of means shows only central tendency.",
        },
      ],
      answer:
        "Complete EDA plan: 5 univariate charts (3 histograms, 2 bar charts) + 3 bivariate charts (2 scatters, 1 boxplot/grouped bar). Key expectations: right-skewed steps/calories, negative sleep-heart rate correlation, potential gender difference in activity.",
    },
    {
      id: "stat2-006-ch2",
      title: "Detect and explain a data quality issue",
      difficulty: "hard",
      problem:
        'You run `df.describe()` on a health dataset and find: "systolic_bp" has min=10, max=280, mean=122, std=45. The normal healthy range is 90–180 mmHg for most adults. (a) What are the data quality concerns? (b) How would you investigate with visualization? (c) What actions would you take?',
      walkthrough: [
        {
          expression:
            "\\text{Concern 1: min=10 — impossible. Systolic BP cannot be 10 mmHg in a living person (minimum viable ≈ 70)}",
          annotation:
            "A value of 10 is certainly a data entry error: either the decimal was misplaced (100 → 10), a digit was missed, or the column was misread from another measurement unit.",
        },
        {
          expression:
            "\\text{Concern 2: max=280 — possible but concerning. Hypertensive crisis starts at >180. Values 180–280 are rare but real.}",
          annotation:
            "Max=280 could be real (severe hypertensive emergency) or a data entry error (28.0 → 280). Requires investigation rather than automatic removal.",
        },
        {
          expression:
            "\\text{Concern 3: std=45 — very large. Normally systolic BP std is 10–20 mmHg in a study sample.}",
          annotation:
            "A large std may be inflated by the extreme outliers (min=10, max=280). After removing impossible values, std would likely drop substantially.",
        },
        {
          expression:
            "\\text{Investigation: histogram(systolic\\_bp) — look for spike at 10, long right tail above 180}",
          annotation:
            "The histogram will show the overall distribution and visually identify where the outliers sit. A boxplot would also show the outlier flags below Q1-1.5×IQR and above Q3+1.5×IQR.",
        },
        {
          expression:
            "\\text{Actions: (1) Flag/remove values <70 as impossible. (2) Flag values >200 for manual review. (3) Report to data owner.}",
          annotation:
            "Never silently drop outliers. Document what was removed and why. Rerun describe() after cleaning to verify the distribution looks plausible (mean ~122, std ~15–20).",
        },
      ],
      answer:
        "Three concerns: min=10 (impossible), max=280 (suspicious), std=45 (inflated by outliers). Investigate with histogram + boxplot. Remove <70 as impossible, flag >200 for review, document all decisions.",
    },
    ,
    {
      id: "stat2-006-ch3",
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
        symbol: "\\text{EDA}",
        meaning:
          "Exploratory Data Analysis — systematic inspection and visualization of a dataset before modeling.",
      },
      {
        symbol: "\\text{IQR}",
        meaning:
          "Interquartile Range = Q3 − Q1. The range of the middle 50% of data.",
      },
      {
        symbol: "\\text{Lower fence} = Q1 - 1.5 \\times \\text{IQR}",
        meaning:
          "Tukey outlier threshold — values below this are flagged as potential outliers.",
      },
      {
        symbol: "\\text{Upper fence} = Q3 + 1.5 \\times \\text{IQR}",
        meaning:
          "Tukey outlier threshold — values above this are flagged as potential outliers.",
      },
      {
        symbol: "\\texttt{df.describe()}",
        meaning:
          "pandas method — returns count, mean, std, min, 25%, 50%, 75%, max for each numeric column.",
      },
      {
        symbol: "\\texttt{df.isnull().sum()}",
        meaning: "pandas method — returns count of missing values per column.",
      },
    ],
    rulesOfThumb: [
      "Always run the EDA checklist (shape → dtypes → missing → describe → univariate → bivariate) before any modeling.",
      "Plot before computing statistics: a number without a picture can mislead.",
      "Investigate missing values before dropping — systematic missingness introduces bias.",
      "Never silently remove outliers: document what was removed and why.",
      "An EDA finding (bimodal distribution, unexpected cluster) directly changes which models are appropriate.",
      "Write a plain-language EDA summary before writing any model code.",
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      {
        lessonId: "stat3-001",
        label: "Measures of Center",
        note: "stat3 formalizes mean, median, mode — the EDA describe() summary statistics.",
      },
      {
        lessonId: "stat3-004",
        label: "Boxplots",
        note: "stat3-004 develops the five-number summary and boxplot interpretation in depth.",
      },
      {
        lessonId: "stat8-001",
        label: "Linear Regression",
        note: "The scatter plot + regression line from EDA becomes the formal regression model in stat8.",
      },
    ],
  },

  checkpoints: [
    {
      id: "cp-stat2-006-1",
      label: "Read: recite the five stages of the EDA workflow in order",
      type: "read",
    },
    {
      id: "cp-stat2-006-2",
      label:
        "Read: name the right chart type for each of the four variable-pair combinations",
      type: "read",
    },
    {
      id: "cp-stat2-006-3",
      label:
        "Lab: run cell 1 and identify whether any column has suspicious values in describe()",
      type: "lab",
    },
    {
      id: "cp-stat2-006-4",
      label:
        "Lab: run cell 2 and describe the GPA histogram — shape, skewness, any outliers",
      type: "lab",
    },
    {
      id: "cp-stat2-006-5",
      label: "Apply: predict r(hours_studied, gpa) before running cell 3",
      type: "example",
    },
    {
      id: "cp-stat2-006-6",
      label:
        "Apply example 2: assign chart types for all four variable pairs before reading the solution",
      type: "example",
    },
    {
      id: "cp-stat2-006-7",
      label:
        "Attempt challenge 1: write a complete 5-chart EDA plan for the fitness dataset",
      type: "challenge",
    },
    {
      id: "cp-stat2-006-8",
      label:
        "Read: list the five EDA mistakes to avoid from the warning callout",
      type: "read",
    },
  ],

  assessment: {
    questions: [
      {
        id: "stat2-006-assess-1",
        type: "choice",
        text: "In EDA, when should you compute a correlation coefficient?",
        options: [
          "Before plotting, to decide whether a scatter plot is worth making",
          "After looking at the scatter plot, to quantify what you already see visually",
          "Only for datasets with more than 100 rows",
          "Instead of a scatter plot for large datasets",
        ],
        answer:
          "After looking at the scatter plot, to quantify what you already see visually",
        instructions:
          'The "plot first" rule: r can be 0.8 for very different scatter patterns. Plot first to understand what you are quantifying.',
      },
    ],
  },

  quiz: [
    {
      id: "stat2-006-quiz-1",
      type: "choice",
      text: "The correct order for an EDA workflow is:",
      options: [
        "Model → visualize → clean data",
        "Compute statistics → plot → interpret",
        "Inspect (shape/types/missing/describe) → univariate → bivariate → interpret",
        "Bivariate → univariate → data cleaning",
      ],
      answer:
        "Inspect (shape/types/missing/describe) → univariate → bivariate → interpret",
      hints: [
        "You need to understand the data structure before plotting.",
        "Univariate (single variables) before bivariate (pairs).",
      ],
      reviewSection: "Procedure: Complete EDA Checklist",
    },
    {
      id: "stat2-006-quiz-2",
      type: "choice",
      text: "For a dataset with columns price (float) and neighborhood (str, 5 levels), the appropriate bivariate visualization is:",
      options: [
        "Scatter plot of price vs. neighborhood",
        "Histogram of price",
        "Boxplot or bar chart of mean price by neighborhood",
        "Pie chart of neighborhood proportions",
      ],
      answer: "Boxplot or bar chart of mean price by neighborhood",
      hints: [
        "Price is quantitative. Neighborhood is categorical.",
        "The variable pair type determines the chart type.",
      ],
      reviewSection:
        "Example 2 — Choose the right chart for each variable pair",
    },
    {
      id: "stat2-006-quiz-3",
      type: "choice",
      text: 'You find 50 missing values in a "household_income" column. The best next action is:',
      options: [
        "Drop all 50 rows immediately",
        "Replace all with the column mean",
        "Check whether the missingness is random or systematic (e.g., all from one group), then decide",
        "Ignore the missing values and proceed with analysis",
      ],
      answer:
        "Check whether the missingness is random or systematic (e.g., all from one group), then decide",
      hints: [
        "If high-income respondents systematically skipped the question, dropping them biases the analysis.",
        "The mechanism of missingness determines the appropriate handling strategy.",
      ],
      reviewSection:
        'Intuition → "Missing values as a data quality signal" paragraph',
    },
    {
      id: "stat2-006-quiz-4",
      type: "choice",
      text: "A histogram of a variable shows two distinct peaks (bimodal). This most likely indicates:",
      options: [
        "Data entry errors in both peaks",
        "Two subpopulations that should be analyzed separately or with a group indicator",
        "The variable is normally distributed",
        "The bin size is too small",
      ],
      answer:
        "Two subpopulations that should be analyzed separately or with a group indicator",
      hints: [
        "A single population usually produces a unimodal (one-peak) histogram.",
        "Two peaks often correspond to two groups in the data (e.g., two plan types, two age groups).",
      ],
      reviewSection: "Example 3 — Interpret an EDA finding",
    },
    {
      id: "stat2-006-quiz-5",
      type: "choice",
      text: 'df.describe() shows a column "age" with min = -3. You should:',
      options: [
        "Accept this as a valid extreme age",
        "Flag it as a likely data entry error and investigate before using the column in analysis",
        "Replace -3 with the mean age",
        "Drop the entire column",
      ],
      answer:
        "Flag it as a likely data entry error and investigate before using the column in analysis",
      hints: [
        "Negative age is biologically impossible.",
        "Always investigate impossible values rather than silently dropping or replacing them.",
      ],
      reviewSection:
        "Procedure step 4: describe() — check min/max for impossible values",
    },
    {
      id: "stat2-006-quiz-6",
      type: "choice",
      text: 'EDA is classified as "exploratory" rather than "confirmatory" because:',
      options: [
        "EDA uses charts instead of numbers",
        "EDA generates hypotheses from data; confirmatory analysis tests pre-specified hypotheses",
        "EDA is less rigorous than statistical testing",
        "EDA applies only to small datasets",
      ],
      answer:
        "EDA generates hypotheses from data; confirmatory analysis tests pre-specified hypotheses",
      hints: [
        "Tukey (1977) coined the EDA term and distinguished it from confirmatory analysis.",
        "Hypotheses generated from EDA on the same data require new data or adjustment for being data-driven.",
      ],
      reviewSection: "Rigor section — R1 EDA vs. confirmatory analysis",
    },
  ],

  misconceptions: [
    {
      falseBelief:
        "EDA is just a quick look at the data — a few summary statistics and one histogram.",
      whyStudentsThinkIt:
        'Students see EDA as a preliminary step that does not require much work. They want to get to the "real" analysis quickly.',
      correctionExample:
        "The healthcare analyst example: without EDA, the bimodal distribution in monthly_charges would go unnoticed. The regression model would produce misleading coefficients because it would be trying to fit one line to two distinct subpopulations. The model would appear to fit (reasonable R²) but make systematically wrong predictions for each group. EDA is where the analytical thinking happens.",
      contrastCase:
        "EDA on a well-understood, cleaned dataset from a database with enforced constraints can be briefer. If you know the data is clean and well-structured, the EDA still happens but confirms rather than discovers.",
    },
    {
      falseBelief: "Outliers should always be removed.",
      whyStudentsThinkIt:
        "Students learn that outliers affect statistics and distort regression. They conclude that removing outliers always improves analysis.",
      correctionExample:
        "In a customer transaction dataset, a customer who spent $50,000 in one order is an outlier. But this is a real, valuable observation — removing it would make your model blind to high-value customers, exactly the segment the business most wants to understand.",
      contrastCase:
        "A patient age of 150 years is clearly a data entry error and should be removed after documentation. The rule is: outliers from entry errors should be corrected/removed; outliers that represent real extreme observations should be investigated and usually retained (possibly with a flag variable).",
    },
    {
      falseBelief:
        "You only need to look at univariate distributions (one variable at a time) during EDA.",
      whyStudentsThinkIt:
        "EDA tutorials often focus on describe() and histograms. Students miss the bivariate step.",
      correctionExample:
        'A variable "exam_score" has a perfectly normal-looking histogram. A variable "study_hours" also looks normal. But the scatter plot reveals two clusters: one group of students with low hours and low scores, and another with high hours and high scores — with no students in the middle. This bimodal relationship is completely invisible in the univariate histograms.',
      contrastCase:
        "When two variables are truly independent, univariate analysis captures everything. Bivariate analysis is essential when you expect a relationship — which is almost always the case in applied statistics.",
    },
  ],

  transferPrompts: [
    {
      situation:
        "You are given a social media dataset: post_id, platform (Instagram/Twitter/Facebook), post_length (int), likes (int), shares (int), comments (int), is_viral (0/1). Your goal is to predict virality. What complete EDA would you run before building any model?",
      competingTechniques: [
        "Run logistic regression directly on all variables",
        "Compute correlation matrix of all numeric variables",
        "Full EDA: inspect → univariate → bivariate → interpret → document",
      ],
      whyThisTechniqueWins:
        'Full EDA first: correlation matrix would miss that "likes" and "shares" are heavily right-skewed (a few posts get millions). Logistic regression directly would be distorted by extreme outliers. EDA reveals: the distribution shape of each metric, whether viral posts cluster at certain post lengths, whether virality rates differ by platform — each of these findings changes model design (log-transform likes, add platform dummy, remove outliers from certain platforms).',
    },
    {
      situation:
        "A university wants to understand grade distributions across departments. Dataset: student_id, department (12 levels), year (1–4), final_grade (0–100), course_type (required/elective).",
      competingTechniques: [
        "Compute mean grade per department and sort",
        "Box plots of final_grade by department",
        "Full EDA including histogram, boxplot by department, boxplot by year, histogram by course_type",
      ],
      whyThisTechniqueWins:
        "Full EDA: boxplots by department reveal not just means but spread and outliers — one department might have a wide spread (many failing students) while another is tightly clustered around 90. The year dimension might show grade inflation over years (or grade improvement as students mature). Course type splits might reveal that elective courses have higher grades. Mean comparison alone misses all of this structure.",
    },
  ],

  debugging: [
    {
      commonError:
        "df.describe() shows floats for a column that should be integers, or integers where floats are expected.",
      symptom:
        'describe() shows "passed" column mean = 0.666667, dtype float64, but you expected integer counts.',
      whyItHappened:
        'This is expected and correct: df["passed"].mean() is the pass rate (proportion), not a count. pandas computes the mean of 0/1 values, which is a float between 0 and 1. This is the proportion of students who passed — a useful EDA statistic.',
      repairStrategy:
        'This is not an error — it is meaningful. If you genuinely need only integers and float output seems wrong, check for a mixed-type column (some values were read as strings, converting the column to float). Fix with `df["col"] = pd.to_numeric(df["col"], errors="coerce")` and investigate any coercion failures.',
    },
    {
      commonError:
        "Histogram looks empty or has only one bar when all values are similar.",
      symptom:
        "You call fig.histogram(values=gpa_vals, bins=8) but only one bar appears or the chart looks strange.",
      whyItHappened:
        "The axes range (xmin/xmax) does not cover the data range. If all GPA values are 2.6–3.9 but your axes go xmin=0, xmax=10, the 8 bins span 0–10 and the narrow data range collapses into 1–2 bins. Or your ymax is too small, cutting off the bars.",
      repairStrategy:
        "Set xmin and xmax to match your data range: `xmin = min(values) - 0.1, xmax = max(values) + 0.1`. Set ymax to accommodate the tallest bar, e.g., `ymax = n/bins * 2` as a rough estimate, then adjust after viewing.",
    },
  ],

  mastery: {
    targetLevel:
      "Apply + Analyze (Level 3–4) — execute a complete EDA on a new dataset including all five stages, correctly choose chart types for all variable-pair combinations, identify data quality issues, and write a plain-language interpretation summary.",
    solveIndependently:
      "Given a new dataset description (column names and types), design a complete EDA plan listing every chart, the chart type, and the expected finding.",
    explainVerbally:
      "Explain the difference between EDA and confirmatory analysis, and give a concrete example of an EDA finding that would change which statistical model you apply.",
    detectIncorrectApplication:
      "Review an EDA report that (1) dropped all outliers without investigation, (2) only examined univariate distributions, and (3) used a pie chart for a 12-category variable. Identify all three errors and propose corrections.",
    transferToUnfamiliar:
      "Given a dataset from an unfamiliar domain (e.g., geospatial, financial, biological), apply the EDA checklist, select appropriate charts for each column and column pair, and produce a written interpretation summary.",
  },
};
