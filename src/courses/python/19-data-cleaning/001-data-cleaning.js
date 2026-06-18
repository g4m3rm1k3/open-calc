// Chapter 3.2 — Data Cleaning
//
// PHASE 3 — DATA HANDLING (PANDAS STACK)
//
// TEACHES:
//   Math:    Missing data as undefined values in a domain;
//            imputation as estimating missing observations (median, mean, mode);
//            the effect of duplicates on aggregate statistics;
//            outlier detection via IQR (interquartile range = Q3 - Q1)
//
//   Python:  df.isnull() / df.notnull(); .sum() on boolean Series;
//            df.dropna(), df.fillna(), df.ffill(), df.bfill();
//            .astype(); df.drop_duplicates(); .str accessor methods
//            (.strip, .upper, .replace, .contains); .apply() for row-wise logic
//
//   Library: fig.bars() for before/after comparisons; fig.scatter() for
//            spotting outliers visually

export default {
  id: 'py-3-2-data-cleaning',
  slug: 'data-cleaning',
  chapter: 3.2,
  order: 1,
  title: 'Data Cleaning',
  subtitle: 'Real data is always broken — here is how to find and fix it before it corrupts your analysis',
  tags: [
    'pandas', 'missing values', 'NaN', 'dropna', 'fillna', 'imputation',
    'type conversion', 'duplicates', 'string cleaning', 'outliers', 'dtype', 'opencalc',
  ],

  hook: {
    question: 'A data scientist loads a CSV, fits a model, and gets a result. A colleague loads the same CSV and gets a different result. Neither result is right. What happened?',
    realWorldContext:
      'Studies suggest that data scientists spend 60-80% of their time cleaning data — ' +
      'not building models. ' +
      'Real-world data arrives with missing values, wrong types, duplicate rows, ' +
      'inconsistent string formatting, and hidden outliers. ' +
      'Every one of these corrupts downstream analysis silently: ' +
      'NaN propagates through arithmetic, a number stored as a string causes a TypeError, ' +
      'three duplicate rows triple-count one observation. ' +
      'Cleaning is not a chore — it is the difference between a result you can trust and one that will embarrass you.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '**Missing values (NaN)** propagate silently through arithmetic: NaN + 5 = NaN. ' +
      'A column with 10% missing values produces a mean that is subtly wrong — ' +
      'but pandas will not warn you. ' +
      'Always locate missing values before computing any statistic.',
      '**Type errors** are the most common data quality problem. ' +
      'A price column with "$" prefixes has dtype `object`, not `float64`. ' +
      'Operations like `.mean()` fail with a TypeError. ' +
      'The column looks like numbers but behaves like strings. ' +
      'Strip the formatting and convert.',
      '**Duplicates** inflate counts and distort means. ' +
      'If one city appears three times in your table, its revenue gets triple-counted ' +
      'in any aggregation. Always check `df.duplicated().sum()` before grouping.',
      '**Inconsistent strings** split groups that should be one: ' +
      '"eng", "Eng", and "ENG" become three separate groups in a groupby. ' +
      'Standardize with `.str.upper().str.strip()` before grouping.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'NaN (Not a Number)',
        body: 'IEEE 754 floating-point standard defines NaN as the result of undefined operations (0/0, inf−inf). Pandas uses NaN to represent missing values in numeric columns, and None/NaN in object columns. Key property: NaN != NaN — it is not equal to itself, which is why isnull() must be used to detect it, not == NaN.',
      },
      {
        type: 'insight',
        title: 'Missing value decision framework',
        body: '< 5% missing → drop the rows (df.dropna())\n5–30% missing → fill numeric with median, categorical with mode\n> 30% missing → drop the column or add a "was_missing" indicator\n\nAlways ask WHY it is missing — missingness is often informative.',
      },
      {
        type: 'sequencing',
        title: 'Cleaning order in this chapter',
        body: '1. Detect missing values\n2. Handle missing values (drop or fill)\n3. Fix type conversion errors\n4. Remove duplicates\n5. Standardize string formatting\n6. Detect and handle outliers',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Data Cleaning',
        mathBridge: 'Median imputation: fill missing xᵢ with median(x). IQR = Q3 − Q1; outlier if xᵢ < Q1 − 1.5·IQR or xᵢ > Q3 + 1.5·IQR. Duplicate rows scale all aggregate statistics by their multiplicity.',
        caption: 'Work through every cell in order. Each introduces one cleaning technique. Challenge cells ask you to apply multiple techniques to a realistic dirty dataset.',
        props: {
          disableRunAll: true,
          initialCells: [

            // ── DETECTING MISSING VALUES ─────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Detecting missing values',
              prose: [
                'The first step is finding out **where** data is missing and **how much**. ' +
                'You cannot fix what you have not located.',
                '## isnull() and notnull()',
                '`df.isnull()` returns a boolean DataFrame of the same shape: ' +
                'True wherever a value is NaN or None, False everywhere else. ' +
                '`.sum()` then counts the True values per column (because True = 1, False = 0).',
                '## Percentage missing',
                'The raw count is less useful than the percentage: ' +
                '`df.isnull().sum() / len(df) * 100` gives you the fraction missing per column. ' +
                'This determines your strategy: drop, fill, or discard the column.',
                '## Why NaN != NaN',
                'You cannot detect missing values with `== NaN` — by the IEEE 754 standard, ' +
                'NaN is not equal to itself. This is why `isnull()` exists. ' +
                'Try `float("nan") == float("nan")` in a cell — it returns False.',
              ],
              code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "name":   ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank"],
    "age":    [25, np.nan, 30, 22, np.nan, 35],
    "salary": [50000, 75000, np.nan, 45000, 90000, 80000],
    "dept":   ["Eng", "Mkt", None, "Sales", "Eng", None],
})

print("=== Raw null counts ===")
print(df.isnull().sum())
print()
print("=== Percentage missing ===")
pct = (df.isnull().sum() / len(df) * 100).round(1)
print(pct)
print()
# NaN is not equal to itself
nan_val = float("nan")
print(f"nan == nan: {nan_val == nan_val}")
print(f"pd.isnull(nan): {pd.isnull(nan_val)}")`,
            },

            // ── HANDLING MISSING VALUES ──────────────────────────────────────
            {
              id: 2,
              cellTitle: 'Handling missing values — drop or fill',
              prose: [
                'Three strategies for missing numeric data, each with tradeoffs:',
                '## 1. Drop rows — df.dropna()',
                '`df.dropna()` removes every row that has at least one NaN. ' +
                'Use `subset=["col"]` to only drop when a specific column is missing. ' +
                '**Tradeoff**: you lose data. Fine if < 5% is missing.',
                '## 2. Fill with a statistic — df.fillna()',
                '`df.fillna(df["col"].median())` replaces NaN with the column median. ' +
                'Median is preferred over mean when outliers may be present — ' +
                'mean shifts toward extreme values, median does not. ' +
                '**Tradeoff**: you introduce an assumption (missing values are typical).',
                '## 3. Forward fill / backward fill — ffill / bfill',
                '`df.ffill()` carries the last valid value forward. ' +
                'Useful for time series where a sensor reading does not change until the next measurement. ' +
                '**Tradeoff**: only makes sense when adjacent values are related.',
              ],
              code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "score":    [85, np.nan, 92, np.nan, 78, 88],
    "prev":     [80, 85, 90, 70, np.nan, 85],
    "category": ["A", "B", None, "A", "B", None],
})

print("=== Original ===")
print(df)
print()

# Strategy 1: drop rows with any NaN
print("=== dropna() — removes 3 rows ===")
print(df.dropna())
print()

# Strategy 2: fill numeric with median
df_filled = df.copy()
df_filled["score"] = df_filled["score"].fillna(df_filled["score"].median())
df_filled["prev"]  = df_filled["prev"].fillna(df_filled["prev"].median())
# Fill category with mode (most common value)
df_filled["category"] = df_filled["category"].fillna(df_filled["category"].mode()[0])
print("=== fillna() — impute with median/mode ===")
print(df_filled)
print()

# Strategy 3: forward fill
print("=== ffill() — carry last value forward ===")
print(df.ffill())`,
            },

            // ── TYPE CONVERSION ERRORS ───────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Type conversion — the hidden string problem',
              prose: [
                'The most common silent data quality failure: **numbers stored as strings**. ' +
                'The column looks like numbers in `.head()`, but its dtype is `object`. ' +
                'Every arithmetic operation fails or returns wrong results.',
                '## Why it happens',
                'CSV files store everything as text. If a price column contains "$1.20" or "1,200.00" ' +
                'or "N/A", pandas cannot convert it to float automatically — it stays as `object`. ' +
                'The same happens with percentage strings like "45%" or date strings like "2024-01-15".',
                '## How to fix it',
                '1. Identify the problem: `df["col"].dtype == object` for a column that should be numeric\n' +
                '2. Strip the formatting: `.str.replace("$", "", regex=False)` removes dollar signs\n' +
                '3. Convert: `.astype(float)` or `pd.to_numeric(df["col"], errors="coerce")`\n' +
                '   `errors="coerce"` converts bad values to NaN instead of raising an error — ' +
                '   safe for columns with a mix of valid numbers and garbage strings.',
              ],
              code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "product": ["Apple", "Banana", "Cherry", "Date"],
    "price":   ["$1.20", "$0.50", "$2.99", "$1.75"],   # object!
    "pct_off": ["10%", "0%", "25%", "5%"],              # object!
    "stock":   ["120", "340", "N/A", "80"],             # object, with garbage
})

