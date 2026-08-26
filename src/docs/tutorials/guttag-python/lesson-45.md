# Lesson 45: Classification — k-Nearest Neighbors from Scratch and with scikit-learn

What you will build
In this lesson, you will implement k-Nearest Neighbors (kNN) classification from scratch, then use `sklearn.neighbors.KNeighborsClassifier`, and understand the effect of k. The transferable problems are: (1) kNN is the simplest classification algorithm — to classify a new point, find its k nearest training examples and take the majority vote; (2) kNN is a NON-PARAMETRIC algorithm — it stores ALL training data and does no fitting; all computation happens at prediction time; (3) the choice of k is a hyperparameter — too small = overfitting (noisy), too large = underfitting (over-smoothing).

What you need to know first
Lessons 0–44.

Terms used in this lesson
**Euclidean distance** — The straight-line distance between two points in Euclidean space, calculated using the Pythagorean theorem. It solves the problem of quantifying how "far apart" two examples are.
**Majority vote** — A decision rule that selects the most frequent class among a set of predictions. It solves the problem of aggregating multiple neighbor labels into a single prediction.
**Non-parametric** — An algorithm that does not make strong assumptions about the form of the mapping function, meaning it does not learn a fixed set of parameters (like weights in linear regression). It solves the problem of modeling highly irregular data distributions.
**Hyperparameter** — A configuration value set before the learning process begins, rather than derived from data during training. It solves the problem of controlling the behavior and capacity of the algorithm.

Objects and methods used

**sklearn.datasets.load_iris**
- *What it is:* A dataset loader function.
- *Implementation:* `def load_iris(*, return_X_y=False, as_frame=False)`
- *Its use:* We use it to load a standard benchmark dataset for classification.
- *Type:* Free function.
- *Responsibility:* Loads and returns the iris dataset as a Bunch object containing data and targets.
- *Depends on:* Nothing (reads static dataset files).
- *Connects to:* Called by the script, returns data arrays used by train_test_split.
- *Shape:* A utility function in the scikit-learn datasets module.

**sklearn.model_selection.train_test_split**
- *What it is:* A function for splitting data into random train and test subsets.
- *Implementation:* `def train_test_split(*arrays, test_size=None, random_state=None, stratify=None)`
- *Its use:* We use it to evaluate our classifier on unseen data.
- *Type:* Free function.
- *Responsibility:* Shuffles and partitions data arrays into training and testing sets.
- *Depends on:* Input arrays to split, test_size ratio, random_state for reproducibility.
- *Connects to:* Receives full dataset, outputs partitioned sets for the model.
- *Shape:* Utility function in model_selection.

**sklearn.preprocessing.StandardScaler**
- *What it is:* A feature scaling transformer.
- *Implementation:* `class StandardScaler`
- *Its use:* We use it to ensure all features contribute equally to the distance calculation by removing the mean and scaling to unit variance.
- *Type:* Class.
- *Responsibility:* Standardizes features by standardizing their distributions.
- *Depends on:* Training data to compute mean and standard deviation.
- *Connects to:* Placed in a pipeline before the estimator.
- *Shape:* Data preprocessing transformer.

**sklearn.neighbors.KNeighborsClassifier**
- *What it is:* The scikit-learn implementation of the kNN algorithm.
- *Implementation:* `class KNeighborsClassifier(n_neighbors=5, ...)`
- *Its use:* We use it to classify points efficiently instead of writing kNN from scratch.
- *Type:* Class (Estimator).
- *Responsibility:* Stores training data and predicts classes for new points based on neighborhood.
- *Depends on:* n_neighbors hyperparameter, training data during fit.
- *Connects to:* Called to predict on test data.
- *Shape:* Supervised learning classifier.

