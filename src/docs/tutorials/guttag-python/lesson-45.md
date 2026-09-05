# Lesson 45: Classification — k-Nearest Neighbors from Scratch

What you will build: The reader implements k-Nearest Neighbors (kNN) from scratch: for a new point, find the k nearest training points, take a majority vote of their labels. They also implement feature normalization and leave-one-out cross-validation. The transferable insight: kNN is a non-parametric model: it stores the entire training set and makes decisions at prediction time. It has no 'training' phase (just memory). Prediction is O(n * d) where n=training size and d=features. Its weakness: slow at large scale; its strength: no assumptions about data distribution.

What you need to know first: Lessons 00-44.

## Terms used in this lesson

**k-Nearest Neighbors (kNN)** — A non-parametric classification algorithm that predicts the label of a new data point by finding the 'k' closest training examples and taking a majority vote among their labels. It has no separate training phase; it stores the dataset and computes distances at prediction time.

**Euclidean distance** — The straight-line distance between two points in Euclidean space, computed as the square root of the sum of squared differences of their coordinates. It is used here to measure how "close" two data points are.

**Non-parametric model** — A machine learning model that makes no strong assumptions about the form of the mapping function, typically growing in complexity with the size of the dataset. kNN is non-parametric because it just memorizes the data.

**Feature normalization** — The process of scaling individual features to have a similar range (often [0, 1]). Without normalization, features with large numerical ranges will incorrectly dominate distance calculations.

**Leave-one-out cross-validation** — An evaluation technique where each point in the dataset is used once as a test set while all other points serve as the training set, maximizing the data used for training in small datasets.

## Objects and methods used

**`math.sqrt`**
- *What it is:* A mathematical function from the Python standard library that computes the square root.
- *Implementation:* `def sqrt(x: float) -> float:`
- *Its use:* To finalize the Euclidean distance calculation after summing the squared differences.
- *Type:* Standard library function.
- *Responsibility:* Returns the non-negative square root of a given number.
- *Depends on:* A single numeric argument (x >= 0).
- *Connects to:* Called by our distance function, returns a float to the caller.
- *Shape:* Internal implementation detail for calculating distance.

**`sum`**
- *What it is:* A built-in Python function that adds up the items of an iterable.
- *Implementation:* `def sum(iterable, /, start=0):`
- *Its use:* To add up the squared differences of all coordinates between two points.
- *Type:* Built-in function.
- *Responsibility:* Aggregates values into a single sum.
- *Depends on:* An iterable yielding numeric values.
- *Connects to:* Called within `euclidean_distance`, consuming a generator expression.
- *Shape:* Internal helper for arithmetic.

**`zip`**
- *What it is:* A built-in Python function that iterates over several iterables in parallel, producing tuples.
- *Implementation:* `class zip(iter1 [,iter2 [...]])`
- *Its use:* To pair up the corresponding coordinates of two n-dimensional points so their difference can be calculated.
- *Type:* Built-in class / iterator.
- *Responsibility:* Aggregates elements from each of the iterables into tuples.
- *Depends on:* One or more iterable arguments.
- *Connects to:* Provides paired elements to a list comprehension or generator expression.
- *Shape:* Data transformation utility.

**`list.sort`**
- *What it is:* A built-in method of Python lists that sorts the list in place.
- *Implementation:* `def sort(self, *, key=None, reverse=False):`
- *Its use:* To order the list of distance-label pairs from shortest distance to longest.
- *Type:* Instance method.
- *Responsibility:* Sorts the items of the list in place, optionally using a custom `key` function.
- *Depends on:* The list instance; optionally a `key` function to extract a comparison key from each element.
- *Connects to:* Mutates the list it is called on.
- *Shape:* Core algorithm step (sorting distances).

**`collections.Counter.most_common`**
- *What it is:* A method of the `Counter` class that returns a list of the n most common elements and their counts.
- *Implementation:* `def most_common(self, n=None):`
- *Its use:* To find the label that appears most frequently among the k nearest neighbors.
- *Type:* Instance method.
- *Responsibility:* Returns a sorted list of the most frequent items in the Counter.
- *Depends on:* The `Counter` instance being populated with iterable data; an integer `n`.
- *Connects to:* Called on a Counter initialized with labels, returning a list of `(element, count)` tuples.
- *Shape:* Core algorithm step (majority voting).

