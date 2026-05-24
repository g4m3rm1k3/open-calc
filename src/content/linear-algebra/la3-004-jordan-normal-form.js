export default {
  id: 'la3-004',
  slug: 'jordan-normal-form',
  chapter: 'la3',
  order: 4,
  title: 'Jordan Normal Form',
  subtitle: 'When diagonalization fails — because a matrix has repeated eigenvalues with too few eigenvectors — Jordan form is the nearest thing to a diagonal matrix that always exists.',
  tags: ['Jordan form', 'Jordan blocks', 'generalized eigenvectors', 'defective matrix', 'nilpotent', 'Jordan decomposition', 'algebraic multiplicity', 'geometric multiplicity'],
  aliases: 'Jordan normal form Jordan blocks generalized eigenvectors defective matrix nilpotent non-diagonalizable algebraic geometric multiplicity',

  hook: {
    question: "Diagonalization fails when a matrix has repeated eigenvalues but not enough eigenvectors. Is there a universal form that every matrix can be reduced to — even the stubborn, non-diagonalizable ones?",
    realWorldContext: "Jordan form arises whenever a system has critically damped behavior — repeated roots in the characteristic equation with a deficiency of eigenvectors. A classic example: the critically damped spring-mass system, sitting exactly at the boundary between oscillation and overdamping, exhibits $t \\cdot e^{\\lambda t}$ solutions (polynomial × exponential) that can only be understood through Jordan form. In control theory, the Jordan structure determines whether a system can be stabilized. In differential geometry, the Jordan form of the Riemann curvature tensor determines the local shape of spacetime.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**Review: what diagonalization requires.** From la3-002, an $n \\times n$ matrix $A$ is diagonalizable iff it has $n$ linearly independent eigenvectors. You can fail this requirement two ways: (a) an eigenvalue is not repeated but over a different field, or (b) — the key case — an eigenvalue $\\lambda$ is repeated (algebraic multiplicity $> 1$) but the eigenspace $\\text{Nul}(A - \\lambda I)$ has smaller dimension than expected (geometric multiplicity $<$ algebraic multiplicity). Such a matrix is called **defective**.',
      '**What is a Jordan block?** A Jordan block $J_k(\\lambda)$ is a $k \\times k$ matrix with $\\lambda$ on the main diagonal and $1$s on the superdiagonal:\n\n$J_k(\\lambda) = \\begin{bmatrix}\\lambda & 1 & 0 & \\cdots \\\\ 0 & \\lambda & 1 & \\cdots \\\\ \\vdots & & \\ddots & 1 \\\\ 0 & \\cdots & 0 & \\lambda\\end{bmatrix}$\n\nA $1 \\times 1$ Jordan block is just $[\\lambda]$ — a single eigenvalue, fully diagonal. Jordan blocks of size $> 1$ capture the "almost diagonal" structure of defective matrices.',
      '**The Jordan Normal Form theorem.** Every $n \\times n$ complex matrix $A$ is similar to a block-diagonal matrix $J = P^{-1}AP$ where $J$ is a direct sum of Jordan blocks. This is the Jordan normal form. The sizes and eigenvalues of the Jordan blocks are uniquely determined by $A$ (though $P$ is not unique).',
      '**Generalized eigenvectors.** For a Jordan block $J_k(\\lambda)$, only one linearly independent eigenvector exists (the first basis vector). The remaining $k-1$ basis vectors are **generalized eigenvectors** satisfying $(A - \\lambda I)^j \\mathbf{v}_j = \\mathbf{0}$ but $(A - \\lambda I)^{j-1} \\mathbf{v}_j \\neq \\mathbf{0}$. They form a **Jordan chain**: $\\mathbf{v}_1$ is the true eigenvector, and $(A - \\lambda I)\\mathbf{v}_{j+1} = \\mathbf{v}_j$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Jordan Form vs Diagonal Form',
        body: 'Diagonal: $D = \\text{diag}(\\lambda_1, \\ldots, \\lambda_n)$ — all Jordan blocks are $1 \\times 1$.\nJordan: $J = J_1 \\oplus J_2 \\oplus \\cdots$ — Jordan blocks can be larger.\nEvery diagonal matrix is in Jordan form. Most matrices in Jordan form are not diagonal.',
      },
      {
        type: 'insight',
        title: 'Reading Off the Structure',
        body: '• Number of Jordan blocks for $\\lambda$ = geometric multiplicity of $\\lambda$ (dimension of eigenspace)\n• Sum of block sizes for $\\lambda$ = algebraic multiplicity of $\\lambda$ (multiplicity as root of char. poly.)\n• If algebraic = geometric for all $\\lambda$: the matrix is diagonalizable',
      },
      {
        type: 'warning',
        title: 'Jordan Form Is Hard to Compute Numerically',
        body: 'Jordan form is unstable: tiny perturbations to a defective matrix make it fully diagonalizable with very different eigenvectors. In practice, use Schur decomposition (la7-001) instead, which is numerically stable. Jordan form is primarily a theoretical tool.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Jordan Structure in OpenMAT',
        mathBridge: 'Build a defective matrix and examine why diagonalization fails.',
        caption: 'A Jordan block with a 1 on the superdiagonal is irreducible — it cannot be split further.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'A defective matrix: eigenvalues without enough eigenvectors',
              prose: ['J = [3 1; 0 3] has eigenvalue 3 with algebraic multiplicity 2 but only 1 eigenvector.'],
              code: `J = [3 1; 0 3]
[V, D] = eig(J)
disp('Eigenvalues (diagonal of D):')
diag(D)
disp('Eigenvectors (columns of V):')
V
disp('Are columns independent? (det of V)')
det(V)
`,
            },
            {
              id: 2,
              cellTitle: 'Jordan chain: generalized eigenvectors',
              prose: ['Find the true eigenvector v1 and generalized eigenvector v2 such that (J-3I)v2 = v1.'],
              code: `J = [3 1; 0 3]
lam = 3;
B = J - lam*eye(2)
disp('Null space of (J - 3I) = true eigenvectors:')
rref(B)
disp('v1 = first eigenvector:')
v1 = [1; 0]
disp('Solve (J-3I)v2 = v1 for generalized eigenvector v2:')
% augmented matrix [B | v1]
rref([B v1])
v2 = [0; 1]
disp('Verify: (J-3I)*v2 = v1')
B * v2
`,
            },
            {
              id: 3,
              cellTitle: 'Matrix powers of a Jordan block',
              prose: ['For a Jordan block J_k(lambda), J^n has lambda^n on diagonal and n*lambda^(n-1) on superdiagonal.'],
              code: `J = [3 1; 0 3]
disp('J^2:')
J^2
disp('J^3:')
J^3
disp('Pattern: J^n = [3^n, n*3^(n-1); 0, 3^n]')
n = 4;
J_pred = [3^n, n*3^(n-1); 0, 3^n]
J^4
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Algebraic vs geometric multiplicity.** The **algebraic multiplicity** $m_a(\\lambda)$ is the multiplicity of $\\lambda$ as a root of the characteristic polynomial $\\det(A - \\lambda I)$. The **geometric multiplicity** $m_g(\\lambda) = \\dim \\text{Nul}(A - \\lambda I)$ is the dimension of the eigenspace. Always $1 \\leq m_g(\\lambda) \\leq m_a(\\lambda)$. The matrix is diagonalizable iff $m_g(\\lambda) = m_a(\\lambda)$ for every eigenvalue $\\lambda$.',
      '**Generalized eigenspaces.** The $k$-th generalized eigenspace is $\\text{Nul}(A - \\lambda I)^k$. This is a nested sequence of subspaces: $\\text{Nul}(A - \\lambda I) \\subseteq \\text{Nul}(A - \\lambda I)^2 \\subseteq \\cdots$. The sequence stabilizes at the algebraic multiplicity: $\\text{Nul}(A - \\lambda I)^{m_a(\\lambda)} = \\text{Nul}(A - \\lambda I)^{m_a(\\lambda)+1}$. The final subspace has dimension exactly $m_a(\\lambda)$.',
      '**Jordan decomposition.** Every complex $n \\times n$ matrix $A$ can be written as $A = SJS^{-1}$ where $J$ is in Jordan normal form. The matrix $S$ is formed from Jordan chains: each Jordan chain $\\{\\mathbf{v}_1, \\mathbf{v}_2, \\ldots, \\mathbf{v}_k\\}$ (where $(A - \\lambda I)\\mathbf{v}_{i+1} = \\mathbf{v}_i$ and $(A - \\lambda I)\\mathbf{v}_1 = 0$) contributes one Jordan block $J_k(\\lambda)$ to $J$, with the chain vectors as columns of $S$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Jordan Normal Form Theorem',
        body: 'Every $n \\times n$ matrix over $\\mathbb{C}$ is similar to a unique Jordan normal form (up to reordering of blocks):\n$J = J_{k_1}(\\lambda_1) \\oplus J_{k_2}(\\lambda_2) \\oplus \\cdots$\nwhere $\\sum k_i = n$ and the $\\lambda_i$ are the eigenvalues with multiplicity.',
      },
      {
        type: 'insight',
        title: 'Nilpotent Part',
        body: 'Write $A = \\lambda I + N$ where $N = A - \\lambda I$. For a single Jordan block $J_k(\\lambda)$, $N$ is the superdiagonal part — a nilpotent matrix satisfying $N^k = 0$. Jordan form decomposes every matrix into a "scalar" part ($\\lambda I$) plus a nilpotent part $N$ that satisfies $N^k = 0$ for some finite $k$. This decomposition is key to computing matrix exponentials.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Primary Decomposition Theorem.** If the characteristic polynomial of $A$ factors as $p(\\lambda) = (\\lambda - \\lambda_1)^{m_1} \\cdots (\\lambda - \\lambda_r)^{m_r}$ over $\\mathbb{C}$, then $\\mathbb{C}^n = V_1 \\oplus \\cdots \\oplus V_r$ where $V_i = \\text{Nul}(A - \\lambda_i I)^{m_i}$ are the generalized eigenspaces. Each $V_i$ is $A$-invariant and has dimension $m_i$. The Jordan normal form arises by choosing a Jordan basis for each $V_i$.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Jordan Form over Reals',
        body: 'Over $\\mathbb{R}$, complex conjugate pairs of eigenvalues $a \\pm bi$ produce $2 \\times 2$ real Jordan blocks of the form $\\begin{bmatrix}a&-b\\\\b&a\\end{bmatrix}$. This is the real Jordan form (also called real canonical form).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la3-004-1',
      title: 'Jordan form of a $2 \\times 2$ defective matrix',
      problem: 'Find the Jordan form of $A = \\begin{bmatrix}2&1\\\\0&2\\end{bmatrix}$.',
      solution: '$A$ is already in Jordan form: $J_2(2)$. Eigenvalue $\\lambda = 2$ has algebraic multiplicity 2 and geometric multiplicity 1. One true eigenvector $[1,0]^\\top$, one generalized eigenvector found by solving $(A - 2I)\\mathbf{v}_2 = [1,0]^\\top$: $\\mathbf{v}_2 = [0,1]^\\top$.',
    },
    {
      id: 'ex-la3-004-2',
      title: 'Jordan form with two blocks',
      problem: 'Find the Jordan form of $B = \\begin{bmatrix}4&1&0\\\\0&4&0\\\\0&0&4\\end{bmatrix}$.',
      solution: '$\\lambda = 4$ with algebraic multiplicity 3. Nul$(B - 4I) = $ Nul$\\begin{bmatrix}0&1&0\\\\0&0&0\\\\0&0&0\\end{bmatrix}$ has dimension 2 (geometric mult. 2). Jordan form: $J_2(4) \\oplus J_1(4) = \\begin{bmatrix}4&1&0\\\\0&4&0\\\\0&0&4\\end{bmatrix}$. Two blocks: one size 2, one size 1.',
    },
  ],

  challenges: [
    {
      id: 'ch-la3-004-1',
      title: 'Jordan form from eigenvalue analysis',
      difficulty: 'medium',
      prompt: 'Determine the possible Jordan forms for a $4 \\times 4$ matrix with eigenvalue $\\lambda = 2$ of algebraic multiplicity 4 and geometric multiplicity 2.',
      hint: 'Two Jordan blocks for $\\lambda = 2$ that sum to size 4 with 2 blocks.',
      solution: 'Two blocks summing to size 4, each at least size 1: either $J_3(2) \\oplus J_1(2)$ or $J_2(2) \\oplus J_2(2)$.',
    },
  ],

  mentalModel: [
    'Defective = repeated eigenvalue with eigenspace too small = can\'t fully diagonalize.',
    'Jordan blocks capture the "almost diagonal" structure: diagonal entries are eigenvalues, superdiagonal 1s encode generalized eigenvectors.',
    'Number of Jordan blocks for $\\lambda$ = geometric multiplicity = number of independent eigenvectors.',
    'Sum of block sizes for $\\lambda$ = algebraic multiplicity = root multiplicity in char. poly.',
  ],

  checkpoints: [
    { id: 'cp-la3-004-1', question: 'What makes a matrix defective?', answer: 'Geometric multiplicity < algebraic multiplicity for some eigenvalue.' },
    { id: 'cp-la3-004-2', question: 'What is a generalized eigenvector?', answer: '$(A - \\lambda I)^k \\mathbf{v} = 0$ but $(A - \\lambda I)^{k-1} \\mathbf{v} \\neq 0$.' },
    { id: 'cp-la3-004-3', question: 'If all Jordan blocks are $1 \\times 1$, what does that mean?', answer: 'The matrix is diagonalizable.' },
  ],

  assessment: 'Find the Jordan normal form of $A = \\begin{bmatrix}5&1&0\\\\0&5&1\\\\0&0&5\\end{bmatrix}$ and identify a Jordan chain.',

  quiz: [
    { id: 'q-la3-004-1', question: 'A $3 \\times 3$ matrix with eigenvalue $\\lambda = 2$ (algebraic mult 3, geometric mult 1) has Jordan form:', options: ['$J_3(2)$', '$J_2(2) \\oplus J_1(2)$', '$J_1(2) \\oplus J_1(2) \\oplus J_1(2)$', 'Diagonal'], answer: '$J_3(2)$' },
    { id: 'q-la3-004-2', question: 'The number of Jordan blocks for eigenvalue $\\lambda$ equals:', options: ['algebraic multiplicity', 'geometric multiplicity', 'order of the matrix', 'rank of $A$'], answer: 'geometric multiplicity' },
    { id: 'q-la3-004-3', question: 'Jordan form is primarily a _____ tool rather than a numerical one:', options: ['computational', 'theoretical', 'graphical', 'statistical'], answer: 'theoretical' },
  ],
};
