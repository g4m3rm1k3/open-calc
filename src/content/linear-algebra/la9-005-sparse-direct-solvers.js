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
    prose: [
      'Where you are in the story: you have now seen the full spectrum of iterative solvers — stationary methods (Jacobi, Gauss-Seidel), Krylov methods (CG, GMRES), and preconditioning strategies that make them practical. But iterative methods are not always the answer. They can stagnate on hard problems, they require tuning the preconditioner, and they produce approximate solutions that need careful monitoring. Sometimes you need the exact answer, robustly, without worrying about convergence. That is when you reach for sparse direct solvers.',
      'The challenge with sparse direct solvers is **fill-in**: when you perform Gaussian elimination on a sparse matrix, the factors $L$ and $U$ typically contain many more nonzero entries than the original $A$. This is because the elimination process creates new connections between variables that were not directly connected in $A$. In the worst case, a sparse matrix with $O(n)$ nonzeros can produce dense $L$ and $U$ factors with $O(n^2)$ nonzeros — eliminating all the sparsity benefit.',
      'A concrete 4-variable example reveals the key insight. Consider the arrow matrix: nonzeros on the diagonal and in the first row and column, all other entries zero. If you eliminate variables in natural order $(1,2,3,4)$: after eliminating variable 1, every pair of remaining variables $(2,3,4)$ that were both connected to variable 1 now needs a direct connection in $L$ or $U$. Variables 2, 3, and 4 all connect through variable 1, so the $\\{2,3,4\\} \\times \\{2,3,4\\}$ block fills in completely — 9 new nonzeros. Now reverse the order to $(4,3,2,1)$: variables 4, 3, 2 are "leaves" — they only connect to variable 1. Eliminating leaf 4 creates no new connections because 4 is not connected to any other remaining variable. Same for leaves 3 and 2. When you finally eliminate variable 1, all others are already gone. Total fill-in: **zero**.',
      'This example is not a special trick — it reveals a general principle. Fill-in occurs when two variables that both connect to the variable being eliminated are not themselves directly connected. A permutation matrix $P$ reorders the variables: instead of factoring $A$, you factor $PAP^\\top$ (same matrix, reordered), solve $PAP^\\top(P\\mathbf{x}) = P\\mathbf{b}$, then unpermute. The fill-in depends entirely on the order chosen by $P$. The graph interpretation is clean: fill-in equals new edges added to the adjacency graph of $A$ during elimination.',
      '**Predict before reading on:** For a tridiagonal (path graph) matrix eliminated in natural order, does fill-in occur? For an arrow matrix (star graph) in natural order, how much fill-in? For the 2D Poisson matrix — a grid graph — how does fill-in scale with problem size $n$?',
      'The answers: a tridiagonal matrix produces zero fill-in in natural order because when you eliminate variable $i$, variables $i-1$ and $i+1$ are already directly connected (the tridiagonal entry $a_{i-1,i+1}$ … wait, it is not! But $i-1$ has already been eliminated by the time you reach $i$, so no new connections are created). Actually, the tridiagonal stays tridiagonal throughout — no fill-in. For the 2D Poisson grid, natural order produces $O(n^{3/2})$ fill-in. Nested dissection — finding a small separator that splits the graph, reordering it last, recursing on the two halves — achieves $O(n \\log n)$ fill-in and $O(n^{3/2})$ flops. The **AMD (Approximate Minimum Degree)** algorithm provides a practical greedy heuristic: at each step, eliminate the variable whose elimination creates the fewest new connections. AMD is used by MATLAB\'s backslash operator, CHOLMOD, and most industrial sparse direct solvers.',
      'The major sparse direct solver libraries — CHOLMOD (for SPD), SuperLU and PARDISO (for general), MUMPS (for distributed memory) — implement these ideas at industrial scale. Their workflow is: (1) analyze sparsity and compute reordering, (2) symbolic factorization (determine the fill-in pattern without computing values), (3) numerical factorization (fill in the values), (4) triangular solves. Steps 1-3 are expensive and done once; step 4 is cheap and done for each right-hand side. This is why direct solvers are preferred when you need to solve many linear systems with the same $A$ but different $\\mathbf{b}$: factorize once, solve hundreds of times at $O(\\text{nnz}(L))$ each.',
      'For 3D problems, even nested dissection gives $O(n^{4/3})$ fill-in and $O(n^2)$ flops. For a million-variable 3D problem, that is $10^{12}$ operations — not feasible. This is the fundamental reason why iterative methods dominate in 3D: for large 3D systems, CG+AMG at $O(n)$ total work will always beat any direct factorization. The practical rule of thumb: use sparse direct for 2D problems and small 3D problems (up to $10^4$–$10^5$ unknowns), and preconditioned iterative methods for large 3D problems. Many production codes combine both: iterative outer loop, direct solver as a subdomain preconditioner.',
      'Where this is heading: this lesson completes the Iterative Solvers & Preconditioning chapter. You have now seen the entire landscape of linear system solvers — from the $O(n^3)$ dense LU of Chapter 7, through sparse iterative methods (Jacobi, GS, CG, GMRES), to the $O(n)$ dream of AMG-preconditioned Krylov methods. Chapter 10 will step back to the mathematical foundations: dual spaces, tensors, and operator theory — the abstract framework that unifies everything you have seen in Chapters 1-9.',
    ],
    callouts: [
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
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Sparse Direct Solvers in Python',
        mathBridge: 'Measure fill-in with and without reordering, then benchmark direct vs iterative on multiple right-hand sides.',
        caption: 'AMD reordering reduces fill-in dramatically; factorize once, solve many times at low cost.',
        initialProps: {
          initialCells: [
            {
              id: 1,

              cellTitle: 'Fill-in: arrow matrix natural order vs reversed',
              prose: 'Demonstrate the arrow matrix example from the lesson: natural elimination order causes complete fill-in; reversed order causes zero fill-in.',
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
              prose: 'Show the main advantage of direct solvers: pay the factorization cost once, then solve for many right-hand sides cheaply.',
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
      {
        id: 'OpenMatNotebook',
        title: 'Sparse Factorization and Fill-in',
        mathBridge: 'Observe fill-in in sparse LU and compare reorderings.',
        caption: 'Reordering the matrix before factorization dramatically reduces fill-in.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Fill-in demonstration',
              prose: ['Compare fill-in in LU factorization of a sparse matrix with and without reordering.'],
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
              prose: ['Factorize once, solve many times — the key advantage of direct solvers.'],
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
          expression: '\\text{Reorder: } [1,4,7,\\; 3,6,9,\\; 2,5,8] = [\\text{left}, \\text{right}, \\text{separator}]$',
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
          expression: '\\text{Winner: 1 RHS} \\Rightarrow \\text{CG+AMG}; \\quad k \\text{ RHS} \\Rightarrow \\text{Direct if } k > N^{1/2}/\\log N$',
          annotation: 'For many right-hand sides, the direct solver\'s cheap per-solve cost ($O(N \\log N)$) wins over AMG\'s setup cost. For a single RHS with large $N$, AMG wins. The crossover depends on problem size and number of RHS.',
          strategyTitle: 'Decision: which solver to use?',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la9-005-1',
      title: 'Elimination tree depth',
      difficulty: 'hard',
      prompt: 'For a path graph (tridiagonal matrix $A$), draw the elimination tree with natural ordering. What is its depth? How does depth relate to the potential for parallel factorization?',
      hint: 'The elimination tree for a tridiagonal matrix with natural ordering is a path.',
      solution: 'Tridiagonal with natural ordering: node $i$ is parent of $i-1$ (eliminating $i-1$ creates a fill entry in column $i$). The elimination tree is a path of length $n$ — depth $n-1$. Sequential factorization only. With nested dissection: the elimination tree is balanced with depth $O(\\log n)$ — enabling $O(n/\\log n)$ parallel speedup on $n/\\log n$ processors.',
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
