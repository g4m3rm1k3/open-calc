# Lesson 46: Evaluating Models — Confusion Matrices, ROC, and Cross-Validation

**What you will build**
You will build a comprehensive model evaluation script that correctly diagnoses classifier performance. The transferable problems you will solve are: (1) accuracy is a MISLEADING metric on imbalanced datasets — a model that predicts the majority class always achieves high accuracy; (2) precision and recall are the right metrics for imbalanced problems; the F1 score balances them; (3) the ROC curve and AUC measure a model’s discriminative ability across ALL thresholds, not just the default 0.5.

**What you need to know first**
- Lesson 45 (and all prior lessons up to kNN)
- Supervised learning basics, classification, and the train-test split concept.

**Terms used in this lesson**
- **Confusion matrix** — A table used to describe the performance of a classification model. It exists to show exactly where a model is making errors (false positives vs false negatives), not just overall accuracy.
- **Accuracy** — The fraction of predictions a model got right. It exists as a simple baseline metric, but fails on imbalanced datasets because predicting the majority class yields high accuracy without actually learning anything useful.
- **Precision** — The fraction of positive predictions that were actually positive. It exists to measure a model's exactness and penalize false positives, which is critical when false alarms are costly (e.g., spam filtering).
- **Recall (Sensitivity)** — The fraction of actual positives that were correctly identified. It exists to measure a model's completeness and penalize false negatives, critical when missing a positive is dangerous (e.g., medical diagnosis).
- **F1 Score** — The harmonic mean of precision and recall. It exists to provide a single metric that balances both exactness and completeness, especially when dealing with imbalanced datasets.
- **ROC Curve (Receiver Operating Characteristic)** — A plot of the true positive rate against the false positive rate at various classification thresholds. It exists to evaluate a model's performance across all possible thresholds.
- **AUC (Area Under the Curve)** — The integral of the ROC curve. It exists to summarize the ROC curve into a single number between 0.0 and 1.0, representing discriminative ability.
- **Cross-validation** — A resampling procedure used to evaluate machine learning models on a limited data sample. It exists to ensure that performance metrics are not dependent on a single, lucky train-test split.
- **Stratification** — The process of rearranging the data so as to ensure that each fold is a good representative of the whole. It exists to maintain the original class proportions in every data split.

**Objects and methods used**

**`sklearn.metrics.confusion_matrix`**
- *What it is:* A function that computes the confusion matrix to evaluate the accuracy of a classification.
- *Implementation:* `confusion_matrix(y_true, y_pred, *, labels=None, sample_weight=None, normalize=None)`
- *Its use:* Used to get the exact counts of true positives, false positives, true negatives, and false negatives.
- *Type:* Free function.
- *Responsibility:* Calculates a multidimensional array (matrix) where row `i` represents actual class and column `j` represents predicted class.
- *Depends on:* True target values (`y_true`) and estimated targets as returned by a classifier (`y_pred`).
- *Connects to:* Called after model prediction; outputs a numpy ndarray that is often passed to visualization tools or parsed for specific metric counts.
- *Shape:* A utility function in the metrics module.

**`sklearn.metrics.accuracy_score`**
- *What it is:* A function that computes subset accuracy.
- *Implementation:* `accuracy_score(y_true, y_pred, *, normalize=True, sample_weight=None)`
- *Its use:* Used to demonstrate why simple accuracy fails on imbalanced datasets.
- *Type:* Free function.
- *Responsibility:* Returns the fraction of correctly classified samples.
- *Depends on:* Ground truth labels and predicted labels.
- *Connects to:* Evaluates output from `predict()`.
- *Shape:* Metric utility function.

**`sklearn.metrics.precision_score`**
- *What it is:* A function to compute the precision.
- *Implementation:* `precision_score(y_true, y_pred, *, labels=None, pos_label=1, average='binary', sample_weight=None)`
- *Its use:* Used to measure how many of the predicted positive cases were actually positive.
- *Type:* Free function.
- *Responsibility:* Calculates `tp / (tp + fp)`.
- *Depends on:* Ground truth and predictions.
- *Connects to:* Evaluates predictions for exactness.
- *Shape:* Metric utility function.

