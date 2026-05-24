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
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Fill-in.** When Gaussian elimination is applied to a sparse matrix, the LU factors may have many more nonzeros than $A$ ("fill-in"). Example: an arrow matrix (one dense row/column) has $O(n)$ nonzeros but its LU factors are dense ($O(n^2)$ nonzeros). For a 2D Poisson grid with $n$ unknowns: no reordering → $O(n^{3/2})$ fill-in; nested dissection → $O(n\\log n)$ fill-in.',
      '**Reordering strategies.** The fill-in pattern depends on the order of elimination. A permutation matrix $P$ changes $A$ to $PAP^\\top$ before factorization, without changing the solution: $PAP^\\top (P\\mathbf{x}) = P\\mathbf{b}$. The goal: choose $P$ to minimize fill-in.\n\n**AMD (Approximate Minimum Degree)**: greedily eliminate the variable whose elimination causes fewest new fill-in entries. Works well in practice.\n\n**RCM (Reverse Cuthill-McKee)**: reorders to minimize bandwidth (nonzero width around diagonal). Good for banded matrices.\n\n**Nested dissection (ND)**: optimal for planar graphs. Find a separator of size $O(\\sqrt{n})$ that splits the graph in half; recurse. Results in $O(n\\log n)$ fill-in and $O(n^{3/2})$ flops for 2D problems.',
      '**Elimination tree.** The elimination tree encodes the dependencies in the factorization: node $j$ is the parent of $i$ if $j > i$ and $j$ is the first entry in column $i$ of $L$ after $i$. Subtrees can be computed in parallel — modern parallel sparse direct solvers (PARDISO, MUMPS) exploit this.',
    ],
    callouts: [
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
    { id: 'cp-la9-005-1', question: 'What is fill-in in sparse LU factorization?', answer: 'Entries in $L$ and $U$ that are nonzero but correspond to zero entries in $A$. The amount depends on elimination order.' },
    { id: 'cp-la9-005-2', question: 'What reordering strategy is optimal for 2D planar problems?', answer: 'Nested dissection (ND), which gives $O(n\\log n)$ fill-in and $O(n^{3/2})$ flops.' },
    { id: 'cp-la9-005-3', question: 'When do direct solvers have a clear advantage over iterative methods?', answer: 'When solving with multiple right-hand sides (factor once, solve many times), or when the problem size is moderate and robust factorization is needed.' },
  ],

  assessment: 'Explain why an arrow matrix (star graph) has $O(n^2)$ fill-in under natural ordering but $O(n)$ fill-in under reverse ordering. What lesson does this teach about reordering?',

  quiz: [
    { id: 'q-la9-005-1', question: 'Fill-in in sparse LU factorization depends on:', options: ['The eigenvalues of $A$', 'The condition number of $A$', 'The order in which variables are eliminated', 'The right-hand side $\\mathbf{b}$'], answer: 'The order in which variables are eliminated' },
    { id: 'q-la9-005-2', question: 'Nested dissection ordering reduces fill-in for 2D problems from $O(n^{3/2})$ to:', options: ['$O(n)$', '$O(n \\log n)$', '$O(n^{4/3})$', '$O(n^2)$'], answer: '$O(n \\log n)$' },
    { id: 'q-la9-005-3', question: 'The main advantage of direct solvers over iterative methods is:', options: ['Lower memory usage', 'Better parallel scalability', 'Exact solution (no iteration needed) and cheap multiple RHS solves', 'Faster for very large 3D problems'], answer: 'Exact solution (no iteration needed) and cheap multiple RHS solves' },
  ],
};