print("=== Before cleaning ===")
print(df.dtypes)
print()

# Fix price: strip "$", convert to float
df["price"] = df["price"].str.replace("$", "", regex=False).astype(float)

# Fix percentage: strip "%", divide by 100
df["pct_off"] = df["pct_off"].str.replace("%", "", regex=False).astype(float) / 100

# Fix stock: "N/A" is not a number — coerce to NaN
df["stock"] = pd.to_numeric(df["stock"], errors="coerce")

print("=== After cleaning ===")
print(df.dtypes)
print()
print(df)
print()
print(f"Mean price: \${df['price'].mean():.2f}")`,
            },

            // ── DUPLICATES ───────────────────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Duplicate rows — silent statistics corruption',
              prose: [
                '**Duplicate rows silently corrupt every aggregate statistic.** ' +
                'If one customer appears three times in your sales data, ' +
                'their revenue is counted three times in every groupby, mean, and total.',
                '## Detecting duplicates',
                '`df.duplicated()` returns a boolean Series — True for each row that is a duplicate ' +
                'of an earlier row. `.sum()` counts how many duplicates exist.',
                '## Removing duplicates',
                '`df.drop_duplicates()` removes all but the first occurrence of each duplicate row. ' +
                '`subset=["col1","col2"]` makes it match on specific columns only — ' +
                'useful when you want to deduplicate by a key even if other columns differ.',
                '## The math effect',
                'If a row with value v appears k times, it contributes k·v to the sum and counts k toward n. ' +
                'The mean shifts toward duplicated rows. ' +
                'With 3 copies of one outlier, the mean is pulled 3× more strongly toward it.',
              ],
              code: `import pandas as pd

