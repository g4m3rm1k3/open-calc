import csrStorageUrl from '../diagrams/la-csr-sparse-storage.svg?url';
import fillinUrl from '../diagrams/la-sparse-fillin.svg?url';

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
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      '**Where you are in the story.** Everything covered so far — QR, Cholesky, condition numbers, pivoting — assumes dense matrices. Dense means you store every entry. Dense means every operation touches every element. This works fine when $n$ is a few thousand. But the problems that matter most to engineers and scientists have $n$ in the millions or billions. A finite-element mesh with a million nodes produces a $10^6 \\times 10^6$ matrix — dense storage would require 8 terabytes and dense LU would take $10^{18}$ floating-point operations. Sparse matrices are how you solve these problems at all.',

      '**The key observation: most entries are zero.** In a finite-element mesh, each node only connects to a few physical neighbors. In the web graph, each page links to maybe 40 others out of a billion. In a power grid, each bus connects to a few transmission lines. When you represent these systems as matrices, the vast majority of entries are zero — often more than $99.99\\%$. A matrix is "sparse" when its non-zero count $nnz$ is $O(n)$ rather than $O(n^2)$.',

      '**Storage: only keep the non-zeros.** The most common sparse format is Compressed Sparse Row (CSR). For $A = \\begin{bmatrix}1&0&2\\\\0&3&0\\\\4&0&5\\end{bmatrix}$: CSR stores `values = [1, 2, 3, 4, 5]` (just the non-zeros), `col_idx = [0, 2, 1, 0, 2]` (column of each non-zero), `row_ptr = [0, 2, 3, 5]` (where each row starts in the arrays). Memory: $O(nnz)$ instead of $O(n^2)$. For the million-node mesh with 5 neighbors each: 5 million entries instead of $10^{12}$ — 200,000 times smaller.',
      ] },
      { type: 'image', src: csrStorageUrl,
        alt: 'A 3x3 matrix with most entries faded as zero, next to three arrays: values holding the non-zeros, col_idx holding their column positions, and row_ptr marking where each row starts',
        caption: 'CSR keeps only the non-zeros and a map of where they belong — memory drops from O(n²) to O(nnz).' },
      { type: 'prose', paragraphs: [
      '**Matrix-vector products are the foundation.** Every iterative solver — conjugate gradient, GMRES, multigrid — reduces to repeating the operation $\\mathbf{y} = A\\mathbf{x}$. With CSR, this costs $O(nnz)$ flops: iterate over non-zeros, multiply by $\\mathbf{x}$ at the matching column, accumulate. For $nnz = O(n)$, this is linear time. The entire iterative solver becomes $O(k \\cdot n)$ where $k$ is the number of iterations — feasible even for $n = 10^6$.',

      '**Predict before reading on.** Consider a $5 \\times 5$ tridiagonal matrix (2 on the diagonal, $-1$ on the super- and sub-diagonals). When you run Gaussian elimination on it, do you expect any fill-in — new non-zeros appearing where there were zeros? Think about what happens when row 1 eliminates from row 2. Write your prediction.',

      '**Fill-in: the complication for direct solvers.** When you run Gaussian elimination on a sparse matrix, the $L$ and $U$ factors are generally denser than $A$ — new non-zeros appear in positions that were zero in $A$. A tridiagonal 1D problem has no fill. A 2D mesh problem fills within its bandwidth. A poorly ordered 3D problem can fill so densely that the direct solve is infeasible. This is why sparse direct solvers always reorder first.',
      ] },
      { type: 'image', src: fillinUrl,
        alt: 'A tridiagonal 4x4 matrix before elimination next to its L+U factors after elimination, with new red-highlighted non-zero entries appearing where A had zeros',
        caption: 'Elimination can manufacture new non-zeros (red) in spots that were zero in A — fill-in is the price of factoring sparse matrices directly.' },
      { type: 'prose', paragraphs: [
      '**Reordering minimizes fill-in.** Permuting the rows and columns of $A$ (which does not change its solution) can dramatically reduce fill. The Cuthill-McKee ordering reduces bandwidth for banded matrices. AMD (Approximate Minimum Degree) works well for unstructured meshes. METIS partitions the graph to create a nested dissection ordering that gives optimal fill for 2D and 3D problems. NumPy and scipy.sparse support sparse operations natively; MATLAB has built-in sparse support since the 1980s.',

      '**Where this is heading.** Sparse matrices are not a dead end — they connect to the next lesson on the Schur decomposition and to iterative methods like conjugate gradient. For very large systems, iterative methods (which only need matrix-vector products, not the full factorization) are the only feasible approach. Understanding sparse structure tells you which method to pick.',
      ] },
      { type: 'viz', id: 'PythonNotebook',
        title: 'Sparse Matrices with scipy.sparse',
        mathBridge: 'Build sparse matrices using CSR format, perform sparse matvec, compare memory use and timing vs dense, and observe fill-in.',
        caption: 'scipy.sparse is the Python standard for sparse matrix operations — used in scikit-learn, NetworkX, and FEniCS.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Build a sparse tridiagonal matrix',
              prose: [
                'Create the 1D Laplacian (tridiagonal: 2 on diagonal, -1 off-diagonal) as both dense and CSR sparse. Compare memory usage.',
                '`from scipy.sparse import diags`. `L = diags([-1,2,-1], [-1,0,1], shape=(n,n), format="csr")`. Dense version: `L_dense = L.toarray()`. Memory: `L.data.nbytes + L.indices.nbytes + L.indptr.nbytes` (sparse) vs `L_dense.nbytes` (dense). For n=10000, sparse uses ~3*n*8 bytes ≈ 240 KB; dense uses n²*8 bytes ≈ 800 MB.',
                'The CSR (Compressed Sparse Row) format stores three arrays: `data` (non-zero values), `indices` (column positions), `indptr` (row start pointers). `L.nnz` gives the number of non-zeros — for a tridiagonal n×n matrix, nnz = 3n-2. The density is `(3n-2)/n² ≈ 3/n` — approaches 0 as n grows. Sparsity matters when density < ~10%.',
              ],
              code: `import numpy as np
import scipy.sparse as sp

n = 1000

# Dense construction
A_dense = np.zeros((n, n))
for i in range(n):
    A_dense[i, i] = 2.0
    if i > 0:     A_dense[i, i-1] = -1.0
    if i < n-1:   A_dense[i, i+1] = -1.0

# Sparse CSR construction
diags = [np.full(n, 2.0), np.full(n-1, -1.0), np.full(n-1, -1.0)]
A_sparse = sp.diags(diags, [0, -1, 1], format='csr')

print(f"Dense memory:  {A_dense.nbytes / 1e6:.1f} MB")
print(f"Sparse memory: {(A_sparse.data.nbytes + A_sparse.indices.nbytes + A_sparse.indptr.nbytes) / 1e3:.1f} KB")
print(f"Density: {A_sparse.nnz / n**2 * 100:.4f}%")
print(f"Non-zeros: {A_sparse.nnz} out of {n*n}")
`,
            },
            {
              id: 2,
              cellTitle: 'Sparse vs dense matrix-vector product timing',
              prose: [
                'Compare the time to compute A @ x for sparse vs dense. For n = 10000, the difference should be dramatic.',
                '`import time; x = np.random.randn(n)`. Sparse: `t0=time.time(); L @ x; print(time.time()-t0)`. Dense: `t0=time.time(); L_dense @ x; print(time.time()-t0)`. For n=10000, sparse should be 100-1000× faster. The complexity: sparse matvec is O(nnz) ≈ O(3n); dense matvec is O(n²).',
                'Plot time vs n on a loglog plot for both methods. The slopes tell you the complexity: dense should slope at 2 (O(n²)), sparse at 1 (O(n)). The crossover point where sparse beats dense is around n=30-50 for a tridiagonal matrix. For memory bandwidth reasons, the actual crossover is higher in practice — but the asymptotic advantage is clear from the plot.',
              ],
              code: `import numpy as np
import scipy.sparse as sp
import time

n = 10000
A_sparse = sp.diags([np.full(n, 2.0), np.full(n-1, -1.0), np.full(n-1, -1.0)],
                     [0, -1, 1], format='csr')
A_dense  = A_sparse.toarray()
x = np.random.randn(n)

# Time sparse matvec
t0 = time.perf_counter()
for _ in range(100): y_sp = A_sparse @ x
t_sparse = (time.perf_counter() - t0) / 100 * 1000

# Time dense matvec
t0 = time.perf_counter()
for _ in range(100): y_dn = A_dense @ x
t_dense = (time.perf_counter() - t0) / 100 * 1000

print(f"Sparse matvec: {t_sparse:.3f} ms")
print(f"Dense matvec:  {t_dense:.3f} ms")
print(f"Speedup: {t_dense/t_sparse:.1f}x")
print(f"Max error: {np.max(np.abs(y_sp - y_dn)):.2e}")
`,
            },
            {
              id: 3,
              cellTitle: 'Observe fill-in during sparse LU',
              prose: [
                'Factor a sparse matrix with scipy and measure how much fill-in is generated. Compare orderings.',
                '`from scipy.sparse.linalg import splu`. `lu = splu(L)`. `fill = lu.L.nnz + lu.U.nnz - L.nnz`. For the 1D Laplacian (tridiagonal), splu produces no fill-in. For the 2D Laplacian (5-point stencil), the natural ordering creates significant fill; the AMD (Approximate Minimum Degree) reordering minimizes it.',
                'Visualise the sparsity pattern: `plt.spy(L)` shows the original pattern; `plt.spy(lu.L + lu.U)` shows the factorisation pattern. AMD reordering: `perm = splu(L, permc_spec="MMD_AT_PLUS_A").perm_c`. Apply: `L_perm = L[perm, :][:, perm]`; compare `splu(L_perm).L.nnz` to `splu(L).L.nnz`. Good orderings can reduce fill-in by 10-100× for 2D problems.',
              ],
              code: `import numpy as np
import scipy.sparse as sp
from scipy.sparse.linalg import splu

n = 50
A = sp.diags([np.full(n, 4.0), np.full(n-1, -1.0), np.full(n-1, -1.0)],
              [0, -1, 1], format='csc')

# LU factorization (SuperLU under the hood)
lu = splu(A)

nnz_A  = A.nnz
nnz_LU = lu.L.nnz + lu.U.nnz

print(f"Original matrix non-zeros: {nnz_A}")
print(f"L + U non-zeros after LU:  {nnz_LU}")
print(f"Fill factor: {nnz_LU / nnz_A:.2f}x")
print()
print("For tridiagonal 1D: almost no fill-in")
print("For 2D mesh: significant fill-in")
print("For 3D mesh: use iterative solvers instead")
`,
            },
          ],
        },
      },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'Sparse Matrix Operations',
        mathBridge: 'Build sparse matrices, visualize sparsity patterns, and compare performance.',
        caption: 'Sparse storage and matvec scale linearly with the number of non-zeros.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Build and inspect a sparse matrix',
              prose: [
                'Create the tridiagonal stiffness matrix for a 1D finite-difference problem.',
                '`n = 10; A = sparse(n, n); for i = 1:n, A(i,i)=2; if i>1, A(i,i-1)=-1; end; if i<n, A(i,i+1)=-1; end; end`. Or more efficiently: `A = spdiags([-ones(n,1), 2*ones(n,1), -ones(n,1)], [-1,0,1], n, n)`. `spy(A)` shows the tridiagonal pattern.',
                '`whos A` shows type as sparse. `nnz(A)` gives 3n-2 non-zeros. Memory comparison: `nnz(A)*8` bytes (sparse) vs `n^2*8` bytes (dense). `A_dense = full(A); whos A A_dense` side-by-side shows the difference. For n=1000: sparse ~24 KB, dense ~8 MB — 300× larger for this simple case.',
              ],
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
              prose: [
                'Compare fill-in with natural ordering vs permuted ordering.',
                'For the 2D Laplacian on an n×n grid (n²×n² matrix, 5n²-4n non-zeros): `[L_factor,U_factor,P,Q] = lu(A_2d)`. `nnz(L_factor+U_factor)` — fill-in count. With natural ordering, this is much larger than `nnz(A_2d)`. Apply reverse Cuthill-McKee ordering: `p = symrcm(A_2d); A_perm = A_2d(p,p); [L2,U2,~,~] = lu(A_perm); nnz(L2+U2)`.',
                'The `spy` plots compare the factor sparsity patterns side-by-side. Natural ordering creates dense "staircase" blocks in L and U. The permuted ordering preserves a near-banded structure with far less fill. The total work for the factorisation is proportional to `sum(col_nonzeros^2)` — the permuted version does far less work, which translates directly to faster solves for large finite-element problems.',
              ],
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
    callouts: [
      {
        type: 'procedure',
        title: 'How to Solve a Large Sparse Linear System (4 Steps)',
        body: '1. **Identify sparsity.** Estimate $nnz$ and density $= nnz/n^2$. If density $< 1\\%$ and $n > 10^4$, sparse methods are mandatory — dense LU will run out of memory or time.\n2. **Reorder.** Apply AMD (symmetric SPD matrices) or METIS/nested dissection (2D/3D meshes) to get a permutation $P$; work with $PAP^\\top$. This step alone can reduce fill-in by 100×.\n3. **Choose method.** For 2D problems or $n < 10^5$: sparse direct solver (CHOLMOD, SuperLU). For 3D problems or $n > 10^5$ updated at each time step: iterative solver (CG for SPD, GMRES otherwise) with a preconditioner.\n4. **Factor and solve.** Direct: compute $L$ of $PAP^\\top = LL^\\top$, solve $Lz = Pb$ then $L^\\top y = z$, recover $x = P^\\top y$. Iterative: run preconditioned CG — each iteration costs one matvec $O(nnz)$; monitor $\\|b - Ax_k\\|/\\|b\\| < \\text{tol}$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 5 of 7 — Numerical Linear Algebra',
        body: '**Previous (Lesson 4):** Numerical stability — catastrophic cancellation, machine epsilon, partial pivoting.\n**This lesson:** Sparse matrices — CSR storage, sparse matvec, fill-in, and reordering for direct solvers.\n**Next (Lesson 6):** Schur decomposition — the block upper triangular form for eigenvalue computation.',
      },
      {
        type: 'insight',
        title: 'Sparse Storage: CSR Format',
        body: 'For $n \\times n$ matrix with $nnz$ non-zeros:\n- `values[nnz]` — the non-zero values in row-major order\n- `col_idx[nnz]` — column index of each value\n- `row_ptr[n+1]` — row_ptr[i] is the start of row $i$ in values/col_idx\n\nMemory: $O(nnz + n)$ instead of $O(n^2)$.',
      },
      {
        type: 'insight',
        title: 'Sparse vs Dense Complexity',
        body: 'For $n \\times n$ sparse ($nnz = O(n)$) vs dense:\n\nStorage: $O(n)$ vs $O(n^2)$\nMatvec $Ax$: $O(n)$ vs $O(n^2)$\nDirect LU: $O(n^{1.5})$ (2D mesh) vs $O(n^3)$\nIterative solve: $O(k \\cdot n)$ vs not applicable\n\nFor $n = 10^6$: dense LU is $10^{18}$ flops (impossible); sparse iterative is $10^8$ (seconds).',
      },
      {
        type: 'insight',
        title: 'Sparsity and Graphs',
        body: 'Every sparse matrix $A$ corresponds to a graph: node $i$ connects to $j$ iff $A_{ij} \\neq 0$. Fill-in during LU = edges added in the elimination graph. Reordering to minimize fill = finding the ordering that minimizes the chordal completion of the graph. This is why sparse solver packages (METIS, CHOLMOD) have graph partitioning algorithms.',
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
      '**Conjugate gradient and Krylov subspaces.** The conjugate gradient (CG) method is the preeminent iterative solver for SPD systems $A\\mathbf{x} = \\mathbf{b}$. Starting from $\\mathbf{x}_0$, CG builds an $A$-conjugate basis for the Krylov subspace $\\mathcal{K}_k(A, \\mathbf{r}_0) = \\operatorname{span}\\{\\mathbf{r}_0, A\\mathbf{r}_0, \\ldots, A^{k-1}\\mathbf{r}_0\\}$, minimizing $\\|\\mathbf{e}_k\\|_A$ over this subspace at iteration $k$. Each step costs exactly one sparse matvec plus $O(n)$ vector operations. Convergence is geometric: $\\|\\mathbf{e}_k\\|_A \\leq 2\\left(\\frac{\\sqrt{\\kappa}-1}{\\sqrt{\\kappa}+1}\\right)^k \\|\\mathbf{e}_0\\|_A$, so roughly $O(\\sqrt{\\kappa})$ iterations are needed to reduce the error by a fixed factor. For a 2D Poisson problem, $\\kappa = O(n^{1/2})$ (after scaling) and unpreconditioned CG needs $O(n^{1/4})$ iterations — total cost $O(n^{5/4})$, better than sparse direct $O(n^{3/2})$ when $n$ is large. Incomplete Cholesky IC(0) preconditioner reduces $\\kappa$ from $O(h^{-2})$ to $O(h^{-1})$, halving the iteration count. For non-symmetric systems, GMRES (Generalized Minimal Residual) builds the same Krylov subspace but minimizes the residual norm rather than the $A$-norm error.',
      '**Nested dissection: optimal reordering for structured meshes.** Nested dissection achieves provably optimal fill-in for structured 2D and 3D problems. The algorithm for a $\\sqrt{n} \\times \\sqrt{n}$ grid: find a separator of $O(\\sqrt{n})$ nodes splitting the graph into two equal halves; label both halves recursively first, then label the separator nodes last. The separator appears last in the elimination order, so it fills only within itself; the two halves are independent and generate no mutual fill. Recursing $\\log_2 n$ levels yields $O(n \\log n)$ fill and $O(n^{3/2})$ factorization flops — optimal for 2D, matching the best possible result. For 3D problems with $N$ unknowns, separators have size $O(N^{2/3})$ and the analysis gives $O(N^{4/3})$ fill and $O(N^2)$ factorization. METIS implements multilevel graph partitioning to approximate nested dissection on unstructured meshes; SCOTCH and PT-SCOTCH extend this to distributed-memory parallel machines.',
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
      title: 'CSR construction by hand',
      difficulty: 'medium',
      problem: 'Build the CSR representation of $A = \\begin{bmatrix}1&0&2\\\\0&3&0\\\\4&0&5\\end{bmatrix}$. State the three arrays `values`, `col_idx`, `row_ptr`, and verify $nnz = 5$.',
      walkthrough: [
        { expression: '\\text{Row 0: } (0,0,1),\\,(0,2,2); \\quad \\text{Row 1: } (1,1,3); \\quad \\text{Row 2: } (2,0,4),\\,(2,2,5)', annotation: 'Read each row left-to-right, recording (row, col, value) for every non-zero. Five non-zeros total.' },
        { expression: '\\text{values} = [1,2,3,4,5], \\quad \\text{col\\_idx} = [0,2,1,0,2]', annotation: 'Flatten non-zeros row by row. col_idx[k] is the column of the k-th stored value.' },
        { expression: '\\text{row\\_ptr} = [0,2,3,5]', annotation: 'row_ptr[0]=0 (row 0 starts at index 0), row_ptr[1]=2 (row 1 starts at index 2), row_ptr[2]=3, row_ptr[3]=5=nnz (sentinel).' },
        { expression: '|\\text{values}| = |\\text{col\\_idx}| = nnz = 5, \\quad |\\text{row\\_ptr}| = n+1 = 4', annotation: 'Always verify: values and col_idx have length nnz; row_ptr has length n+1 with row_ptr[n]=nnz.' },
      ],
    },
    {
      id: 'ch-la7-005-2',
      title: 'Sparse matvec without touching zeros',
      difficulty: 'easy',
      problem: 'Given $A = \\begin{bmatrix}3&0&1\\\\0&2&0\\\\1&0&4\\end{bmatrix}$ with CSR arrays `values=[3,1,2,1,4]`, `col_idx=[0,2,1,0,2]`, `row_ptr=[0,2,3,5]`, compute $A\\mathbf{x}$ for $\\mathbf{x}=(1,0,2)^\\top$ using only the stored non-zeros.',
      walkthrough: [
        { expression: 'y_0: \\text{ row\\_ptr}[0]{=}0 \\text{ to } \\text{row\\_ptr}[1]{-}1{=}1 \\Rightarrow 3\\cdot x_0 + 1\\cdot x_2 = 3(1)+1(2) = 5', annotation: 'Row 0 spans indices 0 and 1 in values. Multiply each value by x at col_idx[k]. The zero at position (0,1) was never accessed.' },
        { expression: 'y_1: \\text{ index } 2 \\Rightarrow 2\\cdot x_1 = 2(0) = 0', annotation: 'Row 1 has one non-zero at index 2. One multiply-add.' },
        { expression: 'y_2: \\text{ indices } 3,4 \\Rightarrow 1\\cdot x_0 + 4\\cdot x_2 = 1(1)+4(2) = 9', annotation: 'Row 2 spans indices 3 and 4. Two multiply-adds.' },
        { expression: 'A\\mathbf{x} = (5,0,9)^\\top; \\quad \\text{total flops} = 2\\cdot nnz = 10 \\text{ vs } 2n^2=18 \\text{ dense}', annotation: 'Verify: dense gives (3+0+2, 0+0+0, 1+0+8)=(5,0,9)^T ✓. Sparse used 5 multiply-adds; dense used 9 — sparse skipped 4 zero multiplications.' },
      ],
    },
    {
      id: 'ch-la7-005-3',
      title: 'Fill-in and reordering for an arrowhead matrix',
      difficulty: 'hard',
      problem: 'Let $A = \\begin{bmatrix}6&2&2&2\\\\2&4&0&0\\\\2&0&5&0\\\\2&0&0&3\\end{bmatrix}$ (hub at row/col 0). (a) Count $nnz(A)$. (b) Perform one Gaussian elimination step (eliminate col 0 from rows 1–3) and identify the fill-in. (c) Show that reordering to hub-last using $P=[1,2,3,0]$ eliminates all fill.',
      walkthrough: [
        { expression: 'nnz(A) = 10: \\quad 4 \\text{ diagonal} + 3 \\text{ off-diag pairs} \\times 2 = 10', annotation: 'A is symmetric: diagonal entries (0,0),(1,1),(2,2),(3,3) plus off-diag pairs (0,1),(0,2),(0,3) and their transposes.' },
        { expression: 'm_{10}=m_{20}=m_{30} = \\tfrac{2}{6} = \\tfrac{1}{3}', annotation: 'Multipliers for eliminating col 0: l_{i0} = a_{i0}/a_{00} = 2/6.' },
        { expression: 'R_1 \\leftarrow R_1 - \\tfrac{1}{3}R_0 = [0,\\,\\tfrac{10}{3},\\,-\\tfrac{2}{3},\\,-\\tfrac{2}{3}]', annotation: 'New non-zeros appear at (1,2) and (1,3): fill-in! Similarly R2 gets fill at (2,1),(2,3) and R3 at (3,1),(3,2).' },
        { expression: '\\text{After step 1: 6 new non-zeros} \\Rightarrow nnz = 16; \\text{ 3×3 submatrix rows/cols 1–3 is now dense}', annotation: 'The sparse structure is destroyed after one step. All subsequent elimination finds no zeros to skip — the factors L and U are nearly full.' },
        { expression: 'PAP^\\top = \\begin{bmatrix}4&0&0&2\\\\0&5&0&2\\\\0&0&3&2\\\\2&2&2&6\\end{bmatrix} \\quad (P=[1,2,3,0])', annotation: 'Hub moved to last row/col. Rows 0–2 of the reordered matrix are diagonal with one nonzero in the last column only.' },
        { expression: '\\text{Leaf-first: cols 0,1,2 each update only row 3 (already non-zero)} \\Rightarrow \\text{no fill-in}', annotation: 'Eliminating col 0 from rows 1,2,3: only row 3 has a non-zero at col 0 (value 2). Rows 1 and 2 are untouched. The LU factors stay sparse: nnz(L+U) = nnz(A) + n = 14 vs 22 without reordering.' },
      ],
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
    {
      id: 'q-la7-005-1',
      type: 'choice',
      text: 'CSR (Compressed Sparse Row) format stores:',
      options: ['All $n^2$ entries', 'Non-zero values, column indices, and row pointers', 'Only the diagonal entries', 'Upper triangular entries only'],
      answer: 'Non-zero values, column indices, and row pointers',
      hints: ['CSR uses three arrays: `values[]` (the non-zero values), `col_idx[]` (column index of each non-zero), and `row_ptr[]` (where each row starts in the arrays). Memory: $O(nnz + n)$ instead of $O(n^2)$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-005-2',
      type: 'choice',
      text: 'Fill-in during sparse LU factorization refers to:',
      options: ['Zeros that remain zero throughout', 'Non-zeros that become zero during elimination', 'Zero entries in the original matrix that become non-zero in $L$ or $U$', 'Diagonal entries that change value'],
      answer: 'Zero entries in the original matrix that become non-zero in $L$ or $U$',
      hints: ['During Gaussian elimination, subtracting a multiple of one row from another can produce non-zeros in positions that were originally zero. This "fill-in" inflates the factored matrix, increasing storage and computation.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-005-3',
      type: 'choice',
      text: 'For a sparse $n \\times n$ matrix with $O(n)$ non-zeros, one sparse matrix-vector product costs:',
      options: ['$O(n^2)$', '$O(n \\log n)$', '$O(n)$', '$O(n^{1.5})$'],
      answer: '$O(n)$',
      hints: ['Sparse matvec visits only the $nnz$ non-zero entries. If $nnz = O(n)$, the total work is $O(n)$ multiply-adds — linear in problem size. This is the key advantage enabling iterative solvers for problems where $n > 10^6$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-005-4',
      type: 'choice',
      text: 'The $n \\times n$ tridiagonal matrix has how many non-zeros?',
      options: ['$n$', '$2n$', '$3n - 2$', '$n^2$'],
      answer: '$3n - 2$',
      hints: ['Diagonal: $n$ entries. Superdiagonal: $n-1$ entries. Subdiagonal: $n-1$ entries. Total: $n + 2(n-1) = 3n - 2$. For $n = 10^6$: $\\approx 3 \\times 10^6$ non-zeros vs $10^{12}$ in dense format.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-005-5',
      type: 'choice',
      text: 'The purpose of matrix reordering (AMD, METIS) before sparse factorization is to:',
      options: ['Make the matrix symmetric', 'Reduce fill-in in the $L$ and $U$ factors', 'Speed up the matrix-vector product', 'Improve the condition number'],
      answer: 'Reduce fill-in in the $L$ and $U$ factors',
      hints: ['Different row/column orderings produce different fill-in patterns. AMD (Approximate Minimum Degree) and METIS find orderings that minimize fill. This reduces both memory and flops for the factorization — critical for large 3D problems.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-005-6',
      type: 'choice',
      text: 'The `row_ptr` array in CSR format has length:',
      options: ['$nnz$', '$n$', '$n+1$', '$2 \\cdot nnz$'],
      answer: '$n+1$',
      hints: ['`row_ptr` has one entry per row plus a sentinel at the end. `row_ptr[i]` = index in `values` where row $i$ starts; `row_ptr[n]` = total $nnz$. This allows $O(1)$ access to each row.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-005-7',
      type: 'choice',
      text: 'For the 2D Poisson equation on an $n \\times n$ grid (total $N = n^2$ unknowns), the stiffness matrix has approximately how many non-zeros?',
      options: ['$O(N)$', '$O(N \\log N)$', '$O(N^{4/3})$', '$O(N^2)$'],
      answer: '$O(N)$',
      hints: ['Each of the $N = n^2$ grid points connects to at most 4 neighbors. So $nnz \\leq 5N = O(N)$. This is the key property that makes 2D PDE problems tractable with sparse methods even for $N = 10^6$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-005-8',
      type: 'choice',
      text: 'Which format is easiest for constructing a sparse matrix entry-by-entry?',
      options: ['CSR', 'CSC', 'COO (coordinate format)', 'Dense'],
      answer: 'COO (coordinate format)',
      hints: ['COO stores $(i, j, v)$ triples and can be built incrementally — just append new entries. CSR and CSC require knowing the final sparsity pattern in advance (or converting from COO). The typical workflow: build in COO, convert to CSR for computation.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-005-9',
      type: 'choice',
      text: 'The Google PageRank matrix for the web (billions of nodes, average ~40 links per page) is:',
      options: ['Dense but large', 'Sparse with density $\\approx 40/n$', 'A diagonal matrix', 'A symmetric matrix'],
      answer: 'Sparse with density $\\approx 40/n$',
      hints: ['If $n = 10^{10}$ pages and each has ~40 links, $nnz \\approx 40n$ and density $= nnz/n^2 = 40/n \\approx 4 \\times 10^{-9}$ — about $10^{-7}$% non-zero. Storing or operating on this matrix requires sparse methods.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-005-10',
      type: 'choice',
      text: 'Sparse LU factorization of a 3D finite element problem with $N$ unknowns requires approximately:',
      options: ['$O(N)$ storage', '$O(N^{4/3})$ storage', '$O(N^2)$ storage', '$O(N^{1/3})$ storage'],
      answer: '$O(N^{4/3})$ storage',
      hints: ['3D problems are much harder than 2D: even with optimal reordering, fill-in grows as $O(N^{4/3})$ for 3D and $O(N \\log N)$ for 2D. This is why large 3D problems require iterative (not direct) sparse solvers despite good reordering.'],
      reviewSection: 'rigor',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Write out the CSR representation of a small sparse matrix by hand. State the storage savings over dense format for a given $n$ and $nnz$. Explain what fill-in is and why reordering matters.',
    explainVerbally: 'Explain why sparse matrix-vector multiplication is $O(nnz)$ and why this makes iterative solvers feasible for large problems that would be impossible with dense methods.',
    detectIncorrectApplication: 'Recognize when a student applies a dense algorithm (e.g., Gaussian elimination without reordering) to a sparse matrix and explain why the resulting fill-in destroys the sparsity advantage.',
    transferToUnfamiliar: 'Given a new graph-structured problem (e.g., social network analysis, circuit simulation), identify the corresponding sparse matrix structure and estimate the storage and computation costs.',
  },

  misconceptions: [
    {
      falseBelief: 'Sparse matrices are just dense matrices with many zeros — any dense algorithm works fine.',
      whyStudentsThinkIt: 'Students think of "sparse" as an adjective describing appearance, not a fundamentally different storage and algorithmic paradigm.',
      correctionExample: 'Applying dense Gaussian elimination to an $n \\times n$ sparse matrix uses $O(n^3)$ flops and $O(n^2)$ storage regardless of sparsity. Sparse LU (with reordering) uses $O(nnz^{1.5})$ or less. For $n = 10^6$ with $nnz = 5 \\times 10^6$: dense requires $10^{18}$ flops (thousands of years), sparse requires $\\sim 10^{10}$ (minutes).',
      contrastCase: 'A sparse algorithm exploits the zero structure by skipping zeros entirely. The sparsity must be tracked explicitly via CSR or similar storage — you cannot just set entries to zero in a dense matrix and call it sparse.',
    },
    {
      falseBelief: 'LU factorization of a sparse matrix produces sparse $L$ and $U$ factors.',
      whyStudentsThinkIt: 'Students assume sparsity is preserved through factorization.',
      correctionExample: 'The arrowhead matrix $A$ (full first row/column, diagonal elsewhere) produces completely dense $L$ and $U$ without reordering. With the reversed arrowhead ordering, $L$ and $U$ remain sparse. Sparsity of the factors depends critically on the elimination ordering.',
      contrastCase: 'Only for special structures (tridiagonal, banded) is fill-in provably zero or minimal. General sparse matrices require reordering algorithms to control fill.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A finite element simulation of heat conduction in a 3D solid has 500,000 nodes. Each node connects to ~10 neighbors. You need to solve the linear system at each time step.',
      competingTechniques: 'Dense LU, sparse direct solver with reordering, or iterative solver (CG with ILU preconditioner).',
      whyThisTechniqueWins: 'Dense LU: $500000^3$ flops — impossible. Sparse direct with METIS reordering: $O(N^{4/3}) \\approx 10^{10}$ flops — feasible for a single solve. Iterative CG: $O(N \\cdot \\text{iterations})$ — best for many time steps. The choice depends on whether the matrix changes each step.',
    },
    {
      situation: 'You are building a recommendation system and need to compute the top-10 similar users for each of 1 million users based on a sparse user-item interaction matrix.',
      competingTechniques: 'Dense matrix multiplication, sparse matrix operations, or approximate nearest-neighbor search.',
      whyThisTechniqueWins: 'The user-item matrix has $\\sim 10^8$ non-zeros out of $10^{12}$ possible entries ($10^{-2}$% dense). Computing the full similarity matrix densely requires $10^{12}$ entries and $10^{18}$ flops. Sparse matvec with the interaction matrix enables efficient approximate similarity computation in $O(nnz)$ per query.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'nnz(A)', meaning: 'Number of non-zero entries in $A$ — the fundamental measure of sparsity; determines storage and matvec cost $O(nnz)$.' },
      { symbol: '\\text{CSR triple}', meaning: 'values[], col_idx[], row_ptr[] — compressed sparse row storage; total memory $O(nnz + n)$ vs $O(n^2)$ dense.' },
      { symbol: '\\text{fill-in}', meaning: 'Zero entries of $A$ that become non-zero in $L$ or $U$ during factorization; controlled by reordering before factoring.' },
      { symbol: 'P^\\top AP', meaning: 'Symmetrically permuted matrix — same eigenvalues and solution as $A$, but AMD/nested dissection ordering minimizes fill in the factors.' },
      { symbol: '\\mathcal{K}_k(A,\\mathbf{r}_0)', meaning: 'Krylov subspace of order $k$ — the search space that CG minimizes $\\|\\mathbf{e}\\|_A$ over at iteration $k$; each step costs one sparse matvec.' },
      { symbol: '\\sqrt{\\kappa(A)}', meaning: 'Square root of the condition number governs CG iteration count: roughly $\\sqrt{\\kappa}$ iterations to reduce error by $1/e$ — precondition to reduce $\\kappa$.' },
    ],
    rulesOfThumb: [
      'If density $= nnz/n^2 < 1\\%$ and $n > 10^4$, sparse storage and algorithms are mandatory — dense methods exhaust memory or time.',
      'Always reorder before sparse direct factorization: AMD for symmetric matrices, METIS/nested dissection for 2D/3D meshes. Skipping reordering can increase fill-in by 100×.',
      'Build matrices in COO format (append $(i,j,v)$ triples freely), then convert to CSR for computation — most libraries provide this one-line conversion.',
      'For 3D problems ($N$ unknowns), direct solvers cost $O(N^{4/3})$ storage and $O(N^2)$ flops; preconditioned iterative solvers cost $O(N \\cdot \\sqrt{\\kappa})$ — iterative wins for large $N$.',
      'Precondition before CG/GMRES: incomplete Cholesky IC(0) is cheap to compute and often halves the iteration count by reducing the effective condition number.',
    ],
  },

  spiral: {
    recoveryPoints: ['la7-004', 'la5-002'],
    futureLinks: ['la7-006', 'la8-002'],
  },

  debugging: [
    {
      commonError: 'Building a sparse matrix in CSR format and getting wrong matrix-vector products because `row_ptr` is off-by-one.',
      symptom: 'The first or last row of $A\\mathbf{x}$ is wrong; all other rows may be correct.',
      whyItHappened: '`row_ptr` must have length $n+1$: `row_ptr[0] = 0` and `row_ptr[n] = nnz`. A common error is missing the final sentinel `row_ptr[n] = nnz`, causing the last row to not be processed.',
      repairStrategy: 'Always check `len(row_ptr) == n + 1` and `row_ptr[-1] == nnz`. Print the CSR arrays for a small test matrix and verify each row manually.',
    },
    {
      commonError: 'Applying dense LU to a sparse matrix and running out of memory or time.',
      symptom: 'The program uses far more RAM than expected or runs for hours on a problem that should take minutes.',
      whyItHappened: 'Dense LU allocates $O(n^2)$ memory and does $O(n^3)$ work regardless of sparsity. For $n = 10^5$: $80$ GB and $10^{15}$ flops.',
      repairStrategy: 'Use a sparse solver: `scipy.sparse.linalg.spsolve` in Python or `A\\b` with a sparse `A` in MATLAB. Always reorder with AMD/METIS before factoring. Check sparsity first: if density $> 10\\%$, dense methods may be competitive.',
    },
  ],
};
