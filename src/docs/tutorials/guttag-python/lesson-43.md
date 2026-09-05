# Lesson 43: Introduction to Machine Learning — What It Is and What It Isn't

What you will build:
The reader understands what machine learning IS: learning a function from labeled examples (supervised) or discovering structure in unlabeled data (unsupervised). They implement a nearest-centroid classifier from scratch in Python. No libraries. The transferable insight: machine learning does not 'think'. It finds the function f such that f(x) approximately equals y on the training data. Generalization (doing well on NEW data) is the entire challenge. Overfitting (doing well on training data, poorly on new data) is the central failure mode.

What you need to know first:
- Lessons 00-42.

Terms used in this lesson:
- **Rule-based programming** — Writing explicit if/then logic to solve a problem. It exists because some domains have clear, specifiable rules.
- **Machine learning** — Inferring rules from data pairs (input, output). It exists to solve problems where rules are too complex to write by hand.
- **Feature** — A measurable property of the input (x values). It exists to represent raw data as structured numbers a model can process.
- **Label** — The output category or number to predict (y values). It exists to give the model a target to learn from (in supervised learning).
- **Training set** — (feature, label) pairs used to learn. It exists to teach the model the underlying relationship.
- **Test set** — Held-out (feature, label) pairs. It exists to measure the model's generalization to unseen data.
- **Model** — The learned function `f(features) -> predicted_label`. It exists to make predictions on new data.
- **Feature vector** — One row of input data. It exists to group all features for a single example.
- **Centroid** — The mean position of a set of points. It exists to represent the "center" of a class in geometric space.
- **Euclidean distance** — The straight-line distance between two points. It exists to measure similarity (closer = more similar).
- **Generalization** — How well the model performs on data it has NOT seen. It exists because the goal is not memorizing the past, but predicting the future.
- **Overfitting** — The model learns training data TOO well and fails on new data. It exists as the primary failure mode of complex models.
- **Underfitting** — The model is too simple and fails even on training data. It exists when the model lacks capacity to learn the relationship.

Objects and methods used:

- **math.sqrt**
  - *What it is:* A mathematical function to calculate the square root of a number.
  - *Implementation:* A function in the `math` module taking one numeric argument and returning a float.
  - *Its use:* Used to calculate the Euclidean distance formula.
  - *Type:* Standard library function.
  - *Responsibility:* Computes the principal square root of a given non-negative number.
  - *Depends on:* The `math` module being imported and a non-negative numeric input.
  - *Connects to:* Called by `euclidean_distance`, returns a float value to the caller.
  - *Shape:* An internal implementation detail within a distance calculation function.

- **sum**
  - *What it is:* A built-in function to add items of an iterable.
  - *Implementation:* A built-in function taking an iterable and an optional start value.
  - *Its use:* Used to sum up the squared differences in Euclidean distance, and to sum coordinates for centroid calculation.
  - *Type:* Built-in function.
  - *Responsibility:* Calculates the total sum of a sequence of numbers.
  - *Depends on:* An iterable yielding numeric values.
  - *Connects to:* Called by math functions and list comprehensions, returns a numeric sum to the caller.
  - *Shape:* Core language feature used for data aggregation.

- **zip**
  - *What it is:* A built-in function that aggregates elements from two or more iterables.
  - *Implementation:* Returns an iterator of tuples, where the i-th tuple contains the i-th element from each of the argument iterables.
  - *Its use:* Used to pair up coordinates of two points for distance calculation, and to pair true and predicted labels for accuracy calculation.
  - *Type:* Built-in function.
  - *Responsibility:* Pairs up corresponding elements of multiple sequences into tuples.
  - *Depends on:* Two or more iterable inputs.
  - *Connects to:* Provides paired data to comprehensions or loops.
  - *Shape:* A functional data transformation tool.

- **random.seed**
  - *What it is:* A function to initialize the random number generator.
  - *Implementation:* A function in the `random` module taking an integer seed.
  - *Its use:* Used to ensure reproducible train/test splits.
  - *Type:* Standard library function.
  - *Responsibility:* Sets the starting state of the random number generator so random operations yield the exact same sequence.
  - *Depends on:* The `random` module and an integer seed.
  - *Connects to:* Affects subsequent calls to `random.shuffle`.
  - *Shape:* Global state configuration for reproducibility.

