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
      "**Roadmap for this lesson.** By the end, you will be able to: (1) fit a straight-line model from two lists of numbers using the least-squares formulas, (2) interpret slope and intercept with correct units and context, (3) compute and interpret $R^2$, and (4) check whether the model is trustworthy using a residual plot.",
      "**From scatter to equation.** In stat2-005, scatter plots revealed the direction, shape, and strength of association between two quantitative variables. A scatter plot tells you *whether* a relationship exists. Linear regression takes the next step: it gives you a concrete *equation* so you can use one variable to *predict* another. For a study of 80 students — each with a recorded study-hours value and an exam score — the goal is to find the one straight line that best summarizes how scores tend to change with study hours.",
      "**The least-squares criterion.** Any line $\\hat{y} = b_0 + b_1 x$ makes a prediction $\\hat{y}_i = b_0 + b_1 x_i$ for each observation. The prediction error for observation $i$ is the **residual**: $e_i = y_i - \\hat{y}_i$ — positive when the model underpredicts, negative when it overpredicts. Many different lines through the scatter cloud might seem plausible. Ordinary least squares (OLS) picks the unique line that minimizes the **sum of squared residuals**: $\\text{SSE} = \\sum_{i=1}^n e_i^2$. Squaring each error penalizes large misses more heavily than small ones and prevents positive and negative errors from cancelling each other out.",
      "**Before reading on, predict:** for the four data points $(2, 58),\\; (4, 65),\\; (6, 74),\\; (8, 82)$: does the slope look positive or negative? Roughly estimate the slope (change in score per extra study hour) using just the first and last points.",
      "**Interpreting slope and intercept with units.** Suppose the fitted equation is $\\hat{\\text{score}} = 48.4 + 4.2 \\times \\text{hours}$. The **slope** $b_1 = 4.2$ means: each additional study hour is associated with an average increase of 4.2 exam points. This is always a rate-of-change, and it must be stated with units (points per hour). The **intercept** $b_0 = 48.4$ is the predicted score at 0 study hours. It is mathematically necessary for the formula but often should not be interpreted literally — if 0 hours is not in the observed data range, the intercept is an extrapolation.",
      "**$R^2$ and what it tells you.** The coefficient of determination $R^2 = 1 - \\text{SSE}/\\text{SST}$ measures what fraction of the total variation in $y$ the linear model accounts for. $R^2 = 0$ means the model explains nothing; $R^2 = 1$ means perfect fit. $R^2 = 0.87$ for the study-hours model means 87% of the student-to-student variation in scores is explained by variation in study hours; the remaining 13% is due to other factors (prior knowledge, sleep, test anxiety). **High $R^2$ does not prove causation** — it measures fit, not mechanism.",
      "**Residuals as model diagnostics.** After fitting, always plot residuals $e_i$ against $x_i$. A healthy plot shows residuals scattered randomly around zero with no visible pattern. Red-flag patterns: a **U-shape or arch** signals nonlinearity (the true relationship is curved); a **fan shape** signals heteroscedasticity (variance grows with $x$); **runs of positives then negatives** signal autocorrelation. OLS guarantees that residuals sum to zero, but zero mean is necessary, not sufficient — the pattern matters.",
      "**Extrapolation: the edge of the model.** Regression is validated only within the range of observed $x$ values. Predicting outside this range is **extrapolation**: the linear relationship may break down entirely. If a model of plant growth is fitted from 0 to 20 cm/week of watering, using it to predict growth at 200 cm/week would be absurd. Always note the observed $x$ range and label out-of-range predictions as unreliable extrapolations.",
    ],
    callouts: [
      {
        type: "procedure",
        title: "Procedure: Fit and Evaluate a Simple Linear Regression",
        body: "Step 1. Plot x vs y — inspect for linear trend, outliers, and curvature before fitting.\nStep 2. Fit $\\hat{y} = b_0 + b_1 x$ using the least-squares formulas (or software).\nStep 3. Interpret $b_1$ (rate of change, with units) and $b_0$ (baseline at x=0, if meaningful).\nStep 4. Report $R^2$ and interpret as the fraction of y-variance explained by the model.\nStep 5. Plot residuals vs x — look for patterns that signal model failure.\nStep 6. State predictions with a note on whether they are interpolations or extrapolations.",
      },
      {
        type: "warning",
        title: "Association Is Not Causation",
        body: "A high $R^2$ does not prove that $x$ causes $y$. The correlation could arise from a confounding variable (both $x$ and $y$ are driven by a third variable), reverse causation ($y$ causes $x$), or selection bias in how the data were collected. Causal interpretation requires an experimental design with random assignment (stat1-003) or an explicit causal identification strategy.",
      },
      {
        type: "insight",
        title: "When Is Linear Regression Appropriate?",
        body: "Check four conditions before reporting a linear regression:\n\n1. **Linearity** — the scatter plot shows a roughly linear cloud, not a curve.\n2. **Independence** — observations are not serially correlated (e.g., time-series data often violates this).\n3. **Constant variance** — the spread of residuals does not fan out as x increases (homoscedasticity).\n4. **Appropriate outcome type** — the response is continuous (not binary, not count data with many zeros).\n\nViolating (1) means you need a nonlinear term; violating (4) means you need a different model class (logistic regression, Poisson regression).",
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
      "**The statistical model.** $y_i = \\beta_0 + \\beta_1 x_i + \\varepsilon_i$, where $\\varepsilon_i$ are independent errors with $E[\\varepsilon_i] = 0$ and $\\text{Var}(\\varepsilon_i) = \\sigma^2$ (Gauss-Markov assumptions). The true parameters $\\beta_0, \\beta_1$ are unknown; we estimate them from data.",
      "**Least-squares formulas.** Define $S_{xx} = \\sum_{i=1}^n (x_i - \\bar{x})^2$ and $S_{xy} = \\sum_{i=1}^n (x_i - \\bar{x})(y_i - \\bar{y})$. The OLS estimates are: $b_1 = S_{xy}/S_{xx}$ and $b_0 = \\bar{y} - b_1 \\bar{x}$. The OLS line always passes through $(\\bar{x}, \\bar{y})$ — the sample centroid.",
      "**Connection to correlation.** The sample correlation $r = S_{xy} / \\sqrt{S_{xx} S_{yy}}$ is related to the slope by $b_1 = r \\cdot (s_y / s_x)$, where $s_y$ and $s_x$ are sample standard deviations. The slope is the correlation scaled by the ratio of standard deviations. Correlation is unit-free; slope has units of $y$ per unit of $x$.",
      "**Goodness of fit.** Partition the total sum of squares: $\\text{SST} = \\text{SSR} + \\text{SSE}$, where $\\text{SST} = \\sum(y_i - \\bar{y})^2$ (total variance in $y$), $\\text{SSR} = \\sum(\\hat{y}_i - \\bar{y})^2$ (explained by the model), $\\text{SSE} = \\sum(y_i - \\hat{y}_i)^2$ (residual/unexplained). The coefficient of determination $R^2 = 1 - \\text{SSE}/\\text{SST} = \\text{SSR}/\\text{SST}$ equals the square of the Pearson correlation for simple regression: $R^2 = r^2$.",
    ],
  },

  rigor: {
    prose: [
      "**R1 — Gauss-Markov Theorem.** Under assumptions (L) linearity, (E) $E[\\varepsilon_i] = 0$, (H) $\\text{Var}(\\varepsilon_i) = \\sigma^2$ (homoscedasticity), and (I) uncorrelated errors, the OLS estimators $b_0, b_1$ are the **Best Linear Unbiased Estimators** (BLUE): among all linear unbiased estimators, they have the smallest variance. 'Best' means minimum variance; 'unbiased' means $E[b_1] = \\beta_1$. These properties hold without requiring normality of $\\varepsilon_i$.",
      "**R2 — Geometric interpretation.** In $\\mathbb{R}^n$, the $n$ observations form a vector $\\mathbf{y}$. OLS projects $\\mathbf{y}$ orthogonally onto the column space of the design matrix $\\mathbf{X} = [\\mathbf{1} \\mid \\mathbf{x}]$. The fitted values $\\hat{\\mathbf{y}} = \\mathbf{X}(\\mathbf{X}^T\\mathbf{X})^{-1}\\mathbf{X}^T \\mathbf{y}$ are the projection; the residuals $\\mathbf{e} = \\mathbf{y} - \\hat{\\mathbf{y}}$ are orthogonal to $\\hat{\\mathbf{y}}$. This orthogonality is why $\\sum e_i = 0$ and $\\sum x_i e_i = 0$ are always exactly satisfied (they are the normal equations).",
      "**R3 — Scale and centering invariance.** Centering $x$ by subtracting $\\bar{x}$ does not change $b_1$ — it only shifts $b_0$ to equal $\\bar{y}$ (since the line now passes through the origin in centered coordinates). Scaling $x$ by a constant $c$ multiplies $b_1$ by $1/c$ but preserves fitted values: if you convert hours to minutes, the slope changes from 4.2 points/hour to 0.07 points/minute, but predicted scores are identical.",
      "**R4 — Forward link: multiple regression.** Adding additional predictors $x_2, x_3, \\ldots, x_p$ generalizes simple regression to the matrix form $\\mathbf{y} = \\mathbf{X}\\boldsymbol{\\beta} + \\boldsymbol{\\varepsilon}$, with OLS solution $\\hat{\\boldsymbol{\\beta}} = (\\mathbf{X}^T\\mathbf{X})^{-1}\\mathbf{X}^T\\mathbf{y}$. Each coefficient $\\hat{\\beta}_j$ now measures the effect of $x_j$ holding all other predictors constant — the 'partial effect.' This is the mechanism by which regression 'controls for' confounders in observational studies (with the caveat from stat1-003: only measured confounders are controlled).",
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
        cellTitle: "Residual diagnostics",
        code: `import numpy as np

resid = df['resid'].values
print(f"Residual mean:  {np.mean(resid):.4f}  (OLS guarantees ≈ 0)")
print(f"Residual std:   {np.std(resid, ddof=1):.4f}")

# Pattern check: correlation of residuals with x
corr_rx = np.corrcoef(df['hours'], resid)[0, 1]
print(f"corr(x, residual): {corr_rx:.4f}  (should be ≈ 0 for good fit)")
print()
if abs(corr_rx) > 0.1:
    print("WARNING: residuals correlate with x — possible misspecification.")
else:
    print("Residuals show no linear pattern with x — linear fit is appropriate.")
`,
        instructions:
          "OLS guarantees that residuals have zero mean and zero correlation with x. A strong non-zero correlation or any visible pattern (curvature, fan shape) in a residual plot signals model failure.",
      },
      {
        id: "stat1-005-cell-3",
        type: "python",
        cellTitle: "Visualize regression: scatter + fitted line + residual plot",
        code: `import numpy as np
import matplotlib.pyplot as plt

np.random.seed(4)
hours = np.linspace(1, 10, 80)
scores = 48 + 4.2 * hours + np.random.normal(0, 5, size=len(hours))

# Fit OLS manually
xbar, ybar = hours.mean(), scores.mean()
Sxx = ((hours - xbar) ** 2).sum()
Sxy = ((hours - xbar) * (scores - ybar)).sum()
b1 = Sxy / Sxx
b0 = ybar - b1 * xbar
yhat = b0 + b1 * hours
resid = scores - yhat
R2 = 1 - (resid ** 2).sum() / ((scores - ybar) ** 2).sum()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))

# Left: scatter + fitted line
ax1.scatter(hours, scores, alpha=0.5, color="steelblue", s=30, label="Observed")
x_line = np.array([hours.min(), hours.max()])
ax1.plot(x_line, b0 + b1 * x_line, color="crimson", lw=2,
         label=f"ŷ = {b0:.1f} + {b1:.2f}x   R²={R2:.3f}")
ax1.set_xlabel("Study Hours")
ax1.set_ylabel("Exam Score")
ax1.set_title("Scatter Plot + OLS Regression Line")
ax1.legend(fontsize=9)

# Right: residual plot
ax2.scatter(hours, resid, alpha=0.5, color="orange", s=30)
ax2.axhline(0, color="black", lw=1.5, linestyle="--")
ax2.set_xlabel("Study Hours (x)")
ax2.set_ylabel("Residual  (y - ŷ)")
ax2.set_title("Residual Plot\\n(random scatter = good; patterns = bad)")

plt.tight_layout()
plt.show()
print(f"b0 = {b0:.3f}  (intercept: predicted score at 0 hours)")
print(f"b1 = {b1:.3f}  (slope: each extra hour → +{b1:.1f} points on average)")
print(f"R² = {R2:.3f}  ({R2*100:.1f}% of score variance explained by study hours)")
`,
        instructions:
          "The scatter + line plot shows the OLS fit. The residual plot shows random scatter around zero — confirming the linear model is appropriate here. Change the random seed or try adding a nonlinear term to the score generation to see what a bad residual plot looks like.",
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
      text: "If b₁ is negative, then as x increases, predicted y tends to:",
      options: ["Increase", "Decrease", "Stay constant", "Become undefined"],
      answer: "Decrease",
      hints: [
        "Sign of the slope controls the direction of the relationship.",
        "ŷ = b₀ + b₁x: if b₁ < 0, larger x makes b₁x more negative.",
      ],
      reviewSection:
        'Intuition → "Interpreting slope and intercept" paragraph',
    },
    {
      id: "stat1-005-quiz-7",
      type: "choice",
      text: "R² = 0.85 for a regression of exam score on study hours. The best interpretation is:",
      options: [
        "The regression line passes through 85% of the data points",
        "85% of the variation in exam scores is explained by the linear relationship with study hours",
        "The slope is statistically significant at the 85% level",
        "85% of predictions fall within one standard deviation of the observed values",
      ],
      answer:
        "85% of the variation in exam scores is explained by the linear relationship with study hours",
      hints: [
        "R² = 1 − SSE/SST. SST is total variance; SSE is unexplained residual variance.",
        "R² = 0 means the model explains nothing; R² = 1 means perfect fit.",
      ],
      reviewSection: 'Math section — "Goodness of fit" and R² formula',
    },
    {
      id: "stat1-005-quiz-8",
      type: "choice",
      text: "The OLS slope b₁ is computed as:",
      options: [
        "S_{xy} / S_{xx}",
        "S_{xx} / S_{xy}",
        "ȳ − b₀x̄",
        "(Σy) / (Σx)",
      ],
      answer: "S_{xy} / S_{xx}",
      hints: [
        "S_{xy} = Σ(xᵢ − x̄)(yᵢ − ȳ) is the covariance sum; S_{xx} = Σ(xᵢ − x̄)² is the variance sum for x.",
        "Slope = covariation in x and y ÷ variation in x alone.",
      ],
      reviewSection: 'Math section — "Least-squares formulas"',
    },
    {
      id: "stat1-005-quiz-9",
      type: "choice",
      text: "Why is predicting y for x values far outside the observed data range unreliable?",
      options: [
        "The formula b₀ + b₁x becomes undefined for x outside the range",
        "The linear relationship verified within the data may not hold beyond those x values",
        "The standard error becomes negative outside the observed range",
        "R² drops to zero for extrapolated predictions",
      ],
      answer:
        "The linear relationship verified within the data may not hold beyond those x values",
      hints: [
        "A linear fit is only checked to be adequate within the range of observed x.",
        "Consider: a growth model for plants watered 0–20 cm/week predicts impossible things at 500 cm/week.",
      ],
      reviewSection:
        'Intuition → "Extrapolation: the edge of the model" paragraph',
    },
    {
      id: "stat1-005-quiz-10",
      type: "choice",
      text: "The intercept b₀ in ŷ = b₀ + b₁x is best interpreted as:",
      options: [
        "The rate of change in y per one-unit increase in x",
        "The predicted value of y when x = 0 (if x = 0 is within or near the observed data range)",
        "The average residual across all observations",
        "The Pearson correlation coefficient between x and y",
      ],
      answer:
        "The predicted value of y when x = 0 (if x = 0 is within or near the observed data range)",
      hints: [
        "Set x = 0 in ŷ = b₀ + b₁(0) = b₀.",
        "If x = 0 is far outside the observed data range, b₀ is an extrapolation and may be meaningless in context.",
      ],
      reviewSection:
        'Intuition → "Interpreting slope and intercept with units" paragraph',
    },
  ],

  definitions: [
    {
      term: "simple linear regression",
      definition:
        "A statistical model ŷ = b₀ + b₁x that fits a straight line to data by minimizing the sum of squared residuals (OLS); used to predict a continuous response from a single predictor.",
    },
    {
      term: "slope (b₁)",
      definition:
        "The expected change in the response y for a one-unit increase in the predictor x; always interpreted with units (e.g., points per hour). Equal to S_{xy} / S_{xx}.",
    },
    {
      term: "intercept (b₀)",
      definition:
        "The predicted value of y when x = 0; only meaningful if x = 0 is within or near the observed data range. Equal to ȳ − b₁x̄.",
    },
    {
      term: "residual (eᵢ)",
      definition:
        "The difference between the observed value and the fitted value: eᵢ = yᵢ − ŷᵢ. Positive means the model underpredicted; negative means overpredicted. OLS guarantees residuals sum to zero.",
    },
    {
      term: "R² (coefficient of determination)",
      definition:
        "The proportion of total variance in y explained by the linear model: R² = 1 − SSE/SST. Ranges from 0 (no fit) to 1 (perfect fit); equals r² (Pearson correlation squared) in simple regression.",
    },
    {
      term: "ordinary least squares (OLS)",
      definition:
        "The method of fitting a regression line by minimizing SSE = Σ(yᵢ − ŷᵢ)²; produces the Best Linear Unbiased Estimators (BLUE) under the Gauss-Markov assumptions.",
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
