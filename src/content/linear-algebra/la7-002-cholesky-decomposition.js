export default {
  id: 'la7-002',
  slug: 'cholesky-decomposition',
  chapter: 'la7',
  order: 2,
  title: 'Cholesky Decomposition',
  subtitle: 'Every symmetric positive definite matrix factors as $A = LL^\\top$ where $L$ is lower triangular with positive diagonal. Cholesky is twice as fast as LU and exploits symmetry and positive definiteness perfectly.',
  tags: ['Cholesky', 'positive definite', 'symmetric', 'lower triangular', 'factorization', 'numerical stability', 'SPD matrix', 'covariance matrix'],
  aliases: 'Cholesky decomposition positive definite symmetric lower triangular factorization numerical stability SPD covariance matrix Gram matrix',

  hook: {
    question: "You need to solve $Ax = b$ where $A$ is the covariance matrix of your data — symmetric and positive definite. LU decomposition works but ignores the symmetry. Is there a smarter factorization?",
    realWorldContext: "Cholesky decomposition is the backbone of statistical computing. In Bayesian statistics, every covariance matrix is SPD, and Cholesky is used to sample multivariate normal distributions, compute log-determinants, and solve linear systems efficiently. In finite element analysis, the stiffness matrix is SPD — Cholesky solvers are used for every structural mechanics simulation. Monte Carlo methods in finance use Cholesky to generate correlated random variables. In machine learning, Gaussian processes require Cholesky to compute kernel matrix inverses.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The factorization.** A symmetric positive definite (SPD) matrix $A$ can be factored uniquely as $A = LL^\\top$ where $L$ is lower triangular with strictly positive diagonal entries. (Equivalently, $A = R^\\top R$ with $R$ upper triangular — which is what MATLAB returns.)',
      '**Why SPD matrices are special.** For any non-zero $\\mathbf{x}$, $\\mathbf{x}^\\top A \\mathbf{x} > 0$. This means $A$ has all positive eigenvalues, $\\det A > 0$, and all principal submatrices are also positive definite. These properties guarantee that the Cholesky algorithm never divides by zero or takes the square root of a negative number — the algorithm succeeds iff $A$ is SPD.',
      '**Computing L.** The entries of $L$ are computed by matching entries of $LL^\\top$ to $A$: $l_{jj} = \\sqrt{a_{jj} - \\sum_{k=1}^{j-1} l_{jk}^2}$ and $l_{ij} = \\frac{1}{l_{jj}}\\left(a_{ij} - \\sum_{k=1}^{j-1} l_{ik} l_{jk}\\right)$ for $i > j$. This proceeds column by column.',
      '**Efficiency.** Cholesky does approximately $n^3/3$ flops — half the $2n^3/3$ of LU (since you only compute the lower triangle). Storage is halved too. For $n = 10000$, this is a factor-of-2 speedup over LU, which matters in production.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cholesky Existence and Uniqueness',
        body: '$A$ has a Cholesky factorization $A = LL^\\top$ (with $L$ lower triangular, positive diagonal) iff $A$ is symmetric positive definite (SPD).\n\nConsequence: you can test if $A$ is SPD by attempting Cholesky — if it succeeds, $A$ is SPD; if the algorithm encounters a non-positive pivot, it is not.',
      },
      {
        type: 'insight',
        title: 'Cholesky for Sampling Normals',
        body: 'To sample $\\mathbf{z} \\sim \\mathcal{N}(\\boldsymbol{\\mu}, \\Sigma)$:\n1. Compute Cholesky $\\Sigma = LL^\\top$\n2. Sample $\\mathbf{w} \\sim \\mathcal{N}(\\mathbf{0}, I)$ (standard normal)\n3. Return $\\mathbf{z} = \\boldsymbol{\\mu} + L\\mathbf{w}$\n\nCovariance of $L\\mathbf{w}$ = $L \\cdot I \\cdot L^\\top = LL^\\top = \\Sigma$. ✓',
      },
      {
        type: 'insight',
        title: 'Cholesky vs LU',
        body: 'LU: general $n \\times n$ matrix → $\\frac{2}{3}n^3$ flops\nCholesky (SPD): → $\\frac{1}{3}n^3$ flops (half as much)\nLU needs $n^2$ extra storage for the factored form\nCholesky only stores the lower triangle: $\\frac{n(n+1)}{2}$ entries',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Cholesky Factorization',
        mathBridge: 'Factor an SPD matrix and use it to solve systems efficiently.',
        caption: 'A = L * L^T — the square root of a matrix.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Compute Cholesky and verify',
              prose: ['Factor an SPD matrix A = L*L^T, verify, and solve Ax = b.'],
              code: `% Build an SPD matrix (B'*B is always SPD if B has full column rank)
B = [2 1 0; 1 3 1; 0 1 4]
A = B' * B
disp('A = B^T B (SPD):')
A
disp('Eigenvalues (all positive for SPD):')
eig(A)

% Cholesky factorization (chol returns upper triangular R where A = R'*R)
R = chol(A)
L = R'   % lower triangular factor
disp('L (lower triangular):')
L
disp('Verify L*L^T = A:')
norm(A - L*L')

% Solve Ax = b using Cholesky
b = [1; 2; 3]
% Forward substitution: L*y = b
y = L \ b
% Back substitution: L'*x = y
x = L' \ y
disp('Solution x:')
x
disp('Verify Ax = b:')
norm(A*x - b)
`,
            },
            {
              id: 2,
              cellTitle: 'Cholesky for sampling correlated normals',
              prose: ['Use Cholesky to sample from a 2D Gaussian with covariance Sigma.'],
              code: `% Covariance matrix
Sigma = [4 2; 2 3]
L = chol(Sigma, 'lower')
disp('L:')
L
disp('Verify L*L^T = Sigma:')
norm(Sigma - L*L')

% Sample correlated normals
rng(42)
n_samples = 1000
W = randn(2, n_samples)  % iid standard normals
Z = L * W  % correlated samples: cov ~ Sigma

% Empirical covariance
empirical_cov = (Z * Z') / (n_samples - 1)
disp('Empirical covariance (should be close to Sigma):')
round(empirical_cov, 2)
disp('Target Sigma:')
Sigma
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Proof of existence.** By induction on $n$. For $n=1$: $A = [a_{11}]$ with $a_{11} > 0$ (positive definite). Set $l_{11} = \\sqrt{a_{11}}$. For $n > 1$: partition $A = \\begin{bmatrix}a_{11} & \\mathbf{v}^\\top \\\\ \\mathbf{v} & B\\end{bmatrix}$. Set $l_{11} = \\sqrt{a_{11}}$, $\\boldsymbol{\\ell} = \\mathbf{v}/l_{11}$. Then $A = \\begin{bmatrix}l_{11}&0\\\\\\boldsymbol{\\ell}&I\\end{bmatrix}\\begin{bmatrix}1&0\\\\0&B - \\boldsymbol{\\ell}\\boldsymbol{\\ell}^\\top\\end{bmatrix}\\begin{bmatrix}l_{11}&\\boldsymbol{\\ell}^\\top\\\\0&I\\end{bmatrix}$. The Schur complement $B - \\boldsymbol{\\ell}\\boldsymbol{\\ell}^\\top$ is also SPD, so induction applies.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Cholesky and Log-Determinant',
        body: 'Since $\\det A = \\det(LL^\\top) = (\\det L)^2 = \\left(\\prod_{i=1}^n l_{ii}\\right)^2$:\n$\\log \\det A = 2 \\sum_{i=1}^n \\log l_{ii}$\n\nThis is the numerically stable way to compute log-determinants (used in likelihood functions, entropy, etc.).',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Blocked Cholesky.** For large matrices, the standard column-by-column Cholesky is memory-bound. **Blocked Cholesky** computes the factorization in blocks of columns, enabling cache-efficient implementation with BLAS-3 operations. This gives 10-100× speedup on modern hardware. LAPACK\'s DPOTRF uses blocked Cholesky.',
      '**Incomplete Cholesky.** For sparse SPD matrices, you can compute an incomplete Cholesky factorization by zeroing out fill-in entries — the result is not exact ($A \\approx LL^\\top$ instead of $=$) but serves as a powerful preconditioner for iterative solvers like conjugate gradient.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Modification for Near-SPD Matrices',
        body: 'When $A$ is nearly SPD but has tiny negative eigenvalues due to floating-point errors, the Cholesky factorization fails. **Modified Cholesky** (Gill-Murray-Wright) adds a multiple of the identity to make $A$ sufficiently positive: $A + \\alpha I = LL^\\top$. Used in optimization to ensure a descent direction.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la7-002-1',
      title: 'Manual Cholesky of a 2×2 matrix',
      problem: 'Find the Cholesky factorization of $A = \\begin{bmatrix}4&2\\\\2&3\\end{bmatrix}$.',
      solution: '$l_{11} = \\sqrt{4} = 2$. $l_{21} = a_{21}/l_{11} = 2/2 = 1$. $l_{22} = \\sqrt{a_{22} - l_{21}^2} = \\sqrt{3 - 1} = \\sqrt{2}$. So $L = \\begin{bmatrix}2&0\\\\1&\\sqrt{2}\\end{bmatrix}$ and $LL^\\top = \\begin{bmatrix}4&2\\\\2&3\\end{bmatrix} = A$. ✓',
    },
  ],

  challenges: [
    {
      id: 'ch-la7-002-1',
      title: 'Cholesky test for positive definiteness',
      difficulty: 'easy',
      prompt: 'Without computing eigenvalues, determine if $A = \\begin{bmatrix}1&2\\\\2&3\\end{bmatrix}$ is positive definite by attempting Cholesky.',
      hint: 'Try to compute $l_{11}$ and $l_{22}$.',
      solution: '$l_{11} = \\sqrt{1} = 1$. $l_{21} = 2/1 = 2$. $l_{22} = \\sqrt{3 - 4} = \\sqrt{-1}$. Imaginary! Cholesky fails → $A$ is not positive definite. (Indeed $\\det A = 3 - 4 = -1 < 0$, eigenvalues are negative and positive.)',
    },
  ],

  mentalModel: [
    'Cholesky = square root of a matrix (for SPD matrices).',
    '$A = LL^\\top$ — like factoring $9 = 3 \\times 3$ but for matrices.',
    'Costs half as much as LU — exploits symmetry and positive definiteness.',
    'Fails iff matrix is not SPD — so attempting Cholesky IS a positive-definiteness test.',
    'Critical for: covariance matrix computations, Gaussian sampling, finite element solvers.',
  ],

  checkpoints: [
    { id: 'cp-la7-002-1', question: 'What two conditions must $A$ satisfy for Cholesky to exist?', answer: 'Symmetric ($A = A^\\top$) and positive definite ($\\mathbf{x}^\\top A\\mathbf{x} > 0$ for all $\\mathbf{x} \\neq 0$).' },
    { id: 'cp-la7-002-2', question: 'How many flops does Cholesky require vs LU (approximately)?', answer: '$n^3/3$ for Cholesky, $2n^3/3$ for LU — Cholesky is about twice as fast.' },
    { id: 'cp-la7-002-3', question: 'How do you sample $\\mathbf{z} \\sim \\mathcal{N}(\\boldsymbol{\\mu}, \\Sigma)$ using Cholesky?', answer: 'Compute $L = \\text{chol}(\\Sigma)$, sample $\\mathbf{w} \\sim \\mathcal{N}(0, I)$, return $\\mathbf{z} = \\boldsymbol{\\mu} + L\\mathbf{w}$.' },
  ],

  assessment: 'Compute the Cholesky factorization of $A = \\begin{bmatrix}9&3&0\\\\3&5&1\\\\0&1&2\\end{bmatrix}$ by hand. Verify $LL^\\top = A$.',

  quiz: [
    { id: 'q-la7-002-1', question: 'Cholesky decomposition applies to matrices that are:', options: ['Square and invertible', 'Symmetric positive definite', 'Symmetric with positive diagonal', 'Diagonal'], answer: 'Symmetric positive definite' },
    { id: 'q-la7-002-2', question: 'The log-determinant of $A$ can be computed from Cholesky as:', options: ['$\\sum_{i} l_{ii}$', '$2 \\sum_{i} \\log l_{ii}$', '$\\prod_{i} l_{ii}^2$', '$n \\log l_{11}$'], answer: '$2 \\sum_{i} \\log l_{ii}$' },
    { id: 'q-la7-002-3', question: 'If Cholesky fails (encounters a negative pivot), it means:', options: ['The matrix is singular', 'The matrix is not symmetric', 'The matrix is not positive definite', 'The matrix has no inverse'], answer: 'The matrix is not positive definite' },
  ],
};
