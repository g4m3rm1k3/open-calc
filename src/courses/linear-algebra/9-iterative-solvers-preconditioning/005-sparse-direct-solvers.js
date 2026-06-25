import arrowReorderUrl from '../diagrams/la-arrow-matrix-reorder.svg?url';
import nestedDissectionUrl from '../diagrams/la-nested-dissection.svg?url';

export default {
  id: 'la9-005',
  slug: 'sparse-direct-solvers',
  chapter: 'la9',
  order: 5,
  title: 'Sparse Direct Solvers',
  subtitle: 'Sparse direct methods compute an exact LU or Cholesky factorization with fill-in minimization via reordering. For 2D problems, nested dissection ordering reduces fill-in from $O(n^{3/2})$ to $O(n\\log n)$.',
  tags: ['sparse direct', 'fill-in', 'reordering', 'nested dissection', 'AMD', 'RCM', 'CHOLMOD', 'SuperLU', 'PARDISO', 'Cholesky'],
  aliases: 'sparse direct solvers fill-in reordering nested dissection AMD RCM CHOLMOD SuperLU PARDISO cholesky LU factorization elimination tree',

  hook: {
    question: "Iterative methods can stagnate or converge slowly. For one-off solves or multiple solves with the same $A$, a direct factorization of a sparse matrix can be faster. But naive LU fills in the matrix. How do you control fill-in?",
    realWorldContext: "Sparse direct solvers are the backbone of commercial FEA codes (ANSYS, Abaqus, NASTRAN), electronic design automation (SPICE circuit simulation), and structural mechanics. CHOLMOD (for SPD) and SuperLU/PARDISO (for general) are the dominant libraries. They routinely solve systems with $10^6$–$10^7$ unknowns by exploiting sparsity. The reordering step (AMD, nested dissection) can reduce factorization time by 100× compared to no reordering. After factorization, multiple right-hand sides are solved cheaply via triangular solves.",
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Where you are in the story: you have now seen the full spectrum of iterative solvers — stationary methods (Jacobi, Gauss-Seidel), Krylov methods (CG, GMRES), and preconditioning strategies that make them practical. But iterative methods are not always the answer. They can stagnate on hard problems, they require tuning the preconditioner, and they produce approximate solutions that need careful monitoring. Sometimes you need the exact answer, robustly, without worrying about convergence. That is when you reach for sparse direct solvers.',
      'The challenge with sparse direct solvers is **fill-in**: when you perform Gaussian elimination on a sparse matrix, the factors $L$ and $U$ typically contain many more nonzero entries than the original $A$. This is because the elimination process creates new connections between variables that were not directly connected in $A$. In the worst case, a sparse matrix with $O(n)$ nonzeros can produce dense $L$ and $U$ factors with $O(n^2)$ nonzeros — eliminating all the sparsity benefit.',
      'A concrete 4-variable example reveals the key insight. Consider the arrow matrix: nonzeros on the diagonal and in the first row and column, all other entries zero. If you eliminate variables in natural order $(1,2,3,4)$: after eliminating variable 1, every pair of remaining variables $(2,3,4)$ that were both connected to variable 1 now needs a direct connection in $L$ or $U$. Variables 2, 3, and 4 all connect through variable 1, so the $\\{2,3,4\\} \\times \\{2,3,4\\}$ block fills in completely — 9 new nonzeros. Now reverse the order to $(4,3,2,1)$: variables 4, 3, 2 are "leaves" — they only connect to variable 1. Eliminating leaf 4 creates no new connections because 4 is not connected to any other remaining variable. Same for leaves 3 and 2. When you finally eliminate variable 1, all others are already gone. Total fill-in: **zero**.',
      ] },
      { type: 'image', src: arrowReorderUrl,
        alt: 'Two graphs of the same 4-node star: eliminating the center node 1 first creates 3 new fill-in edges among leaves 2,3,4, while eliminating the leaves first creates no new edges at all',
        caption: 'Same matrix, different elimination order: one produces fill-in, the other produces none — order is everything.' },
      { type: 'prose', paragraphs: [
      'This example is not a special trick — it reveals a general principle. Fill-in occurs when two variables that both connect to the variable being eliminated are not themselves directly connected. A permutation matrix $P$ reorders the variables: instead of factoring $A$, you factor $PAP^\\top$ (same matrix, reordered), solve $PAP^\\top(P\\mathbf{x}) = P\\mathbf{b}$, then unpermute. The fill-in depends entirely on the order chosen by $P$. The graph interpretation is clean: fill-in equals new edges added to the adjacency graph of $A$ during elimination.',
      '**Predict before reading on:** For a tridiagonal (path graph) matrix eliminated in natural order, does fill-in occur? For an arrow matrix (star graph) in natural order, how much fill-in? For the 2D Poisson matrix — a grid graph — how does fill-in scale with problem size $n$?',
      'The answers: a tridiagonal matrix produces zero fill-in in natural order because when you eliminate variable $i$, variables $i-1$ and $i+1$ are already directly connected (the tridiagonal entry $a_{i-1,i+1}$ … wait, it is not! But $i-1$ has already been eliminated by the time you reach $i$, so no new connections are created). Actually, the tridiagonal stays tridiagonal throughout — no fill-in. For the 2D Poisson grid, natural order produces $O(n^{3/2})$ fill-in. Nested dissection — finding a small separator that splits the graph, reordering it last, recursing on the two halves — achieves $O(n \\log n)$ fill-in and $O(n^{3/2})$ flops. The **AMD (Approximate Minimum Degree)** algorithm provides a practical greedy heuristic: at each step, eliminate the variable whose elimination creates the fewest new connections. AMD is used by MATLAB\'s backslash operator, CHOLMOD, and most industrial sparse direct solvers.',
      ] },
      { type: 'image', src: nestedDissectionUrl,
        alt: 'A grid graph split into a left half and right half by a thin red separator strip, illustrating nested dissection ordering',
        caption: 'Nested dissection eliminates both halves first, the thin separator last — recursing gives O(n log n) fill-in for 2D grids.' },
      { type: 'prose', paragraphs: [
      'The major sparse direct solver libraries — CHOLMOD (for SPD), SuperLU and PARDISO (for general), MUMPS (for distributed memory) — implement these ideas at industrial scale. Their workflow is: (1) analyze sparsity and compute reordering, (2) symbolic factorization (determine the fill-in pattern without computing values), (3) numerical factorization (fill in the values), (4) triangular solves. Steps 1-3 are expensive and done once; step 4 is cheap and done for each right-hand side. This is why direct solvers are preferred when you need to solve many linear systems with the same $A$ but different $\\mathbf{b}$: factorize once, solve hundreds of times at $O(\\text{nnz}(L))$ each.',
      'For 3D problems, even nested dissection gives $O(n^{4/3})$ fill-in and $O(n^2)$ flops. For a million-variable 3D problem, that is $10^{12}$ operations — not feasible. This is the fundamental reason why iterative methods dominate in 3D: for large 3D systems, CG+AMG at $O(n)$ total work will always beat any direct factorization. The practical rule of thumb: use sparse direct for 2D problems and small 3D problems (up to $10^4$–$10^5$ unknowns), and preconditioned iterative methods for large 3D problems. Many production codes combine both: iterative outer loop, direct solver as a subdomain preconditioner.',
      'Where this is heading: this lesson completes the Iterative Solvers & Preconditioning chapter. You have now seen the entire landscape of linear system solvers — from the $O(n^3)$ dense LU of Chapter 7, through sparse iterative methods (Jacobi, GS, CG, GMRES), to the $O(n)$ dream of AMG-preconditioned Krylov methods. Chapter 10 will step back to the mathematical foundations: dual spaces, tensors, and operator theory — the abstract framework that unifies everything you have seen in Chapters 1-9.',
      ] },
      { type: 'viz', id: 'PythonNotebook',
        title: 'Sparse Direct Solvers in Python',
        mathBridge: 'Measure fill-in with and without reordering, then benchmark direct vs iterative on multiple right-hand sides.',
        caption: 'AMD reordering reduces fill-in dramatically; factorize once, solve many times at low cost.',
        initialProps: {
          initialCells: [
            {
              id: 1,

              cellTitle: 'Fill-in: arrow matrix natural order vs reversed',
              prose: [
                'Demonstrate the arrow matrix example from the lesson: natural elimination order causes complete fill-in; reversed order causes zero fill-in.',
                'Arrow matrix: `A = np.diag(np.ones(n)); A[-1,:] = 1; A[:,-1] = 1` (all 1s on diagonal plus last row/column). Natural order: `splu(csc_matrix(A)).L.nnz + ... - A.nnz` — measures fill-in. Reversed: `perm = list(range(n-1,0,-1))+[0]; A_rev = A[perm,:][:,perm]; splu(csc_matrix(A_rev))` — zero fill-in!',
                'The spy plots side by side: left shows L+U for natural order (dense last row/column of L fills in), right shows L+U for reversed order (diagonal L only). This is the classic example proving that ordering matters enormously. For an n×n arrow matrix: natural order produces O(n²) fill; reversed order produces O(n) fill.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import lil_matrix, csc_matrix
from scipy.linalg import lu

n = 6

# Arrow matrix: dense first row/column, diagonal elsewhere
A = np.zeros((n, n))
for i in range(n):
    A[i, i] = 2.0
A[0, :] = 1.0
A[:, 0] = 1.0
A[0, 0] = n

print("Original arrow matrix:")
print(A.astype(int))
print(f"Nonzeros in A: {np.count_nonzero(A)}")

# LU with natural order
P_nat, L_nat, U_nat = lu(A)
LU_nat = L_nat + U_nat - np.eye(n)
nnz_natural = np.count_nonzero(np.abs(LU_nat) > 1e-10)
print(f"\\nNatural order: nnz(L+U) = {nnz_natural}  (dense!)")

# LU with reversed order: last variable first
perm = list(range(n-1, -1, -1))
A_rev = A[np.ix_(perm, perm)]
P_rev, L_rev, U_rev = lu(A_rev)
LU_rev = L_rev + U_rev - np.eye(n)
nnz_reversed = np.count_nonzero(np.abs(LU_rev) > 1e-10)
print(f"Reversed order: nnz(L+U) = {nnz_reversed}  (sparse!)")

# Visualize sparsity patterns
fig, axes = plt.subplots(1, 3, figsize=(12, 4))
for ax, M, title in zip(axes,
    [A, LU_nat, LU_rev],
    ['Original A', 'LU (natural order)', 'LU (reversed order)']):
    ax.spy(np.abs(M) > 1e-10, markersize=8)
    ax.set_title(f'{title}\\nnnz = {np.count_nonzero(np.abs(M) > 1e-10)}')
plt.tight_layout(); plt.show()
`,
            },
            {
              id: 2,

              cellTitle: 'Factorize once, solve many times',
              prose: [
                'Show the main advantage of direct solvers: pay the factorization cost once, then solve for many right-hand sides cheaply.',
                '`lu = splu(A_sparse)`. Factor once: `import time; t_factor = time.time(); lu = splu(A_sp); t_factor = time.time()-t_factor`. Solve m RHS: `t_solve = time.time(); for b in rhs_list: lu.solve(b); t_solve = (time.time()-t_solve)/m`. Compare `t_factor` vs `t_solve` — factorization is 10-100× more expensive than a single solve.',
                'Plot: stacked bar showing (1) cost of factorizing each time = m * t_lu, vs (2) cost of factorize-once + m solves = t_factor + m * t_solve. The break-even point is typically around 5-10 RHS. For m > 10, the once-and-reuse strategy dominates. This pattern appears everywhere: pre-compute LU/Cholesky once when solving PDEs at many time steps or Monte Carlo samples.',
              ],
              code: `import numpy as np
import time
from scipy.sparse import diags
from scipy.sparse.linalg import spsolve, factorized

# Tridiagonal 1D Poisson
n = 2000
A = (diags([2]*n, 0) + diags([-1]*(n-1), 1) + diags([-1]*(n-1), -1)).toarray()
from scipy.sparse import csc_matrix
A_sparse = csc_matrix(A)

n_rhs = 50
B = np.random.randn(n, n_rhs)

# Method 1: solve each RHS independently (n_rhs separate solves)
t0 = time.time()
X1 = np.zeros((n, n_rhs))
for j in range(n_rhs):
    X1[:, j] = np.linalg.solve(A, B[:, j])
t_separate = time.time() - t0

# Method 2: factorize once with scipy, solve all RHS
t0 = time.time()
solve = factorized(A_sparse)   # LU factorization (once)
X2 = np.zeros((n, n_rhs))
for j in range(n_rhs):
    X2[:, j] = solve(B[:, j])   # triangular solves (cheap)
t_factorized = time.time() - t0

# Method 3: solve all at once with dense numpy
t0 = time.time()
X3 = np.linalg.solve(A, B)
t_dense = time.time() - t0

print(f"Separate solves ({n_rhs} x dense solve): {t_separate:.3f}s")
print(f"Factorize-once + {n_rhs} triangular solves: {t_factorized:.3f}s")
print(f"Dense numpy (solve all at once):          {t_dense:.3f}s")
print(f"\\nFactorize-once speedup: {t_separate/t_factorized:.1f}x over separate")
print(f"\\nSolution agreement: {np.max(np.abs(X1 - X2)):.2e} (should be ~0)")
`,
            },
          ],
        },
      },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'Sparse Factorization and Fill-in',
        mathBridge: 'Observe fill-in in sparse LU and compare reorderings.',
        caption: 'Reordering the matrix before factorization dramatically reduces fill-in.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Fill-in demonstration',
              prose: [
                'Compare fill-in in LU factorization of a sparse matrix with and without reordering.',
                'Arrow matrix: `n=10; A=eye(n,\'sparse\'); A(n,:)=1; A(:,n)=1`. Natural order: `[L,U,P]=lu(A); spy(L+U)`. Reversed order: `p=[n:-1:1]; Ap=A(p,p); [L2,U2,~]=lu(Ap); spy(L2+U2)`. `nnz(L+U)` vs `nnz(L2+U2)` shows the fill-in difference.',
                'For the 10×10 arrow matrix, natural order gives L+U with O(n²) = 100 non-zeros; reversed order gives O(n) = 20. The spy plots show: natural order has a dense last column in L; reversed order has only the diagonal in L. For a 1000×1000 arrow matrix, this is the difference between 10^6 and 10^3 non-zeros in the factor.',
              ],
              code: `% Build a 2D Poisson sparse matrix (small example)
n_side = 10; n = n_side^2
e = ones(n,1)
% 5-point stencil for Poisson
A = speye(n)*4 + ...
    spdiags(-e, 1, n, n) + spdiags(-e, -1, n, n) + ...
    spdiags(-e, n_side, n, n) + spdiags(-e, -n_side, n, n)

% Remove connections across boundary (simple fix)
for i = 1:n_side-1
    A(i*n_side, i*n_side+1) = 0
    A(i*n_side+1, i*n_side) = 0
end
A = (A + A')/2   % ensure symmetry

nnz_A = nnz(A)
disp(['Nonzeros in A: ', num2str(nnz_A)])

% Cholesky without reordering
R_natural = chol(A)
nnz_natural = nnz(R_natural)
disp(['Fill (no reorder): ', num2str(nnz_natural)])

% AMD reordering
p = amd(A)
A_amd = A(p,p)
R_amd = chol(A_amd)
nnz_amd = nnz(R_amd)
disp(['Fill (AMD reorder): ', num2str(nnz_amd)])
disp(['Fill reduction: ', num2str(nnz_natural/nnz_amd), 'x'])
`,
            },
            {
              id: 2,
              cellTitle: 'Multiple right-hand sides',
              prose: [
                'Factorize once, solve many times — the key advantage of direct solvers.',
                'Using MATLAB: `[L,U,P] = lu(A_sparse); for k=1:m, x = U \\ (L \\ (P*b_list(:,k))); end`. The LU factorization is computed once. Each solve is just two triangular solves (forward + back substitution) — O(nnz(L) + nnz(U)) work, far cheaper than refactorizing.',
                'Time the three approaches: (1) `A\\b` each time (refactorizes), (2) precomputed LU using `\\ (L \\ (P*b))`, (3) direct solve via `A\\b` for a single RHS (baseline). Bar chart: time per RHS for each approach across m=1,5,20,100 RHS. The crossover where precomputed LU wins is around 3-5 RHS for this problem size.',
              ],
              code: `% Direct solver advantage: factor once, solve many RHS
n = 500
e = ones(n,1)
A = sparse(diag(2*e) + diag(-e(1:n-1),1) + diag(-e(1:n-1),-1))

% Factorize once using Cholesky with AMD
p = amd(A)
A_reord = A(p,p)
L = chol(A_reord, 'lower')   % A(p,p) = L*L'

% Solve multiple right-hand sides
n_rhs = 10
B = rand(n, n_rhs)
X = zeros(n, n_rhs)
for j = 1:n_rhs
    b_reord = B(p, j)
    % Forward solve
    y = L \ b_reord
    % Back solve
    z = L' \ y
    % Undo permutation
    X(p, j) = z
end

% Verify one solution
rel_err = norm(A*X(:,1) - B(:,1)) / norm(B(:,1))
disp(['Relative residual: ', num2str(rel_err)])
disp('Factorized once, solved 10 RHS cheaply.')
`,
            },
          ],
        },
      },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Use a Sparse Direct Solver (4 Steps)',
        body: '1. **Reorder.** Compute a fill-reducing permutation: AMD (`amd(A)` in MATLAB/SciPy) for general sparse; nested dissection for regular grids. Form $PAP^\\top$ (same sparsity, different order). Never skip reordering for non-trivial problems.\n2. **Symbolic factorization.** Determine the sparsity pattern of $L$ and $U$ (or $L$ and $L^\\top$ for SPD) from the graph of $PAP^\\top$ without computing any values. This step identifies and allocates all memory needed for the factors — fast ($O(\\text{nnz})$) and done once per sparsity pattern.\n3. **Numerical factorization.** Compute the actual values of $L$ and $U$. This is the expensive step: $O(N^{3/2})$ flops for 2D with ND, $O(N^2)$ for 3D. Partial pivoting is applied (or diagonal dominance is assumed for Cholesky). Done once per matrix value; reused for all right-hand sides.\n4. **Solve.** For each right-hand side $\\mathbf{b}$: (a) permute: $\\hat{\\mathbf{b}} = P\\mathbf{b}$; (b) forward solve: $L\\mathbf{y} = \\hat{\\mathbf{b}}$; (c) backward solve: $U\\mathbf{x} = \\mathbf{y}$; (d) unpermute: $\\mathbf{x}^{\\text{true}} = P^\\top\\mathbf{x}$. Cost: $O(\\text{nnz}(L) + \\text{nnz}(U))$ per RHS.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 5 of 5 — Iterative Solvers & Preconditioning',
        body: '**Previous (Lesson 4):** Preconditioning — Jacobi, ILU, AMG; eigenvalue clustering for Krylov efficiency.\n**This lesson:** Sparse Direct Solvers — fill-in, reordering (AMD, nested dissection), CHOLMOD/SuperLU/PARDISO, direct vs iterative tradeoffs.\n**Next (Chapter 10):** Dual Spaces and Advanced Theory — the abstract framework that unifies everything in Chapters 1–9.',
      },
      {
        type: 'insight',
        title: 'Fill-in Summary by Problem Type',
        body: 'Problem | No reorder | After reorder\n1D Poisson | $O(n)$ | $O(n)$ (already optimal)\n2D Poisson | $O(n^{3/2})$ | $O(n \\log n)$ (ND)\n3D Poisson | $O(n^2)$ | $O(n^{4/3})$ (ND)\nGeneral | $O(n^2)$ worst | AMD: heuristic reduction\n\nFor 3D problems, $O(n^{4/3})$ fill-in makes direct methods expensive — often iterative + preconditioner wins.',
      },
      {
        type: 'insight',
        title: 'When Direct vs Iterative',
        body: 'Use **sparse direct** (CHOLMOD, SuperLU, PARDISO) when:\n- Multiple right-hand sides with same $A$\n- $n < 10^5$ (2D) or $n < 10^4$ (3D)\n- Robust factorization needed (Jacobian in Newton\'s method)\n- Iterative method stagnates or is slow\n\nUse **iterative** (CG, GMRES + preconditioner) when:\n- Single right-hand side\n- $n > 10^5$ and matrix has good structure\n- 3D problem (direct too expensive)\n- Memory limited',
      },
    ],
  },

  math: {
    prose: [
      '**Fill-in bound for nested dissection.** Let $G$ be the graph of $A$ (vertices = unknowns, edges = nonzeros). A **balanced separator** of $G$ partitions vertices into $A$, $B$, $S$ where $|S| \\leq c\\sqrt{n}$ and edges only go $A-S$ and $B-S$ (not $A-B$). If $G$ is planar (as for 2D grids), such a separator exists (planar separator theorem, Lipton-Tarjan). Recursive application gives $O(n\\log n)$ fill-in for Cholesky.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Supernodal Factorization',
        body: 'Modern sparse direct codes (CHOLMOD, MKL PARDISO) use **supernode** factorization: consecutive columns with the same nonzero pattern are grouped and factored together using dense BLAS3 routines. This converts irregular sparse operations into cache-friendly dense matrix operations.\n\nResult: practical performance much better than flop count suggests. On modern CPUs with good BLAS, sparse Cholesky achieves a significant fraction of peak FLOPS.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**MUMPS and parallel direct solvers.** MUMPS (Multifrontal Massively Parallel sparse direct Solver) uses the **multifrontal method**: represent the factorization as a sequence of dense matrix operations on "frontal matrices" derived from the elimination tree. Subtrees can be processed in parallel. MUMPS is MPI-parallel and used in many industrial codes. PARDISO (Intel) uses a supernodal approach and is OpenMP-parallel. For very large 3D problems, iterative methods (CG/GMRES + AMG) remain dominant because $O(n^{4/3})$ fill-in is still too much.',
      '**Elimination tree theory and parallel factorization.** The elimination tree $T(A)$ captures the dependency structure of Cholesky: node $j$ is the parent of node $i$ ($i < j$) if column $j$ is the leftmost column of $L$ that shares a nonzero in row $i$ below the diagonal. Two nodes in disjoint subtrees share no data dependencies and can be computed in parallel. For natural ordering of a path graph (tridiagonal), $T(A)$ is itself a path of depth $n-1$ — purely sequential. For nested dissection of a $\\sqrt{N} \\times \\sqrt{N}$ grid, $T(A)$ is a balanced binary tree of depth $O(\\log N)$. Each level of the tree can be processed in parallel, giving theoretical speedup $O(N / \\log N)$ on sufficient processors. This is why ND is preferred not only for fill-in minimization but also for parallel implementations in codes like MUMPS and Elemental.',
      '**Supernodal factorization and BLAS efficiency.** A **supernode** is a maximal set of consecutive columns of $L$ with identical nonzero structure — the same row indices below the diagonal. Processing a supernode allows the factorization kernel to be expressed as a dense rank-$k$ update (DSYRK, DGEMM), achieving peak FLOPS on modern CPUs via cache-friendly memory access. CHOLMOD uses supernodal Cholesky; PARDISO uses supernodal LU. Typical supernode widths: 5–50 columns for 2D FEM problems, larger for 3D. Practical impact: supernodal codes run at 50–80% of peak FLOP rate; purely sparse column-by-column codes run at 5–10%. This is not a minor implementation detail — it is the reason commercial solvers achieve the wall-clock performance they do. The supernodal grouping arises naturally from ND reordering, so reordering serves two purposes: fill-in reduction and supernode creation.',
      '**Iterative refinement and mixed-precision factorization.** After computing $LU \\approx PAP^\\top$, the computed solution $\\hat{x}_0$ satisfies $A \\hat{x}_0 = b + \\delta b$ with $\\|\\delta b\\| = O(\\varepsilon_{\\text{mach}} \\|A\\| \\|\\hat{x}_0\\|)$. For ill-conditioned $A$ ($\\kappa \\gg 1$), the forward error $\\|x - \\hat{x}_0\\|$ can be large. **Iterative refinement** corrects this: (1) compute residual $r_0 = b - A\\hat{x}_0$ in higher precision; (2) solve $A \\,\\delta x = r_0$ using the same $L$, $U$ (two triangular solves — cheap); (3) update $\\hat{x}_1 = \\hat{x}_0 + \\delta x$. One refinement step reduces forward error from $O(\\kappa \\varepsilon_{\\text{mach}})$ to $O(\\varepsilon_{\\text{mach}})$ provided $\\kappa < \\varepsilon_{\\text{mach}}^{-1/2}$. LAPACK\'s \\texttt{DSGESV} exploits this with **mixed-precision**: factorize in single precision (4$\\times$ less memory, $4\\times$ faster BLAS), then refine in double to achieve double-precision accuracy — a key strategy for GPU-accelerated solvers where single-precision throughput is $8$–$16\\times$ higher.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Comparing Direct Solver Libraries',
        body: 'CHOLMOD (Tim Davis): SPD matrices, AMD/nested dissection reordering, supernodal\nSuperLU: general non-symmetric, partial pivoting, single/multicore\nPARDISO (Intel MKL): general, highly optimized for x86, thread-parallel\nMUMPS: MPI-parallel, multifrontal, symmetric/non-symmetric\nUMFPACK (Tim Davis): robust general unsymmetric, used in MATLAB\'s backslash\n\nMATLAB\'s A\\b automatically uses CHOLMOD for SPD sparse, UMFPACK for general sparse.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la9-005-1',
      title: 'Arrow matrix disaster',
      problem: 'An arrow matrix $A$ has the pattern: nonzeros only on the diagonal and in the first row and column. If you eliminate in natural order $(1, 2, \\ldots, n)$, how much fill-in occurs?',
      solution: 'Eliminating row 1 first: fills the entire $(2:n) \\times (2:n)$ block — $O(n^2)$ fill-in! If instead you eliminate rows $2, 3, \\ldots, n$ first (reverse order), the last elimination (row 1) produces no fill-in. Total fill-in: $O(n)$. Reordering transforms an $O(n^2)$ problem into an $O(n)$ problem.',
    },
    {
      id: 'ex-la9-005-2',
      title: 'Nested dissection on a 2D grid',
      problem: 'A $3 \\times 3$ grid of unknowns (9 nodes, 12 edges) forms the 2D Poisson stiffness matrix. Describe one level of nested dissection and identify the separator.',
      steps: [
        {
          expression: '\\text{Grid nodes: }\\begin{bmatrix}1&2&3\\\\4&5&6\\\\7&8&9\\end{bmatrix}',
          annotation: 'Label the 9 unknowns in the grid.',
          strategyTitle: 'Label the grid',
        },
        {
          expression: '\\text{Separator: column 2} = \\{2, 5, 8\\}',
          annotation: 'Removing nodes 2, 5, 8 (the middle column) splits the grid into left partition $\\{1, 4, 7\\}$ and right partition $\\{3, 6, 9\\}$. The separator has size $\\sqrt{n} = 3$.',
          strategyTitle: 'Identify separator (middle column)',
        },
        {
          expression: '\\text{Reorder: } [1,4,7,\\; 3,6,9,\\; 2,5,8] = [\\text{left}, \\text{right}, \\text{separator}]',
          annotation: 'Eliminate the two independent subproblems first (left and right blocks create no cross-fill), then eliminate the separator last.',
          strategyTitle: 'ND reordering: subproblems before separator',
        },
        {
          expression: '\\text{Fill-in: only within each subproblem block and in the separator — } O(n \\log n) \\text{ total}',
          annotation: 'The key property: nodes in the left partition never directly interact with nodes in the right partition (only through the separator). This limits cross-fill-in to the separator column block. Recursing on the subproblems gives the $O(n \\log n)$ bound.',
          strategyTitle: 'Fill-in is localized',
        },
      ],
    },
    {
      id: 'ex-la9-005-3',
      title: 'Direct vs iterative: when each wins',
      problem: 'Compare the total work for solving a 2D Poisson problem with $N = n^2$ unknowns using (a) sparse direct with nested dissection, (b) CG without preconditioning, (c) CG + AMG. Include both setup and solve costs.',
      steps: [
        {
          expression: '\\text{Direct (ND): setup } O(N^{3/2}), \\text{ per solve } O(N\\log N)',
          annotation: 'Factoring with ND: $O(N^{3/2})$ flops. Each subsequent solve via triangular back-substitution: $O(N \\log N)$ flops (because $L$ and $U$ have $O(N \\log N)$ non-zeros after ND).',
          strategyTitle: '(a) Direct solver costs',
        },
        {
          expression: '\\text{CG (no precond): } O(\\sqrt{\\kappa}) \\text{ iters, each } O(N) \\Rightarrow O(N^{3/2}) \\text{ total}',
          annotation: 'For 2D Poisson: $\\kappa = O(n^2) = O(N)$, so CG needs $O(\\sqrt{N})$ iterations, each costing $O(N)$ for the sparse matvec.',
          strategyTitle: '(b) CG without preconditioning',
        },
        {
          expression: '\\text{CG+AMG: } O(1) \\text{ iters (bounded), each } O(N) \\Rightarrow O(N) \\text{ total}',
          annotation: 'AMG achieves $\\kappa(M^{-1}A) = O(1)$ — a bounded constant independent of $N$. So CG+AMG needs a fixed number of iterations regardless of $N$. Each iteration costs $O(N)$ (AMG V-cycle).',
          strategyTitle: '(c) CG + AMG: optimal',
        },
        {
          expression: '\\text{Winner: 1 RHS} \\Rightarrow \\text{CG+AMG}; \\quad k \\text{ RHS} \\Rightarrow \\text{Direct if } k > N^{1/2}/\\log N',
          annotation: 'For many right-hand sides, the direct solver\'s cheap per-solve cost ($O(N \\log N)$) wins over AMG\'s setup cost. For a single RHS with large $N$, AMG wins. The crossover depends on problem size and number of RHS.',
          strategyTitle: 'Decision: which solver to use?',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la9-005-1',
      title: 'Elimination tree depth: path vs nested dissection',
      difficulty: 'hard',
      problem: 'For a tridiagonal (path graph) matrix with natural ordering, describe the elimination tree and its depth. Then explain how nested dissection changes the tree structure and what that means for parallel factorization.',
      walkthrough: [
        {
          expression: 'T(A)_{\\text{natural}}: n-1 \\to n-2 \\to \\cdots \\to 1 \\quad (\\text{depth} = n-1)',
          annotation: 'Natural order: eliminating column $i$ creates a fill entry in column $i+1$ (the first nonzero to the right). So column $i+1$ is the parent of column $i$. The result is a chain — depth $n-1$. Every column depends on the previous one: no parallelism at all.',
        },
        {
          expression: '\\text{Critical path: depth}(T) \\Rightarrow \\text{minimum sequential steps}',
          annotation: 'The depth of the elimination tree equals the minimum number of sequential factorization steps, regardless of how many processors are available. Depth $n-1$ means the factorization is inherently sequential for a tridiagonal with natural ordering — adding processors does not help.',
        },
        {
          expression: 'T(A)_{\\text{ND}}: \\text{balanced binary tree, depth} = O(\\log n)',
          annotation: 'Nested dissection ordering: the separator node is numbered last (highest index). Each of the two sub-problems is itself ND-ordered, recursively. The elimination tree becomes a balanced binary tree with depth $O(\\log n)$. All nodes at the same depth in the tree are independent and can be computed in parallel.',
        },
        {
          expression: '\\text{Parallel speedup} = O\\!\\left(\\frac{n}{\\log n}\\right) \\text{ on } \\frac{n}{\\log n} \\text{ processors}',
          annotation: 'With $p = n/\\log n$ processors and depth $O(\\log n)$, Brent\'s theorem gives total time $O(\\log n)$, giving speedup $O(n/\\log n)$. For large $n$ this is near-optimal parallel efficiency. This is precisely why MUMPS and other parallel sparse solvers use ND ordering.',
        },
      ],
    },
    {
      id: 'ch-la9-005-2',
      title: 'Tridiagonal: zero fill-in under natural order',
      difficulty: 'easy',
      problem: 'Prove that a tridiagonal $n \\times n$ matrix $A$ produces zero fill-in when eliminated in natural order $(1, 2, \\ldots, n)$.',
      walkthrough: [
        {
          expression: '\\text{Eliminate column 1: only } a_{21} \\neq 0 \\text{ below diagonal}',
          annotation: 'Column 1 of a tridiagonal has nonzeros only at positions $(1,1)$ and $(2,1)$. The Schur complement update modifies only the $(2,2)$ entry (already nonzero) — no new nonzero entries are created.',
        },
        {
          expression: '\\text{After eliminating column 1: row 2 is unchanged except } a_{22}',
          annotation: 'The only row that gets modified is row 2 (the only row with a nonzero in column 1 below the diagonal). Row 2 already has nonzeros at columns 2 and 3 — no new nonzeros appear.',
        },
        {
          expression: '\\text{Same argument at every step } i: \\text{ column } i \\text{ has one subdiagonal entry at row } i+1',
          annotation: 'By induction: when we reach column $i$, it has already been partially updated but remains tridiagonal in its structure. There is exactly one nonzero below $(i,i)$, at row $i+1$. The update only touches row $i+1$ at columns $i+1$ and $i+2$ — both already occupied.',
        },
        {
          expression: '\\text{Fill-in} = 0 \\Rightarrow L, U \\text{ are bidiagonal}',
          annotation: 'Conclusion: the LU factors of a tridiagonal are bidiagonal (lower and upper). This is the reason 1D finite difference problems are trivially solved by direct methods — no fill-in, $O(n)$ factorization, exactly like the original matrix.',
        },
      ],
    },
    {
      id: 'ch-la9-005-3',
      title: 'Arrow matrix fill-in: natural vs reverse order',
      difficulty: 'medium',
      problem: 'An $n \\times n$ arrow matrix $A$ has nonzeros only on the diagonal and in the first row and column (i.e., $a_{1j} \\neq 0$ and $a_{i1} \\neq 0$ for all $i, j$, and $a_{ij} = 0$ for $i,j \\geq 2, i \\neq j$). Compute the fill-in under (a) natural order and (b) reverse order $(n, n-1, \\ldots, 1)$.',
      walkthrough: [
        {
          expression: 'A = \\begin{bmatrix} * & * & * & * \\\\ * & * & & \\\\ * & & * & \\\\ * & & & * \\end{bmatrix} \\quad (\\text{pattern, } n=4)',
          annotation: 'The arrow (or "arrowhead") matrix: dense first row and column, diagonal elsewhere. Variables $2, \\ldots, n$ are each connected only to variable 1 — they are "leaves" attached to the hub at node 1.',
        },
        {
          expression: '\\text{Natural order: eliminate column 1 first}',
          annotation: 'Eliminating column 1: rows $2, 3, \\ldots, n$ all have a nonzero in column 1. After the elimination, every pair of rows $(i, j)$ with $i,j \\geq 2$ gets a new entry at column $j$ if row $j$ was involved. The entire $(2:n) \\times (2:n)$ block fills in completely.',
        },
        {
          expression: '\\text{Fill-in (natural)} = (n-1)^2 - (n-1) = (n-1)(n-2) = O(n^2)',
          annotation: 'After eliminating column 1, the remaining $(n-1) \\times (n-1)$ submatrix is dense — all entries filled in. From $n-1$ nonzeros, we created $(n-1)^2$ nonzeros. This is the worst case for direct methods without reordering.',
        },
        {
          expression: '\\text{Reverse order: eliminate columns } n, n-1, \\ldots, 2 \\text{ first}',
          annotation: 'Column $n$ has nonzeros only at $(n,n)$ and $(1,n)$. The only row below the diagonal in column $n$ is... none (column $n$ has no subdiagonal entries). Wait — the arrowhead has nonzeros in column 1 below the diagonal, but in columns $2, \\ldots, n$ only the first row and diagonal are nonzero. So eliminating column $k \\geq 2$ first: there is no nonzero below the diagonal, so no elimination step occurs at all.',
        },
        {
          expression: '\\text{Fill-in (reverse)} = 0 \\quad \\text{(eliminating leaves creates nothing)}',
          annotation: 'Leaves $n, n-1, \\ldots, 2$ each have one above-diagonal entry (in row 1) and one diagonal entry. No subdiagonal entries to create fill. Eliminating them in reverse order: zero fill-in until the very last step. Column 1 is eliminated last and it is already alone — zero fill-in for the whole factorization.',
        },
        {
          expression: '\\text{Lesson: reordering transforms } O(n^2) \\to O(n) \\text{ fill-in on the same matrix}',
          annotation: 'The matrix values did not change — only the variable ordering changed. The graph interpretation: natural order eliminates the hub (node 1) first, forcing all leaves to connect to each other (complete graph). Reverse order eliminates leaves first, which have no mutual connections — the hub is eliminated last with nothing left.',
        },
      ],
    },
  ],

  mentalModel: [
    'Fill-in: nonzeros in $L$, $U$ that were zero in $A$. Reordering minimizes it.',
    'AMD: greedy "minimum degree" heuristic. ND: optimal for 2D problems.',
    '2D Poisson: no reorder $\\Rightarrow O(n^{3/2})$ fill, ND $\\Rightarrow O(n\\log n)$ fill.',
    'Direct solver advantage: factor once, solve multiple right-hand sides cheaply.',
    'Direct vs iterative: direct for small/multiple RHS; iterative for large 3D problems.',
  ],

  checkpoints: [
    { id: 'cp-la9-005-1', label: 'Read: fill-in and reordering concept', type: 'read' },
    { id: 'cp-la9-005-2', label: 'Read: AMD, RCM, nested dissection strategies', type: 'read' },
    { id: 'cp-la9-005-3', label: 'Read: direct vs iterative solver decision guide', type: 'read' },
    { id: 'cp-la9-005-4', label: 'Try: compute fill-in before and after AMD reordering', type: 'lab' },
    { id: 'cp-la9-005-5', label: 'Try: factor once, solve multiple right-hand sides', type: 'lab' },
    { id: 'cp-la9-005-6', label: 'Work: arrow matrix fill-in under natural vs reverse ordering', type: 'example' },
    { id: 'cp-la9-005-7', label: 'Work: nested dissection on 2D grid', type: 'example' },
    { id: 'cp-la9-005-8', label: 'Challenge: elimination tree depth and parallelism', type: 'challenge' },
  ],

  assessment: 'Explain why an arrow matrix (star graph) has $O(n^2)$ fill-in under natural ordering but $O(n)$ fill-in under reverse ordering. What lesson does this teach about reordering?',

  quiz: [
    {
      id: 'q-la9-005-1',
      type: 'choice',
      text: 'Fill-in in sparse LU factorization depends on:',
      options: ['The eigenvalues of $A$', 'The condition number of $A$', 'The order in which variables are eliminated', 'The right-hand side $\\mathbf{b}$'],
      answer: 'The order in which variables are eliminated',
      hints: ['Fill-in is purely a structural property of the sparsity pattern and the elimination order. Two matrices with the same sparsity pattern but different values have identical fill-in. Eigenvalues and condition number are irrelevant to fill-in.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-005-2',
      type: 'choice',
      text: 'Nested dissection ordering reduces fill-in for 2D Poisson problems from $O(N^{3/2})$ to:',
      options: ['$O(N)$', '$O(N \\log N)$', '$O(N^{4/3})$', '$O(N^2)$'],
      answer: '$O(N \\log N)$',
      hints: ['ND finds a separator of size $O(\\sqrt{N})$ splitting the problem, recurses, and bounds fill-in to $O(N \\log N)$. For 3D problems, ND gives $O(N^{4/3})$ fill-in (still much less than $O(N^2)$ without reordering).'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-005-3',
      type: 'choice',
      text: 'The main advantage of direct solvers over iterative methods is:',
      options: ['Lower memory usage', 'Better parallel scalability', 'Factoring once and solving multiple right-hand sides cheaply', 'Faster for very large 3D problems'],
      answer: 'Factoring once and solving multiple right-hand sides cheaply',
      hints: ['After computing $A = LU$ (expensive), each new right-hand side requires only two triangular solves ($O(\\text{nnz}(L) + \\text{nnz}(U))$ work) instead of re-factoring. For $k$ right-hand sides, amortize the setup cost over $k$ solves.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-005-4',
      type: 'choice',
      text: 'AMD (Approximate Minimum Degree) reordering greedily:',
      options: ['Minimizes the bandwidth of $A$', 'Eliminates the variable with fewest fill-creating connections first', 'Sorts variables by degree in the original graph', 'Splits the graph into equal halves'],
      answer: 'Eliminates the variable with fewest fill-creating connections first',
      hints: ['AMD approximates minimum-degree ordering: at each step, eliminate the variable whose elimination would create the fewest new non-zeros. "Approximate" because it uses graph degree as a proxy for actual fill-in, making it much cheaper to compute than exact minimum degree.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la9-005-5',
      type: 'choice',
      text: 'For a 3D Poisson problem, why do direct solvers become impractical for large $N$?',
      options: ['CG is always faster in 3D', 'Fill-in grows as $O(N^{4/3})$ even with optimal ND reordering', 'The matrix is not sparse in 3D', 'AMG does not work in 3D'],
      answer: 'Fill-in grows as $O(N^{4/3})$ even with optimal ND reordering',
      hints: ['For 3D: ND gives $O(N^{4/3})$ fill-in and $O(N^2)$ factorization flops. For $N = 10^6$: fill-in $\\approx 10^8$ entries (1 GB just for the factors) and $O(10^{12})$ flops. CG+AMG does $O(N) = O(10^6)$ flops — 6 orders of magnitude less.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la9-005-6',
      type: 'choice',
      text: 'The elimination tree of a sparse factorization encodes:',
      options: ['The order of fill-in creation', 'Dependencies between columns: which columns depend on which previous columns', 'The graph structure of $A$', 'The values of $L$ and $U$'],
      answer: 'Dependencies between columns: which columns depend on which previous columns',
      hints: ['Node $j$ is the parent of node $i$ in the elimination tree if column $j$ is the first column in row $i$ of $L$ (below the diagonal). This encodes the data flow: column $j$ can only be computed after column $i$. Independent subtrees can be computed in parallel.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la9-005-7',
      type: 'choice',
      text: 'CHOLMOD is preferred over SuperLU when:',
      options: ['The matrix is non-symmetric', 'The matrix is symmetric positive definite (Cholesky is used)', 'The matrix is singular', 'The system has complex entries'],
      answer: 'The matrix is symmetric positive definite (Cholesky is used)',
      hints: ['CHOLMOD computes the Cholesky factorization $A = LL^T$ for SPD matrices — half the work and storage of LU, and guaranteed to be numerically stable without pivoting. SuperLU uses LU with partial pivoting for general (possibly non-symmetric) matrices.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la9-005-8',
      type: 'choice',
      text: 'A tridiagonal matrix ($n \\times n$, 1D Poisson) with natural ordering has fill-in:',
      options: ['$O(n^2)$', '$O(n \\log n)$', '$O(n)$ (no fill-in)', '$O(\\sqrt{n})$'],
      answer: '$O(n)$ (no fill-in)',
      hints: ['Eliminating a tridiagonal matrix in natural order: row $i$ affects only row $i+1$ (one entry below diagonal). No new non-zeros are created — fill-in is zero! The LU factors of a tridiagonal are bidiagonal. This is why 1D problems are trivial for direct solvers.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la9-005-9',
      type: 'choice',
      text: 'RCM (Reverse Cuthill-McKee) reordering is primarily used to:',
      options: ['Minimize fill-in for 2D problems', 'Reduce bandwidth (nonzero width around diagonal)', 'Find separators for nested dissection', 'Improve parallel scalability'],
      answer: 'Reduce bandwidth (nonzero width around diagonal)',
      hints: ['RCM reorders nodes by BFS traversal from a peripheral node (reverse of Cuthill-McKee order). This tends to cluster non-zeros near the diagonal, reducing the bandwidth. Bandwidth reduction → smaller working set for cache-efficient factorization, good for iterative methods.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la9-005-10',
      type: 'choice',
      text: 'Which scenario strongly favors a sparse direct solver over GMRES?',
      options: ['One very large 3D problem', 'A problem where GMRES has not yet converged after 1000 iterations', '100 solves with the same $A$ but different $\\mathbf{b}$ vectors', 'A poorly conditioned system where ILU fails'],
      answer: '100 solves with the same $A$ but different $\\mathbf{b}$ vectors',
      hints: ['Factor $A$ once ($O(N^{3/2})$ for 2D with ND). Each of 100 solves costs $O(N \\log N)$ (triangular solve). Total: $O(N^{3/2} + 100 N \\log N) \\approx O(N^{3/2})$ amortized. GMRES would cost $O(N^{3/2}) \\times 100 = O(100 N^{3/2})$ — 100× more.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Explain why the arrow matrix has $O(n^2)$ fill-in under natural ordering but $O(n)$ fill-in under reverse ordering. Describe when to choose a direct solver vs an iterative solver.',
    explainVerbally: 'Explain what nested dissection does and why it reduces fill-in by finding a balanced separator in the graph.',
    detectIncorrectApplication: 'Catch the error of applying a direct solver to a large 3D problem without checking the fill-in cost, and redirect to iterative methods.',
    transferToUnfamiliar: 'Given a new sparse matrix structure (e.g., from a circuit or social network), identify the appropriate reordering strategy and estimate the fill-in cost.',
  },

  misconceptions: [
    {
      falseBelief: 'Direct solvers are always more accurate than iterative solvers.',
      whyStudentsThinkIt: 'Students think "exact" means numerically exact — no approximation.',
      correctionExample: 'Direct LU with partial pivoting is backward stable: computed $\\hat{L}$, $\\hat{U}$ satisfy $P A = \\hat{L}\\hat{U} + E$ with $\\|E\\| = O(\\varepsilon_{\\text{mach}} \\|A\\|)$. For an ill-conditioned matrix ($\\kappa = 10^{15}$), the direct solver gives a forward error of $\\sim 10^{-1}$ — same as iterative methods.',
      contrastCase: 'Iterative methods with residual-based stopping can also achieve machine-precision accuracy for well-conditioned problems. "Direct" = exact number of operations, not exact answer.',
    },
    {
      falseBelief: 'More reordering is always better — apply all available reorderings.',
      whyStudentsThinkIt: 'Students assume applying AMD then ND then RCM must be better than applying just one.',
      correctionExample: 'Reorderings do NOT compose arbitrarily well. AMD is designed for minimum fill-in globally; applying RCM after AMD can undo the fill reduction. Each reordering is designed for specific goals: use AMD or ND for fill-in minimization, RCM for bandwidth reduction — not both.',
      contrastCase: 'Most sparse direct solver libraries (CHOLMOD, PARDISO) have a built-in ordering step — use it, don\'t manually apply additional reorderings. Trust the library\'s tuned heuristics.',
    },
  ],

  transferPrompts: [
    {
      situation: 'An electronic design automation tool solves circuit equations (KCL/KVL) for 100,000 simulations with the same circuit topology but different component values.',
      competingTechniques: 'GMRES each time, direct LU each time, or direct LU with one symbolic factorization and 100,000 numerical refactorizations.',
      whyThisTechniqueWins: 'The sparsity pattern (circuit topology) is fixed. Symbolic factorization (finding fill-in positions) is done once. Each new component-value set needs only a numerical refactorization ($3-5\\times$ cheaper than symbolic). This is exactly how SPICE simulation works: shared symbolic analysis across sweeps.',
    },
    {
      situation: 'A structural engineer wants to compute the displacement response of a bridge model under 50 different load cases (wind, earthquake, traffic patterns).',
      competingTechniques: 'GMRES for each load case, or Cholesky factorization once then 50 triangular solves.',
      whyThisTechniqueWins: 'The stiffness matrix $K$ is fixed. Cholesky factorization: done once. Each of 50 load cases: two triangular solves, $O(\\text{nnz}(L))$ work. Total work: $O(N^{3/2}) + 50 \\cdot O(N\\log N)$ vs GMRES $50 \\cdot O(N^{3/2})$. Direct solver wins decisively for many right-hand sides.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\text{fill-in}(A, P)', meaning: 'Nonzeros appearing in $L$ or $U$ of $PAP^\\top$ that were zero in $PAP^\\top$; a purely structural property — same for any matrix with the same sparsity pattern. Reordering $P$ minimizes this.' },
      { symbol: '\\text{AMD}(A)', meaning: 'Approximate Minimum Degree ordering: greedily eliminate the node with fewest connections (smallest degree) at each step. Runs in $O(\\text{nnz}(A))$ time; good general-purpose heuristic used by MATLAB\'s backslash and CHOLMOD.' },
      { symbol: '\\text{ND}(G)', meaning: 'Nested Dissection: find a separator $S$ of size $O(\\sqrt{n})$ in graph $G$, number the two subgraphs first, recurse. For 2D grids achieves $O(n \\log n)$ fill-in; for 3D achieves $O(n^{4/3})$.' },
      { symbol: 'T(A)', meaning: 'Elimination tree of $A$: node $j$ is the parent of $i$ if $L_{ij} \\neq 0$ and $j$ is the smallest such column. Nodes in disjoint subtrees are independent — the depth of $T(A)$ is the critical path length for parallel factorization.' },
      { symbol: '\\text{nnz}(L) / \\text{nnz}(A)', meaning: 'Fill ratio: ratio of nonzeros in the Cholesky factor to nonzeros in $A$. Rule of thumb: if fill ratio $> 50$, a direct solve will be expensive — consider iterative. For 2D with ND, fill ratio $\\approx O(\\log n) \\ll 1$.' },
      { symbol: '\\text{supernode}', meaning: 'Maximal set of consecutive columns of $L$ with identical nonzero structure. Processing supernodes converts sparse updates into dense BLAS3 calls (DGEMM/DSYRK), achieving 50–80% of peak FLOP rate vs 5–10% for scalar sparse codes.' },
    ],
    rulesOfThumb: [
      'Always reorder before factoring: `amd(A)` in MATLAB/SciPy for general sparse; ND for regular grids. Skipping reordering can cause 10–100× excess fill-in.',
      '2D direct solve: use sparse direct (CHOLMOD, SuperLU) for $n < 10^5$ unknowns; switch to iterative + AMG for larger 2D problems.',
      '3D direct solve: ND gives $O(N^{4/3})$ fill-in — already $10^8$ entries for $N = 10^6$. For 3D $n > 10^4$, iterative methods almost always win.',
      'Factor once, solve many: the factorization cost is amortized over multiple right-hand sides. For $k$ RHS with same $A$, direct solvers win when $k \\geq \\sqrt{N} / \\log N$.',
      'Check the fill ratio before committing: compute \'nnz(chol(A(p,p))) / nnz(A)\' in MATLAB. If the ratio exceeds 50, switch to iterative + ILU or AMG preconditioner.',
    ],
  },

  spiral: {
    recoveryPoints: ['la7-003', 'la9-004'],
    futureLinks: ['la10-001', 'la10-002'],
  },

  debugging: [
    {
      commonError: 'Applying a sparse direct solver to a near-singular matrix, getting wildly inaccurate results without error messages.',
      symptom: 'The solution has entries of order $10^{10}$ or $10^{15}$ that are clearly wrong; the residual $\\|A\\hat{x}-b\\|/\\|b\\|$ is $O(1)$ instead of $O(\\varepsilon_{\\text{mach}})$.',
      whyItHappened: 'A nearly singular pivot was encountered and the solver proceeded without flagging it (partial pivoting accepted a tiny but non-zero pivot). The computed $L$ and $U$ have huge entries, amplifying any rounding error.',
      repairStrategy: 'Check $\\kappa(A)$ before factoring. Most sparse solvers report a diagonal scaling or warn about small pivots — enable these warnings. If $\\kappa > 10^{12}$, consider regularization ($A + \\varepsilon I$) or a different formulation.',
    },
    {
      commonError: 'Using a sparse direct solver without reordering on a 3D FEM problem, running out of memory.',
      symptom: 'The program crashes with an out-of-memory error during factorization, even though the original matrix fits in RAM.',
      whyItHappened: 'Without reordering, the $L$ and $U$ factors can be $100\\times$ denser than $A$ for 3D problems. For $A$ with $5 \\times 10^6$ non-zeros, $LU$ without reordering can have $5 \\times 10^8$ non-zeros — a 40 GB factor.',
      repairStrategy: 'Always reorder before factoring: `P = symrcm(A)` or `P = amd(A)` in MATLAB. Check the fill-in ratio (`nnz(L)/nnz(A)`) before committing to a direct solve. If fill-in ratio $> 50$, switch to iterative + preconditioner.',
    },
  ],
};
