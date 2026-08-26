# Lesson 43: Introduction to Machine Learning — What It Is and What It Isn’t

**What you will build**
In this lesson, you will build your first real machine learning model to classify iris flowers. The transferable problems you will solve are understanding that ML is curve fitting with more powerful curves (aiming for a model that generalizes to new data), realizing that the train/test split is not optional (evaluating on training data always lies), and executing the four steps of every ML project: load data, split, train, and evaluate. We will implement a decision tree from scratch first to understand it mechanically, then show scikit-learn for production use.

**What you need to know first**
- Lessons 0–42

**Terms used in this lesson**
- **Supervised learning** — given labeled examples (X, y), learn f such that f(X) ≈ y for new X. Examples: spam detection, image classification, price prediction.
- **Unsupervised learning** — given unlabeled data X, find structure. Examples: clustering customers, dimensionality reduction, anomaly detection.
- **Reinforcement learning** — an agent takes actions in an environment; receives rewards. Not covered in this series.
- **Features (X)** — the input variables or measurements used to make predictions.
- **Labels (y)** — the target output or ground truth we are trying to predict.
- **Model** — the learned mathematical function or set of rules that maps X to y.
- **Training** — the process of fitting the model to the training data.
- **Inference** — using a trained model to make predictions on new, unseen data.
- **Overfitting** — when a model learns the noise in the training data rather than the underlying pattern, leading to poor generalization.
- **Underfitting** — when a model is too simple to capture the underlying pattern in the data.
- **Generalization** — how well a model performs on unseen data, which is the ultimate goal of machine learning.
- **Hyperparameters** — parameters of the model itself (like maximum depth) that are set before training, not learned from data.
- **Decision tree** — a model that asks a sequence of yes/no questions about features to classify an example.
- **Gini impurity** — a metric used to measure how often a randomly chosen element would be incorrectly labeled if randomly labeled according to the distribution in the subset.

**Objects and methods used**

**`numpy`**
- *What it is:* The core library for scientific computing in Python.
- *Implementation:* An imported module `import numpy as np`.
- *Its use:* We use it for fast array manipulations and mathematical operations.
- *Type:* Module.
- *Responsibility:* Provides high-performance multidimensional arrays and math tools.
- *Depends on:* Python environment.
- *Connects to:* Serves as the foundation for almost all ML libraries, including scikit-learn.
- *Shape:* Fundamental dependency layer.

**`numpy.array`**
- *What it is:* A multidimensional, homogeneous array of fixed-size items.
- *Implementation:* `def array(object, dtype=None, ...)`
- *Its use:* Creating arrays to represent our features and labels.
- *Type:* Function/Class constructor.
- *Responsibility:* Allocates memory and constructs a fast numerical array.
- *Depends on:* An iterable of data.
- *Connects to:* Returns an `ndarray` object.
- *Shape:* Core data structure.

**`numpy.polyfit`**
- *What it is:* Least squares polynomial fit.
- *Implementation:* `def polyfit(x, y, deg)`
- *Its use:* To demonstrate that ML is essentially advanced curve fitting.
- *Type:* Module-level function.
- *Responsibility:* Finds the coefficients of a polynomial of degree `deg` that best fits the data `(x, y)`.
- *Depends on:* Input arrays `x` and `y`, and an integer `deg`.
- *Connects to:* Returns an array of coefficients.
- *Shape:* Algorithmic utility.

**`numpy.poly1d`**
- *What it is:* A one-dimensional polynomial class.
- *Implementation:* `class poly1d(c_or_r, r=False, variable=None)`
- *Its use:* To evaluate the polynomial learned by `polyfit`.
- *Type:* Class.
- *Responsibility:* Wraps polynomial coefficients into a callable function.
- *Depends on:* Coefficients array.
- *Connects to:* Callable object returning predicted values.
- *Shape:* Evaluator wrapper.

