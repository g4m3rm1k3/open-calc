export default {
  id: 'ae-p1-07-bayes-theorem',
  slug: 'bayes-theorem',
  chapter: 'ae-p1',
  order: 6,
  title: "Bayes' Theorem",
  subtitle: 'Update your beliefs when evidence arrives — this is how all learning works.',
  tags: ['bayes', 'probability', 'naive-bayes', 'MLE', 'MAP', 'prior', 'posterior', 'regularization', 'A/B-testing'],

  hook: {
    question: 'Why does L2 regularization prevent overfitting?',
    realWorldContext:
      "The answer is Bayesian. L2 regularization (adding λ‖w‖² to the loss) is mathematically equivalent to placing a Gaussian prior over the weights and finding the MAP estimate. The regularization strength λ encodes how strongly you believe the weights should be small before seeing any data. Naive Bayes classifiers power spam filters. The Beta-Binomial model is how A/B testing works at Google and Netflix. Bayes' theorem is not a niche stat concept — it is the theoretical foundation under most of modern ML.",
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      "Bayes' theorem answers: given that I observed evidence E, how likely is hypothesis H? Start with a prior belief P(H), observe evidence, compute the posterior P(H|E). The formula is: P(H|E) = P(E|H) · P(H) / P(E). The denominator P(E) is just a normalizing constant that makes the posterior sum to 1. In practice you can compute it as P(E|H)·P(H) + P(E|¬H)·P(¬H).",
      "The base rate fallacy is the most common Bayes mistake. A disease affects 1 in 10,000 people (prior = 0.0001). A test is 99% accurate (likelihood = 0.99, false positive rate = 0.01). If you test positive, what is the probability you are actually sick? Most people say 99%. The correct answer is about 1%. Why? Out of 1,000,000 people, ~100 are sick — and the test correctly flags ~99 of them. But ~10,000 healthy people also test positive. The signal is drowned by false positives because the prior is so low. This matters for AI: rare event detection (fraud, cancer, security threats) always faces the base rate problem.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'MLE vs MAP: regularization is a Bayesian prior',
        body: 'MLE = find parameters that maximize P(data | params). No prior. Overfits on small data.\nMAP = find params that maximize P(params | data) = P(data | params) × P(params). With a Gaussian prior on params, MAP = MLE + L2 penalty. With a Laplace prior, MAP = MLE + L1 penalty. Regularization IS a Bayesian belief about what good weights look like.',
      },
      {
        type: 'insight',
        title: 'Naive Bayes classifies by multiplying likelihoods',
        body: 'For text with words w₁,w₂,...,wₙ: log P(spam|words) ∝ log P(spam) + Σ log P(wᵢ|spam). The "naive" assumption is that words are independent given the class — factually wrong, but works remarkably well in practice because the class structure dominates. All probabilities are computed as logs to avoid underflow (product of tiny numbers → sum of log-probs).',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: "Bayes' Theorem",
        mathBridge: 'P(H|E) = P(E|H)·P(H) / P(E). Posterior = likelihood × prior / evidence. MAP estimate: argmax P(D|θ)P(θ) = MLE with prior penalty.',
        caption: "Build Bayes' theorem and a spam classifier from scratch.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Bayes' theorem and the base rate fallacy",
              prose: [
                "## Bayes' Theorem",
                '```\nP(H|E) = P(E|H) × P(H) / P(E)\n\nPosterior = Likelihood × Prior / Evidence\n```',
                'Every term has a name:',
                '- **Prior** P(H): belief before seeing evidence',
                '- **Likelihood** P(E|H): how probable is the evidence if H is true',
                '- **Posterior** P(H|E): updated belief after seeing evidence',
                '## The Base Rate Fallacy',
                'Disease prevalence is 0.01% (1 in 10,000). Test sensitivity is 99%. False positive rate is 1%. A positive test result gives P(sick|positive) — not 99%, but much lower due to the low prior.',
              ],
              code: `def bayes(prior, likelihood, false_positive_rate):
    """
    Compute posterior P(H|positive_test).
    prior: P(disease)
    likelihood: P(positive | disease) = sensitivity
    false_positive_rate: P(positive | healthy)
    """
    p_positive = likelihood * prior + false_positive_rate * (1 - prior)
    posterior = likelihood * prior / p_positive
    return posterior, p_positive

# Medical test example
prior = 0.0001        # disease affects 1 in 10,000
sensitivity = 0.99    # test correctly detects 99% of sick
fpr = 0.01           # test flags 1% of healthy as positive

posterior, p_evidence = bayes(prior, sensitivity, fpr)
print("Medical test (rare disease):")
print(f"  Prior P(sick):          {prior}")
print(f"  Sensitivity:            {sensitivity}")
print(f"  False positive rate:    {fpr}")
print(f"  P(positive test):       {p_evidence:.6f}")
print(f"  P(sick | positive):     {posterior:.4f}  ({posterior*100:.2f}%)")
print(f"  Intuition: {int(1/prior)} people tested, ~{int(sensitivity/prior)} sick caught, ~{int(fpr*(1/prior))} false positives")

# Sequential updates: two positive tests
print("\\nSequential testing (updating belief with each test):")
belief = prior
for i in range(1, 4):
    belief, _ = bayes(belief, sensitivity, fpr)
    print(f"  After {i} positive test(s): P(sick) = {belief:.6f}  ({belief*100:.2f}%)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Naive Bayes spam classifier',
              prose: [
                '## Naive Bayes Text Classification',
                'Given an email with words w₁, w₂, ..., wₙ:',
                '```\nlog P(spam|words) ∝ log P(spam) + Σᵢ log P(wᵢ|spam)\n```',
                'The "naive" assumption: words are independent given the class.',
                '**Laplace smoothing** prevents log(0) for words not seen in training:',
                '```\nP(word|class) = (count(word,class) + α) / (total_words_in_class + α × vocab_size)\n```',
                'We work in log space to avoid underflow (product of many small probs → sum of logs).',
              ],
              code: `import math
from collections import defaultdict

class NaiveBayes:
    def __init__(self, alpha=1.0):
        self.alpha = alpha  # Laplace smoothing
        self.class_counts = defaultdict(int)
        self.word_counts = defaultdict(lambda: defaultdict(int))
        self.class_word_totals = defaultdict(int)
        self.vocab = set()

    def train(self, docs, labels):
        for doc, label in zip(docs, labels):
            self.class_counts[label] += 1
            for word in doc.lower().split():
                self.word_counts[label][word] += 1
                self.class_word_totals[label] += 1
                self.vocab.add(word)

    def log_prob(self, doc, cls):
        total = sum(self.class_counts.values())
        score = math.log(self.class_counts[cls] / total)  # log prior
        vocab_size = len(self.vocab)
        for word in doc.lower().split():
            count = self.word_counts[cls].get(word, 0)
            total_cls = self.class_word_totals[cls]
            # Laplace-smoothed likelihood
            score += math.log((count + self.alpha) / (total_cls + self.alpha * vocab_size))
        return score

    def predict(self, doc):
        scores = {cls: self.log_prob(doc, cls) for cls in self.class_counts}
        return max(scores, key=scores.get)

# Train on emails
train_docs = [
    "win free money now",
    "free lottery ticket winner",
    "claim your prize today",
    "urgent cash offer free",
    "meeting tomorrow at noon",
    "project update attached",
    "can we schedule a call",
    "quarterly report attached",
    "lunch on thursday sounds good",
    "please review the pull request",
]
labels = ["spam", "spam", "spam", "spam", "ham", "ham", "ham", "ham", "ham", "ham"]

clf = NaiveBayes(alpha=1.0)
clf.train(train_docs, labels)

test_messages = [
    "free money waiting for you",
    "meeting rescheduled to friday",
    "you won a free prize",
    "can we discuss the project",
]
print("Predictions:")
for msg in test_messages:
    pred = clf.predict(msg)
    print(f"  [{pred:4s}] '{msg}'")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'MLE vs MAP: regularization as a prior',
              prose: [
                '## MLE: Maximum Likelihood Estimation',
                'Find parameters θ that maximize P(data | θ). Pure data-driven — no prior.',
                'Example: 7 heads in 10 flips → MLE estimate of p = 7/10 = 0.7.',
                '## MAP: Maximum A Posteriori',
                'Find θ that maximizes P(θ | data) = P(data | θ) × P(θ). Includes a prior.',
                'With a Beta(α,β) prior on a coin: MAP estimate = (heads + α - 1) / (total + α + β - 2)',
                '## The Bayesian-Regularization Connection',
                '```\nGaussian prior:  P(θ) ∝ exp(-λ‖θ‖²)  →  MAP adds L2 penalty (ridge)\nLaplace prior:   P(θ) ∝ exp(-λ‖θ‖₁)  →  MAP adds L1 penalty (lasso)\n```',
                'The stronger the prior (larger α, β), the more MAP is pulled toward the prior mean. That is exactly what regularization strength λ does.',
              ],
              code: `def mle_coin(heads, total):
    return heads / total

def map_coin(heads, total, alpha, beta):
    """MAP estimate with Beta(alpha, beta) prior."""
    return (heads + alpha - 1) / (total + alpha + beta - 2)

heads, total = 7, 10
print(f"Observed: {heads} heads in {total} flips")
print(f"MLE:  p = {mle_coin(heads, total):.4f}  (no prior)")
print()

prior_configs = [
    (1, 1, "Beta(1,1)  = uniform prior"),
    (2, 2, "Beta(2,2)  = mild bias toward 0.5"),
    (5, 5, "Beta(5,5)  = moderate bias toward 0.5"),
    (20, 20, "Beta(20,20) = strong bias toward 0.5"),
]
for alpha, beta, label in prior_configs:
    map_est = map_coin(heads, total, alpha, beta)
    print(f"MAP ({label}): p = {map_est:.4f}")

print()
print("As prior strength increases (larger alpha=beta), MAP is pulled toward 0.5.")
print("With very small data, the prior dominates. With large data, MLE ≈ MAP.")

# Demonstrate with tiny vs large dataset
print()
for n, h in [(10, 7), (100, 70), (1000, 700)]:
    mle = mle_coin(h, n)
    map_est = map_coin(h, n, 20, 20)  # strong prior toward 0.5
    print(f"n={n:>4}: heads={h:>3}  MLE={mle:.3f}  MAP={map_est:.3f}")
print("With large n, MLE ≈ MAP — data overwhelms the prior.")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Sequential Bayesian updating (Beta-Binomial)',
              prose: [
                '## The Beta Distribution as a Prior',
                'The Beta distribution is the **conjugate prior** for a coin flip probability. This means: if you start with Beta(α,β) and observe h heads and t tails, the posterior is exactly Beta(α+h, β+t). Closed-form updates, no sampling needed.',
                '## Why this matters for A/B testing',
                'Run a Bayesian A/B test: assign Beta(1,1) prior to each variant. As clicks arrive, update the posterior online. At any point, estimate P(B > A) by comparing the two Beta posteriors. No p-values. No waiting for a fixed sample size. You get a probability statement about which variant is better.',
              ],
              code: `def beta_mean(alpha, beta):
    return alpha / (alpha + beta)

def beta_std(alpha, beta):
    v = (alpha * beta) / ((alpha + beta)**2 * (alpha + beta + 1))
    return v ** 0.5

# Sequential updating: Beta(1,1) prior (uniform)
alpha, beta = 1, 1
print(f"Starting prior: Beta({alpha},{beta})  mean={beta_mean(alpha,beta):.3f}")
print()

observations = [
    (7, 3, "Day 1: 7 heads, 3 tails"),
    (5, 5, "Day 2: 5 heads, 5 tails"),
    (3, 7, "Day 3: 3 heads, 7 tails"),
    (6, 4, "Day 4: 6 heads, 4 tails"),
]

for heads, tails, desc in observations:
    alpha += heads
    beta += tails
    print(f"{desc}")
    print(f"  Posterior: Beta({alpha},{beta})  mean={beta_mean(alpha,beta):.4f}  std={beta_std(alpha,beta):.4f}")

print()
print(f"Total data: {alpha-1} heads, {beta-1} tails (prior was Beta(1,1))")
print(f"MLE would be: {(alpha-1)/(alpha+beta-2):.4f}")

# Simple A/B test
print("\\nA/B Test:")
a_clicks, a_views = 50, 1000
b_clicks, b_views = 65, 1000
a_alpha, a_beta = 1 + a_clicks, 1 + (a_views - a_clicks)
b_alpha, b_beta = 1 + b_clicks, 1 + (b_views - b_clicks)
print(f"Variant A: {a_clicks}/{a_views} clicks  -> Beta({a_alpha},{a_beta})  mean={beta_mean(a_alpha,a_beta):.4f}")
print(f"Variant B: {b_clicks}/{b_views} clicks  -> Beta({b_alpha},{b_beta})  mean={beta_mean(b_alpha,b_beta):.4f}")
print(f"B has {(b_clicks/b_views - a_clicks/a_views)/(a_clicks/a_views)*100:.1f}% higher click-through rate")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: "Implement Bayes' theorem",
              difficulty: 'easy',
              prompt: "Implement `posterior(prior, likelihood, false_positive_rate)` that returns the posterior probability P(H|positive). Then call it to answer: A spam filter flags an email. 30% of emails are spam. P(flagged|spam) = 0.95. P(flagged|ham) = 0.02. What is P(spam|flagged)?",
              code: `def posterior(prior, likelihood, false_positive_rate):
    """
    Compute P(H|E) using Bayes' theorem.
    prior: P(H) - prior probability of hypothesis
    likelihood: P(E|H) - probability of evidence given hypothesis true
    false_positive_rate: P(E|not H) - probability of evidence given hypothesis false
    Returns: P(H|E)
    """
    pass

# Spam filter
p_spam = 0.30
p_flag_given_spam = 0.95
p_flag_given_ham = 0.02

result = posterior(p_spam, p_flag_given_spam, p_flag_given_ham)
print(f"P(spam | flagged) = {result:.4f}  ({result*100:.1f}%)")

# Medical test
p_disease = 0.001
sensitivity = 0.99
fpr = 0.05

medical_result = posterior(p_disease, sensitivity, fpr)
print(f"P(disease | positive test) = {medical_result:.4f}  ({medical_result*100:.1f}%)")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'posterior' not in dir():
    res = "ERROR: posterior not defined."
else:
    # Spam filter: 30% spam, 95% sensitivity, 2% FPR
    result = posterior(0.30, 0.95, 0.02)
    expected = (0.95 * 0.30) / (0.95 * 0.30 + 0.02 * 0.70)
    if abs(result - expected) > 0.001:
        res = f"ERROR: expected {expected:.4f}, got {result:.4f}"
    else:
        # Rare disease
        med = posterior(0.001, 0.99, 0.05)
        if med > 0.03:
            res = f"ERROR: rare disease test should give low posterior (<3%), got {med:.4f}"
        else:
            res = f"SUCCESS: posterior({0.30:.2f}, {0.95:.2f}, {0.02:.2f}) = {result:.4f} (spam example: {result*100:.1f}% of flagged emails are spam)"
res
`,
              hint: "p_evidence = likelihood * prior + false_positive_rate * (1 - prior). Then return likelihood * prior / p_evidence.",
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'MAP vs MLE with varying dataset size',
              difficulty: 'medium',
              prompt: 'Implement `mle(heads, total)` and `map_estimate(heads, total, alpha, beta)`. Then write `compare_estimates(true_p, n_values, prior_alpha, prior_beta)` that: (1) simulates coin flips with the given true_p, (2) for each n in n_values, computes both MLE and MAP, (3) prints which is closer to the true probability. Use `import random; random.seed(42)` and `random.random() < true_p` for each flip.',
              code: `import random
random.seed(42)

def mle(heads, total):
    """Maximum Likelihood Estimate for coin flip probability."""
    pass

def map_estimate(heads, total, alpha, beta):
    """MAP estimate with Beta(alpha, beta) prior."""
    pass

def compare_estimates(true_p, n_values, prior_alpha, prior_beta):
    """Simulate flips and compare MLE vs MAP across different dataset sizes."""
    # Generate a long sequence of flips
    flips = [1 if random.random() < true_p else 0 for _ in range(max(n_values))]

    print(f"True p = {true_p}, Prior = Beta({prior_alpha},{prior_beta})")
    print(f"{'n':>6}  {'heads':>6}  {'MLE':>8}  {'MAP':>8}  {'closer'}")
    print("-" * 45)
    for n in n_values:
        h = sum(flips[:n])
        m = mle(h, n)
        mp = map_estimate(h, n, prior_alpha, prior_beta)
        closer = "MLE" if abs(m - true_p) < abs(mp - true_p) else "MAP"
        print(f"{n:>6}  {h:>6}  {m:>8.4f}  {mp:>8.4f}  {closer}")

compare_estimates(
    true_p=0.6,
    n_values=[5, 10, 20, 50, 100, 500, 1000],
    prior_alpha=10,   # strong prior toward 0.5
    prior_beta=10
)
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import random
random.seed(42)
if 'mle' not in dir() or 'map_estimate' not in dir():
    res = "ERROR: mle or map_estimate not defined."
else:
    m = mle(7, 10)
    if abs(m - 0.7) > 0.001:
        res = f"ERROR: mle(7, 10) should be 0.7, got {m}"
    else:
        # MAP with uniform prior Beta(1,1) should equal MLE
        mp_uniform = map_estimate(7, 10, 1, 1)
        if abs(mp_uniform - 0.7) > 0.001:
            res = f"ERROR: MAP with Beta(1,1) should equal MLE=0.7, got {mp_uniform}"
        else:
            # MAP with strong prior toward 0.5 should be pulled toward 0.5
            mp_strong = map_estimate(7, 10, 20, 20)
            if mp_strong >= 0.7 or mp_strong <= 0.5:
                res = f"ERROR: MAP with Beta(20,20) should be between 0.5 and 0.7, got {mp_strong}"
            else:
                res = f"SUCCESS: mle(7,10)={mle(7,10):.3f}, map(7,10,20,20)={map_estimate(7,10,20,20):.3f} (pulled toward 0.5)"
res
`,
              hint: 'mle: return heads/total. map_estimate: return (heads + alpha - 1) / (total + alpha + beta - 2). Note: Beta(1,1) gives MAP = MLE. Beta(alpha,beta) with alpha=beta pulls toward 0.5.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: "Bayes' theorem states P(H|E) = P(E|H)·P(H) / P(E). In ML, P(H) is called:",
      options: [
        'The likelihood',
        'The prior',
        'The posterior',
        'The evidence',
      ],
      correct: 1,
      explanation: 'P(H) is the prior — your belief about H before seeing evidence. P(E|H) is the likelihood — how probable the evidence is if H is true. P(H|E) is the posterior — updated belief after evidence. P(E) is the marginal likelihood or evidence.',
    },
    {
      id: 'q2',
      question: 'A disease affects 0.1% of people. A test has 99% sensitivity and 1% false positive rate. What is approximately P(disease | positive test)?',
      options: [
        'About 99%',
        'About 50%',
        'About 9%',
        'About 0.1%',
      ],
      correct: 2,
      explanation: 'P(positive) = 0.99×0.001 + 0.01×0.999 ≈ 0.01098. P(disease|positive) ≈ 0.99×0.001 / 0.01098 ≈ 0.090. About 9%. Despite 99% accuracy, the low prior (1 in 1000) means most positives are false alarms.',
    },
    {
      id: 'q3',
      question: 'Naive Bayes is "naive" because:',
      options: [
        'It assumes features are independent given the class label',
        'It ignores the training data and uses only the prior',
        'It does not handle multi-class classification',
        'It requires features to be normally distributed',
      ],
      correct: 0,
      explanation: 'Naive Bayes assumes P(w₁,w₂,...,wₙ|class) = P(w₁|class)×P(w₂|class)×...×P(wₙ|class). Words in an email are obviously not independent, but the independence assumption is "naive" yet works well in practice.',
    },
    {
      id: 'q4',
      question: 'L2 regularization (weight decay) has a Bayesian interpretation as:',
      options: [
        'A likelihood function for the training data',
        'A Gaussian prior on the weights with mean 0',
        'A Laplace prior on the weights with mean 0',
        'A uniform prior over all possible weights',
      ],
      correct: 1,
      explanation: 'MAP with a Gaussian prior P(w) ∝ exp(-λ‖w‖²) gives: argmax log P(data|w) + log P(w) = argmax NLL - λ‖w‖². Maximizing this is equivalent to minimizing NLL + λ‖w‖², which is exactly L2 regularization.',
    },
    {
      id: 'q5',
      question: 'In a Bayesian A/B test with the Beta-Binomial model, what happens to the posterior as you collect more data?',
      options: [
        'It stays at the prior regardless of data',
        'It becomes increasingly concentrated around the true conversion rate',
        'It always converges to a uniform distribution',
        'It becomes less accurate because of prior contamination',
      ],
      correct: 1,
      explanation: 'As n → ∞, the likelihood term dominates the prior and the Beta posterior concentrates around the true rate. With a Beta(1,1) prior and 1000 observations, the posterior is essentially determined by the data alone.',
    },
  ],
}