- **random.shuffle**
  - *What it is:* A function to shuffle a list in place.
  - *Implementation:* A function in the `random` module modifying a mutable sequence.
  - *Its use:* Used to randomize the order of data indices before splitting.
  - *Type:* Standard library function.
  - *Responsibility:* Randomizes the order of elements in a sequence.
  - *Depends on:* The `random` module and a mutable sequence (like a list).
  - *Connects to:* Modifies the list passed to it.
  - *Shape:* Data preparation utility.

- **collections.Counter**
  - *What it is:* A dict subclass for counting hashable objects.
  - *Implementation:* A class in the `collections` module.
  - *Its use:* Used to find the most common label in the underfitting demonstration.
  - *Type:* Standard library class.
  - *Responsibility:* Tallies the occurrences of elements in an iterable.
  - *Depends on:* The `collections` module and an iterable input.
  - *Connects to:* Passed an iterable, provides methods like `most_common()`.
  - *Shape:* Data summarization utility.

## Concept Unit: What machine learning is: learning from examples

### The Problem
How do we program a computer to solve a problem when the rules are too complicated to write down? What if we don't know the exact threshold between "cold" and "comfortable" temperatures, but we have a list of past examples? How can we make the computer figure out the rules from the examples?

### Introduce the concept in isolation
Here is a demonstration of the difference between traditional rule-based programming and machine learning. In rule-based programming, we write the exact `if` statements. In **machine learning**, we provide data pairs and let an algorithm infer the boundaries.

```python
# Traditional programming: you write the rules
def classify_temperature_rule_based(temp_celsius):
    if temp_celsius < 0:
        return 'freezing'
    elif temp_celsius < 15:
        return 'cold'
    elif temp_celsius < 25:
        return 'comfortable'
    else:
        return 'hot'

# Machine learning: learn the rules FROM DATA
# Training data: (input, correct_output) pairs
training_data = [
    (-10, 'freezing'), (-5, 'freezing'), (0, 'freezing'),
    (5, 'cold'),  (10, 'cold'),  (14, 'cold'),
    (18, 'comfortable'), (22, 'comfortable'), (24, 'comfortable'),
    (28, 'hot'), (32, 'hot'), (38, 'hot'),
]

# The ML system learns the threshold values from data, not from programmer
# If we got the data but not the rules, we could still make a classifier
for temp, label in training_data[:3]:
    print(f'temp={temp}: rule_based={classify_temperature_rule_based(temp)}, true={label}')
```

This output proves that the rule-based system correctly classifies the data because we explicitly wrote the thresholds. A machine learning approach would infer these thresholds directly from the `training_data` pairs without the `classify_temperature_rule_based` function.

### Discard the throwaway
This throwaway demonstration is discarded. It will not appear in the final project.

### Project Change
No reference counterpart — this is a from-scratch addition because we are starting a standalone theory lesson.
- Files affected: `classifier.py` (created)
- Change type: Add
- Location: Brand new file.
- Dependencies: None.

### The New Code
```python
# classifier.py
def classify_temperature_rule_based(temp_celsius):
    if temp_celsius < 0:
        return 'freezing'
    elif temp_celsius < 15:
        return 'cold'
    elif temp_celsius < 25:
        return 'comfortable'
    else:
        return 'hot'
```

### The Updated Project
```python
1 # classifier.py
2 def classify_temperature_rule_based(temp_celsius): # <- new
3     if temp_celsius < 0:                           # <- new
4         return 'freezing'                          # <- new
5     elif temp_celsius < 15:                        # <- new
6         return 'cold'                              # <- new
7     elif temp_celsius < 25:                        # <- new
8         return 'comfortable'                       # <- new
9     else:                                          # <- new
10        return 'hot'                               # <- new
```
We now have a file with a rule-based function representing the traditional approach to programming.

### Mechanical walkthrough
- `def classify_temperature_rule_based(temp_celsius):` defines a traditional function taking one argument.
- `if temp_celsius < 0:` checks an explicit, hardcoded threshold.
- `return 'freezing'` returns the explicit label.
- `elif temp_celsius < 15:` checks the next explicit threshold.
- `return 'cold'` returns the next label.
- `elif temp_celsius < 25:` checks the next explicit threshold.
- `return 'comfortable'` returns the label.
- `else:` provides the default case.
- `return 'hot'` returns the final label.