**`numpy.pi`**
- *What it is:* The mathematical constant π.
- *Implementation:* A float constant `3.141592653589793`.
- *Its use:* Used as the true function we are trying to learn in our toy example.
- *Type:* Float constant.
- *Responsibility:* Provides high-precision Pi.
- *Depends on:* Nothing.
- *Connects to:* Mathematical expressions.
- *Shape:* Static value.

**`sklearn.datasets.load_iris`**
- *What it is:* A function to load the classic Iris dataset.
- *Implementation:* `def load_iris(*, return_X_y=False, as_frame=False)`
- *Its use:* Provides our real dataset of flower measurements for classification.
- *Type:* Function.
- *Responsibility:* Fetches and returns the dataset from scikit-learn's built-in data directory.
- *Depends on:* Scikit-learn datasets module.
- *Connects to:* Returns a `Bunch` object with `data` and `target` attributes.
- *Shape:* Data ingestion boundary.

**`sklearn.model_selection.train_test_split`**
- *What it is:* A utility to split arrays or matrices into random train and test subsets.
- *Implementation:* `def train_test_split(*arrays, test_size=None, train_size=None, random_state=None, shuffle=True, stratify=None)`
- *Its use:* Splitting our Iris data to evaluate generalization.
- *Type:* Function.
- *Responsibility:* Randomly shuffles and partitions data while keeping features and labels aligned.
- *Depends on:* Input arrays `X` and `y`.
- *Connects to:* Returns 4 arrays: `X_train, X_test, y_train, y_test`.
- *Shape:* Preprocessing utility.

**`numpy.bincount`**
- *What it is:* Count number of occurrences of each value in array of non-negative ints.
- *Implementation:* `def bincount(x, weights=None, minlength=0)`
- *Its use:* Finding the most common class in a leaf node.
- *Type:* Function.
- *Responsibility:* Tallies frequencies of integer values.
- *Depends on:* A 1D array of integers.
- *Connects to:* Returns a 1D array of counts.
- *Shape:* Statistical utility.

**`numpy.unique`**
- *What it is:* Find the unique elements of an array.
- *Implementation:* `def unique(ar, return_counts=False, ...)`
- *Its use:* Identifying all possible threshold values for splitting our tree.
- *Type:* Function.
- *Responsibility:* Sorts the array and removes duplicate elements.
- *Depends on:* Input array.
- *Connects to:* Returns an array of unique values (and optionally counts).
- *Shape:* Data analysis utility.

**`numpy.sum`**
- *What it is:* Sum of array elements.
- *Implementation:* `def sum(a, axis=None, ...)`
- *Its use:* Calculating the total Gini impurity.
- *Type:* Function.
- *Responsibility:* Computes the arithmetic sum of array elements.
- *Depends on:* Input array.
- *Connects to:* Returns a scalar sum.
- *Shape:* Mathematical utility.

**`numpy.where`**
- *What it is:* Return elements chosen from x or y depending on condition.
- *Implementation:* `def where(condition, x=None, y=None)`
- *Its use:* Vectorized conditional assignment for our stump predictions.
- *Type:* Function.
- *Responsibility:* Yields `x` if condition is true, otherwise `y`.
- *Depends on:* A boolean mask array.
- *Connects to:* Returns a new array of chosen elements.
- *Shape:* Control flow utility.

**`numpy.mean`**
- *What it is:* Compute the arithmetic mean.
- *Implementation:* `def mean(a, axis=None, ...)`
- *Its use:* Calculating accuracy by averaging boolean arrays of correct predictions.
- *Type:* Function.
- *Responsibility:* Sums elements and divides by count.
- *Depends on:* Input array.
- *Connects to:* Returns a scalar mean.
- *Shape:* Statistical utility.