**`sklearn.metrics.recall_score`**
- *What it is:* A function to compute the recall.
- *Implementation:* `recall_score(y_true, y_pred, *, labels=None, pos_label=1, average='binary', sample_weight=None)`
- *Its use:* Used to measure how many of the actual positive cases were found.
- *Type:* Free function.
- *Responsibility:* Calculates `tp / (tp + fn)`.
- *Depends on:* Ground truth and predictions.
- *Connects to:* Evaluates predictions for completeness.
- *Shape:* Metric utility function.

**`sklearn.metrics.f1_score`**
- *What it is:* A function to compute the F1 score.
- *Implementation:* `f1_score(y_true, y_pred, *, labels=None, pos_label=1, average='binary', sample_weight=None)`
- *Its use:* Used to provide a balanced metric between precision and recall.
- *Type:* Free function.
- *Responsibility:* Calculates `2 * (precision * recall) / (precision + recall)`.
- *Depends on:* Ground truth and predictions.
- *Connects to:* Evaluates predictions holistically for imbalanced data.
- *Shape:* Metric utility function.

**`sklearn.metrics.classification_report`**
- *What it is:* A function that builds a text report showing the main classification metrics.
- *Implementation:* `classification_report(y_true, y_pred, *, target_names=None)`
- *Its use:* Used to quickly view precision, recall, and f1-score for all classes at once.
- *Type:* Free function.
- *Responsibility:* Formats a string report of metrics per class.
- *Depends on:* True and predicted labels.
- *Connects to:* Typically printed directly to standard output.
- *Shape:* Diagnostic utility function.

**`sklearn.metrics.roc_curve`**
- *What it is:* A function to compute Receiver operating characteristic (ROC) coordinates.
- *Implementation:* `roc_curve(y_true, y_score, *, pos_label=None, sample_weight=None, drop_intermediate=True)`
- *Its use:* Used to gather the FPR and TPR at various probability thresholds.
- *Type:* Free function.
- *Responsibility:* Returns false positive rates, true positive rates, and thresholds used.
- *Depends on:* Ground truth labels and target scores (probabilities).
- *Connects to:* Output is used to plot the ROC curve and compute AUC.
- *Shape:* Metric utility function.

**`sklearn.metrics.auc`**
- *What it is:* A function to compute Area Under the Curve (AUC) using the trapezoidal rule.
- *Implementation:* `auc(x, y)`
- *Its use:* Used to summarize the ROC curve into a single value.
- *Type:* Free function.
- *Responsibility:* Integrates the curve defined by `x` and `y`.
- *Depends on:* X and Y coordinates (e.g., FPR and TPR).
- *Connects to:* Consumes output from `roc_curve`.
- *Shape:* Mathematical utility function.

**`sklearn.tree.DecisionTreeClassifier.predict_proba`**
- *What it is:* A method that predicts class probabilities for the input samples.
- *Implementation:* `predict_proba(X)`
- *Its use:* Used to obtain the raw probability scores needed to plot an ROC curve, rather than the final thresholded predictions.
- *Type:* Instance method.
- *Responsibility:* Returns the probability of the sample for each class in the model.
- *Depends on:* An already fitted model and input features `X`.
- *Connects to:* Called on a trained estimator; output flows into `roc_curve`.
- *Shape:* Public API of a classifier object.

**`sklearn.model_selection.KFold`**
- *What it is:* A cross-validation generator that splits datasets into k consecutive folds.
- *Implementation:* `KFold(n_splits=5, *, shuffle=False, random_state=None)`
- *Its use:* Used to perform standard k-fold cross-validation.
- *Type:* Class.
- *Responsibility:* Yields indices to split data into training and test sets.
- *Depends on:* The number of splits requested.
- *Connects to:* Passed as the `cv` argument to evaluation routines.
- *Shape:* Data splitting strategy object.

**`sklearn.model_selection.StratifiedKFold`**
- *What it is:* A cross-validation generator that yields stratified folds.
- *Implementation:* `StratifiedKFold(n_splits=5, *, shuffle=False, random_state=None)`
- *Its use:* Used to ensure each fold has the same proportion of classes as the entire dataset.
- *Type:* Class.
- *Responsibility:* Yields indices for stratified splits.
- *Depends on:* The target variables `y` to determine class proportions.
- *Connects to:* Passed as the `cv` argument to evaluation routines.
- *Shape:* Data splitting strategy object.

