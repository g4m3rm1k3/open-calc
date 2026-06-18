export default {
  id: 'ae-p1-06-probability-distributions',
  slug: 'probability-distributions',
  chapter: 'ae-p1',
  order: 5,
  title: 'Probability & Distributions',
  subtitle: 'Every prediction a model makes is a probability distribution.',
  tags: ['probability', 'distributions', 'softmax', 'cross-entropy', 'sampling', 'CLT', 'bayesian'],

  hook: {
    question: 'What does it mean for a language model to "predict" the next word?',
    realWorldContext:
      'When GPT outputs a token, it does not pick one word — it outputs a probability distribution over 50,000 tokens. The temperature setting controls how sharp or flat that distribution is. Cross-entropy loss measures how wrong those distributions are during training. The entire training loop of every modern AI system is one loop: compute a probability distribution, measure how far it is from the truth, update weights. You cannot understand training without understanding probability.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Probability is about counting outcomes. Flip a fair coin 1000 times — about 500 heads, 500 tails. The probability of heads is 0.5. Now generalize: a probability distribution assigns a number between 0 and 1 to every possible outcome, and the numbers sum to 1. For discrete outcomes (like word tokens) this is a PMF — probability mass function. For continuous outcomes (like a measurement) it is a PDF — probability density function.',
      'The most important distributions in AI: Bernoulli (one flip, success probability p), Categorical (pick one of K classes — this is what a classifier outputs), Normal (the bell curve, appears everywhere via the Central Limit Theorem), and Poisson (count of rare events per interval — used in event modeling). Softmax converts a vector of raw scores (logits) into a categorical distribution by exponentiating and normalizing.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Softmax is the output layer of every classifier',
        body: 'softmax([2.0, 1.0, 0.1]) → [0.66, 0.24, 0.10]. Sum = 1. Each output is a probability. The temperature parameter τ scales logits before softmax: at τ→0, the distribution becomes a one-hot (greedy); at τ→∞, it becomes uniform (maximum randomness). LLM sampling temperature is literally this.',
      },
      {
        type: 'insight',
        title: 'The Central Limit Theorem is why Normal distributions are everywhere',
        body: 'Average any random variable (uniform, exponential, whatever) over n independent samples. As n grows, that average converges to a Normal distribution — regardless of the original shape. This is why measurement errors, noise in neural net gradients, and aggregated effects are all approximately Gaussian.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Probability & Distributions',
        mathBridge: 'PMF: P(X=k) for discrete k. PDF: f(x) where P(a<X<b) = ∫f(x)dx. Normal PDF: f(x) = (1/σ√2π) exp(-½((x-μ)/σ)²). Softmax: p_i = exp(z_i) / Σexp(z_j).',
        caption: 'Build probability distributions from scratch and see how they connect to AI training.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Core distributions from scratch',
              prose: [
                '## PMF: Discrete Distributions',
                'A PMF assigns probability to each discrete outcome. Three key ones in AI:',
                '```\nBernoulli(p):  P(X=1) = p,  P(X=0) = 1-p      ← one trial\nCategorical:   P(X=k) = p_k where Σp_k = 1     ← classifier output\nPoisson(λ):    P(X=k) = e^(-λ) λ^k / k!         ← rare event count\n```',
                '## PDF: Continuous Distributions',
                '```\nNormal(μ,σ):   f(x) = (1/σ√2π) exp(-½((x-μ)/σ)²)\nUniform(a,b):  f(x) = 1/(b-a)  for a ≤ x ≤ b\n```',
                '**Expected value** E[X] = Σ x·P(x) is the probability-weighted average.',
                '**Variance** Var(X) = E[(X-μ)²] measures spread around the mean.',
              ],
              code: `import math

def bernoulli_pmf(k, p):
    return p if k == 1 else (1 - p)

def poisson_pmf(k, lam):
    factorial = 1
    for i in range(2, k + 1):
        factorial *= i
    return (lam ** k) * math.exp(-lam) / factorial

def normal_pdf(x, mu, sigma):
    coeff = 1.0 / (sigma * math.sqrt(2 * math.pi))
    return coeff * math.exp(-0.5 * ((x - mu) / sigma) ** 2)

def expected_value(values, probs):
    return sum(v * p for v, p in zip(values, probs))

def variance(values, probs):
    mu = expected_value(values, probs)
    return sum(p * (v - mu) ** 2 for v, p in zip(values, probs))

# Fair die: 1-6, each with probability 1/6
die_values = [1, 2, 3, 4, 5, 6]
die_probs = [1/6] * 6
mu = expected_value(die_values, die_probs)
var = variance(die_values, die_probs)
print(f"Fair die: E[X] = {mu:.4f}, Var(X) = {var:.4f}, SD = {var**0.5:.4f}")

# Normal PDF values
print("\\nNormal N(0,1) PDF:")
for x in [-2, -1, 0, 1, 2]:
    print(f"  f({x:+d}) = {normal_pdf(x, 0, 1):.4f}")

# Poisson PMF for lambda=3 (e.g. avg 3 errors per 1000 tokens)
print("\\nPoisson PMF (lambda=3):")
for k in range(8):
    print(f"  P(X={k}) = {poisson_pmf(k, 3):.4f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Softmax and cross-entropy loss',
              prose: [
                '## Softmax: Logits → Probabilities',
                'A model outputs raw scores (logits). Softmax converts them to probabilities:',
                '```\nsoftmax(z)_i = exp(z_i) / Σ exp(z_j)\n```',
                '**Numerical stability trick**: subtract max(z) before exp to avoid overflow. The result is identical because exp cancels.',
                '## Cross-Entropy Loss',
                'Measures how wrong the model\'s distribution is. For the true class c:',
                '```\nL = -log(softmax(z)_c) = -log(p_c)\n```',
                'If the model is confident and correct (p_c ≈ 1): loss ≈ 0.',
                'If the model is wrong (p_c ≈ 0): loss → ∞.',
                'Training minimizes this loss — which is the same as maximizing log-likelihood.',
              ],
              code: `import math

def softmax(logits):
    # Subtract max for numerical stability (critical for large logits)
    max_logit = max(logits)
    exps = [math.exp(z - max_logit) for z in logits]
    total = sum(exps)
    return [e / total for e in exps]

def cross_entropy_loss(logits, target_class):
    probs = softmax(logits)
    # -log of the probability assigned to the true class
    return -math.log(probs[target_class])

# Standard case: model is fairly confident on class 0
logits = [2.0, 1.0, 0.1]
probs = softmax(logits)
print("Logits:", logits)
print("Softmax:", [round(p, 4) for p in probs])
print(f"Sum = {sum(probs):.6f}")
print(f"CE loss (true=class 0): {cross_entropy_loss(logits, 0):.4f}")
print(f"CE loss (true=class 2): {cross_entropy_loss(logits, 2):.4f}")

# Temperature scaling
print("\\nTemperature effect on softmax:")
for temp in [0.1, 0.5, 1.0, 2.0, 5.0]:
    scaled = [z / temp for z in logits]
    p = softmax(scaled)
    print(f"  T={temp:<4}  probs={[round(x, 3) for x in p]}  (entropy={-sum(x*math.log(x) for x in p if x>0):.3f})")

# Numerical stability: large logits
print("\\nStability test with logits [100, 101, 102]:")
large = [100, 101, 102]
print("  stable softmax:", [round(p, 4) for p in softmax(large)])`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Sampling: Box-Muller and the Central Limit Theorem',
              prose: [
                '## Sampling from Scratch',
                'Generating Normal samples without `random.gauss`: the **Box-Muller transform** converts two uniform [0,1] samples into two independent standard normals:',
                '```\nz = sqrt(-2 ln U₁) · cos(2π U₂)    ← standard normal\n```',
                '## The Central Limit Theorem in Action',
                'Take n samples from ANY distribution and compute their average. As n grows, the distribution of that average converges to a Normal — regardless of the original distribution shape.',
                'This is why gradient noise in neural networks is approximately Gaussian (each gradient is a sum of many per-sample gradients), and why we use Gaussian priors and noise models everywhere.',
              ],
              code: `import math
import random

random.seed(42)

def box_muller():
    """Generate one standard normal sample from two uniform samples."""
    u1 = random.random()
    u2 = random.random()
    # Transform: z follows N(0,1)
    z = math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
    return z

def sample_normal(mu, sigma, n):
    return [mu + sigma * box_muller() for _ in range(n)]

# Verify: 10000 samples from N(2, 3)
samples = sample_normal(mu=2, sigma=3, n=10000)
sample_mean = sum(samples) / len(samples)
sample_var = sum((x - sample_mean)**2 for x in samples) / len(samples)
print(f"N(2, 3) samples:")
print(f"  Mean: {sample_mean:.4f}  (expected 2)")
print(f"  Std:  {sample_var**0.5:.4f}  (expected 3)")

# Central Limit Theorem: average uniform samples
print("\\nCentral Limit Theorem (averaging Uniform[0,1] samples):")
print("  n   mean    std     (std should ≈ 1/sqrt(12n))")
for n in [1, 5, 30, 100]:
    avgs = [sum(random.random() for _ in range(n)) / n for _ in range(5000)]
    mu_avg = sum(avgs) / len(avgs)
    std_avg = (sum((x - mu_avg)**2 for x in avgs) / len(avgs))**0.5
    theory_std = (1/12)**0.5 / n**0.5
    print(f"  n={n:>3d}  mean={mu_avg:.4f}  std={std_avg:.4f}  theory={theory_std:.4f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Log probabilities and numerical safety',
              prose: [
                '## Why log probabilities matter',
                'A language model assigns probability to each token. The probability of a 50-word sentence is the product of 50 conditional probabilities — each typically < 0.01. That product is astronomically small and underflows to 0 in floating point.',
                '**Solution**: work in log space. log(P₁ × P₂ × ... × Pₙ) = log P₁ + log P₂ + ... + log Pₙ',
                'This is why all loss functions use log. This is why NLL (negative log-likelihood) is the training objective. This is why perplexity = exp(average NLL).',
                '## Perplexity',
                'Perplexity ≈ "how many choices does the model think it has on average at each step." A model with perplexity 10 is, on average, as confused as uniform choice over 10 options. Lower is better. GPT-2 on Wikipedia ≈ 18. GPT-4 ≈ 8.',
              ],
              code: `import math

def log_softmax(logits):
    max_logit = max(logits)
    log_sum_exp = max_logit + math.log(sum(math.exp(z - max_logit) for z in logits))
    return [z - log_sum_exp for z in logits]

def perplexity(avg_nll_nats):
    """exp(average negative log-likelihood in nats)."""
    return math.exp(avg_nll_nats)

# Why logs matter: product of small probabilities
word_prob = 0.01
n_words = 50
raw_product = word_prob ** n_words
log_sum = n_words * math.log(word_prob)
print(f"P(word)^{n_words} = {word_prob}^{n_words}")
print(f"  Raw product: {raw_product:.2e}  (underflows, becomes exactly 0 for longer text)")
print(f"  Log sum:     {log_sum:.4f}  (stable)")
print(f"  Recovered:   {math.exp(log_sum):.2e}")

# Cross-entropy loss on a batch using log_softmax
batch_logits = [
    [2.0, 1.0, 0.1],   # sample 0, true class = 0
    [0.1, 3.0, 0.5],   # sample 1, true class = 1
    [0.5, 0.2, 2.5],   # sample 2, true class = 2
]
true_classes = [0, 1, 2]

losses = []
for logits, true_cls in zip(batch_logits, true_classes):
    log_probs = log_softmax(logits)
    nll = -log_probs[true_cls]
    losses.append(nll)

avg_loss = sum(losses) / len(losses)
ppl = perplexity(avg_loss)
print(f"\\nBatch losses: {[round(l, 4) for l in losses]}")
print(f"Average NLL: {avg_loss:.4f} nats")
print(f"Perplexity: {ppl:.2f}")
print(f"(3 classes → random baseline perplexity = 3.0)")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Implement stable softmax with temperature',
              difficulty: 'easy',
              prompt: 'Implement `softmax(logits, temperature=1.0)` that divides logits by temperature before computing softmax, using the max-subtraction stability trick. Then implement `sample_categorical(probs)` that draws one sample index according to the probability distribution (using `random.random()` and cumulative probabilities).',
              code: `import random
import math

random.seed(42)

def softmax(logits, temperature=1.0):
    """Numerically stable softmax with temperature scaling."""
    pass

def sample_categorical(probs):
    """Draw one index from a categorical distribution.
    probs is a list of probabilities that sum to 1.
    Use random.random() and cumulative probabilities."""
    pass

# Test softmax
logits = [2.0, 1.0, 0.5]
p1 = softmax(logits, temperature=1.0)
p2 = softmax(logits, temperature=0.5)  # sharper
p3 = softmax(logits, temperature=2.0)  # softer
print(f"T=1.0: {[round(p, 3) for p in p1]}")
print(f"T=0.5: {[round(p, 3) for p in p2]}")
print(f"T=2.0: {[round(p, 3) for p in p3]}")

# Test sampling: should roughly match the probabilities
counts = [0, 0, 0]
for _ in range(3000):
    idx = sample_categorical(p1)
    counts[idx] += 1
empirical = [c / 3000 for c in counts]
print(f"\\nEmpirical: {[round(p, 3) for p in empirical]}")
print(f"Expected:  {[round(p, 3) for p in p1]}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math, random
if 'softmax' not in dir():
    res = "ERROR: softmax not defined."
else:
    logits = [3.0, 1.0, 0.0]
    p = softmax(logits, temperature=1.0)
    if abs(sum(p) - 1.0) > 0.001:
        res = f"ERROR: softmax should sum to 1, got {sum(p)}"
    elif p[0] < p[1] or p[1] < p[2]:
        res = f"ERROR: softmax should preserve order, got {p}"
    else:
        p_hot = softmax(logits, temperature=0.1)
        p_flat = softmax(logits, temperature=10.0)
        if p_hot[0] < 0.99:
            res = f"ERROR: T=0.1 should be near one-hot, got {p_hot}"
        elif p_flat[0] > 0.40:
            res = f"ERROR: T=10 should be near-uniform, got {p_flat}"
        else:
            random.seed(99)
            counts = [0, 0, 0]
            for _ in range(3000):
                idx = sample_categorical([0.5, 0.3, 0.2])
                counts[idx] += 1
            if counts[0] < 1200 or counts[0] > 1800:
                res = f"ERROR: sampling seems wrong — class 0 (p=0.5) got {counts[0]}/3000"
            else:
                res = "SUCCESS: softmax and sample_categorical work correctly."
res
`,
              hint: 'softmax: scale = [z/temperature for z in logits], then subtract max, exp, normalize. sample_categorical: build cumulative = [sum(probs[:i+1]) for i in range(len(probs))], draw r = random.random(), return first i where cumulative[i] >= r.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Cross-entropy loss and perplexity',
              difficulty: 'medium',
              prompt: 'Implement `batch_cross_entropy(logits_batch, true_classes)` that takes a list of logit vectors and a list of true class indices, and returns the average cross-entropy loss in nats. Then implement `perplexity(avg_nll)` = exp(avg_nll). A model that outputs uniform probabilities over C classes should have perplexity ≈ C.',
              code: `import math

def log_softmax(logits):
    max_logit = max(logits)
    log_sum_exp = max_logit + math.log(sum(math.exp(z - max_logit) for z in logits))
    return [z - log_sum_exp for z in logits]

def batch_cross_entropy(logits_batch, true_classes):
    """Average cross-entropy loss (nats) over a batch."""
    pass

def perplexity(avg_nll):
    """Convert average NLL (nats) to perplexity."""
    pass

# 3-class classification
logits_batch = [
    [2.0, 1.0, 0.1],
    [0.1, 3.0, 0.5],
    [0.5, 0.2, 2.5],
]
true_classes = [0, 1, 2]

avg_loss = batch_cross_entropy(logits_batch, true_classes)
ppl = perplexity(avg_loss)
print(f"Average CE loss: {avg_loss:.4f} nats")
print(f"Perplexity: {ppl:.2f}  (random baseline = 3.0)")

# Uniform logits should give perplexity ≈ num_classes
uniform_batch = [[0.0, 0.0, 0.0]] * 10
labels = list(range(3)) * 3 + [0]
uniform_loss = batch_cross_entropy(uniform_batch, labels)
print(f"\\nUniform logits: loss = {uniform_loss:.4f}, perplexity = {perplexity(uniform_loss):.2f}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'batch_cross_entropy' not in dir():
    res = "ERROR: batch_cross_entropy not defined."
elif 'perplexity' not in dir():
    res = "ERROR: perplexity not defined."
else:
    # Perfect predictions should give loss near 0
    perfect = [[10.0, -10.0, -10.0]]
    loss_perfect = batch_cross_entropy(perfect, [0])
    if loss_perfect > 0.001:
        res = f"ERROR: perfect prediction should have loss ≈ 0, got {loss_perfect}"
    else:
        # Uniform over 3 classes -> perplexity ≈ 3
        uniform = [[0.0, 0.0, 0.0]] * 10
        labels = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0]
        loss_uniform = batch_cross_entropy(uniform, labels)
        ppl = perplexity(loss_uniform)
        if abs(ppl - 3.0) > 0.01:
            res = f"ERROR: uniform over 3 classes should have perplexity ≈ 3.0, got {ppl}"
        else:
            res = "SUCCESS: batch_cross_entropy and perplexity work correctly."
res
`,
              hint: 'batch_cross_entropy: for each (logits, cls) pair, compute log_softmax(logits)[cls], negate, average. perplexity: return math.exp(avg_nll). For uniform logits [0,0,0]: softmax = [1/3, 1/3, 1/3], loss = -log(1/3) = log(3) ≈ 1.099, perplexity = e^1.099 ≈ 3.0.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'A model outputs logits [3.0, 1.0, 0.5]. After softmax, which is true?',
      options: [
        'All outputs are negative since logits can be negative',
        'Outputs sum to 1 and the first is largest',
        'Outputs are proportional to the logits directly',
        'The outputs are the same as the inputs divided by their sum',
      ],
      correct: 1,
      explanation: 'Softmax exponentiates then normalizes: exp([3,1,0.5]) ≈ [20.1, 2.7, 1.6], sum ≈ 24.4, probs ≈ [0.82, 0.11, 0.07]. Always positive, sum to 1, largest logit → largest probability.',
    },
    {
      id: 'q2',
      question: 'Why do we subtract the maximum logit before computing softmax?',
      options: [
        'To speed up the computation',
        'To prevent overflow when exp(large_number) exceeds float range',
        'To normalize the logits to the range [0,1]',
        'To ensure the largest class always gets probability > 0.5',
      ],
      correct: 1,
      explanation: 'exp(1000) = inf in float32. Subtracting max shifts everything so exp(max - max) = exp(0) = 1, preventing overflow. The result is mathematically identical because the shift cancels in numerator and denominator.',
    },
    {
      id: 'q3',
      question: 'Cross-entropy loss is -log(p_correct). When does the loss equal 0?',
      options: [
        'When the model assigns 50% to the correct class',
        'Never — cross-entropy is always positive',
        'When the model assigns probability 1.0 to the correct class',
        'When all class probabilities are equal',
      ],
      correct: 2,
      explanation: '-log(1.0) = 0. In practice, softmax never reaches exactly 1.0, but with very confident correct predictions the loss approaches 0. When the model is completely wrong (p ≈ 0), loss → ∞.',
    },
    {
      id: 'q4',
      question: 'What does a language model perplexity of 10 mean?',
      options: [
        'The model made errors on 10% of tokens',
        'The model is as uncertain as uniform guessing over 10 options at each step',
        'The model requires 10 training epochs to converge',
        'The model has 10 billion parameters',
      ],
      correct: 1,
      explanation: 'Perplexity = exp(average NLL). If perplexity = 10, the model is on average as uncertain as picking uniformly from 10 choices. Lower is better. A random baseline over a vocab of size V has perplexity = V.',
    },
    {
      id: 'q5',
      question: 'The Central Limit Theorem says that as n grows, the average of n independent samples from ANY distribution converges to:',
      options: [
        'A uniform distribution over [0,1]',
        'The original distribution scaled by 1/n',
        'A Normal (Gaussian) distribution',
        'An exponential distribution with rate n',
      ],
      correct: 2,
      explanation: 'Regardless of the original distribution (uniform, Poisson, exponential, etc.), the sample mean converges to Normal(μ, σ²/n) as n→∞. This is why Gaussian assumptions appear everywhere in statistics and ML.',
    },
  ],
}
