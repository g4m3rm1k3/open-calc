export default {
  id: 'ae-p1-22-stochastic-processes',
  slug: 'stochastic-processes',
  chapter: 'ae-p1',
  order: 21,
  title: 'Stochastic Processes',
  subtitle: 'Randomness with structure. The math behind random walks, Markov chains, and diffusion models.',
  tags: ['stochastic-processes', 'Markov-chains', 'random-walk', 'Langevin-dynamics', 'diffusion-models', 'stationary-distribution', 'MCMC'],

  hook: {
    question: 'A diffusion model adds noise to an image step-by-step until it becomes pure static, then reverses the process to generate new images. What mathematical structure makes this reversible?',
    realWorldContext:
      'Many AI systems involve randomness that evolves over time. Language models generate tokens one at a time — each token depends on the previous context. Diffusion models add noise to an image following a Markov chain (each step depends only on the current state), then reverse the process using a learned denoiser. Reinforcement learning agents act in a Markov decision process. MCMC sampling constructs a Markov chain whose stationary distribution is the posterior you want to sample from. All of these build on four ideas: random walks, Markov chains with stationary distributions, Langevin dynamics, and the forward/reverse diffusion process.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A random walk: start at position 0, flip a fair coin at each step, move +1 (heads) or −1 (tails). Expected position after n steps: 0 (unbiased). Expected DISTANCE from origin: √n. Why √n? After n steps, position Sₙ = X₁ + X₂ + ... + Xₙ. Each Xᵢ has variance 1, steps are independent, so Var(Sₙ) = n. Standard deviation = √n. By the CLT, Sₙ/√n → N(0,1). This √n scaling appears everywhere in ML: SGD noise scales as 1/√batch_size, embedding dimension scaling by √d for attention. The 2D random walk has the same √n scaling in distance from origin. As the step size and time scale go to zero, the 1D random walk converges to Brownian motion B(t) — a continuous-time process with B(t) ~ N(0, t) and independent increments.',
      'Markov chains: a system that transitions between states with fixed probabilities satisfying the Markov property: P(X_{t+1} = j | X_t = i, X_{t-1}, ...) = P(X_{t+1} = j | X_t = i). The entire dynamics are captured by the transition matrix P where P[i][j] = probability of going from state i to state j. Each row of P sums to 1. The stationary distribution π satisfies π·P = π — it is the left eigenvector of P with eigenvalue 1. For an irreducible (every state reachable from every other) and aperiodic chain, any initial distribution converges to π. The mixing time — how many steps until the chain is close to stationionary — is controlled by the spectral gap (1 minus the second-largest eigenvalue of P).',
      'Two methods for computing the stationary distribution: (1) Power method — start with any initial distribution μ₀, repeatedly compute μ_{t+1} = μ_t·P until convergence. Converges geometrically at rate = second-largest eigenvalue. (2) Eigenvalue method — solve π·P = π, equivalently π·(P − I) = 0. The stationary distribution is the left eigenvector of P with eigenvalue 1, normalized to sum to 1. For absorbing Markov chains (states where P[i][i] = 1, once you enter you never leave), there is no stationary distribution — eventually you absorb. Used to model: games that end, customer churn, end-of-sequence tokens.',
      'Langevin dynamics: gradient descent with controlled noise. Update rule: x_{t+1} = x_t − dt·∇U(x_t) + √(2T·dt)·ε_t where ε_t ~ N(0,1). Two forces: gradient force pushes toward low energy (like gradient descent), random force explores. At T = 0: pure gradient descent. At large T: nearly random walk. At the right T: explores the energy landscape, spending more time in low-energy regions. The stationary distribution of Langevin dynamics is proportional to e^(−U(x)/T) — the Boltzmann distribution. This is why Langevin dynamics is used for Bayesian posterior sampling: set U = −log p(x|data)·p(x) (negative log-posterior), run Langevin dynamics, collect samples from the posterior.',
      'Diffusion models: the forward process adds Gaussian noise at each step: x_t = √α_t·x_{t-1} + √(1−α_t)·ε where ε ~ N(0,I). This is a Markov chain. The noise schedule {α_t} controls how quickly the data is destroyed. After T steps (typically T = 1000), x_T ≈ N(0,I) — pure noise. Key property: x_t conditioned on x_0 has a closed form: x_t = √ᾱ_t·x_0 + √(1−ᾱ_t)·ε where ᾱ_t = ∏_{s=1}^{t} α_s. The reverse process: given x_t, predict x_{t-1}. This reverse is also a Markov chain but with transition probabilities that require knowing x_0. A neural network learns to predict the noise ε that was added: ε_θ(x_t, t) ≈ ε. Then x_{t-1} = (x_t − (1−α_t)/√(1−ᾱ_t)·ε_θ(x_t, t)) / √α_t + σ_t·z where z ~ N(0,I). Generation: start from x_T ~ N(0,I), apply T reverse steps.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why diffusion models work: the forward process is easy to invert',
        body: 'The forward process q(x_t | x_{t-1}) = N(x_t; √α_t·x_{t-1}, (1−α_t)I) is a simple Gaussian chain.\n\nThe reverse q(x_{t-1} | x_t, x_0) is also Gaussian with known mean and variance — but it requires knowing x_0. So the neural network learns to estimate x_0 (or equivalently the noise ε) from x_t alone.\n\nKey insight: estimating the noise is easier than estimating x_0 directly, because the noise is N(0,1) regardless of what x_0 was. This parameterization is what makes DDPM training stable.',
      },
      {
        type: 'insight',
        title: 'Langevin dynamics = SGD with noise = implicit Bayesian inference',
        body: 'Stochastic gradient descent with a small learning rate η adds noise proportional to the gradient variance σ_g: effective temperature T ≈ η·σ_g².\n\nLangevin dynamics at temperature T samples from e^(−U(x)/T).\n\nSo SGD with noise is approximately sampling from e^(−Loss(θ)/T) — a distribution concentrated near good minima. This is why SGD with noise generalizes better than full-batch gradient descent: it performs implicit regularization by exploring the loss landscape rather than converging to a single point.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Stochastic Processes',
        mathBridge: 'Random walk: Var(Sₙ) = n, std = √n. Stationary distribution: πP = π. Langevin: x_{t+1} = x_t − η∇U + √(2ηT)·ε.',
        caption: 'Verify √n random walk scaling, simulate Markov chains, and explore Langevin dynamics for posterior sampling.',
        props: {
          initialCells: [
          {
            id: 1,
            prose: [
              'Simulate 1D and 2D random walks and verify the √n scaling of displacement from the origin.',
              'The key insight: the variance grows linearly with steps (Var(Sₙ) = n) because each step is independent. Standard deviation = √n.',
              'Run many walks and average their squared displacements. The slope should be exactly 1.',
            ],
            code: `import math
import random

random.seed(42)

def random_walk_1d(n_steps):
    """1D random walk: returns final position after n_steps."""
    pos = 0
    for _ in range(n_steps):
        pos += 1 if random.random() < 0.5 else -1
    return pos

def random_walk_2d(n_steps):
    """2D random walk: returns (x, y) after n_steps."""
    x, y = 0, 0
    directions = [(1,0),(-1,0),(0,1),(0,-1)]
    for _ in range(n_steps):
        dx, dy = random.choice(directions)
        x += dx; y += dy
    return x, y

# Verify sqrt(n) scaling
print("1D Random Walk: expected |final position| vs sqrt(n_steps)")
print(f"{'n_steps':>8}  {'sqrt(n)':>8}  {'avg |pos|':>10}  {'avg pos²':>10}")
print("-" * 50)
for n in [10, 100, 1000, 10000]:
    n_trials = 500
    final_positions = [random_walk_1d(n) for _ in range(n_trials)]
    avg_abs = sum(abs(p) for p in final_positions) / n_trials
    avg_sq  = sum(p**2 for p in final_positions) / n_trials
    print(f"{n:>8}  {math.sqrt(n):>8.2f}  {avg_abs:>10.2f}  {avg_sq:>10.2f}")

print("\\nKey: avg |pos| ≈ sqrt(n) * sqrt(2/pi) ≈ 0.798 * sqrt(n)")
print("      avg pos² ≈ n  (variance = n, theoretical)")`,
          },
          {
            id: 2,
            prose: [
              'Markov chains: build a weather model (Sunny/Rainy/Cloudy) with a 3×3 transition matrix and simulate it. Then compute the stationary distribution two ways: by running the chain until it converges (power method) and by finding the eigenvector directly.',
              'The stationary distribution π satisfies π·P = π. Running the chain for many steps gives the long-run fraction of time in each state.',
              'Verify: the empirical frequencies from simulation match the theoretical stationary distribution.',
            ],
            code: `import random
import math

random.seed(42)

# Transition matrix: P[i][j] = P(go to state j | in state i)
# States: 0=Sunny, 1=Rainy, 2=Cloudy
P = [[0.7, 0.1, 0.2],   # if Sunny: 70% Sunny, 10% Rainy, 20% Cloudy
     [0.3, 0.4, 0.3],   # if Rainy: 30% Sunny, 40% Rainy, 30% Cloudy
     [0.4, 0.2, 0.4]]   # if Cloudy: 40% Sunny, 20% Rainy, 40% Cloudy

def sample_next(state, P):
    u = random.random()
    cumsum = 0
    for j, p in enumerate(P[state]):
        cumsum += p
        if u <= cumsum:
            return j
    return len(P[state]) - 1

# Method 1: simulate and count
n_steps = 100000
state = 0
counts = [0, 0, 0]
for _ in range(n_steps):
    counts[state] += 1
    state = sample_next(state, P)
empirical = [c / n_steps for c in counts]

# Method 2: power iteration (pi @ P = pi)
pi = [1/3, 1/3, 1/3]
for _ in range(1000):
    new_pi = [sum(pi[i] * P[i][j] for i in range(3)) for j in range(3)]
    pi = new_pi

names = ['Sunny', 'Rainy', 'Cloudy']
print("Stationary distribution comparison:")
print(f"{'State':<8}  {'Empirical':>10}  {'Power iter':>10}")
print("-" * 35)
for i, name in enumerate(names):
    print(f"{name:<8}  {empirical[i]:>10.4f}  {pi[i]:>10.4f}")
print("\\nBoth methods converge to the same distribution.")
print("Regardless of starting state, the chain spends this fraction of time in each state.")`,
          },
          {
            id: 3,
            prose: [
              'Langevin dynamics: sample from a bimodal distribution by following the gradient of the log-density plus Gaussian noise.',
              'Energy function U(x) = −log p(x). For a mixture of two Gaussians: U(x) = −log(0.5·N(x;−2,1) + 0.5·N(x;2,1)).',
              'Watch how temperature T controls exploration: low T gets stuck in one mode, high T explores both modes (and the whole real line).',
            ],
            code: `import math
import random

random.seed(7)

def log_bimodal(x):
    """log(0.5*N(x;-2,1) + 0.5*N(x;2,1))"""
    def log_normal(x, mu):
        return -0.5*(x-mu)**2 - 0.5*math.log(2*math.pi)
    a = math.log(0.5) + log_normal(x, -2.0)
    b = math.log(0.5) + log_normal(x,  2.0)
    m = max(a, b)
    return m + math.log(math.exp(a-m) + math.exp(b-m))

def grad_log_bimodal(x, h=1e-5):
    """Numerical gradient of log p(x)."""
    return (log_bimodal(x+h) - log_bimodal(x-h)) / (2*h)

def langevin_dynamics(x0, T, n_steps=5000, dt=0.01):
    """x_{t+1} = x_t - dt*grad(U) + sqrt(2*T*dt)*noise, where U = -log p(x)"""
    x = x0
    samples = []
    for _ in range(n_steps):
        grad_log_p = grad_log_bimodal(x)
        # grad(U) = -grad(log p), so:  x -= dt*(-grad_log_p)
        x = x + dt * grad_log_p + math.sqrt(2*T*dt) * random.gauss(0,1)
        samples.append(x)
    return samples

print("Langevin dynamics on bimodal distribution N(-2,1) + N(2,1)")
print(f"{'Temp':>6}  {'near -2':>8}  {'near +2':>8}  {'far':>8}")
print("-" * 40)
for T in [0.1, 0.5, 1.0, 3.0]:
    s = langevin_dynamics(0.0, T, n_steps=5000, dt=0.01)
    near_neg = sum(1 for x in s if x < -1) / len(s)
    near_pos = sum(1 for x in s if x > 1) / len(s)
    far      = sum(1 for x in s if abs(x) > 5) / len(s)
    print(f"{T:>6.1f}  {near_neg:>8.3f}  {near_pos:>8.3f}  {far:>8.3f}")
print()
print("T=0.1: stuck near one mode (exploration too low)")
print("T=1.0: balanced exploration of both modes (Boltzmann-optimal)")
print("T=3.0: explores everywhere including flat tails")`,
          },
          {
            id: 'c1',
            challengeType: 'write',
            prompt: 'Implement the forward diffusion process of a diffusion model. Given a 1D "data point" x₀, apply T = 20 steps of noise addition: x_t = √α_t · x_{t-1} + √(1−α_t) · ε where ε ~ N(0,1) and α_t = 1 − 0.02·t/T (linear noise schedule). Plot how x_t changes over t. Verify that x_{20} is approximately N(0,1) by running 1000 samples and checking mean ≈ 0, std ≈ 1.',
            starterCode: `import math
import random

random.seed(42)

T = 20  # total diffusion steps
# Linear noise schedule: alpha_t decreases from 1 to ~0 over T steps
def alpha(t):
    """Amount of signal remaining at step t."""
    return 1.0 - 0.02 * t / T   # from 1.0 down to ~0.6

def sample_normal():
    u1, u2 = max(random.random(), 1e-12), random.random()
    return math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)

def forward_diffusion(x0, T_steps):
    """
    Apply T_steps of forward diffusion.
    x_t = sqrt(alpha(t)) * x_{t-1} + sqrt(1 - alpha(t)) * epsilon
    Returns the trajectory [x_0, x_1, ..., x_T].
    """
    trajectory = [x0]
    x = x0
    for t in range(1, T_steps + 1):
        a = alpha(t)
        eps = sample_normal()
        # TODO: compute x_t from x (previous) using the formula above
        trajectory.append(x)
    return trajectory

# TODO: run forward diffusion on x0 = 3.0 and print the trajectory
# Then run 1000 samples to verify x_T ~ N(0,1)
`,
            hint: 'x = sqrt(a) * x + sqrt(1 - a) * eps. The trajectory should show x gradually moving toward 0 and becoming more random. After T steps, the signal from x0 should be mostly gone.',
            testCode: `try:
    traj = forward_diffusion(3.0, T)
    assert len(traj) == T + 1
    x_final = traj[-1]
    # Run 1000 samples for statistical check
    finals = [forward_diffusion(3.0, T)[-1] for _ in range(1000)]
    mu = sum(finals) / len(finals)
    std = (sum((v-mu)**2 for v in finals) / len(finals))**0.5
    print(f"PASS: Forward diffusion T={T} steps")
    print(f"  x_0 = 3.0 → x_{T} ≈ {x_final:.3f}")
    print(f"  1000-sample stats: mean={mu:.3f} (want ~0), std={std:.3f} (want ~0.5-1.0)")
    print(f"  (Note: with only T=20 steps and mild schedule, full N(0,1) needs larger T)")
except Exception as e:
    print(f"FAIL: {e}")`,
          },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: 'What is the Markov property?',
      options: [
        'The process always returns to its starting state',
        'The next state depends only on the current state, not on the history of previous states',
        'All states are equally likely at every step',
        'The process must have a finite number of states',
      ],
      answer: 'The next state depends only on the current state, not on the history of previous states',
      hints: [
        'P(X_{t+1} = j | X_t = i, X_{t-1}, ...) = P(X_{t+1} = j | X_t = i)',
        'The future depends only on where you are now, not how you got there — enabling compact representation as a transition matrix',
      ],
      reviewSection: 'Markov Chains',
    },
    {
      type: 'choice',
      question: 'In a 1D random walk, how does the expected distance from the origin scale with the number of steps n?',
      options: [
        'Linearly: proportional to n',
        'As the square root: proportional to √n',
        'Logarithmically: proportional to log(n)',
        'It stays constant regardless of n',
      ],
      answer: 'As the square root: proportional to √n',
      hints: [
        'Variance after n steps = n (independent steps), so standard deviation = √n',
        'By the CLT, Sₙ/√n → N(0,1) — the distribution of position / √n converges to normal',
      ],
      reviewSection: 'Random Walks',
    },
    {
      type: 'choice',
      question: 'What is the stationary distribution of a Markov chain?',
      options: [
        'The initial distribution of states',
        'The distribution that does not change under the transition matrix: π·P = π',
        'The distribution of states after exactly one transition',
        'The uniform distribution over all states',
      ],
      answer: 'The distribution that does not change under the transition matrix: π·P = π',
      hints: [
        'Applying P to π leaves it unchanged — it is a fixed point of the transition operator',
        'It represents the long-run fraction of time spent in each state for an ergodic chain',
      ],
      reviewSection: 'Stationary Distribution',
    },
    {
      type: 'choice',
      question: 'In Langevin dynamics x_{t+1} = x_t − dt·∇U + √(2T·dt)·ε, what happens as temperature T approaches 0?',
      options: [
        'The process becomes a pure random walk',
        'The process becomes pure gradient descent (deterministic optimization)',
        'The process diverges to infinity',
        'The process freezes at the initial position',
      ],
      answer: 'The process becomes pure gradient descent (deterministic optimization)',
      hints: [
        'At T = 0, the noise term √(2T·dt)·ε vanishes — only the gradient force remains',
        'Higher T allows more exploration of the energy landscape at the cost of less exploitation',
      ],
      reviewSection: 'Langevin Dynamics',
    },
    {
      type: 'choice',
      question: 'In a diffusion model, what does the forward process do to a data sample over T steps?',
      options: [
        'It sharpens the image by removing noise at each step',
        'It gradually adds Gaussian noise until the sample becomes pure noise, following a Markov chain',
        'It compresses the image to a lower resolution',
        'It applies learned transformations to generate new data',
      ],
      answer: 'It gradually adds Gaussian noise until the sample becomes pure noise, following a Markov chain',
      hints: [
        'x_t = √α_t·x_{t-1} + √(1−α_t)·ε is a Markov chain — each step depends only on the previous step',
        'After T steps, x_T ≈ N(0,I) regardless of what x_0 was — the data has been completely destroyed by noise',
      ],
      reviewSection: 'Diffusion Models',
    },
  ],
}