### CS lens
**Machine Learning Paradigm.** In computer science, this represents the shift from deduction (rules -> data -> answers) to induction (data -> answers -> rules). Real-world applications include spam filtering, image recognition, and language translation.

### SE lens
**Design Principle: Explicit Rules vs. Learned Models.** Writing explicit rules is deterministic and easy to debug. The alternative NOT chosen here is immediately using an ML model for a simple problem. The tradeoff: ML models are harder to interpret and debug, but they scale to problems where rules are impossible to write by hand (like vision).

### Commands needed
None for this unit.

### Run it
Predicted confidently: The function returns labels based on explicit thresholds.

### One sentence connecting to previous unit
We start with traditional programming as a baseline to understand what machine learning replaces.

## Concept Unit: Features and labels — the vocabulary of ML

### The Problem
How do we represent data so a computer can learn from it? How do we separate the information we know from the answer we want to predict?

### Introduce the concept in isolation
Here we demonstrate the vocabulary of **features and labels**. A feature is an input, and a label is the target output.

```python
# Example: predict study outcome from hours studied
training_features = [1, 2, 3, 4, 5, 6, 7, 8]
training_labels   = ['fail','fail','fail','pass','pass','pass','pass','pass']

# Feature matrix (multiple features per example):
students = [
    {'hours': 1, 'prev_score': 50},
    {'hours': 3, 'prev_score': 60},
    {'hours': 5, 'prev_score': 70},
    {'hours': 7, 'prev_score': 80},
]
for s in students:
    print(f'hours={s["hours"]}, prev={s["prev_score"]}')
```

This proves that complex data can be structured into arrays of features paired with a target outcome labels.

### Discard the throwaway
This throwaway data definition is discarded. It will not appear in the project.

### Project Change
- Files affected: `classifier.py`
- Change type: Add
- Location: Below the `classify_temperature_rule_based` function.
- Dependencies: None.

### The New Code
```python
training_data = [
    (-10, 'freezing'), (-5, 'freezing'), (0, 'freezing'),
    (5, 'cold'),  (10, 'cold'),  (14, 'cold'),
    (18, 'comfortable'), (22, 'comfortable'), (24, 'comfortable'),
    (28, 'hot'), (32, 'hot'), (38, 'hot'),
]
```

### The Updated Project
```python
10        return 'hot'
11
12 training_data = [                                                        # <- new
13     (-10, 'freezing'), (-5, 'freezing'), (0, 'freezing'),                # <- new
14     (5, 'cold'),  (10, 'cold'),  (14, 'cold'),                           # <- new
15     (18, 'comfortable'), (22, 'comfortable'), (24, 'comfortable'),       # <- new
16     (28, 'hot'), (32, 'hot'), (38, 'hot'),                               # <- new
17 ]                                                                        # <- new
```
We added structured training data, separating features (temperatures) from labels (categories).

### Mechanical walkthrough
- `training_data = [` assigns a new list to a variable.
- `(-10, 'freezing'),` creates a tuple where `-10` is the feature and `'freezing'` is the label.
- `(-5, 'freezing'),` adds another tuple with a feature and label.
- `(0, 'freezing'),` adds another tuple with a feature and label.
- `(5, 'cold'),` adds another tuple.
- `(10, 'cold'),` adds another tuple.
- `(14, 'cold'),` adds another tuple.
- `(18, 'comfortable'),` adds another tuple.
- `(22, 'comfortable'),` adds another tuple.
- `(24, 'comfortable'),` adds another tuple.
- `(28, 'hot'),` adds another tuple.
- `(32, 'hot'),` adds another tuple.
- `(38, 'hot'),` adds another tuple.
- `]` closes the list.

### CS lens
**Data Representation.** In computer science, abstract concepts must be encoded as quantifiable data structures. Real-world uses include encoding images as pixel matrices, audio as frequency arrays, and text as word embeddings.

### SE lens
**Design Principle: Separation of Data and Logic.** Here, data is stored separately from rules. The alternative NOT chosen is hardcoding data inside the function logic. The tradeoff: separating data makes the system flexible to new data, but requires building a mechanism to parse and use it.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The `training_data` variable simply holds a list of tuples.

