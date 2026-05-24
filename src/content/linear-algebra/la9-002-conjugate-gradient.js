export default {
  id: 'la9-002',
  slug: 'conjugate-gradient',
  chapter: 'la9',
  order: 2,
  title: 'Conjugate Gradient Method',
  subtitle: 'The conjugate gradient (CG) method solves $A\\mathbf{x} = \\mathbf{b}$ for symmetric positive definite $A$ in at most $n$ steps, but typically converges in $\\sqrt{\\kappa(A)}$ iterations. It builds an $A$-orthogonal search direction basis from Krylov subspaces.',
  tags: ['conjugate gradient', 'CG', 'Krylov subspace', 'SPD', 'A-orthogonal', 'energy norm', 'convergence', 'preconditioning'],
  aliases: 'conjugate gradient CG method Krylov subspace symmetric positive definite SPD A-orthogonal energy norm convergence rate preconditioning iterative solver',

  hook: {
    question: "The Gauss-Seidel method converges slowly when the condition number is large. Is there an iterative method that always converges in at most $n$ steps (exact arithmetic) and is provably optimal at each step?",
    realWorldContext: "Conjugate gradient is the workhorse of large-scale scientific computing. Every finite element simulation, physics engine, climate model, and 3D game uses CG or its variants. Solving the Poisson equation on a $1000 \\times 1000$ grid gives $n = 10^6$ unknowns — CG with a good preconditioner converges in $O(\\sqrt{n})$ iterations, each costing $O(n)$ work. Total: $O(n^{3/2})$ vs $O(n^3)$ for LU. Google uses CG-like methods for ranking and ad placement. Quantum chemistry codes (Gaussian, VASP) rely on CG for self-consistent field iterations.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The $A$-inner product.** For SPD $A$, define the $A$-inner product $\\langle \\mathbf{u}, \\mathbf{v} \\rangle_A = \\mathbf{u}^\\top A \\mathbf{v}$ and the energy norm $\\|\\mathbf{x}\\|_A = \\sqrt{\\mathbf{x}^\\top A \\mathbf{x}}$. Solving $A\\mathbf{x} = \\mathbf{b}$ is equivalent to minimizing $f(\\mathbf{x}) = \\frac{1}{2}\\mathbf{x}^\\top A\\mathbf{x} - \\mathbf{b}^\\top\\mathbf{x}$ (a bowl-shaped quadratic). The CG error satisfies $\\|\\mathbf{e}^{(k)}\\|_A = \\min_{\\mathbf{x} \\in \\mathbf{x}_0 + \\mathcal{K}_k} \\|\\mathbf{x}^* - \\mathbf{x}\\|_A$ (optimal over the Krylov subspace).',
      '**Krylov subspaces.** The $k$-th Krylov subspace is $\\mathcal{K}_k(A, \\mathbf{r}_0) = \\text{span}\\{\\mathbf{r}_0, A\\mathbf{r}_0, A^2\\mathbf{r}_0, \\ldots, A^{k-1}\\mathbf{r}_0\\}$ where $\\mathbf{r}_0 = \\mathbf{b} - A\\mathbf{x}_0$ is the initial residual. CG minimizes over increasingly large Krylov subspaces, adding one $A$-orthogonal direction per step.',
      '**The algorithm.** Initialize $\\mathbf{r}_0 = \\mathbf{b} - A\\mathbf{x}_0$, $\\mathbf{d}_0 = \\mathbf{r}_0$. Each step: (1) step length $\\alpha_k = \\mathbf{r}_k^\\top\\mathbf{r}_k / (\\mathbf{d}_k^\\top A\\mathbf{d}_k)$; (2) update $\\mathbf{x}_{k+1} = \\mathbf{x}_k + \\alpha_k \\mathbf{d}_k$; (3) new residual $\\mathbf{r}_{k+1} = \\mathbf{r}_k - \\alpha_k A\\mathbf{d}_k$; (4) new direction $\\mathbf{d}_{k+1} = \\mathbf{r}_{k+1} + \\beta_k \\mathbf{d}_k$ with $\\beta_k = \\mathbf{r}_{k+1}^\\top\\mathbf{r}_{k+1} / \\mathbf{r}_k^\\top\\mathbf{r}_k$. Cost per iteration: one matrix-vector product $A\\mathbf{d}_k$ plus $O(n)$ operations.',
      '**Convergence rate.** $\\|\\mathbf{e}^{(k)}\\|_A \\leq 2 \\left(\\frac{\\sqrt{\\kappa}-1}{\\sqrt{\\kappa}+1}\\right)^k \\|\\mathbf{e}^{(0)}\\|_A$ where $\\kappa = \\kappa(A) = \\lambda_{\\max}/\\lambda_{\\min}$. To reduce error by factor $\\varepsilon$: $k \\approx \\frac{1}{2}\\sqrt{\\kappa}\\ln(2/\\varepsilon)$ iterations. For the 2D Poisson equation, $\\kappa = O(h^{-2}) = O(n)$, giving $O(\\sqrt{n})$ CG iterations — much better than $O(n)$ for stationary methods.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Conjugate Gradient Optimality',
        body: 'The $k$-th CG iterate $\\mathbf{x}_k$ satisfies:\n$\\mathbf{x}_k = \\arg\\min_{\\mathbf{x} \\in \\mathbf{x}_0 + \\mathcal{K}_k} \\|\\mathbf{x} - \\mathbf{x}^*\\|_A$\n\n(Minimizes energy norm error over the $k$-th Krylov subspace.)\n\nFinite termination: in exact arithmetic, CG finds the exact solution in at most $n$ steps (and fewer if eigenvalues cluster).',
      },
      {
        type: 'insight',
        title: 'Eigenvalue Clustering Speeds CG',
        body: 'CG converges in $m$ steps if the matrix has at most $m$ distinct eigenvalues.\n\nIf eigenvalues cluster into $m$ groups (even approximately), CG converges in roughly $m$ steps.\n\nThis is why **preconditioning** helps: a preconditioner $M \\approx A^{-1}$ transforms the system so eigenvalues cluster near 1, drastically reducing $\\kappa$ and the number of iterations.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Conjugate Gradient Implementation',
        mathBridge: 'Implement CG from scratch and verify convergence rate.',
        caption: 'CG minimizes the energy norm error optimally over Krylov subspaces.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'CG implementation',
              prose: ['Implement conjugate gradient for an SPD system and track residual norm.'],
              code: `% Build SPD test system (2D Poisson-like, small)
n = 20
% Tridiagonal SPD matrix
e = ones(n,1)
A = diag(4*e) + diag(-e(1:n-1), 1) + diag(-e(1:n-1), -1)
b = ones(n,1)
x_exact = A \ b

% Conjugate Gradient
x = zeros(n,1)
r = b - A*x
d = r
rr = r' * r
residuals = []

for k = 1:n
    Ad = A * d
    alpha = rr / (d' * Ad)
    x = x + alpha * d
    r = r - alpha * Ad
    rr_new = r' * r
    residuals(end+1) = sqrt(rr_new)
    if sqrt(rr_new) < 1e-12
        disp(['CG converged at iteration ', num2str(k)])
        break
    end
    beta = rr_new / rr
    d = r + beta * d
    rr = rr_new
end

disp('First 10 residual norms:')
residuals(1:min(10,end))
disp('Final error:')
norm(x - x_exact) / norm(x_exact)
`,
            },
            {
              id: 2,
              cellTitle: 'Convergence vs condition number',
              prose: ['Compare CG iteration counts for systems with different condition numbers.'],
              code: `% Compare convergence for different kappa
function iters = run_cg(A, b, tol)
    n = length(b)
    x = zeros(n,1); r = b; d = r; rr = r'*r
    for k = 1:200
        Ad = A*d; alpha = rr/(d'*Ad)
        x = x + alpha*d; r = r - alpha*Ad
        rr_new = r'*r
        if sqrt(rr_new) < tol; iters = k; return; end
        d = r + (rr_new/rr)*d; rr = rr_new
    end
    iters = 200
end

% Well-conditioned: kappa ~ 3
n = 50
A1 = diag(linspace(1, 3, n))
b1 = ones(n,1)
i1 = run_cg(A1, b1, 1e-10)
disp(['kappa~3: iterations = ', num2str(i1)])

% Ill-conditioned: kappa ~ 100
A2 = diag(linspace(1, 100, n))
b2 = ones(n,1)
i2 = run_cg(A2, b2, 1e-10)
disp(['kappa~100: iterations = ', num2str(i2)])

disp('sqrt(kappa) heuristic:')
[sqrt(3), sqrt(100)]
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**$A$-orthogonality of directions.** The CG algorithm maintains $\\mathbf{d}_i^\\top A \\mathbf{d}_j = 0$ for $i \\neq j$ (in exact arithmetic). This means the search directions are mutually $A$-orthogonal, and each minimizes the error along a direction orthogonal to all previous. After $n$ such directions, the entire space has been searched — yielding the exact solution.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'CG as Polynomial Approximation',
        body: 'CG is equivalent to finding the polynomial $p_k$ of degree $\\leq k$ with $p_k(0) = 1$ that minimizes the error bound. The error satisfies:\n\n$\\|\\mathbf{e}^{(k)}\\|_A \\leq \\min_{p \\in \\mathcal{P}_k, p(0)=1} \\max_{\\lambda \\in \\sigma(A)} |p(\\lambda)| \\cdot \\|\\mathbf{e}^{(0)}\\|_A$\n\nChebyshev polynomials achieve the minimax bound, giving the $\\sqrt{\\kappa}$ convergence estimate.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Lanczos connection.** Running CG on $A$ implicitly builds an orthogonal tridiagonalization $T_k = Q_k^\\top A Q_k$ (Lanczos process). The CG iterates are the solutions of $T_k \\mathbf{y}_k = \\|\\mathbf{r}_0\\|\\mathbf{e}_1$. In finite arithmetic, orthogonality is lost (Lanczos breakdown) — practical implementations use reorthogonalization. The Lanczos eigenvalues (Ritz values) also give excellent estimates of the eigenvalues of $A$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Variants: MINRES, SYMMLQ, BiCG, BiCGSTAB',
        body: 'CG requires $A$ to be SPD. For symmetric indefinite matrices: MINRES (minimizes residual norm), SYMMLQ.\n\nFor non-symmetric $A$: BiCG, BiCGSTAB (stabilized BiCG), TFQMR. These are all Krylov methods but without the clean optimality of CG.\n\nThe gold standard for non-symmetric: GMRES (next lesson).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la9-002-1',
      title: 'Exact convergence for 2-eigenvalue matrix',
      problem: 'If $A$ has only 2 distinct eigenvalues, how many CG steps to find the exact solution?',
      solution: 'CG converges in at most $m$ steps where $m$ is the number of distinct eigenvalues. With 2 distinct eigenvalues, CG converges in exactly 2 steps regardless of matrix size $n$.',
    },
  ],

  challenges: [
    {
      id: 'ch-la9-002-1',
      title: 'Steepest descent vs CG',
      difficulty: 'medium',
      prompt: 'Steepest descent (gradient descent) uses $\\mathbf{d}_k = \\mathbf{r}_k$ (restart direction each step) instead of the conjugate direction. Show it does NOT have the Krylov optimality property.',
      hint: 'Steepest descent does not maintain $A$-orthogonality between directions.',
      solution: 'Steepest descent picks $\\mathbf{x}_{k+1}$ that minimizes $f$ along $\\mathbf{r}_k$, but does not maintain any orthogonality of directions. New residual $\\mathbf{r}_{k+1} \\perp \\mathbf{r}_k$ (ordinary inner product), but the search directions are not $A$-orthogonal. As a result, the iterates do not minimize the error over the entire Krylov subspace — they zig-zag, converging at rate $((\\kappa-1)/(\\kappa+1))^{2k}$ vs CG\'s $(\\sqrt{\\kappa}-1)^{2k}/(\\sqrt{\\kappa}+1)^{2k}$. For $\\kappa = 100$: steepest descent convergence factor 0.98, CG 0.82 — CG is dramatically faster.',
    },
  ],

  mentalModel: [
    'CG solves $A\\mathbf{x} = \\mathbf{b}$ for SPD $A$ by minimizing energy norm error over Krylov subspaces.',
    'Each step: one matrix-vector product, $O(n)$ ops. Converges in $\\leq n$ steps (exact) or $O(\\sqrt{\\kappa})$ steps (practical).',
    'Eigenvalue clustering (few distinct eigenvalues) $\\Rightarrow$ fast convergence.',
    'Preconditioning reduces $\\kappa$, dramatically cutting iteration count.',
  ],

  checkpoints: [
    { id: 'cp-la9-002-1', question: 'What property must $A$ have for CG to be applicable?', answer: '$A$ must be symmetric positive definite (SPD).' },
    { id: 'cp-la9-002-2', question: 'How many CG steps are needed in exact arithmetic?', answer: 'At most $n$ (the number of distinct eigenvalues, in the best case).' },
    { id: 'cp-la9-002-3', question: 'What is the $k$-th Krylov subspace $\\mathcal{K}_k(A, \\mathbf{r}_0)$?', answer: '$\\text{span}\\{\\mathbf{r}_0, A\\mathbf{r}_0, A^2\\mathbf{r}_0, \\ldots, A^{k-1}\\mathbf{r}_0\\}$.' },
  ],

  assessment: 'For $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (1,2)^\\top$, $\\mathbf{x}_0 = \\mathbf{0}$: perform 2 CG steps by hand and verify you recover the exact solution.',

  quiz: [
    { id: 'q-la9-002-1', question: 'CG is applicable to:', options: ['Any invertible matrix', 'Symmetric positive definite matrices only', 'Symmetric indefinite matrices', 'Upper triangular matrices'], answer: 'Symmetric positive definite matrices only' },
    { id: 'q-la9-002-2', question: 'The convergence rate of CG depends on:', options: ['$\\det A$', '$\\text{tr}(A)$', '$\\kappa(A) = \\lambda_{max}/\\lambda_{min}$', '$\\|A\\|_F$'], answer: '$\\kappa(A) = \\lambda_{max}/\\lambda_{min}$' },
    { id: 'q-la9-002-3', question: 'The $k$-th CG iterate minimizes the energy norm error over:', options: ['All vectors', 'The span of $A^k\\mathbf{b}$', 'The $k$-th Krylov subspace', 'The eigenspace'], answer: 'The $k$-th Krylov subspace' },
  ],
};
