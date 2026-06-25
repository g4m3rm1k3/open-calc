import outerProductUrl from '../diagrams/la-outer-product-grid.svg?url';
import kroneckerBlockUrl from '../diagrams/la-kronecker-block-structure.svg?url';

export default {
  id: 'la10-002',
  slug: 'tensor-products',
  chapter: 'la10',
  order: 2,
  title: 'Tensor Products',
  subtitle: 'The tensor product $V \\otimes W$ is the "universal" space for bilinear maps from $V \\times W$. In coordinates, it captures all outer products. The Kronecker product is the matrix incarnation.',
  tags: ['tensor product', 'Kronecker product', 'bilinear map', 'universal property', 'outer product', 'multilinear algebra', 'tensor decomposition'],
  aliases: 'tensor product Kronecker product bilinear map universal property outer product multilinear algebra tensor decomposition rank-1 matrix',

  hook: {
    question: "A $2 \\times 3$ matrix has 6 entries. Can you think of it as a vector in a 6-dimensional space? And what is the right algebraic structure that makes this work for maps from $\\mathbb{R}^2 \\times \\mathbb{R}^3$ to $\\mathbb{R}$?",
    realWorldContext: "Tensor products are the mathematical foundation of modern machine learning. Neural network weight matrices are tensors; the attention mechanism in Transformers is a tensor operation. In quantum computing, a system of $n$ qubits lives in $\\mathbb{C}^2 \\otimes \\mathbb{C}^2 \\otimes \\cdots \\otimes \\mathbb{C}^2$ ($2^n$ dimensions). Tensor decompositions (Tucker, CP/PARAFAC) are used in signal processing, chemometrics, and recommender systems. The Kronecker product appears in solving Lyapunov equations, vectorization tricks, and GPU-efficient matrix computations.",
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Where you are in the story: the dual space gave you a new perspective on row vectors — they are linear functionals, not just transposes of column vectors. Now push further: what if you want a function that takes two vectors and produces a scalar, and is linear in each argument separately? This is a **bilinear map**, and it appears everywhere: the inner product is bilinear, the determinant of a 2×2 matrix is bilinear in its rows, the stress tensor in mechanics maps two vectors (a surface normal and a force direction) to a scalar. Tensor products are the algebraic structure that tames bilinear maps.',
      'Start with the simplest example. Take $\\mathbf{u} = (2,1) \\in \\mathbb{R}^2$ and $\\mathbf{v} = (3,4) \\in \\mathbb{R}^2$. Their **outer product** is $\\mathbf{u}\\mathbf{v}^\\top = \\begin{pmatrix}6&8\\\\3&4\\end{pmatrix}$ — a $2 \\times 2$ matrix. This matrix is the tensor $\\mathbf{u} \\otimes \\mathbf{v}$: an "elementary tensor" or "rank-1 tensor." Given any bilinear function $B: \\mathbb{R}^2 \\times \\mathbb{R}^2 \\to \\mathbb{R}$, we can evaluate it as a linear function of the outer product matrix: $B(\\mathbf{u},\\mathbf{v}) = \\sum_{i,j} w_{ij} u_i v_j = \\text{tr}(W^\\top (\\mathbf{u}\\mathbf{v}^\\top))$ for some weight matrix $W$. The outer product is the "universal" way to store the information from a pair of vectors that a bilinear map needs.',
      ] },
      { type: 'image', src: outerProductUrl,
        alt: 'A grid showing the outer product of u=(2,1) and v=(3,4): column u on the left, row v on top, and the resulting 2x2 matrix with entries 6, 8, 3, 4',
        caption: 'Every entry of u ⊗ v is just one product uᵢvⱼ — the whole grid is the elementary tensor.' },
      { type: 'prose', paragraphs: [
      'The tensor product space $V \\otimes W$ is the vector space spanned by all elementary tensors $\\mathbf{v} \\otimes \\mathbf{w}$ (for $\\mathbf{v} \\in V$, $\\mathbf{w} \\in W$), subject to the bilinearity rules: $(\\alpha \\mathbf{v}) \\otimes \\mathbf{w} = \\alpha(\\mathbf{v} \\otimes \\mathbf{w}) = \\mathbf{v} \\otimes (\\alpha \\mathbf{w})$ and $(\\mathbf{v}_1 + \\mathbf{v}_2) \\otimes \\mathbf{w} = \\mathbf{v}_1 \\otimes \\mathbf{w} + \\mathbf{v}_2 \\otimes \\mathbf{w}$. A basis for $V \\otimes W$ is $\\{\\mathbf{e}_i \\otimes \\mathbf{f}_j\\}$ where $\\{\\mathbf{e}_i\\}$ and $\\{\\mathbf{f}_j\\}$ are bases of $V$ and $W$. Counting: $\\dim(V \\otimes W) = (\\dim V)(\\dim W)$. For $\\mathbb{R}^2 \\otimes \\mathbb{R}^3$: dimension 6, exactly matching the 6 entries of a $2 \\times 3$ matrix.',
      'The key theorem: the tensor product has the **universal property** for bilinear maps. For any bilinear map $B: V \\times W \\to U$, there is a unique linear map $\\tilde{B}: V \\otimes W \\to U$ such that $B(\\mathbf{v}, \\mathbf{w}) = \\tilde{B}(\\mathbf{v} \\otimes \\mathbf{w})$. In pictures: $V \\times W \\xrightarrow{\\otimes} V \\otimes W \\xrightarrow{\\tilde{B}} U$. This is profound: any bilinear problem can be converted into a linear problem on a (higher-dimensional) space. Bilinearity is "compiled away" by the tensor product.',
      '**Predict before reading on:** Let $A = \\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$ and $B = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$. The Kronecker product $A \\otimes B$ is the matrix representation of the tensor product. What is its size? What does the $(1,1)$ block look like? Is $A \\otimes B$ itself a rank-1 matrix (an elementary tensor)? Make all three predictions before continuing.',
      'The Kronecker product $A \\otimes B$ is a $4 \\times 4$ matrix (since $2 \\cdot 2 \\times 2 \\cdot 2$): it replaces each entry $a_{ij}$ of $A$ with the block $a_{ij}B$. So the $(1,1)$ block is $a_{11}B = 1 \\cdot B = B = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$. Is $A \\otimes B$ rank-1? No: $A \\otimes B$ has rank $= \\text{rank}(A) \\cdot \\text{rank}(B) = 2 \\cdot 1 = 2$ (using the Kronecker product rank identity). Only elementary tensors $\\mathbf{u} \\otimes \\mathbf{v}$ — i.e., outer products — are rank-1.',
      ] },
      { type: 'image', src: kroneckerBlockUrl,
        alt: 'A 4x4 grid divided into four 2x2 blocks, each block a scaled copy of matrix B (1B, 2B, 3B, 4B), illustrating the Kronecker product of A and B',
        caption: 'A⊗B replaces every entry of A with a scaled whole copy of B — the block (1,1) is literally 1·B, shown with its actual entries.' },
      { type: 'prose', paragraphs: [
      'The most useful computational identity involving the Kronecker product is the **vectorization trick**: $\\text{vec}(AXB) = (B^\\top \\otimes A)\\,\\text{vec}(X)$, where $\\text{vec}(X)$ stacks the columns of $X$ into a single vector. This converts a matrix equation into a standard linear system. For example, the Sylvester equation $AX + XB = C$ (which appears in control theory, eigenvalue problems, and covariance propagation) becomes $(I \\otimes A + B^\\top \\otimes I)\\,\\text{vec}(X) = \\text{vec}(C)$ — a single linear system of size $mn \\times mn$ where $X \\in \\mathbb{R}^{m \\times n}$.',
      'In modern machine learning, tensors are everywhere. The weight tensor of a convolutional layer maps an input feature map tensor to an output feature map tensor; the attention matrix in a Transformer is a bilinear form evaluated on query and key tensors; a system of $n$ qubits in quantum computing lives in $\\mathbb{C}^2 \\otimes \\mathbb{C}^2 \\otimes \\cdots \\otimes \\mathbb{C}^2$ ($2^n$ dimensions). When you call `torch.einsum` or `np.tensordot`, you are performing tensor contractions — compositions of tensor products and traces — on structured multilinear objects.',
      'Where this is heading: tensor products extend to higher order by taking more copies — $V \\otimes V \\otimes V^*$ is a (2,1)-tensor, which is exactly what a connection coefficient in differential geometry is. The next lesson introduces exterior algebra, which takes tensor products and imposes antisymmetry: $\\mathbf{v} \\wedge \\mathbf{w} = -\\mathbf{w} \\wedge \\mathbf{v}$. This antisymmetry is what makes determinants, volumes, and differential forms work.',
      ] },
      { type: 'viz', id: 'PythonNotebook',
        title: 'Tensor Products in Python',
        mathBridge: 'Build Kronecker products, verify the vec identity, and solve a Sylvester equation via vectorization.',
        caption: 'vec(AXB) = (B^T ⊗ A) vec(X) converts any matrix equation into a standard linear system.',
        initialProps: {
          initialCells: [
            {
              id: 1,

              cellTitle: 'Kronecker product and rank identity',
              prose: [
                'Build Kronecker products, verify that rank(A⊗B) = rank(A)*rank(B), and confirm the block structure by inspection.',
                '`np.kron(A, B)` computes the Kronecker product. For 2×2 A and 3×3 B, the result is 6×6. Block structure: `kron(A, B)[i*3:(i+1)*3, j*3:(j+1)*3] == A[i,j]*B`. Verify rank: `np.linalg.matrix_rank(np.kron(A,B)) == np.linalg.matrix_rank(A)*np.linalg.matrix_rank(B)`.',
                'The eigenvalue property: `np.kron(A,B)` has eigenvalues `lambda_i * mu_j` where lambda_i are eigenvalues of A and mu_j are eigenvalues of B. Verify: `sorted(np.linalg.eigvals(np.kron(A,B)).real)` equals `sorted([la*mu for la in eigvals_A for mu in eigvals_B])`. This is why Kronecker products appear in quantum mechanics (product states) and in 2D finite-element problems.',
              ],
              code: `import numpy as np

A = np.array([[1, 2], [3, 4]], dtype=float)
B = np.array([[0, 1], [1, 0]], dtype=float)

K = np.kron(A, B)
print("A:")
print(A)
print("\\nB:")
print(B)
print("\\nA ⊗ B (Kronecker product):")
print(K)
print(f"\\nSize: {K.shape}  (expected {A.shape[0]*B.shape[0]} x {A.shape[1]*B.shape[1]})")

# Verify rank identity: rank(A⊗B) = rank(A) * rank(B)
print(f"\\nrank(A) = {np.linalg.matrix_rank(A)}")
print(f"rank(B) = {np.linalg.matrix_rank(B)}")
print(f"rank(A⊗B) = {np.linalg.matrix_rank(K)}")
print(f"rank(A)*rank(B) = {np.linalg.matrix_rank(A)*np.linalg.matrix_rank(B)}")

# Verify eigenvalue identity: eigs(A⊗B) = all products eig_A[i] * eig_B[j]
eA = np.linalg.eigvals(A)
eB = np.linalg.eigvals(B)
eK_expected = np.array([a*b for a in eA for b in eB])
eK_actual = np.linalg.eigvals(K)
print(f"\\nEigenvalues of A⊗B (actual, sorted):  {np.sort(np.real(eK_actual)).round(3)}")
print(f"All products eig(A)*eig(B) (sorted):   {np.sort(np.real(eK_expected)).round(3)}")
`,
            },
            {
              id: 2,

              cellTitle: 'Vectorization identity and Sylvester equation',
              prose: [
                'Verify vec(AXB) = (B^T ⊗ A) vec(X), then use it to solve a Sylvester equation AX + XB = C by converting to a standard linear system.',
                'The vec operator stacks columns: `vec(X) = X.flatten(order="F")` (Fortran order = column-major). Verify: `np.kron(B.T, A) @ X.flatten("F")` should equal `(A @ X @ B).flatten("F")`. The identity vec(AXB) = (B^T ⊗ A) vec(X) transforms the matrix equation AXB=C into the linear system `(B^T⊗A) vec(X) = vec(C)`.',
                'Sylvester equation AX + XB = C: rewrite as `(I⊗A + B^T⊗I) vec(X) = vec(C)`. Solve: `M = np.kron(np.eye(n), A) + np.kron(B.T, np.eye(m)); x_vec = np.linalg.solve(M, C.flatten("F")); X = x_vec.reshape(C.shape, order="F")`. Verify: `np.allclose(A @ X + X @ B, C)`. Compare to `scipy.linalg.solve_sylvester(A, B, C)` — same answer.',
              ],
              code: `import numpy as np

# Verify vec identity: vec(AXB) = (B^T ⊗ A) vec(X)
A = np.array([[1, 2], [0, 3]], dtype=float)
X = np.array([[1, -1, 0], [2, 1, -1]], dtype=float)
B = np.array([[1, 0, 1], [0, 2, 0], [1, 0, 1]], dtype=float)

AXB = A @ X @ B
vec_AXB_direct = AXB.flatten('F')  # column-major (Fortran order) = stack columns

# Via Kronecker product: (B^T ⊗ A) vec(X)
vec_X = X.flatten('F')
K = np.kron(B.T, A)
vec_AXB_kron = K @ vec_X

print("vec(AXB) direct:")
print(vec_AXB_direct.round(4))
print("\\n(B^T ⊗ A) vec(X):")
print(vec_AXB_kron.round(4))
print(f"\\nIdentity verified: {np.allclose(vec_AXB_direct, vec_AXB_kron)}")

# Solve Sylvester equation AX + XB = C using vectorization
# Convert to: (I⊗A + B^T⊗I) vec(X) = vec(C)
print("\\n--- Sylvester equation AX + XB = C ---")
A_s = np.array([[4, 1], [0, 3]], dtype=float)
B_s = np.array([[2, 0], [1, 5]], dtype=float)
C_s = np.array([[1, 2], [3, 4]], dtype=float)

m, n = A_s.shape[0], B_s.shape[0]
M = np.kron(np.eye(n), A_s) + np.kron(B_s.T, np.eye(m))
vec_C = C_s.flatten('F')
vec_X = np.linalg.solve(M, vec_C)
X_sol = vec_X.reshape((m, n), order='F')

print("Solution X:")
print(X_sol.round(4))
print("\\nVerification: AX + XB =")
print((A_s @ X_sol + X_sol @ B_s).round(4))
print("C =")
print(C_s)
`,
            },
          ],
        },
      },
      { type: 'viz', id: 'OpenMatNotebook',
        title: 'Kronecker Products',
        mathBridge: 'Compute Kronecker products and use the vec identity.',
        caption: 'Kronecker product encodes tensor products of matrices.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Kronecker product basics',
              prose: [
                'Compute the Kronecker product and verify its key properties.',
                '`C = kron(A,B)` in MATLAB. Block structure: `C(1:3,1:3) == A(1,1)*B`, `C(1:3,4:6) == A(1,2)*B`, etc. Rank: `rank(kron(A,B)) == rank(A)*rank(B)`. Eigenvalues: `sort(eig(kron(A,B)))` should equal `sort([la*mu for la in eig(A) for mu in eig(B)])`.',
                'Mixed product property: `kron(A,B)*kron(C,D) == kron(A*C, B*D)`. Verify: `norm(kron(A,B)*kron(C,D) - kron(A*C, B*D))` near zero. This property is why Kronecker products solve 2D PDE discretisations efficiently: the 2D Laplacian is `kron(I,T) + kron(T,I)` where T is the 1D Laplacian.',
              ],
              code: `% Kronecker product
A = [1 2; 3 4]
B = [0 1; 1 0]

% A ⊗ B
K = kron(A, B)
disp('A ⊗ B:')
K
disp('Size: ')
size(K)

% Key property: (A⊗B)(C⊗D) = AC⊗BD
C = [2 0; 1 3]
D = [1 1; 0 1]
lhs = kron(A,B) * kron(C,D)
rhs = kron(A*C, B*D)
disp('(A⊗B)(C⊗D) = AC⊗BD check:')
norm(lhs - rhs)  % should be 0

% Inverse: (A⊗B)^{-1} = A^{-1}⊗B^{-1}
K_inv = inv(kron(A,B))
K_inv_direct = kron(inv(A), inv(B))
disp('Inverse property check:')
norm(K_inv - K_inv_direct)
`,
            },
            {
              id: 2,
              cellTitle: 'Sylvester equation via vec',
              prose: [
                'Solve AX + XB = C using the Kronecker product and vec identity.',
                'Vec operator: `vec(X) = X(:)` (stacks columns). The identity `vec(AXB) = kron(B\',A)*vec(X)`. Sylvester equation: `A*X + X*B = C` becomes `(kron(I_n,A) + kron(B\',I_m)) * vec(X) = vec(C)`. Solve: `M = kron(eye(n),A) + kron(B\',eye(m)); x_vec = M\\C(:); X = reshape(x_vec, size(C))`.',
                'Verify: `norm(A*X + X*B - C)` should be near zero. Also compare to MATLAB\'s `sylvester(A,B,C)` — same answer, but `sylvester` uses the Schur decomposition (O(n³)) rather than solving the n²×n² Kronecker system (O(n⁶)) — much faster. The Kronecker approach is educational and works for small n, but production code uses Schur-based solvers.',
              ],
              code: `% Solve Sylvester equation AX + XB = C
% Using: vec(AXI + IXB) = (I⊗A + B^T⊗I) vec(X) = vec(C)
A = [2 1; 0 3]
B = [1 0; 2 4]
C = [1 0; 0 1]

n = 2
% Build the Kronecker system
M = kron(eye(n), A) + kron(B', eye(n))
disp('Kronecker system matrix M:')
M

% Solve via vec
rhs = reshape(C, [], 1)  % = vec(C)
x_vec = M \ rhs
X = reshape(x_vec, n, n)
disp('Solution X:')
X

% Verify: AX + XB = C ?
residual = A*X + X*B - C
disp('Residual (should be 0):')
residual
`,
            },
          ],
        },
      },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'How to Use Tensor Products and the Kronecker Product (4 Steps)',
        body: '1. **Identify the bilinear map.** Confirm your map $B: V \\times W \\to U$ is linear in each argument separately. Determine $\\dim V$ and $\\dim W$ — the resulting tensor space has dimension $(\\dim V)(\\dim W)$.\n2. **Build the basis.** Use $\\{\\mathbf{e}_i \\otimes \\mathbf{f}_j\\}$ as the canonical basis for $V \\otimes W$. Any element is a sum of elementary tensors $\\sum_{ij} c_{ij}\\, \\mathbf{e}_i \\otimes \\mathbf{f}_j$ — in matrix coordinates, the coefficient matrix $[c_{ij}]$.\n3. **Compute the Kronecker product.** $A \\otimes B$: replace each scalar entry $a_{ij}$ by the block $a_{ij}B$. Result size: $(m_A m_B) \\times (n_A n_B)$. Properties: $(A \\otimes B)(C \\otimes D) = AC \\otimes BD$; $(A \\otimes B)^{-1} = A^{-1} \\otimes B^{-1}$ (when invertible); eigenvalues are all products $\\lambda_i(A)\\lambda_j(B)$.\n4. **Apply the vec identity.** To solve $AXB = C$ or $AX + XB = C$: vectorize using $\\text{vec}(AXB) = (B^\\top \\otimes A)\\,\\text{vec}(X)$. The Sylvester equation $AX + XB = C$ becomes $(I \\otimes A + B^\\top \\otimes I)\\,\\text{vec}(X) = \\text{vec}(C)$ — a standard linear system of size $mn \\times mn$.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 2 of 5 — Advanced Theory',
        body: '**Previous (Lesson 1):** Dual Spaces — linear functionals, dual basis, row vectors as covectors, transpose as dual map.\n**This lesson:** Tensor Products — bilinear maps, universal property, matrices as rank-1 tensors, Kronecker product, vectorization identity.\n**Next (Lesson 3):** Exterior Algebra — antisymmetric tensors, wedge product, determinants as volume forms, differential forms.',
      },
      {
        type: 'theorem',
        title: 'Universal Property of Tensor Products',
        body: 'For any bilinear map $B: V \\times W \\to U$, there exists a unique linear map $\\tilde{B}: V \\otimes W \\to U$ such that $B(\\mathbf{v}, \\mathbf{w}) = \\tilde{B}(\\mathbf{v} \\otimes \\mathbf{w})$:\n\n$V \\times W \\xrightarrow{\\otimes} V \\otimes W \\xrightarrow{\\tilde{B}} U$\n\n$B = \\tilde{B} \\circ \\otimes$\n\nThis "linearizes" bilinear maps — any bilinear problem can be reduced to a linear one on a larger space.',
      },
      {
        type: 'insight',
        title: 'Vectorization and Kronecker Products',
        body: 'The vectorization $\\text{vec}(X)$ stacks columns of $X$ into a vector.\n\nKey identity: $\\text{vec}(AXB) = (B^\\top \\otimes A)\\text{vec}(X)$\n\nApplication: the Sylvester equation $AX + XB = C$ becomes $(I \\otimes A + B^\\top \\otimes I)\\text{vec}(X) = \\text{vec}(C)$ — a linear system!\n\nThis trick converts matrix equations into vector equations solvable by standard linear solvers.',
      },
    ],
  },

  math: {
    prose: [
      '**Tensor rank.** Every element of $V \\otimes W$ is a sum of elementary tensors. The **tensor rank** of $T \\in V \\otimes W$ is the minimum number of elementary tensors needed: $T = \\sum_{i=1}^r \\mathbf{u}_i \\otimes \\mathbf{v}_i$. For matrices ($V = \\mathbb{R}^m$, $W = \\mathbb{R}^n$), tensor rank = matrix rank. For 3-way tensors, computing rank is NP-hard in general.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Tensor Products in Quantum Computing',
        body: 'A qubit state is $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle \\in \\mathbb{C}^2$.\n\nTwo qubits: $\\mathbb{C}^2 \\otimes \\mathbb{C}^2 = \\mathbb{C}^4$, states: $|\\psi_1\\rangle \\otimes |\\psi_2\\rangle$ (product) or entangled (non-product).\n\n$n$ qubits: $\\mathbb{C}^{2^n}$ — exponential state space.\n\nEntangled states are tensors of rank > 1: $|\\Phi^+\\rangle = (|00\\rangle + |11\\rangle)/\\sqrt{2}$ is not $|\\psi_1\\rangle \\otimes |\\psi_2\\rangle$ for any $|\\psi_i\\rangle$.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Symmetric and antisymmetric tensors.** The tensor product is symmetric ($V \\otimes W \\cong W \\otimes V$) but not canonically ordered. The **symmetric algebra** $\\text{Sym}^k V = V^{\\otimes k} / (\\text{swap relations})$ captures multilinear symmetric functions. The **exterior algebra** $\\Lambda^k V$ captures antisymmetric multilinear functions — the wedge product (next lesson). The determinant is an element of $\\Lambda^n \\mathbb{R}^n \\cong \\mathbb{R}$.',
      '**Tensor rank vs matrix rank.** Every element of $V \\otimes W$ is a finite sum of elementary tensors; the **tensor rank** is the minimum number of summands needed. For order-2 tensors (matrices), rank equals matrix rank — the SVD delivers a rank-$r$ decomposition $A = \\sum_{i=1}^r \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top$ with $r$ terms. For order-3+ tensors, rank is NP-hard to compute in general. Moreover, real and complex tensor ranks can differ: a real tensor may require more summands over $\\mathbb{R}$ than over $\\mathbb{C}$. Strassen\'s $2\\times 2$ matrix multiplication tensor has rank 7 (not 8) — this is precisely why Strassen\'s algorithm uses only 7 multiplications instead of 8.',
      '**Spectral properties of Kronecker products.** If $A$ has eigenvalues $\\lambda_i$ with eigenvectors $\\mathbf{u}_i$, and $B$ has eigenvalues $\\mu_j$ with eigenvectors $\\mathbf{v}_j$, then $A \\otimes B$ has eigenvalues $\\lambda_i \\mu_j$ with eigenvectors $\\mathbf{u}_i \\otimes \\mathbf{v}_j$. Proof: $(A \\otimes B)(\\mathbf{u}_i \\otimes \\mathbf{v}_j) = (A\\mathbf{u}_i) \\otimes (B\\mathbf{v}_j) = \\lambda_i \\mathbf{u}_i \\otimes \\mu_j \\mathbf{v}_j = \\lambda_i \\mu_j (\\mathbf{u}_i \\otimes \\mathbf{v}_j)$. This immediately explains when the Sylvester equation $AX - XB = C$ has a unique solution: the system $(I \\otimes A - B^\\top \\otimes I)\\text{vec}(X) = \\text{vec}(C)$ is non-singular iff no eigenvalue of $B^\\top \\otimes I$ equals an eigenvalue of $I \\otimes A$, i.e., $\\lambda_i(A) \\neq \\lambda_j(B)$ for all $i,j$.',
      '**Tensor networks and contraction.** In quantum many-body physics and modern ML, large tensor products are handled via tensor networks: networks of small tensors connected by contractions. A **contraction** sums over a shared index, generalizing matrix multiplication: $C_{ik} = \\sum_j A_{ij} B_{jk}$. The `einsum` notation makes this explicit: `np.einsum(\'ij,jk->ik\', A, B)` is matrix multiplication; `np.einsum(\'ij,kl->ijkl\', A, B)` is the outer product. Efficient contraction order matters: contracting in the wrong sequence can increase cost from $O(n^3)$ to $O(n^4)$ for the same result. This is the "optimal contraction order" problem — NP-hard in general but tractable for tree-structured networks.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Tensor Decompositions',
        body: 'For a 3-way tensor $\\mathcal{T} \\in \\mathbb{R}^{I \\times J \\times K}$:\n\nCP decomposition: $\\mathcal{T} \\approx \\sum_{r=1}^R \\mathbf{a}_r \\otimes \\mathbf{b}_r \\otimes \\mathbf{c}_r$ (rank-$R$ approximation)\nTucker decomposition: $\\mathcal{T} \\approx \\mathcal{G} \\times_1 U \\times_2 V \\times_3 W$ (multilinear SVD)\n\nApplications: topic models (LDA), neuroscience (EEG decomposition), recommender systems, compression of neural network weight tensors.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la10-002-1',
      title: 'Outer product as elementary tensor',
      problem: 'Compute the outer product $M = \\mathbf{u}\\mathbf{v}^\\top$ where $\\mathbf{u}=(2,1)^\\top$ and $\\mathbf{v}=(3,4)^\\top$. Identify it as an elementary tensor and determine its tensor rank.',
      steps: [
        { explanation: 'Outer product: $m_{ij} = u_i v_j$. Compute all entries: $m_{11}=2\\cdot3=6$, $m_{12}=2\\cdot4=8$, $m_{21}=1\\cdot3=3$, $m_{22}=1\\cdot4=4$.' },
        { explanation: 'So $M = \\begin{pmatrix}6&8\\\\3&4\\end{pmatrix}$. This equals $\\mathbf{u} \\otimes \\mathbf{v}$ under the identification $\\mathbb{R}^2 \\otimes \\mathbb{R}^2 \\cong \\mathbb{R}^{2 \\times 2}$.' },
        { explanation: 'Since $M$ is a single outer product, it is an elementary tensor. Therefore tensor rank = 1.' },
        { explanation: 'Verify: matrix rank of $M$ is also 1 — the second row $(3,4)$ is $\\frac{1}{2}$ times the first row $(6,8)$. Rank = 1 confirms it is an elementary tensor.' },
      ],
    },
    {
      id: 'ex-la10-002-2',
      title: 'Kronecker product by hand',
      problem: 'Compute $A \\otimes B$ where $A = \\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$ and $B = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$. Verify the mixed-product property $(A \\otimes B)(C \\otimes D) = AC \\otimes BD$ for $C = I_2$, $D = I_2$.',
      steps: [
        { explanation: 'Kronecker product rule: $A \\otimes B$ has block structure where the $(i,j)$ block is $a_{ij} B$. Size: 4×4.' },
        { explanation: '$A \\otimes B = \\begin{pmatrix}a_{11}B & a_{12}B \\\\ a_{21}B & a_{22}B\\end{pmatrix} = \\begin{pmatrix}0&1&0&2\\\\1&0&2&0\\\\0&3&0&4\\\\3&0&4&0\\end{pmatrix}$' },
        { explanation: 'Mixed-product with $C=D=I_2$: $(A \\otimes B)(I \\otimes I) = AI \\otimes BI = A \\otimes B$ ✓. This confirms $(A \\otimes B)(I \\otimes I) = A \\otimes B$.' },
        { explanation: 'Also verify inverse: since $\\det A = -2 \\neq 0$ and $\\det B = -1 \\neq 0$, we have $(A \\otimes B)^{-1} = A^{-1} \\otimes B^{-1}$. Both factors are invertible, so the Kronecker product is invertible.' },
      ],
    },
    {
      id: 'ex-la10-002-3',
      title: 'Vec-Kronecker trick for the Sylvester equation',
      problem: 'Solve $AX + XB = C$ where $A = \\begin{pmatrix}2&0\\\\0&3\\end{pmatrix}$, $B = \\begin{pmatrix}1&0\\\\0&4\\end{pmatrix}$, $C = \\begin{pmatrix}3&7\\\\5&14\\end{pmatrix}$.',
      steps: [
        { explanation: 'Apply vec-Kronecker: $\\text{vec}(AX) = (I \\otimes A)\\text{vec}(X)$ and $\\text{vec}(XB) = (B^\\top \\otimes I)\\text{vec}(X)$. So the equation becomes $(I \\otimes A + B^\\top \\otimes I)\\text{vec}(X) = \\text{vec}(C)$.' },
        { explanation: 'Since $A$ and $B$ are diagonal: $A=\\text{diag}(2,3)$, $B=\\text{diag}(1,4)$. The system $(I \\otimes A + B \\otimes I)\\text{vec}(X) = \\text{vec}(C)$ is diagonal with entries $a_{ii}+b_{jj}$ for each $(i,j)$.' },
        { explanation: 'Diagonal entries: $(2+1, 2+4, 3+1, 3+4) = (3, 6, 4, 7)$. So $x_{11}=3/3=1$, $x_{12}=7/6$ (from $\\text{vec}(C)=(3,5,7,14)^\\top$... wait — vec stacks columns). $\\text{vec}(C) = (3,5,7,14)^\\top$ (column-major).' },
        { explanation: 'Diagonal system: $3x_{11}=3 \\Rightarrow x_{11}=1$; $4x_{21}=5 \\Rightarrow x_{21}=5/4$; $6x_{12}=7 \\Rightarrow x_{12}=7/6$; $7x_{22}=14 \\Rightarrow x_{22}=2$. So $X = \\begin{pmatrix}1&7/6\\\\5/4&2\\end{pmatrix}$. Verify: $AX+XB = \\begin{pmatrix}2&7/3\\\\15/4&6\\end{pmatrix}+\\begin{pmatrix}1&14/6\\\\5/4&8\\end{pmatrix}$ — check $(1,1)$: $2+1=3$ ✓, $(2,2)$: $6+8=14$ ✓.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la10-002-1',
      title: 'Not every matrix is an elementary tensor',
      difficulty: 'medium',
      problem: 'Show that $I_2 \\in \\mathbb{R}^{2 \\times 2}$ cannot be written as a single outer product $\\mathbf{u}\\mathbf{v}^\\top$. Find the minimum number of elementary tensors needed and give an explicit decomposition.',
      walkthrough: [
        {
          expression: '\\mathbf{u}\\mathbf{v}^\\top \\text{ has rank 1 for any nonzero } \\mathbf{u}, \\mathbf{v}',
          annotation: 'An outer product $\\mathbf{u}\\mathbf{v}^\\top$ has all rows proportional to $\\mathbf{v}^\\top$: row $i$ is $u_i \\mathbf{v}^\\top$. So the row space is one-dimensional — rank 1. Equivalently, $\\det(\\mathbf{u}\\mathbf{v}^\\top) = 0$ (by Sylvester\'s determinant identity or direct computation).',
        },
        {
          expression: '\\text{rank}(I_2) = 2 \\quad (\\det I_2 = 1 \\neq 0)',
          annotation: 'The identity matrix $I_2$ has rank 2: its two rows $(1,0)$ and $(0,1)$ are linearly independent. Since rank $= 2 > 1$, it cannot be a single outer product.',
        },
        {
          expression: 'I_2 = \\mathbf{e}_1 \\mathbf{e}_1^\\top + \\mathbf{e}_2 \\mathbf{e}_2^\\top = \\begin{pmatrix}1\\\\0\\end{pmatrix}\\begin{pmatrix}1&0\\end{pmatrix} + \\begin{pmatrix}0\\\\1\\end{pmatrix}\\begin{pmatrix}0&1\\end{pmatrix}',
          annotation: 'This is the spectral decomposition of $I_2$: each term $\\mathbf{e}_i \\mathbf{e}_i^\\top$ is a rank-1 projection. Two elementary tensors are needed — matching the rank.',
        },
        {
          expression: '\\text{Minimum outer products} = \\text{rank}(M) \\quad \\text{for any matrix } M',
          annotation: 'The tensor rank of a matrix equals its matrix rank. The SVD $M = \\sum_{i=1}^r \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top$ gives an explicit rank-$r$ decomposition into $r$ elementary tensors. This is the best possible.',
        },
      ],
    },
    {
      id: 'ch-la10-002-2',
      title: 'Kronecker product eigenvalues by hand',
      difficulty: 'easy',
      problem: 'Let $A = \\begin{pmatrix}2&0\\\\0&3\\end{pmatrix}$ and $B = \\begin{pmatrix}1&0\\\\0&4\\end{pmatrix}$. List all eigenvalues of $A \\otimes B$ and give the corresponding eigenvectors (as elementary tensors).',
      walkthrough: [
        {
          expression: '\\lambda(A) = \\{2, 3\\} \\text{ with eigenvectors } \\mathbf{e}_1, \\mathbf{e}_2; \\quad \\mu(B) = \\{1, 4\\} \\text{ with eigenvectors } \\mathbf{e}_1, \\mathbf{e}_2',
          annotation: 'Both $A$ and $B$ are diagonal, so their eigenvalues are the diagonal entries and their eigenvectors are the standard basis vectors.',
        },
        {
          expression: '\\lambda(A \\otimes B) = \\{\\lambda_i \\mu_j\\} = \\{2\\cdot1, 2\\cdot4, 3\\cdot1, 3\\cdot4\\} = \\{2, 8, 3, 12\\}',
          annotation: 'Eigenvalues of $A \\otimes B$ are all pairwise products of eigenvalues of $A$ and $B$. For diagonal matrices this is immediate from the block structure.',
        },
        {
          expression: '\\mathbf{e}_1 \\otimes \\mathbf{e}_1 = (1,0,0,0)^\\top,\\; \\mathbf{e}_1 \\otimes \\mathbf{e}_2 = (0,1,0,0)^\\top,\\; \\mathbf{e}_2 \\otimes \\mathbf{e}_1 = (0,0,1,0)^\\top,\\; \\mathbf{e}_2 \\otimes \\mathbf{e}_2 = (0,0,0,1)^\\top',
          annotation: 'Eigenvectors of $A \\otimes B$ are $\\mathbf{u}_i \\otimes \\mathbf{v}_j$. In standard coordinates: tensor products of standard basis vectors are again standard basis vectors (of $\\mathbb{R}^4$). The eigenvector for eigenvalue $\lambda_i \mu_j$ is $\mathbf{u}_i \otimes \mathbf{v}_j$.',
        },
        {
          expression: '(A \\otimes B)(\\mathbf{e}_1 \\otimes \\mathbf{e}_2) = (A\\mathbf{e}_1) \\otimes (B\\mathbf{e}_2) = 2\\mathbf{e}_1 \\otimes 4\\mathbf{e}_2 = 8(\\mathbf{e}_1 \\otimes \\mathbf{e}_2) \\; \\checkmark',
          annotation: 'Verification for the $(1,2)$ pair: mixed-product property $(A \\otimes B)(u \\otimes v) = (Au) \\otimes (Bv)$. The eigenvectors are indeed the tensor products of individual eigenvectors.',
        },
      ],
    },
    {
      id: 'ch-la10-002-3',
      title: 'Sylvester equation solvability from eigenvalues',
      difficulty: 'hard',
      problem: 'Determine whether $AX - XB = C$ has a unique solution, given $A = \\begin{pmatrix}1&0\\\\0&4\\end{pmatrix}$ and $B = \\begin{pmatrix}3&0\\\\0&4\\end{pmatrix}$. If not unique, characterize the solution set.',
      walkthrough: [
        {
          expression: '\\text{vec}(AX - XB) = (I \\otimes A - B^\\top \\otimes I)\\text{vec}(X)',
          annotation: 'Vectorize: $\\text{vec}(AX) = (I \\otimes A)\\text{vec}(X)$ and $\\text{vec}(XB) = (B^\\top \\otimes I)\\text{vec}(X)$. So the equation becomes the $4 \\times 4$ linear system $(I \\otimes A - B^\\top \\otimes I)\\text{vec}(X) = \\text{vec}(C)$.',
        },
        {
          expression: '\\lambda(I \\otimes A) = \\{1, 1, 4, 4\\} \\quad \\lambda(B^\\top \\otimes I) = \\{3, 3, 4, 4\\}',
          annotation: 'Eigenvalues of $I \\otimes A$: products $1 \\cdot \\lambda_j(A) \\in \\{1, 4\\}$ each with multiplicity 2. Eigenvalues of $B^\\top \\otimes I$: products $\\lambda_i(B) \\cdot 1 \\in \\{3, 4\\}$ each with multiplicity 2.',
        },
        {
          expression: '\\lambda(I \\otimes A - B^\\top \\otimes I) = \\{1-3, 1-4, 4-3, 4-4\\} = \\{-2, -3, 1, 0\\}',
          annotation: 'Since $A$ and $B$ are both diagonal, $I \\otimes A$ and $B^\\top \\otimes I$ commute and share eigenvectors. The eigenvalues of the difference are the pairwise differences $\\lambda_i(A) - \\lambda_j(B)$. One of these is zero: $4 - 4 = 0$.',
        },
        {
          expression: '\\det(I \\otimes A - B^\\top \\otimes I) = 0 \\Rightarrow \\text{system is singular}',
          annotation: 'The $4 \\times 4$ Kronecker system is singular because eigenvalue $4$ of $A$ equals eigenvalue $4$ of $B$. The equation $AX - XB = C$ does NOT have a unique solution. It has no solution (if $C$ is not in the column space of the Kronecker matrix) or infinitely many (if $C$ is compatible). Use the Fredholm alternative for $X_{22}$: solvability requires the $(2,2)$ entry of $C$ to equal zero for the corresponding row.',
        },
      ],
    },
  ],

  mentalModel: [
    '$V \\otimes W$: universal domain for bilinear maps from $V \\times W$. $\\dim = (\\dim V)(\\dim W)$.',
    'Elementary tensors $\\mathbf{v} \\otimes \\mathbf{w}$ ↔ rank-1 matrices (outer products).',
    'Kronecker product: matrix incarnation of tensor product. $(A \\otimes B)(C \\otimes D) = AC \\otimes BD$.',
    'Vec trick: $\\text{vec}(AXB) = (B^\\top \\otimes A)\\text{vec}(X)$. Converts matrix equations to linear systems.',
    'Tensor rank = number of elementary tensors needed. Hard to compute for order-3+ tensors.',
  ],

  checkpoints: [
    { id: 'cp-la10-002-1', label: 'Read the outer product as elementary tensor intro', type: 'read' },
    { id: 'cp-la10-002-2', label: 'Read the universal property of tensor products', type: 'read' },
    { id: 'cp-la10-002-3', label: 'Read the vec-Kronecker identity and its application', type: 'read' },
    { id: 'cp-la10-002-4', label: 'Run the Kronecker product basics notebook cell', type: 'lab' },
    { id: 'cp-la10-002-5', label: 'Solve the Sylvester equation in the notebook', type: 'lab' },
    { id: 'cp-la10-002-6', label: 'Trace the outer product elementary tensor example', type: 'example' },
    { id: 'cp-la10-002-7', label: 'Trace the vec-Kronecker trick example', type: 'example' },
    { id: 'cp-la10-002-8', label: 'Determine if a given 2x2 matrix is an elementary tensor', type: 'challenge' },
  ],

  assessment: 'Use the Kronecker product and vectorization to convert the matrix equation $AX - XB = 0$ into a standard eigenvalue problem, and explain its relationship to the eigenvalues of $A$ and $B$.',

  quiz: [
    {
      id: 'q-la10-002-1',
      type: 'choice',
      text: '$\\dim(\\mathbb{R}^3 \\otimes \\mathbb{R}^4)$ equals:',
      options: ['$3$', '$4$', '$7$', '$12$'],
      answer: '$12$',
      hints: ['$\\dim(V \\otimes W) = (\\dim V)(\\dim W)$.', '$3 \\times 4 = 12$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-002-2',
      type: 'choice',
      text: 'In $\\mathbb{R}^{m \\times n}$ viewed as $\\mathbb{R}^m \\otimes \\mathbb{R}^n$, rank-1 matrices correspond to:',
      options: ['Diagonal matrices', 'Symmetric matrices', 'Outer products $\\mathbf{u}\\mathbf{v}^\\top$', 'Orthogonal matrices'],
      answer: 'Outer products $\\mathbf{u}\\mathbf{v}^\\top$',
      hints: ['Elementary tensors are $\\mathbf{u} \\otimes \\mathbf{v}$.', 'Under the matrix identification, $\\mathbf{u} \\otimes \\mathbf{v} \\leftrightarrow \\mathbf{u}\\mathbf{v}^\\top$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-002-3',
      type: 'choice',
      text: 'The vec-Kronecker identity $\\text{vec}(AXB) = (B^\\top \\otimes A)\\text{vec}(X)$ is useful for:',
      options: ['Computing eigenvalues of $A$', 'Converting matrix equations to linear systems', 'Factorizing sparse matrices', 'Checking symmetry of $A$'],
      answer: 'Converting matrix equations to linear systems',
      hints: ['The Sylvester equation $AX + XB = C$ can be written as a linear system via this identity.', '$\\text{vec}(AXI + IXB) = (I \\otimes A + B^\\top \\otimes I)\\text{vec}(X)$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-002-4',
      type: 'choice',
      text: 'The outer product of $\\mathbf{u}=(2,1)^\\top$ and $\\mathbf{v}=(3,4)^\\top$ gives the matrix:',
      options: [
        '$\\begin{pmatrix}6&8\\\\3&4\\end{pmatrix}$',
        '$\\begin{pmatrix}6&3\\\\8&4\\end{pmatrix}$',
        '$\\begin{pmatrix}2&4\\\\3&1\\end{pmatrix}$',
        '$\\begin{pmatrix}5\\\\5\\end{pmatrix}$',
      ],
      answer: '$\\begin{pmatrix}6&8\\\\3&4\\end{pmatrix}$',
      hints: ['$m_{ij} = u_i v_j$.', 'Row $i$: multiply $u_i$ by all entries of $v^\\top$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la10-002-5',
      type: 'choice',
      text: 'A matrix $M$ is a single outer product (elementary tensor) if and only if:',
      options: ['$M$ is symmetric', '$M$ is invertible', 'rank$(M) = 1$', '$M$ is diagonal'],
      answer: 'rank$(M) = 1$',
      hints: ['Rank = minimum number of elementary tensors needed.', 'rank = 1 means one outer product suffices.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la10-002-6',
      type: 'choice',
      text: 'If $A \\in \\mathbb{R}^{2\\times 3}$ and $B \\in \\mathbb{R}^{4\\times 5}$, then $A \\otimes B$ has size:',
      options: ['$6 \\times 15$', '$8 \\times 15$', '$8 \\times 10$', '$6 \\times 10$'],
      answer: '$8 \\times 15$',
      hints: ['$A \\otimes B$ has size $(m_A \\cdot m_B) \\times (n_A \\cdot n_B)$.', '$(2 \\cdot 4) \\times (3 \\cdot 5) = 8 \\times 15$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-002-7',
      type: 'choice',
      text: 'The universal property says every bilinear map $B: V \\times W \\to U$ factors through:',
      options: [
        'A linear map $\\tilde{B}: V \\otimes W \\to U$',
        'A linear map $\\tilde{B}: V \\times W \\to U$',
        'A bilinear map $\\tilde{B}: V \\oplus W \\to U$',
        'A quadratic map $\\tilde{B}: V \\to U$',
      ],
      answer: 'A linear map $\\tilde{B}: V \\otimes W \\to U$',
      hints: ['The tensor product "linearizes" bilinear maps.', '$B(v,w) = \\tilde{B}(v \\otimes w)$ where $\\tilde{B}$ is linear.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-002-8',
      type: 'choice',
      text: 'Two qubits live in the space:',
      options: ['$\\mathbb{C}^4$', '$\\mathbb{C}^2$', '$\\mathbb{C}^{2 \\times 2}$', '$\\mathbb{R}^4$'],
      answer: '$\\mathbb{C}^4$',
      hints: ['$n$ qubits live in $\\mathbb{C}^2 \\otimes \\cdots \\otimes \\mathbb{C}^2$ ($n$ factors).', '$\\mathbb{C}^2 \\otimes \\mathbb{C}^2$ has dimension $2 \\cdot 2 = 4$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la10-002-9',
      type: 'choice',
      text: 'The mixed-product property states $(A \\otimes B)(C \\otimes D) =$',
      options: ['$AC \\otimes BD$', '$AB \\otimes CD$', '$CA \\otimes DB$', '$(AC)(BD) \\otimes I$'],
      answer: '$AC \\otimes BD$',
      hints: ['Kronecker product respects the product in each factor separately.', 'This is the defining property that makes Kronecker product useful.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la10-002-10',
      type: 'choice',
      text: 'The minimum number of outer products needed to write $I_2 = \\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}$ is:',
      options: ['$1$', '$2$', '$4$', 'Impossible'],
      answer: '$2$',
      hints: ['Minimum outer products = rank of the matrix.', 'rank$(I_2) = 2$, and $I_2 = e_1 e_1^\\top + e_2 e_2^\\top$.'],
      reviewSection: 'challenges',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Compute a 4×4 Kronecker product by hand from 2×2 blocks; apply the vec identity to convert a Sylvester-type matrix equation into a linear system.',
    explainVerbally: 'Explain why tensor products have dimension equal to the product of the factor dimensions, and why the outer product is the "atomic" building block.',
    detectIncorrectApplication: 'Catch the error of treating $A \\otimes B$ as $B \\otimes A$ (they are NOT the same in general), or confusing the size of the Kronecker product.',
    transferToUnfamiliar: 'Identify when a matrix equation can be converted to a linear system via the vec-Kronecker trick, then set up and solve it.',
  },

  misconceptions: [
    {
      falseBelief: 'Every element of $V \\otimes W$ is an elementary tensor $\\mathbf{v} \\otimes \\mathbf{w}$.',
      whyStudentsThinkIt: 'The notation "$V \\otimes W$" and the definition in terms of elementary tensors makes students think every element is an elementary tensor. But elements are sums of elementary tensors.',
      correctionExample: 'The identity matrix $I_2 = e_1 e_1^\\top + e_2 e_2^\\top$ is a sum of two elementary tensors. It cannot be written as a single outer product because rank$(I_2)=2 > 1$.',
      contrastCase: 'A rank-1 matrix IS an elementary tensor. A rank-$r$ matrix requires exactly $r$ elementary tensors in the minimum decomposition.',
    },
    {
      falseBelief: '$A \\otimes B = B \\otimes A$ (Kronecker product commutes).',
      whyStudentsThinkIt: 'Regular multiplication commutes for scalars, and tensor products are "symmetric" in the abstract sense $V \\otimes W \\cong W \\otimes V$. Students extend this to think the matrix Kronecker product commutes.',
      correctionExample: 'Take $A = \\begin{pmatrix}1&2\\\\0&0\\end{pmatrix}$, $B = \\begin{pmatrix}1\\\\0\\end{pmatrix}$. Even the sizes differ: $A \\otimes B$ is 4×2, but $B \\otimes A$ is 2×4.',
      contrastCase: '$V \\otimes W \\cong W \\otimes V$ as abstract spaces, but the specific Kronecker product matrices are related by permutation matrices, NOT equal.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A neural network layer computes $Y = \\sigma(W_1 X W_2^\\top)$ where $X$ is a feature matrix. You need to optimize over $X$ while holding $W_1, W_2$ fixed. How would you use the vec-Kronecker trick?',
      competingTechniques: 'Treat $X$ as a matrix and take matrix derivatives directly vs vectorize using $\\text{vec}(W_1 X W_2^\\top) = (W_2 \\otimes W_1)\\text{vec}(X)$ and apply standard vector-calculus gradient methods.',
      whyThisTechniqueWins: 'The vec form converts the bilinear matrix equation into a linear system in $\\text{vec}(X)$, enabling standard gradient descent or least-squares methods without matrix-derivative conventions.',
    },
    {
      situation: 'You have a quantum circuit on 3 qubits. A gate $G$ acts only on qubit 2 (leaving qubits 1 and 3 unchanged). What is the full 8×8 matrix for this gate?',
      competingTechniques: 'Manually expand the 8×8 matrix by working through all 8 basis states vs use Kronecker product: $I_2 \\otimes G \\otimes I_2$ where $G$ is the 2×2 gate matrix.',
      whyThisTechniqueWins: 'The Kronecker product gives a direct formula that generalizes to any number of qubits. The mixed-product property $(A \\otimes B)(C \\otimes D) = AC \\otimes BD$ then correctly predicts how multi-gate circuits compose.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\mathbf{v} \\otimes \\mathbf{w}', meaning: 'Elementary (rank-1) tensor: outer product in matrix coordinates; bilinear in both arguments. Every element of $V \\otimes W$ is a finite sum of these, but not every element is itself a single elementary tensor.' },
      { symbol: '\\dim(V \\otimes W) = (\\dim V)(\\dim W)', meaning: 'Dimension is the product (not sum) of factor dimensions. Basis: $\\{\\mathbf{e}_i \\otimes \\mathbf{f}_j\\}$ — each primal basis vector paired with each secondary basis vector.' },
      { symbol: 'A \\otimes B', meaning: 'Kronecker product: replace each entry $a_{ij}$ by the block $a_{ij}B$. Size: $(m_A m_B) \\times (n_A n_B)$. Eigenvalues: all products $\\lambda_i(A) \\mu_j(B)$.' },
      { symbol: '\\text{vec}(AXB) = (B^\\top \\otimes A)\\,\\text{vec}(X)', meaning: 'Vectorization identity: stacking columns converts any matrix linear equation $AXB = C$ into the standard linear system $(B^\\top \\otimes A)\\text{vec}(X) = \\text{vec}(C)$.' },
      { symbol: '\\text{rank}_T', meaning: 'Tensor rank: minimum number of elementary tensors whose sum equals $T$. For matrices, equals matrix rank. For order-3+ tensors: NP-hard to compute; real and complex ranks can differ.' },
      { symbol: '(A \\otimes B)(C \\otimes D) = AC \\otimes BD', meaning: 'Mixed-product property: Kronecker products compose factor-wise. Implies $(A \\otimes B)^{-1} = A^{-1} \\otimes B^{-1}$ and $\\text{eig}(A \\otimes B) = \\{\\lambda_i(A)\\mu_j(B)\\}$.' },
    ],
    rulesOfThumb: [
      'Tensor rank of a matrix = matrix rank. To check if a matrix is an elementary tensor, compute its rank — if rank = 1, it is; if rank > 1, it is not.',
      'Dimension check for Kronecker: $A \\in \\mathbb{R}^{m \\times n}$, $B \\in \\mathbb{R}^{p \\times q}$ gives $A \\otimes B \\in \\mathbb{R}^{mp \\times nq}$. A common error is writing dimensions additively ($m+p$) instead of multiplicatively.',
      '$A \\otimes B \\neq B \\otimes A$ in general (even when both are square). The two are related by permutation matrices, not equal.',
      'Sylvester equation $AX - XB = C$ has a unique solution iff $\\lambda_i(A) \\neq \\lambda_j(B)$ for all $i, j$ — the Kronecker system $(I \\otimes A - B^\\top \\otimes I)$ must be nonsingular.',
      'When the vec-Kronecker system is large ($mn > 10^4$), do NOT form the Kronecker matrix explicitly — use the Bartels-Stewart algorithm or Schur decompositions to solve Sylvester equations in $O(n^3)$.',
    ],
  },

  spiral: {
    recoveryPoints: ['la3-001', 'la10-001'],
    futureLinks: ['la10-003', 'la10-004'],
  },

  debugging: [
    {
      commonError: 'Confusing the order of factors in the Kronecker product when applying the vec identity.',
      symptom: 'Student writes $\\text{vec}(AXB) = (A \\otimes B^\\top)\\text{vec}(X)$ instead of $(B^\\top \\otimes A)\\text{vec}(X)$.',
      whyItHappened: 'The order reversal in the Kronecker product is counterintuitive. The left factor $A$ becomes the right Kronecker factor and vice versa.',
      repairStrategy: 'Remember the identity by dimension check: $\\text{vec}(AXB)$ has size $mp \\times 1$ (if $A$ is $m \\times n$, $X$ is $n \\times q$, $B$ is $q \\times p$). The Kronecker matrix must be $mp \\times nq$, which is $(B^\\top \\otimes A)$ — size $(p \\times q) \\otimes (m \\times n) = mp \\times nq$ ✓.',
    },
    {
      commonError: 'Applying the tensor product dimension formula additively instead of multiplicatively.',
      symptom: 'Student says $\\dim(\\mathbb{R}^3 \\otimes \\mathbb{R}^4) = 3+4 = 7$ instead of $12$.',
      whyItHappened: 'The direct sum $V \\oplus W$ has $\\dim V + \\dim W$, and students confuse $\\oplus$ (direct sum) with $\\otimes$ (tensor product).',
      repairStrategy: 'Dimension for $\\otimes$ is the product: each basis vector of $V$ pairs with each basis vector of $W$, giving $\\dim V \\cdot \\dim W$ pairs. For $\\oplus$ it is the sum. Remember: $\\otimes$ gives the number of entries in the corresponding matrix ($m \\times n$ has $mn$ entries).',
    },
  ],
};