**`random.seed`**
- *What it is:* A standard library function that initializes the internal state of the random number generator.
- *Implementation:* `def seed(a=None, version=2):`
- *Its use:* To ensure our synthetic cluster generation is reproducible across runs.
- *Type:* Standard library function.
- *Responsibility:* Seeds the PRNG to generate deterministic random sequences.
- *Depends on:* An integer or hashable object `a`.
- *Connects to:* Sets global random state for subsequent `random` module calls.
- *Shape:* Test setup utility.

**`random.gauss`**
- *What it is:* A standard library function generating Gaussian (normal) distributed random numbers.
- *Implementation:* `def gauss(mu, sigma):`
- *Its use:* To add noise to points around a central cluster center.
- *Type:* Standard library function.
- *Responsibility:* Returns a random float from a Gaussian distribution with mean `mu` and standard deviation `sigma`.
- *Depends on:* Numeric mean `mu` and standard deviation `sigma`.
- *Connects to:* Called repeatedly in a list comprehension to build synthetic datasets.
- *Shape:* Data generation utility.

**`min`** and **`max`**
- *What it is:* Built-in functions that find the smallest or largest item in an iterable.
- *Implementation:* `def min(iterable, *[, default, key])` and `def max(iterable, *[, default, key])`
- *Its use:* To find the bounds of a feature for min-max normalization.
- *Type:* Built-in functions.
- *Responsibility:* Return the minimum or maximum element from an iterable.
- *Depends on:* An iterable of comparable items.
- *Connects to:* Evaluates over each feature's column in the dataset.
- *Shape:* Core algorithm step (calculating ranges for scaling).

---

## Concept Unit: kNN classification from scratch

### The Problem
How can we classify a new data point based on existing data without fitting a mathematical curve? Given a set of points with known labels in a 2D space, what would be the most intuitive way to decide the label of a new, unknown point? How might looking at its closest neighbors help?

### Introduce the concept in isolation
We will use **k-Nearest Neighbors (kNN)**, a non-parametric model. Let's see how distance and majority vote work in isolation.

```python
import math
from collections import Counter

# Calculate distance between [1, 1] and [4, 5]
# delta_x = 3, delta_y = 4. Distance = sqrt(3^2 + 4^2) = 5.0
dist = math.sqrt(sum((ai - bi)**2 for ai, bi in zip([1, 1], [4, 5])))
print(f"Distance: {dist}")

# Majority vote among 3 neighbors
labels = ['A', 'A', 'B']
vote = Counter(labels).most_common(1)[0][0]
print(f"Vote: {vote}")
```
*Predicted confidently: Distance: 5.0, Vote: A.*
This proves that we can easily compute the straight-line Euclidean distance between two points, and we can extract the most frequent label from a list using `Counter`.

### Discard the throwaway
This throwaway code is discarded and will not be used in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are building a fundamental machine learning algorithm without a library.
- **Files affected**: `classifier.py` (created)
- **Change type**: add
- **Location**: Top of file
- **Dependencies**: None.

### The New Code
```python
import math
from collections import Counter

def euclidean_distance(a, b):
    return math.sqrt(sum((ai - bi)**2 for ai, bi in zip(a, b)))

def knn_predict(X_train, y_train, x_new, k):
    '''Classify x_new using k nearest neighbors from X_train.'''
    # Step 1: compute distance from x_new to every training point
    distances = [(euclidean_distance(x_new, X_train[i]), y_train[i])
                 for i in range(len(X_train))]
    # Step 2: sort by distance, take k nearest
    distances.sort(key=lambda pair: pair[0])
    k_nearest = distances[:k]
    # Step 3: majority vote among k nearest labels
    labels = [label for _, label in k_nearest]
    vote = Counter(labels).most_common(1)[0][0]
    return vote

X_train = [[1,1],[1,2],[2,1],[5,5],[5,6],[6,5]]
y_train = ['A','A','A','B','B','B']

for x_new in [[2,2],[3,3],[4,4],[5,4]]:
    pred = knn_predict(X_train, y_train, x_new, k=3)
    print(f'kNN(k=3) predict {x_new} -> {pred}')
```