**`sklearn.model_selection.cross_val_score`**
- *What it is:* A function to evaluate a score by cross-validation.
- *Implementation:* `cross_val_score(estimator, X, y=None, *, groups=None, scoring=None, cv=None)`
- *Its use:* Used to run the entire train/predict/score loop automatically across all CV folds.
- *Type:* Free function.
- *Responsibility:* Returns an array of scores of the estimator for each run of the cross validation.
- *Depends on:* An unfitted estimator, data, and a cross-validation splitting strategy.
- *Connects to:* Orchestrates the model training and evaluation process automatically.
- *Shape:* Evaluation workflow function.

**Everything else in the file, not this lesson's subject but still explained:**
- `matplotlib.pyplot.subplots`: `subplots(figsize=(7, 6))` creates a figure and a set of subplots. Used here to set up the ROC curve graph.
- `matplotlib.pyplot.plot`: `plot(x, y, ...)` plots y versus x as lines and/or markers. Used to draw the ROC curve.
- `numpy.trace`: `trace(a)` returns the sum along diagonals of the array. Used to manually calculate correct predictions from a confusion matrix.

---

## Concept Unit: The Confusion Matrix

### The Problem

If a model claims to be "95% accurate", what does that actually mean? Does it make mistakes evenly across all categories, or does it specifically fail on one crucial category? We need a way to look inside the aggregate "accuracy" number and see exactly *what kind* of mistakes the model is making.

If you have three classes, and the model guesses wrong, you want to know: did it mistake class A for class B, or class A for class C?

### Introduce the concept in isolation

This is called a **confusion matrix**. It is a table layout that allows visualization of the performance of an algorithm.

```python
from sklearn.metrics import confusion_matrix

# True labels for 5 samples
y_true_lab = [0, 1, 0, 1, 0]
# The model's predictions
y_pred_lab = [0, 0, 0, 1, 0]

cm_lab = confusion_matrix(y_true_lab, y_pred_lab)
print(cm_lab)
# Output:
# [[3 0]
#  [1 1]]
```

This output proves that out of 3 actual `0`s, all 3 were predicted as `0`. Out of 2 actual `1`s, 1 was predicted as `1`, but 1 was mistakenly predicted as `0`. The diagonal contains correct predictions.

### Discard the throwaway example

The dummy array example is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are starting our evaluation script.
- **Files affected**: Created `evaluate_models.py`.
- **Change type**: Add.
- **Location**: Top of the file.
- **Dependencies**: `scikit-learn`, `numpy`.

### The New Code

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import confusion_matrix
import numpy as np

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
)

clf = DecisionTreeClassifier(max_depth=3, random_state=42)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)

cm = confusion_matrix(y_test, y_pred)
print('Confusion matrix:')
print(cm)
print(f'\nAccuracy: {np.trace(cm)/cm.sum():.4f}')
```

### The Updated Project

```python
# 1: from sklearn.datasets import load_iris
# 2: from sklearn.model_selection import train_test_split
# 3: from sklearn.tree import DecisionTreeClassifier
# 4: from sklearn.metrics import confusion_matrix
# 5: import numpy as np
# 6: 
# 7: iris = load_iris()
# 8: X_train, X_test, y_train, y_test = train_test_split(
# 9:     iris.data, iris.target, test_size=0.2, random_state=42, stratify=iris.target
# 10: )
# 11: 
# 12: clf = DecisionTreeClassifier(max_depth=3, random_state=42)
# 13: clf.fit(X_train, y_train)
# 14: y_pred = clf.predict(X_test)
# 15: 
# 16: cm = confusion_matrix(y_test, y_pred) # ← new
# 17: print('Confusion matrix:')             # ← new
# 18: print(cm)                              # ← new
# 19: print(f'\nAccuracy: {np.trace(cm)/cm.sum():.4f}') # ← new
```

The script now trains a simple Decision Tree on the Iris dataset and computes its confusion matrix to evaluate its performance.

### Mechanical walkthrough

- `cm = confusion_matrix(y_test, y_pred)`: Calls the `confusion_matrix` function, passing the ground truth labels `y_test` and the model's predictions `y_pred`. It returns a 2D numpy array where row `i` and column `j` denotes the number of true instances of class `i` predicted as class `j`.
- `print(cm)`: Prints the matrix. For the Iris dataset (3 classes), this will be a 3x3 grid.
- `np.trace(cm)`: Computes the sum of the diagonal elements of the matrix. The diagonal represents all instances where the true label equals the predicted label (correct predictions).
- `cm.sum()`: Computes the sum of all elements in the matrix, which equals the total number of test samples.
- `np.trace(cm)/cm.sum()`: Divides the correct predictions by the total predictions, which is the exact mathematical definition of overall accuracy.

---

## Concept Unit: The Imbalanced Problem

### The Problem

What if a dataset has 99% legitimate transactions and 1% fraudulent ones? If a model simply hardcodes its prediction to *always* say "legitimate", what will its accuracy be? It will be 99% accurate, despite having learned absolutely nothing and being completely useless for fraud detection. Accuracy is a deeply misleading metric for imbalanced datasets.

### Introduce the concept in isolation

This is the **imbalanced data problem**.

```python
import numpy as np
from sklearn.metrics import accuracy_score, confusion_matrix