df = pd.DataFrame({
    "user_id": [1, 2, 2, 3, 4, 4, 4],
    "name":    ["Alice","Bob","Bob","Carol","Dave","Dave","Dave"],
    "revenue": [100, 250, 250, 180, 75, 75, 75],
})

print(f"Rows: {len(df)}  |  Duplicates: {df.duplicated().sum()}")
print(f"Mean revenue (with duplicates): {df['revenue'].mean():.1f}")
print()

# Remove duplicates
df_clean = df.drop_duplicates()
print(f"After dedup — Rows: {len(df_clean)}")
print(f"Mean revenue (clean): {df_clean['revenue'].mean():.1f}")
print()
print(df_clean)

# Dedup by user_id only (in case other columns differ)
df_by_key = df.drop_duplicates(subset=["user_id"])
print()
print("=== Dedup by user_id only ===")
print(df_by_key)`,
            },

            // ── STRING CLEANING ──────────────────────────────────────────────
            {
              id: 5,
              cellTitle: 'String cleaning — the .str accessor',
              prose: [
                'Text columns have a `.str` accessor that exposes string methods on every element. ' +
                'These are vectorized — no loop needed.',
                '## Why inconsistent strings break groupby',
                '"eng", "Eng", and "ENG" are three distinct values to pandas. ' +
                'A `groupby("dept")` produces three separate groups when you expected one. ' +
                'The aggregation is then split three ways, and the "Eng" group has fewer rows ' +
                'than it should — a subtle, silent error.',
                '## Essential .str methods',
                '- `.str.strip()` — remove leading/trailing whitespace\n' +
                '- `.str.upper()` / `.str.lower()` — normalize case\n' +
                '- `.str.replace(old, new)` — substitute patterns\n' +
                '- `.str.contains(pattern)` — boolean mask for filtering\n' +
                '- `.str.startswith()` / `.str.endswith()` — prefix/suffix checks',
              ],
              code: `import pandas as pd

df = pd.DataFrame({
    "dept":   [" eng", "Eng ", "ENG", " mkt", "MKT", "Mkt"],
    "salary": [80000, 90000, 85000, 65000, 70000, 68000],
})

print("=== BEFORE cleaning ===")
print(df.groupby("dept")["salary"].mean())
print(f"Groups: {df['dept'].nunique()}")
print()

# Normalize: strip whitespace, convert to uppercase
df["dept"] = df["dept"].str.strip().str.upper()

print("=== AFTER cleaning ===")
print(df.groupby("dept")["salary"].mean())
print(f"Groups: {df['dept'].nunique()}")
print()

