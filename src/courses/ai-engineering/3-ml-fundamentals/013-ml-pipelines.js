const lesson = {
  id: 'ae2-13',
  slug: 'ml-pipelines',
  chapter: 'ae-p2',
  order: 12,
  title: 'ML Pipelines',
  subtitle: 'Package every transform into one reproducible, deployable object',
  tags: ['pipelines', 'preprocessing', 'data-leakage', 'sklearn', 'reproducibility'],
  hook: {
    question: 'Your model scores 94% accuracy in development. In production it scores 78%. What went wrong?',
    realWorldContext: 'Training/serving skew — the preprocessing steps applied to training data were different from those applied in production. Pipelines solve this by packaging every transformation and the model into a single serialized object. The same object that trains also serves.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      `A pipeline is an ordered sequence of data transformations followed by a model. Each step takes the output of the previous step as input. The entire pipeline is fit once on training data. At inference time, the same fitted pipeline transforms new data and produces predictions.`,
      `The pipeline guarantees four things: (1) Transformers are fit only on training data — no leakage. (2) The same transformations are applied at inference time — no skew. (3) The entire object can be serialized as one artifact — simple deployment. (4) Cross-validation applies the pipeline per fold, preventing subtle leakage that even careful manual splitting misses.`,
      `Data leakage is the silent killer of ML systems. It happens when information from the test set contaminates training. The most common form: fitting a StandardScaler on the full dataset before splitting. The scaler's mean and std include test samples. Training features are shifted using test statistics. The model indirectly sees test information, inflating accuracy estimates. A model trained this way will underperform in production.`,
      `The fix is mechanical: split first, then fit transformers only on training data. In code this means: (1) split X and y, (2) call scaler.fit_transform(X_train), (3) call scaler.transform(X_test). With a pipeline, step 1 is the only step — the pipeline handles 2 and 3 automatically.`,
      `Real datasets have mixed column types. Numeric columns need imputation then scaling. Categorical columns need imputation then one-hot encoding. ColumnTransformer handles this by routing different column subsets to different preprocessing pipelines, then concatenating the results. The combined preprocessor feeds into the final model as one pipeline step.`,
      `handle_unknown="ignore" in OneHotEncoder is critical for production. When a new category appears (a city the model has never seen), it produces a zero vector instead of crashing. Without this, a new value in production causes a KeyError and brings down the service.`,
      `Experiment tracking records every training run: hyperparameters, metrics, code version, dataset version, and the serialized model. MLflow and Weights & Biases (wandb) are the main tools. Every run is reproducible. You can compare 50 experiments in a dashboard, promote the best model to production, and roll back instantly if it degrades.`,
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The #1 Production ML Bug',
        body: `Training/serving skew: you fit the scaler in training but recompute it differently at inference (or forget to apply it at all). A pipeline prevents this — the same fitted scaler.transform() is called in both places because it is the same object. Never copy-paste preprocessing code between training and serving scripts.`,
      },
      {
        type: 'info',
        title: 'Prediction Moment',
        body: `Before reading on: a pipeline has steps [imputer, scaler, encoder, model]. When you call pipeline.fit(X_train, y_train), what happens to each step? When you call pipeline.predict(X_test), what is different about the scaler step vs. what happened during fit?`,
      },
      {
        type: 'info',
        title: 'Pipeline Step Ordering Matters',
        body: `(1) Impute missing values BEFORE scaling (you need numeric values to compute mean/std). (2) Scale BEFORE models that are distance-sensitive (logistic regression, SVM, KNN). (3) Encode categoricals BEFORE feeding to models that expect numeric input. (4) Feature selection AFTER encoding (can't drop features that don't exist yet).`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'ML Pipeline from Scratch',
        mathBridge: `Pipeline.fit(X_tr, y): for each step s[i]: X_tr = s[i].fit_transform(X_tr); s[-1].fit(X_tr, y). Pipeline.predict(X_te): for each step s[i<-1]: X_te = s[i].transform(X_te); return s[-1].predict(X_te). Leakage = using statistics computed on X_test during training.`,
        caption: 'Build a pipeline from scratch, demonstrate data leakage, implement ColumnTransformer, and serialize for deployment.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Pipeline from Scratch + Leakage Demo',
              prose: [
                `We implement a minimal Pipeline class, then demonstrate the data leakage problem with a concrete example. The leaky version fits the scaler on all data (including test); the clean version uses a pipeline that fits only on training data.`,
                `The key difference: fit_transform computes and stores statistics (mean, std) AND applies them. transform applies previously stored statistics without recomputing. A pipeline automatically calls fit_transform on training steps and transform on test steps.`,
                `We show the accuracy gap between leaky and clean evaluation on the same model. On small datasets this gap can be several percentage points — just from how you compute the scaler.`,
              ],
              code: `import numpy as np

class Standardizer:
    def fit(self, X):
        self.mean_ = X.mean(0); self.std_ = X.std(0) + 1e-8; return self
    def transform(self, X): return (X - self.mean_) / self.std_
    def fit_transform(self, X): return self.fit(X).transform(X)

class LogisticReg:
    def __init__(self, lr=0.1, epochs=200): self.lr = lr; self.epochs = epochs
    def fit(self, X, y):
        self.w = np.zeros(X.shape[1]); self.b = 0.0
        for _ in range(self.epochs):
            p = 1 / (1 + np.exp(-np.clip(X @ self.w + self.b, -20, 20)))
            e = p - y
            self.w -= self.lr * (X.T @ e) / len(y)
            self.b -= self.lr * e.mean()
        return self
    def predict(self, X):
        return (1 / (1 + np.exp(-np.clip(X @ self.w + self.b, -20, 20))) >= 0.5).astype(int)

class Pipeline:
    def __init__(self, steps): self.steps = steps
    def fit(self, X, y):
        Xc = X.copy()
        for _, step in self.steps[:-1]: Xc = step.fit_transform(Xc)
        self.steps[-1][1].fit(Xc, y); return self
    def predict(self, X):
        Xc = X.copy()
        for _, step in self.steps[:-1]: Xc = step.transform(Xc)
        return self.steps[-1][1].predict(Xc)

rng = np.random.default_rng(42)
N = 200
X = rng.normal(0, [1, 100], (N, 2))  # huge scale difference — scaler matters
y = (X[:,0] + X[:,1]/100 > 0).astype(float)

split = 160

# LEAKY: fit scaler on all data first
scaler_leaky = Standardizer().fit(X)
X_scaled_all = scaler_leaky.transform(X)
from numpy.random import permutation
idx = permutation(N)
tr, te = idx[:split], idx[split:]
w = np.zeros(2); b = 0.0
X_tr_l, X_te_l = X_scaled_all[idx[:split]], X_scaled_all[idx[split:]]
y_tr, y_te = y[idx[:split]], y[idx[split:]]
leaky_lr = LogisticReg(); leaky_lr.fit(X_tr_l, y_tr)
leaky_acc = (leaky_lr.predict(X_te_l) == y_te).mean()

# CLEAN: pipeline fits only on training data
X_tr_raw, X_te_raw = X[idx[:split]], X[idx[split:]]
pipe = Pipeline([("scaler", Standardizer()), ("model", LogisticReg())])
pipe.fit(X_tr_raw, y_tr)
clean_acc = (pipe.predict(X_te_raw) == y_te).mean()

print(f"Leaky accuracy: {leaky_acc:.4f}")
print(f"Clean accuracy: {clean_acc:.4f}")
print(f"Gap: {leaky_acc - clean_acc:.4f} (leaky is optimistic by this much)")`,
            },
            {
              id: 2,
              cellTitle: 'ColumnTransformer: Mixed-Type Data',
              prose: [
                `Real datasets have numeric and categorical columns. We build a ColumnTransformer that applies standardization to numeric columns and one-hot encoding to categorical columns, then combines the results.`,
                `The trick: fit each sub-transformer on the appropriate subset of columns in the training data. At transform time, apply the fitted (not re-fit) transformers to the test columns. Concatenate the outputs into a single matrix.`,
                `handle_unknown in one-hot encoding: when a new category appears at test time that wasn't in training, map it to all-zeros rather than raising an error. This is the difference between a robust production system and one that crashes on new data.`,
              ],
              code: `import numpy as np

class OneHotEncoder:
    def __init__(self, handle_unknown='ignore'):
        self.handle_unknown = handle_unknown
    def fit(self, categories):
        self.cats_ = sorted(set(categories))
        self.cat_idx_ = {c: i for i, c in enumerate(self.cats_)}
        return self
    def transform(self, categories):
        k = len(self.cats_)
        out = np.zeros((len(categories), k))
        for row, c in enumerate(categories):
            idx = self.cat_idx_.get(c, None)
            if idx is not None: out[row, idx] = 1
            # else: all zeros (handle_unknown='ignore')
        return out
    def fit_transform(self, c): return self.fit(c).transform(c)

class Standardizer:
    def fit(self, X): self.mean_=X.mean(0); self.std_=X.std(0)+1e-8; return self
    def transform(self, X): return (X - self.mean_) / self.std_
    def fit_transform(self, X): return self.fit(X).transform(X)

class ColumnTransformer:
    def __init__(self, num_cols, cat_cols):
        self.num_cols = num_cols; self.cat_cols = cat_cols
        self.scaler = Standardizer()
        self.encoders = [OneHotEncoder() for _ in cat_cols]
    def fit_transform(self, X_num, X_cat_list):
        out = [self.scaler.fit_transform(X_num)]
        for enc, col in zip(self.encoders, X_cat_list):
            out.append(enc.fit_transform(col))
        return np.hstack(out)
    def transform(self, X_num, X_cat_list):
        out = [self.scaler.transform(X_num)]
        for enc, col in zip(self.encoders, X_cat_list):
            out.append(enc.transform(col))
        return np.hstack(out)

rng = np.random.default_rng(7)
N = 100
ages    = rng.integers(18, 70, N).astype(float)
incomes = rng.normal(50000, 15000, N)
cities  = rng.choice(['NYC', 'LA', 'Chicago', 'Houston'], N)
plans   = rng.choice(['basic', 'premium'], N)

X_num_tr = np.column_stack([ages[:80], incomes[:80]])
X_num_te = np.column_stack([ages[80:], incomes[80:]])
X_cat_tr = [cities[:80], plans[:80]]
X_cat_te = [cities[80:], plans[80:]]

# Introduce unknown city in test
X_cat_te[0][0] = 'Miami'  # never seen in training

ct = ColumnTransformer(num_cols=2, cat_cols=2)
X_tr_final = ct.fit_transform(X_num_tr, X_cat_tr)
X_te_final = ct.transform(X_num_te, X_cat_te)

print(f"Train feature matrix shape: {X_tr_final.shape}")
print(f"Test feature matrix shape:  {X_te_final.shape}")
print(f"Unknown 'Miami' row (first test row): {X_te_final[0]}")
print("  (city columns are all zeros — gracefully handled)")`,
            },
            {
              id: 3,
              cellTitle: 'Cross-Validation with Pipeline (No Leakage)',
              prose: [
                `When you run K-fold CV with a pipeline, the pipeline's fit_transform is called fresh on each training fold. The scaler never sees the validation fold. This is the correct way to evaluate models.`,
                `We compare two approaches on the same data: (A) manual K-fold where the scaler is fit before the loop (leaky) and (B) K-fold inside a pipeline (clean). The leaky approach reports optimistic accuracy; the clean approach gives the true expected performance.`,
                `This matters most when the training set is small (leakage has more impact) and when the scaler's statistics are sensitive to the data (e.g., features with outliers where mean/std vary between folds).`,
              ],
              code: `import numpy as np

class Standardizer:
    def fit(self, X): self.m=X.mean(0); self.s=X.std(0)+1e-8; return self
    def transform(self, X): return (X-self.m)/self.s
    def fit_transform(self, X): return self.fit(X).transform(X)

class LogReg:
    def fit(self, X, y, lr=0.1, epochs=300):
        self.w=np.zeros(X.shape[1]); self.b=0.0
        for _ in range(epochs):
            p=1/(1+np.exp(-np.clip(X@self.w+self.b,-20,20)))
            e=p-y; self.w-=lr*(X.T@e)/len(y); self.b-=lr*e.mean()
        return self
    def predict(self, X):
        return (1/(1+np.exp(-np.clip(X@self.w+self.b,-20,20)))>=0.5).astype(int)

class Pipeline:
    def __init__(self, steps): self.steps=steps
    def fit(self, X, y):
        Xc=X.copy()
        for _,s in self.steps[:-1]: Xc=s.fit_transform(Xc)
        self.steps[-1][1].fit(Xc,y); return self
    def predict(self, X):
        Xc=X.copy()
        for _,s in self.steps[:-1]: Xc=s.transform(Xc)
        return self.steps[-1][1].predict(Xc)

rng = np.random.default_rng(0)
N = 150
X = rng.normal(0, [1, 50, 0.1], (N, 3))  # very different scales
y = (X[:,0] - X[:,1]/50 + X[:,2]*5 > 0).astype(float)

K = 5
folds = np.array_split(np.arange(N), K)

leaky_scaler = Standardizer().fit(X)  # leaky: uses all data
X_scaled_all = leaky_scaler.transform(X)

leaky_scores, clean_scores = [], []
for i in range(K):
    val = folds[i]
    train = np.concatenate([folds[j] for j in range(K) if j != i])
    # Leaky CV
    lr_leaky = LogReg().fit(X_scaled_all[train], y[train])
    leaky_scores.append((lr_leaky.predict(X_scaled_all[val]) == y[val]).mean())
    # Clean CV (pipeline re-fits scaler per fold)
    pipe = Pipeline([("sc", Standardizer()), ("lr", LogReg())])
    pipe.fit(X[train], y[train])
    clean_scores.append((pipe.predict(X[val]) == y[val]).mean())

print(f"Leaky  CV: {np.mean(leaky_scores):.4f} ± {np.std(leaky_scores):.4f}")
print(f"Clean  CV: {np.mean(clean_scores):.4f} ± {np.std(clean_scores):.4f}")
print(f"Leakage inflates estimate by: {np.mean(leaky_scores)-np.mean(clean_scores):.4f}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: `Build a full production-ready pipeline that handles missing values, mixed column types, and unknown categories. The dataset below has 3 numeric columns (some missing) and 2 categorical columns (with potential new categories at test time). Your pipeline should: (1) median-impute numeric columns, (2) standardize them, (3) most-frequent-impute categoricals, (4) one-hot encode with handle_unknown='ignore', (5) train logistic regression. Report clean K=5 CV accuracy and demonstrate that a new unseen category at test time doesn't crash the pipeline.`,
              starterCode: `import numpy as np

rng = np.random.default_rng(1)
N = 200

# Numeric features with missing values
age    = rng.integers(18, 70, N).astype(float)
income = rng.normal(50000, 20000, N)
score  = rng.normal(0, 1, N)
# Inject 10% missing values
for col in [age, income, score]:
    col[rng.choice(N, size=N//10, replace=False)] = np.nan

# Categorical features
city = rng.choice(['A','B','C','D'], N)
tier = rng.choice(['low','mid','high'], N)

# Target: based on standardized income and score
label = ((income/20000 + score + (city=='A').astype(float)) > 1.5).astype(float)

split = 160
# TODO: build preprocessing + pipeline
# TODO: run 5-fold CV on training portion, report accuracy
# TODO: add 'E' (unseen city) to first test row and show it doesn't crash`,
              hint: `For missing values: fill with np.nanmedian(col[train]) or np.nanmean. For OHE: your encoder's transform() should return zeros for unknown categories. Build the pipeline as in cell 3 but with imputation as first step.`,
              testCode: `# Pipeline should handle unseen categories without error`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'ae2-13-q1',
      type: 'choice',
      question: `What is data leakage in the context of ML pipelines?`,
      options: [
        'Data being accidentally deleted during preprocessing',
        'Information from the test set or future data contaminating the training process',
        'The model being too slow to process the data',
        'Features being dropped during encoding',
      ],
      answer: 'Information from the test set or future data contaminating the training process',
      hints: ['Leakage inflates your validation score because the model was exposed to information it wouldn\'t have at prediction time.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-13-q2',
      type: 'choice',
      question: `Why is fitting a scaler on the full dataset before splitting into train/test considered leaky?`,
      options: [
        'Scaling changes the data distribution',
        'The scaler\'s statistics (mean, std) include test data, so the model indirectly sees test information during training',
        'Scaling should only be done on the test set',
        'Fitting the scaler takes too long on large datasets',
      ],
      answer: 'The scaler\'s statistics (mean, std) include test data, so the model indirectly sees test information during training',
      hints: ['The mean and std of the full dataset encode information from test samples. Those statistics are then used to transform training features.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-13-q3',
      type: 'choice',
      question: `In sklearn, what is the difference between calling fit_transform and transform on a pipeline step?`,
      options: [
        'They are identical — both fit and transform',
        'fit_transform learns parameters from the data and applies the transform; transform only applies previously learned parameters',
        'transform is for training data; fit_transform is for test data',
        'fit_transform is slower but more accurate',
      ],
      answer: 'fit_transform learns parameters from the data and applies the transform; transform only applies previously learned parameters',
      hints: ['On test data you must use transform — applying the statistics learned from training data. Re-fitting would use test statistics.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-13-q4',
      type: 'choice',
      question: `Why is ColumnTransformer necessary for real-world datasets?`,
      options: [
        'It makes the pipeline run in parallel on multiple CPUs',
        'It applies different preprocessing steps to numeric and categorical columns within the same pipeline',
        'It removes columns with missing values automatically',
        'It converts all columns to the same data type',
      ],
      answer: 'It applies different preprocessing steps to numeric and categorical columns within the same pipeline',
      hints: ['Numeric columns need scaling; categorical columns need encoding. ColumnTransformer routes each subset to the right transformer.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-13-q5',
      type: 'choice',
      question: `A production model receives a categorical value it never saw during training. What should the pipeline handle?`,
      options: [
        'Ignore the row entirely and return no prediction',
        'Retrain the entire model from scratch',
        'Handle unknown categories gracefully — e.g., using an "unknown" bucket or all-zeros one-hot vector',
        'Convert the unknown category to the number zero',
      ],
      answer: 'Handle unknown categories gracefully — e.g., using an "unknown" bucket or all-zeros one-hot vector',
      hints: ['In OneHotEncoder(handle_unknown="ignore"), unknown categories produce a zero vector. The model still gets a prediction rather than crashing.'],
      reviewSection: 'intuition',
    },
  ],
};

export default lesson;
