# Lesson 47: Capstone — A Complete Python Data Science Tool

**What you will build:** A complete, working data science pipeline as a multi-file project. You will load a real CSV dataset (Titanic survival data), clean it, engineer features, train and compare three models, select the best with cross-validation, and output a report. The transferable problem this lesson is actually about is consolidation: showing how everything from the previous 46 lessons—syntax, data structures, exceptions, OOP, algorithms, and probability—works together in one real, non-trivial program.

**What you need to know first:** Lessons 0–46, which cover the Python fundamentals that pandas and scikit-learn are built upon.

**Terms used in this lesson:**
- **DataFrame** — A 2D table with labeled rows and columns. It exists to provide a structured way to store and manipulate tabular data, removing the boilerplate of managing lists of dictionaries manually.
- **Series** — A 1D array with labeled indices, effectively representing a single column of a DataFrame. It exists to enable vectorized operations on a single feature without explicit loops.
- **Data imputation** — The process of replacing missing data with substituted values. It exists because machine learning algorithms typically require complete datasets and will fail if they encounter null values.
- **Feature engineering** — The process of using domain knowledge to create new features (columns) from raw data. It exists to highlight underlying patterns that might make predictive models more accurate.
- **Boolean filtering** — The process of selecting subsets of data by evaluating a true/false condition across an entire structure. It exists to efficiently extract rows matching specific criteria without writing explicit loops.
- **Cross-validation** — A resampling procedure used to evaluate machine learning models on a limited data sample. It exists to ensure that a model's performance metrics are robust and not overly dependent on a single random split of the training data.
- **Model evaluation** — The process of quantifying how well a trained model generalizes to unseen data. It exists to prevent overfitting and to choose the most capable algorithm for the task.

**Objects and methods used:**

- **`pd.DataFrame`**
  - *What it is:* The primary data structure of pandas, representing a two-dimensional tabular data structure.
  - *Implementation:* `class pandas.DataFrame(data=None, columns=None)`
  - *Its use:* We use it to hold and manipulate our dataset in memory.
  - *Type:* Class.
  - *Responsibility:* Manages tabular data, aligning rows and columns, and providing methods for computation.
  - *Depends on:* Data to populate it (e.g., a dictionary).
  - *Connects to:* Called by the script to instantiate the dataset; internally wraps NumPy arrays.
  - *Shape:* A core abstraction layer between the raw data and our logic.

- **`pd.read_csv`**
  - *What it is:* A function that reads a comma-separated values (CSV) file into a DataFrame.
  - *Implementation:* `def read_csv(filepath_or_buffer)`
  - *Its use:* We use it to load the raw Titanic data string into our initial DataFrame.
  - *Type:* Standalone module function.
  - *Responsibility:* Parses text data in CSV format and constructs a `DataFrame`.
  - *Depends on:* A file path or file-like buffer containing CSV-formatted text.
  - *Connects to:* Called by our script; talks to the pandas parsing engine.
  - *Shape:* The ingestion boundary between raw external data and our internal representation.

- **`io.StringIO`**
  - *What it is:* An in-memory stream for text I/O.
  - *Implementation:* `class io.StringIO(initial_value='')`
  - *Its use:* We use it to treat a multiline Python string exactly as if it were an open text file on disk.
  - *Type:* Class.
  - *Responsibility:* Implements the file object interface (read, write) over an in-memory string buffer.
  - *Depends on:* An initial string value to hold.
  - *Connects to:* Passed into `pd.read_csv`, which expects a file-like object.
  - *Shape:* An adapter bridging raw string data to an I/O-expecting consumer.

- **`train_test_split`**
  - *What it is:* A scikit-learn utility function that splits arrays into random train and test subsets.
  - *Implementation:* `def train_test_split(*arrays, test_size, random_state, stratify)`
  - *Its use:* We use it to hold out a portion of our data to evaluate our models on unseen examples.
  - *Type:* Standalone function.
  - *Responsibility:* Randomly partitions data while optionally preserving class proportions.
  - *Depends on:* Input feature array `X` and target array `y`.
  - *Connects to:* Called by our script; outputs training and testing arrays.
  - *Shape:* The separation boundary between the learning phase and the evaluation phase.

- **`StandardScaler`**
  - *What it is:* A scikit-learn preprocessing class that standardizes features.
  - *Implementation:* `class sklearn.preprocessing.StandardScaler()`
  - *Its use:* We use it to ensure all numerical features have a similar scale.
  - *Type:* Class.
  - *Responsibility:* Computes the mean and standard deviation of a dataset and scales data to unit variance.
  - *Depends on:* The training data to compute the statistics.
  - *Connects to:* Fits to `X_train`, transforms both `X_train` and `X_test`.
  - *Shape:* A transformation layer applied before model training.

- **`LogisticRegression`**
  - *What it is:* A scikit-learn estimator class implementing logistic regression.
  - *Implementation:* `class sklearn.linear_model.LogisticRegression(max_iter, random_state)`
  - *Its use:* We use it as one of our predictive models.
  - *Type:* Class.
  - *Responsibility:* Learns a linear decision boundary mapped through a sigmoid function to predict probabilities.
  - *Depends on:* Scaled training features and corresponding target labels.
  - *Connects to:* Provides `fit` and `predict` methods.
  - *Shape:* The core predictive engine of our pipeline.

- **`DecisionTreeClassifier`**
  - *What it is:* A scikit-learn estimator class implementing a decision tree.
  - *Implementation:* `class sklearn.tree.DecisionTreeClassifier(max_depth, random_state)`
  - *Its use:* We use it as an alternative non-linear predictive model.
  - *Type:* Class.
  - *Responsibility:* Recursively splits the data based on feature thresholds to maximize information gain.
  - *Depends on:* Training features and target labels.
  - *Connects to:* Provides `fit` and `predict` methods.
  - *Shape:* A predictive engine in our evaluation suite.