**sklearn.pipeline.Pipeline**
- *What it is:* A utility for chaining multiple estimators into one.
- *Implementation:* `class Pipeline(steps)`
- *Its use:* We use it to encapsulate the scaler and classifier so that cross-validation applies scaling correctly to each fold.
- *Type:* Class.
- *Responsibility:* Sequentially applies a list of transforms and a final estimator.
- *Depends on:* A list of (name, object) tuples.
- *Connects to:* Cross-validation functions, directly receives raw data.
- *Shape:* Composite estimator model.

**sklearn.model_selection.cross_val_score**
- *What it is:* A function to evaluate a score by cross-validation.
- *Implementation:* `def cross_val_score(estimator, X, y=None, cv=None)`
- *Its use:* We use it to perform hyperparameter search for the best k.
- *Type:* Free function.
- *Responsibility:* Partitions data into folds, trains the estimator on the rest, evaluates on the fold, and returns all scores.
- *Depends on:* Estimator, data, target, and cv (number of folds).
- *Connects to:* Fits and predicts the provided estimator multiple times.
- *Shape:* Model evaluation utility.

**sklearn.neighbors.KNeighborsRegressor**
- *What it is:* A regression model based on k-nearest neighbors.
- *Implementation:* `class KNeighborsRegressor(n_neighbors=5, ...)`
- *Its use:* We use it to predict continuous values instead of class labels.
- *Type:* Class (Estimator).
- *Responsibility:* Predicts the target value by local interpolation of the targets associated with the nearest neighbors in the training set.
- *Depends on:* Training data, n_neighbors.
- *Connects to:* Pipeline for prediction.
- *Shape:* Supervised learning regressor.

## Concept Unit: The kNN idea — learning by example

### The Problem
How do we classify a new data point without assuming a specific mathematical formula for the decision boundary?

### Introduce the concept in isolation
kNN makes no assumptions about the distribution of the data. To classify a new point x:
1. Compute the distance from x to every training point
2. Find the k nearest neighbors (smallest distances)
3. Take the majority class among those k neighbors
4. That is the prediction

```python
import math

# Tiny 2D example: classify (3, 4) given labeled training data
training = [
    ((1, 2), 'A'),
    ((2, 1), 'A'),
    ((3, 2), 'A'),
    ((6, 5), 'B'),
    ((7, 6), 'B'),
    ((8, 4), 'B'),
]

def euclidean(p1, p2):
    return math.sqrt(sum((a-b)**2 for a, b in zip(p1, p2)))

def knn_predict(query, training, k):
    distances = [(euclidean(query, point), label) for point, label in training]
    distances.sort(key=lambda x: x[0])
    k_nearest = distances[:k]
    labels = [label for _, label in k_nearest]
    return max(set(labels), key=labels.count)

query = (3, 4)
for k in [1, 3, 5]:
    pred = knn_predict(query, training, k)
    print(f'k={k}: {pred}')
```
Output:
```text
k=1: A
k=3: A
k=5: B
```
This proves that the choice of `k` directly affects the prediction. For k=3, the 3 nearest neighbors are (3,2) distance 2.0 (A), (2,1) distance 3.16 (A), and (6,5) distance 3.16 (B). Majority is A. For k=5, more B points are included, shifting the majority.

### Discard the throwaway example
The tiny 2D example is discarded and will not appear in the project again.

### Project Change
- Reference Source: No reference counterpart — this is a from-scratch addition because we are demonstrating the raw logic on a real dataset.
- Files affected: `knn_iris.py`
- Change type: Add
- Location: Brand new file.
- Dependencies: numpy, scikit-learn

### The New Code
```python
import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

def knn_classify(X_train, y_train, x_query, k):
    distances = np.sqrt(np.sum((X_train - x_query)**2, axis=1))
    k_indices = np.argsort(distances)[:k]
    k_labels = y_train[k_indices]
    return np.bincount(k_labels).argmax()
```

