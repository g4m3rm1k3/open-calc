export default {
  id: "stat1-004",
  slug: "confidence-intervals",
  chapter: "stat1",
  order: 4,
  title: "Confidence Intervals from First Principles",
  subtitle:
    "Estimate population means and proportions with quantified uncertainty.",
  tags: [
    "statistics",
    "confidence interval",
    "inference",
    "mean",
    "proportion",
  ],
  aliases: "confidence interval margin of error z interval t interval",
  timeToComplete: 45,
  coreConcept:
    "A confidence interval is a range of plausible values for an unknown population parameter, built from sample data and a margin of error.",
  prerequisites: ["stat1-001", "stat1-002", "stat1-003"],
  nextLesson: "stat1-005",

  hook: {
    question:
      "If your sample mean is 62, why should anyone trust it without a range?",
    realWorldContext:
      "A medical device startup measures battery life on 80 prototypes and gets an average of 9.8 hours. Investors ask one question: what is the uncertainty? A confidence interval answers that directly.",
  },

  intuition: {
    prose: [
      "**Roadmap for this lesson.** By the end you will be able to: (1) build a 95% confidence interval for a population mean or proportion from scratch, (2) state the correct frequentist interpretation without making the most common probability error, and (3) plan a sample size to achieve a desired margin of error.",
      "**Why a single number is not enough.** In stat1-001, the school district researcher computed a sample mean of 62 minutes from 120 students. She knows $\\bar{x} = 62$. But different samples of 120 students would produce different sample means — perhaps 59, 65, 63, 61. This variability is called **sampling variability**: the sample mean $\\bar{x}$ is a random variable that fluctuates from sample to sample. A confidence interval captures how much it fluctuates and uses that to say how far the true population mean $\\mu$ could plausibly be from the one number we computed.",
      "**The key building block: standard error.** The **standard error of the mean** (SE) measures the typical distance between $\\bar{x}$ and $\\mu$ across repeated samples: $SE = s/\\sqrt{n}$, where $s$ is the sample standard deviation. For a homework study with $s = 14$ minutes and $n = 120$ students: $SE = 14/\\sqrt{120} \\approx 1.28$ minutes. This tells us the sample mean typically lands within about 1.28 minutes of the true district-wide mean — not guaranteed, but predictable on average.",
      "**The Central Limit Theorem does the heavy lifting.** For large enough samples (typically $n \\geq 30$), the sampling distribution of $\\bar{x}$ is approximately normal regardless of the shape of the original population distribution. This is the **Central Limit Theorem (CLT)**. Because $\\bar{x} \\approx N(\\mu, SE^2)$, we know that about 95% of all possible sample means land within $\\pm 1.96 \\times SE$ of $\\mu$ — so the interval $\\bar{x} \\pm 1.96 \\times SE$ captures $\\mu$ in approximately 95% of all samples.",
      "**Before reading on, predict:** if $n$ increases from 120 to 480 while $s$ stays the same, what happens to the SE and the width of the confidence interval? Write your prediction before continuing.",
      "**Constructing the interval step by step.** Using the homework study values: $\\bar{x} = 62$, $SE \\approx 1.28$, $z^* = 1.96$ for 95% confidence. Margin of error: $ME = 1.96 \\times 1.28 \\approx 2.5$ minutes. The 95% CI is $[62 - 2.5,\\; 62 + 2.5] = [59.5, 64.5]$ minutes. Interpretation in context: based on the sample of 120 students, plausible values for the district-wide average homework time range from 59.5 to 64.5 minutes per night.",
      "**The correct interpretation — get this exactly right.** A 95% CI does NOT mean 'there is a 95% probability that $\\mu$ is in [59.5, 64.5].' After computing the interval from your data, the unknown $\\mu$ is a fixed (not random) number — it either is or is not in the interval, and you cannot know which. The 95% refers to the **method**: if you repeated this sampling procedure 100 times and built 100 separate intervals, about 95 of them would contain $\\mu$. Confidence is a long-run property of the procedure, not a probability about one realized interval.",
      "**Small samples: the t-distribution.** When $n < 30$ or — as is always the case in practice — the population standard deviation $\\sigma$ is unknown, the critical value $z^* = 1.96$ is not quite right. Instead, use the **t-distribution** with $df = n - 1$ degrees of freedom: $\\bar{x} \\pm t^*_{n-1} \\cdot (s/\\sqrt{n})$. For $n = 15$, $t^*_{14} \\approx 2.145$ for 95% confidence — wider than 1.96. The t-distribution has heavier tails to account for the extra uncertainty from estimating $\\sigma$ with $s$. As $n \\to \\infty$, $t^* \\to 1.96$.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Build a 95% CI for a Mean",
        body: "Step 1. Compute sample mean $\\bar{x}$ and sample standard deviation $s$.\nStep 2. Compute standard error: $SE = s/\\sqrt{n}$.\nStep 3. Choose critical value: $z^* = 1.96$ for large $n$; $t^*_{n-1}$ for small $n$ or unknown $\\sigma$.\nStep 4. Compute margin of error: $ME = z^* \\times SE$ (or $t^* \\times SE$).\nStep 5. Report interval: $\\bar{x} \\pm ME$ and interpret in the context of the problem with units.",
      },
      {
        type: "warning",
        title: "What a 95% CI Does NOT Mean",
        body: "It does not mean there is a 95% probability that $\\mu$ is inside this one computed interval. After computing $[59.5, 64.5]$, the parameter $\\mu$ is fixed — it either is or is not in the interval. The 95% refers to the long-run frequency: this method produces intervals that contain $\\mu$ in 95% of repeated samples. Confidence is about the procedure, not about the specific realized interval.",
      },
      {
        type: "insight",
        title: "Confidence Level vs. Width Trade-off",
        body: "Higher confidence requires a larger critical value, which widens the interval:\n\n• 90% confidence: $z^* = 1.645$ → narrower, less certain\n• 95% confidence: $z^* = 1.96$ → standard choice\n• 99% confidence: $z^* = 2.576$ → wider, more certain\n\nYou cannot increase both confidence and precision simultaneously without collecting more data. The only way to narrow an interval while keeping the confidence level fixed is to increase $n$.",
      },
    ],
    visualizations: [
      {
        id: "stat1-004-viz-1",
        type: "simulation",
        title: "Repeated Samples, Repeated Intervals",
        purpose:
          "Corrects the misconception that confidence is about one interval rather than a long-run process.",
      },
    ],
  },

  math: {
    prose: [
      "**Large-sample z-interval for a mean.** When $n \\geq 30$ (or the population is known to be approximately normal), the $100(1-\\alpha)$% confidence interval for $\\mu$ is: $\\bar{x} \\pm z^* \\cdot \\dfrac{s}{\\sqrt{n}}$, where $z^* = 1.645$ (90%), $z^* = 1.96$ (95%), or $z^* = 2.576$ (99%). The standard error $SE = s/\\sqrt{n}$ is the estimated standard deviation of the sampling distribution of $\\bar{x}$.",
      "**t-interval for small samples or unknown $\\sigma$.** The pivot statistic $T = (\\bar{x} - \\mu)/(s/\\sqrt{n})$ follows a $t_{n-1}$ distribution. The $100(1-\\alpha)$% CI is: $\\bar{x} \\pm t^*_{n-1} \\cdot \\dfrac{s}{\\sqrt{n}}$. Values of $t^*$ for 95% confidence: $n=10 \\Rightarrow t^*_9 = 2.262$; $n=20 \\Rightarrow t^*_{19} = 2.093$; $n=30 \\Rightarrow t^*_{29} = 2.045$; $n \\to \\infty \\Rightarrow t^* \\to 1.96$.",
      "**CI for a proportion.** For sample proportion $\\hat{p} = X/n$ from $n$ independent Bernoulli trials, an approximate 95% CI is: $\\hat{p} \\pm 1.96 \\sqrt{\\dfrac{\\hat{p}(1-\\hat{p})}{n}}$. The SE is maximized at $\\hat{p} = 0.5$, giving the conservative worst-case $SE_{\\max} = 0.5/\\sqrt{n}$. This is the basis for the rule of thumb that 1,068 people give ±3% margin for any proportion at 95% confidence.",
      "**Sample size planning.** To achieve margin $\\leq E$ for a mean: $n \\geq \\left(\\dfrac{z^* \\cdot s}{E}\\right)^2$. For a proportion (using $\\hat{p} = 0.5$ as the conservative worst case): $n \\geq \\left(\\dfrac{z^*}{2E}\\right)^2$. For 95% confidence and $E = 0.03$: $n \\geq (1.96/0.06)^2 = (32.67)^2 \\approx 1{,}068$.",
    ],
  },

  rigor: {
    prose: [
      "**R1 — Formal coverage statement.** Let $I(X_1, \\ldots, X_n)$ be a confidence interval procedure. It achieves nominal coverage $1-\\alpha$ if $P_\\theta(\\theta \\in I(X)) = 1-\\alpha$ for all $\\theta \\in \\Theta$. For the t-interval under normality, this coverage is exact for all $n$. For the z-interval via CLT, it is approximate — the approximation improves as $n$ grows. Coverage is a property of the random procedure $(I(\\cdot))$, not of the realized fixed interval $[\\hat{l}, \\hat{u}]$ after data are observed.",
      "**R2 — Invariant: confidence level is a method property.** After observing data, the interval is a fixed set of numbers and $\\mu$ is a fixed unknown. The statement '$P(\\mu \\in [59.5, 64.5]) = 0.95$' has no frequentist meaning — it is either 0 or 1. The probability statement is valid only before data are collected, when the endpoints are still random variables. This is why the Bayesian credible interval is conceptually different: it uses a prior and produces a statement $P(\\theta \\in I \\mid \\text{data}) = 0.95$ with a genuine posterior probability.",
      "**R3 — Geometric interpretation.** In $\\mathbb{R}^n$, a sample of $n$ observations is a single point. The sample mean projects this point onto the line spanned by $(1, 1, \\ldots, 1)/\\sqrt{n}$. The confidence interval adds a symmetric radius $\\pm ME$ around this projection on the parameter axis. The interval will cover the true parameter exactly when the projection falls within $ME$ of the true mean — which happens with probability $1-\\alpha$ under the model.",
      "**R4 — Duality with hypothesis tests.** A two-sided 95% CI $[\\hat{l}, \\hat{u}]$ for $\\mu$ is equivalent to the set of null hypotheses $\\mu_0$ that a two-sided $\\alpha = 0.05$ test would fail to reject. That is: $\\mu_0 \\in [\\hat{l}, \\hat{u}] \\iff |\\bar{x} - \\mu_0|/(s/\\sqrt{n}) < t^*_{n-1}$. This duality means every confidence interval encodes a family of hypothesis test decisions — a fact that becomes central in stat6 (hypothesis testing).",
    ],
  },

  python: {
    cells: [
      {
        id: "stat1-004-cell-1",
        type: "python",
        cellTitle: "95% CI for a mean from CSV data",
        code: "import pandas as pd\nimport numpy as np\n\n# Replace with your own CSV path later\n# df = pd.read_csv('data/applied-statistics/study_hours_scores.csv')\n\nnp.random.seed(7)\nscores = np.random.normal(loc=74, scale=10, size=120)\ndf = pd.DataFrame({'score': scores})\n\nn = len(df)\nxbar = df['score'].mean()\ns = df['score'].std(ddof=1)\nse = s / np.sqrt(n)\nme = 1.96 * se\nci = (xbar - me, xbar + me)\n\nprint(f'n={n}, xbar={xbar:.2f}, s={s:.2f}, SE={se:.3f}')\nprint(f'95% CI for mean: [{ci[0]:.2f}, {ci[1]:.2f}]')",
        instructions:
          "Swap in a real CSV column, rerun, and compare interval widths for n=30 vs n=120.",
      },
      {
        id: "stat1-004-cell-2",
        type: "python",
        cellTitle: "Sample size effect on interval width",
        code: `import numpy as np

def ci_width(s, n, z=1.96):
    return 2 * z * s / np.sqrt(n)

print(f"{'n':>6}  {'Width':>8}  {'Ratio to n=25':>14}")
print("-" * 34)
base = ci_width(12, 25)
for n in [25, 100, 400, 1600]:
    w = ci_width(12, n)
    print(f"{n:>6}  {w:>8.3f}  {w/base:>14.3f}")

print()
print("To halve the width, sample size must quadruple.")
print("This is the 1/sqrt(n) law — diminishing returns on precision.")
`,
        instructions:
          "Each time n quadruples, the width halves. Going from n=25 to n=1600 multiplies n by 64 but only reduces width by a factor of 8 (= √64). Precision has diminishing returns.",
      },
      {
        id: "stat1-004-cell-3",
        type: "python",
        cellTitle: "Visualize CI coverage: what '95% confidence' really means",
        code: `import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
true_mean = 70       # true population mean (unknown in practice)
sigma = 10           # population SD (known here for z-interval)
n = 40               # sample size
n_trials = 40        # number of intervals to simulate
z_star = 1.96

fig, ax = plt.subplots(figsize=(8, 7))
hits = 0
for i in range(n_trials):
    sample = np.random.normal(true_mean, sigma, n)
    xbar = sample.mean()
    se = sigma / np.sqrt(n)
    lo, hi = xbar - z_star * se, xbar + z_star * se
    captured = lo <= true_mean <= hi
    hits += int(captured)
    color = "steelblue" if captured else "crimson"
    ax.plot([lo, hi], [i, i], color=color, lw=2)
    ax.plot(xbar, i, "o", color=color, ms=4)

ax.axvline(true_mean, color="black", lw=2, linestyle="--",
           label=f"True μ = {true_mean}")
ax.set_xlabel("Value")
ax.set_ylabel("Trial number")
ax.set_title(f"95% CI Coverage Simulation\\n"
             f"{hits}/{n_trials} intervals contain μ   (red = miss)")
ax.legend()
plt.tight_layout()
plt.show()
print(f"Coverage: {hits}/{n_trials} = {hits/n_trials:.1%}")
print("Expected: ~95%.  Run with a different seed to see variation.")
`,
        instructions:
          "The red intervals missed the true mean — this is expected and not an error. Roughly 5% of 95% confidence intervals will miss. This is what '95% confidence' actually means: a long-run property of the method. Change np.random.seed() to see a different trial; the coverage rate should stay near 95% over many runs.",
      },
    ],
  },

  examples: [
    {
      id: "stat1-004-ex1",
      title: "Mean CI with known summary stats",
      difficulty: "easy",
      problem:
        "Given x-bar = 50, s = 8, n = 64, compute an approximate 95% CI for mu.",
      steps: [
        {
          expression: "SE = s/sqrt(n) = 8/8 = 1",
          annotation: "Compute standard error from spread and sample size.",
          strategyTitle: "Compute SE",
        },
        {
          expression: "ME = 1.96 * 1 = 1.96",
          annotation: "Use z* for 95% confidence.",
          strategyTitle: "Compute margin",
        },
        {
          expression: "CI = 50 +/- 1.96 = [48.04, 51.96]",
          annotation: "Interpret as plausible values for the population mean.",
          strategyTitle: "Build interval",
        },
      ],
    },
    {
      id: "stat1-004-ex2",
      title: "Proportion CI",
      difficulty: "medium",
      problem:
        "In a sample of 500 students, 310 prefer digital homework. Compute a 95% CI for p.",
      steps: [
        {
          expression: "p-hat = 310/500 = 0.62",
          annotation: "Sample proportion.",
          strategyTitle: "Point estimate",
        },
        {
          expression: "SE = sqrt(0.62*0.38/500) = 0.0217",
          annotation: "Standard error for a proportion.",
          strategyTitle: "Compute SE",
        },
        {
          expression: "CI = 0.62 +/- 1.96*0.0217 = [0.577, 0.663]",
          annotation: "Report with context: 57.7% to 66.3%.",
          strategyTitle: "Build interval",
        },
      ],
    },
    {
      id: "stat1-004-ex3",
      title: "Sample-size planning",
      difficulty: "hard",
      problem:
        "You want margin <= 2 units for a mean with estimated s = 10 at 95% confidence. Approximate required n.",
      steps: [
        {
          expression: "ME = 1.96*s/sqrt(n) <= 2",
          annotation: "Set desired precision inequality.",
          strategyTitle: "Set target",
        },
        {
          expression: "sqrt(n) >= 1.96*10/2 = 9.8",
          annotation: "Isolate sqrt(n).",
          strategyTitle: "Solve",
        },
        {
          expression: "n >= 96.04 -> choose n = 97",
          annotation: "Round up to guarantee the margin target.",
          strategyTitle: "Finalize n",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat1-004-ch1",
      title: "Interpretation check",
      difficulty: "easy",
      problem:
        "A team reports 95% CI [12.2, 14.8] for average wait time. Write a correct interpretation and one incorrect interpretation.",
      walkthrough: [
        {
          expression: "Correct: the method has 95% long-run coverage",
          annotation: "Confidence is about repeated sampling procedures.",
        },
        {
          expression: "Incorrect: 95% chance mu is in this fixed interval",
          annotation: "After observing data, mu is fixed; interval is fixed.",
        },
      ],
      answer:
        "Correct interpretation uses long-run coverage. Incorrect interpretation treats the parameter as random after data are observed.",
    },
    {
      id: "stat1-004-ch2",
      title: "Width comparison",
      difficulty: "medium",
      problem:
        "Two studies have same s but n=80 and n=320. Which has narrower 95% CI and by what factor?",
      walkthrough: [
        {
          expression: "Width proportional to 1/sqrt(n)",
          annotation: "Key scaling law.",
        },
        {
          expression: "sqrt(320/80)=2",
          annotation: "Second sample is 4x size, so width is half.",
        },
      ],
      answer: "The n=320 study has a CI half as wide.",
    },
    {
      id: "stat1-004-ch3",
      title: "Build a CI from your own CSV",
      difficulty: "hard",
      problem:
        "Load a CSV with one numeric column and compute a 95% CI. Then explain one assumption you made.",
      walkthrough: [
        {
          expression: "Read -> summarize -> SE -> ME -> CI",
          annotation: "Follow the five-step procedure exactly.",
        },
      ],
      answer:
        "A complete answer includes numeric CI endpoints and at least one assumption (random sample, independent observations, or approximate normality).",
    },
  ],

  semantics: {
    core: [
      { symbol: "x-bar", meaning: "Sample mean computed from observed data" },
      { symbol: "mu", meaning: "Unknown population mean parameter" },
      {
        symbol: "SE",
        meaning: "Standard error, typical sampling fluctuation of estimator",
      },
      {
        symbol: "ME",
        meaning: "Margin of error added/subtracted from estimate",
      },
      {
        symbol: "CI",
        meaning: "Confidence interval, a plausible parameter range from data",
      },
    ],
    rulesOfThumb: [
      "Confidence level is a method property, not a probability on one realized interval.",
      "Interval width shrinks with 1/sqrt(n).",
      "Wider confidence means more uncertainty, not worse data quality by itself.",
      "Always report interval in context and units.",
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: "stat1-001",
        label: "Parameter vs Statistic",
        note: "Revisit the distinction before interpreting intervals.",
      },
    ],
    futureLinks: [
      {
        lessonId: "stat1-005",
        label: "Regression Inference",
        note: "Regression coefficients are estimated with confidence intervals too.",
      },
    ],
  },

  checkpoints: [
    {
      id: "cp-stat1-004-1",
      label: "Read confidence interval definition",
      type: "read",
    },
    { id: "cp-stat1-004-2", label: "Run notebook mean CI cell", type: "lab" },
    {
      id: "cp-stat1-004-3",
      label: "Compute SE from summary stats",
      type: "example",
    },
    { id: "cp-stat1-004-4", label: "Compute margin of error", type: "example" },
    {
      id: "cp-stat1-004-5",
      label: "Interpret CI correctly in words",
      type: "read",
    },
    {
      id: "cp-stat1-004-6",
      label: "Compare interval widths across n",
      type: "lab",
    },
    {
      id: "cp-stat1-004-7",
      label: "Complete proportion CI example",
      type: "example",
    },
    {
      id: "cp-stat1-004-8",
      label: "Attempt CSV-based challenge",
      type: "challenge",
    },
  ],

  assessment: {
    questions: [
      {
        id: "stat1-004-assess-1",
        type: "choice",
        text: "If sample size increases from 100 to 400 with same variability, the 95% CI width is approximately:",
        options: [
          "twice as wide",
          "half as wide",
          "unchanged",
          "four times as wide",
        ],
        answer: "half as wide",
        hint: "Width is proportional to 1/sqrt(n).",
      },
    ],
  },

  quiz: [
    {
      id: "stat1-004-quiz-1",
      type: "choice",
      text: "What does a confidence interval estimate?",
      options: [
        "A sample value",
        "A population parameter",
        "A model residual",
        "A p-value",
      ],
      answer: "A population parameter",
      hints: ["The target is unknown and lives in the population."],
      reviewSection: "Intuition -> first two paragraphs",
    },
    {
      id: "stat1-004-quiz-2",
      type: "choice",
      text: "Which change narrows a CI most directly?",
      options: [
        "Increase sample size",
        "Increase confidence level",
        "Increase variance",
        "Use fewer observations",
      ],
      answer: "Increase sample size",
      hints: ["Think 1/sqrt(n)."],
      reviewSection: "Procedure callout",
    },
    {
      id: "stat1-004-quiz-3",
      type: "choice",
      text: "A near-miss statement is:",
      options: [
        "95% of future intervals from this method capture mu",
        "There is 95% chance mu is in this fixed interval",
        "Larger n reduces SE",
        "ME = critical * SE",
      ],
      answer: "There is 95% chance mu is in this fixed interval",
      hints: ["After observing data, the parameter is fixed."],
      reviewSection: "Warning callout",
    },
    {
      id: "stat1-004-quiz-4",
      type: "choice",
      text: "If s=15 and n=225, SE equals:",
      options: ["1", "0.5", "15", "3"],
      answer: "1",
      hints: ["SE=s/sqrt(n). sqrt(225)=15."],
      reviewSection: "Math section",
    },
    {
      id: "stat1-004-quiz-5",
      type: "choice",
      text: "Which is NOT a valid CI use case?",
      options: [
        "Estimate unknown mean",
        "Estimate unknown proportion",
        "Prove causality without design assumptions",
        "Quantify uncertainty around estimate",
      ],
      answer: "Prove causality without design assumptions",
      hints: ["Inference quality depends on design and assumptions."],
      reviewSection: "Rigor section",
    },
    {
      id: "stat1-004-quiz-6",
      type: "choice",
      text: "A 99% CI is wider than a 95% CI for the same data because:",
      options: [
        "The sample size is smaller at 99%",
        "The critical value z* is larger at 99% confidence",
        "The standard deviation is larger at higher confidence",
        "Wider intervals are always less accurate",
      ],
      answer: "The critical value z* is larger at 99% confidence",
      hints: [
        "z* = 1.96 for 95%; z* = 2.576 for 99%.",
        "Larger critical value → larger margin of error → wider interval.",
      ],
      reviewSection: "Math section — z* values by confidence level",
    },
    {
      id: "stat1-004-quiz-7",
      type: "choice",
      text: "The critical value z* = 1.96 for a 95% CI comes from:",
      options: [
        "The sample standard deviation",
        "The t-distribution with n degrees of freedom",
        "The standard normal distribution: the value that leaves 2.5% in each tail",
        "A rule of thumb that 2 is close enough to 1.96",
      ],
      answer:
        "The standard normal distribution: the value that leaves 2.5% in each tail",
      hints: [
        "For 95% confidence, 5% is split equally between the two tails: 2.5% each.",
        "z* = 1.96 is the 97.5th percentile of the standard normal N(0,1).",
      ],
      reviewSection: "Math section — large-sample z-interval",
    },
    {
      id: "stat1-004-quiz-8",
      type: "choice",
      text: "You want a 95% CI margin of error ≤ 3 points for a mean. Your pilot study suggests σ ≈ 15. Approximately what minimum sample size do you need?",
      options: ["25", "97", "196", "384"],
      answer: "97",
      hints: [
        "Use n ≥ (z* × s / E)² = (1.96 × 15 / 3)².",
        "1.96 × 15 / 3 = 9.8; then 9.8² ≈ 96 → round up to 97.",
      ],
      reviewSection: "Math section — sample size planning",
    },
    {
      id: "stat1-004-quiz-9",
      type: "choice",
      text: "A t-interval uses t* instead of z* = 1.96 primarily when:",
      options: [
        "The population distribution is not perfectly symmetric",
        "The sample size is large (n > 100)",
        "The sample size is small and σ is unknown (estimated by s)",
        "You want a one-sided interval instead of two-sided",
      ],
      answer: "The sample size is small and σ is unknown (estimated by s)",
      hints: [
        "The t-distribution accounts for extra uncertainty from estimating σ with s.",
        "As n → ∞, the t-distribution converges to the standard normal, so t* → 1.96.",
      ],
      reviewSection:
        'Intuition → "Small samples: the t-distribution" paragraph',
    },
    {
      id: "stat1-004-quiz-10",
      type: "choice",
      text: "A 95% CI for mean daily screen time is [4.1, 5.7] hours. Which statement is correctly worded?",
      options: [
        "There is a 95% probability that the true mean is between 4.1 and 5.7 hours",
        "95% of individuals have daily screen time between 4.1 and 5.7 hours",
        "This method, applied repeatedly, captures the true mean in about 95% of samples",
        "We are 95% certain that this specific interval contains the true mean",
      ],
      answer:
        "This method, applied repeatedly, captures the true mean in about 95% of samples",
      hints: [
        "After computing [4.1, 5.7], the true mean μ is fixed — probability is either 0 or 1.",
        "Confidence is a long-run property of the procedure, not of this one realized interval.",
      ],
      reviewSection:
        'Intuition → "The correct interpretation" paragraph and the CI coverage simulation cell',
    },
  ],

  definitions: [
    {
      term: "standard error (SE)",
      definition:
        "The standard deviation of a sample statistic (like x̄) across repeated samples; quantifies how much the estimate fluctuates. For the mean: SE = s/√n.",
    },
    {
      term: "margin of error (ME)",
      definition:
        "Half the width of a confidence interval: ME = z* × SE. Represents the maximum likely distance between the sample estimate and the true population parameter.",
    },
    {
      term: "confidence interval (CI)",
      definition:
        "An interval estimate [x̄ − ME, x̄ + ME] derived from sample data; the method that produced it captures the true population parameter in a specified percentage of repeated samples.",
    },
    {
      term: "confidence level",
      definition:
        "The long-run proportion of confidence intervals (from the same procedure) that contain the true parameter; e.g., 95% means about 95 of every 100 such intervals capture μ.",
    },
    {
      term: "t-distribution",
      definition:
        "A symmetric, bell-shaped distribution with heavier tails than the standard normal; used for confidence intervals when σ is unknown and n is small. Parameterized by df = n − 1; converges to N(0,1) as n → ∞.",
    },
    {
      term: "Central Limit Theorem (CLT)",
      definition:
        "For large enough n (typically ≥ 30), the sampling distribution of x̄ is approximately N(μ, σ²/n), regardless of the shape of the underlying population distribution.",
    },
  ],

  misconceptions: [
    {
      falseBelief:
        "A 95% confidence interval means there is 95% probability the parameter is inside this interval.",
      whyStudentsThinkIt:
        "The word confidence sounds like direct probability about the parameter.",
      correctionExample:
        "If you repeat sampling many times, about 95 out of 100 intervals from the method contain the true mean.",
      contrastCase:
        "A Bayesian credible interval does make probability statements under a prior; this frequentist CI does not.",
    },
    {
      falseBelief: "Doubling sample size halves interval width.",
      whyStudentsThinkIt: "Students expect linear returns from more data.",
      correctionExample:
        "Going from n=100 to n=400 halves width; from 100 to 200 only multiplies width by about 0.707.",
      contrastCase: "SE proportional to 1/sqrt(n) creates diminishing returns.",
    },
  ],

  transferPrompts: [
    {
      situation:
        "A manufacturing team needs tolerance estimates from sample batches.",
      competingTechniques: ["Point estimate only", "95% confidence interval"],
      whyThisTechniqueWins:
        "Intervals quantify decision risk; point estimates hide uncertainty.",
    },
    {
      situation:
        "A product team compares two onboarding variants with proportion outcomes.",
      competingTechniques: [
        "Raw proportion difference only",
        "Confidence interval on proportion or difference",
      ],
      whyThisTechniqueWins:
        "Intervals reveal both effect size and uncertainty in one report.",
    },
  ],

  debugging: [
    {
      commonError:
        "Using n in denominator for sample standard deviation by mistake when computing s manually.",
      symptom: "CI appears unrealistically narrow.",
      whyItHappened: "Population and sample formulas were mixed.",
      repairStrategy:
        "Use software sd with sample setting (ddof=1) or verify formula carefully.",
    },
    {
      commonError: "Reporting CI endpoints without units or context.",
      symptom: "Stakeholders cannot interpret decision impact.",
      whyItHappened: "Focus shifted to arithmetic only.",
      repairStrategy:
        "Always write: parameter, unit, population, and confidence level in one sentence.",
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently:
      "Compute and report a valid CI for a mean or proportion from sample data.",
    explainVerbally:
      "Explain standard error, margin of error, and confidence interpretation in plain language.",
    detectIncorrectApplication:
      "Spot invalid interpretations like probability-on-parameter claims for frequentist CIs.",
    transferToUnfamiliar:
      "Use CI logic on a new CSV dataset and justify assumptions.",
  },
};