- **`KNeighborsClassifier`**
  - *What it is:* A scikit-learn estimator class implementing k-nearest neighbors voting.
  - *Implementation:* `class sklearn.neighbors.KNeighborsClassifier(n_neighbors)`
  - *Its use:* We use it as a distance-based predictive model.
  - *Type:* Class.
  - *Responsibility:* Stores the training data and classifies new points based on the majority class of their nearest neighbors.
  - *Depends on:* Scaled training features and labels.
  - *Connects to:* Provides `fit` and `predict` methods.
  - *Shape:* A predictive engine in our evaluation suite.

- **`StratifiedKFold`**
  - *What it is:* A cross-validation splitter.
  - *Implementation:* `class sklearn.model_selection.StratifiedKFold(n_splits, shuffle, random_state)`
  - *Its use:* We use it to define how our data is split into folds during cross-validation.
  - *Type:* Class.
  - *Responsibility:* Generates indices to split data into train/test sets, ensuring each fold retains the overall class distribution.
  - *Depends on:* The number of splits requested.
  - *Connects to:* Passed into `cross_val_score`.
  - *Shape:* A sampling strategy configuration object.

- **`cross_val_score`**
  - *What it is:* A function to evaluate a score by cross-validation.
  - *Implementation:* `def cross_val_score(estimator, X, y, cv, scoring)`
  - *Its use:* We use it to get a robust estimate of each model's performance.
  - *Type:* Standalone function.
  - *Responsibility:* Automates the process of fitting and scoring a model across multiple data splits.
  - *Depends on:* A model, data, a splitting strategy (`cv`), and a metric (`scoring`).
  - *Connects to:* Calls `fit` and `predict` on clones of the model under the hood.
  - *Shape:* An orchestrator for the evaluation phase.

- **`accuracy_score`**
  - *What it is:* A metric function.
  - *Implementation:* `def accuracy_score(y_true, y_pred)`
  - *Its use:* We use it to calculate the overall percentage of correct predictions.
  - *Type:* Standalone function.
  - *Responsibility:* Computes the subset accuracy, the fraction of correctly classified samples.
  - *Depends on:* True labels and predicted labels.
  - *Connects to:* Takes arrays from our test set and model output.
  - *Shape:* A final measurement utility.

- **`f1_score`**
  - *What it is:* A metric function.
  - *Implementation:* `def f1_score(y_true, y_pred)`
  - *Its use:* We use it to calculate the harmonic mean of precision and recall.
  - *Type:* Standalone function.
  - *Responsibility:* Computes a balanced metric that penalizes extreme disparities between false positives and false negatives.
  - *Depends on:* True labels and predicted labels.
  - *Connects to:* Takes arrays from our test set and model output.
  - *Shape:* A final measurement utility.

- **`classification_report`**
  - *What it is:* A reporting function.
  - *Implementation:* `def classification_report(y_true, y_pred, target_names)`
  - *Its use:* We use it to generate a comprehensive text summary of model metrics.
  - *Type:* Standalone function.
  - *Responsibility:* Compiles precision, recall, f1-score, and support for each class into a formatted string.
  - *Depends on:* True labels and predicted labels.
  - *Connects to:* Outputs a string that we print to the terminal.
  - *Shape:* A reporting formatter.

- **`confusion_matrix`**
  - *What it is:* A metric function.
  - *Implementation:* `def confusion_matrix(y_true, y_pred)`
  - *Its use:* We use it to see exactly where our model makes errors (false positives vs false negatives).
  - *Type:* Standalone function.
  - *Responsibility:* Computes a matrix $C$ such that $C_{i, j}$ is the number of observations known to be in group $i$ and predicted to be in group $j$.
  - *Depends on:* True labels and predicted labels.
  - *Connects to:* Outputs a NumPy array that we print.
  - *Shape:* A diagnostic reporting tool.

**Everything else in the file, not this lesson's subject but still explained:**

- **`df.dtypes`**
  - *What it is:* An attribute returning the data types of each column.
  - *Implementation:* `property DataFrame.dtypes`
  - *Its use:* To inspect how pandas inferred the data.
  - *Type:* Property.
  - *Responsibility:* Exposes the underlying NumPy `dtype` of each Series in the DataFrame.
  - *Depends on:* The DataFrame's internal state.
  - *Connects to:* Read by our script.
  - *Shape:* An introspection property.

- **`df.describe()`**
  - *What it is:* A method returning summary statistics.
  - *Implementation:* `def describe()`
  - *Its use:* To get a quick overview of numerical column distributions.
  - *Type:* Method.
  - *Responsibility:* Computes count, mean, std, min, percentiles, and max for numeric columns.
  - *Depends on:* The DataFrame's data.
  - *Connects to:* Called on the DataFrame, returns a new DataFrame.
  - *Shape:* An exploratory data analysis tool.

- **`df.mean()`**
  - *What it is:* A method returning the mean of the values.
  - *Implementation:* `def mean()`
  - *Its use:* To compute the average of a single column (Series).
  - *Type:* Method.
  - *Responsibility:* Calculates the arithmetic mean across an axis.
  - *Depends on:* Numeric data in the Series/DataFrame.
  - *Connects to:* Called on a Series.
  - *Shape:* A statistical aggregation tool.

- **`df.shape`**
  - *What it is:* An attribute returning a tuple of the DataFrame's dimensions.
  - *Implementation:* `property DataFrame.shape`
  - *Its use:* To verify the number of rows and columns loaded.
  - *Type:* Property.
  - *Responsibility:* Exposes the shape of the underlying 2D array.
  - *Depends on:* The DataFrame's data structure.
  - *Connects to:* Read by our script.
  - *Shape:* An introspection property.