### One sentence connecting to previous unit
Now that we have explicitly separated data into features and labels, we can build a mechanism to learn from it.

## Concept Unit: Nearest-centroid classifier from scratch

### The Problem
Given new data points, how do we classify them automatically? If we know the average position of each class, can we use distance to guess the label of a new point?

### Introduce the concept in isolation
We will build a **nearest-centroid classifier**. This calculates the mathematical center of each group and assigns new points to whichever center is closest.

```python
import math

def euclidean_distance(a, b):
    return math.sqrt(sum((ai - bi)**2 for ai, bi in zip(a, b)))

def train_nearest_centroid(X_train, y_train):
    classes = set(y_train)
    centroids = {}
    for cls in classes:
        class_points = [X_train[i] for i in range(len(y_train)) if y_train[i] == cls]
        n = len(class_points)
        n_features = len(class_points[0])
        centroid = [sum(p[f] for p in class_points) / n for f in range(n_features)]
        centroids[cls] = centroid
    return centroids

def predict_nearest_centroid(centroids, x):
    best_class = None
    best_dist = float('inf')
    for cls, centroid in centroids.items():
        d = euclidean_distance(x, centroid)
        if d < best_dist:
            best_dist = d
            best_class = cls
    return best_class

X_train = [[1,1],[1,2],[2,1],[5,5],[5,6],[6,5]]
y_train = ['A','A','A','B','B','B']

centroids = train_nearest_centroid(X_train, y_train)
print(f'Centroid A: {centroids["A"]}')
print(f'Centroid B: {centroids["B"]}')

for point in [[2,2],[4,4],[6,6]]:
    pred = predict_nearest_centroid(centroids, point)
    print(f'Point {point} -> class {pred}')
```

This run proves that by computing the center of known groups, we can accurately classify unknown points by finding their shortest distance to those centers.

### Discard the throwaway
This isolated throwaway code is discarded. We will rebuild it directly inside our project.

### Project Change
- Files affected: `classifier.py`
- Change type: Add
- Location: Top of file for imports, bottom for functions.
- Dependencies: `math` module.

### The New Code
```python
import math

def euclidean_distance(a, b):
    return math.sqrt(sum((ai - bi)**2 for ai, bi in zip(a, b)))

def train_nearest_centroid(X_train, y_train):
    classes = set(y_train)
    centroids = {}
    for cls in classes:
        class_points = [X_train[i] for i in range(len(y_train)) if y_train[i] == cls]
        n = len(class_points)
        n_features = len(class_points[0])
        centroid = [sum(p[f] for p in class_points) / n for f in range(n_features)]
        centroids[cls] = centroid
    return centroids

def predict_nearest_centroid(centroids, x):
    best_class = None
    best_dist = float('inf')
    for cls, centroid in centroids.items():
        d = euclidean_distance(x, centroid)
        if d < best_dist:
            best_dist = d
            best_class = cls
    return best_class
```

### The Updated Project
```python
1  import math                                                              # <- new
2
3  # classifier.py
...
17 ]
18 
19 def euclidean_distance(a, b):                                            # <- new
20     return math.sqrt(sum((ai - bi)**2 for ai, bi in zip(a, b)))          # <- new
21                                                                          # <- new
22 def train_nearest_centroid(X_train, y_train):                            # <- new
23     classes = set(y_train)                                               # <- new
24     centroids = {}                                                       # <- new
25     for cls in classes:                                                  # <- new
26         class_points = [X_train[i] for i in range(len(y_train)) if y_train[i] == cls] # <- new
27         n = len(class_points)                                            # <- new
28         n_features = len(class_points[0])                                # <- new
29         centroid = [sum(p[f] for p in class_points) / n for f in range(n_features)] # <- new
30         centroids[cls] = centroid                                        # <- new
31     return centroids                                                     # <- new
32                                                                          # <- new
33 def predict_nearest_centroid(centroids, x):                              # <- new
34     best_class = None                                                    # <- new
35     best_dist = float('inf')                                             # <- new
36     for cls, centroid in centroids.items():                              # <- new
37         d = euclidean_distance(x, centroid)                              # <- new
38         if d < best_dist:                                                # <- new
39             best_dist = d                                                # <- new
40             best_class = cls                                             # <- new
41     return best_class                                                    # <- new
```
We introduced the math import and the three core functions necessary to train a model and predict labels for new data based on geometric distance.