rng = np.random.RandomState(42)
y_true_imb = rng.choice([0, 1], size=1000, p=[0.99, 0.01])
y_naive = np.zeros(1000, dtype=int)

print(f'Naive accuracy: {accuracy_score(y_true_imb, y_naive):.4f}')
print(confusion_matrix(y_true_imb, y_naive))
# Output:
# Naive accuracy: 0.9900
# [[990   0]
#  [ 10   0]]
```

This output proves that a completely naive model achieves 99% accuracy while detecting exactly 0 fraud cases (represented by the `10` in the bottom-left, meaning 10 actual positive cases were incorrectly labeled as negative).

### Discard the throwaway example

The naive array generation is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `evaluate_models.py`.
- **Change type**: Add.
- **Location**: Appended to the bottom of the file.
- **Dependencies**: None.

### The New Code

```python
rng = np.random.RandomState(42)
y_true_fraud = rng.choice([0, 1], size=1000, p=[0.99, 0.01])
y_naive_fraud = np.zeros(1000, dtype=int)

print('\n--- Fraud Detection Simulation ---')
print(f'Naive accuracy: {accuracy_score(y_true_fraud, y_naive_fraud):.4f}')
print(f'Naive CM:\n{confusion_matrix(y_true_fraud, y_naive_fraud)}')
print('Naive recall for fraud: 0.0000') 
```

### The Updated Project

```python
# ...unchanged from above...
# 20: 
# 21: rng = np.random.RandomState(42) # ← new
# 22: y_true_fraud = rng.choice([0, 1], size=1000, p=[0.99, 0.01]) # ← new
# 23: y_naive_fraud = np.zeros(1000, dtype=int) # ← new
# 24: 
# 25: print('\n--- Fraud Detection Simulation ---') # ← new
# 26: print(f'Naive accuracy: {accuracy_score(y_true_fraud, y_naive_fraud):.4f}') # ← new
# 27: print(f'Naive CM:\n{confusion_matrix(y_true_fraud, y_naive_fraud)}') # ← new
# 28: print('Naive recall for fraud: 0.0000') # ← new
```

The script now demonstrates the failure of the accuracy metric on a simulated imbalanced dataset.

### Mechanical walkthrough

- `rng.choice([0, 1], size=1000, p=[0.99, 0.01])`: Generates an array of 1000 elements, randomly choosing `0` or `1`, with a 99% probability of `0` and a 1% probability of `1`. This simulates our imbalanced true labels.
- `np.zeros(1000, dtype=int)`: Generates an array of 1000 zeros. This simulates a "naive" model that predicts the negative class unconditionally.
- `accuracy_score(y_true_fraud, y_naive_fraud)`: Calculates the accuracy, which mathematically evaluates to 0.9900.
- `confusion_matrix(y_true_fraud, y_naive_fraud)`: Calculates the confusion matrix, highlighting that all `1`s (frauds) were predicted as `0`s (false negatives).
- `print('Naive recall for fraud: 0.0000')`: Hardcoded string emphasizing that despite the high accuracy, the model caught exactly 0 out of the 10 fraud cases.

---

## Concept Unit: Precision, Recall, and F1

### The Problem

If accuracy doesn't work for imbalanced datasets, what do we use instead? We need metrics that explicitly penalize the model for missing the minority class (false negatives) and for crying wolf (false positives).

### Introduce the concept in isolation

These metrics are **precision**, **recall**, and the **F1 score**. 

```python
def precision_recall_f1(y_true, y_pred, pos_label=1):
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == pos_label and p == pos_label)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t != pos_label and p == pos_label)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == pos_label and p != pos_label)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall    = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    return precision, recall, f1