- **`df.head()`**
  - *What it is:* A method returning the first `n` rows.
  - *Implementation:* `def head(n=5)`
  - *Its use:* To preview the actual data without flooding the console.
  - *Type:* Method.
  - *Responsibility:* Slices the top `n` rows and returns them as a new DataFrame.
  - *Depends on:* The DataFrame's data.
  - *Connects to:* Called on the DataFrame.
  - *Shape:* An exploratory visualization tool.

- **`df.info()`**
  - *What it is:* A method printing a concise summary of the DataFrame.
  - *Implementation:* `def info()`
  - *Its use:* To check column names, non-null counts, and memory usage.
  - *Type:* Method.
  - *Responsibility:* Gathers metadata about the DataFrame and prints it.
  - *Depends on:* The DataFrame's metadata.
  - *Connects to:* Prints directly to standard output.
  - *Shape:* An exploratory reporting tool.

- **`df.isnull()`**
  - *What it is:* A method returning a boolean same-sized object indicating if values are NA.
  - *Implementation:* `def isnull()`
  - *Its use:* Combined with `.sum()` to count missing values per column.
  - *Type:* Method.
  - *Responsibility:* Maps every value in the DataFrame to True if it is missing/NaN, False otherwise.
  - *Depends on:* The DataFrame's data.
  - *Connects to:* Called on the DataFrame, typically chained with `.sum()`.
  - *Shape:* A data quality inspection tool.

- **`df.sum()`**
  - *What it is:* A method returning the sum of values for the requested axis.
  - *Implementation:* `def sum()`
  - *Its use:* To aggregate the boolean True values (which evaluate to 1) from `isnull()`.
  - *Type:* Method.
  - *Responsibility:* Sums up values across columns or rows.
  - *Depends on:* The DataFrame/Series data.
  - *Connects to:* Chained after `isnull()`.
  - *Shape:* An aggregation tool.

- **`df.copy()`**
  - *What it is:* A method returning a copy of the object's indices and data.
  - *Implementation:* `def copy(deep=True)`
  - *Its use:* To ensure our cleaning function doesn't mutate the original raw dataset.
  - *Type:* Method.
  - *Responsibility:* Allocates new memory and duplicates the object's contents.
  - *Depends on:* The source DataFrame.
  - *Connects to:* Returns a new DataFrame instance.
  - *Shape:* A defensive programming tool.

- **`df.drop()`**
  - *What it is:* A method returning a DataFrame with specified labels removed.
  - *Implementation:* `def drop(columns)`
  - *Its use:* To discard columns that are not useful for machine learning.
  - *Type:* Method.
  - *Responsibility:* Filters out the specified columns and returns the remaining data.
  - *Depends on:* A list of column names to remove.
  - *Connects to:* Called on the DataFrame.
  - *Shape:* A data filtering tool.

- **`df.fillna()`**
  - *What it is:* A method replacing NA/NaN values using the specified method.
  - *Implementation:* `def fillna(value)`
  - *Its use:* To impute missing ages with the median age.
  - *Type:* Method.
  - *Responsibility:* Finds all missing values and overwrites them with a constant or derived value.
  - *Depends on:* The value to substitute (e.g., the calculated median).
  - *Connects to:* Called on a Series (the 'Age' column).
  - *Shape:* A data imputation tool.

- **`df.median()`**
  - *What it is:* A method returning the median of the values.
  - *Implementation:* `def median()`
  - *Its use:* To find the 50th percentile of the ages for imputation.
  - *Type:* Method.
  - *Responsibility:* Sorts the data and finds the middle value, ignoring NaNs.
  - *Depends on:* Numeric data in the Series.
  - *Connects to:* Provides the value passed into `fillna()`.
  - *Shape:* A statistical measurement tool.

- **`astype()`**
  - *What it is:* A method casting a pandas object to a specified dtype.
  - *Implementation:* `def astype(dtype)`
  - *Its use:* To convert boolean values (True/False) into integers (1/0) for machine learning.
  - *Type:* Method.
  - *Responsibility:* Reinterprets and converts the underlying memory buffer to a new data type.
  - *Depends on:* The target data type (`int`).
  - *Connects to:* Called on a boolean Series.
  - *Shape:* A data formatting tool.

- **`StandardScaler.fit_transform()`**
  - *What it is:* A method that fits the scaler to the data and then transforms it.
  - *Implementation:* `def fit_transform(X)`
  - *Its use:* To compute the training set statistics and scale the training set in one step.
  - *Type:* Method.
  - *Responsibility:* Calculates mean and standard deviation from `X`, then applies the scaling to `X`.
  - *Depends on:* The training feature matrix `X_train`.
  - *Connects to:* Returns a scaled NumPy array.
  - *Shape:* The primary training preprocessing entrypoint.

- **`StandardScaler.transform()`**
  - *What it is:* A method that transforms data using the already-fitted scaler.
  - *Implementation:* `def transform(X)`
  - *Its use:* To scale the test set using the exact same statistics calculated from the training set.
  - *Type:* Method.
  - *Responsibility:* Applies the pre-calculated scaling formula to new data without recalculating the mean/std.
  - *Depends on:* The test feature matrix `X_test` and prior state from `fit_transform`.
  - *Connects to:* Returns a scaled NumPy array.
  - *Shape:* The evaluation preprocessing entrypoint.

- **`LogisticRegression.fit()`**
  - *What it is:* A method that trains the model according to the given training data.
  - *Implementation:* `def fit(X, y)`
  - *Its use:* To let the logistic regression algorithm learn the patterns in the training data.
  - *Type:* Method.
  - *Responsibility:* Executes the optimization algorithm to find the best internal parameters (coefficients).
  - *Depends on:* Features `X` and labels `y`.
  - *Connects to:* Updates internal model state in place.
  - *Shape:* The learning step of the pipeline.

- **`LogisticRegression.predict()`**
  - *What it is:* A method that predicts class labels for samples in X.
  - *Implementation:* `def predict(X)`
  - *Its use:* To generate survival predictions for our test set.
  - *Type:* Method.
  - *Responsibility:* Applies the learned mathematical function to new features and outputs a discrete class prediction.
  - *Depends on:* Features `X` and a previously trained internal state.
  - *Connects to:* Returns an array of predicted labels `y_pred`.
  - *Shape:* The inference step of the pipeline.