### The Updated Project
```python
1: import math
2: from collections import Counter
3: 
4: def euclidean_distance(a, b):
5:     return math.sqrt(sum((ai - bi)**2 for ai, bi in zip(a, b)))
6: 
7: def knn_predict(X_train, y_train, x_new, k):
8:     '''Classify x_new using k nearest neighbors from X_train.'''
9:     # Step 1: compute distance from x_new to every training point
10:     distances = [(euclidean_distance(x_new, X_train[i]), y_train[i])
11:                  for i in range(len(X_train))]
12:     # Step 2: sort by distance, take k nearest
13:     distances.sort(key=lambda pair: pair[0])
14:     k_nearest = distances[:k]
15:     # Step 3: majority vote among k nearest labels
16:     labels = [label for _, label in k_nearest]
17:     vote = Counter(labels).most_common(1)[0][0]
18:     return vote
19: 
20: X_train = [[1,1],[1,2],[2,1],[5,5],[5,6],[6,5]]
21: y_train = ['A','A','A','B','B','B']
22: 
23: for x_new in [[2,2],[3,3],[4,4],[5,4]]:
24:     pred = knn_predict(X_train, y_train, x_new, k=3)
25:     print(f'kNN(k=3) predict {x_new} -> {pred}')
```
This module defines the full nearest neighbors classification pipeline: calculating distances, sorting them, and voting.

### Mechanical walkthrough
- `import math` — brings in mathematical functions, specifically `math.sqrt`.
- `from collections import Counter` — imports the `Counter` class for tallying items.
- `def euclidean_distance(a, b):` — defines a function taking two equal-length numeric lists.
- `zip(a, b)` — pairs up the coordinates from lists `a` and `b`.
- `(ai - bi)**2` — calculates the squared difference for each pair.
- `sum(...)` — adds all the squared differences together.
- `math.sqrt(...)` — takes the square root of the sum to get the final Euclidean distance.
- `distances = [...]` — builds a list comprehension of tuples pairing each point's distance with its label.
- `distances.sort(key=lambda pair: pair[0])` — sorts the list of tuples in-place using the distance (the first element of the tuple) as the key.
- `distances[:k]` — slices the first `k` elements, which are the closest ones.
- `labels = [label for _, label in k_nearest]` — extracts just the labels from those nearest neighbor tuples.
- `Counter(labels)` — creates a dictionary-like tally of the labels.
- `.most_common(1)` — returns a list of the 1 most frequent element, in the format `[(label, count)]`.
- `[0][0]` — extracts the first tuple from that list, and then the first item of that tuple (the label string itself).
- `return vote` — returns the majority label as the final prediction.

### CS lens
The **k-Nearest Neighbors (kNN)** algorithm is an example of instance-based learning. Instead of building a generalized mathematical model from the data (like a regression line), it simply stores the data and defers computation until prediction time. Real-world appearances:
- Recommendation systems finding "users similar to you".
- Image recognition matching feature vectors against a database of known images.
- Anomaly detection spotting points that are unusually far from their neighbors.

### SE lens
Design principle: **Eager vs. Lazy Evaluation**. kNN is a "lazy" learner because it does zero work during training (it just stores the data `X_train`, `y_train`). The tradeoff is that training is instant `O(1)`, but prediction is expensive `O(n * d)` because it must scan the entire dataset for every new query. Eager models (like neural networks) take hours to train but milliseconds to predict.

### Commands needed
`python3 classifier.py`

### Run it
*Predicted confidently:*
```
kNN(k=3) predict [2, 2] -> A
kNN(k=3) predict [3, 3] -> A
kNN(k=3) predict [4, 4] -> B
kNN(k=3) predict [5, 4] -> B
```

### One sentence connecting to previous unit
Now that we can find nearest neighbors to predict labels, we need to understand how the choice of 'k' affects the shape of the decision boundary between classes.

---

## Concept Unit: Effect of k on the decision boundary

### The Problem
If `k=1`, the model listens to the single closest point; if `k` is the size of the whole dataset, it just picks the most common overall label. How does varying `k` change where the algorithm draws the line between "Class A" and "Class B"? How might a model perform if it listens too closely to individual noisy points?

### Introduce the concept in isolation
We will explore the **decision boundary** by writing a quick evaluation loop that measures accuracy for different values of `k`.

```python
# Throwaway evaluation logic
preds = ['A', 'A', 'B', 'A']
truths = ['A', 'A', 'B', 'B']
correct = sum(1 for p, t in zip(preds, truths) if p == t)
print(f"Accuracy: {correct / len(preds)}")
```
*Predicted confidently: Accuracy: 0.75*
This proves we can evaluate how many predictions matched the ground truth by iterating through them and dividing by the total count.

### Discard the throwaway
This throwaway code is discarded and will not be used in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are analyzing hyperparameter behavior.
- **Files affected**: `classifier.py` (modified)
- **Change type**: add
- **Location**: Bottom of file
- **Dependencies**: The `knn_predict` function defined in the previous unit.

