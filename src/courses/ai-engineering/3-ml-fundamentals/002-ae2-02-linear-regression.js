export default {
  id: 'ae-p2-02-linear-regression',
  slug: 'linear-regression',
  chapter: 'ae-p2',
  order: 1,
  title: 'Linear Regression',
  subtitle: 'The hello world of machine learning. Every other algorithm follows the same pattern: model, cost function, optimizer.',
  tags: ['linear-regression', 'gradient-descent', 'MSE', 'normal-equation', 'R-squared', 'ridge-regression', 'feature-scaling', 'polynomial-regression'],

  hook: {
    question: 'You have 100 house prices and their sizes. You want to predict the price of a new house. How do you turn scattered data points into a formula?',
    realWorldContext:
      'Linear regression draws the best straight line through your data. More importantly, it introduces the complete ML training loop: define a model, define a cost function, optimize the parameters. Every ML algorithm — from neural networks to gradient boosting — follows this same pattern. Master it here with the simplest possible case and you will recognize the skeleton inside every other algorithm. Linear regression is not just a teaching tool either: it runs in production for demand forecasting, A/B test analysis, financial modeling, and as the baseline that every regression task must beat.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'The model is y = wx + b. Two parameters: w (weight/slope — how much y changes per unit of x) and b (bias/intercept — the value of y when x = 0). The goal: find w and b so that wx + b is as close as possible to the actual y for every training point. "As close as possible" needs a definition. That is the cost function.',
      'Mean Squared Error (MSE) = (1/n) · Σ(ŷᵢ − yᵢ)². Two things make it the right choice: squaring penalizes large errors disproportionately (an error of 10 costs 100× more than an error of 1), and the squared function is smooth and differentiable everywhere — which makes optimization tractable. Plot w on the x-axis and MSE on the y-axis. The result is a bowl (a convex parabola). Training means finding the bottom of the bowl.',
      'Gradient descent finds the bottom of the bowl by taking steps downhill. The gradient of MSE with respect to each parameter points uphill. Subtract it (scaled by the learning rate η) to move downhill. For y = wx + b:\n\n  ∂MSE/∂w = (2/n) · Σ(ŷᵢ − yᵢ) · xᵢ\n  ∂MSE/∂b = (2/n) · Σ(ŷᵢ − yᵢ)\n\nUpdate rule: w ← w − η · ∂MSE/∂w, and b ← b − η · ∂MSE/∂b. Repeat until MSE stops decreasing.',
      'The learning rate η controls step size. Too large: you overshoot the minimum and the cost explodes. Too small: convergence takes forever. Typical starting values are 0.01, 0.001, or 0.0001. The right value depends on the scale of your features — this is why feature scaling matters.',
      'The normal equation: for linear regression specifically, there is a closed-form solution that skips iteration entirely. Set the gradient to zero and solve: w = (XᵀX)⁻¹Xᵀy. One shot, exact answer. Limitation: inverting XᵀX costs O(n³) in the number of features. For problems with thousands of features or millions of data points, gradient descent is far more efficient.',
      'Multiple linear regression extends the model to d features: y = w₁x₁ + w₂x₂ + ... + wdxd + b = wᵀx + b. Everything is the same: MSE cost function, gradient descent updates all weights simultaneously. The cost surface is now a bowl in (d+1)-dimensional space. Feature scaling is critical: if one feature ranges 0–1 and another 0–1,000,000, the cost surface becomes a long narrow valley. Gradient descent zig-zags along the walls instead of heading straight to the bottom. Standardize (subtract mean, divide by std) before training.',
      'Polynomial regression lets you fit curves with the same linear machinery: create features x, x², x³, ... and run linear regression on them. The model y = w₁x + w₂x² + w₃x³ + b is still linear in the weights — "linear regression" means linear in the parameters, not in x. Higher-degree polynomials can fit any training data perfectly but predict poorly on new data (overfitting). A degree-10 polynomial trained on 10 points passes through every point and generalizes to nothing.',
      'R² (R-squared) measures how well the model explains the variance in y: R² = 1 − SS_res/SS_tot where SS_res = Σ(yᵢ − ŷᵢ)² and SS_tot = Σ(yᵢ − ȳ)². R² = 1: perfect predictions. R² = 0: the model is no better than always predicting the mean. R² < 0: the model is actively worse than predicting the mean. Unlike MSE, R² is scale-free — it works for comparing models across different datasets.',
      'Ridge regression (L2 regularization) prevents overfitting when you have many features: cost = MSE + λ · Σwᵢ². The penalty λΣwᵢ² discourages large weights. Gradient update adds 2λwᵢ to each weight gradient, steadily shrinking weights toward zero. λ is the regularization strength — higher λ means smaller weights and more regularization. This trades a small increase in training error for a large reduction in test error when the model is overfitting.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'MSE creates a convex bowl — gradient descent is guaranteed to find the global minimum',
        body: 'For linear regression, the MSE cost function is a convex quadratic in the parameters. This means:\n- There is exactly one minimum (no local minima to get stuck in)\n- Every gradient step moves closer to that minimum\n- The normal equation finds it in one shot\n\nThis guarantee disappears for neural networks — the loss surface has millions of saddle points and local minima. Linear regression is the one case where the math is completely clean.',
      },
      {
        type: 'procedure',
        title: 'The ML training loop — the template every algorithm follows',
        steps: [
          'Define the model: y_hat = f(x; parameters)',
          'Define the cost function: how wrong are the predictions?',
          'Initialize parameters (zeros or small random values)',
          'Forward pass: compute predictions for all training examples',
          'Compute cost: mean of squared errors (or cross-entropy, or ...)',
          'Backward pass: compute gradients of cost w.r.t. each parameter',
          'Update parameters: params -= learning_rate * gradients',
          'Repeat steps 4–7 until cost is low enough or stops decreasing',
        ],
      },
      {
        type: 'warning',
        title: 'Feature scaling is not optional for gradient descent',
        body: 'If feature 1 ranges 0–1 and feature 2 ranges 0–1,000,000, the MSE cost surface is an extremely elongated bowl. The gradient for feature 2 is huge compared to feature 1. Any learning rate that works for feature 2 is microscopic for feature 1, and vice versa.\n\nStandardize all features before training with gradient descent: xᵢ_scaled = (xᵢ − mean) / std.\n\nThe normal equation does not suffer from this — it solves the system directly. But gradient descent (and every optimizer in PyTorch) needs scaled features.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Linear Regression',
        mathBridge: 'MSE = (1/n)Σ(ŷ−y)². ∂MSE/∂w = (2/n)Σ(ŷ−y)·x. Normal equation: w = (XᵀX)⁻¹Xᵀy. R² = 1 − SS_res/SS_tot.',
        caption: 'Build linear regression with gradient descent from scratch, compare to the closed-form normal equation, and extend to multiple features and ridge regularization.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Linear regression with gradient descent',
              prose: [
                'Build the complete training loop from scratch: model, cost function, gradients, update rule.',
                'The model is y_hat = w*x + b. The cost is MSE. The gradient formulas come from calculus: ∂MSE/∂w = (2/n)·Σ(ŷ−y)·x. Each epoch: compute predictions, compute gradients, update w and b.',
                'Track cost_history to see the bowl being descended. After training, compare learned w and b to the true values used to generate the data.',
              ],
              code: `import random
import math

random.seed(42)

TRUE_W = 3.0
TRUE_B = 7.0
N = 100

X = [random.uniform(0, 10) for _ in range(N)]
y = [TRUE_W * x + TRUE_B + random.gauss(0, 2.0) for x in X]

class LinearRegression:
    def __init__(self, lr=0.01):
        self.w = 0.0
        self.b = 0.0
        self.lr = lr
        self.cost_history = []

    def predict(self, X):
        return [self.w * x + self.b for x in X]

    def compute_cost(self, X, y):
        preds = self.predict(X)
        n = len(y)
        return sum((p - a)**2 for p, a in zip(preds, y)) / n

    def fit(self, X, y, epochs=1000, log_every=200):
        n = len(y)
        for epoch in range(epochs):
            preds = self.predict(X)
            errors = [p - a for p, a in zip(preds, y)]
            dw = (2/n) * sum(e * x for e, x in zip(errors, X))
            db = (2/n) * sum(errors)
            self.w -= self.lr * dw
            self.b -= self.lr * db
            cost = self.compute_cost(X, y)
            self.cost_history.append(cost)
            if epoch % log_every == 0:
                print(f"  epoch {epoch:4d} | cost={cost:.4f} | w={self.w:.4f} | b={self.b:.4f}")

    def r_squared(self, X, y):
        preds = self.predict(X)
        y_mean = sum(y) / len(y)
        ss_res = sum((a - p)**2 for a, p in zip(y, preds))
        ss_tot = sum((a - y_mean)**2 for a in y)
        return 1 - ss_res / ss_tot

model = LinearRegression(lr=0.005)
model.fit(X, y, epochs=1000)
print(f"\\nLearned: y = {model.w:.4f}x + {model.b:.4f}")
print(f"True:    y = {TRUE_W}x + {TRUE_B}")
print(f"R²:      {model.r_squared(X, y):.4f}")
print(f"Final cost: {model.cost_history[-1]:.4f}")`,
            },
            {
              id: 2,
              cellTitle: 'Normal equation vs gradient descent',
              prose: [
                'The normal equation solves for w directly: w = (XᵀX)⁻¹Xᵀy. For simple linear regression with one feature, this reduces to the slope/intercept formulas from statistics.',
                'Compare the two methods: normal equation gives the exact answer in one shot. Gradient descent approaches it iteratively. For small datasets, both give the same answer.',
                'Key tradeoff: normal equation is O(d³) in features — fine for d < 10,000, slow for d = 100,000+. Gradient descent scales to any feature count and any data size.',
              ],
              code: `import random

random.seed(42)
N = 100
X_d = [random.uniform(0, 10) for _ in range(N)]
y_d = [3.0 * x + 7.0 + random.gauss(0, 2.0) for x in X_d]

class NormalEquation:
    def __init__(self):
        self.w = 0.0
        self.b = 0.0

    def fit(self, X, y):
        n = len(X)
        x_mean = sum(X) / n
        y_mean = sum(y) / n
        numerator   = sum((X[i] - x_mean) * (y[i] - y_mean) for i in range(n))
        denominator = sum((X[i] - x_mean)**2 for i in range(n))
        self.w = numerator / denominator
        self.b = y_mean - self.w * x_mean
        return self

    def predict(self, X):
        return [self.w * x + self.b for x in X]

    def r_squared(self, X, y):
        preds = self.predict(X)
        y_mean = sum(y) / len(y)
        ss_res = sum((a - p)**2 for a, p in zip(y, preds))
        ss_tot = sum((a - y_mean)**2 for a in y)
        return 1 - ss_res / ss_tot

ne = NormalEquation()
ne.fit(X_d, y_d)
print("=== Normal Equation ===")
print(f"  Learned: y = {ne.w:.6f}x + {ne.b:.6f}")
print(f"  R²:      {ne.r_squared(X_d, y_d):.6f}")

# Compare to gradient descent from cell 1
from_gd_w = 3.0  # approximately what GD converged to
print()
print("Method         |  w          |  b")
print("---------------|-------------|----------")
print(f"Normal Eq      | {ne.w:.6f}  | {ne.b:.6f}")
print(f"True values    | 3.000000    | 7.000000")
print()
print("Normal equation gives the exact optimal solution in one step.")
print("Gradient descent approaches it iteratively.")
print(f"Use gradient descent when d > ~10,000 features (O(d³) matrix inversion gets slow).")`,
            },
            {
              id: 3,
              cellTitle: 'Multiple regression with feature scaling',
              prose: [
                'Extend to 3 features: house size (0–3000 sq ft), bedrooms (1–5), and age (0–50 years). Without scaling, gradient descent struggles because the cost surface is elongated.',
                'Standardize each feature to zero mean, unit variance: x_scaled = (x − mean) / std. This makes the cost surface spherical, and gradient descent converges much faster.',
                'After training, note the relative weight magnitudes: larger weight = more predictive power. The sign tells direction (bedrooms positive → more bedrooms = higher price; age negative → older house = lower price).',
              ],
              code: `import random

random.seed(42)
N = 100

X_m, y_m = [], []
for _ in range(N):
    size     = random.uniform(500, 3000)
    bedrooms = random.randint(1, 5)
    age      = random.uniform(0, 50)
    price    = 50*size + 10000*bedrooms - 1000*age + 50000 + random.gauss(0, 20000)
    X_m.append([size, bedrooms, age])
    y_m.append(price)

def standardize_X(X):
    n_feat = len(X[0])
    means = [sum(X[i][j] for i in range(len(X))) / len(X) for j in range(n_feat)]
    stds  = [(sum((X[i][j]-means[j])**2 for i in range(len(X))) / len(X))**0.5 for j in range(n_feat)]
    return [[(X[i][j]-means[j]) / stds[j] for j in range(n_feat)] for i in range(len(X))], means, stds

def standardize_y(y):
    m = sum(y) / len(y)
    s = (sum((v-m)**2 for v in y) / len(y))**0.5
    return [(v-m)/s for v in y], m, s

X_sc, x_means, x_stds = standardize_X(X_m)
y_sc, y_mean, y_std   = standardize_y(y_m)

# Multi-feature gradient descent
weights = [0.0, 0.0, 0.0]
bias    = 0.0
lr      = 0.01

def predict_multi(X, w, b):
    return [sum(xi*wi for xi, wi in zip(x, w)) + b for x in X]

for epoch in range(1000):
    preds  = predict_multi(X_sc, weights, bias)
    errors = [p - a for p, a in zip(preds, y_sc)]
    n      = len(y_sc)
    grads  = [(2/n) * sum(errors[i] * X_sc[i][j] for i in range(n)) for j in range(3)]
    grad_b = (2/n) * sum(errors)
    weights = [w - lr*g for w, g in zip(weights, grads)]
    bias   -= lr * grad_b
    if epoch % 200 == 0:
        cost = sum(e**2 for e in errors) / n
        print(f"  epoch {epoch} | cost={cost:.4f}")

def r2_multi(X, y, w, b):
    preds  = predict_multi(X, w, b)
    y_mean = sum(y) / len(y)
    ss_res = sum((a-p)**2 for a, p in zip(y, preds))
    ss_tot = sum((a-y_mean)**2 for a in y)
    return 1 - ss_res / ss_tot

print(f"\\nWeights (standardized): {[round(w,4) for w in weights]}")
print(f"  size: {weights[0]:.4f}  bedrooms: {weights[1]:.4f}  age: {weights[2]:.4f}")
print(f"  Interpretation: size has strongest positive effect, age has negative effect")
print(f"R²: {r2_multi(X_sc, y_sc, weights, bias):.4f}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              prompt: 'Implement Ridge regression (L2 regularization). Start from the multiple regression setup above. Add a regularization term lambda * sum(w_i^2) to the cost. The gradient for each weight gains an extra +2*lambda*w_i term. Train with lambda=0.0 (no regularization) and lambda=0.5 (strong regularization). Print the weights for both. Ridge weights should be smaller (shrunk toward zero).',
              starterCode: `import random

random.seed(42)
N = 100

X_r, y_r = [], []
for _ in range(N):
    size     = random.uniform(500, 3000)
    bedrooms = random.randint(1, 5)
    age      = random.uniform(0, 50)
    price    = 50*size + 10000*bedrooms - 1000*age + 50000 + random.gauss(0, 20000)
    X_r.append([size, bedrooms, age])
    y_r.append(price)

def standardize_X(X):
    n_feat = len(X[0])
    means = [sum(X[i][j] for i in range(len(X))) / len(X) for j in range(n_feat)]
    stds  = [(sum((X[i][j]-means[j])**2 for i in range(len(X))) / len(X))**0.5 for j in range(n_feat)]
    return [[(X[i][j]-means[j]) / stds[j] for j in range(n_feat)] for i in range(len(X))]

def standardize_y(y):
    m = sum(y) / len(y)
    s = (sum((v-m)**2 for v in y) / len(y))**0.5
    return [(v-m)/s for v in y]

X_sc = standardize_X(X_r)
y_sc = standardize_y(y_r)

def train_ridge(X, y, lam, lr=0.01, epochs=1000):
    w = [0.0] * len(X[0])
    b = 0.0
    n = len(y)
    for epoch in range(epochs):
        preds  = [sum(xi*wi for xi, wi in zip(x, w)) + b for x in X]
        errors = [p - a for p, a in zip(preds, y)]
        # TODO: compute gradient for each weight (MSE gradient + ridge penalty gradient)
        # grad_j = (2/n) * sum(errors[i] * X[i][j] for ...) + 2 * lam * w[j]
        # Then update w and b
        pass
    return w, b

# TODO: train with lam=0.0 and lam=0.5, print and compare weights
`,
              hint: 'The only change from plain gradient descent is adding 2*lam*w[j] to the gradient for each weight j. Bias is NOT regularized (do not add the penalty to grad_b). The weights with lam=0.5 should have smaller absolute values than lam=0.0.',
              testCode: `try:
    w0, b0 = train_ridge(X_sc, y_sc, lam=0.0)
    w5, b5 = train_ridge(X_sc, y_sc, lam=0.5)
    assert w0 is not None and w5 is not None, "train_ridge should return weights"
    assert len(w0) == 3 and len(w5) == 3
    norm0 = sum(w**2 for w in w0)**0.5
    norm5 = sum(w**2 for w in w5)**0.5
    assert norm5 < norm0, f"Ridge weights (norm={norm5:.4f}) should be smaller than plain weights (norm={norm0:.4f})"
    print(f"PASS: Ridge regularization works")
    print(f"  lam=0.0 weights: {[round(w,4) for w in w0]}  (norm={norm0:.4f})")
    print(f"  lam=0.5 weights: {[round(w,4) for w in w5]}  (norm={norm5:.4f})")
    print(f"  Ridge shrinks weights toward zero by {(1 - norm5/norm0)*100:.1f}%")
except AssertionError as e:
    print(f"FAIL: {e}")`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: 'What does the learning rate control in gradient descent?',
      options: [
        'The number of features used by the model',
        'How many epochs the model trains for',
        'The size of each parameter update step',
        'The ratio of training to test data',
      ],
      answer: 'The size of each parameter update step',
      hints: [
        'The learning rate scales the gradient before subtracting it from the parameters',
        'Too large causes divergence (overshooting the minimum), too small causes very slow convergence',
      ],
      reviewSection: 'Gradient Descent',
    },
    {
      type: 'choice',
      question: 'What does R² = 0 mean for a regression model?',
      options: [
        'The model makes perfect predictions',
        'The model is no better than always predicting the mean of the target',
        'The model has negative error',
        'The model has not been trained yet',
      ],
      answer: 'The model is no better than always predicting the mean of the target',
      hints: [
        'R² = 1 − SS_res/SS_tot. When R² = 0, SS_res = SS_tot — residuals equal total variance',
        'A model that always predicts the mean has SS_res = SS_tot and R² = 0',
      ],
      reviewSection: 'R-Squared Score',
    },
    {
      type: 'choice',
      question: 'Why is feature scaling important for gradient descent in multiple linear regression?',
      options: [
        'It makes the model more interpretable',
        'It prevents the cost surface from being elongated, allowing faster convergence',
        'It reduces the number of features needed',
        'It guarantees the model will find the global minimum',
      ],
      answer: 'It prevents the cost surface from being elongated, allowing faster convergence',
      hints: [
        'When features have very different scales, one gradient dimension is much larger than others',
        'Standardizing features makes the cost surface more spherical — gradient descent heads straight to the minimum',
      ],
      reviewSection: 'Feature Scaling',
    },
    {
      type: 'choice',
      question: 'The normal equation gives optimal weights directly. Why would you prefer gradient descent for a problem with 100,000 features?',
      options: [
        'Gradient descent always gives more accurate results',
        'The normal equation does not work for linear regression',
        'Matrix inversion in the normal equation is O(n³) in features — too slow for large feature counts',
        'Gradient descent requires less memory than storing the data',
      ],
      answer: 'Matrix inversion in the normal equation is O(n³) in features — too slow for large feature counts',
      hints: [
        'The normal equation must invert XᵀX which is a d×d matrix (d = number of features)',
        'O(d³) = O((100,000)³) = 10¹⁵ operations — gradient descent takes O(n·d) per epoch instead',
      ],
      reviewSection: 'Normal Equation',
    },
    {
      type: 'choice',
      question: 'A degree-10 polynomial regression model achieves R² = 1.0 on 10 training points but R² = 0.3 on a held-out test set. What is the most appropriate fix?',
      options: [
        'Increase the polynomial degree to 20 for even better training fit',
        'Reduce polynomial degree or add Ridge regularization to penalize large weights',
        'Collect less training data so the model cannot memorize',
        'Remove the test set and report training R² only',
      ],
      answer: 'Reduce polynomial degree or add Ridge regularization to penalize large weights',
      hints: [
        'R² = 1.0 training with R² = 0.3 test is a textbook overfitting signature',
        'A degree-10 polynomial has enough parameters to pass through every training point exactly — including the noise',
      ],
      reviewSection: 'Polynomial Regression and Overfitting',
    },
  ],
}