---

## Concept Unit: Pandas introduction — why now, what it is

### The Problem

We need to analyze and manipulate large amounts of tabular data. In previous lessons, we used lists of dictionaries or lists of lists to represent tables. This required writing manual `for` loops for every operation: finding the average, filtering rows, or extracting a single column. It was verbose and slow. We need a way to treat an entire column of data as a single mathematical object, allowing us to perform operations on thousands of rows instantly without writing a single loop.

What would you try here first? Given what standard Python lists already do, how would you write a function to return only the rows of a table where a person's age is greater than 30? Notice how much boilerplate code that requires. What if the language provided a structure that let you express that filtering logic in one line?

### Introduce the concept in isolation

This isolated throwaway script demonstrates pandas `DataFrame` and `Series` abstractions, which solve this problem by wrapping highly optimized C arrays (via NumPy) in a user-friendly tabular API.

```python
import pandas as pd

# A DataFrame is a table:
df = pd.DataFrame({
    'name':  ['Alice', 'Bob', 'Carol'],
    'age':   [25, 30, 35],
    'score': [88.5, 72.0, 95.5]
})
print("--- DataFrame ---")
print(df)

print("\n--- Data Types ---")
print(df.dtypes)

print("\n--- Summary Statistics ---")
print(df.describe())

print("\n--- Series Arithmetic ---")
print("Mean age:", df['age'].mean())

print("\n--- Boolean Filtering ---")
print(df[df['score'] > 80])
```

**Predicted Output (Exempt from run due to complete structural predictability):**
```
--- DataFrame ---
    name  age  score
0  Alice   25   88.5
1    Bob   30   72.0
2  Carol   35   95.5

--- Data Types ---
name      object
age        int64
score    float64
dtype: object

--- Summary Statistics ---
        age      score
count   3.0   3.000000
mean   30.0  85.333333
std     5.0  12.065792
min    25.0  72.000000
25%    27.5  80.250000
50%    30.0  88.500000
75%    32.5  92.000000
max    35.0  95.500000

--- Series Arithmetic ---
Mean age: 30.0

--- Boolean Filtering ---
    name  age  score
0  Alice   25   88.5
2  Carol   35   95.5
```

This output proves that pandas automatically aligns data into a readable table with an implicit index (`0, 1, 2`), infers types (`int64`, `float64`), calculates descriptive statistics across the entire structure at once, and allows us to filter the table by passing a boolean condition directly into the bracket notation. This is called a **DataFrame**, composed of individual column **Series**.

### Discard the throwaway example

This throwaway script is deleted. It will not appear in the project again. We will now apply pandas to our real problem: the Titanic dataset.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our final pipeline file.
- **Files affected:** `main.py` (created)
- **Change type:** add
- **Location:** At the top of the new file.
- **Dependencies:** Requires the pandas library (`pip install pandas`).

### The New Code

```python
import pandas as pd
import io

CSV_DATA = """
PassengerId,Survived,Pclass,Name,Sex,Age,SibSp,Parch,Fare
1,0,3,Braund Mr. Owen Harris,male,22,1,0,7.25
2,1,1,Cumings Mrs. John Bradley,female,38,1,0,71.2833
3,1,3,Heikkinen Miss. Laina,female,26,0,0,7.925
4,1,1,Futrelle Mrs. Jacques Heath,female,35,1,0,53.1
5,0,3,Allen Mr. William Henry,male,35,0,0,8.05
6,0,3,Moran Mr. James,male,,0,0,8.4583
7,0,1,McCarthy Mr. Timothy J,male,54,0,0,51.8625
8,0,3,Palsson Master. Gosta Leonard,male,2,3,1,21.075
9,1,3,Johnson Mrs. Oscar W,female,27,0,2,11.1333
10,1,2,Nasser Mrs. Nicholas,female,14,1,0,30.0708
11,1,3,Sandstrom Miss. Marguerite Rut,female,4,1,1,16.7
12,1,1,Bonnell Miss. Elizabeth,female,58,0,0,26.55
13,0,3,Saundercock Mr. William Henry,male,20,0,0,8.05
14,0,3,Andersson Mr. Anders Johan,male,39,1,5,31.275
15,0,3,Vestrom Miss. Hulda Amanda Adolfina,female,14,0,0,7.8542
16,1,2,Hewlett Mrs. Mary D Kingcome,female,55,0,0,16.0
17,0,3,Rice Master. Eugene,male,2,4,1,29.125
18,1,2,Williams Mr. Charles Eugene,male,,0,0,13.0
19,0,3,Vander Planke Mrs. Julius,female,31,1,0,18.0
20,1,3,Masselmani Mrs. Fatima,female,,0,0,7.225
"""
```

### The Updated Project

```python
# 1: import pandas as pd
# 2: import io
# 3: 
# 4: CSV_DATA = """
# 5: PassengerId,Survived,Pclass,Name,Sex,Age,SibSp,Parch,Fare
# 6: 1,0,3,Braund Mr. Owen Harris,male,22,1,0,7.25
# 7: ... (data truncated for brevity, but includes the 20 lines shown above)
# 8: """
```
This block imports the necessary libraries and defines our raw, inline dataset as a multiline string.

### Mechanical walkthrough

- `import pandas as pd` imports the pandas library and binds it to the standard alias `pd`.
- `import io` imports Python's standard input/output library, providing tools for manipulating streams.
- `CSV_DATA = """..."""` defines a multiline string literal containing our raw comma-separated data. Each line represents one passenger, and the first line contains the header names.

---

## Concept Unit: Loading and exploring the Titanic dataset

### The Problem

