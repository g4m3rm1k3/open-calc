export default {
  id: 'la7-001',
  slug: 'qr-decomposition',
  chapter: 'la7',
  order: 1,
  title: 'QR Decomposition',
  subtitle: 'Any matrix $A$ factors as $A = QR$ where $Q$ has orthonormal columns and $R$ is upper triangular. This is the workhorse algorithm for least squares, eigenvalue problems, and numerical stability.',
  tags: ['QR decomposition', 'Gram-Schmidt', 'orthonormal', 'upper triangular', 'least squares', 'Householder', 'numerical methods', 'thin QR'],
  aliases: 'QR decomposition Gram-Schmidt orthonormal upper triangular least squares Householder thin full numerical methods',

  hook: {
    question: "You have a matrix $A$ and need to solve the least-squares problem $\\min_\\mathbf{x} \\|A\\mathbf{x} - \\mathbf{b}\\|$. The normal equations $A^\\top A \\mathbf{x} = A^\\top \\mathbf{b}$ work, but squaring the matrix squares the condition number. Is there a better way?",
    realWorldContext: "QR decomposition is used in virtually every numerical linear algebra computation. MATLAB\'s backslash operator solves least squares via QR. The QR algorithm (repeatedly applying QR decomposition) is the standard method for computing all eigenvalues of a matrix. In statistics, the QR decomposition of the design matrix is the numerically stable way to fit regression models. In GPS and phone positioning, QR is used to solve overdetermined systems from multiple satellite signals. SVD (QR is an ingredient), eigenvalue solvers (QR iteration), and least squares all depend on it.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The factorization.** For any $m \\times n$ matrix $A$ with $m \\geq n$ and linearly independent columns: $A = QR$ where $Q$ is $m \\times n$ with orthonormal columns ($Q^\\top Q = I_n$) and $R$ is $n \\times n$ upper triangular with positive diagonal entries. This is the "thin" or "reduced" QR. The "full" QR has $Q$ as $m \\times m$ orthogonal.',
      '**Gram-Schmidt builds QR.** Apply Gram-Schmidt orthogonalization to the columns of $A$ to get the columns of $Q$. The numbers you compute along the way — norms and inner products — fill in $R$. Specifically, $r_{jj} = \\|\\tilde{\\mathbf{q}}_j\\|$ (norm of the $j$-th Gram-Schmidt vector before normalizing) and $r_{ij} = \\mathbf{q}_i^\\top \\mathbf{a}_j$ (projections onto earlier $\\mathbf{q}_i$).',
      '**Least squares via QR.** The normal equations $A^\\top A \\mathbf{x} = A^\\top \\mathbf{b}$ are equivalent to $R\\mathbf{x} = Q^\\top \\mathbf{b}$ (a triangular system — easy to solve by back substitution). This avoids squaring the condition number. QR-based least squares is about twice as expensive as normal equations but far more numerically stable.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'QR via Gram-Schmidt: The Recipe',
        body: 'Given columns $\\mathbf{a}_1, \\ldots, \\mathbf{a}_n$ of $A$:\n1. $\\tilde{\\mathbf{q}}_1 = \\mathbf{a}_1$, $\\mathbf{q}_1 = \\tilde{\\mathbf{q}}_1 / \\|\\tilde{\\mathbf{q}}_1\\|$\n2. For $j = 2, \\ldots, n$: subtract projections onto $\\mathbf{q}_1, \\ldots, \\mathbf{q}_{j-1}$:\n   $\\tilde{\\mathbf{q}}_j = \\mathbf{a}_j - (\\mathbf{q}_1^\\top \\mathbf{a}_j)\\mathbf{q}_1 - \\cdots - (\\mathbf{q}_{j-1}^\\top \\mathbf{a}_j)\\mathbf{q}_{j-1}$\n   $\\mathbf{q}_j = \\tilde{\\mathbf{q}}_j / \\|\\tilde{\\mathbf{q}}_j\\|$\n\nThe $R$ matrix: $r_{ij} = \\mathbf{q}_i^\\top \\mathbf{a}_j$ for $i < j$, $r_{jj} = \\|\\tilde{\\mathbf{q}}_j\\|$, $r_{ij} = 0$ for $i > j$.',
      },
      {
        type: 'insight',
        title: 'Least Squares via QR',
        body: 'To solve $\\min \\|A\\mathbf{x}-\\mathbf{b}\\|$ with $A = QR$:\n1. Compute $Q^\\top \\mathbf{b}$ ($m$ inner products)\n2. Solve $R\\mathbf{x} = Q^\\top \\mathbf{b}$ by back substitution\n\nCondition number: $\\kappa(R) = \\kappa(A)$ instead of $\\kappa(A)^2$ from normal equations.',
      },
      {
        type: 'insight',
        title: 'Householder QR vs Gram-Schmidt',
        body: 'Classical Gram-Schmidt is unstable: small errors compound as you subtract projections. Modified Gram-Schmidt is better but still not optimal. **Householder reflections** are the numerically stable way to compute QR in practice — they use orthogonal reflections $H = I - 2\\mathbf{u}\\mathbf{u}^\\top$ to zero out subdiagonal entries column by column. LAPACK and MATLAB use Householder QR.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'QR Decomposition',
        mathBridge: 'Compute QR, verify orthogonality, and solve least squares.',
        caption: 'Q has orthonormal columns; R is upper triangular; Q^T Q = I.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Compute QR and verify',
              prose: ['Factor A = QR, verify Q has orthonormal columns, reconstruct A.'],
              code: `A = [1  2  3;
     4  5  6;
     7  8 10;
     1  0  1]

[Q, R] = qr(A, 0)  % thin QR
disp('Q (orthonormal columns):')
Q
disp('R (upper triangular):')
R
disp('Q^T Q should be identity:')
round(Q' * Q, 10)
disp('Reconstruction Q*R should equal A:')
norm(A - Q*R)
`,
            },
            {
              id: 2,
              cellTitle: 'Least squares via QR',
              prose: ['Solve least-squares problem min||Ax-b|| using QR decomposition.'],
              code: `A = [1 1; 1 2; 1 3; 1 4]  % design matrix for linear fit
b = [1; 2; 2; 4]            % data

% QR approach
[Q, R] = qr(A, 0)
x_qr = R \ (Q' * b)
disp('Least squares solution via QR:')
x_qr

% Compare with normal equations
x_normal = (A' * A) \ (A' * b)
disp('Via normal equations:')
x_normal
disp('Difference (should be tiny):')
norm(x_qr - x_normal)
disp('Fitted line: y = a + b*x where:')
disp(['a = ', num2str(x_qr(1)), ', b = ', num2str(x_qr(2))])
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Existence and uniqueness.** QR factorization exists for any matrix $A$. If $A$ has full column rank, the thin QR with positive diagonal of $R$ is unique. If $A$ is square and invertible, the full QR is unique (under the convention that diagonal entries of $R$ are positive).',
      '**QR algorithm for eigenvalues.** The QR algorithm iterates: starting with $A_0 = A$, decompose $A_k = Q_k R_k$, then set $A_{k+1} = R_k Q_k = Q_k^{-1} A_k Q_k$ (a similarity transformation!). Under mild conditions, $A_k$ converges to the Schur form (upper triangular with eigenvalues on the diagonal). The practical version adds shifts for faster convergence and is the standard eigensolver for dense matrices.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Existence of QR',
        body: 'Every $m \\times n$ matrix $A$ ($m \\geq n$) has a factorization $A = QR$ where:\n• $Q$ is $m \\times m$ orthogonal (full QR)\n• $R$ is $m \\times n$ upper triangular\n\nEquivalently (thin QR for full column rank $A$):\n• $Q$ is $m \\times n$ with orthonormal columns\n• $R$ is $n \\times n$ upper triangular with positive diagonal',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Connection to Cholesky.** If $A$ has full column rank, $A^\\top A = (QR)^\\top(QR) = R^\\top Q^\\top Q R = R^\\top R$. So the Cholesky factorization of $A^\\top A$ is $R^\\top R$. This connects QR to the Cholesky factorization of the Gram matrix — and explains why the QR approach to least squares is equivalent to Cholesky on the normal equations, but without forming $A^\\top A$ explicitly.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why QR is More Stable than Normal Equations',
        body: 'Condition number of $A^\\top A$ = $\\kappa(A)^2$.\nCondition number of $R$ = $\\kappa(A)$.\n\nFor ill-conditioned $A$ (e.g., $\\kappa(A) = 10^8$), normal equations have $\\kappa = 10^{16}$ (near machine precision limit), while QR has $\\kappa = 10^8$ (still manageable).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la7-001-1',
      title: 'Manual QR via Gram-Schmidt',
      problem: 'Find the QR decomposition of $A = \\begin{bmatrix}1&1\\\\1&0\\\\0&1\\end{bmatrix}$.',
      solution: '$\\mathbf{a}_1 = (1,1,0)^\\top$: $\\mathbf{q}_1 = \\frac{1}{\\sqrt{2}}(1,1,0)^\\top$, $r_{11} = \\sqrt{2}$. $\\mathbf{a}_2 = (1,0,1)^\\top$: $r_{12} = \\mathbf{q}_1^\\top \\mathbf{a}_2 = \\frac{1}{\\sqrt{2}}$. $\\tilde{\\mathbf{q}}_2 = (1,0,1)^\\top - \\frac{1}{\\sqrt{2}} \\cdot \\frac{1}{\\sqrt{2}}(1,1,0)^\\top = (1/2, -1/2, 1)^\\top$, $r_{22} = \\sqrt{3/2}$. $\\mathbf{q}_2 = \\frac{1}{\\sqrt{3/2}}(1/2,-1/2,1)^\\top$.',
    },
  ],

  challenges: [
    {
      id: 'ch-la7-001-1',
      title: 'QR and least squares condition',
      difficulty: 'medium',
      prompt: 'Why is solving least squares via $R\\mathbf{x} = Q^\\top \\mathbf{b}$ (back-substitution) more stable than the normal equations? Give a specific example where the normal equations fail.',
      hint: 'Consider $A = \\begin{bmatrix}1&1\\\\\\varepsilon&0\\\\0&\\varepsilon\\end{bmatrix}$ for very small $\\varepsilon$.',
      solution: 'For small $\\varepsilon$, $A^\\top A = \\begin{bmatrix}1+\\varepsilon^2&1\\\\1&1+\\varepsilon^2\\end{bmatrix}$ which is nearly singular (condition number $\\sim 2/\\varepsilon^2$), causing normal equations to fail. QR handles this because $R$ has condition number $\\sim \\sqrt{2}/\\varepsilon$ — much smaller.',
    },
  ],

  mentalModel: [
    'QR = orthonormal columns × upper triangular. Like Gaussian elimination but preserving orthogonality.',
    'Build QR by Gram-Schmidt: orthogonalize columns, norms and projections fill R.',
    'Least squares via QR: compute $Q^\\top \\mathbf{b}$, back-solve $R\\mathbf{x} = Q^\\top \\mathbf{b}$.',
    'More stable than normal equations: avoids squaring the condition number.',
    'QR algorithm (iterating QR) computes all eigenvalues of a matrix.',
  ],

  checkpoints: [
    { id: 'cp-la7-001-1', question: 'In the QR decomposition $A = QR$, what properties does $Q$ have?', answer: 'Orthonormal columns: $Q^\\top Q = I$ (thin QR) or $Q$ is orthogonal: $Q^\\top Q = QQ^\\top = I$ (full QR).' },
    { id: 'cp-la7-001-2', question: 'How does QR solve least squares more stably than normal equations?', answer: 'Condition number of $R$ equals $\\kappa(A)$, while $A^\\top A$ has condition number $\\kappa(A)^2$.' },
    { id: 'cp-la7-001-3', question: 'What is the QR algorithm used for?', answer: 'Computing eigenvalues: iterating QR factorization converges to upper triangular form with eigenvalues on diagonal.' },
  ],

  assessment: 'Compute by hand the QR decomposition of $A = \\begin{bmatrix}3&1\\\\0&2\\\\4&0\\end{bmatrix}$ using Gram-Schmidt. Verify $Q^\\top Q = I_2$ and $QR = A$.',

  quiz: [
    { id: 'q-la7-001-1', question: 'In the thin QR decomposition of an $m \\times n$ matrix ($m > n$), what is the shape of $Q$?', options: ['$m \\times m$', '$n \\times n$', '$m \\times n$', '$n \\times m$'], answer: '$m \\times n$' },
    { id: 'q-la7-001-2', question: 'For least squares via QR, after computing $A = QR$, you solve:', options: ['$Q\\mathbf{x} = \\mathbf{b}$', '$R\\mathbf{x} = Q^\\top \\mathbf{b}$', '$A^\\top A \\mathbf{x} = \\mathbf{b}$', '$Q^\\top \\mathbf{x} = R\\mathbf{b}$'], answer: '$R\\mathbf{x} = Q^\\top \\mathbf{b}$' },
    { id: 'q-la7-001-3', question: 'The QR algorithm (iterate: $A_{k+1} = R_k Q_k$) converges to:', options: ['A symmetric matrix', 'A diagonal matrix always', 'Upper triangular form with eigenvalues on diagonal', 'The identity matrix'], answer: 'Upper triangular form with eigenvalues on diagonal' },
  ],
};
