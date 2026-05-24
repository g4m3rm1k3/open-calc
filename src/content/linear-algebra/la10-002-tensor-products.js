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
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The problem with bilinearity.** A bilinear map $B: V \\times W \\to U$ satisfies linearity in each argument separately. These are common (inner products, matrix multiplication, cross products). The tensor product is the "universal" domain for bilinear maps: every bilinear $B: V \\times W \\to U$ factors uniquely through the linear map $\\tilde{B}: V \\otimes W \\to U$.',
      '**Construction.** $V \\otimes W$ is the vector space spanned by formal symbols $\\mathbf{v} \\otimes \\mathbf{w}$ (for $\\mathbf{v} \\in V$, $\\mathbf{w} \\in W$) subject to bilinearity relations: $(\\alpha\\mathbf{v}) \\otimes \\mathbf{w} = \\alpha(\\mathbf{v} \\otimes \\mathbf{w}) = \\mathbf{v} \\otimes (\\alpha\\mathbf{w})$ and $(\\mathbf{v}_1 + \\mathbf{v}_2) \\otimes \\mathbf{w} = \\mathbf{v}_1 \\otimes \\mathbf{w} + \\mathbf{v}_2 \\otimes \\mathbf{w}$. Dimension: $\\dim(V \\otimes W) = (\\dim V)(\\dim W)$. Basis: $\\{\\mathbf{e}_i \\otimes \\mathbf{f}_j\\}$ for bases $\\{\\mathbf{e}_i\\}$ of $V$ and $\\{\\mathbf{f}_j\\}$ of $W$.',
      '**Matrices as tensors.** $\\mathbb{R}^m \\otimes \\mathbb{R}^n \\cong \\mathbb{R}^{m \\times n}$ (space of $m \\times n$ matrices). An elementary tensor (rank-1 tensor) $\\mathbf{u} \\otimes \\mathbf{v}$ corresponds to the outer product matrix $\\mathbf{u}\\mathbf{v}^\\top$. Not every matrix is rank-1, but every matrix is a sum of rank-1 matrices — this is the matrix rank decomposition / SVD.',
      '**Kronecker product.** For matrices $A \\in \\mathbb{R}^{m \\times n}$ and $B \\in \\mathbb{R}^{p \\times q}$: $A \\otimes B \\in \\mathbb{R}^{mp \\times nq}$ with block structure $(A \\otimes B)_{(i-1)p+k, (j-1)q+l} = a_{ij}b_{kl}$. Key properties: $(A \\otimes B)(C \\otimes D) = AC \\otimes BD$, $(A \\otimes B)^{-1} = A^{-1} \\otimes B^{-1}$, $\\text{vec}(AXB) = (B^\\top \\otimes A)\\text{vec}(X)$.',
    ],
    callouts: [
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
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Kronecker Products',
        mathBridge: 'Compute Kronecker products and use the vec identity.',
        caption: 'Kronecker product encodes tensor products of matrices.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Kronecker product basics',
              prose: ['Compute the Kronecker product and verify its key properties.'],
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
              prose: ['Solve AX + XB = C using the Kronecker product and vec identity.'],
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
      title: 'Outer product as tensor',
      problem: 'Identify the matrix $M = \\mathbf{u}\\mathbf{v}^\\top = \\begin{bmatrix}2\\\\1\\end{bmatrix}\\begin{bmatrix}3&4\\end{bmatrix}$ as an elementary tensor. What is its rank?',
      solution: '$M = \\mathbf{u} \\otimes \\mathbf{v}$ (identifying $\\mathbb{R}^2 \\otimes \\mathbb{R}^2 \\cong \\mathbb{R}^{2\\times 2}$). It is an elementary tensor, so tensor rank = 1 = matrix rank. The entries are $m_{ij} = u_i v_j$: $M = \\begin{bmatrix}6&8\\\\3&4\\end{bmatrix}$.',
    },
  ],

  challenges: [
    {
      id: 'ch-la10-002-1',
      title: 'Not every matrix is rank-1',
      difficulty: 'medium',
      prompt: 'Show that the identity matrix $I_2 \\in \\mathbb{R}^{2\\times 2}$ cannot be written as a single outer product $\\mathbf{u}\\mathbf{v}^\\top$. What is the minimum number of outer products needed?',
      hint: 'A single outer product has rank 1. What is the rank of $I_2$?',
      solution: '$I_2 = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$ has rank 2. A rank-1 matrix $\\mathbf{u}\\mathbf{v}^\\top$ has $\\det = 0$ (since it has a 0 eigenvalue), but $\\det I_2 = 1 \\neq 0$. Minimum outer products needed = rank$(I_2)$ = 2: $I_2 = \\mathbf{e}_1\\mathbf{e}_1^\\top + \\mathbf{e}_2\\mathbf{e}_2^\\top$.',
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
    { id: 'cp-la10-002-1', question: 'What is $\\dim(V \\otimes W)$?', answer: '$(\\dim V)(\\dim W)$.' },
    { id: 'cp-la10-002-2', question: 'What does the universal property of $V \\otimes W$ say?', answer: 'Every bilinear map $B: V \\times W \\to U$ factors uniquely through a linear map $\\tilde{B}: V \\otimes W \\to U$ with $B(\\mathbf{v},\\mathbf{w}) = \\tilde{B}(\\mathbf{v} \\otimes \\mathbf{w})$.' },
    { id: 'cp-la10-002-3', question: 'What is the vec-Kronecker identity?', answer: '$\\text{vec}(AXB) = (B^\\top \\otimes A)\\text{vec}(X)$.' },
  ],

  assessment: 'Use the Kronecker product and vectorization to convert the matrix equation $AX - XB = 0$ into a standard eigenvalue problem, and explain its relationship to the eigenvalues of $A$ and $B$.',

  quiz: [
    { id: 'q-la10-002-1', question: '$\\dim(\\mathbb{R}^3 \\otimes \\mathbb{R}^4)$ equals:', options: ['$3$', '$4$', '$7$', '$12$'], answer: '$12$' },
    { id: 'q-la10-002-2', question: 'In $\\mathbb{R}^{m \\times n}$ viewed as $\\mathbb{R}^m \\otimes \\mathbb{R}^n$, rank-1 matrices correspond to:', options: ['Diagonal matrices', 'Symmetric matrices', 'Outer products $\\mathbf{u}\\mathbf{v}^\\top$', 'Orthogonal matrices'], answer: 'Outer products $\\mathbf{u}\\mathbf{v}^\\top$' },
    { id: 'q-la10-002-3', question: 'The vec-Kronecker identity $\\text{vec}(AXB) = (B^\\top \\otimes A)\\text{vec}(X)$ is useful for:', options: ['Computing eigenvalues of $A$', 'Converting matrix equations to linear systems', 'Factorizing sparse matrices', 'Implementing neural networks'], answer: 'Converting matrix equations to linear systems' },
  ],
};