### The New Code
```python
def knn_accuracy(X_train, y_train, X_test, y_test, k):
    correct = sum(1 for i in range(len(X_test))
                  if knn_predict(X_train, y_train, X_test[i], k) == y_test[i])
    return correct / len(X_test)

import random
random.seed(42)

# Generate data: two Gaussian clusters
def make_cluster(center, n, noise=0.5, seed=0):
    random.seed(seed)
    return [[center[0] + random.gauss(0, noise),
             center[1] + random.gauss(0, noise)]
            for _ in range(n)]

cluster_A = make_cluster([1,1], 20, seed=0)
cluster_B = make_cluster([3,3], 20, seed=1)
X = cluster_A + cluster_B
y = ['A']*20 + ['B']*20

# Simple 80/20 split:
split = 32
X_tr, y_tr = X[:split], y[:split]
X_te, y_te = X[split:], y[split:]

for k in [1, 3, 5, 9, 15]:
    acc = knn_accuracy(X_tr, y_tr, X_te, y_te, k)
    print(f'k={k:2d}: accuracy={acc:.3f}')
```

### The Updated Project
```python
24:     pred = knn_predict(X_train, y_train, x_new, k=3)
25:     print(f'kNN(k=3) predict {x_new} -> {pred}')
26: 
27: # ← new
28: def knn_accuracy(X_train, y_train, X_test, y_test, k):
29:     correct = sum(1 for i in range(len(X_test))
30:                   if knn_predict(X_train, y_train, X_test[i], k) == y_test[i])
31:     return correct / len(X_test)
32: 
33: import random
34: random.seed(42)
35: 
36: def make_cluster(center, n, noise=0.5, seed=0):
37:     random.seed(seed)
38:     return [[center[0] + random.gauss(0, noise),
39:              center[1] + random.gauss(0, noise)]
40:             for _ in range(n)]
41: 
42: cluster_A = make_cluster([1,1], 20, seed=0)
43: cluster_B = make_cluster([3,3], 20, seed=1)
44: X = cluster_A + cluster_B
45: y = ['A']*20 + ['B']*20
46: 
47: split = 32
48: X_tr, y_tr = X[:split], y[:split]
49: X_te, y_te = X[split:], y[split:]
50: 
51: for k in [1, 3, 5, 9, 15]:
52:     acc = knn_accuracy(X_tr, y_tr, X_te, y_te, k)
53:     print(f'k={k:2d}: accuracy={acc:.3f}')
```
This adds functions to generate synthetic clustered data and evaluate the accuracy of the model on a holdout test set using different values of `k`.

### Mechanical walkthrough
- `def knn_accuracy(...)` — defines a function to test predictions against true labels.
- `sum(1 for i in range(len(X_test)) if ...)` — a generator expression that yields a `1` for every prediction that correctly matches the test label, and sums them up.
- `import random` — brings in Python's random number generator module.
- `random.seed(42)` — sets a global seed so runs are reproducible.
- `def make_cluster(...)` — creates a localized group of points.
- `random.gauss(0, noise)` — samples noise from a normal distribution centered at 0 with standard deviation `noise`.
- `X = cluster_A + cluster_B` — concatenates the lists of points.
- `y = ['A']*20 + ['B']*20` — creates a target label list matching the features list.
- `X[:split]` and `X[split:]` — slice the data into a training segment (first 32) and test segment (last 8).
- `for k in [1, 3, 5, 9, 15]:` — loops through a set of hyperparameter values for `k`.

### CS lens
The **Decision boundary** is the dividing line (or hypersurface) in the feature space where the model flips from predicting one class to another. k=1 creates a highly jagged boundary that perfectly surrounds every training point (overfitting noise). k=15 creates a smoother, more generalized boundary (but risks underfitting if details matter). Real-world applications:
- Tuning a spam filter to balance aggressive catching versus false positives.
- Edge detection thresholds in computer vision.
- Setting credit score cutoffs for loan approvals.

### SE lens
Design principle: **Hyperparameter Parameterization**. Instead of hardcoding `k=3` deep inside the predict loop, `k` is bubbled up as an explicit parameter. This allows testing harnesses to iterate over it without changing the core algorithm. The alternative (hardcoding it) prevents automated tuning.

### Commands needed
`python3 classifier.py`

### Run it
*Predicted confidently:*
```
k= 1: accuracy=0.875
k= 3: accuracy=1.000
k= 5: accuracy=1.000
k= 9: accuracy=1.000
k=15: accuracy=0.750
```

### One sentence connecting to previous unit
While our model successfully classifies points with similar scales, we must now fix what happens when one feature is measured in tiny numbers and another in massive ones.

---

## Concept Unit: Feature normalization — why distance metrics need it

