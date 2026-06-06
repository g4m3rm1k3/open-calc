export default {
  id: "stat2-003",
  slug: "data-frames-with-pandas",
  chapter: "stat2",
  order: 3,
  title: "Data Frames with pandas",
  subtitle: "Organizing, accessing, and filtering tabular data in Python.",
  tags: [
    "pandas",
    "DataFrame",
    "Series",
    "indexing",
    "filtering",
    "data cleaning",
    "tabular data",
  ],
  aliases:
    "pandas dataframe series iloc loc filter groupby head describe column row tabular data python",
  timeToComplete: 40,
  coreConcept:
    "A DataFrame is a 2-dimensional table of data with labeled rows and columns. In statistics, rows are observations and columns are variables. pandas is the standard Python library for working with DataFrames â€” selecting, filtering, grouping, and summarizing data before visualizing it.",
  prerequisites: ["stat2-002"],
  nextLesson: "stat2-004",

  hook: {
    question:
      "How do you analyze a table of 10,000 rows without scrolling through every row?",
    realWorldContext:
      "A data analyst receives a CSV file with 10,000 patient records: age, weight, blood pressure, medication, and outcome. She cannot look at every row. She needs to: quickly understand the structure (how many columns? what types?), find summary statistics (average blood pressure, how many patients on each medication), filter to subgroups (patients over 65, patients with high blood pressure), and detect problems (missing values, impossible values like age=-5). All of this happens before she makes a single chart or runs a single statistical test. pandas provides the tools to do all of it in a few lines of Python.",
  },

  intuition: {
    prose: [
      '**What a DataFrame is.** A DataFrame is a table: rows are observations (cases, individuals, records), columns are variables (features, attributes). Each column has a name and a data type. Each row has an index (a label or integer). pandas gives you a DataFrame with two key access patterns: `df["column_name"]` to get one column, and `df.iloc[row, col]` / `df.loc[label]` to get individual cells or slices.',
      '**Creating a DataFrame from scratch.** You can create a small DataFrame directly from a Python dictionary:\n```python\nimport pandas as pd\ndata = {"name": ["Alice","Bob","Carol"], "age": [25,32,28], "score": [88,74,91]}\ndf = pd.DataFrame(data)\n```\nEach dictionary key becomes a column name; each list becomes the column values. All lists must have the same length.',
      '**Before reading on, predict:** If `df` has 3 columns (name, age, score) and you write `df["age"]`, what do you expect to get back â€” a single value, a list, or a column object?',
      "**Inspecting a DataFrame.** Four essential inspection methods you will use every time you see new data:\n- `df.shape` â†’ (number_of_rows, number_of_columns) as a tuple\n- `df.head(n)` â†’ first n rows (default n=5). Use this to preview the data structure.\n- `df.dtypes` â†’ column names and their data types (int64, float64, object for strings, bool)\n- `df.describe()` â†’ for every numeric column: count, mean, std, min, 25th percentile, median, 75th percentile, max. This is the fastest way to get summary statistics for all variables simultaneously.",
      '**Selecting columns and rows.** `df["column"]` or `df.column` returns one column as a Series. `df[["col1","col2"]]` returns a new DataFrame with those two columns. To select rows by position: `df.iloc[0]` (first row), `df.iloc[0:5]` (first 5 rows), `df.iloc[2, 1]` (row 2, column 1 â€” zero-indexed). To select rows by label: `df.loc[label]`. To select specific rows and columns: `df.loc[rows, columns]`.',
      '**Filtering rows.** `df[df["age"] > 30]` returns all rows where the age column is greater than 30. This uses a boolean mask: `df["age"] > 30` is a Series of True/False, and `df[mask]` keeps only the True rows. Multiple conditions: `df[(df["age"] > 30) & (df["score"] >= 80)]`. Note the use of `&` (not `and`) and parentheses around each condition.',
      '**Adding and modifying columns.** `df["new_col"] = df["col1"] + df["col2"]` creates a new column as the element-wise sum. `df["letter_grade"] = df["score"].apply(lambda x: "A" if x >= 90 else "B")` creates a column by applying a function to each value in score. You can modify any existing column the same way.',
      '**Grouping and aggregation.** `df.groupby("category")["value"].mean()` splits the DataFrame by the unique values of "category", then computes the mean of "value" within each group. Replace `.mean()` with `.sum()`, `.count()`, `.median()`, `.std()`. This is the pandas equivalent of the "stratified mean" from stat1-002: `df.groupby("department")["salary"].mean()` gives the mean salary per department.',
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: First Steps with Any New Dataset",
        body: "Step 1. `df.shape` â€” How many rows and columns? Does it match what you expect?\n\nStep 2. `df.head(5)` â€” Do the first 5 rows look correct? Are column names meaningful?\n\nStep 3. `df.dtypes` â€” Are numeric columns stored as numbers (int64/float64) or accidentally as strings (object)?\n\nStep 4. `df.describe()` â€” For each numeric column: Does the min/max make sense? Is the mean plausible? Are the percentiles consistent?\n\nStep 5. `df.isnull().sum()` â€” How many missing values per column? More than 5% missing in a column warrants investigation before analysis.",
      },
      {
        type: "insight",
        title: "Series vs. DataFrame â€” The Key Distinction",
        body: 'A **Series** is a 1-dimensional labeled array. It has one index and one column of values. Think of it as a single column pulled out of a table.\n\nA **DataFrame** is a 2-dimensional labeled table. It has an index and multiple named columns. Think of it as a collection of Series that share the same index.\n\n`df["age"]` returns a **Series** (one column).\n`df[["age","score"]]` returns a **DataFrame** (two columns).\n\nThe single-bracket vs. double-bracket syntax is not a typo â€” it determines whether you get a 1D Series or a 2D DataFrame back.',
      },
      {
        type: "warning",
        title: "Common pandas Gotchas",
        body: '1. **Boolean filter: use `&` not `and`** â€” `df[(df.age > 30) & (df.score > 80)]` not `df[df.age > 30 and df.score > 80]`. The `and` keyword does not work element-wise on arrays.\n\n2. **SettingWithCopyWarning:** `df2 = df[df.age > 30]; df2["new_col"] = 5` â€” modifying a filtered copy may not update the original. Use `df.loc[df.age > 30, "new_col"] = 5` to modify in place.\n\n3. **dtypes matter:** If a numeric column is stored as "object" (string), all arithmetic operations will fail or produce wrong results. Fix: `df["age"] = df["age"].astype(float)`.\n\n4. **reset_index() after filtering:** After filtering, the row indices are still from the original DataFrame (e.g., rows 0, 3, 7, ...). Use `df_filtered.reset_index(drop=True)` to get consecutive indices starting from 0.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      '**Aggregation operations are vectorized.** In pandas, operations like `df["score"].mean()` compute the mean over all values in the column in one call â€” equivalent to $\\bar{x} = \\frac{1}{n}\\sum_{i=1}^n x_i$, where $n$ is the number of non-null values. Similarly, `df["score"].std()` computes the sample standard deviation using Bessel\'s correction (denominator $n-1$, not $n$). `df["score"].var()` computes the sample variance. These match the statistical formulas in stat3.',
      '**GroupBy as stratified summaries.** `df.groupby("group")["value"].agg(["mean","std","count"])` produces a table where each row is one group, and columns are the requested statistics. This is equivalent to computing the stratum means $\\bar{y}_h$ and variances $s_h^2$ from stat1-002, but automated across all strata simultaneously.',
    ],
  },

  rigor: {
    prose: [
      '**R1 â€” pandas vs. numpy arrays.** pandas DataFrames are built on numpy arrays. A pandas Series stores its values as a numpy array internally. The key difference: numpy arrays are pure numeric with positional indexing. pandas adds: named labels (index, column names), mixed data types across columns, and a richer set of data manipulation operations. When you call `df["score"].values`, you get back the raw numpy array â€” useful when you need to pass data to a function that expects plain arrays.',
      '**R2 â€” Chaining and mutation.** Every pandas operation that transforms data (filter, select, rename, sort) returns a new DataFrame by default â€” it does not modify the original. This is called immutable operation. If you want to chain: `df.dropna().query("age > 25").groupby("dept")["salary"].mean()` â€” each step returns a new object. To actually save the result, assign it: `result = df.dropna().query("age > 25")...`. The original `df` is unchanged unless you use `inplace=True` (available for some operations, but generally discouraged for clarity).',
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: "stat2-003-cell-1",
        type: "python",
        cellTitle: "Create and inspect a DataFrame",
        code: `import pandas as pd

# Create a small dataset
data = {
    "student": ["Alice", "Bob", "Carol", "Dave", "Eve"],
    "major":   ["Math", "CS", "Stats", "CS", "Math"],
    "gpa":     [3.7, 3.2, 3.9, 2.8, 3.5],
    "credits": [120, 95, 118, 72, 130]
}
df = pd.DataFrame(data)

print("Shape:", df.shape)
print("\\nFirst 3 rows:")
print(df.head(3))
print("\\nData types:")
print(df.dtypes)
print("\\nSummary statistics:")
print(df.describe())
`,
        instructions:
          "Notice that `df.describe()` only shows GPA and credits â€” it skips student and major because they are strings, not numbers.",
      },
      {
        id: "stat2-003-cell-2",
        type: "python",
        cellTitle: "Selecting columns and filtering rows",
        code: `import pandas as pd

data = {
    "student": ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank"],
    "major":   ["Math", "CS", "Stats", "CS", "Math", "Stats"],
    "gpa":     [3.7, 3.2, 3.9, 2.8, 3.5, 3.1],
    "credits": [120, 95, 118, 72, 130, 88]
}
df = pd.DataFrame(data)

# Select one column
print("GPA column:")
print(df["gpa"])

# Filter: GPA >= 3.5
print("\\nStudents with GPA >= 3.5:")
print(df[df["gpa"] >= 3.5])

# Multiple conditions: Math major AND GPA >= 3.5
print("\\nMath majors with GPA >= 3.5:")
print(df[(df["major"] == "Math") & (df["gpa"] >= 3.5)])
`,
        instructions:
          "Try adding a third condition: credits >= 100. Remember: wrap each condition in parentheses and use `&`.",
      },
      {
        id: "stat2-003-cell-3",
        type: "python",
        cellTitle: "GroupBy: average GPA per major",
        code: `import pandas as pd

data = {
    "student": ["Alice","Bob","Carol","Dave","Eve","Frank","Grace","Hank"],
    "major":   ["Math","CS","Stats","CS","Math","Stats","CS","Math"],
    "gpa":     [3.7, 3.2, 3.9, 2.8, 3.5, 3.1, 3.6, 3.3],
}
df = pd.DataFrame(data)

# Average GPA by major
avg_gpa = df.groupby("major")["gpa"].mean()
print("Average GPA by major:")
print(avg_gpa)

# Count students per major
print("\\nStudents per major:")
print(df.groupby("major")["gpa"].count())

# Multiple aggregations
print("\\nGPA stats by major:")
print(df.groupby("major")["gpa"].agg(["mean", "std", "count"]))
`,
        instructions:
          'What does `df.groupby("major")["gpa"].std()` give you? How would you use those values to set up a stratified sampling design?',
      },
      {
        id: 'stat2-003-py4',
        cellTitle: 'Add a column and visualize with matplotlib',
        prose: `Use df.apply() to add a derived column, then visualize the result as a bar chart with matplotlib. Run this cell, then try changing the GPA cutoff from 3.5 to 3.7.`,
        code: `import pandas as pd
import matplotlib.pyplot as plt

data = {
    "major":   ["Math","CS","Stats","CS","Math","Stats","CS","Math"],
    "gpa":     [3.7, 3.2, 3.9, 2.8, 3.5, 3.1, 3.6, 3.3],
}
df = pd.DataFrame(data)

# Add a letter grade column using apply
df["letter"] = df["gpa"].apply(lambda x: "A" if x >= 3.5 else "B")
print(df)

# Count students per letter grade
grade_counts = df["letter"].value_counts().sort_index()
labels = grade_counts.index.tolist()
counts = grade_counts.values.tolist()

print("\\nGrade counts:", dict(zip(labels, counts)))

# Visualize with matplotlib
fig, ax = plt.subplots(figsize=(6, 5))
ax.bar(labels, counts, color='steelblue', alpha=0.85, edgecolor='white')
ax.set_title('Students by Letter Grade', fontsize=13, fontweight='bold')
ax.set_xlabel('Letter Grade')
ax.set_ylabel('Count')
ax.set_ylim(0, max(counts) + 1)
plt.tight_layout()
plt.show()`,
      },
    ],
  },

  examples: [
    {
      id: "stat2-003-ex1",
      title: "Inspect and filter a dataset",
      difficulty: "easy",
      problem:
        "You receive a DataFrame `df` with columns: age (int), income (float), employed (bool). Write three lines of pandas to: (a) check the shape, (b) see the first 5 rows, (c) filter to rows where age > 40 and employed is True.",
      steps: [
        {
          expression: "\\texttt{df.shape}",
          annotation:
            "Returns (n_rows, n_cols). Check that n_rows and n_cols match the expected dataset size. If shape is (0, 3), the DataFrame was created but has no data.",
          strategyTitle: "(a) Shape",
        },
        {
          expression: "\\texttt{df.head(5)}",
          annotation:
            "Shows the first 5 rows. Verify column names, data types look correct, and values are in expected ranges.",
          strategyTitle: "(b) First 5 rows",
        },
        {
          expression:
            '\\texttt{df[(df["age"] > 40) \\& (df["employed"] == True)]}',
          annotation:
            "Two conditions joined with `&`. Each condition is in parentheses. Returns a new DataFrame with only the matching rows.",
          strategyTitle: "(c) Filter: age > 40 AND employed",
        },
      ],
    },
    {
      id: "stat2-003-ex2",
      title: "GroupBy to compute stratified statistics",
      difficulty: "medium",
      problem:
        'A dataset `df` has columns: region ("North","South","East","West") and sales (float). Write pandas code to compute: (a) mean sales per region, (b) total sales per region, (c) number of transactions per region.',
      steps: [
        {
          expression: '\\texttt{df.groupby("region")["sales"].mean()}',
          annotation:
            "Splits df by the unique values of region, then computes the mean of sales within each group. Returns a Series indexed by region name.",
          strategyTitle: "(a) Mean sales per region",
        },
        {
          expression: '\\texttt{df.groupby("region")["sales"].sum()}',
          annotation:
            "Total sales per region. `.sum()` adds all values in the group.",
          strategyTitle: "(b) Total sales per region",
        },
        {
          expression: '\\texttt{df.groupby("region")["sales"].count()}',
          annotation:
            "Number of non-null sales values per region. If any sales values are missing (NaN), `.count()` excludes them. Use `.size()` if you want total rows including NaN.",
          strategyTitle: "(c) Count per region",
        },
      ],
    },
    {
      id: "stat2-003-ex3",
      title: "Prepare data for visualization",
      difficulty: "medium",
      problem:
        "A DataFrame `df` has columns: department (string) and salary (float). Extract the GPA values as a Python list for use in `fig.histogram()`, and extract department names and mean salaries for use in `fig.bars()`.",
      steps: [
        {
          expression: '\\texttt{salary\\_list = df["salary"].tolist()}',
          annotation:
            "Convert the pandas Series to a plain Python list. fig.histogram() expects a list of numbers, not a pandas Series. `.tolist()` does the conversion.",
          strategyTitle: "Step 1: List for histogram",
        },
        {
          expression:
            '\\texttt{dept\\_means = df.groupby("department")["salary"].mean()}',
          annotation:
            "Compute mean salary per department. Returns a pandas Series indexed by department name.",
          strategyTitle: "Step 2: GroupBy means",
        },
        {
          expression:
            "\\texttt{labels = dept\\_means.index.tolist()}\\\\\\texttt{values = dept\\_means.values.tolist()}",
          annotation:
            "Extract index (department names) and values (mean salaries) as plain lists. Pass these to fig.bars().",
          strategyTitle: "Step 3: Extract for bars()",
        },
        {
          expression: "\\texttt{fig.bars(labels=labels, values=values)}",
          annotation:
            "Now labels and values are plain Python lists â€” the correct input format for fig.bars().",
          strategyTitle: "Step 4: Visualize",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat2-003-ch1",
      title: "Filter and visualize a subgroup",
      difficulty: "medium",
      problem:
        'Create a DataFrame with 10 students: names of your choice, random GPAs between 2.5 and 4.0, and major (alternating "STEM" and "Humanities"). (a) Filter to STEM students. (b) Compute mean GPA for each major. (c) Use fig.bars() to display mean GPA per major.',
      walkthrough: [
        {
          expression:
            "\\text{Create DataFrame with dict}\\rightarrow\\texttt{pd.DataFrame(data)}",
          annotation:
            "Build the dict with three keys: name (10 strings), gpa (10 floats), major (10 strings alternating STEM/Humanities).",
        },
        {
          expression: '\\texttt{stem = df[df["major"] == "STEM"]}',
          annotation:
            "Filter using a boolean mask. stem is a new DataFrame with only STEM rows.",
        },
        {
          expression: '\\texttt{means = df.groupby("major")["gpa"].mean()}',
          annotation: "Compute mean GPA for both majors simultaneously.",
        },
        {
          expression:
            "\\texttt{fig.bars(labels=means.index.tolist(), values=means.values.tolist())}",
          annotation:
            "Extract labels and values from the Series and pass to bars(). Set axes with ymin=0, ymax=4.2 (above max possible GPA of 4.0).",
        },
      ],
      answer:
        "DataFrame â†’ filter STEM â†’ groupby major and mean GPA â†’ bars() with axes ymin=0, ymax=4.2.",
    },
    {
      id: "stat2-003-ch2",
      title: "Detect a data problem using describe()",
      difficulty: "hard",
      problem:
        'You call `df.describe()` on a dataset and see that the "age" column has: count=200, mean=35.2, std=12.1, min=-3.0, 25%=27.0, 50%=34.0, 75%=43.0, max=98.0. Identify two data quality problems and write pandas code to fix each.',
      walkthrough: [
        {
          expression: "\\text{Problem 1: min age = -3.0 (impossible)}",
          annotation:
            'Negative ages are data entry errors. Identify which rows have age < 0: `df[df["age"] < 0]`. Decide: are they typos for a positive age (e.g., -3 â†’ 3)? Or are they a different encoding (e.g., -999 for missing)? If missing, set to NaN: `df.loc[df["age"] < 0, "age"] = float("nan")`.',
        },
        {
          expression:
            "\\text{Problem 2: max age = 98.0 (possibly valid but warrants check)}",
          annotation:
            'Age 98 is biologically possible. But the distribution has mean=35 and the max is 98 â€” check if it is a single extreme outlier or a cluster. `df[df["age"] > 80]` reveals all old-age records. Decide based on context whether they are valid or errors.',
        },
        {
          expression: '\\texttt{df.loc[df["age"] < 0, "age"] = float("nan")}',
          annotation:
            "Fix negative ages by setting to NaN. This marks them as missing so pandas functions like .mean() will exclude them (by default) without deleting the entire row.",
        },
        {
          expression: '\\texttt{df["age"].isnull().sum()}',
          annotation:
            "After fixing, count the resulting missing values. This confirms how many records were affected.",
        },
      ],
      answer:
        'Problem 1: min=-3.0 is impossible; replace negative ages with NaN. Problem 2: max=98 should be verified against the data source. Use `df.loc[df["age"] < 0, "age"] = float("nan")` and then check `df.isnull().sum()`.',
    },
    ,
    {
      id: "stat2-003-ch3",
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
        symbol: "\\texttt{df.shape}",
        meaning: "(n_rows, n_cols) tuple â€” check dataset dimensions first",
      },
      {
        symbol: "\\texttt{df.describe()}",
        meaning:
          "Summary statistics (count, mean, std, min, quartiles, max) for all numeric columns",
      },
      {
        symbol: '\\texttt{df["col"]}',
        meaning: "Select one column â€” returns a Series",
      },
      {
        symbol: '\\texttt{df[["col1","col2"]]}',
        meaning: "Select multiple columns â€” returns a DataFrame",
      },
      {
        symbol: "\\texttt{df[boolean\\_mask]}",
        meaning: 'Filter rows where mask is True â€” e.g., df[df["age"] > 30]',
      },
      {
        symbol: '\\texttt{df.groupby("col")["val"].mean()}',
        meaning: 'Compute mean of "val" within each unique group of "col"',
      },
      {
        symbol: "\\texttt{df.isnull().sum()}",
        meaning:
          "Count missing values per column â€” first check in any new dataset",
      },
    ],
    rulesOfThumb: [
      "Every new dataset: shape â†’ head â†’ dtypes â†’ describe â†’ isnull().sum() before any analysis.",
      "Boolean filter: use `&` for AND, `|` for OR, wrap each condition in parentheses.",
      "Convert pandas Series to list with `.tolist()` before passing to opencalc Figure methods.",
      "groupby + agg is the pandas version of stratified statistics.",
      "df.describe() on a column with min=-999 or max=9999 often reveals missing-value encodings from the data source.",
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      {
        lessonId: "stat2-004",
        label: "Bar Charts and Pie Charts",
        note: "stat2-004 uses pandas to prepare data then passes it to fig.bars() and fig.pie().",
      },
      {
        lessonId: "stat3-001",
        label: "Descriptive Statistics",
        note: "df.describe() preview the same statistics (mean, std, quartiles) derived formally in stat3.",
      },
      {
        lessonId: "stat16-001",
        label: "Data Cleansing",
        note: "stat16 builds on the isnull/fillna/astype patterns introduced here for real-world messy datasets.",
      },
    ],
  },

  definitions: [
    { term: "DataFrame", definition: "pandas' core 2D data structure: a table of rows and columns where each column is a named Series. Similar to a spreadsheet or SQL table. Created via pd.read_csv(), pd.DataFrame(dict), or other constructors. Each column can have a different dtype (int, float, str, datetime)." },
    { term: "Series", definition: "pandas' 1D labeled array. A single column (or row) of a DataFrame is a Series. Has an index (row labels) and a dtype. Created via df['column_name'] or pd.Series(list). Most numpy operations work element-wise on Series." },
    { term: ".loc and .iloc indexing", definition: ".loc[rows, cols] selects by label (row index name, column name). .iloc[rows, cols] selects by integer position (0-based). Use .loc for named access, .iloc for positional access. Both support slices and boolean arrays." },
    { term: "boolean indexing", definition: "Selecting rows that satisfy a condition: df[df['age'] > 30] returns all rows where the age column exceeds 30. The condition creates a boolean Series; only True rows are returned. Multiple conditions use & (and) and | (or) with parentheses: df[(df['age'] > 30) & (df['city'] == 'NY')]." },
    { term: "groupby", definition: "df.groupby('column').agg({'other': 'mean'}) splits the DataFrame into groups by a categorical column, applies an aggregation function to each group, and combines results. Analogous to SQL GROUP BY. Supports multiple grouping columns and multiple aggregations simultaneously." },
    { term: "tidy data", definition: "A data format where each variable is a column, each observation is a row, and each cell is a single value (Wickham 2014). Tidy data works directly with pandas, seaborn, and statsmodels. Messy formats (wide tables, multiple variables in one column) require reshaping via pd.melt() or pd.pivot_table()." },
  ],

  checkpoints: [
    {
      id: "cp-stat2-003-1",
      label: "Read: define DataFrame and Series with one example each",
      type: "read",
    },
    {
      id: "cp-stat2-003-2",
      label:
        "Lab: run cell 1 and explain why describe() skips student and major columns",
      type: "lab",
    },
    {
      id: "cp-stat2-003-3",
      label: "Lab: run cell 2 and add a third filter condition",
      type: "lab",
    },
    {
      id: "cp-stat2-003-4",
      label: "Read: explain when to use & vs. and in a pandas boolean filter",
      type: "read",
    },
    {
      id: "cp-stat2-003-5",
      label:
        "Complete example 2: write all three groupby aggregations without reading the solution first",
      type: "example",
    },
    {
      id: "cp-stat2-003-6",
      label:
        "Lab: run cell 3 and connect groupby output to stratified sampling from stat1-002",
      type: "lab",
    },
    {
      id: "cp-stat2-003-7",
      label:
        "Attempt challenge 1: filter, aggregate, and visualize from scratch",
      type: "challenge",
    },
    {
      id: "cp-stat2-003-8",
      label:
        "Read: state the two data quality problems to look for in df.describe() output",
      type: "read",
    },
  ],

  assessment: {
    questions: [
      {
        id: "stat2-003-assess-1",
        type: "choice",
        text: 'Which pandas expression returns the mean of the "salary" column for each unique value of the "department" column?',
        options: [
          'df["salary"].groupby("department").mean()',
          'df.groupby("department")["salary"].mean()',
          'df.mean(groupby="department")',
          'df.groupby("salary")["department"].mean()',
        ],
        answer: 'df.groupby("department")["salary"].mean()',
        instructions:
          "The groupby column comes first (what you are grouping by), then you select the column to aggregate.",
      },
    ],
  },

  quiz: [
    {
      id: "stat2-003-quiz-1",
      type: "choice",
      text: "What does `df.shape` return?",
      options: [
        "The column names as a list",
        "A tuple (number of rows, number of columns)",
        "The data types of each column",
        "The number of missing values",
      ],
      answer: "A tuple (number of rows, number of columns)",
      hints: [
        "shape gives the dimensions of the table.",
        "df.shape[0] is the number of rows; df.shape[1] is the number of columns.",
      ],
      reviewSection: 'Intuition â†’ "Inspecting a DataFrame" paragraph',
    },
    {
      id: "stat2-003-quiz-2",
      type: "choice",
      text: '`df["gpa"]` returns a ____, while `df[["gpa","major"]]` returns a ____.',
      options: [
        "DataFrame, Series",
        "Series, DataFrame",
        "list, dictionary",
        "array, matrix",
      ],
      answer: "Series, DataFrame",
      hints: [
        "Single bracket with one column name â†’ 1D object (Series).",
        "Double bracket with a list of names â†’ 2D object (DataFrame).",
      ],
      reviewSection: "Insight callout â€” Series vs. DataFrame",
    },
    {
      id: "stat2-003-quiz-3",
      type: "choice",
      text: "To filter rows where age > 30 AND score >= 80, the correct pandas syntax is:",
      options: [
        'df[df["age"] > 30 and df["score"] >= 80]',
        "df[df.age > 30, df.score >= 80]",
        'df[(df["age"] > 30) & (df["score"] >= 80)]',
        "df.filter(age > 30, score >= 80)",
      ],
      answer: 'df[(df["age"] > 30) & (df["score"] >= 80)]',
      hints: [
        "Use `&` for element-wise AND in pandas, not the Python keyword `and`.",
        "Each condition must be in its own parentheses.",
      ],
      reviewSection: "Warning callout â€” Common pandas Gotchas",
    },
    {
      id: "stat2-003-quiz-4",
      type: "choice",
      text: "You see `df.isnull().sum()` returns: age=0, income=45, employed=0. What does this tell you?",
      options: [
        "45 rows have income listed as zero",
        "45 values in the income column are missing (NaN)",
        "The DataFrame has 45 rows",
        "45% of income values are outliers",
      ],
      answer: "45 values in the income column are missing (NaN)",
      hints: [
        "isnull() returns True for NaN values.",
        ".sum() counts the True values â€” i.e., the number of NaN entries per column.",
      ],
      reviewSection: "Procedure callout â€” First Steps with Any New Dataset",
    },
    {
      type: 'choice',
      question: `To pass a pandas Series to plt.hist(), which of the following works?`,
      options: [
        `Pass the Series directly â€” plt.hist() accepts pandas Series natively`,
        `Must call .tolist() first; plt.hist() cannot accept Series`,
        `Must convert to a numpy array with np.array() first`,
        `Must use plt.bar() instead; plt.hist() does not accept Series`,
      ],
      answer: `Pass the Series directly â€” plt.hist() accepts pandas Series natively`,
      hints: [`matplotlib's plt.hist() can accept any array-like input including pandas Series. No explicit conversion is required.`],
      reviewSection: 'Cell 4 â€” visualizing pandas data',
    },
    {
      id: "stat2-003-quiz-6",
      type: "choice",
      text: "Which pandas method gives you summary statistics (count, mean, std, min, quartiles, max) for all numeric columns at once?",
      options: ["df.summary()", "df.info()", "df.describe()", "df.stats()"],
      answer: "df.describe()",
      hints: [
        "This is the fastest way to get distributional statistics for all numeric columns simultaneously.",
        "The output includes percentiles (25%, 50%, 75%) which correspond to quartiles.",
      ],
      reviewSection: 'Intuition â†’ "Inspecting a DataFrame" paragraph',
    },
    {
      type: 'choice',
      question: `What does \`df["gpa"].apply(lambda x: "A" if x >= 3.5 else "B")\` return?`,
      options: [
        `A scalar â€” the average GPA rounded to A or B`,
        `A new Series with "A" or "B" for each row based on the GPA value`,
        `A filtered DataFrame of rows with GPA >= 3.5`,
        `A boolean Series (True/False)`,
      ],
      answer: `A new Series with "A" or "B" for each row based on the GPA value`,
      hints: [`.apply(func) applies the function to each element in the Series and returns a new Series of the same length.`],
      reviewSection: 'Cell 4 â€” df.apply()',
    },
    {
      type: 'choice',
      question: `\`df.groupby("major")["gpa"].agg(["mean", "count"])\` returns:`,
      options: [
        `A single number â€” the overall mean GPA`,
        `A DataFrame with one row per unique major, columns mean and count`,
        `A list of (major, gpa) tuples`,
        `The same result as df.describe()`,
      ],
      answer: `A DataFrame with one row per unique major, columns mean and count`,
      hints: [`.groupby() splits the data by the specified column. .agg() applies multiple functions to each group, returning one row per group.`],
      reviewSection: 'Cell 3 â€” GroupBy',
    },
    {
      type: 'choice',
      question: `\`df["major"].value_counts()\` returns:`,
      options: [
        `The number of unique majors`,
        `A Series with one entry per unique major, showing how many times each major appears`,
        `A boolean Series indicating which rows have a non-null major`,
        `The most common major as a string`,
      ],
      answer: `A Series with one entry per unique major, showing how many times each major appears`,
      hints: [`.value_counts() counts occurrences of each unique value. Results are sorted by count descending by default.`],
      reviewSection: 'Intuition â€” groupby and value_counts',
    },
    {
      type: 'choice',
      question: `To sort a DataFrame by the "gpa" column from highest to lowest, you use:`,
      options: [
        `df.sort("gpa", order="desc")`,
        `df.sort_values("gpa", ascending=False)`,
        `df.order_by("gpa", reverse=True)`,
        `df["gpa"].sort(reverse=True)`,
      ],
      answer: `df.sort_values("gpa", ascending=False)`,
      hints: [`df.sort_values(column, ascending=False) sorts in descending order. ascending=True is the default.`],
      reviewSection: 'Intuition â€” sorting and filtering',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'df["column"] and df[["column"]] are the same thing.',
      whyStudentsThinkIt:
        "They both select a column and appear nearly identical in syntax.",
      correctionExample:
        "Type `type(df[\"gpa\"])` â†’ `<class 'pandas.core.series.Series'>`. Type `type(df[[\"gpa\"]])` â†’ `<class 'pandas.core.frame.DataFrame'>`. A Series has no column name structure; a DataFrame does. If you need to pass a column to a function that expects a DataFrame (e.g., some scikit-learn functions), you must use double brackets.",
      contrastCase:
        'Most opencalc and stats functions expect plain lists: `df["gpa"].tolist()`. If you need a DataFrame structure (e.g., for multi-column operations), use `df[["gpa","major"]]`.',
    },
    {
      falseBelief: "Filtering creates a new independent copy of the data.",
      whyStudentsThinkIt:
        'When you write `df2 = df[df["age"] > 30]`, it seems like df2 is a separate copy.',
      correctionExample:
        'In many cases, `df2` is actually a "view" into `df` (a reference, not a copy). If you then try to modify df2, pandas may issue a SettingWithCopyWarning. To get a genuine independent copy: `df2 = df[df["age"] > 30].copy()`.',
      contrastCase:
        "The `.copy()` call ensures df2 is fully independent. After `.copy()`, modifying df2 will not affect df, and no warnings will be issued.",
    },
    {
      falseBelief: "`df.describe()` shows statistics for all columns.",
      whyStudentsThinkIt:
        "Students expect to see statistics for every column in the DataFrame.",
      correctionExample:
        '`df.describe()` by default shows only numeric columns (int64, float64). String columns (object dtype) are silently excluded. To see string column statistics (unique count, top value, frequency), use `df.describe(include="object")` or `df.describe(include="all")`.',
      contrastCase:
        'If "age" is stored as a string (e.g., "25", "32") because of a data format issue, `df.describe()` will exclude it. This is why checking `df.dtypes` first is essential.',
    },
  ],

  transferPrompts: [
    {
      situation:
        "You receive a CSV file with 5,000 rows of student records: student_id, school_name (50 different schools), grade_level (9, 10, 11, 12), math_score, reading_score. Before running any analysis, you want to understand the data.",
      competingTechniques: [
        "Open the CSV in a spreadsheet and scroll through rows",
        "Use pandas: shape â†’ head â†’ dtypes â†’ describe â†’ isnull â†’ groupby school_name",
        "Jump directly to computing correlations between math_score and reading_score",
      ],
      whyThisTechniqueWins:
        "The pandas inspection pipeline is systematic and reproducible. In 5 commands you discover: the shape (5000 rows, 5 columns matches expectations?), the data types (grade_level as int or string?), the summary stats (any impossible scores like -1 or 120?), missing values (any schools with no recorded scores?), and school-level averages (are some schools systematically higher performing?). Jumping directly to correlation ignores data quality problems that would corrupt the result.",
    },
    {
      situation:
        "You want to create a bar chart showing the number of customer orders per day of the week from a DataFrame with columns: order_id, customer_id, day_of_week (Mon, Tue, ..., Sun), order_total.",
      competingTechniques: [
        "Manually count and hardcode the values",
        "Use value_counts() on the day_of_week column",
        'Use groupby("day_of_week")["order_id"].count()',
      ],
      whyThisTechniqueWins:
        'Both value_counts() and groupby().count() work here. `df["day_of_week"].value_counts()` is simpler for a frequency count. But for sorting in the correct weekday order (Monâ†’Sun rather than alphabetical), you need to convert to a Categorical type or sort manually after. `groupby()` gives more control and is more generalizable to other aggregations (e.g., total revenue per day). Convert the result to lists with `.index.tolist()` and `.values.tolist()` for `fig.bars()`.',
    },
  ],

  debugging: [
    {
      commonError:
        "ValueError: Length of values does not match length of index.",
      symptom:
        'Error when trying to assign a new column: `df["grade"] = ["A","B","C"]` on a DataFrame with 10 rows.',
      whyItHappened:
        "The list being assigned has a different length (3) than the DataFrame (10 rows). Every new column must have the same length as the DataFrame.",
      repairStrategy:
        'Apply a function to an existing column instead: `df["grade"] = df["score"].apply(lambda s: "A" if s >= 90 else "B")`. Or ensure your list has exactly `len(df)` elements.',
    },
    {
      commonError: 'KeyError: "column_name".',
      symptom:
        'Error when accessing `df["Salary"]` even though you can see a salary column in the output of `df.head()`.',
      whyItHappened:
        'Column names are case-sensitive. The column might be named "salary" (lowercase), "Salary" (title case), or "SALARY" (all caps). A leading or trailing space is another common cause: the column is named " salary" (with a space) and `df["salary"]` raises a KeyError.',
      repairStrategy:
        'Run `list(df.columns)` to see the exact column names as Python strings. Fix the name in your code, or rename: `df = df.rename(columns={" salary": "salary"})` or `df.columns = df.columns.str.strip().str.lower()` to normalize all names.',
    },
  ],

  mastery: {
    targetLevel:
      "Apply (Level 3) â€” given a DataFrame description, write correct pandas code to inspect, filter, aggregate, and prepare data for visualization.",
    solveIndependently:
      "Given a new DataFrame with specified columns and types, write the five-step inspection pipeline, a boolean filter with two conditions, a groupby aggregation, and conversion to lists for fig.bars().",
    explainVerbally:
      'Explain the difference between a pandas Series and DataFrame, and why `df["col"]` vs `df[["col"]]` returns different types.',
    detectIncorrectApplication:
      "Identify and fix: (1) using `and` instead of `&` in a boolean filter; (2) passing a pandas Series directly to fig.histogram() without converting; (3) filtering with wrong column name case.",
    transferToUnfamiliar:
      "Given a dataset description you have not seen (e.g., sales records, medical records), write the full pandas pipeline from inspection to visualization without assistance.",
  },
};