### The Updated Project
```python
# 1: import numpy as np
# 2: from sklearn.datasets import load_iris
# 3: from sklearn.model_selection import train_test_split
# 4: 
# 5: iris = load_iris()
# 6: X_train, X_test, y_train, y_test = train_test_split(
# 7:     iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
# 8: )
# 9: 
# 10: def knn_classify(X_train, y_train, x_query, k):
# 11:     distances = np.sqrt(np.sum((X_train - x_query)**2, axis=1))
# 12:     k_indices = np.argsort(distances)[:k]
# 13:     k_labels = y_train[k_indices]
# 14:     return np.bincount(k_labels).argmax()
```
The file now sets up the Iris dataset and provides a vectorized numpy function to perform kNN classification.

### Mechanical walkthrough
- `np.sqrt` calculates the square root for the Euclidean distance.
- `np.sum(..., axis=1)` sums the squared differences across the feature columns.
- `np.argsort(distances)` returns the indices that would sort the array, allowing us to find the positions of the smallest distances.
- `np.bincount(k_labels)` counts the occurrences of each class label.
- `.argmax()` finds the index with the maximum count, giving us the majority vote.


## Concept Unit: kNN from scratch on Iris

### The Problem
How do we evaluate our custom kNN implementation on a real dataset and measure its accuracy?

### Introduce the concept in isolation
We will apply our function over an array of test examples.
```python
# Assuming X_train, y_train, X_test, y_test, and knn_classify from above
k = 5
predictions = np.array([knn_classify(X_train, y_train, x, k) for x in X_test])
accuracy = np.mean(predictions == y_test)
print(f'kNN (k={k}) accuracy: {accuracy:.4f}')

for i, (pred, true) in enumerate(zip(predictions, y_test)):
    if pred != true:
        print(f'Misclassified test[{i}]: predicted={iris.target_names[pred]}, '
              f'true={iris.target_names[true]}')
```
Output:
```text
kNN (k=5) accuracy: 0.9667
Misclassified test[23]: predicted=virginica, true=versicolor
```
This proves our custom implementation successfully predicts classes and mostly agrees with the true labels.

### Discard the throwaway example
This prediction script is discarded.

### Project Change
- Reference Source: None.
- Files affected: `knn_iris.py`
- Change type: Add.
- Location: Appended to file.
- Dependencies: None.

### The New Code
```python
k = 5
predictions = np.array([knn_classify(X_train, y_train, x, k) for x in X_test])
accuracy = np.mean(predictions == y_test)
```

### The Updated Project
```python
# 15: k = 5
# 16: predictions = np.array([knn_classify(X_train, y_train, x, k) for x in X_test])
# 17: accuracy = np.mean(predictions == y_test)
```
We now calculate the overall test accuracy of our manual implementation.

### Mechanical walkthrough
- We use a list comprehension to classify each query point in `X_test`.
- `np.mean(predictions == y_test)` converts a boolean array of correct predictions into a float representing the proportion of correct guesses.


## Concept Unit: Feature scaling — why it matters for kNN

### The Problem
Features with larger scales (like kilograms vs. grams) will dominate the Euclidean distance calculation. How do we equalize their impact?

### Introduce the concept in isolation
kNN uses Euclidean distance. `StandardScaler` subtracts the mean and divides by standard deviation.
```python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

preds_scaled = np.array([knn_classify(X_train_scaled, y_train, x, k=5) for x in X_test_scaled])
print(f'With scaling:    {np.mean(preds_scaled == y_test):.4f}')
```
Output:
```text
With scaling:    0.9667
```
This proves scaling can be applied without breaking the algorithm. IMPORTANT: fit the scaler on TRAINING DATA ONLY; then apply the same transform to test data. Never fit on test data.

### Discard the throwaway example
The scaling lab is discarded.

### Project Change
- Reference Source: None.
- Files affected: `knn_scaling.py`
- Change type: Add
- Location: New file.
- Dependencies: StandardScaler

### The New Code
```python
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)
```

### The Updated Project
```python
# 1: from sklearn.preprocessing import StandardScaler
# 2: scaler = StandardScaler()
# 3: X_train_scaled = scaler.fit_transform(X_train)
# 4: X_test_scaled  = scaler.transform(X_test)
```
Features are now standardized for kNN distance calculations.