### Mechanical walkthrough
- `import math` imports the standard library math functions.
- `def euclidean_distance(a, b):` defines a function to compute distance between two vectors.
- `return math.sqrt(sum((ai - bi)**2 for ai, bi in zip(a, b)))` pairs coordinates with `zip`, computes squared differences, sums them, and takes the square root.
- `def train_nearest_centroid(X_train, y_train):` defines the training function mapping features to labels.
- `classes = set(y_train)` finds unique labels.
- `centroids = {}` initializes a dictionary for class centers.
- `for cls in classes:` iterates over each unique label.
- `class_points = [X_train[i] for i in range(len(y_train)) if y_train[i] == cls]` filters feature vectors matching the current label.
- `n = len(class_points)` gets the count of points in the class.
- `n_features = len(class_points[0])` gets the dimensionality of the vectors.
- `centroid = [sum(p[f] for p in class_points) / n for f in range(n_features)]` computes the mean coordinate across all dimensions.
- `centroids[cls] = centroid` stores the computed centroid.
- `return centroids` returns the model state.
- `def predict_nearest_centroid(centroids, x):` defines the prediction function.
- `best_class = None` starts with no prediction.
- `best_dist = float('inf')` starts with infinite distance.
- `for cls, centroid in centroids.items():` iterates through learned class centers.
- `d = euclidean_distance(x, centroid)` calculates distance to the center.
- `if d < best_dist:` checks if this is the closest center yet.
- `best_dist = d` updates the shortest distance.
- `best_class = cls` updates the predicted class.
- `return best_class` yields the final prediction.

### CS lens
**Geometric Representation.** In computer science, data items can be mapped into a high-dimensional space where similarity is quantified by geometric distance. Real-world applications include recommendation engines mapping user preferences and search engines comparing document relevance.

### SE lens
**Design Principle: Model State Independence.** The training function returns a standard dictionary rather than keeping state inside a class. The alternative NOT chosen is an Object-Oriented approach encapsulating the data. The tradeoff: pure functions returning plain data are extremely easy to test and serialize, but lack built-in boundaries for enforcing usage constraints.

### Commands needed
None for this unit.

### Run it
Predicted confidently: These functions correctly define a training and inference loop for a centroid-based classifier.

### One sentence connecting to previous unit
Now that our model can learn from data, we must figure out how to evaluate if its learning is actually correct on new data.

## Concept Unit: Train/test split and accuracy

### The Problem
If a model memorizes all the answers, it will look perfectly accurate on the data it has seen. How do we measure if the model has actually learned the underlying pattern instead of just memorizing the past?

### Introduce the concept in isolation
We introduce the **train/test split**. We hold back some data during training and use it exclusively for testing.

```python
import random

def train_test_split(X, y, test_size=0.2, seed=42):
    random.seed(seed)
    indices = list(range(len(X)))
    random.shuffle(indices)
    split = int(len(X) * (1 - test_size))
    train_idx = indices[:split]
    test_idx  = indices[split:]
    X_train = [X[i] for i in train_idx]
    y_train = [y[i] for i in train_idx]
    X_test  = [X[i] for i in test_idx]
    y_test  = [y[i] for i in test_idx]
    return X_train, X_test, y_train, y_test

def accuracy(y_true, y_pred):
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    return correct / len(y_true)

X = [[1,1],[1,2],[2,1],[2,2],[4,4],[5,5],[5,6],[6,5],[6,6],[5,4]]
y = ['A','A','A','A','B','B','B','B','B','B']
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3)
print(f"Train size: {len(X_tr)}, Test size: {len(X_te)}")
```

This execution proves that the data can be cleanly divided into two non-overlapping sets to fairly evaluate model performance.

### Discard the throwaway
This throwaway demonstration is discarded. It will not appear in the project.

### Project Change
- Files affected: `classifier.py`
- Change type: Add
- Location: Top for imports, bottom for functions.
- Dependencies: `random` module.

