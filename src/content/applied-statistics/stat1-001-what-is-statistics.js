export default {
  // ── Identity ───────────────────────────────────────────────────
  id: "stat1-001",
  slug: "what-is-statistics",
  chapter: "stat1",
  order: 1,
  title: "What Is Statistics?",
  subtitle:
    "Descriptive vs inferential reasoning, populations vs samples, and the four types of data.",
  tags: [
    "statistics",
    "descriptive",
    "inferential",
    "population",
    "sample",
    "data types",
  ],
  aliases:
    "introduction to statistics descriptive inferential population sample nominal ordinal interval ratio",
  timeToComplete: 25,
  coreConcept:
    "Statistics is the science of learning from data under uncertainty. Descriptive statistics summarizes what you have; inferential statistics uses a sample to draw conclusions about a population you cannot fully observe.",
  prerequisites: [],
  nextLesson: "stat1-002",

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question:
      "How can testing 1,000 people tell you anything reliable about 330 million?",
    realWorldContext:
      "Before every U.S. election, polling organizations survey roughly 1,000 randomly selected voters and predict outcomes for the entire country — within ±3 percentage points, 95% of the time. A pharmaceutical company tests a new drug on 400 patients, not 40 million, and the FDA uses that data to decide whether everyone can take it. A quality-control engineer measures 50 bolts from a production run of 500,000 and decides whether the entire batch ships. In every case, the pattern is identical: collect a small, carefully chosen slice of reality, apply statistical reasoning, and make confident statements about the whole. That is statistics.",
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      "**Roadmap for first-time learners.** By the end of this lesson, you should be able to do three things: (1) separate descriptive claims from inferential claims, (2) tell population from sample, and (3) classify a variable as nominal, ordinal, interval, or ratio. If you can do those three moves, you can read most introductory statistics results without getting tricked by bad wording.",
      "**Start with a concrete question.** A school district wants to know the average amount of time its 12,000 students spend on homework each night. Surveying all 12,000 is expensive and slow. Instead, a researcher randomly selects 120 students and records their nightly homework times: 45 min, 70 min, 30 min, 90 min, … After collecting all 120 values, the researcher calculates the average: 62 minutes. This single number — 62 — summarizes the 120 observations. That summarizing act is **descriptive statistics**.",
      '**The inferential leap.** The researcher then says: "Based on our sample of 120, we estimate that the average homework time for all 12,000 students in the district is approximately 62 minutes, give or take 8 minutes." She has used the sample to make a claim about the *population* she did not fully observe. That claim — with its uncertainty margin — is **inferential statistics**. Notice: the 62-minute average is a fact about the 120 students she measured. The "give or take 8 minutes" is not a fact — it is a calibrated uncertainty about the 12,000.',
      '**Before reading on, predict:** if the researcher had sampled 480 students instead of 120 — four times as many — would the "give or take" margin get larger, stay the same, or get smaller? Write your prediction before continuing.',
      "**Larger samples shrink uncertainty.** The margin of error in estimation shrinks like $1/\\sqrt{n}$, where $n$ is the sample size. Quadrupling $n$ from 120 to 480 halves the margin: from ±8 minutes to approximately ±4 minutes. This is one of the most important quantitative facts in all of statistics. More data = less uncertainty, but with diminishing returns — you need to quadruple the sample to halve the error.",
      "**Population vs. sample — always clarify which you have.** The **population** is every unit you want to draw conclusions about (all 12,000 students). The **sample** is the subset you actually measured (120 students). A **parameter** is a numerical fact about the population — for example, the true average $\\mu$ (Greek letter mu) for all 12,000 students. A **statistic** is a numerical fact about the sample — for example, the sample average $\\bar{x}$ (x-bar) computed from the 120 measurements. The fundamental goal of inferential statistics is to estimate population parameters using sample statistics.",
      '**Four types of data — the measurement scale matters.** Before computing anything, identify what kind of data you have. The four scales, from least to most mathematically powerful:\n\n**Nominal:** categories with no natural order. Examples: blood type (A, B, AB, O), country of birth, eye color. You can count and find the mode. You cannot add, subtract, or order meaningfully.\n\n**Ordinal:** categories with a natural order but unknown gap sizes. Examples: survey ratings (Disagree / Neutral / Agree), academic letter grades, pain scales (1–10). You can rank and find the median. You cannot assume the gap between "Agree" and "Neutral" equals the gap between "Neutral" and "Disagree."\n\n**Interval:** ordered values with equal, meaningful gaps — but no true zero. Examples: temperature in Celsius, calendar year. You can add and subtract. The difference between 20°C and 30°C is the same as between 30°C and 40°C. But 40°C is not "twice as hot" as 20°C — because 0°C is not the absence of heat.\n\n**Ratio:** interval scale plus a true zero, meaning zero means "none of the quantity." Examples: height in cm, reaction time in seconds, income in dollars, number of absences. All arithmetic operations are valid. A student absent 6 days was absent twice as long as one absent 3 days.',
      "**Why the scale matters in practice.** Suppose you ask 200 patients to rate their pain on a 1–10 scale and want to summarize the results. Pain rating is **ordinal** — you can compute the median (the middle value when sorted) but computing the mean (arithmetic average) is technically invalid, because the gaps between integers are not guaranteed equal. In practice, researchers often compute the mean of ordinal data anyway and treat it as approximate. Knowing the scale tells you when that approximation is risky.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Classifying a Variable",
        body: 'Given a variable in a dataset, determine its measurement scale:\n\nStep 1. Can you categorize values but not order them? → **Nominal** (eye color, ZIP code).\nStep 2. Can you order but gaps are unequal or unknown? → **Ordinal** (satisfaction rating, class rank).\nStep 3. Can you add and subtract, but there is no meaningful zero? → **Interval** (temperature in °C, year).\nStep 4. Can you multiply and divide, and zero means "none"? → **Ratio** (mass, time, count, distance).\n\nDefault rule: if the variable is a count of something, it is almost always Ratio.',
      },
      {
        type: "insight",
        title: "Parameter vs. Statistic — a Notation Convention",
        body: "Population parameters are written with Greek letters: $\\mu$ (mean), $\\sigma$ (standard deviation), $\\rho$ (correlation).\nSample statistics are written with Latin letters: $\\bar{x}$ (sample mean), $s$ (sample standard deviation), $r$ (sample correlation).\nThis convention is universal in statistics. When you see $\\mu$, it refers to a population quantity you usually do not know. When you see $\\bar{x}$, it is something you computed from data you have.",
      },
      {
        type: "warning",
        title: "Confusing Sample and Population Claims",
        body: 'A common error: computing a sample statistic (e.g., $\\bar{x} = 62$) and then stating it as a population fact without qualification. Always distinguish:\n\n✗ "The average homework time is 62 minutes." (asserts a population fact from sample data)\n✓ "The sample average is 62 minutes; the estimated population mean is 62 ± 8 minutes (95% CI)."\n\nThe ± (confidence interval) is not optional decoration — it is the difference between a claim and a guess.',
      },
      {
        type: "insight",
        title: "Descriptive vs. Inferential — The Two Jobs",
        body: '**Descriptive statistics:** summarize and describe data you already have. Tools: mean, median, standard deviation, histogram, boxplot. No uncertainty claims.\n\n**Inferential statistics:** use a sample to make claims about a population or test hypotheses. Tools: confidence intervals, hypothesis tests, regression models. Always involves uncertainty.\n\nA single analysis can do both: "The 120 students averaged 62 minutes [descriptive]. We estimate the district-wide average is 62 ± 8 minutes [inferential]."',
      },
    ],
    visualizations: [
      {
        id: "stat1-001-viz-1",
        title: "Population, sample, and inference map",
        type: "diagram",
        purpose:
          "Contradicts the misconception that sample facts and population claims are the same statement.",
        misconceptionAddressed:
          "Students collapse x-bar and mu into one number and forget uncertainty.",
        invariant:
          "The sample statistic x-bar is fixed once the sample is collected; what changes is how uncertain we are about the population parameter mu.",
      },
      {
        id: "stat1-001-viz-2",
        title: "Measurement-scale decision ladder",
        type: "flowchart",
        purpose:
          "Prevents arithmetic errors by forcing a scale decision before calculation.",
        misconceptionAddressed:
          "If values are numeric, mean and ratios are always valid.",
        invariant:
          "As you move up nominal -> ordinal -> interval -> ratio, permitted operations strictly increase; lower-scale operations always remain valid.",
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────
  math: {
    prose: [
      "**Notation setup.** Let $N$ be the population size and $n$ the sample size, with $n \\ll N$. The $i$-th unit in the population has a value $x_i$. The population mean (parameter) is $\\mu = \\frac{1}{N}\\sum_{i=1}^{N} x_i$. We cannot compute this — we do not observe all $N$ values. Instead we draw a random sample $\\{x_1, x_2, \\ldots, x_n\\}$ (reusing indices for the sample) and compute the sample mean (statistic): $\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i$. The sample mean $\\bar{x}$ is an estimator of $\\mu$.",
      "**Measurement scales formalized.** A variable $X$ is:\n\n• **Nominal** if its range is a finite set $\\mathcal{C}$ with no order relation defined on $\\mathcal{C}$.\n• **Ordinal** if $\\mathcal{C}$ has a total order $\\leq$ but no metric (no notion of distance between elements).\n• **Interval** if $\\mathcal{C} \\subseteq \\mathbb{R}$ with a metric (differences are meaningful) but no fixed origin — any affine transformation $aX + b$ produces an equally valid measurement.\n• **Ratio** if $\\mathcal{C} \\subseteq [0, \\infty)$ and zero is a fixed, meaningful origin — only scale transformations $aX$ (no shift) are valid.",
      "**Why scales restrict operations.** Adding two ordinal values is meaningless because the scale has no metric. Computing a ratio of two interval values is meaningless because shifting the origin changes the ratio: $(40°C)/(20°C) = 2$, but $(104°F)/(68°F) \\approx 1.53$, even though 40°C = 104°F and 20°C = 68°F. Ratios are only stable across representations for ratio-scale variables.",
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────
  rigor: {
    prose: [
      "**P1 — Formal framing.** A statistical model consists of a sample space $\\Omega$, a $\\sigma$-algebra $\\mathcal{F}$ over $\\Omega$, and a family of probability measures $\\{P_\\theta : \\theta \\in \\Theta\\}$. The parameter $\\theta \\in \\Theta$ (the parameter space) indexes the uncertainty. Observed data $X_1, \\ldots, X_n$ are random variables on $(\\Omega, \\mathcal{F})$. Statistical inference is the problem of identifying, from observed values $x_1, \\ldots, x_n$, which element $\\theta^* \\in \\Theta$ generated the data.",
      "**P2 — Invariant: information never increases by aggregation.** Summarizing a dataset into a statistic can only reduce information — it can never add it. Fisher's concept of a **sufficient statistic** formalizes when a summary retains all the information in the data: $T(X_1,\\ldots,X_n)$ is sufficient for $\\theta$ if the conditional distribution of $(X_1,\\ldots,X_n) | T$ does not depend on $\\theta$. The sample mean is sufficient for $\\mu$ when data are normally distributed — knowing $\\bar{x}$ gives you everything the data can tell you about $\\mu$.",
      "**P3 — Geometric interpretation.** Think of $n$ observations as a single point in $\\mathbb{R}^n$. Descriptive statistics project this $n$-dimensional point onto a lower-dimensional subspace: the mean projects onto a line (the direction $(1,1,\\ldots,1)/\\sqrt{n}$); variance measures distance from that line. Inferential procedures carve out regions of $\\mathbb{R}^n$ (acceptance regions, confidence ellipsoids) that correspond to plausible population parameters.",
      "**P4 — Future link.** The four measurement scales are formalized by the theory of **permissible transformations** (Stanley Stevens, 1946). This connects to linear algebra: interval scales admit affine transformations ($Ax + b$ with $A > 0$), ratio scales admit only positive scalar multiplication. When you reach regression (stat1-005), the choice of scale determines whether your regression coefficients are stable across unit changes — a practical consequence of this abstract structure.",
    ],
    visualizations: [],
  },

  // ── Code / Notebooks ──────────────────────────────────────────
  python: {
    cells: [
      {
        id: "stat1-001-cell-1",
        type: "python",
        cellTitle: "Population vs. sample — computing a statistic from data",
        code: `# Population: all 10 students in a tiny school
population = [68, 72, 75, 71, 69, 74, 73, 70, 76, 68]

# Sample: randomly pick 4
import random
random.seed(7)
sample = random.sample(population, 4)

# Population parameter (mu) vs. sample statistic (x-bar)
pop_mean = sum(population) / len(population)
samp_mean = sum(sample) / len(sample)

print(f"Population (N={len(population)}): {population}")
print(f"Population mean μ  = {pop_mean:.2f}  ← parameter")
print()
print(f"Sample     (n={len(sample)}): {sample}")
print(f"Sample mean x̄     = {samp_mean:.2f}  ← statistic")
print()
print(f"Estimation error  = {abs(samp_mean - pop_mean):.2f} points")
`,
        instructions:
          "Re-run the cell a few times by changing random.seed(). Notice how the sample mean changes each time but the population mean stays fixed — this is sampling variability. The parameter is fixed; the statistic varies.",
      },
      {
        id: "stat1-001-cell-2",
        type: "python",
        cellTitle: "Classify variables: categorical vs. quantitative",
        code: `# A small dataset about students
students = [
    {"name": "Alice",   "major": "Biology",  "gpa": 3.7, "year": 2, "full_time": True},
    {"name": "Bob",     "major": "CS",       "gpa": 3.2, "year": 1, "full_time": True},
    {"name": "Carmen",  "major": "English",  "gpa": 3.9, "year": 4, "full_time": False},
    {"name": "David",   "major": "CS",       "gpa": 2.8, "year": 3, "full_time": True},
    {"name": "Eva",     "major": "Biology",  "gpa": 3.5, "year": 2, "full_time": False},
]

print("Variable classification:")
print(f"  major      → categorical (nominal):  {[s['major'] for s in students]}")
print(f"  year       → categorical (ordinal):  {[s['year'] for s in students]}")
print(f"  gpa        → quantitative (continuous): {[s['gpa'] for s in students]}")
print(f"  full_time  → categorical (binary):   {[s['full_time'] for s in students]}")

# Descriptive statistics on GPA (quantitative variable)
gpas = [s['gpa'] for s in students]
mean_gpa = sum(gpas) / len(gpas)
print(f"\nMean GPA = {mean_gpa:.2f}  (makes sense — GPA is quantitative)")

# Count majors (categorical variable)
from collections import Counter
major_counts = Counter(s['major'] for s in students)
print(f"Major counts = {dict(major_counts)}  (count, not mean — major is categorical)")
`,
        instructions:
          "Computing a mean of a categorical variable (like major) is meaningless. Verify: what operation makes sense for each variable type? Count/frequency for categorical; arithmetic (mean, SD) for quantitative.",
      },
    ],
  },

  // ── Examples ──────────────────────────────────────────────────
  examples: [
    {
      id: "stat1-001-ex1",
      title: "Classify and describe a simple dataset",
      difficulty: "easy",
      problem:
        "Five patients report the following resting heart rates (beats per minute): 72, 65, 80, 58, 75. (a) What measurement scale is heart rate? (b) Is this a population or a sample? (c) Compute a descriptive summary: the sample mean $\\bar{x}$.",
      steps: [
        {
          expression: "\\text{Heart rate (bpm): ratio scale}",
          annotation:
            "Heart rate has a true zero (0 bpm = no heartbeat), equal gaps (70 bpm vs 80 bpm differs the same as 80 vs 90), and valid ratios (80 bpm is twice 40 bpm).",
          strategyTitle: "Step 1: Identify the measurement scale",
        },
        {
          expression: "\\text{Five patients} \\Rightarrow \\text{sample}",
          annotation:
            'Unless these five patients ARE the entire population of interest (e.g., "five patients in this specific trial"), they are a sample from a larger population such as "all adult patients in this clinic." Context determines this — here we treat them as a sample.',
          strategyTitle: "Step 2: Population or sample?",
        },
        {
          expression:
            "\\bar{x} = \\frac{72 + 65 + 80 + 58 + 75}{5} = \\frac{350}{5} = 70",
          annotation:
            "Sum all five values: 72+65=137, 137+80=217, 217+58=275, 275+75=350. Divide by n=5: 350/5 = 70 bpm. This is the sample mean — a descriptive statistic about these five patients.",
          strategyTitle: "Step 3: Compute the sample mean",
        },
      ],
    },
    {
      id: "stat1-001-ex2",
      title: "Descriptive vs. inferential — two claims from one dataset",
      difficulty: "medium",
      problem:
        "A company surveys 200 of its 5,400 employees and finds that 148 of the 200 (74%) prefer remote work. (a) State one purely descriptive claim. (b) State one inferential claim. (c) Identify the population parameter and the sample statistic.",
      steps: [
        {
          expression: "\\hat{p}_{\\text{sample}} = \\frac{148}{200} = 0.74",
          annotation:
            "The proportion $\\hat{p}$ (p-hat) = 74% is a sample statistic — a fact about the 200 surveyed employees. Computing it is a descriptive act.",
          strategyTitle: "Step 1: Compute the sample statistic",
        },
        {
          expression:
            '\\text{Descriptive: "74\\% of the 200 surveyed employees prefer remote work."}',
          annotation:
            "No uncertainty language needed. This is a direct numerical fact about the data collected. No inference required.",
          strategyTitle: "Step 2: Descriptive claim",
        },
        {
          expression:
            '\\text{Inferential: "We estimate that approximately 74\\% of all 5,400 employees prefer remote work (±6\\%}\\text{, 95\\% CI)."}',
          annotation:
            'This claim goes beyond the data. The "±6%" (margin of error) acknowledges that the true population proportion p might differ from the sample 74%. Computing the margin of error formally requires the methods of stat1-004 (confidence intervals).',
          strategyTitle: "Step 3: Inferential claim with uncertainty",
        },
        {
          expression:
            "p = \\text{true proportion among all 5,400 (unknown parameter)} \\quad \\hat{p} = 0.74 \\text{ (sample statistic)}",
          annotation:
            'Parameter p (Greek / Roman here since proportions use p) is unknown. The hat notation $\\hat{p}$ signals "this is an estimate of the parameter p computed from sample data."',
          strategyTitle: "Step 4: Label parameter vs. statistic",
        },
      ],
    },
    {
      id: "stat1-001-ex3",
      title: "Identify scale errors in published summaries",
      difficulty: "hard",
      problem:
        'A psychology report contains the following three statements. For each, identify the measurement scale of the variable involved and state whether the statistical operation used is valid for that scale:\n(a) "The average political affiliation score was 3.2 (where 1=Far Left, 3=Center, 5=Far Right)."\n(b) "The GDP of Country A ($800B) is four times the GDP of Country B ($200B)."\n(c) "The mean year of birth in our sample was 1989, so the typical participant was born in 1989."',
      steps: [
        {
          expression: "\\text{(a) Political affiliation: ordinal scale}",
          annotation:
            '"Far Left=1 … Far Right=5" imposes a number but not a metric — the distance between "Center" and "Center-Right" may not equal the distance between "Center-Right" and "Right." Computing a mean on ordinal data is technically invalid (the mean requires equal gaps). The summary "average = 3.2" is widely done in practice and often useful as an approximation, but it should be reported with awareness that equal-interval assumptions may not hold.',
          strategyTitle: "Step 1: Political affiliation",
        },
        {
          expression:
            "\\text{(b) GDP: ratio scale} \\Rightarrow \\text{ratio valid}",
          annotation:
            'GDP in dollars has a true zero (zero dollars = no economic output). Ratio statements ("four times as large") are valid. $800B / $200B = 4 is a meaningful claim.',
          strategyTitle: "Step 2: GDP",
        },
        {
          expression:
            "\\text{(c) Birth year: interval scale} \\Rightarrow \\text{mean valid, ratio invalid}",
          annotation:
            'Calendar year is interval scale — equal gaps (1989 to 1990 = 1990 to 1991) but no true zero (year 0 is a historical convention, not the absence of time). The mean birth year 1989 is valid because the mean only requires equal gaps, not a true zero. But "participant born in 1989 is twice as old as..." would be invalid as a year ratio. The mean here is a useful descriptive summary of center.',
          strategyTitle: "Step 3: Birth year",
        },
      ],
    },
  ],

  // ── Challenges ────────────────────────────────────────────────
  challenges: [
    {
      id: "stat1-001-ch1",
      title: "Design a study: population and sample",
      difficulty: "medium",
      problem:
        "You want to estimate the average daily screen time of all high school students in your state (population size: ~500,000 students). Describe: (a) the population, (b) a feasible sample, (c) one variable and its measurement scale, (d) one descriptive claim you can make after data collection, and (e) one inferential claim with a margin-of-error statement.",
      walkthrough: [
        {
          expression:
            "\\text{Population: all } \\sim 500{,}000 \\text{ high school students in the state}",
          annotation:
            'The population includes every unit you want to draw conclusions about. Be precise: "high school students" = enrolled in grades 9–12 in public and private schools within the state.',
        },
        {
          expression:
            "n = 400 \\text{ students, randomly selected from 20 schools}",
          annotation:
            "A sample of 400 gives a margin of error of roughly ±5% for proportions, or ±(1.96 × s/√400) for means. Selecting from 20 schools adds geographic spread.",
        },
        {
          expression: "\\text{Daily screen time (hours): ratio scale}",
          annotation:
            "Screen time in hours has a true zero (0 hours = no screen use). Equal gaps. Ratios valid: 6 hours is twice 3 hours.",
        },
        {
          expression:
            "\\bar{x}_{400} = 5.3 \\text{ hours (descriptive — fact about the 400 sampled)}",
          annotation:
            "State this without uncertainty language. It describes the data you have.",
        },
        {
          expression:
            "\\hat{\\mu} = 5.3 \\pm 0.4 \\text{ hours (95\\% CI for all 500,000 students)}",
          annotation:
            "The ±0.4 margin quantifies your uncertainty about the population parameter μ. You cannot know μ exactly — the CI is what inferential statistics provides.",
        },
      ],
      answer:
        "A valid study specifies a well-defined population, a random sample with a stated size, identifies the measurement scale of key variables, and separates descriptive facts (computed from the sample) from inferential estimates (claims about the population, always with uncertainty).",
    },
    {
      id: "stat1-001-ch2",
      title: "Detect and fix a scale violation",
      difficulty: "medium",
      problem:
        'A report states: "On a 1–5 customer satisfaction scale, Group A averaged 4.2 and Group B averaged 2.1. Therefore Group A is exactly twice as satisfied as Group B." Identify the scale of the satisfaction variable, state whether the conclusion is valid, and explain what claim would be valid.',
      walkthrough: [
        {
          expression: "\\text{Satisfaction 1–5: ordinal scale}",
          annotation:
            'The numbers 1–5 impose order but not a metric. The gap between "1 = very dissatisfied" and "2 = dissatisfied" is not guaranteed to equal the gap between "4 = satisfied" and "5 = very satisfied." Ordinal scale.',
        },
        {
          expression:
            "\\frac{4.2}{2.1} = 2 \\Rightarrow \\text{ratio claim: INVALID on ordinal data}",
          annotation:
            'Ratio operations (division, "twice as much") require ratio-scale data with a true zero. A 1–5 satisfaction scale does not have a true zero — there is no "zero satisfaction" defined. Even if the means were computed validly (debatable for ordinal), the ratio is meaningless.',
        },
        {
          expression:
            "\\text{Valid claim: Group A's average rating (4.2) is higher than Group B's (2.1) by 2.1 points on the 1-5 scale.}",
          annotation:
            "Stating the difference in points is safer than a ratio. Even better: use the median and compare distributions visually. For ordinal data, the median is the most appropriate center measure.",
        },
      ],
      answer:
        "Satisfaction on a 1–5 scale is ordinal. Ratios are invalid on ordinal data. A valid claim is: Group A's median rating was higher than Group B's; or, the average score differed by 2.1 points on the scale (without the \"twice as\" language).",
    },
    {
      id: "stat1-001-ch3",
      title: "Margin of error and sample size",
      difficulty: "hard",
      problem:
        "A polling firm wants to estimate the proportion of voters who support a ballot measure. They want their 95% confidence interval to be no wider than ±3 percentage points. Using the formula $n \\geq \\left(\\frac{1.96}{2 \\times 0.03}\\right)^2$ (which assumes maximum variance when $p = 0.5$), compute the minimum sample size required. Then explain qualitatively what happens to the required sample size if the target margin is tightened to ±1.5%.",
      walkthrough: [
        {
          expression:
            "n \\geq \\left(\\frac{1.96}{2 \\times 0.03}\\right)^2 = \\left(\\frac{1.96}{0.06}\\right)^2 = (32.67)^2 \\approx 1{,}068",
          annotation:
            "The formula comes from the confidence interval for a proportion: width = 2 × 1.96 × √(p(1−p)/n). Setting this ≤ 2×0.03 and using p(1−p) ≤ 0.25 (maximum at p=0.5) gives n ≥ (1.96/0.06)². Round up to 1,068.",
        },
        {
          expression:
            "\\text{Margin } \\pm 3\\% \\Rightarrow n \\approx 1{,}068 \\quad \\text{Margin } \\pm 1.5\\% \\Rightarrow n \\approx 4{,}268",
          annotation:
            "Halving the margin requires quadrupling n: (1.96 / (2×0.015))² ≈ 4,268. This is the 1/√n law: to halve the error, multiply sample size by 4.",
        },
      ],
      answer:
        "Minimum n ≈ 1,068 for ±3% margin. Tightening to ±1.5% requires n ≈ 4,268 — four times as many — because margin of error scales as 1/√n.",
    },
  ],

  // ── Semantics ─────────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "\\mu",
        meaning:
          "Population mean — the average over all N units in the population; usually unknown",
      },
      {
        symbol: "\\bar{x}",
        meaning:
          "Sample mean — the arithmetic average computed from the n sampled values; an estimator of μ",
      },
      {
        symbol: "N",
        meaning:
          "Population size — the total number of units the study wants to draw conclusions about",
      },
      {
        symbol: "n",
        meaning:
          "Sample size — the number of units actually measured; n ≪ N in most real studies",
      },
      {
        symbol: "\\hat{p}",
        meaning:
          "Sample proportion — the fraction of sampled units with a given attribute; estimator of the population proportion p",
      },
    ],
    rulesOfThumb: [
      "Greek letters (μ, σ, ρ) label population parameters; Latin letters (x̄, s, r) label sample statistics.",
      "Margin of error shrinks like 1/√n — quadruple the sample size to halve the uncertainty.",
      "Nominal → count/mode only. Ordinal → add median/rank. Interval → add mean/std. Ratio → all operations valid.",
      "Always distinguish the descriptive claim (fact about your data) from the inferential claim (estimate about the population).",
      'When in doubt about scale: if zero means "none of the thing," you likely have ratio scale.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [],
    futureLinks: [
      {
        lessonId: "stat1-002",
        label: "Descriptive Statistics",
        note: "This lesson defined descriptive statistics as a concept. stat1-002 teaches the specific tools: mean, median, variance, IQR, and how to choose between them based on scale and distribution shape.",
      },
      {
        lessonId: "stat1-004",
        label: "Statistical Inference",
        note: "The confidence interval notation (x̄ ± margin) used here is formalized in stat1-004 using the Central Limit Theorem and the t-distribution.",
      },
      {
        lessonId: "stat1-005",
        label: "Regression Analysis",
        note: "Measurement scale determines which regression model is valid. Ratio and interval outcomes support linear regression; ordinal outcomes require ordinal regression; nominal outcomes require logistic regression.",
      },
    ],
  },

  // ── Checkpoints ───────────────────────────────────────────────
  checkpoints: [
    {
      id: "cp-stat1-001-1",
      label:
        "Read: distinguish descriptive vs. inferential statistics with an example of each",
      type: "read",
    },
    {
      id: "cp-stat1-001-2",
      label:
        "Read: identify population, sample, parameter, and statistic in a study description",
      type: "read",
    },
    {
      id: "cp-stat1-001-3",
      label:
        "Read: classify a variable as nominal, ordinal, interval, or ratio",
      type: "read",
    },
    {
      id: "cp-stat1-001-4",
      label:
        "Run Python Cell 1: compare sample mean x-bar to population mean mu",
      type: "lab",
    },
    {
      id: "cp-stat1-001-5",
      label:
        "Read: explain why computing a ratio is invalid on ordinal data using the satisfaction example",
      type: "read",
    },
    {
      id: "cp-stat1-001-6",
      label: "Run Python Cell 2: match variables to valid operations",
      type: "lab",
    },
    {
      id: "cp-stat1-001-7",
      label:
        "Complete example 2: write one descriptive and one inferential claim from survey data",
      type: "example",
    },
    {
      id: "cp-stat1-001-8",
      label:
        "Attempt challenge 2: identify and fix the scale violation in the satisfaction report",
      type: "challenge",
    },
  ],

  // ── Assessment ────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "stat1-001-assess-1",
        type: "choice",
        text: 'A researcher records the finishing positions (1st, 2nd, 3rd, …) of runners in a race. What is the measurement scale of "finishing position"?',
        options: ["Nominal", "Ordinal", "Interval", "Ratio"],
        answer: "Ordinal",
        instructions:
          "Finishing positions have a clear order (1st < 2nd < 3rd) but the time gap between 1st and 2nd is not necessarily the same as between 2nd and 3rd. No true zero and no equal intervals.",
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────
  quiz: [
    {
      id: "stat1-001-quiz-1",
      type: "choice",
      text: 'Which of the following best describes "inferential statistics"?',
      options: [
        "Summarizing the data you collected using charts and averages",
        "Using sample data to make estimates or decisions about a population",
        "Collecting data from every member of a population",
        "Converting data from one measurement scale to another",
      ],
      answer:
        "Using sample data to make estimates or decisions about a population",
      hints: [
        "Inferential statistics always involves going beyond the data you have.",
        'The key word is "population" — you are making a claim about units you did not observe.',
      ],
      reviewSection: 'Intuition → "The inferential leap" paragraph',
    },
    {
      id: "stat1-001-quiz-2",
      type: "choice",
      text: 'A study surveys 500 people and reports "52% of respondents prefer Brand A." What kind of claim is this?',
      options: [
        "A population parameter",
        "A descriptive statistic about the sample",
        "An inferential estimate with uncertainty",
        "A ratio-scale measurement",
      ],
      answer: "A descriptive statistic about the sample",
      hints: [
        'The key word is "respondents" — these are the 500 people actually surveyed, not the full population.',
        "A descriptive claim states a fact about the data collected, with no uncertainty needed.",
      ],
      reviewSection:
        'Intuition → "Descriptive vs. Inferential — The Two Jobs" callout',
    },
    {
      id: "stat1-001-quiz-3",
      type: "choice",
      text: "Temperature measured in Fahrenheit is which type of scale?",
      options: ["Nominal", "Ordinal", "Interval", "Ratio"],
      answer: "Interval",
      hints: [
        'Equal gaps between degrees exist, but is 0°F the "absence of temperature"?',
        '0°F does not mean "no heat" — it is an arbitrary reference point.',
      ],
      reviewSection: 'Intuition → "Four types of data" paragraph',
    },
    {
      id: "stat1-001-quiz-4",
      type: "choice",
      text: "If you quadruple your sample size from 100 to 400, what happens to the margin of error?",
      options: ["It doubles", "It halves", "It stays the same", "It quarters"],
      answer: "It halves",
      hints: [
        "Margin of error is proportional to 1/√n.",
        "√400 = 20 and √100 = 10 — a factor of 2 in the denominator.",
      ],
      reviewSection:
        'Intuition → "Larger samples shrink uncertainty" paragraph',
    },
    {
      id: "stat1-001-quiz-5",
      type: "choice",
      text: "Which of the following is NOT a valid operation on ordinal data?",
      options: [
        "Finding the median",
        "Ranking from highest to lowest",
        "Computing the arithmetic mean",
        "Counting the most frequent category",
      ],
      answer: "Computing the arithmetic mean",
      hints: [
        "The mean requires equal-interval spacing between values.",
        "Ordinal data has order but not guaranteed equal gaps.",
      ],
      reviewSection:
        'Intuition → "Four types of data" and "Why the scale matters" paragraphs',
    },
    {
      id: "stat1-001-quiz-6",
      type: "choice",
      text: "In standard statistical notation, which symbol represents an unknown population parameter?",
      options: ["x̄", "s", "μ", "r"],
      answer: "μ",
      hints: [
        "Population parameters use Greek letters.",
        "μ (mu) is the population mean.",
      ],
      reviewSection:
        'Intuition → "Parameter vs. Statistic — a Notation Convention" callout',
    },
  ],

  // ── Misconceptions ────────────────────────────────────────────
  misconceptions: [
    {
      falseBelief:
        "If data are stored as numbers, they must be interval or ratio scale.",
      whyStudentsThinkIt:
        "Computers store everything as numbers; students assume that because pain ratings (1–10) or zip codes (90210) are numbers, arithmetic on them is valid.",
      correctionExample:
        'ZIP code 90210 minus ZIP code 10001 = 80,209 — a meaningless number. Finishing position 1 and position 3 are numbers, but "average finishing position = 2.0" is not meaningful when the time gaps are unequal.',
      contrastCase:
        'Height in centimeters is also stored as a number, and averaging it is valid (ratio scale). The question is not "is it a number?" but "do equal differences represent equal quantities?"',
    },
    {
      falseBelief:
        "A larger sample is always better — if I have all the data, I need no statistics.",
      whyStudentsThinkIt:
        'Students conflate "more data = more accurate" with "complete population = no uncertainty." If you have the entire population, parameters are known exactly, so no inference is needed.',
      correctionExample:
        "A census (surveying all 330 million Americans) gives you the exact population mean with zero uncertainty — no confidence interval needed. But if you only surveyed 1,000, you need inferential statistics to estimate the population mean.",
      contrastCase:
        'If your "population" is next year\'s customers (unobserved), even a full historical dataset is still a sample from that conceptual population, and inference remains necessary.',
    },
    {
      falseBelief: "The margin of error tells you the maximum possible error.",
      whyStudentsThinkIt:
        'Students read "±3%" as a guarantee that the true value is within 3% of the estimate.',
      correctionExample:
        "A 95% confidence interval of 62 ± 8 minutes means: if we repeated this sampling procedure 100 times, about 95 of the 100 intervals would contain the true mean. It does not mean the true mean is definitely within ±8 of 62 — there is a 5% chance the interval misses entirely.",
      contrastCase:
        "A 99% CI would be wider (±10 minutes) and miss less often. A 90% CI would be narrower (±7 minutes) but miss more often. Confidence level and width trade off.",
    },
  ],

  // ── Transfer Prompts ──────────────────────────────────────────
  transferPrompts: [
    {
      situation:
        "A hospital administrator has records for all 4,200 patients treated last year and wants to compute the average length of stay.",
      competingTechniques: [
        "Compute the sample mean from a subset",
        "Compute the population mean from all records",
        "Report the median instead",
      ],
      whyThisTechniqueWins:
        "Since all 4,200 records are available, this is a census — compute the population mean μ directly. No sampling or confidence intervals are needed; there is no uncertainty. Using a sample here would artificially introduce uncertainty that does not exist.",
    },
    {
      situation:
        'A marketing team has satisfaction scores (1–5 stars) from 8,000 customers and wants to report "the average satisfaction."',
      competingTechniques: [
        "Compute arithmetic mean of the 1–5 scores",
        "Report the median star rating",
        "Count how many gave each rating (frequency table)",
      ],
      whyThisTechniqueWins:
        "Star ratings are ordinal — the mean is technically invalid but widely used. The safest choice is to report the median (the middle value when sorted) and also show the frequency distribution (how many gave 1, 2, 3, 4, 5 stars). This gives more information than a single number and does not require equal-interval assumptions.",
    },
  ],

  // ── Debugging ─────────────────────────────────────────────────
  debugging: [
    {
      commonError: "Performing arithmetic on nominal data stored as numbers.",
      symptom:
        'The mean of "country codes" or "survey question IDs" produces a number that seems plausible but has no meaning.',
      whyItHappened:
        "When nominal categories are encoded as integers (1=USA, 2=Canada, 3=Mexico), pandas and numpy will happily compute the mean — there is no automatic type check.",
      repairStrategy:
        'Before analyzing any column, print its dtype and ask: "Does averaging this make sense?" For categorical columns, use value_counts() or mode(), not mean(). In pandas, explicitly cast nominal columns to Categorical dtype to prevent accidental arithmetic.',
    },
    {
      commonError:
        "Reporting only the sample statistic without the margin of error.",
      symptom:
        'A result like "our sample shows 74% preference" is treated as a definitive population fact without uncertainty.',
      whyItHappened:
        "The computation of the sample proportion is straightforward; computing and reporting the confidence interval requires an extra step that students skip.",
      repairStrategy:
        "Make it a rule: every inferential claim needs an uncertainty statement. In Python, use scipy.stats.proportion_confint(count, nobs, alpha=0.05) to compute the 95% CI automatically alongside the proportion.",
    },
  ],

  // ── Mastery ────────────────────────────────────────────────────
  mastery: {
    targetLevel: 2,
    solveIndependently:
      "Given a dataset description, identify population vs. sample, classify three variables by measurement scale, compute the sample mean, and write one descriptive and one inferential claim with a margin-of-error statement.",
    explainVerbally:
      'Explain why computing a ratio (e.g., "twice as satisfied") is invalid for ordinal data but valid for ratio data, using a concrete example with numbers.',
    detectIncorrectApplication:
      "Identify when a published summary applies arithmetic to nominal or ordinal data and state specifically which operation is invalid and what the valid alternative is.",
    transferToUnfamiliar:
      "Given a study you have never seen (e.g., a biology field survey, a marketing A/B test), correctly label all variables by scale, separate descriptive from inferential claims, and flag any scale violations in the reported statistics.",
  },
};
