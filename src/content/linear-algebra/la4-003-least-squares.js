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
      'Three data points $(0,1),(1,2),(2,4)$. Set up $A\\mathbf{x} \\approx \\mathbf{b}$: $A = \\begin{bmatrix}0&1\\\\1&1\\\\2&1\\end{bmatrix}$, $\\mathbf{b} = [1,2,4]^\\top$ (columns are $x$-values and 1s). No line passes through all three points exactly — the system is overdetermined. Normal equations: $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$ gives $\\begin{bmatrix}5&3\\\\3&3\\end{bmatrix}\\hat{\\mathbf{x}} = \\begin{bmatrix}10\\\\7\\end{bmatrix}$, solution $\\hat{\\mathbf{x}} = [3/2,\\, 5/6]^\\top$ — slope $3/2$, intercept $5/6$. This minimizes the sum of squared vertical distances from the line to the points.',
      'When you have more equations than unknowns, the system is called **overdetermined**. Think of fitting a line to 100 data points: you have 100 equations ($y_i = ax_i + b$) but only 2 unknowns ($a$ and $b$). Almost certainly, no single line passes through all 100 points. The system has no solution.',
      '**The geometric picture.** The target vector $\\mathbf{b}$ (your data) does not lie in the column space of $A$. No matter what $\\mathbf{x}$ you pick, $A\\mathbf{x}$ can only reach points in the column space. The best you can do is get as close as possible — meaning: find the point $A\\hat{\\mathbf{x}}$ in the column space that is closest to $\\mathbf{b}$. That closest point is the orthogonal projection of $\\mathbf{b}$ onto the column space.',
      'The error vector $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ is the residual — the gap between your best approximation and the actual target. The least squares solution minimizes $\\|\\mathbf{e}\\|^2$ (the sum of squared errors), which is where the name comes from.',
      '**The key insight.** The residual $\\mathbf{e}$ is perpendicular to every column of $A$. This is not a coincidence — it is the defining property of orthogonal projection. The residual points in the direction you cannot reach, which is exactly perpendicular to the column space.',
      'Saying "$\\mathbf{e}$ is perpendicular to every column of $A$" is the same as saying $A^T\\mathbf{e} = \\mathbf{0}$. Substituting $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ gives the famous **normal equations**: $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$.',
      '**CNC workpiece probing — fitting a plane to touch-probe data.** A touch probe on a CNC machine measures the surface of a raw workpiece at multiple points before machining. Each probe touch gives one point $(x_i, y_i, z_i)$ on the surface. To establish the workpiece datum, the controller needs the equation of the best-fit plane: $z = ax + by + c$. With 5 or more probe touches, you have 5 equations in 3 unknowns ($a$, $b$, $c$) — an overdetermined system. Least squares finds the best-fit plane that minimizes the sum of squared deviations of probe points from the plane. This is exactly the normal equations with $A = [x_i, y_i, 1]$ rows and $\\mathbf{b} = [z_i]$. The result: a datum that best represents the actual workpiece surface despite measurement noise.',
      '**Where this is heading:** The least squares solution is the workhorse of data science. When you learn about the SVD in the next lesson, you will see an even deeper way to compute it — using the pseudoinverse — that works even when $A^TA$ is not invertible.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Solve a Least Squares Problem',
        body: 'Step 1. **Identify the overdetermined system.** You have $A\\mathbf{x} = \\mathbf{b}$ with more rows than unknowns ($m > n$) and no exact solution.\n\nStep 2. **Form the normal equations.** Compute $A^TA$ ($n\\times n$) and $A^T\\mathbf{b}$ ($n\\times 1$).\n\nStep 3. **Solve $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$.** Use Gaussian elimination (or `np.linalg.lstsq` in Python). The solution $\\hat{\\mathbf{x}}$ minimizes $\\|A\\mathbf{x} - \\mathbf{b}\\|^2$.\n\nStep 4. **Compute the residual.** $\\mathbf{r} = \\mathbf{b} - A\\hat{\\mathbf{x}}$. This is the "error" — the component of $\\mathbf{b}$ perpendicular to the column space of $A$.\n\nStep 5. **Verify perpendicularity.** Check $A^T\\mathbf{r} = \\mathbf{0}$ — the residual is orthogonal to every column of $A$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 3 of 9 — Orthogonality & SVD',
        body: '**Previous (Lesson 2):** Gram-Schmidt — building an orthonormal basis from any basis.\n**This lesson:** Least Squares — finding the best approximate solution to an overdetermined system, using projection onto the column space.\n**Next (Lesson 4):** SVD — the ultimate factorization that gives the deepest view of least squares and much more.',
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
        body: 'A^T A \\hat{\\mathbf{x}} = A^T \\mathbf{b}\n\nWhen $A$ has linearly independent columns, $A^TA$ is invertible and:\n$\\hat{\\mathbf{x}} = (A^T A)^{-1} A^T \\mathbf{b}$',
      },
      {
        type: 'insight',
        title: 'Prediction',
        body: 'You have 4 data points $(1,2),(2,3),(3,5),(4,6)$ and want the best-fit line $y = ax + b$. Before computing: will the residual be zero or non-zero? Is $\\mathbf{b}$ in $\\text{col}(A)$? Predict the slope — is it closer to 1 or to 2? Then set up $A$ and $A^T A$ and solve.',
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
      'Given an overdetermined system $A\\mathbf{x} \\approx \\mathbf{b}$ (where $A$ is $m \\times n$ with $m > n$), the **least squares solution** $\\hat{\\mathbf{x}}$ minimizes:\n\n$\\|\\mathbf{b} - A\\mathbf{x}\\|^2 = \\sum_{i=1}^m (b_i - [A\\mathbf{x}]_i)^2$',
      '**Deriving the normal equations.** Geometrically, the minimum occurs when the residual $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ is orthogonal to the column space of $A$, meaning $\\mathbf{e} \\perp A\\mathbf{z}$ for all $\\mathbf{z}$. This gives:\n\n$(A\\mathbf{z})^T(\\mathbf{b} - A\\hat{\\mathbf{x}}) = 0 \\quad \\forall \\mathbf{z} \\quad \\Rightarrow \\quad A^T(\\mathbf{b} - A\\hat{\\mathbf{x}}) = \\mathbf{0}$\n\nRearranging: $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$. These are the **normal equations**.',
      'When $A$ has **linearly independent columns** (which is the typical case), $A^TA$ is a square, symmetric, positive-definite $n \\times n$ matrix, and it is invertible. The unique solution is:\n\n$\\hat{\\mathbf{x}} = (A^TA)^{-1}A^T\\mathbf{b}$\n\nThe matrix $(A^TA)^{-1}A^T$ is called the **pseudoinverse** of $A$ and is often written $A^+$.',
      '**Projection onto the column space.** The vector $A\\hat{\\mathbf{x}} = A(A^TA)^{-1}A^T\\mathbf{b}$ is the orthogonal projection of $\\mathbf{b}$ onto the column space of $A$. The matrix $P = A(A^TA)^{-1}A^T$ is the projection matrix onto $\\text{col}(A)$. It is symmetric and idempotent: $P^T = P$ and $P^2 = P$.',
      '**Linear regression.** Fitting a line $y = ax + b$ to data points $(x_1, y_1), \\ldots, (x_m, y_m)$ is a least squares problem where:\n\n$A = \\begin{bmatrix}x_1 & 1 \\\\ x_2 & 1 \\\\ \\vdots & \\vdots \\\\ x_m & 1\\end{bmatrix}, \\quad \\mathbf{x} = \\begin{bmatrix}a \\\\ b\\end{bmatrix}, \\quad \\mathbf{b} = \\begin{bmatrix}y_1 \\\\ y_2 \\\\ \\vdots \\\\ y_m\\end{bmatrix}$\n\nSolving the normal equations gives the unique best-fit line.',
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
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Least Squares — Normal Equations and CNC Plane Fitting',
        mathBridge: 'MATLAB: `A \\ b` solves the least squares problem directly (backslash). Or: `(A\'*A) \\ (A\'*b)` via normal equations. `\\` is the recommended tool — it uses QR decomposition internally.',
        caption: 'Three cells: overdetermined system, linear regression, and CNC probe plane fitting.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Solving overdetermined systems — normal equations vs backslash',
              prose: [
                'For A*x = b with more rows than columns (overdetermined), `x = A \\ b` gives the least squares solution automatically.',
                'Manually: solve (A\'*A)*x_hat = A\'*b. Verify by checking A\'*(b - A*x_hat) ≈ 0 (residual perpendicular to col(A)).',
              ],
              code: `A = [1 1; 1 2; 1 3];
b = [1; 2; 2];

% Method 1: backslash (uses QR internally)
x_hat_bs = A \\ b;

% Method 2: normal equations explicitly
x_hat_ne = (A'*A) \\ (A'*b);

fprintf('Backslash solution:       [%.6f; %.6f]\\n', x_hat_bs(1), x_hat_bs(2))
fprintf('Normal equations:         [%.6f; %.6f]\\n', x_hat_ne(1), x_hat_ne(2))
fprintf('Same? %d\\n', norm(x_hat_bs - x_hat_ne) < 1e-10)

% Residual
e = b - A*x_hat_bs;
fprintf('\\nResidual e: [%.4f; %.4f; %.4f]\\n', e(1), e(2), e(3))
fprintf('A''*e (should be 0): [%.2e; %.2e]\\n', A'*e)`,
            },
            {
              id: 2,
              cellTitle: 'Linear regression — best-fit line via least squares',
              prose: [
                'Fitting y = ax + b to data: build A = [x, 1] and solve A \\ y.',
                'The residual norm –e– measures fit quality. Smaller = better fit.',
              ],
              code: `% Study hours vs exam score
x_data = [2; 4; 5; 7; 9; 10; 12];
y_data = [51; 65; 68; 76; 82; 87; 92];

A = [x_data, ones(size(x_data))];   % [x | 1]
coeffs = A \\ y_data;
a = coeffs(1); b = coeffs(2);

fprintf('Best-fit line: y = %.3f*x + %.3f\\n', a, b)

% Predict and compute residuals
y_pred = A * coeffs;
residuals = y_data - y_pred;
fprintf('Residual norm: %.4f\\n', norm(residuals))
fprintf('R^2: %.6f\\n', 1 - var(residuals)/var(y_data))`,
            },
            {
              id: 3,
              cellTitle: 'CNC workpiece plane fitting — least squares from probe data',
              prose: [
                'A touch probe measures surface points (x_i, y_i, z_i). Fit z = ax + by + c using least squares with A = [x, y, 1].',
                'The residuals represent surface deviation from a perfect plane (waviness, tilt, etc.).',
              ],
              code: `% CNC probe measurements of workpiece surface (x, y, z in mm)
probe_pts = [
   10,  10,  0.012;    % probe point 1
   50,  10,  0.018;
   90,  10,  0.025;
   10,  70,  0.031;
   50,  70,  0.037;
   90,  70,  0.044;
   50,  40,  0.029;    % center
];

x = probe_pts(:,1); y = probe_pts(:,2); z = probe_pts(:,3);

% Build design matrix for z = a*x + b*y + c
A = [x, y, ones(size(x))];

% Least squares: fit plane
coeffs = A \\ z;
a = coeffs(1); b = coeffs(2); c = coeffs(3);

fprintf('Best-fit plane: z = %.6f*x + %.6f*y + %.6f\\n', a, b, c)

% Residuals = deviation from perfect plane
z_fit = A * coeffs;
residuals = z - z_fit;
fprintf('\\nProbe point deviations from plane (mm):\\n')
for i = 1:length(z)
    fprintf('  Point %d: %.6f mm\\n', i, residuals(i))
end
fprintf('RMS surface deviation: %.6f mm\\n', rms(residuals))`,
            },
          ]
        }
      },
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
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Solving an overdetermined system',
              prose: 'An overdetermined system (more equations than unknowns) usually has no exact solution. Least squares finds the x̂ that minimizes ‖b − Ax‖². `np.linalg.lstsq(A, b, rcond=None)` solves this directly. Compare to directly applying the normal equations.',
              code: `import numpy as np
import matplotlib.pyplot as plt

# Overdetermined: 3 equations, 2 unknowns -> no exact solution
A = np.array([[1., 1.], [2., 1.], [3., 1.]])
b = np.array([2., 3., 5.])

# Least squares: minimize ||Ax - b||^2
x_ls, res, rank, sv = np.linalg.lstsq(A, b, rcond=None)
print(f"Least squares solution: x = {x_ls.round(4)}")
print(f"Residual ||Ax - b||^2 = {np.linalg.norm(A@x_ls - b)**2:.4f}")
print(f"Ax_ls = {A@x_ls.round(4)}  vs  b = {b}")

fig, ax = plt.subplots(figsize=(6, 5))
t = np.linspace(0, 4, 100)
ax.scatter([1,2,3], b, color='crimson', s=80, zorder=5, label='data points')
ax.plot(t, x_ls[0]*t + x_ls[1], color='steelblue', lw=2,
        label=f'best fit: y = {x_ls[0]:.2f}x + {x_ls[1]:.2f}')
for xi, bi in zip([1,2,3], b):
    yi_fit = x_ls[0]*xi + x_ls[1]
    ax.plot([xi,xi], [bi, yi_fit], 'k--', lw=1.5, alpha=0.6)
ax.set_title("Least Squares: best-fit line minimizes sum of squared residuals", fontsize=11)
ax.set_xlabel("x"); ax.set_ylabel("y")
ax.legend(fontsize=10); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Linear regression as least squares',
              prose: 'Fitting the line y = ax + c to data points is a least squares problem. Build the matrix A with a column of x-values and a column of ones. Solve for [a, c].',
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
              prompt: 'The data below follows a quadratic pattern y â‰ˆ ax² + bx + c. Build the matrix A with columns [x², x, 1] and use np.linalg.lstsq to find the best-fit quadratic. Then plot the data (scatter) and the fitted curve (fig.plot(lambda t: ...)) on the same figure.',
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
    {
      id: 'la4-003-ex3',
      title: 'When b is in col(A): least squares recovers the exact solution',
      problem: 'For $A = \\begin{bmatrix}1&0\\\\0&1\\\\1&1\\end{bmatrix}$ and $\\mathbf{b} = [2,3,5]^\\top$: solve the normal equations and verify the residual is zero.',
      steps: [
        {
          expression: '\\mathbf{b} = \\begin{bmatrix}2\\\\3\\\\5\\end{bmatrix} = 2\\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix} + 3\\begin{bmatrix}0\\\\1\\\\1\\end{bmatrix} = A\\begin{bmatrix}2\\\\3\\end{bmatrix}',
          annotation: '$\\mathbf{b}$ is exactly $A[2,3]^T$ — it lies in the column space of $A$. An exact solution exists.',
          strategyTitle: 'Recognize b is in col(A)',
          checkpoint: 'If an exact solution exists, what should the least squares solution be?',
          hints: ['If Ax=b has an exact solution x*, then x* also minimizes –Ax-b–² = 0. The least squares solution must equal the exact solution.'],
        },
        {
          expression: 'A^TA = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}, \\quad A^T\\mathbf{b} = \\begin{bmatrix}1&0&1\\\\0&1&1\\end{bmatrix}\\begin{bmatrix}2\\\\3\\\\5\\end{bmatrix} = \\begin{bmatrix}7\\\\8\\end{bmatrix}',
          annotation: '$A^TA$ entry $(i,j)$ = dot product of columns $i$ and $j$ of $A$. Diagonal: $\\|\\mathbf{a}_1\\|^2=2$, $\\|\\mathbf{a}_2\\|^2=2$. Off-diagonal: $\\mathbf{a}_1\\cdot\\mathbf{a}_2=1$.',
          strategyTitle: 'Form normal equations',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\hat{\\mathbf{x}} = (A^TA)^{-1}A^T\\mathbf{b} = \\frac{1}{3}\\begin{bmatrix}2&-1\\\\-1&2\\end{bmatrix}\\begin{bmatrix}7\\\\8\\end{bmatrix} = \\frac{1}{3}\\begin{bmatrix}6\\\\9\\end{bmatrix} = \\begin{bmatrix}2\\\\3\\end{bmatrix}',
          annotation: '$\\det(A^TA) = 4-1=3$. Normal equations give $\\hat{\\mathbf{x}} = [2,3]^T$ — exactly the exact solution.',
          strategyTitle: 'Solve normal equations',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}} = \\begin{bmatrix}2\\\\3\\\\5\\end{bmatrix} - \\begin{bmatrix}1&0\\\\0&1\\\\1&1\\end{bmatrix}\\begin{bmatrix}2\\\\3\\end{bmatrix} = \\begin{bmatrix}2\\\\3\\\\5\\end{bmatrix} - \\begin{bmatrix}2\\\\3\\\\5\\end{bmatrix} = \\begin{bmatrix}0\\\\0\\\\0\\end{bmatrix}',
          annotation: 'Zero residual — $\\mathbf{b}$ is exactly in the column space, so the projection equals $\\mathbf{b}$ itself.',
          strategyTitle: 'Verify residual is zero',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'When $\\mathbf{b} \\in \\text{col}(A)$, the least squares solution is the exact solution and the residual is zero. Least squares is a generalization of exact solving: it works whether or not an exact solution exists. The normal equations $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$ always produce the best possible $\\hat{\\mathbf{x}}$.',
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
    { id: 'cp-la4-003-1', label: 'Read: State the normal equations and where they come from', type: 'read' },
    { id: 'cp-la4-003-2', label: 'Read: Explain the geometric picture of least squares', type: 'read' },
    { id: 'cp-la4-003-3', label: 'Read: Describe when the residual is zero vs. non-zero', type: 'read' },
    { id: 'cp-la4-003-4', label: 'Lab: Fit a line and visualize the squared residuals', type: 'lab' },
    { id: 'cp-la4-003-5', label: 'Lab: Verify Aᵀe = 0 after solving normal equations', type: 'lab' },
    { id: 'cp-la4-003-6', label: 'Example: Solve an overdetermined 3×2 system', type: 'example' },
    { id: 'cp-la4-003-7', label: 'Example: Fit a line to data using normal equations', type: 'example' },
    { id: 'cp-la4-003-8', label: 'Challenge: Show least squares recovers exact solution when b ∈ col(A)', type: 'challenge' },
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la4-003-assess-1',
        type: 'choice',
        text: 'What is the name of the square system whose solution gives the least squares answer?',
        options: ['Normal equations', 'Characteristic equations', 'Augmented equations', 'Reduced row echelon form'],
        answer: 'Normal equations',
        hints: ['They are called normal equations because the residual $\\mathbf{b} - A\\hat{\\mathbf{x}}$ is normal (perpendicular) to the column space of $A$.'],
        reviewSection: 'Math tab — Normal equations',
      },
      {
        id: 'la4-003-assess-2',
        type: 'choice',
        text: 'The matrix $A^TA$ in the normal equations is guaranteed to be invertible when:',
        options: ['$A$ is always square', '$A$ has linearly independent columns ($\\text{rank}(A) = n$)', '$A$ is symmetric', 'The residual vector is zero'],
        answer: '$A$ has linearly independent columns ($\\text{rank}(A) = n$)',
        hints: ['If the columns of $A$ are independent, $A\\mathbf{x} = \\mathbf{0}$ implies $\\mathbf{x} = \\mathbf{0}$, which makes $A^TA$ positive definite and therefore invertible.'],
        reviewSection: 'Math tab — Normal Equations (uniqueness condition)',
      },
      {
        id: 'la4-003-assess-3',
        type: 'choice',
        text: 'To fit the line $y = ax + b$ to 30 data points $(x_i, y_i)$, the design matrix $A$ has size:',
        options: ['$2 \\times 30$', '$30 \\times 2$', '$30 \\times 30$', '$2 \\times 2$'],
        answer: '$30 \\times 2$',
        hints: ['One row per data point (30 equations). Two columns: one for the $x_i$ values (coefficient of $a$) and one column of 1s (coefficient of $b$). Shape: $30 \\times 2$.'],
        reviewSection: 'Math tab — Linear Regression',
      },
      {
        id: 'la4-003-assess-4',
        type: 'choice',
        text: 'The least squares residual $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ must satisfy which condition?',
        options: ['$\\mathbf{e} = \\mathbf{0}$', '$A\\mathbf{e} = \\mathbf{b}$', '$A^T\\mathbf{e} = \\mathbf{0}$ (residual is perpendicular to all columns of $A$)', '$\\|\\mathbf{e}\\| = 1$'],
        answer: '$A^T\\mathbf{e} = \\mathbf{0}$ (residual is perpendicular to all columns of $A$)',
        hints: ['The residual points in the direction you cannot reach — perpendicular to the column space. This orthogonality condition $A^T(\\mathbf{b} - A\\hat{\\mathbf{x}}) = \\mathbf{0}$ is exactly what the normal equations encode.'],
        reviewSection: 'Intuition tab — Key Insight: perpendicular residual',
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
    {
      id: 'q-la4-003-4',
      type: 'choice',
      text: 'The normal equations $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$ are derived by requiring that:',
      options: [
        '$A\\hat{\\mathbf{x}} = \\mathbf{b}$ exactly',
        'The residual $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ is perpendicular to every column of $A$',
        '$\\|\\hat{\\mathbf{x}}\\|$ is minimized',
        '$\\det(A^TA) = 0$',
      ],
      answer: 'The residual $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ is perpendicular to every column of $A$',
      hints: ['The perpendicularity condition Aᵀ(b - Ax̂) = 0 is what makes the projection optimal. Rearranging gives AᵀAx̂ = Aᵀb.'],
      reviewSection: 'Math — Deriving the normal equations',
    },
    {
      id: 'q-la4-003-5',
      type: 'choice',
      text: 'When fitting a quadratic $y = ax^2 + bx + c$ to 10 data points, the matrix $A$ has how many rows and columns?',
      options: ['3 × 10', '10 × 3', '10 × 10', '3 × 3'],
      answer: '10 × 3',
      hints: ['One row per data point (10 rows). Three columns: one for x², one for x, one for the constant term (3 unknowns: a, b, c).'],
      reviewSection: 'Math — linear regression setup',
    },
    {
      id: 'q-la4-003-6',
      type: 'choice',
      text: 'If $\\mathbf{b}$ lies exactly in the column space of $A$, the least squares residual $\\|\\mathbf{e}\\|$ equals:',
      options: ['1', 'Some positive number', '0', '$\\|\\mathbf{b}\\|$'],
      answer: '0',
      hints: ['If b ∈ col(A), the projection of b onto col(A) is b itself. The residual e = b - Pb = b - b = 0.'],
      reviewSection: 'Examples — exact solution case',
    },
    {
      id: 'q-la4-003-7',
      type: 'choice',
      text: 'Why is solving via QR ($A = QR$, then $\\hat{\\mathbf{x}} = R^{-1}Q^T\\mathbf{b}$) preferred over forming $A^TA$ explicitly?',
      options: [
        'QR is always faster',
        'Forming $A^TA$ squares the condition number, making numerical errors worse; QR preserves the conditioning of $A$',
        'QR only works for square matrices',
        '$A^TA$ is not always invertible when $A$ is not square',
      ],
      answer: 'Forming $A^TA$ squares the condition number, making numerical errors worse; QR preserves the conditioning of $A$',
      hints: ['If κ(A) = 100, then κ(AᵀA) = κ(A)² = 10,000. Tiny rounding errors get amplified 10,000× instead of 100×. QR factorization avoids forming AᵀA.'],
      reviewSection: 'Intuition — Normal Equations Can Be Ill-Conditioned',
    },
    {
      id: 'q-la4-003-8',
      type: 'choice',
      text: 'The projection matrix $P = A(A^TA)^{-1}A^T$ satisfies $P^2 = P$ because:',
      options: [
        '$A^TA$ is always invertible',
        'Projecting a vector that is already in the column space of $A$ leaves it unchanged',
        '$P$ is a diagonal matrix',
        'The columns of $A$ are always orthonormal',
      ],
      answer: 'Projecting a vector that is already in the column space of $A$ leaves it unchanged',
      hints: ['If w = Pb is already in col(A), then Pw = P(Pb) = P²b = Pb = w (unchanged). That idempotency is what P² = P captures.'],
      reviewSection: 'Math — Projection onto the column space',
    },
    {
      id: 'q-la4-003-9',
      type: 'choice',
      text: 'In GPS, position is solved as a least squares problem because:',
      options: [
        'GPS uses exactly 3 satellites for 3 unknowns',
        'More than 4 satellites give more equations than unknowns (overdetermined) — the least squares solution minimizes combined distance errors',
        'GPS signals are orthogonal by construction',
        'The exact system has no solution due to Earth\'s curvature',
      ],
      answer: 'More than 4 satellites give more equations than unknowns (overdetermined) — the least squares solution minimizes combined distance errors',
      hints: ['Modern GPS uses 8—12 satellites. Each gives one distance equation for 4 unknowns (x,y,z,clock offset). The overdetermined system is solved via least squares.'],
      reviewSection: 'Hook — real-world context',
    },
    {
      id: 'q-la4-003-10',
      type: 'choice',
      text: 'For the least squares solution $\\hat{\\mathbf{x}} = (A^TA)^{-1}A^T\\mathbf{b}$, the matrix $(A^TA)^{-1}A^T$ is called:',
      options: [
        'The projection matrix',
        'The pseudoinverse of $A$',
        'The transpose of $A$',
        'The covariance matrix',
      ],
      answer: 'The pseudoinverse of $A$',
      hints: ['The pseudoinverse Aâº = (AᵀA)⁻¹Aᵀ generalizes the inverse to rectangular matrices. For square invertible A, Aâº = A⁻¹. More generally, Aâº = VΣâºUᵀ via SVD.'],
      reviewSection: 'Math — pseudoinverse',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'The least squares solution makes $A\\hat{\\mathbf{x}} = \\mathbf{b}$ exactly.',
      whyStudentsThinkIt: 'Students confuse "solve" with "approximate." The term "solution" implies exactness.',
      correctionExample: 'For $A = \\begin{bmatrix}1\\\\1\\\\1\\end{bmatrix}$, $\\mathbf{b} = [1,2,4]^T$: no single scalar $\\hat{x}$ satisfies all three equations $\\hat{x}=1$, $\\hat{x}=2$, $\\hat{x}=4$. The least squares solution $\\hat{x} = 7/3$ minimizes the sum of squared errors — it does NOT satisfy any of the three equations exactly.',
      contrastCase: 'The residual $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ is only zero when $\\mathbf{b}$ is exactly in the column space of $A$.',
    },
    {
      falseBelief: 'Least squares minimizes the maximum error (the largest residual).',
      whyStudentsThinkIt: 'Students confuse least squares ($\\ell^2$ norm) with minimax / Chebyshev ($\\ell^\\infty$ norm) optimization.',
      correctionExample: 'Least squares minimizes $\\sum e_i^2$ — the sum of squared residuals. Minimizing the maximum error ($\\max |e_i|$) is a different problem called Chebyshev approximation. Least squares is generally easier to compute (linear system), while minimax requires linear programming.',
      contrastCase: 'For three residuals $[-2, 1, 1]$ (sum of squares = 6) vs $[-1, -1, 2]$ (sum of squares = 6), both have the same least squares cost but different maximum errors (2 vs 2).',
    },
  ],

  transferPrompts: [
    {
      situation: 'You have sensor data from an accelerometer on a CNC axis. You want to estimate velocity and position from noisy acceleration readings using a Kalman filter.',
      competingTechniques: 'Numerical integration (trapezoid); Low-pass filter; Least squares batch estimation',
      whyThisTechniqueWins: 'Least squares (or its recursive variant, the Kalman filter) fits the physical model $\\mathbf{x}_{k+1} = A\\mathbf{x}_k + B\\mathbf{u}_k + \\mathbf{w}_k$ to all measurements simultaneously, minimizing squared prediction errors. It combines all readings optimally — much better than integrating forward from noisy individual readings.',
    },
    {
      situation: 'In machine learning, you want to find the weights $\\mathbf{w}$ of a linear model that best fit training data $(\\mathbf{x}_1, y_1), \\ldots, (\\mathbf{x}_n, y_n)$.',
      competingTechniques: 'Gradient descent; Direct formula; Normal equations',
      whyThisTechniqueWins: 'For small to medium datasets, the normal equations $X^TX\\mathbf{w} = X^T\\mathbf{y}$ give the exact least squares solution in one shot — no iteration, no learning rate. Gradient descent is preferred for large $n$ (millions of samples) where forming $X^TX$ is prohibitively expensive.',
    },
  ],

  debugging: [
    {
      commonError: 'Setting up $A$ with columns for data values but forgetting the column of ones for the intercept.',
      symptom: 'The fitted line passes through the origin (intercept forced to zero) even when the data clearly has a non-zero y-intercept.',
      whyItHappened: 'For $y = ax + b$, the model has two parameters: slope $a$ and intercept $b$. The column of ones in $A$ corresponds to $b$ (the coefficient of the constant term 1). Without it, you are forcing $b = 0$.',
      repairStrategy: 'For fitting $y = a_1 f_1(x) + a_2 f_2(x) + \\cdots$, column $j$ of $A$ is $[f_j(x_1), f_j(x_2), \\ldots, f_j(x_m)]^T$. For a constant term, $f_j(x) = 1$ for all $x$ — a column of all ones.',
    },
    {
      commonError: 'Using $A^T(A^T)^{-1}\\mathbf{b}$ instead of $(A^TA)^{-1}A^T\\mathbf{b}$.',
      symptom: 'Shape mismatch — $A^T$ is $n\\times m$ and cannot be inverted when $m \\neq n$.',
      whyItHappened: 'Confusing the order: the pseudoinverse is $(A^TA)^{-1}A^T$, not $A^T(A^T)^{-1}$. The matrix $A^TA$ (an $n\\times n$ square matrix) is what gets inverted.',
      repairStrategy: 'Memorize the shape: $A$ is $m\\times n$, $A^TA$ is $n\\times n$ (invertible if columns are independent), $(A^TA)^{-1}A^T$ is $n\\times m$. The pseudoinverse maps from $\\mathbb{R}^m$ (right-hand side) back to $\\mathbb{R}^n$ (solution space).',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Set up the normal equations for any overdetermined linear system, solve for $\\hat{\\mathbf{x}}$, and verify the residual is perpendicular to the column space.',
    explainVerbally: 'Explain why the normal equations arise from the perpendicularity condition, what the geometric picture is, and when the residual is zero.',
    detectIncorrectApplication: 'Catch missing intercept column; catch wrong pseudoinverse formula order; catch using least squares when an exact solution exists (redundant).',
    transferToUnfamiliar: 'Apply least squares to polynomial fitting, GPS position estimation, machine learning linear regression, or sensor fusion — any scenario with more equations than unknowns.',
  },
};