y_true_ex = [1, 1, 1, 0, 0, 0, 0, 0, 1, 0]
y_pred_ex = [1, 1, 0, 0, 1, 0, 0, 0, 1, 0]
p, r, f = precision_recall_f1(y_true_ex, y_pred_ex)
print(f'{p:.4f}, {r:.4f}, {f:.4f}')
# Output:
# 0.7500, 0.7500, 0.7500
```

This output proves the manual calculation of these metrics based on true positives (TP), false positives (FP), and false negatives (FN). The harmonic mean (F1) balances both.

### Discard the throwaway example

The manual implementation is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `evaluate_models.py`.
- **Change type**: Add.
- **Location**: Appended to the bottom.
- **Dependencies**: None.

### The New Code

```python
from sklearn.metrics import precision_score, recall_score, f1_score, classification_report
from sklearn.datasets import load_breast_cancer

cancer = load_breast_cancer()
X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
    cancer.data, cancer.target, test_size=0.2, random_state=42
)
clf_c = DecisionTreeClassifier(max_depth=5, random_state=42)
clf_c.fit(X_train_c, y_train_c)
y_pred_c = clf_c.predict(X_test_c)

print('\n--- Breast Cancer Detection ---')
print(f'Precision: {precision_score(y_test_c, y_pred_c):.4f}')
print(f'Recall:    {recall_score(y_test_c, y_pred_c):.4f}')
print(f'F1:        {f1_score(y_test_c, y_pred_c):.4f}')
print('\nClassification Report:')
print(classification_report(y_test_c, y_pred_c, target_names=['malignant','benign']))
```

### The Updated Project

```python
# ...unchanged from above...
# 29: 
# 30: from sklearn.metrics import precision_score, recall_score, f1_score, classification_report # ← new
# 31: from sklearn.datasets import load_breast_cancer # ← new
# 32: 
# 33: cancer = load_breast_cancer() # ← new
# 34: X_train_c, X_test_c, y_train_c, y_test_c = train_test_split( # ← new
# 35:     cancer.data, cancer.target, test_size=0.2, random_state=42 # ← new
# 36: ) # ← new
# 37: clf_c = DecisionTreeClassifier(max_depth=5, random_state=42) # ← new
# 38: clf_c.fit(X_train_c, y_train_c) # ← new
# 39: y_pred_c = clf_c.predict(X_test_c) # ← new
# 40: 
# 41: print('\n--- Breast Cancer Detection ---') # ← new
# 42: print(f'Precision: {precision_score(y_test_c, y_pred_c):.4f}') # ← new
# 43: print(f'Recall:    {recall_score(y_test_c, y_pred_c):.4f}') # ← new
# 44: print(f'F1:        {f1_score(y_test_c, y_pred_c):.4f}') # ← new
# 45: print('\nClassification Report:') # ← new
# 46: print(classification_report(y_test_c, y_pred_c, target_names=['malignant','benign'])) # ← new
```

The script now applies the correct metrics (Precision, Recall, F1) to the real-world breast cancer dataset.

### Mechanical walkthrough

- `precision_score(y_test_c, y_pred_c)`: Calculates precision. Out of all the tumors the model claimed were benign (class 1), what fraction actually were benign?
- `recall_score(y_test_c, y_pred_c)`: Calculates recall. Out of all the truly benign tumors, what fraction did the model successfully find? (Note: in this dataset, 1 is benign, 0 is malignant. For cancer diagnosis, we often care more about the recall of the *malignant* class to avoid missing a diagnosis).
- `f1_score(y_test_c, y_pred_c)`: Computes the harmonic mean of the two values above.
- `classification_report(y_test_c, y_pred_c, target_names=...)`: Generates a string table that computes precision, recall, and f1 for *both* the malignant and benign classes independently, so you don't have to choose just one "positive" label.

---

## Concept Unit: ROC Curve and AUC

### The Problem

A classifier typically outputs a probability (e.g., "70% chance this is malignant"). By default, `predict()` uses a threshold of 50%: anything > 50% is positive, anything < 50% is negative. But what if we change that threshold to 10% to be extra safe and catch more cases? How do we evaluate the model's ability to rank items *regardless* of the arbitrary 50% threshold?

### Introduce the concept in isolation

This is done using the **ROC curve** and the **AUC** (Area Under the Curve).

```python
from sklearn.metrics import roc_curve, auc