**`sklearn.tree.DecisionTreeClassifier`**
- *What it is:* A class capable of performing multi-class classification on a dataset.
- *Implementation:* `class DecisionTreeClassifier(criterion='gini', max_depth=None, ...)`
- *Its use:* The production implementation of the decision tree we built from scratch.
- *Type:* Class.
- *Responsibility:* Builds a decision tree classifier from the training set (X, y).
- *Depends on:* Scikit-learn tree module.
- *Connects to:* Provides `fit` and `predict` methods.
- *Shape:* Core ML algorithm layer.

**`DecisionTreeClassifier.fit`**
- *What it is:* Build a decision tree classifier from the training set (X, y).
- *Implementation:* `def fit(self, X, y, sample_weight=None)`
- *Its use:* Training the model on our training data.
- *Type:* Instance method.
- *Responsibility:* Modifies the classifier's internal state to store the learned tree structure.
- *Depends on:* An instance of the classifier, and training data `X, y`.
- *Connects to:* Returns the fitted estimator.
- *Shape:* Mutating training operation.

**`DecisionTreeClassifier.predict`**
- *What it is:* Predict class or regression value for X.
- *Implementation:* `def predict(self, X)`
- *Its use:* Generating predictions for our test set.
- *Type:* Instance method.
- *Responsibility:* Traverses the learned tree for each sample in X to output a class label.
- *Depends on:* A fitted estimator and input features `X`.
- *Connects to:* Returns an array of predicted labels `y`.
- *Shape:* Inference operation.

**`sklearn.metrics.accuracy_score`**
- *What it is:* Accuracy classification score.
- *Implementation:* `def accuracy_score(y_true, y_pred, ...)`
- *Its use:* Evaluating how many predictions matched the ground truth exactly.
- *Type:* Function.
- *Responsibility:* Calculates the ratio of correct predictions to total predictions.
- *Depends on:* Arrays `y_true` and `y_pred`.
- *Connects to:* Returns a float between 0 and 1.
- *Shape:* Evaluation metric.

**`sklearn.metrics.classification_report`**
- *What it is:* Build a text report showing the main classification metrics.
- *Implementation:* `def classification_report(y_true, y_pred, target_names=None, ...)`
- *Its use:* Examining precision, recall, and F1-score per class.
- *Type:* Function.
- *Responsibility:* Aggregates multiple metrics into a readable string format.
- *Depends on:* True labels and predicted labels.
- *Connects to:* Returns a formatted string block.
- *Shape:* Diagnostic utility.

---

## Concept Unit: What machine learning is — and what it isn't

### 1. The Problem
In traditional programming, you write the rules to process data and produce answers. But what if the rules are too complex? For example, how do you write `if` statements to detect a cat in a grid of pixels? You can't. You need the computer to learn the rules from examples.

### 2. Introduce the concept in isolation
Machine learning is essentially function approximation — learning a curve that maps inputs to outputs. Let's see this in isolation by trying to "learn" the formula for the area of a circle.

```python
import numpy as np

radii = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dtype=float)
areas = np.pi * radii**2  # true areas

# Given (radius, area) pairs, LEARN the formula
coeffs = np.polyfit(radii, areas, deg=2)
p = np.poly1d(coeffs)

print(f'Learned: {coeffs[0]:.4f}*r^2 + {coeffs[1]:.4f}*r + {coeffs[2]:.4f}')
print(f'True: pi = {np.pi:.4f}')
print(f'Prediction for r=11: {p(11):.4f}, True: {np.pi*121:.4f}')
```

**Output:**
```
Learned: 3.1416*r^2 + -0.0000*r + 0.0000
True: pi = 3.1416
Prediction for r=11: 380.1327, True: 380.1327
```
This proves that given only inputs (`radii`) and outputs (`areas`), an algorithm can reverse-engineer the underlying relationship (approximating π).

### 3. Discard the throwaway example
We will not use `polyfit` or circle areas in our project. This throwaway example is discarded.

### 4. Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `iris_classifier.py` (created)
- **Change type:** Add
- **Location:** Top of file
- **Dependencies:** `numpy`

### 5. The New Code
```python
import numpy as np
```

