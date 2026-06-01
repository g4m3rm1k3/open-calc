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
      "Roadmap for this lesson: you will compute one confidence interval end-to-end, explain what it means in plain language, and avoid the most common interpretation mistake.",
      "Start with concrete data: in a sample of n = 100 users, average daily app usage is x-bar = 42 minutes with sample standard deviation s = 12 minutes. The sample mean is one estimate of the true population mean mu.",
      "Now ask the inferential question: how far could x-bar be from mu just due to sampling noise? The standard error of the mean is s/sqrt(n) = 12/10 = 1.2 minutes.",
      "For an approximate 95% interval, multiply standard error by about 2. Margin of error is about 2.4 minutes. The interval is 42 +/- 2.4, so [39.6, 44.4].",
      "Prediction moment: before reading on, predict what happens to interval width when n goes from 100 to 400 while s stays the same.",
      "Because standard error scales as 1/sqrt(n), quadrupling n halves the standard error and halves the margin. Larger samples narrow confidence intervals.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Build a 95% CI for a Mean",
        body: "Step 1. Compute sample mean x-bar and sample standard deviation s.\nStep 2. Compute standard error: SE = s/sqrt(n).\nStep 3. Pick critical value (about 2 for large samples; exact t* for small samples).\nStep 4. Compute margin: ME = critical * SE.\nStep 5. Report interval: x-bar +/- ME and interpret in context.",
      },
      {
        type: "warning",
        title: "What a 95% CI Does NOT Mean",
        body: "It does not mean there is a 95% chance the fixed parameter is inside this one computed interval. It means this method captures the true parameter in 95% of repeated samples.",
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
      "For a population mean mu, estimated with sample mean x-bar from size n, a large-sample interval is x-bar +/- z* (s/sqrt(n)).",
      "For 95% confidence, z* ~= 1.96. For small n with unknown sigma, use t* with df = n - 1.",
      "For a proportion p with sample p-hat, an approximate 95% interval is p-hat +/- 1.96 * sqrt(p-hat(1-p-hat)/n).",
    ],
  },

  rigor: {
    prose: [
      "Formal statement: if assumptions hold, the interval estimator I(X) has coverage P(mu in I(X)) = 0.95.",
      "Invariant viewpoint: confidence level is a property of the procedure, not the realized interval.",
      "Geometric interpretation: each sample maps to a point estimate; CI adds a symmetric uncertainty radius around that point.",
      "Future abstraction link: confidence intervals are dual to hypothesis tests; two-sided 95% CI corresponds to alpha = 0.05 test decisions.",
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
        cellTitle: "Sampling-size effect on interval width",
        code: "import numpy as np\n\ndef ci_width(s, n, z=1.96):\n    return 2 * z * s / np.sqrt(n)\n\nfor n in [25, 100, 400, 1600]:\n    print(f'n={n:4d}, width={ci_width(12, n):.3f}')",
        instructions:
          "Observe that width scales with 1/sqrt(n): to halve width, sample size must quadruple.",
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
      text: "A 99% CI is usually compared with a 95% CI:",
      options: ["narrower", "same width", "wider", "invalid"],
      answer: "wider",
      hints: ["Higher confidence uses larger critical value."],
      reviewSection: "Math section",
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