# Filtering with .str.contains()
emails = pd.Series(["alice@company.com", "bob@gmail.com", "carol@company.com", "dave@yahoo.com"])
print("Company emails only:")
print(emails[emails.str.contains("@company")])`,
            },

            // ── OUTLIER DETECTION ────────────────────────────────────────────
            {
              id: 6,
              cellTitle: 'Outlier detection — IQR method',
              prose: [
                'An **outlier** is a value far from the bulk of the data. ' +
                'Outliers distort means and standard deviations. ' +
                'They may represent measurement errors, data entry mistakes, or genuinely extreme observations.',
                '## The IQR method',
                'The **interquartile range** is IQR = Q3 − Q1, where Q1 is the 25th percentile ' +
                'and Q3 is the 75th percentile. The IQR covers the middle 50% of the data.',
                'A value is an outlier if it is more than 1.5 × IQR below Q1 or above Q3:\n' +
                '- Lower bound: Q1 − 1.5 × IQR\n' +
                '- Upper bound: Q3 + 1.5 × IQR',
                '## Why IQR not mean ± 3σ',
                'The mean and standard deviation themselves are distorted by outliers — ' +
                'using them to detect outliers is circular. ' +
                'Q1, Q3, and IQR are **resistant statistics**: extreme values do not move them. ' +
                'This makes the IQR rule robust.',
              ],
              code: `import pandas as pd
import numpy as np

np.random.seed(42)
# Normal salary data plus some extreme values
salaries = np.concatenate([
    np.random.normal(70000, 10000, 18).tolist(),
    [200000, 5000]   # two outliers
])
df = pd.DataFrame({"salary": salaries})

# IQR outlier detection
q1  = df["salary"].quantile(0.25)
q3  = df["salary"].quantile(0.75)
iqr = q3 - q1
lo  = q1 - 1.5 * iqr
hi  = q3 + 1.5 * iqr

print(f"Q1: {q1:,.0f}  Q3: {q3:,.0f}  IQR: {iqr:,.0f}")
print(f"Bounds: [{lo:,.0f}, {hi:,.0f}]")
print()

outliers = df[(df["salary"] < lo) | (df["salary"] > hi)]
print(f"Outliers found ({len(outliers)}):")
print(outliers["salary"].round(0).to_string())
print()

df_clean = df[(df["salary"] >= lo) & (df["salary"] <= hi)]
print(f"Mean WITH outliers:    {df['salary'].mean():,.0f}")
print(f"Mean WITHOUT outliers: {df_clean['salary'].mean():,.0f}")`,
            },

            // ── VISUALIZATION: BEFORE / AFTER ────────────────────────────────
            {
              id: 7,
              cellTitle: 'Visualizing the effect of cleaning',
              prose: [
                'Bar charts make the before/after effect of cleaning concrete. ' +
                'Duplicate rows that inflate department headcounts, ' +
                'or means shifted by outliers — both are invisible in a raw table, obvious in a chart.',
                '## What you are measuring',
                'This cell simulates a common real-world scenario: ' +
                'a sales database where some orders were accidentally inserted twice. ' +
                'The bar chart shows how the duplicates inflate per-region totals, ' +
                'and how deduplication corrects them.',
              ],
              code: `import pandas as pd
from opencalc import Figure, BLUE, AMBER

# Dataset with duplicate orders
df_raw = pd.DataFrame({
    "region":  ["North","North","South","South","South","East","East"],
    "revenue": [4200,   4200,   8100,   8100,   8100,  3300,  3300],
})

# Clean: remove duplicates
df_clean = df_raw.drop_duplicates()

# Aggregate both
raw_totals   = df_raw.groupby("region")["revenue"].sum()
clean_totals = df_clean.groupby("region")["revenue"].sum()

# Same regions in same order
regions = list(raw_totals.index)
raw_vals   = [float(v) / 1000 for v in raw_totals.values]
clean_vals = [float(v) / 1000 for v in clean_totals.values]

# Before: inflated by duplicates
fig1 = Figure(title="Revenue by Region — WITH Duplicates ($k)",
              xmin=0, xmax=3, ymin=0, ymax=30)
fig1.bars(regions, raw_vals, color=AMBER)
fig1.show()`,
            },

            {
              id: 8,
              cellTitle: 'After deduplication',
              prose: [
                'Now the corrected totals — note how South drops from $24,300 (three copies) ' +
                'back to $8,100 (one copy), and the relative sizes across regions are now meaningful.',
              ],
              code: `import pandas as pd
from opencalc import Figure, BLUE

