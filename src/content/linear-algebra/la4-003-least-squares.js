export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la4-003',
  slug: 'least-squares',
  chapter: 'la4',
  order: 3,
  title: 'Least Squares',
  subtitle: 'When the exact answer does not exist, find the best approximate answer — the foundation of data fitting and linear regression.',
  tags: ['least squares', 'normal equations', 'overdetermined system', 'linear regression', 'projection', 'best approximation', 'curve fitting'],
  aliases: 'least squares regression best fit line normal equations overdetermined inconsistent approximate solution data fitting',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "You have 100 data points and want to fit a line through them — but no line passes through all 100 exactly. What does 'the best line' even mean, and how do you find it?",
    realWorldContext: "Least squares is one of the most widely used ideas in all of applied mathematics. It is the engine behind linear regression in statistics, GPS position estimation, computer vision, signal processing, and machine learning. Any time you have more constraints than unknowns — more data than parameters — and want the 'best fit,' you are solving a least squares problem. Carl Friedrich Gauss used it in 1801 to predict the orbit of the asteroid Ceres from just a handful of observations. Scientists still use the same idea today.",
    previewVisualizationId: 'LeastSquaresFit',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** You know how to solve $A\\mathbf{x} = \\mathbf{b}$ exactly (when a solution exists), and you know how to project a vector onto a subspace. Now you need to handle the case when no solution exists — which happens constantly in the real world.',
      'When you have more equations than unknowns, the system is called **overdetermined**. Think of fitting a line to 100 data points: you have 100 equations ($y_i = ax_i + b$) but only 2 unknowns ($a$ and $b$). Almost certainly, no single line passes through all 100 points. The system has no solution.',
      '**The geometric picture.** The target vector $\\mathbf{b}$ (your data) does not lie in the column space of $A$. No matter what $\\mathbf{x}$ you pick, $A\\mathbf{x}$ can only reach points in the column space. The best you can do is get as close as possible — meaning: find the point $A\\hat{\\mathbf{x}}$ in the column space that is closest to $\\mathbf{b}$. That closest point is the orthogonal projection of $\\mathbf{b}$ onto the column space.',
      'The error vector $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ is the residual — the gap between your best approximation and the actual target. The least squares solution minimizes $\\|\\mathbf{e}\\|^2$ (the sum of squared errors), which is where the name comes from.',
      '**The key insight.** The residual $\\mathbf{e}$ is perpendicular to every column of $A$. This is not a coincidence — it is the defining property of orthogonal projection. The residual points in the direction you cannot reach, which is exactly perpendicular to the column space.',
      'Saying "$\\mathbf{e}$ is perpendicular to every column of $A$" is the same as saying $A^T\\mathbf{e} = \\mathbf{0}$. Substituting $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ gives the famous **normal equations**: $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$.',
      '**Where this is heading:** The least squares solution is the workhorse of data science. When you learn about the SVD in the next lesson, you will see an even deeper way to compute it — using the pseudoinverse — that works even when $A^TA$ is not invertible.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 4 — Advanced Projections & SVD',
        body: '**Previous:** Gram-Schmidt — building an orthonormal basis from any basis.\n**This lesson:** Least Squares — finding the best approximate solution to an overdetermined system, using projection onto the column space.\n**Next:** SVD — the ultimate factorization that gives the deepest view of least squares and much more.',
      },
      {
        type: 'insight',
        title: 'Why "Least Squares"?',
        body: 'We minimize $\\|\\mathbf{b} - A\\mathbf{x}\\|^2 = \\sum_i (b_i - \\text{row}_i(A) \\cdot \\mathbf{x})^2$ — the sum of the squared residuals. Squaring makes all errors positive and penalizes large errors more heavily. The solution that minimizes this sum is the least squares solution.',
      },
      {
        type: 'insight',
        title: 'The Geometric Core',
        body: 'The least squares solution $\\hat{\\mathbf{x}}$ makes $A\\hat{\\mathbf{x}}$ the orthogonal projection of $\\mathbf{b}$ onto $\\text{col}(A)$. Closest point = projection.',
      },
      {
        type: 'definition',
        title: 'The Normal Equations',
        body: 'A^T A \\hat{\\mathbf{x}} = A^T \\mathbf{b}\n\nWhen $A$ has linearly independent columns, $A^TA$ is invertible and:\n$$\\hat{\\mathbf{x}} = (A^T A)^{-1} A^T \\mathbf{b}$$',
      },
      {
        type: 'warning',
        title: 'Normal Equations Can Be Ill-Conditioned',
        body: 'Squaring the matrix ($A^TA$) also squares the condition number, amplifying numerical errors. In practice, solve least squares via QR decomposition ($A = QR$, so $\\hat{\\mathbf{x}} = R^{-1}Q^T\\mathbf{b}$) rather than forming $A^TA$ explicitly.',
      },
    ],
    visualizations: [
      {
        id: 'LeastSquaresFit',
        title: 'Best-Fit Line: Minimizing Squared Residuals',
        mathBridge: 'The visualization shows scattered data points and a adjustable line. Drag the line\'s slope and intercept. Watch the vertical red segments (residuals) update in real time. The squared residuals are shown as red squares on the right. The least squares solution (the best fit line) minimizes the total area of those red squares. Notice that no line eliminates the residuals — the best fit line makes them as small as possible.',
        caption: 'Least squares = minimize the total area of the squared residuals.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'Given an overdetermined system $A\\mathbf{x} \\approx \\mathbf{b}$ (where $A$ is $m \\times n$ with $m > n$), the **least squares solution** $\\hat{\\mathbf{x}}$ minimizes:\n\n$$\\|\\mathbf{b} - A\\mathbf{x}\\|^2 = \\sum_{i=1}^m (b_i - [A\\mathbf{x}]_i)^2$$',
      '**Deriving the normal equations.** Geometrically, the minimum occurs when the residual $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ is orthogonal to the column space of $A$, meaning $\\mathbf{e} \\perp A\\mathbf{z}$ for all $\\mathbf{z}$. This gives:\n\n$$(A\\mathbf{z})^T(\\mathbf{b} - A\\hat{\\mathbf{x}}) = 0 \\quad \\forall \\mathbf{z} \\quad \\Rightarrow \\quad A^T(\\mathbf{b} - A\\hat{\\mathbf{x}}) = \\mathbf{0}$$\n\nRearranging: $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$. These are the **normal equations**.',
      'When $A$ has **linearly independent columns** (which is the typical case), $A^TA$ is a square, symmetric, positive-definite $n \\times n$ matrix, and it is invertible. The unique solution is:\n\n$$\\hat{\\mathbf{x}} = (A^TA)^{-1}A^T\\mathbf{b}$$\n\nThe matrix $(A^TA)^{-1}A^T$ is called the **pseudoinverse** of $A$ and is often written $A^+$.',
      '**Projection onto the column space.** The vector $A\\hat{\\mathbf{x}} = A(A^TA)^{-1}A^T\\mathbf{b}$ is the orthogonal projection of $\\mathbf{b}$ onto the column space of $A$. The matrix $P = A(A^TA)^{-1}A^T$ is the projection matrix onto $\\text{col}(A)$. It is symmetric and idempotent: $P^T = P$ and $P^2 = P$.',
      '**Linear regression.** Fitting a line $y = ax + b$ to data points $(x_1, y_1), \\ldots, (x_m, y_m)$ is a least squares problem where:\n\n$$A = \\begin{bmatrix}x_1 & 1 \\\\ x_2 & 1 \\\\ \\vdots & \\vdots \\\\ x_m & 1\\end{bmatrix}, \\quad \\mathbf{x} = \\begin{bmatrix}a \\\\ b\\end{bmatrix}, \\quad \\mathbf{b} = \\begin{bmatrix}y_1 \\\\ y_2 \\\\ \\vdots \\\\ y_m\\end{bmatrix}$$\n\nSolving the normal equations gives the unique best-fit line.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Normal Equations',
        body: 'A^T A \\hat{\\mathbf{x}} = A^T \\mathbf{b} \\\\[6pt] \\Downarrow \\\\[6pt] \\hat{\\mathbf{x}} = (A^T A)^{-1} A^T \\mathbf{b} \\quad (\\text{when } A \\text{ has independent columns})',
      },
      {
        type: 'definition',
        title: 'Projection Matrix',
        body: 'P = A(A^T A)^{-1}A^T\n\n• $P\\mathbf{b}$ = orthogonal projection of $\\mathbf{b}$ onto $\\text{col}(A)$\n• $P^2 = P$ (projecting twice = projecting once)\n• $P^T = P$ (projection is symmetric)',
      },
      {
        type: 'insight',
        title: 'QR Makes It Faster',
        body: 'With $A = QR$: $\\hat{\\mathbf{x}} = (A^TA)^{-1}A^T\\mathbf{b} = (R^TQ^TQR)^{-1}R^TQ^T\\mathbf{b} = R^{-1}Q^T\\mathbf{b}$.\n\nThis is a simple triangular system — much faster and more stable than forming $A^TA$.',
      },
    ],
    visualizations: [
      {
        id: 'LeastSquaresProjectionViz',
        title: 'Projection onto the Column Space',
        mathBridge: 'The visualization shows $\\mathbf{b}$ as a vector NOT in the column space of $A$ (a 2D plane in 3D). The blue vector is the projection $A\\hat{\\mathbf{x}}$ — the closest point in the column space. The red vector is the residual $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$. Confirm that the red vector is perpendicular to the blue plane. Drag $\\mathbf{b}$ — watch the projection update.',
        caption: 'Least squares = project b onto the column space of A.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Least Squares and Linear Regression',
        mathBridge: 'np.linalg.lstsq(A, b) solves the normal equations. x̂ = (AᵀA)⁻¹Aᵀb. Residual = b − Ax̂. Linear regression: A = [x | 1], b = y-values, solution gives slope and intercept.',
        caption: 'Solve overdetermined systems and fit a best-fit line through data using the normal equations.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Solving an overdetermined system',
              prose: [
                'An overdetermined system (more equations than unknowns) usually has no exact solution. Least squares finds the x̂ that minimizes ‖b − Ax‖².',
                '`np.linalg.lstsq(A, b, rcond=None)` solves this directly. Compare to directly applying the normal equations.',
              ],
              code: `import numpy as np

# 3 equations, 2 unknowns — no exact solution
A = np.array([[1., 1.],
              [1., 2.],
              [1., 3.]])
b = np.array([2., 3., 4.5])

# Method 1: lstsq
x_hat, residuals, _, _ = np.linalg.lstsq(A, b, rcond=None)
print("Least squares solution:", x_hat)

# Method 2: normal equations (A^T A x = A^T b)
x_normal = np.linalg.solve(A.T @ A, A.T @ b)
print("Normal equations solution:", x_normal)
print("Same?", np.allclose(x_hat, x_normal))
print()

# Residual
e = b - A @ x_hat
print(f"Residual vector: {e.round(4)}")
print(f"‖residual‖ = {np.linalg.norm(e):.4f}")`,
            },
            {
              id: 2,
              cellTitle: 'Linear regression as least squares',
              prose: [
                'Fitting the line y = ax + c to data points is a least squares problem.',
                'Build the matrix A with a column of x-values and a column of ones. Solve for [a, c].',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, AMBER

# Data points: study hours vs. exam score
hours = [2., 4., 5., 7., 9., 10., 12.]
scores = [51., 65., 68., 76., 82., 87., 92.]

x = np.array(hours)
y = np.array(scores)

# Build A: [x | 1]
A = np.column_stack([x, np.ones_like(x)])
b = y

# Solve
coeffs, _, _, _ = np.linalg.lstsq(A, b, rcond=None)
slope, intercept = coeffs
print(f"Best-fit line: y = {slope:.2f}x + {intercept:.2f}")

# Visualize
fig = Figure(xmin=0, xmax=14, ymin=40, ymax=100,
             title="Linear Regression via Least Squares")
fig.grid().axes()
fig.scatter(x.tolist(), y.tolist(), color=BLUE, radius=6, labels=None)
fig.plot(lambda t: slope * t + intercept, color=AMBER,
         label=f"y={slope:.1f}x+{intercept:.1f}")
fig.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Fit a quadratic',
              difficulty: 'hard',
              prompt: 'The data below follows a quadratic pattern y ≈ ax² + bx + c. Build the matrix A with columns [x², x, 1] and use np.linalg.lstsq to find the best-fit quadratic. Then plot the data (scatter) and the fitted curve (fig.plot(lambda t: ...)) on the same figure.',
              code: `import numpy as np
from opencalc import Figure, BLUE, AMBER

x = np.array([0., 1., 2., 3., 4., 5., 6.])
y = np.array([1., 3., 9., 19., 33., 51., 73.])  # roughly 2x² + x + 1

# Build A with columns [x², x, 1]
# Solve with lstsq
# Plot scatter + fitted curve
`,
              hint: 'A = np.column_stack([x**2, x, np.ones_like(x)]). coeffs, _, _, _ = np.linalg.lstsq(A, y, rcond=None). a, b, c = coeffs. Then fig.plot(lambda t: a*t**2 + b*t + c, ...).',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Theorem (Least Squares):** Let $A$ be an $m \\times n$ matrix and $\\mathbf{b} \\in \\mathbb{R}^m$. The set of least squares solutions (minimizers of $\\|A\\mathbf{x} - \\mathbf{b}\\|^2$) is exactly the solution set of the normal equations $A^TA\\mathbf{x} = A^T\\mathbf{b}$.',
      '**Proof sketch.** Expand $\\|A\\mathbf{x} - \\mathbf{b}\\|^2 = \\|A\\mathbf{x}\\|^2 - 2\\mathbf{x}^TA^T\\mathbf{b} + \\|\\mathbf{b}\\|^2$. Taking the gradient with respect to $\\mathbf{x}$ and setting to zero gives $2A^TA\\mathbf{x} - 2A^T\\mathbf{b} = \\mathbf{0}$, which is the normal equations.',
      '**Uniqueness.** The least squares solution is unique if and only if $A^TA$ is invertible, which happens if and only if $A$ has linearly independent columns (i.e., $\\text{rank}(A) = n$). If $A$ has dependent columns, there are infinitely many least squares solutions (they all give the same minimal value of $\\|A\\mathbf{x}-\\mathbf{b}\\|^2$).',
      '**The pseudoinverse.** For any matrix $A$ (even non-square or rank-deficient), there exists a unique matrix $A^+$ called the Moore-Penrose pseudoinverse such that $A^+\\mathbf{b}$ is the minimum-norm least squares solution. The pseudoinverse is constructed via SVD: $A = U\\Sigma V^T \\Rightarrow A^+ = V\\Sigma^+U^T$, where $\\Sigma^+$ replaces each non-zero singular value $\\sigma_i$ with $1/\\sigma_i$. This is the deepest connection between least squares and SVD.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Existence and Uniqueness',
        body: '• Least squares solutions always exist (for any $A$, $\\mathbf{b}$).\n• The solution is unique iff $\\text{rank}(A) = n$ (independent columns).\n• When not unique, the minimum-norm solution is $\\hat{\\mathbf{x}} = A^+\\mathbf{b}$.',
      },
      {
        type: 'insight',
        title: 'SVD Gives the Pseudoinverse',
        body: 'If $A = U\\Sigma V^T$, then $A^+ = V\\Sigma^+ U^T$, where $\\Sigma^+$ inverts each non-zero diagonal entry of $\\Sigma$. This gives the best possible least squares solution even when $A^TA$ is singular.',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la4-003-ex1',
      title: 'Least Squares Solution to an Overdetermined 3×2 System',
      problem: 'Find the least squares solution to $A\\mathbf{x} = \\mathbf{b}$ where $A = \\begin{bmatrix}1 & 1 \\\\ 1 & 2 \\\\ 1 & 3\\end{bmatrix}$ and $\\mathbf{b} = \\begin{bmatrix}1 \\\\ 2 \\\\ 2\\end{bmatrix}$.',
      steps: [
        {
          expression: 'A^TA = \\begin{bmatrix}1&1&1\\\\1&2&3\\end{bmatrix}\\begin{bmatrix}1&1\\\\1&2\\\\1&3\\end{bmatrix} = \\begin{bmatrix}3&6\\\\6&14\\end{bmatrix}',
          annotation: 'Compute $A^TA$ — a 2×2 matrix. This is the "information matrix."',
          strategyTitle: 'Compute AᵀA',
          checkpoint: 'Verify entry $(1,1)$: $1^2 + 1^2 + 1^2 = 3$. Entry $(1,2)$: $1\\cdot1 + 1\\cdot2 + 1\\cdot3 = 6$.',
          hints: ['$A^TA$ is always symmetric — both off-diagonal entries equal 6.'],
        },
        {
          expression: 'A^T\\mathbf{b} = \\begin{bmatrix}1&1&1\\\\1&2&3\\end{bmatrix}\\begin{bmatrix}1\\\\2\\\\2\\end{bmatrix} = \\begin{bmatrix}5\\\\11\\end{bmatrix}',
          annotation: 'Compute $A^T\\mathbf{b}$ — a 2-vector.',
          strategyTitle: 'Compute Aᵀb',
          checkpoint: '',
          hints: ['Row 1: $1+2+2=5$. Row 2: $1+4+6=11$.'],
        },
        {
          expression: '\\begin{bmatrix}3&6\\\\6&14\\end{bmatrix}\\hat{\\mathbf{x}} = \\begin{bmatrix}5\\\\11\\end{bmatrix}',
          annotation: 'The normal equations. We now solve this 2×2 system — which HAS an exact solution.',
          strategyTitle: 'Set up normal equations',
          checkpoint: 'Why does this 2×2 system have an exact solution when the original 3×2 did not?',
          hints: ['$A^TA$ is square and (assuming $A$ has independent columns) invertible. We traded an overdetermined system for a square one.'],
        },
        {
          expression: '\\det(A^TA) = 3 \\cdot 14 - 6 \\cdot 6 = 42 - 36 = 6 \\quad (A^TA)^{-1} = \\frac{1}{6}\\begin{bmatrix}14&-6\\\\-6&3\\end{bmatrix}',
          annotation: 'Invert the 2×2 matrix using the formula $(A^TA)^{-1} = \\frac{1}{\\det}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}$.',
          strategyTitle: 'Invert AᵀA',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\hat{\\mathbf{x}} = \\frac{1}{6}\\begin{bmatrix}14&-6\\\\-6&3\\end{bmatrix}\\begin{bmatrix}5\\\\11\\end{bmatrix} = \\frac{1}{6}\\begin{bmatrix}70-66\\\\-30+33\\end{bmatrix} = \\frac{1}{6}\\begin{bmatrix}4\\\\3\\end{bmatrix} = \\begin{bmatrix}2/3\\\\1/2\\end{bmatrix}',
          annotation: 'Multiply to get the least squares solution.',
          strategyTitle: 'Compute solution',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'The least squares solution is $\\hat{\\mathbf{x}} = [2/3,\\; 1/2]^T$. This minimizes $\\|A\\mathbf{x}-\\mathbf{b}\\|^2$ — no other $\\mathbf{x}$ gets $A\\mathbf{x}$ closer to $\\mathbf{b}$. The residual is $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}} = [1,2,2]^T - [7/6, 4/3, 3/2]^T$, which is perpendicular to both columns of $A$.',
    },
    {
      id: 'la4-003-ex2',
      title: 'Best-Fit Line Through Data Points',
      problem: 'Find the line $y = ax + b$ that best fits the points $(1, 1)$, $(2, 2)$, $(3, 4)$.',
      steps: [
        {
          expression: 'A = \\begin{bmatrix}1&1\\\\2&1\\\\3&1\\end{bmatrix}, \\quad \\mathbf{x} = \\begin{bmatrix}a\\\\b\\end{bmatrix}, \\quad \\mathbf{b}_{\\text{data}} = \\begin{bmatrix}1\\\\2\\\\4\\end{bmatrix}',
          annotation: 'Rewrite the system. Each data point gives one equation: $y_i = ax_i + b$. The first column of $A$ is the $x$-values, the second is all 1\'s (for the intercept).',
          strategyTitle: 'Set up the system',
          checkpoint: 'Write out the three equations from the data.',
          hints: ['$a(1)+b=1$, $a(2)+b=2$, $a(3)+b=4$. Three equations, two unknowns — overdetermined.'],
        },
        {
          expression: 'A^TA = \\begin{bmatrix}14&6\\\\6&3\\end{bmatrix}, \\quad A^T\\mathbf{b}_{\\text{data}} = \\begin{bmatrix}17\\\\7\\end{bmatrix}',
          annotation: '$A^TA$: entries $[1^2+2^2+3^2, 1+2+3; 1+2+3, 3] = [14,6;6,3]$. $A^T\\mathbf{b}$: $[1+4+12, 1+2+4] = [17,7]$.',
          strategyTitle: 'Compute normal equation ingredients',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\det = 14 \\cdot 3 - 6 \\cdot 6 = 42 - 36 = 6 \\qquad \\hat{\\mathbf{x}} = \\frac{1}{6}\\begin{bmatrix}3&-6\\\\-6&14\\end{bmatrix}\\begin{bmatrix}17\\\\7\\end{bmatrix} = \\frac{1}{6}\\begin{bmatrix}51-42\\\\-102+98\\end{bmatrix} = \\frac{1}{6}\\begin{bmatrix}9\\\\-4\\end{bmatrix}',
          annotation: 'Solve the normal equations. Note the $(A^TA)^{-1}$ swap: since $A^TA = \\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}$, the inverse swaps $a$ and $d$, negates $b$ and $c$.',
          strategyTitle: 'Solve',
          checkpoint: '',
          hints: [],
        },
        {
          expression: 'a = \\frac{9}{6} = \\frac{3}{2}, \\quad b = \\frac{-4}{6} = -\\frac{2}{3}',
          annotation: 'The best-fit line is $y = \\frac{3}{2}x - \\frac{2}{3}$.',
          strategyTitle: 'Read off slope and intercept',
          checkpoint: 'Check: does this line pass through all three points exactly?',
          hints: ['At $x=1$: $3/2 - 2/3 = 9/6 - 4/6 = 5/6 \\neq 1$. It does not pass through exactly — that is expected. It is the best fit, not an exact fit.'],
        },
      ],
      conclusion: 'The best-fit line is $y = \\frac{3}{2}x - \\frac{2}{3}$. None of the three points lie exactly on the line, but this line minimizes the sum of squared vertical distances from the points to the line.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la4-003-ch1',
      difficulty: 'easy',
      problem: 'Write (but do not solve) the normal equations for the system: $A = \\begin{bmatrix}1&0\\\\0&1\\\\1&1\\end{bmatrix}$, $\\mathbf{b} = \\begin{bmatrix}1\\\\1\\\\3\\end{bmatrix}$.',
      hint: 'Compute $A^TA$ and $A^T\\mathbf{b}$.',
      walkthrough: [
        {
          expression: 'A^TA = \\begin{bmatrix}1&0&1\\\\0&1&1\\end{bmatrix}\\begin{bmatrix}1&0\\\\0&1\\\\1&1\\end{bmatrix} = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}',
          annotation: 'Multiply $A^T$ (2×3) by $A$ (3×2) to get a 2×2 matrix.',
        },
        {
          expression: 'A^T\\mathbf{b} = \\begin{bmatrix}1&0&1\\\\0&1&1\\end{bmatrix}\\begin{bmatrix}1\\\\1\\\\3\\end{bmatrix} = \\begin{bmatrix}4\\\\4\\end{bmatrix}',
          annotation: 'Multiply $A^T$ (2×3) by $\\mathbf{b}$ (3×1).',
        },
        {
          expression: '\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}\\hat{\\mathbf{x}} = \\begin{bmatrix}4\\\\4\\end{bmatrix}',
          annotation: 'These are the normal equations.',
        },
      ],
      answer: 'A^T A x = A^T b gives [[2,1],[1,2]] x = [4,4]',
    },
    {
      id: 'la4-003-ch2',
      difficulty: 'medium',
      problem: 'The residual $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ is always perpendicular to the column space of $A$. Verify this for Example 1 above: show $A^T\\mathbf{e} = \\mathbf{0}$.',
      hint: 'Compute $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ using $\\hat{\\mathbf{x}} = [2/3, 1/2]^T$, then compute $A^T\\mathbf{e}$.',
      walkthrough: [
        {
          expression: 'A\\hat{\\mathbf{x}} = \\begin{bmatrix}1&1\\\\1&2\\\\1&3\\end{bmatrix}\\begin{bmatrix}2/3\\\\1/2\\end{bmatrix} = \\begin{bmatrix}7/6\\\\5/3\\\\13/6\\end{bmatrix}',
          annotation: 'Compute the approximation $A\\hat{\\mathbf{x}}$.',
        },
        {
          expression: '\\mathbf{e} = \\begin{bmatrix}1\\\\2\\\\2\\end{bmatrix} - \\begin{bmatrix}7/6\\\\5/3\\\\13/6\\end{bmatrix} = \\begin{bmatrix}-1/6\\\\1/3\\\\-1/6\\end{bmatrix}',
          annotation: 'Compute the residual.',
        },
        {
          expression: 'A^T\\mathbf{e} = \\begin{bmatrix}1&1&1\\\\1&2&3\\end{bmatrix}\\begin{bmatrix}-1/6\\\\1/3\\\\-1/6\\end{bmatrix} = \\begin{bmatrix}-1/6+1/3-1/6\\\\-1/6+2/3-1/2\\end{bmatrix} = \\begin{bmatrix}0\\\\0\\end{bmatrix}',
          annotation: 'The residual is orthogonal to every column of $A$. This confirms the least squares solution is correct.',
        },
      ],
      answer: 'A^T e = [0, 0]^T, confirming the residual is perpendicular to col(A)',
    },
    {
      id: 'la4-003-ch3',
      difficulty: 'hard',
      problem: 'Show that the projection matrix $P = A(A^TA)^{-1}A^T$ is idempotent: $P^2 = P$. What does this mean geometrically?',
      hint: 'Expand $P^2 = (A(A^TA)^{-1}A^T)(A(A^TA)^{-1}A^T)$. Group the middle terms.',
      walkthrough: [
        {
          expression: 'P^2 = A(A^TA)^{-1}A^T \\cdot A(A^TA)^{-1}A^T',
          annotation: 'Write out $P^2$ as a product of $P$ with itself.',
        },
        {
          expression: '= A(A^TA)^{-1}(A^TA)(A^TA)^{-1}A^T',
          annotation: 'Group $A^T \\cdot A$ in the middle.',
        },
        {
          expression: '= A \\cdot I \\cdot (A^TA)^{-1}A^T = A(A^TA)^{-1}A^T = P',
          annotation: '$(A^TA)^{-1}(A^TA) = I$. The middle cancels, leaving $P$ again.',
        },
      ],
      answer: 'P² = P. Geometrically: projecting twice is the same as projecting once. Once you are on the subspace, re-projecting leaves you unchanged.',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: '\\hat{\\mathbf{x}}', meaning: 'The least squares solution — minimizes ||Ax - b||²' },
      { symbol: 'A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}', meaning: 'The normal equations — the 2×2 (or n×n) system whose solution is the least squares answer' },
      { symbol: 'P = A(A^TA)^{-1}A^T', meaning: 'Projection matrix onto col(A) — maps any b to its closest point in the column space' },
      { symbol: '\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}', meaning: 'Residual vector — perpendicular to col(A), represents the irreducible error' },
      { symbol: 'A^+', meaning: 'Pseudoinverse of A — generalizes (AᵀA)⁻¹Aᵀ to rank-deficient cases' },
    ],
    rulesOfThumb: [
      'Least squares = project b onto col(A) and find the corresponding x.',
      'Normal equations are always solvable, even when the original system is not.',
      'Residual is perpendicular to col(A) — that is the definition of "best approximation."',
      'In practice, use QR (not AᵀA) for numerical stability.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la4-001',
        label: 'Orthogonal Projections',
        note: 'Least squares IS orthogonal projection. $A\\hat{\\mathbf{x}}$ is the projection of $\\mathbf{b}$ onto the column space. The formula $P = A(A^TA)^{-1}A^T$ is the general projection matrix onto any column space.',
      },
      {
        lessonId: 'la1-004',
        label: 'Systems of Linear Equations',
        note: 'The normal equations $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$ ARE a square linear system — exactly the kind you learned to solve with Gaussian elimination. Least squares converts an unsolvable overdetermined system into a solvable square one.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la4-004',
        label: 'Singular Value Decomposition',
        note: 'The pseudoinverse $A^+ = V\\Sigma^+U^T$ (from SVD) handles least squares even when $A^TA$ is singular. SVD is the deepest and most general tool for least squares.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'b not in col(A) → no exact solution → find the closest point in col(A).',
    'Closest point = orthogonal projection of b onto col(A).',
    'Normal equations: A^T A x-hat = A^T b — always solvable.',
    'Residual e = b - A x-hat is perpendicular to every column of A.',
    'Linear regression is least squares with a design matrix of x-values.',
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la4-003-assess-1',
        type: 'input',
        text: 'What is the name of the square system whose solution gives the least squares answer?',
        answer: 'normal equations',
        hint: 'They are called this because the residual is normal (perpendicular) to the column space.',
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'least-squares-q1',
      type: 'choice',
      text: 'What is the geometric interpretation of the least squares solution $\\hat{\\mathbf{x}}$?',
      options: [
        'It makes $A\\hat{\\mathbf{x}}$ equal to $\\mathbf{b}$',
        'It makes $A\\hat{\\mathbf{x}}$ the orthogonal projection of $\\mathbf{b}$ onto the column space of $A$',
        'It minimizes $\\|\\mathbf{x}\\|$ (the length of the solution vector)',
        'It maximizes the dot product $\\mathbf{x} \\cdot \\mathbf{b}$',
      ],
      answer: 'It makes $A\\hat{\\mathbf{x}}$ the orthogonal projection of $\\mathbf{b}$ onto the column space of $A$',
      hints: ['The minimum distance from $\\mathbf{b}$ to the column space is achieved at the orthogonal projection.'],
      reviewSection: 'Intuition tab — The Geometric Core',
    },
    {
      id: 'least-squares-q2',
      type: 'choice',
      text: 'The least squares residual $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ always satisfies which condition?',
      options: [
        '$A\\mathbf{e} = \\mathbf{b}$',
        '$\\mathbf{e} = \\mathbf{0}$ (zero vector)',
        '$A^T\\mathbf{e} = \\mathbf{0}$ (residual is perpendicular to column space)',
        '$\\|\\mathbf{e}\\| = 1$',
      ],
      answer: '$A^T\\mathbf{e} = \\mathbf{0}$ (residual is perpendicular to column space)',
      hints: ['This is the normal equations condition. The residual is orthogonal to every column of $A$.'],
      reviewSection: 'Math tab — Deriving the Normal Equations',
    },
    {
      id: 'least-squares-q3',
      type: 'choice',
      text: 'You want to fit a line $y = ax + b$ to 50 data points. What is the size of the matrix $A$ you set up?',
      options: ['2 × 50', '50 × 2', '2 × 2', '50 × 50'],
      answer: '50 × 2',
      hints: ['One row per data point (50 equations), one column per parameter: slope $a$ and intercept $b$ (2 unknowns).'],
      reviewSection: 'Math tab — Linear Regression',
    },
  ],
};