### The New Code
```python
import random

def train_test_split(X, y, test_size=0.2, seed=42):
    random.seed(seed)
    indices = list(range(len(X)))
    random.shuffle(indices)
    split = int(len(X) * (1 - test_size))
    train_idx = indices[:split]
    test_idx  = indices[split:]
    X_train = [X[i] for i in train_idx]
    y_train = [y[i] for i in train_idx]
    X_test  = [X[i] for i in test_idx]
    y_test  = [y[i] for i in test_idx]
    return X_train, X_test, y_train, y_test

def accuracy(y_true, y_pred):
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    return correct / len(y_true)
```

### The Updated Project
```python
2  import random                                                            # <- new
3 
...
42 
43 def train_test_split(X, y, test_size=0.2, seed=42):                      # <- new
44     random.seed(seed)                                                    # <- new
45     indices = list(range(len(X)))                                        # <- new
46     random.shuffle(indices)                                              # <- new
47     split = int(len(X) * (1 - test_size))                                # <- new
48     train_idx = indices[:split]                                          # <- new
49     test_idx  = indices[split:]                                          # <- new
50     X_train = [X[i] for i in train_idx]                                  # <- new
51     y_train = [y[i] for i in train_idx]                                  # <- new
52     X_test  = [X[i] for i in test_idx]                                   # <- new
53     y_test  = [y[i] for i in test_idx]                                   # <- new
54     return X_train, X_test, y_train, y_test                              # <- new
55                                                                          # <- new
56 def accuracy(y_true, y_pred):                                            # <- new
57     correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)           # <- new
58     return correct / len(y_true)                                         # <- new
```
We added functions to split the dataset and quantify the classifier's performance by checking correctness on held-out test data.

### Mechanical walkthrough
- `import random` imports the standard random number tools.
- `def train_test_split(X, y, test_size=0.2, seed=42):` defines a split function with defaults.
- `random.seed(seed)` fixes the random number generator so splits are reproducible.
- `indices = list(range(len(X)))` creates a list of all row indices.
- `random.shuffle(indices)` randomly reorders the indices in-place.
- `split = int(len(X) * (1 - test_size))` calculates the cutoff index for training.
- `train_idx = indices[:split]` gets the training indices.
- `test_idx = indices[split:]` gets the test indices.
- `X_train = [X[i] for i in train_idx]` selects training features.
- `y_train = [y[i] for i in train_idx]` selects training labels.
- `X_test = [X[i] for i in test_idx]` selects test features.
- `y_test = [y[i] for i in test_idx]` selects test labels.
- `return X_train, X_test, y_train, y_test` yields the four separated components.
- `def accuracy(y_true, y_pred):` defines a function to measure success rate.
- `correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)` counts how many predicted labels equal the true labels.
- `return correct / len(y_true)` calculates the ratio of correct predictions.

### CS lens
**Generalization vs Memorization.** In computer science, algorithms are often evaluated on their ability to generalize to unseen situations, not just on their performance on historical data. Real-world implementations include A/B testing web features or cross-validating statistical models.

### SE lens
**Design Principle: Determinism in Testing.** The use of a fixed random seed makes the data split reproducible. The alternative NOT chosen is fully random splits on every run. The tradeoff: fixed seeds allow for predictable test cases and debugging, but may hide performance variations that random splits would expose.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The functions cleanly partition arrays into non-overlapping groups and calculate percentages.

### One sentence connecting to previous unit
Testing generalization naturally leads us to the two main ways a machine learning model can fail.

## Concept Unit: Overfitting vs. underfitting

### The Problem
What happens when a model learns the training data perfectly but performs horribly on new data? Conversely, what if the model is so simple it fails to learn anything useful at all from the training data?

### Introduce the concept in isolation
We explore **overfitting** (memorization) and **underfitting** (over-simplification).

```python
# Overfitting: memorizing classifier
class MemorizingClassifier:
    def fit(self, X, y):
        self.memory = dict(zip(map(tuple, X), y))

    def predict(self, x):
        return self.memory.get(tuple(x), 'UNKNOWN')

mc = MemorizingClassifier()
X_tr = [[1,1],[2,2],[5,5]]
y_tr = ['A','A','B']
mc.fit(X_tr, y_tr)
print(mc.predict([1,1]))   # A (seen in training)
print(mc.predict([3,3]))   # UNKNOWN (not seen!)

# Underfitting: majority classifier
class MajorityClassifier:
    def fit(self, X, y):
        from collections import Counter
        self.majority = Counter(y).most_common(1)[0][0]

    def predict(self, x):
        return self.majority
```

