export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'stat5-001',
  slug: 'discrete-random-variables',
  chapter: 'stat5',
  order: 1,
  title: 'Discrete Random Variables & Expected Value',
  subtitle: 'How to assign numbers to random outcomes, compute their long-run average, and quantify their spread.',
  tags: ['probability', 'random variable', 'PMF', 'CDF', 'expected value', 'variance', 'linearity of expectation'],
  aliases: 'discrete random variable probability mass function expected value variance standard deviation PMF CDF E[X] Var(X)',
  timeToComplete: 35,
  coreConcept: 'A discrete random variable assigns a real number to each outcome of a random experiment. The expected value E[X] is the long-run average — the probability-weighted center of mass of the distribution. Variance measures how spread out the outcomes are around that center.',
  prerequisites: ['stat4-006'],
  nextLesson: 'stat5-002',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: 'If you roll a fair die 10,000 times and average all the results, what number will you get — and how confident can you be that you\'re close to that number?',
    realWorldContext: 'An insurance company must price a policy before knowing whether a claim will be filed. A casino must set table limits before knowing the outcome of any spin. Both face the same mathematical challenge: how do you reason about the average of many future random outcomes? Expected value is the answer. In quality control engineering, a CNC machining center produces parts whose dimensions vary randomly — the expected value of the diameter error tells you where the process is centered, while the variance tells you how repeatable it is. In machine learning, the expected value of a loss function over the training distribution is exactly the quantity that gradient descent minimizes. Understanding discrete random variables is the foundation for all of these — once you can compute E[X] and Var(X), you can price insurance policies, design fair games, control manufacturing processes, and build learning algorithms.',
    previewVisualizationId: 'DiscretePMFViz',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Roadmap for this lesson.** By the end of this lesson you will be able to: (1) recognize a discrete random variable and write out its probability mass function (PMF); (2) compute the cumulative distribution function (CDF); (3) calculate the expected value E[X] using the formula E[X] = Σ x·P(X=x); (4) compute the variance Var(X) = E[(X−μ)²] and standard deviation; (5) apply linearity of expectation to simplify multi-part problems. These tools are the mathematical language for reasoning about uncertainty.',

      '**A concrete example: the single fair die.** Roll a standard six-sided die. The outcome is random — we don\'t know in advance whether it will land on 1, 2, 3, 4, 5, or 6. The random variable $X$ is simply the number that appears. Its PMF lists every value with its probability: $P(X=1) = P(X=2) = \\cdots = P(X=6) = 1/6$. Notice that the six probabilities sum to exactly 1, which is required. Now here is the key question: if you roll the die many times and average all the results, what number will you converge to? The values 1 through 6 are equally likely, so the average should land right in the middle — but what exactly is "the middle" for a probability distribution?',

      '**Before reading on, predict:** Without any formula, estimate the long-run average of one roll of a fair die. Then think about why it is NOT simply $(1+6)/2 = 3.5$ in all cases — what if the die were biased, giving 6 three times as often as any other face?',

      '**The expected value formula answers both questions at once.** The long-run average of any discrete random variable is $E[X] = \\sum_x x \\cdot P(X=x)$ — you multiply each value by its probability, then add everything up. For the fair die: $E[X] = 1(1/6) + 2(1/6) + 3(1/6) + 4(1/6) + 5(1/6) + 6(1/6) = 21/6 = 3.5$. For a biased die where $P(X=6) = 1/2$ and each of 1–5 has probability $1/10$: $E[X] = 1(1/10) + 2(1/10) + 3(1/10) + 4(1/10) + 5(1/10) + 6(1/2) = 15/10 + 3 = 4.5$. The formula automatically accounts for the bias by weighting each outcome by how likely it is.',

      '**The PMF: listing all possible outcomes.** A probability mass function (PMF) is a complete description of a discrete random variable. It must satisfy two rules: (1) $P(X=x) \\geq 0$ for all $x$ — probabilities are never negative; (2) $\\sum_x P(X=x) = 1$ — the probabilities of all possible outcomes must sum to exactly 1. Think of the PMF as a recipe: it tells you every possible "ingredient" (outcome) and how much of it you get (its probability). The CDF $F(x) = P(X \\leq x) = \\sum_{t \\leq x} P(X=t)$ accumulates the probabilities from left to right.',

      '**Variance measures spread around the mean.** The expected value tells you where the distribution is centered, but two distributions can have the same mean and look completely different. The **variance** $\\text{Var}(X) = E[(X-\\mu)^2] = \\sum_x (x-\\mu)^2 P(X=x)$ measures the average squared distance from the mean. A computational shortcut is $\\text{Var}(X) = E[X^2] - (E[X])^2$, which avoids computing $(x-\\mu)^2$ for each term. The **standard deviation** $\\sigma = \\sqrt{\\text{Var}(X)}$ brings the spread back to the same units as $X$. For a fair die: $E[X^2] = (1^2 + 2^2 + 3^2 + 4^2 + 5^2 + 6^2)/6 = 91/6 \\approx 15.17$, so $\\text{Var}(X) = 91/6 - (3.5)^2 = 91/6 - 49/4 = 182/12 - 147/12 = 35/12 \\approx 2.92$ and $\\sigma \\approx 1.71$.',

      '**Linearity of expectation is a superpower.** One of the most useful theorems in probability is that expectation is linear: $E[aX + b] = aE[X] + b$ and $E[X + Y] = E[X] + E[Y]$. The second rule holds even when $X$ and $Y$ are dependent — you don\'t need independence for linearity of expectation. This means you can decompose complicated random variables into simpler parts. For example, if $S = X_1 + X_2 + \\cdots + X_n$ is the sum of $n$ independent dice rolls, then $E[S] = n \\cdot E[X_1] = n \\cdot 3.5$ without any additional work. Variance, by contrast, is NOT generally linear unless the variables are uncorrelated: $\\text{Var}(X+Y) = \\text{Var}(X) + \\text{Var}(Y)$ only when $X$ and $Y$ are uncorrelated.',

      '**CNC manufacturing application.** A CNC lathe turns aluminum shafts that are supposed to be 25.00 mm in diameter. Due to tool wear, thermal expansion, and vibration, the actual diameter $X$ varies randomly. Suppose measurements show $P(X = 24.97) = 0.10$, $P(X = 24.99) = 0.25$, $P(X = 25.00) = 0.30$, $P(X = 25.01) = 0.25$, $P(X = 25.03) = 0.10$. The expected diameter is $E[X] = 24.97(0.10) + 24.99(0.25) + 25.00(0.30) + 25.01(0.25) + 25.03(0.10) = 25.00$ mm — the process is centered perfectly. But the variance and standard deviation tell the quality engineer how often parts will fall outside the tolerance band of $\\pm 0.02$ mm.',

      '**Insurance pricing and casino games.** An insurance company sells a policy: the customer pays $\\$120$ premium per year. With probability $0.03$ the company pays out $\\$5000$ for a claim; with probability $0.97$ there is no claim. The company\'s profit per policy is $X$ where $P(X = 120) = 0.97$ and $P(X = 120 - 5000) = P(X = -4880) = 0.03$. Expected profit per policy: $E[X] = 120(0.97) + (-4880)(0.03) = 116.40 - 146.40 = -30$ per policy — a loss! The premium needs to be at least $\\$5000 \\times 0.03 = \\$150$ to break even, plus operating costs. Every insurance premium in the world is calculated by solving an expected-value equation like this.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Discrete Random Variable',
        body: 'A **discrete random variable** $X$ is a function that maps each outcome in a sample space to a real number, where the set of possible values is finite or countably infinite. A random variable is "discrete" when you can list all its possible values — contrasted with continuous random variables (Chapter 6) where the values form an interval.',
      },
      {
        type: 'procedure',
        title: 'Procedure: Computing E[X] and Var(X) from a PMF',
        body: 'Given a table of values $x_1, x_2, \\ldots, x_k$ with probabilities $p_1, p_2, \\ldots, p_k$ (summing to 1):\n\n**Step 1.** Verify $\\sum p_i = 1$ and all $p_i \\geq 0$.\n**Step 2.** Compute $E[X] = \\sum_{i=1}^k x_i p_i$ (multiply each value by its probability, add up).\n**Step 3.** Compute $E[X^2] = \\sum_{i=1}^k x_i^2 p_i$ (same process but square the values first).\n**Step 4.** Compute $\\text{Var}(X) = E[X^2] - (E[X])^2$.\n**Step 5.** Compute $\\sigma = \\sqrt{\\text{Var}(X)}$.\n**Step 6.** CDF at point $a$: $F(a) = P(X \\leq a) = \\sum_{x_i \\leq a} p_i$ (add all probabilities at or below $a$).',
      },
      {
        type: 'insight',
        title: 'Expected Value Is Not Always a Possible Outcome',
        body: 'E[X] = 3.5 for a fair die, but the die never actually shows 3.5. Expected value is the long-run average of many repetitions — it is the center of mass of the distribution, not necessarily any specific outcome. Similarly, a family can have "expected" 2.4 children. The term "expected" in mathematics means "long-run average," not "the outcome we expect to see on any given trial."',
      },
      {
        type: 'warning',
        title: 'Common Mistake: Var(X+Y) ≠ Var(X) + Var(Y) in General',
        body: 'Linearity of expectation holds unconditionally: $E[X+Y] = E[X] + E[Y]$ always. But variance is only additive when $X$ and $Y$ are **uncorrelated**: $\\text{Var}(X+Y) = \\text{Var}(X) + \\text{Var}(Y) + 2\\text{Cov}(X,Y)$. If $X$ and $Y$ are independent, the covariance term vanishes and additivity holds. Students often apply variance additivity to dependent variables — check independence (or zero correlation) first.',
      },
      {
        type: 'strategy',
        title: 'Use the Shortcut Formula for Variance',
        body: 'Two equivalent formulas for variance:\n\n**Definition:** $\\text{Var}(X) = \\sum (x-\\mu)^2 P(X=x)$ — conceptually clear, computationally tedious.\n**Shortcut:** $\\text{Var}(X) = E[X^2] - (E[X])^2$ — much faster; compute $E[X]$ and $E[X^2]$ separately, then subtract the square of the mean.\n\nUse the shortcut for calculations. Use the definition for conceptual understanding.',
      },
      {
        type: 'insight',
        title: 'CDF vs PMF: Two Ways to Describe a Distribution',
        body: 'The PMF $P(X=x)$ gives the probability at a single point. The CDF $F(a) = P(X \\leq a)$ gives the accumulated probability up to and including $a$. For any interval: $P(a < X \\leq b) = F(b) - F(a)$. The CDF is always non-decreasing, starts at 0 (before the smallest value), and ends at 1 (after the largest value). In practice, the CDF is easier to use for probability queries involving ranges.',
      },
      {
        type: 'warning',
        title: 'Linearity of Expectation Does NOT Mean Independence',
        body: 'The formula $E[X+Y] = E[X] + E[Y]$ requires absolutely no assumption about the relationship between $X$ and $Y$ — they can be completely dependent. This is why linearity of expectation is so powerful: you can decompose sums of random variables into their individual expectations without verifying independence. Many elegant probability arguments work this way — students who add an independence check are adding an unnecessary (and sometimes incorrect) assumption.',
      },
    ],
    visualizations: [
      {
        id: 'DiscretePMFViz',
        title: 'PMF and CDF — Seeing the Distribution',
        mathBridge: 'The PMF bar chart shows $P(X=x)$ for each value: bar height equals probability. The CDF step function shows $F(x) = P(X \\leq x)$: it starts at 0, jumps at each possible value by the amount of probability there, and ends at 1. The expected value $E[X]$ appears as the "balancing point" of the PMF — place a fulcrum there and the distribution balances.',
        caption: 'Compare the PMF heights (individual probabilities) against the CDF steps (cumulative probabilities). The CDF jump at each point equals the PMF bar height at that point.',
      },
      {
        id: 'CardDiceLab',
        title: 'Simulate Rolling a Die — See Expected Value Emerge',
        mathBridge: 'Run many trials and watch the running average converge to $E[X] = 3.5$. This is the Law of Large Numbers in action: for large $n$, the sample mean $\\bar{X}$ gets arbitrarily close to $E[X]$. The histogram of outcomes should approach the flat PMF of a fair die.',
        caption: 'Compare your simulated average against the theoretical expected value after 100, 1000, and 10000 rolls.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'A **discrete random variable** $X$ defined on probability space $(\\Omega, \\mathcal{F}, P)$ is a measurable function $X: \\Omega \\to \\mathbb{R}$ whose range $\\mathcal{X} = \\{x_1, x_2, \\ldots\\}$ is at most countably infinite. The **probability mass function** (PMF) is $p(x) = P(X = x) = P(\\{\\omega \\in \\Omega : X(\\omega) = x\\})$. The PMF satisfies $p(x) \\geq 0$ for all $x$ and $\\sum_{x \\in \\mathcal{X}} p(x) = 1$. The **cumulative distribution function** (CDF) is $F(x) = P(X \\leq x) = \\sum_{t \\leq x} p(t)$, which is right-continuous and non-decreasing, with $\\lim_{x \\to -\\infty} F(x) = 0$ and $\\lim_{x \\to +\\infty} F(x) = 1$.',

      'The **expected value** (expectation or mean) of $X$ is defined as $E[X] = \\sum_{x \\in \\mathcal{X}} x \\cdot p(x)$, provided the sum converges absolutely: $\\sum_{x} |x| p(x) < \\infty$. When the sum diverges (as in the St. Petersburg paradox), the expected value is undefined. For a function $g(X)$, the law of the unconscious statistician gives $E[g(X)] = \\sum_{x} g(x) p(x)$. Setting $g(x) = x^2$ yields $E[X^2]$; setting $g(x) = (x - \\mu)^2$ yields the variance directly.',

      'The **variance** of $X$ is $\\text{Var}(X) = E[(X - \\mu)^2] = \\sum_x (x-\\mu)^2 p(x)$ where $\\mu = E[X]$. The computational identity is:\n$$\\text{Var}(X) = E[X^2] - (E[X])^2$$\nProof: $E[(X-\\mu)^2] = E[X^2 - 2\\mu X + \\mu^2] = E[X^2] - 2\\mu E[X] + \\mu^2 = E[X^2] - 2\\mu^2 + \\mu^2 = E[X^2] - \\mu^2$. Variance is always non-negative and equals zero iff $X$ is a constant (degenerate distribution). The **standard deviation** is $\\sigma = \\sigma_X = \\sqrt{\\text{Var}(X)}$, which has the same units as $X$.',

      'The **linearity of expectation** states: for any constants $a, b \\in \\mathbb{R}$ and random variables $X, Y$ (defined on the same probability space), $E[aX + b] = a E[X] + b$ and $E[X + Y] = E[X] + E[Y]$. No independence assumption is needed. Proof via definition: $E[aX + b] = \\sum_x (ax+b) p(x) = a \\sum_x x p(x) + b \\sum_x p(x) = a E[X] + b$. For two variables: $E[X+Y] = \\sum_{x,y}(x+y)p(x,y) = \\sum_x x \\sum_y p(x,y) + \\sum_y y \\sum_x p(x,y) = E[X] + E[Y]$. For variance: $\\text{Var}(aX+b) = a^2 \\text{Var}(X)$ — the constant $b$ shifts the distribution but does not affect spread, while $a$ scales the deviation by $a$ and the squared deviation by $a^2$.',

      'For sums of $n$ **independent** random variables $X_1, \\ldots, X_n$: $E[\\sum X_i] = \\sum E[X_i]$ (by linearity) and $\\text{Var}(\\sum X_i) = \\sum \\text{Var}(X_i)$ (by independence — covariance terms vanish). In general, $\\text{Var}(X+Y) = \\text{Var}(X) + \\text{Var}(Y) + 2\\text{Cov}(X,Y)$ where $\\text{Cov}(X,Y) = E[XY] - E[X]E[Y]$. Independence implies $\\text{Cov}(X,Y) = 0$, but the converse is false — zero covariance does not imply independence.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Linearity of Expectation',
        body: 'For any random variables $X, Y$ and constants $a, b$:\n$$E[aX + b] = a\\,E[X] + b$$\n$$E[X + Y] = E[X] + E[Y]$$\nNo independence required. Proof: exchange sum and scalar, use $\\sum p(x) = 1$.',
      },
      {
        type: 'theorem',
        title: 'Variance Shortcut Formula',
        body: '$$\\text{Var}(X) = E[X^2] - (E[X])^2$$\nAlso: $\\text{Var}(aX+b) = a^2\\,\\text{Var}(X)$ — shifting does not change spread; scaling squares the spread.',
      },
      {
        type: 'insight',
        title: 'Why Absolute Convergence Matters',
        body: 'The St. Petersburg paradox: flip a fair coin until you get heads. Win $2^k$ if it takes $k$ flips. $E[\\text{winnings}] = \\sum_{k=1}^{\\infty} 2^k \\cdot (1/2)^k = \\sum_{k=1}^{\\infty} 1 = \\infty$. The expected value is infinite, so no finite price is "fair." This shows why absolute convergence ($\\sum |x| p(x) < \\infty$) is required for E[X] to exist.',
      },
      {
        type: 'warning',
        title: 'Var(X) = 0 Does Not Mean X is Trivial',
        body: 'Variance equals zero if and only if $X = \\mu$ with probability 1 — the variable is a **constant** (degenerate distribution). Any nonzero amount of variability gives Var(X) > 0. This makes variance a complete indicator of randomness: zero variance means no randomness at all.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Discrete Random Variables in Python/NumPy',
        mathBridge: 'NumPy and scipy.stats give us two ways to compute E[X] and Var(X): directly from the PMF definition using array arithmetic, or via the built-in `.mean()` and `.var()` methods on simulated samples. Comparing both methods confirms the formulas while teaching simulation skills.',
        caption: 'Run each cell to see the math become code. Cell 4 challenges you to build your own distribution.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'PMF basics: construction, verification, E[X], Var(X)',
              prose: [
                'We represent the PMF as two parallel NumPy arrays: `values` holds the possible outcomes $x_i$ and `probs` holds $P(X=x_i)$. The constraint $\\sum p_i = 1$ is checked with `np.isclose(np.sum(probs), 1.0)`.',
                '`E_X = np.sum(values * probs)` computes $E[X] = \\sum x_i p_i$ — the dot product of values and probabilities. This is the most direct translation of the mathematical formula.',
                '`E_X2 = np.sum(values**2 * probs)` computes $E[X^2] = \\sum x_i^2 p_i$ using the law of the unconscious statistician with $g(x)=x^2$. Subtracting $(E[X])^2$ gives the variance via the shortcut formula.',
                'The bar chart of `probs` against `values` IS the PMF. The expected value is plotted as a vertical dashed red line — it falls between the bars, illustrating that E[X] need not be an actual outcome.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Fair six-sided die: PMF
values = np.array([1, 2, 3, 4, 5, 6])
probs  = np.array([1/6, 1/6, 1/6, 1/6, 1/6, 1/6])

# Verify PMF sums to 1
print(f"Sum of probs: {np.sum(probs):.6f}  (should be 1.0)")

# Expected value: E[X] = sum(x * P(X=x))
E_X = np.sum(values * probs)
print(f"E[X] = {E_X:.4f}   (theoretical: 3.5)")

# Variance: Var(X) = E[X^2] - (E[X])^2
E_X2  = np.sum(values**2 * probs)
Var_X = E_X2 - E_X**2
SD_X  = np.sqrt(Var_X)
print(f"E[X^2] = {E_X2:.4f}")
print(f"Var(X) = {Var_X:.4f}  (theoretical: 35/12 ≈ {35/12:.4f})")
print(f"SD(X)  = {SD_X:.4f}  (theoretical: sqrt(35/12) ≈ {np.sqrt(35/12):.4f})")

# Plot the PMF
fig, ax = plt.subplots(figsize=(8, 4))
ax.bar(values, probs, color='steelblue', edgecolor='navy', alpha=0.8, width=0.6)
ax.axvline(E_X, color='red', linestyle='--', linewidth=2, label=f'E[X] = {E_X}')
ax.set_xlabel('Outcome x', fontsize=12)
ax.set_ylabel('P(X = x)', fontsize=12)
ax.set_title('PMF: Fair Six-Sided Die', fontsize=14)
ax.set_xticks(values)
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'CDF and simulation verification',
              prose: [
                '`np.cumsum(probs)` computes the cumulative sum of the PMF: the $k$-th entry is $F(x_k) = P(X \\leq x_k) = \\sum_{i=1}^k p_i$. This is the mathematical definition of the CDF for a discrete distribution.',
                '`np.random.choice(values, size=N, p=probs)` simulates $N$ draws from the distribution: it picks from `values` using `probs` as the sampling weights. Setting `size=100000` gives a large enough sample to verify the theoretical values numerically.',
                'The simulated mean and variance from 100,000 draws should match E[X]=3.5 and Var(X)≈2.917 to about 2 decimal places. This is the Law of Large Numbers in action: sample averages converge to the expected value as $n \\to \\infty$.',
                'The step plot of the CDF shows how probability accumulates: each jump up happens at a possible value, and the jump size equals the PMF height at that point. After the last value, the CDF is flat at 1.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

values = np.array([1, 2, 3, 4, 5, 6])
probs  = np.array([1/6]*6)

# Compute CDF
cdf = np.cumsum(probs)
print("CDF values:")
for x, f in zip(values, cdf):
    print(f"  F({x}) = P(X <= {x}) = {f:.4f}")

# Simulate N rolls and verify
np.random.seed(42)
N = 100_000
sample = np.random.choice(values, size=N, p=probs)
print(f"\\nSimulation with N={N:,} rolls:")
print(f"  Sample mean: {np.mean(sample):.4f}  (theory: 3.5)")
print(f"  Sample var:  {np.var(sample):.4f}  (theory: {35/12:.4f})")
print(f"  Sample SD:   {np.std(sample):.4f}  (theory: {np.sqrt(35/12):.4f})")

# Plot PMF and CDF side by side
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

# PMF
ax1.bar(values, probs, color='steelblue', edgecolor='navy', alpha=0.8, width=0.6)
ax1.set_title('PMF: P(X = x)', fontsize=13)
ax1.set_xlabel('x'); ax1.set_ylabel('P(X = x)')
ax1.set_xticks(values); ax1.grid(True, alpha=0.3)

# CDF step function
x_step = np.repeat(values, 2)
y_step = np.concatenate([[0], np.repeat(cdf, 2)[:-1]])
ax2.step(values, cdf, where='post', color='darkorange', linewidth=2.5)
ax2.scatter(values, cdf, color='darkorange', zorder=5, s=60)
ax2.set_title('CDF: F(x) = P(X ≤ x)', fontsize=13)
ax2.set_xlabel('x'); ax2.set_ylabel('F(x)')
ax2.set_ylim(-0.05, 1.1); ax2.set_xticks(values); ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Linearity of expectation & insurance example',
              prose: [
                'The insurance example demonstrates expected value in a real business context. `X` represents the company\'s profit from one policy. The PMF has only two outcomes: +$120 (no claim, probability 0.97) and −$4880 (claim filed, probability 0.03). E[X] < 0 means the company loses money on average at this premium level.',
                'Linearity of expectation: `E_total = n_policies * E_one` computes the expected total profit from 10,000 policies. No simulation needed — just multiply. This is why insurance companies can survive: the Law of Large Numbers guarantees their actual profit will be close to n × E[X] when n is large.',
                'The second plot shows the distribution of total profit from 10,000 policies via simulation. The histogram is approximately normal (a preview of the Central Limit Theorem from stat5-005). The red dashed line marks the theoretical expected total.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Insurance policy PMF
# Company collects $120 premium; pays $5000 on claim
premium  = 120
payout   = 5000
p_claim  = 0.03
p_none   = 0.97

profit_values = np.array([premium, premium - payout])   # [120, -4880]
profit_probs  = np.array([p_none, p_claim])              # [0.97, 0.03]

E_one  = np.sum(profit_values * profit_probs)
E2_one = np.sum(profit_values**2 * profit_probs)
Var_one = E2_one - E_one**2

print("=== Single Policy ===")
print(f"  Outcomes: {profit_values}")
print(f"  Probs:    {profit_probs}")
print(f"  E[profit per policy] = \${E_one:.2f}")
print(f"  SD[profit per policy] = \${np.sqrt(Var_one):.2f}")
print()

# Linearity: expected total profit from n policies
n_policies = 10_000
E_total = n_policies * E_one
print(f"=== Portfolio of {n_policies:,} Policies ===")
print(f"  E[total profit] = {n_policies} × \${E_one:.2f} = \${E_total:,.2f}")
break_even_premium = payout * p_claim
print(f"  Break-even premium = \${break_even_premium:.2f} (before operating costs)")

# Simulate total profit distribution
np.random.seed(0)
trials = 5000
totals = np.array([
    np.sum(np.random.choice(profit_values, size=n_policies, p=profit_probs))
    for _ in range(trials)
])

fig, ax = plt.subplots(figsize=(9, 4))
ax.hist(totals, bins=50, color='steelblue', edgecolor='white', alpha=0.8, density=True)
ax.axvline(E_total, color='red', linestyle='--', linewidth=2, label=f'E[total] = \${E_total:,.0f}')
ax.set_xlabel('Total Profit from 10,000 Policies ($)', fontsize=11)
ax.set_ylabel('Density', fontsize=11)
ax.set_title('Distribution of Total Profit: 5,000 Simulated Portfolios', fontsize=13)
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Build your own PMF and compute its statistics',
              difficulty: 'medium',
              prompt: 'A quality control inspector at a CNC shop randomly selects a part. The number of surface defects X follows this distribution: P(X=0)=0.70, P(X=1)=0.20, P(X=2)=0.08, P(X=3)=0.02. (1) Verify this is a valid PMF. (2) Compute E[X] and interpret it. (3) Compute Var(X) and SD(X). (4) Find P(X ≥ 2) using the CDF. (5) Plot the PMF and mark E[X].',
              code: `import numpy as np
import matplotlib.pyplot as plt

# Define the PMF
values = np.array([0, 1, 2, 3])
probs  = np.array([0.70, 0.20, 0.08, 0.02])

# 1. Verify the PMF (should sum to 1)

# 2. Compute E[X]

# 3. Compute Var(X) and SD(X) using shortcut formula

# 4. Find P(X >= 2) = 1 - P(X <= 1) = 1 - F(1)

# 5. Plot the PMF with E[X] marked
`,
              hint: 'Use np.sum(values * probs) for E[X], np.sum(values**2 * probs) for E[X^2], then Var = E[X^2] - E[X]^2. P(X>=2) = np.sum(probs[values >= 2]).',
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Code: Discrete Random Variables in OpenMAT / MATLAB',
        mathBridge: 'MATLAB vectors represent PMF tables naturally. Element-wise multiplication `values .* probs` computes the weighted sum for E[X]. The `cumsum` function builds the CDF. The `randsample` or `datasample` function simulates draws from a discrete distribution.',
        caption: 'OpenMAT mirrors real MATLAB syntax. Semicolons suppress output; use fprintf for formatted printing.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'PMF construction and E[X], Var(X)',
              prose: [
                'Column vectors in MATLAB use semicolons: `values = [1;2;3;4;5;6]` creates a $6 \\times 1$ column. Row vectors use commas or spaces. For PMF calculations, the orientation does not matter as long as `values` and `probs` match.',
                '`sum(probs)` verifies the probabilities sum to 1. `values .* probs` is element-wise multiplication — the dot before `*` is essential; without it MATLAB would attempt matrix multiplication.',
                '`E_X2 = sum(values.^2 .* probs)` computes $E[X^2]$ by squaring element-wise (`.^2`) then multiplying by probabilities. The shortcut `Var_X = E_X2 - E_X^2` follows directly.',
              ],
              code: `% Fair six-sided die PMF
values = [1; 2; 3; 4; 5; 6];
probs  = [1/6; 1/6; 1/6; 1/6; 1/6; 1/6];

% Verify PMF
fprintf('Sum of probs = %.6f  (should be 1.0)\\n', sum(probs))

% E[X] = sum(x * P(X=x))
E_X = sum(values .* probs);
fprintf('E[X] = %.4f   (theoretical: 3.5)\\n', E_X)

% Var(X) = E[X^2] - (E[X])^2
E_X2  = sum(values.^2 .* probs);
Var_X = E_X2 - E_X^2;
SD_X  = sqrt(Var_X);
fprintf('Var(X) = %.4f   (theoretical: %.4f)\\n', Var_X, 35/12)
fprintf('SD(X)  = %.4f   (theoretical: %.4f)\\n', SD_X, sqrt(35/12))

% Bar chart of PMF
bar(values, probs, 0.6, 'FaceColor', [0.27 0.51 0.71], 'EdgeColor', 'navy');
hold on;
xline(E_X, 'r--', 'LineWidth', 2);
xlabel('Outcome x'); ylabel('P(X = x)');
title('PMF: Fair Six-Sided Die');
legend('PMF', sprintf('E[X] = %.1f', E_X));
grid on; hold off;`,
            },
            {
              id: 2,
              cellTitle: 'CDF and simulation',
              prose: [
                '`cdf = cumsum(probs)` builds the CDF array by accumulating probabilities left to right. The $k$-th entry is $F(x_k) = \\sum_{i=1}^k p_i$. MATLAB\'s `cumsum` is the direct analog of NumPy\'s `np.cumsum`.',
                '`datasample(values, N, \'Weights\', probs)` draws $N$ random samples from `values` using `probs` as sampling weights — the MATLAB equivalent of `np.random.choice`. Alternatively, use `randsample` if you have the Statistics Toolbox.',
                'The `stairs` plot function creates a step plot appropriate for a CDF. Unlike `plot`, which connects points with straight lines, `stairs` creates the horizontal-then-vertical jumps characteristic of a discrete CDF.',
              ],
              code: `% CDF and simulation
values = [1; 2; 3; 4; 5; 6];
probs  = [1/6; 1/6; 1/6; 1/6; 1/6; 1/6];

% Compute CDF
cdf = cumsum(probs);
fprintf('CDF values:\\n');
for i = 1:length(values)
    fprintf('  F(%d) = %.4f\\n', values(i), cdf(i));
end

% Simulate N rolls
rng(42);
N = 100000;
% Using datasample from Statistics Toolbox
sample = datasample(values, N, 'Weights', probs);
fprintf('\\nSimulation (N = %d):\\n', N);
fprintf('  Sample mean = %.4f   (theory: 3.5)\\n',   mean(sample));
fprintf('  Sample var  = %.4f   (theory: %.4f)\\n', var(sample), 35/12);

% Plot PMF and CDF
figure;
subplot(1,2,1);
bar(values, probs, 0.6, 'FaceColor', [0.27 0.51 0.71]);
title('PMF'); xlabel('x'); ylabel('P(X=x)'); grid on;

subplot(1,2,2);
stairs([values; values(end)+1], [0; cdf], 'Color', [0.85 0.33 0.10], 'LineWidth', 2.5);
hold on; scatter(values, cdf, 60, [0.85 0.33 0.10], 'filled');
title('CDF F(x) = P(X \leq x)');
xlabel('x'); ylabel('F(x)'); ylim([-0.05 1.1]); grid on; hold off;`,
            },
            {
              id: 3,
              cellTitle: 'Linearity of expectation and variance rules',
              prose: [
                'This cell demonstrates the algebraic rules for transforming E[X] and Var(X). If $Y = aX + b$, then $E[Y] = aE[X] + b$ and $\\text{Var}(Y) = a^2 \\text{Var}(X)$. These are verified numerically for the die roll.',
                'The sum of two independent dice: $E[X_1 + X_2] = E[X_1] + E[X_2] = 7$ by linearity. $\\text{Var}(X_1 + X_2) = \\text{Var}(X_1) + \\text{Var}(X_2) = 35/6$ by independence. The simulation confirms both.',
                'Note how the distribution of the sum of two dice (triangular shape, values 2–12) looks very different from the uniform PMF of a single die. This shape change with sums is the seed of the Central Limit Theorem.',
              ],
              code: `% Linearity of expectation demonstration
values = [1;2;3;4;5;6];
probs  = ones(6,1)/6;
E_X   = sum(values .* probs);    % 3.5
Var_X = sum(values.^2 .* probs) - E_X^2;  % 35/12

% Y = 2X + 1
a = 2; b = 1;
fprintf('Y = %dX + %d:\\n', a, b);
fprintf('  E[Y] = a*E[X]+b = %.4f   (direct: %.4f)\\n', a*E_X+b, sum((a*values+b) .* probs))
fprintf('  Var(Y) = a^2*Var(X) = %.4f   (direct: %.4f)\\n', a^2*Var_X, sum((a*values+b - (a*E_X+b)).^2 .* probs))

% Sum of two independent dice
rng(1);
N = 100000;
d1 = datasample(values, N, 'Weights', probs);
d2 = datasample(values, N, 'Weights', probs);
S  = d1 + d2;
fprintf('\\nSum of 2 dice (simulated N=%d):\\n', N);
fprintf('  E[X1+X2]   = %.4f   (theory: 7.0000)\\n',    mean(S))
fprintf('  Var(X1+X2) = %.4f   (theory: %.4f)\\n', var(S), 35/6)

% Histogram of sum
histogram(S, 2:13, 'FaceColor', [0.27 0.51 0.71], 'Normalization', 'probability');
xlabel('Sum of two dice'); ylabel('P(S = k)');
title('Distribution of Sum of Two Fair Dice');
xline(7, 'r--', 'LineWidth', 2); grid on;`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'CNC defect distribution analysis',
              difficulty: 'medium',
              prompt: 'A CNC machine produces parts. The number of surface defects X per part has PMF: P(X=0)=0.70, P(X=1)=0.20, P(X=2)=0.08, P(X=3)=0.02. (1) Compute E[X] and Var(X). (2) Compute P(X >= 2) using the CDF. (3) If the cost of rework is $50 per defect, what is the expected rework cost per part? (Use linearity: E[cost] = 50*E[X]). (4) Simulate 1000 parts and find the empirical mean defects.',
              code: `% CNC defect distribution
values = [0; 1; 2; 3];
probs  = [0.70; 0.20; 0.08; 0.02];

% 1. Compute E[X] and Var(X)

% 2. CDF: P(X >= 2) = 1 - F(1)

% 3. Expected rework cost (linearity of expectation)

% 4. Simulate 1000 parts
rng(42);
`,
              hint: 'E_X = sum(values .* probs). Var_X = sum(values.^2 .* probs) - E_X^2. P(X>=2) = sum(probs(values >= 2)). Expected cost = 50 * E_X.',
            },
          ],
        },
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Formal measure-theoretic definition.** A random variable $X$ is a measurable function from a probability space $(\\Omega, \\mathcal{F}, P)$ to $(\\mathbb{R}, \\mathcal{B}(\\mathbb{R}))$ where $\\mathcal{B}(\\mathbb{R})$ is the Borel $\\sigma$-algebra. Measurability means $\\{\\omega : X(\\omega) \\leq x\\} \\in \\mathcal{F}$ for every $x \\in \\mathbb{R}$, ensuring the CDF $F(x) = P(X^{-1}((-\\infty, x]))$ is well-defined. For a discrete random variable, the range $\\mathcal{X}$ is countable and the PMF $p(x) = P(X^{-1}(\\{x\\}))$ determines $P$ completely via $P(X \\in A) = \\sum_{x \\in A \\cap \\mathcal{X}} p(x)$.',

      '**The Markov and Chebyshev inequalities.** For any non-negative random variable $X$ and $a > 0$: $P(X \\geq a) \\leq E[X]/a$ (Markov\'s inequality). For any random variable with mean $\\mu$ and variance $\\sigma^2$, and any $k > 0$: $P(|X - \\mu| \\geq k\\sigma) \\leq 1/k^2$ (Chebyshev\'s inequality). These bounds are distribution-free — they apply regardless of the shape of the PMF — but they are often loose. Proof of Chebyshev: apply Markov to $(X-\\mu)^2$ with $a = k^2\\sigma^2$. These inequalities give worst-case guarantees that are invaluable when the distribution is unknown.',

      '**Geometric interpretation of variance.** In the vector space of random variables with finite second moments (the Hilbert space $L^2(\\Omega, P)$), $E[X]$ is the "coordinate" of $X$ along the constant-1 direction, and $\\text{Var}(X) = \\|X - E[X]\\|^2_{L^2}$ is the squared distance from $X$ to its projection onto the constant-1 subspace. The standard deviation $\\sigma$ is the $L^2$ norm of the centered variable $X - \\mu$. Covariance $\\text{Cov}(X,Y) = \\langle X-\\mu_X, Y-\\mu_Y \\rangle_{L^2}$ is the inner product. Correlation $\\rho = \\text{Cov}(X,Y)/(\\sigma_X \\sigma_Y)$ is the cosine of the angle between $X-\\mu_X$ and $Y-\\mu_Y$ in this space.',

      '**Edge case: degenerate distributions.** A degenerate random variable satisfies $P(X = c) = 1$ for some constant $c$. Its PMF is a single point mass at $c$. $E[X] = c$ and $\\text{Var}(X) = 0$. This is the minimum possible variance. At the other extreme, there is no maximum variance for distributions on a bounded set — the variance is maximized when mass is concentrated at the two extreme points. For $X \\in [0, 1]$: $\\text{Var}(X) \\leq 1/4$, achieved when $P(X=0) = P(X=1) = 1/2$ (a fair Bernoulli).',

      '**Connection to regression and ML loss functions.** In supervised learning, if $Y$ is the true label and $\\hat{Y}$ is the model prediction, the mean squared error $E[(Y-\\hat{Y})^2] = \\text{Var}(Y-\\hat{Y}) + (E[Y-\\hat{Y}])^2 = \\text{Var}(Y-\\hat{Y}) + \\text{Bias}^2$. This is the bias-variance tradeoff: a model with high bias (systematic error, $E[Y-\\hat{Y}] \\neq 0$) or high variance (random error, $\\text{Var}(Y-\\hat{Y})$ large) produces a large MSE. Both terms must be minimized — the heart of model selection.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Chebyshev\'s Inequality',
        body: 'For any random variable $X$ with mean $\\mu$ and variance $\\sigma^2 < \\infty$, and any $k > 0$:\n$$P(|X - \\mu| \\geq k\\sigma) \\leq \\frac{1}{k^2}$$\nEquivalently: $P(|X-\\mu| \\geq \\epsilon) \\leq \\sigma^2/\\epsilon^2$. At least $1 - 1/k^2$ of the probability lies within $k$ standard deviations of the mean, for any distribution.',
      },
      {
        type: 'insight',
        title: 'The Bias-Variance Decomposition',
        body: 'The MSE of any estimator $\\hat{\\theta}$ for parameter $\\theta$ decomposes as:\n$$E[(\\hat{\\theta}-\\theta)^2] = \\text{Var}(\\hat{\\theta}) + [\\text{Bias}(\\hat{\\theta})]^2$$\nwhere $\\text{Bias}(\\hat{\\theta}) = E[\\hat{\\theta}] - \\theta$. Reducing bias often increases variance and vice versa. This fundamental tradeoff governs model complexity choices throughout statistics and machine learning.',
      },
      {
        type: 'warning',
        title: 'PMF vs. PDF: Do Not Confuse',
        body: 'For a discrete random variable, $P(X = x) = p(x) > 0$ is possible — probability masses at points. For a continuous random variable, $P(X = x) = 0$ for every single point $x$; probabilities only make sense for intervals. The PMF applies to discrete; the PDF applies to continuous. Do not integrate a PMF or sum a PDF — they require their respective operations.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'stat5-001-ex1',
      title: 'Computing E[X] and Var(X) for a Loaded Die',
      problem: 'A loaded die has $P(X=6) = 1/2$ and $P(X=k) = 1/10$ for $k = 1,2,3,4,5$. Compute $E[X]$, $E[X^2]$, $\\text{Var}(X)$, and $\\sigma$.',
      steps: [
        {
          expression: 'E[X] = 1\\cdot\\tfrac{1}{10} + 2\\cdot\\tfrac{1}{10} + 3\\cdot\\tfrac{1}{10} + 4\\cdot\\tfrac{1}{10} + 5\\cdot\\tfrac{1}{10} + 6\\cdot\\tfrac{1}{2}',
          annotation: 'Apply $E[X] = \\sum x P(X=x)$. Faces 1–5 each have probability 1/10; face 6 has probability 1/2. First verify the PMF sums to 1: $5(1/10) + 1/2 = 1/2 + 1/2 = 1$ ✓. Multiply each outcome by its probability.',
          strategyTitle: 'Apply weighted-sum definition',
          hints: ['Verify PMF sums to 1 first: 5×(1/10) + 1/2 = 0.5 + 0.5 = 1 ✓'],
        },
        {
          expression: 'E[X] = \\tfrac{1+2+3+4+5}{10} + 3 = \\tfrac{15}{10} + 3 = 1.5 + 3 = 4.5',
          annotation: 'Group the five equal-probability terms: $\\sum_{k=1}^5 k/10 = 15/10 = 1.5$. Add the contribution from face 6: $6 \\times 1/2 = 3$. Total: E[X] = 4.5. Compare with the fair die: loading face 6 raised E[X] from 3.5 to 4.5.',
          strategyTitle: 'Group equal-probability terms',
          hints: ['The fair-die E[X]=3.5. Loading the highest face should push E[X] above 3.5 — our answer of 4.5 makes sense.'],
        },
        {
          expression: 'E[X^2] = \\frac{1^2+2^2+3^2+4^2+5^2}{10} + 6^2 \\cdot \\tfrac{1}{2} = \\frac{55}{10} + 18 = 5.5 + 18 = 23.5',
          annotation: 'Compute $E[X^2] = \\sum x^2 P(X=x)$. Sum of squares 1–5: $1+4+9+16+25 = 55$. Divide by 10 to get 5.5. Then $36 \\times 1/2 = 18$. Total: 23.5.',
          strategyTitle: 'Compute E[X²] separately',
          hints: ['$1^2+2^2+3^2+4^2+5^2 = 1+4+9+16+25 = 55$'],
        },
        {
          expression: '\\text{Var}(X) = E[X^2] - (E[X])^2 = 23.5 - 4.5^2 = 23.5 - 20.25 = 3.25',
          annotation: 'Apply the shortcut formula. $(E[X])^2 = 4.5^2 = 20.25$. Variance = 23.5 − 20.25 = 3.25. Note: the fair die has Var(X) = 35/12 ≈ 2.92, so the loaded die has slightly more spread — perhaps surprising, but the heavy weight on 6 increases the squared distance for outcomes 1–5.',
          strategyTitle: 'Variance shortcut formula',
          hints: ['4.5² = 20.25. Double-check: (4.5)×(4.5) = 20.25.'],
        },
        {
          expression: '\\sigma = \\sqrt{3.25} \\approx 1.803',
          annotation: 'Take the square root of variance to get the standard deviation in the same units as $X$ (die faces).',
          strategyTitle: 'Standard deviation',
          hints: [],
        },
      ],
      conclusion: 'The loaded die has E[X] = 4.5 (versus 3.5 for a fair die) and Var(X) = 3.25 (versus ≈ 2.92). Loading face 6 shifts and slightly spreads the distribution.',
    },
    {
      id: 'stat5-001-ex2',
      title: 'Using the CDF to Find Interval Probabilities',
      problem: 'Let $X$ have PMF: $P(X=0)=0.20$, $P(X=1)=0.35$, $P(X=2)=0.30$, $P(X=3)=0.15$. (a) Build the CDF. (b) Find $P(1 \\leq X \\leq 2)$. (c) Find $P(X > 1)$.',
      steps: [
        {
          expression: 'F(0) = 0.20,\\quad F(1) = 0.55,\\quad F(2) = 0.85,\\quad F(3) = 1.00',
          annotation: 'Build the CDF by accumulating: $F(0) = P(X \\leq 0) = 0.20$. $F(1) = P(X \\leq 1) = 0.20 + 0.35 = 0.55$. $F(2) = 0.55 + 0.30 = 0.85$. $F(3) = 0.85 + 0.15 = 1.00$ ✓.',
          strategyTitle: 'Accumulate probabilities left to right',
          hints: ['The CDF must reach exactly 1 at the largest possible value. If it does not, recheck your addition.'],
        },
        {
          expression: 'P(1 \\leq X \\leq 2) = F(2) - F(0) = 0.85 - 0.20 = 0.65',
          annotation: 'For a discrete distribution, $P(a \\leq X \\leq b) = F(b) - F(a-1) = F(b) - F(\\text{value just below }a)$. Since $X$ takes integer values, $P(1 \\leq X \\leq 2) = F(2) - F(0)$. We subtract $F(0)$ (not $F(1)$) because we want to include $X=1$.',
          strategyTitle: 'Use CDF for interval probabilities',
          hints: ['$P(a \\leq X \\leq b) = F(b) - F(a^-)$ where $F(a^-)$ is the CDF just before $a$. For integers: $F(a-1)$.'],
        },
        {
          expression: 'P(X > 1) = 1 - P(X \\leq 1) = 1 - F(1) = 1 - 0.55 = 0.45',
          annotation: 'Use the complement rule with the CDF: $P(X > 1) = 1 - P(X \\leq 1) = 1 - F(1)$. Note the strict inequality: $X > 1$ excludes $X=1$, so we subtract $F(1)$, not $F(0)$.',
          strategyTitle: 'Complement rule with CDF',
          hints: ['Strict inequality: P(X > a) = 1 - F(a). Non-strict: P(X ≥ a) = 1 - F(a-1) for integers.'],
        },
      ],
      conclusion: 'The CDF is the most efficient tool for computing probabilities of intervals and inequalities. Building it once lets you answer any range query with simple subtraction.',
    },
    {
      id: 'stat5-001-ex3',
      title: 'Linearity of Expectation — Casino Game',
      problem: 'A game costs \\$2 to play. You roll two fair dice. If the sum equals 7, you win \\$10. Otherwise you win nothing. Let $W$ = winnings net of the entry fee. Compute $E[W]$.',
      steps: [
        {
          expression: 'P(\\text{sum}=7) = \\frac{6}{36} = \\frac{1}{6}',
          annotation: 'There are 36 equally likely outcomes for two dice. Combinations summing to 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) — six combinations. So $P(\\text{sum}=7) = 6/36 = 1/6$.',
          strategyTitle: 'Count favorable outcomes',
          hints: ['Enumerate: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) — exactly 6 pairs sum to 7.'],
        },
        {
          expression: 'W = \\begin{cases} 10 - 2 = 8 & \\text{if sum}=7 \\\\ 0 - 2 = -2 & \\text{otherwise} \\end{cases}',
          annotation: 'Net winnings = prize − entry fee. Win \\$10 prize: net = \\$8. Win nothing: net = −\\$2 (the lost entry fee).',
          strategyTitle: 'Define the net payoff variable',
          hints: ['Always subtract the entry fee from the prize to get net winnings.'],
        },
        {
          expression: 'E[W] = 8 \\cdot \\tfrac{1}{6} + (-2) \\cdot \\tfrac{5}{6} = \\tfrac{8}{6} - \\tfrac{10}{6} = -\\tfrac{2}{6} \\approx -\\$0.33',
          annotation: 'Apply $E[W] = \\sum w P(W=w)$. The player expects to lose about 33 cents per game on average. To break even, the prize would need to satisfy: $8p + (-2)(1-p) = 0 \\Rightarrow p = 2/10 = 1/5$, requiring $P(\\text{win}) = 1/5 = 7.2/36$ — impossible on a fair die.',
          strategyTitle: 'Apply expected value formula',
          hints: ['The expected value is negative → the game favors the house. This is typical of casino games.'],
        },
      ],
      conclusion: 'The expected net loss is $−1/3 ≈ −\\$0.33$ per game. The game is not fair — the house has a positive edge. Every casino game is designed so that E[player winnings] < 0.',
    },
    {
      id: 'stat5-001-ex4',
      title: 'Variance and the Spread-Mean Tradeoff',
      problem: 'Two investments have the same expected return $E[X] = E[Y] = 5\\%$. Investment $X$: $P(X = -5) = 0.25$, $P(X = 5) = 0.50$, $P(X = 15) = 0.25$. Investment $Y$: always returns 5% (deterministic). Compare their variances and interpret.',
      steps: [
        {
          expression: 'E[X] = (-5)(0.25) + 5(0.50) + 15(0.25) = -1.25 + 2.5 + 3.75 = 5\\%\\; ✓',
          annotation: 'Verify E[X] = 5%: the weighted average of the three scenarios equals 5%. Both investments have the same mean, so comparing means alone would suggest they are equivalent — but they are not.',
          strategyTitle: 'Verify means are equal',
          hints: [],
        },
        {
          expression: 'E[X^2] = 25(0.25) + 25(0.50) + 225(0.25) = 6.25 + 12.5 + 56.25 = 75',
          annotation: 'Compute $E[X^2]$ using $g(x) = x^2$: $(-5)^2 = 25$, $5^2 = 25$, $15^2 = 225$. Notice $(-5)^2 = 25$, not $-25$.',
          strategyTitle: 'Compute E[X²]',
          hints: ['$(-5)^2 = 25$, not $-25$. Always square before multiplying by the probability.'],
        },
        {
          expression: '\\text{Var}(X) = 75 - 5^2 = 75 - 25 = 50,\\quad \\sigma_X = \\sqrt{50} \\approx 7.07\\%',
          annotation: 'Var(X) = E[X²] − (E[X])² = 75 − 25 = 50. Standard deviation ≈ 7.07%.',
          strategyTitle: 'Apply shortcut formula',
          hints: [],
        },
        {
          expression: '\\text{Var}(Y) = 0,\\quad \\sigma_Y = 0',
          annotation: '$Y$ is a constant (deterministic), so $P(Y=5) = 1$. $E[Y] = 5$, $E[Y^2] = 25$, $\\text{Var}(Y) = 25 - 25 = 0$. A risk-free asset has zero variance by definition.',
          strategyTitle: 'Degenerate distribution has zero variance',
          hints: [],
        },
      ],
      conclusion: 'Both investments return 5% on average, but X has variance 50 (SD ≈ 7%) while Y has variance 0. A risk-averse investor prefers Y; a risk-seeking investor might prefer X. Risk (variance) and return (mean) are the two fundamental dimensions of investment analysis.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'stat5-001-ch1',
      difficulty: 'easy',
      problem: 'A random variable $X$ has PMF: $P(X=1) = 0.4$, $P(X=2) = 0.3$, $P(X=3) = 0.2$, $P(X=4) = 0.1$. Compute $E[X]$ and $P(X \\geq 3)$.',
      hint: 'E[X] = Σ x·P(X=x). P(X ≥ 3) = P(X=3) + P(X=4) = 0.2 + 0.1 = 0.3.',
      walkthrough: [
        { expression: 'E[X] = 1(0.4) + 2(0.3) + 3(0.2) + 4(0.1)', annotation: 'Apply the expected value formula. Sum of probabilities: 0.4+0.3+0.2+0.1 = 1.0 ✓.' },
        { expression: 'E[X] = 0.4 + 0.6 + 0.6 + 0.4 = 2.0', annotation: 'The expected value is exactly 2.0.' },
        { expression: 'P(X \\geq 3) = P(X=3) + P(X=4) = 0.2 + 0.1 = 0.3', annotation: 'Sum all probabilities at or above 3. Equivalently, 1 − F(2) = 1 − 0.70 = 0.30.' },
      ],
      answer: 'E[X] = 2.0 and P(X ≥ 3) = 0.30.',
    },
    {
      id: 'stat5-001-ch2',
      difficulty: 'medium',
      problem: 'A game pays $X$ dollars where $P(X=0)=0.5$, $P(X=2)=0.3$, $P(X=10)=0.2$. If the game costs $\\$c$ to play, find the maximum value of $c$ for which playing is a positive-expected-value decision.',
      hint: 'Find E[X] first. Playing is +EV when E[X] - c > 0, i.e., c < E[X].',
      walkthrough: [
        { expression: 'E[X] = 0(0.5) + 2(0.3) + 10(0.2) = 0 + 0.6 + 2.0 = 2.6', annotation: 'Compute expected gross payout.' },
        { expression: 'E[\\text{net}] = E[X] - c = 2.6 - c', annotation: 'Net winnings = gross − cost. By linearity: E[net] = E[X] − c.' },
        { expression: 'c < 2.6 \\implies E[\\text{net}] > 0', annotation: 'Playing is positive expected value iff the cost is strictly less than the expected gross payout of $2.60.' },
      ],
      answer: 'Maximum entry fee for a positive-EV game: $c < \\$2.60$. At c = \\$2.60 the game is exactly fair (zero expected profit for both sides).',
    },
    {
      id: 'stat5-001-ch3',
      difficulty: 'hard',
      problem: 'Let $X$ and $Y$ be independent, each with $P(\\text{value}=1) = P(\\text{value}=2) = 0.5$. Let $Z = X + Y$. (a) Find the PMF of $Z$. (b) Find $E[Z]$ and $\\text{Var}(Z)$ two ways: directly from the PMF of $Z$, and using linearity rules.',
      hint: 'Z takes values 2, 3, 4. P(Z=2)=P(X=1)P(Y=1)=1/4. P(Z=3)=P(X=1)P(Y=2)+P(X=2)P(Y=1)=1/2. P(Z=4)=1/4.',
      walkthrough: [
        { expression: 'P(Z=2) = P(X=1)P(Y=1) = \\tfrac{1}{4},\\; P(Z=3) = \\tfrac{1}{2},\\; P(Z=4) = \\tfrac{1}{4}', annotation: 'Independence: multiply PMFs. Z=3 arises two ways: (1,2) and (2,1), each probability 1/4, total 1/2.' },
        { expression: 'E[Z]_{\\text{direct}} = 2(\\tfrac{1}{4}) + 3(\\tfrac{1}{2}) + 4(\\tfrac{1}{4}) = 0.5+1.5+1 = 3', annotation: 'Direct from Z\'s PMF. Also: E[X]=E[Y]=1.5, so E[Z]=E[X]+E[Y]=3 ✓ by linearity.' },
        { expression: '\\text{Var}(Z)_{\\text{direct}}: E[Z^2] = 4(\\tfrac{1}{4})+9(\\tfrac{1}{2})+16(\\tfrac{1}{4}) = 1+4.5+4 = 9.5,\\quad \\text{Var}(Z)=9.5-9=0.5', annotation: 'Via shortcut: Var(X)=E[X²]−(E[X])²=2.5−2.25=0.25. By independence: Var(Z)=Var(X)+Var(Y)=0.25+0.25=0.5 ✓.' },
      ],
      answer: 'PMF of Z: P(Z=2)=1/4, P(Z=3)=1/2, P(Z=4)=1/4. E[Z]=3, Var(Z)=0.5. Both direct and linearity methods agree.',
    },
  ],

  definitions: [
    {
      term: "random variable",
      definition: "A function that assigns a real number to each outcome in a sample space. Discrete random variables have a finite or countably infinite set of possible values.",
    },
    {
      term: "probability mass function (PMF)",
      definition: "A complete description of a discrete random variable listing each possible value x and its probability P(X=x). Must satisfy: all probabilities ≥ 0 and sum = 1.",
    },
    {
      term: "expected value E[X]",
      definition: "The long-run average of a random variable over many repetitions: E[X] = Σ x·P(X=x). Also called the mean of the distribution. Not necessarily a possible outcome (e.g., E[die roll] = 3.5).",
    },
    {
      term: "variance Var(X)",
      definition: "The average squared distance from the mean: Var(X) = E[(X−μ)²] = E[X²] − (E[X])². Measures how spread out the distribution is. Always ≥ 0.",
    },
    {
      term: "linearity of expectation",
      definition: "E[aX+b] = aE[X]+b and E[X+Y] = E[X]+E[Y] unconditionally — no independence required. One of the most powerful tools in probability.",
    },
    {
      term: "cumulative distribution function (CDF)",
      definition: "F(a) = P(X ≤ a): the accumulated probability up to and including a. Non-decreasing, starts at 0, ends at 1. For ranges: P(a < X ≤ b) = F(b) − F(a).",
    },
  ],

  // ── Semantic Layer ─────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'P(X = x)', meaning: 'Probability mass function — the probability that random variable X takes the specific value x' },
      { symbol: 'F(x) = P(X \\leq x)', meaning: 'Cumulative distribution function — the probability that X is at most x; always non-decreasing from 0 to 1' },
      { symbol: 'E[X] = \\sum x P(X=x)', meaning: 'Expected value — the long-run average; probability-weighted center of mass of the distribution' },
      { symbol: '\\text{Var}(X) = E[X^2] - (E[X])^2', meaning: 'Variance — average squared deviation from the mean; always ≥ 0; equals 0 only for a constant random variable' },
      { symbol: '\\sigma = \\sqrt{\\text{Var}(X)}', meaning: 'Standard deviation — square root of variance; in the same units as X; measures typical spread around the mean' },
      { symbol: 'E[aX+b] = aE[X]+b', meaning: 'Linearity of expectation — shifting by b shifts the mean; scaling by a scales the mean; holds unconditionally' },
    ],
    rulesOfThumb: [
      'Always verify a PMF sums to 1 before computing anything. A PMF that doesn\'t sum to 1 is not a valid probability distribution.',
      'Use the shortcut Var(X) = E[X²] − (E[X])² for calculations; use the definition Var(X) = E[(X−μ)²] for understanding and proofs.',
      'E[X+Y] = E[X]+E[Y] always (no independence needed). Var(X+Y) = Var(X)+Var(Y) only when X and Y are uncorrelated.',
      'E[X] is the long-run average over many repetitions, not necessarily any single possible outcome. A die never shows 3.5.',
      'P(X ≥ a) = 1 − F(a−1) for integer-valued X. P(X > a) = 1 − F(a). The "or equal to" matters for discrete variables.',
      'Chebyshev\'s inequality guarantees at least 75% of probability is within 2σ of the mean, regardless of the distribution shape.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      { lessonId: 'stat4-006', label: 'Probability Rules Summary', note: 'Review if the PMF axioms (non-negativity, sums to 1) or basic probability calculations feel unclear.' },
      { lessonId: 'stat4-001', label: 'Introduction to Probability', note: 'Review sample spaces and events if the definition of P(X=x) is confusing.' },
    ],
    futureLinks: [
      { lessonId: 'stat5-002', label: 'Binomial Distribution', note: 'The Binomial is a specific discrete distribution with PMF derived from counting principles — all stat5-001 tools apply.' },
      { lessonId: 'stat5-003', label: 'Poisson Distribution', note: 'Another specific discrete distribution; E[X] and Var(X) both equal λ.' },
      { lessonId: 'stat5-005', label: 'Central Limit Theorem', note: 'The CLT explains why averages of random variables become normal — built on E[X] and Var(X) from this lesson.' },
      { lessonId: 'stat6-001', label: 'Confidence Intervals', note: 'Confidence intervals use E[X] and SE = σ/√n directly.' },
    ],
  },

  // ── Checkpoints ───────────────────────────────────────────────
  checkpoints: [
    { id: 'stat5-001-cp1', label: 'Define PMF and state its two required properties.', type: 'read' },
    { id: 'stat5-001-cp2', label: 'Compute E[X] for the loaded die (P(6)=1/2, rest 1/10 each).', type: 'example' },
    { id: 'stat5-001-cp3', label: 'Build the CDF for a 4-outcome PMF and answer an interval probability question.', type: 'lab' },
    { id: 'stat5-001-cp4', label: 'Compute Var(X) using the shortcut formula for the loaded die.', type: 'example' },
    { id: 'stat5-001-cp5', label: 'State linearity of expectation and identify when Var(X+Y) = Var(X)+Var(Y).', type: 'read' },
    { id: 'stat5-001-cp6', label: 'Price an insurance policy: find the break-even premium given payout and claim probability.', type: 'challenge' },
    { id: 'stat5-001-cp7', label: 'Simulate 10,000 die rolls in Python and verify mean ≈ 3.5 and var ≈ 35/12.', type: 'lab' },
    { id: 'stat5-001-cp8', label: 'Apply Chebyshev\'s inequality: what fraction of outcomes lie within 2σ of the mean?', type: 'read' },
  ],

  // ── Assessment ────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'stat5-001-a1',
        type: 'choice',
        text: 'A random variable $X$ has $E[X] = 4$ and $\\text{Var}(X) = 9$. Let $Y = 3X - 1$. What is $\\text{Var}(Y)$?',
        options: ['27', '81', '26', '9'],
        answer: '81',
        hint: 'Var(aX+b) = a²·Var(X). Here a=3, so Var(Y) = 9·Var(X) = 9·9 = 81.',
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────
  quiz: [
    {
      id: 'stat5-001-q1',
      type: 'choice',
      text: 'Which of the following is a valid PMF for a random variable taking values {1, 2, 3}?',
      options: [
        'P(1)=0.5, P(2)=0.3, P(3)=0.3',
        'P(1)=0.5, P(2)=0.3, P(3)=0.2',
        'P(1)=0.5, P(2)=−0.1, P(3)=0.6',
        'P(1)=0.4, P(2)=0.4, P(3)=0.4',
      ],
      answer: 'P(1)=0.5, P(2)=0.3, P(3)=0.2',
      hints: ['A valid PMF must have all probabilities ≥ 0 AND sum exactly to 1.'],
      reviewSection: 'Intuition → PMF: listing all possible outcomes',
    },
    {
      id: 'stat5-001-q2',
      type: 'choice',
      text: 'For PMF: $P(X=0)=0.3$, $P(X=1)=0.5$, $P(X=2)=0.2$. What is $E[X]$?',
      options: ['0.9', '1.0', '0.5', '1.5'],
      answer: '0.9',
      hints: ['E[X] = 0(0.3) + 1(0.5) + 2(0.2) = 0 + 0.5 + 0.4 = 0.9'],
      reviewSection: 'Math → Expected value formula',
    },
    {
      id: 'stat5-001-q3',
      type: 'choice',
      text: 'If $E[X] = 3$ and $E[X^2] = 13$, what is $\\text{Var}(X)$?',
      options: ['4', '10', '13', '√4 = 2'],
      answer: '4',
      hints: ['Var(X) = E[X²] − (E[X])² = 13 − 9 = 4'],
      reviewSection: 'Math → Variance shortcut formula',
    },
    {
      id: 'stat5-001-q4',
      type: 'choice',
      text: '$X$ and $Y$ are dependent random variables. Which statement is always true?',
      options: [
        'E[X+Y] = E[X] + E[Y]',
        'Var(X+Y) = Var(X) + Var(Y)',
        'E[XY] = E[X]·E[Y]',
        'Var(X+Y) = 0',
      ],
      answer: 'E[X+Y] = E[X] + E[Y]',
      hints: ['Linearity of expectation holds unconditionally — no independence needed.'],
      reviewSection: 'Math → Linearity of expectation',
    },
    {
      id: 'stat5-001-q5',
      type: 'choice',
      text: 'PMF: $P(X=0)=0.4$, $P(X=1)=0.4$, $P(X=2)=0.2$. What is $P(X \\geq 1)$?',
      options: ['0.4', '0.6', '0.2', '0.8'],
      answer: '0.6',
      hints: ['P(X ≥ 1) = 1 − P(X < 1) = 1 − P(X=0) = 1 − 0.4 = 0.6'],
      reviewSection: 'Intuition → CDF and interval probabilities',
    },
    {
      id: 'stat5-001-q6',
      type: 'choice',
      text: 'Let $Y = -2X + 5$ where $E[X] = 3$ and $\\text{Var}(X) = 4$. Find $E[Y]$ and $\\text{Var}(Y)$.',
      options: [
        'E[Y] = −1, Var(Y) = 16',
        'E[Y] = −1, Var(Y) = −8',
        'E[Y] = 1, Var(Y) = 16',
        'E[Y] = 11, Var(Y) = 16',
      ],
      answer: 'E[Y] = −1, Var(Y) = 16',
      hints: ['E[−2X+5] = −2E[X]+5 = −6+5 = −1. Var(−2X+5) = (−2)²Var(X) = 4·4 = 16.'],
      reviewSection: 'Math → Linearity rules for E and Var',
    },
    {
      id: 'stat5-001-q7',
      type: 'choice',
      text: 'PMF: $P(X=1)=0.2$, $P(X=3)=0.3$, $P(X=5)=0.5$. Using the shortcut, what is $\\text{Var}(X)$?',
      options: ['2.44', '1.56', '3.6', '15.4'],
      answer: '2.44',
      hints: [
        'E[X] = 0.2(1)+0.3(3)+0.5(5) = 0.2+0.9+2.5 = 3.6.',
        'E[X²] = 0.2(1)+0.3(9)+0.5(25) = 0.2+2.7+12.5 = 15.4. Var = 15.4 − 3.6² = 15.4 − 12.96 = 2.44.',
      ],
      reviewSection: 'Intuition → Variance measures spread around the mean',
    },
    {
      id: 'stat5-001-q8',
      type: 'choice',
      text: 'PMF: $P(X=0)=0.4$, $P(X=1)=0.4$, $P(X=2)=0.2$. What is $P(1 \\leq X \\leq 2)$?',
      options: ['0.4', '0.6', '0.2', '0.8'],
      answer: '0.6',
      hints: [
        'P(1 ≤ X ≤ 2) = P(X=1) + P(X=2).',
        '0.4 + 0.2 = 0.6.',
      ],
      reviewSection: 'Callout → CDF vs PMF',
    },
    {
      id: 'stat5-001-q9',
      type: 'choice',
      text: '$X$ and $Y$ are independent with $E[X]=3$, $E[Y]=5$, $\\text{Var}(X)=2$, $\\text{Var}(Y)=3$. What is $\\text{Var}(X+Y)$?',
      options: ['5', '8', '15', '√5'],
      answer: '5',
      hints: [
        'For independent random variables: Var(X+Y) = Var(X) + Var(Y).',
        '2 + 3 = 5. Independence means Cov(X,Y) = 0, so no cross term.',
      ],
      reviewSection: 'Warning callout → Var(X+Y) ≠ Var(X)+Var(Y) in general',
    },
    {
      id: 'stat5-001-q10',
      type: 'choice',
      text: 'PMF: $P(X=0)=0.1$, $P(X=1)=0.2$, $P(X=2)=0.3$, $P(X=3)=0.4$. What is $F(3) = P(X \\leq 3)$?',
      options: ['0.4', '0.6', '0.7', '1.0'],
      answer: '1.0',
      hints: [
        'F(3) = P(X=0)+P(X=1)+P(X=2)+P(X=3) = 0.1+0.2+0.3+0.4.',
        '0.1+0.2+0.3+0.4 = 1.0. The CDF at the maximum value always equals 1.',
      ],
      reviewSection: 'Callout → CDF vs PMF: Two Ways to Describe a Distribution',
    },
  ],

  // ── Misconceptions ────────────────────────────────────────────
  misconceptions: [
    {
      falseBelief: 'E[X] is always one of the possible values of X.',
      whyStudentsThinkIt: 'Students confuse the expected value with the most likely outcome (mode) or a typical outcome. The word "expected" sounds like something that will actually occur.',
      correctionExample: 'A fair die has E[X] = 3.5, which is not a possible outcome. A family\'s "expected" number of children can be 2.4. The expected value is a population parameter (center of mass), not a prediction for any single trial.',
      contrastCase: 'For P(X=1)=0.5, P(X=2)=0.5: E[X]=1.5, which is not a possible value. For P(X=2)=1 (degenerate): E[X]=2, which IS the only value — the exception, not the rule.',
    },
    {
      falseBelief: 'Var(X+Y) = Var(X) + Var(Y) always.',
      whyStudentsThinkIt: 'Students correctly learn E[X+Y] = E[X]+E[Y] (always true) and incorrectly generalize this linearity to variance.',
      correctionExample: 'If Y = −X (perfect negative correlation): Var(X+Y) = Var(0) = 0, but Var(X) + Var(Y) = 2Var(X) ≠ 0. The correct formula is Var(X+Y) = Var(X) + Var(Y) + 2Cov(X,Y), and Cov(X,−X) = −Var(X).',
      contrastCase: 'When X and Y are independent: Cov(X,Y) = 0, so Var(X+Y) = Var(X)+Var(Y). Independence is the special case, not the general rule.',
    },
    {
      falseBelief: 'The standard deviation has the same units as the variance.',
      whyStudentsThinkIt: 'Students forget that variance squares the deviations. If X is in millimeters, Var(X) is in mm², but SD(X) is in mm.',
      correctionExample: 'CNC shaft diameter: X in mm. Var(X) = 0.0004 mm². SD(X) = √0.0004 = 0.02 mm. The variance (0.0004 mm²) is harder to interpret; the standard deviation (0.02 mm) directly compares to the tolerance ±0.02 mm.',
      contrastCase: 'This is why standard deviation is reported in practice — it is on the same scale as the data. Variance is used in formulas (e.g., the bias-variance tradeoff) because it has nicer algebraic properties.',
    },
  ],

  // ── Transfer Prompts ──────────────────────────────────────────
  transferPrompts: [
    {
      situation: 'You are designing a lottery. Tickets cost $5. Three prize tiers: $100 (probability 0.01), $20 (probability 0.05), $5 (probability 0.10), nothing otherwise. Is this lottery profitable for the organizer? How should you adjust the probabilities or prizes to target a specific profit margin?',
      competingTechniques: ['Simulation', 'Expected value formula', 'Break-even analysis'],
      whyThisTechniqueWins: 'Expected value formula gives an exact analytical answer instantly: E[prize] = 1.00 + 1.00 + 0.50 = $2.50. Since tickets cost $5, expected profit per ticket = $5 − $2.50 = $2.50. This is more informative than simulation (which is approximate) and more general than break-even analysis (which only finds the zero-profit point).',
    },
    {
      situation: 'A medical test returns positive or negative. Let X = 1 if positive, X = 0 if negative. The sensitivity (P(positive|disease)) and specificity (P(negative|no disease)) are known. How would you use E[X] and Var(X) in this context, and why is Chebyshev\'s inequality useful for a population-level quality guarantee?',
      competingTechniques: ['Contingency table calculation', 'Expected value and variance', 'Chebyshev bound'],
      whyThisTechniqueWins: 'For a specific individual test: contingency tables suffice. For a population of n tests: E[total positives] = n·P(positive) by linearity; Var(total positives) can be computed; Chebyshev gives a guaranteed bound on how far the actual count strays from the expected count regardless of the population distribution — critical for public health planning.',
    },
  ],

  // ── Debugging ─────────────────────────────────────────────────
  debugging: [
    {
      commonError: 'Computing Var(X) by adding probabilities before squaring deviations.',
      symptom: 'The computed variance is negative or unreasonably small.',
      whyItHappened: 'Student wrote Var(X) = (Σ(x − μ)P(X=x))² instead of Σ(x−μ)²P(X=x). The square must be INSIDE the sum, applied to each deviation before multiplying by the probability.',
      repairStrategy: 'Always: (1) compute each deviation (x−μ); (2) SQUARE each deviation; (3) multiply each squared deviation by its probability; (4) sum all those products. The shortcut E[X²]−(E[X])² avoids the squaring step but requires a separate pass for E[X²].',
    },
    {
      commonError: 'Using F(a) instead of F(a−1) when computing P(X ≥ a) for an integer-valued variable.',
      symptom: 'P(X ≥ a) is too small by exactly P(X = a).',
      whyItHappened: 'For discrete distributions, P(X ≥ a) = 1 − P(X ≤ a−1) = 1 − F(a−1). Students mistakenly write 1 − F(a) = P(X > a), which excludes the value a.',
      repairStrategy: 'Write out the inequality carefully. "At least a" includes a: P(X ≥ a) = 1 − F(a−1). "More than a" excludes a: P(X > a) = 1 − F(a). For non-integer-valued distributions, "at least" and "more than" coincide because P(X=a)=0.',
    },
  ],

  // ── Mastery ───────────────────────────────────────────────────
  mastery: {
    targetLevel: 3,
    solveIndependently: 'Given any discrete PMF table, compute E[X], E[X²], Var(X), and σ from scratch, and answer CDF-based probability queries.',
    explainVerbally: 'Explain why E[X] is called "expected" value even when it is not a possible outcome, and why variance requires squaring the deviations.',
    detectIncorrectApplication: 'Identify when a student has incorrectly applied variance additivity to dependent variables, or confused CDF and PMF in a probability query.',
    transferToUnfamiliar: 'Set up and solve an expected-value problem in a new domain (medical testing, engineering quality control, finance) including defining the random variable, constructing the PMF, and computing the key statistics.',
  },
};
