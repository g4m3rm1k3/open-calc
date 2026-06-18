export default {
  id: 'ae-p1-09-information-theory',
  slug: 'information-theory',
  chapter: 'ae-p1',
  order: 8,
  title: 'Information Theory',
  subtitle: 'Entropy, cross-entropy, KL divergence — the three quantities that define how AI models learn.',
  tags: ['information-theory', 'entropy', 'cross-entropy', 'KL-divergence', 'mutual-information', 'perplexity', 'label-smoothing'],

  hook: {
    question: 'Why is the neural network loss function called "cross-entropy"?',
    realWorldContext:
      'Cross-entropy is a concept from information theory — specifically Claude Shannon\'s 1948 paper that founded the entire field. Information theory asks: what is the minimum number of bits needed to encode a message? Entropy is the answer for the optimal code. Cross-entropy is the cost when you encode using the wrong distribution. When a neural network minimizes cross-entropy loss, it is literally trying to make its distribution match the true data distribution — building the most efficient possible encoder for the task. Perplexity (how language models are evaluated), KL divergence (in VAEs and distillation), and mutual information (in feature selection) all come from the same framework.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Information content of an event is -log₂(P(event)). An event with probability 0.5 carries 1 bit. An event with probability 0.125 carries 3 bits. A certain event (P=1) carries 0 bits. Surprise and information are the same thing. Entropy H(X) = -Σ P(x) log P(x) is the average information (bits) across all outcomes. The uniform distribution has maximum entropy — all outcomes are equally surprising. A deterministic distribution has zero entropy — you know exactly what will happen.',
      'Cross-entropy H(P,Q) = -Σ P(x) log Q(x) measures the average number of bits needed to encode events from distribution P using a code optimized for distribution Q. If your model Q is wrong, you need more bits than the optimal H(P). The extra bits are the KL divergence: KL(P||Q) = H(P,Q) - H(P). Training a neural network to minimize cross-entropy loss is the same as minimizing KL divergence from the model distribution to the data distribution — making the model as close as possible to the truth.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Cross-entropy loss = negative log-likelihood = KL minimization',
        body: 'H(P,Q) = -Σ P(x) log Q(x). In classification: P is the one-hot true label, Q is the model output. So H(P,Q) = -log Q(true_class). That is the standard cross-entropy loss. Minimizing it over a training set is equivalent to maximizing log-likelihood and minimizing KL(data || model).',
      },
      {
        type: 'insight',
        title: 'KL divergence is not symmetric — this matters',
        body: 'KL(P||Q) ≠ KL(Q||P). KL(P||Q) is "how much does Q underfit P" — large when Q assigns near-zero to events that P has. KL(Q||P) is "how much does Q overfit P" — large when Q spreads probability to events P ignores. VAEs minimize KL(Q||P) which encourages Q to be a single concentrated mode rather than covering all of P.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Information Theory',
        mathBridge: 'H(X) = -Σ p log p. H(P,Q) = -Σ p log q. KL(P||Q) = Σ p log(p/q). Identity: H(P,Q) = H(P) + KL(P||Q).',
        caption: 'Build entropy, cross-entropy, KL divergence, and mutual information from scratch.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Entropy: measuring uncertainty',
              prose: [
                '## Information Content',
                '```\nI(x) = -log₂(P(x))  bits\n\nP=1.0:  I = 0 bits   (certain, no surprise)\nP=0.5:  I = 1 bit    (fair coin)\nP=0.25: I = 2 bits   (one of four)\nP=0.01: I ≈ 6.6 bits (rare event)\n```',
                '## Shannon Entropy',
                '```\nH(X) = -Σ P(x) log₂ P(x)    (bits)\nH(X) = -Σ P(x) ln P(x)       (nats, for ML)\n```',
                '**Maximum entropy**: uniform distribution — everything equally surprising.',
                '**Zero entropy**: deterministic — no uncertainty.',
              ],
              code: `import math

def information_content(p, base=2):
    if p <= 0: return float('inf')
    if p >= 1: return 0.0
    return -math.log(p) / math.log(base)

def entropy(probs, base=2):
    return sum(p * information_content(p, base) for p in probs if p > 0)

# Information content examples
print("Information content (-log P):")
for name, p in [("Certain (P=1.0)", 1.0), ("Fair coin (P=0.5)", 0.5),
                 ("1 in 6 (P=1/6)", 1/6), ("Rare (P=0.01)", 0.01)]:
    print(f"  {name:<22}  I = {information_content(p):.4f} bits")

# Entropy of various distributions
print("\\nEntropy H(X) in bits:")
distributions = {
    "Fair coin [0.5, 0.5]": [0.5, 0.5],
    "Biased coin [0.9, 0.1]": [0.9, 0.1],
    "Fair die [1/6 × 6]": [1/6]*6,
    "One-hot [1,0,0,0]": [1.0, 0, 0, 0],
    "Uniform over 256 tokens": [1/256]*256,
}
for name, probs in distributions.items():
    h = entropy(probs)
    max_h = math.log2(len(probs))
    print(f"  {name:<32}  H = {h:.4f} bits  (max = {max_h:.4f})")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Cross-entropy and KL divergence',
              prose: [
                '## Cross-Entropy: Encoding with the Wrong Distribution',
                '```\nH(P, Q) = -Σ P(x) log Q(x)\n```',
                'P is the true distribution. Q is your model. H(P,Q) is the average bits needed to encode events from P using a code designed for Q.',
                '## KL Divergence: The Extra Cost',
                '```\nKL(P || Q) = H(P,Q) - H(P) = Σ P(x) log(P(x)/Q(x))\n```',
                'KL ≥ 0 always (Gibbs inequality). KL = 0 only when P = Q.',
                '## Key Identity',
                '```\nH(P,Q) = H(P) + KL(P||Q)\n\nCross-entropy = True entropy + Extra cost from being wrong\n```',
                'Minimizing cross-entropy = minimizing KL(data || model), subject to H(data) being constant.',
              ],
              code: `import math

def entropy(probs, base=2):
    return sum(-p * math.log(p)/math.log(base) for p in probs if p > 0)

def cross_entropy(p, q, base=2):
    total = 0.0
    for pi, qi in zip(p, q):
        if pi > 0:
            if qi <= 0: return float('inf')
            total += pi * (-math.log(qi) / math.log(base))
    return total

def kl_divergence(p, q, base=2):
    return cross_entropy(p, q, base) - entropy(p, base)

# True distribution and two model approximations
true_dist = [0.7, 0.2, 0.1]
good_model = [0.6, 0.25, 0.15]  # close to truth
bad_model  = [0.1, 0.1, 0.8]   # very wrong

h_true = entropy(true_dist)
print(f"True entropy H(P):          {h_true:.4f} bits")
print()

for name, model in [("Good model", good_model), ("Bad model", bad_model)]:
    ce = cross_entropy(true_dist, model)
    kl = kl_divergence(true_dist, model)
    print(f"{name}:  {model}")
    print(f"  Cross-entropy H(P,Q):  {ce:.4f} bits")
    print(f"  KL(P || Q):            {kl:.4f} bits")
    print(f"  Verify: H(P) + KL = {h_true:.4f} + {kl:.4f} = {h_true+kl:.4f}  (CE = {ce:.4f})")
    print()

# KL is not symmetric
p, q = [0.9, 0.1], [0.5, 0.5]
print(f"KL asymmetry:  P={p},  Q={q}")
print(f"  KL(P || Q) = {kl_divergence(p, q):.4f}  (mode-seeking: Q must cover where P is large)")
print(f"  KL(Q || P) = {kl_divergence(q, p):.4f}  (mean-seeking: Q spreads to cover Q support)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Perplexity and mutual information',
              prose: [
                '## Perplexity',
                'Perplexity = exp(H(P,Q)) in nats = 2^H(P,Q) in bits.',
                'Intuitive meaning: "the model is as uncertain as choosing uniformly over N outcomes." Lower is better. Random model over V vocab = perplexity V. Good LLM ≈ 8.',
                '## Mutual Information',
                '```\nI(X; Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)\n       = H(X) + H(Y) - H(X,Y)\n```',
                'How much does knowing Y tell you about X? I(X;Y) = 0 means independent. Used in feature selection: features with high MI with the label are useful.',
              ],
              code: `import math

def entropy(probs, base=2):
    return sum(-p * math.log(p)/math.log(base) for p in probs if p > 0)

def mutual_information(joint, base=2):
    """joint is a 2D list of P(X=i, Y=j) values summing to 1."""
    rows = len(joint)
    cols = len(joint[0])
    margin_x = [sum(joint[i][j] for j in range(cols)) for i in range(rows)]
    margin_y = [sum(joint[i][j] for i in range(rows)) for j in range(cols)]
    mi = 0.0
    for i in range(rows):
        for j in range(cols):
            pxy = joint[i][j]
            if pxy > 0 and margin_x[i] > 0 and margin_y[j] > 0:
                mi += pxy * math.log(pxy / (margin_x[i] * margin_y[j])) / math.log(base)
    return mi

# Perplexity
import random
random.seed(42)
vocab_size = 50000
avg_nll = math.log(vocab_size)  # baseline: uniform over vocab
print(f"Random baseline (vocab={vocab_size}): perplexity = {math.exp(avg_nll):.0f}")
print(f"GPT-4 level (NLL ≈ 2.1 nats):       perplexity ≈ {math.exp(2.1):.1f}")
print(f"GPT-2 level (NLL ≈ 2.9 nats):       perplexity ≈ {math.exp(2.9):.1f}")

# Mutual information examples
print("\\nMutual Information I(X; Y):")

independent = [[0.25, 0.25], [0.25, 0.25]]
strongly_dependent = [[0.45, 0.05], [0.05, 0.45]]
weakly_dependent   = [[0.3, 0.2], [0.1, 0.4]]

print(f"  Independent (weather vs random num):    I = {mutual_information(independent):.4f} bits")
print(f"  Strongly dependent (weather vs umbrella): I = {mutual_information(strongly_dependent):.4f} bits")
print(f"  Weakly dependent:                       I = {mutual_information(weakly_dependent):.4f} bits")

# Feature selection
print("\\nFeature selection via MI:")
import random; random.seed(42)
n = 300
target = [random.choice([0,1]) for _ in range(n)]
features = {
    "strong_signal": [t ^ (1 if random.random() < 0.05 else 0) for t in target],
    "weak_signal":   [t ^ (1 if random.random() < 0.35 else 0) for t in target],
    "random_noise":  [random.choice([0,1]) for _ in range(n)],
}
for fname, feat in features.items():
    j = [[0,0],[0,0]]
    for f, t in zip(feat, target):
        j[f][t] += 1
    j_p = [[c/n for c in row] for row in j]
    mi = mutual_information(j_p)
    print(f"  {fname:<16}  I = {mi:.4f} bits")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Label smoothing and practical CE loss',
              prose: [
                '## Label Smoothing',
                'Standard cross-entropy uses a one-hot target: [0, 0, 1, 0, 0] for class 2. This forces the model to output probability 1.0 for the true class — which requires logits → ∞ and causes overconfident predictions.',
                '**Label smoothing** softens the target: instead of P(true) = 1.0, use P(true) = 1-ε and distribute ε uniformly across all other classes.',
                'Effect: adds extra entropy to the target, acting as a regularizer. Used in GPT-3, BERT, and modern vision transformers.',
                '## Bits vs Nats',
                '```\nbits:  log base 2   (information encoding)\nnats:  log base e   (ML training, perplexity)\n1 bit = ln(2) ≈ 0.693 nats\n```',
              ],
              code: `import math

def entropy(probs, base=2):
    return sum(-p * math.log(p)/math.log(base) for p in probs if p > 0)

def cross_entropy(p, q, base=math.e):
    return sum(-pi * math.log(qi)/math.log(base) for pi, qi in zip(p, q) if pi > 0 and qi > 0)

# Label smoothing effect
num_classes = 10
true_class = 3

def label_smooth(true_cls, num_cls, eps):
    target = [eps / num_cls] * num_cls
    target[true_cls] = (1 - eps) + eps / num_cls
    return target

# Model outputs (simulate decent model)
import random; random.seed(42)
logits = [random.gauss(0, 1) for _ in range(num_classes)]
logits[true_class] += 2.0  # bias toward correct class
max_l = max(logits)
exps = [math.exp(z - max_l) for z in logits]
total = sum(exps)
model_probs = [e/total for e in exps]

print(f"Model output (softmax):")
print(f"  True class {true_class} gets: {model_probs[true_class]:.4f}")
print()
print(f"{'Label smoothing':>20}  {'Target H':>10}  {'CE Loss':>10}")
print("-" * 44)
for eps in [0.0, 0.05, 0.1, 0.2]:
    target = label_smooth(true_class, num_classes, eps)
    h_target = entropy(target, base=math.e)
    ce = cross_entropy(target, model_probs)
    print(f"  eps={eps:<5}  target={[round(t,3) for t in target[:3]]}...  H={h_target:.4f}  CE={ce:.4f}")

# bits vs nats conversion
print("\\nBits vs Nats:")
print(f"  ln(2) = {math.log(2):.6f}  → 1 bit = {math.log(2):.6f} nats")
print(f"  Fair coin entropy: {entropy([0.5,0.5], base=2):.4f} bits = {entropy([0.5,0.5], base=math.e):.4f} nats")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Implement entropy and cross-entropy',
              difficulty: 'easy',
              prompt: 'Implement `entropy(probs)` in nats (natural log) and `cross_entropy(p, q)` in nats. Verify the identity H(P,Q) = H(P) + KL(P||Q) using a concrete example.',
              code: `import math

def entropy(probs):
    """Shannon entropy in nats (base e)."""
    pass

def cross_entropy(p, q):
    """Cross-entropy H(P,Q) in nats."""
    pass

def kl_divergence(p, q):
    """KL divergence in nats. Already implemented for you."""
    return sum(pi * math.log(pi/qi) for pi, qi in zip(p, q) if pi > 0 and qi > 0)

# Test distributions
p = [0.5, 0.3, 0.2]
q = [0.4, 0.35, 0.25]

h_p = entropy(p)
ce_pq = cross_entropy(p, q)
kl_pq = kl_divergence(p, q)

print(f"H(P):            {h_p:.6f} nats")
print(f"H(P,Q):          {ce_pq:.6f} nats")
print(f"KL(P||Q):        {kl_pq:.6f} nats")
print(f"H(P) + KL:       {h_p + kl_pq:.6f} nats")
print(f"Identity holds:  {abs(ce_pq - (h_p + kl_pq)) < 1e-10}")

# Minimum cross-entropy is when Q = P
ce_self = cross_entropy(p, p)
print(f"\\nH(P,P) = H(P)?  {abs(ce_self - h_p) < 1e-10}  (should be True)")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'entropy' not in dir() or 'cross_entropy' not in dir():
    res = "ERROR: entropy or cross_entropy not defined."
else:
    # Uniform binary: H = log(2) ≈ 0.693 nats
    h_coin = entropy([0.5, 0.5])
    if abs(h_coin - math.log(2)) > 0.001:
        res = f"ERROR: entropy([0.5,0.5]) should be {math.log(2):.4f} nats, got {h_coin:.4f}"
    else:
        # Identity H(P,Q) = H(P) + KL(P||Q)
        p = [0.5, 0.3, 0.2]; q = [0.4, 0.35, 0.25]
        h_p = entropy(p)
        ce = cross_entropy(p, q)
        kl = sum(pi*math.log(pi/qi) for pi,qi in zip(p,q) if pi>0)
        if abs(ce - (h_p + kl)) > 1e-8:
            res = f"ERROR: H(P,Q) = H(P)+KL(P||Q) failed: {ce:.6f} != {h_p+kl:.6f}"
        else:
            # H(P,P) = H(P)
            ce_self = cross_entropy(p, p)
            if abs(ce_self - h_p) > 1e-10:
                res = f"ERROR: H(P,P) should equal H(P)={h_p:.6f}, got {ce_self:.6f}"
            else:
                res = "SUCCESS: entropy and cross_entropy are correct. Identity H(P,Q)=H(P)+KL holds."
res
`,
              hint: 'entropy: return -sum(p * math.log(p) for p in probs if p > 0). cross_entropy: return -sum(pi * math.log(qi) for pi,qi in zip(p,q) if pi > 0 and qi > 0). Both use natural log (math.log).',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Feature selection using mutual information',
              difficulty: 'medium',
              prompt: 'Implement `mutual_information(feature, target)` where both are binary lists (0/1). Build the joint probability matrix, compute MI = I(X;Y) in bits. Then rank features by their MI with the target.',
              code: `import math
import random

random.seed(42)

def mutual_information(feature, target):
    """
    Compute mutual information I(X;Y) in bits between two binary sequences.
    feature, target: lists of 0s and 1s
    Returns MI in bits.
    """
    pass

# Generate features with different relationships to target
n = 500
target = [random.choice([0, 1]) for _ in range(n)]

features = {
    "perfect":   target[:],                                                # MI = 1 bit (perfect predictor)
    "strong":    [t ^ (1 if random.random() < 0.05 else 0) for t in target],  # 5% noise
    "medium":    [t ^ (1 if random.random() < 0.25 else 0) for t in target],  # 25% noise
    "weak":      [t ^ (1 if random.random() < 0.4 else 0) for t in target],   # 40% noise
    "noise":     [random.choice([0, 1]) for _ in range(n)],               # random, MI ≈ 0
}

print(f"{'Feature':>10}  {'MI (bits)':>12}  {'Ranking'}")
print("-" * 40)
scores = [(name, mutual_information(feat, target)) for name, feat in features.items()]
scores.sort(key=lambda x: x[1], reverse=True)
for rank, (name, mi) in enumerate(scores, 1):
    bar = "#" * int(mi * 40)
    print(f"{name:>10}  {mi:>12.4f}  {bar}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math, random
if 'mutual_information' not in dir():
    res = "ERROR: mutual_information not defined."
else:
    random.seed(42)
    n = 500
    t = [random.choice([0,1]) for _ in range(n)]
    # Perfect predictor should have MI close to 1 bit
    mi_perfect = mutual_information(t, t)
    if abs(mi_perfect - 1.0) > 0.05:
        res = f"ERROR: mutual_information of identical sequences should be ~1.0, got {mi_perfect:.4f}"
    else:
        # Independent should have MI near 0
        rand = [random.choice([0,1]) for _ in range(n)]
        mi_rand = mutual_information(rand, t)
        if mi_rand > 0.05:
            res = f"ERROR: mutual_information of random sequences should be ~0, got {mi_rand:.4f}"
        else:
            # Noisy predictor should be between 0 and 1
            noisy = [x ^ (1 if random.random() < 0.2 else 0) for x in t]
            mi_noisy = mutual_information(noisy, t)
            if not (0.1 < mi_noisy < 0.9):
                res = f"ERROR: 20%-noisy predictor MI should be between 0.1 and 0.9, got {mi_noisy:.4f}"
            else:
                res = f"SUCCESS: MI(identical)={mi_perfect:.4f}, MI(noisy)={mi_noisy:.4f}, MI(random)={mi_rand:.4f}"
res
`,
              hint: 'Count joint occurrences: joint[f][t] for f,t in zip(feature,target). Normalize by n. Compute marginals: margin_x = [sum(joint[i]) for i in 0,1]. Then MI = sum over i,j of joint[i][j] * log2(joint[i][j] / (margin_x[i] * margin_y[j])). Skip terms where joint[i][j] == 0.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What is the entropy of a fair 6-sided die in bits?',
      options: [
        '1 bit',
        '2.585 bits (log₂(6))',
        '6 bits',
        '0 bits (deterministic)',
      ],
      correct: 1,
      explanation: 'A fair die has P(k) = 1/6 for each face. H = -6×(1/6)×log₂(1/6) = log₂(6) ≈ 2.585 bits. In general, a uniform distribution over N outcomes has entropy log₂(N) bits.',
    },
    {
      id: 'q2',
      question: 'Cross-entropy H(P,Q) and KL divergence KL(P||Q) are related by:',
      options: [
        'H(P,Q) = H(P) - KL(P||Q)',
        'H(P,Q) = KL(P||Q)',
        'H(P,Q) = H(P) + KL(P||Q)',
        'H(P,Q) = H(P) × KL(P||Q)',
      ],
      correct: 2,
      explanation: 'H(P,Q) = H(P) + KL(P||Q). Cross-entropy equals the true entropy (irreducible bits) plus the KL divergence (extra bits due to using the wrong distribution). Minimizing cross-entropy is equivalent to minimizing KL since H(P) is constant.',
    },
    {
      id: 'q3',
      question: 'KL(P||Q) vs KL(Q||P): which is penalized more when Q assigns near-zero probability to an event that P says is common?',
      options: [
        'KL(Q||P) is larger, because Q spreads probability to unlikely events',
        'KL(P||Q) is larger, because P says the event is common but Q nearly ignores it',
        'They are always equal since both measure distribution difference',
        'Neither — KL divergence only measures how different the total probability is',
      ],
      correct: 1,
      explanation: 'KL(P||Q) = Σ P(x) log(P(x)/Q(x)). When P(x) is large and Q(x) ≈ 0, the term P(x)·log(P(x)/Q(x)) → ∞. KL(P||Q) is called the "forward KL" and penalizes mass-covering failures — Q must cover everything P assigns probability to.',
    },
    {
      id: 'q4',
      question: 'A language model has perplexity 100 on a test set. A random model guessing uniformly over the vocabulary should have perplexity equal to:',
      options: [
        '1 (random model has minimum perplexity)',
        'The vocabulary size',
        '100 (same as the language model)',
        '0 (random model has zero perplexity)',
      ],
      correct: 1,
      explanation: 'A uniform model assigns probability 1/V to each token. Average NLL = log(V). Perplexity = exp(log(V)) = V. If vocabulary is 50,000 and the model has perplexity 100, it is performing 500× better than random guessing.',
    },
    {
      id: 'q5',
      question: 'Label smoothing replaces the one-hot target [0,0,1,0] with a softer target. What is the main benefit?',
      options: [
        'It makes training faster by reducing the gradient magnitude',
        'It prevents overconfident predictions and acts as a regularizer',
        'It eliminates the need for a softmax layer',
        'It reduces the vocabulary size of the model',
      ],
      correct: 1,
      explanation: 'One-hot targets require the model to push logit of the true class to +∞. Label smoothing caps the target at (1-ε) + ε/K, preventing logit collapse. The added entropy in the target distribution acts as regularization, improving calibration and generalization.',
    },
  ],
}
