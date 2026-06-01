export default {
  id: "stat1-005",
  slug: "intro-to-regression",
  chapter: "stat1",
  order: 5,
  title: "Introduction to Linear Regression",
  subtitle:
    "Model, interpret, and diagnose a first-order relationship between two variables.",
  tags: ["statistics", "regression", "correlation", "prediction", "modeling"],
  aliases: "simple linear regression slope intercept r squared residual",
  timeToComplete: 55,
  coreConcept:
    "Simple linear regression fits a line y-hat = b0 + b1 x that minimizes squared residuals and turns association into a predictive model with interpretable coefficients.",
  prerequisites: ["stat1-004", "stat3-001", "stat3-002"],
  nextLesson: "stat2-001",

  hook: {
    question: "Can we predict exam score from study hours with one equation?",
    realWorldContext:
      "Advising offices use quick screening models to identify students at risk. A transparent linear model offers explainability and fast iteration before more complex machine learning is introduced.",
  },

  intuition: {
    prose: [
      "Roadmap for this lesson: by the end, you should be able to fit a straight-line model, interpret slope in context, and check whether the model is trustworthy using residuals.",
      "Start with concrete points: (2 hours, 58 score), (4, 65), (6, 74), (8, 82). A line through this cloud captures trend: more study tends to higher score.",
      "Regression chooses b0 and b1 by minimizing squared errors. Each error is e = y - y-hat. Squaring penalizes large misses and avoids cancellation of positive/negative errors.",
      "Prediction moment: if slope b1 is 3.5, what score change do you predict when study hours increase by 2?",
      "Interpretation: slope b1 is expected change in y for +1 unit x. Here +2 hours implies about +7 points.",
      "R-squared measures how much variance in y is explained by x in this linear model. It is a fit summary, not a causality proof.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Build and Evaluate a Simple Regression",
        body: "Step 1. Plot x vs y and inspect rough linear trend.\nStep 2. Fit y-hat = b0 + b1 x.\nStep 3. Interpret b1 (rate of change) and b0 (baseline at x=0, if meaningful).\nStep 4. Check residual plot for pattern, curvature, or variance funnel.\nStep 5. Report prediction with context and uncertainty limits.",
      },
      {
        type: "warning",
        title: "Association Is Not Causation",
        body: "A high R-squared can still come from confounding, reverse causality, or selection bias. Causal claims require design assumptions or experiments.",
      },
    ],
    visualizations: [
      {
        id: "stat1-005-viz-1",
        type: "scatter-residual",
        title: "Data Space and Residual Space",
        purpose:
          "Shows that good fit means no residual structure, not just a steep line.",
      },
    ],
  },

  math: {
    prose: [
      "Model: y_i = b0 + b1 x_i + e_i, where e_i are residual errors.",
      "Least squares objective: minimize SSE = sum_i (y_i - (b0 + b1 x_i))^2.",
      "Closed-form slope and intercept: b1 = Sxy/Sxx and b0 = y-bar - b1 x-bar.",
      "Goodness-of-fit: R^2 = 1 - SSE/SST, where SST = sum_i (y_i - y-bar)^2.",
    ],
  },

  rigor: {
    prose: [
      "Formal statement: OLS estimates are best linear unbiased under Gauss-Markov assumptions (linearity, zero-mean errors, homoscedasticity, no perfect multicollinearity).",
      "Invariant viewpoint: centering x does not change slope; it shifts intercept. Scale changes in x rescale slope but preserve fitted values when transformed consistently.",
      "Geometric interpretation: y is projected onto span{1, x} in R^n, and residuals are orthogonal to fitted values.",
      "Future abstraction link: multiple regression generalizes to matrix form y = Xb + e with b-hat = (X^T X)^(-1) X^T y.",
    ],
  },

  python: {
    cells: [
      {
        id: "stat1-005-cell-1",
        type: "python",
        cellTitle: "Fit regression on CSV data with pandas",
        code: "import pandas as pd\nimport numpy as np\n\n# Replace with your CSV later\n# df = pd.read_csv('data/applied-statistics/study_hours_scores.csv')\nnp.random.seed(4)\nx = np.linspace(1, 10, 80)\ny = 48 + 4.2*x + np.random.normal(0, 5, size=len(x))\ndf = pd.DataFrame({'hours': x, 'score': y})\n\nxbar = df['hours'].mean()\nybar = df['score'].mean()\nSxx = ((df['hours'] - xbar) ** 2).sum()\nSxy = ((df['hours'] - xbar) * (df['score'] - ybar)).sum()\nb1 = Sxy / Sxx\nb0 = ybar - b1 * xbar\n\ndf['yhat'] = b0 + b1 * df['hours']\ndf['resid'] = df['score'] - df['yhat']\n\nSSE = (df['resid'] ** 2).sum()\nSST = ((df['score'] - ybar) ** 2).sum()\nR2 = 1 - SSE / SST\n\nprint(f'b0={b0:.3f}, b1={b1:.3f}, R^2={R2:.3f}')\nprint(df[['hours','score','yhat','resid']].head())",
        instructions:
          "Swap in a real CSV file and verify slope interpretation in the context of your variables.",
      },
      {
        id: "stat1-005-cell-2",
        type: "python",
        cellTitle: "Residual diagnostics basics",
        code: "import numpy as np\n\nresid = df['resid'].values\nprint('Residual mean:', np.mean(resid))\nprint('Residual std:', np.std(resid, ddof=1))\n\n# quick pattern check by correlation with x\ncorr_rx = np.corrcoef(df['hours'], resid)[0,1]\nprint('corr(x, residual):', round(corr_rx, 4))\nprint('If residual pattern is strong, linear model may be mis-specified.')",
        instructions:
          "A strong residual-vs-x pattern signals nonlinearity or omitted variables.",
      },
    ],
  },

  examples: [
    {
      id: "stat1-005-ex1",
      title: "Interpret slope",
      difficulty: "easy",
      problem: "For y-hat = 42 + 3.2x, interpret slope and predict y at x=5.",
      steps: [
        {
          expression: "b1 = 3.2",
          annotation: "Each +1 in x adds about 3.2 to predicted y.",
          strategyTitle: "Interpret slope",
        },
        {
          expression: "y-hat = 42 + 3.2*5 = 58",
          annotation: "Plug in x to get prediction.",
          strategyTitle: "Predict",
        },
      ],
    },
    {
      id: "stat1-005-ex2",
      title: "Compute residual",
      difficulty: "medium",
      problem:
        "Observed y=61 at x=5 with model y-hat=58. Compute residual and interpret.",
      steps: [
        {
          expression: "e = y - y-hat = 61 - 58 = 3",
          annotation: "Positive residual means model underpredicted.",
          strategyTitle: "Residual formula",
        },
      ],
    },
    {
      id: "stat1-005-ex3",
      title: "Choose valid use case",
      difficulty: "hard",
      problem:
        "Decide whether simple linear regression is appropriate: (a) dosage vs blood concentration, (b) day-of-week label vs sales.",
      steps: [
        {
          expression: "Case (a): potentially valid",
          annotation:
            "Both variables quantitative; check linearity and residuals.",
          strategyTitle: "Detect applicability",
        },
        {
          expression: "Case (b): invalid as-is",
          annotation:
            "Day-of-week is categorical; encode with indicators or use ANOVA-style model.",
          strategyTitle: "Reject misapplication",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "stat1-005-ch1",
      title: "Slope meaning in context",
      difficulty: "easy",
      problem:
        "A model predicts fuel use (L) from distance (km): y-hat = 2.1 + 0.08x. Interpret 0.08.",
      walkthrough: [
        {
          expression: "0.08 L per km",
          annotation:
            "Expected fuel increases by 0.08 liters for each additional kilometer.",
        },
      ],
      answer: "Slope is a rate-of-change interpretation with units y-per-x.",
    },
    {
      id: "stat1-005-ch2",
      title: "Check residual red flag",
      difficulty: "medium",
      problem:
        "Residuals form a U-shape against x. What does this suggest and what is one fix?",
      walkthrough: [
        {
          expression: "U-shape implies nonlinearity",
          annotation: "Linear model misses curvature.",
        },
        {
          expression: "Add x^2 term or transform variables",
          annotation: "Model class must match structure.",
        },
      ],
      answer:
        "The linear form is mis-specified; include nonlinear terms or use a nonlinear model.",
    },
    {
      id: "stat1-005-ch3",
      title: "CSV mini-project",
      difficulty: "hard",
      problem:
        "Import a CSV with two quantitative columns, fit regression, report slope, R^2, and one residual-based diagnostic.",
      walkthrough: [
        {
          expression: "Fit -> summarize -> diagnose",
          annotation: "Use procedure callout and justify one model limitation.",
        },
      ],
      answer:
        "A complete submission includes equation, R^2, context interpretation, and at least one diagnostic caveat.",
    },
  ],

  semantics: {
    core: [
      {
        symbol: "b0",
        meaning: "Intercept, predicted y when x=0 (if meaningful in domain)",
      },
      { symbol: "b1", meaning: "Slope, expected change in y per +1 unit x" },
      { symbol: "y-hat", meaning: "Predicted response from fitted model" },
      { symbol: "e", meaning: "Residual error y - y-hat for each observation" },
      {
        symbol: "R^2",
        meaning: "Fraction of response variance explained by model",
      },
    ],
    rulesOfThumb: [
      "Always plot data before fitting any model.",
      "Interpret coefficients with units.",
      "Residual patterns are model feedback, not noise to ignore.",
      "High R^2 does not prove causation.",
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: "stat1-004",
        label: "Uncertainty mindset",
        note: "Carry interval interpretation into model-based estimates.",
      },
    ],
    futureLinks: [
      {
        lessonId: "stat2-005",
        label: "Scatter plots",
        note: "Visual diagnostics are central to regression assumptions.",
      },
    ],
  },

  checkpoints: [
    {
      id: "cp-stat1-005-1",
      label: "Read model equation and coefficient meaning",
      type: "read",
    },
    {
      id: "cp-stat1-005-2",
      label: "Run regression fit notebook cell",
      type: "lab",
    },
    {
      id: "cp-stat1-005-3",
      label: "Interpret slope in units",
      type: "example",
    },
    {
      id: "cp-stat1-005-4",
      label: "Compute and interpret residual",
      type: "example",
    },
    {
      id: "cp-stat1-005-5",
      label: "Read warning on causality limits",
      type: "read",
    },
    {
      id: "cp-stat1-005-6",
      label: "Inspect residual diagnostics",
      type: "lab",
    },
    {
      id: "cp-stat1-005-7",
      label: "Complete applicability detection example",
      type: "example",
    },
    {
      id: "cp-stat1-005-8",
      label: "Attempt CSV mini-project challenge",
      type: "challenge",
    },
  ],

  assessment: {
    questions: [
      {
        id: "stat1-005-assess-1",
        type: "choice",
        text: "In y-hat = 10 + 2.5x, what does 2.5 represent?",
        options: [
          "Predicted y at x=2.5",
          "Expected change in y for +1 in x",
          "Residual variance",
          "Model confidence level",
        ],
        answer: "Expected change in y for +1 in x",
        hint: "Slope is rate-of-change with units y per x.",
      },
    ],
  },

  quiz: [
    {
      id: "stat1-005-quiz-1",
      type: "choice",
      text: "Which quantity is minimized by ordinary least squares?",
      options: [
        "Sum of residuals",
        "Sum of squared residuals",
        "Absolute error median",
        "R-squared",
      ],
      answer: "Sum of squared residuals",
      hints: ["Think SSE objective."],
      reviewSection: "Math -> least squares objective",
    },
    {
      id: "stat1-005-quiz-2",
      type: "choice",
      text: "If residuals show a curve pattern, the best conclusion is:",
      options: [
        "Model is perfect",
        "Linearity assumption may fail",
        "Need fewer data points",
        "R-squared must be zero",
      ],
      answer: "Linearity assumption may fail",
      hints: ["Residual structure indicates misspecification."],
      reviewSection: "Procedure -> Step 4",
    },
    {
      id: "stat1-005-quiz-3",
      type: "choice",
      text: "Near-miss distractor: high R-squared guarantees causal impact.",
      options: ["True", "False"],
      answer: "False",
      hints: ["Association and causation differ."],
      reviewSection: "Warning callout",
    },
    {
      id: "stat1-005-quiz-4",
      type: "choice",
      text: "Which is NOT an appropriate predictor encoding for day-of-week in simple linear regression?",
      options: [
        "1-7 numeric as ordered interval",
        "Dummy variables",
        "ANOVA framework",
        "One-hot encoding",
      ],
      answer: "1-7 numeric as ordered interval",
      hints: ["Day labels are categorical, not interval-scale quantities."],
      reviewSection: "Examples -> applicability detection",
    },
    {
      id: "stat1-005-quiz-5",
      type: "choice",
      text: "Residual =",
      options: ["y-hat - y", "y - y-hat", "SST - SSE", "b0 + b1"],
      answer: "y - y-hat",
      hints: ["Observed minus predicted."],
      reviewSection: "Examples -> residual",
    },
    {
      id: "stat1-005-quiz-6",
      type: "choice",
      text: "If b1 is negative, then as x increases, predicted y tends to:",
      options: ["Increase", "Decrease", "Stay constant", "Become undefined"],
      answer: "Decrease",
      hints: ["Sign of slope controls direction."],
      reviewSection: "Intuition -> slope interpretation",
    },
  ],

  misconceptions: [
    {
      falseBelief: "A strong regression fit automatically means x causes y.",
      whyStudentsThinkIt: "Model equations look mechanistic and precise.",
      correctionExample:
        "Ice cream sales and drownings may correlate due to temperature as a confounder.",
      contrastCase:
        "Randomized experiments support causal interpretation better than observational correlations.",
    },
    {
      falseBelief:
        "If residual average is near zero, the model is fully valid.",
      whyStudentsThinkIt:
        "Students confuse one diagnostic with all diagnostics.",
      correctionExample:
        "Residuals can average to zero while still showing U-shape and heteroscedasticity.",
      contrastCase:
        "Valid modeling needs pattern checks, variance checks, and domain plausibility.",
    },
  ],

  transferPrompts: [
    {
      situation:
        "Predict product conversion from ad spend for weekly campaigns.",
      competingTechniques: ["Simple regression", "Mean-only baseline"],
      whyThisTechniqueWins:
        "Regression captures trend and supports scenario predictions.",
    },
    {
      situation: "Classify pass/fail from study hours only.",
      competingTechniques: ["Linear regression", "Logistic regression"],
      whyThisTechniqueWins:
        "Binary outcomes are better modeled by logistic regression; linear model can misbehave at bounds.",
    },
  ],

  debugging: [
    {
      commonError: "Swapping x and y in fit step.",
      symptom: "Coefficient units and interpretation feel backward.",
      whyItHappened:
        "Roles of predictor and response were not fixed before modeling.",
      repairStrategy:
        "State response question first, then choose predictors to explain it.",
    },
    {
      commonError:
        "Using extrapolated predictions far outside observed x range.",
      symptom: "Predictions become unrealistic or negative where impossible.",
      whyItHappened: "Model validity assumed beyond data support.",
      repairStrategy:
        "Mark observed range and avoid unvalidated extrapolation.",
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently:
      "Fit and interpret a simple linear regression from a CSV dataset.",
    explainVerbally:
      "Explain slope, intercept, residual, and R-squared in context.",
    detectIncorrectApplication:
      "Identify when linear regression is inappropriate due to variable type or residual structure.",
    transferToUnfamiliar:
      "Apply regression workflow to a new domain and communicate limitations clearly.",
  },
};
