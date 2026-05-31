export default {
  id: 'ae-p1-18-convex-optimization',
  slug: 'convex-optimization',
  chapter: 'ae-p1',
  order: 17,
  title: 'Convex Optimization',
  subtitle: 'Convex problems have one valley. Neural networks have millions. Knowing the difference matters.',
  tags: ['convex-optimization', 'Newton-method', 'Lagrange-multipliers', 'KKT', 'duality', 'regularization', 'Hessian', 'gradient-descent'],

  hook: {
    question: 'Gradient descent on a convex function always finds the global minimum. On a neural network, it might not. What makes logistic regression convex but a 2-layer network non-convex?',
    realWorldContext:
      'Lesson 08 taught gradient descent, momentum, and Adam. Those optimizers walk downhill on any surface — no guarantees. But many ML problems are convex: linear regression, logistic regression, SVMs, LASSO, ridge regression. For these, something stronger exists: every local minimum IS the global minimum. No restarts, no learning rate annealing, no luck. Understanding convexity explains WHY regularization works (it is a constrained optimization problem with a specific geometry), why SVMs use dual formulations (to enable kernel tricks), and why deep learning finds good solutions despite violating every nice property convexity gives you.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A set S is convex if for any two points x, y ∈ S and any t ∈ [0,1], the point tx + (1−t)y also lies in S. In plain terms: the line segment between any two points in the set stays inside the set. A circle: convex. A donut: not convex (the line from one inner edge to the other passes through the hole). A function f is convex if its domain is convex and for any x, y: f(tx + (1−t)y) ≤ t·f(x) + (1−t)·f(y). Geometrically: the chord between any two points on the graph lies above or on the graph. A bowl shape. The single most important consequence: for a convex function, every local minimum is the global minimum. Gradient descent cannot get trapped.',
      'Three tests for convexity. Test 1 (1D, second derivative): if f\'\'(x) ≥ 0 for all x, the function is convex. f(x) = x²: f\'\'= 2 ≥ 0, convex. f(x) = x³: f\'\'= 6x < 0 for x < 0, not convex. f(x) = eˣ: f\'\'= eˣ > 0, convex. Test 2 (multivariate, Hessian): if the Hessian matrix H (matrix of all second partial derivatives, H[i][j] = ∂²f/∂xᵢ∂xⱼ) is positive semi-definite everywhere (all eigenvalues ≥ 0), the function is convex. Test 3 (definition): check f(tx+(1−t)y) ≤ t·f(x) + (1−t)·f(y) directly — useful when derivatives are hard to compute.',
      'Which ML problems are convex? Linear regression (MSE loss is quadratic in weights: convex). Logistic regression (log-loss is convex in weights: convex). SVMs with hinge loss (maximum of linear functions: convex). LASSO and ridge regression (sum of convex functions: convex). Neural networks with any loss: NOT convex. Nonlinear activations (sigmoid, ReLU, tanh) applied to weight products create non-convex landscapes. k-means: not convex (discrete assignment step). Matrix factorization: not convex (product of unknowns). The pattern: linear models with convex losses are convex. Add hidden layers → non-convex.',
      'The Hessian matrix H of f: ℝⁿ → ℝ is the n×n matrix of all second partial derivatives. H[i][j] = ∂²f/∂xᵢ∂xⱼ. Example: f(x,y) = 5x² + xy + y², H = [[10, 1], [1, 2]]. The Hessian encodes curvature: all eigenvalues positive → function curves upward in every direction (convex at that point). All eigenvalues negative → curves downward (concave, local maximum). Mixed signs → saddle point. Zero eigenvalue → flat direction. For global convexity, H must be positive semi-definite EVERYWHERE, not just at one point.',
      'Newton\'s method: gradient descent uses first-order information (gradient). Newton\'s method uses second-order information (Hessian). It fits a local quadratic approximation and jumps directly to its minimum: x_new = x − H⁻¹·∇f. Compare to gradient descent: x_new = x − α·∇f. Newton replaces the scalar learning rate α with H⁻¹, automatically adjusting step size and direction based on curvature. For a quadratic function, Newton converges in exactly 1 step. Near a minimum, convergence is quadratic — error squares each iteration. Main drawback: computing and inverting H costs O(n²) memory and O(n³) operations. For a 1M-parameter neural network, H has 10¹² entries — completely impractical.',
      'Constrained optimization: minimize f(x) subject to g(x) = 0. The method of Lagrange multipliers converts this to an unconstrained problem: minimize L(x, λ) = f(x) + λ·g(x). At the solution, ∇L = 0: (1) ∂f/∂x + λ·∂g/∂x = 0; (2) g(x) = 0. Geometric intuition: at the constrained minimum, ∇f must be parallel to ∇g. If they were not parallel, you could move along the constraint surface (keeping g(x) = 0) while decreasing f further — contradicting optimality. Example: minimize x² + y² subject to x + y = 1. The closest point on the line to the origin is (0.5, 0.5) — gradient of f = [1, 1] and gradient of g = [1, 1] are parallel.',
      'KKT conditions extend Lagrange multipliers to inequality constraints: minimize f(x) subject to gᵢ(x) ≤ 0. Four conditions at the optimum: (1) Stationarity: ∇f + Σλᵢ·∇gᵢ = 0; (2) Primal feasibility: gᵢ(x) ≤ 0; (3) Dual feasibility: λᵢ ≥ 0; (4) Complementary slackness: λᵢ·gᵢ(x) = 0. Complementary slackness is the key insight: either the constraint is active (gᵢ = 0, solution sits on the boundary, λᵢ can be nonzero) or the multiplier is zero (λᵢ = 0, constraint doesn\'t matter). SVMs: support vectors are the data points where the margin constraint is active (λᵢ > 0). All other points have λᵢ = 0 and don\'t affect the decision boundary.',
      'Regularization as constrained optimization. L2 (ridge): minimize Loss(w) subject to ‖w‖² ≤ t. The constraint ‖w‖² ≤ t defines a sphere. The solution is where loss contours first touch this sphere. Since a sphere has no flat edges, this almost never happens at an axis — all weights are small but nonzero. L1 (LASSO): minimize Loss(w) subject to ‖w‖₁ ≤ t. The constraint ‖w‖₁ ≤ t defines a diamond. The diamond has corners aligned with the axes. Loss contours are more likely to touch a corner → one or more weights exactly zero → sparsity. The λ parameter in λ·‖w‖² or λ·‖w‖₁ is the Lagrange multiplier. Each value of λ corresponds to a different constraint radius t. This is not an analogy — it is exactly the same problem in two different forms.',
      'Why SGD works on non-convex neural networks. In high-dimensional parameter spaces (n = millions), random critical points where ∇f = 0 are overwhelmingly saddle points, not local minima. A saddle point in n dimensions requires the Hessian to have all positive eigenvalues — with n = 10⁶ random eigenvalues, this probability is 2⁻ⁿ ≈ 10⁻³⁰⁰⁰⁰⁰. The few local minima that exist tend to have loss values close to the global minimum (empirical observation). Overparameterization smooths the landscape: more parameters than data creates a more connected loss surface with fewer bad minima. SGD\'s stochastic noise helps escape saddle points and biases toward flat minima — and flat minima generalize better.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Regularization and Lagrange multipliers are the same thing',
        body: 'Ridge regression: minimize ‖Xw − y‖² + λ‖w‖²\nThis is IDENTICAL to: minimize ‖Xw − y‖² subject to ‖w‖² ≤ t\n\nThe two formulations are related by the Lagrangian. Each value of λ corresponds to a specific constraint radius t via the KKT conditions. When you tune λ via cross-validation, you are selecting which constraint sphere to optimize on. Understanding this explains: why λ → 0 gives OLS (no constraint), why λ → ∞ forces w → 0 (infinitely tight constraint), and why the constraint geometry (circle vs diamond) determines whether you get dense or sparse solutions.',
      },
      {
        type: 'insight',
        title: 'Newton\'s method is impractical for deep learning — here\'s what comes close',
        body: 'Newton\'s method: exact curvature, 1 step for quadratics, O(n³) per step. Completely impractical at n = 10⁶ weights.\n\nL-BFGS: approximates the inverse Hessian using the last m gradient differences. O(mn) memory. Works well up to n ≈ 10,000. Used for logistic regression and small-scale problems.\n\nAdam: first moment = gradient (direction). Second moment = gradient squared (diagonal curvature approximation). No matrix inversion, O(n) memory. The "poor man\'s Newton" — captures curvature per-coordinate without the full Hessian.',
      },
      {
        type: 'procedure',
        title: 'Diagnosing convexity vs non-convexity in your ML problem',
        steps: [
          'Write down the loss as a function of the model parameters',
          'If parameters enter only as w^T x or X @ w (linear): likely convex',
          'If parameters appear as products (W₁ · W₂) or through nonlinear activations: non-convex',
          'Compute the Hessian (or approximate it numerically) and check eigenvalue signs',
          'If convex: use L-BFGS or dedicated solvers (scipy.optimize, CVXPY)',
          'If non-convex: use Adam with learning rate warmup/decay; accept good local minima',
        ],
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        type: 'PythonNotebook',
        cells: [
          {
            id: 1,
            prose: [
              'Test convexity two ways: (1) the second derivative test for 1D functions, and (2) empirical sampling of the definition for any function.',
              'The empirical test checks f(tx + (1−t)y) ≤ t·f(x) + (1−t)·f(y) for many random pairs of points and random t. If ANY pair violates the inequality, the function is not convex.',
              'Watch how x² and eˣ pass the test, x³ and sin(x) fail it, and see exactly where the violation occurs.',
            ],
            code: `import math
import random

random.seed(42)

def check_convexity_1d(f, lo=-5, hi=5, n=2000):
    """Sample n pairs of points and check the convexity definition."""
    max_violation = 0.0
    worst_pair = None
    for _ in range(n):
        x = random.uniform(lo, hi)
        y = random.uniform(lo, hi)
        t = random.uniform(0, 1)
        mid = t*x + (1-t)*y
        lhs = f(mid)
        rhs = t*f(x) + (1-t)*f(y)
        violation = lhs - rhs
        if violation > max_violation:
            max_violation = violation
            worst_pair = (x, y, t)
    return max_violation < 1e-9, max_violation, worst_pair

def f_x2(x):   return x**2
def f_x3(x):   return x**3
def f_exp(x):  return math.exp(x)
def f_abs(x):  return abs(x)
def f_sin(x):  return math.sin(x)

print(f"{'Function':<14} {'Convex?':>8}  {'Max violation':>14}  Note")
print("-" * 60)
for name, f in [("f(x) = x²", f_x2), ("f(x) = x³", f_x3),
                ("f(x) = eˣ", f_exp), ("f(x) = |x|", f_abs),
                ("f(x) = sin(x)", f_sin)]:
    convex, mv, wp = check_convexity_1d(f)
    note = "convex" if convex else f"violates at x={wp[0]:.2f},y={wp[1]:.2f},t={wp[2]:.2f}"
    print(f"{name:<14} {str(convex):>8}  {mv:>14.4e}  {note}")`,
          },
          {
            id: 2,
            prose: [
              'Newton\'s method vs gradient descent: a head-to-head convergence race on the same function.',
              'Function: f(x, y) = 50x² + y². This is an elongated bowl — the eigenvalues of the Hessian are [100, 2], condition number = 50. Gradient descent struggles with high condition numbers because the gradient points toward the steep wall, not toward the bottom.',
              'Newton\'s method uses H⁻¹·∇f to correct for the different curvatures in each direction. For a quadratic, it converges in exactly 1 step.',
            ],
            code: `import math

def f(x, y):
    return 50 * x**2 + y**2

def grad_f(x, y):
    return [100 * x, 2 * y]    # gradient: [df/dx, df/dy]

def hessian_inv(x, y):
    # Hessian = [[100, 0], [0, 2]], inverse = [[1/100, 0], [0, 1/2]]
    return [[1/100, 0], [0, 1/2]]

def gradient_descent(x0, y0, lr=0.009, max_steps=500, tol=1e-10):
    x, y = x0, y0
    for step in range(max_steps):
        g = grad_f(x, y)
        loss = f(x, y)
        if loss < tol:
            return step, x, y
        x -= lr * g[0]
        y -= lr * g[1]
    return max_steps, x, y

def newtons_method(x0, y0, max_steps=10, tol=1e-10):
    x, y = x0, y0
    for step in range(max_steps):
        loss = f(x, y)
        if loss < tol:
            return step, x, y
        g = grad_f(x, y)
        H_inv = hessian_inv(x, y)
        # x_new = x - H^{-1} * grad
        x -= H_inv[0][0] * g[0] + H_inv[0][1] * g[1]
        y -= H_inv[1][0] * g[0] + H_inv[1][1] * g[1]
    return max_steps, x, y

x0, y0 = 10.0, 10.0
print(f"Starting point: ({x0}, {y0}),  f = {f(x0, y0):.1f}")
print(f"Hessian eigenvalues: 100 and 2  (condition number = 50)")
print()

gd_steps, gd_x, gd_y = gradient_descent(x0, y0)
nt_steps, nt_x, nt_y = newtons_method(x0, y0)

print(f"Gradient descent: {gd_steps} steps to reach f < 1e-10")
print(f"Newton's method:  {nt_steps} step(s) to reach f < 1e-10")
print()
print(f"GD  final: x={gd_x:.6f}, y={gd_y:.6f}, f={f(gd_x, gd_y):.2e}")
print(f"NT  final: x={nt_x:.6f}, y={nt_y:.6f}, f={f(nt_x, nt_y):.2e}")
print()
print("Newton's method is exact for quadratics: 1 step regardless of scale.")
print("GD with lr=0.009 takes hundreds of steps due to the elongated valley.")`,
          },
          {
            id: 3,
            prose: [
              'Regularization as constrained optimization: see the geometry that explains why L1 produces sparse solutions and L2 does not.',
              'The unconstrained minimizer of (w₁ − 3)² + (w₂ − 2)² is (3, 2). Adding constraints forces the solution toward the origin.',
              'L2 constraint ‖w‖² ≤ t is a circle. The solution is where the loss contour first touches the circle — which almost never lands on an axis. L1 constraint ‖w‖₁ ≤ t is a diamond. Its corners sit on the axes. Loss contours touch corners first → sparse solution.',
            ],
            code: `import math

def unconstrained_loss(w1, w2):
    return (w1 - 3)**2 + (w2 - 2)**2

def project_l2_ball(w1, w2, radius):
    """Project onto L2 ball: if ||w|| > radius, scale down."""
    norm = math.sqrt(w1**2 + w2**2)
    if norm <= radius:
        return w1, w2
    return w1 * radius / norm, w2 * radius / norm

def project_l1_ball(w1, w2, radius):
    """Project onto L1 ball using soft-thresholding."""
    if abs(w1) + abs(w2) <= radius:
        return w1, w2
    # Soft-threshold: find threshold t such that clamp(|wi| - t, 0) sums to radius
    vals = sorted([abs(w1), abs(w2)], reverse=True)
    cumsum = 0
    t = 0
    for i, v in enumerate(vals):
        cumsum += v
        t_candidate = (cumsum - radius) / (i + 1)
        if t_candidate >= (vals[i+1] if i+1 < len(vals) else 0):
            t = t_candidate
            break
    return (abs(w1) - t if abs(w1) > t else 0) * (1 if w1 > 0 else -1), \
           (abs(w2) - t if abs(w2) > t else 0) * (1 if w2 > 0 else -1)

def projected_gradient(w0, radius, project_fn, lr=0.05, steps=500):
    w1, w2 = w0
    for _ in range(steps):
        g1 = 2*(w1 - 3)
        g2 = 2*(w2 - 2)
        w1 -= lr * g1
        w2 -= lr * g2
        w1, w2 = project_fn(w1, w2, radius)
    return w1, w2

radius = 1.0
w0 = (0.0, 0.0)

w1_l2, w2_l2 = projected_gradient(w0, radius, project_l2_ball)
w1_l1, w2_l1 = projected_gradient(w0, radius, project_l1_ball)

print(f"Unconstrained minimum:       (3.0000, 2.0000)")
print(f"L2 constraint (radius={radius}):  ({w1_l2:.4f}, {w2_l2:.4f})")
print(f"L1 constraint (radius={radius}):  ({w1_l1:.4f}, {w2_l1:.4f})")
print()
print(f"L2 solution: both weights nonzero ({w1_l2:.4f}, {w2_l2:.4f})")
w2_zero = abs(w2_l1) < 1e-4
print(f"L1 solution: w2 ≈ 0? {w2_zero}  — sparsity from the diamond corner!")
print()
print("Geometry: L2 ball is a circle (no corners). Loss contours touch it")
print("at a point on the smooth boundary — both weights are nonzero.")
print("L1 ball is a diamond. Its axis-aligned corners attract the solution")
print("first, zeroing out smaller weights.")`,
          },
          {
            id: 'c1',
            challengeType: 'write',
            prompt: 'Implement the empirical convexity test for a 2D function f(x, y). Use it to verify that (a) f(x,y) = x² + y² is convex and (b) f(x,y) = sin(x) + cos(y) is NOT convex. Then compute the Hessian of f(x,y) = 3x² + 2xy + y² analytically and verify it is positive definite (both eigenvalues positive).',
            starterCode: `import math
import random

random.seed(55)

def check_convexity_2d(f, n_samples=1000, lo=-3, hi=3):
    """
    Returns (is_convex: bool, max_violation: float).
    Sample n_samples pairs of 2D points (x1,y1) and (x2,y2) and random t in [0,1].
    Check f(t*(x1,y1) + (1-t)*(x2,y2)) <= t*f(x1,y1) + (1-t)*f(x2,y2).
    """
    max_violation = 0.0
    # TODO: implement the convexity check
    return max_violation < 1e-9, max_violation

def f_circle(x, y):   return x**2 + y**2
def f_sincos(x, y):   return math.sin(x) + math.cos(y)

# Test both functions
for name, f in [("x² + y²", f_circle), ("sin(x)+cos(y)", f_sincos)]:
    convex, mv = check_convexity_2d(f)
    print(f"{name:<18}: convex={convex}  max_violation={mv:.4e}")

# Hessian of f(x,y) = 3x² + 2xy + y²
# H = [[d²f/dx², d²f/dxdy], [d²f/dydx, d²f/dy²]]
# TODO: compute H analytically (constant for this quadratic)
# Then compute eigenvalues of H:
# For 2x2 [[a,b],[b,d]]: eigenvalues = ((a+d) ± sqrt((a-d)²+4b²)) / 2
# Print eigenvalues and state whether H is positive definite
`,
            hint: 'For the 2D convexity test: generate (x1,y1) and (x2,y2) with random.uniform(lo,hi) for each component. Compute mid_x = t*x1+(1-t)*x2 and similar for y. The violation is f(mid_x,mid_y) - (t*f(x1,y1) + (1-t)*f(x2,y2)). Hessian of 3x²+2xy+y²: d²f/dx²=6, d²f/dxdy=2, d²f/dy²=2.',
            testCode: `try:
    convex_circle, _ = check_convexity_2d(f_circle)
    convex_sincos, mv_sincos = check_convexity_2d(f_sincos)
    assert convex_circle, "x²+y² should be convex"
    assert not convex_sincos, "sin(x)+cos(y) should NOT be convex"
    print("PASS: convexity tests correct")
    print(f"  x²+y² is convex: {convex_circle}")
    print(f"  sin(x)+cos(y) is not convex (max violation: {mv_sincos:.4e})")
except AssertionError as e:
    print(f"FAIL: {e}")`,
          },
        ],
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: 'What is the defining property of a convex function?',
      options: [
        'It has exactly one critical point',
        'The line segment between any two points on its graph lies above or on the graph',
        'Its derivative is always positive',
        'It can only be defined on positive real numbers',
      ],
      answer: 'The line segment between any two points on its graph lies above or on the graph',
      hints: [
        'Formal definition: f(tx + (1−t)y) ≤ t·f(x) + (1−t)·f(y) for all x, y and t ∈ [0,1]',
        'For 1D functions, a positive second derivative is an equivalent test: f\'\'(x) ≥ 0',
      ],
      reviewSection: 'Convex Functions',
    },
    {
      type: 'choice',
      question: 'Which of these ML problems has a convex loss landscape?',
      options: [
        'Training a 3-layer neural network with ReLU activations',
        'Logistic regression with cross-entropy loss',
        'k-means clustering',
        'Matrix factorization for recommendation',
      ],
      answer: 'Logistic regression with cross-entropy loss',
      hints: [
        'Linear models with convex losses are convex. Log-loss (cross-entropy) is convex in the weights',
        'Any model where weights appear as products (W₁·W₂) or through nonlinear activations is non-convex',
      ],
      reviewSection: 'Convex vs Non-Convex in ML',
    },
    {
      type: 'choice',
      question: 'Newton\'s method converges to the minimum of f(x) = 5x² + 3x + 1 in how many steps?',
      options: [
        '1 step (it is exact for quadratic functions)',
        'About 10 steps',
        'About 100 steps',
        'It depends on the learning rate',
      ],
      answer: '1 step (it is exact for quadratic functions)',
      hints: [
        'Newton\'s method fits a local quadratic approximation — for an actual quadratic, that approximation is exact',
        'x_new = x − H⁻¹·∇f jumps directly to the minimum of the local quadratic in one step',
      ],
      reviewSection: 'Newton\'s Method',
    },
    {
      type: 'choice',
      question: 'In the KKT conditions, what does complementary slackness (λᵢ · gᵢ(x) = 0) mean?',
      options: [
        'All constraints must be active at the optimum',
        'Either a constraint is active (gᵢ = 0) or its multiplier is zero (λᵢ = 0) — an inactive constraint has no effect',
        'The gradients of all constraints must be orthogonal',
        'The Lagrangian is always zero at the optimum',
      ],
      answer: 'Either a constraint is active (gᵢ = 0) or its multiplier is zero (λᵢ = 0) — an inactive constraint has no effect',
      hints: [
        'If a constraint is not binding (gᵢ(x) < 0), the solution is in the interior — the constraint plays no role → λᵢ = 0',
        'In SVMs, support vectors are the points where the margin constraint is binding (λᵢ > 0). All other points have λᵢ = 0',
      ],
      reviewSection: 'KKT Conditions',
    },
    {
      type: 'choice',
      question: 'Why does SGD find good solutions in non-convex neural network landscapes despite the lack of convexity guarantees?',
      options: [
        'Neural networks are secretly convex in high dimensions',
        'SGD always finds the global minimum',
        'In high dimensions, most critical points are saddle points (not bad local minima), and SGD noise helps escape them',
        'The loss function is irrelevant to model performance',
      ],
      answer: 'In high dimensions, most critical points are saddle points (not bad local minima), and SGD noise helps escape them',
      hints: [
        'A local minimum requires ALL n Hessian eigenvalues to be positive — with n = 10⁶, the probability is ≈ 2⁻ⁿ',
        'Most critical points are saddle points; the few local minima tend to have near-optimal loss values',
      ],
      reviewSection: 'Why Deep Learning Works Despite Non-Convexity',
    },
  ],
}
