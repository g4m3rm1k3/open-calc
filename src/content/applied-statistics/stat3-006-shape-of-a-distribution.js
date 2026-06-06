export default {
  id: "stat3-006",
  slug: "shape-of-a-distribution",
  chapter: "stat3",
  order: 6,
  title: "Shape of a Distribution",
  subtitle:
    "Skewness, kurtosis, normality — reading the full picture of a distribution's form.",
  tags: [
    "skewness",
    "kurtosis",
    "normal distribution",
    "symmetric",
    "right skew",
    "left skew",
    "bimodal",
    "uniform",
    "bell curve",
    "normality",
  ],
  aliases:
    "skewness kurtosis skewed right left positive negative normal distribution bell curve bimodal uniform shape distribution leptokurtic platykurtic mesokurtic",
  timeToComplete: 40,
  coreConcept:
    "Shape describes how a distribution is arranged: symmetric or skewed, peaked or flat, unimodal or multimodal. Skewness measures asymmetry (positive = right tail, negative = left tail). Kurtosis measures tail heaviness. The normal (bell) curve is the benchmark shape for much of statistics. Recognizing shape informs every analysis decision that follows.",
  prerequisites: ["stat3-001", "stat3-002", "stat3-005"],
  nextLesson: "stat4-001",

  hook: {
    question:
      "Two datasets have mean=50 and SD=10. One is income data for a small country. The other is exam scores from a standardized test. Even though the mean and SD are identical, should you analyze them the same way?",
    realWorldContext:
      "No. Income distributions are almost always right-skewed: most people earn near the median (perhaps 40–60), but a small fraction earn 200, 500, or 2000 — pulling the mean far above the median and creating a long right tail. Exam scores on a well-designed test are approximately normal (bell-shaped): the vast majority of scores cluster around the center with symmetric tails. These different shapes require different analysis techniques. For income: median+IQR, log-transformation, non-parametric tests. For exam scores: mean+SD, confidence intervals using the normal curve, t-tests. Shape is not a detail — it is the foundation of every analysis choice downstream.",
  },

  intuition: {
    prose: [
      "**Four basic shapes.** A distribution can be: (1) symmetric (left and right sides are mirror images), (2) right-skewed / positively skewed (tail stretches to the right; mean > median), (3) left-skewed / negatively skewed (tail stretches to the left; mean < median), or (4) uniform (all values equally likely, flat histogram). Additionally, distributions can be unimodal (one peak), bimodal (two peaks), or multimodal.",
      "**Skewness: which direction is the tail?** The tail is the long, thin end of the distribution — the side with fewer observations stretched far from the center. Right skew: few observations with very high values pull the mean above the median. Real examples: income, wait times, number of claims, page load times — anything non-negative with some very large values. Left skew: few observations with very low values. Real examples: age at death (most people live to 70–90; few die very young), finishing times in a race where most are fast but a few are very slow.",
      "**Before reading on, predict:** A histogram of exam scores shows most students scored 60–80, with very few scoring 90–100 and almost no one below 40. Is this right-skewed, left-skewed, or approximately symmetric? Where is the mean relative to the median?",
      "**Mean-median relationship and skew.** For right-skewed distributions: mean > median (high outliers/tail pulls mean up). For left-skewed: mean < median. For symmetric: mean ≈ median. This rule of thumb has exceptions (it fails for some unusual shapes) but is reliable for unimodal distributions. Checking mean vs. median is a quick skewness diagnostic before computing formal skewness.",
      "**Kurtosis: how heavy are the tails?** Kurtosis measures whether data has more or fewer extreme values than a normal distribution. A normal distribution has kurtosis = 3 (or excess kurtosis = 0 in the centered convention). Leptokurtic (excess kurtosis > 0): taller peak, heavier tails — more extreme values than normal (e.g., financial returns, call center wait times). Platykurtic (excess kurtosis < 0): flatter peak, lighter tails — fewer extreme values (e.g., uniform distributions, bounded exam scores). In practice, kurtosis matters most in risk modeling and outlier-sensitive analyses.",
      "**Bimodal distributions: two populations.** A histogram with two peaks (bimodal) often indicates two subpopulations mixed together. Examples: height of adults (slight bimodal peak from mixing male/female distributions), exam scores when two preparation levels exist, product prices across two market segments. When you see bimodality, investigate whether splitting the data by a categorical variable reveals two cleaner unimodal distributions.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Diagnose Distribution Shape from a Histogram",
        body: "Step 1. Count the peaks. One peak: unimodal. Two peaks: bimodal (investigate subgroups). More: multimodal.\n\nStep 2. For unimodal distributions, look at symmetry:\n- Is the peak centered? Long right tail → right-skewed. Long left tail → left-skewed. Equal tails → symmetric.\n\nStep 3. Compare mean and median:\n- mean > median: likely right-skewed.\n- mean < median: likely left-skewed.\n- mean ≈ median: likely symmetric.\n\nStep 4. Assess normality:\n- Roughly bell-shaped and symmetric → may be approximately normal.\n- Check using histogram overlay or a formal test for larger samples.\n\nStep 5. Note any outliers (extreme isolated bars). Outliers affect both mean and SD but not median and IQR.",
      },
      {
        type: "insight",
        title: "Why Skewness Matters for Analysis Choice",
        body: 'For right-skewed data:\n- The mean is pulled toward the tail; it does not represent the typical value.\n- SD is inflated by extreme values.\n- Use: median + IQR, log transformation before using mean+SD, non-parametric tests.\n\nFor symmetric (approximately normal) data:\n- Mean is the best center estimate; SD captures spread faithfully.\n- Use: mean + SD, confidence intervals, t-tests, ANOVA.\n\nFor left-skewed data:\n- Mean is pulled down. Reflect: is the left tail real? Or is there a floor effect (e.g., age at death cannot be negative)?\n- Use: median + IQR, or transformation.\n\nGetting this wrong is consequential: reporting mean±SD for right-skewed data like income or wait times gives a misleading picture that inflates the "typical" value.',
      },
      {
        type: "warning",
        title: "Normality ≠ Perfect Bell Shape",
        body: '"Approximately normal" means close enough to normal that normal-distribution-based methods are reliable. It does not require a perfect bell curve. A histogram with slight asymmetry and n=100 can still justify t-tests and confidence intervals.\n\nPractical guideline:\n- n < 15: distribution must look nearly perfectly normal to use normal-based methods.\n- 15 ≤ n < 40: mild skewness is tolerable (Central Limit Theorem starts to help).\n- n ≥ 40: significant skewness can still be tolerated because the sampling distribution of the mean becomes approximately normal (Central Limit Theorem).\n\nFor strongly skewed data (e.g., income, claims), always prefer non-parametric or log-transformation approaches regardless of n.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Pearson's moment coefficient of skewness.** For a sample: $\\text{Skewness} = \\frac{n}{(n-1)(n-2)} \\sum_{i=1}^n \\left(\\frac{x_i - \\bar{x}}{s}\\right)^3$. Simpler approximation for interpretation: $\\text{Skewness} \\approx \\frac{1}{n} \\sum_i \\left(\\frac{x_i - \\bar{x}}{s}\\right)^3$. Positive skewness → right tail. Negative → left tail. Values between −0.5 and +0.5 are considered approximately symmetric; −1 to −0.5 or +0.5 to +1 are moderately skewed; beyond ±1 is highly skewed.",
      "**Kurtosis and excess kurtosis.** Sample kurtosis (raw): $\\text{Kurt} = \\frac{1}{n} \\sum_i \\left(\\frac{x_i - \\bar{x}}{s}\\right)^4$. Excess kurtosis (more common in software): $\\text{ExcessKurt} = \\text{Kurt} - 3$. The normal distribution has kurtosis = 3, excess kurtosis = 0. Positive excess kurtosis → heavier tails than normal (leptokurtic). Negative → lighter tails (platykurtic).",
      "**The normal distribution.** A distribution is normal (Gaussian) if it has the density $f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$. Key properties: perfectly symmetric (skewness = 0), kurtosis = 3, mean = median = mode, defined by just two parameters (μ and σ). The empirical rule (68-95-99.7) holds exactly for the normal distribution. Many real phenomena approximate normality due to the Central Limit Theorem.",
    ],
  },

  rigor: {
    prose: [
      "**R1 — Shapiro-Wilk normality test.** The Shapiro-Wilk test computes a W statistic comparing the sample to what a normal sample of the same size would look like. W close to 1 → approximately normal. Small W → non-normal. The test has low power for small n (almost anything passes) and almost always rejects for large n (trivial departures from normality detected). For n > 200, normality plots (Q-Q plots) are more informative than the test.",
      "**R2 — Central Limit Theorem preview.** Even if individual observations are not normally distributed, the sample mean $\\bar{X}$ of n independent observations from any distribution with finite mean μ and variance σ² will be approximately normally distributed for large n: $\\bar{X} \\approx N(\\mu, \\sigma^2/n)$. This is why normality of raw data matters less when n is large — statistical tests on means are robust to non-normality at large n.",
    ],
    visualizations: [],
  },

  python: {
    cells: [
      {
        id: "stat3-006-cell-1",
        type: "python",
        cellTitle: "Compare shapes: right-skewed vs. symmetric vs. left-skewed",
        code: `import random
random.seed(42)

def sample_mean(data): return sum(data)/len(data)
def sample_median(data):
    s = sorted(data); n = len(s)
    return (s[n//2-1]+s[n//2])/2 if n%2==0 else s[n//2]
def sample_sd(data):
    m = sample_mean(data)
    return (sum((x-m)**2 for x in data)/(len(data)-1))**0.5
def skewness(data):
    m = sample_mean(data); s = sample_sd(data); n = len(data)
    return sum(((x-m)/s)**3 for x in data)/n

# Right-skewed: income-like (exponential)
import math
right_skewed = [round(-50*math.log(random.random()), 1) for _ in range(200)]
right_skewed = [min(x, 300) for x in right_skewed]  # cap extreme outliers for display

# Symmetric: exam scores (normal-ish)
symmetric = [round(70 + random.gauss(0, 10), 1) for _ in range(200)]

# Left-skewed: reflect right-skewed
left_skewed = [100 - x for x in [round(-30*math.log(random.random()),1) for _ in range(200)]]
left_skewed = [max(x, -50) for x in left_skewed]

datasets = [
    ("Right-skewed (income-like)", right_skewed, "steelblue"),
    ("Symmetric (exam scores)",    symmetric,    "seagreen"),
    ("Left-skewed (reflected)",    left_skewed,  "tomato"),
]

for name, data, color in datasets:
    m = sample_mean(data)
    med = sample_median(data)
    sk = skewness(data)
    print(f"{name}:")
    print(f"  Mean={m:.1f}, Median={med:.1f}, Skewness={sk:.2f}")
    print(f"  Mean {'>' if m>med else '<' if m<med else '='} Median → {'right' if m>med else 'left' if m<med else 'symmetric'} skew")
    print()
`,
        instructions:
          "Run the cell and verify: for right-skewed data, mean > median. For left-skewed, mean < median. For symmetric, mean ≈ median. The skewness coefficient confirms: positive for right, negative for left, near 0 for symmetric.",
      },
      {
        id: "stat3-006-cell-2",
        type: "python",
        cellTitle: "Visualize three distribution shapes with histograms",
        code: `import random, math
import matplotlib.pyplot as plt

random.seed(42)

# Right-skewed
right = [round(-40*math.log(random.random()), 1) for _ in range(150)]
right = [min(x, 200) for x in right]

# Symmetric
sym = [round(100 + random.gauss(0, 15), 1) for _ in range(150)]

# Bimodal (two groups mixed)
group1 = [round(60 + random.gauss(0, 8), 1) for _ in range(75)]
group2 = [round(100 + random.gauss(0, 8), 1) for _ in range(75)]
bimodal = group1 + group2

fig, axes = plt.subplots(1, 3, figsize=(13, 4))

axes[0].hist(right, bins=14, color="steelblue", edgecolor="white", alpha=0.85)
axes[0].set_title("Right-Skewed Distribution", fontsize=10)
axes[0].set_xlabel("Value"); axes[0].set_ylabel("Count")

axes[1].hist(sym, bins=14, color="seagreen", edgecolor="white", alpha=0.85)
axes[1].set_title("Symmetric (Approx. Normal)", fontsize=10)
axes[1].set_xlabel("Value")

axes[2].hist(bimodal, bins=16, color="goldenrod", edgecolor="white", alpha=0.85)
axes[2].set_title("Bimodal Distribution (Two Groups)", fontsize=10)
axes[2].set_xlabel("Value")

for ax in axes:
    ax.yaxis.grid(True, linestyle="--", alpha=0.4)

plt.tight_layout()
plt.show()
`,
        instructions:
          "Note the three very different shapes: right-skewed has a long right tail; symmetric is bell-shaped; bimodal has two distinct peaks. A boxplot of the bimodal data would show a single box and might not reveal the two peaks at all — this is why histogram + boxplot together tell a more complete story.",
      },
    ],
  },

  examples: [
    {
      id: "stat3-006-ex1",
      title: "Identify shape from mean, median, and histogram description",
      difficulty: "easy",
      problem:
        "Dataset: mean = $85,000, median = $52,000. A histogram shows a long right tail with most values between $30k and $70k and a few values above $200k. What is the shape, and which measure of center should you report?",
      steps: [
        {
          expression:
            "\\text{Mean} = \\$85k > \\text{Median} = \\$52k \\Rightarrow \\text{right-skewed}",
          annotation:
            "Mean exceeds median → positive (right) skew. The few very high values (>$200k) are pulling the mean above the median.",
          strategyTitle: "Step 1: Mean vs. median",
        },
        {
          expression: "\\text{Long right tail confirmed by histogram}",
          annotation:
            "The histogram description matches: most values clustered in lower range, long thin tail to the right. This is the classic income distribution shape.",
          strategyTitle: "Step 2: Histogram confirmation",
        },
        {
          expression:
            "\\text{Report: Median = \\$52k (with IQR), NOT Mean = \\$85k}",
          annotation:
            "The median ($52k) represents the typical person's income — 50% earn less and 50% earn more. The mean ($85k) is inflated by a small number of very high earners and does not represent the typical experience. For right-skewed distributions, always prefer median + IQR.",
          strategyTitle: "Step 3: Which measure to report",
        },
      ],
    },
    {
      id: "stat3-006-ex2",
      title: "Compute and interpret skewness coefficient",
      difficulty: "medium",
      problem:
        "Dataset: [2, 3, 3, 4, 4, 4, 5, 5, 6, 14]. Mean = 5.0, SD ≈ 3.17. Compute skewness and classify the shape.",
      steps: [
        {
          expression:
            "\\text{Deviations from mean: } [-3, -2, -2, -1, -1, -1, 0, 0, 1, 9]",
          annotation:
            "Compute xᵢ − x̄ for each value. The last deviation (14−5=9) is much larger in magnitude than the others.",
          strategyTitle: "Step 1: Deviations",
        },
        {
          expression:
            "z_i = d_i / s \\approx [-0.95, -0.63, -0.63, -0.32, -0.32, -0.32, 0, 0, 0.32, 2.84]",
          annotation: "Divide each deviation by s = 3.17 to get z-scores.",
          strategyTitle: "Step 2: Standardize",
        },
        {
          expression:
            "\\text{Skewness} \\approx \\frac{1}{10} \\sum z_i^3 = \\frac{1}{10}(-0.86 -0.25 -0.25 -0.03 \\cdots + 22.90) \\approx 2.15",
          annotation:
            "The cubed z-score for the outlier 14 is 2.84³ ≈ 22.9, which dominates the sum. Skewness ≈ +2.15 → highly right-skewed. The single outlier at 14 drives most of the skewness.",
          strategyTitle: "Step 3: Skewness",
        },
        {
          expression:
            "\\text{Skewness} > 1 \\Rightarrow \\text{highly right-skewed. Report median (4.5) + IQR.}",
          annotation:
            "Skewness = +2.15 is well above +1 → highly skewed. The mean (5.0) is pulled above the median (4.5) by the outlier 14. Report median + IQR for this dataset.",
          strategyTitle: "Step 4: Classify and recommend",
        },
      ],
    },
    {
      id: "stat3-006-ex3",
      title: "Bimodal detection and interpretation",
      difficulty: "medium",
      problem:
        "A histogram of customer transaction sizes shows two peaks: one around $15 and another around $85, with a valley between $40–60. Describe the shape and what it likely means.",
      steps: [
        {
          expression:
            "\\text{Two peaks (bimodal): low-value cluster} \\approx \\$15, \\text{ high-value cluster} \\approx \\$85",
          annotation:
            "Bimodal histogram: two distinct modes, separated by a valley. Neither a skewness nor a normality description is useful here.",
          strategyTitle: "Step 1: Identify shape",
        },
        {
          expression:
            "\\text{Mean} \\approx \\$50 \\text{ — falls in the valley between peaks}",
          annotation:
            "The mean is approximately in the middle but represents almost no actual customers. Both the mean and median are in the low-transaction zone of the data, which is nearly empty.",
          strategyTitle: "Step 2: Why mean misleads",
        },
        {
          expression:
            "\\text{Likely cause: two customer segments (e.g., individual vs. business customers)}",
          annotation:
            "Bimodality usually indicates mixed populations. Separate the data by customer type (individual vs. business), purchase channel (online vs. in-store), or another categorical variable. Each subgroup likely has a clean unimodal distribution.",
          strategyTitle: "Step 3: Interpret and investigate",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat3-006-ch1",
      title: "Explain conflicting signals between mean-median and skewness",
      difficulty: "hard",
      problem:
        "Dataset: [10, 20, 20, 25, 25, 25, 30, 30, 35, 35, 35, 35, 40, 40, 80]. Mean=32.3, Median=32.0. The mean and median are nearly identical. Skewness coefficient = +0.95. Is the distribution skewed or symmetric? Which should you trust?",
      walkthrough: [
        {
          expression:
            "\\text{Mean} = 32.3 \\approx \\text{Median} = 32.0 \\Rightarrow \\text{suggests symmetric}",
          annotation:
            "Mean-median comparison says: nearly symmetric (difference is only 0.3 points).",
        },
        {
          expression:
            "\\text{Skewness} = +0.95 \\Rightarrow \\text{moderately right-skewed}",
          annotation:
            "The skewness coefficient says: moderately right-skewed. Conflict with mean-median test.",
        },
        {
          expression:
            "\\text{Why: outlier at 80 pulls mean up, but median is robust and stays at 32}",
          annotation:
            "The value 80 is a right-tail outlier. It pulls the mean up slightly (32 → 32.3), but with n=15, the effect is small. However, the cubed deviation for 80 is enormous: z = (80−32.3)/SD... this dominates the skewness numerator. The skewness captures the asymmetry even when mean and median are close.",
        },
        {
          expression:
            "\\text{Trust skewness coefficient over mean-median for formal assessment. Also draw histogram.}",
          annotation:
            'The mean-median rule is a rough heuristic. The skewness coefficient at +0.95 (just below the "highly skewed" threshold of +1) correctly identifies asymmetry. A histogram would show the long right tail clearly. Bottom line: the distribution is moderately right-skewed, and you should report median+IQR or investigate the value 80 as a potential outlier.',
        },
      ],
      answer:
        "The distribution is moderately right-skewed (skewness=+0.95). The mean-median test underestimates skewness here because n is small and the outlier effect on the mean is small. The skewness coefficient and histogram are more reliable for formal assessment.",
    },
    {
      id: "stat3-006-ch2",
      title: "Identify transformation strategy for right-skewed data",
      difficulty: "medium",
      problem:
        "Response times (ms) for a web server: [12, 15, 18, 20, 22, 25, 28, 30, 35, 150, 200, 350]. Mean=75.4, Median=26.5, Skewness≈2.1. What would log-transforming this data accomplish, and when would you use it?",
      walkthrough: [
        {
          expression:
            "\\text{Log of response times: } [2.49, 2.71, 2.89, 3.00, 3.09, 3.22, 3.33, 3.40, 3.56, 5.01, 5.30, 5.86]",
          annotation:
            "Taking natural log of each value (ln(12)=2.49, etc.). The extreme values 150, 200, 350 become 5.01, 5.30, 5.86 — much closer to the rest of the data.",
        },
        {
          expression:
            "\\text{Log-transformed: } \\bar{x}_{\\log} = 3.74, \\text{ approximately symmetric}",
          annotation:
            "The log-transformed distribution is much more symmetric. The skewness drops dramatically. Log transformation compresses the right tail.",
        },
        {
          expression:
            "\\text{Use log-transform when: } (1) \\text{ data is right-skewed, } (2) \\text{ all values positive, } (3) \\text{ ratios are meaningful}",
          annotation:
            'Log transform is appropriate when: data is strictly positive (you cannot log-transform zeros or negatives without adjustment), right skew is present, and multiplicative relationships make sense (doubling response time is twice as bad). For response times, log-scale makes intuitive sense: the difference between 10ms and 20ms feels equivalent to the difference between 100ms and 200ms — both are "2× slower."',
        },
      ],
      answer:
        "Log transformation compresses the right tail, making the distribution approximately symmetric. This enables use of mean+SD and normal-based tests. Valid when all values are positive and multiplicative relationships are meaningful (response times, income, prices).",
    },
    ,
    {
      id: "stat3-006-ch3",
      title: "Applied Data Challenge",
      difficulty: "hard",
      problem:
        "Use a CSV dataset from data/applied-statistics, apply this lesson's core method, and report one result plus one limitation.",
      walkthrough: [
        {
          expression: "Import -> clean -> compute -> interpret",
          annotation: "Show each stage and justify one design choice.",
        },
      ],
      answer:
        "A complete response includes a reproducible computation, contextual interpretation, and a limitation statement tied to assumptions.",
    },
  ],

  definitions: [
    {
      term: "skewness",
      definition: "A measure of the asymmetry of a distribution. Positive skewness (right skew): long tail to the right, mean > median. Negative skewness (left skew): long tail to the left, mean < median. Values between −0.5 and +0.5 are considered approximately symmetric.",
    },
    {
      term: "right skew",
      definition: "A distribution where the tail extends to the right (toward high values). Caused by a small number of very large values. Mean > median. Common in income, wait times, and count data. Also called positive skew.",
    },
    {
      term: "left skew",
      definition: "A distribution where the tail extends to the left (toward low values). Mean < median. Common in age-at-death, scores near a ceiling, or data with a natural upper bound. Also called negative skew.",
    },
    {
      term: "kurtosis",
      definition: "A measure of tail heaviness relative to a normal distribution. The normal has kurtosis = 3 (excess kurtosis = 0). Leptokurtic (excess kurtosis > 0): heavier tails, taller peak, more extreme values. Platykurtic (excess kurtosis < 0): lighter tails, flatter peak.",
    },
    {
      term: "bimodal distribution",
      definition: "A distribution with two distinct peaks (modes) separated by a valley. Usually indicates two subpopulations have been mixed in the dataset. The mean and median fall in the valley and do not represent either peak.",
    },
    {
      term: "normal distribution",
      definition: "A symmetric, bell-shaped distribution fully described by mean μ and SD σ. Skewness = 0, kurtosis = 3, mean = median = mode. The empirical rule (68-95-99.7) holds exactly. Many statistical methods assume normality of data or of sampling distributions.",
    },
  ],

  semantics: {
    core: [
      {
        symbol: "\\text{Skewness} > 0",
        meaning:
          "Right (positive) skew: longer tail to the right; mean > median.",
      },
      {
        symbol: "\\text{Skewness} < 0",
        meaning:
          "Left (negative) skew: longer tail to the left; mean < median.",
      },
      {
        symbol: "\\text{|Skewness|} < 0.5",
        meaning: "Approximately symmetric.",
      },
      {
        symbol: "\\text{Excess kurtosis} > 0",
        meaning:
          "Leptokurtic: heavier tails than normal (more extreme values).",
      },
      {
        symbol: "\\text{Excess kurtosis} < 0",
        meaning:
          "Platykurtic: lighter tails than normal (fewer extreme values).",
      },
      {
        symbol: "\\text{Bimodal}",
        meaning: "Two distinct peaks — likely indicates two subpopulations.",
      },
    ],
    rulesOfThumb: [
      "Right skew: mean > median. Left skew: mean < median. Symmetric: mean ≈ median.",
      "Skewness |value| < 0.5: symmetric. 0.5–1: moderate. > 1: high skew.",
      "Right-skewed → use median + IQR (not mean + SD).",
      "Bimodal → investigate subgroups (split by categorical variable).",
      "Normal approximation: safe for n ≥ 40 regardless of shape (CLT). Requires near-normality for n < 15.",
      "Log transformation: right-skewed, strictly positive data.",
    ],
  },

  spiral: {
    recoveryPoints: [],
    futureLinks: [
      {
        lessonId: "stat5-002",
        label: "Normal Distribution",
        note: "stat5-002 formally derives normal distribution properties and z-to-percentile conversions used throughout inference.",
      },
      {
        lessonId: "stat6-001",
        label: "Introduction to Inference",
        note: "The normality assumption underlies t-tests, ANOVA, and confidence intervals. Distribution shape determines whether these methods are appropriate.",
      },
      {
        lessonId: "stat12-001",
        label: "Transformations",
        note: "Log, square root, and Box-Cox transformations address skewness to enable use of normal-based methods.",
      },
    ],
  },

  checkpoints: [
    {
      id: "cp-stat3-006-1",
      label:
        "Read: list the four basic distribution shapes and name a real-world example of each",
      type: "read",
    },
    {
      id: "cp-stat3-006-2",
      label: "Read: state the mean-median rule for identifying skew direction",
      type: "read",
    },
    {
      id: "cp-stat3-006-3",
      label:
        "Apply example 1: predict the shape and which measure to report before reading",
      type: "example",
    },
    {
      id: "cp-stat3-006-4",
      label:
        "Lab: run cell 1 and verify all three skewness signs match predictions",
      type: "lab",
    },
    {
      id: "cp-stat3-006-5",
      label:
        "Apply example 3: describe what two-peaked histogram signals before reading",
      type: "example",
    },
    {
      id: "cp-stat3-006-6",
      label:
        "Lab: run cell 2 and describe the visual difference between all three histogram shapes",
      type: "lab",
    },
    {
      id: "cp-stat3-006-7",
      label:
        "Attempt challenge 1: explain which signal to trust when mean-median disagrees with skewness coefficient",
      type: "challenge",
    },
    {
      id: "cp-stat3-006-8",
      label:
        "Read: state when log transformation is appropriate and when it is not",
      type: "read",
    },
  ],

  assessment: {
    questions: [
      {
        id: "stat3-006-assess-1",
        type: "choice",
        text: "A distribution has mean = 42 and median = 58. The shape is most likely:",
        options: [
          "Right-skewed (positive skew)",
          "Left-skewed (negative skew)",
          "Symmetric",
          "Bimodal",
        ],
        answer: "Left-skewed (negative skew)",
        instructions:
          "Mean < median → left-skewed. The mean is pulled down by a left tail of low values.",
      },
    ],
  },

  quiz: [
    {
      id: "stat3-006-quiz-1",
      type: "choice",
      text: "A histogram of household incomes is strongly right-skewed. Which summary statistics should you report?",
      options: [
        "Mean and standard deviation",
        "Median and IQR",
        "Mode and range",
        "Mean and IQR",
      ],
      answer: "Median and IQR",
      hints: [
        "Right skew → mean is inflated by high earners. Median is resistant.",
        "Pair median with IQR (both resistant) for skewed distributions.",
      ],
      reviewSection:
        "Insight callout — Why Skewness Matters for Analysis Choice",
    },
    {
      id: "stat3-006-quiz-2",
      type: "choice",
      text: "A skewness coefficient of −1.8 indicates:",
      options: [
        "Approximately symmetric data",
        "Moderately right-skewed data",
        "Highly left-skewed data",
        "Bimodal data",
      ],
      answer: "Highly left-skewed data",
      hints: ["Negative skewness → left skew.", "|−1.8| > 1 → highly skewed."],
      reviewSection: "Math section — Pearson's moment coefficient of skewness",
    },
    {
      id: "stat3-006-quiz-3",
      type: "choice",
      text: "A leptokurtic distribution (positive excess kurtosis) has:",
      options: [
        "Lighter tails than a normal distribution",
        "No tails",
        "Heavier tails and a taller peak than a normal distribution",
        "The same tails as a normal distribution",
      ],
      answer: "Heavier tails and a taller peak than a normal distribution",
      hints: [
        "Leptokurtic = positive excess kurtosis.",
        "More extreme values (heavy tails) and a sharper central peak.",
      ],
      reviewSection: "Math section — Kurtosis and excess kurtosis",
    },
    {
      id: "stat3-006-quiz-4",
      type: "choice",
      text: "A histogram shows two distinct peaks separated by a valley. This is called:",
      options: ["Right-skewed", "Leptokurtic", "Bimodal", "Platykurtic"],
      answer: "Bimodal",
      hints: [
        "Two peaks = bimodal.",
        "This often indicates two subpopulations mixed in the dataset.",
      ],
      reviewSection: 'Intuition → "Bimodal distributions: two populations"',
    },
    {
      id: "stat3-006-quiz-5",
      type: "choice",
      text: "For a normal distribution, which statement is true?",
      options: [
        "Mean < median",
        "Skewness = 0 and mean = median = mode",
        "Kurtosis = 0",
        "All values fall within 1 SD of the mean",
      ],
      answer: "Skewness = 0 and mean = median = mode",
      hints: [
        "Normal distribution: perfectly symmetric → skewness=0.",
        "Symmetric + unimodal → mean = median = mode.",
      ],
      reviewSection: "Math section — The normal distribution",
    },
    {
      id: "stat3-006-quiz-6",
      type: "choice",
      text: "When is log transformation most appropriate?",
      options: [
        "Left-skewed data with negative values",
        "Right-skewed data with all positive values",
        "Symmetric data to make it more normal",
        "Bimodal data to merge the two peaks",
      ],
      answer: "Right-skewed data with all positive values",
      hints: [
        "Log is only defined for positive values (log(0) and log(negative) are undefined).",
        "Log compresses the right tail of positively skewed data.",
      ],
      reviewSection: "Challenge 2 — log transformation",
    },
    {
      id: "stat3-006-quiz-7",
      type: "choice",
      text: "Which distribution has mean < median?",
      options: ["Right-skewed", "Left-skewed", "Symmetric", "Uniform"],
      answer: "Left-skewed",
      hints: [
        "Left skew = negative skew = long left tail. Rare low values pull the mean down.",
        "Mean < median → left skew. Mean > median → right skew.",
      ],
      reviewSection: "Intuition — Mean-median relationship and skew",
    },
    {
      id: "stat3-006-quiz-8",
      type: "choice",
      text: "A skewness coefficient of +0.3 is classified as:",
      options: [
        "Highly right-skewed",
        "Moderately right-skewed",
        "Approximately symmetric",
        "Highly left-skewed",
      ],
      answer: "Approximately symmetric",
      hints: [
        "Rule: |skewness| < 0.5 → approximately symmetric.",
        "+0.3 is between −0.5 and +0.5, so the distribution is considered approximately symmetric.",
      ],
      reviewSection: "Math section — Pearson's moment coefficient of skewness",
    },
    {
      id: "stat3-006-quiz-9",
      type: "choice",
      text: "The Central Limit Theorem allows using normal-based methods (confidence intervals, t-tests) even when raw data is right-skewed, provided:",
      options: [
        "n ≥ 10",
        "n ≥ 40 (approximately)",
        "The data has no outliers",
        "The mode equals the median",
      ],
      answer: "n ≥ 40 (approximately)",
      hints: [
        "The CLT says that the sampling distribution of the mean becomes approximately normal for large n.",
        "Rough rule: n ≥ 40 makes the CLT reliable even for moderately skewed data. Heavy skew may require n > 100.",
      ],
      reviewSection: "Rigor section — Central Limit Theorem preview",
    },
    {
      id: "stat3-006-quiz-10",
      type: "choice",
      text: "A histogram has two distinct peaks with a valley between them. The best next step is:",
      options: [
        "Report the mean as the center",
        "Apply a log transformation",
        "Split the data by a relevant categorical variable to investigate subgroups",
        "Remove values in the valley as outliers",
      ],
      answer: "Split the data by a relevant categorical variable to investigate subgroups",
      hints: [
        "Two peaks suggest two populations are mixed together.",
        "Splitting by gender, region, product type, etc. often reveals two clean unimodal distributions.",
      ],
      reviewSection: "Intuition — Bimodal distributions: two populations",
    },
  ],

  misconceptions: [
    {
      falseBelief:
        "If mean ≈ median, the distribution must be approximately normal.",
      whyStudentsThinkIt:
        'Students learn "symmetric → mean ≈ median" and reverse the implication.',
      correctionExample:
        "A bimodal distribution with two equal-sized symmetric peaks will have mean ≈ median. A uniform distribution (all values equally likely) also has mean = median but is not normal at all. Even a right-skewed distribution with a specific outlier can have mean temporarily equaling the median for a particular sample.",
      contrastCase:
        "A histogram is needed to assess normality — mean ≈ median is a necessary but not sufficient condition for symmetry. For symmetry: mean ≈ median AND histogram is symmetric. For normality: additionally bell-shaped (single peak, specific curvature).",
    },
    {
      falseBelief: "The tail of a distribution is where most data is.",
      whyStudentsThinkIt:
        '"Tail" sounds like a large appendage. Students confuse the tail (where few values are) with the bulk (where most values are).',
      correctionExample:
        'Right-skewed: most income earners are in the left/lower portion of the distribution; the tail is the small fraction with very high incomes. The tail is "long and thin" — it extends far but contains few observations. The bulk of data is in the main body (left side for right-skewed).',
      contrastCase:
        'The direction of the skew names the tail (not the bulk): right-skewed = tail to the right (high values), even though most data is to the left. Think of the tail as the direction the distribution is "pointing."',
    },
    {
      falseBelief:
        "Skewness and kurtosis together fully describe a distribution's shape.",
      whyStudentsThinkIt:
        "Both are described as shape measures, so students assume they are a complete description.",
      correctionExample:
        "Skewness=0 and kurtosis=3 (matching normal distribution moments) does NOT mean the distribution is normal. Example: a bimodal distribution symmetric around zero can have skewness=0 and kurtosis=3 by coincidence yet be completely non-normal. The first four moments (mean, variance, skewness, kurtosis) do not uniquely determine a distribution.",
      contrastCase:
        "A complete description of shape requires the full distribution: histogram, empirical CDF, or density estimate. Skewness and kurtosis are summary diagnostics — useful first checks but not sufficient for full characterization.",
    },
  ],

  transferPrompts: [
    {
      situation:
        'A marketing analyst reports that the "average" time users spend on a website is 8 minutes. A data scientist notes the distribution of session times is heavily right-skewed, with most sessions under 2 minutes and a few users spending 60+ minutes.',
      competingTechniques: [
        "Report the mean (8 minutes) as the typical session time",
        "Report the median (1.5 minutes) and 75th percentile (4 minutes)",
        "Log-transform session times and report transformed mean",
      ],
      whyThisTechniqueWins:
        'Report median + upper percentiles: the median (1.5 min) honestly represents the typical user experience. The 75th percentile (4 min) shows what "active users" look like. The mean (8 min) is inflated by a small number of power users and does not represent the typical visitor. Product decisions should be based on the typical user (median), with separate analysis for high-engagement users (upper percentiles). The log-transformed mean (step 3) would help with statistical modeling but is hard to communicate to stakeholders.',
    },
    {
      situation:
        "A financial analyst is modeling daily stock returns to assess risk. The returns appear slightly right-skewed with heavy tails (excess kurtosis = 4.2).",
      competingTechniques: [
        "Assume returns are normally distributed (standard model)",
        "Use a heavy-tailed distribution (t-distribution or stable distribution)",
        "Report median return only and ignore variance",
      ],
      whyThisTechniqueWins:
        'Heavy-tailed distribution: excess kurtosis = 4.2 means there are far more extreme daily moves than a normal distribution predicts. If you assume normality, you will dramatically underestimate the probability of a 5-sigma day (a market crash). In finance, this is called "fat tail risk." Using a t-distribution with ~3–5 degrees of freedom fits heavy-tailed returns better and gives more realistic risk estimates. The 2008 financial crisis was partly caused by risk models that assumed normality and underestimated tail risk.',
    },
  ],

  debugging: [
    {
      commonError:
        "Reporting mean ± SD for a right-skewed distribution with outliers.",
      symptom:
        "The mean ± 1 SD interval includes negative values for non-negative data (e.g., mean=20, SD=25 → interval [−5, 45]), which is impossible.",
      whyItHappened:
        "Mean and SD are computed correctly, but their interpretation assumes approximate normality. For right-skewed data, SD is inflated by the tail, making the interval extend to impossible regions.",
      repairStrategy:
        "Check skewness first: if |skewness| > 0.5, use median + IQR. If the data is non-negative (income, wait times, counts), and SD ≥ mean, the distribution is very right-skewed. Switch to median + IQR or log-transform and report exponentiated values (geometric mean and multiplicative factor).",
    },
    {
      commonError:
        "Concluding a distribution is normal because a small sample looks bell-shaped.",
      symptom:
        "With n=10, the histogram looks roughly symmetric, so you assume normality and proceed with a t-test.",
      whyItHappened:
        "With n=10, a histogram has very few bars and almost any data can look like a bell. The sample is too small to reveal the true population shape.",
      repairStrategy:
        "For n < 30, histograms are unreliable for assessing normality. Instead: (1) use a normal Q-Q plot (not covered until stat5); (2) apply domain knowledge (is income-like data always right-skewed?); (3) use non-parametric tests as a robustness check. For n < 15, assume non-normality unless domain evidence strongly suggests otherwise.",
    },
  ],

  mastery: {
    targetLevel:
      "Apply (Level 3) — classify distribution shapes from histograms, summary statistics, and skewness coefficients; select appropriate summary statistics based on shape; recognize bimodality and its implications.",
    solveIndependently:
      "Given a histogram (or mean, median, and skewness coefficient), classify the shape as symmetric/right-skewed/left-skewed/bimodal, explain why, and select the correct summary statistics (mean+SD vs. median+IQR).",
    explainVerbally:
      "Explain why right-skewed data requires median+IQR instead of mean+SD, and what bimodality likely signals about the data collection process.",
    detectIncorrectApplication:
      "Identify errors when: (1) mean±SD is reported for right-skewed income data; (2) a bimodal distribution is described as symmetric; (3) the Empirical Rule is applied to a heavily skewed distribution.",
    transferToUnfamiliar:
      "Given a novel dataset (web server response times, medical test results, sales transactions), compute or estimate skewness, classify the shape, choose appropriate summary statistics, and recommend whether log-transformation or non-parametric methods are warranted.",
  },
};
