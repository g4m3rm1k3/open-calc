export default {
  id: 'la2-009',
  slug: 'matrix-calculus',
  chapter: 'la2',
  order: 9,
  title: 'Matrix Calculus: Gradients, Jacobians, and Hessians',
  subtitle: 'When calculus meets linear algebra — every gradient is a row vector, every Jacobian is a matrix, and every Hessian is symmetric.',
  tags: ['gradient', 'Jacobian', 'Hessian', 'matrix calculus', 'chain rule', 'partial derivatives', 'optimization'],
  aliases: 'gradient Jacobian Hessian matrix calculus partial derivatives chain rule optimization vector calculus',

  hook: {
    question: "Neural networks adjust millions of weights using calculus on vectors. How do you take the derivative of a function whose input is an entire matrix?",
    realWorldContext: "Every machine learning algorithm ultimately does calculus on vectors and matrices. The gradient of a loss function tells you which direction to step to reduce error. The Jacobian tells you how a transformation stretches space locally — GPS systems use it to map sensor noise through nonlinear coordinate transforms. The Hessian tells you the curvature of a surface — Newton\'s method for optimization uses it to jump straight to a minimum instead of crawling with gradient descent. Understanding matrix calculus is the difference between being able to derive these algorithms from scratch and just copying formulas from a textbook.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Derivatives of scalars with respect to vectors — the gradient.** If $f(\\mathbf{x})$ maps a vector $\\mathbf{x} \\in \\mathbb{R}^n$ to a scalar, the gradient $\\nabla f$ is a column vector of partial derivatives: $\\nabla f = \\bigl[\\partial f/\\partial x_1, \\ldots, \\partial f/\\partial x_n\\bigr]^\\top$. The gradient points in the direction of steepest ascent. Gradient descent moves opposite to it.',
      '**Derivatives of vectors with respect to vectors — the Jacobian.** If $\\mathbf{f}(\\mathbf{x})$ maps $\\mathbf{x} \\in \\mathbb{R}^n$ to $\\mathbf{f} \\in \\mathbb{R}^m$, the Jacobian $J$ is an $m \\times n$ matrix where $J_{ij} = \\partial f_i / \\partial x_j$. The Jacobian is the best linear approximation to $\\mathbf{f}$ at a point — the multivariable analogue of the single-variable derivative.',
      '**The Hessian — second-order information.** For a scalar function $f: \\mathbb{R}^n \\to \\mathbb{R}$, the Hessian $H$ is the $n \\times n$ matrix of second partial derivatives: $H_{ij} = \\partial^2 f / \\partial x_i \\partial x_j$. By Schwarz\'s theorem, the Hessian is always symmetric ($H = H^\\top$). Its eigenvalues tell you the curvature in each principal direction. Positive definite Hessian → local minimum. Indefinite Hessian → saddle point.',
      '**Two critical formulas to memorize.** For $f(\\mathbf{x}) = \\mathbf{a}^\\top \\mathbf{x}$ (linear), the gradient is $\\nabla f = \\mathbf{a}$. For $f(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ (quadratic form with symmetric $A$), the gradient is $\\nabla f = 2A\\mathbf{x}$, and the Hessian is $H = 2A$. These two formulas appear everywhere in statistics (least squares), physics (energy), and ML (loss functions).',
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
      '**Fréchet derivative.** The gradient is a special case of the Fréchet derivative. A function $f: V \\to W$ between normed spaces is Fréchet differentiable at $x$ if there exists a bounded linear map $Df_x: V \\to W$ such that $\\|f(x+h) - f(x) - Df_x(h)\\| = o(\\|h\\|)$. For $f: \\mathbb{R}^n \\to \\mathbb{R}$, $Df_x$ is represented by $\\nabla f(x)^\\top$ acting on column vectors.',
      '**Symmetry of the Hessian.** By Schwarz\'s theorem, if the second partial derivatives of $f$ are continuous, then $\\partial^2 f / \\partial x_i \\partial x_j = \\partial^2 f / \\partial x_j \\partial x_i$ for all $i, j$. This makes $H$ symmetric. The eigenvalues of a symmetric matrix are real, so the principal curvatures of a smooth function are always real numbers.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Second Derivative Test (Multivariable)',
        body: 'At a critical point $\\nabla f = 0$:\n• $H$ positive definite → strict local minimum\n• $H$ negative definite → strict local maximum\n• $H$ indefinite → saddle point\n• $H$ singular → test inconclusive',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la2-009-1',
      title: 'Gradient of the squared norm',
      problem: 'Compute $\\nabla_\\mathbf{x} \\|\\mathbf{x}\\|^2$.',
      solution: '$\\|\\mathbf{x}\\|^2 = \\mathbf{x}^\\top I \\mathbf{x}$. Using the quadratic form rule with $A = I$: $\\nabla = 2I\\mathbf{x} = 2\\mathbf{x}$.',
    },
    {
      id: 'ex-la2-009-2',
      title: 'Jacobian of an affine map',
      problem: 'Find the Jacobian of $\\mathbf{f}(\\mathbf{x}) = A\\mathbf{x} + \\mathbf{b}$.',
      solution: 'The Jacobian is just $A$. Affine maps have constant Jacobians — they are their own best linear approximation everywhere.',
    },
  ],

  challenges: [
    {
      id: 'ch-la2-009-1',
      title: 'Ridge regression gradient',
      difficulty: 'medium',
      prompt: 'The ridge regression loss is $f(\\mathbf{x}) = \\|A\\mathbf{x} - \\mathbf{b}\\|^2 + \\lambda\\|\\mathbf{x}\\|^2$. Find $\\nabla f$ and the minimizer.',
      hint: 'Differentiate each term separately. The minimizer satisfies $\\nabla f = 0$.',
      solution: '$\\nabla f = 2A^\\top(A\\mathbf{x} - \\mathbf{b}) + 2\\lambda\\mathbf{x}$. Setting to zero: $(A^\\top A + \\lambda I)\\mathbf{x} = A^\\top \\mathbf{b}$.',
    },
  ],

  mentalModel: [
    'The gradient is a column vector pointing uphill — gradient descent steps the opposite direction.',
    'The Jacobian is the matrix of all partial derivatives — it linearizes a vector function locally.',
    'The Hessian is always symmetric — its eigenvalues are the principal curvatures.',
    'For quadratic $f = \\mathbf{x}^\\top A \\mathbf{x}$: gradient is $2A\\mathbf{x}$, Hessian is $2A$.',
  ],

  checkpoints: [
    { id: 'cp-la2-009-1', question: 'What is $\\nabla_\\mathbf{x}(\\mathbf{a}^\\top\\mathbf{x})$?', answer: '$\\mathbf{a}$' },
    { id: 'cp-la2-009-2', question: 'What shape is the Jacobian of $\\mathbf{f}: \\mathbb{R}^n \\to \\mathbb{R}^m$?', answer: '$m \\times n$' },
    { id: 'cp-la2-009-3', question: 'Why is the Hessian symmetric?', answer: 'By Schwarz\'s theorem: mixed partials commute.' },
  ],

  assessment: 'Derive the gradient of the least-squares objective $\\|A\\mathbf{x} - \\mathbf{b}\\|^2$ and show it leads to the normal equations $A^\\top A \\mathbf{x} = A^\\top \\mathbf{b}$.',

  quiz: [
    { id: 'q-la2-009-1', question: 'The gradient of $f(\\mathbf{x}) = \\mathbf{x}^\\top A \\mathbf{x}$ (symmetric $A$) is:', options: ['$A\\mathbf{x}$', '$2A\\mathbf{x}$', '$A^\\top \\mathbf{x} + A\\mathbf{x}$', '$\\mathbf{x}^\\top A$'], answer: '$2A\\mathbf{x}$' },
    { id: 'q-la2-009-2', question: 'The Jacobian of a map $\\mathbf{f}: \\mathbb{R}^3 \\to \\mathbb{R}^2$ is a matrix of shape:', options: ['$3 \\times 2$', '$2 \\times 3$', '$2 \\times 2$', '$3 \\times 3$'], answer: '$2 \\times 3$' },
    { id: 'q-la2-009-3', question: 'A positive definite Hessian at a critical point indicates:', options: ['saddle point', 'local maximum', 'local minimum', 'inflection point'], answer: 'local minimum' },
  ],
};