We have our raw data stored as a string literal in memory, but our machine learning algorithms require structured numerical arrays. We need to parse the CSV string, convert it into a table, and inspect it to understand its shape and identify any issues, such as missing values, before we attempt to learn from it.

What happens if we just pass a string directly to a file-reading function? It expects a file path or a stream object, not the literal text itself. What would you use to bridge that gap?

### Introduce the concept in isolation

This throwaway script demonstrates how `io.StringIO` adapts a string to be treated as a file, and how `pd.read_csv` consumes it.

```python
import pandas as pd
import io

mini_csv = "id,value\n1,10\n2,20\n3,"
buffer = io.StringIO(mini_csv)
df_mini = pd.read_csv(buffer)
print(df_mini.isnull().sum())
```

**Predicted Output (Exempt from run due to strict predictability):**
```
id       0
value    1
dtype: int64
```

This output proves that `io.StringIO` successfully presents the string as a readable file, allowing `pd.read_csv` to parse the rows. It also proves that `isnull().sum()` correctly identifies that the `value` column has one missing entry (the blank space after the final comma).

### Discard the throwaway example

This throwaway script is deleted. It will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Below the `CSV_DATA` string definition.
- **Dependencies:** None.

### The New Code

```python
df = pd.read_csv(io.StringIO(CSV_DATA.strip()))
print("Shape:", df.shape)
print("\nFirst 3 rows:\n", df.head(3))
print("\nInfo:")
df.info()
print("\nNull counts:\n", df.isnull().sum())
```

### The Updated Project

```python
# 21: """
# 22: df = pd.read_csv(io.StringIO(CSV_DATA.strip())) # ← new
# 23: print("Shape:", df.shape) # ← new
# 24: print("\nFirst 3 rows:\n", df.head(3)) # ← new
# 25: print("\nInfo:") # ← new
# 26: df.info() # ← new
# 27: print("\nNull counts:\n", df.isnull().sum()) # ← new
```
This block parses the raw string into a DataFrame and immediately runs a series of diagnostic checks to understand the dataset's footprint, structure, and completeness.

### Mechanical walkthrough

- `CSV_DATA.strip()` calls the standard string method `strip()` to remove leading/trailing whitespace (like empty newlines) from the raw data.
- `io.StringIO(...)` creates an in-memory text stream from the cleaned string, exposing it through a file-like API.
- `pd.read_csv(...)` consumes the text stream, parses the comma-separated values, infers the data types, and returns a fully formed DataFrame.
- `df.shape` accesses the shape property, returning a tuple of `(rows, columns)`—which is `(20, 9)` for our subset.
- `df.head(3)` calls the `head` method, slicing and returning only the first 3 rows for a quick preview.
- `df.info()` calls the `info` method, printing a report of the columns, their inferred data types (e.g., `int64`, `object` for strings, `float64`), and the count of non-null values in each.
- `df.isnull()` maps every cell in the DataFrame to `True` if it is missing (`NaN`) and `False` otherwise.
- `.sum()` is chained onto the result of `isnull()`. Since `True` evaluates to 1 and `False` to 0, summing down the columns provides the exact count of missing values per column. In our data, the `Age` column has missing values that we must address.

---

## Concept Unit: Data cleaning and feature engineering

### The Problem

Our dataset contains raw, unpolished information. It has columns that are irrelevant to survival prediction (like PassengerId and Name). It has missing values in the Age column, which will crash our machine learning models. Furthermore, algorithms mathematically require numerical inputs, but our 'Sex' column is currently stored as text ('male', 'female'). Finally, domain knowledge suggests that a passenger's family size on board might be highly predictive, but that information is split across two columns (`SibSp` for siblings/spouses and `Parch` for parents/children).

What would you try here first? How would you handle a missing age without discarding the entire row? What arithmetic operation would combine family columns into one?

### Introduce the concept in isolation

This throwaway script demonstrates the mechanics of data manipulation on a DataFrame: dropping, filling, and mapping columns.

```python
import pandas as pd

temp_df = pd.DataFrame({
    'drop_me': [1, 2],
    'text_col': ['A', 'B'],
    'missing': [10.0, None]
})
temp_df = temp_df.drop(columns=['drop_me'])
temp_df['text_col'] = (temp_df['text_col'] == 'A').astype(int)
temp_df['missing'] = temp_df['missing'].fillna(temp_df['missing'].median())
print(temp_df)
```

**Predicted Output (Exempt from run due to structural predictability):**
```
   text_col  missing
0         1     10.0
1         0     10.0
```

This output proves that `drop()` successfully removed the `drop_me` column, that boolean comparison chained with `.astype(int)` successfully converted text categories into binary `1` and `0`, and that `fillna()` populated the `None` with the median of the existing values (which is 10.0). These are the core tools of **data imputation** and cleaning.

### Discard the throwaway example

This throwaway script is deleted. It will not appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Below the exploration prints.
- **Dependencies:** Requires `numpy` (though we use pandas directly here).

### The New Code

```python
def clean_titanic(df):
    df = df.copy()

    # 1. Drop irrelevant columns:
    df = df.drop(columns=['PassengerId', 'Name'])

    # 2. Impute missing Age with median:
    df['Age'] = df['Age'].fillna(df['Age'].median())

    # 3. Encode Sex as binary:
    df['Sex'] = (df['Sex'] == 'female').astype(int)  # 1=female, 0=male

    # 4. Feature engineering: family size
    df['FamilySize'] = df['SibSp'] + df['Parch'] + 1

    # 5. Feature engineering: is alone
    df['IsAlone'] = (df['FamilySize'] == 1).astype(int)

    return df

df_clean = clean_titanic(df)
print("\nCleaned Head:\n", df_clean.head())
print("\nCleaned nulls:\n", df_clean.isnull().sum())
```

### The Updated Project

