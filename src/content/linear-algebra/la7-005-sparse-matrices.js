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
      'A $1000 \\times 1000$ grid of points produces a stiffness matrix of size $10^6 \\times 10^6$. Dense storage: $10^{12}$ entries $\\times$ 8 bytes = **8 terabytes** — impossible. But each interior point connects only to its 4 grid neighbors (up, down, left, right), so the matrix has only $\\approx 5 \\times 10^6$ non-zero entries. CSR sparse storage: $5 \\times 10^6 \\times 8$ bytes = **40 MB** — fits in a laptop. As a concrete mini-example, the $3 \\times 3$ matrix $A = \\begin{bmatrix}1&0&2\\\\0&3&0\\\\4&0&5\\end{bmatrix}$ has only 5 non-zeros out of 9 entries. CSR encodes it as: `values = [1,2,3,4,5]`, `col_idx = [0,2,1,0,2]`, `row_ptr = [0,2,3,5]`. To compute $A\\mathbf{x}$, you loop only over those 5 non-zeros — $O(nnz)$ flops instead of $O(n^2)$.',
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
        type: 'sequencing',
        title: 'Predict the Fill-In',
        body: 'Consider the $5 \\times 5$ tridiagonal matrix from Example 1 (2 on diagonal, -1 off-diagonal). Before looking: when you run LU factorization on this matrix, do you expect fill-in? (Hint: think about what the first elimination step does to row 2 — does it create non-zeros in column 1 outside the tridiagonal band?)',
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
    {
      id: 'ex-la7-005-2',
      title: 'CSR format construction and matrix-vector product',
      problem: 'Build the CSR representation of $A = \\begin{bmatrix}4&0&1\\\\0&2&0\\\\3&0&7\\end{bmatrix}$ and use it to compute $A\\mathbf{x}$ for $\\mathbf{x} = (1,2,3)^\\top$ without touching zeros.',
      steps: [
        {
          expression: '\\text{Non-zeros: } (0,0,4),\\, (0,2,1),\\, (1,1,2),\\, (2,0,3),\\, (2,2,7)',
          annotation: 'List (row, col, value) for each non-zero, row by row.',
          strategyTitle: 'Identify non-zeros',
        },
        {
          expression: '\\text{values} = [4,1,2,3,7], \\quad \\text{col\\_idx} = [0,2,1,0,2], \\quad \\text{row\\_ptr} = [0,2,3,5]',
          annotation: '`row_ptr[i]` is the index into `values` where row $i$ starts. Row 0 has entries at positions 0–1; row 1 at position 2; row 2 at positions 3–4.',
          strategyTitle: 'Build CSR arrays',
        },
        {
          expression: 'y_0 = 4 \\cdot x_0 + 1 \\cdot x_2 = 4(1) + 1(3) = 7',
          annotation: 'Row 0: multiply each non-zero value by the corresponding $x$ entry.',
          strategyTitle: 'Compute row 0 of $A\\mathbf{x}$',
        },
        {
          expression: 'y_1 = 2 \\cdot x_1 = 2(2) = 4, \\quad y_2 = 3 \\cdot x_0 + 7 \\cdot x_2 = 3(1)+7(3) = 24',
          annotation: 'Row 1 has one non-zero; row 2 has two. Total: 5 multiply-adds for a $3 \\times 3$ matrix with 5 non-zeros — zero multiplications were skipped.',
          strategyTitle: 'Rows 1 and 2',
        },
        {
          expression: 'A\\mathbf{x} = (7, 4, 24)^\\top',
          annotation: 'Verify: dense matrix multiplication also gives $(4+0+3, 0+4+0, 3+0+21) = (7,4,24)$ ✓.',
          strategyTitle: 'Result',
        },
      ],
    },
    {
      id: 'ex-la7-005-3',
      title: 'Fill-in during LU factorization',
      problem: 'Show the fill-in pattern when you apply LU factorization (no pivoting) to the $4\\times 4$ arrowhead matrix $A = \\begin{bmatrix}1&1&1&1\\\\1&2&0&0\\\\1&0&3&0\\\\1&0&0&4\\end{bmatrix}$.',
      steps: [
        {
          expression: 'A = \\begin{bmatrix}1&1&1&1\\\\1&2&0&0\\\\1&0&3&0\\\\1&0&0&4\\end{bmatrix} \\quad \\text{(5 non-zeros per row 0; 2 each for rows 1-3)}',
          annotation: 'The matrix has 11 non-zeros out of 16: the first row and column are full, rest is diagonal.',
          strategyTitle: 'Original sparsity pattern',
        },
        {
          expression: 'R_2 \\leftarrow R_2 - 1 \\cdot R_1: \\begin{bmatrix}1&1&1&1\\\\0&1&-1&-1\\\\1&0&3&0\\\\1&0&0&4\\end{bmatrix}',
          annotation: 'Eliminating column 1 from row 2 creates fill-in in positions (1,2) and (1,3) — new non-zeros!',
          strategyTitle: 'Step 1: fill created in row 2',
        },
        {
          expression: 'R_3,R_4 \\leftarrow \\text{similar}: \\quad L_\\text{lower} = \\begin{bmatrix}1&0&0&0\\\\1&1&0&0\\\\1&*&1&0\\\\1&*&*&1\\end{bmatrix}',
          annotation: 'Each subsequent elimination propagates fill. The final $L$ and $U$ are nearly dense — the sparsity of the original matrix is destroyed.',
          strategyTitle: 'Full dense fill-in after all eliminations',
        },
        {
          expression: '\\text{Reversed arrowhead: } A\' = P^\\top A P \\Rightarrow \\text{LU has no fill-in}',
          annotation: 'Reordering: move the hub node (row 0) to last position. Then elimination proceeds from the leaf nodes, which don\'t interact with each other, producing no fill. This is why reordering is crucial.',
          strategyTitle: 'Fix: reorder the matrix to minimize fill',
        },
      ],
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
    { id: 'cp-la7-005-1', label: 'Read: sparsity and storage formats', type: 'read' },
    { id: 'cp-la7-005-2', label: 'Read: sparse matvec and fill-in', type: 'read' },
    { id: 'cp-la7-005-3', label: 'Read: reordering and graph theory', type: 'read' },
    { id: 'cp-la7-005-4', label: 'Try: build and use sparse matrix in code', type: 'lab' },
    { id: 'cp-la7-005-5', label: 'Try: observe fill-in with and without reordering', type: 'lab' },
    { id: 'cp-la7-005-6', label: 'Work: tridiagonal matrix non-zero count', type: 'example' },
    { id: 'cp-la7-005-7', label: 'Work: CSR construction and matvec', type: 'example' },
    { id: 'cp-la7-005-8', label: 'Challenge: CSR construction by hand', type: 'challenge' },
  ],

  assessment: 'The $n \\times n$ tridiagonal matrix (1D Laplacian) has $3n-2$ non-zeros. Estimate the storage savings of CSR over dense for $n = 10^6$. Then estimate how many floating-point operations a dense LU vs sparse tridiagonal factorization would require.',

  quiz: [
    { id: 'q-la7-005-1', question: 'CSR format stores:', options: ['All $n^2$ entries', 'Non-zero values, column indices, and row pointers', 'Only the diagonal', 'Upper triangular entries'], answer: 'Non-zero values, column indices, and row pointers' },
    { id: 'q-la7-005-2', question: 'Fill-in during sparse LU factorization refers to:', options: ['Zeros that remain zero', 'Non-zeros that become zero', 'Zero entries that become non-zero', 'Diagonal entries that change'], answer: 'Zero entries that become non-zero' },
    { id: 'q-la7-005-3', question: 'For a sparse $n \\times n$ matrix with $O(n)$ non-zeros, one sparse matrix-vector product costs:', options: ['$O(n^2)$', '$O(n \\log n)$', '$O(n)$', '$O(n^{1.5})$'], answer: '$O(n)$' },
  ],
};
