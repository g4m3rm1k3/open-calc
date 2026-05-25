export default {
  id: 'la9-001',
  slug: 'jacobi-gauss-seidel',
  chapter: 'la9',
  order: 1,
  title: 'Jacobi and Gauss-Seidel Methods',
  subtitle: 'Stationary iterative methods split the matrix $A = M - N$ and iterate $\\mathbf{x}^{(k+1)} = M^{-1}N\\mathbf{x}^{(k)} + M^{-1}\\mathbf{b}$. Convergence is governed by the spectral radius of the iteration matrix.',
  tags: ['Jacobi', 'Gauss-Seidel', 'iterative methods', 'stationary iteration', 'spectral radius', 'diagonal dominance', 'splitting', 'SOR'],
  aliases: 'Jacobi Gauss Seidel iterative methods stationary iteration spectral radius diagonal dominance matrix splitting SOR successive over-relaxation convergence',

  hook: {
    question: "You need to solve a $10000 \\times 10000$ sparse linear system. Gaussian elimination requires $O(n^3)$ operations. Can you solve it in $O(kn)$ operations for small $k$ — iteratively updating your guess until it converges?",
    realWorldContext: "Direct solvers (LU factorization) require $O(n^3)$ work and $O(n^2)$ memory — impractical for the $10^6$-scale systems arising in finite element analysis (structural engineering), computational fluid dynamics, and reservoir simulation. Iterative methods only need $O(n)$ memory (store the matrix once) and each iteration costs $O(\\text{nnz})$ (sparse matrix-vector multiply). Jacobi and Gauss-Seidel are simple but often slow; they are building blocks for understanding more powerful methods (CG, GMRES, multigrid).",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Concrete first: Jacobi on a 2×2 system.** Take $\\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}\\begin{bmatrix}x\\\\y\\end{bmatrix} = \\begin{bmatrix}9\\\\7\\end{bmatrix}$ (exact solution: $x=2, y=\\frac{5}{3}$). Start with $x^{(0)}=0, y^{(0)}=0$. Jacobi says: isolate each variable using the old values. From row 1: $x^{(1)} = (9 - 1\\cdot y^{(0)})/4 = 9/4 = 2.25$. From row 2: $y^{(1)} = (7 - 1\\cdot x^{(0)})/3 = 7/3 \\approx 2.333$. Then $x^{(2)} = (9 - 2.333)/4 = 1.667$, $y^{(2)} = (7 - 2.25)/3 = 1.583$. After ~15 iterations: $x \\approx 2.000, y \\approx 1.667$. The method converges — each sweep improves the estimate.',
      '**Matrix splitting.** Write $A = M - N$ where $M$ is easy to invert. The linear system $A\\mathbf{x} = \\mathbf{b}$ becomes $M\\mathbf{x} = N\\mathbf{x} + \\mathbf{b}$, giving iteration: $M\\mathbf{x}^{(k+1)} = N\\mathbf{x}^{(k)} + \\mathbf{b}$, i.e., $\\mathbf{x}^{(k+1)} = M^{-1}N\\mathbf{x}^{(k)} + M^{-1}\\mathbf{b}$. The **iteration matrix** is $G = M^{-1}N = M^{-1}(M-A) = I - M^{-1}A$.',
      '**Jacobi method.** Split $A = D - (L + U)$ where $D$ is the diagonal, $L$ and $U$ are strictly lower and upper triangular. Jacobi: $M = D$. Each iteration: $x_i^{(k+1)} = \\frac{1}{a_{ii}}\\left(b_i - \\sum_{j \\neq i} a_{ij} x_j^{(k)}\\right)$. All components of $\\mathbf{x}^{(k)}$ (old) are used — can be parallelized trivially.',
      '**Gauss-Seidel method.** Same split but use updated values as soon as available: $x_i^{(k+1)} = \\frac{1}{a_{ii}}\\left(b_i - \\sum_{j < i} a_{ij} x_j^{(k+1)} - \\sum_{j > i} a_{ij} x_j^{(k)}\\right)$. Splitting: $M = D - L$ (lower triangular). Gauss-Seidel typically converges about twice as fast as Jacobi (same work per iteration).',
      '**Convergence criterion.** The iteration converges (for any initial guess) iff the spectral radius $\\rho(G) = \\max_i |\\lambda_i(G)| < 1$. The asymptotic convergence rate is $-\\log_{10}\\rho(G)$ decimal digits per iteration. If $A$ is **strictly diagonally dominant** ($|a_{ii}| > \\sum_{j \\neq i} |a_{ij}|$ for all $i$), both Jacobi and Gauss-Seidel converge.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Convergence Theorem',
        body: 'Stationary iteration $\\mathbf{x}^{(k+1)} = G\\mathbf{x}^{(k)} + \\mathbf{c}$ converges to the unique fixed point for every starting $\\mathbf{x}^{(0)}$ if and only if $\\rho(G) < 1$.\n\nError reduction per step: $\\|\\mathbf{e}^{(k)}\\| \\leq \\rho(G)^k \\|\\mathbf{e}^{(0)}\\|$\n\nFor Gauss-Seidel: $\\rho_{GS} = \\rho_{Jac}^2$ (for many important matrices — Gauss-Seidel is 2× faster).',
      },
      {
        type: 'insight',
        title: 'SOR: Successive Over-Relaxation',
        body: 'SOR interpolates between old and Gauss-Seidel update:\n$x_i^{(k+1)} = (1-\\omega)x_i^{(k)} + \\omega x_i^{GS}$\n\n$\\omega = 1$: Gauss-Seidel\n$1 < \\omega < 2$: over-relaxation (usually faster)\n$0 < \\omega < 1$: under-relaxation (can stabilize non-convergent GS)\n\nOptimal $\\omega$ for Poisson equation: $\\omega^* = \\frac{2}{1+\\sqrt{1-\\rho_{Jac}^2}}$, giving $\\rho_{SOR} = \\omega^* - 1$.',
      },
      {
        type: 'sequencing',
        title: 'Prediction',
        body: 'Before running more iterations of the 2×2 Jacobi example above, predict: will the iterates overshoot the solution (oscillate) or approach it smoothly from one side? What determines which behavior occurs? (Hint: look at the sign of the off-diagonal entries relative to the diagonal.)',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Jacobi and Gauss-Seidel Iteration',
        mathBridge: 'Implement both methods and observe convergence.',
        caption: 'Spectral radius < 1 guarantees convergence. Smaller = faster.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Jacobi method',
              prose: ['Solve a diagonally dominant system with Jacobi iteration.'],
              code: `% Strictly diagonally dominant system
A = [4 -1  0;
    -1  4 -1;
     0 -1  4]
b = [3; 4; 3]

% Jacobi: D = diag(A), split A = D - (L+U)
D = diag(diag(A))
LU = A - D  % strictly upper+lower triangular

% Iteration matrix
G_jac = -inv(D) * LU
rho_jac = max(abs(eig(G_jac)))
disp('Jacobi spectral radius:')
rho_jac

% Jacobi iteration
x = zeros(3,1)
for k = 1:50
    x_new = D \\ (b - LU * x)
    if norm(x_new - x) < 1e-10
        disp(['Converged at iteration ', num2str(k)])
        break
    end
    x = x_new
end
disp('Solution:')
x
disp('Exact solution (A\\b):')
A \\ b
`,
            },
            {
              id: 2,
              cellTitle: 'Gauss-Seidel comparison',
              prose: ['Compare Gauss-Seidel convergence rate to Jacobi on the same system.'],
              code: `A = [4 -1  0;
    -1  4 -1;
     0 -1  4]
b = [3; 4; 3]

L = tril(A, -1)   % strictly lower triangular
D = diag(diag(A))
U = triu(A, 1)    % strictly upper triangular

% Gauss-Seidel iteration matrix G_gs = -(D+L)^{-1} * U
G_gs = -(D+L) \\ U
rho_gs = max(abs(eig(G_gs)))
disp('GS spectral radius:')
rho_gs

% Gauss-Seidel iteration
x = zeros(3,1)
for k = 1:50
    x_new = (D+L) \\ (b - U*x)
    if norm(x_new - x) < 1e-10
        disp(['GS converged at iteration ', num2str(k)])
        break
    end
    x = x_new
end
disp('GS solution:')
x

% Compare: rho_gs should be ~ rho_jac^2
G_jac = -inv(D)*( A - D)
rho_jac = max(abs(eig(G_jac)))
disp('rho_jac^2 vs rho_gs:')
[rho_jac^2, rho_gs]
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Error analysis.** Let $\\mathbf{e}^{(k)} = \\mathbf{x}^* - \\mathbf{x}^{(k)}$ be the error. Since $\\mathbf{x}^* = G\\mathbf{x}^* + \\mathbf{c}$, we get $\\mathbf{e}^{(k+1)} = G\\mathbf{e}^{(k)}$, so $\\mathbf{e}^{(k)} = G^k \\mathbf{e}^{(0)}$. Convergence requires $G^k \\to 0$, which holds iff $\\rho(G) < 1$ (as the Jordan form analysis shows: $G^k \\to 0$ iff all eigenvalues satisfy $|\\lambda| < 1$).',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Convergence is Not Guaranteed',
        body: 'For a general matrix, Jacobi and Gauss-Seidel can diverge. Examples:\n\n- $A = \\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$: not diagonally dominant, Jacobi diverges.\n- Symmetric positive definite: Gauss-Seidel always converges.\n- Diagonally dominant: both converge.\n\nAlways check $\\rho(G) < 1$ before deploying a stationary iteration.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Multigrid methods.** Jacobi and Gauss-Seidel are excellent **smoothers** — they rapidly eliminate high-frequency (oscillatory) error components, while low-frequency components decay slowly. **Multigrid** exploits this: smooth on the fine grid, restrict residual to a coarser grid, solve coarsely, prolongate correction back, smooth again. This achieves $O(n)$ work for elliptic PDEs. The V-cycle and W-cycle are standard multigrid algorithms.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'When to Use Stationary Iterations',
        body: 'Direct solvers (LU) are preferred for dense $n < 10^4$ or sparse systems with good structure.\nStationary iterations are mostly used as:\n- **Smoothers** inside multigrid (V-cycle)\n- **Preconditioners** for Krylov methods (e.g., SSOR preconditioner for CG)\n- **Simple baseline** to understand iterative methods\n\nFor production code: use MATLAB\'s built-in pcg, gmres with ILU or AMG preconditioner.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la9-001-1',
      title: 'Diagonal dominance check',
      problem: 'Does $A = \\begin{bmatrix}5&1&1\\\\1&4&2\\\\2&1&6\\end{bmatrix}$ guarantee Jacobi convergence?',
      solution: 'Row 1: $|5| > |1| + |1| = 2$ ✓. Row 2: $|4| > |1| + |2| = 3$ ✓. Row 3: $|6| > |2| + |1| = 3$ ✓. Strictly diagonally dominant — Jacobi and Gauss-Seidel both converge.',
    },
    {
      id: 'ex-la9-001-2',
      title: 'Jacobi vs Gauss-Seidel iteration count',
      problem: 'For $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (9,7)^\\top$: compute the Jacobi iteration matrix $G_J$ and its spectral radius. How does $\\rho_{GS}$ compare?',
      solution: '$D = \\begin{bmatrix}4&0\\\\0&3\\end{bmatrix}$, $L+U = \\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}$. $G_J = -D^{-1}(L+U) = -\\begin{bmatrix}0&1/4\\\\1/3&0\\end{bmatrix}$. Eigenvalues of $G_J$: $\\pm\\sqrt{(1/4)(1/3)} = \\pm 1/\\sqrt{12} \\approx \\pm 0.289$. So $\\rho_J \\approx 0.289$. For Gauss-Seidel: $\\rho_{GS} \\approx \\rho_J^2 \\approx 0.083$ — Gauss-Seidel converges about 3.5× faster per iteration.',
    },
    {
      id: 'ex-la9-001-3',
      title: 'Non-convergence example',
      problem: 'Show that Jacobi diverges for $A = \\begin{bmatrix}1&2\\\\3&1\\end{bmatrix}$, $\\mathbf{b} = (3,4)^\\top$.',
      solution: '$D = I$, $L+U = \\begin{bmatrix}0&2\\\\3&0\\end{bmatrix}$. $G_J = -(L+U) = \\begin{bmatrix}0&-2\\\\-3&0\\end{bmatrix}$. Eigenvalues: $\\pm\\sqrt{6} \\approx \\pm 2.449$. Since $\\rho(G_J) = \\sqrt{6} > 1$, Jacobi diverges. The matrix is not diagonally dominant ($|1| < |2|$ in row 1, $|1| < |3|$ in row 2).',
    },
  ],

  challenges: [
    {
      id: 'ch-la9-001-1',
      title: 'Fixed-point interpretation',
      difficulty: 'medium',
      prompt: 'Show that the fixed point of Jacobi iteration ($\\mathbf{x}^{(k+1)} = D^{-1}(\\mathbf{b} - (L+U)\\mathbf{x}^{(k)})$) is the solution to $A\\mathbf{x} = \\mathbf{b}$.',
      hint: 'At the fixed point, $\\mathbf{x}^* = \\mathbf{x}^{(k+1)} = \\mathbf{x}^{(k)}$.',
      solution: 'At fixed point: $\\mathbf{x}^* = D^{-1}(\\mathbf{b} - (L+U)\\mathbf{x}^*)$. Multiply both sides by $D$: $D\\mathbf{x}^* = \\mathbf{b} - (L+U)\\mathbf{x}^*$, so $(D + L + U)\\mathbf{x}^* = \\mathbf{b}$, i.e., $A\\mathbf{x}^* = \\mathbf{b}$.',
    },
  ],

  mentalModel: [
    'Stationary iteration: $A = M - N$; solve $M\\mathbf{x}^{(k+1)} = N\\mathbf{x}^{(k)} + \\mathbf{b}$.',
    'Jacobi: $M = D$ (diagonal). Gauss-Seidel: $M = D - L$ (lower triangular).',
    'Convergence iff spectral radius $\\rho(G) < 1$.',
    'Diagonal dominance guarantees convergence of both methods.',
    'GS uses updated values immediately — faster than Jacobi (roughly $\\rho_{GS} \\approx \\rho_J^2$).',
  ],

  checkpoints: [
    { id: 'cp-la9-001-1', label: 'What is the Jacobi iteration matrix?', type: 'read' },
    { id: 'cp-la9-001-2', label: 'Under what spectral condition does a stationary iteration converge?', type: 'read' },
    { id: 'cp-la9-001-3', label: 'How does Gauss-Seidel differ from Jacobi in its update rule?', type: 'read' },
    { id: 'cp-la9-001-4', label: 'Run the Jacobi notebook cell on the 2×2 example and verify the first two iterates by hand.', type: 'lab' },
    { id: 'cp-la9-001-5', label: 'Modify the Gauss-Seidel cell to track the residual norm each iteration and plot convergence.', type: 'lab' },
    { id: 'cp-la9-001-6', label: 'Verify example 2 by computing $G_J$ and its eigenvalues by hand for the 2×2 system.', type: 'example' },
    { id: 'cp-la9-001-7', label: 'Verify example 3 by checking diagonal dominance and computing $\\rho(G_J)$.', type: 'example' },
    { id: 'cp-la9-001-8', label: 'For a random 4×4 diagonally dominant matrix, predict the number of iterations needed to reach residual $10^{-8}$ from $\\rho(G)$. Then verify experimentally.', type: 'challenge' },
  ],

  assessment: 'For the system $A\\mathbf{x} = \\mathbf{b}$ with $A = \\begin{bmatrix}10&1\\\\1&10\\end{bmatrix}$, $\\mathbf{b} = (1,1)^\\top$: (a) compute the Jacobi iteration matrix and its spectral radius, (b) perform 3 steps starting from $\\mathbf{x}^{(0)} = \\mathbf{0}$.',

  quiz: [
    { id: 'q-la9-001-1', question: 'The Jacobi method uses which splitting of $A$?', options: ['$A = L + D + U$, $M = D + L$', '$A = D - (L+U)$, $M = D$', '$A = L + U$, $M = L$', '$A = QR$, $M = Q$'], answer: '$A = D - (L+U)$, $M = D$', hints: ['The Jacobi method uses only the diagonal part of $A$ for $M$.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-2', question: 'A stationary iteration converges for all starting points iff:', options: ['$\\|G\\|_2 < 1$', '$\\rho(G) < 1$', '$\\det G < 1$', '$\\text{tr}(G) < 0$'], answer: '$\\rho(G) < 1$', hints: ['The spectral radius is the maximum modulus of the eigenvalues.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-3', question: 'Strict diagonal dominance guarantees:', options: ['Gauss-Seidel converges only', 'Jacobi converges only', 'Both Jacobi and Gauss-Seidel converge', 'Neither converges in general'], answer: 'Both Jacobi and Gauss-Seidel converge', hints: ['Diagonal dominance implies $\\rho(G) < 1$ for both methods.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-4', question: 'For the 2×2 example $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, the first Jacobi iterate from $\\mathbf{x}^{(0)}=(0,0)^\\top$ gives $x^{(1)} =$', options: ['$x^{(1)} = 2.00$', '$x^{(1)} = 2.25$', '$x^{(1)} = 3.00$', '$x^{(1)} = 1.75$'], answer: '$x^{(1)} = 2.25$', hints: ['Apply $x^{(1)} = (b_1 - a_{12} y^{(0)}) / a_{11} = (9 - 0) / 4$.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-5', question: 'Gauss-Seidel typically converges faster than Jacobi because:', options: ['It uses a smaller iteration matrix', 'It uses updated component values immediately within each sweep', 'It requires fewer matrix-vector products', 'Its diagonal is larger'], answer: 'It uses updated component values immediately within each sweep', hints: ['Compare the two update formulas and note what values of $\\mathbf{x}$ are used.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-6', question: 'If $\\rho(G_J) = 0.5$ for a Jacobi iteration, approximately how many iterations are needed to reduce the error by a factor of $10^{-6}$?', options: ['6 iterations', '10 iterations', '20 iterations', '40 iterations'], answer: '20 iterations', hints: ['Each iteration reduces error by $\\rho = 0.5$. After $k$ steps: $0.5^k < 10^{-6}$, so $k \\geq 6/\\log_{10}(2) \\approx 20$.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-7', question: 'The SOR relaxation parameter $\\omega^* > 1$ (over-relaxation) is useful because:', options: ['It always converges when Gauss-Seidel diverges', 'It can give a smaller spectral radius than Gauss-Seidel', 'It reduces memory usage', 'It parallelizes better than Jacobi'], answer: 'It can give a smaller spectral radius than Gauss-Seidel', hints: ['The optimal $\\omega^*$ minimizes $\\rho_{SOR}$, which can be less than $\\rho_{GS}$.'], reviewSection: 'intuition' },
    { id: 'q-la9-001-8', question: 'The error after $k$ Jacobi iterations satisfies (approximately):', options: ['$\\|\\mathbf{e}^{(k)}\\| \\leq k\\rho(G)$', '$\\|\\mathbf{e}^{(k)}\\| \\leq \\rho(G)^k \\|\\mathbf{e}^{(0)}\\|$', '$\\|\\mathbf{e}^{(k)}\\| = 0$ for $k \\geq n$', '$\\|\\mathbf{e}^{(k)}\\| \\leq \\|G\\|_F^k$'], answer: '$\\|\\mathbf{e}^{(k)}\\| \\leq \\rho(G)^k \\|\\mathbf{e}^{(0)}\\|$', hints: ['The error satisfies $\\mathbf{e}^{(k)} = G^k \\mathbf{e}^{(0)}$; the spectral radius controls the power.'], reviewSection: 'math' },
    { id: 'q-la9-001-9', question: 'Jacobi and Gauss-Seidel are most commonly used in modern codes as:', options: ['The primary linear system solver', 'Smoothers inside multigrid or preconditioners for Krylov methods', 'Replacements for LU factorization', 'Methods for computing eigenvalues'], answer: 'Smoothers inside multigrid or preconditioners for Krylov methods', hints: ['See the rigor section on multigrid — Jacobi is an excellent smoother.'], reviewSection: 'rigor' },
    { id: 'q-la9-001-10', question: 'For a symmetric positive definite matrix, which statement is true?', options: ['Jacobi always converges but Gauss-Seidel may not', 'Gauss-Seidel always converges but Jacobi may not', 'Both Jacobi and Gauss-Seidel always converge', 'Neither is guaranteed to converge'], answer: 'Gauss-Seidel always converges but Jacobi may not', hints: ['SPD guarantees GS convergence; Jacobi requires the stronger diagonal dominance condition.'], reviewSection: 'math' },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Given any 3×3 diagonally dominant system, perform 3 iterations of Jacobi by hand and verify convergence using the spectral radius.',
    explainVerbally: 'Explain the matrix splitting idea to a classmate: why does $A = M - N$ lead to an iterative method, and what makes $M = D$ a good choice?',
    detectIncorrectApplication: 'Identify when Jacobi will diverge by checking diagonal dominance; catch the mistake of applying Jacobi to a system where $|a_{ii}| < \\sum_{j\\neq i}|a_{ij}|$.',
    transferToUnfamiliar: 'Given a new splitting $M = D + L$ (lower triangular part), derive the corresponding iteration and predict whether it will converge faster or slower than Gauss-Seidel.',
  },

  misconceptions: [
    {
      falseBelief: 'Convergence is guaranteed if $\\|G\\|_2 < 1$.',
      whyStudentsThinkIt: 'The 2-norm is the most common matrix norm, and students conflate norm with spectral radius.',
      correctionExample: 'A matrix can have $\\|G\\|_2 > 1$ but $\\rho(G) < 1$, or vice versa. The spectral radius $\\rho(G) = \\lim_{k\\to\\infty}\\|G^k\\|^{1/k}$ is the correct quantity — not any single matrix norm.',
      contrastCase: '$G = \\begin{bmatrix}0&2\\\\0&0\\end{bmatrix}$: $\\|G\\|_2 = 2 > 1$ but $\\rho(G) = 0 < 1$. The iteration converges in 2 steps.',
    },
    {
      falseBelief: 'Gauss-Seidel always converges faster than Jacobi.',
      whyStudentsThinkIt: 'Using fresh values "should" always help, and the $\\rho_{GS} \\approx \\rho_J^2$ result is often stated without caveats.',
      correctionExample: 'For some non-symmetric matrices, Jacobi converges but Gauss-Seidel diverges. The $\\rho_{GS} = \\rho_J^2$ relation holds only for specific matrix classes (e.g., consistently ordered matrices from 2D PDE discretizations).',
      contrastCase: 'A 2×2 system where Jacobi converges with $\\rho_J = 0.8$ but Gauss-Seidel diverges with $\\rho_{GS} > 1$ can be constructed from a non-symmetric matrix.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You have a symmetric positive definite tridiagonal system from a 1D finite difference discretization and need to solve it iteratively.',
      competingTechniques: 'Jacobi, Gauss-Seidel, SOR, Conjugate Gradient.',
      whyThisTechniqueWins: 'Gauss-Seidel or SOR with optimal $\\omega$ converges fastest for SPD tridiagonal systems. CG would be even faster, but Gauss-Seidel is simpler to implement and effective for small systems.',
    },
    {
      situation: 'You need to parallelize the solution of a large sparse SPD system across many CPU cores.',
      competingTechniques: 'Jacobi, Gauss-Seidel, parallel CG.',
      whyThisTechniqueWins: 'Jacobi wins for parallelism: each component $x_i^{(k+1)}$ depends only on old values, so all $n$ updates are independent. Gauss-Seidel has sequential data dependencies that make parallelization difficult.',
    },
  ],

  debugging: [
    {
      commonError: 'Dividing by $a_{ii} = 0$ in the Jacobi update.',
      symptom: 'NaN or Inf values appear after the first iteration.',
      whyItHappened: 'The matrix has a zero diagonal entry; Jacobi requires $a_{ii} \\neq 0$ for all $i$.',
      repairStrategy: 'Permute the rows/columns of $A$ so all diagonal entries are nonzero (pivoting). If no permutation fixes it, the matrix is singular.',
    },
    {
      commonError: 'Checking $\\|G\\|_2 < 1$ instead of $\\rho(G) < 1$ to predict convergence.',
      symptom: 'The iteration diverges even though $\\|G\\|_2 < 1$ was verified, or the code predicts divergence when it should converge.',
      whyItHappened: 'Confusing the matrix 2-norm with the spectral radius. The spectral radius $\\rho(G) = \\max_i |\\lambda_i|$ is the correct convergence indicator.',
      repairStrategy: 'Compute $\\rho(G) = $ max(abs(eig(G))) in MATLAB/Python. The 2-norm $\\|G\\|_2$ equals the spectral radius only for normal matrices.',
    },
  ],
};
