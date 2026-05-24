export default {
  id: 'la7-005',
  slug: 'sparse-matrices',
  chapter: 'la7',
  order: 5,
  title: 'Sparse Matrices',
  subtitle: 'Most large matrices in engineering and data science have very few non-zero entries. Sparse storage and algorithms skip the zeros entirely — enabling linear algebra at scales impossible with dense methods.',
  tags: ['sparse matrix', 'CSR', 'CSC', 'sparse factorization', 'fill-in', 'graph', 'adjacency matrix', 'reordering', 'iterative solvers'],
  aliases: 'sparse matrix CSR CSC sparse factorization fill-in graph adjacency matrix reordering iterative solvers bandwidth storage',

  hook: {
    question: "The finite-element mesh of a bridge has 100,000 nodes. The stiffness matrix is $100000 \\times 100000$ — storing it densely requires 80 GB of RAM and $10^{15}$ flops to factor. But each node only connects to a few neighbors. How do you exploit that?",
    realWorldContext: "Sparse matrices are everywhere in scientific computing. Finite element analysis (structural mechanics, fluid dynamics, electromagnetics) produces sparse stiffness/mass matrices from mesh connectivity. Power grid analysis: the admittance matrix has only a few non-zeros per row. Google PageRank: the web graph has billions of nodes but each page links to only ~40 others — the matrix is $10^{-8}$% dense. Graph algorithms, recommendation systems, and network analysis all rely on sparse matrix operations. MATLAB\'s sparse support, SciPy\'s scipy.sparse, and PETSc are purpose-built for this.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Sparsity.** A matrix is **sparse** if most of its entries are zero. The sparsity pattern (which entries are non-zero) often has geometric or graph-theoretic meaning. A matrix with $nnz$ non-zeros in an $n \\times n$ matrix has **density** $nnz/n^2$. Typical sparse matrices have $nnz = O(n)$ or $O(n \\log n)$, while dense matrices have $nnz = n^2$.',
      '**Storage formats.** Dense: store all $n^2$ entries. Compressed Sparse Row (CSR): store `values[]` (non-zeros), `col_idx[]` (column index of each non-zero), `row_ptr[]` ($n+1$ pointers — where each row starts). Memory: $O(nnz)$ instead of $O(n^2)$. Compressed Sparse Column (CSC) is the column-oriented variant. COO (coordinate) format just stores $(i, j, v)$ triples — easy to build, but slow to use.',
      '**Sparse matrix-vector product.** The core operation for iterative solvers: $\\mathbf{y} = A\\mathbf{x}$. With CSR, each non-zero contributes one multiply-add: $O(nnz)$ flops instead of $O(n^2)$. For $nnz = O(n)$, this is $O(n)$ — linear in problem size. This is the basis for all large-scale sparse solvers.',
      '**Fill-in.** During Gaussian elimination on a sparse matrix, new non-zeros appear in positions that were originally zero — this is **fill-in**. A 1D mesh gives a tridiagonal matrix (no fill). A 2D mesh gives a banded matrix (fill within bandwidth). Poor ordering on a 3D mesh gives $O(n^{4/3})$ fill. **Reordering** (AMD, RCM, METIS) permutes rows and columns to minimize fill.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Sparse Storage: CSR Format',
        body: 'For $n \\times n$ matrix with $nnz$ non-zeros:\n```\nvalues:  [v_{r0,c0}, v_{r0,c1}, ..., v_{r1,c0}, ...]\ncol_idx: [c0 of row 0, c1 of row 0, ..., c0 of row 1, ...]\nrow_ptr: [0, nnz_row0, nnz_row0+nnz_row1, ..., nnz]\n```\nMemory: $O(nnz + n)$ instead of $O(n^2)$.\nMatrix-vector: iterate `for each row, for each non-zero in row, y[row] += val * x[col]`.',
      },
      {
        type: 'insight',
        title: 'Sparse vs Dense Complexity',
        body: 'For $n \\times n$ sparse matrices with $nnz = O(n)$:\n\n| Operation | Dense | Sparse |\n|-----------|-------|--------|\n| Storage | $O(n^2)$ | $O(n)$ |\n| Matvec $Ax$ | $O(n^2)$ | $O(n)$ |\n| LU factor | $O(n^3)$ | $O(n^{1.5})$ (2D) |\n| Iterative solve | — | $O(n)$/iteration |\n\n For $n = 10^6$: dense LU is impossible; sparse iterative is routine.',
      },
      {
        type: 'insight',
        title: 'Sparsity and Graphs',
        body: 'Every sparse matrix $A$ corresponds to a graph $G = (V, E)$: vertex $i$ connects to $j$ iff $A_{ij} \\neq 0$. Fill-in during LU corresponds to edges added to the graph (chordal completion). Reordering to minimize fill is equivalent to minimizing the fill of a chordal supergraph. AMD (Approximate Minimum Degree) greedily reduces graph degree to limit fill.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Sparse Matrix Operations',
        mathBridge: 'Build sparse matrices, visualize sparsity patterns, and compare performance.',
        caption: 'Sparse storage and matvec scale linearly with the number of non-zeros.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Build and inspect a sparse matrix',
              prose: ['Create the tridiagonal stiffness matrix for a 1D finite-difference problem.'],
              code: `% 1D Laplacian (tridiagonal): -1, 2, -1
n = 10
e = ones(n, 1)
% Build tridiagonal manually
A_dense = diag(2*e) - diag(e(1:n-1), 1) - diag(e(1:n-1), -1)
disp('1D Laplacian (dense):')
A_dense
disp('Number of non-zeros:')
nnz(A_dense)
disp('Sparsity (fraction of zeros):')
1 - nnz(A_dense)/numel(A_dense)
% Sparse version
A_sparse = sparse(A_dense)
disp('Dense storage (bytes):')
n * n * 8
disp('Sparse storage (approx bytes, 3*nnz*8):')
3 * nnz(A_sparse) * 8
`,
            },
            {
              id: 2,
              cellTitle: 'Sparse solve and fill-in',
              prose: ['Compare fill-in with natural ordering vs permuted ordering.'],
              code: `% 2D Laplacian (5-point stencil) for n x n grid
n = 8
N = n * n    % total unknowns
e = ones(N, 1)
% Build 2D Laplacian
I = speye(n)
T = spdiags([-e(1:n), 4*e(1:n), -e(1:n)], [-1 0 1], n, n)
B = spdiags([-e(1:n), -e(1:n)], [-1 1], n, n)
% Actually build using standard tridiagonal construction
A = kron(I, T) + kron(B, I)
disp('2D Laplacian nnz:')
nnz(A)
disp('As fraction of N^2:')
nnz(A) / N^2

% Factor: count fill-in
[L, U, P] = lu(A)
disp('Fill-in in L:')
nnz(L) - nnz(tril(A))
disp('Total nnz in L+U:')
nnz(L) + nnz(U)
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Fill-in and elimination tree.** The fill-in pattern of $L$ in the Cholesky factorization of a sparse SPD matrix $A$ is determined by the **elimination tree** of the underlying graph $G(A)$. Specifically, $L_{ij} \\neq 0$ iff there is a path from $j$ to $i$ in the elimination tree. This graph-theoretic characterization lets you predict fill before computing the factorization.',
      '**Reverse Cuthill-McKee (RCM).** RCM reorders a symmetric sparse matrix to reduce its **bandwidth** (the maximum distance from the diagonal to a non-zero). For a 1D mesh, RCM achieves bandwidth 1 (natural). For a 2D mesh, RCM achieves bandwidth $O(\\sqrt{n})$. Smaller bandwidth → less fill → faster factorization.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Sparse Cholesky Complexity',
        body: 'For the 2D Poisson problem on an $\\sqrt{n} \\times \\sqrt{n}$ grid (matrix size $n$):\n\n**Natural ordering:**\n• Fill: $O(n \\log n)$\n• Factorization: $O(n^{3/2})$\n\n**Nested dissection ordering (optimal):**\n• Fill: $O(n \\log n)$\n• Factorization: $O(n^{3/2})$\n• Optimal — no reordering does better for 2D problems',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Supernodal methods.** Modern sparse direct solvers (PARDISO, SuperLU, CHOLMOD) use **supernodes** — groups of columns with identical sparsity patterns — to apply dense BLAS-3 operations on blocks, getting cache efficiency similar to dense factorization within each supernode.',
      '**Iterative vs direct.** For 2D problems, direct sparse solvers ($O(n^{3/2})$) are competitive with iterative methods. For 3D, direct solvers require $O(n^2)$ storage and $O(n^3)$ work — iterative methods with preconditioners (CG, GMRES) are the only viable approach.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'When to Use Sparse vs Dense',
        body: '**Use sparse** when: $nnz \\ll n^2$; matrix comes from a mesh/graph; $n > 10000$; memory is a constraint.\n\n**Use dense** when: $n < 1000$; matrix is "full" (many non-zeros); you need maximum speed for small problems.\n\nHybrid: sometimes form a sparse preconditioner and solve dense blocks — "structured sparsity."',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la7-005-1',
      title: 'Sparse tridiagonal matrix',
      problem: 'Write out the $5 \\times 5$ tridiagonal matrix $T$ with 2 on the diagonal and -1 on sub- and superdiagonals. How many non-zeros does it have?',
      solution: '$T = \\begin{bmatrix}2&-1&0&0&0\\\\-1&2&-1&0&0\\\\0&-1&2&-1&0\\\\0&0&-1&2&-1\\\\0&0&0&-1&2\\end{bmatrix}$. Non-zeros: $5 \\cdot 2 - 2 \\cdot (5-1)/2 \\cdot 2 = 5 + 2(n-1) = 5 + 8 = 13$ out of $25$ entries.',
    },
  ],

  challenges: [
    {
      id: 'ch-la7-005-1',
      title: 'CSR construction',
      difficulty: 'medium',
      prompt: 'Write out the CSR (Compressed Sparse Row) representation of the $3 \\times 3$ matrix $A = \\begin{bmatrix}1&0&2\\\\0&3&0\\\\4&0&5\\end{bmatrix}$.',
      hint: 'List values row by row, keeping column indices.',
      solution: '`values = [1, 2, 3, 4, 5]`, `col_idx = [0, 2, 1, 0, 2]` (0-indexed), `row_ptr = [0, 2, 3, 5]`. Row 0 has non-zeros at positions 0-1 in `values`; row 1 at position 2; row 2 at positions 3-4.',
    },
  ],

  mentalModel: [
    'Sparse = mostly zeros. Store only non-zeros (CSR format) → $O(nnz)$ instead of $O(n^2)$.',
    'Sparse matvec $Ax$: $O(nnz)$ flops — the key primitive for iterative solvers.',
    'Fill-in: LU/Cholesky creates new non-zeros. Minimize with reordering (AMD, RCM, METIS).',
    'Sparsity $\\leftrightarrow$ graph: non-zeros are edges. Fill = chordal completion of the graph.',
    'Rule of thumb: $n > 10^4$ and sparse → use sparse storage and iterative solvers.',
  ],

  checkpoints: [
    { id: 'cp-la7-005-1', question: 'What is fill-in in sparse Gaussian elimination?', answer: 'New non-zeros created in positions that were zero in the original matrix, as eliminations modify other entries.' },
    { id: 'cp-la7-005-2', question: 'For a sparse matrix with $n$ rows and $O(n)$ non-zeros, how expensive is one matrix-vector product?', answer: '$O(n)$ flops — linear in $n$.' },
    { id: 'cp-la7-005-3', question: 'Why is matrix reordering important for sparse factorizations?', answer: 'Different orderings produce different fill-in patterns. Good orderings (AMD, METIS) minimize fill, reducing storage and flops for the factorization.' },
  ],

  assessment: 'The $n \\times n$ tridiagonal matrix (1D Laplacian) has $3n-2$ non-zeros. Estimate the storage savings of CSR over dense for $n = 10^6$. Then estimate how many floating-point operations a dense LU vs sparse tridiagonal factorization would require.',

  quiz: [
    { id: 'q-la7-005-1', question: 'CSR format stores:', options: ['All $n^2$ entries', 'Non-zero values, column indices, and row pointers', 'Only the diagonal', 'Upper triangular entries'], answer: 'Non-zero values, column indices, and row pointers' },
    { id: 'q-la7-005-2', question: 'Fill-in during sparse LU factorization refers to:', options: ['Zeros that remain zero', 'Non-zeros that become zero', 'Zero entries that become non-zero', 'Diagonal entries that change'], answer: 'Zero entries that become non-zero' },
    { id: 'q-la7-005-3', question: 'For a sparse $n \\times n$ matrix with $O(n)$ non-zeros, one sparse matrix-vector product costs:', options: ['$O(n^2)$', '$O(n \\log n)$', '$O(n)$', '$O(n^{1.5})$'], answer: '$O(n)$' },
  ],
};
