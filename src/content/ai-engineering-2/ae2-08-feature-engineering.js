const lesson = {
  id: 'ae2-08',
  slug: 'feature-engineering',
  chapter: 'ML Fundamentals',
  order: 7,
  title: 'Feature Engineering & Selection',
  subtitle: 'Transform raw data into signals that models can actually learn from',
  tags: ['feature-engineering', 'preprocessing', 'tfidf', 'encoding', 'feature-selection'],
  hook: {
    question: 'Why does feeding raw pixel values to a model often work worse than hand-crafted edge features?',
    realWorldContext: 'A house price model trained on raw square footage performs poorly — until you add log(sqft), price-per-sqft, and distance-to-downtown. Feature engineering routinely doubles model performance with the same algorithm.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      `Every feature you hand to a model is a question you are asking it to learn from. Raw data rarely asks the right questions. A salary column ranging from 20,000 to 2,000,000 drowns out a binary "has_degree" column — the model sees noise, not signal.`,
      `Numerical transforms fix scale mismatches. Min-max scaling compresses every feature to [0, 1]: x' = (x − min) / (max − min). Standardization shifts to zero mean and unit variance: x' = (x − μ) / σ. Use standardization by default; use min-max when you need hard bounds (e.g., pixel values for a neural network).`,
      `Log transform tames right-skewed distributions (income, views, followers). log(x + 1) maps a million-dollar outlier closer to the bulk of the data without losing it. Binning converts continuous values into ordinal categories — "age 0–17", "18–34", "35–64", "65+" — trading precision for robustness to outliers.`,
      `Categorical columns must become numbers. One-hot encoding creates a binary column per category: "red" → [1,0,0], "green" → [0,1,0], "blue" → [0,0,1]. Label encoding maps to integers (red=0, green=1, blue=2) — only use this for ordinal categories (small < medium < large) because the number implies order. Target encoding replaces a category with the mean of the target for that category. It is powerful but leaks information if you compute it on the full dataset before splitting — always fit target encoding on the training set only.`,
      `Text needs special treatment. TF-IDF (Term Frequency–Inverse Document Frequency) scores how distinctive a word is in a document relative to a corpus. TF(word, doc) = count of word in this doc / total words in this doc. IDF(word) = log(total_docs / docs_containing_word). A word like "the" appears everywhere → low IDF → near-zero score. A word like "photosynthesis" appears rarely → high IDF → high score when present.`,
      `Missing values have three fixes: (1) drop rows/columns if missingness is random and rare; (2) impute with mean or median (median is robust to outliers); (3) add an indicator column "was_missing" then impute — this preserves the signal that missingness itself carries.`,
      `Feature selection removes redundancy and noise. Correlated features (|r| > 0.9) say the same thing twice — keep one. Mutual information measures how much a feature reduces uncertainty about the target regardless of relationship shape. Variance threshold drops features that barely change (threshold = 0.01 means drop features with < 1% variance). Lasso (L1 regularization) drives unimportant feature weights to exactly zero, performing selection implicitly during training.`,
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Target Encoding Leakage',
        body: `If you compute target encoding statistics (mean, count) on the full dataset before splitting, test samples influence training statistics. This inflates validation scores. Always fit encoding transformers on the training split only, then apply to val/test.`,
      },
      {
        type: 'info',
        title: 'Prediction Moment',
        body: `Before reading on: a dataset has 1,000 rows of customer reviews (text) and a binary label "positive/negative". You want to use TF-IDF. What would be the IDF of the word "the" vs. the word "refund"? Predict: which gets a higher IDF score and why?`,
      },
      {
        type: 'info',
        title: 'Feature Engineering Pipeline Order',
        body: `Always apply transformations in this order: (1) split data first, (2) fit all transformers on training data only, (3) apply fitted transformers to val and test. Splitting after fitting is the #1 source of data leakage in student projects.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Feature Engineering Toolkit',
        mathBridge: `Min-max: x' = (x − min)/(max − min). Standardize: x' = (x − μ)/σ. TF-IDF: score = TF(w,d) × log(N/df(w)). One-hot: k categories → k binary columns. Lasso drives weights to zero via L1 penalty: λΣ|wⱼ|.`,
        caption: 'Build and compare numerical, categorical, text, and selection transforms from scratch.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Numerical & Categorical Transforms',
              prose: [
                `We implement the four core numerical transforms and both main categorical encoders. This shows exactly what scikit-learn's preprocessing classes do under the hood.`,
                `Min-max scaling: x' = (x − min) / (max − min). Every value ends up in [0, 1]. Standardization: x' = (x − μ) / σ. Mean becomes 0, std becomes 1. Log transform: log(x + 1). The +1 prevents log(0) for zero-valued entries.`,
                `One-hot encoding creates a binary column per category. For k unique values you get k columns — drop one to avoid perfect multicollinearity (the "dummy variable trap").`,
              ],
              code: `import numpy as np

# --- Numerical transforms ---
def min_max_scale(x):
    return (x - x.min()) / (x.max() - x.min())

def standardize(x):
    return (x - x.mean()) / x.std()

def log_transform(x):
    return np.log1p(x)  # log(x + 1)

def bin_values(x, bins):
    return np.digitize(x, bins)

# Salary data: right-skewed, large range
salaries = np.array([30000, 45000, 52000, 75000, 95000, 120000, 250000, 800000])
print("Raw:       ", salaries)
print("Min-max:   ", np.round(min_max_scale(salaries), 3))
print("Std:       ", np.round(standardize(salaries), 3))
print("Log:       ", np.round(log_transform(salaries), 2))
print("Binned:    ", bin_values(salaries, [40000, 80000, 150000]))

# --- One-hot encoding ---
def one_hot(categories):
    unique = sorted(set(categories))
    idx = {c: i for i, c in enumerate(unique)}
    matrix = np.zeros((len(categories), len(unique)), dtype=int)
    for row, cat in enumerate(categories):
        matrix[row, idx[cat]] = 1
    return matrix, unique

colors = ['red', 'blue', 'green', 'blue', 'red']
encoded, cols = one_hot(colors)
print("\\nOne-hot columns:", cols)
print(encoded)`,
            },
            {
              id: 2,
              cellTitle: 'TF-IDF Vectorizer from Scratch',
              prose: [
                `TF-IDF converts a list of text documents into a numeric matrix where each row is a document and each column is a word score.`,
                `TF(word, doc) = count(word in doc) / total_words(doc). This normalizes for document length. IDF(word) = log(N / df(word)) where N is total documents and df(word) is how many documents contain the word. Common words like "the" appear in nearly every document → df ≈ N → IDF ≈ 0. Rare, distinctive words → df ≪ N → high IDF.`,
                `The final score TF × IDF rewards words that are frequent in this document but rare overall — exactly the words that describe what this document is about.`,
              ],
              code: `import numpy as np
from collections import Counter
import math

def tfidf(docs):
    # Tokenize
    tokenized = [doc.lower().split() for doc in docs]
    vocab = sorted(set(w for doc in tokenized for w in doc))
    N = len(docs)

    # IDF: log(N / df)
    df = {w: sum(1 for doc in tokenized if w in doc) for w in vocab}
    idf = {w: math.log(N / df[w]) for w in vocab}

    # TF-IDF matrix
    matrix = np.zeros((N, len(vocab)))
    for i, doc in enumerate(tokenized):
        tf = Counter(doc)
        total = len(doc)
        for j, w in enumerate(vocab):
            matrix[i, j] = (tf[w] / total) * idf[w]
    return matrix, vocab

docs = [
    "the cat sat on the mat",
    "the dog barked at the cat",
    "machine learning is fun",
    "deep learning needs data and more data",
    "the cat learned tricks with data",
]

matrix, vocab = tfidf(docs)

# Show top-3 words per document
print("Top TF-IDF words per document:")
for i, doc in enumerate(docs):
    scores = matrix[i]
    top3 = sorted(zip(scores, vocab), reverse=True)[:3]
    print(f"  Doc {i+1}: {[w for _, w in top3]}")

# Show IDF values for interesting words
interesting = ['the', 'data', 'learning', 'cat']
from collections import Counter
tokenized = [d.lower().split() for d in docs]
for w in interesting:
    df_w = sum(1 for doc in tokenized if w in doc)
    idf_w = math.log(len(docs) / df_w)
    print(f"  IDF('{w}'): {idf_w:.3f}  (appears in {df_w}/{len(docs)} docs)")`,
            },
            {
              id: 3,
              cellTitle: 'Missing Values & Feature Selection',
              prose: [
                `Missing value imputation and feature selection are the two most impactful steps in a real data pipeline. We show all three missing-value strategies and three filter-based selection methods.`,
                `The indicator approach adds a binary "was_missing" column before imputing. This preserves the signal that the value was absent — in many datasets (e.g., medical records) missingness itself is highly predictive.`,
                `For feature selection: variance threshold drops near-constant features. Correlation filter removes one of any pair with |r| > 0.9. Mutual information ranks features by how much they reduce uncertainty about the label — it detects non-linear relationships that correlation misses.`,
              ],
              code: `import numpy as np
from itertools import combinations

rng = np.random.default_rng(42)
N = 200

# Dataset: age, income, wealth (correlated with income), noise, label
age    = rng.integers(20, 70, N).astype(float)
income = 20000 + age * 800 + rng.normal(0, 5000, N)
wealth = income * 5 + rng.normal(0, 10000, N)   # ~correlated with income
noise  = rng.normal(0, 1, N)
label  = (income > 60000).astype(int)

# Inject 15% missing values into income
missing_idx = rng.choice(N, size=int(0.15*N), replace=False)
income_raw = income.copy()
income_raw[missing_idx] = np.nan

# Strategy 1: drop rows with missing values
keep = ~np.isnan(income_raw)
print(f"Drop strategy: {keep.sum()} rows remain (lost {(~keep).sum()})")

# Strategy 2: median imputation
income_imputed = income_raw.copy()
median_val = np.nanmedian(income_raw)
income_imputed[np.isnan(income_imputed)] = median_val
print(f"Median imputation: filled {(~keep).sum()} values with {median_val:.0f}")

# Strategy 3: indicator + imputation
was_missing = np.isnan(income_raw).astype(float)
income_indicator = income_imputed.copy()

# --- Variance threshold ---
features = np.column_stack([age, income_imputed, wealth, noise, was_missing])
names = ['age', 'income', 'wealth', 'noise', 'was_missing']
variances = features.var(axis=0)
threshold = 0.01 * features.var(axis=0).mean()
kept = [n for n, v in zip(names, variances) if v > threshold]
print(f"\\nVariance threshold keeps: {kept}")

# --- Correlation filter ---
print("\\nHigh correlations (|r| > 0.7):")
for (i, a), (j, b) in combinations(enumerate(names), 2):
    r = np.corrcoef(features[:,i], features[:,j])[0,1]
    if abs(r) > 0.7:
        print(f"  {a} ↔ {b}: r = {r:.3f}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: `Implement target encoding with a train/test split to avoid leakage. Given categories and labels below, compute the target encoding (mean label per category) using ONLY the training portion, then apply it to the test set. Print train encodings and test-set encoded values. Also print what the "wrong" (leaky) version would give for the test set.`,
              starterCode: `import numpy as np

rng = np.random.default_rng(0)
N = 40
categories = rng.choice(['A', 'B', 'C', 'D'], size=N)
# Category A is mostly positive, D mostly negative
true_rates = {'A': 0.8, 'B': 0.6, 'C': 0.4, 'D': 0.2}
labels = np.array([int(rng.random() < true_rates[c]) for c in categories])

# Split: first 30 train, last 10 test
train_cats, test_cats = categories[:30], categories[30:]
train_labels, test_labels = labels[:30], labels[30:]

# TODO: compute target encoding on train only, apply to test
# TODO: also compute leaky encoding (using all N samples) and apply to test
# TODO: print results and compare`,
              hint: `For each unique category in train, compute mean(train_labels[train_cats == cat]). Store in a dict. Apply dict.get(cat, global_mean) to encode test categories — using global_mean as fallback for unseen categories.`,
              testCode: `# Check: target encoding dict should only use training data
# The leaky version will give slightly different test values`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'ae2-08-q1',
      type: 'choice',
      question: `A feature engineering step dramatically improved a model's cross-validation score. What is the most likely explanation?`,
      options: [
        'The transform added more data to the training set',
        'The transform made the signal more linearly separable or removed noise',
        'The transform reduced the number of model parameters',
        'The transform changed the learning rate',
      ],
      answer: 'The transform made the signal more linearly separable or removed noise',
      hints: ['Feature engineering changes the representation, not the amount of data or model structure.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-08-q2',
      type: 'choice',
      question: `You have a "city" column with 500 unique cities. Which encoding is most practical?`,
      options: [
        'One-hot encoding (500 binary columns)',
        'Label encoding (integer 0–499)',
        'Target encoding (mean label per city, fit on train only)',
        'Drop the column entirely',
      ],
      answer: 'Target encoding (mean label per city, fit on train only)',
      hints: ['One-hot at 500 categories creates a very sparse, high-dimensional matrix. Label encoding implies ordinal order.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-08-q3',
      type: 'choice',
      question: `Target encoding is computed on the full dataset (train + test) before splitting. Why is this a problem?`,
      options: [
        'It increases computational cost',
        'Test labels leak into training statistics, inflating validation scores',
        'It reduces model accuracy on training data',
        'It only works for binary classification',
      ],
      answer: 'Test labels leak into training statistics, inflating validation scores',
      hints: ['Think about what "mean label per category" uses — it uses the labels from ALL rows including test rows.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-08-q4',
      type: 'choice',
      question: `The word "the" appears in 490 out of 500 documents. What is its approximate IDF score?`,
      options: [
        'log(500/490) ≈ 0.02',
        'log(490/500) ≈ -0.02',
        '490/500 = 0.98',
        '500/490 ≈ 1.02',
      ],
      answer: 'log(500/490) ≈ 0.02',
      hints: ['IDF = log(N / df). N = 500, df = 490. log(500/490) is very small because the word is ubiquitous.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-08-q5',
      type: 'choice',
      question: `Two features have a Pearson correlation of 0.95. What should you do?`,
      options: [
        'Keep both — more features always help',
        'Remove one — they convey nearly identical information and may cause multicollinearity',
        'Average them into one feature',
        'Apply PCA to all features',
      ],
      answer: 'Remove one — they convey nearly identical information and may cause multicollinearity',
      hints: ['Redundant features do not add signal but add noise to distance-based models and inflate variance in linear models.'],
      reviewSection: 'intuition',
    },
  ],
};

export default lesson;