y_true_roc = [0, 0, 1, 1]
y_scores_roc = [0.1, 0.4, 0.35, 0.8]

fpr_lab, tpr_lab, thresholds_lab = roc_curve(y_true_roc, y_scores_roc)
print(auc(fpr_lab, tpr_lab))
# Output:
# 0.75
```

This output proves that given raw probability scores, the `roc_curve` function calculates the false positive rates and true positive rates across all thresholds, and `auc` calculates the area. 1.0 is perfect, 0.5 is random guessing.

### Discard the throwaway example

The dummy array example is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `evaluate_models.py`.
- **Change type**: Add.
- **Location**: Appended to the bottom.
- **Dependencies**: `matplotlib.pyplot`.

### The New Code

```python
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt

y_scores = clf_c.predict_proba(X_test_c)[:, 1]

fpr, tpr, thresholds = roc_curve(y_test_c, y_scores)
roc_auc = auc(fpr, tpr)

fig, ax = plt.subplots(figsize=(7, 6))
ax.plot(fpr, tpr, 'b-', label=f'ROC curve (AUC = {roc_auc:.3f})')
ax.plot([0,1],[0,1],'k--', label='Random classifier (AUC=0.5)')
ax.set_xlabel('False Positive Rate')
ax.set_ylabel('True Positive Rate (Recall)')
ax.set_title('ROC Curve — Breast Cancer')
ax.legend()
plt.tight_layout()
plt.savefig('roc_curve.png')
plt.close()
print(f'\nAUC: {roc_auc:.4f}')
```

### The Updated Project

```python
# ...unchanged from above...
# 47: 
# 48: from sklearn.metrics import roc_curve, auc # ← new
# 49: import matplotlib.pyplot as plt # ← new
# 50: 
# 51: y_scores = clf_c.predict_proba(X_test_c)[:, 1] # ← new
# 52: 
# 53: fpr, tpr, thresholds = roc_curve(y_test_c, y_scores) # ← new
# 54: roc_auc = auc(fpr, tpr) # ← new
# 55: 
# 56: fig, ax = plt.subplots(figsize=(7, 6)) # ← new
# 57: ax.plot(fpr, tpr, 'b-', label=f'ROC curve (AUC = {roc_auc:.3f})') # ← new
# 58: ax.plot([0,1],[0,1],'k--', label='Random classifier (AUC=0.5)') # ← new
# 59: ax.set_xlabel('False Positive Rate') # ← new
# 60: ax.set_ylabel('True Positive Rate (Recall)') # ← new
# 61: ax.set_title('ROC Curve — Breast Cancer') # ← new
# 62: ax.legend() # ← new
# 63: plt.tight_layout() # ← new
# 64: plt.savefig('roc_curve.png') # ← new
# 65: plt.close() # ← new
# 66: print(f'\nAUC: {roc_auc:.4f}') # ← new
```

The script now extracts raw probabilities, calculates the ROC curve, calculates the AUC, and saves the plot to disk.

### Mechanical walkthrough

- `clf_c.predict_proba(X_test_c)`: Instead of `predict()`, which returns hard `0` or `1` classifications based on a 50% threshold, `predict_proba` returns an array of shape `(n_samples, n_classes)` containing the probabilities.
- `[:, 1]`: Slices the numpy array to get only the probabilities for class `1` (the positive class).
- `roc_curve(y_test_c, y_scores)`: Calculates the False Positive Rate (`fpr`), True Positive Rate (`tpr`), and the probability thresholds used to calculate those rates.
- `auc(fpr, tpr)`: Integrates the area under the curve formed by the `fpr` and `tpr` points.
- `plt.subplots(...)`, `ax.plot(...)`, `plt.savefig(...)`: Uses matplotlib to draw the ROC curve, plotting FPR on the X-axis and TPR on the Y-axis. The `k--` line represents a random classifier for baseline comparison.

---

## Concept Unit: Cross-Validation

### The Problem

We've been using a single train/test split. What if, by pure luck, the test set happens to contain only the easiest examples? Our metrics will look amazing, but the model will fail in production. How do we ensure our evaluation is stable and independent of a single lucky split?

### Introduce the concept in isolation

This is solved by **cross-validation**.

```python
from sklearn.model_selection import KFold
import numpy as np