```python
# 27: print("\nNull counts:\n", df.isnull().sum())
# 28: 
# 29: def clean_titanic(df): # ← new
# 30:     df = df.copy() # ← new
# 31:     df = df.drop(columns=['PassengerId', 'Name']) # ← new
# 32:     df['Age'] = df['Age'].fillna(df['Age'].median()) # ← new
# 33:     df['Sex'] = (df['Sex'] == 'female').astype(int) # ← new
# 34:     df['FamilySize'] = df['SibSp'] + df['Parch'] + 1 # ← new
# 35:     df['IsAlone'] = (df['FamilySize'] == 1).astype(int) # ← new
# 36:     return df # ← new
# 37: 
# 38: df_clean = clean_titanic(df) # ← new
# 39: print("\nCleaned Head:\n", df_clean.head()) # ← new
# 40: print("\nCleaned nulls:\n", df_clean.isnull().sum()) # ← new
```
This block defines and executes our data preparation pipeline, transforming the raw DataFrame into a fully numeric, complete dataset with engineered features ready for modeling.

### Mechanical walkthrough

- `def clean_titanic(df):` defines a function taking a DataFrame. Encapsulating our logic in a function allows us to apply the exact same cleaning steps to future data (like a final unseen test set) consistently.
- `df = df.copy()` calls the `copy` method to create a defensive duplicate. We modify the copy rather than the original, preventing unintended side effects on our raw data view.
- `df.drop(columns=['PassengerId', 'Name'])` removes columns that are effectively random identifiers and hold no generalized predictive power.
- `df['Age'].median()` calculates the 50th percentile of the existing ages.
- `df['Age'].fillna(...)` replaces all `NaN` values in the Age column with that computed median. This is **Data imputation**, allowing us to retain the rest of the row's valuable data instead of throwing it away.
- `df['Sex'] == 'female'` performs a vectorized boolean comparison, resulting in a Series of `True` (for females) and `False` (for males).
- `.astype(int)` chains onto that boolean Series, casting `True` to `1` and `False` to `0`. Machine learning models require this numerical encoding.
- `df['SibSp'] + df['Parch'] + 1` is an example of **Feature engineering**. We perform element-wise addition across two columns, plus 1 for the passenger themselves, to calculate total family size.
- `(df['FamilySize'] == 1).astype(int)` creates another engineered binary feature indicating whether the passenger is traveling completely alone.
- `return df` hands back the fully processed DataFrame.
- `df_clean = clean_titanic(df)` executes the function.
- The final prints verify that our transformations succeeded and that no null values remain (`isnull().sum()` should output all zeros).

---

## Concept Unit: Splitting and preparing for ML

### The Problem

We now have a clean, numerical dataset. However, if we train a machine learning model on all our data, we have no way to honestly evaluate how well it performs. It might just memorize the training data (overfitting) and fail utterly on new passengers. Furthermore, algorithms like k-Nearest Neighbors measure geometric distance between data points; if 'Fare' ranges from 0 to 500 and 'Age' ranges from 0 to 80, the 'Fare' dimension will mathematically dominate the distance calculation simply because the numbers are larger, not because the feature is more important.

How do we solve this? Look at the names `train_test_split` and `StandardScaler`—what do they suggest we must do before feeding the data to an algorithm?

### Introduce the concept in isolation

This throwaway script demonstrates the mechanics of extracting raw arrays, splitting them, and standardizing them.

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np

X_dummy = np.array([[100, 1], [200, 2], [300, 3], [400, 4]])
y_dummy = np.array([0, 0, 1, 1])

# Split
X_tr, X_te, y_tr, y_te = train_test_split(X_dummy, y_dummy, test_size=0.5, random_state=42)

# Scale
scaler = StandardScaler()
X_tr_scaled = scaler.fit_transform(X_tr)
print(X_tr_scaled.mean(axis=0)) # Should be approx [0, 0]
print(X_tr_scaled.std(axis=0))  # Should be approx [1, 1]
```

**Predicted Output (Exempt from run):**
```
[0. 0.]
[1. 1.]
```

This proves that `train_test_split` successfully partitions the data, and that `StandardScaler` transforms the features such that their mean is 0 and their standard deviation is 1, removing arbitrary scale differences.

### Discard the throwaway example

This throwaway script is deleted.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Below the data cleaning block.
- **Dependencies:** Requires `scikit-learn` (`pip install scikit-learn`).

### The New Code

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

feature_cols = ['Pclass', 'Sex', 'Age', 'Fare', 'FamilySize', 'IsAlone']
X = df_clean[feature_cols].values  # numpy array
y = df_clean['Survived'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

print(f'\nTraining samples: {len(X_train)}, Test samples: {len(X_test)}')
print(f'Survival rate (train): {y_train.mean():.2f}')
print(f'Survival rate (test):  {y_test.mean():.2f}')
print(f'Feature names: {feature_cols}')
```

### The Updated Project

```python
# 41: 
# 42: from sklearn.model_selection import train_test_split # ← new
# 43: from sklearn.preprocessing import StandardScaler # ← new
# 44: 
# 45: feature_cols = ['Pclass', 'Sex', 'Age', 'Fare', 'FamilySize', 'IsAlone'] # ← new
# 46: X = df_clean[feature_cols].values # ← new
# 47: y = df_clean['Survived'].values # ← new
# 48: 
# 49: X_train, X_test, y_train, y_test = train_test_split( # ← new
# 50:     X, y, test_size=0.25, random_state=42, stratify=y # ← new
# 51: ) # ← new
# 52: 
# 53: scaler = StandardScaler() # ← new
# 54: X_train_scaled = scaler.fit_transform(X_train) # ← new
# 55: X_test_scaled  = scaler.transform(X_test) # ← new
# 56: 
# 57: print(f'\nTraining samples: {len(X_train)}, Test samples: {len(X_test)}') # ← new
# ... (remaining prints)
```
This block separates our data into the features (`X`) we use to predict and the target labels (`y`) we want to learn, splits them into isolated training and evaluation sets, and standardizes the numeric scales.