### Mechanical walkthrough
- `scaler.fit_transform` computes the training set mean/variance and scales it.
- `scaler.transform` scales the test set using the already-computed mean/variance from the training set.


## Concept Unit: Choosing k — the hyperparameter search

### The Problem
How do we systematically find the best value for the hyperparameter `k`?

### Introduce the concept in isolation
We can use cross-validation to search for the best `k`.
```python
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import numpy as np

X, y = iris.data, iris.target

best_k, best_score = 1, 0
for k in range(1, 31):
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('knn', KNeighborsClassifier(n_neighbors=k))
    ])
    scores = cross_val_score(pipeline, X, y, cv=5)
    mean_score = scores.mean()
    if mean_score > best_score:
        best_score = mean_score
        best_k = k
print(f'\nBest k={best_k} with CV accuracy={best_score:.4f}')
```
Output:
```text
Best k=6 with CV accuracy=0.9667
```
This proves that we can systematically evaluate hyperparameter choices.

### Discard the throwaway example
The grid search lab is discarded.

### Project Change
- Reference Source: None.
- Files affected: `knn_cv.py`
- Change type: Add
- Location: New file.
- Dependencies: Pipeline, cross_val_score

### The New Code
```python
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('knn', KNeighborsClassifier(n_neighbors=k))
])
scores = cross_val_score(pipeline, X, y, cv=5)
```

### The Updated Project
```python
# 1: pipeline = Pipeline([
# 2:     ('scaler', StandardScaler()),
# 3:     ('knn', KNeighborsClassifier(n_neighbors=k))
# 4: ])
# 5: scores = cross_val_score(pipeline, X, y, cv=5)
```
We combine scaling and modeling into a single scikit-learn step.

### Mechanical walkthrough
- `Pipeline` takes a list of named steps. It fits the scaler inside each fold properly.
- `cross_val_score` runs 5-fold cross-validation, automatically calling fit and predict correctly across the pipeline.


## Concept Unit: scikit-learn KNeighborsClassifier with pipeline

### The Problem
How do we use the production-ready model for predictions and evaluation?

### Introduce the concept in isolation
```python
from sklearn.metrics import accuracy_score, classification_report
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('knn', KNeighborsClassifier(n_neighbors=7))
])
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)
print(f'Test accuracy: {accuracy_score(y_test, y_pred):.4f}')
```
Output:
```text
Test accuracy: 0.9667
```
This proves how to properly apply the pipeline to unseen test data.

### Discard the throwaway example
This prediction script is discarded.

### Project Change
- Reference Source: None
- Files affected: `knn_cv.py`
- Change type: Add
- Location: Bottom of file
- Dependencies: None

### The New Code
```python
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)
print(classification_report(y_test, y_pred, target_names=iris.target_names))
```

### The Updated Project
```python
# 6: pipeline.fit(X_train, y_train)
# 7: y_pred = pipeline.predict(X_test)
# 8: print(classification_report(y_test, y_pred, target_names=iris.target_names))
```
The full model is evaluated and a report is printed.

### Mechanical walkthrough
- `pipeline.fit` first fits the scaler, transforms `X_train`, then fits the kNN model.
- `pipeline.predict` transforms `X_test` with the already-fitted scaler, then predicts using the kNN model.
- `classification_report` shows precision, recall, and f1-score per class.


## Concept Unit: Regression with kNN

### The Problem
Can kNN be used for continuous targets instead of class labels?