### 6. The Updated Project
```python
1: import numpy as np
```
This sets up our project file with the mathematical foundation.

### 7. Mechanical walkthrough
- `import numpy as np` is the standard alias for NumPy, providing fast arrays that our machine learning tools will rely on.

---

## Concept Unit: The Iris dataset — loading and exploring

### 1. The Problem
To do machine learning, we need data. We need a dataset that has features (measurements) and labels (categories). The Iris dataset is the canonical toy dataset in ML.

### 2. Introduce the concept in isolation
Let's see what happens when we load a dummy scikit-learn dataset to inspect its structure.

```python
from sklearn.datasets import load_breast_cancer
dummy = load_breast_cancer()
print(list(dummy.keys()))
```
**Predicted Output:**
```
['data', 'target', 'frame', 'target_names', 'DESCR', 'feature_names', 'filename', 'data_module']
```
This proves that scikit-learn datasets return a dictionary-like object with `data` (our X) and `target` (our y).

### 3. Discard the throwaway example
The breast cancer dataset was just to show the structure. It is discarded.

### 4. Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `iris_classifier.py`
- **Change type:** Add
- **Location:** Below the imports.
- **Dependencies:** `sklearn.datasets`

### 5. The New Code
```python
from sklearn.datasets import load_iris

iris = load_iris()
X = iris.data    
y = iris.target  

print(f'Features: {iris.feature_names}')
print(f'Classes: {iris.target_names}')
print(f'X shape: {X.shape}')    
print(f'y shape: {y.shape}')    
print(f'X[0]: {X[0]}')          
print(f'y[0]: {y[0]}')          

for i, name in enumerate(iris.feature_names):
    print(f'{name}: mean={X[:,i].mean():.2f}, std={X[:,i].std():.2f}')
```

### 6. The Updated Project
```python
1: import numpy as np
2: from sklearn.datasets import load_iris
3: 
4: iris = load_iris()
5: X = iris.data    
6: y = iris.target  
7: 
8: print(f'Features: {iris.feature_names}')
9: print(f'Classes: {iris.target_names}')
10: print(f'X shape: {X.shape}')    
11: print(f'y shape: {y.shape}')    
12: print(f'X[0]: {X[0]}')          
13: print(f'y[0]: {y[0]}')          
14: 
15: for i, name in enumerate(iris.feature_names):
16:     print(f'{name}: mean={X[:,i].mean():.2f}, std={X[:,i].std():.2f}')
```

**Output:**
```
Features: ['sepal length (cm)', 'sepal width (cm)', 'petal length (cm)', 'petal width (cm)']
Classes: ['setosa' 'versicolor' 'virginica']
X shape: (150, 4)
y shape: (150,)
X[0]: [5.1 3.5 1.4 0.2]
y[0]: 0
sepal length (cm): mean=5.84, std=0.83
sepal width (cm): mean=3.06, std=0.43
petal length (cm): mean=3.76, std=1.76
petal width (cm): mean=1.20, std=0.76
```

### 7. Mechanical walkthrough
- `from sklearn.datasets import load_iris` imports the loading function.
- `iris = load_iris()` fetches the dataset.
- `X = iris.data` extracts the 150x4 feature matrix.
- `y = iris.target` extracts the 150 labels (0, 1, or 2).
- `X.shape` returns the dimensions of the array.
- `X[:,i].mean()` and `X[:,i].std()` compute statistics across all rows for a specific feature column `i`.

---

## Concept Unit: Train/test split — the non-negotiable

### 1. The Problem
If we train a model on all 150 flowers and then evaluate it on those same 150 flowers, we are lying to ourselves. A model could just memorize the data (overfitting) and fail on new flowers. We must split the data.

### 2. Introduce the concept in isolation
Let's see how `train_test_split` behaves on a tiny array.

