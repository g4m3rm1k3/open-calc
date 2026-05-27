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
  },

  intuition: {
    prose: [
      'Where you are in the story: CG and GMRES are powerful, but their convergence depends critically on the condition number $\\kappa(A)$. CG needs $O(\\sqrt{\\kappa})$ iterations; GMRES up to $O(\\kappa)$. For the 2D Poisson equation on an $n$-point grid, $\\kappa \\sim n$, so CG needs $O(\\sqrt{n})$ iterations. On a $1000 \\times 1000$ grid ($n = 10^6$ unknowns), that is 1000 CG iterations just to converge. And the hardest practical problems — fluid dynamics at high Reynolds number, electromagnetics near resonance — can have $\\kappa = 10^8$ or more. Preconditioning is how you make Krylov methods practical for these cases.',
      'The core idea is transformation. Instead of solving $A\\mathbf{x} = \\mathbf{b}$ directly, you solve the equivalent system $M^{-1}A\\mathbf{x} = M^{-1}\\mathbf{b}$, where $M$ is a matrix you choose. If $M \\approx A$, then $M^{-1}A \\approx I$, so $\\kappa(M^{-1}A) \\ll \\kappa(A)$ and the Krylov iteration converges in far fewer steps. The catch: $M$ must be cheap to apply (solving $M\\mathbf{z} = \\mathbf{r}$ must cost much less than solving $A\\mathbf{x} = \\mathbf{b}$), and it must be a good enough approximation of $A$ that the eigenvalues of $M^{-1}A$ cluster near 1.',
      'A concrete illustration: take $A = \\text{diag}(1, 100)$, $\\mathbf{b} = (1, 100)^\\top$. Without preconditioning, $\\kappa(A) = 100$. CG needs about 30 iterations to reduce error by $10^{-6}$. Now precondition with $M = \\text{diag}(A) = \\text{diag}(1, 100)$. The preconditioned system is $M^{-1}A = I$ with condition number 1. Preconditioned CG solves this in exactly 1 step. That is the extreme case — the preconditioner is the matrix itself — but it illustrates the principle vividly: the condition number controls everything, and a good preconditioner eliminates it.',
      'The simplest family of preconditioners are **splitting-based**: they derive from the same matrix splittings used in stationary iterations. The **Jacobi preconditioner** sets $M = D = \\text{diag}(A)$: applying it costs $O(n)$ (just divide each component by the diagonal). This helps when the bad conditioning comes from poorly scaled rows — all it does is normalize each row by its diagonal entry. For many practical matrices where the off-diagonal entries are the problem, Jacobi preconditioning barely helps. **SSOR** uses $M = (D - L)D^{-1}(D - U)$ (the symmetric Gauss-Seidel preconditioner) and works significantly better for elliptic PDEs, reducing $\\kappa$ from $O(h^{-2})$ to $O(h^{-1})$.',
      '**Predict before reading on:** Suppose $A$ has $\\kappa(A) = 10^6$ and you apply the Jacobi preconditioner $M = \\text{diag}(A)$. Without knowing the specific off-diagonal entries, would you expect $\\kappa(M^{-1}A)$ to be much less than $10^6$, or could it still be large? When would diagonal scaling actually help?',
      'The answer: diagonal scaling helps most when the large condition number is caused by row scaling differences — when the diagonal entries span many orders of magnitude. If row 1 has $a_{11} = 1$ and row 2 has $a_{22} = 10^6$ but everything is otherwise well-behaved, scaling by the diagonal fixes the problem. But if all diagonal entries are the same and the problem comes from off-diagonal coupling or near-singularity of some directions, Jacobi does almost nothing. This is why **ILU(0)** — incomplete LU factorization — is the workhorse of practical computing. ILU(0) computes a sparse LU factorization of $A$ that ignores fill-in: it performs Gaussian elimination but drops any new nonzero entry that would appear in a position that was originally zero. The result is $LU \\approx A$ with the same sparsity pattern, costing $O(\\text{nnz})$ to apply (two triangular solves).',
      'The gold standard for elliptic PDEs is **Algebraic Multigrid (AMG)**. The idea: if the slow convergence of iterative methods comes from low-frequency, smooth error components that are hard to eliminate on a fine grid, perhaps you can represent those components cheaply on a coarser grid. AMG automatically identifies a coarse set of degrees of freedom, builds restriction ($A_c = R A P$) and prolongation operators, and creates a hierarchy of smaller problems. A V-cycle applies smoothing on the fine grid, restricts the residual to the coarse grid, solves there, prolongates the correction back, and smooths again. With AMG as a preconditioner, $\\kappa(M^{-1}A)$ is bounded independently of $n$ — CG+AMG achieves $O(n)$ total work for the largest finite element problems in the world.',
      'Left vs right preconditioning is a practical detail but matters for GMRES. **Left preconditioning** applies $M^{-1}$ to the residual: the iteration minimizes $\\|M^{-1}(\\mathbf{b} - A\\mathbf{x})\\|$, which is the preconditioned residual. **Right preconditioning** solves $AM^{-1}\\mathbf{y} = \\mathbf{b}$ then recovers $\\mathbf{x} = M^{-1}\\mathbf{y}$: the iteration minimizes the true residual $\\|\\mathbf{b} - A\\mathbf{x}\\|$. Right preconditioning is generally preferred for GMRES because convergence is measured in the unpreconditioned residual — you know exactly how close you are to the true solution.',
      'Where this is heading: the final lesson in this chapter covers sparse direct solvers — the algorithms used when you absolutely need the exact solution and cannot afford iterative convergence failures. Sparse direct solvers (CHOLMOD, UMFPACK, SuperLU) use sophisticated reordering strategies to minimize fill-in during LU factorization. Understanding when to use direct vs iterative methods, and how to combine them (direct solve as a preconditioner for iterative refinement), is the capstone of large-scale linear algebra in practice.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 5 — Iterative Solvers & Preconditioning',
        body: '**Previous (Lesson 3):** GMRES — Arnoldi orthogonalization, Hessenberg least squares, convergence for non-symmetric systems.\n**This lesson:** Preconditioning — Jacobi, SSOR, ILU(0), AMG; how to cluster eigenvalues and make Krylov methods practical.\n**Next (Lesson 5):** Sparse Direct Solvers — fill-in reduction, reordering, when to use direct vs iterative methods.',
      },
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
        id: 'PythonNotebook',
        title: 'Preconditioning in Python',
        mathBridge: 'Compare Jacobi, ILU, and no preconditioner on a Poisson-like system — see the eigenvalue clustering effect directly.',
        caption: 'Better preconditioners cluster eigenvalues of $M^{-1}A$ near 1, cutting CG iterations.',
        initialProps: {
          initialCells: [
            {
              id: 1,

              cellTitle: 'Eigenvalue clustering: no preconditioner vs Jacobi vs ILU',
              prose: 'Build a 1D Poisson matrix, compute eigenvalues of the original and preconditioned systems, and plot the clustering effect.',
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.linalg import solve_triangular

n = 20
# 1D Poisson: tridiagonal with 2 on diagonal, -1 off
A = np.diag(2 * np.ones(n)) + np.diag(-np.ones(n-1), 1) + np.diag(-np.ones(n-1), -1)

# --- Preconditioners ---
# 1. None: eigenvalues of A
eigs_A = np.sort(np.linalg.eigvalsh(A))

# 2. Jacobi: M_inv = diag(1/a_ii)
M_jac_inv = np.diag(1 / np.diag(A))
A_jac = M_jac_inv @ A
eigs_jac = np.sort(np.linalg.eigvalsh((A_jac + A_jac.T) / 2))  # symmetrized

# 3. Incomplete Cholesky (IC(0)): for SPD, use lower triangular part
# Simple IC(0): zero-fill-in Cholesky
L_ic = np.zeros_like(A)
for j in range(n):
    s = A[j, j] - sum(L_ic[j, :j]**2)
    L_ic[j, j] = np.sqrt(max(s, 1e-14))
    for i in range(j+1, n):
        if A[i, j] != 0:  # only fill where A has nonzeros
            L_ic[i, j] = (A[i, j] - sum(L_ic[i, :j] * L_ic[j, :j])) / L_ic[j, j]

# M^{-1} A = (L L^T)^{-1} A = L^{-T} (L^{-1} A)
L_inv_A = solve_triangular(L_ic, A, lower=True)
A_ic = solve_triangular(L_ic, L_inv_A.T, lower=True).T
eigs_ic = np.sort(np.linalg.eigvalsh((A_ic + A_ic.T) / 2))

print(f"kappa(A):           {eigs_A[-1]/eigs_A[0]:.1f}")
print(f"kappa(Jacobi^-1 A): {eigs_jac[-1]/eigs_jac[0]:.1f}")
print(f"kappa(IC(0)^-1 A):  {eigs_ic[-1]/eigs_ic[0]:.1f}")

fig, axes = plt.subplots(1, 3, figsize=(12, 3))
for ax, eigs, title in zip(axes,
    [eigs_A, eigs_jac, eigs_ic],
    ['No preconditioner', 'Jacobi', 'IC(0)']):
    ax.plot(eigs, 'bo', markersize=5)
    ax.axhline(1, color='r', linestyle='--', alpha=0.5)
    ax.set_title(f'{title}\\nkappa={eigs[-1]/eigs[0]:.1f}')
    ax.set_xlabel('Eigenvalue index'); ax.set_ylabel('Eigenvalue')
    ax.grid(True)
plt.tight_layout(); plt.show()
`,
            },
            {
              id: 2,

              cellTitle: 'CG iteration count vs preconditioner quality',
              prose: 'Compare CG convergence with three preconditioners on a larger system. Count iterations needed to reach tolerance 1e-8.',
              code: `import numpy as np
from scipy.sparse import diags
from scipy.sparse.linalg import cg, LinearOperator
from scipy.linalg import solve_triangular

def make_poisson(n):
    return (np.diag(2*np.ones(n)) + np.diag(-np.ones(n-1),1)
            + np.diag(-np.ones(n-1),-1)).astype(float)

def count_cg(A, b, M_apply=None, tol=1e-8):
    count = [0]
    def callback(x): count[0] += 1
    if M_apply is None:
        x, info = cg(A, b, tol=tol, callback=callback, maxiter=500)
    else:
        n = len(b)
        M_op = LinearOperator((n, n), matvec=M_apply)
        x, info = cg(A, b, M=M_op, tol=tol, callback=callback, maxiter=500)
    return count[0], info

results = []
for n in [20, 40, 80, 160]:
    A = make_poisson(n)
    b = np.ones(n)

    # No preconditioner
    k_none, _ = count_cg(A, b)

    # Jacobi preconditioner
    d_inv = 1 / np.diag(A)
    k_jac, _ = count_cg(A, b, M_apply=lambda v: d_inv * v)

    # Diagonal scaling shifts kappa from O(n^2) to same order for tridiagonal...
    # Show how n^0.5 scaling works
    results.append((n, k_none, k_jac))
    print(f"n={n:4d}: no-precond={k_none:4d} iters, Jacobi={k_jac:4d} iters, sqrt(n)={n**0.5:.0f}")

import matplotlib.pyplot as plt
ns, k_none_all, k_jac_all = zip(*results)
plt.figure(figsize=(6, 4))
plt.loglog(ns, k_none_all, 'b-o', label='No preconditioner')
plt.loglog(ns, k_jac_all,  'r-s', label='Jacobi preconditioner')
plt.loglog(ns, [n**0.5 for n in ns], 'k--', label='O(sqrt(n))')
plt.xlabel('System size n'); plt.ylabel('CG iterations')
plt.title('Iteration count vs system size')
plt.legend(); plt.grid(True); plt.tight_layout(); plt.show()
`,
            },
          ],
        },
      },
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
    {
      id: 'ex-la9-004-2',
      title: 'ILU(0) preconditioner for a tridiagonal matrix',
      problem: 'Compute ILU(0) for $A = \\begin{bmatrix}4&-1&0\\\\-1&4&-1\\\\0&-1&4\\end{bmatrix}$ (1D Poisson). Show that ILU(0) has the same sparsity as $A$.',
      steps: [
        {
          expression: 'L = \\begin{bmatrix}1&0&0\\\\l_{21}&1&0\\\\0&l_{32}&1\\end{bmatrix}, \\quad U = \\begin{bmatrix}u_{11}&u_{12}&0\\\\0&u_{22}&u_{23}\\\\0&0&u_{33}\\end{bmatrix}',
          annotation: 'ILU(0) uses the same sparsity pattern as $A$. So $L$ has the same lower entries as $A$ and $U$ has the same upper entries — no fill allowed.',
          strategyTitle: 'ILU(0) sparsity = original sparsity of $A$',
        },
        {
          expression: 'u_{11} = 4, \\quad l_{21} = -1/4, \\quad u_{12} = -1',
          annotation: 'First column: $u_{11} = a_{11} = 4$; $l_{21} = a_{21}/u_{11} = -1/4$.',
          strategyTitle: 'Column 1 elimination',
        },
        {
          expression: 'u_{22} = a_{22} - l_{21} u_{12} = 4 - (-1/4)(-1) = 4 - 1/4 = 15/4',
          annotation: '',
          strategyTitle: 'Pivot $u_{22}$',
        },
        {
          expression: 'l_{32} = -1/(15/4) = -4/15, \\quad u_{33} = 4 - (-4/15)(-1) = 4 - 4/15 = 56/15',
          annotation: 'Complete ILU(0): $L$ and $U$ are bidiagonal with the same pattern as the sub- and superdiagonal of $A$. No fill-in anywhere — this is the "0" in ILU(0).',
          strategyTitle: 'Complete ILU(0)',
        },
      ],
    },
    {
      id: 'ex-la9-004-3',
      title: 'How preconditioning changes CG iteration count',
      problem: 'A 2D Poisson problem on an $n \\times n$ grid has $N = n^2$ unknowns and $\\kappa(A) = O(n^2) = O(N)$. Estimate the CG iteration counts needed to reduce error by $10^{-6}$ for: (a) no preconditioner, (b) diagonal preconditioner, (c) ILU(0) preconditioner with $\\kappa(M^{-1}A) = O(1)$ (optimal).',
      steps: [
        {
          expression: '\\text{CG iterations} \\approx \\frac{1}{2}\\sqrt{\\kappa} \\ln(2/\\varepsilon) \\approx \\frac{1}{2}\\sqrt{\\kappa} \\times 14',
          annotation: 'The CG error bound: $k \\geq \\frac{1}{2}\\sqrt{\\kappa}\\ln(2/\\varepsilon)$ for $10^{-6}$ reduction ($\\ln(2 \\times 10^6) \\approx 14$).',
          strategyTitle: 'CG convergence estimate',
        },
        {
          expression: '\\text{No preconditioner: } \\kappa = n^2, \\quad k \\approx 7n \\text{ iterations}',
          annotation: 'For $n = 100$: $k \\approx 700$ iterations. For $n = 1000$: $k \\approx 7000$. Iteration count grows with problem size.',
          strategyTitle: '(a) No preconditioner: $k = O(n)$',
        },
        {
          expression: '\\text{Diagonal scaling: } \\kappa(D^{-1}A) = O(n^2) \\text{ still}, \\quad k \\approx 7n$',
          annotation: 'For the Poisson matrix, diagonal entries are all equal (= 4 for interior points), so diagonal scaling does nothing: $\\kappa$ is unchanged. Diagonal preconditioning helps only when the matrix is poorly scaled.',
          strategyTitle: '(b) Diagonal preconditioning: no help here',
        },
        {
          expression: '\\text{ILU(0) or AMG: } \\kappa(M^{-1}A) = O(1), \\quad k = O(1) \\text{ iterations}',
          annotation: 'With an optimal preconditioner, the condition number is bounded independently of $n$: a fixed number of CG iterations (say, 20) suffices regardless of problem size. This is the $O(N)$ total work that makes AMG the gold standard for PDE problems.',
          strategyTitle: '(c) Optimal preconditioning: $k = O(1)$',
        },
      ],
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
    { id: 'cp-la9-004-1', label: 'Read: preconditioning idea and condition number', type: 'read' },
    { id: 'cp-la9-004-2', label: 'Read: ILU and AMG preconditioner types', type: 'read' },
    { id: 'cp-la9-004-3', label: 'Read: left vs right preconditioning', type: 'read' },
    { id: 'cp-la9-004-4', label: 'Try: measure condition before and after preconditioning', type: 'lab' },
    { id: 'cp-la9-004-5', label: 'Try: compare CG iteration count with/without preconditioner', type: 'lab' },
    { id: 'cp-la9-004-6', label: 'Work: diagonal scaling for diag(1,100)', type: 'example' },
    { id: 'cp-la9-004-7', label: 'Work: ILU(0) on tridiagonal matrix', type: 'example' },
    { id: 'cp-la9-004-8', label: 'Challenge: estimate CG iterations for Poisson with/without preconditioner', type: 'challenge' },
  ],

  assessment: 'For the 2D Poisson equation on an $n\\times n$ grid (condition number $\\kappa \\sim n^2$): compare the iteration counts expected for CG without preconditioner, with diagonal preconditioner, and with an ideal AMG preconditioner.',

  quiz: [
    {
      id: 'q-la9-004-1',
      type: 'choice',
      text: 'The purpose of preconditioning is to:',
      options: ['Make the matrix denser', 'Reduce $\\kappa(M^{-1}A)$ to reduce iteration count', 'Convert non-symmetric to symmetric', 'Avoid storing the matrix'],
      answer: 'Reduce $\\kappa(M^{-1}A)$ to reduce iteration count',
      hints: ['Krylov methods converge in $O(\\sqrt{\\kappa})$ iterations for CG. Reducing $\\kappa$ from $10^6$ to $10$ reduces iterations from $\\sim 1000$ to $\\sim 10$. The preconditioner must satisfy: cheap to apply ($M^{-1}$) AND good approximation to $A^{-1}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-004-2',
      type: 'choice',
      text: 'ILU(0) differs from exact LU because:',
      options: ['It uses a different pivoting strategy', 'It drops fill-in, keeping only non-zeros at original sparsity positions', 'It requires $A$ to be SPD', 'It uses the $QR$ factorization instead'],
      answer: 'It drops fill-in, keeping only non-zeros at original sparsity positions',
      hints: ['ILU(0): during LU elimination, whenever a new non-zero would be created (fill-in), it is set to zero. Result: $LU \\approx A$ with $\\text{nnz}(L+U) = \\text{nnz}(A)$. ILU(k) allows $k$ levels of fill, improving quality at the cost of more memory.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-004-3',
      type: 'choice',
      text: 'AMG (algebraic multigrid) achieves near $O(N)$ complexity by:',
      options: ['Using fast Fourier transforms', 'Building a hierarchy of coarser problems via coarsening', 'Ignoring small eigenvalues', 'Parallelizing matrix-vector products'],
      answer: 'Building a hierarchy of coarser problems via coarsening',
      hints: ['AMG identifies "coarse" variables and builds restricted problems $A_c = RAP$. A V-cycle: smooth on fine grid, restrict residual, solve coarsely (recursively), prolongate correction, smooth again. Each V-cycle costs $O(N)$, and the number of V-cycles is bounded — total: $O(N)$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la9-004-4',
      type: 'choice',
      text: 'For the 2D Poisson equation, diagonal preconditioning:',
      options: ['Reduces $\\kappa$ from $O(n^2)$ to $O(1)$', 'Does nothing because all diagonal entries are equal', 'Reduces $\\kappa$ to $O(n)$', 'Makes the matrix symmetric'],
      answer: 'Does nothing because all diagonal entries are equal',
      hints: ['The 2D Poisson matrix has all interior diagonal entries equal to 4 (from the 5-point stencil). Diagonal scaling by diag(A) = 4I just scales the system by $1/4$ — the condition number is unchanged. Diagonal preconditioning helps only when the diagonal entries vary significantly.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-004-5',
      type: 'choice',
      text: 'Right preconditioning $AM^{-1}\\mathbf{y} = \\mathbf{b}$ (with $\\mathbf{x} = M^{-1}\\mathbf{y}$) has which advantage over left preconditioning?',
      options: ['It requires fewer iterations', 'The true residual norm $\\|\\mathbf{b}-A\\mathbf{x}\\|$ is minimized, not the preconditioned residual', 'It is always cheaper to apply', 'It preserves symmetry of $A$'],
      answer: 'The true residual norm $\\|\\mathbf{b}-A\\mathbf{x}\\|$ is minimized, not the preconditioned residual',
      hints: ['Left GMRES minimizes $\\|M^{-1}(\\mathbf{b}-A\\mathbf{x})\\| = \\|M^{-1}\\mathbf{r}\\|$ — a preconditioned residual that may not reflect the actual error. Right preconditioning minimizes the true residual $\\|\\mathbf{b}-A\\mathbf{x}\\|$, which is the meaningful quantity.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la9-004-6',
      type: 'choice',
      text: 'The ideal preconditioner ($M = A$) is never used because:',
      options: ['It changes the eigenvalues', 'Applying $M^{-1} = A^{-1}$ solves the original system — it defeats the purpose', 'It makes $\\kappa$ worse', 'It requires $A$ to be symmetric'],
      answer: 'Applying $M^{-1} = A^{-1}$ solves the original system — it defeats the purpose',
      hints: ['If $M = A$, then $M^{-1}A = I$ (perfect conditioning, 1 CG iteration). But applying $M^{-1} = A^{-1}$ requires solving $A\\mathbf{z} = \\mathbf{r}$ — exactly the original problem. You are going in circles. The preconditioner must be a CHEAP approximation to $A^{-1}$, not $A^{-1}$ itself.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-004-7',
      type: 'choice',
      text: 'Symmetric positive definite preconditioners preserve which property important for PCG?',
      options: ['Sparsity', 'The $A$-inner product structure that makes CG valid', 'Non-negativity of entries', 'Diagonal dominance'],
      answer: 'The $A$-inner product structure that makes CG valid',
      hints: ['Preconditioned CG (PCG) requires the preconditioned system to still be SPD for the CG inner products to remain well-defined. If $A$ is SPD and $M$ is SPD, then the split preconditioned system $L^{-1}AL^{-\\top}$ (where $M = LL^\\top$) is SPD. Using a non-SPD preconditioner requires switching to GMRES or MINRES.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la9-004-8',
      type: 'choice',
      text: 'Block Jacobi preconditioning partitions the matrix into blocks and:',
      options: ['Solves the full system block by block', 'Uses the block diagonal as preconditioner ($M = $ block diagonal)', 'Applies AMG to each block', 'Permutes rows to diagonal dominance'],
      answer: 'Uses the block diagonal as preconditioner ($M = $ block diagonal)',
      hints: ['Block Jacobi: $M = \\text{blockdiag}(A_{11}, A_{22}, \\ldots, A_{kk})$. Applying $M^{-1}$ requires solving $k$ independent smaller systems — easily parallelized. Quality depends on how strongly blocks interact off-diagonally.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la9-004-9',
      type: 'choice',
      text: 'For CG, the preconditioned system $M^{-1}A\\mathbf{x} = M^{-1}\\mathbf{b}$ must use a symmetric preconditioner $M$ to ensure:',
      options: ['$M^{-1}A$ is also symmetric', 'The preconditioned system is SPD (via split preconditioner $L^{-1}AL^{-T}$)', 'The original $A$ is unchanged', 'The condition number equals 1'],
      answer: 'The preconditioned system is SPD (via split preconditioner $L^{-1}AL^{-T}$)',
      hints: ['CG requires SPD matrix. For SPD $A$ and SPD $M = LL^T$: form the equivalent system $(L^{-1}AL^{-T})(L^T\\mathbf{x}) = L^{-1}\\mathbf{b}$, which is SPD. PCG applies CG to this system implicitly without forming $L^{-1}AL^{-T}$ explicitly.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la9-004-10',
      type: 'choice',
      text: 'For a 1D Poisson problem with $N$ unknowns, the optimal $O(N)$ solver is:',
      options: ['CG without preconditioning ($O(N^{3/2})$ total)', 'Direct LU ($O(N)$ for tridiagonal)', 'CG + diagonal preconditioner ($O(N^{3/2})$)', 'Direct LU or CG+AMG, both $O(N)$'],
      answer: 'Direct LU or CG+AMG, both $O(N)$',
      hints: ['For 1D: the tridiagonal system has $O(N)$ non-zeros, and tridiagonal LU is $O(N)$ — a direct solver is optimal. CG without preconditioning: $O(N)$ iterations × $O(N)$ matvec = $O(N^2)$ total. Diagonal preconditioning: no help ($O(N^{3/2})$). AMG: $O(1)$ iterations, $O(N)$ total — same order as direct.'],
      reviewSection: 'rigor',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Explain how preconditioning reduces iteration count. Given a specific $A$ and $M$, compute $\\kappa(M^{-1}A)$ and estimate the CG iteration savings.',
    explainVerbally: 'Explain the trade-off: a good preconditioner reduces iterations but costs more per iteration. Describe what makes ILU(0) a practical choice.',
    detectIncorrectApplication: 'Catch the error of using a non-SPD preconditioner with CG, and redirect to GMRES or suggest a symmetric variant of the preconditioner.',
    transferToUnfamiliar: 'Given a new type of sparse system (e.g., from a graph problem or circuit simulation), suggest an appropriate preconditioner and estimate whether it will help.',
  },

  misconceptions: [
    {
      falseBelief: 'A better (more accurate) preconditioner always leads to faster convergence.',
      whyStudentsThinkIt: 'Better approximation to $A^{-1}$ means $\\kappa(M^{-1}A)$ is smaller, which means fewer iterations.',
      correctionExample: 'ILU(2) is a more accurate approximation to $A^{-1}$ than ILU(0), but ILU(2) costs more per iteration (more fill-in, denser $L$ and $U$). Total time = (iterations) × (cost per iteration). ILU(0) with more iterations may be faster than ILU(2) with fewer if the extra cost per iteration outweighs the iteration savings.',
      contrastCase: 'The right metric is total wall-clock time, not iteration count alone. For GPU computations, cache-efficient ILU(0) often beats theoretically-better ILU(k) on modern hardware.',
    },
    {
      falseBelief: 'Preconditioning converts a non-symmetric problem to a symmetric one.',
      whyStudentsThinkIt: 'Students hope preconditioning is a magic fix for non-symmetry.',
      correctionExample: 'Left preconditioning: $M^{-1}A$ is generally not symmetric even if $M$ and $A$ are individually symmetric. CG requires symmetry; using left preconditioning with CG on a non-symmetric result gives wrong answers.',
      contrastCase: 'Split preconditioning for SPD systems: $L^{-1}AL^{-T}$ IS symmetric (and SPD) when $M = LL^T$ is SPD. This is the only way to preserve symmetry in preconditioning. For non-symmetric $A$, there is no preconditioning trick that makes it symmetric — you must use GMRES or BiCGSTAB.',
    },
  ],

  transferPrompts: [
    {
      situation: 'Solving the discrete form of the Poisson equation on a 3D mesh with $10^6$ unknowns in a finite element code. You need to solve it 100 times with different right-hand sides.',
      competingTechniques: 'LU factorization once (reuse), CG+ILU(0) repeated, CG+AMG repeated.',
      whyThisTechniqueWins: 'LU once: $O(N^{4/3})$ factorization = $O(10^8)$ flops, then $O(N^{2/3})$ per solve — feasible but high setup cost. CG+AMG: $O(N)$ setup, $O(N)$ per solve — 100 solves = $O(10^8)$ total, likely faster and uses less memory. For many right-hand sides, AMG setup amortizes well.',
    },
    {
      situation: 'You are training a neural network and computing Newton steps, which require solving $(H + \\lambda I)\\delta = -g$ where $H$ is the Hessian and $\\lambda$ is a regularizer.',
      competingTechniques: 'CG without preconditioner, CG + diagonal preconditioner (diagonal of $H + \\lambda I$).',
      whyThisTechniqueWins: 'The diagonal of $H + \\lambda I$ varies significantly across layers (different learning rates per parameter). Diagonal preconditioning reduces $\\kappa$ substantially for "scale-separated" Hessians. This is the basis for adaptive optimizers like Adam, which maintain diagonal Hessian estimates.',
    },
  ],

  debugging: [
    {
      commonError: 'Using an asymmetric preconditioner (e.g., ILU without symmetrization) with CG, getting divergence or wrong solutions.',
      symptom: 'CG residual oscillates or diverges instead of decreasing monotonically.',
      whyItHappened: 'PCG requires the preconditioned operator to be SPD. ILU(0) of an SPD matrix is NOT symmetric in general ($LU \\neq (LU)^T$). Applying it as a left preconditioner makes $M^{-1}A$ non-symmetric, breaking CG\'s assumptions.',
      repairStrategy: 'Use symmetric ILU (SILU or Cholesky-based): $M = L L^T$ where $L$ is an incomplete Cholesky factor. Or switch from CG to GMRES, which handles non-symmetric preconditioned systems.',
    },
    {
      commonError: 'Applying ILU(0) to a poorly reordered sparse matrix, getting a bad preconditioner.',
      symptom: 'CG+ILU(0) converges only slightly faster than CG alone, despite spending time on ILU setup.',
      whyItHappened: 'ILU quality depends on the sparsity ordering. If the matrix has a poor ordering (random, not respecting locality), the incomplete factors miss important coupling and provide little improvement.',
      repairStrategy: 'Reorder the matrix before computing ILU: use RCM (Reverse Cuthill-McKee) to reduce bandwidth, or AMD. This improves the quality of the approximate factors without changing the problem.',
    },
  ],
};
