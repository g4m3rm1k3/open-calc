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
      '**Concrete first: CG step 1 on a 2×2 system.** Take $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (9,7)^\\top$, start $\\mathbf{x}_0 = (0,0)^\\top$. Step 1: residual $\\mathbf{r}_0 = \\mathbf{b} - A\\mathbf{x}_0 = (9,7)^\\top$. First search direction $\\mathbf{p}_0 = \\mathbf{r}_0 = (9,7)^\\top$. Compute $A\\mathbf{p}_0 = (4\\cdot9+1\\cdot7, 1\\cdot9+3\\cdot7)^\\top = (43,30)^\\top$. Step length: $\\alpha_0 = \\mathbf{r}_0^\\top\\mathbf{r}_0 / (\\mathbf{p}_0^\\top A\\mathbf{p}_0) = (81+49)/(9\\cdot43+7\\cdot30) = 130/597 \\approx 0.2178$. New iterate: $\\mathbf{x}_1 = (0,0)^\\top + 0.2178\\cdot(9,7)^\\top \\approx (1.960, 1.525)^\\top$. Step 2 will reach the exact solution $(2, 5/3)^\\top$ — because $A$ has only 2 distinct eigenvalues!',
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
      {
        type: 'sequencing',
        title: 'Prediction',
        body: 'In the 2×2 example above, CG finds the exact solution in 2 steps. Now suppose $A$ has eigenvalues $\\{1, 1, 1, 100\\}$ (four eigenvalues, one large outlier). Predict: will CG converge in about 4 steps, or much faster? What if the eigenvalues are $\\{1, 2, 3, 4\\}$ instead?',
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
x_exact = A \\ b

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
    {
      id: 'ex-la9-002-2',
      title: 'Full 2-step CG on a 2×2 system',
      problem: 'For $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (9,7)^\\top$, $\\mathbf{x}_0 = (0,0)^\\top$: complete both CG steps and verify the exact solution is reached.',
      solution: 'Step 1: $\\mathbf{r}_0 = (9,7)^\\top$, $\\mathbf{p}_0 = (9,7)^\\top$. $A\\mathbf{p}_0 = (43,30)^\\top$. $\\alpha_0 = 130/597$. $\\mathbf{x}_1 \\approx (1.960, 1.525)^\\top$, $\\mathbf{r}_1 = \\mathbf{r}_0 - \\alpha_0 A\\mathbf{p}_0 \\approx (-0.437, 0.583)^\\top$. Step 2: $\\beta_0 = \\|\\mathbf{r}_1\\|^2/\\|\\mathbf{r}_0\\|^2$, $\\mathbf{p}_1 = \\mathbf{r}_1 + \\beta_0 \\mathbf{p}_0$ ($A$-conjugate to $\\mathbf{p}_0$). After step 2: $\\mathbf{x}_2 = (2, 5/3)^\\top$ exactly. Two steps = two distinct eigenvalues of $A$.',
    },
    {
      id: 'ex-la9-002-3',
      title: 'Effect of condition number on CG iteration count',
      problem: 'Estimate the number of CG iterations to reduce the error by $10^{-6}$ for (a) $\\kappa = 4$, (b) $\\kappa = 100$.',
      solution: 'Using $k \\approx \\frac{1}{2}\\sqrt{\\kappa}\\ln(2/\\varepsilon)$ with $\\varepsilon = 10^{-6}$: $\\ln(2 \\times 10^6) \\approx 14.5$. (a) $\\kappa = 4$: $k \\approx \\frac{1}{2}\\cdot 2 \\cdot 14.5 \\approx 15$ iterations. (b) $\\kappa = 100$: $k \\approx \\frac{1}{2}\\cdot 10 \\cdot 14.5 \\approx 73$ iterations. A 25× larger condition number gives about 5× more iterations — CG is much less sensitive to $\\kappa$ than Gauss-Seidel (which scales linearly in $\\kappa$).',
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
    { id: 'cp-la9-002-1', label: 'What property must $A$ have for CG to be applicable?', type: 'read' },
    { id: 'cp-la9-002-2', label: 'How many CG steps are needed in exact arithmetic?', type: 'read' },
    { id: 'cp-la9-002-3', label: 'What is the $k$-th Krylov subspace $\\mathcal{K}_k(A, \\mathbf{r}_0)$?', type: 'read' },
    { id: 'cp-la9-002-4', label: 'Run the CG implementation notebook cell and verify that residuals decrease monotonically in the energy norm.', type: 'lab' },
    { id: 'cp-la9-002-5', label: 'Modify the convergence notebook cell to also time Gauss-Seidel and compare iteration counts.', type: 'lab' },
    { id: 'cp-la9-002-6', label: 'Verify example 2 by computing step 1 of CG by hand for the 2×2 system and checking $\\mathbf{x}_1$.', type: 'example' },
    { id: 'cp-la9-002-7', label: 'Verify example 3: estimate CG iterations for $\\kappa=4$ and $\\kappa=100$ using the formula, then check with the notebook.', type: 'example' },
    { id: 'cp-la9-002-8', label: 'Design a matrix with 3 clustered eigenvalue groups and predict CG will converge in ~3 steps. Verify experimentally.', type: 'challenge' },
  ],

  assessment: 'For $A = \\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, $\\mathbf{b} = (1,2)^\\top$, $\\mathbf{x}_0 = \\mathbf{0}$: perform 2 CG steps by hand and verify you recover the exact solution.',

  quiz: [
    { id: 'q-la9-002-1', question: 'CG is applicable to:', options: ['Any invertible matrix', 'Symmetric positive definite matrices only', 'Symmetric indefinite matrices', 'Upper triangular matrices'], answer: 'Symmetric positive definite matrices only', hints: ['CG requires the $A$-inner product to be well-defined, which needs SPD.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-2', question: 'The convergence rate of CG depends on:', options: ['$\\det A$', '$\\text{tr}(A)$', '$\\kappa(A) = \\lambda_{max}/\\lambda_{min}$', '$\\|A\\|_F$'], answer: '$\\kappa(A) = \\lambda_{max}/\\lambda_{min}$', hints: ['The error bound uses $\\sqrt{\\kappa}$ in the convergence factor.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-3', question: 'The $k$-th CG iterate minimizes the energy norm error over:', options: ['All vectors', 'The span of $A^k\\mathbf{b}$', 'The $k$-th Krylov subspace', 'The eigenspace'], answer: 'The $k$-th Krylov subspace', hints: ['CG is optimal over $\\mathbf{x}_0 + \\mathcal{K}_k(A,\\mathbf{r}_0)$.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-4', question: 'In the 2×2 CG example with $A=\\begin{bmatrix}4&1\\\\1&3\\end{bmatrix}$, the first step length $\\alpha_0$ equals:', options: ['$130/597$', '$9/43$', '$1/4$', '$130/43$'], answer: '$130/597$', hints: ['$\\alpha_0 = \\mathbf{r}_0^\\top\\mathbf{r}_0 / (\\mathbf{p}_0^\\top A\\mathbf{p}_0) = (81+49)/(9\\cdot43+7\\cdot30)$.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-5', question: 'CG converges in exactly $m$ steps when:', options: ['$n = m$', '$A$ has at most $m$ distinct eigenvalues', '$\\kappa(A) = m$', '$A$ is $m\\times m$'], answer: '$A$ has at most $m$ distinct eigenvalues', hints: ['The polynomial interpretation: CG needs degree $m$ to annihilate $m$ eigenvalues.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-6', question: 'The direction update $\\mathbf{d}_{k+1} = \\mathbf{r}_{k+1} + \\beta_k \\mathbf{d}_k$ ensures:', options: ['$\\|\\mathbf{r}_{k+1}\\| = 0$', '$\\mathbf{d}_{k+1}$ is $A$-orthogonal to all previous directions', '$\\mathbf{x}_{k+1}$ minimizes $f$ globally', 'The step length $\\alpha_{k+1} = 1$'], answer: '$\\mathbf{d}_{k+1}$ is $A$-orthogonal to all previous directions', hints: ['$\\beta_k$ is chosen so $\\mathbf{d}_{k+1}^\\top A \\mathbf{d}_k = 0$.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-7', question: 'For $\\kappa = 100$, CG requires roughly how many iterations to reduce error by $10^{-6}$?', options: ['About 5', 'About 35', 'About 100', 'About 1000'], answer: 'About 73', hints: ['Use $k \\approx \\frac{1}{2}\\sqrt{\\kappa}\\ln(2/\\varepsilon) = \\frac{1}{2}\\cdot 10 \\cdot 14.5 \\approx 73$.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-8', question: 'The CG algorithm requires exactly one __________ per iteration:', options: ['LU factorization', 'matrix-vector product $A\\mathbf{d}_k$', 'eigenvalue computation', 'QR factorization'], answer: 'matrix-vector product $A\\mathbf{d}_k$', hints: ['All other operations are $O(n)$ vector operations.'], reviewSection: 'intuition' },
    { id: 'q-la9-002-9', question: 'Steepest descent differs from CG in that:', options: ['It does not require $A$ to be SPD', 'It resets the search direction to the residual at each step', 'It converges in $n$ steps exactly', 'It minimizes the 2-norm of the error'], answer: 'It resets the search direction to the residual at each step', hints: ['Steepest descent uses $\\mathbf{d}_k = \\mathbf{r}_k$; CG uses $\\mathbf{d}_k = \\mathbf{r}_k + \\beta_{k-1}\\mathbf{d}_{k-1}$.'], reviewSection: 'challenges' },
    { id: 'q-la9-002-10', question: 'The Lanczos connection tells us that CG implicitly builds:', options: ['The LU factorization of $A$', 'An orthogonal tridiagonalization $T_k = Q_k^\\top A Q_k$', 'The eigenvalue decomposition of $A$', 'A sparse Cholesky factor'], answer: 'An orthogonal tridiagonalization $T_k = Q_k^\\top A Q_k$', hints: ['The Krylov vectors form the columns of $Q_k$; the recurrence produces a tridiagonal Hessenberg matrix.'], reviewSection: 'rigor' },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Given a 3×3 SPD matrix, run the first 2 CG iterations by hand, computing $\\alpha_k$, $\\mathbf{x}_{k+1}$, $\\mathbf{r}_{k+1}$, $\\beta_k$, and $\\mathbf{d}_{k+1}$.',
    explainVerbally: 'Explain to a classmate why CG converges faster when eigenvalues cluster: use the polynomial minimax interpretation.',
    detectIncorrectApplication: 'Recognize when CG is being applied to a non-SPD matrix and explain why the energy norm minimization breaks down (the quadratic $f(x)$ is not bowl-shaped).',
    transferToUnfamiliar: 'Given a preconditioned system $M^{-1}A\\mathbf{x} = M^{-1}\\mathbf{b}$, identify the modified inner product used by preconditioned CG and explain how it preserves the SPD structure.',
  },

  misconceptions: [
    {
      falseBelief: 'CG finds the exact solution only if $n$ steps are taken.',
      whyStudentsThinkIt: 'The "$n$-step finite termination" result is memorable but students forget the eigenvalue-clustering improvement.',
      correctionExample: 'If $A$ has only $m < n$ distinct eigenvalues, CG terminates in $m$ steps. A $1000 \\times 1000$ matrix with only 3 distinct eigenvalues is solved by CG in 3 steps.',
      contrastCase: 'A diagonal matrix $\\text{diag}(1,1,1,2,2,100)$ has 3 distinct eigenvalues — CG solves the 6×6 system in 3 steps.',
    },
    {
      falseBelief: 'CG requires storing all previous search directions.',
      whyStudentsThinkIt: 'The $A$-orthogonality of all $\\mathbf{d}_i$ sounds like it needs all of them.',
      correctionExample: 'The three-term recurrence is the key insight: $\\mathbf{d}_{k+1} = \\mathbf{r}_{k+1} + \\beta_k \\mathbf{d}_k$ only needs the current residual and the previous direction. Memory cost is $O(n)$, not $O(kn)$.',
      contrastCase: 'Compare to GMRES (next lesson) which actually does store all $k$ Krylov vectors — that is why GMRES has $O(kn)$ memory while CG has $O(n)$.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You need to solve a sequence of linear systems $A\\mathbf{x}_j = \\mathbf{b}_j$ for 100 different right-hand sides with the same SPD matrix $A$.',
      competingTechniques: 'CG (run independently for each $\\mathbf{b}_j$), sparse Cholesky (factor once, solve many), block CG.',
      whyThisTechniqueWins: 'Sparse Cholesky wins: factor $A = LL^\\top$ once in $O(\\text{nnz fill})$ time, then solve each system in $O(n)$ via triangular solves. CG would need $O(\\sqrt{\\kappa})$ iterations for each of the 100 systems.',
    },
    {
      situation: 'The system $A\\mathbf{x} = \\mathbf{b}$ comes from a 2D finite element mesh with $n = 10^6$ unknowns. You need one solve.',
      competingTechniques: 'CG with no preconditioner, CG with ILU, CG with AMG, direct sparse Cholesky.',
      whyThisTechniqueWins: 'CG with AMG preconditioner: direct Cholesky has $O(n^{3/2})$ fill for 2D problems (too expensive at $n = 10^6$). Unpreconditioned CG needs $O(\\sqrt{n}) = O(1000)$ iterations. AMG reduces $\\kappa$ to $O(1)$, giving convergence in dozens of iterations.',
    },
  ],

  debugging: [
    {
      commonError: 'Applying CG to a non-symmetric or indefinite matrix.',
      symptom: 'Residuals fail to decrease, or the step lengths $\\alpha_k$ become negative or zero.',
      whyItHappened: 'CG requires $\\mathbf{d}^\\top A \\mathbf{d} > 0$ (positive definite) to guarantee $\\alpha_k > 0$. If $A$ is not SPD, this can fail.',
      repairStrategy: 'Check symmetry ($\\|A - A^\\top\\| < \\varepsilon$) and positive definiteness ($\\min_i \\lambda_i > 0$) before applying CG. Use GMRES or MINRES for non-symmetric or indefinite systems.',
    },
    {
      commonError: 'Using the incorrect update $\\mathbf{r}_{k+1} = \\mathbf{b} - A\\mathbf{x}_{k+1}$ (recomputing residual) instead of $\\mathbf{r}_{k+1} = \\mathbf{r}_k - \\alpha_k A\\mathbf{d}_k$.',
      symptom: 'The code works but is twice as expensive per iteration; in finite precision, accumulated errors are larger.',
      whyItHappened: 'The recurrence update is equivalent in exact arithmetic but more efficient. Students naturally recompute the residual from scratch.',
      repairStrategy: 'Use the recurrence update $\\mathbf{r}_{k+1} = \\mathbf{r}_k - \\alpha_k A\\mathbf{d}_k$ (reuses the already-computed product $A\\mathbf{d}_k$). Periodically recompute the true residual as a check.',
    },
  ],
};