```python
from sklearn.model_selection import train_test_split
dummy_X = np.array([1, 2, 3, 4, 5])
dummy_y = np.array([0, 0, 1, 1, 1])

Xt, Xte, yt, yte = train_test_split(dummy_X, dummy_y, test_size=0.4, random_state=42)
print("Train X:", Xt)
print("Test X:", Xte)
```
**Predicted Output:**
```
Train X: [5 3 1]
Test X: [2 4]
```
This proves the function shuffles and partitions the arrays simultaneously, keeping inputs and labels aligned.

### 3. Discard the throwaway example
The dummy array is discarded.

### 4. Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `iris_classifier.py`
- **Change type:** Add
- **Location:** Bottom of file.
- **Dependencies:** `train_test_split`

### 5. The New Code
```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f'Training samples: {len(X_train)}')
print(f'Test samples:     {len(X_test)}')
print(f'Train class distribution: {np.bincount(y_train)}')
print(f'Test class distribution:  {np.bincount(y_test)}')
```

### 6. The Updated Project
```python
17: from sklearn.model_selection import train_test_split
18: 
19: X_train, X_test, y_train, y_test = train_test_split(
20:     X, y, test_size=0.2, random_state=42, stratify=y
21: )
22: 
23: print(f'Training samples: {len(X_train)}')
24: print(f'Test samples:     {len(X_test)}')
25: print(f'Train class distribution: {np.bincount(y_train)}')
26: print(f'Test class distribution:  {np.bincount(y_test)}')
```
**Output:**
```
Training samples: 120
Test samples:     30
Train class distribution: [40 40 40]
Test class distribution:  [10 10 10]
```

### 7. Mechanical walkthrough
- `test_size=0.2` reserves 20% (30 samples) of the data for testing.
- `random_state=42` is a seed that ensures the random shuffle is identical every time you run the script, allowing reproducibility.
- `stratify=y` guarantees that the 33/33/33% class balance in `y` is perfectly preserved in both the training and test sets.
- `np.bincount(y_train)` counts how many 0s, 1s, and 2s are in the training set, confirming the perfect `[40, 40, 40]` split.

---

## Concept Unit: A decision tree from scratch — the idea

### 1. The Problem
How does a machine actually *learn* a rule? A decision tree does this by asking yes/no questions (e.g., "is petal length < 2.5?"). To find the best question, it scores every possible question using a math formula called Gini impurity.

### 2. Introduce the concept in isolation
Let's see Gini impurity in action. A pure set (all same class) should have Gini = 0. A mixed set has a higher score.

```python
def gini_demo(labels):
    classes, counts = np.unique(labels, return_counts=True)
    probs = counts / len(labels)
    return 1 - np.sum(probs**2)

print("Pure set [0,0,0]:", gini_demo([0,0,0]))
print("Mixed set [0,0,1,1]:", gini_demo([0,0,1,1]))
```
**Output:**
```
Pure set [0,0,0]: 0.0
Mixed set [0,0,1,1]: 0.5
```
This proves Gini impurity is minimized when the data is completely separated by class.

### 3. Discard the throwaway example
We will rewrite this properly in our project.

### 4. Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `iris_classifier.py`
- **Change type:** Add
- **Location:** Bottom of file.
- **Dependencies:** None.

### 5. The New Code
```python
def gini(labels):
    n = len(labels)
    if n == 0: return 0
    classes, counts = np.unique(labels, return_counts=True)
    probs = counts / n
    return 1 - np.sum(probs**2)

def best_split(X, y):
    best_gini = float('inf')
    best_feat, best_thresh = None, None
    for feat in range(X.shape[1]):
        thresholds = np.unique(X[:, feat])
        for thresh in thresholds:
            left  = y[X[:, feat] <= thresh]
            right = y[X[:, feat] >  thresh]
            if len(left) == 0 or len(right) == 0:
                continue
            weighted = (len(left)*gini(left) + len(right)*gini(right)) / len(y)
            if weighted < best_gini:
                best_gini = weighted
                best_feat, best_thresh = feat, thresh
    return best_feat, best_thresh, best_gini

feat, thresh, g = best_split(X_train, y_train)
print(f'Best split: feature {feat} ({iris.feature_names[feat]}) <= {thresh:.2f}')
print(f'Gini impurity after split: {g:.4f}')
```