### Mechanical walkthrough

- `feature_cols = [...]` defines a list of the exact column strings we want to use as inputs. We omit `Survived` because that is what we are trying to predict.
- `df_clean[feature_cols]` selects a subset DataFrame containing only those columns.
- `.values` is a pandas property that strips away the column labels and row indices, returning the raw underlying 2D NumPy array. Scikit-learn algorithms mathematically operate on these raw matrices. `X` conventionally represents the feature matrix (capitalized because it is 2D).
- `y = df_clean['Survived'].values` extracts the target column as a 1D NumPy array (`y` is lowercase because it is a vector).
- `train_test_split(...)` consumes the arrays and randomly partitions them.
- `test_size=0.25` specifies that 25% of the rows should be held out for testing.
- `random_state=42` seeds the random number generator, ensuring that our split is reproducible every time we run the script.
- `stratify=y` ensures that the proportion of survivors to non-survivors is exactly identical in both the training and testing sets, preventing a statistically skewed split.
- `scaler = StandardScaler()` instantiates the scaling object.
- `scaler.fit_transform(X_train)` computes the mean and variance of the *training* data, applies the scaling, and returns the result.
- `scaler.transform(X_test)` applies the *exact same* scaling transformation to the test data. We do not call `fit` on the test data because doing so would leak information from the test set into our pipeline, compromising the integrity of our evaluation.

---

## Concept Unit: Training and comparing three models

### The Problem

We have our scaled training data, but there is no single "best" algorithm for all problems (a concept known as the No Free Lunch theorem). A linear model might underfit complex interactions; a decision tree might overfit the noise; a nearest-neighbors model might struggle with the specific dimensionality. We need to train multiple different architectures, evaluate them robustly without touching our final holdout test set, and objectively select the best one.

How do we evaluate them robustly? If we just evaluate on the training set, the tree will look perfect because it memorized the data.

### Introduce the concept in isolation

This throwaway snippet demonstrates **cross-validation**, where the training data itself is divided into multiple folds. The model trains on some folds and is scored on the remainder, rotating until an average score is achieved.

```python
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
import numpy as np

# Dummy data
X_cv = np.random.rand(100, 2)
y_cv = np.random.randint(0, 2, 100)

model = LogisticRegression()
scores = cross_val_score(model, X_cv, y_cv, cv=3, scoring='accuracy')
print(scores)
```
**Predicted Output (Exempt from run):**
```
[0.48484848 0.54545455 0.51515152]
```
This proves that `cross_val_score` automatically handles the internal splitting, fitting, and predicting, returning an array of scores (one for each of the 3 folds). We can average these to estimate true performance.

### Discard the throwaway example

This script is deleted.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** Below the scaling block.
- **Dependencies:** None.

### The New Code

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, StratifiedKFold
import numpy as np

models = [
    ('Decision Tree (d=3)', DecisionTreeClassifier(max_depth=3, random_state=42)),
    ('kNN (k=5)',           KNeighborsClassifier(n_neighbors=5)),
    ('Logistic Regression', LogisticRegression(max_iter=1000, random_state=42)),
]

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
results = []
print("\nCross-Validation Results:")
for name, model in models:
    scores = cross_val_score(model, X_train_scaled, y_train, cv=cv, scoring='f1')
    results.append((name, scores.mean(), scores.std()))
    print(f'{name}: CV F1 = {scores.mean():.4f} (+/- {scores.std():.4f})')

# Select the best model:
best_name, best_mean, _ = max(results, key=lambda r: r[1])
print(f'\nBest model selected: {best_name}')
```

### The Updated Project

```python
# 59: print(f'Feature names: {feature_cols}')
# 60: 
# 61: from sklearn.tree import DecisionTreeClassifier # ← new
# 62: from sklearn.neighbors import KNeighborsClassifier # ← new
# 63: from sklearn.linear_model import LogisticRegression # ← new
# 64: from sklearn.model_selection import cross_val_score, StratifiedKFold # ← new
# ... (the rest of the new code block defining models and running the loop)
```
This block instantiates three different machine learning algorithms, evaluates each one across 5 distinct splits of the training data using the F1 score, prints the results, and automatically identifies the winner.

### Mechanical walkthrough

- `DecisionTreeClassifier(max_depth=3, random_state=42)` instantiates a tree model. We restrict `max_depth` to 3 to prevent it from growing infinitely and overfitting the tiny dataset.
- `KNeighborsClassifier(n_neighbors=5)` instantiates a model that classifies a point based on the majority vote of the 5 closest points in the scaled feature space.
- `LogisticRegression(...)` instantiates a linear classifier that models the probability of survival.
- `models = [...]` stores these instantiated objects in a list of tuples, associating each object with a human-readable name string.
- `StratifiedKFold(n_splits=5, ...)` creates a cross-validation strategy object. It specifies that the data will be split into 5 equal parts (folds), preserving the survival ratio in each.
- `for name, model in models:` iterates over our suite of algorithms.
- `cross_val_score(model, X_train_scaled, y_train, cv=cv, scoring='f1')` executes the **Cross-validation**. Under the hood, it clones the `model`, trains it on 4 folds, predicts the 5th, computes the F1 score, and repeats this 5 times.
- `scoring='f1'` uses the F1 score metric instead of raw accuracy. F1 is the harmonic mean of precision and recall, providing a more balanced view of performance, especially on imbalanced datasets.
- `scores.mean()` calculates the average score across the 5 folds.
- `scores.std()` calculates the standard deviation, showing us how volatile or stable the model's performance was across different subsets of data.
- `max(results, key=lambda r: r[1])` uses Python's built-in `max` function with a custom lambda key to find the tuple in the `results` list that has the highest average F1 score (index 1 in the tuple).

---

## Concept Unit: Final evaluation and report generation

### The Problem

We used cross-validation to select the best algorithm architecture, but those models were only trained on subsets of the training data. To get the absolute best predictive engine, we must now retrain the winning architecture on the *entire* training dataset. Then, we must confront it with the completely unseen `X_test` data we held out in step 4. Finally, we need to generate a detailed report summarizing exactly where the model succeeded and failed so that stakeholders can trust it.

### Introduce the concept in isolation

This throwaway script demonstrates evaluation metrics.

```python
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix

