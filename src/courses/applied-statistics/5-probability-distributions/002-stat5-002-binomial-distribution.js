export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'stat5-002',
  slug: 'binomial-distribution',
  chapter: 'stat5',
  order: 2,
  title: 'The Binomial Distribution',
  subtitle: 'Counting successes in a fixed number of independent trials — from quality control to A/B testing.',
  tags: ['binomial', 'Bernoulli', 'PMF', 'combinations', 'normal approximation', 'np', 'n(1-p)'],
  aliases: 'binomial distribution Bernoulli trials successes failures n p PMF CDF normal approximation quality control A/B testing drug trials',
  timeToComplete: 35,
  coreConcept: 'The Binomial(n,p) distribution counts the number of successes in n independent Bernoulli trials, each with probability p. Its PMF uses combinations to count how many orderings lead to k successes. Expected value is np, variance is np(1−p).',
  prerequisites: ['stat5-001', 'stat4-005'],
  nextLesson: 'stat5-003',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: 'A factory produces 10,000 microchips per day, each with a 2% defect rate. How many defective chips should the quality engineer expect today — and how unusual would it be to see more than 250 defectives?',
    realWorldContext: 'The binomial distribution is the workhorse of quality control, clinical trials, and digital marketing. When Pfizer runs a Phase III vaccine trial with 40,000 participants and 95% efficacy, statisticians use the binomial distribution to determine how many infections are "expected" in the placebo group and whether the observed count is unusual. When Google runs an A/B test showing a new button to 50,000 users with a baseline 3% click-through rate, the number of clicks follows a binomial distribution — which tells the engineering team whether a measured improvement is statistically real or just random variation. In CNC manufacturing, each part either passes or fails inspection: Binomial(n, p) models the number of failed parts per batch, powering the control charts on every factory floor. Understanding the binomial is the gateway to hypothesis testing, confidence intervals, and logistic regression.',
    previewVisualizationId: 'BinomialDistributionViz',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Roadmap for this lesson.** By the end you will be able to: (1) recognize when a binomial model is appropriate using the four BINS conditions; (2) compute $P(X=k)$ using the PMF formula with combinations; (3) find $E[X] = np$ and $\\text{Var}(X) = np(1-p)$ without summing the full PMF; (4) use the CDF to find $P(X \\leq k)$ and related inequalities; (5) apply the normal approximation when $np \\geq 5$ and $n(1-p) \\geq 5$.',

      '**Building the model from scratch.** Flip a fair coin 3 times. Each flip is a **Bernoulli trial**: exactly two outcomes (success = heads, failure = tails), probability of success $p = 0.5$ on each flip, and the flips are independent. What is the probability of getting exactly 2 heads? List all $2^3 = 8$ outcomes: HHH, HHT, HTH, HTT, THH, THT, TTH, TTT. Outcomes with exactly 2 heads: HHT, HTH, THH — that is 3 outcomes out of 8, so $P(\\text{exactly 2 heads}) = 3/8 = 0.375$. But how did we get the 3? We chose 2 positions (for heads) out of 3 available positions — that is $\\binom{3}{2} = 3$. This is the combinatorics engine powering the binomial formula.',

      '**Before reading on, predict:** For 10 coin flips, what is $P(\\text{exactly 5 heads})$? Do you think it is more than 0.5, less than 0.5, or approximately 0.25? Write down your guess before computing.',

      '**The answer is about 0.246.** There are $\\binom{10}{5} = 252$ ways to arrange 5 heads and 5 tails in 10 flips. Each arrangement has probability $(0.5)^5 (0.5)^5 = (0.5)^{10} = 1/1024$. So $P(X=5) = 252/1024 \\approx 0.246$. Even the "most likely" outcome (balanced heads and tails) only occurs about 25% of the time — a powerful reminder that "most likely" does not mean "probable."',

      '**The BINS conditions.** A random variable $X$ follows a Binomial distribution if and only if all four conditions hold: **(B)inary** — each trial has exactly two outcomes (success/failure); **(I)ndependence** — trials do not affect each other; **(N)umber** — the number of trials $n$ is fixed in advance; **(S)ame probability** — the probability of success $p$ is identical for every trial. When all four hold, $X \\sim \\text{Binomial}(n, p)$ and we can apply all the formulas from this lesson. The binomial model breaks when trials are not independent (e.g., sampling without replacement from a small population — use hypergeometric instead) or when $p$ changes across trials.',

      '**The PMF formula.** The probability of exactly $k$ successes in $n$ trials is: $$P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}$$ This formula has three parts: (1) $\\binom{n}{k}$ counts how many orderings lead to $k$ successes and $n-k$ failures; (2) $p^k$ is the probability of $k$ specific successes; (3) $(1-p)^{n-k}$ is the probability of $n-k$ specific failures. Part (1) uses combinations (not permutations) because the order within "successes" does not matter — HHTHHT and HHTTHH both have 4 heads.',

      '**E[X] = np and Var(X) = np(1−p) — no formula derivation needed.** The expected number of successes in $n$ trials is simply $n$ times the probability of success on each trial: $E[X] = np$. For the coin flip example with $n=10, p=0.5$: $E[X] = 5$. The variance is $\\text{Var}(X) = np(1-p) = np q$ where $q = 1-p$. For $n=10, p=0.5$: $\\text{Var}(X) = 10(0.5)(0.5) = 2.5$, so $\\sigma = \\sqrt{2.5} \\approx 1.58$. These formulas emerge from linearity of expectation applied to $X = X_1 + X_2 + \\cdots + X_n$ where each $X_i$ is a Bernoulli($p$) indicator variable with $E[X_i] = p$ and $\\text{Var}(X_i) = p(1-p)$.',

      '**Normal approximation: when the bell curve takes over.** When $n$ is large and $p$ is not too extreme, the binomial distribution becomes approximately normal. The rule of thumb is: use the normal approximation when $np \\geq 5$ AND $n(1-p) \\geq 5$. Under these conditions, $X \\approx N(np, np(1-p))$, and we can use z-scores: $z = (X - np)/\\sqrt{np(1-p)}$. For the factory example with $n=10000, p=0.02$: $np = 200$, $np(1-p) = 196$, $\\sigma \\approx 14$. Finding $P(X > 250)$ is equivalent to $P(Z > (250-200)/14) = P(Z > 3.57)$, which is extremely small — an unusually high defect count.',

      '**CNC and quality control.** A CNC machining center produces brackets. Historical data shows that 3% of brackets fail the dimensional tolerance check. In a batch of 200 brackets: $X \\sim \\text{Binomial}(200, 0.03)$, $E[X] = 6$, $\\text{Var}(X) = 5.82$, $\\sigma \\approx 2.41$. The quality engineer sets a control limit: if more than $6 + 3(2.41) \\approx 13.2$, i.e., more than 13 defects occur in a batch, the process is investigated. This statistical process control is the basis of Six Sigma manufacturing.',

      '**Drug trials and A/B testing.** A new blood pressure medication is given to 300 patients. Historical cure rate without medication: 40%. We observe 135 cures. Is this significantly better than chance? Under H₀: $X \\sim \\text{Binomial}(300, 0.40)$, $E[X] = 120$, $\\sigma \\approx 8.49$. Observed 135 gives $z = (135-120)/8.49 \\approx 1.77$, suggesting borderline significance. This exact framework is used in drug approval trials by the FDA, vaccine efficacy studies, and A/B testing at tech companies — the binomial distribution is the engine under all of these.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'BINS Conditions for Binomial',
        body: 'A random variable $X \\sim \\text{Binomial}(n, p)$ requires all four:\n\n**(B)inary**: Each trial has exactly two outcomes: success or failure.\n**(I)ndependence**: Trials are mutually independent — knowing one outcome does not affect another.\n**(N)umber**: The number of trials $n$ is fixed before the experiment begins.\n**(S)ame probability**: The probability of success $p$ is constant across all trials.\n\nViolation of any single condition invalidates the binomial model.',
      },
      {
        type: 'procedure',
        title: 'Procedure: Using the Binomial PMF',
        body: 'Given $X \\sim \\text{Binomial}(n, p)$, compute $P(X = k)$:\n\n**Step 1.** Verify BINS conditions hold.\n**Step 2.** Compute $\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$.\n**Step 3.** Compute $p^k$ and $(1-p)^{n-k}$.\n**Step 4.** Multiply: $P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}$.\n**Step 5.** For $E[X]$: use $np$. For Var: use $np(1-p)$.\n**Step 6.** For $P(X \\leq k)$: use scipy.stats.binom.cdf(k, n, p) or sum the PMF.',
      },
      {
        type: 'insight',
        title: 'Why Combinations, Not Permutations?',
        body: 'When we count arrangements of $k$ successes in $n$ trials, the ORDER of the successes does not matter — HHTHHT has the same probability as THHHHT (if both have 4 H\'s and 2 T\'s). We want the number of SETS of $k$ positions (out of $n$) to place the successes. That is the definition of $\\binom{n}{k}$. If order mattered, we would use $P(n,k) = n!/(n-k)!$ — but it does not, so we divide by $k!$ to remove the ordering.',
      },
      {
        type: 'warning',
        title: 'Normal Approximation Requires Both Checks',
        body: 'The normal approximation is only valid when BOTH conditions hold:\n• $np \\geq 5$ (enough expected successes)\n• $n(1-p) \\geq 5$ (enough expected failures)\n\nFor $n=100, p=0.02$: $np = 2 < 5$ — approximation is poor. For $n=20, p=0.5$: $np = 10 \\geq 5$ and $n(1-p) = 10 \\geq 5$ — approximation is good. When the approximation is poor, use the exact binomial (scipy.stats.binom).',
      },
      {
        type: 'strategy',
        title: 'Recognizing When NOT to Use Binomial',
        body: '**Sampling without replacement from a small population** → Hypergeometric distribution (independence fails).\n**Varying p across trials** → No simple closed form; use simulation or Bayesian methods.\n**Unknown n** → Negative binomial (count trials until k successes).\n**Continuous outcomes** → Normal, exponential, or other continuous distributions.\n\nThe check: are ALL four BINS conditions satisfied?',
      },
      {
        type: 'insight',
        title: 'Bernoulli Is the n=1 Special Case',
        body: 'A Bernoulli($p$) random variable is simply Binomial(1, $p$). It takes value 1 with probability $p$ and 0 with probability $1-p$. Its expected value is $E[X] = 1\\cdot p + 0 \\cdot (1-p) = p$ and its variance is $p(1-p)$. Every binomial random variable is the sum of $n$ independent Bernoulli random variables: $X = X_1 + X_2 + \\cdots + X_n$. This decomposition is why $E[X] = np$ and $\\text{Var}(X) = np(1-p)$ follow immediately from linearity of expectation and variance additivity.',
      },
      {
        type: 'warning',
        title: 'Do Not Add Binomial PMF Values to Get P(X ≤ k) by Hand for Large n',
        body: 'Computing $P(X \\leq 10)$ for Binomial(100, 0.2) requires summing 11 terms, each involving $\\binom{100}{k}$ — extremely tedious by hand. Always use the CDF: in Python, `scipy.stats.binom.cdf(10, 100, 0.2)`. In MATLAB, `binocdf(10, 100, 0.2)`. The CDF is computed efficiently using the incomplete beta function, not by literal summation.',
      },
    ],
    visualizations: [
      {
        id: 'BinomialDistributionViz',
        title: 'Binomial PMF — Effect of n and p',
        mathBridge: 'Two sliders control $n$ (number of trials) and $p$ (success probability). Watch how the PMF bar chart shifts and spreads. When $p = 0.5$, the distribution is symmetric. As $p \\to 0$ or $p \\to 1$, it becomes skewed. As $n$ increases (with fixed $p$), the distribution spreads but its SHAPE approaches the bell curve — this is the Central Limit Theorem appearing in real time. Toggle "Show normal approximation" to overlay $N(np, np(1-p))$: the approximation is only valid when $np \\geq 5$ AND $n(1-p) \\geq 5$.',
        caption: 'Drag p toward 0 or 1 to see skewness. Increase n and toggle the normal overlay to watch the bell curve emerge.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'The **Binomial distribution** with parameters $n \\in \\mathbb{N}$ and $p \\in [0,1]$ is denoted $X \\sim \\text{Binomial}(n,p)$. Its probability mass function is:\n$$P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}, \\quad k = 0, 1, 2, \\ldots, n$$\nwhere $\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$ is the binomial coefficient. The PMF sums to 1 by the Binomial Theorem: $\\sum_{k=0}^n \\binom{n}{k} p^k (1-p)^{n-k} = (p + (1-p))^n = 1^n = 1$.',

      'The **expected value** and **variance** derive from the indicator variable decomposition. Write $X = \\sum_{i=1}^n X_i$ where $X_i \\sim \\text{Bernoulli}(p)$ are iid, with $E[X_i] = p$ and $\\text{Var}(X_i) = p(1-p)$. By linearity of expectation and independence:\n$$E[X] = \\sum_{i=1}^n E[X_i] = np$$\n$$\\text{Var}(X) = \\sum_{i=1}^n \\text{Var}(X_i) = np(1-p)$$\nStandard deviation: $\\sigma = \\sqrt{np(1-p)}$. The distribution is symmetric when $p = 0.5$ (mode = median = mean = $n/2$), right-skewed when $p < 0.5$, and left-skewed when $p > 0.5$.',

      'The **CDF** is $F(k) = P(X \\leq k) = \\sum_{j=0}^{k} \\binom{n}{j} p^j (1-p)^{n-j}$, which can be expressed as the regularized incomplete beta function: $F(k; n, p) = I_{1-p}(n-k, k+1)$. This connection to the beta distribution enables efficient numerical computation. For the complement: $P(X > k) = 1 - F(k)$. For intervals: $P(a \\leq X \\leq b) = F(b) - F(a-1)$.',

      '**Normal approximation.** By the Central Limit Theorem, if $X_1, \\ldots, X_n$ are iid Bernoulli($p$), their sum $X = \\sum X_i$ satisfies $(X - np)/\\sqrt{np(1-p)} \\xrightarrow{d} N(0,1)$ as $n \\to \\infty$. The **rule of thumb** for practical use: apply the approximation when $np \\geq 5$ AND $n(1-p) \\geq 5$. With the **continuity correction**, which accounts for the discrete-to-continuous approximation:\n$$P(X = k) \\approx P\\!\\left(k - \\tfrac{1}{2} \\leq Z_{\\text{normal}} \\leq k + \\tfrac{1}{2}\\right)$$\nThe continuity correction noticeably improves accuracy for small-to-medium $n$.',

      'The **mode** of Binomial($n,p$) is $\\lfloor (n+1)p \\rfloor$ when $(n+1)p$ is not an integer; if $(n+1)p$ is an integer, the distribution is bimodal at $(n+1)p$ and $(n+1)p - 1$. The **moment generating function** is $M_X(t) = E[e^{tX}] = (pe^t + 1-p)^n$, from which all moments can be derived by differentiation. The **skewness** is $(1-2p)/\\sqrt{np(1-p)}$ and approaches 0 as $n \\to \\infty$ for any fixed $p \\in (0,1)$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Binomial PMF and Key Moments',
        body: 'For $X \\sim \\text{Binomial}(n, p)$, $q = 1-p$:\n$$P(X = k) = \\binom{n}{k} p^k q^{n-k}, \\quad k = 0, 1, \\ldots, n$$\n$$E[X] = np, \\quad \\text{Var}(X) = npq, \\quad \\sigma = \\sqrt{npq}$$\n\nProof of E[X]: Linearity + Bernoulli decomposition $X = \\sum_{i=1}^n X_i$, $E[X_i] = p$.',
      },
      {
        type: 'theorem',
        title: 'Normal Approximation (with Continuity Correction)',
        body: 'When $np \\geq 5$ and $n(1-p) \\geq 5$:\n$$P(X \\leq k) \\approx \\Phi\\!\\left(\\frac{k + 0.5 - np}{\\sqrt{np(1-p)}}\\right)$$\nwhere $\\Phi$ is the standard normal CDF. The $+0.5$ is the continuity correction — it accounts for approximating a discrete distribution with a continuous one.',
      },
      {
        type: 'warning',
        title: 'Binomial vs. Hypergeometric',
        body: 'Sampling WITHOUT replacement from a finite population: use **Hypergeometric**, not Binomial. Example: drawing 5 cards from a 52-card deck without replacement — each draw changes the remaining composition, violating independence. Binomial applies when sampling WITH replacement, or from an "infinite" population (practically: population size ≥ 20× sample size).',
      },
      {
        type: 'insight',
        title: 'The Binomial Theorem Connection',
        body: 'The name "binomial" comes from the Binomial Theorem: $(a+b)^n = \\sum_{k=0}^n \\binom{n}{k} a^k b^{n-k}$. Setting $a=p$ and $b=1-p$ gives the sum of all PMF values = 1. The coefficients $\\binom{n}{k}$ appear in Pascal\'s triangle. This algebraic identity is why the PMF sums to 1 — it is a mathematical identity, not a coincidence.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Binomial Distribution in Python/SciPy',
        mathBridge: 'scipy.stats.binom provides the complete toolkit: .pmf(k,n,p) for the PMF, .cdf(k,n,p) for the CDF, .rvs(n,p,size) for simulation, and .mean()/.var() for the theoretical moments. We also compute probabilities from first principles using combinations to verify the formula.',
        caption: 'Run each cell. Cell 3 demonstrates the normal approximation with continuity correction.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Binomial PMF: computing and plotting',
              prose: [
                '`from scipy.stats import binom` imports the binomial distribution object. `binom.pmf(k, n, p)` computes $P(X=k)$ for Binomial($n$, $p$) — it uses the combination formula internally, so there\'s no risk of overflow for large $n$.',
                '`np.arange(0, n+1)` creates the array $[0, 1, 2, \\ldots, n]$ — all possible values of a Binomial($n$,$p$) variable. Passing this array to `binom.pmf()` vectorizes the computation, returning the full PMF in one line.',
                '`binom.mean(n, p)` returns $E[X] = np$ and `binom.var(n, p)` returns $\\text{Var}(X) = np(1-p)$. These are exact theoretical values — compare them to the sample mean and variance from simulation to verify convergence.',
                'The bar chart shows the PMF shape. Note the slight right-skew for $p=0.3$ — the distribution leans toward lower values because failures are more likely than successes per trial.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import binom

n, p = 20, 0.3
k_vals = np.arange(0, n+1)
pmf_vals = binom.pmf(k_vals, n, p)

print(f"Binomial({n}, {p})")
print(f"E[X] = np = {binom.mean(n, p):.4f}  (= {n}×{p})")
print(f"Var(X) = np(1-p) = {binom.var(n, p):.4f}  (= {n}×{p}×{1-p})")
print(f"SD(X) = {binom.std(n, p):.4f}")
print()
print("PMF (selected values):")
for k in [0, 3, 6, 9, 12, 15, 20]:
    print(f"  P(X={k:2d}) = {binom.pmf(k, n, p):.5f}")

fig, ax = plt.subplots(figsize=(9, 4))
ax.bar(k_vals, pmf_vals, color='steelblue', edgecolor='navy', alpha=0.85, width=0.7)
mu = binom.mean(n, p)
ax.axvline(mu, color='red', linestyle='--', linewidth=2, label=f'E[X] = {mu}')
ax.set_xlabel('Number of Successes k', fontsize=12)
ax.set_ylabel('P(X = k)', fontsize=12)
ax.set_title(f'Binomial({n}, {p}) PMF', fontsize=14)
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'CDF and probability queries',
              prose: [
                '`binom.cdf(k, n, p)` computes $P(X \\leq k) = F(k)$ using the regularized incomplete beta function — numerically stable even for large $n$. This is far more reliable than manually summing PMF values.',
                'Key probability relationships: `binom.cdf(k, n, p)` gives $P(X \\leq k)$. For $P(X < k)$: use `binom.cdf(k-1, n, p)`. For $P(X \\geq k)$: use `1 - binom.cdf(k-1, n, p)`. For $P(a \\leq X \\leq b)$: use `binom.cdf(b, n, p) - binom.cdf(a-1, n, p)`.',
                'The quality control example: $n=200$ parts, $p=0.03$ defect rate. E[X]=6 defects expected. P(X>13) — the probability of an unusually high defect count — triggers investigation if exceeded.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import binom

# Quality control scenario: 200 parts, 3% defect rate
n, p = 200, 0.03
print(f"Quality Control: Binomial({n}, {p})")
print(f"E[X] = {binom.mean(n,p):.2f},  SD = {binom.std(n,p):.4f}")
print()

# Probability queries
k_queries = [3, 6, 10, 13, 15]
print("CDF probability queries:")
for k in k_queries:
    p_le = binom.cdf(k, n, p)
    p_ge = 1 - binom.cdf(k-1, n, p)
    print(f"  P(X ≤ {k:2d}) = {p_le:.4f}   P(X ≥ {k:2d}) = {p_ge:.4f}")

# Control limit: 3 sigma above mean
control_limit = int(binom.mean(n,p) + 3*binom.std(n,p))
p_exceed = 1 - binom.cdf(control_limit, n, p)
print(f"\\n3-sigma control limit: {control_limit} defects")
print(f"P(exceed control limit) = {p_exceed:.5f}")

# Plot CDF
k_vals = np.arange(0, 25)
fig, ax = plt.subplots(figsize=(9, 4))
ax.step(k_vals, binom.cdf(k_vals, n, p), where='post', color='darkorange', linewidth=2.5)
ax.axvline(control_limit, color='red', linestyle='--', linewidth=2, 
           label=f'Control limit = {control_limit}')
ax.set_xlabel('Number of Defects k', fontsize=12)
ax.set_ylabel('P(X ≤ k)', fontsize=12)
ax.set_title(f'Binomial({n},{p}) CDF — Quality Control', fontsize=13)
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Normal approximation and continuity correction',
              prose: [
                '`norm.cdf((k + 0.5 - mu) / sigma)` computes the normal approximation WITH continuity correction for $P(X \\leq k)$. The $+0.5$ shifts the discrete boundary into the center of the continuous interval $[k, k+1)$, significantly improving accuracy.',
                'The comparison table shows that the continuity-corrected approximation is much closer to the exact binomial CDF than the uncorrected version — especially for small $k$. This improvement comes "for free" with just one extra step.',
                'The overlay plot shows the binomial PMF bars alongside the normal PDF curve. When $np \\geq 5$ and $n(1-p) \\geq 5$, the curve fits the bars closely. Change $p$ to 0.05 with $n=20$ (np=1 < 5) to see the approximation break down.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import binom, norm

n, p = 30, 0.4
mu    = n * p
sigma = np.sqrt(n * p * (1-p))
print(f"Binomial({n},{p}): np={mu}, n(1-p)={n*(1-p)}")
print(f"Both ≥ 5: {mu >= 5 and n*(1-p) >= 5}  → normal approx valid")
print()

k_vals = np.arange(0, n+1)
print(f"{'k':>3}  {'Exact':>10}  {'Normal (no CC)':>15}  {'Normal (CC)':>12}")
print("-" * 45)
for k in range(7, 17):
    exact   = binom.cdf(k, n, p)
    approx  = norm.cdf((k - mu) / sigma)
    approx_cc = norm.cdf((k + 0.5 - mu) / sigma)
    print(f"{k:>3}  {exact:>10.5f}  {approx:>15.5f}  {approx_cc:>12.5f}")

# Overlay plot: binomial PMF + normal PDF
x_cont = np.linspace(0, n, 400)
pmf_vals = binom.pmf(k_vals, n, p)
fig, ax = plt.subplots(figsize=(10, 4))
ax.bar(k_vals, pmf_vals, color='steelblue', alpha=0.7, width=0.85, label='Binomial PMF')
ax.plot(x_cont, norm.pdf(x_cont, mu, sigma), 'r-', linewidth=2.5, 
        label=f'N({mu}, {sigma:.2f}²) PDF')
ax.set_title(f'Binomial({n},{p}) vs Normal Approximation', fontsize=13)
ax.set_xlabel('k'); ax.set_ylabel('Probability / Density')
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'A/B test analysis with the binomial',
              difficulty: 'medium',
              prompt: 'A website\'s baseline click-through rate is 5% (p=0.05). In an A/B test, the new design is shown to n=500 users. You observe 35 clicks. (1) Under H₀: X~Binom(500, 0.05), compute E[X] and SD[X]. (2) Find P(X ≥ 35) — the probability of seeing 35 or more clicks by chance. (3) Is the normal approximation valid? Apply it with continuity correction. (4) Plot the PMF for k=10 to 50.',
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import binom, norm

n, p = 500, 0.05
observed = 35

# 1. E[X] and SD[X]

# 2. P(X >= 35) using exact binomial CDF

# 3. Check normal approximation validity, compute with continuity correction

# 4. Plot PMF from k=10 to 50
`,
              hint: 'P(X>=35) = 1 - binom.cdf(34, n, p). Normal approx: (35 - 0.5 - mu)/sigma for the continuity-corrected z-score for P(X>=35).',
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Code: Binomial Distribution in OpenMAT / MATLAB',
        mathBridge: 'MATLAB\'s Statistics and Machine Learning Toolbox provides binopdf(k,n,p) for the PMF, binocdf(k,n,p) for the CDF, and binornd(n,p,m,1) for random samples. The normcdf function handles the normal approximation.',
        caption: 'OpenMAT mirrors real MATLAB syntax. Use semicolons to suppress intermediate output.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Binomial PMF and key statistics',
              prose: [
                '`binopdf(k, n, p)` computes $P(X=k)$ for a Binomial($n$,$p$) distribution. In MATLAB, `k` can be a scalar or a vector — when passed a vector, it returns a vector of PMF values for each element.',
                '`binocdf(k, n, p)` computes the CDF $P(X \\leq k)$. The theoretical mean $np$ and variance $np(1-p)$ are computed explicitly as scalars here rather than calling a distribution object.',
                'The `bar` function plots the PMF. Setting the bar width to 0.6 and using `FaceColor` with an RGB triplet matches the blue aesthetic. The vertical red line at `mu` marks the expected value.',
              ],
              code: `pkg load statistics
% Binomial PMF and statistics
n = 20; p = 0.3;
k_vals = 0:n;
pmf_vals = binopdf(k_vals, n, p);

% Theoretical moments
mu    = n * p;
sigma2 = n * p * (1-p);
sigma  = sqrt(sigma2);
fprintf('Binomial(%d, %.2f)\\n', n, p)
fprintf('E[X]   = np       = %.4f\\n', mu)
fprintf('Var(X) = np(1-p)  = %.4f\\n', sigma2)
fprintf('SD(X)  = sqrt(var)= %.4f\\n', sigma)

% Print selected PMF values
fprintf('\\nSelected PMF values:\\n')
for k = [0 3 6 9 12 15 20]
    fprintf('  P(X=%2d) = %.5f\\n', k, binopdf(k, n, p))
end

% Bar chart
bar(k_vals, pmf_vals, 0.7, 'FaceColor', [0.27 0.51 0.71], 'EdgeColor', 'navy');
hold on;
xline(mu, 'r--', 'LineWidth', 2);
xlabel('Number of Successes k'); ylabel('P(X = k)');
title(sprintf('Binomial(%d, %.1f) PMF', n, p));
legend('PMF', sprintf('E[X] = %.1f', mu));
grid on; hold off;`,
            },
            {
              id: 2,
              cellTitle: 'CDF and quality control',
              prose: [
                '`binocdf(k, n, p)` gives $P(X \\leq k)$. For $P(X \\geq k) = 1 - P(X \\leq k-1)$, use `1 - binocdf(k-1, n, p)`. The key: for "at least k" (includes k), subtract the CDF at k−1.',
                'The control limit is computed as `floor(mu + 3*sigma)`. The `floor` function rounds down to the nearest integer — necessary because defect counts must be integers. `P(X > control_limit) = 1 - binocdf(control_limit, n, p)` gives the false-alarm probability.',
                'The `stairs` plot is the natural MATLAB function for plotting a discrete CDF, as it creates horizontal-then-vertical steps rather than the diagonal lines of `plot`.',
              ],
              code: `% Quality control: Binomial CDF
n = 200; p = 0.03;
mu    = n * p;
sigma = sqrt(n * p * (1-p));
fprintf('Quality Control: Binomial(%d, %.2f)\\n', n, p)
fprintf('E[X] = %.2f,  SD = %.4f\\n', mu, sigma)

% CDF queries
fprintf('\\nCDF and tail probabilities:\\n')
for k = [3 6 10 13 15]
    p_le = binocdf(k, n, p);
    p_ge = 1 - binocdf(k-1, n, p);
    fprintf('  P(X<=%2d)=%.4f   P(X>=%2d)=%.4f\\n', k, p_le, k, p_ge)
end

% 3-sigma control limit
cl = floor(mu + 3*sigma);
p_exceed = 1 - binocdf(cl, n, p);
fprintf('\\n3-sigma control limit: %d defects\\n', cl)
fprintf('P(exceed control limit) = %.5f\\n', p_exceed)

% CDF plot
k_plot = 0:25;
cdf_plot = binocdf(k_plot, n, p);
stairs(k_plot, cdf_plot, 'Color', [0.85 0.33 0.10], 'LineWidth', 2.5);
hold on;
xline(cl, 'r--', 'LineWidth', 2);
xlabel('Number of Defects k'); ylabel('P(X \\leq k)');
title(sprintf('Binomial(%d,%.2f) CDF — Quality Control', n, p));
legend('CDF', sprintf('Control limit = %d', cl));
grid on; hold off;`,
            },
            {
              id: 3,
              cellTitle: 'Normal approximation and simulation',
              prose: [
                '`normcdf((k + 0.5 - mu)/sigma)` applies the continuity correction to the normal approximation of $P(X \\leq k)$. The $+0.5$ is the standard continuity correction for approximating a discrete distribution with a continuous one.',
                '`binornd(n, p, N, 1)` generates $N$ random samples from Binomial($n$,$p$). The `N, 1` specifies a column vector of $N$ samples. Using `rng(42)` sets the random seed for reproducibility.',
                'The `histogram` call with `Normalization`, `probability` scales the y-axis to show proportions matching the PMF. Overlaying `normpdf` (scaled by 1) shows the approximating normal curve.',
              ],
              code: `% Normal approximation comparison
n = 30; p = 0.4;
mu    = n * p;
sigma = sqrt(n * p * (1-p));
fprintf('np=%.1f, n(1-p)=%.1f — approx valid: %d\\n', ...
    n*p, n*(1-p), n*p>=5 && n*(1-p)>=5)

fprintf('\\n%3s  %10s  %15s  %12s\\n', 'k', 'Exact', 'Normal(no CC)', 'Normal(CC)')
fprintf('%s\\n', repmat('-',1,45))
for k = 7:16
    exact    = binocdf(k, n, p);
    approx   = normcdf((k - mu)/sigma);
    approx_cc = normcdf((k + 0.5 - mu)/sigma);
    fprintf('%3d  %10.5f  %15.5f  %12.5f\\n', k, exact, approx, approx_cc)
end

% Simulation
rng(42);
N = 50000;
samples = binornd(n, p, N, 1);
fprintf('\\nSimulation (N=%d): mean=%.4f (theory=%.1f), var=%.4f (theory=%.4f)\\n', ...
    N, mean(samples), mu, var(samples), n*p*(1-p))

% Overlay plot
k_vals = 0:n;
figure;
bar(k_vals, binopdf(k_vals, n, p), 0.85, 'FaceColor', [0.27 0.51 0.71], 'FaceAlpha', 0.7);
hold on;
x_cont = linspace(0, n, 400);
plot(x_cont, normpdf(x_cont, mu, sigma), 'r-', 'LineWidth', 2.5);
title(sprintf('Binomial(%d,%.1f) vs Normal Approx', n, p));
xlabel('k'); ylabel('Probability / Density');
legend('Binomial PMF', sprintf('N(%.1f, %.2f)', mu, sigma));
grid on; hold off;`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Drug trial binomial analysis',
              difficulty: 'hard',
              prompt: 'A drug trial enrolls n=300 patients. The baseline recovery rate is p=0.40. The trial observes 135 recoveries. (1) Compute E[X] and SD[X] under H₀. (2) Find P(X ≥ 135) exactly. (3) Apply normal approximation with continuity correction. (4) How many recoveries would be needed to achieve P(X ≥ k) < 0.05? Use binocdf to find this threshold k.',
              code: `% Drug trial analysis
n = 300; p = 0.40;
observed = 135;

% 1. E[X] and SD[X]

% 2. P(X >= 135) exact

% 3. Normal approximation with continuity correction

% 4. Find threshold k where P(X >= k) < 0.05
% Hint: search k from mu upward
`,
              hint: 'P(X>=135) = 1 - binocdf(134, n, p). Continuity correction: z = (135 - 0.5 - mu)/sigma. For threshold: loop k = round(mu):n and find first k where 1-binocdf(k-1,n,p) < 0.05.',
            },
          ],
        },
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Formal derivation of the PMF.** Consider $n$ independent Bernoulli($p$) trials $X_1, \\ldots, X_n$. The event $\\{X = k\\}$ is the union over all $\\binom{n}{k}$ sequences containing exactly $k$ ones. Each such sequence has probability $p^k(1-p)^{n-k}$ (by independence). Since the sequences are mutually exclusive, $P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}$. The PMF sums to 1 by the Binomial Theorem: $\\sum_{k=0}^n \\binom{n}{k} p^k (1-p)^{n-k} = [p + (1-p)]^n = 1$.',

      '**Moment generating function and moments.** The MGF of a Bernoulli($p$) is $M_{X_i}(t) = pe^t + (1-p)$. Since $X = \\sum_{i=1}^n X_i$ with $X_i$ independent, $M_X(t) = \\prod_{i=1}^n M_{X_i}(t) = (pe^t + 1-p)^n$. Differentiating: $M_X\'(0) = E[X] = np$. $M_X\'\'(0) = E[X^2] = np(1-p) + n^2p^2$, giving $\\text{Var}(X) = E[X^2] - (E[X])^2 = np(1-p)$. The skewness is $(1-2p)/\\sqrt{npq}$, confirming symmetry when $p=1/2$.',

      '**Geometric interpretation.** The binomial distribution interpolates between the degenerate distributions at 0 (when $p=0$) and $n$ (when $p=1$). As $p$ increases from 0 to 1, the "center of mass" $E[X]=np$ slides from 0 to $n$, tracing a straight line. Variance $\\text{Var}(X) = np(1-p)$ is a downward-opening parabola in $p$, maximized at $p = 1/2$ (maximum uncertainty) with peak value $n/4$. This parabolic shape explains why variance is largest for balanced distributions and smallest when outcomes are near-certain.',

      '**Counter-example: when the Binomial fails.** Drawing cards WITHOUT replacement: draw $n=5$ cards from a 52-card deck. Let $X$ = number of aces. Independence fails: the probability of an ace on the 2nd draw depends on whether the 1st was an ace. The correct model is the **Hypergeometric** distribution. Applying Binomial($5, 4/52$) gives only an approximation (good when $n \\ll N_{\\text{population}}$, poor otherwise). Another failure mode: Pólya urn model, where each draw changes the composition — $p$ varies across trials.',

      '**Connections to future topics.** The binomial is the foundation for: (1) **Logistic regression** — the log-odds of a binomial probability is modeled as a linear function of predictors; (2) **Wilson score confidence interval** — the exact CI for a proportion uses the binomial distribution; (3) **Chi-square tests** — the test statistic $\\sum (O-E)^2/E$ compares observed binomial counts to expected values; (4) **Negative binomial distribution** — the number of trials until the $r$-th success, a natural extension; (5) **Bayesian inference** — the Beta distribution is the conjugate prior for the binomial parameter $p$, making posterior updates analytically tractable.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Additive Property of Binomials',
        body: 'If $X \\sim \\text{Binomial}(m, p)$ and $Y \\sim \\text{Binomial}(n, p)$ are independent, then:\n$$X + Y \\sim \\text{Binomial}(m+n, p)$$\nProof: $X+Y$ is the sum of $m+n$ independent Bernoulli($p$) variables. Note: this only works when $p$ is the SAME for both. If $p_X \\neq p_Y$, the sum is not binomial.',
      },
      {
        type: 'insight',
        title: 'Beta-Binomial Conjugacy',
        body: 'If the prior for $p$ is Beta$(\\ alpha, \\beta)$ and we observe $k$ successes in $n$ trials, the posterior is Beta$(\\alpha + k, \\beta + n - k)$. This conjugacy makes Bayesian updating for binomial data completely analytical — no numerical integration needed. The posterior mean $(\\alpha+k)/(\\alpha+\\beta+n)$ is a weighted average of the prior mean $\\alpha/(\\alpha+\\beta)$ and the sample proportion $k/n$.',
      },
      {
        type: 'warning',
        title: 'De Moivre-Laplace Theorem is Not the CLT',
        body: 'The De Moivre-Laplace theorem (binomial → normal) is a SPECIAL CASE of the Central Limit Theorem (sum of iid variables → normal). The CLT is more general: it applies to any iid sequence with finite variance. The normal approximation rule of thumb ($np \\geq 5$, $n(1-p) \\geq 5$) is specific to the binomial, not the CLT in general (which has its own convergence rate conditions).',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'stat5-002-ex1',
      title: 'Microchip Quality Control',
      problem: 'A factory produces chips with 2% defect rate. A sample of 15 chips is inspected. Let $X$ = number defective. (a) Verify BINS. (b) Find $P(X=0)$. (c) Find $P(X \\leq 1)$. (d) Find $E[X]$ and $\\sigma$.',
      steps: [
        {
          expression: '\\text{BINS: (B) defective/not-defective; (I) chips independent; (N) n=15 fixed; (S) p=0.02 constant}',
          annotation: 'All four conditions hold. The chips are produced independently, n=15 is fixed before inspection, and the defect probability is stable at p=0.02. Therefore X ~ Binomial(15, 0.02).',
          strategyTitle: 'Verify all BINS conditions',
          hints: ['Check each letter: Binary, Independence, Number fixed, Same probability.'],
        },
        {
          expression: 'P(X=0) = \\binom{15}{0}(0.02)^0(0.98)^{15} = 1 \\cdot 1 \\cdot (0.98)^{15} \\approx 0.7386',
          annotation: '$\\binom{15}{0} = 1$ (one way to choose 0 defective chips). $(0.02)^0 = 1$. $(0.98)^{15} \\approx 0.7386$. About 73.9% of batches of 15 have zero defects.',
          strategyTitle: 'Apply PMF with k=0',
          hints: ['(0.98)^15: use logarithms or a calculator. ln(0.98) ≈ -0.0202, so 15×(-0.0202) ≈ -0.303, e^{-0.303} ≈ 0.738.'],
        },
        {
          expression: 'P(X \\leq 1) = P(X=0) + P(X=1) = 0.7386 + \\binom{15}{1}(0.02)^1(0.98)^{14}',
          annotation: 'Sum the PMF at k=0 and k=1. $P(X=1) = 15 \\times 0.02 \\times (0.98)^{14} = 15 \\times 0.02 \\times 0.7537 \\approx 0.2261$.',
          strategyTitle: 'Sum PMF for CDF',
          hints: ['(0.98)^14 = (0.98)^15 / 0.98 ≈ 0.7386 / 0.98 ≈ 0.7537.'],
        },
        {
          expression: 'P(X \\leq 1) \\approx 0.7386 + 0.2261 = 0.9647',
          annotation: 'About 96.5% of batches have at most 1 defect. This is good quality — the process is well-controlled.',
          strategyTitle: 'Sum the two terms',
          hints: [],
        },
        {
          expression: 'E[X] = np = 15(0.02) = 0.30,\\quad \\sigma = \\sqrt{np(1-p)} = \\sqrt{15(0.02)(0.98)} = \\sqrt{0.294} \\approx 0.542',
          annotation: 'Expected number of defects in a 15-chip sample is 0.3 — less than one chip on average. Standard deviation 0.54 confirms tight clustering near zero.',
          strategyTitle: 'Apply the moment formulas directly',
          hints: [],
        },
      ],
      conclusion: 'With a 2% defect rate and n=15 chips, you expect only 0.3 defects per sample, and 96.5% of samples have at most 1 defect. The binomial PMF formula and the np/npq moment formulas handle all the calculations.',
    },
    {
      id: 'stat5-002-ex2',
      title: 'Computing P(X=k) by Hand',
      problem: 'Let $X \\sim \\text{Binomial}(8, 0.3)$. Find $P(X=3)$ and $P(3 \\leq X \\leq 5)$.',
      steps: [
        {
          expression: 'P(X=3) = \\binom{8}{3}(0.3)^3(0.7)^5',
          annotation: 'Set up the PMF formula with n=8, k=3, p=0.3.',
          strategyTitle: 'Set up PMF formula',
          hints: [],
        },
        {
          expression: '\\binom{8}{3} = \\frac{8!}{3! \\cdot 5!} = \\frac{8 \\times 7 \\times 6}{3 \\times 2 \\times 1} = 56',
          annotation: 'Compute the combination: cancel common factors. $8 \\times 7 \\times 6 = 336$, $3! = 6$, $336/6 = 56$.',
          strategyTitle: 'Compute the combination',
          hints: ['C(n,k) = C(n, n-k), so C(8,3) = C(8,5). Use whichever is easier to compute.'],
        },
        {
          expression: 'P(X=3) = 56 \\times (0.027) \\times (0.16807) \\approx 56 \\times 0.004538 \\approx 0.2541',
          annotation: '$(0.3)^3 = 0.027$, $(0.7)^5 = 0.16807$. Product: 56 × 0.004538 ≈ 0.2541. So about 25.4% of the time we get exactly 3 successes.',
          strategyTitle: 'Multiply the three pieces',
          hints: ['(0.7)^5: 0.7^2=0.49, 0.49^2=0.2401, 0.2401×0.7=0.16807.'],
        },
        {
          expression: 'P(3 \\leq X \\leq 5) = P(X=3) + P(X=4) + P(X=5)',
          annotation: 'Sum three PMF values. P(X=4) = C(8,4)(0.3)^4(0.7)^4 = 70×0.0081×0.2401 ≈ 0.1361. P(X=5) = C(8,5)(0.3)^5(0.7)^3 = 56×0.00243×0.343 ≈ 0.0467.',
          strategyTitle: 'Sum three PMF values',
          hints: ['C(8,4)=70, C(8,5)=56. Compute each term separately then add.'],
        },
        {
          expression: 'P(3 \\leq X \\leq 5) \\approx 0.2541 + 0.1361 + 0.0467 = 0.4369',
          annotation: 'About 43.7% of the time X falls between 3 and 5 (inclusive). This covers a wide range around the mean E[X] = 8(0.3) = 2.4.',
          strategyTitle: 'Final summation',
          hints: [],
        },
      ],
      conclusion: 'P(X=3) ≈ 0.254 and P(3 ≤ X ≤ 5) ≈ 0.437. The combination formula is the most error-prone step — double-check using Pascal\'s triangle for small n.',
    },
    {
      id: 'stat5-002-ex3',
      title: 'Normal Approximation to the Binomial',
      problem: 'Voters in a town support a ballot measure with probability 0.45. A poll surveys 400 voters. Approximate $P(X \\geq 190)$ using the normal approximation with continuity correction.',
      steps: [
        {
          expression: 'E[X] = np = 400(0.45) = 180,\\quad \\sigma = \\sqrt{np(1-p)} = \\sqrt{400(0.45)(0.55)} = \\sqrt{99} \\approx 9.95',
          annotation: 'Compute the mean and standard deviation. np=180 ≥ 5 and n(1-p)=220 ≥ 5 — both conditions met, normal approximation is valid.',
          strategyTitle: 'Check conditions, compute μ and σ',
          hints: ['Verify np ≥ 5 and n(1-p) ≥ 5 BEFORE applying the approximation.'],
        },
        {
          expression: 'P(X \\geq 190) \\approx P\\!\\left(Z \\geq \\frac{190 - 0.5 - 180}{9.95}\\right) = P\\!\\left(Z \\geq \\frac{9.5}{9.95}\\right) = P(Z \\geq 0.955)',
          annotation: 'Apply the continuity correction: for P(X ≥ 190), shift the boundary to 189.5 (use 190 − 0.5 = 189.5). Then standardize: z = (189.5 − 180)/9.95 = 9.5/9.95 ≈ 0.955.',
          strategyTitle: 'Apply continuity correction and standardize',
          hints: ['Continuity correction for P(X ≥ k): use k − 0.5 (shift left to include k). For P(X > k): use k + 0.5.'],
        },
        {
          expression: 'P(Z \\geq 0.955) = 1 - \\Phi(0.955) \\approx 1 - 0.8302 = 0.1698',
          annotation: 'From the standard normal table: Φ(0.955) ≈ 0.8302. So P(X ≥ 190) ≈ 17.0%. The exact binomial gives 0.1688 — the approximation is very accurate (error < 0.1%).',
          strategyTitle: 'Look up standard normal CDF',
          hints: ['Φ(0.95) ≈ 0.8289, Φ(0.96) ≈ 0.8315. Interpolating: Φ(0.955) ≈ 0.8302.'],
        },
      ],
      conclusion: 'The normal approximation (17.0%) is within 0.1% of the exact binomial (16.9%). The continuity correction is the key to this accuracy — without it, the error would be several percent.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'stat5-002-ch1',
      difficulty: 'easy',
      problem: 'Let $X \\sim \\text{Binomial}(10, 0.5)$. Find $P(X = 5)$ using the PMF formula. Then find $E[X]$ and $\\text{Var}(X)$.',
      hint: 'C(10,5) = 252. (0.5)^10 = 1/1024.',
      walkthrough: [
        { expression: 'P(X=5) = \\binom{10}{5}(0.5)^5(0.5)^5 = 252 \\cdot \\frac{1}{1024} = \\frac{252}{1024} \\approx 0.2461', annotation: 'C(10,5)=252 by Pascal\'s triangle or formula. (0.5)^10 = 1/1024 ≈ 0.000977. 252 × 0.000977 ≈ 0.2461.' },
        { expression: 'E[X] = np = 10(0.5) = 5', annotation: 'Expected value formula: just n times p.' },
        { expression: '\\text{Var}(X) = np(1-p) = 10(0.5)(0.5) = 2.5,\\quad \\sigma = \\sqrt{2.5} \\approx 1.58', annotation: 'Variance: np(1-p) = 2.5. Standard deviation ≈ 1.58.' },
      ],
      answer: 'P(X=5) = 252/1024 ≈ 0.246. E[X]=5, Var(X)=2.5.',
    },
    {
      id: 'stat5-002-ch2',
      difficulty: 'medium',
      problem: 'An A/B test shows a new feature to $n=1000$ users. The baseline conversion rate is $p_0 = 0.08$. You observe 95 conversions. Find $P(X \\geq 95)$ using the normal approximation. Is this result unusual under the baseline rate?',
      hint: 'E[X]=80, Var(X)=73.6, SD≈8.58. Apply normal approx with continuity correction: z = (95 - 0.5 - 80)/8.58.',
      walkthrough: [
        { expression: 'E[X]=1000(0.08)=80,\\quad \\sigma=\\sqrt{1000(0.08)(0.92)}=\\sqrt{73.6}\\approx 8.58', annotation: 'Verify conditions: np=80≥5, n(1-p)=920≥5 ✓. Normal approximation valid.' },
        { expression: 'z = \\frac{95 - 0.5 - 80}{8.58} = \\frac{14.5}{8.58} \\approx 1.690', annotation: 'Continuity correction: P(X≥95) → P(Z≥z) where z uses 94.5 in numerator.' },
        { expression: 'P(Z \\geq 1.690) = 1 - \\Phi(1.690) \\approx 1 - 0.9545 = 0.0455', annotation: 'P≈4.6% — less than 5% significance level. This is borderline significant evidence of an improvement.' },
      ],
      answer: 'P(X≥95)≈0.046. At a 5% significance level, 95 conversions is just barely unusual under the baseline rate p=0.08.',
    },
    {
      id: 'stat5-002-ch3',
      difficulty: 'hard',
      problem: 'A CNC machine produces bolts in batches of $n = 500$. The defect rate is $p = 0.04$. (a) Find $P(X \\leq 15)$ exactly. (b) Compute the same probability using the normal approximation with continuity correction. (c) Find the 95th percentile: the value $k^*$ such that $P(X \\leq k^*) \\geq 0.95$.',
      hint: 'Use scipy.stats.binom.cdf for (a). For (c): binom.ppf(0.95, n, p) gives the quantile directly.',
      walkthrough: [
        { expression: 'E[X]=20,\\quad \\sigma=\\sqrt{500(0.04)(0.96)}=\\sqrt{19.2}\\approx 4.382', annotation: 'np=20, np(1-p)=19.2. Both conditions met for normal approx.' },
        { expression: 'P(X \\leq 15) = \\text{binom.cdf}(15, 500, 0.04) \\approx 0.1299', annotation: 'Exact binomial CDF. Using scipy: binom.cdf(15, 500, 0.04) ≈ 0.1299.' },
        { expression: 'z = \\frac{15 + 0.5 - 20}{4.382} = \\frac{-4.5}{4.382} \\approx -1.027,\\quad P(Z \\leq -1.027) \\approx 0.1522', annotation: 'Normal approx with CC gives 0.152 vs exact 0.130 — a reasonable approximation.' },
        { expression: 'k^* = \\text{binom.ppf}(0.95, 500, 0.04) = 27', annotation: 'The 95th percentile: 95% of batches have ≤ 27 defects. This is the upper control limit for a p-chart.' },
      ],
      answer: 'P(X≤15)≈0.130 (exact), ≈0.152 (normal approx). 95th percentile: k*=27.',
    },
  ],

  definitions: [
    {
      term: "Bernoulli trial",
      definition: "A single random experiment with exactly two outcomes: success (probability p) or failure (probability 1−p). The building block of the binomial distribution.",
    },
    {
      term: "binomial distribution",
      definition: "The distribution of the number of successes X in n independent Bernoulli trials each with success probability p. Notation: X ~ Binomial(n, p). E[X] = np, Var(X) = np(1−p).",
    },
    {
      term: "BINS conditions",
      definition: "Four conditions required for a Binomial model: (B)inary outcomes, (I)ndependence of trials, (N)umber of trials fixed in advance, (S)ame success probability on every trial. All four must hold.",
    },
    {
      term: "combinations C(n,k)",
      definition: "The number of ways to choose k items from n without regard to order: C(n,k) = n! / (k!(n−k)!). Used in the binomial PMF to count how many arrangements lead to k successes.",
    },
    {
      term: "normal approximation to binomial",
      definition: "When np ≥ 5 and n(1−p) ≥ 5, Binomial(n,p) ≈ N(np, np(1−p)). Allows using z-scores and the standard normal table for binomial probability calculations when n is large.",
    },
    {
      term: "Bernoulli random variable",
      definition: "A special case of the binomial with n=1: takes value 1 (success) with probability p and 0 (failure) with probability 1−p. E[X]=p, Var(X)=p(1−p).",
    },
  ],

  // ── Semantic Layer ─────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'X \\sim \\text{Binomial}(n, p)', meaning: 'X counts successes in n independent Bernoulli(p) trials' },
      { symbol: '\\binom{n}{k} = \\frac{n!}{k!(n-k)!}', meaning: 'Binomial coefficient — number of ways to choose k positions for successes out of n total positions' },
      { symbol: 'P(X=k) = \\binom{n}{k}p^k(1-p)^{n-k}', meaning: 'Binomial PMF — probability of exactly k successes' },
      { symbol: 'E[X] = np', meaning: 'Expected number of successes — total trials times probability of success per trial' },
      { symbol: '\\text{Var}(X) = np(1-p)', meaning: 'Variance of binomial — maximized when p=0.5 (maximum uncertainty), zero when p=0 or p=1 (no uncertainty)' },
      { symbol: 'np \\geq 5 \\text{ and } n(1-p) \\geq 5', meaning: 'Both conditions must hold for the normal approximation to be appropriate' },
    ],
    rulesOfThumb: [
      'Check BINS before using the Binomial: Binary, Independence, Number fixed, Same probability. ONE violation invalidates the model.',
      'Use np for E[X] and √(np(1-p)) for SD — never compute these by summing the full PMF.',
      'For P(X ≤ k) with large n: use binom.cdf(), not manual summation. The formula involves factorials that overflow quickly.',
      'Normal approximation: BOTH np ≥ 5 AND n(1-p) ≥ 5 must hold. Failing either condition makes the binomial skewed in ways the normal cannot capture.',
      'Always include the continuity correction (+0.5 or −0.5) when using the normal approximation for a discrete binomial.',
      'The binomial coefficient C(n,k) = C(n, n−k) — always compute using the smaller of k and n−k to minimize arithmetic.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      { lessonId: 'stat4-005', label: 'Counting Principles', note: 'Review combinations C(n,k) if the binomial coefficient calculation feels unclear.' },
      { lessonId: 'stat5-001', label: 'Discrete Random Variables', note: 'Review PMF definition and E[X] calculation if the binomial formula is confusing.' },
    ],
    futureLinks: [
      { lessonId: 'stat5-004', label: 'Normal Distribution', note: 'The normal approximation to the binomial is your first encounter with the normal distribution — it foreshadows the CLT.' },
      { lessonId: 'stat5-005', label: 'Central Limit Theorem', note: 'The CLT explains WHY the binomial converges to normal as n → ∞.' },
      { lessonId: 'stat6-001', label: 'Confidence Intervals', note: 'Confidence intervals for proportions use the binomial distribution and its normal approximation.' },
    ],
  },

  // ── Checkpoints ───────────────────────────────────────────────
  checkpoints: [
    { id: 'stat5-002-cp1', label: 'State the four BINS conditions and give an example of a BINS violation.', type: 'read' },
    { id: 'stat5-002-cp2', label: 'Compute P(X=3) for Binomial(8, 0.3) using the PMF formula by hand.', type: 'example' },
    { id: 'stat5-002-cp3', label: 'Find E[X] and Var(X) for Binomial(100, 0.4) without summing the PMF.', type: 'example' },
    { id: 'stat5-002-cp4', label: 'Use scipy.stats.binom.cdf to find P(X ≤ 15) for Binomial(50, 0.25).', type: 'lab' },
    { id: 'stat5-002-cp5', label: 'Check normal approximation conditions for Binomial(20, 0.05) and Binomial(200, 0.05).', type: 'read' },
    { id: 'stat5-002-cp6', label: 'Apply normal approximation with continuity correction to find P(X ≥ 190) for Binomial(400, 0.45).', type: 'example' },
    { id: 'stat5-002-cp7', label: 'Solve the drug trial challenge: find P(X ≥ 135) for Binomial(300, 0.40) exactly and via normal approx.', type: 'challenge' },
  ],

  // ── Assessment ────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'stat5-002-a1',
        type: 'choice',
        text: 'Which value of $p$ gives the largest variance for a Binomial$(n, p)$ distribution with fixed $n$?',
        options: ['p = 0.1', 'p = 0.3', 'p = 0.5', 'p = 0.7'],
        answer: 'p = 0.5',
        hint: 'Var(X) = np(1-p). The function p(1-p) is maximized at p=0.5.',
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────
  quiz: [
    {
      id: 'stat5-002-q1',
      type: 'choice',
      text: 'Which condition must hold for the Binomial model to be appropriate?',
      options: [
        'The number of successes must be at least 5',
        'All four BINS conditions must hold',
        'The sample size n must be at least 30',
        'The probability p must equal 0.5',
      ],
      answer: 'All four BINS conditions must hold',
      hints: ['BINS: Binary, Independence, Number fixed, Same probability. All four are required.'],
      reviewSection: 'Intuition → BINS conditions',
    },
    {
      id: 'stat5-002-q2',
      type: 'choice',
      text: 'For $X \\sim \\text{Binomial}(25, 0.6)$, what are $E[X]$ and $\\text{Var}(X)$?',
      options: ['E[X]=15, Var=6', 'E[X]=15, Var=9', 'E[X]=10, Var=6', 'E[X]=15, Var=15'],
      answer: 'E[X]=15, Var=6',
      hints: ['E[X]=np=25(0.6)=15. Var=np(1-p)=25(0.6)(0.4)=6.'],
      reviewSection: 'Math → E[X] and Var(X) formulas',
    },
    {
      id: 'stat5-002-q3',
      type: 'choice',
      text: 'What does $\\binom{n}{k}$ count in the binomial PMF?',
      options: [
        'The number of permutations of k successes',
        'The number of ways to arrange k successes among n positions (without regard to order)',
        'The total number of outcomes n!',
        'The probability that k specific trials succeed',
      ],
      answer: 'The number of ways to arrange k successes among n positions (without regard to order)',
      hints: ['Order does not matter — HHTHHT and THHHHT have the same probability if they both have 4 H\'s.'],
      reviewSection: 'Intuition → Why combinations, not permutations',
    },
    {
      id: 'stat5-002-q4',
      type: 'choice',
      text: 'For which parameter values is the normal approximation to the Binomial(n,p) valid?',
      options: [
        'n ≥ 30',
        'np ≥ 5 and n(1-p) ≥ 5',
        'p ≥ 0.5',
        'n ≥ 100',
      ],
      answer: 'np ≥ 5 and n(1-p) ≥ 5',
      hints: ['Both conditions must hold simultaneously. n≥30 is a CLT rule, not specifically for the binomial.'],
      reviewSection: 'Intuition → Normal approximation',
    },
    {
      id: 'stat5-002-q5',
      type: 'choice',
      text: 'A coin is flipped 10 times. $X$ = number of heads. What is $P(X=0)$?',
      options: ['0', '(0.5)^{10} = 1/1024 ≈ 0.001', '0.1', '1/10'],
      answer: '(0.5)^{10} = 1/1024 ≈ 0.001',
      hints: ['P(X=0) = C(10,0)(0.5)^0(0.5)^10 = 1 × 1 × (0.5)^10 = 1/1024.'],
      reviewSection: 'Intuition → PMF formula',
    },
    {
      id: 'stat5-002-q6',
      type: 'choice',
      text: 'If $X \\sim \\text{Binomial}(m, p)$ and $Y \\sim \\text{Binomial}(n, p)$ are independent, what is the distribution of $X+Y$?',
      options: [
        'Binomial(m+n, 2p)',
        'Binomial(m+n, p)',
        'Binomial(mn, p)',
        'Not binomial',
      ],
      answer: 'Binomial(m+n, p)',
      hints: ['X+Y is the sum of m+n independent Bernoulli(p) variables. Same p is required!'],
      reviewSection: 'Rigor → Additive property of binomials',
    },
    {
      id: 'stat5-002-q7',
      type: 'choice',
      text: '30% of customers redeem a coupon. In a group of 20 customers, what are $E[X]$ and $\\text{SD}(X)$?',
      options: [
        'E[X]=6, SD≈2.05',
        'E[X]=6, SD=4.2',
        'E[X]=14, SD≈2.05',
        'E[X]=0.3, SD=0.7',
      ],
      answer: 'E[X]=6, SD≈2.05',
      hints: [
        'E[X] = np = 20×0.3 = 6. Var(X) = np(1−p) = 20×0.3×0.7 = 4.2.',
        'SD = √4.2 ≈ 2.05.',
      ],
      reviewSection: 'Intuition → E[X]=np and Var(X)=np(1−p)',
    },
    {
      id: 'stat5-002-q8',
      type: 'choice',
      text: 'For $X \\sim \\text{Binomial}(10, 0.4)$, compute $P(X=2)$ using $\\binom{10}{2}(0.4)^2(0.6)^8$.',
      options: ['0.121', '0.160', '0.040', '0.288'],
      answer: '0.121',
      hints: [
        'C(10,2) = 45. (0.4)² = 0.16. (0.6)⁸ ≈ 0.01680.',
        '45 × 0.16 × 0.01680 ≈ 0.121.',
      ],
      reviewSection: 'Procedure: Using the Binomial PMF',
    },
    {
      id: 'stat5-002-q9',
      type: 'choice',
      text: 'Which situation violates the BINS Independence condition and requires a different distribution?',
      options: [
        'Rolling a die 10 times and counting sixes',
        'Sampling 5 cards from a 10-card deck without replacement',
        'Counting defective parts in 100 trials with 2% defect rate',
        'Testing 50 patients, each independently responding to a drug',
      ],
      answer: 'Sampling 5 cards from a 10-card deck without replacement',
      hints: [
        'Sampling without replacement from a small population makes trials dependent.',
        'Use the hypergeometric distribution when sampling without replacement from a finite population.',
      ],
      reviewSection: 'Strategy callout — Recognizing When NOT to Use Binomial',
    },
    {
      id: 'stat5-002-q10',
      type: 'choice',
      text: 'For $\\text{Binomial}(100, 0.04)$, is the normal approximation valid? If not, what should be used?',
      options: [
        'Valid: np=4 satisfies np≥5',
        'Not valid (np=4 < 5); use Poisson approximation instead',
        'Valid: only n needs to be ≥ 30',
        'Valid: only n(1−p) needs to be ≥ 5',
      ],
      answer: 'Not valid (np=4 < 5); use Poisson approximation instead',
      hints: [
        'Normal approximation requires np ≥ 5 AND n(1−p) ≥ 5. Here np = 100×0.04 = 4 < 5.',
        'For large n and small p (np moderate), use Poisson(λ=np=4) instead.',
      ],
      reviewSection: 'Warning callout — Normal Approximation Requires Both Checks',
    },
  ],

  // ── Misconceptions ────────────────────────────────────────────
  misconceptions: [
    {
      falseBelief: 'If I flip a coin and get 4 heads in a row, the next flip is more likely to be tails.',
      whyStudentsThinkIt: 'This is the Gambler\'s Fallacy. Students treat the coin as having "memory" — as if it owes them a tails to "balance out."',
      correctionExample: 'Each Bernoulli trial is independent. P(Tails on flip 5) = 0.5 regardless of the previous four flips. The BINS "I" condition ensures this: independence means the outcome of one trial does not affect any other.',
      contrastCase: 'If the coin were being drawn without replacement from a population (like drawing chips from a bag), then past draws DO affect future probabilities. But fair coin flips are independent.',
    },
    {
      falseBelief: 'The normal approximation is valid as long as n is large.',
      whyStudentsThinkIt: 'Students confuse the general CLT rule (n≥30) with the specific binomial approximation condition.',
      correctionExample: 'For Binomial(1000, 0.002): np = 2 < 5 — even with n=1000, the approximation is poor because p is tiny and the distribution is heavily right-skewed. The correct model for rare events with large n is the Poisson distribution (next lesson).',
      contrastCase: 'Binomial(30, 0.5): np=15≥5, n(1-p)=15≥5 — both conditions met with n=30. Here the approximation is good despite n being much smaller.',
    },
    {
      falseBelief: 'P(X=5) is always the same as P(X≤5) − P(X≤4).',
      whyStudentsThinkIt: 'Students may confuse CDF subtraction with PMF values, or misapply the interval formula.',
      correctionExample: 'For a discrete distribution: P(X=5) = F(5) − F(4) = P(X≤5) − P(X≤4). This IS correct. The confusion arises when computing P(a ≤ X ≤ b): this equals F(b) − F(a−1), not F(b) − F(a).',
      contrastCase: 'P(3 ≤ X ≤ 7) = F(7) − F(2) = P(X≤7) − P(X≤2). Note: subtract F(2), not F(3), to include X=3 in the interval.',
    },
  ],

  // ── Transfer Prompts ──────────────────────────────────────────
  transferPrompts: [
    {
      situation: 'A social media platform is testing a new recommendation algorithm. They run an A/B test with 10,000 users in each group. The baseline click rate is 8%. The treatment group has 890 clicks. Does the new algorithm improve performance? Set up the statistical test.',
      competingTechniques: ['Exact binomial test', 'Normal approximation with continuity correction', 'Chi-square test'],
      whyThisTechniqueWins: 'For n=10,000 and p=0.08: np=800≥5 and n(1-p)=9200≥5 — normal approximation is excellent. Use z=(890-0.5-800)/sqrt(800×0.92)=89.5/27.13≈3.30. This z-score is very large; P(Z≥3.30)≈0.0005. Strong evidence of improvement. The exact binomial gives the same conclusion but requires software; the normal approximation is analytically tractable.',
    },
    {
      situation: 'A CNC shop produces 500 parts per shift. The target defect rate is 2%. A Six Sigma initiative aims to reduce it to 0.5%. Compare the expected defect counts and the probability of having more than 15 defects per shift before and after the initiative.',
      competingTechniques: ['Binomial PMF calculation', 'Normal approximation', 'Simulation'],
      whyThisTechniqueWins: 'Before: Binomial(500, 0.02), E[X]=10, σ≈3.13, P(X>15)≈0.057. After: Binomial(500, 0.005), E[X]=2.5, σ≈1.58, P(X>15)≈0.0000001 (effectively zero). The exact binomial CDF gives precise probabilities. The normal approximation is valid for the "before" scenario (np=10≥5) but not for the "after" scenario (np=2.5<5) — use Poisson instead for the after scenario.',
    },
  ],

  // ── Debugging ─────────────────────────────────────────────────
  debugging: [
    {
      commonError: 'Using C(n,k) as a permutation P(n,k) = n!/(n-k)! instead of the combination n!/(k!(n-k)!).',
      symptom: 'The PMF values are k! times too large and sum to more than 1.',
      whyItHappened: 'Student forgot to divide by k! in the combination formula. The order of successes does not matter (HHT = HTH in outcome count), so we use combinations, not permutations.',
      repairStrategy: 'Remember: C(n,k) = P(n,k)/k! = [n!/(n-k)!] / k!. Always verify your PMF sums to 1 — if the sum exceeds 1, you have likely used permutations instead of combinations.',
    },
    {
      commonError: 'Applying the normal approximation when np < 5 (rare events, small n).',
      symptom: 'The normal approximation gives P(X < 0) > 0 or the approximated probabilities are wildly off from the exact values.',
      whyItHappened: 'When np < 5, the binomial distribution is heavily skewed and far from bell-shaped. The symmetric normal curve cannot approximate a skewed distribution well.',
      repairStrategy: 'Check np ≥ 5 AND n(1-p) ≥ 5 before applying the normal approximation. If np < 5 but n is large and p is small, use the Poisson approximation (Lesson 5-003) with λ = np. If neither condition holds, use the exact binomial CDF.',
    },
  ],

  // ── Mastery ───────────────────────────────────────────────────
  mastery: {
    targetLevel: 3,
    solveIndependently: 'Given a Binomial scenario, verify BINS conditions, compute PMF at specific k, find E[X] and Var(X), and compute CDF probabilities for inequality queries.',
    explainVerbally: 'Explain why the binomial coefficient appears in the PMF formula, and why the variance is maximized at p=0.5.',
    detectIncorrectApplication: 'Identify when the Binomial model is inappropriate (dependence, varying p, sampling without replacement from small population) and suggest the correct alternative.',
    transferToUnfamiliar: 'Set up and solve a binomial problem in a new domain (medical trials, engineering quality control, digital marketing), including computing the relevant probability and checking the normal approximation conditions.',
  },
};
