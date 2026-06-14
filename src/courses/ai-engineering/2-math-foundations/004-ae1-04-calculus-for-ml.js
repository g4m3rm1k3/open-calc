export default {
  id: 'ae-p1-04-calculus-for-ml',
  slug: 'calculus-for-ml',
  chapter: 'ae-p1',
  order: 3,
  title: 'Calculus for Machine Learning',
  subtitle: 'Derivatives tell you which way is downhill. That is all a neural network needs to learn.',
  tags: ['calculus', 'derivatives', 'gradients', 'gradient-descent', 'chain-rule', 'hessian', 'taylor-series', 'partial-derivatives'],

  hook: {
    question: 'How does a neural network know which direction to turn each of its millions of knobs?',
    realWorldContext:
      'You have a neural network with millions of weights. Each weight is a knob. You need to figure out which direction to turn every single knob to make the model slightly less wrong. Calculus gives you that direction. Without calculus, training a neural network would mean trying random changes and hoping for the best. With derivatives, you know exactly how each weight affects the error. You turn every knob the right way, every time.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'The derivative f\'(x) tells you: if you nudge x by a tiny amount, how much does y change? Geometrically, it is the slope of the tangent line. For f(x) = x², f\'(0) = 0 means you are at the bottom of the bowl. For f(x) = x², f\'(2) = 4 means the curve is steeply rising at x=2.',
      'Backpropagation is the chain rule applied repeatedly from output to input through a neural network. Training is gradient descent: compute the gradient of the loss with respect to every weight, then subtract a small multiple of it. Every gradient-based optimizer does exactly this.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The gradient points uphill — so you go opposite',
        body: 'The gradient vector points in the direction of steepest ascent. To minimize a loss function, you move in the opposite direction: `w_new = w_old - lr * grad`. This one-line rule is all of gradient descent.',
      },
      {
        type: 'warning',
        title: "Newton's method can't scale to neural networks",
        body: "Newton's method uses the Hessian (matrix of second derivatives) for better steps, but for N=1M parameters the Hessian has 1 trillion entries. That's why Adam approximates second-order info cheaply instead.",
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Calculus for Machine Learning',
        mathBridge: 'f\'(x) ≈ [f(x+h) - f(x-h)] / (2h) for tiny h. The central difference is more accurate than the forward difference because error terms cancel.',
        caption: 'Build gradient descent from scratch to train a linear model. This exact pattern appears in every neural network.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Numerical derivatives and gradients',
              prose: [
                '## The numerical derivative (central difference)',
                '`f\'(x) ≈ (f(x+h) - f(x-h)) / (2*h)` for tiny h.',
                '## The gradient: vector of all partial derivatives',
                'For f(x,y,z), the gradient is [df/dx, df/dy, df/dz]. Points in direction of steepest ascent.',
              ],
              code: `import math

def numerical_derivative(f, x, h=1e-7):
    return (f(x + h) - f(x - h)) / (2 * h)

def numerical_gradient(f, point, h=1e-7):
    gradient = []
    for i in range(len(point)):
        point_plus = list(point)
        point_minus = list(point)
        point_plus[i] += h
        point_minus[i] -= h
        partial = (f(point_plus) - f(point_minus)) / (2 * h)
        gradient.append(partial)
    return gradient

def f(x):
    return x ** 2

for x in [-2, -1, 0, 1, 2]:
    numerical = numerical_derivative(f, x)
    analytical = 2 * x
    print(f"x={x:2d}  f'(x) numerical={numerical:.6f}  analytical={analytical:.1f}")

def f_multi(point):
    x, y = point
    return x**2 + 3*x*y + y**2

grad = numerical_gradient(f_multi, [1.0, 2.0])
print(f"\\nNumerical gradient at (1,2): {[f'{g:.4f}' for g in grad]}")
print(f"Analytical gradient at (1,2): [2*1+3*2, 3*1+2*2] = [{2*1+3*2}, {3*1+2*2}]")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Gradient descent: the core training algorithm',
              prose: [
                '## Gradient descent update rule',
                '`w_new = w_old - learning_rate * dL/dw`',
                '`dL/dw` points uphill — subtracting it moves the weight downhill.',
                '## Learning rate: the most important hyperparameter',
                'Too large → overshoot and diverge. Too small → converge in thousands of unnecessary steps. Common starting points: 0.001 for Adam, 0.01 for SGD.',
              ],
              code: `# 1D gradient descent: minimize f(x) = x^2
x = 5.0
lr = 0.1
print("Minimizing f(x) = x^2 starting at x=5:")
for step in range(20):
    grad = 2 * x
    x = x - lr * grad
    if step % 4 == 0 or step == 19:
        print(f"  step {step:2d}  x={x:8.4f}  f(x)={x**2:10.6f}")

# 2D gradient descent
def f_2d(point):
    x, y = point
    return x**2 + y**2

point = [4.0, 3.0]
lr = 0.1
print(f"\\nMinimizing x^2 + y^2 from (4,3):")
for step in range(30):
    grad = [2 * point[0], 2 * point[1]]
    point = [p - lr * g for p, g in zip(point, grad)]
    loss = f_2d(point)
    if step % 5 == 0 or step == 29:
        print(f"  step {step:2d}  ({point[0]:7.4f}, {point[1]:7.4f})  f={loss:.6f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Key derivatives for ML and comparison table',
              prose: [
                '## Derivatives you will see over and over',
                '| Function | Derivative | Used in |\n|----------|-----------|--------|\n| f(x) = x² | f\'(x) = 2x | MSE loss |\n| f(w) = wx + b | f\'(w) = x, f\'(b) = 1 | Linear layer |\n| f(x) = eˣ | f\'(x) = eˣ | Softmax, attention |\n| f(x) = ln(x) | f\'(x) = 1/x | Cross-entropy |\n| sigmoid(x) | sigmoid(x)*(1-sigmoid(x)) | Output activation |',
              ],
              code: `import math

test_functions = [
    ("x^2",      lambda x: x**2,          lambda x: 2*x),
    ("x^3",      lambda x: x**3,          lambda x: 3*x**2),
    ("sin(x)",   lambda x: math.sin(x),   lambda x: math.cos(x)),
    ("e^x",      lambda x: math.exp(x),   lambda x: math.exp(x)),
    ("1/x",      lambda x: 1/x,           lambda x: -1/x**2),
]

x = 2.0
print(f"{'Function':<12} {'Numerical':>12} {'Analytical':>12} {'Error':>12}")
print("-" * 50)
for name, f, df in test_functions:
    num = (f(x + 1e-7) - f(x - 1e-7)) / (2 * 1e-7)
    ana = df(x)
    err = abs(num - ana)
    print(f"{name:<12} {num:12.6f} {ana:12.6f} {err:12.2e}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Train a linear model with gradient descent',
              prose: [
                '## Everything in neural network training uses this pattern',
                '1. Predict: `pred = w * x + b`\n2. Compute loss: `loss = mean((pred - y)^2)` (MSE)\n3. Compute gradients: `dw = mean(2*(pred-y)*x)`, `db = mean(2*(pred-y))`\n4. Update: `w -= lr * dw`, `b -= lr * db`\n5. Repeat',
              ],
              code: `import random

random.seed(42)

w = random.gauss(0, 1)
b = random.gauss(0, 1)
lr = 0.01

xs = [1.0, 2.0, 3.0, 4.0, 5.0]
ys = [3.0, 5.0, 7.0, 9.0, 11.0]   # y = 2x + 1

for epoch in range(200):
    total_loss = 0
    dw = 0
    db = 0
    for x, y in zip(xs, ys):
        pred = w * x + b
        error = pred - y
        total_loss += error ** 2
        dw += 2 * error * x
        db += 2 * error
    dw /= len(xs)
    db /= len(xs)
    total_loss /= len(xs)
    w -= lr * dw
    b -= lr * db
    if epoch % 40 == 0 or epoch == 199:
        print(f"epoch {epoch:3d}  w={w:.4f}  b={b:.4f}  loss={total_loss:.6f}")

print(f"\\nLearned: y = {w:.2f}x + {b:.2f}")
print(f"Actual:  y = 2x + 1")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Hessian and Taylor series (the deeper math)',
              prose: [
                '## The Hessian: matrix of second derivatives',
                'The Hessian tells you the curvature at a point. Eigenvalues of the Hessian determine the type of critical point:\n- All positive → local minimum (bowl pointing up)\n- All negative → local maximum\n- Mixed signs → saddle point',
                '## Taylor series: why gradient descent works',
                'Every gradient-based optimizer is really approximating the loss function locally and stepping to the minimum:\n- 1st order (linear) → gradient descent\n- 2nd order (quadratic) → Newton\'s method',
              ],
              code: `def hessian_2d(f, x, y, h=1e-5):
    fxx = (f(x + h, y) - 2 * f(x, y) + f(x - h, y)) / (h ** 2)
    fyy = (f(x, y + h) - 2 * f(x, y) + f(x, y - h)) / (h ** 2)
    fxy = (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4 * h ** 2)
    return [[fxx, fxy], [fxy, fyy]]

def saddle(x, y):
    return x ** 2 - y ** 2

def bowl(x, y):
    return x ** 2 + y ** 2

H_saddle = hessian_2d(saddle, 0.0, 0.0)
H_bowl = hessian_2d(bowl, 0.0, 0.0)
print(f"Saddle f=x^2-y^2 Hessian at (0,0): {[[round(x,1) for x in row] for row in H_saddle]}")
print(f"Bowl   f=x^2+y^2 Hessian at (0,0): {[[round(x,1) for x in row] for row in H_bowl]}")

# Taylor approximation demonstration
import math
def taylor_approx(f, f_prime, f_double_prime, x0, h, order=2):
    result = f(x0)
    if order >= 1:
        result += f_prime(x0) * h
    if order >= 2:
        result += 0.5 * f_double_prime(x0) * h ** 2
    return result

x0 = 0.0
print(f"\\nTaylor approx of sin(x) around x=0:")
print(f"{'h':<6} {'true sin(h)':>12} {'order1':>10} {'order2':>10}")
for h in [0.1, 0.5, 1.0, 2.0]:
    true_val = math.sin(h)
    t1 = taylor_approx(math.sin, math.cos, lambda x: -math.sin(x), x0, h, order=1)
    t2 = taylor_approx(math.sin, math.cos, lambda x: -math.sin(x), x0, h, order=2)
    print(f"{h:<6.1f} {true_val:>12.4f} {t1:>10.4f} {t2:>10.4f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Gradient descent optimizer',
              difficulty: 'easy',
              prompt: 'Write `gradient_descent(f, grad_f, start, lr, steps)` where `f` is a scalar function of a list, `grad_f` returns the gradient (list), `start` is the starting point (list), `lr` is learning rate, `steps` is number of iterations. Return a list of `(step, point, loss)` tuples for every 10th step and the final step.',
              code: `def gradient_descent(f, grad_f, start, lr, steps):
    """
    Run gradient descent.
    Returns list of (step, point, loss) for every 10th step + final step.
    """
    pass

# Test: minimize f(x,y) = (x-3)^2 + (y+1)^2, minimum at (3, -1)
def f(p):
    x, y = p
    return (x - 3)**2 + (y + 1)**2

def grad_f(p):
    x, y = p
    return [2*(x - 3), 2*(y + 1)]

history = gradient_descent(f, grad_f, start=[0.0, 0.0], lr=0.1, steps=100)
print("Minimizing (x-3)^2 + (y+1)^2 from (0,0):")
for step, point, loss in history:
    print(f"  step {step:3d}: ({point[0]:.4f}, {point[1]:.4f}), loss={loss:.6f}")

print(f"\\nExpected minimum at (3.0, -1.0)")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'gradient_descent' not in dir():
    res = "ERROR: gradient_descent not defined."
else:
    def f(p):
        x, y = p
        return (x - 3)**2 + (y + 1)**2
    def grad_f(p):
        x, y = p
        return [2*(x - 3), 2*(y + 1)]
    history = gradient_descent(f, grad_f, [0.0, 0.0], 0.1, 200)
    if not history:
        res = "ERROR: history should not be empty."
    else:
        final = history[-1]
        final_point = final[1]
        if abs(final_point[0] - 3.0) > 0.01 or abs(final_point[1] - (-1.0)) > 0.01:
            res = f"ERROR: Final point should be near (3.0,-1.0), got {final_point}"
        else:
            res = "SUCCESS: gradient_descent converges to the correct minimum (3.0, -1.0)."
res
`,
              hint: 'params = list(start). For each step, compute grads = grad_f(params), then params = [p - lr*g for p,g in zip(params,grads)]. Append (step, params[:], f(params)) if step % 10 == 0 or step == steps-1.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Gradient checker',
              difficulty: 'medium',
              prompt: 'Write `gradient_check(f, x, h=1e-5)` that takes a scalar function and a point (list of floats) and returns a dict with `"numerical"` (gradient via central difference), `"max_error"` (if an analytical gradient is provided), and `"passed"` (True if max error < 1e-4). Also accept an optional `analytical_grad` parameter. If not provided, just return the numerical gradient.',
              code: `def gradient_check(f, x, h=1e-5, analytical_grad=None):
    """
    Compute the numerical gradient of f at point x.
    If analytical_grad is provided, compare and report max error.
    Returns: {numerical, analytical (if provided), max_error (if provided), passed (if provided)}
    """
    pass

# Test 1: f(x,y) = x^2 + y^2, gradient = [2x, 2y]
def f1(p):
    return p[0]**2 + p[1]**2

def analytical_grad_f1(p):
    return [2*p[0], 2*p[1]]

x = [3.0, 4.0]
result = gradient_check(f1, x, analytical_grad=analytical_grad_f1)
print(f"f = x^2+y^2 at (3,4):")
print(f"  Numerical:   {[round(v, 6) for v in result['numerical']]}")
print(f"  Analytical:  {[round(v, 6) for v in result['analytical']]}")
print(f"  Max error:   {result['max_error']:.2e}")
print(f"  Passed:      {result['passed']}")

# Test 2: complex function
def f2(p):
    import math
    x, y = p
    return math.sin(x) * math.exp(y)

result2 = gradient_check(f2, [1.0, 0.5])
print(f"\\nNumerical gradient of sin(x)*exp(y) at (1, 0.5):")
print(f"  {[round(v, 6) for v in result2['numerical']]}")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'gradient_check' not in dir():
    res = "ERROR: gradient_check not defined."
else:
    def f(p): return p[0]**2 + p[1]**2
    def ag(p): return [2*p[0], 2*p[1]]
    r = gradient_check(f, [3.0, 4.0], analytical_grad=ag)
    if 'numerical' not in r:
        res = "ERROR: result must have 'numerical' key."
    elif len(r['numerical']) != 2:
        res = f"ERROR: numerical gradient should have 2 elements, got {r['numerical']}"
    elif abs(r['numerical'][0] - 6.0) > 0.001:
        res = f"ERROR: df/dx at x=3 should be 6.0, got {r['numerical'][0]}"
    elif not r.get('passed', False):
        res = f"ERROR: should pass for exact analytical gradient, got passed={r.get('passed')}, max_error={r.get('max_error')}"
    else:
        # Test without analytical grad
        r2 = gradient_check(f, [1.0, 2.0])
        if 'numerical' not in r2 or 'passed' in r2:
            res = "ERROR: Without analytical_grad, result should have 'numerical' but not 'passed'."
        else:
            res = "SUCCESS: gradient_check correctly computes numerical gradients and compares with analytical."
res
`,
              hint: 'Numerical gradient: for each i, compute (f(x+h*e_i) - f(x-h*e_i)) / (2h) where e_i is the unit vector. max_error = max(abs(n-a) for n,a in zip(numerical, analytical)). passed = max_error < 1e-4.',
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      question: 'What does the derivative of a function at a point tell you?',
      options: [
        'The value of the function at that point',
        'The rate of change (slope) of the function at that point',
        'The area under the function up to that point',
        'The maximum value the function can reach',
      ],
      correct: 1,
      explanation: "The derivative f'(x) measures how much the output changes per unit change in input. Geometrically, it is the slope of the tangent line at that point.",
    },
    {
      id: 'q2',
      question: 'What is a gradient in the context of machine learning?',
      options: [
        'A measure of model accuracy',
        'A vector of all partial derivatives that points in the direction of steepest ascent',
        'The learning rate used during training',
        'The difference between predicted and actual values',
      ],
      correct: 1,
      explanation: 'The gradient collects every partial derivative into one vector. It points in the direction that increases the function fastest. To minimize loss, you move opposite the gradient.',
    },
    {
      id: 'q3',
      question: "In gradient descent, what does the update rule 'w = w - lr * dL/dw' accomplish?",
      options: [
        'It increases the loss to test model robustness',
        'It adjusts each weight in the direction that reduces the loss, scaled by the learning rate',
        'It resets the weight to its initial value minus the gradient',
        'It normalizes the weight to have magnitude 1',
      ],
      correct: 1,
      explanation: 'dL/dw tells you which direction increases the loss. Subtracting it (times the learning rate) moves the weight in the direction that decreases the loss. This is repeated for every weight in the model.',
    },
    {
      id: 'q4',
      question: "Why can't Newton's method (which uses the Hessian matrix) be directly applied to neural networks with millions of parameters?",
      options: [
        "Newton's method only works for convex functions",
        "The Hessian is an N x N matrix, requiring O(N^2) storage and O(N^3) computation per step, which is intractable for millions of parameters",
        "Newton's method requires analytical derivatives which cannot be computed for neural networks",
        "Newton's method converges too slowly for deep networks",
      ],
      correct: 1,
      explanation: 'For N=1 million parameters, the Hessian has 1 trillion entries. Computing and inverting it is impossible. This is why we use first-order methods (SGD, Adam) that approximate second-order information cheaply.',
    },
    {
      id: 'q5',
      question: "What is the numerical (central difference) approximation for f'(x)?",
      options: [
        'f(x+h) / h',
        '(f(x+h) - f(x)) / h',
        '(f(x+h) - f(x-h)) / (2*h)',
        'f(x) * h',
      ],
      correct: 2,
      explanation: 'The central difference (f(x+h) - f(x-h)) / (2h) is more accurate than the forward difference because it averages the slope on both sides of x, canceling out the leading error term.',
    },
  ],
}