y_true = [0, 1, 0, 1]
y_pred = [0, 1, 0, 0]

print("Accuracy:", accuracy_score(y_true, y_pred))
print("F1:", f1_score(y_true, y_pred))
print("Matrix:\n", confusion_matrix(y_true, y_pred))
```
**Predicted Output (Exempt from run):**
```
Accuracy: 0.75
F1: 0.6666666666666666
Matrix:
 [[2 0]
 [1 1]]
```
This proves that the metrics functions consume arrays of true labels and predicted labels, returning scalar scores or matrices representing true positives, false positives, true negatives, and false negatives. This is the essence of **Model evaluation**.

### Discard the throwaway example

This script is deleted.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.py` (modified)
- **Change type:** add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code

```python
from sklearn.metrics import (accuracy_score, f1_score, classification_report,
                              confusion_matrix)

# We know from the CV output that Logistic Regression won.
# Retrain best model on full training data:
best_model = LogisticRegression(max_iter=1000, random_state=42)
best_model.fit(X_train_scaled, y_train)

# Evaluate on the completely unseen test set:
y_pred = best_model.predict(X_test_scaled)

print('\n' + '=' * 50)
print('TITANIC SURVIVAL PREDICTION REPORT')
print('=' * 50)
print(f'Model: Logistic Regression')
print(f'Training samples: {len(X_train)}')
print(f'Test samples:     {len(X_test)}')
print()
print(f'Accuracy: {accuracy_score(y_test, y_pred):.4f}')
print(f'F1 Score: {f1_score(y_test, y_pred):.4f}')
print('\nClassification Report:')
print(classification_report(y_test, y_pred, target_names=['Died', 'Survived']))
print('Confusion Matrix:')
print(confusion_matrix(y_test, y_pred))
```

### The Updated Project

```python
# 78: best_name, best_mean, _ = max(results, key=lambda r: r[1])
# 79: print(f'\nBest model selected: {best_name}')
# 80: 
# 81: from sklearn.metrics import (accuracy_score, f1_score, classification_report, # ← new
# ... (rest of the reporting block)
```
This final block completes the pipeline: it performs the definitive training run, generates the final predictions on unseen data, and outputs a comprehensive statistical report.

### Mechanical walkthrough

- `best_model = LogisticRegression(...)` creates a fresh instance of the winning algorithm.
- `best_model.fit(X_train_scaled, y_train)` executes the core learning algorithm. It calculates the optimal internal weights (coefficients) that map the 6 input features to the survival probabilities, using 100% of the training data.
- `best_model.predict(X_test_scaled)` passes our held-out test features through the learned equation, returning an array (`y_pred`) containing binary predictions (0 or 1) for each unseen passenger.
- `accuracy_score(y_test, y_pred)` compares the model's guesses against the actual historical truth, computing the percentage of correct guesses.
- `f1_score(y_test, y_pred)` computes the final F1 score on the test set.
- `classification_report(y_test, y_pred, target_names=['Died', 'Survived'])` compiles precision (when it predicts survival, how often is it right?), recall (out of all actual survivors, how many did it find?), and support metrics into a formatted text table.
- `confusion_matrix(y_test, y_pred)` calculates a 2x2 grid showing exactly where the model erred: Top-Left (True Negatives, correctly predicted death), Top-Right (False Positives, wrongly predicted survival), Bottom-Left (False Negatives, wrongly predicted death), and Bottom-Right (True Positives, correctly predicted survival).

When you run the complete file, you will see the full data flow from raw CSV text down to this exact diagnostic matrix.

---

## Series Retrospective — What You’ve Built

You have just completed the final lesson. In this single script, you have utilized concepts from every module in this 48-lesson curriculum:

- **Module 0 (Lessons 0–4):** Python syntax, types, loops, and functions. These were used everywhere, from the basic `def clean_titanic` block to string formatting in our report.
- **Module 1 (Lessons 5–14):** Data structures, comprehensions, and recursion. Understanding dictionary key-value mapping is what allowed you to understand how a DataFrame is constructed and accessed.
- **Module 2 (Lessons 15–21):** Exceptions, testing, files, and generators. Our use of `io.StringIO` to simulate file I/O directly applied the file-handling abstractions taught here.
- **Module 3 (Lessons 22–28):** Classes, OOP, and encapsulation. Every scikit-learn model (`StandardScaler`, `LogisticRegression`) is an object. You instantiated them, mutated their internal state via `.fit()`, and utilized that encapsulated state via `.predict()`.
- **Module 4 (Lessons 29–36):** Algorithms, complexity, and graph search. Understanding algorithmic complexity is what allows you to understand why `DecisionTreeClassifier` is restricted by `max_depth` and how `KNeighbors` searches feature space.
- **Module 5 (Lessons 37–42):** Probability, simulation, statistics, and curve fitting. The metrics of mean, standard deviation, and median imputation rely directly on the statistical foundations built in this module.
- **Module 6 (Lessons 43–47):** Machine Learning. This capstone brought it all together.

You started from zero — learning what a variable is, what an integer is. You now have a complete understanding of Python from first principles; the ability to prove algorithms correct with loop invariants; a working knowledge of OOP that lets you read and extend any framework; a Monte Carlo toolkit for simulation; and the ability to build, evaluate, and compare machine learning models.

The next steps: read the companion Scheme/Lisp/Clojure/SICP series to understand computation from a different angle — the same ideas appear in both, and the cross-illumination is profound. Read Guttag’s book chapter by chapter alongside these lessons. Then read SICP.