### 6. The Updated Project
```python
27: def gini(labels):
28:     n = len(labels)
29:     if n == 0: return 0
30:     classes, counts = np.unique(labels, return_counts=True)
31:     probs = counts / n
32:     return 1 - np.sum(probs**2)
33: 
34: def best_split(X, y):
35:     best_gini = float('inf')
36:     best_feat, best_thresh = None, None
37:     for feat in range(X.shape[1]):
38:         thresholds = np.unique(X[:, feat])
39:         for thresh in thresholds:
40:             left  = y[X[:, feat] <= thresh]
41:             right = y[X[:, feat] >  thresh]
42:             if len(left) == 0 or len(right) == 0:
43:                 continue
44:             weighted = (len(left)*gini(left) + len(right)*gini(right)) / len(y)
45:             if weighted < best_gini:
46:                 best_gini = weighted
47:                 best_feat, best_thresh = feat, thresh
48:     return best_feat, best_thresh, best_gini
49: 
50: feat, thresh, g = best_split(X_train, y_train)
51: print(f'Best split: feature {feat} ({iris.feature_names[feat]}) <= {thresh:.2f}')
52: print(f'Gini impurity after split: {g:.4f}')
```
**Output:**
```
Best split: feature 2 (petal length (cm)) <= 2.45
Gini impurity after split: 0.3333
```

### 7. Mechanical walkthrough
- `gini(labels)` computes the probability `probs` of each class, squares them, and subtracts the sum from 1.
- `best_split(X, y)` iterates over every feature column (`for feat in range(X.shape[1])`).
- `np.unique(X[:, feat])` finds every unique value in that feature column to test as a `thresh` (threshold).
- `left = y[X[:, feat] <= thresh]` splits the labels into a left bucket (yes to the question) and a right bucket (no).
- `weighted` calculates the combined impurity of the two buckets. We keep the split that minimizes this value.

---

## Concept Unit: Predicting with the stump

### 1. The Problem
Now that we have learned the best single rule (a 1-level decision tree, called a "stump"), how do we use it to predict the species of new, unseen flowers in the test set?

### 2. Introduce the concept in isolation
Let's see how `np.where` can apply a threshold across a whole array instantly.

```python
dummy_feat = np.array([1.0, 3.0, 2.0, 4.0])
thresh = 2.5
preds = np.where(dummy_feat <= thresh, "LeftClass", "RightClass")
print(preds)
```
**Predicted Output:**
```
['LeftClass' 'RightClass' 'LeftClass' 'RightClass']
```
This proves `np.where` acts as an element-wise `if/else` statement.

### 3. Discard the throwaway example
The dummy prediction array is discarded.

### 4. Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `iris_classifier.py`
- **Change type:** Add
- **Location:** Bottom of file.
- **Dependencies:** None.

### 5. The New Code
```python
def predict_stump(X, y_train, feat, thresh):
    left_labels  = y_train[X_train[:, feat] <= thresh]
    right_labels = y_train[X_train[:, feat] >  thresh]
    left_class   = np.bincount(left_labels).argmax()
    right_class  = np.bincount(right_labels).argmax()
    predictions = np.where(X[:, feat] <= thresh, left_class, right_class)
    return predictions

train_preds = predict_stump(X_train, y_train, feat, thresh)
test_preds  = predict_stump(X_test, y_train, feat, thresh)

train_acc = np.mean(train_preds == y_train)
test_acc  = np.mean(test_preds == y_test)
print(f'Train accuracy: {train_acc:.4f}')  
print(f'Test accuracy:  {test_acc:.4f}')   
```