### The Problem
If we use `euclidean_distance` on a dataset predicting student success based on "hours studied" (0 to 10) and "income" (0 to 100,000), a difference of 5 hours is dwarfed by a difference of 100 dollars. How do we prevent features with large numeric ranges from shouting down smaller, potentially more important features?

### Introduce the concept in isolation
We will use **Feature normalization** to squeeze every feature into a proportional range, specifically `[0, 1]`.

```python
# Scale 5 within a range of 2 to 9
val = 5
v_min, v_max = 2, 9
scaled = (val - v_min) / (v_max - v_min)
print(f"Scaled: {scaled:.3f}")
```
*Predicted confidently: Scaled: 0.429*
This proves that subtracting the minimum and dividing by the range scales any number linearly between 0 and 1 relative to its minimum and maximum bounds.

### Discard the throwaway
This throwaway code is discarded and will not be used in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating data preprocessing requirements.
- **Files affected**: `classifier.py` (modified)
- **Change type**: add
- **Location**: Bottom of file
- **Dependencies**: The `knn_predict` function.

### The New Code
```python
data = [
    {'hours': 2, 'income': 20000, 'label': 'fail'},
    {'hours': 8, 'income': 21000, 'label': 'pass'},
    {'hours': 3, 'income': 80000, 'label': 'fail'},
    {'hours': 9, 'income': 81000, 'label': 'pass'},
]

X_raw = [[d['hours'], d['income']] for d in data]
y = [d['label'] for d in data]
new_point_raw = [5, 50000]

pred_raw = knn_predict(X_raw, y, new_point_raw, k=2)
print(f'Without normalization: {pred_raw}')

def normalize(X):
    n_features = len(X[0])
    mins  = [min(X[i][f] for i in range(len(X))) for f in range(n_features)]
    maxs  = [max(X[i][f] for i in range(len(X))) for f in range(n_features)]
    ranges = [maxs[f] - mins[f] if maxs[f] != mins[f] else 1 for f in range(n_features)]
    return [[(X[i][f] - mins[f]) / ranges[f] for f in range(n_features)] for i in range(len(X))]

X_norm = normalize(X_raw)
new_norm = [(5 - 2)/(9-2), (50000-20000)/(81000-20000)]
pred_norm = knn_predict(X_norm, y, new_norm, k=2)
print(f'With normalization: {pred_norm}')
```

### The Updated Project
```python
51: for k in [1, 3, 5, 9, 15]:
52:     acc = knn_accuracy(X_tr, y_tr, X_te, y_te, k)
53:     print(f'k={k:2d}: accuracy={acc:.3f}')
54:
55: # ← new
56: data = [
57:     {'hours': 2, 'income': 20000, 'label': 'fail'},
58:     {'hours': 8, 'income': 21000, 'label': 'pass'},
59:     {'hours': 3, 'income': 80000, 'label': 'fail'},
60:     {'hours': 9, 'income': 81000, 'label': 'pass'},
61: ]
62: 
63: X_raw = [[d['hours'], d['income']] for d in data]
64: y = [d['label'] for d in data]
65: new_point_raw = [5, 50000]
66: 
67: pred_raw = knn_predict(X_raw, y, new_point_raw, k=2)
68: print(f'Without normalization: {pred_raw}')
69: 
70: def normalize(X):
71:     n_features = len(X[0])
72:     mins  = [min(X[i][f] for i in range(len(X))) for f in range(n_features)]
73:     maxs  = [max(X[i][f] for i in range(len(X))) for f in range(n_features)]
74:     ranges = [maxs[f] - mins[f] if maxs[f] != mins[f] else 1 for f in range(n_features)]
75:     return [[(X[i][f] - mins[f]) / ranges[f] for f in range(n_features)] for i in range(len(X))]
76: 
77: X_norm = normalize(X_raw)
78: new_norm = [(5 - 2)/(9-2), (50000-20000)/(81000-20000)]
79: pred_norm = knn_predict(X_norm, y, new_norm, k=2)
80: print(f'With normalization: {pred_norm}')
```
This adds a manual normalization pipeline that scales features into a `[0, 1]` range, ensuring large values don't drown out smaller ones during distance calculations.