X_dummy = np.array([1, 2, 3, 4, 5, 6])
kf = KFold(n_splits=3)

for train_index, test_index in kf.split(X_dummy):
    print(f"TRAIN: {train_index} TEST: {test_index}")
# Output:
# TRAIN: [2 3 4 5] TEST: [0 1]
# TRAIN: [0 1 4 5] TEST: [2 3]
# TRAIN: [0 1 2 3] TEST: [4 5]
```

This output proves that KFold cross-validation splits the data into multiple different train/test sets, ensuring that every single sample gets to be in the test set exactly once.

### Discard the throwaway example

The manual `KFold` dummy loop is deleted and will not appear in the project again.

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `evaluate_models.py`.
- **Change type**: Add.
- **Location**: Appended to the bottom.
- **Dependencies**: None.

### The New Code

```python
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_score

X, y = cancer.data, cancer.target
clf_cv = DecisionTreeClassifier(max_depth=5, random_state=42)

print('\n--- Cross-Validation ---')
for cv_name, cv_strategy in [
    ('5-Fold',           KFold(n_splits=5, shuffle=True, random_state=42)),
    ('Stratified 5-Fold', StratifiedKFold(n_splits=5, shuffle=True, random_state=42)),
    ('10-Fold',          KFold(n_splits=10, shuffle=True, random_state=42)),
]:
    scores = cross_val_score(clf_cv, X, y, cv=cv_strategy, scoring='f1')
    print(f'{cv_name}: mean F1={scores.mean():.4f} (+/- {scores.std():.4f})')
```

### The Updated Project

```python
# ...unchanged from above...
# 67: 
# 68: from sklearn.model_selection import KFold, StratifiedKFold, cross_val_score # ← new
# 69: 
# 70: X, y = cancer.data, cancer.target # ← new
# 71: clf_cv = DecisionTreeClassifier(max_depth=5, random_state=42) # ← new
# 72: 
# 73: print('\n--- Cross-Validation ---') # ← new
# 74: for cv_name, cv_strategy in [ # ← new
# 75:     ('5-Fold',           KFold(n_splits=5, shuffle=True, random_state=42)), # ← new
# 76:     ('Stratified 5-Fold', StratifiedKFold(n_splits=5, shuffle=True, random_state=42)), # ← new
# 77:     ('10-Fold',          KFold(n_splits=10, shuffle=True, random_state=42)), # ← new
# 78: ]: # ← new
# 79:     scores = cross_val_score(clf_cv, X, y, cv=cv_strategy, scoring='f1') # ← new
# 80:     print(f'{cv_name}: mean F1={scores.mean():.4f} (+/- {scores.std():.4f})') # ← new
```

The script now applies rigorous cross-validation to the dataset, reporting the mean and standard deviation of the F1 score across multiple folds.

### Mechanical walkthrough

- `KFold(n_splits=5, shuffle=True, random_state=42)`: Creates a cross-validation strategy that will divide the dataset into 5 equal parts. `shuffle=True` ensures the data is randomized before splitting.
- `StratifiedKFold(...)`: Creates a similar 5-split strategy, but ensures that the proportion of positive and negative classes is exactly preserved in every single fold. For classification, you should almost always use this over `KFold`.
- `cross_val_score(clf_cv, X, y, cv=cv_strategy, scoring='f1')`: Orchestrates the entire process. For the 5 folds provided by `cv_strategy`, it automatically takes 4 folds to train `clf_cv`, evaluates it on the remaining 1 test fold using the `f1` metric, and repeats this 5 times. It returns a numpy array of 5 scores.
- `scores.mean()`: Calculates the average F1 score across all folds.
- `scores.std()`: Calculates the standard deviation, showing how stable the model is. A high standard deviation means performance swings wildly depending on the split.

---

## Concept Unit: Model Comparison

### The Problem

Now that we have rigorous metrics (F1, AUC) and a rigorous validation strategy (Cross-validation), how do we actually use this to decide which algorithm to deploy?

### Introduce the concept in isolation

The concept is **model comparison using identical CV splits**. By passing the exact same `cv` object to different models, we ensure they are tested on the exact same train/test splits, providing an apples-to-apples comparison. We don't need a throwaway lab for this; the concept is purely structural and builds entirely on `cross_val_score` which was just demonstrated.

*(Note: Per the Verify/Isolation rule exemption: this is the structural application of the prior function, we proceed to project implementation.)*

### Project Change

- **Reference Source**: No reference counterpart.
- **Files affected**: `evaluate_models.py`.
- **Change type**: Add.
- **Location**: Appended to the bottom.
- **Dependencies**: `KNeighborsClassifier`, `LogisticRegression`, `Pipeline`, `StandardScaler`.

### The New Code

```python
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

