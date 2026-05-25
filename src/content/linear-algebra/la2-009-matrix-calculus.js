export default {
  id: 'la2-009',
  slug: 'matrix-calculus',
  chapter: 'la2',
  order: 9,
  title: 'Matrix Calculus: Gradients, Jacobians, and Hessians',
  subtitle: 'When calculus meets linear algebra — every gradient is a row vector, every Jacobian is a matrix, and every Hessian is symmetric.',
  tags: ['gradient', 'Jacobian', 'Hessian', 'matrix calculus', 'chain rule', 'partial derivatives', 'optimization'],
  aliases: 'gradient Jacobian Hessian matrix calculus partial derivatives chain rule optimization vector calculus',
  timeToComplete: 30,
  coreConcept: 'Matrix calculus extends single-variable derivatives to vector and matrix inputs. The gradient ($n$-vector) generalizes the derivative for scalar functions; the Jacobian ($m \\times n$ matrix) generalizes it for vector functions; the Hessian ($n \\times n$ symmetric matrix) captures curvature. Two formulas are essential: $\\nabla(\\mathbf{a}^\\top\\mathbf{x}) = \\mathbf{a}$ and $\\nabla(\\mathbf{x}^\\top A\\mathbf{x}) = 2A\\mathbf{x}$.',
  prerequisites: ['la2-007'],
  nextLesson: 'invertible-matrix-theorem',

  hook: {
    question: "Neural networks adjust millions of weights using calculus on vectors. How do you take the derivative of a function whose input is an entire matrix?",
    realWorldContext: "Every machine learning algorithm ultimately does calculus on vectors and matrices. The gradient of a loss function tells you which direction to step to reduce error. The Jacobian tells you how a transformation stretches space locally — GPS systems use it to map sensor noise through nonlinear coordinate transforms. The Hessian tells you the curvature of a surface — Newton\'s method for optimization uses it to jump straight to a minimum instead of crawling with gradient descent. Understanding matrix calculus is the difference between being able to derive these algorithms from scratch and just copying formulas from a textbook.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      'Take $\\mathbf{x}_0 = [1, 2]^\\top$ and $A = \\begin{bmatrix}3&1\\\\1&2\\end{bmatrix}$. The function $f(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ evaluates to $15$ at $\\mathbf{x}_0$. One formula gives the gradient instantly: $\\nabla f = 2A\\mathbf{x}_0 = 2\\begin{bmatrix}3&1\\\\1&2\\end{bmatrix}\\begin{bmatrix}1\\\\2\\end{bmatrix} = \\begin{bmatrix}10\\\\10\\end{bmatrix}$. This tells you: from $\\mathbf{x}_0$, moving in direction $[10,10]^\\top$ increases $f$ fastest; gradient descent steps the opposite way. That single formula — $\\nabla(\\mathbf{x}^\\top A\\mathbf{x}) = 2A\\mathbf{x}$ — drives least squares, ridge regression, and neural network training.',
      '**Derivatives of scalars with respect to vectors — the gradient.** If $f(\\mathbf{x})$ maps a vector $\\mathbf{x} \\in \\mathbb{R}^n$ to a scalar, the gradient $\\nabla f$ is a column vector of partial derivatives: $\\nabla f = \\bigl[\\partial f/\\partial x_1, \\ldots, \\partial f/\\partial x_n\\bigr]^\\top$. The gradient points in the direction of steepest ascent. Gradient descent moves opposite to it.',
      '**Derivatives of vectors with respect to vectors — the Jacobian.** If $\\mathbf{f}(\\mathbf{x})$ maps $\\mathbf{x} \\in \\mathbb{R}^n$ to $\\mathbf{f} \\in \\mathbb{R}^m$, the Jacobian $J$ is an $m \\times n$ matrix where $J_{ij} = \\partial f_i / \\partial x_j$. The Jacobian is the best linear approximation to $\\mathbf{f}$ at a point — the multivariable analogue of the single-variable derivative.',
      '**The Hessian — second-order information.** For a scalar function $f: \\mathbb{R}^n \\to \\mathbb{R}$, the Hessian $H$ is the $n \\times n$ matrix of second partial derivatives: $H_{ij} = \\partial^2 f / \\partial x_i \\partial x_j$. By Schwarz\'s theorem, the Hessian is always symmetric ($H = H^\\top$). Its eigenvalues tell you the curvature in each principal direction. Positive definite Hessian → local minimum. Indefinite Hessian → saddle point.',
      '**Two critical formulas to memorize.** For $f(\\mathbf{x}) = \\mathbf{a}^\\top \\mathbf{x}$ (linear), the gradient is $\\nabla f = \\mathbf{a}$. For $f(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ (quadratic form with symmetric $A$), the gradient is $\\nabla f = 2A\\mathbf{x}$, and the Hessian is $H = 2A$. These two formulas appear everywhere in statistics (least squares), physics (energy), and ML (loss functions).',
      '**Predict before reading on.** A neural network has two layers: $\\mathbf{z} = W_1\\mathbf{x}$ then $\\mathbf{y} = W_2\\mathbf{z}$, so $\\mathbf{y} = W_2 W_1 \\mathbf{x}$. If the loss is $L = \\frac{1}{2}\\|\\mathbf{y} - \\mathbf{t}\\|^2$, what is $\\partial L/\\partial \\mathbf{x}$? Write your answer in terms of $W_1$, $W_2$, $\\mathbf{y}$, and $\\mathbf{t}$ before continuing.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Matrix Calculus Cheat Sheet',
        body: '| Expression | Derivative | Shape |\n|---|---|---|\n| $\\mathbf{a}^\\top \\mathbf{x}$ | $\\mathbf{a}$ | $n \\times 1$ |\n| $\\mathbf{x}^\\top A \\mathbf{x}$ | $2A\\mathbf{x}$ (if $A$ symmetric) | $n \\times 1$ |\n| $A\\mathbf{x}$ w.r.t. $\\mathbf{x}$ | $A$ (Jacobian) | $m \\times n$ |\n| $\\|\\mathbf{x}\\|^2$ | $2\\mathbf{x}$ | $n \\times 1$ |\n| $\\|A\\mathbf{x} - \\mathbf{b}\\|^2$ | $2A^\\top(A\\mathbf{x}-\\mathbf{b})$ | $n \\times 1$ |',
      },
      {
        type: 'insight',
        title: 'The Chain Rule in Matrix Form',
        body: 'If $\\mathbf{h}(\\mathbf{x}) = \\mathbf{f}(\\mathbf{g}(\\mathbf{x}))$, the Jacobian of the composition is the product of Jacobians:\n$J_h = J_f \\cdot J_g$\nThis is why backpropagation in neural networks is just repeated matrix multiplication of Jacobians — the chain rule applied layer by layer.',
      },
      {
        type: 'warning',
        title: 'Numerator vs Denominator Layout',
        body: 'There are two conventions: numerator layout (gradient is a row vector) and denominator layout (gradient is a column vector). This course uses denominator layout — the gradient $\\nabla f$ is a column vector of the same shape as the input $\\mathbf{x}$. Be careful when reading ML papers which often switch conventions.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Gradients and Jacobians in OpenMAT',
        mathBridge: 'Compute gradients numerically using finite differences, then verify against analytic formulas.',
        caption: 'Matrix calculus: from formula to computation.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Gradient of a quadratic form',
              prose: ['For f(x) = x\'*A*x with symmetric A, the gradient is 2*A*x. Verify numerically.'],
              code: `A = [3 1; 1 2]
x = [1; 2]
% Analytic gradient: 2*A*x
grad_analytic = 2*A*x

% Numerical gradient via finite differences
h = 1e-6;
f = @(v) v'*A*v;
grad_numerical = [(f(x + h*[1;0]) - f(x - h*[1;0])) / (2*h);
                  (f(x + h*[0;1]) - f(x - h*[0;1])) / (2*h)]

% Hessian = 2*A
H = 2*A
disp('Eigenvalues of Hessian (all positive = minimum):')
[V,D] = eig(H)
`,
            },
            {
              id: 2,
              cellTitle: 'Jacobian of a vector function',
              prose: ['The Jacobian J is the matrix of all partial derivatives. Compute it numerically.'],
              code: `% f(x) = [x1^2 + x2; x1*x2] — Jacobian is 2x2
x = [2; 3];
h = 1e-6;

% Analytic Jacobian: [2*x1, 1; x2, x1]
J_analytic = [2*x(1), 1; x(2), x(1)]

% Numerical Jacobian (finite differences, column by column)
f = @(v) [v(1)^2 + v(2); v(1)*v(2)];
J_num = zeros(2,2);
for i = 1:2
  e = zeros(2,1); e(i) = 1;
  J_num(:,i) = (f(x + h*e) - f(x - h*e)) / (2*h);
end
J_numerical = J_num
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Deriving the gradient of the quadratic form.** Let $f(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ where $A$ is $n \\times n$ symmetric. Writing $f = \\sum_{i,j} a_{ij} x_i x_j$, the partial derivative with respect to $x_k$ is $\\partial f / \\partial x_k = \\sum_j a_{kj} x_j + \\sum_i a_{ik} x_i = 2\\sum_j a_{kj} x_j$ (using $a_{kj} = a_{jk}$ for symmetry). In vector form: $\\nabla f = 2A\\mathbf{x}$.',
      '**The least squares normal equation from calculus.** The sum of squared residuals is $\\|A\\mathbf{x} - \\mathbf{b}\\|^2 = (A\\mathbf{x} - \\mathbf{b})^\\top(A\\mathbf{x} - \\mathbf{b})$. Expanding and differentiating: $\\nabla = 2A^\\top(A\\mathbf{x} - \\mathbf{b})$. Setting this to zero gives $A^\\top A \\mathbf{x} = A^\\top \\mathbf{b}$ — the normal equations you derived geometrically in Chapter 4.',
      '**The Jacobian as best linear approximation.** For $\\mathbf{f}: \\mathbb{R}^n \\to \\mathbb{R}^m$, the Jacobian $J$ satisfies $\\mathbf{f}(\\mathbf{x} + \\mathbf{h}) \\approx \\mathbf{f}(\\mathbf{x}) + J\\mathbf{h}$ for small $\\mathbf{h}$. The "derivative" of a vector function at a point is a matrix — the linear map that best approximates the local behavior of $\\mathbf{f}$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Key Identities (Symmetric A)',
        body: '$\\nabla_\\mathbf{x}(\\mathbf{a}^\\top\\mathbf{x}) = \\mathbf{a}$\n$\\nabla_\\mathbf{x}(\\mathbf{x}^\\top A\\mathbf{x}) = 2A\\mathbf{x}$\n$\\nabla_\\mathbf{x}\\|A\\mathbf{x}-\\mathbf{b}\\|^2 = 2A^\\top(A\\mathbf{x}-\\mathbf{b})$',
      },
      {
        type: 'insight',
        title: 'Gradient Descent in One Line',
        body: 'Update rule: $\\mathbf{x}_{k+1} = \\mathbf{x}_k - \\alpha \\nabla f(\\mathbf{x}_k)$\nFor $f = \\|A\\mathbf{x} - \\mathbf{b}\\|^2$: $\\mathbf{x}_{k+1} = \\mathbf{x}_k - 2\\alpha A^\\top(A\\mathbf{x}_k - \\mathbf{b})$\nThis is exactly what neural networks do — backprop computes $\\nabla f$, then the optimizer steps against it.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Code: Gradients, Jacobians, and Hessians',
        mathBridge: 'Compute gradients via finite differences and verify against analytic formulas. For f(x) = x^T A x, the gradient is 2Ax. The Jacobian of a vector-valued function is a matrix of partial derivatives. NumPy does not have a built-in automatic differentiation — use finite differences or JAX/PyTorch for production.',
        caption: 'Numerical gradient verification and the quadratic form gradient formula.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Gradient via finite differences — verify analytic formula',
              prose: [
                'The finite difference approximation: ∂f/∂xᵢ ≈ [f(x + εeᵢ) - f(x)] / ε for small ε.',
                'Compare numerical gradient with the analytic result ∇f = 2Ax for f(x) = x^T A x.',
              ],
              code: `import numpy as np

def numerical_gradient(f, x, eps=1e-6):
    """Compute gradient of f at x via central finite differences."""
    grad = np.zeros_like(x, dtype=float)
    for i in range(len(x)):
        e = np.zeros_like(x, dtype=float)
        e[i] = eps
        grad[i] = (f(x + e) - f(x - e)) / (2 * eps)
    return grad

# Quadratic form f(x) = x^T A x
A = np.array([[3., 1.], [1., 2.]])   # symmetric
f = lambda x: x @ A @ x

x0 = np.array([1.0, 2.0])
grad_numerical = numerical_gradient(f, x0)
grad_analytic  = 2 * A @ x0          # formula: ∇(x^T A x) = 2Ax for symmetric A

print(f"x0 = {x0}")
print(f"Numerical gradient:  {grad_numerical.round(8)}")
print(f"Analytic  gradient:  {grad_analytic.round(8)}")
print(f"Max error: {np.max(np.abs(grad_numerical - grad_analytic)):.2e}")`,
            },
            {
              id: 2,
              cellTitle: 'Jacobian of a vector-valued function',
              prose: [
                'The Jacobian J is an m×n matrix where J[i,j] = ∂f_i/∂x_j.',
                'For f(x) = Ax (linear), the Jacobian is just A itself — the "derivative" of a linear map is the map.',
              ],
              code: `import numpy as np

def numerical_jacobian(f, x, eps=1e-6):
    """Numerical Jacobian of f: R^n -> R^m at x."""
    fx = f(x)
    m, n = len(fx), len(x)
    J = np.zeros((m, n))
    for j in range(n):
        e = np.zeros(n)
        e[j] = eps
        J[:, j] = (f(x + e) - f(x - e)) / (2 * eps)
    return J

# f(x) = A @ x: Jacobian should be A
A = np.array([[1., 2., 0.],
              [0., 3., 1.]])
f_linear = lambda x: A @ x

x0 = np.array([1., 0., -1.])
J_num = numerical_jacobian(f_linear, x0)
print("Numerical Jacobian of Ax:")
print(J_num.round(8))
print("\\nAnalytic Jacobian = A:")
print(A)
print("Match:", np.allclose(J_num, A))`,
            },
            {
              id: 3,
              cellTitle: 'Hessian and Newton\'s method for optimization',
              prose: [
                'Newton\'s method: x_new = x - H^{-1} @ grad. For quadratic f(x) = x^T A x - b^T x, H = 2A and the method converges in ONE step.',
                'For non-quadratic f, Newton\'s method converges quadratically (extremely fast near the minimum).',
              ],
              code: `import numpy as np

# Minimize f(x) = x^T A x - b^T x (quadratic)
# Analytic minimum: x* = (2A)^{-1} b = A^{-1} b / 2... wait
# Actually grad f = 2Ax - b = 0 → x* = A^{-1} b / 2
A = np.array([[4., 1.], [1., 3.]])
b = np.array([2., 1.])
f = lambda x: x @ A @ x - b @ x
grad_f = lambda x: 2 * A @ x - b
H = 2 * A   # Hessian of quadratic form (constant)

# Newton's method: one step because f is quadratic
x0 = np.array([5.0, 5.0])
x_star = x0 - np.linalg.solve(H, grad_f(x0))

print(f"Starting point: {x0}")
print(f"After 1 Newton step: {x_star.round(6)}")
print(f"Gradient at x*: {grad_f(x_star).round(10)}  (should be ≈ 0)")
print(f"f(x*) = {f(x_star):.6f}  (minimum value)")`,
            },
          ]
        }
      },
    ],
  },

  rigor: {
    prose: [
      '**Fréchet derivative — the general framework.** The gradient is a special case of the Fréchet derivative. A function $f: V \\to W$ between normed spaces is Fréchet differentiable at $\\mathbf{x}_0$ if there exists a bounded linear map $Df_{\\mathbf{x}_0}: V \\to W$ such that $\\lim_{\\|\\mathbf{h}\\| \\to 0} \\frac{\\|f(\\mathbf{x}_0 + \\mathbf{h}) - f(\\mathbf{x}_0) - Df_{\\mathbf{x}_0}(\\mathbf{h})\\|}{\\|\\mathbf{h}\\|} = 0$. For $f: \\mathbb{R}^n \\to \\mathbb{R}$, $Df_{\\mathbf{x}_0}$ is represented by $\\nabla f(\\mathbf{x}_0)^\\top$ — a row vector acting on the displacement $\\mathbf{h}$.',
      '**Symmetry of the Hessian — Schwarz\'s theorem.** If the second partial derivatives of $f$ are continuous in a neighborhood of $\\mathbf{x}_0$, then $\\partial^2 f / \\partial x_i \\partial x_j = \\partial^2 f / \\partial x_j \\partial x_i$ for all $i, j$. This makes $H$ symmetric. By the Spectral Theorem, symmetric matrices have real eigenvalues and orthogonal eigenvectors — so the principal curvatures of a smooth function are always real, and the directions of maximum/minimum curvature are orthogonal.',
      '**Taylor expansion and Newton\'s method.** The second-order Taylor expansion of $f: \\mathbb{R}^n \\to \\mathbb{R}$ at $\\mathbf{x}_0$ is $f(\\mathbf{x}_0 + \\mathbf{h}) \\approx f(\\mathbf{x}_0) + \\nabla f(\\mathbf{x}_0)^\\top \\mathbf{h} + \\frac{1}{2}\\mathbf{h}^\\top H(\\mathbf{x}_0) \\mathbf{h}$. Newton\'s method minimizes this quadratic approximation exactly at each step: differentiating and setting to zero gives $H(\\mathbf{x}_0)\\mathbf{h} = -\\nabla f(\\mathbf{x}_0)$, so the Newton step is $\\mathbf{x}_1 = \\mathbf{x}_0 - H^{-1}\\nabla f$. For exactly quadratic $f$, Newton\'s method converges in one step.',
      '**The chain rule as matrix multiplication.** If $\\mathbf{h}(\\mathbf{x}) = \\mathbf{f}(\\mathbf{g}(\\mathbf{x}))$ where $\\mathbf{g}: \\mathbb{R}^p \\to \\mathbb{R}^n$ and $\\mathbf{f}: \\mathbb{R}^n \\to \\mathbb{R}^m$, then the Jacobian of the composition is $J_h = J_f \\cdot J_g$ — a product of matrices. The dimensions work out: $J_f$ is $m \\times n$, $J_g$ is $n \\times p$, and $J_h$ is $m \\times p$. Neural network backpropagation is literally this: the loss gradient propagates backwards through layers via repeated Jacobian matrix multiplication.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Second Derivative Test (Multivariable)',
        body: 'At a critical point $\\nabla f(\\mathbf{x}_0) = \\mathbf{0}$, examine eigenvalues of $H(\\mathbf{x}_0)$:\n• All eigenvalues $> 0$ ($H$ positive definite) → strict local **minimum**\n• All eigenvalues $< 0$ ($H$ negative definite) → strict local **maximum**\n• Mixed signs ($H$ indefinite) → **saddle point**\n• Any eigenvalue $= 0$ ($H$ singular) → test **inconclusive**',
      },
      {
        type: 'theorem',
        title: 'Gradient of a Quadratic Form — Proof',
        body: 'Let $f(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ with $A$ symmetric. Writing $f = \\sum_{i,j} a_{ij}x_ix_j$ and differentiating with respect to $x_k$:\n\n$\\frac{\\partial f}{\\partial x_k} = \\sum_j a_{kj}x_j + \\sum_i a_{ik}x_i = 2\\sum_j a_{kj}x_j$ (since $a_{kj} = a_{jk}$)\n\nIn vector form: $\\nabla f = 2A\\mathbf{x}$. Therefore the Hessian is $H = 2A$ (constant).',
      },
      {
        type: 'insight',
        title: 'Convergence Rate of Gradient Descent',
        body: 'For $f(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x} - \\mathbf{b}^\\top\\mathbf{x}$ with $A$ symmetric positive definite:\n• Gradient descent step size $\\alpha < 1/\\lambda_{\\max}(A)$ guarantees convergence\n• Optimal step: $\\alpha^* = 2/(\\lambda_{\\min} + \\lambda_{\\max})$\n• Convergence rate: $r = (\\kappa - 1)/(\\kappa + 1)$ where $\\kappa = \\lambda_{\\max}/\\lambda_{\\min}$ is the **condition number**\n• Ill-conditioned matrices ($\\kappa \\gg 1$) make gradient descent crawl; Newton\'s method is immune to conditioning.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'la2-009-ex1',
      title: 'Gradient of a Quadratic Form at a Point',
      problem: 'Let $f(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ where $A = \\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}$. Compute $\\nabla f$ symbolically and evaluate at $\\mathbf{x}_0 = \\begin{bmatrix}1\\\\0\\end{bmatrix}$.',
      steps: [
        {
          expression: 'f(\\mathbf{x}) = 2x_1^2 + 2x_1x_2 + 3x_2^2',
          annotation: 'Expand $\\mathbf{x}^\\top A \\mathbf{x} = a_{11}x_1^2 + (a_{12}+a_{21})x_1x_2 + a_{22}x_2^2$. Since $a_{12} = a_{21} = 1$, the cross term is $2x_1x_2$.',
          strategyTitle: 'Expand the quadratic form as a polynomial',
          checkpoint: 'Can you expand x^T A x by hand for this 2×2 case?',
          hints: ['$\\mathbf{x}^\\top A \\mathbf{x} = [x_1,x_2]\\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}\\begin{bmatrix}x_1\\\\x_2\\end{bmatrix} = [x_1,x_2]\\begin{bmatrix}2x_1+x_2\\\\x_1+3x_2\\end{bmatrix} = 2x_1^2 + x_1x_2 + x_1x_2 + 3x_2^2$.'],
        },
        {
          expression: '\\frac{\\partial f}{\\partial x_1} = 4x_1 + 2x_2 \\qquad \\frac{\\partial f}{\\partial x_2} = 2x_1 + 6x_2',
          annotation: 'Differentiate term by term. The cross term $2x_1x_2$ contributes $2x_2$ to $\\partial/\\partial x_1$ and $2x_1$ to $\\partial/\\partial x_2$.',
          strategyTitle: 'Compute each partial derivative',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\nabla f = \\begin{bmatrix}4x_1 + 2x_2\\\\2x_1 + 6x_2\\end{bmatrix} = 2\\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}\\begin{bmatrix}x_1\\\\x_2\\end{bmatrix} = 2A\\mathbf{x}',
          annotation: 'Recognize the pattern: the partial derivatives exactly form $2A\\mathbf{x}$. This confirms the formula $\\nabla(\\mathbf{x}^\\top A \\mathbf{x}) = 2A\\mathbf{x}$ for symmetric $A$.',
          strategyTitle: 'Assemble the gradient and recognize the formula',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\nabla f\\big|_{\\mathbf{x}_0} = 2A\\mathbf{x}_0 = 2\\begin{bmatrix}2&1\\\\1&3\\end{bmatrix}\\begin{bmatrix}1\\\\0\\end{bmatrix} = 2\\begin{bmatrix}2\\\\1\\end{bmatrix} = \\begin{bmatrix}4\\\\2\\end{bmatrix}',
          annotation: 'Evaluate at $\\mathbf{x}_0 = [1,0]^\\top$. Gradient descent from $\\mathbf{x}_0$ would step in the direction $-[4,2]^\\top$.',
          strategyTitle: 'Evaluate numerically',
          checkpoint: 'Does the Hessian of f equal 2A = [[4,2],[2,6]]?',
          hints: ['Yes. For $f = \\mathbf{x}^\\top A \\mathbf{x}$ with symmetric $A$, the Hessian is always $2A$ (a constant matrix, independent of $\\mathbf{x}$).'],
        },
      ],
      conclusion: 'The formula $\\nabla(\\mathbf{x}^\\top A \\mathbf{x}) = 2A\\mathbf{x}$ is confirmed by direct calculation. The Hessian $H = 2A$ is constant — the quadratic form curves the same way everywhere. This appears in least squares, ridge regression, and PCA.',
    },
    {
      id: 'la2-009-ex2',
      title: 'Gradient of the Least-Squares Objective',
      problem: 'Show that $\\nabla_\\mathbf{x} \\|A\\mathbf{x} - \\mathbf{b}\\|^2 = 2A^\\top(A\\mathbf{x} - \\mathbf{b})$. Use this to derive the normal equations.',
      steps: [
        {
          expression: '\\|A\\mathbf{x} - \\mathbf{b}\\|^2 = (A\\mathbf{x} - \\mathbf{b})^\\top(A\\mathbf{x} - \\mathbf{b})',
          annotation: 'The squared norm of a vector $\\mathbf{v}$ is $\\mathbf{v}^\\top\\mathbf{v}$. Let $\\mathbf{v} = A\\mathbf{x} - \\mathbf{b}$.',
          strategyTitle: 'Write the squared norm as a dot product',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '= \\mathbf{x}^\\top A^\\top A\\mathbf{x} - 2\\mathbf{b}^\\top A\\mathbf{x} + \\mathbf{b}^\\top\\mathbf{b}',
          annotation: 'Expand: $(A\\mathbf{x})^\\top(A\\mathbf{x}) - 2\\mathbf{b}^\\top(A\\mathbf{x}) + \\mathbf{b}^\\top\\mathbf{b}$. Note $(A\\mathbf{x})^\\top = \\mathbf{x}^\\top A^\\top$ and $\\mathbf{b}^\\top\\mathbf{b}$ is constant.',
          strategyTitle: 'Expand the product',
          checkpoint: 'Why is the cross term −2b^T Ax (not −b^T Ax − (Ax)^T b)?',
          hints: ['$(\\mathbf{b}^\\top A\\mathbf{x})$ is a scalar, so $(\\mathbf{b}^\\top A\\mathbf{x})^\\top = \\mathbf{b}^\\top A\\mathbf{x}$ — the two cross terms are equal, giving factor 2.'],
        },
        {
          expression: '\\nabla_\\mathbf{x}[\\mathbf{x}^\\top A^\\top A\\mathbf{x}] = 2A^\\top A\\mathbf{x}, \\quad \\nabla_\\mathbf{x}[-2\\mathbf{b}^\\top A\\mathbf{x}] = -2A^\\top\\mathbf{b}',
          annotation: 'Differentiate each term: $\\mathbf{x}^\\top(A^\\top A)\\mathbf{x}$ is a quadratic form with symmetric matrix $A^\\top A$, giving gradient $2A^\\top A\\mathbf{x}$. The term $-2\\mathbf{b}^\\top A\\mathbf{x} = -2(A^\\top\\mathbf{b})^\\top\\mathbf{x}$ is linear with gradient $-2A^\\top\\mathbf{b}$.',
          strategyTitle: 'Apply the gradient rules term by term',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\nabla f = 2A^\\top A\\mathbf{x} - 2A^\\top\\mathbf{b} = 2A^\\top(A\\mathbf{x} - \\mathbf{b})',
          annotation: 'Combine terms and factor out $2A^\\top$.',
          strategyTitle: 'Combine and factor',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\nabla f = \\mathbf{0} \\implies A^\\top A\\mathbf{x} = A^\\top\\mathbf{b} \\quad \\text{(Normal equations)}',
          annotation: 'Setting the gradient to zero gives the normal equations. Any minimizer of the least-squares objective satisfies this linear system. If $A$ has full column rank, $A^\\top A$ is invertible and the unique solution is $\\hat{\\mathbf{x}} = (A^\\top A)^{-1}A^\\top\\mathbf{b}$.',
          strategyTitle: 'Set gradient to zero → normal equations',
          checkpoint: 'Why is A^T A always symmetric? (Hint: transpose rules)',
          hints: ['$(A^\\top A)^\\top = A^\\top(A^\\top)^\\top = A^\\top A$. It equals its own transpose — always symmetric, always positive semidefinite.'],
        },
      ],
      conclusion: 'The gradient of $\\|A\\mathbf{x} - \\mathbf{b}\\|^2$ is $2A^\\top(A\\mathbf{x} - \\mathbf{b})$. Setting this to zero is the calculus condition for a minimum, and it recovers the same normal equations you derive geometrically (orthogonality of the residual). Calculus and geometry agree.',
    },
    {
      id: 'la2-009-ex3',
      title: 'Jacobian of a Nonlinear Vector Function',
      problem: 'Find the Jacobian of $\\mathbf{f}(x_1, x_2) = \\begin{bmatrix}x_1^2 + x_2 \\\\ x_1 x_2\\end{bmatrix}$ and evaluate it at $\\mathbf{x}_0 = \\begin{bmatrix}2\\\\3\\end{bmatrix}$. Use the Jacobian to linearly approximate $\\mathbf{f}(2.1, 3)$.',
      steps: [
        {
          expression: 'J = \\begin{bmatrix}\\partial f_1/\\partial x_1 & \\partial f_1/\\partial x_2 \\\\ \\partial f_2/\\partial x_1 & \\partial f_2/\\partial x_2\\end{bmatrix} = \\begin{bmatrix}2x_1 & 1 \\\\ x_2 & x_1\\end{bmatrix}',
          annotation: 'Row $i$ of the Jacobian contains the partial derivatives of output $f_i$ with respect to each input. $J_{ij} = \\partial f_i / \\partial x_j$.',
          strategyTitle: 'Compute all four partial derivatives',
          checkpoint: 'What is ∂f₂/∂x₁? (f₂ = x₁x₂)',
          hints: ['$\\partial(x_1 x_2)/\\partial x_1 = x_2$ (treat $x_2$ as a constant).'],
        },
        {
          expression: 'J(\\mathbf{x}_0) = \\begin{bmatrix}2(2) & 1 \\\\ 3 & 2\\end{bmatrix} = \\begin{bmatrix}4 & 1 \\\\ 3 & 2\\end{bmatrix}',
          annotation: 'Substitute $\\mathbf{x}_0 = [2,3]^\\top$. The Jacobian is the matrix of the best linear approximation to $\\mathbf{f}$ at this specific point.',
          strategyTitle: 'Evaluate the Jacobian at x₀',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{f}(\\mathbf{x}_0) = \\begin{bmatrix}2^2+3\\\\2 \\cdot 3\\end{bmatrix} = \\begin{bmatrix}7\\\\6\\end{bmatrix}',
          annotation: 'Compute the exact function value at the base point.',
          strategyTitle: 'Evaluate f at x₀',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{f}(2.1, 3) \\approx \\mathbf{f}(\\mathbf{x}_0) + J(\\mathbf{x}_0)\\Delta\\mathbf{x} = \\begin{bmatrix}7\\\\6\\end{bmatrix} + \\begin{bmatrix}4&1\\\\3&2\\end{bmatrix}\\begin{bmatrix}0.1\\\\0\\end{bmatrix} = \\begin{bmatrix}7.4\\\\6.3\\end{bmatrix}',
          annotation: '$\\Delta\\mathbf{x} = [0.1, 0]^\\top$. The linear approximation predicts $f_1 \\approx 7.4$ and $f_2 \\approx 6.3$.',
          strategyTitle: 'Apply linear approximation f(x₀ + Δx) ≈ f(x₀) + J·Δx',
          checkpoint: 'Verify: exact value of f(2.1, 3) is [(2.1)²+3, 2.1·3] = [7.41, 6.3]. How accurate is the approximation?',
          hints: ['Exact: $[7.41, 6.3]$. Predicted: $[7.4, 6.3]$. Error in $f_1$: $0.01$ — the $0.1^2$ quadratic term we dropped. The Jacobian captures the first-order (linear) change perfectly.'],
        },
      ],
      conclusion: 'The Jacobian is the matrix of the best local linear approximation to a vector function. It is evaluated at a point — different points give different Jacobians (unlike for linear maps, where $J = A$ everywhere). In robot kinematics, the Jacobian maps joint velocities to end-effector velocities and is re-evaluated at every time step.',
    },
  ],

  challenges: [
    {
      id: 'la2-009-ch1',
      difficulty: 'easy',
      problem: 'Compute $\\nabla_\\mathbf{x} f$ for $f(\\mathbf{x}) = \\mathbf{c}^\\top\\mathbf{x} + 5$ where $\\mathbf{c} = [1, -2, 4]^\\top$. What is the gradient at $\\mathbf{x} = [0, 0, 0]^\\top$?',
      hint: 'A linear function $\\mathbf{c}^\\top\\mathbf{x} = c_1x_1 + c_2x_2 + c_3x_3$. The constant $+5$ vanishes under differentiation.',
      walkthrough: [
        { expression: 'f(\\mathbf{x}) = c_1x_1 + c_2x_2 + c_3x_3 + 5', annotation: 'Write the linear function component-wise.' },
        { expression: '\\nabla f = \\begin{bmatrix}\\partial f/\\partial x_1\\\\\\partial f/\\partial x_2\\\\\\partial f/\\partial x_3\\end{bmatrix} = \\begin{bmatrix}c_1\\\\c_2\\\\c_3\\end{bmatrix} = \\mathbf{c}', annotation: 'Each partial derivative picks out one component of $\\mathbf{c}$. The constant disappears.' },
        { expression: '\\nabla f\\big|_{\\mathbf{x}=\\mathbf{0}} = \\mathbf{c} = [1,-2,4]^\\top', annotation: 'The gradient of a linear function is constant everywhere — it does not depend on $\\mathbf{x}$.' },
      ],
      answer: '$\\nabla f = \\mathbf{c} = [1,-2,4]^\\top$ everywhere, including at the origin.',
    },
    {
      id: 'la2-009-ch2',
      difficulty: 'medium',
      problem: 'The ridge regression loss is $f(\\mathbf{x}) = \\|A\\mathbf{x} - \\mathbf{b}\\|^2 + \\lambda\\|\\mathbf{x}\\|^2$. (a) Find $\\nabla f$. (b) Find the minimizer $\\hat{\\mathbf{x}}$. (c) What does $\\lambda \\to 0$ and $\\lambda \\to \\infty$ give?',
      hint: 'Use linearity of the gradient: differentiate $\\|A\\mathbf{x} - \\mathbf{b}\\|^2$ (which you computed in Example 2) and $\\lambda\\|\\mathbf{x}\\|^2 = \\lambda\\mathbf{x}^\\top I\\mathbf{x}$ separately, then add.',
      walkthrough: [
        { expression: '\\nabla\\|A\\mathbf{x}-\\mathbf{b}\\|^2 = 2A^\\top(A\\mathbf{x}-\\mathbf{b})', annotation: 'From Example 2.' },
        { expression: '\\nabla(\\lambda\\|\\mathbf{x}\\|^2) = 2\\lambda I\\mathbf{x} = 2\\lambda\\mathbf{x}', annotation: 'Quadratic form with $A = \\lambda I$; gradient is $2\\lambda\\mathbf{x}$.' },
        { expression: '\\nabla f = 2A^\\top(A\\mathbf{x}-\\mathbf{b}) + 2\\lambda\\mathbf{x} = 2(A^\\top A + \\lambda I)\\mathbf{x} - 2A^\\top\\mathbf{b}', annotation: 'Combine and factor.' },
        { expression: '\\hat{\\mathbf{x}} = (A^\\top A + \\lambda I)^{-1}A^\\top\\mathbf{b}', annotation: 'Set $\\nabla f = \\mathbf{0}$ and solve. $A^\\top A + \\lambda I$ is always invertible for $\\lambda > 0$ since all eigenvalues are $\\geq \\lambda > 0$.' },
        { expression: '\\lambda \\to 0: \\hat{\\mathbf{x}} \\to (A^\\top A)^{-1}A^\\top\\mathbf{b} \\text{ (OLS)}; \\quad \\lambda \\to \\infty: \\hat{\\mathbf{x}} \\to \\mathbf{0}', annotation: 'As $\\lambda$ grows, the penalty dominates and shrinks all coefficients toward zero.' },
      ],
      answer: '$\\nabla f = 2(A^\\top A + \\lambda I)\\mathbf{x} - 2A^\\top\\mathbf{b}$; minimizer $\\hat{\\mathbf{x}} = (A^\\top A + \\lambda I)^{-1}A^\\top\\mathbf{b}$.',
    },
    {
      id: 'la2-009-ch3',
      difficulty: 'hard',
      problem: 'A neural network applies $\\mathbf{f}(\\mathbf{x}) = \\sigma(W\\mathbf{x} + \\mathbf{b})$ where $\\sigma$ is applied elementwise. The loss is $L = \\frac{1}{2}\\|\\mathbf{f}(\\mathbf{x}) - \\mathbf{y}\\|^2$. (a) Write the Jacobian $J_f = \\partial\\mathbf{f}/\\partial\\mathbf{x}$. (b) Apply the chain rule to find $\\partial L/\\partial \\mathbf{x}$.',
      hint: 'Let $\\mathbf{z} = W\\mathbf{x} + \\mathbf{b}$. Then $\\mathbf{f} = \\sigma(\\mathbf{z})$. The Jacobian of elementwise $\\sigma$ with respect to $\\mathbf{z}$ is $\\text{diag}(\\sigma\'(z_1), \\ldots, \\sigma\'(z_n))$. The Jacobian of $\\mathbf{z} = W\\mathbf{x}+\\mathbf{b}$ with respect to $\\mathbf{x}$ is $W$.',
      walkthrough: [
        { expression: 'J_{\\mathbf{z}/\\mathbf{x}} = W, \\qquad J_{\\mathbf{f}/\\mathbf{z}} = \\text{diag}(\\sigma\'(z_1), \\ldots, \\sigma\'(z_n)) \\equiv D_\\sigma', annotation: 'The Jacobian of $W\\mathbf{x}+\\mathbf{b}$ w.r.t. $\\mathbf{x}$ is $W$. The Jacobian of elementwise $\\sigma(\\mathbf{z})$ is a diagonal matrix of derivatives.' },
        { expression: 'J_f = J_{\\mathbf{f}/\\mathbf{x}} = J_{\\mathbf{f}/\\mathbf{z}} \\cdot J_{\\mathbf{z}/\\mathbf{x}} = D_\\sigma W', annotation: 'Chain rule: Jacobian of composition = product of Jacobians.' },
        { expression: '\\frac{\\partial L}{\\partial \\mathbf{x}} = J_f^\\top \\nabla_{\\mathbf{f}} L = W^\\top D_\\sigma (\\mathbf{f} - \\mathbf{y})', annotation: 'The gradient of a scalar $L$ with respect to input $\\mathbf{x}$ via vector $\\mathbf{f}$ is $J_f^\\top \\nabla_{\\mathbf{f}} L$. Here $\\nabla_{\\mathbf{f}} L = \\mathbf{f} - \\mathbf{y}$. This is the **backpropagation** formula for one layer.' },
      ],
      answer: '$J_f = D_\\sigma W$ (Jacobian); $\\partial L/\\partial \\mathbf{x} = W^\\top D_\\sigma (\\mathbf{f}(\\mathbf{x}) - \\mathbf{y})$ (gradient). The transpose $W^\\top$ sends the error signal backwards through the weight matrix.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\nabla f(\\mathbf{x}) \\in \\mathbb{R}^n', meaning: 'Gradient: column vector of all partial derivatives of a scalar function $f: \\mathbb{R}^n \\to \\mathbb{R}$. Points in the direction of steepest ascent. Same shape as $\\mathbf{x}$.' },
      { symbol: 'J_f = [\\partial f_i/\\partial x_j] \\in \\mathbb{R}^{m \\times n}', meaning: 'Jacobian: $m \\times n$ matrix of all partial derivatives of a vector function $\\mathbf{f}: \\mathbb{R}^n \\to \\mathbb{R}^m$. Row $i$ is the gradient of $f_i$. The best linear approximation to $\\mathbf{f}$ at a point.' },
      { symbol: 'H_{ij} = \\partial^2 f/\\partial x_i \\partial x_j \\in \\mathbb{R}^{n \\times n}', meaning: 'Hessian: $n \\times n$ matrix of second partial derivatives of a scalar $f: \\mathbb{R}^n \\to \\mathbb{R}$. Always symmetric (by Schwarz). Eigenvalues are principal curvatures.' },
      { symbol: '\\nabla(\\mathbf{x}^\\top A\\mathbf{x}) = 2A\\mathbf{x}', meaning: 'Gradient of a quadratic form with symmetric $A$. The Hessian is $2A$ (constant). This is the single most important identity in applied matrix calculus.' },
      { symbol: '\\nabla\\|A\\mathbf{x}-\\mathbf{b}\\|^2 = 2A^\\top(A\\mathbf{x}-\\mathbf{b})', meaning: 'Gradient of the least-squares objective. Setting this to zero gives the normal equations $A^\\top A\\mathbf{x} = A^\\top\\mathbf{b}$.' },
    ],
    rulesOfThumb: [
      'Gradient shape = input shape. Jacobian shape = (output dim) × (input dim).',
      'The gradient of a constant is zero; of a linear function $\\mathbf{a}^\\top\\mathbf{x}$ is $\\mathbf{a}$; of $\\mathbf{x}^\\top A\\mathbf{x}$ is $2A\\mathbf{x}$.',
      'Hessian = 2A for quadratic forms. If $H$ is positive definite at a critical point → minimum.',
      'Chain rule for vector functions: $J_{h} = J_f \\cdot J_g$. This is backpropagation.',
      'To find a minimum, set $\\nabla f = \\mathbf{0}$ and check $H$ is positive definite.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'la2-007', label: 'Special Matrices', note: 'The Hessian is always symmetric. Review why symmetric matrices have real eigenvalues and an orthonormal eigenbasis (Spectral Theorem) — this underlies the second derivative test.' },
      { lessonId: 'la2-005', label: 'Determinants', note: 'The Jacobian determinant (det of the Jacobian) measures local volume scaling. It appears in change-of-variables for multivariable integrals and in the Inverse Function Theorem.' },
    ],
    futureLinks: [
      { lessonId: 'la4-003', label: 'Least Squares via Projection', note: 'The normal equations $A^\\top A\\mathbf{x} = A^\\top\\mathbf{b}$ arise here from the gradient condition. In Chapter 4 you will derive the same equations geometrically via orthogonal projection.' },
      { lessonId: 'la3-001', label: 'Eigenvalues', note: 'The second derivative test for multivariable functions checks whether all eigenvalues of $H$ have the same sign. Eigenvalues are defined and computed in Chapter 3.' },
      { lessonId: 'la9-001', label: 'Singular Value Decomposition', note: 'The SVD of $A$ diagonalizes $A^\\top A$, revealing its eigenvalues (squared singular values). These eigenvalues determine how fast gradient descent converges on $\\|A\\mathbf{x}-\\mathbf{b}\\|^2$.' },
    ],
  },

  mentalModel: [
    'Gradient = the derivative of a scalar function; it is a column vector the same size as the input.',
    'Jacobian = the derivative of a vector function; it is a matrix (output rows × input columns).',
    'Hessian = the second derivative of a scalar function; it is always symmetric.',
    '$\\nabla(\\mathbf{x}^\\top A\\mathbf{x}) = 2A\\mathbf{x}$, $H = 2A$ — memorize this for quadratic forms.',
    'Chain rule for matrices = matrix product of Jacobians. Backpropagation is exactly this.',
    'To minimize $f$: set $\\nabla f = 0$, then check $H$ is positive definite at the solution.',
  ],

  checkpoints: [
    { id: 'cp-la2-009-1', label: 'Read intuition — understand gradient vs Jacobian vs Hessian and their shapes', type: 'read' },
    { id: 'cp-la2-009-2', label: 'Read math — derive $\\nabla(\\mathbf{x}^\\top A\\mathbf{x}) = 2A\\mathbf{x}$ and the normal equations step by step', type: 'read' },
    { id: 'cp-la2-009-3', label: 'Read rigor — understand Fréchet derivative, Schwarz theorem, and Newton\'s method', type: 'read' },
    { id: 'cp-la2-009-4', label: 'Run OpenMAT cell 1 — verify gradient numerically via finite differences', type: 'lab' },
    { id: 'cp-la2-009-5', label: 'Run Python cell 2 — verify Jacobian of a linear map numerically', type: 'lab' },
    { id: 'cp-la2-009-6', label: 'Complete example 1: compute gradient of a quadratic form step by step', type: 'example' },
    { id: 'cp-la2-009-7', label: 'Complete example 2: derive the normal equations via the gradient condition', type: 'example' },
    { id: 'cp-la2-009-8', label: 'Attempt challenge 2: ridge regression gradient and minimizer', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'la2-009-assess-1',
        type: 'choice',
        text: 'The loss function $f(\\mathbf{w}) = \\|X\\mathbf{w} - \\mathbf{y}\\|^2$ has gradient $\\nabla f = ?$. Setting this to zero gives the ridge regression normal equations when which regularization term is added?',
        options: [
          '$\\nabla f = 2X\\mathbf{w} - 2\\mathbf{y}$; add $\\lambda\\|\\mathbf{w}\\|^2$',
          '$\\nabla f = 2X^\\top(X\\mathbf{w} - \\mathbf{y})$; add $\\lambda\\|\\mathbf{w}\\|^2$',
          '$\\nabla f = X^\\top X\\mathbf{w}$; add $\\lambda X^\\top\\mathbf{y}$',
          '$\\nabla f = 2(X\\mathbf{w} - \\mathbf{y})$; no regularization needed',
        ],
        answer: '$\\nabla f = 2X^\\top(X\\mathbf{w} - \\mathbf{y})$; add $\\lambda\\|\\mathbf{w}\\|^2$',
        hint: 'Apply the formula $\\nabla\\|A\\mathbf{x}-\\mathbf{b}\\|^2 = 2A^\\top(A\\mathbf{x}-\\mathbf{b})$ with $A = X$, $\\mathbf{x} = \\mathbf{w}$, $\\mathbf{b} = \\mathbf{y}$. Ridge regression adds $\\lambda\\|\\mathbf{w}\\|^2$ to penalize large weights.',
      },
    ],
  },

  quiz: [
    {
      id: 'la2-009-quiz-1',
      type: 'choice',
      text: 'The gradient $\\nabla f(\\mathbf{x})$ of a scalar function $f: \\mathbb{R}^n \\to \\mathbb{R}$ is:',
      options: [
        'A scalar.',
        'An $n$-dimensional column vector.',
        'An $n \\times n$ matrix.',
        'A row vector of shape $1 \\times n$.',
      ],
      answer: 'An $n$-dimensional column vector.',
      hints: ['The gradient has the same shape as the input $\\mathbf{x}$. For $f: \\mathbb{R}^n \\to \\mathbb{R}$, input is $n$-dimensional, so gradient is an $n \\times 1$ column vector. (Some sources write it as a row vector — numerator layout — but we use denominator layout.)'],
      reviewSection: 'Intuition tab — gradient definition',
    },
    {
      id: 'la2-009-quiz-2',
      type: 'choice',
      text: 'The Jacobian of $\\mathbf{f}: \\mathbb{R}^5 \\to \\mathbb{R}^3$ is a matrix of shape:',
      options: ['$5 \\times 3$', '$3 \\times 5$', '$5 \\times 5$', '$3 \\times 3$'],
      answer: '$3 \\times 5$',
      hints: ['Row $i$ of the Jacobian is $\\nabla f_i^\\top$ — one row per output. Column $j$ corresponds to derivative w.r.t. input $x_j$ — one column per input. So shape = (# outputs) × (# inputs) = $m \\times n = 3 \\times 5$.'],
      reviewSection: 'Intuition tab — Jacobian definition',
    },
    {
      id: 'la2-009-quiz-3',
      type: 'choice',
      text: 'For $f(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ with $A$ symmetric, the gradient $\\nabla f$ is:',
      options: ['$A\\mathbf{x}$', '$2A\\mathbf{x}$', '$A^\\top\\mathbf{x} + A\\mathbf{x}$', '$\\mathbf{x}^\\top A$'],
      answer: '$2A\\mathbf{x}$',
      hints: ['For symmetric $A$ (so $a_{ij} = a_{ji}$), differentiating $\\sum_{i,j} a_{ij}x_ix_j$ with respect to $x_k$ gives $2\\sum_j a_{kj}x_j = 2(A\\mathbf{x})_k$. The formula $(A+A^\\top)\\mathbf{x} = 2A\\mathbf{x}$ also works for the non-symmetric case.'],
      reviewSection: 'Rigor tab — Gradient of a Quadratic Form theorem',
    },
    {
      id: 'la2-009-quiz-4',
      type: 'choice',
      text: 'Why is the Hessian matrix always symmetric?',
      options: [
        'Because $A^\\top A$ is always symmetric.',
        'By Schwarz\'s theorem: mixed partial derivatives commute ($\\partial^2 f/\\partial x_i \\partial x_j = \\partial^2 f/\\partial x_j \\partial x_i$) when they are continuous.',
        'Because all matrices of second derivatives are symmetric by definition.',
        'Because the gradient is a vector, and vectors have symmetric outer products.',
      ],
      answer: 'By Schwarz\'s theorem: mixed partial derivatives commute ($\\partial^2 f/\\partial x_i \\partial x_j = \\partial^2 f/\\partial x_j \\partial x_i$) when they are continuous.',
      hints: ['$H_{ij} = \\partial^2 f/\\partial x_i \\partial x_j$ and $H_{ji} = \\partial^2 f/\\partial x_j \\partial x_i$. Schwarz\'s theorem says these are equal when second partials are continuous. So $H_{ij} = H_{ji}$, meaning $H = H^\\top$.'],
      reviewSection: 'Rigor tab — Symmetry of the Hessian',
    },
    {
      id: 'la2-009-quiz-5',
      type: 'choice',
      text: 'At a critical point $\\nabla f = \\mathbf{0}$, the Hessian has eigenvalues $[5, -2, 3]$. What type of critical point is this?',
      options: ['Local minimum', 'Local maximum', 'Saddle point', 'Cannot determine without more information'],
      answer: 'Saddle point',
      hints: ['Eigenvalues $[5, -2, 3]$ have mixed signs (positive 5, negative -2, positive 3). The Hessian is indefinite. An indefinite Hessian at a critical point means the function increases in some directions and decreases in others — a saddle point.'],
      reviewSection: 'Rigor tab — Second Derivative Test theorem',
    },
    {
      id: 'la2-009-quiz-6',
      type: 'choice',
      text: 'Backpropagation in neural networks is mathematically equivalent to:',
      options: [
        'Solving a linear system $A\\mathbf{x} = \\mathbf{b}$ for each layer.',
        'Computing the matrix inverse of each weight matrix.',
        'Applying the chain rule — multiplying Jacobians in reverse order through the network layers.',
        'Running LU decomposition on the weight matrices.',
      ],
      answer: 'Applying the chain rule — multiplying Jacobians in reverse order through the network layers.',
      hints: ['Each layer is a function. The loss gradient w.r.t. the first layer\'s input is $J_1^\\top J_2^\\top \\cdots J_L^\\top \\nabla_{\\text{output}} L$ — the chain rule applied in reverse (backpropagation). Each $J_k^\\top$ is a transposed weight matrix times a diagonal activation derivative matrix.'],
      reviewSection: 'Rigor tab — Chain Rule as Matrix Multiplication',
    },
    {
      id: 'la2-009-quiz-7',
      type: 'choice',
      text: 'For $f(\\mathbf{x}) = \\mathbf{a}^\\top\\mathbf{x}$ with constant $\\mathbf{a} \\in \\mathbb{R}^n$, the gradient $\\nabla f$ and Hessian $H$ are:',
      options: [
        '$\\nabla f = \\mathbf{a}$, $H = \\mathbf{a}\\mathbf{a}^\\top$',
        '$\\nabla f = \\mathbf{a}$, $H = 0$ (zero matrix)',
        '$\\nabla f = \\mathbf{a}^\\top$, $H = I$',
        '$\\nabla f = \\|\\mathbf{a}\\|$, $H = 0$',
      ],
      answer: '$\\nabla f = \\mathbf{a}$, $H = 0$ (zero matrix)',
      hints: ['$\\mathbf{a}^\\top\\mathbf{x} = a_1x_1 + \\cdots + a_nx_n$. Each partial $\\partial f/\\partial x_k = a_k$, so $\\nabla f = \\mathbf{a}$. The gradient is constant, so all second partials are zero: $H = 0$.'],
      reviewSection: 'Intuition tab — critical formulas',
    },
    {
      id: 'la2-009-quiz-8',
      type: 'choice',
      text: 'The Jacobian of $\\mathbf{f}(\\mathbf{x}) = A\\mathbf{x}$ (a linear map) is:',
      options: [
        'The matrix $A^\\top$',
        'The matrix $A$ itself',
        'The identity matrix $I$',
        'The matrix $A^\\top A$',
      ],
      answer: 'The matrix $A$ itself',
      hints: ['$f_i(\\mathbf{x}) = \\sum_j a_{ij} x_j$, so $\\partial f_i/\\partial x_j = a_{ij}$. The Jacobian entry $(i,j)$ is exactly $a_{ij}$. The Jacobian of a linear map is the map itself — $J = A$.'],
      reviewSection: 'Examples tab — Example 3 (Jacobian of a vector function)',
    },
    {
      id: 'la2-009-quiz-9',
      type: 'choice',
      text: 'You minimize $f(\\mathbf{x}) = \\|A\\mathbf{x} - \\mathbf{b}\\|^2$ by setting $\\nabla f = \\mathbf{0}$. The resulting system is:',
      options: [
        '$A\\mathbf{x} = \\mathbf{b}$',
        '$A^\\top A\\mathbf{x} = A^\\top\\mathbf{b}$',
        '$AA^\\top\\mathbf{x} = A\\mathbf{b}$',
        '$A^\\top\\mathbf{x} = \\mathbf{b}$',
      ],
      answer: '$A^\\top A\\mathbf{x} = A^\\top\\mathbf{b}$',
      hints: ['$\\nabla f = 2A^\\top(A\\mathbf{x} - \\mathbf{b}) = \\mathbf{0}$ gives $A^\\top A\\mathbf{x} = A^\\top\\mathbf{b}$. These are the normal equations of least squares. The factor of 2 cancels when you divide both sides.'],
      reviewSection: 'Math tab — least squares normal equation',
    },
    {
      id: 'la2-009-quiz-10',
      type: 'choice',
      text: 'For gradient descent on $f(\\mathbf{x}) = \\mathbf{x}^\\top A\\mathbf{x}$ (symmetric positive definite $A$), convergence slows when:',
      options: [
        'The matrix $A$ is large (high dimension).',
        'The condition number $\\kappa = \\lambda_{\\max}/\\lambda_{\\min}$ is much larger than 1.',
        'The gradient at the starting point is small.',
        'The learning rate $\\alpha$ is exactly $1/\\lambda_{\\max}$.',
      ],
      answer: 'The condition number $\\kappa = \\lambda_{\\max}/\\lambda_{\\min}$ is much larger than 1.',
      hints: ['Convergence rate per step is $(\\kappa-1)/(\\kappa+1)$. When $\\kappa \\gg 1$ (ill-conditioned), this is close to 1, meaning each step barely reduces the error. The function is elongated like an ellipse: gradient descent zigzags along the long axis instead of heading straight to the minimum.'],
      reviewSection: 'Rigor tab — Convergence Rate callout',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'The gradient of $f(\\mathbf{x})$ is a row vector (same as $\\mathbf{x}^\\top$).',
      whyStudentsThinkIt: 'Many ML papers and textbooks use numerator layout, where $\\nabla f$ is written as a row vector so that $df = \\nabla f \\, d\\mathbf{x}$ is a scalar product of two row/column vectors. This convention switch causes confusion when switching resources.',
      correctionExample: 'In denominator layout (used here), $\\nabla f \\in \\mathbb{R}^n$ is a column vector — same shape as $\\mathbf{x}$. At $\\mathbf{x} = [1,2]^\\top$ with $f(\\mathbf{x}) = 3x_1 + x_2$, $\\nabla f = [3, 1]^\\top$ (column). The gradient update $\\mathbf{x} \\leftarrow \\mathbf{x} - \\alpha\\nabla f$ must be column minus column.',
      contrastCase: 'The Fréchet derivative $Df_{\\mathbf{x}_0}$ acts as a linear functional on displacement vectors $\\mathbf{h}$, so it is naturally a row vector $\\nabla f^\\top$. The gradient itself is the column vector obtained by transposing this row.',
    },
    {
      falseBelief: 'The Hessian $H = \\nabla^2 f$ is the derivative of the gradient vector — so it should be a vector, not a matrix.',
      whyStudentsThinkIt: 'Students apply 1D intuition: the second derivative of $f(x)$ is a scalar. In multiple dimensions the "derivative of the gradient" is the Jacobian of the gradient map $\\nabla f: \\mathbb{R}^n \\to \\mathbb{R}^n$, which is an $n \\times n$ matrix.',
      correctionExample: 'For $f(\\mathbf{x}) = x_1^2 + 3x_1x_2 + x_2^2$, $\\nabla f = [2x_1 + 3x_2, 3x_1 + 2x_2]^\\top$. The Hessian is $H = \\begin{bmatrix}2&3\\\\3&2\\end{bmatrix}$ — the Jacobian of $\\nabla f$. Entry $H_{ij} = \\partial^2 f/\\partial x_i\\partial x_j$.',
      contrastCase: 'For a truly linear function $f(\\mathbf{x}) = \\mathbf{c}^\\top\\mathbf{x}$, the gradient is constant $\\nabla f = \\mathbf{c}$, so its Jacobian (the Hessian) is the zero matrix — analogous to how the second derivative of a linear 1D function is zero.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You are calibrating a camera. The reprojection error $E(\\boldsymbol{\\theta}) = \\sum_i \\|\\mathbf{p}_i - \\hat{\\mathbf{p}}_i(\\boldsymbol{\\theta})\\|^2$ is a nonlinear function of camera parameters $\\boldsymbol{\\theta}$. You want to minimize $E$ using Gauss-Newton.',
      competingTechniques: 'Gradient descent (first-order, slow near minimum), Gauss-Newton (approximate Hessian using Jacobian $J^\\top J$), full Newton\'s method (exact Hessian, expensive to compute).',
      whyThisTechniqueWins: 'Gauss-Newton approximates the Hessian as $J^\\top J$ where $J = \\partial\\hat{\\mathbf{p}}/\\partial\\boldsymbol{\\theta}$ is the Jacobian of the prediction function. This avoids second-derivative computation while achieving near-quadratic convergence near the optimum — exploiting matrix calculus knowledge about Jacobians and normal equations.',
    },
    {
      situation: 'A physical simulation tracks how a particle\'s position $\\mathbf{p}(t)$ evolves. You need to propagate uncertainty: if initial position has covariance $\\Sigma_0$, what is the covariance $\\Sigma_t$ at time $t$?',
      competingTechniques: 'Monte Carlo sampling (simulate many particles, expensive), linearization via Jacobian (first-order approximation, cheap), unscented transform (sigma-point approximation, moderate cost).',
      whyThisTechniqueWins: 'The extended Kalman filter uses the Jacobian $J = \\partial\\mathbf{p}_t/\\partial\\mathbf{p}_0$ to propagate uncertainty: $\\Sigma_t \\approx J\\Sigma_0 J^\\top$. This covariance propagation formula is exactly the Jacobian-as-linear-approximation idea — the local linearization of the dynamics maps the uncertainty ellipsoid forward in time.',
    },
  ],

  debugging: [
    {
      commonError: 'Forgetting the transpose in the least-squares gradient: writing $\\nabla\\|A\\mathbf{x}-\\mathbf{b}\\|^2 = 2A(A\\mathbf{x}-\\mathbf{b})$ instead of $2A^\\top(A\\mathbf{x}-\\mathbf{b})$.',
      symptom: 'The resulting normal equations $AA\\mathbf{x} = A\\mathbf{b}$ have dimension mismatch if $A$ is not square: $A$ is $m\\times n$, $A(A\\mathbf{x}-\\mathbf{b})$ would require multiplying an $m\\times n$ matrix by an $m$-vector — dimension error.',
      whyItHappened: 'The chain rule for $\\|\\mathbf{v}\\|^2 = \\mathbf{v}^\\top\\mathbf{v}$ gives gradient $2\\mathbf{v}$ with respect to $\\mathbf{v}$, but then the chain rule through $\\mathbf{v} = A\\mathbf{x}$ introduces $A^\\top$ (the Jacobian of $A\\mathbf{x}$ w.r.t. $\\mathbf{x}$ transposed): $\\partial/\\partial\\mathbf{x}[\\mathbf{v}(\\mathbf{x})^\\top\\mathbf{v}(\\mathbf{x})] = 2(\\partial\\mathbf{v}/\\partial\\mathbf{x})^\\top\\mathbf{v} = 2A^\\top\\mathbf{v}$.',
      repairStrategy: 'Always check dimension consistency. The gradient must be in $\\mathbb{R}^n$ (same as $\\mathbf{x}$). $A^\\top(A\\mathbf{x}-\\mathbf{b})$: $A^\\top$ is $n\\times m$, $(A\\mathbf{x}-\\mathbf{b})$ is $m\\times 1$, product is $n\\times 1$. Dimensions match.',
    },
    {
      commonError: 'Applying the formula $\\nabla(\\mathbf{x}^\\top A\\mathbf{x}) = 2A\\mathbf{x}$ when $A$ is not symmetric, getting a wrong gradient.',
      symptom: 'The gradient computed symbolically disagrees with numerical finite differences. For non-symmetric $A$, the formula gives $2A\\mathbf{x}$ but the correct answer is $(A + A^\\top)\\mathbf{x}$.',
      whyItHappened: 'The derivation $\\partial f/\\partial x_k = \\sum_j a_{kj}x_j + \\sum_i a_{ik}x_i = 2\\sum_j a_{kj}x_j$ uses $a_{kj} = a_{jk}$ (symmetry) to combine the two sums. Without symmetry, the two sums give different terms: $(A\\mathbf{x})_k$ and $(A^\\top\\mathbf{x})_k$.',
      repairStrategy: 'Either symmetrize first: $\\mathbf{x}^\\top A\\mathbf{x} = \\mathbf{x}^\\top\\frac{A+A^\\top}{2}\\mathbf{x}$ (the antisymmetric part cancels), then apply the formula. Or use the general identity $\\nabla(\\mathbf{x}^\\top A\\mathbf{x}) = (A + A^\\top)\\mathbf{x}$, which reduces to $2A\\mathbf{x}$ when $A = A^\\top$.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Compute the gradient and Hessian of a quadratic form $\\mathbf{x}^\\top A\\mathbf{x} + \\mathbf{b}^\\top\\mathbf{x} + c$ using the memorized formulas, and minimize it by setting $\\nabla f = 0$.',
    explainVerbally: 'Explain the difference between gradient (scalar→vector derivative), Jacobian (vector→vector derivative), and Hessian (second-order scalar derivative), including their shapes and what they represent geometrically.',
    detectIncorrectApplication: 'Spot when someone writes the gradient as a row vector instead of a column vector, or forgets the transpose $A^\\top$ in the least-squares gradient, or applies the symmetric formula to a non-symmetric $A$.',
    transferToUnfamiliar: 'Derive the gradient of a new loss function (e.g., logistic loss, Frobenius norm) by expanding it into known forms and applying the chain rule and standard identities.',
  },
};
