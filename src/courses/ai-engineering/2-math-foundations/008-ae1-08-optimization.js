export default {
  id: 'ae-p1-08-optimization',
  slug: 'optimization',
  chapter: 'ae-p1',
  order: 7,
  title: 'Optimization: GD, Momentum, and Adam',
  subtitle: 'Training a neural network is one loop: compute gradient, update weights, repeat.',
  tags: ['optimization', 'gradient-descent', 'SGD', 'momentum', 'adam', 'learning-rate', 'loss-surface', 'convergence'],

  hook: {
    question: 'Why does Adam converge so much faster than plain gradient descent?',
    realWorldContext:
      "Every time you train a model, one algorithm decides how weights change: the optimizer. Gradient descent is the core idea. But the Rosenbrock function (f(x,y) = (1-x)² + 100(y-x²)²) is a famous test case — a curved valley that pure GD struggles with, bouncing sideways thousands of times. Momentum fixes this by accumulating velocity. Adam fixes everything by adapting the learning rate per parameter. Understanding optimizers explains why some models train in hours and others in weeks, why your loss sometimes plateaus, and why choosing the wrong learning rate causes divergence.",
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Gradient descent works by computing the gradient ∇L(θ) — a vector pointing in the direction of steepest increase — and stepping in the opposite direction: θ ← θ - α∇L. The learning rate α controls step size. Too large: overshoots, diverges. Too small: takes forever. The loss surface in high dimensions is neither a bowl nor a cliff — it is full of saddle points, flat regions, and curved valleys.',
      'SGD with Momentum keeps a running average of past gradients (velocity) and adds it to the current step. This damps oscillations across the valley and accelerates along the valley floor. Adam goes further: it maintains both a running mean of gradients (first moment, like momentum) and a running mean of squared gradients (second moment, variance). It normalizes the step by the second moment, effectively setting a per-parameter adaptive learning rate. Parameters with consistent large gradients (important features) get smaller steps; parameters with rare or noisy gradients get larger steps.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Adam: the default optimizer for good reason',
        body: 'Adam update: θ ← θ - α × m̂_t / (√v̂_t + ε). m̂_t = bias-corrected running mean of gradients. v̂_t = bias-corrected running mean of squared gradients. Effect: if a gradient keeps pointing the same direction (clear signal), the step stays the same. If it oscillates (noisy), the effective step shrinks. Adam is robust to poorly-tuned learning rates and rarely needs tuning beyond lr=0.001.',
      },
      {
        type: 'insight',
        title: 'Saddle points — not local minima — are the main obstacle in deep learning',
        body: 'A saddle point is a place where ∇L = 0 but it is not a minimum (it goes down in some directions and up in others). In high dimensions, almost all critical points are saddles, not local minima. Pure GD with near-zero gradient stalls. Momentum escapes sideways because velocity carries the optimizer past the flat region. This is why momentum dramatically speeds up training in practice.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Optimization from Scratch',
        mathBridge: 'GD: θ ← θ - α∇L. Momentum: v ← βv + ∇L, θ ← θ - αv. Adam: m ← β₁m + (1-β₁)∇L, v ← β₂v + (1-β₂)∇L², θ ← θ - α·m̂/√(v̂+ε)',
        caption: 'Implement and compare three optimizers on the Rosenbrock function.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Gradient descent from scratch',
              prose: [
                '## The Rosenbrock Function',
                'f(x,y) = (1-x)² + 100(y-x²)² — a banana-shaped valley. Minimum at (1,1) where f=0.',
                '```\n∂f/∂x = -2(1-x) + 200(y-x²)(-2x)\n∂f/∂y = 200(y-x²)\n```',
                'Starting from (-1, 1): the function value is 4. Getting to (1,1) requires navigating a curved, steep-sided trench.',
                '## Plain Gradient Descent',
                '```\nθ ← θ - α × ∇f(θ)\n```',
                'α (learning rate) is the only hyperparameter. Too large → diverge. Too small → millions of steps.',
              ],
              code: `import math

def rosenbrock(x, y):
    """The banana function: minimum at (1,1), f=0."""
    return (1 - x)**2 + 100 * (y - x**2)**2

def rosenbrock_grad(x, y):
    """Returns (df/dx, df/dy)."""
    df_dx = -2*(1 - x) + 200*(y - x**2)*(-2*x)
    df_dy = 200*(y - x**2)
    return df_dx, df_dy

def gradient_descent(lr, steps=5000, start=(-1.0, 1.0)):
    x, y = start
    for step in range(steps):
        gx, gy = rosenbrock_grad(x, y)
        x = x - lr * gx
        y = y - lr * gy
        if math.isnan(x) or abs(x) > 1e10:
            return step, None, None, float('inf')
    return steps, x, y, rosenbrock(x, y)

print("Starting point: (-1, 1),  f = 4.0")
print("Target: (1, 1),  f = 0.0\\n")
print(f"{'lr':>8}  {'final x':>10}  {'final y':>10}  {'loss':>14}")
print("-" * 46)
for lr in [0.0001, 0.0005, 0.001, 0.005]:
    steps, x, y, loss = gradient_descent(lr)
    if loss == float('inf') or math.isnan(loss) if loss != float('inf') else False:
        print(f"{lr:>8.4f}  {'diverged':>10}  {'':>10}  {'inf':>14}")
    else:
        print(f"{lr:>8.4f}  {x:>10.6f}  {y:>10.6f}  {loss:>14.8f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'SGD with Momentum',
              prose: [
                '## Momentum: Accumulate Velocity',
                '```\nv_t = β × v_{t-1} + ∇L(θ_t)     ← running average of gradients\nθ_{t+1} = θ_t - α × v_t\n```',
                'β = 0.9 means 90% of the previous velocity is carried forward. In a curved valley, gradients across the valley cancel out (opposite signs) while gradients along the valley add up. Result: damps oscillations, accelerates along the descent direction.',
                '**Typical values**: β = 0.9 (standard), β = 0.99 (stronger smoothing). β = 0.0 is plain GD.',
              ],
              code: `import math

def rosenbrock(x, y):
    return (1 - x)**2 + 100 * (y - x**2)**2

def rosenbrock_grad(x, y):
    df_dx = -2*(1 - x) + 200*(y - x**2)*(-2*x)
    df_dy = 200*(y - x**2)
    return df_dx, df_dy

def sgd_momentum(lr, beta, steps=5000, start=(-1.0, 1.0)):
    x, y = start
    vx, vy = 0.0, 0.0  # velocity starts at zero
    for _ in range(steps):
        gx, gy = rosenbrock_grad(x, y)
        vx = beta * vx + gx  # accumulate gradient into velocity
        vy = beta * vy + gy
        x = x - lr * vx
        y = y - lr * vy
        if math.isnan(x) or abs(x) > 1e10:
            return float('inf')
    return rosenbrock(x, y)

print("SGD+Momentum on Rosenbrock (lr=0.0001, 5000 steps):")
print(f"{'beta':>6}  {'final loss':>14}")
print("-" * 24)
for beta in [0.0, 0.5, 0.9, 0.99]:
    loss = sgd_momentum(lr=0.0001, beta=beta)
    diverged = math.isinf(loss) or math.isnan(loss)
    if diverged:
        print(f"{beta:>6.2f}  {'diverged':>14}")
    else:
        print(f"{beta:>6.2f}  {loss:>14.6f}")

# Full run comparison: GD vs Momentum
def gd_final(lr, steps=5000):
    x, y = -1.0, 1.0
    for _ in range(steps):
        gx, gy = rosenbrock_grad(x, y)
        x -= lr * gx
        y -= lr * gy
        if math.isnan(x): return float('inf')
    return rosenbrock(x, y)

print("\\nComparison at lr=0.001, 5000 steps:")
print(f"  GD:             loss = {gd_final(0.001):.6f}")
print(f"  GD+Momentum:    loss = {sgd_momentum(0.001, 0.9):.6f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Adam optimizer from scratch',
              prose: [
                '## Adam: Adaptive Moment Estimation',
                '```\nm_t = β₁ × m_{t-1} + (1-β₁) × ∇L     ← first moment (mean of gradient)\nv_t = β₂ × v_{t-1} + (1-β₂) × ∇L²    ← second moment (mean of gradient²)\n\nm̂_t = m_t / (1 - β₁ᵗ)                 ← bias correction\nv̂_t = v_t / (1 - β₂ᵗ)                 ← bias correction\n\nθ ← θ - α × m̂_t / (√v̂_t + ε)\n```',
                '**Bias correction**: at step t=1, m_t = (1-β₁)∇L is tiny because it started at 0. Dividing by (1-β₁ᵗ) corrects for this cold-start bias. Without it, the first few steps are artificially small.',
                '**Default hyperparameters**: α=0.001, β₁=0.9, β₂=0.999, ε=1e-8.',
              ],
              code: `import math

def rosenbrock(x, y):
    return (1 - x)**2 + 100 * (y - x**2)**2

def rosenbrock_grad(x, y):
    return -2*(1-x) + 200*(y-x**2)*(-2*x), 200*(y-x**2)

def adam(lr=0.01, beta1=0.9, beta2=0.999, eps=1e-8, steps=5000):
    x, y = -1.0, 1.0
    mx, my = 0.0, 0.0  # first moment (mean)
    vx, vy = 0.0, 0.0  # second moment (variance)

    for t in range(1, steps + 1):
        gx, gy = rosenbrock_grad(x, y)

        # Update biased first moment
        mx = beta1 * mx + (1 - beta1) * gx
        my = beta1 * my + (1 - beta1) * gy

        # Update biased second moment (tracks gradient magnitude)
        vx = beta2 * vx + (1 - beta2) * gx**2
        vy = beta2 * vy + (1 - beta2) * gy**2

        # Bias correction (important for early steps)
        mx_hat = mx / (1 - beta1**t)
        my_hat = my / (1 - beta2**t)
        vx_hat = vx / (1 - beta2**t)
        vy_hat = vy / (1 - beta2**t)

        # Adaptive step: large gradients -> smaller step
        x = x - lr * mx_hat / (vx_hat**0.5 + eps)
        y = y - lr * my_hat / (vy_hat**0.5 + eps)

        if math.isnan(x): return float('inf'), None, None

    return rosenbrock(x, y), x, y

loss, xf, yf = adam()
print(f"Adam (lr=0.01, 5000 steps):")
print(f"  Final: x={xf:.6f}, y={yf:.6f}")
print(f"  Loss:  {loss:.10f}")

# Effect of learning rate on Adam
print("\\nAdam learning rate effect:")
for lr in [0.0001, 0.001, 0.01, 0.1]:
    l, xf, yf = adam(lr=lr)
    if math.isinf(l): print(f"  lr={lr}  diverged")
    else: print(f"  lr={lr}  loss={l:.6f}  x={xf:.4f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Saddle point escape and optimizer comparison',
              prose: [
                '## Saddle Points',
                'f(x,y) = x² - y²: gradient = [2x, -2y]. At (0,0) the gradient is [0,0] — looks like a minimum. But it is a saddle: x goes up in all directions, y goes down. Deep learning loss surfaces are full of saddles (not local minima).',
                '**Key insight**: In n dimensions, a critical point where k of n eigenvalues of the Hessian are negative is a saddle with a k-dimensional unstable manifold. With random initialization, pure GD near a saddle barely moves. Momentum and Adam escape because small perturbations in gradient direction get amplified.',
                '## Final Comparison',
                'All three optimizers on Rosenbrock from (-1, 1) for 5000 steps.',
              ],
              code: `import math

def rosenbrock(x, y):
    return (1 - x)**2 + 100 * (y - x**2)**2

def rosenbrock_grad(x, y):
    return -2*(1-x) + 200*(y-x**2)*(-2*x), 200*(y-x**2)

def saddle(x, y):
    return x**2 - y**2  # saddle at (0,0)

def saddle_grad(x, y):
    return 2*x, -2*y

# Saddle point demo
def gd_steps(loss_fn, grad_fn, start, lr, steps):
    x, y = start
    for _ in range(steps):
        gx, gy = grad_fn(x, y)
        x -= lr * gx; y -= lr * gy
        if math.isnan(x): return None, None
    return x, y

def adam_steps(loss_fn, grad_fn, start, lr, steps):
    x, y = start
    mx, my, vx, vy = 0,0,0,0
    for t in range(1, steps+1):
        gx, gy = grad_fn(x, y)
        mx = 0.9*mx + 0.1*gx; my = 0.9*my + 0.1*gy
        vx = 0.999*vx + 0.001*gx**2; vy = 0.999*vy + 0.001*gy**2
        mx_h = mx/(1-0.9**t); my_h = my/(1-0.9**t)
        vx_h = vx/(1-0.999**t); vy_h = vy/(1-0.999**t)
        x -= lr * mx_h/(vx_h**0.5+1e-8); y -= lr * my_h/(vy_h**0.5+1e-8)
        if math.isnan(x): return None, None
    return x, y

print("Saddle f(x,y)=x²-y², starting near saddle at (0.01, 0.01):")
start = (0.01, 0.01)
for name, fn in [("GD lr=0.1", lambda: gd_steps(saddle, saddle_grad, start, 0.1, 100)),
                  ("Adam lr=0.1", lambda: adam_steps(saddle, saddle_grad, start, 0.1, 100))]:
    x, y = fn()
    if x is None: print(f"  {name}: diverged")
    else: print(f"  {name}: final y={y:.2f}  ({'escaped' if abs(y)>0.5 else 'stuck near saddle'})")

# Final comparison table
print("\\nRosenbrock comparison (5000 steps):")
print(f"{'Optimizer':>18}  {'Loss':>14}  {'Steps to 1e-4'}")
print("-" * 48)

# GD
x, y = -1.0, 1.0
for s in range(5000):
    gx, gy = rosenbrock_grad(x, y)
    x -= 0.0005*gx; y -= 0.0005*gy
print(f"{'GD (lr=0.0005)':>18}  {rosenbrock(x,y):>14.6f}")

# Momentum
x, y = -1.0, 1.0; vx, vy = 0,0
for _ in range(5000):
    gx, gy = rosenbrock_grad(x, y)
    vx = 0.9*vx+gx; vy = 0.9*vy+gy; x -= 0.0001*vx; y -= 0.0001*vy
print(f"{'Momentum (lr=0.0001)':>18}  {rosenbrock(x,y):>14.6f}")

# Adam
xf, yf = adam_steps(None, rosenbrock_grad, (-1,1), 0.01, 5000)
print(f"{'Adam (lr=0.01)':>18}  {rosenbrock(xf,yf):>14.6f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Implement gradient descent with early stopping',
              difficulty: 'easy',
              prompt: 'Implement `gradient_descent(grad_fn, start, lr, max_steps, tol=1e-6)` that runs GD and stops early when the gradient magnitude is below tol. Return (final_params, steps_taken). Test on a simple parabola f(x) = (x-3)² where grad_fn(x) = 2*(x-3).',
              code: `import math

def gradient_descent(grad_fn, start, lr, max_steps, tol=1e-6):
    """
    Run gradient descent until gradient magnitude < tol or max_steps reached.
    start: initial parameter (float or list)
    grad_fn: function that takes current params and returns gradient
    Returns: (final_params, steps_taken)
    """
    pass

# Test on parabola f(x) = (x-3)^2, minimum at x=3
def parabola_grad(x):
    return 2 * (x - 3)

final_x, steps = gradient_descent(parabola_grad, start=0.0, lr=0.1, max_steps=1000)
print(f"Parabola minimum: x = {final_x:.6f}  (expected: 3.0)")
print(f"Steps taken: {steps}")

# Test with list of params (2D: f(x,y) = x^2 + y^2)
def sphere_grad(params):
    return [2*params[0], 2*params[1]]  # grad of x^2 + y^2

final_params, steps = gradient_descent(sphere_grad, start=[5.0, -3.0], lr=0.1, max_steps=1000)
print(f"\\n2D sphere minimum: {[round(p, 6) for p in final_params]}  (expected: [0, 0])")
print(f"Steps taken: {steps}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'gradient_descent' not in dir():
    res = "ERROR: gradient_descent not defined."
else:
    # Test scalar case
    def parabola_grad(x): return 2*(x - 3)
    final, steps = gradient_descent(parabola_grad, 0.0, 0.1, 1000)
    if abs(final - 3.0) > 0.01:
        res = f"ERROR: parabola minimum should be ~3.0, got {final}"
    elif steps > 500:
        res = f"ERROR: should converge in <500 steps with lr=0.1, took {steps}"
    else:
        # Test list case
        def sphere_grad(p): return [2*p[0], 2*p[1]]
        final_list, steps2 = gradient_descent(sphere_grad, [5.0, -3.0], 0.1, 1000)
        if abs(final_list[0]) > 0.01 or abs(final_list[1]) > 0.01:
            res = f"ERROR: sphere minimum should be [0,0], got {final_list}"
        else:
            res = f"SUCCESS: converged to x={final:.6f} in {steps} steps"
res
`,
              hint: 'Handle both scalar and list params. For scalar: grad = grad_fn(params), magnitude = abs(grad), params -= lr*grad. For list: grad = grad_fn(params), magnitude = sqrt(sum(g**2 for g in grad)), params = [p - lr*g for p,g in zip(params,grad)]. Stop when magnitude < tol.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Implement the Adam optimizer',
              difficulty: 'hard',
              prompt: 'Implement the Adam optimizer as a class with `step(params, grads)` method. Minimize the Rosenbrock function from (-1, 1) in 2000 steps with lr=0.01. Report the final loss. Hint: m and v are initialized lazily in step().',
              code: `import math

def rosenbrock(x, y):
    return (1 - x)**2 + 100 * (y - x**2)**2

def rosenbrock_grad(x, y):
    df_dx = -2*(1 - x) + 200*(y - x**2)*(-2*x)
    df_dy = 200*(y - x**2)
    return [df_dx, df_dy]

class Adam:
    def __init__(self, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
        self.lr = lr
        self.beta1 = beta1
        self.beta2 = beta2
        self.eps = eps
        self.m = None   # first moment
        self.v = None   # second moment
        self.t = 0      # step counter

    def step(self, params, grads):
        """
        One Adam step.
        params: list of current parameter values
        grads: list of gradient values (same length)
        Returns: new params list
        """
        pass

# Test: minimize Rosenbrock from (-1, 1)
optimizer = Adam(lr=0.01)
params = [-1.0, 1.0]

for step in range(2000):
    grads = rosenbrock_grad(params[0], params[1])
    params = optimizer.step(params, grads)

loss = rosenbrock(params[0], params[1])
print(f"Adam (2000 steps, lr=0.01):")
print(f"  Final params: x={params[0]:.6f}, y={params[1]:.6f}")
print(f"  Final loss:   {loss:.8f}  (target: near 0)")
print(f"  Distance from (1,1): {math.sqrt((params[0]-1)**2 + (params[1]-1)**2):.6f}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'Adam' not in dir():
    res = "ERROR: Adam class not defined."
else:
    def rosenbrock_grad(x, y):
        return [-2*(1-x) + 200*(y-x**2)*(-2*x), 200*(y-x**2)]
    def rosenbrock(x, y):
        return (1-x)**2 + 100*(y-x**2)**2

    opt = Adam(lr=0.01)
    params = [-1.0, 1.0]
    for _ in range(2000):
        g = rosenbrock_grad(params[0], params[1])
        params = opt.step(params, g)
    loss = rosenbrock(params[0], params[1])
    if loss > 0.1:
        res = f"ERROR: Adam should get Rosenbrock loss < 0.1 in 2000 steps, got {loss:.4f}"
    elif math.isnan(loss):
        res = "ERROR: Adam produced NaN — check bias correction formula"
    else:
        res = f"SUCCESS: Adam converged to loss={loss:.6f}, x={params[0]:.4f}, y={params[1]:.4f}"
res
`,
              hint: 'Init self.m and self.v as lists of zeros if None. self.t += 1. m[i] = beta1*m[i] + (1-beta1)*g[i]. v[i] = beta2*v[i] + (1-beta2)*g[i]**2. m_hat = m[i]/(1-beta1**t). v_hat = v[i]/(1-beta2**t). new_p = p - lr * m_hat / (v_hat**0.5 + eps).',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What happens to gradient descent if the learning rate is too large?',
      options: [
        'It converges but to a different minimum than intended',
        'It takes more steps but eventually converges',
        'It overshoots and the loss can diverge to infinity',
        'It gets stuck at a saddle point',
      ],
      correct: 2,
      explanation: 'A too-large learning rate causes the update to overshoot the minimum. On the next step the gradient is even larger, causing a larger overshoot. Loss can increase exponentially and diverge.',
    },
    {
      id: 'q2',
      question: 'SGD with momentum maintains a velocity vector v_t = β·v_{t-1} + g_t. What does β = 0 reduce to?',
      options: [
        'Adam optimizer',
        'Plain gradient descent (no momentum)',
        'Gradient descent with L2 regularization',
        'Second-order Newton method',
      ],
      correct: 1,
      explanation: 'With β = 0: v_t = 0·v_{t-1} + g_t = g_t. Then θ ← θ - α·v_t = θ - α·g_t. This is plain SGD with no memory of past gradients.',
    },
    {
      id: 'q3',
      question: 'Adam divides the gradient update by √v̂_t + ε, where v̂_t is the running mean of squared gradients. What is the effect of this division?',
      options: [
        'Parameters with larger average gradients get larger steps',
        'Parameters with larger average gradients get smaller steps (adaptive learning rate)',
        'All parameters get the same effective step size regardless of gradient magnitude',
        'It prevents the gradient from being negative',
      ],
      correct: 1,
      explanation: 'If a parameter has historically large gradients (large v̂), dividing by √v̂ shrinks the effective step. If gradients are small (parameter rarely updated), v̂ is small and the effective step is larger. This is the adaptive learning rate property that makes Adam robust.',
    },
    {
      id: 'q4',
      question: 'Why does Adam include bias correction (dividing m_t and v_t by (1-β^t))?',
      options: [
        'To make the algorithm symmetric around zero',
        'To correct for the fact that m and v are initialized at 0, making early estimates too small',
        'To scale the learning rate by the number of training steps',
        'To prevent gradient explosion during the first epoch',
      ],
      correct: 1,
      explanation: 'At step 1, m_1 = (1-β₁)·g₁. With β₁=0.9, this is only 0.1·g₁ — much smaller than the actual gradient. Dividing by (1-0.9¹) = 0.1 corrects for this initialization bias, giving m̂₁ = g₁.',
    },
    {
      id: 'q5',
      question: 'Why are saddle points more common than local minima in high-dimensional loss surfaces?',
      options: [
        'Because the loss function is convex in most neural networks',
        'Because gradient descent always escapes saddle points',
        'In high dimensions, a critical point must be a minimum in ALL directions — any downward direction makes it a saddle',
        'Because neural networks are initialized near saddle points by design',
      ],
      correct: 2,
      explanation: 'For a true local minimum, the Hessian must be positive definite (all eigenvalues > 0). In high-dimensional spaces, the probability that all eigenvalues are positive is exponentially small. Almost every critical point has at least one negative curvature direction, making it a saddle.',
    },
  ],
}
