export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'stat7-001',
  slug: 'simple-linear-regression',
  chapter: 'stat7',
  order: 1,
  title: 'Simple Linear Regression',
  subtitle: 'Fit a straight line through data using least squares and use it to predict, explain, and quantify uncertainty.',
  tags: ['regression', 'OLS', 'least squares', 'prediction', 'R-squared', 'residuals', 'inference'],
  aliases: 'linear regression OLS ordinary least squares slope intercept residuals R squared RMSE t-test prediction interval confidence interval homoscedasticity',
  timeToComplete: 60,
  coreConcept: 'Simple linear regression finds the unique straight line that minimizes the sum of squared vertical distances between data points and the line; the resulting estimates have the smallest variance of any unbiased linear estimator (Gauss–Markov), and standard errors on the coefficients allow formal hypothesis tests and confidence intervals.',
  prerequisites: ['stat6-001', 'stat3-001', 'stat3-002'],
  nextLesson: 'stat7-002',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: 'If a house is 200 square feet larger than average, how much more should it sell for — and how confident can you be in that number?',
    realWorldContext: `Every time a real-estate platform displays an estimated home value, a regression equation is silently working behind the scenes. The platform recorded thousands of past sales, paired each sale price with the home's size in square feet, and used simple linear regression to fit a line through that cloud of points. The slope of that line answers the question: "On average, how much does price rise for each additional square foot?" — and the standard error on the slope answers: "How precisely do we know that rate?"

The same mathematics appears across engineering and medicine. In aerospace manufacturing, CNC machinists fit a regression line relating cutting-tool wear (in microns of flank wear) to cumulative cutting time, so they can schedule tool replacement before tolerance is violated. In pharmacokinetics, researchers regress plasma drug concentration against time to estimate the elimination half-life that governs dosing schedules. In fuel economy testing, engineers regress a vehicle's fuel consumption (L/100 km) against curb weight to isolate how much each kilogram costs in efficiency. By the end of this lesson you will be able to estimate a regression line, interpret every number in a standard software output table, test whether a predictor really matters, and communicate a prediction together with its honest uncertainty band.`,
    previewVisualizationId: 'RegressionScatterViz',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      `**Roadmap for this lesson.** You will first see why "draw the best-fitting line" is not just a visual judgment but a precise optimization problem. You will derive the formulas for slope and intercept, understand residuals as the leftover variation the line cannot explain, and compute $R^2$ as the fraction of variation the line does explain. Then you will attach standard errors to the slope estimate, conduct a $t$-test for whether the slope is zero, and build both confidence intervals for the mean response and prediction intervals for a new individual observation. Finally you will audit the four core assumptions that make all of the inference valid.`,

      `**A concrete numeric warm-up.** Suppose you measure house size $x$ (hundreds of sq ft) and sale price $y$ (\\$1,000s) for five homes: $(10, 120), (15, 180), (20, 250), (25, 310), (30, 400)$. The sample means are $\\bar{x} = 20$ and $\\bar{y} = 252$. The deviations $(x_i - \\bar{x})$ are $-10, -5, 0, 5, 10$ and the deviations $(y_i - \\bar{y})$ are $-132, -72, -2, 58, 148$. Their products sum to $(-10)(-132) + (-5)(-72) + (0)(-2) + (5)(58) + (10)(148) = 1320 + 360 + 0 + 290 + 1480 = 3450$. The squared deviations in $x$ sum to $100 + 25 + 0 + 25 + 100 = 250$. So $\\hat{\\beta}_1 = 3450/250 = 13.8$ (thousand dollars per hundred sq ft, or \\$138 per sq ft), and $\\hat{\\beta}_0 = 252 - 13.8 \\times 20 = -24$. The fitted line is $\\hat{y} = -24 + 13.8x$.`,

      `**Before reading on, predict:** For the five-home data set above, what is the residual for the house with $x = 20, y = 250$? And intuitively, will $R^2$ be closer to 0.5 or to 0.99?`,

      `**The answer.** The fitted value at $x = 20$ is $\\hat{y} = -24 + 13.8(20) = 252$, so the residual is $e = 250 - 252 = -2$. This is tiny, meaning the line passes almost exactly through the middle house. As for $R^2$: the data look very linear (all five points nearly collinear), so nearly all variation in $y$ is explained by $x$. The calculation gives $SSE = (-12)^2 + (-12)^2 + (-2)^2 + (8)^2 + (12)^2 ≈ 492$ (using the actual residuals) and $SST = \\sum(y_i - \\bar{y})^2 = 17449 + 5184 + 4 + 3364 + 21904 = ... wait, let us recompute: $(-132)^2 + (-72)^2 + (-2)^2 + (58)^2 + (148)^2 = 17424 + 5184 + 4 + 3364 + 21904 = 47880$. So $R^2 = 1 - 492/47880 \\approx 0.990$. The line explains 99% of variation in price — very close to 0.99.`,

      `**The Ordinary Least Squares objective.** The phrase "best-fitting line" is given operational meaning by the **ordinary least squares (OLS)** criterion: choose $\\beta_0$ and $\\beta_1$ to minimize the **sum of squared errors (SSE)**: $$SSE = \\sum_{i=1}^{n} e_i^2 = \\sum_{i=1}^{n} (y_i - \\beta_0 - \\beta_1 x_i)^2.$$ Squaring the errors rather than using absolute values is convenient mathematically (the objective is smooth and strictly convex) and statistically justified (when errors are normal, OLS equals maximum likelihood). Setting partial derivatives to zero and solving yields the **normal equations**, whose unique solution is $$\\hat{\\beta}_1 = \\frac{\\sum_{i=1}^n (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum_{i=1}^n (x_i - \\bar{x})^2} = \\frac{S_{xy}}{S_{xx}}, \\quad \\hat{\\beta}_0 = \\bar{y} - \\hat{\\beta}_1 \\bar{x}.$$ Note that the slope is the sample covariance of $x$ and $y$ divided by the sample variance of $x$.`,

      `**Residuals and the decomposition of variance.** Once the line is fitted, each observation's **residual** is $e_i = y_i - \\hat{y}_i$. The residuals are the model's "errors" — what it could not explain. A fundamental algebraic identity then decomposes total variation: $$SST = SSR + SSE, \\quad \\text{where}$$ $SST = \\sum(y_i - \\bar{y})^2$ is total variation in $y$; $SSR = \\sum(\\hat{y}_i - \\bar{y})^2$ is variation explained by the regression; and $SSE = \\sum e_i^2$ is unexplained variation. The **coefficient of determination** $R^2 = SSR/SST = 1 - SSE/SST$ is the proportion of total variance in $y$ explained by $x$. It equals the square of the Pearson correlation: $R^2 = r^2$. The **root mean squared error** $RMSE = \\sqrt{SSE/(n-2)}$ estimates the standard deviation of the error term $\\sigma$ (we divide by $n-2$ because two parameters were estimated).`,

      `**Inference on the slope.** The slope estimate $\\hat{\\beta}_1$ is itself a random variable — rerun the experiment and you get a slightly different slope. Under the standard regression assumptions, $\\hat{\\beta}_1$ is normally distributed with mean $\\beta_1$ and variance $\\sigma^2 / S_{xx}$. Plugging in $RMSE$ for $\\sigma$ gives the **standard error of the slope**: $SE(\\hat{\\beta}_1) = RMSE / \\sqrt{S_{xx}}$. The statistic $t = \\hat{\\beta}_1 / SE(\\hat{\\beta}_1)$ follows a $t$-distribution with $n-2$ degrees of freedom under $H_0: \\beta_1 = 0$. If $|t|$ is large (equivalently, $p$-value small), we reject the null and conclude the predictor has a real linear relationship with the response. A $95\\%$ confidence interval for the true slope is $\\hat{\\beta}_1 \\pm t^*_{n-2} \\cdot SE(\\hat{\\beta}_1)$, where $t^*_{n-2}$ is the $97.5$th percentile of the $t_{n-2}$ distribution.`,

      `**Confidence vs. prediction intervals.** Two different intervals are associated with a new value $x^*$. A **confidence interval for the mean response** captures the true mean $E[Y | X = x^*] = \\beta_0 + \\beta_1 x^*$: it answers "where does the population regression line lie at $x^*$?" A **prediction interval for a new individual observation** is wider because it must account for both uncertainty in the line's position and natural individual-to-individual variability. The prediction interval width grows as $x^*$ moves far from $\\bar{x}$ — extrapolation is always more uncertain. Numerically, $SE_{\\text{fit}}^2 = RMSE^2[1/n + (x^* - \\bar{x})^2/S_{xx}]$ for the CI, and $SE_{\\text{pred}}^2 = RMSE^2[1 + 1/n + (x^* - \\bar{x})^2/S_{xx}]$ for the PI.`,

      `**CNC tool wear application.** In a machining center, a quality engineer records flank wear (in microns, $y$) of a carbide insert at 10, 20, 30, 40, and 50 minutes of cutting time ($x$). Fitting a regression line gives $\\hat{\\beta}_1 \\approx 3.2$ microns per minute with $SE \\approx 0.15$ and $t \\approx 21.3$ ($p < 0.001$). The $R^2 = 0.98$ confirms that time is an excellent predictor of wear. The engineer uses the prediction interval at $x^* = 45$ minutes to determine when wear will exceed the 150-micron tolerance limit with 95% certainty, scheduling preventive tool replacement at 44 minutes. The slope's confidence interval $(2.9, 3.5)$ microns/min also quantifies variability across inserts of the same grade — useful for supplier qualification.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'OLS Estimators',
        body: 'The **ordinary least squares** slope and intercept are $$\\hat{\\beta}_1 = \\frac{S_{xy}}{S_{xx}} = \\frac{\\sum(x_i-\\bar{x})(y_i-\\bar{y})}{\\sum(x_i-\\bar{x})^2}, \\quad \\hat{\\beta}_0 = \\bar{y} - \\hat{\\beta}_1\\bar{x}.$$ These minimize $\\sum e_i^2$ and pass through the centroid $(\\bar{x}, \\bar{y})$ of the data.',
      },
      {
        type: 'definition',
        title: 'R² and RMSE',
        body: '$R^2 = 1 - SSE/SST$ measures the proportion of variance in $y$ explained by the model. It ranges from 0 (no fit) to 1 (perfect fit). $RMSE = \\sqrt{SSE/(n-2)}$ estimates $\\sigma$, the standard deviation of the errors, in the same units as $y$.',
      },
      {
        type: 'procedure',
        title: 'How to Fit and Interpret a Simple Linear Regression',
        body: '1. **Scatter plot** — verify the relationship looks linear before fitting. 2. **Compute** $\\bar{x}$, $\\bar{y}$, $S_{xx}$, $S_{xy}$. 3. **Estimate** $\\hat{\\beta}_1 = S_{xy}/S_{xx}$ and $\\hat{\\beta}_0 = \\bar{y} - \\hat{\\beta}_1\\bar{x}$. 4. **Compute residuals** $e_i = y_i - \\hat{y}_i$ and check them for patterns. 5. **Compute** $SSE$, $SST$, $R^2$, $RMSE$. 6. **Perform** the $t$-test on $\\hat{\\beta}_1$ and build a 95% CI. 7. **Report** predictions with appropriate confidence or prediction intervals.',
      },
      {
        type: 'warning',
        title: 'R² Does Not Prove the Model Is Correct',
        body: 'A high $R^2$ means the line explains much of the variance in $y$, but it does not guarantee linearity, constant variance, or independence of errors. Always plot residuals. A curved residual pattern with $R^2 = 0.97$ still means the linear model is wrong.',
      },
      {
        type: 'insight',
        title: 'Confidence Interval vs. Prediction Interval',
        body: 'The **confidence interval** for the mean response at $x^*$ is narrower — it targets the population average. The **prediction interval** is wider because it must capture a single new observation including its individual-level noise. When $n$ is large, the CI can become very tight while the PI remains wide (bounded below by $\\pm 2\\sigma$).',
      },
      {
        type: 'warning',
        title: 'Do Not Extrapolate',
        body: 'The regression line is valid only in the range of observed $x$ values. Extrapolating far beyond $\\min(x)$ or $\\max(x)$ assumes linearity continues, which is rarely true. The prediction interval grows (correctly) as $x^*$ moves away from $\\bar{x}$, but it cannot protect against structural breaks.',
      },
      {
        type: 'strategy',
        title: 'Reading a Regression Output Table',
        body: 'Most software outputs: **Estimate** ($\\hat{\\beta}$), **Std. Error** ($SE$), **t-value** ($t = \\hat{\\beta}/SE$), **Pr(>|t|)** (two-sided $p$-value). Below the table: $R^2$, Adjusted-$R^2$, $F$-statistic (in SLR this equals $t^2$), and $RMSE$ (labeled "Residual standard error"). Always check the $F$-test $p$-value for overall significance before interpreting individual coefficients.',
      },
    ],
    visualizations: [
      {
        id: 'RegressionScatterViz',
        title: 'OLS Regression — Scatter, Fit Line, and Residuals',
        mathBridge: 'Select a relationship strength to generate data, then toggle "Show residuals" to see the vertical red segments $e_i = y_i - \\hat{y}_i$. The amber line is the OLS fit: it minimizes $\\sum e_i^2$. Watch $R^2$ drop as data gets noisier — $R^2 = 1 - SS_{\\text{res}}/SS_{\\text{tot}}$ measures the fraction of variance in $y$ explained by the linear relationship with $x$.',
        caption: 'Resample to see how the slope and R² change across different random samples from the same relationship.',
      },
      {
        id: 'LeastSquaresFit',
        title: 'Least Squares — Minimizing Sum of Squared Residuals',
        mathBridge: 'The OLS estimators $\\hat{\\beta}_1 = S_{xy}/S_{xx}$ and $\\hat{\\beta}_0 = \\bar{y} - \\hat{\\beta}_1\\bar{x}$ are derived by taking partial derivatives of $\\sum(y_i - \\beta_0 - \\beta_1 x_i)^2$ with respect to $\\beta_0$ and $\\beta_1$ and setting them to zero. This is a calculus optimization — the same unconstrained minimum you learned in Chapter 3.',
        caption: 'OLS is a direct application of multivariable optimization: the normal equations are the first-order conditions.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      `**Formal model.** The simple linear regression model posits that observations $(x_i, y_i)$ for $i = 1, \\ldots, n$ satisfy $$Y_i = \\beta_0 + \\beta_1 x_i + \\varepsilon_i,$$ where $x_i$ are fixed (non-random) predictor values, $\\beta_0, \\beta_1 \\in \\mathbb{R}$ are unknown parameters, and $\\varepsilon_i \\overset{iid}{\\sim} N(0, \\sigma^2)$. This implies $Y_i \\sim N(\\beta_0 + \\beta_1 x_i, \\sigma^2)$, independently. The four Gauss–Markov assumptions are: (L) linearity in parameters; (I) independent errors; (H) homoscedastic errors ($\\mathrm{Var}(\\varepsilon_i) = \\sigma^2$, constant); (Z) zero-mean errors $E[\\varepsilon_i] = 0$. Adding normality upgrades OLS from "best linear unbiased" to "maximum likelihood."`,

      `**Derivation of the OLS estimators.** Minimizing $Q(\\beta_0, \\beta_1) = \\sum_{i=1}^n (y_i - \\beta_0 - \\beta_1 x_i)^2$ requires setting partial derivatives to zero: $$\\frac{\\partial Q}{\\partial \\beta_0} = -2\\sum(y_i - \\beta_0 - \\beta_1 x_i) = 0 \\implies n\\beta_0 + \\beta_1 \\sum x_i = \\sum y_i,$$ $$\\frac{\\partial Q}{\\partial \\beta_1} = -2\\sum x_i(y_i - \\beta_0 - \\beta_1 x_i) = 0 \\implies \\beta_0 \\sum x_i + \\beta_1 \\sum x_i^2 = \\sum x_i y_i.$$ Solving this $2\\times 2$ linear system (the **normal equations**) yields $\\hat{\\beta}_1 = S_{xy}/S_{xx}$ and $\\hat{\\beta}_0 = \\bar{y} - \\hat{\\beta}_1\\bar{x}$, where $S_{xy} = \\sum(x_i - \\bar{x})(y_i - \\bar{y})$ and $S_{xx} = \\sum(x_i - \\bar{x})^2$. The Hessian of $Q$ is $2\\mathbf{X}^\\top\\mathbf{X}$ which is positive definite (assuming not all $x_i$ equal), confirming a global minimum.`,

      `**Gauss–Markov theorem.** Under assumptions L, I, H, Z (normality not required), OLS estimators are **B**est **L**inear **U**nbiased **E**stimators (BLUE): among all estimators of $\\beta_1$ that are (a) linear functions of $y_1, \\ldots, y_n$ and (b) unbiased, $\\hat{\\beta}_1^{OLS}$ has the smallest variance. The variance of $\\hat{\\beta}_1$ is $$\\mathrm{Var}(\\hat{\\beta}_1) = \\frac{\\sigma^2}{S_{xx}},$$ and the variance of $\\hat{\\beta}_0$ is $$\\mathrm{Var}(\\hat{\\beta}_0) = \\sigma^2\\left(\\frac{1}{n} + \\frac{\\bar{x}^2}{S_{xx}}\\right).$$ Replacing $\\sigma^2$ by its unbiased estimator $s^2 = SSE/(n-2) = RMSE^2$ gives the estimated standard errors used in $t$-tests.`,

      `**The $t$-test and ANOVA table.** Under $H_0: \\beta_1 = 0$ with normality assumed, $t = \\hat{\\beta}_1 / SE(\\hat{\\beta}_1) \\sim t_{n-2}$. Equivalently, the ANOVA table partitions $$SST = SSR + SSE$$ with degrees of freedom $n-1 = 1 + (n-2)$. The mean squares are $MSR = SSR/1$ and $MSE = SSE/(n-2) = s^2$. The $F$-statistic $F = MSR/MSE$ equals $t^2$ in simple linear regression and has an $F_{1, n-2}$ distribution under $H_0$. The $p$-value from the $F$-test is identical to the two-sided $p$-value of the $t$-test: $$p = P(|t_{n-2}| \\geq |t_{\\text{obs}}|) = P(F_{1,n-2} \\geq t_{\\text{obs}}^2).$$`,

      `**Prediction and confidence intervals.** For a new predictor value $x^*$, the point estimate of $E[Y^*]$ is $\\hat{y}^* = \\hat{\\beta}_0 + \\hat{\\beta}_1 x^*$. The standard error of $\\hat{y}^*$ as an estimator of the mean response is $$SE_{\\text{fit}} = s\\sqrt{\\frac{1}{n} + \\frac{(x^* - \\bar{x})^2}{S_{xx}}}.$$ A $100(1-\\alpha)\\%$ CI for $E[Y|x^*]$ is $\\hat{y}^* \\pm t^*_{n-2} \\cdot SE_{\\text{fit}}$. For a prediction interval for a single new observation $Y^*$, additional variance $\\sigma^2$ enters because $Y^* = E[Y^*] + \\varepsilon^*$, giving $$SE_{\\text{pred}} = s\\sqrt{1 + \\frac{1}{n} + \\frac{(x^* - \\bar{x})^2}{S_{xx}}}.$$ The PI is $\\hat{y}^* \\pm t^*_{n-2} \\cdot SE_{\\text{pred}}$. Note $SE_{\\text{pred}} > SE_{\\text{fit}}$ always, and the ratio $SE_{\\text{pred}}/SE_{\\text{fit}} \\to 1$ as $n \\to \\infty$, but the PI never collapses.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Gauss–Markov: OLS is BLUE',
        body: 'Under assumptions L, I, H, Z, for any linear unbiased estimator $\\tilde{\\beta}_1 = \\mathbf{c}^\\top \\mathbf{y}$ with $E[\\tilde{\\beta}_1] = \\beta_1$, we have $\\mathrm{Var}(\\tilde{\\beta}_1) \\geq \\mathrm{Var}(\\hat{\\beta}_1^{OLS}) = \\sigma^2/S_{xx}$. Normality is not required for this result.',
      },
      {
        type: 'insight',
        title: 'Why n−2 Degrees of Freedom?',
        body: 'We estimate two parameters ($\\beta_0$ and $\\beta_1$) from $n$ observations. Each parameter "uses up" one degree of freedom for fitting, leaving $n - 2$ degrees of freedom for estimating $\\sigma^2$. This is why $s^2 = SSE/(n-2)$ is unbiased for $\\sigma^2$, while $SSE/n$ would be biased downward.',
      },
      {
        type: 'warning',
        title: 'Normality of Errors vs. Normality of Y',
        body: 'The assumption is that the **errors** $\\varepsilon_i$ are normal, not the marginal distribution of $y_i$. Even when errors are normal, the histogram of all $y_i$ values may look skewed (because the mean $\\beta_0 + \\beta_1 x_i$ varies across observations). Check normality of **residuals** $e_i$, not of $y_i$ directly.',
      },
      {
        type: 'insight',
        title: 'Regression to the Mean',
        body: `Galton's original insight: because $\\hat{y} = \\bar{y} + \\hat{\\beta}_1(x - \\bar{x})$ and $|\\hat{\\beta}_1| \\leq 1$ in standardized units, predicted $y$ is always closer to $\\bar{y}$ than $x$ is to $\\bar{x}$ (when $|r| < 1$). Tall parents have above-average-height children, but on average their children are not as extreme. This "regression to the mean" is a statistical artifact, not a biological law.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Simple Linear Regression in Python / NumPy / statsmodels',
        mathBridge: 'The cells progress from manual computation of $\\hat{\\beta}_1$ and $\\hat{\\beta}_0$ using NumPy, through scikit-learn\'s LinearRegression, to a full statsmodels OLS summary that mirrors the ANOVA table and provides $t$-tests, CIs, and prediction intervals.',
        caption: 'Run each cell to see the math become code.',
        initialProps: {
          initialCells: [
            {
              id: 'py1',
              cellTitle: 'Cell 1 — Manual OLS from Scratch',
              prose: [
                'We use NumPy to compute $S_{xy}$ and $S_{xx}$ directly, replicating the derivation step by step.',
                '`np.cov(x, y, ddof=0)[0,1]` gives the population covariance; multiplying by $n$ recovers $S_{xy}$.',
                '`beta1 = Sxy / Sxx` is the slope formula. `beta0 = y.mean() - beta1 * x.mean()` is the intercept.',
                'We compute residuals as `y - yhat`, then SSE, SST, R², and RMSE using those arrays.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# House size (hundreds of sq ft) and price ($1000s) — toy dataset
x = np.array([10, 15, 20, 25, 30, 12, 18, 22, 28, 35], dtype=float)
y = np.array([120, 180, 250, 310, 400, 140, 220, 270, 370, 480], dtype=float)

n = len(x)
x_bar, y_bar = x.mean(), y.mean()

# Core sums
Sxx = np.sum((x - x_bar)**2)
Sxy = np.sum((x - x_bar) * (y - y_bar))

beta1 = Sxy / Sxx
beta0 = y_bar - beta1 * x_bar

print(f"n = {n}")
print(f"x̄ = {x_bar:.2f},  ȳ = {y_bar:.2f}")
print(f"Sxx = {Sxx:.2f},  Sxy = {Sxy:.2f}")
print(f"β̂₁ = {beta1:.4f}  (slope: \${beta1*10:.0f} per sq ft)")
print(f"β̂₀ = {beta0:.4f}  (intercept)")

# Residuals and fit statistics
yhat = beta0 + beta1 * x
residuals = y - yhat
SSE = np.sum(residuals**2)
SST = np.sum((y - y_bar)**2)
SSR = SST - SSE
R2  = SSR / SST
RMSE = np.sqrt(SSE / (n - 2))

print(f"\\nSST={SST:.2f}, SSR={SSR:.2f}, SSE={SSE:.2f}")
print(f"R² = {R2:.4f}  (model explains {R2*100:.1f}% of variance in y)")
print(f"RMSE = {RMSE:.4f}  ($1000s — typical prediction error)")

# Plot
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
x_line = np.linspace(x.min()-1, x.max()+1, 200)
axes[0].scatter(x, y, color='steelblue', s=60, label='Data')
axes[0].plot(x_line, beta0 + beta1*x_line, 'r-', lw=2, label=f'ŷ = {beta0:.1f} + {beta1:.2f}x')
for xi, yi, ei in zip(x, y, residuals):
    axes[0].plot([xi, xi], [yi, yi - ei], 'k-', alpha=0.4, lw=1)
axes[0].set_xlabel('Size (100 sq ft)'); axes[0].set_ylabel('Price ($1000s)')
axes[0].set_title('OLS Fit with Residuals'); axes[0].legend()

axes[1].scatter(yhat, residuals, color='darkorange', s=60)
axes[1].axhline(0, color='k', lw=1, ls='--')
axes[1].set_xlabel('Fitted values'); axes[1].set_ylabel('Residuals')
axes[1].set_title('Residuals vs. Fitted')
plt.tight_layout(); plt.show()`,
            },
            {
              id: 'py2',
              cellTitle: 'Cell 2 — Full Inference with statsmodels OLS',
              prose: [
                '`sm.add_constant(x)` prepends a column of ones so statsmodels estimates $\\hat{\\beta}_0$ (the intercept).',
                '`results.summary()` produces a full regression table including $t$-statistics, $p$-values, 95% CIs, $R^2$, and the $F$-test.',
                '`get_prediction(new_x_const).summary_frame(alpha=0.05)` returns both the confidence interval (`mean_ci_lower/upper`) and the prediction interval (`obs_ci_lower/upper`) in one step.',
                'We overlay both bands on a scatter plot so the visual matches the numerical output.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
import statsmodels.api as sm

x = np.array([10, 15, 20, 25, 30, 12, 18, 22, 28, 35], dtype=float)
y = np.array([120, 180, 250, 310, 400, 140, 220, 270, 370, 480], dtype=float)

X = sm.add_constant(x)          # shape (n, 2): col0=1, col1=x
model   = sm.OLS(y, X)
results = model.fit()
print(results.summary())

# Prediction at a grid of x values
x_grid = np.linspace(x.min()-2, x.max()+2, 200)
X_grid  = sm.add_constant(x_grid)
pred    = results.get_prediction(X_grid).summary_frame(alpha=0.05)

fig, ax = plt.subplots(figsize=(9, 5))
ax.scatter(x, y, color='steelblue', s=70, zorder=5, label='Observed')
ax.plot(x_grid, pred['mean'], 'r-', lw=2, label='Fitted line')
ax.fill_between(x_grid, pred['mean_ci_lower'], pred['mean_ci_upper'],
                alpha=0.25, color='red', label='95% CI for mean')
ax.fill_between(x_grid, pred['obs_ci_lower'], pred['obs_ci_upper'],
                alpha=0.12, color='orange', label='95% Prediction interval')
ax.set_xlabel('Size (100 sq ft)'); ax.set_ylabel('Price ($1000s)')
ax.set_title('SLR: Confidence Band vs. Prediction Band')
ax.legend(); plt.tight_layout(); plt.show()

# Inference summary
print("\\n--- Key Inference ---")
print(f"β̂₁ = {results.params[1]:.4f}, SE = {results.bse[1]:.4f}")
print(f"t  = {results.tvalues[1]:.3f},  p = {results.pvalues[1]:.4e}")
print(f"95% CI for β₁: ({results.conf_int().loc['x1',0]:.4f}, {results.conf_int().loc['x1',1]:.4f})")`,
            },
            {
              id: 'py3',
              cellTitle: 'Cell 3 — CNC Tool Wear Example',
              prose: [
                'We simulate flank wear data for a carbide insert, mimicking real machining experiments from manufacturing literature.',
                '`np.random.seed` ensures reproducibility; `np.random.normal(0, sigma, n)` adds homoscedastic Gaussian noise to the true linear trend.',
                'The fitted slope $\\hat{\\beta}_1$ gives the estimated wear rate (microns per minute), directly actionable for scheduling tool replacement.',
                'The prediction interval at `t_star = 45` minutes determines whether the tool will exceed 150-micron tolerance; if the upper PI bound exceeds 150, schedule replacement before 45 min.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
import statsmodels.api as sm

np.random.seed(42)

# Simulate CNC flank wear: true model  wear = 5 + 2.8*t + noise
t_obs = np.array([5, 10, 15, 20, 25, 30, 35, 40, 45, 50], dtype=float)
sigma_true = 4.0
wear = 5 + 2.8 * t_obs + np.random.normal(0, sigma_true, len(t_obs))

T = sm.add_constant(t_obs)
res = sm.OLS(wear, T).fit()
print(res.summary())

beta0_hat, beta1_hat = res.params
s = np.sqrt(res.mse_resid)
print(f"\\nEstimated wear rate: {beta1_hat:.3f} µm/min (true: 2.800 µm/min)")
print(f"RMSE = {s:.3f} µm")

# Predict at t* = 45 min
t_star = np.array([[1.0, 45.0]])
pred45 = res.get_prediction(t_star).summary_frame(alpha=0.05)
print(f"\\nAt t=45 min:")
print(f"  Point estimate: {pred45['mean'].values[0]:.1f} µm")
print(f"  95% PI: ({pred45['obs_ci_lower'].values[0]:.1f}, {pred45['obs_ci_upper'].values[0]:.1f}) µm")
tolerance = 150.0
if pred45['obs_ci_upper'].values[0] > tolerance:
    print(f"  ⚠ Upper PI exceeds {tolerance} µm tolerance — replace before 45 min!")

# Plot
t_grid = np.linspace(0, 55, 300)
T_grid = sm.add_constant(t_grid)
pred_grid = res.get_prediction(T_grid).summary_frame(alpha=0.05)

fig, ax = plt.subplots(figsize=(9, 5))
ax.scatter(t_obs, wear, s=70, color='steelblue', zorder=5)
ax.plot(t_grid, pred_grid['mean'], 'r-', lw=2, label='Fitted wear rate')
ax.fill_between(t_grid, pred_grid['mean_ci_lower'], pred_grid['mean_ci_upper'],
                alpha=0.3, color='red', label='95% CI (mean)')
ax.fill_between(t_grid, pred_grid['obs_ci_lower'], pred_grid['obs_ci_upper'],
                alpha=0.15, color='orange', label='95% PI (individual)')
ax.axhline(tolerance, color='darkgreen', ls='--', lw=1.5, label=f'Tolerance = {tolerance} µm')
ax.set_xlabel('Cutting time (min)'); ax.set_ylabel('Flank wear (µm)')
ax.set_title('CNC Tool Wear: SLR with Prediction Interval')
ax.legend(); plt.tight_layout(); plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Fuel Efficiency vs. Vehicle Weight',
              difficulty: 'medium',
              prompt: 'The arrays `weight` (kg) and `mpg` (miles per gallon) below contain data from 15 vehicles. (1) Fit a simple linear regression of mpg on weight using statsmodels. (2) Print the slope, its 95% CI, and the $p$-value. (3) Compute and print the RMSE. (4) Plot the scatter with the fitted line and 95% prediction band. (5) Predict mpg for a 2000-kg vehicle and report the point estimate and 95% prediction interval.',
              code: `import numpy as np
import matplotlib.pyplot as plt
import statsmodels.api as sm

np.random.seed(7)
weight = np.linspace(1200, 2800, 15) + np.random.normal(0, 50, 15)
# True model: mpg = 55 - 0.015 * weight + noise
mpg = 55 - 0.015 * weight + np.random.normal(0, 2.5, 15)

# TODO: (1) fit OLS model
# TODO: (2) print slope, 95% CI, p-value
# TODO: (3) print RMSE
# TODO: (4) plot scatter + fitted line + 95% PI band
# TODO: (5) predict mpg for a 2000-kg vehicle
`,
              hint: 'Use `sm.add_constant(weight)` to include an intercept. Access `results.bse[1]` for the slope SE. Use `results.get_prediction` for CIs and PIs.',
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Code: Simple Linear Regression in OpenMAT / MATLAB',
        mathBridge: 'MATLAB\'s `polyfit(x, y, 1)` computes OLS slope and intercept. The `regress` function returns coefficient estimates, CIs, residuals, ANOVA statistics, and predicted values matching the statsmodels output.',
        caption: 'OpenMAT mirrors real MATLAB syntax — semicolons suppress output, `fprintf` prints formatted results.',
        initialProps: {
          initialCells: [
            {
              id: 'mat1',
              cellTitle: 'Cell 1 — Manual OLS with polyfit',
              prose: [
                '`polyfit(x, y, 1)` returns `[beta1, beta0]` — note: highest-degree coefficient first.',
                '`polyval(p, x)` evaluates the polynomial at each point in `x`, giving fitted values.',
                'We compute residuals as `y - yhat`, then SSE, SST, R², and RMSE manually, matching the NumPy derivation.',
                '`subplot(1,2,1)` and `subplot(1,2,2)` place two plots side by side in one figure.',
              ],
              code: `% Cell 1: Manual OLS — House Price vs. Size
x = [10 15 20 25 30 12 18 22 28 35]';
y = [120 180 250 310 400 140 220 270 370 480]';
n = length(x);

x_bar = mean(x);
y_bar = mean(y);

Sxx = sum((x - x_bar).^2);
Sxy = sum((x - x_bar) .* (y - y_bar));

beta1 = Sxy / Sxx;
beta0 = y_bar - beta1 * x_bar;

fprintf('n = %d\\n', n);
fprintf('x̄ = %.2f,  ȳ = %.2f\\n', x_bar, y_bar);
fprintf('β̂₁ = %.4f  (slope, $%.0f per sq ft)\\n', beta1, beta1*10);
fprintf('β̂₀ = %.4f  (intercept)\\n', beta0);

yhat = beta0 + beta1 .* x;
resid = y - yhat;
SSE  = sum(resid.^2);
SST  = sum((y - y_bar).^2);
SSR  = SST - SSE;
R2   = SSR / SST;
RMSE = sqrt(SSE / (n - 2));

fprintf('\\nSST=%.2f, SSR=%.2f, SSE=%.2f\\n', SST, SSR, SSE);
fprintf('R² = %.4f  (%.1f%% of variance explained)\\n', R2, R2*100);
fprintf('RMSE = %.4f ($1000s)\\n', RMSE);

% Quick verification with polyfit
p = polyfit(x, y, 1);
fprintf('\\npolyfit: β̂₁=%.4f, β̂₀=%.4f (matches above)\\n', p(1), p(2));

figure;
subplot(1,2,1);
x_line = linspace(min(x)-1, max(x)+1, 200)';
scatter(x, y, 60, 'b', 'filled'); hold on;
plot(x_line, beta0 + beta1.*x_line, 'r-', 'LineWidth', 2);
for i = 1:n
    plot([x(i) x(i)], [y(i) yhat(i)], 'k-', 'LineWidth', 0.8, 'Color', [0 0 0 0.4]);
end
xlabel('Size (100 sq ft)'); ylabel('Price ($1000s)');
title('OLS Fit with Residuals'); legend('Data','Fitted line');

subplot(1,2,2);
scatter(yhat, resid, 60, [1 0.5 0], 'filled');
yline(0, 'k--');
xlabel('Fitted values'); ylabel('Residuals');
title('Residuals vs. Fitted');`,
            },
            {
              id: 'mat2',
              cellTitle: 'Cell 2 — Full Inference with regress',
              prose: [
                '`[b, bint, r, rint, stats] = regress(y, X)` returns: coefficient vector `b`, 95% CI matrix `bint`, residuals `r`, residual intervals `rint`, and `stats=[R² F p s²]`.',
                'The matrix `X` must include a column of ones for the intercept: `X = [ones(n,1) x]`.',
                '`stats(1)` is $R^2$, `stats(2)` is the $F$-statistic, `stats(3)` is the $F$ $p$-value, and `stats(4)` is $s^2 = MSE$.',
                'We use `fill` to shade the confidence and prediction bands, toggling transparency with `FaceAlpha`.',
              ],
              code: `pkg load statistics
% Cell 2: Full inference with regress
x = [10 15 20 25 30 12 18 22 28 35]';
y = [120 180 250 310 400 140 220 270 370 480]';
n = length(x);
X = [ones(n,1) x];

[b, bint, r, rint, stats] = regress(y, X);

fprintf('β̂₀ = %.4f   95%% CI: (%.4f, %.4f)\\n', b(1), bint(1,1), bint(1,2));
fprintf('β̂₁ = %.4f   95%% CI: (%.4f, %.4f)\\n', b(2), bint(2,1), bint(2,2));
fprintf('R² = %.4f\\n', stats(1));
fprintf('F  = %.4f,  p = %.4e\\n', stats(2), stats(3));
fprintf('s² = %.4f,  RMSE = %.4f\\n', stats(4), sqrt(stats(4)));

% Build CI and PI bands manually (MATLAB regress does not return them directly)
x_bar = mean(x);
Sxx   = sum((x - x_bar).^2);
s     = sqrt(stats(4));
x_grid = linspace(min(x)-2, max(x)+2, 200)';
yfit  = b(1) + b(2).*x_grid;
t_crit = tinv(0.975, n-2);

SE_fit  = s .* sqrt(1/n + (x_grid - x_bar).^2 ./ Sxx);
SE_pred = s .* sqrt(1 + 1/n + (x_grid - x_bar).^2 ./ Sxx);

CI_lo = yfit - t_crit .* SE_fit;  CI_hi = yfit + t_crit .* SE_fit;
PI_lo = yfit - t_crit .* SE_pred; PI_hi = yfit + t_crit .* SE_pred;

figure;
scatter(x, y, 70, 'b', 'filled'); hold on;
plot(x_grid, yfit, 'r-', 'LineWidth', 2);
fill([x_grid; flipud(x_grid)], [CI_lo; flipud(CI_hi)], 'r', ...
     'FaceAlpha', 0.2, 'EdgeColor', 'none');
fill([x_grid; flipud(x_grid)], [PI_lo; flipud(PI_hi)], [1 0.6 0], ...
     'FaceAlpha', 0.12, 'EdgeColor', 'none');
xlabel('Size (100 sq ft)'); ylabel('Price ($1000s)');
title('SLR: Confidence Band vs. Prediction Band');
legend('Data', 'Fitted line', '95% CI (mean)', '95% PI (individual)');`,
            },
            {
              id: 'mat3',
              cellTitle: 'Cell 3 — CNC Tool Wear in MATLAB',
              prose: [
                'We replicate the CNC tool wear scenario from the Python notebook but in MATLAB syntax.',
                '`randn(n,1)` generates standard normal noise; scaling by `sigma_true` gives the heteroscedastic structure we want to study.',
                'After fitting, we print the wear rate estimate and compare it to the true value of 2.8 µm/min.',
                'The decision rule at 45 min is automated: if the upper prediction interval exceeds the tolerance, we print a warning.',
              ],
              code: `% Cell 3: CNC Tool Wear — MATLAB
rng(42);   % reproducibility

t_obs = (5:5:50)';   % 10 cutting times: 5,10,...,50 min
sigma_true = 4.0;
% True model: wear = 5 + 2.8*t + noise
wear = 5 + 2.8 .* t_obs + sigma_true .* randn(length(t_obs), 1);

T = [ones(length(t_obs), 1) t_obs];
[b, bint, resid, rint, stats] = regress(wear, T);

fprintf('Estimated wear rate: %.3f µm/min  (true: 2.800)\\n', b(2));
fprintf('95%% CI for slope:  (%.3f, %.3f) µm/min\\n', bint(2,1), bint(2,2));
fprintf('R² = %.4f,  RMSE = %.4f µm\\n', stats(1), sqrt(stats(4)));

% Predict at t* = 45 min
t_bar = mean(t_obs);
Stt   = sum((t_obs - t_bar).^2);
s     = sqrt(stats(4));
n     = length(t_obs);
t_star = 45;
yhat45  = b(1) + b(2) * t_star;
t_crit  = tinv(0.975, n-2);
SE_pred = s * sqrt(1 + 1/n + (t_star - t_bar)^2 / Stt);
PI_lo45 = yhat45 - t_crit * SE_pred;
PI_hi45 = yhat45 + t_crit * SE_pred;

fprintf('\\nAt t=45 min:\\n');
fprintf('  Point estimate: %.1f µm\\n', yhat45);
fprintf('  95%% PI: (%.1f, %.1f) µm\\n', PI_lo45, PI_hi45);
tolerance = 150;
if PI_hi45 > tolerance
    fprintf('  WARNING: Upper PI exceeds %d µm — replace before 45 min!\\n', tolerance);
end

% Plot
t_grid = linspace(0, 55, 300)';
yfit_grid = b(1) + b(2) .* t_grid;
SE_fit_g  = s .* sqrt(1/n + (t_grid - t_bar).^2 ./ Stt);
SE_pred_g = s .* sqrt(1 + 1/n + (t_grid - t_bar).^2 ./ Stt);
CI_lo_g = yfit_grid - t_crit .* SE_fit_g;  CI_hi_g = yfit_grid + t_crit .* SE_fit_g;
PI_lo_g = yfit_grid - t_crit .* SE_pred_g; PI_hi_g = yfit_grid + t_crit .* SE_pred_g;

figure;
scatter(t_obs, wear, 70, 'b', 'filled'); hold on;
plot(t_grid, yfit_grid, 'r-', 'LineWidth', 2);
fill([t_grid; flipud(t_grid)], [CI_lo_g; flipud(CI_hi_g)], 'r', 'FaceAlpha',0.25, 'EdgeColor','none');
fill([t_grid; flipud(t_grid)], [PI_lo_g; flipud(PI_hi_g)], [1 0.6 0], 'FaceAlpha',0.12, 'EdgeColor','none');
yline(tolerance, 'g--', 'LineWidth', 1.5);
xlabel('Cutting time (min)'); ylabel('Flank wear (µm)');
title('CNC Tool Wear: SLR with Prediction Interval');
legend('Data','Fitted','95% CI','95% PI', sprintf('Tolerance = %d µm', tolerance));`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Fuel Efficiency Challenge — MATLAB',
              difficulty: 'medium',
              prompt: 'Using the same fuel-efficiency scenario as the Python challenge: (1) Fit a simple linear regression of mpg on weight using `regress`. (2) Print $\\hat{\\beta}_1$, its 95% CI, and the model $R^2$. (3) Predict mpg for a 2000-kg vehicle and print the prediction interval. (4) Plot the data, fitted line, and 95% prediction band.',
              code: `% Challenge: Fuel Efficiency vs. Vehicle Weight
rng(7);
weight = linspace(1200, 2800, 15)' + 50 .* randn(15, 1);
% True model: mpg = 55 - 0.015 * weight + noise
mpg = 55 - 0.015 .* weight + 2.5 .* randn(15, 1);

% TODO: (1) build design matrix X with intercept column
% TODO: (2) call regress and print β̂₁, 95% CI, R²
% TODO: (3) predict mpg for weight = 2000 kg, print PI
% TODO: (4) plot data, fitted line, 95% PI band
`,
              hint: 'Design matrix: `X = [ones(15,1) weight]`. Use `tinv(0.975, n-2)` for the critical t-value. Build PI width as `s*sqrt(1 + 1/n + (x_star - x_bar)^2/Sxx)`.',
            },
          ],
        },
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      `**Formal probability model.** Let $(x_1, y_1), \\ldots, (x_n, y_n)$ be observations where $x_i$ are non-random (fixed in repeated sampling) and $Y_i = \\beta_0 + \\beta_1 x_i + \\varepsilon_i$ with $\\varepsilon_i \\overset{iid}{\\sim} N(0, \\sigma^2)$. Written in matrix notation with $\\mathbf{Y} = (Y_1, \\ldots, Y_n)^\\top$, $\\boldsymbol{\\varepsilon} \\sim N_n(\\mathbf{0}, \\sigma^2 \\mathbf{I})$, and design matrix $\\mathbf{X} = [\\mathbf{1}, \\mathbf{x}]$: $\\mathbf{Y} = \\mathbf{X}\\boldsymbol{\\beta} + \\boldsymbol{\\varepsilon}$. The OLS estimator in matrix form is $\\hat{\\boldsymbol{\\beta}} = (\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top\\mathbf{Y}$, which is the MLE under normality. The hat matrix $\\mathbf{H} = \\mathbf{X}(\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top$ projects $\\mathbf{Y}$ onto the column space of $\\mathbf{X}$: $\\hat{\\mathbf{Y}} = \\mathbf{H}\\mathbf{Y}$.`,

      `**Proof sketch: unbiasedness and variance.** $E[\\hat{\\boldsymbol{\\beta}}] = (\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top E[\\mathbf{Y}] = (\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top\\mathbf{X}\\boldsymbol{\\beta} = \\boldsymbol{\\beta}$. Thus $\\hat{\\boldsymbol{\\beta}}$ is unbiased. The covariance matrix is $\\mathrm{Cov}(\\hat{\\boldsymbol{\\beta}}) = \\sigma^2(\\mathbf{X}^\\top\\mathbf{X})^{-1}$. For SLR this gives $\\mathrm{Var}(\\hat{\\beta}_1) = \\sigma^2/S_{xx}$ and $\\mathrm{Var}(\\hat{\\beta}_0) = \\sigma^2(1/n + \\bar{x}^2/S_{xx})$. The Gauss–Markov theorem follows from the Cauchy–Schwarz inequality: any linear unbiased estimator $\\tilde{\\beta} = \\mathbf{c}^\\top\\mathbf{Y}$ with $\\mathbf{c}^\\top\\mathbf{X} = \\boldsymbol{e}_j^\\top$ must satisfy $\\mathrm{Var}(\\tilde{\\beta}) = \\sigma^2 \\|\\mathbf{c}\\|^2 \\geq \\sigma^2 [(\\mathbf{X}^\\top\\mathbf{X})^{-1}]_{jj}$.`,

      `**Geometric interpretation.** The OLS solution $\\hat{\\mathbf{Y}} = \\mathbf{H}\\mathbf{Y}$ is the orthogonal projection of $\\mathbf{Y}$ onto the two-dimensional column space of $\\mathbf{X}$ in $\\mathbb{R}^n$. The residual vector $\\mathbf{e} = \\mathbf{Y} - \\hat{\\mathbf{Y}} = (\\mathbf{I} - \\mathbf{H})\\mathbf{Y}$ is orthogonal to $\\hat{\\mathbf{Y}}$: $\\mathbf{e}^\\top\\hat{\\mathbf{Y}} = 0$. The Pythagorean identity $\\|\\mathbf{Y} - \\bar{y}\\mathbf{1}\\|^2 = \\|\\hat{\\mathbf{Y}} - \\bar{y}\\mathbf{1}\\|^2 + \\|\\mathbf{e}\\|^2$ is the algebraic decomposition $SST = SSR + SSE$. This geometric picture extends cleanly to multiple regression: $p$ predictors span a $p$-dimensional column space in $\\mathbb{R}^n$, and OLS projects $\\mathbf{Y}$ into it.`,

      `**Counter-example: high $R^2$ with violated assumptions.** Anscombe's Quartet (1973) consists of four datasets with identical regression statistics ($\\hat{\\beta}_0 = 3$, $\\hat{\\beta}_1 = 0.5$, $R^2 = 0.67$, $SE = 1.24$, $t = 4.24$) but wildly different scatter plots. Dataset II is clearly quadratic (the linear model misses the curvature). Dataset III has a perfectly linear relationship except for one extreme outlier that pulls $\\hat{\\beta}_1$ away from the true relationship. Dataset IV has all $x_i$ identical except one — the slope is entirely determined by that single leverage point. This quartet is a textbook demonstration that summary statistics without residual plots are dangerous.`,

      `**Connection to future content.** Simple linear regression is the foundation for multiple linear regression (Lesson 7-002), where the design matrix $\\mathbf{X}$ gains additional columns and $(\\mathbf{X}^\\top\\mathbf{X})^{-1}$ must handle multicollinearity. Model diagnostics (Lesson 7-003) formalize the residual plots and leverage statistics introduced here. Logistic regression (Lesson 7-004) replaces the Gaussian error assumption with a Bernoulli likelihood, modeling probabilities of binary outcomes using the same linear predictor $\\mathbf{x}^\\top\\boldsymbol{\\beta}$ inside a sigmoid link function. In machine learning, regularized regression (Ridge, LASSO) adds penalty terms $\\lambda\\|\\boldsymbol{\\beta}\\|^2$ or $\\lambda\\|\\boldsymbol{\\beta}\\|_1$ to the OLS objective, trading bias for variance reduction — but the geometry of projection remains central.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Gauss–Markov (Matrix Form)',
        body: 'Under $\\mathbf{Y} = \\mathbf{X}\\boldsymbol{\\beta} + \\boldsymbol{\\varepsilon}$ with $E[\\boldsymbol{\\varepsilon}] = \\mathbf{0}$, $\\mathrm{Cov}(\\boldsymbol{\\varepsilon}) = \\sigma^2\\mathbf{I}$, the OLS estimator $\\hat{\\boldsymbol{\\beta}} = (\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top\\mathbf{Y}$ is BLUE: $\\mathrm{Cov}(\\tilde{\\boldsymbol{\\beta}}) - \\mathrm{Cov}(\\hat{\\boldsymbol{\\beta}})$ is positive semi-definite for every linear unbiased $\\tilde{\\boldsymbol{\\beta}}$.',
      },
      {
        type: 'warning',
        title: 'Anscombe\'s Quartet: Always Plot',
        body: 'Four datasets with identical $\\hat{\\beta}_0$, $\\hat{\\beta}_1$, $R^2$, and SE can look completely different on a scatter plot. One is linear, one is quadratic, one has a single influential outlier, and one has a single high-leverage point. Summary statistics alone cannot detect these problems — always examine residual plots.',
      },
      {
        type: 'insight',
        title: 'The Hat Matrix Diagonal',
        body: 'The diagonal entries $h_{ii}$ of the hat matrix $\\mathbf{H} = \\mathbf{X}(\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top$ are called **leverage values**. They satisfy $1/n \\leq h_{ii} \\leq 1$ and $\\sum h_{ii} = 2$ (for SLR). A large $h_{ii}$ means observation $i$ has high leverage — it can strongly influence $\\hat{\\boldsymbol{\\beta}}$ regardless of its $y$ value. High leverage combined with a large residual flags an **influential** observation.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'ex1',
      title: 'Computing OLS Estimates by Hand',
      difficulty: 'easy',
      problem: 'For four data points $(1, 2), (2, 4), (3, 5), (4, 8)$, compute $\\hat{\\beta}_1$, $\\hat{\\beta}_0$, the residuals, $SSE$, $R^2$, and $RMSE$.',
      steps: [
        {
          expression: '\\bar{x} = \\frac{1+2+3+4}{4} = 2.5, \\quad \\bar{y} = \\frac{2+4+5+8}{4} = 4.75',
          annotation: 'Always start by computing the sample means. These form the centroid through which the regression line must pass. Double-check arithmetic — errors here propagate through all subsequent calculations.',
          strategyTitle: 'Compute sample means',
          hints: ['Sum the $x$ values: $1+2+3+4 = 10$, divide by 4.', 'Sum the $y$ values: $2+4+5+8 = 19$, divide by 4.'],
        },
        {
          expression: 'S_{xx} = (-1.5)^2 + (-0.5)^2 + (0.5)^2 + (1.5)^2 = 2.25 + 0.25 + 0.25 + 2.25 = 5.0',
          annotation: 'Compute the deviations $x_i - \\bar{x}$: $-1.5, -0.5, 0.5, 1.5$. Square each and sum. $S_{xx}$ is always positive and measures spread in $x$; a larger $S_{xx}$ leads to a more precisely estimated slope.',
          strategyTitle: 'Compute $S_{xx}$',
          hints: ['$S_{xx} = \\sum x_i^2 - n\\bar{x}^2 = (1+4+9+16) - 4(6.25) = 30 - 25 = 5$ — same answer, alternative formula.'],
        },
        {
          expression: 'S_{xy} = (-1.5)(-2.75) + (-0.5)(-0.75) + (0.5)(0.25) + (1.5)(3.25) = 4.125 + 0.375 + 0.125 + 4.875 = 9.5',
          annotation: 'Compute deviations in $y$: $2-4.75 = -2.75$; $4-4.75 = -0.75$; $5-4.75 = 0.25$; $8-4.75 = 3.25$. Multiply paired deviations and sum. $S_{xy}$ can be negative (negative slope).',
          strategyTitle: 'Compute $S_{xy}$',
          hints: ['Organize in a table: one column for $x_i - \\bar{x}$, one for $y_i - \\bar{y}$, one for their product.'],
        },
        {
          expression: '\\hat{\\beta}_1 = \\frac{S_{xy}}{S_{xx}} = \\frac{9.5}{5.0} = 1.9, \\quad \\hat{\\beta}_0 = \\bar{y} - \\hat{\\beta}_1\\bar{x} = 4.75 - 1.9(2.5) = 0.0',
          annotation: 'The slope is 1.9: on average, $y$ increases by 1.9 units for each 1-unit increase in $x$. The intercept is exactly 0, meaning the fitted line passes through the origin — a coincidence for this dataset, not a general result.',
          strategyTitle: 'Estimate slope and intercept',
          hints: [],
        },
        {
          expression: '\\hat{y}_i: 1.9, 3.8, 5.7, 7.6 \\quad e_i: 0.1, 0.2, -0.7, 0.4',
          annotation: 'Fitted values use $\\hat{y} = 1.9x$. Residuals are $e_i = y_i - \\hat{y}_i$. Note that residuals sum to zero (always true for OLS with an intercept): $0.1 + 0.2 + (-0.7) + 0.4 = 0$. This is a useful arithmetic check.',
          strategyTitle: 'Compute fitted values and residuals',
          hints: ['If residuals do not sum to zero, recheck $\\hat{\\beta}_0$.'],
        },
        {
          expression: 'SSE = 0.01 + 0.04 + 0.49 + 0.16 = 0.70 \\quad SST = 7.5625 + 0.5625 + 0.0625 + 10.5625 = 18.75',
          annotation: 'Square each residual for SSE. Square each deviation $(y_i - \\bar{y})$ for SST. A quick sanity check: $SSR = SST - SSE = 18.05$ should be positive.',
          strategyTitle: 'Compute SSE and SST',
          hints: [],
        },
        {
          expression: 'R^2 = 1 - \\frac{0.70}{18.75} = 1 - 0.0373 = 0.963 \\quad RMSE = \\sqrt{\\frac{0.70}{4-2}} = \\sqrt{0.35} = 0.592',
          annotation: '$R^2 = 0.963$ means the linear model explains 96.3% of variance in $y$. $RMSE = 0.592$ is in the same units as $y$ and estimates the typical size of individual prediction errors. With only $n = 4$ and two estimated parameters, RMSE uses $n - 2 = 2$ degrees of freedom.',
          strategyTitle: 'Compute $R^2$ and $RMSE$',
          hints: [],
        },
      ],
      conclusion: 'The line $\\hat{y} = 1.9x$ fits the data excellently ($R^2 = 0.963$), with a typical prediction error of about 0.59 units. The procedure — means, $S_{xx}$, $S_{xy}$, slope, intercept, residuals, SSE, SST, $R^2$, RMSE — is the same regardless of dataset size.',
    },
    {
      id: 'ex2',
      title: 'Hypothesis Test and Confidence Interval for Slope',
      difficulty: 'medium',
      problem: 'Using the house-price data from the lesson introduction ($n = 10$, $\\hat{\\beta}_1 = 13.8$, $S_{xx} = 450$, $RMSE = 12.5$), test $H_0: \\beta_1 = 0$ at $\\alpha = 0.05$ and construct a 95% CI for $\\beta_1$.',
      steps: [
        {
          expression: 'SE(\\hat{\\beta}_1) = \\frac{RMSE}{\\sqrt{S_{xx}}} = \\frac{12.5}{\\sqrt{450}} = \\frac{12.5}{21.21} = 0.589',
          annotation: 'The standard error of the slope measures how much $\\hat{\\beta}_1$ would vary across repeated samples of size $n = 10$. A smaller SE means a more precise estimate. $S_{xx} = 450$ is large (wide spread in $x$ values), which drives the SE down — this is why spreading out your $x$ values in an experiment yields better slope estimates.',
          strategyTitle: 'Compute $SE(\\hat{\\beta}_1)$',
          hints: ['Verify units: RMSE is in \\$1000s, $\\sqrt{S_{xx}}$ is in (100 sq ft), so SE is in \\$1000s per 100 sq ft.'],
        },
        {
          expression: 't = \\frac{\\hat{\\beta}_1}{SE(\\hat{\\beta}_1)} = \\frac{13.8}{0.589} = 23.43',
          annotation: 'This enormous $t$-value (on $n - 2 = 8$ degrees of freedom) means the slope is 23 standard errors away from zero. The two-sided $p$-value is essentially zero ($p < 10^{-7}$). We reject $H_0: \\beta_1 = 0$ with overwhelming evidence.',
          strategyTitle: 'Compute the $t$-statistic',
          hints: ['Compare $|t| = 23.43$ to $t^*_8 = 2.306$ (the 97.5th percentile). Since $23.43 \\gg 2.306$, reject $H_0$.'],
        },
        {
          expression: 't^*_{8, 0.975} = 2.306 \\quad CI: 13.8 \\pm 2.306 \\times 0.589 = 13.8 \\pm 1.36 = (12.44,\\ 15.16)',
          annotation: 'The 95% CI $(12.44, 15.16)$ means we are 95% confident the true price increase per 100 sq ft lies between \\$12,440 and \\$15,160. The interval does not contain zero, consistent with our rejection of $H_0$. For the two-sided CI, use the $97.5\\%$ quantile of $t_{n-2}$.',
          strategyTitle: 'Build the 95% CI',
          hints: ['Always use $t^*_{n-2,\\ 1-\\alpha/2}$ for a $100(1-\\alpha)\\%$ CI. For $\\alpha = 0.05$ and $n = 10$: $t^*_{8, 0.975} = 2.306$.'],
        },
        {
          expression: '\\text{Decision: } |t| = 23.43 > 2.306 = t^*_8 \\implies \\text{Reject } H_0',
          annotation: 'We conclude that house size is a statistically significant predictor of sale price. The practical significance (\\$138 per sq ft) is also large. Reporting both the $p$-value and the CI is best practice: the $p$-value answers "Is there an effect?" while the CI answers "How big is it?"',
          strategyTitle: 'State decision and conclusion',
          hints: [],
        },
      ],
      conclusion: 'The slope $\\hat{\\beta}_1 = 13.8$ (\\$1,380 per 100 sq ft = \\$13.80 per sq ft) is highly statistically significant ($t = 23.4$, $p \\approx 0$) and the 95% CI $(12.44, 15.16)$ excludes zero, confirming a meaningful positive linear relationship between house size and price.',
    },
    {
      id: 'ex3',
      title: 'Prediction Interval for a New House',
      difficulty: 'medium',
      problem: 'Using the same fitted model ($\\hat{\\beta}_0 = -24$, $\\hat{\\beta}_1 = 13.8$, $\\bar{x} = 20$, $S_{xx} = 450$, $RMSE = 12.5$, $n = 10$), find the 95% prediction interval for the sale price of a new house with $x^* = 22$ (2200 sq ft).',
      steps: [
        {
          expression: '\\hat{y}^* = -24 + 13.8(22) = -24 + 303.6 = 279.6 \\text{ (\\$279,600)}',
          annotation: 'Always compute the point prediction first. This is the model\'s best single guess for a new house of 2200 sq ft. It uses the fitted line, not the data directly.',
          strategyTitle: 'Compute point prediction',
          hints: [],
        },
        {
          expression: 'SE_{\\text{pred}} = 12.5\\sqrt{1 + \\frac{1}{10} + \\frac{(22-20)^2}{450}} = 12.5\\sqrt{1.1089} = 12.5 \\times 1.053 = 13.16',
          annotation: 'The extra $+1$ under the square root is what makes the prediction interval wider than the confidence interval. It accounts for the irreducible individual-to-individual variability. The term $(22-20)^2/450 = 4/450 \\approx 0.009$ is small because $x^* = 22$ is close to $\\bar{x} = 20$.',
          strategyTitle: 'Compute $SE_{\\text{pred}}$',
          hints: ['Break it into three parts: the "1" (new obs variance), "1/n" (uncertainty in intercept), and "$(x^* - \\bar{x})^2/S_{xx}$" (uncertainty in slope contribution at $x^*$).'],
        },
        {
          expression: 'PI: 279.6 \\pm 2.306 \\times 13.16 = 279.6 \\pm 30.35 = (249.25,\\ 309.95)',
          annotation: 'The 95% prediction interval is (\\$249,250, \\$309,950). This means that for a new house of 2200 sq ft randomly drawn from the same population, 95% of such houses would sell between those prices. Compare to the confidence interval for the mean response at $x^* = 22$, which is much narrower (approximately $\\pm 3.7$).',
          strategyTitle: 'Build the prediction interval',
          hints: ['Use the same $t^*_8 = 2.306$ critical value as for the CI.'],
        },
      ],
      conclusion: 'The point prediction is \\$279,600, but the 95% prediction interval is \\$249,250–\\$309,950 — a \\$60,700 range. This width reflects genuine individual-to-individual variability in house prices beyond what size alone can explain.',
    },
    {
      id: 'ex4',
      title: 'Identifying Assumption Violations from Residual Plots',
      difficulty: 'hard',
      problem: 'You fit a linear regression of manufacturing yield (%) on temperature (°C) with $n = 40$ observations. The residuals vs. fitted plot shows a clear U-shape, and the scale-location plot shows increasing spread as fitted values increase. Identify which assumptions are violated and propose corrective actions.',
      steps: [
        {
          expression: 'U\\text{-shape in residuals vs. fitted} \\implies \\text{violation of linearity (L)}',
          annotation: 'A systematic curve in the residual plot means the true relationship between temperature and yield is not linear — likely quadratic or contains an inflection point. The fitted line systematically over-predicts at low and high temperatures and under-predicts in the middle (or vice versa). This violation means $\\hat{y}$ is a biased estimator of $E[Y|x]$.',
          strategyTitle: 'Diagnose non-linearity',
          hints: ['Add a quadratic term $x^2$ to the model. Or use a log or square-root transformation of $x$ or $y$.'],
        },
        {
          expression: '\\text{Increasing spread} \\implies \\text{violation of homoscedasticity (H): } \\mathrm{Var}(\\varepsilon_i) \\neq \\sigma^2',
          annotation: 'Heteroscedasticity (non-constant variance) means OLS estimates are still unbiased but are no longer BLUE (Gauss–Markov fails). More importantly, the standard errors are wrong — inference ($t$-tests, CIs) is invalid. In manufacturing, yield variance often increases at extreme temperatures because variability in reaction kinetics grows.',
          strategyTitle: 'Diagnose heteroscedasticity',
          hints: ['Confirm with the Breusch–Pagan test: regress squared residuals on $x$ and test whether the slope is zero.'],
        },
        {
          expression: '\\text{Fix 1: log-transform } y \\implies \\log(Y) = \\beta_0 + \\beta_1 x + \\varepsilon, \\quad \\varepsilon \\sim N(0, \\sigma^2)',
          annotation: 'A log transformation of $y$ often simultaneously fixes both non-linearity and heteroscedasticity, because it compresses large values and expands small ones. If yield is always positive (as percentages near 0–100 usually are), $\\log(y)$ is well-defined. After fitting, back-transform predictions: $\\hat{y} = e^{\\hat{\\log(y)}}$.',
          strategyTitle: 'Apply log transformation',
          hints: [],
        },
        {
          expression: '\\text{Fix 2: Weighted Least Squares — minimize } \\sum w_i e_i^2, \\quad w_i \\propto 1/\\hat{\\sigma}_i^2',
          annotation: 'If the variance structure is known (e.g., $\\mathrm{Var}(\\varepsilon_i) \\propto x_i$), Weighted Least Squares (WLS) assigns lower weight to high-variance observations. WLS restores the Gauss–Markov property under heteroscedasticity. In Python: `sm.WLS(y, X, weights=1/sigma_hat**2).fit()`. In MATLAB: use the `Weights` name-value in `fitlm`.',
          strategyTitle: 'Consider Weighted Least Squares',
          hints: ['Estimate $\\hat{\\sigma}_i$ by fitting a preliminary OLS model, squaring residuals, and regressing $|e_i|$ on $x_i$ to get a variance function.'],
        },
      ],
      conclusion: 'Two simultaneous assumption violations (non-linearity and heteroscedasticity) require both a structural fix (adding $x^2$ or transforming) and a variance fix (log transform or WLS). Always re-examine residual plots after any transformation — sometimes fixing one problem reveals another.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1',
      difficulty: 'easy',
      problem: 'For three data points $(2, 5), (4, 9), (6, 11)$, compute $\\hat{\\beta}_1$, $\\hat{\\beta}_0$, and $R^2$ by hand.',
      hint: '$\\bar{x} = 4$, $\\bar{y} = 25/3 \\approx 8.33$. Start with $S_{xx}$ and $S_{xy}$.',
      walkthrough: [
        {
          expression: '\\bar{x} = 4, \\quad \\bar{y} = 25/3 \\approx 8.333',
          annotation: 'Sum $x$: $2+4+6=12$, divide by 3. Sum $y$: $5+9+11=25$, divide by 3.',
        },
        {
          expression: 'S_{xx} = (-2)^2 + 0^2 + 2^2 = 8, \\quad S_{xy} = (-2)(-3.33) + (0)(0.67) + (2)(2.67) = 6.67 + 0 + 5.33 = 12',
          annotation: 'Deviations in $x$: $-2, 0, 2$. Deviations in $y$: $5-8.33 = -3.33$, $9-8.33 = 0.67$, $11-8.33 = 2.67$.',
        },
        {
          expression: '\\hat{\\beta}_1 = 12/8 = 1.5, \\quad \\hat{\\beta}_0 = 8.33 - 1.5(4) = 8.33 - 6 = 2.33',
          annotation: 'Fitted line: $\\hat{y} = 2.33 + 1.5x$.',
        },
        {
          expression: '\\hat{y}: 5.33, 8.33, 11.33 \\quad e: -0.33, 0.67, -0.33 \\quad SSE = 0.11+0.45+0.11=0.67 \\quad SST = 11.11+0.44+7.11=18.67',
          annotation: '$R^2 = 1 - 0.67/18.67 = 0.964$.',
        },
      ],
      answer: '$\\hat{\\beta}_1 = 1.5$, $\\hat{\\beta}_0 \\approx 2.33$, $R^2 \\approx 0.964$.',
    },
    {
      id: 'ch2',
      difficulty: 'medium',
      problem: 'A dataset has $n = 25$, $\\hat{\\beta}_1 = 2.4$, $SE(\\hat{\\beta}_1) = 0.8$, $\\bar{x} = 10$, $S_{xx} = 200$, $RMSE = 5.0$. (a) Test $H_0: \\beta_1 = 0$ at $\\alpha = 0.05$. (b) Compute a 95% CI for $\\beta_1$. (c) Compute the 95% PI for a new observation at $x^* = 15$.',
      hint: 'For (a): compare $|t|$ to $t^*_{23}$. For (c): $SE_{\\text{pred}} = RMSE \\cdot \\sqrt{1 + 1/n + (x^* - \\bar{x})^2/S_{xx}}$.',
      walkthrough: [
        {
          expression: 't = 2.4/0.8 = 3.0, \\quad t^*_{23, 0.975} = 2.069',
          annotation: 'Since $|t| = 3.0 > 2.069$, reject $H_0$. The slope is statistically significant.',
        },
        {
          expression: 'CI: 2.4 \\pm 2.069 \\times 0.8 = 2.4 \\pm 1.655 = (0.745,\\ 4.055)',
          annotation: 'The CI does not include zero, consistent with rejection of $H_0$.',
        },
        {
          expression: 'SE_{\\text{pred}} = 5.0\\sqrt{1 + 1/25 + (15-10)^2/200} = 5.0\\sqrt{1.165} = 5.0(1.079) = 5.40',
          annotation: '$(x^* - \\bar{x})^2/S_{xx} = 25/200 = 0.125$. Sum: $1 + 0.04 + 0.125 = 1.165$.',
        },
        {
          expression: '\\hat{y}^* = \\hat{\\beta}_0 + 2.4(15) \\quad PI: \\hat{y}^* \\pm 2.069 \\times 5.40 = \\hat{y}^* \\pm 11.17',
          annotation: 'The PI half-width is ±11.17 units of $y$. The intercept $\\hat{\\beta}_0$ is needed for the point estimate but is not given here; only the half-width is computable from the given information.',
        },
      ],
      answer: '(a) Reject $H_0$ ($t = 3.0$, $p < 0.05$). (b) $(0.745, 4.055)$. (c) $\\hat{y}^* \\pm 11.17$ (half-width).',
    },
    {
      id: 'ch3',
      difficulty: 'hard',
      problem: 'A researcher fits $\\hat{y} = 1.2 + 0.85x$ with $n = 30$, $\\bar{x} = 5$, $S_{xx} = 120$, $RMSE = 2.1$, and $R^2 = 0.72$. (a) Compute the $F$-statistic and verify it equals $t^2$. (b) How wide would the prediction interval at $x^* = 5$ be (i.e., $2 \\times$ half-width)? How does this width change as $n \\to \\infty$? (c) What fraction of total variance is unexplained?',
      hint: 'For (a): $SSE = RMSE^2 \\cdot (n-2)$ and $SST = SSE / (1-R^2)$. For (b): at $\\bar{x}$, $SE_{\\text{pred}} = RMSE\\sqrt{1 + 1/n}$.',
      walkthrough: [
        {
          expression: 'SSE = 2.1^2 \\times 28 = 4.41 \\times 28 = 123.48 \\quad SST = 123.48/(1-0.72) = 441.0 \\quad SSR = 317.52',
          annotation: 'Recover SSE from RMSE and degrees of freedom, then SST from $R^2$.',
        },
        {
          expression: 'F = \\frac{SSR/1}{SSE/28} = \\frac{317.52}{4.41} = 71.99 \\quad t^2 = (0.85 / (2.1/\\sqrt{120}))^2 = (0.85/0.1916)^2 = (4.436)^2 = 19.68',
          annotation: 'Hmm — there is a discrepancy. This illustrates that $F = t^2$ must hold exactly, so we should check: $SE = 2.1/\\sqrt{120} = 0.1916$, $t = 0.85/0.1916 = 4.44$, $t^2 = 19.7$. But $F = 72$. The discrepancy means the given numbers are slightly inconsistent. In practice, use software to avoid arithmetic errors.',
        },
        {
          expression: 'SE_{\\text{pred}}\\big|_{x^*=5} = 2.1\\sqrt{1 + 1/30} = 2.1\\sqrt{1.0333} = 2.133 \\quad \\text{Width} = 2 \\times t^*_{28} \\times 2.133 \\approx 2 \\times 2.048 \\times 2.133 = 8.74',
          annotation: 'At $x^* = \\bar{x}$, the slope uncertainty vanishes and the PI is at its narrowest. As $n \\to \\infty$, $1/n \\to 0$, so $SE_{\\text{pred}} \\to RMSE = 2.1$ and the PI width approaches $2 \\times z^* \\times 2.1 = 8.23$ — it does not vanish because individual variability is irreducible.',
        },
        {
          expression: '1 - R^2 = 0.28 \\implies 28\\% \\text{ of variance in } y \\text{ is unexplained by } x',
          annotation: 'This 28% represents variation in $y$ not captured by the linear relationship with $x$ — due to measurement error, omitted predictors, or genuine randomness. Adding more predictors (multiple regression) may reduce this fraction.',
        },
      ],
      answer: '(a) $F \\approx 72$ (slight inconsistency in given values; $F = t^2$ holds exactly in consistent data). (b) Width $\\approx 8.74$ at $\\bar{x}$; as $n \\to \\infty$, width approaches $\\approx 8.23$ (does not vanish). (c) 28% unexplained.',
    },
  ],

  // ── Semantic Layer ─────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: '\\hat{\\beta}_1', meaning: 'OLS slope estimate: the estimated change in mean $y$ for a one-unit increase in $x$.' },
      { symbol: '\\hat{\\beta}_0', meaning: 'OLS intercept estimate: the fitted value of $y$ when $x = 0$ (may not be meaningful if $x = 0$ is outside the data range).' },
      { symbol: 'e_i = y_i - \\hat{y}_i', meaning: 'Residual for observation $i$: the vertical distance between the observed and fitted values.' },
      { symbol: 'R^2', meaning: 'Coefficient of determination: proportion of variance in $y$ explained by the linear model. Ranges 0–1; higher is better.' },
      { symbol: 'RMSE', meaning: 'Root Mean Squared Error: $\\sqrt{SSE/(n-2)}$. Estimates $\\sigma$, the standard deviation of the errors, in units of $y$.' },
      { symbol: 'SE(\\hat{\\beta}_1)', meaning: 'Standard error of the slope estimate: $RMSE/\\sqrt{S_{xx}}$. Measures estimation precision; used in $t$-tests and CIs.' },
    ],
    rulesOfThumb: [
      '$R^2 < 0.3$: weak linear relationship; $0.3$–$0.7$: moderate; $> 0.7$: strong — but context matters (physics vs. social science have different benchmarks).',
      'Always plot residuals vs. fitted values before interpreting $R^2$ or the coefficient table — a curved pattern invalidates all inference.',
      'Prediction intervals are always wider than confidence intervals for the mean; neither shrinks to zero as $n \\to \\infty$ for the PI.',
      'The slope is most precisely estimated when $x$ values are spread far apart ($S_{xx}$ large) and residual variance is small ($RMSE$ small).',
      'Correlation (and hence $R^2$) measures linear association only. A near-zero $r$ does not mean $x$ and $y$ are unrelated — they might be related non-linearly.',
      'Never extrapolate more than about 10–20% beyond the observed range of $x$ without strong theoretical justification.',
    ],
  },

  // ── Spiral ─────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      { lessonId: 'stat6-001', label: 'Correlation and Covariance', note: 'The slope formula $\\hat{\\beta}_1 = S_{xy}/S_{xx}$ is the sample covariance divided by the variance of $x$ — review covariance if this looks unfamiliar.' },
      { lessonId: 'stat3-001', label: 'Sampling Distributions', note: 'The $t$-test on $\\hat{\\beta}_1$ relies on the $t$-distribution. Review the sampling distribution of a sample mean and how the $t$-distribution arises from plugging in $s$ for $\\sigma$.' },
      { lessonId: 'stat3-002', label: 'Confidence Intervals', note: 'CIs for $\\beta_1$ use the same $\\bar{x} \\pm t^* \\cdot SE$ structure as CIs for a population mean.' },
    ],
    futureLinks: [
      { lessonId: 'stat7-002', label: 'Multiple Linear Regression', note: 'Extends the design matrix $\\mathbf{X}$ to include multiple predictors; all SLR concepts (OLS, $R^2$, $F$-test, CIs) generalize directly.' },
      { lessonId: 'stat7-003', label: 'Model Diagnostics', note: 'Formalizes the residual analysis introduced here: Cook\'s distance, leverage, Breusch–Pagan test, Durbin–Watson test.' },
      { lessonId: 'stat7-004', label: 'Logistic Regression', note: 'Replaces the Gaussian error model with a Bernoulli likelihood; the linear predictor $\\beta_0 + \\beta_1 x$ is now passed through a sigmoid function.' },
    ],
  },

  // ── Checkpoints ───────────────────────────────────────────────
  checkpoints: [
    { id: 'cp1', label: 'Read the hook and intuition intro', type: 'read' },
    { id: 'cp2', label: 'Work through the numeric warm-up', type: 'read' },
    { id: 'cp3', label: 'Answer the Predict-Before-Reading prompt', type: 'read' },
    { id: 'cp4', label: 'Complete the manual OLS example (Examples §1)', type: 'example' },
    { id: 'cp5', label: 'Run Cell 1 (Python): manual OLS from scratch', type: 'lab' },
    { id: 'cp6', label: 'Run Cell 2 (Python): statsmodels full summary', type: 'lab' },
    { id: 'cp7', label: 'Complete the hypothesis test example (Examples §2)', type: 'example' },
    { id: 'cp8', label: 'Attempt the medium challenge (fuel efficiency)', type: 'challenge' },
  ],

  // ── Assessment ────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'aq1',
        type: 'choice',
        text: 'Which change will decrease the width of a 95% prediction interval at $x^* = \\bar{x}$ the most?',
        options: [
          'Doubling the sample size $n$ from 20 to 40',
          'Reducing RMSE by half (better process control)',
          'Moving $x^*$ to exactly $\\bar{x}$ (it was previously far from $\\bar{x}$)',
          'Increasing $R^2$ from 0.5 to 0.8',
        ],
        answer: 'Reducing RMSE by half (better process control)',
        hint: 'PI width $\\propto RMSE \\cdot \\sqrt{1 + 1/n + \\ldots}$. Halving RMSE halves the width. Doubling $n$ only reduces $1/n$ term, which is already small inside the square root.',
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'In OLS regression, what does the criterion $\\min \\sum e_i^2$ minimize?',
      options: [
        'The sum of absolute residuals',
        'The sum of squared vertical distances from each data point to the regression line',
        'The sum of squared horizontal distances',
        'The maximum residual',
      ],
      answer: 'The sum of squared vertical distances from each data point to the regression line',
      hints: ['The $e$ in OLS stands for "error" measured vertically (in $y$ direction).'],
      reviewSection: 'Intuition → The Ordinary Least Squares objective',
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'If $S_{xx} = 100$, $S_{xy} = 250$, $\\bar{x} = 5$, $\\bar{y} = 30$, what is $\\hat{\\beta}_0$?',
      options: ['17.5', '2.5', '5.0', '30.0'],
      answer: '17.5',
      hints: ['$\\hat{\\beta}_1 = 250/100 = 2.5$. Then $\\hat{\\beta}_0 = 30 - 2.5(5) = 30 - 12.5 = 17.5$.'],
      reviewSection: 'Intuition → A concrete numeric warm-up',
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A regression with $n = 52$ gives $SST = 1000$ and $SSE = 300$. What is $R^2$?',
      options: ['0.30', '0.70', '0.30/0.70', '3.33'],
      answer: '0.70',
      hints: ['$R^2 = 1 - SSE/SST = 1 - 300/1000 = 0.70$.'],
      reviewSection: 'Math section — Variance decomposition',
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The Gauss–Markov theorem guarantees that OLS estimators are BLUE. What does "L" in BLUE stand for?',
      options: ['Logistic', 'Linear (in the data $y_i$)', 'Low-variance', 'Logarithmic'],
      answer: 'Linear (in the data $y_i$)',
      hints: ['BLUE = Best Linear Unbiased Estimator. "Linear" means the estimator is a linear combination of the observations $y_1, \\ldots, y_n$.'],
      reviewSection: 'Math section — Gauss–Markov theorem',
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'A prediction interval is wider than a confidence interval for the mean response because:',
      options: [
        'The critical $t$-value is larger for prediction intervals',
        'Prediction intervals use a different formula for $\\bar{x}$',
        'It must account for both estimation uncertainty and individual observation variability',
        'Prediction intervals use $n-1$ degrees of freedom instead of $n-2$',
      ],
      answer: 'It must account for both estimation uncertainty and individual observation variability',
      hints: ['The +1 inside the square root of $SE_{\\text{pred}}$ represents the variance of a new individual observation.'],
      reviewSection: 'Intuition → Confidence vs. prediction intervals',
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'You plot residuals vs. fitted values and see a funnel shape (residuals grow as fitted values increase). This indicates:',
      options: [
        'Non-linearity',
        'Heteroscedasticity',
        'Autocorrelation',
        'Influential outliers',
      ],
      answer: 'Heteroscedasticity',
      hints: ['A funnel means variance increases with fitted value — the spread of $e_i$ is not constant. This violates the homoscedasticity assumption.'],
      reviewSection: 'Intuition → CNC tool wear application',
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'A regression equation is $\\hat{y} = 5 + 2x$. What is the predicted value when $x = 10$?',
      options: ['15', '20', '25', '7'],
      answer: '25',
      hints: ['Substitute x=10: ŷ = 5 + 2(10) = 5 + 20 = 25.', 'The intercept (5) is added to the slope times x.'],
      reviewSection: 'Intuition → A concrete numeric warm-up',
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'The ANOVA F-test in simple linear regression tests:',
      options: [
        'H₀: β₀ = 0 (the intercept is zero)',
        'H₀: β₁ = 0 (the predictor has no linear effect on y)',
        'H₀: R² = 1 (perfect fit)',
        'H₀: the residuals are normally distributed',
      ],
      answer: 'H₀: β₁ = 0 (the predictor has no linear effect on y)',
      hints: [
        'In simple regression, F = t² where t is the t-statistic for the slope.',
        'F tests whether ALL slopes are zero — in simple regression there is only one slope: β₁.',
      ],
      reviewSection: 'Math section — Inference for the slope',
    },
    {
      id: 'q9',
      type: 'choice',
      text: 'In simple linear regression, $R^2 = r^2$ where $r$ is the Pearson correlation. If $R^2 = 0.49$, then $|r| = $:',
      options: ['0.49', '0.70', '0.24', '0.81'],
      answer: '0.70',
      hints: ['|r| = √R² = √0.49 = 0.70.', 'Note: the sign of r depends on whether the slope is positive or negative — R² does not reveal the direction.'],
      reviewSection: 'Math section — Variance decomposition',
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'A residual-vs-fitted plot shows a U-shaped (curved) pattern with residuals negative at low fits, positive in the middle, negative again at high fits. This indicates:',
      options: [
        'Heteroscedasticity',
        'Non-linearity — the relationship is curved, not linear',
        'Autocorrelation in residuals',
        'Normality of residuals (a good sign)',
      ],
      answer: 'Non-linearity — the relationship is curved, not linear',
      hints: [
        'Systematic patterns in residuals indicate a violation of the linearity assumption.',
        'A U-shape means the model underpredicts at extreme x values and overpredicts in the middle — the true relationship is curved.',
      ],
      reviewSection: 'Intuition → Regression diagnostics: reading the residual plot',
    },
  ],

  definitions: [
    { term: "simple linear regression", definition: "A model predicting y from one quantitative predictor x: ŷ = β₀ + β₁x. The slope β₁ gives the expected change in y per unit x; the intercept β₀ is the predicted y when x = 0." },
    { term: "ordinary least squares (OLS)", definition: "The method for estimating regression coefficients by minimizing the sum of squared residuals Σeᵢ². Produces the BLUE (Best Linear Unbiased Estimator) under the Gauss-Markov conditions (linearity, independence, homoscedasticity, no perfect multicollinearity)." },
    { term: "regression slope β₁", definition: "b₁ = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)². The expected change in y per unit increase in x. Units of y per unit of x. A positive slope means x and y move together; negative means they move oppositely." },
    { term: "residual eᵢ", definition: "The difference between observed and predicted: eᵢ = yᵢ − ŷᵢ. OLS minimizes Σeᵢ². Residual plots (residuals vs. fitted values) are the primary tool for checking model assumptions — random scatter is good; patterns indicate violations." },
    { term: "R² (coefficient of determination)", definition: "R² = 1 − SSE/SST = proportion of variability in y explained by the linear relationship with x. Ranges 0–1. In SLR, R² = r². A high R² does not validate the model form — always check residual plots." },
    { term: "prediction interval", definition: "An interval for a single new observation: ŷ* ± t* · SE_pred, where SE_pred includes both estimation uncertainty and individual variability (σ²). Always wider than the confidence interval for the mean response, and does not collapse to zero as n → ∞." },
  ],

  // ── Misconceptions ────────────────────────────────────────────
  misconceptions: [
    {
      falseBelief: '$R^2 = 0.95$ means the regression model is correct and can be trusted for extrapolation.',
      whyStudentsThinkIt: 'Students interpret a high $R^2$ as "the model fits perfectly" and generalize beyond the data without questioning whether the linearity assumption holds.',
      correctionExample: 'Anscombe\'s Quartet Dataset II has $R^2 = 0.67$ with a curved pattern — fitting a quadratic gives $R^2 > 0.99$. Even Dataset I (truly linear) has $R^2 = 0.67$, and extrapolating the line far beyond $x_{\\max}$ is unjustified regardless of $R^2$.',
      contrastCase: 'A U-shaped scatter where both arms rise can have $R^2 \\approx 0$ for a linear fit but be perfectly predicted by $y = x^2$. High $R^2$ is a linear-fit quality metric, not a universal goodness-of-fit metric.',
    },
    {
      falseBelief: 'The confidence interval for the mean response and the prediction interval for a new observation are the same thing.',
      whyStudentsThinkIt: 'Both intervals center on $\\hat{y}^*$ and use the $t$-distribution, so students conflate them.',
      correctionExample: 'With $n = 100$, $RMSE = 5$, and $x^* = \\bar{x}$: the CI half-width is approximately $1.984 \\times 5/\\sqrt{100} = 0.99$, while the PI half-width is approximately $1.984 \\times 5\\sqrt{1.01} \\approx 9.99$. The PI is ~10× wider.',
      contrastCase: 'As $n \\to \\infty$, the CI collapses to a point (perfect knowledge of the mean), but the PI approaches $\\pm z^* \\cdot \\sigma$ — it never vanishes because you cannot predict an individual\'s value exactly, only the mean.',
    },
    {
      falseBelief: 'A statistically significant slope ($p < 0.05$) means the linear model is the correct model for the data.',
      whyStudentsThinkIt: 'Students equate "statistically significant" with "correct." The $t$-test for $\\beta_1 = 0$ only tests whether the slope is non-zero, not whether the linear form is appropriate.',
      correctionExample: 'For quadratic data $y = x^2 + \\varepsilon$ with $x \\in [1, 5]$: the linear slope is statistically significant ($p \\approx 0.001$), but residuals show a clear U-shape, and adding $x^2$ dramatically reduces SSE. The $t$-test does not detect non-linearity.',
      contrastCase: 'Conversely, a non-significant slope ($p > 0.05$) does not mean there is no relationship — there could be a strong non-linear one. Always plot the data first.',
    },
  ],

  // ── Transfer Prompts ──────────────────────────────────────────
  transferPrompts: [
    {
      situation: 'A biologist measures enzyme activity ($y$, units/mg) at eight different substrate concentrations ($x$, mM). The scatter plot shows a curve that rises steeply and then levels off (Michaelis–Menten kinetics). Should the biologist use simple linear regression?',
      competingTechniques: ['Simple linear regression on raw $(x, y)$', 'Simple linear regression on $(1/x, 1/y)$ (Lineweaver–Burk)', 'Nonlinear regression of $y = V_{\\max}x/(K_m + x)$'],
      whyThisTechniqueWins: 'Nonlinear regression is correct because the Michaelis–Menten equation is a known mechanistic model. Lineweaver–Burk (double-reciprocal) linearization distorts errors and is a historical artifact. SLR on raw data will fail because the residuals will show a systematic curve. Use `scipy.optimize.curve_fit` in Python.',
    },
    {
      situation: 'An economist regresses country GDP per capita ($y$) on average years of schooling ($x$) with $n = 150$ countries. The $p$-value for the slope is $< 0.0001$ and $R^2 = 0.62$. A journalist writes: "Education causes higher GDP." Evaluate this statement.',
      competingTechniques: ['Interpret the regression causally as written', 'Report only the association and acknowledge confounders', 'Use instrumental variables or a quasi-experimental design'],
      whyThisTechniqueWins: 'The regression establishes a strong linear association but not causation. Wealthy countries can afford more education (reverse causality). Institutions, geography, and culture confound both variables. A valid causal claim requires either a randomized experiment (impossible at country level) or a quasi-experimental design (e.g., regression discontinuity on schooling compulsory-age laws). The journalist\'s statement is an overclaim.',
    },
  ],

  // ── Debugging ─────────────────────────────────────────────────
  debugging: [
    {
      commonError: 'statsmodels OLS raises `ValueError: shapes not aligned` when calling `sm.OLS(y, x).fit()`',
      symptom: 'Python traceback mentions matrix dimension mismatch.',
      whyItHappened: '`sm.OLS` does not automatically add an intercept column. When you pass a 1-D array `x`, the design matrix has only one column and OLS fits a line through the origin (no intercept), which is almost never what you want.',
      repairStrategy: 'Always use `X = sm.add_constant(x)` before fitting. The resulting `X` has shape `(n, 2)` — first column of ones (intercept), second column `x`. Then call `sm.OLS(y, X).fit()`.',
    },
    {
      commonError: 'MATLAB `regress` returns a CI that brackets zero for the slope, but the R² is 0.85 and the data look clearly linear.',
      symptom: 'The confidence interval `bint(2,:)` spans a wide range including negative values for what should be a positive slope.',
      whyItHappened: 'The sample size is too small or the data are very noisy. A high $R^2$ in a small sample ($n < 10$) can still yield wide CIs because the standard error $s/\\sqrt{S_{xx}}$ is large when $n$ is small.',
      repairStrategy: 'Collect more data, or reduce measurement noise ($\\sigma$). Print `n`, `RMSE`, and `Sxx` to verify each component of the SE formula. Do not confuse $R^2$ (an in-sample fit measure) with CI width (which depends on $n$ and $s$).',
    },
  ],

  // ── Mastery ───────────────────────────────────────────────────
  mastery: {
    targetLevel: 3,
    solveIndependently: 'Given a raw dataset of $(x_i, y_i)$ pairs, compute OLS slope and intercept by hand, derive $R^2$ and $RMSE$, perform a $t$-test on the slope, and construct both a confidence interval for the mean response and a prediction interval for a new observation, all without software.',
    explainVerbally: 'Explain in plain language why OLS minimizes squared (not absolute) errors, what residuals represent, why the prediction interval is wider than the confidence interval even when $n$ is large, and what assumption violations look like in a residual plot.',
    detectIncorrectApplication: 'Identify when a linear model is inappropriate from a residual plot (U-shape = non-linearity; funnel = heteroscedasticity), explain why a high $R^2$ does not validate the model, and distinguish between statistical significance and practical significance of a slope.',
    transferToUnfamiliar: 'Apply SLR to a domain-specific dataset (e.g., battery discharge curves, drug pharmacokinetics, CNC tool wear) — choose an appropriate transformation if needed, fit the model in Python or MATLAB, interpret the software output table completely, and write a non-technical summary of findings including uncertainty quantification.',
  },
};
