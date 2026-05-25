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
      '**Tensor products from first numbers.** Take $\\mathbf{u} = (2,1) \\in \\mathbb{R}^2$ and $\\mathbf{v} = (3,4) \\in \\mathbb{R}^2$. Their outer product is $\\mathbf{u}\\mathbf{v}^\\top = \\begin{pmatrix}6&8\\\\3&4\\end{pmatrix}$ — a 2×2 matrix. In tensor language, this IS $\\mathbf{u} \\otimes \\mathbf{v}$: a single "elementary tensor." Now consider a bilinear map like $B(\\mathbf{u},\\mathbf{v}) = u_1 v_1 + 2u_2 v_2$ — it is linear in each argument separately: $B((2,1),(3,4)) = 2\\cdot3+2\\cdot1\\cdot4 = 14$. The tensor product $V \\otimes W$ is the universal domain that converts bilinear maps into ordinary linear maps: every such $B$ factors as a linear map $\\tilde{B}$ applied to $\\mathbf{u}\\otimes\\mathbf{v}$. Dimension: $\\dim(\\mathbb{R}^2 \\otimes \\mathbb{R}^3) = 6$, matching a $2 \\times 3$ matrix\'s 6 entries.',
      '**Construction.** $V \\otimes W$ is the vector space spanned by formal symbols $\\mathbf{v} \\otimes \\mathbf{w}$ (for $\\mathbf{v} \\in V$, $\\mathbf{w} \\in W$) subject to bilinearity relations: $(\\alpha\\mathbf{v}) \\otimes \\mathbf{w} = \\alpha(\\mathbf{v} \\otimes \\mathbf{w}) = \\mathbf{v} \\otimes (\\alpha\\mathbf{w})$ and $(\\mathbf{v}_1 + \\mathbf{v}_2) \\otimes \\mathbf{w} = \\mathbf{v}_1 \\otimes \\mathbf{w} + \\mathbf{v}_2 \\otimes \\mathbf{w}$. Dimension: $\\dim(V \\otimes W) = (\\dim V)(\\dim W)$. Basis: $\\{\\mathbf{e}_i \\otimes \\mathbf{f}_j\\}$ for bases $\\{\\mathbf{e}_i\\}$ of $V$ and $\\{\\mathbf{f}_j\\}$ of $W$.',
      '**Matrices as tensors.** $\\mathbb{R}^m \\otimes \\mathbb{R}^n \\cong \\mathbb{R}^{m \\times n}$ (space of $m \\times n$ matrices). An elementary tensor (rank-1 tensor) $\\mathbf{u} \\otimes \\mathbf{v}$ corresponds to the outer product matrix $\\mathbf{u}\\mathbf{v}^\\top$. Not every matrix is rank-1, but every matrix is a sum of rank-1 matrices — this is the matrix rank decomposition / SVD.',
      '**Kronecker product.** For matrices $A \\in \\mathbb{R}^{m \\times n}$ and $B \\in \\mathbb{R}^{p \\times q}$: $A \\otimes B \\in \\mathbb{R}^{mp \\times nq}$ with block structure $(A \\otimes B)_{(i-1)p+k, (j-1)q+l} = a_{ij}b_{kl}$. Key properties: $(A \\otimes B)(C \\otimes D) = AC \\otimes BD$, $(A \\otimes B)^{-1} = A^{-1} \\otimes B^{-1}$, $\\text{vec}(AXB) = (B^\\top \\otimes A)\\text{vec}(X)$.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Prediction: Kronecker product size and rank',
        body: 'Let $A = \\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$ (2×2) and $B = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$ (2×2). **Before computing:** predict — what is the size of $A \\otimes B$? Is $A \\otimes B$ an elementary tensor (rank-1)? What would the (1,1) block of $A \\otimes B$ look like? After predicting: $A \\otimes B$ is 4×4 (2·2 × 2·2), the (1,1) block is $a_{11} B = 1 \\cdot B = B$. And $A \\otimes B$ is NOT an elementary tensor since $A$ itself has rank 2.',
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
      competingTechniques: ['Treat $X$ as a matrix and take matrix derivatives', 'Vectorize: $\\text{vec}(Y) = (W_2 \\otimes W_1)\\text{vec}(X)$, then use standard vector calculus'],
      whyThisTechniqueWins: 'The vec form converts the bilinear matrix equation into a linear system in $\\text{vec}(X)$, enabling standard gradient descent or least-squares methods on vectors.',
    },
    {
      situation: 'You have a quantum circuit on 3 qubits. A gate $G$ acts only on qubit 2 (leaving qubits 1 and 3 unchanged). What is the full 8×8 matrix for this gate?',
      competingTechniques: ['Manually compute the 8×8 matrix by expanding basis states', 'Use Kronecker product: $I \\otimes G \\otimes I$ where $G$ is the 2×2 gate matrix'],
      whyThisTechniqueWins: 'The Kronecker product gives a direct formula and generalizes to any number of qubits. The mixed-product property then correctly predicts how multi-gate circuits compose.',
    },
  ],

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
