// Chapter 3.1 — Tabular Data Model
//
// PHASE 3 — DATA HANDLING (PANDAS STACK)
//
// TEACHES:
//   Math:    Tables as 2D arrays with named axes; row vs column vectors;
//            aggregation as projection (sum/mean collapse a dimension);
//            counting and frequency as the foundation of probability;
//            the group-by operation as partitioning a set
//
//   Python:  pandas Series and DataFrame; pd.DataFrame() from dicts;
//            .head(), .info(), .describe(); column access df["col"];
//            loc (label-based) vs iloc (position-based) indexing;
//            boolean filtering; .dtypes; adding computed columns;
//            .value_counts(), .groupby().mean()
//
//   Library: fig.bars() for categorical summaries; fig.scatter() for
//            two-variable relationships; fig.plot(fn) for trend overlays

export default {
  id: 'py-3-1-tabular-data-model',
  slug: 'tabular-data-model',
  chapter: 3.1,
  order: 0,
  title: 'Tabular Data Model',
  subtitle: 'How pandas thinks about rows, columns, types, and indexes — and why it matters',
  tags: [
    'pandas', 'DataFrame', 'Series', 'indexing', 'loc', 'iloc',
    'dtypes', 'boolean filtering', 'groupby', 'tabular', 'opencalc',
  ],

  hook: {
    question: 'A spreadsheet has rows and columns. A numpy array has rows and columns. A pandas DataFrame has rows and columns. They are not the same thing — what is the difference, and why does it change everything?',
    realWorldContext:
      'Real-world data arrives as tables: CSV files, database query results, API responses. ' +
      'Each row is an observation (a person, a transaction, a sensor reading). ' +
      'Each column is a variable (age, price, temperature). ' +
      'Pandas is the Python standard for working with this kind of data — ' +
      'used inside Google, Facebook, NASA, and every modern data science team. ' +
      'Understanding the tabular data model is the foundation for everything else: ' +
      'cleaning, transforming, visualizing, and modeling data.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A **DataFrame** is not a spreadsheet and not a numpy matrix. ' +
      'It is a **dict of named Series** — each column is a one-dimensional array with a name and a shared index. ' +
      'That design gives you the best of three worlds: named access like a dict, ' +
      'positional access like an array, and vectorized math across entire columns.',
      'The **index** is the row label. By default it is 0, 1, 2, ... (like an array), ' +
      'but it can be any value — a date, a city name, a user ID. ' +
      'This is what separates a DataFrame from a raw matrix: rows have **identity**, not just position.',
      'Every column has a **dtype** — the type of all values in that column. ' +
      'Pandas uses numpy dtypes for numbers (`int64`, `float64`) and its own `object` dtype for strings. ' +
      'Knowing the dtype tells you what operations are valid. You cannot compute the mean of a string column.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Series vs DataFrame',
        body: 'A Series is a 1D labeled array: one column with an index. A DataFrame is a collection of Series sharing the same index. df["col"] returns a Series. df[["a","b"]] returns a DataFrame.',
      },
      {
        type: 'insight',
        title: 'The three lines you always run first',
        body: 'df.head() — see the first 5 rows\ndf.info() — column names, dtypes, null counts\ndf.describe() — min, max, mean, std for numeric columns\nNever skip these. They catch 80% of data quality issues before you touch the data.',
      },
      {
        type: 'sequencing',
        title: 'Build order in this chapter',
        body: '1. Create a DataFrame from a dict\n2. Explore it (head, info, describe)\n3. Access columns and rows ([], loc, iloc)\n4. Filter rows with boolean conditions\n5. Add computed columns\n6. Aggregate and group',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Tabular Data Model',
        mathBridge: 'A table with n rows and p columns stores n observations of p variables. Aggregation collapses the row dimension: mean(col) = (1/n) Σᵢ col[i]. GroupBy partitions rows into subsets then aggregates each subset independently.',
        caption: 'Work through every cell in order. Each cell introduces one new pandas concept. Challenge cells are marked — try to predict the output before running.',
        props: {
          disableRunAll: true,
          initialCells: [

            // ── CREATING A DATAFRAME ──────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Building a DataFrame from scratch',
              prose: [
                'The simplest way to create a DataFrame: pass a **dict of lists**. ' +
                'Each key becomes a column name. Each list becomes the column values. ' +
                'All lists must be the same length — every row must have a value for every column.',
                '## The connection to numpy',
                'Under the hood, each column is stored as a numpy array. ' +
                'This means you already understand the data model: ' +
                'a DataFrame is just **named numpy arrays that share a common index**.',
                '## What the index is',
                'The index (leftmost column in the display, labeled 0, 1, 2...) is the row label. ' +
                'It is generated automatically here. You will see how to set a custom index shortly.',
              ],
              code: `import pandas as pd

# A DataFrame is a dict of same-length lists
students = pd.DataFrame({
    "name":  ["Alice", "Bob", "Carol", "Dave", "Eve"],
    "score": [92, 78, 85, 63, 95],
    "grade": ["A", "C", "B", "D", "A"],
    "hours": [12.5, 8.0, 10.0, 5.5, 14.0],
})

print("Shape:", students.shape)   # (rows, cols)
print("Columns:", list(students.columns))
print()
students`,
            },

            // ── EXPLORE: HEAD / INFO / DESCRIBE ──────────────────────────────
            {
              id: 2,
              cellTitle: 'The three exploration commands',
              prose: [
                'Before doing anything with a dataset, always run these three commands. ' +
                'They reveal the structure, types, and distribution of your data.',
                '## head() — see the data',
                '`df.head(n)` shows the first n rows (default 5). It tells you: ' +
                'What do the values look like? Are strings quoted? Are numbers integers or floats?',
                '## info() — see the types',
                '`df.info()` shows column names, dtypes, and the non-null count for each column. ' +
                'The non-null count is how you detect **missing values** — if it is less than the total rows, there are NaNs.',
                '## describe() — see the distribution',
                '`df.describe()` computes count, mean, std, min, 25th/50th/75th percentile, max ' +
                'for every **numeric** column. Non-numeric columns are skipped.',
              ],
              code: `import pandas as pd

data = pd.DataFrame({
    "city":   ["London", "Paris", "Tokyo", "Berlin", None],
    "pop_m":  [9.0, 2.2, 13.9, 3.7, 4.6],
    "area_km": [1572, 105, 2194, 892, 780],
    "founded": [43, 250, 645, 1237, 993],
})

print("=== head() ===")
print(data.head())
print()
print("=== info() ===")
data.info()
print()
print("=== describe() ===")
print(data.describe())`,
            },

            // ── DTYPES ───────────────────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Data types — dtypes',
              prose: [
                '**Every column in a DataFrame has a dtype** — the type of all values in that column. ' +
                'The dtype determines what operations you can perform.',
                '## Common dtypes',
                '- `int64` — whole numbers. Supports arithmetic, comparison, aggregation.\n' +
                '- `float64` — decimal numbers. Same as int64 but allows NaN (missing value).\n' +
                '- `object` — strings (or mixed types). No arithmetic. Use `.str` accessor for string methods.\n' +
                '- `bool` — True/False. Can be summed (True = 1, False = 0).\n' +
                '- `datetime64[ns]` — timestamps. Supports date arithmetic, `.dt` accessor.',
                '## Why dtype matters',
                'You cannot compute the mean of an `object` column — ' +
                'pandas will raise a TypeError. Checking dtypes first prevents silent errors. ' +
                'When a numeric column shows as `object`, it usually means there is a stray string hiding in the data.',
              ],
              code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "name":     ["Alice", "Bob", "Carol"],
    "score":    [92, 78, 85],        # int
    "ratio":    [0.92, 0.78, 0.85],  # float
    "passed":   [True, False, True], # bool
    "label":    ["A", "C", "B"],     # object (string)
})

print("dtypes:")
print(df.dtypes)
print()
print("Mean of numeric columns:")
print(df[["score", "ratio"]].mean())
print()
# Bool columns can be summed: True=1, False=0
print("Number who passed:", df["passed"].sum())`,
            },

            // ── COLUMN ACCESS ────────────────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Accessing columns — Series operations',
              prose: [
                'A column access `df["col"]` returns a **Series** — a 1D labeled array. ' +
                'Operations on a Series are vectorized: they apply to every element at once.',
                '## Two ways to select columns',
                '- `df["col"]` — returns a **Series** (1D)\n' +
                '- `df[["col1", "col2"]]` — returns a **DataFrame** (2D, note the double brackets)',
                '## Vectorized column math',
                'Because each column is a numpy array under the hood, arithmetic is element-wise. ' +
                '`df["score"] * 1.1` multiplies every score by 1.1 in one shot — no loop. ' +
                'This is identical to numpy broadcasting.',
              ],
              code: `import pandas as pd

df = pd.DataFrame({
    "name":   ["Alice", "Bob", "Carol", "Dave"],
    "price":  [120.0, 85.0, 200.0, 45.0],
    "qty":    [3, 5, 1, 8],
})

# Single column → Series
prices = df["price"]
print("Type:", type(prices))
print(prices)
print()

# Multiple columns → DataFrame
subset = df[["name", "price"]]
print(subset)
print()

# Vectorized math on a column
print("Discounted prices (10% off):")
print(df["price"] * 0.9)`,
            },

            // ── LOC / ILOC ───────────────────────────────────────────────────
            {
              id: 5,
              cellTitle: 'Row access — loc vs iloc',
              prose: [
                'Columns are accessed with column names. Rows are accessed with **loc** (label) or **iloc** (position).',
                '## loc — label-based',
                '`df.loc[row_label]` selects by the **index label**. ' +
                'If your index is 0, 1, 2... then `df.loc[2]` gets the row with label 2. ' +
                'If your index is city names, `df.loc["Paris"]` gets the Paris row.',
                '## iloc — position-based',
                '`df.iloc[n]` selects by **integer position** — always 0-indexed, ' +
                'regardless of what the index contains. ' +
                '`df.iloc[0]` always gets the first row.',
                '## Slicing',
                'Both accept slices: `df.loc[1:3]` selects rows with labels 1, 2, 3 (inclusive). ' +
                '`df.iloc[1:3]` selects rows at positions 1 and 2 (exclusive end, like Python slices).',
              ],
              code: `import pandas as pd

# Use city names as the index
df = pd.DataFrame({
    "pop_m":    [9.0, 2.2, 13.9, 3.7],
    "area_km":  [1572, 105, 2194, 892],
    "founded":  [43, 250, 645, 1237],
}, index=["London", "Paris", "Tokyo", "Berlin"])

print("=== df.loc['Paris'] — by label ===")
print(df.loc["Paris"])
print()
print("=== df.iloc[0] — by position (first row) ===")
print(df.iloc[0])
print()
print("=== df.loc['Paris':'Tokyo'] — label slice ===")
print(df.loc["Paris":"Tokyo"])
print()
print("=== df.iloc[:2, 0] — first 2 rows, first column ===")
print(df.iloc[:2, 0])`,
            },

            // ── BOOLEAN FILTERING ────────────────────────────────────────────
            {
              id: 6,
              cellTitle: 'Boolean filtering — selecting rows by condition',
              prose: [
                'The most important pandas operation: **filter rows by a condition on a column**.',
                '## How it works',
                'A condition `df["col"] > value` produces a boolean Series — ' +
                'a True/False value for every row. ' +
                'Passing that mask back into `df[mask]` selects only the True rows. ' +
                'This is identical to numpy boolean indexing.',
                '## Combining conditions',
                'Use `&` (and) and `|` (or) to combine. ' +
                '**Always wrap each condition in parentheses** — Python\'s operator precedence ' +
                'makes `&` bind tighter than `>`, which causes silent bugs without parens.',
                '## Math connection',
                'Boolean filtering is a **set operation**: it selects the subset of rows ' +
                'satisfying a predicate. In set notation: {x ∈ rows | condition(x) = True}.',
              ],
              code: `import pandas as pd

df = pd.DataFrame({
    "name":   ["Alice","Bob","Carol","Dave","Eve","Frank"],
    "dept":   ["Eng","Mkt","Eng","Sales","Eng","Mkt"],
    "salary": [95000, 72000, 88000, 61000, 105000, 78000],
    "years":  [5, 3, 7, 2, 9, 4],
})

# Single condition
print("=== Salary > 80,000 ===")
print(df[df["salary"] > 80000])
print()

# Combined conditions
print("=== Engineering AND salary > 90,000 ===")
high_eng = df[(df["dept"] == "Eng") & (df["salary"] > 90000)]
print(high_eng)
print()

# How many rows match?
print("Count:", len(high_eng))`,
            },

            // ── COMPUTED COLUMNS ─────────────────────────────────────────────
            {
              id: 7,
              cellTitle: 'Adding computed columns',
              prose: [
                'A new column is just a vectorized expression assigned to a new key. ' +
                'No loop needed — pandas applies the operation to the entire column at once.',
                '## The pattern',
                '`df["new_col"] = df["col_a"] * df["col_b"]` creates a new column ' +
                'where each value is the product of the corresponding values in col_a and col_b. ' +
                'This is element-wise — row 0 of new_col = row 0 of col_a × row 0 of col_b.',
                '## .apply() for more complex logic',
                'When the computation cannot be expressed as simple arithmetic, ' +
                '`.apply(fn)` applies a function to each element (or each row). ' +
                'It is slower than vectorized operations but more flexible.',
              ],
              code: `import pandas as pd

df = pd.DataFrame({
    "product":  ["Widget", "Gadget", "Doohickey", "Thingamajig"],
    "price":    [29.99, 149.99, 9.99, 79.99],
    "quantity": [150, 42, 500, 88],
    "discount": [0.1, 0.05, 0.2, 0.0],  # fraction
})

# Vectorized: revenue = price * quantity
df["revenue"] = df["price"] * df["quantity"]

# Vectorized: final price after discount
df["final_price"] = df["price"] * (1 - df["discount"])

# apply: classify revenue as high or low
df["tier"] = df["revenue"].apply(
    lambda r: "high" if r > 5000 else "low"
)

print(df.to_string(index=False))`,
            },

            // ── AGGREGATION ──────────────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Aggregation — collapsing a dimension',
              prose: [
                'Aggregation reduces many values to one: mean, sum, min, max, count. ' +
                'It **collapses the row dimension** — you go from n rows to 1 number (or 1 per column).',
                '## Math definition',
                'For a column x of n values: mean(x) = (1/n) Σᵢ xᵢ. ' +
                'Standard deviation: std(x) = √((1/n) Σᵢ (xᵢ − mean(x))²). ' +
                'These are the same formulas from Phase 2 — pandas just applies them to named columns.',
                '## .agg() for multiple statistics',
                '`.agg(["mean", "std", "min", "max"])` computes all statistics in one call ' +
                'and returns a clean summary DataFrame.',
              ],
              code: `import pandas as pd

df = pd.DataFrame({
    "dept":    ["Eng","Eng","Mkt","Mkt","Sales","Sales"],
    "salary":  [95000, 88000, 72000, 78000, 61000, 67000],
    "rating":  [4.5, 4.2, 3.8, 4.0, 3.5, 3.9],
})

print("=== Single statistics ===")
print("Mean salary:  ", df["salary"].mean())
print("Max salary:   ", df["salary"].max())
print("Salary std:   ", round(df["salary"].std(), 2))
print()

print("=== agg() — multiple statistics at once ===")
print(df[["salary","rating"]].agg(["mean","std","min","max"]).round(2))`,
            },

            // ── GROUPBY ──────────────────────────────────────────────────────
            {
              id: 9,
              cellTitle: 'GroupBy — split, apply, combine',
              prose: [
                '**GroupBy** is the most powerful single operation in pandas. ' +
                'It partitions the rows into groups based on a column value, ' +
                'applies an aggregation to each group, and combines the results.',
                '## Three-step model',
                '1. **Split** — partition rows into groups (all "Eng" rows, all "Mkt" rows, ...)\n' +
                '2. **Apply** — compute an aggregate within each group (mean salary per dept)\n' +
                '3. **Combine** — assemble the per-group results into a new DataFrame',
                '## Math connection',
                'GroupBy is **partitioning**: it divides the set of rows into disjoint subsets G₁, G₂, ... ' +
                'where every row belongs to exactly one group. ' +
                'Then it applies f(Gᵢ) → scalar for each group. ' +
                'This is the foundation of the "split-apply-combine" pattern used throughout data science.',
              ],
              code: `import pandas as pd

df = pd.DataFrame({
    "dept":   ["Eng","Mkt","Eng","Sales","Mkt","Eng","Sales","Mkt"],
    "salary": [95000,72000,88000,61000,78000,105000,67000,82000],
    "rating": [4.5,3.8,4.2,3.5,4.0,4.7,3.9,3.6],
    "years":  [5,3,7,2,4,9,1,6],
})

# Mean salary and rating per department
by_dept = df.groupby("dept")[["salary","rating"]].mean().round(2)
print("=== Average per department ===")
print(by_dept)
print()

# Size of each group
print("=== Headcount per department ===")
print(df.groupby("dept").size())`,
            },

            // ── VISUALIZATION ────────────────────────────────────────────────
            {
              id: 10,
              cellTitle: 'Visualizing tabular summaries',
              prose: [
                'After aggregating, the natural display is a **bar chart** — one bar per group. ' +
                'The opencalc `fig.bars()` method takes a list of labels and a list of values.',
                '## Two-variable relationship',
                'For two numeric columns, a **scatter plot** shows the relationship between them. ' +
                'Each point is one row — its x position is one column, its y position is another. ' +
                'A visible pattern (points trending upward) suggests a positive correlation.',
                '## What you are seeing',
                'These visualizations are not decoration — they are **summaries of the data model**. ' +
                'The bar chart is the grouped mean. The scatter is the joint distribution of two columns. ' +
                'Every chart is an aggregation of the underlying table.',
              ],
              code: `import pandas as pd
from opencalc import Figure, BLUE, AMBER, GREEN

df = pd.DataFrame({
    "dept":   ["Eng","Mkt","Eng","Sales","Mkt","Eng","Sales","Mkt"],
    "salary": [95000,72000,88000,61000,78000,105000,67000,82000],
    "rating": [4.5,3.8,4.2,3.5,4.0,4.7,3.9,3.6],
})

# Bar chart — mean salary per department
by_dept = df.groupby("dept")["salary"].mean()
labels = list(by_dept.index)
values = [float(v) / 1000 for v in by_dept.values]  # convert to $k

fig = Figure(title="Mean Salary by Department ($k)", xmin=0, xmax=3, ymin=0, ymax=120)
fig.bars(labels, values, color=BLUE)
fig.show()`,
            },

            {
              id: 11,
              cellTitle: 'Scatter — two variables at once',
              prose: [
                'A scatter plot maps one column to the x-axis and another to the y-axis. ' +
                'Each row becomes a point. The shape of the point cloud reveals the relationship.',
                '## What patterns mean',
                '- Points trending upward left-to-right → **positive correlation**: as x increases, y increases\n' +
                '- Points trending downward → **negative correlation**\n' +
                '- No pattern → **no linear relationship** (but there may be a nonlinear one)\n' +
                '- A tight line → **strong** relationship; a diffuse cloud → **weak**',
                '## Connection to linear regression',
                'If the scatter shows a linear trend, you can fit a line through it — ' +
                'that is the topic of Phase 8 (Machine Learning). ' +
                'The scatter plot is the first diagnostic you always run before fitting any model.',
              ],
              code: `import pandas as pd
from opencalc import Figure, BLUE, AMBER

df = pd.DataFrame({
    "hours_studied": [5.0, 8.0, 3.0, 10.0, 6.5, 12.0, 4.0, 9.0, 7.5, 11.0],
    "score":         [63,   78,  55,   92,   71,   95,  60,  85,  79,   91],
})

xs = df["hours_studied"].tolist()
ys = df["score"].tolist()

fig = Figure(
    title="Study Hours vs Score",
    xmin=0, xmax=14, ymin=40, ymax=100
)
fig.grid().axes()
fig.scatter(xs, ys, color=BLUE, radius=6)
# Overlay a rough trend line
fig.plot(lambda x: 42 + 4.5 * x, xmin=2, xmax=13, color=AMBER, label="trend")
fig.show()`,
            },

            // ── CHALLENGE CELLS ──────────────────────────────────────────────
            {
              id: 'c1',
              type: 'challenge',
              cellTitle: 'Challenge 1 — Filter and aggregate',
              prose: 'The DataFrame below contains sales records. Write one expression to compute the **mean revenue** for rows where `region == "North"` only. Expected answer: around 4650.',
              starterCode: `import pandas as pd

df = pd.DataFrame({
    "region":  ["North","South","North","East","North","South"],
    "product": ["Widget","Gadget","Widget","Doohickey","Gadget","Widget"],
    "revenue": [4200, 8100, 5100, 3300, 4650, 7200],
})

# Your code here — one expression
# north_mean = ...
# print(north_mean)`,
              solution: `import pandas as pd

df = pd.DataFrame({
    "region":  ["North","South","North","East","North","South"],
    "product": ["Widget","Gadget","Widget","Doohickey","Gadget","Widget"],
    "revenue": [4200, 8100, 5100, 3300, 4650, 7200],
})

north_mean = df[df["region"] == "North"]["revenue"].mean()
print(f"Mean North revenue: {north_mean:.2f}")`,
            },

            {
              id: 'c2',
              type: 'challenge',
              cellTitle: 'Challenge 2 — Computed column',
              prose: 'Add a column `"bonus"` to the DataFrame that equals 10% of salary for employees with rating ≥ 4.0, and 5% for everyone else. Then print the total bonus payout.',
              starterCode: `import pandas as pd

df = pd.DataFrame({
    "name":   ["Alice","Bob","Carol","Dave","Eve"],
    "salary": [90000, 72000, 85000, 61000, 95000],
    "rating": [4.5, 3.7, 4.1, 3.2, 4.8],
})

# Your code: add df["bonus"] then print total
`,
              solution: `import pandas as pd

df = pd.DataFrame({
    "name":   ["Alice","Bob","Carol","Dave","Eve"],
    "salary": [90000, 72000, 85000, 61000, 95000],
    "rating": [4.5, 3.7, 4.1, 3.2, 4.8],
})

df["bonus"] = df.apply(
    lambda row: row["salary"] * 0.10 if row["rating"] >= 4.0 else row["salary"] * 0.05,
    axis=1
)

print(df[["name","salary","rating","bonus"]])
print()
print(f"Total bonus payout: \${df['bonus'].sum():,.2f}")`,
            },

            {
              id: 'c3',
              type: 'challenge',
              cellTitle: 'Challenge 3 — GroupBy and bar chart',
              prose: 'Group the sales data by `"category"` and compute the **total revenue per category**. Then visualize it as a bar chart with `fig.bars()`.',
              starterCode: `import pandas as pd
from opencalc import Figure, GREEN

df = pd.DataFrame({
    "category": ["Books","Electronics","Books","Clothing","Electronics","Books","Clothing"],
    "revenue":  [45, 320, 62, 89, 415, 38, 130],
})

# 1. groupby "category", sum "revenue"
# 2. create a Figure and call fig.bars(labels, values, color=GREEN)
# 3. fig.show()
`,
              solution: `import pandas as pd
from opencalc import Figure, GREEN

df = pd.DataFrame({
    "category": ["Books","Electronics","Books","Clothing","Electronics","Books","Clothing"],
    "revenue":  [45, 320, 62, 89, 415, 38, 130],
})

totals = df.groupby("category")["revenue"].sum()
labels = list(totals.index)
values = [float(v) for v in totals.values]

fig = Figure(title="Total Revenue by Category", xmin=0, xmax=3, ymin=0, ymax=500)
fig.bars(labels, values, color=GREEN)
fig.show()`,
            },

            {
              id: 'c4',
              type: 'challenge',
              cellTitle: 'Challenge 4 — loc vs iloc',
              prose: 'Create a DataFrame with country names as the index. Then:\n1. Use `loc` to get the row for `"Japan"`\n2. Use `iloc` to get the second row\n3. Use `iloc` to get the first two rows and the first column only\n\nPrint all three results.',
              starterCode: `import pandas as pd

df = pd.DataFrame({
    "gdp_trillion": [23.0, 17.7, 4.9, 4.2, 3.7],
    "population_m": [331, 1412, 126, 83, 67],
}, index=["USA", "China", "Japan", "Germany", "UK"])

# 1. loc for Japan
# 2. iloc for second row
# 3. iloc for first 2 rows, first column
`,
              solution: `import pandas as pd

df = pd.DataFrame({
    "gdp_trillion": [23.0, 17.7, 4.9, 4.2, 3.7],
    "population_m": [331, 1412, 126, 83, 67],
}, index=["USA", "China", "Japan", "Germany", "UK"])

print("1. df.loc['Japan']:")
print(df.loc["Japan"])
print()
print("2. df.iloc[1] (second row):")
print(df.iloc[1])
print()
print("3. df.iloc[:2, 0] (first 2 rows, first column):")
print(df.iloc[:2, 0])`,
            },

          ]
        }
      }
    ]
  }
}
