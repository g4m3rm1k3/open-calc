const lesson = {
  id: 'ae2-14',
  slug: 'naive-bayes',
  chapter: 'ae-p2',
  order: 13,
  title: 'Naive Bayes',
  subtitle: 'The wrong assumption that works — and why that teaches you something profound',
  tags: ['naive-bayes', 'text-classification', 'generative-models', 'laplace-smoothing', 'bayes'],
  hook: {
    question: 'A classifier assumes features are independent when they clearly aren\'t. Why does it still classify better than complex models on small datasets?',
    realWorldContext: 'Naive Bayes powers spam filters, medical diagnosis, and document classification. It trains in one pass through the data, scales to millions of features, and often outperforms logistic regression when training data is scarce. Understanding why a wrong assumption leads to good predictions is one of the most instructive lessons in ML.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      `Bayes' theorem: P(class | features) = P(features | class) × P(class) / P(features). We want P(class | features) — the probability that a document belongs to a class given the words in it. Since P(features) is the same for all classes, we compare P(features | class) × P(class) across classes and pick the winner.`,
      `The problem: computing P(features | class) exactly requires estimating the joint probability of all features. With a vocabulary of 10,000 words, you would need to estimate a distribution over 2^10,000 possible combinations. Impossible.`,
      `The naive assumption: every feature is conditionally independent given the class. P(w₁, w₂, ..., wₙ | class) = P(w₁|class) × P(w₂|class) × ... × P(wₙ|class). Instead of one impossible joint distribution, you estimate n simple per-feature distributions. Each one needs only a count.`,
      `The assumption is obviously wrong — "machine" and "learning" co-occur in technical text constantly. But the classifier doesn't need correct probabilities. It needs correct rankings. The independence assumption introduces systematic errors, but those errors affect all classes similarly, so the ranking stays correct. High bias, low variance. This is the bias-variance tradeoff made explicit.`,
      `Multinomial Naive Bayes for text: P(wordᵢ | class) = (count(wordᵢ, class) + α) / (total_words_in_class + α × vocab_size). The α is Laplace smoothing. Without it, a single unseen word gives P(word|class) = 0, which zeroes out the entire product regardless of all other evidence. With α=1, every word gets at least a tiny probability.`,
      `Working in log space prevents floating-point underflow: log P(class|features) = log P(class) + Σᵢ countᵢ × log P(wordᵢ|class). This is a dot product: log_scores = X @ log_probs.T + log_priors. Prediction is argmax over classes. This is why Naive Bayes prediction is as fast as a linear model — it IS one matrix multiplication.`,
      `Three variants: Multinomial NB for word counts/frequencies (text). Gaussian NB for continuous features (assumes per-feature Gaussian distributions within each class). Bernoulli NB for binary presence/absence features (explicitly models word absence, good for short text).`,
      `Naive Bayes vs Logistic Regression: NB is generative (learns P(X|Y) then applies Bayes). LR is discriminative (directly learns P(Y|X)). Small data: NB wins (strong prior helps). Large data: LR wins (the wrong independence assumption starts hurting). NB converges in O(log n) samples; LR in O(n) samples. Start with NB.`,
    ],
    callouts: [
      {
        type: 'info',
        title: 'Prediction Moment',
        body: `Before reading on: an email contains "free" twice and "money" once. Vocabulary: {free, money, meeting}. Spam class has log P(free|spam) = -0.637, log P(money|spam) = -0.919. Not-spam class has log P(free|not-spam) = -2.976, log P(money|not-spam) = -2.375. Prior: log P(spam) = -0.916. Compute both log scores. Which class wins?`,
      },
      {
        type: 'warning',
        title: 'MultinomialNB Requires Non-negative Features',
        body: `MultinomialNB requires features ≥ 0 because it models counts. Standardized features can be negative → use GaussianNB instead. TF-IDF values are non-negative → use MultinomialNB. If you accidentally pass standardized features to MultinomialNB, predictions will be silently wrong.`,
      },
      {
        type: 'info',
        title: 'Naive Bayes Prediction Formula',
        body: `In log space: score(class) = log P(class) + Σᵢ (count of word i) × log P(wordᵢ | class). In matrix form: scores = X @ log_feature_probs.T + log_class_priors. One matrix multiply per prediction. This is O(N × vocab × classes) — linear in everything.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Naive Bayes from Scratch',
        mathBridge: `P(word|class) = (count(word,class)+α) / (Σword(count+α)). Log score = logP(class) + Σᵢ countᵢ·logP(wᵢ|class) = X @ log_probs.T + log_prior. GNB: logP(x|class) = −0.5·log(2πσ²) − (x−μ)²/(2σ²).`,
        caption: 'Implement MultinomialNB and GaussianNB from scratch, build a text spam classifier, compare to logistic regression with varying training set sizes.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Multinomial Naive Bayes from Scratch',
              prose: [
                `We implement MultinomialNB with Laplace smoothing. The fit step is just counting: for each class, count how many times each feature appears, add α, and compute log probabilities. The predict step is one matrix multiply.`,
                `The Laplace smoothing formula: log P(wordᵢ|class) = log((countᵢ + α) / (total_count + α × vocab_size)). The denominator ensures probabilities sum to 1 after smoothing.`,
                `We test on synthetic bag-of-words data: two document classes where "tech words" (features 0-39) are frequent in class 0 and "sports words" (features 80-119) are frequent in class 1. We also test the smoothing effect by predicting a document with a word that was never seen in training.`,
              ],
              code: `import numpy as np

class MultinomialNB:
    def __init__(self, alpha=1.0): self.alpha = alpha
    def fit(self, X, y):
        self.classes_ = np.unique(y)
        n_cls, n_feat = len(self.classes_), X.shape[1]
        self.log_prior_ = np.zeros(n_cls)
        self.log_prob_  = np.zeros((n_cls, n_feat))
        for i, c in enumerate(self.classes_):
            Xc = X[y == c]
            self.log_prior_[i] = np.log(len(Xc) / len(X))
            counts = Xc.sum(0) + self.alpha
            self.log_prob_[i] = np.log(counts / counts.sum())
        return self
    def predict_log_proba(self, X):
        return X @ self.log_prob_.T + self.log_prior_
    def predict(self, X):
        return self.classes_[np.argmax(self.predict_log_proba(X), axis=1)]

rng = np.random.default_rng(0)
N, V = 400, 200  # 400 docs, 200-word vocabulary
# Class 0: words 0-39 are "tech" (high freq); class 1: words 80-119 are "sports"
probs_cls0 = np.full(V, 0.002); probs_cls0[:40] = 0.025
probs_cls1 = np.full(V, 0.002); probs_cls1[80:120] = 0.025
X0 = rng.multinomial(50, probs_cls0/probs_cls0.sum(), N//2)
X1 = rng.multinomial(50, probs_cls1/probs_cls1.sum(), N//2)
X = np.vstack([X0, X1]); y = np.array([0]*(N//2) + [1]*(N//2))

split = int(0.8*N)
nb = MultinomialNB(alpha=1.0).fit(X[:split], y[:split])
acc = (nb.predict(X[split:]) == y[split:]).mean()
print(f"MultinomialNB accuracy: {acc:.4f}")

# Alpha sweep
print("\\nLaplace smoothing sweep:")
print(f"{'Alpha':>8}  {'Accuracy':>10}")
for alpha in [0.01, 0.1, 1.0, 5.0, 10.0]:
    a = (MultinomialNB(alpha=alpha).fit(X[:split], y[:split]).predict(X[split:]) == y[split:]).mean()
    print(f"{alpha:>8.2f}  {a:>10.4f}")

# Unknown word test
unseen_doc = np.zeros((1, V)); unseen_doc[0, 50] = 5  # word 50: not in either class
log_scores = nb.predict_log_proba(unseen_doc)[0]
print(f"\\nUnseen-word log scores: class0={log_scores[0]:.3f}, class1={log_scores[1]:.3f}")
print("(Smoothing prevents -inf — neither class gets zero probability)")`,
            },
            {
              id: 2,
              cellTitle: 'Gaussian Naive Bayes for Continuous Features',
              prose: [
                `GaussianNB models each feature as a Normal distribution within each class. For each class c and feature j, we estimate μ_{cj} = mean of feature j in class c, and σ²_{cj} = variance.`,
                `Prediction: log P(x|class) = Σⱼ log N(xⱼ; μ_{cj}, σ²_{cj}) = Σⱼ [−0.5 log(2πσ²_{cj}) − (xⱼ − μ_{cj})² / (2σ²_{cj})]. Sum over features plus the log prior gives the class score.`,
                `We add a small variance floor (1e-9) to prevent division by zero when a feature is constant within a class. This is the Gaussian analogue of Laplace smoothing.`,
              ],
              code: `import numpy as np

class GaussianNB:
    def fit(self, X, y):
        self.classes_ = np.unique(y)
        n_cls, n_feat = len(self.classes_), X.shape[1]
        self.means_  = np.zeros((n_cls, n_feat))
        self.vars_   = np.zeros((n_cls, n_feat))
        self.priors_ = np.zeros(n_cls)
        for i, c in enumerate(self.classes_):
            Xc = X[y == c]
            self.means_[i]  = Xc.mean(0)
            self.vars_[i]   = Xc.var(0) + 1e-9  # floor to prevent div/0
            self.priors_[i] = len(Xc) / len(X)
        return self
    def predict_log_proba(self, X):
        log_scores = np.zeros((len(X), len(self.classes_)))
        for i in range(len(self.classes_)):
            log_p = -0.5 * np.log(2 * np.pi * self.vars_[i])
            log_p -= (X - self.means_[i])**2 / (2 * self.vars_[i])
            log_scores[:, i] = log_p.sum(1) + np.log(self.priors_[i])
        return log_scores
    def predict(self, X):
        return self.classes_[np.argmax(self.predict_log_proba(X), axis=1)]

rng = np.random.default_rng(1)
# 3-class Iris-like dataset
centers = np.array([[0,0], [3,3], [0,3]])
N_per = 100
X = np.vstack([rng.normal(c, 0.8, (N_per, 2)) for c in centers])
y = np.repeat([0,1,2], N_per)

# Shuffle
idx = rng.permutation(len(y))
X, y = X[idx], y[idx]
split = int(0.8 * len(y))

gnb = GaussianNB().fit(X[:split], y[:split])
acc = (gnb.predict(X[split:]) == y[split:]).mean()
print(f"GaussianNB 3-class accuracy: {acc:.4f}")
print("\\nLearned class means:")
for i, c in enumerate(gnb.classes_):
    print(f"  Class {c}: μ = {gnb.means_[i]}")

# Training size experiment: NB vs logistic regression
from numpy.linalg import lstsq

def logreg_ova_predict(X, Ws, bs):
    scores = X @ Ws.T + bs
    return np.argmax(scores, axis=1)

print("\\nTraining size experiment (NB is better with small data):")
print(f"{'N_train':>8}  {'GNB acc':>10}")
for n in [20, 50, 100, 200, 300]:
    a = (GaussianNB().fit(X[:n], y[:n]).predict(X[split:]) == y[split:]).mean()
    print(f"{n:>8}  {a:>10.4f}")`,
            },
            {
              id: 3,
              cellTitle: 'Text Spam Classifier: TF-IDF + Naive Bayes',
              prose: [
                `A complete text classifier pipeline: raw text → tokenize → build bag-of-words counts → MultinomialNB. We also compare raw counts vs TF-IDF weighting. TF-IDF downweights common words (like "the", "is") that appear in every document and upweights discriminative words specific to one class.`,
                `TF(w, doc) = count(w in doc) / total_words(doc). IDF(w) = log(N / df(w)). TF-IDF score = TF × IDF. Multiplying the feature matrix by IDF weights before Naive Bayes is a simple but effective improvement.`,
                `The comparison also shows the effect of Laplace smoothing: without smoothing (α=0.001), words not seen in a class cause log(near-zero) scores, destabilizing predictions. With α=1.0, smooth and robust.`,
              ],
              code: `import numpy as np
from collections import Counter
import math

def tokenize(text): return text.lower().split()

def build_bow(docs, vocab=None):
    if vocab is None:
        vocab = sorted(set(w for d in docs for w in tokenize(d)))
    v_idx = {w: i for i, w in enumerate(vocab)}
    X = np.zeros((len(docs), len(vocab)))
    for i, doc in enumerate(docs):
        for w in tokenize(doc):
            if w in v_idx: X[i, v_idx[w]] += 1
    return X, vocab

def tfidf_weight(X):
    N = X.shape[0]
    df = (X > 0).sum(0)
    idf = np.log((N + 1) / (df + 1)) + 1  # sklearn-style smoothing
    return X * idf

# Synthetic spam / not-spam dataset
spam_patterns = [
    "free money offer click now win prize cash reward free",
    "congratulations you have won a free vacation claim now",
    "buy cheap pills online discount offer free shipping",
    "urgent limited offer free gift card click to claim",
    "make money fast free online business opportunity cash",
]
ham_patterns = [
    "meeting tomorrow at three pm in the conference room",
    "please review the attached report for the board meeting",
    "the project deadline is next friday please submit your work",
    "lunch order for the team what does everyone want today",
    "reminder your dentist appointment is on thursday morning",
]
rng = np.random.default_rng(5)
docs, labels = [], []
for _ in range(80):
    base = spam_patterns[rng.integers(5)]
    noise = " ".join(rng.choice(['is','the','and','of','to'], 3))
    docs.append(f"{base} {noise}"); labels.append(1)
for _ in range(80):
    base = ham_patterns[rng.integers(5)]
    noise = " ".join(rng.choice(['is','the','and','of','to'], 3))
    docs.append(f"{base} {noise}"); labels.append(0)
labels = np.array(labels)

idx = rng.permutation(160)
split = 128
tr_docs = [docs[i] for i in idx[:split]]
te_docs = [docs[i] for i in idx[split:]]
y_tr, y_te = labels[idx[:split]], labels[idx[split:]]

X_tr_bow, vocab = build_bow(tr_docs)
X_te_bow, _     = build_bow(te_docs, vocab)

X_tr_tfidf = tfidf_weight(X_tr_bow)
X_te_tfidf = tfidf_weight(X_te_bow)

class MultinomialNB:
    def __init__(self, alpha=1.0): self.alpha=alpha
    def fit(self,X,y):
        self.classes_=np.unique(y)
        self.log_prior_=np.array([np.log((y==c).mean()) for c in self.classes_])
        self.log_prob_=np.array([np.log((X[y==c].sum(0)+self.alpha)/(X[y==c].sum(0).sum()+self.alpha*X.shape[1])) for c in self.classes_])
        return self
    def predict(self,X): return self.classes_[np.argmax(X@self.log_prob_.T+self.log_prior_,axis=1)]

print(f"BOW + NB (alpha=1.0):   {(MultinomialNB(1.0).fit(X_tr_bow,y_tr).predict(X_te_bow)==y_te).mean():.4f}")
print(f"TF-IDF + NB (alpha=1.0):{(MultinomialNB(1.0).fit(X_tr_tfidf,y_tr).predict(X_te_tfidf)==y_te).mean():.4f}")

# Top spam words
nb = MultinomialNB(1.0).fit(X_tr_bow, y_tr)
spam_class = np.where(nb.classes_ == 1)[0][0]
top5 = np.argsort(nb.log_prob_[spam_class])[-5:][::-1]
print(f"\\nTop 5 spam-indicator words: {[vocab[i] for i in top5]}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: `Implement BernoulliNB, which models feature presence/absence (binary). Unlike MultinomialNB which sums counts, BernoulliNB uses P(word=1|class) for present words and P(word=0|class) = 1 − P(word=1|class) for absent words. This explicit modeling of absence is what differentiates it. Compare BernoulliNB to MultinomialNB on the spam dataset, using binary (0/1) features. Test with both long and short documents (short = 5 words, long = 50 words).`,
              starterCode: `import numpy as np
from collections import Counter

# Reuse tokenize, build_bow from above (implement inline if needed)
def tokenize(t): return t.lower().split()

class BernoulliNB:
    def __init__(self, alpha=1.0): self.alpha = alpha
    def fit(self, X_bin, y):
        # X_bin: binary (0/1) matrix
        # For each class: P(feat=1|class) with smoothing
        # Use Bernoulli formula: log P(doc|class) = Σᵢ [xᵢ·logP(1|c) + (1-xᵢ)·logP(0|c)]
        # TODO: compute log_prior_, log_prob_present_, log_prob_absent_
        pass
    def predict(self, X_bin):
        # TODO: compute scores and predict
        pass

# Generate short vs long document datasets using spam/ham patterns from above
# TODO: compare BernoulliNB vs MultinomialNB on both
# (hint: for short docs, BernoulliNB may win because frequency info is noisy)`,
              hint: `P(feat=1|class) = (count_positive_in_class + α) / (n_samples_in_class + 2α). log_absent = log(1 - P(feat=1|class)). Score = Σᵢ [xᵢ·log_present + (1-xᵢ)·log_absent] + log_prior.`,
              testCode: `# BernoulliNB should outperform MultinomialNB on 5-word documents`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'ae2-14-q1',
      type: 'choice',
      question: `What is the "naive" assumption in Naive Bayes?`,
      options: [
        'The prior probability of each class is equal',
        'All features are conditionally independent given the class label',
        'The data is normally distributed',
        'The model has no parameters to learn',
      ],
      answer: 'All features are conditionally independent given the class label',
      hints: ['This assumption turns the joint P(w₁,w₂,...,wₙ|class) into a product P(w₁|class)×P(w₂|class)×...×P(wₙ|class).'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-14-q2',
      type: 'choice',
      question: `What does Laplace smoothing prevent in Naive Bayes?`,
      options: [
        'Overfitting to large datasets',
        'Zero probabilities for words never seen in a class during training',
        'Slow training on high-dimensional data',
        'Class imbalance in the dataset',
      ],
      answer: 'Zero probabilities for words never seen in a class during training',
      hints: ['Without smoothing, one unseen word gives P(word|class)=0, zeroing the entire product for that class.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-14-q3',
      type: 'choice',
      question: `The naive independence assumption is clearly wrong for text. Why does Naive Bayes still classify well?`,
      options: [
        'It only works on very small vocabularies where independence holds',
        'Classification only needs correct class rankings, not correct probabilities, and the assumption introduces stable errors affecting all classes similarly',
        'Modern implementations secretly remove the independence assumption',
        'It only works when features are truly independent',
      ],
      answer: 'Classification only needs correct class rankings, not correct probabilities, and the assumption introduces stable errors affecting all classes similarly',
      hints: ['NB needs to rank classes correctly. High-bias models are stable with limited data. Correlated features double-count evidence for the correct class too.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-14-q4',
      type: 'choice',
      question: `When should you use Multinomial NB versus Gaussian NB?`,
      options: [
        'Multinomial for regression, Gaussian for classification',
        'Multinomial for word count/frequency features, Gaussian for continuous real-valued features',
        'Multinomial for binary data, Gaussian for multi-class problems',
        'They are interchangeable — always use whichever is faster',
      ],
      answer: 'Multinomial for word count/frequency features, Gaussian for continuous real-valued features',
      hints: ['MultinomialNB requires non-negative counts. GaussianNB assumes a bell-curve distribution of feature values within each class.'],
      reviewSection: 'intuition',
    },
    {
      id: 'ae2-14-q5',
      type: 'choice',
      question: `An email contains "free" twice and "money" once. In Multinomial NB with log probabilities, how is the spam score computed?`,
      options: [
        'log P(spam) + log P(free|spam) + log P(money|spam)',
        'log P(spam) + 2 × log P(free|spam) + 1 × log P(money|spam)',
        'P(spam) × P(free|spam) × P(money|spam)',
        'log P(spam) × 2 × log P(free|spam)',
      ],
      answer: 'log P(spam) + 2 × log P(free|spam) + 1 × log P(money|spam)',
      hints: ['In Multinomial NB, the word count acts as an exponent on the probability. In log space: count × log P(word|class).'],
      reviewSection: 'intuition',
    },
  ],
};

export default lesson;