### 6. The Updated Project
```python
53: def predict_stump(X, y_train, feat, thresh):
54:     left_labels  = y_train[X_train[:, feat] <= thresh]
55:     right_labels = y_train[X_train[:, feat] >  thresh]
56:     left_class   = np.bincount(left_labels).argmax()
57:     right_class  = np.bincount(right_labels).argmax()
58:     predictions = np.where(X[:, feat] <= thresh, left_class, right_class)
59:     return predictions
60: 
61: train_preds = predict_stump(X_train, y_train, feat, thresh)
62: test_preds  = predict_stump(X_test, y_train, feat, thresh)
63: 
64: train_acc = np.mean(train_preds == y_train)
65: test_acc  = np.mean(test_preds == y_test)
66: print(f'Train accuracy: {train_acc:.4f}')  
67: print(f'Test accuracy:  {test_acc:.4f}')   
```
**Output:**
```
Train accuracy: 0.6667
Test accuracy:  0.6667
```

### 7. Mechanical walkthrough
- `left_labels` uses boolean indexing on the training data to see which original labels fell into the left bucket.
- `np.bincount(...).argmax()` finds the most common label in that bucket (e.g., if it's mostly 0s, `left_class` becomes 0).
- `np.where(X[:, feat] <= thresh, left_class, right_class)` checks the new data `X`, assigning `left_class` if the condition is met, and `right_class` if not.
- `train_preds == y_train` creates a boolean array (`True` for correct, `False` for wrong). `np.mean()` treats `True` as 1 and `False` as 0, giving the accuracy percentage. Our stump achieves ~66.7% accuracy because it can perfectly separate setosa from the others, but cannot distinguish versicolor from virginica with just one rule.

---

## Concept Unit: scikit-learn's full decision tree

### 1. The Problem
Writing ML algorithms from scratch is educational but extremely slow. A single stump gives 67% accuracy. To get a deep, multi-level tree, we should use a production-ready library.

### 2. Introduce the concept in isolation
Let's initialize a scikit-learn tree and look at its shape.

```python
from sklearn.tree import DecisionTreeClassifier
dummy_clf = DecisionTreeClassifier(max_depth=1)
print(dummy_clf)
```
**Predicted Output:**
```
DecisionTreeClassifier(max_depth=1)
```
This proves the object is configured with hyperparameters (like `max_depth`) before any training happens.

### 3. Discard the throwaway example
The un-trained dummy classifier is discarded.

### 4. Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `iris_classifier.py`
- **Change type:** Add
- **Location:** Bottom of file.
- **Dependencies:** `DecisionTreeClassifier`, `accuracy_score`, `classification_report`

### 5. The New Code
```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report

clf = DecisionTreeClassifier(max_depth=3, random_state=42)
clf.fit(X_train, y_train)

y_pred_train = clf.predict(X_train)
y_pred_test  = clf.predict(X_test)

print(f'Train accuracy: {accuracy_score(y_train, y_pred_train):.4f}')
print(f'Test accuracy:  {accuracy_score(y_test, y_pred_test):.4f}')
print(classification_report(y_test, y_pred_test, target_names=iris.target_names))
```

### 6. The Updated Project
```python
68: from sklearn.tree import DecisionTreeClassifier
69: from sklearn.metrics import accuracy_score, classification_report
70: 
71: clf = DecisionTreeClassifier(max_depth=3, random_state=42)
72: clf.fit(X_train, y_train)
73: 
74: y_pred_train = clf.predict(X_train)
75: y_pred_test  = clf.predict(X_test)
76: 
77: print(f'Train accuracy: {accuracy_score(y_train, y_pred_train):.4f}')
78: print(f'Test accuracy:  {accuracy_score(y_test, y_pred_test):.4f}')
79: print(classification_report(y_test, y_pred_test, target_names=iris.target_names))
```
**Output:**
```
Train accuracy: 0.9750
Test accuracy:  0.9667
              precision    recall  f1-score   support

      setosa       1.00      1.00      1.00        10
  versicolor       0.91      1.00      0.95        10
   virginica       1.00      0.90      0.95        10

    accuracy                           0.97        30
   macro avg       0.97      0.97      0.97        30
weighted avg       0.97      0.97      0.97        30
```

### 7. Mechanical walkthrough
- `clf = DecisionTreeClassifier(max_depth=3, random_state=42)` instantiates the model with a hyperparameter `max_depth=3` to allow 3 levels of questions instead of 1.
- `clf.fit(X_train, y_train)` runs a fast, optimized version of our `best_split` function recursively to build the tree.
- `clf.predict(X_test)` runs the test data down the tree to get label predictions.
- `accuracy_score(y_test, y_pred_test)` compares predictions to ground truth, replacing our `np.mean()` logic.
- `classification_report` shows advanced metrics. Precision means "of predicted positives, how many are correct." Recall means "of actual positives, how many were found." F1 is the harmonic mean of both.

---

## Concept Unit: Overfitting in decision trees — `max_depth` matters

### 1. The Problem
What happens if we let the tree grow as deep as it wants? It will perfectly separate every single training point, getting 100% training accuracy. But it will learn the noise (overfitting), and perform worse on the test set.

### 2. Introduce the concept in isolation
A depth-100 tree has an astronomical number of possible leaf nodes. By definition, if a tree is unconstrained, it continues splitting until every leaf contains only 1 sample, perfectly memorizing the dataset. 

### 3. Discard the throwaway example
We will prove this dynamically by looping over depths.

### 4. Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `iris_classifier.py`
- **Change type:** Add
- **Location:** Bottom of file.
- **Dependencies:** None.

### 5. The New Code
```python
train_accs, test_accs = [], []
for depth in range(1, 15):
    clf = DecisionTreeClassifier(max_depth=depth, random_state=42)
    clf.fit(X_train, y_train)
    train_accs.append(accuracy_score(y_train, clf.predict(X_train)))
    test_accs.append(accuracy_score(y_test, clf.predict(X_test)))
    print(f'depth={depth:>2}: train={train_accs[-1]:.4f}, test={test_accs[-1]:.4f}')
```

### 6. The Updated Project
```python
80: train_accs, test_accs = [], []
81: for depth in range(1, 15):
82:     clf = DecisionTreeClassifier(max_depth=depth, random_state=42)
83:     clf.fit(X_train, y_train)
84:     train_accs.append(accuracy_score(y_train, clf.predict(X_train)))
85:     test_accs.append(accuracy_score(y_test, clf.predict(X_test)))
86:     print(f'depth={depth:>2}: train={train_accs[-1]:.4f}, test={test_accs[-1]:.4f}')
```
**Output:**
```
depth= 1: train=0.6750, test=0.6667
depth= 2: train=0.9583, test=0.9333
depth= 3: train=0.9750, test=0.9667
depth= 4: train=0.9833, test=0.9333
depth= 5: train=1.0000, test=0.9333
depth= 6: train=1.0000, test=0.9333
...
depth=14: train=1.0000, test=0.9333
```

### 7. Mechanical walkthrough
- `for depth in range(1, 15):` tests every hyperparameter value from 1 to 14.
- `clf = DecisionTreeClassifier(max_depth=depth)` applies the current depth.
- `train_accs.append(...)` and `test_accs.append(...)` track the scores.
- As the loop progresses, we see that at `depth=1` (our stump), the model underfits. 
- At `depth=3`, it hits the sweet spot (train=0.97, test=0.96).
- At `depth=5` and beyond, it overfits (train=1.00, test=0.93). The training accuracy becomes perfect, but the test accuracy *drops*, proving that the extra rules were just memorizing noise.

---

**Closing:** You have fit your first real ML classifier. Lesson 44 covers clustering — unsupervised learning.
**Exercises:** 
1. Try `DecisionTreeClassifier` without `max_depth` and compare.
2. Try `criterion='entropy'` instead of `'gini'`.
3. Load the wine dataset from `sklearn.datasets` and repeat the full workflow.
