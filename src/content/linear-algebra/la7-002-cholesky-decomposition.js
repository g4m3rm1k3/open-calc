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
      `**Numbers first.** Take $A = \\begin{bmatrix}4&2\\\\2&3\\end{bmatrix}$. Step through the Cholesky algorithm: $l_{11} = \\sqrt{4} = 2$. Then $l_{21} = 2/l_{11} = 2/2 = 1$. Finally $l_{22} = \\sqrt{3 - l_{21}^2} = \\sqrt{3-1} = \\sqrt{2}$. So $L = \\begin{bmatrix}2&0\\\\1&\\sqrt{2}\\end{bmatrix}$. Verify: $LL^\\top = \\begin{bmatrix}2&0\\\\1&\\sqrt{2}\\end{bmatrix}\\begin{bmatrix}2&1\\\\0&\\sqrt{2}\\end{bmatrix} = \\begin{bmatrix}4&2\\\\2&3\\end{bmatrix} = A$ ✓. No eigenvalue computation needed — just arithmetic on the entries.`,
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
      {
        type: 'sequencing',
        title: 'Prediction',
        body: 'Before working Example 2: given $A = \\begin{bmatrix}9&3\\\\3&2\\end{bmatrix}$, predict $l_{11}$ (the first diagonal entry of the Cholesky factor $L$). Write your answer, then work through the algorithm to check.',
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
y = L \\ b
% Back substitution: L'*x = y
x = L' \\ y
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
      steps: [
        {
          expression: 'l_{11} = \\sqrt{a_{11}} = \\sqrt{4} = 2',
          annotation: 'First diagonal entry: square root of the top-left entry.',
          strategyTitle: 'Entry (1,1)',
        },
        {
          expression: 'l_{21} = a_{21}/l_{11} = 2/2 = 1',
          annotation: 'First column below the diagonal: divide each entry by $l_{11}$.',
          strategyTitle: 'Entry (2,1)',
        },
        {
          expression: 'l_{22} = \\sqrt{a_{22} - l_{21}^2} = \\sqrt{3 - 1} = \\sqrt{2}',
          annotation: 'Second diagonal: subtract the squared contribution of the first column.',
          strategyTitle: 'Entry (2,2)',
        },
        {
          expression: 'L = \\begin{bmatrix}2&0\\\\1&\\sqrt{2}\\end{bmatrix}, \\quad LL^\\top = \\begin{bmatrix}2&0\\\\1&\\sqrt{2}\\end{bmatrix}\\begin{bmatrix}2&1\\\\0&\\sqrt{2}\\end{bmatrix} = \\begin{bmatrix}4&2\\\\2&3\\end{bmatrix} = A \\checkmark',
          annotation: 'Verify by multiplying $L L^\\top$.',
          strategyTitle: 'Verify',
        },
      ],
    },
    {
      id: 'ex-la7-002-2',
      title: 'Testing SPD and computing Cholesky for a 2×2 matrix',
      problem: 'Determine whether $A = \\begin{bmatrix}9&3\\\\3&2\\end{bmatrix}$ is symmetric positive definite. If so, compute its Cholesky factorization $A = LL^\\top$.',
      steps: [
        {
          expression: 'A^\\top = \\begin{bmatrix}9&3\\\\3&2\\end{bmatrix} = A \\checkmark',
          annotation: 'Symmetry check: $a_{12} = a_{21} = 3$. Symmetric.',
          strategyTitle: 'Step 1: Check symmetry',
        },
        {
          expression: '\\det(A_{1\\times 1}) = 9 > 0, \\quad \\det(A) = 9 \\cdot 2 - 3 \\cdot 3 = 18 - 9 = 9 > 0',
          annotation: "Sylvester's criterion: all leading principal minors positive means SPD. Both are positive, so $A$ is SPD.",
          strategyTitle: 'Step 2: Sylvester\'s criterion',
        },
        {
          expression: 'l_{11} = \\sqrt{9} = 3',
          annotation: 'First diagonal entry of $L$: square root of the (1,1) entry.',
          strategyTitle: 'Step 3: Cholesky entry (1,1)',
        },
        {
          expression: 'l_{21} = a_{21}/l_{11} = 3/3 = 1',
          annotation: 'Subdiagonal entry: divide $a_{21}$ by $l_{11}$.',
          strategyTitle: 'Step 4: Cholesky entry (2,1)',
        },
        {
          expression: 'l_{22} = \\sqrt{a_{22} - l_{21}^2} = \\sqrt{2 - 1^2} = \\sqrt{1} = 1',
          annotation: 'Second diagonal: subtract the squared subdiagonal entry from $a_{22}$.',
          strategyTitle: 'Step 5: Cholesky entry (2,2)',
        },
        {
          expression: 'L = \\begin{bmatrix}3&0\\\\1&1\\end{bmatrix}, \\quad LL^\\top = \\begin{bmatrix}3&0\\\\1&1\\end{bmatrix}\\begin{bmatrix}3&1\\\\0&1\\end{bmatrix} = \\begin{bmatrix}9&3\\\\3&2\\end{bmatrix} = A \\checkmark',
          annotation: 'Verify multiplication. Both diagonals of $L$ are positive, confirming $A$ is SPD.',
          strategyTitle: 'Step 6: Assemble and verify',
        },
      ],
    },
    {
      id: 'ex-la7-002-3',
      title: 'Solving Ax = b using Cholesky (two-step triangular solve)',
      problem: 'Solve $A\\mathbf{x} = \\mathbf{b}$ where $A = \\begin{bmatrix}4&2\\\\2&3\\end{bmatrix}$ and $\\mathbf{b} = \\begin{bmatrix}8\\\\9\\end{bmatrix}$ using the Cholesky factorization $A = LL^\\top$ from Example 1.',
      steps: [
        {
          expression: 'L = \\begin{bmatrix}2&0\\\\1&\\sqrt{2}\\end{bmatrix} \\quad (\\text{from Example 1})',
          annotation: 'We already have $L$. The strategy: solve $L\\mathbf{y} = \\mathbf{b}$ (forward substitution), then solve $L^\\top\\mathbf{x} = \\mathbf{y}$ (back substitution).',
          strategyTitle: 'Setup: two-step solve',
        },
        {
          expression: 'L\\mathbf{y} = \\mathbf{b}: \\quad \\begin{bmatrix}2&0\\\\1&\\sqrt{2}\\end{bmatrix}\\begin{bmatrix}y_1\\\\y_2\\end{bmatrix} = \\begin{bmatrix}8\\\\9\\end{bmatrix}',
          annotation: 'Forward substitution: solve the lower triangular system. Row 1: $2y_1 = 8 \\Rightarrow y_1 = 4$. Row 2: $y_1 + \\sqrt{2}y_2 = 9 \\Rightarrow \\sqrt{2}y_2 = 5 \\Rightarrow y_2 = 5/\\sqrt{2}$.',
          strategyTitle: 'Step 1: Forward substitution for $\\mathbf{y}$',
        },
        {
          expression: '\\mathbf{y} = \\begin{bmatrix}4\\\\5/\\sqrt{2}\\end{bmatrix}',
          annotation: 'Intermediate result. Now solve $L^\\top\\mathbf{x} = \\mathbf{y}$.',
          strategyTitle: 'Intermediate result',
        },
        {
          expression: 'L^\\top\\mathbf{x} = \\mathbf{y}: \\quad \\begin{bmatrix}2&1\\\\0&\\sqrt{2}\\end{bmatrix}\\begin{bmatrix}x_1\\\\x_2\\end{bmatrix} = \\begin{bmatrix}4\\\\5/\\sqrt{2}\\end{bmatrix}',
          annotation: 'Back substitution: solve the upper triangular system. Row 2: $\\sqrt{2}x_2 = 5/\\sqrt{2} \\Rightarrow x_2 = 5/2$. Row 1: $2x_1 + x_2 = 4 \\Rightarrow 2x_1 = 4 - 5/2 = 3/2 \\Rightarrow x_1 = 3/4$.',
          strategyTitle: 'Step 2: Back substitution for $\\mathbf{x}$',
        },
        {
          expression: '\\mathbf{x} = \\begin{bmatrix}3/4\\\\5/2\\end{bmatrix}',
          annotation: 'Verify: $A\\mathbf{x} = \\begin{bmatrix}4&2\\\\2&3\\end{bmatrix}\\begin{bmatrix}3/4\\\\5/2\\end{bmatrix} = \\begin{bmatrix}3+5\\\\3/2+15/2\\end{bmatrix} = \\begin{bmatrix}8\\\\9\\end{bmatrix} = \\mathbf{b}$ ✓',
          strategyTitle: 'Solution and verification',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la7-002-1',
      title: 'Cholesky as a PD test',
      difficulty: 'easy',
      problem: 'Without computing eigenvalues, determine if $A = \\begin{bmatrix}1&2\\\\2&3\\end{bmatrix}$ is positive definite by attempting Cholesky.',
      hint: 'Try to compute $l_{11}$ and $l_{22}$. If you encounter a negative number under a square root, Cholesky fails.',
      walkthrough: [
        '**Step 1:** $l_{11} = \\sqrt{1} = 1$.',
        '**Step 2:** $l_{21} = a_{21}/l_{11} = 2/1 = 2$.',
        '**Step 3:** $l_{22} = \\sqrt{a_{22} - l_{21}^2} = \\sqrt{3 - 4} = \\sqrt{-1}$ — imaginary!',
        '**Conclusion:** Cholesky fails → $A$ is NOT positive definite. Verification: $\\det(A) = 3-4 = -1 < 0$ confirms indefiniteness (mixed eigenvalue signs).',
        "**Key insight:** Attempting Cholesky is equivalent to Sylvester's criterion — the pivots in Cholesky are exactly the leading principal minors divided by the previous pivot. A negative pivot means a negative leading minor, which means not PD.",
      ],
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
    { id: 'cp-la7-002-1', label: 'Read intuition section', type: 'read' },
    { id: 'cp-la7-002-2', label: 'Read math section', type: 'read' },
    { id: 'cp-la7-002-3', label: 'Read rigor section', type: 'read' },
    { id: 'cp-la7-002-4', label: 'Run Cholesky factorization and verify lab', type: 'lab' },
    { id: 'cp-la7-002-5', label: 'Run Cholesky sampling correlated normals lab', type: 'lab' },
    { id: 'cp-la7-002-6', label: 'Work example 1: Cholesky of 2×2 matrix by hand', type: 'example' },
    { id: 'cp-la7-002-7', label: 'Work example 2: test SPD and compute Cholesky', type: 'example' },
    { id: 'cp-la7-002-8', label: 'Solve challenge: Cholesky as positive-definiteness test', type: 'challenge' },
  ],

  assessment: 'Compute the Cholesky factorization of $A = \\begin{bmatrix}9&3&0\\\\3&5&1\\\\0&1&2\\end{bmatrix}$ by hand. Verify $LL^\\top = A$.',

  quiz: [
    {
      id: 'q-la7-002-1',
      type: 'choice',
      text: 'Cholesky decomposition $A = LL^\\top$ applies to matrices that are:',
      options: ['Square and invertible', 'Symmetric positive definite', 'Symmetric with positive diagonal', 'Diagonal'],
      answer: 'Symmetric positive definite',
      hints: ['Having a positive diagonal is necessary but not sufficient for SPD. You also need all off-diagonal structure to be compatible. The correct condition is $\\mathbf{x}^\\top A\\mathbf{x} > 0$ for all nonzero $\\mathbf{x}$, which implies symmetry and positive eigenvalues — not just a positive diagonal.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-002-2',
      type: 'choice',
      text: 'The log-determinant of $A$ can be computed from Cholesky as:',
      options: ['$\\sum_{i} l_{ii}$', '$2 \\sum_{i} \\log l_{ii}$', '$\\prod_{i} l_{ii}^2$', '$n \\log l_{11}$'],
      answer: '$2 \\sum_{i} \\log l_{ii}$',
      hints: ['$\\det A = \\det(LL^\\top) = (\\det L)^2 = (\\prod_i l_{ii})^2$. Taking logs: $\\log \\det A = 2 \\sum_i \\log l_{ii}$. This avoids overflow/underflow from multiplying many numbers together.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la7-002-3',
      type: 'choice',
      text: 'If Cholesky fails (encounters a negative value under a square root), it means:',
      options: ['The matrix is singular', 'The matrix is not symmetric', 'The matrix is not positive definite', 'The matrix has no inverse'],
      answer: 'The matrix is not positive definite',
      hints: ['Cholesky succeeds iff the matrix is SPD. A negative value under the square root means a leading principal minor is non-positive — which means the matrix is either indefinite or negative semi-definite. A singular but positive semi-definite matrix makes the diagonal hit zero (not negative).'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-002-4',
      type: 'choice',
      text: 'Cholesky requires approximately how many flops compared to LU for the same $n \\times n$ SPD matrix?',
      options: ['The same: $\\frac{2}{3}n^3$', 'Twice as many: $\\frac{4}{3}n^3$', 'Half as many: $\\frac{1}{3}n^3$', 'One quarter: $\\frac{1}{6}n^3$'],
      answer: 'Half as many: $\\frac{1}{3}n^3$',
      hints: ['Cholesky exploits symmetry: you only compute the lower triangle, roughly halving both computation and storage. LU needs $2n^3/3$ flops; Cholesky needs $n^3/3$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-002-5',
      type: 'choice',
      text: 'To solve $A\\mathbf{x} = \\mathbf{b}$ using Cholesky $A = LL^\\top$, you perform:',
      options: [
        'One back substitution: $L^\\top \\mathbf{x} = \\mathbf{b}$',
        'Forward substitution $L\\mathbf{y} = \\mathbf{b}$, then back substitution $L^\\top\\mathbf{x} = \\mathbf{y}$',
        'Back substitution $L^\\top\\mathbf{y} = \\mathbf{b}$, then forward substitution $L\\mathbf{x} = \\mathbf{y}$',
        'Directly invert $L$ then compute $L^{-\\top}L^{-1}\\mathbf{b}$',
      ],
      answer: 'Forward substitution $L\\mathbf{y} = \\mathbf{b}$, then back substitution $L^\\top\\mathbf{x} = \\mathbf{y}$',
      hints: ['Write $A\\mathbf{x} = LL^\\top\\mathbf{x} = \\mathbf{b}$. Let $\\mathbf{y} = L^\\top\\mathbf{x}$. Then $L\\mathbf{y} = \\mathbf{b}$ (forward sub on lower triangular $L$), and $L^\\top\\mathbf{x} = \\mathbf{y}$ (back sub on upper triangular $L^\\top$).'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-002-6',
      type: 'choice',
      text: 'To sample $\\mathbf{z} \\sim \\mathcal{N}(\\boldsymbol{\\mu}, \\Sigma)$ using Cholesky, after computing $\\Sigma = LL^\\top$ and sampling $\\mathbf{w} \\sim \\mathcal{N}(0, I)$, you set:',
      options: ['$\\mathbf{z} = \\boldsymbol{\\mu} + L^{-1}\\mathbf{w}$', '$\\mathbf{z} = \\boldsymbol{\\mu} + L^\\top\\mathbf{w}$', '$\\mathbf{z} = \\boldsymbol{\\mu} + L\\mathbf{w}$', '$\\mathbf{z} = L\\boldsymbol{\\mu} + \\mathbf{w}$'],
      answer: '$\\mathbf{z} = \\boldsymbol{\\mu} + L\\mathbf{w}$',
      hints: ['Check covariance: $\\text{Cov}(L\\mathbf{w}) = L\\,\\text{Cov}(\\mathbf{w})\\,L^\\top = LIL^\\top = LL^\\top = \\Sigma$. The mean of $\\boldsymbol{\\mu} + L\\mathbf{w}$ is $\\boldsymbol{\\mu}$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-002-7',
      type: 'choice',
      text: 'Given $A = \\begin{bmatrix}4&2\\\\2&3\\end{bmatrix}$ with Cholesky factor $L = \\begin{bmatrix}2&0\\\\1&\\sqrt{2}\\end{bmatrix}$, what is $l_{22}$?',
      options: ['$\\sqrt{3}$', '$1$', '$\\sqrt{2}$', '$2$'],
      answer: '$\\sqrt{2}$',
      hints: ['$l_{22} = \\sqrt{a_{22} - l_{21}^2} = \\sqrt{3 - 1^2} = \\sqrt{2}$. This is the Schur complement under the square root.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-002-8',
      type: 'choice',
      text: 'Which of the following matrices CANNOT have a Cholesky factorization?',
      options: [
        '$\\begin{bmatrix}4&0\\\\0&9\\end{bmatrix}$',
        '$\\begin{bmatrix}1&2\\\\2&3\\end{bmatrix}$',
        '$\\begin{bmatrix}9&3\\\\3&2\\end{bmatrix}$',
        '$\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$',
      ],
      answer: '$\\begin{bmatrix}1&2\\\\2&3\\end{bmatrix}$',
      hints: ['Check each: $\\begin{bmatrix}1&2\\\\2&3\\end{bmatrix}$ has $\\det = 3-4 = -1 < 0$, so it is indefinite — Cholesky fails. The others: $\\begin{bmatrix}4&0\\\\0&9\\end{bmatrix}$ is diagonal with positive entries (SPD). $\\begin{bmatrix}9&3\\\\3&2\\end{bmatrix}$ has $\\det = 18-9 = 9 > 0$ (SPD). $\\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}$ has $\\det = 4-1 = 3 > 0$ (SPD).'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la7-002-9',
      type: 'choice',
      text: 'Incomplete Cholesky is used primarily as:',
      options: ['An exact solver for sparse SPD systems', 'A preconditioner for iterative solvers like conjugate gradient', 'A way to handle non-symmetric matrices', 'A replacement for LU when the matrix is ill-conditioned'],
      answer: 'A preconditioner for iterative solvers like conjugate gradient',
      hints: ['Incomplete Cholesky drops fill-in entries to keep sparsity, giving an approximation $A \\approx LL^\\top$ (not exact). This approximate factor is cheap to apply and reduces the condition number of the preconditioned system, accelerating conjugate gradient convergence.'],
      reviewSection: 'rigor',
    },
    {
      id: 'q-la7-002-10',
      type: 'choice',
      text: 'Blocked Cholesky (LAPACK DPOTRF) improves performance over column-by-column Cholesky primarily because:',
      options: [
        'It requires fewer total flops',
        'It uses BLAS-3 (matrix-matrix) operations that are cache-efficient',
        'It avoids computing the square root',
        'It can handle non-SPD matrices',
      ],
      answer: 'It uses BLAS-3 (matrix-matrix) operations that are cache-efficient',
      hints: ['The total flop count is the same. The gain comes from memory access patterns: BLAS-3 (dense matrix multiplication on blocks) has much better cache reuse than column-by-column updates (BLAS-2). Modern CPUs achieve near-peak flop rates only with BLAS-3 operations.'],
      reviewSection: 'rigor',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Compute the Cholesky factorization of any 3×3 SPD matrix by hand, and use it to solve Ax = b via two triangular solves.',
    explainVerbally: 'Explain why attempting Cholesky is a valid positive-definiteness test, and describe what a negative pivot means geometrically.',
    detectIncorrectApplication: 'Recognize when Cholesky is applied to a matrix that is not SPD (e.g., symmetric but indefinite) and predict which step will fail.',
    transferToUnfamiliar: 'Given a new SPD structure (e.g., a block diagonal SPD matrix), describe how to apply Cholesky block-by-block.',
  },

  misconceptions: [
    {
      falseBelief: 'A matrix with all positive entries is positive definite.',
      whyStudentsThinkIt: 'The word "positive" in "positive definite" makes students think it just means the entries are positive. But positive definiteness is about the quadratic form $\\mathbf{x}^\\top A\\mathbf{x} > 0$, not about the entries.',
      correctionExample: '$A = \\begin{bmatrix}1&2\\\\2&3\\end{bmatrix}$ has all positive entries but $\\det A = 3-4 = -1 < 0$ — it is indefinite. Cholesky fails at $l_{22} = \\sqrt{3-4}$.',
      contrastCase: '$A = \\begin{bmatrix}4&2\\\\2&3\\end{bmatrix}$ has $\\det A = 12-4 = 8 > 0$ — positive definite. $\\begin{bmatrix}1&-10\\\\-10&200\\end{bmatrix}$ has negative off-diagonal entries but is SPD ($\\det = 200-100 = 100 > 0$).',
    },
    {
      falseBelief: 'Cholesky gives $A = LL^\\top$ where $L = L^\\top$ (i.e., $L$ is also upper triangular).',
      whyStudentsThinkIt: 'Students mix up MATLAB\'s convention. MATLAB\'s `chol(A)` returns $R$ (upper triangular) such that $A = R^\\top R$. Writing $L = R^\\top$ gives lower triangular $L$ with $A = LL^\\top$. The two forms are equivalent but the convention differs.',
      correctionExample: 'MATLAB: `R = chol(A)` gives upper triangular $R$ with $A = R^\\top R$. To get lower triangular: `L = chol(A, \'lower\')` gives $A = LL^\\top$.',
      contrastCase: 'Both $A = LL^\\top$ (lower Cholesky) and $A = R^\\top R$ (upper Cholesky) are valid. The lower form is more common in textbooks; MATLAB defaults to upper.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You need to compute the likelihood of 10,000 observations from a multivariate Gaussian $\\mathcal{N}(\\boldsymbol{\\mu}, \\Sigma)$ where $\\Sigma$ is $50 \\times 50$.',
      competingTechniques: 'Direct matrix inverse $\\Sigma^{-1}$; LU factorization; Cholesky factorization.',
      whyThisTechniqueWins: 'Cholesky is preferred because: (1) it computes $\\log \\det \\Sigma = 2\\sum_i \\log l_{ii}$ stably; (2) it solves $\\Sigma\\mathbf{y} = \\mathbf{x} - \\boldsymbol{\\mu}$ via two triangular solves, giving $(\\mathbf{x}-\\boldsymbol{\\mu})^\\top \\Sigma^{-1}(\\mathbf{x}-\\boldsymbol{\\mu}) = \\|\\mathbf{y}\\|^2$; (3) it is twice as fast as LU and avoids forming $\\Sigma^{-1}$ explicitly.',
    },
    {
      situation: 'In an iterative optimization algorithm, you need to solve a large sparse SPD linear system at each step.',
      competingTechniques: 'Direct Cholesky; conjugate gradient (CG) without preconditioner; CG with incomplete Cholesky preconditioner.',
      whyThisTechniqueWins: 'For large sparse 3D problems, direct Cholesky fills in too much ($O(n^2)$ storage). Unpreconditioned CG converges slowly for ill-conditioned systems. Incomplete Cholesky as a preconditioner reduces the condition number, making preconditioned CG converge in far fewer iterations — the best of both worlds.',
    },
  ],

  debugging: [
    {
      commonError: 'Using the wrong formula for the subdiagonal entries: computing $l_{ij} = a_{ij}/l_{ii}$ instead of $l_{ij} = (a_{ij} - \\sum_{k=1}^{j-1} l_{ik}l_{jk}) / l_{jj}$.',
      symptom: '$LL^\\top \\neq A$ — the off-diagonal entries of the product do not match $A$.',
      whyItHappened: 'For the first column, the sum is empty and the simple formula is correct. Students apply the first-column formula to all columns, forgetting the subtraction of previous contributions.',
      repairStrategy: 'For column $j > 1$, always compute the Schur complement correction $a_{ij} - \\sum_{k=1}^{j-1} l_{ik}l_{jk}$ before dividing by $l_{jj}$. After each column, spot-check one entry of $LL^\\top$.',
    },
    {
      commonError: 'Attempting Cholesky on a symmetric but indefinite matrix without checking the pivots.',
      symptom: 'Getting a complex (imaginary) number for a diagonal entry $l_{jj} = \\sqrt{\\text{negative}}$.',
      whyItHappened: 'The student did not verify positive definiteness before proceeding. This typically happens when a matrix is built by hand or as a difference of SPD matrices.',
      repairStrategy: "Before computing Cholesky, verify all leading principal minors are positive (Sylvester's criterion), or check that all eigenvalues are positive. If Cholesky fails in code, catch the error and switch to LU or add a regularization term $A + \\alpha I$.",
    },
  ],
};
