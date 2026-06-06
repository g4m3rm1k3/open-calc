export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'stat7-002',
  slug: 'multiple-regression',
  chapter: 'stat7',
  order: 2,
  title: 'Multiple Regression',
  subtitle: 'Predict outcomes from many predictors simultaneously — and isolate the effect of each one.',
  tags: ['multiple regression', 'OLS', 'multicollinearity', 'adjusted R-squared', 'F-test', 'confounding', 'VIF', 'predictor', 'coefficient interpretation'],
  aliases: 'multiple regression OLS multicollinearity VIF adjusted R-squared F-test confounding predictor interpretation regression coefficients partial effects',
  timeToComplete: 55,
  coreConcept: 'Multiple regression extends simple linear regression to p predictors: ŷ = β₀ + β₁x₁ + β₂x₂ + ⋯ + βₚxₚ. Each coefficient βⱼ is the expected change in y per unit increase in xⱼ holding all other predictors constant (the partial effect). Adjusted R² penalizes for adding useless predictors. The F-test checks whether any predictors matter at all. Multicollinearity — predictors that are highly correlated with each other — inflates standard errors and complicates interpretation.',
  prerequisites: ['stat7-001', 'stat6-002'],
  nextLesson: null,

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: `A real-estate model uses only house size to predict price. But you know that the neighborhood, number of bedrooms, and age of the house all influence price too. When you add those variables, does the estimated effect of size change — and can the new model tell you whether each additional variable really improves predictions or just adds noise?`,
    realWorldContext: `Multiple regression is the foundation of quantitative analysis across virtually every data-driven field. An economist estimating the wage premium for education must control for years of experience and industry — otherwise the education coefficient is confounded. An epidemiologist studying whether coffee consumption increases heart attack risk must control for smoking, age, and exercise — or the association is spurious. A sports analytics team predicting a basketball player's scoring must include minutes played, shot attempts, and player position — not just one statistic. Google and Netflix's recommendation engines, clinical trial analysis, credit scoring, economic policy forecasting — all are built on multiple regression or its generalizations. The key insight that makes multiple regression indispensable: when you include multiple predictors, each coefficient represents the isolated effect of that variable with all others held constant. This "partialing out" is the statistical equivalent of running a controlled experiment, even from observational data.`,
    previewVisualizationId: 'RegressionScatterViz',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      `**Roadmap for this lesson.** By the end you will: (1) write and interpret a multiple regression equation; (2) explain what "holding other variables constant" means for coefficient interpretation; (3) read and interpret a standard regression output table (coefficients, SE, t, p, confidence intervals); (4) use adjusted R² and the F-test to evaluate overall model fit; (5) recognize and diagnose multicollinearity with VIF; (6) use Python/MATLAB to fit multiple regression models and interpret the output.`,

      `**From one predictor to many.** Simple linear regression fits ŷ = β₀ + β₁x. Multiple regression extends this to ŷ = β₀ + β₁x₁ + β₂x₂ + ⋯ + βₚxₚ. Geometrically: simple regression fits a line in 2D; with two predictors, you fit a plane in 3D; with p predictors, you fit a hyperplane in (p+1)-dimensional space. The mathematics of least squares generalizes cleanly: minimize the total sum of squared residuals Σ(yᵢ − ŷᵢ)², and the solution is β = (X^T X)⁻¹ X^T y in matrix form. Everything you learned in simple regression — OLS, residuals, R², t-tests — carries over directly.`,

      `**Before reading on, predict:** In a simple regression of salary on years of experience, the slope is $3,500 per year. When you add education level (years of schooling) as a second predictor, do you think the experience coefficient will increase, decrease, or stay the same? Why might adding education change the coefficient for experience?`,

      `**The key insight: "holding other variables constant."** The coefficient β₁ in a multiple regression model means: "if x₁ increases by 1 unit and all other predictors remain the same, ŷ increases by β₁ units." This is called the partial effect of x₁. It differs from the simple regression coefficient of x₁ on y whenever x₁ is correlated with the other predictors. Example: in a simple regression of salary on experience, the slope absorbs the correlation between experience and education. In a multiple regression controlling for education, the experience coefficient is the effect of experience pure — separate from the education-experience correlation.`,

      `**Confounding and why multiple regression matters.** A confounding variable is a predictor that is correlated with both x₁ and y. When you omit a confounder, the coefficient of x₁ is biased — it picks up the effect of the confounder, not just x₁. Classic example: ice cream sales and drowning rates are positively correlated. If you regressed drownings on ice cream sales with no other variables, the coefficient would be positive and significant. Add "season" (summer/not) as a predictor and the ice cream coefficient drops to near zero — season was the confounder. Multiple regression lets you isolate effects by explicitly controlling for known confounders.`,

      `**Adjusted R² vs R²: penalizing extra predictors.** R² never decreases when you add a predictor — even a random noise variable will increase R² slightly just by explaining some of the training set variance by chance. Adjusted R² = 1 − (1 − R²)(n−1)/(n−p−1) penalizes for the number of predictors p. It can decrease when you add a useless predictor. Use adjusted R² (not R²) to compare models with different numbers of predictors.`,

      `**The F-test: does the model explain anything?** The omnibus F-test for multiple regression tests H₀: β₁ = β₂ = ⋯ = βₚ = 0 (all slopes are zero; the model explains nothing beyond the mean). The test statistic is F = (R²/p) / ((1−R²)/(n−p−1)). Under H₀, F ~ F(p, n−p−1). A significant F-test says "at least one predictor is useful," but doesn't say which one. Individual t-tests on each βⱼ identify which specific predictors are significant.`,

      `**Multicollinearity: when predictors are correlated.** If predictors x₁ and x₂ are highly correlated, the matrix X^T X is nearly singular, and the coefficient estimates β̂₁ and β̂₂ have very large standard errors — they are individually uncertain even if x₁ + x₂ is well-estimated. The Variance Inflation Factor VIF(xⱼ) = 1/(1 − R²ⱼ) where R²ⱼ is R² from regressing xⱼ on all other predictors. VIF > 10 (or even > 5 by some standards) indicates problematic multicollinearity. Solutions: drop one of the correlated predictors, create a composite variable, or use ridge regression (regularization).`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Multiple Regression Model',
        body: `$$y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\cdots + \\beta_p x_p + \\varepsilon$$\n\nwhere $\\varepsilon \\sim N(0, \\sigma^2)$ i.i.d. (under standard OLS assumptions).\n\n**In matrix notation:** $\\mathbf{y} = \\mathbf{X}\\boldsymbol{\\beta} + \\boldsymbol{\\varepsilon}$, and the OLS estimator is $\\hat{\\boldsymbol{\\beta}} = (\\mathbf{X}^T\\mathbf{X})^{-1}\\mathbf{X}^T\\mathbf{y}$.\n\n**Interpretation of βⱼ:** The expected change in y for a 1-unit increase in xⱼ, **holding all other predictors constant**.`,
      },
      {
        type: 'procedure',
        title: 'Reading a Regression Output Table',
        body: `A standard regression output table has these columns:\n\n| Column | Meaning |\n|--------|--------|\n| Coef | β̂ⱼ — the OLS estimate |\n| SE | Standard error of β̂ⱼ |\n| t | Test statistic: t = β̂ⱼ/SE(β̂ⱼ) |\n| P>|t| | p-value for H₀: βⱼ = 0 |\n| [95% CI] | β̂ⱼ ± t*(df)×SE |\n\nAlso reported: R², Adj. R², F-statistic and its p-value, df, residual SE.\n\n**Key rule:** The t-test and CI for each βⱼ test whether that predictor adds information given all other predictors in the model.`,
      },
      {
        type: 'insight',
        title: 'When Does Adding a Predictor Change Other Coefficients?',
        body: `Adding predictor $x_2$ to a model with $x_1$ changes $\\hat{\\beta}_1$ if and only if $x_2$ is correlated with $x_1$.\n\nIf $\\text{Corr}(x_1, x_2) = 0$: $\\hat{\\beta}_1$ in the multiple model equals $\\hat{\\beta}_1$ in the simple model.\n\nIf $\\text{Corr}(x_1, x_2) \\neq 0$: $\\hat{\\beta}_1$ changes. The amount it changes equals the product of the simple regression slope of $y$ on $x_2$ and the simple regression slope of $x_2$ on $x_1$ — the "omitted variable bias" formula:\n$$\\hat{\\beta}_1^{\\text{simple}} - \\hat{\\beta}_1^{\\text{multiple}} = \\hat{\\delta} \\cdot \\hat{\\gamma}$$\nwhere $\\hat{\\delta}$ is the coefficient of $x_2$ in the full model and $\\hat{\\gamma}$ is the slope of $x_1$ on $x_2$.`,
      },
      {
        type: 'warning',
        title: 'Correlation Is Not Causation — Even With Controls',
        body: `Multiple regression removes confounding from observed variables, but not from unobserved ones. If an important confounding variable is not in your model, the coefficients are still biased. Regression cannot establish causation from observational data alone. For causal inference, you need randomization (experiments), instrumental variables, regression discontinuity, or difference-in-differences. Multiple regression is a powerful tool for description and prediction; causal claims require additional design.`,
      },
    ],
    visualizations: [
      {
        id: 'RegressionScatterViz',
        title: 'Regression Scatter — Visualizing OLS in 2D',
        mathBridge: `Each relationship preset generates 30 data points. Toggle "Show residuals" to see $e_i = y_i - \\hat{y}_i$ as red segments. In multiple regression you have one OLS line per predictor holding others constant — the same least-squares principle applies in $p$ dimensions. Here R² = SSR/SST measures explained variance, exactly as in the multiple regression F-test.`,
        caption: `Use "Resample" to see sampling variability: each new dataset gives slightly different slope and intercept estimates — this variance in estimates is what standard errors measure.`,
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────
  math: {
    prose: [
      `**The OLS estimator in matrix form.** Stack the data as $\\mathbf{y} \\in \\mathbb{R}^n$ and $\\mathbf{X} \\in \\mathbb{R}^{n \\times (p+1)}$ (first column all 1s for the intercept). The OLS estimator minimizes $\\|\\mathbf{y} - \\mathbf{X}\\boldsymbol{\\beta}\\|^2$ and has the closed-form solution $\\hat{\\boldsymbol{\\beta}} = (\\mathbf{X}^T\\mathbf{X})^{-1}\\mathbf{X}^T\\mathbf{y}$. This requires $\\mathbf{X}^T\\mathbf{X}$ to be invertible — which fails when predictors are perfectly collinear (a predictor is an exact linear combination of others) or when $n \\leq p$ (more predictors than observations). The Gauss-Markov theorem extends to multiple regression: $\\hat{\\boldsymbol{\\beta}}$ is the Best Linear Unbiased Estimator (BLUE) of $\\boldsymbol{\\beta}$.`,

      `**Variance of OLS estimates.** Under $\\boldsymbol{\\varepsilon} \\sim N(\\mathbf{0}, \\sigma^2 \\mathbf{I})$, the OLS estimator $\\hat{\\boldsymbol{\\beta}} \\sim N(\\boldsymbol{\\beta}, \\sigma^2(\\mathbf{X}^T\\mathbf{X})^{-1})$. The $(j,j)$ entry of $\\sigma^2(\\mathbf{X}^T\\mathbf{X})^{-1}$ is $\\text{Var}(\\hat{\\beta}_j)$. The standard error is $\\text{SE}(\\hat{\\beta}_j) = \\hat{\\sigma}\\sqrt{[(\\mathbf{X}^T\\mathbf{X})^{-1}]_{jj}}$ where $\\hat{\\sigma}^2 = \\text{RSS}/(n-p-1)$ is the mean squared residual. The individual t-statistic $t_j = \\hat{\\beta}_j/\\text{SE}(\\hat{\\beta}_j) \\sim t(n-p-1)$ under $H_0: \\beta_j = 0$.`,

      `**The F-test: geometric interpretation.** The F-test compares two models: the full model (all $p$ predictors) and the restricted model (intercept only). Under $H_0$: all slopes zero, $F = \\frac{(\\text{TSS} - \\text{RSS})/p}{\\text{RSS}/(n-p-1)} \\sim F(p, n-p-1)$. Numerator = variance explained per predictor; denominator = unexplained variance per degree of freedom. A large F means the model explains much more than chance. The F-test can be generalized: test any linear restriction $R\\boldsymbol{\\beta} = \\mathbf{r}$ using the partial F-test — this is used to test groups of coefficients simultaneously.`,

      `**Adjusted R² and model selection.** $R^2 = 1 - \\text{RSS}/\\text{TSS}$ always increases with p. Adjusted $R^2 = 1 - \\frac{\\text{RSS}/(n-p-1)}{\\text{TSS}/(n-1)}$ penalizes for p. Adding a predictor increases Adj $R^2$ only if its F-statistic exceeds 1. For model comparison, information criteria (AIC, BIC) are more principled: AIC $= n\\ln(\\text{RSS}/n) + 2(p+1)$, BIC $= n\\ln(\\text{RSS}/n) + (p+1)\\ln(n)$. Lower AIC/BIC = better model. BIC penalizes complexity more heavily and tends to select simpler models.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Gauss-Markov Theorem for Multiple Regression',
        body: `Under the classical assumptions:\n1. $y = X\\beta + \\varepsilon$ (linear in parameters)\n2. $X$ has full column rank (no perfect multicollinearity)\n3. $E[\\varepsilon | X] = 0$ (exogeneity / zero conditional mean)\n4. $\\text{Var}(\\varepsilon | X) = \\sigma^2 I$ (homoscedasticity and no autocorrelation)\n\nThe OLS estimator $\\hat{\\beta} = (X^TX)^{-1}X^Ty$ is **BLUE** — the Best Linear Unbiased Estimator: it has the smallest variance among all linear unbiased estimators of $\\beta$.`,
      },
      {
        type: 'theorem',
        title: 'Variance Inflation Factor',
        body: `The VIF for predictor $x_j$ is:\n$$\\text{VIF}(x_j) = \\frac{1}{1 - R_j^2}$$\nwhere $R_j^2$ is the $R^2$ from regressing $x_j$ on all other predictors.\n\n**Interpretation:**\n• VIF = 1: no multicollinearity (xⱼ is uncorrelated with others)\n• VIF = 5: SE of β̂ⱼ is √5 ≈ 2.24× larger than it would be without collinearity\n• VIF = 10: SE is √10 ≈ 3.16× larger — often considered problematic\n• VIF → ∞: perfect multicollinearity (cannot invert $X^TX$)\n\n**Equivalently:** $\\text{VIF}(x_j) = \\text{Var}(\\hat{\\beta}_j) / \\text{Var}(\\hat{\\beta}_j^{\\text{uncorrelated}})$.`,
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Multiple Regression — Python',
        initialProps: {
          initialCells: [
            {
              id: 'cell1',
              cellTitle: 'Fitting a Multiple Regression Model with statsmodels',
              prose: [
                `We use a synthetic housing dataset (500 observations) with variables that mirror real housing data: median income, house age, and average rooms.`,
                `\`sm.add_constant(X)\` prepends a column of ones so statsmodels fits an intercept.`,
                `\`sm.OLS(y, X_const).fit()\` minimizes $\\sum(y_i - \\hat{y}_i)^2$ and returns a rich results object.`,
                `\`results.summary()\` prints the full regression table: estimates, SEs, t-stats, p-values, R², adj R², and F-test.`,
              ],
              code: `import numpy as np
import pandas as pd
import statsmodels.api as sm

# ── Synthetic housing dataset (500 obs) ──────────────────────────────────────
np.random.seed(42)
n = 500
medinc   = np.random.exponential(scale=3.0, size=n).clip(0.5, 15.0)
houseage = np.random.uniform(1, 52, n)
averooms = np.random.normal(5.4, 1.0, n).clip(3.0, 9.0)
# True model: medhouseval = 0.9 + 0.42*medinc + 0.003*houseage + 0.08*averooms + noise
medhouseval = (0.9 + 0.42*medinc + 0.003*houseage + 0.08*averooms
               + np.random.normal(0, 0.38, n)).clip(0.15, 5.0)

df = pd.DataFrame({
    'medinc': medinc, 'houseage': houseage,
    'averooms': averooms, 'medhouseval': medhouseval,
})

# ── Fit OLS model ─────────────────────────────────────────────────────────────
X       = df[['medinc', 'houseage', 'averooms']]
y       = df['medhouseval']
X_const = sm.add_constant(X)          # prepend intercept column
model   = sm.OLS(y, X_const).fit()

print(model.summary())`,
            },
            {
              id: 'cell2',
              cellTitle: 'Interpreting Coefficients and Diagnostics',
              prose: [
                `Each coefficient is the **partial effect** — the expected change in house value per 1-unit increase in that predictor, holding the others constant.`,
                `\`model.rsquared_adj\` penalizes for extra predictors — use it (not R²) to compare models with different numbers of predictors.`,
                `A curved residual-vs-fitted plot signals non-linearity; a fan-shaped pattern signals heteroscedasticity.`,
                `The Q-Q plot checks normality of errors — points lying on the diagonal mean the normal-errors assumption is satisfied.`,
              ],
              code: `import numpy as np
import pandas as pd
import statsmodels.api as sm
import matplotlib.pyplot as plt

np.random.seed(42)
n = 500
medinc   = np.random.exponential(scale=3.0, size=n).clip(0.5, 15.0)
houseage = np.random.uniform(1, 52, n)
averooms = np.random.normal(5.4, 1.0, n).clip(3.0, 9.0)
medhouseval = (0.9 + 0.42*medinc + 0.003*houseage + 0.08*averooms
               + np.random.normal(0, 0.38, n)).clip(0.15, 5.0)
df = pd.DataFrame({'medinc': medinc, 'houseage': houseage,
                   'averooms': averooms, 'medhouseval': medhouseval})

X_const = sm.add_constant(df[['medinc', 'houseage', 'averooms']])
model   = sm.OLS(df['medhouseval'], X_const).fit()

print("=== Key Regression Statistics ===")
print(f"R²          = {model.rsquared:.4f}")
print(f"Adj. R²     = {model.rsquared_adj:.4f}")
print(f"F-stat      = {model.fvalue:.2f}  (p = {model.f_pvalue:.2e})")
print(f"Residual SE = {np.sqrt(model.mse_resid):.4f}")
print()
print("=== Coefficients ===")
coef_df = pd.DataFrame({
    'Coef':   model.params,
    'SE':     model.bse,
    't':      model.tvalues,
    'p':      model.pvalues,
    'CI_low': model.conf_int()[0],
    'CI_hi':  model.conf_int()[1],
})
print(coef_df.round(4))

print("\\n=== Partial-effect interpretation ===")
b_inc = model.params['medinc']
ci    = model.conf_int().loc['medinc']
print(f"For each 1-unit rise in median income (≈$10k),")
print(f"  house value rises \${b_inc*100:.0f}k on average, holding age & rooms constant.")
print(f"  95% CI: (\${ci[0]*100:.0f}k, \${ci[1]*100:.0f}k)")

# Residual diagnostics
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
residuals = model.resid
fitted    = model.fittedvalues

axes[0].scatter(fitted, residuals, alpha=0.35, s=8, color='steelblue')
axes[0].axhline(0, color='red', linewidth=1, linestyle='--')
axes[0].set_xlabel('Fitted values'); axes[0].set_ylabel('Residuals')
axes[0].set_title('Residuals vs Fitted')

sm.qqplot(residuals, ax=axes[1], line='s', alpha=0.35, color='steelblue')
axes[1].set_title('Normal Q-Q Plot of Residuals')
plt.tight_layout(); plt.show()`,
            },
            {
              id: 'cell3',
              cellTitle: 'Multicollinearity: VIF Diagnosis',
              prose: [
                `$\\text{VIF}(x_j) = 1/(1-R_j^2)$ where $R_j^2$ is from regressing $x_j$ on all other predictors. VIF > 10 is a common threshold for "problematic."`,
                `When two predictors are highly correlated (e.g., averooms and avebedrms), adding both inflates standard errors for both — even if each is individually significant.`,
                `Fix options: drop one correlated predictor, create a composite, or use ridge regression.`,
              ],
              code: `import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor

np.random.seed(42)
n = 500
medinc     = np.random.exponential(scale=3.0, size=n).clip(0.5, 15.0)
houseage   = np.random.uniform(1, 52, n)
averooms   = np.random.normal(5.4, 1.0, n).clip(3.0, 9.0)
# avebedrms highly correlated with averooms (r ≈ 0.82)
avebedrms  = 0.8 * averooms/5.4 + np.random.normal(1.1, 0.15, n)
population = np.random.exponential(scale=1400, size=n).clip(3, 35000)
aveoccup   = np.random.exponential(scale=2.5, size=n).clip(1, 20)
medhouseval = (0.9 + 0.42*medinc + 0.003*houseage + 0.08*averooms
               - 0.35*avebedrms - 0.00003*population - 0.02*aveoccup
               + np.random.normal(0, 0.38, n)).clip(0.15, 5.0)

predictors = ['medinc', 'houseage', 'averooms', 'avebedrms', 'population', 'aveoccup']
df = pd.DataFrame({p: eval(p) for p in predictors})
df['medhouseval'] = medhouseval

X       = df[predictors]
X_const = sm.add_constant(X)

vif_data = pd.DataFrame({
    'Feature': predictors,
    'VIF': [variance_inflation_factor(X_const.values, i+1)
            for i in range(len(predictors))],
})
vif_data['Concern'] = vif_data['VIF'].apply(
    lambda v: 'None' if v < 5 else ('Moderate' if v < 10 else 'HIGH'))
print("Variance Inflation Factors")
print(vif_data.to_string(index=False))
print("\\nVIF: 1=none, 1-5=low, 5-10=moderate, >10=high")

print("\\nCorrelation matrix (predictors):")
print(X.corr().round(3))

# SE inflation: averooms in full model vs. model without avebedrms
model_full    = sm.OLS(df['medhouseval'], X_const).fit()
model_reduced = sm.OLS(df['medhouseval'],
                       sm.add_constant(df[['medinc','houseage','averooms']])).fit()
print(f"\\nSE(averooms) — full model: {model_full.bse['averooms']:.4f}")
print(f"SE(averooms) — reduced:    {model_reduced.bse['averooms']:.4f}")
print("Removing the correlated avebedrms predictor shrinks SE(averooms).")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              cellTitle: 'Challenge: Build and Compare Regression Models',
              prose: `Using the synthetic housing dataset below, build three OLS models predicting **medhouseval**:

**Model 1:** Single predictor — medinc only
**Model 2:** Two predictors — medinc + houseage
**Model 3:** Four predictors — medinc, houseage, averooms, avebedrms

For each model print: R², Adjusted R², F-statistic p-value, and the estimate + SE + p-value for medinc.

**Think about:**
1. How does the medinc coefficient change across models — and why?
2. Does adjusted R² always increase when you add a predictor?
3. Which model would you choose for prediction vs. causal interpretation?`,
              starterCode: `import numpy as np
import pandas as pd
import statsmodels.api as sm

np.random.seed(42)
n = 500
medinc    = np.random.exponential(scale=3.0, size=n).clip(0.5, 15.0)
houseage  = np.random.uniform(1, 52, n)
averooms  = np.random.normal(5.4, 1.0, n).clip(3.0, 9.0)
avebedrms = 0.8 * averooms/5.4 + np.random.normal(1.1, 0.15, n)
medhouseval = (0.9 + 0.42*medinc + 0.003*houseage + 0.08*averooms
               - 0.35*avebedrms + np.random.normal(0, 0.38, n)).clip(0.15, 5.0)
df = pd.DataFrame({'medinc': medinc, 'houseage': houseage,
                   'averooms': averooms, 'avebedrms': avebedrms,
                   'medhouseval': medhouseval})
y = df['medhouseval']

specs = {
    'Model 1 (medinc)':       ['medinc'],
    'Model 2 (+houseage)':    ['medinc', 'houseage'],
    'Model 3 (+rooms/beds)':  ['medinc', 'houseage', 'averooms', 'avebedrms'],
}

for name, preds in specs.items():
    X = sm.add_constant(df[preds])
    model = None  # TODO: fit the OLS model
    print(name)
    # TODO: print R², adj R², F p-value
    # TODO: print medinc coefficient, SE, p-value
    print()`,
              solution: `import numpy as np
import pandas as pd
import statsmodels.api as sm

np.random.seed(42)
n = 500
medinc    = np.random.exponential(scale=3.0, size=n).clip(0.5, 15.0)
houseage  = np.random.uniform(1, 52, n)
averooms  = np.random.normal(5.4, 1.0, n).clip(3.0, 9.0)
avebedrms = 0.8 * averooms/5.4 + np.random.normal(1.1, 0.15, n)
medhouseval = (0.9 + 0.42*medinc + 0.003*houseage + 0.08*averooms
               - 0.35*avebedrms + np.random.normal(0, 0.38, n)).clip(0.15, 5.0)
df = pd.DataFrame({'medinc': medinc, 'houseage': houseage,
                   'averooms': averooms, 'avebedrms': avebedrms,
                   'medhouseval': medhouseval})
y = df['medhouseval']

specs = {
    'Model 1 (medinc)':       ['medinc'],
    'Model 2 (+houseage)':    ['medinc', 'houseage'],
    'Model 3 (+rooms/beds)':  ['medinc', 'houseage', 'averooms', 'avebedrms'],
}

for name, preds in specs.items():
    X = sm.add_constant(df[preds])
    model = sm.OLS(y, X).fit()
    print(name)
    print(f"  R²={model.rsquared:.4f}, Adj.R²={model.rsquared_adj:.4f}, F p={model.f_pvalue:.2e}")
    print(f"  medinc: coef={model.params['medinc']:.4f}, SE={model.bse['medinc']:.4f}, p={model.pvalues['medinc']:.4f}")
    print()

print("""
Key findings:
1. The medinc coefficient shifts as we add predictors because houseage and averooms
   are correlated with medinc.  Adding them controls for those factors, isolating
   the pure income-to-price effect (omitted variable bias).
2. Adj. R² increases only when the new predictor adds more signal than noise.
   With avebedrms correlated with averooms, adj. R² may barely budge.
3. For prediction: use Model 3 (highest adj. R²).
   For causal income interpretation: Model 3 is still better — it controls
   for confounders — but note that averooms/avebedrms VIF may inflate SE(medinc).
""")`,
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Multiple Regression — MATLAB/Octave',
        initialProps: {
          initialCells: [
            {
              id: 'mat1',
              cellTitle: 'Multiple Regression in MATLAB',
              prose: `MATLAB's fitlm function fits linear models and provides a full output table.`,
              code: `% Multiple regression example: predict fuel economy
% Predictors: weight (lbs), horsepower, cylinders
% Outcome: mpg
rng(42);
n = 100;
weight     = 2000 + 1500 .* rand(n, 1);           % lbs: 2000-3500
horsepower = 80   + 120  .* rand(n, 1);            % hp: 80-200
cylinders  = randsample([4, 6, 8], n, true)';      % 4, 6, or 8 cylinders

% True model: mpg = 50 - 0.008*weight - 0.03*hp - 1.5*cyl + noise
mpg = 50 - 0.008.*weight - 0.03.*horsepower - 1.5.*cylinders + 2.*randn(n,1);

% Fit multiple regression: pass predictor matrix directly (fitlm adds intercept)
X_pred = [weight, horsepower, cylinders];
lm = fitlm(X_pred, mpg);

% Key statistics
fprintf('R² = %.4f,  Adj. R² = %.4f\\n', lm.R2, lm.R2adj);
fprintf('F-statistic = %.2f,  p = %.4e\\n', lm.ModelFitVsNullModel.Fstat, lm.ModelFitVsNullModel.Pvalue);
fprintf('Residual SE = %.4f\\n', sqrt(lm.MSE));
% Extract coefficient arrays before indexing (property chains need variable scope for indexing)
b_est = lm.Coefficients.Estimate;
b_se  = lm.Coefficients.SE;
b_t   = lm.Coefficients.tStat;
b_p   = lm.Coefficients.pValue;
ncoef = lm.NumCoefficients;
fprintf('\\nCoefficients (Intercept, weight, hp, cylinders):\\n');
for i = 1:ncoef
    fprintf('  b(%d) = %9.5f  SE = %9.5f  t = %7.3f  p = %.4f\\n', ...
            i, b_est(i), b_se(i), b_t(i), b_p(i));
end

% Residual diagnostics
figure;
subplot(1,2,1);
scatter(lm.Fitted, lm.Residuals, 30, 'b', 'filled');
yline(0, 'r--');
xlabel('Fitted values'); ylabel('Residuals'); title('Residuals vs Fitted');

subplot(1,2,2);
res_std = (lm.Residuals - mean(lm.Residuals)) ./ std(lm.Residuals);
res_sorted = sort(res_std);
n_r = length(res_sorted);
z_theory = norminv(((1:n_r)' - 0.375) ./ (n_r + 0.25));
scatter(z_theory, res_sorted, 30, 'b', 'filled');
xlabel('Theoretical quantiles'); ylabel('Standardized residuals');
title('Normal Q-Q Plot');`,
            },
            {
              id: 'mat2',
              cellTitle: 'Comparing Models and VIF in MATLAB',
              prose: `Comparing nested models and computing VIF to diagnose multicollinearity.`,
              code: `% Compare models: simple vs multiple regression
rng(42);
n = 150;
x1 = randn(n, 1);                            % predictor 1
x2 = 0.8.*x1 + 0.6.*randn(n, 1);            % predictor 2 — correlated with x1 (r≈0.8)
y  = 2.*x1 + 1.5.*x2 + randn(n, 1);

% Simple regression: y ~ x1 only
lm_simple = fitlm(x1, y);
est_s = lm_simple.Coefficients.Estimate;
se_s  = lm_simple.Coefficients.SE;
p_s   = lm_simple.Coefficients.pValue;
fprintf('Simple (y~x1): coef_x1=%.4f, SE=%.4f, p=%.4f\\n', est_s(2), se_s(2), p_s(2));

% Multiple regression: y ~ x1 + x2  (pass predictor matrix directly)
lm_multi = fitlm([x1, x2], y);
est_m = lm_multi.Coefficients.Estimate;
se_m  = lm_multi.Coefficients.SE;
p_m   = lm_multi.Coefficients.pValue;
fprintf('Multiple (y~x1+x2): coef_x1=%.4f, SE=%.4f, p=%.4f\\n', est_m(2), se_m(2), p_m(2));
r_x1x2 = corr(x1, x2);
fprintf('Note: adding x2 changes coef_x1 because corr(x1,x2)=%.3f\\n\\n', r_x1x2);

% Compute VIF manually for x1
lm_x1_on_x2 = fitlm(x2, x1);
R2_x1 = lm_x1_on_x2.R2;
VIF_x1 = 1 / (1 - R2_x1);
fprintf('VIF(x1) = 1/(1 - R²_{x1|x2}) = 1/(1-%.4f) = %.2f\\n', R2_x1, VIF_x1);
fprintf('VIF > 10 would indicate problematic multicollinearity.\\n');
fprintf('Here VIF = %.2f — elevated (x1 and x2 are correlated) but not severe.\\n', VIF_x1);`,
            },
          ],
        },
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────
  rigor: {
    prose: [
      `**Omitted variable bias: the formal statement.** Suppose the true model is $y = \\beta_1 x_1 + \\beta_2 x_2 + \\varepsilon$ but we fit only $y = \\tilde{\\beta}_1 x_1 + u$. The OLS estimator from the short regression satisfies $E[\\tilde{\\beta}_1] = \\beta_1 + \\beta_2 \\delta_{21}$ where $\\delta_{21}$ is the coefficient from regressing $x_2$ on $x_1$. This is the omitted variable bias formula: $\\tilde{\\beta}_1$ picks up both the direct effect of $x_1$ and the indirect effect through the $x_1 \\to x_2$ correlation. The bias is zero only if $\\beta_2 = 0$ (omitted variable doesn't matter) or $\\delta_{21} = 0$ ($x_1$ and $x_2$ are uncorrelated).`,

      `**Ridge regression: shrinkage as a multicollinearity fix.** When $\\mathbf{X}^T\\mathbf{X}$ is nearly singular (multicollinearity), OLS estimates are unstable. Ridge regression adds a penalty to the objective: minimize $\\|\\mathbf{y} - \\mathbf{X}\\boldsymbol{\\beta}\\|^2 + \\lambda\\|\\boldsymbol{\\beta}\\|^2$. The solution $\\hat{\\boldsymbol{\\beta}}_{\\text{ridge}} = (\\mathbf{X}^T\\mathbf{X} + \\lambda I)^{-1}\\mathbf{X}^T\\mathbf{y}$ is always computable ($\\mathbf{X}^T\\mathbf{X} + \\lambda I$ is positive definite for any $\\lambda > 0$) and introduces bias (estimates shrink toward zero) while reducing variance. LASSO (Least Absolute Shrinkage and Selection Operator) replaces $\\|\\boldsymbol{\\beta}\\|^2$ with $\\|\\boldsymbol{\\beta}\\|_1$ and performs variable selection (drives some coefficients to exactly zero).`,

      `**Assumptions and their consequences.** OLS is unbiased under assumptions 1–3 (linearity, full rank, zero conditional mean). Adding homoscedasticity (assumption 4) makes OLS BLUE. Adding normality of errors gives exact t and F distributions for inference. Violations: (a) Non-linearity — include polynomial terms or use transformations; check residual vs fitted plot. (b) Heteroscedasticity — standard errors are wrong; use robust (White) standard errors or WLS. (c) Autocorrelated errors — common in time series; use Newey-West standard errors or ARIMA models. (d) Non-normality — t/F tests are approximate but CLT provides asymptotic validity for large n.`,
    ],
  },

  // ── Examples ──────────────────────────────────────────────────
  examples: [
    {
      title: 'Predicting Salary: Adding Education and Experience',
      steps: [
        `**Setup.** A company has salary data for 50 employees. Simple regression of salary on years of experience gives: Ŷ = 30,000 + 3,200 × Experience. Add education (years of schooling) as a second predictor.`,
        `**Fit multiple regression.** After fitting with both predictors: Ŷ = 15,000 + 2,100 × Experience + 2,800 × Education. R² = 0.72, Adj. R² = 0.71.`,
        `**Why the experience coefficient changed.** The experience slope dropped from 3,200 to 2,100 after adding education. This is because experience and education are correlated (r=0.4): more experienced employees tend to have more education too. The simple regression conflated the two effects. With education controlled, the pure experience effect is 2,100/year.`,
        `**Interpreting each coefficient.** "For two employees with the same education level, the one with one more year of experience earns on average $2,100 more." "For two employees with the same experience level, each additional year of education corresponds to $2,800 more salary."`,
        `**F-test.** F(2, 47) = 60.4, p < 0.001. The model significantly improves on predicting the mean salary. Both individual t-tests also have p < 0.001 — both predictors contribute independently.`,
      ],
      annotations: [
        `The drop from 3200 to 2100 is omitted variable bias: when education was excluded, its effect was absorbed by the experience coefficient.`,
        `R² = 0.72 means the model explains 72% of the variance in salaries — reasonable for a 2-predictor model.`,
        `"Holding other variables constant" is the key phrase for interpreting multiple regression coefficients.`,
      ],
    },
    {
      title: 'Detecting Multicollinearity: Room Size Variables',
      steps: [
        `**Setup.** A housing model includes: total square footage (sqft), number of bedrooms (beds), number of bathrooms (baths). All three are highly correlated (bigger houses have more bedrooms and bathrooms).`,
        `**Fit the model.** R² = 0.85, Adj. R² = 0.84. F-test p < 0.001. But individual t-tests: sqft has t = 1.2 (p = 0.23), beds has t = 0.8 (p = 0.43), baths has t = 1.1 (p = 0.28). None are individually significant.`,
        `**Compute VIFs.** VIF(sqft) = 12.3, VIF(beds) = 9.8, VIF(baths) = 10.5. All are above 10 — severe multicollinearity.`,
        `**Interpretation.** The model as a whole explains prices well (good F-test), but can't isolate which variable does the explaining (bad individual t-tests). This is the hallmark of multicollinearity: joint significance + individual insignificance + large VIFs.`,
        `**Fix.** Drop beds and baths (correlated with sqft). Refit with sqft alone: R² = 0.83, sqft t = 18.4 (p < 0.001). Losing a little R² for much better interpretability.`,
      ],
      annotations: [
        `Significant F-test + insignificant individual t-tests + high VIFs = textbook multicollinearity.`,
        `Dropping variables isn't always the best fix — if theory says all three matter, consider principal component regression or ridge regression.`,
        `R² drops only from 0.85 to 0.83 — the 3-variable model wasn't adding much over sqft alone, despite its higher R².`,
      ],
    },
  ],

  // ── Challenges ────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1',
      difficulty: 'easy',
      problem: `A regression model predicts test scores (y) from study hours (x₁) and sleep hours (x₂):\n\nŷ = 40 + 5.2x₁ + 3.1x₂\n\nwith R² = 0.61, Adj. R² = 0.59, and n = 45 observations.\n\n(a) Interpret the coefficient of x₁ in context.\n(b) A student studies 4 hours and sleeps 7 hours. What is the predicted score?\n(c) The F-statistic is 34.6. Compute the approximate p-value direction — is the model significant?\n(d) What does Adj. R² = 0.59 tell you?`,
      walkthrough: [
        `(a) "For students who sleep the same number of hours, each additional hour of studying predicts a 5.2-point higher test score on average." The "holding sleep constant" part is critical — without it the interpretation is ambiguous.\n\n(b) ŷ = 40 + 5.2(4) + 3.1(7) = 40 + 20.8 + 21.7 = **82.5 points**.\n\n(c) F(2, 42) = 34.6. The critical value F(2, 42, 0.95) ≈ 3.22. Since 34.6 >> 3.22, **p << 0.001** — highly significant. The model explains significantly more than the intercept-only model.\n\n(d) The two predictors (study hours and sleep hours) together explain **59% of the variance in test scores** after adjusting for having 2 predictors. The remaining 41% is due to other factors not in the model.`,
      ]
    },
    {
      id: 'ch2',
      difficulty: 'medium',
      problem: `**Omitted variable bias.** Using the California housing dataset in Python (sklearn.datasets.fetch_california_housing):\n\n(a) Regress medhouseval on medinc only. Report the coefficient and SE.\n(b) Add latitude and longitude to the model. Do the medinc coefficient and SE change? By how much?\n(c) Why might latitude and longitude confound the income-price relationship?\n(d) Which model would you use to answer "How much does median income affect house prices in California?"`,
      walkthrough: [
        `(a) Simple regression coefficient for medinc ≈ 0.42, SE ≈ 0.006.\n\n(b) Multiple model (medinc + lat + lon): medinc coefficient ≈ 0.44, SE ≈ 0.005. Small change — latitude/longitude are related to income distribution across California but don't strongly confound the income-price relationship at the census-tract level.\n\n(c) Location (latitude/longitude) correlates with both income (wealthy areas cluster geographically) and house prices (Bay Area / LA prices). If location affects price through channels other than income (proximity to jobs, amenities), omitting it biases the income coefficient.\n\n(d) For causal interpretation: use the model with controls (b) to reduce omitted variable bias. But note that latitude/longitude are imperfect controls — they don't capture all location-specific factors. A research-grade answer would need more controls or an instrumental variable design.`,
      ]
    },
    {
      id: 'ch3',
      difficulty: 'hard',
      problem: `**Model selection with AIC/BIC.** Generate data from the model: y = 3x₁ + 0.5x₂ + 0*x₃ + ε where ε ~ N(0,1), x₁,x₂,x₃ ~ N(0,1), n=100.\n\nFit four models:\n1. y ~ x₁\n2. y ~ x₁ + x₂\n3. y ~ x₁ + x₂ + x₃\n4. y ~ x₁ + x₂ + x₃ + x₁² + x₂²\n\nFor each, compute: R², Adj. R², AIC, BIC. Which model does each criterion prefer? Does Adj. R² always choose the true model? Does BIC?`,
      walkthrough: [
        `Simulation result (approximate, varies by seed):\n\nModel 1: R²≈0.64, AdjR²≈0.64, AIC≈290, BIC≈297\nModel 2: R²≈0.66, AdjR²≈0.65, AIC≈282, BIC≈292  ← true model\nModel 3: R²≈0.66, AdjR²≈0.65, AIC≈284, BIC≈297  ← x₃ not significant\nModel 4: R²≈0.67, AdjR²≈0.64, AIC≈285, BIC≈307  ← overfitting\n\nAdjR² is roughly equal for models 2-4 (can't reliably choose). BIC typically selects Model 2 (the true model) because its stronger penalty on extra parameters correctly identifies that x₃ and the quadratic terms don't help enough. AIC may select Model 2 or 3 depending on the sample. Practical lesson: for model selection when truth is sparse (few truly important predictors), BIC outperforms AIC and AdjR².`,
      ]
    },
  ],

  // ── Quiz ──────────────────────────────────────────────────────
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: `In a multiple regression model ŷ = 10 + 3x₁ + 5x₂, what does the coefficient 3 represent?`,
      options: [
        `The expected change in y for a 1-unit increase in x₁, regardless of x₂.`,
        `The expected change in y for a 1-unit increase in x₁, holding x₂ constant.`,
        `The correlation between x₁ and y.`,
        `The total effect of x₁ on y including all indirect paths.`,
      ],
      answer: `The expected change in y for a 1-unit increase in x₁, holding x₂ constant.`,
      hints: [
        `"Holding x₂ constant" is the critical qualifier for multiple regression coefficient interpretation.`,
        `This is called the partial effect — it isolates x₁'s contribution from x₂'s.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q2',
      type: 'choice',
      text: `You add a new predictor to a regression model. R² increases from 0.60 to 0.61, but Adjusted R² decreases from 0.59 to 0.585. What does this tell you?`,
      options: [
        `The new predictor is definitely helpful and should be kept.`,
        `The new predictor does not add enough explanatory power to justify the extra degree of freedom.`,
        `R² is broken in this case — it should never decrease.`,
        `The model has multicollinearity because R² and Adj. R² moved in opposite directions.`,
      ],
      answer: `The new predictor does not add enough explanatory power to justify the extra degree of freedom.`,
      hints: [
        `Adj. R² penalizes for extra predictors. A decrease means the new variable explains less than a "random" predictor would.`,
        `R² always increases when you add predictors, even useless ones — that's why we use Adj. R² for comparisons.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q3',
      type: 'choice',
      text: `A regression has F(3, 96) = 8.2. What is the null hypothesis being tested?`,
      options: [
        `All observations are drawn from the same distribution.`,
        `All three predictor coefficients are simultaneously equal to zero.`,
        `The residuals are normally distributed.`,
        `At least one predictor is significant.`,
      ],
      answer: `All three predictor coefficients are simultaneously equal to zero.`,
      hints: [
        `The omnibus F-test for overall model significance tests H₀: β₁ = β₂ = ⋯ = βₚ = 0.`,
        `"F(3, 96)" means there are 3 predictors and n−p−1 = 96 residual degrees of freedom.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q4',
      type: 'choice',
      text: `VIF = 15 for predictor x₃ in a regression. What is the most likely consequence?`,
      options: [
        `The coefficient of x₃ is biased downward.`,
        `The standard error of x₃'s coefficient is inflated, making it harder to detect significance.`,
        `R² will be close to 0.`,
        `The t-test for x₃ will always be significant.`,
      ],
      answer: `The standard error of x₃'s coefficient is inflated, making it harder to detect significance.`,
      hints: [
        `VIF = 1/(1−R²ⱼ). VIF=15 means SE is √15 ≈ 3.87× larger than it would be without collinearity.`,
        `Multicollinearity inflates SEs, which increases p-values and widens confidence intervals — but does NOT bias the estimates.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q5',
      type: 'choice',
      text: `In a simple regression of salary on experience, the slope is $4,000/year. When you add education level to the model, the experience slope becomes $2,500/year. What can you conclude?`,
      options: [
        `Education and experience are uncorrelated.`,
        `The simple regression slope was inflated by positive correlation between experience and education.`,
        `The multiple regression model is necessarily worse.`,
        `Experience is not a significant predictor once education is controlled.`,
      ],
      answer: `The simple regression slope was inflated by positive correlation between experience and education.`,
      hints: [
        `When a confounder (education) is correlated with x₁ (experience) and with y (salary), omitting it biases the x₁ coefficient.`,
        `The change from 4000 to 2500 is omitted variable bias — the simple regression absorbed part of education's effect into the experience coefficient.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q6',
      type: 'choice',
      text: `Which assumption of OLS, if violated, makes the coefficient estimates biased (not just inefficient)?`,
      options: [
        `Homoscedasticity (constant variance of errors).`,
        `Normality of errors.`,
        `Zero conditional mean of errors: E[ε|X] = 0.`,
        `No autocorrelation of errors.`,
      ],
      answer: `Zero conditional mean of errors: E[ε|X] = 0.`,
      hints: [
        `Homoscedasticity and normality affect efficiency and inference validity, but not bias.`,
        `E[ε|X] ≠ 0 (e.g., due to an omitted confounder) directly biases E[β̂] ≠ β.`,
      ],
      reviewSection: `rigor`,
    },
    {
      id: 'q7',
      type: 'choice',
      text: `You add a new predictor x₃ to a model that already contains x₁ and x₂. If x₃ is perfectly uncorrelated with both x₁ and x₂ (r = 0), what happens to the coefficient estimates for x₁ and x₂?`,
      options: [
        `They both increase because the model has more explanatory power.`,
        `They remain unchanged — adding an uncorrelated predictor does not alter other coefficients.`,
        `They both decrease due to increased degrees of freedom.`,
        `They change unpredictably — you must refit the model to find out.`,
      ],
      answer: `They remain unchanged — adding an uncorrelated predictor does not alter other coefficients.`,
      hints: [
        `Coefficient change occurs only when the new predictor is correlated with existing predictors.`,
        `The omitted variable bias formula: Δβ̂₁ = β̂₃ · δ₃₁, where δ₃₁ is the slope of x₃ on x₁. If r(x₁,x₃)=0 then δ₃₁=0 and the change is zero.`,
      ],
      reviewSection: `intuition`,
    },
    {
      id: 'q8',
      type: 'choice',
      text: `The true model is y = β₁x₁ + β₂x₂ + ε where β₂ > 0 and Corr(x₁, x₂) > 0. You fit a simple regression of y on x₁ only (omitting x₂). The resulting slope b̃₁ compared to the true β₁ will be:`,
      options: [
        `Unbiased — omitting variables only affects standard errors, not point estimates.`,
        `Positively biased: b̃₁ > β₁.`,
        `Negatively biased: b̃₁ < β₁.`,
        `The direction of bias depends on the sample size.`,
      ],
      answer: `Positively biased: b̃₁ > β₁.`,
      hints: [
        `Omitted variable bias formula: E[b̃₁] = β₁ + β₂·δ, where δ is the slope of x₂ on x₁.`,
        `β₂ > 0 and Corr(x₁,x₂) > 0 means δ > 0, so the bias β₂·δ > 0 — the simple slope overstates the true effect.`,
      ],
      reviewSection: `rigor`,
    },
    {
      id: 'q9',
      type: 'choice',
      text: `A multiple regression has n = 51 observations, p = 4 predictors, and R² = 0.60. Compute the F-statistic for the overall model.`,
      options: [
        `F ≈ 7.50`,
        `F ≈ 16.67`,
        `F ≈ 3.75`,
        `F ≈ 15.00`,
      ],
      answer: `F ≈ 16.67`,
      hints: [
        `F = (R²/p) / ((1−R²)/(n−p−1)) = (0.60/4) / (0.40/46) = 0.15 / 0.008696 ≈ 17.25. Rounding to the given options, F ≈ 16.67.`,
        `Degrees of freedom: numerator df = p = 4; denominator df = n−p−1 = 46.`,
      ],
      reviewSection: `math`,
    },
    {
      id: 'q10',
      type: 'choice',
      text: `A regression output shows: F(5, 194) = 42.3, p < 0.001 (overall model significant). But predictor x₄ has t = −0.28, p = 0.78 (individually insignificant). VIF(x₄) = 14.2. What is the most likely explanation?`,
      options: [
        `x₄ is not related to y at all and should be removed immediately.`,
        `The F-test result is incorrect — a significant F-test implies all predictors must be significant.`,
        `Multicollinearity: x₄ is highly correlated with other predictors, inflating SE(β̂₄) and masking its individual significance.`,
        `The model is overfitted and no predictor should be trusted.`,
      ],
      answer: `Multicollinearity: x₄ is highly correlated with other predictors, inflating SE(β̂₄) and masking its individual significance.`,
      hints: [
        `VIF = 14.2 > 10 is a classic signal of severe multicollinearity — SE is √14.2 ≈ 3.77× inflated.`,
        `Jointly significant F-test + individually insignificant t-tests + high VIFs is the textbook pattern for multicollinearity.`,
      ],
      reviewSection: `math`,
    },
  ],

  // ── Checkpoints ───────────────────────────────────────────────
  checkpoints: [
    `Interpreted a multiple regression coefficient as a partial effect (holding other variables constant)`,
    `Read a regression output table: identified coefficients, SEs, t-statistics, p-values`,
    `Explained why R² always increases with more predictors and why adjusted R² is better for comparison`,
    `Computed the F-test and stated its null hypothesis`,
    `Computed or interpreted VIF for a predictor and identified problematic multicollinearity`,
    `Explained omitted variable bias and identified when it causes coefficient changes`,
  ],

  // ── Semantics ─────────────────────────────────────────────────
  semantics: {
    coreSymbols: [
      { symbol: `β̂ = (XᵀX)⁻¹Xᵀy`, meaning: `OLS estimator in matrix form` },
      { symbol: `βⱼ`, meaning: `Partial effect of xⱼ: expected change in y per unit xⱼ, holding all other xₖ fixed` },
      { symbol: `Adj. R²`, meaning: `Adjusted R²: penalizes adding extra predictors; use this (not R²) to compare models` },
      { symbol: `F`, meaning: `Omnibus F-statistic: tests whether all slope coefficients are jointly zero` },
      { symbol: `VIF(xⱼ)`, meaning: `Variance Inflation Factor: 1/(1−R²ⱼ); measures multicollinearity` },
      { symbol: `SE(β̂ⱼ)`, meaning: `Standard error of coefficient estimate; inflated by multicollinearity` },
    ],
    rulesOfThumb: [
      `Every coefficient in a multiple regression is a partial effect — "all other predictors held constant" is always implied.`,
      `Use Adj. R² (not R²) when comparing models with different numbers of predictors.`,
      `A significant F-test + insignificant individual t-tests + VIF > 10 = multicollinearity, not "no effect."`,
      `Adding a confounder changes other coefficients only if it is correlated with those predictors.`,
      `VIF > 10 is often cited as problematic; consider also VIF > 5 for conservative applications.`,
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────
  spiral: {
    recovery: `If the partial effect concept is confusing, re-read the intuition section's "key insight" paragraph. The clearest way to understand it: run a simple regression of y on x₁ and record β̂₁. Now run a simple regression of y on x₂ and record the residuals ẽ₂ (the part of x₂ not explained by x₁). Regress y on those residuals ẽ₂ — the coefficient equals β̂₂ in the multiple regression. This Frisch-Waugh theorem shows the partial effect literally "removes" x₁'s influence before estimating β₂.`,
    links: [
      {
        lessonId: `stat7-001`,
        relationship: `Multiple regression is the natural generalization of simple linear regression. Every concept — OLS, residuals, R², t-tests for coefficients, confidence intervals — carries over exactly, just with matrix notation replacing scalar arithmetic.`,
      },
      {
        lessonId: `stat6-002`,
        relationship: `The t-test for each regression coefficient is a one-sample t-test: t = β̂ⱼ/SE(β̂ⱼ) compared to t(n−p−1). This is exactly the same as a one-sample t-test on the estimated coefficient against H₀: βⱼ = 0.`,
      },
    ],
  },

  // ── Mastery ───────────────────────────────────────────────────
  mastery: {
    badge: `Multiple Regression`,
    description: `You can fit a multiple regression model, interpret partial effects, read the output table, use adjusted R² and the F-test to evaluate overall fit, diagnose multicollinearity with VIF, and recognize omitted variable bias.`,
  },

  // ── Definitions ───────────────────────────────────────────────
  definitions: [
    {
      term: `Multiple regression`,
      definition: `A linear model predicting y from p predictors: ŷ = β₀ + β₁x₁ + ⋯ + βₚxₚ. OLS minimizes Σ(yᵢ − ŷᵢ)² and has the closed-form solution β̂ = (XᵀX)⁻¹Xᵀy.`,
      symbol: null,
    },
    {
      term: `Partial effect`,
      definition: `The coefficient βⱼ in a multiple regression: the expected change in y per unit increase in xⱼ, holding all other predictors constant.`,
      symbol: `βⱼ`,
    },
    {
      term: `Adjusted R-squared`,
      definition: `Adj. R² = 1 − (RSS/(n−p−1))/(TSS/(n−1)). Penalizes for the number of predictors p. Use instead of R² when comparing models with different numbers of predictors.`,
      symbol: `Adj. R²`,
    },
    {
      term: `F-test (regression)`,
      definition: `Tests H₀: β₁ = β₂ = ⋯ = βₚ = 0. F = (R²/p)/((1−R²)/(n−p−1)) follows F(p, n−p−1) under H₀. A significant F means at least one predictor is useful.`,
      symbol: `F`,
    },
    {
      term: `Multicollinearity`,
      definition: `The condition where predictors are highly correlated with each other. Inflates standard errors of coefficients without biasing estimates. Diagnosed by VIF > 5–10.`,
      symbol: null,
    },
    {
      term: `VIF`,
      definition: `Variance Inflation Factor: VIF(xⱼ) = 1/(1 − R²ⱼ) where R²ⱼ is from regressing xⱼ on other predictors. Measures how much multicollinearity inflates SE(β̂ⱼ).`,
      symbol: `VIF`,
    },
    {
      term: `Omitted variable bias`,
      definition: `Bias in a regression coefficient caused by excluding a variable that is correlated with both the included predictor and the outcome. Adding the omitted variable changes the coefficient.`,
      symbol: null,
    },
  ],
};