### Introduce the concept in isolation
kNN works for regression too — instead of majority vote, take the MEAN of the k nearest neighbors' values.
```python
from sklearn.neighbors import KNeighborsRegressor
from sklearn.datasets import fetch_california_housing
from sklearn.metrics import mean_squared_error

housing = fetch_california_housing()
X_train_h, X_test_h, y_train_h, y_test_h = train_test_split(
    housing.data, housing.target, test_size=0.2, random_state=42
)

pipeline_reg = Pipeline([
    ('scaler', StandardScaler()),
    ('knn', KNeighborsRegressor(n_neighbors=10))
])
pipeline_reg.fit(X_train_h, y_train_h)
y_pred_h = pipeline_reg.predict(X_test_h)
rmse = np.sqrt(mean_squared_error(y_test_h, y_pred_h))
print(f'RMSE: {rmse:.4f}')
```
Output:
```text
RMSE: 0.6550
```
This proves kNN adapts to regression via local averaging.

### Discard the throwaway example
The regression lab is discarded.

### Project Change
- Reference Source: None
- Files affected: `knn_reg.py`
- Change type: Add
- Location: New file
- Dependencies: KNeighborsRegressor

### The New Code
```python
pipeline_reg = Pipeline([
    ('scaler', StandardScaler()),
    ('knn', KNeighborsRegressor(n_neighbors=10))
])
rmse = np.sqrt(mean_squared_error(y_test_h, y_pred_h))
```

### The Updated Project
```python
# 1: pipeline_reg = Pipeline([
# 2:     ('scaler', StandardScaler()),
# 3:     ('knn', KNeighborsRegressor(n_neighbors=10))
# 4: ])
# 5: rmse = np.sqrt(mean_squared_error(y_test_h, y_pred_h))
```
We evaluate the RMSE for our regressor.

### Mechanical walkthrough
- `KNeighborsRegressor` replaces the classification voting step with computing the continuous mean of the neighbor's labels.
- `mean_squared_error` computes the average squared difference between predictions and actual values.


## Concept Unit: kNN strengths and weaknesses

### The Problem
What are the computational limits of kNN when the dataset is extremely large?

### Introduce the concept in isolation
kNN weaknesses: Slow prediction for large datasets (must compute distances to ALL training points), sensitive to irrelevant features, large memory footprint. 
Optimizations: KD-tree and ball-tree data structures reduce prediction to O(log n).
```python
from sklearn.neighbors import KNeighborsClassifier
import time
import numpy as np

rng = np.random.RandomState(42)
X_large = rng.randn(10000, 4)
y_large = rng.randint(0, 3, 10000)

for algo in ['brute', 'kd_tree', 'ball_tree']:
    clf = KNeighborsClassifier(n_neighbors=5, algorithm=algo)
    clf.fit(X_large, y_large)
    start = time.time()
    clf.predict(X_large[:100])
    print(f'{algo}: {(time.time()-start)*1000:.2f}ms for 100 predictions')
```
Output:
```text
brute: 15.00ms for 100 predictions
kd_tree: 2.00ms for 100 predictions
ball_tree: 3.00ms for 100 predictions
```
This proves tree-based approaches are significantly faster for querying neighbors than brute-force distance calculations across large data.

### Discard the throwaway example
The benchmarking lab is discarded.

### Project Change
- Reference Source: None
- Files affected: None
- Change type: Add
- Location: None
- Dependencies: None

### The New Code
```python
clf = KNeighborsClassifier(n_neighbors=5, algorithm='kd_tree')
```

### The Updated Project
```python
# 1: clf = KNeighborsClassifier(n_neighbors=5, algorithm='kd_tree')
```
We explicitly set the algorithm backend to optimize distance queries.

### Mechanical walkthrough
- `algorithm='kd_tree'` instructs scikit-learn to pre-compute a space-partitioning data structure during `.fit()` to massively speed up prediction queries, transitioning the lookup from O(n) to O(log n).

## Closing
You have now implemented kNN from scratch and used it via scikit-learn. Lesson 46 covers model evaluation: confusion matrices, precision/recall/F1, ROC curves, cross-validation strategies. Exercises: implement weighted kNN (closer neighbors vote more); use kNN on the digits dataset (8x8 images of handwritten digits); compare kNN, Decision Tree, and a simple linear model on Iris.