### Mechanical walkthrough
- `X_raw = [[d['hours'], d['income']] for d in data]` — converts a list of dicts into a 2D list of features.
- `pred_raw = knn_predict(...)` — predicts the label using unscaled data, resulting in a distance computation completely dominated by income.
- `def normalize(X):` — defines a function to scale the dataset.
- `n_features = len(X[0])` — calculates the number of columns (features) based on the first row.
- `mins = [min(...) ...]` — extracts the minimum value for each column using a list comprehension over the rows.
- `maxs = [max(...) ...]` — extracts the maximum value for each column.
- `ranges = [maxs[f] - mins[f] ...]` — computes the difference between max and min, falling back to 1 to prevent division by zero.
- `(X[i][f] - mins[f]) / ranges[f]` — applies the min-max formula to scale the specific cell into a 0 to 1 range.
- `new_norm = [...]` — manually normalizes the single test point using the exact same logic.
- `pred_norm = knn_predict(...)` — makes a new prediction on the normalized dataset.

### CS lens
**Feature normalization** prevents dimension dominance. Because Euclidean distance uses squared differences, a difference of 10,000 becomes 100,000,000, completely overwriting a difference of 5 which becomes 25. Real-world applications:
- Adjusting raw sensor data (e.g. pressure in Pascals vs temperature in Celsius).
- Preparing image pixels (0-255) for neural networks (0-1).
- Transforming financial metrics where stock prices and trade volumes have wildly different scales.

### SE lens
Design principle: **Separation of Concerns**. We normalize the data outside of `knn_predict`. The algorithm should only care about finding neighbors; it shouldn't also be responsible for sanitizing or reshaping the input space. The tradeoff is the developer must manually remember to normalize new test points before passing them in.

### Commands needed
`python3 classifier.py`

### Run it
*Predicted confidently:*
```
Without normalization: fail
With normalization: pass
```

### One sentence connecting to previous unit
Now that we have balanced inputs, how can we test accuracy reliably when our dataset is too small to safely split off 20% for testing?

---

## Concept Unit: Leave-one-out cross-validation

### The Problem
If you only have 8 data points, a 20% test split means testing on less than 2 points, which is completely unreliable. How can we test a model's accuracy on small datasets without losing precious training examples?

### Introduce the concept in isolation
We will use **Leave-one-out cross-validation**, an evaluation technique that iteratively pulls exactly one point out to test, training on the rest.

```python
# Throwaway leave-one-out simulation
X_mock = ['p1', 'p2', 'p3']
for i in range(len(X_mock)):
    test = X_mock[i]
    train = [X_mock[j] for j in range(len(X_mock)) if j != i]
    print(f"Test: {test}, Train: {train}")
```
*Predicted confidently:*
```
Test: p1, Train: ['p2', 'p3']
Test: p2, Train: ['p1', 'p3']
Test: p3, Train: ['p1', 'p2']
```
This proves we can systematically exclude exactly one element via its index `i`, leaving all others for the training set, repeating until every point has been the test case once.

### Discard the throwaway
This throwaway code is discarded and will not be used in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are implementing a specific statistical testing method.
- **Files affected**: `classifier.py` (modified)
- **Change type**: add
- **Location**: Bottom of file
- **Dependencies**: The `knn_predict` function.

### The New Code
```python
def leave_one_out_cv(X, y, k):
    '''Test each point by training on all others, predicting it.
       Returns accuracy across all n folds.'''
    n = len(X)
    correct = 0
    for i in range(n):
        # Exclude point i from training
        X_train = [X[j] for j in range(n) if j != i]
        y_train = [y[j] for j in range(n) if j != i]
        # Predict point i
        pred = knn_predict(X_train, y_train, X[i], k)
        if pred == y[i]:
            correct += 1
    return correct / n

X = [[1,1],[1,2],[2,1],[2,2],[5,5],[5,6],[6,5],[6,6]]
y = ['A','A','A','A','B','B','B','B']

for k in [1, 3, 5]:
    cv_acc = leave_one_out_cv(X, y, k)
    print(f'k={k}: LOO-CV accuracy = {cv_acc:.3f}')
```

### The Updated Project
```python
80: print(f'With normalization: {pred_norm}')
81:
82: # ← new
83: def leave_one_out_cv(X, y, k):
84:     '''Test each point by training on all others, predicting it.
85:        Returns accuracy across all n folds.'''
86:     n = len(X)
87:     correct = 0
88:     for i in range(n):
89:         # Exclude point i from training
90:         X_train = [X[j] for j in range(n) if j != i]
91:         y_train = [y[j] for j in range(n) if j != i]
92:         # Predict point i
93:         pred = knn_predict(X_train, y_train, X[i], k)
94:         if pred == y[i]:
95:             correct += 1
96:     return correct / n
97: 
98: X = [[1,1],[1,2],[2,1],[2,2],[5,5],[5,6],[6,5],[6,6]]
99: y = ['A','A','A','A','B','B','B','B']
100: 
101: for k in [1, 3, 5]:
102:     cv_acc = leave_one_out_cv(X, y, k)
103:     print(f'k={k}: LOO-CV accuracy = {cv_acc:.3f}')
```
This adds a function to comprehensively test the model's accuracy on small datasets by using every single point as a test case once.

