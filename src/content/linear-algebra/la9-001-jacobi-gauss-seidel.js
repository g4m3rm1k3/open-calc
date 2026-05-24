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
    x_new = D \ (b - LU * x)
    if norm(x_new - x) < 1e-10
        disp(['Converged at iteration ', num2str(k)])
        break
    end
    x = x_new
end
disp('Solution:')
x
disp('Exact solution (A\\b):')
A \ b
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
G_gs = -(D+L) \ U
rho_gs = max(abs(eig(G_gs)))
disp('GS spectral radius:')
rho_gs

% Gauss-Seidel iteration
x = zeros(3,1)
for k = 1:50
    x_new = (D+L) \ (b - U*x)
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
    { id: 'cp-la9-001-1', question: 'What is the iteration matrix for Jacobi?', answer: '$G_J = -D^{-1}(L+U) = I - D^{-1}A$.' },
    { id: 'cp-la9-001-2', question: 'Under what condition does a stationary iteration converge?', answer: 'The spectral radius of the iteration matrix $\\rho(G) < 1$.' },
    { id: 'cp-la9-001-3', question: 'How does Gauss-Seidel differ from Jacobi in its update rule?', answer: 'GS uses newly computed components $x_j^{(k+1)}$ for $j < i$ immediately, rather than using only old values $x_j^{(k)}$.' },
  ],

  assessment: 'For the system $A\\mathbf{x} = \\mathbf{b}$ with $A = \\begin{bmatrix}10&1\\\\1&10\\end{bmatrix}$, $\\mathbf{b} = (1,1)^\\top$: (a) compute the Jacobi iteration matrix and its spectral radius, (b) perform 3 steps starting from $\\mathbf{x}^{(0)} = \\mathbf{0}$.',

  quiz: [
    { id: 'q-la9-001-1', question: 'The Jacobi method uses which splitting of $A$?', options: ['$A = L + D + U$, $M = D + L$', '$A = D - (L+U)$, $M = D$', '$A = L + U$, $M = L$', '$A = QR$, $M = Q$'], answer: '$A = D - (L+U)$, $M = D$' },
    { id: 'q-la9-001-2', question: 'A stationary iteration converges for all starting points iff:', options: ['$\\|G\\|_2 < 1$', '$\\rho(G) < 1$', '$\\det G < 1$', '$\\text{tr}(G) < 0$'], answer: '$\\rho(G) < 1$' },
    { id: 'q-la9-001-3', question: 'Strict diagonal dominance guarantees:', options: ['Gauss-Seidel converges only', 'Jacobi converges only', 'Both Jacobi and Gauss-Seidel converge', 'Neither converges in general'], answer: 'Both Jacobi and Gauss-Seidel converge' },
  ],
};
