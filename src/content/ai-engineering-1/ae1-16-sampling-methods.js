export default {
  id: 'ae-p1-16-sampling-methods',
  slug: 'sampling-methods',
  chapter: 'ae-p1',
  order: 15,
  title: 'Sampling Methods',
  subtitle: 'Sampling is how AI explores the space of possibilities.',
  tags: ['sampling', 'MCMC', 'temperature', 'top-k', 'top-p', 'reparameterization', 'Monte-Carlo', 'rejection-sampling'],

  hook: {
    question: 'A language model produces 50,000 logits — one per vocabulary token. How does it pick the next word, and why does the choice matter for creativity vs accuracy?',
    realWorldContext:
      'If the model always picks the highest-probability token, every response is identical and deterministic. If it picks uniformly at random, the output is gibberish. The answer lives between these extremes, controlled by sampling. But sampling is not limited to text. Reinforcement learning estimates policy gradients by sampling trajectories. VAEs learn latent representations by sampling from distributions and backpropagating through the randomness (reparameterization trick). Diffusion models generate images through iterative denoising — each step is a conditional sampling operation. Every generative AI system is a sampling system, and the strategy determines quality, diversity, and controllability.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Every sampling method starts from Uniform(0, 1): U ~ Uniform(0,1) where P(a ≤ U ≤ b) = b − a. A single uniform random number contains exactly enough randomness to produce one sample from any distribution. The trick is finding the right transformation. Inverse CDF method (inverse transform sampling): the CDF F(x) = P(X ≤ x) maps values to probabilities. Its inverse maps probabilities back to values. If U ~ Uniform(0,1), then X = F⁻¹(U) follows the target distribution. Why? P(X ≤ x) = P(F⁻¹(U) ≤ x) = P(U ≤ F(x)) = F(x). Exponential example: F(x) = 1 − e^(−λx). Solving F(x) = u gives x = −ln(u)/λ. This is how you generate exponential samples from uniform random numbers.',
      'Rejection sampling: when you cannot invert the CDF but can evaluate the target PDF p(x), find a proposal q(x) you can sample from and a bound M where p(x) ≤ M·q(x) for all x. Algorithm: (1) sample x ~ q(x); (2) sample u ~ Uniform(0,1); (3) accept x if u < p(x)/(M·q(x)), otherwise reject and repeat. Acceptance rate = 1/M. In low dimensions (1–3), this works well. In high dimensions, the acceptance rate drops exponentially — most of the proposal volume gets rejected. This is the curse of dimensionality for rejection sampling.',
      'Importance sampling: when you need to estimate E_p[f(x)] but only have samples from a different distribution q(x), rewrite the expectation: E_p[f(x)] = ∫f(x)·(p(x)/q(x))·q(x)dx = E_q[f(x)·w(x)] where w(x) = p(x)/q(x) are importance weights. Estimate as (1/N)·Σf(xᵢ)·w(xᵢ) where xᵢ ~ q(x). Critical in reinforcement learning: PPO collects trajectories under old policy π_old but optimizes new policy π_new. The importance weight is π_new(a|s)/π_old(a|s). PPO clips these weights to prevent the new policy from diverging too far.',
      'Monte Carlo estimation: approximate integrals by averaging random samples. Goal: I = ∫g(x)dx over domain D. Sample x₁,...,xₙ uniformly, estimate I ≈ (Volume of D / N)·Σg(xᵢ). Error is O(1/√N) regardless of dimension. In d dimensions, a grid with k points per dimension needs kᵈ points. Monte Carlo always needs N points regardless of dimension. This is why Monte Carlo dominates in high dimensions. Estimating π: sample (x, y) uniformly from [−1,1]², count how many fall inside the unit circle (x²+y² ≤ 1), π ≈ 4·(count inside)/N.',
      'Metropolis-Hastings MCMC: constructs a Markov chain whose stationary distribution is the target p(x). Start at x₀. Repeatedly: (1) propose x\' ~ q(x\'|x_t); (2) compute acceptance ratio α = [p(x\')·q(x_t|x\')] / [p(x_t)·q(x\'|x_t)]; (3) accept x\' with probability min(1, α), otherwise stay at x_t. Discard first B samples (burn-in). Why it works: the acceptance rule ensures detailed balance p(x)·T(x→y) = p(y)·T(y→x), which guarantees p(x) is the stationary distribution. Practical note: optimal acceptance rate for Gaussian proposals in high dimensions is ~23%. Too small a proposal → slow exploration. Too large → most proposals rejected, chain stays stuck.',
      'Temperature sampling for LLMs: a language model outputs logits z₁,...,zᵥ. Softmax converts to probabilities. Temperature T rescales logits before softmax: pᵢ = exp(zᵢ/T) / Σexp(zⱼ/T). T → 0: argmax (deterministic, always picks highest logit). T → ∞: uniform (all equally likely). T < 1: sharpens distribution (more confident). T > 1: flattens (more diverse). Typical settings: T = 0 for factual Q&A, T = 0.3–0.7 for code, T = 0.7–1.0 for conversation, T > 1 for creative writing.',
      'Top-k sampling: keep only the k tokens with highest probability, renormalize, sample from that restricted set. k = 1 is greedy. k = 40 is typical. Problem: k is fixed regardless of context. When the model is confident (one token at 95% probability), k = 40 still allows 39 unlikely alternatives. When uncertain (probability spread across 1000 tokens), k = 40 cuts off plausible options. Top-p (nucleus) sampling fixes this: keep the smallest set of tokens whose cumulative probability exceeds p. When confident → few tokens kept. When uncertain → many kept. This adaptive behavior is why top-p generally outperforms top-k. Common combo: temperature = 0.7 + top-p = 0.9.',
      'Reparameterization trick: VAEs encode inputs as distributions in latent space, sample from the distribution, decode the sample. Problem — you cannot backpropagate through a sampling operation. z ~ N(μ, σ²) introduces stochastic discontinuity: ∂(sample)/∂μ is undefined. Solution: separate the randomness from the parameters. ε ~ N(0,1), z = μ + σ·ε. Now z is a deterministic, differentiable function of μ and σ. ∂z/∂μ = 1, ∂z/∂σ = ε. Gradients flow. N(μ, σ²) and μ + σ·N(0,1) have the same distribution, so this is mathematically equivalent. This single insight made VAEs trainable with standard backpropagation.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why inverse CDF is not used for normal distributions',
        body: 'The exponential CDF has a closed-form inverse: F⁻¹(u) = −ln(u)/λ. The normal CDF does NOT — it involves the error function erf(x) which has no algebraic closed form. To generate normal samples, use the Box-Muller transform instead: sample two uniforms u₁, u₂, return z = √(−2·ln(u₁))·cos(2π·u₂). This produces exactly N(0,1) samples via the change-of-variables formula on the 2D joint distribution.',
      },
      {
        type: 'insight',
        title: 'The reparameterization trick is what makes VAEs work',
        body: 'Standard sampling: z ~ N(μ, σ²) — stochastic node blocks gradient flow. Training requires gradients to flow from the decoder loss back through z to the encoder parameters μ, σ.\n\nReparameterized: ε ~ N(0,1), z = μ + σ·ε — z is now a deterministic function of parameters. Gradient flows: ∂L/∂μ = ∂L/∂z · 1, ∂L/∂σ = ∂L/∂z · ε.\n\nWithout this trick, you would need policy-gradient methods (REINFORCE) to estimate gradients, which have much higher variance and are much harder to train.',
      },
      {
        type: 'procedure',
        title: 'Choosing a sampling strategy for LLM inference',
        steps: [
          'Deterministic tasks (math, code, factual Q&A): use temperature = 0 (greedy)',
          'General conversation: temperature = 0.7 + top-p = 0.9',
          'Creative writing / brainstorming: temperature = 1.0–1.2 + top-p = 0.95',
          'Never set temperature > 1.5 unless you want incoherent output',
          'Add top-k = 50 as a safety net to block hallucinated tokens in the long tail',
          'Test with multiple seeds at your chosen temperature before finalizing',
        ],
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        type: 'PythonNotebook',
        cells: [
          {
            id: 1,
            prose: [
              'The inverse CDF method is the cleanest way to understand sampling. If you can write down the inverse of the CDF, you can turn any uniform random number into a sample from your target distribution.',
              'Exponential(λ): CDF is F(x) = 1 − e^(−λx). Invert it: set u = 1 − e^(−λx), solve for x: x = −ln(1−u)/λ. Since (1−U) and U have the same Uniform(0,1) distribution, simplify to x = −ln(u)/λ.',
              'Verify: the mean of Exponential(λ) is 1/λ. Generate 10,000 samples and check that the empirical mean converges to the theoretical value.',
            ],
            code: `import math
import random

random.seed(42)

def sample_exponential(lam):
    """Inverse CDF: x = -ln(u) / lambda where u ~ Uniform(0,1)."""
    u = random.random()
    return -math.log(u) / lam

# Generate samples and verify the mean
lam = 2.0                      # theoretical mean = 1/lambda = 0.5
n_samples = 10000
samples = [sample_exponential(lam) for _ in range(n_samples)]

empirical_mean = sum(samples) / len(samples)
empirical_var  = sum((x - empirical_mean)**2 for x in samples) / (len(samples)-1)
theoretical_mean = 1.0 / lam
theoretical_var  = 1.0 / (lam ** 2)

print(f"lambda = {lam},  n = {n_samples}")
print(f"Empirical mean:     {empirical_mean:.4f}   (theoretical: {theoretical_mean:.4f})")
print(f"Empirical variance: {empirical_var:.4f}   (theoretical: {theoretical_var:.4f})")

# Histogram (ASCII) to show the shape
buckets = [0] * 10
for x in samples:
    b = min(int(x * lam * 2), 9)   # map [0, ~5] -> [0, 9]
    buckets[b] += 1

print("\\nHistogram (should look like exponential decay):")
for i, count in enumerate(buckets):
    bar = '#' * (count // 100)
    print(f"  [{i*0.5:.1f}-{(i+1)*0.5:.1f}] {bar} ({count})")`,
          },
          {
            id: 2,
            prose: [
              'Temperature, top-k, and top-p are the three sampling controls that every LLM engineer uses daily. Build them from scratch to understand exactly what they do to the probability distribution.',
              'Start with a small vocabulary of 8 tokens with some logits. Watch how temperature reshapes the distribution — T < 1 makes it peakier, T > 1 makes it flatter.',
              'Then see why top-p outperforms top-k: top-k blindly keeps k tokens regardless of confidence, while top-p adapts — keeping fewer tokens when the model is confident, more when it is uncertain.',
            ],
            code: `import math
import random

random.seed(123)

def softmax(logits, temperature=1.0):
    scaled = [z / temperature for z in logits]
    max_z = max(scaled)
    exps = [math.exp(z - max_z) for z in scaled]
    total = sum(exps)
    return [e / total for e in exps]

def sample_from_probs(probs):
    u = random.random()
    cumsum = 0
    for i, p in enumerate(probs):
        cumsum += p
        if u <= cumsum:
            return i
    return len(probs) - 1

def top_p_filter(probs, p):
    """Keep smallest set of tokens whose cumulative probability >= p."""
    indexed = sorted(enumerate(probs), key=lambda x: -x[1])
    cumsum, selected = 0, []
    for idx, prob in indexed:
        cumsum += prob
        selected.append((idx, prob))
        if cumsum >= p:
            break
    total = sum(pr for _, pr in selected)
    renorm = [(idx, pr / total) for idx, pr in selected]
    return renorm

# Vocabulary: 8 tokens with logits
tokens  = ["the", "a", "cat", "dog", "ran", "flew", "xyz", "!!!"]
logits  = [4.0, 3.2, 2.1, 1.8, 0.9, 0.3, -1.0, -3.0]

print(f"{'Token':<6}  {'logit':>6}  {'T=0.5':>7}  {'T=1.0':>7}  {'T=2.0':>7}")
print("-" * 45)
for i, (tok, z) in enumerate(zip(tokens, logits)):
    p05 = softmax(logits, 0.5)[i]
    p10 = softmax(logits, 1.0)[i]
    p20 = softmax(logits, 2.0)[i]
    print(f"{tok:<6}  {z:>6.1f}  {p05:>7.4f}  {p10:>7.4f}  {p20:>7.4f}")

# Top-p comparison: confident vs uncertain model
print("\\n--- Top-p adaptive behavior ---")
confident_logits  = [8.0, 0.5, 0.3, 0.1, -1.0, -2.0, -3.0, -4.0]  # one token dominates
uncertain_logits  = [1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.5, 0.3]       # spread evenly

for label, lgs in [("Confident model", confident_logits), ("Uncertain model", uncertain_logits)]:
    probs = softmax(lgs, 1.0)
    selected = top_p_filter(probs, 0.9)
    print(f"{label}: top-p=0.9 keeps {len(selected)} tokens  (top-k=3 is always 3)")`,
          },
          {
            id: 3,
            prose: [
              'Metropolis-Hastings MCMC: sample from any distribution you can evaluate (even unnormalized) by running a random walk that spends time in regions proportional to their probability.',
              'Target: a bimodal distribution (mixture of two Gaussians). This has two peaks that a simple gradient-based approach would miss — it would get stuck in one. MCMC explores both.',
              'Key parameter: the proposal standard deviation σ_prop. Too small → tiny steps, chain explores slowly. Too large → most proposals land in low-probability regions and get rejected, chain stays stuck. The acceptance rate tracks this: target ~23% for high-dimensional Gaussian proposals.',
            ],
            code: `import math
import random

random.seed(7)

def bimodal_log_pdf(x):
    """Log of mixture: 0.5*N(-3, 1) + 0.5*N(3, 1). Unnormalized is fine."""
    def log_normal(x, mu, sigma):
        return -0.5 * ((x - mu) / sigma)**2 - math.log(sigma)
    # log-sum-exp for numerical stability
    a = math.log(0.5) + log_normal(x, -3.0, 1.0)
    b = math.log(0.5) + log_normal(x,  3.0, 1.0)
    max_ab = max(a, b)
    return max_ab + math.log(math.exp(a - max_ab) + math.exp(b - max_ab))

def metropolis_hastings(log_target, x0, n_samples, burn_in, proposal_std=1.0):
    x = x0
    samples, n_accepted = [], 0
    for i in range(n_samples + burn_in):
        x_new = x + random.gauss(0, proposal_std)
        log_alpha = log_target(x_new) - log_target(x)
        if math.log(max(random.random(), 1e-300)) < log_alpha:
            x = x_new
            if i >= burn_in:
                n_accepted += 1
        if i >= burn_in:
            samples.append(x)
    return samples, n_accepted / n_samples

# Run with two different proposal scales
for sigma_prop in [0.2, 1.5, 5.0]:
    samples, acc = metropolis_hastings(bimodal_log_pdf, 0.0, 5000, 500, sigma_prop)
    near_neg3 = sum(1 for s in samples if s < 0) / len(samples)
    near_pos3 = sum(1 for s in samples if s > 0) / len(samples)
    mean_s = sum(samples) / len(samples)
    print(f"sigma_prop={sigma_prop:.1f}  accept={acc:.2f}  "
          f"near -3: {near_neg3:.2f}  near +3: {near_pos3:.2f}  mean={mean_s:.2f}")

print("\\nIdeal: ~50% near each peak (both modes explored), acceptance ~0.2-0.4"  )
print("sigma=0.2: chain moves too slowly, likely stuck in one mode")
print("sigma=5.0: most proposals rejected, chain moves rarely")
print("sigma=1.5: best balance — discovers both modes")`,
          },
          {
            id: 'c1',
            challengeType: 'write',
            prompt: 'Implement the reparameterization trick. First show that direct sampling blocks gradient tracking. Then implement the reparameterized version: ε ~ N(0,1), z = μ + σ·ε. Compute ∂z/∂μ = 1 and ∂z/∂σ = ε manually. Verify that 10,000 reparameterized samples have the correct mean and variance for N(μ=3, σ=2).',
            starterCode: `import math
import random

random.seed(99)

# The reparameterization trick separates the stochastic part (epsilon)
# from the learnable parameters (mu, sigma), enabling gradient flow.

mu = 3.0
sigma = 2.0  # theoretical mean=3, variance=4, std=2

# TODO 1: implement reparameterized sampling
# epsilon ~ N(0, 1), then z = mu + sigma * epsilon
def reparam_sample(mu, sigma):
    pass  # replace with Box-Muller: u1,u2 = random.random(), return z = mu + sigma * box_muller_z

# TODO 2: generate 10000 samples and verify mean ≈ 3.0, std ≈ 2.0

# TODO 3: compute the gradient of z w.r.t. mu and sigma for a single sample
# dz/dmu = ?  (should be 1, regardless of epsilon)
# dz/dsigma = ?  (should be epsilon)

# Hint for Box-Muller: given u1, u2 ~ Uniform(0,1),
# z = sqrt(-2 * ln(u1)) * cos(2*pi*u2) ~ N(0, 1)
`,
            hint: 'Box-Muller: u1 = random.random(), u2 = random.random(), z = sqrt(-2*ln(u1))*cos(2*pi*u2). Then the reparameterized sample is mu + sigma * z. Gradients: dz/dmu = 1 always; dz/dsigma = epsilon (the N(0,1) sample you drew).',
            testCode: `try:
    assert reparam_sample is not None
    s = reparam_sample(3.0, 2.0)
    assert isinstance(s, float), "reparam_sample should return a float"
    samples = [reparam_sample(mu, sigma) for _ in range(10000)]
    emp_mean = sum(samples) / len(samples)
    emp_std  = (sum((x - emp_mean)**2 for x in samples) / (len(samples)-1)) ** 0.5
    assert abs(emp_mean - 3.0) < 0.1, f"Mean {emp_mean:.3f} too far from 3.0"
    assert abs(emp_std  - 2.0) < 0.1, f"Std  {emp_std:.3f}  too far from 2.0"
    print(f"PASS: mean={emp_mean:.3f} (want 3.0), std={emp_std:.3f} (want 2.0)")
    print("Gradients: dz/dmu = 1.0, dz/dsigma = epsilon (the N(0,1) draw)")
except AssertionError as e:
    print(f"FAIL: {e}")`,
          },
        ],
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: 'What does temperature < 1.0 do to a language model\'s output distribution?',
      options: [
        'Makes the distribution more uniform (more random)',
        'Sharpens the distribution, making the highest-probability token more likely',
        'Removes all tokens except the top one',
        'Has no effect on the output',
      ],
      answer: 'Sharpens the distribution, making the highest-probability token more likely',
      hints: [
        'Dividing logits by T < 1 amplifies the differences between them before softmax',
        'As T → 0, the output approaches argmax (greedy) decoding',
      ],
      reviewSection: 'Temperature Sampling',
    },
    {
      type: 'choice',
      question: 'What is the key difference between top-k and top-p (nucleus) sampling?',
      options: [
        'Top-k is faster than top-p',
        'Top-k keeps a fixed number of tokens; top-p keeps a variable number based on cumulative probability',
        'Top-p only works with temperature = 1.0',
        'Top-k works on logits while top-p works on probabilities',
      ],
      answer: 'Top-k keeps a fixed number of tokens; top-p keeps a variable number based on cumulative probability',
      hints: [
        'Top-k = 40 always keeps exactly 40 tokens regardless of how confident the model is',
        'Top-p = 0.9 keeps tokens until their probabilities sum to 0.9 — which could be 2 tokens or 200',
      ],
      reviewSection: 'Top-k and Top-p Sampling',
    },
    {
      type: 'choice',
      question: 'Why can\'t you backpropagate through a standard sampling operation z ~ N(μ, σ²)?',
      options: [
        'Normal distributions don\'t have gradients',
        'The sampling operation is non-deterministic and has no well-defined derivative with respect to μ and σ',
        'PyTorch doesn\'t support normal distributions',
        'The gradient is always exactly zero',
      ],
      answer: 'The sampling operation is non-deterministic and has no well-defined derivative with respect to μ and σ',
      hints: [
        'Differentiation requires a deterministic, continuous function — random draws break this',
        'The reparameterization trick makes sampling deterministic by separating ε ~ N(0,1) from the parameters',
      ],
      reviewSection: 'Reparameterization Trick',
    },
    {
      type: 'choice',
      question: 'In Metropolis-Hastings MCMC, what happens if the proposal standard deviation is set much too large?',
      options: [
        'The chain converges faster because it takes bigger steps',
        'Most proposals land in low-probability regions and are rejected, so the chain barely moves',
        'The stationary distribution changes to a uniform distribution',
        'The burn-in period becomes zero',
      ],
      answer: 'Most proposals land in low-probability regions and are rejected, so the chain barely moves',
      hints: [
        'Large proposals → jumps to regions where p(x\') << p(x_t) → acceptance ratio p(x\')/p(x_t) ≈ 0',
        'The chain stays stuck at the current point, producing highly autocorrelated (non-diverse) samples',
      ],
      reviewSection: 'Metropolis-Hastings MCMC',
    },
    {
      type: 'choice',
      question: 'In rejection sampling, what happens to the acceptance rate as the dimensionality of the target distribution increases?',
      options: [
        'It stays constant regardless of dimension',
        'It increases because there are more dimensions to accept in',
        'It drops exponentially because most of the proposal volume gets rejected',
        'It approaches 50% in all cases',
      ],
      answer: 'It drops exponentially because most of the proposal volume gets rejected',
      hints: [
        'In d dimensions, the volume of a ball is an exponentially small fraction of the volume of its bounding box',
        'The bound M grows exponentially with dimension, making the acceptance rate (1/M) drop exponentially',
      ],
      reviewSection: 'Rejection Sampling',
    },
  ],
}