### Mechanical walkthrough
- `def leave_one_out_cv(X, y, k):` — defines the cross-validation function.
- `n = len(X)` — captures the total number of data points.
- `correct = 0` — initializes a counter for accurate predictions.
- `for i in range(n):` — loops once for every single point in the dataset.
- `X_train = [X[j] for j in range(n) if j != i]` — builds a new training list that includes every feature row except the `i`th one.
- `y_train = [y[j] for j in range(n) if j != i]` — builds a matching label list excluding the `i`th label.
- `pred = knn_predict(...)` — asks the model to predict the single left-out point `X[i]` using the rest of the data.
- `if pred == y[i]:` — checks if the predicted label matches the actual left-out label.
- `correct += 1` — increments the success count.
- `return correct / n` — calculates the final accuracy ratio over all `n` folds.

### CS lens
**Leave-one-out cross-validation** (LOO-CV) is the extreme end of k-fold cross-validation, where the number of folds equals the number of data points. It provides an unbiased estimate of model performance because it tests every single point, but it requires retraining the model `n` times. Real-world uses:
- Medical datasets with extremely low patient counts (e.g., rare diseases).
- Early-stage prototype datasets.
- Baseline robust accuracy metrics for deterministic models like kNN.

### SE lens
Design principle: **Deterministic Testing**. In typical machine learning, random 80/20 splits mean accuracy bounces around on every run unless you manage seeds carefully. LOO-CV is completely deterministic: for a given dataset and `k`, the accuracy is a strict mathematical certainty, making it highly reproducible in unit tests. The tradeoff is compute time: looping `n` times scales poorly for large datasets.

### Commands needed
`python3 classifier.py`

### Run it
*Predicted confidently:*
```
k=1: LOO-CV accuracy = 1.000
k=3: LOO-CV accuracy = 1.000
k=5: LOO-CV accuracy = 0.875
```

### One sentence connecting to previous unit
So far we have predicted discrete labels, but what if the target isn't a category like "A" or "pass", but a continuous number like a price or a temperature?

---

## Concept Unit: kNN for regression

### The Problem
If the training data points are prices, taking a "majority vote" of the 3 nearest prices doesn't make sense ($100.10, $100.12, $99.98 are all different values, so a vote ties 1-1-1). How can we modify our nearest-neighbor logic to predict a continuous numerical value instead of a category?

### Introduce the concept in isolation
Instead of voting, we will use an average for **Regression**. Let's mock a simple list of numerical values and average them.

```python
# Throwaway average simulation
nearest_values = [10.0, 12.0, 11.0]
avg = sum(nearest_values) / len(nearest_values)
print(f"Average: {avg}")
```
*Predicted confidently: Average: 11.0*
This proves that switching from a categorical tally to a simple mathematical mean transforms the final step into a continuous numerical prediction.

### Discard the throwaway
This throwaway code is discarded and will not be used in the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are pivoting the algorithm's objective type.
- **Files affected**: `classifier.py` (modified)
- **Change type**: add
- **Location**: Bottom of file
- **Dependencies**: The `euclidean_distance` function.

### The New Code
```python
def knn_regress(X_train, y_train, x_new, k):
    '''Predict continuous value by averaging k nearest neighbors' values.'''
    distances = [(euclidean_distance(x_new, X_train[i]), y_train[i])
                 for i in range(len(X_train))]
    distances.sort(key=lambda pair: pair[0])
    k_nearest_values = [val for _, val in distances[:k]]
    return sum(k_nearest_values) / len(k_nearest_values)

# Approximate f(x) = x^2 from noisy samples:
import random; random.seed(0)
X_train = [[x] for x in range(0, 20, 2)]
y_train = [x[0]**2 + random.gauss(0, 5) for x in X_train]

# Predict at x=7:
for k in [1, 3, 5]:
    pred = knn_regress(X_train, y_train, [7], k)
    print(f'k={k}: kNN-regression predict f(7)={pred:.2f}, true=49')
```

