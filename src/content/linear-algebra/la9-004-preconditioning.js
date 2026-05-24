export default {
  id: 'la9-004',
  slug: 'preconditioning',
  chapter: 'la9',
  order: 4,
  title: 'Preconditioning',
  subtitle: 'A preconditioner $M \\approx A^{-1}$ transforms the linear system to $M^{-1}A\\mathbf{x} = M^{-1}\\mathbf{b}$, clustering eigenvalues near 1 and dramatically reducing Krylov iteration counts.',
  tags: ['preconditioning', 'ILU', 'incomplete LU', 'diagonal scaling', 'SSOR', 'AMG', 'left preconditioner', 'right preconditioner', 'condition number'],
  aliases: 'preconditioning ILU incomplete LU factorization diagonal scaling Jacobi preconditioner SSOR AMG algebraic multigrid left right preconditioner condition number reduction',

  hook: {
    question: "CG and GMRES converge in $O(\\sqrt{\\kappa})$ and $O(\\kappa)$ iterations respectively. For a poorly conditioned system with $\\kappa = 10^6$, that\'s 1000–1,000,000 iterations. Can you transform the system to have $\\kappa \\approx 1$ without solving it first?",
    realWorldContext: "Preconditioning is the difference between a practical solver and an impractical one. In computational fluid dynamics, a Navier-Stokes solver without a preconditioner may require millions of iterations; with ILU preconditioner, convergence happens in tens. MATLAB\'s \\texttt{pcg} function accepts a preconditioner as input. The Trilinos library (used in Sandia National Labs simulations) provides algebraic multigrid (AMG) preconditioners that achieve nearly $O(n)$ solve times for elliptic PDEs. AMG is why finite element simulations of millions of elements are computationally feasible.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The idea.** Instead of solving $A\\mathbf{x} = \\mathbf{b}$, solve the preconditioned system $M^{-1}A\\mathbf{x} = M^{-1}\\mathbf{b}$. If $M \\approx A$, then $M^{-1}A \\approx I$, so $\\kappa(M^{-1}A) \\ll \\kappa(A)$. The tradeoff: $M$ must be cheap to apply (solve $M\\mathbf{z} = \\mathbf{r}$ efficiently) and must approximate $A$ well enough to cluster eigenvalues.',
      '**Left vs right preconditioning.** Left: $M^{-1}A\\mathbf{x} = M^{-1}\\mathbf{b}$ — the residual $M^{-1}(\\mathbf{b} - A\\mathbf{x})$ is preconditioned. Right: $AM^{-1}\\mathbf{y} = \\mathbf{b}$, $\\mathbf{x} = M^{-1}\\mathbf{y}$ — the unpreconditioned residual $\\|\\mathbf{b} - A\\mathbf{x}\\|$ is minimized. Right preconditioning is often preferred for GMRES because it minimizes the true residual.',
      '**Common preconditioners.** (1) **Diagonal (Jacobi)**: $M = \\text{diag}(A)$. Free to apply, reduces condition number for diagonally dominant matrices, but weak for most problems. (2) **SSOR**: $M = (D+L)D^{-1}(D+U)/\\omega$ — symmetric version of Gauss-Seidel. Works well for elliptic PDEs. (3) **ILU(0)**: incomplete LU factorization — same sparsity as $A$, ignores fill-in. $LU \\approx A$ with controlled error. (4) **ILU(k)**: allows $k$ levels of fill-in. Better approximation, more memory. (5) **AMG**: algebraic multigrid — builds a hierarchy of coarser problems. Near-optimal for elliptic PDEs.',
      '**Effect on spectrum.** For the Poisson equation on an $n \\times n$ grid: unpreconditioned $\\kappa \\sim n^2$, CG converges in $O(n)$ steps. With Jacobi preconditioner: same order. With ILU(0): $\\kappa \\sim n$, CG in $O(\\sqrt{n})$ steps. With AMG: $\\kappa \\sim 1$ (bounded independent of $n$), CG in $O(1)$ steps (independent of mesh size)!',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'ILU(0): Incomplete LU Factorization',
        body: 'ILU(0) computes LU factorization of $A$ but drops fill-in (sets it to zero when the entry was zero in $A$). Result: $LU \\approx A$ with $\\text{nnz}(L) + \\text{nnz}(U) = \\text{nnz}(A)$ (no new memory).\n\nApplying preconditioner: solve $L\\mathbf{z}_1 = \\mathbf{r}$ (forward substitution), then $U\\mathbf{z} = \\mathbf{z}_1$ (back substitution). Cost: $O(\\text{nnz}(A))$ per apply.\n\nILU(k) allows $k$ levels of fill-in — better approximation, more memory, cheaper per iteration than direct solve.',
      },
      {
        type: 'insight',
        title: 'Algebraic Multigrid (AMG)',
        body: 'AMG extends classical multigrid to general sparse matrices without requiring a geometric mesh. Key idea: identify "coarse" degrees of freedom via strength of connection. Restriction operator $R$ coarsens, prolongation $P = R^\\top$ extends. Coarse-grid problem: $A_c = R A P$. V-cycle: smooth on fine, restrict, solve coarsely, prolongate, smooth again.\n\nFor SPD matrices (via BoomerAMG, HYPRE library): $\\kappa$ bounded independent of $n$. CG+AMG is $O(n)$ — the practical gold standard for elliptic PDE solves.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Preconditioning in Action',
        mathBridge: 'Compare convergence with and without preconditioners.',
        caption: 'Good preconditioner clusters eigenvalues near 1, dramatically cutting CG iterations.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Diagonal preconditioner effect',
              prose: ['See how diagonal (Jacobi) preconditioning changes the condition number.'],
              code: `% Ill-conditioned SPD matrix with varying diagonal
n = 10
% Diagonal entries vary by 3 orders of magnitude
d = [1,2,3,4,5,100,200,300,400,500]';
A = diag(d) + 0.1*(rand(n,n)+rand(n,n)')
% Make SPD
A = A + n*eye(n)  % dominant diagonal
A = 0.5*(A+A')    % symmetrize

kappa_A = cond(A)
disp('Condition number of A:')
kappa_A

% Diagonal (Jacobi) preconditioner
D = diag(diag(A))
D_half = diag(sqrt(diag(A)))
% Preconditioned system: D^{-1/2} A D^{-1/2}
A_prec = D_half \ A / D_half
kappa_prec = cond(A_prec)
disp('Condition number after diagonal scaling:')
kappa_prec
disp('Reduction factor:')
kappa_A / kappa_prec
`,
            },
            {
              id: 2,
              cellTitle: 'Preconditioned CG iteration count',
              prose: ['Count CG iterations with and without ILU preconditioning.'],
              code: `% 1D Poisson: A is tridiagonal SPD
n = 200
e = ones(n,1)
A = diag(2*e) + diag(-e(1:n-1),1) + diag(-e(1:n-1),-1)
b = ones(n,1)

% Count CG iterations without preconditioner
[x, flag, relres, iter_none] = pcg(A, b, 1e-10, 500)
disp(['No preconditioner: iterations = ', num2str(iter_none)])

% ILU(0) preconditioner
[L, U] = ilu(sparse(A), struct('type','nofill'))
M_apply = @(r) U \ (L \ r)   % apply preconditioner

% Preconditioned CG (use pcg with M1 and M2)
[x_prec, flag2, relres2, iter_ilu] = pcg(A, b, 1e-10, 500, L, U)
disp(['ILU(0) preconditioner: iterations = ', num2str(iter_ilu)])

disp('Condition numbers:')
kappa_A = cond(full(A))
[V,D] = eig(full(U\(L\A)))
eig_prec = sort(abs(diag(D)))
kappa_prec = eig_prec(end)/eig_prec(1)
[kappa_A, kappa_prec]
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Spectral analysis of preconditioning.** For left-preconditioned CG on $M^{-1}A\\mathbf{x} = M^{-1}\\mathbf{b}$ (when $M^{-1}A$ is SPD, e.g., $M$ SPD): convergence rate $\\left(\\frac{\\sqrt{\\kappa(M^{-1}A)} - 1}{\\sqrt{\\kappa(M^{-1}A)} + 1}\\right)^k$. The preconditioner quality is measured by $\\kappa(M^{-1}A)$. The ideal $M = A$ gives $\\kappa = 1$ (1 step), but is as expensive as solving the original problem. The art of preconditioning is finding the sweet spot between approximation quality and application cost.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Preconditioned System Must Be SPD',
        body: 'For preconditioned CG, $M^{-1}A$ must be symmetric positive definite in some inner product. If $M$ is symmetric positive definite, then $M^{-1}A$ is SPD in the $M$-inner product. A common formulation uses the split preconditioner: $M = LL^\\top$ (Cholesky), solve $L^{-1}AL^{-\\top}\\hat{\\mathbf{x}} = L^{-1}\\mathbf{b}$. The transformed matrix $\\hat{A} = L^{-1}AL^{-\\top}$ is explicitly symmetric.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Block and domain decomposition preconditioners.** For parallel computation, the matrix can be partitioned into blocks: $A = \\begin{bmatrix}A_{11}&A_{12}\\\\A_{21}&A_{22}\\end{bmatrix}$. Block Jacobi preconditioner: $M = \\text{blkdiag}(A_{11}, A_{22})$ — solve each block independently (parallelizable). Block ILU: account for off-diagonal blocks. Domain decomposition preconditioners (Schwarz methods) solve the system independently on overlapping subdomains and combine solutions.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Practical Preconditioning Guide',
        body: 'SPD elliptic PDE: CG + AMG (near-optimal)\nSPD tridiagonal/banded: CG + ILU(0) or SSOR\nSPD poorly scaled: CG + diagonal scaling first\nNon-symmetric: GMRES + ILU(k)\nHighly non-normal: GMRES + custom domain decomposition\nLarge parallel: GMRES/CG + BoomerAMG (HYPRE)\n\nRule of thumb: start with ILU(0), increase fill if needed. If that fails, try AMG.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la9-004-1',
      title: 'Diagonal scaling',
      problem: 'A system has $A = \\text{diag}(1, 100)$. What is $\\kappa(A)$? After diagonal scaling with $D = A$, what is $\\kappa(D^{-1}A)$?',
      solution: '$\\kappa(A) = 100/1 = 100$. After scaling: $D^{-1}A = \\text{diag}(1,1) = I$, so $\\kappa(I) = 1$. One CG step finds the exact solution.',
    },
  ],

  challenges: [
    {
      id: 'ch-la9-004-1',
      title: 'Why ILU(0) works',
      difficulty: 'medium',
      prompt: 'ILU(0) for a tridiagonal matrix $A$ produces an exact LU factorization (no fill-in dropped). Explain why and what $\\kappa(U^{-1}L^{-1}A)$ should be.',
      hint: 'What is the sparsity pattern of $L$ and $U$ when $A$ is tridiagonal?',
      solution: 'For a tridiagonal $A$, the LU factors $L$ (bidiagonal, lower) and $U$ (bidiagonal, upper) have the same sparsity pattern as $A$ — no fill-in is generated. So ILU(0) = exact LU for tridiagonal matrices, meaning $LU = A$ exactly, and $U^{-1}L^{-1}A = I$, $\\kappa = 1$. CG+ILU(0) converges in 1 step (in exact arithmetic) for tridiagonal systems.',
    },
  ],

  mentalModel: [
    'Preconditioner $M \\approx A^{-1}$ transforms $A\\mathbf{x}=\\mathbf{b}$ so eigenvalues cluster near 1.',
    'Trade-off: quality of approximation vs cost of applying $M^{-1}$.',
    'Diagonal scaling: free, handles poorly scaled matrices.',
    'ILU(k): sparse approximate LU, $O(\\text{nnz})$ apply cost.',
    'AMG: optimal for elliptic PDEs, $\\kappa$ bounded independent of problem size.',
  ],

  checkpoints: [
    { id: 'cp-la9-004-1', question: 'What does a preconditioner $M$ do to a Krylov method?', answer: 'Transforms the system so $\\kappa(M^{-1}A)$ is much smaller than $\\kappa(A)$, reducing iteration count.' },
    { id: 'cp-la9-004-2', question: 'What is ILU(0)?', answer: 'Incomplete LU factorization with no fill-in: compute LU of $A$ but drop entries where $A$ is zero. Cost $O(\\text{nnz}(A))$ to apply.' },
    { id: 'cp-la9-004-3', question: 'What is the difference between left and right preconditioning?', answer: 'Left: $M^{-1}A\\mathbf{x} = M^{-1}\\mathbf{b}$ (preconditioned residual minimized). Right: $AM^{-1}\\mathbf{y} = \\mathbf{b}$ (true residual minimized — preferred for GMRES).' },
  ],

  assessment: 'For the 2D Poisson equation on an $n\\times n$ grid (condition number $\\kappa \\sim n^2$): compare the iteration counts expected for CG without preconditioner, with diagonal preconditioner, and with an ideal AMG preconditioner.',

  quiz: [
    { id: 'q-la9-004-1', question: 'The purpose of preconditioning is to:', options: ['Make the matrix denser', 'Reduce $\\kappa(M^{-1}A)$ to reduce iteration count', 'Convert non-symmetric to symmetric', 'Avoid storing the matrix'], answer: 'Reduce $\\kappa(M^{-1}A)$ to reduce iteration count' },
    { id: 'q-la9-004-2', question: 'ILU(0) differs from exact LU because:', options: ['It uses a different pivoting strategy', 'It drops fill-in (zeros out entries outside the sparsity of $A$)', 'It requires $A$ to be SPD', 'It uses the $QR$ factorization instead'], answer: 'It drops fill-in (zeros out entries outside the sparsity of $A$)' },
    { id: 'q-la9-004-3', question: 'AMG (algebraic multigrid) achieves near $O(n)$ complexity by:', options: ['Using fast Fourier transforms', 'Building a hierarchy of coarser problems via coarsening', 'Ignoring small eigenvalues', 'Parallelizing matrix-vector products'], answer: 'Building a hierarchy of coarser problems via coarsening' },
  ],
};