cv_final = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

models = [
    ('Decision Tree', DecisionTreeClassifier(max_depth=5, random_state=42)),
    ('kNN (k=7)', Pipeline([('sc', StandardScaler()),
                            ('knn', KNeighborsClassifier(n_neighbors=7))])),
    ('Logistic Regression', Pipeline([('sc', StandardScaler()),
                                       ('lr', LogisticRegression(max_iter=1000))])),
]

print('\n--- Model Comparison ---')
for name, model in models:
    scores = cross_val_score(model, X, y, cv=cv_final, scoring='f1')
    print(f'{name:25s}: F1 = {scores.mean():.4f} (+/- {scores.std():.4f})')
```

### The Updated Project

```python
# ...unchanged from above...
# 81: 
# 82: from sklearn.neighbors import KNeighborsClassifier # ← new
# 83: from sklearn.linear_model import LogisticRegression # ← new
# 84: from sklearn.pipeline import Pipeline # ← new
# 85: from sklearn.preprocessing import StandardScaler # ← new
# 86: 
# 87: cv_final = StratifiedKFold(n_splits=5, shuffle=True, random_state=42) # ← new
# 88: 
# 89: models = [ # ← new
# 90:     ('Decision Tree', DecisionTreeClassifier(max_depth=5, random_state=42)), # ← new
# 91:     ('kNN (k=7)', Pipeline([('sc', StandardScaler()), # ← new
# 92:                             ('knn', KNeighborsClassifier(n_neighbors=7))])), # ← new
# 93:     ('Logistic Regression', Pipeline([('sc', StandardScaler()), # ← new
# 94:                                        ('lr', LogisticRegression(max_iter=1000))])), # ← new
# 95: ] # ← new
# 96: 
# 97: print('\n--- Model Comparison ---') # ← new
# 98: for name, model in models: # ← new
# 99:     scores = cross_val_score(model, X, y, cv=cv_final, scoring='f1') # ← new
# 100:     print(f'{name:25s}: F1 = {scores.mean():.4f} (+/- {scores.std():.4f})') # ← new
```

The script now benchmarks three different machine learning algorithms against each other fairly.

### Mechanical walkthrough

- `cv_final = StratifiedKFold(...)`: We create a single cross-validation splitting strategy object.
- `models = [...]`: We define a list of tuples containing a string name and an estimator object.
- `Pipeline([('sc', StandardScaler()), ('knn', KNeighborsClassifier(...))])`: For distance-based and gradient-based models like kNN and Logistic Regression, data must be scaled. We wrap the scaler and the model into a `Pipeline` object, which `scikit-learn` treats as a single estimator.
- `cross_val_score(model, X, y, cv=cv_final, scoring='f1')`: We loop over our models, passing the identical `cv_final` to every one of them. This ensures that in "Fold 1", all three models train on the exact same samples and are evaluated on the exact same samples.

---

You now have a complete model evaluation toolkit. The model with the best CV F1 score is the one you select for final deployment. 

**Next Lesson**: Lesson 47 is the capstone — a complete data science pipeline from raw data to a trained model. 

**Try It Yourself**: 
- Compare the three models on the Iris dataset instead of Breast Cancer.
- Compute and plot the precision-recall curve (not just ROC) for the imbalanced dataset.
- Implement your own confusion matrix computation function from scratch using loops.