df_raw = pd.DataFrame({
    "region":  ["North","North","South","South","South","East","East"],
    "revenue": [4200,   4200,   8100,   8100,   8100,  3300,  3300],
})
df_clean = df_raw.drop_duplicates()
clean_totals = df_clean.groupby("region")["revenue"].sum()
regions    = list(clean_totals.index)
clean_vals = [float(v) / 1000 for v in clean_totals.values]

fig2 = Figure(title="Revenue by Region — AFTER Deduplication ($k)",
              xmin=0, xmax=3, ymin=0, ymax=12)
fig2.bars(regions, clean_vals, color=BLUE)
fig2.show()`,
            },

            // ── CHALLENGE CELLS ──────────────────────────────────────────────
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Locate and describe missing data',
              difficulty: 'easy',
              prompt: 'Load the DataFrame below. Print: (1) the null count per column, (2) the percentage missing per column rounded to 1 decimal place, (3) which column has the most missing values.',
              code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "user_id":  [1, 2, 3, 4, 5, 6, 7, 8],
    "age":      [25, np.nan, 30, 22, np.nan, 35, np.nan, 28],
    "income":   [50000, 75000, np.nan, 45000, 90000, 80000, 62000, np.nan],
    "city":     ["London", None, "Paris", "Berlin", None, "Tokyo", "London", None],
    "active":   [True, True, False, True, np.nan, False, True, np.nan],
})

# 1. null count per column
# 2. percentage missing per column (round to 1 dp)
# 3. which column has most missing?
`,
              hint: 'null_counts = df.isnull().sum(). Percentage = (null_counts / len(df) * 100).round(1). worst = null_counts.idxmax().',
            },

            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Fix type conversion errors',
              difficulty: 'medium',
              prompt: 'The DataFrame below has three columns with type errors: price contains dollar signs, growth_pct contains percent signs, and units contains commas. Clean all three to numeric columns. Print the dtypes and the mean of each column.',
              code: `import pandas as pd

df = pd.DataFrame({
    "product":    ["Widget", "Gadget", "Doohickey", "Thingamajig"],
    "price":      ["$29.99", "$149.99", "$9.99", "$79.99"],
    "growth_pct": ["12%", "5%", "38%", "2%"],
    "units":      ["1,200", "342", "5,800", "920"],
})

# Fix price, growth_pct, and units
# Then print dtypes and means
`,
              hint: 'Use .str.replace("$", "", regex=False).astype(float) for price. Strip "%" then divide by 100. Strip "," then astype(int) for units.',
            },

            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Full cleaning pipeline',
              difficulty: 'hard',
              prompt: 'Apply four cleaning steps in order: (1) drop the "row_id" column, (2) fill missing "age" with the column median, (3) drop rows where "salary" is NaN, (4) standardize "dept" — strip whitespace and convert to uppercase. Print the result and its shape.',
              code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "row_id": [1, 2, 3, 4, 5, 6],
    "name":   ["Alice","Bob","Carol","Dave","Eve","Frank"],
    "age":    [25, np.nan, 30, 22, np.nan, 35],
    "salary": [50000, 75000, np.nan, 45000, 90000, 80000],
    "dept":   [" eng", "MKT ", "Eng", " sales", "ENG", "mkt"],
})

df_clean = df.copy()

# Step 1: drop row_id
# Step 2: fill age with median
# Step 3: drop rows where salary is NaN
# Step 4: standardize dept

print(df_clean)
print("Shape:", df_clean.shape)
`,
              hint: 'df.drop(columns=["row_id"]) | df["age"].fillna(df["age"].median()) | df.dropna(subset=["salary"]) | df["dept"].str.strip().str.upper()',
            },

            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Detect outliers with IQR',
              difficulty: 'medium',
              prompt: 'Using the salary data below, compute Q1, Q3, and IQR. Then: (1) print the lower and upper bounds, (2) print all outlier rows, (3) print the mean salary with and without outliers. Expect 2 outliers.',
              code: `import pandas as pd
import numpy as np

np.random.seed(7)
salaries = np.concatenate([
    np.random.normal(65000, 8000, 16).tolist(),
    [180000, 3000]   # two deliberate outliers
])
df = pd.DataFrame({"salary": salaries})

# Compute Q1, Q3, IQR, bounds
# Print outlier rows
# Print mean with and without outliers
`,
              hint: 'q1 = df["salary"].quantile(0.25). iqr = q3 - q1. bounds: q1 - 1.5*iqr and q3 + 1.5*iqr. mask = (df["salary"] < lo) | (df["salary"] > hi).',
            },

          ]
        }
      }
    ]
  }
}