This output proves that a memorizing classifier fails entirely on data it has never seen because it captures noise as rules (overfitting), whereas the majority classifier ignores data altogether and returns a single guess (underfitting).

### Discard the throwaway
This throwaway demonstration is discarded. It will not appear in the project.

### Project Change
- Files affected: `classifier.py`
- Change type: Add
- Location: Bottom of file.
- Dependencies: `collections.Counter` module.

### The New Code
```python
from collections import Counter

class MemorizingClassifier:
    def fit(self, X, y):
        self.memory = dict(zip(map(tuple, X), y))

    def predict(self, x):
        return self.memory.get(tuple(x), 'UNKNOWN')

class MajorityClassifier:
    def fit(self, X, y):
        self.majority = Counter(y).most_common(1)[0][0]

    def predict(self, x):
        return self.majority
```

### The Updated Project
```python
3  from collections import Counter                                          # <- new
...
59
60 class MemorizingClassifier:                                              # <- new
61     def fit(self, X, y):                                                 # <- new
62         self.memory = dict(zip(map(tuple, X), y))                        # <- new
63                                                                          # <- new
64     def predict(self, x):                                                # <- new
65         return self.memory.get(tuple(x), 'UNKNOWN')                      # <- new
66                                                                          # <- new
67 class MajorityClassifier:                                                # <- new
68     def fit(self, X, y):                                                 # <- new
69         self.majority = Counter(y).most_common(1)[0][0]                  # <- new
70                                                                          # <- new
71     def predict(self, x):                                                # <- new
72         return self.majority                                             # <- new
```
We added two extreme classifier examples to represent the boundary failure modes of machine learning: perfect memorization and complete simplification.

### Mechanical walkthrough
- `from collections import Counter` imports the counting utility.
- `class MemorizingClassifier:` begins the overfit class definition.
- `def fit(self, X, y):` defines the training method.
- `self.memory = dict(zip(map(tuple, X), y))` turns list features into hashable tuples and zips them into a dictionary with labels.
- `def predict(self, x):` defines the prediction method.
- `return self.memory.get(tuple(x), 'UNKNOWN')` performs an exact lookup, failing if the point wasn't perfectly memorized.
- `class MajorityClassifier:` begins the underfit class definition.
- `def fit(self, X, y):` defines the training method.
- `self.majority = Counter(y).most_common(1)[0][0]` counts label frequencies and stores only the most common one.
- `def predict(self, x):` defines the prediction method.
- `return self.majority` completely ignores the input features and always returns the majority guess.

### CS lens
**Bias-Variance Tradeoff.** In computer science, models balance bias (simplifying assumptions leading to underfitting) and variance (sensitivity to small data fluctuations leading to overfitting). Real-world applications manage this by using regularization, dropping out neural network nodes, or pruning decision trees.

### SE lens
**Design Principle: The Simplest Baseline.** The `MajorityClassifier` represents a dummy baseline. The alternative NOT chosen is comparing complex models only against each other. The tradeoff: dummy models provide a minimum performance floor for sanity-checking, but do not provide real business value on their own.

### Commands needed
None for this unit.

### Run it
Predicted confidently: The classifiers return either perfectly memorized exact matches or the single majority label.

### One sentence connecting to previous unit
Understanding how extreme models fail teaches us that the goal of machine learning is to find a model safely between memorizing the past and ignoring the data.

## Closing

### Connect the pieces
Let's trace classifying a new data point `[3,3]` using a nearest-centroid classifier through all the concept units we built today:
1. **Feature Extraction:** The raw input is quantified into a feature vector `[3, 3]`.
2. **Label Lookup:** The model separates known data into features and true labels to understand what categories exist.
3. **Centroid Computation:** The model groups the training vectors by their labels and calculates their geometric centers (centroids).
4. **Distance Comparison:** The `predict_nearest_centroid` function computes the Euclidean distance between `[3,3]` and each computed center, avoiding the trap of memorizing previous points (overfitting) or guessing blindly (underfitting).
5. **Generalization Check:** By holding out `[3,3]` in a test set, we calculate accuracy to prove that our model learned the real structure of the data and can predict entirely new scenarios.