### The Updated Project
```python
103:     print(f'k={k}: LOO-CV accuracy = {cv_acc:.3f}')
104:
105: # ← new
106: def knn_regress(X_train, y_train, x_new, k):
107:     '''Predict continuous value by averaging k nearest neighbors' values.'''
108:     distances = [(euclidean_distance(x_new, X_train[i]), y_train[i])
109:                  for i in range(len(X_train))]
110:     distances.sort(key=lambda pair: pair[0])
111:     k_nearest_values = [val for _, val in distances[:k]]
112:     return sum(k_nearest_values) / len(k_nearest_values)
113: 
114: import random; random.seed(0)
115: X_train = [[x] for x in range(0, 20, 2)]
116: y_train = [x[0]**2 + random.gauss(0, 5) for x in X_train]
117: 
118: for k in [1, 3, 5]:
119:     pred = knn_regress(X_train, y_train, [7], k)
120:     print(f'k={k}: kNN-regression predict f(7)={pred:.2f}, true=49')
```
This adds a regression variant of the kNN algorithm, which computes distances exactly the same way but averages the final values instead of tallying them.

### Mechanical walkthrough
- `def knn_regress(...)` — defines the regression variant of our model.
- `distances = [...]` and `distances.sort(...)` — exactly mirrors the classification logic to find closest neighbors.
- `k_nearest_values = [val for _, val in distances[:k]]` — extracts the target values (not categories) of the `k` closest neighbors.
- `return sum(k_nearest_values) / len(k_nearest_values)` — computes and returns the arithmetic mean of those values.
- `X_train = [[x] for x in range(0, 20, 2)]` — generates a 1D training dataset: `[[0], [2], [4], ...]`.
- `y_train = [x[0]**2 + random.gauss(0, 5) ...]` — computes the target value as `x^2` but adds Gaussian noise to simulate messy real-world data.
- `pred = knn_regress(X_train, y_train, [7], k)` — asks the model to predict the value for a point (`x=7`) that isn't in the training set.

### CS lens
**Regression** is a supervised learning task where the output is a continuous number. kNN handles this beautifully by simply changing the final step. Because it takes a local average, kNN regression naturally creates a stepped, jagged prediction curve that follows the data closely, unlike linear regression which forces a straight line through everything. Real-world uses:
- Real estate algorithms estimating house prices based on comparable nearby homes.
- Weather forecasting based on historical days with similar atmospheric conditions.

### SE lens
Design principle: **Code Reuse vs. Duplication**. We duplicated the distance-sorting logic inside `knn_regress`. An alternative design would be extracting `get_nearest_neighbors()` into its own function, and having both `knn_predict` and `knn_regress` call it. The tradeoff: duplicating 3 lines of code keeps each function self-contained and easy to read top-to-bottom for a tutorial, whereas extracting it adds indirection. In a production library like `scikit-learn`, they share a common base class to prevent duplication.

### Commands needed
`python3 classifier.py`

### Run it
*Predicted confidently:*
```
k=1: kNN-regression predict f(7)=...
k=3: kNN-regression predict f(7)=...
k=5: kNN-regression predict f(7)=...
```
*(Exact values depend on noise generation, but approximate to 36, 67, and smooth averages.)*

### One sentence connecting to previous unit
With both classification and regression complete, we have built a fully functional memory-based learning module from scratch.

---

## Closing

### Connect the pieces
Let's trace what happens when we call `knn_predict([3,3], k=3)` on our initial 6-point training set `X_train = [[1,1],[1,2],[2,1],[5,5],[5,6],[6,5]]` with labels `['A','A','A','B','B','B']`:
1. **Compute distances:** The model compares `[3,3]` to every point in memory.
   - To `[1,1]`: `sqrt((3-1)^2 + (3-1)^2) = sqrt(8) = 2.83` -> A
   - To `[1,2]`: `sqrt((3-1)^2 + (3-2)^2) = sqrt(5) = 2.24` -> A
   - To `[2,1]`: `sqrt((3-2)^2 + (3-1)^2) = sqrt(5) = 2.24` -> A
   - To `[5,5]`: `sqrt((3-5)^2 + (3-5)^2) = sqrt(8) = 2.83` -> B
   - To `[5,6]`: `sqrt(13) = 3.61` -> B
   - To `[6,5]`: `sqrt(13) = 3.61` -> B
2. **Sort and slice:** It sorts these tuples by distance: `2.24(A), 2.24(A), 2.83(A), 2.83(B), 3.61(B), 3.61(B)`. It slices the top `k=3`: `[A, A, A]`.
3. **Vote:** `Counter` tallies `[A, A, A]`. The most common label is `A`.

This trace holds true whether we are validating with LOO-CV or scaling features first—the core logic remains a simple, non-parametric lookup and vote.
